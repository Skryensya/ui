---
num: 39
title: The video player is a skin and a keyboard over the element
short: "Video player"
summary: >-
  VideoPlayer draws controls over a real `<video>` and owns nothing the element already owns. One controller in
  `@skryensya/core` reads the element and calls it; both bindings run that controller. The controls are the system's
  own buttons and loader, the two sliders reuse the splitter's pointer arithmetic instead of Slider, the keys are
  scoped to the player, and the media is either a `src` convenience or an authored `<video>`.
---

A player is the one place where building the whole thing is a mistake. The platform plays, seeks, buffers,
decodes captions, changes the rate and goes fullscreen, and does each of them better on every device than a
reimplementation could. What it does not give is a control bar that looks like the rest of an interface and can
be driven from the keyboard without leaving the page, and that is all this component is.

## The element is the source of truth

The controller never keeps a copy of the state. A press calls the element (`play()`, `currentTime`, `muted`) and
the chrome is repainted from the event that follows (`play`, `pause`, `volumechange`, `ratechange`). A pause
button therefore changes when something else pauses the video too, and the two bindings cannot disagree about it
because there is one controller and the markup is the only thing they render.

## Why not Slider

Slider (zag) was the obvious reuse and was weighed. A seek bar needs two fills on one track, what is played and
what is buffered, and a thumb that is gone at rest; Slider has one fill and a thumb that never leaves. Extending
it would change a contract that already has consumers of its own for a need only the player has. The splitter's
pointer arithmetic (a press moves the thumb there, a drag follows it past the box) is what Compare Slider and
Resizable already share, so the seek bar and the volume reuse that, and nothing else in the system changed.

## What the keys are, and where they listen

The shortcuts are the ones YouTube's help page documents. They listen on the player's root, never on the
document, because a player that took `k` or the space bar from the whole page would fight everything around it.
A key that belongs to the focused control (Space on a button, an arrow on a slider) is left to that control. The
big start button leaves once the media plays, so the controller moves focus to the bar's own play button when it
is the one pressed: a focused control that disappears drops focus on the page and the keys stop answering.

## What is ours and not a source's

The hide-after-idle rule, its three seconds and the five rates are choices made here. No primary source gives
them: the W3C's player page is silent on hiding controls. The frame step is measured where the browser allows it
(the gaps between frames `requestVideoFrameCallback` reports, as a median, so a dropped frame cannot move it) and
falls back to thirty frames a second where it does not, since the element itself reports no frame rate. The keys
step a running video by pausing it first, so they are never dead. All of it is named as ours in the contract and
the page.

## The media, and a limit of the usage tree

A usage tree cannot carry a raw `<video>`, so a contract that only took authored children could never be chosen
by the MCP or the Maker. `src`, `poster` and one caption track (`captionsSrc`, `captionsLang`,
`captionsTitle`) are therefore options, with an authored `<video>` in `children` as the other way in, exactly one
of the two. More than one caption language, or several sources, is authored markup.

## Left out on purpose

A settings menu (Menu is a zag machine with a portal and does not bake into a shell, so speed is a button that
steps through the rates), a tooltip per control (each has an accessible name and `aria-keyshortcuts`),
double-tap-to-seek zones, and a thumbnail preview on the seek bar. The last two need a measured gesture or a
media-specific asset this contract does not own yet; each is additive when it does.

## Eight icon roles

`play`, `pause`, `replay`, `volume`, `volume-muted`, `captions`, `fullscreen` and `fullscreen-exit` joined the
stable vocabulary, named for what the control does. `fullscreen` is not `maximize`: that one is a Window growing
inside the page.
