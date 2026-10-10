import {
  audioPlayerAttrs,
  audioPlayerOptions,
  audioPlayerParts as parts,
  type AudioPlayerAction,
} from "@skryensya/core/audio-player";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import type { audioPlayerContract } from "@skryensya/core/audio-player";
import { connectAudioPlayer, type AudioPlayerController } from "@skryensya/core/audio-player-controller";
import { VIDEO_PLAYER_SPEEDS } from "@skryensya/core/video-player";
import { useEffect, useImperativeHandle, useRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
import type { StableIconName } from "@skryensya/core/icon";
import { Icon } from "./icon.js";

export type { AudioPlayerController } from "@skryensya/core/audio-player-controller";

/* Derived, never restated: the words live in the contract. */
const o = audioPlayerOptions;

type AudioPlayerVariant = SignatureOptionsOf<typeof audioPlayerContract, "AudioPlayer">["variant"];

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type AudioPlayerTrack = {
  /** The audio file of this track. */
  src: string;
  title: string;
  artist?: string;
  /** The cover image of this track. */
  cover?: string;
  /** Seconds, when known before the file loads, so the list can show it. */
  duration?: number;
  /** This track's waveform: numbers from 0 to 1. */
  peaks?: string | readonly number[];
};

export type AudioPlayerProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  /** The sound. The convenience source: it renders the `<audio>`. Give this, `tracks` or `children`. */
  src?: string;
  /** The track's name, shown above the controls. */
  title?: string;
  artist?: string;
  /** The cover image. Decorative: the title beside it is the name. */
  cover?: string;
  /** The waveform: numbers from 0 to 1, as a list or as the text `"0.2 0.8 0.5"`. Absent, the seek bar is a plain track. */
  peaks?: string | readonly number[];
  /** `bar` is one strip; `card` stacks the cover, the words and the controls. */
  variant?: AudioPlayerVariant;
  /** A playlist. The first track is loaded; previous and next appear, and the next one starts when one ends. */
  tracks?: readonly AudioPlayerTrack[];
  /** Authored media: an `<audio>` with several sources. The player turns its native controls off, so leave `controls` out. */
  children?: ReactNode;
  /** The imperative handle: `play`, `pause`, `toggle`, `seek`, `load`, `next`, `previous` and the `<audio>` itself. */
  controller?: Ref<AudioPlayerController | null>;
  /** The player's accessible name. Name it after what it plays. */
  label?: string;
  playLabel?: string;
  pauseLabel?: string;
  replayLabel?: string;
  muteLabel?: string;
  unmuteLabel?: string;
  seekLabel?: string;
  volumeLabel?: string;
  speedLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  tracksLabel?: string;
  /** What the seek bar says in words; `{current}` and `{duration}` are filled in. */
  timeLabel?: string;
  /** When a track ends, the next one starts. Default true. */
  autoAdvance?: boolean;
  /** Seconds a `j` or `l` moves. Default 10. */
  skip?: number;
  /** The rates the speed button steps through. */
  speeds?: readonly number[];
};

type AudioPlayerSettings = Parameters<AudioPlayerController["configure"]>[0];

/**
 * The one place the controller is wired to a rendered root, for both signatures: connected when the audio element appears
 * (and again if it is swapped for another), reconfigured on every render, destroyed on unmount.
 */
function useAudioPlayerController(controller: Ref<AudioPlayerController | null> | undefined, settings: AudioPlayerSettings) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AudioPlayerController | null>(null);
  /* A proxy, not the controller: the controller is created after mount and replaced when the audio is swapped. */
  useImperativeHandle(
    controller,
    () => ({
      get audio() {
        return controllerRef.current?.audio ?? null;
      },
      get index() {
        return controllerRef.current?.index ?? -1;
      },
      play: async () => controllerRef.current?.play(),
      pause: () => controllerRef.current?.pause(),
      toggle: () => controllerRef.current?.toggle(),
      seek: (seconds: number) => controllerRef.current?.seek(seconds),
      load: (index: number, options?: { play?: boolean }) => controllerRef.current?.load(index, options),
      next: () => controllerRef.current?.next(),
      previous: () => controllerRef.current?.previous(),
      configure: (next) => controllerRef.current?.configure(next),
      destroy: () => {},
    }),
    [],
  );

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  /* The audio is the author's and may be swapped for another element, so the controller follows the element it finds, not the render. */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const audio = root.querySelector<HTMLAudioElement>("audio");
    if (audio !== audioRef.current) {
      controllerRef.current?.destroy();
      audioRef.current = audio;
      controllerRef.current = connectAudioPlayer(root, settingsRef.current);
    } else {
      controllerRef.current?.configure(settingsRef.current);
    }
  });
  useEffect(
    () => () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
      audioRef.current = null;
    },
    [],
  );

  return rootRef;
}

