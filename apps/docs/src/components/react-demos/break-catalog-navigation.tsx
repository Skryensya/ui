import { useRef, useState } from "react";
import { AppBar, AppBarMenu, AppBarStatus } from "@skryensya/react/app-bar";
import { Navbar, NavbarBrand, NavbarActions } from "@skryensya/react/navbar";
import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";
import { Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarResizeHandle } from "@skryensya/react/sidebar";
import { Megamenu, MegamenuTrigger } from "@skryensya/react/megamenu";
import { Vaul, Drawer } from "@skryensya/react/vaul";
import { Window } from "@skryensya/react/window";
import { DialogStack, DialogStackTrigger, DialogStackBody, DialogStackContent, DialogStackHeader, DialogStackTitle, DialogStackDescription, DialogStackFooter, DialogStackNext, DialogStackPrevious, DialogStackClose } from "@skryensya/react/dialog-stack";
import { Toc } from "@skryensya/react/toc";
import { SkipLink, skipLinkTarget } from "@skryensya/react/skip-link";
import { Tour } from "@skryensya/react/tour";
import { Annotated } from "@skryensya/react/annotation";
import { Box } from "@skryensya/react/layout";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { FixtureCases, type Fixture } from "./break-catalog-common";
import "@skryensya/core/components/app-bar.css";
import "@skryensya/core/components/navbar.css";
import "@skryensya/core/components/sidebar.css";
import "@skryensya/core/components/megamenu.css";
import "@skryensya/core/components/menu.css";
import "@skryensya/core/components/dialog.css";
import "@skryensya/core/components/dialog-stack.css";
import "@skryensya/core/components/window.css";
import "@skryensya/core/components/toc.css";
import "@skryensya/core/components/tour.css";
import "@skryensya/core/components/annotation.css";
import "@skryensya/core/components/canvas.css";
import "@skryensya/core/components/skip-link.css";
import "@skryensya/core/patterns/nav-list.css";
import "@skryensya/core/patterns/vaul.css";
import "@skryensya/core/patterns/anchored.css";

function Specimen({ id, data, index }: { id: string; data: Fixture; index: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState("No action yet");
  const { items, title, body, worst } = data;
  const prefix = `break-${id}-${index}`;
  const nav = <NavList aria-label={`${title} links`}><NavListGroup label={title}>{items.map((text, i) => <NavListLink key={i} href={`#${prefix}-target`} icon={<Icon name="folder" />} current={i === 0}>{text}</NavListLink>)}</NavListGroup></NavList>;
  const menus = items.map((text, i) => ({ value: `action-${i}`, label: text, disabled: worst && i === 2 }));
  switch (id) {
    case "app-bar": return <><AppBar label={title} status={<AppBarStatus>{worst ? "Review required by international billing administrators" : "Saved"}</AppBarStatus>}>{items.map((text, i) => <AppBarMenu key={i} items={menus} onSelect={({ value }) => setAction(value)}>{text}</AppBarMenu>)}</AppBar><output>{action}</output></>;
    case "navbar": return <Navbar><NavbarBrand>{title}</NavbarBrand>{nav}<NavbarActions><Button onClick={() => setAction("review")}>Review workspace</Button></NavbarActions></Navbar>;
    case "megamenu": return <Megamenu label={title}>{items.slice(0, 4).map((text, i) => <MegamenuTrigger key={i} columns={[0, 1].map((column) => <NavListGroup key={column} label={`Projects ${column + 1}`}>{items.map((name, j) => <NavListLink key={j} href={`#${prefix}-target`}>{name}</NavListLink>)}</NavListGroup>)}>{text}</MegamenuTrigger>)}</Megamenu>;
    case "sidebar": return <Sidebar landmarkLabel={title}><SidebarHeader><SidebarTrigger label="Collapse navigation" />{title}</SidebarHeader><SidebarContent>{nav}</SidebarContent><SidebarResizeHandle label="Resize navigation" /></Sidebar>;
    case "drawer":
    case "vaul": { const Panel = id === "drawer" ? Drawer : Vaul; return <><Button onClick={() => dialog.current?.showModal()}>Open {id}</Button><Panel ref={dialog} label={title} edge={id === "drawer" ? "inline-start" : "block-end"}><h3>{title}</h3><p>{body}</p>{nav}<Vaul.Close>Close panel</Vaul.Close></Panel></>; }
    case "window": return <Window trigger="Open window" title={title} closeLabel="Close window" maximizeLabel="Maximize window" minimizeLabel="Minimize window" restoreLabel="Restore window"><p>{body}</p>{nav}</Window>;
    case "dialog-stack": return <DialogStack><DialogStackTrigger>Open review</DialogStackTrigger><DialogStackBody aria-label={title}>{(items.length ? items : ["No review items"]).map((text, i) => <DialogStackContent key={i}><DialogStackHeader><DialogStackTitle>{text}</DialogStackTitle><DialogStackDescription>{body}</DialogStackDescription></DialogStackHeader><DialogStackFooter><DialogStackPrevious>Previous</DialogStackPrevious><DialogStackNext>Continue review</DialogStackNext><DialogStackClose>Close review</DialogStackClose></DialogStackFooter></DialogStackContent>)}</DialogStackBody></DialogStack>;
    case "toc": return <><Toc title={title} items={items.map((text, i) => ({ href: `#${prefix}-${i}`, children: text, level: i % 2 ? "h3" : "h2" }))} />{items.map((text, i) => <section key={i}><h3 id={`${prefix}-${i}`}>{text}</h3><p>{body}</p></section>)}</>;
    case "skip-link": return <><p>Tab to reveal the native skip link.</p><SkipLink href={`#${prefix}-target`}>{worst ? title : "Skip workspace navigation"}</SkipLink>{nav}<section id={`${prefix}-target`} {...skipLinkTarget}><h3>{title}</h3><p>{body}</p></section></>;
    case "tour": return <><Tour.Trigger opens={prefix} label="Start workspace tour" restartLabel="Repeat workspace tour" /><Button id={`${prefix}-target`}>Review target</Button><Tour id={prefix} remember={false} steps={items.map((text, i) => ({ target: worst && i === 1 ? `#${prefix}-missing` : `#${prefix}-target`, title: text, description: body || "Review this workspace section." }))} /></>;
    case "annotation": return <Annotated label={title} subject={<Box border="default" padding="md"><h3 data-break-subject="">{title}</h3><p>{body}</p></Box>} annotations={items.map((text, i) => ({ for: "[data-break-subject]", side: i % 2 ? "inline-end" : "inline-start", children: text }))} />;
    default: throw new Error(`Unknown navigation specimen: ${id}`);
  }
}

export default function NavigationBreak({ id }: { id: string }) {
  return <FixtureCases id={id} large={["sidebar", "toc"].includes(id)} render={(data, index) => <Specimen id={id} data={data} index={index} />} />;
}
