import { isTypingContext } from "./hotkey.js";
import { createProgressView } from "./media-progress.js";
import {
  audioKeyAction,
  audioNextIndex,
  audioPlayerAttrs,
  audioPlayerParts,
  audioPreviousAction,
  parseAudioPeaks,
  resampleAudioPeaks,
  type AudioKeyAction,
} from "./audio-player.js";
import {
  VIDEO_PLAYER_SKIP,
  VIDEO_PLAYER_SPEEDS,
  formatVideoSpeed,
  formatVideoTime,
  formatVideoTimeLabel,
  parseVideoSpeeds,
  videoFiniteTime,
  videoFraction,
  videoFractionFromPointer,
  videoNextSpeed,
  videoSeekBy,
  videoTimeFromPointer,
  videoTimeText,
  videoVolumeBy,
  type VideoKeyTarget,
} from "./video-player.js";

/*
 * AUDIO PLAYER, the controller: the one place the player's behaviour is wired, shared by the Vanilla enhancer and the React
 * component for the reason `video-player-controller.ts` is. DOM-touching and framework-free.
 *
 * WHAT IT WRITES: the state flags on the root, four custom properties the sheet draws the fills from, the aria values of
 * the two sliders, the words of the buttons whose name changes, the clock, the speed and skip text, the bars of the
 * waveform, and, for a playlist, which entry is current and the title, artist and cover shown for it. A server renders none
 * of that, so the markup before any script runs is a valid, still player.
 *
 * THE ELEMENT IS THE SOURCE OF TRUTH, as in the video player: a handler calls the `<audio>` and the chrome is repainted
 * from the event that follows. A track change is a real source change on the same element, so `ended`, `canplay` and the
 * rest mean what they always do.
 */

export type AudioPlayerLabels = {
  readonly play?: string;
  readonly pause?: string;
  readonly replay?: string;
  readonly mute?: string;
  readonly unmute?: string;
  readonly speed?: string;
  readonly time?: string;
};

export type AudioPlayerConfig = {
  /** When a track ends, the next one starts. Default true. */
  readonly autoAdvance?: boolean;
  /** Seconds a `j` or `l` moves. */
  readonly skip?: number;
  /** The rates the speed button steps through. */
  readonly speeds?: readonly number[];
  /** The language the time is spoken in; the nearest `lang` by default. */
  readonly locale?: string;
  readonly labels?: AudioPlayerLabels;
};

export type AudioPlayerController = {
  /** The `<audio>`, or null if the markup has none. */
  readonly audio: HTMLAudioElement | null;
  /** The index of the loaded track, or -1 when there is no list. */
  readonly index: number;
  play(): Promise<void>;
  pause(): void;
  toggle(): void;
  seek(seconds: number): void;
  /** Loads track `index` of the list, and plays it when asked. */
  load(index: number, options?: { play?: boolean }): void;
  next(): void;
  previous(): void;
  /** New settings (React calls this on every render); repaints. */
  configure(config: AudioPlayerConfig): void;
  destroy(): void;
};

const controllers = new WeakMap<Element, AudioPlayerController>();

/** The controller of a connected player, by its element. */
export function getAudioPlayerController(root: Element): AudioPlayerController | null {
  return controllers.get(root) ?? null;
}

const partSelector = (part: keyof typeof audioPlayerParts) => `.${audioPlayerParts[part]}`;

/** Reads the settings an author wrote on the root. */
export function readAudioPlayerConfig(root: HTMLElement): AudioPlayerConfig {
  const skip = Number.parseFloat(root.getAttribute(audioPlayerAttrs.skip) ?? "");
  return {
    autoAdvance: root.getAttribute(audioPlayerAttrs.autoAdvance) !== "false",
    skip: Number.isFinite(skip) && skip > 0 ? skip : undefined,
    speeds: parseVideoSpeeds(root.getAttribute(audioPlayerAttrs.speeds)),
  };
}

