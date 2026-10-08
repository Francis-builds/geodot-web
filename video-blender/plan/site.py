"""Layout del sitio: ÚNICA fuente para el planificador y para el kit de Blender."""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from plan.kinematics import Poly, State, rig_rects

DOCK = 4.3
HERO_DOCK = 11
Y_DOCK = -0.35          # trasera del tráiler acoplado
Y_YARD = -78.0          # trasera de la fila del patio (miran hacia el andén)
Y_LANE = -39.0          # eje del carril de circulación
WALL_Y = 0.4            # fachada de andenes
DOCKS = range(1, 25)

OCCUPIED: dict[int, bool] = {3: True, 4: False, 6: True, 7: True, 9: False, 10: True, 12: True,
                             13: False, 15: True, 17: True, 18: False, 20: True, 22: True, 23: False}
YARD_X: tuple[float, ...] = (-37.85, -29.25, -24.95, -11.95, -3.35, 9.55, 18.15, 31.05, 39.65, 52.55)
YARD_TRACTOR = {k: k % 3 == 0 for k in range(len(YARD_X))}


def dock_x(i: int) -> float:
    return (i - 8.5) * DOCK


@dataclass(frozen=True)
class Rect:
    x0: float
    y0: float
    x1: float
    y1: float

    def poly(self) -> Poly:
        return [np.array(p, dtype=float) for p in
                ((self.x0, self.y0), (self.x1, self.y0), (self.x1, self.y1), (self.x0, self.y1))]


@dataclass(frozen=True)
class Gate:
    x: float
    y: float
    lane_heading: float     # rumbo de entrada (hacia -x)
    booth: Rect
    barrier: Rect           # brazo de la pluma bajo, cruzando el carril


_GX = dock_x(14)  # caseta de control de patio frente al andén 14 (ver ledger, Task 3)
GATE = Gate(x=_GX, y=Y_LANE, lane_heading=math.pi,
            booth=Rect(_GX - 1.5, Y_LANE - 5.4, _GX + 1.5, Y_LANE - 2.9),
            barrier=Rect(_GX - 0.08, Y_LANE - 2.6, _GX + 0.08, Y_LANE + 2.6))
BUILDING = Rect(-71.0, WALL_Y, 99.0, 30.4)


def _parked(x: float, y: float, phi: float, with_tractor: bool) -> list[Poly]:
    rs = rig_rects(State(np.array([x, y]), phi, phi, 0.0))
    return rs if with_tractor else rs[:1]


def obstacles(include_gate: bool = True) -> list[Poly]:
    obs: list[Poly] = []
    for i, tractor in OCCUPIED.items():
        obs += _parked(dock_x(i), Y_DOCK, -math.pi / 2, tractor)
    for k, x in enumerate(YARD_X):
        obs += _parked(x, Y_YARD, math.pi / 2, YARD_TRACTOR[k])
    obs.append(BUILDING.poly())
    obs.append(GATE.booth.poly())
    if include_gate:
        obs.append(GATE.barrier.poly())
    return obs
