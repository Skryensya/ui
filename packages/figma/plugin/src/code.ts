/*
 * THE LOCAL SYNC PLUGIN: reads the compiled Figma manifest and reconciles the open file against it.
 *
 * It knows nothing about contracts, tokens or CSS; the compiler already turned those into
 * representation intent. What it owns is identity and idempotence:
 *
 *   - Everything it makes is tagged with shared plugin data (`skryensya` namespace): kind, id,
 *     schemaVersion, and the hashes that say whether it is current. Names are for people; the tags
 *     are how it finds its own objects again.
 *   - Missing → CREATE. Present and current → nothing is written. Present and stale → UPDATE IN
 *     PLACE, the same node, so instances elsewhere keep pointing at it.
 *   - A component or variable no longer in the manifest → tagged ORPHANED and left alone. Nothing a
 *     designer could have placed is deleted. (A component PROPERTY the manifest dropped is removed
 *     from its set: it is part of the definition being reconciled, not an object anyone placed.)
 *
 * "Dry run" walks the same path and writes nothing: every write goes through `run.write`.
 * Progress is reported per phase while it works, and the work yields regularly so the window can
 * actually repaint: Figma runs a plugin on the same thread as its own UI.
 */

import manifestJson from "../../../../artifacts/figma-manifest.json";
import type * as M from "../../src/manifest-types";

const manifest = manifestJson as unknown as M.FigmaManifest;
const NS = "skryensya";

/* ── the run: what happened, and the one door every write goes through ──────────────────────── */

type Action = "CREATE" | "UPDATE" | "NOOP" | "ORPHANED" | "WARN";

class Run {
  readonly entries: { action: Action; subject: string; detail?: string }[] = [];
  writes = 0;
  constructor(readonly apply: boolean) {}

  log(action: Action, subject: string, detail?: string) {
    this.entries.push({ action, subject, detail });
  }

  /** Performs `fn` only when applying. Returns whether it ran. */
  write(fn: () => void): boolean {
    this.writes++;
    if (this.apply) fn();
    return this.apply;
  }
}

/* ── progress ───────────────────────────────────────────────────────────────────────────────── */

type Phase = { id: string; label: string; total: number; done: number; state: "pending" | "running" | "done"; summary?: string };

class Progress {
  readonly phases: Phase[];
  private readonly started = Date.now();
  private lastPost = 0;
  private lastYield = 0;

  constructor(readonly apply: boolean, phases: { id: string; label: string; total: number }[]) {
    this.phases = phases.map((p) => ({ ...p, done: 0, state: "pending" }));
    this.post();
  }

  private phase(id: string) {
    const phase = this.phases.find((p) => p.id === id);
    if (!phase) throw new Error(`no phase ${id}`);
    return phase;
  }

  start(id: string) {
    this.phase(id).state = "running";
    this.post();
  }

  /** One unit of work done. Posts at most every 120ms, and yields every 50ms so the window can draw it. */
  async tick(id: string, n = 1) {
    const phase = this.phase(id);
    phase.done = Math.min(phase.total, phase.done + n);
    const now = Date.now();
    if (now - this.lastPost > 120) this.post();
    // Yield by time, not by count: often enough for the window to repaint, rarely enough to cost little.
    if (now - this.lastYield > 50) {
      this.lastYield = now;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  finish(id: string, summary: string) {
    const phase = this.phase(id);
    phase.done = phase.total;
    phase.state = "done";
    phase.summary = summary;
    this.post();
  }

  post() {
    this.lastPost = Date.now();
    figma.ui.postMessage({ type: "progress", apply: this.apply, elapsed: this.lastPost - this.started, phases: this.phases });
  }
}

const summarize = (counts: { created?: number; updated?: number; unchanged?: number; orphaned?: number }) =>
  [
    counts.created ? `${counts.created} created` : "",
    counts.updated ? `${counts.updated} updated` : "",
    counts.unchanged ? `${counts.unchanged} unchanged` : "",
    counts.orphaned ? `${counts.orphaned} orphaned` : "",
  ]
    .filter(Boolean)
    .join(" · ") || "nothing to do";

/* ── tags ───────────────────────────────────────────────────────────────────────────────────── */

const getTag = (node: PluginDataMixin, key: string) => node.getSharedPluginData(NS, key);

/** Tag only what differs, so a current object costs no writes. */
function tag(run: Run, node: PluginDataMixin, data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    if (getTag(node, key) !== value) run.write(() => node.setSharedPluginData(NS, key, value));
  }
}

const provenance = (kind: string, id: string) => ({ kind, id, schemaVersion: String(manifest.schemaVersion) });

/* ── values ─────────────────────────────────────────────────────────────────────────────────── */

const specs = new Map(manifest.variables.map((v) => [v.id, v]));

/** A manifest value followed through its aliases to a literal, for fields Figma needs a value in. */
function literalOf(id: string, mode: M.Mode = "light"): number | string | M.Rgba {
  let spec = specs.get(id);
  for (let guard = 0; spec && guard < 16; guard++) {
    const value = spec.values[mode];
    if (value.kind === "literal") return value.value;
    spec = specs.get(value.variable);
  }
  throw new Error(`variable ${id} does not resolve`);
}

const valueOf = <T,>(bound: M.Bound<T>): T => ("variable" in bound ? (literalOf(bound.variable) as T) : bound.value);

const close = (a: number, b: number) => Math.abs(a - b) < 1e-3;

function sameValue(want: M.VariableValue, figmaHave: unknown, ids: Map<string, Variable>): boolean {
  if (figmaHave === undefined) return false;
  if (want.kind === "alias") {
    const target = ids.get(want.variable);
    return (
      typeof figmaHave === "object" &&
      figmaHave !== null &&
      (figmaHave as VariableAlias).type === "VARIABLE_ALIAS" &&
      (figmaHave as VariableAlias).id === target?.id
    );
  }
  const v = want.value;
  if (typeof v === "number") return typeof figmaHave === "number" && close(figmaHave, v);
  if (typeof v === "string") return figmaHave === v;
  const c = figmaHave as RGBA;
  return typeof c === "object" && c !== null && "r" in c && close(c.r, v.r) && close(c.g, v.g) && close(c.b, v.b) && close(c.a ?? 1, v.a);
}

/* ── variables ──────────────────────────────────────────────────────────────────────────────── */

async function syncVariables(run: Run, progress: Progress): Promise<Map<string, Variable>> {
  progress.start("variables");
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const ownCollections = new Map(collections.filter((c) => getTag(c, "id")).map((c) => [getTag(c, "id"), c]));
  const modeIds = new Map<string, Partial<Record<M.Mode, string>>>();
  const byCollection = new Map<string, VariableCollection>();

  for (const spec of manifest.collections) {
    let collection = ownCollections.get(spec.id);
    if (!collection) {
      run.log("CREATE", `collection ${spec.name}`);
      if (!run.apply) continue;
      run.write(() => (collection = figma.variables.createVariableCollection(spec.name)));
    } else if (collection.name !== spec.name) {
      run.log("UPDATE", `collection ${spec.name}`, `renamed from ${collection.name}`);
      run.write(() => (collection!.name = spec.name));
    }
    const col = collection!;
    tag(run, col, provenance("variable-collection", spec.id));

    const ids: Partial<Record<M.Mode, string>> = {};
    spec.modes.forEach((mode, index) => {
      const label = mode[0].toUpperCase() + mode.slice(1);
      const found = col.modes.find((m) => m.name === label) ?? (index === 0 ? col.modes[0] : undefined);
      if (found) {
        if (found.name !== label) run.write(() => col.renameMode(found.modeId, label));
        ids[mode] = found.modeId;
        return;
      }
      try {
        run.write(() => (ids[mode] = col.addMode(label)));
        run.log("CREATE", `mode ${label} in ${spec.name}`);
      } catch (error) {
        run.log("WARN", `mode ${label} in ${spec.name}`, `not created (${String(error)}): its values are not written`);
      }
    });
    modeIds.set(spec.id, ids);
    byCollection.set(spec.id, col);
  }

  const existing = await figma.variables.getLocalVariablesAsync();
  const own = new Map(existing.filter((v) => getTag(v, "id")).map((v) => [getTag(v, "id"), v]));
  const out = new Map<string, Variable>();
  const created = new Set<string>();

  // First every variable exists, so an alias always has a target.
  for (const spec of manifest.variables) {
    let variable = own.get(spec.id);
    if (!variable) {
      created.add(spec.id);
      const collection = byCollection.get(spec.collection);
      if (!collection) continue;
      run.write(() => (variable = figma.variables.createVariable(spec.name, collection, spec.type)));
    } else if (variable.resolvedType !== spec.type) {
      run.log("WARN", `variable ${spec.name}`, `is ${variable.resolvedType}, the manifest says ${spec.type}; left alone`);
      continue;
    } else if (variable.name !== spec.name) {
      run.write(() => (variable!.name = spec.name));
    }
    if (variable) out.set(spec.id, variable);
  }

  let updated = 0;
  for (const spec of manifest.variables) {
    const variable = out.get(spec.id);
    await progress.tick("variables");
    if (!variable) continue;
    let changed = false;
    tag(run, variable, provenance("variable", spec.id));
    const ids = modeIds.get(spec.collection) ?? {};
    for (const mode of Object.keys(spec.values) as M.Mode[]) {
      const modeId = ids[mode];
      if (!modeId) continue;
      const want = spec.values[mode];
      if (sameValue(want, variable.valuesByMode[modeId], out)) continue;
      const target = want.kind === "alias" ? out.get(want.variable) : undefined;
      if (want.kind === "alias" && !target) continue;
      const value: VariableValue =
        want.kind === "alias" ? figma.variables.createVariableAlias(target!) : (want.value as RGBA | number | string);
      run.write(() => variable.setValueForMode(modeId, value));
      changed = true;
    }
    if (variable.description !== spec.expression) {
      run.write(() => (variable.description = spec.expression));
      changed = true;
    }
    if (spec.codeSyntax && variable.codeSyntax.WEB !== spec.codeSyntax) {
      run.write(() => variable.setVariableCodeSyntax("WEB", spec.codeSyntax));
      changed = true;
    }
    if (changed && !created.has(spec.id)) {
      updated++;
      run.log("UPDATE", `variable ${spec.name}`);
    }
  }

  let orphaned = 0;
  for (const [id, variable] of own) {
    if (specs.has(id) || getTag(variable, "orphaned") === "true") continue;
    orphaned++;
    run.log("ORPHANED", `variable ${variable.name}`);
    run.write(() => variable.setSharedPluginData(NS, "orphaned", "true"));
  }
  const counts = { created: created.size, updated, unchanged: manifest.variables.length - created.size - updated, orphaned };
  if (created.size) run.log("CREATE", `${created.size} variables`);
  if (counts.unchanged) run.log("NOOP", `${counts.unchanged} variables`);
  progress.finish("variables", summarize(counts));
  return out;
}

/* ── paints, effects, numbers ───────────────────────────────────────────────────────────────── */

type Ctx = { run: Run; progress: Progress; vars: Map<string, Variable> };

function variableFor(ctx: Ctx, bound: { variable: string }): Variable {
  const v = ctx.vars.get(bound.variable);
  if (!v) throw new Error(`no variable ${bound.variable}`);
  return v;
}

function toPaint(ctx: Ctx, paint: M.Paint): Paint {
  if (paint.type === "SOLID") {
    if ("variable" in paint.color) {
      const { r, g, b, a } = valueOf<M.Rgba>(paint.color);
      const base: SolidPaint = { type: "SOLID", color: { r, g, b }, opacity: a };
      return figma.variables.setBoundVariableForPaint(base, "color", variableFor(ctx, paint.color));
    }
    const { r, g, b, a } = paint.color.value;
    return { type: "SOLID", color: { r, g, b }, opacity: a };
  }
  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: gradientTransform(paint.angle),
    gradientStops: paint.stops.map((s) => ({ position: s.position, color: s.color })),
  };
}

