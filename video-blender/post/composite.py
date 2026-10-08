"""Post de la película: halo + viñeta sobre la vista técnica y barrido de lectura foto → técnico."""
from __future__ import annotations

import math

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

TEAL = (26, 183, 168)


def scan_progress(frame: int, start: int, end: int) -> float:
    """0 antes de `start`, 1 después de `end`, smoothstep en el medio (frames 0-based)."""
    t = min(1.0, max(0.0, (frame - start) / max(1, end - start)))
    return t * t * (3 - 2 * t)


def _edge(width: int, progress: float, feather_px: int) -> float:
    return progress * (width + 2 * feather_px) - feather_px


def wipe_mask(width: int, height: int, progress: float, feather_px: int = 120, angle_deg: float = 0.0) -> Image.Image:
    """L: 255 = técnico (ya barrido), 0 = foto. El barrido avanza de izquierda a derecha."""
    a = math.radians(angle_deg)
    xs, ys = np.meshgrid(np.arange(width, dtype=np.float32), np.arange(height, dtype=np.float32))
    coord = xs * math.cos(a) + ys * math.sin(a)
    t = (_edge(width, progress, feather_px) - coord) / feather_px + 0.5
    return Image.fromarray((np.clip(t, 0.0, 1.0) * 255).astype(np.uint8), "L")


_VIG: dict[tuple[int, int], Image.Image] = {}


def glow_vignette(img: Image.Image) -> Image.Image:
    img = img.convert("RGB")
    w, h = img.size
    glow = ImageEnhance.Brightness(img.filter(ImageFilter.GaussianBlur(6 * w / 1920 * 1.78))).enhance(0.45)
    out = ImageChops.screen(img, glow)
    if (w, h) not in _VIG:
        g = Image.radial_gradient("L").resize((w, h))
        _VIG[(w, h)] = Image.merge("RGB", [g.point(lambda v: int(255 - 0.55 * v))] * 3)
    return ImageChops.multiply(out, _VIG[(w, h)])


def compose_frame(tech: Image.Image, photo: Image.Image | None, progress: float, feather_px: int | None = None) -> Image.Image:
    t = glow_vignette(tech)
    if photo is None or progress >= 1.0:
        return t
    w, h = t.size
    f = feather_px or max(8, round(120 * w / 1920))
    out = Image.composite(t, photo.convert("RGB").resize((w, h)), wipe_mask(w, h, progress, f))
    if progress > 0.0:  # línea de lectura teal con halo, en el centro de la transición
        x = _edge(w, progress, f)
        band = Image.new("RGB", (w, h))
        d = ImageDraw.Draw(band)
        d.rectangle((x - 3, 0, x + 3, h), fill=TEAL)
        out = ImageChops.screen(out, band.filter(ImageFilter.GaussianBlur(max(4, w / 160))))
        ImageDraw.Draw(out).line([(x, 0), (x, h)], fill=(150, 255, 240), width=max(1, round(w / 960)))
    return out


def compose_dir(tech_dir, photo_dir, out_dir, route_json) -> int:
    """Compone todos los f_####.png técnicos; donde hay foto del mismo frame, aplica el barrido."""
    import json
    from pathlib import Path
    tech_dir, photo_dir, out_dir = Path(tech_dir), Path(photo_dir), Path(out_dir)
    cues = json.loads(Path(route_json).read_text())["cues"]
    out_dir.mkdir(parents=True, exist_ok=True)
    n = 0
    for f in sorted(tech_dir.glob("f_*.png")):
        frame = int(f.stem[2:]) - 1                     # Blender 1-based -> índice de route.json
        prog = scan_progress(frame, cues["scanStart"], cues["scanEnd"])
        ph = photo_dir / f.name
        photo = Image.open(ph) if (prog < 1.0 and ph.exists()) else None
        compose_frame(Image.open(f), photo, prog if photo else 1.0).save(out_dir / f.name)
        n += 1
    return n


if __name__ == "__main__":
    import sys
    print("compuestos", compose_dir(*sys.argv[1:5]))
