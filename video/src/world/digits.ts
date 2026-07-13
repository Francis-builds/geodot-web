// Números de línea estilo 7 segmentos, para pintar en pisos y paredes
// (DOCK 15, posiciones de rack). Devuelve segmentos 2D [x1,y1,x2,y2] en un
// cuerpo de 1 x 1.6 por dígito, con el gap clásico entre segmentos.
const SEG: Record<string, [number, number, number, number]> = {
  a: [0, 1.6, 1, 1.6],
  b: [1, 1.6, 1, 0.8],
  c: [1, 0.8, 1, 0],
  d: [0, 0, 1, 0],
  e: [0, 0.8, 0, 0],
  f: [0, 1.6, 0, 0.8],
  g: [0, 0.8, 1, 0.8],
};

const DIG: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abgde",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgcde",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

const GAP = 0.08; // acortar cada segmento en ambos extremos

export const numberSegments = (text: string, size = 1, spacing = 1.45): number[] => {
  const out: number[] = [];
  [...text].forEach((ch, i) => {
    const segs = DIG[ch];
    if (!segs) return;
    const ox = i * spacing * size;
    for (const s of segs) {
      const [x1, y1, x2, y2] = SEG[s];
      const dx = x2 - x1, dy = y2 - y1;
      out.push(
        (x1 + dx * GAP) * size + ox,
        (y1 + dy * GAP) * size,
        (x2 - dx * GAP) * size + ox,
        (y2 - dy * GAP) * size,
      );
    }
  });
  return out; // [x1,y1,x2,y2, ...] plano; el consumidor lo orienta en 3D
};

export const numberWidth = (text: string, size = 1, spacing = 1.45): number =>
  text.length > 0 ? ((text.length - 1) * spacing + 1) * size : 0;
