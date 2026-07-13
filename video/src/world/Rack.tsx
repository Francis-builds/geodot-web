import React from "react";
import * as THREE from "three";
import { C } from "./tokens";
import { WireBox } from "./primitives";
import { hash2 } from "./hash";
import { PalletStack } from "./Truck";

// Rack selectivo paramétrico: parantes con arriostramiento, vigas por nivel,
// pallets según densidad de ocupación (determinística por seed).
const BAY_W = 2.9;
const LEVEL_H = 1.9;
const DEPTH = 1.3;

// arriostramiento de un parante (zigzag entre poste frontal y trasero)
const braceGeo = (H: number) => {
  const p: number[] = [];
  const steps = Math.max(2, Math.round(H / 1.1));
  for (let i = 0; i < steps; i++) {
    const y0 = 0.25 + (i * (H - 0.5)) / steps;
    const y1 = 0.25 + ((i + 1) * (H - 0.5)) / steps;
    const zA = i % 2 === 0 ? DEPTH / 2 : -DEPTH / 2;
    const zB = i % 2 === 0 ? -DEPTH / 2 : DEPTH / 2;
    p.push(0, y0, zA, 0, y1, zB);
    p.push(0, y0, zA, 0, y0, zB); // horizontal
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
};

const braceCache = new Map<number, THREE.BufferGeometry>();
const getBrace = (H: number) => {
  const k = Math.round(H * 100);
  let g = braceCache.get(k);
  if (!g) {
    g = braceGeo(H);
    braceCache.set(k, g);
  }
  return g;
};

export const RACK_BAY_W = BAY_W;
export const RACK_LEVEL_H = LEVEL_H;

export const Rack: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  bays?: number;
  levels?: number; // niveles de viga (piso no cuenta)
  fill?: number; // 0..1 densidad de ocupación
  seed?: number;
  edgeColor?: string;
  edgeOpacity?: number;
  palletReveal?: (bay: number, level: number) => number; // override por escena
}> = ({
  position,
  rotationY = 0,
  bays = 4,
  levels = 3,
  fill = 0.72,
  seed = 1,
  edgeColor = C.edgeLit,
  edgeOpacity = 0.8,
  palletReveal,
}) => {
  const H = levels * LEVEL_H + 0.6;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* parantes */}
      {Array.from({ length: bays + 1 }, (_, i) => {
        const x = i * BAY_W - (bays * BAY_W) / 2;
        return (
          <group key={i} position={[x, 0, 0]}>
            <WireBox size={[0.1, H, 0.1]} position={[0, H / 2, DEPTH / 2]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
            <WireBox size={[0.1, H, 0.1]} position={[0, H / 2, -DEPTH / 2]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
            <lineSegments geometry={getBrace(H)}>
              <lineBasicMaterial color={edgeColor} transparent opacity={edgeOpacity * 0.5} />
            </lineSegments>
          </group>
        );
      })}
      {/* vigas por nivel (frontal y trasera) */}
      {Array.from({ length: levels }, (_, k) =>
        Array.from({ length: bays }, (_, b) => {
          const x = b * BAY_W - (bays * BAY_W) / 2 + BAY_W / 2;
          const y = (k + 1) * LEVEL_H;
          return (
            <group key={`${k}-${b}`} position={[x, y, 0]}>
              <WireBox size={[BAY_W - 0.14, 0.12, 0.06]} position={[0, 0, DEPTH / 2]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
              <WireBox size={[BAY_W - 0.14, 0.12, 0.06]} position={[0, 0, -DEPTH / 2]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
            </group>
          );
        }),
      )}
      {/* pallets: piso (nivel 0) + niveles de viga */}
      {Array.from({ length: levels + 1 }, (_, k) =>
        Array.from({ length: bays }, (_, b) =>
          [-0.68, 0.68].map((dx, di) => {
            const occupied = hash2(seed + b * 7 + di * 3, k * 13) < fill;
            const reveal = palletReveal ? palletReveal(b, k) : occupied ? 1 : 0;
            if (reveal <= 0.01) return null;
            const x = b * BAY_W - (bays * BAY_W) / 2 + BAY_W / 2 + dx;
            const floorY = k === 0 ? 0.0 : k * LEVEL_H + 0.06;
            return (
              <group key={`${k}-${b}-${di}`} position={[x, floorY - 1.175 - 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
                <PalletStack x={0} z={0} reveal={reveal} />
              </group>
            );
          }),
        ),
      )}
    </group>
  );
};
