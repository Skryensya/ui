/*
 * RELATED COMPONENTS, chosen where a component's own neighbours are the wrong answer.
 *
 * A page's "related" list is, by default, the next four entries of its navigation category, wrapping round. That is a fair
 * answer for a category of near-equals and a wrong one where the alphabet decides: Video Player is the last entry of
 * Media & Visuals, so it wrapped to Annotation, Canvas and Carousel, and Audio Player, its closest relative, was the one
 * that sorted nowhere near it. An entry here replaces the neighbours with the components a reader would actually weigh it
 * against, taken from the `alternatives` of its semantic overlay (`contracts/semantic/*.yaml`) plus the sibling.
 *
 * Keys and values are page paths. A path may point into another category: the page is what matters, not where it is filed.
 */
export const relatedComponents: Readonly<Record<string, readonly string[]>> = {
  "/components/video-player": ["/components/audio-player", "/components/lightbox", "/components/image-frame", "/components/carousel"],
  "/components/audio-player": ["/components/video-player", "/components/slider", "/components/list", "/components/progress"],
};
