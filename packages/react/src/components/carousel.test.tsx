import type { UsageTree } from "@skryensya/core/usage-tree";
import { createRef } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Carousel, CarouselSlide, type CarouselHandle } from "./carousel.js";
import { loadTree, renderTree } from "../render-tree.js";

describe("Carousel", () => {
  it("renders a section region with a scroll-snap track of slides", () => {
    const ui = render(
      <Carousel aria-label="Destacados">
        <CarouselSlide>Uno</CarouselSlide>
        <CarouselSlide>Dos</CarouselSlide>
        <CarouselSlide>Tres</CarouselSlide>
      </Carousel>,
    );

    const region = ui.container.querySelector(".sk-carousel")!;
    expect(region.tagName).toBe("SECTION");
    expect(region.getAttribute("data-sk-carousel")).toBe("");
    expect(region.getAttribute("aria-label")).toBe("Destacados");

    const track = region.querySelector(".sk-carousel__track")!;
    // A div, not a list: the machine gives each slide role="group", which takes it out of the list.
    expect(track.tagName).toBe("DIV");
    expect(track.querySelectorAll("div.sk-carousel__slide")).toHaveLength(3);
  });

  it("writes align, step, snap and edge padding on the root and marks the slides that are not stops", () => {
    const ui = render(
      <Carousel aria-label="Focused" align="center" edgePadding="2rem" slidesPerMove={2} snap="proximity">
        <CarouselSlide>Uno</CarouselSlide>
        <CarouselSlide>Dos</CarouselSlide>
        <CarouselSlide>Tres</CarouselSlide>
      </Carousel>,
    );
    const region = ui.container.querySelector<HTMLElement>(".sk-carousel")!;
    expect(region.getAttribute("data-align")).toBe("center");
    expect(region.getAttribute("data-slides-per-move")).toBe("2");
    expect(region.getAttribute("data-snap")).toBe("proximity");
    expect(region.style.getPropertyValue("--sk-carousel-edge-padding")).toBe("2rem");

    const slides = Array.from(region.querySelectorAll<HTMLElement>(".sk-carousel__slide"));
    expect(slides.map((slide) => slide.hasAttribute("data-no-snap"))).toEqual([false, true, false]);
    expect(slides[0]!.style.scrollSnapAlign).toBe("center");
  });

  it("leaves the options off the root when none is asked for", () => {
    const ui = render(
      <Carousel aria-label="Plain">
        <CarouselSlide>Uno</CarouselSlide>
        <CarouselSlide>Dos</CarouselSlide>
      </Carousel>,
    );
    const region = ui.container.querySelector(".sk-carousel")!;
    for (const attr of ["data-align", "data-slides-per-move", "data-snap"]) expect(region.hasAttribute(attr)).toBe(false);
    expect(ui.container.querySelector("[data-no-snap]")).toBeNull();
  });

  it("maps style-backed tree options onto the Carousel host", async () => {
    const tree: UsageTree = {
      contract: "carousel",
      signature: "Carousel",
      options: { mounted: false, slideSize: "min(42%, 14rem)" },
      children: {
        contract: "carousel",
        signature: "CarouselSlide",
        children: "Search",
      },
    };

    await loadTree(tree);
    const ui = render(<>{renderTree(tree)}</>);
    const region = ui.container.querySelector<HTMLElement>(".sk-carousel")!;

    expect(region.hasAttribute("data-sk-carousel")).toBe(false);
    expect(region.hasAttribute("data-slide-size")).toBe(false);
    expect(region.style.getPropertyValue("--sk-carousel-slide-size")).toBe(
      "min(42%, 14rem)",
    );
  });

  it("exposes a snapTo handle that dispatches the goto command the enhancer listens for", () => {
    const ref = createRef<CarouselHandle>();
    const ui = render(
      <Carousel ref={ref}>
        <CarouselSlide>Uno</CarouselSlide>
        <CarouselSlide>Dos</CarouselSlide>
      </Carousel>,
    );

    const root = ui.container.querySelector(".sk-carousel")!;
    const onGoto = vi.fn();
    root.addEventListener("sk:carouselgoto", onGoto as EventListener);

    ref.current?.snapTo(1);

    expect(onGoto).toHaveBeenCalledTimes(1);
    expect((onGoto.mock.calls[0][0] as CustomEvent).detail).toEqual({ index: 1 });
    expect(ref.current?.element).toBe(root);
  });

  it("falls back to the count display past a reasonable number of slides, regardless of the chosen indicator", () => {
    /* Found as a real break: one <button> per slide with no cap rendered a ~2,416px control rail
       for 1,000 slides. The contract's own "count" indicator is the built-in escape hatch for this,
       so it takes over past the cap even when "dots" was explicitly asked for - a wall of dots
       stops being navigation long before 1,000. */
    const slides = Array.from({ length: 30 }, (_, index) => <CarouselSlide key={index}>{index}</CarouselSlide>);
    const ui = render(<Carousel aria-label="Muchos" indicator="dots">{slides}</Carousel>);

    expect(ui.container.querySelector(".sk-carousel__dots")).toBeNull();
    expect(ui.container.querySelector(".sk-carousel__count")?.textContent).toBe("1 / 30");
  });
});
