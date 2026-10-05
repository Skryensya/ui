import { useMemo, useState } from "react";
import { discover } from "@skryensya/ai-compiler/discover";
import { snippets } from "@skryensya/snippets";
import { Icon } from "@skryensya/react/icon";
import { Input } from "@skryensya/react/input";
import { SegmentedControl } from "@skryensya/react/segmented";
import { Text } from "@skryensya/react/typography";
import {
  canPlaceAt,
  childrenOf,
  findChild,
  fromUsageTree,
  insertable,
  insertionPlace,
  buildVariant,
  presetFor,
  randomId,
  resolve,
  variantsFor,
  wrapperChoices,
  type MakerChild,
  type Place,
  type SignatureRef,
  type Variant,
  type WrapperId,
} from "@skryensya/maker-model";
import index from "../../../artifacts/ai-index.json";
import { DRAG_THRESHOLD, type Drag } from "./drag";
import { glyphFor, MakerIcon } from "./icons";
import type { Maker } from "./state";

/*
 * THE PALETTE offers only what may go where the insertion would land: inside the selected container,
 * or right after the selected node. "Components" is the whole catalogue, narrowed by that and by
 * Discovery when something is typed (lexical, decision 26: it narrows, it never ranks by taste).
 * "Sections" are the published snippets, inserted as a subtree with fresh identities and no link
 * back to where they came from.
 *
 * Click inserts at that place; dragging lets the drop decide the place instead.
 */

/** The signatures offered first, in this order, while nothing is typed in the search. */
const COMMON: readonly string[] = ["Heading", "Text", "Button.action", "Stack", "Inline", "Box"];

const compiled = index as unknown as Parameters<typeof discover>[0];
const makerHiddenContracts = new Set(["annotation", "chart", "diagram"]);
const makerVisible = (ref: SignatureRef) => !makerHiddenContracts.has(ref.contract);
const thumbnailSrc = (ref: SignatureRef, scheme: "light" | "dark", variant?: string) =>
  `/component-thumbnails/${ref.contract}-${ref.signature.replace(/[^a-z0-9]+/gi, "-")}${variant ? `--${variant}` : ""}-${scheme}.png`;

/** `Button.action` and `Button.navigation` are two kinds of Button: named so, not by the contract's dotted id. */
const paletteName = (signature: string) => {
  const [name, ...kind] = signature.split(".");
  return kind.length > 0 ? `${name} (${kind.join(" ")})` : signature;
};

/** Where an insert lands: inside the selected container, after the selected node, or at the page's end. */
export function insertionFor(maker: Maker): Place {
  const root = maker.page.root;
  return (maker.view.selected ? insertionPlace(root, maker.view.selected) : undefined) ?? { parent: root.id, slot: "children", index: childrenOf(root, "children").length };
}

/**
 * The signatures a quick insert (the bar's Insert menu) offers, among those the contract allows at
 * the insertion place: `undefined` where it may not go, so the menu shows it unavailable rather than
 * inserting somewhere the palette would not.
 */
export function quickInserts(maker: Maker, signatures: readonly string[]): readonly { signature: string; insert?: () => void }[] {
  const place = insertionFor(maker);
  const allowed = insertable(maker.page.root, place, (ref) => presetFor(ref, () => "preview"));
  return signatures.map((signature) => {
    const ref = allowed.find((entry) => entry.signature === signature);
    return {
      signature,
      insert: ref
        ? () => {
            const child = presetFor(ref, randomId)!;
            maker.gesture([{ type: "insert", at: place, child }], child.id);
          }
        : undefined,
    };
  });
}

