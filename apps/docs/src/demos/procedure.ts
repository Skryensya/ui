import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/** Ordered list, step, content and title: two steps without nested chrome. */
export const procedureAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("procedurePage.anatomyLabel"),
    inert: true,
  },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "procedure",
      signature: "Procedure",
      attrs: {
        "aria-label": t("demo.procedure.label"),
        style: "inline-size: 30rem; max-inline-size: 100%;",
      },
      children: [
        {
          contract: "procedure",
          signature: "ProcedureStep",
          slots: {
            title: t("demo.procedure.install.title"),
            children: text(t("demo.procedure.install.body")),
          },
        },
        {
          contract: "procedure",
          signature: "ProcedureStep",
          slots: {
            title: t("demo.procedure.import.title"),
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm" },
              children: [
                text(t("demo.procedure.import.body")),
                {
                  contract: "code-preview",
                  signature: "CodePreview",
                  slots: {
                    label: "terminal",
                    children: "pnpm add @skryensya/core",
                  },
                },
              ],
            },
          },
        },
        {
          contract: "procedure",
          signature: "ProcedureStep",
          slots: {
            title: t("demo.procedure.render.title"),
            children: text(t("demo.procedure.render.body")),
          },
        },
      ],
    },
    items: [
      namePart(".sk-procedure", "block-start", { mark: "bracket" }),
      namePart(".sk-procedure__step", "inline-start", {
        match: "all",
        ringPlacement: "offset",
        ringDistance: 2,
      }),
      namePart(".sk-procedure__content", "inline-end", {
        ringPlacement: "offset",
        ringDistance: 4,
      }),
      namePart(".sk-procedure__title", "inline-end", {
        ringPlacement: "offset",
        ringDistance: 2,
      }),
    ],
  },
});

/** A step's detail text, in the secondary tone every example here uses. */
const text = (children: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { tone: "secondary" },
  children,
});

/*
 * The three steps of installing the library, as instructions rather than as prose.
 *
 * A tree was written for this page once and deleted, because one step embeds a CODE BLOCK and
 * `code-preview` had no contract then: emitting the list would have dropped it. It has one now, so
 * the whole demo composes: an ordered list of steps, each with a title and a body that can hold
 * anything the system publishes.
 *
 * The third step ends with a Badge and a Link side by side, which is the point of the example: a
 * step is not a paragraph, it is a place where the outcome of the step can be shown.
 */
export const procedureTree = (t: Translate): UsageTree => ({
  contract: "procedure",
  signature: "Procedure",
  attrs: { "aria-label": t("demo.procedure.label") },
  children: [
    {
      contract: "procedure",
      signature: "ProcedureStep",
      slots: {
        title: t("demo.procedure.install.title"),
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.procedure.install.body"),
            },
            {
              contract: "code-preview",
              signature: "CodePreview",
              slots: {
                label: "terminal",
                children: "pnpm add @skryensya/core @skryensya/react",
              },
            },
          ],
        },
      },
    },
    {
      contract: "procedure",
      signature: "ProcedureStep",
      slots: {
        title: t("demo.procedure.import.title"),
        children: {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("demo.procedure.import.body"),
        },
      },
    },
    {
      contract: "procedure",
      signature: "ProcedureStep",
      slots: {
        title: t("demo.procedure.render.title"),
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.procedure.render.body"),
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm" },
              children: [
                {
                  contract: "badge",
                  signature: "Badge",
                  options: { tone: "success" },
                  children: t("demo.procedure.done"),
                },
                {
                  contract: "typography",
                  signature: "Link",
                  options: { href: "/components/procedure" },
                  children: t("demo.procedure.docs"),
                },
              ],
            },
          ],
        },
      },
    },
  ],
});

const step = (title: string, children?: UsageTree): UsageTree => ({
  contract: "procedure",
  signature: "ProcedureStep",
  slots: children ? { title, children } : { title },
});

const column = (children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children,
});

const code = (label: string, body: string): UsageTree => ({
  contract: "code-preview",
  signature: "CodePreview",
  slots: { label, children: body },
});

/*
 * PUBLISHING A SITE, the procedure most readers have actually followed: a connection, a build
 * command, a config file, and a last step that ends in the action itself. Each step carries
 * something different (badges, a command, a file, a notice with a button), which is the argument for
 * a list whose steps hold anything.
 */
