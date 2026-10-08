# Hero "maqueta": del acceso al egreso, de foto a vista técnica

> Estado: diseño aprobado en conversación el 2026-10-07; spec pendiente de revisión de Fran.
> Spike que lo respalda: `~/Documents/Geodot/hero-blender-spike/` (scene.py, planner.py, photo.py, overlay.py y renders).

## 1. Por qué

La referencia visual es terminal-industries.com: videos pre-renderizados en line-art, cenitales, con datos en mono. Terminal solo cubre **patio y transporte**. Geodot cubre eso **y todo lo que pasa adentro**: recepción, racks, autoelevadores, paletizado, armado de pedidos y egreso. El hero tiene que mostrar ese salto: **Terminal ve el patio, Geodot ve el patio y todo lo de adentro.**

Criterio de éxito: alguien que ve el hero 25 segundos entiende sin leer que Geodot sigue la carga desde que el camión cruza la pluma hasta que el pedido sale, y que los datos están en cada paso.

## 2. Formato

- **Hero de la home:** una película en loop de unos 26 s, con autoplay, muteada y full-bleed (es lo de esta spec).
- **Más abajo en la home:** el scrollytelling de 8 escenas (`HeroStory`), hecho con tramos de la misma maqueta. Va en otra fase y reutiliza todo.
- **Cámara:** ortográfica isométrica, tipo maqueta en corte (opción C). Se mueve en un solo plano continuo, sin cortes, y termina en el encuadre del arranque para que el loop no se note.

## 3. Guion

| Tiempo | Capa | Qué pasa | Card del HUD |
|---|---|---|---|
| 0–3 s | Acceso | **Fotorrealista** al atardecer. El camión llega al control de ingreso y frena en la pluma. | — |
| 3–5 s | Transición | Barrido de **lectura** sobre el camión (placa, cita, chofer): lo fotorrealista pasa a técnico y se levantan el techo y la fachada del depósito. La pluma sube. | **CAMIÓN + CHOFER** nace: placa, cita ✓, documentos ✓ |
| 5–11 s | Patio → andén | Cruza el patio y retrocede al andén con física real. | CAMIÓN + CHOFER: estado, distancia, articulación |
| 11–16 s | Recepción | Se abre la puerta. El autoelevador baja pallets, se escanean (destello) y la apiladora sube uno a su posición, que se ilumina. | **PALLET**: lote, caducidad FEFO, posición R-07-04-B |
| 16–17 s | **Relevo** | Un picker (persona con pistola RF) llega a **esa misma posición** y la cámara pasa de seguir a la máquina a seguir a la persona. | PALLET → **PEDIDO** ("FEFO: este lote sale primero") |
| 17–22 s | Armado | El picker recorre el pasillo y arma el pallet del pedido. Pasa por el paletizado/envoltura. | PEDIDO: 18/24 líneas, ventana de carga |
| 22–26 s | Egreso y cierre | El pallet va al andén de salida y se carga en otro camión. La cámara vuelve al acceso. | Resumen del sitio (en patio, andenes, pedidos) |

El relevo del segundo 16 es el corazón: un mismo objeto (el pallet en su posición) une la mitad de ingreso con la de armado y egreso.

## 4. Lenguaje visual

- **Técnico:** Freestyle con líneas visibles (finas) y ocultas (tenues, efecto rayos X). Fondo negro con polvo en partículas. **Teal `#1AB7A8`** como único acento para el objeto que se está siguiendo; el resto en gris azulado. Halo y viñeta en post.
- **Fotorrealista (solo la apertura exterior):** misma escena y misma cámara en Cycles. Asfalto aéreo y cielo de atardecer de Poly Haven (CC0), sol bajo y cálido con sombras largas. Como coincide píxel a píxel con la versión técnica, el barrido es exacto (probado en el spike, frame 201).
- **El interior es siempre técnico.** Se justifica en la historia ("la vista técnica es lo que ve Geodot") y evita modelar un depósito fotorrealista.
- **Antes del render final hay que ensuciar la versión fotorrealista:** variación entre tráileres, desgaste, manchas de aceite y juntas en el piso. En el spike se veía demasiado limpia.

## 5. Piezas

| Pieza | Cómo |
|---|---|
| Acceso: caseta, pluma animada, carriles, poste con cámara LPR | Script |
| Depósito en corte: techo en paneles que se levantan escalonados, fachada, puertas de andén que suben | Script |
| Racks selectivos (columnas, largueros, arriostramiento) por pasillos y niveles | Script paramétrico |
| Pallets 48×40, cajas variadas, pallet envuelto en film | Script con instancias |
| Paletizado/envoltura (plato y mástil) y transportadores | Script |
| Autoelevador contrapesado y apiladora | Script (detalle mecánico, sin fotorrealismo) |
| Picker | Mixamo: personaje + caminar y tomar cajas (gratis, uso comercial; **necesita cuenta Adobe de Fran**) |
| Tractor + semirremolque | Script, ya existe. **No se compra:** para la apertura se mejora la cabina (capó y techo curvos con subdivisión) |

## 6. Movimiento con física

