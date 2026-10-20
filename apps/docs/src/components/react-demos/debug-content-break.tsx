import type { ReactNode } from "react";
import { Code, Heading, Link, Output, Strong, Text } from "@skryensya/react/typography";

const DEMO = {
  heading: "Account settings",
  body: "Change your display name and preferences.",
  href: "/settings/profile",
  link: "Manage settings",
  rtl: "مرحبا بالعالم",
  short: "Jo",
  strong: "available in Team",
  code: "--color-accent",
  output: "€14.50",
};

const WORST = {
  heading: "Benachrichtigungseinstellungen",
  body: "Senior Product Design Engineer, Platform Infrastructure — Đặng Thị Ngọc Hân · bartholomew.fitzgerald@northwind-industries-holdings.example.com",
  href: "/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved",
  link: "https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved",
  rtl: "نور الهدى عبد الرحمن",
  short: "J",
  strong: "Aleksandra Wiśniewska-Kowalczyk",
  code: "--feature-flag-checkout-payment-provider-backoff-policy",
  output: "12.345.678,90 €",
};

const DATASETS = [
  { key: "demo", label: "Demo data", data: DEMO },
  { key: "worst", label: "Worst case", data: WORST },
] as const;

function Case({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="break-case">
      <h3 className="break-case__label">{label}</h3>
      {children}
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-group" data-toc-transparent>
      <h2 className="break-group__title">{title}</h2>
      {children}
    </section>
  );
}

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="break-case__stage">
      <div className="content-break__narrow">{children}</div>
    </div>
  );
}

function DataPair({ render }: { render: (data: (typeof DATASETS)[number]["data"]) => ReactNode }) {
  return (
    <div className="break-data-pair">
      {DATASETS.map((dataset) => (
        <div key={dataset.key} className="break-data-pair__item">
          <h4 className="break-data-pair__label">{dataset.label}</h4>
          <Stage>{render(dataset.data)}</Stage>
        </div>
      ))}
    </div>
  );
}

export function ContentBreak() {
  return (
    <>
      <Group title="Copy and headings">
        <Case label="Heading and body in a 320px container">
          <DataPair
            render={(data) => (
              <>
                <Heading size="h3">{data.heading}</Heading>
                <Text>{data.body}</Text>
              </>
            )}
          />
        </Case>
        <Case label="Inline link with a long destination label">
          <DataPair render={(data) => (
            <Text>
              Open <Link href={data.href}>{data.link}</Link> to continue.
            </Text>
          )} />
        </Case>
        <Case label="RTL content in a narrow container">
          <DataPair render={(data) => (
            <div dir="rtl">
              <Heading size="h3">{data.rtl}</Heading>
              <Text>
                <Link href={data.href}>{data.link}</Link>
              </Text>
            </div>
          )} />
        </Case>
        <Case label="Short text and link labels">
          <DataPair
            render={(data) => (
              <>
                <Heading size="h3">{data.short}</Heading>
                <Link href={data.href}>{data.short}</Link>
              </>
            )}
          />
        </Case>
      </Group>
      <Group title="Inline semantics">
        <Case label="Strong emphasis inside body copy">
          <DataPair render={(data) => (
            <Text>
              Contact <Strong>{data.strong}</Strong> if the request needs attention.
            </Text>
          )} />
        </Case>
        <Case label="Inline code in a sentence">
          <DataPair render={(data) => (
            <Text>
              Set <Code>{data.code}</Code> in the configuration before deploying.
            </Text>
          )} />
        </Case>
        <Case label="Calculated output inside body copy">
          <DataPair render={(data) => (
            <Text>
              Total: <Output>{data.output}</Output>
            </Text>
          )} />
        </Case>
      </Group>
    </>
  );
}
