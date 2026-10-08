"""Ruta completa del camión protagonista y su línea de tiempo → route.json.

Acceso (frena en la pluma) → avance por el carril → frena pasado el andén →
retroceso al andén con el control en cascada. Cada pose es un estado exacto de
la integración; el tiempo se reparte por distancia recorrida con perfiles de
velocidad suaves (el ritmo se comprime, la geometría no).
"""
from __future__ import annotations

import json
import math
import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from plan.controllers import drive, pure_pursuit_steer, reverse_dock_steer
from plan.kinematics import KP, TRACTOR, State, clearance
from plan.site import GATE, HERO_DOCK, Y_DOCK, Y_LANE, dock_x, obstacles

FPS = 24
CUES = {"scanStart": 72, "scanEnd": 120, "barrierUp": 104, "roofStart": 96, "roofEnd": 144}
BARRIER_CLEAR = CUES["barrierUp"] + 12   # la pluma termina de subir
APPROACH_DIST = 15.0                     # metros de frenada hasta la pluma (frames 0-60)
STOP_FRAME = 60
DEPART_FRAME = CUES["scanEnd"]
REVERSE_OFFSET = -18.0                   # trasera del tráiler respecto del andén al frenar
V_FWD, V_REV = 0.55, 0.50                # m/frame (≈48 y ≈43 km/h, tiempo comprimido)
RAMP = 18                                # frames de aceleración / frenada
PAUSE, HOLD = 12, 18                     # quieto antes de retroceder / acoplado al final
LANE = np.array([[GATE.x + 60.0, Y_LANE], [dock_x(1), Y_LANE]])


@dataclass
class Timeline:
    frames: list[State]
    cues: dict[str, int]
    min_clearance: float
    max_art: float


def _wrap(a: float) -> float:
    return (a + math.pi) % math.tau - math.pi


def _lane_state(rear_x: float) -> State:
    return State(np.array([rear_x, Y_LANE]), math.pi, math.pi, 0.0)


def _velocity_profile(dist: float, vmax: float, ramp: int) -> np.ndarray:
    """Velocidad por frame (m/frame) con rampas de coseno, que suma exactamente `dist`."""
    n = math.ceil(dist / vmax) + ramp
    k = np.arange(n) + 0.5
    v = np.ones(n)
    up = k < ramp
    v[up] = 0.5 - 0.5 * np.cos(math.pi * k[up] / ramp)
    down = k > n - ramp
    v[down] = 0.5 - 0.5 * np.cos(math.pi * (n - k[down]) / ramp)
    return v * dist / v.sum()


def _sample(dense: list[State], cum: np.ndarray, distances: np.ndarray) -> list[State]:
    """Estado integrado más cercano a cada distancia (sin interpolar poses)."""
    idx = np.clip(np.searchsorted(cum, distances), 0, len(dense) - 1)
    return [dense[i] for i in idx]


def _cumulative(states: list[State]) -> np.ndarray:
    steps = [0.0] + [float(np.linalg.norm(b.tractor_axle - a.tractor_axle)) for a, b in zip(states, states[1:])]
    return np.cumsum(steps)


def plan_route(fps: int = FPS) -> Timeline:
    assert fps == FPS, "la línea de tiempo está fijada a 24 fps"
    gate_stop = _lane_state(GATE.x + 1.0 + TRACTOR[1] + KP)
    follow = lambda s: pure_pursuit_steer(s, LANE)  # noqa: E731

    # 1) frenada hasta la pluma (recta sobre el carril)
    appr = drive(_lane_state(gate_stop.R[0] + APPROACH_DIST), 1.0, follow,
                 until=lambda s: s.R[0] <= gate_stop.R[0])
    cum = _cumulative(appr)
    f = np.arange(STOP_FRAME + 1) / STOP_FRAME
    frames = _sample(appr, cum, cum[-1] * (1 - (1 - f) ** 2))
    stop = frames[-1]
    frames += [stop] * (DEPART_FRAME - STOP_FRAME - 1)

    # 2) avance por el carril hasta pasar el andén
    target_x = dock_x(HERO_DOCK) + REVERSE_OFFSET
    fwd = drive(stop, 1.0, follow, until=lambda s: s.R[0] <= target_x)
    cum = _cumulative(fwd)
    frames += _sample(fwd, cum, np.cumsum(_velocity_profile(cum[-1], V_FWD, RAMP)))
    frames += [frames[-1]] * PAUSE

    # 3) retroceso al andén
    line = (np.array([dock_x(HERO_DOCK), Y_DOCK]), np.array([dock_x(HERO_DOCK), Y_DOCK - 40.0]))
    rev = drive(frames[-1], -1.0, lambda s: reverse_dock_steer(s, line),
                until=lambda s: s.R[1] >= Y_DOCK - 0.01)
    cum = _cumulative(rev)
    reverse_start = len(frames)
    frames += _sample(rev, cum, np.cumsum(_velocity_profile(cum[-1], V_REV, RAMP)))
    docked = len(frames) - 1
    frames += [frames[-1]] * HOLD

    obs_gate, obs_open = obstacles(include_gate=True), obstacles(include_gate=False)
    min_clr = min(clearance(s, obs_gate if i < BARRIER_CLEAR else obs_open) for i, s in enumerate(frames))
    max_art = max(abs(_wrap(s.phi0 - s.phi1)) for s in frames)
    cues = dict(CUES, reverseStart=reverse_start, docked=docked)
    return Timeline(frames, cues, min_clr, max_art)


def write_route(t: Timeline, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = {
        "fps": FPS,
        "frames": [{"R": [round(float(s.R[0]), 5), round(float(s.R[1]), 5)],
                    "yaw": round(s.phi1 + math.pi / 2, 6), "art": round(_wrap(s.phi0 - s.phi1), 6),
                    "steer": round(s.steer, 6)} for s in t.frames],
        "cues": t.cues,
        "report": {"minClearance": round(t.min_clearance, 4), "maxArt": round(t.max_art, 4)},
    }
    path.write_text(json.dumps(data))


if __name__ == "__main__":
    t = plan_route()
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "out/route.json")
    write_route(t, out)
    print(f"frames {len(t.frames)} ({len(t.frames) / FPS:.1f} s) · cues {t.cues}")
    print(f"holgura mínima {t.min_clearance:.2f} m · articulación máx {math.degrees(t.max_art):.0f}° → {out}")
