# Auditoría de publicabilidad: geodot-web, 3-oct-2026

> Rama `feat/launch-motion`. La auditoría se hizo desde el código, no desde el browser. Las fuentes de verdad son `geodot-content-vault/STATUS.md` (decisiones del 2-jun), `proof-points.md` y `voice.md`.
> Pregunta que responde: ¿lo vería un comprador B2B serio, o Luis, y estaría OK? **Hoy: no.** El sitio funciona y compila, pero no se puede publicar.
> Inventario de assets extraído (decks, propuestas, PDFs): `scratchpad/assets-inventory/` (temporal). Los hallazgos están resumidos en la §3.

---

## 1. Qué bloquea (🔴)

| # | Problema | Dónde | Arreglo |
|---|---|---|---|
| 1 | **Nombres de clientes y CargoCam (draft) en el blog** | `content/blog/{es,en}/recintos-fiscales-vision-total.mdx:15-19` (Grupo Camili, HIMEX, conteo por cámara) | Usar genéricos ("un recinto en AIFA") y borrar el párrafo de CargoCam |
| 2 | **Propuestas y demos presentadas como casos logrados** | home `es.json:252-256` (municipio); gobierno `:818-833`; 3PL `:883-897`; salud `:948-962` (STATUS lo prohíbe); casos `:1096-1116` | Pasar a "Escenarios típicos" sin cliente ni métrica, marcar "(demo)" y en las demos cambiar "resultado" por "qué se mostró" |
| 3 | **Faltan 7 de los 11 módulos oficiales** | `lib/modules.ts:1` (solo wms, tms, paletizado, torre). Las industrias venden Etiqueta Zero, Cadena de Frío y GPS, que no tienen página. El blog enlaza Etiqueta Zero a `/plataforma/wms` | Agregar iRouter, Cadena de Frío, Gestor Documental, Etiqueta Zero, GPS/Flotas, Companion y Plant Sync+Turnero |
| 4 | **Todo el español está en voseo.** `voice.md` dice que en la web va neutro | ~165 apariciones en `es.json` más los posts. `PRODUCT.md:21` dice lo contrario y fue el origen del error | Pasada completa a tuteo neutro MX ("Agenda", "Cuéntanos", "dinero" en lugar de "plata") y corregir `PRODUCT.md` |
| 5 | **El formulario puede perder leads sin que nadie se entere** | `app/actions/contact.ts:17-26`: Resend v6 devuelve `{error}` en vez de lanzar, así que muestra "¡Listo!" aunque el mail no salga. Sin la key, muestra "revisá los datos" | Leer `{ error }`, loguear, usar mensajes distintos para `config` y `send` y mostrar un email/WhatsApp de respaldo |
| 6 | **Canonical, hreflang y OG de TODAS las páginas apuntan a la home** | `app/[locale]/layout.tsx:36-46`, que ninguna página sobrescribe | Helper `buildMeta(locale, path)` en cada `generateMetadata` |
| 7 | **Legales de plantilla sin responsable** | `privacidad`/`terminos` (nota "placeholder"); sin razón social, domicilio ni ARCO; declaran analítica que no existe; omiten el teléfono | Aviso de Privacidad LFPDPPP real con entidad, domicilio y email que funcione |
| 8 | **Afirmaciones institucionales sin confirmar** | `/nosotros` `es.json:1172-1181`: "operamos en Ecuador y Colombia" (propuesta y demo), "experiencia real en pharma y gobierno", "la primera plataforma" | Dejar solo lo que corre en producción y suavizar "la primera" |
| 9 | **Menú desktop roto en la práctica** | `components/NavMenu.tsx:111-144`: el hover abre y el click cierra (toggle). En tablet no se puede abrir. "Plataforma" e "Industrias" no son links. El backdrop deja la página oscurecida hasta hacer click | Separar el label (Link a `/plataforma`) del chevron, que el click no cierre lo que abrió el hover y mover el backdrop fuera del wrapper |
| 10 | **Fotos pixeladas** | La recompresión del 5-jul (`7f3a1af`) bajó todo a ≤1600 px y `next/image` aplica q75 encima. Las bandas a todo el ancho (`sizes="100vw"`) piden ~2880 px en retina. Peor caso: `industries/alimentos/context.jpg` 1193×1600 (vertical) usada como banda horizontal. `healthcare/context.jpg` y `cold-chain/operario-tablet.jpg` ya estaban **agrandadas** desde 1040 y 1373 px | Re-exportar desde los originales de 2400-2752 px (tabla §3.2) a ~2400 px, `images.qualities: [75, 90]` con q90 en hero y full-bleed, y reemplazar las que no tienen original grande |

