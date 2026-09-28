# @skryensya/sites-worker

One Cloudflare Worker serves every site the Maker publishes, at `https://<name>.skryensya.dev/`, from
one R2 bucket; and takes new publications at `https://publish.skryensya.dev/`, behind a token. See
[ADR-0033](../../docs/decisions/0033-published-sites-are-served-by-one-worker-from-r2.md).

Nothing here needs a paid plan: a proxied wildcard record, the Universal certificate (it covers
`*.skryensya.dev`, one level deep), a Worker, and R2 are all on Cloudflare's free tier. R2 may ask for
a payment method on file before it is enabled, even though usage within the free tier costs nothing.

## One-time setup

1. **Check the subdomains that already exist.** In the dashboard, DNS › Records for `skryensya.dev`.
   The Worker's route catches every subdomain, so each existing one that is not in
   `RESERVED_NAMES` (`packages/maker-server/src/publish/names.ts`: `ui`, `www`, `api`, `mail`, …) must
   be added to `PASSTHROUGH` in `wrangler.toml` first, or the Worker will answer for it.
2. **Log in and create the bucket.**
   ```bash
   cd apps/sites-worker
   npx wrangler@4 login
   npx wrangler@4 r2 bucket create skryensya-sites
   ```
3. **Point every subdomain at Cloudflare.** DNS › Add record: type `AAAA`, name `*`, IPv6 `100::`,
   proxied (orange cloud). `100::` is a discard address: the Worker answers before any origin is
   asked. Existing records keep winning over the wildcard.
4. **Set the publish token**, a long random secret that only the Worker and your Maker know:
   ```bash
   openssl rand -base64 48            # copy the output
   npx wrangler@4 secret put PUBLISH_TOKEN
   ```
5. **Deploy the Worker.**
   ```bash
   pnpm --filter @skryensya/sites-worker deploy
   ```
6. **Give the Maker the same token** in `apps/maker/.env.local` (git-ignored; see `.env.example`):
   ```
   SITES_PUBLISH_TOKEN=<the same token>
   ```
   then build the site kit once and start the Maker:
   ```bash
   pnpm --filter @skryensya/maker-server build:kit
   pnpm --filter @skryensya/maker dev
   ```
   The Maker's log says `publishing to https://publish.skryensya.dev`. Open a project, press
   **Publish**, choose the name.

## Everyday

- Rebuild the kit (`build:kit`) after the kit changes; the next publication uploads it under a new hash
  and older sites keep theirs.
- Rotate the token: `wrangler secret put PUBLISH_TOKEN` again and update `.env.local`.
- The last five publications of each site stay in R2; unpublishing removes the pointer, so nothing is
  served, and the name stays with its project.

## Trying it without Cloudflare

```bash
SITES_PUBLISH_TOKEN=local pnpm --filter @skryensya/sites-worker dev:local
```

and in `apps/maker/.env.local`: `SITES_PUBLISH_TOKEN=local`, `SITES_PUBLISH_URL=http://localhost:8788`,
`SITES_DOMAIN=localhost:8788`. Published sites answer at `http://<name>.localhost:8788/` until the
process stops.

## Security

- The Maker holds one secret, the publish token; no Cloudflare account token or R2 key ever leaves
  Cloudflare. Whoever does not have the token cannot publish, which today means only you.
- Publications are accepted on `publish.skryensya.dev` only; a site's own host never takes one.
- Sites carry no author code: markup comes from the emitter, text is escaped, `style` and `class` are
  not authorable, and a URL that runs code (`javascript:`, a `data:` document, an SVG link) refuses
  the whole publication.
- Every response carries a CSP with no inline or foreign script (`script-src 'self'`), no framing,
  `nosniff`, and a strict referrer policy.
