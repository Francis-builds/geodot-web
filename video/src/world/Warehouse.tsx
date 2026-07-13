import React, { useMemo } from "react";
import * as THREE from "three";
import { C } from "./tokens";
import { WireBox } from "./primitives";
import { Figure } from "./Figure";
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

// ---- Torre de control = oficina de operaciones en MEZZANINE ----
// Segundo nivel sobre estructura de acero, vidriada hacia el piso (+z),
// con escritorio corrido, monitores encendidos y gente mirándolos.
const DECK_Y = 4.0; // cota del entrepiso
const OFFICE_C = DECK_Y + 1.45; // centro del volumen vidriado

const mullionsGeo = (() => {
  const p: number[] = [];
  const w = 6.4, h = 2.5, d = 3.2;
  // parantes de vidrio: frente (hacia el piso), laterales
  for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 6) {
    p.push(x, -h / 2, d / 2, x, h / 2, d / 2);
  }
  for (let z = -d / 2; z <= d / 2 + 0.01; z += d / 3) {
    p.push(-w / 2, -h / 2, z, -w / 2, h / 2, z);
    p.push(w / 2, -h / 2, z, w / 2, h / 2, z);
  }
  // antepecho perimetral
  for (const s of [-1, 1]) {
    p.push(-w / 2, -h / 2 + 0.75, s * (d / 2), w / 2, -h / 2 + 0.75, s * (d / 2));
    p.push(s * (w / 2), -h / 2 + 0.75, -d / 2, s * (w / 2), -h / 2 + 0.75, d / 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

// operador sentado en su puesto, de cara al piso y a sus monitores
const DECK_TOP = DECK_Y + 0.32;
const SeatedOp: React.FC<{ x: number; edgeColor: string }> = ({ x, edgeColor }) => (
  <group position={[x, 0, 0]}>
    {/* silla (asiento a ~0.45 del entrepiso, como corresponde) */}
    <WireBox faceColor="#0D1830" size={[0.42, 0.06, 0.42]} position={[0, DECK_TOP + 0.43, -0.35]} edgeColor={C.edgeDim} edgeOpacity={0.6} />
    <WireBox faceColor="#0D1830" size={[0.42, 0.5, 0.06]} position={[0, DECK_TOP + 0.72, -0.56]} edgeColor={C.edgeDim} edgeOpacity={0.6} />
    <WireBox faceColor="#0D1830" size={[0.07, 0.43, 0.07]} position={[0, DECK_TOP + 0.21, -0.35]} edgeColor={C.edgeDim} edgeOpacity={0.5} />
    <Figure pose="sit" position={[0, DECK_TOP + 0.46, -0.35]} edgeColor={edgeColor} />
  </group>
);

export const ControlTower: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  frame?: number;
  edgeColor?: string;
}> = ({ position, rotationY = 0, frame = 0, edgeColor = C.hero }) => {
  const blink = 0.3 + 0.55 * Math.abs(Math.sin(frame / 16));
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* estructura del mezzanine: columnas + vigas de borde + plataforma */}
      {([[-3.2, -1.5], [3.2, -1.5], [-3.2, 1.5], [3.2, 1.5]] as const).map(([x, z]) => (
        <WireBox key={`${x}${z}`} faceColor="#0D1830" size={[0.28, DECK_Y, 0.28]} position={[x, DECK_Y / 2, z]} edgeColor={C.edgeDim} edgeOpacity={0.9} />
      ))}
      <WireBox faceColor="#0D1830" size={[7.0, 0.32, 3.9]} position={[0, DECK_Y + 0.16, 0]} edgeColor={C.edgeDim} edgeOpacity={1} />
      {[-1, 1].map((s) => (
        <WireBox key={s} faceColor="#0D1830" size={[7.0, 0.22, 0.1]} position={[0, DECK_Y - 0.12, s * 1.9]} edgeColor={C.edgeDim} edgeOpacity={0.7} />
      ))}
      {/* escalera recta con descanso: baja hacia +z por el lado derecho */}
      {Array.from({ length: 10 }, (_, i) => (
        <WireBox
          key={i}
          faceColor="#0D1830"
          size={[1.0, 0.05, 0.3]}
          position={[3.95, DECK_Y - 0.35 - i * 0.38, 2.15 + i * 0.34]}
          edgeColor={C.edgeDim}
          edgeOpacity={0.7}
        />
      ))}
      {/* zancas + baranda de la escalera */}
      <lineSegments
        geometry={(() => {
          const p: number[] = [];
          for (const dx of [-0.5, 0.5]) {
            p.push(3.95 + dx, DECK_Y - 0.2, 2.0, 3.95 + dx, DECK_Y - 0.35 - 9 * 0.38 - 0.15, 2.15 + 9 * 0.34 + 0.2);
            p.push(3.95 + dx, DECK_Y + 0.75, 2.0, 3.95 + dx, DECK_Y - 9 * 0.38 + 0.6, 2.15 + 9 * 0.34 + 0.2);
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
          return g;
        })()}
      >
        <lineBasicMaterial color={C.edgeDim} transparent opacity={0.75} />
      </lineSegments>
      {/* baranda del balcón frente al vidrio */}
      {[0.4, 0.85].map((dy) => (
        <WireBox key={dy} size={[7.0, 0.04, 0.04]} position={[0, DECK_Y + dy, 1.85]} edgeColor={C.edgeDim} edgeOpacity={0.65} />
      ))}
      {[-3.2, -1.6, 0, 1.6, 3.2].map((x) => (
        <WireBox key={x} size={[0.05, 0.85, 0.05]} position={[x, DECK_Y + 0.45, 1.85]} edgeColor={C.edgeDim} edgeOpacity={0.6} />
      ))}
      {/* oficina vidriada sobre el mezzanine */}
      <RBox
        r={0.16}
        size={[6.4, 2.5, 3.2]}
        position={[0, OFFICE_C, -0.2]}
        edgeColor={edgeColor}
        edgeOpacity={1}
        faceColor="#20304F"
        faceOpacity={0.24}
      />
      <lineSegments geometry={mullionsGeo} position={[0, OFFICE_C, -0.2]}>
        <lineBasicMaterial color={edgeColor} transparent opacity={0.5} />
      </lineSegments>
      {/* escritorio corrido contra el vidrio + panel frontal */}
      <WireBox faceColor="#0D1830" size={[5.4, 0.07, 0.75]} position={[0, DECK_Y + 1.06, 0.55]} edgeColor={C.edgeDim} edgeOpacity={0.8} />
      <WireBox faceColor="#0D1830" size={[5.4, 0.7, 0.06]} position={[0, DECK_Y + 0.72, 0.9]} edgeColor={C.edgeDim} edgeOpacity={0.6} />
      {/* monitores encendidos (visibles de ambos lados, estilización asumida) */}
      {[-1.9, -0.65, 0.65, 1.9].map((x) => (
        <mesh key={x} position={[x, DECK_Y + 1.42, 0.72]} rotation={[-0.12, 0, 0]} renderOrder={3}>
          <planeGeometry args={[0.8, 0.48]} />
          <meshBasicMaterial color={C.accent} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {/* pantalla mural al fondo del ops room */}
      <mesh position={[0, DECK_Y + 1.7, -1.7]} renderOrder={3}>
        <planeGeometry args={[2.6, 1.0]} />
        <meshBasicMaterial color={C.accent} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* tres operadores sentados mirando pantallas y piso */}
      <SeatedOp x={-1.7} edgeColor={edgeColor} />
      <SeatedOp x={0} edgeColor={edgeColor} />
      <SeatedOp x={1.7} edgeColor={edgeColor} />
      {/* AP / baliza de estado en el techo de la oficina */}
      <mesh position={[2.6, OFFICE_C + 1.4, -0.2]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshBasicMaterial color={C.accent} transparent opacity={blink} />
      </mesh>
    </group>
  );
};
