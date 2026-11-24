import { galleryParts } from "@skryensya/core/gallery";
import { linkGalleryLightbox } from "@skryensya/core/gallery-lightbox";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * GALLERY needs no script to choose a photo (native radios and CSS). This mount exists for one case: large photos that
 * open a Lightbox, where stepping through the viewer has to move the gallery's choice and closing it has to land focus on
 * the photo showing (core's linkGalleryLightbox). A gallery with no Lightbox trigger in its views attaches nothing.
 */
export const mountGallery = createConnectMount({
  key: "gallery",
  rootSelector: `.${galleryParts.root}`,
  connect: linkGalleryLightbox,
});
