import { tocParts } from "@skryensya/core/toc";
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/*
 * TOC: the React half of the same contract the Vanilla enhancer connects to.
 *
 * Copies `connectToc` rather than improving on it (the rule `NOT-PUBLISHED.md` already states for
 * `dialog`/`command-palette`): one shape shipped. A compact, always-open index, and a scroll-spy
 * that moves `aria-current` on its own. The `<details>`/`<summary>` pair and the `matchMedia` that
 * pinned it open past `wide` are both gone; see `core/toc.ts`'s own header for why the disclosure
 * stopped being a second shape of this contract.
 */
export type TocItem = {
  href: string;
  level?: "h2" | "h3";
  /** Seeds the initial `aria-current`, before the spy has anything to report. */
  current?: boolean;
  /** Destination label. Matches the contract item slot (`accepts: "text"`). */
  children: string;
  /** Decorative: the label already names the destination. */
  icon?: ReactNode;
};

export type TocProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** The caption above the list, and the accessible name of the nav beside it. */
  title: string;
  items: readonly TocItem[];
};

export function Toc({ className, items, title, ...props }: TocProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState<string | undefined>(
    () => items.find((item) => item.current)?.href,
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const links = [...root.querySelectorAll<HTMLAnchorElement>("a[href^='#']")];
    if (links.length < 2) return;

    const hrefById = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link.hash]));
    const headings = [...hrefById.keys()]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length < 2) return;

    const bandTop = 72;
    const onScreen = new Set<string>();
    const first = () => headings.find((heading) => onScreen.has(heading.id))?.id;

    /* First frame: the observer reports after layout, so read where the reader already is once, now:
       the first heading inside the band, else the last one above it, else the first of the page. */
    const seed = () => {
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
      setCurrent(hrefById.get(id ?? above ?? headings[0]!.id));
    };
    seed();

    /* A click names its destination: mark it at once and ignore the headings the scroll passes through. */
    let pinned = false;
    let target: HTMLElement | null = null;
    const release = () => {
      pinned = false;
      /* The page cannot always bring the last sections up to the band; one that ended on screen keeps its mark. */
      const landed = target?.getBoundingClientRect();
      target = null;
      if (landed && landed.top < window.innerHeight && landed.bottom > 0) return;
      const id = first();
      if (id) setCurrent(hrefById.get(id));
      else seed();
    };
    const onClick = (event: Event) => {
      const link = (event.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      const id = link ? decodeURIComponent(link.hash.slice(1)) : "";
      if (!id || !hrefById.has(id)) return;
      setCurrent(hrefById.get(id));
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
        const currentId = first();
        // Nothing in the band means "between sections", not "nowhere": the heading last passed answers.
        if (currentId) setCurrent(hrefById.get(currentId));
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
  }, [items]);

  return (
    <aside
      {...props}
      className={className ? `${tocParts.root} ${className}` : tocParts.root}
      data-sk-toc=""
      ref={rootRef}
    >
      <nav aria-label={title} className={tocParts.nav}>
        <h2 className={tocParts.title}>{title}</h2>
        <ul className={tocParts.list} role="list">
          {items.map((item) => (
            <li className={tocParts.item} data-level={item.level ?? "h2"} key={item.href}>
              <a
                aria-current={current === item.href ? "location" : undefined}
                className={`${tocParts.link} sk-interactive`}
                href={item.href}
              >
                {item.icon ? <span className={tocParts.icon}>{item.icon}</span> : null}
                <span className={tocParts.label}>{item.children}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
