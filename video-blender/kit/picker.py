"""Picker: personaje Y Bot de Mixamo (si están los FBX) o un maniquí por script.

Clips (route.json, extra del track `picker`): 0 idle, 1 walk, 2 scan, 3 pickup.
- Mixamo: cada FBX aporta una acción; se arman tiras NLA y `pose_picker` anima su peso.
- Maniquí: articulaciones con empties; `pose_picker` calcula la pose (caminata a partir
  de la distancia recorrida, así los pies no "patinan") y la keyframea.
"""
from __future__ import annotations

import math
import os
from pathlib import Path

import bpy

from kit.primitives import box, cyl, empty

CLIPS = ("idle", "walk", "scan", "pickup")
STRIDE = 1.4          # m por ciclo de caminata


def mixamo_dir() -> Path:
    return Path(os.environ.get("MIXAMO_DIR", Path(__file__).resolve().parents[1] / "assets" / "mixamo"))


def _has_mixamo(d: Path) -> bool:
    return all((d / f"{c}.fbx").exists() for c in CLIPS)


def _mannequin(col):
    root = empty("PICKER", col)
    pelvis = empty("pk_pelvis", col, (0, 0, 0.95), parent=root)
    box("pk_hips", (0.2, 0.34, 0.16), (0, 0, 0), col, pelvis, bev=0.05)
    box("pk_torso", (0.22, 0.38, 0.5), (0, 0, 0.36), col, pelvis, bev=0.08, seg=3)
    box("pk_vest", (0.24, 0.4, 0.3), (0, 0, 0.42), col, pelvis, bev=0.06)          # chaleco de alta visibilidad
    cyl("pk_neck", 0.05, 0.08, (0, 0, 0.66), col, pelvis, seg=12)
    cyl("pk_head", 0.11, 0.24, (0, 0, 0.82), col, pelvis, seg=20, bev=0.08)
    cyl("pk_helmet", 0.125, 0.06, (0, 0, 0.92), col, pelvis, seg=20, bev=0.02)
    for side, s in (("L", 1), ("R", -1)):
        hip = empty(f"pk_hip{side}", col, (0, s * 0.1, -0.05), parent=pelvis)
        box("pk_thigh", (0.13, 0.13, 0.44), (0, 0, -0.22), col, hip, bev=0.04)
        knee = empty(f"pk_knee{side}", col, (0, 0, -0.44), parent=hip)
        box("pk_shin", (0.11, 0.11, 0.44), (0, 0, -0.22), col, knee, bev=0.04)
        box("pk_boot", (0.26, 0.12, 0.08), (0.06, 0, -0.46), col, knee, bev=0.03)
        sh = empty(f"pk_shoulder{side}", col, (0, s * 0.23, 0.56), parent=pelvis)
        box("pk_upperarm", (0.09, 0.09, 0.3), (0, 0, -0.15), col, sh, bev=0.03)
        el = empty(f"pk_elbow{side}", col, (0, 0, -0.3), parent=sh)
        box("pk_forearm", (0.08, 0.08, 0.28), (0, 0, -0.14), col, el, bev=0.03)
        if side == "R":  # pistola RF en la mano derecha
            box("pk_rfgun", (0.16, 0.06, 0.1), (0.06, 0, -0.3), col, el, bev=0.01)
    return root


def _mixamo(col, d: Path):
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
    arm.scale = (0.01, 0.01, 0.01) if max(arm.dimensions) > 50 else arm.scale   # FBX de Mixamo vienen en cm
    arm.animation_data.action = None
    for clip, act in actions.items():
        tr = arm.animation_data.nla_tracks.new()
        tr.name = clip
        strip = tr.strips.new(clip, 1, act)
        strip.extrapolation = "HOLD_FORWARD"
        strip.use_animated_influence = True
        strip.blend_type = "REPLACE"
    root["mixamo"] = True
    return root


def picker(col):
    """Devuelve (raíz PICKER, 'mixamo' | 'mannequin')."""
    d = mixamo_dir()
    if _has_mixamo(d):
        return _mixamo(col, d), "mixamo"
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
    ph = (walked / STRIDE) * math.tau
    swing = math.radians(28) * math.sin(ph) if clip == 1 else 0.0
    o = bpy.data.objects
    for side, s in (("L", 1), ("R", -1)):
        o[f"pk_hip{side}"].rotation_euler = (0, s * swing, 0)
        o[f"pk_knee{side}"].rotation_euler = (0, max(0.0, s * swing) * 1.2, 0)
        arm_swing = -s * swing * 0.8
        if side == "R" and clip == 2:   # escanea: brazo derecho al frente
            o[f"pk_shoulder{side}"].rotation_euler = (0, math.radians(-75), 0)
            o[f"pk_elbow{side}"].rotation_euler = (0, math.radians(-20), 0)
        else:
            o[f"pk_shoulder{side}"].rotation_euler = (0, arm_swing, 0)
            o[f"pk_elbow{side}"].rotation_euler = (0, math.radians(-10), 0)
        for n in (f"pk_hip{side}", f"pk_knee{side}", f"pk_shoulder{side}", f"pk_elbow{side}"):
            o[n].keyframe_insert("rotation_euler", frame=frame)
    o["pk_pelvis"].location.z = 0.95 + (0.02 * abs(math.sin(ph)) if clip == 1 else 0.0)
    o["pk_pelvis"].keyframe_insert("location", frame=frame)
