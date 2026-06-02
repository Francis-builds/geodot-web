# Product

## Register

brand

## Users

Decisores de operaciones logísticas en México y LATAM: directores y gerentes de operaciones, supply chain y logística; dueños y gerentes generales de operadores 3PL; jefes de almacén y distribución; gerentes de planta; responsables de recintos fiscales / aduanas; y el CFO que firma el ROI. Operaciones medianas a grandes (decenas a cientos de camiones, cientos de SKUs), con flota propia, tercerizada o mixta.

Llegan al sitio desde tres ángulos: "tengo un problema" (buscan caso de uso), "necesito una herramienta" (buscan WMS/TMS/ruteo), o "soy de X industria" (buscan que entiendan su sector). El sitio debe dejar que cada uno encuentre su camino rápido y termine en una demo.

## Product Purpose

Geodot es una plataforma de logística inteligente que integra gestión de almacén (WMS), transporte (TMS), ruteo y paletizado con IA, más torre de control, cadena de frío, gestor documental y módulos de patio. El diferenciador técnico: rutea y paletiza en simultáneo para cargar camiones cerca del 99% (vs ~85% tradicional), y se integra al ERP existente (SAP, BASIS, Oracle) sin reemplazarlo.

El sitio (geodot-web) existe para posicionar a Geodot como **líder de la categoría** en LATAM —no como un proveedor más de software— y convertir visitantes C-level en solicitudes de demo. Éxito = el visitante percibe autoridad de experto (no folleto) y agenda una demo.

## Brand Personality

Operativo (de la calle, no del laboratorio), inteligente, confiable, medible, sostenible. Voz: profesional, directa, segura, con los pies en la operación; habla de resultados con números, sin humo. Español neutro-LATAM (voseo, jerga real del sector: "planchada", "retornables", "fugas invisibles"); inglés US B2B pulido. Tres palabras: **experto, directo, confiable.**

Emociones a evocar: confianza (esto lo construyó gente que vivió la operación), claridad (entiendo el problema y la solución en segundos), urgencia medida (la ventana de competitividad se cierra).

## Anti-references

- **Software logístico legacy:** el look pesado y anticuado de WMS/TMS tradicionales (tablas grises, azul corporativo aburrido, capturas densas e ilegibles).
- **SaaS genérico / "hecho por IA":** cards idénticas repetidas, eyebrow tracked en cada sección, gradient text, fondo cream/beige, layouts predecibles.
- **Oscuro recargado / "demasiado tech":** el estilo dark con overlays pesados sobre fotos que las vuelve ilegibles (ya descartado en este proyecto). La base es light-first limpia.
- **Folleto corporativo genérico:** stock photos de gente sonriendo, claims sin números, jerga de consultoría hueca ("transformación digital", "soluciones de clase mundial").

## Design Principles

1. **Mostrar la operación real, no el folleto.** Imágenes de propuestas reales (flota pesquera, patio de montacargas, almacén con escaneo), no stock genérico. Cada industria se ve distinta.
2. **Prueba con números, no adjetivos.** Todo claim lleva una cifra real o un caso (−10% transporte, 85%→99% carga, 100% trazabilidad).
3. **Legibilidad antes que efecto.** Fotos limpias + texto al lado; el efecto nunca compite con el mensaje. Light-first.
4. **Hablar al negocio, no al sysadmin.** Posicionar como quien diagnostica el problema del cliente/país, no como quien lista features.
5. **Una sola fuente de verdad visual.** Todo desde los tokens del design system (`geodot-design-system/`); cero hex sueltos.

## Accessibility & Inclusion

WCAG AA en texto. Contraste verificado: acento de marca en texto siempre sólido (teal-600 sobre claro, teal-400 sobre oscuro), nunca teal-500 como texto sobre blanco (falla AA). Sin gradient text. Todo el motion respeta `prefers-reduced-motion` (Lenis/GSAP se desactivan; reveals → estado estático). Bilingüe ES/EN. Imágenes con `alt` real.
