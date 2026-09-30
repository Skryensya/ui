import { beforeAll, describe, expect, it } from "vitest";
import { buildFigmaManifest } from "./build.js";
import type { ComponentSet, FigmaManifest, Layer } from "./manifest-types.js";
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
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tabs")!;
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
    expect(set.properties.map((p) => p.name).slice(0, 3)).toEqual(["title 1", "description 1", "answer 1"]);
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
    expect(first.kind === "frame" && first.layers.map((l) => l.slot)).toEqual(["after", "marker", "span"]);
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

describe("Switch", () => {
  it("slides its thumb to the end when on, as the track's leading padding", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "switch/plain")!;
    const lead = (state: string) => {
      const [control] = manifest.styles.layers[set.cells.find((c) => c.props.state === state)!.layers];
      return control.kind === "frame" ? manifest.styles.boxes[control.box].padding.left : undefined;
    };
    expect(lead("on")).not.toEqual(lead("off"));
  });
});

describe("Radio", () => {
  it("draws its circle from the ::before its dot sits centred in, ringed on focus", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "radio/plain")!;
    const circle = (state: string) => {
      const [control] = manifest.styles.layers[set.cells.find((c) => c.props.state === state)!.layers];
      return control.kind === "frame" ? control.layers[0] : undefined;
    };
    expect(circle("checked")?.kind === "frame" && circle("checked")!.slot).toBe("before");
    const checked = circle("checked");
    expect(checked?.kind === "frame" && checked.layers.map((l) => l.slot)).toEqual(["radioIndicator"]);
    const focus = circle("focus");
    expect(focus?.kind === "frame" && focus.layers.some((l) => l.kind === "ring")).toBe(true);
  });
});

describe("Select", () => {
  it("draws its closed trigger holding the value the binding writes, and not the hidden list", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "select/plain")!;
    expect(set.properties.map((p) => p.name)).toEqual(["value"]);
    expect(manifest.styles.layers[set.cells[0].layers].map((l) => l.slot)).toEqual(["control"]);
  });
});

describe("PasswordInput", () => {
  it("holds its placeholder in the field and shows only the eye its state offers", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "password-input/plain")!;
    const [control] = manifest.styles.layers[set.cells[0].layers];
    const [field, trigger] = control.kind === "frame" ? control.layers : [];
    expect(field.kind === "frame" && field.layers.map((l) => l.slot)).toEqual(["placeholder"]);
    const glyphs = (l: typeof trigger): string[] => (l.kind === "icon" ? [l.default] : l.kind === "frame" ? l.layers.flatMap(glyphs) : []);
    expect(glyphs(trigger)).toEqual(["visibility"]);
  });
});

describe("NumberField", () => {
  it("shows its value centred in the field, between its two steppers", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "number-field/plain")!;
    const [control] = manifest.styles.layers[set.cells[0].layers];
    const layers = control.kind === "frame" ? control.layers : [];
    expect(layers.map((l) => l.slot)).toEqual(["decrement", "input", "increment"]);
    const field = layers[1];
    expect(field.kind === "frame" && field.layers[0]).toMatchObject({ kind: "text", slot: "value", fill: true, text: { align: "CENTER" } });
  });
});

describe("List", () => {
  it("draws its rows with their icons, and dividers between them only when on", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "list")!;
    const rules = (dividers: string) =>
      manifest.styles.layers[set.cells.find((c) => c.props.dividers === dividers && c.props.density === "default")!.layers].map((l) =>
        l.kind === "frame" ? manifest.styles.surfaces[l.surface].strokes.length : 0,
      );
    expect(rules("true")).toEqual([0, 1, 1]);
    expect(rules("false")).toEqual([0, 0, 0]);
  });
});

describe("NavList", () => {
  it("labels its group and fills each item with its link, the current one marked", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "nav-list")!;
    expect(set.properties.map((p) => p.name)).toEqual(["group 1", "link 1", "link 2", "link 3"]);
    const [group] = manifest.styles.layers[set.cells.find((c) => c.props.orientation === "vertical")!.layers];
    const list = group.kind === "frame" ? group.layers[1] : undefined;
    const [first, second] = list?.kind === "frame" ? list.layers : [];
    const link = (item: typeof first) => (item?.kind === "frame" ? item.layers[0] : undefined);
    const a = link(first), b = link(second);
    expect(a?.kind === "frame" && manifest.styles.boxes[a.box].grow).toBe(true);
    expect(a?.kind === "frame" && b?.kind === "frame" && a.surface !== b.surface).toBe(true);
  });
});

