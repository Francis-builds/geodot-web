# Geodot — Asset Catalog (web/blog reuse)

> Índice de imágenes marketing-reutilizables ya existentes en el ecosistema Geodot. **Regla:** reusar de acá antes de generar con `/banana`. Al usar una imagen, copiarla a `geodot-web/public/images/<categoría>/` y servirla optimizada (Next/Image → AVIF/WebP) para PSI.
> Excluye assets de código de app (`Camilli/Desarrollo`, `Fonatur` — markers/flags/SKUs/íconos, ~2800 archivos no-marketing).

## Fuentes principales

| Fuente | Ruta | Qué tiene |
|--------|------|-----------|
| PdfEbookGenerator (arte generado) | `~/Documents/presentation-skills/PdfEbookGenerator/assets/images/geodot/` | 42 imágenes profesionales de ebooks/propuestas (gruas-laguna, makvig, recintos, camili, mazardina) — jpg + png |
| Presentaciones | `Geodot/presentaciones/assets/` y `/content/images/` | arte por cliente (finsa, himex, megafarmacia, etiqueta-zero, wings-army, mundial-fanfest) |
| HIMEX | `Geodot/himex/images/` | trailer-loading.jpg, truck-dock-2.jpg, pricing |
| FINSA | `Geodot/FINSA/assets/` | diagramas plantsync/torre/gestor |
| App screenshots (Etiqueta Zero / audit) | `Geodot/audit-*.png` (root) | 8 screenshots de UI (login, providers, materials, upload, settings) |
| WMS Pharma | `Geodot/presentaciones/wms-pharma/operario-tablet.png` | operario con tablet en almacén |

## Por tema (para web/blog/verticales)

### Almacén / WMS
- `presentaciones/content/images/iwms-problem.jpg` — problema de almacén
- `presentaciones/wms-pharma/operario-tablet.png` — operario tablet
- `makvig-ch3-iwms.jpg`, `makvig-ch4-etiqueta.jpg` (PdfEbook) — WMS + Etiqueta Zero

### Cadena de frío / Pharma
- `presentaciones/content/images/cadena-frio.jpg` — cámara fría
- `presentaciones/assets/megafarmacia/Cold_chain_network_stages...png` — red cadena de frío México
- recintos/pharma art en PdfEbook (`recintos-ch*`)

### Transporte / Flota / Ruteo
- `himex/images/trailer-loading.jpg`, `truck-dock-2.jpg` — carga/dock
- `presentaciones/assets/mazardina/geodot-fleet-tracking.jpg` — fleet tracking
- `gruas-laguna-ch3-flota.jpg`, `gruas-laguna-ch4-entrega.jpg` (PdfEbook)
- `makvig-ch5-itms.jpg` — TMS

### Torre de Control / Visibilidad
- `presentaciones/content/images/torre-problem.png`
- `FINSA/assets/finsa-ch4-torre.png`, `gruas-laguna-ch5-torre.jpg`

### Recintos fiscales / Aduanas (vertical clave — HIMEX, Camili)
- PdfEbook `recintos-ch2-digital-control.png`, `recintos-ch4-torre-control.png`, `recintos-ch6-platform.png`
- `himex/images/resumen-geodot-himex---cargocam-con-consignacion.png`
- `gruas-laguna-*` (patio, grúas, geocerca puerto: `geodot-geocerca-puerto.jpg`)
- Logos: `camili-logo-white.jpg`

### Paletizado / Etiqueta Zero
- `presentaciones/etiqueta-zero-3pl/solucion-etiqueta-zero.png`, `problema-reetiquetado-ai.jpg`
- `makvig-ch6-paletizado.jpg`

### Gestor Documental
- `FINSA/assets/finsa-ch5-gestor.png`, `gruas-laguna-ch6-docs.jpg`, `makvig-ch9-propuesta.jpg`

### Sostenibilidad / Gobierno / Residuos
- `presentaciones/assets/mundial-fanfest/hero-mundial-2026-sustentable.png`
- EcoBinDetector screenshots (residuos)

### Marca / Logos
- `geodot-presentaciones/assets/geodot-logo-white.png`, `geodot-logo.jpeg`
- `presentaciones/etiqueta-zero-3pl/geodot-logo-white.png`

## Contenido fuente para verticales (no-imagen)

- **Recintos fiscales / aduanas:** Recintos Fiscales ebook (PdfEbookGenerator `assets/content/`), caso **Grupo Camili** (7,000 m² AIFA, iWMS + Etiqueta Zero).
- **HIMEX CargoCam:** `Geodot/Documentos/` research doc (video counting AIFA→HUB) + `himex/` — vertical de recintos/customs.
- **Healthcare/Pharma:** Megafarmacia, Mabe; content-engine `verticals/healthcare/`.
- **Otros casos:** Gruas Laguna, Makvig (abarrotes SEDENA), FINSA (parque industrial), Mazardina (fleet).

