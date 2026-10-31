import { describe, expect, it } from "vitest";
import { prepareComponentSearch, scoreComponentQuery } from "./component-search";

const button = prepareComponentSearch(["Button", "botón", "botón de acción"], "Ejecuta una acción. Runs an action.");
const datePicker = prepareComponentSearch(["DatePicker", "selector de fecha", "date input"]);

describe("fuzzy component search", () => {
  it.each(["Button", "BUTTON", "botón", "boton", "boton de accion", "buton", "buttom", "butotn", "botno", "btn"])(
    "finds Button for %j", (query) => expect(scoreComponentQuery(button, query)).not.toBeNull(),
  );

  it.each(["DatePicker", "date picker", "date-picker", "DATEPICKER", "dtpkr", "dp", "selector fecha", "date fecha", "selecor de fecha"])(
    "finds DatePicker for %j", (query) => expect(scoreComponentQuery(datePicker, query)).not.toBeNull(),
  );

  it.each(["zzzzzz", "calendar upload", "butter", "<script>", "a".repeat(5000)])(
    "rejects unrelated queries", (query) => expect(scoreComponentQuery(button, query)).toBeNull(),
  );

  it("does not turn short queries or prose into fuzzy matches", () => {
    expect(scoreComponentQuery(button, "bt")).toBeNull();
    const badge = prepareComponentSearch(["Badge", "insignia"], "A button introduces a notification.");
    expect(scoreComponentQuery(badge, "btn")).toBeNull();
    expect(scoreComponentQuery(badge, "button")).not.toBeNull();
  });

  it("does not fuzzy-match generated initials or tiny alias words", () => {
    expect(scoreComponentQuery(prepareComponentSearch(["Navbar", "barra de navegación"]), "btn")).toBeNull();
    expect(scoreComponentQuery(prepareComponentSearch(["in"]), "pin")).toBeNull();
  });

  it("matches every query word, regardless of order", () => {
    expect(scoreComponentQuery(datePicker, "fecha selector")).not.toBeNull();
    expect(scoreComponentQuery(datePicker, "fecha upload")).toBeNull();
  });

  it("keeps all entries when the query is empty", () => {
    expect(scoreComponentQuery(button, "   ")).toBe(0);
  });

  it("ranks exact names, prefixes, typos, abbreviations and descriptions in that order", () => {
    const prefix = prepareComponentSearch(["ButtonGroup"]);
    const context = prepareComponentSearch(["Card"], "Contains a button.");
    expect(scoreComponentQuery(button, "button")).toBeLessThan(scoreComponentQuery(prefix, "button")!);
    expect(scoreComponentQuery(prefix, "button")).toBeLessThan(scoreComponentQuery(button, "buton")!);
    expect(scoreComponentQuery(button, "buton")).toBeLessThan(scoreComponentQuery(button, "btn")!);
    expect(scoreComponentQuery(button, "btn")).toBeLessThan(scoreComponentQuery(context, "button")!);
  });

  it("prefers a typo in a whole name to a typo in one word of a longer name", () => {
    expect(scoreComponentQuery(button, "buton")).toBeLessThan(scoreComponentQuery(prepareComponentSearch(["ButtonGroup"]), "buton")!);
  });
});
