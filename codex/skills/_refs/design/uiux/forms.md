# Forms and Detail Views

Source/status: SDCoreJS-authored heuristics; existing business/validation contracts
remain authoritative. Standards checks are owned by
[shared accessibility](../../shared/review-accessibility.md#ux-a11y-error---identify-and-recover-from-input-errors).

### UX-FORM-STRUCTURE - Group around the user's task

- Applies: create/edit/detail screens, drawers and structured forms.
- Excludes: read-only content without input; do not invent fields or validation.
- Do: group related fields with meaningful labels/legends; keep persistent
  labels separate from examples and helper text. Explain units, required state,
  and format before submission. Use counters only when a real limit matters,
  with the actual counting rule (characters, bytes or words) from the contract.
  Prefer a drawer for short contextual work when the parent context helps;
  prefer a page for deep, lengthy, linkable or multi-section work. Check existing
  routes, components and detail conventions before proposing a container change.
- Avoid: placeholder-only labels, arbitrary required fields, decorative steps,
  duplicate nested drawers, or full-page-to-drawer changes that break deep links.
- Verify: tab/read order, long labels/help, conditional fields, create/edit/detail
  parity, route/back behavior, and keyboard/zoom space in the selected container.

### UX-FORM-RECOVERY - Validate when users can act on feedback

- Applies: forms with client/server validation and recoverable submission errors.
- Excludes: unsupported validation logic; timing is a task heuristic, not one
  universal blur/change rule.
- Do: follow current validation timing; usually avoid presenting errors before
  first interaction. After submit, identify invalid fields, associate messages,
  and provide an error summary or focus strategy appropriate to the form.
  Revalidate corrected fields without excessive announcements. Preserve entered
  values and show field versus form/server errors distinctly. A pending async
  result must correspond to the current value.
- Avoid: clearing the form on failure, announcing every keystroke, success before
  server confirmation, or changing backend validation semantics in the UI.
- Verify: untouched/touched/submit/corrected states, delayed responses, server
  field errors, repeated submit, keyboard and screen-reader recovery.

### UX-FORM-CONSEQUENCE - Protect meaningful work and actions

- Applies: dirty forms, destructive or costly commands, permission-sensitive edits.
- Excludes: harmless navigation without unsaved work; confirmation is not needed
  for every click and does not replace server authorization.
- Do: document what counts as dirty, where navigation/close protection applies,
  and discard/save/cancel outcomes. Name the affected item/count and consequence
  in confirmations. Use undo only when the existing contract can reverse the
  operation. Keep pending state and recovery consistent with actual transactions.
- Avoid: redundant confirmation fatigue, a close icon silently discarding edits,
  fake undo, blind automatic retries of non-idempotent operations, or creating
  new authorization/business rules inside a design improvement.
- Verify: close, browser back, route/module switch and refresh as supported;
  cancel/discard/save with validation errors, interrupted requests and concurrent
  changes. Confirm the server result before success feedback.
