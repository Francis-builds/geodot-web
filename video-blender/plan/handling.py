"""Cinemática de autoelevador y apiladora: dirección en el eje TRASERO (como los reales).

Referencia = centro del eje delantero (el de carga, que no dobla): su velocidad va
siempre según el rumbo. Con dirección atrás, dyaw/dt = -v / wheelbase · tan(steer).
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Callable

import numpy as np

from plan.kinematics import Poly, n, u


@dataclass(frozen=True)
class LiftSpec:
    wheelbase: float
    half_w: float
    front: float     # desde el eje delantero hasta la punta de las horquillas cargadas
    rear: float      # desde el eje delantero hasta el contrapeso (negativo)


@dataclass(frozen=True)
class Lift:
    p: np.ndarray    # centro del eje delantero
    yaw: float       # rumbo (hacia las horquillas)
    fork_h: float


FORKLIFT = LiftSpec(wheelbase=1.5, half_w=0.5, front=1.65, rear=-1.8)   # eléctrico compacto, 1,0 m de ancho;
# cara de horquillas a 0,45 m del eje + pallet de 1,2 m = punta a 1,65 m
REACH = LiftSpec(wheelbase=1.4, half_w=0.55, front=1.1, rear=-1.5)


def lift_step(s: Lift, spec: LiftSpec, v: float, steer: float, dt: float) -> Lift:
    yaw = s.yaw - v / spec.wheelbase * math.tan(steer) * dt
    return Lift(s.p + v * u(s.yaw) * dt, yaw, s.fork_h)


def lift_rect(s: Lift, spec: LiftSpec) -> Poly:
    uu, nn = u(s.yaw), n(s.yaw)
    return [s.p + uu * a + nn * sg * spec.half_w for a, sg in ((spec.rear, -1), (spec.front, -1), (spec.front, 1), (spec.rear, 1))]


def body_rect(s: Lift, spec: LiftSpec, nose: float = 0.35) -> Poly:
    """Chasis sin horquillas ni carga (las horquillas entran bajo pallets y dentro del rack)."""
    uu, nn = u(s.yaw), n(s.yaw)
    return [s.p + uu * a + nn * sg * spec.half_w for a, sg in ((spec.rear, -1), (nose, -1), (nose, 1), (spec.rear, 1))]


def _target(p: np.ndarray, path: np.ndarray, ld: float) -> np.ndarray:
    # reutiliza el buscador de la polilínea de los controladores del camión
    from plan.controllers import _lookahead_point
    return _lookahead_point(p, path, ld)


def follow(s: Lift, spec: LiftSpec, path: np.ndarray, v: float, until: Callable[[Lift], bool],
           dt: float = 0.02, max_steer: float = math.radians(70), lookahead: float = 2.5,
           steer_rate: float = math.radians(90), max_dist: float = 200.0) -> list[Lift]:
    """Pure pursuit del eje delantero; hacia atrás si v < 0. El volante gira ≤ steer_rate rad por metro."""
    out, steer, travelled = [s], 0.0, 0.0
    while not until(s):
        tgt = _target(s.p, path, lookahead)
        travel = s.yaw if v > 0 else s.yaw + math.pi
        d = tgt - s.p
        alpha = (math.atan2(d[1], d[0]) - travel + math.pi) % math.tau - math.pi
        kappa = 2.0 * math.sin(alpha) / max(float(np.linalg.norm(d)), 1e-6)
        want = math.atan(-spec.wheelbase * kappa if v > 0 else spec.wheelbase * kappa)
        want = max(-max_steer, min(max_steer, want))
        lim = steer_rate * abs(v) * dt
        steer += max(-lim, min(lim, want - steer))
        s = lift_step(s, spec, v, steer, dt)
        out.append(s)
        travelled += abs(v) * dt
        if travelled > max_dist:
            raise RuntimeError("follow no llegó dentro de max_dist")
    return out