- **Camión:** el planificador actual (cinemática no holonómica con perno rey, salida simulada e invertida, chequeo SAT de colisiones) se extiende a la ruta completa: avance por el acceso → curva del patio → retroceso al andén. Para el segundo camión del egreso se usa el mismo modelo. **Regla:** prohibido interpolar poses a mano. Cada pose sale del modelo y la holgura mínima se reporta.
- **Autoelevador y apiladora:** cinemática con dirección trasera, mástil animado, y los pallets se enganchan y sueltan (por parenting) en frames exactos. Chequeo de colisión contra racks y personas.
- **Picker:** caminata de Mixamo con root motion sobre una trayectoria, y gestos de tomar sincronizados con las posiciones del rack.
- **Pasillos realistas:** el patio de maniobra mide al menos 30 m. Los pasillos del rack respetan el ancho que necesita cada equipo (contrapesado ~3,5 m, apiladora ~2,8 m).

## 7. HUD en HTML

El video sale **sin texto**. Las cards son HTML/SVG sobre el video:

- **Contrato de datos:** Blender exporta `anchors.json` con `{fps, frames: [{<anclaje>: [x, y]}]}` en coordenadas 0..1 (origen arriba a la izquierda), uno por frame del video, y otro para el reencuadre mobile. Los anclajes son `tractor`, `driver`, `trailer`, `pallet`, `picker` y `order`. Los datos variables (distancia, articulación, estado, avance del pedido) vienen en el mismo JSON por frame.
- **Sincronización:** con `requestVideoFrameCallback` (y `timeupdate` como fallback). El frame se calcula como `round(mediaTime × fps)`. Las líneas guía son un SVG que se redibuja en cada frame. Las cards son fijas, con un margen mínimo del 6% del ancho al borde.
- **Contenido:** los textos van en `messages/{es,en}.json`. Los datos de ejemplo son ficticios y genéricos (sin clientes reales, sin marcas). Cada dato tiene que corresponder a algo que el producto hace de verdad (por ejemplo, Carta Porte validada sale del Gestor Documental). La lista definitiva de campos por card la revisa Fran.
- **Accesibilidad:** el video es decorativo (`aria-hidden`). Las cards tienen `aria-hidden` porque cambian frame a frame, y hay un resumen estático en texto para lectores de pantalla. Con `prefers-reduced-motion`: poster fijo con las cards en su estado final.

## 8. Render y entrega

- **Resolución:** 1920×1080 en desktop y un reencuadre vertical en mobile (nueva cámara ortográfica, mismo kit). El HUD tiene su propio layout en mobile, con menos filas por card.
- **Tiempos (Mac M5 Pro):** técnico ~25 s/frame (unos 26 s de película, de 4 a 5 h). Fotorrealista ~2–3 min/frame (unos 5 s, ~5 h). Se itera a 720 px y 12 fps, y el render final corre de noche.
- **Web:** mp4 H.264 + WebM, objetivo 5–8 MB en desktop y menos en mobile, con poster WebP. `preload="none"`, se carga después del LCP (el H1 sigue siendo el LCP). Lighthouse mobile no puede bajar de 90 en performance.
- **Código:** `geodot-web/video-blender/` en git, con el kit en módulos: `kit/trucks.py`, `kit/warehouse.py`, `kit/racks.py`, `kit/handling.py`, `plan/`, `render/` y `export/`. Los frames quedan fuera de git (`.gitignore`); solo los mp4/webm/poster finales y `anchors.json` (uno por encuadre) van a `public/hero/`; el JSON se carga junto con el video, no se mete en el bundle.

## 9. Fases (cada una se puede publicar)

1. **Acceso → patio → andén.** Pluma, barrido de lectura, corte del techo, ruta completa del camión, HUD HTML con CAMIÓN + CHOFER, integración al hero. Primera película de ~12 s en loop.
   *Aceptación:* holgura mínima > 0,1 m en toda la ruta, barrido sin desfase entre foto y técnico, HUD sincronizado en Chrome/Safari desktop (en mobile sigue `HeroCanvas` hasta la fase 3), Lighthouse ≥ 90.
2. **Recepción + relevo.** Racks, pallets, autoelevador, apiladora, picker hasta el relevo, card PALLET.
3. **Armado y egreso.** Picking, paletizado, andén de salida y segundo camión, cierre del loop, card PEDIDO y resumen, versión mobile.
4. **Scrollytelling de 8 escenas** más abajo en la home, con tramos de la misma maqueta y los textos de `ui.story.scenes`.

## 10. Riesgos

- **Sincronización del HUD en Safari iOS:** `requestVideoFrameCallback` existe, pero los frames pueden saltar. Mitigación: interpolar entre frames del JSON y probar temprano en la fase 1.
- **Tiempo de render** al iterar el fotorrealista. Mitigación: menos muestras con denoiser, y renderizar fotorrealista solo los ~5 s de la apertura.
- **Cabina por script en la apertura:** si no convence en fotorrealista, el plan B es encuadrar la apertura más alto (más lejos) en vez de comprar el modelo.
- **Peso del video:** el line-art comprime bien (2,5 MB por 5 s a 1080 en el spike), pero 26 s más el tramo fotorrealista hay que medirlos.

## 11. Fuera de alcance

- Unreal Engine y humanos fotorrealistas.
- Audio.
- Volver a renderizar los clips viejos de `public/hero-story/` (quedan reemplazados por la fase 4).
