import ColorPicker from "./ColorPicker.svelte";
import { normalizeHex } from "@skryensya/core/color";
import { colorPickerAttrs, colorPickerParts } from "@skryensya/core/color-picker";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { createConnectMount, createSvelteMount, type Mount } from "../runtime/svelte-hydrate.js";

const mountPicker = createSvelteMount({
  key: "color-picker",
  rootSelector: rootSelectorFor(colorPickerAttrs),
  Component: ColorPicker,
});

/*
 * The native field reads as a text input: its `type="color"` swatch and a hex text box are two
 * controls the platform does not link, so this keeps them in step. No Svelte and no machine, the
 * same call `input.ts` makes: the controls already exist in the markup.
 */
export function connectNativeColor(root: HTMLElement): () => void {
  const swatch = root.querySelector<HTMLInputElement>(`.${colorPickerParts.trigger}`);
  const hex = root.querySelector<HTMLInputElement>(`.${colorPickerParts.nativeValue}`);
  if (!swatch || !hex) return () => {};

  /* Authored markup may omit the hex's value: the swatch is the source of truth at mount. */
  hex.value = swatch.value;

  const onSwatch = (): void => {
    hex.value = swatch.value;
  };
  const onHex = (): void => {
    const next = normalizeHex(hex.value);
    if (next && next !== swatch.value) {
      swatch.value = next;
      swatch.dispatchEvent(new Event("input", { bubbles: true }));
      swatch.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };
  /* A half-typed hex is put back to the committed color on leaving, never left invalid. */
  const onHexBlur = (): void => {
    hex.value = swatch.value;
  };

  swatch.addEventListener("input", onSwatch);
  hex.addEventListener("input", onHex);
  hex.addEventListener("blur", onHexBlur);
  return () => {
    swatch.removeEventListener("input", onSwatch);
    hex.removeEventListener("input", onHex);
    hex.removeEventListener("blur", onHexBlur);
  };
}

const mountNative = createConnectMount({
  key: "color-picker-native",
  rootSelector: `[${colorPickerAttrs.native}]`,
  connect: connectNativeColor,
});

/** Mounts the authored ColorPicker roots, and keeps the native field's swatch and hex in step. */
export const mountColorPicker: Mount = (target) => mountPicker(target) + mountNative(target);
