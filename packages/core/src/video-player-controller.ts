import { isTypingContext } from "./hotkey.js";
import { createProgressView } from "./media-progress.js";
import {
  VIDEO_PLAYER_FRAME_SECONDS,
  VIDEO_PLAYER_IDLE_MS,
  VIDEO_PLAYER_SKIP,
  VIDEO_PLAYER_SPEEDS,
  formatVideoRemaining,
  formatVideoSpeed,
  formatVideoTime,
  formatVideoTimeLabel,
  parseVideoSpeeds,
  videoCueText,
  videoControlsHidden,
  videoFiniteTime,
  videoFrameSeconds,
  videoFraction,
  videoFractionFromPointer,
  videoKeyAction,
  videoNextSpeed,
  videoPlayerAttrs,
  videoPlayerParts,
  videoSeekBy,
  videoTimeFromPointer,
  videoTimeText,
  videoVolumeBy,
  type VideoKeyAction,
  type VideoKeyTarget,
} from "./video-player.js";

/*
 * VIDEO PLAYER, the controller: the one place a player's behaviour is wired, for Lightbox's reason. It is DOM-touching and
 * framework-free; the Vanilla enhancer calls it on authored markup and the React component calls it in an effect on the
 * markup it rendered, so the two cannot disagree about what a key does.
 *
 * WHAT IT WRITES, and nothing else: the state flags on the root (`data-playing`, `data-waiting`, ...), four custom
 * properties the sheet draws the fills from, the aria values of the two sliders, the words of the buttons whose name
 * changes, the clock's text, the speed button's text, `hidden` on the captions button, and `controls = false` on the author's `<video>`. React renders none of those.
 *
 * THE ELEMENT IS THE SOURCE OF TRUTH. Every handler calls the element and does not touch the chrome; the chrome is
 * painted from what the element then reports. A press on Pause is therefore never a lie: the button changes when the
 * `pause` event arrives, which is also what happens when the page, the operating system or another script pauses it.
 */

/** The words of every control whose name changes, and the sentence the seek bar speaks. Missing ones are read from the markup. */
export type VideoPlayerLabels = {
  readonly play?: string;
  readonly pause?: string;
  readonly replay?: string;
  readonly mute?: string;
  readonly unmute?: string;
  readonly speed?: string;
  readonly fullscreen?: string;
  readonly exitFullscreen?: string;
  readonly remaining?: string;
  readonly elapsed?: string;
  readonly time?: string;
};

export type VideoPlayerConfig = {
  /** Controls leave after a few idle seconds of playback. Default true. */
  readonly autoHide?: boolean;
  /** Seconds a `j` or `l` moves. */
  readonly skip?: number;
  /** The rates the speed button steps through. */
  readonly speeds?: readonly number[];
  /** Milliseconds of idleness before the controls leave. */
  readonly idleAfter?: number;
  /** The language the time is spoken in; the nearest `lang` by default. */
  readonly locale?: string;
  readonly labels?: VideoPlayerLabels;
};

export type VideoPlayerController = {
  /** The author's `<video>`, or null if the markup has none. */
  readonly video: HTMLVideoElement | null;
  play(): Promise<void>;
  pause(): void;
  toggle(): void;
  seek(seconds: number): void;
  /** New settings (React calls this on every render); repaints. */
  configure(config: VideoPlayerConfig): void;
  destroy(): void;
};

const controllers = new WeakMap<Element, VideoPlayerController>();

/** The controller of a connected player, by its element. */
export function getVideoPlayerController(root: Element): VideoPlayerController | null {
  return controllers.get(root) ?? null;
}

const partSelector = (part: keyof typeof videoPlayerParts) => `.${videoPlayerParts[part]}`;

/** Reads the settings an author wrote on the root. */
export function readVideoPlayerConfig(root: HTMLElement): VideoPlayerConfig {
  const skip = Number.parseFloat(root.getAttribute(videoPlayerAttrs.skip) ?? "");
  return {
    autoHide: root.getAttribute(videoPlayerAttrs.autoHide) !== "false",
    skip: Number.isFinite(skip) && skip > 0 ? skip : undefined,
    speeds: parseVideoSpeeds(root.getAttribute(videoPlayerAttrs.speeds)),
  };
}

