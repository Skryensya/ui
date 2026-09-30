import { beforeAll, describe, expect, it } from "vitest";
import { buildFigmaManifest } from "./build.js";
import type { ComponentSet, FigmaManifest } from "./manifest-types.js";
import { catalogue } from "./realizations/index.js";

let manifest: FigmaManifest;

beforeAll(async () => {
  manifest = await buildFigmaManifest(catalogue);
});

/* Every contract in the catalogue, held to the same bar: it compiles, and every cell it draws is real. */
describe("the catalogue", () => {
  it("compiles every component with no warning", () => {
    expect(manifest.diagnostics.filter((d) => d.severity === "warning")).toEqual([]);
  });

  it.each(catalogue.map((r) => [`${r.contract} ${r.signature}`, r] as const))("draws %s", (_, realization) => {
    const sets = manifest.components.filter(
      (c): c is ComponentSet =>
        c.kind === "component-set" && (c.id === (realization.id ?? realization.contract) || c.id.startsWith(`${realization.id ?? realization.contract}/`)),
    );
    expect(sets.length).toBeGreaterThan(0);
    for (const set of sets) expect(set.cells.length).toBeGreaterThan(0);
  });
});

/* A nested realization draws the markup's own structure, not a flat row of slots. */
describe("Callout, drawn as it nests", () => {
  it("puts the icon beside a content column that fills the row", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id.startsWith("callout/"))!;
    const cell = set.cells[0];
    const host = manifest.styles.boxes[cell.box];
    const layers = manifest.styles.layers[cell.layers];
    expect(host.direction).toBe("HORIZONTAL");
    const content = layers.find((l) => l.kind === "frame" && l.slot === "content");
    expect(content?.kind).toBe("frame");
    if (content?.kind !== "frame") return;
    expect(manifest.styles.boxes[content.box]).toMatchObject({ direction: "VERTICAL", grow: true });
    expect(content.layers.map((l) => `${l.kind} ${l.slot}`)).toEqual(["text title", "text children"]);
  });
});

describe("Separator", () => {
  const first = (id: string) => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === id)!;
    return set.cells[0];
  };

  it("draws its rule as a top border alone, as tall as that border", () => {
    const box = manifest.styles.boxes[first("separator").box];
    expect(box.height).toBeUndefined();
    expect(box.strokeSides?.right).toEqual({ value: 0, expression: "0" });
    expect(box.strokeSides?.top).not.toEqual({ value: 0, expression: "0" });
  });

  it("tells its labelled version's two rules apart, both filling the row", () => {
    const layers = manifest.styles.layers[first("labelled-separator").layers];
    expect(layers.map((l) => l.slot)).toEqual(["rule", "children", "rule 2"]);
    for (const layer of layers) if (layer.kind === "frame") expect(manifest.styles.boxes[layer.box].grow).toBe(true);
  });
});

describe("Quote, drawn at a reading width", () => {
  it("wraps the quotation inside the rule, and keeps the attribution and its source on their own widths", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "quote")!;
    const cell = set.cells.find((c) => c.props.variant === "block")!;
    const [body, attribution] = manifest.styles.layers[cell.layers];
    expect(body.kind === "frame" && manifest.styles.boxes[body.box].stretch).toBe(true);
    expect(body.kind === "frame" && body.layers[0]).toMatchObject({ kind: "text", slot: "children", fill: true });
    expect(body.kind === "frame" && manifest.styles.boxes[body.box].padding.left).not.toEqual({ value: 0, expression: "0" });
    expect(attribution.kind === "frame" && attribution.layers.every((l) => l.kind === "text" && !l.fill)).toBe(true);
  });
});

describe("EmptyState", () => {
  it("centres a bold title and a wrapping description down its column", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "empty-state")!;
    const layers = manifest.styles.layers[set.cells[0].layers];
    expect(layers.map((l) => `${l.kind} ${l.slot}`)).toEqual(["frame icon", "text title", "text description"]);
    const title = layers[1];
    expect(title.kind === "text" && title.text).toMatchObject({ fontWeight: { value: 700 }, align: "CENTER" });
    expect(layers[2]).toMatchObject({ fill: true, text: { align: "CENTER" } });
  });
});