const peaksText = (peaks: string | readonly number[] | undefined) =>
  peaks === undefined ? undefined : typeof peaks === "string" ? peaks : peaks.join(" ");

/**
 * A skin and a keyboard over a real `<audio>`, with an optional playlist and waveform.
 *
 * It renders the contract's markup and runs `connectAudioPlayer` on it in an effect, exactly as the Vanilla enhancer runs
 * it on authored markup; every behaviour (the keys, the seek bar, the playlist, the words that change) is that
 * controller's, so the two bindings cannot disagree. With `tracks`, the loaded track's title, artist and cover are the
 * controller's to keep, so they are rendered empty here.
 */
export function AudioPlayer({
  artist,
  autoAdvance = o.autoAdvance.default,
  children,
  className,
  controller,
  cover,
  label = o.label.default,
  muteLabel = o.muteLabel.default,
  nextLabel = o.nextLabel.default,
  pauseLabel = o.pauseLabel.default,
  peaks,
  playLabel = o.playLabel.default,
  previousLabel = o.previousLabel.default,
  replayLabel = o.replayLabel.default,
  seekLabel = o.seekLabel.default,
  skip = o.skip.default,
  speedLabel = o.speedLabel.default,
  speeds = VIDEO_PLAYER_SPEEDS,
  src,
  timeLabel = o.timeLabel.default,
  title,
  tracks,
  tracksLabel = o.tracksLabel.default,
  unmuteLabel = o.unmuteLabel.default,
  variant = o.variant.default,
  volumeLabel = o.volumeLabel.default,
  ...props
}: AudioPlayerProps) {
  const settings = {
    autoAdvance,
    skip,
    speeds,
    labels: {
      play: playLabel,
      pause: pauseLabel,
      replay: replayLabel,
      mute: muteLabel,
      unmute: unmuteLabel,
      speed: speedLabel,
      time: timeLabel,
    },
  };
  const rootRef = useAudioPlayerController(controller, settings);

  const listed = tracks !== undefined && tracks.length > 0;
  const wave = peaksText(peaks);

  return (
    <div
      {...props}
      ref={rootRef}
      role="group"
      tabIndex={-1}
      aria-label={label}
      className={cx(parts.root, className)}
      data-variant={variant}
      {...(autoAdvance ? {} : { [audioPlayerAttrs.autoAdvance]: "false" })}
      {...(wave !== undefined ? { [audioPlayerAttrs.peaks]: wave } : {})}
    >
      {src !== undefined || listed ? <audio className={parts.media} preload="none" src={listed ? undefined : src} {...{ [audioPlayerAttrs.deferLoad]: "" }} /> : null}
      {children}
      {cover !== undefined || listed ? (
        <img alt="" aria-hidden="true" className={parts.cover} hidden={listed ? true : undefined} src={listed ? undefined : cover} />
      ) : null}
      {title !== undefined || artist !== undefined || listed ? (
        <div className={parts.meta}>
          {title !== undefined || listed ? <span className={parts.title}>{listed ? null : title}</span> : null}
          {artist !== undefined || listed ? <span className={parts.artist}>{listed ? null : artist}</span> : null}
        </div>
      ) : null}
      <div className={parts.controls}>
        <div
          aria-label={seekLabel}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={0}
          className={parts.seek}
          role="slider"
          tabIndex={0}
          {...{ [audioPlayerAttrs.timeLabel]: timeLabel }}
        >
          <div className={parts.track}>
            <div className={parts.buffered} />
            <div className={parts.played} />
          </div>
          {wave !== undefined || listed ? (
            <div aria-hidden="true" className={parts.wave}>
              <div className={parts.waveBars} />
              <div className={parts.waveFill} />
            </div>
          ) : null}
          <div className={parts.thumb} />
          <span aria-hidden="true" className={parts.tip} />
        </div>
        <div className={parts.bar}>
          <Control action="previous" hidden keys="Shift+P" label={previousLabel} size="md">
            <Face icon="track-previous" name="previous" />
          </Control>
          <Control
            action="play"
            keys="k"
            label={playLabel}
            size="md"
            solid
            extra={{ [audioPlayerAttrs.labelPause]: pauseLabel, [audioPlayerAttrs.labelReplay]: replayLabel }}
          >
            <Face icon="play" name="play" />
            <Face icon="pause" name="pause" />
            <Face icon="replay" name="replay" />
          </Control>
          <Control action="next" hidden keys="Shift+N" label={nextLabel} size="md">
            <Face icon="track-next" name="next" />
          </Control>
          <span aria-hidden="true" className={parts.time}>
            <span className={parts.current} />
            <span className={parts.duration} />
          </span>
          <span aria-hidden="true" className={parts.spacer} />
          <button
            aria-keyshortcuts="Shift+, Shift+."
            aria-label={speedLabel}
            className={`${parts.control} sk-button sk-interactive`}
            data-size="sm"
            data-variant="ghost"
            type="button"
            {...{ [audioPlayerAttrs.action]: "speed" }}
          >
            <span className={parts.speed} />
          </button>
          <div className={parts.volume}>
            <Control action="mute" keys="m" label={muteLabel} extra={{ [audioPlayerAttrs.labelUnmute]: unmuteLabel }}>
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
        </div>
      </div>
      {listed ? (
        <ol aria-label={tracksLabel} className={`${parts.list} sk-list`} role="list">
          {tracks!.map((track) => (
            <li className={`${parts.item} sk-list__item`} key={`${track.src}|${track.title}`}>
              <button
                className={`${parts.itemButton} sk-list__action sk-interactive`}
                type="button"
                {...{
                  [audioPlayerAttrs.trackSrc]: track.src,
                  [audioPlayerAttrs.trackCover]: track.cover,
                  [audioPlayerAttrs.trackDuration]: track.duration,
                  [audioPlayerAttrs.trackPeaks]: peaksText(track.peaks),
                }}
              >
                <span aria-hidden="true" className={`${parts.itemLeading} sk-list__leading`} />
                <span className={`${parts.itemText} sk-list__content`}>
                  <span className={`${parts.itemTitle} sk-list__title`}>{track.title}</span>
                  {track.artist ? <span className={`${parts.itemArtist} sk-list__description`}>{track.artist}</span> : null}
                </span>
                <span aria-hidden="true" className={`${parts.itemDuration} sk-list__trailing`} />
              </button>
            </li>
          ))}
        </ol>
      ) : null}
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
  size = "sm",
  solid = false,
}: {
  action: AudioPlayerAction;
  children: ReactNode;
  extra?: Record<string, string>;
  hidden?: boolean;
  keys: string;
  label: string;
  size?: "sm" | "md";
  /** The one filled button of the bar: play. */
  solid?: boolean;
}) {
  return (
    <button
      aria-keyshortcuts={keys}
      aria-label={label}
      className={`${parts.control} sk-button sk-interactive sk-icon-toggle`}
      data-icon-only=""
      data-size={size}
      data-variant={solid ? "solid" : "ghost"}
      hidden={hidden}
      type="button"
      {...{ [audioPlayerAttrs.action]: action, ...extra }}
    >
      {children}
    </button>
  );
}

