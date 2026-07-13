import React from "react";
import * as THREE from "three";
import { C } from "./tokens";
import { RBox } from "./rounded";

// Figura humana estilizada (sin rostro, DS E+F) con proporciones reales y
// articulaciones posadas: cápsulas para extremidades, wireframe de contorno
// limpio (4 meridianos + anillos), chaleco en dos tonos, casco opcional.
// Poses: stand · scan (brazo derecho extendido con lector) · sit.

const CLOTH = "#1C2B49";
const VEST = "#2E4266";
const SKIN = "#22334F";

const solidCache = new Map<string, THREE.BufferGeometry>();
const wireCache = new Map<string, THREE.BufferGeometry>();

const capSolid = (r: number, len: number) => {
  const k = `${r}|${len}`;
  let g = solidCache.get(k);
  if (!g) {
    g = new THREE.CapsuleGeometry(r, len, 4, 12);
    solidCache.set(k, g);
  }
  return g;
};

// contorno de cápsula: 4 meridianos (arco-recta-arco) + anillos en las juntas
const capWire = (r: number, len: number) => {
  const k = `${r}|${len}`;
  let g = wireCache.get(k);
  if (g) return g;
  const p: number[] = [];
  const h = len / 2;
  for (const phi of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    const cx = Math.cos(phi), sz = Math.sin(phi);
    const arc = (yBase: number, from: number, to: number, n: number) => {
      for (let i = 0; i < n; i++) {
        const t0 = from + ((to - from) * i) / n;
        const t1 = from + ((to - from) * (i + 1)) / n;
        p.push(
          r * Math.cos(t0) * cx, yBase + r * Math.sin(t0), r * Math.cos(t0) * sz,
          r * Math.cos(t1) * cx, yBase + r * Math.sin(t1), r * Math.cos(t1) * sz,
        );
      }
    };
    arc(-h, -Math.PI / 2, 0, 4); // casquete inferior
    p.push(r * cx, -h, r * sz, r * cx, h, r * sz); // lateral
    arc(h, 0, Math.PI / 2, 4); // casquete superior
  }
  for (const y of [-h, h]) {
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      p.push(r * Math.cos(a0), y, r * Math.sin(a0), r * Math.cos(a1), y, r * Math.sin(a1));
    }
  }
  g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  wireCache.set(k, g);
  return g;
};

const Part: React.FC<{
  r: number;
  len: number;
  position: [number, number, number];
  fill?: string;
  edgeColor?: string;
  edgeOpacity?: number;
}> = ({ r, len, position, fill = CLOTH, edgeColor = C.hero, edgeOpacity = 0.45 }) => (
  <group position={position}>
    <mesh geometry={capSolid(r, len)}>
      <meshBasicMaterial color={fill} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
    </mesh>
    <lineSegments geometry={capWire(r, len)}>
      <lineBasicMaterial color={edgeColor} transparent opacity={edgeOpacity} />
    </lineSegments>
  </group>
);

type Pose = "stand" | "scan" | "sit";

const ARM_POSES: Record<Pose, { r: [number, number, number]; l: [number, number, number] }> = {
  // [shoulderPitch, shoulderRoll, elbowPitch] — pitch negativo = al frente
  stand: { r: [0.06, 0.1, -0.14], l: [0.06, 0.1, -0.14] },
  scan: { r: [-1.15, 0.04, -0.35], l: [0.06, 0.1, -0.14] },
  sit: { r: [-0.72, 0.06, -1.05], l: [-0.72, 0.06, -1.05] },
};

const Arm: React.FC<{
  side: 1 | -1;
  yShoulder: number;
  pose: [number, number, number];
  edgeColor: string;
  hand?: React.ReactNode;
}> = ({ side, yShoulder, pose, edgeColor, hand }) => (
  <group position={[side * 0.215, yShoulder, 0]} rotation={[pose[0], 0, side * pose[1]]}>
    <Part r={0.047} len={0.2} position={[0, -0.15, 0]} fill={VEST} edgeColor={edgeColor} />
    <group position={[0, -0.31, 0]} rotation={[pose[2], 0, 0]}>
      <Part r={0.04} len={0.18} position={[0, -0.13, 0]} fill={SKIN} edgeColor={edgeColor} />
      <RBox r={0.028} size={[0.07, 0.1, 0.07]} position={[0, -0.29, 0]} faceColor={SKIN} edgeColor={edgeColor} edgeOpacity={0.45} />
      {hand && <group position={[0, -0.31, 0.03]}>{hand}</group>}
    </group>
  </group>
);

