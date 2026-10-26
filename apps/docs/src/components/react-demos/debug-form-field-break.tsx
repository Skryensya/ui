import { FormField } from "@skryensya/react/form-field";
import { Input } from "@skryensya/react/input";

const CASES = [
  {
    label: "Demo",
    fieldLabel: "Billing email",
    hint: "Invoices will be sent here.",
    error: undefined,
    value: "sam@example.com",
    required: true,
    disabled: false,
  },
  {
    label: "Worst case",
    fieldLabel:
      "International billing reconciliation and security notification address",
    hint: "Use bartholomew.fitzgerald@northwind-industries-holdings.example.com for all workspace invoices.",
    error:
      "The invitation for bartholomew.fitzgerald@northwind-industries-holdings.example.com expired 12 days ago. Request a new invitation from a workspace administrator.",
    value: "bartholomew.fitzgerald@northwind-industries-holdings.example.com",
    required: true,
    disabled: false,
  },
  {
    label: "Disabled",
    fieldLabel: "Paramètres de confidentialité et de sécurité",
    hint: "Only administrators can edit this address.",
    error: undefined,
    value: "王秀英",
    required: false,
    disabled: true,
  },
  {
    label: "No optional copy",
    fieldLabel: "Jo",
    hint: undefined,
    error: undefined,
    value: "",
    required: false,
    disabled: false,
  },
];

export function FormFieldBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: FormField</h1>
        <p className="break-intro">
          Long labels, hints and authored errors; optional copy,
          required/disabled propagation and label/description wiring.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(
          ({ label, fieldLabel, hint, error, value, required, disabled }) => (
            <section className="break-case" key={label}>
              <h2 className="break-case__label">FormField - {label}</h2>
              <div className="break-case__stage">
                <div style={{ inlineSize: "100%" }}>
                  <FormField
                    label={fieldLabel}
                    hint={hint}
                    error={error}
                    required={required}
                    disabled={disabled}
                  >
                    <Input defaultValue={value} />
                  </FormField>
                </div>
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}
