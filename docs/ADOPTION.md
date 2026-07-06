# Adoption Guide

Use this guide when deciding whether to install or enforce `sdcorejs-agent` in a
team repository.

## When To Use This

This pack fits teams that want governed AI-assisted development with explicit
requirements, spec, plan, execution, verification, review, and release gates.
It is strongest when the target project uses one of the supported tracks:

- Angular portals using `@sdcorejs/angular`.
- NestJS + Postgres backends.
- Next.js public sites.
- Product, design, and test-track evidence.
- Generic plans where a strict approval and verification harness is useful.

## When Not To Use This

Do not use the full workflow when:

- The task is pure Q&A with no file edits.
- The target repo is untrusted and has not been sandboxed.
- A team wants casual autocomplete-style suggestions instead of governed SDLC.
- The requested work is production SDLC expansion that has not been explicitly
  approved, such as CI/CD rollout, IaC, observability, SRE, compliance, incident
  response, or release governance.
- A target stack has stronger local project rules that conflict with this pack.

For unsupported stacks, use the generic harness only after the scope and
verification commands are explicit.

## Fast-Fix Path

The fast-fix path exists for low-risk, one-topic changes. It reduces ceremony
without removing evidence discipline.

Allowed when all are true:

- The user explicitly asks for a small direct fix.
- The change is narrow and affects one behavior or one documentation concern.
- No new architecture, workflow, skill, or production SDLC surface is created.
- The agent can run targeted verification before reporting the result.

Required steps:

1. Run the project-context preflight if prior decisions may matter.
2. State the narrow task and the verification command.
3. Make the smallest scoped edit.
4. Run targeted verification and disclose any skipped broader checks.
5. Escalate to the full brainstorming -> spec -> plan flow if scope grows.

Fast-fix is not a bypass for security, destructive commands, hidden Unicode
hygiene, mojibake, or verification-before-done.

## Compatibility Matrix

Record exact tool versions in release notes when validating an adopted release.
This matrix tracks supported surfaces and the evidence expected for each.

| Tool surface | Reads from | Repository validation | Release evidence to capture |
|---|---|---|---|
| Claude Code plugin | `plugin/skills/**`, `plugin/_refs/**` | `npm run check:skills` verifies generated plugin mirrors. | Plugin install transcript and one representative skill dispatch. |
| Claude Code direct repo | `CLAUDE.md`, `.claude/skills/**`, `.claude/_refs/**` | Mirror sync plus entrypoint smoke tests. | Direct repo session transcript showing skill selection and approval gate behavior. |
| Codex attached repo | `AGENTS.md` | Entrypoint smoke tests cover dispatch guidance. | Codex session transcript from an attached target repo. |
| Codex native skills | `codex/skills/**` and `codex/skills/_refs/**` | `npm run check:skills` verifies Codex frontmatter and ref rewrites. | Native-skill install transcript and a ref-loading check. |
| Cursor | `AGENTS.md`, `.cursor/rules/sdcorejs-agent.mdc` | Cursor rule generated from `AGENTS.md`. | Cursor session transcript showing selected workflow. |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md` | Entrypoint smoke tests cover the Copilot profile. | Copilot chat transcript for a simple governed task. |

## Adoption Checklist

- Choose install mode: plugin, direct repo, submodule, or copied native skills.
- Run `npm ci`, `npm run check:text-hygiene`, `npm run check:skills`, and
  `npm run test:e2e` at the source commit.
- Read `SECURITY.md` and decide whether the team needs safe mode.
- Link `docs/TROUBLESHOOTING.md` from team onboarding docs.
- Pin a Git tag or GitHub release instead of a floating branch.
- Capture real-agent transcript evidence for every tool surface claimed by the
  release. For full coverage, validate Claude Code, Codex, Cursor, and GitHub
  Copilot.
