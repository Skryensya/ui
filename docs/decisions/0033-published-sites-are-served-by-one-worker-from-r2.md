---
num: 33
title: Published sites are served by one Worker from R2, and one token publishes
short: "Publishing"
summary: >-
  A Maker project is published as static files at <name>.skryensya.dev. One Cloudflare Worker on the
  route *.skryensya.dev serves every site from one R2 bucket, and takes publications at
  publish.skryensya.dev behind a single token that only the publishing machine holds. Publishing a
  new site touches no DNS and creates nothing in Cloudflare.
---

> **Withdrawn** (2026-10-06): the Maker no longer hosts anything. What it produces is code (React, vanilla HTML),
> so the publish path, the site kit and `apps/sites-worker` were removed.

A published site is the project rendered by the emitter (the markup `validate_ui` returns), one HTML
document per page, plus the shared site kit (every stylesheet and the vanilla enhancers), uploaded
under a content hash so every site after the first reuses it.

## One Worker, not a project per site

Cloudflare Pages would make each site a project with its own custom domain, created through the API
with an account-wide token, within a per-account limit of projects. One Worker on `*.skryensya.dev/*`
reads the site's name from the host and serves `sites/<name>/…` from R2, so a new site is only new
files. The wildcard stays one level deep because the free Universal certificate covers exactly that.

## One token, and it never leaves two places

The Worker has the only R2 binding. The Maker sends publications to the Worker with a bearer token
(a Worker secret, and `SITES_PUBLISH_TOKEN` on the one machine that publishes); it holds no
Cloudflare credential at all. A publication is written whole before the site's `current` pointer
moves, so a visitor sees the old site or the new one.

## The route catches everything

A Worker route ignores DNS, so `*.skryensya.dev/*` also matches `ui.skryensya.dev`. Reserved names,
and whatever `PASSTHROUGH` lists, are handed to their own origin untouched; every other name is a
site or a 404. Adding a subdomain outside the Maker means reserving it or listing it first.

## Nothing an author writes runs

Markup comes from the contract, text is escaped, `style` and `class` are not authorable, and the
validator's `unsafe-url` rule (added for this) refuses `javascript:` and `data:` documents anywhere a
URL lands, allowing inline images only where an image is loaded. The Worker adds a CSP with
`script-src 'self'`: the kit runs, nothing else does.

## Consequences

- Publishing is available only where the token is. People besides the owner publishing would need
  accounts and, then, a separate domain for their sites (the way github.io is not github.com).
- HTML is cached for a minute, so a new publication or a takedown shows within that minute rather
  than at once, with no purge call and no Cloudflare API token to make one.
