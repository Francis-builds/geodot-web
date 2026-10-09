#!/usr/bin/env bash
# Pipeline completo del hero maqueta (fase 1):
#   plan → anchors → técnico → fotorrealista (hasta el fin del barrido) → post → encode → public/hero
# Uso: ./render.sh --preview [--fresh] [--phase2]   (960x540, 1 de cada 2 frames, 12 fps, foto con 24 muestras; ~1 h)
#      ./render.sh --final [--fresh]     (1920x1080, 24 fps, foto con 96 muestras; de noche)
# Es retomable: relanzarlo saltea los frames ya renderizados. --fresh borra out/<modo> y arranca de cero
# (necesario si cambió la escena).
set -euo pipefail
cd "$(dirname "$0")"
MODE="${1:---preview}"
BLENDER="${BLENDER:-$(command -v blender || echo /Applications/Blender.app/Contents/MacOS/Blender)}"
case "$MODE" in
  --preview) NAME=preview; RES=960x540;  STEP=2; FPS=12; SAMPLES=24 ;;
  --final)   NAME=final;   RES=1920x1080; STEP=1; FPS=24; SAMPLES=96 ;;
  *) echo "uso: $0 --preview|--final" >&2; exit 2 ;;
esac
OUT="out/$NAME"
for a in "$@"; do if [ "$a" = "--fresh" ]; then rm -rf "./out/$NAME"; fi; done
mkdir -p "$OUT"
./assets/fetch_assets.sh > /dev/null

PHASE_FLAG=""
for a in "$@"; do if [ "$a" = "--phase2" ]; then PHASE_FLAG="--phase2"; fi; done
# el interior (racks en línea fina) comprime peor: la película completa usa CRF más altos
if [ -n "$PHASE_FLAG" ]; then CRF_X264=30; CRF_VP9=48; else CRF_X264=27; CRF_VP9=42; fi
python3 -m plan.route "$OUT/route.json" $PHASE_FLAG
SCAN_END=$(python3 -c "import json;print(json.load(open('$OUT/route.json'))['cues']['scanEnd'])")
DOCKED=$(python3 -c "import json;print(json.load(open('$OUT/route.json'))['cues']['docked'])")
hero() { "$BLENDER" -b --factory-startup -P scene/hero.py -- --route "$OUT/route.json" "$@" > "$OUT/blender-$2.log" 2>&1; }

# frames viejos de otra escena/ruta/parámetros no se reutilizan: el sello los invalida
stale() {  # $1 = dir, $2 = sello esperado. Sin sello (corridas previas a este cambio) se adopta.
  if [ -f "$1/.stamp" ] && [ "$(cat "$1/.stamp")" != "$2" ]; then echo "frames viejos en $1: se descartan"; rm -rf "./$1"; fi
  mkdir -p "$1"; echo "$2" > "$1/.stamp"
}
stale "$OUT/tech" "$(python3 -m render.frames "$OUT/route.json" "$RES" "$STEP" tech)"
stale "$OUT/photo" "$(python3 -m render.frames "$OUT/route.json" "$RES" "$STEP" "$SAMPLES")"

hero --mode anchors --out "$OUT" --res 1920x1080
hero --mode technical --out "$OUT/tech" --res "$RES" --step "$STEP"
hero --mode photo --out "$OUT/photo" --res "$RES" --step "$STEP" --frames "1-$((SCAN_END + 1))" --samples "$SAMPLES"
rm -rf "./$OUT/comp"   # siempre desde cero: ffmpeg toma todos los f_*.png de comp/
python3 -m post.composite "$OUT/tech" "$OUT/photo" "$OUT/comp" "$OUT/route.json"

# el barrido en el frame del medio, para revisar que foto y técnico calzan
MID=$(printf "f_%04d.png" $(( (72 + SCAN_END) / 2 / STEP * STEP + 1 )))
cp "$OUT/comp/$MID" "$OUT/check_barrido.png"

ffmpeg -v error -y -framerate "$FPS" -pattern_type glob -i "$OUT/comp/f_*.png" \
  -c:v libx264 -preset veryslow -crf "$CRF_X264" -tune animation -pix_fmt yuv420p -movflags +faststart "$OUT/film.mp4"
if [ "$NAME" = final ]; then
  ffmpeg -v error -y -framerate "$FPS" -pattern_type glob -i "$OUT/comp/f_*.png" \
    -c:v libvpx-vp9 -crf "$CRF_VP9" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p "$OUT/film.webm"
  # el poster es el estado final del HUD (reduced-motion muestra las cards del último frame)
  if [ -n "$PHASE_FLAG" ]; then POSTER=$(ls "$OUT/comp" | tail -1); else POSTER=$(printf "f_%04d.png" $(( DOCKED + 11 ))); fi
  mkdir -p ../public/hero
  cp "$OUT/film.mp4" ../public/hero/film-1080.mp4
  cp "$OUT/film.webm" ../public/hero/film-1080.webm
  ffmpeg -v error -y -i "$OUT/comp/$POSTER" -vf scale=1600:-1 -c:v libwebp -quality 68 ../public/hero/film-poster.webp
  cp "$OUT/film-anchors.json" ../public/hero/film-anchors.json
  ls -la ../public/hero
fi
echo "listo → $OUT/film.mp4 · revisar $OUT/check_barrido.png"
