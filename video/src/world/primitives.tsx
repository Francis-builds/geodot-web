import React, { useMemo } from "react";
import * as THREE from "three";
import { C } from "./tokens";

type Vec3 = [number, number, number];

// Caja con caras sólidas oscuras (ocluyen) + aristas como líneas.
// polygonOffset empuja las caras hacia atrás para que las aristas ganen el z-buffer.
export const WireBox: React.FC<{
  size: Vec3;
  position: Vec3;
  rotationY?: number;
  edgeColor?: string;
  edgeOpacity?: number;
  faceColor?: string;
}> = ({ size, position, rotationY = 0, edgeColor = C.edgeLit, edgeOpacity = 0.9, faceColor = C.face }) => {
  const { box, edges } = useMemo(() => {
    const box = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const edges = new THREE.EdgesGeometry(box);
    return { box, edges };
  }, [size[0], size[1], size[2]]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={box}>
        <meshBasicMaterial color={faceColor} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={edgeColor} transparent opacity={edgeOpacity} />
      </lineSegments>
    </group>
  );
};

// Cilindro wireframe (ruedas): EdgesGeometry con threshold alto deja solo los aros.
export const WireCylinder: React.FC<{
  radius: number;
  length: number;
  position: Vec3;
  spin?: number;
  edgeColor?: string;
  edgeOpacity?: number;
}> = ({ radius, length, position, spin = 0, edgeColor = C.hero, edgeOpacity = 0.9 }) => {
  const { cyl, edges, spoke } = useMemo(() => {
    const cyl = new THREE.CylinderGeometry(radius, radius, length, 14);
    const edges = new THREE.EdgesGeometry(cyl, 30);
    const spoke = new THREE.BoxGeometry(length * 1.02, radius * 1.9, 0.05);
    return { cyl, edges, spoke };
  }, [radius, length]);

  return (
    // Cilindro de three apunta en Y; lo acostamos sobre X (eje de rueda)
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <group rotation={[spin, 0, 0]}>
        <mesh geometry={cyl}>
          <meshBasicMaterial color={C.face} polygonOffset polygonOffsetFactor={2} polygonOffsetUnits={2} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={edgeColor} transparent opacity={edgeOpacity} />
        </lineSegments>
        {/* un rayo interior: hace visible la rotación */}
        <mesh geometry={spoke}>
          <meshBasicMaterial color={edgeColor} transparent opacity={edgeOpacity * 0.55} />
        </mesh>
      </group>
    </group>
  );
};

// Brackets de esquina estilo viewfinder (firma del DS de Geodot) alrededor de un volumen.
export const CornerBrackets: React.FC<{
  size: Vec3;
  position: Vec3;
  color?: string;
  opacity?: number;
  arm?: number; // largo de cada brazo del bracket
}> = ({ size, position, color = C.accent, opacity = 0.9, arm = 0.9 }) => {
  const geo = useMemo(() => {
    const [w, h, d] = [size[0] / 2, size[1] / 2, size[2] / 2];
    const pts: number[] = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const cx = sx * w, cy = sy * h, cz = sz * d;
          pts.push(cx, cy, cz, cx - sx * arm, cy, cz);
          pts.push(cx, cy, cz, cx, cy - sy * arm, cz);
          pts.push(cx, cy, cz, cx, cy, cz - sz * arm);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [size[0], size[1], size[2], arm]);

  return (
    <lineSegments geometry={geo} position={position}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
};

// Piso: grilla menor + mayor con fade por fog de la escena.
export const GroundGrid: React.FC<{ size?: number }> = ({ size = 320 }) => (
  <group>
    <gridHelper args={[size, size / 4, C.gridMinor, C.gridMinor]} position={[0, 0, 0]} />
    <gridHelper args={[size, size / 20, C.gridMajor, C.gridMajor]} position={[0, 0.01, 0]} />
  </group>
);

// Motas de datos flotando, determinísticas y con deriva sutil.
export const DataMotes: React.FC<{ frame: number; count?: number }> = ({ frame, count = 90 }) => {
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < count; i++) {
      const h1 = Math.sin(i * 127.1) * 43758.5453;
      const h2 = Math.sin(i * 311.7) * 12543.8567;
      const h3 = Math.sin(i * 74.7) * 33421.1234;
      const f = (v: number) => v - Math.floor(v);
      pts.push((f(h1) - 0.5) * 130, 2 + f(h2) * 20, (f(h3) - 0.5) * 120);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [count]);

  return (
    <points geometry={geo} position={[0, Math.sin(frame / 90) * 0.6, 0]}>
      <pointsMaterial color={C.edgeLit} size={2.2} sizeAttenuation={false} transparent opacity={0.28} />
    </points>
  );
};
