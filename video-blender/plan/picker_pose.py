"""Pose del maniquí del picker (Python puro): ángulos por articulación, en radianes.

Convenciones (frente +X, rotación en Y): ángulo positivo lleva la pierna/brazo hacia atrás y la
columna hacia adelante; negativo lleva el brazo al frente. La rodilla flexiona con positivo
y el codo con negativo. `pelvis` es la altura de la cadera (m).
"""
from __future__ import annotations

import math

STRIDE = 1.6                     # m por ciclo (dos pasos): el ritmo de la película es rápido
PICK_PHASES = (6, 12, 6, 10)     # frames: girar al rack, alcanzar la caja, volver al carrito, apoyarla
JOINTS = ("hipL", "hipR", "kneeL", "kneeR", "shoulderL", "shoulderR", "elbowL", "elbowR", "spine", "neck")

Pose = dict[str, float]
d = math.radians


def _pose(**kw: float) -> Pose:
    base = {j: 0.0 for j in JOINTS} | {"pelvis": 0.95}
    return base | kw


def _arms(shoulder: float, elbow: float) -> Pose:
    return {"shoulderL": shoulder, "shoulderR": shoulder, "elbowL": elbow, "elbowR": elbow}


def _mix(a: Pose, b: Pose, t: float) -> Pose:
    t = t * t * (3 - 2 * t)
    return {k: a[k] + (b[k] - a[k]) * t for k in a}


PUSH_ARMS = _arms(d(-43), d(-1))             # manos en el manubrio (0,44 m adelante, 1 m de alto)
REACH = _pose(spine=d(22), neck=d(-10), hipL=d(-6), hipR=d(-6), kneeL=d(10), kneeR=d(10), pelvis=0.93, **_arms(d(-80), d(-4)))
CARRY = _pose(spine=d(4), **_arms(d(-50), d(-12)))     # caja a 1,15 m, 0,45 m adelante
PLACE = _pose(spine=d(34), neck=d(-8), kneeL=d(14), kneeR=d(14), pelvis=0.91, **_arms(d(-42), d(-6)))   # tapa del carrito


def walk_pose(walked: float, push: bool = True) -> Pose:
    """Caminata en función de la distancia (los pies no patinan); con carrito, brazos al manubrio."""
    ph = walked / STRIDE * math.tau
    p = _pose(spine=d(7) if push else d(3), neck=d(-8) if push else 0.0)
    for side, s in (("L", 1), ("R", -1)):
        sw = s * math.sin(ph)
        p[f"hip{side}"] = d(26) * sw
        # la rodilla flexiona al despegar el pie y en el balanceo; casi extendida al apoyar
        p[f"knee{side}"] = d(6) + d(48) * max(0.0, math.sin(ph * s + 1.1)) ** 2
    p |= PUSH_ARMS if push else {"shoulderL": d(-20) * math.sin(ph), "shoulderR": d(20) * math.sin(ph),
                                 "elbowL": d(-15), "elbowR": d(-15)}
    p["pelvis"] = 0.95 - 0.03 * (0.5 - 0.5 * math.cos(2 * ph))   # baja en el doble apoyo
    return p


def idle_pose(t: float) -> Pose:
    """Quieto, con respiración leve y las manos en el carrito."""
    return _pose(spine=d(6) + d(1.5) * math.sin(t * 0.25), neck=d(-4)) | PUSH_ARMS


def pickup_pose(k: int) -> Pose:
    """k = frames desde el inicio del pick: gira y suelta el carrito, alcanza, lleva al pecho, apoya."""
    turn, reach, back, place = PICK_PHASES
    stand = idle_pose(0)
    if k < turn:
        return _mix(stand, _pose(spine=d(6), **_arms(d(-30), d(-30))), (k + 1) / turn)
    k -= turn
    if k < reach:   # mitad estirándose hacia la caja, mitad trayéndola al pecho
        h = reach / 2
        return _mix(_pose(spine=d(6), **_arms(d(-30), d(-30))), REACH, (k + 1) / h) if k < h else _mix(REACH, CARRY, (k - h + 1) / h)
    k -= reach
    if k < back:
        return CARRY
    k -= back
    return _mix(CARRY, PLACE, min(1.0, (k + 1) / (place * 0.7)))


def pose_at(clip: int, k: int, walked: float, frame: int) -> Pose:
    """clip: 0 idle, 1 walk (empujando), 2 scan, 3 pickup. k = frames dentro del clip."""
    if clip == 1:
        return walk_pose(walked)
    if clip == 3:
        return pickup_pose(k)
    if clip == 2:
        return idle_pose(frame) | {"shoulderR": d(-75), "elbowR": d(-20)}
    return idle_pose(frame)


class Smoother:
    """Cada articulación persigue su objetivo (filtro de primer orden): sin tirones entre clips
    ni en los gestos rápidos del pick, a costa de ~2 frames de inercia."""

    def __init__(self, rate: float = 0.45):
        self.rate, self.prev = rate, None

    def __call__(self, target: Pose) -> Pose:
        self.prev = target if self.prev is None else {k: self.prev[k] + (target[k] - self.prev[k]) * self.rate for k in target}
        return self.prev