describe("Progress", () => {
  it("draws its bar as the given share of the track, full height, in the track's corners", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "progress")!;
    const [bar] = manifest.styles.layers[set.cells[0].layers];
    expect(bar.kind).toBe("frame");
    if (bar.kind !== "frame") return;
    expect(manifest.styles.boxes[bar.box]).toMatchObject({ width: { value: 144 }, stretch: true, radius: { variable: "--radius-pill" } });
  });
});

describe("Meter", () => {
  it("prints its label and value from options, over a track filled as the binding mounts it", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "meter")!;
    expect(set.properties.map((p) => p.name)).toEqual(["label", "value", "show value"]);
    const [header, track] = manifest.styles.layers[set.cells[0].layers];
    expect(header.kind === "frame" && header.layers.map((l) => l.slot)).toEqual(["label", "value"]);
    const bar = track.kind === "frame" ? track.layers[0] : undefined;
    expect(bar?.kind === "frame" && manifest.styles.boxes[bar.box].width).toMatchObject({ value: 163.2 });
  });
});

describe("Input", () => {
  const cell = (state: string) => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "input/plain")!;
    return set.cells.find((c) => c.props.state === state && c.props.controlSize === "md")!;
  };

  it("draws the attribute states the signature forwards", () => {
    expect(manifest.styles.surfaces[cell("invalid").surface].strokes[0]).toMatchObject({ color: { variable: "--color-border-danger" } });
  });

  it("holds its placeholder, centred in its height, in the placeholder's colour", () => {
    const [text] = manifest.styles.layers[cell("rest").layers];
    expect(text).toMatchObject({ kind: "text", slot: "placeholder", text: { fill: { color: { variable: "--color-text-tertiary" } } } });
    expect(manifest.styles.boxes[cell("rest").box].crossAlign).toBe("CENTER");
  });
});

describe("Breadcrumb", () => {
  it("draws each item's label as a text property of its own, with the template's separators as written", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "breadcrumb")!;
    expect(set.properties.map((p) => p.name)).toEqual(["items 1", "items 2", "items 3"]);
    const [list] = manifest.styles.layers[set.cells[0].layers];
    const [first] = list.kind === "frame" ? list.layers : [];
    expect(first.kind === "frame" && first.layers.map((l) => (l.kind === "text" ? (l.characters ?? l.slot) : l.slot))).toEqual(["items 1", "/"]);
  });
});

describe("DescriptionList", () => {
  const set = (layout: string) => manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === `description-list/${layout}`)!;

  it("exposes every term and value of its items as text properties", () => {
    expect(set("stacked").properties.map((p) => p.name)).toEqual(["term 1", "details 1", "term 2", "details 2", "term 3", "details 3"]);
  });

  it("draws density as on or off", () => {
    expect(set("stacked").axes.find((a) => a.name === "density")?.values).toEqual(["default", "compact"]);
  });

  it("sets the term column's width and lets the value fill the rest", () => {
    const [group] = manifest.styles.layers[set("columns").cells[0].layers];
    const [term, details] = group.kind === "frame" ? group.layers : [];
    expect(term.kind === "frame" && manifest.styles.boxes[term.box].width).toMatchObject({ value: 160 });
    expect(details).toMatchObject({ kind: "text", fill: true });
  });
});

describe("Segmented", () => {
  it("draws the chosen option as the binding marks it, and not the indicator it hides until then", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "segmented/plain")!;
    const layers = manifest.styles.layers[set.cells[0].layers];
    expect(layers.map((l) => l.slot)).toEqual(["option", "option 2", "option 3"]);
    const [chosen, other] = layers;
    expect(chosen.kind === "frame" && other.kind === "frame" && chosen.surface !== other.surface).toBe(true);
  });
});

