/*
 * THE VALUE EVALUATOR: one CSS value, after its var() chain is substituted, to the number or colour
 * Figma needs.
 *
 * Figma variables hold literals and aliases, never formulas, so a token authored as
 * `round(calc(var(--scale-space-4) * var(--sk-density)), 2px)` can only reach Figma as the number it
 * evaluates to under a stated evaluation context. This module is that evaluation and nothing else:
 * a closed set of CSS functions (calc, min, max, clamp, round, light-dark, color-mix, oklch and its
 * relative form), and a thrown `Unsupported` for everything outside it. Nothing is approximated: a
 * value it cannot evaluate exactly is reported, never guessed.
 *
 * WHY NOT core's evalColor: it answers the contrast question, which is opaque by definition, so it
 * drops alpha and has no `transparent`. Figma needs the alpha: `color-mix(X 28%, transparent)` is X
 * at 28% opacity, and evalColor returns X. The colour maths itself (oklch → sRGB) is core's.
 */

import { oklchToOklab, oklchToSrgb, splitTopLevel } from "@skryensya/core/parse";

export class Unsupported extends Error {}

export type Mode = "light" | "dark";

/** sRGB, 0..1 per channel, rounded so the manifest's bytes do not move with float noise. */
export type Rgba = { r: number; g: number; b: number; a: number };

export type Quantity = { value: number; unit: "" | "px" | "%" };

// ── var() substitution ─────────────────────────────────────────────────────────────────────────

/** A custom property's value, or `undefined` when nothing declares it. */
export type Lookup = (name: string) => string | undefined;

/** Each `name(`…`)` call in `text`, outermost first, with its argument text and its span. */
function calls(text: string, name: string) {
  const out: { start: number; end: number; inner: string }[] = [];
  const re = new RegExp(`(?<![\\w-])${name}\\(`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === "(") depth++;
      else if (text[i] === ")") depth--;
    }
    out.push({ start: m.index, end: i, inner: text.slice(m.index + m[0].length, i - 1) });
    re.lastIndex = i;
  }
  return out;
}

/** The first top-level comma, respecting parens, or -1. */
function topComma(text: string) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    else if (text[i] === "," && depth === 0) return i;
  }
  return -1;
}

/** `var(--x)` or `var(--x, fallback)`, split. */
export function parseVar(inner: string): { name: string; fallback: string | undefined } {
  const comma = topComma(inner);
  const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
  return { name, fallback: comma < 0 ? undefined : inner.slice(comma + 1).trim() };
}

/**
 * Replace every var() with its value, recursively, the way the browser's computed-value step does.
 * `initial` is the guaranteed-invalid value, so it takes the fallback like an undeclared name.
 * `keep` stops the substitution at a name (the caller wants to bind it, not inline it).
 */
export function substitute(text: string, lookup: Lookup, keep: (name: string) => boolean = () => false, depth = 0): string {
  if (depth > 32) throw new Unsupported(`var() cycle in ${text}`);
  const found = calls(text, "var");
  if (found.length === 0) return text;
  let out = "";
  let at = 0;
  for (const call of found) {
    const { name, fallback } = parseVar(call.inner);
    out += text.slice(at, call.start);
    at = call.end;
    if (keep(name)) {
      out += `var(${name})`;
      continue;
    }
    const raw = lookup(name);
    const value = raw === undefined || raw.trim() === "initial" ? fallback : raw;
    if (value === undefined) throw new Unsupported(`${name} is not declared and has no fallback`);
    out += substitute(value, lookup, keep, depth + 1);
  }
  return out + text.slice(at);
}

/** Pick one branch of every `light-dark()`, innermost included. */
export function pickMode(text: string, mode: Mode): string {
  const found = calls(text, "light-dark");
  if (found.length === 0) return text;
  let out = "";
  let at = 0;
  for (const call of found) {
    const branches = splitTopLevel(call.inner);
    if (branches.length !== 2) throw new Unsupported(`light-dark() needs two branches: ${call.inner}`);
    out += text.slice(at, call.start) + pickMode(branches[mode === "light" ? 0 : 1], mode);
    at = call.end;
  }
  return out + text.slice(at);
}

