import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createAgentService } from "@skryensya/ai-compiler/agent";
import { asCompiledPair } from "@skryensya/ai-compiler/artifact";
import { snippets } from "@skryensya/snippets";
import { makerContext, findChild, isNode, type MakerProposal, type MakerSite } from "@skryensya/maker-model";
import { runAgent, testConnection, type ConversationTurn, type ProviderConnection, type ProviderId } from "@skryensya/maker-agent";
import { Button } from "@skryensya/react/button";
import { commitProposal, LOCAL_PROJECT, type Maker } from "../state";
import { knownRevision } from "../sync";
import { getProject } from "../projects";
import index from "../../../../artifacts/ai-index.json";
import manifest from "../../../../artifacts/ai-manifest.json";
import { draftOf, type Draft } from "./draft";
import "./panel.css";

const service = createAgentService(asCompiledPair(index, manifest), snippets);
const defaults: Record<ProviderId, string> = { openai: "gpt-4.1", anthropic: "claude-sonnet-4-6", openrouter: "openai/gpt-4.1", compatible: "" };

/** Everything here is ephemeral. No credentials or conversation enter useMaker or localStorage. */
export function AIPanel({ maker, onPreview, onDraft, barSlot }: {
  maker: Maker;
  onPreview: (site: MakerSite) => void;
  /** The site as it would be with what the AI has written so far, or nothing. The canvas draws it. */
  onDraft: (draft: Draft | undefined) => void;
  /** Where the progress and Apply/Discard bar goes: over the canvas, where the draft is being drawn. */
  barSlot: HTMLElement | null;
}) {
  const [connection, setConnection] = useState<ProviderConnection>({ provider: "openai", apiKey: "", model: defaults.openai });
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState(true);
  const [content, setContent] = useState("");
  const [excluded, setExcluded] = useState<string[]>([]);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  /** A turn is being written: the bar over the canvas shows its progress and owns Stop. */
  const [building, setBuilding] = useState(false);
  const [proposed, setProposed] = useState<{ proposal: MakerProposal; generation: number }>();
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  /* A person's own edit makes any proposal, and its draft on the canvas, stale: the canvas goes back to the
     project they are editing. The proposal stays listed, and Apply says it conflicts, as it always has. */
  const revision = useRef(maker.revision);
  revision.current = maker.revision;
  useEffect(() => { if (proposed && proposed.generation !== maker.revision) onDraft(undefined); }, [maker.revision, proposed]);
  const selectionKey = `${maker.view.page}:${maker.view.selected}:${maker.view.selectedIds.join(",")}`;
  useEffect(() => { setExcluded([]); }, [selectionKey]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); onDraft(undefined); };
  }, []);

  const attached = [...new Set([...(maker.view.selected ? [maker.view.selected] : []), ...maker.view.selectedIds])].filter(id => !excluded.includes(id));
  const context = () => makerContext(maker.site, { id: maker.projectId, revision: maker.projectId === LOCAL_PROJECT ? maker.revision : knownRevision(maker.projectId) }, {
    ...maker.view, selected: attached.includes(maker.view.selected ?? "") ? maker.view.selected : undefined, selectedIds: attached,
  });
  const begin = () => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setBusy(true); setError("");
    return next;
  };
  const finish = (next: AbortController) => { if (mounted.current && controller.current === next) { setBusy(false); controller.current = null; } };
  const fail = (e: unknown, next: AbortController) => {
    if (!mounted.current) return;
    // Runtime errors are curated; redact defensively before presenting anything.
    const text = next.signal.aborted ? "Cancelled. No changes applied." : e instanceof Error ? e.message : "AI request failed.";
    setError(connection.apiKey ? text.split(connection.apiKey).join("[credential]") : text);
    setStatus("");
    onDraft(undefined);
  };
  const connect = async () => {
    const next = begin();
    try { await testConnection(connection, next.signal); if (!next.signal.aborted && mounted.current) { setConnected(true); setSettings(false); setStatus("Connected. Credentials remain in this session only."); } }
    catch (e) { fail(e, next); }
    finally { finish(next); }
  };
  const send = async () => {
    if (!content.trim() || busy || !connected) return;
    const frozen = context();
    const generation = maker.revision;
    const site = maker.site;
    const intent = content.trim();
    const next = begin();
    setBuilding(true); setProposed(undefined); setContent(""); onDraft(undefined);
    const turn: ConversationTurn = { content: intent, context: frozen };
    setTurns(previous => [...previous.slice(-19), turn]);
    try {
      for await (const event of runAgent({ connection: { ...connection }, site, context: frozen, content: intent, history: turns, service, signal: next.signal })) {
        if (!mounted.current || next.signal.aborted) break;
        if (event.type === "status") setStatus(event.text);
        else if (event.type === "say") setTurns(previous => previous.map(t => t === turn ? { ...t, answer: (t.answer ?? "") + event.delta } : t));
        else if (event.type === "draft") onDraft(revision.current === generation ? draftOf(site, event.site, event.operations, true) : undefined);
        else {
          setTurns(previous => previous.map(t => t === turn ? { ...t, answer: event.text || (event.proposal ? "Changes ready for review." : "No changes proposed.") } : t));
          setProposed(event.proposal ? { proposal: event.proposal, generation } : undefined);
          /* The final proposal replaces the last draft: same nodes, now waiting for the person to decide. */
          onDraft(event.proposal && revision.current === generation ? draftOf(site, event.proposal.site, event.proposal.operations.length, false) : undefined);
          setStatus(event.proposal ? "Proposal ready. Your project is unchanged." : "Finished without changes.");
        }
      }
    } catch (e) { fail(e, next); }
    finally { if (mounted.current) setBuilding(false); finish(next); }
  };
  const apply = async () => {
    if (!proposed || busy) return;
    const captured = proposed;
    const next = begin();
    try {
      // Check the server too: its change event might not have reached this tab yet.
      if (maker.projectId !== LOCAL_PROJECT) {
        const current = await getProject(maker.projectId);
        if (current.revision !== captured.proposal.revision || knownRevision(maker.projectId) !== captured.proposal.revision) {
          throw new Error("Revision conflict. The project changed; discard and ask again.");
        }
      }
      next.signal.throwIfAborted();
      if (!mounted.current) return;
      const result = commitProposal(maker.projectId, captured.proposal, captured.generation);
      if (!result.ok) throw new Error(result.reason);
      setProposed(undefined); onDraft(undefined); setStatus("Applied as one undoable edit.");
    } catch (e) { fail(e, next); }
    finally { finish(next); }
  };

  return <section className="maker-ai" aria-label="Maker AI">
    <header className="maker__panel-header"><h2 className="maker__panel-title">Maker AI</h2>
      <Button size="sm" variant="ghost" onClick={() => setSettings(!settings)} disabled={busy}>AI settings</Button></header>
    {settings && <fieldset disabled={busy} className="maker-ai__settings"><legend>Connect your own AI</legend>
      <p>Your key is sent directly to your chosen provider. It is not stored. Browser access/CORS must be supported by the endpoint.</p>
      <label>Provider<select value={connection.provider} onChange={e => {
        const provider = e.target.value as ProviderId;
        setConnected(false); setConnection({ provider, apiKey: "", model: defaults[provider] });
      }}><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="openrouter">OpenRouter</option><option value="compatible">OpenAI-compatible</option></select></label>
      {connection.provider === "compatible" && <label>API base endpoint<input type="url" placeholder="https://example.com/v1" value={connection.endpoint ?? ""} onChange={e => { setConnected(false); setConnection({ ...connection, endpoint: e.target.value }); }} /></label>}
      <label>API key<input type="password" autoComplete="off" value={connection.apiKey} onChange={e => { setConnected(false); setConnection({ ...connection, apiKey: e.target.value }); }} /></label>
      <label>Model<input value={connection.model} onChange={e => { setConnected(false); setConnection({ ...connection, model: e.target.value }); }} /></label>
      <Button size="sm" onClick={() => void connect()}>Test &amp; connect</Button>
      <Button size="sm" variant="ghost" onClick={() => { setConnection({ ...connection, apiKey: "" }); setConnected(false); setProposed(undefined); onDraft(undefined); setStatus("Disconnected."); }}>Disconnect</Button>
    </fieldset>}
    <div className="maker-ai__conversation" role="log" aria-label="Conversation">
      {turns.map((turn, i) => <article key={i}><p><strong>You</strong> · {turn.context.page.name} · {turn.context.selection.primary ?? "page"} · revision {turn.context.project.revision}</p><p>{turn.content}</p>{turn.answer && <p><strong>Maker AI</strong><br />{turn.answer}</p>}</article>)}
    </div>
    {proposed && <section aria-label="Proposed changes"><h3>{proposed.proposal.operations.length} proposed changes</h3>
      <ul>{proposed.proposal.operations.map((op, i) => <li key={i}>{summarize(op, proposed.proposal.base)}</li>)}</ul>
      <Button size="sm" disabled={busy} onClick={() => onPreview(proposed.proposal.site)}>Preview</Button>
      {/* Apply and Discard live in the bar over the canvas, next to the draft they act on. */}
      {!barSlot && <>{" "}<Button size="sm" disabled={busy} onClick={() => void apply()}>Apply</Button>{" "}<Button size="sm" variant="ghost" disabled={busy} onClick={() => { setProposed(undefined); onDraft(undefined); setStatus("Proposal discarded."); }}>Discard</Button></>}
    </section>}
    <p role="status" aria-live="polite">{status}</p>{error && <p role="alert">{error}</p>}
    <form onSubmit={e => { e.preventDefault(); void send(); }}>
      <div className="maker-ai__context" role="group" aria-label="Attached context">{attached.length ? attached.map(id => {
        const child = findChild(maker.page.root, id);
        return <button type="button" key={id} aria-label={`Remove context ${child && isNode(child) ? child.signature : "text"}`} onClick={() => setExcluded([...excluded, id])}>{child && isNode(child) ? child.signature : "Text"}{child && isNode(child) && child.slots.children?.kind === "nodes" && child.slots.children.children.some(isNode) ? ` · ${child.slots.children.children.filter(isNode).length} items` : ""} ×</button>;
      }) : <span>{maker.page.name} page</span>}
      {excluded.length > 0 && <button type="button" onClick={() => setExcluded([])}>Restore selection</button>}</div>
      <label>Ask Maker<textarea value={content} maxLength={8000} rows={4} placeholder="Make this section more compact…" onChange={e => setContent(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(); } }} /></label>
      <Button type="submit" size="sm" disabled={!connected || busy || !content.trim()}>Send</Button>{" "}
      {busy && !barSlot && <Button type="button" size="sm" variant="ghost" onClick={() => controller.current?.abort()}>Stop</Button>}
    </form>
    {barSlot && (building || proposed) ? createPortal(
      <div className="maker-draft-bar" role="group" aria-label="Maker AI draft" data-building={building && !proposed ? "" : undefined}>
        {building && !proposed ? <>
          <span className="maker-draft-bar__pulse" aria-hidden="true" />
          <span className="maker-draft-bar__text">{status || "Maker AI is working…"}</span>
          <Button size="sm" variant="ghost" onClick={() => controller.current?.abort()}>Stop</Button>
        </> : proposed ? <>
          <span className="maker-draft-bar__text">{proposed.proposal.operations.length} {proposed.proposal.operations.length === 1 ? "change" : "changes"} on the canvas. Your project is unchanged.</span>
          <Button size="sm" disabled={busy} onClick={() => void apply()}>Apply</Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => { setProposed(undefined); onDraft(undefined); setStatus("Proposal discarded."); }}>Discard</Button>
        </> : null}
      </div>, barSlot) : null}
  </section>;
}

function summarize(op: MakerProposal["operations"][number], site: MakerSite): string {
  if (op.type !== "edit") return op.type === "addPage" ? `Add page: ${op.page.name}` : `${op.type} · ${op.page}`;
  const action = op.operation;
  const page = site.pages.find(p => p.id === op.page);
  const id = "node" in action ? action.node : "child" in action && typeof action.child === "string" ? action.child : undefined;
  const node = id && page ? findChild(page.root, id) : undefined;
  const label = node && isNode(node) ? node.signature : id ?? page?.name ?? "Page";
  if (action.type === "setOption") return `${label}: ${action.name} · ${node && isNode(node) ? String(node.options?.[action.name] ?? "default") : "default"} → ${String(action.value ?? "default")}`;
  if (action.type === "setText") return `${label}: change text to “${action.text}”`;
  if (action.type === "wrap") return `Wrap ${action.children.length} layers in ${action.container.signature}`;
  if (action.type === "insert") return `Insert ${isNode(action.child) ? action.child.signature : "text"}`;
  return `${label}: ${action.type}`;
}
