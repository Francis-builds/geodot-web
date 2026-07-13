import React, { useMemo } from "react";
import * as THREE from "three";
import { C } from "./tokens";
import { WireBox } from "./primitives";
import { RBox } from "./rounded";
import { DockBay } from "./Dock";

// ---- Exterior: nave completa con fila de andenes en la cara +z ----
export const WarehouseShell: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  size?: [number, number, number];
  docks?: number;
  firstDock?: number;
  edgeColor?: string;
  edgeOpacity?: number;
}> = ({ position, rotationY = 0, size = [58, 10, 34], docks = 5, firstDock = 12, edgeColor = C.edgeDim, edgeOpacity = 0.7 }) => {
  const [w, h, d] = size;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RBox r={0.5} size={[w, h, d]} position={[0, h / 2, 0]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      {/* monitor de techo (lucernario) */}
      <RBox r={0.3} size={[w * 0.45, 1.5, d * 0.5]} position={[0, h + 0.7, 0]} edgeColor={edgeColor} edgeOpacity={edgeOpacity * 0.8} />
      {/* andenes sobre la cara +z */}
      {Array.from({ length: docks }, (_, i) => {
        const x = (i - (docks - 1) / 2) * 8.5;
        return (
          <DockBay
            key={i}
            position={[x, 0, d / 2 + 0.05]}
            number={String(firstDock + i)}
            open={i === Math.floor(docks / 2) ? 0.85 : 0}
            edgeColor={edgeColor}
            edgeOpacity={edgeOpacity + 0.1}
          />
        );
      })}
    </group>
  );
};

