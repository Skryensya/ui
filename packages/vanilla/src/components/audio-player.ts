import { connectAudioPlayer, getAudioPlayerController, type AudioPlayerController } from "@skryensya/core/audio-player-controller";
import { audioPlayerAttrs } from "@skryensya/core/audio-player";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export type { AudioPlayerConfig, AudioPlayerController, AudioPlayerLabels } from "@skryensya/core/audio-player-controller";

/*
 * AUDIO PLAYER, the DOM shell around `@skryensya/core/audio-player-controller`.
 *
 * As thin as the video player's, for the same reason: every behaviour is `connectAudioPlayer`'s, which the React binding runs
 * too, so all this file does is hand it the authored root. The settings (`data-auto-advance`, `data-skip`, `data-speeds`),
 * the words of every control and the playlist are read off the markup by the controller itself.
 */
export function connectAudioPlayerRoot(root: HTMLElement): () => void {
  const controller = connectAudioPlayer(root);
  return () => controller.destroy();
}

/**
 * The controller of a mounted player, by its id or its element: `getAudioPlayer("episode")?.pause()`. `null` until the
 * enhancer has run, or when the markup has no `<audio>`.
 */
export function getAudioPlayer(target: string | HTMLElement, doc: Document = document): AudioPlayerController | null {
  const element = typeof target === "string" ? doc.getElementById(target) : target;
  return element ? getAudioPlayerController(element) : null;
}

export const mountAudioPlayer = createConnectMount({
  key: "audio-player",
  rootSelector: `[${audioPlayerAttrs.root}]`,
  connect: connectAudioPlayerRoot,
});
