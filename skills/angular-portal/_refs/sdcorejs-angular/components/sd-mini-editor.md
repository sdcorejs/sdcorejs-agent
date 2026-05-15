# `<sd-mini-editor>`

**Type**: Component
**Selector**: `sd-mini-editor`
**Import path**: `@sd-angular/core/components/mini-editor` (or barrel: `@sd-angular/core/components`)
**Class**: `SdMiniEditor`
**Standalone**: yes
**Change detection**: default (implements `ControlValueAccessor`)
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Compact rich-text input (CKEditor 5 ClassicEditor) for short-form content like comments, notes, and chat-style messages — supports bold/italic/underline/font color/lists/links and optional `@mention`, with HTML or Markdown output.

## When to use
- Comment input on a record (timeline, ticket, post)
- Reply box in a discussion thread
- Short notes / annotations on a row or detail panel
- Anywhere you'd otherwise use a `<textarea>` but want minimal formatting + mentions
- When you need Markdown output for storage

## When NOT to use
- For long documents with images, tables, headings → use `<sd-editor>`
- For full document/template authoring with variables, page breaks, page orientation → use `<sd-document-builder>`
- For plain unformatted text → use `<sd-input type="textarea">`
- For code → use `<sd-code-editor>`

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `option` | `SdMiniEditorOption` | — | **Required.** Drives placeholder, output format, mention, height, callbacks. See type below. |
| `value` | `string` | `''` | Two-way bindable via `[(ngModel)]` (CVA) or `[(value)]`. |
| `disabled` | `boolean` | `false` | Disables editing. Also responds to Angular forms' `setDisabledState`. |

### `SdMiniEditorOption`
```ts
interface SdMiniEditorOption {
  outputFormat?: 'html' | 'markdown';   // default 'html' — when 'markdown', loads CKEditor Markdown plugin
  placeholder?: string;
  height?: string;                      // CSS height
  maxHeight?: string;                   // CSS max-height — wired to host var --sd-mini-editor-max-height
  enableMention?: boolean;              // false → mention plugin not loaded
  mentionConfig?: SdMiniEditorMentionConfig;  // { feeds: MentionFeed[], valueRender? }
  onChange?: (content: string) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onMentionSelect?: (item: SdMiniEditorMentionItem) => void;
}
```

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `valueChange` | `string` | Companion to `[(value)]`. Throttled to 500ms (leading + trailing). |
| `contentChange` | `string` | Same payload as `valueChange`, kept for clarity / readability. |
| `blur` | `FocusEvent` | Editor lost focus. |
| `focus` | `FocusEvent` | Editor gained focus. |

## Public methods
- `setContent(content: string)` — set HTML/Markdown into the editor.
- `getContent(): string` — get current content (formatted per `outputFormat`).
- `getHtmlContent(): string` — always returns raw HTML, ignoring `outputFormat`.
- `focusEditor()` — programmatic focus.
- `insertMention({ id, name, marker? })` — programmatically insert a mention at the cursor.
- `getMentions()` — returns array of mentions currently in the content.

## Content projection
None — toolbar and editor are fully managed by CKEditor.

## Visual cues
- A compact rich-text box: a small toolbar at the top (Bold | Italic | Underline | Font color | Bulleted list | Numbered list | Link), then a single editing region below
- No headings, no images, no tables — much shorter than `<sd-editor>` toolbar
- Editor body grows to fit content but is capped by `option.maxHeight` (scroll appears beyond)
- When `enableMention` is on, typing the configured marker (e.g. `@`) opens a dropdown of suggestions
- Inserted mentions appear as inline pills with `class="ck-custom-mention"` and `data-id` / `data-marker` attributes
- Disabled state grays out the toolbar and the editor body

## Examples

### 1. Basic comment box
```html
<sd-mini-editor
  [option]="{ placeholder: 'Viết bình luận...', maxHeight: '160px' }"
  [(ngModel)]="comment">
</sd-mini-editor>
```

### 2. With Markdown output
```html
<sd-mini-editor
  [option]="{ outputFormat: 'markdown', placeholder: 'Ghi chú (Markdown)...' }"
  [(value)]="note"
  (contentChange)="onChange($event)">
</sd-mini-editor>
```

### 3. With @mention of teammates
```ts
option: SdMiniEditorOption = {
  placeholder: 'Trao đổi với đội nhóm...',
  enableMention: true,
  mentionConfig: {
    feeds: [
      {
        marker: '@',
        feed: (q) => this.userService.search(q),
        minimumCharacters: 1,
        itemRenderer: (item: any) => {
          const el = document.createElement('span');
          el.textContent = `${item.name} (${item.id})`;
          return el;
        },
      },
    ],
  },
  onMentionSelect: (m) => console.log('mentioned', m.id),
};
```
```html
<sd-mini-editor [option]="option" [(value)]="message"></sd-mini-editor>
```

### 4. Imperative content control via template ref
```html
<sd-mini-editor #editor [option]="option" [(value)]="text"></sd-mini-editor>

<sd-button title="Chèn @username" type="link"
  (click)="editor.insertMention({ id: '123', name: 'nghiatt15' })"></sd-button>
```

## Anti-patterns
- DON'T use `<sd-mini-editor>` for long-form documents — its toolbar is intentionally minimal; use `<sd-editor>` or `<sd-document-builder>`
- DON'T pass HTML into `value` when `outputFormat: 'markdown'` is set — the editor will misinterpret it
- DON'T forget `option` is required — leaving it `undefined` will throw on render
- DON'T render many `<sd-mini-editor>` instances on one screen — each loads CKEditor; prefer one shared comment box
- DON'T rely on `valueChange` / `contentChange` for keystroke-by-keystroke logic — they are throttled to 500ms

## Related
- `<sd-editor>` — full rich text with images, alignment, font sizes, validation
- `<sd-document-builder>` — document/template authoring with variables, page settings, comments
- `<sd-input type="textarea">` — plain unformatted text
- `<sd-code-editor>` — Monaco-based code editor
