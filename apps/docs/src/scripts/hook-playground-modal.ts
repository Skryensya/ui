/*
 * Wires every `HookPlaygroundModal.astro` on the page. The modal's stage and record are cloned from a
 * `<template>` the first time it opens, and the stage is woken with the library's own enhancer (a
 * bar's menus only open once it has run), the same way the catalogue wakes the example it opens.
 *
 * ONE RULE, NOT AN INLINE STYLE: every override lands in a `<style>` as
 * `#stage, #stage * { --hook: value !important }`. An inline style on the root would only be
 * inherited, and a component re-declares some hooks on a part of its own (AppBar's dropdown carries
 * three), where an inherited value never wins. A hook whose field is back at its shipped value is
 * dropped from the rule, so what the stage shows is always the shipped CSS plus the changes.
 */
const SELECTOR = "[data-sk-hpm]";

function wake(root: HTMLElement): void {
  void Promise.all([import("@skryensya/vanilla/auto"), import("../icons")]).then(([{ mountComponentsWithIcons }, { siteIcons }]) =>
    mountComponentsWithIcons(root, siteIcons),
  );
}

function bind(dialog: HTMLDialogElement): void {
  const id = dialog.id;
  const template = document.querySelector<HTMLTemplateElement>(`template[data-sk-hpm-template="${CSS.escape(id)}"]`);
  const slot = dialog.querySelector<HTMLElement>(`#${CSS.escape(id)}-slot`);
  if (!template || !slot) return;
  slot.replaceChildren(template.content.cloneNode(true));

  const stage = slot.querySelector<HTMLElement>("[data-sk-hpm-stage]")!;
  stage.id = `${id}-stage`;
  const rows = [...slot.querySelectorAll<HTMLElement>("[data-sk-hpm-hook]")];
  const copy = slot.querySelector<HTMLButtonElement>("[data-sk-hpm-copy]")!;
  const sheet = document.createElement("style");
  dialog.append(sheet);

  const changed = () =>
    rows
      .map((row) => ({ row, hook: row.dataset.skHpmHook!, value: row.querySelector<HTMLInputElement>("[data-sk-hpm-input]")!.value.trim() }))
      .filter(({ row, value }) => value !== "" && value !== row.dataset.default);

  let cssText = "";
  const resetAll = slot.querySelector<HTMLButtonElement>("[data-sk-hpm-reset-all]");

  const paint = () => {
    const diff = changed();
    for (const row of rows) {
      const isChanged = diff.some((entry) => entry.row === row);
      row.querySelector<HTMLElement>("[data-sk-hpm-reset]")!.hidden = !isChanged;
      row.toggleAttribute("data-changed", isChanged);
    }
    if (resetAll) resetAll.disabled = diff.length === 0;
    copy.disabled = diff.length === 0;
    const scope = `#${CSS.escape(stage.id)}`;
    sheet.textContent = diff.length ? `${scope}, ${scope} * {\n${diff.map(({ hook, value }) => `  ${hook}: ${value} !important;`).join("\n")}\n}` : "";
    cssText = diff.length ? `${dialog.dataset.skHpmSelector} {\n${diff.map(({ hook, value }) => `  ${hook}: ${value};`).join("\n")}\n}` : "";
  };

  const select = (row: HTMLElement) => row.querySelector<HTMLSelectElement>("[data-sk-hpm-select]");
  const field = (row: HTMLElement) => row.querySelector<HTMLInputElement>("[data-sk-hpm-input]")!;
/* The library's native colour field: a `type="color"` swatch and the hex text box beside it. */
  const colorOf = (row: HTMLElement) => row.querySelector<HTMLInputElement>(".sk-color-picker__trigger");
  const hexOfField = (row: HTMLElement) => row.querySelector<HTMLInputElement>(".sk-color-picker__native-value");
  const restore = (row: HTMLElement) => {
    const chooser = select(row);
    if (chooser) chooser.value = row.dataset.default ?? "";
    field(row).value = row.dataset.default ?? "";
    field(row).hidden = row.dataset.control !== "text";
    syncPicker(row, row.dataset.default ?? "");
  };

  /* Any CSS colour (a `var()`, a `color-mix()`, `rgb(0 0 0 / 50%)`) as the hex the picker shows: the
     browser resolves it on a probe inside the stage, and one painted pixel reads it back. */
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("span");
  probe.hidden = true;
  stage.append(probe);
  const hexOf = (value: string): string | undefined => {
    if (!context) return undefined;
    probe.style.color = "";
    probe.style.color = value;
    if (!probe.style.color) return undefined;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "#000";
    context.fillStyle = getComputedStyle(probe).color;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return a === 0 ? undefined : `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  };
  const syncPicker = (row: HTMLElement, value: string) => {
    const picker = colorOf(row);
    const hex = picker && hexOf(value);
    if (!picker || !hex) return;
    picker.value = hex;
    const text = hexOfField(row);
    if (text) text.value = hex;
  };
  for (const row of rows) syncPicker(row, row.dataset.default ?? "");

  /* The colour field speaks hex only (the library keeps its swatch and hex box in step, and fires
     `input` on the swatch for both). It writes into the hidden text field, the one source of truth. */
  slot.addEventListener("input", (event) => {
    const picker = (event.target as Element).closest<HTMLInputElement>(".sk-color-picker__trigger");
    const row = picker?.closest<HTMLElement>("[data-sk-hpm-hook]");
    if (!picker || !row) return;
    field(row).value = picker.value;
    paint();
  });

  /* A preset writes its value into the hidden text field, which stays the one source of truth; Custom
     shows that field for anything the presets do not cover. */
  slot.addEventListener("change", (event) => {
    const chooser = (event.target as Element).closest<HTMLSelectElement>("[data-sk-hpm-select]");
    const row = chooser?.closest<HTMLElement>("[data-sk-hpm-hook]");
    if (!chooser || !row) return;
    const custom = chooser.value === "__custom";
    field(row).hidden = !custom;
    if (custom) field(row).focus();
    else {
      field(row).value = chooser.value;
      syncPicker(row, chooser.value);
    }
    paint();
  });
  slot.addEventListener("input", (event) => {
    if ((event.target as Element).closest("[data-sk-hpm-input]")) paint();
  });
  slot.addEventListener("click", (event) => {
    const target = event.target as Element;
    const row = target.closest<HTMLElement>("[data-sk-hpm-hook]");
    if (row && target.closest("[data-sk-hpm-reset]")) {
      restore(row);
      paint();
    } else if (target.closest("[data-sk-hpm-reset-all]")) {
      for (const each of rows) restore(each);
      paint();
    }
  });
  copy.addEventListener("click", async () => {
    if (!cssText) return;
    await navigator.clipboard?.writeText(cssText);
    const label = copy.textContent;
    copy.textContent = copy.dataset.copied ?? label;
    setTimeout(() => (copy.textContent = label), 1500);
  });

  wake(slot);
}

export function initHookPlaygroundModal(): void {
  document.querySelectorAll<HTMLElement>("[data-sk-hpm-open]:not([data-sk-hpm-bound])").forEach((button) => {
    button.setAttribute("data-sk-hpm-bound", "");
    const dialog = document.getElementById(button.dataset.skHpmOpen ?? "");
    if (!(dialog instanceof HTMLDialogElement) || !dialog.matches(SELECTOR)) return;
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    button.addEventListener("click", () => {
      if (!dialog.hasAttribute("data-sk-hpm-ready")) {
        dialog.setAttribute("data-sk-hpm-ready", "");
        bind(dialog);
      }
      dialog.showModal();
    });
  });
}
