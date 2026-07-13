// Pseudo-random determinístico (Math.random está prohibido en Remotion:
// cada frame se renderiza en procesos distintos y debe dar idéntico).
export const hash2 = (i: number, j: number): number => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};
