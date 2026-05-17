# `*sdMobile` Directive

**Type**: Structural Directive
**Selector**: `[sdMobile]`
**Class**: `SdMobileDirective`
**Standalone**: no (declared module-style — no `standalone: true` flag)
**Import path**: `@sd-angular/core/directives` (or direct: `@sd-angular/core/directives/sd-mobile`)
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Structural directive that renders its template ONLY on mobile viewports.

## When to use
- Show a mobile-only menu trigger / hamburger / bottom-nav button
- Render a compact mobile variant (paired with `*sdDesktop`)
- Hide controls that desktop already renders inline

## When NOT to use
- For viewport-reactive UI — evaluated ONCE at construction; does not respond to resize. Use CDK `BreakpointObserver` or CSS media queries for reactive behavior.
- For minor responsive tweaks — prefer CSS.

## Inputs
None — visibility is decided by `SdUtilities.isMobile()` at construction time.

## Outputs
None.

## Behavior
- On construction, calls `SdUtilities.isMobile()`.
- If TRUE (mobile), creates an embedded view of the template.
- If FALSE (desktop), the template is never instantiated.
- No re-evaluation — sticky for lifetime of parent view.

## Examples

### 1. Mobile-only hamburger trigger
```html
<sd-button
  *sdMobile
  type="link"
  prefixIcon="menu"
  (click)="onOpenDrawer()">
</sd-button>
```

### 2. Mobile-specific empty-state copy
```html
<div class="empty" *sdMobile>
  <p>Vuốt sang phải để xem thêm tùy chọn.</p>
</div>
```

## Anti-patterns
- Expecting toggling on viewport resize — does not happen.
- Stacking with `*ngIf` directly — wrap in `<ng-container>` instead.
- Using for typography differences — prefer CSS media queries.

## Related
- `*sdDesktop` — the inverse: renders only on desktop.
- `SdUtilities.isMobile()` — the underlying detection helper.
