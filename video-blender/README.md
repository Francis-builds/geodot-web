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

| Paso | Preview | Final |
|---|---|---|
| Técnico | ~6 s/frame | por medir |
| Fotorrealista | por medir | por medir |
