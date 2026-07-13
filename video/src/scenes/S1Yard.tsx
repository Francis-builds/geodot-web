import React, { useEffect } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { hash2 } from "../world/hash";
import { WireBox, CornerBrackets, GroundGrid, DataMotes } from "../world/primitives";
import { Truck } from "../world/Truck";

export const S1_DURATION = 192; // 8s @ 24fps

// ---- layout del yard ----
const ROW_X = [-27.5, -20.5, -13.5, -7.5, 7.5, 13.5, 20.5, 27.5];
const SLOT_Z_START = -88;
const SLOT_Z_STEP = 13.4;
const SLOT_COUNT = 9;
const CONT: [number, number, number] = [2.6, 2.7, 12.4];

// ---- timing ----
const SWEEP_START = 18;
const SWEEP_END = 168;
const sweepZ = (frame: number) =>
  interpolate(frame, [SWEEP_START, SWEEP_END], [-95, 34], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const truckZ = (frame: number) => interpolate(frame, [0, S1_DURATION - 1], [-46, 10]);

const lerpColor = (a: string, b: string, t: number) =>
  "#" + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  useEffect(() => {
    (camera as THREE.PerspectiveCamera).fov = 30;
    camera.updateProjectionMatrix();
  }, [camera]);
  const e = interpolate(frame, [0, S1_DURATION - 1], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
  });
  const tz = truckZ(frame);
  // vista torre de control: cámara alta 3/4 que sigue al camión — nada la ocluye
  camera.position.set(
    interpolate(e, [0, 1], [-19, -11]),
    interpolate(e, [0, 1], [41, 31]),
    tz + interpolate(e, [0, 1], [34, 28]),
  );
  camera.lookAt(0, 0, tz - 5);
  return null;
};

const ContainerStack: React.FC<{ row: number; slot: number; frame: number }> = ({ row, slot, frame }) => {
  const h = hash2(row, slot);
  if (h < 0.14) return null; // slot vacío
  const levels = 1 + Math.floor(h * 3); // 1..3
  const x = ROW_X[row];
  const z = SLOT_Z_START + slot * SLOT_Z_STEP;
  const lit = interpolate(sweepZ(frame) - z, [-4, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const edge = lerpColor(C.edgeDim, C.edgeLit, lit);
  const face = lerpColor(C.face, C.faceLit, lit);
  return (
    <group>
      {Array.from({ length: levels }, (_, k) => (
        <WireBox
          key={k}
          size={CONT}
          position={[x, CONT[1] / 2 + k * CONT[1], z]}
          edgeColor={edge}
          faceColor={face}
          edgeOpacity={0.6 + lit * 0.35}
        />
      ))}
    </group>
  );
};

// Línea de barrido sobre el piso + cortina sutil
const SweepPlane: React.FC<{ frame: number }> = ({ frame }) => {
  const z = sweepZ(frame);
  const active = frame >= SWEEP_START && frame <= SWEEP_END;
  if (!active) return null;
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 0.5]} />
        <meshBasicMaterial color={C.accent} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 5.5, 0]}>
        <planeGeometry args={[110, 11]} />
        <meshBasicMaterial color={C.accent} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

// Marcas de carril (línea central discontinua)
const LaneMarks: React.FC = () => (
  <group>
    {Array.from({ length: 18 }, (_, i) => (
      <mesh key={i} position={[0, 0.015, -88 + i * 7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 3]} />
        <meshBasicMaterial color={C.gridMajor} transparent opacity={0.8} />
      </mesh>
    ))}
  </group>
);

// Pórtico de entrada (gate) con sensor
const Gate: React.FC<{ frame: number }> = ({ frame }) => {
  const blink = 0.45 + 0.4 * Math.abs(Math.sin(frame / 14));
  return (
    <group position={[0, 0, 16]}>
      <WireBox size={[0.5, 6.4, 0.5]} position={[-4.6, 3.2, 0]} edgeOpacity={0.7} />
      <WireBox size={[0.5, 6.4, 0.5]} position={[4.6, 3.2, 0]} edgeOpacity={0.7} />
      <WireBox size={[9.7, 0.6, 0.5]} position={[0, 6.7, 0]} edgeOpacity={0.7} />
      <mesh position={[0, 6.15, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshBasicMaterial color={C.accent} transparent opacity={blink} />
      </mesh>
    </group>
  );
};

// ---- HUD (pantalla, mono, estilo telemetría) ----
const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080; // escala relativa
  const fadeIn = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const total = 247;
  const scanned = Math.round(
    interpolate(frame, [SWEEP_START, SWEEP_END], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const barIn = interpolate(frame, [104, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const chip: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 19 * u,
    letterSpacing: "0.22em",
    color: C.textDim,
    position: "absolute",
  };

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ ...chip, top: 44 * u, left: 56 * u }}>YARD-A · GATE 03</div>
      <div style={{ ...chip, top: 44 * u, right: 56 * u, color: C.text, display: "flex", alignItems: "center", gap: 12 * u }}>
        <span style={{ width: 9 * u, height: 9 * u, background: C.accent, display: "inline-block" }} />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {String(scanned).padStart(3, "0")}/{total}
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
        TRK-114 → DOCK 15
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

export const S1Yard: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tz = truckZ(frame);
  const wheelSpin = (tz + 46) / 0.52;

  // el barrido cruza al camión ~f103 → aparecen brackets + barra HUD
  const truckSweepLit = interpolate(sweepZ(frame) - tz, [-2, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bracketPulse = truckSweepLit * (0.72 + 0.18 * Math.abs(Math.sin(frame / 9)));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 55, 165]} />
        <CameraRig frame={frame} />
        <GroundGrid />
        <LaneMarks />
        {ROW_X.map((_, r) =>
          Array.from({ length: SLOT_COUNT }, (_, s) => <ContainerStack key={`${r}-${s}`} row={r} slot={s} frame={frame} />),
        )}
        <Gate frame={frame} />
        <group>
          <Truck position={[0, 0, tz]} wheelSpin={wheelSpin} />
          {truckSweepLit > 0.01 && (
            <CornerBrackets size={[3.4, 4.6, 17.5]} position={[0, 2.2, tz - 2.6]} opacity={bracketPulse} arm={1.1} />
          )}
        </group>
        <SweepPlane frame={frame} />
        <DataMotes frame={frame} />
      </ThreeCanvas>
      <Hud frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