describe("Timeline", () => {
  it("places each event's marker on the rail where its insets put it, its texts as properties", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "timeline")!;
    expect(set.properties.map((p) => p.name).slice(0, 3)).toEqual(["time 1", "heading 1", "body 1"]);
    const [item] = manifest.styles.layers[set.cells[0].layers];
    const marker = item.kind === "frame" ? item.layers[0] : undefined;
    expect(marker?.kind === "frame" && manifest.styles.boxes[marker.box].absolute).toEqual({ x: 8, y: -3 });
  });
});

describe("Callout, at a width", () => {
  it("wraps its message beside the icon, the icon's box shown and hidden with it", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "callout/plain")!;
    expect(set.properties.find((p) => p.name === "icon")?.default).toBe(true);
    const [icon, content] = manifest.styles.layers[set.cells[0].layers];
    expect(icon).toMatchObject({ kind: "frame", slot: "icon", visibleProperty: "icon" });
    expect(content.kind === "frame" && content.layers.every((l) => l.kind === "text" && l.fill)).toBe(true);
    expect(manifest.styles.boxes[set.cells[0].box].gap).toBeDefined();
  });
});

describe("Steps' connectors", () => {
  const items = (id: string, orientation: string) => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === id)!;
    return manifest.styles.layers[set.cells.find((c) => c.props.orientation === orientation)!.layers];
  };
  const connector = (item: Layer) => (item.kind === "frame" ? item.layers.find((l) => l.slot === "after") : undefined);

  it("joins each marker to the next, from the step's centre across its width", () => {
    const [first, , last] = items("steps/markers", "horizontal");
    const line = connector(first);
    expect(line?.kind === "frame" && manifest.styles.boxes[line.box]).toMatchObject({ absolute: { x: 80 }, width: { value: 160 } });
    expect(connector(last)).toBeUndefined();
  });

  it("runs down to the step's bottom edge when vertical", () => {
    const line = connector(items("steps/markers", "vertical")[0]);
    expect(line?.kind === "frame" && manifest.styles.boxes[line.box].absolute?.reach).toBe("bottom");
  });

  it("draws segments as bars alone, their hidden labels leaving no empty box", () => {
    for (const item of items("steps/segments", "horizontal")) expect(item.kind === "frame" && item.layers.map((l) => l.slot)).toEqual(["marker"]);
  });
});

describe("Segmented's options", () => {
  it("fill the control's height, as a flex row of set height stretches them", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "segmented/plain")!;
    for (const option of manifest.styles.layers[set.cells[0].layers]) expect(option.kind === "frame" && manifest.styles.boxes[option.box].stretch).toBe(true);
  });
});

describe("Details", () => {
  it("shows its summary alone when closed, the answer under it when open, with the matching chevron", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "details/plain")!;
    const glyphs = (ls: Layer[]): string[] => ls.flatMap((l) => (l.kind === "icon" ? [l.default] : l.kind === "frame" ? glyphs(l.layers) : []));
    const cell = (open: string) => manifest.styles.layers[set.cells.find((c) => c.props.open === open)!.layers];
    expect(cell("false").map((l) => l.slot)).toEqual(["nativeSummary"]);
    expect(cell("true").map((l) => l.slot)).toEqual(["nativeSummary", "nativeContent"]);
    expect([glyphs(cell("false")), glyphs(cell("true"))]).toEqual([["chevron-down"], ["chevron-up"]]);
    expect(manifest.styles.boxes[set.cells[0].box].direction).toBe("VERTICAL");
  });
});

describe("Accordion's triggers", () => {
  it("carry the tile content and a chevron turned by whether the section is open", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "accordion/plain")!;
    const glyphs = (ls: Layer[]): string[] => ls.flatMap((l) => (l.kind === "icon" ? [l.default] : l.kind === "frame" ? glyphs(l.layers) : []));
    const [open, closed] = manifest.styles.layers[set.cells[0].layers];
    expect([open, closed].map((l) => (l.kind === "frame" ? glyphs(l.layers) : []))).toEqual([["chevron-up"], ["chevron-down"]]);
  });
});

describe("TileLink", () => {
  it("holds its title over its description, ringed on focus", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tile-link/plain")!;
    expect(set.properties.map((p) => p.name)).toEqual(["title 1", "description 1"]);
    const focus = manifest.styles.layers[set.cells.find((c) => c.props.state === "focus")!.layers];
    expect(focus.some((l) => l.kind === "ring")).toBe(true);
  });
});

