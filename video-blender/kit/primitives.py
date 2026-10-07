"""Primitivas de modelado por script (port del spike). Material por defecto: el oclusor negro."""
from __future__ import annotations

import math

import bmesh
import bpy
from mathutils import Vector

_DEFAULT: dict[str, bpy.types.Material] = {}


def set_default_material(mat: bpy.types.Material) -> None:
    _DEFAULT["mat"] = mat


def _obj(name, bm, col, mat, parent):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    col.objects.link(ob)
    me.materials.append(mat or _DEFAULT["mat"])
    if parent:
        ob.parent = parent
    return ob


def bevel(ob, w, seg=2):
    if w > 0:
        b = ob.modifiers.new("bev", "BEVEL")
        b.width = w
        b.segments = seg
        b.limit_method = "ANGLE"
    return ob


def box(name, size, loc, col, parent=None, mat=None, bev=0.0, seg=2, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    ob = _obj(name, bm, col, mat, parent)
    ob.location = loc
    ob.rotation_euler = rot
    return bevel(ob, bev, seg)


def cyl(name, r, depth, loc, col, parent=None, axis="z", seg=32, bev=0.0, mat=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=depth)
    ob = _obj(name, bm, col, mat, parent)
    ob.location = loc
    ob.rotation_euler = {"x": (0, math.pi / 2, 0), "y": (math.pi / 2, 0, 0), "z": (0, 0, 0)}[axis]
    return bevel(ob, bev, 2)


def prism(name, rear, front, y0, y1, z0, col, parent=None, bev=0.0, seg=3, mat=None):
    """Sección trapezoidal que va de (ancho, alto) atrás a (ancho, alto) adelante."""
    (wr, zr), (wf, zf) = rear, front
    bm = bmesh.new()
    v = [bm.verts.new(p) for p in (
        (-wr / 2, y0, z0), (wr / 2, y0, z0), (wr / 2, y0, zr), (-wr / 2, y0, zr),
        (-wf / 2, y1, z0), (wf / 2, y1, z0), (wf / 2, y1, zf), (-wf / 2, y1, zf))]
    for f in ((0, 1, 2, 3), (7, 6, 5, 4), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
        bm.faces.new([v[i] for i in f])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bevel(_obj(name, bm, col, mat, parent), bev, seg)


def empty(name, col, loc=(0, 0, 0), yaw=0.0, parent=None):
    e = bpy.data.objects.new(name, None)
    col.objects.link(e)
    e.location = loc
    e.rotation_euler = (0, 0, yaw)
    if parent:
        e.parent = parent
    return e


def text(body, loc, size, col, mat, font_path, rot=0.0, align="CENTER"):
    cu = bpy.data.curves.new("t", "FONT")
    cu.body = body
    cu.font = bpy.data.fonts.load(font_path, check_existing=True)
    cu.size = size
    cu.align_x = align
    ob = bpy.data.objects.new("t", cu)
    col.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (0, 0, rot)
    cu.materials.append(mat)
    return ob
