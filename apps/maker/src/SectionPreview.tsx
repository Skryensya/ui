import { useEffect, useRef, useState } from "react";
import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * A LIVE PREVIEW OF A BLOCK: the section drawn by the real stage (the same page the artboards use) at a desktop width and
 * scaled down to the card. It is a picture of the kit, not a drawing of it, so it is always the section as it will arrive, in
 * the Maker's own theme. The stage is only loaded while the card is on screen, so a long list costs what is visible.
 */
const WIDTH = 1040;
const HEIGHT = 680;

type StageWindow = Window & { makerStage?: { render(tree: UsageTree): Promise<void> | void } };

export function SectionPreview({ tree, scheme }: { tree: UsageTree; scheme: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(false);
  const [scale, setScale] = useState(0.25);
  /* How tall the section really is at this width: the card is cropped to it, not to a fixed ratio, so a navbar is a strip and a hero a block. */
  const [height, setHeight] = useState(HEIGHT);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const watch = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), { rootMargin: "160px" });
    watch.observe(element);
    const size = new ResizeObserver(() => setScale(element.clientWidth / WIDTH));
    size.observe(element);
    return () => { watch.disconnect(); size.disconnect(); };
  }, []);

  useEffect(() => {
    if (!visible) { setShown(false); return; }
    let live = true;
    let tries = 0;
    const draw = () => {
      if (!live) return;
      const stage = (frame.current?.contentWindow as StageWindow | null)?.makerStage;
      if (!stage) { if (++tries < 240) requestAnimationFrame(draw); return; }
      void Promise.resolve(stage.render(tree)).then(() => live && requestAnimationFrame(() => {
        if (!live) return;
        const content = frame.current?.contentDocument?.getElementById("stage");
        if (content) setHeight(Math.max(120, Math.min(HEIGHT, content.scrollHeight)));
        setShown(true);
      }));
    };
    const element = frame.current;
    element?.addEventListener("load", draw);
    draw();
    return () => { live = false; element?.removeEventListener("load", draw); };
  }, [visible, tree, scheme]);

  return (
    <span ref={box} className="maker-section-preview" data-shown={shown ? "" : undefined} aria-hidden="true" style={{ blockSize: height * scale }}>
      {visible ? (
        <iframe
          key={scheme}
          ref={frame}
          src="/stage.html"
          title=""
          tabIndex={-1}
          className="maker-section-preview__frame"
          style={{ inlineSize: WIDTH, blockSize: HEIGHT, transform: `scale(${scale})` }}
        />
      ) : null}
    </span>
  );
}
