import math

from plan.camera_path import Shot, shot_keys


def test_follow_lags_and_converges():
    track = [(0.0, 0.0)] * 5 + [(10.0, 0.0)] * 60
    keys = shot_keys(track, 100, Shot((20, 14), ((14, 215), (20, 232))), step=1)
    xs = [k[1][0] for k in keys]
    assert xs[5] < 3.0                       # no salta con el sujeto
    assert abs(xs[-1] - 10.0) < 0.05         # pero lo alcanza
    assert all(b >= a for a, b in zip(xs, xs[1:]))


def test_push_in_and_orbit_eased():
    keys = shot_keys([(0.0, 0.0)] * 41, 1, Shot((20, 14), ((14, 215), (20, 232))))
    assert keys[0][0] == 1 and keys[-1][0] == 41
    assert keys[0][2] == 20 and math.isclose(keys[-1][2], 14)
    assert keys[-1][3] == (20, 232)
    scales = [k[2] for k in keys]
    d = [a - b for a, b in zip(scales, scales[1:])]
    assert d[0] < d[len(d) // 2] and d[-1] < d[len(d) // 2]   # arranca y frena suave
