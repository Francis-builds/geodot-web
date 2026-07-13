import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { GroundGrid, DataMotes, CornerBrackets } from "../world/primitives";
import { ParkedTrailer, PalletStack } from "../world/Truck";
import { Forklift } from "../world/Forklift";
import { Rack } from "../world/Rack";
import { DockDoor } from "../world/Dock";
import { WarehouseInterior } from "../world/Warehouse";

export const S5_DURATION = 192;

// Interior del depósito. Pared de docks en z=0 (cara interior mira +z).
// El trailer docked se ve a través del vano; su piso quedó a nivel del
// interior gracias a la niveladora. El autoelevador entra, pincha el pallet
// de la boca del trailer, y lo lleva al staging.
//
// Timeline (una sola acción limpia, sin teletransportes):
//   f0-56:   forklift avanza de z=9 a z=0.42 (uñas entran al pallet)
//   f56-72:  levanta (forkHeight 0.1 → 0.45)
//   f72-136: retrocede hasta el staging z=7.6
//   f136-156: baja el pallet (0.45 → 0.12) y se detiene
//   f156+:   brackets + registro del pallet
const PICKUP_Z = 0.42;
const fkZ = (frame: number) => {
  if (frame <= 56)
    return interpolate(frame, [4, 56], [9, PICKUP_Z], { extrapolateLeft: "clamp", easing: Easing.inOut(Easing.quad) });
  if (frame <= 72) return PICKUP_Z;
  return interpolate(frame, [72, 136], [PICKUP_Z, 7.6], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
};
const forkH = (frame: number) => {
  if (frame <= 56) return 0.1;
  if (frame <= 72) return interpolate(frame, [56, 72], [0.1, 0.45]);
  if (frame <= 136) return 0.45;
  // baja hasta -0.08: el pallet toca el piso y las uñas quedan dentro de
  // los túneles del deck (si quedan más arriba, el pallet flota)
  return interpolate(frame, [136, 156], [0.45, -0.08], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
};
const carrying = (frame: number) => frame > 58;

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.fov !== 32) {
    cam.fov = 32;
    cam.updateProjectionMatrix();
  }
  const e = interpolate(frame, [0, S5_DURATION - 1], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  camera.position.set(
    interpolate(e, [0, 1], [-8.8, -6.2]),
    interpolate(e, [0, 1], [5.8, 4.4]),
    interpolate(e, [0, 1], [14.5, 11]),
  );
  camera.lookAt(0.3, 1.2, interpolate(e, [0, 1], [1.5, 2.5]));
  return null;
};

const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const fadeIn = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const registered = frame > 158 ? 3 : 2;
  const barIn = interpolate(frame, [160, 174], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chip: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 19 * u,
    letterSpacing: "0.22em",
    color: C.textDim,
    position: "absolute",
  };
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ ...chip, top: 44 * u, left: 56 * u }}>DOCK 15 · UNLOAD</div>
      <div style={{ ...chip, top: 44 * u, right: 56 * u, color: C.text, display: "flex", alignItems: "center", gap: 12 * u }}>
        <span style={{ width: 9 * u, height: 9 * u, background: C.accent, display: "inline-block" }} />
        <span style={{ fontVariantNumeric: "tabular-nums" }}>PLT {String(registered).padStart(2, "0")}/12</span>
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
        PLT-0847 REG · 0 PAPEL
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

export const S5Unload: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const z = fkZ(frame);
  const carried = carrying(frame);
  const setDown = frame > 156;
  const bracketOp = interpolate(frame, [158, 168], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // pallet transportado: solidario a las uñas (base del deck = tope de uñas)
  const palletWorldZ = carried ? z - 1.72 : -1.3;
  const palletWorldY = carried ? forkH(frame) + 0.12 - 1.195 : -1.175;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 30, 90]} />
        <CameraRig frame={frame} />
        <GroundGrid size={200} />
        <WarehouseInterior position={[0, 0, 20]} width={26} depth={44} height={8} />
        {/* pared interior de docks con VANO REAL en el 15 (3 segmentos) */}
        {[
          { size: [11.05, 6.4, 0.3] as [number, number, number], pos: [-7.475, 3.2, -0.15] as [number, number, number] },
          { size: [11.05, 6.4, 0.3] as [number, number, number], pos: [7.475, 3.2, -0.15] as [number, number, number] },
          { size: [3.9, 2.2, 0.3] as [number, number, number], pos: [0, 5.3, -0.15] as [number, number, number] },
        ].map((seg, i) => (
          <mesh key={i} position={seg.pos}>
            <boxGeometry args={seg.size} />
            <meshBasicMaterial color="#0A1424" polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
          </mesh>
        ))}
        <DockDoor position={[0, 0, 0.05]} number="15" open={0.88} edgeColor={C.edgeLit} edgeOpacity={0.85} />
        <DockDoor position={[-8.5, 0, 0.05]} number="14" open={0} />
        <DockDoor position={[8.5, 0, 0.05]} number="16" open={0} />
        {/* trailer docked visible a través del vano (piso a nivel por niveladora) */}
        <ParkedTrailer position={[0, -1.175, -7.3]} edgeColor={C.hero} faceColor="#20304F" edgeOpacity={0.9} faceOpacity={0.3} />
        {/* pallets que quedan dentro del trailer */}
        {[-3.4, -5.3].map((pz) => (
          <group key={pz} position={[0.62, -1.175, pz]}>
            <PalletStack x={0} z={0} reveal={1} />
          </group>
        ))}
        {/* pallet objetivo: en la boca del trailer hasta el pickup, luego en las uñas */}
        <group position={[0, palletWorldY, palletWorldZ]}>
          <PalletStack x={0} z={0} reveal={1} />
        </group>
        {/* autoelevador (mástil hacia -z: rotY π) */}
        <Forklift position={[0, 0, z]} rotationY={Math.PI} forkHeight={forkH(frame)} frame={frame} edgeColor={C.hero} />
        {/* staging: pallets ya descargados y registrados */}
        {[[3.6, 6.5], [3.6, 9.2]].map(([sx, sz], i) => (
          <group key={i} position={[sx, -1.175, sz]}>
            <PalletStack x={0} z={0} reveal={1} />
            <CornerBrackets size={[1.5, 1.95, 2.1]} position={[0, 2.05, 0]} opacity={0.3} arm={0.4} />
          </group>
        ))}
        {setDown && (
          <CornerBrackets size={[1.5, 1.95, 2.1]} position={[0, 0.88, palletWorldZ]} opacity={bracketOp} arm={0.4} />
        )}
        {/* racks laterales, fuera del camino de cámara */}
        <Rack position={[-12.8, 0, 5.5]} rotationY={Math.PI / 2} bays={4} levels={3} fill={0.75} seed={5} edgeOpacity={0.5} />
        <Rack position={[12.8, 0, 6.5]} rotationY={Math.PI / 2} bays={4} levels={3} fill={0.65} seed={9} edgeOpacity={0.5} />
        <DataMotes frame={frame} count={45} />
      </ThreeCanvas>
      <Hud frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
