"""Coreografía de la fase 2: recepción + relevo.

Sube la puerta del andén 11 → el autoelevador saca pallet_A del tráiler y lo deja en
la preparación → destello de escaneo → la apiladora lo lleva al pick face (PICK_SLOT),
girando 90° sobre su eje delantero en el pasillo → sale → el picker llega a esa misma
posición y escanea (relevo).

Cada pose de los equipos sale de plan.handling (integración + muestreo por distancia);
las horquillas y el giro sobre el eje son actuadores con perfil de velocidad. El pallet
tiene un dueño por frame y su pose sale de ese dueño, así que nunca salta.
"""
from __future__ import annotations

import math

import numpy as np

from plan.handling import FORKLIFT, REACH, Lift, LiftSpec, follow
from plan.kinematics import Poly
from plan.site import (BUILDING, DOCK_BUMPER_X, HERO_DOCK, PICK_SLOT, WALL_Y, RackLayout, Rect,
                       dock_x, slot_center)
from plan.timing import profile_frames

OWNER = {"trailer": 0, "forklift": 1, "floor": 2, "reach": 3, "rack": 4}
CLIP = {"idle": 0, "walk": 1, "scan": 2, "pickup": 3}

DX = dock_x(HERO_DOCK)
TRAILER_FLOOR = 1.30
FLOOR = 1.25
PALLET_A = np.array([DX - 0.52, -1.0])         # fila 1 del tráiler, lado izquierdo
STAGE = np.array([DX - 0.52, 4.5])             # preparación frente al andén
FORK_IN = 0.03                                 # las horquillas entran 3 cm sobre la base
V_FL, V_RC, V_RC_SLOW, V_WALK = 0.34, 0.26, 0.12, 0.12   # m/frame (ritmo comprimido)
REACH_EXT = 0.55    # carrera del mástil retráctil de la apiladora
RAMP = 8
SOUTH, EAST = -math.pi / 2, 0.0


def lift_obstacles() -> list[Poly]:
    """Lo que el chasis de un equipo no puede tocar dentro del depósito y del tráiler."""
    lay = RackLayout()
    obs: list[Poly] = []
    depth = 2 * 1.1 + 0.2
    for r in range(lay.rows):
        cx = lay.x0 + r * lay.row_pitch
        obs.append(Rect(cx - depth / 2, lay.y0, cx + depth / 2, lay.y0 + lay.bays * 2.7).poly())
    door0, door1 = DX - 1.5, DX + 1.5
    obs.append(Rect(BUILDING.x0, WALL_Y, door0, WALL_Y + 0.3).poly())      # fachada a los lados de la puerta
    obs.append(Rect(door1, WALL_Y, BUILDING.x1, WALL_Y + 0.3).poly())
    for s in (-1, 1):
        bx = DX + s * DOCK_BUMPER_X
        obs.append(Rect(bx - 0.125, 0.05, bx + 0.125, 0.35).poly())          # topes del andén
        wx = DX + s * 1.25                                                  # paredes interiores del tráiler
        obs.append(Rect(wx - (0.05 if s < 0 else 0), -16.5, wx + (0.05 if s > 0 else 0), -0.35).poly())
    obs.append(Rect(BUILDING.x0, BUILDING.y1 - 0.3, BUILDING.x1, BUILDING.y1).poly())
    return obs


