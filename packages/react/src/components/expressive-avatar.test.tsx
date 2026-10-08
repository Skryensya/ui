import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpressiveAvatar, type ExpressiveAvatarApi } from "./expressive-avatar.js";

describe("ExpressiveAvatar", () => {
  it("shows the whole image of the expression asked for", () => {
    const ui = render(
      <ExpressiveAvatar
        name="Assistant"
        expression="smile"
        images={{
          base: "/base.png",
          smile: { src: "/smile.png", srcSet: "/smile@2x.png 2x", width: 160, height: 160 },
        }}
      />,
    );
    const root = ui.getByRole("img", { name: "Assistant" });
    const img = root.querySelector("img")!;

    expect(root.className).toContain("sk-expressive-avatar");
    expect(root.getAttribute("data-expression")).toBe("smile");
    expect(root.querySelectorAll("img")).toHaveLength(1);
    expect(img.getAttribute("src")).toBe("/smile.png");
    expect(img.getAttribute("srcset")).toBe("/smile@2x.png 2x");
    expect(img.getAttribute("width")).toBe("160");
    expect(img.getAttribute("height")).toBe("160");
    expect(img.getAttribute("alt")).toBe("");
    expect(img.getAttribute("aria-hidden")).toBe("true");
  });

  it("falls back to base for an expression with no image", () => {
    const ui = render(<ExpressiveAvatar name="Assistant" expression="astonished" images={{ base: "/base.png" }} />);
    const root = ui.getByRole("img", { name: "Assistant" });
    expect(root.getAttribute("data-expression")).toBe("base");
    expect(root.querySelector("img")?.getAttribute("src")).toBe("/base.png");
  });

  it("takes a name of its own as an expression, with nothing but an image for it", () => {
    const ui = render(<ExpressiveAvatar name="Assistant" expression="astonished" images={{ base: "/base.png", astonished: "/astonished.png" }} />);
    const root = ui.getByRole("img", { name: "Assistant" });
    expect(root.getAttribute("data-expression")).toBe("astonished");
    expect(root.querySelector("img")?.getAttribute("src")).toBe("/astonished.png");
  });

  it("is one image with src, the shorthand for base", () => {
    const ui = render(<ExpressiveAvatar name="Assistant" src="/one.png" />);
    expect(ui.getByRole("img", { name: "Assistant" }).querySelector("img")?.getAttribute("src")).toBe("/one.png");
  });

  it("draws an empty circle, not a broken image, when there is nothing to show", () => {
    const ui = render(<ExpressiveAvatar name="Assistant" />);
    expect(ui.getByRole("img", { name: "Assistant" }).querySelectorAll("img")).toHaveLength(0);
  });
});