export function connectVideoPlayer(root: HTMLElement, initial: VideoPlayerConfig = {}): VideoPlayerController {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const video = root.querySelector<HTMLVideoElement>(`${partSelector("stage")} video`);
  const q = <T extends HTMLElement>(part: keyof typeof videoPlayerParts) => root.querySelector<T>(partSelector(part));
  const stage = q("stage");
  const controls = q("controls");
  const seekBar = q("seek");
  const volumeSlider = q("volumeSlider");
  const tip = q("tip");
  const captionsText = q("captions");
  const current = q("current");
  const duration = q("duration");
  const speedText = q("speed");
  const played = q("played");
  const bufferedFill = q("buffered");
  const thumb = q("thumb");
  const volumeFill = q("volumeFill");
  const actionButtons = (action: string) =>
    [...root.querySelectorAll<HTMLButtonElement>(`[${videoPlayerAttrs.action}="${action}"]`)];
  const playButtons = actionButtons("play");
  const muteButton = actionButtons("mute")[0];
  const speedButton = actionButtons("speed")[0];
  const captionsButton = actionButtons("captions")[0];
  const fullscreenButton = actionButtons("fullscreen")[0];
  const timeButton = actionButtons("time")[0];

  let config: VideoPlayerConfig = { ...readVideoPlayerConfig(root), ...initial };
  let destroyed = false;
  let scrubbing = false;
  let scrubTime = 0;
  let volumeDragging = false;
  /* The clock shows what remains instead of what has played, until the reader presses it again. */
  let showRemaining = false;
  /* One frame's length: 30 fps until a few presented frames say what this video really runs at. */
  let frameSeconds = VIDEO_PLAYER_FRAME_SECONDS;
  const frameGaps: number[] = [];
  let lastFrameTime = -1;
  let frameWatch = 0;
  let pointerOver = false;
  let lastActivity = Date.now();
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;
  /* Asking the browser for the direction or a bar's box costs a style recalculation or a layout, so each is asked once and kept. */
  let rtl = false;
  let seekRect: DOMRect | null = null;
  /* A player off screen paints nothing: its loop stops and its events skip the drawing, and it catches up when it comes back. */
  let visible = true;

  if (!video) {
    const inert: VideoPlayerController = {
      video: null,
      play: async () => {},
      pause: () => {},
      toggle: () => {},
      seek: () => {},
      configure: () => {},
      destroy: () => {},
    };
    return inert;
  }

  /* The chrome replaces the native controls; leaving both would draw two bars. */
  video.controls = false;
  video.removeAttribute("controls");
  video.playsInline = true;
  if (!video.hasAttribute("preload")) video.preload = "metadata";
  /*
   * LOAD ONLY WHAT IS NEAR. Media the contract renders starts with `preload="none"` and `data-defer-load`; the first time its
   * player is near the viewport it is upgraded to `metadata`. The poster is not affected: it loads on its own. Media the author
   * wrote keeps whatever preload they chose.
   */
  const upgradePreload = () => {
    if (!video.hasAttribute(videoPlayerAttrs.deferLoad)) return;
    video.removeAttribute(videoPlayerAttrs.deferLoad);
    video.preload = "metadata";
  };

  /* The words each toggle starts with are what the markup carries. Read once; `config.labels` wins when given. */
  const authored = (button: Element | undefined, attr: string) => button?.getAttribute(attr) ?? undefined;
  const primary = {
    play: playButtons[0]?.getAttribute("aria-label") ?? "Play",
    mute: muteButton?.getAttribute("aria-label") ?? "Mute",
    speed: speedButton?.getAttribute("aria-label") ?? "Playback speed",
    fullscreen: fullscreenButton?.getAttribute("aria-label") ?? "Full screen",
    remaining: timeButton?.getAttribute("aria-label") ?? "Show remaining time",
  };
  const labels = () => ({
    play: config.labels?.play ?? primary.play,
    pause: config.labels?.pause ?? authored(playButtons[0], videoPlayerAttrs.labelPause) ?? "Pause",
    replay: config.labels?.replay ?? authored(playButtons[0], videoPlayerAttrs.labelReplay) ?? "Replay",
    mute: config.labels?.mute ?? primary.mute,
    unmute: config.labels?.unmute ?? authored(muteButton, videoPlayerAttrs.labelUnmute) ?? "Unmute",
    speed: config.labels?.speed ?? primary.speed,
    fullscreen: config.labels?.fullscreen ?? primary.fullscreen,
    exitFullscreen: config.labels?.exitFullscreen ?? authored(fullscreenButton, videoPlayerAttrs.labelExitFullscreen) ?? "Exit full screen",
    remaining: config.labels?.remaining ?? primary.remaining,
    elapsed: config.labels?.elapsed ?? authored(timeButton, videoPlayerAttrs.labelElapsed) ?? "Show elapsed time",
    time: config.labels?.time ?? seekBar?.getAttribute(videoPlayerAttrs.timeLabel) ?? "{current} of {duration}",
  });

  const locale = () => config.locale || root.closest("[lang]")?.getAttribute("lang") || doc.documentElement.lang || undefined;
  const speeds = () => (config.speeds && config.speeds.length > 0 ? config.speeds : [...VIDEO_PLAYER_SPEEDS]);
  const flag = (name: string, on: boolean) => root.toggleAttribute(name, on);
  const isFullscreen = () => doc.fullscreenElement === root;
  const captionTracks = () =>
    /* `textTracks` is absent in jsdom and in the odd embedded webview; no tracks is a true answer there. */
    Array.from(video.textTracks ?? []).filter((track) => track.kind === "captions" || track.kind === "subtitles");
  /* The track whose cues the player is drawing. Tracks are never left `showing`: the browser would paint them too. */
  let captionTrack: TextTrack | null = null;
  const captionsOn = () => captionTrack !== null;
  const drawCue = () => {
    if (!captionsText) return;
    const cues = captionTrack ? Array.from(captionTrack.activeCues ?? []) : [];
    captionsText.textContent = cues.map((cue) => videoCueText((cue as VTTCue).text ?? "")).join("\n");
  };
  const setCaptions = (next: TextTrack | null) => {
    if (next === captionTrack) return;
    captionTrack?.removeEventListener?.("cuechange", drawCue);
    for (const track of captionTracks()) track.mode = track === next ? "hidden" : "disabled";
    captionTrack = next;
    captionTrack?.addEventListener?.("cuechange", drawCue);
    drawCue();
    paintState();
  };
  const readDirection = () => {
    rtl = win?.getComputedStyle(root).direction === "rtl";
  };
  readDirection();
  const dir = () => (rtl ? "rtl" : "ltr");

  /* ---- paint: the chrome as a view of the element ---- */

  /* Where the buffered data ends from `time`: the end of the range that holds it, else `time` itself. No arrays, since this runs every frame. */
  const bufferedEndAt = (time: number) => {
    const ranges = video.buffered as TimeRanges | undefined;
    for (let i = 0; ranges && i < ranges.length; i += 1) {
      if (time >= ranges.start(i) && time <= ranges.end(i)) return ranges.end(i);
    }
    return time;
  };

  const view = createProgressView(
    { seek: seekBar, played, buffered: bufferedFill, thumb, waveFill: null, tip, current, duration },
    {
      win,
      rtl: () => rtl,
      /* This thumb is anchored from the bottom edge of the bar, so it is lifted by half its height, not centred. */
      thumbY: "50%",
      currentText: (now, total) => (showRemaining ? formatVideoRemaining(now, total) : formatVideoTime(now)),
      describe: (now, total) => formatVideoTimeLabel(labels().time, videoTimeText(now, locale()), videoTimeText(total, locale())),
    },
  );

  /* `force` is the connect-time paint, before the first visibility report has said anything. */
  const paintTime = (force = false) => {
    if (!visible && !force) return;
    const total = videoFiniteTime(video.duration);
    const now = scrubbing ? scrubTime : videoFiniteTime(video.currentTime);
    view.update(now, total, bufferedEndAt(now));
  };

  const paintVolume = () => {
    const silent = video.muted || video.volume === 0;
    const level = silent ? 0 : video.volume;
    if (volumeFill) volumeFill.style.scale = `1 ${level}`;
    flag(videoPlayerAttrs.muted, silent);
    if (volumeSlider) {
      volumeSlider.setAttribute("aria-valuenow", String(Math.round(level * 100)));
      volumeSlider.setAttribute("aria-valuetext", `${Math.round(level * 100)}%`);
    }
    if (muteButton) {
      muteButton.setAttribute("aria-label", silent ? labels().unmute : labels().mute);
    }
  };

  const paintState = () => {
    const playing = !video.paused && !video.ended;
    flag(videoPlayerAttrs.playing, playing);
    flag(videoPlayerAttrs.ended, video.ended);
    if (!video.paused || video.currentTime > 0 || video.ended) flag(videoPlayerAttrs.started, true);
    flag(videoPlayerAttrs.fullscreen, isFullscreen());
    const word = video.ended ? labels().replay : playing ? labels().pause : labels().play;
    for (const button of playButtons) {
      /* The big button only ever offers the start: it is gone while the media plays. */
      const big = button.classList.contains(videoPlayerParts.big);
      button.setAttribute("aria-label", big && playing ? labels().play : word);
    }
    if (fullscreenButton) {
      fullscreenButton.setAttribute("aria-label", isFullscreen() ? labels().exitFullscreen : labels().fullscreen);
    }
    if (timeButton) {
      /* The name is what a press does next, and the visible clock is the rest of the story. */
      timeButton.setAttribute("aria-label", showRemaining ? labels().elapsed : labels().remaining);
      flag(videoPlayerAttrs.remaining, showRemaining);
    }
    if (speedButton) {
      const text = formatVideoSpeed(video.playbackRate);
      if (speedText) speedText.textContent = text;
      /* The visible "1×" is part of the name, so a voice user can say what they see. */
      speedButton.setAttribute("aria-label", `${labels().speed}: ${text}`);
    }
    if (captionsButton) {
      captionsButton.hidden = captionTracks().length === 0;
      captionsButton.setAttribute("aria-pressed", String(captionsOn()));
    }
  };

  const paintAll = (force = false) => {
    view.invalidate();
    paintState();
    paintTime(force);
    paintVolume();
  };

  /* A frame loop while playing: `timeupdate` fires a few times a second, which makes the fill step instead of glide. */
  const tick = () => {
    frame = 0;
    /* Off screen there is nothing to draw: the loop ends here and `visible` starting it again is what resumes it. */
    if (destroyed || !visible) return;
    paintTime();
    if (!video.paused && !video.ended) frame = win?.requestAnimationFrame(tick) ?? 0;
  };
  const startTicking = () => {
    if (!frame && win) frame = win.requestAnimationFrame(tick);
  };

  /* ---- idle controls ---- */

  const focusWithin = () => {
    try {
      return Boolean(controls?.matches(":has(:focus-visible)"));
    } catch {
      return false;
    }
  };
  const evaluateIdle = () => {
    idleTimer = undefined;
    const idleAfter = config.idleAfter ?? VIDEO_PLAYER_IDLE_MS;
    const idleFor = Date.now() - lastActivity;
    const hidden = videoControlsHidden({
      autoHide: config.autoHide !== false,
      playing: !video.paused && !video.ended,
      focusWithin: focusWithin(),
      pointerOver,
      scrubbing: scrubbing || volumeDragging,
      idleFor,
      idleAfter,
    });
    flag(videoPlayerAttrs.idle, hidden);
    if (!hidden && !video.paused && !video.ended && config.autoHide !== false) {
      idleTimer = setTimeout(evaluateIdle, Math.max(100, idleAfter - idleFor));
    }
  };
  /*
   * This runs on EVERY pointer move, press and focus, so it must be nearly free: it notes the time and arms ONE timer if none is
   * pending. It used to clear and create a timer per call. `evaluateIdle` already measures from `lastActivity` and re-arms for
   * what is left, so a timer set earlier is correct when it fires.
   */
  const reveal = () => {
    lastActivity = Date.now();
    if (root.hasAttribute(videoPlayerAttrs.idle)) flag(videoPlayerAttrs.idle, false);
    if (!idleTimer) idleTimer = setTimeout(evaluateIdle, config.idleAfter ?? VIDEO_PLAYER_IDLE_MS);
  };

  /* ---- acting on the element ---- */

  const play = async () => {
    try {
      if (video.ended) video.currentTime = 0;
      await video.play();
    } catch {
      /* Autoplay policy or a source that failed: the element's own events say so, and the chrome follows them. */
    }
  };
  const pause = () => video.pause();
  const toggle = () => {
    if (video.paused || video.ended) void play();
    else pause();
  };
  const seek = (seconds: number) => {
    const total = videoFiniteTime(video.duration);
    video.currentTime = total > 0 ? Math.min(Math.max(seconds, 0), total) : Math.max(seconds, 0);
    paintTime();
  };
  const setVolume = (fraction: number) => {
    const level = Math.min(Math.max(fraction, 0), 1);
    video.volume = level;
    video.muted = level === 0;
  };
  const toggleMute = () => {
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) video.volume = 0.5;
    } else {
      video.muted = true;
    }
  };
  const stepSpeed = (direction: 1 | -1, wrap: boolean) => {
    video.playbackRate = videoNextSpeed(speeds(), video.playbackRate, direction, wrap);
  };
  const toggleCaptions = () => {
    const tracks = captionTracks();
    if (tracks.length === 0) return;
    if (captionsOn()) {
      setCaptions(null);
      return;
    }
    const lang = locale()?.slice(0, 2).toLowerCase();
    setCaptions(tracks.find((track) => lang && track.language.toLowerCase().startsWith(lang)) ?? tracks[0]!);
  };
  const toggleFullscreen = () => {
    if (isFullscreen()) {
      void doc.exitFullscreen?.().catch(() => {});
      return;
    }
    if (root.requestFullscreen) {
      void root.requestFullscreen().catch(() => {});
      return;
    }
    /* iOS Safari fullscreens a `<video>` and nothing else; the native player is the only one it has. */
    (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
  };

  const perform = (action: VideoKeyAction) => {
    switch (action.kind) {
      case "toggle":
        toggle();
        break;
      case "seek-by":
        seek(videoSeekBy(video.currentTime, action.seconds, video.duration));
        break;
      case "seek-to":
        seek(action.fraction * videoFiniteTime(video.duration));
        break;
      case "seek-end":
        seek(videoFiniteTime(video.duration));
        break;
      case "volume-by":
        setVolume(videoVolumeBy(video.muted ? 0 : video.volume, action.percent));
        break;
      case "volume-to":
        setVolume(action.fraction);
        break;
      case "mute":
        toggleMute();
        break;
      case "fullscreen":
        toggleFullscreen();
        break;
      case "captions":
        toggleCaptions();
        break;
      case "speed":
        stepSpeed(action.direction, false);
        break;
      case "frame":
        /* Stepping a running video pauses it first: the step is the point, and a frame on the way past is not one. */
        if (!video.paused) pause();
        seek(videoSeekBy(video.currentTime, action.direction * frameSeconds, video.duration));
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
    reveal();
    if (isTypingContext(event.target)) return;
    const action = videoKeyAction({
      key: event.key,
      target: keyTarget(event.target),
      paused: video.paused,
      skip: config.skip ?? VIDEO_PLAYER_SKIP,
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
    const button = target.closest<HTMLElement>(`[${videoPlayerAttrs.action}]`);
    if (button && root.contains(button)) {
      switch (button.getAttribute(videoPlayerAttrs.action)) {
        case "play":
          toggle();
          /* The big button leaves once the media plays, and a focused control that disappears drops the focus on the page: the keys would stop answering. The bar's own play button is where it goes. */
          if (button.classList.contains(videoPlayerParts.big)) {
            playButtons.find((candidate) => candidate !== button)?.focus({ preventScroll: true });
          }
          break;
        case "mute":
          toggleMute();
          break;
        case "speed":
          stepSpeed(1, true);
          break;
        case "captions":
          toggleCaptions();
          break;
        case "fullscreen":
          toggleFullscreen();
          break;
        case "time":
          showRemaining = !showRemaining;
          /* The displayed second has not changed, so the clock must be told to write what it now says. */
          view.invalidate();
          paintTime();
          paintState();
          break;
      }
      return;
    }
    /* A press on the picture plays and pauses; one on the bar belongs to the bar. */
    if (stage?.contains(target) && !controls?.contains(target)) {
      toggle();
      /* A press on the picture is where a reader starts using the keys. */
      if (!root.contains(doc.activeElement) || doc.activeElement === doc.body) root.focus({ preventScroll: true });
    }
  };

  const onDoubleClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target && stage?.contains(target)) toggleFullscreen();
  };

  /* The seek bar: a press moves the thumb there and follows the pointer until it lifts. */
  const timeAt = (event: PointerEvent) => {
    /* The bar's box is read once per interaction, on enter and on press, not on every move: reading it forces a layout. */
    const rect = (seekRect ??= seekBar!.getBoundingClientRect());
    return videoTimeFromPointer({
      pointer: event.clientX,
      start: rect.left,
      end: rect.right,
      duration: video.duration,
      rtl: dir() === "rtl",
    });
  };
  const hoverAt = (event: PointerEvent) => {
    if (!seekBar) return;
    const time = timeAt(event);
    const total = videoFiniteTime(video.duration);
    view.hover(videoFraction(time, total), time);
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
    flag(videoPlayerAttrs.scrubbing, true);
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
    flag(videoPlayerAttrs.scrubbing, false);
    seekBar?.releasePointerCapture?.(event.pointerId);
    paintTime();
    reveal();
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

  const onActivity = () => reveal();
  const onControlsEnter = () => {
    pointerOver = true;
    reveal();
  };
  const onControlsLeave = () => {
    pointerOver = false;
    reveal();
  };
  const onFullscreenChange = () => paintState();
  const onWaiting = () => flag(videoPlayerAttrs.waiting, true);
  const onReady = () => flag(videoPlayerAttrs.waiting, false);
  /* Measures the frame rate from the frames the browser really presents, where it can say so (`requestVideoFrameCallback`). */
  type FrameVideo = HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: (now: number, metadata: { mediaTime: number }) => void) => number;
    cancelVideoFrameCallback?: (handle: number) => void;
  };
  const watchFrame = (_now: number, metadata: { mediaTime: number }) => {
    frameWatch = 0;
    if (destroyed) return;
    if (lastFrameTime >= 0) {
      frameGaps.push(metadata.mediaTime - lastFrameTime);
      if (frameGaps.length > 30) frameGaps.shift();
      frameSeconds = videoFrameSeconds(frameGaps);
    }
    lastFrameTime = metadata.mediaTime;
    if (!video.paused) frameWatch = (video as FrameVideo).requestVideoFrameCallback?.(watchFrame) ?? 0;
  };
  const startFrameWatch = () => {
    const v = video as FrameVideo;
    if (frameWatch || !v.requestVideoFrameCallback) return;
    lastFrameTime = -1;
    frameWatch = v.requestVideoFrameCallback(watchFrame);
  };
  const stopFrameWatch = () => {
    if (frameWatch) (video as FrameVideo).cancelVideoFrameCallback?.(frameWatch);
    frameWatch = 0;
  };

  const onPlayState = () => {
    if (video.paused || video.ended) stopFrameWatch();
    else startFrameWatch();
    paintState();
    if (!video.paused && !video.ended) startTicking();
    reveal();
  };
  const onTimeUpdate = () => {
    if (!scrubbing) paintTime();
  };

  const media: Array<[string, EventListener]> = [
    ["play", onPlayState],
    ["pause", onPlayState],
    ["ended", onPlayState],
    ["playing", () => { onReady(); onPlayState(); }],
    ["waiting", onWaiting],
    ["seeking", () => { if (!video.paused) onWaiting(); }],
    ["seeked", onReady],
    ["canplay", onReady],
    ["loadeddata", () => { onReady(); paintAll(); }],
    ["timeupdate", onTimeUpdate],
    ["progress", () => paintTime()],
    ["durationchange", () => paintTime()],
    ["loadedmetadata", () => paintAll()],
    ["volumechange", paintVolume],
    ["ratechange", paintState],
  ];
  for (const [name, handler] of media) video.addEventListener(name, handler);
  const trackList = typeof video.textTracks?.addEventListener === "function" ? video.textTracks : null;
  trackList?.addEventListener("addtrack", paintState);
  trackList?.addEventListener("removetrack", paintState);
  trackList?.addEventListener("change", paintState);
  doc.addEventListener("fullscreenchange", onFullscreenChange);

  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("click", onClick);
  root.addEventListener("dblclick", onDoubleClick);
  root.addEventListener("pointermove", onActivity);
  root.addEventListener("pointerdown", onActivity);
  root.addEventListener("focusin", onActivity);
  controls?.addEventListener("pointerenter", onControlsEnter);
  controls?.addEventListener("pointerleave", onControlsLeave);
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

  /* A track the author marked `default` arrives `showing`: it is ours to draw from now on. */
  const authoredShowing = captionTracks().find((track) => track.mode === "showing");
  if (authoredShowing) setCaptions(authoredShowing);

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
        if (!video.paused && !video.ended) startTicking();
      },
      { rootMargin: "200px" },
    );
    intersection.observe(root);
  } else {
    upgradePreload();
  }

  paintAll(true);
  if (!video.paused) {
    startTicking();
    startFrameWatch();
  }

  const controller: VideoPlayerController = {
    video,
    play,
    pause,
    toggle,
    seek,
    configure(next) {
      config = { ...config, ...next };
      readDirection();
      paintAll();
      reveal();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (idleTimer) clearTimeout(idleTimer);
      if (frame) win?.cancelAnimationFrame(frame);
      stopFrameWatch();
      captionTrack?.removeEventListener?.("cuechange", drawCue);
      if (captionsText) captionsText.textContent = "";
      for (const [name, handler] of media) video.removeEventListener(name, handler);
      trackList?.removeEventListener("addtrack", paintState);
      trackList?.removeEventListener("removetrack", paintState);
      trackList?.removeEventListener("change", paintState);
      doc.removeEventListener("fullscreenchange", onFullscreenChange);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("click", onClick);
      root.removeEventListener("dblclick", onDoubleClick);
      root.removeEventListener("pointermove", onActivity);
      root.removeEventListener("pointerdown", onActivity);
      root.removeEventListener("focusin", onActivity);
      controls?.removeEventListener("pointerenter", onControlsEnter);
      controls?.removeEventListener("pointerleave", onControlsLeave);
      seekBar?.removeEventListener("pointerdown", onProgressDown);
      seekBar?.removeEventListener("pointermove", onProgressMove);
      seekBar?.removeEventListener("pointerup", onProgressEnd);
      seekBar?.removeEventListener("pointercancel", onProgressEnd);
      volumeSlider?.removeEventListener("pointerdown", onVolumeDown);
      volumeSlider?.removeEventListener("pointermove", onVolumeMove);
      volumeSlider?.removeEventListener("pointerup", onVolumeEnd);
      volumeSlider?.removeEventListener("pointercancel", onVolumeEnd);
      for (const name of [
        videoPlayerAttrs.started,
        videoPlayerAttrs.playing,
        videoPlayerAttrs.ended,
        videoPlayerAttrs.waiting,
        videoPlayerAttrs.muted,
        videoPlayerAttrs.fullscreen,
        videoPlayerAttrs.remaining,
        videoPlayerAttrs.idle,
        videoPlayerAttrs.scrubbing,
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