/** CSS gradient angle → Figma's transform (gradient space runs along x). Quarter turns only. */
function gradientTransform(angle: number): Transform {
  switch (((angle % 360) + 360) % 360) {
    case 0:
      return [[0, -1, 1], [1, 0, 0]];
    case 90:
      return [[1, 0, 0], [0, 1, 0]];
    case 270:
      return [[-1, 0, 1], [0, -1, 1]];
    default:
      return [[0, 1, 0], [-1, 0, 1]];
  }
}

function toEffect(ctx: Ctx, effect: M.Effect): Effect {
  if (effect.type === "BACKGROUND_BLUR") {
    let out: Effect = { type: "BACKGROUND_BLUR", blurType: "NORMAL", radius: valueOf(effect.radius), visible: true };
    if ("variable" in effect.radius) out = figma.variables.setBoundVariableForEffect(out, "radius", variableFor(ctx, effect.radius));
    return out;
  }
  const { r, g, b, a } = valueOf(effect.color);
  let out: Effect =
    effect.type === "DROP_SHADOW"
      ? {
          type: "DROP_SHADOW",
          color: { r, g, b, a },
          offset: { x: valueOf(effect.x), y: valueOf(effect.y) },
          radius: valueOf(effect.blur),
          spread: valueOf(effect.spread),
          visible: true,
          blendMode: "NORMAL",
          showShadowBehindNode: false,
        }
      : {
          type: "INNER_SHADOW",
          color: { r, g, b, a },
          offset: { x: valueOf(effect.x), y: valueOf(effect.y) },
          radius: valueOf(effect.blur),
          spread: valueOf(effect.spread),
          visible: true,
          blendMode: "NORMAL",
        };
  const fields: [VariableBindableEffectField, M.Bound<unknown>][] = [
    ["color", effect.color],
    ["offsetX", effect.x],
    ["offsetY", effect.y],
    ["radius", effect.blur],
    ["spread", effect.spread],
  ];
  for (const [field, bound] of fields) {
    if ("variable" in bound) out = figma.variables.setBoundVariableForEffect(out, field, variableFor(ctx, bound));
  }
  return out;
}

type Bindable = SceneNode & { setBoundVariable(field: VariableBindableNodeField, v: Variable | null): void; boundVariables?: object };

/** A numeric field: bound to its variable, or set to the value and unbound. */
function setNumber(ctx: Ctx, node: Bindable, field: VariableBindableNodeField, bound: M.Bound<number> | undefined, fallback?: number) {
  const record = node as unknown as Record<string, unknown>;
  const boundVars = (node.boundVariables ?? {}) as Record<string, unknown>;
  if (bound && "variable" in bound) {
    const value = valueOf<number>(bound);
    if (field === "width" || field === "height") resizeField(node, field, value);
    node.setBoundVariable(field, variableFor(ctx, bound));
    return;
  }
  if (boundVars[field]) node.setBoundVariable(field, null);
  const value = bound ? bound.value : fallback;
  if (value === undefined) return;
  if (field === "width" || field === "height") resizeField(node, field, value);
  else record[field] = value;
}

function resizeField(node: SceneNode, field: "width" | "height", value: number) {
  const n = node as FrameNode;
  n.resize(field === "width" ? value : n.width, field === "height" ? value : n.height);
}

/* ── fonts ──────────────────────────────────────────────────────────────────────────────────── */

const WEIGHT_STYLE: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};
const loaded = new Map<string, FontName>();

async function fontFor(run: Run, family: string, weight: number): Promise<FontName> {
  const wanted = { family, style: WEIGHT_STYLE[weight] ?? "Regular" };
  const key = `${wanted.family}/${wanted.style}`;
  const hit = loaded.get(key);
  if (hit) return hit;
  try {
    await figma.loadFontAsync(wanted);
    loaded.set(key, wanted);
  } catch {
    const fallback = { family: "Inter", style: wanted.style === "SemiBold" ? "Semi Bold" : wanted.style };
    await figma.loadFontAsync(fallback);
    run.log("WARN", `font ${key}`, `not available in this file; ${fallback.family} ${fallback.style} used instead`);
    loaded.set(key, fallback);
  }
  return loaded.get(key)!;
}

/* ── grids ──────────────────────────────────────────────────────────────────────────────────── */

const parseKey = (key: string) => Object.fromEntries(key.split(", ").map((pair) => pair.split("=") as [string, string]));

function combos(axes: { name: string; values: string[] }[]): Record<string, string>[] {
  return axes.reduce<Record<string, string>[]>((acc, a) => acc.flatMap((c) => a.values.map((v) => ({ ...c, [a.name]: v }))), [{}]);
}

const ownCells = (set: ComponentSetNode | undefined) =>
  (set?.children ?? []).filter((c): c is ComponentNode => c.type === "COMPONENT" && getTag(c, "orphaned") !== "true");

/** Offsets along one axis of the grid: `size` per slot, `gap` between, `group` more where `groupOf` changes. */
function offsets(count: number, size: number, gap: number, group: number, groupOf: (i: number) => string, start: number) {
  const out: number[] = [];
  let at = start;
  for (let i = 0; i < count; i++) {
    if (i > 0) at += size + gap + (groupOf(i) !== groupOf(i - 1) ? group : 0);
    out.push(at);
  }
  return out;
}

function move(run: Run, node: SceneNode, x: number, y: number) {
  if (node.x !== x || node.y !== y) run.write(() => ((node.x = x), (node.y = y)));
}

function resizeTo(run: Run, node: FrameNode | ComponentSetNode, w: number, h: number) {
  if (Math.abs(node.width - w) > 0.5 || Math.abs(node.height - h) > 0.5) run.write(() => node.resizeWithoutConstraints(w, h));
}

/* ── the stage: pages, frames, labels ───────────────────────────────────────────────────────── */

const FRAME_PAD = 48;
const LABEL_GAP = 24;
const TITLE_SIZE = 24;
const GAP = 16;
const GROUP = 40;
const INNER = 24;

/*
 * Every label's line is fixed, not left to the font: a fixed line is what lets a frame's height be
 * known before anything in it is drawn, so frames can be made and stacked first.
 */
const lineOf = (size: number) => Math.ceil(size * 1.4);
const labelSize = () => Number(valueOf(manifest.stage.label.fontSize));
const headingSize = () => Math.round(labelSize() * 1.5);

