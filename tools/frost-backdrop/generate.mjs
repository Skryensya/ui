/*
 * Renders the frosted backdrop as a still: dark satin folds with film grain, no dependencies.
 *
 *   node generate.mjs <width> <height> <seed> <out.png>
 *
 * A height field is warped twice (domain warping) so the folds flow instead of blobbing, then lit from one
 * side: the shading comes from the field's slope, which is what makes a smooth surface read as satin. Grain is
 * added last, per pixel, strongest in the mid-tones where film grain shows.
 */
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const [width = 1920, height = 1080, seed = 7, out = "backdrop.png"] = process.argv.slice(2).map((v, i) => (i < 3 ? Number(v) : v));

/* --- seeded gradient noise ------------------------------------------------------------------ */
function mulberry(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry(seed * 9973 + 1);
const perm = new Uint8Array(512);
const grads = new Float32Array(512 * 2);
{
  const base = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i++) {
    perm[i] = base[i & 255];
    const angle = (perm[i] / 256) * Math.PI * 2;
    grads[i * 2] = Math.cos(angle);
    grads[i * 2 + 1] = Math.sin(angle);
  }
}
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
function noise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const x0 = xi & 255;
  const y0 = yi & 255;
  const corner = (cx, cy, dx, dy) => {
    const h = perm[perm[x0 + cx] + y0 + cy];
    return grads[h * 2] * dx + grads[h * 2 + 1] * dy;
  };
  const u = fade(xf);
  const v = fade(yf);
  const a = corner(0, 0, xf, yf) + u * (corner(1, 0, xf - 1, yf) - corner(0, 0, xf, yf));
  const b = corner(0, 1, xf, yf - 1) + u * (corner(1, 1, xf - 1, yf - 1) - corner(0, 1, xf, yf - 1));
  return a + v * (b - a);
}
function fbm(x, y, octaves = 3) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return sum;
}

/* --- the satin field -------------------------------------------------------------------------- */
const SCALE = 0.62; // folds per screen height: low means broad folds
function field(px, py) {
  const x = (px / height) * SCALE;
  const y = (py / height) * SCALE;
  const qx = fbm(x + 1.7, y + 9.2, 2);
  const qy = fbm(x + 8.3, y + 2.8, 2);
  const rx = fbm(x + 2.4 * qx + 5.2, y + 2.4 * qy + 1.3, 2);
  const ry = fbm(x + 2.4 * qx + 1.7, y + 2.4 * qy + 9.2, 2);
  return fbm(x + 2.6 * rx, y + 2.6 * ry, 2);
}

/* GRAIN=0 renders the smooth satin alone, for the animated SVG, which lays its own live grain over it. */
const GRAIN = Number(process.env.GRAIN ?? 1);
/* TINT="r,g,b" leans the silver toward a hue: each channel's share of the light (1,1,1 is neutral). */
const TINT = (process.env.TINT ?? "1,1,1").split(",").map(Number);
/* LIGHT=1 renders pale satin (pearl, mist, blush): the same folds lifted into the upper half of the range, for an example that needs a bright picture, such as a wash that holds white text. */
const PALE = process.env.LIGHT === "1";
const SLOPE_GAIN = Number(process.env.GAIN ?? 0.5);
const LIGHT = [0.62, -0.78]; // from the top-right
const EPS = 1.5;
const pixels = Buffer.alloc(width * height * 3);
const grain = mulberry(seed * 31 + 5);
const gauss = () => (grain() + grain() + grain() + grain() - 2) * 1.7;

for (let py = 0; py < height; py++) {
  for (let px = 0; px < width; px++) {
    const h = field(px, py);
    const dx = (field(px + EPS, py) - h) / EPS;
    const dy = (field(px, py + EPS) - h) / EPS;
    /* Slope toward the light, scaled to the image so every size has the same folds. */
    const slope = (dx * LIGHT[0] + dy * LIGHT[1]) * height * SLOPE_GAIN;
    /* Satin: a soft diffuse term plus a tight sheen where the slope faces the light head-on. */
    const diffuse = Math.min(1, Math.max(0, 0.34 + slope * 1.05));
    const sheen = Math.pow(Math.min(1, Math.max(0, slope * 1.6)), 2.6) * 0.5;
    /* A vignette keeps the corners deep so a frosted component in the middle has room to glow. */
    const nx = px / width - 0.5;
    const ny = py / height - 0.5;
    const vignette = 1 - Math.min(1, (nx * nx + ny * ny) * 1.15);
    let lum = (Math.pow(diffuse, 1.5) * 0.9 + sheen) * (0.55 + 0.45 * vignette);
    /* A soft shoulder: the brightest ridge stays a pale silver, never a clipped white. */
    lum = Math.tanh(lum * 1.15) * 0.88;
    if (PALE) lum = 0.66 + 0.33 * lum;
    /* Film grain: biggest in the mid-tones, nearly absent in true black and in highlights. */
    const midtones = 4 * lum * (1 - lum);
    lum += gauss() * (0.045 + 0.1 * midtones) * GRAIN;
    lum = Math.min(1, Math.max(0, lum));
    const i = (py * width + px) * 3;
    /* Neutral by default, with the faintest cool lean in the shadows; TINT leans the highlights toward a hue. */
    pixels[i] = Math.round(255 * Math.min(1, lum * 0.985 * TINT[0]));
    pixels[i + 1] = Math.round(255 * Math.min(1, lum * 0.995 * TINT[1]));
    pixels[i + 2] = Math.round(255 * Math.min(1, lum * TINT[2] + (PALE ? 0 : (1 - lum) * 0.018)));
  }
}

/* --- PNG ------------------------------------------------------------------------------------ */
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};
const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8; // bit depth
header[9] = 2; // RGB
const stride = width * 3;
const raw = Buffer.alloc((stride + 1) * height);
for (let y = 0; y < height; y++) pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]));
console.log(`${out}: ${width}x${height}`);
