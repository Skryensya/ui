import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * THE CHROME A TEMPLATE NEEDS ON BOTH SIDES OF THE EXPANDED LINE. Helpers, not trees: they live outside
 * `src/demos` so the demo-tree gate (`trees.test.ts`), which calls every export there as a tree factory,
 * does not mistake them for one, the same reason `measured()` lives beside this file.
 */

/**
 * ONE SIDE OF THE EXPANDED LINE (decision 35). What a phone has no room for (a row of links, a secondary
 * action) sits in an Inline with `show: "expanded"`; what only a phone needs (the button that opens the
 * drawer) in one with `show: "compact"`. The kit answers the question against the nearest query container,
 * so a template in a narrow docs frame folds the way it would on a narrow screen.
 */
export const shownOn = (show: "compact" | "expanded", children: UsageTree | UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { show, gap: "sm", inlineAlign: "center" },
  children,
});

/**
 * THE MENU ON A PHONE: a real drawer, not a stand-in. The trigger exists only below the expanded line and
 * opens a `Vaul.drawer` that holds the same links the wide screen shows in its header or rail. Two nodes
 * because they live in two places: the trigger in the header, the drawer as a child of the AppShell.
 */
export const menuTrigger = (t: Translate, panelId: string): UsageTree =>
  shownOn("compact", {
    contract: "vaul",
    signature: "Vaul.Trigger",
    options: { opens: panelId, buttonVariant: "ghost", buttonIconOnly: true, buttonLabel: t("demo.shared.menu") },
    children: { contract: "icon", signature: "Icon", options: { name: "menu" } },
  });

export const menuDrawer = (t: Translate, panelId: string, content: UsageTree | UsageTree[]): UsageTree => ({
  contract: "vaul",
  signature: "Vaul.drawer",
  options: { panelId, label: t("demo.shared.menuTitle"), edge: "inline-start" },
  /* The panel owns no inset (vaul.css): what sits in it does, the way a page's Box does. */
  children: {
    contract: "box",
    signature: "Box",
    options: { padding: "md" },
    children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "layout",
          signature: "Inline",
          options: { justify: "between", inlineAlign: "center" },
          children: [
            { contract: "typography", signature: "Text", options: { weight: "emphasis" }, children: t("demo.shared.menuTitle") },
            {
              contract: "vaul",
              signature: "Vaul.Close",
              options: { buttonVariant: "ghost", buttonIconOnly: true, buttonLabel: t("demo.shared.closeMenu") },
              children: { contract: "icon", signature: "Icon", options: { name: "close" } },
            },
          ],
        },
        ...(Array.isArray(content) ? content : [content]),
      ],
    },
  },
});