## 2. Debería arreglarse antes (🟠)

- **El multimodal se vende como si existiera.** El hero rota "aviones, vagones… al 100% con IA", pero STATUS lo marca ROADMAP. Quitar aviones y vagones del rotador, o no prometer 100%.
- **Métricas mal ubicadas o sin fuente:**
  - "<2 min" del Gestor Documental aparece en iWMS y en recintos.
  - "100% descargas validadas" es una proyección hecha para Fonatur.
  - "99.9%", "+300 parámetros" y "ROI <12 meses" no tienen fuente.
  - "más de 8%" infla el dato real, que es −8%.
  - "los únicos" debería quedar en "ningún competidor tier-1".
  - "ni SAP S/4HANA alcanza" no está verificado.
- **Integraciones:**
  - SAP TM/EWM y Oracle OTM no están probados; lo probado es SAP B1 (que falta en la grilla), BASIS y Oracle vía API.
  - "Coca-Cola" vuelve identificable al embotellador.
- **/partners** publica los niveles Gold/Platinum/Diamond, márgenes y la certificación GCIE, pero el Alliance Program no está cerrado legalmente.
- **Sin analítica:** se lanzaría a ciegas. Agregar Vercel Analytics, que no usa cookies.
- **Faltan señales de confianza:**
  - El footer no tiene entidad, ciudad, email ni LinkedIn.
  - /nosotros no muestra personas.
  - **No hay ni una captura del producto** en todo el sitio.
- **Las industrias muestran siempre los mismos 4 módulos**, porque `ModuleGrid` no filtra. Hace falta `entryModules` y `crossSell` por industria, según el mapa de STATUS.
- **Pesca/marítimo no tiene página**, y es el único caso production-grade (23 buques).
- **Imágenes repetidas:**
  - El hero de Alimentos es una flota pesquera.
  - El hero de recintos se usa 3 veces.
  - `ruteo-flota.jpg` es portada de 3 posts.
  - En el journey de la home, "Entrega" usa la foto de la torre y "Cobro" la de partners.
- **SEO de previews:** `robots.ts` permite indexar las previews. Al sitemap le faltan los alternates.
- **Blog:** el autor es "Geodot" sin persona; hay estadísticas de mercado sin fuente; las fechas salen en formato es-ES.

## 3. Assets: qué existe y qué hay que hacer

### 3.1 Por módulo (los 11 oficiales)

| Módulo | Mejor hero existente (≥2400 px) | Captura real del producto | Ícono |
|---|---|---|---|
| iWMS | `presentaciones/output` iWMS deck img-3-1 (2400) / `assets/images/makvig-ch3-iwms.png` (2528) | Himex "Detalle de lecturas" 1342 px (anonimizar) | ❌ |
| iTMS | WingsArmy img-1-1 (2752) / `makvig-ch5-itms.png` | **Camilli `screenshot1.png` 1920×1080** (tablero Logística) | ❌ |
| iRouter | deck iTMS-iRouter img-4-1 (2400) | Solo mockups de celular | ❌ |
| Paletizado | `makvig-ch6-paletizado.png` (2528) | ❌ | ❌ |
| Torre de Control | deck PlantSync img-3-1 (2400) / `gruas-laguna-ch5-torre.png` (2752) | `screenshot1.png` 1920×1080 | ❌ |
| Cadena de Frío | WingsArmy img-3-1 (2400) / `presentaciones/content/images/cadena-frio.jpg` | ❌ | ❌ |
| Gestor Documental | `gruas-laguna-ch6-docs.png` (2752) | ❌ | ❌ |
| Etiqueta Zero | WingsArmy img-4-1 (2400) + ilustraciones `concepto-*-etiqueta-zero.png` (2048) | Himex lecturas (anonimizar) | ❌ |
| GPS / Flotas | `fonatur-*` (2752). Ojo: el "dashboard" de Fonatur es un **mock IA**, no UI real | `geodot-geocerca-puerto.jpg` 1484 px (anonimizar los barcos) | ❌ |
| Companion | `stock-entrega-tablet-pod.jpg` (2400) | **Camilli `screenshot2.png` 1440×2960** (PWA real) | ❌ |
| Plant Sync + Turnero | deck PlantSync img-2-1 (2400, fila de camiones en la caseta) | ❌ | ❌ |

