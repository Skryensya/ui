import { describe, expect, it } from "vitest";
import { canvasBlocks, blockFragment } from "./canvas-fragment";
import { componentsCanvas } from "./components-canvas";

describe("canvas icons", () => {
  it("paints icon placeholders into svg in the HTML, so none waits for script", () => {
    const html = componentsCanvas().filter((c) => c.signatures.length).flatMap((c) => canvasBlocks([c])).map(blockFragment).join("");
    expect(html).toContain('<svg');
    expect(html).not.toMatch(/<span data-sk-icon="[a-z0-9-]+"( data-sk-icon-size="[a-z]+")?><\/span>/);
  });
});
