"""Proyección por frame de los anclajes del HUD → film-anchors.json (contrato en el plan de la fase 1)."""
from __future__ import annotations

import json
import math
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

from plan.site import HERO_DOCK, Y_DOCK, dock_x

# (objeto, punto en coordenadas locales)
ANCHORS = {
    "tractor": ("HERO_piv", (0.0, -3.65, 4.0)),    # techo de la cabina
    "driver": ("HERO_piv", (-1.25, -4.4, 3.0)),    # puerta del conductor
    "trailer": ("HERO", (0.0, -8.0, 4.1)),         # centro del techo de la caja
}


PHASE2_ANCHORS = {
    "pallet": ("pallet_A", (0.0, 0.0, 1.4)),     # tapa de la carga
    "picker": ("PICKER", (0.0, 0.0, 1.85)),       # casco
}


def status_at(i: int, cues: dict) -> str:
    """i = índice 0-based del frame en route.json."""
    if i < cues["barrierUp"]:
        return "gate"
    if i < cues["reverseStart"]:
        return "yard"
    if i < cues["docked"]:
        return "maneuver"
    if "phase2Start" in cues:
        if i >= cues["relevo"]:
            return "relevo"
        if cues["reachStart"] <= i <= cues["slotDone"]:
            return "storing"
        if cues["unloadStart"] <= i < cues["scanA"]:
            return "unloading"
    return "docked"


def export_anchors(scene, cam, route: dict, out: Path, size: tuple[int, int]) -> None:
    scene.render.resolution_x, scene.render.resolution_y = size
    cues = route["cues"]
    dock = (dock_x(HERO_DOCK), Y_DOCK)
    rows = []
    for i, f in enumerate(route["frames"]):
        scene.frame_set(i + 1)
        row: dict = {}
        for key, (name, local) in ANCHORS.items():
            v = world_to_camera_view(scene, cam, bpy.data.objects[name].matrix_world @ Vector(local))
            row[key] = [round(v.x, 5), round(1.0 - v.y, 5)]
        if "phase2Start" in cues and i >= cues["scanA"]:
            for key, (name, local) in PHASE2_ANCHORS.items():
                v = world_to_camera_view(scene, cam, bpy.data.objects[name].matrix_world @ Vector(local))
                row[key] = [round(v.x, 5), round(1.0 - v.y, 5)]
        row["dist"] = round(math.hypot(f["R"][0] - dock[0], f["R"][1] - dock[1]), 3)
        row["art"] = round(abs(math.degrees(f["art"])), 2)
        row["status"] = status_at(i, cues)
        rows.append(row)
    data = {
        "fps": route["fps"], "width": size[0], "height": size[1], "frames": rows,
        "cues": {"truckCard": cues["scanEnd"] - 8, "cargoCard": cues["scanEnd"] + 24, "docked": cues["docked"],
                 **({"palletCard": cues["scanA"], "slotDone": cues["slotDone"], "relevo": cues["relevo"]}
                    if "phase2Start" in cues else {})},
    }
    out.mkdir(parents=True, exist_ok=True)
    (out / "film-anchors.json").write_text(json.dumps(data, separators=(",", ":")))
