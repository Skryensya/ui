/*
 * THE AI LOG, IN DEVELOPMENT ONLY. Every message sent to Maker AI is written, with the answer it got, to
 * `apps/maker/.ai-logs/turns.jsonl` (one JSON object per line, git-ignored) by the dev server, so the conversations can be read
 * and scored later: what was asked, what the page was, what the brief and the answer were, what was proposed, and what the person
 * did with it. Nothing is logged in a production build, and the API key is never part of an entry.
 */
const SESSION = Math.random().toString(36).slice(2, 10);

export type AiLogEntry =
  | {
      type: "turn";
      turn: number;
      intent: string;
      provider: string;
      model: string;
      project: string;
      page: string;
      selection: readonly string[];
      brief?: unknown;
      answer?: string;
      operations?: readonly unknown[];
      changes?: readonly string[];
      questions?: unknown;
      error?: string;
      durationMs: number;
    }
  | { type: "outcome"; turn: number; outcome: string };

export function logAi(entry: AiLogEntry): void {
  if (!import.meta.env.DEV) return;
  try {
    void fetch("/__maker-ai-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ at: new Date().toISOString(), session: SESSION, ...entry }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* Logging never gets in the way of the conversation. */
  }
}
