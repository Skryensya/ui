import { describe, expect, it } from "vitest";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { emitMarkup, emitReact } from "./emit.js";
import { validateUsageTree } from "./validate.js";

const action: UsageTree = {
  contract: "dock", signature: "DockItem", options: { label: "Search" },
  children: { contract: "icon", signature: "Icon", options: { name: "search", size: "md" } },
};
const dock: UsageTree = {
  contract: "dock", signature: "Dock", options: { label: "Quick actions" }, children: action,
};

describe("Dock contract", () => {
  it("accepts a named group and named icon actions", () => {
    expect(validateUsageTree(dock).problems).toEqual([]);
  });
  it("requires names on the group and on each action", () => {
    expect(validateUsageTree({ ...dock, options: {} }).valid).toBe(false);
    expect(validateUsageTree({ ...dock, children: { ...action, options: {} } }).valid).toBe(false);
  });
  it("emits native named controls and decorative icons for Vanilla", () => {
    const html = emitMarkup(dock);
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Quick actions"');
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="Search"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-sk-dock');
  });
  it("emits the composable React binding", () => {
    const react = emitReact(dock);
    expect(react).toContain('<Dock label="Quick actions">');
    expect(react).toContain('<DockItem label="Search"');
  });
});
