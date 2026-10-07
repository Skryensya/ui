import { z } from "zod";
import { captureDocument } from "./document";
import { hidePreview, showPreview } from "./preview";
import { payload, submitCapture } from "./capture";
const requestSchema = z
  .object({
    mode: z.enum(["page", "selection"]),
    tabId: z.number().int(),
    windowId: z.number().int(),
    config: z
      .object({ server: z.url(), studio: z.url(), token: z.string().min(1) })
      .strict(),
  })
  .strict();
let busy = false;
async function capture(request: z.infer<typeof requestSchema>) {
  const target = { tabId: request.tabId };
  await chrome.scripting.executeScript({ target, func: hidePreview });
  const [result] = await chrome.scripting.executeScript({
    target,
    func: captureDocument,
    args: [request.mode],
  });
  if (!result.result) throw new Error("Could not capture this page");
  if (request.mode === "selection")
    void chrome.storage.local.set({
      captureStatus: "Capturing… Keep this tab active.",
    });
  const { raw, source, scroll } = result.result;
  const dpr = raw.viewport.deviceScaleFactor ?? 1;
  const b = raw.bounds,
    width = Math.round(b.width * dpr),
    height = Math.round(b.height * dpr);
  const keepViewport =
    raw.mode !== "page" &&
    b.x >= scroll.x &&
    b.y >= scroll.y &&
    b.x + b.width <= scroll.x + raw.viewport.width &&
    b.y + b.height <= scroll.y + raw.viewport.height;
  if (width > 32767 || height > 32767 || width * height > 100_000_000)
    throw new Error(
      "Capture exceeds Chrome canvas limits. Select a smaller region.",
    );
  const canvas = new OffscreenCanvas(width, height),
    ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Screenshot canvas unavailable");
  try {
    for (let y = b.y; y < b.y + b.height; y += raw.viewport.height)
      for (let x = b.x; x < b.x + b.width; x += raw.viewport.width) {
        const [active] = await chrome.tabs.query({
          active: true,
          windowId: request.windowId,
        });
        if (active?.id !== request.tabId)
          throw new Error(
            "Keep the captured tab active until capture finishes",
          );
        const [position] = await chrome.scripting.executeScript({
          target,
          func: (x: number, y: number) => {
            window.scrollTo({ left: x, top: y, behavior: "instant" });
            return {
              x: scrollX,
              y: scrollY,
              width: innerWidth,
              height: innerHeight,
            };
          },
          args: [keepViewport ? scroll.x : x, keepViewport ? scroll.y : y],
        });
        await new Promise((resolve) => setTimeout(resolve, 650));
        const [stillActive] = await chrome.tabs.query({
          active: true,
          windowId: request.windowId,
        });
        if (stillActive?.id !== request.tabId)
          throw new Error("Captured tab changed during screenshot");
        const data = await chrome.tabs.captureVisibleTab(request.windowId, {
          format: "png",
        });
        const image = await createImageBitmap(await (await fetch(data)).blob());
        const p = position.result!;
        const sx = image.width / p.width,
          sy = image.height / p.height;
        const tileWidth = Math.min(p.width - (x - p.x), b.x + b.width - x),
          tileHeight = Math.min(p.height - (y - p.y), b.y + b.height - y);
        if (tileWidth <= 0 || tileHeight <= 0)
          throw new Error("Page geometry changed during capture");
        ctx.drawImage(
          image,
          (x - p.x) * sx,
          (y - p.y) * sy,
          tileWidth * sx,
          tileHeight * sy,
          (x - b.x) * dpr,
          (y - b.y) * dpr,
          tileWidth * dpr,
          tileHeight * dpr,
        );
        image.close();
      }
  } finally {
    await chrome.scripting
      .executeScript({
        target,
        func: (x: number, y: number) =>
          window.scrollTo({ left: x, top: y, behavior: "instant" }),
        args: [scroll.x, scroll.y],
      })
      .catch(() => {});
  }
  const bytes = new Uint8Array(
    await (await canvas.convertToBlob({ type: "image/png" })).arrayBuffer(),
  );
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  await submitCapture(
    request.config,
    payload(raw, source, `data:image/png;base64,${btoa(binary)}`),
  );
}
chrome.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (sender.id !== chrome.runtime.id) return;
  const result = requestSchema.safeParse(message);
  if (!result.success) {
    respond({ error: "Invalid capture request" });
    return;
  }
  if (busy) {
    respond({ error: "A capture is already running" });
    return;
  }
  busy = true;
  respond({ started: true });
  void chrome.storage.local.set({
    lastError: "",
    captureStatus:
      result.data.mode === "selection"
        ? "Click an element or drag an area on the page, then press Capture."
        : "Capturing… Keep this tab active.",
  });
  void capture(result.data)
    .then(() =>
      chrome.storage.local.set({
        captureStatus: "Capture saved. Reference Studio opened.",
      }),
    )
    .catch((e: unknown) =>
      chrome.storage.local.set({
        lastError: e instanceof Error ? e.message : String(e),
        captureStatus: "Capture failed",
      }),
    )
    .finally(() => {
      busy = false;
    });
});

/*
 * The popup holds a port open while it is showing; each message is the mode it would capture, and
 * the page previews it. Closing the popup (or starting a capture) takes the preview away.
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "preview" || port.sender?.id !== chrome.runtime.id) return;
  let tabId: number | undefined;
  const run = (func: () => void, args: unknown[] = []) => {
    if (tabId === undefined) return;
    // Pages the extension cannot script (chrome://, the Web Store) simply show no preview.
    chrome.scripting
      .executeScript({ target: { tabId }, func, args } as chrome.scripting.ScriptInjection<unknown[], void>)
      .catch(() => {});
  };
  port.onMessage.addListener(
    (message: { tabId: number; mode: "page" | "selection" | null }) => {
      tabId = message.tabId;
      if (busy) return;
      if (message.mode) run(showPreview as () => void, [message.mode]);
      else run(hidePreview);
    },
  );
  port.onDisconnect.addListener(() => {
    if (!busy) run(hidePreview);
  });
});
