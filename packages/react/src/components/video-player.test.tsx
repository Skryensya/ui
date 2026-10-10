import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoPlayer } from "./video-player.js";

/*
 * jsdom has no media pipeline: `play()` is "not implemented" and nothing ever plays. So the element is told what it is
 * doing the way a browser would (a `paused` flag and the event that follows), which is exactly the contract the
 * controller reads: it paints from the element, never from its own guess.
 */
const setup = (props: Partial<React.ComponentProps<typeof VideoPlayer>> = {}) => {
  const view = render(
    <VideoPlayer label="Trailer" {...props}>
      <video src="/trailer.mp4" />
    </VideoPlayer>,
  );
  const root = view.container.firstElementChild as HTMLElement;
  const video = root.querySelector("video")!;
  let paused = true;
  Object.defineProperty(video, "paused", { configurable: true, get: () => paused });
  Object.defineProperty(video, "duration", { configurable: true, value: 120 });
  const play = vi.fn(async () => {
    paused = false;
    video.dispatchEvent(new Event("play"));
  });
  const pause = vi.fn(() => {
    paused = true;
    video.dispatchEvent(new Event("pause"));
  });
  video.play = play;
  video.pause = pause;
  const button = (action: string, scope: ParentNode = root) =>
    scope.querySelector<HTMLButtonElement>(`.sk-video-player__bar [data-video-action="${action}"]`)!;
  return { ...view, root, video, play, pause, button };
};

