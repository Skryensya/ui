import { BreakCaseFindings } from "./debug-case-findings";
import {
  Message,
  MessageGroup,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
  MessageActions,
} from "@skryensya/react/message";
import { Avatar } from "@skryensya/react/avatar";
import { Button } from "@skryensya/react/button";

const CASES = [
  {
    label: "Demo",
    name: "Sam Lee",
    text: "The release checklist is ready for review.",
    footer: "10:42",
    align: "start" as const,
  },
  {
    label: "Worst case",
    name: "Aleksandra Wiśniewska-Kowalczyk",
    text: "Please contact bartholomew.fitzgerald@northwind-industries-holdings.example.com and review https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved before approval.",
    footer: "Edited · September 18, 2026 at 10:42 UTC",
    align: "start" as const,
  },
  {
    label: "Outgoing",
    name: "Jo",
    text: "Paramètres de confidentialité et de sécurité · 王秀英 产品团队",
    footer: "Delivered",
    align: "end" as const,
  },
  {
    label: "Missing metadata",
    name: "J",
    text: "<script>alert(1)</script> &amp; **bold**",
    footer: "",
    align: "start" as const,
  },
];

export function MessageBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Message</h1>
        <p className="break-intro">
          Incoming/outgoing messages, long contacts, mixed scripts and absent
          metadata; avatar, body and actions use the real composition.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, name, text, footer, align }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Message - {label}</h2>
            <BreakCaseFindings component="message" label={label} />
            <div className="break-case__stage">
              <div style={{ inlineSize: "100%" }}>
                <MessageGroup>
                  <Message align={align}>
                    <MessageAvatar>
                      <Avatar name={name} />
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>{name}</MessageHeader>
                      <p>{text}</p>
                      {footer ? <MessageFooter>{footer}</MessageFooter> : null}
                      <MessageActions>
                        <Button variant="ghost" size="sm">
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm">
                          Copy message
                        </Button>
                      </MessageActions>
                    </MessageContent>
                  </Message>
                </MessageGroup>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
