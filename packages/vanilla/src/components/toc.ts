import { tocAttrs } from "@skryensya/core/toc";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${tocAttrs.root}]`;

type Cleanup = () => void;

/*
 * THE SCROLL-SPY IS ALL THAT IS LEFT HERE. This used to also own a `matchMedia` that pinned the
 * `<details>` open and took its `<summary>` out of the tab order past `wide`. Machinery that existed
 * only because the component shipped two shapes and JavaScript had to pick one per breakpoint. The
 * index is always open now (`toc.ts`), so there is no state to sync and nothing to decide: what is
 * left is the one thing that is genuinely behaviour rather than appearance, moving `aria-current`
 * as the reader scrolls, which no stylesheet can express.
 */

/** Marks the section the reader is in. A no-op below two links: nothing to "spy" on one destination. */
function connectSpy(root: HTMLElement): Cleanup {
  const links = [...root.querySelectorAll<HTMLAnchorElement>("a[href^='#']")];
  if (links.length < 2) return () => {};

  const byId = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
  const headings = [...byId.keys()]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (headings.length < 2) return () => {};

  /* The band is the top slice of the viewport under a sticky header: a heading is "current" from
   * when it reaches that band until the next one does. Marking every heading merely on screen would
   * light up half the list on a short page, so the FIRST one in document order inside the band wins. */
  const bandTop = 72;
  const onScreen = new Set<string>();
  let marked: HTMLAnchorElement | undefined = links.find((link) => link.getAttribute("aria-current") === "location");

  /* Moves the mark with two writes at most (the one leaving, the one arriving), never one per link. */
  const mark = (id: string): void => {
    const next = byId.get(id);
    if (!next || next === marked) return;
    marked?.removeAttribute("aria-current");
    next.setAttribute("aria-current", "location");
    marked = next;
  };

  /* FIRST FRAME: the observer only reports after layout, so on its own the mark arrives a beat late.
   * One read of the headings' tops says where the reader already is, by the observer's own rule: the
   * first heading inside the band, else the last one already above it, else the first of the page. */
  const seed = (): void => {
    const edge = window.innerHeight * 0.3;
    let above: string | undefined;
    let id: string | undefined;
    for (const heading of headings) {
      const top = heading.getBoundingClientRect().top;
      if (top < bandTop) {
        above = heading.id;
        continue;
      }
      id = top <= edge ? heading.id : above;
      break;
    }
    mark(id ?? above ?? headings[0]!.id);
  };
  seed();

  /* A click names its destination: mark it at once and let the scroll that follows pass through the
   * headings in between without lighting each one on the way. Released when the scroll ends. */
  let pinned = false;
  let target: HTMLElement | null = null;
  const release = (): void => {
    pinned = false;
    /* The page cannot always bring the last sections up to the band; one that ended on screen keeps its mark. */
    const landed = target?.getBoundingClientRect();
    target = null;
    if (landed && landed.top < window.innerHeight && landed.bottom > 0) return;
    const current = headings.find((heading) => onScreen.has(heading.id))?.id;
    if (current) mark(current);
    else seed();
  };
  const onClick = (event: Event): void => {
    const link = (event.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
    const id = link && root.contains(link) ? decodeURIComponent(link.hash.slice(1)) : "";
    if (!id || !byId.has(id)) return;
    mark(id);
    pinned = true;
    target = document.getElementById(id);
    window.addEventListener("scrollend", release, { once: true });
    window.setTimeout(release, 2500);
  };
  root.addEventListener("click", onClick);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target.id);
        else onScreen.delete(entry.target.id);
      }
      if (pinned) return;

      const current = headings.find((heading) => onScreen.has(heading.id))?.id;

      /* Nothing in the band means "between sections" or at either end of the page. That is not
       * "nowhere": the heading the reader last passed (or the first, at the very top) answers. */
      if (current) mark(current);
      else seed();
    },
    { rootMargin: `-${bandTop}px 0px -70% 0px` },
  );

  for (const heading of headings) observer.observe(heading);
  return () => {
    observer.disconnect();
    root.removeEventListener("click", onClick);
    window.removeEventListener("scrollend", release);
  };
}

/** Binds one authored Toc: the scroll-spy that marks `aria-current`. */
export function connectToc(root: HTMLElement): Cleanup {
  return connectSpy(root);
}

export const mountToc = createConnectMount({
  key: "toc",
  rootSelector,
  connect: connectToc,
});
