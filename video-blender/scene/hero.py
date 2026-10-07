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
    return scene, cols, mats, site, hero


REQUIRED = ("HERO", "HERO_piv", "HERO_piv_steerL", "HERO_piv_steerR", "GATE_barrier", "GATE_booth",
            "ROOF_panel_000", "FACADE_000")


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
        print(f"CHECK OK {len(bpy.data.objects)}")
        return
    raise SystemExit(f"modo {args.mode} todavía no implementado")


main()
