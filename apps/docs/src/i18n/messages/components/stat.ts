export const statMessages = {
  es: {
    "demo.stat.summary": "Resumen del negocio",
    "demo.stat.income": "Ingresos",
    "demo.stat.orders": "Pedidos",
    "demo.stat.cancellations": "Cancelaciones",
    "demo.stat.versus": "vs. mes anterior",
    "demo.stat.relative": "Rendimiento relativo",
    "demo.stat.cumulative": "Acumulado del período",
    "demo.stat.activity": "Actividad",
    "demo.stat.increases": "Aumenta",
    "demo.stat.decreases": "Disminuye",
    "demo.stat.stable": "Estable",

    "statPage.description": "Muestra una cifra clave con su nombre y cuánto cambió.",

    "statPage.a11yYours2": "Di con palabras si el cambio es bueno: el color no llega a todos.",

    "statPage.a11yYours1": "Si redondeas, da el valor completo en un <code>title</code> o en el detalle.",

    "statPage.a11yDoes2": "La animación se apaga con <code>prefers-reduced-motion</code>.",

    "statPage.a11yDoes1": "El cambio lleva flecha y texto, no solo color.",

    "statPage.a11yIntro": "Stat es texto con estructura.",

    "statPage.content3": "Redondea para leer: «$1,2 M», no «$1.203.458».",

    "statPage.content2": "Di contra qué se compara: «+12 % vs. marzo».",

    "statPage.content1": "Nombra la cifra con lo que mide: «Ingresos del mes», no «Total».",

    "statPage.whenNot3": 'Para una medida dentro de un rango: usa <a href="/es/componentes/meter">Meter</a>.',

    "statPage.whenNot2": 'Para la evolución en el tiempo: usa <a href="/es/componentes/charts">Charts</a>.',

    "statPage.whenNot1": 'Para muchas cifras que se comparan: usa <a href="/es/componentes/table">Table</a>.',

    "statPage.when2": "Cuando importa el cambio respecto de un período anterior.",

    "statPage.when1": "Para las cifras clave de un tablero o un resumen: 3 o 4, una al lado de la otra.",

    "statPage.contract3": "No calcula nada: la cifra, el cambio y la tendencia los das tú.",

    "statPage.contract2": "El cambio lleva una flecha además del color: no depende solo del color.",

    "statPage.contract1": "El valor usa números tabulares: las cifras de varias tarjetas quedan alineadas.",
    "statPage.lede": "Stat muestra una cifra clave con su nombre y cuánto cambió: los ingresos del mes, las personas activas, las cancelaciones. La tendencia colorea el cambio según si es bueno o malo, no según el signo: bajar es bueno para las cancelaciones.",
    "statPage.anatomyBody":
      "Este diagrama nombra la etiqueta, el valor y el cambio. El espécimen está congelado; las métricas vivas empiezan abajo.",
    "statPage.anatomyLabel": "Anatomía de Stat",
    "statPage.anatomyPreviewLabel": "Stat, parte por parte",
    "statPage.cardTitle": "Un resumen: cuatro cifras en tarjetas",
    "statPage.cardBody": 'Cada Stat en un <a href="/es/componentes/box">Box</a>, en un Grid. La flecha baja en cancelaciones es buena noticia, y va en verde.',
    "statPage.animateTitle": "Animar: la cifra cuenta al aparecer",
    "statPage.animateBody": "Con <code>animate</code> y un valor numérico, la cifra cuenta hasta su valor. Sin <code>animate</code> es estática; con <code>prefers-reduced-motion</code>, aparece directa.",
    "statPage.animateLabel": "Stat Cards animadas",
    "statPage.test1": "Colorea el cambio según la tendencia, no según el signo.",
    "statPage.test2": "Omite el elemento de cambio cuando no se pasa ninguno.",
    "statPage.test3": "Cuenta un valor numérico hacia arriba cuando <code>animate</code> está activo.",
    "statPage.prop.trend.title": "Trend: si el cambio es bueno",
    "statPage.prop.trend.body": "Colorea el cambio según lo que significa, no según su signo.",
    "statPage.prop.trend.up": "Usa <code>up</code> cuando el cambio es bueno: más ingresos, menos cancelaciones.",
    "statPage.prop.trend.down": "Usa <code>down</code> cuando el cambio es malo.",
    "statPage.prop.trend.neutral": "Usa <code>neutral</code> cuando el cambio es pequeño o no es ni bueno ni malo.",
    "statPage.guidelinesLede": "Una cifra sola no dice nada; con su nombre y su comparación, dice si algo va bien.",
    "statPage.dd.context.title": "Contexto: nombre y comparación",
    "statPage.dd.context.do": "Nombra la cifra y di cuánto cambió.",
    "statPage.dd.context.dont": "Un número sin nombre ni comparación no dice si es bueno o malo.",
    "statPage.dd.table.title": "Cantidad: pocas cifras",
    "statPage.dd.table.do": "Muestra tres o cuatro cifras clave, una al lado de la otra.",
    "statPage.dd.table.dont": 'Muchas cifras comparables entre sí se leen mejor en una <a href="/es/componentes/table">Table</a>.',
  },
  en: {
    "demo.stat.summary": "Business summary",
    "demo.stat.income": "Income",
    "demo.stat.orders": "Orders",
    "demo.stat.cancellations": "Cancellations",
    "demo.stat.versus": "vs. previous month",
    "demo.stat.relative": "Relative performance",
    "demo.stat.cumulative": "Period total",
    "demo.stat.activity": "Activity",
    "demo.stat.increases": "Increases",
    "demo.stat.decreases": "Decreases",
    "demo.stat.stable": "Stable",

    "statPage.description": "Shows a key figure with its name and how much it changed.",

    "statPage.a11yYours2": "Say in words whether the change is good: color does not reach everyone.",

    "statPage.a11yYours1": "If you round, give the full value in a <code>title</code> or in the detail.",

    "statPage.a11yDoes2": "The animation turns off with <code>prefers-reduced-motion</code>.",

    "statPage.a11yDoes1": "The change carries an arrow and text, not only color.",

    "statPage.a11yIntro": "Stat is structured text.",

    "statPage.content3": "Round for reading: “$1.2M”, not “$1,203,458”.",

    "statPage.content2": "Say what it is compared with: “+12% vs. March”.",

    "statPage.content1": "Name the figure by what it measures: “Monthly revenue”, not “Total”.",

    "statPage.whenNot3": 'For a measurement within a range: use <a href="/components/meter">Meter</a>.',

    "statPage.whenNot2": 'For change over time: use <a href="/components/charts">Charts</a>.',

    "statPage.whenNot1": 'For many figures compared with each other: use <a href="/components/table">Table</a>.',

    "statPage.when2": "When the change against a previous period matters.",

    "statPage.when1": "For a dashboard's or summary's key figures: 3 or 4, side by side.",

    "statPage.contract3": "It computes nothing: you give the figure, the change and the trend.",

    "statPage.contract2": "The change carries an arrow as well as color: it does not rely on color alone.",

    "statPage.contract1": "The value uses tabular numbers: figures across cards line up.",
    "statPage.lede": "Stat shows a key figure with its name and how much it changed: the month's revenue, active users, cancellations. The trend colors the change by whether it is good or bad, not by its sign: going down is good for cancellations.",
    "statPage.anatomyBody":
      "This diagram names the label, the value, and the change. The specimen is frozen; the live metrics start below.",
    "statPage.anatomyLabel": "Stat anatomy",
    "statPage.anatomyPreviewLabel": "Stat, part by part",
    "statPage.cardTitle": "A summary: four figures in cards",
    "statPage.cardBody": 'Each Stat in a <a href="/components/box">Box</a>, in a Grid. The downward arrow on cancellations is good news, and goes green.',
    "statPage.animateTitle": "Animate: the figure counts on appearing",
    "statPage.animateBody": "With <code>animate</code> and a numeric value, the figure counts up to its value. Without <code>animate</code> it is static; with <code>prefers-reduced-motion</code>, it appears directly.",
    "statPage.animateLabel": "Animated Stat Cards",
    "statPage.test1": "Colors the change by trend, not by sign.",
    "statPage.test2": "Omits the change element when no change is given.",
    "statPage.test3": "Counts a numeric value up when animate is on.",
    "statPage.prop.trend.title": "Trend: whether the change is good",
    "statPage.prop.trend.body": "Colors the change by what it means, not by its sign.",
    "statPage.prop.trend.up": "Use <code>up</code> when the change is good: more revenue, fewer cancellations.",
    "statPage.prop.trend.down": "Use <code>down</code> when the change is bad.",
    "statPage.prop.trend.neutral": "Use <code>neutral</code> when the change is small or neither good nor bad.",
    "statPage.guidelinesLede": "A figure alone says nothing; with its name and a comparison, it says whether things are going well.",
    "statPage.dd.context.title": "Context: name and comparison",
    "statPage.dd.context.do": "Name the figure and say how much it changed.",
    "statPage.dd.context.dont": "A number with no name and no comparison does not say whether it is good or bad.",
    "statPage.dd.table.title": "Count: a few figures",
    "statPage.dd.table.do": "Show three or four key figures side by side.",
    "statPage.dd.table.dont": 'Many figures compared with each other read better in a <a href="/components/table">Table</a>.',
  },
} as const;
