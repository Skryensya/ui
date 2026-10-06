import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createAgentService } from "@skryensya/ai-compiler/agent";
import { asCompiledPair } from "@skryensya/ai-compiler/artifact";
import { snippets } from "@skryensya/snippets";
import { makerContext, entryOf, findChild, isNode, layoutOf, pageOf, type MakerProposal, type MakerSite } from "@skryensya/maker-model";
import { runAgent, testConnection, type AskedQuestion, type ConversationTurn, type ProviderConnection, type ProviderId } from "@skryensya/maker-agent";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { Dialog } from "@skryensya/react/dialog";
import { FormField } from "@skryensya/react/form-field";
import { Input, Textarea } from "@skryensya/react/input";
import { Inline, Stack } from "@skryensya/react/layout";
import { Avatar } from "@skryensya/react/avatar";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "@skryensya/react/message";
import { NativeSelect } from "@skryensya/react/select-native";
import { Switch } from "@skryensya/react/switch";
import { Kbd } from "@skryensya/react/kbd";
import { Tag } from "@skryensya/react/tag";
import { Heading, Text } from "@skryensya/react/typography";
import { commitProposal, LOCAL_PROJECT, type Maker } from "../state";
import { knownRevision } from "../sync";
import { getProject } from "../projects";
import index from "../../../../artifacts/ai-index.json";
import manifest from "../../../../artifacts/ai-manifest.json";
import { draftOf, type Draft } from "./draft";
import { canRemember, forget, recall, remember } from "./vault";
import { QuestionCard } from "./QuestionCard";
import { logAi } from "./log";
import { StreamedText } from "./StreamedText";
import "./panel.css";

type Outcome = "pending" | "applied" | "discarded" | "reverted" | "merged";
/** A turn of the conversation, with what it proposed and what the person did about it. */
type Turn = ConversationTurn & { id: number; changes?: string[]; outcome?: Outcome; appliedAt?: number; questions?: readonly AskedQuestion[]; answers?: readonly string[]; plan?: { goal: string; checklist: readonly string[]; assumptions: readonly string[] } };
const OUTCOME: Record<Outcome, string> = {
  pending: "Waiting for your approval",
  applied: "Applied to your project",
  discarded: "Discarded. Nothing was changed",
  reverted: "Rolled back. The project is as it was",
  merged: "Carried into your next request",
};

/** First ideas for an empty conversation: a click fills the composer, so nothing is sent until the person says so. */
const SUGGESTIONS = ["Clone https://example.com", "Help me make a hero section", "Add a pricing section with three plans"];

