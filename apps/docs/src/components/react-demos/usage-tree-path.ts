/*
 * WHERE IN A TREE A PROPERTY PREVIEW PLAYS ITS OPTION. Most previews vary the root, but a component
 * that only exists inside another (an Input inside its FormField, an item inside its list) cannot be
 * the root of a valid tree, so the preview names a path down to it: each step is a key of the node
 * (`children`, or a slot's name under `slots`) and, where that holds an array, an index into it.
 */
import type { UsageTree } from "@skryensya/core/usage-tree";

export type TreePath = readonly (string | number)[];

const step = (node: unknown, key: string | number): unknown => {
  if (node === null || typeof node !== "object") return undefined;
  if (typeof key === "number") return Array.isArray(node) ? node[key] : undefined;
  const record = node as Record<string, unknown>;
  if (key in record) return record[key];
  const slots = record.slots as Record<string, unknown> | undefined;
  return slots?.[key];
};

/** The node a path names, or undefined when the path leaves the tree. */
export const nodeAt = (tree: UsageTree, path: TreePath = []): UsageTree | undefined =>
  path.reduce<unknown>(step, tree) as UsageTree | undefined;

/** A copy of the tree with one option set on the node the path names; everything else shared. */
export const withOptionAt = (tree: UsageTree, path: TreePath, name: string, value: unknown): UsageTree => {
  const set = (node: unknown, rest: TreePath): unknown => {
    if (rest.length === 0) {
      const target = node as UsageTree;
      return { ...target, options: { ...target.options, [name]: value } };
    }
    const [key, ...tail] = rest;
    if (typeof key === "number") {
      const copy = [...(node as unknown[])];
      copy[key] = set(copy[key], tail);
      return copy;
    }
    const record = node as Record<string, unknown>;
    if (key in record) return { ...record, [key]: set(record[key], tail) };
    const slots = record.slots as Record<string, unknown>;
    return { ...record, slots: { ...slots, [key]: set(slots[key], tail) } };
  };
  return set(tree, path) as UsageTree;
};
