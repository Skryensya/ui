import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * THE PRESENCE EXAMPLES, AS USAGE TREES.
 *
 * Each one is a control and the content it shows and hides. The toggling is page-level script (see
 * `PresencePage.astro`): it flips `hidden` and `data-state` through the DOM, which is the whole of
 * the authored-markup API, so the same script drives both stages.
 *
 * Every stage reserves the block size of its open state. Presence leaves the layout at the END of
 * its exit, and a preview that shrank with it would pull the page up under the reader's pointer.
 */

/*
 * 1. A TOAST, in the corner of the surface it confirms. A small settings card with two fields and a
 * Save button; Save raises a confirmation in the card's bottom-right corner and a timer drops it. The
 * Presence is positioned there (`presenceToastCss`), so the example shows what Presence is for: the
 * toast is not a layout row, it is content that arrives over the page and leaves by the way it came.
 */
export const presenceNoticeTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { class: "presence-toast-stage" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "lg" },
      attrs: { class: "presence-toast-card" },
      children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", options: { headingSize: "h4", flush: true }, children: t("presence.noticeCardTitle") },
        {
          contract: "form-field",
          signature: "FormField",
          slots: { label: t("presence.noticeName") },
          children: { contract: "input", signature: "Input", options: { name: "name" }, attrs: { value: t("presence.noticeNameValue") } },
        },
        {
          contract: "form-field",
          signature: "FormField",
          slots: { label: t("presence.noticeEmail") },
          children: { contract: "input", signature: "Input", options: { name: "email" }, attrs: { value: "ada@example.com" } },
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent" },
          attrs: { id: "presence-notice-save" },
          children: t("presence.noticeSave"),
        },
      ],
      },
    },
    {
      contract: "presence",
      signature: "Presence",
      options: { present: false },
      attrs: { id: "presence-notice", class: "presence-toast" },
      children: {
        contract: "callout",
        signature: "Callout",
        options: { tone: "success" },
        slots: { title: t("presence.noticeTitle") },
        children: t("presence.noticeBody"),
      },
    },
  ],
});

/*
 * The toast's place and its way in. It is anchored to the corner of the whole example, not of the form
 * card, so it never covers the form. The example clips, so the toast starts past its right edge and slides
 * in; `translate` is the property Presence already animates, so only where it travels from is
 * restated, in both states and in the starting style, with the same easing and duration.
 */
export const presenceToastCss = `.presence-toast-stage {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  inline-size: 100%;
  min-block-size: 20rem;
}

.presence-toast-card {
  inline-size: 22rem;
  max-inline-size: 100%;
}

.presence-toast {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 0;
  inline-size: 16rem;
  max-inline-size: 100%;
  box-shadow: var(--elevation-overlay);
  border-radius: var(--radius-surface);
}

.presence-toast[hidden] {
  translate: calc(100% + var(--space-inset-md)) 0;
}

@starting-style {
  .presence-toast:not([hidden]) {
    translate: calc(100% + var(--space-inset-md)) 0;
  }
}
`;

/** 2. The case forms are full of: a setting that reveals the fields it needs. */
export const presenceFieldsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 24rem; max-inline-size: 100%; min-block-size: 15rem; align-content: start;" },
  children: [
    {
      contract: "switch",
      signature: "Switch",
      options: { name: "presence-other-address" },
      attrs: { id: "presence-fields-switch", "aria-controls": "presence-fields" },
      children: t("presence.fieldsSwitch"),
    },
    {
      contract: "presence",
      signature: "Presence",
      options: { present: false },
      attrs: { id: "presence-fields" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        children: [
          {
            contract: "form-field",
            signature: "FormField",
            slots: { label: t("presence.fieldsStreet") },
            children: { contract: "input", signature: "Input", options: { name: "street" } },
          },
          {
            contract: "form-field",
            signature: "FormField",
            slots: { label: t("presence.fieldsCity") },
            children: { contract: "input", signature: "Input", options: { name: "city" } },
          },
        ],
      },
    },
  ],
});

/*
 * 3. ONE INSTANCE, THREE MOTIONS: the card's control picks which styling hooks the Presence carries and
 * its button plays it on and off. The hooks are `attrs.style` on purpose: they are the consumer's
 * override, not an option the contract offers. The values are the three the page used to draw side by
 * side; one at a time they can be felt, which three static boxes could not.
 */
export const presenceMotionHooks = {
  default: undefined,
  fade: "--sk-presence-enter-distance: 0px; --sk-presence-exit-distance: 0px;",
  slow: "--sk-presence-enter-duration: 600ms; --sk-presence-exit-duration: 400ms; --sk-presence-enter-distance: 1.5rem; --sk-presence-exit-distance: 1.5rem;",
} as const;

const motionVariant = (t: Translate, motion: keyof typeof presenceMotionHooks): UsageTree => ({
  contract: "presence",
  signature: "Presence",
  options: { present: true },
  attrs: { style: `inline-size: 20rem; max-inline-size: 100%;${presenceMotionHooks[motion] ? ` ${presenceMotionHooks[motion]}` : ""}` },
  children: {
    contract: "box",
    signature: "Box",
    options: { surface: "raised", border: "subtle", padding: "md" },
    children: [{ contract: "typography", signature: "Text", options: { size: "sm", weight: "label" }, children: t(`presence.motion.${motion}.sample` as Parameters<Translate>[0]) }],
  },
});

/* One export per motion, each taking only `t`: the generated stories call every tree export that way. */
export const presenceMotionTree = (t: Translate): UsageTree => motionVariant(t, "default");
export const presenceMotionFadeTree = (t: Translate): UsageTree => motionVariant(t, "fade");
export const presenceMotionSlowTree = (t: Translate): UsageTree => motionVariant(t, "slow");

/*
 * The root and what it holds. Presence has one part; everything inside it is the author's, and the
 * `> *` label says so instead of inventing a content part. Drawn present, since the absent state is
 * an empty box.
 */
export const presenceAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("presence.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "presence",
      signature: "Presence",
      options: { present: true },
      attrs: { style: "inline-size: 22rem; max-inline-size: 100%;" },
      children: {
        contract: "callout",
        signature: "Callout",
        options: { tone: "success" },
        slots: { title: t("presence.noticeTitle") },
        children: t("presence.noticeBody"),
      },
    },
    items: [
      namePart(".sk-presence", "block-start", { mark: "bracket" }),
      namePart(".sk-presence > *", "inline-end"),
    ],
  },
});

/*
 * THE `present` CARD'S SPECIMEN: a notice that is there or is not, and nothing else, so the card's
 * control is the whole interaction. The card keeps the same instance between values (no remount), which
 * is the point: a remount would replace the node and there would be no exit left to see.
 */
export const presencePlaygroundTree = (t: Translate): UsageTree => ({
  contract: "presence",
  signature: "Presence",
  options: { present: true },
  attrs: { style: "inline-size: 24rem; max-inline-size: 100%;" },
  children: {
    contract: "callout",
    signature: "Callout",
    options: { tone: "success" },
    slots: { title: t("presence.noticeTitle") },
    children: t("presence.noticeBody"),
  },
});
