/*
 * The docs' demo fields are not real forms: a password manager offering to fill or save them is noise.
 * `autocomplete="off"` is largely ignored by them, so each manager gets its own opt-out (1Password, LastPass,
 * Bitwarden, Dashlane, Proton Pass). A field that already states an `autocomplete` keeps it: the PasswordInput
 * page documents those values and must show them.
 */
export const passwordManagerOptOut: Readonly<Record<string, string>> = {
  "data-1p-ignore": "",
  "data-lpignore": "true",
  "data-bwignore": "true",
  "data-form-type": "other",
  "data-protonpass-ignore": "true",
};

const attrString = Object.entries(passwordManagerOptOut).map(([k, v]) => (v ? `${k}="${v}"` : k)).join(" ");

/** The same opt-out for markup that is served as a string (the canvas fragments), before any script runs. */
export const hardenInputsInHtml = (html: string): string =>
  html.replace(/<(input|textarea)\b(?![^>]*\bdata-1p-ignore)/g, `<$1 ${attrString}`);

/** The same opt-out on live DOM, now and for fields added later (previews, popovers, fragments). */
export function hardenInputs(root: ParentNode = document): void {
  const apply = (scope: ParentNode) => {
    const fields = scope instanceof Element && scope.matches("input, textarea") ? [scope] : [...scope.querySelectorAll("input, textarea")];
    for (const field of fields) {
      for (const [name, value] of Object.entries(passwordManagerOptOut)) if (!field.hasAttribute(name)) field.setAttribute(name, value);
      if (!field.hasAttribute("autocomplete")) field.setAttribute("autocomplete", "off");
    }
  };
  apply(root);
  new MutationObserver((records) => {
    for (const record of records) for (const node of record.addedNodes) if (node instanceof Element) apply(node);
  }).observe(root instanceof Document ? root.documentElement : (root as Node), { childList: true, subtree: true });
}
