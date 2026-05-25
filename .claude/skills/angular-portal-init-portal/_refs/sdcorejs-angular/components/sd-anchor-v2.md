# `<sd-anchor-v2>`

**Type**: Component (composite — works with `<sd-anchor-item-v2>` children)
**Selector**: `sd-anchor-v2`
**Import path**: `@sd-angular/core/components/anchor-v2` (or barrel: `@sd-angular/core/components`)
**Class**: `SdAnchorV2`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Modernized scroll-spy navigation (signal-based, OnPush) — pairs a side TOC with the actual page sections so the active link auto-highlights as the user scrolls. Use this instead of `<sd-anchor>` for new code.

## When to use
- Long detail pages with multiple sections (employee profile, settings, complex forms)
- Multi-section forms where users need to jump between groups
- Content pages where a sticky TOC improves scannability
- New screens — prefer this over the v1 `<sd-anchor>`

## When NOT to use
- For app-level routing → use `routerLink` instead
- For tab-style content swapping (only one section visible at a time) → use `<sd-tab>`
- For breadcrumbs → use a dedicated breadcrumb component
- When you need horizontal layout — v2 currently optimizes vertical scroll-spy

## Inputs (`<sd-anchor-v2>`)
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction. Vertical is the primary mode. |
| `sidebarWidth` | `string` | `'200px'` | CSS width of the right-hand TOC. Content width is computed as `calc(100% - sidebarWidth - 16px)`. |
| `ellipsis` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. Truncates long titles in the TOC. |
| `isOverscroll` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. When false (default), adds `c-stop-scroll-propagation` class to prevent the body from scrolling when the inner panel hits its bounds. |
| `isHiddenAnchorList` | `boolean` | `false` | `transform: booleanAttribute` — bare attribute = true. Hides the TOC sidebar entirely (and disables scroll-spy registration); content takes full width. |

## Outputs (`<sd-anchor-v2>`)
None on the host. The TOC sub-component emits `sdClickSection` internally; clicks trigger smooth scroll to the target section.

## Inputs (`<sd-anchor-item-v2>`)
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | (required) | Visible label in the TOC and used to identify the section. |
| `icon` | `string \| undefined` | `undefined` | Optional Material icon name shown before the title in the TOC. |

> Each `<sd-anchor-item-v2>` auto-generates a UUID `id` for tracking. The component also strips the native `title` attribute on its host element so the browser tooltip doesn't conflict with the input.

## Content projection (slots)
- `<sd-anchor-v2>` projects sections via `<ng-content>` (no named slots).
- Each section MUST be wrapped in an `<sd-anchor-item-v2>`.

## Behavior notes
- Scroll listener uses `auditTime(50)` to throttle DOM reads.
- On click, the host smoothly scrolls to the target with `scrollTo({ behavior: 'smooth' })` and temporarily disables the scroll-spy listener until the scroll settles (via `auditTime(100) + debounceTime(200)`), avoiding flicker between active states during animation.
- Active section detection accounts for the wrapper's `padding-top` and `border-top-width`.

## Visual cues
- Two-column layout: scrollable content on the left, fixed-width TOC on the right.
- TOC items: row with optional leading icon and the title; active item gets accent color/highlight.
- Long titles wrap by default; with `ellipsis` they truncate with `…`.
- When `isHiddenAnchorList` is set, content occupies the full width and there is no sidebar.

## Examples

### 1. Default vertical anchor with TOC sidebar
```html
<sd-anchor-v2 sidebarWidth="220px">
  <sd-anchor-item-v2 title="Thông tin chung" icon="person">
    <!-- section content -->
  </sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Hợp đồng" icon="description">
    <!-- section content -->
  </sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Phân quyền" icon="lock">
    <!-- section content -->
  </sd-anchor-item-v2>
</sd-anchor-v2>
```

### 2. Ellipsis on long titles
```html
<sd-anchor-v2 ellipsis sidebarWidth="180px">
  <sd-anchor-item-v2 title="Báo cáo doanh thu theo từng chi nhánh quý 4">…</sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Phân tích chi phí vận hành">…</sd-anchor-item-v2>
</sd-anchor-v2>
```

### 3. Allow scroll bleed-through to outer page
```html
<sd-anchor-v2 [isOverscroll]="true">
  <sd-anchor-item-v2 title="Phần 1">…</sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Phần 2">…</sd-anchor-item-v2>
</sd-anchor-v2>
```

### 4. Hide TOC conditionally (e.g. for read-only / mobile)
```html
<sd-anchor-v2 [isHiddenAnchorList]="isMobile()">
  <sd-anchor-item-v2 title="Thông tin chung">…</sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Lịch sử">…</sd-anchor-item-v2>
</sd-anchor-v2>
```

## Anti-patterns
- Using `<sd-anchor-v2>` for routing between pages — it only scrolls within the current page
- Putting `<sd-anchor-item-v2>` outside an `<sd-anchor-v2>` host — the parent is required for scroll-spy to work
- Adding `title="…"` as a native HTML attribute (browser tooltip) on `<sd-anchor-item-v2>` — the component already binds via `input.required` and clears the native attribute
- Mixing v1 (`sd-anchor-item`) and v2 (`sd-anchor-item-v2`) items in the same host — they use different services
- Defaulting `isOverscroll` on long pages — the default `false` traps scroll inside the panel, which is usually what you want for a TOC

## Related
- `<sd-anchor>` — legacy v1 (still works; new code should prefer v2)
- `<sd-tab>` — when only one section should be visible at a time
- `<sd-page>` — page shell that often hosts an anchor in its main slot
- `<sd-button>` — for jump-to-section CTAs outside the anchor list
