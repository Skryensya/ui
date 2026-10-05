/*
 * THE LAYOUT AUDIT: "is it aligned, does it breathe, do its regions stay apart", as measurements.
 *
 * axe answers whether a page is accessible; it cannot answer whether it is well made, and the two
 * failures a reviewer sees first are exactly the ones it never reports: content that starts at a
 * different left edge from one block to the next, and a rail whose entries are jammed against its
 * border. Those are measurable, so they are rules, and a pattern that breaks one is not finished.
 *
 * Runs INSIDE the page (`page.evaluate(auditLayout)`), so it is one self-contained function: it may
 * not close over anything in this module. It reads rendered boxes only (`getBoundingClientRect`),
 * so it judges what a person sees and is the same for both bindings.
 *
 * Every rule has a tolerance written next to it and a counter-example in `layout-audit.spec.ts`
 * proving the rule can fail; a rule that has never failed is a rule nobody knows works.
 */
export type LayoutFinding = { rule: string; message: string; where: string };

export function auditLayout(): LayoutFinding[] {
  const findings: LayoutFinding[] = [];
  const TOLERANCE = 1; // px: sub-pixel rounding, nothing a person could see
  const MIN_INSET = 12; // px: the smallest air a surface may keep between its edge and what is inside
  const MIN_GAP = 8; // px: the smallest gap between two regions that each draw an edge
  const MIN_GUTTER = 16; // px: the smallest margin between the viewport edge and content
  const MIN_RAIL = 176; // px (11rem, the Sidebar's own minimum): a rail narrower than this cannot breathe

  const label = (element: Element): string => {
    const id = element.id ? `#${element.id}` : "";
    const cls = typeof (element as HTMLElement).className === "string" ? `.${(element as HTMLElement).className.split(/\s+/).filter(Boolean).slice(0, 2).join(".")}` : "";
    return `${element.tagName.toLowerCase()}${id}${cls}`;
  };
  const visible = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const hasEdge = (element: Element): boolean => {
    const style = getComputedStyle(element);
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderLeftWidth) > 0 && style.borderTopStyle !== "none";
    const fill = style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent";
    return border || fill;
  };
  const main = document.querySelector("main");

  /* 1 · A VERTICAL RUN STARTS AT ONE LEFT EDGE. The children of a stack are read top to bottom, so the eye
        runs down their left side: if the heading, the tabs and the table each start somewhere else, the page
        looks assembled, not designed. A stack that centres or right-aligns its children opts out by saying so. */
  const landmark = "header, main, footer, aside, nav, .sk-sidebar, .sk-navbar, .sk-footer, .sk-skip-link";
  /* Flush by design: media runs to the edge of its card, and a message that says it is at the end is right-aligned on purpose. */
  const flush = "img, svg, figure, .sk-image-frame, .sk-table-scroll, .sk-table, [data-align=\"end\"]";
  for (const stack of document.querySelectorAll<HTMLElement>(".sk-stack, .sk-wrapper")) {
    const align = stack.dataset.align;
    if (align === "center" || align === "end") continue;
    const children = [...stack.children].filter(
      (child) =>
        visible(child) &&
        !child.matches(landmark) &&
        !child.matches(flush) &&
        getComputedStyle(child).position !== "absolute" &&
        getComputedStyle(child).position !== "fixed",
    );
    if (children.length < 2) continue;
    /* The BORDER-BOX edge: the line the eye follows down the column. A button's own label inset is its
       padding, not where the button starts. */
    const edges = children.map((child) => ({ child, x: child.getBoundingClientRect().left }));
    const first = edges[0]!.x;
    for (const edge of edges) {
      if (Math.abs(edge.x - first) > TOLERANCE) {
        findings.push({
          rule: "left-edge",
          message: `starts ${Math.round(edge.x - first)}px from its siblings' left edge (${Math.round(edge.x)}px vs ${Math.round(first)}px)`,
          where: `${label(edge.child)} in ${label(stack)}`,
        });
      }
    }
  }

  /* 2 · A SURFACE KEEPS AIR. A box, card or rail that draws an edge needs space between that edge and what it
        holds, on every side it holds something. A box declared flush (`data-padding="none"`) is a decision (an
        image to the edge), so it is exempt. */
  const surfaces = [...document.querySelectorAll<HTMLElement>(".sk-box, .sk-sidebar, aside, .sk-sidebar__content")].filter(
    (element) => visible(element) && hasEdge(element) && element.dataset.padding !== "none",
  );
  for (const surface of surfaces) {
    const outer = surface.getBoundingClientRect();
    const style = getComputedStyle(surface);
    /* Inside the border: a 1px edge is not air. */
    const box = { left: outer.left + parseFloat(style.borderLeftWidth), right: outer.right - parseFloat(style.borderRightWidth), top: outer.top + parseFloat(style.borderTopWidth) };
    const content = [...surface.querySelectorAll<HTMLElement>("*")].filter((child) => {
      if (!visible(child) || getComputedStyle(child).position === "absolute") return false;
      const own = [...child.childNodes].some((node) => node.nodeType === 3 && node.textContent!.trim() !== "");
      return own || child.matches("button, a, input, select, textarea, img, svg");
    });
    if (content.length === 0) continue;
    const left = Math.min(...content.map((child) => child.getBoundingClientRect().left)) - box.left;
    const right = box.right - Math.max(...content.map((child) => child.getBoundingClientRect().right));
    const top = Math.min(...content.map((child) => child.getBoundingClientRect().top)) - box.top;
    const sides: [string, number][] = [["left", left], ["right", right], ["top", top]];
    for (const [side, inset] of sides) {
      /* The right side of a full-width list is its own text length, not air: only judge it when it is the
         closest content (the rail's trailing badge, a button) by requiring a visible edge there. */
      if (side === "right" && right > MIN_INSET) continue;
      if (inset < MIN_INSET - TOLERANCE) {
        const nearest = content.reduce((best, child) => {
          const rect = child.getBoundingClientRect();
          const distance = side === "left" ? rect.left : side === "right" ? -rect.right : rect.top;
          return distance < best.distance ? { child, distance } : best;
        }, { child: content[0]!, distance: Infinity }).child;
        findings.push({ rule: "breathing", message: `only ${Math.round(inset)}px between its ${side} edge and ${label(nearest)} (needs ${MIN_INSET}px)`, where: label(surface) });
      }
    }
  }

  /* 3 · A RAIL IS WIDE ENOUGH TO USE. A navigation rail or sidebar narrower than the kit's own minimum cannot
        hold a label and its inset; it reads as a stripe with text squeezed into it. */
  for (const rail of document.querySelectorAll<HTMLElement>(".sk-sidebar, aside")) {
    if (!visible(rail)) continue;
    const width = rail.getBoundingClientRect().width;
    if (rail.querySelector("nav, .sk-nav-list") && width < MIN_RAIL && width < window.innerWidth / 2) {
      findings.push({ rule: "rail-width", message: `is ${Math.round(width)}px wide (needs at least ${MIN_RAIL}px)`, where: label(rail) });
    }
  }

  /* 4 · REGIONS THAT DRAW AN EDGE DO NOT TOUCH. Two bordered or filled siblings in a row, with no gap, read as
        one lumpy shape with a doubled line between them. */
  for (const row of document.querySelectorAll<HTMLElement>(".sk-inline, .sk-grid, .sk-layout-grid")) {
    /* Regions, not controls: a row of tags or buttons is spaced by its own gap on purpose. */
    const items = [...row.children].filter((child) => {
      if (!visible(child) || !hasEdge(child)) return false;
      const rect = child.getBoundingClientRect();
      return rect.width >= 120 && rect.height >= 60;
    });
    const rects = items.map((item) => item.getBoundingClientRect()).sort((a, b) => a.left - b.left);
    for (let index = 1; index < rects.length; index++) {
      const previous = rects[index - 1]!;
      const gap = rects[index]!.left - previous.right;
      const overlapsVertically = Math.min(previous.bottom, rects[index]!.bottom) - Math.max(previous.top, rects[index]!.top) > 0;
      if (overlapsVertically && gap < MIN_GAP && gap > -1) {
        findings.push({ rule: "regions-apart", message: `two bordered regions sit ${Math.max(0, Math.round(gap))}px apart (needs ${MIN_GAP}px)`, where: label(row) });
      }
    }
  }

  /* 5 · CONTENT NEVER TOUCHES THE EDGES OF THE VIEWPORT, or the bar above it. */
  if (main) {
    const lefts: number[] = [];
    let top = Infinity;
    for (const element of main.querySelectorAll<HTMLElement>("h1, h2, h3, p, a, button, input, select, textarea, li, th, td, label, nav")) {
      if (!visible(element)) continue;
      const rect = element.getBoundingClientRect();
      /* Only elements whose own words/controls are at the edge count, not a container that stretches. */
      const own = [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent!.trim() !== "") || element.matches("button, a, input, select, textarea");
      if (!own) continue;
      lefts.push(rect.left);
      top = Math.min(top, rect.top);
    }
    const header = document.querySelector("header");
    const barBottom = header ? header.getBoundingClientRect().bottom : 0;
    if (lefts.length > 0 && Math.min(...lefts) < MIN_GUTTER - TOLERANCE) {
      findings.push({ rule: "viewport-gutter", message: `content starts ${Math.round(Math.min(...lefts))}px from the viewport edge (needs ${MIN_GUTTER}px)`, where: "main" });
    }
    if (Number.isFinite(top) && top - barBottom < MIN_GUTTER - TOLERANCE) {
      findings.push({ rule: "below-the-bar", message: `content starts ${Math.round(top - barBottom)}px under the bar (needs ${MIN_GUTTER}px)`, where: "main" });
    }
  }

  /* 6 · AN APPLICATION SHELL FILLS ITS ROW AND ITS HEIGHT. When a rail and the work area sit side by side, the work
        area takes the width the rail leaves, and the rail runs down to where the page ends. A rail that stops
        halfway, or a work area that is only as wide as its text, is the "valid but wrong" shell: `AppShell` exists
        to make it impossible, and this is what notices when something else was used instead. */
  const rail = document.querySelector<HTMLElement>(".sk-sidebar");
  if (rail && main && visible(rail) && visible(main)) {
    const r = rail.getBoundingClientRect();
    const m = main.getBoundingClientRect();
    const sideBySide = m.left >= r.right - TOLERANCE && Math.min(r.bottom, m.bottom) - Math.max(r.top, m.top) > 0;
    if (sideBySide) {
      const pageBottom = Math.min(document.documentElement.scrollHeight, window.innerHeight);
      if (m.right < window.innerWidth - MIN_GUTTER * 2) {
        findings.push({ rule: "shell-fills-row", message: `the work area ends ${Math.round(window.innerWidth - m.right)}px short of the viewport edge: it does not take the width the rail leaves`, where: label(main) });
      }
      if (r.bottom < pageBottom - TOLERANCE * 2) {
        findings.push({ rule: "shell-fills-height", message: `the rail ends ${Math.round(pageBottom - r.bottom)}px above the bottom of the page`, where: label(rail) });
      }
    }
  }

  return findings;
}
