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
 *   - Present but no longer in the manifest → tagged ORPHANED and left alone. Nothing is deleted.
 *
 * "Dry run" walks the same path and writes nothing: every write goes through `run.write`.
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

async function syncVariables(run: Run): Promise<Map<string, Variable>> {
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
      run.log("UPDATE", `variable ${spec.name}`, "renamed");
    }
    if (variable) out.set(spec.id, variable);
  }
  if (created.size) run.log("CREATE", `${created.size} variables`);

  let updated = 0;
  for (const spec of manifest.variables) {
    const variable = out.get(spec.id);
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
  const unchanged = manifest.variables.length - created.size - updated;
  if (unchanged) run.log("NOOP", `${unchanged} variables`);

  for (const [id, variable] of own) {
    if (specs.has(id) || getTag(variable, "orphaned") === "true") continue;
    run.log("ORPHANED", `variable ${variable.name}`);
    run.write(() => variable.setSharedPluginData(NS, "orphaned", "true"));
  }
  return out;
}

/* ── paints, effects, numbers ───────────────────────────────────────────────────────────────── */

type Ctx = { run: Run; vars: Map<string, Variable> };

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

/* ── the icon placeholder ───────────────────────────────────────────────────────────────────── */

function drawIcon(spec: M.Component, node: ComponentNode) {
  node.name = spec.name;
  node.resize(spec.size, spec.size);
  node.fills = [];
  node.clipsContent = false;
  let glyph = node.findChild((n) => n.name === "glyph") as EllipseNode | null;
  if (!glyph) {
    glyph = figma.createEllipse();
    glyph.name = "glyph";
    node.appendChild(glyph);
  }
  const inset = spec.size / 6;
  glyph.resize(spec.size - 2 * inset, spec.size - 2 * inset);
  glyph.x = inset;
  glyph.y = inset;
  glyph.fills = [];
  const { r, g, b, a } = spec.stroke;
  glyph.strokes = [{ type: "SOLID", color: { r, g, b }, opacity: a }];
  glyph.strokeWeight = spec.size / 12;
  glyph.constraints = { horizontal: "SCALE", vertical: "SCALE" };
}

function syncIcon(run: Run, spec: M.Component, found: Map<string, SceneNode>, page: PageNode): ComponentNode | undefined {
  let node = found.get(spec.id) as ComponentNode | undefined;
  if (!node) {
    run.log("CREATE", `component ${spec.name}`);
    run.write(() => {
      node = figma.createComponent();
      page.appendChild(node);
      drawIcon(spec, node);
    });
  } else if (getTag(node, "hash") !== spec.hash) {
    run.log("UPDATE", `component ${spec.name}`);
    run.write(() => drawIcon(spec, node!));
  } else run.log("NOOP", `component ${spec.name}`);
  if (node) tag(run, node, { ...provenance("component", spec.id), hash: spec.hash });
  return node;
}

/* ── the component sets ─────────────────────────────────────────────────────────────────────── */

type SetCtx = Ctx & { icon: ComponentNode };

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

function applyIcon(ctx: SetCtx, node: InstanceNode, layer: Extract<M.Layer, { kind: "icon" }>) {
  setNumber(ctx, node, "width", layer.icon.size);
  setNumber(ctx, node, "height", layer.icon.size);
  const glyph = node.findOne((n) => n.name === "glyph") as EllipseNode | null;
  if (glyph) glyph.strokes = [toPaint(ctx, layer.icon.color)];
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
      child = layer.kind === "icon" ? ctx.icon.createInstance() : figma.createText();
      child.name = layer.slot;
    }
    node.insertChild(index, child);
    if (layer.kind === "icon") applyIcon(ctx, child as InstanceNode, layer);
    else await applyText(ctx, child as TextNode, layer.text, sample[layer.slot] ?? "");
  }
}

/** The set's component properties, by name → Figma's generated key. Adds or fixes, never removes. */
function ensureProperties(ctx: SetCtx, set: ComponentSetNode, properties: M.ComponentProperty[]) {
  const keys: Record<string, string> = {};
  for (const property of properties) {
    const defs = set.componentPropertyDefinitions;
    const want = property.type === "INSTANCE_SWAP" ? ctx.icon.id : property.default;
    let key = Object.keys(defs).find((k) => k.split("#")[0] === property.name && defs[k].type === property.type);
    if (!key) {
      ctx.run.log("UPDATE", `${set.name}: property ${property.name}`, "added");
      ctx.run.write(() => (key = set.addComponentProperty(property.name, property.type, want)));
    } else if (defs[key].defaultValue !== want) {
      ctx.run.log("UPDATE", `${set.name}: property ${property.name}`, "default changed");
      ctx.run.write(() => (key = set.editComponentProperty(key!, { defaultValue: want })));
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
      if (keys[layer.swapProperty]) refs.mainComponent = keys[layer.swapProperty];
      if (layer.visibleProperty && keys[layer.visibleProperty]) refs.visible = keys[layer.visibleProperty];
    } else if (keys[layer.textProperty]) refs.characters = keys[layer.textProperty];
    const have = child.componentPropertyReferences ?? {};
    const same = Object.keys(refs).length === Object.keys(have).length && Object.entries(refs).every(([k, v]) => (have as Record<string, string>)[k] === v);
    if (!same) ctx.run.write(() => (child.componentPropertyReferences = refs));
  }
}