## Consumidas en web (Task 22 — reuse, sin generar nada)
Todas servidas con `next/image` (AVIF/WebP) vía `components/ui/Media.tsx`.

| Destino web | `public/images/...` | Fuente |
|-------------|---------------------|--------|
| Home hero (LCP, priority) | `warehouse/hero-patio.jpg` | PdfEbook `gruas-laguna-ch1-patio.jpg` |
| Producto WMS hero | `warehouse/iwms.jpg` | PdfEbook `makvig-ch3-iwms.jpg` |
| Producto TMS hero | `fleet/itms.jpg` | PdfEbook `makvig-ch5-itms.jpg` |
| Producto Paletizado hero | `warehouse/paletizado.jpg` | PdfEbook `makvig-ch6-paletizado.jpg` |
| Producto Torre de Control hero | `torre/torre-control.jpg` | PdfEbook `gruas-laguna-ch5-torre.jpg` |
| Industria Bebidas hero | `warehouse/almacen.jpg` | `presentaciones/content/images/iwms-problem.jpg` |
| Industria Alimentos hero | `cold-chain/cadena-frio.jpg` | `presentaciones/content/images/cadena-frio.jpg` |
| Industria Gobierno/Residuos hero | `fleet/fleet-tracking.jpg` | `presentaciones/assets/mazardina/geodot-fleet-tracking.jpg` |
| Industria 3PL hero | `fleet/trailer-loading.jpg` | `himex/images/trailer-loading.jpg` |
| Industria Healthcare hero | `cold-chain/operario-tablet.png` | `presentaciones/wms-pharma/operario-tablet.png` |
| Industria Recintos Fiscales hero | `recintos/torre-control.png` | PdfEbook `recintos-ch4-torre-control.png` |
| (reserva recintos) | `recintos/geocerca-puerto.jpg` | PdfEbook `geodot-geocerca-puerto.jpg` |

## Verticales — hero + context por industria (variedad visual)
> Cada slug de `/industrias/<slug>` usa un **hero** (full-bleed) + un **context** (banda editorial in-page) con un escenario distinto, según la propuesta comercial real. Servidos vía `next/image` desde `public/images/industries/<slug>/`. Todos ≤500KB (resize `sips -Z 1920/1600`; PNG fotográficos → jpg).

| Industria (slug) | Escenario / propuesta | hero → `industries/<slug>/` | context → `industries/<slug>/` | Fuentes |
|------------------|-----------------------|------------------------------|--------------------------------|---------|
| `bebidas` | Distribución (Makvig — abarrotes) | `bebidas/hero.jpg` (camiones reparto) | `bebidas/context.jpg` (iWMS almacén) | PdfEbook `makvig-ch5-itms.jpg`, `makvig-ch3-iwms.jpg` |
| `alimentos` | Flota pesquera + frío (Mazardina) | `alimentos/hero.jpg` (buque / mar) | `alimentos/context.jpg` (torre de control flota) | PdfEbook `mazardina/mazardina-atlantico-sur.jpg`, `mazardina-ch4-torre.jpg` |
| `gobierno-residuos` | Sostenibilidad / residuos | `gobierno-residuos/hero.jpg` (sustentabilidad) | `gobierno-residuos/context.jpg` (flota) | `presentaciones/assets/mundial-fanfest/hero-mundial-2026-sustentable.png` (→jpg), PdfEbook `gruas-laguna-ch3-flota.jpg` |
| `3pl` | Renta de montacargas / patio (Gruas Laguna) | `3pl/hero.jpg` (patio montacargas) | `3pl/context.jpg` (entrega) | PdfEbook `gruas-laguna-ch1-patio.jpg`, `gruas-laguna-ch4-entrega.jpg` |
| `healthcare` | Pharma cadena de frío (Megafarmacia) | `healthcare/hero.png` (red cadena de frío MX) | `healthcare/context.jpg` (operario tablet) | `presentaciones/assets/megafarmacia/Cold_chain_network_stages...png`, `cold-chain/operario-tablet.jpg` |
| `recintos-fiscales` | Aduanas / recintos (Camili / HIMEX / FINSA) | `recintos-fiscales/hero.png` (torre de control) | `recintos-fiscales/context.jpg` (geocerca puerto — aduana marítima) | `recintos/torre-control.png`, PdfEbook `geodot-geocerca-puerto.jpg` |

## TODO al consumir
- [ ] Copiar la imagen elegida a `public/images/<cat>/` (no referenciar fuera del repo).
- [ ] Servir con `next/image` (lazy, sized, AVIF/WebP) para PSI.
- [ ] Generar con `/banana` (estética Geodot) solo si no hay match — registrar la nueva acá.
