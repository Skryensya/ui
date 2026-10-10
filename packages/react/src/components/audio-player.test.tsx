import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayer, AudioPlayerMinimal, type AudioPlayerTrack } from "./audio-player.js";

/*
 * jsdom has no media pipeline: `play()` is "not implemented" and nothing ever plays. So the element is told what it is
 * doing the way a browser would (a `paused` flag and the event that follows), which is exactly the contract the
 * controller reads: it paints from the element, never from its own guess.
 */
const setup = (props: Partial<React.ComponentProps<typeof AudioPlayer>> = {}) => {
  const view = render(<AudioPlayer label="Episode" src="/episode.mp3" {...props} />);
  const root = view.container.firstElementChild as HTMLElement;
  const audio = root.querySelector("audio")!;
  let paused = true;
  let ended = false;
  Object.defineProperty(audio, "paused", { configurable: true, get: () => paused });
  Object.defineProperty(audio, "ended", { configurable: true, get: () => ended });
  Object.defineProperty(audio, "duration", { configurable: true, value: 120 });
  const play = vi.fn(async () => {
    paused = false;
    ended = false;
    audio.dispatchEvent(new Event("play"));
  });
  const pause = vi.fn(() => {
    paused = true;
    audio.dispatchEvent(new Event("pause"));
  });
  audio.play = play;
  audio.pause = pause;
  audio.load = vi.fn();
  const finish = () => {
    paused = true;
    ended = true;
    act(() => {
      audio.dispatchEvent(new Event("ended"));
    });
  };
  const button = (action: string) => root.querySelector<HTMLButtonElement>(`[data-audio-action="${action}"]`)!;
  return { ...view, root, audio, play, pause, finish, button };
};

const tracks: AudioPlayerTrack[] = [
  { src: "/one.mp3", title: "One", artist: "Ana", cover: "/one.jpg", duration: 65 },
  { src: "/two.mp3", title: "Two", artist: "Ben", peaks: "0.2 0.9 0.4" },
  { src: "/three.mp3", title: "Three" },
];

const item = (root: HTMLElement, at: number) => root.querySelectorAll<HTMLElement>(".sk-audio-player__item")[at]!;
const entry = (root: HTMLElement, at: number) => item(root, at).querySelector<HTMLButtonElement>("button")!;

