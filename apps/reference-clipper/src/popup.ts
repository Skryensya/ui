import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss";
import "@skryensya/core/components/button.css";
import "@skryensya/core/components/callout.css";
import "@skryensya/core/components/form-field.css";
import "@skryensya/core/components/input.css";
import "@skryensya/core/components/password-input.css";
import "@skryensya/core/components/segmented.css";
import "@skryensya/core/components/typography.css";
import "@skryensya/core/patterns/layout.css";
/* PasswordInput's show/hide toggle; validate_ui's sheet list leaves it out. */
import "@skryensya/core/patterns/icon-toggle.css";
import "./popup.css";
import { lucideIcons } from "@skryensya/icons-lucide";
import { mountButton } from "@skryensya/vanilla/button";
import { mountIcons } from "@skryensya/vanilla/icon";
import { mountPasswordInput } from "@skryensya/vanilla/password-input";
import { mountSegmented } from "@skryensya/vanilla/segmented";
import {
  type Connection,
  describeConnection,
  parseConnection,
  serverPermission,
  storedConnection,
} from "./connection";

type Tone = "neutral" | "info" | "success" | "danger";

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const captureForm = $<HTMLFormElement>("#capture"),
  settingsForm = $<HTMLFormElement>("#settings"),
  status = $<HTMLDivElement>("#status"),
  statusText = $<HTMLDivElement>("#status-text");
const field = (form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) as HTMLInputElement;

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

function showStatus(message: string, tone: Tone = "neutral") {
  statusText.textContent = message;
  status.dataset.tone = tone;
  status.hidden = !message;
}

let connection: Connection | null = null;

function showView(view: "capture" | "settings") {
  captureForm.hidden = view !== "capture";
  settingsForm.hidden = view !== "settings";
  /* Back has nowhere to go until a connection exists. */
  $("#close-settings").hidden = !connection;
  if (view === "settings") {
    field(settingsForm, "server").value = connection?.server ?? "http://localhost:4318";
    field(settingsForm, "studio").value = connection?.studio ?? "http://localhost:5174";
    field(settingsForm, "token").value = connection?.token ?? "";
    field(settingsForm, "server").focus();
  } else if (connection) {
    $("#connection-summary").textContent = describeConnection(connection);
  }
}

const stored = await chrome.storage.local.get(["server", "studio", "token", "lastError", "captureStatus"]);
connection = storedConnection(stored);
/* Only the three enhancers this popup uses, not the auto-loader's whole table. The second icon pass
 * catches the controls an enhancer injects a frame later (see `mountComponentsWithIcons`). */
mountIcons(document, lucideIcons);
for (const mount of [mountButton, mountSegmented, mountPasswordInput]) mount(document);
await new Promise(requestAnimationFrame);
mountIcons(document, lucideIcons);
showView(connection ? "capture" : "settings");
if (stored.lastError) showStatus(stored.lastError, "danger");
else if (stored.captureStatus) showStatus(stored.captureStatus, "info");

chrome.storage.onChanged.addListener((changes) => {
  if (changes.lastError?.newValue) showStatus(changes.lastError.newValue, "danger");
  else if (changes.captureStatus) showStatus(changes.captureStatus.newValue ?? "", "info");
});

/* The page previews the current choice for as long as the popup is open. */
const labels = { page: "Capture full page", selection: "Select on page" } as const;
type Mode = keyof typeof labels;
const mode = () => ($("#mode").dataset.value ?? "page") as Mode;
const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
const preview = chrome.runtime.connect({ name: "preview" });
function previewMode() {
  $("#capture-button").textContent = labels[mode()];
  if (activeTab?.id !== undefined)
    preview.postMessage({
      tabId: activeTab.id,
      mode: connection && !captureForm.hidden ? mode() : null,
    });
}
$("#mode").addEventListener("sk:segmentedvaluechange", previewMode);
previewMode();

$("#open-settings").onclick = () => {
  showStatus("");
  showView("settings");
  previewMode();
};
$("#close-settings").onclick = () => {
  showStatus("");
  showView("capture");
  previewMode();
};

/* chrome.permissions.request needs the click's user gesture, so it is the first await in both handlers. */
settingsForm.onsubmit = (event) => {
  event.preventDefault();
  void (async () => {
    const next = parseConnection({
      server: field(settingsForm, "server").value,
      studio: field(settingsForm, "studio").value,
      token: field(settingsForm, "token").value,
    });
    if (!(await chrome.permissions.request(serverPermission(next))))
      throw new Error("Server permission was not granted");
    await chrome.storage.local.set(next);
    connection = next;
    showView("capture");
    showStatus("Connection saved.", "success");
    previewMode();
  })().catch((error: unknown) => showStatus(message(error), "danger"));
};

captureForm.onsubmit = (event) => {
  event.preventDefault();
  if (!connection) return showView("settings");
  const config = connection;
  void (async () => {
    if (!(await chrome.permissions.request(serverPermission(config))))
      throw new Error("Server permission was not granted");
    if (!activeTab?.id) throw new Error("No active website tab");
    const result = await chrome.runtime.sendMessage({
      mode: mode(),
      tabId: activeTab.id,
      windowId: activeTab.windowId,
      config,
    });
    if (result.error) throw new Error(result.error);
    // Selecting happens on the page, so the popup gets out of the way.
    if (mode() === "selection") return window.close();
    showStatus("Capturing… Keep this tab active. Studio opens when it is done.", "info");
  })().catch((error: unknown) => showStatus(message(error), "danger"));
};
