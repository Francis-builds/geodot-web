import math

import numpy as np
import pytest

from plan.kinematics import State, clearance, sat_gap, step
from plan.site import HERO_DOCK, obstacles
from tests.conftest import docked_state, rect_at


def test_docked_rig_clears_neighbors():
    s = docked_state(HERO_DOCK)
    assert clearance(s, obstacles()) > 0.10


def test_trailer_aligns_when_driving_straight():
    s = State(np.array([0.0, 0.0]), phi1=0.3, phi0=0.0, steer=0.0)
    for _ in range(int(60 / 0.02)):
        s = step(s, v=1.0, steer=0.0, dt=0.02)
    assert abs(s.phi0 - s.phi1) < math.radians(0.5)


def test_reverse_straight_amplifies_hitch_angle():
    s = State(np.array([0.0, 0.0]), phi1=0.05, phi0=0.0, steer=0.0)
    for _ in range(int(10 / 0.02)):
        s = step(s, v=-1.0, steer=0.0, dt=0.02)
    assert abs(s.phi0 - s.phi1) > 0.05


def test_sat_gap_sign():
    a = rect_at(0, 0, 2, 2); b = rect_at(3, 0, 2, 2); c = rect_at(1, 0, 2, 2)
    assert sat_gap(a, b) == pytest.approx(1.0)
    assert sat_gap(a, c) < 0
