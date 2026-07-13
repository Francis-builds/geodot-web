import React from "react";
import * as THREE from "three";
import { C } from "./tokens";
import { WireBox } from "./primitives";
import { RBox, roundedSolid, roundedWire } from "./rounded";
import { Figure } from "./Figure";

// ---- geometrías compartidas ----
// Neumático: 18 lados, threshold 25° deja SOLO los dos aros (nada de facetas)
const tireGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 18);
const tireEdges = new THREE.EdgesGeometry(tireGeo, 25);
const hubGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.34, 10);
const hubEdges = new THREE.EdgesGeometry(hubGeo, 5);
const spokeGeo = new THREE.BoxGeometry(0.05, 0.32, 0.9);
const tankGeo = new THREE.CylinderGeometry(0.33, 0.33, 1.5, 12);
const tankEdges = new THREE.EdgesGeometry(tankGeo, 25);

const faceMat = (
  <meshBasicMaterial color={C.face} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
);

// El héroe lleva caras más claras que el mundo: es EL objeto físico entre datos
export const TRUCK_FACE = "#20304F";

// Rueda de camión: gira sobre su EJE (local Y del cilindro = eje X mundo tras
// la rotación Z de 90°). Girar sobre cualquier otro eje la hace "tumbar" como
// una moneda y en movimiento barre una esfera.
export const Wheel: React.FC<{
  position: [number, number, number];
  spin: number;
  dual?: boolean;
  edgeColor?: string;
  opacity?: number;
}> = ({ position, spin, dual = false, edgeColor = C.hero, opacity = 0.72 }) => (
  <group position={position} rotation={[0, 0, Math.PI / 2]}>
    <group rotation={[0, spin, 0]}>
      {(dual ? [-0.19, 0.19] : [0]).map((off) => (
        <group key={off} position={[0, off, 0]}>
          <mesh geometry={tireGeo}>{faceMat}</mesh>
          <lineSegments geometry={tireEdges}>
            <lineBasicMaterial color={edgeColor} transparent opacity={opacity} />
          </lineSegments>
        </group>
      ))}
      <mesh geometry={hubGeo}>{faceMat}</mesh>
      <lineSegments geometry={hubEdges}>
        <lineBasicMaterial color={edgeColor} transparent opacity={opacity * 0.7} />
      </lineSegments>
      {/* rayo: hace legible el giro */}
      <mesh geometry={spokeGeo}>
        <meshBasicMaterial color={edgeColor} transparent opacity={opacity * 0.45} />
      </mesh>
    </group>
  </group>
);

// ---- carga paletizada (12 pallets, wall-to-wall: el claim del 99%) ----
const palletDeckGeo = new THREE.BoxGeometry(1.08, 0.13, 1.72);
const palletDeckEdges = new THREE.EdgesGeometry(palletDeckGeo);
const cargoBoxGeo = roundedSolid(1.02, 1.0, 1.64, 0.07);
const cargoBoxEdges = roundedWire(1.02, 1.0, 1.64, 0.07);
const cargoTopGeo = roundedSolid(0.94, 0.5, 1.5, 0.07);
const cargoTopEdges = roundedWire(0.94, 0.5, 1.5, 0.07);

const PALLET_Z = [-1.25, -3.15, -5.05, -6.95, -8.85, -10.75];

// La carga y el chofer son DATOS descubiertos: renderOrder por encima de la
// carrocería translúcida (si no, la pared los tiñe al asentarse y la cascada
// se lee al revés: los mid-reveal brillan y los revelados se apagan).
const holoPart = (geo: THREE.BufferGeometry, edges: THREE.BufferGeometry, y: number, reveal: number, key?: React.Key) => (
  <group key={key} position={[0, y, 0]}>
    <mesh geometry={geo} renderOrder={2}>
      <meshBasicMaterial
        color="#182742"
        transparent
        opacity={reveal * 0.92}
        polygonOffset
        polygonOffsetFactor={2}
        polygonOffsetUnits={2}
      />
    </mesh>
    <lineSegments geometry={edges} renderOrder={3}>
      <lineBasicMaterial color={C.edgeLit} transparent opacity={reveal * 0.95} depthWrite={false} />
    </lineSegments>
  </group>
);

