import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * ONBOARDING WIZARD. The multi-step shape, and the counterpart to `checkout`: both open on `Steps`,
 * but each one uses the OTHER appearance, so the gallery shows the two side by side.
 *
 *   - `Steps` with `appearance: "segments"`. Checkout keeps `markers` (numbered stops a reader
 *     scans), while a wizard of short screens reads better as one bar filling up: the position
 *     matters more than each stop's name. Same contract, same `status` per item, a different paint;
 *   - the role choice is a `TileRadioGroup`. It submits a value (so it is a radio, not a
 *     `Segmented`), and each option is a whole surface worth pressing, not a dot beside a word; and
 *   - the footer's buttons use `appearance: "tactile"`, the physical push-button paint. A wizard is
 *     the one place in this gallery where "press to go on" is the whole interaction, so the travel
 *     into the surface is feedback the reader actually feels. `appearance` is independent of
 *     `variant` and `tone`: the accent "Continue" and the neutral "Skip" share it, and "Back" stays
 *     a ghost because it is the way out, not the way forward.
 */

export const onboardingTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Lumen" },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost" },
            children: t("demo.onboarding.exit"),
          },
        },
      ],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { class: "page-shell" },
      children: {
        contract: "layout",
        signature: "Main",
        attrs: { class: "page-shell__main" },
        children: {
          contract: "wrapper",
          signature: "Wrapper",
          options: { wrapperSize: "md" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "lg" },
            children: [
              {
                contract: "steps",
                signature: "Steps",
                /* `horizontal` pinned: the published opt-out of Steps' phone fallback to a vertical rail.
                 * A segmented bar reads as progress only while it runs across the screen. */
                options: { appearance: "segments", orientation: "horizontal" },
                slots: {
                  items: [
                    {
                      options: { status: "complete" },
                      slots: {
                        marker: { contract: "icon", signature: "Icon", options: { name: "check" } },
                        label: t("demo.onboarding.step1"),
                      },
                    },
                    {
                      options: { status: "current" },
                      slots: { marker: "2", label: t("demo.onboarding.step2") },
                    },
                    {
                      options: { status: "upcoming" },
                      slots: { marker: "3", label: t("demo.onboarding.step3") },
                    },
                    {
                      options: { status: "upcoming" },
                      slots: { marker: "4", label: t("demo.onboarding.step4") },
                    },
                  ],
                },
              },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "xs" },
                children: [
                  {
                    contract: "typography",
                    signature: "Heading",
                    options: { headingSize: "h2", flush: true },
                    children: t("demo.onboarding.title"),
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary" },
                    children: t("demo.onboarding.lede"),
                  },
                ],
              },
              {
                contract: "tile",
                signature: "TileRadioGroup",
                options: { name: "role", defaultValue: "design", padding: "md" },
                attrs: { "aria-label": t("demo.onboarding.roleLabel") },
                slots: {
                  items: [
                    { options: { value: "design" }, slots: { label: t("demo.onboarding.roleDesign") } },
                    {
                      options: { value: "engineering" },
                      slots: { label: t("demo.onboarding.roleEngineering") },
                    },
                    {
                      options: { value: "product" },
                      slots: { label: t("demo.onboarding.roleProduct") },
                    },
                  ],
                },
              },
              {
                contract: "form-field",
                signature: "FormField",
                slots: {
                  label: t("demo.onboarding.team"),
                  hint: t("demo.onboarding.teamHint"),
                  children: {
                    contract: "input",
                    signature: "Input",
                    options: { name: "team", placeholder: t("demo.onboarding.teamPlaceholder") },
                  },
                },
              },
              {
                contract: "layout",
                signature: "Inline",
                options: { justify: "between", inlineAlign: "center", wrap: true },
                children: [
                  {
                    contract: "button",
                    signature: "Button.action",
                    options: { variant: "ghost" },
                    children: [
                      { contract: "icon", signature: "Icon", options: { name: "arrow-left", size: "sm" } },
                      t("demo.onboarding.back"),
                    ],
                  },
                  {
                    contract: "layout",
                    signature: "Inline",
                    options: { gap: "sm" },
                    children: [
                      {
                        contract: "button",
                        signature: "Button.action",
                        options: { appearance: "tactile" },
                        children: t("demo.onboarding.skip"),
                      },
                      {
                        contract: "button",
                        signature: "Button.action",
                        options: { appearance: "tactile", tone: "accent" },
                        children: [
                          t("demo.onboarding.continue"),
                          {
                            contract: "icon",
                            signature: "Icon",
                            options: { name: "arrow-right", size: "sm" },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    },
  ],
});
