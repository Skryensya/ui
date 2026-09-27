import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";
import { siteFooter } from "./shared";

/*
 * BOOKING. The "pick a moment" shape: a date, then a time, then who you are. Two columns because
 * the choice and its summary have to be visible together; on a narrow screen the grid stacks them.
 *
 *   - the date is a real `Calendar` with `min`/`max`, not a free date input. The bookable window is
 *     the whole point of the page, and a grid shows it at a glance;
 *   - the time slots are a `TileRadioGroup`. A slot is a value the booking submits (a radio, not a
 *     `Segmented`), and each slot is a surface worth pressing on a phone;
 *   - the summary is a `DescriptionList` in a sunken `Box`: labelled pairs, read top to bottom; and
 *   - the confirm button is `tactile` with the accent: a booking is a commitment, and the travel
 *     says so. The way back is a ghost.
 */

const detail = (term: string, value: string): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionItem",
  slots: { term, children: value },
});

export const bookingTree = (t: Translate, locale: "es" | "en"): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Lumen Studio" },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: {
            contract: "badge",
            signature: "Badge",
            options: { tone: "accent" },
            children: t("demo.booking.duration"),
          },
        },
      ],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { class: "page-shell" },
      children: [
        {
          contract: "layout",
          signature: "Main",
          attrs: { class: "page-shell__main" },
          children: {
            contract: "wrapper",
            signature: "Wrapper",
            options: { wrapperSize: "lg", gutter: "md", gutterDesktop: "lg" },
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "md", gapDesktop: "lg" },
              children: [
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "xs" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "h2", flush: true },
                      children: t("demo.booking.title"),
                    },
                    {
                      contract: "typography",
                      signature: "Text",
                      options: { tone: "secondary" },
                      children: t("demo.booking.lede"),
                    },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Grid",
                  options: { columns: "2", gap: "md", gapDesktop: "lg", responsive: true },
                  children: [
                    {
                      contract: "layout",
                      signature: "Stack",
                      options: { gap: "md", gapDesktop: "lg" },
                      children: [
                        {
                          contract: "calendar",
                          signature: "Calendar",
                          options: {
                            value: "2026-10-14",
                            min: "2026-10-01",
                            max: "2026-10-31",
                            locale,
                          },
                          slots: { label: t("demo.booking.dateLabel") },
                        },
                        {
                          contract: "tile",
                          signature: "TileRadioGroup",
                          options: { name: "slot", defaultValue: "1030", padding: "sm" },
                          attrs: { "aria-label": t("demo.booking.slotLabel") },
                          slots: {
                            items: [
                              { options: { value: "0900" }, slots: { label: "09:00" } },
                              { options: { value: "1030" }, slots: { label: "10:30" } },
                              { options: { value: "1200" }, slots: { label: "12:00" } },
                              { options: { value: "1630" }, slots: { label: "16:30" } },
                            ],
                          },
                        },
                      ],
                    },
                    {
                      contract: "box",
                      signature: "Box",
                      options: { surface: "sunken", border: "subtle", padding: "md", paddingDesktop: "lg" },
                      children: {
                        contract: "layout",
                        signature: "Stack",
                        options: { gap: "md" },
                        children: [
                          {
                            contract: "typography",
                            signature: "Heading",
                            options: { headingSize: "h4", flush: true },
                            children: t("demo.booking.summaryTitle"),
                          },
                          {
                            contract: "description-list",
                            signature: "DescriptionList",
                            options: { dividers: true },
                            children: [
                              detail(t("demo.booking.service"), t("demo.booking.serviceValue")),
                              detail(t("demo.booking.date"), t("demo.booking.dateValue")),
                              detail(t("demo.booking.time"), "10:30"),
                              detail(t("demo.booking.with"), "Ana Morales"),
                            ],
                          },
                          {
                            contract: "form-field",
                            signature: "FormField",
                            options: { required: true },
                            slots: {
                              label: t("demo.booking.email"),
                              children: {
                                contract: "input",
                                signature: "Input",
                                options: {
                                  type: "email",
                                  name: "email",
                                  placeholder: t("demo.booking.emailPlaceholder"),
                                },
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
                                children: t("demo.booking.back"),
                              },
                              {
                                contract: "button",
                                signature: "Button.action",
                                options: { appearance: "tactile", tone: "accent", type: "submit" },
                                children: t("demo.booking.confirm"),
                              },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
        siteFooter(t),
      ],
    },
  ],
});
