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
    "install.reactMount": "En React no hay nada que montar: {name} se conecta solo al renderizarse. No llames a <code>initComponents()</code> ni a ningún <code>mount…</code>.",
    "install.autoWhen": "Automático. <code>initComponents()</code> escanea el documento una vez, en el momento exacto de la llamada. Si encuentra <code>{selector}</code>, carga solo el enhancer de {name} y monta cada instancia; lo que no esté en la página no se descarga. Repetirlo es seguro: no duplica nada.",
    "install.autoLater": "Lo que añadas al DOM después no se monta solo: vuelve a llamar con el contenedor nuevo. Más en {autoLink}.",
    "install.notAuto": "{name} no forma parte del montaje automático: <code>initComponents()</code> no lo monta. Llama a <code>{mount}()</code> tú mismo.",
    "install.vanillaMount": "Por separado. Este entry point importa solo el enhancer de {name}, sin el auto-loader ni otros componentes. Sin argumento monta cada instancia del documento; con una raíz, solo esa.",
    "install.autoOnce": "Al arrancar la página: monta lo que ya está en el DOM",
    "install.autoAgain": "Tras insertar markup nuevo (un diálogo, una ruta): solo esa parte",
    "install.mountAll": "Todas las instancias del documento",
    "install.mountOne": "Una sola instancia",
    "install.bindingGroup": "Binding de la instalación",
    "install.vanillaGenerated":
      "Instala el paquete de tokens y estilos, e importa las hojas que este componente usa. El marcado lo escribes tú: la capa vanilla no trae componentes, trae las clases que ese marcado lleva.",
    "install.sheetOnly": "Importa los tokens y la hoja de {name}; no hace falta el paquete completo.",
    "install.sheetAlso": "Esa hoja ya carga por su cuenta: {sheets}.",
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
    "install.reactMount": "In React there is nothing to mount: {name} wires itself up when it renders. Do not call <code>initComponents()</code> or any <code>mount…</code>.",
    "install.autoWhen": "Automatic. <code>initComponents()</code> scans the document once, at the moment of the call. If it finds <code>{selector}</code> it loads only the {name} enhancer and mounts every instance; what is not on the page is never downloaded. Calling it again is safe: nothing is duplicated.",
    "install.autoLater": "Whatever you add to the DOM afterwards is not mounted on its own: call it again with the new container. More at {autoLink}.",
    "install.notAuto": "{name} is not part of automatic mounting: <code>initComponents()</code> does not mount it. Call <code>{mount}()</code> yourself.",
    "install.vanillaMount": "On its own. This entry point imports only the {name} enhancer, with no auto-loader and no other component. With no argument it mounts every instance in the document; with a root, only that one.",
    "install.autoOnce": "On page start: mounts what is already in the DOM",
    "install.autoAgain": "After inserting new markup (a dialog, a route): only that part",
    "install.mountAll": "Every instance in the document",
    "install.mountOne": "One instance",
    "install.bindingGroup": "Installation binding",
    "install.vanillaGenerated":
      "Install the tokens-and-styles package and import the sheets this component uses. The markup is yours to write: the vanilla layer ships no components, it ships the classes that markup carries.",
    "install.sheetOnly": "Import the tokens and the {name} sheet; the full package is not needed.",
    "install.sheetAlso": "That sheet already loads by itself: {sheets}.",
    "install.reactNone": "{name} has no React component of its own: it is markup and CSS. Import its sheet and write the markup with its classes.",
    "install.reactOnly": "Import {name} from its own entry point, with its sheet; no other component loads.",
    "install.vanillaNoMount":
      "There is nothing to mount: this component is markup and CSS, so it works as soon as the sheet is loaded.",
  },
} as const;
