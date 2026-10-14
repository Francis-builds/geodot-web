"""Sitio: depósito en corte (techo y fachada en paneles), andenes, pintura, acceso con pluma,
flota estacionada y polvo. El layout sale de plan.site (única fuente)."""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field

import bmesh
import bpy

from kit.primitives import _obj, box, cyl, empty, text
from kit.racks import RackLayout, build_racks
from kit.handling import dock_door
from kit.trucks import truck
from plan.site import (BUILDING, DOCK, DOCK_BUMPER_X, DOCKS, HERO_DOCK, GATE, OCCUPIED, WALL_Y, Y_DOCK, Y_LANE, Y_YARD,
                       YARD_TRACTOR, YARD_X, dock_x)

FLOOR_Z = 1.25          # piso del depósito a altura de andén
WALL_H = 12.0
PANEL = 10.0            # paneles de techo y de fachada de 10 m


@dataclass
class SiteObjects:
    roof_panels: list = field(default_factory=list)
    facade: list = field(default_factory=list)
    barrier: object = None
    booth: object = None
    door11: object = None
    racks: int = 0
    pallets: int = 0


def _paint_strip(cols, mats, x0, y0, x1, y1, w, kind="paint"):
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    ln = math.hypot(x1 - x0, y1 - y0)
    ob = box("paint", (w, ln, 0.005), (cx, cy, 0.005), cols["PAINT"], mat=mats[kind])
    ob.rotation_euler = (0, 0, math.atan2(-(x1 - x0), y1 - y0))
    return ob


def _building(cols, site: SiteObjects) -> None:
    L = cols["LINES"]
    w, d = BUILDING.x1 - BUILDING.x0, BUILDING.y1 - BUILDING.y0
    cx, cy = (BUILDING.x0 + BUILDING.x1) / 2, (BUILDING.y0 + BUILDING.y1) / 2
    box("floor", (w, d, FLOOR_Z), (cx, cy, FLOOR_Z / 2), L)
    box("wall_n", (w, 0.3, WALL_H), (cx, BUILDING.y1 - 0.15, WALL_H / 2), L)
    for x in (BUILDING.x0 + 0.15, BUILDING.x1 - 0.15):
        box("wall_side", (0.3, d, WALL_H), (x, cy, WALL_H / 2), L)
    nx, ny = round(w / PANEL), round(d / PANEL)
    k = 0
    for i in range(nx):
        x = BUILDING.x0 + PANEL * (i + 0.5)
        # fachada de andenes (la que mira a la cámara): un panel por tramo de 10 m
        f = box(f"FACADE_{i:03d}", (PANEL, 0.3, WALL_H), (x, WALL_Y + 0.15, WALL_H / 2), L)
        site.facade.append(f)
        for j in range(ny):
            y = BUILDING.y0 + PANEL * (j + 0.5)
            p = box(f"ROOF_panel_{k:03d}", (PANEL, PANEL, 0.3), (x, y, WALL_H + 0.15), L)
            for r in range(6):  # nervaduras de chapa, se levantan con su panel
                box("rib", (0.08, PANEL, 0.06), (-PANEL / 2 + 0.8 + r * 1.6, 0, 0.18), L, parent=p)
            if (i + j) % 2 == 0:
                box("skylight", (1.6, 3.2, 0.12), (0, 0, 0.21), L, parent=p, bev=0.02)
            site.roof_panels.append(p)
            k += 1


