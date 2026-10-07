# Hero maqueta, fase 1 (acceso → patio → andén): plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Una película en loop de unos 12 s para el hero de la home en desktop. El camión frena en la pluma en fotorrealista, un barrido de lectura lo pasa a vista técnica y se levanta el techo del depósito. Después cruza el patio y retrocede al andén con física real, mientras un HUD en HTML con cards fijas sigue al camión con líneas guía.

**Architecture:** `video-blender/` es un pipeline Python con dos mitades. `plan/` es Python puro (numpy): geometría del sitio, cinemática, controladores y ruta, y genera `route.json`. `kit/`, `render/`, `export/` y `scene/` corren dentro de Blender headless, consumen `route.json` y producen frames técnicos y fotorrealistas más `film-anchors.json`. `post/` compone el barrido, el halo y la viñeta con PIL, y `render.sh` encodea y copia a `public/hero/`. En la web, `lib/hero/` tiene lógica pura testeada (schema, interpolación, mapeo `object-fit: cover`, líneas guía) y `components/hero/HeroFilm.tsx` monta el video y el HUD sincronizado con `requestVideoFrameCallback`.

**Tech Stack:** Blender 5.2 (bpy, EEVEE + Freestyle, Cycles/Metal), Python 3.12 + numpy + Pillow + pytest, ffmpeg, Next.js 16 / React 19 / TS strict / Tailwind v4 / next-intl / zod, tests con `tsx --test`.

**Spec:** `docs/superpowers/specs/2026-10-07-hero-maqueta-design.md`. Base portable: `~/Documents/Geodot/hero-blender-spike/` (`scene.py`, `planner.py`, `photo.py`, `overlay.py`). Se porta desde ahí, no se reescribe de cero.

## Global Constraints

- Acento único **teal `#1AB7A8`** para el objeto seguido; líneas no destacadas en gris azulado `(0.52, 0.66, 0.90)`.
- **Prohibido interpolar poses a mano:** cada pose del camión sale de `plan/` (cinemática + controlador).
- **Holgura mínima > 0,10 m** en toda la ruta, contra vecinos, edificio, fila del patio, caseta y pluma.
- **Patio de maniobra ≥ 30 m.**
- **Las cards del HUD quedan a ≥ 6% del ancho** del video desde el borde y **no se superponen con el bloque de copy del hero** (columna izquierda): van en la mitad derecha.
- **Textos del HUD en `messages/{es,en}.json`** (`hero.film.*`). Datos ficticios y genéricos, sin clientes reales ni marcas.
- **El video no lleva texto.** Todo dato visible es HTML.
- Video y HUD con `aria-hidden`, más un resumen estático `sr-only`. Con `prefers-reduced-motion`: poster con las cards en su estado final, sin video.
- `<video muted loop playsInline preload="none">`, montado después del LCP. **El H1 sigue siendo el LCP. Lighthouse mobile ≥ 90.**
- **Fase 1 solo desktop (`md+`).** En mobile sigue `HeroCanvas` hasta la fase 3.
- Peso objetivo de los ~12 s a 1920×1080: **≤ 4 MB** el mp4 (proporcional a los 5–8 MB por 26 s de la spec).
- Los frames y renders intermedios **no van a git**. Solo `public/hero/film-1080.{mp4,webm}`, `film-poster.webp` y `film-anchors.json`.
- TS estricto, sin `any`. Python con type hints en `plan/` y `post/`.

## Review Focus

1. **Viewport muy ancho o muy alto con `object-fit: cover`:** el anclaje puede quedar fuera del área visible. La línea guía no se dibuja y la card sigue visible (test en Task 8).
2. **Vuelta del loop:** con `mediaTime` cerca o más allá de la duración, el frame se envuelve sin parpadeo ni cards del frame 0 fuera de su cue (test en Task 8).
3. **`film-anchors.json` que falla** (404 o JSON inválido): el video se reproduce sin HUD y no rompe (test en Task 8, parse → `null`).
4. **Formato numérico según idioma:** "18,4 t" en ES y "18.4 t" en EN, y la distancia con un decimal (test en Task 8).
5. **Sin `requestVideoFrameCallback`** (Firefox viejo): fallback a `requestAnimationFrame` leyendo `currentTime`. Mismo cálculo de frame (test de `frameIndex` en Task 8).

---

## File Structure

