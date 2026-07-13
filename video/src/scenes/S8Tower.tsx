import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { GroundGrid, DataMotes } from "../world/primitives";
import { ParkedTrailer } from "../world/Truck";
import { Forklift } from "../world/Forklift";
import { Rack } from "../world/Rack";
import { DockDoor } from "../world/Dock";
import { WarehouseInterior, ControlTower } from "../world/Warehouse";
import { Worker } from "../world/Worker";

export const S8_DURATION = 216; // 9s: el gran final respira un poco más

const OFFICE: [number, number, number] = [-13.4, 5.45, -14];

// fuentes de datos → oficina de la torre (todo lo que pasa, en vivo)
const SOURCES: [number, number, number][] = [
  [0, 1.2, -33.5], // vano del dock
  [-10, 4.2, 3], // rack oeste
  [10, 4.2, 2], // rack este
  [2.5, 1.0, 4], // autoelevador
  [-5.2, 1.4, 8], // operario pistoleando
];

const curvePoint = (src: [number, number, number], t: number): [number, number, number] => {
  const ctrl: [number, number, number] = [(src[0] + OFFICE[0]) / 2, Math.max(src[1], OFFICE[1]) + 5.5, (src[2] + OFFICE[2]) / 2];
  const p = (a: number, b: number, c: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  return [p(src[0], ctrl[0], OFFICE[0]), p(src[1], ctrl[1], OFFICE[1]), p(src[2], ctrl[2], OFFICE[2])];
};

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.fov !== 32) {
    cam.fov = 32;
    cam.updateProjectionMatrix();
  }
  const e = interpolate(frame, [0, S8_DURATION - 1], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  // de la oficina hacia el gran plano general: el depósito entero visible
  camera.position.set(
    interpolate(e, [0, 1], [-6.5, 15]),
    interpolate(e, [0, 1], [6.2, 22]),
    interpolate(e, [0, 1], [-14, 25]),
  );
  camera.lookAt(
    interpolate(e, [0, 1], [-13, 0]),
    interpolate(e, [0, 1], [5.5, 1.8]),
    interpolate(e, [0, 1], [-14, -12]),
  );
  return null;
};

