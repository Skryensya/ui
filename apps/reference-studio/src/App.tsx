import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@skryensya/react/button";
import { Badge } from "@skryensya/react/badge";
import {
  subjects,
  SCALES,
  statuses,
  intents,
  type IngestFilter,
  type ReferenceIngest,
} from "@skryensya/reference-model";
import {
  createClient,
  idFromHash,
  navigationFilter,
  type Connection,
} from "./client";
import { Workbench } from "./Workbench";
import { Screenshot } from "./Screenshot";
function ConnectionForm({ connect }: { connect: (c: Connection) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    connect({
      server: String(values.get("server")),
      token: String(values.get("token")),
    });
  }
  return (
    <main className="connection">
      <h1>Reference Studio</h1>
      <p>Capture evidence. Curate references. Publish through review.</p>
      <form onSubmit={submit}>
        <label>
          Server
          <input
            name="server"
            type="url"
            defaultValue={
              sessionStorage.getItem("referenceServer") ??
              (import.meta.env.VITE_REFERENCE_API_URL ||
                "http://localhost:4318")
            }
            required
          />
        </label>
        <label>
          Access token
          <input name="token" type="password" required />
        </label>
        <Button type="submit">Connect</Button>
      </form>
    </main>
  );
}
export function App() {
  const [connection, setConnection] = useState<Connection>(),
    [id, setId] = useState(idFromHash(location.hash));
  const [view, setView] = useState("Inbox"),
    [filter, setFilter] = useState<Partial<IngestFilter>>({}),
    [rows, setRows] = useState<ReferenceIngest[]>([]),
    [error, setError] = useState(""),
    [compare, setCompare] = useState<string[]>([]),
    [refresh, setRefresh] = useState(0);
  const client = useMemo(
    () => (connection ? createClient(connection) : undefined),
    [connection],
  );
  useEffect(() => {
    const changed = () => setId(idFromHash(location.hash));
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    if (!client || id) return;
    let active = true;
    void client
      .list({ ...navigationFilter(view), ...filter })
      .then((r) => {
        if (active) {
          setRows(r);
          setError("");
        }
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [client, view, filter, id, refresh]);
  if (!client)
    return (
      <ConnectionForm
        connect={(c) => {
          sessionStorage.setItem("referenceServer", c.server);
          setConnection(c);
        }}
      />
    );
  const set = (key: string, value: string) =>
    setFilter((f) => {
      const next = { ...f, offset: 0, [key]: value || undefined };
      if (key === "from" || key === "to")
        next[key] = value
          ? new Date(
              `${value}T${key === "to" ? "23:59:59.999" : "00:00:00.000"}Z`,
            ).toISOString()
          : undefined;
      return next;
    });
  return (
    <>
      <header>
        <a href="#">Reference Studio</a>
        <span>Evidence is not a catalogue entry</span>
        <Button variant="ghost" onClick={() => setConnection(undefined)}>
          Disconnect
        </Button>
      </header>
      <div className="shell">
        <nav aria-label="Reference views">
          {["Inbox", "References", "Accepted", "Published", "Rejected"].map(
            (item) => (
              <Button
                key={item}
                variant={view === item && !id ? "solid" : "ghost"}
                onClick={() => {
                  location.hash = "";
                  setView(item);
                  setFilter({});
                  setCompare([]);
                }}
              >
                {item}
              </Button>
            ),
          )}
        </nav>
        <main>
          {id ? (
            <Workbench key={id} client={client} id={id} />
          ) : (
            <>
              <div className="title-row">
                <h1>{view}</h1>
                <Button
                  variant="ghost"
                  onClick={() => setRefresh((n) => n + 1)}
                >
                  Refresh
                </Button>
              </div>
              <div className="filters" aria-label="Inbox filters">
                <label>
                  Status
                  <select
                    value={filter.status ?? ""}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    <option value="">All</option>
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Subject
                  <select
                    value={filter.subject ?? ""}
                    onChange={(e) => set("subject", e.target.value)}
                  >
                    <option value="">All</option>
                    {subjects.map((s) => (
                      <option key={s.id}>{s.id}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Scale
                  <select
                    value={filter.scale ?? ""}
                    onChange={(e) => set("scale", e.target.value)}
                  >
                    <option value="">All</option>
                    {SCALES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Intent
                  <input
                    list="intent-options"
                    value={filter.intent ?? ""}
                    onChange={(e) => set("intent", e.target.value)}
                    placeholder="domain/area/intent"
                  />
                </label>
                <datalist id="intent-options">
                  {intents.map((i) => (
                    <option key={i.id} value={i.id} />
                  ))}
                </datalist>
                <label>
                  Source host
                  <input
                    value={filter.host ?? ""}
                    onChange={(e) => set("host", e.target.value)}
                  />
                </label>
                <label>
                  From
                  <input
                    type="date"
                    value={filter.from?.slice(0, 10) ?? ""}
                    onChange={(e) => set("from", e.target.value)}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={filter.to?.slice(0, 10) ?? ""}
                    onChange={(e) => set("to", e.target.value)}
                  />
                </label>
                <label>
                  Minimum confidence
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step=".05"
                    value={filter.minConfidence ?? ""}
                    onChange={(e) => set("minConfidence", e.target.value)}
                  />
                </label>
                <label>
                  Publication
                  <select
                    value={filter.published ?? ""}
                    onChange={(e) => set("published", e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Published</option>
                    <option value="false">Unpublished</option>
                  </select>
                </label>
              </div>
              {error && <p role="alert">{error}</p>}
              {compare.length > 0 && (
                <section
                  className="comparison"
                  aria-label="Reference comparison"
                >
                  {compare.map((id) => (
                    <article key={id}>
                      <a href={`#/ingests/${id}`}>Open reference</a>
                      <Screenshot client={client} id={id} />
                    </article>
                  ))}
                  <Button variant="ghost" onClick={() => setCompare([])}>
                    Clear comparison
                  </Button>
                </section>
              )}
              <section className="inbox" aria-label="Reference ingests">
                {rows.map((i) => (
                  <article key={i.id}>
                    <a
                      href={`#/ingests/${i.id}`}
                      aria-label={i.source.title || i.source.hostname}
                    >
                      <div className="thumbnail">
                        <Screenshot client={client} id={i.id} thumbnail />
                      </div>
                      <h2>{i.source.title || i.source.hostname}</h2>
                    </a>
                    <p>{i.source.hostname}</p>
                    <Badge>{i.status}</Badge>
                    <p>
                      {[
                        i.classification?.subject?.value,
                        i.classification?.scale?.value,
                        i.classification?.intent?.value,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Unclassified"}
                    </p>
                    <time dateTime={i.capture.capturedAt}>
                      {new Date(i.capture.capturedAt).toLocaleString()}
                    </time>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={compare.includes(i.id)}
                        disabled={
                          !compare.includes(i.id) && compare.length >= 3
                        }
                        onChange={(e) =>
                          setCompare((ids) =>
                            e.target.checked
                              ? [...ids, i.id]
                              : ids.filter((id) => id !== i.id),
                          )
                        }
                      />
                      Compare
                    </label>
                  </article>
                ))}
              </section>
              {!rows.length && !error && (
                <p>No references match these filters.</p>
              )}
              <div className="actions">
                <Button
                  disabled={!filter.offset}
                  onClick={() =>
                    setFilter((f) => ({
                      ...f,
                      offset: Math.max(0, (f.offset ?? 0) - 100),
                    }))
                  }
                >
                  Previous
                </Button>
                <Button
                  disabled={rows.length < 100}
                  onClick={() =>
                    setFilter((f) => ({ ...f, offset: (f.offset ?? 0) + 100 }))
                  }
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
