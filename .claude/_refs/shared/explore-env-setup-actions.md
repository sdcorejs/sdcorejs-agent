# Explore: Env Setup Actions

## Env Setup Actions

`env-setup-readonly` is the default. It may read README, package manifests,
lockfiles, Docker Compose, devcontainer files, env examples, and scripts. It
outputs setup commands/instructions and required env key names only.

It must not create `.env`, `.env.local`, config files, or secrets by default.
It must never overwrite existing env files. It must never insert real secret
values. It must not install packages, download tools, or start services as part
of a read-only action. Runtime work uses the actions below and existing session
authority; an authorized implementation/test need is not a new approval.

`env-setup-write-approved` may create a safe env file from an example only after
explicit approval. Use placeholders only, preserve existing files, and record
the write in `explore_context`.

## Check and run the local project

`runtime-check-readonly` inspects the relevant local application without starting
processes or changing files. `runtime-start-authorized` owns local startup needed
by an explicit run/setup request or scoped implementation/test work. Resolve the
actual request through `session-authority.md`; carry its source, target package,
purpose and exclusions. Reuse authority for reversible local work. Read-only
orientation never grants startup authority. These actions grant no durable
rule/summary/env writes.

1. **Select the target and commands.** Load applicable instructions and README,
   detect package manager and pinned version, inspect scripts and invoked setup
   hooks. Identify cwd, services, required env **names**, ports and readiness
   checks. Respect existing framework/non-Node tooling. Do not assume
   `npm run dev` exists or run every workspace app.
2. **Inspect current runtime.** Prefer host task/session information, then
   narrowly scoped local process/container/listener probes. Combine owning
   repository/package/cwd or task identity with a documented health endpoint,
   product-specific response, CLI smoke command or watcher ready signal. An
   open port, PID, HTTP 200 or historical log alone does not prove this project
   is ready. Fresh `not-running` evidence must cover the relevant task and
   endpoint, not a guessed default port. Record probe `coverage` as complete,
   partial or unknown. Permission-denied process entries make that probe partial,
   never proof of absence; use another scoped task/endpoint probe or report the
   gap. The helper requires complete absence evidence before startup. Unknown
   remains unknown.
3. **Decide and tell the user.** Use `decideProjectRuntime` in
   `_refs/shared/project-runtime.mjs` when available. This pure decision helper
   relies on host-supplied observations and scoped authority. Report not-running,
   unknown, blocked or unhealthy with the reason. When startup is authorized and
   prerequisites are ready, state the command and execute it now; do not stop at
   instructions or another permission question.
4. **Prepare only what is needed.** Reuse installed dependencies; use the detected
   lockfile-preserving install when missing dependencies block the requested
   task. Inspect hooks first and keep generated state local. Missing credentials,
   unavailable tools/services, conflicting instructions or required destructive
   migrations block the affected step. Name missing keys without reading values.
   Localhost can proxy production: inspect proxy and database targets. Do not
   reset data, bind public interfaces, change network policy or incur external
   effects from a generic local-start grant.
5. **Start once and verify.** Reuse a matching healthy instance. If a different
   or unidentified app occupies the endpoint, report the conflict; do not kill
   it or silently change ports. Start through the host's managed background/task
   session, capture its handle and bounded local logs. Before launch, configure
   a positive whole-startup `startup_timeout_ms` and record its absolute deadline;
   every readiness poll uses the remaining budget. A per-request HTTP timeout
   alone does not bound startup, and polling never resets the deadline. The
   decision helper blocks startup without this budget. Report exit/failure/timeout truthfully; route
   diagnosis to Debug under the same authority. No endless restarts. Use the
   test runner's server lifecycle when configured; do not launch a duplicate.
6. **Verify behavior and close ownership.** Readiness is not an E2E pass. Run
   requested smoke/E2E through Test with sanitized evidence. Keep a requested
   dev server available if the host supports it; provide URL and stop handle.
   Stop only temporary processes this task started after validation; leave
   pre-existing services alone. If processes cannot survive the turn, say so.
   Opening a browser uses separate session authority; startup is not browser
   permission.

Return runtime-only `runtime_context` with target/cwd, purpose, authority source,
status, actual command, process/task ownership, local endpoint, current identity
and readiness evidence, probe coverage/time, deadline, exit/timeout, blockers and cleanup
or retention outcome. States include `not-required`, `unknown`, `not-running`,
`starting`, `ready`, `unhealthy`, `failed`, `blocked`, `stopped`. Never persist
PIDs, secrets, raw logs or an old ready flag as project truth. Reprobe after
source/config/runtime changes. Never translate an unrun check into a pass.
