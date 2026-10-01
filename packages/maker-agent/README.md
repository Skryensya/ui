# Maker agent

A provider-independent, proposal-first tool loop. `maker-model` owns context and operations;
`ai-compiler/agent` owns discovery/contracts/validation; this package owns schemas, provider
translation and orchestration. MCP imports the same operation schema and dry-run model function.
Neither transport has a private editing vocabulary.

## Maker UI

Open the right panel's **AI** tab, choose a provider, enter your key and model, and **Test & connect**.
Select layers normally; selection chips attach automatically. Removing all selection chips falls
back to the current page. Send with the button or Cmd/Ctrl+Enter. A turn keeps its submitted
selection even if you click somewhere else while it runs.

The agent can read/discover/validate and propose, never commit or publish. Review semantic changes,
**Preview** the temporary site in Maker's real stage renderer, then **Apply** or **Discard**.
Apply uses the native gesture reducer, one undo step, and optimistic server saves. It checks the
server revision and local edit generation before committing; a raced server save is still refused
by the existing project API. Stop cancels requests and prevents subsequent tools or commits.

Provider/catalogue code is lazy-loaded on first opening the AI tab, so using Maker without AI
adds no provider requests or catalogue load. Keys, provider configuration and conversations live only in the panel's memory. They are not in
project/view storage, exports, history or MCP responses. Closing/unmounting the panel/project or
reloading releases that session. Changing provider clears the key; Disconnect clears it explicitly.
The key goes directly to the selected provider's API in an authorization header. No inference proxy,
Skryensya billing, persistent credential storage, analytics or logging is added.

Custom API base URLs must use HTTPS (HTTP localhost is allowed). Browser CORS/access must be
supported by the endpoint; the error explains this. Anthropic's explicit direct-browser access
header is used. Users choose model IDs freely, including provider-specific compatible models.

ADR-0031's original MCP-only interaction choice is extended by the requested embedded BYOK mode;
its canonical usage tree, contract authority, structural layout and operation-only rules are unchanged.

## Boundaries and limits

- Frozen context: all selected IDs; up to 32 detailed selections, 12 ancestors each, 24 descendants
  at depth 2, two siblings either side, 20 pending problems. Text/attribute values are bounded.
- Group wrapping feasibility is probed with native operations, not guessed. Insertion gaps are
  candidates, explicitly subject to child-specific placement validation.
- 4 recent conversational turns, 8,000-character prompts, 16 rounds, 64 tools, 48KB tool results,
  240KB running context, 60-second provider request timeout.
- Each `maker_try` replaces a proposal against the original snapshot; identities are resolved once.
  Structural refusals and newly introduced pending/contract errors invalidate the proposal.
- Only Maker tools are exposed. No shell, filesystem, browser navigation, arbitrary patches or CSS.
- Proposal-first only. Auto-apply, stage screenshot capture, provider model enumeration, persistent
  chat/credentials and provider token streaming are not implemented. Progress events describe tool
  activity; no internal reasoning is displayed. Visual preview is not screenshot evidence for the model.

## Verification

`pnpm --filter @skryensya/maker-agent check` runs mocked provider/runtime/capability tests.
`pnpm --filter @skryensya/maker-model check` includes canonical context tests.
`pnpm --filter @skryensya/maker test tests/ai.spec.ts tests/ai-accessibility.spec.ts` drives selection snapshots, multi-selection,
preview/apply/undo, stale edits, cancellation and credential boundaries against mocked provider APIs.
Live selection evals are opt-in: see `evals/README.md`. They spend the user's provider usage.