type Track = {
  readonly item: HTMLElement;
  readonly src: string;
  readonly title: string;
  readonly artist: string;
  readonly cover: string;
  readonly peaks: string;
  readonly duration: number;
};

export function connectAudioPlayer(root: HTMLElement, initial: AudioPlayerConfig = {}): AudioPlayerController {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const audio = root.querySelector<HTMLAudioElement>("audio");
  const q = <T extends HTMLElement>(part: keyof typeof audioPlayerParts) => root.querySelector<T>(partSelector(part));
  const seekBar = q("seek");
  const volumeSlider = q("volumeSlider");
  const tip = q("tip");
  const current = q("current");
  const duration = q("duration");
  const speedText = q("speed");
  const titleText = q("title");
  const artistText = q("artist");
  const cover = q<HTMLImageElement>("cover");
  const waveBars = q("waveBars");
  const waveFill = q("waveFill");
  const played = q("played");
  const bufferedFill = q("buffered");
  const thumb = q("thumb");
  const volumeFill = q("volumeFill");
  const actionButtons = (action: string) =>
    [...root.querySelectorAll<HTMLButtonElement>(`[${audioPlayerAttrs.action}="${action}"]`)];
  const playButton = actionButtons("play")[0];
  const muteButton = actionButtons("mute")[0];
  const speedButton = actionButtons("speed")[0];
  const previousButton = actionButtons("previous")[0];
  const nextButton = actionButtons("next")[0];

  let config: AudioPlayerConfig = { ...readAudioPlayerConfig(root), ...initial };
  let destroyed = false;
  let scrubbing = false;
  let scrubTime = 0;
  let volumeDragging = false;
  let frame = 0;
  let index = -1;
  let shownPeaks: string | null = null;
  /* Asking the browser for the direction or a bar's box costs a style recalculation or a layout, so each is asked once and kept. */
  let rtl = false;
  let seekRect: DOMRect | null = null;
  /* A player off screen paints nothing: its loop stops and its events skip the drawing, and it catches up when it comes back. */
  let visible = true;

  if (!audio) {
    return {
      audio: null,
      index: -1,
      play: async () => {},
      pause: () => {},
      toggle: () => {},
      seek: () => {},
      load: () => {},
      next: () => {},
      previous: () => {},
      configure: () => {},
      destroy: () => {},
    };
  }

  /* The chrome replaces the native controls; leaving both would draw two bars. */
  audio.controls = false;
  audio.removeAttribute("controls");
  if (!audio.hasAttribute("preload")) audio.preload = "metadata";
  /*
   * LOAD ONLY WHAT IS NEAR. A page with several players used to ask for every file's metadata on load. Media the contract
   * renders starts with `preload="none"` and `data-defer-load`; the first time its player is near the viewport it is upgraded
   * to `metadata`, which is what makes the duration appear. Media the author wrote keeps whatever preload they chose.
   */
  const upgradePreload = () => {
    if (!audio.hasAttribute(audioPlayerAttrs.deferLoad)) return;
    audio.removeAttribute(audioPlayerAttrs.deferLoad);
    audio.preload = "metadata";
  };

  const authored = (button: Element | undefined, attr: string) => button?.getAttribute(attr) ?? undefined;
  const primary = {
    play: playButton?.getAttribute("aria-label") ?? "Play",
    mute: muteButton?.getAttribute("aria-label") ?? "Mute",
    speed: speedButton?.getAttribute("aria-label") ?? "Playback speed",
  };
  const labels = () => ({
    play: config.labels?.play ?? primary.play,
    pause: config.labels?.pause ?? authored(playButton, audioPlayerAttrs.labelPause) ?? "Pause",
    replay: config.labels?.replay ?? authored(playButton, audioPlayerAttrs.labelReplay) ?? "Replay",
    mute: config.labels?.mute ?? primary.mute,
    unmute: config.labels?.unmute ?? authored(muteButton, audioPlayerAttrs.labelUnmute) ?? "Unmute",
    speed: config.labels?.speed ?? primary.speed,
    time: config.labels?.time ?? seekBar?.getAttribute(audioPlayerAttrs.timeLabel) ?? "{current} of {duration}",
  });

  const locale = () => config.locale || root.closest("[lang]")?.getAttribute("lang") || doc.documentElement.lang || undefined;
  const skip = () => config.skip ?? VIDEO_PLAYER_SKIP;
  const speeds = () => (config.speeds && config.speeds.length > 0 ? config.speeds : [...VIDEO_PLAYER_SPEEDS]);
  const flag = (name: string, on: boolean) => root.toggleAttribute(name, on);
  const readDirection = () => {
    rtl = win?.getComputedStyle(root).direction === "rtl";
  };
  readDirection();
  const dir = () => (rtl ? "rtl" : "ltr");

  /* ---- the list ---- */

  const text = (el: Element | null | undefined) => el?.textContent?.trim() ?? "";
  const tracks = (): Track[] =>
    [...root.querySelectorAll<HTMLElement>(partSelector("item"))].map((item) => {
      const button = item.querySelector<HTMLElement>(partSelector("itemButton"));
      const seconds = Number.parseFloat(button?.getAttribute(audioPlayerAttrs.trackDuration) ?? "");
      return {
        item,
        src: button?.getAttribute(audioPlayerAttrs.trackSrc) ?? "",
        title: text(item.querySelector(partSelector("itemTitle"))),
        artist: text(item.querySelector(partSelector("itemArtist"))),
        cover: button?.getAttribute(audioPlayerAttrs.trackCover) ?? "",
        peaks: button?.getAttribute(audioPlayerAttrs.trackPeaks) ?? "",
        duration: Number.isFinite(seconds) ? seconds : 0,
      };
    });

  /* ---- paint: the chrome as a view of the element ---- */

  /* Where the buffered data ends from `time`: the end of the range that holds it, else `time` itself. No arrays, since this runs every frame. */
  const bufferedEndAt = (time: number) => {
    const ranges = audio.buffered as TimeRanges | undefined;
    for (let i = 0; ranges && i < ranges.length; i += 1) {
      if (time >= ranges.start(i) && time <= ranges.end(i)) return ranges.end(i);
    }
    return time;
  };

  const view = createProgressView(
    { seek: seekBar, played, buffered: bufferedFill, thumb, waveFill, tip, current, duration },
    {
      win,
      rtl: () => rtl,
      describe: (now, total) => formatVideoTimeLabel(labels().time, videoTimeText(now, locale()), videoTimeText(total, locale())),
    },
  );

  /* `force` is the connect-time paint, before the first visibility report has said anything. */
  const paintTime = (force = false) => {
    if (!visible && !force) return;
    const total = videoFiniteTime(audio.duration);
    const now = scrubbing ? scrubTime : videoFiniteTime(audio.currentTime);
    view.update(now, total, bufferedEndAt(now));
  };

  const paintVolume = () => {
    const silent = audio.muted || audio.volume === 0;
    const level = silent ? 0 : audio.volume;
    if (volumeFill) volumeFill.style.scale = `1 ${level}`;
    flag(audioPlayerAttrs.muted, silent);
    if (volumeSlider) {
      volumeSlider.setAttribute("aria-valuenow", String(Math.round(level * 100)));
      volumeSlider.setAttribute("aria-valuetext", `${Math.round(level * 100)}%`);
    }
    muteButton?.setAttribute("aria-label", silent ? labels().unmute : labels().mute);
  };

  const paintState = () => {
    const playing = !audio.paused && !audio.ended;
    flag(audioPlayerAttrs.playing, playing);
    flag(audioPlayerAttrs.ended, audio.ended);
    if (!audio.paused || audio.currentTime > 0 || audio.ended) flag(audioPlayerAttrs.started, true);
    playButton?.setAttribute("aria-label", audio.ended ? labels().replay : playing ? labels().pause : labels().play);
    if (speedButton) {
      const label = formatVideoSpeed(audio.playbackRate);
      if (speedText) speedText.textContent = label;
      /* The visible "1×" is part of the name, so a voice user can say what they see. */
      speedButton.setAttribute("aria-label", `${labels().speed}: ${label}`);
    }
  };

  const bars = (peaks: readonly number[]) => {
    for (const host of [waveBars, waveFill]) {
      if (!host) continue;
      host.replaceChildren(
        ...resampleAudioPeaks(peaks).map((peak) => {
          const bar = doc.createElement("span");
          bar.style.setProperty("--sk-audio-player-peak", String(Number(peak.toFixed(3))));
          return bar;
        }),
      );
    }
  };

  /* The waveform of what is loaded: the track's own peaks, else the root's. Drawn only when they change. */
  const paintWave = () => {
    const list = tracks();
    const raw = (index >= 0 ? list[index]?.peaks : "") || root.getAttribute(audioPlayerAttrs.peaks) || "";
    if (raw === shownPeaks) return;
    shownPeaks = raw;
    const peaks = parseAudioPeaks(raw);
    bars(peaks);
    flag(audioPlayerAttrs.wave, peaks.length > 0);
  };

  /* What the list says about the loaded track: its words, its cover, its place, and whether there is somewhere to go. */
  const paintTrack = () => {
    const list = tracks();
    if (index >= 0 && list[index]) {
      const track = list[index]!;
      if (titleText) titleText.textContent = track.title;
      if (artistText) {
        artistText.textContent = track.artist;
        artistText.hidden = track.artist === "";
      }
      if (cover) {
        if (track.cover) cover.setAttribute("src", track.cover);
        else cover.removeAttribute("src");
        cover.hidden = track.cover === "";
      }
    }
    list.forEach((track, i) => {
      const on = i === index;
      track.item.toggleAttribute(audioPlayerAttrs.current, on);
      const button = track.item.querySelector<HTMLElement>(partSelector("itemButton"));
      if (on) button?.setAttribute("aria-current", "true");
      else button?.removeAttribute("aria-current");
      const length = track.item.querySelector(partSelector("itemDuration"));
      const known = on && videoFiniteTime(audio.duration) > 0 ? audio.duration : track.duration;
      if (length) length.textContent = known > 0 ? formatVideoTime(known) : "";
    });
    const several = list.length > 1;
    for (const button of [previousButton, nextButton]) if (button) button.hidden = !several;
    flag(audioPlayerAttrs.hasPrevious, several && index > 0);
    flag(audioPlayerAttrs.hasNext, several && audioNextIndex(index, list.length) !== null);
    if (nextButton) nextButton.disabled = several && audioNextIndex(index, list.length) === null;
  };

  const paintAll = (force = false) => {
    view.invalidate();
    paintState();
    paintTime(force);
    paintVolume();
    paintTrack();
    paintWave();
  };

  /* A frame loop while playing: `timeupdate` fires a few times a second, which makes the fill step instead of glide. */
  const tick = () => {
    frame = 0;
    /* Off screen there is nothing to draw: the loop ends here and `visible` starting it again is what resumes it. */
    if (destroyed || !visible) return;
    paintTime();
    if (!audio.paused && !audio.ended) frame = win?.requestAnimationFrame(tick) ?? 0;
  };
  const startTicking = () => {
    if (!frame && win) frame = win.requestAnimationFrame(tick);
  };

  /* ---- acting on the element ---- */

  const play = async () => {
    try {
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
    } catch {
      /* Autoplay policy or a source that failed: the element's own events say so, and the chrome follows them. */
    }
  };
  const pause = () => audio.pause();
  const toggle = () => {
    if (audio.paused || audio.ended) void play();
    else pause();
  };
  const seek = (seconds: number) => {
    const total = videoFiniteTime(audio.duration);
    audio.currentTime = total > 0 ? Math.min(Math.max(seconds, 0), total) : Math.max(seconds, 0);
    paintTime();
  };
  const setVolume = (fraction: number) => {
    const level = Math.min(Math.max(fraction, 0), 1);
    audio.volume = level;
    audio.muted = level === 0;
  };
  const toggleMute = () => {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      if (audio.volume === 0) audio.volume = 0.5;
    } else {
      audio.muted = true;
    }
  };
  const stepSpeed = (direction: 1 | -1, wrap: boolean) => {
    audio.playbackRate = videoNextSpeed(speeds(), audio.playbackRate, direction, wrap);
  };

  const load = (target: number, options: { play?: boolean } = {}) => {
    const list = tracks();
    const track = list[target];
    if (!track) return;
    index = target;
    if (track.src && audio.getAttribute("src") !== track.src) {
      audio.setAttribute("src", track.src);
      audio.load?.();
    }
    flag(audioPlayerAttrs.ended, false);
    flag(audioPlayerAttrs.started, false);
    paintAll();
    if (options.play) void play();
  };
  const next = () => {
    const to = audioNextIndex(index, tracks().length);
    if (to !== null) load(to, { play: !audio.paused || audio.ended });
  };
  const previous = () => {
    const action = audioPreviousAction(videoFiniteTime(audio.currentTime), index);
    if (action.kind === "restart") seek(0);
    else load(action.index, { play: !audio.paused });
  };

  const perform = (action: AudioKeyAction) => {
    switch (action.kind) {
      case "toggle":
        toggle();
        break;
      case "seek-by":
        seek(videoSeekBy(audio.currentTime, action.seconds, audio.duration));
        break;
      case "seek-to":
        seek(action.fraction * videoFiniteTime(audio.duration));
        break;
      case "seek-end":
        seek(videoFiniteTime(audio.duration));
        break;
      case "volume-by":
        setVolume(videoVolumeBy(audio.muted ? 0 : audio.volume, action.percent));
        break;
      case "volume-to":
        setVolume(action.fraction);
        break;
      case "mute":
        toggleMute();
        break;
      case "speed":
        stepSpeed(action.direction, false);
        break;
      case "previous":
        previous();
        break;
      case "next":
        next();
        break;
      case "none":
        break;
    }
  };

  /* ---- events: the chrome's ---- */

  const keyTarget = (target: EventTarget | null): VideoKeyTarget => {
    const el = target instanceof Element ? target : null;
    if (el?.closest(partSelector("seek"))) return "seek";
    if (el?.closest(partSelector("volumeSlider"))) return "volume";
    if (el?.closest("button")) return "button";
    return "stage";
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (isTypingContext(event.target)) return;
    const action = audioKeyAction({
      key: event.key,
      target: keyTarget(event.target),
      paused: audio.paused,
      skip: skip(),
      shift: event.shiftKey,
      modified: event.ctrlKey || event.metaKey || event.altKey,
      rtl: dir() === "rtl",
    });
    if (action.kind === "none") return;
    event.preventDefault();
    perform(action);
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const entry = target.closest<HTMLElement>(partSelector("itemButton"));
    if (entry && root.contains(entry)) {
      const at = tracks().findIndex((track) => track.item.contains(entry));
      if (at === index) toggle();
      else if (at >= 0) load(at, { play: true });
      return;
    }
    const button = target.closest<HTMLElement>(`[${audioPlayerAttrs.action}]`);
    if (!button || !root.contains(button)) return;
    switch (button.getAttribute(audioPlayerAttrs.action)) {
      case "play":
        toggle();
        break;
      case "mute":
        toggleMute();
        break;
      case "speed":
        stepSpeed(1, true);
        break;
      case "previous":
        previous();
        break;
      case "next":
        next();
        break;
    }
  };

  /* The seek bar: a press moves the thumb there and follows the pointer until it lifts. */
  const timeAt = (event: PointerEvent) => {
    /* The bar's box is read once per interaction, on enter and on press, not on every move: reading it forces a layout. */
    const rect = (seekRect ??= seekBar!.getBoundingClientRect());
    return videoTimeFromPointer({
      pointer: event.clientX,
      start: rect.left,
      end: rect.right,
      duration: audio.duration,
      rtl: dir() === "rtl",
    });
  };
  const hoverAt = (event: PointerEvent) => {
    if (!seekBar) return;
    const time = timeAt(event);
    view.hover(videoFraction(time, videoFiniteTime(audio.duration)), time);
  };
  const onSeekEnter = () => {
    seekRect = null;
  };
  const onSeekLeave = () => {
    seekRect = null;
    view.hover(null);
  };
  const onProgressDown = (event: PointerEvent) => {
    if (event.button !== 0 || !seekBar) return;
    event.preventDefault();
    seekRect = null;
    seekBar.focus({ preventScroll: true });
    seekBar.setPointerCapture?.(event.pointerId);
    scrubbing = true;
    flag(audioPlayerAttrs.scrubbing, true);
    scrubTime = timeAt(event);
    seek(scrubTime);
    hoverAt(event);
  };
  const onProgressMove = (event: PointerEvent) => {
    hoverAt(event);
    if (!scrubbing) return;
    scrubTime = timeAt(event);
    seek(scrubTime);
  };
  const onProgressEnd = (event: PointerEvent) => {
    if (!scrubbing) return;
    scrubbing = false;
    flag(audioPlayerAttrs.scrubbing, false);
    seekBar?.releasePointerCapture?.(event.pointerId);
    paintTime();
  };

  /* The volume slider is VERTICAL (a popup above its button): the pointer is read along the block axis and the bottom is silence. */
  const volumeAt = (event: PointerEvent) => {
    const rect = volumeSlider!.getBoundingClientRect();
    return 1 - videoFractionFromPointer({ pointer: event.clientY, start: rect.top, end: rect.bottom });
  };
  const onVolumeDown = (event: PointerEvent) => {
    if (event.button !== 0 || !volumeSlider) return;
    event.preventDefault();
    volumeSlider.focus({ preventScroll: true });
    volumeSlider.setPointerCapture?.(event.pointerId);
    volumeDragging = true;
    setVolume(volumeAt(event));
  };
  const onVolumeMove = (event: PointerEvent) => {
    if (volumeDragging) setVolume(volumeAt(event));
  };
  const onVolumeEnd = (event: PointerEvent) => {
    if (!volumeDragging) return;
    volumeDragging = false;
    volumeSlider?.releasePointerCapture?.(event.pointerId);
  };

  const onWaiting = () => flag(audioPlayerAttrs.waiting, true);
  const onReady = () => flag(audioPlayerAttrs.waiting, false);
  const onPlayState = () => {
    paintState();
    if (!audio.paused && !audio.ended) startTicking();
  };
  const onEnded = () => {
    onPlayState();
    const to = audioNextIndex(index, tracks().length);
    if (index >= 0 && config.autoAdvance !== false && to !== null) load(to, { play: true });
  };
  const onTimeUpdate = () => {
    if (!scrubbing) paintTime();
  };
  const onMetadata = () => {
    paintAll();
  };

  const media: Array<[string, EventListener]> = [
    ["play", onPlayState],
    ["pause", onPlayState],
    ["ended", onEnded],
    [
      "playing",
      () => {
        onReady();
        onPlayState();
      },
    ],
    ["waiting", onWaiting],
    [
      "seeking",
      () => {
        if (!audio.paused) onWaiting();
      },
    ],
    ["seeked", onReady],
    ["canplay", onReady],
    [
      "loadeddata",
      () => {
        onReady();
        paintAll();
      },
    ],
    ["timeupdate", onTimeUpdate],
    ["progress", () => paintTime()],
    ["durationchange", onMetadata],
    ["loadedmetadata", onMetadata],
    ["volumechange", paintVolume],
    ["ratechange", paintState],
  ];
  for (const [name, handler] of media) audio.addEventListener(name, handler);

  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("click", onClick);
  seekBar?.addEventListener("pointerdown", onProgressDown);
  seekBar?.addEventListener("pointermove", onProgressMove);
  seekBar?.addEventListener("pointerup", onProgressEnd);
  seekBar?.addEventListener("pointercancel", onProgressEnd);
  seekBar?.addEventListener("pointerenter", onSeekEnter);
  seekBar?.addEventListener("pointerleave", onSeekLeave);
  volumeSlider?.addEventListener("pointerdown", onVolumeDown);
  volumeSlider?.addEventListener("pointermove", onVolumeMove);
  volumeSlider?.addEventListener("pointerup", onVolumeEnd);
  volumeSlider?.addEventListener("pointercancel", onVolumeEnd);

  /* A list loads its first track (or the one whose source the element already has) without playing it. */
  const listed = tracks();
  if (listed.length > 0) {
    const loaded = listed.findIndex((track) => track.src !== "" && track.src === audio.getAttribute("src"));
    index = loaded >= 0 ? loaded : 0;
    if (loaded < 0) {
      const first = listed[0]!;
      if (first.src) audio.setAttribute("src", first.src);
    }
  }

  /* Visibility: a player that is not near the viewport draws nothing and loads nothing; the first time it is, it catches up. */
  let intersection: IntersectionObserver | null = null;
  if (win && typeof win.IntersectionObserver === "function") {
    /* Visible until told otherwise: a player must draw itself at connect, and an observer that never reports (a test stub, a very old engine) must not leave it blank. */
    intersection = new win.IntersectionObserver(
      (entries) => {
        const nowVisible = entries[entries.length - 1]?.isIntersecting ?? false;
        if (nowVisible) upgradePreload();
        if (nowVisible === visible) return;
        visible = nowVisible;
        if (!visible) return;
        paintAll();
        if (!audio.paused && !audio.ended) startTicking();
      },
      { rootMargin: "200px" },
    );
    intersection.observe(root);
  } else {
    upgradePreload();
  }

  paintAll(true);
  if (!audio.paused) startTicking();

  const controller: AudioPlayerController = {
    audio,
    get index() {
      return index;
    },
    play,
    pause,
    toggle,
    seek,
    load,
    next,
    previous,
    configure(settings) {
      config = { ...config, ...settings };
      readDirection();
      paintAll();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame) win?.cancelAnimationFrame(frame);
      for (const [name, handler] of media) audio.removeEventListener(name, handler);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("click", onClick);
      seekBar?.removeEventListener("pointerdown", onProgressDown);
      seekBar?.removeEventListener("pointermove", onProgressMove);
      seekBar?.removeEventListener("pointerup", onProgressEnd);
      seekBar?.removeEventListener("pointercancel", onProgressEnd);
      volumeSlider?.removeEventListener("pointerdown", onVolumeDown);
      volumeSlider?.removeEventListener("pointermove", onVolumeMove);
      volumeSlider?.removeEventListener("pointerup", onVolumeEnd);
      volumeSlider?.removeEventListener("pointercancel", onVolumeEnd);
      for (const name of [
        audioPlayerAttrs.started,
        audioPlayerAttrs.playing,
        audioPlayerAttrs.ended,
        audioPlayerAttrs.waiting,
        audioPlayerAttrs.muted,
        audioPlayerAttrs.scrubbing,
        audioPlayerAttrs.wave,
        audioPlayerAttrs.hasPrevious,
        audioPlayerAttrs.hasNext,
      ]) {
        root.removeAttribute(name);
      }
      seekBar?.removeEventListener("pointerenter", onSeekEnter);
      seekBar?.removeEventListener("pointerleave", onSeekLeave);
      intersection?.disconnect();
      view.destroy();
      volumeFill?.style.removeProperty("scale");
      controllers.delete(root);
    },
  };
  controllers.set(root, controller);
  return controller;
}