describe("Tabs", () => {
  const cell = (orientation: string, variant: string) => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tabs/plain")!;
    return set.cells.find((c) => c.props.orientation === orientation && c.props.variant === variant && c.props.size === "md")!;
  };
  const triggers = (orientation: string, variant: string) => {
    const [list] = manifest.styles.layers[cell(orientation, variant).layers];
    return list.kind === "frame" ? list.layers : [];
  };

  it("marks the selected tab with its indicator on the edge its variant and orientation put it", () => {
    const edge = (o: string, v: string) => triggers(o, v)[0].kind === "frame" && (triggers(o, v)[0] as { layers: { kind: string; side?: string }[] }).layers.find((l) => l.kind === "edge")?.side;
    expect([edge("horizontal", "underline"), edge("horizontal", "hanging"), edge("vertical", "underline"), edge("vertical", "hanging")]).toEqual(["bottom", "top", "right", "left"]);
    const other = triggers("horizontal", "underline")[1];
    expect(other.kind === "frame" && other.layers.some((l) => l.kind === "edge")).toBe(false);
  });

  it("rounds a tab on the side away from its list's rule", () => {
    const [first] = triggers("horizontal", "underline");
    const box = first.kind === "frame" ? manifest.styles.boxes[first.box] : undefined;
    expect(box?.corners?.bottomLeft).toEqual({ value: 0, expression: "0" });
    expect(box?.corners?.topLeft).toEqual({ variable: "--radius-control" });
  });

  it("shows only the selected tab's panel", () => {
    expect(manifest.styles.layers[cell("horizontal", "underline").layers].map((l) => l.slot)).toEqual(["list", "content"]);
  });
});

describe("Accordion", () => {
  it("draws its sections through their display: contents headings, the first open", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "accordion/plain")!;
    expect(set.properties.map((p) => p.name)).toEqual(["heading 1", "answer 1", "heading 2", "answer 2", "heading 3", "answer 3"]);
    const [first, second] = manifest.styles.layers[set.cells[0].layers];
    expect(first.kind === "frame" && first.layers.map((l) => l.slot)).toEqual(["trigger", "content"]);
    expect(second.kind === "frame" && second.layers.map((l) => l.slot)).toEqual(["trigger"]);
  });
});

describe("Pagination", () => {
  it("draws the window around the current page, with the template's own arrows", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "pagination/plain")!;
    const layers = manifest.styles.layers[set.cells[0].layers];
    const glyphs = layers.flatMap((l) => (l.kind === "frame" ? l.layers.flatMap((i) => (i.kind === "icon" ? [i.default] : [])) : []));
    expect(glyphs).toEqual(["chevron-left", "chevron-right"]);
    const pages = layers.flatMap((l) => (l.kind === "frame" ? l.layers.flatMap((t) => (t.kind === "text" ? [t.characters] : [])) : []));
    expect(pages).toEqual(["1", "2", "3", "4", "…", "10"]);
  });
});

describe("Steps", () => {
  it("stacks each step's marker row over its text, and lays the steps across the row", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "steps/markers")!;
    const across = set.cells.find((c) => c.props.orientation === "horizontal")!;
    const [first] = manifest.styles.layers[across.layers];
    expect(first.kind === "frame" && manifest.styles.boxes[first.box]).toMatchObject({ direction: "VERTICAL", grow: true });
    expect(first.kind === "frame" && first.layers.map((l) => l.slot)).toEqual(["marker", "span"]);
    expect(set.cells.find((c) => c.props.orientation === "vertical")).toBeDefined();
  });
});

describe("Checkbox", () => {
  const layersOf = (state: string) => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "checkbox/plain")!;
    const [control] = manifest.styles.layers[set.cells.find((c) => c.props.state === state)!.layers];
    return control.kind === "frame" ? control.layers : [];
  };
  const glyph = (state: string) => layersOf(state).flatMap((l) => (l.kind === "frame" ? l.layers.flatMap((i) => (i.kind === "icon" ? [i.default] : [])) : []));

  it("hides its native input and shows only the glyph its state calls for", () => {
    expect([glyph("unchecked"), glyph("checked"), glyph("indeterminate")]).toEqual([[], ["check"], ["remove"]]);
  });

  it("rings the box, not the label, when its input has focus", () => {
    expect(layersOf("focus").some((l) => l.kind === "ring")).toBe(true);
    expect(layersOf("unchecked").some((l) => l.kind === "ring")).toBe(false);
  });
});