export function Palette({ maker, drag }: { maker: Maker; drag: Drag }) {
  const [tab, setTab] = useState<"components" | "sections">("components");
  const [query, setQuery] = useState("");
  /* Which components show their presets, and the wrapper everything inserted from here arrives in. */
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [wrap, setWrap] = useState<"auto" | WrapperId>("auto");
  const root = maker.page.root;
  const place: Place = useMemo(() => insertionFor(maker), [root, maker.view.selected]);

  /* Said in words, since it is not always "inside the selection": after a heading, it is below it. */
  const whereItGoes = useMemo(() => {
    const parent = findChild(root, place.parent);
    const parentName = parent && "signature" in parent ? parent.signature : "the page";
    const before = parent && "signature" in parent ? childrenOf(parent, place.slot)[place.index - 1] : undefined;
    if (maker.view.selected && before && before.id === maker.view.selected) {
      return `after ${"signature" in before ? before.signature : "this text"}, in ${parentName}`;
    }
    return parent?.id === root.id ? "at the end of the page" : `inside ${parentName}, at the end`;
  }, [root, place, maker.view.selected]);

  const allowed = useMemo(() => insertable(root, place, (ref) => presetFor(ref, () => "preview")).filter(makerVisible), [root, place]);

  const keyOf = (ref: SignatureRef) => `${ref.contract}/${ref.signature}`;

  /* A preset is found by its name too ("destructive", "icon only"), and its component then opens to show it. */
  const byVariantName = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return new Set<string>();
    return new Set(allowed.filter((ref) => variantsFor(ref).some((variant) => variant.id !== "default" && variant.name.toLowerCase().includes(needle))).map(keyOf));
  }, [allowed, query]);

  const shown: readonly SignatureRef[] = useMemo(() => {
    if (!query.trim()) return allowed;
    const found = discover(compiled, [], { query, limit: 50 }).candidates;
    const ok = new Set(allowed.map(keyOf));
    const fromDiscovery = found.map((c) => ({ contract: c.contract, signature: c.signature })).filter((ref) => ok.has(keyOf(ref)));
    const seen = new Set(fromDiscovery.map(keyOf));
    return [...fromDiscovery, ...allowed.filter((ref) => byVariantName.has(keyOf(ref)) && !seen.has(keyOf(ref)))];
  }, [allowed, query, byVariantName]);

  const groups = useMemo(() => {
    const byCategory = new Map<string, SignatureRef[]>();
    for (const ref of shown) {
      /* With nothing typed, the blocks nearly every page starts from come first, in one short group. */
      const category = !query.trim() && COMMON.includes(ref.signature) ? "common" : (resolve(ref)?.contract.category ?? "other");
      byCategory.set(category, [...(byCategory.get(category) ?? []), ref]);
    }
    const rank = (name: string) => (name === "common" ? 0 : name === "layout" ? 1 : 2);
    const order = (ref: SignatureRef) => COMMON.indexOf(ref.signature);
    for (const refs of [byCategory.get("common")]) refs?.sort((a, b) => order(a) - order(b));
    return [...byCategory.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  }, [shown, query]);

  const sections = useMemo(
    () =>
      snippets
        .map((snippet) => ({ snippet, child: fromUsageTree(snippet.tree, () => "preview") }))
        .filter(({ child }) => canPlaceAt(root, place, child)),
    [root, place],
  );

  const insert = (make: () => MakerChild) => {
    const child = make();
    maker.gesture([{ type: "insert", at: place, child }], child.id);
  };

  const pressToDrag = (make: () => MakerChild) => (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const target = event.currentTarget;
    const start = { x: event.clientX, y: event.clientY };
    let dragging = false;
    const onMove = (move: PointerEvent) => {
      if (dragging || Math.hypot(move.clientX - start.x, move.clientY - start.y) < DRAG_THRESHOLD) return;
      dragging = true;
      target.setPointerCapture(event.pointerId);
      /* A drag that ends in a drop must not also be the click that inserts at the selection. */
      target.addEventListener("click", (click) => click.stopPropagation(), { capture: true, once: true });
      drag.begin(make(), true);
      drag.move(move.clientX, move.clientY);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="maker-palette">
      <SegmentedControl
        className="maker-palette__tabs"
        label="Palette"
        size="md"
        value={tab}
        onValueChange={(value) => setTab(value as typeof tab)}
        options={[
          { value: "components", label: "Components" },
          { value: "sections", label: "Sections" },
        ]}
      />
      {tab === "components" ? (
        <>
          <div className="maker-palette__search">
            <Icon name="search" />
            <Input type="search" placeholder="Search the catalogue" aria-label="Search the catalogue" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
          </div>
          <Text size="sm" tone="tertiary">
            {shown.length} fit {whereItGoes}
          </Text>
          {/* Where each insert is wrapped is a decision most inserts never need: folded, with its own words. */}
          <details className="maker-palette__advanced">
            <summary>Wrapping</summary>
            <label className="maker-palette__wrap">
              <span>Wrap in</span>
              <select value={wrap} onChange={(event) => setWrap(event.currentTarget.value as typeof wrap)} aria-describedby="maker-wrap-hint">
                <option value="auto">Automatic</option>
                {wrapperChoices.map((choice) => (
                  <option key={choice.id} value={choice.id}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
            <Text size="sm" tone="tertiary" id="maker-wrap-hint">
              Automatic puts each preset in the wrapper it is usually in.
            </Text>
          </details>
          <div className="maker-palette__list">
            {groups.map(([category, refs]) => (
              <section key={category} aria-label={category}>
                <h3 className="maker-palette__category">{category}</h3>
                <ul>
                  {refs.map((ref) => {
                    const key = keyOf(ref);
                    const variants = variantsFor(ref);
                    const [base, ...others] = variants;
                    const make = () => buildVariant(base!, wrap, randomId);
                    const expanded = open.has(key) || byVariantName.has(key);
                    return (
                      <li key={key} className="maker-palette__entry">
                        <div className="maker-palette__row">
                          <button type="button" className="maker-palette__item maker-palette__item--component" onClick={() => insert(make)} onPointerDown={pressToDrag(make)}>
                            <span className="maker-palette__label">{paletteName(ref.signature)}</span>
                            <ComponentThumbnail ref_={ref} />
                          </button>
                          {others.length > 0 ? (
                            <button
                              type="button"
                              className="maker-palette__expand"
                              aria-expanded={expanded}
                              aria-label={`${ref.signature}: ${others.length} presets`}
                              onClick={() => setOpen((current) => toggled(current, key))}
                            >
                              <span aria-hidden="true">{others.length}</span>
                              <Icon name={expanded ? "chevron-up" : "chevron-down"} />
                            </button>
                          ) : null}
                        </div>
                        {expanded ? (
                          <ul className="maker-palette__variants" aria-label={`${ref.signature} presets`}>
                            {others
                              .filter((variant) => canPlaceAt(root, place, buildVariant(variant, wrap, () => "preview")))
                              .map((variant) => (
                                <VariantRow key={variant.id} ref_={ref} variant={variant} wrap={wrap} insert={insert} pressToDrag={pressToDrag} />
                              ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="maker-palette__list">
          {sections.length === 0 ? <Text size="sm">No section fits at the selection.</Text> : null}
          <ul>
            {sections.map(({ snippet }) => {
              const make = () => fromUsageTree(snippet.tree, randomId);
              return (
                <li key={snippet.id}>
                  <button type="button" className="maker-palette__item maker-palette__item--section" onClick={() => insert(make)} onPointerDown={pressToDrag(make)}>
                    <strong>{snippet.id.replace(/-/g, " ")}</strong>
                    <span>{snippet.intent}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function ComponentThumbnail({ ref_, variant }: { ref_: SignatureRef; variant?: string }) {
  const category = resolve(ref_)?.contract.category ?? "other";
  return (
    <span className="maker-palette__thumb" data-category={category} aria-hidden="true">
      <img className="maker-palette__thumb-image maker-palette__thumb-image--light" src={thumbnailSrc(ref_, "light", variant)} alt="" loading="lazy" onError={(event) => (event.currentTarget.hidden = true)} />
      <img className="maker-palette__thumb-image maker-palette__thumb-image--dark" src={thumbnailSrc(ref_, "dark", variant)} alt="" loading="lazy" onError={(event) => (event.currentTarget.hidden = true)} />
      <span className="maker-palette__thumb-fallback">
        <MakerIcon icon={{ glyph: glyphFor(ref_.signature) ?? "component" }} />
      </span>
    </span>
  );
}

const toggled = (set: ReadonlySet<string>, key: string): ReadonlySet<string> => {
  const next = new Set(set);
  if (!next.delete(key)) next.add(key);
  return next;
};

function VariantRow({
  ref_,
  variant,
  wrap,
  insert,
  pressToDrag,
}: {
  ref_: SignatureRef;
  variant: Variant;
  wrap: "auto" | WrapperId;
  insert: (make: () => MakerChild) => void;
  pressToDrag: (make: () => MakerChild) => (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const make = () => buildVariant(variant, wrap, randomId);
  const arrivesIn = wrap === "auto" ? variant.wrapper : wrap;
  return (
    <li>
      <button type="button" className="maker-palette__item maker-palette__variant" onClick={() => insert(make)} onPointerDown={pressToDrag(make)}>
        {variant.source === "curated" ? <ComponentThumbnail ref_={ref_} variant={variant.id} /> : null}
        <strong>{variant.name}</strong>
        {variant.description ? <span>{variant.description}</span> : null}
        {arrivesIn !== "none" ? <small>in {arrivesIn}</small> : null}
      </button>
    </li>
  );
}