export type AudioPlayerMinimalProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> &
  Pick<
    AudioPlayerProps,
    "src" | "title" | "children" | "controller" | "label" | "playLabel" | "pauseLabel" | "replayLabel" | "seekLabel" | "timeLabel" | "skip"
  >;

/**
 * The least a sound needs: a play button, a seek bar and the time, on one row, with an optional `title` that says what is playing.
 * No cover, list, volume or speed, and
 * none of them in the markup either, so a screen reader does not walk past controls the clip will never use. It runs the
 * same controller as `AudioPlayer`, so the keys (K, J, L, M, 0 to 9, arrows) still answer while focus is inside.
 */
export function AudioPlayerMinimal({
  children,
  className,
  controller,
  label = o.label.default,
  pauseLabel = o.pauseLabel.default,
  playLabel = o.playLabel.default,
  replayLabel = o.replayLabel.default,
  seekLabel = o.seekLabel.default,
  skip = o.skip.default,
  src,
  timeLabel = o.timeLabel.default,
  title,
  ...props
}: AudioPlayerMinimalProps) {
  const rootRef = useAudioPlayerController(controller, {
    skip,
    labels: { play: playLabel, pause: pauseLabel, replay: replayLabel, time: timeLabel },
  });

  return (
    <div
      {...props}
      ref={rootRef}
      role="group"
      tabIndex={-1}
      aria-label={label}
      className={cx(parts.root, className)}
      data-variant="minimal"
    >
      {src !== undefined ? <audio className={parts.media} preload="none" src={src} {...{ [audioPlayerAttrs.deferLoad]: "" }} /> : null}
      {children}
      <Control
        action="play"
        keys="k"
        label={playLabel}
        solid
        extra={{ [audioPlayerAttrs.labelPause]: pauseLabel, [audioPlayerAttrs.labelReplay]: replayLabel }}
      >
        <Face icon="play" name="play" />
        <Face icon="pause" name="pause" />
        <Face icon="replay" name="replay" />
      </Control>
      {title !== undefined ? <span className={parts.title}>{title}</span> : null}
      <div
        aria-label={seekLabel}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={0}
        className={parts.seek}
        role="slider"
        tabIndex={0}
        {...{ [audioPlayerAttrs.timeLabel]: timeLabel }}
      >
        <div className={parts.track}>
          <div className={parts.buffered} />
          <div className={parts.played} />
        </div>
        <div className={parts.thumb} />
        <span aria-hidden="true" className={parts.tip} />
      </div>
      <span aria-hidden="true" className={parts.time}>
        <span className={parts.current} />
        <span className={parts.duration} />
      </span>
    </div>
  );
}
