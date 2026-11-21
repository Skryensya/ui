import { describe, expect, it } from "vitest";
import { installCommand, kitVersion, releaseUrl } from "./install-command";

describe("installCommand", () => {
  it("installs from the release, never by package name", () => {
    expect(releaseUrl("core")).toBe(`https://github.com/Skryensya/ui/releases/download/v${kitVersion}/skryensya-core-${kitVersion}.tgz`);
    expect(installCommand("vanilla")).not.toMatch(/@skryensya\//);
  });

  it("brings the Skryensya packages a tarball depends on, once and first", () => {
    expect(installCommand("react", "icons-phosphor").split("\n").slice(1).map((line) => line.match(/skryensya-([a-z-]+)-\d/)![1])).toEqual([
      "core",
      "icons-lucide",
      "react",
      "icons-phosphor",
    ]);
  });
});
