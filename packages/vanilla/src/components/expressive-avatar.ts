import { expressiveAvatarContract, expressiveAvatarParts, type ExpressiveAvatarDirection, type ExpressiveAvatarHat, type ExpressiveAvatarMouth, type ExpressiveAvatarOutfit } from "@skryensya/core/expressive-avatar";
import { expressiveAvatarAtlasLayout } from "@skryensya/core/expressive-avatar-atlas";
import { expressiveAvatarCells } from "@skryensya/core/expressive-avatar-behavior";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * EXPRESSIVE AVATAR, the authored-HTML binding of PIXEL mode at rest.
 *
 * The contract emits the root with its options as attributes and nothing inside: a face is 36 cells whose
 * positions are computed, not authored. This draws them from those attributes with `expressiveAvatarCells`,
 * the same call React makes, so the two bindings land on one face. What it does not do is come alive (the
 * gaze, the blink, the speech): that is React's controller, and authored markup that wants it mounts React.
 */

const { direction, mouth, outfit, hat } = expressiveAvatarContract.options;

const read = <T extends string>(root: HTMLElement, attr: string, values: readonly string[], fallback: T): T => {
  const value = root.getAttribute(attr);
  return value && values.includes(value) ? (value as T) : fallback;
};

export function connectExpressiveAvatar(root: HTMLElement): () => void {
  if (root.querySelector(`:scope > .${expressiveAvatarParts.grid}`)) return () => {};
  const gaze = read<ExpressiveAvatarDirection>(root, direction.attr, direction.values, direction.default);
  const tileset = expressiveAvatarAtlasLayout;
  const cells = expressiveAvatarCells(
    { leftEye: gaze, rightEye: gaze, mouth: read<ExpressiveAvatarMouth>(root, mouth.attr, mouth.values, mouth.default), expression: null },
    {
      outfit: read<ExpressiveAvatarOutfit>(root, outfit.attr, outfit.values, outfit.default),
      hat: read<ExpressiveAvatarHat>(root, hat.attr, hat.values, hat.default),
      tileset,
    },
  );

  /* The same properties, in the same order, React writes: the gate compares the serialized style. */
  root.style.setProperty("--sk-expressive-avatar-columns", String(tileset.columns));
  root.style.setProperty("--sk-expressive-avatar-rows", String(Math.ceil(tileset.names.length / tileset.columns)));

  const grid = document.createElement("span");
  grid.className = expressiveAvatarParts.grid;
  grid.setAttribute("aria-hidden", "true");
  for (const cell of cells) {
    const tile = document.createElement("span");
    tile.className = expressiveAvatarParts.tile;
    tile.style.setProperty("--sk-expressive-avatar-column", String(cell.column));
    tile.style.setProperty("--sk-expressive-avatar-row", String(cell.row));
    tile.style.setProperty("--sk-expressive-avatar-hat-column", String(cell.hatColumn));
    tile.style.setProperty("--sk-expressive-avatar-hat-row", String(cell.hatRow));
    grid.append(tile);
  }
  root.prepend(grid);
  return () => grid.remove();
}

export const mountExpressiveAvatar = createConnectMount({
  key: "expressive-avatar",
  /* Pixel mode only: an image face is an authored <img>, already complete. */
  rootSelector: `.${expressiveAvatarParts.root}:not([data-mode="image"])`,
  connect: connectExpressiveAvatar,
});
