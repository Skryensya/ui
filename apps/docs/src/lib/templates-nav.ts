/*
 * The template gallery's section list, TEXT ONLY: no `emitMarkup`, no usage trees.
 *
 * Two places list these sections and they must not drift: `TemplatesPage.astro`'s own rail (a
 * sticky column on desktop, `display: none` below `desktop`) and the mobile drawer, where `Base.astro`
 * turns the same entries into a "Templates" collapsible section in `DrawerNav` so a reader with the
 * rail hidden can still reach every template. One array, read by both, in one order.
 */
import type { Translate } from "../i18n";

export interface TemplateSection {
  /** `id` of the rendered `<section>` in the stage; every nav entry is an `#id` link to it. */
  id: string;
  /** Short label for a nav entry. */
  navLabel: string;
  /** The section's heading / `aria-label` in the stage. */
  title: string;
  /** The example's `aria-label`. */
  label: string;
  /** Which group of the rail and the drawer lists it (`TemplateGroup.id`). */
  group: TemplateGroupId;
}

export type TemplateGroupId = "app" | "marketing" | "content" | "flows" | "system";

export interface TemplateGroup {
  id: TemplateGroupId;
  /** The group's name, as the rail and the drawer show it. */
  label: string;
  sections: TemplateSection[];
}

/* The groups in the order a reader looks for them: the app itself, the pages that sell it, the pages that
   explain it, the flows a person walks through, and the page nobody plans for. */
const GROUP_ORDER: readonly TemplateGroupId[] = ["app", "marketing", "content", "flows", "system"];

const GROUP_OF: Record<string, TemplateGroupId> = {
  "app-shell": "app",
  "app-shell-explorer": "app",
  dashboard: "app",
  settings: "app",
  team: "app",
  marketing: "marketing",
  pricing: "marketing",
  product: "marketing",
  "docs-site": "content",
  article: "content",
  "help-center": "content",
  changelog: "content",
  "sign-in": "flows",
  onboarding: "flows",
  checkout: "flows",
  booking: "flows",
  "not-found": "system",
};

function authoredSections(t: Translate): Omit<TemplateSection, "group">[] {
  return [
    {
      id: "app-shell",
      navLabel: t("templates.appShellNavLabel"),
      title: t("templates.appShellTitle"),
      label: t("templates.appShellLabel"),
    },
    {
      id: "app-shell-explorer",
      navLabel: t("templates.explorerNavLabel"),
      title: t("templates.explorerTitle"),
      label: t("templates.explorerLabel"),
    },
    {
      id: "marketing",
      navLabel: t("templates.marketingNavLabel"),
      title: t("templates.marketingTitle"),
      label: t("templates.marketingLabel"),
    },
    {
      id: "docs-site",
      navLabel: t("templates.docsSiteNavLabel"),
      title: t("templates.docsSiteTitle"),
      label: t("templates.docsSiteLabel"),
    },
    {
      id: "dashboard",
      navLabel: t("templates.dashboardNavLabel"),
      title: t("templates.dashboardTitle"),
      label: t("templates.dashboardLabel"),
    },
    {
      id: "checkout",
      navLabel: t("templates.checkoutNavLabel"),
      title: t("templates.checkoutTitle"),
      label: t("templates.checkoutLabel"),
    },
    {
      id: "pricing",
      navLabel: t("templates.pricingNavLabel"),
      title: t("templates.pricingTitle"),
      label: t("templates.pricingLabel"),
    },
    {
      id: "sign-in",
      navLabel: t("templates.signInNavLabel"),
      title: t("templates.signInTitle"),
      label: t("templates.signInLabel"),
    },
    {
      id: "settings",
      navLabel: t("templates.settingsNavLabel"),
      title: t("templates.settingsTitle"),
      label: t("templates.settingsLabel"),
    },
    {
      id: "onboarding",
      navLabel: t("templates.onboardingNavLabel"),
      title: t("templates.onboardingTitle"),
      label: t("templates.onboardingLabel"),
    },
    {
      id: "product",
      navLabel: t("templates.productNavLabel"),
      title: t("templates.productTitle"),
      label: t("templates.productLabel"),
    },
    {
      id: "article",
      navLabel: t("templates.articleNavLabel"),
      title: t("templates.articleTitle"),
      label: t("templates.articleLabel"),
    },
    {
      id: "help-center",
      navLabel: t("templates.helpCenterNavLabel"),
      title: t("templates.helpCenterTitle"),
      label: t("templates.helpCenterLabel"),
    },
    {
      id: "booking",
      navLabel: t("templates.bookingNavLabel"),
      title: t("templates.bookingTitle"),
      label: t("templates.bookingLabel"),
    },
    {
      id: "changelog",
      navLabel: t("templates.changelogNavLabel"),
      title: t("templates.changelogTitle"),
      label: t("templates.changelogLabel"),
    },
    {
      id: "team",
      navLabel: t("templates.teamNavLabel"),
      title: t("templates.teamTitle"),
      label: t("templates.teamLabel"),
    },
    {
      id: "not-found",
      navLabel: t("templates.notFoundNavLabel"),
      title: t("templates.notFoundTitle"),
      label: t("templates.notFoundLabel"),
    },
  ];
}

/**
 * Every template, ordered by group (and by the authored order inside one), so the stage, the rail and the
 * drawer all walk the same sequence: scrolling the page goes down the rail.
 */
export function templateSections(t: Translate): TemplateSection[] {
  const withGroup = authoredSections(t).map((section) => ({ ...section, group: GROUP_OF[section.id] ?? "system" }));
  return GROUP_ORDER.flatMap((group) => withGroup.filter((section) => section.group === group));
}

export function templateGroups(t: Translate): TemplateGroup[] {
  const sections = templateSections(t);
  return GROUP_ORDER.map((id) => ({
    id,
    label: t(`templates.group.${id}` as Parameters<Translate>[0]),
    sections: sections.filter((section) => section.group === id),
  })).filter((group) => group.sections.length > 0);
}
