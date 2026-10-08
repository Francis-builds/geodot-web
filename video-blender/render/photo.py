"""Variante fotorrealista de la MISMA escena (misma geometría, misma cámara): Cycles + PBR +
sol de atardecer + asfalto aéreo y cielo de Poly Haven (CC0, ver assets/fetch_assets.sh)."""
from __future__ import annotations

import math
import zlib
from pathlib import Path

import bpy

PH = Path(__file__).resolve().parents[1] / "assets" / "ph"


def _crc(name: str) -> int:
    return zlib.crc32(name.encode())


def _pbr(name, rgb, rough=0.5, metal=0.0, coat=0.0, grime=0.0):
    """Principled con desgaste opcional: ruido que oscurece la base (manchas, polvo, óxido leve)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat
    if grime <= 0:
        b.inputs["Base Color"].default_value = (*rgb, 1)
        return m
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 2.2
    noise.inputs["Detail"].default_value = 8.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.45
    ramp.color_ramp.elements[0].color = (1 - grime, 1 - grime, 1 - grime * 1.1, 1)
    ramp.color_ramp.elements[1].position = 0.7
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    mix.inputs[6].default_value = (*rgb, 1)          # A
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], mix.inputs[7])  # B
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    return m


def _materials() -> dict:
    P = {
        "steel": _pbr("p_steel", (0.55, 0.56, 0.58), 0.35, 1.0),
        "chrome": _pbr("p_chrome", (0.9, 0.9, 0.9), 0.12, 1.0),
        "rubber": _pbr("p_rubber", (0.025, 0.025, 0.025), 0.85),
        "glass": _pbr("p_glass", (0.02, 0.025, 0.03), 0.04, 0.6),
        "chassis": _pbr("p_chassis", (0.04, 0.04, 0.045), 0.6),
        "roof": _pbr("p_roof", (0.52, 0.53, 0.52), 0.6, 0.3, grime=0.18),
        "rib": _pbr("p_rib", (0.62, 0.63, 0.62), 0.5, 0.3),
        "skylight": _pbr("p_skylight", (0.75, 0.8, 0.82), 0.15),
        "concrete": _pbr("p_concrete", (0.42, 0.41, 0.39), 0.85, grime=0.2),
        "cladding": _pbr("p_cladding", (0.62, 0.64, 0.66), 0.55, 0.2, grime=0.15),
        "dockdoor": _pbr("p_dockdoor", (0.70, 0.71, 0.72), 0.5, grime=0.12),
        "white_paint": _pbr("p_white_paint", (0.75, 0.75, 0.72), 0.7, grime=0.25),
        "yellow_paint": _pbr("p_yellow_paint", (0.85, 0.62, 0.08), 0.7, grime=0.25),
        "lamp": _pbr("p_lamp", (0.9, 0.85, 0.7), 0.1),
        "booth": _pbr("p_booth", (0.82, 0.82, 0.8), 0.45, grime=0.1),
        "rack": _pbr("p_rack", (0.08, 0.2, 0.45), 0.4, 0.6),
        "cardboard": _pbr("p_cardboard", (0.55, 0.4, 0.24), 0.8),
    }
    # tráileres en tres tonos con desgaste (no todos blancos impecables)
    P["trailers"] = [_pbr(f"p_trailer{i}", c, 0.45, grime=0.22) for i, c in
                     enumerate(((0.80, 0.80, 0.78), (0.70, 0.71, 0.70), (0.58, 0.59, 0.6)))]
    P["cabs"] = [_pbr(f"p_cab{i}", c, 0.25, 0.0, 1.0, grime=0.08) for i, c in enumerate(
        ((0.55, 0.04, 0.03), (0.03, 0.08, 0.25), (0.78, 0.78, 0.76), (0.18, 0.19, 0.2), (0.6, 0.6, 0.62)))]
    return P


ROLE = {
    "rpost": "steel", "post": "steel", "bow": "steel", "toprail": "steel", "botrail": "steel",
    "header": "steel", "sill": "steel", "hinge": "steel", "lockrod": "steel", "handle": "steel",
    "icc": "steel", "iccstrut": "steel", "lgleg": "steel", "lgfoot": "steel", "lgbrace": "steel",
    "slider": "chassis", "axle": "chassis", "tire": "rubber", "rim": "chrome", "hub": "chrome",
    "lug": "chrome", "mudflap": "rubber", "rail": "chassis", "fifthwheel": "chassis", "fwslot": "chassis",
    "deck": "steel", "tank": "chrome", "strap": "steel", "step": "steel", "stack": "chrome",
    "heatshield": "chrome", "aircleaner": "chrome", "mirrorarm": "chrome", "mirror": "chassis",
    "windshield": "glass", "sidewin": "glass", "wsbar": "chassis", "grille": "chrome", "slat": "chrome",
    "horn": "chrome", "hlamp": "lamp", "rib": "rib", "skylight": "skylight", "canopy": "concrete",
    "dockdoor": "dockdoor", "leveler": "steel", "floor": "concrete", "wall_n": "concrete",
    "wall_side": "concrete", "GATE_booth": "booth", "booth_roof": "steel", "booth_window": "glass",
    "barrier_post": "steel", "GATE_arm": "yellow_paint", "lpr_pole": "steel", "lpr_cam": "chassis",
}
TRAILER_SKIN = {"body", "skirt"}
CAB_PARTS = {"cab", "hood", "fairing", "extender", "qfender", "ffender"}


def _root(ob):
    while ob.parent:
        ob = ob.parent
    return ob


def _in_tractor(ob) -> bool:
    while ob.parent:
        if ob.parent.name.endswith("_piv"):
            return True
        ob = ob.parent
    return False


def _pick(ob, P, mats_tech):
    base = ob.name.split(".")[0]
    root = _root(ob).name
    if base.startswith("ROOF_panel"):
        return P["roof"]
    if base.startswith("FACADE_"):
        return P["cladding"]
    if base.startswith("RACK_"):
        return P["cardboard"] if base.endswith("_load") else P["rack"]
    if base == "paint":
        src = ob.data.materials[0]
        return P["yellow_paint"] if src == mats_tech["paint_dim"] else P["white_paint"]
    if base in CAB_PARTS or (base == "door" and _in_tractor(ob)):
        return P["cabs"][2] if root == "HERO" else P["cabs"][_crc(root) % len(P["cabs"])]
    if base in TRAILER_SKIN or base == "door":
        return P["trailers"][0] if root == "HERO" else P["trailers"][_crc(root) % 3]
    if base == "bumper":
        return P["rubber"] if not ob.parent else P["chrome"]
    return P.get(ROLE.get(base, ""), None)


def _ground(P) -> None:
    bpy.ops.mesh.primitive_plane_add(size=500, location=(15, -30, 0))
    ground = bpy.context.active_object
    gm = bpy.data.materials.new("p_asphalt")
    gm.use_nodes = True
    nt = gm.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / 12, 1 / 12, 1)   # una baldosa = 12 m
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])

    def tex(fname, noncolor=False):
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(str(PH / fname))
        if noncolor:
            t.image.colorspace_settings.name = "Non-Color"
        nt.links.new(mp.outputs["Vector"], t.inputs["Vector"])
        return t

    # manchas de aceite: ruido grande con rampa cerrada que oscurece el asfalto
    stains = nt.nodes.new("ShaderNodeTexNoise")
    stains.inputs["Scale"].default_value = 0.09
    stains.inputs["Detail"].default_value = 4.0
    nt.links.new(tc.outputs["Object"], stains.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.62
    ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
    ramp.color_ramp.elements[1].position = 0.72
    ramp.color_ramp.elements[1].color = (0.45, 0.43, 0.42, 1)
    nt.links.new(stains.outputs["Fac"], ramp.inputs["Fac"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    nt.links.new(tex("asph_Diffuse.jpg").outputs["Color"], mix.inputs[6])
    nt.links.new(ramp.outputs["Color"], mix.inputs[7])
    nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])
    nt.links.new(tex("asph_Rough.jpg", True).outputs["Color"], bsdf.inputs["Roughness"])
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nt.links.new(tex("asph_nor_gl.jpg", True).outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    ground.data.materials.append(gm)


def setup_photo(scene, cols, mats_tech, res: tuple[int, int], samples: int = 96) -> None:
    if not (PH / "sky.hdr").exists():
        raise SystemExit("faltan los assets de Poly Haven: correr assets/fetch_assets.sh")
    P = _materials()
    for ob in list(scene.objects):
        if ob.type == "FONT":
            if ob.data.materials and ob.data.materials[0] == mats_tech["paint"]:  # números pintados
                ob.data.materials.clear()
                ob.data.materials.append(P["white_paint"])
                ob.location.z = 0.014
            else:
                ob.hide_render = True
            continue
        if ob.type != "MESH":
            continue
        if cols["FX"] in ob.users_collection:
            ob.hide_render = True
            continue
        mat = _pick(ob, P, mats_tech)
        if mat:
            ob.data.materials.clear()
            ob.data.materials.append(mat)
    _ground(P)
    for ob in cols["PAINT"].objects:
        ob.location.z = max(ob.location.z, 0.012)

    world = bpy.data.worlds.new("w_photo")
    world.use_nodes = True
    wnt = world.node_tree
    env = wnt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(str(PH / "sky.hdr"))
    bg = wnt.nodes["Background"]
    wnt.links.new(env.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.4
    scene.world = world
    sun_data = bpy.data.lights.new("sun", "SUN")
    sun_data.energy = 5.5
    sun_data.color = (1.0, 0.74, 0.48)
    sun_data.angle = math.radians(1.2)
    sun = bpy.data.objects.new("sun", sun_data)
    scene.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(72), 0, math.radians(-128))

    r = scene.render
    r.resolution_x, r.resolution_y = res
    r.resolution_percentage = 100
    r.image_settings.file_format = "PNG"
    r.use_freestyle = False
    r.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = "GPU"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - High Contrast"