const parseKey = (key: string) => Object.fromEntries(key.split(", ").map((pair) => pair.split("=") as [string, string]));

function combos(axes: { name: string; values: string[] }[]): Record<string, string>[] {
  return axes.reduce<Record<string, string>[]>((acc, a) => acc.flatMap((c) => a.values.map((v) => ({ ...c, [a.name]: v }))), [{}]);
}

/** Cells on the grid, default top-left. Writes only positions that differ. */
function layoutSet(ctx: SetCtx, set: ComponentSetNode, spec: M.ComponentSet) {
  const cols = combos(spec.grid.columns);
  const rows = combos(spec.grid.rows);
  const cells = set.children.filter((c): c is ComponentNode => c.type === "COMPONENT" && getTag(c, "orphaned") !== "true");
  const cellW = Math.max(...cells.map((c) => c.width)) + 24;
  const cellH = Math.max(...cells.map((c) => c.height)) + 24;
  const matches = (combo: Record<string, string>, props: Record<string, string>) => Object.entries(combo).every(([k, v]) => props[k] === v);
  for (const cell of cells) {
    const props = parseKey(getTag(cell, "cell"));
    const col = cols.findIndex((c) => matches(c, props));
    const row = rows.findIndex((r) => matches(r, props));
    if (col < 0 || row < 0) continue;
    const x = 24 + col * cellW;
    const y = 24 + row * cellH;
    if (cell.x !== x || cell.y !== y) ctx.run.write(() => ((cell.x = x), (cell.y = y)));
  }
  // The default variant is the first child as well as the top-left one.
  const first = cells.find((c) => getTag(c, "cell") === spec.defaultCell);
  if (first && set.children[0] !== first) ctx.run.write(() => set.insertChild(0, first));
  const w = 48 + cols.length * cellW;
  const h = 48 + rows.length * cellH;
  if (set.width !== w || set.height !== h) ctx.run.write(() => set.resizeWithoutConstraints(w, h));
}

async function syncSet(ctx: SetCtx, spec: M.ComponentSet, found: Map<string, SceneNode>, page: PageNode) {
  const { run } = ctx;
  let set = found.get(spec.id) as ComponentSetNode | undefined;
  const existing = new Map(
    (set?.children ?? []).filter((c): c is ComponentNode => c.type === "COMPONENT").map((c) => [getTag(c, "cell"), c]),
  );
  const samples: Record<string, string> = {};
  for (const p of spec.properties) if (p.type === "TEXT") samples[p.name] = p.default;

  const created: ComponentNode[] = [];
  let missing = 0;
  let updated = 0;
  let unchanged = 0;
  for (const cell of spec.cells) {
    const node = existing.get(cell.key);
    if (!node) {
      missing++;
      if (run.write(() => void 0)) {
        const fresh = figma.createComponent();
        await applyCell(ctx, fresh, cell, samples);
        fresh.setSharedPluginData(NS, "cell", cell.key);
        fresh.setSharedPluginData(NS, "hash", cell.hash);
        created.push(fresh);
      }
    } else if (getTag(node, "hash") !== cell.hash) {
      updated++;
      if (run.write(() => void 0)) {
        await applyCell(ctx, node, cell, samples);
        node.setSharedPluginData(NS, "hash", cell.hash);
      }
    } else unchanged++;
  }
  if (missing) run.log("CREATE", `${spec.name}: ${missing} variants`);
  if (updated) run.log("UPDATE", `${spec.name}: ${updated} variants`, "in place");
  if (unchanged) run.log("NOOP", `${spec.name}: ${unchanged} variants`);

  const wanted = new Set(spec.cells.map((c) => c.key));
  for (const [key, node] of existing) {
    if (wanted.has(key) || getTag(node, "orphaned") === "true") continue;
    run.log("ORPHANED", `${spec.name}: ${key}`, "no longer in the manifest; kept");
    run.write(() => node.setSharedPluginData(NS, "orphaned", "true"));
  }

  if (!run.apply) {
    if (!set) run.log("CREATE", `component set ${spec.name}`);
    return;
  }
  if (!set) {
    set = figma.combineAsVariants(created, page);
    run.log("CREATE", `component set ${spec.name}`);
  } else for (const node of created) set.appendChild(node);
  if (set.name !== spec.name) run.write(() => (set!.name = spec.name));

  if (getTag(set, "contractHash") && getTag(set, "contractHash") !== spec.contractHash) {
    run.log("UPDATE", `${spec.name}: contract`, `surface ${getTag(set, "contractHash")} → ${spec.contractHash}, reconciled in place`);
  }
  tag(run, set, { ...provenance("component-set", spec.id), contractHash: spec.contractHash, visualHash: spec.visualHash });

  const keys = ensureProperties(ctx, set, spec.properties);
  for (const cell of spec.cells) {
    const node = set.children.find((c) => c.type === "COMPONENT" && getTag(c, "cell") === cell.key) as ComponentNode | undefined;
    if (node) bindReferences(ctx, node, cell, keys);
  }
  layoutSet(ctx, set, spec);
  found.set(spec.id, set);
}

