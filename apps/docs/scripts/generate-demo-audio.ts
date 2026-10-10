/*
 * Generates the Audio Player's demo sounds: three short pieces, their covers, and the peaks of each.
 *
 * WHY GENERATED. A demo needs files that are ours to ship (no licence line to carry, nothing to fetch) and small enough to
 * keep in the repo. Each piece is a few notes of additive synthesis, written to a 16-bit mono WAV by hand, so this needs no
 * encoder and no dependency. The PEAKS are measured from the very samples written, which is the honest way to show the
 * waveform: they are the file's, not a drawing of a wave.
 *
 *   node scripts/generate-demo-audio.ts   writes public/audio/*.wav, public/audio/*.svg, src/demos/audio-peaks.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../public/audio");
mkdirSync(out, { recursive: true });

const RATE = 11025;
const PEAKS = 96;

/* A note name to its frequency, A4 = 440. */
const hz = (note: string): number => {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const match = /^([A-G]#?)(\d)$/.exec(note);
  if (!match) throw new Error(`bad note ${note}`);
  const semitones = names.indexOf(match[1]!) + (Number(match[2]) - 4) * 12 - 9;
  return 440 * 2 ** (semitones / 12);
};

type Piece = {
  readonly file: string;
  readonly seconds: number;
  /** [note, start in beats, length in beats, loudness 0 to 1] */
  readonly notes: ReadonlyArray<readonly [string, number, number, number]>;
  readonly bpm: number;
  readonly hue: number;
};

const arpeggio = (chord: readonly string[], from: number, loud = 0.8): Array<[string, number, number, number]> =>
  chord.flatMap((note, i) => [[note, from + i * 0.5, 2, loud - i * 0.08] as [string, number, number, number]]);

const pieces: Piece[] = [
  {
    file: "morning-light",
    seconds: 20,
    bpm: 84,
    hue: 48,
    notes: [
      ...arpeggio(["C4", "E4", "G4", "C5", "G4", "E4"], 0),
      ...arpeggio(["A3", "C4", "E4", "A4", "E4", "C4"], 3),
      ...arpeggio(["F3", "A3", "C4", "F4", "C4", "A3"], 6),
      ...arpeggio(["G3", "B3", "D4", "G4", "D4", "B3"], 9),
      ...arpeggio(["C4", "E4", "G4", "C5", "E5", "C5"], 12, 0.95),
      ["C3", 0, 12, 0.5],
      ["C3", 12, 6, 0.55],
    ],
  },
  {
    file: "slow-tide",
    seconds: 20,
    bpm: 60,
    hue: 214,
    notes: [
      ["A2", 0, 8, 0.7], ["E3", 0, 8, 0.45], ["A3", 1, 3, 0.6], ["C4", 2, 3, 0.65], ["E4", 3.5, 4, 0.7],
      ["F2", 8, 8, 0.7], ["C3", 8, 8, 0.45], ["A3", 9, 3, 0.6], ["C4", 10, 3, 0.65], ["D4", 11.5, 4, 0.75],
      ["G2", 16, 8, 0.7], ["D3", 16, 8, 0.45], ["B3", 17, 3, 0.6], ["D4", 18, 3, 0.65], ["G4", 19.5, 4, 0.8],
    ],
  },
  {
    file: "paper-planes",
    seconds: 20,
    bpm: 132,
    hue: 330,
    notes: Array.from({ length: 22 }, (_, i): [string, number, number, number] => {
      const scale = ["C5", "D5", "E5", "G5", "A5", "G5", "E5", "D5"];
      return [scale[i % scale.length]!, i * 0.75, 1.5, 0.55 + 0.3 * Math.abs(Math.sin(i / 3))];
    }).concat([["C3", 0, 6, 0.5], ["G3", 6, 6, 0.5], ["A3", 12, 6, 0.5], ["F3", 18, 6, 0.5]]),
  },
];

const synth = (piece: Piece): Float32Array => {
  const total = Math.round(piece.seconds * RATE);
  const mix = new Float32Array(total);
  const beat = 60 / piece.bpm;
  for (const [note, startBeat, beats, loud] of piece.notes) {
    const f = hz(note);
    const start = Math.round(startBeat * beat * RATE);
    const length = Math.min(Math.round(beats * beat * RATE), total - start);
    for (let i = 0; i < length; i += 1) {
      const t = i / RATE;
      const attack = Math.min(1, t / 0.008);
      const decay = Math.exp(-t * (f > 400 ? 2.4 : 1.1));
      const tone = Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(4 * Math.PI * f * t) + 0.2 * Math.sin(6 * Math.PI * f * t);
      mix[start + i]! += tone * attack * decay * loud * 0.18;
    }
  }
  /* A fade at both ends, so a loop or a cut never clicks. */
  const fade = Math.round(0.4 * RATE);
  for (let i = 0; i < fade; i += 1) {
    mix[i]! *= i / fade;
    mix[total - 1 - i]! *= i / fade;
  }
  let loudest = 0;
  for (const v of mix) loudest = Math.max(loudest, Math.abs(v));
  const gain = loudest > 0 ? 0.85 / loudest : 1;
  for (let i = 0; i < total; i += 1) mix[i]! *= gain;
  return mix;
};

const wav = (samples: Float32Array): Buffer => {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
};

/* The loudest sample of each share, scaled so the loudest share is 1: what a waveform shows, measured. */
const peaksOf = (samples: Float32Array): number[] => {
  const per = Math.floor(samples.length / PEAKS);
  const raw = Array.from({ length: PEAKS }, (_, i) => {
    let loudest = 0;
    for (let j = i * per; j < (i + 1) * per; j += 1) loudest = Math.max(loudest, Math.abs(samples[j]!));
    return loudest;
  });
  const top = Math.max(...raw, 1e-9);
  return raw.map((v) => Number((v / top).toFixed(2)));
};

/* A cover is a flat gradient with one shape: a picture to hold the place of artwork, drawn in the colour of its piece. */
const cover = (hue: number): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 62%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 62% 36%)"/></linearGradient></defs><rect width="240" height="240" fill="url(#g)"/><circle cx="120" cy="120" r="62" fill="none" stroke="hsl(${hue} 90% 94% / .7)" stroke-width="10"/><circle cx="120" cy="120" r="14" fill="hsl(${hue} 90% 94% / .9)"/></svg>\n`;

const peaks: Record<string, number[]> = {};
for (const piece of pieces) {
  const samples = synth(piece);
  writeFileSync(resolve(out, `${piece.file}.wav`), wav(samples));
  writeFileSync(resolve(out, `${piece.file}.svg`), cover(piece.hue));
  peaks[piece.file] = peaksOf(samples);
}
writeFileSync(resolve(here, "../src/demos/audio-peaks.json"), `${JSON.stringify(peaks)}\n`);
console.log(`✓ ${pieces.length} pieces, covers and peaks written`);
