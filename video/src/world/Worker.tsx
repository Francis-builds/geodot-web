import React from "react";
import { C } from "./tokens";
import { WireBox } from "./primitives";
import { Figure } from "./Figure";

// Operario de piso: figura articulada con casco y chaleco.
// pose "scan": lector tipo Zebra en la mano derecha con pulso de escaneo.
export const Worker: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  pose?: "stand" | "scan";
  edgeColor?: string;
  frame?: number; // pulso del lector
}> = ({ position, rotationY = 0, pose = "stand", edgeColor = C.hero, frame = 0 }) => {
  const scanPulse = 0.4 + 0.5 * Math.abs(Math.sin(frame / 8));
  const scanner =
    pose === "scan" ? (
      <group rotation={[1.2, 0, 0]}>
        <WireBox faceColor="#173A46" size={[0.09, 0.16, 0.07]} position={[0, 0.02, 0]} edgeColor={edgeColor} edgeOpacity={0.9} />
        <mesh position={[0, 0.09, 0.045]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[0.08, 0.06]} />
          <meshBasicMaterial color={C.accent} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.13, 0.1]}>
          <planeGeometry args={[0.025, 0.025]} />
          <meshBasicMaterial color={C.accent} transparent opacity={scanPulse} />
        </mesh>
      </group>
    ) : undefined;

  return <Figure position={position} rotationY={rotationY} pose={pose} helmet edgeColor={edgeColor} rightHand={scanner} />;
};
