# Iconos de módulo Geodot

Fuente: `components/ui/ModuleIcon.tsx` (web) · `public/images/modules/icons/<slug>.svg` (decks, propuestas, PDFs) · hoja de contacto: `docs/module-icons-sheet.png`.

## Motivo compartido

El logo de Geodot tiene un pin magenta en lugar de la "o", y el hueco de ese pin es un punto: *el acto de ubicar*. Cada uno de los 11 pictogramas lleva **ese punto**, y es el único elemento relleno del ícono. El punto cae justo donde actúa el módulo: el slot del almacén, la carga dentro del camión, el destino de la ruta, la lectura de temperatura. Dos íconos (iRouter y GPS & Flotas) usan el pin completo, construido con la misma geometría que el del logo. Todo lo demás es contorno: grilla de 24×24, trazo de 2px, extremos y uniones redondeados, sin degradados.

## Glifos

| slug | módulo | glifo | qué representa el punto |
|---|---|---|---|
| `wms` | iWMS | nave con portón de andén | el pallet ubicado adentro |
| `tms` | iTMS | camión de perfil | el embarque dentro de la caja |
| `router` | iRouter | origen (anillo) → ruta en U → pin | el destino óptimo |
| `paletizado` | Paletizado Inteligente | carga de 3 cajas sobre pallet | el punto de colocación calculado |
| `torre-control` | Torre de Control | torre con cabina vidriada y ondas | la baliza que todo lo ve |
| `cadena-frio` | Cadena de Frío | termómetro + copo de nieve | la lectura de temperatura |
| `gestor-documental` | Gestor Documental | documento + lupa | el dato que encuentra la IA |
| `etiqueta-zero` | Etiqueta Zero | etiqueta tachada | el dato que viaja con el pallet: la etiqueta desaparece, el punto queda |
| `gps-flotas` | GPS & Control de Flotas | pin sobre carril | la unidad localizada / la descarga validada en sitio |
| `companion` | Companion App | teléfono con firma | "firmado acá": la prueba de entrega |
| `plant-sync` | Plant Sync | agenda con franjas | el turno de andén reservado |

## Uso

- **Tamaños:** 20px en menú y listas (mínimo absoluto 16px), 24–32px inline con texto, 48–64px en cards y bentos. No escalar por encima de 96px: a ese tamaño hace falta una ilustración, no un ícono.
- **Color (web):** el trazo hereda `currentColor`. Usar `text-navy-700`/`text-navy-900` sobre claro, `text-teal-600` cuando el ícono es acento de la card y `text-white` sobre navy. Nada de hex en TSX.
- **`accent`:** `<ModuleIcon slug="wms" accent />` pinta solo el punto con `text-magenta-500`, que es el magenta del pin del logo. Usarlo en momentos de marca (hero de la página del módulo, card destacada, 48px o más) y como mucho en **un ícono por vista**: el magenta queda reservado para el CTA (DS v2). En menús y grillas de 11, va sin accent (monocromo).
- **SVG standalone:** trazo navy `#0E172D` y punto teal `#00A99D`, para decks, propuestas y datasheets. Sobre fondo navy, recolorear a trazo blanco con el punto en teal o magenta.
- **No hacer:** cambiar el grosor del trazo, rellenar formas, rotar, agregar un segundo punto o mezclar estos íconos con lucide en la misma grilla de módulos.
- **Accesibilidad:** el SVG es `aria-hidden`; el nombre del módulo tiene que estar en texto al lado.
- **Cambios:** editar los paths en el TSX **y** en el SVG standalone. Tienen que quedar idénticos.
