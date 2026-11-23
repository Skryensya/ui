/*
 * THE AGENT BRIDGE: an agent reads the kit's components on a page and calls their actions by name,
 * instead of reading the whole accessibility tree and clicking through it.
 *
 * It reads the DOM, not a binding: React and Vanilla render the same markup from one contract (the G2
 * gate proves it), so one bridge serves both. Only controls inside a kit component (an ancestor or
 * self with a family root class, `sk-<family>`) are listed; a bare `<button>` beside them is not.
 *
 * Every change goes through the platform: a value is written with the native setter and announced
 * with `input` and `change`, a press is a `click`. React and the Vanilla enhancers both hear those, so
 * app state stays in sync through the same callbacks a person's change runs. While a step runs,
 * `actingAgent()` is true, so a callback can tell an agent's change apart and refuse it.
 *
 * Three attributes put a person in the loop, and only these three:
 *   data-agent-confirm="<what it does>"  the step waits for `allow`; without it, it fails
 *   data-agent-secret                    the value may be written, never read
 *   data-agent-hidden                    the region is not there for the agent at all
 */

export type AgentKind = "button" | "link" | "textbox" | "number" | "checkbox" | "switch" | "radiogroup" | "select" | "combobox" | "tab" | "slider" | "dialog";

export type AgentItem = { readonly value: string; readonly label: string; readonly selected?: boolean };

export type AgentEntry = {
  /** Stable for the element's life: `e1`, `e2`… Use it, or the label, in a step. */
  readonly ref: string;
  /** The kit family the control belongs to: `select`, `switch`, `tabs`. */
  readonly component: string;
  readonly kind: AgentKind;
  /** The accessible name: what a step finds it by. */
  readonly label: string;
  readonly actions: readonly string[];
  readonly value?: string | number;
  readonly checked?: boolean;
  readonly expanded?: boolean;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly items?: readonly AgentItem[];
  /** Set when the control needs a person: the sentence they will be asked. */
  readonly confirm?: string;
  /** Its value is never read. */
  readonly secret?: boolean;
};

export type AgentStep = { readonly ref: string; readonly action: string; readonly args?: readonly unknown[] };

export type AllowRequest = AgentStep & { readonly label: string; readonly confirm?: string };

export type Allow = (step: AllowRequest, context: { readonly signal: AbortSignal }) => boolean | Promise<boolean>;

export type ActResult =
  | { readonly ok: true; readonly done: number; readonly snapshot: readonly AgentEntry[] }
  | { readonly ok: false; readonly done: number; readonly error: { readonly step: number; readonly message: string }; readonly snapshot: readonly AgentEntry[] };

export type AgentOptions = {
  /** Where to look. The whole document by default. */
  readonly root?: ParentNode;
  /** Asked before every step on a `data-agent-confirm` control. Without it, those steps fail. */
  readonly allow?: Allow;
};

export type Agent = {
  snapshot(): readonly AgentEntry[];
  query(input: { readonly text?: string; readonly within?: string; readonly kind?: AgentKind }): readonly AgentEntry[] | { readonly error: string };
  /** `allow` here replaces the agent's own for this call (WebMCP passes the one it was registered with). */
  act(input: { readonly steps: readonly AgentStep[] }, override?: { readonly allow?: Allow }): Promise<ActResult>;
};

/** Past this many entries the snapshot stops, and its last entry says how many `query` can reach. */
export const SNAPSHOT_LIMIT = 100;

let acting = 0;

/** True while an agent step runs: read it in a change callback to tell an agent's change apart. */
export const actingAgent = (): boolean => acting > 0;

const FAMILY_ROOT = /^sk-[a-z0-9]+(?:-[a-z0-9]+)*$/;
/* Kit classes that are shared helpers, not families: they never name the component. */
const NOT_FAMILIES = new Set(["sk-interactive", "sk-anchor", "sk-anchored", "sk-visually-hidden", "sk-loader", "sk-icon"]);

const familyOf = (element: Element): string | undefined => {
  for (let node: Element | null = element; node; node = node.parentElement) {
    for (const name of Array.from(node.classList)) if (FAMILY_ROOT.test(name) && !NOT_FAMILIES.has(name)) return name.slice(3);
  }
  return undefined;
};

const textOf = (element: Element | null | undefined): string => (element?.textContent ?? "").replace(/\s+/g, " ").trim();

const byIds = (element: Element, attribute: string): string =>
  (element.getAttribute(attribute) ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => textOf(element.ownerDocument.getElementById(id)))
    .join(" ")
    .trim();

