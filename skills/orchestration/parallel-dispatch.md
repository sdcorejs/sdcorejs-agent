---
name: sdcorejs-parallel-dispatch
description: Decision gate that runs BEFORE `sdcorejs-subagent-driven-dev`. Use when the agent is about to execute work that could plausibly be split across parallel subagents — multiple independent entities, multi-file scans, batch screen generation, multi-stack audits. Decides WHETHER to parallelize via independence + blast-radius + reviewability + budget checks. Outputs a verdict: SEQUENTIAL or PARALLEL-CANDIDATE; when PARALLEL, hands off to `sdcorejs-subagent-driven-dev` which owns the briefing + dispatch + merge mechanics. Triggers - "chạy song song", "dispatch parallel", "split into subagents", "fan out", "làm song song", "in parallel", or automatic invocation by 07-write-code (and other orchestrators) when ≥3 independent units are detected. Applies to angular-portal, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read
---

# Parallel Dispatch — When to Split, How to Brief

## Purpose
Parallel subagents make multi-target work much faster. They also burn tokens, fan out errors, and produce reviewer fatigue when used wrong. This skill is the decision gate + briefing template.

## When invoked
- About to run 3+ similar tasks (generate screens for 5 entities, write specs for 4 modules, audit 3 stacks)
- A research question has multiple independent sub-questions
- A code-writing plan has steps that don't share state
- The user says "làm song song", "in parallel", "do these in parallel"

Do NOT invoke for:
- One task (no parallelism possible)
- Two tasks (overhead usually not worth it; just chain them)
- Sequential dependencies (write-spec → review-spec → plan — these have hard gates)

## Decision tree

```
About to do work? 
  ├─ One target → SEQUENTIAL (skip this skill)
  ├─ 2 targets → usually SEQUENTIAL (parallel overhead > savings)
  ├─ 3+ targets → continue ↓
  
Are the targets independent?
  ├─ Share state / file / DB row → SEQUENTIAL (race conditions, conflicting edits)
  ├─ Each reads independently, writes to different paths → PARALLEL CANDIDATE ↓
  
Is the blast radius bounded?
  ├─ Failure of one breaks the others → SEQUENTIAL (debug one at a time)
  ├─ Failure of one is isolated → PARALLEL CANDIDATE ↓
  
Is review tractable?
  ├─ User must approve each output before next → SEQUENTIAL (approval gate)
  ├─ User reviews the bundle at the end → PARALLEL ↓

Within budget?
  ├─ >5 subagents at once → SPLIT INTO BATCHES (rate limit + reviewer load)
  ├─ ≤5 → DISPATCH IN PARALLEL
```

## When parallel is correct

✅ **Good fits**
- "Generate list + detail + create + update screens for entity X" — 4 independent file groups, same template, no shared state
- "Audit security for the 3 stacks in this monorepo" — 3 read-only scans, distinct file trees
- "Write reference docs for each Core UI component (23 files)" — independent reads + writes
- "Run lint + test + typecheck before commit" — 3 read-only commands on disjoint outputs
- "Research how X is implemented across these 5 repos" — independent fetches

❌ **Bad fits**
- "Brainstorm → write spec → review → plan" — sequential gates
- "Refactor file A, then refactor file B that imports A" — write order matters
- "Fix bug, then fix the test that proves the fix" — sequential
- "Generate one entity, then base the next entity's fields on the first" — shared state
- "Review the PR" (single deliverable, even if you read many files)

## Briefing template

Every parallel subagent must receive a self-contained prompt. They don't see the parent's conversation; assume zero context.

```
TASK: <verb + target + scope, one sentence>

CONTEXT (what they need to know):
- Repo / stack / track
- Relevant file paths and what's in them (don't make them re-discover)
- Conventions to follow (link to the right skill or _refs doc)
- What's already done (so they don't redo it)

DELIVERABLE (return shape):
- Specific format: "Return a markdown table of <X>" / "Edit <file> and confirm"
- What NOT to do (out of scope)
- Length cap if appropriate ("under 200 words")

REPORT BACK:
- What they did (files changed, decisions made)
- What blocked them (so the parent can intervene)
- Any new info worth surfacing
```

### Briefing anti-patterns
- "Help with the angular project" — no scope
- "Follow our conventions" — they don't know what those are; cite the file
- "Use parallel subagents to do X" — recursion: don't tell a subagent to spawn more
- Same prompt to every subagent — they'll each waste time figuring out which slice is theirs
- Open-ended deliverable — they'll over-produce

