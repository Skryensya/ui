import { BreakCaseFindings } from "./debug-case-findings";
import { OtpInput } from "@skryensya/react/otp-input";

const CASES = [
  {
    label: "Demo",
    props: {
      label: "Verification code",
      count: 6,
      hint: "Enter the code sent to your phone.",
    },
  },
  {
    label: "Worst case",
    props: {
      label: "International workspace security verification code",
      count: 8,
      groupSize: "4" as const,
      hint: "Sent to bartholomew.fitzgerald@northwind-industries-holdings.example.com",
      defaultValue: "12345678",
    },
  },
  { label: "One segment", props: { label: "Check digit", count: 1 } },
  {
    label: "Disabled",
    props: {
      label: "Verification unavailable",
      count: 6,
      disabled: true,
      defaultValue: "123456",
    },
  },
  {
    label: "Invalid",
    props: {
      label: "Expired code",
      count: 6,
      invalid: true,
      hint: "Request a new code.",
      defaultValue: "987654",
    },
  },
];

export function OtpInputBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: OtpInput</h1>
        <p className="break-intro">
          Six/eight-digit codes, grouped segments, long hints and
          disabled/invalid states. Paste a complete code into the first segment.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, props }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">OtpInput - {label}</h2>
            <BreakCaseFindings component="otp-input" label={label} />
            <div className="break-case__stage">
              <div style={{ inlineSize: "100%" }}>
                <OtpInput {...props} segmentLabel="Digit {index} of {count}" />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
