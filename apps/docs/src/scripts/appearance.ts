import { updateComponentPreviewStageDocument } from "../preview/component-preview-enhancer";

type Appearance = "plain" | "tactile" | "brutalist" | "frosted";

const APPEARANCES: readonly Appearance[] = ["plain", "tactile", "brutalist", "frosted"];

/* The scope is ONE PREVIEW CARD: the page declares the menu and its target (the shell's template), and
   `placeAppearanceMenus` gives every card its own copy. Nothing is stored; a card starts plain. */
const scopeSelector = "[data-docs-appearance-scope]";
const pageSelector = "[data-docs-appearance-page]";
const templateSelector = "template[data-docs-appearance-template]";
const cardSelector = ".sk-preview-card";
const setSelector = "[data-docs-appearance-set]";
const toggleSelector = "[data-docs-appearance-toggle]";
const labelSelector = "[data-docs-appearance-label]";
const appearanceTargetSelector = APPEARANCES.map((value) => `[data-appearance="${value}"]`).join(", ");
/* A preview that exists to COMPARE appearances (plain beside tactile, brutalist and frosted) opts out of
   the page-wide switch, or choosing one appearance would repaint the comparison into three copies. */
const fixedSelector = "[data-docs-appearance-fixed]";

let bound = false;

function isAppearance(value: unknown): value is Appearance {
  return APPEARANCES.includes(value as Appearance);
}

/* The appearances a scope's component publishes, from its menu; every one when it names none. */
function allowedIn(scope: HTMLElement): readonly Appearance[] {
  const listed = scope.querySelector<HTMLElement>("[data-docs-appearance-values]")?.dataset.docsAppearanceValues;
  const values = listed?.split(/\s+/).filter(isAppearance);
  return values?.length ? values : APPEARANCES;
}

/* The values are per page: a card's choice is always one its component publishes. */
function effectiveIn(scope: HTMLElement, value: Appearance): Appearance {
  return allowedIn(scope).includes(value) ? value : "plain";
}

function nextAppearance(scope: HTMLElement, value: Appearance): Appearance {
  const allowed = allowedIn(scope);
  return allowed[(allowed.indexOf(value) + 1) % allowed.length]!;
}

function labelFor(value: Appearance): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function current(scope: HTMLElement): Appearance {
  const value = scope.getAttribute("data-docs-appearance");
  return effectiveIn(scope, isAppearance(value) ? value : "plain");
}

function targetSelector(scope: HTMLElement): string {
  return scope.getAttribute("data-docs-appearance-target") || appearanceTargetSelector;
}

function writeAppearance(element: HTMLElement, preferred: Appearance): void {
  // Fields and panels have no press feedback; only their buttons can be tactile.
  const value = preferred === "tactile" && element.matches(".sk-input, .sk-select, .sk-select-native, .sk-popover") ? "plain" : preferred;
  if (!element.closest(fixedSelector) && element.getAttribute("data-appearance") !== value) {
    element.setAttribute("data-appearance", value);
  }
}

function writeFrameSource(frame: HTMLIFrameElement, value: Appearance): void {
  const scope = frame.closest<HTMLElement>(scopeSelector);
  const source = frame.getAttribute("data-sk-component-preview-doc");
  if (!scope || !source) return;
  try {
    const doc = new DOMParser().parseFromString(source, "text/html");
    doc.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
      writeAppearance(element, value);
    });
    updateComponentPreviewStageDocument(frame, `<!doctype html>\n${doc.documentElement.outerHTML}`);
  } catch {
    /* Malformed preview source should not break the page chrome. The live frame path below still tries. */
  }
}

function writeFrame(frame: HTMLIFrameElement, value: Appearance): void {
  const scope = frame.closest<HTMLElement>(scopeSelector);
  if (!scope || frame.closest(fixedSelector)) return;
  writeFrameSource(frame, value);
  try {
    frame.contentDocument?.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
      writeAppearance(element, value);
    });
  } catch {
    /* ComponentPreview frames are same-origin srcdoc. A future cross-origin frame simply opts out. */
  }
}

/*
 * A SCOPE KEEPS ITS APPEARANCE WHEN ITS EXAMPLE IS REDRAWN. A property playground swaps its example every
 * time the reader picks another option of its segmented control (variant, tone...), and the new elements are
 * fresh markup that never saw the attribute `apply` wrote on the old ones. Without this the reader would have
 * to choose the appearance again after every option. Frames mount asynchronously, so also reapply at
 * `frame-ready`. Appearance writes are not observed, avoiding a feedback loop.
 */
