import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expressiveAvatarAtlasLayout } from "@skryensya/core/expressive-avatar-atlas";
import { ExpressiveAvatar, type ExpressiveAvatarApi } from "./expressive-avatar.js";

describe("ExpressiveAvatar", () => {
  it("renders pixel mode with configurable parts and built-in sprite", () => {
    const ui = render(
      <ExpressiveAvatar
        name="Assistant"
        direction="left"
        mouth="smile"
        outfit="sweater-alt"
        hat="la-cap"
      />,
    );
    const root = ui.getByRole("img", { name: "Assistant" });

    expect(root.className).toContain("sk-expressive-avatar");
    expect(root.getAttribute("data-mode")).toBe("pixel");
    expect(root.querySelectorAll(".sk-expressive-avatar__tile")).toHaveLength(36);
    /* The left eye looks left: its tile is the one at that name's place in the tileset. */
    const eyeIndex = expressiveAvatarAtlasLayout.names.indexOf("left-eye-left");
    const cells = Array.from(root.querySelectorAll<HTMLElement>(".sk-expressive-avatar__tile")).map((tile) => [
      tile.style.getPropertyValue("--sk-expressive-avatar-column"),
      tile.style.getPropertyValue("--sk-expressive-avatar-row"),
    ]);
    expect(cells).toContainEqual([String(eyeIndex % 8), String(Math.floor(eyeIndex / 8))]);
  });

  it("renders image mode by swapping the whole image per expression", () => {
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

    expect(root.getAttribute("data-mode")).toBe("image");
    expect(root.getAttribute("data-expression")).toBe("smile");
    expect(img.getAttribute("src")).toBe("/smile.png");
    expect(img.getAttribute("srcset")).toBe("/smile@2x.png 2x");
    expect(img.getAttribute("width")).toBe("160");
    expect(img.getAttribute("height")).toBe("160");
  });

  it("falls back to the base body for an outfit the bundled tileset has not drawn", () => {
    const ui = render(<ExpressiveAvatar name="Assistant" outfit="sweater-alt" />);
    const root = ui.getByRole("img", { name: "Assistant" });
    const { names, columns } = expressiveAvatarAtlasLayout;
    const index = names.indexOf("base-tile-11");
    const tile = root.querySelectorAll<HTMLElement>(".sk-expressive-avatar__tile")[24]!;
    expect(tile.style.getPropertyValue("--sk-expressive-avatar-column")).toBe(String(index % columns));
    expect(tile.style.getPropertyValue("--sk-expressive-avatar-row")).toBe(String(Math.floor(index / columns)));
  });

  it("is one image: no symbols, no per-tile images, and a custom tileset only moves the window", () => {
    const ui = render(
      <ExpressiveAvatar name="Assistant" tileset={{ src: "/mine.png", columns: 2, names: ["base-tile-00", "hat-empty", "base-tile-01", "left-eye-base"] }} />,
    );
    const root = ui.getByRole("img", { name: "Assistant" });
    expect(root.querySelectorAll("use, img")).toHaveLength(0);
    expect(root.style.getPropertyValue("--sk-expressive-avatar-atlas")).toBe('url("/mine.png")');
    expect(root.style.getPropertyValue("--sk-expressive-avatar-columns")).toBe("2");
    expect(root.style.getPropertyValue("--sk-expressive-avatar-rows")).toBe("2");
  });

  it("shows an expression of its own by name, over only the parts it names", () => {
    const names = ["base-tile-00", "hat-empty", "left-eye-base", "right-eye-base", "mouth-rest-left", "mouth-rest-right", "surprised-eyes"];
    const ui = render(
      <ExpressiveAvatar name="Assistant" tileset={{ columns: 4, names }} expressions={{ astonished: { leftEye: "surprised-eyes" } }} expression="astonished" />,
    );
    const root = ui.getByRole("img", { name: "Assistant" });
    expect(root.getAttribute("data-expression")).toBe("astonished");
    const columnsOf = Array.from(root.querySelectorAll<HTMLElement>(".sk-expressive-avatar__tile")).map(
      (tile) => Number(tile.style.getPropertyValue("--sk-expressive-avatar-row")) * 4 + Number(tile.style.getPropertyValue("--sk-expressive-avatar-column")),
    );
    /* the left eye slot of the grid (index 14) is the custom tile (6); the right eye (15) stayed itself (3) */
    expect(columnsOf[14]).toBe(6);
    expect(columnsOf[15]).toBe(3);
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

  it("is a button, not an image, and its face is not announced", () => {
    const ui = render(<ExpressiveAvatar name="Allison" interactive phrases={phrases} />);
    const button = ui.getByRole("button", { name: "Allison" });
    expect(button.getAttribute("data-interactive")).toBe("");
    expect(button.querySelector(".sk-expressive-avatar__grid")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("types its phrase on a click, announces it once, and puts it away", () => {
    const onSpeak = vi.fn();
    const ui = render(<ExpressiveAvatar name="Allison" interactive phrases={phrases} onSpeak={onSpeak} />);
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
    const ui = render(<ExpressiveAvatar name="Allison" interactive phrases={phrases} />);
    const button = ui.getByRole("button", { name: "Allison" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON() {} });
    vi.stubGlobal("requestAnimationFrame", (run: FrameRequestCallback) => window.setTimeout(() => run(0), 0));

    fireEvent.pointerEnter(button, { clientX: 95, clientY: 50, pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(200));
    expect(button.getAttribute("data-direction")).toBe("right");
  });

  it("in image mode, mounts every image and shows the one for the look", () => {
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

  it("in image mode, a look with no image shows the base one", () => {
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
        phrases={{ greetings: [{ text: "Hola", category: "short", expression: "smile" }] }}
      />,
    );
    const button = ui.getByRole("button", { name: "Allison" });

    act(() => api.current!.express("wink", { duration: 500 }));
    expect(button.getAttribute("data-expression")).toBe("wink");
    act(() => vi.advanceTimersByTime(600));
    expect(button.getAttribute("data-expression")).toBeNull();

    act(() => {
      button.dispatchEvent(new CustomEvent("sk:expressiveavatarexpress", { detail: { expression: "smile" } }));
    });
    expect(button.getAttribute("data-expression")).toBe("smile");
    act(() => api.current!.express(null));
    expect(button.getAttribute("data-expression")).toBeNull();

    fireEvent.click(button);
    expect(button.getAttribute("data-expression")).toBe("smile");
  });

  it("speaks on request, whatever is next in the queue", () => {
    const api: { current: ExpressiveAvatarApi | null } = { current: null };
    const ui = render(<ExpressiveAvatar name="Allison" interactive apiRef={api} phrases={{}} />);
    act(() => api.current!.speak("Ups"));
    act(() => vi.advanceTimersByTime(200));
    expect(ui.container.querySelector(".sk-expressive-avatar__bubble")?.textContent).toBe("Ups");
  });
});
