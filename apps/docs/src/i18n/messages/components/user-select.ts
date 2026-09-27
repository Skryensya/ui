export const userSelectMessages = {
  es: {
    "userSelectPage.label.term": "usuarios",
    "userSelectPage.label.placeholder": "Seleccionar {term}",
    "userSelectPage.label.searchPlaceholder": "Buscar {term}...",
    "userSelectPage.label.unselected": "Nadie seleccionado",
    "userSelectPage.label.count": "{count} {term}",
    "userSelectPage.label.selectedCount": "{count} seleccionados",
    "userSelectPage.label.selectedOne": "{name} seleccionado",
    "userSelectPage.label.selectedMany": "{count} {term} seleccionados",
    "userSelectPage.label.clear": "Limpiar",
    "userSelectPage.label.empty": "No hay {term} disponibles",
    "userSelectPage.label.noResults": "No hay {term} que coincidan con \"{query}\"",
    "userSelectPage.label.noResultsHint": "Prueba con otro nombre o email.",
    "userSelectPage.label.loading": "Cargando {term}...",
    "userSelectPage.label.result": "1 resultado disponible",
    "userSelectPage.label.results": "{count} resultados disponibles",
    "userSelectPage.anatomyBody":
      "Un UserSelect es un <code>Select</code> con búsqueda y selección múltiple: el trigger resume la selección con un <code>GroupedAvatar</code> y un conteo, y el content (sólo presente mientras está abierto) apila el buscador, el listbox y el pie. Las partes con atributo <code>data-sk-user-select-*</code> son las que la composición agrega; si no las autoras, el enhancer Vanilla las genera. El espécimen se dibuja abierto y queda así.",
    "userSelectPage.anatomyLabel": "Anatomía de UserSelect",
    "userSelectPage.anatomyPreviewLabel": "UserSelect abierto, parte por parte",
    "userSelectPage.description": "UserSelect: un selector múltiple de personas compuesto sobre Select, Avatar y GroupedAvatar.",
    "userSelectPage.lede":
      "Un selector de personas construido sobre <code>Select</code>: su trigger, su máquina y su dropdown, más lo que un selector de personas necesita y un Select no tiene: búsqueda, un checkbox por fila (la selección es múltiple), un resumen con <code>GroupedAvatar</code> en el trigger y estados vacíos. Tiene contrato y hoja propios (<code>user-select.css</code>); al lado de un <code>Select</code> normal se leen como la misma familia.",
    "userSelectPage.calloutBody":
      "El trigger reutiliza exactamente el chrome de <code>Select</code> (altura, borde, radio, focus, chevron). El dropdown reutiliza su posicionamiento, su portal y su animación, con <code>composite: false</code> para poder alojar un campo de búsqueda real junto al listbox. Cada fila lleva su propio <code>Avatar</code>; el resumen del trigger lo repite, nunca inventa otro.",
    "userSelectPage.basicTitle": "Selección múltiple con búsqueda",
    "userSelectPage.basicBody":
      "Busca por nombre o email; la búsqueda nunca cierra el dropdown ni limpia la selección. Cada fila entera es el objetivo de clic: el check es sólo el estado visual, nunca un control aparte.",
    "userSelectPage.statesTitle": "Estados",
    "userSelectPage.statesBody":
      "Vacío, un usuario, varios (con el <code>+N</code> de <code>GroupedAvatar</code>), deshabilitado, cargando y sin resultados: todos leen los mismos tokens y patrones que ya usa el resto del sistema.",
    "userSelectPage.a11yTitle": "Accesibilidad",
    "userSelectPage.a11yItem1":
      "El trigger expone una única etiqueta textual (\"Select users, 3 users selected\"); los avatars dentro son decorativos (<code>aria-hidden</code>), así un lector de pantalla nunca interpreta imágenes superpuestas.",
    "userSelectPage.a11yItem2":
      "Cada fila es una única opción (<code>role=\"option\"</code>); el avatar, el nombre y el check no son controles independientes.",
    "userSelectPage.a11yItem3":
      "<code>Tab</code> enfoca el trigger; <code>Enter</code>/<code>Space</code> abre y mueve el foco al buscador; las flechas navegan el listado; <code>Enter</code> selecciona o deselecciona la fila activa; <code>Escape</code> cierra y devuelve el foco al trigger.",
    "userSelectPage.a11yItem4":
      "El estado seleccionado nunca depende sólo del color: el check permanece visible además del tinte de fondo.",
    "userSelectPage.vanillaTitle": "Vanilla",
    "userSelectPage.vanillaBody":
      "El enhancer nunca inventa una fila: lee <code>data-value</code>, el nombre y la descripción (el email) de cada <code>[data-sk-select-item]</code> ya autorado, y clona su propio <code>.sk-avatar</code> para el resumen del trigger, nunca deriva iniciales por su cuenta. El wrapper del listado (<code>role=\"listbox\"</code>), la fila vacía y el pie \"N seleccionados · Clear all\" se generan solos si no los autoras.",
    "userSelectPage.explicitMountNote":
      "UserSelect se monta solo con <code>initComponents()</code>, como el resto del sistema. <code>mountUserSelect()</code> sigue disponible para montar uno solo a mano.",
    "userSelectPage.listenTitle": "Escuchar el cambio",
    "userSelectPage.reactTitle": "React",
    "userSelectPage.reactBody":
      "Completamente controlado, como <code>Select</code>: <code>value</code>/<code>onValueChange</code> son del consumidor. Reutiliza el mismo <code>@zag-js/select</code> que usa <code>Select</code>, con <code>multiple</code> y <code>composite: false</code>.",
  },
  en: {
    "userSelectPage.label.term": "users",
    "userSelectPage.label.placeholder": "Select {term}",
    "userSelectPage.label.searchPlaceholder": "Search {term}...",
    "userSelectPage.label.unselected": "No one selected",
    "userSelectPage.label.count": "{count} {term}",
    "userSelectPage.label.selectedCount": "{count} selected",
    "userSelectPage.label.selectedOne": "{name} selected",
    "userSelectPage.label.selectedMany": "{count} {term} selected",
    "userSelectPage.label.clear": "Clear all",
    "userSelectPage.label.empty": "No {term} available",
    "userSelectPage.label.noResults": "No {term} match \"{query}\"",
    "userSelectPage.label.noResultsHint": "Try another name or email.",
    "userSelectPage.label.loading": "Loading {term}...",
    "userSelectPage.label.result": "1 result available",
    "userSelectPage.label.results": "{count} results available",
    "userSelectPage.anatomyBody":
      "A UserSelect is a <code>Select</code> with search and multiple selection: the trigger sums up the selection with a <code>GroupedAvatar</code> and a count, and the content (present only while open) stacks the search field, the listbox and the footer. The parts named by a <code>data-sk-user-select-*</code> attribute are the ones the composition adds; left unauthored, the Vanilla enhancer generates them. The specimen is drawn open and stays open.",
    "userSelectPage.anatomyLabel": "UserSelect anatomy",
    "userSelectPage.anatomyPreviewLabel": "An open UserSelect, part by part",
    "userSelectPage.description": "UserSelect: a multi-person picker composed from Select, Avatar and GroupedAvatar.",
    "userSelectPage.lede":
      "A people picker built on <code>Select</code>: its trigger, its machine and its dropdown, plus what a people picker needs and a Select does not have: search, a checkbox per row (the selection is multiple), a <code>GroupedAvatar</code> summary in the trigger and empty states. It has its own contract and sheet (<code>user-select.css</code>); beside a plain <code>Select</code> the two read as the same family.",
    "userSelectPage.calloutBody":
      "The trigger reuses Select's exact chrome (height, border, radius, focus, chevron). The dropdown reuses its positioning, portal and animation, with <code>composite: false</code> so it can hold a real search field next to the listbox. Every row carries its own <code>Avatar</code>; the trigger's summary repeats it, never invents another.",
    "userSelectPage.basicTitle": "Multi-select with search",
    "userSelectPage.basicBody":
      "Search by name or email; searching never closes the dropdown or clears the selection. The whole row is the click target: the check is only the visual state, never a separate control.",
    "userSelectPage.statesTitle": "States",
    "userSelectPage.statesBody":
      "Empty, one user, several (with <code>GroupedAvatar</code>'s own <code>+N</code>), disabled, loading and no results: all reading the same tokens and patterns the rest of the system already uses.",
    "userSelectPage.a11yTitle": "Accessibility",
    "userSelectPage.a11yItem1":
      "The trigger carries one composed text label (\"Select users, 3 users selected\"); the avatars inside it are decorative (<code>aria-hidden</code>), so a screen reader never parses stacked images.",
    "userSelectPage.a11yItem2":
      "Each row is a single option (<code>role=\"option\"</code>); the avatar, the name and the check are never independent controls.",
    "userSelectPage.a11yItem3":
      "<code>Tab</code> focuses the trigger; <code>Enter</code>/<code>Space</code> opens it and moves focus to the search field; the arrows navigate the list; <code>Enter</code> toggles the active row; <code>Escape</code> closes and returns focus to the trigger.",
    "userSelectPage.a11yItem4":
      "Selected state never depends on color alone: the check stays visible alongside the background tint.",
    "userSelectPage.vanillaTitle": "Vanilla",
    "userSelectPage.vanillaBody":
      "The enhancer never invents a row: it reads <code>data-value</code>, the name and the description (the email) off each authored <code>[data-sk-select-item]</code>, and clones its own <code>.sk-avatar</code> for the trigger's summary, it never derives initials on its own. The list wrapper (<code>role=\"listbox\"</code>), the empty row and the \"N selected · Clear all\" footer generate themselves when not authored.",
    "userSelectPage.explicitMountNote":
      "UserSelect mounts through <code>initComponents()</code>, like the rest of the system. <code>mountUserSelect()</code> is still there to mount one by hand.",
    "userSelectPage.listenTitle": "Listening for the change",
    "userSelectPage.reactTitle": "React",
    "userSelectPage.reactBody":
      "Fully controlled, like <code>Select</code>: <code>value</code>/<code>onValueChange</code> stay the consumer's. It reuses the same <code>@zag-js/select</code> machine <code>Select</code> uses, with <code>multiple</code> and <code>composite: false</code>.",
  },
} as const;
