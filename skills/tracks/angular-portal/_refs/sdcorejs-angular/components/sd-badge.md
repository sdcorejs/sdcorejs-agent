# `<sd-badge>`

**Type**: Component
**Selector**: `sd-badge`
**Import path**: `@sd-angular/core/components/badge` (or barrel: `@sd-angular/core/components`)
**Class**: `SdBadge`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`


## One-line purpose
Status / label indicator — shows a state (success / warning / error / info / …) as a colored dot, icon-with-text, or pill tag. Not a primary action; render-only by default but can opt into clicks.

## When to use
- Display row status in a list (Đang hoạt động, Chờ duyệt, Đã hủy)
- Indicate severity / priority next to a title
- Tag-style chips (light pill with icon + label) for categories
- Quick visual cue in toolbars and headers
- Counter-style number badge (use `type="round"` with a numeric `title`)

## When NOT to use
- For clickable actions → use `<sd-button>` (badge clicks are supported but not its primary purpose)
- For form inputs / chip-input → use `<sd-tag>` / form components
- For user identity → use `<sd-avatar>`
- For long descriptive text → badges are short by design

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | `'tag' \| 'round' \| 'icon'` | `'icon'` | Visual variant. `icon`=icon-with-text inline; `round`=solid pill with text only (good for status/counters); `tag`=light-tinted card with icon + title + optional description. Falsy values coerce back to `'icon'`. |
| `color` | `Color` (`'primary' \| 'secondary' \| 'success' \| 'info' \| 'warning' \| 'error' \| …`) | `'secondary'` | Color token. Falsy values coerce back to `'secondary'`. Overridden by the boolean shortcuts below. |
| `primary` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. Shortcut for `color="primary"`. |
| `secondary` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. Shortcut for `color="secondary"`. |
| `success` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. Shortcut for `color="success"`. |
| `info` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. Shortcut for `color="info"`. |
| `warning` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. Shortcut for `color="warning"`. |
| `error` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. Shortcut for `color="error"`. |
| `icon` | `string \| null \| undefined` | `undefined` | Material icon name. If unset, uses default `fiber_manual_record` (filled dot) for icon mode. |
| `fontSet` | `'material-icons' \| 'material-icons-outlined' \| 'material-icons-round' \| 'material-icons-sharp'` | `'material-icons'` | Material icon variant. Falsy values coerce back to default. |
| `title` | `string \| number \| null \| undefined` | `undefined` | Visible label or count. |
| `description` | `string \| null \| undefined` | `undefined` | Optional secondary line shown under `title` (only `tag` and `icon` types). |
| `tooltip` | `string \| null \| undefined` | `undefined` | Material tooltip text (position above; multiline supported). |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Icon size class. Falsy coerces back to `'sm'`. |

> Boolean color shortcuts take priority over `color` (precedence: primary → secondary → success → info → warning → error → `color` input).

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `click` | `EventEmitter<Event>` | Fired on click; the host calls `event.stopPropagation()` before emitting. The cursor switches to pointer ONLY when this output is observed (`click.observed`). |

## Content projection (slots)
None — content is driven by `title`, `description`, and `icon`.

## Visual cues
- **`type="icon"` (default)**: a horizontal row — icon on the left (colored per `color`), title (and optional description) on the right; no background/border. Compact, used inline in tables and lists.
- **`type="round"`**: a solid colored pill containing only the `title` text. Good for status chips ("Đang hoạt động") and numeric counters.
- **`type="tag"`**: a light-tinted rounded card with icon + title + optional description; the background is a soft tint of `color` and the text is `color`.
- Default icon (when none specified) is a small filled dot (`fiber_manual_record`).
- Cursor is `pointer` only when `(click)` is bound; otherwise non-interactive.

## Examples

### 1. Status pill in a list cell
```html
<sd-badge type="round" success title="Đang hoạt động"></sd-badge>
<sd-badge type="round" warning title="Chờ duyệt"></sd-badge>
<sd-badge type="round" error title="Đã hủy"></sd-badge>
```

### 2. Inline status with icon (default)
```html
<sd-badge
  success
  icon="check_circle"
  title="Đã duyệt"
  description="Bởi Nguyễn Văn A"
  tooltip="Phê duyệt lúc 14:30 09/05/2026">
</sd-badge>
```

### 3. Tag-style category chip
```html
<sd-badge
  type="tag"
  info
  icon="label"
  title="Hợp đồng dài hạn"
  size="sm">
</sd-badge>
```

### 4. Counter badge (numeric)
```html
<sd-badge type="round" primary [title]="unreadCount()"></sd-badge>
```

## Anti-patterns
- Using `<sd-badge>` as a primary action — it's a status indicator; for actions use `<sd-button>` or `<sd-quick-action>`
- Long sentences in `title` — keep it short (1-3 words); use `description` for secondary detail (and only with `icon`/`tag` types)
- Mixing multiple boolean color shortcuts (`<sd-badge primary error>`) — only one wins by precedence; pass `color` explicitly when dynamic
- Setting `type="round"` and expecting an icon to render — round mode is text-only
- Using a badge to convey error STATE that the user must act on — pair with a tooltip or follow-up `<sd-button>` so the user has a path forward

## Related
- `<sd-button type="link">` — for clickable text-style actions
- `<sd-tag>` — for tag/chip inputs in forms
- `<sd-avatar>` — for user identity (often paired beside a status badge)
- `<sd-quick-action>` — icon-only action with popover (when you need actual interaction)
