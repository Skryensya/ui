import { appBarAttrs, appBarParts, resolveAppBarKey, shouldSwitchOnPointer } from "@skryensya/core/app-bar";
import { menuAttrs, menuEvents, menuParts, type MenuApi, type MenuItem } from "@skryensya/core/menu";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useAnchored } from "./anchored.js";
import { Icon } from "./icon.js";
import { MenuPopup, useMenuMachine, type CheckedState } from "./menu.js";

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

/*
 * APP BAR, the React binding (see `app-bar.ts` in core for what it is and why it is not Menubar).
 * Each dropdown is Menu's own machine and popup (`useMenuMachine`/`MenuPopup`), so everything that
 * happens inside an open list is Menu's. The bar owns three things on top: one tab stop across its
 * menus, Left/Right between them carrying an open dropdown along, and pointing at another trigger
 * while one menu is open switches to it.
 *
 * Every trigger registers itself with the bar (menus and status menus alike), and the bar orders the
 * menus by where their triggers sit in the document, not by position among its own children: a menu
 * rendered through a wrapper component, a fragment or a map is still in the right place in the
 * roving order, and nothing is injected into an author's elements.
 */

type Entry = { api: MenuApi | null; trigger: HTMLElement | null; menu: boolean };

type AppBarContextValue = {
  register: (key: string, entry: Entry | null) => void;
  /** Whether `key`'s trigger holds the menus' one tab stop. */
  isStop: (key: string) => boolean;
  /** Close every open dropdown but `except`'s. */
  closeOthers: (except: string) => void;
  /** A pointer arrived on `key`'s trigger: switch to it when another menu is open. */
  pointed: (key: string) => void;
  /** Focus arrived on `key`'s trigger: it becomes the tab stop. */
  focused: (key: string) => void;
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

const inDocumentOrder = (a: HTMLElement | null, b: HTMLElement | null) =>
  a && b ? (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1) : 0;

export function AppBar({ children, className, label, status, ...props }: AppBarProps) {
  const entries = useRef(new Map<string, Entry>());
  const [stop, setStop] = useState<string>();

  /** The menus' keys, in the order their triggers sit in the document. */
  const menuKeys = () =>
    [...entries.current]
      .filter(([, entry]) => entry.menu)
      .sort(([, a], [, b]) => inDocumentOrder(a.trigger, b.trigger))
      .map(([key]) => key);
  const openKey = () => [...entries.current].find(([, entry]) => entry.api?.open)?.[0];
  const closeOthers = (except?: string) => {
    for (const [key, entry] of entries.current) if (key !== except && entry.api?.open) entry.api.setOpen(false);
  };

  /* Until a menu has been focused, the first one holds the stop. Known only once the menus have
     registered, which their layout effects do before this one runs. */
  useLayoutEffect(() => {
    if (stop === undefined || !entries.current.has(stop)) setStop(menuKeys()[0]);
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    /* Inside a nested submenu, Left/Right open and close that submenu: Menu's, not the bar's. */
    if ((event.target as HTMLElement).closest("[data-sk-submenu]")) return;
    const keys = menuKeys();
    const open = openKey();
    const openMenu = open !== undefined && keys.includes(open) ? open : undefined;
    const focused = keys.find((key) => entries.current.get(key)?.trigger === document.activeElement);
    const current = focused ?? openMenu ?? stop ?? keys[0];
    const action = resolveAppBarKey({ key: event.key, index: Math.max(0, keys.indexOf(current!)), count: keys.length, open: openMenu !== undefined });
    if (action.kind === "none") return;
    event.preventDefault();
    event.stopPropagation();
    const key = keys[action.index]!;
    const target = entries.current.get(key);
    setStop(key);
    closeOthers(key);
    /* Opening moves focus into the list (Menu's own open does); otherwise the title takes it. */
    if (action.open && target?.api) target.api.setOpen(true);
    else target?.trigger?.focus();
  };

  const context: AppBarContextValue = {
    register: (key, entry) => {
      if (entry) entries.current.set(key, entry);
      else entries.current.delete(key);
    },
    isStop: (key) => key === stop,
    closeOthers,
    pointed: (key) => {
      const all = [...entries.current.keys()];
      const open = openKey();
      if (!shouldSwitchOnPointer({ openIndex: open ? all.indexOf(open) : -1, pointedIndex: all.indexOf(key) })) return;
      closeOthers(key);
      const entry = entries.current.get(key);
      entry?.api?.setOpen(true);
      if (entry?.menu) setStop(key);
    },
    focused: (key) => {
      if (entries.current.get(key)?.menu) setStop(key);
    },
  };

  return (
    <AppBarContext.Provider value={context}>
      <div {...props} {...{ [appBarAttrs.root]: "" }} className={cx(appBarParts.root, className)}>
        <div aria-label={label} className={appBarParts.menus} onKeyDownCapture={onKeyDown} role="menubar">
          {children}
        </div>
        {status ? <div className={appBarParts.status}>{status}</div> : null}
      </div>
    </AppBarContext.Provider>
  );
}

/**
 * One action of a dropdown: Menu's item without what would make it a control (`kind`, so no
 * checkbox, radio or separator; `checked`; `group`). The contract's `appBarItemShape`, in types.
 */
export type AppBarItem = Omit<MenuItem, "kind" | "checked" | "group" | "children"> & {
  /** A second or third level of actions. */
  children?: readonly AppBarItem[];
};

type DropdownProps = {
  /** The dropdown's actions. Without it the item is a plain command, or plain text on the status side. */
  items?: readonly AppBarItem[];
  /** A command inside the dropdown was chosen: Menu's own `onSelect`. */
  onSelect?: (details: { value: string }) => void;
  /** Where the dropdown portals: Menu's own `container`. */
  container?: RefObject<HTMLElement>;
};

/** The small chevron on a trigger that opens something; the contract's `indicator` part. */
function Chevron() {
  return (
    <span aria-hidden="true" className={appBarParts.indicator}>
      <Icon name="chevron-down" size="sm" />
    </span>
  );
}

const nestsSubmenu = (items: readonly AppBarItem[]): boolean => items.some((item) => Boolean(item.children?.length));

/** The machine, the popup and the registration one trigger of the bar needs, menu or status alike. */
function useDropdown(menu: boolean, items: readonly AppBarItem[] | undefined) {
  const context = useAppBar("AppBarMenu and AppBarStatus");
  const hasMenu = Boolean(items?.length);
  const id = useId();
  const key = id;
  const eventRootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { service, api } = useMenuMachine({
    id,
    defaultOpen: false,
    onOpenChange(details) {
      eventRootRef.current?.dispatchEvent(new CustomEvent(menuEvents.openChange, { bubbles: true, detail: details }));
    },
  });
  /* Withheld the moment any level nests a submenu, exactly as Menu does: the browser's engine and the
     machine's must not place two levels of one tree, or the submenu lands in the wrong space. */
  const anchor = useAnchored(id, !nestsSubmenu(items ?? []));
  /* Nothing in a bar's dropdown is ever checked (actions only), so Menu's checked state stays empty. */
  const checkedState: CheckedState = {};

  /* A layout effect, so the bar can find its first menu in its own layout effect, before paint. */
  useLayoutEffect(() => {
    context.register(key, { api: hasMenu ? api : null, trigger: triggerRef.current, menu });
    return () => context.register(key, null);
  });

  /* Whatever opened this one (click, keys, pointing), the rest close: one open menu per bar. */
  useEffect(() => {
    if (hasMenu && api.open) context.closeOthers(key);
  }, [api.open, hasMenu, key]);

  const setCheckedState = () => {};

  return { key, context, hasMenu, api, service, anchor, eventRootRef, triggerRef, checkedState, setCheckedState };
}

function Popup({
  dropdown,
  items,
  container,
  onSelect,
}: DropdownProps & { dropdown: ReturnType<typeof useDropdown> }) {
  return (
    <MenuPopup
      api={dropdown.api}
      checkedState={dropdown.checkedState}
      container={container}
      density="compact"
      eventRootRef={dropdown.eventRootRef}
      items={items!}
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
  const { children, container, items, onActivate, onSelect, strong } = publicProps;
  const dropdown = useDropdown(true, items);
  const { key, context, hasMenu, api, anchor, eventRootRef, triggerRef } = dropdown;
  const tabIndex = context.isStop(key) ? 0 : -1;
  const common = {
    [menuAttrs.trigger]: "",
    [appBarAttrs.trigger]: "",
    [appBarAttrs.menuTrigger]: "",
    onFocus: () => context.focused(key),
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
          <Chevron />
        </button>
      ) : (
        <button className={cx(appBarParts.trigger, "sk-interactive", "sk-anchor")} onClick={() => onActivate?.()} {...common}>
          {children}
        </button>
      )}
      {hasMenu ? <Popup dropdown={dropdown} items={items} container={container} onSelect={onSelect} /> : null}
    </div>
  );
}

export type AppBarStatusProps = DropdownProps & {
  /** The words shown: plain text, or the label of the menu button when `items` is given. */
  children: string;
};

export function AppBarStatus(publicProps: AppBarStatusProps) {
  const { children, container, items, onSelect } = publicProps;
  const dropdown = useDropdown(false, items);
  const { key, context, hasMenu, api, anchor, eventRootRef, triggerRef } = dropdown;

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
            <Chevron />
          </button>
          <Popup dropdown={dropdown} items={items} container={container} onSelect={onSelect} />
        </>
      ) : (
        <span className={appBarParts.statusText}>{children}</span>
      )}
    </div>
  );
}
