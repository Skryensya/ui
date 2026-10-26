/*
 * The Installation panel's own chrome: the Vanilla | React switch and the Vanilla half the shell
 * generates for a page that does not write one (`ComponentPageShell.astro`).
 */
export const installMessages = {
  es: {
    "install.stepInstall": "Instalar",
    "install.stepStyles": "Estilos",
    "install.stepImport": "Importar",
    "install.stepMount": "Montaje",
    "install.stepHooks": "Ganchos de estilo",
    "install.reactMount": "En React no hay nada que montar: {name} se conecta solo al renderizarse. No llames a <code>initComponents()</code> ni a ningún <code>mount…</code>.",
    "install.autoWhen": "<strong>Opción 1: montar todo lo que haya en la página.</strong> Llama a <code>initComponents()</code> una vez al cargar. Recorre el documento y, por cada componente que encuentra (aquí <code>{selector}</code>, el de {name}), descarga solo el código de ese componente y lo activa. Los que no están en la página nunca se descargan.",
    "install.autoLater": "Solo mira en el momento en que la llamas. Si añades markup después (un diálogo, otra ruta), vuelve a llamarla pasando ese elemento y solo se activa esa parte. Llamarla dos veces sobre el mismo markup es seguro: no se duplica nada. Más en {autoLink}.",
    "install.notAuto": "{name} no forma parte del montaje automático: <code>initComponents()</code> no lo monta. Llama a <code>{mount}()</code> tú mismo.",
    "install.vanillaMount": "<strong>Opción 2: solo {name}.</strong> Importa únicamente la función de montaje de este componente: no trae el auto-loader ni ningún otro componente. Úsala cuando la página tiene un solo componente o quieres decidir tú cuándo arranca.",
    "install.appearanceSheets": "Cada apariencia es su propia hoja: importa solo las que uses",
    "install.autoOnce": "Al cargar la página: activa todo lo que ya está en el DOM",
    "install.autoAgain": "Tras añadir markup nuevo: activa solo esa parte",
    "install.mountAll": "Todas las instancias de la página",
    "install.mountOne": "Una sola instancia",
    "install.bindingGroup": "Binding de la instalación",
    "install.vanillaGenerated":
      "Instala el paquete vanilla, que ya trae los tokens y los estilos, e importa las hojas que este componente usa. El marcado lo escribes tú: la capa vanilla no trae componentes, trae las clases que ese marcado lleva.",
    "install.sheetOnly": "Importa los tokens y la hoja de {name}; no hace falta el paquete completo.",
    "install.sheetAlso": "Esa hoja ya importa {sheets} por dentro: no hace falta que lo añadas tú.",
    "install.reactNone": "{name} no tiene componente de React propio: es marcado y CSS. Importa su hoja y escribe el marcado con sus clases.",
    "install.reactOnly": "Importa {name} desde su propio entry point, junto con su hoja; ningún otro componente se carga.",
    "install.vanillaNoMount":
      "No hay nada que montar: este componente es marcado y CSS, así que funciona apenas la hoja está cargada.",
  },
  en: {
    "install.stepInstall": "Install",
    "install.stepStyles": "Styles",
    "install.stepImport": "Import",
    "install.stepMount": "Mounting",
    "install.stepHooks": "Style hooks",
    "install.reactMount": "In React there is nothing to mount: {name} wires itself up when it renders. Do not call <code>initComponents()</code> or any <code>mount…</code>.",
    "install.autoWhen": "<strong>Option 1: mount everything on the page.</strong> Call <code>initComponents()</code> once when the page loads. It looks through the document and, for each component it finds (here <code>{selector}</code>, the {name} one), downloads only that component's code and turns it on. Components that are not on the page are never downloaded.",
    "install.autoLater": "It only looks at the moment you call it. If you add markup later (a dialog, a new route), call it again with that element and only that part is set up. Calling it twice on the same markup is safe: nothing is duplicated. More at {autoLink}.",
    "install.notAuto": "{name} is not part of automatic mounting: <code>initComponents()</code> does not mount it. Call <code>{mount}()</code> yourself.",
    "install.vanillaMount": "<strong>Option 2: only {name}.</strong> Import just this component's mount function. It brings no auto-loader and no other component. Use it when the page has a single component or you want to decide when it starts.",
    "install.appearanceSheets": "Each appearance is its own sheet: import only the ones you use",
    "install.autoOnce": "When the page loads: sets up everything already in the DOM",
    "install.autoAgain": "After adding new markup: sets up only that part",
    "install.mountAll": "Every instance on the page",
    "install.mountOne": "Just one instance",
    "install.bindingGroup": "Installation binding",
    "install.vanillaGenerated":
      "Install the vanilla package, which already carries the tokens and styles, and import the sheets this component uses. The markup is yours to write: the vanilla layer ships no components, it ships the classes that markup carries.",
    "install.sheetOnly": "Import the tokens and the {name} sheet; the full package is not needed.",
    "install.sheetAlso": "That sheet already imports {sheets} for you, so you do not add it yourself.",
    "install.reactNone": "{name} has no React component of its own: it is markup and CSS. Import its sheet and write the markup with its classes.",
    "install.reactOnly": "Import {name} from its own entry point, with its sheet; no other component loads.",
    "install.vanillaNoMount":
      "There is nothing to mount: this component is markup and CSS, so it works as soon as the sheet is loaded.",
  },
} as const;
