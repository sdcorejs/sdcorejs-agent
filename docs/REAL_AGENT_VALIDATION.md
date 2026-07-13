# Real-Agent Validation

Repository tests are deterministic. They do not prove that a hosted or local
agent followed the workflow in a live session. Use this document to capture
sanitized evidence for adopted releases.

## Evidence Rules

- Record exact tool, version, install mode, repository commit, and date.
- Use prompts that exercise one clear behavior.
- Sanitize secrets, private paths, customer names, and unrelated code.
- Keep enough transcript context to show skill selection, approval gates, and
  verification behavior.
- Store transcript links or summaries in release notes.

## Minimum Release Matrix

For a public release that claims full live-agent coverage, capture all of these
surfaces:

| Tool surface | Prompt | Required observation |
|---|---|---|
| Claude Code plugin | Ask for a small governed docs or code task. | Plugin skill loads, tasklist appears, approval/verification rules are followed. |
| Codex attached repo | Ask for a concrete but incomplete feature. | `AGENTS.md` dispatches to brainstorming or the right track. |
| Codex native skills | Ask for a skill that loads `_refs`. | `../_refs/...` resolution works from `codex/skills/_refs`. |
| Cursor | Ask for a product/design/test routing prompt. | Cursor rules select the expected workflow. |
| GitHub Copilot | Ask for a product/design/test routing prompt. | Copilot instructions or chatmode select the expected workflow. |

If a tool is not validated for a release, state that limitation in the release
notes instead of implying coverage.

## Frontend Architecture Close-out Scenarios

