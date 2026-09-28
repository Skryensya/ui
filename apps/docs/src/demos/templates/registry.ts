import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Locale, Translate } from "../../i18n";
import { appShellExplorerTree, appShellTree } from "../app-shell";
import { articleTree } from "./article";
import { bookingTree } from "./booking";
import { changelogTree } from "./changelog";
import { checkoutTree } from "./checkout";
import { dashboardTree } from "./dashboard";
import { docsSiteTree } from "./docs-site";
import { helpCenterTree } from "./help-center";
import { marketingTree } from "./marketing";
import { notFoundTree } from "./not-found";
import { onboardingTree } from "./onboarding";
import { pricingTree } from "./pricing";
import { productTree } from "./product";
import { settingsTree } from "./settings";
import { signInTree } from "./sign-in";
import { teamTree } from "./team";

/*
 * EVERY PAGE TEMPLATE'S TREE, by section id, in one place. The gallery renders them, the test holds
 * them to their contracts, and `scripts/generate-templates.ts` writes them out for the Maker: three
 * readers of one list, so a template added here is added everywhere. The section list itself (ids,
 * labels, order) stays in `lib/templates-nav.ts`.
 */
export function templateTrees(t: Translate, locale: Locale): Record<string, () => UsageTree> {
  return {
    "app-shell": () => appShellTree(t),
    "app-shell-explorer": () => appShellExplorerTree(t),
    marketing: () => marketingTree(t),
    "docs-site": () => docsSiteTree(t),
    dashboard: () => dashboardTree(t, locale),
    checkout: () => checkoutTree(t, locale),
    pricing: () => pricingTree(t, locale),
    "sign-in": () => signInTree(t),
    settings: () => settingsTree(t),
    onboarding: () => onboardingTree(t),
    product: () => productTree(t, locale),
    article: () => articleTree(t),
    "help-center": () => helpCenterTree(t),
    booking: () => bookingTree(t, locale),
    changelog: () => changelogTree(t),
    team: () => teamTree(t),
    "not-found": () => notFoundTree(t),
  };
}
