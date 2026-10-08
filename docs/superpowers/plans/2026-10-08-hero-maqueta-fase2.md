# Hero maqueta, fase 2 (recepción + relevo): plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continuar la película después de "ACOPLADO ✓". Sube la puerta del andén. Un autoelevador contrapesado entra al tráiler, baja dos pallets a la zona de preparación y se escanean. Una apiladora lleva uno a su posición del rack (R-07-04-B), que se ilumina. Un picker llega a esa misma posición: es el **relevo**, y la cámara pasa de la máquina a la persona. El HUD pasa de CAMIÓN/CARGA a **PALLET**.

**Architecture:** Igual que la fase 1. `plan/` es Python puro y genera las trayectorias. Blender anima desde JSON. El HUD es HTML.
- **Nuevo en `plan/`:** `handling.py` (cinemática de autoelevador con dirección trasera, footprints y colisiones contra racks, tráiler y personas) y `choreo.py` (coreografía de la fase 2 con pistas por frame que se agregan a `route.json`).
- **Nuevo en `kit/`:** `handling.py` (autoelevador, apiladora, puerta enrollable, pallets individuales, celda resaltada y destello de escaneo) y `picker.py` (maniquí de reemplazo, más los FBX de Mixamo cuando estén en `assets/mixamo/`).
- **En la web:** el schema del HUD suma anclajes y cues opcionales, sin romper el JSON de la fase 1.

**Tech Stack:** el de la fase 1 (Blender 5.2, Python 3.12 + numpy + Pillow + pytest, Next 16 / React 19 / zod).

**Spec:** `docs/superpowers/specs/2026-10-07-hero-maqueta-design.md` (§3 guion, §5 piezas, §6 física, §9 fase 2). Plan anterior y sus decisiones: `docs/superpowers/plans/2026-10-07-hero-maqueta-fase1.md` + `~/Documents/Geodot/hero-blender-spike/fase1-ledger.md`.

## Global Constraints

- Todas las de la fase 1 siguen vigentes. Entre ellas: prohibido interpolar poses a mano, holgura mínima > 0,10 m, teal `#1AB7A8` solo para lo que se sigue, HUD en HTML, textos en `messages/`, datos ficticios.
- **Pasillos:** contrapesado ≥ 3,5 m de maniobra. Apiladora en pasillo de 3,2 m (`RackLayout.AISLE`), con giro de 90° para estibar.
- **Un pallet siempre tiene exactamente un dueño por frame:** apoyado en el piso, en el tráiler, en el rack, en las horquillas del autoelevador o en las de la apiladora. Nunca dos dueños y nunca ninguno.
- **El JSON de la fase 1 sigue siendo válido** para la web: los campos nuevos de `film-anchors.json` son opcionales.
- **Los FBX de Mixamo no van a git** (`video-blender/assets/mixamo/` en `.gitignore`). Sin ellos, el pipeline usa el maniquí de reemplazo y los tests pasan igual.
- **La película completa (fase 1 + 2) dura ≤ 30 s.** El mp4 ≤ 7 MB y el webm ≤ 6 MB.
- **Lighthouse mobile ≥ 90 y desktop ≥ 95**, y el LCP sigue siendo el H1. La película sigue apareciendo solo desde 1280 px.

## Review Focus

1. **Pallet "teletransportado"** en el traspaso entre dueños (tráiler → horquillas → piso → apiladora → rack): la posición mundial no puede saltar más de 5 cm entre dos frames consecutivos (test en Task 2).
2. **El mástil levantado atraviesa largueros del rack** al entrar en la posición del nivel 3: la carga sube antes de entrar y baja recién al estar alineada (test en Task 2).
3. **El autoelevador dentro del tráiler:** semiancho del tráiler 1,25 m contra semiancho del equipo; holgura > 0,10 m por lado (test en Task 2).
4. **El JSON de la fase 1 sin los campos nuevos** sigue pasando `parseFilm` y muestra solo CAMIÓN/CARGA (test en Task 7).
5. **Mixamo ausente:** la escena se arma con el maniquí y la prueba de humo pasa (test en Task 4).