describe("AudioPlayer", () => {
  it("is a named group around the audio, with the native controls off", () => {
    const { root, audio } = setup();
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe("Episode");
    expect(audio.getAttribute("src")).toBe("/episode.mp3");
    expect(audio.controls).toBe(false);
  });

  it("is a still, valid player before any script runs: no list, no wave, no previous or next", () => {
    const { root, button } = setup();
    expect(root.querySelector(".sk-audio-player__list")).toBeNull();
    expect(root.hasAttribute("data-wave")).toBe(false);
    expect(button("previous").hidden).toBe(true);
    expect(button("next").hidden).toBe(true);
  });

  it("names every control, with its shortcut", () => {
    const { button } = setup();
    expect(button("play").getAttribute("aria-label")).toBe("Play");
    expect(button("play").getAttribute("aria-keyshortcuts")).toBe("k");
    expect(button("mute").getAttribute("aria-label")).toBe("Mute");
  });

  it("plays from the button, and the button says Pause when the element says it plays", () => {
    const { root, button, play } = setup();
    fireEvent.click(button("play"));
    expect(play).toHaveBeenCalledOnce();
    expect(root.hasAttribute("data-playing")).toBe(true);
    expect(button("play").getAttribute("aria-label")).toBe("Pause");
    fireEvent.click(button("play"));
    expect(root.hasAttribute("data-playing")).toBe(false);
    expect(button("play").getAttribute("aria-label")).toBe("Play");
  });

  it("says Replay once the audio has ended, and a single sound does not move on", () => {
    const { root, finish, button, play } = setup();
    finish();
    expect(root.hasAttribute("data-ended")).toBe(true);
    expect(button("play").getAttribute("aria-label")).toBe("Replay");
    expect(play).not.toHaveBeenCalled();
  });

  it("has no skip buttons: j and l are how it seeks by the skip", () => {
    const { root, audio, button } = setup({ skip: 30 });
    expect(button("back")).toBeNull();
    expect(button("forward")).toBeNull();
    audio.currentTime = 50;
    fireEvent.keyDown(root, { key: "l" });
    expect(audio.currentTime).toBe(80);
    fireEvent.keyDown(root, { key: "j" });
    expect(audio.currentTime).toBe(50);
  });

  it("answers the keys that need no picture and ignores the ones that do", () => {
    const { root, play } = setup();
    fireEvent.keyDown(root, { key: "k" });
    expect(play).toHaveBeenCalledOnce();
    const fullscreen = vi.fn();
    root.requestFullscreen = fullscreen;
    fireEvent.keyDown(root, { key: "f" });
    expect(fullscreen).not.toHaveBeenCalled();
  });

  it("leaves Space on a button to the button, so it does not toggle twice", () => {
    const { button, play } = setup();
    fireEvent.keyDown(button("play"), { key: " " });
    expect(play).not.toHaveBeenCalled();
  });

  it("makes the seek bar and the volume a named slider each, and speaks the time", () => {
    const { root, audio } = setup();
    const seek = root.querySelector(".sk-audio-player__seek")!;
    expect(seek.getAttribute("role")).toBe("slider");
    expect(seek.getAttribute("aria-label")).toBe("Seek");
    expect(root.querySelector(".sk-audio-player__volume-slider")!.getAttribute("role")).toBe("slider");
    audio.currentTime = 65;
    act(() => {
      audio.dispatchEvent(new Event("timeupdate"));
    });
    expect(seek.getAttribute("aria-valuetext")).toBe("1 minute 5 seconds of 2 minutes");
  });

  it("draws the root's peaks as a waveform that replaces the plain track", () => {
    const { root } = setup({ peaks: [0.1, 0.9, 0.5] });
    expect(root.hasAttribute("data-wave")).toBe(true);
    const bars = root.querySelectorAll(".sk-audio-player__wave-bars > span");
    expect(bars.length).toBeGreaterThan(0);
    expect(root.querySelectorAll(".sk-audio-player__wave-fill > span")).toHaveLength(bars.length);
    expect((bars[0] as HTMLElement).style.getPropertyValue("--sk-audio-player-peak")).toBe("0.1");
  });

  it("makes the volume a vertical slider: it is a popup column, silence at the bottom", () => {
    const { root } = setup();
    expect(root.querySelector(".sk-audio-player__volume-slider")!.getAttribute("aria-orientation")).toBe("vertical");
    expect(root.querySelector(".sk-audio-player__seek")!.hasAttribute("aria-orientation")).toBe(false);
  });

  it("makes previous and next as big as the player's other round controls, not the small ghost size", () => {
    const { button } = setup({ src: undefined, tracks: [{ src: "/a.mp3", title: "A" }, { src: "/b.mp3", title: "B" }] });
    expect(button("previous").getAttribute("data-size")).toBe("md");
    expect(button("next").getAttribute("data-size")).toBe("md");
    expect(button("play").getAttribute("data-size")).toBe("md");
  });

  it("writes the played fraction the sheet draws from", () => {
    const { root, audio } = setup();
    audio.currentTime = 30;
    act(() => {
      audio.dispatchEvent(new Event("timeupdate"));
    });
    /* Drawn as a scale straight on the fill, not as a custom property on the root, so one element is invalidated and no layout runs. */
    expect(root.querySelector<HTMLElement>(".sk-audio-player__played")!.style.scale).toBe("0.25 1");
    expect(root.style.getPropertyValue("--sk-audio-player-played")).toBe("");
  });

  it("shows the title, the artist and the cover it is given", () => {
    const { root } = setup({ title: "Pilot", artist: "Ana", cover: "/pilot.jpg", variant: "card" });
    expect(root.querySelector(".sk-audio-player__title")!.textContent).toBe("Pilot");
    expect(root.querySelector(".sk-audio-player__artist")!.textContent).toBe("Ana");
    expect(root.querySelector(".sk-audio-player__cover")!.getAttribute("src")).toBe("/pilot.jpg");
    expect(root.getAttribute("data-variant")).toBe("card");
  });

  it("is the bar unless it is told otherwise", () => {
    const { root } = setup();
    expect(root.getAttribute("data-variant")).toBe("bar");
  });

  it("does not tell the control to take an appearance", () => {
    const { root } = setup();
    expect(root.querySelectorAll("[data-appearance]")).toHaveLength(0);
  });

  describe("with tracks", () => {
    const withTracks = (props: Partial<React.ComponentProps<typeof AudioPlayer>> = {}) =>
      setup({ src: undefined, tracks, ...props });

    it("loads the first track without playing it, and shows its words and cover", () => {
      const { root, audio, play } = withTracks();
      expect(audio.getAttribute("src")).toBe("/one.mp3");
      expect(play).not.toHaveBeenCalled();
      expect(root.querySelector(".sk-audio-player__title")!.textContent).toBe("One");
      expect(root.querySelector(".sk-audio-player__artist")!.textContent).toBe("Ana");
      const cover = root.querySelector<HTMLImageElement>(".sk-audio-player__cover")!;
      expect(cover.getAttribute("src")).toBe("/one.jpg");
      expect(cover.hidden).toBe(false);
    });

    it("is List's rows: the same classes, so square corners, dividers and the state layer come with them", () => {
      const { root } = withTracks();
      const list = root.querySelector(".sk-audio-player__list")!;
      expect(list.classList.contains("sk-list")).toBe(true);
      expect(item(root, 0).classList.contains("sk-list__item")).toBe(true);
      expect(entry(root, 0).classList.contains("sk-list__action")).toBe(true);
      expect(entry(root, 0).classList.contains("sk-interactive")).toBe(true);
      expect(entry(root, 0).querySelector(".sk-list__content .sk-list__title")!.textContent).toBe("One");
      expect(entry(root, 0).querySelector(".sk-list__description")!.textContent).toBe("Ana");
    });

    it("lists every track, marks the loaded one, and shows a duration it knows", () => {
      const { root } = withTracks();
      expect(root.querySelectorAll(".sk-audio-player__item")).toHaveLength(3);
      expect(item(root, 0).hasAttribute("data-current")).toBe(true);
      expect(entry(root, 0).getAttribute("aria-current")).toBe("true");
      expect(item(root, 1).hasAttribute("data-current")).toBe(false);
      expect(entry(root, 1).hasAttribute("aria-current")).toBe(false);
      expect(item(root, 0).querySelector(".sk-audio-player__item-duration")!.textContent).toBe("1:05");
    });

    it("offers previous and next once there is somewhere to go", () => {
      const { button } = withTracks();
      expect(button("previous").hidden).toBe(false);
      expect(button("next").hidden).toBe(false);
    });

    it("loads and plays the track you press", () => {
      const { root, audio, play } = withTracks();
      fireEvent.click(entry(root, 1));
      expect(audio.getAttribute("src")).toBe("/two.mp3");
      expect(play).toHaveBeenCalledOnce();
      expect(root.querySelector(".sk-audio-player__title")!.textContent).toBe("Two");
      expect(item(root, 1).hasAttribute("data-current")).toBe(true);
      expect(item(root, 0).hasAttribute("data-current")).toBe(false);
    });

    it("hides the artist and the cover a track does not have", () => {
      const { root } = withTracks();
      fireEvent.click(entry(root, 2));
      expect(root.querySelector<HTMLElement>(".sk-audio-player__artist")!.hidden).toBe(true);
      expect(root.querySelector<HTMLImageElement>(".sk-audio-player__cover")!.hidden).toBe(true);
    });

    it("pauses when you press the track that is already playing", () => {
      const { root, pause } = withTracks();
      fireEvent.click(entry(root, 0));
      fireEvent.click(entry(root, 0));
      expect(pause).toHaveBeenCalledOnce();
    });

    it("draws each track's own waveform, and none for one without peaks", () => {
      const { root } = withTracks();
      expect(root.hasAttribute("data-wave")).toBe(false);
      fireEvent.click(entry(root, 1));
      expect(root.hasAttribute("data-wave")).toBe(true);
      fireEvent.click(entry(root, 2));
      expect(root.hasAttribute("data-wave")).toBe(false);
    });

    it("moves on to the next track when one ends, and plays it", () => {
      const { root, audio, finish, play } = withTracks();
      finish();
      expect(audio.getAttribute("src")).toBe("/two.mp3");
      expect(play).toHaveBeenCalledOnce();
      expect(item(root, 1).hasAttribute("data-current")).toBe(true);
    });

    it("stops at the end of the list instead of looping", () => {
      const { root, finish, play, button } = withTracks();
      fireEvent.click(entry(root, 2));
      play.mockClear();
      finish();
      expect(play).not.toHaveBeenCalled();
      expect(root.hasAttribute("data-ended")).toBe(true);
      expect(button("next").disabled).toBe(true);
    });

    it("waits for you when auto-advance is off", () => {
      const { audio, finish, play } = withTracks({ autoAdvance: false });
      finish();
      expect(audio.getAttribute("src")).toBe("/one.mp3");
      expect(play).not.toHaveBeenCalled();
    });

    it("goes to the next track from the button and from Shift+N", () => {
      const { root, audio, button } = withTracks();
      fireEvent.click(button("next"));
      expect(audio.getAttribute("src")).toBe("/two.mp3");
      fireEvent.keyDown(root, { key: "N", shiftKey: true });
      expect(audio.getAttribute("src")).toBe("/three.mp3");
    });

    it("restarts the track on previous once it is a few seconds in, and goes back when it has just begun", () => {
      const { root, audio, button } = withTracks();
      fireEvent.click(entry(root, 1));
      audio.currentTime = 20;
      fireEvent.click(button("previous"));
      expect(audio.currentTime).toBe(0);
      expect(audio.getAttribute("src")).toBe("/two.mp3");
      fireEvent.click(button("previous"));
      expect(audio.getAttribute("src")).toBe("/one.mp3");
    });

    it("names the list", () => {
      const { root } = withTracks({ tracksLabel: "Episodes" });
      expect(root.querySelector(".sk-audio-player__list")!.getAttribute("aria-label")).toBe("Episodes");
    });
  });
});

