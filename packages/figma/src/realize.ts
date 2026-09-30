/*
 * CSS → FIGMA, one element at a time. Nothing in here knows it is looking at a Button: it reads the
 * cascaded declarations of a flex host and says what auto-layout frame, paints and effects draw it.
 * The component-specific decisions (which slot holds what) are the Figma realization's, not this.
 */

import { evalQuantity, pickMode, splitSpaces, substitute, Unsupported } from "./evaluate.js";
import { splitTopLevel } from "@skryensya/core/parse";
import type { Bound, Box, Effect, Frame, Paint, Rgba, Text } from "./manifest-types.js";
import { evaluateAs, expandComposite, resolve, substituted, type Context } from "./resolve.js";

const asNumber = (b: Bound<unknown> | undefined) => b as Bound<number> | undefined;
const asColor = (b: Bound<unknown> | undefined) => b as Bound<Rgba> | undefined;
const ZERO: Bound<number> = { value: 0, expression: "0" };

function prop(ctx: Context, name: string) {
  return ctx.computed.get(name);
}

function number(ctx: Context, name: string, role: string): Bound<number> | undefined {
  const value = prop(ctx, name);
  return value === undefined ? undefined : asNumber(resolve(withoutEm(value, ctx), "number", ctx, role));
}

const EM = /(^|[^\w.])(\d*\.?\d+)em\b/g;

