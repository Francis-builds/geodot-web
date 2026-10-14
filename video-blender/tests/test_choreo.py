"""Coreografía de la fase 2 v2: un solo autoelevador tráiler → rack (casi siempre hacia adelante),
corte de escena y picker con carrito que saca una caja de OTRO pallet."""
import math

import numpy as np
import pytest

from plan.choreo import OWNER, V_FL, choreograph, lift_obstacles, rack_obstacles
from plan.handling import FORKLIFT, Lift, body_rect
from plan.kinematics import sat_gap
from plan.site import PICK_SLOT, PICK_SLOT_B, RackLayout, slot_center

START = 384


@pytest.fixture(scope="module")
def ch():
    return choreograph(START)


def test_single_forklift_no_reach_truck(ch):
    tr, _ = ch
    assert "reach" not in tr
    owners = {int(r[4]) for r in tr["pallet_A"]}
    assert owners == {OWNER["trailer"], OWNER["forklift"], OWNER["rack"]}


def test_pallet_never_teleports(ch):
    tr, _ = ch
    p = np.array(tr["pallet_A"])[:, :3]
    assert np.max(np.linalg.norm(np.diff(p, axis=0), axis=1)) <= V_FL + 0.01
    owners = np.array(tr["pallet_A"])[:, 4]
    for i in np.where(np.diff(owners) != 0)[0]:
        assert np.linalg.norm(p[i + 1] - p[i]) <= 0.05


def test_forklift_clears_walls_and_racks(ch):
    tr, _ = ch
    obst = lift_obstacles()
    worst = min(min(sat_gap(body_rect(Lift(np.array(f[:2]), f[3], f[2]), FORKLIFT), o) for o in obst)
                for f in tr["forklift"])
    assert worst > 0.10, worst


def test_forklift_mostly_forward(ch):
    """Solo dos marchas atrás cortas: salir del tráiler y salir de la posición del rack."""
    tr, _ = ch
    f = np.array(tr["forklift"])
    heading = np.stack([np.cos(f[:, 3]), np.sin(f[:, 3])], axis=1)
    step = np.diff(f[:, :2], axis=0)
    signed = np.einsum("ij,ij->i", step, heading[:-1])
    back = signed < -1e-4
    segments = int(np.sum(back[1:] & ~back[:-1]) + (1 if back[0] else 0))
    assert segments <= 2, segments
    assert -signed[back].sum() <= 7.0, -signed[back].sum()


def test_pallet_ends_in_slot(ch):
    tr, _ = ch
    sx, sy, sz = slot_center(RackLayout(), PICK_SLOT)
    end = tr["pallet_A"][-1]
    assert abs(end[0] - sx) < 0.05 and abs(end[1] - sy) < 0.05 and abs(end[2] - sz) < 0.02


def test_picker_and_cart_clear_racks(ch):
    tr, _ = ch
    racks = rack_obstacles()
    worst = 1e9
    for pk, ct in zip(tr["picker"], tr["cart"]):
        c = np.array(pk[:2])
        for o in racks:  # círculo r=0,3 contra rectángulo alineado
            xs, ys = [p[0] for p in o], [p[1] for p in o]
            dx = max(min(xs) - c[0], 0, c[0] - max(xs))
            dy = max(min(ys) - c[1], 0, c[1] - max(ys))
            worst = min(worst, math.hypot(dx, dy) - 0.3)
        cart = [np.array(ct[:2]) + np.array([math.cos(ct[3]), math.sin(ct[3])]) * a
                + np.array([-math.sin(ct[3]), math.cos(ct[3])]) * s * 0.32
                for a, s in ((-0.5, -1), (0.5, -1), (0.5, 1), (-0.5, 1))]
        worst = min(worst, min(sat_gap(cart, o) for o in racks))
    assert worst > 0.10, worst


def test_box_goes_from_other_pallet_to_cart(ch):
    tr, cues = ch
    bx, by, bz = slot_center(RackLayout(), PICK_SLOT_B)
    assert PICK_SLOT_B != PICK_SLOT
    box = np.array(tr["box_B"])
    assert np.linalg.norm(box[0, :2] - [bx, by]) < 0.6             # arranca sobre el otro pallet
    end_cart = np.array(tr["cart"][-1][:2])
    assert np.linalg.norm(box[-1, :2] - end_cart) < 0.4              # termina en el carrito
    assert np.max(np.linalg.norm(np.diff(box[:, :3], axis=0), axis=1)) <= 0.15


def test_cues_order_and_budget(ch):
    tr, cues = ch
    keys = ("doorOpen", "unloadStart", "scanA", "slotDone", "sceneCut", "pickStart", "boxInCart")
    assert all(cues[a] < cues[b] for a, b in zip(keys, keys[1:])), cues
    n = len(tr["forklift"])
    assert all(len(v) == n for v in tr.values())
    assert (START + n) / 24 <= 31.0
