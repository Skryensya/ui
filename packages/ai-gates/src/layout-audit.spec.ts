import { test, expect, type Page } from "@playwright/test";
import { auditLayout } from "./layout-audit.js";

/*
 * THE AUDIT, PROVED TO FAIL. A layout rule that has never failed is a rule nobody knows works: it may be
 * measuring the wrong thing and passing everything. Each fixture below is a few lines of HTML that breaks
 * exactly one rule (and one that breaks none), so the audit in `patterns.spec.ts` is trusted for the right
 * reason: it can tell good from bad, not only that the patterns happen to pass.
 */
const page = (body: string) => `<!doctype html><html lang="en"><body style="margin:0;font:16px/1.4 sans-serif">${body}</body></html>`;
const edge = "border:1px solid #888;";

const fixtures: Record<string, { html: string; rule: string | null }> = {
  "a page that is aligned and breathes": {
    rule: null,
    html: page(`<header style="height:48px;${edge}">bar</header><main style="padding:24px"><div class="sk-stack" style="display:grid;gap:12px"><h1 style="margin:0">Title</h1><p style="margin:0">Body</p></div><aside class="sk-sidebar" style="${edge}padding:16px;width:200px"><nav><a href="#">One</a></nav></aside></main>`),
  },
  "a stack whose second child starts 20px to the right": {
    rule: "left-edge",
    html: page(`<header style="height:48px">bar</header><main style="padding:24px"><div class="sk-stack" style="display:grid;gap:12px"><h1 style="margin:0">Title</h1><p style="margin:0 0 0 20px">Body</p></div></main>`),
  },
  "a bordered box with 2px of padding": {
    rule: "breathing",
    html: page(`<header style="height:48px">bar</header><main style="padding:24px"><div class="sk-box" data-padding="sm" style="${edge}padding:2px"><p style="margin:0">Cramped</p></div></main>`),
  },
  "a navigation rail 90px wide": {
    rule: "rail-width",
    html: page(`<header style="height:48px">bar</header><main style="padding:24px"><aside class="sk-sidebar" style="${edge}padding:16px;width:90px;box-sizing:border-box"><nav><a href="#">Inbox</a></nav></aside></main>`),
  },
  "two bordered regions with no gap": {
    rule: "regions-apart",
    html: page(`<header style="height:48px">bar</header><main style="padding:24px"><div class="sk-inline" style="display:flex"><div class="sk-box" style="${edge}width:200px;height:100px;padding:16px;box-sizing:border-box">A</div><div class="sk-box" style="${edge}width:200px;height:100px;padding:16px;box-sizing:border-box">B</div></div></main>`),
  },
  "content 4px from the viewport edge": {
    rule: "viewport-gutter",
    html: page(`<header style="height:48px">bar</header><main style="padding:24px 0 24px 4px"><p style="margin:0">Hugging the edge</p></main>`),
  },
  "a shell whose rail stops halfway and whose main is as wide as its text": {
    rule: "shell-fills-row",
    html: page(`<header style="height:48px">bar</header><div style="display:flex;align-items:flex-start"><aside class="sk-sidebar" style="${edge}padding:16px;width:200px;box-sizing:border-box"><nav><a href="#">Inbox</a></nav></aside><main style="padding:24px"><p style="margin:0">Short</p></main></div>`),
  },
  "a shell whose rail ends well above the bottom of the page": {
    rule: "shell-fills-height",
    html: page(`<header style="height:48px">bar</header><div style="display:flex;align-items:flex-start;min-height:700px"><aside class="sk-sidebar" style="${edge}padding:16px;width:200px;box-sizing:border-box"><nav><a href="#">Inbox</a></nav></aside><main style="padding:24px;flex:1"><p style="margin:0">Fills the row</p></main></div>`),
  },
  "content touching the bar": {
    rule: "below-the-bar",
    html: page(`<header style="height:48px">bar</header><main style="padding:0 24px"><p style="margin:0">Right under it</p></main>`),
  },
};

async function audit(target: Page, html: string) {
  await target.setViewportSize({ width: 1280, height: 800 });
  await target.setContent(html);
  return (await target.evaluate(auditLayout)).map((finding) => finding.rule);
}

for (const [name, { html, rule }] of Object.entries(fixtures)) {
  test(rule ? `fails ${name} on "${rule}"` : `passes ${name}`, async ({ page: target }) => {
    const rules = await audit(target, html);
    if (rule === null) expect(rules).toEqual([]);
    else expect(rules).toContain(rule);
  });
}
