import type { Snippet } from "../snippet.js";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { appShell, avatar, box, button, field, heading, icon, input, link, main, navGroup, navLink, navList, navbar, skipLink, stack, text, railDrawer, railTrigger } from "./kit.js";

/*
 * PATTERN: an account settings page (what GitHub's settings and the system settings of macOS and iOS share):
 * a list of sections on the left and, on the right, the section's settings as grouped rows.
 */
const preference = (label: string, defaultChecked: boolean): UsageTree => ({
  contract: "switch",
  signature: "Switch",
  options: { name: label.toLowerCase().replace(/\W+/g, "-"), defaultChecked },
  children: label,
});

const section = (id: string, title: string, children: UsageTree[]): UsageTree =>
  box(stack([{ ...heading(title, "h3", "h2"), attrs: { id } }, ...children], { gap: "md" }), { boxElement: "section", padding: "lg", border: "subtle", surface: "raised", radius: "surface" }, { "aria-labelledby": id, id: `${id}-section` });

/* One navigation, two places: the rail on a wide screen, the drawer on a phone. */
const navigation = navList("Settings sections", [
            navGroup([navLink("Profile", "#profile-section", true), navLink("Notifications", "#notifications-section"), navLink("Security", "#security-section"), navLink("Danger zone", "#danger-section")]),
          ]);

export const settingsPattern: Snippet = {
  id: "page-account-settings",
  level: "page",
  intent: "An account settings page: a list of sections beside the settings themselves, each section a named group, with a danger zone last.",
  notes: [
    "Pattern: sections beside settings. The left list says where you are and lets you jump; each section on the right is a group with its own h2, and its settings are rows of one kind each (a form for the profile, switches for notifications, one action for security). Destructive actions are kept in their own section, last, so they cannot be reached by accident while changing something else.",
    "Accessibility, kept over style: each switch carries its label as its own text, so it is announced with what it controls and the whole row is the click target; the section list is a named navigation and marks the current section with `current`; every section is a named region, so a screen reader can list them; the danger action's label ends with an ellipsis to say that a confirmation follows, and the confirmation is where the consequence is repeated (see `dialog`).",
    "Compared with GitHub and macOS: GitHub's settings and System Settings share the left list of sections, the grouped rows and a 'danger zone' kept apart; this pattern keeps all three. It changes two things that those pages leave to the pointer: nothing is applied by hovering or by a gesture, and a changed switch is a control with a text label rather than a coloured track alone, so its state is available as text (on or off) and not only as colour.",
    "What the pattern does not do: no setting that saves on blur with no sign that it did, no switch that needs a second 'apply' to take effect (a switch applies at once; a form has a Save button), and no icon-only danger button. The contract has no `form` element, so a real page wraps the profile fields and its Save button in a `<form>` of its own.",
  ],
  tree: appShell([
    skipLink("Skip to the settings"),
    navbar("Widgets", [railTrigger("settings-drawer", "Settings sections"), avatar("Helena Park")]),
    {
      contract: "sidebar",
      signature: "Sidebar",
      options: { landmarkLabel: "Settings sections" },
      children: [
        { contract: "sidebar", signature: "SidebarHeader", children: [text("Account", { weight: "emphasis" }), { contract: "sidebar", signature: "SidebarTrigger", options: { label: "Collapse the settings sections" }, slots: { icon: icon("chevron-left") } }] },
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
            heading("Settings", "h1", "h1"),
            section("profile", "Profile", [
              field("Display name", { ...input({ type: "text", name: "display-name" }), attrs: { autocomplete: "name" } }),
              field("Email", { ...input({ type: "email", name: "email" }), attrs: { autocomplete: "email" } }, { hint: "Used for sign-in and receipts." }),
              button("Save profile", { variant: "solid", tone: "accent", type: "submit" }),
            ]),
            section("notifications", "Notifications", [
              preference("Email me about new comments", true),
              preference("Email me a weekly summary", false),
              preference("Notify me about security alerts", true),
            ]),
            section("security", "Security", [
              preference("Require a code when I sign in", false),
              text("Last password change: 3 months ago.", { size: "sm", tone: "secondary" }),
              { contract: "button", signature: "Button.navigation", options: { variant: "soft", href: "#change-password" }, children: "Change password" },
            ]),
            section("danger", "Danger zone", [
              text("Deleting your account removes your projects and cannot be undone.", { tone: "secondary" }),
              button("Delete account…", { variant: "soft", tone: "danger" }),
            ]),
          ],
          { gap: "lg" },
        ),
        { padding: "lg" },
      ),
    ),
    railDrawer("settings-drawer", "Settings sections", navigation),
  ]),
};
void link;
