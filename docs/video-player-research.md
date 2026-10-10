# Video player: research

Input for a `VideoPlayer` contract. Sources are named per claim; anything not verified is marked.

## What YouTube's player is, as anatomy

Verified against YouTube's keyboard-shortcut help page (support.google.com/youtube/answer/7631406):

| Key | Action |
|---|---|
| `k`, Space on the seek bar | Play / pause |
| `m` | Mute / unmute |
| Left / Right on the seek bar | Seek 5 s |
| `j` / `l` | Seek 10 s |
| Up / Down on the seek bar | Volume 5% |
| Home / End on the seek bar | Start / last seconds |
| `0` to `9` | Seek to 0% to 90% |
| `,` / `.` while paused | Previous / next frame |
| `<` / `>` | Slower / faster |
| `c` | Captions |
| `f` | Fullscreen (`f` or Esc leaves) |
| `i` | Miniplayer |
| Ctrl/Alt + Left / Right | Previous / next chapter |

Anatomy (from the player's behaviour; the structure is widely observed, not documented by a primary source):
stage with the media, poster and a big centred play button before first play, a bottom control bar (play, volume with an
expanding slider, time `current / duration`, spacer, captions, settings, fullscreen), and above it a seek bar with a
played fill, a buffered fill, a hover time, and a scrubber that grows on hover. Controls hide after a short idle while
playing and come back on pointer move or focus. A spinner shows while buffering.

Not verified, so not copied: auto-hide timing, double-tap-to-seek zones, exact buffering visuals. Pick our own values and
record them as ours.

## What the platform gives for free

`<video>` already owns: playback, `currentTime`, `duration`, `buffered`, `volume`, `muted`, `playbackRate`, text tracks
(`<track kind="captions">`, `textTracks[i].mode`), `requestFullscreen`, `requestPictureInPicture`, and the events
(`timeupdate`, `progress`, `waiting`, `playing`, `pause`, `ended`, `volumechange`, `ratechange`). The component should
**drive** those, never reimplement them: it is a skin and a keyboard map over a real element, in the same spirit as
Image Cropper being a model over cropperjs.

## Accessibility (W3C WAI, w3.org/WAI/media/av/player)

Keyboard operable, visible focus, a label on every control, sufficient contrast, usable zoomed and with a screen reader.
Optional: speed control, caption styling, transcripts. The page gives no guidance on auto-hiding controls, so the rule
here is ours: never hide while focus is inside the bar, never hide while paused, and show on any key.

Consequences for the contract:

- Seek bar and volume are `role="slider"` with `aria-valuetext` in words ("1 minute 5 seconds of 3 minutes"), because a
  bare number of seconds is useless read aloud.
- Every icon-only button needs a name, and its name changes with state ("Play" / "Pause"), not a pressed state.
- Captions button is a toggle (`aria-pressed`) and is absent when there are no tracks, rather than disabled.
- The shortcuts are scoped to the player (focus inside it), never global, so they do not fight the page.

## The media to demo with

Sintel trailer, Blender Foundation, **Creative Commons Attribution 3.0** (durian.blender.org/sharing). "No copyright"
in the strict sense does not exist for a film; CC-BY is the right free tier, and it requires crediting
"© copyright Blender Foundation | durian.blender.org". The page must show that credit.

- `https://download.blender.org/durian/trailer/sintel_trailer-480p.mp4`, 4.3 MB, 200, no CORS header.
- No CORS means `<track>` from that origin would not load, and hotlinking a 4 MB file from a third party is a fragile
  demo. Host the file with the docs site (`apps/docs/public`) and write the captions ourselves.

Alternative if "no attribution" is a hard requirement: NASA media is generally public domain, but each item must be
checked for third-party content; not verified here.

## Reusing the design system

| Need | Existing part |
|---|---|
| Play, mute, captions, fullscreen | Button / icon button, `aria-label` |
| Seek and volume | Slider (zag), or the splitter-style bar CompareSlider uses |
| Settings (speed, captions) | Menu or Popover |
| Time and shortcut labels | Tooltip, Kbd |
| Buffering | Loader |
| Control bar | Toolbar (one tab stop, arrow keys) |
| Poster and frame | Image Frame |
| Caption wash | Media Overlay |

Open question: Slider carries the thumb inside a track and has no buffered fill. Either extend it with a secondary fill
or build the seek bar on the splitter bar like CompareSlider. Decision pending.
