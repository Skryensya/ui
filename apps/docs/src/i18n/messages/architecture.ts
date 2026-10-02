export const architectureMessages = {
  es: {
    "architecture.title": "Arquitectura del componente",
    "architecture.lede":
      "Un componente no empieza en React ni en Vanilla. Empieza en un <strong>Contract</strong> de Core, que declara qué se puede escribir, qué markup se debe producir y qué comportamiento hace falta.",
    "architecture.diagram.label": "Diagrama: el Contract de Core se realiza en dos bindings, que comparten machine y CSS.",
    "architecture.diagram.core": "Core",
    "architecture.diagram.contract": "Contract",
    "architecture.diagram.contractNote": "Markup contract + signatures",
    "architecture.diagram.react": "Binding React",
    "architecture.diagram.reactNote": "Props → part template completo",
    "architecture.diagram.vanilla": "Binding Vanilla",
    "architecture.diagram.vanillaNote": "Enhancer → hidrata markup escrito",
    "architecture.diagram.machine": "Machine",
    "architecture.diagram.machineNote": "Estado, solo cuando la plataforma no alcanza",
    "architecture.diagram.css": "CSS compartido",
    "architecture.diagram.cssNote": "Lee atributos y styling hooks",
    "architecture.diagramTitle": "El modelo de un vistazo",
    "architecture.layersTitle": "Las piezas que nombra el Contract",
    "architecture.layer1.term": "Contract",
    "architecture.layer1.body":
      'Declara las signatures, opciones, slots, partes, atributos y accesibilidad de un componente. Core es su único autor.',
    "architecture.layer2.term": "Markup contract",
    "architecture.layer2.body":
      'Es la parte del Contract que se escribe en HTML: la estructura, partes y atributos que el consumidor debe anidar correctamente.',
    "architecture.layer3.term": "Signature",
    "architecture.layer3.body":
      'Es un significado seleccionable dentro del Contract. Nombra intención y host, no apariencia; por eso una opción puede elegir una signature sin crear otro componente.',
    "architecture.layer4.term": "Binding",
    "architecture.layer4.body":
      'Realiza el mismo Contract para un camino de consumo. React expone props; Vanilla hidrata markup escrito por el consumidor. Ninguno vuelve a declarar el Contract.',
    "architecture.layer5.term": "Machine",
    "architecture.layer5.body":
      'Coordina estado solo cuando la plataforma no alcanza. Es interna y reemplazable; por eso las partes se nombran con BEM y no con vocabulario de la machine.',
    "architecture.layer6.term": "Enhancer",
    "architecture.layer6.body":
      'Es la unidad de Vanilla: encuentra una raíz escrita por el consumidor, conecta la machine y parchea atributos. No renderiza markup ni escribe clases.',
    "architecture.flowTitle": "Qué cambia en runtime",
    "architecture.flow1":
      '<strong>El consumidor elige una signature.</strong> En React lo hace con props; en HTML lo hace escribiendo el Markup contract documentado.',
    "architecture.flow2":
      '<strong>El binding expande o hidrata.</strong> React produce la part template completa; Vanilla asume que esa estructura ya existe y la conecta.',
    "architecture.flow3":
      '<strong>La machine actualiza estado.</strong> Solo los componentes enhanced escriben atributos de estado, foco virtual o selección; los nativos quedan a cargo del navegador.',
    "architecture.flow4":
      '<strong>Los estilos leen atributos y styling hooks.</strong> La pintura sale del CSS compartido, no de lógica duplicada por binding.',
    "architecture.useTitle": "Límites del modelo",
    "architecture.use1":
      '<strong>Referencia no reemplaza esta página.</strong> La pestaña Referencia de cada componente lista signatures, opciones y slots para consulta rápida; no explica cómo se relacionan.',
    "architecture.use2":
      '<strong>Un styling hook no reemplaza el Contract.</strong> Permite ajustar pintura pública; no autoriza cambiar partes, estados ni accesibilidad.',
    "architecture.use3":
      '<strong>Un Binding no inventa opciones.</strong> Si React o Vanilla necesita una opción nueva, se agrega al Contract o no existe.',
    "architecture.exampleTitle": "Ejemplo: Accordion",
    "architecture.exampleBody":
      "Accordion usa todo el modelo: su Contract declara raíz, item, trigger y contenido; su Markup contract dice cómo anidar esas partes; sus signatures separan usos de disclosure; la machine coordina qué secciones están abiertas; y React o Vanilla realizan el mismo comportamiento desde bindings distintos.",
    "architecture.nextBody":
      'Viene de <a href="/es/fundamentos">Fundamentos</a>. El siguiente corte es visual: <a href="/es/tiers">Tiers</a> explica cómo primitive, semantic y styling hook ordenan los tokens. Para buscar opciones puntuales, usa <a href="/es/referencia">Referencia</a>.',
  },
  en: {
    "architecture.title": "Component architecture",
    "architecture.lede":
      "A component does not start in React or Vanilla. It starts in a Core <strong>Contract</strong>, which declares what can be authored, what markup must be produced, and what behavior is needed.",
    "architecture.diagram.label": "Diagram: the Core Contract is realized by two bindings that share one machine and one stylesheet.",
    "architecture.diagram.core": "Core",
    "architecture.diagram.contract": "Contract",
    "architecture.diagram.contractNote": "Markup contract + signatures",
    "architecture.diagram.react": "React binding",
    "architecture.diagram.reactNote": "Props → full part template",
    "architecture.diagram.vanilla": "Vanilla binding",
    "architecture.diagram.vanillaNote": "Enhancer → hydrates authored markup",
    "architecture.diagram.machine": "Machine",
    "architecture.diagram.machineNote": "State, only when the platform is not enough",
    "architecture.diagram.css": "Shared CSS",
    "architecture.diagram.cssNote": "Reads attributes and styling hooks",
    "architecture.diagramTitle": "The model at a glance",
    "architecture.layersTitle": "The pieces named by the Contract",
    "architecture.layer1.term": "Contract",
    "architecture.layer1.body":
      'Declares a component’s signatures, options, slots, parts, attributes, and accessibility. Core is its only author.',
    "architecture.layer2.term": "Markup contract",
    "architecture.layer2.body":
      'The authorable half of the Contract: the structure a consumer writes by hand when using HTML, with parts and attributes in the right nesting.',
    "architecture.layer3.term": "Signature",
    "architecture.layer3.body":
      'A selectable meaning inside the Contract. It names intent and host, not appearance; an option can choose a signature without creating another component.',
    "architecture.layer4.term": "Binding",
    "architecture.layer4.body":
      'Realizes the same Contract for one consumption path. React exposes props; Vanilla hydrates authored markup. Neither restates the Contract.',
    "architecture.layer5.term": "Machine",
    "architecture.layer5.body":
      'Coordinates state only when the platform is not enough. It is internal and replaceable; parts are named with BEM instead of machine vocabulary.',
    "architecture.layer6.term": "Enhancer",
    "architecture.layer6.body":
      'The Vanilla unit: it finds an authored root, connects the machine, and patches attributes. It renders no markup and writes no classes.',
    "architecture.flowTitle": "What changes at runtime",
    "architecture.flow1":
      '<strong>The consumer chooses a signature.</strong> In React, with props; in HTML, by writing the documented Markup contract.',
    "architecture.flow2":
      '<strong>The binding expands or hydrates.</strong> React produces the full part template; Vanilla assumes that structure already exists and connects it.',
    "architecture.flow3":
      '<strong>The machine updates state.</strong> Only enhanced components write state attributes, virtual focus, or selection; native alternatives stay with the browser.',
    "architecture.flow4":
      '<strong>Styles read attributes and styling hooks.</strong> Paint comes from shared CSS, not from binding-specific logic.',
    "architecture.useTitle": "Model limits",
    "architecture.use1":
      '<strong>Reference does not replace this page.</strong> Each component Reference tab lists signatures, options, and slots for quick lookup; it does not explain how they relate.',
    "architecture.use2":
      '<strong>A styling hook does not replace the Contract.</strong> It adjusts public paint; it does not change parts, states, or accessibility.',
    "architecture.use3":
      '<strong>A Binding does not invent options.</strong> If React or Vanilla needs a new option, it is added to the Contract or it does not exist.',
    "architecture.exampleTitle": "Example: Accordion",
    "architecture.exampleBody":
      "Accordion uses the whole model: its Contract declares root, item, trigger, and content; its Markup contract says how to nest those parts; its signatures separate disclosure uses; the machine coordinates which sections are open; and React or Vanilla realize the same behavior through different bindings.",
    "architecture.nextBody":
      'It comes from <a href="/foundations">Foundations</a>. The next cut is visual: <a href="/tiers">Tiers</a> explains how primitive, semantic, and styling hook order tokens. For specific option lookup, use <a href="/reference">Reference</a>.',
  },
} as const;
