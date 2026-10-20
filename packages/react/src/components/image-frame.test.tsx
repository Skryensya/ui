import { imageFrameParts } from "@skryensya/core/image-frame";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageFrame } from "./image-frame.js";

describe("ImageFrame", () => {
  it("serializes its appearance beside its other options, plain by default", () => {
    const plain = render(<ImageFrame alt="Plain" src="/a.png" />);
    expect(plain.getByRole("img", { name: "Plain" }).closest(".sk-image-frame")?.getAttribute("data-appearance")).toBe("plain");
    const brutalist = render(<ImageFrame alt="Brutalist" appearance="brutalist" src="/b.png" />);
    expect(brutalist.getByRole("img", { name: "Brutalist" }).closest(".sk-image-frame")?.getAttribute("data-appearance")).toBe("brutalist");
  });

  it("maps geometry props to data attributes on the authored root", () => {
    const ui = render(
      <ImageFrame as="figure" aspect="16/9" fit="contain" position="top" radius="control" border="subtle">
        <img className={imageFrameParts.media} src="/photo.jpg" alt="Puerto" />
      </ImageFrame>,
    );

    const frame = ui.container.querySelector("figure.sk-image-frame");
    expect(frame?.getAttribute("data-aspect")).toBe("16/9");
    expect(frame?.getAttribute("data-fit")).toBe("contain");
    expect(frame?.getAttribute("data-position")).toBe("top");
    expect(frame?.getAttribute("data-radius")).toBe("control");
    expect(frame?.getAttribute("data-border")).toBe("subtle");
    expect(frame?.querySelector("img.sk-image-frame__media")?.getAttribute("alt")).toBe("Puerto");
  });

  it("renders a media img from src/alt when children are omitted", () => {
    const ui = render(<ImageFrame src="/cover.jpg" alt="Portada" aspect="1/1" />);
    const img = ui.container.querySelector("img.sk-image-frame__media");
    expect(img?.getAttribute("src")).toBe("/cover.jpg");
    expect(img?.getAttribute("alt")).toBe("Portada");
  });

  it("keeps a caption beside the src media", () => {
    const ui = render(
      <ImageFrame
        src="/cover.jpg"
        alt=""
        aspect="16/9"
        caption={<div className="sk-media-overlay" data-edge="bottom">Title</div>}
      />,
    );
    const frame = ui.container.querySelector(".sk-image-frame");
    expect(frame?.querySelector("img.sk-image-frame__media")?.getAttribute("src")).toBe("/cover.jpg");
    expect(frame?.querySelector(".sk-media-overlay")?.textContent).toBe("Title");
  });

  it("actually fires onError when the src image fails to load", () => {
    /*
     * `error` on an `<img>` does not bubble (verified live against the break harness: a listener
     * on the wrapper this component renders never ran). `onError` used to flow through `...props`
     * onto that wrapper - accepted by the type, silently dead at runtime. Routed directly onto the
     * `<img>` now, the only element that can actually dispatch it.
     */
    const onError = vi.fn();
    const ui = render(<ImageFrame alt="Broken" onError={onError} src="/missing.jpg" />);
    const img = ui.container.querySelector("img.sk-image-frame__media")!;

    fireEvent.error(img);

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("lets a caller who knows their own asset back it with a light surface via the published hook", () => {
    /* `--sk-image-frame-bg` is a published contract hook (imageFrameContract.hooks), not a new
       mechanism - the gap was never missing code, it was that nothing demonstrated using it for
       exactly the case (black artwork on transparency) that needs it in dark mode. */
    const ui = render(
      <ImageFrame alt="Logo" src="/logo.svg" style={{ "--sk-image-frame-bg": "#fff" } as never} />,
    );
    const frame = ui.container.querySelector(".sk-image-frame") as HTMLElement;
    expect(frame.style.getPropertyValue("--sk-image-frame-bg")).toBe("#fff");
  });
});
