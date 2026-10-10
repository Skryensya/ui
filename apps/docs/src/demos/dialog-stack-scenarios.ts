import type { UsageTree } from "@skryensya/core/usage-tree";

/** Docs compositions, not new component options. Closing a demo does not submit data. */
export function dialogStackScenarios(spanish: boolean) {
  const copy = (en: string, es: string) => spanish ? es : en;
  const node = (signature: string, children?: UsageTree["children"]): UsageTree => ({ contract: "dialog-stack", signature, children });
  const input = (name: string, label: string, placeholder: string): UsageTree => ({
    contract: "form-field", signature: "FormField", slots: { label },
    children: { contract: "input", signature: "Input", options: { name, placeholder, type: name === "collaborator" ? "email" : "text" } },
  });
  const scenario = (value: string, label: string, open: string, steps: { title: string; description: string; field?: UsageTree }[], finish: string, explain: string) => ({
    value, label, explain,
    tree: {
      contract: "dialog-stack", signature: "DialogStack", options: { defaultOpen: true },
      children: [node("DialogStackTrigger", open), node("DialogStackOverlay"), node("DialogStackBody", steps.map((step, index) => node("DialogStackContent", [
        node("DialogStackHeader", [node("DialogStackTitle", step.title), node("DialogStackDescription", step.description)]),
        ...(step.field ? [step.field] : []),
        node("DialogStackFooter", [
          ...(index ? [node("DialogStackPrevious", copy("Back", "Volver"))] : []),
          ...(index < steps.length - 1 ? [node("DialogStackClose", copy("Cancel", "Cancelar"))] : []),
          index < steps.length - 1 ? node("DialogStackNext", copy("Continue", "Continuar")) : node("DialogStackClose", finish),
        ]),
      ])))],
    } satisfies UsageTree,
  });
  return [
    scenario("project", copy("New project", "Nuevo proyecto"), copy("Create project", "Crear proyecto"), [
      { title: copy("Name your project", "Pon nombre al proyecto"), description: copy("Use a name your team can find in the project list.", "Usa un nombre que tu equipo reconozca en la lista de proyectos."), field: input("project-name", copy("Project name", "Nombre del proyecto"), copy("Website redesign", "Rediseño web")) },
      { title: copy("Invite a collaborator", "Invita a una persona"), description: copy("They will receive an invitation to join this project. You can invite more people later.", "Recibirá una invitación para unirse al proyecto. Puedes invitar a más personas después."), field: input("collaborator", copy("Collaborator email", "Correo de la persona"), "alex@example.com") },
      { title: copy("Review before creating", "Revisa antes de crear"), description: copy("Go back to check the project name and invitation. This preview does not create a project or send email.", "Vuelve para comprobar el nombre y la invitación. Esta demo no crea proyectos ni envía correos.") },
    ], copy("Create project", "Crear proyecto"), copy("A short creation flow. Go back to edit: your input stays in its step. The final action only closes this demo.", "Un recorrido corto de creación. Vuelve para editar: lo escrito se conserva en su paso. La acción final solo cierra esta demo.")),
    scenario("export", copy("Export report", "Exportar informe"), copy("Export report", "Exportar informe"), [
      { title: copy("Name the export", "Nombra la exportación"), description: copy("Export the current sales report as a PDF. Choose a filename you can recognize later.", "Exporta el informe de ventas actual como PDF. Elige un nombre de archivo que reconozcas después."), field: input("export-name", copy("Filename", "Nombre del archivo"), "sales-report-october.pdf") },
      { title: copy("Ready to export", "Listo para exportar"), description: copy("The PDF includes the current report and its charts, without internal comments. Go back to change the filename. This preview does not download a file.", "El PDF incluye el informe actual y sus gráficos, sin comentarios internos. Vuelve para cambiar el nombre. Esta demo no descarga archivos.") },
    ], copy("Export PDF", "Exportar PDF"), copy("Two steps for a bounded task: configure, then review the outcome. No real download occurs.", "Dos pasos para una tarea acotada: configurar y revisar el resultado. No se realiza ninguna descarga.")),
  ];
}

export const dialogStackScenarioCss = `
.sk-dialog-stack__content > .sk-form-field { inline-size: 100%; }
.sk-dialog-stack {
  --sk-dialog-stack-inline-size: min(30rem, calc(100vi - 3rem));
  inline-size: 100%;
  min-block-size: calc(100dvh - 2 * var(--sk-component-preview-stage-padding));
  display: grid;
  place-items: center;
}
`;
