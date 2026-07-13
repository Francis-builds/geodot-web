import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { GroundGrid, DataMotes, CornerBrackets } from "../world/primitives";
import { PalletStack } from "../world/Truck";
import { Forklift } from "../world/Forklift";
import { Rack, RACK_LEVEL_H } from "../world/Rack";
import { WarehouseInterior } from "../world/Warehouse";
import { hash2 } from "../world/hash";

export const S6_DURATION = 192;

// Pasillo entre dos racks (caras hacia el pasillo en x=±2.75). Target:
// rack derecho, bahía 2 (z=-1.45), nivel 2 (vigas y=3.8, piso pallet 3.86).
const TARGET = { x: 4.2, y: 3.86, z: -1.45, bay: 2, level: 2 };

// Timeline: f4-26 termina la aproximación DE FRENTE (nada de andar de
// costado: ya viene girado hacia el rack) · f26-104 eleva · f104-146
// inserta · f146-162 asienta
const fkX = (frame: number) => {
  if (frame <= 26)
    return interpolate(frame, [4, 26], [0.15, 0.75], { extrapolateLeft: "clamp", easing: Easing.out(Easing.quad) });
  if (frame <= 104) return 0.75;
  if (frame <= 146)
    return interpolate(frame, [104, 146], [0.75, 2.48], { easing: Easing.inOut(Easing.quad) });
  return 2.48;
};
const fkZ = (_frame: number) => TARGET.z;
const forkH = (frame: number) => {
  if (frame <= 24) return 0.25;
  if (frame <= 104) return interpolate(frame, [24, 104], [0.25, 3.92], { easing: Easing.inOut(Easing.cubic) });
  if (frame <= 146) return 3.92;
  return interpolate(frame, [146, 162], [3.92, 3.74], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
};
const seated = (frame: number) => frame > 158;

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.fov !== 34) {
    cam.fov = 34;
    cam.updateProjectionMatrix();
  }
  const e = interpolate(frame, [0, S6_DURATION - 1], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  // en el pasillo, siguiendo la elevación con un tilt suave
  camera.position.set(
    interpolate(e, [0, 1], [-3.6, -2.6]),
    interpolate(e, [0, 1], [2.4, 4.2]),
    interpolate(e, [0, 1], [11.5, 7.5]),
  );
  camera.lookAt(1.2, interpolate(e, [0, 1], [1.5, 3.6]), -1.3);
  return null;
};

// ocupación del rack derecho: la posición target queda vacía hasta la estiba
const rightReveal = (b: number, k: number) =>
  b === TARGET.bay && k === TARGET.level ? 0 : hash2(9 + b * 7, k * 13) < 0.68 ? 1 : 0;

// onda final: contornos de TODAS las posiciones, expandiendo desde el target
const RIPPLE_START = 160;
const SlotRipple: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < RIPPLE_START) return null;
  const out: React.ReactNode[] = [];
  for (const side of [-1, 1]) {
    for (let b = 0; b < 4; b++) {
      for (let k = 0; k <= 3; k++) {
        const dist = Math.abs(b - TARGET.bay) + Math.abs(k - TARGET.level) + (side === 1 ? 0 : 2);
        const op = interpolate(frame, [RIPPLE_START + dist * 5, RIPPLE_START + dist * 5 + 8], [0, 0.32], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (op <= 0.01) continue;
        const z = -(b * 2.9 - 5.8 + 1.45);
        const y = k === 0 ? 0.95 : k * RACK_LEVEL_H + 0.95;
        out.push(
          <CornerBrackets
            key={`${side}-${b}-${k}`}
            size={[1.5, 1.7, 2.6]}
            position={[side * 4.2, y, z]}
            opacity={op}
            arm={0.35}
            color={C.edgeLit}
          />,
        );
      }
    }
  }
  return <group>{out}</group>;
};

const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const fadeIn = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ok = seated(frame);
  const barIn = interpolate(frame, [166, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chip: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 19 * u,
    letterSpacing: "0.22em",
    color: C.textDim,
    position: "absolute",
  };
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ ...chip, top: 44 * u, left: 56 * u }}>PUTAWAY · PLT-0847</div>
      <div style={{ ...chip, top: 44 * u, right: 56 * u, color: ok ? C.text : C.textDim, display: "flex", alignItems: "center", gap: 12 * u }}>
        <span style={{ width: 9 * u, height: 9 * u, background: ok ? C.accent : "transparent", border: `1.5px solid ${C.accent}`, display: "inline-block" }} />
        POS B-04-2
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
        POS B-04-2 OK · 128/128 EN SISTEMA
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

export const S6Rack: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const x = fkX(frame);
  const z = fkZ(frame);
  const fh = forkH(frame);
  // pallet solidario a las uñas (uñas hacia +x: rotY -π/2)
  const palletX = x + 1.72;
  const palletY = fh + 0.12 - 1.195;
  const targetPulse = 0.45 + 0.35 * Math.abs(Math.sin(frame / 10));
  const preTarget = frame < 158;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 25, 85]} />
        <CameraRig frame={frame} />
        <GroundGrid size={200} />
        <WarehouseInterior position={[0, 0, 0]} width={30} depth={44} height={8.5} aisles={false} />
        {/* racks del pasillo */}
        <Rack position={[-4.2, 0, 0]} rotationY={Math.PI / 2} bays={4} levels={3} fill={0.72} seed={11} edgeOpacity={0.7} />
        <Rack position={[4.2, 0, 0]} rotationY={Math.PI / 2} bays={4} levels={3} seed={9} edgeOpacity={0.8} palletReveal={rightReveal} />
        {/* marca del target: la posición ya está asignada antes de llegar */}
        {preTarget && (
          <CornerBrackets size={[1.6, 1.75, 2.7]} position={[TARGET.x, TARGET.y + 0.82, TARGET.z]} opacity={targetPulse} arm={0.45} />
        )}
        {/* autoelevador (uñas hacia +x) con pallet solidario */}
        <Forklift position={[x, 0, z]} rotationY={Math.PI / 2} forkHeight={fh} frame={frame} edgeColor={C.hero} />
        <group position={[palletX, palletY, z]} rotation={[0, Math.PI / 2, 0]}>
          <PalletStack x={0} z={0} reveal={1} />
        </group>
        <SlotRipple frame={frame} />
        <DataMotes frame={frame} count={40} />
      </ThreeCanvas>
      <Hud frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
