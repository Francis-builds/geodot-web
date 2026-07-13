import React from "react";
import * as THREE from "three";
import { roundedSolid, roundedWire } from "./rounded";

// Container 40ft con detalle: panel inset, corrugado (ribs), puertas traseras.
// Geometrías a nivel módulo: se comparten entre las ~150 instancias del yard.
const W = 2.6, H = 2.7, L = 12.4;
export const CONT_SIZE: [number, number, number] = [W, H, L];

// chaflán sutil: los containers SON cajas, pero sin aristas de debug
const bodyGeo = roundedSolid(W, H, L, 0.09);
const edgeGeo = roundedWire(W, H, L, 0.09);

const detailGeo = (() => {
  const p: number[] = [];
  const x = W / 2 + 0.02;
  const y0 = -H / 2 + 0.22, y1 = H / 2 - 0.22;
  const z0 = -L / 2 + 0.35, z1 = L / 2 - 0.35;
  for (const s of [-1, 1]) {
    // marco del panel lateral
    p.push(s * x, y0, z0, s * x, y1, z0);
    p.push(s * x, y1, z0, s * x, y1, z1);
    p.push(s * x, y1, z1, s * x, y0, z1);
    p.push(s * x, y0, z1, s * x, y0, z0);
    // corrugado vertical
    const ribs = 9;
    for (let i = 1; i <= ribs; i++) {
      const z = z0 + ((z1 - z0) * i) / (ribs + 1);
      p.push(s * x, y0, z, s * x, y1, z);
    }
  }
  // puertas (cara +z): división central, barras de cierre y manijas
  const zd = L / 2 + 0.02;
  const yD0 = -H / 2 + 0.12, yD1 = H / 2 - 0.12;
  p.push(0, yD0, zd, 0, yD1, zd);
  for (const dx of [-0.5, 0.5]) {
    p.push(dx, yD0, zd, dx, yD1, zd);
    p.push(dx - 0.2, 0.05, zd, dx + 0.2, 0.05, zd);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

export const Container: React.FC<{
  position: [number, number, number];
  edgeColor: string;
  faceColor: string;
  edgeOpacity: number;
}> = ({ position, edgeColor, faceColor, edgeOpacity }) => (
  <group position={position}>
    <mesh geometry={bodyGeo}>
      <meshBasicMaterial color={faceColor} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
    </mesh>
    <lineSegments geometry={edgeGeo}>
      <lineBasicMaterial color={edgeColor} transparent opacity={edgeOpacity} />
    </lineSegments>
    <lineSegments geometry={detailGeo}>
      <lineBasicMaterial color={edgeColor} transparent opacity={edgeOpacity * 0.4} />
    </lineSegments>
  </group>
);
