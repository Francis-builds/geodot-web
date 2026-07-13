import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { GroundGrid, DataMotes, CornerBrackets } from "../world/primitives";
import { PalletStack } from "../world/Truck";
import { Worker } from "../world/Worker";
import { Rack } from "../world/Rack";
import { WarehouseInterior, ControlTower } from "../world/Warehouse";

export const S7_DURATION = 192;

// Pallet en origen; operario a +z apuntando el lector al bulto.
// f28: haz ON + brackets · f40: cota LOT · f74-124: paquete de datos vuela
// a la torre (fondo) · f126: la torre registra · f150: barra final.
const SCANNER: [number, number, number] = [-0.315, 1.31, 1.55];
const BOX: [number, number, number] = [0, 1.15, 0.4];
const TOWER: [number, number, number] = [-11.5, 0, -18];
const OFFICE: [number, number, number] = [TOWER[0] - 0.2, 5.45, TOWER[2]];

const beamOn = (frame: number) => frame >= 28 && frame <= 78;

// bezier cuadrática scanner → control → oficina de la torre
const packetPos = (frame: number): [number, number, number] | null => {
  const t = interpolate(frame, [74, 124], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  if (frame < 74 || t >= 1) return null;
  const ctrl: [number, number, number] = [-2, 9.5, -10];
  const p = (a: number, b: number, c: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  return [p(SCANNER[0], ctrl[0], OFFICE[0]), p(SCANNER[1], ctrl[1], OFFICE[1]), p(SCANNER[2], ctrl[2], OFFICE[2])];
};

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.fov !== 34) {
    cam.fov = 34;
    cam.updateProjectionMatrix();
  }
  const e = interpolate(frame, [0, S7_DURATION - 1], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  camera.position.set(
    interpolate(e, [0, 1], [4.6, 3.4]),
    interpolate(e, [0, 1], [2.1, 2.6]),
    interpolate(e, [0, 1], [7.2, 5.6]),
  );
  // el lookAt deriva hacia la torre cuando el paquete viaja
  const toTower = interpolate(frame, [74, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  camera.lookAt(
    interpolate(toTower, [0, 1], [0.2, -4.5]),
    interpolate(toTower, [0, 1], [1.2, 3.8]),
    interpolate(toTower, [0, 1], [0.5, -11]),
  );
  return null;
};

const projCam = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 1000);
const project = (point: [number, number, number], frame: number, W: number, H: number) => {
  const e = interpolate(frame, [0, S7_DURATION - 1], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  projCam.aspect = W / H;
  projCam.position.set(
    interpolate(e, [0, 1], [4.6, 3.4]),
    interpolate(e, [0, 1], [2.1, 2.6]),
    interpolate(e, [0, 1], [7.2, 5.6]),
  );
  const toTower = interpolate(frame, [74, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  projCam.lookAt(
    interpolate(toTower, [0, 1], [0.2, -4.5]),
    interpolate(toTower, [0, 1], [1.2, 3.8]),
    interpolate(toTower, [0, 1], [0.5, -11]),
  );
  projCam.updateMatrixWorld();
  projCam.updateProjectionMatrix();
  const v = new THREE.Vector3(...point).project(projCam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
};

const Callout: React.FC<{ frame: number }> = ({ frame }) => {
  const { width, height } = useVideoConfig();
  const u = height / 1080;
  const a = interpolate(frame, [40, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [104, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (a <= 0 || fadeOut <= 0) return null;
  const anchor = project(BOX, frame, width, height);
  const ex = anchor.x + 170 * u;
  const ey = anchor.y - 130 * u;
  const ok = frame > 62;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fadeOut }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <g opacity={a * 0.85}>
          <circle cx={anchor.x} cy={anchor.y} r={4 * u} fill={C.accent} />
          <polyline
            points={`${anchor.x},${anchor.y} ${ex - 34 * u},${ey} ${ex},${ey}`}
            fill="none"
            stroke={C.accent}
            strokeWidth={1.5 * u}
          />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: ex + 8 * u,
          top: ey,
          transform: "translateY(-50%)",
          opacity: a,
          fontFamily: MONO,
          fontSize: 17 * u,
          letterSpacing: "0.16em",
          color: C.text,
          border: `1px solid ${C.accent}55`,
          background: "#080F1FCC",
          padding: `${9 * u}px ${16 * u}px`,
          display: "flex",
          alignItems: "center",
          gap: 12 * u,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: C.textDim }}>LOT</span>
        A-4471
        <span style={{ color: C.accent, opacity: ok ? 1 : 0 }}>OK</span>
      </div>
    </AbsoluteFill>
  );
};

const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const fadeIn = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barIn = interpolate(frame, [150, 164], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chip: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 19 * u,
    letterSpacing: "0.22em",
    color: C.textDim,
    position: "absolute",
  };
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ ...chip, top: 44 * u, left: 56 * u }}>SCAN · POS B-04-2</div>
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
        LOT A-4471 → TORRE · LIVE
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

export const S7Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const beam = beamOn(frame);
  const beamFlicker = 0.55 + 0.35 * Math.abs(Math.sin(frame / 2.2));
  const pkt = packetPos(frame);
  const towerFlash = interpolate(frame, [122, 128, 146], [0, 0.9, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 28, 95]} />
        <CameraRig frame={frame} />
        <GroundGrid size={200} />
        <WarehouseInterior position={[0, 0, -8]} width={30} depth={52} height={8.5} aisles={false} />
        {/* pallet objetivo + operario pistoleando */}
        <group position={[0, -1.175, 0.4]}>
          <PalletStack x={0} z={0} reveal={1} />
        </group>
        <Worker position={[-0.1, 0, 2.15]} rotationY={Math.PI} pose="scan" frame={frame} />
        {beam && (
          <>
            {/* cono de escaneo: abanico translúcido + línea central + impacto */}
            <mesh
              geometry={(() => {
                const g = new THREE.BufferGeometry();
                const spread = 0.42;
                const verts = [
                  ...SCANNER,
                  BOX[0] - spread, BOX[1] + spread * 0.7, BOX[2],
                  BOX[0] + spread, BOX[1] + spread * 0.7, BOX[2],
                  ...SCANNER,
                  BOX[0] + spread, BOX[1] + spread * 0.7, BOX[2],
                  BOX[0] + spread, BOX[1] - spread * 0.7, BOX[2],
                  ...SCANNER,
                  BOX[0] + spread, BOX[1] - spread * 0.7, BOX[2],
                  BOX[0] - spread, BOX[1] - spread * 0.7, BOX[2],
                  ...SCANNER,
                  BOX[0] - spread, BOX[1] - spread * 0.7, BOX[2],
                  BOX[0] - spread, BOX[1] + spread * 0.7, BOX[2],
                ];
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                return g;
              })()}
              renderOrder={5}
            >
              <meshBasicMaterial color={C.accent} transparent opacity={beamFlicker * 0.14} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <lineSegments
              geometry={(() => {
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute([...SCANNER, ...BOX], 3));
                return g;
              })()}
              renderOrder={6}
            >
              <lineBasicMaterial color={C.accent} transparent opacity={Math.min(1, beamFlicker + 0.25)} depthWrite={false} />
            </lineSegments>
            <mesh position={BOX} renderOrder={6}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshBasicMaterial color={C.accent} transparent opacity={beamFlicker} depthWrite={false} />
            </mesh>
            <CornerBrackets size={[1.35, 1.25, 1.95]} position={[0, 1.05, 0.4]} opacity={1} arm={0.35} />
          </>
        )}
        {/* racks de contexto + torre al fondo */}
        <Rack position={[-6.5, 0, -3]} rotationY={Math.PI / 2} bays={4} levels={3} fill={0.7} seed={13} edgeOpacity={0.55} />
        <Rack position={[6.5, 0, -5]} rotationY={Math.PI / 2} bays={4} levels={3} fill={0.6} seed={17} edgeOpacity={0.5} />
        <ControlTower position={TOWER} rotationY={Math.PI / 2} frame={frame} />
        {towerFlash > 0.01 && (
          <CornerBrackets size={[3.6, 3.1, 6.8]} position={[OFFICE[0], OFFICE[1], OFFICE[2]]} opacity={towerFlash} arm={0.8} />
        )}
        {/* paquete de datos: scanner → torre, con estela */}
        {pkt &&
          [0, 1, 2, 3].map((k) => {
            const ghost = packetPos(frame - k * 2.5);
            if (!ghost) return null;
            return (
              <mesh key={k} position={ghost} renderOrder={5}>
                <sphereGeometry args={[0.09 - k * 0.015, 8, 8]} />
                <meshBasicMaterial color={C.accent} transparent opacity={0.85 - k * 0.2} depthWrite={false} />
              </mesh>
            );
          })}
        <DataMotes frame={frame} count={40} />
      </ThreeCanvas>
      <Callout frame={frame} />
      <Hud frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
