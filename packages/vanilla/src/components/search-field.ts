import { isClearKey, searchFieldAttrs } from "@skryensya/core/search-field";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * SEARCH FIELD, three listeners over authored markup: the clear button follows the value, and a
 * click on it or Escape empties the field. No Svelte, for `input.ts`'s reason: there is nothing to
 * render, only attributes to keep in step.
 *
 * Clearing dispatches a bubbling `input` event, so a page filtering on `input` hears the empty query
 * the same way it hears a typed one.
 */
export function connectSearchField(root: HTMLElement): () => void {
  const input = root.querySelector<HTMLInputElement>(`[${searchFieldAttrs.input}]`);
  const clearButton = root.querySelector<HTMLButtonElement>(`[${searchFieldAttrs.clear}]`);
  if (!input || !clearButton) return () => {};

  const sync = (): void => {
    clearButton.hidden = input.value === "" || input.disabled;
  };

  const clear = (): void => {
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!isClearKey(event, input.value)) return;
    /* Consumed only when there was text: an empty field lets Escape reach the dialog around it. */
    event.preventDefault();
    event.stopPropagation();
    clear();
  };

  input.addEventListener("input", sync);
  input.addEventListener("keydown", onKeyDown);
  clearButton.addEventListener("click", clear);
  /* A field the browser restored, or one authored with a `value`, shows its button from the start. */
  sync();

  return () => {
    input.removeEventListener("input", sync);
    input.removeEventListener("keydown", onKeyDown);
    clearButton.removeEventListener("click", clear);
  };
}

export const mountSearchField = createConnectMount({
  key: "search-field",
  rootSelector: `[${searchFieldAttrs.root}]`,
  connect: connectSearchField,
});
