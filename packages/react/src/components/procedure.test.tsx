import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Procedure, ProcedureStep } from "./procedure.js";

describe("Procedure", () => {
  it("renders a native ordered sequence of instructions", () => {
    const ui = render(
      <Procedure aria-label="Instalación">
        <ProcedureStep title="Instala el paquete">Contenido del primer paso</ProcedureStep>
        <ProcedureStep title="Importa los estilos">Contenido del segundo paso</ProcedureStep>
      </Procedure>,
    );

    const list = ui.getByRole("list", { name: "Instalación" });
    expect(list.tagName).toBe("OL");
    expect(list.className).toContain("sk-procedure");
    expect(ui.getAllByRole("listitem")).toHaveLength(2);
  });

  it("keeps each title and arbitrary step content inside its item", () => {
    const ui = render(
      <Procedure>
        <ProcedureStep className="setup" data-phase="setup" title="Instala el paquete">
          <p>Usa el gestor de paquetes del proyecto.</p>
          <code>pnpm add @skryensya/core</code>
        </ProcedureStep>
      </Procedure>,
    );

    const item = ui.getByRole("listitem");
    expect(item.className).toContain("sk-procedure__step");
    expect(item.className).toContain("setup");
    expect(item.getAttribute("data-phase")).toBe("setup");
    expect(ui.getByText("Instala el paquete").className).toContain("sk-procedure__title");
    expect(ui.getByText("pnpm add @skryensya/core").tagName).toBe("CODE");
  });

  it("types the title as string to match the contract text slot", () => {
    const ui = render(
      <Procedure>
        <ProcedureStep title="Solo el título" />
      </Procedure>,
    );
    expect(ui.getByText("Solo el título").tagName).toBe("SPAN");
  });
});
