import { PasswordInput } from "@skryensya/react/password-input";

const CASES = [
  {
    label: "Demo",
    props: { label: "Password", hint: "Use a unique passphrase." },
  },
  {
    label: "Worst case",
    props: {
      label: "Passphrase for international billing and security administrators",
      hint: "Ask bartholomew.fitzgerald@northwind-industries-holdings.example.com for access instructions.",
      placeholder: "Enter your workspace security passphrase",
      required: true,
    },
  },
  {
    label: "Disabled",
    props: {
      label: "Password unavailable",
      disabled: true,
      hint: "Use single sign-on for this workspace.",
    },
  },
  { label: "Read only", props: { label: "Stored credential", readOnly: true } },
  {
    label: "Invalid",
    props: {
      label: "Password",
      invalid: true,
      hint: "This password was found in a known breach. Choose a different passphrase.",
    },
  },
];

export function PasswordInputBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: PasswordInput</h1>
        <p className="break-intro">
          Long labels, support addresses and placeholder copy; required,
          disabled, read-only and invalid states. Enter a long passphrase and
          toggle visibility.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, props }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">PasswordInput — {label}</h2>
            <div className="break-case__stage">
              <div style={{ inlineSize: "100%" }}>
                <PasswordInput
                  {...props}
                  showLabel="Show password"
                  hideLabel="Hide password"
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
