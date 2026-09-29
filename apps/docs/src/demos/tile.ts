import { PLACEHOLDER_HREF } from "../lib/placeholder-hrefs";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import { frostStage } from "../lib/frost-stage";

/*
 * Tile's own demos. Peer pages (Link, Button, Checkbox, …) keep the trees that teach their
 * semantic contract; this file owns the ones that teach Tile as a pattern: shared title/description
 * anatomy, ExpandableTile as itself, and thin wrappers so TilePage can localize copy that the peer
 * demos leave in English.
 */

export { tileCheckboxTree } from "./checkbox";
export { tileSwitchTree } from "./switch";
export { tileRadioGroupTree } from "./radio-group";

const tileContent = (title: string, description: string): UsageTree => ({
  contract: "tile",
  signature: "TileContent",
  slots: { title, description },
});

/** Navigate: the whole face is an `<a href>`. */
export const tileLinkDemoTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "tile",
  signature: "TileLink",
  options: { href },
  children: tileContent(t("demo.tile.link.title"), t("demo.tile.link.description")),
});

/** Act: the whole face is a `<button type="button">`. */
export const tileButtonDemoTree = (t: Translate): UsageTree => ({
  contract: "tile",
  signature: "TileButton",
  children: tileContent(t("demo.tile.button.title"), t("demo.tile.button.description")),
});

/*
 * ONE ExpandableTile, open by default so `sk-tile__expandable-content` exists on screen. Accordion
 * coordinates several of these; this demo is the leaf itself. TileContent + TileChevron inside the
 * trigger is the same composition Accordion.Trigger uses.
 */
export const expandableTileTree = (t: Translate): UsageTree => ({
  contract: "tile",
  signature: "ExpandableTile",
  options: { defaultOpen: true },
  children: [
    {
      contract: "tile",
      signature: "ExpandableTileTrigger",
      children: [
        tileContent(t("demo.tile.expandable.title"), t("demo.tile.expandable.description")),
        { contract: "tile", signature: "TileChevron" },
      ],
    },
    {
      contract: "tile",
      signature: "ExpandableTileContent",
      children: t("demo.tile.expandable.body"),
    },
  ],
});

/*
 * ExpandableTile open: trigger, content cluster, chevron and panel. Title and description go
 * outside (offset) so the ring does not strike through the glyphs; the panel and chevron keep inset.
 */
export const tileAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("tilePage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: expandableTileTree(t),
    items: [
      namePart(".sk-tile", "block-start", { mark: "bracket" }),
      namePart(".sk-tile__trigger", "inline-start"),
      namePart(".sk-tile__content", "inline-start", { ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-tile__title", "inline-end", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-tile__description", "inline-end", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-tile__chevron", "inline-end"),
      namePart(".sk-tile__expandable-content", "block-end"),
    ],
  },
});

/*
 * One act and one choice per appearance, side by side. The checkbox starts checked so the selected
 * paint is on screen: selection colours the construction and never presses it. Each column is its
 * own Stack, so a narrow screen collapses the grid into three whole columns, not a scatter of cells.
 */
const TILE_APPEARANCES = ["plain", "tactile", "brutalist", "frosted"] as const;

export const tileAppearanceTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "4", gap: "lg", responsive: true },
  children: TILE_APPEARANCES.map((appearance) => ({
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      {
        contract: "typography",
        signature: "Text",
        options: { size: "caption", tone: "secondary", weight: "label" },
        children: appearance,
      },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        attrs: appearance === "frosted" ? { style: frostStage } : undefined,
        children: [
          {
            contract: "tile",
            signature: "TileButton",
            options: { appearance },
            children: tileContent(t("demo.tile.button.title"), t("demo.tile.button.description")),
          },
          {
            contract: "tile",
            signature: "TileCheckbox",
            options: { appearance, name: `tile-appearance-${appearance}`, value: "alerts", defaultChecked: true },
            children: tileContent(t("demo.tile.appearance.checkTitle"), t("demo.tile.appearance.checkDescription")),
          },
        ],
      },
    ],
  })),
});

/* ── THE PAGE'S OWN GALLERY ────────────────────────────────────────────────────────────────────
 * One section per kind, each showing the case it exists for rather than a single lonely tile: a
 * reader learns what a TileLink is FOR by seeing three destinations side by side, not one. */

const caption = (text: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "caption", tone: "secondary", weight: "label" },
  children: text,
});

/** Navigate: a hub of destinations, the most common place a TileLink lives. */
export const tileLinkGridTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", responsive: true },
  children: (["guides", "api", "changelog"] as const).map((key) => ({
    contract: "tile",
    signature: "TileLink",
    options: { href },
    children: tileContent(t(`demo.tile.hub.${key}.title`), t(`demo.tile.hub.${key}.description`)),
  })),
});

/*
 * Act: each tile runs one thing. The third is disabled and SAYS why in its own description, because
 * a greyed-out card with no reason is a dead end the reader cannot get out of.
 */
export const tileButtonGroupTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", responsive: true },
  children: [
    {
      contract: "tile",
      signature: "TileButton",
      children: tileContent(t("demo.tile.button.title"), t("demo.tile.button.description")),
    },
    {
      contract: "tile",
      signature: "TileButton",
      children: tileContent(t("demo.tile.actions.duplicate.title"), t("demo.tile.actions.duplicate.description")),
    },
    {
      contract: "tile",
      signature: "TileButton",
      options: { disabled: true },
      children: tileContent(t("demo.tile.actions.archive.title"), t("demo.tile.actions.archive.description")),
    },
  ],
});

/*
 * THE LINE BETWEEN TILE AND BOX, drawn with the same content twice. One destination: the whole card
 * is the link. Two actions: the card is a Box and the actions are sibling Buttons, because a control
 * nested inside a control is unreachable by keyboard and announced wrong by a screen reader.
 */
export const tileVersusBoxTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "lg", responsive: true },
  children: [
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        caption(t("demo.tile.versus.oneCaption")),
        {
          contract: "tile",
          signature: "TileLink",
          options: { href },
          children: tileContent(t("demo.tile.versus.title"), t("demo.tile.versus.description")),
        },
      ],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        caption(t("demo.tile.versus.twoCaption")),
        {
          contract: "box",
          signature: "Box",
          options: { padding: "md", surface: "surface", border: "subtle" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "sm" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h5", headingElement: "h4", flush: true },
                children: t("demo.tile.versus.title"),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "sm", tone: "secondary" },
                children: t("demo.tile.versus.description"),
              },
              {
                contract: "layout",
                signature: "Inline",
                options: { gap: "sm" },
                children: [
                  {
                    contract: "button",
                    signature: "Button.navigation",
                    options: { href, size: "sm", variant: "soft" },
                    children: t("demo.tile.versus.open"),
                  },
                  {
                    contract: "button",
                    signature: "Button.action",
                    options: { size: "sm", variant: "ghost" },
                    children: t("demo.tile.versus.archive"),
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
});

/** Inset is a scale, not a number: the same tile at four steps of Box's own padding vocabulary. */
export const tilePaddingTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "4", gap: "md", responsive: true },
  children: (["xs", "sm", "md", "lg"] as const).map((padding) => ({
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      caption(padding === "md" ? t("demo.tile.padding.mdDefault") : padding),
      {
        contract: "tile",
        signature: "TileButton",
        options: { padding },
        children: tileContent(t("demo.tile.button.title"), t("demo.tile.button.description")),
      },
    ],
  })),
});