const watched = new WeakSet<HTMLElement>();
function keepAppearance(scope: HTMLElement): void {
  if (watched.has(scope)) return;
  watched.add(scope);
  new MutationObserver(() => {
    const value = current(scope);
    scope.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
      writeAppearance(element, value);
    });
    scope.querySelectorAll<HTMLIFrameElement>("iframe.sk-component-preview__stage[data-sk-component-preview-frame-ready]").forEach((frame) => {
      writeFrame(frame, value);
    });
  }).observe(scope, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-sk-component-preview-frame-ready"] });
}

function apply(scope: HTMLElement, preferred: Appearance): void {
  const value = effectiveIn(scope, preferred);
  keepAppearance(scope);
  scope.setAttribute("data-docs-appearance", value);
  /* The satin is only fetched once a card has been frosted (preview-card.css), and then kept, so
     leaving frosted still animates over it. */
  if (value === "frosted") scope.setAttribute("data-docs-frost-seen", "");
  scope.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
    writeAppearance(element, value);
  });
  scope.querySelectorAll<HTMLIFrameElement>("iframe.sk-component-preview__stage").forEach((frame) => {
    writeFrame(frame, value);
  });
  scope.querySelectorAll<HTMLElement>(setSelector).forEach((item) => {
    const selected = item.getAttribute("data-docs-appearance-set") === value;
    if (selected) {
      item.setAttribute("data-checked", "");
      item.setAttribute("aria-checked", "true");
    } else {
      item.removeAttribute("data-checked");
      item.setAttribute("aria-checked", "false");
    }
  });
  scope.querySelectorAll<HTMLElement>(labelSelector).forEach((label) => {
    label.textContent = labelFor(value);
  });
}

/**
 * Give every preview card of a page that declares an appearance menu its own copy of it. Runs BEFORE
 * the components mount, so the cloned Menu is enhanced like any other. Cards that compare appearances
 * (`data-docs-appearance-fixed`) get none.
 */
export function placeAppearanceMenus(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(pageSelector).forEach((page) => {
    const template = page.querySelector<HTMLTemplateElement>(templateSelector);
    if (!template) return;
    const target = page.getAttribute("data-docs-appearance-target");
    page.querySelectorAll<HTMLElement>(cardSelector).forEach((card) => {
      if (card.hasAttribute("data-docs-appearance-scope") || card.closest(fixedSelector)) return;
      const control = document.createElement("div");
      control.className = "docs-card-appearance";
      control.append(template.content.cloneNode(true));
      const omit = card.getAttribute("data-docs-appearance-omit")?.split(/\s+/) ?? [];
      control.querySelectorAll<HTMLElement>(setSelector).forEach((item) => {
        if (omit.includes(item.getAttribute("data-docs-appearance-set") ?? "")) item.remove();
      });
      const values = control.querySelector<HTMLElement>("[data-docs-appearance-values]");
      if (values) values.dataset.docsAppearanceValues = values.dataset.docsAppearanceValues!.split(/\s+/).filter((v) => !omit.includes(v)).join(" ");
      card.append(control);
      card.setAttribute("data-docs-appearance-scope", "");
      if (target) card.setAttribute("data-docs-appearance-target", target);
    });
  });
}

export function initAppearance(): void {
  document.querySelectorAll<HTMLElement>(scopeSelector).forEach((scope) => apply(scope, "plain"));

  if (bound) return;
  bound = true;

  document.addEventListener("click", (event) => {
    const target = event.target as Element | null;
    const set = target?.closest<HTMLElement>(setSelector);
    // A value the page lists but its component does not publish (Box's tactile) is not a choice.
    if (set?.matches("[data-disabled], [aria-disabled='true']")) return;
    if (set) {
      const scope = set.closest<HTMLElement>(scopeSelector);
      const value = set.getAttribute("data-docs-appearance-set");
      if (scope && isAppearance(value)) {
        apply(scope, value);
        document.dispatchEvent(new CustomEvent("sk:dimensions-changed"));
      }
      return;
    }

    const toggle = target?.closest<HTMLElement>(toggleSelector);
    if (toggle) {
      const scope = toggle.closest<HTMLElement>(scopeSelector);
      if (scope) {
        const value = nextAppearance(scope, current(scope));
        apply(scope, value);
        document.dispatchEvent(new CustomEvent("sk:dimensions-changed"));
      }
    }
  });

  document.addEventListener(
    "load",
    (event) => {
      const frame = event.target instanceof HTMLIFrameElement ? event.target : null;
      const scope = frame?.closest<HTMLElement>(scopeSelector);
      if (frame && scope) writeFrame(frame, current(scope));
    },
    true,
  );
}
