import { useEffect, useRef, useState } from "react";

/*
 * TEXT THAT IS WRITTEN, NOT DROPPED. The model's words arrive in lumps, at whatever pace the network gives them; shown as
 * they come they jump. This reveals what has arrived at a steady, quick pace that speeds up when it falls behind, with a
 * caret while more is coming, so a reply reads as someone writing. A reader who asks for less motion gets the text whole.
 *
 * For a screen reader the letters are never announced one by one: the animated text is hidden from it, and the whole
 * text is offered once the writing is over.
 */
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

export function StreamedText({ text, writing, className }: { text: string; /** More may still arrive. */ writing: boolean; className?: string }) {
  const [shown, setShown] = useState(() => (reducedMotion() ? text.length : 0));
  const at = useRef(shown);

  useEffect(() => {
    if (reducedMotion() || text.length < at.current) {
      at.current = text.length;
      setShown(text.length);
      return;
    }
    let frame = 0;
    const tick = () => {
      const backlog = text.length - at.current;
      if (backlog <= 0) return;
      /* About a dozen frames to close any gap, never less than a couple of characters a frame: smooth when it keeps up, quick when it does not. */
      at.current = Math.min(text.length, at.current + Math.max(2, Math.ceil(backlog / 12)));
      setShown(at.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text]);

  const caught = shown >= text.length;
  const live = writing || !caught;
  return (
    <span className={className} data-writing={live ? "" : undefined}>
      <span aria-hidden={live ? "true" : undefined}>{text.slice(0, shown)}</span>
      {live ? <span className="maker-ai__caret" aria-hidden="true" /> : null}
      {!writing && !caught ? <span className="sk-visually-hidden">{text}</span> : null}
    </span>
  );
}
