import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollExpand } from "./scroll-expand.js";

describe("ScrollExpand", () => {
  it("renders the track (clock and stage) then what follows, with the lead before the container", () => {
    const { container } = render(
      <ScrollExpand lead={<h2>Open wide</h2>} after={<p>Next</p>}>
        <img alt="A lake" />
      </ScrollExpand>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toBe("sk-scroll-expand");
    expect(Array.from(root.children).map((part) => part.className)).toEqual(["sk-scroll-expand__track", "sk-scroll-expand__after"]);
    const track = root.firstElementChild!;
    expect(Array.from(track.children).map((part) => part.className)).toEqual(["sk-scroll-expand__clock", "sk-scroll-expand__stage"]);
    const stage = track.lastElementChild!;
    expect(Array.from(stage.children).map((part) => part.className)).toEqual(["sk-scroll-expand__lead", "sk-scroll-expand__container"]);
  });

  it("puts what fills the container in the backdrop and what arrives in the reveal, and owns no text of its own", () => {
    const { container } = render(
      <ScrollExpand reveal={<h3>Arrives</h3>}>
        <section aria-label="Demo">Fills</section>
      </ScrollExpand>,
    );
    const inside = container.querySelector(".sk-scroll-expand__container")!;
    expect(Array.from(inside.children).map((part) => part.className)).toEqual(["sk-scroll-expand__backdrop", "sk-scroll-expand__reveal"]);
    expect(inside.querySelector(".sk-scroll-expand__backdrop section")!.textContent).toBe("Fills");
    expect(inside.querySelector(".sk-scroll-expand__reveal h3")!.textContent).toBe("Arrives");
    expect(container.firstElementChild!.textContent).toBe("FillsArrives");
  });

  it("renders no reveal layer when there is no reveal", () => {
    const { container } = render(<ScrollExpand>m</ScrollExpand>);
    expect(container.querySelector(".sk-scroll-expand__reveal")).toBeNull();
    expect(container.querySelector(".sk-scroll-expand__backdrop")!.textContent).toBe("m");
  });

  it("renders no lead and no after when neither is given", () => {
    const { container } = render(<ScrollExpand>m</ScrollExpand>);
    expect(container.querySelector(".sk-scroll-expand__lead")).toBeNull();
    expect(container.querySelector(".sk-scroll-expand__after")).toBeNull();
  });

  it("hides the clock from assistive technology: it is a clock, not content", () => {
    const { container } = render(<ScrollExpand>m</ScrollExpand>);
    expect(container.querySelector(".sk-scroll-expand__clock")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("runs expand by default and carries the direction as a data attribute", () => {
    const { container, rerender } = render(<ScrollExpand>m</ScrollExpand>);
    expect(container.firstElementChild!.getAttribute("data-direction")).toBe("expand");
    rerender(<ScrollExpand direction="contract">m</ScrollExpand>);
    expect(container.firstElementChild!.getAttribute("data-direction")).toBe("contract");
  });

  it("passes id, aria-* and a class to the root", () => {
    const { container } = render(
      <ScrollExpand id="lake" aria-label="The lake" className="mine">
        m
      </ScrollExpand>,
    );
    const root = container.firstElementChild!;
    expect(root.id).toBe("lake");
    expect(root.getAttribute("aria-label")).toBe("The lake");
    expect(root.className).toBe("sk-scroll-expand mine");
  });
});
