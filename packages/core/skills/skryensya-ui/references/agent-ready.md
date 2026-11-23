# Make it agent-ready

`@skryensya/core/agent` lets an agent read the page's kit components and call their actions by name, instead of reading the accessibility tree and clicking through it. It reads the DOM both bindings render, so it works the same in React and Vanilla. A page is agent-ready when an agent finds every control by name, can do the task with `act`, and the app sees each change as the agent's and can refuse it.

## The checklist

1. **Every control has a name, unique where it sits.** A step finds its control by label (`{ ref: "Project name", … }`). A label matches every label that holds its words, so "Tip" and "Custom tip" collide: give each control in a row its own words ("Edit Atlas", "Delete Atlas").
2. **Every control an agent should use is a kit component.** The snapshot lists only controls inside a kit family; a bare `<button>` or `<input>` is invisible to it. Submit buttons and a wizard's Back and Continue are `Button.action`; a text field is an `Input` in a `FormField`.
3. **State flows through change events.** An agent's change is a real `input`/`change`/`click`, so React's `onChange`, the kit's `sk:*` events and the enhancers all hear it. Keep app state in those callbacks, not in `keydown` or `pointerdown` handlers, which an agent never fires. Inside a callback, `actingAgent()` is true while an agent's step runs: refuse there what an agent must not change.
4. **Mark what needs a person.** Three attributes, and only these:
   - `data-agent-confirm="<what it does>"` on anything an agent must not do alone: delete, pay, send. Write the sentence for the person who will be asked, from app state: "Deletes the project and all its files". On a confirm dialog, put it on the button that confirms, not the one that opens it. In a tree: `attrs: { "data-agent-confirm": "…" }`; `review_ui` warns about a `danger` action without it.
   - `data-agent-secret` on a field whose value an agent may fill but never read. Password, one-time-code and card fields already are.
   - `data-agent-hidden` on a region an agent should not see at all, like recovery codes.

## Connect the bridge

Once, in browser code (a client component in Next.js):

```ts
import { createAgent, agentTools, registerTools } from "@skryensya/core/agent";

const agent = createAgent({
  allow: (step) => (step.confirm ? askThePerson(step.confirm) : true),
});
```

- `agent.snapshot()` lists each control: `ref`, `component`, `kind`, `label`, state, `actions`, and `items` for choices. `agent.act({ steps })` runs steps in order and stops at the first that fails, saying why. `agent.query({ text, within, kind })` finds controls past the snapshot's first 100.
- Actions: `press`, `open`, `close`, `choose` (a menu item's text), `select` (a tab), `setValue` (text, a number, or an option's label or value), `clear`, `setChecked`, `toggle`.
- **Your own model**: `agentTools` has the three tools' names, descriptions and JSON Schemas. Route each call to the method of the same name and return its result.
- **The browser's agent (WebMCP)**: `const unregister = registerTools(agent, { allow })`. It does nothing where the browser has no `modelContext`. `allow` is required here: you did not write that agent.
- Without `allow`, a step on a `data-agent-confirm` control fails with "Needs a person".

## Prove it with a test

Every interface gets this test, in jsdom after the page renders (in Vanilla, after `initComponents()`; the enhanced Select and Tabs mount on a later task, so wait for them):

```ts
import { createAgent } from "@skryensya/core/agent";

test("an agent can find and change every setting", async () => {
  const agent = createAgent();
  const entries = agent.snapshot();
  for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  expect(entries.map((entry) => entry.label)).toEqual(expect.arrayContaining(["Project name", "Visibility"]));

  const result = await agent.act({
    steps: [
      { ref: "Project name", action: "setValue", args: ["Atlas"] },
      { ref: "Visibility", action: "setValue", args: ["Internal"] },
    ],
  });
  expect(result.ok, result.ok ? "" : result.error.message).toBe(true);
  expect(screen.getByLabelText<HTMLInputElement>("Project name").value).toBe("Atlas");
});
```

- List every control the task names in the labels check, and give each an `act` step in the words a person would use.
- For a `data-agent-confirm` control, give the bridge an `allow` you can flip and assert the step is refused, then runs.
- Assert on the DOM or app state, not only on `result.ok`: a change callback may have refused the value.
