/*
 * THE BLACK CAT'S NINETEEN POSES, a whole cat sitting and looking at you, in pixel art: a 50 x 50 grid, five output pixels a cell, and no anti-aliasing, so every edge is a
 * staircase of real pixels. Each part is a shape tested cell by cell; its contour is every filled cell that touches an empty one,
 * so the outline is always one cell thick. The eyes are the same 4 x 4 block in every frame and only the pupil moves inside it, so
 * a glance never changes the shape of the eye. The head moves one cell toward the gaze, whole, and never changes shape. An example set beside Allison; run it to redraw the folder:
 *
 *   node scripts/generate-black-cat-avatar.mjs
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/* `sharp` is Astro's own image dependency: resolved through it, so the docs app does not have to list a package only these scripts use. */
const require = createRequire(
  createRequire(import.meta.url).resolve("astro/package.json"),
);
const sharp = require("sharp");
const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "../public/expressive-avatar/black-cat",
);
mkdirSync(out, { recursive: true });

/* No transparency inside the cat: a blended colour is one more colour the palette never chose, so every tint is its own solid. */
const N = 50,
  SCALE = 5;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const EYE_RING = hex("#5a3e12"),
  INK = hex("#14141c"),
  FUR = hex("#2c2c38"),
  FUR_LIGHT = hex("#4a4a5e"),
  FUR_DEEP = hex("#1d1d27");
const EAR_DEEP = hex("#a65b72"),
  MUZZLE_SHADE = hex("#c4beb4"),
  COLLAR_LIGHT = hex("#ea6a5e"),
  EAR = hex("#d98a9c"),
  NOSE = hex("#e9808f"),
  MUZZLE = hex("#e6e0d4"),
  WHISKER = hex("#c9cad8");
const EYE = hex("#f2c94c"),
  EYE_LID = hex("#b07f22"),
  EYE_DEEP = hex("#d99a2b"),
  EYE_LIGHT = hex("#fff6c8");
const INSIDE = hex("#4a0f20"),
  TONGUE = hex("#ef7b8c"),
  FANG = hex("#fbf8f0");
const COLLAR = hex("#d1453b"),
  COLLAR_DEEP = hex("#9a2a24"),
  BELL = hex("#f4c542"),
  BELL_DEEP = hex("#b98a1c"),
  BELL_LIGHT = hex("#fff3b0");

const GAZE = {
  base: [0, 0],
  "top-left": [-1, -1],
  top: [0, -1],
  "top-right": [1, -1],
  left: [-1, 0],
  right: [1, 0],
  "bottom-left": [-1, 1],
  bottom: [0, 1],
  "bottom-right": [1, 1],
};

/* shapes are predicates over cell coordinates; the grid is symmetric about x = 25 */
const ellipse = (cx, cy, rx, ry) => (x, y) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
const union =
  (...fs) =>
  (x, y) =>
    fs.some((f) => f(x, y));
const and =
  (...fs) =>
  (x, y) =>
    fs.every((f) => f(x, y));
