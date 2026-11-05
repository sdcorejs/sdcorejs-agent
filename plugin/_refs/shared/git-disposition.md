# Git and Ship disposition

Both skills use this table and `evaluateGitArtifactDisposition` in
`_refs/shared/ship-readiness-contract.mjs`. This is artifact delivery only;
it does not relax `evaluateShipReadiness` or claim production readiness.
Session authorization carries across skills under `session-authority.md`.

| Action | Required evidence | Result |
|---|---|---|
| Local commit (including docs-only) | Authorized scope, current read-only hygiene, complete artifact closure; applicable verification PASS or explicit acceptance deferral with reason | Commit with truthful verification/caveat |
| Manual draft/notes | Explicit request; disclose missing checks | Notes only; no commit/push/PR, no readiness claim |
| Push and remote draft PR | Explicit corresponding actions, included commit, remote branch for PR, same hygiene/closure and verification or explicit deferral | Draft marked unverified/deferred when applicable |
| Ready PR | Explicit action, current hygiene/closure and verified acceptance | Normal PR; no merge authority |
| Secret, conflict, ownership ambiguity, incomplete closure, stale hygiene, unsafe cleanup, or post-check write | Any Git-mutating action | BLOCKED; deferral cannot waive it |

A governed plan also requires its current verified convergence receipt for every
mutating row. Missing/stale/mismatched convergence is never an acceptance waiver.
Bounded docs/fast-fix work does not fabricate a plan or receipt merely to commit;
record its applicable checks and scope. A failed check is a blocker until fixed
or explicitly classified and accepted as an acceptance deferral; hygiene and
ownership failures cannot be reclassified that way. Silence is not deferral.

Separate acceptance from hygiene: an unverified draft may have READY hygiene
while acceptance remains DEFERRED. Never stamp full branch/ship readiness from
that limited disposition. Preserve current HEAD/diff identity, check outcomes,
skipped reasons and risk note. Writes after checking make evidence stale.
