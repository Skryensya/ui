import { fadeEdgeAttrs, fadeEdgeAxisSides, fadeEdgeHasMore, fadeEdgeProperties, type FadeEdgeDirection } from "./fade-edge.js";

/*
 * FADE EDGE, the DOM half both bindings run. Kept out of `fade-edge.ts` because that file is a
 * contract the compiler imports, and the compiler has no DOM. Same split as `feed-dom.ts`.
 */

/*
 * The scrollbars' own thickness, which the stylesheet keeps out of the mask. What the border box
 * holds beyond the client box and the borders is the scrollbar: 0 when there is none, and 0 for an
 * overlay scrollbar, which takes no room and is the platform's to fade.
 */
function measureGutters(root: HTMLElement): void {
  /* Hidden (a closed tab, `display: none`): nothing to measure, and the fade waits until there is. */
  if (root.getClientRects().length === 0) {
    root.removeAttribute(fadeEdgeAttrs.measured);
    return;
  }
  const style = getComputedStyle(root);
  const border = (side: "Top" | "Bottom" | "Left" | "Right") => parseFloat(style[`border${side}Width`]) || 0;
  const block = root.offsetHeight - root.clientHeight - border("Top") - border("Bottom");
  const inline = root.offsetWidth - root.clientWidth - border("Left") - border("Right");
  root.style.setProperty(fadeEdgeProperties.gutterBlock, `${Math.max(0, block)}px`);
  root.style.setProperty(fadeEdgeProperties.gutterInline, `${Math.max(0, inline)}px`);
  root.setAttribute(fadeEdgeAttrs.measured, "");
}

function syncAtEdge(root: HTMLElement): void {
  const direction = (root.getAttribute(fadeEdgeAttrs.direction) ?? "to-bottom") as FadeEdgeDirection;
  const metrics = {
    scrollTop: root.scrollTop,
    scrollLeft: root.scrollLeft,
    scrollWidth: root.scrollWidth,
    scrollHeight: root.scrollHeight,
    clientWidth: root.clientWidth,
    clientHeight: root.clientHeight,
    rtl: getComputedStyle(root).direction === "rtl",
  };
  if (direction === "horizontal" || direction === "vertical") {
    const [start, end] = fadeEdgeAxisSides[direction];
    root.toggleAttribute(fadeEdgeAttrs.atStart, !fadeEdgeHasMore(metrics, start));
    root.toggleAttribute(fadeEdgeAttrs.atEnd, !fadeEdgeHasMore(metrics, end));
    root.removeAttribute(fadeEdgeAttrs.atEdge);
  } else {
    root.toggleAttribute(fadeEdgeAttrs.atEdge, !fadeEdgeHasMore(metrics, direction));
    root.removeAttribute(fadeEdgeAttrs.atStart);
    root.removeAttribute(fadeEdgeAttrs.atEnd);
  }
}

function clearAtEdge(root: HTMLElement): void {
  root.removeAttribute(fadeEdgeAttrs.atEdge);
  root.removeAttribute(fadeEdgeAttrs.atStart);
  root.removeAttribute(fadeEdgeAttrs.atEnd);
}

function sync(root: HTMLElement): void {
  measureGutters(root);
  if (root.hasAttribute(fadeEdgeAttrs.scrollAware)) syncAtEdge(root);
  else clearAtEdge(root);
}

/**
 * Keep the fade true to `root`'s scroll: the gutter hooks to its scrollbars' thickness, always, and
 * `data-at-edge` to its scroll position when it opts into `data-scroll-aware`. Returns the cleanup,
 * which removes both so an unwatched fade paints as plain CSS again.
 *
 * Three things move the answer: scrolling, the box resizing, and the content growing or shrinking.
 * The last one is why the children are observed too: a feed that loads more rows does not resize
 * a scroller of fixed height, it only makes the scroll longer.
 */
export function watchFadeEdge(root: HTMLElement): () => void {
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      sync(root);
    });
  };

  sync(root);
  root.addEventListener("scroll", schedule, { passive: true });

  /*
   * Resizes are answered in the observer's own callback, not a frame later: it runs after layout and
   * before paint, so a FadeEdge that has just appeared (a tab opening) paints its first frame with
   * its scrollbar already measured.
   */
  const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => sync(root));
  const observeChildren = () => {
    if (!resize) return;
    resize.disconnect();
    resize.observe(root);
    for (const child of Array.from(root.children)) resize.observe(child);
  };
  observeChildren();

  /* A direction or scrollAware flipped at runtime changes the answer; new children need observing. */
  const mutations =
    typeof MutationObserver === "undefined"
      ? undefined
      : new MutationObserver(() => {
          observeChildren();
          schedule();
        });
  mutations?.observe(root, { childList: true, attributes: true, attributeFilter: [fadeEdgeAttrs.direction, fadeEdgeAttrs.scrollAware] });

  return () => {
    if (frame) cancelAnimationFrame(frame);
    root.removeEventListener("scroll", schedule);
    resize?.disconnect();
    mutations?.disconnect();
    clearAtEdge(root);
    root.removeAttribute(fadeEdgeAttrs.measured);
    root.style.removeProperty(fadeEdgeProperties.gutterBlock);
    root.style.removeProperty(fadeEdgeProperties.gutterInline);
  };
}