```
video-blender/
  README.md                 cómo planificar, renderizar y publicar
  requirements.txt          numpy, pillow, pytest
  render.sh                 pipeline completo plan → anchors → técnico → foto → post → encode → public/hero
  plan/site.py              ÚNICA fuente del layout (andenes, ocupados, patio, acceso, edificio) + obstacles()
  plan/kinematics.py        geometría del equipo, State, step(), rig_rects(), sat_gap(), clearance()
  plan/controllers.py       pure_pursuit_steer() hacia adelante, reverse_dock_steer() para retroceder
  plan/route.py             plan_route() → Timeline (frames, cues, reporte) → route.json
  post/composite.py         wipe_mask(), glow_vignette(), compose_frame() con PIL
  kit/primitives.py         box/cyl/prism/empty/bevel (port del spike)
  kit/materials.py          emisión técnica + PBR fotorrealista (port de photo.py)
  kit/trucks.py             tractor + semirremolque (port) + cabina curva
  kit/site_build.py         edificio en corte, andenes, pintura, acceso con caseta y pluma
  render/camera.py          cámara isométrica ortográfica + keyframes
  render/technical.py       Freestyle + linesets
  render/photo.py           Cycles + sol + HDRI + asfalto
  export/anchors.py         proyección por frame → film-anchors.json
  scene/hero.py             punto de entrada Blender: --mode check|technical|photo|anchors
  tests/test_kinematics.py  tests/test_controllers.py  tests/test_route.py
  tests/test_composite.py   tests/test_blender_smoke.py
  assets/                   Poly Haven CC0 (asfalto aéreo, cielo) + JetBrains Mono (OFL)
lib/hero/film.ts            tipos + schema zod de film-anchors.json, frameIndex, frameAt, cueAlpha, formatHud
lib/hero/geometry.ts        videoToBox (cover), leaderPath, cardRects
lib/hero/film.test.ts       lib/hero/geometry.test.ts
components/hero/HudCard.tsx presentacional
components/hero/HeroFilm.tsx video + SVG de líneas + cards, sincronizado
components/HomeHero.tsx     (modificar) HeroFilm en md+, HeroCanvas en mobile
messages/es.json, messages/en.json  (modificar) hero.film.*
.gitignore                  (modificar) video-blender/out/
```

**Contrato `route.json`** (lo escribe `plan/route.py` y lo lee `scene/hero.py`):
`{"fps": 24, "frames": [{"R": [x, y], "yaw": float, "art": float, "steer": float}], "cues": {"scanStart": int, "scanEnd": int, "barrierUp": int, "roofStart": int, "roofEnd": int, "docked": int}, "report": {"minClearance": float, "maxArt": float}}`
Convención del spike: `R` es la trasera del tráiler en el piso, `yaw` = rumbo del tráiler + π/2, `art` = rumbo tractor − rumbo tráiler, `steer` = ángulo del volante (positivo = CCW).

**Contrato `film-anchors.json`** (lo escribe `export/anchors.py` y lo lee `lib/hero/film.ts`):
`{"fps": 24, "width": 1920, "height": 1080, "frames": [{"tractor": [x, y], "driver": [x, y], "trailer": [x, y], "dist": float, "art": float, "status": "gate"|"yard"|"maneuver"|"docked"}], "cues": {"truckCard": int, "cargoCard": int, "docked": int}}`. Coordenadas 0..1 con origen arriba a la izquierda, una entrada por frame del video.

---

### Task 1: Layout del sitio y cinemática (Python puro)

**Files:**
- Create: `video-blender/plan/site.py`, `video-blender/plan/kinematics.py`, `video-blender/requirements.txt`, `video-blender/tests/test_kinematics.py`
- Modify: `.gitignore` (agregar `video-blender/out/` y `video-blender/**/__pycache__/`)

**Interfaces:**
- Produces (`site.py`): `DOCK = 4.3`, `HERO_DOCK = 11`, `Y_DOCK = -0.35`, `Y_YARD = -78.0`, `def dock_x(i: int) -> float` (= `(i - 8.5) * DOCK`), `OCCUPIED: dict[int, bool]` (la del spike, andenes 3–23), `YARD_X: tuple[float, ...]`, `GATE: Gate` (dataclass `x: float, y: float, lane_heading: float, booth: Rect, barrier: Rect`), `def obstacles(include_gate: bool = True) -> list[Poly]`.
- Produces (`kinematics.py`): constantes del spike `KP=14.95, TR_AXLE=2.2, L1=12.75, A=0.15, LW=6.4`, footprints `TRAILER=(0.0, 16.15, 1.36)`, `TRACTOR=(-1.5, 7.63, 1.30)`, `MIRRORS=(4.9, 5.1, 1.70)`. `@dataclass(frozen=True) class State: R: np.ndarray; phi1: float; phi0: float; steer: float`. `def step(s: State, v: float, steer: float, dt: float) -> State`. `def rig_rects(s: State) -> list[Poly]`. `def sat_gap(p: Poly, q: Poly) -> float`. `def clearance(s: State, obst: list[Poly]) -> float`. `Poly = list[np.ndarray]`.
- El acceso queda sobre el extremo este del pasillo: el camión entra yendo hacia −x. `GATE.x = dock_x(24) + 30`, `GATE.y = -39.0`. La caseta es un rectángulo de 3×2,5 m al sur del carril; la pluma (brazo) es un obstáculo **solo mientras está baja** (`obstacles` la incluye y `route.py` la excluye desde `barrierUp`).

- [ ] **Step 1: Escribir los tests que fallan**

