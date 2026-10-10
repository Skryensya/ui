// A small overshoot makes pickup and release tangible, without a looping dock bounce.
// Retargeting the same MotionValues carries velocity across fast pointer reversals.
export const dockSpringOptions = { type: "spring", duration: 0.5, bounce: 0.3 } as const;

export type DockSpring = {
  set(value: number): void;
  destroy(): void;
};
export type DockSpringFactory = (initial: number, update: (value: number) => void) => DockSpring;

/** Both bindings inject Motion; Core owns the pointer policy and never imports an animation engine. */
export function connectDock(root: HTMLElement, spring: DockSpringFactory): () => void {
  const media = root.ownerDocument.defaultView?.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  if (!media) return () => {};
  let hovered: HTMLButtonElement | undefined;
  let pressed = false;
  const entries = new Map<HTMLButtonElement, { scale: DockSpring; lift: DockSpring }>();

  function entry(button: HTMLButtonElement) {
    let found = entries.get(button);
    if (found) return found;
    let scale = 1;
    let lift = 0;
    const paint = () => {
      const transform = `translateY(${-lift}px) scale(${scale})`;
      // Transform the native control itself: paint, focus ring and browser hit testing
      // share one geometry, including the portion that rises outside the dock's box.
      button.style.transform = transform;
      // Keep a departing face above resting ones until its spring settles. The new
      // hovered face sits above both, so it cannot disappear behind its neighbor.
      button.toggleAttribute("data-dock-raised", scale > 1.005 || Math.abs(lift) > 0.1);
    };
    found = {
      scale: spring(1, value => { scale = value; paint(); }),
      lift: spring(0, value => { lift = value; paint(); }),
    };
    entries.set(button, found);
    return found;
  }

  function update() {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(":scope > .sk-dock__item"));
    const index = hovered ? buttons.indexOf(hovered) : -1;
    const style = getComputedStyle(root);
    const magnification = Number.parseFloat(style.getPropertyValue("--sk-dock-magnification")) || 1.3;
    // The registered length resolves rem/calc overrides to pixels in computed style.
    const lift = Number.parseFloat(style.getPropertyValue("--dock-resolved-lift")) || 0;
    for (const [i, button] of buttons.entries()) {
      const active = media!.matches && !button.disabled && index >= 0;
      const isHovered = active && i === index;
      const neighbor = active && Math.abs(i - index) === 1;
      const amount = isHovered ? 1 : neighbor ? 0.2 : 0;
      const targetScale = isHovered && pressed ? magnification * 0.98 : 1 + (magnification - 1) * amount;
      button.toggleAttribute("data-dock-hovered", isHovered);
      const controller = entry(button);
      controller.scale.set(targetScale);
      controller.lift.set(isHovered ? lift * (pressed ? 0.5 : 1) : neighbor ? lift * 0.375 : 0);
    }
  }

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === "touch" || !media.matches) return;
    const target = (event.target as Element).closest<HTMLButtonElement>(".sk-dock__item");
    const next = target?.parentElement === root && !target.disabled ? target : undefined;
    if (next === hovered) return;
    hovered = next;
    update();
  };
  // Only physical pointer movement retargets hover. A transformed control can leave
  // a stationary pointer; responding to that synthetic boundary change would oscillate.
  const leave = () => { hovered = undefined; pressed = false; update(); };
  const out = (event: PointerEvent) => { if (!event.relatedTarget) leave(); };
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || !hovered || !media.matches) return;
    pressed = true;
    update();
  };
  const up = () => { if (pressed) { pressed = false; update(); } };
  const reset = () => {
    for (const [button, controller] of entries) {
      controller.scale.destroy();
      controller.lift.destroy();
      button.style.removeProperty("transform");
      button.removeAttribute("data-dock-raised");
      button.removeAttribute("data-dock-hovered");
    }
    entries.clear();
  };
  const changed = () => {
    hovered = undefined;
    pressed = false;
    reset();
  };
  root.setAttribute("data-dock-motion", "");
  root.ownerDocument.addEventListener("pointermove", onMove);
  root.ownerDocument.addEventListener("pointerout", out);
  root.ownerDocument.defaultView?.addEventListener("blur", leave);
  root.addEventListener("pointerdown", down);
  root.ownerDocument.addEventListener("pointerup", up);
  root.ownerDocument.addEventListener("pointercancel", up);
  media.addEventListener("change", changed);
  return () => {
    root.removeAttribute("data-dock-motion");
    root.ownerDocument.removeEventListener("pointermove", onMove);
    root.ownerDocument.removeEventListener("pointerout", out);
    root.ownerDocument.defaultView?.removeEventListener("blur", leave);
    root.removeEventListener("pointerdown", down);
    root.ownerDocument.removeEventListener("pointerup", up);
    root.ownerDocument.removeEventListener("pointercancel", up);
    media.removeEventListener("change", changed);
    reset();
  };
}