// ---- Interior: piso marcado, columnas, cabreadas (trusses) del techo ----
const trussGeo = (span: number, rise: number) => {
  const p: number[] = [];
  const n = 8;
  // cordón inferior y superior
  p.push(-span / 2, 0, 0, span / 2, 0, 0);
  p.push(-span / 2, rise, 0, span / 2, rise, 0);
  // diagonales zigzag + montantes
  for (let i = 0; i < n; i++) {
    const x0 = -span / 2 + (i * span) / n;
    const x1 = -span / 2 + ((i + 1) * span) / n;
    p.push(x0, 0, 0, x1, rise, 0);
    p.push(x1, rise, 0, x1, 0, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
};

export const WarehouseInterior: React.FC<{
  position?: [number, number, number];
  width?: number; // luz entre columnas (eje x)
  depth?: number; // largo de la nave (eje z)
  height?: number;
  aisles?: boolean;
  edgeColor?: string;
}> = ({ position = [0, 0, 0], width = 30, depth = 60, height = 8.5, aisles = true, edgeColor = C.edgeDim }) => {
  const truss = useMemo(() => trussGeo(width, 1.4), [width]);
  const floorMarks = useMemo(() => {
    const p: number[] = [];
    if (aisles) {
      // pasillo central + cruces
      for (const x of [-2.6, 2.6]) p.push(x, 0.02, -depth / 2, x, 0.02, depth / 2);
      for (let z = -depth / 2 + 6; z < depth / 2; z += 12) {
        for (const zz of [z, z + 0.35]) p.push(-2.6, 0.02, zz, 2.6, 0.02, zz);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, [depth, aisles]);

  return (
    <group position={position}>
      {/* columnas */}
      {Array.from({ length: Math.floor(depth / 12) + 1 }, (_, i) => {
        const z = -depth / 2 + i * 12;
        return (
          <group key={i}>
            <WireBox size={[0.35, height, 0.35]} position={[-width / 2, height / 2, z]} edgeColor={edgeColor} edgeOpacity={0.8} />
            <WireBox size={[0.35, height, 0.35]} position={[width / 2, height / 2, z]} edgeColor={edgeColor} edgeOpacity={0.8} />
            {/* cabreada sobre cada eje de columnas */}
            <lineSegments geometry={truss} position={[0, height, z]}>
              <lineBasicMaterial color={edgeColor} transparent opacity={0.55} />
            </lineSegments>
          </group>
        );
      })}
      {/* correas longitudinales del techo */}
      {[-width / 3, 0, width / 3].map((x) => (
        <WireBox key={x} size={[0.14, 0.14, depth]} position={[x, height + 1.15, 0]} edgeColor={edgeColor} edgeOpacity={0.45} />
      ))}
      {/* marcas de piso */}
      <lineSegments geometry={floorMarks}>
        <lineBasicMaterial color={C.gridMajor} transparent opacity={0.9} />
      </lineSegments>
    </group>
  );
};

// ---- Torre de control del warehouse: oficina vidriada elevada ----
const mullionsGeo = (() => {
  const p: number[] = [];
  const w = 4.6, h = 2.2, d = 3.0;
  // parantes verticales de vidrio en las 4 caras
  for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 5) {
    p.push(x, -h / 2, d / 2, x, h / 2, d / 2);
    p.push(x, -h / 2, -d / 2, x, h / 2, -d / 2);
  }
  for (let z = -d / 2; z <= d / 2 + 0.01; z += d / 3) {
    p.push(-w / 2, -h / 2, z, -w / 2, h / 2, z);
    p.push(w / 2, -h / 2, z, w / 2, h / 2, z);
  }
  // línea de antepecho
  for (const s of [-1, 1]) {
    p.push(-w / 2, -h / 2 + 0.7, s * (d / 2), w / 2, -h / 2 + 0.7, s * (d / 2));
    p.push(s * (w / 2), -h / 2 + 0.7, -d / 2, s * (w / 2), -h / 2 + 0.7, d / 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

export const ControlTower: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  frame?: number;
  edgeColor?: string;
}> = ({ position, rotationY = 0, frame = 0, edgeColor = C.hero }) => {
  const blink = 0.3 + 0.55 * Math.abs(Math.sin(frame / 16));
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* núcleo estructural con puerta + escalera de gato con guardahombre */}
      <RBox r={0.15} faceColor="#0D1830" size={[2.2, 4.6, 2.2]} position={[0, 2.3, 0]} edgeColor={C.edgeDim} edgeOpacity={1} />
      <lineSegments
        geometry={(() => {
          const p: number[] = [];
          // puerta en la base + junta horizontal de paneles
          p.push(-0.5, 0, 1.12, -0.5, 2.1, 1.12, -0.5, 2.1, 1.12, 0.5, 2.1, 1.12, 0.5, 2.1, 1.12, 0.5, 0, 1.12);
          p.push(-1.1, 3.1, 1.12, 1.1, 3.1, 1.12);
          // escalera de gato: 2 largueros + peldaños
          const lx = 1.35;
          p.push(lx, 0.2, 0.35, lx, 4.75, 0.35);
          p.push(lx, 0.2, -0.35, lx, 4.75, -0.35);
          for (let y = 0.5; y <= 4.6; y += 0.38) p.push(lx, y, 0.35, lx, y, -0.35);
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
          return g;
        })()}
      >
        <lineBasicMaterial color={C.edgeDim} transparent opacity={0.85} />
      </lineSegments>
      {/* guardahombre (aros) */}
      {[1.6, 2.5, 3.4, 4.3].map((y) => (
        <mesh key={y} position={[1.35, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.015, 6, 14, Math.PI]} />
          <meshBasicMaterial color={C.edgeDim} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* pasarela con baranda */}
      <WireBox size={[5.4, 0.14, 3.8]} position={[0, 4.62, 0]} edgeColor={C.edgeDim} edgeOpacity={0.8} />
      {[-1, 1].map((s) => (
        <WireBox key={s} size={[5.4, 0.05, 0.05]} position={[0, 5.5, s * 1.85]} edgeColor={C.edgeDim} edgeOpacity={0.6} />
      ))}
      {/* oficina vidriada */}
      <RBox
        r={0.18}
        size={[4.6, 2.2, 3.0]}
        position={[0, 5.85, 0]}
        edgeColor={edgeColor}
        edgeOpacity={1}
        faceColor="#20304F"
        faceOpacity={0.28}
      />
      {/* pantallas del ops room (brillan adentro) */}
      {[-1.2, 0, 1.2].map((x) => (
        <mesh key={x} position={[x, 5.9, -0.5]} renderOrder={2}>
          <planeGeometry args={[0.85, 0.5]} />
          <meshBasicMaterial color={C.accent} transparent opacity={0.4} />
        </mesh>
      ))}
      <lineSegments geometry={mullionsGeo} position={[0, 5.85, 0]}>
        <lineBasicMaterial color={edgeColor} transparent opacity={0.5} />
      </lineSegments>
      {/* mástil + baliza */}
      <WireBox size={[0.07, 1.9, 0.07]} position={[1.7, 7.85, 1.0]} edgeColor={C.edgeDim} edgeOpacity={0.7} />
      <mesh position={[1.7, 8.85, 1.0]}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshBasicMaterial color={C.accent} transparent opacity={blink} />
      </mesh>
    </group>
  );
};
