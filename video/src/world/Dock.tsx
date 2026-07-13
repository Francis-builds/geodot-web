import React, { useMemo } from "react";
import * as THREE from "three";
import { C } from "./tokens";
import { WireBox } from "./primitives";
import { numberSegments, numberWidth } from "./digits";

// Número pintado (7 segmentos) sobre un plano: pared (vertical) o piso.
export const PaintedNumber: React.FC<{
  text: string;
  position: [number, number, number];
  size?: number;
  plane?: "wall" | "floor"; // wall: XY mirando +z · floor: XZ mirando arriba
  rotationY?: number;
  color?: string;
  opacity?: number;
}> = ({ text, position, size = 0.5, plane = "wall", rotationY = 0, color = C.edgeLit, opacity = 0.85 }) => {
  const geo = useMemo(() => {
    const segs = numberSegments(text, size);
    const w = numberWidth(text, size);
    const p: number[] = [];
    for (let i = 0; i < segs.length; i += 4) {
      const [x1, y1, x2, y2] = [segs[i] - w / 2, segs[i + 1], segs[i + 2] - w / 2, segs[i + 3]];
      if (plane === "wall") p.push(x1, y1, 0, x2, y2, 0);
      else p.push(x1, 0, -y1, x2, 0, -y2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, [text, size, plane]);
  return (
    <lineSegments geometry={geo} position={position} rotation={[0, rotationY, 0]}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
};

// Cortina roll-up: listones horizontales; open 0 (cerrada) .. 1 (abierta)
const slatGeo = (w: number, h: number, open: number) => {
  const p: number[] = [];
  const bottom = h * open;
  for (let y = bottom; y <= h - 0.05; y += 0.38) {
    p.push(-w / 2, y, 0, w / 2, y, 0);
  }
  // guías laterales
  p.push(-w / 2, 0, 0, -w / 2, h, 0);
  p.push(w / 2, 0, 0, w / 2, h, 0);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
};

// Puerta de dock con marco, cortina y número pintado arriba.
// Origen: centro del vano a nivel de piso; la cara mira hacia +z.
export const DockDoor: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  number?: string;
  open?: number;
  width?: number;
  height?: number;
  edgeColor?: string;
  edgeOpacity?: number;
}> = ({ position, rotationY = 0, number, open = 0, width = 3.4, height = 3.9, edgeColor = C.edgeDim, edgeOpacity = 0.8 }) => {
  const slats = useMemo(() => slatGeo(width, height, open), [width, height, open]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* marco */}
      <WireBox size={[0.22, height + 0.3, 0.25]} position={[-width / 2 - 0.15, (height + 0.3) / 2, 0]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      <WireBox size={[0.22, height + 0.3, 0.25]} position={[width / 2 + 0.15, (height + 0.3) / 2, 0]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      <WireBox size={[width + 0.55, 0.3, 0.25]} position={[0, height + 0.32, 0]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      {/* cortina */}
      <lineSegments geometry={slats}>
        <lineBasicMaterial color={edgeColor} transparent opacity={edgeOpacity * 0.65} />
      </lineSegments>
      {open > 0.02 && (
        <WireBox size={[width, 0.16, 0.1]} position={[0, height * open, 0]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      )}
      {number && <PaintedNumber text={number} position={[0, height + 0.75, 0.05]} size={0.55} color={C.edgeLit} opacity={0.9} />}
    </group>
  );
};

// Andén exterior completo: puerta + bumpers + niveladora + guías pintadas.
export const DockBay: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  number?: string;
  open?: number;
  groundNumber?: boolean; // número también pintado en el asfalto (vistas cenitales)
  edgeColor?: string;
  edgeOpacity?: number;
}> = ({ position, rotationY = 0, number, open = 0, groundNumber = false, edgeColor = C.edgeDim, edgeOpacity = 0.8 }) => {
  const guides = useMemo(() => {
    const p: number[] = [];
    // guías de posicionamiento del trailer sobre el asfalto
    for (const x of [-1.75, 1.75]) p.push(x, 0.02, 0.6, x, 0.02, 14);
    // línea central discontinua
    for (let z = 1.2; z < 14; z += 2.2) p.push(0, 0.02, z, 0, 0.02, z + 1.1);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <DockDoor position={[0, 1.2, 0]} number={number} open={open} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      {/* plataforma del andén (a altura de trailer) + niveladora */}
      <WireBox size={[4.4, 1.2, 0.5]} position={[0, 0.6, 0.15]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      <WireBox size={[2.4, 0.12, 0.9]} position={[0, 1.24, 0.5]} edgeColor={edgeColor} edgeOpacity={edgeOpacity * 0.9} />
      {/* bumpers */}
      <WireBox size={[0.3, 0.4, 0.18]} position={[-1.55, 1.0, 0.48]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      <WireBox size={[0.3, 0.4, 0.18]} position={[1.55, 1.0, 0.48]} edgeColor={edgeColor} edgeOpacity={edgeOpacity} />
      {/* guías pintadas */}
      <lineSegments geometry={guides}>
        <lineBasicMaterial color={C.gridMajor} transparent opacity={0.9} />
      </lineSegments>
      {number && groundNumber && (
        <PaintedNumber text={number} position={[0, 0.03, 16.4]} size={1.05} plane="floor" color={C.edgeLit} opacity={0.75} />
      )}
    </group>
  );
};
