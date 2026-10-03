import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * MESSAGE, one row in a conversation.
 *
 * Message owns the row geometry: which side the message belongs to, where the avatar sits, and where
 * metadata above/below the visible surface aligns. It does not own the surface itself: a Bubble,
 * Box, Card-like composition, attachment preview, or plain content can live in MessageContent.
 */
export const messageParts = {
  root: "sk-message",
  group: "sk-message-group",
  avatar: "sk-message__avatar",
  content: "sk-message__content",
  header: "sk-message__header",
  footer: "sk-message__footer",
  actions: "sk-message__actions",
} as const;

export type MessagePart = keyof typeof messageParts;
export type MessagePartClass = (typeof messageParts)[MessagePart];

export const messageContract = {
  id: "message",
  category: "content",
  css: "@skryensya/core/components/message.css",
  parts: messageParts,
  hooks: [
    "--sk-message-avatar-size",
    "--sk-message-content-gap",
    "--sk-message-footer-offset",
    "--sk-message-gap",
    "--sk-message-lane-size",
    "--sk-message-group-gap",
    "--sk-message-header-fg",
    "--sk-message-header-font-size",
    "--sk-message-footer-fg",
    "--sk-message-footer-font-size",
    "--sk-message-actions-gap",
    "--sk-message-max-inline-size",
  ],
  options: {
    align: { type: "enum", values: ["start", "end"], default: "start", attr: "data-align" },
  },
  signatures: {
    Message: {
      intent: ["conversation-row", "chat-message", "sender-receiver-row"],
      host: { element: "div" },
      options: ["align"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "root", host: true, options: ["align"], slot: "children" },
      react: { from: "@skryensya/react/message", name: "Message" },
    },
    MessageGroup: {
      intent: ["consecutive-messages", "same-sender-message-stack"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "group", host: true, slot: "children" },
      react: { from: "@skryensya/react/message", name: "MessageGroup" },
    },
    MessageAvatar: {
      intent: ["message-avatar-slot", "speaker-avatar"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "node" } },
      template: { element: "div", part: "avatar", host: true, slot: "children" },
      react: { from: "@skryensya/react/message", name: "MessageAvatar" },
    },
    MessageContent: {
      intent: ["message-content-stack", "message-surface-and-metadata"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "content", host: true, slot: "children" },
      react: { from: "@skryensya/react/message", name: "MessageContent" },
    },
    MessageHeader: {
      intent: ["message-sender-name", "message-header-metadata"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "header", host: true, slot: "children" },
      react: { from: "@skryensya/react/message", name: "MessageHeader" },
    },
    MessageFooter: {
      intent: ["message-status", "message-footer-metadata"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "footer", host: true, slot: "children" },
      react: { from: "@skryensya/react/message", name: "MessageFooter" },
    },
    MessageActions: {
      intent: ["message-actions", "copy-react-delete-message"],
      host: { element: "div" },
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "actions", host: true, slot: "children" },
      react: { from: "@skryensya/react/message", name: "MessageActions" },
    },
  },
} as const satisfies ComponentContract;

export type MessageAlign = OptionValue<typeof messageContract.options.align>;
