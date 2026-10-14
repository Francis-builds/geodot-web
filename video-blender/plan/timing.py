"""Reparto del tiempo por distancia recorrida (sin interpolar poses)."""
from __future__ import annotations

import math

import numpy as np


def velocity_profile(dist: float, vmax: float, ramp: int) -> np.ndarray:
    """Velocidad por frame (m/frame) con rampas de coseno, que suma exactamente `dist`."""
    n = math.ceil(dist / vmax) + ramp
    k = np.arange(n) + 0.5
    v = np.ones(n)
    up = k < ramp
    v[up] = 0.5 - 0.5 * np.cos(math.pi * k[up] / ramp)
    down = k > n - ramp
    v[down] = 0.5 - 0.5 * np.cos(math.pi * (n - k[down]) / ramp)
    return v * dist / v.sum()


def sample(dense: list[State], cum: np.ndarray, distances: np.ndarray) -> list[State]:
    """Estado integrado más cercano a cada distancia (sin interpolar poses)."""
    idx = np.clip(np.searchsorted(cum, distances), 0, len(dense) - 1)
    return [dense[i] for i in idx]


TURN_LEVER = 1.3   # m: un autoelevador que gira sobre su eje mueve la carga ~1,3 m por radián


def cumulative(states: list) -> np.ndarray:
    """Distancia "efectiva" recorrida. En los autoelevadores suma el giro × brazo de la carga:
    con dirección trasera pueden girar fuerte casi sin avanzar y la carga no puede saltar."""
    def step(a, b) -> float:
        d = float(np.linalg.norm(_pt(b) - _pt(a)))
        if hasattr(a, "yaw") and hasattr(b, "yaw"):
            d += TURN_LEVER * abs((b.yaw - a.yaw + math.pi) % math.tau - math.pi)
        return d
    return np.cumsum([0.0] + [step(a, b) for a, b in zip(states, states[1:])])




def _pt(s) -> np.ndarray:
    """Punto de referencia: eje del tractor (camión) o eje delantero (autoelevador)."""
    return s.tractor_axle if hasattr(s, "tractor_axle") else s.p


def profile_frames(dense: list, vmax: float, ramp: int) -> list:
    """Muestrea una integración densa con rampas de aceleración/frenada a ≤ vmax m/frame."""
    cum = cumulative(dense)
    if cum[-1] < 1e-6:
        return [dense[-1]]
    return sample(dense, cum, np.cumsum(velocity_profile(cum[-1], vmax, ramp)))
