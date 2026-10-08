import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollStack } from "./scroll-stack.js";

describe("ScrollStack", () => {
  it("renders the two layers in reading order, the runway and the content wrapper", () => {
    const { container } = render(<ScrollStack back={<h2>The cover</h2>} front={<h2>What comes next</h2>} />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("sk-scroll-stack");
    expect(Array.from(root.children).map((layer) => layer.className)).toEqual(["sk-scroll-stack__back", "sk-scroll-stack__front"]);
    const [back, front] = Array.from(root.children);
    expect(back!.textContent).toBe("The cover");
    expect(Array.from(front!.children).map((part) => part.className)).toEqual(["sk-scroll-stack__runway", "sk-scroll-stack__content"]);
    expect(front!.querySelector(".sk-scroll-stack__content")!.textContent).toBe("What comes next");
  });

  it("hides the runway from assistive technology: it is a clock, not content", () => {
    const { container } = render(<ScrollStack back="a" front="b" />);
    expect(container.querySelector(".sk-scroll-stack__runway")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("gives the layers no role of their own: the semantics are the author's", () => {
    const { container } = render(<ScrollStack back={<section aria-label="Cover" />} front={<section aria-label="Next" />} />);
    for (const layer of container.querySelectorAll(".sk-scroll-stack__back, .sk-scroll-stack__front, .sk-scroll-stack__content")) {
      expect(layer.hasAttribute("role")).toBe(false);
    }
  });

  it("passes id, aria-* and a class to the root", () => {
    const { container } = render(<ScrollStack id="intro" aria-label="Introduction" className="mine" back="a" front="b" />);
    const root = container.firstElementChild!;
    expect(root.id).toBe("intro");
    expect(root.getAttribute("aria-label")).toBe("Introduction");
    expect(root.className).toBe("sk-scroll-stack mine");
  });
});
