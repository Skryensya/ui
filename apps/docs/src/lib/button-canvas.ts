import { buttonContract, type ButtonAppearance } from "@skryensya/core/button";
import type { UsageTree } from "@skryensya/core/usage-tree";

export const buttonAxes = buttonContract.options;

/** Cover each visual axis, not the Cartesian product of every option and state. */
export function buttonCanvas(appearance: ButtonAppearance, label: string, loadingText: string, href: string) {
  const button = (options: Record<string, unknown> = {}, extra: Partial<UsageTree> = {}): UsageTree => ({
    contract: "button",
    signature: "Button.action",
    options: { appearance, ...options },
    children: label,
    ...extra,
  });
  const icon: UsageTree = { contract: "icon", signature: "Icon", options: { name: "arrow-right" } };

  return {
    matrix: buttonAxes.variant.values.map((variant) => ({
      variant,
      cells: buttonAxes.tone.values.map((tone) => ({ tone, tree: button({ variant, tone }) })),
    })),
    groups: [
      {
        id: "size",
        items: buttonAxes.size.values.map((size) => ({ label: size, tree: button({ size }) })),
      },
      {
        id: "state",
        items: [
          { label: "default", tree: button() },
          { label: "disabled", tree: button({ disabled: true }) },
          { label: "pressed: false", tree: button({ pressed: false }) },
          { label: "pressed: true", tree: button({ pressed: true }) },
          { label: "loading", tree: button({ loading: true }) },
          { label: "loadingText", tree: button({ loading: true, loadingText }) },
        ],
      },
      {
        id: "slots",
        items: [
          { label: "pre", tree: button({}, { slots: { pre: icon } }) },
          { label: "post", tree: button({}, { slots: { post: icon } }) },
          { label: "pre + post", tree: button({}, { slots: { pre: icon, post: icon } }) },
          { label: "iconOnly", tree: button({ iconOnly: true }, { attrs: { "aria-label": label }, children: icon }) },
        ],
      },
      {
        id: "host",
        items: [
          { label: "Button.action", tree: button() },
          { label: "Button.navigation", tree: button({ href }, { signature: "Button.navigation" }) },
        ],
      },
    ],
  };
}
