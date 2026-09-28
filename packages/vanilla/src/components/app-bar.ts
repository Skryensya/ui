import { appBarAttrs, resolveAppBarKey, shouldSwitchOnPointer } from "@skryensya/core/app-bar";
import { menuAttrs } from "@skryensya/core/menu";
import { getMenuApi } from "./menu-registry.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * APP BAR, the vanilla binding (see `app-bar.ts` in core for what it is). Each dropdown is a real
 * `[data-sk-menu]` root, mounted by the same Menu enhancer as any standalone Menu; this binding owns
 * only the bar: one tab stop across the menus, Left/Right between them carrying an open dropdown
 * along, and pointing at another trigger while one menu is open switches to it.
 *
 * Keys are read in the CAPTURE phase on the menubar, for the same reason Menubar does: Menu's own
 * content handler also claims Left/Right (for nested submenus) in the bubble phase, and the bar must
 * get first refusal, stepping aside inside a nested submenu.
 */

const selector = {
  root: `[${appBarAttrs.root}]`,
  menus: '[role="menubar"]',
  trigger: `[${appBarAttrs.trigger}]`,
  menuTrigger: `[${appBarAttrs.menuTrigger}]`,
  wrapper: `[${menuAttrs.root}]`,
  content: `[${menuAttrs.content}]`,
  submenu: "[data-sk-submenu]",
} as const;

type Entry = { trigger: HTMLElement; wrapper: HTMLElement };

function connect(root: HTMLElement): () => void {
  const own = (trigger: HTMLElement) => trigger.closest(selector.root) === root;
  const entryOf = (trigger: HTMLElement): Entry => ({ trigger, wrapper: trigger.closest<HTMLElement>(selector.wrapper) ?? trigger });
  const all = Array.from(root.querySelectorAll<HTMLElement>(selector.trigger)).filter(own).map(entryOf);
  const menus = all.filter((entry) => entry.trigger.matches(selector.menuTrigger));
  const menubar = root.querySelector<HTMLElement>(selector.menus);
  if (!all.length || !menubar) return () => {};

  /** A trigger opens something only if its wrapper holds a popup of its own, not a nested one's. */
  const hasMenu = (entry: Entry) =>
    Array.from(entry.wrapper.querySelectorAll(selector.content)).some((node) => node.closest(selector.wrapper) === entry.wrapper);
  const apiOf = (entry: Entry) => (hasMenu(entry) ? getMenuApi(entry.wrapper) : undefined);
  const openIndex = (entries: Entry[]) => entries.findIndex((entry) => apiOf(entry)?.open);
  const closeOthers = (except?: Entry) => {
    for (const entry of all) if (entry !== except && apiOf(entry)?.open) apiOf(entry)!.setOpen(false);
  };

  const setStop = (index: number) => menus.forEach((entry, at) => (entry.trigger.tabIndex = at === index ? 0 : -1));

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    if ((event.target as HTMLElement).closest(selector.submenu)) return;
    const active = root.ownerDocument.activeElement;
    const focused = menus.findIndex((entry) => entry.trigger === active);
    const open = openIndex(menus);
    const current = focused !== -1 ? focused : open !== -1 ? open : Math.max(0, menus.findIndex((entry) => entry.trigger.tabIndex === 0));
    const action = resolveAppBarKey({ key: event.key, index: current, count: menus.length, open: open !== -1 });
    if (action.kind === "none") return;
    event.preventDefault();
    event.stopPropagation();
    const target = menus[action.index]!;
    setStop(action.index);
    closeOthers(target);
    const api = apiOf(target);
    /* Opening moves focus into the list (Menu's own open does); otherwise the title takes it. */
    if (action.open && api) api.setOpen(true);
    else target.trigger.focus();
  };

  const triggerAt = (node: EventTarget | null) => {
    const trigger = (node as HTMLElement | null)?.closest?.<HTMLElement>(selector.trigger);
    return trigger ? all.findIndex((entry) => entry.trigger === trigger) : -1;
  };

  /* `pointerover` delegated from the root: `pointerenter` does not bubble, and one listener covers
     every trigger, menus and status alike. */
  const onPointerOver = (event: PointerEvent) => {
    const pointed = triggerAt(event.target);
    if (pointed === -1 || !shouldSwitchOnPointer({ openIndex: openIndex(all), pointedIndex: pointed })) return;
    const entry = all[pointed]!;
    closeOthers(entry);
    apiOf(entry)?.setOpen(true);
    const asMenu = menus.indexOf(entry);
    if (asMenu !== -1) setStop(asMenu);
  };

  /* A click on one trigger closes whichever other menu is open before its own Menu decides what to
     do: independent Menu roots do not switch cleanly on their own (the same net Menubar keeps). */
  const onClick = (event: MouseEvent) => {
    const clicked = triggerAt(event.target);
    if (clicked !== -1) closeOthers(all[clicked]);
  };

  const onFocusIn = (event: FocusEvent) => {
    const at = menus.findIndex((entry) => entry.trigger === event.target);
    if (at !== -1) setStop(at);
  };

  setStop(0);
  menubar.addEventListener("keydown", onKeyDown, { capture: true });
  root.addEventListener("pointerover", onPointerOver);
  root.addEventListener("click", onClick, { capture: true });
  menubar.addEventListener("focusin", onFocusIn);
  return () => {
    menubar.removeEventListener("keydown", onKeyDown, { capture: true });
    root.removeEventListener("pointerover", onPointerOver);
    root.removeEventListener("click", onClick, { capture: true });
    menubar.removeEventListener("focusin", onFocusIn);
  };
}

export const mountAppBar = createConnectMount({
  key: "app-bar",
  rootSelector: selector.root,
  connect,
});