describe("TileCheckbox", () => {
  it("checks its box and edges the card in the accent when its input is checked", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tile-checkbox/plain")!;
    const cell = (state: string) => set.cells.find((c) => c.props.state === state)!;
    expect(manifest.styles.surfaces[cell("checked").surface].strokes[0]).toMatchObject({ color: { variable: "--color-border-accent" } });
    expect(cell("checked").surface).not.toBe(cell("unchecked").surface);
  });
});

describe("TileSwitch", () => {
  it("fills its track and slides its thumb when on", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tile-switch/plain")!;
    const track = (state: string) => manifest.styles.layers[set.cells.find((c) => c.props.state === state)!.layers].find((l) => l.slot === "control");
    const on = track("on"), off = track("off");
    expect(on?.kind === "frame" && off?.kind === "frame" && manifest.styles.boxes[on.box].padding.left).not.toEqual(off?.kind === "frame" && manifest.styles.boxes[off.box].padding.left);
  });
});

describe("ExpandableTile", () => {
  it("opens to show its content, its chevron turned", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "expandable-tile/plain")!;
    const glyphs = (ls: Layer[]): string[] => ls.flatMap((l) => (l.kind === "icon" ? [l.default] : l.kind === "frame" ? glyphs(l.layers) : []));
    const cell = (state: string) => manifest.styles.layers[set.cells.find((c) => c.props.state === state)!.layers];
    expect([glyphs(cell("closed")), glyphs(cell("open"))]).toEqual([["chevron-down"], ["chevron-up"]]);
    expect(cell("open").length).toBe(cell("closed").length + 1);
  });
});

describe("RadioGroup", () => {
  it("dots the chosen option only", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "radio-group/plain")!;
    const dots = manifest.styles.layers[set.cells[0].layers].map((radio) => JSON.stringify(radio).includes('"radioIndicator"'));
    expect(dots).toEqual([true, false, false]);
  });
});

describe("CheckboxGroup", () => {
  it("draws its labelled parent over its options, the given ones checked", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "checkbox-group/plain")!;
    expect(set.properties.map((p) => p.name)).toEqual(["label", "items 1", "items 2", "items 3"]);
    const text = JSON.stringify(manifest.styles.layers[set.cells[0].layers]);
    expect(text.match(/"default":"check"/g)?.length).toBe(2);
  });
});

describe("TileRadioGroup", () => {
  it("picks one card, edged in the accent with a dot in its indicator", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tile-radio-group/plain")!;
    const dots = manifest.styles.layers[set.cells[0].layers].map((card) =>
      card.kind === "frame" ? card.layers.some((l) => l.kind === "frame" && l.slot === "selectionIndicator" && l.layers.length > 0) : false,
    );
    expect(dots).toEqual([false, true, false]);
  });
});

describe("Tooltip", () => {
  it("draws the open bubble alone, its hint the one property", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tooltip")!;
    expect(set.properties.map((p) => p.name)).toEqual(["content"]);
    expect(manifest.styles.layers[set.cells[0].layers].map((l) => l.slot)).toEqual(["content"]);
  });
});

describe("StateButton", () => {
  it("shows only its current face", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "state-button")!;
    const icons = manifest.styles.layers[set.cells[0].layers].filter((l) => l.kind === "icon");
    expect(icons.map((l) => l.kind === "icon" && l.default)).toEqual(["mode-light"]);
  });
});

describe("CopyButton", () => {
  it("shows the copy glyph at rest and the check once copied", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "copy-button/plain")!;
    const glyphs = (ls: Layer[]): string[] => ls.flatMap((l) => (l.kind === "icon" ? [l.default] : l.kind === "frame" ? glyphs(l.layers) : []));
    const cell = (state: string) => manifest.styles.layers[set.cells.find((c) => c.props.state === state && c.props.size === "sm" && c.props.variant === "soft")!.layers];
    expect([glyphs(cell("rest")), glyphs(cell("copied"))]).toEqual([["copy"], ["check"]]);
  });
});

describe("SplitButton", () => {
  it("welds its action to the menu's chevron, the action's label a property", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "split-button")!;
    expect(set.properties.map((p) => p.name)).toEqual(["action 1"]);
    const [button, menu] = manifest.styles.layers[set.cells[0].layers];
    const corners = (l: Layer) => (l.kind === "frame" ? manifest.styles.boxes[l.box].corners : undefined);
    expect(corners(button)?.topRight).toEqual({ value: 0, expression: "0" });
    expect(JSON.stringify(menu)).toContain('"default":"chevron-down"');
  });
});

