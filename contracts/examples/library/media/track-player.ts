import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  title: string;
  artist: string;
  words: Record<"playLabel" | "pauseLabel" | "replayLabel" | "muteLabel" | "unmuteLabel" | "seekLabel" | "volumeLabel" | "speedLabel" | "timeLabel", string>;
}

const { pattern, use } = definePattern<Content>({
  id: "track-player",
  subject: "media",
  scale: "component",
  title: { en: "Audio player", es: "Reproductor de audio" },
  layout: { en: "An AudioPlayer strip: a cover, the title and the artist, a seek bar and the controls.", es: "Una tira de AudioPlayer: una portada, el título y el artista, una barra de búsqueda y los controles." },
  fields: { label: { en: "The player's name.", es: "El nombre del reproductor." }, title: { en: "The piece's title.", es: "El título de la pieza." }, artist: { en: "Who made it.", es: "Quién la hizo." }, words: { en: "Every word the player says, in the page's language.", es: "Cada palabra que dice el reproductor, en el idioma de la página." } },
  notes: [
    { en: "The title and artist sit with the controls, so what is playing is never only in the file's name.", es: "El título y el artista están con los controles, así que lo que suena nunca está solo en el nombre del archivo." },
    { en: "Controls answer to keys while focus is inside, never on the page: a player that took the space bar from the whole document would fight everything around it.", es: "Los controles responden a teclas mientras el foco está dentro, nunca en la página: un reproductor que se llevara la barra espaciadora de todo el documento pelearía con todo lo que lo rodea." },
  ],
  build: ({ label, title, artist, words }) => ({
    contract: "audio-player",
    signature: "AudioPlayer",
    options: { label, src: "/audio/morning-light.wav", cover: "/audio/morning-light.svg", title, artist, ...words },
  }),
});

/** Pairs each word of both languages under its key, keeping the keys the pattern declared. */
const words = <K extends string>(en: Record<K, string>, es: Record<K, string>): Record<K, { en: string; es: string }> =>
  Object.fromEntries((Object.keys(en) as K[]).map((key) => [key, { en: en[key], es: es[key] }])) as Record<K, { en: string; es: string }>;

export const trackPlayer: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "audio-single-track",
      intent: "content/presentation/audio-track",
      title: { en: "A single track", es: "Una sola pista" },
      purpose: { en: "Play one piece of sound (a song, an episode, a voice note) with the system's controls.", es: "Reproducir una pieza de sonido (una canción, un episodio, una nota de voz) con los controles del sistema." },
      content: {
        label: "Morning Light",
        title: "Morning Light",
        artist: "Skryensya Demo",
        words: words(
          { playLabel: "Play", pauseLabel: "Pause", replayLabel: "Replay", muteLabel: "Mute", unmuteLabel: "Unmute", seekLabel: "Seek", volumeLabel: "Volume", speedLabel: "Playback speed", timeLabel: "{current} of {duration}" },
          { playLabel: "Reproducir", pauseLabel: "Pausar", replayLabel: "Ver de nuevo", muteLabel: "Silenciar", unmuteLabel: "Activar el sonido", seekLabel: "Buscar", volumeLabel: "Volumen", speedLabel: "Velocidad de reproducción", timeLabel: "{current} de {duration}" },
        ),
      },
    }),
  ],
};