class Actor:
    """Pista de un equipo: una pose por frame (x, y, z_horquillas, yaw)."""

    def __init__(self, spec: LiftSpec, p: tuple[float, float], yaw: float, fork_z: float):
        self.spec = spec
        self.frames: list[Lift] = [Lift(np.array(p, dtype=float), yaw, fork_z)]
        self.ext: list[float] = [0.0]      # extensión del mástil hacia adelante (solo la apiladora)

    def _push(self, lift: Lift) -> None:
        self.frames.append(lift)
        self.ext.append(self.ext[-1])

    @property
    def now(self) -> Lift:
        return self.frames[-1]

    def wait_until(self, frame: int) -> None:
        while len(self.frames) <= frame:
            self._push(self.now)

    def drive(self, path: list[tuple[float, float]], v_dir: float, vmax: float, until) -> None:
        dense = follow(self.now, self.spec, np.array([tuple(self.now.p)] + path, dtype=float), v_dir, until, dt=0.01)
        z = self.now.fork_h
        for s in profile_frames(dense, vmax, RAMP)[1:]:
            self._push(Lift(s.p, s.yaw, z))

    def forks(self, z_to: float, rate: float = 0.025) -> None:
        z0 = self.now.fork_h
        n = max(2, math.ceil(abs(z_to - z0) / rate))
        for i in range(1, n + 1):
            t = i / n
            self._push(Lift(self.now.p, self.now.yaw, z0 + (z_to - z0) * t * t * (3 - 2 * t)))

    def extend(self, to: float, frames: int = 10) -> None:
        """El mástil retráctil avanza o vuelve; el chasis no se mueve."""
        e0 = self.ext[-1]
        for i in range(1, frames + 1):
            t = i / frames
            self._push(self.now)
            self.ext[-1] = e0 + (to - e0) * t * t * (3 - 2 * t)

    def pivot(self, yaw_to: float, frames: int = 12) -> None:
        """Rueda de dirección a 90°: el equipo gira sobre el centro de su eje delantero."""
        y0 = self.now.yaw
        for i in range(1, frames + 1):
            t = i / frames
            self._push(Lift(self.now.p, y0 + (yaw_to - y0) * t * t * (3 - 2 * t), self.now.fork_h))


def _carried(lift: Lift, spec: LiftSpec, ext: float = 0.0) -> list[float]:
    c = lift.p + (spec.front - 0.6 + ext) * np.array([math.cos(lift.yaw), math.sin(lift.yaw)])
    return [float(c[0]), float(c[1]), lift.fork_h - FORK_IN, lift.yaw]


