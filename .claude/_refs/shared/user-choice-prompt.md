# User Choice Protocol

Apply this reference only when execution reaches a real decision. A written
response in the main conversation is always the source of truth.

## Presentation Priority

Resolve current capabilities as `supported`, `unsupported` or `unknown`.
Before presenting an open choice, apply `_refs/sdlc/visual-offer-policy.md`.
Use `selectInteraction` for native-first decisions, and
`resolveVisualCompanionPlan` for supporting visual feedback in
`_refs/harness/runtime-policy.mjs`. Actual permitted structured choice is first
for user.choose/user.approve, including a choice informed by a visual preview.
The picker never replaces the requested preview. When no native choice is
available, a spatial preview may use the existing live/native/static visual
ladder with numbered conversation choices. Visual feedback never approves.

For choices and approvals, call `observeChoiceTools` with the current
host's tool inventory and mode/action restrictions, then use `resolveAction`
or `selectInteraction`. Static adapter mappings are candidates, never current
exposure. An exposed tool forbidden for approval or for the current mode is
unavailable for that action. Do not change flags/mode or install a surface.
Pass observations separately from portable context; re-observe at every host.

Unknown is not support; unknown browser auto-open does not disable visuals.
Preserve numbered Markdown on every surface. A native picker failure goes
directly to numbered fallback once, preserving options and identity; a preview
failure may continue down its own visual ladder. Conversation replies remain
valid without clicks, JavaScript, a browser or a local server. Read the detailed
companion lifecycle only when preparing a preview or its runtime consent.

## Decision Discipline

- Ask only when two or more valid options have a material trade-off.
- For non-approval decisions only, one valid option may be selected with a
  reason. Never auto-approve or grant Simplify Apply/write authority. Approval
  always retains Approve, Change and Cancel.
- Ask at most one approval or other high-impact decision per turn.
- Two to four independent factual blockers may be grouped when no earlier
  answer can change a later option set.
- Never group multiple approvals or dependent decisions.
- A visual selection supplies design feedback; it is not approval to implement.
- Preserve pending/accepted/declined `visual_companion` scope across skills and
  phases. Do not repeat an invitation in a declined visual thread or session;
  only an explicit user re-enable changes that scope.

## Normalization

- Give every option a stable numeric selector: `1.`, `2.`, `3.`.
- Mark the recommendation in the option label and explain the trade-off.
- Accept the number, the full option label, or a clear localized equivalent.
- A delegated recommendation may resolve a non-approval preference only. It
  never approves an artifact, Simplify Apply, or expanded write scope.
- Do not guess from an ambiguous response. Ask one short follow-up with the
  same selectors.
- Approval gates use `1. Approve`, `2. Change`, `3. Cancel`.
- Yes/no gates use `1. Yes`, `2. No`.

## Numbered Markdown Fallback

```text
<Question or gate summary>

Options:
1. <label> - <impact/trade-off>. [Recommended]
2. <label> - <impact/trade-off>.
3. <label> - <impact/trade-off>.

Reply with `1`, `2`, or `3` in the main conversation.
```

## Compact Approval Fallback

```text
Do you approve <artifact>?

1. Approve - persist the approved snapshot and continue. [Recommended if accurate]
2. Change - describe what must change.
3. Cancel - stop without advancing the workflow.

Reply with `1`, `2`, or `3` in the main conversation.
```

## Scoped resolution and compatibility

Use this canonical payload in existing producer contexts. The example labels
and aliases are localized by the producer; IDs, values and selectors retain
their meaning. `decisionFingerprint` binds gate, purpose, owner, change,
artifact/revision, authorization scope and semantic option mapping. A source
content fingerprint belongs to evidence, not to a reusable policy decision.

```yaml
interaction_context:
  schema_version: 1
  decision:
    schema_version: 1
    id: spec-example-r1
    gate: sdcorejs-spec:approval
    purpose: artifact-approval
    change_ref: example-change
    owner_repository_id: github.com/example/app
    artifact_id: spec-example
    revision: r1
    scope_fingerprint: sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    approval: true
    options:
      - { id: approve, selector: 1, value: approve, label: Approve, aliases: [approve] }
      - { id: change, selector: 2, value: change, label: Request changes, aliases: [change] }
      - { id: cancel, selector: 3, value: cancel, label: Cancel, aliases: [cancel] }
  reply_ref: null
  resolutions: []
  failed_surfaces: []
```

Call `resolveDecision(context, host)` before presenting. The host's
`read_response(ref)` reads a real user event containing `id`, `text`,
`decision_fingerprint`, and `question_id` when the native host provides one.
An unbound written reply needs exactly one identified pending decision.
Multiple pending gates leave a bare number ambiguous. The host binds the
fingerprint when presenting the question, never retrospectively to new scope.
Only exact numbers, labels or presented localized aliases select an option;
negation, incidental numbers, silence, thanks and visual feedback do not.

Reuse an existing resolution only after re-reading that host event or the
actual approved plan through `load_plan() -> {artifact, parents}` with the
current repository revision. A plan may carry an `interaction-policy` JSON
fence containing `{decision_fingerprint, option_id}` entries. The graph,
owner, change, revision and exact decision are verified before reuse. Plan
preferences never auto-approve spec/plan or auto-select Simplify Apply.
Spec approval cannot satisfy the distinct plan gate. Missing source/verifier
is unresolved, never an implicit approval. A producer consumes the resolved
event once for its exact artifact; inspect an existing matching snapshot
before creating another on a repeated reply.

Native failure adds `native-structured-choice` to this decision's
`failed_surfaces`; fall back once with the same ID, revision and options.
Do not retry the picker. Native preselection without submission has no effect.
Reusing resolved policy asks no confirmation; ask only unresolved scope deltas.
Preserve this conditional context in portable `state_delta`, then reverify at
the consumer. Do not create a global decision journal or session file.
Legacy strings remain valid presentation input to normalization but are not
scoped approval records. Unknown schemas and malformed identities fail closed.
