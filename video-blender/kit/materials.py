"""Materiales de la vista técnica (todo emisión: las líneas las dibuja Freestyle)."""
from __future__ import annotations

import bpy

TEAL_HEX = "#1AB7A8"


def hexrgb(h: str) -> tuple[float, float, float]:
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]


def emit_mat(name: str, rgb: tuple[float, float, float], strength: float = 1.0) -> bpy.types.Material:
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = (*rgb, 1)
    e.inputs["Strength"].default_value = strength
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(e.outputs[0], out.inputs[0])
    return m


def tech_materials() -> dict[str, bpy.types.Material]:
    return {
        "occluder": emit_mat("occluder", (0, 0, 0), 0),
        "paint": emit_mat("paint", (0.20, 0.23, 0.28)),
        "paint_dim": emit_mat("paint_dim", (0.11, 0.12, 0.15)),
        "teal": emit_mat("teal", hexrgb(TEAL_HEX), 1.6),
        "dust0": emit_mat("dust0", (1, 1, 1), 0.25),
        "dust1": emit_mat("dust1", (1, 1, 1), 0.5),
        "dust2": emit_mat("dust2", (1, 1, 1), 0.9),
    }