// arcos de datos: curva tenue + paquetes que fluyen en loop
const DataFlows: React.FC<{ frame: number }> = ({ frame }) => {
  const curves = useMemo(
    () =>
      SOURCES.map((src) => {
        const pts: number[] = [];
        for (let i = 0; i < 28; i++) {
          const a = curvePoint(src, i / 28);
          const b = curvePoint(src, (i + 1) / 28);
          pts.push(...a, ...b);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        return g;
      }),
    [],
  );
  const flowIn = interpolate(frame, [56, 86], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (flowIn <= 0) return null;
  return (
    <group>
      {SOURCES.map((src, i) => (
        <group key={i}>
          <lineSegments geometry={curves[i]} renderOrder={4}>
            <lineBasicMaterial color={C.accent} transparent opacity={0.22 * flowIn} depthWrite={false} />
          </lineSegments>
          {/* 2 paquetes por arco, en loop continuo (tiempo real) */}
          {[0, 0.5].map((off) => {
            const t = (frame / 90 + off + i * 0.17) % 1;
            const p = curvePoint(src, t);
            return (
              <mesh key={off} position={p} renderOrder={5}>
                <sphereGeometry args={[0.09, 8, 8]} />
                <meshBasicMaterial color={C.accent} transparent opacity={0.8 * flowIn} depthWrite={false} />
              </mesh>
            );
          })}
          {/* pulso en la fuente */}
          <mesh position={src} renderOrder={5}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial
              color={C.accent}
              transparent
              opacity={flowIn * (0.35 + 0.35 * Math.abs(Math.sin(frame / 9 + i)))}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const fadeIn = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stats: { at: number; label: string }[] = [
    { at: 70, label: "OCC 99%" },
    { at: 92, label: "POS 128/128" },
    { at: 114, label: "TRK 12 LIVE" },
  ];
  const barIn = interpolate(frame, [178, 194], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chip: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 19 * u,
    letterSpacing: "0.22em",
    color: C.textDim,
    position: "absolute",
  };
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ ...chip, top: 44 * u, left: 56 * u }}>TORRE · LIVE</div>
      <div style={{ position: "absolute", top: 44 * u, right: 56 * u, display: "flex", gap: 18 * u }}>
        {stats.map((s) => {
          const a = interpolate(frame, [s.at, s.at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={s.label}
              style={{
                opacity: a,
                transform: `translateY(${(1 - a) * 10 * u}px)`,
                fontFamily: MONO,
                fontSize: 18 * u,
                letterSpacing: "0.2em",
                color: C.text,
                border: `1px solid ${C.accent}44`,
                background: "#080F1FB8",
                padding: `${10 * u}px ${18 * u}px`,
                display: "flex",
                alignItems: "center",
                gap: 12 * u,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ width: 8 * u, height: 8 * u, background: C.accent }} />
              {s.label}
            </div>
          );
        })}
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
        TODO VISIBLE · EN TIEMPO REAL
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

export const S8Tower: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // autoelevador circulando despacio con pallet
  const fkZ = interpolate(frame, [0, S8_DURATION - 1], [6, -1], { easing: Easing.inOut(Easing.quad) });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 42, 140]} />
        <CameraRig frame={frame} />
        <GroundGrid size={260} />
        <WarehouseInterior position={[0, 0, -6]} width={34} depth={62} height={9} />
        {/* pared de docks al fondo con vano abierto y trailer de vidrio */}
        {[
          { size: [14.05, 6.4, 0.3] as [number, number, number], pos: [-8.975, 3.2, -34] as [number, number, number] },
          { size: [14.05, 6.4, 0.3] as [number, number, number], pos: [8.975, 3.2, -34] as [number, number, number] },
          { size: [3.9, 2.2, 0.3] as [number, number, number], pos: [0, 5.3, -34] as [number, number, number] },
        ].map((seg, i) => (
          <mesh key={i} position={seg.pos}>
            <boxGeometry args={seg.size} />
            <meshBasicMaterial color="#0A1424" polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
          </mesh>
        ))}
        <DockDoor position={[0, 0, -33.85]} number="15" open={0.88} edgeColor={C.edgeLit} edgeOpacity={0.8} />
        <DockDoor position={[-8.5, 0, -33.85]} number="14" open={0} />
        <DockDoor position={[8.5, 0, -33.85]} number="16" open={0} />
        <ParkedTrailer position={[0, -1.175, -41]} edgeColor={C.edgeDim} faceColor="#20304F" edgeOpacity={0.7} faceOpacity={0.4} />
        {/* filas de racks */}
        <Rack position={[-10, 0, 3]} rotationY={Math.PI / 2} bays={6} levels={3} fill={0.75} seed={21} edgeOpacity={0.6} />
        <Rack position={[-14.8, 0, 5]} rotationY={Math.PI / 2} bays={6} levels={3} fill={0.7} seed={23} edgeOpacity={0.5} />
        <Rack position={[10, 0, -2]} rotationY={Math.PI / 2} bays={6} levels={3} fill={0.72} seed={25} edgeOpacity={0.6} />
        <Rack position={[14.8, 0, -2]} rotationY={Math.PI / 2} bays={6} levels={3} fill={0.68} seed={27} edgeOpacity={0.5} />
        {/* la torre: el ancla */}
        <ControlTower position={[-13.2, 0, -14]} rotationY={Math.PI / 2} frame={frame} />
        {/* vida en el piso */}
        <Forklift position={[2.5, 0, fkZ]} rotationY={Math.PI} forkHeight={0.3} pallet frame={frame} edgeColor={C.hero} />
        <Worker position={[-5.2, 0, 8]} rotationY={2.4} pose="scan" frame={frame} />
        <DataFlows frame={frame} />
        <DataMotes frame={frame} count={70} />
      </ThreeCanvas>
      <Hud frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
