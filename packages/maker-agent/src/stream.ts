/*
 * STREAMING, THE PURE HALF. Two small pieces with no network in them, so they can be tested with plain
 * strings: a reader for server-sent events, and an extractor that pulls COMPLETED operations out of a
 * tool call's arguments while the model is still writing them.
 *
 * WHY THE EXTRACTOR EXISTS. `maker_try` takes `{ "operations": [ {...}, {...}, ... ] }`. The provider
 * streams that JSON a few characters at a time, and `JSON.parse` of a half-written document throws. But
 * every element of the array is a self-contained operation, so the moment its closing brace arrives it
 * can be parsed and shown, long before the array (and the call) is finished. That is what lets the
 * canvas fill in one section at a time instead of staying empty until the whole answer is in.
 */

/** Each server-sent event's `data` payload, in order. Handles `\n` and `\r\n`, split chunks, comments. */
export async function* sseData(body: ReadableStream<Uint8Array>, signal: AbortSignal): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const onAbort = () => void reader.cancel().catch(() => undefined);
  signal.addEventListener("abort", onAbort, { once: true });
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      for (let end = boundary(buffer); end; end = boundary(buffer)) {
        const event = buffer.slice(0, end.at);
        buffer = buffer.slice(end.at + end.length);
        const data = payload(event);
        if (data !== undefined) yield data;
      }
    }
    buffer += decoder.decode();
    const rest = payload(buffer);
    if (rest !== undefined) yield rest;
  } finally {
    signal.removeEventListener("abort", onAbort);
    reader.releaseLock();
  }
}

/** Where the first blank line ends an event, as an index and the length of that separator. */
function boundary(text: string): { at: number; length: number } | undefined {
  const match = /\r?\n\r?\n/.exec(text);
  return match ? { at: match.index, length: match[0].length } : undefined;
}

function payload(event: string): string | undefined {
  const lines = event.split(/\r?\n/).filter((line) => line.startsWith("data:"));
  if (!lines.length) return undefined;
  return lines.map((line) => line.slice(5).replace(/^ /, "")).join("\n");
}

/**
 * The operations of a streamed `maker_try` argument document, as they are written. `push` takes the next
 * chunk of JSON text and says whether anything new CLOSED in it; `operations()` is the batch so far.
 *
 * Granularity matters here. A model usually writes ONE `page` operation holding many inner operations
 * (`{"type":"page","page":"p","operations":[ insert, insert, ... ]}`), so waiting for the top-level
 * operation to close would show nothing until the end. So the inner operations of the page operation
 * being written count too: each is emitted the moment its own brace closes, inside a `page` operation that
 * has only the inner operations finished so far. When the page operation itself closes, it is replaced by
 * the whole thing as parsed. A member that is not valid JSON is skipped rather than thrown: the complete
 * call is validated again, whole, when it ends.
 */
export class OperationStream {
  private text = "";
  private scanned = 0;
  /** Open containers, innermost last: `{` the document, `[` the operations, `{` one operation, `[` its inner list. */
  private stack: ("{" | "[")[] = [];
  private inString = false;
  private escaped = false;
  /** Where the operation being written started, and where its inner list opened. */
  private topStart = -1;
  private listAt = -1;
  private innerStart = -1;
  private done: unknown[] = [];
  /** The `page` operation being written: its page, and the inner operations finished so far. */
  private open: { page?: string; inner: unknown[] } | undefined;

  push(chunk: string): boolean {
    this.text += chunk;
    let changed = false;
    for (; this.scanned < this.text.length; this.scanned++) {
      const char = this.text[this.scanned]!;
      if (this.inString) {
        if (this.escaped) this.escaped = false;
        else if (char === "\\") this.escaped = true;
        else if (char === '"') this.inString = false;
        continue;
      }
      if (char === '"') { this.inString = true; continue; }
      if (char === "{" || char === "[") {
        const depth = this.stack.length;
        if (char === "{" && depth === 2 && this.stack[1] === "[") { this.topStart = this.scanned; this.open = undefined; }
        else if (char === "[" && depth === 3 && this.stack[2] === "{") { this.listAt = this.scanned; this.open = { page: this.pageOf(), inner: [] }; }
        else if (char === "{" && depth === 4 && this.stack[3] === "[") this.innerStart = this.scanned;
        this.stack.push(char);
        continue;
      }
      if (char !== "}" && char !== "]") continue;
      this.stack.pop();
      const depth = this.stack.length;
      if (char === "}" && depth === 4 && this.stack[3] === "[" && this.innerStart >= 0) {
        const inner = this.parse(this.innerStart, this.scanned);
        this.innerStart = -1;
        if (inner !== undefined && this.open?.page !== undefined) { this.open.inner.push(inner); changed = true; }
      } else if (char === "}" && depth === 2 && this.stack[1] === "[" && this.topStart >= 0) {
        const whole = this.parse(this.topStart, this.scanned);
        this.topStart = -1;
        this.open = undefined;
        if (whole !== undefined) { this.done.push(whole); changed = true; }
      }
    }
    return changed;
  }

  /** The batch as written so far: finished operations, then the page operation in progress with what it has. */
  operations(): unknown[] {
    return this.open?.page !== undefined && this.open.inner.length
      ? [...this.done, { type: "page", page: this.open.page, operations: [...this.open.inner] }]
      : [...this.done];
  }

  /** How many operations that is, counting a page operation by its inner ones. */
  count(): number {
    return this.operations().reduce<number>((n, op) => n + (isPage(op) ? op.operations.length : 1), 0);
  }

  private parse(from: number, to: number): unknown {
    try { return JSON.parse(this.text.slice(from, to + 1)); } catch { return undefined; }
  }

  /** The `page` key of the operation being written, read from its head, once the inner list has opened. */
  private pageOf(): string | undefined {
    const head = this.text.slice(this.topStart, this.scanned);
    const match = /"page"\s*:\s*("(?:[^"\\]|\\.)*")/.exec(head);
    if (!match) return undefined;
    try { return JSON.parse(match[1]!) as string; } catch { return undefined; }
  }
}

const isPage = (op: unknown): op is { type: "page"; operations: unknown[] } =>
  typeof op === "object" && op !== null && (op as { type?: unknown }).type === "page" && Array.isArray((op as { operations?: unknown }).operations);
