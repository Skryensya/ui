import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/*
 * SIGN IN. The smallest template here, and the one a stranger meets before any other screen. It
 * does one job, so the page is one narrow column and nothing else:
 *
 *   - the frame is a `Wrapper` at `sm`, centred in the work area's height by a Stack's `justify`,
 *     not a two-column split. A login form is short, and a form
 *     stretched across a wide column reads as unfinished rather than calm;
 *   - the password is `PasswordInput`, NOT a FormField around `Input type="password"`. The
 *     show/hide control and its two accessible names belong to that contract, and it owns its own
 *     label slot, so wrapping it in a FormField would print the label twice;
 *   - "o" between the two ways in is a `LabelledSeparator`, the one separator allowed to carry a
 *     word; and
 *   - the ONLY accent is the submit button. The alternative provider is a neutral button: both are
 *     real ways in, but only one of them is the page's default.
 */

export const signInTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "AppShell",
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [{ contract: "navbar", signature: "NavbarBrand", children: "Lumen" }],
    },
    {
      contract: "layout",
      signature: "Main",
      options: { paddingBlock: "lg", paddingBlockExpanded: "xl" },
      children: {
        /* The form sits in the middle of the work area's height: the Main gives the Stack its height and `justify` spends it. */
        contract: "layout",
        signature: "Stack",
        options: { stackJustify: "center" },
        children: {
          contract: "wrapper",
          signature: "Wrapper",
          options: { wrapperSize: "sm", gutter: "md", gutterExpanded: "lg" },
          children: {
            contract: "box",
            signature: "Box",
            options: { surface: "raised", border: "subtle", padding: "md", paddingExpanded: "lg" },
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "md", gapExpanded: "lg" },
              children: [
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "xs" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "h3", flush: true },
                      children: t("demo.signIn.title"),
                    },
                    {
                      contract: "typography",
                      signature: "Text",
                      options: { tone: "secondary" },
                      children: t("demo.signIn.lede"),
                    },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "md" },
                  children: [
                    {
                      contract: "form-field",
                      signature: "FormField",
                      options: { required: true },
                      slots: {
                        label: t("demo.signIn.email"),
                        children: {
                          contract: "input",
                          signature: "Input",
                          options: {
                            type: "email",
                            name: "email",
                            placeholder: t("demo.signIn.emailPlaceholder"),
                          },
                        },
                      },
                    },
                    {
                      contract: "password-input",
                      signature: "PasswordInput",
                      options: {
                        name: "password",
                        autoComplete: "current-password",
                        required: true,
                        showLabel: t("demo.signIn.showPassword"),
                        hideLabel: t("demo.signIn.hidePassword"),
                      },
                      slots: { label: t("demo.signIn.password") },
                    },
                    /*
                     * "Remember me" beside "Forgot password?": two things on one row, spread to the
                     * edges by the Inline itself rather than a margin on either of them. The
                     * recovery path is a `Link`, not a button, because it goes somewhere.
                     */
                    {
                      contract: "layout",
                      signature: "Inline",
                      options: { justify: "between", inlineAlign: "center", wrap: true },
                      children: [
                        {
                          contract: "checkbox",
                          signature: "Checkbox",
                          options: { name: "remember" },
                          children: t("demo.signIn.remember"),
                        },
                        {
                          contract: "typography",
                          signature: "Link",
                          options: { href: "#recuperar" },
                          children: t("demo.signIn.forgot"),
                        },
                      ],
                    },
                    {
                      contract: "button",
                      signature: "Button.action",
                      options: { tone: "accent", size: "lg", type: "submit" },
                      children: t("demo.signIn.submit"),
                    },
                  ],
                },
                {
                  contract: "separator",
                  signature: "LabelledSeparator",
                  children: t("demo.signIn.or"),
                },
                {
                  contract: "button",
                  signature: "Button.action",
                  options: { size: "lg" },
                  children: t("demo.signIn.sso"),
                },
                {
                  contract: "typography",
                  signature: "Text",
                  options: { size: "sm", tone: "secondary" },
                  children: [
                    t("demo.signIn.noAccount"),
                    " ",
                    {
                      contract: "typography",
                      signature: "Link",
                      options: { href: "#registro" },
                      children: t("demo.signIn.signUp"),
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ],
});
