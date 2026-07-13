import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { hash2 } from "../world/hash";
import { GroundGrid, DataMotes, WireBox } from "../world/primitives";
import { RBox } from "../world/rounded";
import { Container } from "../world/Container";
import { ParkedTrailer, PalletStack } from "../world/Truck";

export const S2_DURATION = 192; // 8s @ 24fps

// ---- plan de carga: 12 pallets, 2 columnas x 6 filas ----
// Orden real: entran por las puertas traseras (z-) y llenan desde el fondo.
// Slots locales del trailer (centrado en origen, puertas hacia -z):
const SLOT_Z = [5.05, 3.15, 1.25, -0.65, -2.55, -4.45];
const SLOT_X = [-0.62, 0.62];

// staging: cola de pallets a la derecha del trailer
const queuePos = (i: number): [number, number] => [7.5 + (i % 3) * 2.4, -9 + Math.floor(i / 3) * 2.8];

const FLIGHT_FRAMES = 34;
const STAGGER = 11;
const FIRST_START = 20;
const flightStart = (i: number) => FIRST_START + i * STAGGER;
// último vuelo: 20 + 11*11 + 34 = 175 ✓ entra en 192

// slot del pallet i: fondo primero (i=0,1 → z 5.05, el front del trailer),
// como se carga de verdad por las puertas traseras
const slotZFor = (i: number) => SLOT_Z[Math.floor(i / 2)];

// posición del pallet i en el frame dado:
// cola → eleva → aproximación tras las puertas → cruza la puerta → desliza al slot
const palletAtFixed = (i: number, frame: number) => {
  const col = i % 2;
  const [qx, qz] = queuePos(i);
  const sx = SLOT_X[col];
  const sz = slotZFor(i);
  const t = interpolate(frame, [flightStart(i), flightStart(i) + FLIGHT_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const doorZ = -7.4;
  const x = interpolate(t, [0, 0.3, 0.55, 0.7, 1], [qx, qx, sx, sx, sx]);
  const y = interpolate(t, [0, 0.2, 0.55, 0.7, 1], [0, 1.5, 1.6, 1.35, 1.175]) - 1.175;
  const z = interpolate(t, [0, 0.3, 0.55, 0.7, 1], [qz, qz, doorZ - 1.6, doorZ + 1.2, sz]);
  return { x, y, z, started: frame >= flightStart(i), settled: t >= 1 };
};

const settledCount = (frame: number) => {
  let n = 0;
  for (let i = 0; i < 12; i++) if (frame >= flightStart(i) + FLIGHT_FRAMES) n++;
  return n;
};

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.fov !== 30) {
    cam.fov = 30;
    cam.updateProjectionMatrix();
  }
  const e = interpolate(frame, [0, S2_DURATION - 1], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
  });
  // arco lento alrededor del staging, vista torre 3/4
  const ang = interpolate(e, [0, 1], [-0.62, -0.18]);
  const rad = interpolate(e, [0, 1], [35, 27]);
  camera.position.set(Math.sin(ang) * rad + 3, interpolate(e, [0, 1], [23, 16]), Math.cos(ang) * rad - 2);
  camera.lookAt(1.5, 1.2, -2);
  return null;
};

// telón de fondo: depósito con docks + algunas pilas de containers ya "vivas"
const Backdrop: React.FC = () => (
  <group>
    <RBox r={0.5} size={[24, 9, 60]} position={[-24, 4.5, -6]} edgeColor={C.edgeDim} edgeOpacity={0.7} />
    <RBox r={0.35} size={[9, 1.5, 50]} position={[-24, 9.6, -6]} edgeColor={C.edgeDim} edgeOpacity={0.55} />
    {/* portones de dock del lado del staging */}
    <group>
      {[-20, -8, 4].map((z) => (
        <WireBox key={z} size={[0.15, 3.8, 3.6]} position={[-11.9, 1.9, z]} edgeColor={C.edgeDim} edgeOpacity={0.6} />
      ))}
    </group>
    {[[-2, -26], [10, -28], [20, -18]].map(([x, z], i) => (
      <group key={i}>
        {Array.from({ length: 1 + Math.floor(hash2(x, z) * 2) }, (_, k) => (
          <Container
            key={k}
            position={[x, 1.35 + k * 2.7, z]}
            edgeColor={C.edgeDim}
            faceColor={C.face}
            edgeOpacity={0.7}
          />
        ))}
      </group>
    ))}
    {/* poste de luz */}
    <WireBox size={[0.16, 7.5, 0.16]} position={[14, 3.75, 4]} edgeColor={C.edgeDim} edgeOpacity={0.8} />
    <WireBox size={[1.7, 0.12, 0.12]} position={[13.15, 7.35, 4]} edgeColor={C.edgeDim} edgeOpacity={0.8} />
    <mesh position={[12.45, 7.25, 4]}>
      <boxGeometry args={[0.55, 0.1, 0.3]} />
      <meshBasicMaterial color={C.hero} transparent opacity={0.85} />
    </mesh>
  </group>
);

