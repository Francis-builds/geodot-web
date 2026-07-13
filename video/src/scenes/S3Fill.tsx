import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { GroundGrid, DataMotes, WireBox } from "../world/primitives";
import { ParkedTrailer, PalletStack } from "../world/Truck";

export const S3_DURATION = 192;

// Trailer en origen, puertas hacia -z (derecha de cámara en vista lateral).
// Filas 0..5 de fondo (+z) a puerta (-z); 2 columnas que en silueta se leen 1.
const ROW_Z = [5.05, 3.15, 1.25, -0.65, -2.55, -4.45];
const COL_X = [-0.62, 0.62];

// Config inicial: filas 0,1,3,4,5 ocupadas — bolsa de AIRE en fila 2.
// Compactación: r3→r2 (f40), r4→r3 (f58), r5→r4 (f76). El aire migra hacia
// la puerta y sale expulsado. Luego entran 2 pallets nuevos a fila 5 (f96+).
type Slide = { fromRow: number; toRow: number; at: number };
const SLIDES: Slide[] = [
  { fromRow: 3, toRow: 2, at: 40 },
  { fromRow: 4, toRow: 3, at: 58 },
  { fromRow: 5, toRow: 4, at: 76 },
];
const SLIDE_LEN = 16;

// filas iniciales ocupadas y su cadena de slides
const initialRows = [0, 1, 3, 4, 5];

const rowZAt = (initialRow: number, frame: number): number => {
  let row = initialRow;
  let z = ROW_Z[initialRow];
  for (const s of SLIDES) {
    if (row !== s.fromRow) continue;
    const t = interpolate(frame, [s.at, s.at + SLIDE_LEN], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    });
    z = interpolate(t, [0, 1], [ROW_Z[s.fromRow], ROW_Z[s.toRow]]);
    if (t >= 1) row = s.toRow;
  }
  return z;
};

