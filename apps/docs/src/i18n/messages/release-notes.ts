export const releaseNotesMessages = {
  es: {
    "releaseNotes.title": "Notas de versión",
    "releaseNotes.description": "Qué cambió en cada versión del kit, por contrato.",
    "releaseNotes.lede":
      "El número del pie es la versión del <em>contrato</em>, no de un paquete suelto. Aquí está lo que se movió en cada una, agrupado por superficie. El historial de un componente solo vive en la pestaña Changelog de su propia página.",
    "releaseNotes.empty": "Todavía no hay entradas registradas.",
    "releaseNotes.unreleased": "Sin publicar",
    "releaseNotes.surfaceCount": "{count} contratos",
    "releaseNotes.since": "Qué cambió desde {previous}",
    "releaseNotes.summaryFirst": "Primera versión del kit: {count} componentes.",
    "releaseNotes.summaryAdded": "{count} componentes nuevos: {list}.",
    "releaseNotes.summaryBreaking": "Cambios que obligan a actuar en {count} componentes que ya existían: {list}.",
    "releaseNotes.summaryChanges": "En lo que ya existía: {features} mejoras, {fixes} arreglos y {other} ajustes internos.",
  },
  en: {
    "releaseNotes.title": "Release notes",
    "releaseNotes.description": "What changed in each kit version, by contract.",
    "releaseNotes.lede":
      "The footer number is the <em>contract</em> version, not any one package's. Here is what moved in each release, grouped by surface. A single component's history still lives on that component's own Changelog tab.",
    "releaseNotes.empty": "Nothing recorded yet.",
    "releaseNotes.unreleased": "Unreleased",
    "releaseNotes.surfaceCount": "{count} contracts",
    "releaseNotes.since": "What changed since {previous}",
    "releaseNotes.summaryFirst": "The kit's first release: {count} components.",
    "releaseNotes.summaryAdded": "{count} new components: {list}.",
    "releaseNotes.summaryBreaking": "Changes that need action in {count} components that already existed: {list}.",
    "releaseNotes.summaryChanges": "In what already existed: {features} improvements, {fixes} fixes and {other} internal adjustments.",
  },
} as const;
