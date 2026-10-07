import { definePattern, type PatternModule } from "../../model/types.js";
import { action, box, grid, heading, inline, separator, stack, text } from "../kit.js";
import { renderField, type FieldSpec } from "./fields.js";

interface Content {
  sections: { title: string; body: string; fields: FieldSpec[] }[];
  cancel: string;
  save: string;
  /** Id of the use that holds the destructive action, outside the card. */
  danger: string;
}

const { pattern, use } = definePattern<Content>({
  id: "settings-sections",
  subject: "form",
  scale: "composition",
  title: { en: "Settings sections", es: "Secciones de ajustes" },
  layout: { en: "One card, one form: sections separated by rules, each with its explanation on a narrow column and its fields on a wide one (stacked on a phone), one shared footer, and the destructive action outside the card.", es: "Una card, un formulario: secciones separadas por líneas, cada una con su explicación en una columna angosta y sus campos en una ancha (apilados en el teléfono), un pie compartido y la acción destructiva fuera de la card." },
  fields: { sections: { en: "Each section: title, explanation and fields.", es: "Cada sección: título, explicación y campos." }, cancel: { en: "Discard changes.", es: "Descartar cambios." }, save: { en: "Save changes.", es: "Guardar cambios." }, danger: { en: "Id of the danger callout.", es: "Id del callout de peligro." } },
  notes: [{ en: "One save for the whole card: the sections are parts of the same settings, so they share a footer instead of each carrying a button. The explanation beside the fields is the section's heading, so a screen reader jumps by section.", es: "Un guardado para toda la card: las secciones son partes de los mismos ajustes, así que comparten pie en vez de llevar cada una un botón. La explicación junto a los campos es el título de la sección, así un lector de pantalla salta por sección." }],
  build: ({ sections, cancel, save, danger }, ctx) =>
    stack(
      [
        box(
          [
            stack(
              [
                ...sections.flatMap((section, index) => [
                  ...(index > 0 ? [separator()] : []),
                  grid([stack([heading(section.title), text(section.body, { size: "sm", tone: "secondary" })], { gap: "xs" }), stack(section.fields.map((field) => renderField(field, ctx.ns)), { gap: "md" }, { "data-span": "2" })], { columns: "3", gap: "lg", responsive: true }),
                ]),
                separator(),
                inline([action(cancel, { variant: "ghost", type: "reset" }), action(save, { tone: "accent", type: "submit" })], { gap: "sm", justify: "end", wrap: false }),
              ],
              { gap: "xl" },
            ),
          ],
          { surface: "surface", border: "subtle", padding: "lg", boxElement: "article" },
        ),
        ctx.render(danger),
      ],
      { gap: "lg" },
    ),
});

export const settingsSections: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "settings-account",
      intent: "input/preferences/settings-page",
      title: { en: "Settings page", es: "Página de ajustes" },
      purpose: { en: "Sections with their explanation on one side and their fields on the other.", es: "Secciones con su explicación a un lado y sus campos al otro." },
      content: {
        sections: [
          { title: { en: "Profile", es: "Perfil" }, body: { en: "How others on the team see you.", es: "Cómo te ven los demás en el equipo." }, fields: [{ kind: "photo", person: { name: "Ana Pérez", initials: "AP" }, action: { en: "Change photo", es: "Cambiar foto" } }, { kind: "text", name: "name", label: { en: "Full name", es: "Nombre completo" }, placeholder: { en: "Jane Doe", es: "Ana Pérez" }, required: true }, { kind: "textarea", name: "bio", label: { en: "Bio", es: "Biografía" }, hint: { en: "Shown on your profile. Up to 160 characters.", es: "Aparece en tu perfil. Hasta 160 caracteres." }, placeholder: { en: "I design products for small teams.", es: "Diseño productos para equipos pequeños." } }] },
          { title: { en: "Account", es: "Cuenta" }, body: { en: "Your email and your language.", es: "Tu correo y tu idioma." }, fields: [{ kind: "email", name: "email", label: { en: "Email", es: "Correo" }, placeholder: { en: "name@example.com", es: "nombre@ejemplo.com" }, hint: { en: "We use it to tell you about changes to your account.", es: "Lo usamos para avisarte de cambios en tu cuenta." }, required: true }, { kind: "select", name: "language", label: { en: "Language", es: "Idioma" }, value: "es", options: [{ value: "es", label: "Español" }, { value: "en", label: "English" }, { value: "pt", label: "Português" }] }] },
        ],
        cancel: { en: "Cancel", es: "Cancelar" },
        save: { en: "Save changes", es: "Guardar cambios" },
        danger: "danger-delete-account",
      },
    }),
  ],
};