## Coordination patterns

### Fan-out / fan-in
Parent dispatches N subagents → each returns a structured slice → parent merges and reviews. Use when slices are uniform (e.g. one component per subagent).

### Map-reduce
Subagents produce intermediate results → a single "reducer" subagent (or the parent) synthesizes. Use when slices are heterogeneous (e.g. one stack-specific audit per subagent → unified report).

### Speculative parallel
Two subagents try competing approaches; the parent picks the better result. Use rarely — usually a single brainstorm with 2-3 options is cheaper than running both.

### Pipeline (don't use parallel for this)
A → B → C. This is sequential by definition. Parallel pipelines need careful checkpointing and usually aren't worth it for skill-driven work.

## Budgeting

| Concurrent subagents | Use case | Caveat |
|---|---|---|
| 2 | Rare — usually just serialize | Almost never worth the overhead |
| 3–5 | **Sweet spot** for independent tasks | Standard |
| 6–8 | Large batch scans (per-file analysis on a folder) | Watch rate limits; consider splitting into 2 waves |
| 9+ | Almost never | Reviewer can't grok 9 outputs; split into batches with intermediate checkpoints |

If a batch hits the rate limit:
- Wait or split into 2 waves
- Don't retry the same prompts (you'll burn quota); diagnose what subset failed

## Reviewing parallel output

The parent agent receives N results. Before reporting to the user:
1. Verify each result actually addresses its slice
2. Check for redundancy / contradiction between slices
3. Surface failures explicitly (don't hide a failed subagent under successful ones)
4. Synthesize — don't just concatenate N reports

If subagent A succeeded but B failed, present the partial result and the failure honestly. Don't re-run B silently and pretend everything was fine.

## Rules

### MUST DO
- Verify independence + blast-radius bound BEFORE dispatching
- Self-contained briefing per subagent
- ≤5 concurrent unless you've split deliberately
- Synthesize results before reporting to user
- Surface partial failures explicitly

### MUST NOT
- Parallelize sequential work to "save time" — it costs more in coordination
- Send the same prompt to N subagents and expect them to coordinate among themselves
- Tell a subagent to spawn its own subagents (recursion)
- Hide a subagent failure under successful results
- Dispatch >5 without a checkpoint
- Use parallel when the user wants an interactive workflow (each step needs their input)

## Anti-patterns
- **Parallel theater**: dispatching 5 subagents to read 5 files when one parent could read all 5 in a Glob+Read sequence
- **Premature parallelism**: splitting "design + implement" — design must finish first
- **Lost context**: dispatch with "do X like we discussed" — they didn't, brief explicitly
- **Race-to-conflict**: two subagents both editing `package.json`
- **The 12-way fan-out**: user gets 12 reports nobody can review
- **Implicit ordering**: results return in arbitrary order; reviewer assumes order matters; bugs happen

## Example: angular-portal screen generation

User says "tạo CRUD cho entity Product với 4 màn (list, detail, create, update)".

This LOOKS like 4 parallel tasks. But examine:
- All 4 share the same `Product` DTO + service + module — there's shared state
- Detail/Create/Update share a component shell (`21-screen-detail` owns it, the others extend)
- List is independent

Correct dispatch:
- Generate DTO + service + module first (single agent, sequential)
- THEN parallel: list-screen + detail-shell-with-3-states (the shell handles detail/create/update via state)

Wrong dispatch:
- 4 parallel subagents each generating their own DTO copy → divergent fields, conflicting commits

## Example: reference docs

User says "write reference docs for all 23 Core UI components". 

This IS parallel-friendly:
- Each component → independent file at `_refs/angular-portal/sdcorejs-angular/components/sd-<name>.md`
- No shared state
- Same template, different content

Correct dispatch:
- Split 23 → 5 batches of 4-5 components each
- Each batch is one subagent that handles its 4-5 components sequentially internally
- Avoids the 23-way fan-out, fits the budget

## Cross-references
- `orchestration/subagent-driven-dev.md` — runs NEXT when the verdict is PARALLEL-CANDIDATE; owns the briefing template, dispatch mechanics, partial-failure handling, and merge/verification steps. This skill stops at the decision; subagent-driven-dev executes it.
- `orchestration/verify-before-done.md` — final acceptance gate after subagent-driven-dev's merge step.
- `07-write-code.md` (each track) — orchestrator that invokes this skill when its dispatch table has 3+ rows.
