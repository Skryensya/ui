import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * The landing page's bento marquee. Twelve boxes laid out once (`bentoSlots`), five sets of
 * content for them (A to E), plus one set with a layout of its own (`phoneSlots`: a phone-sized box
 * and nine around it), so an example takes six sets to come back.
 *
 * Each box is a small composition built from several components (a card with its person, its text,
 * its tags and its two answers), not a specimen of one. A lone component only appears where the box
 * has no room for anything beside it (a one-row box of 80px, a switch, a pager).
 *
 * Budget per box, which is what the page's CSS gives it: tile padding is `--space-inset-md` on every
 * side, so the content area is the cell minus about 34px on each axis. One row is 5rem, a column 5.5rem,
 * the gap 1rem. Keep a composition inside that or it will be clipped.
 *
 * Every tree here is checked by `landing-bento.test.ts` against its contract, in both locales.
 */

type Options = Record<string, string | boolean | number>;

export type BentoTile = {
  id: string;
  /** [row, column, rowSpan, columnSpan] on the 12 x 6 grid. */
  area: [number, number, number, number];
  /** Where along the box a stitch to the box on its right leaves, when it has one. */
  link?: string;
  accent?: boolean;
  /** A phone-sized box: the page frames it as a device, and anything fixed inside it stays inside. */
  phone?: boolean;
  tree: UsageTree;
};

/*
 * 12 x 6 cells: [row, column, rowSpan, columnSpan]. Cut lines drift from band to band and tall boxes
 * cross them, so edges rarely line up. The hole at the bottom right is deliberate.
 */
export const bentoSlots: Pick<BentoTile, "area" | "link" | "accent">[] = [
  { area: [1, 1, 2, 5], link: "50%" },
  { area: [1, 6, 2, 2], link: "25%", accent: true },
  { area: [1, 8, 1, 5] },
  { area: [2, 8, 3, 3], link: "50%" },
  { area: [2, 11, 1, 2] },
  { area: [3, 11, 3, 2] },
  { area: [3, 1, 2, 3], link: "24%" },
  { area: [3, 4, 1, 4] },
  { area: [4, 4, 2, 4], link: "25%" },
  { area: [5, 1, 2, 3], link: "25%" },
  { area: [5, 8, 1, 3] },
  { area: [6, 4, 1, 4] },
];

/*
 * The set with a phone in it: 3 columns by 6 rows is 296 x 560px, about the 9:19 of a handset, so the
 * Vaul inside has a real screen to sit at the bottom of. Nine boxes fill the other nine columns, with
 * the same drifting cut lines as the default layout. No hole: the phone already makes the set tall.
 */
export const phoneSlots: Pick<BentoTile, "area" | "link" | "phone">[] = [
  { area: [1, 1, 6, 3], phone: true },
  { area: [1, 4, 2, 4], link: "75%" },
  { area: [1, 8, 1, 5] },
  { area: [2, 8, 3, 3], link: "50%" },
  { area: [2, 11, 2, 2] },
  { area: [3, 4, 1, 4], link: "50%" },
  { area: [4, 4, 2, 4], link: "75%" },
  { area: [4, 11, 3, 2] },
  { area: [5, 8, 2, 3] },
  { area: [6, 4, 1, 4] },
];