export const procedureDeployTree = (t: Translate): UsageTree => ({
  contract: "procedure",
  signature: "Procedure",
  attrs: { "aria-label": t("demo.procedure.deploy.label") },
  children: [
    step(
      t("demo.procedure.deploy.connect.title"),
      column([
        text(t("demo.procedure.deploy.connect.body")),
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm" },
          children: [
            {
              contract: "badge",
              signature: "Badge",
              options: { tone: "neutral" },
              children: "github.com/acme/site",
            },
            {
              contract: "badge",
              signature: "Badge",
              options: { tone: "accent" },
              children: "main",
            },
          ],
        },
      ]),
    ),
    step(
      t("demo.procedure.deploy.build.title"),
      column([
        text(t("demo.procedure.deploy.build.body")),
        code("terminal", "pnpm build"),
      ]),
    ),
    step(
      t("demo.procedure.deploy.env.title"),
      column([
        text(t("demo.procedure.deploy.env.body")),
        code(".env", "API_URL=https://api.acme.dev\nNODE_ENV=production"),
      ]),
    ),
    step(
      t("demo.procedure.deploy.publish.title"),
      column([
        {
          contract: "callout",
          signature: "Callout",
          options: { tone: "success" },
          slots: {
            icon: {
              contract: "icon",
              signature: "Icon",
              options: { name: "check" },
            },
            title: t("demo.procedure.deploy.ready.title"),
            children: t("demo.procedure.deploy.ready.body"),
          },
        },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm" },
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { tone: "accent" },
              children: t("demo.procedure.deploy.publish.cta"),
            },
            {
              contract: "typography",
              signature: "Link",
              options: { href: "/components/procedure" },
              children: t("demo.procedure.docs"),
            },
          ],
        },
      ]),
    ),
  ],
});

/*
 * TWO-STEP VERIFICATION, a flow whose steps are not text: a link into settings, a QR code to scan,
 * a code to type, and a warning to heed. The QR code sits beside its instruction, the way a real
 * settings page lays it out.
 */
export const procedureSecurityTree = (t: Translate): UsageTree => ({
  contract: "procedure",
  signature: "Procedure",
  attrs: { "aria-label": t("demo.procedure.security.label") },
  children: [
    step(
      t("demo.procedure.security.open.title"),
      column([
        text(t("demo.procedure.security.open.body")),
        {
          contract: "typography",
          signature: "Link",
          options: { href: "/components/procedure" },
          children: t("demo.procedure.security.open.link"),
        },
      ]),
    ),
    step(t("demo.procedure.security.scan.title"), {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md", inlineAlign: "center" },
      children: [
        {
          contract: "qr-code",
          signature: "QRCode",
          options: {
            value:
              "otpauth://totp/Acme:ana@acme.dev?secret=JBSWY3DPEHPK3PXP&issuer=Acme",
            label: t("demo.procedure.security.scan.qr"),
            qrSize: "md",
          },
        },
        {
          ...text(t("demo.procedure.security.scan.body")),
          attrs: { style: "max-inline-size: 16rem;" },
        },
      ],
    }),
    step(
      t("demo.procedure.security.code.title"),
      text(t("demo.procedure.security.code.body")),
    ),
    step(t("demo.procedure.security.backup.title"), {
      contract: "callout",
      signature: "Callout",
      options: { tone: "warning" },
      slots: {
        icon: {
          contract: "icon",
          signature: "Icon",
          options: { name: "warning" },
        },
        title: t("demo.procedure.security.backup.callout"),
        children: t("demo.procedure.security.backup.body"),
      },
    }),
  ],
});

/*
 * THE FOUR USAGE PAIRS. Each pair is the same list drawn twice: one that follows the rule and one
 * that breaks it in the way people actually do, with a similar number of steps and similar length so
 * the only difference the reader can see is the rule. Every pair is its own small procedure, because
 * the same install guide four times teaches the rule less than four different cases.
 */
const DD_WIDTH = "inline-size: 20rem;";

const ddList = (label: string, steps: UsageTree[]): UsageTree => ({
  contract: "procedure",
  signature: "Procedure",
  attrs: { "aria-label": label, style: DD_WIDTH },
  children: steps,
});

type DdKey = Parameters<Translate>[0];
const ddStep = (
  t: Translate,
  key: string,
  n: number,
  body?: UsageTree,
): UsageTree =>
  step(
    t(`demo.procedure.dd.${key}.${n}.title` as DdKey),
    body ?? text(t(`demo.procedure.dd.${key}.${n}.body` as DdKey)),
  );
const ddSteps = (t: Translate, key: string, count: number) =>
  Array.from({ length: count }, (_, i) => ddStep(t, key, i + 1));
