"""Cámara ortográfica: por keyframe se anima el punto que mira, la escala y (opcional) la orientación.

- Giros (órbita alrededor de un punto): `orbit_keys` genera keyframes intermedios cada pocos
  frames, así el objetivo no se va de cuadro mientras cambia la orientación.
- Cortes: `cut_keys` repite el plano anterior en el frame previo al corte; entre dos
  keyframes consecutivos no hay tiempo para interpolar, así que se ve como un corte limpio.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, replace

import bpy
from mathutils import Euler, Vector

ISO_TILT, ISO_AZ = 58.0, 35.0     # grados: desde el sur-sureste, casi de frente a la fachada de andenes
ISO_ROT = (math.radians(ISO_TILT), 0.0, math.radians(ISO_AZ))
DISTANCE = 250.0
# el copy del hero ocupa la mitad izquierda: el sujeto se encuadra a ~71% del ancho
SUBJECT_X = 0.71


@dataclass(frozen=True)
class CamKey:
    frame: int
    target: tuple[float, float]
    ortho_scale: float
    subject: tuple[float, float] = (SUBJECT_X, 0.5)   # dónde cae el objetivo en pantalla (0..1, origen arriba a la izq.)
    rot: tuple[float, float] = (ISO_TILT, ISO_AZ)      # (inclinación desde la vertical, azimut) en grados


def _euler(rot: tuple[float, float]) -> Euler:
    return Euler((math.radians(rot[0]), 0.0, math.radians(rot[1])))


def view_dir(rot: tuple[float, float] = (ISO_TILT, ISO_AZ)) -> Vector:
    return _euler(rot).to_matrix() @ Vector((0, 0, -1))


def screen_right(rot: tuple[float, float] = (ISO_TILT, ISO_AZ)) -> Vector:
    return _euler(rot).to_matrix() @ Vector((1, 0, 0))


def screen_up(rot: tuple[float, float] = (ISO_TILT, ISO_AZ)) -> Vector:
    return _euler(rot).to_matrix() @ Vector((0, 1, 0))


def _smooth(t: float) -> float:
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)


def orbit_keys(a: CamKey, b: CamKey, step: int = 3) -> list[CamKey]:
    """Keyframes de a → b (sin incluir a), interpolando objetivo, escala, encuadre y orientación."""
    out = []
    n = max(1, b.frame - a.frame)
    for f in range(a.frame + step, b.frame, step):
        t = _smooth((f - a.frame) / n)
        lerp = lambda p, q: tuple(x + (y - x) * t for x, y in zip(p, q))  # noqa: E731
        out.append(CamKey(f, lerp(a.target, b.target), a.ortho_scale + (b.ortho_scale - a.ortho_scale) * t,
                          lerp(a.subject, b.subject), lerp(a.rot, b.rot)))
    return out + [b]


def cut_keys(prev: CamKey, new: CamKey) -> list[CamKey]:
    """Corte: el plano anterior se sostiene hasta el frame previo y en `new.frame` cambia de golpe."""
    return [replace(prev, frame=new.frame - 1), new]


def iso_camera(scene, keys: list[CamKey], res: tuple[int, int] = (1920, 1080)) -> bpy.types.Object:
    data = bpy.data.cameras.new("cam")
    data.type = "ORTHO"
    data.clip_end = 1000
    cam = bpy.data.objects.new("cam", data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    aspect = res[1] / res[0]
    for k in sorted(keys, key=lambda k: k.frame):
        d, right, up = view_dir(k.rot), screen_right(k.rot), screen_up(k.rot)
        sx, sy = k.subject
        # correr la cámara deja el objetivo en `subject` (fracción del cuadro)
        shift = -right * ((sx - 0.5) * k.ortho_scale) + up * ((sy - 0.5) * k.ortho_scale * aspect)
        cam.location = Vector((k.target[0], k.target[1], 0.0)) - d * DISTANCE + shift
        cam.rotation_euler = _euler(k.rot)
        data.ortho_scale = k.ortho_scale
        cam.keyframe_insert("location", frame=k.frame)
        cam.keyframe_insert("rotation_euler", frame=k.frame)
        data.keyframe_insert("ortho_scale", frame=k.frame)
    return cam
