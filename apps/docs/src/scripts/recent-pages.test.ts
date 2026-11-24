// @vitest-environment jsdom
import { commandPaletteEvents, type CommandPaletteRecents } from "@skryensya/core/command-palette";
import { resetStorageForTests } from "@skryensya/vanilla/storage";
import { beforeEach, describe, expect, it } from "vitest";
import { initRecentPages } from "./recent-pages";

const visit = (path: string) => {
  history.replaceState(null, "", path);
  initRecentPages();
};
const ask = (): CommandPaletteRecents => {
  const palette = document.createElement("dialog");
  palette.dataset.recentsLabel = "Recent";
  document.body.append(palette);
  const detail: CommandPaletteRecents = { hrefs: [] };
  palette.dispatchEvent(new CustomEvent(commandPaletteEvents.recents, { bubbles: true, detail }));
  palette.remove();
  return detail;
};

describe("recent pages", () => {
  beforeEach(() => {
    resetStorageForTests();
    document.body.innerHTML = "";
  });

  it("hands the palette the pages before this one, newest first, with its label", () => {
    visit("/a");
    visit("/b/");
    visit("/c");
    expect(ask()).toEqual({ hrefs: ["/b", "/a"], label: "Recent" });
  });

  it("lists a page once, however often it was opened", () => {
    visit("/a");
    visit("/b");
    visit("/a");
    visit("/c");
    expect(ask().hrefs).toEqual(["/a", "/b"]);
  });

  it("answers only a palette that carries the label, and never remembers the 404", () => {
    visit("/a");
    document.body.innerHTML = "<div data-docs-not-found></div>";
    visit("/gone");
    visit("/b");
    document.body.innerHTML = "";
    const bare = document.createElement("dialog");
    document.body.append(bare);
    const detail: CommandPaletteRecents = { hrefs: [] };
    bare.dispatchEvent(new CustomEvent(commandPaletteEvents.recents, { bubbles: true, detail }));
    expect(detail.hrefs).toEqual([]);
    expect(ask().hrefs).toEqual(["/a"]);
  });
});