---

## File Structure

```
video-blender/plan/handling.py     cinemática con dirección trasera + footprints de autoelevador y apiladora
video-blender/plan/choreo.py       coreografía fase 2: pistas por frame + cues, se agrega a route.json
video-blender/kit/handling.py      autoelevador, apiladora, puerta enrollable, pallets, celda resaltada, destello
video-blender/kit/picker.py        maniquí de reemplazo + import de FBX de Mixamo (opcional)
video-blender/tests/test_handling.py  tests/test_choreo.py
(modificar) plan/route.py          plan_route() encadena la fase 2 (Timeline.tracks)
(modificar) scene/hero.py, export/anchors.py, render/camera.py, render/photo.py (materiales de lo nuevo)
(modificar) lib/hero/film.ts, components/hero/HeroFilm.tsx, messages/{es,en}.json
```

**Contrato `route.json` (amplía el de la fase 1):** `tracks: { "<objeto>": [[x, y, z, yaw, extra], ...una por frame] }`.
- Objetos: `forklift` (extra = altura de horquillas), `reach` (extra = altura de horquillas), `pallet_A`, `pallet_B` (extra = id del dueño: 0 tráiler, 1 autoelevador, 2 piso, 3 apiladora, 4 rack), `picker` (extra = clip de animación: 0 idle, 1 walk, 2 scan, 3 pickup) y `door11` (x/y sin uso, z = apertura 0..1).
- Cues nuevos: `doorOpen`, `unloadStart`, `scanA`, `reachStart`, `slotDone`, `pickerArrive`, `relevo`.

---

### Task 1: Cinemática de manejo con dirección trasera

**Files:** Create `video-blender/plan/handling.py`, `video-blender/tests/test_handling.py`. Modify `.gitignore` (`video-blender/assets/mixamo/`).

**Interfaces:**
- Produces:
  - `@dataclass(frozen=True) class Lift: p: np.ndarray; yaw: float; fork_h: float`, donde `p` es el centro del eje delantero (de carga).
  - `FORKLIFT = LiftSpec(wheelbase=1.6, half_w=0.6, front=1.25, rear=-1.9)` y `REACH = LiftSpec(wheelbase=1.4, half_w=0.6, front=1.15, rear=-1.5)`. `front` se mide hasta la punta de las horquillas cargadas.
  - `def lift_step(s: Lift, spec: LiftSpec, v: float, steer: float, dt: float) -> Lift`: dirección en el eje trasero, por lo que `dyaw = -v/wheelbase·tan(steer)`.
  - `def lift_rect(s: Lift, spec: LiftSpec) -> Poly`.
  - `def follow(s, spec, path, v, until, dt=0.02, max_steer=radians(70)) -> list[Lift]`: pure pursuit hacia adelante o hacia atrás según el signo de `v`.

- [ ] **Step 1: Tests que fallan**

```python
def test_rear_steer_turns_opposite_to_front_steer():
    s = Lift(np.array([0.0, 0.0]), 0.0, 0.0)
    for _ in range(100): s = lift_step(s, FORKLIFT, 1.0, math.radians(20), 0.02)
    assert s.yaw < 0          # con la dirección atrás, volante + gira a la derecha
def test_follow_reaches_end_of_L_path_both_directions():
    path = np.array([[0, 0], [8, 0], [8, 6]])
    fwd = follow(Lift(np.array([0.0, 0.0]), 0.0, 0.0), FORKLIFT, path, 1.0, until=lambda s: s.p[1] > 5.9)
    assert np.linalg.norm(fwd[-1].p - path[-1]) < 0.3
```

