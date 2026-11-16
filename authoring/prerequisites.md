# Authoring prerequisites and independent audit

This policy applies to developing this skill pack. It is not a requirement for
projects that consume SDCoreJS skills, and external authoring tools are never
copied into public mirrors, target projects or dependency manifests.

## Before implementation

At every authoring session start, including a resumed session on another machine,
read the [required skill packs](skill-packs.md), the internal authoring workflow,
and run:

```sh
node authoring/tools/check-prerequisites.mjs
```

The read-only check requires readable skill metadata for `skill-installer`,
`skill-creator`, Superpowers `writing-skills` and `test-driven-development`, and
NVIDIA `skillevaluator`, plus a working `skillevaluator --version`. It searches
known user installation roots, including plugin caches. For other hosts, pass
one or more `--skill-root` paths. Presence on disk proves availability for direct
loading; it does not assert that a host automatically activates that skill.
Missing/invalid prerequisites block implementation. Read-only diagnosis and
installation preparation may continue. Restore missing components using the
current session's scoped installation authorization, then rerun the preflight.
An environment reset does not imply that a previous installation survived.
Do not silently substitute a different evaluator or invent a passed check.

## Cloud persistence and handoff

The registry and these instructions belong in the repository. An installation
under `~/.codex` or a plugin cache is user-wide on that machine; it is not an
account-wide Cloud installation. A new task can receive saved environment
variables while starting with a clean checkout and no prior tools or work files.

Before moving unfinished work to another machine, transfer the actual source
diff and untracked files, the reviewed evaluation inputs and hash manifests,
and sanitized evidence. A handoff prompt and a Git commit ID do not transfer
uncommitted files. Recreate virtual environments from pinned dependencies rather
than copying machine-specific executables. Keep keys in environment settings.
Verify the restored file hashes and prerequisite status before resuming. Preserve
historical evidence; changed governing instructions need a new source binding.

## Install missing prerequisites

Reuse installed skills. Use current instructions from the official sources:

| Capability | Official source | Installation |
|---|---|---|
| Install skills | https://github.com/openai/skills | `skills/.system/skill-installer` |
| Create/update skills | https://github.com/openai/skills | `skills/.system/skill-creator` through the installer |
| Behavioral TDD | https://github.com/obra/superpowers | Install the host-supported Superpowers plugin; load `writing-skills` and `test-driven-development` |
| Independent evaluation | https://github.com/NVIDIA/SkillEvaluator | Install `skills/skillevaluator`; install the base CLI in an isolated tool environment |

A normal base CLI installation uses `uv tool install skillevaluator`; follow
NVIDIA's current Python compatibility instructions. Pin the evaluator version
or source commit in the audit evidence. Request installation only for missing
components and reuse the user's existing installation authorization. Do not
request or expose credentials. LLM/security/live extras are separate capability
checks; base installation does not imply every tier is executable.

## Author, verify, audit, repair

1. Capture baseline source and behavioral failures before authoring.
2. Use the internal workflow, skill-creator and writing-skills guidance. Keep
   current repository contracts authoritative when generic guidance differs.
3. Finish implementation, focused tests and mirror generation.
4. Dispatch a different auditor with a fresh context and read-only target
   access. Give requirements, exact revision/diff and content hashes, test
   commands and source paths. Do not seed the auditor with the author's verdict.
5. The auditor runs available NVIDIA checks and reviews the actual behavior and
   contracts. It reports severity, evidence, exact commands/exit codes, target
   hashes, evaluator version and limits. Author owns repairs.
6. Rerun affected tests and independent audit after repairs. Final readiness
   refers only to the audited source hashes. Unrelated changes do not invalidate
   evidence; changes to a bound input do.

Keep static quality, full scanner coverage, fresh-agent scenario reviews and
live baseline/with-skill experiments separate. `quality-check` alone cannot
certify publication or prove behavior; adapt advisory template findings to the
repository instead of optimizing wording merely to increase a score. Missing
scanners/providers or unrun tiers are NOT RUN/INCOMPLETE, never PASS. An
unavailable independent agent leaves that gate pending, never self-certified.
Live provider calls obey the session's actual authorization. Raw reports and
transcripts stay in a local work directory; store only sanitized change-scoped
receipts with source hashes when durable evidence is needed.
