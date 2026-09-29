export const otpInputMessages = {
  es: {
    "otpInput.description": "Un código de un solo uso, con un campo por dígito.",
    "otpInput.betaBadge": "Beta",
    "otpInput.anatomyBody":
      "La etiqueta, la fila de segmentos y una pista opcional debajo. Cada segmento es un <code>&lt;input&gt;</code> nativo; un campo oculto lleva el código completo al formulario.",
    "otpInput.anatomyLabel": "Partes de OtpInput",
    "otpInput.anatomyPreviewLabel": "Anatomía",

    "otpInput.lede":
      "Sobre <code>@zag-js/pin-input</code>, la misma máquina en las dos capas. Escribir avanza el foco solo, borrar lo regresa, y pegar el código completo lo reparte entre los segmentos. Cada segmento es un campo real, así que la selección, el IME y el autocompletado del teléfono siguen funcionando.",

    "otpInput.whenTitle": "Cuándo usarlo",
    "otpInput.whenItem1": "Para un código enviado por SMS, correo o una app de autenticación",
    "otpInput.whenItem2": "Cuando el largo del código se conoce de antemano: 4 o 6 dígitos",
    "otpInput.whenItem3":
      "No para texto libre de largo variable (eso es Input) ni para una contraseña (eso es PasswordInput)",

    "otpInput.smsTitle": "Código por SMS",
    "otpInput.smsBody":
      "Los valores por defecto: seis dígitos y <code>otp</code> activo, que marca <code>autocomplete=\"one-time-code\"</code>. Con eso iOS y Android ofrecen el código recién recibido como sugerencia del teclado, y el teléfono muestra el teclado numérico.",
    "otpInput.smsPreviewLabel": "OtpInput para un código por SMS",

    "otpInput.alphanumericTitle": "Con letras",
    "otpInput.alphanumericBody":
      "<code>type=\"alphanumeric\"</code> acepta letras y números. Apaga también <code>otp</code>: si no, el teléfono muestra el teclado numérico y no hay cómo escribir una letra.",
    "otpInput.alphanumericPreviewLabel": "OtpInput alfanumérico",

    "otpInput.pinTitle": "PIN",
    "otpInput.pinBody":
      "No hay un componente PinInput aparte: un PIN es un OtpInput con <code>mask</code>, que muestra puntos en vez de los dígitos, y <code>otp</code> apagado, porque un PIN es algo que la persona sabe y no algo que le llegó por SMS.",
    "otpInput.pinPreviewLabel": "OtpInput como PIN",

    "otpInput.statesTitle": "Estados",
    "otpInput.statesBody":
      "<code>invalid</code> pinta de peligro el borde de toda la fila y marca los segmentos <code>aria-invalid</code>; el motivo va en la pista. <code>disabled</code> apaga todos los segmentos.",
    "otpInput.statesPreviewLabel": "Estados de OtpInput",

    "otpInput.eventsTitle": "Verificar el código",
    "otpInput.eventsBody":
      "El componente no habla con el servidor. <code>sk:otpinputvaluecomplete</code> (<code>onValueComplete</code> en React) se dispara una vez, cuando se llena el último segmento: ahí se envía el código, y si el servidor lo rechaza se marca <code>invalid</code> con el motivo en la pista. <code>sk:otpinputvaluechange</code> avisa cada cambio, y <code>sk:otpinputinvalid</code> avisa el carácter que no correspondía a <code>type</code>, por ejemplo una letra en un código numérico.",

    "otpInput.a11yBody":
      "La etiqueta queda asociada al primer segmento. Cada segmento tiene su propio nombre accesible, <code>segmentLabel</code>, con <code>{index}</code> y <code>{count}</code> como marcadores. El texto por defecto de Zag está fijo en inglés (\"pin code 3 of 6\"); aquí se puede traducir, y en una página en español hay que hacerlo.",

    "otpInput.segmentLabel": "Dígito {index} de {count}",
    "otpInput.smsLabel": "Código de verificación",
    "otpInput.smsHint": "Te lo enviamos por SMS al número terminado en 42.",
    "otpInput.alphanumericLabel": "Código de vinculación",
    "otpInput.alphanumericHint": "Aparece en la pantalla del otro dispositivo.",
    "otpInput.pinLabel": "PIN",
    "otpInput.invalidHint": "El código no es correcto o ya expiró.",
    "otpInput.disabledLabel": "Código de verificación (bloqueado)",
  },
  en: {
    "otpInput.description": "A one-time code, one field per digit.",
    "otpInput.betaBadge": "Beta",
    "otpInput.anatomyBody":
      "The label, the row of segments, and an optional hint below. Each segment is a native <code>&lt;input&gt;</code>; a hidden field carries the whole code to the form.",
    "otpInput.anatomyLabel": "OtpInput parts",
    "otpInput.anatomyPreviewLabel": "Anatomy",

    "otpInput.lede":
      "On <code>@zag-js/pin-input</code>, the same machine in both bindings. Typing moves focus forward on its own, deleting moves it back, and pasting the whole code spreads it across the segments. Each segment is a real field, so selection, IME and the phone's autofill keep working.",

    "otpInput.whenTitle": "When to use it",
    "otpInput.whenItem1": "For a code sent by SMS, email or an authenticator app",
    "otpInput.whenItem2": "When the code's length is known in advance: 4 or 6 digits",
    "otpInput.whenItem3":
      "Not for free text of variable length (that is Input), and not for a password (that is PasswordInput)",

    "otpInput.smsTitle": "A code by SMS",
    "otpInput.smsBody":
      "The defaults: six digits and <code>otp</code> on, which sets <code>autocomplete=\"one-time-code\"</code>. With it, iOS and Android offer the code that just arrived as a keyboard suggestion, and the phone shows the numeric keypad.",
    "otpInput.smsPreviewLabel": "OtpInput for an SMS code",

    "otpInput.alphanumericTitle": "With letters",
    "otpInput.alphanumericBody":
      "<code>type=\"alphanumeric\"</code> accepts letters and digits. Turn <code>otp</code> off too: otherwise the phone shows the numeric keypad and there is no way to type a letter.",
    "otpInput.alphanumericPreviewLabel": "Alphanumeric OtpInput",

    "otpInput.pinTitle": "PIN",
    "otpInput.pinBody":
      "There is no separate PinInput: a PIN is an OtpInput with <code>mask</code>, which shows dots instead of the digits, and <code>otp</code> off, because a PIN is something the person knows, not something that arrived by SMS.",
    "otpInput.pinPreviewLabel": "OtpInput as a PIN",

    "otpInput.statesTitle": "States",
    "otpInput.statesBody":
      "<code>invalid</code> paints the whole row's border in danger and marks the segments <code>aria-invalid</code>; the reason goes in the hint. <code>disabled</code> turns every segment off.",
    "otpInput.statesPreviewLabel": "OtpInput states",

    "otpInput.eventsTitle": "Checking the code",
    "otpInput.eventsBody":
      "The component does not talk to the server. <code>sk:otpinputvaluecomplete</code> (<code>onValueComplete</code> in React) fires once, when the last segment fills: that is where the code is sent, and if the server rejects it the field is marked <code>invalid</code> with the reason in the hint. <code>sk:otpinputvaluechange</code> reports every change, and <code>sk:otpinputinvalid</code> reports the character that did not match <code>type</code>, such as a letter in a numeric code.",

    "otpInput.a11yBody":
      "The label is tied to the first segment. Each segment has its own accessible name, <code>segmentLabel</code>, with <code>{index}</code> and <code>{count}</code> as placeholders. Zag's default wording is fixed in English (\"pin code 3 of 6\"); here it can be translated, and on a page in another language it should be.",

    "otpInput.segmentLabel": "Digit {index} of {count}",
    "otpInput.smsLabel": "Verification code",
    "otpInput.smsHint": "We sent it by SMS to the number ending in 42.",
    "otpInput.alphanumericLabel": "Pairing code",
    "otpInput.alphanumericHint": "It is shown on the other device's screen.",
    "otpInput.pinLabel": "PIN",
    "otpInput.invalidHint": "That code is wrong or has expired.",
    "otpInput.disabledLabel": "Verification code (locked)",
  },
} as const;
