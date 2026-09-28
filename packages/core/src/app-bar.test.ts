import { describe, expect, it } from "vitest";
import { appBarContract, resolveAppBarKey, shouldSwitchOnPointer } from "./app-bar.js";

/* A bar of three menus: the application's own, "File" and "View". */
const resolve = (key: string, index: number, open = false) => resolveAppBarKey({ key, index, count: 3, open });

describe("resolveAppBarKey", () => {
  it("moves between menus with Left/Right and wraps at both ends", () => {
    expect(resolve("ArrowRight", 0)).toEqual({ kind: "move", index: 1, open: false });
    expect(resolve("ArrowRight", 2)).toEqual({ kind: "move", index: 0, open: false });
    expect(resolve("ArrowLeft", 0)).toEqual({ kind: "move", index: 2, open: false });
  });

  it("carries an open dropdown along to the neighbour", () => {
    expect(resolve("ArrowRight", 1, true)).toEqual({ kind: "move", index: 2, open: true });
    expect(resolve("ArrowLeft", 0, true)).toEqual({ kind: "move", index: 2, open: true });
  });

  it("gives Home/End to the bar only while nothing is open", () => {
    expect(resolve("End", 0)).toEqual({ kind: "move", index: 2, open: false });
    expect(resolve("Home", 2)).toEqual({ kind: "move", index: 0, open: false });
    expect(resolve("Home", 2, true)).toEqual({ kind: "none" });
  });

  it("leaves every other key to the dropdown", () => {
    for (const key of ["ArrowDown", "ArrowUp", "Enter", " ", "Escape", "a"]) expect(resolve(key, 1)).toEqual({ kind: "none" });
    expect(resolveAppBarKey({ key: "ArrowRight", index: 0, count: 0, open: false })).toEqual({ kind: "none" });
  });
});

describe("shouldSwitchOnPointer", () => {
  it("switches only once a menu of the bar is already open, and not to itself", () => {
    expect(shouldSwitchOnPointer({ openIndex: -1, pointedIndex: 1 })).toBe(false);
    expect(shouldSwitchOnPointer({ openIndex: 0, pointedIndex: 0 })).toBe(false);
    expect(shouldSwitchOnPointer({ openIndex: 0, pointedIndex: 2 })).toBe(true);
  });
});

describe("appBarContract", () => {
  it("names the menubar, not the bar around it", () => {
    const root = appBarContract.signatures.AppBar.template;
    const menus = root.children[0];
    expect(menus.attrs.role).toBe("menubar");
    expect(menus.options).toEqual(["label"]);
    expect("attrs" in root).toBe(false);
  });

  it("gives a status item no control unless it has a menu", () => {
    const [text, trigger] = appBarContract.signatures.AppBarStatus.template.children;
    expect(text.whenMissing).toBe("items");
    expect(trigger.whenGiven).toBe("items");
    expect("role" in trigger.attrs).toBe(false);
  });
});
