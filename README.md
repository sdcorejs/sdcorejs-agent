# SDCoreJS

[![CI](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/ci.yml)
[![Full E2E](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/full-e2e.yml/badge.svg)](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/full-e2e.yml)

An engineering-focused SDLC skill pack for developers and technical teams
using AI coding agents. Works in Claude Code, GitHub Copilot, Codex, and
Cursor.

Requests flow through:

```text
brainstorming -> spec -> plan -> execute-plan -> track executor -> finish gates -> ship -> git
```

The pack is documentation-driven: markdown skills plus `_refs/` knowledge. There is no runtime server.

## Tracks

| Track | Executor |
|---|---|
| Angular Portal | `sdcorejs-angular` |
| NestJS | `sdcorejs-nestjs` |
| Next.js | `sdcorejs-nextjs` |
| AI-agent | `sdcorejs-ai-agent` |
| Product | `sdcorejs-product` |
| Design | `sdcorejs-design` |
| Test | `sdcorejs-test` |
| Generic harness | `sdcorejs-execute-plan` fallback |

## Workflow

```text
Request
  -> sdcorejs-brainstorming
       Explore if needed, then confirm blockers.
  -> sdcorejs-spec
       Write spec, ask for approval, and persist approved spec.
  -> sdcorejs-plan
       Write numbered plan, ask for approval, and persist approved plan.
  -> sdcorejs-execute-plan
       Detect track; ask execution mode only when both modes are feasible.
  -> executor
       ai-agent | angular | nestjs | nextjs | product | design | test | generic harness
  -> finish gate and tail chain
       sdcorejs-test -> optional sdcorejs-simplify -> affected focused tests
       -> sdcorejs-review / repair-loop
       write-producing docs/task/memory artifacts first
       -> sdcorejs-ship (verify-before-done mode)
       -> sdcorejs-ship (branch-ready mode as the final read-only gate)
```

The two approval gates and approved snapshot writes live inside `sdcorejs-spec`
and `sdcorejs-plan`. `sdcorejs-execute-plan` owns track detection,
AI-agent/product/design/test routing, generic fallback, and execution-mode
resolution. It auto-selects sequential for one unit or when safe parallel
execution is unavailable.
No write-producing step may run after final branch-ready unless branch-ready is
run again before Git artifacts.

Pure Q&A answers directly. Small, explicit, low-risk fixes use targeted context,
the smallest edit, focused verification, and concise review; they escalate to
the full workflow if scope, risk, ownership, or behavior grows.

Canonical skills declare provider-neutral `required-actions`.
`_refs/harness/capability-contract.json` maps those actions and tri-state
capabilities for Codex, Claude Code, Cursor, and Copilot. Unsupported or unknown
capabilities retain numbered Markdown, static visual, and sequential parent
fallbacks.

## Communication Economy Policy

The Communication Economy Policy minimizes total communication cost: bootstrap
and just-in-time context, repeated handoff content, and user-visible output. It
does not optimize output length in isolation or turn responses into fragments.
Compact output remains localized, grammatical, and written in complete
professional sentences.

Runtime communication has three distinct layers:

- Authoritative runtime context retains the typed fields required by the next
  consumer for routing, approval, security, verification, and artifact closure.
- User projection reports only the outcome, material evidence, risk, blocker,
  and next decision that the user needs.
- Portable handoff carries required IDs, paths, hashes, state deltas, evidence
  references, and the exact next consumer when a structured runtime context
  channel is unsupported or unknown. Its shape-aware matrix also preserves
  independent test lifecycle/evidence and parallel ownership/fan-in state, and
  rejects missing approval identity or embedded spec/plan/diff/log bodies.

The default profile is `compact`; normal technical explanation and review
findings use `standard`; approval, security, destructive action, ambiguity,
order-sensitive work, public-contract decisions, failed verification, and
unresolved blockers automatically use `detailed`. A user may request `compact`,
`standard`, `detailed`, or `full context`, but a shorter request cannot obscure
an approval scope or safety consequence. Code, commands, paths, identifiers,
hashes, errors, numbers, and verification results remain exact.

Detailed policy is loaded just in time from
`_refs/harness/communication-economy.md`. This is a communication contract, not
a workflow gate, runtime server, or new `sdcorejs-caveman` skill.

## Documentation Layout v2

Project documentation below `.sdcorejs/documentation/` uses one directory per
document:

```text
user-guides/<module>/<module>.md
user-guides/<module>/images/<screen>.png
requirements/<TASKID>/<TASKID>.md
technical-docs/<doc-key>/<doc-key>.md
```

Unit-local links stay concise, for example `images/list.png`. `_shared` is used
only when at least two exact documentation units are proven owners. New writes
always use v2; canonical-first discovery can read transitional flat entries,
but migration requires an authorized, collision-free, idempotent preflight.
Canonical/legacy conflicts block migration, aggregate build, and export.

The aggregate remains `.sdcorejs/documentation/sdcorejs-user-guide.md`. Its
builder discovers exact entry shapes, rewrites unit-local links relative to the
documentation root, and validates emitted links. DOCX and PDF are separate
approved capabilities; neither is reported as passing without a non-empty
parseable output and embedded-image verification. The full contract and pure
deterministic helper are loaded just in time from
`_refs/shared/documentation-layout.md` and
`_refs/shared/documentation-layout.mjs`, so unrelated Q&A bootstrap does not
grow.

The AI-agent track is an approved-plan-only authoring surface, not a bundled
agent runtime. It selects one lifecycle engine (`openai-responses` or
`openai-agents-sdk`) independently from one of twelve business capability
profiles. Its contracts default provider storage off, prohibit generic raw
tools, require trusted server identity and tenant scope, bind approvals to exact
inputs/versions, separate application state, require evidence and redacted
tracing/audit/usage data, and run offline deterministic evals. Live engine/model
verification is always reported separately.

`sdcorejs-simplify` is a daily workflow utility, not an implementation track.
It analyzes or applies bounded refinements to recently changed executable
source or an explicit source scope while preserving observable behavior.
Apply mode requires a green focused baseline and reruns the same verification;
analyze mode is read-only. Prompts, docs, configuration, strings, tests,
fixtures, snapshots, public contracts, dependencies, and framework/AI-agent
contracts are protected. The finish gate presents simplification as a visible
opt-in step; it never auto-runs, and current tests are evidence rather than a
general semantic-equivalence proof.

## Quick Start

This repository is public source, while the root repository tooling manifest
describes a private root Node workspace with `private: true`. The root project
is not distributed through npm. Use GitHub/plugin installation, submodules, or
generated native skill mirrors as the distribution paths.

The root `name` and `version` are synchronized repository/plugin release
metadata, not an npm package identity. The canonical package manager for
repository validation remains npm. Use the committed `package-lock.json` with:

```bash
npm ci
npm run check:text-hygiene
npm run check:skills
npm run test:e2e
```

## 5-Minute Adoption

Pick one install path, start a fresh agent session, then use the smoke prompt to
confirm dispatch behavior before adopting the pack for real work.

| Tool path | Install or attach | Smoke prompt | Expected observation |
|---|---|---|---|
| Claude Code plugin | Install from the plugin marketplace. | `Use sdcorejs-documentation to summarize this repo's validation posture.` | A documentation skill loads, creates a tasklist for non-trivial work, and reports verification status. |
| Codex attached repo | Add this repo as a submodule or keep `AGENTS.md` at the target root. | `Use the SDCoreJS flow to plan a small docs update.` | `AGENTS.md` routes to brainstorming/spec/plan discipline instead of writing immediately. |
| Codex native skills | Copy `codex/skills/**` plus `codex/skills/_refs/**` into `$CODEX_HOME/skills`. | `Use sdcorejs-documentation to write a short technical doc.` | The skill resolves `../_refs/...` and follows tasklist/verification rules. |
| Cursor | Use `AGENTS.md` plus `.cursor/rules/**`. | `Create acceptance criteria for a small feature using SDCoreJS.` | Product/design/test/doc routing selects the matching workflow. |
| GitHub Copilot | Use `.github/copilot-instructions.md` or `.github/chatmodes/**`. | `Create acceptance criteria for a small feature using SDCoreJS.` | Product/design/test/doc routing selects the matching workflow. |

For release adoption, pin a Git tag or GitHub Release rather than a floating
branch, then record the exact tool versions and transcript evidence.

### Claude Code Plugin

```text
/plugin marketplace add sdcorejs/sdcorejs-agent
/plugin install sdcorejs-agent@sdcorejs
```

### Codex Native Skills

```powershell
npm run sync:skills
$dest = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills" } else { Join-Path $HOME ".codex\skills" }
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item .\codex\skills\* $dest -Recurse -Force
```

Restart Codex after copying. Keep `codex/skills/_refs` with the skills.

### Attached Repo / Submodule

```bash
cd <your-project>
git submodule add <repo-url> .sdcorejs-agent
ln -s .sdcorejs-agent/CLAUDE.md CLAUDE.md
ln -s .sdcorejs-agent/AGENTS.md AGENTS.md
ln -s .sdcorejs-agent/skills skills
ln -s .sdcorejs-agent/_refs _refs
```

## Tool Support

| Tool | Reads | Verification |
|---|---|---|
| Claude Code plugin | `plugin/skills/**`, `plugin/_refs/**`, `plugin/sdcorejs-harness.json` | Mirror/action/capability drift checks |
| Claude Code direct | `CLAUDE.md`, `.claude/skills/**`, `.claude/sdcorejs-harness.json` | Mirror and behavioral sentinel checks |
| Codex attached repo | `AGENTS.md` | Entrypoint and behavioral sentinel checks |
| Codex native | `codex/skills/**`, `codex/sdcorejs-harness.json` | Codex mirror/action/ref checks |
| Cursor | `AGENTS.md`, `.cursor/rules/sdcorejs-agent.mdc`, `.cursor/sdcorejs-harness.json` | Generated rule/manifest drift checks |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md`, `.github/sdcorejs-harness.json` | Entrypoint and manifest checks |

For adoption guidance, compatibility evidence, and expected live-tool
transcripts, see:

- `docs/ADOPTION.md` - when to use this pack, when not to use it, fast-fix
  rules, compatibility matrix, and adoption checklist.
- `docs/WORKED_EXAMPLE.md` - example full workflow from request through
  evidence summary.
- `docs/TROUBLESHOOTING.md` - mirror drift, Codex refs, text hygiene, plugin,
  and Full E2E troubleshooting.
- `docs/REAL_AGENT_VALIDATION.md` - sanitized transcript evidence template.
- `docs/RELEASE_PROCESS.md` - tag/release checklist.

## Repo Layout

```text
skills/                 source skills, 21 dispatchable skill files
_refs/                  source reference docs
_refs/harness/          actions, capabilities, model roles, runtime envelopes
.claude/skills/         generated Claude mirror
plugin/skills/          generated Claude plugin mirror
codex/skills/           generated Codex-native mirror
.cursor/rules/          generated Cursor rule
scripts/sync-skills.mjs cross-platform mirror generator
*/sdcorejs-harness.json generated adapter capability/action metadata
```

Run after editing source skills, refs, or `AGENTS.md`:

```bash
npm run sync:skills
npm run check:skills
```

See `MIRROR_POLICY.md` for canonical source ownership and generated mirror
review rules.

## Release Discipline

- Keep `CHANGELOG.md` updated for user-visible skill, ref, workflow, or
  validation changes.
- Create GitHub releases and tags for adopted versions; follow
  `docs/RELEASE_PROCESS.md` and include validation commands, CI run links, Full
  E2E evidence, and real-agent transcript evidence for Claude Code, Codex,
  Cursor, and GitHub Copilot in release notes.
- Treat generated mirrors as supported distribution artifacts. Any source
  change to `skills/`, `_refs/`, or `AGENTS.md` must be followed by
  `npm run sync:skills` and `npm run check:skills`.
- For upgrades, compare the previous tag to the new tag and review
  `CHANGELOG.md`, `VALIDATION.md`, and `docs/ADOPTION.md`.
- Keep repository metadata aligned with this positioning: this is a portable
  SDLC skill pack, not a standalone runtime coding agent.

## Mandatory Behavior

- Runtime-localized output: respond in the user's language and preserve locale-specific marks.
- Non-trivial skills apply the read-only `_refs/shared/project-context.md`.
  Valid summary sections help orientation; missing or stale summary falls back
  to targeted reads or a scoped code map and never blocks work.
- Non-trivial execution tasks use `_refs/shared/tasklist.md`: create visible
  outcome-based progress when work starts, then update only for a meaningful
  outcome, scope change, blocker, verification event, required decision, or
  explicit status request. Disclose skipped verification, blockers, and risks
  without duplicating the final response.
- Live progress remains in the current thread/harness. Durable handoffs are
  explicit and change-scoped; repository files never mirror live checkbox
  state.
- `.sdcorejs/**` producers emit runtime `artifact_context`. Git artifact
  closure automatically includes required same-change specs/plans/docs while
  excluding unrelated and local-only artifacts.
- Requirements before code: use `sdcorejs-brainstorming` until blockers are confirmed.
- Pure Q&A answers directly without entering the SDLC.
- For explicitly small low-risk edits, use the fast-fix path in
  `docs/ADOPTION.md`; escalate to the full workflow if scope grows.
- Explicit approval required for spec and plan.
- Approved plans execute through `sdcorejs-execute-plan`.
- `sdcorejs-execute-plan` asks sequential versus parallel only for two or more
  independent units when both modes are actually feasible.
- Supported native structured interaction may be used for real decisions;
  static visual and numbered Markdown fallbacks keep the workflow portable.
- Product/PO docs, user stories, acceptance criteria, UAT, and traceability use the `sdcorejs-product` track.
- UI/UX design, FE handoff specs, wireframes, and PNG previews use the `sdcorejs-design` track.
- Test-only plans use the `sdcorejs-test` track.
- Confirmed AI-agent implementations use `sdcorejs-ai-agent`; under-specified
  AI-agent ideas return to brainstorming, while test, review, and debug requests
  keep their dedicated owners.
- Codebase understanding, summaries, flow tracing, and local setup discovery use `sdcorejs-explore`.
- Bounded behavior-preserving refinement of recently changed or explicitly
  scoped executable source uses `sdcorejs-simplify`; broad refactors return to
  planning.
- Final gate, acceptance verification, branch readiness, dependency-update delivery, ready-to-merge, and release readiness use `sdcorejs-ship`.
- Commit, PR, changelog, release notes, and Git artifact creation use `sdcorejs-git`.
- Unknown stacks can still run through the generic harness fallback.
- Authentication, authorization, security, and container-based test guidance
  remain embedded in the technical tracks that own those concerns; they are
  not standalone end-to-end packaging workflows.
- Every code-generation run presents the finish gate before tail steps.
- Never claim pass, built, fixed, or done without current verification output.

## License

MIT
