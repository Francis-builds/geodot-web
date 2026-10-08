"""Punto de entrada de Blender para el hero maqueta.

blender -b --factory-startup -P scene/hero.py -- --mode check|technical|photo|anchors
        --route out/route.json --out out/<dir> [--res 1920x1080] [--step N] [--frames A-B]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import bpy  # noqa: E402

from kit.materials import tech_materials  # noqa: E402
from kit.primitives import set_default_material  # noqa: E402
from kit.site_build import build_site  # noqa: E402
from kit.trucks import truck  # noqa: E402
from kit.handling import forklift, pallet, reach_truck, scan_flash, slot_highlight  # noqa: E402
from plan.site import PICK_SLOT, RackLayout, slot_center  # noqa: E402
from render.camera import CamKey, iso_camera  # noqa: E402
from render.technical import setup_technical  # noqa: E402
from export.anchors import export_anchors  # noqa: E402
from render.photo import setup_photo  # noqa: E402
from render.frames import remove_empty_frames  # noqa: E402
from plan.kinematics import KP, u  # noqa: E402
from plan.site import GATE, HERO_DOCK, dock_x  # noqa: E402

FONT = str(ROOT / "assets" / "fonts" / "JetBrainsMono-Medium.ttf")
COLLECTIONS = ("LINES", "HERO", "PAINT", "FX", "TEXT")


def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", required=True, choices=("check", "technical", "photo", "anchors"))
    ap.add_argument("--route", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--res", default="1920x1080")
    ap.add_argument("--step", type=int, default=1)
    ap.add_argument("--frames", default=None)
    ap.add_argument("--samples", type=int, default=96)
    return ap.parse_args(argv)


def build(route: dict):
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    scene = bpy.context.scene
    cols = {}
    for n in COLLECTIONS:
        c = bpy.data.collections.new(n)
        scene.collection.children.link(c)
        cols[n] = c
    mats = tech_materials()
    set_default_material(mats["occluder"])
    site = build_site(cols, mats, FONT)
    f0 = route["frames"][0]
    hero = truck(cols["HERO"], "HERO", f0["R"][0], f0["R"][1], yaw=f0["yaw"], art=f0["art"])
    if route.get("tracks"):
        build_phase2(cols, mats, route["tracks"])
    return scene, cols, mats, site, hero


PHASE2_REQUIRED = ("FORKLIFT", "FORKLIFT_forks", "REACH", "REACH_mast", "REACH_forks", "pallet_A",
                   "SLOT_highlight", "SCAN_flash", "DOOR_11")


def build_phase2(cols, mats, tracks: dict) -> None:
    """Actores de la fase 2 en su pose del primer frame (la animación los mueve)."""
    H = cols["HERO"]
    for name, make in (("FORKLIFT", forklift), ("REACH", reach_truck)):
        x, y, _, yaw, _ = tracks[name.lower() if name == "FORKLIFT" else "reach"][0]
        ob = make(H, name)
        ob.location = (x, y, 1.25)
        ob.rotation_euler = (0, 0, yaw)
    x, y, z, yaw, _ = tracks["pallet_A"][0]
    pa = pallet(H, "pallet_A", seed=3)
    pa.location = (x, y, z)
    pa.rotation_euler = (0, 0, yaw)
    hl = slot_highlight(H, slot_center(RackLayout(), PICK_SLOT))
    hl.hide_render = True
    fl = scan_flash(H, mats["teal"])
    fl.hide_render = True


REQUIRED = ("HERO", "HERO_piv", "HERO_piv_steerL", "HERO_piv_steerR", "GATE_barrier", "GATE_booth",
            "ROOF_panel_000", "FACADE_000")


def animate(scene, route: dict, site) -> None:
    """Pose exacta del planificador en cada frame + pluma + corte de techo y fachada."""
    import math
    fr, cues = route["frames"], route["cues"]
    scene.render.fps = route["fps"]
    scene.frame_start, scene.frame_end = 1, len(fr)
    root, piv = bpy.data.objects["HERO"], bpy.data.objects["HERO_piv"]
    wheels = [bpy.data.objects[f"HERO_piv_steer{s}"] for s in "LR"]
    for i, f in enumerate(fr, start=1):  # frame i de Blender = índice i-1 de route.json
        root.location = (f["R"][0], f["R"][1], 0)
        root.rotation_euler = (0, 0, f["yaw"])
        piv.rotation_euler = (0, 0, f["art"])
        root.keyframe_insert("location", frame=i)
        root.keyframe_insert("rotation_euler", frame=i)
        piv.keyframe_insert("rotation_euler", frame=i)
        for w in wheels:
            w.rotation_euler = (0, 0, f["steer"])
            w.keyframe_insert("rotation_euler", frame=i)
    # pluma: sube 85° en 12 frames desde barrierUp
    b = site.barrier
    for fr_i, ang in ((cues["barrierUp"] + 1, 0.0), (cues["barrierUp"] + 13, math.radians(85))):
        b.rotation_euler = (ang, 0, 0)
        b.keyframe_insert("rotation_euler", frame=fr_i)
    # techo y fachada: se levantan 6 m en 12 frames, escalonados de este a oeste, y desaparecen
    panels = sorted(site.roof_panels + site.facade, key=lambda p: -p.location.x)
    t0, t1, dur = cues["roofStart"] + 1, cues["roofEnd"] + 1, 12
    span = max(1, (t1 - dur) - t0)
    for k, p in enumerate(panels):
        start = t0 + round(k * span / max(1, len(panels) - 1))
        z0 = p.location.z
        p.keyframe_insert("location", frame=start)
        p.location.z = z0 + 6.0
        p.keyframe_insert("location", frame=start + dur)
        p.location.z = z0
        for ob in [p, *p.children]:
            ob.hide_render = False
            ob.keyframe_insert("hide_render", frame=start + dur - 1)
            ob.hide_render = True
            ob.keyframe_insert("hide_render", frame=start + dur)
            ob.hide_render = False


def camera_keys(route: dict) -> list[CamKey]:
    """Acceso (escala 56) -> paneo siguiendo al camión (82) -> cierre sobre el andén y el interior (72)."""
    import math
    import numpy as np
    fr, cues = route["frames"], route["cues"]
    gate_target = (GATE.x + 6.0, GATE.y + 8.0)
    keys = [CamKey(1, gate_target, 56.0), CamKey(cues["scanEnd"] + 1, gate_target, 56.0)]
    for i in range(cues["scanEnd"] + 24, cues["reverseStart"], 24):
        f = fr[i - 1]
        # sigue al centro del equipo, corrido hacia el depósito para que el corte quede en cuadro
        mid = np.array(f["R"]) + 0.5 * KP * u(f["yaw"] - math.pi / 2)
        keys.append(CamKey(i, (float(mid[0]), float(mid[1]) + 4.0), 88.0))
    dock_target = (dock_x(HERO_DOCK), -6.0)
    keys.append(CamKey(cues["docked"] + 1, dock_target, 84.0))
    keys.append(CamKey(len(fr), dock_target, 84.0))
    return keys


def parse_res(res: str) -> tuple[int, int]:
    w, h = res.lower().split("x")
    return int(w), int(h)


def main() -> None:
    args = parse_args()
    route = json.loads(args.route.read_text())
    scene, cols, mats, site, hero = build(route)
    if args.mode == "check":
        missing = [n for n in REQUIRED if n not in bpy.data.objects]
        if missing:
            print("CHECK FAIL missing", missing)
            sys.exit(1)
        assert len(site.roof_panels) > 10 and len(site.facade) > 5
        print(f"RACKS {site.racks} PALLETS {site.pallets}")
        if route.get("tracks"):
            miss2 = [n for n in PHASE2_REQUIRED if n not in bpy.data.objects]
            if miss2:
                print("CHECK FAIL phase2 missing", miss2)
                sys.exit(1)
            print("PHASE2 OK")
        print(f"CHECK OK {len(bpy.data.objects)}")
        return
    animate(scene, route, site)
    cam = iso_camera(scene, camera_keys(route))
    if args.mode == "anchors":
        export_anchors(scene, cam, route, args.out, parse_res(args.res))
        print("EXPORTED", args.out / "film-anchors.json")
        return
    if args.mode in ("technical", "photo"):
        if args.mode == "technical":
            setup_technical(scene, cols, parse_res(args.res))
        else:
            setup_photo(scene, cols, mats, parse_res(args.res), samples=args.samples)
        if args.frames:
            a, b = (int(x) for x in args.frames.split("-"))
            scene.frame_start, scene.frame_end = a, b
        scene.frame_step = args.step
        # retomable: si un render se corta, al relanzarlo saltea los frames ya escritos
        scene.render.use_overwrite = False
        scene.render.use_placeholder = True
        args.out.mkdir(parents=True, exist_ok=True)
        removed = remove_empty_frames(args.out)   # placeholders de un render cortado
        if removed:
            print(f"placeholders vacíos borrados: {removed}")
        scene.render.filepath = str(args.out / "f_")
        bpy.ops.render.render(animation=True)
        print("RENDERED", args.out)
        return
    raise SystemExit(f"modo {args.mode} todavía no implementado")


main()
