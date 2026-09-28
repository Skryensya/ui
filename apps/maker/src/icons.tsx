import type { IconData, StableIconName } from "@skryensya/core/icon";
import { Icon } from "@skryensya/react/icon";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Blocks,
  Columns3,
  CopyPlus,
  Group,
  IndentDecrease,
  IndentIncrease,
  LayoutGrid,
  ListTree,
  MousePointer2,
  PanelsTopLeft,
  Play,
  Pointer,
  Redo2,
  Rows3,
  Ruler,
  Square,
  SunMoon,
  Undo2,
  Ungroup,
  Component,
  Contrast,
  Files,
  FilePlus2,
  type IconNode,
} from "lucide";

/*
 * THE MAKER'S ICONS. Where the kit's stable vocabulary has the role (`add`, `delete`, `copy`,
 * `download`, `mode-dark`, the screens), the Maker asks for the role and the bound set draws it.
 * Where it does not (undo, wrap, the layout primitives), the Maker supplies Lucide's geometry as
 * project data through `Icon`'s `data`, which is exactly what decision 15 keeps that door for: an
 * app's own glyphs, coupled on purpose, never added to the system's vocabulary.
 */

const ATTRS = { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" } as const;

function fromLucide(node: IconNode): IconData {
  const body = node
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${String(value)}"`).join(" ")} />`)
    .join("");
  return { viewBox: "0 0 24 24", attrs: ATTRS, body };
}

export const makerGlyphs = {
  undo: fromLucide(Undo2),
  redo: fromLucide(Redo2),
  "move-up": fromLucide(ArrowUpToLine),
  "move-down": fromLucide(ArrowDownToLine),
  outdent: fromLucide(IndentDecrease),
  indent: fromLucide(IndentIncrease),
  wrap: fromLucide(Group),
  unwrap: fromLucide(Ungroup),
  duplicate: fromLucide(CopyPlus),
  layers: fromLucide(ListTree),
  insert: fromLucide(Blocks),
  inspect: fromLucide(PanelsTopLeft),
  width: fromLucide(Ruler),
  edit: fromLucide(MousePointer2),
  interact: fromLucide(Pointer),
  scheme: fromLucide(SunMoon),
  contrast: fromLucide(Contrast),
  stack: fromLucide(Rows3),
  inline: fromLucide(Columns3),
  grid: fromLucide(LayoutGrid),
  box: fromLucide(Square),
  component: fromLucide(Component),
  pages: fromLucide(Files),
  play: fromLucide(Play),
  "add-page": fromLucide(FilePlus2),
  wrapper: fromLucide(PanelsTopLeft),
} as const;

export type MakerGlyph = keyof typeof makerGlyphs;

/** Either a role from the kit's vocabulary or one of the Maker's own glyphs. */
export type AnyIcon = { readonly role: StableIconName } | { readonly glyph: MakerGlyph };

export function MakerIcon({ icon, size = "sm" }: { icon: AnyIcon; size?: "sm" | "md" | "lg" }) {
  return "role" in icon ? <Icon name={icon.role} size={size} /> : <Icon data={makerGlyphs[icon.glyph]} size={size} />;
}

/** The glyph a layout primitive is drawn with in the palette and the outline tools. */
export function glyphFor(signature: string): MakerGlyph | undefined {
  switch (signature) {
    case "Stack":
      return "stack";
    case "Inline":
      return "inline";
    case "Grid":
    case "LayoutGrid":
      return "grid";
    case "Box":
      return "box";
    case "Wrapper":
      return "wrapper";
    default:
      return undefined;
  }
}
