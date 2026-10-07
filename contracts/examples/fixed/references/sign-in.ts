import type { Snippet } from "../snippet.js";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { box, button, field, heading, inline, input, link, main, navbar, skipLink, stack, text, wrapper } from "./kit.js";

/*
 * PATTERN: a sign-in page (what Google, Apple and GitHub converge on): one centred card, a heading that
 * names the task, the credentials, one primary action and the two ways out (recover, create).
 */
const email: UsageTree = field(
  "Email",
  { ...input({ type: "email", name: "email" }), attrs: { autocomplete: "username", required: "" } },
  { hint: "The address you signed up with." },
);

const password: UsageTree = {
  contract: "password-input",
  signature: "PasswordInput",
  options: { name: "password", autoComplete: "current-password", required: true },
  slots: { label: "Password" },
};

export const signInPattern: Snippet = {
  id: "page-sign-in-card",
  level: "page",
  intent: "A sign-in page: email and password in one card, a primary Sign in action, and links to recover access or create an account.",
  notes: [
    "Pattern: the sign-in card. One task per page, so the card is the page: an h1 that names the task, the two credentials, a single primary action and, under it, the two ways out (forgot the password, no account yet). Nothing competes with the primary action: the recovery and sign-up links are links, not buttons.",
    "Accessibility, kept over style: both fields have a visible label and carry the `autocomplete` token for what they are (`username`, `current-password`), which is what lets a browser or a password manager fill them (WCAG 1.3.5) and what keeps the page clear of a cognitive test (WCAG 3.3.8, Accessible Authentication): nothing is blocked from paste or autofill, and the password can be shown, with a button that says so in words. The card is a named section, so the page has one h1, one main and a skip link.",
    "Compared with Google and Apple: they ask for the identifier first and the password on a second screen. This pattern keeps both fields on one card, as GitHub does, so a password manager fills them in one gesture and the person does not have to wait for a second page. It keeps what those sign-in pages do well: one column, one primary button, the recovery link beside the field it is about.",
    "What the pattern does not do: no placeholder standing in for a label, no 'show password' that is an unlabelled eye icon, no CAPTCHA that asks for a puzzle, and no error that only turns a border red. A failed sign-in is announced in text, next to the fields, and says what to do (see `form-field-hint-and-error`). The contract has no `form` element, so a real page wraps this card's fields and button in a `<form>` of its own.",
  ],
  tree: stack(
    [
      skipLink("Skip to the sign-in form"),
      navbar("Widgets", [link("Help", "#help")]),
      main(
        box(
          wrapper(
            box(
              stack(
                [
                  { ...heading("Sign in", "h1", "h1"), attrs: { id: "sign-in-title" } },
                  text("Use your Widgets account to continue.", { tone: "secondary" }),
                  email,
                  password,
                  {
                    contract: "checkbox",
                    signature: "Checkbox",
                    options: { name: "remember", value: "yes" },
                    children: "Keep me signed in on this device",
                  },
                  button("Sign in", { variant: "solid", tone: "accent", size: "lg", type: "submit" }),
                  inline([link("Forgot your password?", "#forgot"), link("Create an account", "#create")], { justify: "between", gap: "md" }),
                ],
                { gap: "md" },
              ),
              { padding: "lg", boxElement: "section", border: "subtle", surface: "raised", radius: "surface" },
              { "aria-labelledby": "sign-in-title" },
            ),
            "sm",
          ),
          { padding: "lg" },
        ),
      ),
    ],
    { gap: "none" },
  ),
};