def choreograph(start_frame: int, fps: int = 24) -> tuple[dict[str, list[list[float]]], dict[str, int]]:
    sx, sy, sz = slot_center(RackLayout(), PICK_SLOT)
    fl = Actor(FORKLIFT, (DX - 0.52, 7.0), SOUTH, FLOOR)
    rc = Actor(REACH, (DX - 0.52, 10.6), SOUTH, FLOOR)
    ev: dict[str, int] = {"doorOpen": 0}

    # --- autoelevador: tráiler → preparación ---
    fl.wait_until(10)                                    # la puerta ya va por la mitad
    fl.forks(TRAILER_FLOOR + FORK_IN)
    pick_y = float(PALLET_A[1]) + FORKLIFT.front - 0.6        # eje delantero con el pallet entero sobre las horquillas
    fl.drive([(PALLET_A[0], pick_y)], +1.0, V_FL, until=lambda s: s.p[1] <= pick_y)
    ev["unloadStart"] = len(fl.frames)                   # primer frame de subida = toma el pallet
    fl.forks(TRAILER_FLOOR + 0.15)
    fl.drive([(STAGE[0], STAGE[1] + FORKLIFT.front - 0.6)], -1.0, V_FL,
             until=lambda s: s.p[1] >= STAGE[1] + FORKLIFT.front - 0.6)
    fl.forks(FLOOR + FORK_IN)
    ev["dropStage"] = len(fl.frames) - 1                 # base del pallet en el piso
    fl.forks(FLOOR)
    ev["scanA"] = len(fl.frames) + 2
    fl.drive([(STAGE[0], 6.9)], -1.0, V_FL, until=lambda s: s.p[1] >= 6.9)
    fl.drive([(STAGE[0], 7.6), (13.0, 8.3)], -1.0, V_FL, until=lambda s: s.p[0] >= 12.7)
    clear = len(fl.frames)

    # --- apiladora: preparación → pick face ---
    rc.wait_until(clear + 2)
    ev["reachStart"] = len(rc.frames)
    rc.forks(FLOOR + FORK_IN)
    rc.drive([(STAGE[0], STAGE[1] + REACH.front - 0.6)], +1.0, V_RC,
             until=lambda s: s.p[1] <= STAGE[1] + REACH.front - 0.6)
    ev["reachPick"] = len(rc.frames)
    rc.forks(FLOOR + 0.15)
    aisle_x = 10.45
    rc.drive([(STAGE[0], 9.0), (aisle_x, 11.5), (aisle_x, sy)], -1.0, V_RC, until=lambda s: s.p[1] >= sy)
    rc.pivot(EAST)
    # el chasis se acerca hasta el frente del rack y el mástil retráctil mete la carga
    stop_x = sx - (REACH.front - 0.6 + REACH_EXT)
    rc.drive([(stop_x, float(rc.now.p[1]))], +1.0, V_RC_SLOW, until=lambda s: s.p[0] >= stop_x)
    rc.extend(REACH_EXT)
    rc.forks(sz + FORK_IN)
    ev["slotDone"] = len(rc.frames) - 1
    rc.forks(sz)
    rc.extend(0.0)
    rc.drive([(aisle_x, float(rc.now.p[1]))], -1.0, V_RC_SLOW, until=lambda s: s.p[0] <= aisle_x)
    rc.pivot(SOUTH)
    rc.drive([(aisle_x, sy + 4.0)], -1.0, V_RC, until=lambda s: s.p[1] >= sy + 4.0)
    reach_gone = next(i for i, s in enumerate(rc.frames) if i > ev["slotDone"] and s.p[1] >= sy + 3.0)

    # --- picker: preparación → misma posición del rack (relevo) ---
    walk_path = np.array([(STAGE[0], 9.9), (STAGE[0], sy - 1.0), (sx - 1.05, sy)])
    seg = np.linalg.norm(np.diff(walk_path, axis=0), axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)])
    picker: list[list[float]] = []
    t_walk = reach_gone + 2
    n_walk = math.ceil(cum[-1] / V_WALK)

    def at(d: float) -> tuple[float, float, float]:
        i = min(len(seg) - 1, int(np.searchsorted(cum, d, side="right") - 1))
        t = (d - cum[i]) / seg[i]
        p = walk_path[i] + (walk_path[i + 1] - walk_path[i]) * t
        dvec = walk_path[i + 1] - walk_path[i]
        return float(p[0]), float(p[1]), math.atan2(dvec[1], dvec[0])

    ev["pickerArrive"] = t_walk + n_walk
    ev["relevo"] = ev["pickerArrive"] + 6
    total = ev["relevo"] + 18

    for i in range(total):
        if i < t_walk:
            x, y, yaw = at(0.0)
            picker.append([x, y, FLOOR, yaw, CLIP["idle"]])
        elif i < ev["pickerArrive"]:
            x, y, yaw = at(min(cum[-1], (i - t_walk) * V_WALK))
            picker.append([x, y, FLOOR, yaw, CLIP["walk"]])
        else:  # gira de frente al rack y escanea
            x, y, yaw = at(cum[-1])
            k = min(1.0, (i - ev["pickerArrive"]) / 6)
            picker.append([x, y, FLOOR, yaw + (EAST - yaw) * k, CLIP["scan"] if i >= ev["relevo"] else CLIP["idle"]])

    fl.wait_until(total - 1)
    rc.wait_until(total - 1)
    fl.frames, rc.frames, rc.ext = fl.frames[:total], rc.frames[:total], rc.ext[:total]

    # --- pallet_A: dueño y pose por frame ---
    pallet: list[list[float]] = []
    drop_stage = drop_rack = None
    for i in range(total):
        if i < ev["unloadStart"]:
            pallet.append([float(PALLET_A[0]), float(PALLET_A[1]), TRAILER_FLOOR, SOUTH, OWNER["trailer"]])
        elif i <= ev["dropStage"]:
            pallet.append(_carried(fl.frames[i], FORKLIFT) + [OWNER["forklift"]])
        elif i < ev["reachPick"]:
            drop_stage = drop_stage or pallet[-1][:4]
            pallet.append(list(drop_stage) + [OWNER["floor"]])
        elif i <= ev["slotDone"]:
            pallet.append(_carried(rc.frames[i], REACH, rc.ext[i]) + [OWNER["reach"]])
        else:
            drop_rack = drop_rack or pallet[-1][:4]
            pallet.append(list(drop_rack) + [OWNER["rack"]])

    def track(a: Actor) -> list[list[float]]:
        """extra = extensión del mástil (0 en el autoelevador)."""
        return [[float(s.p[0]), float(s.p[1]), float(s.fork_h), float(s.yaw), float(e)] for s, e in zip(a.frames, a.ext)]

    door = [[0.0, 0.0, min(1.0, i / 20), 0.0, 0.0] for i in range(total)]
    tracks = {"forklift": track(fl), "reach": track(rc), "pallet_A": pallet, "picker": picker, "door11": door}
    cues = {k: start_frame + v for k, v in ev.items() if k in
            ("doorOpen", "unloadStart", "scanA", "reachStart", "slotDone", "pickerArrive", "relevo")}
    return tracks, cues
