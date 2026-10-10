import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { connectDialogStackRoot, mountDialogStack, DIALOG_STACK_STEP_EVENT } from "./dialog-stack.js";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { initComponents } from "../runtime/registry.js";

let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.(); cleanup = undefined;
  document.querySelectorAll<HTMLElement>("[data-sk-dialog-stack]").forEach(root => destroyMount(root));
  document.body.innerHTML = "";
});
function setup() {
  document.body.innerHTML = `<div class="sk-dialog-stack" data-sk-dialog-stack>
    <button class="sk-dialog-stack__trigger">Open</button>
    <dialog class="sk-dialog-stack__body">
      <section class="sk-dialog-stack__content" tabindex="-1"><h2 class="sk-dialog-stack__title">First</h2><p class="sk-dialog-stack__description">Intro</p><button class="sk-dialog-stack__previous">Back</button><button class="sk-dialog-stack__next">Next</button></section>
      <section class="sk-dialog-stack__content" tabindex="-1"><h2 class="sk-dialog-stack__title">Second</h2><button class="sk-dialog-stack__previous">Back</button><button class="sk-dialog-stack__next">Next</button><button class="sk-dialog-stack__close">Done</button></section>
    </dialog>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-dialog-stack]")!;
  return { root, dialog: root.querySelector("dialog")!, panels: root.querySelectorAll<HTMLElement>("section"), trigger: root.querySelector<HTMLButtonElement>("button")! };
}

describe("DialogStack", () => {
  it("shares navigation, focus and naming with React", () => {
    const { root, dialog, panels, trigger } = setup();
    cleanup = connectDialogStackRoot(root);
    const step = vi.fn(); root.addEventListener(DIALOG_STACK_STEP_EVENT, step);
    trigger.focus(); fireEvent.click(trigger);
    expect(dialog.matches(":modal")).toBe(true);
    expect(dialog.getAttribute("aria-labelledby")).toBe(panels[0].querySelector("h2")!.id);
    expect(panels[0].querySelector<HTMLButtonElement>(".sk-dialog-stack__previous")!.disabled).toBe(true);
    fireEvent.click(panels[0].querySelector(".sk-dialog-stack__next")!);
    expect(document.activeElement).toBe(panels[1]);
    expect(panels[0].hasAttribute("inert")).toBe(true);
    expect(dialog.hasAttribute("aria-describedby")).toBe(false);
    expect((step.mock.calls[0][0] as CustomEvent).detail).toEqual({ index: 1 });
    expect(panels[1].querySelector<HTMLButtonElement>(".sk-dialog-stack__next")!.disabled).toBe(true);
    fireEvent.click(panels[1].querySelector(".sk-dialog-stack__close")!);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    expect(root.dataset.activeIndex).toBe("0");
  });

  it("restores the previous step's focus and keeps entered values", () => {
    const { root, panels, trigger } = setup();
    const input = document.createElement("input");
    panels[0].append(input);
    cleanup = connectDialogStackRoot(root);
    fireEvent.click(trigger);
    input.value = "Design team";
    input.focus();
    fireEvent.click(panels[0].querySelector(".sk-dialog-stack__next")!);
    fireEvent.click(panels[1].querySelector(".sk-dialog-stack__previous")!);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Design team");
  });

  it("dismisses through cancel and the native backdrop", () => {
    const { root, dialog, trigger } = setup();
    cleanup = connectDialogStackRoot(root);
    fireEvent.click(trigger);
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(dialog.open).toBe(false);
    fireEvent.click(trigger);
    fireEvent.click(dialog, { clientX: 100, clientY: 100 });
    expect(dialog.open).toBe(false);
  });

  it("auto-loads once and removes listeners on destroy", async () => {
    const { root, dialog, trigger } = setup();
    await initComponents(root);
    expect(mountDialogStack(root)).toBe(0);
    expect(root.hasAttribute("data-sk-ready")).toBe(true);
    destroyMount(root);
    fireEvent.click(trigger);
    expect(dialog.open).toBe(false);
  });
});