```python
def test_docked_rig_clears_neighbors():
    s = docked_state(HERO_DOCK)  # helper del test: R=(dock_x(11), Y_DOCK), phi=-pi/2
    assert clearance(s, obstacles()) > 0.10

def test_trailer_aligns_when_driving_straight():
    s = State(np.array([0.0, 0.0]), phi1=0.3, phi0=0.0, steer=0.0)
    for _ in range(int(60 / 0.02)):
        s = step(s, v=1.0, steer=0.0, dt=0.02)
    assert abs(s.phi0 - s.phi1) < math.radians(0.5)

def test_reverse_straight_amplifies_hitch_angle():
    s = State(np.array([0.0, 0.0]), phi1=0.05, phi0=0.0, steer=0.0)
    for _ in range(int(10 / 0.02)):
        s = step(s, v=-1.0, steer=0.0, dt=0.02)
    assert abs(s.phi0 - s.phi1) > 0.05

def test_sat_gap_sign():
    a = rect_at(0, 0, 2, 2); b = rect_at(3, 0, 2, 2); c = rect_at(1, 0, 2, 2)
    assert sat_gap(a, b) == pytest.approx(1.0)
    assert sat_gap(a, c) < 0
```

- [ ] **Step 2: Correrlos y ver que fallan**

Run: `cd video-blender && python3 -m pytest tests/test_kinematics.py -v`
Expected: FAIL con `ModuleNotFoundError: plan.kinematics`.

- [ ] **Step 3: Implementar `site.py` y `kinematics.py`**

Portar de `hero-blender-spike/planner.py`: `rect`, `rig_rects`, `sat_gap` y el paso de integración generalizado con `steer`. La velocidad angular del perno rey es `Kdot = v*u(phi0) + A*dphi0*n(phi0)` y `dphi1 = Kdot·n(phi1) / L1`, que vale para `v` negativa. Quedan como funciones puras, sin estado global.

- [ ] **Step 4: Correr los tests y ver que pasan**

Run: `cd video-blender && python3 -m pytest tests/test_kinematics.py -v`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add video-blender/plan video-blender/tests/test_kinematics.py video-blender/requirements.txt .gitignore
git commit -m "feat(hero): layout del sitio y cinemática tractor+semirremolque"
```

### Task 2: Controladores de avance y de retroceso al andén

**Files:**
- Create: `video-blender/plan/controllers.py`, `video-blender/tests/test_controllers.py`

**Interfaces:**
- Consumes: `State`, `step`, `clearance`, `obstacles` (Task 1).
- Produces: `def pure_pursuit_steer(s: State, path: np.ndarray, lookahead: float = 9.0, max_steer: float = math.radians(35)) -> float` (path = polilínea Nx2 que sigue el **eje trasero del tractor**). `def reverse_dock_steer(s: State, dock_line: tuple[np.ndarray, np.ndarray], max_steer: float = math.radians(35)) -> float`. `def drive(s: State, v: float, controller: Callable[[State], float], until: Callable[[State], bool], dt: float = 0.02, steer_rate: float = math.radians(25)) -> list[State]`: limita la velocidad de giro del volante a `steer_rate` rad por metro recorrido, igual que el spike.
- El retroceso es un control en cascada: (1) pure pursuit del **eje del tráiler** sobre el eje del andén (yendo hacia atrás) da el rumbo deseado del tráiler; (2) ese rumbo da el ángulo de articulación deseado `art* = clamp(k1·(phi1* − phi1), ±45°)`; (3) el volante sale de `steer = atan(LW · (k2·(art* − art) + art_ff) / ...)`, con ganancias a ajustar. La forma exacta la decide el implementador. La fijan los tests.

- [ ] **Step 1: Escribir los tests que fallan**

Los helpers `gate_stop_state()`, `aisle_stop_state(x)`, `AISLE_PATH` (polilínea del carril y = −39 desde el acceso hasta el andén 5) y `lateral_error(s, path)` viven en `tests/conftest.py`. En Task 1, `docked_state(i)` y `rect_at(cx, cy, w, h)` también.

```python
def test_pure_pursuit_follows_aisle_and_turns():
    # el camión entra por el acceso hacia -x y sigue un carril con una curva suave
    states = drive(gate_stop_state(), 4.0, lambda s: pure_pursuit_steer(s, AISLE_PATH),
                   until=lambda s: s.R[0] < dock_x(13))
    assert max(abs(lateral_error(s, AISLE_PATH)) for s in states[-50:]) < 0.3

def test_reverse_into_dock_11_from_aisle():
    start = aisle_stop_state(x=dock_x(11) - 24.0)  # pasó el andén yendo hacia -x y frenó
    line = (np.array([dock_x(11), Y_DOCK]), np.array([dock_x(11), Y_DOCK - 40.0]))
    states = drive(start, -1.5, lambda s: reverse_dock_steer(s, line),
                   until=lambda s: s.R[1] >= Y_DOCK - 0.01)
    end = states[-1]
    assert abs(end.R[0] - dock_x(11)) < 0.10
    assert abs(end.phi1 - (-math.pi / 2)) < math.radians(1.0)
    assert abs(end.phi0 - end.phi1) < math.radians(3.0)
    assert min(clearance(s, obstacles(include_gate=False)) for s in states[::5]) > 0.10
    assert max(abs(s.phi0 - s.phi1) for s in states) < math.radians(60)  # sin tijera
