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

For a public release, capture at least:

| Tool surface | Prompt | Required observation |
|---|---|---|
| Claude Code plugin | Ask for a small governed docs or code task. | Plugin skill loads, tasklist appears, approval/verification rules are followed. |
| Codex attached repo | Ask for a concrete but incomplete feature. | `AGENTS.md` dispatches to brainstorming or the right track. |
| Codex native skills | Ask for a skill that loads `_refs`. | `../_refs/...` resolution works from `codex/skills/_refs`. |
| Cursor or Copilot | Ask for a product/design/test routing prompt. | Entrypoint instructions select the expected workflow. |

If a tool is not validated for a release, state that limitation in the release
notes instead of implying coverage.

## Transcript Template

```md
## <tool surface> - <scenario>

- Date:
- Release/tag:
- Commit:
- Tool and version:
- Install mode:
- Target repo:
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
