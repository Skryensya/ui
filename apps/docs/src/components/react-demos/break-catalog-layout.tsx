import { useState } from "react";
import { Box, Stack, Inline, Grid, Wrapper, LayoutGrid, AppShell, Main, Hero, Footer } from "@skryensya/react/layout";
import { TileButton, TileLink, TileCheckbox, TileSwitch, TileRadioGroup, TileContent, ExpandableTile, TileChevron } from "@skryensya/react/tile";
import { ImageFrame } from "@skryensya/react/image-frame";
import { MediaOverlay } from "@skryensya/react/media-overlay";
import { Changelog, ChangelogRelease, ChangelogEntry } from "@skryensya/react/changelog";
import { PlaceholderParagraph } from "@skryensya/react/placeholder";
import { Icon } from "@skryensya/react/icon";
import { Button } from "@skryensya/react/button";
import { Sidebar, SidebarContent } from "@skryensya/react/sidebar";
import { FixtureCases, type Fixture } from "./break-catalog-common";
import "@skryensya/core/patterns/layout.css";
import "@skryensya/core/patterns/box.css";
import "@skryensya/core/patterns/hero.css";
import "@skryensya/core/patterns/footer.css";
import "@skryensya/core/patterns/wrapper.css";
import "@skryensya/core/patterns/media-overlay.css";
import "@skryensya/core/patterns/image-frame.css";
import "@skryensya/core/components/tile.css";
import "@skryensya/core/components/changelog.css";
import "@skryensya/core/components/placeholder.css";
import "@skryensya/core/components/sidebar.css";
import "@skryensya/core/components/checkbox.css";
import "@skryensya/core/components/radio-group.css";
import "@skryensya/core/components/switch.css";

function Specimen({ id, data, index }: { id: string; data: Fixture; index: number }) {
  const [clicks, setClicks] = useState(0);
  const [selection, setSelection] = useState("");
  const { items, title, body, worst } = data;
  const content = items.map((text, i) => <Box key={i} border="subtle" padding="sm"><strong>{text}</strong>{i === 0 && body ? <p>{body}</p> : null}</Box>);
  const tileContent = (text: string) => <TileContent title={text} description={worst ? body : undefined} />;
  switch (id) {
    case "stack": return <Stack>{content}</Stack>;
    case "inline": return <Inline>{content}</Inline>;
    case "grid": return <Grid responsive columns={3}>{content}</Grid>;
    case "wrapper": return <Wrapper><Stack>{content}</Stack></Wrapper>;
    case "layout-grid": return <LayoutGrid>{items.map((text, i) => <section key={i} data-width={i % 2 ? "breakout" : "content"}><h3>{text}</h3><p>{body}</p></section>)}</LayoutGrid>;
    case "hero": return <Hero><h3>{title}</h3>{body ? <p>{body}</p> : null}<Inline>{items.map((text, i) => <Button key={i} variant="ghost">{text}</Button>)}</Inline></Hero>;
    case "footer": return <Footer as="div"><h3>{title}</h3><Inline>{items.map((text, i) => <a key={i} href="#break-findings-title">{text}</a>)}</Inline>{body ? <p>{body}</p> : null}</Footer>;
    case "app-shell": return <AppShell height="fit" sidebarPersistent><header><h3>{title}</h3></header><Sidebar landmarkLabel={`Projects ${index}`}><SidebarContent>{content}</SidebarContent></Sidebar><Main><p>{body}</p></Main><Footer as="div">Local workspace preview</Footer></AppShell>;
    case "card": return <Grid responsive columns={2}>{items.map((text, i) => <Box key={i} border="default" surface="surface" padding="md" radius="surface"><Stack><h3>{text}</h3><p>{body}</p><Button onClick={() => setClicks((n) => n + 1)}>Review</Button></Stack></Box>)}<output>{clicks} actions</output></Grid>;
    case "changelog": return <Changelog>{items.map((text, i) => <ChangelogRelease key={i} version={worst ? "1.0.0-international-billing-reconciliation.1284" : `1.0.${i}`} date={i % 2 ? undefined : "2026-09-18"} dateLabel="September 18, 2026"><ChangelogEntry kindLabel={worst ? "Backward-incompatible changes" : "Changed"} title={text} target={worst ? "workspace.security.notification.configuration" : undefined}><p>{body}</p></ChangelogEntry></ChangelogRelease>)}</Changelog>;
    case "media-overlay": return <ImageFrame src="/demos/lightbox/coast.jpg" alt="Coastline" aspect="4/3" caption={<MediaOverlay strength="strong"><h3>{title}</h3>{body ? <p>{body}</p> : null}</MediaOverlay>} />;
    case "placeholder": return <div aria-busy="true"><p role="status">Loading workspace review</p>{items.map((_, i) => <PlaceholderParagraph key={i} lines={worst ? 1000 : 3} />)}</div>;
    case "icon": return <Inline>{items.map((text, i) => <span key={i}><Icon name={i % 2 ? "folder" : "check"} label={text} />{i === 0 ? <span>{body}</span> : null}</span>)}</Inline>;
    case "tile-radio-group": return <><TileRadioGroup name={`break-tile-radio-${index}`} aria-label={title} items={items.map((text, i) => ({ value: `choice-${i}`, children: tileContent(text), disabled: worst && i === 2 }))} onValueChange={({ value }) => setSelection(value)} /><output>{selection}</output></>;
    case "tile-checkbox": return <Stack>{items.map((text, i) => <TileCheckbox key={i} value={`choice-${i}`} disabled={worst && i === 2}>{tileContent(text)}</TileCheckbox>)}</Stack>;
    case "tile-switch": return <Stack>{items.map((text, i) => <TileSwitch key={i} disabled={worst && i === 2}>{tileContent(text)}</TileSwitch>)}</Stack>;
    case "tile-link": return <Stack>{items.map((text, i) => <TileLink key={i} href="#break-findings-title">{tileContent(text)}</TileLink>)}</Stack>;
    case "tile-button": return <><Stack>{items.map((text, i) => <TileButton key={i} disabled={worst && i === 2} onClick={() => setClicks((n) => n + 1)}>{tileContent(text)}</TileButton>)}</Stack><output>{clicks} actions</output></>;
    case "expandable-tile": return <Stack>{items.map((text, i) => <ExpandableTile key={i} defaultOpen={i === 0} disabled={worst && i === 2}><ExpandableTile.Trigger>{tileContent(text)}<TileChevron /></ExpandableTile.Trigger><ExpandableTile.Content><p>{body || "No additional notes."}</p></ExpandableTile.Content></ExpandableTile>)}</Stack>;
    default: throw new Error(`Unknown layout specimen: ${id}`);
  }
}

export default function LayoutBreak({ id }: { id: string }) {
  const large = ["stack", "inline", "grid", "card", "changelog", "tile-link", "tile-button", "tile-checkbox", "tile-switch", "tile-radio-group"].includes(id);
  return <FixtureCases id={id} large={large} render={(data, index) => <Specimen id={id} data={data} index={index} />} />;
}
