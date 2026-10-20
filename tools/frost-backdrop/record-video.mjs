/*
 * Records a looping clip of the satin in motion, no dependencies beyond Playwright's Chromium:
 *
 *   node record-video.mjs <playwright-path> <name> <seed> <r,g,b> <width> <height> <seconds> <fps> <out-dir> [<mbps>]
 *
 * The same folds as `generate.mjs`, drawn by a fragment shader. Time moves the noise around a circle, so the last frame
 * lands exactly where the first began and the clip loops with no seam. Each frame is rendered at `t = i / fps`, handed to the
 * browser's own VP9 encoder (WebCodecs) with that timestamp, and the encoded frames are written into a WebM by `muxWebm`
 * below. Nothing here is real-time: a slow machine takes longer to render, and the clip still plays at exactly `fps`, at the
 * bitrate asked for. (MediaRecorder, which this used first, stamps frames with the clock and caps the quality it spends.)
 * Writes <name>.webm and <name>-poster.jpg (a frame from the middle of the clip, for a thumbnail or a poster).
 */
import { mkdirSync, writeFileSync } from "node:fs";

const [pwPath, name, seed, tint, width, height, seconds, fps, outDir, mbps = "q30"] = process.argv.slice(2);
const { default: pw } = await import(`${pwPath}/index.js`);
mkdirSync(outDir, { recursive: true });

