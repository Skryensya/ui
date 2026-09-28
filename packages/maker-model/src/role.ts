import { childrenOf, findChild, isNode, locate, type MakerNode } from "./node.js";
import { resolve } from "./structure.js";

/*
 * THE LAYOUT ROLE: what a node is to its parent, in the parent's terms. It is what the inspector
 * shows where a design tool shows x and y, and it comes entirely from the parent, which is why it
 * changes when the node moves and why none of it is stored on the node.
 */

export type LayoutRole = {
  /** The parent's signature, or undefined for the root. */
  readonly parent?: string;
  readonly parentId?: string;
  readonly slot?: string;
  /** 1-based, among every child of that slot. */
  readonly position?: number;
  readonly of?: number;
  /** One line, in the parent's terms: "Item in a row that wraps; fills the leftover space". */
  readonly summary: string;
};

export function layoutRole(root: MakerNode, id: string): LayoutRole | undefined {
  const child = findChild(root, id);
  if (!child) return undefined;
  const at = locate(root, id);
  if (!at) return { summary: "The page: its main landmark. Everything else sits inside it." };
  const count = childrenOf(at.parent, at.slot).length;
  return {
    parent: at.parent.signature,
    parentId: at.parent.id,
    slot: at.slot,
    position: at.index + 1,
    of: count,
    summary: describe(at.parent, at.slot, isNode(child) ? child.attrs : undefined),
  };
}

function describe(parent: MakerNode, slot: string, attrs: Readonly<Record<string, string>> | undefined): string {
  const option = (name: string) => parent.options?.[name] ?? resolve(parent)?.contract.options[name]?.default;
  if (slot !== "children") return `Content of ${parent.signature}'s "${slot}".`;

  switch (parent.signature) {
    case "Main":
      return "Section of the page, one above another.";
    case "Stack":
      return "Item in a vertical stack, spaced by the stack's gap.";
    case "Inline": {
      const wraps = option("wrap") !== false ? "a row that wraps when it runs out of room" : "a row that never wraps";
      const sizing =
        option("equal") === true ? "shares the row equally" : attrs?.["data-sizing"] === "fill" ? "fills the leftover space" : "sized to its content";
      return `Item in ${wraps}; ${sizing}.`;
    }
    case "Grid": {
      const min = parent.options?.minColumn;
      if (typeof min === "string") return `Cell in a grid that fits as many columns of at least ${min} as its width allows.`;
      const columns = option("columns") ?? "1";
      if (option("responsive") === true) return `Cell in a grid that grows to ${columns} columns as the screen widens.`;
      if (option("multicol") === true) return `Item in up to ${columns} flowing columns.`;
      return `Cell in a grid of ${columns} equal column${columns === "1" ? "" : "s"}.`;
    }
    case "LayoutGrid": {
      const width = attrs?.["data-width"] ?? "content";
      return `Section in the page flow, at the ${width} measure.`;
    }
    case "Wrapper":
      return `Content of a centred page column (${String(option("wrapperSize") ?? "md")}).`;
    case "Box":
      return "Content of a region with its own surface and padding.";
    default:
      return `Content of ${parent.signature}.`;
  }
}
