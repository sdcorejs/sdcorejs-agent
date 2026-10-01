---
slug: troubleshooting
title: Troubleshooting
description: Identify installation, context, approval and verification problems; resolve the cause instead of bypassing a gate.
kicker: Troubleshooting
---

## A skill is missing or does not dispatch

Check the install path and the entrypoint your host reads. For Codex native skills, keep `codex/skills/_refs` beside the skill folders and start a fresh session after updating. Cloning the repository alone does not prove its instructions are attached to the target project.

Use the [read-only smoke prompt](/docs/quickstart/) and record the tool version, skill source/revision and observed behavior. Product names in a compatibility table do not prove support in the current session.

## Missing references or mirror drift

Symptoms: a skill cannot resolve `../_refs/...`, or `npm run check:skills` fails.

- Native install: copy the whole `codex/skills` tree, including `_refs`; do not copy skill folders individually.
- Maintainer source changes: edit canonical `skills/`, `_refs/` or entrypoints; run `npm run sync:skills`, then `npm run check:skills`.
- Do not hand-edit generated mirrors to conceal drift. If the install contains custom files, review the diff before replacement.

## The agent asks for a spec or plan

Check whether the request really qualifies as fast-fix: clear behavior/AC, small scope, bounded ownership/risk and available focused verification. Non-trivial implementation needs approved artifacts; "implement" does not satisfy the approval gate.

If an approved spec/plan already exists, provide the correct owner, path and identity/revision. Stale or hash-invalid artifacts, or mismatched scope, need the owning gate to resolve them; do not write approval metadata yourself.

## A summary is missing or stale

This is not a universal blocker. Project context falls back to targeted reads or a scoped code map. Persist a summary only when that action is authorized; reading context does not authorize refreshing a file.

## Core UI docs do not match the version

Preserve `@sdcorejs/angular` or `@sd-angular/core` according to the actual app. Check installed metadata/lockfile and relevant exports. When exact docs are unavailable, use verified local API evidence or report an unverified API. Do not upgrade or choose nearby-version docs and call them compatible.

Do not automatically import Core UI into plain Angular. See the [Angular guide](/angular/).

## Delegation or visual preview is unavailable

An `unknown` capability retains its fallback: Markdown for choices, static visuals when appropriate, sequential parent execution when delegation/isolation is unverified. Do not mark capabilities supported based only on host documentation.

A live Visual Companion needs scoped consent and local-runtime capabilities. Browser auto-open has separate consent. Without a live surface, preserve the original decision/options in the fallback. Visual feedback is not workflow approval.

## Tests cannot run or fail

Distinguish missing commands, missing environments, unavailable dependencies/containers and assertion failures. Record the exact command, exit/result and observed failure mode; redact secrets before sharing logs.

Root pack checks differ from target application tests. Pack Full E2E needs a prepared environment. Live-agent/provider checks need separate conditions and evidence. Report NOT RUN for unavailable environments; do not alter a test to pretend success.

Maintainer pack verification: [TESTING.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/TESTING.md) and [VALIDATION.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/VALIDATION.md).

## Vietnamese text appears corrupted

Preserve UTF-8 and locale marks in docs/user-facing strings. Run `npm run check:text-hygiene` in the skill pack and inspect actual browser text. If terminal rendering looks wrong, check bytes/encoding before concluding that source is damaged.

## A brief for troubleshooting help

```text
Host and version:
Skill-pack revision / installation method:
Target repository and authorized scope:
Prompt and observed behavior:
Expected / actual:
Command, exit/result and redacted logs:
Missing artifact/reference:
```

Diagnosis source: [repository Troubleshooting](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/TROUBLESHOOTING.md). Do not put credentials, session data or private URLs in a public report.
