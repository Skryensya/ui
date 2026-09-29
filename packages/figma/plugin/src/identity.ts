/*
 * WHICH NODE IS WHICH: the plugin's identity rules, kept free of the Figma API so they can be tested
 * on plain objects. Anything that carries shared plugin data is enough; see code.ts for the ids.
 */

export const NS = "skryensya";

/** The one thing identity needs from a node: to read its tags. */
export type Tagged = { getSharedPluginData(namespace: string, key: string): string };

const tagOf = (node: Tagged, key: string) => node.getSharedPluginData(NS, key);

export const parseKey = (key: string) => Object.fromEntries(key.split(", ").map((pair) => pair.split("=") as [string, string]));

/**
 * Our components in a set, for finding each one ONCE: by its deterministic id, else by the key it
 * was tagged with before ids existed (the variant name), else by `adopt`. What nobody took is left
 * over, which is what the manifest no longer draws.
 */
export class Identities<T extends Tagged> {
  private readonly byId = new Map<string, T>();
  private readonly byKey = new Map<string, T>();
  private readonly taken = new Set<T>();

  constructor(private readonly nodes: readonly T[]) {
    for (const node of nodes) {
      if (tagOf(node, "id")) this.byId.set(tagOf(node, "id"), node);
      if (tagOf(node, "cell")) this.byKey.set(tagOf(node, "cell"), node);
    }
  }

  take(id: string, key: string, adopt?: (free: readonly T[]) => T | undefined): T | undefined {
    const free = (node: T | undefined) => (node && !this.taken.has(node) ? node : undefined);
    // By key only when that node has no other id: an id that names a different cell wins over a name.
    const byKey = free(this.byKey.get(key));
    const keyed = byKey && (!tagOf(byKey, "id") || tagOf(byKey, "id") === id) ? byKey : undefined;
    const node = free(this.byId.get(id)) ?? keyed ?? adopt?.(this.rest());
    if (node) this.taken.add(node);
    return node;
  }

  rest(): T[] {
    return this.nodes.filter((node) => !this.taken.has(node));
  }
}

/** What a variant of ours was drawn as: its tagged props, or read back off its older key. */
export function propsOf(node: Tagged): Record<string, string> | undefined {
  const tagged = tagOf(node, "props");
  if (tagged) return JSON.parse(tagged) as Record<string, string>;
  const key = tagOf(node, "cell");
  return key ? parseKey(key) : undefined;
}

/**
 * A variant from before an axis existed: its props are the new cell's, less the new axes, and the
 * new cell has every new axis at its default. That one is the same component, now with a name for
 * the value it always had, so it is kept and renamed rather than orphaned beside a fresh copy.
 */
export function adoptAcrossNewAxes<T extends Tagged>(cell: { props: Record<string, string> }, defaults: Record<string, string>) {
  return (free: readonly T[]) =>
    free.find((node) => {
      const had = propsOf(node);
      if (!had) return false;
      const axes = Object.keys(had);
      if (axes.length >= Object.keys(cell.props).length) return false;
      if (axes.some((axis) => cell.props[axis] !== had[axis])) return false;
      return Object.keys(cell.props).every((axis) => axis in had || cell.props[axis] === defaults[axis]);
    });
}

export const layerId = (cell: { id: string }, slot: string) => `${cell.id}/${slot}`;

/**
 * Which of a cell's children is the layer for `slot`: the one with its id; else the same slot under
 * an older id (the cell was adopted into a new axis, so its id grew); else, drawn before ids existed,
 * the untagged one named after the slot.
 */
export function pickLayer<T extends Tagged & { name: string }>(children: readonly T[], cell: { id: string }, slot: string): T | null {
  const id = layerId(cell, slot);
  return (
    children.find((n) => tagOf(n, "id") === id) ??
    children.find((n) => tagOf(n, "id") !== "" && !tagOf(n, "id").startsWith(`${cell.id}/`) && tagOf(n, "id").endsWith(`/${slot}`)) ??
    children.find((n) => n.name === slot && !tagOf(n, "id")) ??
    null
  );
}
