import { anchoredParts } from "@skryensya/core/anchored";
import { segmentedEvents, segmentedParts } from "@skryensya/core/segmented";
import { iconOnlyOptionLabels } from "@skryensya/core/segmented-dom";
import { tooltipDefaultPlacement, tooltipParts } from "@skryensya/core/tooltip";
import { flushSync, mount, unmount } from "svelte";
import { applyAttrs, bindEvents } from "../runtime/apply.js";
import SegmentedTips from "./SegmentedTips.svelte";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-sk-segmented]";
const optionSelector = "[data-sk-segmented-option]";

type Cleanup = () => void;

export const mountSegmented = createConnectMount({ key: "segmented", rootSelector, connect: connectSegmented });

export function connectSegmented(root: HTMLElement): Cleanup {
  const options = Array.from(root.querySelectorAll<HTMLElement>(optionSelector));
  if (options.length === 0) throw new Error(`${segmentedParts.root} requires option parts.`);

  for (const option of options) getValue(option);

  let value = root.getAttribute("data-value")
    ?? options.find((option) => option.getAttribute("aria-checked") === "true" && !isDisabled(option))?.getAttribute("data-value")
    ?? options.find((option) => !isDisabled(option))?.getAttribute("data-value");
  const selected = options.find((option) => getValue(option) === value);
  if (!value || !selected || isDisabled(selected)) {
    throw new Error(`${segmentedParts.root} needs a data-value that matches an enabled option.`);
  }

  const indicator = root.querySelector<HTMLElement>(`.${segmentedParts.indicator}`);
  const render = (align = true) => {
    applyAttrs(root, { role: "radiogroup", "data-value": value });

    for (const option of options) {
      const selected = getValue(option) === value;
      const disabled = isDisabled(option);

      applyAttrs(option, {
        role: "radio",
        type: option instanceof HTMLButtonElement ? "button" : null,
        tabindex: selected && !disabled ? 0 : -1,
        "aria-checked": selected ? "true" : "false",
        "aria-disabled": disabled ? "true" : null,
      });
    }

    if (align) alignIndicator(root, indicator);
  };

  const setValue = (next: string) => {
    const option = options.find((candidate) => getValue(candidate) === next);
    if (!option || isDisabled(option) || next === value) return;

    value = next;
    render();
    root.dispatchEvent(new CustomEvent(segmentedEvents.valueChange, { bubbles: true, detail: { value } }));
  };

  const cleanups = options.map((option) => bindEvents(option, {
    click: () => setValue(getValue(option)),
    keydown: (event) => onOptionKeydown(event, option, options, setValue),
  }));

  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => alignIndicator(root, indicator));
  observer?.observe(root);
  /* The observer's first callback lands after layout; measuring here too would force one mid-script. */
  render(!observer);

  const tipCleanup = connectIconTooltips(root);

  return () => {
    for (const cleanup of cleanups) cleanup();
    tipCleanup();
    observer?.disconnect();
    root.removeAttribute("data-sk-segmented-ready");
    root.removeAttribute("data-sk-segmented-motion");
  };
}

/*
 * ICON-ONLY OPTIONS GET A TOOLTIP when the root asks for one (`iconLabel="tooltip"`), React's machine
 * and React's box (see core/segmented.ts's `iconLabel`). The box is
 * appended to the body, where React portals it; `SegmentedTips.svelte` runs the machine over it.
 */
function connectIconTooltips(root: HTMLElement): Cleanup {
  if (root.getAttribute("data-icon-label") !== "tooltip") return () => {};
  const tips = iconOnlyOptionLabels(root);
  if (tips.size === 0) return () => {};

  const positioner = document.createElement("div");
  positioner.className = `${tooltipParts.positioner} ${anchoredParts.positioner}`;
  positioner.setAttribute("data-sk-placement", tooltipDefaultPlacement);
  const content = document.createElement("div");
  content.className = tooltipParts.content;
  content.setAttribute("aria-hidden", "true");
  positioner.append(content);
  document.body.append(positioner);

  const app = mount(SegmentedTips, { target: positioner, anchor: content, props: { root, tips, positioner, content } });
  flushSync();

  return () => {
    void unmount(app);
    positioner.remove();
  };
}

function alignIndicator(root: HTMLElement, indicator: HTMLElement | null): void {
  if (!indicator) return;

  const selected = root.querySelector<HTMLElement>(`${optionSelector}[aria-checked="true"]`);
  if (!selected) return;

  indicator.style.transform = `translate3d(${selected.offsetLeft}px, ${selected.offsetTop}px, 0)`;
  indicator.style.inlineSize = `${selected.offsetWidth}px`;
  indicator.style.blockSize = `${selected.offsetHeight}px`;
  const first = !root.hasAttribute("data-sk-segmented-ready");
  root.setAttribute("data-sk-segmented-ready", "");
  /* Placed without motion; only later changes glide. */
  if (first) requestAnimationFrame(() => requestAnimationFrame(() => root.setAttribute("data-sk-segmented-motion", "")));
}

function onOptionKeydown(
  event: Event,
  current: HTMLElement,
  options: readonly HTMLElement[],
  setValue: (value: string) => void,
): void {
  if (!(event instanceof KeyboardEvent)) return;

  const enabled = options.filter((option) => !isDisabled(option));
  const index = enabled.indexOf(current);
  if (index === -1) return;

  const next = event.key === "Home"
    ? enabled[0]
    : event.key === "End"
      ? enabled.at(-1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? enabled[(index - 1 + enabled.length) % enabled.length]
        : event.key === "ArrowRight" || event.key === "ArrowDown"
          ? enabled[(index + 1) % enabled.length]
          : undefined;

  if (!next) return;

  event.preventDefault();
  next.focus();
  setValue(getValue(next));
}


function getValue(option: Element): string {
  const value = option.getAttribute("data-value");
  if (!value) throw new Error(`${segmentedParts.option} parts need a non-empty data-value attribute.`);
  return value;
}


function isDisabled(option: HTMLElement): boolean {
  return option.hasAttribute("data-disabled") || option.getAttribute("aria-disabled") === "true" || (option instanceof HTMLButtonElement && option.disabled);
}
