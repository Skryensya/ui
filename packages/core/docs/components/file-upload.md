# file-upload

Category: forms. Stylesheet: `@skryensya/core/components/file-upload.css`. Signatures: `FileUpload`.

## FileUpload

**Use when**

- files have to be attached: a resume, a receipt, photos
- drag and drop should be accepted besides the button, without forcing anyone to drag
- dropping the file on a whole panel or the whole page is expected, not only on the dashed box; that is dropScope element or page, with overlayLabel so the target shows

**Avoid when**

- it is a single profile photo cropped right there; that needs its own flow
- the value is text, even if it comes from a file; that is an Input or a Textarea
- the control needs the form's own hint and error around it; that is FormField around it

Alternatives: `Input`, `FormField`.

- React: `import { FileUpload } from "@skryensya/react/file-upload"`.
- HTML: a `<div>` with `data-sk-file-upload`, enhanced by Vanilla's mount.

**Options**

| Option | Values | Default |
|---|---|---|
| `name` | string |  |
| `multiple` | boolean | `false` |
| `accept` | string |  |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `maxFiles` | number |  |
| `maxFileSize` | number |  |
| `minFileSize` | number |  |
| `maxTotalSize` | number |  |
| `dropScope` | "zone" \| "page" | `"zone"` |

**Slots**

| Slot | Accepts | Required |
|---|---|---|
| `label` | text | yes |
| `dropzoneLabel` | text | yes |
| `dropzoneIcon` | one of `Icon` |  |
| `hintLabel` | text |  |
| `overlayLabel` | text |  |
| `triggerLabel` | text | yes |
| `clearLabel` | text |  |

**Example** (canonical tree `file-upload/attach-documents`; its copy is placeholder, replace it)

```tsx
import { FileUpload } from "@skryensya/react/file-upload";

export function FileUploadExample() {
  return (
    <FileUpload
      name="adjuntos"
      multiple
      accept=".pdf,.docx"
      label="Documentos de respaldo"
      dropzoneLabel="Arrastra los archivos aquí"
      triggerLabel="Elegir archivos"
    />
  );
}
```

```html
<div class="sk-file-upload" data-sk-file-upload data-drop-scope="zone">
  <label class="sk-file-upload__label" data-sk-file-upload-label>
    Documentos de respaldo
  </label>
  <div class="sk-file-upload__dropzone" data-sk-file-upload-dropzone>
    <span class="sk-file-upload__icon" aria-hidden="true">
      <span data-sk-icon="upload" data-sk-icon-size="lg"></span>
    </span>
    <span class="sk-file-upload__instruction">
      Arrastra los archivos aquí
    </span>
  </div>
  <input
    class="sk-file-upload__input"
    data-sk-file-upload-input
    name="adjuntos"
    multiple
    accept=".pdf,.docx"
    type="file"
  >
  <button
    class="sk-file-upload__trigger sk-button sk-interactive"
    data-sk-file-upload-trigger
    type="button"
  >
    Elegir archivos
  </button>
</div>
```

Stylesheets: `@skryensya/core/components/button.css`, `@skryensya/core/components/file-upload.css`.

## Events

| DOM event (Vanilla) | React prop | `detail` |
|---|---|---|
| `sk:fileuploadchange` | `onFileChange` | { acceptedFiles: File[], rejectedFiles: FileRejection[] } |

## Styling hooks

Override on the root, never by restyling its classes: `--sk-file-upload-dropzone-accent`, `--sk-file-upload-dropzone-bg`, `--sk-file-upload-dropzone-border-color`, `--sk-file-upload-dropzone-padding`, `--sk-file-upload-dropzone-radius`, `--sk-file-upload-gap`, `--sk-file-upload-item-bg`, `--sk-file-upload-item-border-color`, `--sk-file-upload-item-gap`, `--sk-file-upload-item-padding`, `--sk-file-upload-item-preview-size`, `--sk-file-upload-item-radius`, `--sk-file-upload-dropzone-title-size`, `--sk-file-upload-icon-bg`, `--sk-file-upload-icon-color`, `--sk-file-upload-icon-size`, `--sk-file-upload-label-color`, `--sk-file-upload-overlay-bg`, `--sk-file-upload-overlay-border-color`, `--sk-file-upload-overlay-radius`.
