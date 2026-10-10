---
num: 38
title: The image cropper is a model of the crop, with Cropper.js behind it
short: "Image cropper"
summary: >-
  ImageCropper uses Cropper.js v2 for the gestures and the pixels, and owns everything else. The crop is a
  pure model (a window over an image, and the rule that the window is always inside it) in
  `@skryensya/core`; one controller adapts Cropper.js to that model and is the only file that imports it;
  both bindings call that controller. The public value is `{ position, zoom, rotation, frame? }`, ratios
  and degrees that draw the same crop at any size, and no Cropper.js type, instance or event crosses the
  controller.
---

A crop tool has to be right in three places a stylesheet cannot help with: the gestures (a mouse, a pen,
two fingers, a wheel), the geometry (what part of the picture is in the window once it is zoomed and
turned) and the pixels (a file at the picture's own resolution, with a circle cut out of it). Writing
those from scratch is the wrong use of this system's time, and a library that already does them for
every browser is the right dependency. The question is what to let it own.

## What Cropper.js owns, and what it does not

Cropper.js v2 is a set of custom elements: a canvas that turns pointer events into actions, an image
that moves, scales and rotates under them, a selection with handles, and `$toCanvas`, which draws the
selection's region of the transformed image. It owns exactly that.

It does not decide that a crop is valid. Zoom out, or turn the picture, and nothing stops the window
from covering an empty corner; its own events say what the gesture asked for and leave the answer to
the page. That answer is the part of an image cropper a person would notice if it were wrong, so it is
not Cropper.js's and it is not left to chance either.

## A model first

`image-cropper-model.ts` is the crop with no DOM and no Cropper.js. A fixed **window** (the frame) and an
image placed under it by a scale, a rotation and a centre; and one rule, `clampToCover`: the placement
nearest to the one asked for whose window lies entirely inside the rotated image. Zoom, drag, rotation and
a resized window are each followed by it, so any order of them is valid and no case is special.

The rule is tested as a property (six hundred random placements, windows and pictures: the window is
inside, and a valid placement is its own nearest) and, in a real browser, from the other side: the
corners of the window are taken through the inverse of the transform Cropper.js actually holds and
compared with the picture's size, so the model cannot vouch for itself.

## One controller, the only importer

`image-cropper-controller.ts` is the adapter. It loads Cropper.js on first use (`import()`, so a page with
no cropper never fetches it and a server never evaluates it), gives it a template, and turns what it
hears into the model's terms. Cropper.js emits `transform` and `change` as cancelable events, which is
what makes the rule continuous: a drag is allowed only as far as the rule lets it go, replaced by the
valid placement before a frame is drawn. Anything it does by itself (its own centring when a picture
finishes loading, a re-select) is cancelled, because this is the only place that places the picture.

Both bindings call `connectImageCropper(root)` and nothing else. Vanilla's enhancer is a mount around it;
React renders the template's parts and runs it in an effect. The options are the root's attributes and the
controller keeps reading them, so a prop that changes and an attribute an author edits are one thing, and
there is no second copy of any option for the bindings to disagree about.

## The value is the contract

`{ position, zoom, rotation, frame? }` is all ratios and degrees. `zoom` 1 is the picture just covering the
window; `position` is where the window sits along the travel it has; `frame` exists only for a free
aspect. None of them is in pixels of a stage that changes size, so a stored value draws the same crop on a
phone and on a desktop. Confirming reports the crop in the picture's own pixels, and the means to export
it (`exportBlob`, `exportCanvas`), whose failures are a small closed set of codes with messages that say
what to do. A circle always exports as a transparent PNG, masked on the canvas with `destination-in`.

## What was rejected

- *A crop engine of our own.* Pointer, touch and pen handling, pinch, wheel and decode quirks across
  browsers are not what this system is for, and the export would have been the same drawing Cropper.js
  already does.
- *Cropper.js's own UI.* Its toolbar is not accessible or themable to this system's standard. Its
  elements draw the stage and take the pointer; the toolbar, the keyboard, the announcements and every
  colour are ours (its elements are restyled from outside their shadow roots with tokens).
- *Exposing the Cropper.js instance* for "anything the wrapper does not cover". It would turn every later
  change of the library into a breaking change here, and it is how a second source of truth for the crop
  gets in.
- *React as the implementation, Vanilla as a port.* The behaviour is a controller in Core that both
  bindings run, for the reason Canvas and Lightbox are.
- *Rounding the window to whole pixels,* which Cropper.js does unless told not to (`precise`). The
  model's window is not whole pixels, and the difference was a file 798 pixels wide where 800 was asked.

## Consequences

`cropperjs` is a dependency of `@skryensya/core`, pinned to an exact version that is older than the
repository's 30-day quarantine. It is imported in one place, so replacing it means rewriting one file and
keeping the model and its tests. Its types appear only in that file. The wheel is the page's unless
`wheelZoom` says otherwise, and a crop from another origin exports only if the image's server sends CORS
and `crossOrigin` is set; both are documented rather than worked around.