Run each scenario in a prepared target fixture through every tool surface whose
release notes claim support. Use one complete [Transcript Template](#transcript-template)
record per tool-surface/scenario pair. A repository test, an implementation
session in this authoring repository, or one tool surface cannot stand in for a
different live runtime.

### Scenario A - Complex Angular order list

Target-fixture prerequisite: an existing Core UI Angular portal with a routed
order feature and a known shared status-select symbol whose exact import path
can be inspected.

Prompt:

```text
Implement a routed order-management list with summary cards, external filters,
search, a result table, row selection, bulk actions, export, and row workflow
actions. Reuse the existing shared status select. Follow the governed SDCoreJS
workflow and the target project's established file conventions.
```

Expected observations:

- The frontend architecture plan appears before implementation.
- The reusable status-select symbol and exact path are recorded.
- A route-level page container owns route/query integration and orchestration.
- Summary, filter, table, and bulk-action responsibilities are considered as
  feature-local boundaries, but only meaningful approved boundaries are
  created.
- Filter, selection, paging, and workflow state have an explicit owner.
- API/data-access and optional facade/coordinator responsibilities stay
  distinct; no facade is created without justification.
- No duplicate status-select abstraction is created.
- The file map follows target-project conventions, and the page shell does not
  absorb all unrelated responsibilities.
- Approval gates and verification behavior match the installed workflow.

### Scenario B - Simple Angular drawer

Target-fixture prerequisite: an existing eligible Angular feature with a normal
drawer/form convention.

Prompt:

```text
Implement a drawer with four simple fields. It has no child collection,
independent asynchronous region, cross-component state, or non-trivial
workflow. Follow the governed SDCoreJS workflow and explain the component
boundary decision.
```

Expected observations:

- One cohesive component is accepted.
- No component-per-field or pass-through-wrapper decomposition appears.
- No facade/store is created without coordination or shared-state pressure.
- No speculative shared component or public export is introduced.
- The architecture rationale states why the smaller regions remain inline.
- Approval gates and focused verification behavior are visible.

### Scenario C - One-off Next.js pricing estimator

Target-fixture prerequisite: a Next.js build-website fixture with one route
whose surrounding page can remain a Server Component.

Prompt:

```text
Add an interactive client-side pricing estimator used only by this route. Keep
the surrounding route suitable for Server Component composition and data work.
Follow the governed SDCoreJS workflow and place the estimator at the smallest
meaningful client boundary.
```

Expected observations:

- The route page remains a composition/data boundary where practical.
- The estimator may be a feature-local Client Component despite having one
  consumer.
- Single use does not force the estimator inline.
- The estimator is not promoted into a cross-page shared section library.
- The client boundary is no larger than the cohesive interaction requires.
- Approval gates and focused verification behavior are visible.

### Pending frontend validation matrix

All pairs below are pending guidance, not pass evidence. Replace a row's
evidence cell with a sanitized transcript link only after completing every
field in the transcript template for that exact pair.

| Tool surface | Scenario | Run status | Result | Evidence | Exact current limitation |
|---|---|---|---|---|---|
| Claude Code plugin | A - Complex Angular list | Not run | Not evaluated | None | No separate Claude Code plugin runtime and prepared Angular fixture were executed for this change. |
| Claude Code plugin | B - Simple Angular drawer | Not run | Not evaluated | None | No separate Claude Code plugin runtime and prepared Angular fixture were executed for this change. |
| Claude Code plugin | C - Next.js estimator | Not run | Not evaluated | None | No separate Claude Code plugin runtime and prepared Next.js fixture were executed for this change. |
| Codex attached repo | A - Complex Angular list | Not run | Not evaluated | None | The current authoring-repo implementation session is not a fresh attached-target validation session. |
| Codex attached repo | B - Simple Angular drawer | Not run | Not evaluated | None | The current authoring-repo implementation session is not a fresh attached-target validation session. |
| Codex attached repo | C - Next.js estimator | Not run | Not evaluated | None | The current authoring-repo implementation session is not a fresh attached-target validation session. |
| Codex native skills | A - Complex Angular list | Not run | Not evaluated | None | No fresh native-skill installation and isolated Angular target session were executed. |
| Codex native skills | B - Simple Angular drawer | Not run | Not evaluated | None | No fresh native-skill installation and isolated Angular target session were executed. |
| Codex native skills | C - Next.js estimator | Not run | Not evaluated | None | No fresh native-skill installation and isolated Next.js target session were executed. |
| Cursor | A - Complex Angular list | Not run | Not evaluated | None | No Cursor agent runtime or sanitized Angular transcript was available in this environment. |
| Cursor | B - Simple Angular drawer | Not run | Not evaluated | None | No Cursor agent runtime or sanitized Angular transcript was available in this environment. |
| Cursor | C - Next.js estimator | Not run | Not evaluated | None | No Cursor agent runtime or sanitized Next.js transcript was available in this environment. |
| GitHub Copilot | A - Complex Angular list | Not run | Not evaluated | None | No GitHub Copilot Chat runtime or sanitized Angular transcript was available in this environment. |
| GitHub Copilot | B - Simple Angular drawer | Not run | Not evaluated | None | No GitHub Copilot Chat runtime or sanitized Angular transcript was available in this environment. |
| GitHub Copilot | C - Next.js estimator | Not run | Not evaluated | None | No GitHub Copilot Chat runtime or sanitized Next.js transcript was available in this environment. |

## Transcript Template

```md
## <tool surface> - <scenario>

- Date:
- Release/tag:
- Commit:
- Tool and version:
- Install mode:
- Target repo:
- Scenario ID:
- Prompt:
- Expected skill/workflow:
- Observed skill/workflow:
- Approval gate observed: yes/no/not applicable
- Verification evidence observed: yes/no/not applicable
- Result:
- Sanitized transcript or link:
- Limitations:
```

## Example Summary

```md
## Codex native skills - Ref loading smoke

- Date: 2026-07-06
- Release/tag: v0.5.1
- Commit: <commit>
- Tool and version: Codex <version>
- Install mode: copied `codex/skills/**` into `$CODEX_HOME/skills`
- Target repo: sanitized Angular/NestJS sample
- Prompt: "Use sdcorejs-documentation to write a short technical doc."
- Expected skill/workflow: `sdcorejs-documentation`, loads documentation refs.
- Observed skill/workflow: matched expected.
- Approval gate observed: not applicable for direct documentation summary.
- Verification evidence observed: yes, command output included.
- Result: pass
- Sanitized transcript or link: <link>
- Limitations: no code generation in this scenario.
```
