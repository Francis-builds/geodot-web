import json

import numpy as np

from plan.route import FPS, plan_route, write_route
from plan.site import HERO_DOCK, Y_DOCK, dock_x


def test_timeline_length_and_cues():
    t = plan_route()
    assert 300 <= len(t.frames) <= 420
    assert t.cues["scanStart"] == 72 and t.cues["scanEnd"] == 120 and t.cues["barrierUp"] == 104
    assert t.cues["roofStart"] == 96 and t.cues["roofEnd"] == 144
    assert 120 < t.cues["reverseStart"] < t.cues["docked"] < len(t.frames)


def test_stationary_at_barrier_during_scan():
    t = plan_route()
    xs = [t.frames[i].R for i in range(60, 104)]
    assert max(np.linalg.norm(x - xs[0]) for x in xs) < 1e-6


def test_no_teleport_between_frames():
    t = plan_route()
    jumps = [np.linalg.norm(b.R - a.R) for a, b in zip(t.frames, t.frames[1:])]
    assert max(jumps) < 0.6


def test_clearance_and_final_pose():
    t = plan_route()
    assert t.min_clearance > 0.10
    end = t.frames[-1]
    assert abs(end.R[0] - dock_x(HERO_DOCK)) < 0.10 and abs(end.R[1] - Y_DOCK) < 0.10


def test_route_json_roundtrip(tmp_path):
    t = plan_route()
    p = tmp_path / "route.json"; write_route(t, p)
    d = json.loads(p.read_text())
    assert d["fps"] == FPS == 24 and len(d["frames"]) == len(t.frames)
    assert {"R", "yaw", "art", "steer"} <= d["frames"][0].keys()
    assert d["cues"]["docked"] == t.cues["docked"] and d["report"]["minClearance"] > 0.10


def test_phase2_chains_after_docking(tmp_path):
    t = plan_route(phase=2)
    n = len(t.frames)
    start = t.cues["phase2Start"]
    assert t.cues["docked"] < start <= t.cues["docked"] + 8
    assert all(len(v) == n - start for v in t.tracks.values())
    assert n / 24 <= 31.0
    end = t.frames[-1]   # el camión sigue acoplado durante la fase 2
    assert abs(end.R[0] - dock_x(HERO_DOCK)) < 0.10 and abs(end.R[1] - Y_DOCK) < 0.10
    p = tmp_path / "route.json"; write_route(t, p)
    d = json.loads(p.read_text())
    assert d["tracks"]["pallet_A"][-1][4] == 4 and d["cues"]["relevo"] < n
