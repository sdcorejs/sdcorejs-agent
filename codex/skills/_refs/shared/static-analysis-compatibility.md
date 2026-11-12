# Static-Analysis Compatibility

Use this reference when generating or reviewing code for a project that may be
checked by a static analyzer or a lint quality gate. It is tool-neutral and
project-neutral: it describes pattern families, why analyzers report them, and
neutral remediations. Analyzer rule keys appear only as labelled examples.

## Purpose and principles

- Generated code follows the general good-practice defaults below in every
  project, whether or not an analyzer is configured.
- Analyzer-specific output is advisory. Emit it only when the target project
  shows analyzer evidence (see Evidence detection).
- The target project owns its analyzer configuration, quality profile, lint
  configuration and CI. This skill pack proposes; the project owner decides.
- Never adopt one organisation's analyzer profile as a universal rule, and
  never change a public component API only to silence an analyzer.
- A real defect stays a real defect. Analyzer guidance never downgrades an
  existing rule that already carries a stronger severity.

## Evidence detection

Treat the project as analyzer-aware when at least one of these exists:

- an analyzer project configuration file in the repository, for example a
  `sonar-project.properties` file;
- a lint configuration that enables an analyzer or accessibility plugin, for
  example `eslint-plugin-sonarjs` or the angular-eslint template accessibility
  preset;
- a CI step that runs an analyzer, a quality gate or a lint gate;
- an explicit user statement that a named analyzer gate applies.

Without evidence, apply the defaults silently and do not emit analyzer
proposals. Record the evidence path in any proposal you emit.

## Pattern families

| Family | Why analyzers report it | Neutral remediation | Example analyzer keys |
|---|---|---|---|
| Async lifecycle hook | The framework ignores the returned promise, so ordering is implicit and a rejection is unhandled | Keep the hook synchronous and call a private method that handles its own rejection | `typescript:S6544`, `@typescript-eslint/no-misused-promises` |
| Injected field not readonly | A dependency assigned once stays mutable without reason | Declare injected fields `readonly` | `typescript:S2933`, `@typescript-eslint/prefer-readonly` |
| Placeholder TODO or alert call | Unfinished behavior ships and is tracked as debt; alert dialogs block the page | Render the action disabled with a localized hint and list it in the generation summary | `typescript:S1135`, `sonarjs/todo-tag` |
| Generic test assertion | Equality on a derived value hides intent and gives weak failure messages | Use the most specific matcher, such as a size matcher for collections | `typescript:S5906` |
| Click handler on a non-interactive element | Keyboard and assistive-technology users cannot reach the action | Use a native `button`, or add `role="button"`, `tabindex="0"` and Enter/Space handling | `Web:MouseEventWithoutKeyboardEquivalentCheck`, `@angular-eslint/template/click-events-have-key-events` |
| Custom element host that wraps a native control | The analyzer sees a click binding on an unknown element and cannot see the inner native control | Keep the binding and propose analyzer configuration; see Custom element click hosts | `Web:MouseEventWithoutKeyboardEquivalentCheck` |
| Sanitization bypass | Disabling built-in sanitization can introduce cross-site scripting | Keep the existing review rule and require a documented trusted source | `typescript:S6268` |
| Cross-window message without target origin | A message can be delivered to or accepted from any origin | Pass an explicit target origin and verify the sender origin | `typescript:S2819` |
| Pseudo-random value in a security context | Predictable values can be guessed | Use the platform cryptographic random API | `typescript:S2245`, `sonarjs/pseudo-random` |
| Frame without title | Assistive technology cannot describe the frame | Add a localized `title` attribute | `Web:FrameWithoutTitleCheck` |

The example keys help a reader map a finding to a report. They are not a
required profile, and other analyzers may use different keys.

## Custom element click hosts

Some component libraries expose a host element, such as a Core UI button, that
renders a native interactive control inside its own template. The native
control already turns Enter and Space into a click, so the host is keyboard
accessible even though an analyzer only sees a click binding on an unknown
element.

- Confirm the wrapper first: inspect the installed component template or its
  documentation and check that it renders a native `button`, `a` or form
  control that receives focus.
- When it does, keep the host click binding unchanged. Do not add
  `(keydown.enter)`, `(keyup.space)` or similar handlers to the host: the
  native control already produces a click, so the action would fire twice.
- When it does not, treat the host like a non-interactive element and apply
  the real fix from the pattern table.
- Click handlers on plain `div`, `span`, icon or `svg` elements are real
  defects. Use a native `button`, or add `role="button"`, `tabindex="0"` and
  Enter/Space handling.
- Offer the project owner an analyzer-configuration proposal scoped as
  narrowly as the analyzer allows, and say that broad exclusions also hide the
  real defects above, so they should be paired with a lint check or review.

Example proposal for a SonarQube-style project configuration:

```properties
# Proposal only: apply after the project owner approves the scope.
sonar.issue.ignore.multicriteria=hostclick
sonar.issue.ignore.multicriteria.hostclick.ruleKey=Web:MouseEventWithoutKeyboardEquivalentCheck
sonar.issue.ignore.multicriteria.hostclick.resourceKey=<path glob of templates that use the wrapper>
```

For lint rules that report the same host, prefer the rule's documented
exception mechanism or a justified, element-scoped suppression over disabling
the rule globally.

## Proposal format

An analyzer proposal is an advisory finding:

- Severity `Low` and gate `RECOMMENDED`, unless an existing rule for the same
  defect already defines a stronger severity; that stronger severity wins.
- Family name from the pattern table, the file and line, and the analyzer
  evidence path that triggered the proposal.
- The neutral remediation, plus an optional configuration snippet labelled as
  a proposal.
- The owner decision that is required before anything outside the change
  scope is modified.

Never block a gate solely because an analyzer would report a pattern. Do not
edit analyzer project configuration, quality profiles, lint configuration, CI
or dependencies without explicit user approval.

## Non-goals

- No new review dimension, gate, skill or required dependency.
- No organisation-specific analyzer profile, host or project settings.
- No rewrite of third-party component APIs to satisfy an analyzer.
- No bulk suppression of real defects.

## Angular examples

Example lifecycle hook that stays synchronous:

```ts
export class ProductDetailComponent implements OnInit {
  readonly #api = inject(ProductApi);
  readonly #notify = inject(NotifyService);
  readonly id = input.required<string>();
  readonly product = signal<ProductDto | null>(null);

  ngOnInit(): void {
    this.#load().catch((error: unknown) => this.#notify.error(error));
  }

  async #load(): Promise<void> {
    this.product.set(await firstValueFrom(this.#api.detail(this.id())));
  }
}
```

Example placeholder for a custom UI action that is not implemented yet:

```html
<!-- CUSTOM_UI: <reason - what Core UI lacks> -->
<button type="button" disabled [title]="'<localized not-implemented hint>'">
  <localized label>
</button>
```

List the disabled action in the generation summary so the owner can track it.

Example specific matcher in a Jasmine spec:

```ts
expect(fixture.nativeElement.querySelectorAll('input')).toHaveSize(2);
```
