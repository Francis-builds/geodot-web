import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { GroundGrid, DataMotes } from "../world/primitives";
import { Forklift } from "../world/Forklift";
import { Rack } from "../world/Rack";
import { DockBay } from "../world/Dock";
import { WarehouseShell, ControlTower } from "../world/Warehouse";
import { Worker } from "../world/Worker";
import { WireBox } from "../world/primitives";

export const SHOWCASE_DURATION = 288; // 12s @ 24fps

// line-up de assets sobre la grilla, cámara en dolly lateral
const STOPS: { x: number; label: string }[] = [
  { x: 0, label: "AUTOELEVADOR" },
  { x: 6, label: "AUTOELEVADOR + PALLET" },
  { x: 11, label: "OPERARIO + LECTOR" },
  { x: 20, label: "RACK SELECTIVO 4x3" },
  { x: 32, label: "ANDEN / DOCK" },
  { x: 43, label: "TORRE DE CONTROL" },
];

const camX = (frame: number) =>
  interpolate(frame, [0, SHOWCASE_DURATION - 1], [-3, 47], {
    easing: Easing.inOut(Easing.quad),
  });

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.fov !== 30) {
    cam.fov = 30;
    cam.updateProjectionMatrix();
  }
  const x = camX(frame);
  camera.position.set(x - 3.5, 6.2, 17);
  camera.lookAt(x + 1.5, 2.2, -1);
  return null;
};

const projCam = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 1000);
const project = (point: [number, number, number], frame: number, W: number, H: number) => {
  const x = camX(frame);
  projCam.aspect = W / H;
  projCam.position.set(x - 3.5, 6.2, 17);
  projCam.lookAt(x + 1.5, 2.2, -1);
  projCam.updateMatrixWorld();
  projCam.updateProjectionMatrix();
  const v = new THREE.Vector3(...point).project(projCam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
};

const Labels: React.FC<{ frame: number }> = ({ frame }) => {
  const { width, height } = useVideoConfig();
  const u = height / 1080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {STOPS.map((s) => {
        const p = project([s.x, 0, 4.5], frame, width, height);
        // visible cuando está cerca del centro horizontal
        const dist = Math.abs(p.x - width / 2) / (width / 2);
        const op = interpolate(dist, [0.55, 0.8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (op <= 0) return null;
        return (
          <div
            key={s.label}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              transform: "translate(-50%, 0)",
              opacity: op,
              fontFamily: MONO,
              fontSize: 18 * u,
              letterSpacing: "0.22em",
              color: C.textDim,
              border: `1px solid ${C.accent}44`,
              background: "#080F1FB8",
              padding: `${10 * u}px ${20 * u}px`,
              whiteSpace: "nowrap",
            }}
          >
            {s.label}
          </div>
        );
      })}
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

export const AssetShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 45, 130]} />
        <CameraRig frame={frame} />
        <GroundGrid />
        {/* backdrop: la nave completa con andenes */}
        <WarehouseShell position={[22, 0, -26]} docks={6} firstDock={12} />
        {/* line-up */}
        <Forklift position={[0, 0, 0]} rotationY={0.5} forkHeight={0.1} frame={frame} />
        <Forklift position={[6, 0, 0]} rotationY={0.3} forkHeight={1.5} pallet frame={frame} />
        <Worker position={[11, 0, 0.5]} rotationY={0.4} pose="scan" frame={frame} />
        <Rack position={[20, 0, -1]} rotationY={0.12} bays={4} levels={3} fill={0.72} seed={3} />
        {/* módulo de andén exhibido de frente, con muro portante */}
        <group position={[32, 0, -2]} rotation={[0, 0.1, 0]}>
          <WireBox faceColor="#0B1526" size={[12, 5.4, 0.5]} position={[0, 2.7, -0.3]} edgeColor={C.edgeDim} edgeOpacity={0.7} />
          <DockBay position={[-2.9, 0, 0]} number="14" open={0} />
          <DockBay position={[2.9, 0, 0]} number="15" open={0.85} />
        </group>
        <ControlTower position={[43, 0, -1]} rotationY={-0.15} frame={frame} />
        <DataMotes frame={frame} count={60} />
      </ThreeCanvas>
      <Labels frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
