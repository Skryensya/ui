import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * EXPRESSIVE AVATAR, DO AND DON'T. Three pairs, each a still picture of the face: the images are the ones the page's own
 * demos use. A static tree can hold one expression at a time (`src`), which is enough here because every pair is about
 * what a reader sees in a single frame: whether the faces share a frame, whether the face agrees with the message, and
 * whether a character is one face or a column of them.
 */
const FACES = "/expressive-avatar/states";

const face = (look: string, size: "sm" | "md" | "lg" | "xl" = "md", style?: string): UsageTree => ({
  contract: "expressive-avatar",
  signature: "ExpressiveAvatar",
  options: { name: "Allison", size, src: `${FACES}/${look}.webp`, loading: "eager" },
  ...(style ? { attrs: { style } } : {}),
});

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({ contract: "typography", signature: "Text", options, children });

const row = (gap: string, ...children: UsageTree[]): UsageTree => ({ contract: "layout", signature: "Inline", options: { gap, inlineAlign: "center", wrap: false }, children });

const column = (gap: string, ...children: UsageTree[]): UsageTree => ({ contract: "layout", signature: "Stack", options: { gap }, children });

/** Three expressions of one face, every image in the same frame: the face changes and does not move. */
export const expressiveAvatarDoFrameTree = (_t: Translate): UsageTree => row("md", face("base"), face("left"), face("smile"));

/** The same three, drawn at different framings: the face grows, slides and shrinks as its expression changes. */
export const expressiveAvatarDontFrameTree = (_t: Translate): UsageTree =>
  row("md", face("base"), face("left", "md", "scale: 1.3; translate: 0.35rem 0.4rem;"), face("smile", "md", "scale: 0.78; translate: -0.2rem 0.3rem;"));

/** What it says and how it looks agree. */
export const expressiveAvatarDoStateTree = (t: Translate): UsageTree => row("md", face("smile"), text(t("demo.expressiveAvatar.saved")));

/** A smile over bad news: the face contradicts the sentence. */
export const expressiveAvatarDontStateTree = (t: Translate): UsageTree => row("md", face("smile"), text(t("demo.expressiveAvatar.failed")));

/** One character, large, speaking to the reader. */
export const expressiveAvatarDoCharacterTree = (t: Translate): UsageTree =>
  column("sm", face("base", "xl"), text(t("demo.expressiveAvatar.greeting"), { weight: "emphasis" }));

/** A column of the same face, one per row: an identity list, which is what Avatar is for. */
export const expressiveAvatarDontCharacterTree = (t: Translate): UsageTree =>
  column("sm", ...(["ada", "grace", "linus", "margaret"] as const).map((key) => row("sm", face("base", "sm"), text(t(`demo.expressiveAvatar.person.${key}` as Parameters<Translate>[0])))));
