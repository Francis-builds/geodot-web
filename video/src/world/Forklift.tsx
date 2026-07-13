import React from "react";
import * as THREE from "three";
import { C } from "./tokens";
import { WireBox } from "./primitives";
import { RBox } from "./rounded";
import { PalletStack } from "./Truck";
import { Figure } from "./Figure";

// ---- ruedas chicas de autoelevador ----
const fkTireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.24, 14);
const fkTireEdges = new THREE.EdgesGeometry(fkTireGeo, 25);
const fkHubGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.26, 8);
const fkHubEdges = new THREE.EdgesGeometry(fkHubGeo, 5);

const FkWheel: React.FC<{ position: [number, number, number]; edgeColor: string }> = ({ position, edgeColor }) => (
  <group position={position} rotation={[0, 0, Math.PI / 2]}>
    <mesh geometry={fkTireGeo}>
      <meshBasicMaterial color={C.face} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
    </mesh>
    <lineSegments geometry={fkTireEdges}>
      <lineBasicMaterial color={edgeColor} transparent opacity={0.75} />
    </lineSegments>
    <mesh geometry={fkHubGeo}>
      <meshBasicMaterial color={C.face} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
    </mesh>
    <lineSegments geometry={fkHubEdges}>
      <lineBasicMaterial color={edgeColor} transparent opacity={0.55} />
    </lineSegments>
  </group>
);

// arriostramiento del mástil + rejilla del respaldo de carga
const mastLinesGeo = (() => {
  const p: number[] = [];
  // travesaños entre los dos rieles del mástil
  for (const y of [0.5, 1.3, 2.1, 2.85]) p.push(-0.34, y, 0, 0.34, y, 0);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

const backrestGeo = (() => {
  const p: number[] = [];
  for (const x of [-0.36, -0.12, 0.12, 0.36]) p.push(x, 0, 0, x, 0.62, 0);
  for (const y of [0, 0.31, 0.62]) p.push(-0.42, y, 0, 0.42, y, 0);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();



// Autoelevador contrabalanceado. EXACTAMENTE DOS uñas.
// Origen: piso, centro del chasis. Frente (mástil) hacia +z.
export const Forklift: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  forkHeight?: number; // altura de las uñas sobre el piso (0.1 = abajo)
  pallet?: boolean; // pallet cargado sobre las uñas
  operator?: boolean;
  edgeColor?: string;
  frame?: number; // para la baliza
}> = ({ position, rotationY = 0, forkHeight = 0.1, pallet = false, operator = true, edgeColor = C.hero, frame = 0 }) => {
  const blink = 0.35 + 0.45 * Math.abs(Math.sin(frame / 11));
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* chasis + contrapeso redondeado */}
      <RBox faceColor="#20304F" r={0.16} size={[1.15, 0.85, 1.7]} position={[0, 0.72, -0.1]} edgeColor={edgeColor} edgeOpacity={1} />
      <RBox faceColor="#20304F" r={0.22} size={[1.05, 0.65, 0.55]} position={[0, 0.62, -1.05]} edgeColor={edgeColor} edgeOpacity={0.9} />
      {/* butaca + volante */}
      <WireBox faceColor="#20304F" size={[0.48, 0.1, 0.45]} position={[0, 1.2, -0.3]} edgeColor={edgeColor} edgeOpacity={0.7} />
      <WireBox faceColor="#20304F" size={[0.48, 0.5, 0.09]} position={[0, 1.5, -0.55]} edgeColor={edgeColor} edgeOpacity={0.7} />
      <WireBox faceColor="#20304F" size={[0.3, 0.05, 0.2]} position={[0, 1.32, 0.28]} edgeColor={edgeColor} edgeOpacity={0.6} />
      {operator && <Figure pose="sit" position={[0, 1.26, -0.3]} helmet edgeColor={edgeColor} />}
      {/* pórtico de seguridad (ROPS) */}
      {([[-0.52, 0.52], [0.52, 0.52], [-0.52, -0.62], [0.52, -0.62]] as const).map(([x, z]) => (
        <WireBox key={`${x}${z}`} size={[0.07, 1.2, 0.07]} position={[x, 1.9, z]} edgeColor={edgeColor} edgeOpacity={0.75} />
      ))}
      <WireBox size={[1.18, 0.09, 1.3]} position={[0, 2.55, -0.05]} edgeColor={edgeColor} edgeOpacity={0.85} />
      {/* baliza */}
      <mesh position={[0.4, 2.68, -0.05]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshBasicMaterial color={C.accent} transparent opacity={blink} />
      </mesh>
      {/* mástil dúplex: rieles fijos + etapa interior que asciende con la carga
          (sin esto, el carro "flotaría" sobre el mástil en estibas altas) */}
      <WireBox size={[0.1, 3.0, 0.14]} position={[-0.38, 1.5, 0.95]} edgeColor={edgeColor} edgeOpacity={0.95} />
      <WireBox size={[0.1, 3.0, 0.14]} position={[0.38, 1.5, 0.95]} edgeColor={edgeColor} edgeOpacity={0.95} />
      <WireBox size={[0.08, 2.9, 0.1]} position={[-0.28, 1.45 + Math.max(0, forkHeight - 1.4), 0.99]} edgeColor={edgeColor} edgeOpacity={0.8} />
      <WireBox size={[0.08, 2.9, 0.1]} position={[0.28, 1.45 + Math.max(0, forkHeight - 1.4), 0.99]} edgeColor={edgeColor} edgeOpacity={0.8} />
      <lineSegments geometry={mastLinesGeo} position={[0, 0, 0.95]}>
        <lineBasicMaterial color={edgeColor} transparent opacity={0.6} />
      </lineSegments>
      {/* carro + respaldo de carga + EXACTAMENTE DOS uñas */}
      <group position={[0, forkHeight, 0]}>
        <WireBox size={[0.92, 0.34, 0.1]} position={[0, 0.28, 1.06]} edgeColor={edgeColor} edgeOpacity={0.9} />
        <lineSegments geometry={backrestGeo} position={[0, 0.5, 1.08]}>
          <lineBasicMaterial color={edgeColor} transparent opacity={0.55} />
        </lineSegments>
        <WireBox size={[0.13, 0.06, 1.05]} position={[-0.28, 0.09, 1.66]} edgeColor={edgeColor} edgeOpacity={0.95} />
        <WireBox size={[0.13, 0.06, 1.05]} position={[0.28, 0.09, 1.66]} edgeColor={edgeColor} edgeOpacity={0.95} />
        {pallet && (
          <group position={[0, 0.12 - 1.26 + 0.065, 1.72]}>
            <PalletStack x={0} z={0} reveal={1} />
          </group>
        )}
      </group>
      {/* ruedas: delanteras (tracción) + traseras (dirección) */}
      <FkWheel position={[-0.62, 0.3, 0.55]} edgeColor={edgeColor} />
      <FkWheel position={[0.62, 0.3, 0.55]} edgeColor={edgeColor} />
      <FkWheel position={[-0.55, 0.3, -0.85]} edgeColor={edgeColor} />
      <FkWheel position={[0.55, 0.3, -0.85]} edgeColor={edgeColor} />
    </group>
  );
};
