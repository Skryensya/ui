import { connectVideoPlayer, getVideoPlayerController, type VideoPlayerController } from "@skryensya/core/video-player-controller";
import { videoPlayerAttrs } from "@skryensya/core/video-player";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export type { VideoPlayerConfig, VideoPlayerController, VideoPlayerLabels } from "@skryensya/core/video-player-controller";

/*
 * VIDEO PLAYER, the DOM shell around `@skryensya/core/video-player-controller`.
 *
 * As thin as Lightbox's, for Lightbox's reason: every behaviour is `connectVideoPlayer`'s, which the React binding runs
 * too, so all this file does is hand it the authored root. The settings (`data-auto-hide`, `data-skip`, `data-speeds`) and
 * the words of every control are read off the markup by the controller itself.
 */
export function connectVideoPlayerRoot(root: HTMLElement): () => void {
  const controller = connectVideoPlayer(root);
  return () => controller.destroy();
}

/**
 * The controller of a mounted player, by its id or its element: `getVideoPlayer("trailer")?.pause()`. `null` until the
 * enhancer has run, or when the markup has no `<video>`.
 */
export function getVideoPlayer(target: string | HTMLElement, doc: Document = document): VideoPlayerController | null {
  const element = typeof target === "string" ? doc.getElementById(target) : target;
  return element ? getVideoPlayerController(element) : null;
}

export const mountVideoPlayer = createConnectMount({
  key: "video-player",
  rootSelector: `[${videoPlayerAttrs.root}]`,
  connect: connectVideoPlayerRoot,
});
