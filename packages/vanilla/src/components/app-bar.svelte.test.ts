import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { getMenuApi } from "./menu-registry.js";
import { mountMenu } from "./menu.js";
import { mountAppBar } from "./app-bar.js";

/*
 * The markup the contract emits for a small desktop-style bar: the application's menu, "Archivo" and
 * "Ver" with dropdowns, "Ayuda" as a plain command; on the trailing side one word of status and one
 * status menu. Each dropdown is a real `[data-sk-menu]` root, mounted by `mountMenu` like any other.
 * `.svelte.test.ts` because the dropdowns need the real Svelte runtime behind Menu.
 */
const menu = (label: string, items: string[], extra = "") => `
  <div class="sk-app-bar__menu sk-menu" data-density="compact" data-sk-menu ${extra}>
    <button type="button" role="menuitem" class="sk-app-bar__trigger" data-sk-menu-trigger data-sk-app-bar-trigger data-sk-app-bar-menu>${label}</button>
    ${
      items.length
        ? `<div data-sk-menu-positioner><div data-sk-menu-content role="menu">${items
            .map((item) => `<div data-sk-menu-item data-value="${item}"><span>${item}</span></div>`)
            .join("")}</div></div>`
        : ""
    }
  </div>`;

function markup() {
  document.body.innerHTML = `<div class="sk-app-bar" data-sk-app-bar>
    <div class="sk-app-bar__menus" role="menubar" aria-label="Maker">
      ${menu("Maker", ["about"], "data-strong")}
      ${menu("Archivo", ["new", "open"])}
      ${menu("Ver", ["zoom"])}
      ${menu("Ayuda", [])}
    </div>
    <div class="sk-app-bar__status">
      <div class="sk-app-bar__status-item sk-menu" data-density="compact" data-sk-menu><span class="sk-app-bar__status-text">Guardado</span></div>
      <div class="sk-app-bar__status-item sk-menu" data-density="compact" data-sk-menu>
        <button type="button" class="sk-app-bar__trigger" data-sk-menu-trigger data-sk-app-bar-trigger>Ancho</button>
        <div data-sk-menu-positioner><div data-sk-menu-content role="menu"><div data-sk-menu-item data-value="72"><span>72rem</span></div></div></div>
      </div>
    </div>
  </div>`;
  mountMenu(document);
  expect(mountAppBar(document)).toBe(1);
  flushSync();
  return document.querySelector<HTMLElement>('[role="menubar"]')!;
}

const titles = () => Array.from(document.querySelectorAll<HTMLButtonElement>("[data-sk-app-bar-menu]"));
const status = () => document.querySelector<HTMLButtonElement>(".sk-app-bar__status [data-sk-app-bar-trigger]")!;
const isOpen = (trigger: HTMLElement) => getMenuApi(trigger.closest<HTMLElement>("[data-sk-menu]")!)?.open ?? false;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-app-bar]");
  if (root) destroyMount(root);
  document.querySelectorAll<HTMLElement>("[data-sk-menu]").forEach((el) => destroyMount(el));
  document.body.innerHTML = "";
});

describe("AppBar vanilla enhancer", () => {
  it("gives the menus exactly one tab stop and leaves the status menu its own", () => {
    markup();
    expect(titles().filter((title) => title.tabIndex === 0)).toEqual([titles()[0]]);
    expect(status().tabIndex).toBe(0);
  });

  it("moves between menus with Left/Right, wrapping, without opening anything", () => {
    const menubar = markup();
    titles()[0]!.focus();
    fireEvent.keyDown(menubar, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(titles()[3]);
    expect(titles()[3]!.tabIndex).toBe(0);
    fireEvent.keyDown(menubar, { key: "Home" });
    expect(document.activeElement).toBe(titles()[0]);
    expect(isOpen(titles()[0]!)).toBe(false);
  });

  it("carries an open dropdown to the neighbour with Right", () => {
    const menubar = markup();
    const [, archivo, ver] = titles();
    fireEvent.click(archivo!);
    flushSync();
    expect(isOpen(archivo!)).toBe(true);
    fireEvent.keyDown(menubar, { key: "ArrowRight" });
    flushSync();
    expect(isOpen(archivo!)).toBe(false);
    expect(isOpen(ver!)).toBe(true);
  });

  it("switches by pointing once a menu is open, across to the status side, and never opens on pointing alone", () => {
    markup();
    const [maker, archivo] = titles();
    fireEvent.pointerOver(archivo!);
    flushSync();
    expect(isOpen(archivo!)).toBe(false);
    fireEvent.click(maker!);
    flushSync();
    fireEvent.pointerOver(archivo!);
    flushSync();
    expect(isOpen(maker!)).toBe(false);
    expect(isOpen(archivo!)).toBe(true);
    fireEvent.pointerOver(status());
    flushSync();
    expect(isOpen(archivo!)).toBe(false);
    expect(isOpen(status())).toBe(true);
  });

  it("a click on another trigger closes the open menu first", () => {
    markup();
    const [maker, , ver] = titles();
    fireEvent.click(maker!);
    flushSync();
    fireEvent.click(ver!);
    flushSync();
    expect(isOpen(maker!)).toBe(false);
    expect(isOpen(ver!)).toBe(true);
  });
});
