import { appBarAttrs, appBarParts, resolveAppBarKey, shouldSwitchOnPointer } from "@skryensya/core/app-bar";
import { menuAttrs, menuEvents, menuParts, type MenuApi, type MenuItem } from "@skryensya/core/menu";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { useAnchored } from "./anchored.js";
import { MenuPopup, useMenuMachine, type CheckedState } from "./menu.js";

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

/*
 * APP BAR, the React binding (see `app-bar.ts` in core for what it is and why it is not Menubar).
 * Each dropdown is Menu's own machine and popup (`useMenuMachine`/`MenuPopup`), so everything that
 * happens inside an open list is Menu's. The bar owns three things on top: one tab stop across its
 * menus, Left/Right between them carrying an open dropdown along, and pointing at another trigger
 * while one menu is open switches to it.
 *
 * Every trigger registers under a key: `m<i>` for the menus (the roving set, in order) and `s<i>`
 * for the status menus (pointer switching only; each is its own tab stop). The index is injected by
 * the parent, like Menubar's, so an author never writes one.
 */

type Entry = { api: MenuApi | null; trigger: HTMLElement | null };

type AppBarContextValue = {
  register: (key: string, entry: Entry | null) => void;
  /** The menu holding the tab stop. */
  stop: number;
  /** Close every open dropdown but `except`'s. */
  closeOthers: (except: string) => void;
  /** A pointer arrived on `key`'s trigger: switch to it when another menu is open. */
  pointed: (key: string) => void;
};

const AppBarContext = createContext<AppBarContextValue | null>(null);

function useAppBar(component: string): AppBarContextValue {
  const context = useContext(AppBarContext);
  if (!context) throw new Error(`${component} must be rendered inside AppBar.`);
  return context;
}

export type AppBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** The menus' accessible name, usually the application's: it lands on the `menubar`. */
  label: string;
  /** The menus, in order: `AppBarMenu`s. */
  children: ReactNode;
  /** The trailing state: `AppBarStatus`es. */
  status?: ReactNode;
};

/** Injects `index` into each element of `nodes` that is `type`, leaving anything else alone. */
function indexed(nodes: ReactNode, type: unknown): ReactNode {
  let index = 0;
  return Children.map(nodes, (child) =>
    isValidElement(child) && child.type === type
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { index: index++ })
      : child,
  );
}

export function AppBar({ children, className, label, status, ...props }: AppBarProps) {
  const entries = useRef(new Map<string, Entry>());
  const [stop, setStop] = useState(0);

  const menuKeys = () => [...entries.current.keys()].filter((key) => key.startsWith("m")).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  const openKey = () => [...entries.current].find(([, entry]) => entry.api?.open)?.[0];
  const closeOthers = (except?: string) => {
    for (const [key, entry] of entries.current) if (key !== except && entry.api?.open) entry.api.setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    /* Inside a nested submenu, Left/Right open and close that submenu: Menu's, not the bar's. */
    if ((event.target as HTMLElement).closest("[data-sk-submenu]")) return;
    const keys = menuKeys();
    const open = openKey();
    const focused = keys.findIndex((key) => entries.current.get(key)?.trigger === document.activeElement);
    const index = focused !== -1 ? focused : open?.startsWith("m") ? keys.indexOf(open) : stop;
    const action = resolveAppBarKey({ key: event.key, index, count: keys.length, open: open?.startsWith("m") ?? false });
    if (action.kind === "none") return;
    event.preventDefault();
    event.stopPropagation();
    const target = entries.current.get(keys[action.index]!);
    setStop(action.index);
    closeOthers(keys[action.index]);
    /* Opening moves focus into the list (Menu's own open does); otherwise the title takes it. */
    if (action.open && target?.api) target.api.setOpen(true);
    else target?.trigger?.focus();
  };

  const context: AppBarContextValue = {
    register: (key, entry) => {
      if (entry) entries.current.set(key, entry);
      else entries.current.delete(key);
    },
    stop,
    closeOthers,
    pointed: (key) => {
      const all = [...entries.current.keys()];
      const open = openKey();
      if (!shouldSwitchOnPointer({ openIndex: open ? all.indexOf(open) : -1, pointedIndex: all.indexOf(key) })) return;
      closeOthers(key);
      const entry = entries.current.get(key);
      entry?.api?.setOpen(true);
      if (key.startsWith("m")) setStop(Number(key.slice(1)));
    },
  };

  return (
    <AppBarContext.Provider value={context}>
      <div {...props} {...{ [appBarAttrs.root]: "" }} className={cx(appBarParts.root, className)}>
        <div aria-label={label} className={appBarParts.menus} onKeyDownCapture={onKeyDown} role="menubar">
          {indexed(children, AppBarMenu)}
        </div>
        {status ? <div className={appBarParts.status}>{indexed(status, AppBarStatus)}</div> : null}
      </div>
    </AppBarContext.Provider>
  );
}

type DropdownProps = {
  /** The dropdown: Menu's own item shape, verbatim. Without it the item is a plain command or text. */
  items?: readonly MenuItem[];
  /** A command inside the dropdown was chosen: Menu's own `onSelect`. */
  onSelect?: (details: { value: string }) => void;
  /** A checkbox or radio inside the dropdown toggled: Menu's own `onCheckedChange`. */
  onCheckedChange?: (details: { value: string; checked: boolean }) => void;
  /** Where the dropdown portals: Menu's own `container`. */
  container?: RefObject<HTMLElement>;
};

function initialCheckedState(items: readonly MenuItem[]): CheckedState {
  return Object.fromEntries(
    items.flatMap((item) => [...(item.checked ? [[item.value, true] as const] : []), ...Object.entries(initialCheckedState(item.children ?? []))]),
  );
}

