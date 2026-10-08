import type { UsageTree } from "@skryensya/core/usage-tree";
import type { CapturedNode, RawCapture } from "@skryensya/reference-model";

/*
 * An APPROXIMATE usage tree for a capture, with no model in the loop: the same capture always gives
 * the same tree. It reads what the clipper recorded (tag, role, text, computed layout and type
 * styles) and picks the kit's own primitives: Stack, Inline, Grid, Heading, Text, Link, Button.
 *
 * It is a starting point, not a transcription. Colour, imagery, exact sizes and anything without a
 * primitive are not carried over; each one is listed in `unmapped` so the gap is visible.
 */
export type CaptureTree = {
  readonly tree: UsageTree;
  /** What was left out or flattened, as `tag · reason`, in document order. */
  readonly unmapped: readonly string[];
};

type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "section";

const px = (value: string | undefined): number => {
  const n = Number.parseFloat(value ?? "");
  return Number.isFinite(n) ? n : 0;
};

/** Nearest step of the spacing scale, by the pixel value the page computed. */
function gapOf(styles: Record<string, string>): Gap {
  const value = px(styles["row-gap"] ?? styles.gap) || px(styles["column-gap"]);
  if (value <= 0) return "none";
  if (value <= 6) return "xs";
  if (value <= 12) return "sm";
  if (value <= 20) return "md";
  if (value <= 28) return "lg";
  if (value <= 48) return "xl";
  return "section";
}

const INLINE_TAGS = new Set(["span", "a", "strong", "b", "em", "i", "small", "code", "label", "abbr", "mark", "time", "sup", "sub"]);
const SKIPPED_TAGS = new Set(["svg", "path", "canvas", "video", "audio", "iframe", "img", "picture", "hr", "br", "input", "select", "textarea"]);

const compact = (text: string) => text.replace(/\s+/g, " ").trim();

/** Every word under a node, in the order the capture holds them: own text first, then its children. */
function textOf(node: CapturedNode): string {
  return compact([node.text, ...node.children.map(textOf)].join(" "));
}

const hasBox = (node: CapturedNode) => node.rect.width > 0 && node.rect.height > 0;
const hidden = (node: CapturedNode) => node.styles.display === "none" || !hasBox(node);

/** A link or button that looks pressable: it paints its own background or border. */
function looksLikeButton(node: CapturedNode): boolean {
  const bg = node.styles["background-color"] ?? "";
  const painted = bg !== "" && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg);
  const border = node.styles.border ?? "";
  const outlined = border !== "" && !/^0px|none/.test(border);
  return painted || outlined;
}

function textSize(styles: Record<string, string>): "caption" | "sm" | "body" | "lg" {
  const size = px(styles["font-size"]);
  if (size && size < 13) return "caption";
  if (size && size < 15) return "sm";
  if (size > 18) return "lg";
  return "body";
}

function headingSize(level: number, styles: Record<string, string>): string {
  const size = px(styles["font-size"]);
  if (size >= 56) return "display-lg";
  if (size >= 44) return "display-md";
  if (size >= 36) return "display-sm";
  return `h${Math.min(Math.max(level, 1), 6)}`;
}

export function captureToUsageTree(raw: RawCapture): CaptureTree {
  const unmapped: string[] = [];
  const note = (node: CapturedNode, reason: string) => unmapped.push(`${node.tag} · ${reason}`);

  function text(node: CapturedNode): UsageTree {
    const content = textOf(node);
    const emphasis = Number.parseInt(node.styles["font-weight"] ?? "400", 10) >= 600;
    return {
      contract: "typography",
      signature: "Text",
      options: { size: textSize(node.styles), ...(emphasis ? { weight: "emphasis" } : {}) },
      children: content,
    };
  }

  function button(node: CapturedNode): UsageTree {
    const label = textOf(node) || node.attributes["aria-label"] || "Button";
    const href = node.attributes.href;
    return href && node.tag === "a"
      ? { contract: "button", signature: "Button.navigation", options: { href }, children: label }
      : { contract: "button", signature: "Button.action", children: label };
  }

  /** Text-only subtree: every descendant is inline, so the whole thing reads as one run of copy. */
  const isRun = (node: CapturedNode): boolean =>
    node.children.length > 0 &&
    node.children.every((c) => INLINE_TAGS.has(c.tag) && !looksLikeButton(c) && isRunOrLeaf(c));
  const isRunOrLeaf = (node: CapturedNode): boolean => node.children.length === 0 || isRun(node);

  function convert(node: CapturedNode): UsageTree | null {
    if (hidden(node)) return null;
    const { tag, styles } = node;
    if (SKIPPED_TAGS.has(tag)) {
      note(node, tag === "img" ? "image has no primitive" : "no primitive for this element");
      return null;
    }
    const level = /^h([1-6])$/.exec(tag)?.[1];
    if (level) {
      return {
        contract: "typography",
        signature: "Heading",
        options: { headingSize: headingSize(Number(level), styles), headingElement: `h${level}` },
        children: textOf(node),
      };
    }
    if (tag === "button" || (tag === "a" && node.attributes.href && looksLikeButton(node))) return button(node);
    if (tag === "a" && node.attributes.href && node.children.every((c) => !hasBox(c) || INLINE_TAGS.has(c.tag))) {
      return {
        contract: "typography",
        signature: "Link",
        options: { href: node.attributes.href },
        children: textOf(node),
      };
    }

    // Copy: a leaf with words, or a block whose children are all inline runs of words.
    if (textOf(node) && (node.children.length === 0 || isRun(node))) {
      if (node.children.length) note(node, "inline emphasis flattened into plain text");
      return text(node);
    }

    // Structure: convert the children first, then decide what holds them.
    const children: UsageTree[] = [];
    if (compact(node.text)) children.push(text({ ...node, children: [] }));
    for (const child of node.children) {
      const converted = convert(child);
      if (converted) children.push(converted);
    }
    if (children.length === 0) return null;
    // A wrapper that adds no layout of its own disappears.
    const single = children.length === 1 ? children[0]! : null;
    if (single && !looksLikeLayout(node)) return single;

    const gap = gapOf(styles);
    const display = styles.display ?? "block";
    if (display.includes("grid")) {
      const tracks = (styles["grid-template-columns"] ?? "").split(/\s+(?![^(]*\))/).filter(Boolean).length;
      const columns = String(Math.min(Math.max(tracks, 1), 5));
      return { contract: "layout", signature: "Grid", options: { columns, gap }, children };
    }
    if (display.includes("flex") && !(styles["flex-direction"] ?? "row").startsWith("column")) {
      const justify = styles["justify-content"] ?? "";
      const align = styles["align-items"] ?? "";
      return {
        contract: "layout",
        signature: "Inline",
        options: {
          gap,
          ...(justify.includes("space-between") ? { justify: "between" } : justify === "center" ? { justify: "center" } : justify.includes("end") ? { justify: "end" } : {}),
          ...(align === "center" ? { inlineAlign: "center" } : align.includes("start") ? { inlineAlign: "start" } : align === "stretch" ? { inlineAlign: "stretch" } : {}),
          wrap: (styles["flex-wrap"] ?? "nowrap") !== "nowrap",
        },
        children,
      };
    }
    return { contract: "layout", signature: "Stack", options: { gap }, children };
  }

  const looksLikeLayout = (node: CapturedNode) => {
    const display = node.styles.display ?? "";
    return display.includes("flex") || display.includes("grid");
  };

  const tree = convert(raw.root) ?? { contract: "layout", signature: "Stack", children: [] as string[] };
  return { tree, unmapped };
}
