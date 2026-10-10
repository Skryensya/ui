import {
  VIDEO_PLAYER_SPEEDS,
  videoPlayerAttrs,
  videoPlayerOptions,
  videoPlayerParts as parts,
  type VideoPlayerAction,
} from "@skryensya/core/video-player";
import { connectVideoPlayer, type VideoPlayerController } from "@skryensya/core/video-player-controller";
import { useEffect, useImperativeHandle, useRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
import type { StableIconName } from "@skryensya/core/icon";
import { Icon } from "./icon.js";

export type { VideoPlayerController } from "@skryensya/core/video-player-controller";

/* Derived, never restated: the words live in the contract. */
const o = videoPlayerOptions;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type VideoPlayerProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  /** The video file. The convenience source: it renders the `<video>`. Give this or `children`, never both. */
  src?: string;
  /** The picture shown before the first play. */
  poster?: string;
  /** One WebVTT caption track, for the common case. More languages are authored `<track>`s in `children`. */
  captionsSrc?: string;
  /** The caption track's language (`en`, `es`). Also how the captions button picks which track to show. */
  captionsLang?: string;
  /** The caption track's name in the browser's own list. */
  captionsTitle?: string;
  /**
   * Authored media: a `<video>` with several sources or tracks. The player turns its native controls off and draws its
   * own, so leave `controls` out.
   */
  children?: ReactNode;
  /** The imperative handle: `play`, `pause`, `toggle`, `seek`, and the `<video>` itself. */
  controller?: Ref<VideoPlayerController | null>;
  /** The player's accessible name. Name it after the video. */
  label?: string;
  playLabel?: string;
  pauseLabel?: string;
  replayLabel?: string;
  muteLabel?: string;
  unmuteLabel?: string;
  seekLabel?: string;
  volumeLabel?: string;
  speedLabel?: string;
  captionsLabel?: string;
  fullscreenLabel?: string;
  exitFullscreenLabel?: string;
  /** The clock's name while it shows the elapsed time: what a press will do. */
  remainingLabel?: string;
  /** The clock's name while it shows what remains. */
  elapsedLabel?: string;
  /** What the seek bar says in words; `{current}` and `{duration}` are filled in. */
  timeLabel?: string;
  /** Controls leave after a few idle seconds of playback. They never leave while paused. Default true. */
  autoHide?: boolean;
  /** Seconds a `j` or `l` moves. Default 10. */
  skip?: number;
  /** The rates the speed button steps through. */
  speeds?: readonly number[];
};

/**
 * A skin and a keyboard over a real `<video>`.
 *
 * It renders the contract's markup around the video you give it and runs `connectVideoPlayer` on it in an effect, exactly
 * as the Vanilla enhancer runs it on authored markup; every behaviour (the keys, the seek bar, the idle controls, the
 * words that change) is that controller's, so the two bindings cannot disagree. The element keeps its job: the chrome is
 * painted from what the `<video>` reports, never the other way round.
 */
