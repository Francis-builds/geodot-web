"""Higiene de los directorios de frames (Python puro, sin bpy).

- remove_empty_frames: un render cortado deja placeholders de 0 bytes que el render
  retomable saltearía; se borran antes de relanzar.
- render_stamp: sello de lo que define los frames (fuentes de la escena + route.json +
  parámetros). Si cambia, render.sh descarta los frames viejos en vez de mezclarlos.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


def remove_empty_frames(directory: Path) -> int:
    directory = Path(directory)
    if not directory.is_dir():
        return 0
    removed = 0
    for f in directory.glob("f_*.png"):
        if f.stat().st_size == 0:
            f.unlink()
            removed += 1
    return removed


def render_stamp(files: list[Path], params: dict) -> str:
    h = hashlib.sha256()
    for f in sorted(Path(p) for p in files):
        h.update(str(f.name).encode())
        h.update(Path(f).read_bytes())
    h.update(json.dumps(params, sort_keys=True).encode())
    return h.hexdigest()[:16]


if __name__ == "__main__":
    # uso: python3 -m render.frames <route.json> <res> <step> <samples>  → imprime el sello
    import sys
    root = Path(__file__).resolve().parents[1]
    srcs = [p for d in ("kit", "scene", "render", "export", "plan") for p in (root / d).glob("*.py")]
    route, res, step, samples = sys.argv[1:5]
    print(render_stamp(srcs + [Path(route)], {"res": res, "step": step, "samples": samples}))
