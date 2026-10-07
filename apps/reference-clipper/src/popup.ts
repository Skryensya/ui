import "./popup.css";
const form = document.querySelector<HTMLFormElement>("#capture")!,
  status = document.querySelector<HTMLParagraphElement>("#status")!;
const input = (name: string) =>
  form.elements.namedItem(name) as HTMLInputElement;
const stored = await chrome.storage.local.get([
  "server",
  "studio",
  "token",
  "lastError",
  "captureStatus",
]);
input("server").value = stored.server ?? "http://localhost:4318";
input("studio").value = stored.studio ?? "http://localhost:5174";
input("token").value = stored.token ?? "";
form.querySelector<HTMLDetailsElement>("details")!.open = !stored.token;
status.textContent = stored.lastError || stored.captureStatus || "";
chrome.storage.onChanged.addListener((changes) => {
  if (changes.lastError?.newValue)
    status.textContent = changes.lastError.newValue;
  else if (changes.captureStatus)
    status.textContent = changes.captureStatus.newValue;
});
form.onsubmit = (event) => {
  event.preventDefault();
  void (async () => {
    const config = {
      server: input("server").value.replace(/\/$/, ""),
      studio: input("studio").value,
      token: input("token").value,
    };
    for (const value of [config.server, config.studio])
      if (!/^https?:/.test(new URL(value).protocol))
        throw new Error("Connections must use HTTP(S)");
    const granted = await chrome.permissions.request({
      origins: [`${new URL(config.server).origin}/*`],
    });
    if (!granted) throw new Error("Server permission was not granted");
    await chrome.storage.local.set(config);
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) throw new Error("No active website tab");
    const result = await chrome.runtime.sendMessage({
      mode: input("mode").value,
      tabId: tab.id,
      windowId: tab.windowId,
      title: input("title").value,
      notes: input("notes").value,
      config,
    });
    if (result.error) throw new Error(result.error);
    status.textContent =
      "Select on the page if requested. Keep the tab active; Studio opens after capture.";
  })().catch((error: unknown) => {
    status.textContent = error instanceof Error ? error.message : String(error);
  });
};
