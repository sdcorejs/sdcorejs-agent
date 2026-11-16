# Required authoring skill packs

This registry applies to maintaining `sdcorejs-agent`, including implementation,
skill changes and evaluation. Consumers of the public pack do not install these
authoring dependencies. `AGENTS.md` makes the startup check mandatory. Apply
[prerequisites and independent audit](prerequisites.md) throughout authoring.

| Pack | Required capabilities | Official source | Recorded source revision |
| --- | --- | --- | --- |
| OpenAI skills | `skill-installer`, `skill-creator` | https://github.com/openai/skills | `49f948faa9258a0c61caceaf225e179651397431` |
| Superpowers | `writing-skills`, `test-driven-development` | https://github.com/obra/superpowers | `22f0b463e7a5e579904dd6211a520321035526f7` (installed plugin 7.0.2) |
| NVIDIA SkillEvaluator | `skillevaluator` skill and CLI | https://github.com/NVIDIA/SkillEvaluator | `f5bf6c1f3666699fd145612a2e9162e9721db3f9` (CLI 0.9.0) |

These revisions record the sources used for this authoring environment. Reuse a
compatible installed version and record its actual version in new evidence.
For exact replay, restore the pinned source bytes and dependency inventory from
the handoff. An intentional tool upgrade needs new verification; do not label an
upgraded run as an exact replay.

## Startup procedure

1. Inspect the selected machine and checkout. Preserve existing dirty files. If
   an unfinished handoff names files that are absent, restore the handoff before
   attempting to reproduce its evaluation.
2. Run `node authoring/tools/check-prerequisites.mjs`. If Node dependencies are
   missing, use the repository's pinned package manager and lockfile to install
   them within the session's existing setup authorization, then rerun the check.
3. For missing packs, load an available installer and use the official sources
   above. Bootstrap the OpenAI system skills from `skills/.system/skill-installer`
   and `skills/.system/skill-creator` if the host did not provide them. Use the
   host-supported Superpowers plugin installation and load the two required
   skills. NVIDIA's skill is at `skills/skillevaluator`; install its CLI in an
   isolated tool environment. Follow the upstream instructions at the selected
   revision. Reuse scoped installation authorization; do not ask again solely
   because the machine changed.
4. Prefer user-level installation in the host's supported skills/plugin roots
   (`~/.codex/skills` by default for Codex). When that root is not writable, use a
   workspace-local tool/skill directory and pass `--skill-root <absolute-path>`
   to the checker. Custom roots replace default discovery: repeat `--skill-root`
   for every existing skills root, plugin-cache root and fallback root needed
   for a mixed installation. Load those skill files directly; discovery by the checker
   does not promise automatic host activation. Add the CLI's existing `bin`
   directory to the command's `PATH`; never repurpose `HOME` or `CODEX_HOME`.
5. Rerun the check and retain its result. Proceed with implementation only when
   `ready` is true. If network, permissions or packages prevent restoration,
   report the precise blocker and continue independent read-only work.
6. For model-backed evaluation, separately check provider credentials by
   presence only, API reachability, evaluator extras, agent/model compatibility
   and the selected sandbox. Installed packs alone do not establish these
   capabilities. Provider calls follow the user's actual scope and budget.

## Persistence boundary

A Cloud environment configuration, a machine filesystem and a Git checkout are
separate. Saving environment variables does not copy `~/.codex`, `/workspace/work`
or uncommitted repository changes into another task. Keep this registry in Git;
transfer unfinished source and evaluation artifacts with integrity manifests.
Do not put external authoring packs, credentials, virtual environments or caches
into public skill mirrors or a consuming project. The startup procedure restores
availability when possible and reports blockers when it cannot; it is not an
automatic account-wide installation service.