/** The tallest variant of a set: each size's height, read from the manifest. */
const cellHeightOf = (spec: M.ComponentSet) =>
  Math.max(
    ...spec.cells.map((c) => {
      const box = manifest.styles.boxes[c.box];
      const h = box.height ?? box.minHeight;
      return h ? Number(valueOf(h)) : 0;
    }),
  );

/** Row offsets inside a set: a heading's space opens each section, a group gap each group within it. */
function rowOffsets(spec: M.ComponentSet, cellH: number) {
  const rows = combos(spec.grid.rows);
  const [sectionAxis, groupAxis] = spec.grid.rows.map((a) => a.name);
  const headH = lineOf(headingSize()) + 16;
  const rowY: number[] = [];
  const sections: { value: string; top: number; last: number }[] = [];
  let y = INNER;
  rows.forEach((row, i) => {
    if (i > 0) y += cellH + GAP;
    if (i === 0 || row[sectionAxis] !== rows[i - 1][sectionAxis]) {
      if (i > 0) y += GROUP;
      sections.push({ value: row[sectionAxis], top: y, last: i });
      y += headH;
    } else if (groupAxis && row[groupAxis] !== rows[i - 1][groupAxis]) y += GAP;
    sections[sections.length - 1].last = i;
    rowY.push(y);
  });
  return { rows, rowY, sections, sectionAxis };
}

/** Where a set starts in its frame, below the title and the two lines of column headings. */
const setTop = () => FRAME_PAD + lineOf(TITLE_SIZE) + LABEL_GAP + 2 * (lineOf(labelSize()) + 8);

const ICON_SLOT = 96;
const ICON_COLUMNS = 11;
const iconRowOf = (spec: M.IconSet) => spec.size + 8 + lineOf(labelSize()) + 24;
const iconTop = () => FRAME_PAD + lineOf(TITLE_SIZE) + LABEL_GAP;

/** A frame's height, known before it holds anything. */
function plannedHeight(spec: M.IconSet | M.ComponentSet): number {
  if (spec.kind === "icon-set") return iconTop() + Math.ceil(spec.icons.length / ICON_COLUMNS) * iconRowOf(spec) + FRAME_PAD;
  const cellH = cellHeightOf(spec);
  const { rowY } = rowOffsets(spec, cellH);
  return setTop() + rowY[rowY.length - 1] + cellH + INNER + FRAME_PAD;
}

type Label = { font: FontName; size: number; color: Paint };

/** The kit's own label style: family, weight, size and colour all from the stage's variables. */
async function labelStyle(ctx: Ctx, weight?: number, size?: number): Promise<Label> {
  const { label } = manifest.stage;
  const font = await fontFor(ctx.run, String(valueOf(label.fontFamily)), weight ?? Number(valueOf(label.fontWeight)));
  return { font, size: size ?? Number(valueOf(label.fontSize)), color: toPaint(ctx, { type: "SOLID", color: label.color }) };
}

/** A text of ours inside `parent`, found by its label key. Writes only what differs. */
function ensureLabel(ctx: Ctx, parent: FrameNode, key: string, chars: string, style: Label): TextNode {
  const { run } = ctx;
  let text = parent.children.find((n): n is TextNode => n.type === "TEXT" && getTag(n, "label") === key);
  if (!text) {
    run.write(() => {
      text = figma.createText();
      text.fontName = style.font;
      text.fontSize = style.size;
      text.lineHeight = { unit: "PIXELS", value: lineOf(style.size) };
      text.fills = [style.color];
      text.characters = chars;
      text.name = chars;
      text.setSharedPluginData(NS, "label", key);
      parent.appendChild(text);
    });
    return text!;
  }
  const t = text;
  const font = t.fontName as FontName;
  if (font.family !== style.font.family || font.style !== style.font.style) run.write(() => (t.fontName = style.font));
  if (t.fontSize !== style.size) run.write(() => (t.fontSize = style.size));
  const line = t.lineHeight as LineHeight;
  if (line.unit !== "PIXELS" || line.value !== lineOf(style.size)) run.write(() => (t.lineHeight = { unit: "PIXELS", value: lineOf(style.size) }));
  if (t.characters !== chars) run.write(() => ((t.characters = chars), (t.name = chars)));
  return t;
}

/** Remove our own labels and section outlines the layout no longer draws. They are chrome, not components. */
function pruneLabels(ctx: Ctx, parent: FrameNode, keep: Set<string>) {
  for (const node of [...parent.children]) {
    if ((node.type === "TEXT" || node.type === "RECTANGLE") && getTag(node, "label") && !keep.has(getTag(node, "label"))) {
      ctx.run.write(() => node.remove());
    }
  }
}

/** A section's outline: behind everything in the frame, stroked in the stage's divider colour. */
function ensureOutline(ctx: Ctx, parent: FrameNode, key: string, x: number, y: number, w: number, h: number) {
  const { run } = ctx;
  let rect = parent.children.find((n): n is RectangleNode => n.type === "RECTANGLE" && getTag(n, "label") === key);
  if (!rect) {
    run.write(() => {
      rect = figma.createRectangle();
      rect.name = key;
      rect.fills = [];
      rect.cornerRadius = 12;
      rect.strokeWeight = 1;
      rect.strokeAlign = "INSIDE";
      rect.strokes = [toPaint(ctx, { type: "SOLID", color: manifest.stage.divider })];
      rect.setSharedPluginData(NS, "label", key);
      parent.insertChild(0, rect);
    });
    if (!rect) return;
  }
  const r = rect;
  // Under the set, never over it: an outline drawn above would sit on top of the buttons.
  const setIndex = parent.children.findIndex((n) => n.type === "COMPONENT_SET");
  if (setIndex >= 0 && parent.children.indexOf(r) > setIndex) run.write(() => parent.insertChild(0, r));
  move(run, r, Math.round(x), Math.round(y));
  if (Math.abs(r.width - w) > 0.5 || Math.abs(r.height - h) > 0.5) run.write(() => r.resize(Math.round(w), Math.round(h)));
}

/** Bound to the stage's variable: the docs preview's own background, in whichever mode the file shows. */
function paintStage(ctx: Ctx, frame: FrameNode) {
  // A dry run has not created the variables a real sync would; that the fill would change is enough.
  const stage = manifest.stage.background;
  if ("variable" in stage && !ctx.vars.has(stage.variable)) {
    if (!ctx.run.apply) return void ctx.run.write(() => void 0);
  }
  const fill = (frame.fills as readonly Paint[])[0];
  const bound = fill?.type === "SOLID" ? fill.boundVariables?.color?.id : undefined;
  const want = "variable" in manifest.stage.background ? variableFor(ctx, manifest.stage.background).id : undefined;
  if (!bound || bound !== want) ctx.run.write(() => (frame.fills = [toPaint(ctx, { type: "SOLID", color: manifest.stage.background })]));
}

/** The documentation frame a drawing lives in, on the stage's background. */
function ensureFrame(ctx: Ctx, id: string, name: string, page: PageNode, found: Map<string, SceneNode>): FrameNode | undefined {
  const { run } = ctx;
  let frame = found.get(`frame:${id}`) as FrameNode | undefined;
  if (!frame) {
    run.log("CREATE", `frame ${name}`);
    if (!run.apply) return undefined;
    frame = figma.createFrame();
    frame.name = name;
    frame.clipsContent = false;
    frame.cornerRadius = 16;
    page.appendChild(frame);
    found.set(`frame:${id}`, frame);
  }
  const f = frame;
  if (f.parent !== page) run.write(() => page.appendChild(f));
  if (f.name !== name) run.write(() => (f.name = name));
  paintStage(ctx, f);
  tag(run, f, provenance("frame", `frame:${id}`));
  return f;
}

/* ── the Icon set ───────────────────────────────────────────────────────────────────────────── */

type IconCtx = { set: ComponentSetNode; byName: Map<string, ComponentNode>; spec: M.IconSet };

/** Import one icon's SVG into `node` as a single flattened `glyph` layer, replacing what was there. */
function drawIcon(node: ComponentNode, icon: M.IconSet["icons"][number], spec: M.IconSet) {
  node.name = `${spec.axis}=${icon.name}`;
  node.resize(spec.size, spec.size);
  node.fills = [];
  node.clipsContent = false;
  for (const child of [...node.children]) child.remove();
  const imported = figma.createNodeFromSvg(icon.svg);
  const parts = [...imported.children];
  for (const part of parts) node.appendChild(part);
  imported.remove();
  // One layer per icon, the same name in every variant, so a host's colour override survives a swap.
  const glyph = parts.length === 1 && parts[0].type === "VECTOR" ? parts[0] : figma.flatten(parts, node);
  glyph.name = "glyph";
  glyph.constraints = { horizontal: "SCALE", vertical: "SCALE" };
}

/** Icons on a grid, each named underneath: every slot is fixed, so each icon is placed as it is made. */
type IconLayout = { setX: number; setY: number; slot: number; rowH: number; columns: number; style: Label; keep: Set<string> };

