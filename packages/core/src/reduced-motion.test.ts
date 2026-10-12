import { describe, expect, it } from "vitest";
import { prefersReducedMotion } from "./reduced-motion.js";

const page = (attr: string | null, systemReduces: boolean) =>
  ({
    document: { documentElement: { getAttribute: (n: string) => (n === "data-motion" ? attr : null) } },
    matchMedia: () => ({ matches: systemReduces }),
  }) as unknown as Window;

describe("prefersReducedMotion", () => {
  it("is false when neither the system nor the app asks", () => {
    expect(prefersReducedMotion(page(null, false))).toBe(false);
  });
  it("follows the system setting", () => {
    expect(prefersReducedMotion(page(null, true))).toBe(true);
  });
  it("follows the app's data-motion=reduced", () => {
    expect(prefersReducedMotion(page("reduced", false))).toBe(true);
  });
  it("never lets the app take away what the system asked for", () => {
    expect(prefersReducedMotion(page("full", true))).toBe(true);
  });
  it("is false with no window (SSR)", () => {
    expect(prefersReducedMotion(undefined)).toBe(false);
  });
});
