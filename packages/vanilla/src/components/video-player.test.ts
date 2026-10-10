import { afterEach, describe, expect, it, vi } from "vitest";
import { connectVideoPlayerRoot, getVideoPlayer, mountVideoPlayer } from "./video-player.js";

/* jsdom plays nothing: the element is told what it is doing the way a browser would, and the controller paints from that. */
function build(attrs = "") {
  document.body.innerHTML = "";
  const root = document.createElement("div");
  root.className = "sk-video-player";
  root.id = "trailer";
  root.setAttribute("data-sk-video-player", "");
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", "Trailer");
  if (attrs) for (const pair of attrs.split(" ")) root.setAttribute(...(pair.split("=") as [string, string]));
  root.innerHTML = `
    <div class="sk-video-player__stage"><video src="/trailer.mp4"></video></div>
    <div class="sk-video-player__controls">
      <div class="sk-video-player__seek" role="slider" tabindex="0" aria-label="Seek" data-time-label="{current} de {duration}"></div>
      <div class="sk-video-player__bar">
        <button class="sk-video-player__control" data-video-action="play" aria-label="Reproducir" data-label-pause="Pausar" data-label-replay="Repetir"></button>
        <button class="sk-video-player__control" data-video-action="mute" aria-label="Silenciar" data-label-unmute="Activar sonido"></button>
        <span class="sk-video-player__current"></span><span class="sk-video-player__duration"></span>
        <button class="sk-video-player__control" data-video-action="speed" aria-label="Velocidad"><span class="sk-video-player__speed"></span></button>
        <button class="sk-video-player__control" data-video-action="captions" aria-label="Subtítulos" hidden></button>
      </div>
    </div>`;
  document.body.append(root);
  const video = root.querySelector("video")!;
  let paused = true;
  Object.defineProperty(video, "paused", { configurable: true, get: () => paused });
  Object.defineProperty(video, "duration", { configurable: true, value: 90 });
  video.play = vi.fn(async () => {
    paused = false;
    video.dispatchEvent(new Event("play"));
  });
  video.pause = vi.fn(() => {
    paused = true;
    video.dispatchEvent(new Event("pause"));
  });
  const button = (action: string) => root.querySelector<HTMLButtonElement>(`[data-video-action="${action}"]`)!;
  return { root, video, button };
}

describe("connectVideoPlayerRoot", () => {
  let cleanup = () => {};
  afterEach(() => {
    cleanup();
    cleanup = () => {};
    document.body.innerHTML = "";
  });

  it("turns the native controls off on the authored video", () => {
    const { root, video } = build();
    video.setAttribute("controls", "");
    cleanup = connectVideoPlayerRoot(root);
    expect(video.controls).toBe(false);
    expect(video.hasAttribute("controls")).toBe(false);
  });

  it("plays from the button and swaps the name to the authored Pause", () => {
    const { root, button } = build();
    cleanup = connectVideoPlayerRoot(root);
    button("play").click();
    expect(root.hasAttribute("data-playing")).toBe(true);
    expect(button("play").getAttribute("aria-label")).toBe("Pausar");
  });

  it("reads the words of the other states from the markup", () => {
    const { root, button } = build();
    cleanup = connectVideoPlayerRoot(root);
    button("mute").click();
    expect(button("mute").getAttribute("aria-label")).toBe("Activar sonido");
  });

  it("speaks the seek bar through the authored sentence", () => {
    const { root, video } = build();
    video.currentTime = 30;
    cleanup = connectVideoPlayerRoot(root);
    const seek = root.querySelector(".sk-video-player__seek")!;
    expect(seek.getAttribute("aria-valuetext")).toBe("30 seconds de 1 minute 30 seconds");
    expect(seek.getAttribute("aria-valuemax")).toBe("90");
  });

  it("steps through the speeds the root names", () => {
    const { root, video, button } = build("data-speeds=1,3");
    cleanup = connectVideoPlayerRoot(root);
    button("speed").click();
    expect(video.playbackRate).toBe(3);
    expect(root.querySelector(".sk-video-player__speed")!.textContent).toBe("3×");
  });

  it("keeps the captions button away while the video has no tracks", () => {
    const { root, button } = build();
    cleanup = connectVideoPlayerRoot(root);
    expect(button("captions").hidden).toBe(true);
  });

  it("answers the keyboard only from inside the player", () => {
    const { root, video } = build();
    cleanup = connectVideoPlayerRoot(root);
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "k", bubbles: true }));
    expect(video.play).not.toHaveBeenCalled();
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "k", bubbles: true }));
    expect(video.play).toHaveBeenCalledOnce();
  });

  it("is reachable from script by id, and gone after cleanup", () => {
    const { root } = build();
    cleanup = connectVideoPlayerRoot(root);
    expect(getVideoPlayer("trailer")?.video).toBe(root.querySelector("video"));
    cleanup();
    expect(getVideoPlayer("trailer")).toBeNull();
  });

  it("has nothing to do when the markup has no video", () => {
    const { root } = build();
    root.querySelector("video")!.remove();
    cleanup = connectVideoPlayerRoot(root);
    expect(getVideoPlayer(root)?.video ?? null).toBeNull();
  });
});

describe("mountVideoPlayer", () => {
  it("is the enhancer the runtime registers", () => {
    expect(typeof mountVideoPlayer).toBe("function");
  });
});
