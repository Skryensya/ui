import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { messageDemoRules } from "./message-css";

/*
 * THE MESSAGE EXAMPLES, as usage trees. The rows are the contract's own parts; what they hold (a bubble,
 * the typing dots, a reaction) is app surface the contract deliberately does not own, so each is a plain
 * `Text`/`Box` with a class from `messageDemoCss`. That CSS goes to the page (Do/Don't halves and inline
 * previews live in it) and to every framed preview through `css`.
 */
export const messageDemoCss = messageDemoRules;

type Node = UsageTree;

const avatar = (initials: string, name: string): Node => ({
  contract: "message",
  signature: "MessageAvatar",
  children: [{ contract: "avatar", signature: "Avatar.initials", options: { name, size: "md" }, children: initials }],
});

const bubble = (text: string, accent = false): Node => ({
  contract: "typography",
  signature: "Text",
  attrs: { class: accent ? "message-demo__bubble message-demo__bubble--accent" : "message-demo__bubble" },
  children: text,
});

const header = (text: string): Node => ({ contract: "message", signature: "MessageHeader", children: text });
const footer = (text: string): Node => ({ contract: "message", signature: "MessageFooter", children: text });

const row = (options: { align: "start" | "end"; avatar: Node; content: readonly Node[]; attrs?: Record<string, string> }): Node => ({
  contract: "message",
  signature: "Message",
  options: { align: options.align },
  ...(options.attrs ? { attrs: options.attrs } : {}),
  children: [options.avatar, { contract: "message", signature: "MessageContent", children: [...options.content] }],
});

const received = (t: Translate, extra: readonly Node[] = [], before: readonly Node[] = []): Node =>
  row({ align: "start", avatar: avatar("R", "Robin"), content: [...before, bubble(t("messagePage.demo.sampleReceived")), ...extra] });

/** The property card for `align`: a received message, one option away from being a sent one. */
export const messagePlaygroundTree = (t: Translate): Node => received(t, [footer("14:32")], [header("Robin")]);

/** The metadata card's four trees: what sits around the bubble. */
export const messageMetadataVariants = (t: Translate): { value: string; label: string; tree: Node; explain: string }[] => [
  { value: "none", label: t("messagePage.prop.metadata.noneLabel"), tree: received(t), explain: t("messagePage.prop.metadata.none") },
  { value: "header", label: t("messagePage.prop.metadata.headerLabel"), tree: received(t, [], [header("Robin")]), explain: t("messagePage.prop.metadata.header") },
  { value: "footer", label: t("messagePage.prop.metadata.footerLabel"), tree: received(t, [footer(t("messagePage.demo.delivered"))]), explain: t("messagePage.prop.metadata.footer") },
  {
    value: "both",
    label: t("messagePage.prop.metadata.bothLabel"),
    tree: received(t, [footer(t("messagePage.demo.delivered"))], [header("Robin")]),
    explain: t("messagePage.prop.metadata.both"),
  },
];

/** The avatar card's trees: how a run of messages from one person carries its avatar. */
export const messageGroupVariants = (t: Translate): { value: string; label: string; tree: Node; explain: string }[] => {
  const line = (text: string, withAvatar: boolean): Node =>
    row({
      align: "start",
      avatar: withAvatar ? avatar("R", "Robin") : { contract: "message", signature: "MessageAvatar" },
      content: [bubble(text)],
    });
  const stack = (children: Node[]): Node => ({ contract: "message", signature: "MessageGroup", children });
  return [
    {
      value: "last",
      label: t("messagePage.prop.group.lastLabel"),
      tree: stack([line(t("messagePage.demo.first"), true), line(t("messagePage.demo.second"), false)]),
      explain: t("messagePage.prop.group.last"),
    },
    {
      value: "each",
      label: t("messagePage.prop.group.eachLabel"),
      tree: stack([line(t("messagePage.demo.first"), true), line(t("messagePage.demo.second"), true)]),
      explain: t("messagePage.prop.group.each"),
    },
  ];
};

/** A typing indicator: a temporary status row on the author's side. Three dots, one `status` region. */
export const messageWritingTree = (t: Translate): Node => ({
  contract: "message",
  signature: "Message",
  options: { align: "start" },
  children: [
    avatar("R", "Robin"),
    {
      contract: "message",
      signature: "MessageContent",
      children: [
        {
          contract: "layout",
          signature: "Inline",
          attrs: { class: "message-demo__typing", role: "status", "aria-label": t("messagePage.writingLabel") },
          children: [1, 2, 3].map(() => ({ contract: "typography", signature: "Text", children: "●" })),
        },
      ],
    },
  ],
});

/** A reaction pinned to the surface as metadata, with its own accessible name. */
export const messageReactionTree = (t: Translate): Node =>
  row({
    align: "start",
    avatar: avatar("R", "Robin"),
    content: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "none" },
        attrs: { class: "message-demo__surface" },
        children: [
          bubble(t("messagePage.demo.reacted")),
          { contract: "typography", signature: "Text", attrs: { class: "message-demo__reaction", "aria-label": t("messagePage.reactionLabel") }, children: "👍" },
        ],
      },
    ],
  });