/** The accessible name, the parts of accname a kit control uses: labelledby, label, aria-label, `<label>`, own text, title. */
function nameOf(element: Element): string {
  const labelledby = byIds(element, "aria-labelledby");
  if (labelledby) return labelledby;
  const aria = element.getAttribute("aria-label")?.trim();
  if (aria) return aria;
  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
    const labels = element.labels ? Array.from(element.labels).map(textOf).join(" ").trim() : "";
    if (labels) return labels;
  }
  if (element.matches("button, a, [role=button], [role=tab], [role=link], [role=switch], [role=checkbox], [role=option], [role=menuitem], [role=radio]")) {
    const own = textOf(element);
    if (own) return own;
  }
  if (element.matches("dialog, [role=dialog], [role=alertdialog]")) {
    const heading = element.querySelector("h1, h2, h3, h4, h5, h6");
    if (heading) return textOf(heading);
  }
  const fieldLabel = element.closest(".sk-form-field")?.querySelector("label");
  if (fieldLabel) return textOf(fieldLabel);
  return element.getAttribute("title")?.trim() ?? element.getAttribute("placeholder")?.trim() ?? "";
}

const hiddenFromAgent = (element: Element): boolean =>
  Boolean(element.closest("[data-agent-hidden], [aria-hidden='true'], [hidden], [inert]")) ||
  (element instanceof HTMLInputElement && element.type === "hidden");

const SECRET_AUTOCOMPLETE = /\b(?:one-time-code|cc-number|cc-csc|current-password|new-password)\b/;

const isSecret = (element: Element): boolean =>
  Boolean(element.closest("[data-agent-secret]")) ||
  (element instanceof HTMLInputElement && (element.type === "password" || SECRET_AUTOCOMPLETE.test(element.autocomplete)));

const isDisabled = (element: Element): boolean =>
  (element as HTMLButtonElement).disabled === true || element.getAttribute("aria-disabled") === "true" || Boolean(element.closest("fieldset:disabled"));

const TEXT_TYPES = new Set(["text", "email", "search", "tel", "url", "password", "date", "time", "datetime-local", "month", "week", ""]);

/** What kind of control an element is, or nothing when the agent should not list it on its own. */
function kindOf(element: Element): AgentKind | undefined {
  const role = element.getAttribute("role");
  if (role === "switch") return "switch";
  if (role === "tab") return "tab";
  if (role === "radiogroup") return "radiogroup";
  if (role === "slider" && !(element instanceof HTMLInputElement)) return undefined;
  if (role === "combobox" || (element.matches("button") && element.getAttribute("aria-haspopup") === "listbox")) return "combobox";
  if (element.matches("dialog[open], [role=dialog], [role=alertdialog]")) return "dialog";
  if (element instanceof HTMLInputElement) {
    if (element.type === "checkbox") return "checkbox";
    if (element.type === "radio") return element.closest("[role=radiogroup]") ? undefined : "radiogroup";
    if (element.type === "number") return "number";
    if (element.type === "range") return "slider";
    if (TEXT_TYPES.has(element.type)) return "textbox";
    return undefined;
  }
  if (element instanceof HTMLTextAreaElement) return "textbox";
  if (element instanceof HTMLSelectElement) return "select";
  if (role === "checkbox") return "checkbox";
  if (element.matches("a[href]")) return "link";
  if (element.matches("button, [role=button]")) return "button";
  return undefined;
}

const CANDIDATES = "input, textarea, select, button, a[href], [role=button], [role=switch], [role=checkbox], [role=tab], [role=radiogroup], [role=combobox], [role=slider], dialog[open], [role=dialog], [role=alertdialog]";

const nativeSetter = (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) =>
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value")?.set;

/** Writes a value the way typing does, so React's onChange and the enhancers both hear it. */
function writeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  const setter = nativeSetter(element);
  if (setter) setter.call(element, value);
  else element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Waits for what a press opened (an enhancer may render it on the next frame). */
async function waitFor<T>(find: () => T | undefined, timeout = 600): Promise<T | undefined> {
  const end = Date.now() + timeout;
  for (;;) {
    const found = find();
    if (found !== undefined || Date.now() > end) return found;
    await wait(16);
  }
}

const words = (text: string) => text.toLowerCase().split(/\s+/).filter(Boolean);
const matches = (label: string, text: string) => {
  const haystack = label.toLowerCase();
  return words(text).every((word) => haystack.includes(word));
};

