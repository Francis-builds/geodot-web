# Product Marketing Context

*Last updated: 2026-05-29*
*Auto-drafted V1 from repo content (content/*.md, presentaciones/, asset-catalog, design system, web design spec). Review and correct named cases/metrics before external use.*

## Product Overview
**One-liner:** La única plataforma logística que integra WMS, TMS, Ruteo Inteligente y Paletizado con IA — todo conectado, todo visible, todo optimizado.

**What it does:** Geodot conecta cada punto de la cadena logística en una sola plataforma cloud-native. El motor de ruteo y el paletizador trabajan juntos en tiempo real para cargar camiones al 100%, optimizar rutas por valor de negocio (no solo kilómetros) y dar trazabilidad total desde el almacén hasta la entrega. Se integra con el ERP existente (SAP, BASIS, Oracle) sin reemplazarlo, y suma Torre de Control, cadena de frío, gestor documental y módulos de turnos/patio.

**Product category:** Plataforma de logística inteligente / Supply chain operations platform (WMS + TMS + route optimization + load planning + control tower). Los compradores nos buscan como "TMS", "WMS", "software de ruteo", "optimización de carga/paletizado" o "alternativa a SAP TM/EWM".

**Product type:** B2B SaaS (suscripción), con implementación acompañada e integraciones a medida.

**Business model:** SaaS por suscripción, basado en número de usuarios, volumen de operaciones y módulos contratados. Modelos a medida disponibles (ej. "Plan Transparencia" SaaS a 7 años con recálculo de rutas semestral incluido para gobierno). Cotización tras demo. ROI típico < 12 meses (4-6 meses en operaciones grandes).

## Target Audience
**Target companies:** Empresas de México y LATAM (México, Argentina, Colombia, Ecuador) con operación logística física intensiva y flota propia/tercerizada/mixta: embotelladores (Coca-Cola), alimentos y lácteos, operadores logísticos 3PL, recintos fiscales / aduanas, pharma / cadena de frío, gobierno / residuos urbanos, manufactura / parques industriales. Operaciones medianas a grandes (decenas a cientos de camiones, cientos de SKUs).

**Decision-makers:** Director / Gerente de Operaciones; Gerente de Supply Chain / Logística; dueño o gerente general de operador 3PL; jefe de almacén / distribución; gerente de planta; responsable de recinto fiscal / aduanas; CFO / director financiero (firma el ROI); área de TI (valida integración con ERP).

**Primary use case:** Eliminar las "fugas invisibles" de la logística — camiones subutilizados, rutas planeadas a mano, rechazos descubiertos tarde y sistemas desconectados — para reducir costo de transporte, eliminar rechazos y ganar visibilidad total en tiempo real.

**Jobs to be done:**
- "Cargá mis camiones al 100% y eliminá los viajes innecesarios" (paletizado + ruteo simultáneo).
- "Dame visibilidad total de mi flota propia y tercerizada en tiempo real" (Torre de Control + App Companion).
- "Garantizá trazabilidad y cumplimiento (lote, FEFO, vida útil por cliente, cadena de frío, documentación aduanal) para que dejen de rechazarme."

**Use cases:**
- Embotelladores: retornables, paletizado mixto (vidrio/PET/lata/Tetra Pak), integración con BASIS, equipos Tiger.
- Alimentos/lácteos: FEFO automático, reglas de vida útil por cliente (Carrefour 83%), cadena de frío, recall focalizado.
- 3PL: gestión multi-cliente con visibilidad y reportes por cuenta.
- Recintos fiscales/aduanas: control digital, geocercas, conteo por video (CargoCam), trazabilidad para ANAM (caso Grupo Camili AIFA, HIMEX).
- Gobierno/residuos: ruteo de recolección, app ciudadana, KPIs públicos, reducción de CO₂.
- Manufactura/parques industriales: Plant Sync, turnero de camiones/patio, gestor documental (FINSA, Mabe).

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Director de Operaciones / Logística (Champion) | Costo por viaje, % de carga, rechazos, tiempo de planificación | Apaga incendios a diario; planifica rutas a mano (3 hrs/día); flota tercerizada sin control | Camiones al 99%, planificación en 15 min, -75% rechazos, visibilidad 100% |
| Dueño / Gerente de operador 3PL | Margen por cliente, SLA, diferenciarse | Cada cliente pide reportes distintos; sin visibilidad para mostrarles | Plataforma multi-cliente con visibilidad y reportes por cuenta, portal para clientes |
| Gerente de Planta / Almacén (User) | Picking, inventario exacto, vencimientos, turnos de patio | Conocimiento de paletizado en la cabeza del experto; producto que vence en bodega | FEFO/FIFO automático, +300 reglas por SKU documentadas, -40% tiempo de picking, 99.9% precisión |
| Gerente de Recinto Fiscal / Aduanas | Cumplimiento ANAM, evidencia, control de patio | Sin trazabilidad ni evidencia para auditoría; control manual | Control digital, geocercas, conteo por video, trazabilidad 100% para auditoría |
| CFO / Director Financiero (Financial Buyer) | ROI, payback, costo total | Justificar inversión vs. "lo que ya tenemos"; presupuesto | ROI < 12 meses, -5 a -10% costo de transporte, métricas medibles desde día uno |
| TI / Sistemas (Technical Influencer) | Integración con ERP, no romper lo existente | Conectar sistemas con BASIS/SAP es un dolor de cabeza | APIs RESTful propias, integración profunda (no reemplaza el ERP, lo potencia), 99.9% disponibilidad |

## Problems & Pain Points
**Core problem:** La logística tiene fugas que no se ven. El 91% de los camiones salen con espacio sin usar (margen de seguridad del 15%), las rutas se planifican a mano, los rechazos se descubren tarde y cada sistema "habla un idioma diferente". El resultado: costos inflados, clientes insatisfechos y equipos agotados de apagar incendios.

**Why alternatives fall short:**
- Sistemas fragmentados (un sistema rutea, otro paletiza, otro hace picking) que no se hablan → horas perdidas en reconciliación y sin optimización conjunta.
- Suites grandes (SAP TM/EWM, Oracle OTM) son caras, lentas de implementar (6-12 meses), rígidas (reglas fijas, no IA que aprende) y no calculan paletizado + ruteo en simultáneo.
- Excel y planeación manual no escalan, dependen del experto y no dan visibilidad en tiempo real.
- WMS/TMS genéricos no entienden la operación real (retornables, planchadas, vidrio abajo, reglas de vida útil por cliente, cadena de frío).

**What it costs them:** +15% costos de transporte por camiones subutilizados, +20% km innecesarios, +25% órdenes rechazadas, pérdidas por vencimiento, multas/rechazos de supermercados, quejas ciudadanas (gobierno), riesgo de incumplimiento aduanal, y horas-persona perdidas en planificación y reconciliación.

**Emotional tension:** Vivir apagando incendios; miedo a que el camión llegue tarde o el producto vencido; frustración de explicar la operación a proveedores que "aprendieron de libros"; ansiedad de que el conocimiento se vaya cuando el experto renuncia.

## Competitive Landscape
**Direct:** SAP TM / SAP EWM, Oracle OTM — caros, 6-12 meses de implementación, rígidos, sin IA que aprende, y no integran paletizado + ruteo en tiempo real. Geodot los potencia (no los reemplaza) y entrega resultados en 90 días.
**Secondary:** WMS/TMS genéricos y software de ruteo standalone — resuelven una pieza pero dejan los sistemas desconectados y no entienden la operación específica (retornables, FEFO por cliente, cadena de frío, recintos).
**Indirect:** Excel + planeación manual + WhatsApp / desarrollo in-house — barato de empezar pero no escala, depende del experto, sin visibilidad en tiempo real y consume horas diarias.

## Differentiation
**Key differentiators:**
- Única plataforma que calcula **ruteo + paletizado en simultáneo** → carga al 99.9% (vs. 85% tradicional), elimina el margen de seguridad del 15%.
- Plataforma **integrada de verdad** (WMS + TMS + Ruteo + Paletizado + Torre de Control + cadena de frío + gestor documental), no módulos sueltos.
- **IA que aprende** de cada entrega (ETAs más precisos, rutas mejores) vs. reglas fijas.
- **Implementación rápida (90 días)** sin reemplazar el ERP — integración profunda con SAP, BASIS (Release 53), Oracle vía APIs propias.
- **Experiencia de operación real**: +40 años combinados, +15 años con embotelladores Coca-Cola. "No tuvimos que explicar qué es una planchada ni por qué el vidrio va abajo."
- **Sostenibilidad cuantificada**: reporta km evitados, litros de combustible y toneladas de CO₂ por cliente.
- **Empresa LATAM, soporte en español nativo**, presencia MX/AR/CO/EC.

**How we do it differently:** El motor de ruteo y el paletizador comparten +300 parámetros en tiempo real, así sabemos exactamente qué entra en el camión ANTES de rutear. Todo el conocimiento del experto queda documentado y automatizado por SKU.

**Why that's better:** Menos camiones, menos km, menos rechazos, menos emisiones, menos dependencia del experto — con métricas medibles desde el día uno.

**Why customers choose us:** Resultado conjunto (no parcial), entendimiento real de la operación, time-to-value rápido y ROI < 12 meses.

## Objections
| Objection | Response |
|-----------|----------|
| "Ya tenemos SAP / un ERP, no quiero otro sistema." | Geodot no reemplaza tu ERP, lo potencia. Nos integramos con SAP, BASIS y Oracle vía APIs RESTful; llegamos a un detalle (pack, pallet, ubicación, paletizado) que ni SAP S/4HANA alcanza. |
| "Implementar software logístico tarda 6-12 meses." | Ruteo básico en 4-6 semanas; WMS + Ruteo en 2-3 meses; plataforma completa en 3-4 meses. Resultados en 90 días, no un año. |
| "¿De verdad puedo cargar al 100%? Sería romper mi margen de seguridad." | Sí: calculamos paletizado y ruteo a la vez, sabemos qué entra antes de cargar. Embotellador regional pasó de 85% a 99% de carga y -8% en costo de transporte. |
| "Nuestra operación es muy particular." | Por eso. Geodot nació de la operación real (Coca-Cola, retornables, FEFO por cliente, cadena de frío, recintos) y es altamente configurable: +300 parámetros por SKU. |
| "¿Y el hardware? ¿Tengo que cambiar todo?" | No. Trabajamos con Android estándar, lectores Zebra existentes y cualquier proveedor de GPS. |
| "¿Tienen soporte en español?" | Somos empresa mexicana con presencia en LATAM; todo el equipo es hispanohablante nativo. |

**Anti-persona:** Operaciones puramente digitales/sin logística física; micro-operaciones de 1-5 vehículos sin presupuesto ni equipo de TI; empresas que buscan solo un GPS de tracking barato sin interés en integración ni optimización.

## Switching Dynamics
**Push:** Camiones a 85%, 3 hrs/día planificando a mano, flota tercerizada sin control, rechazos por horario/vida útil, producto que vence en bodega, costos que suben.
**Pull:** Carga al 100%, planificación en 15 min, visibilidad total en tiempo real, ROI < 12 meses, sostenibilidad medible, equipo que ya vivió la operación.
**Habit:** "Así lo hicimos siempre"; el experto que arma el paletizado de memoria; Excel + WhatsApp + el ERP existente.
**Anxiety:** Miedo a reemplazar el ERP, a una implementación larga, a romper el margen de seguridad, a que "no entiendan mi operación". Se neutraliza con: no reemplaza el ERP, 90 días, casos reales en su industria, configuración a medida.

## Customer Language
**How they describe the problem:**
- "Cargamos los camiones al 85% por el margen de seguridad."
- "Pasamos 3 horas diarias armando rutas a mano."
- "La flota tercerizada opera sin control."
- "Los supermercados nos rechazan por vida útil."
- "No sé exactamente qué lote le entregué a cada cliente."
- "Me entero de los problemas cuando ya hay quejas."
**How they describe us:**
- "Geodot entiende nuestra operación porque la ha vivido."
- "No tuvimos que explicar qué es una planchada o por qué el vidrio va abajo. Ya lo sabían."
- "Ahora podemos rastrear todo en minutos, no en días."
- "El equipo de implementación habla nuestro idioma."
**Words to use:** carga al 100%, fugas invisibles, ruteo + paletizado simultáneo, visibilidad en tiempo real, trazabilidad por lote, FEFO/FEFO automático, vida útil por cliente, cadena de frío, planchada, retornables, Torre de Control, "potencia tu ERP, no lo reemplaza", ROI medible, km evitados, CO₂, 90 días.
**Words to avoid:** "magia", promesas sin números, jerga de consultoría hueca, "transformación digital" sin evidencia, "reemplazá tu sistema" (genera ansiedad), tono académico/de laboratorio.
**Glossary:**
| Term | Meaning |
|------|---------|
| Planchada | Margen de espacio/seguridad que se deja sin cargar en el camión |
| Retornables | Envases que vuelven vacíos y exigen reservar espacio en el camión |
| FEFO / FIFO | First Expired/First In, First Out — orden de salida de inventario |
| Vida útil por cliente | % de vida de anaquel mínimo que cada cliente exige (ej. Carrefour 83%) |
| Torre de Control | Dashboard central de visibilidad/KPIs/alertas en tiempo real |
| App Companion | App del conductor para ruta, entrega, firma, rechazos y liquidación |
| Paletizado inteligente | Cálculo de carga del pallet/camión con +300 parámetros |
| Tiger | Equipo para mover camadas completas en almacén |
| BASIS | ERP central de embotelladores Coca-Cola (Release 53) |
| Recinto fiscal | Almacén bajo control aduanal (ANAM en MX) |
| Etiqueta Zero | Solución que elimina re-etiquetado manual |
| CargoCam | Conteo por video con IA para recintos/aduanas (caso HIMEX) |

## Brand Voice
**Tone:** Profesional, directo, seguro, con los pies en la operación. Habla de resultados con números, sin humo.
**Style:** Conversacional pero experto; frases cortas y escaneables; problema → solución → prueba; español neutro-LATAM (México-leaning). EN = US B2B pulido.
**Personality:** Operativo (de la calle, no del laboratorio), inteligente (IA que aprende), confiable, medible, sostenible.

## Proof Points
**Metrics:**
- -5% a -10% costo de transporte
- +14-15% carga de camión (85% → 99%)
- -15 a -20% kilómetros recorridos
- -25% órdenes rechazadas (-75% rechazos por horario en caso embotellador)
- -90 a -92% tiempo de planificación de rutas (3 hrs → 15 min)
- 100% trazabilidad y visibilidad de flota
- -80% pérdidas por vencimiento; 100% / -70% rechazos por vida útil
- -40% tiempo de picking; 99.9% precisión de inventario
- Cadena de frío: -95% excursiones de temperatura, 100% trazabilidad de temperatura
- Sostenibilidad: ~70 ton CO₂/año evitadas (caso gobierno)
- ROI típico < 12 meses (4-6 meses en operaciones grandes); implementación 90 días

**Customers:** Embotelladores de Coca-Cola (incl. Arca Continental — en evaluación), Celema (lácteos Colombia), Alcaldía Benito Juárez (CDMX), Grupo Camili (recinto fiscal 7,000 m² AIFA), HIMEX (aduanas/CargoCam), Megafarmacia (pharma/cadena de frío), Grupo Makvig (abarrotes SEDENA), Mabe (ecommerce LATAM), Gruas Laguna, FINSA (parque industrial). *(Confirmar permiso de uso de logo/nombre por caso antes de publicar.)*

**Testimonials:**
> "Geodot entiende nuestra operación porque la ha vivido. No tuvimos que explicar qué es una planchada o por qué el vidrio va abajo. Ya lo sabían. El equipo de implementación habla nuestro idioma." — Director de Operaciones, embotellador regional Coca-Cola
> "Ahora sabemos exactamente qué lote entregamos a cada cliente. Si hay un problema, podemos rastrear todo en minutos, no en días. Los supermercados dejaron de rechazarnos." — Gerente de Supply Chain, empresa láctea (Colombia)
> "Con Geodot pasamos de cargar camiones al 85% a cargarlos al 100%. Eso significó eliminar viajes innecesarios y reducir nuestros costos de transporte en más del 8%." — Director de Operaciones, embotelladora regional

**Value themes:**
| Theme | Proof |
|-------|-------|
| Carga al 100% (no más camiones a medias) | 85% → 99% carga, -8% costo de transporte (embotellador) |
| Visibilidad y trazabilidad total | 100% visibilidad de flota; rastreo de lote en minutos (lácteos) |
| Cero rechazos / cumplimiento | -75% rechazos por horario; 100% cumplimiento vida útil; cadena de frío -95% excursiones |
| Time-to-value rápido vs SAP | 90 días vs 6-12 meses; ROI < 12 meses |
| Sostenibilidad medible | ~70 ton CO₂/año, km y combustible evitados reportados por cliente |
| Experiencia real de operación | +40 años combinados, +15 con Coca-Cola |

## Goals
**Business goal:** Generar pipeline de demos calificadas con operaciones medianas-grandes de MX/LATAM y avanzarlas a propuesta/ROI.
**Conversion action:** **Agendar Demo** (primario). Secundarios: "Calculá tu ROI" / calculadora de ahorro, "Hablar con un especialista".
**Current metrics:** No instrumentadas en el repo aún (definir baseline de visitas → demos en el sitio nuevo).
