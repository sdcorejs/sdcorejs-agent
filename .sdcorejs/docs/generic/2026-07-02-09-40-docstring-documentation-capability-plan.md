# Plan - Documentation Docstring Capability - 2026-07-02 09:40

## Scope

Add a first-class `docstring` mode to `sdcorejs-documentation` for documenting public code contracts with Python docstrings and language/framework documentation comments. Preserve all existing documentation modes, keep `comment-code` focused on implementation rationale, and keep reusable skill source English-only.

Approved spec: `.sdcorejs/specs/generic/2026-07-02-09-39-docstring-documentation-capability.md`

## Execution context

- Track: generic
- Coverage approach: post-hoc
- Parallel candidates: no. The change is small, sequential, and touches a tightly coupled source skill/ref plus generated mirrors.

## Tasks

### Phase 1 - Source documentation capability

1. CREATE `_refs/documentation/docstring.md` - Add the dedicated docstring/doc-comment reference with purpose, routing behavior, public-contract vs implementation-comment distinction, language/framework detection order, TypeScript general rules, Angular rules, NestJS rules, Next.js rules, Python rules, fallback rules, examples, output behavior, and anti-patterns.
2. EDIT `skills/orchestration/documentation.md` - Add `docstring` to mode selection, workflow/direct-request routing, tail/direct behavior notes if needed, and cross-references while preserving existing modes.
3. VERIFY THEN EDIT `test/e2e/support/skill-pack-runner.mjs` - Check whether documentation keyword diagnostics need explicit `docstring`, `doc comment`, `tsdoc`, or related trigger terms; update only if needed for coverage.

### Phase 2 - Generated mirrors

4. RUN `npm run sync:skills` - Regenerate Codex, plugin, Claude, `_refs`, and Cursor mirrors from source instead of editing generated files by hand.
5. VERIFY generated mirror paths - Confirm the new docstring ref and updated documentation skill appear under `codex/skills/**`, `plugin/**`, and `.claude/**` as produced by sync.

### Phase 3 - Verification and hygiene

6. RUN `npm run check:skills` - Verify generated mirrors are synchronized with source.
7. RUN `npm test` - Run the repo e2e regression suite.
8. RUN `git diff --check` - Check whitespace and patch hygiene.
9. RUN `rg -n "[\x{00C0}-\x{1EF9}]" skills _refs codex plugin .claude test/e2e/support/skill-pack-runner.mjs` - Verify the implementation did not add Vietnamese prose to reusable skill source or generated mirrors; existing non-Vietnamese Unicode should be reviewed conservatively.
10. REVIEW `git diff --stat` and focused diffs - Confirm only scoped skill/ref/mirror/test/session artifacts changed.

## Acceptance mapping

- AC1 -> tasks 1, 2, 4, 5
- AC2 -> tasks 1, 2, 3, 4, 6, 7
- AC3 -> tasks 1, 2, 10
- AC4 -> tasks 1, 2, 10
- AC5 -> task 1
- AC6 -> task 1
- AC7 -> task 1
- AC8 -> task 1
- AC9 -> tasks 2, 10
- AC10 -> tasks 4, 5, 6
- AC11 -> task 6
- AC12 -> task 7
- AC13 -> tasks 1, 2, 3, 4, 9, 10

## Verification

- `npm run sync:skills`
- `npm run check:skills`
- `npm test`
- `git diff --check`
- `rg -n "[\x{00C0}-\x{1EF9}]" skills _refs codex plugin .claude test/e2e/support/skill-pack-runner.mjs`
- Manual: inspect the docstring reference and documentation skill routing to confirm `docstring` and `comment-code` remain distinct.