export function createAgent(options: AgentOptions = {}): Agent {
  const refs = new WeakMap<Element, string>();
  let next = 0;
  const refOf = (element: Element) => {
    let ref = refs.get(element);
    if (!ref) {
      ref = `e${++next}`;
      refs.set(element, ref);
    }
    return ref;
  };
  const scope = (): ParentNode => options.root ?? document;

  const radiosOf = (element: Element): HTMLInputElement[] => {
    if (element instanceof HTMLInputElement) {
      const form = element.form ?? element.ownerDocument;
      return Array.from(form.querySelectorAll<HTMLInputElement>(`input[type=radio][name="${CSS.escape(element.name)}"]`));
    }
    return Array.from(element.querySelectorAll<HTMLInputElement>("input[type=radio], [role=radio]") as NodeListOf<HTMLInputElement>);
  };

  const listboxOf = (trigger: Element): Element | undefined => {
    const owned = byIds(trigger, "aria-controls") ? trigger.ownerDocument.getElementById(trigger.getAttribute("aria-controls")!.split(/\s+/)[0]!) : null;
    return owned ?? trigger.closest("[class^='sk-']")?.querySelector("[role=listbox]") ?? undefined;
  };

  const optionsOf = (element: Element): AgentItem[] => {
    if (element instanceof HTMLSelectElement) return Array.from(element.options).map((option) => ({ value: option.value, label: textOf(option), selected: option.selected }));
    return Array.from(listboxOf(element)?.querySelectorAll("[role=option]") ?? []).map((option) => ({
      value: option.getAttribute("data-value") ?? textOf(option),
      label: textOf(option),
      selected: option.getAttribute("aria-selected") === "true",
    }));
  };

  const describe = (element: Element, kind: AgentKind, component: string): AgentEntry => {
    const secret = isSecret(element);
    const confirm = element.closest("[data-agent-confirm]")?.getAttribute("data-agent-confirm") ?? undefined;
    const disabled = isDisabled(element);
    const base = { ref: refOf(element), component, kind, label: nameOf(element), ...(disabled ? { disabled } : {}), ...(confirm ? { confirm } : {}), ...(secret ? { secret } : {}) };
    switch (kind) {
      case "textbox":
      case "number": {
        const value = (element as HTMLInputElement).value;
        return { ...base, actions: ["setValue", "clear"], ...(secret ? {} : { value: kind === "number" && value !== "" ? Number(value) : value }) };
      }
      case "slider":
        return { ...base, actions: ["setValue"], value: Number((element as HTMLInputElement).value) };
      case "checkbox":
      case "switch": {
        const checked = element instanceof HTMLInputElement ? element.checked : element.getAttribute("aria-checked") === "true";
        return { ...base, actions: ["setChecked", "toggle"], checked };
      }
      case "radiogroup": {
        const items = radiosOf(element).map((radio) => ({ value: radio.value || textOf(radio), label: nameOf(radio), selected: radio.checked || radio.getAttribute("aria-checked") === "true" }));
        const label = element instanceof HTMLInputElement ? (nameOf(element.closest("fieldset")?.querySelector("legend") ?? element) || element.name) : base.label;
        return { ...base, label, actions: ["setValue"], items, value: items.find((item) => item.selected)?.value ?? "" };
      }
      case "select":
      case "combobox": {
        const items = optionsOf(element);
        const value = element instanceof HTMLSelectElement ? element.value : (items.find((item) => item.selected)?.value ?? textOf(element.querySelector("[class*='__value']") ?? element));
        return { ...base, actions: ["setValue"], items, value, ...(kind === "combobox" ? { expanded: element.getAttribute("aria-expanded") === "true" } : {}) };
      }
      case "tab":
        return { ...base, actions: ["select"], selected: element.getAttribute("aria-selected") === "true" };
      case "dialog":
        return { ...base, actions: ["close"] };
      case "link":
        return { ...base, actions: ["press"] };
      case "button": {
        const expanded = element.getAttribute("aria-expanded");
        const popup = element.getAttribute("aria-haspopup");
        const actions = expanded !== null ? ["press", "open", "close"] : ["press"];
        if (popup === "menu" || popup === "true") actions.push("choose");
        return { ...base, actions, ...(expanded !== null ? { expanded: expanded === "true" } : {}) };
      }
    }
  };

  /** Every listed control, in document order, with its element. */
  const collect = (): { element: Element; entry: AgentEntry }[] => {
    const out: { element: Element; entry: AgentEntry }[] = [];
    const seenGroups = new Set<string>();
    for (const element of Array.from(scope().querySelectorAll(CANDIDATES))) {
      if (hiddenFromAgent(element)) continue;
      const kind = kindOf(element);
      if (!kind) continue;
      const component = familyOf(element);
      if (!component) continue;
      // A combobox's own trigger button is the combobox; the radios of one name are one group.
      if (kind === "button" && element.closest("[role=combobox]") && element.closest("[role=combobox]") !== element) continue;
      if (kind === "radiogroup" && element instanceof HTMLInputElement) {
        const key = `${element.form?.id ?? ""}:${element.name}`;
        if (seenGroups.has(key)) continue;
        seenGroups.add(key);
      }
      out.push({ element, entry: describe(element, kind, component) });
    }
    return out;
  };

  const snapshot = (): readonly AgentEntry[] => {
    const all = collect().map(({ entry }) => entry);
    if (all.length <= SNAPSHOT_LIMIT) return all;
    const more: AgentEntry = { ref: "more", component: "more", kind: "button", label: `${all.length - SNAPSHOT_LIMIT} more: find them with query`, actions: [] };
    return [...all.slice(0, SNAPSHOT_LIMIT), more];
  };

  const resolve = (ref: string): { element: Element; entry: AgentEntry } | { error: string } => {
    const all = collect();
    const byRef = all.find(({ entry }) => entry.ref === ref);
    if (byRef) return byRef;
    const exact = all.filter(({ entry }) => entry.label.toLowerCase() === ref.toLowerCase());
    if (exact.length === 1) return exact[0]!;
    const found = exact.length > 1 ? exact : all.filter(({ entry }) => matches(entry.label, ref));
    if (found.length === 1) return found[0]!;
    if (found.length === 0) return { error: `Nothing is named "${ref}". Read the snapshot for the labels on the page.` };
    return { error: `"${ref}" names ${found.length} controls: ${found.map(({ entry }) => `${entry.ref} (${entry.component} "${entry.label}")`).join(", ")}. Use a ref.` };
  };

  const query: Agent["query"] = ({ text, within, kind }) => {
    let all = collect();
    if (within) {
      const container = resolve(within);
      if ("error" in container) return container;
      const holder = container.element.closest("[class^='sk-'], [class*=' sk-']") ?? container.element;
      all = all.filter(({ element }) => holder.contains(element));
      if (container.entry.items) return [container.entry];
    }
    return all.filter(({ entry }) => (!kind || entry.kind === kind) && (!text || matches(entry.label, text))).map(({ entry }) => entry);
  };

  const pickItem = (items: readonly AgentItem[], wanted: string) =>
    items.find((item) => item.value === wanted) ?? items.find((item) => item.label.toLowerCase() === wanted.toLowerCase()) ?? items.find((item) => matches(item.label, wanted));

  /** Runs one step on its element. Throws a message an agent can act on. */
  async function run(element: Element, entry: AgentEntry, step: AgentStep): Promise<void> {
    if (!entry.actions.includes(step.action)) throw new Error(`${entry.ref} (${entry.component} "${entry.label}") has no action "${step.action}". It has: ${entry.actions.join(", ") || "none"}.`);
    if (entry.disabled) throw new Error(`${entry.ref} "${entry.label}" is disabled.`);
    const [arg] = step.args ?? [];
    const press = (target: Element) => (target as HTMLElement).click();
    switch (step.action) {
      case "press":
      case "select":
        press(element);
        return;
      case "open":
      case "close":
        if ((element.getAttribute("aria-expanded") === "true") !== (step.action === "open")) press(element);
        return;
      case "choose": {
        if (element.getAttribute("aria-expanded") !== "true") press(element);
        const menu = await waitFor(() => {
          const id = element.getAttribute("aria-controls");
          return (id ? element.ownerDocument.getElementById(id) : null) ?? element.ownerDocument.querySelector("[role=menu]:not([hidden])") ?? undefined;
        });
        const item = menu && Array.from(menu.querySelectorAll("[role^=menuitem]")).find((candidate) => matches(textOf(candidate), String(arg ?? "")));
        if (!item) throw new Error(`"${entry.label}" has no menu item "${String(arg)}".`);
        press(item);
        return;
      }
      case "clear":
        writeValue(element as HTMLInputElement, "");
        return;
      case "setValue": {
        if (entry.kind === "textbox" || entry.kind === "number" || entry.kind === "slider") {
          writeValue(element as HTMLInputElement, String(arg ?? ""));
          return;
        }
        const item = pickItem(entry.items ?? [], String(arg ?? ""));
        if (!item) throw new Error(`"${entry.label}" has no option "${String(arg)}". Its options: ${(entry.items ?? []).map((each) => each.label).join(", ")}.`);
        if (element instanceof HTMLSelectElement) {
          writeValue(element, item.value);
          return;
        }
        if (entry.kind === "radiogroup") {
          const radio = radiosOf(element).find((each) => (each.value || textOf(each)) === item.value);
          if (radio) press(radio);
          return;
        }
        if (element.getAttribute("aria-expanded") !== "true") press(element);
        const option = await waitFor(() => Array.from(listboxOf(element)?.querySelectorAll("[role=option]") ?? []).find((candidate) => textOf(candidate) === item.label));
        if (!option) throw new Error(`"${entry.label}" did not open its list of options.`);
        press(option);
        return;
      }
      case "setChecked":
      case "toggle": {
        const checked = element instanceof HTMLInputElement ? element.checked : element.getAttribute("aria-checked") === "true";
        const wanted = step.action === "toggle" ? !checked : Boolean(arg);
        if (checked !== wanted) press(element);
        return;
      }
    }
  }

  const act: Agent["act"] = async ({ steps }, override) => {
    const allow = override?.allow ?? options.allow;
    let done = 0;
    for (const [at, step] of steps.entries()) {
      const target = resolve(step.ref);
      if ("error" in target) return { ok: false, done, error: { step: at, message: target.error }, snapshot: snapshot() };
      const { element, entry } = target;
      if (entry.confirm !== undefined) {
        const controller = new AbortController();
        const allowed = allow ? await allow({ ...step, label: entry.label, confirm: entry.confirm }, { signal: controller.signal }) : false;
        if (!allowed) {
          controller.abort();
          return { ok: false, done, error: { step: at, message: allow ? `A person declined: ${entry.confirm}` : `Needs a person: ${entry.confirm}` }, snapshot: snapshot() };
        }
      }
      acting++;
      try {
        await run(element, entry, step);
      } catch (error) {
        return { ok: false, done, error: { step: at, message: (error as Error).message }, snapshot: snapshot() };
      } finally {
        acting--;
      }
      done++;
      await wait(0);
    }
    return { ok: true, done, snapshot: snapshot() };
  };

  return { snapshot, query, act };
}