```

- [ ] **Step 2: Correrlos y ver que fallan**

Run: `cd video-blender && python3 -m pytest tests/test_controllers.py -v`
Expected: FAIL con `ImportError`.

- [ ] **Step 3: Implementar `controllers.py`**

Si el retroceso no converge con holgura > 0,10 m desde `x = dock_x(11) - 24`, la distancia de frenado (−24) es un parámetro que el test puede ajustar entre −18 y −32. La **tolerancia final no se relaja**.

- [ ] **Step 4: Correr los tests y ver que pasan**

Run: `cd video-blender && python3 -m pytest tests/test_controllers.py -v`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add video-blender/plan/controllers.py video-blender/tests/test_controllers.py
git commit -m "feat(hero): pure pursuit y control en cascada para retroceder al andén"
```

### Task 3: Ruta completa y línea de tiempo → `route.json`

**Files:**
- Create: `video-blender/plan/route.py`, `video-blender/tests/test_route.py`

**Interfaces:**
- Consumes: Tasks 1 y 2.
- Produces: `@dataclass class Timeline: frames: list[State]; cues: dict[str, int]; min_clearance: float; max_art: float`. `def plan_route(fps: int = 24) -> Timeline`. `def write_route(t: Timeline, path: Path) -> None` (contrato `route.json` de arriba). CLI: `python3 -m plan.route out/route.json` imprime el reporte.
- **Línea de tiempo (24 fps, 288 frames ≈ 12 s):**
  - 0–60: se acerca y frena en la pluma (velocidad que baja hasta 0).
  - 60–120: quieto. `scanStart=72`, `scanEnd=120`, `barrierUp=104`, `roofStart=96`, `roofEnd=144`.
  - 120–~200: avanza por el pasillo y frena pasado el andén.
  - ~200–270: retrocede al andén. `docked` = primer frame acoplado.
  - Hasta 288: quieto acoplado.
- Las poses se remuestrean por **distancia recorrida** con perfiles de velocidad suaves (acelerar y frenar), nunca interpolando entre poses. El retroceso puede ir comprimido en el tiempo (5–7 km/h reales se muestran más rápido): eso cambia el ritmo, no la geometría.

- [ ] **Step 1: Escribir los tests que fallan**

```python
def test_timeline_length_and_cues():
    t = plan_route()
    assert len(t.frames) == 288
    assert t.cues["scanStart"] == 72 and t.cues["scanEnd"] == 120 and t.cues["barrierUp"] == 104
    assert 200 <= t.cues["docked"] <= 280

def test_stationary_at_barrier_during_scan():
    t = plan_route()
    xs = [t.frames[i].R for i in range(60, 104)]
    assert max(np.linalg.norm(x - xs[0]) for x in xs) < 1e-6

def test_no_teleport_between_frames():
    t = plan_route()
    jumps = [np.linalg.norm(b.R - a.R) for a, b in zip(t.frames, t.frames[1:])]
    assert max(jumps) < 0.6  # < 52 km/h a 24 fps

def test_clearance_and_final_pose():
    t = plan_route()
    assert t.min_clearance > 0.10
    end = t.frames[-1]
    assert abs(end.R[0] - dock_x(HERO_DOCK)) < 0.10 and abs(end.R[1] - Y_DOCK) < 0.10

def test_route_json_roundtrip(tmp_path):
    p = tmp_path / "route.json"; write_route(plan_route(), p)
    d = json.loads(p.read_text())
    assert d["fps"] == 24 and len(d["frames"]) == 288 and {"R", "yaw", "art", "steer"} <= d["frames"][0].keys()
```

- [ ] **Step 2: Correrlos y ver que fallan**

Run: `cd video-blender && python3 -m pytest tests/test_route.py -v`
Expected: FAIL con `ImportError`.

- [ ] **Step 3: Implementar `route.py`**

- [ ] **Step 4: Correr toda la suite y ver que pasa**

Run: `cd video-blender && python3 -m pytest -v && python3 -m plan.route out/route.json`
Expected: todos pasan; el reporte imprime `holgura mínima` > 0.10.

- [ ] **Step 5: Commit**

```bash
git add video-blender/plan/route.py video-blender/tests/test_route.py
git commit -m "feat(hero): ruta acceso→andén con línea de tiempo y cues"
```

### Task 4: Kit de Blender (camión, sitio en corte, acceso) y prueba de humo

**Files:**
- Create: `video-blender/kit/{primitives,materials,trucks,site_build}.py`, `video-blender/scene/hero.py`, `video-blender/tests/test_blender_smoke.py`, `video-blender/assets/` (copiar `ph/` y la fuente desde el spike)

