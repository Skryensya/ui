# Deploy Reference Studio on Dokploy (collection first)

This deployment starts collecting without GitHub. Jev is optional; without its key, classify manually.
The Chrome Clipper runs in Chrome, not on Dokploy.

## 1. Commit the code and configure DNS

Dokploy builds from a Git commit. Commit/push the subsystem and Dockerfiles to your chosen deployment
branch first; do not deploy a branch that does not contain them. No commit/push is performed by this guide.

In the DNS zone for `skryensya.dev`, point both records at the Dokploy server's public IP:

| Type | Name | Value |
| --- | --- | --- |
| A | `ref` | Dokploy server IPv4 |
| A | `ref-api` | Dokploy server IPv4 |

Only add AAAA records if the server has working IPv6. If Cloudflare manages DNS, start with **DNS only**
(gray cloud) until HTTPS works. Ports 80 and 443 must reach Dokploy's Traefik. No public database port is needed.

## 2. Create PostgreSQL

Create a Dokploy project, then a **PostgreSQL** database service in that project. Use a dedicated
`reference` database/user and a strong password. Start it, then copy its **internal connection URL**.
The API must share its Docker network. Use the database service hostname, not `localhost`, and do not
expose PostgreSQL publicly. Dokploy PostgreSQL storage must be persistent; configure backups.

## 3. Create the API application

Create an **Application** in the project, connected to this monorepo and the deployment branch.
Choose the **Dockerfile** build type:

| Setting | Value |
| --- | --- |
| Dockerfile Path | `packages/reference-server/Dockerfile` |
| Docker Context Path | `.` (repository root) |
| Docker Build Stage | leave blank |

The API image runs as a non-root user and listens on **4318**. Do not change the build context to the
package folder: its workspace dependencies live elsewhere in the monorepo.

In the application's **Environment** section, add runtime variables (not build arguments):

```dotenv
REFERENCE_DATABASE_URL=PASTE_DOKPLOY_INTERNAL_POSTGRES_URL
REFERENCE_API_TOKEN=PASTE_A_LONG_RANDOM_TOKEN
REFERENCE_HOST=0.0.0.0
REFERENCE_PORT=4318
REFERENCE_ALLOWED_ORIGINS=https://ref.skryensya.dev
REFERENCE_S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
REFERENCE_S3_BUCKET=YOUR_BUCKET_NAME
REFERENCE_S3_REGION=auto
REFERENCE_S3_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_ID
REFERENCE_S3_SECRET_ACCESS_KEY=YOUR_R2_SECRET_ACCESS_KEY
# Optional, for automatic classification:
TYPESAFE_API_KEY=
REFERENCE_JEV_MODEL=jev-1.13
# Leave blank while collecting:
REFERENCE_GITHUB_TOKEN=
```

Generate the internal token locally with `openssl rand -hex 32`. Keep it in a password manager; you
will enter it in Studio and Clipper. Never put R2, Jev or GitHub secrets into Studio, build arguments,
Dockerfiles or source control. R2 credentials need Object Read & Write on the dedicated private bucket.
R2 does not need a public URL or browser CORS rules because the API accesses it server-side.

In **Domains → Add Domain**, configure:

| Setting | Value |
| --- | --- |
| Host | `ref-api.skryensya.dev` |
| Path | `/` |
| Container Port | `4318` |
| HTTPS | enabled |
| Certificate | Let's Encrypt |

Leave internal HTTPS disabled: Traefik terminates TLS and forwards HTTP to the container. Do not
publish a separate host port. Save, deploy, and inspect logs. The schema initializes automatically.
Keep API response streaming enabled: do not attach response-buffering middleware to its SSE routes.
Health checks must include the bearer token; `/api/health` is deliberately authenticated.

## 4. Create Studio

Create a second **Application** using the same repository/branch and **Dockerfile** build type:

| Setting | Value |
| --- | --- |
| Dockerfile Path | `apps/reference-studio/Dockerfile` |
| Docker Context Path | `.` |
| Docker Build Stage | leave blank |

No runtime secrets are needed. The image builds the frontend and serves it using unprivileged Nginx
on **8080**. Its compiled default API URL is already `https://ref-api.skryensya.dev`. If you change
that URL later, set the public build argument `VITE_REFERENCE_API_URL` and rebuild, not just restart.

In **Domains → Add Domain**:

| Setting | Value |
| --- | --- |
| Host | `ref.skryensya.dev` |
| Path | `/` |
| Container Port | `8080` |
| HTTPS | enabled |
| Certificate | Let's Encrypt |

Save and deploy. Open `https://ref.skryensya.dev`, verify the API URL, and connect with the internal API
token. This is an internal single-token tool, not a multi-user identity system; add an access gateway
if needed. Any gateway protecting the API must allow authenticated extension requests and SSE.

## 5. Install Clipper and authorize its origin

On your computer, from the monorepo:

```sh
pnpm install --frozen-lockfile
pnpm --filter @skryensya/reference-clipper build
```

Open `chrome://extensions`, enable Developer mode, and load `apps/reference-clipper/dist` unpacked.
Copy its extension ID. Update the API's Dokploy runtime environment to:

```dotenv
REFERENCE_ALLOWED_ORIGINS=https://ref.skryensya.dev,chrome-extension://YOUR_EXTENSION_ID
```

Redeploy the API. In Clipper's Connection panel, set:

- Server: `https://ref-api.skryensya.dev`
- Studio: `https://ref.skryensya.dev`
- Token: the same `REFERENCE_API_TOKEN`

Allow the requested API host permission. Capture a public HTTP(S) page and keep its tab active during
capture. Verify that it opens in Studio and that screenshot/DOM evidence remains after redeploying the
API. With no Jev key, the first classification attempt reports unavailable and enters review; manually
set subject, scale and intent, then save and accept. No GitHub configuration is needed.

## Publication later

These images are configured for **collection**, not a self-updating publisher checkout. The Docker
context deliberately excludes `.git`; never initialize a fake repository in the container.

Before enabling GitHub, provision a dedicated clean checkout at `/catalogue` (or change
`REFERENCE_REPO_ROOT`), with its real HEAD matching the GitHub base branch, writable Git worktree
metadata, and all frozen workspace dependencies hydrated in the pnpm store for offline validation.
A checkout mount alone is not enough. Plan its update procedure after each merge. Then configure the
GitHub owner, repository and write-scoped token and restart. Existing references remain usable.

See [reference ingestion](reference-ingestion.md) for publication, retention and recovery details.

## Troubleshooting

- **404 at a domain:** verify DNS, domain Host/Path and the selected application.
- **502:** verify the target port (8080 for Studio, 4318 for API), deployment logs and database network.
- **401:** Studio/Clipper's token must equal the API's runtime token.
- **CORS failure:** the exact Studio origin and installed extension ID must be in the API allowlist.
- **R2 error:** use the S3 API endpoint and S3 access keys, not a public bucket URL or general Cloudflare token.
- **API URL stays localhost:** clear the saved Server field in Studio and use the production URL; check
  that Dokploy used the new Studio Dockerfile and rebuilt it.

Dokploy references: [Dockerfile builds](https://docs.dokploy.com/docs/core/applications/build-type),
[domains](https://docs.dokploy.com/docs/core/domains/others).
