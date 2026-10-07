import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@skryensya/react/button";
import { Badge } from "@skryensya/react/badge";
import { Callout } from "@skryensya/react/callout";
import { EmptyState } from "@skryensya/react/empty-state";
import { FormField } from "@skryensya/react/form-field";
import { Input } from "@skryensya/react/input";
import { NativeSelect } from "@skryensya/react/select-native";
import { Checkbox } from "@skryensya/react/selection";
import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";
import { Heading, Text } from "@skryensya/react/typography";
import { Inline, Stack } from "@skryensya/react/layout";
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
import { ThemeToggle } from "./theme";
import { toneOf } from "./status";
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
    <main className="studio-connection">
      <div className="studio-panel">
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading as="h1" size="h3" flush>
              Reference Studio
            </Heading>
            <Text tone="secondary">
              Capture evidence. Curate references. Publish through review.
            </Text>
          </Stack>
          <Stack as="form" gap="md" onSubmit={submit}>
            <FormField label="Server">
              <Input
                name="server"
                type="url"
                defaultValue={
                  sessionStorage.getItem("referenceServer") ??
                  (import.meta.env.VITE_REFERENCE_API_URL ||
                    "http://localhost:4318")
                }
                required
              />
            </FormField>
            <FormField label="Access token">
              <Input name="token" type="password" required />
            </FormField>
            <Inline justify="between" align="center">
              <ThemeToggle />
              <Button type="submit" tone="accent">
                Connect
              </Button>
            </Inline>
          </Stack>
        </Stack>
      </div>
    </main>
  );
}
const views = ["Inbox", "References", "Accepted", "Published", "Rejected"];
function useNarrow() {
  const query = "(max-width: 900px)";
  const [narrow, setNarrow] = useState(
    () => typeof matchMedia === "function" && matchMedia(query).matches,
  );
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const media = matchMedia(query);
    const changed = () => setNarrow(media.matches);
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);
  return narrow;
}
export function App() {
  const [connection, setConnection] = useState<Connection>(),
    [id, setId] = useState(idFromHash(location.hash));
  const [view, setView] = useState("Inbox"),
    [filter, setFilter] = useState<Partial<IngestFilter>>({}),
    [rows, setRows] = useState<ReferenceIngest[]>([]),
    [error, setError] = useState(""),
    [compare, setCompare] = useState<string[]>([]),
    [refresh, setRefresh] = useState(0),
    narrow = useNarrow();
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
      <header className="studio-header">
        <a className="studio-brand" href="#">
          <strong>Reference Studio</strong>
          <span>Evidence is not a catalogue entry</span>
        </a>
        <ThemeToggle />
        <Button variant="ghost" onClick={() => setConnection(undefined)}>
          Disconnect
        </Button>
      </header>
      <div className="studio-shell">
        <div className="studio-nav">
          <NavList
            aria-label="Reference views"
            orientation={narrow ? "horizontal" : "vertical"}
          >
            <NavListGroup>
              {views.map((item) => (
                <NavListLink
                  key={item}
                  href="#"
                  current={view === item && !id}
                  onClick={(event) => {
                    event.preventDefault();
                    location.hash = "";
                    setView(item);
                    setFilter({});
                    setCompare([]);
                  }}
                >
                  {item}
                </NavListLink>
              ))}
            </NavListGroup>
          </NavList>
        </div>
        <main className="studio-main">
          {id ? (
            <Workbench key={id} client={client} id={id} />
          ) : (
            <Stack gap="lg">
              <Inline justify="between" align="center">
                <Heading as="h1" size="h3" flush>
                  {view}
                </Heading>
                <Button
                  variant="ghost"
                  onClick={() => setRefresh((n) => n + 1)}
                >
                  Refresh
                </Button>
              </Inline>
              <div
                className="studio-panel studio-filters"
                role="group"
                aria-label="Inbox filters"
              >
                <FormField label="Status">
                  <NativeSelect
                    value={filter.status ?? ""}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    <option value="">All</option>
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Subject">
                  <NativeSelect
                    value={filter.subject ?? ""}
                    onChange={(e) => set("subject", e.target.value)}
                  >
                    <option value="">All</option>
                    {subjects.map((s) => (
                      <option key={s.id}>{s.id}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Scale">
                  <NativeSelect
                    value={filter.scale ?? ""}
                    onChange={(e) => set("scale", e.target.value)}
                  >
                    <option value="">All</option>
                    {SCALES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </NativeSelect>
                </FormField>
                <FormField label="Intent">
                  <Input
                    list="intent-options"
                    value={filter.intent ?? ""}
                    onChange={(e) => set("intent", e.target.value)}
                    placeholder="domain/area/intent"
                  />
                </FormField>
                <datalist id="intent-options">
                  {intents.map((i) => (
                    <option key={i.id} value={i.id} />
                  ))}
                </datalist>
                <FormField label="Source host">
                  <Input
                    value={filter.host ?? ""}
                    onChange={(e) => set("host", e.target.value)}
                  />
                </FormField>
                <FormField label="From">
                  <Input
                    type="date"
                    value={filter.from?.slice(0, 10) ?? ""}
                    onChange={(e) => set("from", e.target.value)}
                  />
                </FormField>
                <FormField label="To">
                  <Input
                    type="date"
                    value={filter.to?.slice(0, 10) ?? ""}
                    onChange={(e) => set("to", e.target.value)}
                  />
                </FormField>
                <FormField label="Minimum confidence">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step=".05"
                    value={filter.minConfidence ?? ""}
                    onChange={(e) => set("minConfidence", e.target.value)}
                  />
                </FormField>
                <FormField label="Publication">
                  <NativeSelect
                    value={filter.published ?? ""}
                    onChange={(e) => set("published", e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Published</option>
                    <option value="false">Unpublished</option>
                  </NativeSelect>
                </FormField>
              </div>
              {error && (
                <Callout tone="danger" title="Could not load references">
                  {error}
                </Callout>
              )}
              {compare.length > 0 && (
                <section
                  className="studio-panel"
                  aria-label="Reference comparison"
                >
                  <Stack gap="md">
                    <Inline justify="between" align="center">
                      <Heading as="h2" size="h4" flush>
                        Comparison
                      </Heading>
                      <Button variant="ghost" onClick={() => setCompare([])}>
                        Clear comparison
                      </Button>
                    </Inline>
                    <div className="studio-comparison">
                      {compare.map((id) => (
                        <Stack gap="xs" key={id}>
                          <Screenshot client={client} id={id} />
                          <a href={`#/ingests/${id}`}>Open reference</a>
                        </Stack>
                      ))}
                    </div>
                  </Stack>
                </section>
              )}
              {rows.length > 0 && (
                <section
                  className="studio-cards"
                  aria-label="Reference ingests"
                >
                  {rows.map((i) => (
                    <article
                      className="studio-card"
                      key={i.id}
                      data-selected={compare.includes(i.id) ? "" : undefined}
                    >
                      <Screenshot client={client} id={i.id} thumbnail />
                      <h2 className="studio-card__title">
                        <a href={`#/ingests/${i.id}`}>
                          {i.source.title || i.source.hostname}
                        </a>
                      </h2>
                      <p className="studio-meta">
                        {i.source.hostname} ·{" "}
                        <time dateTime={i.capture.capturedAt}>
                          {new Date(i.capture.capturedAt).toLocaleString(
                            undefined,
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}
                        </time>
                      </p>
                      <p className="studio-meta">
                        {[
                          i.classification?.subject?.value,
                          i.classification?.scale?.value,
                          i.classification?.intent?.value,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Unclassified"}
                      </p>
                      <div className="studio-card__footer">
                        <Badge tone={toneOf(i.status)}>{i.status}</Badge>
                        <Checkbox
                          checked={compare.includes(i.id)}
                          disabled={
                            !compare.includes(i.id) && compare.length >= 3
                          }
                          onCheckedChange={({ checked }) =>
                            setCompare((ids) =>
                              checked === true
                                ? [...ids, i.id]
                                : ids.filter((id) => id !== i.id),
                            )
                          }
                        >
                          Compare
                        </Checkbox>
                      </div>
                    </article>
                  ))}
                </section>
              )}
              {!rows.length && !error && (
                <EmptyState
                  title="No references match these filters."
                  description="Clip a page with the Reference Clipper, or loosen the filters."
                />
              )}
              <Inline justify="end">
                <Button
                  variant="ghost"
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
                  variant="ghost"
                  disabled={rows.length < 100}
                  onClick={() =>
                    setFilter((f) => ({ ...f, offset: (f.offset ?? 0) + 100 }))
                  }
                >
                  Next
                </Button>
              </Inline>
            </Stack>
          )}
        </main>
      </div>
    </>
  );
}
