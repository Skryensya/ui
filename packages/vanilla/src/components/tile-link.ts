import { interactiveTileClass } from "./tile.js";
import type { Space } from "@skryensya/core/layout";
import type { TileAppearance } from "@skryensya/core/tile";


export type TileLinkInit = {
  href: string;
  target?: HTMLAnchorElement["target"];
  rel?: string;
  className?: string;
  padding?: Space;
  appearance?: TileAppearance;
};

export function createTileLink({ href, target, rel, className, padding, appearance = "plain" }: TileLinkInit): HTMLAnchorElement {
  const element = document.createElement("a");
  element.className = interactiveTileClass(className);
  element.href = href;
  if (target) element.target = target;
  if (rel) element.rel = rel;
  element.dataset.scope = "tile";
  if (padding) element.dataset.padding = padding;
  element.dataset.appearance = appearance;
  element.dataset.part = "root";
  return element;
}