/** The machine, the popup and the registration one trigger of the bar needs, menu or status alike. */
function useDropdown(key: string, items: readonly MenuItem[] | undefined) {
  const context = useAppBar("AppBarMenu and AppBarStatus");
  const hasMenu = Boolean(items?.length);
  const id = useId();
  const eventRootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { service, api } = useMenuMachine({
    id,
    defaultOpen: false,
    onOpenChange(details) {
      eventRootRef.current?.dispatchEvent(new CustomEvent(menuEvents.openChange, { bubbles: true, detail: details }));
    },
  });
  const anchor = useAnchored(id);
  const [checkedState, setChecked] = useState<CheckedState>(() => initialCheckedState(items ?? []));

  useEffect(() => {
    context.register(key, { api: hasMenu ? api : null, trigger: triggerRef.current });
    return () => context.register(key, null);
  });

  /* Whatever opened this one (click, keys, pointing), the rest close: one open menu per bar. */
  useEffect(() => {
    if (hasMenu && api.open) context.closeOthers(key);
  }, [api.open, hasMenu, key]);

  const setCheckedState = (changed: MenuItem, checked: boolean) => {
    setChecked((current) => {
      if (changed.kind !== "radio" || !checked) return { ...current, [changed.value]: checked };
      const next = { ...current };
      for (const candidate of items ?? []) if (candidate.kind === "radio" && candidate.group === changed.group) next[candidate.value] = false;
      next[changed.value] = true;
      return next;
    });
  };

  return { context, hasMenu, api, service, anchor, eventRootRef, triggerRef, checkedState, setCheckedState };
}

function Popup({
  dropdown,
  items,
  container,
  onSelect,
  onCheckedChange,
}: DropdownProps & { dropdown: ReturnType<typeof useDropdown> }) {
  return (
    <MenuPopup
      api={dropdown.api}
      checkedState={dropdown.checkedState}
      container={container}
      density="compact"
      eventRootRef={dropdown.eventRootRef}
      items={items!}
      onCheckedChange={onCheckedChange}
      onSelect={onSelect}
      positionerProps={dropdown.anchor.positioner(dropdown.api.getPositionerProps(), cx(appBarParts.dropdown, menuParts.positioner))}
      service={dropdown.service}
      setCheckedState={dropdown.setCheckedState}
    />
  );
}

export type AppBarMenuProps = DropdownProps & {
  /** The title: the contract's `children` slot (`text`). */
  children: string;
  /** Bold, the way a desktop bar draws the application's own menu. */
  strong?: boolean;
  /** Fires when a title without a dropdown is activated. */
  onActivate?: () => void;
};

export function AppBarMenu(publicProps: AppBarMenuProps) {
  const { children, container, items, onActivate, onCheckedChange, onSelect, strong } = publicProps;
  /* Injected by AppBar: never author-set. */
  const index = (publicProps as AppBarMenuProps & { index?: number }).index ?? 0;
  const key = `m${index}`;
  const dropdown = useDropdown(key, items);
  const { context, hasMenu, api, anchor, eventRootRef, triggerRef } = dropdown;
  const tabIndex = context.stop === index ? 0 : -1;
  const common = {
    [menuAttrs.trigger]: "",
    [appBarAttrs.trigger]: "",
    [appBarAttrs.menuTrigger]: "",
    onPointerEnter: () => context.pointed(key),
    ref: triggerRef,
    role: "menuitem",
    tabIndex,
    type: "button" as const,
  };

  return (
    <div
      ref={eventRootRef}
      className={cx(appBarParts.menu, menuParts.root)}
      data-density="compact"
      {...{ [menuAttrs.root]: "" }}
      {...(strong ? { "data-strong": "" } : {})}
    >
      {hasMenu ? (
        <button {...api.getTriggerProps()} {...anchor.anchor(cx(appBarParts.trigger, "sk-interactive"))} {...common}>
          {children}
        </button>
      ) : (
        <button className={cx(appBarParts.trigger, "sk-interactive", "sk-anchor")} onClick={() => onActivate?.()} {...common}>
          {children}
        </button>
      )}
      {hasMenu ? <Popup dropdown={dropdown} items={items} container={container} onSelect={onSelect} onCheckedChange={onCheckedChange} /> : null}
    </div>
  );
}

export type AppBarStatusProps = DropdownProps & {
  /** The words shown: plain text, or the label of the menu button when `items` is given. */
  children: string;
};

export function AppBarStatus(publicProps: AppBarStatusProps) {
  const { children, container, items, onCheckedChange, onSelect } = publicProps;
  const index = (publicProps as AppBarStatusProps & { index?: number }).index ?? 0;
  const key = `s${index}`;
  const dropdown = useDropdown(key, items);
  const { context, hasMenu, api, anchor, eventRootRef, triggerRef } = dropdown;

  return (
    <div ref={eventRootRef} className={cx(appBarParts.statusItem, menuParts.root)} data-density="compact" {...{ [menuAttrs.root]: "" }}>
      {hasMenu ? (
        <>
          <button
            {...api.getTriggerProps()}
            {...anchor.anchor(cx(appBarParts.trigger, "sk-interactive"))}
            {...{ [menuAttrs.trigger]: "", [appBarAttrs.trigger]: "" }}
            onPointerEnter={() => context.pointed(key)}
            ref={triggerRef}
            type="button"
          >
            {children}
          </button>
          <Popup dropdown={dropdown} items={items} container={container} onSelect={onSelect} onCheckedChange={onCheckedChange} />
        </>
      ) : (
        <span className={appBarParts.statusText}>{children}</span>
      )}
    </div>
  );
}
