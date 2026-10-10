import { afterEach, describe, expect, it, vi } from "vitest";
import { dockParts } from "@skryensya/core/dock";

// Springs enhance the paint, never the actions: these controls work before any runtime has loaded.
afterEach(() => { document.body.replaceChildren(); });

function authoredDock() {
  document.body.innerHTML = `<form>
    <div class="sk-dock" role="group" aria-label="Quick actions">
      <button class="sk-dock__item sk-interactive" type="button" aria-label="Search">
        <span class="sk-dock__icon" aria-hidden="true"><svg></svg></span>
      </button>
      <button class="sk-dock__item sk-interactive" type="button" aria-label="Settings" disabled>
        <span class="sk-dock__icon" aria-hidden="true"><svg></svg></span>
      </button>
    </div>
  </form>`;
  return document.querySelector<HTMLButtonElement>(`.${dockParts.item}`)!;
}

describe("Dock authored markup", () => {
  it("keeps actions named and artwork decorative without an enhancer", () => {
    const button = authoredDock();
    expect(button.getAttribute("aria-label")).toBe("Search");
    expect(button.querySelector(`.${dockParts.icon}`)?.getAttribute("aria-hidden")).toBe("true");
    expect(button.tabIndex).toBe(0);
    expect(button.parentElement?.getAttribute("role")).toBe("group");
  });

  it("does not submit forms and respects native disabled behavior", () => {
    const button = authoredDock();
    const submit = vi.fn();
    document.querySelector("form")!.addEventListener("submit", submit);
    const action = vi.fn();
    const disabled = document.querySelector<HTMLButtonElement>("button:disabled")!;
    disabled.addEventListener("click", action);
    button.click();
    disabled.click();
    expect(submit).not.toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });
});
