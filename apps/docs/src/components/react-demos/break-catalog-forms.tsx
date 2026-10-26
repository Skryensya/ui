import { useState } from "react";
import { ColorPicker } from "@skryensya/react/color-picker";
import { QRCode } from "@skryensya/react/qr-code";
import { Questionnaire, QuestionnaireItem } from "@skryensya/react/questionnaire";
import { Resizable } from "@skryensya/react/resizable";
import { TablePager, TablePagerBar, TablePagerSize, TablePagerEnd, TablePagerStatus, TablePagerNav } from "@skryensya/react/pagination";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@skryensya/react/table";
import { NativeSelect } from "@skryensya/react/select-native";
import { Treegrid, TreegridHead, TreegridHeadRow, TreegridColumnHeader, TreegridBody, TreegridRow, TreegridCell, TreegridScroll } from "@skryensya/react/treegrid";
import { FixtureCases, FIXTURES, URL, EMAIL, type Fixture } from "./break-catalog-common";
import "@skryensya/core/components/color-picker.css";
import "@skryensya/core/components/toolbar.css";
import "@skryensya/core/components/popover.css";
import "@skryensya/core/components/qr-code.css";
import "@skryensya/core/components/questionnaire.css";
import "@skryensya/core/components/tile.css";
import "@skryensya/core/components/form-field.css";
import "@skryensya/core/components/input.css";
import "@skryensya/core/components/radio-group.css";
import "@skryensya/core/components/checkbox.css";
import "@skryensya/core/components/progress.css";
import "@skryensya/core/components/steps.css";
import "@skryensya/core/components/resizable.css";
import "@skryensya/core/components/table.css";
import "@skryensya/core/components/select.css";
import "@skryensya/core/components/treegrid.css";
import "@skryensya/core/patterns/table-pager.css";
import "@skryensya/core/patterns/splitter.css";
import "@skryensya/core/patterns/anchored.css";

function Specimen({ id, data, index }: { id: string; data: Fixture; index: number }) {
  const [status, setStatus] = useState("No changes yet");
  const { title, body, items, worst } = data;
  switch (id) {
    case "color-picker": return <><ColorPicker label={title} defaultValue={worst ? "#ffffff00" : "#1266cc"} disabled={!items.length} swatches={items.map((_, i) => `hsl(${i * 47 % 360} 70% 50%)`)} onValueChange={({ value }) => setStatus(value)} /><output>{status}</output></>;
    case "qr-code": return <QRCode label={`Open workspace reference - ${title}`} value={!items.length ? "" : worst ? `BEGIN:VCARD\nVERSION:3.0\nFN:Aleksandra Wiśniewska-Kowalczyk\nEMAIL:${EMAIL}\nURL:${URL}\nNOTE:${body}\nEND:VCARD` : items.length === 1 ? "J" : URL} />;
    case "questionnaire": return <Questionnaire aria-label={title} progress="steps" onSubmit={(event) => event.preventDefault()} onValuesSubmit={() => setStatus("Answers validated locally; nothing submitted")}><QuestionnaireItem name={`review-${index}`} title={title} description={body} required choices={items.map((text, i) => ({ value: `option-${i}`, label: text, description: i === 0 && worst ? body : undefined, disabled: worst && i === 2 }))} /><QuestionnaireItem name={`contact-${index}`} title="Contact for the review" text textType="email" textLabel="Email address" required /></Questionnaire>;
    case "resizable": return <Resizable>{items.length ? <Resizable.Panel size={35} minSize={15} collapsible minInlineSize={worst ? "20rem" : undefined}><h3>{items[0]}</h3><p>{body}</p></Resizable.Panel> : null}{items.length > 1 ? <Resizable.Handle label={`Resize ${title}`} /> : null}{items.length > 1 ? <Resizable.Panel size={65} minSize={25}><h3>{items[1]}</h3><p>{body}</p></Resizable.Panel> : null}</Resizable>;
    case "table-pager": return <TablePager pageSize={5} statusTemplate="{start}–{end} of {total}" previousLabel="Previous page" nextLabel="Next page" pageLabel="Page {page}"><Table><TableHead><TableRow><TableHeader scope="col">Project</TableHeader><TableHeader scope="col">Owner</TableHeader></TableRow></TableHead><TableBody>{items.map((text, i) => <TableRow key={i}><TableCell>{text}</TableCell><TableCell>{worst ? EMAIL : "Jo"}</TableCell></TableRow>)}</TableBody></Table><TablePagerBar><TablePagerSize><NativeSelect aria-label="Rows per page" defaultValue="5"><option value="5">5</option><option value="20">20</option></NativeSelect></TablePagerSize><TablePagerEnd><TablePagerStatus>{""}</TablePagerStatus><TablePagerNav label="Project pages" /></TablePagerEnd></TablePagerBar></TablePager>;
    case "treegrid": return <TreegridScroll><Treegrid label={title} resizableColumns resizeLabel="Resize column"><TreegridHead><TreegridHeadRow><TreegridColumnHeader>Project</TreegridColumnHeader><TreegridColumnHeader>Owner</TreegridColumnHeader></TreegridHeadRow></TreegridHead><TreegridBody>{items.map((text, i) => <TreegridRow key={i} value={`row-${index}-${i}`} level={i === 0 ? 1 : 2} posInset={i === 0 ? 1 : i} setSize={i === 0 ? 1 : items.length - 1} expanded={i === 0 && items.length > 1 ? true : undefined}><TreegridCell>{text}</TreegridCell><TreegridCell>{worst && i === 0 ? EMAIL : "Jo"}</TreegridCell></TreegridRow>)}</TreegridBody></Treegrid></TreegridScroll>;
    default: throw new Error(`Unknown form specimen: ${id}`);
  }
}

export default function FormsBreak({ id }: { id: string }) {
  const fixtures = id === "color-picker" ? FIXTURES.map((fixture) => fixture.label === "Empty" ? { ...fixture, label: "Disabled" } : fixture) : FIXTURES;
  return <FixtureCases id={id} fixtures={fixtures} large={["table-pager", "treegrid"].includes(id)} render={(data, index) => <Specimen id={id} data={data} index={index} />} />;
}
