"""Helpers puros (sin bpy) para las tiras NLA de los clips de Mixamo."""
from __future__ import annotations

import math

# Mixamo exporta los personajes mirando a −Y; el plan y el maniquí usan +X como frente.
MIXAMO_YAW_OFFSET = math.pi / 2


def strip_repeat(action_len: float, total_frames: int) -> int:
    """Repeticiones de un clip para cubrir toda la película (si no, el clip queda congelado)."""
    if action_len <= 0:
        return 1
    return max(1, math.ceil(total_frames / action_len))
