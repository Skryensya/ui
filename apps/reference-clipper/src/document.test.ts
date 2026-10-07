// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { captureDocument } from "./document";
afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});
it("captures semantic text, ARIA, computed layout and hierarchy without scripts or input values", async () => {
  document.body.innerHTML =
    '<section role="region" aria-label="Quota" style="display:flex;gap:8px"><h2>Storage</h2><input type="password" value="never-capture-this"><script>window.secret=true</script></section>';
  const result = await captureDocument("page"),
    section = result.raw.root.children[0];
  expect(section.role).toBe("region");
  expect(section.attributes["aria-label"]).toBe("Quota");
  expect(section.styles.display).toBe("flex");
  expect(section.styles.gap).toBe("8px");
  expect(section.children.map((c) => c.tag)).toEqual(["h2", "input"]);
  expect(section.children[0].attributes["heading-level"]).toBe("2");
  expect(JSON.stringify(result.raw)).not.toContain("never-capture-this");
  expect(JSON.stringify(result.raw)).not.toContain("window.secret");
});
it("selects one DOM element, removes the overlay and reports document-coordinate geometry", async () => {
  document.body.innerHTML = "<article><h2>Selected reference</h2></article>";
  const element = document.querySelector("article")!;
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
    new DOMRect(20, 30, 120, 80),
  );
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: vi.fn(() => element),
  });
  Object.defineProperty(Element.prototype, "setPointerCapture", {
    configurable: true,
    value: () => {},
  });
  const pending = captureDocument("selection");
  const overlay = document.documentElement.lastElementChild as HTMLElement;
  overlay.dispatchEvent(
    new MouseEvent("pointerdown", { clientX: 40, clientY: 45, bubbles: true }),
  );
  overlay.dispatchEvent(
    new MouseEvent("pointerup", { clientX: 40, clientY: 45, bubbles: true }),
  );
  expect(overlay.isConnected).toBe(true);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  const result = await pending;
  expect(result.raw.mode).toBe("element");
  expect(result.raw.root.tag).toBe("article");
  expect(result.raw.bounds).toEqual({ x: 20, y: 30, width: 120, height: 80 });
  expect(overlay.isConnected).toBe(false);
});
it("cancels selection with Escape and never leaves an overlay behind", async () => {
  const pending = captureDocument("selection");
  const overlay = document.documentElement.lastElementChild!;
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  await expect(pending).rejects.toThrow("cancelled");
  expect(overlay.isConnected).toBe(false);
});
