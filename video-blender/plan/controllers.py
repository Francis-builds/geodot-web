"""Controladores de manejo sobre la cinemática de plan.kinematics.

- pure_pursuit_steer: avance, el eje del tractor sigue una polilínea.
- reverse_dock_steer: marcha atrás en cascada, como maniobra un chofer real:
  el eje del TRÁILER persigue el eje del andén (lazo externo -> articulación
  deseada) y el volante lleva la articulación a ese valor (lazo interno).
"""
from __future__ import annotations

import math
from typing import Callable

import numpy as np

from plan.kinematics import L1, LW, TR_AXLE, State, step, u

MAX_ART = math.radians(45)


def _wrap(a: float) -> float:
    return (a + math.pi) % math.tau - math.pi


def _lookahead_point(p: np.ndarray, path: np.ndarray, ld: float) -> np.ndarray:
    """Punto a distancia `ld` (medida sobre la polilínea) adelante del punto más cercano a p."""
    best_d, best_seg, best_t = math.inf, 0, 0.0
    for i, (a, b) in enumerate(zip(path[:-1], path[1:])):
        ab = b - a
        t = max(0.0, min(1.0, float((p - a) @ ab) / float(ab @ ab)))
        d = float(np.linalg.norm(p - (a + t * ab)))
        if d < best_d:
            best_d, best_seg, best_t = d, i, t
    remaining = ld
    a, b = path[best_seg], path[best_seg + 1]
    cur = a + best_t * (b - a)
    for i in range(best_seg, len(path) - 1):
        b = path[i + 1]
        seg = float(np.linalg.norm(b - cur))
        if seg >= remaining:
            return cur + (b - cur) * (remaining / seg)
        remaining -= seg
        cur = b
    return path[-1].astype(float)


def _pursuit_curvature(p: np.ndarray, heading: float, target: np.ndarray) -> float:
    d = target - p
    alpha = _wrap(math.atan2(d[1], d[0]) - heading)
    return 2.0 * math.sin(alpha) / max(float(np.linalg.norm(d)), 1e-6)


def pure_pursuit_steer(s: State, path: np.ndarray, lookahead: float = 9.0,
                       max_steer: float = math.radians(35)) -> float:
    target = _lookahead_point(s.tractor_axle, path, lookahead)
    kappa = _pursuit_curvature(s.tractor_axle, s.phi0, target)
    return max(-max_steer, min(max_steer, math.atan(LW * kappa)))


def reverse_dock_steer(s: State, dock_line: tuple[np.ndarray, np.ndarray],
                       max_steer: float = math.radians(35), k_art: float = 1.8,
                       ld_max: float = 10.0, ld_factor: float = 0.45) -> float:
    """dock_line = (punto del andén, punto alejado sobre el eje del andén hacia el patio)."""
    dock, far = (np.asarray(p, dtype=float) for p in dock_line)
    axle = s.R + TR_AXLE * u(s.phi1)
    # el eje del tráiler termina TR_AXLE delante de la trasera, sobre el eje del andén
    axis = (dock - far) / np.linalg.norm(dock - far)
    end = dock - axis * TR_AXLE
    path = np.array([far, end])
    dist_end = float(np.linalg.norm(end - axle))
    ld = max(3.0, min(ld_max, ld_factor * dist_end))
    target = _lookahead_point(axle, path, ld)
    # el tráiler viaja hacia atrás: su rumbo de marcha es phi1 + pi
    kappa = _pursuit_curvature(axle, s.phi1 + math.pi, target)
    # en marcha atrás phi1' = -|v|/L1 · sin(art) y la curvatura de marcha es phi1'/|v|
    art_des = max(-MAX_ART, min(MAX_ART, -math.asin(max(-1.0, min(1.0, L1 * kappa)))))
    art = _wrap(s.phi0 - s.phi1)
    # lazo interno, por metro recorrido hacia atrás:
    # d(art)/ds = -(tan(steer)/LW) + sin(art)/L1  (con ds = |v|dt) ; se impone k_art·(art_des - art)
    tan_steer = LW * (math.sin(art) / L1 - k_art * (art_des - art))
    return max(-max_steer, min(max_steer, math.atan(tan_steer)))


def drive(s: State, v: float, controller: Callable[[State], float], until: Callable[[State], bool],
          dt: float = 0.02, steer_rate: float = math.radians(25), max_dist: float = 400.0) -> list[State]:
    """Integra la maniobra hasta que `until` se cumple. El volante gira a lo sumo `steer_rate` rad por metro."""
    out = [s]
    travelled = 0.0
    while not until(s):
        want = controller(s)
        lim = steer_rate * abs(v) * dt
        steer = s.steer + max(-lim, min(lim, want - s.steer))
        s = step(s, v, steer, dt)
        out.append(s)
        travelled += abs(v) * dt
        if travelled > max_dist:
            raise RuntimeError("la maniobra no terminó dentro de max_dist")
    return out
