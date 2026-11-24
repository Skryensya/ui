import { act, fireEvent, render } from "@testing-library/react";
import { lightboxEvents } from "@skryensya/core/lightbox-controller";
import { describe, expect, it } from "vitest";
import { Gallery } from "./gallery.js";

const items = ["Desk", "Shade", "Base"].map((name) => ({
  value: name.toLowerCase(),
  view: <img alt={`${name} photo`} src={`/${name}.webp`} />,
  thumb: <img alt={name} src={`/${name}.webp`} />,
}));

describe("Gallery", () => {
  it("names the thumbnails as one radio group and checks the starting photo", () => {
    const ui = render(<Gallery items={items} name="lamp" label="Photos of the lamp" defaultValue="shade" />);
    const group = ui.getByRole("radiogroup", { name: "Photos of the lamp" });
    const radios = ui.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(radios.every((radio) => group.contains(radio))).toBe(true);
    expect(ui.getByRole("radio", { name: "Shade" })).toHaveProperty("checked", true);
    expect(radios.every((radio) => radio.getAttribute("name") === "lamp")).toBe(true);
  });

  it("lets the reader choose another photo, with one checked at a time", () => {
    const ui = render(<Gallery items={items} name="lamp" label="Photos" />);
    fireEvent.click(ui.getByRole("radio", { name: "Base" }));
    expect(ui.getAllByRole("radio").filter((radio) => (radio as HTMLInputElement).checked).map((radio) => radio.getAttribute("value"))).toEqual(["base"]);
  });

  it("puts one view per photo, in the thumbnails' order, for the stylesheet to pair", () => {
    const ui = render(<Gallery items={items} name="lamp" label="Photos" />);
    const views = ui.container.querySelectorAll(".sk-gallery__views > .sk-gallery__view");
    expect([...views].map((view) => view.querySelector("img")?.getAttribute("alt"))).toEqual(["Desk photo", "Shade photo", "Base photo"]);
  });

  it("moves its choice with a Lightbox opened from its photos", () => {
    const linked = ["desk", "shade"].map((value) => ({
      value,
      view: <a data-sk-lightbox-open="lamp-viewer" href={`/${value}.webp`}><img alt={value} src={`/${value}.webp`} /></a>,
      thumb: <img alt={value} src={`/${value}.webp`} />,
    }));
    const ui = render(<><Gallery items={linked} name="lamp" label="Photos" defaultValue="desk" /><dialog id="lamp-viewer" /></>);
    act(() => {
      document.getElementById("lamp-viewer")!.dispatchEvent(new CustomEvent(lightboxEvents.indexChange, { detail: { index: 1 } }));
    });
    expect(ui.getByRole("radio", { name: "shade" })).toHaveProperty("checked", true);
  });
});
