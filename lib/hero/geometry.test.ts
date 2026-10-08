import { cardRects, leaderPath, videoToBox } from "./geometry";

test("videoToBox cover crops a 16:9 video into a 4:3 box", () => {
  const p = videoToBox([0.5, 0.5], { w: 1920, h: 1080 }, { w: 1200, h: 900 });
  expect(Math.round(p.x)).toBe(600);
  expect(Math.round(p.y)).toBe(450);
  expect(p.visible).toBe(true);
  expect(videoToBox([0.02, 0.5], { w: 1920, h: 1080 }, { w: 1200, h: 900 }).visible).toBe(false);
});
test("videoToBox cover on an ultra-wide box crops top and bottom", () => {
  const p = videoToBox([0.5, 0.02], { w: 1920, h: 1080 }, { w: 2560, h: 900 });
  expect(p.visible).toBe(false);
  expect(Math.round(videoToBox([0.5, 0.5], { w: 1920, h: 1080 }, { w: 2560, h: 900 }).y)).toBe(450);
});
test("cardRects keeps >= 6% margin and stays in right half", () => {
  const rs = cardRects({ w: 1600, h: 900 }, [{ rows: 10 }, { rows: 4 }]);
  for (const r of rs) {
    expect(r.x >= 800).toBe(true);
    expect(1600 - (r.x + r.w) >= 96).toBe(true);
  }
  expect(rs[1].y >= rs[0].y + rs[0].h).toBe(true);
});
test("leaderPath goes from the card edge through an elbow to the anchor", () => {
  const d = leaderPath({ x: 1000, y: 100, w: 300, h: 200 }, { x: 400, y: 600 }, "R", 28);
  expect(d).toBe("M 1000 122 H 972 L 400 600");
  const l = leaderPath({ x: 100, y: 100, w: 300, h: 200 }, { x: 800, y: 600 }, "L", 28);
  expect(l).toBe("M 400 122 H 428 L 800 600");
});
