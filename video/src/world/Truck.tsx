import React from "react";
import { C } from "./tokens";
import { WireBox, WireCylinder } from "./primitives";

// Semi + trailer en volúmenes simples ("proudly a render").
// Origen del grupo: piso, centro del tractor. Frente hacia +z.
export const Truck: React.FC<{
  position: [number, number, number];
  wheelSpin: number;
  edgeColor?: string;
}> = ({ position, wheelSpin, edgeColor = C.hero }) => {
  const wheel = (x: number, z: number, key: string) => (
    <WireCylinder key={key} radius={0.52} length={0.4} position={[x, 0.52, z]} spin={wheelSpin} edgeColor={edgeColor} edgeOpacity={0.8} />
  );

  return (
    <group position={position}>
      {/* capó */}
      <WireBox size={[2.2, 1.5, 2.1]} position={[0, 1.15, 3.35]} edgeColor={edgeColor} />
      {/* cabina */}
      <WireBox size={[2.5, 2.9, 2.5]} position={[0, 1.85, 1.55]} edgeColor={edgeColor} />
      {/* deflector sobre cabina */}
      <WireBox size={[2.4, 0.7, 1.5]} position={[0, 3.55, 1.25]} edgeColor={edgeColor} edgeOpacity={0.75} />
      {/* chasis tractor */}
      <WireBox size={[2.0, 0.5, 6.2]} position={[0, 0.85, 0.4]} edgeColor={edgeColor} edgeOpacity={0.7} />
      {/* escapes */}
      <WireBox size={[0.16, 1.7, 0.16]} position={[-1.05, 2.6, 0.25]} edgeColor={edgeColor} edgeOpacity={0.7} />
      <WireBox size={[0.16, 1.7, 0.16]} position={[1.05, 2.6, 0.25]} edgeColor={edgeColor} edgeOpacity={0.7} />
      {/* trailer */}
      <WireBox size={[2.55, 2.75, 12.2]} position={[0, 2.5, -6.0]} edgeColor={edgeColor} />
      {/* patas del trailer replegadas / faldón */}
      <WireBox size={[2.0, 0.45, 3.0]} position={[0, 0.9, -9.8]} edgeColor={edgeColor} edgeOpacity={0.65} />
      {/* ejes: tractor delantero, tractor traseros x2, trailer x2 */}
      {wheel(-1.08, 3.3, "fl")} {wheel(1.08, 3.3, "fr")}
      {wheel(-1.08, -0.5, "rl1")} {wheel(1.08, -0.5, "rr1")}
      {wheel(-1.08, -1.7, "rl2")} {wheel(1.08, -1.7, "rr2")}
      {wheel(-1.08, -10.0, "tl1")} {wheel(1.08, -10.0, "tr1")}
      {wheel(-1.08, -11.2, "tl2")} {wheel(1.08, -11.2, "tr2")}
    </group>
  );
};
