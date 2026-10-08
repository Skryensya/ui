import { expect, it } from "vitest";
import type { CapturedNode, RawCapture } from "@skryensya/reference-model";
import { emitReact } from "../../ai-compiler/src/emit.js";
import { validateUsageTree } from "../../ai-compiler/src/validate.js";
import { captureToUsageTree } from "./usage-tree.js";

const rect = { x: 0, y: 0, width: 100, height: 20 };
const node = (
  tag: string,
  styles: Record<string, string> = {},
  text = "",
  children: CapturedNode[] = [],
  attributes: Record<string, string> = {},
): CapturedNode => ({ tag, attributes, text, styles, rect, children });
const capture = (root: CapturedNode): RawCapture => ({
  mode: "element",
  viewport: { width: 1000, height: 800 },
  bounds: rect,
  root,
  truncated: false,
});

const card = node("section", { display: "flex", "flex-direction": "column", gap: "16px" }, "", [
  node("h3", { "font-size": "20px" }, "Storage quota"),
  node("p", { "font-size": "14px" }, "You have used 80% of your plan."),
  node("img"),
  node("div", { display: "flex", "justify-content": "space-between", "align-items": "center", gap: "8px" }, "", [
    node("a", { "background-color": "rgb(26, 92, 255)" }, "Upgrade", [], { href: "/upgrade" }),
    node("button", {}, "Dismiss"),
  ]),
]);

it("maps a capture to a tree the contracts accept, the same way every time", () => {
  const { tree, unmapped } = captureToUsageTree(capture(card));
  expect(captureToUsageTree(capture(card)).tree).toEqual(tree);
  expect(validateUsageTree(tree).problems.filter((p: { severity: string }) => p.severity === "error")).toEqual([]);
  expect(unmapped).toEqual(["img · image has no primitive"]);
  expect(emitReact(tree, { component: "QuotaCard" })).toContain("<Heading");
});
