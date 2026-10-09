"""Cámara isométrica ortográfica: orientación fija, se anima el punto que mira y la escala."""
from __future__ import annotations

import math
from dataclasses import dataclass

import bpy
from mathutils import Euler, Vector

ISO_ROT = (math.radians(58), 0.0, math.radians(35))   # desde el sur-sureste, casi de frente a la fachada de andenes
DISTANCE = 250.0
# el copy del hero ocupa la mitad izquierda: el sujeto se encuadra a ~68% del ancho
SUBJECT_X = 0.71


@dataclass(frozen=True)
class CamKey:
    frame: int
    target: tuple[float, float]
    ortho_scale: float
    subject: tuple[float, float] = (SUBJECT_X, 0.5)   # dónde cae el objetivo en pantalla (0..1, origen arriba a la izq.)


def view_dir() -> Vector:
    return Euler(ISO_ROT).to_matrix() @ Vector((0, 0, -1))


def screen_right() -> Vector:
    return Euler(ISO_ROT).to_matrix() @ Vector((1, 0, 0))


def screen_up() -> Vector:
    return Euler(ISO_ROT).to_matrix() @ Vector((0, 1, 0))


def iso_camera(scene, keys: list[CamKey]) -> bpy.types.Object:
    data = bpy.data.cameras.new("cam")
    data.type = "ORTHO"
    data.clip_end = 1000
    cam = bpy.data.objects.new("cam", data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.rotation_euler = ISO_ROT
    d, right, up = view_dir(), screen_right(), screen_up()
    aspect = scene.render.resolution_y / scene.render.resolution_x if scene.render.resolution_x else 9 / 16
    for k in keys:
        # correr la cámara deja el objetivo en `subject` (fracción del cuadro)
        sx, sy = k.subject
        shift = -right * ((sx - 0.5) * k.ortho_scale) + up * ((sy - 0.5) * k.ortho_scale * aspect)
        cam.location = Vector((k.target[0], k.target[1], 0.0)) - d * DISTANCE + shift
        data.ortho_scale = k.ortho_scale
        cam.keyframe_insert("location", frame=k.frame)
        data.keyframe_insert("ortho_scale", frame=k.frame)
    return cam
