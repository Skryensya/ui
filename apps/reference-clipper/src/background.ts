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
  const { raw, source } = result.result;
  const dpr = raw.viewport.deviceScaleFactor ?? 1;
  const b = raw.bounds;
  if (
    b.width * dpr > 32767 ||
    b.height * dpr > 32767 ||
    b.width * dpr * b.height * dpr > 100_000_000
  )
    throw new Error(
      "Capture exceeds Chrome canvas limits. Select a smaller region.",
    );
  const [active] = await chrome.tabs.query({
    active: true,
    windowId: request.windowId,
  });
  if (active?.id !== request.tabId)
    throw new Error("Keep the captured tab active until capture finishes");
  /*
   * One render of the whole clip instead of scrolled tiles: sticky and fixed elements are drawn once,
   * where the page puts them, rather than repeating at the top of every tile.
   */
  const debuggee = { tabId: request.tabId };
  let data: string;
  await chrome.debugger.attach(debuggee, "1.3");
  try {
    ({ data } = (await chrome.debugger.sendCommand(
      debuggee,
      "Page.captureScreenshot",
      {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: b.x, y: b.y, width: b.width, height: b.height, scale: 1 },
      },
    )) as { data: string });
  } finally {
    await chrome.debugger.detach(debuggee).catch(() => {});
  }
  await submitCapture(
    request.config,
    payload(raw, source, `data:image/png;base64,${data}`),
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
