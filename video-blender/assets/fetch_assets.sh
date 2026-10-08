#!/usr/bin/env bash
# Descarga los assets CC0 de Poly Haven que usa el render fotorrealista (no van a git).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p ph
api() { curl -sf "https://api.polyhaven.com/files/$1"; }
pick() { python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }
J=$(api aerial_asphalt_01)
for k in Diffuse Rough nor_gl; do
  [ -f "ph/asph_$k.jpg" ] || curl -sf -o "ph/asph_$k.jpg" "$(echo "$J" | pick "d['$k']['2k']['jpg']['url']")"
done
[ -f ph/sky.hdr ] || curl -sf -o ph/sky.hdr "$(api industrial_sunset_puresky | pick "d['hdri']['2k']['hdr']['url']")"
ls -la ph
