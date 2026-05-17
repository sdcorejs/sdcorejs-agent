# `<sd-quick-action>`

**Type**: Component
**Selector**: `sd-quick-action`
**Import path**: `@sd-angular/core/components/quick-action` (or barrel: `@sd-angular/core/components`)
**Class**: `SdQuickAction`
**Standalone**: yes
**Change detection**: default
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Two-slot row that pairs a left-side message with a right-side action button (or button group). Used for "quick action" rows in cards / lists — a short label + a CTA — rather than as a popover menu trigger.

## When to use
- Inside a `<sd-section>` body to present a quick CTA row (e.g. "Bạn có 3 yêu cầu đang chờ duyệt" + "Xem ngay" button)
- Empty-state rows that pair a hint message with a primary action
- Settings rows: "Thông báo qua email" + toggle / "Cấu hình" button
- List header strips that show a count message and a bulk-action button on the right
- Wherever you want a consistent `message ←→ action` row with built-in spacing

## When NOT to use
- For full-width form rows with multiple form fields → use `<sd-section-item>`
- For icon-only buttons that open menus → just use `<sd-button>` with a popover; this component does not render a popover
- For navigation tabs → `<sd-tab-router>`
- For cards with rich content (image, multi-line, footer) → use `<sd-section>` with sub-items

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `isOpened` | `'' \| boolean \| undefined \| null` | `false` | Coerces to boolean. Adds `.active` class to the host row when true. Bare attribute (`<sd-quick-action isOpened>`) = true. Used to highlight the row (e.g. when its action target is currently expanded elsewhere). |

> **Coerce note**: `isOpened` is set through a setter (`set _isOpened`) that runs `!!value`, so empty string, `null`, `undefined` all become `false`.

## Outputs
None.

## Public API
| Method | Notes |
| --- | --- |
| `open()` | Sets `isOpened = true` (synchronous). |
| `close()` | Sets `isOpened = false` (synchronous). |

## Content projection (slots)
| Slot selector | Purpose |
| --- | --- |
| `[sdMessage]` | Left side — the descriptive text. Renders inside a `flex-1` `T14R` (14px regular) wrapper so it grows to fill available space. |
| `[sdAction]` | Right side — the action element(s). Typically one or two `<sd-button>`s, or a `<sd-toggle>`. Sits next to the message with a 16px gap (`gap-16`). |

## Visual cues (helps agent map screenshots → component)
- A horizontal flex row with class `c-quick-action`, vertical-center alignment, 16px gap
- Left: text content from `[sdMessage]` slot (T14R typography token, 14px regular weight)
- Right: action content from `[sdAction]` slot (inline, no flex grow → sits on the far right)
- When `isOpened` is true: the host gets the `.active` class (typically used by SCSS to apply a tinted background or border to indicate the action is currently in-progress / expanded)
- No icon, no popover, no caret — this is a layout shell, not a menu trigger

## Examples

### 1. Hint row inside a section
```html
<sd-section title="Yêu cầu của tôi">
  <sd-quick-action>
    <span sdMessage>Bạn có <b>3</b> yêu cầu đang chờ duyệt.</span>
    <sd-button sdAction
      type="link" color="primary" title="Xem ngay" suffixIcon="arrow_forward"
      (click)="goToPending()">
    </sd-button>
  </sd-quick-action>
</sd-section>
```

### 2. Setting row with a toggle
```html
<sd-quick-action>
  <span sdMessage>Nhận thông báo qua email khi có yêu cầu mới</span>
  <sd-toggle sdAction [(ngModel)]="settings.emailNotify"></sd-toggle>
</sd-quick-action>
```

### 3. Empty-state CTA
```html
<sd-quick-action>
  <span sdMessage class="text-secondary">Chưa có dữ liệu — hãy tạo bản ghi đầu tiên.</span>
  <sd-button sdAction
    type="fill" color="primary" prefixIcon="add" title="Tạo mới"
    (click)="onCreate()">
  </sd-button>
</sd-quick-action>
```

### 4. Highlighted row driven by parent state
```html
<sd-quick-action [isOpened]="editingPanel === 'security'">
  <span sdMessage>Bảo mật tài khoản</span>
  <sd-button sdAction
    type="outline" title="Cấu hình"
    (click)="open('security')">
  </sd-button>
</sd-quick-action>
```

## Anti-patterns
- ❌ Putting form inputs inside `[sdAction]` — they will sit on the right with no label alignment; use `<sd-section-item>` for label+input rows instead
- ❌ Treating this as a popover menu (it isn't — there's no overlay layer)
- ❌ Stacking many `<sd-quick-action>`s without a divider parent — visually they blur together; group them inside a `<sd-section>` with body padding
- ❌ Wrapping multiple buttons in `[sdAction]` without a flex container — they will stack inline with no spacing; use `<div sdAction class="d-flex gap-8">...</div>`
- ❌ Forgetting the `sdMessage` / `sdAction` directive attributes — content without those selectors falls into the default slot, but neither slot has a default rendering, so the content is dropped

## Related
- `<sd-section>` — common parent (often quick-actions live in section bodies)
- `<sd-section-item>` — label + content row (use for "label : value" data display)
- `<sd-button>` — typical content of `[sdAction]`