- **No existe un set de íconos ni logos de módulo** en ningún lado: manual de marca, datasheets, decks y design system. Hay que diseñar los 11. Base sugerida: pin Geodot + glifo outline de 2 px, como manda el DS.
- **Descartar por marcas reales:** Store and Go, logo del Gobierno de México, ATOX, Raymond, Zebra, ZF, el muro de logos del Resumen Ejecutivo y los `audit-*.png` de la raíz (son Vigía, no Geodot).
- **Logo vectorial:** se puede exportar del `Documentos/Geodot_Manual-marca.pdf`. Hoy la web usa un PNG de 527 px.

### 3.2 Web → original de mayor resolución (el arreglo del pixelado)

La mayoría tiene un original de 2528-2752 px en `Geodot/assets/images/`: `gruas-laguna-ch*`, `makvig-ch*`, `recintos-ch*` y `fonatur-*`. **Sin original mayor (hay que reemplazar o regenerar):**
- `healthcare/hero`: 1373 px.
- `healthcare/context`: 1040 px agrandada.
- `cold-chain/operario-tablet`: 1373 px agrandada.
- `fleet/fleet-tracking` y `alimentos/hero`: 1482 px, y además es un buque.
- `recintos/geocerca-puerto`: 1484 px.
- `fleet/trailer-loading`: 1200 px.

## 4. Plan para cerrar (orden propuesto)

| Bloque | Qué | Quién | Esfuerzo |
|---|---|---|---|
| A. Código crítico | Formulario (error de Resend), canonical/OG por página, robots de previews, arreglo del menú, borrar `/dev/especimen` | Claude | ~2 h |
| B. Imágenes | Re-exportar desde originales a 2400 px + `qualities`; reemplazar las 6 sin original; matar las repetidas | Claude | ~2 h |
| C. Contenido | Limpiar casos y clientes, pasar el voseo a neutro, quitar el multimodal del hero, reubicar métricas, corregir `PRODUCT.md` | Claude, revisa Fran | ~3 h |
| D. 7 módulos nuevos | Páginas cortas desde `modules.md` + heros §3.1 + bento por grupos + `entryModules` por industria | Claude | ~4 h |
| E. Íconos de módulo | Set de 11 (pin + glifo) en SVG | Claude propone, Fran aprueba | ~2 h |
| F. Confianza | Footer con entidad y contactos, capturas reales en iTMS/Torre/Companion, Vercel Analytics | Claude + datos de Fran | ~1 h |
| G. Legales | Aviso de Privacidad LFPDPPP | **Abogado** | externo |

## 5. Decisiones que no son de Claude (Fran / Luis)

1. **Entidad legal y domicilio** que figuran en el sitio: legales y footer.
2. **Qué países y experiencia** se pueden afirmar en /nosotros.
3. ¿Se puede decir **"Coca-Cola"** y **"un recinto en AIFA"**?
4. **/partners:** ¿sale sin niveles ni márgenes, o se saca del menú hasta tener el programa legal?
5. **Capturas reales del producto:** ¿se pueden usar las de Camilli (screenshot1/2) con datos genéricos? ¿Hay acceso a un ambiente demo para sacar capturas limpias de los otros módulos?
6. **Tipografía:** el código usa Schibsted Grotesk; el manual dice Space Grotesk + Hanken. ¿Cuál queda?
