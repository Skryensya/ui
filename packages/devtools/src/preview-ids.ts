/*
 * PREVIEW IDS. Which `UsagePreview` is this?
 *
 * Every preview card carries a number that is unique across the WHOLE docs site and stable between builds
 * (`data-sk-preview-id`, handed out at build time by `apps/docs/src/lib/preview-ids.ts`). This only shows it: a badge
 * in the card's top-start corner (the card's tools live at the end), so "#412" can be quoted in a bug report and
 * found again with `document.querySelector('[data-sk-preview-id="412"]')`.
 *
 * A BADGE IN THE LIGHT DOM, for `fps.ts`'s reason: it has to sit next to the box it names and be reachable by a
 * plain query. It is inert (`pointer-events: none`) and `aria-hidden`, so it changes neither what is clickable nor
 * what is read.
 */

const STYLE_ID = "sk-devtools-preview-ids-style";
const BADGE_CLASS = "sk-devtools-preview-id";
const CARD = "[data-sk-preview-id]";

function ensureStyleTag(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    ${CARD} { position: relative; }
    .${BADGE_CLASS} {
      position: absolute;
      z-index: 2;
      inset-block-start: 0;
      inset-inline-start: 0;
      padding: 1px 6px;
      border-end-end-radius: 6px;
      background: var(--color-bg-surface-sunken, rgba(0, 0, 0, 0.06));
      color: var(--color-text-primary, #111);
      font: 600 11px/1.5 ui-monospace, "SF Mono", monospace;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

export function createPreviewIds() {
  ensureStyleTag();

  return {
    start(): void {
      document.querySelectorAll<HTMLElement>(CARD).forEach((card) => {
        if (card.querySelector(`:scope > .${BADGE_CLASS}`)) return;
        const badge = document.createElement("span");
        badge.className = BADGE_CLASS;
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = `#${card.getAttribute("data-sk-preview-id")}`;
        card.prepend(badge);
      });
    },
    stop(): void {
      document.querySelectorAll(`.${BADGE_CLASS}`).forEach((badge) => badge.remove());
    },
  };
}
