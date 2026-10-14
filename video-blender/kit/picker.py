"""Picker: personaje Y Bot de Mixamo (si están los FBX) o un maniquí por script.

Clips (route.json, extra del track `picker`): 0 idle, 1 walk, 2 scan, 3 pickup.
- Mixamo: cada FBX aporta una acción; se arman tiras NLA y `pose_picker` anima su peso.
- Maniquí: articulaciones con empties; la pose sale de `plan.picker_pose` (caminata empujando
  el carrito según la distancia recorrida, pick en cuatro tiempos, transiciones suavizadas).
"""
from __future__ import annotations

import os
from pathlib import Path

import bpy

from kit.nla import MIXAMO_YAW_OFFSET, strip_repeat
from kit.primitives import box, cyl, empty
from plan.picker_pose import Smoother, pose_at

CLIPS = ("idle", "walk", "scan", "pickup")
_STATE: dict[str, dict] = {}   # por picker: clip actual, frames dentro del clip y suavizado


def mixamo_dir() -> Path:
    return Path(os.environ.get("MIXAMO_DIR", Path(__file__).resolve().parents[1] / "assets" / "mixamo"))


def _has_mixamo(d: Path) -> bool:
    return all((d / f"{c}.fbx").exists() for c in CLIPS)


def _mannequin(col):
    """Maniquí articulado: cadera → columna → cuello/hombros; piernas con rodilla. Extremidades
    cilíndricas, manos, casco y chaleco: legible en el plano cerrado del picking."""
    root = empty("PICKER", col)
    pelvis = empty("pk_pelvis", col, (0, 0, 0.95), parent=root)
    box("pk_hips", (0.2, 0.34, 0.16), (0, 0, 0), col, pelvis, bev=0.06, seg=3)
    spine = empty("pk_spine", col, (0, 0, 0.0), parent=pelvis)
    box("pk_torso", (0.22, 0.36, 0.5), (0, 0, 0.32), col, spine, bev=0.09, seg=3)
    box("pk_vest", (0.25, 0.39, 0.3), (0, 0, 0.4), col, spine, bev=0.07, seg=3)   # chaleco de alta visibilidad
    neck = empty("pk_neck", col, (0, 0, 0.62), parent=spine)
    cyl("pk_neckc", 0.05, 0.1, (0, 0, 0.05), col, neck, seg=12)
    cyl("pk_head", 0.105, 0.22, (0.01, 0, 0.2), col, neck, seg=20, bev=0.09)
    cyl("pk_helmet", 0.125, 0.07, (0.01, 0, 0.3), col, neck, seg=20, bev=0.03)
    box("pk_visor", (0.08, 0.2, 0.02), (0.11, 0, 0.27), col, neck, bev=0.01)
    for side, s in (("L", 1), ("R", -1)):
        hip = empty(f"pk_hip{side}", col, (0, s * 0.1, -0.05), parent=pelvis)
        cyl("pk_thigh", 0.075, 0.44, (0, 0, -0.22), col, hip, seg=12, bev=0.03)
        knee = empty(f"pk_knee{side}", col, (0, 0, -0.44), parent=hip)
        cyl("pk_shin", 0.06, 0.42, (0, 0, -0.21), col, knee, seg=12, bev=0.025)
        box("pk_boot", (0.27, 0.12, 0.09), (0.06, 0, -0.45), col, knee, bev=0.035, seg=2)
        sh = empty(f"pk_shoulder{side}", col, (0, s * 0.22, 0.56), parent=spine)
        cyl("pk_delt", 0.065, 0.1, (0, 0, -0.02), col, sh, seg=12, bev=0.04)
        cyl("pk_upperarm", 0.048, 0.3, (0, 0, -0.15), col, sh, seg=12, bev=0.02)
        el = empty(f"pk_elbow{side}", col, (0, 0, -0.3), parent=sh)
        cyl("pk_forearm", 0.042, 0.26, (0, 0, -0.13), col, el, seg=12, bev=0.02)
        box("pk_hand", (0.07, 0.05, 0.09), (0, 0, -0.29), col, el, bev=0.02)
        if side == "R":  # pistola RF en la mano derecha
            box("pk_rfgun", (0.14, 0.05, 0.08), (0.06, 0, -0.3), col, el, bev=0.01)
    return root


def _mixamo(col, d: Path, total_frames: int):
    actions = {}
    arm = None
    for clip in CLIPS:
        before = set(bpy.data.objects)
        bpy.ops.import_scene.fbx(filepath=str(d / f"{clip}.fbx"))
        new = [o for o in bpy.data.objects if o not in before]
        a = next(o for o in new if o.type == "ARMATURE")
        actions[clip] = a.animation_data.action
        if arm is None:
            arm = a
            for o in new:
                for c in list(o.users_collection):
                    c.objects.unlink(o)
                col.objects.link(o)
        else:  # solo nos quedamos con la acción
            for o in new:
                bpy.data.objects.remove(o, do_unlink=True)
    root = empty("PICKER", col)
    arm.parent = root
    arm.rotation_euler.z += MIXAMO_YAW_OFFSET   # frente +X, como el maniquí y route.json
    arm.animation_data.action = None
    for clip, act in actions.items():
        tr = arm.animation_data.nla_tracks.new()
        tr.name = clip
        strip = tr.strips.new(clip, 1, act)
        start, end = act.frame_range
        strip.repeat = strip_repeat(end - start, total_frames)   # cicla en toda la película
        strip.extrapolation = "HOLD_FORWARD"
        strip.use_animated_influence = True
        strip.blend_type = "REPLACE"
    root["mixamo"] = True
    return root


def picker(col, total_frames: int = 1000):
    """Devuelve (raíz PICKER, 'mixamo' | 'mannequin')."""
    d = mixamo_dir()
    if _has_mixamo(d):
        return _mixamo(col, d, total_frames), "mixamo"
    return _mannequin(col), "mannequin"


def pose_picker(root, clip: int, frame: int, walked: float) -> None:
    """Pose del picker en `frame`. `walked` = metros recorridos (fase de la caminata)."""
    if root.get("mixamo"):
        arm = next(c for c in root.children if c.type == "ARMATURE")
        for tr in arm.animation_data.nla_tracks:
            st = tr.strips[0]
            st.influence = 1.0 if CLIPS.index(tr.name) == clip else 0.0
            st.keyframe_insert("influence", frame=frame)
        return
    st = _STATE.setdefault(root.name, {"clip": None, "k": 0, "smooth": Smoother()})
    st["k"] = st["k"] + 1 if clip == st["clip"] else 0
    st["clip"] = clip
    p = st["smooth"](pose_at(clip, st["k"], walked, frame))
    o = bpy.data.objects
    o["pk_spine"].rotation_euler = (0, p["spine"], 0)
    o["pk_neck"].rotation_euler = (0, p["neck"], 0)
    for side in ("L", "R"):
        for j in ("hip", "knee", "shoulder", "elbow"):
            o[f"pk_{j}{side}"].rotation_euler = (0, p[f"{j}{side}"], 0)
    o["pk_pelvis"].location.z = p["pelvis"]
    for n in ("pk_spine", "pk_neck") + tuple(f"pk_{j}{s}" for j in ("hip", "knee", "shoulder", "elbow") for s in "LR"):
        o[n].keyframe_insert("rotation_euler", frame=frame)
    o["pk_pelvis"].keyframe_insert("location", frame=frame)