async function planIcons(ctx: Ctx, frame: FrameNode, spec: M.IconSet): Promise<IconLayout> {
  const title = ensureLabel(ctx, frame, "title", spec.name, await labelStyle(ctx, 600, TITLE_SIZE));
  move(ctx.run, title, FRAME_PAD, FRAME_PAD);
  const style = await labelStyle(ctx);
  return {
    setX: FRAME_PAD,
    setY: iconTop(),
    slot: ICON_SLOT,
    rowH: iconRowOf(spec),
    columns: ICON_COLUMNS,
    style,
    keep: new Set(["title"]),
  };
}

function placeIconSet(run: Run, frame: FrameNode, set: ComponentSetNode, spec: M.IconSet, layout: IconLayout) {
  if (set.parent !== frame) run.write(() => frame.appendChild(set));
  move(run, set, layout.setX, layout.setY);
  const rows = Math.ceil(spec.icons.length / layout.columns);
  resizeTo(run, set, layout.columns * layout.slot, rows * layout.rowH);
  resizeTo(run, frame, layout.setX + layout.columns * layout.slot + FRAME_PAD, layout.setY + rows * layout.rowH + FRAME_PAD);
}

function placeIcon(ctx: Ctx, frame: FrameNode, layout: IconLayout, node: ComponentNode, index: number, name: string, size: number) {
  const col = index % layout.columns;
  const row = Math.floor(index / layout.columns);
  move(ctx.run, node, col * layout.slot + (layout.slot - size) / 2, row * layout.rowH);
  const key = `icon:${name}`;
  layout.keep.add(key);
  const text = ensureLabel(ctx, frame, key, name, layout.style);
  move(ctx.run, text, Math.round(layout.setX + col * layout.slot + (layout.slot - text.width) / 2), layout.setY + row * layout.rowH + size + 8);
}

async function syncIconSet(ctx: Ctx, spec: M.IconSet, found: Map<string, SceneNode>, page: PageNode | undefined): Promise<IconCtx | undefined> {
  const { run, progress } = ctx;
  progress.start("icons");
  const frame = page ? ensureFrame(ctx, spec.id, spec.name, page, found) : undefined;
  let set = found.get(spec.id) as ComponentSetNode | undefined;
  const existing = new Map(ownCells(set).map((c) => [getTag(c, "cell"), c]));
  const counts = { created: 0, updated: 0, unchanged: 0, orphaned: 0 };

  let layout: IconLayout | undefined;
  for (const [index, icon] of spec.icons.entries()) {
    const key = `${spec.axis}=${icon.name}`;
    let node = existing.get(key);
    if (!node) {
      counts.created++;
      if (run.write(() => void 0) && frame) {
        const fresh = figma.createComponent();
        drawIcon(fresh, icon, spec);
        fresh.setSharedPluginData(NS, "cell", key);
        fresh.setSharedPluginData(NS, "hash", icon.hash);
        // Into the set at once, so an interrupted run never leaves loose components on the page.
        // Onto the frame's page first: a component is born on whichever page is current.
        frame.appendChild(fresh);
        if (!set) set = figma.combineAsVariants([fresh], frame);
        else set.appendChild(fresh);
        node = fresh;
      }
    } else if (getTag(node, "hash") !== icon.hash) {
      counts.updated++;
      if (run.write(() => void 0)) {
        drawIcon(node, icon, spec);
        node.setSharedPluginData(NS, "hash", icon.hash);
      }
    } else counts.unchanged++;
    // In place at once: every slot is known before the first icon is drawn.
    if (run.apply && frame && set && node) {
      if (!layout) {
        layout = await planIcons(ctx, frame, spec);
        placeIconSet(run, frame, set, spec, layout);
      }
      placeIcon(ctx, frame, layout, node, index, icon.name, spec.size);
    }
    await progress.tick("icons");
  }
  const wanted = new Set(spec.icons.map((i) => `${spec.axis}=${i.name}`));
  for (const [key, node] of existing) {
    if (wanted.has(key)) continue;
    counts.orphaned++;
    run.log("ORPHANED", `${spec.name}: ${key}`, "no longer drawn; kept");
    run.write(() => node.setSharedPluginData(NS, "orphaned", "true"));
  }
  if (counts.created) run.log("CREATE", `${spec.name}: ${counts.created} icons`, spec.source);
  if (counts.updated) run.log("UPDATE", `${spec.name}: ${counts.updated} icons`, "in place");
  if (counts.unchanged) run.log("NOOP", `${spec.name}: ${counts.unchanged} icons`);

  if (!set || !frame) {
    progress.finish("icons", summarize(counts));
    return undefined;
  }
  const s = set;
  if (s.name !== spec.name) run.write(() => (s.name = spec.name));
  tag(run, s, { ...provenance("icon-set", spec.id), hash: spec.hash });
  if (layout) pruneLabels(ctx, frame, layout.keep);
  found.set(spec.id, s);
  progress.finish("icons", summarize(counts));
  const byName = new Map(ownCells(s).map((c) => [parseKey(getTag(c, "cell"))[spec.axis], c]));
  return { set: s, byName, spec };
}

/* ── the component sets ─────────────────────────────────────────────────────────────────────── */

type SetCtx = Ctx & { icons: IconCtx };

async function applyText(ctx: SetCtx, node: TextNode, text: M.Text, sample: string) {
  const family = String(valueOf(text.fontFamily));
  const weight = Number(valueOf(text.fontWeight));
  const font = await fontFor(ctx.run, family, weight);
  if (node.characters.length > 0 && node.fontName !== figma.mixed) await figma.loadFontAsync(node.fontName);
  node.fontName = font;
  if (!node.characters) node.characters = sample;
  node.textAutoResize = "WIDTH_AND_HEIGHT";
  node.lineHeight = { unit: "PERCENT", value: text.lineHeight };
  node.fontSize = Number(valueOf(text.fontSize));
  node.fills = [toPaint(ctx, text.fill)];
  const binds: [VariableBindableTextField, M.Bound<unknown>][] = [
    ["fontSize", text.fontSize],
    ["fontFamily", text.fontFamily],
    ["fontWeight", text.fontWeight],
  ];
  for (const [field, bound] of binds) {
    if (!("variable" in bound)) continue;
    try {
      node.setBoundVariable(field, variableFor(ctx, bound));
    } catch (error) {
      ctx.run.log("WARN", `text ${field}`, `not bound (${String(error)}); the value is set instead`);
    }
  }
}

/** An icon slot: an exposed instance of the Icon set, sized by the host and painted in its colour. */
async function applyIcon(ctx: SetCtx, node: InstanceNode, layer: Extract<M.Layer, { kind: "icon" }>) {
  const { spec, byName } = ctx.icons;
  const main = await node.getMainComponentAsync();
  // The component's own slot shows the slot's default glyph; an instance picks another from its panel.
  const wanted = byName.get(layer.default) ?? byName.get(spec.default)!;
  if (!main || main.id !== wanted.id) node.swapComponent(wanted);
  node.isExposedInstance = true;
  setNumber(ctx, node, "width", layer.icon.size);
  setNumber(ctx, node, "height", layer.icon.size);
  const glyph = node.findOne((n) => n.name === "glyph") as VectorNode | null;
  if (!glyph) return;
  const paint = toPaint(ctx, layer.icon.color);
  if (spec.paint === "stroke") {
    glyph.strokes = [paint];
    // Keep the drawing's stroke proportional, as an SVG scaled by its viewBox does.
    glyph.strokeWeight = (spec.strokeWidth * valueOf(layer.icon.size)) / spec.size;
  } else glyph.fills = [paint];
}

/**
 * A layer that covers the host, outside auto layout: the state layer exactly over it with the same
 * corners, or the focus ring `offset` outside it, stroked, with corners grown by the offset.
 */
function applyCover(ctx: SetCtx, host: ComponentNode, rect: RectangleNode, layer: Extract<M.Layer, { kind: "overlay" | "ring" }>, box: M.Box) {
  rect.layoutPositioning = "ABSOLUTE";
  const offset = layer.kind === "ring" ? Number(valueOf(layer.offset)) : 0;
  rect.x = -offset;
  rect.y = -offset;
  rect.resize(Math.max(0.01, host.width + 2 * offset), Math.max(0.01, host.height + 2 * offset));
  rect.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
  if (layer.kind === "overlay") {
    rect.fills = layer.fills.map((p) => toPaint(ctx, p));
    rect.strokes = [];
    for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const) {
      setNumber(ctx, rect, corner, box.radius, 0);
    }
  } else {
    rect.fills = [];
    rect.strokes = [toPaint(ctx, layer.color)];
    rect.strokeAlign = "OUTSIDE";
    setNumber(ctx, rect, "strokeWeight", layer.width);
    // An outline's corners follow the border's, grown by the offset: a sum no variable holds.
    rect.cornerRadius = (box.radius ? Number(valueOf(box.radius)) : 0) + offset;
  }
}

/** The three parts a cell points at, each by content hash: what a cell can change independently. */
type Part = "box" | "surface" | "layers";
const PARTS: readonly Part[] = ["box", "surface", "layers"];

/** Which parts of an existing cell differ from the manifest. A cell from before parts were tagged has all stale. */
const staleParts = (node: ComponentNode, cell: M.Cell): Part[] => PARTS.filter((part) => getTag(node, part) !== cell[part]);

