export const toastMessages = {
  es: {
    "demo.toast.dismiss": "Descartar",
    "demo.toast.linkCopied": "Enlace copiado al portapapeles.",
    "demo.toast.documentArchived": "Documento archivado",
    "demo.toast.movedToArchived": "Se movió a Archivados.",
    "demo.toast.undo": "Deshacer",
    "demo.toast.emit": "Emitir toast",
    "demo.toast.dynamic": "La exportación terminó.",
    "demo.toast.syncing": "Sincronizando",
    "demo.toast.syncingBody": "Esto puede tardar unos segundos.",
    "demo.toast.deploymentCreated": "Despliegue creado",
    "demo.toast.deploymentCreatedBody": "La versión ya está disponible.",
    "demo.toast.connectionFailed": "No se pudo conectar",
    "demo.toast.connectionFailedBody": "Revisa tu conexión y vuelve a intentarlo.",
    "demo.toast.status.saved": "Cambios guardados",
    "demo.toast.status.copied": "Enlace copiado",
    "demo.toast.status.failed": "No se pudo guardar",
    "demo.toast.stack.first": "Exportación preparada.",
    "demo.toast.stack.second": "Informe enviado.",
    "demo.toast.stack.third": "Permisos actualizados.",

    "toastPage.description": "Avisa del resultado de una acción sin interrumpir, y se retira solo.",

    "toastPage.key.dismiss": "Con el foco en la ✕, cierra el aviso.",

    "toastPage.a11yYours2": "No pongas en un aviso lo único que dice que algo falló.",

    "toastPage.a11yYours1": "Un aviso con acción no debe retirarse solo: da tiempo para usarla (WCAG 2.2, 2.2.1).",

    "toastPage.a11yDoes3": "La ✕ tiene nombre accesible.",

    "toastPage.a11yDoes2": "El foco no se mueve al aviso.",

    "toastPage.a11yDoes1": 'Los avisos se anuncian con <code>role="status"</code>; los de error, con <code>role="alert"</code>.',

    "toastPage.a11yIntro": "Toast anuncia el aviso sin mover el foco.",

    "toastPage.content3": "Una acción como mucho, con un verbo: «Deshacer».",

    "toastPage.content2": "Si falla, di qué hacer: «No se pudo enviar. Reintenta».",

    "toastPage.content1": "Escribe una línea, con el resultado: «Cambios guardados», no «La operación se completó con éxito».",

    "toastPage.whenNot3": "Para un cambio que ya se ve en la pantalla: no hace falta avisar.",

    "toastPage.whenNot2": 'Si hay que decidir algo antes de seguir: usa <a href="/es/componentes/dialog">Dialog</a>.',

    "toastPage.whenNot1": 'Para un error que hay que resolver para seguir: ponlo junto al campo o en un <a href="/es/componentes/callout">Callout</a>.',

    "toastPage.when2": "Para ofrecer deshacer lo que se acaba de hacer.",

    "toastPage.when1": "Para confirmar algo que acaba de pasar: guardado, enviado, copiado.",

    "toastPage.contract4": "La ✕ es un Button de solo ícono, tamaño <code>sm</code>.",

    "toastPage.contract3": "No maneja colas: agregar y quitar avisos es de tu app.",

    "toastPage.contract2": "<code>data-timeout</code> lo retira solo y emite <code>sk:toastdismiss</code>.",

    "toastPage.contract1": "Cada aviso es un Callout dentro de una región <code>sk-toast-region</code>.",
    "toastPage.lede": 'Toast avisa del resultado de una acción sin interrumpir lo que la persona está haciendo: «Cambios guardados», «Enlace copiado», «No se pudo enviar». Aparece en una esquina y se retira solo, salvo que pida algo. Tiene la forma de un <a href="/es/componentes/callout">Callout</a>.',
    "toastPage.anatomyBody":
      "La región y un toast completo: ícono, contenido, título, descripción, acciones y dismiss. El ítem reutiliza las partes de Callout; solo el cierre es propio de Toast. Congelado.",
    "toastPage.anatomyLabel": "Anatomía de Toast",
    "toastPage.anatomyPreviewLabel": "Toast, parte por parte",
    "toastPage.emitTitle": "Después de una acción: aparece al guardar",
    "toastPage.emitBody": "Presiona el botón: el aviso aparece en la región y se retira a los segundos.",
    "toastPage.simpleTitle": "Simple: neutral",
    "toastPage.simpleBody": "El texto dice el aviso; el color no pinta urgencia de más.",
    "toastPage.statusTitle": "Con estado: éxito, aviso y error",
    "toastPage.statusBody1": "<code>danger</code> se anuncia de inmediato; los demás, cuando el lector de pantalla termina. El que pide algo no se retira solo.",
    "toastPage.actionTitle": "Con acción: Deshacer",
    "toastPage.actionBody": "Un aviso con acción no se retira solo: se cierra al usarla o con la ✕.",
    "toastPage.stackTitle": "Apilados: uno sobre otro",
    "toastPage.stackBody1": 'Varios avisos se apilan detrás del más nuevo y se abren al pasar el puntero o al recibir el foco. <code>data-stack="off"</code> los muestra todos a la vez.',
    "toastPage.stackNote": "Pasa el puntero para abrirla",
    "toastPage.reactBody":
      'El código está en la pestaña <strong>React</strong> de cada preview. La API refleja Callout (<code>title</code>, <code>icon</code>, <code>actions</code>, <code>tone</code>) más <code>timeout</code> y <code>onDismiss</code> con razón. Sin <code>tone</code>, es neutral.',
    "toastPage.vanillaComment": "Los iconos se escriben como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "toastPage.test1": "Aplica la semántica compartida de región viva y reporta el cierre por botón nativo.",
    "toastPage.test2": "Solo agenda los timeouts escritos a mano y los limpia durante el cleanup.",
    "toastPage.test3": "Monta el markup de toast escrito a mano a través del enhancer del registro.",
    "toastPage.guidelinesLede": "Un aviso que desaparece sirve para lo que no hay que resolver.",
  },
  en: {
    "demo.toast.dismiss": "Dismiss",
    "demo.toast.linkCopied": "Link copied to clipboard.",
    "demo.toast.documentArchived": "Document archived",
    "demo.toast.movedToArchived": "Moved to Archived.",
    "demo.toast.undo": "Undo",
    "demo.toast.emit": "Emit toast",
    "demo.toast.dynamic": "The export finished.",
    "demo.toast.syncing": "Syncing",
    "demo.toast.syncingBody": "This may take a few seconds.",
    "demo.toast.deploymentCreated": "Deployment created",
    "demo.toast.deploymentCreatedBody": "The version is now available.",
    "demo.toast.connectionFailed": "Could not connect",
    "demo.toast.connectionFailedBody": "Check your connection and try again.",
    "demo.toast.status.saved": "Changes saved",
    "demo.toast.status.copied": "Link copied",
    "demo.toast.status.failed": "Could not save",
    "demo.toast.stack.first": "Export prepared.",
    "demo.toast.stack.second": "Report sent.",
    "demo.toast.stack.third": "Permissions updated.",

    "toastPage.description": "Reports an action's result without interrupting, and leaves by itself.",

    "toastPage.key.dismiss": "With focus on the ✕, closes the notice.",

    "toastPage.a11yYours2": "Do not put the only statement that something failed in a notice.",

    "toastPage.a11yYours1": "A notice with an action must not leave by itself: give time to use it (WCAG 2.2, 2.2.1).",

    "toastPage.a11yDoes3": "The ✕ has an accessible name.",

    "toastPage.a11yDoes2": "Focus does not move to the notice.",

    "toastPage.a11yDoes1": 'Notices are announced with <code>role="status"</code>; errors with <code>role="alert"</code>.',

    "toastPage.a11yIntro": "Toast announces the notice without moving focus.",

    "toastPage.content3": "One action at most, with a verb: “Undo”.",

    "toastPage.content2": "If it fails, say what to do: “Could not send. Retry”.",

    "toastPage.content1": "Write one line, with the result: “Changes saved”, not “The operation completed successfully”.",

    "toastPage.whenNot3": "For a change already visible on screen: no notice is needed.",

    "toastPage.whenNot2": 'If something must be decided before going on: use <a href="/components/dialog">Dialog</a>.',

    "toastPage.whenNot1": 'For an error that must be resolved to go on: put it beside the field or in a <a href="/components/callout">Callout</a>.',

    "toastPage.when2": "To offer undoing what was just done.",

    "toastPage.when1": "To confirm something that just happened: saved, sent, copied.",

    "toastPage.contract4": "The ✕ is an icon-only Button, size <code>sm</code>.",

    "toastPage.contract3": "It manages no queue: adding and removing notices is your app's job.",

    "toastPage.contract2": "<code>data-timeout</code> removes it by itself and emits <code>sk:toastdismiss</code>.",

    "toastPage.contract1": "Each notice is a Callout inside an <code>sk-toast-region</code>.",
    "toastPage.lede": 'Toast reports an action\'s result without interrupting what people are doing: “Changes saved”, “Link copied”, “Could not send”. It appears in a corner and leaves by itself, unless it asks for something. It is shaped like a <a href="/components/callout">Callout</a>.',
    "toastPage.anatomyBody":
      "The region and one full toast: icon, content, title, description, actions, and dismiss. The item reuses Callout parts; only the close control is Toast's own. Frozen.",
    "toastPage.anatomyLabel": "Toast anatomy",
    "toastPage.anatomyPreviewLabel": "Toast, part by part",
    "toastPage.emitTitle": "After an action: it appears on save",
    "toastPage.emitBody": "Press the button: the notice appears in the region and leaves after a few seconds.",
    "toastPage.simpleTitle": "Simple: neutral",
    "toastPage.simpleBody": "The text says the notice; the color does not overstate urgency.",
    "toastPage.statusTitle": "With status: success, warning and error",
    "toastPage.statusBody1": "<code>danger</code> is announced at once; the others, when the screen reader finishes. One that asks for something does not leave by itself.",
    "toastPage.actionTitle": "With an action: Undo",
    "toastPage.actionBody": "A notice with an action does not leave by itself: it closes on use or with the ✕.",
    "toastPage.stackTitle": "Stacked: one on another",
    "toastPage.stackBody1": 'Several notices stack behind the newest and open on hover or focus. <code>data-stack="off"</code> shows them all at once.',
    "toastPage.stackNote": "Hover to open it",
    "toastPage.reactBody":
      'The code is in each preview\'s <strong>React</strong> tab. The API mirrors Callout\'s (<code>title</code>, <code>icon</code>, <code>actions</code>, <code>tone</code>) plus <code>timeout</code> and <code>onDismiss</code> with a reason. With no <code>tone</code>, it is neutral.',
    "toastPage.vanillaComment": "Icons are written as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "toastPage.test1": "Applies the shared live-region semantics and reports native button dismissal.",
    "toastPage.test2": "Only schedules authored timeouts and clears them during cleanup.",
    "toastPage.test3": "Mounts authored toast markup through the registry enhancer.",
    "toastPage.guidelinesLede": "A notice that disappears suits what does not need resolving.",
  },
} as const;
