import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { iconMarkup } from "../icons";

/*
 * A button and a dialog, composed under one marker the way `tabsAdvancedTree` composes tabs and a
 * status line: the same escape hatch, applied to the case `contracts/NOT-PUBLISHED.md` names for
 * `command-palette`: the tree can emit the trigger AND the dialog, it just cannot emit the CALL that
 * opens one. `commandPaletteDemoScript` supplies exactly that call, nothing else.
 */
export const commandPaletteDemoTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      /* `solid` (the default emphasis), not `secondary`: the Button contract has never published
         such a value, so this demo emitted `data-variant="secondary"`, matched no rule in
         button.css and fell back to looking like the default anyway. Caught by running the demo
         tree through the validator, which is exactly what hand-written markup does not get. */
      options: { variant: "solid" },
      attrs: { "data-cmdk-demo-open": "" },
      children: [
        { contract: "icon", signature: "Icon", options: { name: "search", size: "sm" } },
        t("demo.commandPalette.open"),
      ],
    },
    {
      contract: "command-palette",
      signature: "CommandPalette",
      options: {
        closeLabel: t("kit.close"),
        placeholder: t("kit.search"),
        emptyLabel: t("kit.noResults"),
        label: t("demo.commandPalette.label"),
        paletteId: "demo-cmdk-tree",
        entries: JSON.stringify([
          { label: t("demo.commandPalette.button"), href: "/components/button", section: t("demo.commandPalette.section") },
          { label: t("demo.commandPalette.dialog"), href: "/components/dialog", section: t("demo.commandPalette.section") },
          { label: t("demo.commandPalette.toc"), href: "/components/toc", section: t("demo.commandPalette.section") },
        ]),
      },
    },
  ],
});

/*
 * The dialog is found by `paletteId` rather than a marker attribute: `CommandPalette` (React) takes
 * named props and does not forward unknown ones onto its host, unlike `Button`/`Stack`, which do:
 * the id is the one identifier the contract already guarantees lands on the element either way.
 */
export { default as commandPaletteDemoScript } from "./scripts/command-palette-open.ts?raw";

/** A shortcut supplements a visible, named trigger; it does not replace it. */
export const commandPaletteDoShortcutTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "center" },
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { variant: "solid" },
      children: [
        { contract: "icon", signature: "Icon", options: { name: "search", size: "md" } },
        t("demo.commandPalette.open"),
      ],
    },
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "xs", inlineAlign: "center" },
      children: [
        { contract: "kbd", signature: "Kbd", children: "⌘" },
        { contract: "kbd", signature: "Kbd", children: "K" },
      ],
    },
  ],
});

/** A shortcut by itself is undiscoverable and unavailable to people who cannot use it. */
export const commandPaletteDontShortcutTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "xs", inlineAlign: "center" },
  children: [
    { contract: "kbd", signature: "Kbd", children: "⌘" },
    { contract: "kbd", signature: "Kbd", children: "K" },
  ],
};

/** Frozen result rows: good labels name destinations; bad labels leave several results indistinguishable. */
export const commandPaletteResultsGuideHtml = (t: Translate): { do: string; dont: string } => {
  const panel = (first: string, second: string, contextual: boolean) => `
    <div class="sk-command-palette" style="position:static;display:block;inline-size:100%;max-inline-size:none;margin:0;--sk-command-palette-list-min-block-size:0;--sk-command-palette-list-max-block-size:none;background:var(--color-bg-surface-raised);border:1px solid var(--color-border-subtle);border-radius:var(--radius-surface);box-shadow:var(--elevation-overlay);">
      <div class="sk-command-palette__search">
        ${iconMarkup("search", { size: "md" })}
        <input class="sk-command-palette__input" type="text" placeholder="${t("demo.commandPalette.placeholder")}" readonly />
        ${iconMarkup("close", { size: "md" })}
      </div>
      <ul class="sk-command-palette__list" role="listbox" aria-label="${t("demo.commandPalette.results")}">
        <li class="sk-command-palette__option" role="option" aria-selected="true">
          <span class="sk-command-palette__option-label">${first}</span>
          ${contextual ? `<span class="sk-command-palette__option-context">${t("demo.commandPalette.section")}</span>` : ""}
        </li>
        <li class="sk-command-palette__option" role="option" aria-selected="false">
          <span class="sk-command-palette__option-label">${second}</span>
          ${contextual ? `<span class="sk-command-palette__option-context">${t("demo.commandPalette.section")}</span>` : ""}
        </li>
      </ul>
      <footer class="sk-command-palette__footer"><span><kbd class="sk-kbd">${t("demo.commandPalette.enterKey")}</kbd> ${t("demo.commandPalette.footer")}</span></footer>
    </div>`;
  return {
    do: panel(t("demo.commandPalette.button"), t("demo.commandPalette.dialog"), true),
    dont: panel(t("demo.commandPalette.openGeneric"), t("demo.commandPalette.openGeneric"), false),
  };
};
