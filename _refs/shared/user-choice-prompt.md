# User Choice Protocol

Apply this reference only when execution reaches a real decision. A written
response in the main conversation is always the source of truth.

## Presentation Priority

Resolve the runtime capability as `supported`, `unsupported`, or `unknown`, then
use the first available presentation:

1. Native structured choice when the runtime actually exposes it.
2. A typed visual screen when the decision is spatial or visual.
3. The static visual composer when static HTML is supported but no event bridge
   exists.
4. Stable numbered Markdown in every environment.

`unknown` follows the portable fallback; never assume a native surface exists.
Every native or visual presentation must include or preserve the numbered
Markdown answer contract. The workflow must remain complete without clicks,
JavaScript, a browser, or a local server.

## Decision Discipline

- Ask only when two or more valid options have a material trade-off.
- If exactly one option remains valid, select it, state why briefly, and
  continue. Do not present a fake choice.
- Ask at most one approval or other high-impact decision per turn.
- Two to four independent factual blockers may be grouped when no earlier
  answer can change a later option set.
- Never group multiple approvals or dependent decisions.
- A visual selection supplies design feedback; it is not approval to implement.
- After a visual decline, do not offer the companion again unless a genuinely
  new visual or spatial decision appears.

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