// ── numbers ────────────────────────────────────────────────────────────────────────────────────

/**
 * `calc`/`min`/`max`/`clamp`/`round` over px, %, rem and unitless numbers. `rem` is the one unit
 * that needs the evaluation context (the root font size); everything else is exact.
 */
export function evalQuantity(text: string, rootFontSize = 16): Quantity {
  const tokens = tokenize(text.trim());
  let pos = 0;

  const peek = () => tokens[pos];
  const take = (expect?: string) => {
    const t = tokens[pos++];
    if (expect !== undefined && t !== expect) throw new Unsupported(`expected ${expect} in ${text}`);
    if (t === undefined) throw new Unsupported(`unexpected end of ${text}`);
    return t;
  };

  const add = (a: Quantity, b: Quantity, sign: 1 | -1): Quantity => {
    if (a.unit === b.unit || a.value === 0 || b.value === 0) {
      const unit = a.unit || b.unit;
      if ((a.unit && b.unit && a.unit !== b.unit)) throw new Unsupported(`cannot add ${a.unit} and ${b.unit} in ${text}`);
      return { value: a.value + sign * b.value, unit };
    }
    throw new Unsupported(`cannot add ${a.unit || "number"} and ${b.unit || "number"} in ${text}`);
  };

  function expr(): Quantity {
    let left = term();
    while (peek() === "+" || peek() === "-") {
      const op = take();
      left = add(left, term(), op === "+" ? 1 : -1);
    }
    return left;
  }

  function term(): Quantity {
    let left = factor();
    while (peek() === "*" || peek() === "/") {
      const op = take();
      const right = factor();
      if (op === "*") {
        if (left.unit && right.unit) throw new Unsupported(`cannot multiply two lengths in ${text}`);
        left = { value: left.value * right.value, unit: left.unit || right.unit };
      } else {
        if (right.unit) throw new Unsupported(`cannot divide by a length in ${text}`);
        left = { value: left.value / right.value, unit: left.unit };
      }
    }
    return left;
  }

  function args(): Quantity[] {
    const out = [expr()];
    while (peek() === ",") {
      take(",");
      out.push(expr());
    }
    take(")");
    return out;
  }

  function sameUnit(values: Quantity[]) {
    const units = new Set(values.filter((v) => v.value !== 0).map((v) => v.unit));
    if (units.size > 1) throw new Unsupported(`mixed units in ${text}`);
    return [...units][0] ?? values[0].unit;
  }

  function factor(): Quantity {
    const t = take();
    if (t === "-") {
      const q = factor();
      return { value: -q.value, unit: q.unit };
    }
    if (t === "(") {
      const q = expr();
      take(")");
      return q;
    }
    if (t === "calc(") {
      const q = expr();
      take(")");
      return q;
    }
    if (t === "min(" || t === "max(") {
      const values = args();
      const unit = sameUnit(values);
      const pick = t === "min(" ? Math.min : Math.max;
      return { value: pick(...values.map((v) => v.value)), unit };
    }
    if (t === "clamp(") {
      const [lo, mid, hi] = args();
      const unit = sameUnit([lo, mid, hi]);
      return { value: Math.max(lo.value, Math.min(mid.value, hi.value)), unit };
    }
    if (t === "round(") {
      let strategy = "nearest";
      if (["nearest", "up", "down", "to-zero"].includes(peek() ?? "")) {
        strategy = take();
        take(",");
      }
      const values = args();
      const [a, step = { value: 1, unit: a.unit }] = values;
      const unit = sameUnit([a, step]);
      const n = a.value / step.value;
      const r =
        strategy === "up" ? Math.ceil(n) : strategy === "down" ? Math.floor(n) : strategy === "to-zero" ? Math.trunc(n) : Math.round(n);
      return { value: r * step.value, unit };
    }
    const num = /^(-?\d*\.?\d+(?:e-?\d+)?)(px|rem|%)?$/i.exec(t);
    if (num) {
      const value = parseFloat(num[1]);
      const unit = (num[2] ?? "").toLowerCase();
      if (unit === "rem") return { value: value * rootFontSize, unit: "px" };
      return { value, unit: unit as Quantity["unit"] };
    }
    throw new Unsupported(`not a number: ${t} in ${text}`);
  }

  const result = expr();
  if (pos !== tokens.length) throw new Unsupported(`trailing input in ${text}`);
  return result;
}