/** The Maker's own server reads the page (a browser cannot read another site's HTML) and answers with a summary of it. */
const readSite = async (url: string, signal?: AbortSignal): Promise<unknown> => {
  const response = await fetch(`/api/snapshot?url=${encodeURIComponent(url)}`, { signal });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "The site could not be read.");
  return body;
};

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
  /* Opens by itself while nothing is configured: asking for a change cannot work until a provider is set up. */
  const [settings, setSettings] = useState(false);
  /* Keep the key encrypted on this device so it is not asked for again. On by default, and Disconnect forgets it. */
  const [keep, setKeep] = useState(true);
  /* REVIEW BEFORE APPLYING is off by default: a finished proposal goes straight into the project as one undoable edit (and
     can be rolled back from the chat). Turned on, it waits for Apply or Discard as before. Remembered on this device. */
  const [review, setReviewState] = useState(() => { try { return localStorage.getItem("maker.ai.review") === "1"; } catch { return false; } });
  const setReview = (on: boolean) => { setReviewState(on); try { localStorage.setItem("maker.ai.review", on ? "1" : "0"); } catch { /* not remembered */ } };
  const [recalled, setRecalled] = useState(false);
  useEffect(() => {
    let live = true;
    void recall().then(saved => {
      if (!live) return;
      if (!saved) { setSettings(true); return; }
      setConnection(saved); setConnected(true); setSettings(false); setStatus("Connected with the key saved on this device.");
    }).finally(() => { if (live) setRecalled(true); });
    return () => { live = false; };
  }, []);
  const dialogHost = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const dialog = dialogHost.current?.querySelector("dialog");
    if (!dialog) return;
    if (settings && !dialog.open) dialog.showModal();
    if (!settings && dialog.open) dialog.close();
  }, [settings]);
  const [content, setContent] = useState("");
  const [excluded, setExcluded] = useState<string[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const nextTurn = useRef(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  /** A turn is being written: the bar over the canvas shows its progress and owns Stop. */
  const [building, setBuilding] = useState(false);
  const [proposed, setProposed] = useState<{ proposal: MakerProposal; generation: number; turn: number }>();
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  /* A person's own edit makes any proposal, and its draft on the canvas, stale: the canvas goes back to the
     project they are editing. The proposal stays listed, and Apply says it conflicts, as it always has. */
  const revision = useRef(maker.revision);
  revision.current = maker.revision;
  useEffect(() => { if (proposed && proposed.generation !== maker.revision) onDraft(undefined); }, [maker.revision, proposed]);
  /* Follows the conversation while the person is at the bottom of it, and lets go the moment they scroll up to read: a
     reply that streams in must not drag them back down. "Jump to latest" brings the follow back. */
  const stick = useRef(true);
  const [stuck, setStuck] = useState(true);
  useEffect(() => { if (stick.current) log.current?.scrollTo({ top: log.current.scrollHeight }); }, [turns, busy]);
  useEffect(() => {
    const el = log.current;
    if (!el) return;
    const onScroll = () => { const near = el.scrollHeight - el.scrollTop - el.clientHeight < 48; stick.current = near; setStuck(near); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  /* Growing with what is typed, up to six lines. */
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.blockSize = "auto";
    el.style.blockSize = `${Math.min(el.scrollHeight, 6 * 24)}px`;
  }, [content]);
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
    try { await testConnection(connection, next.signal); if (!next.signal.aborted && mounted.current) { setConnected(true); setSettings(false); if (keep) await remember(connection); else await forget(); setStatus(keep ? "Connected. The key is saved, encrypted, on this device." : "Connected. The key stays in this session only."); } }
    catch (e) { fail(e, next); }
    finally { finish(next); }
  };
  const send = async (override?: string) => {
    const message = (override ?? content).trim();
    if (!message || busy || !connected) return;
    const frozen = context();
    const generation = maker.revision;
    const site = maker.site;
    const intent = message;
    const next = begin();
    /* A proposal still waiting for a decision is not thrown away by the next request: the request builds on it, and the
       new proposal contains both. Only a stale one (the project moved on underneath it) is dropped. */
    const carry = proposed && proposed.generation === maker.revision ? { site: proposed.proposal.site, operations: proposed.proposal.operations } : undefined;
    if (proposed) markTurn(proposed.turn, { outcome: carry ? "merged" : "discarded" });
    setBuilding(true); setProposed(undefined); setContent("");
    if (!carry) onDraft(undefined);
    const turn: Turn = { id: nextTurn.current++, content: intent, context: frozen };
    const started = Date.now();
    let final: { proposal: MakerProposal; generation: number; turn: number } | undefined;
    const record: { brief?: unknown; answer?: string; operations?: readonly unknown[]; changes?: readonly string[]; questions?: unknown; error?: string } = {};
    /* A round of questions the person did not answer in the card is answered by this message instead. */
    setTurns(previous => [...previous.slice(-19).map(t => t.questions && !t.answers ? { ...t, answers: [] } : t), turn]);
    try {
      for await (const event of runAgent({ connection: { ...connection }, site, context: frozen, content: intent, history: turns, service, signal: next.signal, readSite, ...(carry ? { carry } : {}) })) {
        if (!mounted.current || next.signal.aborted) break;
        if (event.type === "status") setStatus(event.text);
        else if (event.type === "brief") { record.brief = { goal: event.goal, checklist: event.checklist, assumptions: event.assumptions }; markTurn(turn.id, { plan: { goal: event.goal, checklist: event.checklist, assumptions: event.assumptions } }); }
        else if (event.type === "say") setTurns(previous => previous.map(t => t.id === turn.id ? { ...t, answer: (event.reset ? "" : t.answer ?? "") + event.delta } : t));
        else if (event.type === "draft") onDraft(revision.current === generation ? draftOf(site, event.site, event.operations, true) : undefined);
        else {
          record.answer = event.text;
          record.operations = event.proposal?.operations;
          record.questions = event.questions;
          setTurns(previous => previous.map(t => t.id === turn.id ? { ...t, answer: event.text || (event.proposal ? "Changes ready for review." : "No changes proposed.") } : t));
          if (event.proposal) {
            const changes = event.proposal.operations.map(op => summarize(op, event.proposal!.base));
            record.changes = changes;
            markTurn(turn.id, { changes, outcome: "pending" });
          }
          setProposed(event.proposal ? { proposal: event.proposal, generation, turn: turn.id } : undefined);
          if (event.proposal && !event.questions) final = { proposal: event.proposal, generation, turn: turn.id };
          /* The final proposal replaces the last draft: same nodes, now waiting for the person to decide. */
          onDraft(event.proposal && revision.current === generation ? draftOf(site, event.proposal.site, event.proposal.operations.length, false) : undefined);
          if (event.questions) markTurn(turn.id, { questions: event.questions });
          setStatus(event.questions ? "Maker AI has questions for you." : event.proposal ? "Proposal ready. Your project is unchanged." : "Finished without changes.");
        }
      }
      /* Review off: what was proposed is applied now, still one undoable edit. A conflict is reported like any other error. */
      if (final && !review && mounted.current && !next.signal.aborted) await commit(final, next.signal);
    } catch (e) { record.error = next.signal.aborted ? "cancelled" : e instanceof Error ? e.message : "AI request failed."; fail(e, next); }
    finally {
      logAi({ type: "turn", turn: turn.id, intent, provider: connection.provider, model: connection.model, project: maker.projectId, page: frozen.page.name, selection: frozen.selection.selectedIds, durationMs: Date.now() - started, ...record });
      if (mounted.current) setBuilding(false); finish(next);
    }
  };
  const markTurn = (id: number, patch: Partial<Turn>) => { if (patch.outcome) logAi({ type: "outcome", turn: id, outcome: patch.outcome }); setTurns(previous => previous.map(t => t.id === id ? { ...t, ...patch } : t)); };
  const discard = () => {
    if (proposed) markTurn(proposed.turn, { outcome: "discarded" });
    setProposed(undefined); onDraft(undefined); setStatus("Proposal discarded. Nothing was changed.");
  };
  /* Undo, but only while this edit is still the newest thing in the project: otherwise it would also take back what
     the person did afterwards. */
  const rollback = (turn: Turn) => {
    if (turn.appliedAt === undefined || maker.revision !== turn.appliedAt) { setStatus("You have edited since. Use Undo to step back through your changes."); return; }
    maker.undo();
    markTurn(turn.id, { outcome: "reverted" });
    setStatus("Rolled back. The project is as it was before this change.");
  };
  /* The answers go back as the next message, in the form the agent reads: one line per question. */
  const answerQuestions = (turn: Turn, answers: string[], recommended = false) => {
    if (!turn.questions) return;
    markTurn(turn.id, { answers });
    /* Taking every recommendation is a go-ahead: it says so, and the briefing step then asks no more. */
    void send([recommended ? "Use your recommendations. My answers:" : "My answers:", ...turn.questions.map((q, i) => `Q${i + 1} ${q.title}: ${answers[i]}`)].join("\n"));
  };
  /* Puts a proposal into the project: one gesture, one undo step. Shared by Apply and by the automatic apply. */
  const commit = async (captured: NonNullable<typeof proposed>, signal: AbortSignal) => {
    // Check the server too: its change event might not have reached this tab yet.
    if (maker.projectId !== LOCAL_PROJECT) {
      const current = await getProject(maker.projectId);
      if (current.revision !== captured.proposal.revision || knownRevision(maker.projectId) !== captured.proposal.revision) {
        throw new Error("Revision conflict. The project changed; discard and ask again.");
      }
    }
    signal.throwIfAborted();
    if (!mounted.current) return;
    const result = commitProposal(maker.projectId, captured.proposal, captured.generation);
    if (!result.ok) throw new Error(result.reason);
    setProposed(undefined); onDraft(undefined); setStatus("Applied as one undoable edit.");
    /* A gesture is one revision: that is the revision a rollback is still safe at. */
    markTurn(captured.turn, { outcome: "applied", appliedAt: captured.generation + 1 });
  };
  const apply = async () => {
    if (!proposed || busy) return;
    const next = begin();
    try { await commit(proposed, next.signal); } catch (e) { fail(e, next); }
    finally { finish(next); }
  };

  /* Enter sends and Shift+Enter breaks the line, as in any chat; ⌘/Ctrl+Enter still sends. Not while an input method is composing
     a character, where Enter confirms it. ArrowUp in an empty composer brings back the last thing asked, to edit and send again. */
  const onComposerKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
    else if (e.key === "ArrowUp" && !content && turns.length > 0) { e.preventDefault(); setContent(turns[turns.length - 1]!.content); }
  };
  /* A fresh conversation: what was proposed and not applied is dropped with it, as a discard. */
  const newChat = () => {
    if (proposed) markTurn(proposed.turn, { outcome: "discarded" });
    setTurns([]); setProposed(undefined); setStatus(""); setError(""); setContent(""); onDraft(undefined);
    input.current?.focus();
  };
  return <section className="maker-ai" aria-label="Maker AI">
    <header className="maker__panel-header"><Heading as="h2" size="h4" flush>Maker AI</Heading>
      <Inline gap="xs">
        <Button size="sm" variant="ghost" onClick={newChat} disabled={busy || turns.length === 0}>New chat</Button>
        <Button size="sm" variant="ghost" onClick={() => setSettings(!settings)} disabled={busy}>AI settings</Button>
      </Inline></header>
    {recalled && !connected && <section className="maker-ai__setup" aria-label="Set up AI">
      <Text weight="emphasis">Connect an AI to start</Text>
      <Text size="sm" tone="secondary">Maker AI uses your own provider and key. Choose one to ask for changes.</Text>
      <Button size="sm" onClick={() => setSettings(true)}>Set up AI</Button>
    </section>}
    <div ref={dialogHost}><Dialog title="AI settings" closeLabel="Close AI settings" onClose={() => setSettings(false)}>
<fieldset disabled={busy} className="maker-ai__settings">
      <Stack gap="sm">
        <Text size="sm" tone="secondary">Your key is sent directly to your chosen provider. If you choose to remember it, it is kept encrypted in this browser only. Browser access/CORS must be supported by the endpoint.</Text>
        <FormField label="Provider">
          <NativeSelect value={connection.provider} onChange={e => {
            const provider = e.currentTarget.value as ProviderId;
            setConnected(false); setConnection({ provider, apiKey: "", model: defaults[provider] });
          }} options={[{ value: "openai", label: "OpenAI" }, { value: "anthropic", label: "Anthropic" }, { value: "openrouter", label: "OpenRouter" }, { value: "compatible", label: "OpenAI-compatible" }]} />
        </FormField>
        {connection.provider === "compatible" && <FormField label="API base endpoint"><Input type="url" placeholder="https://example.com/v1" value={connection.endpoint ?? ""} onChange={e => { setConnected(false); setConnection({ ...connection, endpoint: e.currentTarget.value }); }} /></FormField>}
        <FormField label="API key"><Input type="password" autoComplete="off" value={connection.apiKey} onChange={e => { setConnected(false); setConnection({ ...connection, apiKey: e.currentTarget.value }); }} /></FormField>
        <FormField label="Model"><Input value={connection.model} onChange={e => { setConnected(false); setConnection({ ...connection, model: e.currentTarget.value }); }} /></FormField>
        {settings && <div role="status" aria-live="polite" className="maker-ai__settings-result">{status}</div>}
        {settings && error && <div role="alert">{error}</div>}
        <Switch checked={review} onCheckedChange={({ checked }) => setReview(checked === true)}>Review changes before applying (Apply and Discard)</Switch>
        {canRemember() && <Switch checked={keep} onCheckedChange={({ checked }) => setKeep(checked === true)}>Remember on this device (encrypted)</Switch>}
        <Inline gap="sm">
          <Button size="sm" onClick={() => void connect()}>Test &amp; connect</Button>
          <Button size="sm" variant="ghost" onClick={() => { setConnection({ ...connection, apiKey: "" }); setConnected(false); setProposed(undefined); onDraft(undefined); void forget().then(() => setStatus("Disconnected. The saved key was removed.")); }}>Disconnect</Button>
        </Inline>
      </Stack>
</fieldset></Dialog></div>
    <div className="maker-ai__conversation sk-scrollbar" role="log" aria-label="Conversation" aria-live="polite" ref={log}>
      {connected && turns.length === 0 && <div className="maker-ai__empty">
        <Text weight="emphasis">What should Maker build?</Text>
        <Text size="sm" tone="secondary">Describe it, or start from an idea. Selected layers are sent as context.</Text>
        <Stack gap="xs">{SUGGESTIONS.map(idea => <Button key={idea} size="sm" appearance="tactile" className="maker-ai__idea" onClick={() => { setContent(idea); input.current?.focus(); }}>{idea}</Button>)}</Stack>
      </div>}
      {turns.map((turn, i) => {
        const last = i === turns.length - 1;
        const where = `${turn.context.page.name} · ${turn.context.selection.primary ?? "page"}`;
        return <MessageGroup key={i}>
          <Message align="end">
            <MessageAvatar><Avatar name="You" size="sm" /></MessageAvatar>
            <MessageContent>
              <Text className="maker-ai__bubble maker-ai__bubble--you">{turn.content}</Text>
              <MessageFooter>{where}</MessageFooter>
            </MessageContent>
          </Message>
          <Message>
            <MessageAvatar><Avatar name="AI" size="sm" /></MessageAvatar>
            <MessageContent>
              {turn.plan && <>
                <MessageHeader>Plan</MessageHeader>
                <section className="maker-ai__bubble maker-ai__bubble--plan" aria-label="Plan">
                  <Text size="sm" weight="emphasis">{turn.plan.goal}</Text>
                  <ul>{turn.plan.checklist.map((item, n) => <li key={n}>{item}</li>)}</ul>
                  {turn.plan.assumptions.length > 0 && <Text size="sm" tone="secondary">Placeholders you will want to replace: {turn.plan.assumptions.join(" · ")}</Text>}
                </section>
              </>}
              {turn.answer
                ? <Text className="maker-ai__bubble"><StreamedText text={turn.answer} writing={last && busy} /></Text>
                : last && busy ? <span className="maker-ai__bubble maker-ai__typing" role="status" aria-label="Maker AI is working"><i /><i /><i />{status ? <span className="maker-ai__typing-status">{status}</span> : null}</span> : null}
              {turn.questions && <QuestionCard questions={turn.questions} {...(turn.answers ? { answers: turn.answers } : {})} disabled={busy} onSubmit={(answers, recommended) => answerQuestions(turn, answers, recommended)} />}
              {turn.outcome && turn.changes && <section className="maker-ai__summary" aria-label="Summary of changes" data-outcome={turn.outcome}>
                <Text size="sm" weight="emphasis">{OUTCOME[turn.outcome]}</Text>
                {(turn.outcome === "applied" || turn.outcome === "discarded" || turn.outcome === "reverted") && <ul>{turn.changes.map((line, n) => <li key={n}>{line}</li>)}</ul>}
                {turn.outcome === "pending" && <Text size="sm" tone="secondary">Nothing changes until you choose Apply or Discard.</Text>}
                {turn.outcome === "applied" && <Button size="sm" variant="ghost" disabled={busy} onClick={() => rollback(turn)}>Roll back</Button>}
              </section>}
            </MessageContent>
          </Message>
        </MessageGroup>;
      })}
    </div>
    {proposed && <section aria-label="Proposed changes"><Heading as="h3" size="h5" flush>{proposed.proposal.operations.length} proposed changes</Heading>
      <ul>{proposed.proposal.operations.map((op, i) => <li key={i}>{summarize(op, proposed.proposal.base)}</li>)}</ul>
      <Button size="sm" disabled={busy} onClick={() => onPreview(proposed.proposal.site)}>Preview</Button>
      {/* Apply and Discard live in the bar over the canvas, next to the draft they act on. */}
      {!barSlot && <>{" "}<Button size="sm" disabled={busy} onClick={() => void apply()}>Apply</Button>{" "}<Button size="sm" variant="ghost" disabled={busy} onClick={() => discard()}>Discard</Button></>}
    </section>}
    {!settings && <><p role="status" aria-live="polite">{status}</p>{error && <p role="alert">{error}</p>}</>}
    {stuck === false && turns.length > 0 && <Button size="sm" variant="soft" className="maker-ai__latest" onClick={() => { stick.current = true; setStuck(true); log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); }} post={<Icon name="arrow-down" />}>Jump to latest</Button>}
    <form className="maker-ai__composer" onSubmit={e => { e.preventDefault(); void send(); }}>
      <div className="maker-ai__context" role="group" aria-label="Attached context">{attached.length ? attached.map(id => {
        const child = findChild(maker.page.root, id);
        const items = child && isNode(child) && child.slots.children?.kind === "nodes" ? child.slots.children.children.filter(isNode).length : 0;
        const name = child && isNode(child) ? child.signature : "Text";
        return <Tag key={id} removable removeLabel={`Remove context ${child && isNode(child) ? name : "text"}`} onRemove={() => setExcluded([...excluded, id])}>{items ? `${name} · ${items} items` : name}</Tag>;
      }) : <Text as="span" size="sm" tone="secondary">{maker.page.name} page</Text>}
      {excluded.length > 0 && <Button size="sm" variant="ghost" type="button" onClick={() => setExcluded([])}>Restore selection</Button>}</div>
      <div className="maker-ai__field">
        <FormField label="Ask Maker" labelHidden><Textarea ref={input} value={content} maxLength={8000} rows={1} placeholder={connected ? "Ask Maker to change something…" : "Connect an AI to start"} onChange={e => setContent(e.currentTarget.value)} onKeyDown={onComposerKey} /></FormField>
        {busy && !barSlot
          ? <Button type="button" size="sm" iconOnly aria-label="Stop generating" onClick={() => controller.current?.abort()}><Icon name="close" /></Button>
          : <Button type="submit" size="sm" tone="accent" iconOnly aria-label="Send" disabled={!connected || busy || !content.trim()}><Icon name="arrow-up" /></Button>}
      </div>
      <Text size="sm" tone="tertiary" className="maker-ai__hint"><Kbd>Enter</Kbd> to send · <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> for a new line</Text>
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
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => discard()}>Discard</Button>
        </> : null}
      </div>, barSlot) : null}
  </section>;
}

