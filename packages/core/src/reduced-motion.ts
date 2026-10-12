/**
 * Is motion reduced for this page right now? One answer for every script, so a component never reads
 * the media query on its own and the app's choice cannot be missed by the ones that forget.
 *
 * It is reduced when the SYSTEM asks for it (`prefers-reduced-motion`) OR the app set
 * `data-motion="reduced"` on <html>. The attribute only adds: there is no value that restores motion
 * the system removed. The CSS side mirrors this (`scripts/mirror-motion.ts`).
 */
export function prefersReducedMotion(win: Window | null | undefined = typeof window === "undefined" ? undefined : window): boolean {
  if (!win) return false;
  if (win.document?.documentElement?.getAttribute("data-motion") === "reduced") return true;
  return win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}
