#!/usr/bin/env bash
# Pipeline completo del hero maqueta (fase 1):
#   plan → anchors → técnico → fotorrealista (hasta el fin del barrido) → post → encode → public/hero
# Uso: ./render.sh --preview   (960x540, 1 de cada 2 frames, 12 fps, foto con 24 muestras; ~1 h)
#      ./render.sh --final     (1920x1080, 24 fps, foto con 96 muestras; de noche)
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
mkdir -p "$OUT"
./assets/fetch_assets.sh > /dev/null

python3 -m plan.route "$OUT/route.json"
SCAN_END=$(python3 -c "import json;print(json.load(open('$OUT/route.json'))['cues']['scanEnd'])")
DOCKED=$(python3 -c "import json;print(json.load(open('$OUT/route.json'))['cues']['docked'])")
hero() { "$BLENDER" -b --factory-startup -P scene/hero.py -- --route "$OUT/route.json" "$@" > "$OUT/blender-$2.log" 2>&1; }

hero --mode anchors --out "$OUT" --res 1920x1080
hero --mode technical --out "$OUT/tech" --res "$RES" --step "$STEP"
hero --mode photo --out "$OUT/photo" --res "$RES" --step "$STEP" --frames "1-$((SCAN_END + 1))" --samples "$SAMPLES"
python3 -m post.composite "$OUT/tech" "$OUT/photo" "$OUT/comp" "$OUT/route.json"

# el barrido en el frame del medio, para revisar que foto y técnico calzan
MID=$(printf "f_%04d.png" $(( (72 + SCAN_END) / 2 / STEP * STEP + 1 )))
cp "$OUT/comp/$MID" "$OUT/check_barrido.png"

ffmpeg -v error -y -framerate "$FPS" -pattern_type glob -i "$OUT/comp/f_*.png" \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart "$OUT/film.mp4"
if [ "$NAME" = final ]; then
  ffmpeg -v error -y -framerate "$FPS" -pattern_type glob -i "$OUT/comp/f_*.png" \
    -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -pix_fmt yuv420p "$OUT/film.webm"
  POSTER=$(printf "f_%04d.png" $(( DOCKED + 11 )))
  mkdir -p ../public/hero
  cp "$OUT/film.mp4" ../public/hero/film-1080.mp4
  cp "$OUT/film.webm" ../public/hero/film-1080.webm
  ffmpeg -v error -y -i "$OUT/comp/$POSTER" -c:v libwebp -quality 82 ../public/hero/film-poster.webp
  cp "$OUT/film-anchors.json" ../public/hero/film-anchors.json
  ls -la ../public/hero
fi
echo "listo → $OUT/film.mp4 · revisar $OUT/check_barrido.png"
