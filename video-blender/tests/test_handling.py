import math

import numpy as np

from plan.handling import FORKLIFT, REACH, Lift, follow, lift_rect, lift_step


def test_rear_steer_turns_opposite_to_front_steer():
    s = Lift(np.array([0.0, 0.0]), 0.0, 0.0)
    for _ in range(100):
        s = lift_step(s, FORKLIFT, 1.0, math.radians(20), 0.02)
    assert s.yaw < 0


def test_follow_reaches_end_of_L_path_both_directions():
    path = np.array([[0.0, 0.0], [8.0, 0.0], [8.0, 6.0]])
    fwd = follow(Lift(np.array([0.0, 0.0]), 0.0, 0.0), FORKLIFT, path, 1.0, until=lambda s: s.p[1] > 5.9)
    assert np.linalg.norm(fwd[-1].p - path[-1]) < 0.3
    back = np.array([[0.0, 0.0], [-8.0, 0.0], [-8.0, 6.0]])
    rev = follow(Lift(np.array([0.0, 0.0]), 0.0, 0.0), REACH, back, -1.0, until=lambda s: s.p[1] > 5.9)
    assert np.linalg.norm(rev[-1].p - back[-1]) < 0.3


def test_lift_rect_spans_front_and_rear():
    r = lift_rect(Lift(np.array([0.0, 0.0]), 0.0, 0.0), FORKLIFT)
    xs = [float(p[0]) for p in r]
    ys = [float(p[1]) for p in r]
    assert min(xs) == FORKLIFT.rear and max(xs) == FORKLIFT.front
    assert max(ys) == FORKLIFT.half_w
