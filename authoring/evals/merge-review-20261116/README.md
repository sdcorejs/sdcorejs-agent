# Review repairs and merge preparation — 2026-11-16

The user authorized fixing the final review findings and merging all current
changes into `main`. npm publication and release-version work belong to a new
branch. Root and site manifests remain private at version 0.8.0.

## Repairs

- Ticket snapshot/delivery closure now blocks when a required dependency is
  excluded. Privacy exclusions retain precedence, conflicting bucket claims
  block, case-insensitive change relationships are followed consistently, and
  equivalent relative path spellings cannot bypass exclusions.
- Native Windows relative targets discover the same scoped instructions as
  slash-separated targets; absolute and traversal targets still fail closed.
- Decision coverage accepts the existing hash-bound session delegation contract
  without inventing individual document approval or weakening integrity checks.
- Active adoption/release checklists now describe the 25-skill pack. Historical
  reports and approved snapshots remain unchanged.
- Astro is updated to 7.4.12; the site manifest, lockfile, CI and Pages runtime
  agree on Node.js 22.23.4. Root and compatibility toolchain lanes retain their
  existing constraints.
- The previously redesigned README and all existing implementation work are
  preserved. Deterministic communication measurements are appended to
  `VALIDATION.md`; byte counts are not model-token or performance claims.

## Verification and independent review

The exact commands, exit codes, times, source hashes and local evidence digests
are in `receipt.json`. Raw logs remain in the task workspace.

| Check | Result |
| --- | --- |
| Repository tests excluding the separate native cleanup stage | 897/897 pass |
| Focused closure regressions | 70/70 pass |
| Delegated-coverage/validation/convergence tests | 81/81 pass |
| Toolchain and documentation tests | 38/38 pass |
| Angular / NestJS / Next.js generated projects | All five golden tests pass |
| NestJS contract and real-container checks | 25 tests and one container test pass |
| Real Chromium visual-library checks | 551 assertions; no remote requests or script errors |
| Site build and local links/assets | 120 pages; 4,592 references pass |
| Root/site production dependency audits | Zero reported vulnerabilities |
| Independent runtime re-review | No remaining actionable finding; 66 focused tests and preserved negative probes pass |
| Independent distribution re-review | No remaining actionable finding; 48 focused tests pass |
| Current-file Gitleaks scan | Exit 1; 73 matches triaged as 69 file digests and four synthetic rejection fixtures; no confirmed credential leak among those matches |

Three fresh consumer-agent scenarios also exercised an explicit HTML preview
request, an unresolved layout discussion and a fixed-layout typo correction.
They respectively generated editable alternatives using the same sample data,
offered one comparison, and returned only the bounded correction. This is
bounded qualitative evidence, not a controlled A/B study or a host-wide claim.

## Pending remote acceptance and publication limits

Local `npm test` remains nonzero: the repository stage passed, but native cleanup
reported 44 pass, 110 fail and five skip because this workspace cannot admit the
required trusted ext4/APFS fixture. Docker storage is also overlayfs. No admission
bypass was used, and prior main CI is not substituted for the changed candidate.
The exact candidate must pass the existing native CI lane before merge.

The source candidate can be submitted for that verification under the user's
explicit merge instruction. This report does not label pending CI, convergence
or full branch acceptance as passed. A later receipt must record actual results.

Historical NVIDIA evidence is preserved: 80 pilot executions have only 79
complete common grading records and changed input bindings. Static quality
checks do not certify model behavior, scanner completeness or publication.
Full NVIDIA publication certification and the proposed paid visual study remain
incomplete/not run. No npm publish, release tag or 1.0.0 readiness claim is made.

## Candidate commit hook repair

The first candidate commit was not created: parallel pre-commit readers raced
with mirror replacement. The hook now runs its existing checks sequentially;
none is bypassed. Five active-source/mirror EOF whitespace warnings were
removed without semantic changes. The 210 whitespace warnings in immutable
historical evaluation captures are retained so their byte bindings remain valid.
