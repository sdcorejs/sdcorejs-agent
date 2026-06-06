---
name: sdcorejs-persona
description: Ask-once persona gate. On first entry to a target project, asks whether the user wants technical (developer) or plain (PO/QC) explanations, then stores the choice in `.sdcorejs/persona.md` so every later skill adapts wording + defaults without re-asking. Read at session start. Re-run to change persona. Loads the behavior contract from `_refs/shared/persona.md`. Triggers - first substantive interaction in a target project when `.sdcorejs/persona.md` is absent; user says "đổi cách giải thích", "tôi không rành kỹ thuật", "giải thích dễ hiểu", "set persona", "switch to non-tech", "explain simply". Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Write, Glob
---

# Persona — Ask Once, Store, Adapt

## Purpose
Two audiences share one pipeline: developers (precise, jargon-OK) and non-tech owners
(plain language, one-command runnable software). Guessing per message is unstable, so the
choice is made once, stored in the target project, and read by every later skill. The
behavior each persona implies lives in `_refs/shared/persona.md` (single source of truth).

## When invoked
- **Auto** at the first substantive request in a target project when `.sdcorejs/persona.md`
  does not exist yet (check before answering).
- **Explicit** when the user wants to change it: "đổi cách giải thích", "giải thích dễ hiểu hơn",
  "tôi không rành kỹ thuật", "set persona", "switch to (non-)technical", "explain simply".

Do NOT invoke:
- In this `sdcorejs-agent` authoring repo (no `.sdcorejs/` target). Persona applies to generated
  target projects only.
- Repeatedly — if `.sdcorejs/persona.md` exists, read it silently and proceed (no re-ask).

## Step 0 — Locate the target root and check for an existing flag
1. `git rev-parse --show-toplevel` → target project root. (If this is the agent repo, skip — persona N/A.)
2. Glob `<root>/.sdcorejs/persona.md`.
   - **Exists** → read its `persona:` value, load `_refs/shared/persona.md`, and proceed under that
     persona WITHOUT asking. Stop here.
   - **Absent** → continue to The ASK.

## The ASK (match the session language)

**Vietnamese:**
```
Trước khi bắt đầu — bạn muốn mình trình bày theo cách nào?

  (1) Kỹ thuật   — dùng thuật ngữ lập trình, chi tiết từng bước (hợp với dev)
  (2) Dễ hiểu    — tránh thuật ngữ, giải thích bằng lời thường, mình lo phần kỹ thuật (hợp với PO/QC)

Mình sẽ nhớ lựa chọn này cho dự án, lần sau không hỏi lại.
```

**English:**
```
Before we start — how should I explain things?

  (1) Technical — programming terms, step-by-step detail (for developers)
  (2) Plain     — no jargon, plain language, I handle the technical parts (for PO/QC)

I'll remember this for the project and won't ask again.
```

Wait for the choice. `(1)`/"kỹ thuật"/"technical"/"dev" → `tech`. `(2)`/"dễ hiểu"/"plain"/"non-tech" → `non-tech`.
If the user says "you decide", default to `tech` and say which default was used.

## Store the choice
Write `<root>/.sdcorejs/persona.md`:

```md
---
persona: non-tech   # tech | non-tech
set: 2026-06-06     # the date the user chose (today)
---

Persona for this project. Managed by `sdcorejs-persona`. Re-run the skill to change it.
See `_refs/shared/persona.md` for what each persona changes.
```

Use the real current date for `set:`. Create `.sdcorejs/` if missing.

## After storing
1. Load `_refs/shared/persona.md`.
2. Confirm in one line, in the chosen persona's voice:
   - tech: "Persona: technical. Proceeding."
   - non-tech: "Đã nhớ — mình sẽ giải thích dễ hiểu nhất có thể."
3. Hand back to whatever the user originally asked for, now under the active persona.

## Notes
- This skill only sets/reads the flag. The actual wording/behavior changes are defined in
  `_refs/shared/persona.md` and applied by every other skill — not duplicated here.
- Changing persona mid-project: just re-run; overwrite the file with the new value.
