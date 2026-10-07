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
