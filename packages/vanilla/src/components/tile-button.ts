import { interactiveTileClass } from "./tile.js";
import type { Space } from "@skryensya/core/layout";
import type { TileAppearance } from "@skryensya/core/tile";


export type TileButtonInit = {
  disabled?: boolean;
  className?: string;
  padding?: Space;
  appearance?: TileAppearance;
};

export function createTileButton({ disabled, className, padding, appearance = "plain" }: TileButtonInit = {}): HTMLButtonElement {
  const element = document.createElement("button");
  element.className = interactiveTileClass(className);
  element.type = "button";
  element.disabled = Boolean(disabled);
  element.dataset.scope = "tile";
  element.dataset.part = "root";
  if (padding) element.dataset.padding = padding;
  element.dataset.appearance = appearance;
  return element;
}