const ddLabel = (t: Translate, key: string) =>
  t(`demo.procedure.dd.${key}.label` as DdKey);

/* Order: steps that depend on one another, against a list of benefits that merely got numbers. */
export const procedureDoOrderTree = (t: Translate): UsageTree =>
  ddList(ddLabel(t, "reset"), ddSteps(t, "reset", 3));
export const procedureDontOrderTree = (t: Translate): UsageTree =>
  ddList(ddLabel(t, "benefits"), ddSteps(t, "benefits", 3));

/* Titles: the action in a few words with the detail under it, against the whole sentence as a title. */
export const procedureDoTitlesTree = (t: Translate): UsageTree =>
  ddList(ddLabel(t, "publish"), ddSteps(t, "publish", 3));
export const procedureDontTitlesTree = (t: Translate): UsageTree =>
  ddList(
    ddLabel(t, "publishLong"),
    Array.from({ length: 3 }, (_, i) =>
      step(
        t(`demo.procedure.dd.publishLong.${i + 1}.title` as DdKey),
        text(""),
      ),
    ),
  );

/* One action: four small steps, against two steps that each fold several actions together. */
export const procedureDoActionsTree = (t: Translate): UsageTree =>
  ddList(ddLabel(t, "account"), ddSteps(t, "account", 3));
export const procedureDontActionsTree = (t: Translate): UsageTree =>
  ddList(ddLabel(t, "accountPacked"), ddSteps(t, "accountPacked", 2));

/* Commands: in a block of their own that can be read and copied whole, against buried in the sentence. */
export const procedureDoCommandTree = (t: Translate): UsageTree =>
  ddList(ddLabel(t, "command"), [
    ddStep(
      t,
      "command",
      1,
      column([
        text(t("demo.procedure.dd.command.1.body" as DdKey)),
        code("terminal", "pnpm add @skryensya/core"),
      ]),
    ),
    ddStep(t, "command", 2),
  ]);
export const procedureDontCommandTree = (t: Translate): UsageTree =>
  ddList(ddLabel(t, "commandInline"), ddSteps(t, "commandInline", 2));

export type ProcedureContent = "text" | "code" | "rich";

const CONTENT_COMMANDS = {
  install: ["terminal", "pnpm add @skryensya/core @skryensya/react"],
  import: ["css", '@import "@skryensya/core/components/procedure.css";'],
  render: ["tsx", "<Procedure>…</Procedure>"],
} as const;

/*
 * THE SAME THREE STEPS, WHAT FILLS THEM CHANGING. The list never changes: `ProcedureStep` takes a
 * title and anything as its body, and this is that sentence as a control. Text is the plain case,
 * code is the one a how-to reaches for most, and the rich one puts badges, a notice and a button
 * where the text was, with the numbers and the rail untouched.
 */
export const procedureContentTree = (
  t: Translate,
  kind: ProcedureContent,
): UsageTree => {
  const body = (key: "install" | "import" | "render"): UsageTree => {
    const description = text(
      t(`demo.procedure.${key}.body` as Parameters<Translate>[0]),
    );
    if (kind === "text") return description;
    if (kind === "code")
      return column([description, code(...CONTENT_COMMANDS[key])]);
    if (key === "install") {
      return column([
        description,
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm" },
          children: [
            {
              contract: "badge",
              signature: "Badge",
              options: { tone: "neutral" },
              children: "@skryensya/core",
            },
            {
              contract: "badge",
              signature: "Badge",
              options: { tone: "neutral" },
              children: "@skryensya/react",
            },
          ],
        },
      ]);
    }
    if (key === "import")
      return column([description, code(...CONTENT_COMMANDS.import)]);
    return column([
      {
        contract: "callout",
        signature: "Callout",
        options: { tone: "success" },
        slots: {
          icon: {
            contract: "icon",
            signature: "Icon",
            options: { name: "check" },
          },
          title: t("demo.procedure.done"),
          children: description,
        },
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm" },
        children: [
          {
            contract: "button",
            signature: "Button.action",
            options: { tone: "accent" },
            children: t("demo.procedure.docs"),
          },
        ],
      },
    ]);
  };
  return {
    contract: "procedure",
    signature: "Procedure",
    attrs: { "aria-label": t("demo.procedure.label") },
    children: [
      step(t("demo.procedure.install.title"), body("install")),
      step(t("demo.procedure.import.title"), body("import")),
      step(t("demo.procedure.render.title"), body("render")),
    ],
  };
};
