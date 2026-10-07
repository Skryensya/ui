import type { Snippet } from "../snippet.js";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { appShell, avatar, box, button, field, heading, icon, iconButton, inline, main, navGroup, navLink, navList, skipLink, stack, text, railDrawer, railTrigger } from "./kit.js";

const bubble = (body: string, mine = false): UsageTree =>
  box(text(body), { padding: "md", surface: mine ? "raised" : "sunken", border: mine ? "default" : "none" });

const line = (who: string, time: string, body: string, mine = false): UsageTree => ({
  contract: "message",
  signature: "Message",
  options: { align: mine ? "end" : "start" },
  children: [
    { contract: "message", signature: "MessageAvatar", children: avatar(who) },
    {
      contract: "message",
      signature: "MessageContent",
      children: [
        { contract: "message", signature: "MessageHeader", children: mine ? "You" : who },
        bubble(body, mine),
        { contract: "message", signature: "MessageFooter", children: time },
      ],
    },
  ],
});

/*
 * PATTERN: a team chat (the shape Slack, Teams and Discord share): channels in a rail, the conversation,
 * and a composer pinned under it.
 */
/* One navigation, two places: the rail on a wide screen, the drawer on a phone. */
const navigation = navList("Channels", [
            navGroup([navLink("general", "#general", true), navLink("design", "#design", false, { trailing: "2" }), navLink("releases", "#releases")], "Channels"),
            navGroup([navLink("Priya Nair", "#priya"), navLink("Marcus Webb", "#marcus")], "Direct messages"),
          ]);

export const chatPattern: Snippet = {
  id: "page-chat",
  level: "page",
  intent: "A team chat: a rail of channels, the conversation as a log, and a composer under it.",
  notes: [
    "Pattern: rail, log, composer. The conversation is a log that grows at the bottom, and the composer is the one control that never moves; the rail names where you are with the current channel.",
    "Accessibility, kept over style: the channel name is the page's h1; each message states who and when as text (the header and footer), so the thread reads without the avatars; your own messages say `You`, not just an alignment; the composer field has a visible label and the send button names its action; the rail is a named `nav` and marks the current channel with `aria-current`.",
    "What the pattern does not do: no placeholder-as-label in the composer, and no icon-only send button (the verb is the label).",
  ],
  tree: appShell([
    skipLink("Skip to the conversation"),
    {
      contract: "sidebar",
      signature: "Sidebar",
      options: { landmarkLabel: "Workspace" },
      children: [
        {
          contract: "sidebar",
          signature: "SidebarHeader",
          children: [
            text("Northwind", { weight: "emphasis" }),
            { contract: "sidebar", signature: "SidebarTrigger", options: { label: "Collapse the sidebar" }, slots: { icon: icon("chevron-left") } },
          ],
        },
        {
          contract: "sidebar",
          signature: "SidebarContent",
          children: navigation,
        },
      ],
    },
    main(
      box(
        stack(
          [
            inline([railTrigger("channels-drawer", "Channels"), heading("general", "h1", "h1"), iconButton("info", "Channel details")], { gap: "sm", inlineAlign: "center", justify: "between" }),
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "md" },
              attrs: { role: "log", "aria-label": "Conversation in general" },
              children: [
                line("Priya Nair", "9:40", "The release candidate is up. Can someone check the keyboard flow?"),
                line("Helena Park", "9:42", "On it. I will start with the dialog.", true),
                line("Marcus Webb", "9:45", "I tested the table on Safari, all fine."),
              ],
            },
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm" },
              children: [
                field("Message", { contract: "input", signature: "Textarea", options: { name: "message", placeholder: "Write to #general" } }),
                inline([button("Send message", { tone: "accent" })], { justify: "end" }),
              ],
            },
          ],
          { gap: "lg" },
        ),
        { padding: "lg" },
      ),
    ),
    railDrawer("channels-drawer", "Channels", navigation),
  ], { scroll: "regions" }),
};
