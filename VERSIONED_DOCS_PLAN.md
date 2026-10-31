# Plan: prepare minor-version documentation without releasing 0.0.4

Status: **proposed, not implemented**. Inspected checkout `184ffdbe` on 2026-10-30.
This document changes no package versions, Git tags, release PRs, workflows, or deployments.

To resume this work in a later session, start with [section 11](#11-resuming-this-plan-in-a-later-session).
Routine release automation is specified in [section 8.6](#86-automation-contract-setup-once-then-release-driven).

## 1. Agreed behavior and immediate hold

**A documentation version is a major.minor line, not a patch release.**

| Product change | Documentation behavior |
| --- | --- |
| `0.0.3` -> `0.0.4` | Update the same `0.0.x` documentation; no second set of pages or menu entry |
| `0.0.4` -> `0.1.0` | Preserve `0.0.x` as a separate website and start `0.1.x` |
| `1.2.3` -> `1.2.4` | Update the same `1.2.x` documentation |
| `1.2.4` -> `1.3.0` | Preserve `1.2.x` and start `1.3.x` |
| `1.3.7` -> `2.0.0` | Preserve `1.3.x` and start `2.0.x` |

This applies **before and after 1.0**. A major change also creates a new docs version. It replaces
the previous draft's major-only grouping after 1.0 and public exact-patch snapshot URLs.

The first implementation must make this capability ready while **remaining on 0.0.3**:

- Keep `version.txt`, the Release Please manifest, and all shipped package versions at `0.0.3`.
- Leave release PR [#2](https://github.com/Skryensya/ui/pull/2) open and unmerged. When inspected it
  proposed `0.0.4` and had no auto-merge configured; do not enable auto-merge as part of this work.
- Do not create `v0.0.4`, a GitHub Release, an archive, or a second publicly accessible docs website.
- Do not add a future `0.0.4` or `0.1.x` choice to production navigation.
- Implement and test the machinery separately from running a real freeze or activating a version.

The contract ledger already has `working: "0.0.4"`; that is an unpublished planning number, not a
reason to alter it or claim that `0.0.4` has shipped. Do not change it merely to enforce this hold.

There will intentionally be **no website switch between 0.0.3 and 0.0.4**. After 0.0.4 is approved,
the same `0.0.x` pages describe the latest patch, and release notes record the patch differences.

## 2. What freezing means

A freeze preserves a complete built docs line independently of the next line: HTML, EN/ES,
component demos, JS/CSS, fonts, search, reference data, fullscreen previews, and dated test evidence.
It includes the documentation's own header, sidebar, typography and layout, not only the kit demos.
It does not copy only prose or render old documentation with components from today's workspace.
Section 8 specifies deployment and how an optional later docs-only redesign is handled.

**Freeze at a minor/major boundary, not on every patch.** Preserve the latest approved released
patch of the outgoing line. Starting from today's `0.0.3`:

- If the next approved release is `0.0.4`, nothing needs a separate public freeze yet.
- If `0.1.0` is eventually released after `0.0.4`, freeze the `0.0.x` line from `v0.0.4`.
- If the next release were `0.1.0` without an intervening patch, freeze it from `v0.0.3` instead.

Do not freeze 0.0.3 now and later present it as the latest 0.0.x docs after 0.0.4 ships.
Preparing a future command or workflow is not permission to execute that freeze.

"Frozen" means independent of future minor-line development, not impossible to maintain:
a reviewed security patch or docs correction may refresh that line at the **same public URL**.
Product tags, published package bytes, and each recorded build artifact remain immutable.

## 3. Public URLs and selector

Use the existing domain and a major.minor path, before the locale:

| URL after the first approved minor transition | Meaning |
| --- | --- |
| `/v0.0/components/button` | Latest deployed documentation for `0.0.x` |
| `/v0.1/components/button` | Latest deployed documentation for `0.1.x` |
| `/v2.0/es/componentes/button` | Spanish documentation for `2.0.x` |
| `/components/button` | Convenience entry to the current stable line, preserving the page path |

Until the first minor transition is approved, keep today's bare URLs and one `0.0.x` selection.
At that transition, make the explicit minor paths canonical and have existing bare page URLs issue
revalidating **302 redirects** to the current line. This preserves existing bookmarks without
rendering a duplicate current site. A permanent 301 is wrong for a current pointer that can move.
Static metadata endpoints and assets need explicit routing exceptions, not a catch-all redirect.

Do **not** create public `/v0.0.3/` and `/v0.0.4/` HTML trees. There is one set of pages per docs
line. Build artifacts may record exact patch versions privately for provenance, rollback, or audit;
those are not separate browsable docs versions. Keep existing full-prefix parsing helpers if useful,
but do not mistake a parser accepting a URL for a website actually existing there.

The selector must group by the first **two** numeric components for all versions:

- Today: one `0.0.x` row, optionally disclosing `package 0.0.3`.
- After a future patch: still one `0.0.x` row, now disclosing `package 0.0.4`.
- After a future minor: `0.1.x - current` and `0.0.x - archived`, each showing its actual deployed patch.
- `2.0.x` and `2.1.x` must also remain separate rows; do not collapse them into `v2`.

### Switching in both directions

Old pages cannot have a permanently baked list of all future versions. Generate a small deployed
catalog, proposed endpoint `/docs-versions.json`, containing only verified available docs lines,
current status, the actual package patch, and route/locale availability.

Use the existing kit version menu. Its versioned navigation adapter may read that shared catalog;
it must not fetch current component code, contracts, or demos into an old snapshot. The adapter's
code and schema version travel with the build; only navigation/status metadata is live. Validate
catalog URLs and data before rendering, and test asynchronous updates with the kit's keyboard/focus
behavior. The archive transformer must add this adapter even when the old product tag predates it.

Thus a `0.0.x` page can offer `0.1.x` after activation without rebuilding its product examples.
Without JS, or if the catalog fails, show the selected line and a normal "Current documentation"
link. Never redirect a visitor to a new line merely because an update exists.

Switching preserves locale, the same page where present, and valid query/fragment state. A missing
page or translation in another line gets an explicit fallback explanation or that line's home;
it must not silently render today's page inside old chrome. Direct missing URLs remain version-local 404s.

## 4. Source of truth for the first freeze

The existing product tag `v0.0.3` resolves to:

```text
b756e3df39089ef89edc639fb98a50f53f372996
```

That commit is older than current `main` and the uncommitted docs work. A version badge saying
`0.0.3` does not prove that the entire live site or working tree is byte-for-byte that release.
Never bundle the dirty working tree or today's product code and label it a historical release.

When a real freeze is eventually authorized:

1. Resolve the outgoing line's latest approved product tag to its commit SHA. Use the deployed
   artifact directly if its provenance is already verified and matches the intended product patch.
2. Otherwise build in a clean, isolated checkout of that tag with its own lockfile and toolchain.
   Mark a backfilled site as reconstructed on its actual build date, not an original historical build.
3. If today's documentation improvements are wanted for that older product, review an explicit
   docs-only correction against the tag. Do not incorporate unrelated product changes from `main`.
4. Validate the tag against the branch's shipped package manifests and inventory. Historical tags,
   including `v0.0.3`, predate `version.txt` and the Release Please manifest: their absence cannot
   justify altering the old tag or guessing its version from today's files.
5. Record docs line, actual product patch, package tag/SHA, docs source SHA, cut-tool SHA, build
   revision/date, checksums, and genuine test-report provenance in the artifact.

The contract ledger is API history, not the docs deployment catalog. Do not derive the selected
archive's package version solely from its latest contract-history entry. All panels and installation
instructions must agree with the actual recorded patch.

## 5. Implementation stages: readiness first, activation later

Proposed files and workflows below do not exist yet. Checkboxes mean future implementation tasks,
not permission to publish. Preserve ADR-0022's complete-build approach; amend it before activation
for minor-line URLs, mutable line pointers, and audited docs revisions. No copied `src/pages/v*/`
tree, backwards content resolver, or permanent branch per patch is needed.

### Stage A: implement an inactive freeze builder

- [ ] Add a focused `scripts/docs-freeze.ts` and tests, with a read-only plan/dry-run default.
      Producing a durable artifact requires an explicit freeze operation; publishing or promotion
      requires separate authorization. The dry run never pushes, tags, uploads, or edits manifests.
- [ ] Separate the selected product checkout from the trusted cut/publishing tooling. Read old
      source with minimal permissions, no production secrets, and no persisted checkout credentials.
- [ ] Produce one self-contained, version-prefixed build for a **minor line**, with the exact patch
      only in metadata. Keep immutable artifacts keyed by source/build identity, not mutable filenames.
- [ ] Rebase and verify authored root-relative URLs in HTML, escaped island data, JS/CSS, JSON search,
      iframe requests, fonts and fullscreen previews. Astro `base` alone cannot fix arbitrary authored
      links [S6]. Reject escaped requests into current assets except the explicit navigation catalog.
- [ ] Test with disposable synthetic `0.0.3`, `0.0.4`, and `0.1.0` fixtures, including an old tag
      without today's release files. These tests must not produce real versioned production sites.
- [ ] Require an explicit operator-approved source if a faithful old build cannot be reconstructed;
      never silently substitute current source or fake a passed/dated test report.

### Stage B: prepare serving and navigation without activation

- [ ] Add a trusted `.github/workflows/docs-freeze.yml` or reusable equivalent, callable by the
      approved release orchestration. Keep a manual dry-run entry point for diagnosis/rehearsal;
      ordinary minor releases call the freeze stage automatically, not through an extra operator button.
      Protect publish/promotion paths. A normal push to `main` must not freeze a version.
- [ ] Prepare durable snapshot storage/backup outside the ephemeral Dokploy image and read-only
      serving mounts. Runtime redeployment must not erase old docs. Keep Nginx/Dokploy initially.
- [ ] Prepare `Dockerfile.docs`/`nginx.docs.conf` changes and coherent deployment generations as
      described in section 8. Validate the candidate Nginx configuration and site before activation.
      Do not expose prefixed websites or change production routing merely by merging setup.
- [ ] Replace major-only helpers in `docs-version-display.ts`; update their tests, `VersionMenu.astro`,
      its navigation controller and bilingual version messages for major.minor grouping.
- [ ] Install/test the catalog-driven selector in new and archived builds, with accessible keyboard
      operation, no-JS fallback and no duplicate row for patches of the same minor.
- [ ] Verify the current production view remains one `0.0.x` entry and no hypothetical future choice.
- [ ] Inspect Dokploy's auto-deploy trigger. Before enabling release-controlled serving, prevent
      an independent `main` webhook from overwriting stable docs with unreleased product code.

**Readiness checkpoint:** the code can plan, freeze, stage, validate, and activate a transition,
but no real archive or additional website has been created. Version files stay `0.0.3`, PR #2 stays
unmerged, and the currently served site is unchanged. A local draft, CI fixture, or menu component
is not evidence that production archives exist.

### Stage C: optional future 0.0.4 patch, only when requested

- [ ] Review the existing release PR and confirm it still proposes the intended version. Do not
      assume its number cannot change while Release Please updates it.
- [ ] Only after the owner decides to release, merge the release PR and run the checked publication
      flow. This stage is **not authorized by preparing the versioning feature**.
- [ ] Publish the updated current `0.0.x` docs from the approved patch source. This is an update to
      the same website, not a historical freeze or a second public directory.
- [ ] Confirm one selector row and no public exact-patch routes. Preserve any previous build only
      as a rollback/audit artifact; do not list it as another docs version.

### Stage D: first real freeze at a future minor/major transition

Assume `0.1.0` is approved later. The outgoing patch might be `0.0.3` or `0.0.4`; select what has
actually shipped at that time, not what the working tree or pending release PR happens to contain.
The current pre-1.0 policy normally proposes a patch for features. When the owner explicitly
chooses `0.1.0`, use Release Please's one-time `Release-As: 0.1.0` commit-body mechanism after the
readiness gates, rather than merely renaming the bot PR or leaving a permanent `release-as` override
in configuration [S10]. Review the resulting release PR; this version-selection step is not part
of preparing the feature and is not authorized now.

1. **Prepare the outgoing line.** Validate the latest approved `0.0.x` product tag and docs source.
   Execute the explicit freeze operation into private staging, mounting it as `/v0.0/` in a preview.
   Do not change production, create another product release, move `v0.0.3`, or republish old packages.
2. **Verify the frozen site.** Crawl EN/ES, search, both bindings' demos, assets, reference panels,
   test provenance and error pages. Verify checksums and ensure no product content depends on `main`.
3. **Prepare the incoming line.** Build/stage approved `0.1.0` docs at `/v0.1/`. A staged candidate
   is not a public release or an available production menu entry.
4. **Gate the release.** Require the outgoing archive and both staged sites to pass before current
   promotion. Use draft-first package publication when adopting the safe publisher in section 7;
   do not pretend that a published tag alone means the docs transition succeeded.
5. **Approve activation.** On the owner's approved minor release, atomically publish `/v0.0/`,
   `/v0.1/`, the current-line redirect and catalog. There must be no interval advertising an absent
   old website. The same catalog powers switching from old to current and back.
6. **Verify production.** Confirm bare URLs reach current `0.1.x`, `0.0.x` remains independently
   browsable, and both menus preserve version/locale correctly. A failure leaves the previous
   current website/catalog active; retry the missing stage without rewriting published product tags.

Only this boundary creates two independently served documentation versions. If a third minor is
later released, repeat the process for the outgoing line rather than copying every prior source tree.

## 6. Acceptance and failure tests

### Readiness and patch behavior

- Readiness merge leaves the package version `0.0.3`, release PR #2 unmerged, no new GitHub release,
  no new product/docs tags, no versioned production directories, and one docs selector choice.
- Planning a `0.0.4` patch reports **same-line update, no freeze**. Fixtures for `0.0.3` and `0.0.4`
  produce the same line identity and never two menu rows or public patch HTML routes.
- Planning `0.1.0`, `1.3.0`, or `2.0.0` from a different major.minor reports a required boundary freeze.
- Dry-run paths cannot invoke publishing APIs or write version files. Tag/source mismatches fail.
- An approved minor-release fixture runs freeze, staging, catalog/config generation and promotion
  through the orchestration without per-version Nginx edits. Ordinary pushes, proposed PRs and
  readiness installation cannot enter that publishing path.

### First transition

- Attempting to activate `0.1.x` without a verified `0.0.x` snapshot fails closed.
- A reconstructed `v0.0.3` build records the exact source SHA and real reconstruction date;
  uncommitted files and post-tag product changes cannot leak into it.
- Root/bare redirects, EN/ES counterparts, query strings, fragments and version-local 404s work.
- Old and current menus both list only the deployed `0.0.x`/`0.1.x` lines. JS/cached-catalog/network
  failure still leaves a usable current-docs link and never changes product content automatically.
- CSS/JS/fonts/search/fullscreen requests stay in the selected minor. The explicitly shared
  navigation catalog is the only planned live cross-version data exception.
- Redesigning current `0.1.x` chrome does not change `0.0.x` typography, layout or demos. A reviewed
  docs-only redesign of `0.0.x` changes only that line's docs build revision, not its product source.
  Test both the page chrome and iframe demos, which currently clone the parent page's styles.
- Interrupted uploads, bad checksums, archive path traversal, stale parallel jobs and retries cannot
  publish incomplete versions, overwrite another line, roll current backwards or clobber public artifacts.
- A container redeploy/restore retains supported snapshots. Withdrawn or unsafe builds are not
  silently restored by rollback. Keep hashed assets needed by already-open safe pages across updates.

Test the transition on a staging host/repository first. Tests must use fixtures or temporary builds,
not publish a real `0.0.4` just to prove the feature. Do not expand the normal current-site browser
suite into crawling every historical artifact on every PR.

## 7. Security patches and corrections after a line is frozen

This is the next workstream, not a reason to create extra patch pages or delay the inactive builder.
Do not promise production backports until the relevant safeguards have been implemented/rehearsed.

### Product vulnerability in 0.0.x while 2.0.x is current

1. Explicitly choose to maintain the old line, with an owner and end-of-support policy. Keeping
   an archive does not promise indefinite security maintenance for all historic releases.
2. Create/retain `release/0.0` from its latest real `0.0.x` product tag, not from `main`'s `2.0.x`.
   Other supported minor branches follow the same pattern, such as `release/1.2` or `release/2.0`.
3. Fix and regression-test on a short-lived branch targeting `release/0.0`; do not merge current
   versions, dependencies or generated contracts wholesale into the older tree.
4. Release Please must target that maintenance branch with its own baseline and concurrency group,
   patch-only versioning and compatibility/line checks [S1, S2]. The current main-only action does
   not gain this capability just because a branch exists. Use a releasable `fix(deps): ...` for a
   security dependency fix; a `build`/`chore` commit alone might not open the needed release PR.
5. Publish a new patch, for example `0.0.5` -> `0.0.6`. Refresh the existing `/v0.0/` website from
   that approved patch and record its provenance. **Do not create `/v0.0.6/` or another menu row.**
6. Leave `/v2.0/`, current bare redirects, `main`'s baseline, GitHub Latest and future npm `latest`
   on their current release. Publication time alone never decides which line is current.

Never move an existing product tag or replace published package bytes. Apply the logical fix to
other affected supported lines separately; do not invent a current-line fix if it was never affected.
An incompatible security change cannot be hidden by forcing a patch number: document the required
migration or supported upgrade instead.

### Documentation-only correction

If package `0.0.6` is correct but its instructions/translation/site build dependencies need a fix,
prepare an explicit reviewed docs correction against its product source. Create an immutable docs
build revision, for example `docs-v0.0.6-r2`, without changing the package version. Select that
revision for the existing `/v0.0/` URL and disclose the patch, revision and correction date. Retain
revision 1's artifact/checksum for audit; do not create another public website or selector entry.

A product JS/CSS change is not a docs-only correction. Use a new product patch instead. If a tag
predates today's build files, use compatible isolated tooling or a reviewed build-only repair;
never silently rebuild old examples from current product code or hand-edit the live host.

### Publication and security prerequisites

- Support maintenance base branches explicitly in CI/Release Please and protect them; fix the
  current local hooks' maintainer-only identity restriction before other contributors use them.
- The contract changelog currently assigns membership by calendar date and rejects two releases
  on the same day. Before same-day contract releases, migrate to explicit release membership with
  an `unreleased` state, automatically materialized in release preparation. Preserve all existing
  resolved history and update compiler/schema fixtures and docs/MCP consumers together. Timestamps
  on the ledger alone do not resolve entries that still have only a calendar date.
- Use draft-first GitHub publication, upload/verify assets before publication and set Latest
  explicitly: false for maintenance/docs-only releases [S3, S4]. If tag pushes remain the trigger,
  verify draft `force-tag-creation`; otherwise the expected package workflow might not start [S2].
  The current publisher's public-release/`--clobber` path must be revised before immutable releases.
- Build old source/dependencies without publishing credentials or persisted checkout credentials.
  A separate trusted default-branch publisher verifies approved source/run identity, checksums and
  safe archive paths. Never execute untrusted PR code with deployment/npm/release credentials.
- If npm is enabled later, use a non-semver maintenance dist-tag such as `maintenance-0-0` and
  promote only after all intended packages exist [S8]. Do not rely on its implicit `latest` default.
- Do not let late/duplicate jobs downgrade a line's patch/build revision or current pointer. Persist
  stage completion: GitHub, npm and the website cannot commit one atomic transaction. Resume missing
  work after a partial failure; do not unpublish packages or manufacture a new patch to retry hosting.
- Reuse a target tag's own shipped inventory. Old releases can contain packages removed from main.
  A new dependency security fix can use a narrowly reviewed pnpm quarantine exception, never a global
  disabled audit or fake release date.
- Choose current/supported/EOL lines explicitly. Generate deployed-version availability from verified
  receipts, not release dates or a hand-copied list of every tag. Keep supported lines regardless
  of whether they are among the two newest; metadata must distinguish archive from support promise.

For embargoed vulnerabilities, use a draft advisory/private collaboration rather than publishing
the fix in a public PR to wake the bot. GitHub advisory temporary private forks do not run normal
integrations/status checks [S5]; arrange isolated verification and coordinated disclosure/publication.
A real incident must not wait for website versioning: use a separately reviewed safe publication
procedure, without bypassing tests, integrity checks or explicit non-Latest controls.

A version path is **not** an origin security boundary [S7]. If vulnerable product/demo code is
executable in the website, quarantine it or isolate it appropriately, rather than preserving unsafe
JS forever. Use CSP/sandboxing and no sensitive shared credentials; an isolated host may be necessary
for risky historic content. Purge mutable HTML/catalog/security caches on withdrawal. A browser's
already-loaded code cannot be recalled; communicate reload/upgrade requirements when relevant.

## 8. Deployment topology, operator runbook and documentation styles

### 8.1 One public site, independently built docs lines

Recommended: **one public domain and one static Nginx serving deployment, with independent builds
for each minor line**. There is no long-running Astro/Node application per minor. Build a line once,
then serve its static files; refresh it only for an approved patch or docs revision.

```text
ui.skryensya.dev
  /v0.0/...   -> the selected complete 0.0.x build
  /v0.1/...   -> the selected complete 0.1.x build
  /...        -> current-line page redirects and shared navigation metadata
```

Same domain does not mean shared CSS or a shared component implementation. Each line's HTML refers
to its own prefixed JS/CSS/fonts, and its iframe demos use that line's runtime. Only the small
version/status catalog is deliberately shared. Switching versions is normal navigation between
independent built documents, not changing the package version inside the current app.

| Option | Assessment |
| --- | --- |
| One host, path per minor, independent static builds | Recommended for the present Astro/Nginx/Dokploy stack: one TLS/DNS/serving setup and one selection mechanism |
| One public subdomain per minor | Valid when browser-origin isolation or genuinely independent ownership is required; adds DNS/TLS/routing operations and needs host-only credential/cookie policy |
| A separate running application/container per minor behind the same domain | More deployment/patching overhead without browser-origin isolation; not necessary merely to serve static docs |

A path is not a security boundary. Unsupported risky JS may need a separate origin or quarantine,
not just another container behind the same origin. Separating hosts does not automatically make
parent-domain cookies or shared credentials safe. Apply patched Nginx/host images centrally:
freezing web assets does not mean keeping an old, vulnerable server image running forever.

### 8.2 Storage and coherent deployment generations

The exact host paths are deployment inputs, not paths to create during planning. Proposed layout:

```text
<durable-docs-root>/
  builds/<immutable-build-id>/           # complete static output, metadata and checksums
  deployments/<generation-id>/
    site/v0.0                           # publisher-created link to an approved build
    site/v0.1                           # publisher-created link to an approved build
    site/docs-versions.json              # catalog for this same generation
    site/sitemap.xml
    site/robots.txt
    nginx.generated.conf                # current-line redirects and matching absolute site root
```

Mount the durable root read-only in the serving container. Only the separate trusted deployer has
narrow write access to the host-managed store. It verifies/extracts artifacts in private staging,
then writes new build/generation directories and validated local build links; links supplied by an
uploaded archive remain forbidden. No old source tree is committed under `src/pages/v*/`, and a
container rebuild must not erase the versioned files.

A generation is a complete combination of selected builds, catalog, current-line redirects and
routing rules. Validate its Nginx configuration before activation. Prefer a controlled graceful
Nginx reload with an immutable, generation-specific configuration/root: old workers finish with
the old coherent generation, new workers use the new one. Do not let old workers read a globally
mutated root/catalog while retaining old redirect configuration. If Dokploy requires a container
rollout instead, validate a candidate deployment first and document the actual cutover behavior.

The publisher must be able to restore the previous safe generation as a unit, rather than rolling
back only HTML and leaving a mismatched selector/current redirect. Keep referenced build assets
until workers and retained generations no longer need them. Re-check withdrawal/security policy
before rollback, so a prior generation cannot accidentally restore a known unsafe build.

### 8.3 Future operator runbook: first minor transition

**This is the procedure to implement and rehearse, not an executable production command today.**
No part of it is authorized by installing readiness code. A normal `0.0.3` -> `0.0.4` patch updates
the same site and does not run this boundary-freeze procedure. These are **pipeline checkpoints**,
not fourteen manual actions: the normal human authorization is the release PR merge, with an
additional environment approval only if the owner chooses it. Use the table for implementation,
verification and recovery; section 8.6 defines the routine automated trigger.

| Step | Action and required result |
| --- | --- |
| 1. Confirm the request | Owner authorizes the incoming minor through the release PR; the pipeline verifies the outgoing approved line/source from published deployment state, never a dirty workspace |
| 2. Record the baseline | Capture active generation, current line, deployed patch/revision, source SHAs and checksum receipts; verify a restorable backup and expected current state |
| 3. Resolve approved source | Verify product tags and docs source; prefer an existing verified build or reconstruct in an isolated checkout; stop if provenance is ambiguous |
| 4. Build outgoing docs | Produce the full `0.0.x` static site under its `/v0.0/` base, including its original documentation chrome, old product code and all assets |
| 5. Build incoming docs | Stage the approved new minor under `/v0.1/`, without changing production or exposing it as an available choice |
| 6. Validate both bundles | Run unit/browser/request checks, EN/ES, demos, search, fonts, canonical/404 rules and metadata; archive and checksum the complete outputs |
| 7. Transfer privately | The trusted deployer accepts only artifacts from the expected source/run, verifies checksums/safe paths, and installs immutable build directories; no serving pointers change |
| 8. Prepare one candidate | Generate the next deployment generation with both builds, shared catalog, current redirect, version-local routes and matching Nginx configuration |
| 9. Test the candidate | Validate candidate Nginx syntax and HTTP behavior in private staging; confirm both directions of switching and no requests for current product assets from the old line |
| 10. Approve promotion | Require release availability/integrity and release-PR authorization, plus an environment approval only if configured; the outgoing freeze must be complete before making the new minor current |
| 11. Activate coherently | Perform the verified reload/cutover, selecting the complete generation; purge mutable HTML, catalog and redirect caches, not valid immutable assets |
| 12. Smoke-test publicly | Check bare redirects, both minor paths, EN/ES, selected version, keyboard/no-JS navigation, search, demos and their asset URLs |
| 13. Confirm or roll back | Record the activated build IDs/revisions and time; on failure restore the previous safe generation and caches, without moving product tags or unpublishing packages |
| 14. Retain and clean safely | Keep supported builds, rollback evidence and referenced asset hashes; clean only abandoned staging/unreferenced safe artifacts under the agreed retention policy |

Do not hold deploy credentials during old-source builds. Do not manually copy files over an active
version directory or independently edit the catalog after promotion. A catalog row means the
matching website was verified and deployed, not merely that a GitHub Release exists.

**Host-specific information still needed to turn this into exact commands:** Dokploy application/
service identity, deployment method and authorized reload/cutover operation, durable-volume paths
and mount permissions, private staging access/health checks, backup/restore method and approval
roles. These have not been inspected through a hosting API. Do not invent `docker exec`, SSH or
Dokploy API commands before binding and verifying those inputs in staging. The final implemented
runbook must include those verified commands and expected outputs before claiming deployment-ready.

### 8.4 What happens when the documentation design changes

There are two different things to preserve:

- **Documentation chrome:** header, sidebar, navigation, page typography, layout, icons and fonts.
- **Documented product:** component code, styling tokens/CSS, interactions, examples and contracts.

Default: a frozen line preserves **both** as built. Redesigning current `0.1.x` documentation does
not restyle archived `0.0.x`. A shared domain does not make styles leak between documents; fetching
a shared mutable stylesheet would. Do not point all lines to `/latest.css` or today's JS bundle.
Each artifact owns its CSS/JS/font files, and each minor resolves them within its own prefix.

This matters particularly here: `component-preview-frame.ts#cloneParentStyles` copies the parent
page's styles into preview iframes. Applying current global styles/layout to old pages can also
change the old component demos. Keeping old prose under a new wrapper is not enough to preserve
that product's behavior and appearance. An automatic universal latest-chrome layer is outside the
first implementation; it would require a real separation between chrome and versioned demo assets.

If the owner wants a consistent newer docs design across old lines, use a controlled docs-only
revision, not a global asset replacement:

1. Start from the selected old product patch/docs source and keep shipped product code/versions pinned.
2. Apply only compatible docs-chrome changes. A new header that requires a newer kit API cannot
   silently pull that new kit into the old site; adapt the docs-only implementation or defer the redesign.
3. Rebuild that line independently and test page layout, keyboard/accessibility, fonts, search and
   both bindings' iframe demos. Verify that docs selectors do not leak new styling into old examples.
4. Publish a new immutable docs build revision with product/docs/tooling provenance, then refresh
   only that minor line's existing URL through the same staged/approved generation process.
5. Disclose the docs correction/redesign date and keep the old artifact for audit/rollback. No
   package bump, extra public docs version, product tag mutation or automatic update of other lines.

Pure docs restyling need not wait for another product minor: it may update the current line's docs
revision. An archived line changes only when that update is explicitly reviewed for it. Security
fixes in documentation runtime dependencies must likewise be triaged as website fixes versus
shipped-product fixes; frozen is not an excuse to keep exploitable code publicly executable.

### 8.5 Caching, routing and SEO

- Do not enable production routing/promotion merely by landing readiness code. Inspect the actual
  Dokploy trigger and ensure `main` previews cannot overwrite stable selected product docs.
- Enable canonical minor paths and revalidating bare-page redirects with the same approved generation
  as the catalog. Preserve old EN/ES URL redirects and language choice. Catalog/sitemap/robots/assets
  need explicit rules so metadata does not enter current-line redirect loops.
- HTML, catalog, current pointers and same-line patch/docs-style updates must revalidate. Only
  content-hashed assets receive long immutable cache lifetimes; retain referenced safe hashes during
  rollbacks/open sessions and purge security-withdrawn content as required.
- Index only the current stable line, with self-canonical URLs and its sitemap. Older lines can be
  self-canonical and `noindex, follow`; do not canonicalize different APIs to today's page merely
  because their slugs match. Crawlers must be allowed to see noindex [S9]. `hreflang` stays in-line.
- Keep search and iframe content version-local, and reduce historical prefetching. MCP remains
  current-only initially: disclose that mismatch rather than claiming versioned agent support.

### 8.6 Automation contract: setup once, then release-driven

**One-time setup:** bind the durable store, generic Nginx minor-path routing/current redirect,
Dokploy deployment operation, staging checks and protected deployment identity. Apply that reviewed
hosting configuration through the repository/pipeline. It can remain inactive while preparation
is being implemented; setup alone exposes no additional version and approves no product release.

**Routine trigger:** the owner merges a checked product release PR. The release orchestration
compares the approved incoming product version with the currently deployed docs line, rather than
assuming the newest publication date, working-tree version, or contract-ledger entry is current.

- Same major.minor: build/validate and refresh that line. No freeze, new public page tree or new row.
- Different major.minor: automatically call the freeze stage for the outgoing approved line, stage
  both sites, and generate the coherent catalog, route mappings and deployment configuration.
- After validation and the configured authorization, deploy/reload through the restricted mechanism,
  smoke-test and confirm the receipt or restore the previous safe generation on failure.

Nginx has generic version-path handling, not a manually written rule per minor. Any required new
configuration/current mapping and reload are generated and executed by the pipeline. Keep normal
release cutover free of ad hoc SSH sessions, server-file edits or another manual "freeze now" step.
The one-time hosting change and later production promotions still exist technically; automation
performs the latter rather than eliminating validation or authorization.

The manual dry-run/recovery entry point is for rehearsal and exceptions. A proposed release PR,
a version in the ledger, a push to `main`, or an implementation commit is not release approval.
Unknown source provenance, unsupported backports, withdrawals and embargoes follow their explicit
reviewed procedures; the bot must not invent those policy decisions.

## 9. Definition of done and operator checkpoints

**Readiness implementation is done when:**

- [ ] Stages A/B and the fixture-based tests pass while the real project remains `0.0.3`.
- [ ] There are no new production snapshots, prefixed pages, releases, tags or future selector rows.
- [ ] A dry run can describe a same-line `0.0.4` update versus a boundary `0.1.0` freeze correctly.
- [ ] The owner has a reviewed runbook for explicit freeze, staging, approval, activation and rollback,
      with service/volume identities, verified host-specific commands and expected outputs, not just placeholders.
- [ ] Real freeze/publish operations remain separate from and disabled during normal readiness work.

**The operator later decides:**

1. When to merge the product release PR; nothing here authorizes merging #2 or releasing `0.0.4`.
2. Which approved old-line patch/docs revision supplies a real boundary freeze.
3. When to enable durable hosting/production routing and approve the first minor transition.
4. Which old minor lines receive security support, by whom, and until when.

Validate the first real boundary in staging before production. Backport publication, same-day
contract history changes and private-advisory operation each need their own rehearsal before they
are advertised as supported. No npm migration, multi-version MCP, content database, source-route
copies, or permanent branch per patch belongs in the first readiness slice.

## 10. Sources and verification

Primary sources checked on 2026-10-30 for the preceding maintenance plan; this revision changes the
proposed docs policy to the owner's clarified **minor/major boundaries only**. Local/read-only
checks confirmed `v0.0.3`'s commit, the absence of historical release metadata files there, current
`0.0.3` version files, and PR #2's open/non-auto-merge status. Hosting settings were not changed or
verified through a deployment API. No real freeze or maintenance release has been run.

- **S1:** [Release Please multiple branches](https://github.com/googleapis/release-please-action#supporting-multiple-release-branches).
- **S2:** [Versioning strategies](https://github.com/googleapis/release-please/blob/main/docs/customizing.md#versioning-strategies)
  and [manifest schema](https://github.com/googleapis/release-please/blob/main/schemas/config.json).
- **S3:** [GitHub release REST API](https://docs.github.com/en/rest/releases/releases#create-a-release): explicit `make_latest` policy.
- **S4:** [GitHub immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases): draft, assets, then publish.
- **S5:** [Private security-fix collaboration](https://docs.github.com/en/code-security/tutorials/fix-reported-vulnerabilities/collaborate-in-a-fork).
- **S6:** [Astro base paths](https://docs.astro.build/en/reference/configuration-reference/#base).
- **S7:** [MDN same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy).
- **S8:** [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) and [dist-tags](https://docs.npmjs.com/adding-dist-tags-to-packages/).
- **S9:** [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
  and [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
- **S10:** [Release Please: choose a version](https://github.com/googleapis/release-please#how-do-i-change-the-version-number): one-time `Release-As` commit-body override.
- [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html): immutable product releases; no stability guarantee for major zero.

Repository evidence: ADR-0022; `VersionMenu.astro`; `docs-version-display.ts`; `i18n/index.ts`;
`Dockerfile.docs`; `nginx.docs.conf`; `apps/docs/src/scripts/component-preview-frame.ts`;
release/check workflows; `scripts/release.ts`;
`packages/ai-compiler/src/changelog.ts` and its same-day-rejection test;
`apps/docs/src/lib/contract-reference.ts`; `contracts/changelog/releases.yaml`.

## 11. Resuming this plan in a later session

This file is the implementation handoff; the earlier chat is not required. Start here, then load
the referenced sections for the requested stage. The `0.0.3`/PR #2 information above is the recorded
planning baseline, not a command to downgrade a repository that has legitimately advanced.

1. **Reinspect state.** Read repository instructions, Git status/current branch, current version
   files, product tags, open release PRs, workflow configuration and any deployed docs catalog.
   Report what differs from the recorded baseline. Preserve unrelated working-tree changes and
   use an isolated feature workspace according to the owner's preference.
   Done: the actual starting version, deployed docs line and outstanding approvals are known.
2. **Choose the authorized stage.** Unless the owner explicitly asks to activate a real release,
   implement only readiness Stages A/B. If already implemented, verify their evidence and report
   the remaining activation gate rather than running it. Keep the actual current product version.
   Done: one bounded stage is selected, with setup versus activation unambiguous.
3. **Implement the selected readiness work.** Use sections 4/5 for source selection and builder
   targets, section 3 for the minor-based menu/catalog, and section 8 for independent assets,
   durable generations and automation. Start with fixture-driven builder tests; connect the
   protected publisher only after source and bundle validation work. Backport/security schema
   changes in section 7 are a separate workstream unless explicitly included.
   Done: the selected checklist items have code/tests or a named, concrete external blocker.
4. **Bind hosting prerequisites.** Obtain/verify the Dokploy service identity, durable-volume and
   backup details, authorized deployment/reload method, private staging route and approval roles.
   Keep credentials in protected secret storage, not this document. When access is unavailable,
   record the missing bindings instead of inventing commands or claiming deployment readiness.
   Done: a verified host-specific runbook exists, or hosting readiness is explicitly blocked.
5. **Verify without publishing.** Run the readiness/patch/minor fixtures and integration checks
   in section 6, including the pipeline trigger contract in section 8.6. Confirm no real release,
   tag, archive, extra public docs line or future production menu entry was created. Check the
   diff and update this plan's checkboxes/status only for proven completed work.
   Done: section 9 has evidence for every completed item and remaining work is listed.
6. **Handoff or activate separately.** Summarize changed files, tests and manual prerequisites.
   A later explicit `0.1.0` request follows Stage D and the section 8.3 pipeline checkpoints after
   checking the latest actual `0.0.x` release. Merge/push/production permissions are not inherited
   from the old chat or granted by merely mentioning a future target version.
   Done: the owner knows whether this is still planning, implemented-but-inactive, or approved
   activation; no ambiguous "ready" claim remains.

Suggested resumption request:

> Read VERSIONED_DOCS_PLAN.md, starting with section 11. Reinspect the actual repository state and
> implement only readiness Stages A/B. Preserve the current product version and unrelated changes.
> Validate with fixtures/staging; report missing hosting inputs. Keep real releases, freezes,
> production activation and Git publication pending separate approval.
