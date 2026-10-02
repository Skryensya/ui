import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Menubar, MenubarItem } from "./menubar.js";

/*
 * The browser's anchoring engine is on for this file (jsdom has none, so the answer is forced), so
 * the question under test is the one a real browser asks: does a dropdown with a submenu in it still
 * hand its own placement to the engine? It must not. A submenu is placed by the machine in viewport
 * coordinates, and mixing the two engines one level apart sent it to the far corner of the page.
 */
vi.mock("@skryensya/core/anchored", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@skryensya/core/anchored")>()),
  supportsAnchorPositioning: () => true,
}));

const anchorName = (element: HTMLElement) => element.style.getPropertyValue("--sk-anchored-name");

describe("Menubar anchoring", () => {
  it("anchors a flat dropdown natively", () => {
    const ui = render(
      <Menubar label="Editor">
        <MenubarItem items={[{ value: "new", label: "Nuevo" }]}>Archivo</MenubarItem>
      </Menubar>,
    );
    expect(anchorName(ui.getByRole("menuitem", { name: "Archivo" }))).not.toBe("");
  });

  it("leaves a dropdown that holds a submenu to the machine, as Menu does", () => {
    const ui = render(
      <Menubar label="Editor">
        <MenubarItem
          items={[{ value: "export", label: "Exportar", children: [{ value: "pdf", label: "PDF" }] }]}
        >
          Archivo
        </MenubarItem>
      </Menubar>,
    );
    expect(anchorName(ui.getByRole("menuitem", { name: "Archivo" }))).toBe("");
  });
});
