const [file, name] = process.argv.slice(2);
const { buildFigmaManifest } = await import("./src/build.ts");
const r = (await import(`./src/realizations/${file}.ts`))[name];
const m = await buildFigmaManifest(r);
for (const w of m.diagnostics.filter((d) => d.severity === "warning").slice(0, 5)) console.log("WARN", w.code, w.subject, w.message.slice(0, 160));
for (const s of m.components.filter((c: any) => c.kind === "component-set") as any[]) {
  const c = s.cells[0];
  console.log(s.id, "|", s.axes.map((a: any) => `${a.name}:${a.values.join("/")}`).join(" "), "| props", s.properties.map((p: any) => p.name).join(","), "|", c.key);
  const box = (b: any) => b ? `${b.direction[0]} ${b.mainAlign}/${b.crossAlign}${b.width ? " w=" + JSON.stringify(b.width) : ""}${b.height ? " h=" + JSON.stringify(b.height) : ""}${b.stretch ? " stretch" : ""}${b.grow ? " grow" : ""}` : "";
  const surf = (s: any) => s ? `fills=${s.fills.map((f: any) => JSON.stringify(f.color ?? f.type)).join("+")} strokes=${s.strokes.length} fx=${s.effects.length}` : "";
  console.log("  host", box(m.styles.boxes[c.box]), surf(m.styles.surfaces[c.surface]));
  const walk = (ls: any[], p = "   ") => ls.forEach((l) => { console.log(p, l.kind, l.slot, l.kind === "frame" ? box(m.styles.boxes[l.box]) + " " + surf(m.styles.surfaces[l.surface]) : l.kind === "text" ? `${l.characters ?? ""} ${JSON.stringify(l.text.fill.color)}${l.fill ? " fill" : ""}` : ""); if (l.kind === "frame") walk(l.layers, p + "  "); });
  walk(m.styles.layers[c.layers]);
}
