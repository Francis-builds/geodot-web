# video-blender: hero "maqueta"

Pipeline que produce la película del hero de la home. Spec: `../docs/superpowers/specs/2026-10-07-hero-maqueta-design.md` · plan: `../docs/superpowers/plans/2026-10-07-hero-maqueta-fase1.md`.

## Piezas

- `plan/` es Python puro: layout del sitio (`site.py`, **única fuente**), cinemática tractor+semirremolque, controladores (pure pursuit y retroceso en cascada) y ruta con línea de tiempo → `route.json`. Prohibido interpolar poses a mano.
- `kit/`, `render/`, `export/` y `scene/hero.py` corren dentro de Blender 5.2 headless: arman la escena, animan desde `route.json` y renderizan técnico (EEVEE + Freestyle) o fotorrealista (Cycles), o exportan `film-anchors.json` para el HUD HTML.
- `post/composite.py`: halo, viñeta y barrido de lectura foto → técnico.
- `render.sh`: el pipeline completo.

## Uso

```bash
pip install -r requirements.txt
python3 -m pytest              # tests (los de Blender se saltean si no está instalado)
./render.sh --preview          # 960x540, ~1 h → out/preview/film.mp4 + check_barrido.png
./render.sh --final            # 1920x1080, de noche → ../public/hero/
```

Los assets de Poly Haven (CC0) se bajan con `assets/fetch_assets.sh` y no van a git. La fuente es JetBrains Mono (OFL, `assets/fonts/OFL.txt`).

## Tiempos medidos (Mac M5 Pro)

| Paso | Preview (960×540, 1 de cada 2) | Final (1920×1080, 24 fps) |
|---|---|---|
| Técnico (EEVEE + Freestyle) | ~12 s/frame | 12 s/frame · 397 frames · ~92 min |
| Fotorrealista (Cycles, hasta el fin del barrido) | ~3 s/frame | 9 s/frame · 121 frames · ~23 min |
| Total `render.sh --final` | ~1 h | ~2 h (con encode) |

Si la Mac entra en reposo, el render se frena: correr con `caffeinate -i ./render.sh --final`.

**Película completa (fase 1 + 2, `--phase2`, 30,8 s, 740 frames):** técnico 12,7 s/frame (~2 h 40 min), mp4 CRF 30 (6,2 MB), WebM CRF 48 (4,8 MB); el poster es el último frame (estado final del HUD).

**Fase 1 sola — Encode:** mp4 H.264 CRF 27 `-tune animation` (3,9 MB) y WebM VP9 CRF 42 (3,2 MB), poster WebP de 1600 px (~105 KB). A simple vista no se distingue de CRF 23, que pesaba más del doble (8,5 MB).
