import type {
  CaptureInput,
  ReferenceIngest,
  ReferenceClassification,
} from "./index.js";
export const timestamp = "2026-01-01T00:00:00.000Z";
export function captureFixture(): CaptureInput {
  return {
    source: {
      url: "https://example.com/ui",
      hostname: "example.com",
      title: "A reference",
    },
    capturedAt: timestamp,
    screenshot:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADUlEQVQImWP4////fwAJ+wP9CNHoHgAAAABJRU5ErkJggg==",
    raw: {
      mode: "region",
      viewport: { width: 100, height: 100 },
      bounds: { x: 0, y: 0, width: 100, height: 100 },
      truncated: false,
      root: {
        tag: "section",
        role: "region",
        attributes: {},
        text: "Storage quota",
        styles: { display: "flex" },
        rect: { x: 0, y: 0, width: 100, height: 100 },
        children: [],
      },
    },
  };
}
export function classificationFixture(): ReferenceClassification {
  return {
    subject: { value: "card", source: "classifier", confidence: 0.98 },
    scale: { value: "component", source: "classifier", confidence: 0.95 },
    intent: {
      value: "metrics/usage/quota",
      source: "classifier",
      confidence: 0.82,
    },
    classifier: "jev",
    classifierVersion: "test",
    updatedAt: timestamp,
  };
}
export function ingestFixture(): ReferenceIngest {
  const c = captureFixture();
  return {
    id: "00000000-0000-4000-8000-000000000001",
    status: "review",
    source: c.source,
    capture: {
      viewport: c.raw.viewport,
      capturedAt: timestamp,
      screenshotAssetId: "test/screenshot.png",
      rawCaptureAssetId: "test/capture.json",
      domHash: "dom",
      structureHash: "structure",
    },
    classification: classificationFixture(),
    classificationRuns: [],
    publications: [],
    revision: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