describe("ExpressiveAvatar, alive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("pointer: fine"),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const phrases = { greetings: [{ text: "Hola", category: "short" as const }] };
  const faces = { base: "/base.png", right: "/right.png", blink: "/blink.png", smile: "/smile.png", wink: "/wink.png" };

  it("is a button, not an image, and its face is not announced", () => {
    const ui = render(<ExpressiveAvatar name="Allison" interactive images={faces} phrases={phrases} />);
    const button = ui.getByRole("button", { name: "Allison" });
    expect(button.getAttribute("data-interactive")).toBe("");
    for (const img of button.querySelectorAll("img")) expect(img.getAttribute("aria-hidden")).toBe("true");
  });

  it("types its phrase on a click, announces it once, and puts it away", () => {
    const onSpeak = vi.fn();
    const ui = render(<ExpressiveAvatar name="Allison" interactive images={faces} phrases={phrases} onSpeak={onSpeak} />);
    const bubble = () => ui.container.querySelector(".sk-expressive-avatar__bubble")!;

    fireEvent.click(ui.getByRole("button", { name: "Allison" }));
    expect(onSpeak).toHaveBeenCalledWith({ text: "Hola", category: "short" });

    act(() => vi.advanceTimersByTime(70));
    expect(bubble().textContent).toBe("Ho");
    expect(ui.getByRole("status").textContent).toBe("");

    act(() => vi.advanceTimersByTime(200));
    expect(bubble().textContent).toBe("Hola");
    expect(ui.getByRole("status").textContent).toBe("Hola");

    act(() => vi.advanceTimersByTime(3000));
    expect(bubble().getAttribute("data-phase")).toBe("hidden");
  });

  it("looks where the pointer is once it is on the face", () => {
    const ui = render(<ExpressiveAvatar name="Allison" interactive images={faces} phrases={phrases} />);
    const button = ui.getByRole("button", { name: "Allison" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} });
    vi.stubGlobal("requestAnimationFrame", (run: FrameRequestCallback) => window.setTimeout(() => run(0), 0));

    fireEvent.pointerEnter(button, { clientX: 95, clientY: 50, pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(200));
    expect(button.getAttribute("data-expression")).toBe("right");
  });

  it("mounts every image and shows the one for the look", () => {
    const ui = render(
      <ExpressiveAvatar
        name="Allison"
        interactive
        images={{ base: "/base.png", right: "/right.png", blink: "/blink.png" }}
      />,
    );
    const button = ui.getByRole("button", { name: "Allison" });
    const imgs = Array.from(button.querySelectorAll("img"));
    expect(imgs.map((img) => img.getAttribute("data-state"))).toEqual(["base", "right", "blink"]);
    expect(imgs.filter((img) => img.getAttribute("data-active") === "true").map((img) => img.getAttribute("src"))).toEqual(["/base.png"]);

    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} });
    vi.stubGlobal("requestAnimationFrame", (run: FrameRequestCallback) => window.setTimeout(() => run(0), 0));
    fireEvent.pointerEnter(button, { clientX: 95, clientY: 50, pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(200));
    expect(button.querySelector('img[data-active="true"]')?.getAttribute("src")).toBe("/right.png");
  });

  it("shows the base image for a look that has none", () => {
    const ui = render(<ExpressiveAvatar name="Allison" interactive images={{ base: "/base.png" }} />);
    const button = ui.getByRole("button", { name: "Allison" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} });
    vi.stubGlobal("requestAnimationFrame", (run: FrameRequestCallback) => window.setTimeout(() => run(0), 0));
    fireEvent.pointerEnter(button, { clientX: 95, clientY: 50, pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(200));
    expect(button.getAttribute("data-expression")).toBe("base");
  });

  it("is triggered from outside by an api, by an event, and by a phrase", () => {
    const api: { current: ExpressiveAvatarApi | null } = { current: null };
    const ui = render(
      <ExpressiveAvatar
        name="Allison"
        interactive
        apiRef={api}
        images={faces}
        phrases={{ greetings: [{ text: "Hola", category: "short", expression: "smile" }] }}
      />,
    );
    const button = ui.getByRole("button", { name: "Allison" });

    act(() => api.current!.express("wink", { duration: 500 }));
    expect(button.getAttribute("data-expression")).toBe("wink");
    act(() => vi.advanceTimersByTime(600));
    expect(button.getAttribute("data-expression")).toBe("base");

    act(() => {
      button.dispatchEvent(new CustomEvent("sk:expressiveavatarexpress", { detail: { expression: "smile" } }));
    });
    expect(button.getAttribute("data-expression")).toBe("smile");
    act(() => api.current!.express(null));
    expect(button.getAttribute("data-expression")).toBe("base");

    fireEvent.click(button);
    expect(button.getAttribute("data-expression")).toBe("smile");
  });

  it("speaks on request, whatever is next in the queue", () => {
    const api: { current: ExpressiveAvatarApi | null } = { current: null };
    const ui = render(<ExpressiveAvatar name="Allison" interactive images={faces} apiRef={api} phrases={{}} />);
    act(() => api.current!.speak("Ups"));
    act(() => vi.advanceTimersByTime(200));
    expect(ui.container.querySelector(".sk-expressive-avatar__bubble")?.textContent).toBe("Ups");
  });
});