**Interfaces:**
- Consumes: `plan/site.py` (Blender lo importa agregando `video-blender/` a `sys.path`). **No se duplica el layout en el kit.**
- Produces:
  - `kit/trucks.py`: `def truck(col, name: str, x: float, y: float, yaw: float = 0.0, art: float = 0.0, with_tractor: bool = True) -> Object`. Crea `<name>`, `<name>_piv`, `<name>_piv_steerL` y `<name>_piv_steerR` (ruedas delanteras con su pivote de dirección).
  - `kit/site_build.py`: `def build_site(cols) -> SiteObjects`, con `roof_panels: list[Object]` (paneles del techo, nombres `ROOF_panel_###`), `facade: list[Object]` (la pared de andenes que mira a la cámara), `barrier: Object` (`GATE_barrier`, pivote en el poste) y `booth: Object` (`GATE_booth`).
  - `scene/hero.py`: CLI `blender -b --factory-startup -P scene/hero.py -- --mode check|technical|photo|anchors --route out/route.json --out out/<dir> [--res 1920x1080] [--step N] [--frames A-B]`.
  - `--mode check` arma la escena, valida los nombres de arriba e imprime `CHECK OK <n_objects>`.
- **Cabina curva:** capó y techo de la cabina con subdivisión nivel 2 sobre el prisma actual, con bordes marcados donde se necesita que sigan saliendo líneas Freestyle. Es lo que reemplaza la compra del tractor.

- [ ] **Step 1: Escribir la prueba de humo que falla**

```python
BLENDER = shutil.which("blender") or "/Applications/Blender.app/Contents/MacOS/Blender"
@pytest.mark.skipif(not Path(BLENDER).exists(), reason="sin Blender")
def test_scene_builds(tmp_path):
    route = tmp_path / "route.json"; write_route(plan_route(), route)
    out = subprocess.run([BLENDER, "-b", "--factory-startup", "-P", "scene/hero.py", "--",
                          "--mode", "check", "--route", str(route), "--out", str(tmp_path)],
                         capture_output=True, text=True, timeout=300)
    assert "CHECK OK" in out.stdout, out.stdout[-2000:] + out.stderr[-2000:]
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `cd video-blender && python3 -m pytest tests/test_blender_smoke.py -v`
Expected: FAIL (no existe `scene/hero.py`).

- [ ] **Step 3: Implementar los cuatro módulos del kit y `scene/hero.py --mode check`**

Portar de `hero-blender-spike/scene.py` y `photo.py`. Separar por responsabilidad según el File Structure. Sacar las etiquetas 3D. Mantener los números pintados en el piso.

- [ ] **Step 4: Correr la prueba y ver que pasa**

Run: `cd video-blender && python3 -m pytest tests/test_blender_smoke.py -v`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add video-blender/kit video-blender/scene video-blender/tests/test_blender_smoke.py video-blender/assets
git commit -m "feat(hero): kit de Blender con sitio en corte, acceso con pluma y cabina curva"
```

### Task 5: Animación, cámara isométrica y render técnico

**Files:**
- Create: `video-blender/render/camera.py`, `video-blender/render/technical.py`
- Modify: `video-blender/scene/hero.py` (modo `technical`), `video-blender/tests/test_blender_smoke.py`

**Interfaces:**
- Consumes: `route.json` (frames y cues), `SiteObjects` (Task 4).
- Produces:
  - `render/camera.py`: `def iso_camera(scene, keys: list[CamKey]) -> Object`, con `CamKey(frame: int, target: tuple[float, float], ortho_scale: float)`. Orientación isométrica fija: rotación `(60°, 0, 45°)` (de frente a la pared de andenes desde el sureste). Encuadre: frames 0–120 sobre el acceso (escala 48), 120–200 paneo siguiendo al camión (escala 60), y desde 230 cierre sobre el andén 11 (escala 44).
  - `render/technical.py`: `def setup_technical(scene, cols) -> None` (Freestyle con los linesets del spike, líneas visibles 0,7 y ocultas 0,5, teal para la colección `HERO`).
- **Animación:** el camión toma la pose de `route.json` en cada frame (ubicación, yaw, pivote `art` y ruedas `steer`, como en el spike). La pluma rota 85° entre `barrierUp` y `barrierUp+12`. Los paneles del techo y de la fachada se levantan 6 m y se desvanecen con un escalonado de 1 frame por panel, ordenado según el barrido (de este a oeste), entre `roofStart` y `roofEnd`.

- [ ] **Step 1: Ampliar la prueba de humo**

`test_technical_frames(tmp_path)`: renderiza `--mode technical --res 480x270 --frames 1-288 --step 96` y comprueba que se escriben `f_0001.png`, `f_0097.png`, `f_0193.png` y `f_0289.png` de 480×270, y que el frame 1 no es todo negro (media de luminancia > 2).

- [ ] **Step 2: Correrla y ver que falla**

Run: `cd video-blender && python3 -m pytest tests/test_blender_smoke.py -v`
Expected: FAIL en `test_technical_frames`.

- [ ] **Step 3: Implementar cámara, render técnico y keyframes**

- [ ] **Step 4: Correr la prueba y hacer una revisión visual**

