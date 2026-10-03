#!/usr/bin/env bash
# Render de las 8 escenas del hero scrollytelling -> public/hero-story/
#
# Los flags de calidad viven en remotion.config.ts (png + crf 20), no aca, para
# que `remotion studio` y el render coincidan. Escala 1 = 1920x1080 nativo: el
# hero se muestra full-bleed, cualquier escala menor se ve estirada.
#
# Uso: npm run render:all
set -euo pipefail

cd "$(dirname "$0")"
OUT="../public/hero-story"
mkdir -p "$OUT"

# composition id -> nombre de archivo que espera app/[locale]/page.tsx
SCENES=(
  "s1-yard:s1"
  "s2-pack:s2"
  "s3-fill:s3"
  "s4-dock:s4"
  "s5-unload:s5"
  "s6-rack:s6"
  "s7-scan:s7"
  "s8-tower:s8"
)

for entry in "${SCENES[@]}"; do
  comp="${entry%%:*}"
  name="${entry##*:}"

  echo "==> $comp -> $name.mp4"
  npx remotion render "$comp" "$OUT/$name.mp4"

  # poster = frame 0, mismo que muestra el <img> hasta que el clip bufferea.
  # Se saca de la composicion y no del mp4 para no heredar la perdida de h264.
  echo "==> $comp -> $name-poster.webp"
  npx remotion still "$comp" "$OUT/$name-poster.png" --frame=0
  ffmpeg -y -loglevel error -i "$OUT/$name-poster.png" -quality 82 "$OUT/$name-poster.webp"
  rm -f "$OUT/$name-poster.png"
done

echo
echo "Listo. Peso total:"
du -ch "$OUT"/*.mp4 | tail -1
