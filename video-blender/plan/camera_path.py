"""Movimiento de cámara dentro de un plano (Python puro): seguimiento amortiguado + push-in + órbita lenta.

La cámara no se pega al sujeto: lo persigue con un filtro de primer orden (inercia de un operador),
y a lo largo del plano interpola escala y orientación con easing, así ningún plano queda estático.
"""
from __future__ import annotations

from dataclasses import dataclass

Vec2 = tuple[float, float]


@dataclass(frozen=True)
class Shot:
    scale: tuple[float, float]               # ortho_scale al inicio / al final (push-in si baja)
    rot: tuple[Vec2, Vec2]                   # (inclinación, azimut) al inicio / al final, en grados
    offset: Vec2 = (0.0, 0.0)                # corrimiento fijo del objetivo (m)
    follow: float = 0.12                     # fracción por frame con la que alcanza al sujeto (1 = pegado)


def ease(t: float) -> float:
    t = min(1.0, max(0.0, t))
    return t * t * t * (t * (6 * t - 15) + 10)   # smootherstep: arranca y frena sin tirón


def shot_keys(track: list[Vec2], frame0: int, shot: Shot, step: int = 4) -> list[tuple[int, Vec2, float, Vec2]]:
    """(frame, objetivo, escala, rot) cada `step` frames y en el último, para `track[i]` = sujeto en frame0 + i."""
    n = len(track)
    sx, sy = track[0]
    out = []
    for i, (x, y) in enumerate(track):
        sx += (x - sx) * shot.follow
        sy += (y - sy) * shot.follow
        if i % step and i != n - 1:
            continue
        t = ease(i / max(1, n - 1))
        lerp = lambda a, b: a + (b - a) * t  # noqa: E731
        rot = (lerp(shot.rot[0][0], shot.rot[1][0]), lerp(shot.rot[0][1], shot.rot[1][1]))
        out.append((frame0 + i, (sx + shot.offset[0], sy + shot.offset[1]), lerp(*shot.scale), rot))
    return out
