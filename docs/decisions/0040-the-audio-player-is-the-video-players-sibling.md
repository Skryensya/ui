---
num: 40
title: The audio player is the video player's sibling, not a mode of it
short: "Audio player"
summary: >-
  AudioPlayer is its own contract over a real `<audio>`, sharing the video player's clock, seek arithmetic, speeds and
  keymap as code and nothing else. A list of tracks is the player's, loaded into the one element; the waveform is drawn
  from peaks the author brings, never decoded in the browser; shuffle, repeat and queues stay the app's.
---

The video player already solved what a sound needs: the element does the playing, a controller paints the chrome from
what the element reports, and the keys run only while focus is inside. The question was whether audio is a mode of that
component or a component of its own.

## Why a sibling

A picture needs a stage, a poster, captions, fullscreen and a bar that hides over it. A sound needs a strip that is
always there, a title, a cover and somewhere to go next. One contract holding both would carry options that are nonsense
for each (`poster` on audio, `tracks` on video) and a shape whose signature changes by element. So the two contracts are
separate, and what is genuinely the same is shared as code: `audio-player.ts` imports the clock, the seek and volume
arithmetic, the speed list and the keymap from `video-player.ts`, and `audioKeyAction` is `videoKeyAction` with the keys
that need a picture removed and Shift+P and Shift+N added. A change to what `j` means is made once.

## The list belongs to the player

`tracks` is a collection, and the controller owns which entry is current. A track change is a real source change on the
one `<audio>`, not a second element, so `ended`, `waiting` and `seeked` keep their meaning. When a track ends the next one
starts; when the last ends the player stops. Looping is not offered: whether a list repeats is a decision of the app, and a
shell that made it would be wrong for every consumer that decides otherwise. "Previous" restarts the track once it is
three seconds in, as every player does, and the buttons only exist when there is somewhere to go.

## The waveform is brought, not found

The peaks are numbers from 0 to 1 computed once when the file is prepared. Decoding the audio in the browser to find them
costs a full download and a decoder to draw a picture, and on a long episode it is the heaviest thing the page does. So the
author passes `peaks`, the controller resamples them to a fixed number of bars (the loudest of each share, so a spike is
not averaged away), and without them the bar is the plain track. The played half is the same bars drawn twice and clipped,
so the colour change cuts through a bar instead of snapping between two.

## Two things this changed outside the component

Two roles joined the icon vocabulary, `track-previous` and `track-next`, drawn by all three sets: `chevron-left` and
`chevron-right` name a direction on a page, and a track before this one is a different thing.

The contract validator's `exactlyOneOf` ignored collections: it counted slots with `slotItems`, which filters a
collection's entries out, so a player given only `tracks` was reported as having no source. A collection is a source like
any other slot, and the rule now counts it.
