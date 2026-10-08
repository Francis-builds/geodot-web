"""Equipos y carga de la fase 2: autoelevador, apiladora, pallets, puerta del andén 11,
celda resaltada del rack y destello de escaneo. Ejes locales: +X = adelante (rumbo),
origen = centro del eje delantero a nivel del piso (lo que planifica plan/handling.py)."""
from __future__ import annotations

import random

from kit.primitives import box, cyl, empty

FLOOR_Z = 1.25


def _wheel(col, parent, x, y, r, w):
    cyl("lwheel", r, w, (x, y, r), col, parent, axis="y", seg=24, bev=0.03)
    cyl("lhub", r * 0.45, w + 0.02, (x, y, r), col, parent, axis="y", seg=12)


def forklift(col, name: str = "FORKLIFT"):
    """Contrapesado eléctrico compacto (1,0 m de ancho), mástil de 2 etapas, guarda superior."""
    root = empty(name, col)
    box("fl_chassis", (2.05, 1.0, 0.75), (-0.775, 0, 0.55), col, root, bev=0.08, seg=3)
    box("fl_counterweight", (0.55, 1.0, 0.9), (-1.52, 0, 0.62), col, root, bev=0.14, seg=4)
    box("fl_seat", (0.45, 0.5, 0.15), (-0.95, 0, 1.0), col, root, bev=0.05)
    box("fl_seatback", (0.12, 0.5, 0.5), (-1.18, 0, 1.25), col, root, bev=0.04)
    cyl("fl_wheel_steer", 0.17, 0.03, (-0.35, 0, 1.25), col, root, seg=20)
    for sx in (-1.2, -0.1):
        for sy in (-0.44, 0.44):
            box("fl_guardpost", (0.06, 0.06, 1.15), (sx, sy, 1.55), col, root)
    box("fl_guardroof", (1.2, 0.94, 0.05), (-0.65, 0, 2.15), col, root)
    for k in range(5):
        box("fl_guardslat", (0.04, 0.9, 0.04), (-1.15 + k * 0.25, 0, 2.19), col, root)
    for sy in (-0.38, 0.38):
        _wheel(col, root, 0.0, sy, 0.3, 0.22)
        _wheel(col, root, -1.5, sy * 0.85, 0.23, 0.18)
        box("fl_mast_outer", (0.1, 0.08, 2.3), (0.33, sy, 1.2), col, root)
    for z in (0.35, 1.3, 2.25):
        box("fl_mast_tie", (0.08, 0.84, 0.08), (0.33, 0, z), col, root)
    forks = empty(f"{name}_forks", col, parent=root)
    box("fl_carriage", (0.06, 0.95, 0.55), (0.42, 0, 0.3), col, forks, bev=0.01)
    box("fl_backrest", (0.04, 0.95, 0.75), (0.41, 0, 0.95), col, forks)
    for sy in (-0.3, 0.3):
        box("fl_tine", (1.2, 0.12, 0.045), (1.05, sy, 0.02), col, forks)
        box("fl_tine_heel", (0.05, 0.12, 0.5), (0.47, sy, 0.27), col, forks)
    return root


def reach_truck(col, name: str = "REACH"):
    """Apiladora retráctil: patas estabilizadoras con ruedas de carga, mástil que avanza (REACH_mast)."""
    root = empty(name, col)
    box("rc_body", (1.25, 1.1, 1.15), (-0.95, 0, 0.7), col, root, bev=0.1, seg=3)
    box("rc_overhead", (0.9, 1.0, 0.05), (-0.9, 0, 2.2), col, root)
    for sx in (-1.3, -0.5):
        for sy in (-0.47, 0.47):
            box("rc_post", (0.05, 0.05, 1.0), (sx, sy, 1.7), col, root)
    _wheel(col, root, -1.15, 0.0, 0.17, 0.16)                    # rueda de dirección/tracción
    for sy in (-0.45, 0.45):
        box("rc_leg", (1.3, 0.12, 0.14), (0.4, sy, 0.1), col, root)
        _wheel(col, root, 0.95, sy, 0.08, 0.1)                  # ruedas de carga en la punta de las patas
    mast = empty(f"{name}_mast", col, parent=root)              # avanza con la extensión (x local)
    for sy in (-0.36, 0.36):
        box("rc_mast_upright", (0.1, 0.08, 3.4), (-0.2, sy, 1.75), col, mast)
    for z in (0.3, 1.8, 3.35):
        box("rc_mast_tie", (0.08, 0.8, 0.07), (-0.2, 0, z), col, mast)
    forks = empty(f"{name}_forks", col, parent=mast)
    box("rc_carriage", (0.06, 0.9, 0.5), (-0.1, 0, 0.27), col, forks, bev=0.01)
    for sy in (-0.28, 0.28):
        box("rc_tine", (1.15, 0.11, 0.045), (0.5, sy, 0.02), col, forks)
    return root


def pallet(col, name: str, seed: int = 0):
    """Pallet 1,2 × 1,0 m con carga paletizada; origen en el centro de la base."""
    rnd = random.Random(seed)
    root = empty(name, col)
    box("pl_deck", (1.2, 1.0, 0.03), (0, 0, 0.13), col, root)
    box("pl_bottom", (1.2, 1.0, 0.02), (0, 0, 0.01), col, root)
    for sy in (-0.42, 0, 0.42):
        box("pl_stringer", (1.2, 0.1, 0.1), (0, sy, 0.07), col, root)
    h = rnd.uniform(1.0, 1.3)
    box("pl_load", (1.16, 0.96, h), (0, 0, 0.145 + h / 2), col, root, bev=0.01)
    rows = 3
    for k in range(1, rows):  # capas de cajas
        box("pl_layer", (1.17, 0.97, 0.01), (0, 0, 0.145 + h * k / rows), col, root)
    box("pl_label", (0.01, 0.2, 0.14), (0.585, 0.25, 0.145 + h * 0.6), col, root)
    return root


def dock_door(col, name: str, x: float, y: float):
    """Puerta enrollable del andén: panel que sube (se anima su z) + rollo arriba."""
    root = empty(name, col, (x, y, 0))
    box("door_panel", (3.0, 0.05, 3.0), (0, 0, 2.75), col, root)
    for k in range(1, 6):
        box("door_slat", (3.0, 0.06, 0.02), (0, 0, 1.25 + k * 0.5), col, root)
    cyl("door_roll", 0.25, 3.1, (0, 0.1, 4.55), col, root, axis="x", seg=20)
    return root


def slot_highlight(col, xyz: tuple[float, float, float]):
    """Contorno de la posición del rack (colección HERO → líneas teal)."""
    x, y, z = xyz
    return box("SLOT_highlight", (1.05, 1.25, 1.55), (x, y, z + 0.78), col)


def scan_flash(col, mat):
    """Haz plano de escaneo (emisión teal) que barre el pallet en scanA."""
    return box("SCAN_flash", (0.02, 1.1, 1.4), (0, 0, 0.75), col, mat=mat)