describe("AudioPlayerMinimal", () => {
  const minimal = (props: Partial<React.ComponentProps<typeof AudioPlayerMinimal>> = {}) => {
    const view = render(<AudioPlayerMinimal label="Voice note" src="/note.mp3" {...props} />);
    const root = view.container.firstElementChild as HTMLElement;
    const audio = root.querySelector("audio")!;
    let paused = true;
    Object.defineProperty(audio, "paused", { configurable: true, get: () => paused });
    Object.defineProperty(audio, "duration", { configurable: true, value: 60 });
    const play = vi.fn(async () => {
      paused = false;
      audio.dispatchEvent(new Event("play"));
    });
    audio.play = play;
    audio.pause = vi.fn(() => {
      paused = true;
      audio.dispatchEvent(new Event("pause"));
    });
    return { ...view, root, audio, play };
  };

  it("is a named group with a play button, a seek bar and the time, and nothing else", () => {
    const { root } = minimal();
    expect(root.getAttribute("role")).toBe("group");
    expect(root.getAttribute("aria-label")).toBe("Voice note");
    expect(root.getAttribute("data-variant")).toBe("minimal");
    expect(Array.from(root.children).map((part) => part.className.split(" ")[0])).toEqual([
      "sk-audio-player__media",
      "sk-audio-player__control",
      "sk-audio-player__seek",
      "sk-audio-player__time",
    ]);
    expect(root.querySelectorAll("button")).toHaveLength(1);
    expect(root.querySelector(".sk-audio-player__cover, .sk-audio-player__meta, .sk-audio-player__list, .sk-audio-player__volume")).toBeNull();
  });

  it("says what is playing above the bar when it is given a title, and has no title part when it is not", () => {
    const { root } = minimal({ title: "Voice note, Monday" });
    expect(root.querySelector(".sk-audio-player__title")!.textContent).toBe("Voice note, Monday");
    expect(Array.from(root.children).map((part) => part.className.split(" ")[0])).toEqual([
      "sk-audio-player__media",
      "sk-audio-player__control",
      "sk-audio-player__title",
      "sk-audio-player__seek",
      "sk-audio-player__time",
    ]);
    const bare = minimal();
    expect(bare.root.querySelector(".sk-audio-player__title")).toBeNull();
  });

  it("plays from the button and says Pause when the element plays", () => {
    const { root, play } = minimal();
    const button = root.querySelector<HTMLButtonElement>('[data-audio-action="play"]')!;
    expect(button.getAttribute("aria-label")).toBe("Play");
    fireEvent.click(button);
    expect(play).toHaveBeenCalledOnce();
    expect(root.hasAttribute("data-playing")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("Pause");
  });

  it("writes the clock and the time in words, from the same controller", () => {
    const { root, audio } = minimal();
    audio.currentTime = 30;
    act(() => {
      audio.dispatchEvent(new Event("timeupdate"));
    });
    expect(root.querySelector(".sk-audio-player__current")!.textContent).toBe("0:30");
    expect(root.querySelector(".sk-audio-player__duration")!.textContent).toBe("1:00");
    expect(root.querySelector(".sk-audio-player__seek")!.getAttribute("aria-valuetext")).toBe("30 seconds of 1 minute");
  });

  it("still answers the keys while focus is inside, and seeks by the skip with j and l", () => {
    const { root, audio, play } = minimal({ skip: 15 });
    fireEvent.keyDown(root, { key: "k" });
    expect(play).toHaveBeenCalledOnce();
    audio.currentTime = 20;
    fireEvent.keyDown(root, { key: "l" });
    expect(audio.currentTime).toBe(35);
  });
});

/*
 * WHAT THE PLAYER DOES NOT WRITE. Measured on a playing player, rewriting the clock's text and a custom property on the root every
 * frame cost ~300 ms of style recalculation per second; these pin the behaviour that removed it (see `media-progress.ts`).
 */
describe("AudioPlayer, the work it does not do", () => {
  /* Counts writes to ONE element: its own attributes (a slider's aria values), or with `deep` its text and children too (a clock). */
  const writes = (el: Element, deep = true) => {
    let count = 0;
    const observer = new MutationObserver((records) => {
      count += records.length;
    });
    observer.observe(el, deep ? { subtree: true, childList: true, characterData: true, attributes: true } : { attributes: true });
    return { count: () => (observer.takeRecords().forEach(() => (count += 1)), count), stop: () => observer.disconnect() };
  };
  const tick = (audio: HTMLAudioElement, seconds: number) => {
    audio.currentTime = seconds;
    act(() => {
      audio.dispatchEvent(new Event("timeupdate"));
    });
  };

  it("does not touch the clock or the aria values while the displayed second is the same", () => {
    const { root, audio } = setup();
    tick(audio, 5.1);
    const seen = writes(root.querySelector(".sk-audio-player__current")!.parentElement!);
    const aria = writes(root.querySelector(".sk-audio-player__seek")!, false);
    const before = [seen.count(), aria.count()];
    for (const t of [5.2, 5.4, 5.6, 5.9]) tick(audio, t);
    expect(seen.count() - before[0]!).toBe(0);
    expect(aria.count() - before[1]!).toBe(0);
    tick(audio, 6.0);
    expect(seen.count() - before[0]!).toBeGreaterThan(0);
    expect(root.querySelector(".sk-audio-player__current")!.textContent).toBe("0:06");
    seen.stop();
    aria.stop();
  });

  it("moves the fill only when it moves a pixel's worth, with no custom property written to the root", () => {
    const { root, audio } = setup();
    const played = root.querySelector<HTMLElement>(".sk-audio-player__played")!;
    tick(audio, 30);
    const first = played.style.scale;
    const fill = writes(played);
    tick(audio, 30.0001);
    expect(played.style.scale).toBe(first);
    expect(fill.count()).toBe(0);
    fill.stop();
    expect(root.getAttribute("style") ?? "").not.toContain("--sk-audio-player-");
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

    it("loads the file's metadata only once the player is near the viewport, and not before", () => {
      const { audio } = setup();
      expect(audio.getAttribute("preload")).toBe("none");
      expect(audio.hasAttribute("data-defer-load")).toBe(true);
      report(true);
      expect(audio.getAttribute("preload")).toBe("metadata");
      expect(audio.hasAttribute("data-defer-load")).toBe(false);
    });

    it("leaves an author's own audio alone: it keeps the preload they chose", () => {
      const view = render(
        <AudioPlayer label="Own">
          <audio preload="none" src="/own.mp3" />
        </AudioPlayer>,
      );
      report(true);
      expect(view.container.querySelector("audio")!.getAttribute("preload")).toBe("none");
    });

    it("draws nothing while it is out of view, and catches up when it comes back", () => {
      const { root, audio } = setup();
      report(false);
      const clock = root.querySelector(".sk-audio-player__current")!;
      const before = clock.textContent;
      tick(audio, 42);
      expect(clock.textContent).toBe(before);
      report(true);
      expect(clock.textContent).toBe("0:42");
    });
  });
});
