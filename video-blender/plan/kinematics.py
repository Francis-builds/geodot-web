"""Cinemática tractor + semirremolque (modelo no holonómico con perno rey).

Convenciones (las mismas del spike y de route.json):
- R: trasera del tráiler a nivel del piso, en metros (plano XY del mundo).
- phi1 / phi0: rumbo del tráiler / tractor (dirección de avance, radianes, desde +x).
- steer: ángulo del volante, positivo = gira a la izquierda (CCW).
"""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

Poly = list[np.ndarray]

KP = 14.95          # trasera del tráiler -> perno rey
TR_AXLE = 2.2       # trasera -> centro del tándem del tráiler
L1 = KP - TR_AXLE   # perno rey -> eje del tráiler (12.75)
A = 0.15            # quinta rueda adelante del centro del tándem del tractor
LW = 6.4            # distancia entre ejes del tractor

# footprints: (desde, hasta) a lo largo del eje de avance, semiancho
TRAILER = (0.0, 16.15, 1.36)   # desde la trasera del tráiler
TRACTOR = (-1.5, 7.63, 1.30)   # desde el perno rey
MIRRORS = (4.9, 5.1, 1.70)     # desde el perno rey


@dataclass(frozen=True)
class State:
    R: np.ndarray
    phi1: float
    phi0: float
    steer: float

    @property
    def kingpin(self) -> np.ndarray:
        return self.R + KP * u(self.phi1)

    @property
    def tractor_axle(self) -> np.ndarray:
        """Centro del tándem del tractor (punto que siguen los controladores)."""
        return self.kingpin - A * u(self.phi0)


def u(phi: float) -> np.ndarray:
    return np.array([math.cos(phi), math.sin(phi)])


def n(phi: float) -> np.ndarray:
    return np.array([-math.sin(phi), math.cos(phi)])


def step(s: State, v: float, steer: float, dt: float) -> State:
    """Avanza dt segundos a velocidad v (negativa = marcha atrás) con el volante en `steer`."""
    dphi0 = v / LW * math.tan(steer)
    kdot = v * u(s.phi0) + A * dphi0 * n(s.phi0)
    dphi1 = float(kdot @ n(s.phi1)) / L1
    p0 = s.tractor_axle + v * u(s.phi0) * dt
    phi0 = s.phi0 + dphi0 * dt
    phi1 = s.phi1 + dphi1 * dt
    kingpin = p0 + A * u(phi0)
    return State(kingpin - KP * u(phi1), phi1, phi0, steer)


def _rect(origin: np.ndarray, phi: float, spec: tuple[float, float, float]) -> Poly:
    a0, a1, hw = spec
    uu, nn = u(phi), n(phi)
    return [origin + uu * a + nn * sgn * hw for a, sgn in ((a0, -1), (a1, -1), (a1, 1), (a0, 1))]


def rig_rects(s: State) -> list[Poly]:
    k = s.kingpin
    return [_rect(s.R, s.phi1, TRAILER), _rect(k, s.phi0, TRACTOR), _rect(k, s.phi0, MIRRORS)]


def sat_gap(p: Poly, q: Poly) -> float:
    """Separación por el teorema del eje separador: > 0 no se tocan, < 0 se solapan."""
    best = -math.inf
    for poly in (p, q):
        for i in range(len(poly)):
            e = poly[(i + 1) % len(poly)] - poly[i]
            ax = np.array([-e[1], e[0]]) / np.linalg.norm(e)
            pp = [float(ax @ v) for v in p]
            qq = [float(ax @ v) for v in q]
            best = max(best, min(qq) - max(pp), min(pp) - max(qq))
    return best


def clearance(s: State, obst: list[Poly]) -> float:
    return min(sat_gap(a, b) for a in rig_rects(s) for b in obst)