const browser = await pw.chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
page.on("console", (m) => console.log("[page]", m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
/* WebCodecs only exists in a secure context, which a page set from a string is not: serve the canvas from an https origin that never leaves the machine. */
await page.route("https://frost.invalid/", (route) => route.fulfill({ contentType: "text/html", body: `<canvas id="c" width="${width}" height="${height}"></canvas>` }));
await page.goto("https://frost.invalid/");

const result = await page.evaluate(
  async ({ seed, tint, width, height, seconds, fps, mbps }) => {
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    const vs = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
    const fs = `
precision highp float;
uniform vec2 u_res; uniform float u_phase; uniform float u_seed; uniform float u_frame; uniform vec3 u_tint;
vec2 hash2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
  float a = dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0));
  float b = dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0));
  float c = dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0));
  float d = dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm2(vec2 p){ return 0.5*noise(p) + 0.25*noise(p*2.0); }
float field(vec2 p){
  vec2 s = vec2(u_seed * 7.31, u_seed * 3.17);
  vec2 orbit = vec2(cos(u_phase), sin(u_phase));
  vec2 orbit2 = vec2(cos(u_phase + 2.1), sin(u_phase + 2.1));
  vec2 q = vec2(fbm2(p + vec2(1.7, 9.2) + s + 0.18*orbit), fbm2(p + vec2(8.3, 2.8) + s - 0.18*orbit2));
  vec2 r = vec2(fbm2(p + 2.4*q + vec2(5.2, 1.3) + 0.13*orbit2), fbm2(p + 2.4*q + vec2(1.7, 9.2) - 0.13*orbit));
  return fbm2(p + 2.6*r);
}
float rnd(vec2 p){ return fract(sin(dot(p + fract(u_frame * 0.6180339) * 97.0, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 frag = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 p = frag / u_res.y * 0.62;
  float e = 0.012;
  float h = field(p);
  float dx = (field(p + vec2(e, 0.0)) - h) / e;
  float dy = (field(p + vec2(0.0, e)) - h) / e;
  /* d/dp of the field, times the scale and the slope gain the still uses (0.62 * 0.5). */
  float slope = (dx * 0.62 + dy * -0.78) * 0.62 * 0.5;
  float diffuse = clamp(0.34 + slope * 1.05, 0.0, 1.0);
  float sheen = pow(clamp(slope * 1.6, 0.0, 1.0), 2.6) * 0.5;
  vec2 n = frag / u_res - 0.5;
  float vig = 1.0 - min(1.0, dot(n, n) * 1.15);
  float lum = (pow(diffuse, 1.5) * 0.9 + sheen) * (0.55 + 0.45 * vig);
  float ex = exp(-2.0 * lum * 1.15);
  lum = (1.0 - ex) / (1.0 + ex) * 0.88;
  float mid = 4.0 * lum * (1.0 - lum);
  float g = (rnd(frag) + rnd(frag + 17.0) + rnd(frag + 31.0) + rnd(frag + 53.0) - 2.0) * 1.7;
  lum = clamp(lum + g * (0.014 + 0.03 * mid), 0.0, 1.0);
  gl_FragColor = vec4(vec3(lum * 0.985, lum * 0.995, lum + (1.0 - lum) * 0.018) * u_tint, 1.0);
}`;
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.viewport(0, 0, width, height);
    const u = (n) => gl.getUniformLocation(prog, n);
    gl.uniform2f(u("u_res"), width, height);
    gl.uniform1f(u("u_seed"), seed);
    const [tr, tg, tb] = tint.split(",").map(Number);
    gl.uniform3f(u("u_tint"), tr, tg, tb);
    const draw = (frame, total) => {
      gl.uniform1f(u("u_phase"), (frame / total) * Math.PI * 2);
      /* The grain is redrawn every third frame, about the pace of real film grain: a fresh field of noise every frame is what a video codec cannot compress, and spends its whole budget on. */
      gl.uniform1f(u("u_frame"), Math.floor(frame / 3));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const total = Math.round(seconds * fps);
    const encoded = [];
    const encoder = new VideoEncoder({
      output: (chunk) => {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        encoded.push({ key: chunk.type === "key", at: chunk.timestamp / 1000, data });
      },
      error: (e) => console.log("encoder error", e.message),
    });
    /* "q30" asks for constant quality (a quantizer, 0 best to 63 worst) instead of a bitrate: the clip spends what each frame needs, so a calm stretch is not starved and a busy one is not wasted on. */
    const quantizer = String(mbps).startsWith("q") ? Number(String(mbps).slice(1)) : null;
    encoder.configure({ codec: "vp09.00.10.08", width, height, framerate: fps, latencyMode: "quality", ...(quantizer === null ? { bitrate: mbps * 1e6, bitrateMode: "variable" } : { bitrateMode: "quantizer" }) });
    let poster = "";
    const started = performance.now();
    for (let i = 0; i < total; i++) {
      draw(i, total);
      gl.finish();
      if (i === Math.floor(total * 0.35)) poster = canvas.toDataURL("image/jpeg", 0.92);
      const frame = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / fps) });
      encoder.encode(frame, { keyFrame: i % fps === 0, ...(quantizer === null ? {} : { vp9: { quantizer } }) });
      frame.close();
      /* Let the encoder's queue drain: a render far ahead of it would hold every raw frame in memory. */
      while (encoder.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 5));
    }
    await encoder.flush();
    encoder.close();

    /* ---- WebM: EBML header, then one Segment of Info, Tracks, a Cluster per keyframe, and Cues to seek by ---- */
    const bytes = (...parts) => {
      const flat = parts.flat();
      const out = new Uint8Array(flat.reduce((n, p) => n + p.length, 0));
      let at = 0;
      for (const p of flat) { out.set(p, at); at += p.length; }
      return out;
    };
    const uint = (n) => { const o = []; do { o.unshift(n & 0xff); n = Math.floor(n / 256); } while (n > 0); return Uint8Array.from(o); };
    const float64 = (n) => { const b = new Uint8Array(8); new DataView(b.buffer).setFloat64(0, n); return b; };
    const text = (t) => new TextEncoder().encode(t);
    const size = (n) => { let w = 1; while (n >= 2 ** (7 * w) - 1) w++; const o = new Uint8Array(w); let r = n; for (let i = w - 1; i >= 0; i--) { o[i] = r & 0xff; r = Math.floor(r / 256); } o[0] |= 0x80 >> (w - 1); return o; };
    const el = (id, ...payload) => { const body = bytes(...payload); return bytes(Uint8Array.from(id), size(body.length), body); };
    const header = el([0x1a, 0x45, 0xdf, 0xa3],
      el([0x42, 0x86], uint(1)), el([0x42, 0xf7], uint(1)), el([0x42, 0xf2], uint(4)), el([0x42, 0xf3], uint(8)),
      el([0x42, 0x82], text("webm")), el([0x42, 0x87], uint(4)), el([0x42, 0x85], uint(2)));
    const info = el([0x15, 0x49, 0xa9, 0x66], el([0x2a, 0xd7, 0xb1], uint(1000000)), el([0x44, 0x89], float64(Math.round((total * 1000) / fps))), el([0x4d, 0x80], text("skryensya/ui frost-backdrop")), el([0x57, 0x41], text("skryensya/ui frost-backdrop")));
    const tracks = el([0x16, 0x54, 0xae, 0x6b], el([0xae], el([0xd7], uint(1)), el([0x73, 0xc5], uint(1)), el([0x83], uint(1)), el([0x86], text("V_VP9")), el([0xe0], el([0xb0], uint(width)), el([0xba], uint(height)))));
    const clusters = [];
    for (const chunk of encoded) {
      if (chunk.key || clusters.length === 0) clusters.push({ at: Math.round(chunk.at), blocks: [] });
      const cluster = clusters[clusters.length - 1];
      const rel = Math.round(chunk.at) - cluster.at;
      cluster.blocks.push(el([0xa3], Uint8Array.from([0x81, (rel >> 8) & 0xff, rel & 0xff, chunk.key ? 0x80 : 0x00]), chunk.data));
    }
    const clusterEls = clusters.map((c) => el([0x1f, 0x43, 0xb6, 0x75], el([0xe7], uint(c.at)), ...c.blocks));
    /* Cue positions are relative to the start of the Segment's data: after Info and Tracks, and each cluster before it. */
    let position = info.length + tracks.length;
    const cuePoints = clusters.map((c, i) => {
      const point = el([0xbb], el([0xb3], uint(c.at)), el([0xb7], el([0xf7], uint(1)), el([0xf1], uint(position))));
      position += clusterEls[i].length;
      return point;
    });
    const cues = el([0x1c, 0x53, 0xbb, 0x6b], ...cuePoints);
    const file = bytes(header, el([0x18, 0x53, 0x80, 0x67], info, tracks, ...clusterEls, cues));
    let bin = "";
    for (let i = 0; i < file.length; i += 0x8000) bin += String.fromCharCode(...file.subarray(i, i + 0x8000));
    const mime = "video/webm;codecs=vp09";
    const bytesOut = file;
    return { mime, ms: Math.round(performance.now() - started), video: btoa(bin), poster: poster.split(",")[1], size: bytesOut.length };
  },
  { seed: Number(seed), tint, width: Number(width), height: Number(height), seconds: Number(seconds), fps: Number(fps), mbps },
);
writeFileSync(`${outDir}/${name}.webm`, Buffer.from(result.video, "base64"));
writeFileSync(`${outDir}/${name}-poster.jpg`, Buffer.from(result.poster, "base64"));
console.log(`${name}: ${result.mime}, ${(result.size / 1e6).toFixed(1)} MB, rendered and encoded in ${result.ms} ms for ${seconds}s`);
await browser.close();
