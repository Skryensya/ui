import type { ReactNode } from "react";
import { FormField } from "@skryensya/react/form-field";
import { Input, NativeInput, Textarea } from "@skryensya/react/input";

const DEMO = {
  email: "jane@example.com",
  emailLabel: "Work email",
  emailHint: "Used for account updates.",
  note: "Please let me know when the release is scheduled.",
  dateLabel: "Start date",
};

const WORST = {
  email: "bartholomew.fitzgerald+notifications@northwind-industries-holdings.example.com",
  emailLabel: "Primary billing and security contact email for International Northwind Holdings",
  emailHint: "Use the address monitored by the billing and security teams; account notices and invoice corrections are sent here.",
  note: `After the September invoice was issued, I noticed that the billing contact and the security contact had both reverted to the address used when we first created the workspace. We updated the billing contact in the settings page, saved the change, and received the confirmation message, but the next invoice still went to the old address. The security notifications appear to have the same problem.\n\nThis affects our finance team because the invoice is reviewed by a different person from the one who manages access. We have checked the workspace settings in two browsers, signed out and back in, and asked another administrator to confirm the saved values. The page shows the new address each time, but the generated invoice and the security email continue to use the previous contact.\n\nCould you confirm whether these two contact fields are stored separately and whether there is another setting that controls the destination? I can provide the invoice number and a screen recording if that helps. The issue started after the September update and is reproducible for our organization.`,
  dateLabel: "Date the billing contact change should take effect",
};

const DATASETS = [
  { key: "demo", label: "Demo data", data: DEMO },
  { key: "worst", label: "Worst case", data: WORST },
] as const;

function Case({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="break-case">
      <h3 className="break-case__label">{label}</h3>
      <div className="break-case__stage">{children}</div>
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

function DataPair({ render }: { render: (dataset: (typeof DATASETS)[number]) => ReactNode }) {
  return (
    <div className="break-data-pair">
      {DATASETS.map((dataset) => (
        <div key={dataset.key} className="break-data-pair__item">
          <h4 className="break-data-pair__label">{dataset.label}</h4>
          {render(dataset)}
        </div>
      ))}
    </div>
  );
}

export function InputBreak() {
  return (
    <>
      <Group title="Single-line input">
        <Case label="Email value, long label, and hint">
          <DataPair
            render={({ key, data }) => (
              <FormField
                id={`break-email-${key}`}
                label={data.emailLabel}
                hint={data.emailHint}
                required
                className="break-form"
              >
                <Input type="email" defaultValue={data.email} autoComplete="email" />
              </FormField>
            )}
          />
        </Case>
      </Group>
      <Group title="Multiline and native input">
        <Case label="Pasted support description, autoSize">
          <DataPair
            render={({ key, data }) => (
              <FormField
                id={`break-note-${key}`}
                label="Describe the issue"
                hint="Include what happened and what you expected."
                className="break-form"
              >
                <Textarea autoSize defaultValue={data.note} />
              </FormField>
            )}
          />
        </Case>
        <Case label="Native date control and long label">
          <DataPair
            render={({ key, data }) => (
              <FormField id={`break-date-${key}`} label={data.dateLabel} className="break-form">
                <NativeInput type="date" defaultValue="2025-09-14" />
              </FormField>
            )}
          />
        </Case>
      </Group>
    </>
  );
}
