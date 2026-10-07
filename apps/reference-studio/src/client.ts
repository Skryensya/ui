import {
  ingestSchema,
  rawCaptureSchema,
  previewSchema,
  filterSchema,
  type IngestFilter,
  type ReferenceIngest,
  type ClassificationFields,
  type PublicationRequest,
  type ReferencePatch,
} from "@skryensya/reference-model";
export type Connection = { server: string; token: string };
export function createClient(
  connection: Connection,
  transport: typeof fetch = fetch,
) {
  const url = (path: string) =>
    `${connection.server.replace(/\/$/, "")}/api/${path}`;
  const headers = {
    authorization: `Bearer ${connection.token}`,
    "content-type": "application/json",
  };
  async function request(
    path: string,
    method = "GET",
    body?: unknown,
    signal?: AbortSignal,
  ) {
    const response = await transport(url(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
    if (!response.ok)
      throw new Error(
        `${response.status}: ${(await response.text()).slice(0, 2000)}`,
      );
    return response.json() as Promise<unknown>;
  }
  const write = async (
    i: ReferenceIngest,
    sub: string,
    method: string,
    fields: Record<string, unknown> = {},
  ) =>
    ingestSchema.parse(
      await request(`ingests/${i.id}${sub}`, method, {
        baseRevision: i.revision,
        ...fields,
      }),
    );
  return {
    async list(filter: Partial<IngestFilter> = {}) {
      const f = filterSchema.parse(filter);
      const query = new URLSearchParams(
        Object.entries(f).map(([k, v]) => [k, String(v)]),
      );
      const rows = await request(`ingests?${query}`);
      return ingestSchema.array().parse(rows);
    },
    async get(id: string) {
      return ingestSchema.parse(await request(`ingests/${id}`));
    },
    classification(i: ReferenceIngest, fields: ClassificationFields) {
      return write(i, "/classification", "PATCH", { fields });
    },
    save(i: ReferenceIngest, patch: ReferencePatch) {
      return write(i, "", "PATCH", patch);
    },
    review(i: ReferenceIngest, notes: string, rating?: number) {
      return write(i, "", "PATCH", { notes, rating });
    },
    decide(
      i: ReferenceIngest,
      decision: "accept" | "reject" | "review" | "classify",
    ) {
      return write(i, `/${decision}`, "POST");
    },
    async preview(i: ReferenceIngest, publication: PublicationRequest) {
      return previewSchema.parse(
        await request(`ingests/${i.id}/publication/preview`, "POST", {
          baseRevision: i.revision,
          request: publication,
        }),
      );
    },
    publish(i: ReferenceIngest, digest: string) {
      return write(i, "/publication/publish", "POST", { digest });
    },
    reconcile(i: ReferenceIngest, publicationId: string) {
      return write(i, "/publication/reconcile", "POST", { publicationId });
    },
    merged(i: ReferenceIngest, publicationId: string) {
      return write(i, "/publication/merged", "POST", { publicationId });
    },
    async raw(id: string) {
      return rawCaptureSchema.parse(await request(`ingests/${id}/raw`));
    },
    async screenshot(id: string, signal?: AbortSignal, thumbnail = false) {
      const response = await transport(
        url(`ingests/${id}/${thumbnail ? "thumbnail" : "screenshot"}`),
        {
          headers,
          signal,
        },
      );
      if (!response.ok) throw new Error(`Screenshot: ${response.status}`);
      return response.blob();
    },
    subscribe(id: string, listener: () => void) {
      const abort = new AbortController();
      void (async () => {
        while (!abort.signal.aborted) {
          try {
            const response = await transport(url(`ingests/${id}/events`), {
              headers,
              signal: abort.signal,
            });
            if (!response.ok || !response.body)
              throw new Error("Live updates disconnected");
            const reader = response.body.getReader(),
              decoder = new TextDecoder();
            let buffer = "";
            while (!abort.signal.aborted) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              let end: number;
              while ((end = buffer.indexOf("\n\n")) >= 0) {
                if (buffer.slice(0, end).startsWith("data:")) listener();
                buffer = buffer.slice(end + 2);
              }
            }
          } catch {
            /* Reconnect without putting credentials in an EventSource URL. */
          }
          if (!abort.signal.aborted)
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      })();
      return () => abort.abort();
    },
  };
}
export type ReferenceClient = ReturnType<typeof createClient>;
export const idFromHash = (hash: string): string | undefined =>
  /^#\/ingests\/([a-f0-9-]{36})$/i.exec(hash)?.[1];
export const navigationFilter = (view: string): Partial<IngestFilter> => ({
  ...(view === "Inbox"
    ? { inbox: "true" as const }
    : view === "Accepted"
      ? { status: "accepted" as const }
      : view === "Published"
        ? { status: "published" as const }
        : view === "Rejected"
          ? { status: "rejected" as const }
          : {}),
});
