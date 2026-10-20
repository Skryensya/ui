// Shared harnesses cover existing catalog entries, not extra components called "content" or "selection".
const sharedTargets: Record<string, readonly string[]> = {
  content: ["/components/text", "/components/heading", "/components/link"],
  selection: ["/components/switch", "/components/radio-group"],
  "file-upload": ["/components/drop-zone"],
  "nav-list": ["/nav-list"],
  details: ["/components/accordion"],
  hotkey: ["/hotkey"],
  scrollbar: ["/scrollbar"],
  vaul: ["/vaul"],
};

export function getBreakCoverage(
  harnesses: readonly { href: string }[],
  components: readonly { href: string }[],
) {
  const targets = new Set(
    harnesses.flatMap(({ href }) => {
      const slug = href.replace("/debug/", "").replace(/-break$/, "");
      return sharedTargets[slug] ?? [`/components/${slug}`];
    }),
  );
  const catalog = new Set(components.map(({ href }) => href));
  return {
    covered: [...catalog].filter((href) => targets.has(href)).length,
    total: catalog.size,
  };
}
