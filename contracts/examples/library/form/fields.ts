import type { UsageTree } from "@skryensya/core/usage-tree";
import { action, avatar, inline, type Person } from "../kit.js";

/*
 * THE FIELD VOCABULARY the form patterns share: one spec per kind of control, and the one function that
 * turns a spec into a tree. A text control always sits in a FormField, which owns the label, the hint, the
 * error and the ids that tie them to the input. PasswordInput and the enhanced Select carry their own label
 * slot, so they are NOT wrapped: a FormField around them would print the label twice.
 *
 * Every `name` is prefixed with the use's id: a page may show a field and the flow that holds it side by
 * side, and two controls sharing a name are one group to the browser.
 */

export type FieldSpec =
  | { kind: "text" | "email"; name: string; label: string; placeholder: string; hint?: string; error?: string; required?: boolean }
  | { kind: "password"; name: string; label: string; hint?: string; show: string; hide: string; mode: "current" | "new" }
  | { kind: "textarea"; name: string; label: string; placeholder: string; hint?: string; required?: boolean }
  | { kind: "select"; name: string; label: string; value: string; options: { value: string; label: string }[] }
  | { kind: "photo"; person: Person; action: string };

export function renderField(spec: FieldSpec, ns: string): UsageTree {
  switch (spec.kind) {
    case "text":
    case "email":
      return {
        contract: "form-field",
        signature: "FormField",
        ...(spec.required ? { options: { required: true } } : {}),
        slots: {
          label: spec.label,
          ...(spec.hint ? { hint: spec.hint } : {}),
          ...(spec.error ? { error: spec.error } : {}),
          children: { contract: "input", signature: "Input", options: { type: spec.kind, name: `${ns}-${spec.name}`, placeholder: spec.placeholder } },
        },
      };
    case "password":
      return {
        contract: "password-input",
        signature: "PasswordInput",
        options: { name: `${ns}-${spec.name}`, autoComplete: spec.mode === "new" ? "new-password" : "current-password", required: true, showLabel: spec.show, hideLabel: spec.hide },
        slots: { label: spec.label, ...(spec.hint ? { hint: spec.hint } : {}) },
      };
    case "textarea":
      return {
        contract: "form-field",
        signature: "FormField",
        ...(spec.required ? { options: { required: true } } : {}),
        slots: {
          label: spec.label,
          ...(spec.hint ? { hint: spec.hint } : {}),
          children: { contract: "input", signature: "Textarea", options: { name: `${ns}-${spec.name}`, placeholder: spec.placeholder } },
        },
      };
    case "select":
      return {
        contract: "select",
        signature: "Select",
        options: { name: `${ns}-${spec.name}`, value: spec.value },
        slots: { label: spec.label, items: spec.options.map((option) => ({ options: { value: option.value }, slots: { label: option.label } })) },
      };
    case "photo":
      return inline([avatar(spec.person, "lg"), action(spec.action, { variant: "soft", size: "sm" })], { gap: "md", inlineAlign: "center" });
  }
}
