import { catalogue, resolve } from "@skryensya/maker-model";
import type { AgentService } from "@skryensya/ai-compiler/agent";

/*
 * COMPONENTS THE PERSON NAMED. When a request names a component we have ("use a Wrapper", "add a Sidebar"), the agent must
 * not just obey or ignore it: it decides whether the page needs it. So each named component arrives with the design system's
 * own guidance (useWhen, avoidWhen, alternatives), and the agent is told to say in its answer whether it used it, and why.
 */
export type Mention = { signature: string; contract: string; useWhen?: unknown; avoidWhen?: unknown; alternatives?: unknown };

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function mentionedComponents(content: string, service: AgentService, limit = 6): Mention[] {
  const names = new Map<string, string>();
  for (const ref of catalogue()) {
    const name = ref.signature.split(".")[0]!;
    if (name.length >= 3 && !names.has(name)) names.set(name, ref.contract);
  }
  const found: Mention[] = [];
  for (const [name, contract] of names) {
    if (!new RegExp(`(?<![\\p{L}\\d])${escape(name)}(?![\\p{L}\\d])`, "iu").test(content)) continue;
    const ref = catalogue().find((entry) => entry.contract === contract && entry.signature.split(".")[0] === name);
    if (!ref || !resolve(ref)) continue;
    const hit = (service.discover({ query: name, limit: 3 }).value as { candidates?: { signature?: string; useWhen?: unknown; avoidWhen?: unknown; alternatives?: unknown }[] }).candidates?.find((c) => c.signature === ref.signature);
    found.push({ signature: ref.signature, contract, ...(hit?.useWhen ? { useWhen: hit.useWhen } : {}), ...(hit?.avoidWhen ? { avoidWhen: hit.avoidWhen } : {}), ...(hit?.alternatives ? { alternatives: hit.alternatives } : {}) });
    if (found.length >= limit) break;
  }
  return found;
}
