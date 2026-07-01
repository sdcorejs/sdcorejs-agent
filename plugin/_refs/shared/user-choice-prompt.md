# User Choice Prompt Protocol

Use this before any user-facing choice, approval gate, yes/no question, or mode
selection. It exists because options in Codex-like chats may not be clickable;
the user must be able to answer with a number.

## Rules

- Never rely on clickable UI options. Render choices as plain Markdown/text.
- Every option line starts with a stable numeric selector: `1.`, `2.`, `3.`,
  continuing upward when needed. Do not use letter selectors for user choices.
- Ask one decision at a time. Combined multi-setting answers are forbidden
  because they are noisy and easy to mistype.
- Mark the recommended/default option in the option label, not only in prose.
- End every prompt with an answer contract: "Reply with the number."
- Accept numeric selector, localized yes/no when the prompt is yes/no, or the
  full option text. Normalize the answer before continuing, but do not ask the
  user to type the full option.
- If the user says "you decide" or equivalent, choose the recommended/default
  option and state the choice before acting.
- If the answer is ambiguous, ask one short follow-up using the same selectors.
- For approval gates, use this shape:
  `1. Approve`, `2. Change`, `3. Cancel`.
- For yes/no gates, use this shape:
  `1. Yes`, `2. No`.
- For settings with multiple choices, ask each setting as a separate prompt and
  wait for the answer before asking the next setting.

## Template

```text
<Question or gate summary>

Options:
1. <label> - <impact/tradeoff>. [Recommended]
2. <label> - <impact/tradeoff>.
3. <label> - <impact/tradeoff>.

Reply with `1`, `2`, or `3`.
```

## Compact Approval Template

```text
Do you approve <artifact>?

1. Approve - snapshot it and continue. [Recommended if accurate]
2. Change - tell me what to adjust.
3. Cancel - stop here.

Reply with `1`, `2`, or `3`.
```
