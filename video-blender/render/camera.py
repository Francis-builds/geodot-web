"""Cámara isométrica ortográfica: orientación fija, se anima el punto que mira y la escala."""
from __future__ import annotations

import math
from dataclasses import dataclass

import bpy
from mathutils import Euler, Vector

ISO_ROT = (math.radians(58), 0.0, math.radians(35))   # desde el sur-sureste, casi de frente a la fachada de andenes
DISTANCE = 250.0


@dataclass(frozen=True)
class CamKey:
    frame: int
    target: tuple[float, float]
    ortho_scale: float


def view_dir() -> Vector:
    return Euler(ISO_ROT).to_matrix() @ Vector((0, 0, -1))


def iso_camera(scene, keys: list[CamKey]) -> bpy.types.Object:
    data = bpy.data.cameras.new("cam")
    data.type = "ORTHO"
    data.clip_end = 1000
    cam = bpy.data.objects.new("cam", data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.rotation_euler = ISO_ROT
    d = view_dir()
    for k in keys:
        cam.location = Vector((k.target[0], k.target[1], 0.0)) - d * DISTANCE
        data.ortho_scale = k.ortho_scale
        cam.keyframe_insert("location", frame=k.frame)
        data.keyframe_insert("ortho_scale", frame=k.frame)
    return cam
