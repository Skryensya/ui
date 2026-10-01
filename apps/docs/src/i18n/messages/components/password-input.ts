export const passwordInputMessages = {
  es: {
    "passwordInput.description": "Un campo de contraseña con un botón para mostrar lo que se escribió.",
    "passwordInput.key.toggle": "Muestra u oculta la contraseña, con el foco en el botón.",
    "passwordInput.a11yYours2": "No bloquees pegar: los gestores de contraseñas lo necesitan (WCAG 2.2, 3.3.8).",
    "passwordInput.a11yYours1": "Debe tener una etiqueta visible.",
    "passwordInput.a11yDoes3": "La pista queda asociada al campo con <code>aria-describedby</code>.",
    "passwordInput.a11yDoes2": "Su nombre dice lo que hará: «Mostrar contraseña» u «Ocultar contraseña».",
    "passwordInput.a11yDoes1": "El botón se alcanza con <kbd>Tab</kbd>; en la máquina de Zag no se podía.",
    "passwordInput.a11yIntro": "PasswordInput es un campo nativo con un botón que se alcanza con el teclado.",
    "passwordInput.content3": "En el error de inicio de sesión, no digas qué dato falló: «El correo o la contraseña no son correctos».",
    "passwordInput.content2": "Di la regla en positivo y concreta: «Al menos 12 caracteres».",
    "passwordInput.content1": "Nombra el campo «Contraseña», o «Contraseña nueva» al crearla.",
    "passwordInput.whenNot2": 'Para mostrar un secreto ya generado y copiarlo: usa <a href="/es/componentes/clipboard">Clipboard</a>.',
    "passwordInput.whenNot1": 'Para un código corto de un solo uso: usa <a href="/es/componentes/otp-input">OtpInput</a>.',
    "passwordInput.when1": "Para entrar a una cuenta, o para crear o cambiar una contraseña.",
    "passwordInput.contract3": "<code>ignorePasswordManagers</code> pide a los gestores que no autocompleten: úsalo solo para lo que no es la contraseña de una cuenta, como un PIN.",
    "passwordInput.contract2": "Al enviar o reiniciar el formulario, la contraseña vuelve a ocultarse.",
    "passwordInput.contract1": "El botón cambia su nombre según lo que hará: «Mostrar contraseña» u «Ocultar contraseña».",
    "passwordInput.anatomyBody":
      "La etiqueta, el pozo que contiene el campo y el botón, y una pista opcional debajo. El botón es un Button icon-only compuesto: la forma, el área táctil y el state layer vienen de él.",
    "passwordInput.anatomyLabel": "Partes de PasswordInput",
    "passwordInput.anatomyPreviewLabel": "Anatomía",

    "passwordInput.lede": "PasswordInput recibe una contraseña para entrar a una cuenta o para crear una. Un botón la muestra y la oculta, para revisar lo escrito antes de enviar. Al enviar el formulario, vuelve a ocultarse.",


    "passwordInput.signInTitle": "Entrar: la contraseña guardada",
    "passwordInput.signInBody": '<code>autoComplete="current-password"</code>, el valor por defecto: el gestor de contraseñas ofrece la guardada.',

    "passwordInput.signUpTitle": "Crear: la regla en la pista",
    "passwordInput.signUpBody": 'Con <code>autoComplete="new-password"</code>, el gestor ofrece generar una. La regla va en <code>hint</code>, antes de escribir.',

    "passwordInput.statesTitle": "Estados: inválido y deshabilitado",
    "passwordInput.statesBody": "<code>invalid</code> marca el campo y el motivo va en la pista.",



    "passwordInput.showLabel": "Mostrar contraseña",
    "passwordInput.hideLabel": "Ocultar contraseña",
    "passwordInput.emailLabel": "Correo",
    "passwordInput.signInLabel": "Contraseña",
    "passwordInput.signUpLabel": "Contraseña nueva",
    "passwordInput.signUpHint": "Al menos 12 caracteres.",
    "passwordInput.invalidHint": "La contraseña no es correcta.",
    "passwordInput.disabledLabel": "Contraseña (bloqueada)",
    "passwordInput.dd.repeatLabel": "Repite la contraseña",
    "passwordInput.guidelinesLede": "Mostrar la contraseña evita un intento fallido, sobre todo en el teléfono.",
    "passwordInput.dd.rule.title": "Regla: antes de escribir",
    "passwordInput.dd.rule.do": "Di en la pista qué tiene que cumplir una contraseña nueva.",
    "passwordInput.dd.rule.dont": "Si la regla aparece solo con el error, la persona escribe dos veces.",
    "passwordInput.dd.repeat.title": "Repetir: un campo basta",
    "passwordInput.dd.repeat.do": "Un solo campo: el botón de mostrar deja revisar lo escrito.",
    "passwordInput.dd.repeat.dont": "Un segundo campo para repetirla duplica el trabajo y no evita el error.",
  },
  en: {
    "passwordInput.description": "A password field with a button to show what was typed.",
    "passwordInput.key.toggle": "Shows or hides the password, with focus on the button.",
    "passwordInput.a11yYours2": "Do not block pasting: password managers need it (WCAG 2.2, 3.3.8).",
    "passwordInput.a11yYours1": "It must have a visible label.",
    "passwordInput.a11yDoes3": "The hint is tied to the field with <code>aria-describedby</code>.",
    "passwordInput.a11yDoes2": "Its name says what it will do: “Show password” or “Hide password”.",
    "passwordInput.a11yDoes1": "The button is reachable with <kbd>Tab</kbd>; in Zag's machine it was not.",
    "passwordInput.a11yIntro": "PasswordInput is a native field with a button reachable by keyboard.",
    "passwordInput.content3": "In a sign-in error, do not say which item failed: “The email or password is incorrect”.",
    "passwordInput.content2": "State the rule positively and concretely: “At least 12 characters”.",
    "passwordInput.content1": "Name the field “Password”, or “New password” when creating one.",
    "passwordInput.whenNot2": 'To show an already generated secret and copy it: use <a href="/components/clipboard">Clipboard</a>.',
    "passwordInput.whenNot1": 'For a short one-time code: use <a href="/components/otp-input">OtpInput</a>.',
    "passwordInput.when1": "To sign in, or to create or change a password.",
    "passwordInput.contract3": "<code>ignorePasswordManagers</code> asks managers not to autofill: use it only for what is not an account password, like a PIN.",
    "passwordInput.contract2": "On form submit or reset, the password hides again.",
    "passwordInput.contract1": "The button changes its name by what it will do: “Show password” or “Hide password”.",
    "passwordInput.anatomyBody":
      "The label, the well that holds the field and the button, and an optional hint below. The button is a composed icon-only Button: the shape, the hit target and the state layer come from it.",
    "passwordInput.anatomyLabel": "PasswordInput parts",
    "passwordInput.anatomyPreviewLabel": "Anatomy",

    "passwordInput.lede": "PasswordInput takes a password to sign in or to create one. A button shows and hides it, to check what was typed before submitting. On submit, it hides again.",


    "passwordInput.signInTitle": "Sign in: the saved password",
    "passwordInput.signInBody": '<code>autoComplete="current-password"</code>, the default: the password manager offers the saved one.',

    "passwordInput.signUpTitle": "Create: the rule in the hint",
    "passwordInput.signUpBody": 'With <code>autoComplete="new-password"</code>, the manager offers to generate one. The rule goes in <code>hint</code>, before typing.',

    "passwordInput.statesTitle": "States: invalid and disabled",
    "passwordInput.statesBody": "<code>invalid</code> marks the field and the reason goes in the hint.",



    "passwordInput.showLabel": "Show password",
    "passwordInput.hideLabel": "Hide password",
    "passwordInput.emailLabel": "Email",
    "passwordInput.signInLabel": "Password",
    "passwordInput.signUpLabel": "New password",
    "passwordInput.signUpHint": "At least 12 characters.",
    "passwordInput.invalidHint": "That password is not right.",
    "passwordInput.disabledLabel": "Password (locked)",
    "passwordInput.dd.repeatLabel": "Repeat password",
    "passwordInput.guidelinesLede": "Showing the password avoids a failed attempt, especially on a phone.",
    "passwordInput.dd.rule.title": "Rule: before typing",
    "passwordInput.dd.rule.do": "Say in the hint what a new password has to meet.",
    "passwordInput.dd.rule.dont": "If the rule appears only with the error, people type twice.",
    "passwordInput.dd.repeat.title": "Repeat: one field is enough",
    "passwordInput.dd.repeat.do": "A single field: the show button lets people check what they typed.",
    "passwordInput.dd.repeat.dont": "A second field to repeat it doubles the work and does not prevent the mistake.",
  },
} as const;
