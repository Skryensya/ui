# video-player

Category: content. Stylesheet: `@skryensya/core/components/video-player.css`. Signatures: `VideoPlayer`.

## VideoPlayer

**Use when**

- a video has to be played inside the page and its controls should look like the rest of the interface (same buttons, same focus ring, same dark chrome) instead of the browser's own bar
- the reader should be able to run it from the keyboard alone: play, seek, volume, speed, captions and fullscreen all have a key, scoped to the player and never to the page
- the video is a file you host or link (an mp4 or webm with an optional poster and caption tracks); the player draws over a real video element and leaves the sources and tracks to you

**Avoid when**

- the video lives on someone else's player (YouTube, Vimeo): that is an iframe with its own controls, and drawing a second bar over it controls nothing; embed it in an ImageFrame-sized box instead
- the media is a short looping clip with no sound, a decoration; a bare video with autoplay, muted and loop needs no controls at all
- it is audio only; the seek bar, the volume and the keys fit, but the stage, the poster and fullscreen do not, and a lighter control strip is the right shape
- a photo or a document is being viewed; that is Lightbox

Alternatives: `Lightbox`, `ImageFrame`, `Carousel`.

- React: `import { VideoPlayer } from "@skryensya/react/video-player"`.
- HTML: a `<div>` with `data-sk-video-player`, enhanced by Vanilla's mount.

- Exactly one of: `src`, `children`.

**Options**

| Option | Values | Default |
|---|---|---|
| `src` | string |  |
| `poster` | string |  |
| `captionsSrc` | string |  |
| `captionsLang` | string |  |
| `captionsTitle` | string |  |
| `label` | string | `"Video player"` |
| `playLabel` | string | `"Play"` |
| `pauseLabel` | string | `"Pause"` |
| `replayLabel` | string | `"Replay"` |
| `muteLabel` | string | `"Mute"` |
| `unmuteLabel` | string | `"Unmute"` |
| `seekLabel` | string | `"Seek"` |
| `volumeLabel` | string | `"Volume"` |
| `speedLabel` | string | `"Playback speed"` |
| `captionsLabel` | string | `"Captions"` |
| `fullscreenLabel` | string | `"Full screen"` |
| `exitFullscreenLabel` | string | `"Exit full screen"` |
| `remainingLabel` | string | `"Show remaining time"` |
| `elapsedLabel` | string | `"Show elapsed time"` |
| `timeLabel` | string | `"{current} of {duration}"` |
| `autoHide` | boolean | `true` |
| `skip` | number | `10` |
| `speeds` | string | `"0.5 1 1.25 1.5 2"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

**Example** (canonical tree `video-player/default`; its copy is placeholder, replace it)

```tsx
import { VideoPlayer } from "@skryensya/react/video-player";

export function VideoPlayerExample() {
  return (
    <VideoPlayer
      src="/video/sintel-trailer-480p.mp4"
      poster="/video/sintel-poster.jpg"
      captionsSrc="/video/demo-captions.en.vtt"
      captionsLang="en"
      captionsTitle="English"
      label="Sintel, the trailer"
    />
  );
}
```

```html
<div
  class="sk-video-player"
  data-sk-video-player
  aria-label="Sintel, the trailer"
  data-skip="10"
  data-speeds="0.5 1 1.25 1.5 2"
  role="group"
  tabindex="-1"
