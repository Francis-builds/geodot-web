import math

from plan.picker_pose import JOINTS, PICK_PHASES, STRIDE, Smoother, pose_at, walk_pose


def hand(p):
    """Mano (x adelante, z alto) con las medidas del maniquí: hombro 0,56 sobre la cadera, brazo 0,30 + 0,28."""
    sp = p["spine"]
    sx, sz = 0.56 * math.sin(sp), p["pelvis"] + 0.56 * math.cos(sp)
    a1 = sp + p["shoulderR"]
    a2 = a1 + p["elbowR"]
    return sx - 0.30 * math.sin(a1) - 0.28 * math.sin(a2), sz - 0.30 * math.cos(a1) - 0.28 * math.cos(a2)


def near(a, b, tol=0.1):
    return math.dist(a, b) < tol


def test_push_keeps_hands_on_cart_handle():
    for w in (0.0, 0.3, 0.7, 1.1):
        p = walk_pose(w)
        assert p["shoulderL"] == p["shoulderR"]                     # sin balanceo de brazos
        assert near(hand(p), (0.44, 1.0)), hand(p)                  # manubrio del carrito


def test_walk_cycle_alternates_legs_and_bobs():
    a, b = walk_pose(0.35), walk_pose(0.35 + STRIDE / 2)   # medio ciclo después
    assert math.isclose(a["hipL"], -a["hipR"]) and math.isclose(a["hipL"], b["hipR"], abs_tol=1e-9)
    assert min(walk_pose(x / 50)["pelvis"] for x in range(70)) < 0.93


def test_pickup_reaches_then_carries():
    turn, reach, back, place = PICK_PHASES
    mid = pose_at(3, turn + reach // 2 - 1, 0, 0)
    assert mid["spine"] > math.radians(18) and hand(mid)[0] > 0.6       # se estira hacia el rack
    carry = pose_at(3, turn + reach + 1, 0, 0)
    assert near(hand(carry), (0.45, 1.15)), hand(carry)                 # donde la coreografía lleva la caja
    placed = pose_at(3, sum(PICK_PHASES) - 1, 0, 0)
    assert hand(placed)[1] < 1.05                                        # baja hasta la tapa del carrito


def test_no_pops_across_clip_changes():
    """Ningún cambio de clip mueve una articulación más rápido que la propia caminata."""
    sm = Smoother()
    clips = [1] * 30 + [3] * sum(PICK_PHASES) + [1] * 30
    walked, prev, k, last = 0.0, None, 0, None
    steady, rest = 0.0, 0.0
    for f, c in enumerate(clips):
        k = k + 1 if c == last else 0
        last = c
        walked += 0.12 if c == 1 else 0.0          # V_WALK
        p = sm(pose_at(c, k, walked, f))
        if prev:
            delta = max(abs(p[j] - prev[j]) for j in JOINTS)
            if 10 <= f < 30:
                steady = max(steady, delta)
            elif f >= 30:
                rest = max(rest, delta)
        prev = p
    assert rest <= steady * 1.1, (math.degrees(rest), math.degrees(steady))
