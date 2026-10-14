import math

from kit.nla import MIXAMO_YAW_OFFSET, strip_repeat


def test_strip_repeat_covers_whole_film():
    assert strip_repeat(30.0, 745) == 25          # 25 × 30 = 750 ≥ 745
    assert strip_repeat(30.0, 30) == 1
    assert strip_repeat(0.0, 745) == 1            # acción vacía: no dividir por cero


def test_mixamo_faces_plus_x():
    # Mixamo importa mirando a −Y; el plan usa +X como frente: hay que girar +90°
    assert math.isclose(MIXAMO_YAW_OFFSET, math.pi / 2)
