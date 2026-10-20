import type { Translate } from "../../i18n";

type UIKey = Parameters<Translate>[0];
const k = (name: string) => `demo.videoPlayer.${name}` as UIKey;

/** The words of every control, in the page's language: what a player embedded elsewhere (the Lightbox's) needs, with no film of its own. */
export const videoPlayerWords = (t: Translate) => ({
  label: t(k("label")),
  playLabel: t(k("playLabel")),
  pauseLabel: t(k("pauseLabel")),
  replayLabel: t(k("replayLabel")),
  muteLabel: t(k("muteLabel")),
  unmuteLabel: t(k("unmuteLabel")),
  seekLabel: t(k("seekLabel")),
  volumeLabel: t(k("volumeLabel")),
  speedLabel: t(k("speedLabel")),
  captionsLabel: t(k("captionsLabel")),
  fullscreenLabel: t(k("fullscreenLabel")),
  exitFullscreenLabel: t(k("exitFullscreenLabel")),
  remainingLabel: t(k("remainingLabel")),
  elapsedLabel: t(k("elapsedLabel")),
  timeLabel: t(k("timeLabel")),
});

