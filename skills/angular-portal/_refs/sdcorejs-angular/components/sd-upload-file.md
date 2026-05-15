# `<sd-upload-file>`

**Type**: Component (generic over `TArgs`)
**Selector**: `sd-upload-file`
**Import path**: `@sd-angular/core/components/upload-file` (or barrel: `@sd-angular/core/components`)
**Class**: `SdUploadFile<TArgs = any>`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
File picker + drag-drop + preview component — manages a list of "to-be-uploaded" and "already-uploaded" files (images, documents, generic), with built-in validation, preview thumbnails, reorder, image-resize, and a public `upload()` method to be called before form submit.

## When to use
- Image attachment fields (avatar, gallery, evidence photos) — `[type]="'image'"`
- Document attachments (PDF, Word, Excel, contracts) — `[type]="'document'"` or `'file'`
- Multi-file evidence with reorderable order
- Inside a form (template-driven via `[form]="ngForm"` or reactive via `[form]="formGroup"`) where you need `required` validation tied to the form
- When the parent needs to defer the actual server upload until form-submit time (call `await uploadFileRef.upload()` before the API call)

## When NOT to use
- For huge file uploads with chunking / resumable streams → wrap your own component using a different uploader (this component reads each file fully and previews via FileReader)
- For "select existing files from a CMS" — this is a fresh-upload component, not a media-library picker
- For instant single-file upload that immediately writes to a CDN with no preview — overkill; use a simple `<input type="file">`

## Configuration provider — REQUIRED unless `[upload]` is bound

The component uploads via either:
1. The `[upload]` input function bound directly, OR
2. An injected `SD_UPLOAD_FILE_CONFIGURATION` token (single config or array of configs keyed by `key`).

```ts
// app.config.ts
provide: SD_UPLOAD_FILE_CONFIGURATION,
useValue: {
  // key?: 'avatar', // optional — match with [key] input
  upload:   (files, args) => myService.upload(files, args).then(r => r.idOrKeys),
  details:  (idOrKeys, args) => myService.details(idOrKeys, args), // returns SdUploadFileDetail[]
  download: (idOrKey, args) => myService.download(idOrKey, args),
}
```

If multiple configs are provided as an array, **duplicate `key` values throw on init**. Use `[key]="'avatar'"` to select among them.

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `args` | `TArgs` (generic) | `undefined` | Opaque payload forwarded to `upload`/`details`/`download` handlers as second arg. Use it to pass domain context (entity id, type, …). |
| `label` | `string` | `undefined` | Field label rendered above the picker via `<sd-label>`. |
| `key` | `string \| undefined` | `undefined` | Selects which config from `SD_UPLOAD_FILE_CONFIGURATION` array to use. |
| `description` | `string` | `undefined` | Description shown under label (replaces auto-generated description). |
| `helperText` | `string \| undefined` | `undefined` | Helper text passed to `<sd-label>`. |
| `previewWidth` | `string` | `'50px'` | Width of each thumbnail / drop zone. |
| `previewHeight` | `string` | `'50px'` | Height of each thumbnail / drop zone. |
| `align` | `'left' \| 'center'` | `'left'` | Horizontal alignment of the thumbnail row. |
| `upload` | `SdUploadFileFuncUpload<TArgs>` | `undefined` | `(files, args) => Promise<string[]>` — returns idOrKeys after server upload. Overrides config. |
| `details` | `SdUploadFileFuncDetails<TArgs>` | `undefined` | `(idOrKeys, args) => Promise<SdUploadFileDetail[]>` — fetches metadata to render existing files. Overrides config. |
| `download` | `SdUploadFileFuncDownload<TArgs>` | `undefined` | `(idOrKey, args) => …` — used when user clicks a file in viewed mode. Overrides config. |
| `type` | `'image' \| 'document' \| 'file'` | `'file'` | Layout switch: `image`=square thumbnails, `document`=row with file-type icon, `file`=mixed. |
| `max` | `number` | `10` | Max number of files allowed in `model`. |
| `maxOfImage` | `number` | `3` | When disabled (viewed mode), only first N image thumbs render with a `+N` overlay on the last to open the popup gallery. |
| `extensions` | `string[]` | `[]` | Allowed file extensions, e.g. `['png','jpg','pdf']`. Empty = any. |
| `maxSize` | `number` | `undefined` | Max size in MB per file. |
| `maxWidth` | `number` | `undefined` | Max image width in pixels (image type only). |
| `maxHeight` | `number` | `undefined` | Max image height in pixels (image type only). |
| `imageValidator` | `(image: HTMLImageElement) => string` | `undefined` | Custom image-validator returning an error message or empty string. |
| `scaleToPixel` | `number` | `undefined` | If set, images are auto-resized client-side until `width*height ≤ scaleToPixel`. |
| `name` | `string` | random uuid | Form-control name when registered in the parent `FormGroup`. |
| `form` | `FormGroup \| NgForm` | `undefined` | Parent form. Accepts both reactive `FormGroup` and template-driven `NgForm` (auto-extracts `.form`). The component registers its internal control under `name`. |
| `required` | `boolean` (`''` truthy) | `false` | Required validator. Bare attribute = `true`. |
| `disabled` | `boolean` (`''` truthy) | `false` | Disables picker + reorder. Bare attribute = `true`. In disabled state shows file list as read-only with download/preview only. |

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `loaded` | `PreviewFile[]` | Emits the resolved preview list after `details(...)` finishes (declared but currently emitted internally as part of `filesChanged`). |
| `filesChanged` | `(string \| File)[]` | Emits whenever the file set changes (add, remove, reorder). Items are mixed: server keys (string), CDN URLs (string), or freshly-picked `File` objects. |
| `model` | `(string \| number)[]` | **Two-way bindable via `[(model)]`**. Holds idOrKeys / cdn URLs / hashed-keys-of-pending-uploads. Set this from your form to pre-populate. |