// diagrama de packing (top view del trailer): la UI del producto en pantalla
const FillDiagram: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const fadeIn = interpolate(frame, [14, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const w = 84 * u, h = 220 * u, pad = 5 * u;
  const cellW = (w - pad * 3) / 2;
  const cellH = (h - pad * 7) / 6;
  return (
    <div
      style={{
        position: "absolute",
        top: 96 * u,
        left: 56 * u,
        opacity: fadeIn,
        border: `1px solid ${C.accent}55`,
        background: "#080F1FB8",
        padding: 10 * u,
      }}
    >
      <svg width={w} height={h}>
        <rect x={0.5} y={0.5} width={w - 1} height={h - 1} fill="none" stroke={C.textDim} strokeOpacity={0.5} />
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2); // fila 0 = fondo del trailer = arriba del diagrama
          const on = frame >= flightStart(i) + FLIGHT_FRAMES;
          const inFlight = frame >= flightStart(i) && !on;
          return (
            <rect
              key={i}
              x={pad + col * (cellW + pad)}
              y={pad + row * (cellH + pad)}
              width={cellW}
              height={cellH}
              fill={on ? C.accent : "none"}
              fillOpacity={on ? 0.75 : 0}
              stroke={inFlight ? C.text : C.textDim}
              strokeOpacity={inFlight ? 0.9 : 0.45}
            />
          );
        })}
      </svg>
    </div>
  );
};

const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const fadeIn = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = settledCount(frame);
  const fill = Math.round((n / 12) * 99);
  const barIn = interpolate(frame, [176, 188], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const chip: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 19 * u,
    letterSpacing: "0.22em",
    color: C.textDim,
    position: "absolute",
  };

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ ...chip, top: 44 * u, left: 56 * u }}>DOCK 15 · MFT #88413</div>
      <div style={{ ...chip, top: 44 * u, right: 56 * u, color: C.text, display: "flex", alignItems: "center", gap: 12 * u }}>
        <span style={{ width: 9 * u, height: 9 * u, background: C.accent, display: "inline-block" }} />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          PLT {String(n).padStart(2, "0")}/12 · {String(fill).padStart(2, "0")}%
        </span>
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
        FILL 99% · 12/12
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

export const S2Pack: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 50, 150]} />
        <CameraRig frame={frame} />
        <GroundGrid />
        <Backdrop />
        {/* trailer de vidrio esperando el plan, puertas traseras abiertas
            contra los laterales (la carga entra por donde corresponde) */}
        <ParkedTrailer position={[0, 0, 0]} edgeColor={C.hero} faceColor="#20304F" edgeOpacity={1} faceOpacity={0.24} />
        <WireBox faceColor="#20304F" size={[0.06, 2.6, 1.25]} position={[-1.31, 1.73, -6.78]} edgeColor={C.hero} edgeOpacity={0.85} />
        <WireBox faceColor="#20304F" size={[0.06, 2.6, 1.25]} position={[1.31, 1.73, -6.78]} edgeColor={C.hero} edgeOpacity={0.85} />
        {/* marca de slot bajo el trailer */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.6, 13.4]} />
          <meshBasicMaterial color={C.accent} transparent opacity={0.05} />
        </mesh>
        {/* los 12 pallets: cola → vuelo → slot */}
        {Array.from({ length: 12 }, (_, i) => {
          const p = palletAtFixed(i, frame);
          return (
            <group key={i} position={[p.x, p.y, p.z]}>
              <PalletStack x={0} z={0} reveal={1} />
            </group>
          );
        })}
        <DataMotes frame={frame} count={70} />
      </ThreeCanvas>
      <FillDiagram frame={frame} />
      <Hud frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