- [ ] **Step 2:** `cd video-blender && python3 -m pytest tests/test_handling.py -q` → falla con ImportError.
- [ ] **Step 3:** Implementar `plan/handling.py`.
- [ ] **Step 4:** Mismo comando → 2 passed, y la suite completa en verde.
- [ ] **Step 5:** `git commit -m "feat(hero): cinemática de autoelevador y apiladora (dirección trasera)"`

### Task 2: Coreografía de la fase 2 → pistas en `route.json`

**Files:** Create `video-blender/plan/choreo.py`, `video-blender/tests/test_choreo.py`. Modify `video-blender/plan/site.py` + `video-blender/kit/racks.py` (`RackLayout`, `BAY`, `SIDE`, `FLUE`, `LEVELS`, `TOP` y `AISLE` pasan a `plan/site.py`, la fuente única y pura, y `kit/racks.py` los importa desde ahí: `plan/` no puede importar `kit/`, que depende de bmesh) y `video-blender/plan/route.py` (`Timeline.tracks: dict[str, list[list[float]]]`; `write_route` las serializa; `plan_route(phase=2)` encadena la fase 2 después del `docked` + 12 frames).

**Interfaces:**
- Consumes: `plan.site` (andén 11, `WALL_Y`, `RackLayout`: fila r en `x0 + r·row_pitch`, vanos de `BAY` desde `y0`, niveles `LEVELS`) y `plan.handling`.
- Produces: `def choreograph(start_frame: int, fps: int = 24) -> tuple[dict[str, list[list[float]]], dict[str, int]]`.
- **Coreografía (≈ 11 s):**
  - La puerta sube en 1 s.
  - El autoelevador espera en la zona de preparación (y ≈ 5,5 frente al andén 11). Entra al tráiler por el nivelador hasta la fila 1 de pallets, levanta 0,15 m, sale marcha atrás, gira y apoya `pallet_A` en la preparación.
  - Vuelve por `pallet_B` y lo deja al lado.
  - `scanA`: destello sobre `pallet_A`.
  - La apiladora toma `pallet_A` desde la preparación y entra al pasillo entre las filas 4 y 5 (x ≈ 10,2). Gira 90° de frente a la fila 5 en el vano 1, sube a `LEVELS[2]` + 0,1, avanza, baja 0,1 y suelta: `slotDone`.
  - El picker sale del fondo del pasillo, camina hasta la cara opuesta de esa misma posición (`pickerArrive`) y escanea: `relevo`.
- La posición del rack donde termina `pallet_A` se exporta como `cues` + `slot: [x, y, z]`.

- [ ] **Step 1: Tests que fallan** (en `test_choreo.py`, todos sobre `choreograph(400)`):
  - `test_pallet_never_teleports`: la posición mundial de cada pallet salta ≤ 0,05 m entre frames consecutivos.
  - `test_pallet_has_one_owner_per_frame`: el dueño (extra) ∈ {0..4} en todo frame, y solo cambia cuando la máquina está quieta (velocidad < 0,05 m/frame) o en el frame en que suelta.
  - `test_forklift_clears_trailer_walls_and_racks`: holgura > 0,10 m contra las paredes interiores del tráiler (semiancho 1,25), los racks (`RackLayout`) y los camiones estacionados.
  - `test_mast_up_before_entering_slot`: mientras la apiladora está dentro de la proyección del rack, la altura de horquillas es ≥ `LEVELS[2]`.
  - `test_cues_order`: `doorOpen < unloadStart < scanA < reachStart < slotDone < pickerArrive < relevo`, y el total (fase 1 + fase 2) ≤ 30 s a 24 fps.
- [ ] **Step 2:** `python3 -m pytest tests/test_choreo.py -q` → falla.
- [ ] **Step 3:** Implementar. Cada pose sale de `follow`/`lift_step`. La altura de horquillas se anima con perfiles de velocidad (es un actuador, no hay geometría que interpolar). El picker sigue una polilínea a 1,3 m/s (ritmo comprimido igual que el camión).
- [ ] **Step 4:** Suite completa en verde, y `python3 -m plan.route out/route.json` imprime las holguras.
- [ ] **Step 5:** `git commit -m "feat(hero): coreografía de recepción y relevo con física y dueño único por pallet"`

