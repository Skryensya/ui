# Reference Studio and Chrome Clipper

Reference ingestion is an internal working subsystem, not another example catalogue and not part of
Maker. [ADR 37](decisions/0037-references-are-evidence-until-published-through-git.md) records its boundary.

| Workspace | Responsibility |
| --- | --- |
| `apps/reference-clipper` | MV3 extension: page, region or element evidence, screenshots, submission and opening Studio. |
| `apps/reference-studio` | React working environment: Inbox filters, comparison, workbench, classification, review and exact publication previews. Uses the Skryensya binding and contract sheets. |
| `packages/reference-model` | Shared runtime schemas, provenance, lifecycle, requests and typed boundaries. Reuses the catalogue's subjects, scales and intent taxonomy. |
| `packages/reference-server` | Independent PostgreSQL/memory stores, asset adapters, HTTP API and revision-aware orchestration. PostgreSQL notifications feed authenticated SSE. |
| `packages/reference-classifier` | Jev Choice adapter and hierarchical domain → area → intent proposals; no generative agent. |
| `packages/reference-publisher` | Curated `pattern`, `use` and `fixed` generation, committed-snapshot validation and GitHub publication. |

## Run locally

Collection requires the repository's Node/pnpm versions, Docker (or another PostgreSQL instance),
asset storage and an internal API token. **GitHub is optional:** leave `REFERENCE_GITHUB_TOKEN` blank
to capture, inspect, classify manually, review and accept references without creating PRs. Add the
GitHub owner/repository/token and restart later to enable publication; existing references remain intact.
A publication token needs **Contents: write** and **Pull requests: write** for the target repository.
`TYPESAFE_API_KEY` is also optional: without it, automatic classification reports unavailable and the
reference enters review for manual classification. Never put a GitHub token in Studio or Clipper.

```sh
pnpm install
cp packages/reference-server/.env.example packages/reference-server/.env
# Fill in the API token and extension origin; provider/GitHub credentials are optional.
docker compose -f packages/reference-server/docker-compose.yml up -d --wait

# Start the server in one terminal. It reads packages/reference-server/.env on its own.
# It is left out of the root `pnpm dev` because it needs Postgres and secrets.
pnpm dev:references

# In another terminal:
pnpm --filter @skryensya/reference-studio dev
pnpm --filter @skryensya/reference-clipper build
```

Load `apps/reference-clipper/dist` as an **unpacked extension** in `chrome://extensions` with Developer
mode enabled. Copy its extension ID into `REFERENCE_ALLOWED_ORIGINS` as `chrome-extension://<id>` and
restart the server. Set Server (`http://localhost:4318`), Studio (`http://localhost:5174`) and the API
token in the popup's Connection panel. It requests host access only to that server. Page access uses
`activeTab` and `scripting`; no permanent crawling permissions are granted.

Open an HTTP(S) website, open Clipper and choose Page, Region or Element. Region/Element adds a
temporary selection overlay; Escape cancels. Keep the tab active while screenshots are captured.
The service worker handles capture even when selecting on the website closes the popup. Failure
messages are retained for the next popup opening. A successful submission opens the ingest route in
Studio; connect with the API token. Studio proposes classification on first opening a captured ingest.
Classifier failure returns the ingest to review, where manual classification or another attempt is
possible. A processing job can also explicitly be returned to review after interruption.

The original page title is retained in raw evidence even when a custom capture title is supplied.
Snapshots capture semantic DOM facts, not HTML executable code: tag, role, ARIA attributes, links,
input types, heading level, direct text, child hierarchy, computed layout/appearance and document
rectangles. Input values, framework internals and script contents are not collected. Page screenshots
are viewport tiles stitched by the extension with throttled capture calls and restored scroll position.
Canvas limits cause a visible error rather than silent truncation. DOM collection is bounded and marks
`truncated` evidence. Fixed/sticky elements can repeat in page tiles; dynamically changing pages,
closed shadow roots, cross-origin frames and browser-restricted pages are not reconstructed. Inspect
evidence before accepting it. Screenshot pixels and visible text can contain private information;
only capture material you are authorized to retain.

## Working and publishing

