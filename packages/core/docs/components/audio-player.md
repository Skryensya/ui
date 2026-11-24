# audio-player

Category: content. Stylesheet: `@skryensya/core/components/audio-player.css`. Signatures: `AudioPlayer`, `AudioPlayerMinimal`.

## AudioPlayer

**Use when**

- a sound has to be played inside the page and its controls should look like the rest of the interface instead of the browser's own bar: a podcast episode, a song, a voice note, a recording
- the reader should be able to run it from the keyboard alone: play, seek, volume, speed and the previous and next track all have a key, scoped to the player and never to the page
- there is a list of tracks (an album, a set of episodes) and the player should load one, move on when it ends, and show which one is playing
- the sound has a title, an artist or a cover that should sit with the controls, as a strip or as a card
- you have the peaks of the file and want the seek bar to show its shape

**Avoid when**

- the sound lives on someone else's player (Spotify, SoundCloud, a podcast host): that is an iframe with its own controls, and drawing a second bar over it controls nothing
- it is a short effect or a click on an interface action; a sound that answers a press needs no controls
- there is a picture to watch; that is VideoPlayer, which has a stage, a poster and fullscreen
- the app needs shuffle, repeat, a queue the reader reorders or lyrics; those are the app's policy, and this player moves along a list and nothing more

Alternatives: `VideoPlayer`, `Slider`.

- React: `import { AudioPlayer } from "@skryensya/react/audio-player"`.
- HTML: a `<div>` with `data-sk-audio-player`, enhanced by Vanilla's mount.

- Exactly one of: `src`, `tracks`, `children`.

**Options**

| Option | Values | Default |
|---|---|---|
| `src` | string |  |
| `label` | string | `"Audio player"` |
| `playLabel` | string | `"Play"` |
| `pauseLabel` | string | `"Pause"` |
| `replayLabel` | string | `"Replay"` |
| `seekLabel` | string | `"Seek"` |
| `timeLabel` | string | `"{current} of {duration}"` |
| `title` | string |  |
| `artist` | string |  |
| `cover` | string |  |
| `peaks` | string |  |
| `variant` | "bar" \| "card" | `"bar"` |
| `muteLabel` | string | `"Mute"` |
| `unmuteLabel` | string | `"Unmute"` |
| `volumeLabel` | string | `"Volume"` |
| `speedLabel` | string | `"Playback speed"` |
| `previousLabel` | string | `"Previous track"` |
| `nextLabel` | string | `"Next track"` |
| `tracksLabel` | string | `"Tracks"` |
| `autoAdvance` | boolean | `true` |
| `skip` | number | `10` |
| `speeds` | string | `"0.5 1 1.25 1.5 2"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |
| `tracks` | a list of items (below) |  |

Each item in `tracks`: `cover` (string), `duration` (number), `peaks` (string), `src` (string), `artist` (text), `title` (text, required).

**Example** (canonical tree `audio-player/default`; its copy is placeholder, replace it)

```tsx
import { AudioPlayer } from "@skryensya/react/audio-player";

export function AudioPlayerExample() {
  return (
    <AudioPlayer
      src="/audio/morning-light.wav"
      title="Morning Light"
      artist="Skryensya Demo"
      cover="/audio/morning-light.svg"
      peaks="0.2 0.8 0.5 1 0.3"
      variant="card"
      label="Morning Light"
    />
  );
}
```

```html
<div
  class="sk-audio-player"
  data-sk-audio-player
  data-peaks="0.2 0.8 0.5 1 0.3"
  data-variant="card"
  aria-label="Morning Light"
  data-skip="10"
  data-speeds="0.5 1 1.25 1.5 2"
  role="group"
  tabindex="-1"
>
  <audio
    class="sk-audio-player__media"
    src="/audio/morning-light.wav"
    preload="none"
    data-defer-load
  ></audio>
  <img
    class="sk-audio-player__cover"
    src="/audio/morning-light.svg"
    alt
    aria-hidden="true"
  >
  <div class="sk-audio-player__meta">
    <span class="sk-audio-player__title">Morning Light</span>
    <span class="sk-audio-player__artist">Skryensya Demo</span>
  </div>
  <div class="sk-audio-player__controls">
    <div
      class="sk-audio-player__seek"
      aria-label="Seek"
      data-time-label="{current} of {duration}"
      role="slider"
      tabindex="0"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="0"
    >
      <div class="sk-audio-player__track">
        <div class="sk-audio-player__buffered"></div>
        <div class="sk-audio-player__played"></div>
      </div>
      <div class="sk-audio-player__wave" aria-hidden="true">
        <div class="sk-audio-player__wave-bars"></div>
        <div class="sk-audio-player__wave-fill"></div>
      </div>
      <div class="sk-audio-player__thumb"></div>
      <span class="sk-audio-player__tip" aria-hidden="true"></span>
    </div>
    <div class="sk-audio-player__bar">
      <button
        class="sk-audio-player__control sk-button sk-interactive sk-icon-toggle"
        aria-label="Previous track"
        type="button"
        data-audio-action="previous"
        data-icon-only
        data-variant="ghost"
        data-size="md"
        aria-keyshortcuts="Shift+P"
        hidden
      >
        <span
          data-face="previous"
          data-sk-icon="track-previous"
          data-sk-icon-size="md"
        ></span>
      </button>
      <button
        class="sk-audio-player__control sk-button sk-interactive sk-icon-toggle"
        aria-label="Play"
        data-label-pause="Pause"
        data-label-replay="Replay"
        type="button"
        data-audio-action="play"
        data-icon-only
        data-variant="solid"
        data-size="md"
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
      <button
        class="sk-audio-player__control sk-button sk-interactive sk-icon-toggle"
        aria-label="Next track"
        type="button"
        data-audio-action="next"
        data-icon-only
        data-variant="ghost"
        data-size="md"
        aria-keyshortcuts="Shift+N"
        hidden
      >
        <span
          data-face="next"
          data-sk-icon="track-next"
          data-sk-icon-size="md"
        ></span>
      </button>
      <span class="sk-audio-player__time" aria-hidden="true">
        <span class="sk-audio-player__current"></span>
        <span class="sk-audio-player__duration"></span>
      </span>
      <span class="sk-audio-player__spacer" aria-hidden="true"></span>
      <button
        class="sk-audio-player__control sk-button sk-interactive"
        aria-label="Playback speed"
        type="button"
        data-audio-action="speed"
        data-variant="ghost"
        data-size="sm"
        aria-keyshortcuts="Shift+, Shift+."
      >
        <span class="sk-audio-player__speed"></span>
      </button>
      <div class="sk-audio-player__volume">
        <button
          class="sk-audio-player__control sk-button sk-interactive sk-icon-toggle"
          aria-label="Mute"
          data-label-unmute="Unmute"
          type="button"
          data-audio-action="mute"
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
          class="sk-audio-player__volume-slider"
          aria-label="Volume"
          role="slider"
          tabindex="0"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="0"
          aria-orientation="vertical"
        >
          <div class="sk-audio-player__volume-fill"></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

