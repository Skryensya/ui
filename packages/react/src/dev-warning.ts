type BundlerImportMeta = ImportMeta & { env?: { DEV?: boolean } };
const moduleMeta = import.meta as BundlerImportMeta;
type NodeLikeProcess = { env?: { NODE_ENV?: string } };
const nodeProcess = (globalThis as { process?: NodeLikeProcess }).process;

/*
 * Two independent reads, not one: `import.meta.env.DEV` (Vite/Astro) and `process.env.NODE_ENV`
 * (webpack, Jest, plain Node) have been seen to disagree between the SSR pass and the client
 * bundle in this exact kit (`@skryensya/react` ships source, not a prebuilt dist, so each side
 * transforms this file on its own - found on the button break harness, SSR true, client
 * undefined). Either signal saying "this is dev" is enough; both have to say "production" to
 * silence the warning below, so a mismatched or absent signal still errs toward showing it.
 */
export const dev = moduleMeta.env?.DEV ?? nodeProcess?.env?.NODE_ENV !== "production";

/*
 * Keep the component name visually distinct in the console while presenting the issue, context,
 * and fix as one readable message. Callers spread the tuple into console.error for `%c` styling.
 */
/*
 * A REF CALLBACK, not a rendered prop: `data-sk-a11y-warn` must never be part of the HTML React
 * hydrates against. `dev` is a build-time constant, and `@skryensya/react` ships these components
 * as source rather than a prebuilt dist (package.json's own `exports`), so Astro's SSR pass and the
 * client bundle it hands the browser can each inline `import.meta.env.DEV` to a DIFFERENT literal -
 * a real case, found on the button break harness (SSR `""`, client `undefined`), not a theoretical
 * one. React's hydration diff then has an attribute it "won't be patched up" and discards the whole
 * subtree to recover.
 *
 * A ref callback runs only in the browser, after the server's markup is already committed, so
 * there is nothing left for the two sides to disagree about: this attribute simply never reaches
 * the hydration diff at all, on either side, regardless of what `dev` resolves to where.
 */
export function a11yWarnRef(warn: boolean) {
  return (el: Element | null): void => {
    if (!el) return;
    if (dev && warn) el.setAttribute("data-sk-a11y-warn", "");
    else el.removeAttribute("data-sk-a11y-warn");
  };
}

export function devTicket(component: string, rows: Record<string, string>): [string, string, string, string] {
  const issue = rows.issue ?? "";
  const explanation = [rows.why, rows.fix].filter(Boolean).join(" ");
  return [
    `%c${component}%c - ${issue}${explanation ? `%c\n${explanation}` : ""}`,
    "background:#18181b;color:#fff;font-weight:600;padding:1px 4px;border-radius:3px;font-family:ui-monospace,monospace;font-size:11px",
    "color:inherit;font-weight:600",
    "color:#71717a;font-weight:400;font-style:italic",
  ];
}
