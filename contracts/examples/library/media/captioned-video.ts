import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  captionsSrc: string;
  captionsLang: string;
  captionsTitle: string;
  words: Record<"playLabel" | "pauseLabel" | "replayLabel" | "muteLabel" | "unmuteLabel" | "seekLabel" | "volumeLabel" | "speedLabel" | "captionsLabel" | "fullscreenLabel" | "exitFullscreenLabel" | "remainingLabel" | "elapsedLabel" | "timeLabel", string>;
}

const { pattern, use } = definePattern<Content>({
  id: "captioned-video",
  subject: "media",
  scale: "component",
  title: { en: "Video with captions", es: "Video con subtítulos" },
  layout: { en: "A VideoPlayer over a hosted file: a poster, one caption track, and every control named in the page's language.", es: "Un VideoPlayer sobre un archivo alojado: un póster, una pista de subtítulos y cada control con nombre en el idioma de la página." },
  fields: { label: { en: "The video's name: what a reader lands on.", es: "El nombre del video: a lo que llega quien lee." }, captionsSrc: { en: "The caption file.", es: "El archivo de subtítulos." }, captionsLang: { en: "The captions' language.", es: "El idioma de los subtítulos." }, captionsTitle: { en: "The captions' name in the player's list.", es: "El nombre de los subtítulos en la lista del reproductor." }, words: { en: "Every word the player says, in the page's language.", es: "Cada palabra que dice el reproductor, en el idioma de la página." } },
  notes: [
    { en: "Every control word is passed in: the player ships no dictionary, so a page in Spanish gets Spanish controls only if it says so.", es: "Cada palabra de control se pasa: el reproductor no trae diccionario, así que una página en español tiene controles en español solo si lo dice." },
    { en: "Give captions whenever there is speech; a video with a voice and no track cannot be followed by someone who does not hear it.", es: "Da subtítulos siempre que haya voz; un video con voz y sin pista no lo puede seguir quien no la oye." },
  ],
  build: ({ label, captionsSrc, captionsLang, captionsTitle, words }) => ({
    contract: "video-player",
    signature: "VideoPlayer",
    options: { label, src: "/video/sintel-trailer-480p.mp4", poster: "/video/sintel-poster.jpg", captionsSrc, captionsLang, captionsTitle, ...words },
  }),
});

/** Pairs each word of both languages under its key, keeping the keys the pattern declared. */
const words = <K extends string>(en: Record<K, string>, es: Record<K, string>): Record<K, { en: string; es: string }> =>
  Object.fromEntries((Object.keys(en) as K[]).map((key) => [key, { en: en[key], es: es[key] }])) as Record<K, { en: string; es: string }>;

export const captionedVideo: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "video-trailer",
      intent: "marketing/product/hosted-video",
      title: { en: "A trailer", es: "Un tráiler" },
      purpose: { en: "Play a short film or a product video that you host, with the system's controls and a caption track.", es: "Reproducir un cortometraje o un video de producto alojado por ti, con los controles del sistema y una pista de subtítulos." },
      content: {
        label: { en: "Sintel, the trailer", es: "Sintel, el tráiler" },
        captionsSrc: { en: "/video/demo-captions.en.vtt", es: "/video/demo-captions.es.vtt" },
        captionsLang: { en: "en", es: "es" },
        captionsTitle: { en: "English (demo)", es: "Español (demostración)" },
        words: words(
          { playLabel: "Play", pauseLabel: "Pause", replayLabel: "Watch again", muteLabel: "Mute", unmuteLabel: "Turn the sound on", seekLabel: "Seek in the video", volumeLabel: "Volume", speedLabel: "Playback speed", captionsLabel: "Captions", fullscreenLabel: "Full screen", exitFullscreenLabel: "Exit full screen", remainingLabel: "Show the time left", elapsedLabel: "Show the time played", timeLabel: "{current} of {duration}" },
          { playLabel: "Reproducir", pauseLabel: "Pausar", replayLabel: "Ver de nuevo", muteLabel: "Silenciar", unmuteLabel: "Activar el sonido", seekLabel: "Buscar en el video", volumeLabel: "Volumen", speedLabel: "Velocidad de reproducción", captionsLabel: "Subtítulos", fullscreenLabel: "Pantalla completa", exitFullscreenLabel: "Salir de pantalla completa", remainingLabel: "Mostrar el tiempo que falta", elapsedLabel: "Mostrar el tiempo transcurrido", timeLabel: "{current} de {duration}" },
        ),
      },
    }),
  ],
};
