import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { localeOf } from "../i18n";

/* Segmented and native time controls share the page's locale-owned field name. */

/** A departure time, already set. Locale and field name are owned by the page. */
export const timeFieldTree = (
  t: Translate,
  opts: { locale: string; name: string } = { locale: localeOf(t), name: "time" },
): UsageTree => ({
  contract: "time-field",
  signature: "TimeField",
  options: {
    locale: opts.locale,
    hourLabel: t("kit.hour"),
    minuteLabel: t("kit.minute"),
    periodLabel: t("kit.period"),
    clearLabel: t("kit.clearTime"),
    optionsLabel: t("kit.chooseFromList"),
    value: "09:30",
    name: opts.name,
  },
  slots: { label: t("demo.timeField.label") },
});

/**
 * A 24-hour field, GUARANTEED: `hourCycle: "h24"` overrides whatever the locale's own `Intl`
 * guess would otherwise resolve to. That guess is unreliable enough to demonstrate directly: the
 * SAME locale string ("es"/"es-AR") resolves to opposite cycles across Node's own ICU build and a
 * real Chromium (`resolveHourCycle`'s own doc, `@skryensya/core/time-field`). A consumer that
 * needs a guaranteed 24-hour field (a scheduling form, an ops dashboard) cannot depend on that
 * guess landing the same way in every browser.
 */
export const timeFieldForced24Tree = (
  t: Translate,
  opts: { locale: string; name: string } = { locale: localeOf(t), name: "time" },
): UsageTree => ({
  contract: "time-field",
  signature: "TimeField",
  options: {
    locale: opts.locale,
    hourLabel: t("kit.hour"),
    minuteLabel: t("kit.minute"),
    periodLabel: t("kit.period"),
    clearLabel: t("kit.clearTime"),
    optionsLabel: t("kit.chooseFromList"),
    hourCycle: "h24",
    value: "22:15",
    name: opts.name,
  },
  slots: { label: t("demo.timeField.forced24Label") },
});

/**
 * `optionsStep` (contract option, `@skryensya/core/time-field`) shown at a tighter grain than the
 * default 30 minutes. 96 rows instead of 48, still short enough to arrow-key through without a
 * search box.
 */
export const timeFieldQuarterHourTree = (
  t: Translate,
  opts: { locale: string; name: string } = { locale: localeOf(t), name: "time" },
): UsageTree => ({
  contract: "time-field",
  signature: "TimeField",
  options: {
    locale: opts.locale,
    hourLabel: t("kit.hour"),
    minuteLabel: t("kit.minute"),
    periodLabel: t("kit.period"),
    clearLabel: t("kit.clearTime"),
    optionsLabel: t("kit.chooseFromList"),
    value: "09:30",
    name: opts.name,
    optionsStep: 15,
  },
  slots: { label: t("demo.timeField.label") },
});

export const timeFieldNativeTree = (
  t: Translate,
  opts: { name: string } = { name: "time" },
): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.timeField.label") },
  children: {
    contract: "input",
    signature: "NativeInput",
    options: { type: "time", name: opts.name },
  },
});

/* Don't: a twelve-hour clock forced on a locale that reads twenty-four. */
export const timeFieldDontCycleTree = (t: Translate): UsageTree => ({
  ...timeFieldTree(t, { locale: "es", name: "forced-h12" }),
  options: { ...timeFieldTree(t, { locale: "es", name: "forced-h12" }).options, hourCycle: "h12" },
});

export const timeFieldDoCycleTree = (t: Translate): UsageTree => timeFieldTree(t, { locale: "es", name: "locale-cycle" });
