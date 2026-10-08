"""Coreografía de la fase 2 (recepción + relevo): física, un dueño por pallet y orden de cues."""
import math

import numpy as np
import pytest

from plan.choreo import OWNER, V_FL, V_RC, choreograph, lift_obstacles
from plan.handling import FORKLIFT, REACH, Lift, body_rect
from plan.kinematics import sat_gap
from plan.site import PICK_SLOT, RackLayout, slot_center

START = 384


@pytest.fixture(scope="module")
def ch():
    return choreograph(START)


def test_pallet_never_teleports(ch):
    tr, _ = ch
    p = np.array(tr["pallet_A"])[:, :3]
    assert np.max(np.linalg.norm(np.diff(p, axis=0), axis=1)) <= max(V_FL, V_RC) + 0.01  # nunca más rápido que su dueño
    owners = np.array(tr["pallet_A"])[:, 4]
    for i in np.where(np.diff(owners) != 0)[0]:  # en el traspaso no hay salto
        assert np.linalg.norm(p[i + 1] - p[i]) <= 0.05


def test_pallet_has_one_owner_per_frame(ch):
    tr, _ = ch
    owners = [int(r[4]) for r in tr["pallet_A"]]
    assert set(owners) <= set(OWNER.values())
    assert owners[0] == OWNER["trailer"] and owners[-1] == OWNER["rack"]
    for key in ("forklift", "reach"):
        q = np.array(tr[key])[:, :2]
        for i in range(1, len(owners)):
            if owners[i] != owners[i - 1] and OWNER[key] in (owners[i], owners[i - 1]):
                assert np.linalg.norm(q[i] - q[i - 1]) < 0.05   # el equipo está quieto al tomar/soltar


def test_lifts_clear_walls_racks_and_each_other(ch):
    tr, _ = ch
    obst = lift_obstacles()
    worst = 1e9
    for fl, rc in zip(tr["forklift"][::2], tr["reach"][::2]):
        a = body_rect(Lift(np.array(fl[:2]), fl[3], fl[2]), FORKLIFT)
        b = body_rect(Lift(np.array(rc[:2]), rc[3], rc[2]), REACH)
        worst = min(worst, min(sat_gap(a, o) for o in obst), min(sat_gap(b, o) for o in obst), sat_gap(a, b))
    assert worst > 0.10, worst


def test_load_clears_rack_until_in_position(ch):
    """Con la carga dentro de la proyección del rack, el pallet va por encima de su nivel hasta llegar."""
    tr, cues = ch
    sx, sy, sz = slot_center(RackLayout(), PICK_SLOT)
    face = sx - 0.6
    for i, r in enumerate(tr["pallet_A"]):
        if int(r[4]) == OWNER["reach"] and r[0] > face and i < cues["slotDone"] - START - 8:
            assert r[2] >= sz + 0.08


def test_pallet_ends_in_slot(ch):
    tr, _ = ch
    sx, sy, sz = slot_center(RackLayout(), PICK_SLOT)
    end = tr["pallet_A"][-1]
    assert abs(end[0] - sx) < 0.05 and abs(end[1] - sy) < 0.05 and abs(end[2] - sz) < 0.02


def test_cues_order_and_budget(ch):
    tr, cues = ch
    keys = ("doorOpen", "unloadStart", "scanA", "reachStart", "slotDone", "pickerArrive", "relevo")
    assert all(cues[a] < cues[b] for a, b in zip(keys, keys[1:]))
    n = len(tr["forklift"])
    assert all(len(v) == n for v in tr.values())
    assert (START + n) / 24 <= 31.0
