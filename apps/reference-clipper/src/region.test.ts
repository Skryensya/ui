// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { captureDocument } from "./document";
it("retains zero-box ancestors of intersecting UI and shields selection from page handlers", async () => {
  document.body.innerHTML =
    '<section style="display:contents"><article role="dialog">Account</article></section>';
  const target = document.querySelector("article")!;
  vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
    new DOMRect(30, 40, 120, 80),
  );
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: () => target,
  });
  Object.defineProperty(Element.prototype, "setPointerCapture", {
    configurable: true,
    value: () => {},
  });
  const pageHandler = vi.fn();
  document.addEventListener("pointerdown", pageHandler, true);
  try {
    const pending = captureDocument("region");
    const overlay = document.documentElement.lastElementChild!;
    overlay.dispatchEvent(
      new MouseEvent("pointerdown", {
        clientX: 30,
        clientY: 40,
        bubbles: true,
      }),
    );
    overlay.dispatchEvent(
      new MouseEvent("pointerup", {
        clientX: 150,
        clientY: 120,
        bubbles: true,
      }),
    );
    const result = await pending;
    expect(result.raw.root.children[0].styles.display).toBe("contents");
    expect(result.raw.root.children[0].children[0].role).toBe("dialog");
    expect(pageHandler).not.toHaveBeenCalled();
    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    expect(pageHandler).toHaveBeenCalledOnce();
  } finally {
    document.removeEventListener("pointerdown", pageHandler, true);
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  }
});