/** The three tools, with descriptions written for a model. Route each call to the method of the same name. */
export const agentTools = [
  {
    name: "snapshot",
    description:
      "List the page's controls: each with a ref, its component, kind, label (its accessible name), state and the actions it takes. Call it first, and again after a step changed what is on the page.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "query",
    description: "Find controls by words in their label, by kind, or inside one component (`within`: a ref or label), for example the options of a long list.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Words that must all appear in the label." },
        within: { type: "string", description: "A ref or label: only controls inside that component." },
        kind: { type: "string", enum: ["button", "link", "textbox", "number", "checkbox", "switch", "radiogroup", "select", "combobox", "tab", "slider", "dialog"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "act",
    description:
      "Run steps in order. Each finds a control by ref or label and calls one of its actions: press, open, close, choose (a menu item's text), select (a tab), setValue (text, a number, or an option's label or value), clear, setChecked (true or false), toggle. Stops at the first failing step and says why; returns the new snapshot. A step on a control that needs a person waits for their answer.",
    inputSchema: {
      type: "object",
      properties: {
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: { ref: { type: "string" }, action: { type: "string" }, args: { type: "array" } },
            required: ["ref", "action"],
            additionalProperties: false,
          },
        },
      },
      required: ["steps"],
      additionalProperties: false,
    },
  },
] as const;

