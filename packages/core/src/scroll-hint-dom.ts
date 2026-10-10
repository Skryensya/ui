import { scrollHintAttrs, type ScrollHintAxis } from "./scroll-hint.js";

function findScroller(root: HTMLElement, axis: ScrollHintAxis): HTMLElement | null {
  const selector = root.getAttribute(scrollHintAttrs.scroller);
  if (selector) {
    try { return root.ownerDocument.querySelector<HTMLElement>(selector); }
    catch { return null; }
  }
  for (let parent = root.parentElement; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(axis === "horizontal" ? style.overflowX : style.overflowY)) return parent;
  }
  return root.ownerDocument.scrollingElement as HTMLElement | null;
}

/** Shared by React and Vanilla. Dismiss only on movement in the advertised axis, not wheel intent. */
export function watchScrollHint(root: HTMLElement): () => void {
  const axis = (root.getAttribute(scrollHintAttrs.axis) ?? "vertical") as ScrollHintAxis;
  const scroller = findScroller(root, axis);
  root.hidden = true;
  root.removeAttribute(scrollHintAttrs.dismissed);
  if (!scroller) return () => {};
  const position = () => axis === "horizontal" ? scroller.scrollLeft : scroller.scrollTop;
  const initial = position();
  let dismissed = Math.abs(initial) > 1;
  const sync = () => {
    if (Math.abs(position() - initial) > 1) dismissed = true;
    const overflow = axis === "horizontal"
      ? scroller.scrollWidth - scroller.clientWidth
      : scroller.scrollHeight - scroller.clientHeight;
    root.toggleAttribute(scrollHintAttrs.dismissed, dismissed);
    root.hidden = dismissed || overflow <= 1;
  };
  // A document scroller dispatches its scroll event on Document, not on the scrolling element.
  const host: HTMLElement | Document = scroller === root.ownerDocument.scrollingElement ? root.ownerDocument : scroller;
  host.addEventListener("scroll", sync, { passive: true });
  const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(sync);
  const observe = () => {
    resize?.disconnect();
    resize?.observe(scroller);
    for (const child of Array.from(scroller.children)) resize?.observe(child);
  };
  observe();
  const mutation = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(() => { observe(); sync(); });
  mutation?.observe(scroller, { childList: true, subtree: true, characterData: true });
  sync();
  return () => {
    host.removeEventListener("scroll", sync);
    resize?.disconnect();
    mutation?.disconnect();
    root.hidden = true;
    root.removeAttribute(scrollHintAttrs.dismissed);
  };
}