function summarize(op: MakerProposal["operations"][number], site: MakerSite): string {
  if (op.type !== "edit") {
    switch (op.type) {
      case "addPage": return `Add page: ${op.page.name}`;
      case "addLayout": return `Add layout: ${op.layout.name}${op.makeDefault ? " (default for pages)" : ""}`;
      case "removeLayout": return `Remove layout: ${layoutOf(site, op.layout)?.name ?? op.layout}`;
      case "renameLayout": return `Rename layout to ${op.name}`;
      case "setDefaultLayout": return op.layout ? `Use ${layoutOf(site, op.layout)?.name ?? "a layout"} for pages that do not choose` : "No default layout";
      case "setPageLayout": return `${pageOf(site, op.page)?.name ?? "Page"}: ${op.layout === "none" ? "no layout" : op.layout ? `layout ${layoutOf(site, op.layout)?.name ?? op.layout}` : "site default layout"}`;
      default: return `${op.type} · ${op.page}`;
    }
  }
  const action = op.operation;
  const page = entryOf(site, op.page);
  const id = "node" in action ? action.node : "child" in action && typeof action.child === "string" ? action.child : undefined;
  const node = id && page ? findChild(page.root, id) : undefined;
  const label = node && isNode(node) ? node.signature : id ?? page?.name ?? "Page";
  if (action.type === "setOption") return `${label}: ${action.name} · ${node && isNode(node) ? String(node.options?.[action.name] ?? "default") : "default"} → ${String(action.value ?? "default")}`;
  if (action.type === "setText") return `${label}: change text to “${action.text}”`;
  if (action.type === "wrap") return `Wrap ${action.children.length} layers in ${action.container.signature}`;
  if (action.type === "insert") return `Insert ${isNode(action.child) ? action.child.signature : "text"}`;
  return `${label}: ${action.type}`;
}
