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
  private sinceYield = 0;

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

  /** One unit of work done. Posts at most every 120ms, and yields so the window can draw it. */
  async tick(id: string, n = 1) {
    const phase = this.phase(id);
    phase.done = Math.min(phase.total, phase.done + n);
    this.sinceYield += n;
    const now = Date.now();
    if (now - this.lastPost > 120) this.post();
    if (this.sinceYield >= 6) {
      this.sinceYield = 0;
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

/** Place `cells` on a grid of `cols` × `rows` slots, `slotOf` saying where each goes. Writes only moves. */
function placeOnGrid(run: Run, set: ComponentSetNode, cells: ComponentNode[], slotOf: (c: ComponentNode) => [number, number] | null) {
  if (!cells.length) return;
  const cellW = Math.max(...cells.map((c) => c.width)) + 24;
  const cellH = Math.max(...cells.map((c) => c.height)) + 24;
  let cols = 0;
  let rows = 0;
  for (const cell of cells) {
    const slot = slotOf(cell);
    if (!slot) continue;
    const [col, row] = slot;
    cols = Math.max(cols, col + 1);
    rows = Math.max(rows, row + 1);
    const x = 24 + col * cellW;
    const y = 24 + row * cellH;
    if (cell.x !== x || cell.y !== y) run.write(() => ((cell.x = x), (cell.y = y)));
  }
  const w = 48 + cols * cellW;
  const h = 48 + rows * cellH;
  if (set.width !== w || set.height !== h) run.write(() => set.resizeWithoutConstraints(w, h));
}

const ownCells = (set: ComponentSetNode | undefined) =>
  (set?.children ?? []).filter((c): c is ComponentNode => c.type === "COMPONENT");

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

async function syncIconSet(ctx: Ctx, spec: M.IconSet, found: Map<string, SceneNode>, page: PageNode): Promise<IconCtx | undefined> {
  const { run, progress } = ctx;
  progress.start("icons");
  let set = found.get(spec.id) as ComponentSetNode | undefined;
  const existing = new Map(ownCells(set).map((c) => [getTag(c, "cell"), c]));
  const created: ComponentNode[] = [];
  const counts = { created: 0, updated: 0, unchanged: 0, orphaned: 0 };

  for (const icon of spec.icons) {
    const key = `${spec.axis}=${icon.name}`;
    const node = existing.get(key);
    if (!node) {
      counts.created++;
      if (run.write(() => void 0)) {
        const fresh = figma.createComponent();
        drawIcon(fresh, icon, spec);
        fresh.setSharedPluginData(NS, "cell", key);
        fresh.setSharedPluginData(NS, "hash", icon.hash);
        created.push(fresh);
      }
    } else if (getTag(node, "hash") !== icon.hash) {
      counts.updated++;
      if (run.write(() => void 0)) {
        drawIcon(node, icon, spec);
        node.setSharedPluginData(NS, "hash", icon.hash);
      }
    } else counts.unchanged++;
    await progress.tick("icons");
  }
  const wanted = new Set(spec.icons.map((i) => `${spec.axis}=${i.name}`));
  for (const [key, node] of existing) {
    if (wanted.has(key) || getTag(node, "orphaned") === "true") continue;
    counts.orphaned++;
    run.log("ORPHANED", `${spec.name}: ${key}`, "no longer drawn; kept");
    run.write(() => node.setSharedPluginData(NS, "orphaned", "true"));
  }
  if (counts.created) run.log("CREATE", `${spec.name}: ${counts.created} icons`, spec.source);
  if (counts.updated) run.log("UPDATE", `${spec.name}: ${counts.updated} icons`, "in place");
  if (counts.unchanged) run.log("NOOP", `${spec.name}: ${counts.unchanged} icons`);
  progress.finish("icons", summarize(counts));

  if (!run.apply) return undefined;
  if (!set) set = figma.combineAsVariants(created, page);
  else for (const node of created) set.appendChild(node);
  if (set.name !== spec.name) run.write(() => (set!.name = spec.name));
  tag(run, set, { ...provenance("icon-set", spec.id), hash: spec.hash });

  const cells = ownCells(set).filter((c) => getTag(c, "orphaned") !== "true");
  const order = new Map(spec.icons.map((icon, i) => [`${spec.axis}=${icon.name}`, i]));
  const columns = 11;
  placeOnGrid(run, set, cells, (c) => {
    const i = order.get(getTag(c, "cell"));
    return i === undefined ? null : [i % columns, Math.floor(i / columns)];
  });
  found.set(spec.id, set);

  const byName = new Map(cells.map((c) => [parseKey(getTag(c, "cell"))[spec.axis], c]));
  return { set, byName, spec };
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
  const { spec, set, byName } = ctx.icons;
  const main = await node.getMainComponentAsync();
  // Anything that is not one of the Icon set's variants (the old placeholder) becomes the default.
  if (!main || main.parent?.id !== set.id) node.swapComponent(byName.get(spec.default)!);
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

/** One cell, in place: geometry, surface, then its layers in slot order. */
async function applyCell(ctx: SetCtx, node: ComponentNode, cell: M.Cell, sample: Record<string, string>) {
  const box = manifest.styles.boxes[cell.box];
  const surface = manifest.styles.surfaces[cell.surface];
  const layers = manifest.styles.layers[cell.layers];

  node.name = cell.key;
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
  node.strokes = surface.strokes.map((p) => toPaint(ctx, p));
  node.strokeAlign = "INSIDE";
  setNumber(ctx, node, "strokeWeight", box.strokeWeight, 0);
  node.fills = surface.fills.map((p) => toPaint(ctx, p));
  node.effects = surface.effects.map((e) => toEffect(ctx, e));
  node.clipsContent = box.clipsContent;

  for (const [index, layer] of layers.entries()) {
    let child = node.findChild((n) => n.name === layer.slot);
    const wanted = layer.kind === "icon" ? "INSTANCE" : "TEXT";
    if (child && child.type !== wanted) {
      ctx.run.log("UPDATE", `layer ${layer.slot} of ${cell.key}`, `replaced: ${child.type} → ${wanted}`);
      child.remove();
      child = null;
    }
    if (!child) {
      child = layer.kind === "icon" ? ctx.icons.byName.get(ctx.icons.spec.default)!.createInstance() : figma.createText();
      child.name = layer.slot;
    }
    node.insertChild(index, child);
    if (layer.kind === "icon") await applyIcon(ctx, child as InstanceNode, layer);
    else await applyText(ctx, child as TextNode, layer.text, sample[layer.slot] ?? "");
  }
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

function bindReferences(ctx: SetCtx, node: ComponentNode, cell: M.Cell, keys: Record<string, string>) {
  for (const layer of manifest.styles.layers[cell.layers]) {
    const child = node.findChild((n) => n.name === layer.slot);
    if (!child) continue;
    const refs: Record<string, string> = {};
    if (layer.kind === "icon") {
      if (layer.visibleProperty && keys[layer.visibleProperty]) refs.visible = keys[layer.visibleProperty];
    } else if (keys[layer.textProperty]) refs.characters = keys[layer.textProperty];
    const have = (child.componentPropertyReferences ?? {}) as Record<string, string>;
    const same = Object.keys(refs).length === Object.keys(have).length && Object.entries(refs).every(([k, v]) => have[k] === v);
    if (!same) ctx.run.write(() => (child.componentPropertyReferences = refs));
  }
}

async function syncSet(ctx: SetCtx, spec: M.ComponentSet, found: Map<string, SceneNode>, page: PageNode) {
  const { run, progress } = ctx;
  progress.start(spec.id);
  let set = found.get(spec.id) as ComponentSetNode | undefined;
  const existing = new Map(ownCells(set).map((c) => [getTag(c, "cell"), c]));
  const samples: Record<string, string> = {};
  for (const p of spec.properties) if (p.type === "TEXT") samples[p.name] = p.default;

  const created: ComponentNode[] = [];
  const counts = { created: 0, updated: 0, unchanged: 0, orphaned: 0 };
  for (const cell of spec.cells) {
    const node = existing.get(cell.key);
    if (!node) {
      counts.created++;
      if (run.write(() => void 0)) {
        const fresh = figma.createComponent();
        await applyCell(ctx, fresh, cell, samples);
        fresh.setSharedPluginData(NS, "cell", cell.key);
        fresh.setSharedPluginData(NS, "hash", cell.hash);
        created.push(fresh);
      }
    } else if (getTag(node, "hash") !== cell.hash) {
      counts.updated++;
      if (run.write(() => void 0)) {
        await applyCell(ctx, node, cell, samples);
        node.setSharedPluginData(NS, "hash", cell.hash);
      }
    } else counts.unchanged++;
    await progress.tick(spec.id);
  }

  const wanted = new Set(spec.cells.map((c) => c.key));
  for (const [key, node] of existing) {
    if (wanted.has(key) || getTag(node, "orphaned") === "true") continue;
    counts.orphaned++;
    run.log("ORPHANED", `${spec.name}: ${key}`, "no longer in the manifest; kept");
    run.write(() => node.setSharedPluginData(NS, "orphaned", "true"));
  }
  if (counts.created) run.log("CREATE", `${spec.name}: ${counts.created} variants`);
  if (counts.updated) run.log("UPDATE", `${spec.name}: ${counts.updated} variants`, "in place");
  if (counts.unchanged) run.log("NOOP", `${spec.name}: ${counts.unchanged} variants`);

  if (!run.apply) {
    if (!set) run.log("CREATE", `component set ${spec.name}`);
    progress.finish(spec.id, summarize(counts));
    return;
  }
  if (!set) set = figma.combineAsVariants(created, page);
  else for (const node of created) set.appendChild(node);
  if (set.name !== spec.name) run.write(() => (set!.name = spec.name));

  if (getTag(set, "contractHash") && getTag(set, "contractHash") !== spec.contractHash) {
    run.log("UPDATE", `${spec.name}: contract`, `surface ${getTag(set, "contractHash")} → ${spec.contractHash}, reconciled in place`);
  }
  tag(run, set, { ...provenance("component-set", spec.id), contractHash: spec.contractHash, visualHash: spec.visualHash });

  const keys = ensureProperties(ctx, set, spec.properties);
  for (const cell of spec.cells) {
    const node = ownCells(set).find((c) => getTag(c, "cell") === cell.key);
    if (node) bindReferences(ctx, node, cell, keys);
  }

  // The default variant is Figma's top-left one: the grid draws each axis default-first.
  const cols = combos(spec.grid.columns);
  const rows = combos(spec.grid.rows);
  const matches = (combo: Record<string, string>, props: Record<string, string>) => Object.entries(combo).every(([k, v]) => props[k] === v);
  const cells = ownCells(set).filter((c) => getTag(c, "orphaned") !== "true");
  placeOnGrid(run, set, cells, (c) => {
    const props = parseKey(getTag(c, "cell"));
    const col = cols.findIndex((combo) => matches(combo, props));
    const row = rows.findIndex((combo) => matches(combo, props));
    return col < 0 || row < 0 ? null : [col, row];
  });
  const first = cells.find((c) => getTag(c, "cell") === spec.defaultCell);
  if (first && set.children[0] !== first) run.write(() => set!.insertChild(0, first));
  found.set(spec.id, set);
  progress.finish(spec.id, summarize(counts));
}

/* ── the specimen: the docs previews, as instances ──────────────────────────────────────────── */

async function syncSpecimen(ctx: SetCtx, found: Map<string, SceneNode>, page: PageNode) {
  const { run, progress } = ctx;
  progress.start("specimen");
  let frame = found.get("specimen") as FrameNode | undefined;
  if (!frame) {
    run.log("CREATE", "specimen frame");
    if (!run.apply) {
      progress.finish("specimen", `${manifest.specimen.length} to create`);
      return;
    }
    frame = figma.createFrame();
    frame.name = "Specimen (docs previews)";
    frame.layoutMode = "HORIZONTAL";
    frame.layoutWrap = "WRAP";
    frame.primaryAxisSizingMode = "FIXED";
    frame.counterAxisSizingMode = "AUTO";
    frame.resize(1400, 100);
    frame.itemSpacing = 32;
    frame.counterAxisSpacing = 32;
    frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = 40;
    frame.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    page.appendChild(frame);
  }
  tag(run, frame, provenance("specimen", "specimen"));
  // Registered here so `arrange` places it below the sets instead of leaving it at the origin.
  found.set("specimen", frame);

  const entries = new Map(frame.children.map((c) => [getTag(c, "specimen"), c as FrameNode]));
  const counts = { created: 0, updated: 0, unchanged: 0 };
  for (const [index, entry] of manifest.specimen.entries()) {
    await progress.tick("specimen");
    const set = found.get(entry.set) as ComponentSetNode | undefined;
    const main = ownCells(set).find((c) => getTag(c, "cell") === entry.cell);
    if (!set || !main) continue;
    const hash = JSON.stringify(entry);
    let wrapper = entries.get(entry.id);
    if (wrapper && getTag(wrapper, "hash") === hash && frame.children[index] === wrapper) {
      counts.unchanged++;
      continue;
    }
    if (!run.apply) {
      wrapper ? counts.updated++ : counts.created++;
      continue;
    }
    run.write(() => void 0);
    if (!wrapper) {
      counts.created++;
      wrapper = figma.createFrame();
      wrapper.name = entry.id;
      wrapper.layoutMode = "VERTICAL";
      wrapper.primaryAxisSizingMode = "AUTO";
      wrapper.counterAxisSizingMode = "AUTO";
      wrapper.itemSpacing = 8;
      wrapper.fills = [];
      const caption = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      caption.fontName = { family: "Inter", style: "Regular" };
      caption.fontSize = 11;
      caption.name = "caption";
      wrapper.appendChild(caption);
      wrapper.setSharedPluginData(NS, "specimen", entry.id);
    } else counts.updated++;
    frame.insertChild(index, wrapper);
    const caption = wrapper.findChild((n) => n.name === "caption") as TextNode;
    await figma.loadFontAsync(caption.fontName as FontName);
    caption.characters = `${entry.id}\n${entry.set.split("/")[1]} · ${entry.cell}`;
    let instance = wrapper.findChild((n) => n.name === "instance") as InstanceNode | null;
    if (!instance) {
      instance = main.createInstance();
      instance.name = "instance";
      wrapper.appendChild(instance);
    } else if ((await instance.getMainComponentAsync())?.id !== main.id) instance.swapComponent(main);
    const defs = set.componentPropertyDefinitions;
    const props: Record<string, string | boolean> = {};
    for (const [name, value] of Object.entries(entry.properties)) {
      const key = Object.keys(defs).find((k) => k.split("#")[0] === name && defs[k].type !== "VARIANT");
      if (key) props[key] = value;
    }
    for (const text of instance.findAll((n) => n.type === "TEXT") as TextNode[]) {
      if (text.fontName !== figma.mixed) await figma.loadFontAsync(text.fontName);
    }
    instance.setProperties(props);
    // The icon each slot shows, picked on the exposed Icon instance the way a designer would.
    for (const nested of instance.exposedInstances) {
      const name = entry.icons[nested.name] ?? ctx.icons.spec.default;
      nested.setProperties({ [ctx.icons.spec.axis]: name });
    }
    wrapper.setSharedPluginData(NS, "hash", hash);
  }
  if (counts.created) run.log("CREATE", `specimen: ${counts.created} previews`);
  if (counts.updated) run.log("UPDATE", `specimen: ${counts.updated} previews`);
  if (counts.unchanged) run.log("NOOP", `specimen: ${counts.unchanged} previews`);
  progress.finish("specimen", summarize(counts));
}

/* ── the run ────────────────────────────────────────────────────────────────────────────────── */

async function ownPage(run: Run): Promise<PageNode | undefined> {
  let page = figma.root.children.find((p) => getTag(p, "id") === "page");
  if (!page) {
    run.log("CREATE", "page Skryensya");
    if (!run.apply) return undefined;
    page = figma.createPage();
    page.name = "Skryensya";
  }
  tag(run, page, provenance("page", "page"));
  await page.loadAsync();
  // New nodes land on the current page before they are moved anywhere; make that this one.
  if (run.apply && figma.currentPage !== page) await figma.setCurrentPageAsync(page);
  return page;
}

/** Stack the Icon set, the Button sets and the specimen top to bottom. Writes only what moved. */
function arrange(run: Run, found: Map<string, SceneNode>) {
  let y = 0;
  const order = [...manifest.components.map((c) => c.id), "specimen"];
  for (const id of order) {
    const node = found.get(id);
    if (!node) continue;
    if (node.x !== 0 || node.y !== y) run.write(() => ((node.x = 0), (node.y = y)));
    y += node.height + 160;
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
    { id: "specimen", label: "Specimen", total: manifest.specimen.length },
  ]);

  const vars = await syncVariables(run, progress);
  const page = await ownPage(run);
  const found = new Map<string, SceneNode>();
  if (page) {
    for (const node of page.findAllWithCriteria({ sharedPluginData: { namespace: NS, keys: ["id"] } })) {
      if (node.parent === page) found.set(getTag(node, "id"), node);
    }
  }
  // Top-level objects of ours the manifest no longer has (the old icon placeholder): kept, tagged.
  const known = new Set([...manifest.components.map((c) => c.id), "specimen"]);
  for (const [id, node] of found) {
    if (known.has(id) || getTag(node, "orphaned") === "true") continue;
    run.log("ORPHANED", `${node.name}`, "no longer in the manifest; kept");
    run.write(() => node.setSharedPluginData(NS, "orphaned", "true"));
  }

  const ctx: Ctx = { run, progress, vars };
  const icons = page ? await syncIconSet(ctx, iconSpec, found, page) : undefined;
  if (page) {
    // A dry run never draws a cell, so it walks the sets without the Icon set it would have made.
    const setCtx: SetCtx = { ...ctx, icons: icons as IconCtx };
    for (const spec of setSpecs) await syncSet(setCtx, spec, found, page);
    await syncSpecimen(setCtx, found, page);
    arrange(run, found);
  } else {
    // Dry run on a file with nothing yet: everything after the variables would be created.
    if (!page) progress.finish("icons", `${iconSpec.icons.length} to create`);
    for (const spec of setSpecs) {
      run.log("CREATE", `component set ${spec.name}`, `${spec.cells.length} variants`);
      progress.finish(spec.id, `${spec.cells.length} to create`);
    }
    run.log("CREATE", "specimen frame");
    progress.finish("specimen", `${manifest.specimen.length} to create`);
  }

  if (figma.root.getSharedPluginData(NS, "sourceHash") !== manifest.sourceHash) {
    run.write(() => figma.root.setSharedPluginData(NS, "sourceHash", manifest.sourceHash));
  }

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
