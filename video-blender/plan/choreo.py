"""Coreografía de la fase 2 (v2): recepción con UN autoelevador + corte a picking con carrito.

Tramo 1. Sube la puerta del andén 11. El autoelevador entra al tráiler, levanta pallet_A,
sale marcha atrás (corto e inevitable: no se gira dentro de un tráiler), pasa por el portal
RFID de la puerta (escaneo), cruza el depósito hacia adelante, gira 90° en el pasillo y lo
deja en el pick face (PICK_SLOT). Sale marcha atrás lo justo para liberar las horquillas.

Tramo 2 (después del corte de escena). En otro pasillo, un picker empuja un carrito, frena
frente a OTRO pick face (PICK_SLOT_B), saca una caja de ese pallet, la carga y sigue.

Los vehículos salen de plan.handling (integración + muestreo por distancia); las horquillas,
la puerta y la caja que pasa de mano son actuadores con perfil de velocidad.
"""
from __future__ import annotations

import math

import numpy as np

from plan.handling import FORKLIFT, Lift, LiftSpec, follow
from plan.kinematics import Poly
from plan.picker_pose import PICK_PHASES
from plan.site import (BAY, BUILDING, DOCK_BUMPER_X, FLUE, HERO_DOCK, PICK_SLOT, PICK_SLOT_B, SIDE, WALL_Y,
                       RackLayout, Rect, dock_x, slot_center)
from plan.timing import profile_frames

OWNER = {"trailer": 0, "forklift": 1, "rack": 4}
CLIP = {"idle": 0, "walk": 1, "scan": 2, "pickup": 3}

DX = dock_x(HERO_DOCK)
TRAILER_FLOOR = 1.30
FLOOR = 1.25
PALLET_A = np.array([DX - 0.52, -1.0])         # fila 1 del tráiler, lado izquierdo (la más cerca de la puerta)
PORTAL_Y = 1.2                                 # portal RFID del lado de adentro de la puerta del andén
FORK_IN = 0.03
V_FL, V_WALK = 0.34, 0.12                      # m/frame (ritmo comprimido)
RAMP = 8
SOUTH, NORTH, EAST = -math.pi / 2, math.pi / 2, 0.0
CART_AHEAD = 1.0                               # centro del carrito delante del picker
BOX_TOP = 2.55                                 # tapa de la carga del pallet B (z)


def _rows() -> list[tuple[float, float]]:
    lay = RackLayout()
    depth = 2 * SIDE + FLUE
    return [(lay.x0 + r * lay.row_pitch - depth / 2, lay.x0 + r * lay.row_pitch + depth / 2) for r in range(lay.rows)]


def rack_obstacles() -> list[Poly]:
    lay = RackLayout()
    return [Rect(x0, lay.y0, x1, lay.y0 + lay.bays * BAY).poly() for x0, x1 in _rows()]


def lift_obstacles() -> list[Poly]:
    """Lo que el chasis del autoelevador no puede tocar dentro del depósito y del tráiler."""
    obs = rack_obstacles()
    door0, door1 = DX - 1.5, DX + 1.5
    obs.append(Rect(BUILDING.x0, WALL_Y, door0, WALL_Y + 0.3).poly())
    obs.append(Rect(door1, WALL_Y, BUILDING.x1, WALL_Y + 0.3).poly())
    for s in (-1, 1):
        bx = DX + s * DOCK_BUMPER_X
        obs.append(Rect(bx - 0.125, 0.05, bx + 0.125, 0.35).poly())
        wx = DX + s * 1.25
        obs.append(Rect(wx - (0.05 if s < 0 else 0), -16.5, wx + (0.05 if s > 0 else 0), -0.35).poly())
    obs.append(Rect(BUILDING.x0, BUILDING.y1 - 0.3, BUILDING.x1, BUILDING.y1).poly())
    return obs


class Actor:
    """Pista de un vehículo: una pose por frame (x, y, z_horquillas, yaw)."""

    def __init__(self, spec: LiftSpec, p: tuple[float, float], yaw: float, fork_z: float):
        self.spec = spec
        self.frames: list[Lift] = [Lift(np.array(p, dtype=float), yaw, fork_z)]

    @property
    def now(self) -> Lift:
        return self.frames[-1]

    def wait_until(self, frame: int) -> None:
        while len(self.frames) <= frame:
            self.frames.append(self.now)

    def drive(self, path: list[tuple[float, float]], v_dir: float, vmax: float, until, lookahead: float = 2.5) -> None:
        dense = follow(self.now, self.spec, np.array([tuple(self.now.p)] + path, dtype=float), v_dir, until,
                       dt=0.01, lookahead=lookahead)
        z = self.now.fork_h
        self.frames += [Lift(s.p, s.yaw, z) for s in profile_frames(dense, vmax, RAMP)[1:]]

    def forks(self, z_to: float, rate: float = 0.025) -> None:
        z0 = self.now.fork_h
        n = max(2, math.ceil(abs(z_to - z0) / rate))
        for i in range(1, n + 1):
            t = i / n
            self.frames.append(Lift(self.now.p, self.now.yaw, z0 + (z_to - z0) * t * t * (3 - 2 * t)))


