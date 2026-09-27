import type { MakerChild, MakerNode } from "./node.js";

export function node(
  id: string,
  contract: string,
  signature: string,
  children: MakerChild[] = [],
  options?: Record<string, string | boolean>,
): MakerNode {
  return { id, contract, signature, ...(options ? { options } : {}), slots: { children: { kind: "nodes", children } } };
}

export const text = (id: string, value: string): MakerChild => ({ id, text: value });

/*
 *   Main
 *   └ Wrapper (w)
 *      └ Stack (s)
 *         ├ Heading (h)
 *         ├ Text (t)
 *         └ Inline (i)
 *            ├ Button (b1)
 *            └ Button (b2)
 */
export function samplePage(): MakerNode {
  return node("main", "layout", "Main", [
    node("w", "wrapper", "Wrapper", [
      node("s", "layout", "Stack", [
        node("h", "typography", "Heading", [text("h-t", "Title")]),
        node("t", "typography", "Text", [text("t-t", "Body")]),
        node("i", "layout", "Inline", [
          node("b1", "button", "Button.action", [text("b1-t", "One")]),
          node("b2", "button", "Button.action", [text("b2-t", "Two")]),
        ]),
      ]),
    ]),
  ]);
}
