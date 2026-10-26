import { BreakCaseFindings } from "./debug-case-findings";
import { Button } from "@skryensya/react/button";
import { Tooltip, type TooltipProps } from "@skryensya/react/tooltip";

const SCENARIOS: readonly {
  label: string;
  trigger: string;
  content: string;
  placement: NonNullable<TooltipProps["placement"]>;
  defaultOpen?: boolean;
}[] = [
  {
    label: "Typical short hint",
    trigger: "Download report",
    content: "Download the current monthly report.",
    placement: "block-start",
  },
  {
    label: "Long realistic explanation",
    trigger: "Billing details",
    content:
      "Invoices are generated on the first business day of each month. Changes to the billing contact take effect on the next invoice and are also sent to the account security administrators.",
    placement: "block-start",
    defaultOpen: true,
  },
  {
    label: "Localized text and punctuation",
    trigger: "Notificaciones",
    content: "Las notificaciones de facturación y seguridad se envían a las personas administradoras del espacio de trabajo.",
    placement: "block-end",
  },
  {
    label: "Inline-end placement",
    trigger: "More information",
    content: "This value is calculated from the latest confirmed billing record.",
    placement: "inline-end",
  },
  {
    label: "Short trigger name",
    trigger: "Info",
    content: "A short trigger must still have a clear accessible name.",
    placement: "inline-start",
  },
];

export function TooltipBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Tooltip</h1>
        <p className="break-intro">
          Short hints, a realistic two-sentence explanation, translated content and every logical
          placement. The long hint opens by default; hover or focus the others.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <section className="break-case" key={scenario.label}>
            <h2 className="break-case__label">Tooltip - {scenario.label}</h2>
            <BreakCaseFindings component="tooltip" label={scenario.label} />
            <div className="break-case__stage">
              <div className="break-w-320 break-tooltip-stage">
                <Tooltip content={scenario.content} placement={scenario.placement} arrow defaultOpen={scenario.defaultOpen}>
                  <Button variant="soft">{scenario.trigger}</Button>
                </Tooltip>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