def _carried(lift: Lift, spec: LiftSpec) -> list[float]:
    c = lift.p + (spec.front - 0.6) * np.array([math.cos(lift.yaw), math.sin(lift.yaw)])
    return [float(c[0]), float(c[1]), lift.fork_h - FORK_IN, lift.yaw]


def _u(yaw: float) -> np.ndarray:
    return np.array([math.cos(yaw), math.sin(yaw)])


def choreograph(start_frame: int, fps: int = 24) -> tuple[dict[str, list[list[float]]], dict[str, int]]:
    sx, sy, sz = slot_center(RackLayout(), PICK_SLOT)
    rows = _rows()
    aisle_a = (rows[4][1] + rows[5][0]) / 2            # pasillo entre las filas 4 y 5
    fl = Actor(FORKLIFT, (PALLET_A[0], 6.0), SOUTH, FLOOR)
    ev: dict[str, int] = {"doorOpen": 0}

    # --- tramo 1: tráiler → portal → pick face ---
    fl.wait_until(10)
    fl.forks(TRAILER_FLOOR + FORK_IN)
    pick_y = float(PALLET_A[1]) + FORKLIFT.front - 0.6
    fl.drive([(PALLET_A[0], pick_y)], +1.0, V_FL, until=lambda s: s.p[1] <= pick_y)
    ev["unloadStart"] = len(fl.frames)
    fl.forks(TRAILER_FLOOR + 0.15)
    # sale marcha atrás abriéndose hacia el oeste para quedar mirando al pasillo
    fl.drive([(PALLET_A[0], 2.4), (9.2, 4.3)], -1.0, V_FL, until=lambda s: s.p[1] >= 4.1)
    stop_x = sx - (FORKLIFT.front - 0.6)
    # sube por el lado oeste del pasillo para tener radio y entrar derecho a la posición
    fl.drive([(aisle_a - 0.6, 7.0), (aisle_a - 0.6, sy - 2.2), (aisle_a + 0.3, sy - 0.15), (stop_x, sy)], +1.0, V_FL,
             until=lambda s: s.p[0] >= stop_x - 0.005, lookahead=1.3)
    fl.forks(sz + FORK_IN)
    ev["slotDone"] = len(fl.frames) - 1
    fl.forks(sz)
    back_x = (rows[5][0] - FORKLIFT.front) - 0.10       # puntas 10 cm fuera del frente del rack (la cola no toca la fila de enfrente)
    fl.drive([(back_x, float(fl.now.p[1]))], -1.0, 0.15, until=lambda s: s.p[0] <= back_x)
    ev["sceneCut"] = len(fl.frames) + 10

    # escaneo: cuando el pallet cruza el portal de la puerta
    def pallet_y(i: int) -> float:
        return _carried(fl.frames[i], FORKLIFT)[1]
    ev["scanA"] = next(i for i in range(ev["unloadStart"], len(fl.frames)) if pallet_y(i) >= PORTAL_Y)

    # --- tramo 2 (otra escena): picker con carrito, otro pasillo, otro pallet ---
    bx, by, _ = slot_center(RackLayout(), PICK_SLOT_B)
    aisle_b = (rows[7][1] + rows[8][0]) / 2
    stand = np.array([aisle_b + 0.4, by - 0.2])
    walk = np.array([(aisle_b, by - 7.2), (aisle_b + 0.4, by - 5.0), tuple(stand)])
    seg = np.linalg.norm(np.diff(walk, axis=0), axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)])

    def walk_at(d: float) -> tuple[np.ndarray, float]:
        i = min(len(seg) - 1, int(np.searchsorted(cum, d, side="right") - 1))
        t = (d - cum[i]) / seg[i]
        dv = walk[i + 1] - walk[i]
        return walk[i] + dv * t, math.atan2(dv[1], dv[0])

    t0 = ev["sceneCut"]
    n_walk = math.ceil(cum[-1] / V_WALK)
    ev["pickStart"] = t0 + n_walk + 2
    turn, reach, back, place = PICK_PHASES
    ev["boxInCart"] = ev["pickStart"] + turn + reach + back + place
    push_after = 1.6
    n_after = math.ceil(push_after / V_WALK)
    total = ev["boxInCart"] + n_after + 8

    picker, cart, box = [], [], []
    box0 = np.array([bx - 0.25, by, BOX_TOP])
    cart_stop = None
    for i in range(total):
        if i < t0:
            p, yaw = walk_at(0.0)
            pk = [p[0], p[1], FLOOR, yaw, CLIP["idle"]]
        elif i < ev["pickStart"]:
            p, yaw = walk_at(min(cum[-1], (i - t0) * V_WALK))
            pk = [p[0], p[1], FLOOR, yaw, CLIP["walk"]]
        elif i < ev["boxInCart"]:
            p, yaw = walk_at(cum[-1])
            k = i - ev["pickStart"]
            face = yaw + (EAST - yaw) * min(1.0, k / turn)                        # gira hacia el rack
            if k >= turn + reach:
                face = EAST + (yaw - EAST) * min(1.0, (k - turn - reach) / back)   # vuelve al carrito
            pk = [p[0], p[1], FLOOR, face, CLIP["pickup"]]
        else:
            d = cum[-1] + min(push_after, (i - ev["boxInCart"]) * V_WALK)
            p0, yaw = walk_at(cum[-1])
            p = p0 + _u(yaw) * (d - cum[-1])
            pk = [p[0], p[1], FLOOR, yaw, CLIP["walk"]]
        picker.append([float(v) for v in pk])
        # carrito: delante del picker mientras empuja; quieto mientras saca la caja
        base = np.array(pk[:2])
        heading = pk[3] if pk[4] != CLIP["pickup"] else walk_at(cum[-1])[1]
        if pk[4] == CLIP["pickup"]:
            cart_stop = cart_stop if cart_stop is not None else cart[-1][:2]
            cpos = np.array(cart_stop)
        else:
            cpos = base + _u(heading) * CART_AHEAD
        cart.append([float(cpos[0]), float(cpos[1]), FLOOR, float(heading), 0.0])

    hand_z = FLOOR + 1.15
    for i in range(total):
        k = i - ev["pickStart"]
        cart_top = np.array([cart[i][0], cart[i][1], FLOOR + 0.95])
        if k < turn:
            pos = box0
        elif k < turn + reach:                     # de la tapa del pallet a las manos (arco)
            t = (k - turn + 1) / reach
            hand = np.array([picker[i][0] + 0.45, picker[i][1], hand_z])
            pos = box0 + (hand - box0) * t + np.array([0, 0, 0.25 * math.sin(math.pi * t)])
        elif k < turn + reach + back:              # gira con la caja en las manos
            yaw = picker[i][3]
            pos = np.array([picker[i][0] + 0.45 * math.cos(yaw), picker[i][1] + 0.45 * math.sin(yaw), hand_z])
        elif i < ev["boxInCart"]:                  # la apoya en el carrito
            t = (k - turn - reach - back + 1) / place
            yaw = picker[i][3]
            hand = np.array([picker[i][0] + 0.45 * math.cos(yaw), picker[i][1] + 0.45 * math.sin(yaw), hand_z])
            pos = hand + (cart_top - hand) * t
        else:                                      # viaja en el carrito
            pos = cart_top
        box.append([float(pos[0]), float(pos[1]), float(pos[2]), float(cart[i][3]), 0.0])

    fl.wait_until(total - 1)
    fl.frames = fl.frames[:total]

    pallet: list[list[float]] = []
    drop = None
    for i in range(total):
        if i < ev["unloadStart"]:
            pallet.append([float(PALLET_A[0]), float(PALLET_A[1]), TRAILER_FLOOR, SOUTH, OWNER["trailer"]])
        elif i <= ev["slotDone"]:
            pallet.append(_carried(fl.frames[i], FORKLIFT) + [OWNER["forklift"]])
        else:
            drop = drop or pallet[-1][:4]
            pallet.append(list(drop) + [OWNER["rack"]])

    tracks = {
        "forklift": [[float(s.p[0]), float(s.p[1]), float(s.fork_h), float(s.yaw), 0.0] for s in fl.frames],
        "pallet_A": pallet, "picker": picker, "cart": cart, "box_B": box,
        "door11": [[0.0, 0.0, min(1.0, i / 20), 0.0, 0.0] for i in range(total)],
    }
    cues = {k: start_frame + v for k, v in ev.items()}
    return tracks, cues