const triangle = (a, b, c) => (x, y) => {
  const side = (p, q) =>
    (x - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (y - q[1]);
  const d = [side(a, b), side(b, c), side(c, a)];
  return !(d.some((v) => v < 0) && d.some((v) => v > 0));
};
const mirror = (points) => points.map(([x, y]) => [N - x, y]);

function face({ gaze = "base", eyes = "open", mouth = "neutral" }) {
  const canvas = new Array(N * N).fill(null);
  const put = (x, y, c) => {
    if (x >= 0 && y >= 0 && x < N && y < N) canvas[y * N + x] = c;
  };
  const each = (mask, paint) => {
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) if (mask(x, y)) paint(x, y);
  };
  const fill = (mask, c) => each(mask, (x, y) => put(x, y, c));
  /* a cell is on the contour when it is inside the shape and one of its four neighbours is not */
  const contour = (mask) =>
    each(mask, (x, y) => {
      if (
        !mask(x + 1, y) ||
        !mask(x - 1, y) ||
        !mask(x, y + 1) ||
        !mask(x, y - 1)
      )
        put(x, y, INK);
    });
  const line = (x0, y0, x1, y1, c) => {
    const dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1,
      dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1;
    for (let err = dx + dy; ;) {
      put(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  };
  /* a one-cell rim just inside the contour: light on the left, deep on the right, so every volume has an edge and a turn */
  const rim = (mask, dx, c, ok = () => true) =>
    fill(
      (x, y) =>
        mask(x, y) && mask(x - dx, y) && !mask(x - 2 * dx, y) && ok(x, y),
      c,
    );
  const cells = (list, c = INK) => list.forEach(([x, y]) => put(x, y, c));

  /* the head is drawn in its own coordinates and moved one cell toward the gaze: it is looking at you, not just its pupils */
  const [gx, gy] = GAZE[gaze];
  const ox = gx,
    oy = gy;
  const S = (m) => (x, y) => m(x - ox, y - oy);
  const cellsH = (list, c = INK) =>
    cells(
      list.map(([x, y]) => [x + ox, y + oy]),
      c,
    );

  /* TAIL, behind everything, curling up on the right */
  const path = [
    [36, 47],
    [41, 47],
    [44, 44],
    [45, 40],
    [44, 36],
    [42, 33],
  ];
  const spine = [];
  for (let i = 0; i < path.length - 1; i++)
    for (let t = 0; t < 1; t += 0.1)
      spine.push([
        path[i][0] + (path[i + 1][0] - path[i][0]) * t,
        path[i][1] + (path[i + 1][1] - path[i][1]) * t,
      ]);
  const tail = (x, y) =>
    spine.some(([px, py]) => (x - px) ** 2 + (y - py) ** 2 <= 2.9);
  fill(tail, FUR);
  fill(
    and(tail, (x, y) => y <= 35),
    FUR_LIGHT,
  );
  const band = (a, b) => (x, y) =>
    spine.some(
      ([px, py], i) => i >= a && i <= b && (x - px) ** 2 + (y - py) ** 2 <= 2.9,
    );
  fill(and(tail, band(18, 21)), FUR_DEEP);
  fill(and(tail, band(34, 37)), FUR_DEEP);
  rim(tail, 1, FUR_LIGHT, (x, y) => y >= 36);
  contour(tail);

  /* BODY: a sitting pear, chest narrow and haunches wide, with the two front legs cut out of it */
  const body = union(
    ellipse(25, 35, 9, 10),
    ellipse(25, 43, 12.5, 7.5),
    (x, y) => y >= 23 && y <= 30 && Math.abs(x - 25) <= 6,
  );
  fill(body, FUR);
  fill(
    and(body, (x, y) => x >= 14 && x <= 16 && y >= 40 && y <= 45),
    FUR_LIGHT,
  );
  fill(
    and(body, (x, y) => x >= 33 && y >= 36),
    FUR_DEEP,
  );
  fill(
    and(body, (x, y) =>
      (x >= 21 && x <= 24) || (x >= 26 && x <= 29) ? y >= 48 : false,
    ),
    FUR_LIGHT,
  );
  rim(body, 1, FUR_LIGHT, (x, y) => y >= 29 && y <= 46);
  rim(body, -1, FUR_DEEP, (x, y) => y >= 29);
  contour(body);
  /* thighs, toes and a tuft of chest fur */
  for (const m of [1, -1]) {
    const X = (x) => (m === 1 ? x : N - x);
    line(X(18), 38, X(15), 43, FUR_DEEP);
    line(X(15), 43, X(17), 48, FUR_DEEP);
  }
  cells(
    [
      [22, 49],
      [28, 49],
      [22, 48],
      [28, 48],
    ],
    INK,
  );
  cells(
    [
      [23, 32],
      [25, 33],
      [27, 32],
      [24, 34],
      [26, 34],
    ],
    FUR_LIGHT,
  );
  for (const x of [20, 25, 30])
    for (let y = 38; y < 50; y++) if (body(x, y)) put(x, y, INK);
  /* collar and bell on the chest */
  fill(
    and(body, (x, y) => y === 27 && Math.abs(x - 25) <= 6),
    COLLAR,
  );
  fill(
    and(body, (x, y) => y === 28 && Math.abs(x - 25) <= 6),
    COLLAR_DEEP,
  );
  cells(
    [
      [21, 27],
      [22, 27],
      [23, 27],
    ],
    COLLAR_LIGHT,
  );
  cells(
    [
      [24, 29],
      [25, 29],
      [26, 29],
      [24, 30],
      [25, 30],
      [26, 30],
    ],
    BELL,
  );
  cells([[24, 29]], BELL_LIGHT);
  cells(
    [
      [24, 30],
      [25, 30],
      [26, 30],
    ],
    BELL_DEEP,
  );

  /* HEAD: small and round-cheeked, ears pointed */
  const earL = triangle([16, 11], [15, 2], [22, 8]),
    earR = triangle(
      ...mirror([
        [16, 11],
        [15, 2],
        [22, 8],
      ]),
    );
  const ears = union(earL, earR);
  const head = union(ellipse(25, 15, 10.5, 8), ellipse(25, 19, 10.5, 6.5));
  fill(S(ears), FUR);
  contour(S(ears));
  fill(S(head), FUR);
  fill(
    S(
      and(
        head,
        (x, y) =>
          (y === 8 && x >= 19 && x <= 22) || (y === 9 && x >= 17 && x <= 18),
      ),
    ),
    FUR_LIGHT,
  );
  fill(S(and(head, (x, y) => x >= 33 && y >= 13)), FUR_DEEP);
  fill(
    (x, y) =>
      S(head)(x, y) && S(head)(x - 1, y) && !S(head)(x - 2, y) && y <= oy + 17,
    FUR_LIGHT,
  );
  fill(
    (x, y) =>
      S(head)(x, y) && S(head)(x, y + 1) && !S(head)(x, y + 2) && x <= ox + 24,
    FUR_LIGHT,
  );
  cellsH(
    [
      [24, 9],
      [25, 10],
      [26, 9],
      [25, 8],
    ],
    FUR_DEEP,
  );
  contour(S(head));
  /* ears: a darker pink at the root, a light edge along the outside */
  fill(
    S(and(ears, (x, y) => (x === 16 || x === 34) && y >= 4 && y <= 8)),
    FUR_LIGHT,
  );
  const innerEars = union(
    triangle([16, 9], [16, 5], [19, 8]),
    triangle(
      ...mirror([
        [16, 9],
        [16, 5],
        [19, 8],
      ]),
    ),
  );
  fill(S(and(innerEars, (x, y) => !head(x, y))), EAR);
  fill(S(and(innerEars, (x, y) => !head(x, y) && y >= 8)), EAR_DEEP);

  /* the muzzle is the only pale patch, so every mouth is read against it */
  fill(S(ellipse(25, 21, 5.5, 3.5)), MUZZLE);
  fill(S(and(ellipse(25, 21, 5.5, 3.5), (x, y) => y >= 24)), MUZZLE_SHADE);
  cellsH(
    [
      [21, 20],
      [20, 21],
      [22, 22],
      [29, 20],
      [30, 21],
      [28, 22],
    ],
    MUZZLE_SHADE,
  );
  cellsH(
    [
      [24, 18],
      [25, 18],
      [26, 18],
      [25, 19],
    ],
    NOSE,
  );
  [
    [17, 20, 5, 18],
    [17, 22, 5, 23],
    [17, 24, 8, 28],
  ].forEach(([x0, y0, x1, y1]) => {
    line(x0 + ox, y0 + oy, x1 + ox, y1 + oy, WHISKER);
    line(N - x0 + ox, y0 + oy, N - x1 + ox, y1 + oy, WHISKER);
  });

  /* MOUTH: the philtrum joins the closed mouths to the nose; an open mouth is an inked hole, with tongue and fangs when it has them */
  const openMouth = (cy, rx, ry, { tongue = false, fangs = false } = {}) => {
    const m = ellipse(25, cy, rx, ry);
    fill(S(m), INSIDE);
    if (tongue) fill(S(and(m, (x, y) => y >= cy + 1)), TONGUE);
    if (fangs)
      cellsH(
        [
          [23, Math.round(cy - ry + 1)],
          [27, Math.round(cy - ry + 1)],
        ],
        FANG,
      );
    contour(S(m));
  };
  const shapes = {
    neutral: () =>
      cellsH([
        [25, 20],
        [25, 21],
        [23, 21],
        [24, 22],
        [26, 22],
        [27, 21],
      ]),
    closed: () =>
      cellsH([
        [25, 20],
        [22, 21],
        [23, 22],
        [24, 22],
        [25, 22],
        [26, 22],
        [27, 22],
        [28, 21],
      ]),
    smile: () =>
      cellsH([
        [25, 20],
        [21, 20],
        [22, 21],
        [23, 22],
        [24, 22],
        [25, 22],
        [26, 22],
        [27, 22],
        [28, 21],
        [29, 20],
      ]),
    a: () => openMouth(22, 2.6, 2.6, { tongue: true, fangs: true }),
    e: () => openMouth(22, 3.4, 1.8),
    i: () => openMouth(22, 2.6, 1.3),
    o: () => openMouth(22, 1.8, 2.3, { tongue: true }),
    u: () => openMouth(22, 1.3, 1.8),
  };
  shapes[mouth]();

  /* EYES: a 3 x 4 window with a one-cell ring. The pupil is a slit that slides one step in each direction, and nothing else changes. */
  const eyeOpen = (x0, y0) => {
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 3; i++)
        put(
          x0 + i + ox,
          y0 + j + oy,
          j === 0 ? EYE_LID : j === 3 ? EYE_DEEP : EYE,
        );
    for (let i = 0; i < 3; i++)
      cellsH(
        [
          [x0 + i, y0 - 1],
          [x0 + i, y0 + 4],
        ],
        EYE_RING,
      );
    for (let j = 0; j < 4; j++)
      cellsH(
        [
          [x0 - 1, y0 + j],
          [x0 + 3, y0 + j],
        ],
        EYE_RING,
      );
    cellsH([[x0, y0 + 1]], EYE_LIGHT);
    const px = x0 + 1 + gx,
      py = y0 + 1 + gy;
    cellsH([
      [px, py],
      [px, py + 1],
    ]);
  };
  const eyeClosed = (x0, y0) =>
    cellsH([
      [x0 - 1, y0 + 1],
      [x0, y0 + 2],
      [x0 + 1, y0 + 2],
      [x0 + 2, y0 + 2],
      [x0 + 3, y0 + 1],
    ]);
  const leftClosed = eyes === "closed",
    rightClosed = eyes === "closed" || eyes === "wink";
  if (leftClosed) eyeClosed(18, 11);
  else eyeOpen(18, 11);
  if (rightClosed) eyeClosed(30, 11);
  else eyeOpen(30, 11);

  return canvas;
}

const looks = {};
for (const gaze of Object.keys(GAZE)) looks[gaze] = { gaze };
looks.blink = { eyes: "closed" };
looks.wink = { eyes: "wink", mouth: "smile" };
for (const mouth of ["neutral", "closed", "a", "e", "i", "o", "u", "smile"])
  looks[mouth] = { mouth };

for (const [name, look] of Object.entries(looks)) {
  const cells = face(look);
  const raw = Buffer.alloc(N * SCALE * N * SCALE * 4);
  for (let y = 0; y < N * SCALE; y++)
    for (let x = 0; x < N * SCALE; x++) {
      const c = cells[Math.floor(y / SCALE) * N + Math.floor(x / SCALE)];
      const o = (y * N * SCALE + x) * 4;
      if (c) raw.set([c[0], c[1], c[2], 255], o);
    }
  await sharp(raw, {
    raw: { width: N * SCALE, height: N * SCALE, channels: 4 },
  })
    .webp({ lossless: true })
    .toFile(join(out, `${name}.webp`));
}
console.log(`${Object.keys(looks).length} faces in ${out}`);
