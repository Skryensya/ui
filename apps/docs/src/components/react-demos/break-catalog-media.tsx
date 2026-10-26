import { useState } from "react";
import { AudioPlayer } from "@skryensya/react/audio-player";
import { VideoPlayer } from "@skryensya/react/video-player";
import { Canvas } from "@skryensya/react/canvas";
import { Diagram } from "@skryensya/react/diagram";
import { CompareSlider } from "@skryensya/react/compare-slider";
import { ExpressiveAvatar } from "@skryensya/react/expressive-avatar";
import { FadeEdge } from "@skryensya/react/fade-edge";
import { Marquee } from "@skryensya/react/marquee";
import { MorphStack } from "@skryensya/react/morph-stack";
import { Presence } from "@skryensya/react/presence";
import { ScrollExpand } from "@skryensya/react/scroll-expand";
import { ScrollStack } from "@skryensya/react/scroll-stack";
import { BackToTop } from "@skryensya/react/back-to-top";
import { Box } from "@skryensya/react/layout";
import { Button } from "@skryensya/react/button";
import { FixtureCases, type Fixture } from "./break-catalog-common";
import "@skryensya/core/components/audio-player.css";
import "@skryensya/core/components/video-player.css";
import "@skryensya/core/components/canvas.css";
import "@skryensya/core/components/diagram.css";
import "@skryensya/core/components/compare-slider.css";
import "@skryensya/core/components/expressive-avatar.css";
import "@skryensya/core/components/fade-edge.css";
import "@skryensya/core/components/marquee.css";
import "@skryensya/core/components/morph-stack.css";
import "@skryensya/core/components/presence.css";
import "@skryensya/core/components/scroll-expand.css";
import "@skryensya/core/components/scroll-stack.css";
import "@skryensya/core/components/back-to-top.css";

function Specimen({ id, data, index }: { id: string; data: Fixture; index: number }) {
  const [present, setPresent] = useState(data.items.length > 0);
  const [status, setStatus] = useState("No action yet");
  const { items, title, body, worst } = data;
  const prefix = `break-${id}-${index}`;
  const prose = <Box padding="md" surface="surface"><h3>{title}</h3><p>{body}</p></Box>;
  const picture = <img src="/demos/lightbox/coast.jpg" alt="Coastline" />;
  const rows = items.map((text, i) => <p key={i}>{text}{i === 0 && body ? ` — ${body}` : ""}</p>);
  switch (id) {
    case "audio-player": return <AudioPlayer label={title} tracks={items.map((text, i) => ({ src: "/audio/morning-light.wav", title: text, artist: worst ? "Aleksandra Wiśniewska-Kowalczyk" : undefined, cover: worst && i === 1 ? "/debug/missing-cover.jpg" : "/audio/morning-light.svg" }))} />;
    case "video-player": return <VideoPlayer label={title} src={worst ? "/debug/missing-video.webm" : data.label === "Empty" ? undefined : "/demos/lightbox-video/satin-blue.webm"} poster="/demos/lightbox-video/satin-blue-poster.jpg" captionsTitle={title} />;
    case "canvas": return <Canvas label={title} style={{ blockSize: "20rem" }}><Box style={{ inlineSize: worst ? "1800px" : "360px" }} padding="md" border="default">{rows}</Box></Canvas>;
    case "diagram": return <Diagram label={title} columns={worst ? 3 : 2} nodes={items.map((text, i) => ({ node: `node-${i}`, children: text }))} edges={items.slice(1).map((_, i) => ({ from: `node-${i}`, to: `node-${i + 1}`, children: worst ? body : "Next" }))} />;
    case "compare-slider": return <CompareSlider label={title} before={picture} after={<img src="/demos/lightbox/fjord.jpg" alt="Fjord" />} position={data.label === "Empty" ? 0 : data.label === "One item" ? 100 : 50} style={{ aspectRatio: "4/3" }} />;
    case "expressive-avatar": return <><ExpressiveAvatar name={title} src={worst ? "/debug/missing-avatar.jpg" : data.label === "Empty" ? undefined : "/demos/lightbox/puppy.jpg"} interactive phrases={{ greetings: [{ text: body || "Hello, Jo." }], general: items.map((text) => ({ text })) }} onSpeak={({ text }) => setStatus(text)} /><output>{status}</output></>;
    case "fade-edge": return <FadeEdge scrollAware tabIndex={0} role="region" aria-label={title} style={{ maxBlockSize: "12rem", overflow: "auto" }}>{rows}</FadeEdge>;
    case "marquee": return <Marquee playLabel="Play project strip" pauseLabel="Pause project strip">{items.map((text, i) => <span key={i}>{text}</span>)}</Marquee>;
    case "morph-stack": return <MorphStack back={prose} middle={prose} front={prose} state={worst ? "expanded" : "auto"} nearest={worst ? prose : undefined} deepest={worst ? prose : undefined} />;
    case "presence": return <><Button onClick={() => setPresent((value) => !value)}>Toggle notice</Button><Presence present={present} unmountOnExit onExitComplete={() => setStatus("Exit complete")}>{prose}</Presence><output>{status}</output></>;
    case "scroll-expand": return <ScrollExpand lead={<h3>{title}</h3>} reveal={prose} after={<p>{body}</p>}>{picture}</ScrollExpand>;
    case "scroll-stack": return <ScrollStack back={prose} front={<>{rows}</>} />;
    case "back-to-top": return <><div id={prefix} tabIndex={0} role="region" aria-label={title} style={{ maxBlockSize: "18rem", overflow: "auto" }}><h3 id={`${prefix}-start`} tabIndex={-1}>{title}</h3>{items.map((text, i) => <section key={i}><h4>{text}</h4><p>{body}</p></section>)}</div><BackToTop scroller={`#${prefix}`} target={`#${prefix}-start`} threshold={40}>{worst ? title : "Back to review start"}</BackToTop></>;
    default: throw new Error(`Unknown media specimen: ${id}`);
  }
}

export default function MediaBreak({ id }: { id: string }) {
  return <FixtureCases id={id} large={["audio-player", "fade-edge", "back-to-top"].includes(id)} render={(data, index) => <Specimen id={id} data={data} index={index} />} />;
}