### Task 3: Kit de Blender para el manejo de carga

**Files:** Create `video-blender/kit/handling.py`. Modify `video-blender/kit/site_build.py` (pallets individuales en el tráiler del andén 11, puerta enrollable con un panel animable por andén) y `tests/test_blender_smoke.py`.

**Interfaces:**
- Produces:
  - `def forklift(col, name) -> Object` (hijos `<name>_forks`, que suben en z) y `def reach_truck(col, name) -> Object` (hijos `<name>_forks`, con mástil y patas estabilizadoras).
  - `def pallet(col, name, load_h) -> Object`, con origen en la base y centro.
  - `def slot_highlight(col, xyz) -> Object` (`SLOT_highlight`, colección HERO, oculto hasta `slotDone`) y `def scan_flash(col) -> Object` (`SCAN_flash`).
  - `SiteObjects.door11` (el panel de la puerta enrollable del andén 11).
- [ ] **Step 1:** La prueba de humo `test_scene_builds_phase2` exige en `CHECK OK` los objetos `FORKLIFT`, `FORKLIFT_forks`, `REACH`, `REACH_forks`, `pallet_A`, `pallet_B`, `SLOT_highlight`, `SCAN_flash` y `DOOR_11`. Correrla y ver que falla.
- [ ] **Step 2:** Implementar los modelos por script, con el estilo del kit: oclusor negro, bevel moderado, detalle mecánico (mástil de 2 etapas, jaula, contrapeso, ruedas).
- [ ] **Step 3:** Prueba de humo en verde.
- [ ] **Step 4:** `git commit -m "feat(hero): autoelevador, apiladora, pallets y puerta del andén en el kit"`

### Task 4: Picker (maniquí de reemplazo + Mixamo opcional)

**Files:** Create `video-blender/kit/picker.py`. Modify `tests/test_blender_smoke.py`.

**Interfaces:**
- Produces: `def picker(col) -> Object` (raíz `PICKER`). Si existen `assets/mixamo/{idle,walk,scan,pickup}.fbx`, importa Y Bot con sus acciones y expone `def set_clip(ob, clip: int, frame: int)` vía NLA. Si no existen, arma un maniquí por script (cápsulas de cuerpo, cabeza, brazos y pistola RF) y `set_clip` solo anima una oscilación de caminata simple.
- [ ] **Step 1:** `test_picker_without_mixamo`: con `MIXAMO_DIR` apuntando a un directorio vacío, `--mode check` imprime `PICKER mannequin`. Si los FBX existen, `test_picker_with_mixamo` exige `PICKER mixamo` y queda en skip cuando faltan. Ver que falla.
- [ ] **Step 2:** Implementar, con la ruta de assets desde `MIXAMO_DIR`, por defecto `assets/mixamo`.
- [ ] **Step 3:** Pruebas en verde.
- [ ] **Step 4:** `git commit -m "feat(hero): picker con maniquí de reemplazo e import opcional de Mixamo"`

### Task 5: Animación de la fase 2 y cámara al interior

