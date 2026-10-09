import { activeCards, cueAlpha, formatHud, frameAt, frameIndex, palletStage, parseFilm, type Film } from "./film";

const film: Film = {
  fps: 24, width: 1920, height: 1080,
  cues: { truckCard: 112, cargoCard: 144, docked: 378 },
  frames: [
    { tractor: [0, 0], driver: [0.1, 0.1], trailer: [0.2, 0.2], dist: 10, art: 0, status: "gate" },
    { tractor: [1, 0.5], driver: [0.3, 0.3], trailer: [0.4, 0.4], dist: 20, art: 10, status: "yard" },
  ],
};

test("frameIndex wraps at loop end", () => {
  expect(frameIndex(12.0, 24, 288)).toBe(0);
  expect(frameIndex(11.99, 24, 288)).toBe(287);
  expect(frameIndex(24.5, 24, 288)).toBe(12);
});
test("frameIndex is always an integer in range for negative or NaN time", () => {
  expect(frameIndex(-0.01, 24, 288)).toBe(287);
  expect(frameIndex(Number.NaN, 24, 288)).toBe(0);
});
test("parseFilm returns null on invalid", () => {
  expect(parseFilm({ fps: 24 })).toBe(null);
  expect(parseFilm(null)).toBe(null);
});
test("parseFilm accepts a valid film", () => {
  expect(parseFilm(film)?.frames.length).toBe(2);
});
test("frameAt interpolates anchors and numbers between neighbours", () => {
  const f = frameAt(film, 0.5 / 24);
  expect(f.tractor).toEqual([0.5, 0.25]);
  expect(f.dist).toBe(15);
  expect(f.status).toBe("gate");
  expect(f.index).toBe(0);
});
test("cueAlpha ramps over fade frames", () => {
  expect(cueAlpha(100, 112)).toBe(0);
  expect(cueAlpha(122, 112)).toBe(1);
  expect(cueAlpha(117, 112)).toBe(0.5);
});
test("formatHud uses locale decimals", () => {
  expect(formatHud("es", "dist", 18.42)).toBe("18,4 m");
  expect(formatHud("en", "dist", 18.42)).toBe("18.4 m");
  expect(formatHud("es", "art", 27.4)).toBe("27°");
  expect(formatHud("es", "weight", 18.4)).toBe("18,4 t");
});

const phase2: Film = {
  ...film,
  cues: { ...film.cues, palletCard: 460, slotDone: 615, relevo: 725 },
  frames: [
    { tractor: [0, 0], driver: [0, 0], trailer: [0, 0], dist: 0, art: 0, status: "docked" },
    { tractor: [0, 0], driver: [0, 0], trailer: [0, 0], dist: 0, art: 0, status: "relevo", pallet: [0.6, 0.5], picker: [0.55, 0.45] },
  ],
};

test("parseFilm accepts the phase-1 JSON (no phase-2 fields) and the phase-2 JSON", () => {
  expect(parseFilm(film)?.cues.palletCard).toBe(undefined);
  expect(parseFilm(phase2)?.frames[1].pallet).toEqual([0.6, 0.5]);
});
test("activeCards switches from truck+cargo to pallet at palletCard", () => {
  expect(activeCards(100, phase2.cues)).toEqual(["truck", "cargo"]);
  expect(activeCards(470, phase2.cues)).toEqual(["pallet"]);
});
test("activeCards never shows pallet with phase-1 cues", () => {
  expect(activeCards(9999, film.cues)).toEqual(["truck", "cargo"]);
});
test("palletStage follows the cues", () => {
  expect(palletStage(465, phase2.cues)).toBe("scanned");
  expect(palletStage(620, phase2.cues)).toBe("stored");
  expect(palletStage(730, phase2.cues)).toBe("picking");
});
