import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { tagEvents } from "@skryensya/core/tag";
import { Tag } from "./tag.js";

describe("Tag", () => {
  it("serializes its appearance on both hosts, plain by default", () => {
    const ui = render(
      <>
        <Tag>Plain</Tag>
        <Tag appearance="brutalist" href="#x">Brutalist</Tag>
      </>,
    );
    expect(ui.getByText("Plain").closest(".sk-tag")?.getAttribute("data-appearance")).toBe("plain");
    expect(ui.getByText("Brutalist").closest("a")?.getAttribute("data-appearance")).toBe("brutalist");
  });

  it("carries its tone and label", () => {
    const ui = render(<Tag tone="accent">tokens</Tag>);
    const tag = ui.getByText("tokens").closest(".sk-tag");
    expect(tag?.getAttribute("data-tone")).toBe("accent");
  });

  it("exposes a named remove control only when removable is set", () => {
    const onRemove = vi.fn();
    const ui = render(
      <Tag onRemove={onRemove} removable removeLabel="Remove tokens">
        tokens
      </Tag>,
    );
    fireEvent.click(ui.getByLabelText("Remove tokens"));
    expect(onRemove).toHaveBeenCalledOnce();

    const plain = render(<Tag>tokens</Tag>);
    expect(plain.container.querySelector("button")).toBeNull();

    const handlerOnly = render(<Tag onRemove={() => {}}>tokens</Tag>);
    expect(handlerOnly.container.querySelector("button")).toBeNull();
  });

  it("dispatches the contract remove event on the host when the control is used", () => {
    const onEvent = vi.fn();
    const ui = render(
      <Tag removable removeLabel="Remove tokens">
        tokens
      </Tag>,
    );
    const host = ui.getByText("tokens").closest(".sk-tag");
    host?.addEventListener(tagEvents.remove, onEvent);
    fireEvent.click(ui.getByLabelText("Remove tokens"));
    expect(onEvent).toHaveBeenCalledOnce();
  });

  it("renders a navigable tag as a link and never as dismissible", () => {
    const ui = render(
      <Tag href="/topics/design" tone="accent">
        design
      </Tag>,
    );
    const link = ui.getByRole("link", { name: "design" });
    expect(link.getAttribute("href")).toBe("/topics/design");
    expect(link.className).toContain("sk-tag");
    expect(link.className).toContain("sk-interactive");
    expect(link.getAttribute("data-tone")).toBe("accent");
    expect(link.hasAttribute("data-removable")).toBe(false);
    expect(link.querySelector("button")).toBeNull();
  });

  it("removes with a real small icon-only button, not a lookalike", () => {
    const ui = render(
      <Tag removable removeLabel="Remove tokens">
        tokens
      </Tag>,
    );
    const remove = ui.getByLabelText("Remove tokens");
    // The whole point of the composition: hover/press/focus and the 44px hit area are the button's.
    expect(remove.className).toContain("sk-button");
    expect(remove.className).toContain("sk-interactive");
    expect(remove.getAttribute("data-size")).toBe("sm");
    expect(remove.getAttribute("data-variant")).toBe("ghost");
    expect(remove.hasAttribute("data-icon-only")).toBe(true);
    expect(remove.querySelector("svg")).not.toBeNull();
  });

  it("renders a toggle tag as a real button with aria-pressed, never dismissible", () => {
    const ui = render(
      <Tag selected tone="accent">
        Design
      </Tag>,
    );
    const toggle = ui.getByRole("button", { name: "Design" });
    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.getAttribute("type")).toBe("button");
    expect(toggle.className).toContain("sk-tag");
    expect(toggle.className).toContain("sk-interactive");
    expect(toggle.querySelector(`.${"sk-tag__remove"}`)).toBeNull();
  });

  it("calls onSelectedChange with the next value, not the current one", () => {
    const onSelectedChange = vi.fn();
    const ui = render(
      <Tag onSelectedChange={onSelectedChange} selected={false}>
        Design
      </Tag>,
    );
    fireEvent.click(ui.getByRole("button", { name: "Design" }));
    expect(onSelectedChange).toHaveBeenCalledOnce();
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it("disables a removable tag: aria-disabled on the chip, a real disabled on the remove button", () => {
    const onRemove = vi.fn();
    const ui = render(
      <Tag disabled onRemove={onRemove} removable removeLabel="Remove tokens">
        tokens
      </Tag>,
    );
    const tag = ui.getByText("tokens").closest(".sk-tag");
    expect(tag?.getAttribute("aria-disabled")).toBe("true");
    const remove = ui.getByLabelText("Remove tokens") as HTMLButtonElement;
    expect(remove.disabled).toBe(true);
    fireEvent.click(remove);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("disables a toggle tag with the real disabled attribute, and blocks the click", () => {
    const onSelectedChange = vi.fn();
    const ui = render(
      <Tag disabled onSelectedChange={onSelectedChange} selected={false}>
        Design
      </Tag>,
    );
    const toggle = ui.getByRole("button", { name: "Design" }) as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);
    expect(toggle.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(toggle);
    expect(onSelectedChange).not.toHaveBeenCalled();
  });

  it("warns in development when a tag renders nothing at all, on every shape, marking each visually too", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const ui = render(
      <>
        <Tag>{""}</Tag>
        <Tag href="/x">{""}</Tag>
        <Tag selected>{""}</Tag>
      </>,
    );

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls.at(-1)?.[0]).toMatch(/renders nothing/i);
    // Same shared `[data-sk-a11y-warn]` signal as Button's own empty-content case, on every shape.
    for (const el of ui.container.querySelectorAll(".sk-tag")) {
      expect(el.getAttribute("data-sk-a11y-warn")).toBe("");
    }
    spy.mockRestore();
  });

  it("does not warn when there is real content", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Tag>tokens</Tag>);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("recovers a truncated chip's full text through title, on every shape", () => {
    /* The chip ellipsizes at narrow widths with no way to read the full value. */
    const long = "customer-feedback-from-enterprise-onboarding";
    const plain = render(<Tag>{long}</Tag>);
    const link = render(<Tag href="/t">{long}</Tag>);
    const toggle = render(<Tag onSelectedChange={() => {}} selected={false}>{long}</Tag>);

    expect(plain.container.querySelector(".sk-tag")!.getAttribute("title")).toBe(long);
    expect(link.getByRole("link").getAttribute("title")).toBe(long);
    expect(toggle.getByRole("button").getAttribute("title")).toBe(long);
  });
});
