import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { C, MONO } from "../world/tokens";
import { GroundGrid, DataMotes, WireBox, CornerBrackets } from "../world/primitives";
import { Truck, ParkedTrailer } from "../world/Truck";
import { DockBay } from "../world/Dock";

export const S4_DURATION = 192;

// El camión retrocede hacia DOCK 15 (pared en z=0 mirando +z). El trailer
// queda AFUERA: solo las puertas traseras tocan los bumpers del andén.
// Truck origin = centro del tractor, cola del trailer en -12.12 →
// cola en z=0.55 ⇒ truck z = 12.67.
const truckZ = (frame: number) =>
  interpolate(frame, [0, 168], [24.5, 12.67], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

// checklist: se valida solo a medida que el camión se aproxima
const CHECKS: { at: number; label: string }[] = [
  { at: 36, label: "MFT #88412" },
  { at: 72, label: "SEAL 0451" },
  { at: 104, label: "ETA 14:32" },
  { at: 140, label: "DOCK 15" },
];
const doorOpen = (frame: number) =>
  interpolate(frame, [148, 184], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  if (cam.fov !== 30) {
    cam.fov = 30;
    cam.updateProjectionMatrix();
  }
  const e = interpolate(frame, [0, S4_DURATION - 1], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  // vista cenital 3/4 de yard management (la que Terminal usa para docks)
  camera.position.set(
    interpolate(e, [0, 1], [-5, -2]),
    interpolate(e, [0, 1], [36, 27]),
    interpolate(e, [0, 1], [27, 21]),
  );
  camera.lookAt(0, 0, interpolate(e, [0, 1], [7, 5]));
  return null;
};

const Checklist: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const panelIn = interpolate(frame, [24, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        right: 64 * u,
        top: "50%",
        transform: `translateY(-50%) translateX(${(1 - panelIn) * 20 * u}px)`,
        opacity: panelIn,
        fontFamily: MONO,
        border: `1px solid ${C.accent}44`,
        background: "#080F1FC8",
        padding: `${20 * u}px ${26 * u}px`,
        display: "flex",
        flexDirection: "column",
        gap: 16 * u,
      }}
    >
      {CHECKS.map((c) => {
        const on = interpolate(frame, [c.at, c.at + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 16 * u, fontSize: 18 * u, letterSpacing: "0.2em" }}>
            <span
              style={{
                width: 13 * u,
                height: 13 * u,
                border: `1.5px solid ${on > 0 ? C.accent : C.textDim}`,
                background: on > 0.5 ? C.accent : "transparent",
                display: "inline-block",
              }}
            />
            <span style={{ color: on > 0.5 ? C.text : C.textDim }}>{c.label}</span>
            <span style={{ color: C.accent, opacity: on, marginLeft: "auto" }}>OK</span>
          </div>
        );
      })}
    </div>
  );
};

const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const { height } = useVideoConfig();
  const u = height / 1080;
  const fadeIn = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barIn = interpolate(frame, [168, 182], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chip: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 19 * u,
    letterSpacing: "0.22em",
    color: C.textDim,
    position: "absolute",
  };
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <div style={{ ...chip, top: 44 * u, left: 56 * u }}>DOCK 15 · TRK-114 IN</div>
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
        CHECKS 4/4 · GATE OPEN
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

export const S4Dock: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tz = truckZ(frame);
  const wheelSpin = -(24.5 - tz) / 0.5; // retrocede: giro negativo
  const docked = interpolate(frame, [162, 172], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <fog attach="fog" args={[C.bg, 45, 130]} />
        <CameraRig frame={frame} />
        <GroundGrid />
        {/* frente del depósito con 3 andenes; el 15 es el nuestro */}
        <WireBox faceColor="#0B1526" size={[30, 6.4, 0.6]} position={[0, 3.2, -0.35]} edgeColor={C.edgeDim} edgeOpacity={0.75} />
        <DockBay position={[-8.5, 0, 0]} number="14" open={0} groundNumber />
        <DockBay position={[0, 0, 0]} number="15" open={doorOpen(frame)} groundNumber edgeColor={C.edgeLit} edgeOpacity={0.85} />
        <DockBay position={[8.5, 0, 0]} number="16" open={0} groundNumber />
        {/* trailers ya estacionados en los docks vecinos */}
        <ParkedTrailer position={[-8.5, 0, 6.65]} edgeColor={C.edgeDim} faceColor={C.face} edgeOpacity={0.75} />
        <ParkedTrailer position={[8.5, 0, 6.65]} edgeColor={C.edgeDim} faceColor={C.face} edgeOpacity={0.75} />
        {/* camión retrocediendo (nariz hacia +z, cola al dock) */}
        <Truck position={[0, 0, tz]} wheelSpin={wheelSpin} />
        {docked > 0.01 && (
          <CornerBrackets size={[3.2, 4.4, 13.2]} position={[0, 2.2, tz - 6]} opacity={docked * 0.85} arm={1.0} />
        )}
        <DataMotes frame={frame} count={55} />
      </ThreeCanvas>
      <Checklist frame={frame} />
      <Hud frame={frame} />
      <Vignette />
    </AbsoluteFill>
  );
};