Inbox contains captured/processing/review records. References includes every state. Filters are
server-side and paginated: status, subject, scale, intent prefix, hostname, UTC capture dates,
minimum proposal confidence, published/unpublished and exact structure fingerprint. Compare up to
three references side by side. Structure/DOM/Text/Source show evidence without executing captured code.
Similar initially finds exact normalized structure hashes, without embeddings. The server persists
small, decoded PNG thumbnails separately so Inbox does not download full-page screenshots.

Only edited or explicitly confirmed classification fields become human-owned. **Confirm classification
values** stages unchanged proposals as human decisions; save to commit that ownership. New classifier
runs preserve those fields;
confidence and implementation/model version remain visible. Each successful classifier run is retained
as an immutable, versioned snapshot in `reference_classification_runs` and can be inspected in Source. Human decisions do not acquire invented
classifier confidence. Notes and ratings are working review data. Classification and review edits save atomically on one
revision. Unsaved drafts survive SSE updates;
obsolete revisions fail with 409 instead of overwriting newer work. Accepted records must return to
review before editing. Published evidence remains inspectable and cannot be deleted through the API.

Publication deliberately requires human curation:

- **Existing pattern + new use:** select a pattern ID from the existing catalogue and supply its
  bilingual content fields. The classification scale must match that pattern.
- **New pattern:** supply a layout description, named bilingual field descriptions, bilingual first-use
  content and an authored UsageTree template. A whole string value `"{{field}}"` substitutes a content
  field. This is a small deterministic authoring facility, not automatic DOM-to-pattern extraction.
- **Fixed:** supply an authored UsageTree. Fixed trees may have English-only body copy, consistent with
  existing fixed examples; titles and purpose are entered in both locales.

The publication view shows the **exact generated files**, Git base SHA and gate output. The original
source URL is included in provenance/PR metadata: inspect it and curated copy for private paths,
credentials or query tokens before publishing. Only a passing
preview on the current ingest revision can create a PR. Previews are bounded, ephemeral and must be
regenerated after a server restart or ingest edit. Durable publication attempts live in PostgreSQL.

The publisher reads **committed HEAD**, not uncommitted working files. Use a dedicated clean checkout
whose HEAD matches the configured GitHub base branch; update it before previewing new work. Commit the
subsystem and any catalogue type fixes before deployment. Generated files enter a detached temporary
worktree; offline frozen installation binds workspace imports to that snapshot. The existing
`pnpm --filter @skryensya/ai-compiler check` checks contracts, example filing, both locales,
accessibility review and stylesheet coverage. There is no duplicate example validator. Ensure the
pnpm store is hydrated with `pnpm install` before publishing. Validation failure creates no branch or
PR. Repository CI (including applicable visual gates) still runs on the PR before merge.

GitHub's Git API creates a tree based on the validated commit, a new commit and a unique
`reference/<ingest-id>/<attempt-id>` branch, then opens a PR. It never patches the base branch.
If GitHub's base SHA moved, publication fails closed and requires a fresh checkout/preview. The PR
includes source, date, classification, ingest ID, mode, generated paths and validation results.

Creating a PR leaves the ingest **publishing**, with the attempt **pr-open**. After merging, use
**Verify merge and mark published**: the server checks GitHub's merged flag, recorded head SHA and base
branch before transitioning. If human review changes the PR head, inspect its diff and CI results and
explicitly **Refresh GitHub receipt** before verifying merge. The new commit is not silently accepted;
publication is never inferred from an optimistic button click. No automatic merge is implemented.

A network failure can occur after GitHub accepted a PR but before the receipt was saved. **Refresh
GitHub receipt** finds an existing PR on the recorded attempt branch and persists its metadata without
creating another PR. Inspect failed/pending attempts before retrying. If a process terminates before
any PR exists, a pending publishing lease requires operator inspection/recovery; the MVP does not
silently abandon potentially in-flight external operations. Raw assets are retained independently of
publication. Orphaned uploads from failed ingest creation need an operator retention policy, not Git.

## Persistence and deployment

For the production domains `ref.skryensya.dev` and `ref-api.skryensya.dev`, see the
[Dokploy deployment guide](reference-dokploy.md). It uses the Studio/API Dockerfiles and R2, with GitHub
publication disabled initially.

