import { useState } from "react";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@skryensya/react/button-group";
import { Input } from "@skryensya/react/input";
import { Tooltip } from "@skryensya/react/tooltip";
import type { ReactNode } from "react";
import { Button } from "@skryensya/react/button";
import { Menu } from "@skryensya/react/menu";
import { Select } from "@skryensya/react/select";
import type { MenuItem } from "@skryensya/core/menu";
import { BreakCaseFindings } from "./debug-case-findings";

const DEMO: MenuItem[] = [
  { value: "csv", label: "Export CSV" },
  { value: "pdf", label: "Export PDF" },
];
const WORST: MenuItem[] = [
  {
    value: "full",
    label: "Export complete international billing and security audit history",
  },
  { value: "settings", label: "Benachrichtigungseinstellungen" },
  { value: "legacy", label: "Archived records", disabled: true },
];
const CASES = [
  { label: "Demo", action: "Export", items: DEMO },
  {
    label: "Worst case",
    action: "Export international billing reconciliation",
    items: WORST,
  },
  { label: "Empty menu", action: "Export", items: [] },
  { label: "One alternative", action: "Export", items: [DEMO[0]] },
  { label: "Disabled", action: "Export", items: DEMO, disabled: true },
  {
    label: "Loading",
    action: "Preparing the international audit export",
    items: DEMO,
    loading: true,
  },
];

function SplitCase({ scenario }: { scenario: (typeof CASES)[number] }) {
  const [action, setAction] = useState("No action yet");
  return (
    <section className="break-case">
      <h2 className="break-case__label">ButtonGroup (split): {scenario.label}</h2>
      <BreakCaseFindings component="button-group" label={scenario.label} />
      <div className="break-case__stage">
        <ButtonGroup label={`Export options, ${scenario.label}`}>
          <Button
            tone="accent"
            variant="solid"
            disabled={scenario.disabled}
            loading={scenario.loading}
            onClick={() => setAction("Primary export")}
          >
            {scenario.action}
          </Button>
          <Menu
            label="More export options"
            triggerLabel="More export options"
            triggerTone="accent"
            triggerVariant="solid"
            triggerIconOnly
            // A busy action cannot leave its alternatives reachable.
            disabled={scenario.disabled || scenario.loading}
            items={scenario.items}
            onSelect={({ value }) => setAction(value)}
          />
        </ButtonGroup>
      </div>
      <output className="break-case__note">{action}</output>
    </section>
  );
}

/* Worst-case shapes found by break-ui (2026-10-24), each at 320px: the fixes live in button-group.css. */
const SHAPES: { label: string; node: ReactNode }[] = [
  {
    label: "Long labels, three members",
    node: (
      <ButtonGroup label="Mail actions">
        <Button variant="soft">Archivar todas las conversaciones</Button>
        <Button variant="soft">Benachrichtigungseinstellungen</Button>
        <Button variant="soft">Posponer hasta mañana a las 09:00</Button>
      </ButtonGroup>
    ),
  },
  {
    label: "Long prefix beside a field",
    node: (
      <ButtonGroup>
        <ButtonGroupText>https://northwind-industries-holdings.example.com/</ButtonGroupText>
        <Input aria-label="Path" defaultValue="quarterly-reports/2026" />
      </ButtonGroup>
    ),
  },
  {
    label: "Members wrapped in Tooltip",
    node: (
      <ButtonGroup label="Format">
        {["Bold", "Italic", "Underline"].map((name) => (
          <Tooltip key={name} content={name}>
            <Button variant="soft" iconOnly aria-label={name}>{name[0]}</Button>
          </Tooltip>
        ))}
      </ButtonGroup>
    ),
  },
  {
    label: "Pages past a thousand",
    node: (
      <ButtonGroup label="Pages">
        <ButtonGroup>
          {["1", "…", "1,285", "…", "1,290"].map((page) => <Button key={page} variant="soft">{page}</Button>)}
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="soft" iconOnly aria-label="Previous page">‹</Button>
          <Button variant="soft" iconOnly aria-label="Next page">›</Button>
        </ButtonGroup>
      </ButtonGroup>
    ),
  },
  {
    label: "Separators at both edges",
    node: (
      <ButtonGroup>
        <ButtonGroupSeparator />
        <Button variant="solid">Copy</Button>
        <Button variant="solid">Paste</Button>
        <ButtonGroupSeparator />
      </ButtonGroup>
    ),
  },
  {
    label: "Vertical, a label over an icon",
    node: (
      <ButtonGroup label="Zoom" orientation="vertical">
        <Button variant="soft">Acercar hasta el 400 %</Button>
        <Button variant="soft" iconOnly aria-label="Alejar">−</Button>
      </ButtonGroup>
    ),
  },
];

const LONG = ["Archivar todas las conversaciones", "Benachrichtigungseinstellungen", "Posponer hasta mañana a las 09:00"];
const longButtons = (extra: Record<string, unknown> = {}) =>
  LONG.map((text) => (
    <Button key={text} variant="soft" {...extra}>
      {text}
    </Button>
  ));