/* ── the specimen: the docs previews, as instances ──────────────────────────────────────────── */

async function syncSpecimen(ctx: SetCtx, found: Map<string, SceneNode>, page: PageNode) {
  const { run } = ctx;
  let frame = found.get("specimen") as FrameNode | undefined;
  if (!frame) {
    run.log("CREATE", "specimen frame");
    if (!run.apply) return;
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

  const entries = new Map(frame.children.map((c) => [getTag(c, "specimen"), c as FrameNode]));
  let created = 0;
  let updated = 0;
  for (const [index, entry] of manifest.specimen.entries()) {
    const set = found.get(entry.set) as ComponentSetNode | undefined;
    const main = set?.children.find((c) => getTag(c, "cell") === entry.cell) as ComponentNode | undefined;
    if (!set || !main) continue;
    const hash = JSON.stringify(entry);
    let wrapper = entries.get(entry.id);
    if (wrapper && getTag(wrapper, "hash") === hash && frame.children[index] === wrapper) continue;
    if (!run.apply) {
      wrapper ? updated++ : created++;
      continue;
    }
    if (!wrapper) {
      created++;
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
    } else updated++;
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
    for (const font of instance.findAll((n) => n.type === "TEXT") as TextNode[]) {
      if (font.fontName !== figma.mixed) await figma.loadFontAsync(font.fontName);
    }
    instance.setProperties(props);
    wrapper.setSharedPluginData(NS, "hash", hash);
  }
  if (created) run.log("CREATE", `specimen: ${created} previews`);
  if (updated) run.log("UPDATE", `specimen: ${updated} previews`);
  if (!created && !updated) run.log("NOOP", `specimen: ${manifest.specimen.length} previews`);
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
  return page;
}

/** Stack the icon, the sets and the specimen top to bottom. Writes only what moved. */
function arrange(run: Run, found: Map<string, SceneNode>) {
  let y = 0;
  const order = ["icon-placeholder", ...manifest.components.filter((c) => c.kind === "component-set").map((c) => c.id), "specimen"];
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
  const vars = await syncVariables(run);
  const page = await ownPage(run);
  const found = new Map<string, SceneNode>();
  if (page) {
    for (const node of page.findAllWithCriteria({ sharedPluginData: { namespace: NS, keys: ["id"] } })) {
      if (node.parent === page) found.set(getTag(node, "id"), node);
    }
  }
  const iconSpec = manifest.components.find((c): c is M.Component => c.kind === "component")!;
  const icon = page ? syncIcon(run, iconSpec, found, page) : undefined;
  if (icon) found.set(iconSpec.id, icon);

  if (page && icon) {
    const ctx: SetCtx = { run, vars, icon };
    for (const spec of manifest.components) {
      if (spec.kind !== "component-set") continue;
      figma.ui.postMessage({ type: "progress", text: `${spec.name}…` });
      await syncSet(ctx, spec, found, page);
    }
    await syncSpecimen(ctx, found, page);
    arrange(run, found);
  } else {
    for (const spec of manifest.components) if (spec.kind === "component-set") run.log("CREATE", `component set ${spec.name}`);
    run.log("CREATE", "specimen frame");
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
    entries: run.entries,
  };
}

figma.showUI(__html__, { width: 420, height: 520, themeColors: true });
figma.ui.postMessage({ type: "ready", sourceHash: manifest.sourceHash, report: manifest.report });
figma.ui.onmessage = async (message: { type: "sync" | "dry-run" }) => {
  try {
    const report = await reconcile(message.type === "sync");
    figma.ui.postMessage(report);
    if (message.type === "sync") figma.notify(`Skryensya: ${report.outcome} (${report.writes} writes)`);
  } catch (error) {
    figma.ui.postMessage({ type: "error", text: error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error) });
  }
};
