import { galleryParts } from "./gallery.js";
import { lightboxAttrs } from "./lightbox.js";
import { lightboxEvents, lightboxTriggers } from "./lightbox-controller.js";

/*
 * A GALLERY WHOSE LARGE PHOTOS OPEN A LIGHTBOX. Each view holds a `Lightbox.Trigger` naming one Lightbox, so the viewer's
 * gallery is the gallery's photos in order, and it opens on the one chosen. The two then stay one choice:
 *
 *   - while the Lightbox is open, every step it takes checks the matching thumbnail, so the gallery behind it follows;
 *   - when it closes, focus lands on the large photo now showing. The Lightbox hands focus back to the trigger that opened
 *     it, but after stepping that trigger's view is hidden, so focus would fall to the page; this puts it where the reader is.
 *
 * The thumbnails only ever choose (they never open the viewer), and the large photo's lens and the viewer do not compete:
 * hovering looks through the lens, a click opens the viewer, and a long press that grew the lens is not a click
 * (magnifier-view.ts). Both bindings call this; without a Lightbox trigger in a view it attaches nothing.
 */
export function linkGalleryLightbox(root: HTMLElement): () => void {
  const doc = root.ownerDocument;
  const views = Array.from(root.querySelectorAll<HTMLElement>(`:scope > .${galleryParts.views} > .${galleryParts.view}`));
  const inputs = Array.from(root.querySelectorAll<HTMLInputElement>(`.${galleryParts.thumbInput}`));
  const triggerOf = (view: HTMLElement | undefined) => view?.querySelector<HTMLElement>(`[${lightboxAttrs.opens}]`) ?? null;
  const id = views.map(triggerOf).find(Boolean)?.getAttribute(lightboxAttrs.opens);
  if (!id) return () => {};
  /* Heard on the document in the capture phase: the dialog may mount after the gallery, and its events do not bubble. */
  const fromOurs = (event: Event): boolean => (event.target as Element | null)?.id === id;

  /* The view a Lightbox index lands on: its trigger, among every trigger naming that Lightbox, in page order. */
  const viewAt = (index: number): number => {
    const trigger = lightboxTriggers(doc, id)[index];
    return trigger ? views.findIndex((view) => view.contains(trigger)) : -1;
  };

  const choose = (at: number): void => {
    const input = inputs[at];
    if (!input || input.checked) return;
    input.checked = true;
    /* A programmatic check fires nothing: say it, so a page listening for the choice hears the viewer's too. */
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const onIndexChange = (event: Event): void => {
    if (!fromOurs(event)) return;
    const index = (event as CustomEvent<{ index: number }>).detail?.index;
    if (typeof index === "number") choose(viewAt(index));
  };

  /* Only when focus went nowhere useful: the page, the closed dialog itself, or a trigger whose view is now hidden. */
  const refocus = (dialog: HTMLElement): void => {
    const active = doc.activeElement;
    const lost =
      !active ||
      active === doc.body ||
      dialog.contains(active) ||
      (root.contains(active) && active.closest(`.${galleryParts.view}`)?.checkVisibility?.() === false);
    if (!lost) return;
    const shown = views.find((view) => view.checkVisibility?.() ?? view.offsetParent !== null);
    triggerOf(shown)?.focus({ preventScroll: true });
  };

  const onOpenChange = (event: Event): void => {
    if (!fromOurs(event)) return;
    if ((event as CustomEvent<{ open: boolean }>).detail?.open !== false) return;
    /*
     * After the dialog has really closed, at the end of its exit animation: until then focus is still inside it, and the
     * Lightbox's own hand-back went to the trigger that opened it, which may be hidden by now.
     */
    const dialog = event.target as HTMLDialogElement;
    /* The frame after: at `close` the dialog's own button still holds focus, and the platform lets go of it right after. */
    const later = () => (doc.defaultView?.requestAnimationFrame ?? setTimeout)(() => refocus(dialog));
    if (dialog.open) dialog.addEventListener("close", later, { once: true });
    else later();
  };

  doc.addEventListener(lightboxEvents.indexChange, onIndexChange, true);
  doc.addEventListener(lightboxEvents.openChange, onOpenChange, true);
  return () => {
    doc.removeEventListener(lightboxEvents.indexChange, onIndexChange, true);
    doc.removeEventListener(lightboxEvents.openChange, onOpenChange, true);
  };
}
