import React from "react";
import { C } from "./tokens";
import { WireBox } from "./primitives";
import { RBox } from "./rounded";

// Operario estilizado (sin rostro, DS E+F). Origen: piso entre los pies.
// pose "stand": brazos abajo · pose "scan": brazo derecho extendido con lector
export const Worker: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  pose?: "stand" | "scan";
  edgeColor?: string;
  frame?: number; // pulso del lector
}> = ({ position, rotationY = 0, pose = "stand", edgeColor = C.hero, frame = 0 }) => {
  const scanPulse = 0.4 + 0.5 * Math.abs(Math.sin(frame / 8));
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* piernas */}
      <RBox r={0.05} faceColor="#20304F" size={[0.16, 0.78, 0.2]} position={[-0.12, 0.39, 0]} edgeColor={edgeColor} edgeOpacity={0.85} />
      <RBox r={0.05} faceColor="#20304F" size={[0.16, 0.78, 0.2]} position={[0.12, 0.39, 0]} edgeColor={edgeColor} edgeOpacity={0.85} />
      {/* torso (chaleco) + cabeza */}
      <RBox r={0.08} faceColor="#20304F" size={[0.48, 0.62, 0.26]} position={[0, 1.1, 0]} edgeColor={edgeColor} edgeOpacity={1} />
      <RBox r={0.07} faceColor="#20304F" size={[0.24, 0.26, 0.22]} position={[0, 1.58, 0]} edgeColor={edgeColor} edgeOpacity={0.95} />
      {/* brazo izquierdo */}
      <RBox r={0.04} faceColor="#20304F" size={[0.11, 0.55, 0.13]} position={[-0.31, 1.08, 0]} edgeColor={edgeColor} edgeOpacity={0.8} />
      {pose === "stand" ? (
        <RBox r={0.04} faceColor="#20304F" size={[0.11, 0.55, 0.13]} position={[0.31, 1.08, 0]} edgeColor={edgeColor} edgeOpacity={0.8} />
      ) : (
        <group>
          {/* brazo derecho extendido al frente con lector (Zebra-style) */}
          <RBox r={0.04} faceColor="#20304F" size={[0.11, 0.13, 0.5]} position={[0.31, 1.3, 0.28]} edgeColor={edgeColor} edgeOpacity={0.8} />
          <WireBox faceColor="#20304F" size={[0.14, 0.2, 0.12]} position={[0.31, 1.32, 0.58]} edgeColor={edgeColor} edgeOpacity={0.95} />
          {/* pantallita del lector + pulso de escaneo */}
          <mesh position={[0.31, 1.4, 0.56]} rotation={[-0.5, 0, 0]}>
            <planeGeometry args={[0.11, 0.08]} />
            <meshBasicMaterial color={C.accent} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.31, 1.32, 0.78]}>
            <planeGeometry args={[0.03, 0.03]} />
            <meshBasicMaterial color={C.accent} transparent opacity={scanPulse} />
          </mesh>
        </group>
      )}
      {/* casco */}
      <WireBox size={[0.26, 0.08, 0.24]} position={[0, 1.74, 0]} edgeColor={edgeColor} edgeOpacity={0.7} />
    </group>
  );
};
