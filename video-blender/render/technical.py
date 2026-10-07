"""Vista técnica: EEVEE + Freestyle (visibles finas, ocultas tenues, teal para HERO)."""
from __future__ import annotations

import math

import bpy

from kit.materials import TEAL_HEX, hexrgb

LINE = (0.52, 0.66, 0.90)
HIDDEN = (0.26, 0.34, 0.50)


def _lineset(fs, name, col, vis, rgb, alpha, thick):
    ls = fs.linesets.new(name)
    ls.select_by_visibility = True
    ls.visibility = vis
    ls.select_by_collection = True
    ls.collection = col
    ls.select_by_edge_types = True
    for t in ("silhouette", "border", "crease", "external_contour", "contour"):
        setattr(ls, "select_" + t, True)
    st = bpy.data.linestyles.new(name)
    st.color = rgb
    st.alpha = alpha
    st.thickness = thick
    ls.linestyle = st


def setup_technical(scene, cols, res: tuple[int, int]) -> None:
    r = scene.render
    r.engine = "BLENDER_EEVEE"
    r.resolution_x, r.resolution_y = res
    r.resolution_percentage = 100
    r.film_transparent = False
    r.image_settings.file_format = "PNG"
    scene.view_settings.view_transform = "Standard"
    scene.eevee.taa_render_samples = 16
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0, 0, 0, 1)
    scene.world = world
    r.use_freestyle = True
    r.line_thickness_mode = "ABSOLUTE"
    r.line_thickness = max(0.5, res[0] / 1920 * 1.3)
    fs = bpy.context.view_layer.freestyle_settings
    fs.crease_angle = math.radians(140)
    fs.as_render_pass = False
    for ls in list(fs.linesets):
        fs.linesets.remove(ls)
    teal = hexrgb(TEAL_HEX)
    _lineset(fs, "lines_vis", cols["LINES"], "VISIBLE", LINE, 0.8, 0.7)
    _lineset(fs, "lines_hid", cols["LINES"], "HIDDEN", HIDDEN, 0.35, 0.5)
    _lineset(fs, "hero_vis", cols["HERO"], "VISIBLE", teal, 1.0, 1.0)
    _lineset(fs, "hero_hid", cols["HERO"], "HIDDEN", tuple(c * 0.6 for c in teal), 0.7, 0.8)