/** A font size in `em` is the PARENT's font size times it (Code's 0.9em): the page's, as inherited. */
function fontSizeOf(value: string, ctx: Context): string {
  const text = /var\(/.test(value) ? substituted(value, ctx) : value;
  EM.lastIndex = 0;
  if (!EM.test(text)) return value;
  EM.lastIndex = 0;
  const parent = evalQuantity(substituted(ctx.inherited?.["font-size"] ?? "16px", ctx));
  if (parent.unit !== "px") throw new Unsupported(`inherited font-size ${parent.value}${parent.unit} for an em size`);
  return text.replace(EM, (_, before: string, n: string) => `${before}${Number(n) * parent.value}px`);
}

/**
 * `em` is the element's own font size, a unit Figma has no equivalent for (a Kbd's `min-height:
 * 1.6em` keeps a key square at any text size). Made pixels here, as the browser computes it: the
 * value stops being a binding, which is what an em measure is anyway, relative to its text.
 */
function withoutEm(value: string, ctx: Context): string {
  const text = /var\(/.test(value) ? substituted(value, ctx) : value;
  if (!EM.test(text)) return value;
  EM.lastIndex = 0;
  // The element's own size, itself possibly in em of its parent's (Code: 0.9em, padding 0.3em).
  const size = evalQuantity(substituted(fontSizeOf(prop(ctx, "font-size") ?? ctx.inherited?.["font-size"] ?? "16px", ctx), ctx));
  if (size.unit !== "px") throw new Unsupported(`font-size ${size.value}${size.unit} for an em measure`);
  return text.replace(EM, (_, before: string, n: string) => `${before}${Number(n) * size.value}px`);
}

const ALIGN: Record<string, Frame["mainAlign"]> = {
  center: "CENTER",
  start: "MIN",
  "flex-start": "MIN",
  end: "MAX",
  "flex-end": "MAX",
  "space-between": "SPACE_BETWEEN",
};

/* ── background → fills ────────────────────────────────────────────────────────────────────────── */

function gradient(inner: string, ctx: Context, role: string): Paint | undefined {
  const args = splitTopLevel(inner);
  let angle = 180;
  if (/^to\s/.test(args[0])) {
    const dir: Record<string, number> = { "to top": 0, "to right": 90, "to bottom": 180, "to left": 270 };
    angle = dir[args.shift()!.trim()] ?? NaN;
  } else if (/deg$/.test(args[0])) angle = parseFloat(args.shift()!);
  if (Number.isNaN(angle)) throw new Unsupported(`gradient direction: ${inner}`);

  const stops = args.map((arg) => {
    const parts = splitSpaces(arg);
    const last = parts.at(-1)!;
    return /%$/.test(last) && parts.length > 1
      ? { color: parts.slice(0, -1).join(" "), position: parseFloat(last) / 100 }
      : { color: arg.trim(), position: undefined as number | undefined };
  });

  // Two identical stops and no positions is a flat colour dressed as an image (`--elevation-wash-*`):
  // it binds like one.
  if (stops.every((s) => s.color === stops[0].color && s.position === undefined)) {
    const color = asColor(resolve(stops[0].color, "color", ctx, role));
    return color && { type: "SOLID", color };
  }

  const positioned = stops.map((s, i) => ({ ...s, position: s.position ?? i / Math.max(1, stops.length - 1) }));
  const lookup = (name: string) => ctx.computed.get(name) ?? ctx.registry.rootLookup(name);
  ctx.registry.diagnose({
    severity: "info",
    code: "GRADIENT_LITERAL",
    subject: role,
    message: "gradient stops are evaluated in the light mode and not bound to variables",
  });
  return {
    type: "GRADIENT_LINEAR",
    angle,
    stops: positioned.map((s) => ({ position: s.position, color: evaluateAs("color", substitute(s.color, lookup), "light") as Rgba })),
    expression: `linear-gradient(${inner})`,
  };
}

/** CSS lists the top layer first and the colour under everything; Figma lists bottom first. */
function fills(ctx: Context, role = "fill"): Paint[] {
  const raw = prop(ctx, "background");
  if (raw === undefined) return [];
  const text = expandComposite(raw, ctx).trim();
  const layers = splitTopLevel(text);
  const images: Paint[] = [];
  let color: Paint | undefined;
  layers.forEach((layer, index) => {
    for (const piece of splitSpaces(layer)) {
      if (piece === "none") continue;
      const grad = /^linear-gradient\(([\s\S]*)\)$/.exec(piece);
      if (grad) {
        const paint = gradient(grad[1], ctx, "wash");
        if (paint) images.push(paint);
        continue;
      }
      if (index !== layers.length - 1) throw new Unsupported(`a colour outside the last background layer: ${text}`);
      const bound = asColor(resolve(piece, "color", ctx, role));
      if (bound) color = { type: "SOLID", color: bound };
    }
  });
  return [...(color ? [color] : []), ...images.reverse()];
}

/* ── box-shadow / backdrop-filter → effects ─────────────────────────────────────────────────────── */

function isLength(piece: string, ctx: Context): boolean {
  try {
    const lookup = (name: string) => ctx.computed.get(name) ?? ctx.registry.rootLookup(name);
    evalQuantity(pickMode(substitute(piece, lookup), "light"));
    return true;
  } catch {
    return false;
  }
}

function effects(ctx: Context): Effect[] {
  const out: Effect[] = [];
  const shadow = prop(ctx, "box-shadow");
  if (shadow !== undefined) {
    const text = expandComposite(shadow, ctx).trim();
    if (text && text !== "none") {
      splitTopLevel(text).forEach((layer, i) => {
        const pieces = splitSpaces(layer);
        const inset = pieces.includes("inset");
        const rest = pieces.filter((p) => p !== "inset");
        const lengths = rest.filter((p) => isLength(p, ctx));
        const colors = rest.filter((p) => !lengths.includes(p));
        if (colors.length !== 1 || lengths.length < 2) {
          ctx.registry.diagnose({ severity: "warning", code: "SHADOW_UNSUPPORTED", subject: "box-shadow", message: layer });
          return;
        }
        if (colors[0] === "transparent") return;
        const role = `shadow-${i + 1}`;
        const color = asColor(resolve(colors[0], "color", ctx, `${role}-color`));
        const [x, y, blur, spread] = [0, 1, 2, 3].map((n) =>
          lengths[n] === undefined ? ZERO : asNumber(resolve(lengths[n], "number", ctx, `${role}-${["x", "y", "blur", "spread"][n]}`)),
        );
        if (!color || !x || !y || !blur || !spread) return;
        out.push({ type: inset ? "INNER_SHADOW" : "DROP_SHADOW", x, y, blur, spread, color });
      });
    }
  }

  const backdrop = prop(ctx, "backdrop-filter");
  if (backdrop !== undefined) {
    const text = expandComposite(backdrop, ctx).trim();
    for (const fn of splitSpaces(text)) {
      const blur = /^blur\(([\s\S]*)\)$/.exec(fn);
      if (blur) {
        const radius = asNumber(resolve(blur[1], "number", ctx, "backdrop-blur"));
        if (radius) out.push({ type: "BACKGROUND_BLUR", radius });
      } else if (fn && fn !== "none") {
        ctx.registry.diagnose({ severity: "info", code: "FILTER_UNSUPPORTED", subject: "backdrop-filter", message: `${fn} has no Figma equivalent` });
      }
    }
  }
  return out;
}

/* ── the frame ────────────────────────────────────────────────────────────────────────────────── */

/** An element's column tracks (`auto minmax(0, 1fr)` is two), substituted; none when it declares none. */
export function gridTracks(ctx: Context): string[] {
  const template = prop(ctx, "grid-template-columns");
  if (!template || template === "none") return [];
  const text = /var\(/.test(template) ? substituted(template, ctx) : template;
  return splitSpaces(text).filter(Boolean);
}

const zeroAsHug = (bound: Bound<number> | undefined) => (bound && "value" in bound && bound.value === 0 ? undefined : bound);

const SIDE_NAMES = ["top", "right", "bottom", "left"] as const;

/**
 * A border on some sides only (a Separator's `border-block-start`): each side's weight, zero where it
 * draws none, in the one colour they share. Undefined when no side has a border of its own, so a
 * uniform border keeps its single weight.
 */
function sidedBorder(ctx: Context): { color: Bound<Rgba>; weights: NonNullable<Box["strokeSides"]> } | undefined {
  const drawn = SIDE_NAMES.filter((side) => {
    const style = prop(ctx, `border-${side}-style`);
    return style !== undefined && style !== "none";
  });
  if (drawn.length === 0) return undefined;
  const colors = new Set(drawn.map((side) => prop(ctx, `border-${side}-color`) ?? "currentColor"));
  if (colors.size > 1) throw new Unsupported(`sides with borders of different colours`);
  const color = asColor(resolve([...colors][0], "color", ctx, "border-color"));
  if (!color) return undefined;
  const weight = (side: (typeof SIDE_NAMES)[number]) =>
    drawn.includes(side) ? (number(ctx, `border-${side}-width`, `border-${side}-width`) ?? ZERO) : ZERO;
  return { color, weights: { top: weight("top"), right: weight("right"), bottom: weight("bottom"), left: weight("left") } };
}

export function frameOf(ctx: Context): Frame {
  // No `display` declared is the element's own: block for a `<p>` or an `<hr>`, drawn the same.
  const display = prop(ctx, "display") || "block";
  /*
   * A flex host maps to auto layout directly. A block or inline-block host (a Badge) lays its content
   * out as lines of text, which for one line is the same thing as a horizontal auto layout hugging it,
   * so it is drawn as one. A grid, or a table, has no auto-layout equivalent.
   */
  const flex = /flex/.test(display);
  /*
   * An IMPLICIT grid (no template of columns or rows) stacks its items one per row and places each
   * in its cell by `align-items` (down) and `justify-items` (across): a vertical auto layout aligned
   * the same way. An Avatar is one: `place-items: center` on a single initials run. A grid with a
   * template has tracks, which auto layout does not.
   */
  const grid = /grid/.test(display);
  if (grid && (prop(ctx, "grid-template-rows") || prop(ctx, "grid-template"))) {
    throw new Unsupported(`no auto-layout equivalent: a grid with row tracks`);
  }
  // Column tracks: one is the implicit stack again; several, laid across in one row (Callout's
  // icon then content), are a horizontal auto layout whose `fr` columns fill (see gridTracks).
  const across = grid && gridTracks(ctx).length > 1;
  if (!flex && !grid && !/^(inline-block|block|inline)$/.test(display)) throw new Unsupported(`no auto-layout equivalent: display ${display}`);
  const direction = across ? "HORIZONTAL" : grid || (flex && /column/.test(prop(ctx, "flex-direction") ?? "")) ? "VERTICAL" : "HORIZONTAL";

  const sides = sidedBorder(ctx);
  const borderStyle = prop(ctx, "border-style");
  const strokeColor = sides
    ? sides.color
    : borderStyle && borderStyle !== "none"
      ? asColor(resolve(prop(ctx, "border-color") ?? "currentColor", "color", ctx, "border-color"))
      : undefined;
  const padding = (side: string) => number(ctx, `padding-${side}`, `padding-${side}`) ?? ZERO;

  return {
    direction,
    // A stacking grid's items sit by align-items down its column and justify-items across it; a grid
    // laid across aligns them down its row by align-items, as flex does.
    mainAlign: ALIGN[(grid && !across ? prop(ctx, "align-items") : prop(ctx, "justify-content")) ?? "start"] ?? "MIN",
    crossAlign: (ALIGN[(grid && !across ? prop(ctx, "justify-items") : prop(ctx, "align-items")) ?? "start"] ?? "MIN") as Frame["crossAlign"],
    width: number(ctx, "width", "width"),
    // `block-size: 0` with a border (a Separator's rule) is as tall as the border: what a hug makes it.
    height: zeroAsHug(number(ctx, "height", "height")),
    minHeight: number(ctx, "min-height", "min-height"),
    minWidth: number(ctx, "min-width", "min-width"),
    ...(Number(prop(ctx, "flex-grow") ?? 0) > 0 ? { grow: true as const } : {}),
    ...(prop(ctx, "align-self") === "stretch" ? { stretch: true as const } : {}),
    padding: { top: padding("top"), right: padding("right"), bottom: padding("bottom"), left: padding("left") },
    gap: number(ctx, "gap", "gap"),
    radius: number(ctx, "border-radius", "radius"),
    strokeWeight: strokeColor && !sides ? number(ctx, "border-width", "border-width") : undefined,
    ...(sides ? { strokeSides: sides.weights } : {}),
    strokes: strokeColor ? [{ type: "SOLID", color: strokeColor }] : [],
    fills: fills(ctx),
    effects: effects(ctx),
    // An outline is never clipped by its own element's overflow, so a ringed cell does not clip.
    clipsContent: /clip|hidden/.test(prop(ctx, "overflow") ?? "") && !hasOutline(ctx),
  };
}

export function textOf(ctx: Context): Text {
  // Through its hooks and tokens (`var(--sk-badge-line-height)` is `var(--scale-line-height-normal)`):
  // Figma stores a line height as a plain percentage, so it is read as the number it comes to.
  // What the element does not set it takes from the page it sits on (the stage's inherited values):
  // Code and Strong live inside prose and set almost nothing of their own.
  const read = (name: string, fallback: string) => prop(ctx, name) ?? ctx.inherited?.[name] ?? fallback;
  const authored = read("line-height", "normal");
  const lineHeight = /var\(/.test(authored) ? substituted(authored, ctx) : authored;
  // `normal` (a Link inherits it) is the font's own leading: Figma's Auto.
  if (lineHeight !== "normal" && !/^\d*\.?\d+$/.test(lineHeight)) throw new Unsupported(`line-height ${authored}: only unitless is read`);
  const decoration = `${prop(ctx, "text-decoration-line") ?? ""} ${prop(ctx, "text-decoration") ?? ""}`;
  const family = resolve(read("font-family", ""), "string", ctx, "font-family");
  const weight = resolve(read("font-weight", "400"), "number", ctx, "font-weight");
  const size = resolve(fontSizeOf(read("font-size", "16px"), ctx), "number", ctx, "font-size");
  const color = asColor(resolve(read("color", ""), "color", ctx, "fg"));
  if (!family || !weight || !size || !color) throw new Unsupported(`text needs family, weight, size and colour`);
  return {
    fontFamily: family as Bound<string>,
    fontWeight: weight as Bound<number>,
    fontSize: size as Bound<number>,
    lineHeight: lineHeight === "normal" ? "auto" : parseFloat(lineHeight) * 100,
    fill: { type: "SOLID", color },
    ...(/underline/.test(decoration) ? { underline: true as const } : {}),
  };
}

/** A glyph box: its square size and the colour its strokes take (`currentColor`). */
export function iconOf(ctx: Context) {
  const size = number(ctx, "width", "icon-size");
  const color = asColor(resolve("currentColor", "color", ctx, "icon-color"));
  if (!size || !color) throw new Unsupported(`icon needs a size and a colour`);
  return { size, color: { type: "SOLID", color } as Paint };
}

/**
 * A pseudo-element that paints: generated content, absolutely positioned over the whole host, with
 * a background. Drawn as a layer covering the host under its content. `undefined` for one that does
 * not paint (a hit area).
 */
export function overlayOf(ctx: Context): Paint[] | undefined {
  if (prop(ctx, "content") === undefined || prop(ctx, "position") !== "absolute") return undefined;
  if (!/^0(px)?$/.test(prop(ctx, "inset") ?? "")) return undefined;
  if (prop(ctx, "background") === undefined) return undefined;
  return fills(ctx, "state-layer");
}

const hasOutline = (ctx: Context) => {
  const style = prop(ctx, "outline-style");
  return style !== undefined && style !== "none";
};

/**
 * An outline, as the ring it draws: `width` wide, `offset` outside the border box, in its colour.
 * Figma has no outline, so it becomes a layer of its own; the gap the offset leaves stays empty.
 */
export function ringOf(
  ctx: Context,
): { width: Bound<number>; offset: Bound<number>; radius: Bound<number>; color: Paint } | undefined {
  if (!hasOutline(ctx)) return undefined;
  const width = asNumber(resolve(prop(ctx, "outline-width") ?? "0px", "number", ctx, "outline-width"));
  const offsetText = prop(ctx, "outline-offset") ?? "0px";
  const offset = asNumber(resolve(offsetText, "number", ctx, "outline-offset")) ?? ZERO;
  const color = asColor(resolve(prop(ctx, "outline-color") ?? "currentColor", "color", ctx, "outline-color"));
  // The ring's corners are the border's grown by the offset: a formula, so a variable of its own,
  // and a radius token change reaches the ring the way it reaches the border.
  const radius = asNumber(resolve(`calc(${prop(ctx, "border-radius") ?? "0px"} + ${offsetText})`, "number", ctx, "outline-radius"));
  if (!width || !color || !radius) return undefined;
  return { width, offset, radius, color: { type: "SOLID", color } };
}
