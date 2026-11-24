import { afterEach, describe, expect, it, vi } from "vitest";
import { countMountedComponents, createConnectMount, destroyComponents } from "./svelte-hydrate.js";

/*
 * THE LIFECYCLE OF A MOUNTED COMPONENT when its markup goes away. Storybook re-renders a story by throwing the old markup
 * away, an app swaps a view the same way, and neither calls `destroy()`. A component left mounted there kept its document
 * listeners: a Lightbox still claimed clicks on its triggers, so the next Lightbox with the same id never opened. These pin
 * the two ways out: the runtime sweeps a root that left the page a frame later, and `destroyComponents` tears a subtree
 * down at once.
 */

const frame = () => new Promise<void>((resolve) => setTimeout(resolve, 40));

let cleanups = 0;
const mountProbe = createConnectMount({
  key: "lifecycle-probe",
  rootSelector: "[data-lifecycle-probe]",
  connect: () => () => {
    cleanups += 1;
  },
});

const host = () => {
  const element = document.createElement("div");
  element.innerHTML = `<div data-lifecycle-probe></div><div data-lifecycle-probe></div>`;
  document.body.append(element);
  return element;
};

afterEach(() => {
  destroyComponents(document);
  document.body.innerHTML = "";
  cleanups = 0;
});

describe("a mounted component whose markup goes away", () => {
  it("is torn down a frame after it leaves the page, and its markup can be mounted again", async () => {
    const first = host();
    expect(mountProbe(first)).toBe(2);
    expect(countMountedComponents(first)).toBe(2);

    first.remove();
    await frame();
    expect(cleanups).toBe(2);
    expect(countMountedComponents(document)).toBe(0);
    expect(first.querySelector("[data-sk-ready]")).toBeNull();

    document.body.append(first);
    expect(mountProbe(first)).toBe(2);
  });

  it("is left alone when it is only moved, taken out and put back in the same task", async () => {
    const first = host();
    const second = document.createElement("section");
    document.body.append(second);
    mountProbe(first);

    second.append(first);
    await frame();
    expect(cleanups).toBe(0);
    expect(countMountedComponents(document)).toBe(2);
  });

  it("is torn down at once, without leaving the page, by destroyComponents on a subtree", () => {
    const first = host();
    const other = host();
    mountProbe(document);

    expect(destroyComponents(first)).toBe(2);
    expect(cleanups).toBe(2);
    expect(countMountedComponents(other)).toBe(2);
  });

  it("does not run a cleanup twice when it is destroyed and then leaves the page", async () => {
    const first = host();
    mountProbe(first);
    destroyComponents(first);
    first.remove();
    await frame();
    expect(cleanups).toBe(2);
  });
});

vi.useRealTimers();