/**
 * One cell, in place, rewriting only `parts`: its geometry, its surface, or its layers in the
 * template's slot order. A cell whose surface alone changed keeps every layer untouched.
 */
async function applyCell(ctx: SetCtx, node: ComponentNode, cell: M.Cell, sample: Record<string, string | boolean>, parts: readonly Part[] = PARTS) {
  if (node.name !== cell.key) node.name = cell.key;

  if (parts.includes("box")) {
    const box = manifest.styles.boxes[cell.box];
    node.layoutMode = box.direction;
    node.primaryAxisAlignItems = box.mainAlign;
    node.counterAxisAlignItems = box.crossAlign;
    node.primaryAxisSizingMode = box.width ? "FIXED" : "AUTO";
    node.counterAxisSizingMode = box.height ? "FIXED" : "AUTO";
    setNumber(ctx, node, "paddingTop", box.padding.top);
    setNumber(ctx, node, "paddingRight", box.padding.right);
    setNumber(ctx, node, "paddingBottom", box.padding.bottom);
    setNumber(ctx, node, "paddingLeft", box.padding.left);
    setNumber(ctx, node, "itemSpacing", box.gap, 0);
    for (const corner of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"] as const) {
      setNumber(ctx, node, corner, box.radius, 0);
    }
    setNumber(ctx, node, "minHeight", box.minHeight);
    setNumber(ctx, node, "width", box.width);
    setNumber(ctx, node, "height", box.height);
    node.strokeAlign = "INSIDE";
    setNumber(ctx, node, "strokeWeight", box.strokeWeight, 0);
    node.clipsContent = box.clipsContent;
  }

  if (parts.includes("surface")) {
    const surface = manifest.styles.surfaces[cell.surface];
    node.strokes = surface.strokes.map((p) => toPaint(ctx, p));
    node.fills = surface.fills.map((p) => toPaint(ctx, p));
    node.effects = surface.effects.map((e) => toEffect(ctx, e));
  }

  if (parts.includes("layers")) {
    const layers = manifest.styles.layers[cell.layers];
    // A layer this cell no longer draws (a focus ring after the state changed) goes: it is ours.
    const names = new Set(layers.map((l) => l.slot));
    for (const child of [...node.children]) if (!names.has(child.name)) child.remove();
    for (const [index, layer] of layers.entries()) {
      let child = node.findChild((n) => n.name === layer.slot);
      const wanted = layer.kind === "icon" ? "INSTANCE" : layer.kind === "text" ? "TEXT" : "RECTANGLE";
      if (child && child.type !== wanted) {
        ctx.run.log("UPDATE", `layer ${layer.slot} of ${cell.key}`, `replaced: ${child.type} → ${wanted}`);
        child.remove();
        child = null;
      }
      if (!child) {
        child =
          layer.kind === "icon"
            ? (ctx.icons.byName.get(layer.default) ?? ctx.icons.byName.get(ctx.icons.spec.default)!).createInstance()
            : layer.kind === "text"
              ? figma.createText()
              : figma.createRectangle();
        child.name = layer.slot;
      }
      // Move only a layer that is out of place: reinserting an in-place child is still a write.
      if (node.children[index] !== child) node.insertChild(index, child);
      if (layer.kind === "icon") {
        await applyIcon(ctx, child as InstanceNode, layer);
        // Born with the visibility its property defaults to: an optional slot is hidden until switched on.
        if (layer.visibleProperty) child.visible = sample[layer.visibleProperty] !== false;
      } else if (layer.kind === "text") await applyText(ctx, child as TextNode, layer.text, String(sample[layer.slot] ?? ""));
    }
    // Overlays and rings are sized off the host, so they go last, once its content has laid out.
    const box = manifest.styles.boxes[cell.box];
    for (const layer of layers) {
      if (layer.kind !== "overlay" && layer.kind !== "ring") continue;
      const rect = node.findChild((n) => n.name === layer.slot) as RectangleNode;
      applyCover(ctx, node, rect, layer, box);
    }
  }

  for (const part of parts) node.setSharedPluginData(NS, part, cell[part]);
  node.setSharedPluginData(NS, "hash", cell.hash);
}

/**
 * The set's component properties, by name → Figma's generated key. Adds, fixes, and removes the
 * ones the manifest no longer declares: they are part of the definition, not placed objects.
 */
function ensureProperties(ctx: SetCtx, set: ComponentSetNode, properties: M.ComponentProperty[]) {
  const keys: Record<string, string> = {};
  const wanted = new Set(properties.map((p) => p.name));
  for (const [key, def] of Object.entries(set.componentPropertyDefinitions)) {
    if (def.type === "VARIANT" || wanted.has(key.split("#")[0])) continue;
    ctx.run.log("UPDATE", `${set.name}: property ${key.split("#")[0]}`, "removed, no longer in the manifest");
    ctx.run.write(() => set.deleteComponentProperty(key));
  }
  for (const property of properties) {
    const defs = set.componentPropertyDefinitions;
    let key = Object.keys(defs).find((k) => k.split("#")[0] === property.name && defs[k].type === property.type);
    if (!key) {
      ctx.run.log("UPDATE", `${set.name}: property ${property.name}`, "added");
      ctx.run.write(() => (key = set.addComponentProperty(property.name, property.type, property.default)));
    } else if (defs[key].defaultValue !== property.default) {
      ctx.run.log("UPDATE", `${set.name}: property ${property.name}`, "default changed");
      ctx.run.write(() => (key = set.editComponentProperty(key!, { defaultValue: property.default })));
    }
    if (key) keys[property.name] = key;
  }
  return keys;
}

function bindReferences(ctx: SetCtx, node: ComponentNode, cell: M.Cell, keys: Record<string, string>, defaults: Record<string, string | boolean>) {
  for (const layer of manifest.styles.layers[cell.layers]) {
    const child = node.findChild((n) => n.name === layer.slot);
    if (!child) continue;
    const refs: Record<string, string> = {};
    if (layer.kind === "icon") {
      if (layer.visibleProperty && keys[layer.visibleProperty]) refs.visible = keys[layer.visibleProperty];
      // The component shows its layer as the property's default; binding alone does not change it.
      const shown = layer.visibleProperty ? defaults[layer.visibleProperty] !== false : true;
      if (child.visible !== shown) ctx.run.write(() => (child.visible = shown));
    } else if (layer.kind === "text" && keys[layer.textProperty]) refs.characters = keys[layer.textProperty];
    const have = (child.componentPropertyReferences ?? {}) as Record<string, string>;
    const same = Object.keys(refs).length === Object.keys(have).length && Object.entries(refs).every(([k, v]) => have[k] === v);
    if (!same) ctx.run.write(() => (child.componentPropertyReferences = refs));
  }
}

/**
 * Where everything in a set's documentation frame goes, worked out BEFORE the variants are drawn so
 * each one lands in place as it is made. Rows take the height the manifest gives each size; columns
 * take the width of the first variant drawn, which is the widest (largest size, with its label).
 * The outermost row axis draws as sections, the next as groups with extra space between.
 */
type Layout = {
  cols: Record<string, string>[];
  rows: Record<string, string>[];
  colX: number[];
  rowY: number[];
  cellW: number;
  cellH: number;
  setX: number;
  setY: number;
  sections: { value: string; top: number; last: number }[];
  sectionAxis: string;
  lineH: number;
  style: Label;
  strong: Label;
  heading: Label;
  keep: Set<string>;
};

const word = (axis: string, value: string) => (value === "true" || value === "false" ? `${axis}: ${value}` : value);

/** The frame's chrome (title, row and column labels) placed, and every slot's position computed. */
async function planLayout(ctx: Ctx, frame: FrameNode, spec: M.ComponentSet, cellW: number, cellH: number): Promise<Layout> {
  const { run } = ctx;
  const cols = combos(spec.grid.columns);
  const rows = combos(spec.grid.rows);
  const outerCol = spec.grid.columns[0].name;
  const sectionAxis = spec.grid.rows[0].name;
  const keep = new Set<string>(["title"]);
  const title = ensureLabel(ctx, frame, "title", spec.name, await labelStyle(ctx, 600, TITLE_SIZE));
  const style = await labelStyle(ctx);
  const strong = await labelStyle(ctx, 600);
  const heading = await labelStyle(ctx, 600, headingSize());
  const lineH = lineOf(style.size);
  const { rowY, sections } = rowOffsets(spec, cellH);
  const colX = offsets(cols.length, cellW, GAP, GROUP, (i) => cols[i][outerCol], INNER);

  // A row names what the section heading does not already say.
  const rowLabels = rows.map((row) => {
    const key = `row:${Object.values(row).join(",")}`;
    keep.add(key);
    const inner = Object.entries(row).filter(([axis]) => axis !== sectionAxis);
    return ensureLabel(ctx, frame, key, inner.map(([a, v]) => word(a, v)).join(" · "), style);
  });
  const labelW = Math.max(...rowLabels.map((t) => t.width));
  const setX = FRAME_PAD + 16 + labelW + LABEL_GAP;
  const setY = setTop();
  move(run, title, FRAME_PAD, FRAME_PAD);
  rowLabels.forEach((text, r) => move(run, text, FRAME_PAD + 16, Math.round(setY + rowY[r] + (cellH - text.height) / 2)));
  cols.forEach((col, i) => {
    const inner = Object.entries(col).filter(([axis]) => axis !== outerCol);
    const key = `col:${Object.values(col).join(",")}`;
    keep.add(key);
    move(run, ensureLabel(ctx, frame, key, inner.map(([a, v]) => word(a, v)).join(" · "), style), setX + colX[i], setY - lineH - 8);
    if (i === 0 || cols[i - 1][outerCol] !== col[outerCol]) {
      const groupKey = `colgroup:${col[outerCol]}`;
      keep.add(groupKey);
      move(run, ensureLabel(ctx, frame, groupKey, word(outerCol, col[outerCol]), strong), setX + colX[i], setY - 2 * (lineH + 8));
    }
  });
  return { cols, rows, colX, rowY, cellW, cellH, setX, setY, sections, sectionAxis, lineH, style, strong, heading, keep };
}

