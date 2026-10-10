import { dialogStackParts as p } from "./dialog-stack.js";
import { trapModalDialogs } from "./focus-trap.js";

let sequence = 0;

export interface DialogStackController {
  setOpen(open: boolean): void;
  refresh(): void;
  handleClick(event: MouseEvent): void;
  destroy(): void;
}

/** Both bindings share navigation, naming and modality, not just similar-looking markup. */
export function connectDialogStack(root: HTMLElement, options: { onOpenRequest?: (open: boolean) => void; onStepChange?: (index: number) => void; listenClicks?: boolean } = {}): DialogStackController {
  const dialog = root.querySelector<HTMLDialogElement>(`:scope > .${p.body}`);
  if (!dialog) throw new Error("DialogStack requires a direct DialogStackBody child");
  const id = dialog.id || `sk-dialog-stack-${++sequence}`;
  dialog.id = id;
  let active = 0;
  let opener: HTMLElement | null = null;
  let destroyed = false;
  let closing = false;
  let pointerStartedInside = false;
  let recentering: Animation | undefined;
  const rememberedFocus = new WeakMap<HTMLElement, HTMLElement>();
  const releaseTrap = trapModalDialogs(root.ownerDocument);
  const panels = () => Array.from(dialog.querySelectorAll<HTMLElement>(`:scope > .${p.content}`));
  const owned = (element: Element) => element.closest(`.${p.root}`) === root;
  // Boundary handling must not enable a control the author deliberately disabled.
  const authoredDisabled = new WeakMap<HTMLButtonElement, boolean>();
  const setBoundary = (button: HTMLButtonElement, boundary: boolean) => {
    if (!owned(button)) return;
    if (!authoredDisabled.has(button)) authoredDisabled.set(button, button.disabled);
    button.disabled = boundary || authoredDisabled.get(button)!;
  };

  const refresh = () => {
    const items = panels();
    active = Math.max(0, Math.min(active, items.length - 1));
    root.dataset.activeIndex = String(active);
    root.dataset.state = dialog.open ? "open" : "closed";
    items.forEach((panel, index) => {
      const current = index === active;
      panel.dataset.state = current ? "active" : index < active ? "previous" : "upcoming";
      panel.toggleAttribute("inert", !current);
      panel.setAttribute("aria-hidden", String(!current));
      panel.style.setProperty("--sk-dialog-stack-depth", String(Math.max(0, active - index)));
      panel.querySelectorAll<HTMLButtonElement>(`.${p.previous}`).forEach(button => setBoundary(button, index === 0));
      panel.querySelectorAll<HTMLButtonElement>(`.${p.next}`).forEach(button => setBoundary(button, index === items.length - 1));
      const title = panel.querySelector<HTMLElement>(`.${p.title}`);
      const description = panel.querySelector<HTMLElement>(`.${p.description}`);
      if (title && !title.id) title.id = `${id}-title-${index}`;
      if (description && !description.id) description.id = `${id}-description-${index}`;
      if (title) panel.setAttribute("aria-labelledby", title.id);
      else panel.removeAttribute("aria-labelledby");
      if (description) panel.setAttribute("aria-describedby", description.id);
      else panel.removeAttribute("aria-describedby");
      if (current) {
        if (title) dialog.setAttribute("aria-labelledby", title.id);
        else dialog.removeAttribute("aria-labelledby");
        if (description) dialog.setAttribute("aria-describedby", description.id);
        else dialog.removeAttribute("aria-describedby");
      }
    });
    root.querySelectorAll<HTMLElement>(`.${p.trigger}`).forEach(trigger => {
      if (!owned(trigger)) return;
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-controls", id);
      trigger.setAttribute("aria-expanded", String(dialog.open));
    });
  };
  const focusPanel = (restore = false) => {
    const panel = panels()[active];
    if (!panel) return;
    const remembered = restore ? rememberedFocus.get(panel) : undefined;
    if (remembered?.isConnected && panel.contains(remembered) && !remembered.closest("[inert], [hidden]") && !remembered.matches(":disabled")) {
      remembered.focus({ preventScroll: true });
      return;
    }
    if (!panel.hasAttribute("tabindex")) panel.tabIndex = -1;
    panel.focus({ preventScroll: true });
  };
  const setOpen = (open: boolean) => {
    if (destroyed || dialog.open === open) return;
    if (open) {
      if (!panels().length) return;
      recentering?.cancel();
      recentering = undefined;
      opener = root.ownerDocument.activeElement as HTMLElement | null;
      active = 0;
      pointerStartedInside = false;
      refresh();
      dialog.showModal();
      refresh();
      focusPanel();
    } else {
      if (root.dataset.motion === "instant") {
        recentering?.cancel();
        recentering = undefined;
      }
      closing = true;
      dialog.close();
      closing = false;
      refresh();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    }
  };
  const request = (open: boolean) => {
    if (options.onOpenRequest) options.onOpenRequest(open);
    else setOpen(open);
  };
  const move = (delta: number) => {
    const next = Math.max(0, Math.min(active + delta, panels().length - 1));
    if (next === active) return;
    const win = root.ownerDocument.defaultView;
    const animate = root.dataset.motion === "animated" && !win?.matchMedia?.("(prefers-reduced-motion: reduce)").matches && typeof dialog.animate === "function";
    // A different step height recentres the native dialog immediately. Keep its painted top
    // continuous with a translation, not an animated height or a scale that stretches the text.
    const before = animate ? dialog.getBoundingClientRect() : undefined;
    recentering?.cancel();
    recentering = undefined;
    const previousPanel = panels()[active];
    const focused = root.ownerDocument.activeElement;
    if (previousPanel && focused instanceof HTMLElement && previousPanel.contains(focused)) rememberedFocus.set(previousPanel, focused);
    active = next;
    refresh();
    if (before && win) {
      const after = dialog.getBoundingClientRect();
      const offset = before.top - after.top;
      const style = win.getComputedStyle(dialog);
      const rawDuration = style.getPropertyValue("--motion-reveal-duration").trim();
      const duration = Number.parseFloat(rawDuration) * (rawDuration.endsWith("ms") ? 1 : 1000);
      const easing = style.getPropertyValue("--motion-reveal-easing").trim();
      if (Math.abs(offset) > 0.5 && Number.isFinite(duration) && duration > 0 && easing) {
        // Reading the current painted rect before cancellation makes a rapid reversal retarget
        // from where it was, rather than replaying the previous transition's first frame.
        recentering = dialog.animate([{ translate: `0 ${offset}px` }, { translate: "0 0" }], { duration, easing });
      }
    }
    focusPanel(delta < 0);
    options.onStepChange?.(active);
  };
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) return;
    const target = event.target as Element;
    if (!target.closest || !owned(target)) return;
    root.dataset.motion = event.detail === 0 ? "instant" : "animated";
    if (target === dialog) { onBackdrop(event); return; }
    const button = target.closest<HTMLButtonElement>(`.${p.trigger}, .${p.next}, .${p.previous}, .${p.close}`);
    if (!button || button.disabled) return;
    if (button.classList.contains(p.trigger)) { request(true); return; }
    if (!dialog.open || !panels()[active]?.contains(button)) return;
    if (button.classList.contains(p.close)) request(false);
    else move(button.classList.contains(p.next) ? 1 : -1);
  };
  // A release over the backdrop can finish a text selection or drag that began inside the panel.
  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    pointerStartedInside = panels()[active]?.contains(event.target as Node) ?? false;
  };
  const onPointerCancel = () => { pointerStartedInside = false; };
  // A transparent dialog box lets the native backdrop surround the stacked surfaces.
  const onBackdrop = (event: MouseEvent) => {
    if (event.defaultPrevented || event.target !== dialog || !dialog.open) return;
    const startedInside = pointerStartedInside;
    pointerStartedInside = false;
    if (startedInside) return;
    const bounds = panels()[active]?.getBoundingClientRect();
    if (bounds && event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) return;
    request(false);
  };
  const onCancel = (event: Event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    root.dataset.motion = "instant";
    request(false);
  };
  const onClose = () => {
    // Native close events are queued: an old close must not dismiss a dialog reopened meanwhile.
    if (dialog.open) return;
    if (!closing && root.dataset.state === "open") options.onOpenRequest?.(false);
    refresh();
  };
  if (options.listenClicks !== false) root.addEventListener("click", onClick);
  dialog.addEventListener("pointerdown", onPointerDown);
  dialog.addEventListener("pointercancel", onPointerCancel);
  dialog.addEventListener("cancel", onCancel);
  dialog.addEventListener("close", onClose);
  refresh();
  return {
    setOpen, refresh, handleClick: onClick,
    destroy() {
      destroyed = true;
      recentering?.cancel();
      root.removeEventListener("click", onClick);
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("pointercancel", onPointerCancel);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
      if (dialog.open) dialog.close();
      releaseTrap();
    },
  };
}