/* Round 2 (break-ui, 2026-10-25): what the separator option, the appearances and the auto-inserted separators added since round 1. At 320px unless it says otherwise. */
const SHAPES_SEPARATOR: { label: string; node: ReactNode }[] = [
  { label: "Separator inset (default), long labels", node: <ButtonGroup label="Mail actions">{longButtons()}</ButtonGroup> },
  { label: "Separator full, long labels", node: <ButtonGroup label="Mail actions" separator="full">{longButtons()}</ButtonGroup> },
  {
    label: "Separator none, two solid",
    node: (
      <ButtonGroup label="Clipboard" separator="none">
        <Button variant="solid">Copy</Button>
        <Button variant="solid">Paste</Button>
      </ButtonGroup>
    ),
  },
  {
    label: "Inset with a [hidden] member in the middle",
    node: (
      <ButtonGroup label="Mail actions">
        <Button variant="soft">Archive</Button>
        <Button variant="soft" hidden>Report</Button>
        <Button variant="soft">Snooze</Button>
      </ButtonGroup>
    ),
  },
  {
    label: "Inset with a separator you wrote",
    node: (
      <ButtonGroup label="Mail actions">
        <Button variant="soft">Archive</Button>
        <ButtonGroupSeparator />
        <Button variant="soft">Report</Button>
        <Button variant="soft">Snooze</Button>
      </ButtonGroup>
    ),
  },
  { label: "Inset, one member", node: <ButtonGroup label="Single"><Button variant="soft">Archive</Button></ButtonGroup> },
  { label: "Inset, no members", node: <ButtonGroup label="Empty">{null}</ButtonGroup> },
  {
    label: "Pages, nested groups, default separator",
    node: (
      <ButtonGroup label="Pages">
        <ButtonGroup>
          {["1", "…", "1,285", "…", "1,290"].map((page, i) => <Button key={i} variant="soft">{page}</Button>)}
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="soft" iconOnly aria-label="Previous page">‹</Button>
          <Button variant="soft" iconOnly aria-label="Next page">›</Button>
        </ButtonGroup>
      </ButtonGroup>
    ),
  },
  {
    label: "Inset with a Menu as the last member",
    node: (
      <ButtonGroup label="Export">
        <Button variant="soft">Export international billing reconciliation</Button>
        <Menu label="More" triggerLabel="More export options" triggerVariant="soft" triggerIconOnly items={WORST} />
      </ButtonGroup>
    ),
  },
  {
    label: "Brutalist, inset, long labels",
    node: <ButtonGroup label="Mail actions">{longButtons({ appearance: "brutalist" })}</ButtonGroup>,
  },
  {
    label: "Frosted, inset, long labels",
    node: <ButtonGroup label="Mail actions">{longButtons({ appearance: "frosted" })}</ButtonGroup>,
  },
  {
    label: "Select, field and button",
    node: (
      <ButtonGroup label="Amount">
        <Select aria-label="Currency" defaultValue="chf" options={[{ value: "chf", label: "CHF" }, { value: "usd", label: "USD" }]} />
        <Input aria-label="Amount" defaultValue="1,284,901,250.00" inputMode="decimal" />
        <Button variant="solid" tone="accent">Send</Button>
      </ButtonGroup>
    ),
  },
  {
    label: "RTL, long labels",
    node: (
      <ButtonGroup label="البريد" dir="rtl">
        {["أرشفة جميع المحادثات الواردة", "إعدادات الإشعارات", "تأجيل حتى الغد في التاسعة"].map((text) => <Button key={text} variant="soft">{text}</Button>)}
      </ButtonGroup>
    ),
  },
  {
    label: "Vertical, inset, long labels",
    node: <ButtonGroup label="Mail actions" orientation="vertical">{longButtons()}</ButtonGroup>,
  },
  {
    label: "Twelve icon members (a formatting bar)",
    node: (
      <ButtonGroup label="Format">
        {["B", "I", "U", "S", "H1", "H2", "“", "•", "1.", "</>", "↶", "↷"].map((mark) => (
          <Button key={mark} variant="soft" iconOnly aria-label={`Format ${mark}`}>{mark}</Button>
        ))}
      </ButtonGroup>
    ),
  },
  {
    label: "First and last member disabled",
    node: (
      <ButtonGroup label="Mail actions">
        <Button variant="soft" disabled>Archive</Button>
        <Button variant="soft">Report</Button>
        <Button variant="soft" disabled>Snooze</Button>
      </ButtonGroup>
    ),
  },
];

export function ButtonGroupBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: ButtonGroup</h1>
        <p className="break-intro">
          Split buttons with long labels, an empty menu, a single alternative,
          loading and disabled states, then the group's own worst shapes at 320px.
          Outputs show which action ran; no network request is made.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map((scenario) => (
          <SplitCase key={scenario.label} scenario={scenario} />
        ))}
        {[...SHAPES, ...SHAPES_SEPARATOR].map((shape) => (
          <section key={shape.label} className="break-case" data-break-shape={shape.label}>
            <h2 className="break-case__label">ButtonGroup: {shape.label}</h2>
            <BreakCaseFindings component="button-group" label={shape.label} />
            <div className="break-case__stage" style={{ inlineSize: 320 }}>{shape.node}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