// pallets nuevos: entran por la puerta a fila 5
const NEW_AT = [96, 122];
const FLIGHT = 30;
const newPalletPos = (i: number, frame: number): { x: number; y: number; z: number; visible: boolean } => {
  const t = interpolate(frame, [NEW_AT[i], NEW_AT[i] + FLIGHT], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  if (frame < NEW_AT[i]) return { x: 0, y: 0, z: 0, visible: false };
  const x = COL_X[i];
  const y = interpolate(t, [0, 0.35, 0.7, 1], [0, 1.5, 1.35, 1.175]) - 1.175;
  const z = interpolate(t, [0, 0.35, 0.7, 1], [-11.5, -8.6, -6.4, ROW_Z[5]]);
  return { x, y, z, visible: true };
};

// la bolsa de aire: arranca en fila 2, migra con cada slide, sale por la puerta
const airZ = (frame: number): number => {
  let z = ROW_Z[2];
  for (const s of SLIDES) {
    const t = interpolate(frame, [s.at, s.at + SLIDE_LEN], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    });
    z = interpolate(t, [0, 1], [z, ROW_Z[s.fromRow]]);
  }
  // tras el último slide queda en fila 5; después la expulsan los nuevos
  const out = interpolate(frame, [96, 126], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  return interpolate(out, [0, 1], [z, -10.5]);
};

const airOpacity = (frame: number): number =>
  interpolate(frame, [14, 28, 110, 132], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// wireframe punteado para el volumen de aire (lineDistance manual, sin effects)
const dashedBoxGeo = (w: number, h: number, d: number) => {
  const box = new THREE.BoxGeometry(w, h, d);
  const edges = new THREE.EdgesGeometry(box);
  const pos = edges.getAttribute("position");
  const dist = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i += 2) {
    const dx = pos.getX(i + 1) - pos.getX(i);
    const dy = pos.getY(i + 1) - pos.getY(i);
    const dz = pos.getZ(i + 1) - pos.getZ(i);
    dist[i] = 0;
    dist[i + 1] = Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  edges.setAttribute("lineDistance", new THREE.BufferAttribute(dist, 1));
  return edges;
};

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.fov !== 30) {
    cam.fov = 30;
    cam.updateProjectionMatrix();
  }
  const e = interpolate(frame, [0, S3_DURATION - 1], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  camera.position.set(
    interpolate(e, [0, 1], [18, 16.2]),
    interpolate(e, [0, 1], [4.6, 3.8]),
    interpolate(e, [0, 1], [4.5, 2.0]),
  );
  camera.lookAt(0, 2.0, -0.4);
  return null;
};

const projCam = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 1000);
const project = (point: [number, number, number], frame: number, W: number, H: number) => {
  const e = interpolate(frame, [0, S3_DURATION - 1], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  projCam.aspect = W / H;
  projCam.position.set(
    interpolate(e, [0, 1], [18, 16.2]),
    interpolate(e, [0, 1], [4.6, 3.8]),
    interpolate(e, [0, 1], [4.5, 2.0]),
  );
  projCam.lookAt(0, 2.0, -0.4);
  projCam.updateMatrixWorld();
  projCam.updateProjectionMatrix();
  const v = new THREE.Vector3(...point).project(projCam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
};

// cota del aire: trackea la bolsa mientras migra
const AirCallout: React.FC<{ frame: number }> = ({ frame }) => {
  const { width, height } = useVideoConfig();
  const u = height / 1080;
  const op = airOpacity(frame) * interpolate(frame, [26, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (op <= 0.01) return null;
  const pct = Math.max(1, Math.round(17 - interpolate(frame, [40, 126], [0, 16], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const anchor = project([0, 2.4, airZ(frame)], frame, width, height);
  const ex = anchor.x + 30 * u;
  const ey = anchor.y - 150 * u;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <g opacity={op * 0.85}>
          <circle cx={anchor.x} cy={anchor.y} r={4 * u} fill={C.textDim} />
          <polyline
            points={`${anchor.x},${anchor.y} ${ex},${ey + 12 * u} ${ex + 34 * u},${ey + 12 * u}`}
            fill="none"
            stroke={C.textDim}
            strokeWidth={1.5 * u}
          />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: ex + 42 * u,
          top: ey + 12 * u,
          transform: "translateY(-50%)",
          opacity: op,
          fontFamily: MONO,
          fontSize: 17 * u,
          letterSpacing: "0.16em",
          color: C.textDim,
          border: `1px dashed ${C.textDim}66`,
          background: "#080F1FCC",
          padding: `${9 * u}px ${16 * u}px`,
          whiteSpace: "nowrap",
        }}
      >
        AIR {String(pct).padStart(2, "0")}%
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const fadeIn = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // fill: 83 → 99 a medida que se compacta y entran los nuevos
  const fill = Math.round(
    interpolate(frame, [40, 92, 96, 152], [83, 91, 91, 99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const barIn = interpolate(frame, [158, 172], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chip: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 19 * u,
    letterSpacing: "0.22em",
    color: C.textDim,
    position: "absolute",
  };
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ ...chip, top: 44 * u, left: 56 * u }}>TRK-114 · MFT #88412</div>
      <div style={{ ...chip, top: 44 * u, right: 56 * u, color: C.text, display: "flex", alignItems: "center", gap: 12 * u }}>
        <span style={{ width: 9 * u, height: 9 * u, background: C.accent, display: "inline-block" }} />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>FILL {fill}%</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 60 * u,
          left: "50%",
          transform: `translateX(-50%) translateY(${(1 - barIn) * 14 * u}px)`,
          opacity: barIn,
          fontFamily: MONO,
          fontSize: 19 * u,
          letterSpacing: "0.24em",
          color: C.text,
          border: `1px solid ${C.accent}66`,
          background: "#080F1FB8",
          padding: `${14 * u}px ${30 * u}px`,
          display: "flex",
          alignItems: "center",
          gap: 14 * u,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ width: 9 * u, height: 9 * u, background: C.accent }} />
        FILL 99% · +2 PLT / VIAJE
      </div>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at center, transparent 55%, rgba(4,8,16,0.45) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const S3Fill: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const airGeo = useMemo(() => dashedBoxGeo(2.3, 2.15, 1.75), []);
  const aOp = airOpacity(frame);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 40, 120]} />
        <CameraRig frame={frame} />
        <GroundGrid />
        {/* trailer de vidrio, puertas abiertas hacia -z */}
        <ParkedTrailer position={[0, 0, 0]} edgeColor={C.hero} faceColor="#20304F" edgeOpacity={1} faceOpacity={0.22} />
        <WireBox faceColor="#20304F" size={[0.06, 2.6, 1.25]} position={[-1.31, 1.73, -6.78]} edgeColor={C.hero} edgeOpacity={0.85} />
        <WireBox faceColor="#20304F" size={[0.06, 2.6, 1.25]} position={[1.31, 1.73, -6.78]} edgeColor={C.hero} edgeOpacity={0.85} />
        {/* pallets iniciales (con slides de compactación) */}
        {initialRows.map((r) =>
          COL_X.map((x, ci) => (
            <group key={`${r}-${ci}`} position={[x, 0, rowZAt(r, frame)]}>
              <PalletStack x={0} z={0} reveal={1} />
            </group>
          )),
        )}
        {/* pallets nuevos que entran por la puerta */}
        {[0, 1].map((i) => {
          const p = newPalletPos(i, frame);
          if (!p.visible) return null;
          return (
            <group key={i} position={[p.x, p.y, p.z]}>
              <PalletStack x={0} z={0} reveal={1} />
            </group>
          );
        })}
        {/* la bolsa de AIRE: wireframe punteado que migra y es expulsado */}
        {aOp > 0.01 && (
          <lineSegments geometry={airGeo} position={[0, 2.28, airZ(frame)]} renderOrder={4}>
            <lineDashedMaterial color={C.textDim} dashSize={0.16} gapSize={0.12} transparent opacity={aOp * 0.7} depthWrite={false} />
          </lineSegments>
        )}
        <DataMotes frame={frame} count={50} />
      </ThreeCanvas>
      <AirCallout frame={frame} />
      <Hud frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