export const PalletStack: React.FC<{ x: number; z: number; reveal: number }> = ({ x, z, reveal }) => (
  <group position={[x, 0, z]}>
    {holoPart(palletDeckGeo, palletDeckEdges, 1.26, reveal)}
    {holoPart(cargoBoxGeo, cargoBoxEdges, 1.85, reveal)}
    {holoPart(cargoTopGeo, cargoTopEdges, 2.62, reveal)}
  </group>
);



// Líneas de detalle del tractor + trailer (parabrisas, ventanas, grilla, puertas)
const truckDetailGeo = (() => {
  const p: number[] = [];
  const rect = (ax: "x" | "z", at: number, u0: number, u1: number, v0: number, v1: number) => {
    // rect en plano x=at (u=z, v=y) o z=at (u=x, v=y)
    const pt = (u: number, v: number): [number, number, number] =>
      ax === "x" ? [at, v, u] : [u, v, at];
    const corners = [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)];
    for (let i = 0; i < 4; i++) {
      const a = corners[i], b = corners[(i + 1) % 4];
      p.push(...a, ...b);
    }
  };
  // parabrisas RASTRILLADO: plano inclinado entre la cintura (y2.42,z2.78)
  // y el techo retrasado (y3.18,z2.34)
  p.push(-1.0, 2.42, 2.78, 1.0, 2.42, 2.78);
  p.push(-1.0, 3.18, 2.34, 1.0, 3.18, 2.34);
  p.push(-1.0, 2.42, 2.78, -1.0, 3.18, 2.34);
  p.push(1.0, 2.42, 2.78, 1.0, 3.18, 2.34);
  // pilares A
  p.push(-1.22, 2.27, 2.82, -1.18, 3.3, 2.28);
  p.push(1.22, 2.27, 2.82, 1.18, 3.3, 2.28);
  // ventanas laterales del glasshouse
  rect("x", 1.22, 0.55, 2.05, 2.5, 3.15);
  rect("x", -1.22, 0.55, 2.05, 2.5, 3.15);
  // grilla del capó: 3 líneas horizontales
  for (const y of [0.85, 1.15, 1.45]) p.push(-0.72, y, 4.47, 0.72, y, 4.47);
  // panel lateral del trailer (inset) + 2 líneas longitudinales
  for (const s of [-1, 1]) {
    const x = s * 1.295;
    rect("x", x, -11.85, -0.35, 1.4, 3.7);
    p.push(x, 2.2, -11.85, x, 2.2, -0.35);
    p.push(x, 3.0, -11.85, x, 3.0, -0.35);
  }
  // puertas traseras del trailer (z=-12.12)
  const zd = -12.12;
  p.push(0, 1.3, zd, 0, 3.8, zd);
  for (const dx of [-0.5, 0.5]) {
    p.push(dx, 1.3, zd, dx, 3.8, zd);
    p.push(dx - 0.2, 2.4, zd, dx + 0.2, 2.4, zd);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

// Semi + trailer, detalle medio ("proudly a render", pero no Doom).
// Origen: piso, centro del tractor. Frente hacia +z.
export const Truck: React.FC<{
  position: [number, number, number];
  wheelSpin: number;
  edgeColor?: string;
  xray?: number; // 0..1: caras de cabina/trailer se vuelven translúcidas
  revealAt?: (localZ: number) => number; // reveal de carga/chofer según z local
}> = ({ position, wheelSpin, edgeColor = C.hero, xray = 0, revealAt = () => 0 }) => {
  const shell = 1 - 0.8 * xray;
  return (
  <group position={position}>
    {/* paragolpes + capó redondeado + cabina baja + glasshouse retrasado + deflector */}
    <RBox faceColor={TRUCK_FACE} r={0.09} size={[2.35, 0.4, 0.22]} position={[0, 0.55, 4.55]} edgeColor={edgeColor} edgeOpacity={0.9} />
    <RBox faceColor={TRUCK_FACE} faceOpacity={shell} r={0.24} size={[2.15, 1.3, 2.1]} position={[0, 1.22, 3.4]} edgeColor={edgeColor} edgeOpacity={1} />
    <RBox faceColor={TRUCK_FACE} faceOpacity={shell} r={0.18} size={[2.5, 1.8, 2.5]} position={[0, 1.37, 1.6]} edgeColor={edgeColor} edgeOpacity={1} />
    <RBox faceColor={TRUCK_FACE} faceOpacity={shell} r={0.22} size={[2.42, 1.1, 1.9]} position={[0, 2.82, 1.35]} edgeColor={edgeColor} edgeOpacity={1} />
    <RBox faceColor={TRUCK_FACE} r={0.2} size={[2.3, 0.6, 1.3]} position={[0, 3.62, 0.85]} edgeColor={edgeColor} edgeOpacity={0.85} />
    {/* espejos (colgados del pilar A) */}
    <WireBox faceColor={TRUCK_FACE} size={[0.06, 0.5, 0.26]} position={[-1.48, 2.9, 2.45]} edgeColor={edgeColor} edgeOpacity={0.7} />
    <WireBox faceColor={TRUCK_FACE} size={[0.06, 0.5, 0.26]} position={[1.48, 2.9, 2.45]} edgeColor={edgeColor} edgeOpacity={0.7} />
    {/* chasis + quinta rueda */}
    <WireBox faceColor={TRUCK_FACE} size={[2.0, 0.45, 6.4]} position={[0, 0.8, 0.5]} edgeColor={edgeColor} edgeOpacity={0.65} />
    <WireBox faceColor={TRUCK_FACE} size={[1.1, 0.22, 1.3]} position={[0, 1.12, -0.8]} edgeColor={edgeColor} edgeOpacity={0.65} />
    {/* escapes */}
    <WireBox faceColor={TRUCK_FACE} size={[0.16, 1.8, 0.16]} position={[-1.1, 2.75, 0.35]} edgeColor={edgeColor} edgeOpacity={0.7} />
    <WireBox faceColor={TRUCK_FACE} size={[0.16, 1.8, 0.16]} position={[1.1, 2.75, 0.35]} edgeColor={edgeColor} edgeOpacity={0.7} />
    {/* tanques de combustible */}
    {[-1.14, 1.14].map((x) => (
      <group key={x} position={[x, 0.72, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={tankGeo}>{faceMat}</mesh>
        <lineSegments geometry={tankEdges}>
          <lineBasicMaterial color={edgeColor} transparent opacity={0.6} />
        </lineSegments>
      </group>
    ))}
    {/* carga y chofer: existen siempre, el barrido los "descubre" */}
    {PALLET_Z.map((z) =>
      [-0.62, 0.62].map((x) => {
        const a = revealAt(z);
        return a > 0.01 ? <PalletStack key={`${x}-${z}`} x={x} z={z} reveal={a} /> : null;
      }),
    )}
    <Figure pose="sit" position={[-0.55, 2.02, 1.4]} edgeColor={edgeColor} />
    {/* trailer + patas + faldones + guarda trasera */}
    <RBox faceColor={TRUCK_FACE} faceOpacity={shell} r={0.14} size={[2.55, 2.75, 12.2]} position={[0, 2.55, -6.0]} edgeColor={edgeColor} edgeOpacity={1} />
    <WireBox faceColor={TRUCK_FACE} size={[0.14, 0.95, 0.14]} position={[-0.9, 0.7, -2.6]} edgeColor={edgeColor} edgeOpacity={0.6} />
    <WireBox faceColor={TRUCK_FACE} size={[0.14, 0.95, 0.14]} position={[0.9, 0.7, -2.6]} edgeColor={edgeColor} edgeOpacity={0.6} />
    <WireBox faceColor={TRUCK_FACE} size={[0.05, 0.7, 4.6]} position={[-1.28, 0.82, -6.6]} edgeColor={edgeColor} edgeOpacity={0.55} />
    <WireBox faceColor={TRUCK_FACE} size={[0.05, 0.7, 4.6]} position={[1.28, 0.82, -6.6]} edgeColor={edgeColor} edgeOpacity={0.55} />
    <WireBox faceColor={TRUCK_FACE} size={[2.3, 0.13, 0.13]} position={[0, 0.5, -11.95]} edgeColor={edgeColor} edgeOpacity={0.6} />
    {/* detalle de líneas (parabrisas, ventanas, grilla, panel, puertas) */}
    <lineSegments geometry={truckDetailGeo}>
      <lineBasicMaterial color={edgeColor} transparent opacity={0.68} />
    </lineSegments>
    {/* ruedas: delantera simple, traseras y de trailer duales */}
    <Wheel position={[-1.08, 0.5, 3.35]} spin={wheelSpin} edgeColor={edgeColor} />
    <Wheel position={[1.08, 0.5, 3.35]} spin={wheelSpin} edgeColor={edgeColor} />
    <Wheel position={[-1.08, 0.5, -0.4]} spin={wheelSpin} dual edgeColor={edgeColor} />
    <Wheel position={[1.08, 0.5, -0.4]} spin={wheelSpin} dual edgeColor={edgeColor} />
    <Wheel position={[-1.08, 0.5, -1.65]} spin={wheelSpin} dual edgeColor={edgeColor} />
    <Wheel position={[1.08, 0.5, -1.65]} spin={wheelSpin} dual edgeColor={edgeColor} />
    <Wheel position={[-1.08, 0.5, -9.7]} spin={wheelSpin} dual edgeColor={edgeColor} />
    <Wheel position={[1.08, 0.5, -9.7]} spin={wheelSpin} dual edgeColor={edgeColor} />
    <Wheel position={[-1.08, 0.5, -10.9]} spin={wheelSpin} dual edgeColor={edgeColor} />
    <Wheel position={[1.08, 0.5, -10.9]} spin={wheelSpin} dual edgeColor={edgeColor} />
  </group>
  );
};

// Trailer estacionado (sin tractor): para darle vida a slots del yard
export const ParkedTrailer: React.FC<{
  position: [number, number, number];
  edgeColor: string;
  faceColor: string;
  edgeOpacity: number;
  faceOpacity?: number; // <1 = trailer de vidrio (escenas de plan de carga)
}> = ({ position, edgeColor, faceColor, edgeOpacity, faceOpacity = 1 }) => (
  <group position={position}>
    <RBox r={0.14} size={[2.55, 2.75, 12.2]} position={[0, 2.55, 0]} edgeColor={edgeColor} faceColor={faceColor} edgeOpacity={edgeOpacity} faceOpacity={faceOpacity} />
    <WireBox size={[0.14, 1.15, 0.14]} position={[-0.9, 0.6, 3.6]} edgeColor={edgeColor} faceColor={faceColor} edgeOpacity={edgeOpacity * 0.7} />
    <WireBox size={[0.14, 1.15, 0.14]} position={[0.9, 0.6, 3.6]} edgeColor={edgeColor} faceColor={faceColor} edgeOpacity={edgeOpacity * 0.7} />
    <Wheel position={[-1.08, 0.5, -3.9]} spin={0} dual edgeColor={edgeColor} opacity={edgeOpacity * 0.7} />
    <Wheel position={[1.08, 0.5, -3.9]} spin={0} dual edgeColor={edgeColor} opacity={edgeOpacity * 0.7} />
    <Wheel position={[-1.08, 0.5, -5.1]} spin={0} dual edgeColor={edgeColor} opacity={edgeOpacity * 0.7} />
    <Wheel position={[1.08, 0.5, -5.1]} spin={0} dual edgeColor={edgeColor} opacity={edgeOpacity * 0.7} />
  </group>
);
