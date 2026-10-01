import { updateComponentPreviewStageDocument } from "../preview/component-preview-enhancer";
import { getPreference, setPreference, subscribePreference } from "@skryensya/vanilla/storage";
import { appearancePreference } from "../lib/preferences";

type Appearance = "plain" | "tactile" | "brutalist" | "frosted";

const APPEARANCES: readonly Appearance[] = ["plain", "tactile", "brutalist", "frosted"];

const scopeSelector = "[data-docs-appearance-scope]";
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

/* The preference is site-wide, the values are per page: tactile chosen on Button reads as plain on
   Box, which has no tactile, and comes back when the reader returns to Button. */
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
  return effectiveIn(scope, isAppearance(value) ? value : getPreference(appearancePreference));
}

function targetSelector(scope: HTMLElement): string {
  return scope.getAttribute("data-docs-appearance-target") || appearanceTargetSelector;
}

function writeFrameSource(frame: HTMLIFrameElement, value: Appearance): void {
  const scope = frame.closest<HTMLElement>(scopeSelector);
  const source = frame.getAttribute("data-sk-component-preview-doc");
  if (!scope || !source) return;
  try {
    const doc = new DOMParser().parseFromString(source, "text/html");
    doc.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
      element.setAttribute("data-appearance", value);
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
      element.setAttribute("data-appearance", value);
    });
  } catch {
    /* ComponentPreview frames are same-origin srcdoc. A future cross-origin frame simply opts out. */
  }
}

function apply(scope: HTMLElement, preferred: Appearance): void {
  const value = effectiveIn(scope, preferred);
  scope.setAttribute("data-docs-appearance", value);
  scope.querySelectorAll<HTMLElement>(targetSelector(scope)).forEach((element) => {
    if (!element.closest(fixedSelector)) element.setAttribute("data-appearance", value);
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

function applyAll(value: Appearance): void {
  document.querySelectorAll<HTMLElement>(scopeSelector).forEach((scope) => apply(scope, value));
}

export function initAppearance(): void {
  applyAll(getPreference(appearancePreference));

  if (bound) return;
  bound = true;

  subscribePreference(appearancePreference, applyAll);

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
        setPreference(appearancePreference, value);
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
        setPreference(appearancePreference, value);
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