function tokenize(text: string): string[] {
  const out: string[] = [];
  const re = /\s*(?:([a-z][a-z-]*\()|(-?\d*\.?\d+(?:e-?\d+)?(?:px|rem|%)?)|([a-z][a-z-]*)|([-+*/(),]))/giy;
  let m: RegExpExecArray | null;
  while (re.lastIndex < text.length && (m = re.exec(text))) out.push((m[1] ?? m[2] ?? m[3] ?? m[4]).toLowerCase());
  if (re.lastIndex < text.trimEnd().length) throw new Unsupported(`cannot read ${text}`);
  return out;
}

// ── colours ────────────────────────────────────────────────────────────────────────────────────

/** Oklab with straight (not premultiplied) alpha: the space color-mix() interpolates in. */
type Oklab = { L: number; a: number; b: number; alpha: number };

const NAMED: Record<string, Oklab> = {
  transparent: { L: 0, a: 0, b: 0, alpha: 0 },
  white: { L: 1, a: 0, b: 0, alpha: 1 },
  black: { L: 0, a: 0, b: 0, alpha: 1 },
};

function alphaOf(text: string | undefined): number {
  if (text === undefined) return 1;
  const q = evalQuantity(text);
  return q.unit === "%" ? q.value / 100 : q.value;
}

function fromOklch(L: number, C: number, H: number, alpha: number): Oklab {
  const { a, b } = oklchToOklab({ L, C, H, toString: () => "" });
  return { L, a, b, alpha };
}

function toOklch({ L, a, b }: Oklab) {
  const C = Math.hypot(a, b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

/** Split on top-level whitespace, respecting parens. */
export function splitSpaces(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of text.trim()) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (/\s/.test(ch) && depth === 0) {
      if (cur) out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/** `channels / alpha`, split at the top-level slash only: a relative colour's base has its own. */
function splitAlpha(inner: string): [string, string | undefined] {
  let depth = 0;
  for (let i = inner.length - 1; i >= 0; i--) {
    if (inner[i] === ")") depth++;
    else if (inner[i] === "(") depth--;
    else if (inner[i] === "/" && depth === 0) return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
  }
  return [inner.trim(), undefined];
}

function evalOklab(text: string): Oklab {
  const t = text.trim();
  const named = NAMED[t.toLowerCase()];
  if (named) return named;

  const oklch = calls(t, "oklch")[0];
  if (oklch && oklch.start === 0 && oklch.end === t.length) {
    const [channels, alpha] = splitAlpha(oklch.inner);
    const parts = splitSpaces(channels);
    if (parts[0] === "from") {
      // Relative colour. Only the identity channels are supported (`l c h`); the alpha may change.
      const base = evalOklab(parts[1]);
      if (parts.slice(2).join(" ") !== "l c h") throw new Unsupported(`relative oklch channels: ${t}`);
      return { ...base, alpha: alpha === undefined ? base.alpha : alphaOf(alpha) };
    }
    if (parts.length !== 3) throw new Unsupported(`oklch(): ${t}`);
    const L = parts[0].endsWith("%") ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
    const C = parseFloat(parts[1]);
    const H = parts[2] === "none" ? 0 : parseFloat(parts[2]);
    if ([L, C, H].some(Number.isNaN)) throw new Unsupported(`oklch(): ${t}`);
    return fromOklch(L, C, H, alphaOf(alpha));
  }

  const mix = calls(t, "color-mix")[0];
  if (mix && mix.start === 0 && mix.end === t.length) return evalMix(mix.inner);

  throw new Unsupported(`not a colour this evaluator reads: ${t}`);
}

/** A colour-mix argument: `COLOR [PERCENT]`, where the percent may itself be a min()/max(). */
function mixArg(arg: string): { color: Oklab; pct: number | null } {
  const parts = splitSpaces(arg);
  if (parts.length > 1) {
    try {
      const q = evalQuantity(parts.at(-1)!);
      if (q.unit === "%") return { color: evalOklab(parts.slice(0, -1).join(" ")), pct: q.value };
    } catch (error) {
      if (!(error instanceof Unsupported)) throw error;
    }
  }
  return { color: evalOklab(arg), pct: null };
}

/* sRGB (gamma-encoded) ↔ Oklab, for `color-mix(in srgb, …)`: the one space the state layer mixes in. */
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function srgbToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToSrgb(c: Oklab) {
  const { L, C, H } = toOklch(c);
  return oklchToSrgb({ L, C, H, toString: () => "" });
}

/** CSS Color 5 color-mix(): premultiplied interpolation, and a weight sum under 100% scales alpha. */
function evalMix(inner: string): Oklab {
  const parts = splitTopLevel(inner);
  const space = /^in\s+(oklab|oklch|srgb)$/.exec(parts[0]?.trim() ?? "");
  if (parts.length !== 3 || !space) throw new Unsupported(`color-mix(${inner})`);
  const a = mixArg(parts[1]);
  const b = mixArg(parts[2]);
  const pa = a.pct ?? (b.pct === null ? 50 : 100 - b.pct);
  const pb = b.pct ?? (a.pct === null ? 50 : 100 - a.pct);
  const sum = pa + pb;
  if (sum <= 0) throw new Unsupported(`color-mix weights sum to 0: ${inner}`);
  const t = pb / sum;
  const alpha = a.color.alpha * (1 - t) + b.color.alpha * t;
  const scale = Math.min(sum, 100) / 100;

  if (alpha === 0) return { L: 0, a: 0, b: 0, alpha: 0 };

  if (space[1] === "srgb") {
    const ra = oklabToSrgb(a.color);
    const rb = oklabToSrgb(b.color);
    const pm = (ch: "r" | "g" | "b") => (ra[ch] * a.color.alpha * (1 - t) + rb[ch] * b.color.alpha * t) / alpha;
    return { ...srgbToOklab(pm("r"), pm("g"), pm("b")), alpha: alpha * scale };
  }

  if (space[1] === "oklab") {
    const pm = (ch: "L" | "a" | "b") => (a.color[ch] * a.color.alpha * (1 - t) + b.color[ch] * b.color.alpha * t) / alpha;
    return { L: pm("L"), a: pm("a"), b: pm("b"), alpha: alpha * scale };
  }

  // oklch: L and C premultiplied, hue by the shorter arc; a powerless hue takes the other one's.
  const ca = toOklch(a.color);
  const cb = toOklch(b.color);
  const hueA = ca.C < 1e-6 ? cb.H : ca.H;
  const hueB = cb.C < 1e-6 ? ca.H : cb.H;
  let dh = hueB - hueA;
  if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const L = (ca.L * a.color.alpha * (1 - t) + cb.L * b.color.alpha * t) / alpha;
  const C = (ca.C * a.color.alpha * (1 - t) + cb.C * b.color.alpha * t) / alpha;
  return fromOklch(L, C, hueA + dh * t, alpha * scale);
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

/** A colour expression (vars already substituted, one mode already picked) to sRGB + alpha. */
export function evalColor(text: string): Rgba {
  const lab = evalOklab(text);
  const { L, C, H } = toOklch(lab);
  const { r, g, b } = oklchToSrgb({ L, C, H, toString: () => "" });
  return { r: round4(r), g: round4(g), b: round4(b), a: round4(Math.max(0, Math.min(1, lab.alpha))) };
}

/** True when the text reads as a colour, without throwing. */
export function isColor(text: string): boolean {
  try {
    evalColor(text);
    return true;
  } catch (error) {
    if (error instanceof Unsupported) return false;
    throw error;
  }
}
