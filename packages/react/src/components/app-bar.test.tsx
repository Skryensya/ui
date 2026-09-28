import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppBar, AppBarMenu, AppBarStatus } from "./app-bar.js";

/*
 * A bar shaped like a desktop one: the application's menu in bold, "Archivo" and "Ver" with
 * dropdowns, "Ayuda" as a plain command, and on the trailing side one word of status and one status
 * menu. `@zag-js/react` schedules its transitions on a microtask, so `tick()` flushes one before each
 * assertion about `aria-expanded`.
 */
const tick = () => act(() => Promise.resolve());

function Fixture(props: { onHelp?: () => void; onSelect?: (value: string) => void }) {
  return (
    <AppBar
      label="Maker"
      status={
        <>
          <AppBarStatus>Guardado</AppBarStatus>
          <AppBarStatus items={[{ value: "72", label: "72rem" }]}>Ancho</AppBarStatus>
        </>
      }
    >
      <AppBarMenu strong items={[{ value: "about", label: "Acerca de Maker" }]}>
        Maker
      </AppBarMenu>
      <AppBarMenu items={[{ value: "new", label: "Nuevo" }]} onSelect={(details) => props.onSelect?.(details.value)}>
        Archivo
      </AppBarMenu>
      <AppBarMenu items={[{ value: "zoom", label: "Acercar" }]}>Ver</AppBarMenu>
      <AppBarMenu onActivate={props.onHelp}>Ayuda</AppBarMenu>
    </AppBar>
  );
}

const titles = (ui: ReturnType<typeof render>) => ui.getAllByRole("menuitem", { name: /^(Maker|Archivo|Ver|Ayuda)$/ });

describe("AppBar", () => {
  it("names the menubar, keeps one tab stop across the menus, and leaves status outside it", () => {
    const ui = render(<Fixture />);
    const menubar = ui.getByRole("menubar", { name: "Maker" });
    const [maker, archivo, , ayuda] = titles(ui);
    expect(maker!.tabIndex).toBe(0);
    expect(archivo!.tabIndex).toBe(-1);
    expect(ayuda!.hasAttribute("aria-haspopup")).toBe(false);
    expect(menubar.contains(ui.getByText("Guardado"))).toBe(false);
    /* Plain status is text: nothing to focus, nothing to press. */
    expect(ui.getByText("Guardado").closest("button")).toBeNull();
    expect(ui.getByRole("button", { name: "Ancho" }).getAttribute("aria-haspopup")).toBe("menu");
  });

  it("draws the application's own menu in bold, and a chevron only where something opens", () => {
    const ui = render(<Fixture />);
    const [maker, archivo, ver, ayuda] = titles(ui);
    expect(maker!.closest(".sk-app-bar__menu")!.hasAttribute("data-strong")).toBe(true);
    for (const title of [maker, archivo, ver]) expect(title!.querySelector(".sk-app-bar__indicator")).not.toBeNull();
    expect(ayuda!.querySelector(".sk-app-bar__indicator")).toBeNull();
    expect(ui.getByRole("button", { name: "Ancho" }).querySelector(".sk-app-bar__indicator")).not.toBeNull();
    expect(ui.getByText("Guardado").querySelector(".sk-app-bar__indicator")).toBeNull();
  });

  it("nests submenus to a third level inside a dropdown, as Menu does", async () => {
    const ui = render(
      <AppBar label="Maker">
        <AppBarMenu
          items={[{ value: "export", label: "Exportar", children: [{ value: "react", label: "React", children: [{ value: "tsx", label: "TSX" }] }] }]}
        >
          Archivo
        </AppBarMenu>
      </AppBar>,
    );
    fireEvent.click(ui.getByRole("menuitem", { name: "Archivo" }));
    await tick();
    const exportar = ui.getByRole("menuitem", { name: "Exportar" });
    expect(exportar.getAttribute("aria-haspopup")).toBe("menu");
    /* Every level stays inside the bar's own positioner, so the bar's dense rows reach all of them. */
    expect(exportar.closest(".sk-app-bar__dropdown")).not.toBeNull();
    expect(document.querySelector(".sk-app-bar__dropdown")!.textContent).toContain("TSX");
  });

  it("moves between menus with Left/Right, wrapping, without opening anything", async () => {
    const ui = render(<Fixture />);
    const [maker, , , ayuda] = titles(ui);
    maker!.focus();
    fireEvent.keyDown(maker!, { key: "ArrowLeft" });
    await tick();
    expect(document.activeElement).toBe(ayuda);
    expect(ayuda!.tabIndex).toBe(0);
    expect(maker!.getAttribute("aria-expanded")).toBe("false");
  });

  it("carries an open dropdown to the neighbour with Right", async () => {
    const ui = render(<Fixture />);
    const [, archivo, ver] = titles(ui);
    fireEvent.click(archivo!);
    await tick();
    fireEvent.keyDown(ui.getByRole("menuitem", { name: "Nuevo" }), { key: "ArrowRight" });
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    expect(ver!.getAttribute("aria-expanded")).toBe("true");
  });

  it("switches menus by pointing once one is open, and never opens on pointing alone", async () => {
    const ui = render(<Fixture />);
    const [maker, archivo] = titles(ui);
    fireEvent.pointerEnter(archivo!);
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(maker!);
    await tick();
    fireEvent.pointerEnter(archivo!);
    await tick();
    expect(maker!.getAttribute("aria-expanded")).toBe("false");
    expect(archivo!.getAttribute("aria-expanded")).toBe("true");
    /* Across to the status side too: the bar is one surface to point along. */
    const ancho = ui.getByRole("button", { name: "Ancho" });
    fireEvent.pointerEnter(ancho);
    await tick();
    expect(archivo!.getAttribute("aria-expanded")).toBe("false");
    expect(ancho.getAttribute("aria-expanded")).toBe("true");
  });

  it("fires onSelect for a dropdown command and onActivate for a plain one", async () => {
    const onSelect = vi.fn();
    const onHelp = vi.fn();
    const ui = render(<Fixture onSelect={onSelect} onHelp={onHelp} />);
    const [, archivo, , ayuda] = titles(ui);
    fireEvent.click(archivo!);
    await tick();
    fireEvent.click(ui.getByRole("menuitem", { name: "Nuevo" }));
    await tick();
    expect(onSelect).toHaveBeenCalledWith("new");
    fireEvent.click(ayuda!);
    expect(onHelp).toHaveBeenCalledOnce();
  });

  it("stamps the mounts the vanilla enhancers key on", () => {
    const ui = render(<Fixture />);
    expect(ui.container.querySelector(".sk-app-bar")!.hasAttribute("data-sk-app-bar")).toBe(true);
    expect(ui.container.querySelectorAll(".sk-app-bar__menu[data-sk-menu]")).toHaveLength(4);
    expect(ui.container.querySelectorAll("[data-sk-app-bar-menu]")).toHaveLength(4);
    expect(ui.container.querySelectorAll("[data-sk-app-bar-trigger]")).toHaveLength(5);
  });
});
