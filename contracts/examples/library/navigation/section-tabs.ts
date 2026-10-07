import { definePattern, type PatternModule } from "../../model/types.js";
import { text } from "../kit.js";

interface Content {
  label: string;
  selected: string;
  tabs: { value: string; label: string; body: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "section-tabs",
  subject: "navigation",
  scale: "component",
  title: { en: "Section tabs", es: "Pestañas de sección" },
  layout: { en: "Tabs whose every entry is a label and a panel of one muted paragraph; one entry starts selected.", es: "Tabs donde cada entrada es una etiqueta y un panel con un párrafo atenuado; una entrada empieza seleccionada." },
  fields: { label: { en: "The tab list's accessible name.", es: "El nombre accesible de la lista de pestañas." }, selected: { en: "The `value` of the entry that starts open.", es: "El `value` de la entrada que empieza abierta." }, tabs: { en: "Each entry: a stable `value`, its label and its panel's text.", es: "Cada entrada: un `value` estable, su etiqueta y el texto de su panel." } },
  notes: [{ en: "Tabs switch panels in place; if each one is its own address, use a link group instead.", es: "Las pestañas cambian paneles en el mismo lugar; si cada una es su propia dirección, usa un grupo de enlaces." }],
  build: ({ label, selected, tabs }) => ({
    contract: "tabs",
    signature: "Tabs",
    options: { value: selected },
    attrs: { "aria-label": label },
    slots: { items: tabs.map((tab) => ({ options: { value: tab.value }, slots: { label: tab.label, children: text(tab.body, { size: "sm", tone: "secondary" }) } })) },
  }),
});

export const sectionTabs: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "tabs-account-sections", intent: "navigation/destinations/section-tabs", title: { en: "Account sections", es: "Secciones de cuenta" }, purpose: { en: "Switch between the sections of one screen without leaving it.", es: "Cambiar entre las secciones de una pantalla sin salir de ella." }, content: { label: { en: "Account sections", es: "Secciones de la cuenta" }, selected: "overview", tabs: [{ value: "overview", label: { en: "Overview", es: "Resumen" }, body: { en: "Your plan, your usage this month and who owns the account.", es: "Tu plan, tu uso de este mes y quién es el dueño de la cuenta." } }, { value: "activity", label: { en: "Activity", es: "Actividad" }, body: { en: "Everything that changed on the account, newest first.", es: "Todo lo que cambió en la cuenta, lo más reciente primero." } }, { value: "billing", label: { en: "Billing", es: "Facturación" }, body: { en: "Payment methods, invoices and the next charge.", es: "Métodos de pago, facturas y el próximo cargo." } }] } }),
  ],
};
