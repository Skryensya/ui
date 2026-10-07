// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ingestFixture } from "@skryensya/reference-model/testing";
import { App } from "./App";
import { Workbench } from "./Workbench";
import type { ReferenceClient } from "./client";
const client = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  subscribe: vi.fn(),
  raw: vi.fn(),
  screenshot: vi.fn(),
  classification: vi.fn(),
  save: vi.fn(),
  review: vi.fn(),
  decide: vi.fn(),
  preview: vi.fn(),
  publish: vi.fn(),
  merged: vi.fn(),
  reconcile: vi.fn(),
}));
vi.mock("./client", async (original) => ({
  ...(await original<typeof import("./client")>()),
  createClient: () => client,
}));
beforeEach(() => {
  vi.resetAllMocks();
  location.hash = "";
  sessionStorage.clear();
  const i = ingestFixture();
  client.get.mockResolvedValue(i);
  client.list.mockResolvedValue([i]);
  client.subscribe.mockReturnValue(() => {});
  client.raw.mockResolvedValue(undefined);
  client.screenshot.mockRejectedValue(new Error("No screenshot in test"));
  client.classification.mockImplementation(async (i, fields) => ({
    ...i,
    revision: i.revision + 1,
    classification: { ...i.classification, ...fields },
  }));
  client.save.mockImplementation(async (i, patch) => ({
    ...i,
    revision: i.revision + 1,
    classification: { ...i.classification, ...patch.fields },
  }));
  client.decide.mockImplementation(async (i, decision) => ({
    ...i,
    revision: i.revision + 1,
    status:
      decision === "accept"
        ? "accepted"
        : decision === "reject"
          ? "rejected"
          : "review",
  }));
});
afterEach(cleanup);
it("filters Inbox and opens an ingest through its canonical route", async () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText("Access token"), {
    target: { value: "test" },
  });
  fireEvent.click(screen.getByText("Connect"));
  await screen.findByText("A reference");
  fireEvent.change(screen.getByLabelText("Subject"), {
    target: { value: "card" },
  });
  await waitFor(() =>
    expect(client.list).toHaveBeenLastCalledWith({
      inbox: "true",
      subject: "card",
      offset: 0,
    }),
  );
  const link = screen.getByRole("link", { name: "A reference" });
  expect(link.getAttribute("href")).toBe(`#/ingests/${ingestFixture().id}`);
  location.hash = link.getAttribute("href")!;
  window.dispatchEvent(new Event("hashchange"));
  await screen.findByText("Closed catalogue vocabulary");
  expect(client.get).toHaveBeenCalledWith(ingestFixture().id);
});
it("edits only the changed classification field as human-owned, then accepts", async () => {
  render(
    <Workbench client={client as ReferenceClient} id={ingestFixture().id} />,
  );
  await screen.findByText("Closed catalogue vocabulary");
  fireEvent.change(screen.getByLabelText(/^Subject/), {
    target: { value: "hero" },
  });
  fireEvent.click(screen.getByText("Save human decisions"));
  await waitFor(() =>
    expect(client.save).toHaveBeenCalledWith(
      expect.objectContaining({ revision: 1 }),
      {
        fields: { subject: { value: "hero", source: "human" } },
        notes: undefined,
        rating: undefined,
      },
    ),
  );
  await waitFor(() =>
    expect((screen.getByText("Accept") as HTMLButtonElement).disabled).toBe(
      false,
    ),
  );
  fireEvent.click(screen.getByText("Accept"));
  await waitFor(() =>
    expect(client.decide).toHaveBeenCalledWith(
      expect.objectContaining({ revision: 2 }),
      "accept",
    ),
  );
});
it("rejects explicitly and renders exact publication preview files before any publish", async () => {
  render(
    <Workbench client={client as ReferenceClient} id={ingestFixture().id} />,
  );
  await screen.findByText("Closed catalogue vocabulary");
  fireEvent.click(screen.getByText("Reject"));
  await waitFor(() =>
    expect(client.decide).toHaveBeenCalledWith(expect.anything(), "reject"),
  );
  cleanup();
  const i = { ...ingestFixture(), status: "accepted" as const };
  client.get.mockResolvedValue(i);
  client.preview.mockResolvedValue({
    ingestId: i.id,
    revision: 1,
    kind: "fixed",
    exampleId: "test",
    baseSha: "sha",
    files: [
      {
        path: "contracts/examples/fixed/test.ts",
        content: "export const curated = true;",
      },
    ],
    digest: "digest",
    validation: { valid: true, output: "passed" },
  });
  render(<Workbench client={client as ReferenceClient} id={i.id} />);
  await screen.findByText("Closed catalogue vocabulary");
  fireEvent.click(screen.getByRole("tab", { name: "Publication" }));
  fireEvent.change(screen.getByLabelText("Publication mode"), {
    target: { value: "fixed" },
  });
  fireEvent.change(screen.getByLabelText("Title (Spanish)"), {
    target: { value: "Ejemplo" },
  });
  fireEvent.change(screen.getByLabelText("Purpose (English)"), {
    target: { value: "Show quota" },
  });
  fireEvent.change(screen.getByLabelText("Purpose (Spanish)"), {
    target: { value: "Mostrar cuota" },
  });
  fireEvent.change(screen.getByLabelText(/Curated UsageTree JSON/), {
    target: {
      value: JSON.stringify({
        contract: "typography",
        signature: "Text",
        children: "Storage",
      }),
    },
  });
  fireEvent.click(screen.getByText("Generate and validate preview"));
  await screen.findByText("export const curated = true;");
  expect(client.publish).not.toHaveBeenCalled();
});