type ModelContext = {
  registerTool?: (tool: { name: string; description: string; inputSchema: object; execute: (input: never) => Promise<unknown> }) => { unregister?: () => void } | void;
  unregisterTool?: (name: string) => void;
};

/**
 * Offers the three tools to the browser's own agent through WebMCP (`navigator.modelContext`, or the
 * older `document.modelContext`). Does nothing where neither exists. `allow` is required: you did not
 * write that agent. Returns a function that takes the tools back.
 */
export function registerTools(agent: Agent, { allow }: { readonly allow: Allow }): () => void {
  const host = globalThis as { navigator?: { modelContext?: ModelContext }; document?: { modelContext?: ModelContext } };
  const context = host.navigator?.modelContext ?? host.document?.modelContext;
  if (!context?.registerTool) return () => {};
  const handles = agentTools.map((tool) =>
    context.registerTool!({
      name: `skryensya_${tool.name}`,
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: async (input: never) => (tool.name === "snapshot" ? agent.snapshot() : tool.name === "query" ? agent.query(input) : agent.act(input, { allow })),
    }),
  );
  return () => {
    handles.forEach((handle, at) => (handle && handle.unregister ? handle.unregister() : context.unregisterTool?.(`skryensya_${agentTools[at]!.name}`)));
  };
}
