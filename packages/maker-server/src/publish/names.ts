/*
 * SITE NAMES: the subdomain a published site lives at, `<name>.skryensya.dev`. Shared by the
 * Maker's server, which refuses a bad name before anything is uploaded, and the sites Worker, which
 * refuses to serve one.
 *
 * A DNS label (letters, digits and inner hyphens, at most 63), lowercase, and none of the names the
 * domain keeps for itself or that a person would trust as the domain's own: an explicit DNS record
 * wins over the wildcard anyway, but a reserved name must not even be publishable.
 */
export const RESERVED_NAMES: ReadonlySet<string> = new Set([
  "www", "ui", "api", "app", "admin", "publish", "mail", "smtp", "imap", "pop", "mx", "ns", "ns1", "ns2",
  "dns", "ftp", "ssh", "vpn", "status", "docs", "doc", "help", "support", "blog", "cdn", "static", "assets",
  "auth", "login", "signin", "account", "accounts", "billing", "pay", "payments", "secure", "security",
  "dashboard", "console", "dev", "staging", "stage", "test", "preview", "maker", "mcp", "playground",
  "storybook", "id", "sso", "oauth", "webmail", "autodiscover", "autoconfig", "_dmarc", "_domainkey",
]);

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function siteNameProblem(name: string): string | undefined {
  if (!LABEL.test(name)) return `"${name}" is not a site name: lowercase letters, digits and inner hyphens, at most 63.`;
  if (RESERVED_NAMES.has(name)) return `"${name}" is reserved.`;
  return undefined;
}

/** A name to start from, derived from a project's name: "Café Aurora" → "cafe-aurora". */
export function suggestSiteName(projectName: string): string {
  const slug = projectName
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
  return slug && !RESERVED_NAMES.has(slug) ? slug : `site-${slug || "new"}`;
}