PostgreSQL stores ingests, captures, classifications, reviews and multiple publication attempts in
separate tables. Filter dimensions are relational columns with indexes; per-field provenance is a
small JSONB document, not a screenshot or the entire ingest. SQL writes and child-table changes are
transactional and locked against the supplied revision. `LISTEN/NOTIFY` announces only committed
changes across processes. Schema initialization is idempotent in `src/schema.sql`.

Assets use `AssetStore`: memory for tests, filesystem for development, SigV4 path-style S3/R2 for
production. Set the S3 variables in `.env.example`; PostgreSQL stores object keys only. Back up both
PostgreSQL and the asset bucket, and restrict bucket access. Publication does not erase raw evidence.
The local `tmp/reference-assets` directory is ignored by Git.

The standalone server defaults to PostgreSQL. `REFERENCE_STORE=memory` is explicitly ephemeral and
intended for tests/dev. It defaults to loopback with a strict origin allowlist and authenticates all
API and asset routes. Studio keeps the API token only in memory; Clipper keeps its token in extension
local storage. Use TLS and an internal access gateway for production; this MVP is not a public,
multi-tenant identity or authorization service. Do not expose it unauthenticated to the Internet.
Jev receives captured semantic evidence for bounded classification; review your data policy first.

## HTTP API

All writes except ingest creation include `baseRevision`; stale updates return **409**. All requests
use `Authorization: Bearer <REFERENCE_API_TOKEN>`. Validation errors return **400**; unavailable ingests
return **404**; domain/publication failures return **422**. Asset paths are scoped to an authorized
ingest rather than accepting arbitrary object keys.

```text
POST   /api/ingests                              CaptureInput
GET    /api/ingests                              shared IngestFilter query parameters
GET    /api/ingests/:id
PATCH  /api/ingests/:id                          { baseRevision, fields?, notes?, rating? }
DELETE /api/ingests/:id                          { baseRevision }
GET    /api/ingests/:id/screenshot
GET    /api/ingests/:id/thumbnail
GET    /api/ingests/:id/raw
GET    /api/ingests/:id/events                    authenticated SSE
POST   /api/ingests/:id/classify                 { baseRevision }
PATCH  /api/ingests/:id/classification           { baseRevision, fields }
POST   /api/ingests/:id/accept                    { baseRevision }
POST   /api/ingests/:id/reject                    { baseRevision }
POST   /api/ingests/:id/review                    { baseRevision }
POST   /api/ingests/:id/publication/preview       { baseRevision, request: PublicationRequest }
POST   /api/ingests/:id/publication/publish       { baseRevision, digest }
POST   /api/ingests/:id/publication/reconcile     { baseRevision, publicationId }
POST   /api/ingests/:id/publication/merged        { baseRevision, publicationId }
```

Canonical types and runtime parsers live in `@skryensya/reference-model`. For manual PATCHes,
`fields.subject`, for example, is `{ value: "card", source: "human" }`; arbitrary categories and forged
classifier ownership are refused. The publisher never accepts generated file contents from the client:
it publishes only a server-issued preview bound to the ingest revision.

## Tests

```sh
pnpm --filter './packages/reference-*' --filter './apps/reference-*' check
pnpm --filter @skryensya/reference-clipper --filter @skryensya/reference-studio build

# Dedicated local/test PostgreSQL only. Without this variable parity tests explicitly skip.
REFERENCE_TEST_DATABASE_URL=postgres://reference:reference@127.0.0.1:5434/reference \
  pnpm --filter @skryensya/reference-server test

# Optional: real compiler validation for all three modes on a committed catalogue checkout.
REFERENCE_TEST_REPO_ROOT=/absolute/path/to/clean/checkout \
  pnpm --filter @skryensya/reference-publisher test
```

Tests cover parsers/lifecycle/provenance, taxonomy-bounded Jev responses, memory/PostgreSQL store
semantics, HTTP auth/validation/concurrency, asset adapters, classification and publication orchestration,
stable previews and GitHub boundaries, React triage/edit/review/preview interactions, and Clipper
payload/submission/failure/opening behavior. Provider/GitHub calls are deterministic test doubles;
credentials and live external services are needed for deployment verification. Browser selection,
stitching and permissions should also be checked with an unpacked extension on actual websites.

Deferred: embeddings, automatic extraction/equivalence, autonomous publication, crawling and merge.
