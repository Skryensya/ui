import { useState } from "react";
import { useHotkey } from "@skryensya/react/hotkey";
import { Toast } from "@skryensya/react/content";
import { Button } from "@skryensya/react/button";
import { FixtureCases, type Fixture } from "./break-catalog-common";
import "@skryensya/core/components/toast.css";
import "@skryensya/core/patterns/scrollbar.css";

function HotkeyCase({ data }: { data: Fixture }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  useHotkey("mod+shift+u", () => setCount((n) => n + 1), { target, enabled: Boolean(target) && data.items.length > 0, mac: false });
  return <div ref={setTarget} tabIndex={0} role="group" aria-label={data.title}><p>Focus this group and press Ctrl+Shift+U. Empty case disables the binding. The shortcut is scoped here, not to the documentation window.</p><input aria-label="Shortcut typing target" placeholder="Try the chord while typing" /><output>{count} shortcut activations</output><p>{data.body}</p></div>;
}
function ToastCase({ data }: { data: Fixture }) {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [action, setAction] = useState("No action yet");
  return <>{data.items.map((text, i) => dismissed.includes(i) ? null : <Toast key={i} title={text} tone={i % 2 ? "danger" : "success"} timeout={0} dismissLabel="Dismiss notification" onDismiss={() => setDismissed((values) => [...values, i])} actions={<Button variant="ghost" onClick={() => setAction(`Undo ${i + 1}`)}>{data.worst ? "Restore the complete workspace configuration" : "Undo"}</Button>}><p>{data.body}</p></Toast>)}<Button variant="ghost" onClick={() => setDismissed([])}>Restore fixtures</Button><output>{action}</output><p className="break-case__note">Real Toast rendered inline without a timeout so the failures stay visible. No simulated toast markup or global queue overlay.</p></>;
}
export default function UtilitiesBreak({ id }: { id: string }) {
  return <FixtureCases id={id} large={id === "scrollbar"} render={(data) => id === "hotkey" ? <HotkeyCase data={data} /> : id === "toast" ? <ToastCase data={data} /> : <div className="sk-scrollbar" role="region" tabIndex={0} aria-label={data.title} style={{ maxBlockSize: "18rem", overflow: "auto" }}>{data.items.map((text, i) => <p key={i}>{text}{i === 0 ? ` - ${data.body}` : ""}</p>)}</div>} />;
}
