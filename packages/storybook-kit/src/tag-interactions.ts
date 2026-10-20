const wired = new WeakSet<HTMLElement>();

/** Makes standalone Tag.toggle and removable Tag specimens interactive in both Storybooks. */
export function wireTagInteractions(root: HTMLElement): void {
  if (wired.has(root)) return;
  wired.add(root);

  root.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const remove = target?.closest<HTMLButtonElement>(".sk-tag__remove");
    if (remove) {
      const tag = remove.closest<HTMLElement>(".sk-tag");
      if (!tag) return;
      const parent = tag.parentElement;
      const buttons = Array.from(parent?.querySelectorAll<HTMLButtonElement>(":scope > .sk-tag > .sk-tag__remove") ?? []);
      const next = buttons[buttons.indexOf(remove) + 1] ?? buttons[buttons.indexOf(remove) - 1];
      if (next) next.focus();
      else if (parent) {
        parent.tabIndex = -1;
        parent.focus();
      }
      tag.remove();
      return;
    }

    const toggle = target?.closest<HTMLButtonElement>("button.sk-tag[aria-pressed]");
    if (toggle) toggle.setAttribute("aria-pressed", toggle.getAttribute("aria-pressed") === "true" ? "false" : "true");
  });
}