const action = (label: string, extra: Record<string, string> = {}): Node => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "ghost", size: "sm" },
  attrs: extra,
  children: label,
});

/**
 * SELECT, THEN ACT: the bar and the context menu both act on the selected message.
 *
 * Selecting is something you DO (click, Enter or Space), never something focus does: moving through the
 * messages with Tab only moves the focus ring. The context menu is a native `popover`, so it sits in the
 * top layer where nothing clips it and light-dismiss, Esc and focus handling come from the platform; the
 * script only says where it opens. Delete is offered on your own messages only.
 */
export const messageActionsTree = (t: Translate): Node => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { "data-message-action-demo": "" },
  children: [
    { contract: "typography", signature: "Text", options: { size: "caption", tone: "tertiary" }, children: t("messagePage.actionsHint") },
    {
      contract: "message",
      signature: "MessageActions",
      attrs: { "data-selected-actions": "", "aria-label": t("messagePage.actionsLabel"), hidden: "" },
      children: [
        action(t("messagePage.action.copy")),
        action(t("messagePage.action.react")),
        action(t("messagePage.action.delete"), { "data-owned-only": "" }),
      ],
    },
    row({
      align: "start",
      avatar: avatar("R", "Robin"),
      content: [bubble(t("messagePage.demo.question"))],
      attrs: { "data-message-context-target": "", "data-owned": "false", tabindex: "0", "aria-label": t("messagePage.demo.question") },
    }),
    row({
      align: "end",
      avatar: avatar("ME", "Me"),
      content: [bubble(t("messagePage.demo.answer"), true)],
      attrs: { "data-message-context-target": "", "data-owned": "true", tabindex: "0", "aria-label": t("messagePage.demo.answer") },
    }),
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { class: "message-demo__context-menu", role: "menu", popover: "auto", "data-message-context-menu": "", "aria-label": t("messagePage.actionsLabel") },
      children: [
        action(t("messagePage.action.copy"), { "data-menuitem": "" }),
        action(t("messagePage.action.react"), { "data-menuitem": "" }),
        action(t("messagePage.action.delete"), { "data-menuitem": "", "data-owned-only": "" }),
      ],
    },
  ],
});

/*
 * The demo's behaviour, run inside the stage for both bindings (it drives the DOM, never a binding).
 * Plain JavaScript: the frame has no compiler.
 */
export const messageActionsScript = `
const root = document.querySelector("[data-message-action-demo]");
if (root) {
  const bar = root.querySelector("[data-selected-actions]");
  const menu = root.querySelector("[data-message-context-menu]");
  const rows = Array.from(root.querySelectorAll("[data-message-context-target]"));
  menu.querySelectorAll("[data-menuitem]").forEach((item) => item.setAttribute("role", "menuitem"));
  const items = () => Array.from(menu.querySelectorAll("[data-menuitem]")).filter((item) => !item.hidden);
  let selected = null;

  const setOwned = (owned) => {
    root.querySelectorAll("[data-owned-only]").forEach((node) => { node.hidden = !owned; });
  };
  const select = (row) => {
    selected = row;
    rows.forEach((item) => item.toggleAttribute("data-selected", item === row));
    if (row) setOwned(row.getAttribute("data-owned") === "true");
    if (bar) bar.hidden = !row;
  };
  const open = (row, x, y) => {
    select(row);
    menu.showPopover();
    const box = menu.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(x, window.innerWidth - box.width - 8)) + "px";
    menu.style.top = Math.max(8, Math.min(y, window.innerHeight - box.height - 8)) + "px";
    const first = items()[0];
    if (first) first.focus();
  };

  rows.forEach((row) => {
    row.addEventListener("click", () => select(row));
    row.addEventListener("keydown", (event) => {
      if (event.target !== row) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(row);
      } else if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) {
        event.preventDefault();
        const box = row.getBoundingClientRect();
        open(row, box.left + 24, box.bottom - 8);
      } else if (event.key === "Escape") {
        select(null);
      }
    });
    row.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      open(row, event.clientX, event.clientY);
    });
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("[data-menuitem]")) menu.hidePopover();
  });
  menu.addEventListener("keydown", (event) => {
    const list = items();
    const index = list.indexOf(document.activeElement);
    if (event.key === "ArrowDown") { event.preventDefault(); list[(index + 1) % list.length].focus(); }
    if (event.key === "ArrowUp") { event.preventDefault(); list[(index - 1 + list.length) % list.length].focus(); }
  });
  /* Closing returns focus to the message it was opened on, so the keyboard does not lose its place. */
  menu.addEventListener("toggle", (event) => {
    if (event.newState === "closed" && selected) selected.focus();
  });
  root.addEventListener("click", (event) => {
    if (!event.target.closest("[data-message-context-target], [data-selected-actions], [data-message-context-menu]")) select(null);
  });
}
`;