**Files:** Modify `video-blender/scene/hero.py` (`animate` lee `tracks`), `video-blender/render/camera.py` y `scene/hero.py camera_keys` (después de `docked`: entra al interior siguiendo al autoelevador, cierra sobre la posición del rack en el relevo, sujeto a ≥ 0,56 del ancho como en la fase 1) y `render/photo.py` (materiales de lo nuevo, aunque el tramo fotorrealista no los muestre).
- [ ] **Step 1:** La prueba de humo `test_technical_frames_phase2` renderiza 3 frames a 480×270 (`doorOpen + 10`, `slotDone`, `relevo`) y comprueba los archivos y una luminancia > 2. Ver que falla.
- [ ] **Step 2:** Implementar. Con el pallet parentado a su dueño, la posición mundial sale de la pista: no hay parenting dinámico, se escribe la pose mundial por frame. La celda resaltada aparece en `slotDone`, el destello dura 8 frames en `scanA`, el picker en teal desde `pickerArrive` y la máquina deja el teal en el relevo.
- [ ] **Step 3:** Prueba en verde, y medir el encuadre con `out/measure.sh` ampliado con las fases nuevas.
- [ ] **Step 4: CHECKPOINT con Fran.** Mosaico de 6 frames a 960×540 (puerta abierta, autoelevador en el tráiler, preparación + destello, apiladora estibando, relevo y final). Se manda y se sigue con la Task 6 mientras responde.
- [ ] **Step 5:** `git commit -m "feat(hero): animación de recepción y relevo, cámara al interior"`

### Task 6: Anclajes y cues de la fase 2

**Files:** Modify `video-blender/export/anchors.py`, `tests/test_blender_smoke.py`.

**Interfaces:**
- Produces en `film-anchors.json` (opcional por frame): `pallet: [x, y]` y `picker: [x, y]` desde `pallet_A` y `PICKER`. `status` suma `unloading | storing | relevo`, y hay `cues.palletCard = scanA` y `cues.relevo`.
- [ ] **Step 1:** `test_anchors_phase2`: los frames con `pallet` cubren desde `scanA` hasta el final y todos los `x, y ∈ [0, 1]`. Ver que falla.
- [ ] **Step 2:** Implementar.
- [ ] **Step 3:** En verde.
- [ ] **Step 4:** `git commit -m "feat(hero): anclajes de pallet y picker para el HUD"`

### Task 7: HUD web con la card PALLET

**Files:** Modify `lib/hero/film.ts`, `lib/hero/film.test.ts`, `components/hero/HeroFilm.tsx`, `messages/{es,en}.json` (`home.hero.film.pallet`).

**Interfaces:**
- Produces: `filmSchema` con `pallet`/`picker` opcionales por frame, `status` ampliado y `cues.palletCard`/`cues.relevo` opcionales.
  - `def activeCards(frame: number, cues): ("truck" | "cargo" | "pallet")[]`: CAMIÓN y CARGA se desvanecen a partir de `palletCard` y entra PALLET (LOTE, CADUCIDAD FEFO, POSICIÓN R-07-04-B, ESTADO: EN RECEPCIÓN → ESCANEADO ✓ → ALMACENADO ✓). En el `relevo`, la línea de PALLET pasa del pallet al picker.
- [ ] **Step 1: Tests que fallan:**
  - `parseFilm` acepta el JSON de la fase 1 (sin campos nuevos) y el de la fase 2.
  - `activeCards` antes de `palletCard` es `["truck", "cargo"]` y después `["pallet"]`.
  - Con cues de la fase 1 sin `palletCard`, nunca devuelve `pallet`.
- [ ] **Step 2:** `npm test` → falla.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm test && npx tsc --noEmit && npx eslint components/hero lib/hero` en verde, y verificar en el navegador con el preview (1440×900, `/es` y `/en`, reduced-motion).
- [ ] **Step 5:** `git commit -m "feat(hero): card PALLET y relevo en el HUD"`

### Task 8: Render final, peso y aceptación

- [ ] `./render.sh --final` (retomable, con `caffeinate -i`): los 4 assets en `public/hero/`.
- [ ] Peso: mp4 ≤ 7 MB y webm ≤ 6 MB, duración ≤ 30 s, y los frames de `film-anchors.json` iguales a la duración × 24.
- [ ] Lighthouse mobile ≥ 90 y desktop ≥ 95, con el LCP en el H1 (Chrome del sistema, 3 corridas).
- [ ] Sincronía en WebKit (`pw/sync.mjs`) con p95 < 6 px, y que Fran lo mire en Safari real.
- [ ] `git commit -m "feat(hero): render final de la fase 2 (recepción + relevo)"`
