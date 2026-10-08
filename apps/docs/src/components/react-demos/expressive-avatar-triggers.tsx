/*
 * THE EXPRESSIVE AVATAR, TRIGGERED FROM OUTSIDE. Three expressions of its own (`asombro`, `duda`, `picaro`),
 * each just a name that has an image, and the three ways a page asks for them: through the avatar's handle,
 * through an event on its element, and from a phrase it says. Nothing here is special to the docs: it is what
 * any page does with its own buttons, timers or form errors.
 */
import { useRef } from "react";
import { ExpressiveAvatar, type ExpressiveAvatarApi, type ExpressiveAvatarProps } from "@skryensya/react/expressive-avatar";

type Copy = {
  asombro: string;
  duda: string;
  picaro: string;
  clear: string;
  viaApi: string;
  viaEvent: string;
  viaPhrase: string;
  phrase: string;
  eventButton: string;
  phraseButton: string;
};

export function ExpressiveAvatarTriggers({ copy, images }: { copy: Copy; images: NonNullable<ExpressiveAvatarProps["images"]> }) {
  const api = useRef<ExpressiveAvatarApi>(null);
  const root = useRef<HTMLDivElement>(null);

  /* The same trigger without a reference to the component: an event on its element. */
  const byEvent = (expression: string | null, duration?: number) =>
    root.current
      ?.querySelector("[data-interactive]")
      ?.dispatchEvent(new CustomEvent("sk:expressiveavatarexpress", { detail: { expression, duration } }));

  return (
    <div className="ea-triggers" ref={root}>
      <div className="ea-triggers__face">
        <ExpressiveAvatar apiRef={api} name="Allison" size="xl" interactive images={images} phrases={{}} />
      </div>

      <div className="ea-triggers__group">
        <p className="ea-triggers__label">{copy.viaApi}</p>
        <div className="ea-triggers__buttons">
          {(["asombro", "duda", "picaro"] as const).map((name) => (
            <button className="ea-triggers__button" type="button" key={name} onClick={() => api.current?.express(name, { duration: 1800 })}>
              {copy[name]}
            </button>
          ))}
          <button className="ea-triggers__button" type="button" onClick={() => api.current?.express(null)}>
            {copy.clear}
          </button>
        </div>
      </div>

      <div className="ea-triggers__group">
        <p className="ea-triggers__label">{copy.viaEvent}</p>
        <div className="ea-triggers__buttons">
          <button className="ea-triggers__button" type="button" onClick={() => byEvent("asombro", 1800)}>
            {copy.eventButton}
          </button>
        </div>
      </div>

      <div className="ea-triggers__group">
        <p className="ea-triggers__label">{copy.viaPhrase}</p>
        <div className="ea-triggers__buttons">
          <button className="ea-triggers__button" type="button" onClick={() => api.current?.speak({ text: copy.phrase, expression: "picaro" })}>
            {copy.phraseButton}
          </button>
        </div>
      </div>
    </div>
  );
}
