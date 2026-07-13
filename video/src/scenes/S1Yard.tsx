import React, { useEffect } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { hash2 } from "../world/hash";
import { WireBox, CornerBrackets, GroundGrid, DataMotes } from "../world/primitives";
import { Container, CONT_SIZE } from "../world/Container";
import { Truck, ParkedTrailer } from "../world/Truck";

export const S1_DURATION = 192; // 8s @ 24fps

// ---- layout del yard ----
const ROW_X = [-27.5, -20.5, -13.5, -7.5, 7.5, 13.5, 20.5, 27.5];
const SLOT_Z_START = -88;
const SLOT_Z_STEP = 13.4;
const SLOT_COUNT = 9;
const CONT = CONT_SIZE;

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

const litAt = (frame: number, z: number) =>
  interpolate(sweepZ(frame) - z, [-4, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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

// Slot: vacío / trailer estacionado / pila de containers, según hash
const YardSlot: React.FC<{ row: number; slot: number; frame: number }> = ({ row, slot, frame }) => {
  const h = hash2(row, slot);
  if (h < 0.1) return null;
  const x = ROW_X[row];
  const z = SLOT_Z_START + slot * SLOT_Z_STEP;
  const lit = litAt(frame, z);
  const edge = lerpColor(C.edgeDim, C.edgeLit, lit);
  const face = lerpColor(C.face, C.faceLit, lit);
  const opacity = 0.6 + lit * 0.35;

  if (h < 0.17) {
    return <ParkedTrailer position={[x, 0, z]} edgeColor={edge} faceColor={face} edgeOpacity={opacity} />;
  }
  const levels = 1 + Math.floor(((h - 0.17) / 0.83) * 3); // 1..3
  return (
    <group>
      {Array.from({ length: levels }, (_, k) => (
        <Container
          key={k}
          position={[x, CONT[1] / 2 + k * CONT[1], z]}
          edgeColor={edge}
          faceColor={face}
          edgeOpacity={opacity}
        />
      ))}
    </group>
  );
};

// Marcas de slot pintadas en el piso (también en los vacíos: slots libres)
const slotMarksGeo = (() => {
  const p: number[] = [];
  for (const x of ROW_X) {
    for (let s = 0; s < SLOT_COUNT; s++) {
      const z = SLOT_Z_START + s * SLOT_Z_STEP;
      const hw = 1.7, hl = 6.5, y = 0.02;
      p.push(x - hw, y, z - hl, x + hw, y, z - hl);
      p.push(x + hw, y, z - hl, x + hw, y, z + hl);
      p.push(x + hw, y, z + hl, x - hw, y, z + hl);
      p.push(x - hw, y, z + hl, x - hw, y, z - hl);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

const SlotMarks: React.FC = () => (
  <lineSegments geometry={slotMarksGeo}>
    <lineBasicMaterial color={C.gridMajor} transparent opacity={0.9} />
  </lineSegments>
);

// Postes de luz a lo largo del carril, con pileta de luz tenue
const LightPole: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const dir = x > 0 ? -1 : 1;
  return (
    <group position={[x, 0, z]}>
      <WireBox size={[0.16, 7.5, 0.16]} position={[0, 3.75, 0]} edgeColor={C.edgeDim} edgeOpacity={0.8} />
      <WireBox size={[1.7, 0.12, 0.12]} position={[dir * 0.85, 7.35, 0]} edgeColor={C.edgeDim} edgeOpacity={0.8} />
      <mesh position={[dir * 1.55, 7.25, 0]}>
        <boxGeometry args={[0.55, 0.1, 0.3]} />
        <meshBasicMaterial color={C.hero} transparent opacity={0.85} />
      </mesh>
      <mesh position={[dir * 1.6, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.2, 24]} />
        <meshBasicMaterial color={C.edgeLit} transparent opacity={0.035} depthWrite={false} />
      </mesh>
    </group>
  );
};

// Grúa pórtico al fondo del yard, con container colgando
const Crane: React.FC = () => (
  <group position={[0, 0, -80]}>
    {[-3, 3].map((dz) =>
      [-26, 26].map((x) => (
        <WireBox key={`${x}-${dz}`} size={[1.0, 15, 1.0]} position={[x, 7.5, dz]} edgeColor={C.edgeDim} edgeOpacity={0.85} />
      )),
    )}
    {[-26, 26].map((x) => (
      <WireBox key={x} size={[1.0, 1.0, 7]} position={[x, 14.6, 0]} edgeColor={C.edgeDim} edgeOpacity={0.85} />
    ))}
    <WireBox size={[56, 1.4, 1.4]} position={[0, 15.5, -3]} edgeColor={C.edgeDim} edgeOpacity={0.85} />
    <WireBox size={[56, 1.4, 1.4]} position={[0, 15.5, 3]} edgeColor={C.edgeDim} edgeOpacity={0.85} />
    {/* trolley + cables + container colgando */}
    <WireBox size={[2.4, 1.2, 5.5]} position={[7, 14.2, 0]} edgeColor={C.edgeDim} edgeOpacity={0.85} />
    <lineSegments
      geometry={(() => {
        const p: number[] = [];
        for (const dx of [-1, 1]) for (const dz of [-2.4, 2.4]) p.push(7 + dx, 13.6, dz, 7 + dx, 10.1, dz);
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
        return g;
      })()}
    >
      <lineBasicMaterial color={C.edgeDim} transparent opacity={0.7} />
    </lineSegments>
    <group rotation={[0, Math.PI / 2, 0]} position={[7, 8.7, 0]}>
      <Container position={[0, 0, 0]} edgeColor={C.edgeDim} faceColor={C.face} edgeOpacity={0.8} />
    </group>
  </group>
);

// Depósitos en el horizonte lateral (contexto, parallax)
const Warehouse: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0, -40]}>
    <WireBox size={[26, 9, 70]} position={[0, 4.5, 0]} edgeColor={C.edgeDim} edgeOpacity={0.6} />
    <WireBox size={[10, 1.6, 60]} position={[0, 9.7, 0]} edgeColor={C.edgeDim} edgeOpacity={0.5} />
    {/* portones de dock hacia el yard */}
    <lineSegments
      geometry={(() => {
        const p: number[] = [];
        const xd = (x > 0 ? -13 : 13) + (x > 0 ? -0.03 : 0.03);
        for (let i = 0; i < 7; i++) {
          const z = -27 + i * 9;
          p.push(xd, 0, z - 1.8, xd, 3.6, z - 1.8);
          p.push(xd, 3.6, z - 1.8, xd, 3.6, z + 1.8);
          p.push(xd, 3.6, z + 1.8, xd, 0, z + 1.8);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
        return g;
      })()}
    >
      <lineBasicMaterial color={C.edgeDim} transparent opacity={0.55} />
    </lineSegments>
  </group>
);

// Cerco perimetral en la línea del gate: el gate es la puerta del cerco
const fenceGeo = (() => {
  const p: number[] = [];
  const z = 16;
  for (const s of [-1, 1]) {
    for (const y of [1.1, 2.2]) p.push(s * 5.5, y, z, s * 42, y, z);
    for (let x = 5.5; x <= 42; x += 5.2) {
      p.push(s * x, 0, z, s * x, 2.3, z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

const Fence: React.FC = () => (
  <lineSegments geometry={fenceGeo}>
    <lineBasicMaterial color={C.edgeDim} transparent opacity={0.7} />
  </lineSegments>
);

// Pórtico de entrada: columnas, dintel, cámaras, sensor y garita
const Gate: React.FC<{ frame: number }> = ({ frame }) => {
  const blink = 0.45 + 0.4 * Math.abs(Math.sin(frame / 14));
  return (
    <group position={[0, 0, 16]}>
      <WireBox size={[0.5, 6.4, 0.5]} position={[-4.6, 3.2, 0]} edgeOpacity={0.7} />
      <WireBox size={[0.5, 6.4, 0.5]} position={[4.6, 3.2, 0]} edgeOpacity={0.7} />
      <WireBox size={[9.7, 0.6, 0.5]} position={[0, 6.7, 0]} edgeOpacity={0.7} />
      {/* cámaras bajo el dintel */}
      <WireBox size={[0.28, 0.2, 0.45]} position={[-2.2, 6.2, 0.1]} edgeOpacity={0.7} />
      <WireBox size={[0.28, 0.2, 0.45]} position={[2.2, 6.2, 0.1]} edgeOpacity={0.7} />
      {/* garita con ventana y antena */}
      <WireBox size={[2.2, 2.6, 2.2]} position={[6.6, 1.3, 1.6]} edgeOpacity={0.7} />
      <WireBox size={[0.05, 0.7, 1.2]} position={[5.47, 1.7, 1.6]} edgeOpacity={0.5} />
      <WireBox size={[0.06, 1.2, 0.06]} position={[7.4, 3.2, 1.0]} edgeOpacity={0.6} />
      <mesh position={[0, 6.15, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshBasicMaterial color={C.accent} transparent opacity={blink} />
      </mesh>
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
  const wheelSpin = (tz + 46) / 0.5;

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
        <SlotMarks />
        {ROW_X.map((_, r) =>
          Array.from({ length: SLOT_COUNT }, (_, s) => <YardSlot key={`${r}-${s}`} row={r} slot={s} frame={frame} />),
        )}
        {[-66, -40, -14, 12].map((z, i) => (
          <LightPole key={z} x={i % 2 === 0 ? -5.8 : 5.8} z={z} />
        ))}
        <Crane />
        <Warehouse x={-46} />
        <Warehouse x={46} />
        <Fence />
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