export function VideoPlayer({
  autoHide = o.autoHide.default,
  captionsLabel = o.captionsLabel.default,
  captionsLang,
  captionsSrc,
  captionsTitle,
  children,
  className,
  controller,
  elapsedLabel = o.elapsedLabel.default,
  exitFullscreenLabel = o.exitFullscreenLabel.default,
  fullscreenLabel = o.fullscreenLabel.default,
  label = o.label.default,
  muteLabel = o.muteLabel.default,
  pauseLabel = o.pauseLabel.default,
  remainingLabel = o.remainingLabel.default,
  playLabel = o.playLabel.default,
  poster,
  replayLabel = o.replayLabel.default,
  seekLabel = o.seekLabel.default,
  skip = o.skip.default,
  src,
  speedLabel = o.speedLabel.default,
  speeds = VIDEO_PLAYER_SPEEDS,
  timeLabel = o.timeLabel.default,
  unmuteLabel = o.unmuteLabel.default,
  volumeLabel = o.volumeLabel.default,
  ...props
}: VideoPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<VideoPlayerController | null>(null);
  /* A proxy, not the controller: the controller is created after mount and replaced when the video is swapped. */
  useImperativeHandle(
    controller,
    () => ({
      get video() {
        return controllerRef.current?.video ?? null;
      },
      play: async () => controllerRef.current?.play(),
      pause: () => controllerRef.current?.pause(),
      toggle: () => controllerRef.current?.toggle(),
      seek: (seconds: number) => controllerRef.current?.seek(seconds),
      configure: (next) => controllerRef.current?.configure(next),
      destroy: () => {},
    }),
    [],
  );

  const settings = {
    autoHide,
    skip,
    speeds,
    labels: {
      play: playLabel,
      pause: pauseLabel,
      replay: replayLabel,
      mute: muteLabel,
      unmute: unmuteLabel,
      speed: speedLabel,
      fullscreen: fullscreenLabel,
      exitFullscreen: exitFullscreenLabel,
      remaining: remainingLabel,
      elapsed: elapsedLabel,
      time: timeLabel,
    },
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  /*
   * The video is the author's and may be swapped for another element, so the controller follows the element it finds, not
   * the render: it is reconnected only when that element changes, and settings follow the props on every render.
   */
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const video = root.querySelector<HTMLVideoElement>(`.${parts.stage} video`);
    if (video !== videoRef.current) {
      controllerRef.current?.destroy();
      videoRef.current = video;
      controllerRef.current = connectVideoPlayer(root, settingsRef.current);
    } else {
      controllerRef.current?.configure(settingsRef.current);
    }
  });
  useEffect(
    () => () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
      videoRef.current = null;
    },
    [],
  );

  return (
    <div
      {...props}
      ref={rootRef}
      role="group"
      tabIndex={-1}
      aria-label={label}
      className={cx(parts.root, className)}
      {...(autoHide ? {} : { [videoPlayerAttrs.autoHide]: "false" })}
    >
      <div className={parts.stage}>
        {src !== undefined ? (
          <video className={parts.media} playsInline poster={poster} preload="none" src={src} {...{ [videoPlayerAttrs.deferLoad]: "" }}>
            {captionsSrc !== undefined ? (
              <track kind="captions" label={captionsTitle} src={captionsSrc} srcLang={captionsLang} />
            ) : null}
          </video>
        ) : null}
        {children}
      </div>
      <div aria-hidden="true" className={parts.captions} />
      <span aria-hidden="true" className={`${parts.loader} sk-loader`} data-size="lg" />
      <button
        aria-label={playLabel}
        className={`${parts.big} sk-button sk-interactive sk-icon-toggle`}
        data-icon-only=""
        data-size="lg"
        data-variant="solid"
        {...{ [videoPlayerAttrs.action]: "play", [videoPlayerAttrs.labelReplay]: replayLabel }}
        type="button"
      >
        <Face icon="play" name="play" />
        <Face icon="replay" name="replay" />
      </button>
      <div className={parts.controls}>
        <div
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={0}
          aria-label={seekLabel}
          className={parts.seek}
          role="slider"
          tabIndex={0}
          {...{ [videoPlayerAttrs.timeLabel]: timeLabel }}
        >
          <div className={parts.track}>
            <div className={parts.buffered} />
            <div className={parts.played} />
          </div>
          <div className={parts.thumb} />
          <span aria-hidden="true" className={parts.tip} />
        </div>
        <div className={parts.bar}>
          <Control
            action="play"
            keys="k"
            label={playLabel}
            extra={{ [videoPlayerAttrs.labelPause]: pauseLabel, [videoPlayerAttrs.labelReplay]: replayLabel }}
          >
            <Face icon="play" name="play" />
            <Face icon="pause" name="pause" />
            <Face icon="replay" name="replay" />
          </Control>
          <div className={parts.volume}>
            <Control action="mute" keys="m" label={muteLabel} extra={{ [videoPlayerAttrs.labelUnmute]: unmuteLabel }}>
              <Face icon="volume" name="volume" />
              <Face icon="volume-muted" name="muted" />
            </Control>
            <div
              aria-label={volumeLabel}
              aria-orientation="vertical"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={0}
              className={parts.volumeSlider}
              role="slider"
              tabIndex={0}
            >
              <div className={parts.volumeFill} />
            </div>
          </div>
          <button
            aria-label={remainingLabel}
            className={`${parts.time} sk-button sk-interactive`}
            data-size="sm"
            data-variant="ghost"
            type="button"
            {...{ [videoPlayerAttrs.action]: "time", [videoPlayerAttrs.labelElapsed]: elapsedLabel }}
          >
            <span className={parts.current} />
            <span className={parts.duration} />
          </button>
          <span aria-hidden="true" className={parts.spacer} />
          <button
            aria-keyshortcuts="Shift+, Shift+."
            aria-label={speedLabel}
            className={`${parts.control} sk-button sk-interactive`}
            data-size="sm"
            data-variant="ghost"
            type="button"
            {...{ [videoPlayerAttrs.action]: "speed" }}
          >
            <span className={parts.speed} />
          </button>
          <Control action="captions" hidden keys="c" label={captionsLabel}>
            <Face icon="captions" name="captions" />
          </Control>
          <Control
            action="fullscreen"
            keys="f"
            label={fullscreenLabel}
            extra={{ [videoPlayerAttrs.labelExitFullscreen]: exitFullscreenLabel }}
          >
            <Face icon="fullscreen" name="enter" />
            <Face icon="fullscreen-exit" name="exit" />
          </Control>
        </div>
      </div>
    </div>
  );
}

function Face({ icon, name }: { icon: StableIconName; name: string }) {
  return <Icon data-face={name} name={icon} size="md" />;
}

function Control({
  action,
  children,
  extra,
  hidden,
  keys,
  label,
}: {
  action: VideoPlayerAction;
  children: ReactNode;
  extra?: Record<string, string>;
  hidden?: boolean;
  keys: string;
  label: string;
}) {
  return (
    <button
      aria-keyshortcuts={keys}
      aria-label={label}
      className={`${parts.control} sk-button sk-interactive sk-icon-toggle`}
      data-icon-only=""
      data-size="sm"
      data-variant="ghost"
      hidden={hidden}
      type="button"
      {...{ [videoPlayerAttrs.action]: action, ...extra }}
    >
      {children}
    </button>
  );
}