def _facade_at(site: SiteObjects, x: float):
    i = int((x - BUILDING.x0) // PANEL)
    return site.facade[max(0, min(len(site.facade) - 1, i))]


def _docks(cols, mats, font, site: SiteObjects) -> None:
    L = cols["LINES"]
    for i in DOCKS:
        x = dock_x(i)
        f = _facade_at(site, x)
        # canopy y puerta viajan con su panel de fachada (coordenadas locales al panel)
        box("canopy", (3.5, 0.7, 0.18), (x - f.location.x, -0.05 - f.location.y, 4.7 - WALL_H / 2), L, parent=f, bev=0.02)
        if i != HERO_DOCK:  # la del andén 11 es propia (kit.handling.dock_door): sube en la fase 2
            box("dockdoor", (3.0, 0.06, 3.0), (x - f.location.x, 0.38 - f.location.y, 2.7 - WALL_H / 2), L, parent=f)
        for s in (-1, 1):
            box("bumper", (0.25, 0.3, 0.45), (x + s * DOCK_BUMPER_X, 0.2, 1.25), L, bev=0.03)
        box("leveler", (2.2, 0.5, 0.06), (x, 0.15, 1.3), L)
        _paint_strip(cols, mats, x - DOCK / 2, 0, x - DOCK / 2, -21, 0.08)
        text(f"{i:02d}", (x, -23.4, 0.01), 1.3, cols["TEXT"], mats["paint"], font)
    xe = dock_x(DOCKS[-1]) + DOCK / 2
    _paint_strip(cols, mats, xe, 0, xe, -21, 0.08)
    for k in range(50):  # eje punteado del carril
        x0 = -70 + k * 4
        _paint_strip(cols, mats, x0, Y_LANE, x0 + 2, Y_LANE, 0.14, "paint_dim")
    for k in range(26):  # cajones de la fila del patio
        x = -40 + k * 4.3
        _paint_strip(cols, mats, x, -57, x, -80, 0.1, "paint_dim")


def _interior_paint(cols, mats) -> None:
    """Pasillos del rack y zona de preparación frente a los andenes, a la altura del piso."""
    lay = RackLayout()
    z = FLOOR_Z + 0.006
    for r in range(lay.rows + 1):
        x = lay.x0 - lay.row_pitch / 2 + r * lay.row_pitch
        ob = box("paint", (0.08, 17.5, 0.005), (x, lay.y0 + 8.1, z), cols["PAINT"], mat=mats["paint"])
    for y in (3.0, 8.5):  # franja de preparación / staging
        box("paint", (BUILDING.x1 - BUILDING.x0 - 4, 0.12, 0.005),
            ((BUILDING.x0 + BUILDING.x1) / 2, y, z), cols["PAINT"], mat=mats["paint_dim"])


def _gate(cols, mats, site: SiteObjects) -> None:
    L = cols["LINES"]
    b = GATE.booth
    bx, by = (b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2
    site.booth = box("GATE_booth", (b.x1 - b.x0, b.y1 - b.y0, 2.8), (bx, by, 1.4), L, bev=0.03)
    box("booth_roof", (b.x1 - b.x0 + 0.6, b.y1 - b.y0 + 0.6, 0.2), (bx, by, 2.95), L, bev=0.02)
    box("booth_window", (b.x1 - b.x0 - 0.4, 0.04, 0.9), (bx, b.y1 + 0.02, 1.9), L)
    post_y = GATE.barrier.y0
    box("barrier_post", (0.3, 0.3, 1.1), (GATE.x, post_y - 0.2, 0.55), L, bev=0.02)
    piv = empty("GATE_barrier", L, (GATE.x, post_y, 1.0))
    arm_len = GATE.barrier.y1 - GATE.barrier.y0
    box("GATE_arm", (0.12, arm_len, 0.12), (0, arm_len / 2, 0), L, parent=piv)
    site.barrier = piv
    cyl("lpr_pole", 0.08, 5.0, (GATE.x + 6.0, post_y - 1.0, 2.5), L, seg=12)
    box("lpr_cam", (0.25, 0.5, 0.25), (GATE.x + 6.0, post_y - 0.7, 5.0), L, bev=0.02)
    _paint_strip(cols, mats, GATE.x + 0.8, Y_LANE - 2.6, GATE.x + 0.8, Y_LANE + 2.6, 0.3)  # línea de pare


def _fleet(cols) -> None:
    L = cols["LINES"]
    for i, with_tractor in OCCUPIED.items():
        truck(L, f"T{i}", dock_x(i), Y_DOCK, yaw=0.0, with_tractor=with_tractor)
    for k, x in enumerate(YARD_X):
        truck(L, f"Y{k}", x, Y_YARD, yaw=math.pi, with_tractor=YARD_TRACTOR[k])


def _dust(cols, mats, n: int = 1800, seed: int = 7) -> None:
    rnd = random.Random(seed)
    groups = [bmesh.new() for _ in range(3)]
    for _ in range(n):
        g = rnd.choice(groups)
        s = rnd.uniform(0.012, 0.032)
        px, py, pz = rnd.uniform(-70, 120), rnd.uniform(-90, 35), rnd.uniform(0.5, 18)
        g.faces.new([g.verts.new((px + dx * s, py + dy * s, pz)) for dx, dy in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
    for i, g in enumerate(groups):
        _obj("dust", g, cols["FX"], mats[f"dust{i}"], None)


def build_site(cols, mats, font: str) -> SiteObjects:
    site = SiteObjects()
    _building(cols, site)
    site.racks, site.pallets = build_racks(cols["LINES"], mats, RackLayout(floor_z=FLOOR_Z))
    _interior_paint(cols, mats)
    _docks(cols, mats, font, site)
    site.door11 = dock_door(cols["LINES"], "DOOR_11", dock_x(HERO_DOCK), 0.38)
    _gate(cols, mats, site)
    _fleet(cols)
    _dust(cols, mats)
    return site
