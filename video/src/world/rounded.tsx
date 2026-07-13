import React from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { C } from "./tokens";

// Wireframe de caja redondeada dibujado a mano: 12 aristas acortadas + 24
// arcos de esquina. Se lee como plano CAD/render de producto, no como el
// EdgesGeometry "debug" de three.
const pushArc = (
  pts: number[],
  center: [number, number, number],
  dirA: [number, number, number],
  dirB: [number, number, number],
  r: number,
  n: number,
) => {
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * (Math.PI / 2);
    const t1 = ((i + 1) / n) * (Math.PI / 2);
    pts.push(
      center[0] + r * (Math.cos(t0) * dirA[0] + Math.sin(t0) * dirB[0]),
      center[1] + r * (Math.cos(t0) * dirA[1] + Math.sin(t0) * dirB[1]),
      center[2] + r * (Math.cos(t0) * dirA[2] + Math.sin(t0) * dirB[2]),
      center[0] + r * (Math.cos(t1) * dirA[0] + Math.sin(t1) * dirB[0]),
      center[1] + r * (Math.cos(t1) * dirA[1] + Math.sin(t1) * dirB[1]),
      center[2] + r * (Math.cos(t1) * dirA[2] + Math.sin(t1) * dirB[2]),
    );
  }
};

const buildRoundedWire = (w: number, h: number, d: number, r: number, arcSegs = 3): THREE.BufferGeometry => {
  const pts: number[] = [];
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const seg = (a: number[], b: number[]) => pts.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) seg([-hw + r, sy * hh, sz * hd], [hw - r, sy * hh, sz * hd]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) seg([sx * hw, -hh + r, sz * hd], [sx * hw, hh - r, sz * hd]);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) seg([sx * hw, sy * hh, -hd + r], [sx * hw, sy * hh, hd - r]);
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const cx = sx * (hw - r), cy = sy * (hh - r), cz = sz * (hd - r);
        pushArc(pts, [cx, cy, sz * hd], [sx, 0, 0], [0, sy, 0], r, arcSegs);
        pushArc(pts, [cx, sy * hh, cz], [sx, 0, 0], [0, 0, sz], r, arcSegs);
        pushArc(pts, [sx * hw, cy, cz], [0, sy, 0], [0, 0, sz], r, arcSegs);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
};

// Cache: muchas instancias comparten tamaño (containers, pallets)
const wireCache = new Map<string, THREE.BufferGeometry>();
const solidCache = new Map<string, THREE.BufferGeometry>();

export const roundedWire = (w: number, h: number, d: number, r: number): THREE.BufferGeometry => {
  const k = `${w}|${h}|${d}|${r}`;
  let g = wireCache.get(k);
  if (!g) {
    g = buildRoundedWire(w, h, d, r);
    wireCache.set(k, g);
  }
  return g;
};

export const roundedSolid = (w: number, h: number, d: number, r: number): THREE.BufferGeometry => {
  const k = `${w}|${h}|${d}|${r}`;
  let g = solidCache.get(k);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, 2, r);
    solidCache.set(k, g);
  }
  return g;
};

// Caja redondeada con caras sólidas + wireframe CAD. API compatible con WireBox.
export const RBox: React.FC<{
  size: [number, number, number];
  position: [number, number, number];
  r?: number;
  rotationY?: number;
  edgeColor?: string;
  edgeOpacity?: number;
  faceColor?: string;
  faceOpacity?: number;
  renderOrder?: number;
}> = ({
  size,
  position,
  r = 0.12,
  rotationY = 0,
  edgeColor = C.edgeLit,
  edgeOpacity = 0.9,
  faceColor = C.face,
  faceOpacity = 1,
  renderOrder = 0,
}) => {
  const radius = Math.min(r, size[0] / 2.5, size[1] / 2.5, size[2] / 2.5);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={roundedSolid(size[0], size[1], size[2], radius)} renderOrder={renderOrder}>
        <meshBasicMaterial
          color={faceColor}
          transparent={faceOpacity < 1}
          opacity={faceOpacity}
          depthWrite={faceOpacity >= 1}
          polygonOffset
          polygonOffsetFactor={2}
          polygonOffsetUnits={2}
        />
      </mesh>
      <lineSegments geometry={roundedWire(size[0], size[1], size[2], radius)} renderOrder={renderOrder && renderOrder + 1}>
        <lineBasicMaterial color={edgeColor} transparent opacity={edgeOpacity} depthWrite={false} />
      </lineSegments>
    </group>
  );
};