describe("FormField", () => {
  it("labels an Input, starring the label when required", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "form-field")!;
    const cell = (required: string) => manifest.styles.layers[set.cells.find((c) => c.props.required === required && c.props.disabled === "false")!.layers];
    expect(cell("false").map((l) => l.slot)).toEqual(["label", "hint", "input"]);
    expect(JSON.stringify(cell("true")[0])).toContain('"characters":"*"');
  });
});

describe("AvatarGroup", () => {
  it("stacks its avatars a third over one another, as a negative gap", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "avatar-group")!;
    expect(manifest.styles.boxes[set.cells[0].box].gap).toMatchObject({ value: -13.333 });
    expect(manifest.styles.layers[set.cells[0].layers]).toHaveLength(4);
  });
});

describe("BadgeHolder", () => {
  it("pins its badge to the avatar's top right corner, shifted out by a third of itself", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "badge-holder")!;
    const badge = manifest.styles.layers[set.cells[0].layers][1];
    expect(badge.kind === "frame" && manifest.styles.boxes[badge.box].absolute).toEqual({ x: 0, y: 0, fromRight: true, shift: { x: 0.35, y: -0.35 } });
  });
});

describe("OtpInput", () => {
  it("draws its label over four segments, each holding the placeholder", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "otp-input")!;
    const [label, control] = manifest.styles.layers[set.cells[0].layers];
    expect(label.slot).toBe("label");
    expect(control.kind === "frame" && control.layers.map((l) => (l.kind === "frame" ? l.layers[0]?.slot : undefined))).toEqual(["placeholder", "placeholder", "placeholder", "placeholder"]);
  });
});

describe("Toolbar", () => {
  it("groups two tools, a separator, and a third, each tool its own glyph", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "toolbar/plain")!;
    const layers = manifest.styles.layers[set.cells[0].layers];
    expect(layers.map((l) => l.slot)).toEqual(["group", "separator", "button"]);
    const glyphs = (ls: Layer[]): string[] => ls.flatMap((l) => (l.kind === "icon" ? [l.default] : l.kind === "frame" ? glyphs(l.layers) : []));
    expect(glyphs(layers)).toEqual(["copy", "edit", "delete"]);
  });
});

describe("TagsInput", () => {
  it("holds its tags, each with a remove button, then the field's placeholder", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tags-input/plain")!;
    const [control] = manifest.styles.layers[set.cells[0].layers];
    expect(control.kind === "frame" && control.layers.map((l) => l.slot)).toEqual(["item", "item 2", "input"]);
    expect(JSON.stringify(control)).toContain('"slot":"remove"');
  });
});

describe("Tag, removable", () => {
  it("adds its close button when removable", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "tag/plain")!;
    const cell = (removable: string) => manifest.styles.layers[set.cells.find((c) => c.props.removable === removable && c.props.tone === "neutral")!.layers];
    expect(cell("false").map((l) => l.slot)).toEqual(["children"]);
    expect(JSON.stringify(cell("true"))).toContain('"default":"close"');
  });
});

describe("Dialog", () => {
  it("draws the open panel: header with its close button, the message, and a footer of actions", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "dialog/plain")!;
    expect(manifest.styles.layers[set.cells[0].layers].map((l) => l.slot)).toEqual(["header", "body", "footer"]);
    expect(set.properties.map((p) => p.name)).toEqual(["title", "children", "action 1", "action 2"]);
  });
});

describe("Menu", () => {
  it("draws its open list alone, one row per command", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "menu")!;
    expect(set.axes.map((a) => a.name)).toEqual(["density"]);
    expect(manifest.styles.layers[set.cells[0].layers].map((l) => l.slot)).toEqual(["item", "item 2", "item 3"]);
  });
});

describe("Popover", () => {
  it("draws its open panel alone, held open as :popover-open", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "popover/plain")!;
    expect(manifest.styles.layers[set.cells[0].layers].map((l) => l.slot)).toEqual(["title", "description", "children", "close"]);
  });
});

describe("Hero", () => {
  it("holds a heading, a line and an action on each surface", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "hero")!;
    expect(set.properties.map((p) => p.name)).toEqual(["title 1", "lede 1", "action 1"]);
    expect(new Set(set.cells.map((c) => c.surface)).size).toBeGreaterThan(1);
  });
});
