import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MorphStack } from "./morph-stack.js";

const plates = { back: <i>back</i>, middle: <i>middle</i>, front: <i>front</i> };

describe("MorphStack", () => {
  it("renders the stage with the three plates in depth order", () => {
    const { container } = render(<MorphStack {...plates} />);
    const root = container.firstElementChild!;
    expect(root.className).toBe("sk-morph-stack");
    const stage = root.firstElementChild!;
    expect(stage.className).toBe("sk-morph-stack__stage");
    expect(Array.from(stage.children).map((plate) => plate.className)).toEqual([
      "sk-morph-stack__back",
      "sk-morph-stack__middle",
      "sk-morph-stack__front",
    ]);
    expect(Array.from(stage.children).map((plate) => plate.textContent)).toEqual(["back", "middle", "front"]);
  });

  it("answers to the pointer unless told otherwise", () => {
    const { container, rerender } = render(<MorphStack {...plates} />);
    expect(container.firstElementChild!.getAttribute("data-state")).toBe("auto");
    rerender(<MorphStack {...plates} state="expanded" />);
    expect(container.firstElementChild!.getAttribute("data-state")).toBe("expanded");
  });

  it("takes two more plates at the ends, in depth order, and leaves them out when they are not given", () => {
    const { container, rerender } = render(<MorphStack {...plates} />);
    const stage = () => container.querySelector(".sk-morph-stack__stage")!;
    expect(stage().children).toHaveLength(3);
    rerender(<MorphStack {...plates} deepest={<i>deepest</i>} nearest={<i>nearest</i>} />);
    expect(Array.from(stage().children).map((plate) => plate.className)).toEqual([
      "sk-morph-stack__deepest",
      "sk-morph-stack__back",
      "sk-morph-stack__middle",
      "sk-morph-stack__front",
      "sk-morph-stack__nearest",
    ]);
  });

  it("turns one way unless told otherwise", () => {
    const { container, rerender } = render(<MorphStack {...plates} />);
    expect(container.firstElementChild!.getAttribute("data-turn")).toBe("start");
    rerender(<MorphStack {...plates} turn="end" />);
    expect(container.firstElementChild!.getAttribute("data-turn")).toBe("end");
  });

  it("writes the perspective to its hook, and leaves the style alone when there is none", () => {
    const { container, rerender } = render(<MorphStack {...plates} />);
    expect(container.firstElementChild!.getAttribute("style")).toBeNull();
    rerender(<MorphStack {...plates} perspective="30rem" />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--sk-morph-stack-perspective")).toBe("30rem");
  });

  it("lets the consumer's own style win over the perspective option", () => {
    const { container } = render(<MorphStack {...plates} perspective="30rem" style={{ "--sk-morph-stack-perspective": "10rem" } as never} />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--sk-morph-stack-perspective")).toBe("10rem");
  });

  it("gives the plates no role of their own: the semantics are the author's", () => {
    const { container } = render(<MorphStack {...plates} />);
    for (const plate of container.querySelectorAll("[class^='sk-morph-stack__']")) {
      expect(plate.hasAttribute("role")).toBe(false);
    }
  });

  it("passes id, aria-* and a class to the root", () => {
    const { container } = render(<MorphStack {...plates} id="layers" aria-label="Layers" className="mine" />);
    const root = container.firstElementChild!;
    expect(root.id).toBe("layers");
    expect(root.getAttribute("aria-label")).toBe("Layers");
    expect(root.className).toBe("sk-morph-stack mine");
  });
});
