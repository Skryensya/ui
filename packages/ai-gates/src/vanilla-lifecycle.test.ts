// @vitest-environment jsdom
import "@skryensya/vanilla/test-setup";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { countMountedComponents, destroyComponents, initComponents } from "@skryensya/vanilla";
import { afterEach, describe, expect, it } from "vitest";
import { canonicalTrees } from "./trees.js";

/*
 * EVERY COMPONENT THAT MOUNTS, ONE LIFECYCLE. For each canonical case with an enhancer behind it: mount it, throw its markup
 * away the way Storybook and apps do (no destroy call), and check that nothing is left mounted a frame later and that the
 * same markup mounts again. A component whose teardown leaks (a document listener, an observer, a registry entry) is what
 * left the Lightbox dead in Storybook after a story switch; this is the gate that keeps every other one from doing the same.
 */

const frame = () => new Promise<void>((resolve) => setTimeout(resolve, 40));
const cases = canonicalTrees.filter(({ enhanced }) => enhanced).map(({ name, tree }) => ({ name, markup: emitMarkup(tree) }));

afterEach(() => {
  destroyComponents(document);
  document.body.innerHTML = "";
});

/* Cases `initComponents` mounts nothing for (code preview is an opt-in docs surface the registry leaves out; a few mount
   through their own entry) have no lifecycle here; the floor below keeps the rest from quietly shrinking to nothing. */
let exercised = 0;

describe("every enhanced component, thrown away and rendered again", () => {

  for (const { name, markup } of cases) {
    it(`${name}: torn down when its markup leaves the page, and mounts again`, async () => {
      const first = document.createElement("div");
      first.innerHTML = markup;
      document.body.append(first);
      await initComponents(first);
      const mounted = countMountedComponents(first);
      if (mounted === 0) return;
      exercised += 1;

      first.remove();
      await frame();
      expect(countMountedComponents(document)).toBe(0);

      const second = document.createElement("div");
      second.innerHTML = markup;
      document.body.append(second);
      await initComponents(second);
      expect(countMountedComponents(second)).toBe(mounted);
    });
  }
});

describe("the lifecycle gate", () => {
  it("exercised a real number of components", () => {
    expect(exercised).toBeGreaterThan(80);
  });
});
