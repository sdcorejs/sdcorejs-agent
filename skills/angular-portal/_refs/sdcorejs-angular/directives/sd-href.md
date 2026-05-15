# `[sdHref]` Directive

**Type**: Attribute Directive
**Selector**: `a[sdHref]` (only matches an `<a>` element)
**Class**: `SdHrefDirective`
**Standalone**: yes
**Import path**: `@sd-angular/core/directives` (or direct: `@sd-angular/core/directives/sd-href`)
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Smart `<a>` href that uses Angular Router for internal links and `window.open(_, '_blank')` for external (`http(s)://`) links.

## When to use
- Anchor cells in tables / lists where the URL may be either internal route or external
- Render data-driven links from a mapping pipe (URLs computed from a permission/route resolver)
- Preserve right-click "open in new tab" semantics (the host stays a real `<a>` with `href`)

## When NOT to use
- Standard internal-only links — use `[routerLink]` directly.
- Buttons that perform actions — use `<sd-button>` (or `<sd-anchor>`).

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `sdHref` (alias `url`) | `string` | required | URL string. If empty/falsy, `href` falls back to `javascript:;` and clicks are no-ops. If starts with `http`, treated as external. Otherwise treated as internal route — split on `?` to derive route path and `queryParams`. |

## Outputs
None.

## Behavior
- Host-binds `attr.href` to the input (or `javascript:;` when missing) so the link is keyboardable / right-clickable.
- On click:
  - If `url` is empty → no-op (returns early).
  - If `url` starts with `http` → calls `window.open(url, '_blank')` and `event.preventDefault()`.
  - Otherwise → `event.preventDefault()`, splits `url` into `path?queryString`, parses `queryString` via `URLSearchParams` into a `queryParams` record, and calls `Router.navigate([path], { queryParams })`.

## Examples

### 1. Internal route with query params
```html
<a [sdHref]="'/orders/detail?id=42&tab=history'">Đơn hàng 42</a>
```

### 2. External link (opens new tab)
```html
<a [sdHref]="'https://docs.example.com/api'">API docs</a>
```

### 3. Data-driven link in a table cell
```html
<a [sdHref]="row | sdResolveOrderUrl">{{ row.code }}</a>
```

## Anti-patterns
- Placing `[sdHref]` on a non-anchor element — selector restricts to `a`, so it won't match.
- Combining with `[routerLink]` on the same anchor — both will compete for the click; pick one.
- Passing a relative path expected to merge with current route — directive uses absolute `Router.navigate([path])`, not relative navigation.
- Using for links that need `target="_blank"` configurability — directive hard-codes `_blank` only when scheme is `http`.

## Related
- `<sd-anchor>` — full-featured stylized anchor component.
- Angular `routerLink` — for plain internal navigation.