Run: `cd video-blender && python3 -m pytest tests/test_blender_smoke.py -v` → 2 passed.
Después: vista previa a 960×540 con `--step 4`, armar un mosaico de 4 frames (0, 104, 160, 288) y **mandárselo a Fran** antes de seguir (checkpoint de encuadre).

- [ ] **Step 5: Commit**

```bash
git add video-blender/render video-blender/scene/hero.py video-blender/tests/test_blender_smoke.py
git commit -m "feat(hero): cámara isométrica, pluma y techo animados, render técnico"
```

### Task 6: Exportar los anclajes del HUD

**Files:**
- Create: `video-blender/export/anchors.py`
- Modify: `video-blender/scene/hero.py` (modo `anchors`), `video-blender/tests/test_blender_smoke.py`

**Interfaces:**
- Consumes: la escena animada (Task 5) y `route.json`.
- Produces: `def export_anchors(scene, cam, route: dict, out: Path, size: tuple[int, int]) -> None` escribe `film-anchors.json` (contrato de arriba).
  - Anclajes en coordenadas locales del spike: `tractor` es `HERO_piv @ (0, -3.65, 4.0)`, `driver` es `HERO_piv @ (-1.25, -4.4, 3.0)` y `trailer` es `HERO @ (0, -8.0, 4.1)`.
  - `dist` es la distancia de `R` al punto del andén en metros. `art` va en grados absolutos.
  - `status`: `gate` antes de `barrierUp`, `yard` hasta empezar a retroceder, `maneuver` hasta `docked`, y `docked` después.
  - Cues: `truckCard = scanEnd - 8`, `cargoCard = scanEnd + 24` y `docked`.

- [ ] **Step 1: Ampliar la prueba de humo**

`test_anchors_export(tmp_path)`: corre `--mode anchors --res 1920x1080` y comprueba que hay 288 frames, que todos los `x, y` están en `[0, 1]`, que `frames[-1]["status"] == "docked"` y que `frames[0]["status"] == "gate"`.

- [ ] **Step 2: Correrla y ver que falla**

Run: `cd video-blender && python3 -m pytest tests/test_blender_smoke.py::test_anchors_export -v`
Expected: FAIL.

- [ ] **Step 3: Implementar con `world_to_camera_view`, como en el spike**

- [ ] **Step 4: Correr la prueba y ver que pasa**

Run: `cd video-blender && python3 -m pytest tests/test_blender_smoke.py -v`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add video-blender/export video-blender/scene/hero.py video-blender/tests/test_blender_smoke.py
git commit -m "feat(hero): export de anclajes y estado por frame para el HUD"
```

### Task 7: Fotorrealista, barrido, post y pipeline de publicación

**Files:**
- Create: `video-blender/render/photo.py`, `video-blender/post/composite.py`, `video-blender/tests/test_composite.py`, `video-blender/render.sh`, `video-blender/README.md`
- Modify: `video-blender/scene/hero.py` (modo `photo`)

**Interfaces:**
- Consumes: kit, cámara y cues.
- Produces:
  - `render/photo.py`: `def setup_photo(scene, site: SiteObjects) -> None` (port de `photo.py` del spike, más suciedad: tráileres con 3 tonos de blanco y gris, desgaste por mapa de ruido en la base color y manchas en el asfalto).
  - `post/composite.py`: `def wipe_mask(width: int, height: int, progress: float, feather_px: int = 120, angle_deg: float = 0.0) -> Image.Image` (L, 255 = técnico), `def glow_vignette(img: Image.Image) -> Image.Image` (halo con blur sigma 6 px @1080 en screen al 45% y viñeta radial al 55%, como en el spike), `def compose_frame(tech: Image.Image, photo: Image.Image | None, progress: float) -> Image.Image` (técnico con post; donde la máscara < 255 mezcla la foto, y suma la línea del barrido en teal con halo).
  - `render.sh`: `plan → anchors → technical (1920x1080, 288 frames) → photo (frames 1-120) → composite → ffmpeg` hacia `public/hero/film-1080.mp4` (H.264, CRF 23, `+faststart`), `film-1080.webm` (VP9, CRF 34), `film-poster.webp` (frame `docked` + 10) y `film-anchors.json`. Opciones `--preview` (960×540, step 2, 12 fps) y `--final`.
  - El progreso del barrido va de 0 en `scanStart` a 1 en `scanEnd`, con ease smoothstep.

- [ ] **Step 1: Escribir los tests que fallan**

```python
def test_wipe_mask_extremes():
    assert wipe_mask(200, 100, 0.0).getextrema() == (0, 0)
    assert wipe_mask(200, 100, 1.0).getextrema() == (255, 255)

def test_wipe_mask_monotonic_and_feathered():
    m = wipe_mask(1000, 10, 0.5, feather_px=100)
    row = [m.getpixel((x, 5)) for x in range(1000)]
    assert all(b >= a for a, b in zip(row, row[1:])) or all(b <= a for a, b in zip(row, row[1:]))
    assert 0 < row[500] < 255