export function bentoSets(es: boolean): BentoTile[][] {
  const t = (spanish: string, english: string) => (es ? spanish : english);

  const btn = (children: string, options: Options = {}): UsageTree => ({
    contract: "button",
    signature: "Button.action",
    options,
    children,
  });
  const inline = (
    children: UsageTree[],
    gap = "sm",
    options: Options = {},
  ): UsageTree => ({
    contract: "layout",
    signature: "Inline",
    options: { gap, inlineAlign: "center", ...options },
    children,
  });
  const between = (children: UsageTree[], gap = "sm"): UsageTree =>
    inline(children, gap, { justify: "between", wrap: true });
  const stack = (children: UsageTree[], gap = "sm"): UsageTree => ({
    contract: "layout",
    signature: "Stack",
    options: { gap },
    children,
  });
  const text = (children: string, options: Options = {}): UsageTree => ({
    contract: "typography",
    signature: "Text",
    options,
    children,
  });
  const title = (children: string): UsageTree =>
    text(children, { weight: "emphasis" });
  const hint = (children: string): UsageTree =>
    text(children, { tone: "secondary", size: "sm" });
  const badge = (children: string, tone?: string): UsageTree => ({
    contract: "badge",
    signature: "Badge",
    ...(tone ? { options: { tone } } : {}),
    children,
  });
  const kbd = (children: string): UsageTree => ({
    contract: "kbd",
    signature: "Kbd",
    children,
  });
  const avatar = (name: string, initials: string, size = "md"): UsageTree => ({
    contract: "avatar",
    signature: "Avatar.initials",
    options: { name, size },
    children: initials,
  });
  const slot = (index: number, id: string, tree: UsageTree): BentoTile => ({
    id,
    tree,
    ...bentoSlots[index],
  });
  const phoneSlot = (
    index: number,
    id: string,
    tree: UsageTree,
  ): BentoTile => ({ id, tree, ...phoneSlots[index] });

  const setA: BentoTile[] = [
    // A document header and its toolbar: toggles that stay on beside the one primary action.
    slot(
      0,
      "toolbar",
      stack(
        [
          between([
            stack(
              [
                title(t("Informe T3", "Q3 report")),
                hint(
                  t(
                    "Borrador · editado hace 2 min",
                    "Draft · edited 2 min ago",
                  ),
                ),
              ],
              "xs",
            ),
            badge(t("Borrador", "Draft"), "warning"),
          ]),
          between([
            inline(
              [
                btn(t("Negrita", "Bold"), { variant: "soft", pressed: true }),
                btn(t("Cursiva", "Italic"), {
                  variant: "ghost",
                  pressed: false,
                }),
                btn(t("Enlace", "Link"), { variant: "ghost", pressed: false }),
              ],
              "xs",
            ),
            btn(t("Publicar", "Publish"), { tone: "accent" }),
          ]),
        ],
        "md",
      ),
    ),
    // A dashboard figure and how close it is to the day's goal.
    slot(
      1,
      "stat",
      stack(
        [
          {
            contract: "stat",
            signature: "Stat",
            options: { trend: "up" },
            slots: {
              label: t("Resueltas hoy", "Resolved today"),
              value: "12",
              change: t("3 más que ayer", "3 more than yesterday"),
            },
          },
          {
            contract: "progress",
            signature: "Progress",
            options: { value: 80, label: t("Meta del día", "Daily goal") },
          },
        ],
        "md",
      ),
    ),
    // Where you are, and the state of the thing you are in.
    slot(
      2,
      "location",
      between([
        {
          contract: "breadcrumb",
          signature: "Breadcrumb",
          options: { label: t("Ubicación", "You are here") },
          slots: {
            items: [
              {
                options: { href: "#" },
                slots: { label: t("Proyectos", "Projects") },
              },
              { options: { href: "#" }, slots: { label: "Aurora" } },
              {
                options: { current: true },
                slots: { label: t("Configuración", "Settings") },
              },
            ],
          },
        },
        badge(t("Activo", "Active"), "success"),
      ]),
    ),
    // An access request: who, why, what they get, and the two answers.
    slot(
      3,
      "request",
      stack(
        [
          inline([
            avatar("Ana Pérez", "AP"),
            stack(
              [
                title("Ana Pérez"),
                hint(
                  t("Solicita acceso a Aurora", "Requests access to Aurora"),
                ),
              ],
              "xs",
            ),
          ]),
          text(
            t(
              "Necesito editar la configuración esta semana.",
              "I need to edit the settings this week.",
            ),
            { tone: "secondary" },
          ),
          inline(
            [
              {
                contract: "tag",
                signature: "Tag",
                options: { tone: "accent" },
                children: t("Editora", "Editor"),
              },
              { contract: "tag", signature: "Tag", children: "Aurora" },
            ],
            "xs",
          ),
          inline([
            btn(t("Aprobar", "Approve"), { tone: "accent" }),
            btn(t("Rechazar", "Reject"), { variant: "soft", tone: "danger" }),
          ]),
        ],
        "md",
      ),
    ),
    // A setting that applies at once, so a Switch and not a Checkbox. Nothing else fits beside it.
    slot(4, "switch", {
      contract: "switch",
      signature: "Switch",
      options: { defaultChecked: true },
      children: t("Alertas", "Alerts"),
    }),
    // A filter panel: independent choices and the way to undo them.
    slot(
      5,
      "filters",
      stack(
        [
          title(t("Estado", "Status")),
          stack(
            [
              {
                contract: "checkbox",
                signature: "Checkbox",
                options: { defaultChecked: true },
                children: t("Abierto", "Open"),
              },
              {
                contract: "checkbox",
                signature: "Checkbox",
                children: t("En revisión", "In review"),
              },
              {
                contract: "checkbox",
                signature: "Checkbox",
                children: t("Cerrado", "Closed"),
              },
            ],
            "xs",
          ),
          btn(t("Limpiar", "Clear"), { variant: "ghost", size: "sm" }),
        ],
        "sm",
      ),
    ),
    // A sign-in form: the field with its label, and the action that submits it.
    slot(
      6,
      "email",
      stack(
        [
          {
            contract: "form-field",
            signature: "FormField",
            slots: { label: t("Correo institucional", "Institutional email") },
            children: {
              contract: "input",
              signature: "Input",
              options: {
                type: "email",
                placeholder: t(
                  "nombre@institucion.org",
                  "name@institution.org",
                ),
              },
            },
          },
          btn(t("Enviar enlace", "Send link"), { tone: "accent" }),
        ],
        "sm",
      ),
    ),
    // A review line: the score, the count and who vouches for it.
    slot(
      7,
      "review",
      inline([
        {
          contract: "rating",
          signature: "RatingDisplay",
          options: {
            value: 4,
            label: t("Valorado con 4 de 5", "Rated 4 out of 5"),
          },
        },
        hint(t("4,0 · 128 reseñas", "4.0 · 128 reviews")),
        badge(t("Verificado", "Verified"), "success"),
      ]),
    ),
    // A heads-up that needs nothing from you, and the two ways to follow it up.
    slot(8, "notice", {
      contract: "callout",
      signature: "Callout",
      options: { tone: "info" },
      slots: { title: t("Revisión programada", "Review scheduled") },
      children: stack([
        text(
          t(
            "Aurora se revisa este viernes.",
            "Aurora is reviewed this Friday.",
          ),
          { size: "sm" },
        ),
        inline(
          [
            btn(t("Ver calendario", "View calendar"), {
              variant: "soft",
              size: "sm",
            }),
            btn(t("Entendido", "Got it"), { variant: "ghost", size: "sm" }),
          ],
          "xs",
        ),
      ]),
    }),
    // A list header with its count, and the switch for how the list is shown.
    slot(
      9,
      "views",
      stack(
        [
          between([title(t("Proyectos", "Projects")), badge("12")]),
          {
            contract: "segmented",
            signature: "Segmented",
            options: { value: "board", label: t("Vista", "View") },
            slots: {
              items: [
                {
                  options: { value: "list" },
                  slots: { label: t("Lista", "List") },
                },
                {
                  options: { value: "board" },
                  slots: { label: t("Tablero", "Board") },
                },
                {
                  options: { value: "calendar" },
                  slots: { label: t("Calendario", "Calendar") },
                },
              ],
            },
          },
        ],
        "sm",
      ),
    ),
    // A shortcut hint, the way a search field advertises itself.
    slot(
      10,
      "shortcut",
      inline([
        text(t("Buscar en todo", "Search anything"), { tone: "secondary" }),
        inline([kbd("⌘"), kbd("K")], "xs"),
      ]),
    ),
    // Active filters as removable chips, and the way to drop them all.
    slot(
      11,
      "chips",
      inline(
        [
          {
            contract: "tag",
            signature: "Tag",
            options: {
              removable: true,
              removeLabel: t("Quitar Frontend", "Remove Frontend"),
            },
            children: "Frontend",
          },
          {
            contract: "tag",
            signature: "Tag",
            options: {
              tone: "danger",
              removable: true,
              removeLabel: t("Quitar Urgente", "Remove Urgent"),
            },
            children: t("Urgente", "Urgent"),
          },
          btn(t("Limpiar", "Clear"), { variant: "ghost", size: "sm" }),
        ],
        "xs",
      ),
    ),
  ];

  const setB: BentoTile[] = [
    // A wizard: where you are in the process, and the two ways out of this step.
    slot(
      0,
      "steps",
      stack(
        [
          {
            contract: "steps",
            signature: "Steps",
            options: { orientation: "horizontal" },
            slots: {
              items: [
                {
                  options: { status: "complete" },
                  slots: { marker: "1", label: t("Datos", "Details") },
                },
                {
                  options: { status: "current" },
                  slots: { marker: "2", label: t("Revisión", "Review") },
                },
                {
                  options: { status: "upcoming" },
                  slots: { marker: "3", label: t("Aprobación", "Approval") },
                },
              ],
            },
          },
          inline(
            [
              btn(t("Atrás", "Back"), { variant: "ghost" }),
              btn(t("Continuar", "Continue"), { tone: "accent" }),
            ],
            "sm",
            { justify: "end" },
          ),
        ],
        "md",
      ),
    ),
    // A measurement inside a range (a Meter, not a Progress), and the action it asks for.
    slot(
      1,
      "meter",
      stack(
        [
          {
            contract: "meter",
            signature: "Meter",
            options: { value: 72, label: t("Almacenamiento", "Storage") },
          },
          hint(t("72 GB de 100 GB", "72 GB of 100 GB")),
          btn(t("Ampliar plan", "Upgrade"), { variant: "soft", size: "sm" }),
        ],
        "sm",
      ),
    ),
    // Who is on this, and the way to add someone.
    slot(
      2,
      "people",
      between([
        inline([
          {
            contract: "avatar",
            signature: "AvatarGroup",
            options: { label: t("Colaboradores", "Collaborators") },
            slots: { overflow: "+4" },
            children: [
              avatar("Ana Pérez", "AP"),
              avatar("Luis Mora", "LM"),
              avatar("Carla Rey", "CR"),
            ],
          },
          hint(t("7 colaboradores", "7 collaborators")),
        ]),
        btn(t("Invitar", "Invite"), { variant: "soft", size: "sm" }),
      ]),
    ),
    // An order's history: what it is, how it ended, and when each step happened.
    slot(
      3,
      "history",
      stack(
        [
          between([
            title(t("Solicitud n.º 204", "Request no. 204")),
            badge(t("Aprobada", "Approved"), "success"),
          ]),
          {
            contract: "timeline",
            signature: "Timeline",
            children: [
              {
                contract: "timeline",
                signature: "TimelineItem",
                options: { time: "2026-03-03T09:12" },
                slots: { heading: t("Creada", "Created"), time: "09:12" },
              },
              {
                contract: "timeline",
                signature: "TimelineItem",
                options: { time: "2026-03-03T10:40" },
                slots: {
                  heading: t("En revisión", "In review"),
                  time: "10:40",
                },
              },
              {
                contract: "timeline",
                signature: "TimelineItem",
                options: { time: "2026-03-03T11:05", tone: "success" },
                slots: { heading: t("Aprobada", "Approved"), time: "11:05" },
              },
            ],
          },
        ],
        "sm",
      ),
    ),
    // Two badges: the state and the version. Nothing else fits beside them.
    slot(
      4,
      "status",
      inline([badge(t("Activo", "Active"), "success"), badge("v0.0.1")], "xs"),
    ),
    // A summary of one record and the one thing to do with it.
    slot(
      5,
      "plan",
      stack(
        [
          title(t("Suscripción", "Subscription")),
          {
            contract: "description-list",
            signature: "DescriptionList",
            children: [
              {
                contract: "description-list",
                signature: "DescriptionItem",
                slots: { term: "Plan" },
                children: "Pro",
              },
              {
                contract: "description-list",
                signature: "DescriptionItem",
                slots: { term: t("Renueva", "Renews") },
                children: t("3 de marzo", "March 3"),
              },
            ],
          },
          btn(t("Gestionar", "Manage"), { variant: "soft", size: "sm" }),
        ],
        "sm",
      ),
    ),
    // One choice out of three, with the question above it.
    slot(
      6,
      "radio",
      stack(
        [
          title(t("Elige un plan", "Choose a plan")),
          {
            contract: "radio-group",
            signature: "RadioGroup",
            options: { name: "plan", value: "pro", label: t("Plan", "Plan") },
            slots: {
              items: [
                {
                  options: { value: "basic" },
                  slots: { label: t("Básico", "Basic") },
                },
                { options: { value: "pro" }, slots: { label: "Pro" } },
                {
                  options: { value: "team" },
                  slots: { label: t("Equipo", "Team") },
                },
              ],
            },
          },
        ],
        "xs",
      ),
    ),
    // A search row: the field keeps its label (hidden) and the action sits beside it.
    slot(
      7,
      "search",
      inline(
        [
          {
            contract: "form-field",
            signature: "FormField",
            options: { labelHidden: true },
            slots: { label: t("Buscar proyectos", "Search projects") },
            children: {
              contract: "input",
              signature: "Input",
              options: {
                type: "search",
                placeholder: t("Buscar proyectos", "Search projects"),
              },
            },
          },
          btn(t("Buscar", "Search"), { tone: "accent" }),
        ],
        "sm",
        { inlineAlign: "end" },
      ),
    ),
    // A testimonial with the face of the person who said it.
    slot(
      8,
      "quote",
      inline(
        [
          avatar("Laura Soto", "LS", "lg"),
          {
            contract: "quote",
            signature: "Quote",
            slots: {
              attribution: t(
                "Laura Soto, líder de diseño",
                "Laura Soto, design lead",
              ),
            },
            children: t(
              "Con el contrato primero, diseño y código dejaron de discutir qué es un botón.",
              "With the contract first, design and code stopped arguing about what a button is.",
            ),
          },
        ],
        "md",
        { inlineAlign: "start", wrap: false },
      ),
    ),
    // A typed quantity and what it costs.
    slot(
      9,
      "seats",
      stack(
        [
          {
            contract: "number-field",
            signature: "NumberField",
            options: { defaultValue: "2", min: 1, max: 10 },
            slots: { label: t("Cupos", "Seats") },
          },
          hint(
            t("US$12 por cupo · total US$24", "US$12 per seat · US$24 total"),
          ),
        ],
        "sm",
      ),
    ),
    // An approximate value you want to see move. Nothing else fits beside it in a one-row box.
    slot(10, "volume", {
      contract: "slider",
      signature: "Slider",
      options: { value: 40, min: 0, max: 100 },
      attrs: { "aria-label": t("Volumen", "Volume") },
    }),
    // Where you are in a long list of results. Nothing else fits beside it.
    slot(11, "pages", {
      contract: "pagination",
      signature: "Pagination",
      options: {
        page: 3,
        total: 9,
        siblings: 0,
        label: t("Resultados", "Results"),
      },
    }),
  ];

  const setC: BentoTile[] = [
    // Switching between views of the same project.
    slot(0, "tabs", {
      contract: "tabs",
      signature: "Tabs",
      attrs: { "aria-label": t("Proyecto", "Project") },
      slots: {
        items: [
          {
            options: { value: "overview" },
            slots: {
              label: t("Resumen", "Overview"),
              children: t(
                "Aurora tiene 3 solicitudes abiertas.",
                "Aurora has 3 open requests.",
              ),
            },
          },
          {
            options: { value: "activity" },
            slots: {
              label: t("Actividad", "Activity"),
              children: t("Todavía no hay actividad.", "No activity yet."),
            },
          },
          {
            options: { value: "access" },
            slots: {
              label: t("Acceso", "Access"),
              children: t("4 personas tienen acceso.", "4 people have access."),
            },
          },
        ],
      },
    }),
    // A profile: the person, their role and whether they are around.
    slot(
      1,
      "profile",
      stack(
        [
          avatar("Ana Pérez", "AP"),
          title("Ana Pérez"),
          hint(t("Líder de diseño", "Design lead")),
          badge(t("En línea", "Online"), "success"),
        ],
        "xs",
      ),
    ),
    // A status line: the dot that carries meaning, the words that say it and where to read more.
    slot(
      2,
      "health",
      between([
        inline([
          {
            contract: "badge",
            signature: "BadgeDot",
            options: { tone: "success", label: t("Operativo", "Operational") },
          },
          text(t("Todo operativo", "All systems operational")),
          hint(t("hace 2 min", "2 min ago")),
        ]),
        btn(t("Ver detalles", "Details"), { variant: "ghost", size: "sm" }),
      ]),
    ),
    // Nothing to show yet, and what to do about it. An EmptyState needs a tall box, so it takes the 3 x 3.
    slot(3, "empty", {
      contract: "empty-state",
      signature: "EmptyState",
      slots: {
        title: t("Sin resultados", "No results"),
        description: t(
          "Prueba otro término o limpia los filtros.",
          "Try another term or clear the filters.",
        ),
        actions: btn(t("Limpiar filtros", "Clear filters"), {
          variant: "soft",
        }),
      },
    }),
    // Work with no known length, and the word for it.
    slot(
      4,
      "sync",
      inline([
        {
          contract: "loader",
          signature: "Loader",
          options: { label: t("Sincronizando", "Syncing") },
        },
        text(t("Sincronizando", "Syncing"), { tone: "secondary" }),
      ]),
    ),
    // A sidebar: whose workspace it is, where you can go and where you are.
    slot(
      5,
      "sidebar",
      stack(
        [
          inline([avatar("Aurora", "A", "sm"), title("Aurora")]),
          {
            contract: "nav-list",
            signature: "NavList",
            attrs: { "aria-label": t("Secciones", "Sections") },
            children: {
              contract: "nav-list",
              signature: "NavListGroup",
              children: [
                {
                  contract: "nav-list",
                  signature: "NavListLink",
                  options: { href: "#", current: true },
                  children: t("Resumen", "Overview"),
                },
                {
                  contract: "nav-list",
                  signature: "NavListLink",
                  options: { href: "#" },
                  children: t("Proyectos", "Projects"),
                },
                {
                  contract: "nav-list",
                  signature: "NavListLink",
                  options: { href: "#" },
                  children: t("Equipo", "Team"),
                },
                {
                  contract: "nav-list",
                  signature: "NavListLink",
                  options: { href: "#" },
                  children: t("Ajustes", "Settings"),
                },
              ],
            },
          },
        ],
        "sm",
      ),
    ),
    // An assignment form: the choice and the two ways to finish it.
    slot(
      6,
      "assign",
      stack(
        [
          {
            contract: "form-field",
            signature: "FormField",
            slots: { label: t("Responsable", "Assignee") },
            children: {
              contract: "select",
              signature: "Select.native",
              options: { value: "ana" },
              slots: {
                items: [
                  { options: { value: "ana" }, slots: { label: "Ana Pérez" } },
                  { options: { value: "luis" }, slots: { label: "Luis Mora" } },
                  {
                    options: { value: "carla" },
                    slots: { label: "Carla Rey" },
                  },
                ],
              },
            },
          },
          inline(
            [
              btn(t("Cancelar", "Cancel"), { variant: "ghost" }),
              btn(t("Asignar", "Assign"), { tone: "accent" }),
            ],
            "sm",
            { justify: "end" },
          ),
        ],
        "sm",
      ),
    ),
    // The same Button contract in four appearances: only the `appearance` option changes.
    slot(
      7,
      "appearance",
      inline(
        ["plain", "tactile", "brutalist", "frosted"].map((appearance) =>
          btn(appearance, { appearance, size: "sm" }),
        ),
        "xs",
      ),
    ),
    // Questions answered one at a time, under their heading.
    slot(
      8,
      "faq",
      stack(
        [
          title(t("Preguntas frecuentes", "FAQ")),
          {
            contract: "accordion",
            signature: "Accordion",
            children: [
              [
                "a",
                t("¿Qué es un contrato?", "What is a contract?"),
                t(
                  "La definición de un componente: partes, opciones y reglas.",
                  "A definition of a component: its parts, options and rules.",
                ),
              ],
              [
                "b",
                t("¿Puedo usar Vue?", "Can I use Vue?"),
                t(
                  "El contrato no te ata a un solo runtime.",
                  "The contract does not tie you to one runtime.",
                ),
              ],
            ].map(([value, question, answer]) => ({
              contract: "accordion",
              signature: "Accordion.Item",
              options: { value },
              children: [
                {
                  contract: "accordion",
                  signature: "Accordion.Trigger",
                  children: question,
                },
                {
                  contract: "accordion",
                  signature: "Accordion.Content",
                  children: answer,
                },
              ],
            })),
          },
        ],
        "xs",
      ),
    ),
    // Preferences that apply at once, under their heading.
    slot(
      9,
      "prefs",
      stack(
        [
          title(t("Notificaciones", "Notifications")),
          stack(
            [
              {
                contract: "switch",
                signature: "Switch",
                options: { defaultChecked: true },
                children: t("Correo", "Email"),
              },
              { contract: "switch", signature: "Switch", children: "Push" },
              {
                contract: "switch",
                signature: "Switch",
                options: { defaultChecked: true },
                children: "SMS",
              },
            ],
            "xs",
          ),
        ],
        "sm",
      ),
    ),
    // A file going up: its name, how far it is, and the bar.
    slot(
      10,
      "upload",
      stack(
        [
          between(
            [hint(t("informe-t3.pdf", "q3-report.pdf")), hint("64%")],
            "sm",
          ),
          {
            contract: "progress",
            signature: "Progress",
            options: {
              value: 64,
              label: t("Subiendo informe", "Uploading report"),
            },
          },
        ],
        "xs",
      ),
    ),
    // Keyboard shortcuts, the way a menu lists them.
    slot(
      11,
      "keys",
      inline(
        [
          inline(
            [inline([kbd("⌘"), kbd("S")], "xs"), hint(t("Guardar", "Save"))],
            "xs",
          ),
          inline(
            [inline([kbd("⌘"), kbd("Z")], "xs"), hint(t("Deshacer", "Undo"))],
            "xs",
          ),
        ],
        "md",
      ),
    ),
  ];

  const setD: BentoTile[] = [
    // An install command: what to run, how to copy it, and which binding it is for.
    slot(
      0,
      "install",
      stack(
        [
          title(t("Instalación", "Installation")),
          between([
            {
              contract: "typography",
              signature: "Code",
              children: "pnpm add @skryensya/react",
            },
            {
              contract: "clipboard",
              signature: "CopyButton",
              options: {
                value: "pnpm add @skryensya/react",
                label: t("Copiar comando", "Copy command"),
              },
            },
          ]),
          hint(
            t(
              "Elige un binding: React o Vanilla.",
              "Pick a binding: React or Vanilla.",
            ),
          ),
        ],
        "md",
      ),
    ),
    // Asking for a score, and a way to send it.
    slot(
      1,
      "feedback",
      stack(
        [
          hint(t("¿Cómo te fue?", "How did it go?")),
          {
            contract: "rating",
            signature: "Rating",
            options: {
              name: "experience",
              label: t("Tu experiencia", "Your experience"),
              defaultValue: 4,
              symbolSize: "sm",
            },
          },
          btn(t("Enviar", "Send"), { variant: "soft", size: "sm" }),
        ],
        "sm",
      ),
    ),
    // A row of links and the version they belong to.
    slot(
      2,
      "links",
      between([
        inline(
          [
            {
              contract: "typography",
              signature: "Link",
              options: { href: "#" },
              children: t("Documentación", "Docs"),
            },
            {
              contract: "typography",
              signature: "Link",
              options: { href: "#" },
              children: t("Novedades", "Changelog"),
            },
            {
              contract: "typography",
              signature: "Link",
              options: { href: "#" },
              children: "GitHub",
            },
          ],
          "md",
        ),
        badge("v0.0.1", "accent"),
      ]),
    ),
    // A feed: what just happened, in rows of a title and a line of detail.
    slot(
      3,
      "activity",
      stack(
        [
          title(t("Actividad", "Activity")),
          {
            contract: "list",
            signature: "List",
            children: [
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  title: t("Ana comentó", "Ana commented"),
                  description: t("Configuración de Aurora", "Aurora settings"),
                },
              },
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  title: t("Luis aprobó", "Luis approved"),
                  description: t("Solicitud n.º 204", "Request no. 204"),
                },
              },
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  title: t(
                    "Carla invitó a 2 personas",
                    "Carla invited 2 people",
                  ),
                  description: t("Equipo de diseño", "Design team"),
                },
              },
            ],
          },
        ],
        "sm",
      ),
    ),
    // A status with a number beside it.
    slot(
      4,
      "pending",
      inline([
        {
          contract: "badge",
          signature: "BadgeDot",
          options: { tone: "warning", label: t("Pendiente", "Pending") },
        },
        text(t("3 pendientes", "3 pending")),
      ]),
    ),
    // Onboarding: the steps down the side, the heading above.
    slot(
      5,
      "onboarding",
      stack(
        [
          title(t("Primeros pasos", "Getting started")),
          {
            contract: "steps",
            signature: "Steps",
            options: { orientation: "vertical" },
            slots: {
              items: [
                {
                  options: { status: "complete" },
                  slots: {
                    marker: "1",
                    label: t("Crear cuenta", "Create account"),
                  },
                },
                {
                  options: { status: "current" },
                  slots: {
                    marker: "2",
                    label: t("Invitar equipo", "Invite team"),
                  },
                },
                {
                  options: { status: "upcoming" },
                  slots: { marker: "3", label: t("Publicar", "Publish") },
                },
              ],
            },
          },
        ],
        "sm",
      ),
    ),
    // A password field (it brings its own label) and the rule it is held to.
    slot(
      6,
      "password",
      stack(
        [
          {
            contract: "password-input",
            signature: "PasswordInput",
            options: {
              placeholder: t("Mínimo 12 caracteres", "At least 12 characters"),
            },
            slots: { label: t("Contraseña", "Password") },
          },
          hint(
            t(
              "Usa letras, números y un símbolo.",
              "Use letters, numbers and a symbol.",
            ),
          ),
        ],
        "sm",
      ),
    ),
    // One line of activity: who, what and when.
    slot(
      7,
      "comment",
      inline([
        avatar("Ana Pérez", "AP", "sm"),
        text(t("Ana comentó en Aurora", "Ana commented on Aurora")),
        hint(t("hace 5 min", "5 min ago")),
      ]),
    ),
    // A small table: who is on the team and in what state.
    slot(8, "team", {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        {
          contract: "table",
          signature: "Table",
          attrs: { "aria-label": t("Equipo", "Team") },
          children: [
            {
              contract: "table",
              signature: "TableHead",
              children: {
                contract: "table",
                signature: "TableRow",
                children: [
                  {
                    contract: "table",
                    signature: "TableHeader",
                    children: t("Nombre", "Name"),
                  },
                  {
                    contract: "table",
                    signature: "TableHeader",
                    children: t("Rol", "Role"),
                  },
                  {
                    contract: "table",
                    signature: "TableHeader",
                    children: t("Estado", "Status"),
                  },
                ],
              },
            },
            {
              contract: "table",
              signature: "TableBody",
              children: [
                {
                  contract: "table",
                  signature: "TableRow",
                  children: [
                    {
                      contract: "table",
                      signature: "TableCell",
                      children: "Ana Pérez",
                    },
                    {
                      contract: "table",
                      signature: "TableCell",
                      children: t("Diseño", "Design"),
                    },
                    {
                      contract: "table",
                      signature: "TableCell",
                      children: t("Activa", "Active"),
                    },
                  ],
                },
                {
                  contract: "table",
                  signature: "TableRow",
                  children: [
                    {
                      contract: "table",
                      signature: "TableCell",
                      children: "Luis Mora",
                    },
                    {
                      contract: "table",
                      signature: "TableCell",
                      children: t("Código", "Code"),
                    },
                    {
                      contract: "table",
                      signature: "TableCell",
                      children: t("Invitado", "Invited"),
                    },
                  ],
                },
              ],
            },
          ],
        },
        hint(t("2 de 8 personas", "2 of 8 people")),
      ],
    }),
    // Two figures side by side under one heading.
    slot(
      9,
      "summary",
      stack(
        [
          title(t("Resumen", "Summary")),
          inline(
            [
              {
                contract: "stat",
                signature: "Stat",
                options: { trend: "up" },
                slots: {
                  label: t("Altas", "Sign-ups"),
                  value: "24",
                  change: "+6",
                },
              },
              {
                contract: "stat",
                signature: "Stat",
                options: { trend: "down" },
                slots: {
                  label: t("Bajas", "Cancellations"),
                  value: "3",
                  change: "-1",
                },
              },
            ],
            "lg",
            { inlineAlign: "start" },
          ),
        ],
        "sm",
      ),
    ),
    // A pager written by hand: back, where you are, forward.
    slot(
      10,
      "pager",
      between([
        btn(t("Anterior", "Previous"), { variant: "soft", size: "sm" }),
        hint(t("2 de 9", "2 of 9")),
        btn(t("Siguiente", "Next"), { variant: "soft", size: "sm" }),
      ]),
    ),
    // An announcement: what is new and where to try it.
    slot(
      11,
      "announce",
      inline([
        badge(t("Nuevo", "New"), "accent"),
        text(t("Modo oscuro disponible", "Dark mode is here")),
        {
          contract: "typography",
          signature: "Link",
          options: { href: "#" },
          children: t("Probar", "Try it"),
        },
      ]),
    ),
  ];

  const setE: BentoTile[] = [
    // A billing header and the callout that closes it.
    slot(
      0,
      "billing",
      stack(
        [
          between([
            title(t("Facturación", "Billing")),
            badge(t("Al día", "Paid up"), "success"),
          ]),
          {
            contract: "callout",
            signature: "Callout",
            options: { tone: "success" },
            slots: { title: t("Pago recibido", "Payment received") },
            children: text(
              t(
                "Tu plan Pro sigue activo hasta el 3 de abril.",
                "Your Pro plan stays active until April 3.",
              ),
              { size: "sm" },
            ),
          },
        ],
        "sm",
      ),
    ),
    // Two measurements of the same period.
    slot(
      1,
      "usage",
      stack(
        [
          {
            contract: "meter",
            signature: "Meter",
            options: { value: 80, label: t("Diseño", "Design") },
          },
          {
            contract: "meter",
            signature: "Meter",
            options: { value: 45, label: t("Código", "Code") },
          },
        ],
        "sm",
      ),
    ),
    // A filter bar: which slice, and how many it holds.
    slot(
      2,
      "filter",
      between([
        {
          contract: "segmented",
          signature: "Segmented",
          options: { value: "all", label: t("Estado", "Status") },
          slots: {
            items: [
              {
                options: { value: "all" },
                slots: { label: t("Todos", "All") },
              },
              {
                options: { value: "open" },
                slots: { label: t("Abiertos", "Open") },
              },
              {
                options: { value: "closed" },
                slots: { label: t("Cerrados", "Closed") },
              },
            ],
          },
        },
        hint(t("128 resultados", "128 results")),
      ]),
    ),
    // Billing questions, one at a time.
    slot(
      3,
      "billing-faq",
      stack(
        [
          title(t("Facturación", "Billing")),
          {
            contract: "accordion",
            signature: "Accordion",
            children: [
              [
                "a",
                t("¿Cuándo se cobra?", "When am I charged?"),
                t("El 3 de cada mes.", "On the 3rd of each month."),
              ],
              [
                "b",
                t("¿Puedo cancelar?", "Can I cancel?"),
                t("Cuando quieras, sin costo.", "Any time, free of charge."),
              ],
              [
                "c",
                t("¿Hay facturas?", "Are there invoices?"),
                t("Se envían por correo.", "They are sent by email."),
              ],
            ].map(([value, question, answer]) => ({
              contract: "accordion",
              signature: "Accordion.Item",
              options: { value },
              children: [
                {
                  contract: "accordion",
                  signature: "Accordion.Trigger",
                  children: question,
                },
                {
                  contract: "accordion",
                  signature: "Accordion.Content",
                  children: answer,
                },
              ],
            })),
          },
        ],
        "sm",
      ),
    ),
    // A theme switch, short enough to share a one-row box.
    slot(4, "dark", {
      contract: "switch",
      signature: "Switch",
      children: t("Oscuro", "Dark"),
    }),
    // A density choice: one option out of three, the question above it.
    slot(
      5,
      "density",
      stack(
        [
          title(t("Densidad", "Density")),
          {
            contract: "radio-group",
            signature: "RadioGroup",
            options: {
              name: "density",
              value: "normal",
              label: t("Densidad", "Density"),
            },
            slots: {
              items: [
                {
                  options: { value: "compact" },
                  slots: { label: t("Compacta", "Compact") },
                },
                { options: { value: "normal" }, slots: { label: "Normal" } },
                {
                  options: { value: "roomy" },
                  slots: { label: t("Amplia", "Roomy") },
                },
              ],
            },
          },
          hint(t("Se aplica a todo el sitio.", "Applies to the whole site.")),
        ],
        "sm",
      ),
    ),
    // A budget: the heading, how far along, and what it is out of.
    slot(
      6,
      "budget",
      stack(
        [
          between([title(t("Presupuesto", "Budget")), badge("US$")]),
          {
            contract: "slider",
            signature: "Slider",
            options: { value: 48, min: 0, max: 100 },
            attrs: { "aria-label": t("Presupuesto usado", "Budget used") },
          },
          hint(t("US$2.400 de US$5.000", "US$2,400 of US$5,000")),
        ],
        "sm",
      ),
    ),
    // Who is editing right now.
    slot(
      7,
      "editing",
      inline([
        {
          contract: "avatar",
          signature: "AvatarGroup",
          options: { label: t("Editando ahora", "Editing now") },
          slots: { overflow: "+6" },
          children: [avatar("Ana Pérez", "AP"), avatar("Luis Mora", "LM")],
        },
        hint(t("Ana y 7 más editan ahora", "Ana and 7 more are editing")),
      ]),
    ),
    // Recent files: a heading and two rows with their detail.
    slot(
      8,
      "files",
      stack(
        [
          text(t("Archivos recientes", "Recent files"), {
            weight: "emphasis",
            size: "sm",
          }),
          {
            contract: "list",
            signature: "List",
            children: [
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  title: t("informe-t3.pdf", "q3-report.pdf"),
                  description: t("Editado hoy", "Edited today"),
                },
              },
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  title: t("presupuesto.xlsx", "budget.xlsx"),
                  description: t("Editado ayer", "Edited yesterday"),
                },
              },
            ],
          },
        ],
        "xs",
      ),
    ),
    // A filter with a single choice and a switch that narrows it.
    slot(
      9,
      "assignee-filter",
      stack(
        [
          {
            contract: "form-field",
            signature: "FormField",
            slots: { label: t("Proyecto", "Project") },
            children: {
              contract: "select",
              signature: "Select.native",
              options: { value: "aurora" },
              slots: {
                items: [
                  { options: { value: "aurora" }, slots: { label: "Aurora" } },
                  { options: { value: "boreal" }, slots: { label: "Boreal" } },
                ],
              },
            },
          },
          {
            contract: "checkbox",
            signature: "Checkbox",
            children: t("Solo los míos", "Only mine"),
          },
        ],
        "sm",
      ),
    ),
    // A save state: that it worked, and when.
    slot(
      10,
      "saved",
      inline([
        badge(t("Guardado", "Saved"), "success"),
        hint(t("hace 1 min", "1 min ago")),
      ]),
    ),
    // A form footer: the three things you can do with a draft.
    slot(
      11,
      "actions",
      inline(
        [
          btn(t("Cancelar", "Cancel"), { variant: "ghost", size: "sm" }),
          btn(t("Guardar borrador", "Save draft"), {
            variant: "soft",
            size: "sm",
          }),
          btn(t("Publicar", "Publish"), { tone: "accent", size: "sm" }),
        ],
        "xs",
      ),
    ),
  ];

  const setF: BentoTile[] = [
    // A phone: a page behind and a Vaul resting on the bottom edge, already open. The page frames the box as a
    // device and the Vaul stays inside it, so this is the real sheet at the size it is made for.
    phoneSlot(0, "phone", {
      contract: "box",
      signature: "Box",
      options: { padding: "md" },
      children: stack(
        [
          between([
            text("9:41", { weight: "emphasis", size: "sm" }),
            {
              contract: "badge",
              signature: "BadgeDot",
              options: { tone: "success", label: t("En línea", "Online") },
            },
          ]),
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h3", flush: true },
            children: t("Proyectos", "Projects"),
          },
          {
            contract: "list",
            signature: "List",
            children: [
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  title: "Aurora",
                  description: t("3 solicitudes abiertas", "3 open requests"),
                },
              },
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  title: "Boreal",
                  description: t("1 solicitud abierta", "1 open request"),
                },
              },
              {
                contract: "list",
                signature: "ListItem",
                slots: {
                  title: "Cumbre",
                  description: t("Sin solicitudes", "No requests"),
                },
              },
            ],
          },
          {
            contract: "vaul",
            signature: "Vaul",
            options: {
              panelId: "phone-filters",
              edge: "block-end",
              open: true,
              label: t("Filtros", "Filters"),
            },
            children: {
              contract: "box",
              signature: "Box",
              options: { padding: "md" },
              children: stack(
                [
                  title(t("Filtros", "Filters")),
                  {
                    contract: "segmented",
                    signature: "Segmented",
                    options: { value: "open", label: t("Estado", "Status") },
                    slots: {
                      items: [
                        {
                          options: { value: "open" },
                          slots: { label: t("Abiertos", "Open") },
                        },
                        {
                          options: { value: "closed" },
                          slots: { label: t("Cerrados", "Closed") },
                        },
                        {
                          options: { value: "all" },
                          slots: { label: t("Todos", "All") },
                        },
                      ],
                    },
                  },
                  stack(
                    [
                      {
                        contract: "checkbox",
                        signature: "Checkbox",
                        options: { defaultChecked: true },
                        children: t("Solo los míos", "Only mine"),
                      },
                      {
                        contract: "checkbox",
                        signature: "Checkbox",
                        children: t("Con adjuntos", "With attachments"),
                      },
                    ],
                    "xs",
                  ),
                  between([
                    btn(t("Limpiar", "Clear"), { variant: "ghost" }),
                    btn(t("Ver 24 resultados", "Show 24 results"), {
                      tone: "accent",
                    }),
                  ]),
                ],
                "md",
              ),
            },
          },
        ],
        "md",
      ),
    }),
    // A deploy in flight: what it is, how far it is, and the two things to do about it.
    phoneSlot(
      1,
      "deploy",
      stack(
        [
          between([
            title(t("Despliegue a producción", "Deploy to production")),
            badge(t("En curso", "Running"), "accent"),
          ]),
          {
            contract: "progress",
            signature: "Progress",
            options: {
              value: 64,
              label: t("Avance del despliegue", "Deploy progress"),
            },
          },
          inline(
            [
              btn(t("Ver registro", "View log"), {
                variant: "soft",
                size: "sm",
              }),
              btn(t("Cancelar", "Cancel"), { variant: "ghost", size: "sm" }),
            ],
            "xs",
          ),
        ],
        "md",
      ),
    ),
    // One line: who did what, and where to read it.
    phoneSlot(
      2,
      "approved",
      between([
        inline([
          avatar("Luis Mora", "LM", "sm"),
          text(t("Luis aprobó la solicitud", "Luis approved the request")),
        ]),
        {
          contract: "typography",
          signature: "Link",
          options: { href: "#" },
          children: t("Ver", "View"),
        },
      ]),
    ),
    // A plan: its name and state, how much of it is used, and the facts that go with it.
    phoneSlot(
      3,
      "pro-plan",
      stack(
        [
          between([
            title(t("Plan Pro", "Pro plan")),
            badge(t("Activo", "Active"), "success"),
          ]),
          {
            contract: "meter",
            signature: "Meter",
            options: { value: 72, label: t("Almacenamiento", "Storage") },
          },
          {
            contract: "description-list",
            signature: "DescriptionList",
            children: [
              {
                contract: "description-list",
                signature: "DescriptionItem",
                slots: { term: t("Renueva", "Renews") },
                children: t("3 de abril", "April 3"),
              },
              {
                contract: "description-list",
                signature: "DescriptionItem",
                slots: { term: t("Cupos", "Seats") },
                children: "8 / 10",
              },
            ],
          },
        ],
        "sm",
      ),
    ),
    // The people on a project, and the way to add one.
    phoneSlot(
      4,
      "invite",
      stack(
        [
          {
            contract: "avatar",
            signature: "AvatarGroup",
            options: { label: t("Equipo", "Team") },
            slots: { overflow: "+3" },
            children: [
              avatar("Ana Pérez", "AP"),
              avatar("Luis Mora", "LM"),
              avatar("Carla Rey", "CR"),
            ],
          },
          hint(t("Ana y 5 más", "Ana and 5 more")),
          btn(t("Invitar", "Invite"), { variant: "soft", size: "sm" }),
        ],
        "sm",
      ),
    ),
    // A range switch and the range it names.
    phoneSlot(
      5,
      "range",
      between([
        {
          contract: "segmented",
          signature: "Segmented",
          options: { value: "week", label: t("Periodo", "Period"), size: "sm" },
          slots: {
            items: [
              { options: { value: "day" }, slots: { label: t("Día", "Day") } },
              {
                options: { value: "week" },
                slots: { label: t("Semana", "Week") },
              },
              {
                options: { value: "month" },
                slots: { label: t("Mes", "Month") },
              },
            ],
          },
        },
        hint(t("12–18 mar", "Mar 12–18")),
      ]),
    ),
    // A digest preference: how often, and whether it also goes by email.
    phoneSlot(
      6,
      "digest",
      stack(
        [
          title(t("Resumen semanal", "Weekly digest")),
          {
            contract: "radio-group",
            signature: "RadioGroup",
            options: {
              name: "digest",
              value: "weekly",
              label: t("Frecuencia", "Frequency"),
              orientation: "horizontal",
            },
            slots: {
              items: [
                {
                  options: { value: "daily" },
                  slots: { label: t("Diario", "Daily") },
                },
                {
                  options: { value: "weekly" },
                  slots: { label: t("Semanal", "Weekly") },
                },
                {
                  options: { value: "monthly" },
                  slots: { label: t("Mensual", "Monthly") },
                },
              ],
            },
          },
          {
            contract: "switch",
            signature: "Switch",
            options: { defaultChecked: true },
            children: t("Enviar también por correo", "Also send by email"),
          },
        ],
        "sm",
      ),
    ),
    // The shortcuts of a tool, one per row.
    phoneSlot(
      7,
      "shortcuts",
      stack(
        [
          title(t("Atajos", "Shortcuts")),
          stack(
            [
              ["K", t("Buscar", "Search")],
              ["N", t("Nuevo", "New")],
              ["S", t("Guardar", "Save")],
              ["Z", t("Deshacer", "Undo")],
              ["/", t("Ayuda", "Help")],
            ].map(([key, label]) =>
              inline([kbd("⌘"), kbd(key), hint(label)], "xs"),
            ),
            "xs",
          ),
        ],
        "sm",
      ),
    ),
    // A score, how many voted, and one line from a review.
    phoneSlot(
      8,
      "reviews",
      stack(
        [
          title(t("Valoraciones", "Ratings")),
          inline([
            {
              contract: "rating",
              signature: "RatingDisplay",
              options: {
                value: 4.6,
                label: t("Valorado con 4,6 de 5", "Rated 4.6 out of 5"),
              },
            },
            hint(t("4,6 · 312", "4.6 · 312")),
          ]),
          text(
            t(
              "“Muy claro y rápido de usar.”",
              "“Very clear and quick to use.”",
            ),
            { tone: "secondary" },
          ),
        ],
        "sm",
      ),
    ),
    // Work with no known length, and the way out of it.
    phoneSlot(
      9,
      "export",
      between([
        inline([
          {
            contract: "loader",
            signature: "Loader",
            options: { label: t("Preparando exportación", "Preparing export") },
          },
          hint(t("Preparando exportación…", "Preparing export…")),
        ]),
        btn(t("Cancelar", "Cancel"), { variant: "ghost", size: "sm" }),
      ]),
    ),
  ];

  // The phone set comes second, so it is one of the first things the band shows.
  return [setA, setF, setB, setC, setD, setE];
}
