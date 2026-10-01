export const commentThreadMessages = {
  es: {

    "commentThread.description": "Muestra una conversación con respuestas anidadas: quién escribió, cuándo y qué dijo.",

    "commentThread.a11yKeyEnter": "Activa el control con foco.",

    "commentThread.a11yKeyTab": "Recorre los controles de cada comentario en orden.",

    "commentThread.a11yYours2": 'Borrar no pide confirmación: compón un <a href="/es/componentes/dialog">Dialog</a> si la necesitas.',

    "commentThread.a11yYours1": "Nombra el hilo con <code>label</code>: «Comentarios».",

    "commentThread.a11yDoes3": "El plegado anuncia su estado con <code>aria-expanded</code>.",

    "commentThread.a11yDoes2": "Cada control es un <code>&lt;button&gt;</code> en el orden de tabulación; los de voto tienen nombre propio.",

    "commentThread.a11yDoes1": "Las respuestas son <code>&lt;article&gt;</code> anidados: un lector de pantalla calcula la jerarquía sin <code>aria-level</code>.",

    "commentThread.a11yIntro": "Cada comentario es un <code>&lt;article&gt;</code>; la anidación se lee sola.",

    "commentThread.content4": "Traduce los nombres de los votos: los que trae por defecto dicen «Upvote» y «Downvote».",

    "commentThread.content3": "Al borrar, di qué se pierde: «Se borra junto con sus respuestas».",

    "commentThread.content2": "Nombra las acciones con un verbo: «Responder», «Eliminar».",

    "commentThread.content1": "Muestra la hora relativa («hace 3 h») y la fecha completa en el <code>title</code>.",

    "commentThread.dd.collapse.dont": "Sin controles de plegado, la rama completa empuja el siguiente comentario principal hacia abajo.",

    "commentThread.dd.collapse.do": "Pliega esta conversación anidada y el siguiente comentario principal queda a la vista.",

    "commentThread.dd.collapse.title": "Hilos profundos: plegar una rama",

    "commentThread.dd.permissions.title": "Borrado: solo en lo propio",

    "commentThread.dd.permissions.do": "La app muestra «Eliminar» en el comentario de Ada, pero no en el de Grace.",

    "commentThread.dd.permissions.dont": "Poner «Eliminar» en todos los comentarios promete un permiso que la persona quizá no tiene.",

    "commentThread.dd.nesting.title": "Respuestas: bajo el comentario que contestan",

    "commentThread.dd.nesting.do": "Anidar la respuesta deja claro qué comentario continúa la conversación.",

    "commentThread.dd.nesting.dont": "Como comentarios al mismo nivel, las respuestas pierden el vínculo con aquello que contestan.",

    "commentThread.dd.reaction.title": "Mecánica: reacción o ranking, según el propósito",

    "commentThread.dd.reaction.do": "Si solo quieres expresar simpatía, usa «me gusta»: no hace falta ordenar los comentarios.",

    "commentThread.dd.reaction.dont": "Para una reacción casual, flechas y puntaje hacen parecer que los comentarios compiten. Si quieres ordenarlos, los votos sí tienen sentido.",

    "commentThread.dd.actions.title": "Acciones: solo si hacen falta",

    "commentThread.dd.actions.do": "Si el comentario es solo para leer, muestra autor, fecha y texto, sin controles extra.",

    "commentThread.dd.actions.dont": "Agregar votos, respuestas y borrado a un comentario informativo crea controles que no aportan nada.",

    "commentThread.whenNot3": 'Para una actividad del sistema con horas: usa <a href="/es/componentes/timeline">Timeline</a>.',

    "commentThread.whenNot2": 'Para una jerarquía que se selecciona, como archivos: usa <a href="/es/componentes/tree-view">TreeView</a>.',

    "commentThread.whenNot1": 'Para un flujo plano, sin respuestas anidadas: usa <a href="/es/componentes/feed">Feed</a>.',

    "commentThread.when2": "Para citar un comentario en otra parte: usa <code>Comment</code> solo.",

    "commentThread.when1": "Para una conversación con respuestas anidadas: comentarios de un documento, de un artículo, de una tarea.",

    "commentThread.contract4": "<code>CommentComposer</code> acepta cualquier control: un Textarea, un Input o un Editor.",

    "commentThread.contract3": "Las respuestas se componen: <code>Comment</code> dentro de <code>Comment</code>, a cualquier profundidad.",

    "commentThread.contract2": "Plegar y abrir el cuadro de respuesta sí son estado propio.",

    "commentThread.contract1": "Votar o borrar solo despacha el evento (<code>onVote</code>, <code>onDelete</code> o un <code>CustomEvent</code>): el estado que se ve es el que trae tu dato.",
    "commentThread.lede": "CommentThread muestra una conversación con respuestas anidadas: quién escribió, cuándo y qué dijo, con votos, respuestas y borrado si hacen falta. Son cinco piezas que se usan juntas o sueltas; la más simple, <code>Comment</code>, vale sin hilo alrededor.",
    "commentThread.anatomyBody": "Las partes de un comentario con respuesta y fila de acciones.",
    "commentThread.anatomyLabel": "Anatomía de Comment",
    "commentThread.anatomyPreviewLabel": "Comment, parte por parte",
    "commentThread.demoTitle": "Un comentario: la pieza más simple",
    "commentThread.demoBody": "Autor, hora y texto, sin hilo ni acciones.",
    "commentThread.demoActionsTitle": "Con acciones: votar, responder, borrar",
    "commentThread.demoActionsBody": "Un <code>CommentVote</code> dentro de <code>CommentActions</code>. Quién puede votar o borrar se decide al componer.",
    "commentThread.demoActionsLabel": "Comentario con acciones",
    "commentThread.demoLikesTitle": "Me gusta en vez de votos",
    "commentThread.demoLikesBody": 'Con <code>voteStyle="like"</code> las flechas pasan a pulgares: un voto ordena, un me gusta reacciona. Pasa siempre los dos nombres.',
    "commentThread.demoLikesLabel": "Comentario con me gusta",
    "commentThread.demoThreadTitle": "Un hilo corto: plegado donde hay respuestas",
    "commentThread.demoThreadBody": "El botón de plegado solo aparece en los comentarios con respuestas.",
    "commentThread.demoFixedTitle": "Sin plegado: ninguna respuesta se oculta",
    "commentThread.demoFixedBody": "Para un hilo de soporte o moderación, donde ocultar una respuesta nunca es lo que se quiere.",
    "commentThread.demoFixedLabel": "Hilo profundo sin plegado",
    "commentThread.demoDeepTitle": "Profundidad: cuatro niveles",
    "commentThread.demoDeepBody": "El conector se dibuja por respuesta, a cualquier profundidad.",
    "commentThread.demoDeepLabel": "Hilo profundo",
    "commentThread.demoLabel": "Comentarios de ejemplo",
    "commentThread.demoLoadingTitle": "Carga: el placeholder y el scroll infinito",
    "commentThread.demoLoadingBody": "Qué se ve mientras algo carga, y cómo convive con lo que ya cargó.",
    "commentThread.demoSkeletonTitle": "El placeholder: la forma de un comentario",
    "commentThread.demoSkeletonBody": "Un círculo para el avatar y barras para el encabezado y el cuerpo. La espera se anuncia una sola vez, no por fila.",
    "commentThread.demoInfiniteTitle": "Al desplazarse: carga de a poco",
    "commentThread.demoInfiniteBody": "Al llegar al final aparece el placeholder donde caerá el próximo comentario, y el comentario real lo reemplaza.",
    "commentThread.demoInfiniteLabel": "Hilo con carga progresiva",
    "commentThread.vanillaApiTitle": "En Vanilla: escuchar, vetar, escribir y crear",
    "commentThread.vanillaApiBody1": "Los eventos burbujean y se pueden cancelar con <code>preventDefault()</code>; <code>setCommentVote</code> escribe el estado y un <code>CommentTemplate</code> se clona para crear comentarios.",
    "commentThread.htmlTitle": "HTML escrito a mano",
    "commentThread.htmlBody":
      "Un comentario recursivo se compone repitiendo esta misma forma dentro de <code>.sk-comment-thread__replies</code>. El <code>FormField</code>/<code>Textarea</code> del formulario de respuesta queda a criterio de quien lo usa: aquí se omite por brevedad.",
    "commentThread.reactTitle": "React",
    "commentThread.test1": "Un <code>Comment</code> suelto renderiza autor, fecha y cuerpo, sin hilo ni chrome alrededor.",
    "commentThread.test2": "El slot <code>author</code> acepta contenido compuesto, no solo un string.",
    "commentThread.test3": "No hay control de plegado salvo que el comentario sea <code>collapsible</code> Y tenga respuestas que plegar.",
    "commentThread.test4": "Plegar oculta las RESPUESTAS y deja legible el comentario en sí: su cuerpo y sus acciones siguen ahí.",
    "commentThread.test5": "Las respuestas anidan como <code>Comment</code> de la misma forma, a cualquier profundidad.",
    "commentThread.test6": "<code>CommentVote</code> reporta la dirección clickeada y refleja el voto previo del lector.",
    "commentThread.test7": "<code>CommentActions</code> renderiza solo los botones que recibió, y reporta cada uno.",
    "commentThread.test8": "El composer publica el cuerpo del control que le pasaron y después lo limpia.",
    "commentThread.test9": "Lee un <code>Input</code> de una línea igual que un <code>Textarea</code>: no entrega ninguno.",
    "commentThread.test10": "No publica nada si el control está vacío.",
    "commentThread.test11": "El hilo se nombra a sí mismo y renderiza su composer arriba de los comentarios.",
    "commentThread.test12":
      "Despacha el voto con el id del comentario y la dirección clickeada, sin tocar la pintura por su cuenta.",
    "commentThread.test13": "El voto de una respuesta anidada se atribuye a la respuesta, no al comentario de arriba.",
    "commentThread.test14": "Despacha el borrado solo donde el botón de borrar existe.",
    "commentThread.test15":
      "Alterna <code>aria-expanded</code> y <code>hidden</code> del cuadro de respuesta, acotado a su propio comentario.",
    "commentThread.test16": "Plegar oculta las respuestas de ese comentario y no lo que el comentario dice.",
    "commentThread.test17":
      "Publica una respuesta con el id del comentario que la contiene como <code>parentId</code>, la limpia y cierra el cuadro.",
    "commentThread.test18": "El composer del hilo publica con <code>parentId</code> nulo.",
    "commentThread.test19": "Ignora una respuesta vacía: sin evento, formulario intacto.",
    "commentThread.test20": "Pliega las respuestas de un <code>Comment</code> suelto, sin hilo alrededor.",
    "commentThread.test21": "Un <code>CommentComposer</code> suelto publica reportando que no tiene padre.",
    "commentThread.test22": "Lee un input de una línea igual que un textarea: el composer no entrega ninguno.",
    "commentThread.test23": "También lee una superficie <code>contenteditable</code>, así un Editor puede ser el control.",
    "commentThread.test25": "Cancelar con la caja vacía la cierra sin preguntar: no hay nada que perder.",
    "commentThread.test26": "Cancelar con un borrador despacha <code>discard</code> y deja la caja abierta para que la app decida.",
    "commentThread.test27": "Una respuesta vetada con <code>preventDefault()</code> conserva el borrador y la caja.",
    "commentThread.test24": "El avatar va en el canal, aparte del nombre, para que la línea del hilo pueda colgar de él.",
    "commentThread.test28":
      "El control de plegado es un Button solo-icono en tamaño <code>xs</code>, no una cara achicada aquí.",
    "demo.commentThread.label": "Comentarios",
    "demo.commentThread.replyFieldLabel": "Respuesta",
    "demo.commentThread.replyPlaceholder": "Escribe una respuesta…",
    "demo.commentThread.send": "Responder",
    "demo.commentThread.now": "hace un momento",
    "demo.commentThread.loadingLabel": "Cargando comentarios",
    "demo.commentThread.loadingMoreLabel": "Cargando más comentarios",
    "demo.commentThread.deleteTitle": "¿Eliminar el comentario?",
    "demo.commentThread.deleteBody": "Se borra junto con sus respuestas. No se puede deshacer.",
    "demo.commentThread.deleteCancel": "Cancelar",
    "demo.commentThread.deleteConfirm": "Eliminar",
    "demo.commentThread.cancel": "Cancelar",
    "demo.commentThread.discardTitle": "¿Descartar lo escrito?",
    "demo.commentThread.discardBody": "Se pierde lo que escribiste en la respuesta.",
    "demo.commentThread.discardKeep": "Seguir escribiendo",
    "demo.commentThread.discardConfirm": "Descartar",
    "demo.commentThread.author1": "Ada",
    "demo.commentThread.ddParent": "¿Cómo seguimos?",
    "demo.commentThread.ddReply": "Dividamos la tarea.",
    "demo.commentThread.time1": "hace 3h",
    "demo.commentThread.body1": "¿Alguien probó la exportación a PDF con tablas largas? A mí se me corta en la segunda página.",
    "demo.commentThread.ddRoot": "¿Cómo seguimos?",
    "demo.commentThread.ddReply1": "Dividamos la tarea.",
    "demo.commentThread.ddReply2": "Yo tomo la parte técnica.",
    "demo.commentThread.ddReply3": "Yo reviso el diseño.",
    "demo.commentThread.ddNext": "Mientras tanto: otro tema.",
    /* The anatomy specimen's own text, short on purpose: the diagram names the BOX a message lives
       in, and three lines of lorem make that box tall enough to push its own labels apart. */
    "demo.commentThread.anatomyBody": "¿Alguien probó la exportación a PDF?",
    "demo.commentThread.anatomyReply": "Sí, funciona desde la versión 2.1.",
    "demo.commentThread.author2": "Grace",
    "demo.commentThread.time2": "hace 1h",
    "demo.commentThread.body2": "Me pasó lo mismo. Si las filas tienen texto largo, la tabla no parte bien entre páginas.",
    "demo.commentThread.author3": "Linus",
    "demo.commentThread.time3": "hace 40m",
    "demo.commentThread.body3": "Está arreglado en la versión 2.3. Actualiza y avísanos si sigue pasando.",
    "demo.commentThread.author4": "Margaret",
    "demo.commentThread.time4": "hace 10m",
    "demo.commentThread.body4": "Confirmo, con la 2.3 ya sale bien.",
    "demo.commentThread.author5": "Alan",
    "demo.commentThread.time5": "hace 5m",
    "demo.commentThread.body5": "¿Se puede elegir el tamaño de página? Necesito A4 y el sistema me da carta.",
    "demo.commentThread.author6": "Barbara",
    "demo.commentThread.time6": "hace 2m",
    "demo.commentThread.body6": "Está en Ajustes, en la sección Exportar.",
    "demo.commentThread.body7": "Gracias, no lo había visto.",
    "demo.commentThread.body8": "Estaría bien que se recordara la última elección.",
    "commentThread.guidelinesLede": "Un hilo muestra quién respondió a quién.",
  },
  en: {

    "commentThread.description": "Shows a conversation with nested replies: who wrote, when and what they said.",

    "commentThread.a11yKeyEnter": "Activates the focused control.",

    "commentThread.a11yKeyTab": "Moves through each comment's controls in order.",

    "commentThread.a11yYours2": 'Deleting asks for no confirmation: compose a <a href="/components/dialog">Dialog</a> if you need one.',

    "commentThread.a11yYours1": "Name the thread with <code>label</code>: “Comments”.",

    "commentThread.a11yDoes3": "Folding announces its state with <code>aria-expanded</code>.",

    "commentThread.a11yDoes2": "Each control is a <code>&lt;button&gt;</code> in the tab order; the vote buttons have their own names.",

    "commentThread.a11yDoes1": "Replies are nested <code>&lt;article&gt;</code>s: a screen reader works out the hierarchy without <code>aria-level</code>.",

    "commentThread.a11yIntro": "Each comment is an <code>&lt;article&gt;</code>; nesting reads on its own.",

    "commentThread.content4": "Translate the vote names: the defaults say “Upvote” and “Downvote”.",

    "commentThread.content3": "On delete, say what is lost: “It is deleted along with its replies”.",

    "commentThread.content2": "Name actions with a verb: “Reply”, “Delete”.",

    "commentThread.content1": "Show relative time (“3 h ago”) and the full date in the <code>title</code>.",

    "commentThread.dd.collapse.dont": "Without fold controls, the whole branch pushes the next main comment farther down.",

    "commentThread.dd.collapse.do": "Fold this nested conversation and the next main comment stays in view.",

    "commentThread.dd.collapse.title": "Deep threads: fold a branch",

    "commentThread.dd.permissions.title": "Deletion: only on your own comments",

    "commentThread.dd.permissions.do": "The app shows “Delete” on Ada's comment, but not Grace's.",

    "commentThread.dd.permissions.dont": "Showing “Delete” on every comment promises a permission the person may not have.",

    "commentThread.dd.nesting.title": "Replies: beneath the comment they answer",

    "commentThread.dd.nesting.do": "Nesting a reply makes clear which comment it continues.",

    "commentThread.dd.nesting.dont": "As comments at the same level, replies lose their connection to the message they answer.",

    "commentThread.dd.reaction.title": "Mechanic: reaction or ranking, depending on the goal",

    "commentThread.dd.reaction.do": "If you only want to show appreciation, use a like: there is no need to rank comments.",

    "commentThread.dd.reaction.dont": "For a casual reaction, arrows and a score make comments look like competitors. If you want to rank them, votes make sense.",

    "commentThread.dd.actions.title": "Actions: only when they are needed",

    "commentThread.dd.actions.do": "When a comment is only for reading, show its author, date and text without extra controls.",

    "commentThread.dd.actions.dont": "Adding votes, replies and deletion to an informational comment creates controls that serve no purpose.",

    "commentThread.whenNot3": 'For system activity with times: use <a href="/components/timeline">Timeline</a>.',

    "commentThread.whenNot2": 'For a selectable hierarchy, like files: use <a href="/components/tree-view">TreeView</a>.',

    "commentThread.whenNot1": 'For a flat stream with no nested replies: use <a href="/components/feed">Feed</a>.',

    "commentThread.when2": "To quote one comment elsewhere: use <code>Comment</code> alone.",

    "commentThread.when1": "For a conversation with nested replies: comments on a document, an article, a task.",

    "commentThread.contract4": "<code>CommentComposer</code> takes any control: a Textarea, an Input or an Editor.",

    "commentThread.contract3": "Replies are composed: <code>Comment</code> inside <code>Comment</code>, at any depth.",

    "commentThread.contract2": "Folding and opening the reply box are its own state.",

    "commentThread.contract1": "Voting or deleting only dispatches the event (<code>onVote</code>, <code>onDelete</code> or a <code>CustomEvent</code>): the visible state is whatever your data says.",
    "commentThread.lede": "CommentThread shows a conversation with nested replies: who wrote, when and what they said, with votes, replies and deletion when needed. It is five pieces used together or alone; the simplest, <code>Comment</code>, works with no thread around it.",
    "commentThread.anatomyBody": "The parts of a comment with a reply and an action row.",
    "commentThread.anatomyLabel": "Comment anatomy",
    "commentThread.anatomyPreviewLabel": "Comment, part by part",
    "commentThread.demoTitle": "One comment: the simplest piece",
    "commentThread.demoBody": "Author, time and text, with no thread and no actions.",
    "commentThread.demoActionsTitle": "With actions: vote, reply, delete",
    "commentThread.demoActionsBody": "A <code>CommentVote</code> inside <code>CommentActions</code>. Who can vote or delete is decided when composing.",
    "commentThread.demoActionsLabel": "Comment with actions",
    "commentThread.demoLikesTitle": "Likes instead of votes",
    "commentThread.demoLikesBody": 'With <code>voteStyle="like"</code> the arrows become thumbs: a vote ranks, a like reacts. Always pass both names.',
    "commentThread.demoLikesLabel": "Comment with likes",
    "commentThread.demoThreadTitle": "A short thread: folding where there are replies",
    "commentThread.demoThreadBody": "The fold button only appears on comments with replies.",
    "commentThread.demoFixedTitle": "No folding: no reply can be hidden",
    "commentThread.demoFixedBody": "For a support or moderation thread, where hiding a reply is never what is wanted.",
    "commentThread.demoFixedLabel": "Deep thread with no folding",
    "commentThread.demoDeepTitle": "Depth: four levels",
    "commentThread.demoDeepBody": "The connector is drawn per reply, at any depth.",
    "commentThread.demoDeepLabel": "Deep thread",
    "commentThread.demoLabel": "Sample comments",
    "commentThread.demoLoadingTitle": "Loading: the placeholder and infinite scroll",
    "commentThread.demoLoadingBody": "What shows while something loads, and how it lives beside what already loaded.",
    "commentThread.demoSkeletonTitle": "The placeholder: a comment's shape",
    "commentThread.demoSkeletonBody": "A circle for the avatar and bars for the header and body. The wait is announced once, not per row.",
    "commentThread.demoInfiniteTitle": "While scrolling: it loads bit by bit",
    "commentThread.demoInfiniteBody": "At the end, the placeholder appears where the next comment will land, and the real comment replaces it.",
    "commentThread.demoInfiniteLabel": "Thread with progressive loading",
    "commentThread.vanillaApiTitle": "In Vanilla: listen, veto, write and create",
    "commentThread.vanillaApiBody1": "The events bubble and can be cancelled with <code>preventDefault()</code>; <code>setCommentVote</code> writes state and a <code>CommentTemplate</code> is cloned to create comments.",
    "commentThread.htmlTitle": "Authored HTML",
    "commentThread.htmlBody":
      "A recursive comment is composed by repeating this same shape inside <code>.sk-comment-thread__replies</code>. The reply form's <code>FormField</code>/<code>Textarea</code> is the consumer's own composition - omitted here for brevity.",
    "commentThread.reactTitle": "React",
    "commentThread.test1": "A standalone <code>Comment</code> renders author, time and body, with no thread or chrome around it.",
    "commentThread.test2": "The <code>author</code> slot takes composed content, not only a string.",
    "commentThread.test3": "There is no fold control unless the comment is <code>collapsible</code> AND has replies to fold.",
    "commentThread.test4": "Folding hides the REPLIES and leaves the comment itself readable: its body and actions stay put.",
    "commentThread.test5": "Replies nest as <code>Comment</code>s of the same shape, at any depth.",
    "commentThread.test6": "<code>CommentVote</code> reports the direction clicked and reflects the viewer's own past vote.",
    "commentThread.test7": "<code>CommentActions</code> renders only the triggers it was given, and reports each.",
    "commentThread.test8": "The composer submits the body of whatever control it was given, then resets it.",
    "commentThread.test9": "Reads a single-line <code>Input</code> as readily as a <code>Textarea</code>: it ships neither.",
    "commentThread.test10": "Submits nothing when the control is empty.",
    "commentThread.test11": "The thread names itself and renders its composer above the comments.",
    "commentThread.test12":
      "Dispatches vote with the comment's id and the clicked direction, never touching the paint itself.",
    "commentThread.test13": "A nested reply's vote is attributed to the reply, not to the comment above it.",
    "commentThread.test14": "Dispatches delete only where the delete trigger exists.",
    "commentThread.test15":
      "Toggles the reply composer's <code>aria-expanded</code> and <code>hidden</code>, scoped to its own comment.",
    "commentThread.test16": "Collapse hides that comment's replies, not what the comment says.",
    "commentThread.test17":
      "Submits a reply with the enclosing comment's id as <code>parentId</code>, resets it and closes the box.",
    "commentThread.test18": "The thread's own composer submits with a null <code>parentId</code>.",
    "commentThread.test19": "Ignores an empty reply: no event, form left untouched.",
    "commentThread.test20": "Folds the replies of a standalone <code>Comment</code> with no thread around it.",
    "commentThread.test21": "A standalone <code>CommentComposer</code> submits, reporting no parent.",
    "commentThread.test22": "Reads a single-line input as readily as a textarea: the composer ships neither.",
    "commentThread.test23": "Reads a <code>contenteditable</code> surface too, so an Editor can be the control.",
    "commentThread.test25": "Cancelling an empty box closes it without asking: there is nothing to lose.",
    "commentThread.test26": "Cancelling with a draft dispatches <code>discard</code> and leaves the box open for the app to decide.",
    "commentThread.test27": "A reply vetoed with <code>preventDefault()</code> keeps the draft and the box.",
    "commentThread.test24": "The avatar sits in the gutter, apart from the name, so the thread line can hang off it.",
    "commentThread.test28":
      "The fold control is an icon-only Button at the <code>xs</code> size, not a face shrunk here.",
    "demo.commentThread.label": "Comments",
    "demo.commentThread.replyFieldLabel": "Reply",
    "demo.commentThread.replyPlaceholder": "Write a reply…",
    "demo.commentThread.send": "Reply",
    "demo.commentThread.now": "just now",
    "demo.commentThread.loadingLabel": "Loading comments",
    "demo.commentThread.loadingMoreLabel": "Loading more comments",
    "demo.commentThread.deleteTitle": "Delete this comment?",
    "demo.commentThread.deleteBody": "It goes along with its replies. This cannot be undone.",
    "demo.commentThread.deleteCancel": "Cancel",
    "demo.commentThread.deleteConfirm": "Delete",
    "demo.commentThread.cancel": "Cancel",
    "demo.commentThread.discardTitle": "Discard what you wrote?",
    "demo.commentThread.discardBody": "What you typed in the reply is lost.",
    "demo.commentThread.discardKeep": "Keep writing",
    "demo.commentThread.discardConfirm": "Discard",
    "demo.commentThread.author1": "Ada",
    "demo.commentThread.time1": "3h ago",
    "demo.commentThread.body1": "Has anyone tried the PDF export with long tables? Mine cuts off on the second page.",
    "demo.commentThread.ddRoot": "How should we proceed?",
    "demo.commentThread.ddReply1": "Let's split up the task.",
    "demo.commentThread.ddReply2": "I'll take the technical part.",
    "demo.commentThread.ddReply3": "I'll review the design.",
    "demo.commentThread.ddNext": "Meanwhile: another topic.",
    /* The anatomy specimen's own text, short on purpose: the diagram names the BOX a message lives
       in, and three lines of lorem make that box tall enough to push its own labels apart. */
    "demo.commentThread.anatomyBody": "Has anyone tried the PDF export?",
    "demo.commentThread.anatomyReply": "Yes, it works since version 2.1.",
    "demo.commentThread.author2": "Grace",
    "demo.commentThread.time2": "1h ago",
    "demo.commentThread.body2": "Same here. When rows have long text, the table does not split well across pages.",
    "demo.commentThread.author3": "Linus",
    "demo.commentThread.time3": "40m ago",
    "demo.commentThread.body3": "It is fixed in version 2.3. Update and let us know if it still happens.",
    "demo.commentThread.author4": "Margaret",
    "demo.commentThread.time4": "10m ago",
    "demo.commentThread.body4": "Confirmed, it comes out right with 2.3.",
    "demo.commentThread.author5": "Alan",
    "demo.commentThread.time5": "5m ago",
    "demo.commentThread.body5": "Can I choose the page size? I need A4 and it gives me Letter.",
    "demo.commentThread.author6": "Barbara",
    "demo.commentThread.time6": "2m ago",
    "demo.commentThread.body6": "It is in Settings, under Export.",
    "demo.commentThread.body7": "Thanks, I had missed it.",
    "demo.commentThread.body8": "It would be nice if it remembered the last choice.",
    "demo.commentThread.ddParent": "How should we proceed?",
    "demo.commentThread.ddReply": "Let's split up the task.",
    "commentThread.guidelinesLede": "A thread shows who replied to whom.",
  },
} as const;
