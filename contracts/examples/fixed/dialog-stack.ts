import type { UsageTree } from "@skryensya/core/usage-tree";

export function dialogStackTree(labels = {
  open: "Set up workspace", titles: ["Name your workspace", "Invite your team", "Ready to start"],
  descriptions: ["Choose a name your team will recognize.", "Invitations can be sent after setup too.", "Your workspace is ready. You can revisit its settings later."],
  next: "Next", previous: "Back", close: "Finish", cancel: "Cancel",
}, defaultOpen = false): UsageTree {
  const node = (signature: string, children?: UsageTree["children"]): UsageTree => ({ contract: "dialog-stack", signature, ...(children === undefined ? {} : { children }) });
  return {
    contract: "dialog-stack", signature: "DialogStack", options: { defaultOpen },
    children: [
      node("DialogStackTrigger", labels.open),
      node("DialogStackOverlay"),
      node("DialogStackBody", labels.titles.map((title, index) => node("DialogStackContent", [
        node("DialogStackHeader", [node("DialogStackTitle", title), node("DialogStackDescription", labels.descriptions[index])]),
        node("DialogStackFooter", [
          ...(index > 0 ? [node("DialogStackPrevious", labels.previous)] : []),
          ...(index < labels.titles.length - 1 ? [node("DialogStackClose", labels.cancel)] : []),
          index < labels.titles.length - 1 ? node("DialogStackNext", labels.next) : node("DialogStackClose", labels.close),
        ]),
      ]))),
    ],
  };
}
