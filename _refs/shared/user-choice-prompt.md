# User Choice Protocol

Apply this reference only when execution reaches a real decision. A written
response in the main conversation is always the source of truth.

## Presentation Priority

Resolve current capabilities as `supported`, `unsupported` or `unknown`.
Before presenting an open choice, apply `_refs/sdlc/visual-offer-policy.md`.
Use separate ladders, shared by `selectInteraction` and
`resolveVisualCompanionPlan` in `_refs/harness/runtime-policy.mjs`:

1. Visual decisions: live companion with supported runtime and scoped local
   consent, then native visual, then static HTML, then numbered Markdown.
2. Text decisions and every approval: native structured choice, then numbered
   Markdown. The invitation may use a text picker, but the picker must not
   replace a requested preview.

Unknown is not support; unknown browser auto-open does not disable visuals.
Preserve numbered Markdown on every surface. If a surface fails, continue down
its ladder with the same options and identity. Conversation replies remain
valid without clicks, JavaScript, a browser or a local server. Read the detailed
companion lifecycle only when preparing a preview or its runtime consent.

## Decision Discipline

- Ask only when two or more valid options have a material trade-off.
- If exactly one option remains valid, select it, state why briefly, and
  continue. Do not present a fake choice.
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
- When the user delegates the decision, select the stated recommendation and
  record the selection before acting.
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
