import { useMemo, useState } from "react";
import { discover } from "@skryensya/ai-compiler/discover";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { library } from "@skryensya/examples";
import { SectionPreview } from "./SectionPreview";
import { Icon } from "@skryensya/react/icon";
import { Details } from "@skryensya/react/details";
import { FormField } from "@skryensya/react/form-field";
import { Input } from "@skryensya/react/input";
import { NativeSelect } from "@skryensya/react/select-native";
import { TileButton, TileContent } from "@skryensya/react/tile";
import { Button } from "@skryensya/react/button";
import { SegmentedControl } from "@skryensya/react/segmented";
import { Heading, Text } from "@skryensya/react/typography";
import {
  canPlaceAt,
  childrenOf,
  findChild,
  fromUsageTree,
  insertable,
  insertionPlace,
  layoutFor,
  buildVariant,
  BLOCK_CATEGORIES,
  blocks,
  catalogue,
  presetFor,
  previewPreset,
  randomId,
  resolve,
  variantsFor,
  walk,
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
const makerHiddenContracts = new Set(["annotation", "chart", "diagram", "expressive-avatar"]);
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
  /* Only the few the menu shows, not the whole catalogue: this runs on every selection, for the bar. */
  const asked = catalogue().filter((ref) => signatures.includes(ref.signature));
  const allowed = insertable(maker.page.root, place, previewPreset, asked);
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

  const allowed = useMemo(() => insertable(root, place, previewPreset, catalogue().filter(makerVisible)), [root, place]);

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

  /*
   * THE SECTIONS: the Maker's own blocks (nav, features, pricing, testimonials, FAQ, call to action, form, footer...) and then the
   * published examples, heroes first. Each is a whole piece of a page; what fits the selection is offered, and a search narrows by
   * name and description. Grouped by what the section is for, so "I need a pricing table" is one heading away.
   */
  const [sectionQuery, setSectionQuery] = useState("");
  /* A page inside a layout already has the layout's header and footer: offering a second navigation bar or footer would put two on it. */
  const framed = useMemo(() => {
    if (maker.isLayout) return [];
    const layout = layoutFor(maker.site, maker.page);
    const has = new Set(layout ? [...walk(layout.root)].map((node) => node.signature) : []);
    return [has.has("Navbar") ? "Navigation" : "", has.has("Footer") ? "Footer" : ""].filter(Boolean);
  }, [maker.site, maker.page, maker.isLayout]);
  const sectionGroups = useMemo(() => {
    type Entry = { id: string; name: string; description: string; category: string; tree: UsageTree };
    const fromBlocks: Entry[] = blocks.map((block) => ({ id: `block:${block.id}`, name: block.name, description: block.description, category: block.category, tree: block.tree }));
    /* A use that exists to sit inside a composition is offered inside it, not as a section of its own. */
    const fromSnippets: Entry[] = library
      .entries("en")
      .filter((example) => example.catalog)
      .map((example) => ({
        id: `snippet:${example.id}`,
        name: example.title,
        description: example.purpose,
        category: example.id.startsWith("hero") ? "Heroes" : "More examples",
        tree: example.tree as UsageTree,
      }));
    const needle = sectionQuery.trim().toLowerCase();
    const fits = [...fromBlocks, ...fromSnippets]
      .filter((entry) => !needle || `${entry.name} ${entry.description} ${entry.category}`.toLowerCase().includes(needle))
      .filter((entry) => !framed.includes(entry.category))
      .filter((entry) => canPlaceAt(root, place, fromUsageTree(entry.tree, () => "preview")));
    const order = ["Navigation", "Heroes", ...BLOCK_CATEGORIES.filter((name) => name !== "Navigation"), "More examples"];
    return order.map((category) => [category, fits.filter((entry) => entry.category === category)] as const).filter(([, entries]) => entries.length > 0);
  }, [root, place, sectionQuery, framed]);

  /* What the keyboard's pick is saying, for someone who cannot see the line on the canvas. */
  const announce = useMemo(() => {
    const active = drag.session;
    if (!active?.keyboard) return "";
    const at = active.at ?? 0;
    const target = active.allowed[at];
    if (!target) return "No place accepts this.";
    const parent = findChild(root, target.parent);
    const siblings = parent && "signature" in parent ? childrenOf(parent, target.slot) : [];
    const name = parent && "signature" in parent ? parent.signature : "the page";
    const label = "signature" in active.child ? active.child.signature : "text";
    const next = siblings[target.index];
    const where = siblings.length === 0 ? `inside ${name}, empty` : next ? `in ${name}, before ${"signature" in next ? next.signature : "text"}` : `in ${name}, at the end`;
    return `${label}: ${where}. Place ${at + 1} of ${active.allowed.length}. Up and Down choose, Enter drops, Escape cancels.`;
  }, [drag.session, root]);

  const insert = (make: () => MakerChild) => {
    const child = make();
    maker.gesture([{ type: "insert", at: place, child }], child.id);
  };

  /*
   * DRAGGING, WITH THE KEYBOARD. Enter inserts where the selection says; Shift+Enter instead picks the place:
   * Up and Down walk the places the contract allows (the same list a drag is offered), the canvas shows the
   * one chosen, Enter drops there and Escape gives up. Leaving the item gives up too, so no pick-up is left
   * half-held behind a Tab.
   */
  const pickPlace = (make: () => MakerChild) => ({
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "Enter" || !event.shiftKey || drag.session) return;
      event.preventDefault();
      drag.beginKeyboard(make(), place);
    },
    onBlur: () => {
      if (drag.session?.keyboard) drag.end(false);
    },
  });

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
            {shown.length} fit {whereItGoes}. Enter inserts there; Shift+Enter lets you choose where.
          </Text>
          <p className="sk-visually-hidden" role="status" aria-live="assertive">
            {announce}
          </p>
          {/* Where each insert is wrapped is a decision most inserts never need: folded, with its own words. */}
          <Details>
            <Details.Summary>Wrapping</Details.Summary>
            <Details.Content>
              <FormField label="Wrap in" hint="Automatic puts each preset in the wrapper it is usually in.">
                <NativeSelect
                  value={wrap}
                  onChange={(event) => setWrap(event.currentTarget.value as typeof wrap)}
                  options={[{ value: "auto", label: "Automatic" }, ...wrapperChoices.map((choice) => ({ value: choice.id, label: choice.label }))]}
                />
              </FormField>
            </Details.Content>
          </Details>
          <div className="maker-palette__list">
            {groups.map(([category, refs]) => (
              <section key={category} aria-label={category}>
                <Heading as="h3" size="h6" className="maker-palette__category">{category}</Heading>
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
                          <TileButton className="maker-palette__item--component" onClick={() => insert(make)} onPointerDown={pressToDrag(make)} {...pickPlace(make)}>
                            <TileContent title={paletteName(ref.signature)} />
                            <ComponentThumbnail ref_={ref} />
                          </TileButton>
                          {others.length > 0 ? (
                            <Button
                              className="maker-palette__expand"
                              size="xs"
                              variant="soft"
                              aria-expanded={expanded}
                              aria-label={`${ref.signature}: ${others.length} presets`}
                              post={<Icon name={expanded ? "chevron-up" : "chevron-down"} />}
                              onClick={() => setOpen((current) => toggled(current, key))}
                            >
                              {others.length}
                            </Button>
                          ) : null}
                        </div>
                        {expanded ? (
                          <ul className="maker-palette__variants" aria-label={`${ref.signature} presets`}>
                            {others
                              .filter((variant) => canPlaceAt(root, place, buildVariant(variant, wrap, () => "preview")))
                              .map((variant) => (
                                <VariantRow key={variant.id} ref_={ref} variant={variant} wrap={wrap} insert={insert} pressToDrag={pressToDrag} pickPlace={pickPlace} />
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
        <>
          <div className="maker-palette__search">
            <Icon name="search" />
            <Input type="search" placeholder="Search sections" aria-label="Search sections" value={sectionQuery} onChange={(event) => setSectionQuery(event.currentTarget.value)} />
          </div>
          <Text size="sm" tone="tertiary">Whole parts of a page. Click to add {whereItGoes}, or drag one in.</Text>
          {framed.length > 0 ? <Text size="sm" tone="tertiary">This page's layout already has {framed.includes("Navigation") && framed.includes("Footer") ? "the header and the footer" : framed.includes("Navigation") ? "the header" : "the footer"}, so {framed.length > 1 ? "those sections are" : "that section is"} not offered here.</Text> : null}
          <div className="maker-palette__list">
            {sectionGroups.length === 0 ? <Text size="sm">{sectionQuery ? "No section matches." : "No section fits at the selection."}</Text> : null}
            {sectionGroups.map(([category, entries]) => (
              <section key={category} aria-label={category}>
                <Heading as="h3" size="h6" className="maker-palette__category">{category}</Heading>
                <ul className="maker-palette__sections">
                  {entries.map((entry) => {
                    const make = () => fromUsageTree(entry.tree, randomId);
                    return (
                      <li key={entry.id}>
                        <TileButton className="maker-palette__section" onClick={() => insert(make)} onPointerDown={pressToDrag(make)} {...pickPlace(make)}>
                          <SectionPreview tree={entry.tree} scheme={maker.view.scheme} />
                          <TileContent title={entry.name} description={entry.description} />
                        </TileButton>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ComponentThumbnail({ ref_, variant }: { ref_: SignatureRef; variant?: string }) {
  const category = resolve(ref_)?.contract.category ?? "other";
  return (
    <span className="maker-palette__thumb" data-category={category} aria-hidden="true">
      <img className="maker-palette__thumb-image maker-palette__thumb-image--light" src={thumbnailSrc(ref_, "light", variant)} alt="" draggable={false} loading="lazy" onError={(event) => (event.currentTarget.hidden = true)} />
      <img className="maker-palette__thumb-image maker-palette__thumb-image--dark" src={thumbnailSrc(ref_, "dark", variant)} alt="" draggable={false} loading="lazy" onError={(event) => (event.currentTarget.hidden = true)} />
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
  pickPlace,
}: {
  ref_: SignatureRef;
  variant: Variant;
  wrap: "auto" | WrapperId;
  insert: (make: () => MakerChild) => void;
  pressToDrag: (make: () => MakerChild) => (event: React.PointerEvent<HTMLButtonElement>) => void;
  pickPlace: (make: () => MakerChild) => { onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void; onBlur: () => void };
}) {
  const make = () => buildVariant(variant, wrap, randomId);
  const arrivesIn = wrap === "auto" ? variant.wrapper : wrap;
  return (
    <li>
      <TileButton onClick={() => insert(make)} onPointerDown={pressToDrag(make)} {...pickPlace(make)}>
        {variant.source === "curated" ? <ComponentThumbnail ref_={ref_} variant={variant.id} /> : null}
        <TileContent title={variant.name} description={[variant.description, arrivesIn !== "none" ? `in ${arrivesIn}` : ""].filter(Boolean).join(" · ")} />
      </TileButton>
    </li>
  );
}
