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
  fromUsageTree,
  insertable,
  insertionPlace,
  presetFor,
  randomId,
  resolve,
  type MakerChild,
  type Place,
  type SignatureRef,
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

const compiled = index as unknown as Parameters<typeof discover>[0];

export function Palette({ maker, drag }: { maker: Maker; drag: Drag }) {
  const [tab, setTab] = useState<"components" | "sections">("components");
  const [query, setQuery] = useState("");
  const root = maker.page.root;
  const place: Place = useMemo(
    () => (maker.view.selected ? insertionPlace(root, maker.view.selected) : undefined) ?? { parent: root.id, slot: "children", index: childrenOf(root, "children").length },
    [root, maker.view.selected],
  );

  const allowed = useMemo(() => insertable(root, place, (ref) => presetFor(ref, () => "preview")), [root, place]);

  const shown: readonly SignatureRef[] = useMemo(() => {
    if (!query.trim()) return allowed;
    const found = discover(compiled, [], { query, limit: 50 }).candidates;
    const ok = new Set(allowed.map((ref) => `${ref.contract}/${ref.signature}`));
    return found.map((c) => ({ contract: c.contract, signature: c.signature })).filter((ref) => ok.has(`${ref.contract}/${ref.signature}`));
  }, [allowed, query]);

  const groups = useMemo(() => {
    const byCategory = new Map<string, SignatureRef[]>();
    for (const ref of shown) {
      const category = resolve(ref)?.contract.category ?? "other";
      byCategory.set(category, [...(byCategory.get(category) ?? []), ref]);
    }
    return [...byCategory.entries()].sort(([a], [b]) => (a === "layout" ? -1 : b === "layout" ? 1 : a.localeCompare(b)));
  }, [shown]);

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
        label="Palette"
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
            {shown.length} that fit {maker.view.selected ? "at the selection" : "at the end of the page"}
          </Text>
          <div className="maker-palette__list">
            {groups.map(([category, refs]) => (
              <section key={category} aria-label={category}>
                <h3 className="maker-palette__category">{category}</h3>
                <ul>
                  {refs.map((ref) => {
                    const make = () => presetFor(ref, randomId)!;
                    return (
                      <li key={`${ref.contract}/${ref.signature}`}>
                        <button type="button" className="maker-palette__item" onClick={() => insert(make)} onPointerDown={pressToDrag(make)}>
                          <MakerIcon icon={{ glyph: glyphFor(ref.signature) ?? "component" }} />
                          <span>{ref.signature}</span>
                        </button>
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
