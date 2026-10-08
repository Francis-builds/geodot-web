import math

import numpy as np

from plan.controllers import drive, pure_pursuit_steer, reverse_dock_steer
from plan.kinematics import clearance
from plan.site import Y_DOCK, dock_x, obstacles
from tests.conftest import AISLE_PATH, aisle_stop_state, gate_stop_state, lateral_error


def wrap(a: float) -> float:
    return (a + math.pi) % math.tau - math.pi


def test_pure_pursuit_follows_aisle_and_turns():
    states = drive(gate_stop_state(), 4.0, lambda s: pure_pursuit_steer(s, AISLE_PATH),
                   until=lambda s: s.R[0] < dock_x(13))
    assert max(abs(lateral_error(s, AISLE_PATH)) for s in states[-50:]) < 0.3


def test_reverse_into_dock_11_from_aisle():
    start = aisle_stop_state(x=dock_x(11) - 24.0)
    line = (np.array([dock_x(11), Y_DOCK]), np.array([dock_x(11), Y_DOCK - 40.0]))
    states = drive(start, -1.5, lambda s: reverse_dock_steer(s, line),
                   until=lambda s: s.R[1] >= Y_DOCK - 0.01)
    end = states[-1]
    assert abs(end.R[0] - dock_x(11)) < 0.10
    assert abs(wrap(end.phi1 - (-math.pi / 2))) < math.radians(1.0)
    assert abs(wrap(end.phi0 - end.phi1)) < math.radians(3.0)
    assert min(clearance(s, obstacles(include_gate=False)) for s in states[::5]) > 0.10
    assert max(abs(wrap(s.phi0 - s.phi1)) for s in states) < math.radians(60)
