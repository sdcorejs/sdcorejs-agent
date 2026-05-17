# `[sdTooltip]` Directive

**Type**: Attribute Directive
**Selector**: `[sdTooltip]`
**Class**: `SdTooltipDirective` (uses internal `SdTooltipComponent` rendered via CDK Overlay)
**Standalone**: yes
**Import path**: `@sd-angular/core/directives` (or direct: `@sd-angular/core/directives/sd-tooltip`)
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
CDK-Overlay-based tooltip with template support, configurable position/color/delay, and "stays open while cursor is over the tooltip itself" behavior (single global active tooltip at a time).

## When to use
- Hover hints for icons, badges, table cells
- Rich tooltips that contain templates/markup (not just text)
- When the user needs to interact with tooltip content (hover the tooltip itself) — built-in mouse-tracking keeps it open

## When NOT to use
- For Material's standard text-only tooltip semantics — `matTooltip` may be lighter.
- For click-based popovers with multi-element content — use a popover/menu component.
- On click-driven UI affordances — this is hover-only.

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `sdTooltip` (alias `content`) | `string \| TemplateRef<any>` | **required** | Tooltip body. String renders inside a `<span>`; `TemplateRef` renders via `ngTemplateOutlet`. |
| `sdTooltipPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Preferred edge. CDK falls back to alternative positions if the preferred doesn't fit. |
| `sdTooltipDelay` | `number` (ms) | `100` | Delay after `mouseenter` before showing. |
| `sdTooltipColor` | `string` (CSS color) | `'#616161'` | Background color of the tooltip surface. |

## Outputs
None.

## Behavior
- `mouseenter` on host:
  - If a different `SdTooltipDirective` instance is currently active, force-hides it.
  - Sets self as the singleton `activeTooltip`.
  - After `sdTooltipDelay` ms, opens an overlay (creates one lazily) and attaches a `SdTooltipComponent` portal with the supplied `content` and `color`.
- `mouseleave` on host: schedules hide after 300 ms — but if the cursor enters the tooltip itself, the timer is cleared so the tooltip stays open. Leaving the tooltip schedules a 200 ms hide.
- Position strategy: `flexibleConnectedTo(host)` with prioritized fallbacks (preferred edge first, then opposites).
- Scroll strategy: `close` — tooltip closes when the page scrolls.
- `DestroyRef.onDestroy`: clears timeouts, disposes the overlay, releases the singleton slot if held.

## Examples

### 1. Simple text tooltip
```html
<sd-button
  type="link" prefixIcon="info"
  [sdTooltip]="'Mã định danh nội bộ'">
</sd-button>
```

### 2. Templated tooltip with rich content
```html
<ng-template #userTip>
  <div class="user-tip">
    <strong>{{ user.name }}</strong>
    <small>{{ user.email }}</small>
  </div>
</ng-template>

<span
  [sdTooltip]="userTip"
  sdTooltipPosition="right"
  sdTooltipColor="#1f2937">
  {{ user.name }}
</span>
```

### 3. Top tooltip with longer delay
```html
<i class="material-icons"
   [sdTooltip]="'Click để mở chi tiết'"
   sdTooltipPosition="top"
   [sdTooltipDelay]="300">
  help_outline
</i>
```

## Anti-patterns
- Passing huge templates — overlay has `max-width: 250px` and `word-wrap: break-word`; long-form content will look cramped.
- Using on transient elements that come/go — make sure `DestroyRef` cleanup runs (Angular handles this automatically when the host is removed).
- Stacking many tooltips on adjacent siblings expecting all to be visible — only ONE tooltip is shown globally; entering a new one force-hides the previous.
- Relying on tooltip for important info on touch devices — hover does not trigger reliably.

## Related
- `[sdHoverCopy]` — hover-driven copy-to-clipboard helper.
- Angular Material `matTooltip` — simpler text-only alternative.
