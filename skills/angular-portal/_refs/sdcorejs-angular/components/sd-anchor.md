# `<sd-anchor>`

**Type**: Component (composite — works with `<sd-anchor-item>` children)
**Selector**: `sd-anchor`
**Import path**: `@sd-angular/core/components/anchor` (or barrel: `@sd-angular/core/components`)
**Class**: `SdAnchor`
**Standalone**: yes (provides `AnchorService` per instance)
**Change detection**: default (zone-based)
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
A scroll-spy navigation panel — pairs a list of anchor links with the actual page sections so the active link auto-highlights as the user scrolls.

## When to use
- Long detail pages with multiple sections (e.g. employee profile: General info / Contracts / Documents / Permissions)
- Multi-section forms where users need to jump between groups
- Settings / preferences screens with collapsible groups
- A vertical sidebar TOC alongside long-form content
- A horizontal section bar above scrollable content (use `type="horizontal"`)

## When NOT to use
- For app-level routing → use `routerLink` with `<sd-anchor-v2>`/`<a>`/`<sd-button>` instead
- For tab-style content swapping (only one section visible at a time) → use `<sd-tab>` instead
- For breadcrumbs → use a dedicated breadcrumb component
- For new screens — prefer `<sd-anchor-v2>` (signal-based, OnPush, more reliable scroll handling)

## Inputs (`<sd-anchor>`)
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction. `vertical`=sidebar on the right; `horizontal`=section bar on top with internal scroll container. |
| `scrollContainer` | `'parent' \| HTMLElement \| null` | `null` | Element that owns the scroll. `'parent'`=use the host's parentElement. If unset and `type='vertical'`, defaults to `window`; if unset and `type='horizontal'`, defaults to the internal scroll container. |
| `width` | `string` | `'200px'` | CSS width of the anchor list (vertical mode only). |
| `ellipsis` | `'' \| boolean \| undefined \| null` | `false` | Setter input — bare attribute (`ellipsis`) and any truthy value enable ellipsis on long titles. |

## Outputs (`<sd-anchor>`)
| Name | Type | Notes |
| --- | --- | --- |
| `sdClickSectionItem` | `EventEmitter<SdAnchorItem>` | Fires when a user clicks an item in the anchor list (before scroll completes). |
| `sdSectionChange` | `EventEmitter<SdAnchorItem>` | Fires when the active section changes due to scroll (i.e. scroll-spy detected a new section). |

## Inputs (`<sd-anchor-item>`)
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | (required) | Visible label in the anchor list AND used as section heading. |
| `icon` | `string` | `undefined` | Optional Material icon name shown before the title in the list. |

> Each `<sd-anchor-item>` auto-generates a UUID `id` and registers itself with the parent `AnchorService` so scroll-spy can track it.

## Content projection (slots)
- `<sd-anchor>` projects the page sections directly via `<ng-content>` (no named slots).
- Each section MUST be wrapped in an `<sd-anchor-item>` so it can be registered.

## Visual cues
- **Vertical mode**: two-column layout — content on the left, fixed-width (default 200px) link list on the right. Each anchor link is a row with optional leading icon and the title; the active link gets an accent color and highlight.
- **Horizontal mode**: a thin horizontal bar of section links above an internally-scrolling content area. Active link is underlined / colored.
- Items with long titles either wrap or show ellipsis depending on `ellipsis`.

## Examples

### 1. Vertical scroll-spy on an employee profile
```html
<sd-anchor type="vertical" scrollContainer="parent" width="220px">
  <sd-anchor-item title="Thông tin chung" icon="person">
    <!-- general info form -->
  </sd-anchor-item>
  <sd-anchor-item title="Hợp đồng" icon="description">
    <!-- contracts table -->
  </sd-anchor-item>
  <sd-anchor-item title="Tài liệu" icon="folder">
    <!-- documents list -->
  </sd-anchor-item>
</sd-anchor>
```

### 2. Horizontal anchor bar with internal scroll
```html
<sd-anchor type="horizontal" (sdSectionChange)="onSectionChange($event)">
  <sd-anchor-item title="Tổng quan">…</sd-anchor-item>
  <sd-anchor-item title="Doanh thu">…</sd-anchor-item>
  <sd-anchor-item title="Chi phí">…</sd-anchor-item>
</sd-anchor>
```

### 3. Listening to clicks for analytics
```html
<sd-anchor
  type="vertical"
  ellipsis
  (sdClickSectionItem)="trackJump($event.title)">
  <sd-anchor-item title="Mục tiêu kinh doanh quý 4 năm 2025">…</sd-anchor-item>
  <sd-anchor-item title="Phân tích đối thủ cạnh tranh">…</sd-anchor-item>
</sd-anchor>
```

### 4. Custom scroll container (passing a ViewChild)
```html
<div #scrollHost class="custom-scroll">
  <sd-anchor [scrollContainer]="scrollHost" type="vertical">
    <sd-anchor-item title="A">…</sd-anchor-item>
    <sd-anchor-item title="B">…</sd-anchor-item>
  </sd-anchor>
</div>
```

## Anti-patterns
- Using `<sd-anchor>` for routing between pages — it only scrolls within the current page; use `routerLink` instead
- Putting `<sd-anchor-item>` outside an `<sd-anchor>` host — the item self-registers via DI and will throw without the parent
- Forgetting `scrollContainer` on a vertical anchor inside a custom scroll wrapper — defaults to `window`, which won't work if the parent is the actual scroller
- Mixing `<sd-anchor>` (v1) and `<sd-anchor-v2>` items inside the same host — the two versions use different services
- Using more than ~10 sections — the list becomes hard to navigate; consider splitting into tabs or sub-pages

## Related
- `<sd-anchor-v2>` — modernized signal-based version (preferred for new code)
- `<sd-tab>` — when only one section should be visible at a time
- `<sd-page>` — page shell that often hosts an anchor in its main slot
- `<sd-button>` — for jump-to-section CTAs outside the anchor list
