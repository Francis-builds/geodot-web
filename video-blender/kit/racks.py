"""Racks selectivos con pallets (contenido fijo del interior en fase 1).

Filas espalda con espalda que corren norte-sur, con pasillos hacia la cámara.
Cada fila es UNA malla (estructura) + UNA malla (pallets) para que Freestyle
no procese miles de objetos; en fase 2 los pallets que se mueven son objetos propios.
"""
from __future__ import annotations

import random

import bmesh
import bpy

from kit.primitives import _obj
from plan.site import AISLE, BAY, FLUE, LEVELS, SIDE, TOP, RackLayout  # noqa: F401

def _add_box(bm, size, center):
    ret = bmesh.ops.create_cube(bm, size=1)
    for v in ret["verts"]:
        v.co.x = v.co.x * size[0] + center[0]
        v.co.y = v.co.y * size[1] + center[1]
        v.co.z = v.co.z * size[2] + center[2]


def build_racks(col, mats, layout: RackLayout = RackLayout(), seed: int = 11) -> tuple[int, int]:
    """Devuelve (filas, pallets)."""
    rnd = random.Random(seed)
    n_pallets = 0
    fz = layout.floor_z
    depth = 2 * SIDE + FLUE
    length = layout.bays * BAY
    for r in range(layout.rows):
        cx = layout.x0 + r * layout.row_pitch
        frame, load = bmesh.new(), bmesh.new()
        for b in range(layout.bays + 1):          # bastidores
            y = layout.y0 + b * BAY
            for sx in (-depth / 2, -FLUE / 2, FLUE / 2, depth / 2):
                _add_box(frame, (0.09, 0.09, TOP), (cx + sx, y, fz + TOP / 2))
            for z in (0.4, 2.2, 4.0, 5.8):        # arriostramiento horizontal del bastidor
                for side in (-1, 1):
                    _add_box(frame, (SIDE, 0.05, 0.05), (cx + side * (FLUE / 2 + SIDE / 2), y, fz + z))
        for lv in LEVELS[1:]:                     # largueros (el primer nivel apoya en el piso)
            for sx in (-depth / 2, -FLUE / 2, FLUE / 2, depth / 2):
                _add_box(frame, (0.06, length, 0.14), (cx + sx, layout.y0 + length / 2, fz + lv))
        for b in range(layout.bays):              # pallets: 2 por vano, por lado, por nivel
            for side in (-1, 1):
                px = cx + side * (FLUE / 2 + SIDE / 2)
                for lv in LEVELS:
                    for k in range(2):
                        if rnd.random() > layout.fill or (r, b, side, LEVELS.index(lv), k) in layout.reserved:
                            continue
                        py = layout.y0 + b * BAY + BAY * (0.27 + 0.46 * k)
                        base_z = fz + lv + (0.08 if lv > 0 else 0.0)
                        _add_box(load, (1.0, 1.15, 0.14), (px, py, base_z + 0.07))
                        h = rnd.uniform(0.9, 1.35)
                        _add_box(load, (0.96, 1.1, h), (px, py, base_z + 0.14 + h / 2))
                        n_pallets += 1
        _obj(f"RACK_{r:03d}", frame, col, None, None)
        _obj(f"RACK_{r:03d}_load", load, col, None, None)
    return layout.rows, n_pallets
