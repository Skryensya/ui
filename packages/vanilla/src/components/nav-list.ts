import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

const selector = {
  trigger: "[data-sk-nav-list-group-trigger]",
  list: "[data-sk-nav-list-group-list]",
} as const;

/*
 * NAV LIST. Only the collapsible-group case needs a runtime at all (the plain, always-visible
 * group is pure static markup, same as the rest of `NavList`). WAI-ARIA APG "Disclosure
 * (Navigation)": a button toggles `aria-expanded` and the `hidden` state of the list it names via
 * `aria-controls`: Enter/Space activation is already free from `<button>` native semantics, so
 * this enhancer's own job is the click toggle, generating the id `aria-controls` needs (ids are
 * never baked into static markup by this system, the same reasoning `Checkbox`'s own
 * `aria-controls` fix already established for a sibling relationship), and Escape. The ONE
 * keyboard requirement the pattern does not mark optional (unlike arrow keys/Home/End, which its
 * own page explicitly labels "(Optional)", confirmed fetching the example, not assumed): "If a
 * dropdown is open and focus is inside the navigation region, pressing Esc will close the
 * dropdown" and return focus to the trigger.
 */
/*
 * TWO THINGS A LONG LIST OF CATEGORIES NEEDS, both opt-in so a short list pays for neither.
 *
 * REMEMBERING. A `data-storage-key` on the `nav` (the same attribute `Sidebar` reads for its width) and a
 * `data-group-id` on each group make the open/closed choice outlive a navigation, in `sessionStorage`: the
 * reader's choice for the visit, not a preference forever. Two lists sharing a key (a rail and the
 * drawer that repeats it) stay in step through `sk:navlistgroupchange`. The group that holds the current
 * page (`aria-current="page"` inside it) is ALWAYS open on arrival, whatever was stored: the reader has to
 * be able to see where they are.
 *
 * REVEALING. Opening a category near the bottom of a scrolling rail pushes its entries below the fold.
 * After a click that OPENS a group, the nearest scrolling ancestor scrolls, smoothly, just enough to bring
 * the group into view clear of the edge fade (`--sk-fade-edge-size`, read from the scroller, not restated):
 * all of it if it fits, otherwise its button at the top. Any wheel, touch, key or press on the scroller
 * cancels it where it is; reduced motion jumps instead. Closing never scrolls.
 */
const changeEvent = "sk:navlistgroupchange";

function readStore(key: string): Record<string, boolean> {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(`sk-nav-list:${key}`) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeStore(key: string, id: string, open: boolean): void {
  try {
    sessionStorage.setItem(`sk-nav-list:${key}`, JSON.stringify({ ...readStore(key), [id]: open }));
  } catch {
    /* Blocked storage: nothing is kept and nothing breaks. */
  }
}

function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

function reveal(trigger: HTMLElement, group: HTMLElement): void {
  const scroller = scrollParent(group);
  if (!scroller) return;
  const fade = parseFloat(getComputedStyle(scroller).getPropertyValue("--sk-fade-edge-size")) || 0;
  const gap = Math.min(
    (fade || 3) * parseFloat(getComputedStyle(document.documentElement).fontSize),
    scroller.clientHeight / 3,
  );
  const box = scroller.getBoundingClientRect();
  const head = trigger.getBoundingClientRect();
  const all = group.getBoundingClientRect();
  let delta = 0;
  if (head.top < box.top + gap) delta = head.top - box.top - gap;
  else if (all.bottom > box.bottom - gap) delta = Math.min(all.bottom - box.bottom + gap, head.top - box.top - gap);
  if (Math.abs(delta) < 1) return;

  const stop = () => {
    scroller.scrollTo({ top: scroller.scrollTop, behavior: "auto" });
    for (const type of events) scroller.removeEventListener(type, stop);
  };
  const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  for (const type of events) scroller.addEventListener(type, stop, { passive: true, once: true });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: reduced ? "auto" : "smooth" });
}

function connect(trigger: HTMLElement): () => void {
  const group = trigger.parentElement;
  const list = group?.querySelector<HTMLElement>(selector.list);
  if (!group || !list) return () => {};

  const storageKey = trigger.closest<HTMLElement>("[data-storage-key]")?.dataset.storageKey;
  const groupId = group.dataset.groupId;
  const remembered = storageKey && groupId ? { key: storageKey, id: groupId } : null;

  const id = list.id || uniqueId("sk-nav-list-group");
  list.id = id;
  trigger.setAttribute("aria-controls", id);

  const isOpen = () => trigger.getAttribute("aria-expanded") === "true";

  const sync = () => {
    list.hidden = !isOpen();
  };

  const setOpen = (open: boolean, announce = true) => {
    trigger.setAttribute("aria-expanded", String(open));
    sync();
    if (!remembered || !announce) return;
    writeStore(remembered.key, remembered.id, open);
    document.dispatchEvent(new CustomEvent(changeEvent, { detail: { ...remembered, open, source: trigger } }));
  };

  const onClick = () => {
    const open = !isOpen();
    setOpen(open);
    /* After the list has its real height. */
    if (open) requestAnimationFrame(() => reveal(trigger, group));
  };

  const onSibling = (event: Event) => {
    const detail = (event as CustomEvent<{ key: string; id: string; open: boolean; source: HTMLElement }>).detail;
    if (!remembered || detail.source === trigger || detail.key !== remembered.key || detail.id !== remembered.id) return;
    if (!list.querySelector('[aria-current="page"]') || detail.open) setOpen(detail.open, false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !isOpen()) return;
    event.preventDefault();
    setOpen(false);
    trigger.focus();
  };

  if (remembered) {
    const stored = readStore(remembered.key)[remembered.id];
    if (list.querySelector('[aria-current="page"]')) trigger.setAttribute("aria-expanded", "true");
    else if (typeof stored === "boolean") trigger.setAttribute("aria-expanded", String(stored));
  }
  sync();
  trigger.addEventListener("click", onClick);
  group.addEventListener("keydown", onKeyDown);
  document.addEventListener(changeEvent, onSibling);
  return () => {
    trigger.removeEventListener("click", onClick);
    group.removeEventListener("keydown", onKeyDown);
    document.removeEventListener(changeEvent, onSibling);
  };
}

export const mountNavListGroup = createConnectMount({
  key: "nav-list-group",
  rootSelector: selector.trigger,
  connect,
});