/** The variant drawn first: the first row across the first column, the widest in the set. */
function firstCellOf(spec: M.ComponentSet): M.Cell | undefined {
  const order = spec.axes.map((a) => a.name);
  const props = { ...combos(spec.grid.rows)[0], ...combos(spec.grid.columns)[0] };
  const key = order.map((a) => `${a}=${props[a]}`).join(", ");
  return spec.cells.find((c) => c.key === key);
}

/**
 * The first variant's size before it is drawn: read off it when it exists (so a sync with nothing to
 * change writes nothing), otherwise its padding plus its label, measured on a text made and removed.
 */
async function measureFirst(ctx: Ctx, spec: M.ComponentSet, set: ComponentSetNode | undefined): Promise<{ w: number; h: number }> {
  const cellH = cellHeightOf(spec);
  const first = firstCellOf(spec);
  if (!first) return { w: 0, h: cellH };
  const node = ownCells(set).find((c) => getTag(c, "cell") === first.key);
  if (node) return { w: Math.ceil(node.width), h: Math.max(cellH, Math.ceil(node.height)) };
  const box = manifest.styles.boxes[first.box];
  const label = manifest.styles.layers[first.layers].find((l) => l.kind === "text");
  const sample = spec.properties.find((p) => p.type === "TEXT" && label && p.name === label.slot)?.default;
  let textW = 0;
  if (label?.kind === "text" && typeof sample === "string") {
    const font = await fontFor(ctx.run, String(valueOf(label.text.fontFamily)), Number(valueOf(label.text.fontWeight)));
    ctx.run.write(() => {
      const probe = figma.createText();
      probe.fontName = font;
      probe.fontSize = Number(valueOf(label.text.fontSize));
      probe.lineHeight = { unit: "PERCENT", value: label.text.lineHeight };
      probe.textAutoResize = "WIDTH_AND_HEIGHT";
      probe.characters = sample;
      textW = probe.width;
      probe.remove();
    });
  }
  return { w: Math.ceil(Number(valueOf(box.padding.left)) + textW + Number(valueOf(box.padding.right))), h: cellH };
}

/** The showcase's width: each column is the first variant with that slot's icon and the gap before it. */
function showcaseWidth(spec: M.ComponentSet, cellW: number): number {
  const first = firstCellOf(spec);
  if (!first || !spec.showcase.columns.length) return 0;
  const box = manifest.styles.boxes[first.box];
  const gap = box.gap ? Number(valueOf(box.gap)) : 0;
  const widths = spec.showcase.columns.map((column) => {
    const icon = manifest.styles.layers[first.layers].find((l) => l.kind === "icon" && l.slot === column.slot);
    return cellW + (icon?.kind === "icon" ? gap + Number(valueOf(icon.icon.size)) : 0);
  });
  return widths.reduce((a, b) => a + b, 0) + 24 * (widths.length - 1);
}

/** A set's frame width, from its layout, before anything in it is drawn. */
const plannedWidth = (spec: M.ComponentSet, layout: Layout) =>
  layout.setX + layout.colX[layout.colX.length - 1] + layout.cellW + INNER + GROUP + showcaseWidth(spec, layout.cellW) + 16 + FRAME_PAD;

/** The set in its frame, at its final place and size, before its variants fill it. */
function placeSet(run: Run, frame: FrameNode, set: ComponentSetNode, layout: Layout) {
  if (set.parent !== frame) run.write(() => frame.appendChild(set));
  move(run, set, layout.setX, layout.setY);
  resizeTo(run, set, layout.colX[layout.colX.length - 1] + layout.cellW + INNER, layout.rowY[layout.rowY.length - 1] + layout.cellH + INNER);
}

/** What needs every variant: the default first, the showcase beside the rows, and the section outlines. */
async function finishLayout(ctx: SetCtx, frame: FrameNode, set: ComponentSetNode, spec: M.ComponentSet, layout: Layout) {
  const { run } = ctx;
  const first = ownCells(set).find((c) => getTag(c, "cell") === spec.defaultCell);
  if (first && set.children[0] !== first) run.write(() => set.insertChild(0, first));
  const { rows, rowY, cellH, setX, setY, lineH, style, strong, heading, keep } = layout;
  const showcaseRight = await layoutShowcase(ctx, frame, set, spec, rows, rowY, cellH, setX + set.width + GROUP, setY, lineH, style, strong, keep);
  const right = Math.max(setX + set.width, showcaseRight);
  for (const section of layout.sections) {
    const headKey = `section:${section.value}`;
    const outlineKey = `outline:${section.value}`;
    keep.add(headKey);
    keep.add(outlineKey);
    const top = setY + section.top;
    move(run, ensureLabel(ctx, frame, headKey, word(layout.sectionAxis, section.value), heading), FRAME_PAD + 16, Math.round(top + 8));
    const bottom = setY + rowY[section.last] + cellH + 12;
    ensureOutline(ctx, frame, outlineKey, FRAME_PAD, top - 4, right + 16 - FRAME_PAD, bottom - top + 4);
  }
  pruneLabels(ctx, frame, keep);
  resizeTo(run, frame, right + 16 + FRAME_PAD, setY + set.height + FRAME_PAD);
}

/** Instances of each row's rest variant with one optional slot on, in columns right of the set. */
async function layoutShowcase(
  ctx: SetCtx,
  frame: FrameNode,
  set: ComponentSetNode,
  spec: M.ComponentSet,
  rows: Record<string, string>[],
  rowY: number[],
  cellH: number,
  left: number,
  setY: number,
  lineH: number,
  style: Label,
  strong: Label,
  keep: Set<string>,
): Promise<number> {
  const { run } = ctx;
  const byKey = new Map(ownCells(set).map((c) => [getTag(c, "cell"), c]));
  const axisOrder = spec.axes.map((a) => a.name);
  const defs = set.componentPropertyDefinitions;
  const keyOf = (name: string) => Object.keys(defs).find((k) => k.split("#")[0] === name && defs[k].type === "BOOLEAN");
  const existing = new Map(
    frame.children.filter((n): n is InstanceNode => n.type === "INSTANCE" && getTag(n, "showcase") !== "").map((n) => [getTag(n, "showcase"), n]),
  );
  const drawn = new Set<string>();
  const instances: { node: InstanceNode; col: number; row: number }[] = [];

  for (const [col, column] of spec.showcase.columns.entries()) {
    for (const [row, combo] of rows.entries()) {
      const props = { ...combo, ...spec.showcase.base };
      const cellKey = axisOrder.map((a) => `${a}=${props[a]}`).join(", ");
      const main = byKey.get(cellKey);
      if (!main) continue;
      const tagKey = `${Object.values(combo).join(",")}:${column.slot}`;
      drawn.add(tagKey);
      let node = existing.get(tagKey);
      if (!node) {
        run.write(() => {
          node = main.createInstance();
          node.setSharedPluginData(NS, "showcase", tagKey);
          frame.appendChild(node);
        });
      } else if ((await node.getMainComponentAsync())?.id !== main.id) {
        const n = node;
        run.write(() => n.swapComponent(main));
      }
      if (!node) continue;
      const n = node;
      const want: Record<string, boolean> = {};
      for (const [name, value] of Object.entries(column.properties)) {
        const key = keyOf(name);
        if (key && n.componentProperties[key]?.value !== value) want[key] = value;
      }
      if (Object.keys(want).length) run.write(() => n.setProperties(want));
      const name = `${column.slot} · ${Object.values(combo).join(" · ")}`;
      if (n.name !== name) run.write(() => (n.name = name));
      instances.push({ node: n, col, row });
    }
  }
  for (const [key, node] of existing) if (!drawn.has(key)) run.write(() => node.remove());

  // Column by column, each as wide as its widest instance; rows aligned with the set's rows.
  let x = left;
  for (const [col, column] of spec.showcase.columns.entries()) {
    const inCol = instances.filter((i) => i.col === col);
    if (!inCol.length) continue;
    const width = Math.max(...inCol.map((i) => i.node.width));
    for (const { node, row } of inCol) move(run, node, Math.round(x), Math.round(setY + rowY[row] + (cellH - node.height) / 2));
    const header = `showcase:${column.slot}`;
    keep.add(header);
    move(run, ensureLabel(ctx, frame, header, `${column.slot}: on`, style), Math.round(x), setY - lineH - 8);
    if (col === 0) {
      keep.add("showcase:group");
      move(run, ensureLabel(ctx, frame, "showcase:group", "with icon", strong), Math.round(x), setY - 2 * (lineH + 8));
    }
    x += width + 24;
  }
  return x - 24;
}

