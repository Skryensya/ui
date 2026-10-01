export const avatarMessages = {
  es: {
    "demo.avatar.label": "Avatares de ejemplo",
    "demo.avatar.imageLabel": "Avatares con foto",
    "demo.avatar.sizesLabel": "Tamaños de avatar",
    "demo.avatar.colorsLabel": "Avatares de colores",
    "demo.avatar.colorPersonName": "Avatar {letter}",
    "demo.avatar.groupLabel": "Avatares apilados",
    "demo.avatar.profileRole": "Matemática, Máquina Analítica",
    "demo.avatar.personOne": "Persona 1",
    "demo.avatar.personTwo": "Persona 2",
    "demo.avatar.personThree": "Persona 3",
    "demo.avatar.statusAssigned": "Asignada",
    "demo.avatar.statusReview": "En revisión",
    "demo.avatar.statusDone": "Lista",
    "demo.avatar.statusBlocked": "Bloqueada",

    "avatar.description": "Identifica a una persona o entidad con su foto o, sin foto, sus iniciales.",

    "avatar.a11yYours3": "Si usas un color por persona, las iniciales deben tener un contraste de 4.5:1 sobre ese fondo (WCAG 2.2, 1.4.3).",

    "avatar.a11yYours2": "Si el avatar abre un perfil, el enlace o el botón que lo envuelve debe tener su propio nombre, como “Ver perfil de Ada Lovelace”.",

    "avatar.a11yYours1": "Debe tener <code>name</code>: es lo único que un lector de pantalla anuncia.",

    "avatar.a11yDoes3": "AvatarGroup es un grupo; con <code>label</code>, tiene nombre.",

    "avatar.a11yDoes2": 'Sin foto, el disco es <code>role="img"</code> con el nombre, y las iniciales quedan ocultas al lector de pantalla.',

    "avatar.a11yDoes1": "Con foto, el <code>&lt;img alt&gt;</code> lleva el nombre.",

    "avatar.a11yIntro": "Un avatar es una imagen con nombre: se anuncia como tal y no recibe foco.",

    "avatar.content3": "En el grupo, <code>label</code> nombra el conjunto: “Participantes”, “Equipo de diseño”.",

    "avatar.content2": "Escribe las iniciales en mayúsculas, con dos letras como máximo.",

    "avatar.content1": "Usa el nombre de la persona como <code>name</code>: “Ada Lovelace”, no “Foto de perfil”.",

    "avatar.whenNot3": 'Como decoración o marcador genérico: usa <a href="/es/componentes/icon">Icon</a>.',

    "avatar.whenNot2": 'Cuando cada persona necesita su nombre, un detalle o una acción a la vista: usa <a href="/es/componentes/list">List</a>.',

    "avatar.whenNot1": 'Para una imagen de contenido, no de identidad: usa <a href="/es/componentes/image-frame">ImageFrame</a>.',

    "avatar.when2": "Para mostrar varias personas en poco espacio: usa AvatarGroup.",

    "avatar.when1": "Para mostrar quién escribió, asignó o participa: un comentario, una fila, un perfil.",

    "avatar.contract3": "En React, <code>avatarInitials(name)</code> deriva las iniciales si no las pasas: la primera letra de cada una de dos palabras, o los dos primeros caracteres de una.",

    "avatar.contract2": 'Sin foto, el disco toma <code>role="img"</code> con el nombre y las iniciales quedan decorativas.',

    "avatar.contract1": "Con foto, el avatar anida un <code>sk-image-frame</code> y el <code>&lt;img alt&gt;</code> lleva el nombre.",
    "avatar.tactileUnavailable": "Solo para controles que se presionan",
    "avatar.frostedUnavailable": "Solo para superficies, no para retratos",
    "avatar.lede": "Avatar identifica a una persona o entidad con su foto o, sin foto, sus iniciales. <strong>AvatarGroup</strong> apila varias identidades y resume el excedente con un contador «+N».",
    "avatar.anatomyBody": "El contrato se bifurca en <code>src</code>: con foto, el disco contiene un ImageFrame; sin foto, contiene las iniciales.",
    "avatar.anatomyLabel": "Anatomía de Avatar",
    "avatar.anatomyPreviewLabel": "Avatar, parte por parte",
    "avatar.groupAnatomyBody": "El grupo agrega dos partes: el contenedor y el contador de excedente.",
    "avatar.groupAnatomyLabel": "Anatomía de AvatarGroup",
    "avatar.groupAnatomyPreviewLabel": "AvatarGroup, parte por parte",
    "avatar.imagesTitle": "Con foto: el nombre queda como texto alternativo",
    "avatar.imagesBody": "Con <code>src</code>, el avatar recorta la foto en un círculo y usa el nombre como <code>alt</code>.",
    "avatar.colorsTitle": "Colores: uno por persona",
    "avatar.colorsBody": "El fondo y la tinta son hooks de estilo (<code>--sk-avatar-bg</code> y <code>--sk-avatar-fg</code>). Considera un color por persona cuando varias aparecen juntas.",
    "avatar.groupTitle": "Grupo: varias identidades en poco espacio",
    "avatar.groupBody": "<strong>AvatarGroup</strong> superpone los discos y resume el excedente con «+N».",
    "avatar.groupMaxBody": "En React, <code>max</code> recorta los avatares visibles y cuenta el resto por ti.",
    "avatar.groupMaxNote": "cuatro hijos y max={3}: se ven tres, el cuarto se convierte en «+1»",
    "avatar.profileTitle": "En composición: avatar, nombre y rol",
    "avatar.profileBody": "El avatar al lado de dos textos, nombre sobre rol. Son dos textos y no uno con coma: un lector de pantalla los anuncia como dos datos.",
    "avatar.prop.size.title": "Size: cuánto pesa la identidad",
    "avatar.prop.size.body": "Ajusta el diámetro del avatar.",
    "avatar.prop.size.sm": "Usa <code>sm</code> en listas densas o metadatos.",
    "avatar.prop.size.md": "Usa <code>md</code> junto a una línea de texto: un comentario, una fila.",
    "avatar.prop.size.lg": "Usa <code>lg</code> cuando la identidad encabeza un bloque, como una tarjeta.",
    "avatar.prop.size.xl": "Usa <code>xl</code> en una ficha de perfil, donde el retrato es el tema.",
    "avatar.guidelinesLede": "Un avatar dice quién es alguien de un vistazo; el nombre al lado dice cuál.",
    "avatar.dd.identity.title": "Identidad: el avatar acompaña al nombre",
    "avatar.dd.identity.do": "El nombre y el rol al lado dicen quién es sin que la persona adivine.",
    "avatar.dd.identity.dont": "Dos letras solas no dicen quién es: varias personas comparten iniciales.",
    "avatar.dd.group.title": "Grupo: resume el excedente",
    "avatar.dd.group.do": "Tres discos y «+1» ocupan poco y dicen cuántos son.",
    "avatar.dd.group.dont": "Una fila larga de discos ocupa la línea y nadie los cuenta.",
    "avatar.dd.size.title": "Tamaño: iguala el peso del texto",
    "avatar.dd.size.do": "En una fila densa, un avatar pequeño identifica sin dominar la lectura.",
    "avatar.dd.size.dont": "Un retrato grande junto a texto pequeño hace que una fila común parezca una ficha de perfil.",
    "avatar.dd.color.title": "Color: identifica, no marca estado",
    "avatar.dd.color.do": "El color separa personas; el texto dice el estado de cada una.",
    "avatar.dd.color.dont": "Usar verde, rojo o amarillo para el estado convierte el avatar en una badge ambigua.",
    "avatar.test1": "Sin imagen, deriva las iniciales del nombre (dos palabras → una letra de cada una).",
    "avatar.test2": "Con un solo nombre, usa sus dos primeros caracteres.",
    "avatar.test3": "Con <code>src</code>, la imagen se renderiza dentro de ImageFrame.",
    "avatar.test4": "AvatarGroup limita los avatares visibles y colapsa el resto en un contador «+N».",
    "avatar.test5":
      'El tamaño <code>xl</code> se serializa en <code>data-size</code> sobre el disco, tanto con iniciales como con foto.',
    "avatar.test6": "Con <code>label</code>, AvatarGroup se anuncia como un grupo con nombre.",
    "avatar.test7":
      "Sin <code>label</code> sigue siendo un grupo: cada avatar ya anuncia su propio nombre.",
  },
  en: {
    "demo.avatar.label": "Example avatars",
    "demo.avatar.imageLabel": "Photo avatars",
    "demo.avatar.sizesLabel": "Avatar sizes",
    "demo.avatar.colorsLabel": "Colored avatars",
    "demo.avatar.colorPersonName": "Avatar {letter}",
    "demo.avatar.groupLabel": "Stacked avatars",
    "demo.avatar.profileRole": "Mathematician, Analytical Engine",
    "demo.avatar.personOne": "Person 1",
    "demo.avatar.personTwo": "Person 2",
    "demo.avatar.personThree": "Person 3",
    "demo.avatar.statusAssigned": "Assigned",
    "demo.avatar.statusReview": "In review",
    "demo.avatar.statusDone": "Done",
    "demo.avatar.statusBlocked": "Blocked",

    "avatar.description": "Identifies a person or entity with their photo or, without one, their initials.",

    "avatar.a11yYours3": "If you use one color per person, the initials must reach 4.5:1 contrast on it (WCAG 2.2, 1.4.3).",

    "avatar.a11yYours2": "If the avatar opens a profile, the link or button around it must have its own name, such as “View Ada Lovelace's profile”.",

    "avatar.a11yYours1": "It must have a <code>name</code>: it is all a screen reader announces.",

    "avatar.a11yDoes3": "AvatarGroup is a group; with <code>label</code>, it has a name.",

    "avatar.a11yDoes2": 'Without a photo, the disc is <code>role="img"</code> with the name, and the initials are hidden from screen readers.',

    "avatar.a11yDoes1": "With a photo, the <code>&lt;img alt&gt;</code> carries the name.",

    "avatar.a11yIntro": "An avatar is a named image: it is announced as one and takes no focus.",

    "avatar.content3": "In a group, <code>label</code> names the set: “Participants”, “Design team”.",

    "avatar.content2": "Write initials in capitals, two letters at most.",

    "avatar.content1": "Use the person's name as <code>name</code>: “Ada Lovelace”, not “Profile photo”.",

    "avatar.whenNot3": 'As decoration or a generic marker: use <a href="/components/icon">Icon</a>.',

    "avatar.whenNot2": 'When each person needs their name, a detail or an action in view: use <a href="/components/list">List</a>.',

    "avatar.whenNot1": 'For a content image rather than an identity: use <a href="/components/image-frame">ImageFrame</a>.',

    "avatar.when2": "To show several people in little space: use AvatarGroup.",

    "avatar.when1": "To show who wrote, assigned or took part: a comment, a row, a profile.",

    "avatar.contract3": "In React, <code>avatarInitials(name)</code> derives the initials when you pass none: the first letter of each of two words, or the first two characters of one.",

    "avatar.contract2": 'Without a photo, the disc takes <code>role="img"</code> with the name, and the initials are decorative.',

    "avatar.contract1": "With a photo, the avatar nests an <code>sk-image-frame</code> and the <code>&lt;img alt&gt;</code> carries the name.",
    "avatar.tactileUnavailable": "Only for controls you press",
    "avatar.frostedUnavailable": "Only for surfaces, not portraits",
    "avatar.lede": "Avatar identifies a person or entity with their photo or, without one, their initials. <strong>AvatarGroup</strong> stacks several identities and sums up the rest with a “+N” counter.",
    "avatar.anatomyBody": "The contract forks on <code>src</code>: with a photo, the disc holds an ImageFrame; without, it holds the initials.",
    "avatar.anatomyLabel": "Avatar anatomy",
    "avatar.anatomyPreviewLabel": "Avatar, part by part",
    "avatar.groupAnatomyBody": "The group adds two parts: the container and the overflow counter.",
    "avatar.groupAnatomyLabel": "AvatarGroup anatomy",
    "avatar.groupAnatomyPreviewLabel": "AvatarGroup, part by part",
    "avatar.imagesTitle": "With a photo: the name becomes the alternative text",
    "avatar.imagesBody": "With <code>src</code>, the avatar crops the photo into a circle and uses the name as <code>alt</code>.",
    "avatar.colorsTitle": "Colors: one per person",
    "avatar.colorsBody": "The fill and ink are styling hooks (<code>--sk-avatar-bg</code> and <code>--sk-avatar-fg</code>). Consider one color per person when several appear together.",
    "avatar.groupTitle": "Group: several identities in little space",
    "avatar.groupBody": "<strong>AvatarGroup</strong> overlaps the discs and sums up the rest with “+N”.",
    "avatar.groupMaxBody": "In React, <code>max</code> trims the visible avatars and counts the rest for you.",
    "avatar.groupMaxNote": 'four children and max={3}: three show, the fourth becomes "+1"',
    "avatar.profileTitle": "In a composition: avatar, name and role",
    "avatar.profileBody": "The avatar beside two texts, name over role. They are two texts, not one with a comma: a screen reader announces them as two facts.",
    "avatar.prop.size.title": "Size: how much weight the identity has",
    "avatar.prop.size.body": "Sets the avatar's diameter.",
    "avatar.prop.size.sm": "Use <code>sm</code> in dense lists or metadata.",
    "avatar.prop.size.md": "Use <code>md</code> beside a line of text: a comment, a row.",
    "avatar.prop.size.lg": "Use <code>lg</code> when the identity heads a block, like a card.",
    "avatar.prop.size.xl": "Use <code>xl</code> on a profile, where the portrait is the subject.",
    "avatar.guidelinesLede": "An avatar says who someone is at a glance; the name beside it says which one.",
    "avatar.dd.identity.title": "Identity: the avatar goes with the name",
    "avatar.dd.identity.do": "The name and role beside it say who it is, so nobody has to guess.",
    "avatar.dd.identity.dont": "Two letters alone do not say who it is: several people share initials.",
    "avatar.dd.group.title": "Group: sum up the rest",
    "avatar.dd.group.do": "Three discs and “+1” take little room and say how many there are.",
    "avatar.dd.group.dont": "A long row of discs fills the line and nobody counts them.",
    "avatar.dd.size.title": "Size: match the text weight",
    "avatar.dd.size.do": "In a dense row, a small avatar identifies without taking over the line.",
    "avatar.dd.size.dont": "A large portrait beside small text makes an ordinary row look like a profile card.",
    "avatar.dd.color.title": "Color: identify, do not mark status",
    "avatar.dd.color.do": "Color separates people; the text says each person's status.",
    "avatar.dd.color.dont": "Using green, red or yellow for status turns the avatar into an ambiguous badge.",
    "avatar.test1": "With no image, derives initials from the name (two words → one letter from each).",
    "avatar.test2": "With a single name, uses its first two characters.",
    "avatar.test3": "With <code>src</code>, the image renders inside ImageFrame.",
    "avatar.test4": 'AvatarGroup caps visible avatars and collapses the rest into a "+N" counter.',
    "avatar.test5":
      'The <code>xl</code> size serializes onto <code>data-size</code> on the disc, with initials and with a photo alike.',
    "avatar.test6": "With <code>label</code>, AvatarGroup announces itself as a named group.",
    "avatar.test7":
      "Without <code>label</code> it is still a group: each avatar already announces its own name.",
  },
} as const;