Stylesheets: `@skryensya/core/components/audio-player.css`, `@skryensya/core/components/button.css`, `@skryensya/core/components/list.css`, `@skryensya/core/patterns/visually-hidden.css`.

## AudioPlayerMinimal

**Use when**

- a short sound sits inside the page and needs only to be played: a voice note, a clip, a pronunciation, a sample
- the sound is part of a line of content or a table row, where a cover, a title and a transport would be heavier than what they play
- you want the least that is still keyboard-operable: a play button, a seek bar and the time

**Avoid when**

- there is a list of tracks, a cover, a title or an artist to show; that is AudioPlayer
- the listener will want volume or speed, as with a long episode or a lecture; AudioPlayer has both
- the sound is an effect that answers a press; that needs no controls at all

Alternatives: `AudioPlayer`.

- React: `import { AudioPlayerMinimal } from "@skryensya/react/audio-player"`.
- HTML: a `<div>` with `data-sk-audio-player`, enhanced by Vanilla's mount.

- Exactly one of: `src`, `children`.

**Options**

| Option | Values | Default |
|---|---|---|
| `src` | string |  |
| `label` | string | `"Audio player"` |
| `playLabel` | string | `"Play"` |
| `pauseLabel` | string | `"Pause"` |
| `replayLabel` | string | `"Replay"` |
| `seekLabel` | string | `"Seek"` |
| `timeLabel` | string | `"{current} of {duration}"` |
| `title` | string |  |
| `skip` | number | `10` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `children` | node |  |

**Example** (canonical tree `audio-player/minimal`; its copy is placeholder, replace it)

```tsx
import { AudioPlayerMinimal } from "@skryensya/react/audio-player";

export function AudioPlayerMinimalExample() {
  return (
    <AudioPlayerMinimal
      src="/audio/morning-light.wav"
      title="Voice note, Monday"
      label="Voice note"
    />
  );
}
```

```html
<div
  class="sk-audio-player"
  data-sk-audio-player
  aria-label="Voice note"
  data-skip="10"
  role="group"
  tabindex="-1"
  data-variant="minimal"
>
  <audio
    class="sk-audio-player__media"
    src="/audio/morning-light.wav"
    preload="none"
    data-defer-load
  ></audio>
  <button
    class="sk-audio-player__control sk-button sk-interactive sk-icon-toggle"
    aria-label="Play"
    data-label-pause="Pause"
    data-label-replay="Replay"
    type="button"
    data-audio-action="play"
    data-icon-only
    data-variant="solid"
    data-size="sm"
    aria-keyshortcuts="k"
  >
    <span data-face="play" data-sk-icon="play" data-sk-icon-size="md"></span>
    <span data-face="pause" data-sk-icon="pause" data-sk-icon-size="md"></span>
    <span data-face="replay" data-sk-icon="replay" data-sk-icon-size="md"></span>
  </button>
  <span class="sk-audio-player__title">Voice note, Monday</span>
  <div
    class="sk-audio-player__seek"
    aria-label="Seek"
    data-time-label="{current} of {duration}"
    role="slider"
    tabindex="0"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="0"
  >
    <div class="sk-audio-player__track">
      <div class="sk-audio-player__buffered"></div>
      <div class="sk-audio-player__played"></div>
    </div>
    <div class="sk-audio-player__thumb"></div>
    <span class="sk-audio-player__tip" aria-hidden="true"></span>
  </div>
  <span class="sk-audio-player__time" aria-hidden="true">
    <span class="sk-audio-player__current"></span>
    <span class="sk-audio-player__duration"></span>
  </span>
</div>
```

Stylesheets: `@skryensya/core/components/audio-player.css`, `@skryensya/core/components/button.css`, `@skryensya/core/patterns/visually-hidden.css`.

## Styling hooks

Override on the root, never by restyling its classes: `--sk-audio-player-bg`, `--sk-audio-player-bar-gap`, `--sk-audio-player-bar-width`, `--sk-audio-player-buffered-color`, `--sk-audio-player-cover-size`, `--sk-audio-player-fg`, `--sk-audio-player-item-accent`, `--sk-audio-player-padding`, `--sk-audio-player-played-color`, `--sk-audio-player-radius`, `--sk-audio-player-thumb-size`, `--sk-audio-player-track-color`, `--sk-audio-player-track-size`, `--sk-audio-player-volume-pad`, `--sk-audio-player-volume-width`, `--sk-audio-player-wave-height`.