/** Prototype reactions: each rest cell changes to its hover sibling while hovered. Writes only what differs. */
async function wireInteractions(ctx: SetCtx, set: ComponentSetNode, spec: M.ComponentSet) {
  const byKey = new Map(ownCells(set).map((c) => [getTag(c, "cell"), c]));
  const order = spec.axes.map((a) => a.name);
  const keyOf = (props: Record<string, string>) => order.map((a) => `${a}=${props[a]}`).join(", ");
  const wanted = new Map<ComponentNode, Reaction[]>();
  for (const interaction of spec.interactions) {
    for (const [key, node] of byKey) {
      const props = parseKey(key);
      if (props[interaction.axis] !== interaction.from) continue;
      const target = byKey.get(keyOf({ ...props, [interaction.axis]: interaction.to }));
      if (!target) continue;
      const list = wanted.get(node) ?? [];
      list.push({
        trigger: { type: interaction.trigger } as Trigger,
        actions: [{ type: "NODE", destinationId: target.id, navigation: "CHANGE_TO", transition: null }],
      });
      wanted.set(node, list);
    }
  }
  const signature = (reactions: readonly Reaction[]) =>
    JSON.stringify(reactions.map((r) => [r.trigger?.type, (r.actions ?? []).map((a) => (a.type === "NODE" ? a.destinationId : a.type))]));
  for (const [node, reactions] of wanted) {
    if (signature(node.reactions) === signature(reactions)) continue;
    ctx.run.write(() => void 0);
    await node.setReactionsAsync(reactions);
  }
}

async function syncSet(ctx: SetCtx, spec: M.ComponentSet, found: Map<string, SceneNode>, page: PageNode | undefined, planned?: Layout) {
  const { run, progress } = ctx;
  progress.start(spec.id);
  const frame = page ? ensureFrame(ctx, spec.id, spec.name, page, found) : undefined;
  let set = found.get(spec.id) as ComponentSetNode | undefined;
  const existing = new Map(ownCells(set).map((c) => [getTag(c, "cell"), c]));
  // Each property's default: a text slot's sample, and whether an optional slot shows.
  const samples: Record<string, string | boolean> = {};
  for (const p of spec.properties) samples[p.name] = p.default;

  // Drawing order: row by row, each row across its states, so the first variant is the widest and
  // every later one can be placed the moment it exists.
  const byKey = new Map(spec.cells.map((c) => [c.key, c]));
  const order = spec.axes.map((a) => a.name);
  const keyOf = (props: Record<string, string>) => order.map((a) => `${a}=${props[a]}`).join(", ");
  const grid = combos(spec.grid.rows).flatMap((row, r) =>
    combos(spec.grid.columns).map((col, c) => ({ cell: byKey.get(keyOf({ ...row, ...col })), row: r, col: c })),
  );
  const onGrid = new Set(grid.map((g) => g.cell?.key));
  const queue = [...grid.filter((g) => g.cell), ...spec.cells.filter((c) => !onGrid.has(c.key)).map((cell) => ({ cell, row: -1, col: -1 }))];
  // Row height is known before anything is drawn: the manifest gives each size's height.
  const cellH = cellHeightOf(spec);

  let layout = planned;
  let placed = false;
  let outgrown = false;
  const counts = { created: 0, updated: 0, unchanged: 0, orphaned: 0 };
  const partCounts: Record<Part, number> = { box: 0, surface: 0, layers: 0 };
  for (const { cell, row, col } of queue) {
    const c = cell!;
    let node = existing.get(c.key);
    if (!node) {
      counts.created++;
      if (run.write(() => void 0) && frame) {
        const fresh = figma.createComponent();
        await applyCell(ctx, fresh, c, samples);
        fresh.setSharedPluginData(NS, "cell", c.key);
        // Into the set at once, so an interrupted run never leaves loose components on the page.
        // Onto the frame's page first: a component is born on whichever page is current.
        frame.appendChild(fresh);
        if (!set) set = figma.combineAsVariants([fresh], frame);
        else set.appendChild(fresh);
        node = fresh;
      }
    } else if (getTag(node, "hash") !== c.hash) {
      counts.updated++;
      const parts = staleParts(node, c);
      for (const part of parts) partCounts[part]++;
      if (run.write(() => void 0)) await applyCell(ctx, node, c, samples, parts);
    } else counts.unchanged++;

    // In place at once: the first variant fixes the layout, every later one goes straight to its slot.
    if (run.apply && frame && set && node && row >= 0) {
      if (!layout) layout = await planLayout(ctx, frame, spec, Math.ceil(node.width), Math.max(cellH, Math.ceil(node.height)));
      if (!placed) {
        placeSet(run, frame, set, layout);
        placed = true;
      }
      if (node.width > layout.cellW + 0.5 || node.height > layout.cellH + 0.5) outgrown = true;
      move(run, node, layout.colX[col], layout.rowY[row]);
    }
    await progress.tick(spec.id);
  }

  const wanted = new Set(spec.cells.map((c) => c.key));
  for (const [key, node] of existing) {
    if (wanted.has(key)) continue;
    counts.orphaned++;
    run.log("ORPHANED", `${spec.name}: ${key}`, "no longer in the manifest; kept");
    run.write(() => node.setSharedPluginData(NS, "orphaned", "true"));
  }
  if (counts.created) run.log("CREATE", `${spec.name}: ${counts.created} variants`);
  if (counts.updated) {
    const which = PARTS.filter((p) => partCounts[p]).map((p) => `${p} ${partCounts[p]}`).join(", ");
    run.log("UPDATE", `${spec.name}: ${counts.updated} variants`, `in place; rewrote ${which || "names only"}`);
  }
  if (counts.unchanged) run.log("NOOP", `${spec.name}: ${counts.unchanged} variants`);

  if (!set || !frame) {
    if (!set) run.log("CREATE", `component set ${spec.name}`);
    progress.finish(spec.id, summarize(counts));
    return;
  }
  const s = set;
  if (s.name !== spec.name) run.write(() => (s.name = spec.name));
  if (getTag(s, "contractHash") && getTag(s, "contractHash") !== spec.contractHash) {
    run.log("UPDATE", `${spec.name}: contract`, `surface ${getTag(s, "contractHash")} → ${spec.contractHash}, reconciled in place`);
  }
  tag(run, s, { ...provenance("component-set", spec.id), contractHash: spec.contractHash, visualHash: spec.visualHash });

  const keys = ensureProperties(ctx, s, spec.properties);
  const nodes = new Map(ownCells(s).map((c) => [getTag(c, "cell"), c]));
  for (const cell of spec.cells) {
    const node = nodes.get(cell.key);
    if (node) bindReferences(ctx, node, cell, keys, samples);
  }
  if (run.apply && layout) {
    // Only if a variant came out bigger than the first one measured: lay the grid out again.
    if (outgrown) {
      const cells = ownCells(s);
      layout = await planLayout(ctx, frame, spec, Math.max(...cells.map((c) => Math.ceil(c.width))), Math.max(...cells.map((c) => Math.ceil(c.height))));
      placeSet(run, frame, s, layout);
      for (const { cell, row, col } of queue) {
        const node = nodes.get(cell!.key);
        if (node && row >= 0) move(run, node, layout.colX[col], layout.rowY[row]);
      }
      run.log("UPDATE", `${spec.name}: grid`, "a variant was wider than the first; laid out again");
    }
    await finishLayout(ctx, frame, s, spec, layout);
    await wireInteractions(ctx, s, spec);
  }
  found.set(spec.id, s);
  progress.finish(spec.id, summarize(counts));
}

/* ── the run ────────────────────────────────────────────────────────────────────────────────── */

/**
 * The manifest's pages, found by tag. A page of ours from an earlier layout is adopted before a new
 * one is made, and when the plan allows no new page (a Starter file holds one), the current page is.
 */
async function ensurePages(run: Run): Promise<Map<string, PageNode>> {
  const out = new Map<string, PageNode>();
  const adoptable = figma.root.children.filter((p) => getTag(p, "id").startsWith("page") && !manifest.pages.some((m) => getTag(p, "id") === `page:${m.id}`));
  for (const spec of manifest.pages) {
    const id = `page:${spec.id}`;
    let page = figma.root.children.find((p) => getTag(p, "id") === id) ?? adoptable.shift();
    if (!page) {
      run.log("CREATE", `page ${spec.name}`);
      if (!run.apply) continue;
      try {
        page = figma.createPage();
      } catch (error) {
        run.log("WARN", `page ${spec.name}`, `could not be created (${String(error)}); the current page is used`);
        page = figma.currentPage;
      }
    }
    const p = page;
    if (p.name !== spec.name) run.write(() => (p.name = spec.name));
    tag(run, p, provenance("page", id));
    await p.loadAsync();
    out.set(spec.id, p);
  }
  return out;
}