## Public API (call via template ref)
```ts
@ViewChild(SdUploadFile) uploadRef!: SdUploadFile;
```
- `uploadRef.upload()` → `Promise<void>` — **Must be called before submitting the form to the server.** Sends pending `File` objects to the configured `upload` handler, replaces hashed-keys in `model` with returned idOrKeys.
- `uploadRef.getFiles()` → `Promise<File[]>` — Returns raw `File` objects still pending (not yet uploaded).
- `uploadRef.preview()` → opens the popup gallery with all preview files.
- `uploadRef.onDownload(previewFile)` — triggers download via the configured handler.

## Content projection (slots)
- `<ng-template sdLabelDef>…</ng-template>` — custom label template (overrides default `<sd-label>` rendering). Resolved via `contentChild(SdLabelDefDirective)`.

## Visual cues (helps agent map screenshots → component)
- **Drop zone**: square box with **2px dashed grey border**, centered Material icon `file_upload` (cloud / arrow-up), `previewWidth` × `previewHeight` (default 50×50). On dragover, border becomes **2px solid grey** and opacity 0.9. Click opens native file picker.
- **Image type**: row of square thumbnails (drop zone first, then images). Hover reveals zoom-in icon + close (X) button. Drag handle to reorder.
- **Document type**: stacked rows below images. Each row = file-type icon (extension-colored: pdf/doc/xls/png/…) + filename as a link + size in KB + close icon.
- **Disabled / viewed mode**: drop zone hidden; for image type, only first `maxOfImage` thumbnails shown; if more, an overlay `+N` count appears on the last to open the gallery popup.
- **Required error**: red text `Vui lòng tải lên tệp/ảnh` below the row when touched and empty.
- **Auto description** (when `[description]` not set): renders `Định dạng: png, jpg và tối đa: 5MB` style based on `extensions` + `maxSize`.

## Permission gating
Not built-in. Wrap host with `*sdPermission` if upload itself is permission-gated, or hide via `*ngIf` based on user role.

## Examples

### 1. Avatar single-image upload (in a reactive form)
```html
<form [formGroup]="form">
  <sd-upload-file
    label="Ảnh đại diện"
    [form]="form"
    name="avatar"
    type="image"
    [max]="1"
    [extensions]="['png','jpg','jpeg']"
    [maxSize]="2"
    [scaleToPixel]="1024 * 1024"
    [(model)]="avatarKeys"
    [required]="true">
  </sd-upload-file>
</form>
```

### 2. Multiple document upload with custom upload handler
```html
<sd-upload-file #uploadRef
  label="Tệp đính kèm"
  type="document"
  [max]="10"
  [extensions]="['pdf','doc','docx','xls','xlsx']"
  [maxSize]="20"
  [upload]="onUploadFiles"
  [details]="onLoadDetails"
  [download]="onDownload"
  [(model)]="attachments">
</sd-upload-file>

<sd-button title="Lưu" type="fill" color="primary" (click)="onSubmit()"></sd-button>
```
```ts
onSubmit = async () => {
  await this.uploadRef.upload();          // CRITICAL: upload pending files first
  await this.api.save({ ...this.form.value, attachments: this.attachments });
};
```

### 3. Read-only display of already-uploaded files (e.g. on detail page)
```html
<sd-upload-file
  label="Hình ảnh hiện trường"
  type="image"
  [disabled]="true"
  [maxOfImage]="3"
  [model]="record.imageKeys">
</sd-upload-file>
```

### 4. Centered image gallery, larger thumbnails
```html
<sd-upload-file
  label="Bộ sưu tập"
  type="image"
  align="center"
  previewWidth="120px"
  previewHeight="120px"
  [max]="20"
  [(model)]="galleryKeys">
</sd-upload-file>
```

## Anti-patterns
- ❌ Calling backend save without `await uploadRef.upload()` first — pending `File` objects never get uploaded; the saved record will reference temporary hashed keys that don't exist on the server.
- ❌ Forgetting to provide `SD_UPLOAD_FILE_CONFIGURATION` AND not binding `[upload]` — the component will display an `SdNotifyService.error` at upload time but compile fine. Always set up at least one path.
- ❌ Using `[max]="1"` for an avatar but forgetting to use `type="image"` — drop zone will look generic and previews will be tiny.
- ❌ Using duplicate `key` values across multiple injected configs — throws an `Error` on component init.
- ❌ Passing a Reactive `FormGroup` AND a template-driven `NgForm` — pick one. The transform handles either, but mixing causes confusion.
- ❌ Setting `[required]="true"` without binding `[form]` — validation errors won't surface in your parent form.
- ❌ Mutating `model` array in place — set a new array (`this.attachments = [...newKeys]`) so the `effect` picks up the change.

## Related
- `<sd-input>`, `<sd-select>`, etc. — peer form-field components that share the `<sd-label>` styling
- `SD_UPLOAD_FILE_CONFIGURATION` injection token — central upload/details/download wiring
- `SdUploadFileDetail` — shape returned by `details()` (fields: `idOrKey`, `cdn`, `name`, `size`, `extension`)
- `<sd-modal>` — used internally by the preview popup
- `*sdPermission` — wrap to gate by permission
