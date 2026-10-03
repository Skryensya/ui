import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Shimmer } from "./shimmer.js";

describe("Shimmer", () => {
  it("renders temporary status text with the shimmer part", () => {
    const ui = render(<Shimmer>Generating response…</Shimmer>);
    const el = ui.getByText("Generating response…");
    expect(el.tagName).toBe("SPAN");
    expect(el.classList.contains("sk-shimmer")).toBe(true);
  });

  it("serializes motion flags as attributes", () => {
    const ui = render(<Shimmer once reverse>Reading files</Shimmer>);
    const el = ui.getByText("Reading files");
    expect(el.hasAttribute("data-once")).toBe(true);
    expect(el.hasAttribute("data-reverse")).toBe(true);
  });

  it("can disable the sweep without removing the text", () => {
    const ui = render(<Shimmer active={false}>Idle</Shimmer>);
    expect(ui.getByText("Idle").getAttribute("data-shimmer")).toBe("false");
  });

  it("writes tuning hooks through style", () => {
    const ui = render(<Shimmer color="red" duration="1200ms" spread="4em" angle="90deg">Working</Shimmer>);
    const el = ui.getByText("Working") as HTMLElement;
    expect(el.style.getPropertyValue("--sk-shimmer-color")).toBe("red");
    expect(el.style.getPropertyValue("--sk-shimmer-duration")).toBe("1200ms");
    expect(el.style.getPropertyValue("--sk-shimmer-spread")).toBe("4em");
    expect(el.style.getPropertyValue("--sk-shimmer-angle")).toBe("90deg");
  });
});
