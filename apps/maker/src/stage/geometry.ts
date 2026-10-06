import { childrenOf, findNode, isNode, type MakerNode, type Place } from "@skryensya/maker-model";

/*
 * FROM A POINTER TO A PLACE. The browser has already laid the page out; this only asks it where
 * things ended up, picks the nearest container the model allows, and turns "over here" into a
 * parent, a slot and a gap between siblings. Every rect read here is read now and dropped: none of
 * it becomes part of the page (decision 31).
 */

export type Rect = { readonly left: number; readonly top: number; readonly width: number; readonly height: number };

/** Where to draw the drop indicator: a line between two siblings, or a whole empty container. */
export type Indicator = { readonly kind: "line"; readonly rect: Rect } | { readonly kind: "box"; readonly rect: Rect };

export type Resolved = { readonly place: Place; readonly indicator: Indicator };

const LINE = 3;

export function elementFor(doc: Document, id: string): HTMLElement | null {
  return doc.querySelector<HTMLElement>(`[data-maker-node="${CSS.escape(id)}"]`);
}

/** The maker node an element belongs to: the nearest marked ancestor, the element included. */
export function nodeIdAt(element: Element | null): string | undefined {
  return element?.closest<HTMLElement>("[data-maker-node]")?.dataset.makerNode;
}

/**
 * The place under a point in the stage's own coordinates, among `allowed` (the model's drop targets
 * for what is being dragged). Walks out from the innermost marked element until a container takes
 * it, so dropping over a button in a row lands in the row.
 */
export function placeAt(doc: Document, root: MakerNode, allowed: readonly Place[], x: number, y: number): Resolved | undefined {
  const bySlot = new Map<string, Set<number>>();
  for (const place of allowed) {
    const key = `${place.parent}\u0000${place.slot}`;
    if (!bySlot.has(key)) bySlot.set(key, new Set());
    bySlot.get(key)!.add(place.index);
  }

  let element: Element | null = doc.elementFromPoint(x, y);
  /* Set once the pointer has been placed beside a child: its container takes it, edges or not. */
  let inside = false;
  while (element) {
    const marked = element.closest<HTMLElement>("[data-maker-node]");
    if (!marked) break;
    const id = marked.dataset.makerNode!;
    const node = findNode(root, id);
    /*
     * Near an element's edges the drop means "beside it", so it goes to the container around it;
     * only well inside it does it mean "into it". Without the band, dropping on a heading's top
     * edge put the dragged button inside the heading: valid, and never what was meant.
     */
    const container = marked.parentElement?.closest<HTMLElement>("[data-maker-node]");
    const beside: boolean = !inside && container ? nearEdge(marked, flowsInline(doc, container), x, y) : false;
    if (node && !beside) {
      const slot = preferredSlot(node, bySlot);
      if (slot) {
        const resolved = gapIn(doc, node, slot, marked, bySlot.get(`${id}\u0000${slot}`)!, x, y);
        if (resolved) return resolved;
      }
    }
    inside = beside;
    element = marked.parentElement;
  }
  /* Nothing under the pointer takes it: the page's root does, at whichever end is nearer. */
  const rootSlot = preferredSlot(root, bySlot);
  if (!rootSlot) return undefined;
  const rootElement = elementFor(doc, root.id);
  return rootElement ? gapIn(doc, root, rootSlot, rootElement, bySlot.get(`${root.id}\u0000${rootSlot}`)!, x, y) : undefined;
}

/**
 * Where a place is, as the indicator that would show it: a line before the child at its index (or after the
 * last one), a box around an empty slot's container. The same shapes `placeAt` draws for a pointer, asked of
 * a place instead of a point, which is what choosing a place with the keyboard needs. `undefined` when the
 * parent has nothing on the stage to point at.
 */
