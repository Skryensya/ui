import type { Snippet } from "../snippet.js";
import { appShell, avatar, badge, box, heading, icon, inline, main, navbar, navGroup, navLink, navList, skipLink, stack, text, button, iconButton, railDrawer, railTrigger } from "./kit.js";

/*
 * PATTERN: a mail client (the master-detail shape Gmail, Outlook and Fastmail share): folders, a list of
 * messages, and the message being read.
 */
/* One navigation, two places: the rail on a wide screen, the drawer on a phone. */
const navigation = navList("Folders", [
            navGroup([navLink("Inbox", "#inbox", true, { trailing: "3" }), navLink("Starred", "#starred"), navLink("Sent", "#sent"), navLink("Archive", "#archive")]),
          ]);

export const inboxPattern: Snippet = {
  id: "page-inbox",
  level: "page",
  intent: "An inbox: folders on the left, the message list in the middle, the open message on the right.",
  notes: [
    "Pattern: master-detail mail. Three regions with three jobs, in reading order: where am I (folders), what is there (the list) and the thing itself (the message). The list is a real `List` of links, so each row is one focus stop with one accessible name, not a div with a click handler.",
    "Accessibility, kept over style: three landmarks with three different names (the folders `nav`, the list region, the message `article`); the open message has an h1 because it is the page's subject; unread is stated as a word (`Unread`) inside the row, never by weight or colour alone; the current folder and the current message use `aria-current`; the toolbar over the message is a `Toolbar` with a label, so arrow keys move inside it and Tab leaves it.",
    "What the pattern does not do: no hover-only actions on the rows (an action that appears on hover does not exist for a keyboard or a touch screen); archive and delete live in the message toolbar, where they are always reachable.",
  ],
  tree: appShell([
    skipLink("Skip to the message"),
    navbar("Postbox", [railTrigger("folders-drawer", "Folders"), iconButton("search", "Search mail"), avatar("Helena Park")]),
    {
      contract: "sidebar",
      signature: "Sidebar",
      options: { landmarkLabel: "Folders" },
      children: [
        { contract: "sidebar", signature: "SidebarHeader", children: [text("Mail", { weight: "emphasis" }), { contract: "sidebar", signature: "SidebarTrigger", options: { label: "Collapse the folders" }, slots: { icon: icon("chevron-left") } }] },
        {
          contract: "sidebar",
          signature: "SidebarContent",
          children: navigation,
        },
      ],
    },
    main(
      box(
        inline(
          [
            {
              contract: "box",
              signature: "Box",
              options: { padding: "md", boxElement: "section", border: "subtle", measure: "sm" },
              attrs: { "aria-labelledby": "list-title", "data-sizing": "fit" },
              children: stack(
                [
                  { ...heading("Inbox", "h2", "h2"), attrs: { id: "list-title" } },
                  {
                    contract: "list",
                    signature: "List",
                    options: { dividers: true },
                    children: [
                      mail("Priya Nair", "Design review moved to Thursday", "Can we meet at 10 instead?", "9:41", true, true),
                      mail("Build bot", "Deploy succeeded", "widgets 2.4.0 is live.", "8:02", true, false),
                      mail("Marcus Webb", "Re: Quarterly plan", "Thanks, that works for me.", "Yesterday", false, false),
                    ],
                  },
                ],
                { gap: "sm" },
              ),
            },
            {
              contract: "box",
              signature: "Box",
              options: { padding: "lg", boxElement: "article" },
              attrs: { "aria-labelledby": "mail-title", "data-sizing": "fill" },
              children: stack(
                [
                  {
                    contract: "toolbar",
                    signature: "Toolbar",
                    options: { label: "Message actions" },
                    children: [iconButton("check", "Archive"), iconButton("delete", "Delete"), iconButton("more", "More actions")],
                  },
                  { ...heading("Design review moved to Thursday", "h1", "h1"), attrs: { id: "mail-title" } },
                  inline([avatar("Priya Nair"), stack([text("Priya Nair", { weight: "emphasis" }), text("to me · 9:41", { size: "sm", tone: "secondary" })], { gap: "none" })], { gap: "sm", inlineAlign: "center" }),
                  text("Hi Helena, the room we had is taken on Wednesday. Can we meet at 10 on Thursday instead? Same agenda, and I will bring the updated mocks."),
                  inline([button("Reply", { tone: "accent" }), button("Forward", { variant: "soft" })], { gap: "sm" }),
                ],
                { gap: "md" },
              ),
            },
          ],
          { gap: "md", wrap: false, inlineAlign: "start" },
        ),
        { padding: "md" },
      ),
    ),
    railDrawer("folders-drawer", "Folders", navigation),
  ], { scroll: "regions" }),
};

function mail(from: string, subject: string, preview: string, time: string, unread: boolean, current: boolean) {
  return {
    contract: "list",
    signature: "ListItemLink",
    options: { href: "#message" },
    ...(current ? { attrs: { "aria-current": "page" } } : {}),
    slots: {
      leading: avatar(from),
      title: subject,
      description: `${from} · ${time}: ${preview}`,
      ...(unread ? { trailing: badge("Unread", "accent") } : {}),
    },
  };
}