describe("VideoPlayer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is a named group around the author's video, and turns the native controls off", () => {
    const { root, video } = setup();
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe("Trailer");
    expect(root.querySelector(".sk-video-player__stage > video")).toBe(video);
    expect(video.controls).toBe(false);
  });

  it("never takes an appearance: its buttons are flat, because a picture is not a key", () => {
    const { root } = setup();
    expect(root.querySelectorAll("[data-appearance]")).toHaveLength(0);
    expect(root.querySelectorAll("button").length).toBeGreaterThan(4);
  });

  it("lays out the stage, the captions, the loader, the big button and the controls in that order", () => {
    const { root } = setup();
    expect(Array.from(root.children).map((part) => part.className.split(" ")[0])).toEqual([
      "sk-video-player__stage",
      "sk-video-player__captions",
      "sk-video-player__loader",
      "sk-video-player__big",
      "sk-video-player__controls",
    ]);
  });

  it("names every control, and gives the play button its shortcut", () => {
    const { button } = setup();
    expect(button("play").getAttribute("aria-label")).toBe("Play");
    expect(button("play").getAttribute("aria-keyshortcuts")).toBe("k");
    expect(button("mute").getAttribute("aria-label")).toBe("Mute");
    expect(button("fullscreen").getAttribute("aria-label")).toBe("Full screen");
  });

  it("makes the seek bar and the volume a named slider each", () => {
    const { root } = setup();
    const seek = root.querySelector(".sk-video-player__seek")!;
    const volume = root.querySelector(".sk-video-player__volume-slider")!;
    expect(seek.getAttribute("role")).toBe("slider");
    expect(seek.getAttribute("aria-label")).toBe("Seek");
    expect(volume.getAttribute("role")).toBe("slider");
    expect(volume.getAttribute("aria-label")).toBe("Volume");
  });

  it("plays from the button, and the button becomes Pause when the element says it plays", () => {
    const { root, button, play } = setup();
    fireEvent.click(button("play"));
    expect(play).toHaveBeenCalledOnce();
    expect(root.hasAttribute("data-playing")).toBe(true);
    expect(root.hasAttribute("data-started")).toBe(true);
    expect(button("play").getAttribute("aria-label")).toBe("Pause");
  });

  it("pauses from the button and says Play again", () => {
    const { root, button, pause } = setup();
    fireEvent.click(button("play"));
    fireEvent.click(button("play"));
    expect(pause).toHaveBeenCalledOnce();
    expect(root.hasAttribute("data-playing")).toBe(false);
    expect(button("play").getAttribute("aria-label")).toBe("Play");
  });

  it("says Replay once the media has ended", () => {
    const { root, video, button } = setup();
    Object.defineProperty(video, "ended", { configurable: true, value: true });
    act(() => {
      video.dispatchEvent(new Event("ended"));
    });
    expect(root.hasAttribute("data-ended")).toBe(true);
    expect(button("play").getAttribute("aria-label")).toBe("Replay");
  });

  it("is somewhere focus can land by script or a press, but not a stop of the Tab order", () => {
    const { root } = setup();
    expect(root.tabIndex).toBe(-1);
  });

  it("moves the focus to the bar's play button when the big button starts the media, so the keys keep answering", () => {
    const { root, button, play } = setup();
    const big = root.querySelector<HTMLButtonElement>(".sk-video-player__big")!;
    big.focus();
    fireEvent.click(big);
    expect(play).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(button("play"));
  });

  it("puts the focus in the player on a press on the picture", () => {
    const { root } = setup();
    fireEvent.click(root.querySelector(".sk-video-player__stage")!);
    expect(document.activeElement).toBe(root);
  });

  it("plays and pauses with k and with a press on the picture", () => {
    const { root, play, pause } = setup();
    fireEvent.keyDown(root, { key: "k" });
    expect(play).toHaveBeenCalledOnce();
    fireEvent.click(root.querySelector(".sk-video-player__stage")!);
    expect(pause).toHaveBeenCalledOnce();
  });

  it("leaves Space on a button to the button, so it does not toggle twice", () => {
    const { button, play } = setup();
    fireEvent.keyDown(button("mute"), { key: " " });
    expect(play).not.toHaveBeenCalled();
  });

  it("seeks with j, l and the arrows, and holds the time inside the media", () => {
    const { root, video } = setup();
    video.currentTime = 50;
    fireEvent.keyDown(root, { key: "l" });
    expect(video.currentTime).toBe(60);
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(video.currentTime).toBe(55);
    fireEvent.keyDown(root, { key: "j", ctrlKey: true });
    expect(video.currentTime).toBe(55);
  });

  it("steps one frame with the period and the comma, and pauses a running video to do it", () => {
    const { root, video, pause, play } = setup();
    video.currentTime = 10;
    fireEvent.keyDown(root, { key: "." });
    expect(video.currentTime).toBeCloseTo(10 + 1 / 30, 4);
    fireEvent.keyDown(root, { key: "," });
    expect(video.currentTime).toBeCloseTo(10, 4);
    fireEvent.keyDown(root, { key: "k" });
    expect(play).toHaveBeenCalledOnce();
    fireEvent.keyDown(root, { key: "." });
    expect(pause).toHaveBeenCalledOnce();
    expect(video.currentTime).toBeCloseTo(10 + 1 / 30, 4);
  });

  it("jumps to a tenth with a digit", () => {
    const { root, video } = setup();
    fireEvent.keyDown(root, { key: "5" });
    expect(video.currentTime).toBe(60);
  });

  it("speaks the position of the seek bar in words", () => {
    const { root, video } = setup();
    video.currentTime = 65;
    act(() => {
      video.dispatchEvent(new Event("timeupdate"));
    });
    const seek = root.querySelector(".sk-video-player__seek")!;
    expect(seek.getAttribute("aria-valuemax")).toBe("120");
    expect(seek.getAttribute("aria-valuenow")).toBe("65");
    expect(seek.getAttribute("aria-valuetext")).toBe("1 minute 5 seconds of 2 minutes");
    expect(root.querySelector(".sk-video-player__current")!.textContent).toBe("1:05");
    expect(root.querySelector(".sk-video-player__duration")!.textContent).toBe("2:00");
  });

  it("swaps the elapsed time for what remains when the clock is pressed, and back", () => {
    const { root, video, button } = setup();
    video.currentTime = 30;
    act(() => {
      video.dispatchEvent(new Event("timeupdate"));
    });
    const clock = button("time");
    const current = root.querySelector(".sk-video-player__current")!;
    expect(clock.getAttribute("aria-label")).toBe("Show remaining time");
    expect(current.textContent).toBe("0:30");
    fireEvent.click(clock);
    expect(current.textContent).toBe("-1:30");
    expect(root.querySelector(".sk-video-player__duration")!.textContent).toBe("2:00");
    expect(root.hasAttribute("data-remaining")).toBe(true);
    expect(clock.getAttribute("aria-label")).toBe("Show elapsed time");
    video.currentTime = 90;
    act(() => {
      video.dispatchEvent(new Event("timeupdate"));
    });
    expect(current.textContent).toBe("-0:30");
    fireEvent.click(clock);
    expect(current.textContent).toBe("1:30");
    expect(root.hasAttribute("data-remaining")).toBe(false);
  });

  it("scales the played fill straight on its element, with no custom property written to the root", () => {
    const { root, video } = setup();
    video.currentTime = 30;
    act(() => {
      video.dispatchEvent(new Event("timeupdate"));
    });
    expect(root.querySelector<HTMLElement>(".sk-video-player__played")!.style.scale).toBe("0.25 1");
    expect(root.getAttribute("style") ?? "").not.toContain("--sk-video-player-");
  });

  it("mutes and unmutes, and names the button for what a press does next", () => {
    const { root, video, button } = setup();
    fireEvent.click(button("mute"));
    expect(video.muted).toBe(true);
    expect(root.hasAttribute("data-muted")).toBe(true);
    expect(button("mute").getAttribute("aria-label")).toBe("Unmute");
    fireEvent.keyDown(root, { key: "m" });
    expect(video.muted).toBe(false);
    expect(button("mute").getAttribute("aria-label")).toBe("Mute");
  });

  it("moves the volume with the up and down arrows", () => {
    const { root, video } = setup();
    video.volume = 0.5;
    fireEvent.keyDown(root, { key: "ArrowUp" });
    expect(video.volume).toBe(0.55);
    const slider = root.querySelector(".sk-video-player__volume-slider")!;
    expect(slider.getAttribute("aria-valuenow")).toBe("55");
  });

  it("steps the speed from the button, wrapping, and puts the rate in the button's name", () => {
    const { video, button } = setup({ speeds: [1, 1.5] });
    expect(button("speed").getAttribute("aria-label")).toBe("Playback speed: 1×");
    fireEvent.click(button("speed"));
    expect(video.playbackRate).toBe(1.5);
    expect(button("speed").getAttribute("aria-label")).toBe("Playback speed: 1.5×");
    fireEvent.click(button("speed"));
    expect(video.playbackRate).toBe(1);
  });

  it("shows the captions button only when the video has caption tracks", () => {
    const { button } = setup();
    expect(button("captions").hidden).toBe(true);
  });

  it("draws the active caption itself, above the bar, and keeps the browser from painting it too", () => {
    const view = render(
      <VideoPlayer label="Trailer">
        <video src="/trailer.mp4" />
      </VideoPlayer>,
    );
    const root = view.container.firstElementChild as HTMLElement;
    const video = root.querySelector("video")!;
    const cues: Array<{ text: string }> = [];
    const track = Object.assign(new EventTarget(), { kind: "captions", language: "en", mode: "disabled", activeCues: cues });
    const list = Object.assign(new EventTarget(), { 0: track, length: 1, [Symbol.iterator]: () => [track][Symbol.iterator]() });
    /* Defined after mount on purpose: the controller reads the tracks when it needs them, not once. */
    Object.defineProperty(video, "textTracks", { configurable: true, value: list });
    const button = root.querySelector<HTMLButtonElement>('[data-video-action="captions"]')!;
    const drawn = root.querySelector(".sk-video-player__captions")!;
    fireEvent.keyDown(root, { key: "c" });
    expect(track.mode).toBe("hidden");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    cues.push({ text: "<i>Hello</i> there" });
    track.dispatchEvent(new Event("cuechange"));
    expect(drawn.textContent).toBe("Hello there");
    cues.length = 0;
    track.dispatchEvent(new Event("cuechange"));
    expect(drawn.textContent).toBe("");
    fireEvent.keyDown(root, { key: "c" });
    expect(track.mode).toBe("disabled");
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("hides the controls after the idle delay while playing, and brings them back on any key", () => {
    const { root, button } = setup();
    fireEvent.click(button("play"));
    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(root.hasAttribute("data-idle")).toBe(true);
    fireEvent.keyDown(root, { key: "Shift" });
    expect(root.hasAttribute("data-idle")).toBe(false);
  });

  it("never hides the controls while paused", () => {
    const { root } = setup();
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(root.hasAttribute("data-idle")).toBe(false);
  });

  it("keeps the controls when auto-hide is off", () => {
    const { root, button } = setup({ autoHide: false });
    fireEvent.click(button("play"));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(root.hasAttribute("data-idle")).toBe(false);
  });

  it("takes the words from its props", () => {
    const { button } = setup({ playLabel: "Reproducir", pauseLabel: "Pausar", muteLabel: "Silenciar" });
    expect(button("play").getAttribute("aria-label")).toBe("Reproducir");
    expect(button("mute").getAttribute("aria-label")).toBe("Silenciar");
    fireEvent.click(button("play"));
    expect(button("play").getAttribute("aria-label")).toBe("Pausar");
  });

  it("stops listening when it unmounts", () => {
    const { unmount, video, play } = setup();
    unmount();
    video.dispatchEvent(new Event("play"));
    expect(play).not.toHaveBeenCalled();
  });
});

