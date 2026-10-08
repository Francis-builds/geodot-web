"""Helpers compartidos por los tests del planificador."""
import math

import numpy as np
import pytest

from plan.kinematics import State
from plan.site import Y_DOCK, dock_x


def docked_state(i: int) -> State:
    """Equipo acoplado en el andén i: trasera en el andén, mirando al patio (-y)."""
    phi = -math.pi / 2
    return State(np.array([dock_x(i), Y_DOCK]), phi1=phi, phi0=phi, steer=0.0)


def rect_at(cx: float, cy: float, w: float, h: float) -> list[np.ndarray]:
    return [np.array(p, dtype=float) for p in
            ((cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx + w / 2, cy + h / 2), (cx - w / 2, cy + h / 2))]


@pytest.fixture
def helpers():
    return {"docked_state": docked_state, "rect_at": rect_at}


# ---- helpers de los controladores (Task 2) ----
from plan.kinematics import KP, TRACTOR  # noqa: E402
from plan.site import GATE, Y_LANE  # noqa: E402

# carril de circulación que sigue el eje del tractor: desde antes del acceso hasta el andén 5
AISLE_PATH = np.array([[GATE.x + 40.0, Y_LANE], [dock_x(5), Y_LANE]])


def _lane_state(rear_x: float, heading: float = math.pi) -> State:
    return State(np.array([rear_x, Y_LANE]), phi1=heading, phi0=heading, steer=0.0)


def gate_stop_state() -> State:
    """Camión detenido en la pluma, entrando hacia -x, con el paragolpes a 1 m del brazo."""
    kingpin_x = GATE.x + 1.0 + TRACTOR[1]
    return _lane_state(kingpin_x + KP)


def aisle_stop_state(x: float) -> State:
    """Camión detenido en el carril mirando hacia -x, con la trasera del tráiler en x."""
    return _lane_state(x)


def lateral_error(s: State, path: np.ndarray) -> float:
    """Distancia del eje del tractor a la polilínea."""
    p = s.tractor_axle
    best = math.inf
    for a, b in zip(path[:-1], path[1:]):
        ab = b - a
        t = max(0.0, min(1.0, float((p - a) @ ab) / float(ab @ ab)))
        best = min(best, float(np.linalg.norm(p - (a + t * ab))))
    return best
