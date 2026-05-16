# SDCoreJS SDLC Agent — Claude Code Instructions

This repository (`sdcorejs-agent`) is an **SDLC agent** for the SDCoreJS ecosystem:

- **Backoffice portals** in Angular with `@sd-angular/core` (Core UI)
- **Backend** in NestJS + Postgres
- **Public sites** in Next.js (SSR)

When you (Claude Code) start a session — whether in this repo or in a target project that uses any of these stacks — follow these instructions.

## Tracks and status

| Track | Path | Status |
| --- | --- | --- |
| Angular Portal | `skills/angular-portal/` | ✅ Complete (21 skills) |
| NestJS | `skills/nestjs/` | 🚧 Planned (be-masterdata baseline reviewed) |
| Next.js | `skills/nextjs/` | 🟡 In progress — `build-website/` pack Batch 1 (6 skills: onboarding / brainstorm / clarify / write-code / init-site / caching) |

Plus `skills/_shared/` — 17 cross-track utility skills covering the full SDLC: analysis & planning support (code-map), execution discipline (subagent-driven-dev, parallel-dispatch), review & fix loop (fix-loop), comment ASK gate (comment-code), verification gate (verify-before-done), session memory (auto-docs, memories, auto-task-tracker, recovery), release plumbing (commit, pr-create, changelog, dep-update), and bootstrap utilities (env-setup, debug, security-review).

Each track exposes its capabilities as **skills** — markdown files with Anthropic-style YAML frontmatter (`name`, `description`, `allowed-tools`).

## Claude Code native dispatch

This repo also exposes every skill via the native `.claude/skills/<name>/SKILL.md` convention so Claude Code can dispatch them automatically without having to read this instruction file first. The mirror is generated from `skills/<track>/*.md` — do NOT hand-edit `.claude/skills/`.

Sync is enforced automatically: `lefthook.yml` runs `bash .claude/sync-skills.sh` on every commit that touches `skills/`, then stages the regenerated mirror. To install hooks once:

```bash
npm install && npx lefthook install
```

If lefthook is missing, run `npm run sync:skills` manually before committing. See `.claude/README.md`.

The source of truth remains `skills/<track>/*.md`. `.claude/skills/` is generated.

## Skill dispatch protocol

1. **At session start**, glob `skills/*/*.md` and read each skill's YAML frontmatter only (cheap — body load happens later).
2. **When the user makes a request**, match it against each skill's `description` (the "Use when..." trigger). Pick the highest-confidence match.
3. **Read that skill's body** and follow its instructions exactly.
4. **If multiple skills tie**, pick the lowest-numbered one in the workflow (clarify before plan, plan before write-code, etc).
5. **If no skill matches**, ask a clarifying question or invoke `<track>-onboarding` (e.g. `angular-portal-onboarding`).

## Workflow per track

Every track shares the same workflow shape:

```
Request
  ↓
01-brainstorm             ← explore 2-3 approaches (skip if scope already clear)
  ↓
02-clarify-requirements   ← ask blocking questions (module, entity, fields, version)
  ↓
03-write-spec             ← author spec (goals, non-goals, architecture, acceptance)
  ↓
04-review-spec            ← user-approval gate before planning
  ↓
05-plan                   ← write step-by-step plan
  ↓
06-review-plan            ← user-approval gate before code
  ↓
07-write-code             ← orchestrator that picks sub-skills
   (10-init-portal | 11-init-module | 12-init-entity
    | 20-screen-list | 21-screen-detail | 22-screen-create | 23-screen-update
    | 30-reactive-form | 31-workflow-actions)
   └─ when feature has 3+ independent units, dispatches via
      _shared/subagent-driven-dev (after _shared/parallel-dispatch decision)
  ↓
40-e2e-test               ← write E2E tests for what was just built
  ↓
50-review-code            ← self-review against conventions (Critical/Important/Minor)
  ↓
_shared/fix-loop          ← apply review findings + iterate until Critical+Important resolved
  ↓
_shared/comment-code      ← MANDATORY ASK gate: skip / simple / medium / full
   └─ if level=full → 51-write-comments (Angular FULL implementation)
   └─ if simple|medium → applied inline by _shared/comment-code itself
   └─ if skip → no comments added
  ↓
_shared/verify-before-done ← MANDATORY acceptance-criteria gate before claiming "done"
  ↓
_shared/auto-docs         ← MANDATORY session summary to <target>/.sdcorejs/docs/<track>/
_shared/auto-task-tracker ← MANDATORY (immediately after auto-docs) — ticks done + appends new in <target>/.sdcorejs/tasks/<track>.md
_shared/memories          ← durable knowledge (when applicable) to <target>/.sdcorejs/memories/<track>/
```

## Mandatory rules (apply to every track)

