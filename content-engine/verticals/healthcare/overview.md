# Healthcare & Pharma — Overview

## Por Qué Este Vertical

Healthcare es el vertical donde Geodot tiene el **diferenciador más fuerte**: no estamos moviendo cajas, estamos moviendo **muestras que pueden salvar vidas**, **medicamentos críticos**, y **pacientes que necesitan atención**.

La logística en salud tiene tolerancia **CERO** al error:
- Una muestra que pierde la cadena de frío = diagnóstico perdido
- Un medicamento que no llega = paciente en riesgo
- Una ambulancia mal asignada = minutos que cuestan vidas

---

## Subsectores

### 1. Laboratorios de Análisis Clínicos 🔬

**Qué hacen**: Recolectan muestras de sangre, orina, tejidos en puntos de extracción (consultorios, hospitales, domicilios) y las transportan al laboratorio central para análisis.

**Complejidad logística**:
- Múltiples puntos de recolección diarios
- Ventanas de tiempo estrictas (muestras tienen vida útil)
- Control de temperatura obligatorio (2-8°C típico)
- Trazabilidad regulatoria
- Rutas que cambian según demanda del día

**Cómo Geodot resuelve**:
- **Ruteo dinámico**: Optimiza rutas según puntos de recolección del día
- **Control de temperatura**: Monitoreo en tiempo real, alertas automáticas
- **Trazabilidad**: Cadena de custodia digital completa
- **Picking en origen**: App móvil para registro de muestras en punto
- **SLA tracking**: Cumplimiento de tiempos de entrega al lab

---

### 2. Farmacias y Distribución Farmacéutica 💊

**Qué hacen**: Gestión de inventario de medicamentos (muchos SKUs, fechas de vencimiento críticas, productos controlados) y distribución a puntos de venta o domicilio.

**Complejidad logística**:
- Miles de SKUs con vencimientos diferentes
- Productos controlados con regulación estricta
- FIFO obligatorio por ley
- Cadena de frío para ciertos productos
- Trazabilidad para recalls

**Cómo Geodot resuelve**:
- **WMS con FIFO nativo**: El sistema fuerza la rotación correcta
- **Gestión de vencimientos**: Alertas antes de que expire
- **Lotes y trazabilidad**: Track completo desde proveedor hasta paciente
- **Zonas de temperatura**: Gestión de almacén con áreas de frío
- **Picking guiado**: Minimiza errores en preparación

---

### 3. Ambulancias y Traslados de Pacientes 🚑

**Qué hacen**: Traslado de pacientes entre clínicas, hospitales, domicilios. Incluye emergencias, traslados programados, y servicios de atención domiciliaria.

**Complejidad logística**:
- Cada "entrega" es una **persona** con necesidades específicas
- Tiempos de respuesta críticos (minutos, no horas)
- Coordinación con personal médico
- Equipamiento específico por tipo de traslado
- Disponibilidad 24/7

**Cómo Geodot resuelve**:
- **Dispatch inteligente**: Asigna la unidad más cercana y adecuada
- **Tracking en tiempo real**: Familia y hospital ven la ubicación
- **Gestión de capacidades**: Qué unidad tiene qué equipamiento
- **Turnos y disponibilidad**: Control de personal y vehículos
- **Reporting**: Tiempos de respuesta, SLAs cumplidos

---

## Diferenciadores vs. Competencia

| Aspecto | Soluciones genéricas | Geodot |
|---------|---------------------|--------|
| **Orientación** | Cajas y entregas | Personas y muestras |
| **Temperatura** | Addon o manual | Nativo e integrado |
| **Trazabilidad** | Básica | Cadena de custodia completa |
| **Urgencia** | Ventanas de horas | Minutos, tiempo real |
| **Dispatch** | FIFO simple | Inteligente por capacidad |

---

## TAM Healthcare LATAM

| Subsector | Empresas Target | ACV Estimado | TAM |
|-----------|-----------------|--------------|-----|
| Labs clínicos | 500+ | $40-80K | $20-40M |
| Distribución pharma | 200+ | $80-150K | $16-30M |
| Ambulancias/traslados | 300+ | $30-60K | $9-18M |
| **Total** | **1,000+** | **$50K avg** | **$45-88M** |

---

## Mensajes Clave

### Headline Principal
> "Cuando lo que mueves son vidas, cada minuto cuenta"

### Subheadline
> "Geodot fue diseñado para la complejidad de la logística en salud: cadena de frío garantizada, trazabilidad completa, y dispatch inteligente que prioriza lo que importa."

### Value Props
1. **Control de temperatura nativo** — No es un addon, es parte del core
2. **Trazabilidad de cadena de custodia** — Del punto de origen al destino final
3. **Dispatch por urgencia y capacidad** — La unidad correcta, al lugar correcto
4. **Compliance listo** — Reportes para auditorías regulatorias

---

## Objeciones Anticipadas

### "Ya tenemos un sistema de despacho"
> "¿Optimiza las rutas automáticamente? ¿Monitorea temperatura en tiempo real? ¿Genera los reportes de compliance que necesitas? Geodot hace todo eso en una sola plataforma."

### "Somos una operación pequeña"
> "Empezamos con operaciones de 5 unidades. Lo importante es que cuando crezcas, el sistema escala contigo sin tener que migrar."

### "La regulación es muy específica"
> "Por eso construimos la trazabilidad pensando en auditorías. Cada movimiento queda registrado con timestamp, temperatura, y responsable."

---

## Casos de Uso Concretos (para desarrollar)

1. **Lab clínico con 15 puntos de extracción**: Cómo optimizamos las rutas de recolección diaria
2. **Cadena de farmacias con 50 sucursales**: Cómo garantizamos FIFO y evitamos vencimientos
3. **Servicio de ambulancias**: Cómo reducimos tiempo de respuesta 40%

