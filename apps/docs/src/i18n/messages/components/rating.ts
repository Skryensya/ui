export const ratingMessages = {
  es: {
    "demo.rating.displayLabel": "4,3 de 5",
    "demo.rating.inputLabel": "Tu puntuación",
    "demo.rating.count": "128 reseñas",
    "demo.rating.fraction38": "3,8 de 5",
    "demo.rating.fraction43": "4,3 de 5",
    "demo.rating.fraction50": "5 de 5",
    "demo.rating.sizeSm": "4 de 5, pequeño",
    "demo.rating.sizeMd": "4 de 5, mediano",
    "demo.rating.sizeLg": "4 de 5, grande",

    "ratingPage.description": "Muestra una valoración promedio, o deja dar una, en una escala de estrellas.",

    "ratingPage.key.arrows": "Sube o baja una estrella.",

    "ratingPage.a11yYours2": "Nombra el input con <code>label</code>: «Tu valoración del curso».",

    "ratingPage.a11yYours1": "Escribe el <code>label</code> del display como frase: «4,3 de 5 estrellas».",

    "ratingPage.a11yDoes2": "El input es una sola parada de <kbd>Tab</kbd> y anuncia «3 de 5».",

    "ratingPage.a11yDoes1": "El display es una imagen con un solo nombre, <code>label</code>; las estrellas van ocultas.",

    "ratingPage.a11yIntro": "RatingDisplay es una imagen con su valor; Rating, un grupo de radios.",

    "ratingPage.content3": "En el input, nombra qué se valora: «Tu valoración del curso».",

    "ratingPage.content2": "Di cuántas valoraciones hay: «(128 reseñas)».",

    "ratingPage.content1": "Muestra el número junto a las estrellas: «4,3».",

    "ratingPage.whenNot3": 'Para un me gusta o no: usa <a href="/es/componentes/state-button">StateButton</a>.',

    "ratingPage.whenNot2": 'Para una pregunta de encuesta con extremos nombrados: usa una escala en <a href="/es/componentes/radio-group">RadioGroup</a>.',

    "ratingPage.whenNot1": 'Para una medida que no es una opinión: usa <a href="/es/componentes/meter">Meter</a>.',

    "ratingPage.when2": "Para pedir una valoración rápida en una escala corta.",

    "ratingPage.when1": "Para mostrar el promedio de valoraciones de un producto, un lugar o un curso.",

    "ratingPage.contract3": "Cada estrella del input mide 24, 32 o 40 px: todas pasan el mínimo de WCAG 2.2.",

    "ratingPage.contract2": "El input es un <code>radiogroup</code> nativo, así que se envía con el formulario.",

    "ratingPage.contract1": "El display acepta decimales; el input, solo pasos enteros: apuntar a media estrella es un blanco demasiado pequeño.",

    "ratingPage.displayBody": "<code>RatingDisplay</code> con el promedio y cuántas valoraciones hay.",

    "ratingPage.displayTitle": "Mostrar: un promedio con su total",
    "ratingPage.lede": "Rating trabaja una escala de estrellas en dos sentidos: <code>RatingDisplay</code> muestra un promedio ya calculado, como el de un producto, y <code>Rating</code> deja dar una valoración. Son dos componentes porque leer y elegir son tareas distintas.",
    "ratingPage.inputTitle": "Valorar: un grupo de radios",
    "ratingPage.inputBody": "<code>Rating</code> se elige con clic o con las flechas, estrella por estrella entera.",
    "ratingPage.fractionTitle": "Fracciones: no redondea",
    "ratingPage.fractionBody": "4,3 se dibuja como 4,3: si redondeara, 4,3 y 3,8 se verían iguales.",
    "ratingPage.anatomyLabel": "Anatomía de Rating",
    "ratingPage.anatomyBody":
      "Una sola etiqueta para el símbolo, porque lo que importa es que <strong>las dos signatures llevan el mismo</strong>: la tira que pinta el display y el glifo dentro de cada radio son la misma máscara. Por eso cambiar <code>--sk-rating-symbol</code> las cambia a las dos de una vez.",
    "ratingPage.anatomyPreviewLabel": "Un símbolo, dos direcciones",
    "ratingPage.symbolTitle": "Otro símbolo: en CSS",
    "ratingPage.symbolBody": "La estrella es una máscara CSS; cámbiala por un corazón o un punto con un hook.",
    "ratingPage.prop.symbolSize.title": "Symbol size: el tamaño de cada estrella",
    "ratingPage.prop.symbolSize.body": "Va con el peso que la valoración tiene en la vista.",
    "ratingPage.prop.symbolSize.sm": "Usa <code>sm</code> junto a un título en una lista o una tarjeta.",
    "ratingPage.prop.symbolSize.md": "Usa <code>md</code>, el valor por defecto, en la ficha de un producto.",
    "ratingPage.prop.symbolSize.lg": "Usa <code>lg</code> cuando la valoración es lo principal de la vista.",
    "ratingPage.guidelinesLede": "Un promedio con estrellas se compara de un vistazo; el número y el total le dan peso.",
    "ratingPage.dd.count.title": "Total: el promedio, con cuántas",
    "ratingPage.dd.count.do": "Muestra cuántas valoraciones hay junto al promedio.",
    "ratingPage.dd.count.dont": "Sin el total, una sola opinión se ve igual que mil.",
    "ratingPage.dd.display.title": "Tarea: leer o valorar",
    "ratingPage.dd.display.do": "Para mostrar un promedio, usa <code>RatingDisplay</code>.",
    "ratingPage.dd.display.dont": "El campo invita a hacer clic y redondea el promedio a una estrella entera.",
  },
  en: {
    "demo.rating.displayLabel": "4.3 out of 5",
    "demo.rating.inputLabel": "Your rating",
    "demo.rating.count": "128 reviews",
    "demo.rating.fraction38": "3.8 out of 5",
    "demo.rating.fraction43": "4.3 out of 5",
    "demo.rating.fraction50": "5 out of 5",
    "demo.rating.sizeSm": "4 out of 5, small",
    "demo.rating.sizeMd": "4 out of 5, medium",
    "demo.rating.sizeLg": "4 out of 5, large",

    "ratingPage.description": "Shows an average rating, or lets one be given, on a star scale.",

    "ratingPage.key.arrows": "Moves one star up or down.",

    "ratingPage.a11yYours2": "Name the input with <code>label</code>: “Your rating of the course”.",

    "ratingPage.a11yYours1": "Write the display's <code>label</code> as a sentence: “4.3 out of 5 stars”.",

    "ratingPage.a11yDoes2": "The input is a single <kbd>Tab</kbd> stop and announces “3 of 5”.",

    "ratingPage.a11yDoes1": "The display is an image with a single name, <code>label</code>; the stars are hidden.",

    "ratingPage.a11yIntro": "RatingDisplay is an image with its value; Rating, a radio group.",

    "ratingPage.content3": "In the input, name what is rated: “Your rating of the course”.",

    "ratingPage.content2": "Say how many ratings there are: “(128 reviews)”.",

    "ratingPage.content1": "Show the number beside the stars: “4.3”.",

    "ratingPage.whenNot3": 'For a like or not: use <a href="/components/state-button">StateButton</a>.',

    "ratingPage.whenNot2": 'For a survey question with named ends: use a scale in <a href="/components/radio-group">RadioGroup</a>.',

    "ratingPage.whenNot1": 'For a measurement that is not an opinion: use <a href="/components/meter">Meter</a>.',

    "ratingPage.when2": "To ask for a quick rating on a short scale.",

    "ratingPage.when1": "To show the average rating of a product, place or course.",

    "ratingPage.contract3": "Each input star is 24, 32 or 40 px: all pass the WCAG 2.2 minimum.",

    "ratingPage.contract2": "The input is a native <code>radiogroup</code>, so it is submitted with the form.",

    "ratingPage.contract1": "The display takes decimals; the input only whole steps: aiming at half a star is too small a target.",

    "ratingPage.displayBody": "<code>RatingDisplay</code> with the average and how many ratings there are.",

    "ratingPage.displayTitle": "Show: an average with its total",
    "ratingPage.lede": "Rating works a star scale in two directions: <code>RatingDisplay</code> shows an already computed average, like a product's, and <code>Rating</code> lets a rating be given. They are two components because reading and choosing are different tasks.",
    "ratingPage.inputTitle": "Rate: a radio group",
    "ratingPage.inputBody": "<code>Rating</code> is chosen by click or the arrows, one whole star at a time.",
    "ratingPage.fractionTitle": "Fractions: no rounding",
    "ratingPage.fractionBody": "4.3 is drawn as 4.3: rounded, 4.3 and 3.8 would look the same.",
    "ratingPage.anatomyLabel": "Rating anatomy",
    "ratingPage.anatomyBody":
      "One label for the symbol, because what matters is that <strong>both signatures wear it</strong>: the strip the display paints and the glyph inside each radio are the same mask. That is why changing <code>--sk-rating-symbol</code> changes both at once.",
    "ratingPage.anatomyPreviewLabel": "One symbol, two directions",
    "ratingPage.symbolTitle": "Another symbol: in CSS",
    "ratingPage.symbolBody": "The star is a CSS mask; swap it for a heart or a dot with a hook.",
    "ratingPage.prop.symbolSize.title": "Symbol size: each star's size",
    "ratingPage.prop.symbolSize.body": "Goes with the weight the rating has in the view.",
    "ratingPage.prop.symbolSize.sm": "Use <code>sm</code> beside a title in a list or on a card.",
    "ratingPage.prop.symbolSize.md": "Use <code>md</code>, the default, on a product page.",
    "ratingPage.prop.symbolSize.lg": "Use <code>lg</code> when the rating is the main thing in the view.",
    "ratingPage.guidelinesLede": "A star average compares at a glance; the number and total give it weight.",
    "ratingPage.dd.count.title": "Total: the average, with how many",
    "ratingPage.dd.count.do": "Show how many ratings there are beside the average.",
    "ratingPage.dd.count.dont": "Without the total, one opinion looks the same as a thousand.",
    "ratingPage.dd.display.title": "Task: read or rate",
    "ratingPage.dd.display.do": "To show an average, use <code>RatingDisplay</code>.",
    "ratingPage.dd.display.dont": "The field invites a click, and rounds the average to a whole star.",
  },
} as const;