/** Everything of ours on every page of ours, by id, at any depth: a set now lives inside its frame. */
async function findOwn(): Promise<{ found: Map<string, SceneNode>; pages: PageNode[] }> {
  const pages = figma.root.children.filter((p) => getTag(p, "id").startsWith("page"));
  const found = new Map<string, SceneNode>();
  for (const page of pages) {
    await page.loadAsync();
    for (const node of page.findAllWithCriteria({ sharedPluginData: { namespace: NS, keys: ["id"] } })) {
      if (!found.has(getTag(node, "id"))) found.set(getTag(node, "id"), node);
    }
  }
  return { found, pages };
}

/**
 * What is ours but no longer has a place: a top-level object the manifest dropped (the first icon
 * placeholder) or a variant left loose by an interrupted run. Moved into one frame per page, tagged,
 * never deleted: a designer decides.
 */
function collectOrphans(run: Run, pages: PageNode[], found: Map<string, SceneNode>) {
  const known = new Set<string>([
    ...manifest.components.flatMap((c) => [c.id, `frame:${c.id}`]),
    ...manifest.pages.map((p) => `page:${p.id}`),
  ]);
  for (const page of pages) {
    const loose = page.children.filter(
      (n) =>
        getTag(n, "id") !== "orphans" &&
        ((n.type === "COMPONENT" && getTag(n, "cell")) || (getTag(n, "id") && !known.has(getTag(n, "id")))),
    );
    if (!loose.length) continue;
    run.log("ORPHANED", `${loose.length} loose object(s) on ${page.name}`, "moved into “Orphaned”, safe to delete");
    run.write(() => {
      let frame = page.children.find((n) => getTag(n, "id") === "orphans") as FrameNode | undefined;
      if (!frame) {
        frame = figma.createFrame();
        frame.name = "Orphaned (safe to delete)";
        frame.layoutMode = "HORIZONTAL";
        frame.layoutWrap = "WRAP";
        frame.primaryAxisSizingMode = "FIXED";
        frame.counterAxisSizingMode = "AUTO";
        frame.resize(1200, 100);
        frame.itemSpacing = 16;
        frame.counterAxisSpacing = 16;
        frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = 24;
        frame.setSharedPluginData(NS, "id", "orphans");
        page.appendChild(frame);
      }
      for (const node of loose) {
        node.setSharedPluginData(NS, "orphaned", "true");
        frame.appendChild(node);
      }
    });
  }
}

/** Stack each page's frames top to bottom, in manifest order. Writes only what moved. */
/**
 * Stack each page's frames top to bottom, in manifest order, by what each one actually shows: its
 * render bounds, so anything that overflows a frame pushes the next one down instead of under it.
 * With `check`, report a frame whose height is not the one planned for it, or that overflows.
 */
/** The width each frame was given before it was filled, to check against what it ended up as. */
const frameWidths = new Map<string, number>();

function arrange(run: Run, pages: Map<string, PageNode>, found: Map<string, SceneNode>, check = false) {
  for (const [pageId, page] of pages) {
    let y = 0;
    for (const spec of manifest.components.filter((c) => c.page === pageId)) {
      const node = found.get(`frame:${spec.id}`) as FrameNode | undefined;
      if (!node || node.parent !== page) continue;
      const bounds = node.absoluteRenderBounds ?? node.absoluteBoundingBox;
      const top = node.absoluteTransform[1][2];
      const above = bounds ? Math.max(0, top - bounds.y) : 0;
      const shown = bounds ? Math.max(node.height, bounds.height) : node.height;
      move(run, node, 0, Math.round(y + above));
      y += Math.ceil(shown) + 160;
      if (!check) continue;
      const planned = plannedHeight(spec);
      if (Math.abs(node.height - planned) > 1) run.log("WARN", `frame ${spec.name}`, `height ${Math.round(node.height)}, planned ${planned}`);
      const width = frameWidths.get(spec.id);
      if (width !== undefined && Math.abs(node.width - width) > 1) run.log("WARN", `frame ${spec.name}`, `width ${Math.round(node.width)}, planned ${width}`);
      if (shown - node.height > 1 || above > 0) {
        run.log("WARN", `frame ${spec.name}`, `content overflows it: ${Math.round(above)}px above, ${Math.round(shown - node.height - above)}px below`);
      }
    }
    const orphans = page.children.find((n) => getTag(n, "id") === "orphans");
    if (orphans) move(run, orphans, 0, y);
  }
}

async function reconcile(apply: boolean) {
  const run = new Run(apply);
  const started = Date.now();
  const iconSpec = manifest.components.find((c): c is M.IconSet => c.kind === "icon-set")!;
  const setSpecs = manifest.components.filter((c): c is M.ComponentSet => c.kind === "component-set");
  const progress = new Progress(apply, [
    { id: "variables", label: "Variables", total: manifest.variables.length },
    { id: "icons", label: `${iconSpec.name} (${iconSpec.source.replace("@skryensya/icons-", "")})`, total: iconSpec.icons.length },
    ...setSpecs.map((s) => ({ id: s.id, label: s.name, total: s.cells.length })),
  ]);

  const vars = await syncVariables(run, progress);
  const pages = await ensurePages(run);
  // New nodes are born on the current page, so work from the one they belong on.
  const home = pages.get(manifest.pages[0].id);
  if (apply && home && figma.currentPage !== home) await figma.setCurrentPageAsync(home);
  const { found, pages: ownPages } = await findOwn();
  const ctx: Ctx = { run, progress, vars };

  // Every frame first, at its final size and place, with its labels: the grid of each set is worked
  // out here, once, and the variants later only fill it.
  const layouts = new Map<string, Layout>();
  if (apply) {
    for (const spec of manifest.components) {
      const page = pages.get(spec.page);
      if (!page) continue;
      const frame = ensureFrame(ctx, spec.id, spec.name, page, found);
      if (!frame) continue;
      if (spec.kind === "icon-set") {
        frameWidths.set(spec.id, FRAME_PAD + ICON_COLUMNS * ICON_SLOT + FRAME_PAD);
        resizeTo(run, frame, frameWidths.get(spec.id)!, plannedHeight(spec));
        continue;
      }
      const { w, h } = await measureFirst(ctx, spec, found.get(spec.id) as ComponentSetNode | undefined);
      const layout = await planLayout(ctx, frame, spec, w, h);
      layouts.set(spec.id, layout);
      frameWidths.set(spec.id, Math.ceil(plannedWidth(spec, layout)));
      resizeTo(run, frame, frameWidths.get(spec.id)!, plannedHeight(spec));
    }
    arrange(run, pages, found);
  }
  const icons = await syncIconSet(ctx, iconSpec, found, pages.get(iconSpec.page));
  // A dry run never draws a cell, so it walks the sets without the Icon set it would have made.
  const setCtx: SetCtx = { ...ctx, icons: icons as IconCtx };
  // Restacked after each frame fills, so a frame that came out taller never sits on the next one.
  if (apply) arrange(run, pages, found);
  for (const spec of setSpecs) {
    await syncSet(setCtx, spec, found, pages.get(spec.page), layouts.get(spec.id));
    if (apply) arrange(run, pages, found);
  }
  // The specimen is gone from the manifest. Its frame held only this plugin's own instances, so it goes too.
  const specimen = found.get("specimen");
  if (specimen) {
    run.log("UPDATE", "specimen frame", "removed, no longer in the manifest");
    run.write(() => specimen.remove());
    found.delete("specimen");
  }
  collectOrphans(run, ownPages, found);
  arrange(run, pages, found, apply);

  if (figma.root.getSharedPluginData(NS, "sourceHash") !== manifest.sourceHash) {
    run.write(() => figma.root.setSharedPluginData(NS, "sourceHash", manifest.sourceHash));
  }
  const landing = pages.get(manifest.pages[0].id);
  if (apply && landing && figma.currentPage !== landing) await figma.setCurrentPageAsync(landing);

  const counts: Record<string, number> = {};
  for (const e of run.entries) counts[e.action] = (counts[e.action] ?? 0) + 1;
  const outcome = run.writes === 0 ? "NOOP" : apply ? "APPLIED" : "WOULD CHANGE";
  return {
    type: "report",
    apply,
    outcome,
    writes: run.writes,
    sourceHash: manifest.sourceHash,
    seconds: Math.round((Date.now() - started) / 100) / 10,
    counts,
    phases: progress.phases,
    entries: run.entries,
  };
}

figma.showUI(__html__, { width: 440, height: 600, themeColors: true });
figma.ui.postMessage({ type: "ready", sourceHash: manifest.sourceHash });
figma.ui.onmessage = async (message: { type: "sync" | "dry-run" }) => {
  try {
    const report = await reconcile(message.type === "sync");
    figma.ui.postMessage(report);
    if (message.type === "sync") figma.notify(`Skryensya: ${report.outcome} (${report.writes} writes, ${report.seconds}s)`);
  } catch (error) {
    figma.ui.postMessage({ type: "error", text: error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error) });
  }
};
