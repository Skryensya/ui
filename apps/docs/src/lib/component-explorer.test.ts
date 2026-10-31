import { describe, expect, it } from "vitest";
import { prepareComponentSearch, scoreComponentQuery } from "./component-search";

describe("component catalogue search", () => {
  it.each([
    ["Button botón acciones", "boton", true],
    ["Navegación con teclado", "NAVEGACION", true],
    ["DatePicker fecha calendario", " fecha  picker ", true],
    ["DatePicker fecha calendario", "fecha upload", false],
    ["Badge insignia estado", "insignia", true],
    ["Button", "   ", true],
    ["Button", "<script>", false],
  ])("matches %j against %j: %s", (words, query, expected) => {
    expect(scoreComponentQuery(prepareComponentSearch([words]), query) !== null).toBe(expected);
  });
});