/*
 * WHAT THE PLAYER DOES NOT WRITE. Measured on a playing player, rewriting the clock's text and custom properties on the root every
 * frame cost ~300 ms of style recalculation per second; these pin the behaviour that removed it (see `media-progress.ts`).
 */
describe("VideoPlayer, the work it does not do", () => {
  const tick = (video: HTMLVideoElement, seconds: number) => {
    video.currentTime = seconds;
    act(() => {
      video.dispatchEvent(new Event("timeupdate"));
    });
  };

  it("does not rewrite the clock or the seek bar's aria values while the displayed second is the same", () => {
    const { root, video } = setup();
    tick(video, 5.1);
    const clock = root.querySelector(".sk-video-player__current")!;
    const seek = root.querySelector(".sk-video-player__seek")!;
    let writes = 0;
    const observer = new MutationObserver((records) => {
      writes += records.length;
    });
    observer.observe(clock, { subtree: true, childList: true, characterData: true });
    observer.observe(seek, { attributes: true });
    for (const t of [5.2, 5.4, 5.7, 5.9]) tick(video, t);
    writes += observer.takeRecords().length;
    expect(writes).toBe(0);
    tick(video, 6.2);
    writes += observer.takeRecords().length;
    observer.disconnect();
    expect(writes).toBeGreaterThan(0);
    expect(clock.textContent).toBe("0:06");
  });

  it("swaps the clock between elapsed and remaining even within the same second", () => {
    const { root, video, button } = setup();
    tick(video, 30.2);
    const clock = root.querySelector(".sk-video-player__current")!;
    expect(clock.textContent).toBe("0:30");
    fireEvent.click(root.querySelector('[data-video-action="time"]')!);
    expect(clock.textContent).not.toBe("0:30");
    expect(button("play")).not.toBeNull();
  });

  describe("off screen", () => {
    type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;
    let callbacks: Callback[] = [];
    const original = window.IntersectionObserver;
    beforeEach(() => {
      callbacks = [];
      window.IntersectionObserver = class {
        constructor(cb: Callback) {
          callbacks.push(cb);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      } as unknown as typeof IntersectionObserver;
    });
    afterEach(() => {
      window.IntersectionObserver = original;
    });
    const report = (isIntersecting: boolean) => {
      act(() => {
        for (const cb of callbacks) cb([{ isIntersecting }]);
      });
    };

    it("loads a rendered video's metadata only once the player is near the viewport", () => {
      const view = render(<VideoPlayer label="Rendered" src="/rendered.mp4" poster="/p.jpg" />);
      const video = view.container.querySelector("video")!;
      expect(video.getAttribute("preload")).toBe("none");
      expect(video.hasAttribute("data-defer-load")).toBe(true);
      report(true);
      expect(video.getAttribute("preload")).toBe("metadata");
      expect(video.hasAttribute("data-defer-load")).toBe(false);
    });

    it("leaves an author's own video alone: it keeps the preload they chose", () => {
      const view = render(
        <VideoPlayer label="Own">
          <video preload="none" src="/own.mp4" />
        </VideoPlayer>,
      );
      report(true);
      expect(view.container.querySelector("video")!.getAttribute("preload")).toBe("none");
    });

    it("draws nothing while it is out of view, and catches up when it comes back", () => {
      const { root, video } = setup();
      report(false);
      const clock = root.querySelector(".sk-video-player__current")!;
      const before = clock.textContent;
      tick(video, 42);
      expect(clock.textContent).toBe(before);
      report(true);
      expect(clock.textContent).toBe("0:42");
    });
  });
});