>
  <div class="sk-video-player__stage">
    <video
      class="sk-video-player__media"
      src="/video/sintel-trailer-480p.mp4"
      poster="/video/sintel-poster.jpg"
      preload="none"
      data-defer-load
      playsinline
    >
      <track
        src="/video/demo-captions.en.vtt"
        srclang="en"
        label="English"
        kind="captions"
      >
    </video>
  </div>
  <div class="sk-video-player__captions" aria-hidden="true"></div>
  <span
    class="sk-video-player__loader sk-loader"
    aria-hidden="true"
    data-size="lg"
  ></span>
  <button
    class="sk-video-player__big sk-button sk-interactive sk-icon-toggle"
    aria-label="Play"
    data-label-replay="Replay"
    type="button"
    data-video-action="play"
    data-icon-only
    data-variant="solid"
    data-size="lg"
  >
    <span data-face="play" data-sk-icon="play" data-sk-icon-size="md"></span>
    <span data-face="replay" data-sk-icon="replay" data-sk-icon-size="md"></span>
  </button>
  <div class="sk-video-player__controls">
    <div
      class="sk-video-player__seek"
      aria-label="Seek"
      data-time-label="{current} of {duration}"
      role="slider"
      tabindex="0"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="0"
    >
      <div class="sk-video-player__track">
        <div class="sk-video-player__buffered"></div>
        <div class="sk-video-player__played"></div>
      </div>
      <div class="sk-video-player__thumb"></div>
      <span class="sk-video-player__tip" aria-hidden="true"></span>
    </div>
    <div class="sk-video-player__bar">
      <button
        class="sk-video-player__control sk-button sk-interactive sk-icon-toggle"
        aria-label="Play"
        data-label-pause="Pause"
        data-label-replay="Replay"
        type="button"
        data-video-action="play"
        data-icon-only
        data-variant="ghost"
        data-size="sm"
        aria-keyshortcuts="k"
      >
        <span data-face="play" data-sk-icon="play" data-sk-icon-size="md"></span>
        <span
          data-face="pause"
          data-sk-icon="pause"
          data-sk-icon-size="md"
        ></span>
        <span
          data-face="replay"
          data-sk-icon="replay"
          data-sk-icon-size="md"
        ></span>
      </button>
      <div class="sk-video-player__volume">
        <button
          class="sk-video-player__control sk-button sk-interactive sk-icon-toggle"
          aria-label="Mute"
          data-label-unmute="Unmute"
          type="button"
          data-video-action="mute"
          data-icon-only
          data-variant="ghost"
          data-size="sm"
          aria-keyshortcuts="m"
        >
          <span
            data-face="volume"
            data-sk-icon="volume"
            data-sk-icon-size="md"
          ></span>
          <span
            data-face="muted"
            data-sk-icon="volume-muted"
            data-sk-icon-size="md"
          ></span>
        </button>
        <div
          class="sk-video-player__volume-slider"
          aria-label="Volume"
          role="slider"
          tabindex="0"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="0"
          aria-orientation="vertical"
        >
          <div class="sk-video-player__volume-fill"></div>
        </div>
      </div>
      <button
        class="sk-video-player__time sk-button sk-interactive"
        aria-label="Show remaining time"
        data-label-elapsed="Show elapsed time"
        type="button"
        data-video-action="time"
        data-variant="ghost"
        data-size="sm"
      >
        <span class="sk-video-player__current"></span>
        <span class="sk-video-player__duration"></span>
      </button>
      <span class="sk-video-player__spacer" aria-hidden="true"></span>
      <button
        class="sk-video-player__control sk-button sk-interactive"
        aria-label="Playback speed"
        type="button"
        data-video-action="speed"
        data-variant="ghost"
        data-size="sm"
        aria-keyshortcuts="Shift+, Shift+."
      >
        <span class="sk-video-player__speed"></span>
      </button>
      <button
        class="sk-video-player__control sk-button sk-interactive sk-icon-toggle"
        aria-label="Captions"
        type="button"
        data-video-action="captions"
        data-icon-only
        data-variant="ghost"
        data-size="sm"
        aria-keyshortcuts="c"
        hidden
      >
        <span
          data-face="captions"
          data-sk-icon="captions"
          data-sk-icon-size="md"
        ></span>
      </button>
      <button
        class="sk-video-player__control sk-button sk-interactive sk-icon-toggle"
        aria-label="Full screen"
        data-label-exit-fullscreen="Exit full screen"
        type="button"
        data-video-action="fullscreen"
        data-icon-only
        data-variant="ghost"
        data-size="sm"
        aria-keyshortcuts="f"
      >
        <span
          data-face="enter"
          data-sk-icon="fullscreen"
          data-sk-icon-size="md"
        ></span>
        <span
          data-face="exit"
          data-sk-icon="fullscreen-exit"
          data-sk-icon-size="md"
        ></span>
      </button>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/loader.css`, `@skryensya/core/components/video-player.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-video-player-aspect`, `--sk-video-player-bg`, `--sk-video-player-buffered-color`, `--sk-video-player-captions-bg`, `--sk-video-player-captions-offset`, `--sk-video-player-captions-underline-offset`, `--sk-video-player-captions-underline-size`, `--sk-video-player-captions-underline-thickness`, `--sk-video-player-fade-duration`, `--sk-video-player-fg`, `--sk-video-player-gutter`, `--sk-video-player-played-color`, `--sk-video-player-radius`, `--sk-video-player-scrim`, `--sk-video-player-thumb-size`, `--sk-video-player-track-color`, `--sk-video-player-track-size`, `--sk-video-player-volume-pad`, `--sk-video-player-volume-width`.
