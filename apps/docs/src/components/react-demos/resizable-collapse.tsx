/*
 * A PANEL THAT CLOSES, AND THE WAYS BACK. The group below has one collapsible panel. Drag its bar far enough and the
 * panel snaps shut; the bar stays, so the same drag, a double click, Enter (which resets), Ctrl or Cmd + Enter (which
 * toggles) and these three buttons, which call the group's handle, all open it again. Nothing here is special to the
 * docs: it is what a page does with a toolbar button or a keyboard shortcut of its own.
 */
import { useEffect, useRef, useState } from "react";
import { Resizable, type ResizableApi } from "@skryensya/react/resizable";
import { Button } from "@skryensya/react/button";

type Copy = {
  collapse: string;
  expand: string;
  reset: string;
  nav: string;
  main: string;
  handle: string;
  file1: string;
  file2: string;
  file3: string;
  state: { open: string; closed: string };
};

export function ResizableCollapse({ copy }: { copy: Copy }) {
  const api = useRef<ResizableApi>(null);
  const [sizes, setSizes] = useState<readonly number[]>([30, 70]);
  const closed = (sizes[0] ?? 1) < 1;
  /*
   * The buttons are drawn only once React owns this island, never in the server's HTML. The docs page runs the Vanilla
   * enhancers over the whole document (`initComponents(document)`), and a `[data-sk-button]` in an island's server markup was
   * enhanced by them BEFORE `client:visible` hydrated it: the enhancer stamps `data-sk-ready`, and React then found HTML it
   * had not rendered and threw the island away with a hydration error. The bar keeps its height meanwhile, so nothing moves.
   */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div className="rz-collapse">
      <div className="rz-collapse__bar">
        {hydrated ? (
          <>
          <Button size="sm" variant="soft" disabled={closed} onClick={() => api.current?.collapse(0)}>
            {copy.collapse}
          </Button>
          <Button size="sm" variant="soft" disabled={!closed} onClick={() => api.current?.expand(0)}>
            {copy.expand}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => api.current?.reset()}>
            {copy.reset}
          </Button>
          </>
        ) : null}
        <output className="rz-collapse__state" aria-live="polite">
          {closed ? copy.state.closed : copy.state.open} · {Math.round(sizes[0] ?? 0)}%
        </output>
      </div>
      <Resizable apiRef={api} onSizesChange={setSizes} style={{ blockSize: "11rem", border: "1px solid var(--color-border-default)", borderRadius: "var(--radius-control)" }}>
        <Resizable.Panel size={30} minSize={20} collapsible style={{ padding: "var(--space-inset-md)" }}>
          <strong>{copy.nav}</strong>
          <ul className="rz-collapse__files">
            <li>{copy.file1}</li>
            <li>{copy.file2}</li>
            <li>{copy.file3}</li>
          </ul>
        </Resizable.Panel>
        <Resizable.Handle label={copy.handle} />
        <Resizable.Panel minSize={30} style={{ padding: "var(--space-inset-md)" }}>
          <strong>{copy.main}</strong>
        </Resizable.Panel>
      </Resizable>
    </div>
  );
}
