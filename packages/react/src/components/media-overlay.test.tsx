import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaOverlay, MediaOverlayShade } from "./media-overlay.js";

describe("MediaOverlayShade", () => {
  it("maps strength and stays decorative", () => {
    const ui = render(<MediaOverlayShade strength="strong" />);
    const el = ui.container.querySelector(".sk-media-overlay-shade");
    expect(el?.getAttribute("data-strength")).toBe("strong");
    expect(el?.getAttribute("aria-hidden")).toBe("true");
  });

  it("MediaOverlay hosts edge and can inject the wash via strength", () => {
    const ui = render(
      <MediaOverlay edge="start" strength="moderate">
        <h3>Puerto</h3>
      </MediaOverlay>,
    );
    const caption = ui.container.querySelector(".sk-media-overlay");
    const wash = caption?.querySelector(".sk-media-overlay-shade");
    expect(caption?.getAttribute("data-edge")).toBe("start");
    expect(wash?.getAttribute("data-strength")).toBe("moderate");
    expect(caption?.textContent).toContain("Puerto");
  });
});