1. **Auto-docs is mandatory.** At the end of every code-writing skill invocation, run the track-agnostic `auto-docs` skill at `skills/_shared/auto-docs.md`. This writes a session summary to the **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md` (note the leading dot in `.sdcorejs/`). Do NOT write the doc to this `sdcorejs-agent` repo.

2. **Memories.** Durable cross-session knowledge lives under the target project's `.sdcorejs/memories/<track>/`, managed by `skills/_shared/memories.md`. Read frontmatter at session start; write durable facts when the user says "ghi nhớ"/"remember this" or when a recurring correction is detected.

3. **Session-start ritual.** When opening a target project, glob the target's `.sdcorejs/docs/<track>/*.md`, read the latest 3 entries, and silently load that as context before answering. Also glob `.sdcorejs/memories/<track>/*.md` frontmatter for durable facts.

4. **Bilingual.** Vietnamese request → Vietnamese output (full diacritics for labels/messages). English → English. Permission codes and route paths stay English in both.

5. **Clarify-before-code.** Do NOT generate code if module ownership, entity name, or key fields are unspecified. Invoke `02-clarify-requirements` first (or `01-brainstorm` if scope is open-ended).

6. **Approval gates.** `04-review-spec` and `06-review-plan` REQUIRE explicit user approval before the next skill runs. Silence is not approval.

7. **Core UI first.** Use `@sd-angular/core` components when one fits. Otherwise generate skeleton + `alert('TODO: ...')` stubs and mark for the developer.

8. **Test after generation.** Run `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` (Angular) and report summary + failing spec names.

## Shared utility skills (`skills/_shared/`)

Cross-track skills that apply to angular-portal, nestjs, nextjs alike. Match against their `description` like any other skill.

| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-verify-before-done` | runs BEFORE auto-docs at end of feature — verifies each acceptance criterion from spec; blocks "done" until ✅ or user-acknowledged defer | ✅ |
| `sdcorejs-auto-docs` | end of every code-writing task — session summary | ✅ |
| `sdcorejs-auto-task-tracker` | runs IMMEDIATELY after auto-docs — ticks `[x]` done, appends new tasks to `.sdcorejs/tasks/<track>.md` | ✅ |
| `sdcorejs-memories` | "ghi nhớ", durable knowledge — write to target `.sdcorejs/memories/<track>/` | ✅ on trigger |
| `sdcorejs-fix-loop` | runs after `50-review-code` outputs findings — categorize / auto-apply / iterate until Critical+Important resolved | ✅ on findings |
| `sdcorejs-comment-code` | ASK gate at the comment phase — skip / simple / medium / full; outcome optional but ASK is mandatory | ✅ ASK |
| `sdcorejs-code-map` | new major feature, "dùng lại shared component" — read-only architecture scan BEFORE generation |  |
| `sdcorejs-parallel-dispatch` | about to fan out 3+ independent tasks — decision gate (should I split?) |  |
| `sdcorejs-subagent-driven-dev` | after parallel-dispatch says YES — execution discipline: decompose, brief, dispatch, merge |  |
| `sdcorejs-commit` | "commit", "tạo commit" — Conventional Commits + scope detection + git safety |  |
| `sdcorejs-pr-create` | "tạo PR", "open PR" — PR title/body from commits + diff via `gh` |  |
| `sdcorejs-debug` | "lỗi", "không hoạt động", "fix bug" — systematic debugging discipline |  |
| `sdcorejs-recovery` | "tiếp tục", "resume", "where were we" — handoff from docs + memories + git state |  |
| `sdcorejs-env-setup` | "thiết lập môi trường", "setup dev", project mới clone — per-stack bootstrap |  |
| `sdcorejs-changelog` | "viết changelog", release prep — Keep a Changelog entry from commits, semver bump |  |
| `sdcorejs-security-review` | "review bảo mật", before release — cross-track security checklist with file:line findings |  |
| `sdcorejs-dep-update` | "cập nhật dependency", `npm audit fix` — safe upgrade workflow (audit → branch → group → test) |  |

## Reference docs (load on demand only — do not preload)

- `skills/angular-portal/_refs/core-version.md` — pinned `@sd-angular/core` version
- `skills/angular-portal/_refs/sd-angular-core-catalog.md` — Core UI components inventory
- `skills/angular-portal/_refs/entity-field-types.md` — field type → form control mapping

## Anti-patterns

- ❌ Don't author new skills without explicit user approval. To propose a new skill, ask first.
- ❌ Don't skip clarify-before-code even if scope seems obvious — the user must confirm.
- ❌ Don't write `.sdcorejs/docs/` or `.sdcorejs/memories/` content in this `sdcorejs-agent` repo. Auto-docs and memories always target the user's working project.
- ❌ Don't load all skill bodies at session start. Just read frontmatter for dispatch; full body only when picking a skill.
- ❌ Don't bypass git hooks (`--no-verify`) or `.gitignore`d files when committing.
- ❌ Don't generate code that imports `@sd-angular/core` features not in the catalog (`_refs/sd-angular-core-catalog.md`) without first checking that file.

## See also

- `AGENTS.md` — same instructions for Codex / Cursor / generic AGENTS.md-aware tools
- `.github/copilot-instructions.md` — same instructions for GitHub Copilot
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot-specific chat mode for SDCoreJS work