export function indicatorFor(doc: Document, root: MakerNode, place: Place): Indicator | undefined {
  const parent = findNode(root, place.parent);
  const container = elementFor(doc, place.parent);
  if (!parent || !container) return undefined;
  const siblings = childrenOf(parent, place.slot)
    .map((child, index) => ({ index, element: isNode(child) ? elementFor(doc, child.id) : null }))
    .filter((entry): entry is { index: number; element: HTMLElement } => entry.element !== null);
  if (siblings.length === 0) return { kind: "box", rect: rectOf(container) };
  const before = siblings.find((entry) => entry.index >= place.index);
  const anchor = before ?? siblings[siblings.length - 1]!;
  const rect = anchor.element.getBoundingClientRect();
  const horizontal = flowsInline(doc, container);
  const atStart = before !== undefined;
  const line: Rect = horizontal
    ? { left: (atStart ? rect.left : rect.right) - LINE / 2, top: rect.top, width: LINE, height: rect.height }
    : { left: rect.left, top: (atStart ? rect.top : rect.bottom) - LINE / 2, width: rect.width, height: LINE };
  return { kind: "line", rect: line };
}

const rectOf = (element: HTMLElement): Rect => {
  const r = element.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

function preferredSlot(node: MakerNode, bySlot: Map<string, Set<number>>): string | undefined {
  if (bySlot.has(`${node.id}\u0000children`)) return "children";
  for (const key of bySlot.keys()) {
    const [parent, slot] = key.split("\u0000");
    if (parent === node.id) return slot;
  }
  return undefined;
}

/**
 * The gap nearest the point among one slot's children. The nearest sibling decides it: before it
 * or after it, along the axis the container actually flows in, which the browser reports through
 * the computed style. A wrapping row is handled by distance first, so the nearest line wins.
 */
function gapIn(
  doc: Document,
  parent: MakerNode,
  slot: string,
  container: HTMLElement,
  indexes: ReadonlySet<number>,
  x: number,
  y: number,
): Resolved | undefined {
  const siblings = childrenOf(parent, slot)
    .map((child, index) => ({ index, element: isNode(child) ? elementFor(doc, child.id) : null }))
    .filter((entry): entry is { index: number; element: HTMLElement } => entry.element !== null);
  const box = container.getBoundingClientRect();

  if (siblings.length === 0) {
    const index = childrenOf(parent, slot).length;
    return indexes.has(index) ? { place: { parent: parent.id, slot, index }, indicator: { kind: "box", rect: box } } : undefined;
  }

  const horizontal = flowsInline(doc, container);
  const nearest = siblings
    .map((entry) => ({ ...entry, rect: entry.element.getBoundingClientRect() }))
    .sort((a, b) => distance(a.rect, x, y) - distance(b.rect, x, y))[0]!;
  const before = horizontal ? x < nearest.rect.left + nearest.rect.width / 2 : y < nearest.rect.top + nearest.rect.height / 2;
  const index = before ? nearest.index : nearest.index + 1;
  if (!indexes.has(index)) return undefined;

  const rect = nearest.rect;
  const line: Rect = horizontal
    ? { left: (before ? rect.left : rect.right) - LINE / 2, top: rect.top, width: LINE, height: rect.height }
    : { left: rect.left, top: (before ? rect.top : rect.bottom) - LINE / 2, width: rect.width, height: LINE };
  return { place: { parent: parent.id, slot, index }, indicator: { kind: "line", rect: line } };
}

/** Within the outer quarter of the element along its container's flow axis. */
function nearEdge(element: HTMLElement, horizontal: boolean, x: number, y: number): boolean {
  const rect = element.getBoundingClientRect();
  const [start, size, at] = horizontal ? [rect.left, rect.width, x] : [rect.top, rect.height, y];
  const band = Math.min(size * 0.25, 24);
  return at < start + band || at > start + size - band;
}

/**
 * Whether a container lays its children out along the inline axis. Asked of the computed style,
 * since the same primitive can be built either way: Stack is a one-column grid, which flows down,
 * and only a grid with more than one track flows across.
 */
function flowsInline(doc: Document, element: HTMLElement): boolean {
  const style = doc.defaultView!.getComputedStyle(element);
  if (style.display.includes("grid")) return style.gridTemplateColumns.trim().split(/\s+/).length > 1;
  if (style.display.includes("flex")) return !style.flexDirection.startsWith("column");
  return false;
}

function distance(rect: DOMRect, x: number, y: number): number {
  const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
  const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
  return Math.hypot(dx, dy);
}