const Leg: React.FC<{
  side: 1 | -1;
  yHip: number;
  seated: boolean;
  edgeColor: string;
}> = ({ side, yHip, seated, edgeColor }) => (
  <group position={[side * 0.09, yHip, 0]} rotation={[seated ? -Math.PI / 2 : 0, 0, side * 0.03]}>
    <Part r={0.065} len={0.26} position={[0, -0.2, 0]} edgeColor={edgeColor} />
    <group position={[0, -0.43, 0]} rotation={[seated ? Math.PI / 2 : 0, 0, 0]}>
      <Part r={0.052} len={0.26} position={[0, -0.19, 0]} edgeColor={edgeColor} />
      <RBox
        r={0.025}
        size={[0.1, 0.06, 0.25]}
        position={[0, -0.41, 0.06]}
        faceColor={CLOTH}
        edgeColor={edgeColor}
        edgeOpacity={0.45}
      />
    </group>
  </group>
);

export const Figure: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  pose?: Pose;
  helmet?: boolean;
  edgeColor?: string;
  rightHand?: React.ReactNode; // objeto en la mano derecha (lector, tablet)
}> = ({ position, rotationY = 0, pose = "stand", helmet = false, edgeColor = C.hero, rightHand }) => {
  const seated = pose === "sit";
  // stand/scan: origen en el piso (pelvis a 0.95) · sit: origen EN el asiento
  const yP = seated ? 0.04 : 0.95;
  const arms = ARM_POSES[pose];
  const lean = pose === "scan" ? -0.06 : seated ? -0.1 : 0;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Leg side={1} yHip={yP - 0.05} seated={seated} edgeColor={edgeColor} />
      <Leg side={-1} yHip={yP - 0.05} seated={seated} edgeColor={edgeColor} />
      {/* tronco: pivotea en la pelvis (leve inclinación según pose) */}
      <group position={[0, yP, 0]} rotation={[lean, 0, 0]}>
        <RBox r={0.055} size={[0.28, 0.17, 0.18]} position={[0, 0, 0]} faceColor={CLOTH} edgeColor={edgeColor} edgeOpacity={0.5} />
        <RBox r={0.1} size={[0.36, 0.46, 0.21]} position={[0, 0.36, 0]} faceColor={VEST} edgeColor={edgeColor} edgeOpacity={0.6} />
        {/* franjas del chaleco */}
        <lineSegments
          geometry={(() => {
            const g = new THREE.BufferGeometry();
            g.setAttribute(
              "position",
              new THREE.Float32BufferAttribute(
                [-0.1, 0.16, 0.115, -0.1, 0.56, 0.115, 0.1, 0.16, 0.115, 0.1, 0.56, 0.115],
                3,
              ),
            );
            return g;
          })()}
        >
          <lineBasicMaterial color={C.edgeLit} transparent opacity={0.55} />
        </lineSegments>
        <Part r={0.038} len={0.05} position={[0, 0.63, 0]} fill={SKIN} edgeColor={edgeColor} />
        <RBox r={0.075} size={[0.17, 0.22, 0.19]} position={[0, 0.79, 0]} faceColor={SKIN} edgeColor={edgeColor} edgeOpacity={0.5} />
        {helmet && (
          <>
            <RBox r={0.032} size={[0.2, 0.08, 0.21]} position={[0, 0.925, 0]} faceColor="#173A46" edgeColor={C.edgeLit} edgeOpacity={0.7} />
            <RBox r={0.015} size={[0.19, 0.025, 0.09]} position={[0, 0.9, 0.13]} faceColor="#173A46" edgeColor={C.edgeLit} edgeOpacity={0.6} />
          </>
        )}
        <Arm side={1} yShoulder={0.51} pose={arms.r} edgeColor={edgeColor} hand={rightHand} />
        <Arm side={-1} yShoulder={0.51} pose={arms.l} edgeColor={edgeColor} />
      </group>
    </group>
  );
};
