import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  text: string;
  playLabel: string;
  pauseLabel: string;
  speed: "slow" | "normal" | "fast";
}

const { pattern, use } = definePattern<Content>({
  id: "announcement-ticker",
  subject: "media",
  scale: "fragment",
  title: { en: "Announcement ticker", es: "Cinta de anuncios" },
  layout: { en: "A Marquee that scrolls one phrase and offers a named control to stop it.", es: "Un Marquee que desplaza una frase y ofrece un control con nombre para detenerlo." },
  fields: {
    text: { en: "What scrolls: a name or a short phrase.", es: "Lo que se desplaza: un nombre o una frase corta." },
    playLabel: { en: "The control's name while it is paused.", es: "El nombre del control mientras está en pausa." },
    pauseLabel: { en: "The control's name while it moves.", es: "El nombre del control mientras se mueve." },
    speed: { en: "How fast it moves; slow reads best.", es: "Qué tan rápido se mueve; lento se lee mejor." },
  },
  notes: [
    { en: "Motion that never stops fails people who cannot read it moving: the control to pause is part of the pattern, not an extra.", es: "El movimiento que nunca para falla a quien no puede leerlo en movimiento: el control para pausar es parte del patrón, no un extra." },
    { en: "Reduced motion starts it still, with the full text visible.", es: "Con movimiento reducido arranca quieto, con el texto completo visible." },
  ],
  build: ({ text, playLabel, pauseLabel, speed }) => ({
    contract: "marquee",
    signature: "Marquee",
    options: { speed },
    slots: { playLabel, pauseLabel, children: text },
  }),
});

export const announcementTicker: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "ticker-launch",
      intent: "marketing/landing/announcement-ticker",
      title: { en: "A launch announcement", es: "Un anuncio de lanzamiento" },
      purpose: { en: "Keep one short announcement moving across the top of a page, with a way to stop it.", es: "Mantener un anuncio corto moviéndose en la parte alta de una página, con una forma de detenerlo." },
      content: { text: { en: "Northstar 2.0 is out · Free for teams under five · ", es: "Northstar 2.0 ya salió · Gratis para equipos de menos de cinco · " }, playLabel: { en: "Play motion", es: "Reproducir movimiento" }, pauseLabel: { en: "Pause motion", es: "Pausar movimiento" }, speed: "slow" },
    }),
  ],
};
