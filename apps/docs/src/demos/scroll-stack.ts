import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * SCROLL STACK DEMO. Two sections that read as two different moments: a cover that fills the box, and what follows it.
 * The back layer is a calm, centred card on a sunken surface, because what the effect does to it (it shrinks, dims and
 * rounds) only reads against something with edges; the front layer is ordinary prose, because it is any content, and
 * a demo that put something showy in it would be teaching the wrong lesson about what to put there.
 */

const heading = (children: string, size: string): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: size, flush: true },
  children,
});

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options,
  children,
});

const stack = (gap: string, ...children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap },
  children,
});

export const scrollStackTree = (t: Translate): UsageTree => ({
  contract: "scroll-stack",
  signature: "ScrollStack",
  slots: {
    back: {
      contract: "box",
      signature: "Box",
      options: { surface: "sunken", padding: "lg" },
      attrs: { style: "min-block-size: 100cqh; display: grid; place-content: center; text-align: center;" },
      children: stack(
        "sm",
        text(t("demo.scrollStack.eyebrow"), { textRole: "eyebrow" }),
        heading(t("demo.scrollStack.title"), "h2"),
        text(t("demo.scrollStack.body"), { tone: "secondary" }),
      ),
    },
    front: {
      contract: "box",
      signature: "Box",
      options: { padding: "lg" },
      attrs: { style: "min-block-size: 100cqh;" },
      children: stack(
        "md",
        heading(t("demo.scrollStack.frontTitle"), "h3"),
        text(t("demo.scrollStack.p1")),
        text(t("demo.scrollStack.p2")),
        text(t("demo.scrollStack.p3")),
        text(t("demo.scrollStack.p4")),
      ),
    },
  },
});
