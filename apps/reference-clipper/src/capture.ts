import {
  captureInputSchema,
  ingestSchema,
  type CaptureInput,
  type RawCapture,
} from "@skryensya/reference-model";
export function payload(
  raw: RawCapture,
  source: CaptureInput["source"],
  screenshot: string,
  notes?: string,
): CaptureInput {
  return captureInputSchema.parse({
    source,
    raw,
    screenshot,
    notes,
    capturedAt: new Date().toISOString(),
  });
}
export async function submitCapture(
  config: { server: string; studio: string; token: string },
  capture: CaptureInput,
  transport: typeof fetch = fetch,
  open: (url: string) => Promise<unknown> = (url) =>
    chrome.tabs.create({ url }),
) {
  const response = await transport(
    `${config.server.replace(/\/$/, "")}/api/ingests`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(capture),
      signal: AbortSignal.timeout(120000),
    },
  );
  if (!response.ok)
    throw new Error(
      `Reference Server rejected capture (${response.status}): ${(await response.text()).slice(0, 500)}`,
    );
  const ingest = ingestSchema.parse(await response.json());
  const url = new URL(config.studio);
  url.hash = `/ingests/${ingest.id}`;
  await open(url.toString());
  return ingest;
}