def test_compose_without_photo_is_post_only():
    tech = Image.new("RGB", (64, 36), (10, 10, 10))
    assert compose_frame(tech, None, 1.0).size == (64, 36)
```

- [ ] **Step 2: Correrlos y ver que fallan**

Run: `cd video-blender && python3 -m pytest tests/test_composite.py -v`
Expected: FAIL con `ImportError`.

- [ ] **Step 3: Implementar `composite.py`, `photo.py`, `render.sh` y el README**

- [ ] **Step 4: Verificar**

Run: `cd video-blender && python3 -m pytest -v && ./render.sh --preview`
Expected: tests verdes. Se generan `out/preview/film.mp4` y el frame `out/preview/check_barrido.png` (frame 96) en el que **el contorno del tráiler sigue sin desfase de un lado al otro del barrido**. Mandar los dos a Fran.

- [ ] **Step 5: Commit**

```bash
git add video-blender/render/photo.py video-blender/post video-blender/tests/test_composite.py video-blender/render.sh video-blender/README.md video-blender/scene/hero.py
git commit -m "feat(hero): fotorrealista con barrido de lectura, post y pipeline de publicación"
```

### Task 8: Lógica del HUD en la web (pura y testeada)

**Files:**
- Create: `lib/hero/film.ts`, `lib/hero/geometry.ts`, `lib/hero/film.test.ts`, `lib/hero/geometry.test.ts`

**Interfaces:**
- Produces (`film.ts`):
  - `filmSchema` (zod) y `type Film = z.infer<typeof filmSchema>`.
  - `parseFilm(raw: unknown): Film | null`.
  - `frameIndex(mediaTime: number, fps: number, count: number): number`: `floor(mediaTime·fps) mod count`, siempre un entero en `[0, count)` (floor y no round: el frame que se está mostrando).
  - `frameAt(film: Film, mediaTime: number): FrameData` (interpolación lineal de anclajes y números entre los dos frames vecinos; `status` del frame de abajo).
  - `cueAlpha(frame: number, cue: number, fadeFrames = 10): number` (0..1 con smoothstep).
  - `formatHud(locale: "es" | "en", kind: "dist" | "art" | "weight", value: number): string`.
- Produces (`geometry.ts`):
  - `videoToBox(p: [number, number], video: Size, box: Size): { x: number; y: number; visible: boolean }`, el mapeo con `object-fit: cover`. `visible` es falso si cae fuera de la caja.
  - `cardRects(box: Size, cards: CardSpec[]): Rect[]` (columna derecha, margen ≥ 6% del ancho, sin solaparse).
  - `leaderPath(from: Rect, to: { x: number; y: number }, side: "L" | "R", elbow = 28): string` (path SVG `M … H … L …`).

- [ ] **Step 1: Escribir los tests que fallan**

```ts
test("frameIndex wraps at loop end", () => {
  expect(frameIndex(12.0, 24, 288)).toBe(0);
  expect(frameIndex(11.99, 24, 288)).toBe(287);
  expect(frameIndex(24.5, 24, 288)).toBe(12);
});
test("parseFilm returns null on invalid", () => {
  expect(parseFilm({ fps: 24 })).toBe(null);
});
test("cueAlpha ramps over fade frames", () => {
  expect(cueAlpha(100, 112)).toBe(0); expect(cueAlpha(122, 112)).toBe(1);
});
test("formatHud uses locale decimals", () => {
  expect(formatHud("es", "dist", 18.42)).toBe("18,4 m");
  expect(formatHud("en", "dist", 18.42)).toBe("18.4 m");
  expect(formatHud("es", "art", 27.4)).toBe("27°");
});
test("videoToBox cover crops a 16:9 video into a 4:3 box", () => {
  const p = videoToBox([0.5, 0.5], { w: 1920, h: 1080 }, { w: 1200, h: 900 });
  expect(Math.round(p.x)).toBe(600); expect(Math.round(p.y)).toBe(450);
  expect(videoToBox([0.02, 0.5], { w: 1920, h: 1080 }, { w: 1200, h: 900 }).visible).toBe(false);
});
test("cardRects keeps >= 6% margin and stays in right half", () => {
  const rs = cardRects({ w: 1600, h: 900 }, [{ rows: 10 }, { rows: 4 }]);
  for (const r of rs) { expect(r.x >= 800).toBe(true); expect(1600 - (r.x + r.w) >= 96).toBe(true); }
});
```

- [ ] **Step 2: Correrlos y ver que fallan**

Run: `npm test`
Expected: FAIL (no existen los módulos).

- [ ] **Step 3: Implementar `film.ts` y `geometry.ts`**

- [ ] **Step 4: Correr los tests y ver que pasan**

Run: `npm test && npx tsc --noEmit`
Expected: todos pasan, sin errores de tipos.

- [ ] **Step 5: Commit**

```bash
git add lib/hero
git commit -m "feat(hero): lógica del HUD (schema, sincronización, cover, líneas guía)"
```

### Task 9: Componente `HeroFilm` e integración al hero

**Files:**
- Create: `components/hero/HudCard.tsx`, `components/hero/HeroFilm.tsx`
- Modify: `components/HomeHero.tsx` (capa visual), `messages/es.json`, `messages/en.json` (`hero.film`), `app/[locale]/page.tsx` (pasar los textos)

**Interfaces:**
- Consumes: Task 8 y los assets de `public/hero/` (Task 7).
- Produces:
  - `HeroFilm({ labels }: { labels: HeroFilmLabels })` (client component).
  - `HudCard({ title, rows, alpha, rect }: HudCardProps)`, con `rows: { label: string; value: string; ok?: boolean; section?: boolean }[]`.
  - `HeroFilmLabels`: textos de las cards (CAMIÓN · TRK-114, PLACAS, CITA, DOCUMENTOS, ESTADO por status, DISTANCIA, ARTICULACIÓN, sección CHOFER, NOMBRE, LICENCIA, CHECK-IN, CARGA, PALLETS, PESO, SKUs, CARTA PORTE) más `summary` (resumen `sr-only`).
- **Comportamiento:**
  - Monta `<video muted loop playsInline preload="none" poster="/hero/film-poster.webp">` con `<source>` WebM y MP4 después de `requestIdleCallback`, para no competir con el LCP.
  - Hace `fetch("/hero/film-anchors.json")` + `parseFilm`. Si da `null`, no hay HUD.
  - En cada `requestVideoFrameCallback` (si no existe, `requestAnimationFrame` con `currentTime`) calcula `frameAt`, ubica las cards con `cardRects` y dibuja `leaderPath` hacia `videoToBox`. La línea se dibuja con `stroke-dashoffset` animado por `cueAlpha(frame, cue + 8, 14)` y el anclaje lleva un anillo que pulsa.
  - Cards: CAMIÓN + CHOFER desde `cues.truckCard` y CARGA desde `cues.cargoCard`. Estilo del spike: panel `navy-950/85`, borde `navy-700`, barra teal de 3 px, título teal, labels `navy-300`, valores blancos, ok en teal.
  - Con `prefers-reduced-motion`: sin `<video>`, solo el poster, y las cards y líneas del último frame.
  - En `HomeHero`: `HeroFilm` en `md+` y `HeroCanvas` en mobile. Agrega un degradé `from-navy-950/80` a la izquierda para que el copy se lea sobre el video.

- [ ] **Step 1: Agregar `hero.film` en ES y EN y tipar los labels**

Run: `npx tsc --noEmit`
Expected: falla hasta que `page.tsx` pase los labels (es la prueba de que el contrato está conectado).

- [ ] **Step 2: Implementar `HudCard`, `HeroFilm` y la integración**

- [ ] **Step 3: Verificar build, lint y tests**

Run: `npm run lint && npm test && npm run build`
Expected: 0 errores; el build genera `/es` y `/en`.

- [ ] **Step 4: Verificación en el navegador**

Con `npx next dev -p 3123`, en 1440×900 y 2560×1080:
- El video arranca solo y las cards entran en su cue.
- Las líneas siguen al camión sin despegarse.
- En `/en` los textos y decimales cambian.
- Con reduced-motion emulado aparece el poster con las cards finales.
- En 390×844 sigue `HeroCanvas`.

Capturas de los cinco estados para Fran.

- [ ] **Step 5: Commit**

```bash
git add components/hero components/HomeHero.tsx messages/es.json messages/en.json "app/[locale]/page.tsx"
git commit -m "feat(hero): HeroFilm con HUD HTML sincronizado en el hero de la home"
```

### Task 10: Render final, peso y aceptación de la fase 1

**Files:**
- Create: `public/hero/film-1080.mp4`, `film-1080.webm`, `film-poster.webp`, `film-anchors.json`
- Modify: `video-blender/README.md` (tiempos medidos)

- [ ] **Step 1: Render final (de noche)**

Run: `cd video-blender && ./render.sh --final`
Expected: los 4 assets en `public/hero/` y el reporte con holgura mínima > 0,10 m.

- [ ] **Step 2: Comprobar peso y consistencia**

Run: `ls -la public/hero/ && ffprobe -v error -show_entries format=duration -of csv=p=0 public/hero/film-1080.mp4`
Expected: mp4 ≤ 4 MB y duración 12,0 s. La cantidad de frames de `film-anchors.json` es igual a duración × 24.

- [ ] **Step 3: Lighthouse**

Run: `npm run build && npx next start -p 3123`, y Lighthouse mobile y desktop sobre `/es`.
Expected: performance mobile ≥ 90 y el LCP sigue siendo el H1.

- [ ] **Step 4: Sincronización en Safari**

En Safari desktop, mirar 3 loops completos. Las líneas no se despegan más de unos pocos píxeles y la vuelta del loop no parpadea. Si falla, anotarlo como riesgo en la spec antes de dar la fase por cerrada.

- [ ] **Step 5: Commit**

```bash
git add public/hero video-blender/README.md
git commit -m "feat(hero): render final de la fase 1 (acceso → andén)"
```
