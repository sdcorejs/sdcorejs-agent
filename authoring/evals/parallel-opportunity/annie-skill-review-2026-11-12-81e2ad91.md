# Annie skill review and validation

Source revision: 81e2ad91acddfd82c865ca501fcda18c3fa53c24
Baseline: bdc22462070f9e52bb7900619970d8f8f17c5c50
Review date: 2026-11-12

## Skill review

- The descriptions surface substantial independent investigations while keeping
  Debug, Review, and Explore as primary owners. The scheduler handles the
  eligibility check and fan-in. The public inventory remains 25.
- Each owner checks its own bounded evidence before routing. The shared
  reference and executable helper own resource normalization, collision
  checks, and fail-closed behavior. Coupled or unknown work, explicit
  sequential choices, unavailable delegation, and recursive workers retain
  their existing boundaries.
- The read-only branch keeps empty write allowlists and report results.
  Approved-plan execution remains on its existing path.
- The review found no blocking issue in skill discovery, scope, or reference
  placement. Full-suite acceptance remains open for the NestJS golden error
  documented below.

## Evidence

- [WSL2 ext4 native verification](annie-wsl2-ext4-2026-11-12-81e2ad91/verification.json)
  records the capability probe, cleanup, focused tests, full-suite attempts, and
  the exact-runtime reproduction of the NestJS golden peer dependency conflict.
  APFS is NOT RUN.
- [Live A/B](live-ab-annie-2026-11-12-81e2ad91/verification.json) records 24
  valid routing decisions from six fixtures on each arm and provider. The
  candidate scored 6/6 on both Codex GPT-6.1 Sol and Claude Code Sonnet 5.5 at
  medium effort. Codex baseline scored 3/6 and Claude baseline scored 6/6.
  The sample measures routing decisions on the selected fixtures.
- A separate read-only run used two independent source traces in a private
  target repository. The candidate returned a parallel read-only wave. Two
  fresh Codex CLI workers completed with 20,478 ms of observed turn overlap,
  zero tool calls, and matching target checkout fingerprints before and after.
  The Windows sandbox setup could not be attested. Workers analyzed bounded
  committed excerpts supplied over stdin from an empty working directory with
  shell and delegation disabled. Target identity, sources, and raw transcripts
  are retained locally.

The full suite reproduced npm ERESOLVE in both NestJS golden profiles under
npm 10.9.2. The generated manifest selected @nestjs/platform-express 11.2.9
from the registry, while @sdcorejs/nestjs 1.3.1 required a commit-pinned
backport as a peer. The normal NestJS suite passed 25/25. The historical cloud
records remain available for comparison.
