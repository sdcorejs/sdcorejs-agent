---
artifact_id: memory-normalization-category-null-input-20261114
artifact_kind: memory
change_ref: normalize-category-null-input
source_spec: none
source_plan: none
commit_policy: conditional
owner: sdcorejs-explore
track: node
stack_profile: node-general
source_skill: sdcorejs-explore
applies_to: normalizeCategory in src/category.mjs; category normalization of nullable strings
created_at: 2026-11-14T09:13:20.392056+00:00
authority: advisory
approval_source: explicit user authorization for this scoped memory capture only
evidence: src/category.mjs; test/category.test.mjs; inputs/fix.diff; observed regression run
confidence: high
source_revision: 11b80db173ba3a0bfd063f5318f24a7ac73ad97a
source_path: src/category.mjs
source_fingerprint: sha256:4e41ec60fed4a96c10258f43697ab3c42fc32615fc2da4abc07f8f05dc4fdfc5
proof_path: test/category.test.mjs
proof_fingerprint: sha256:40b9abba12eb6f8f0768ff1f5cb6f488aab5c44e7c7456e9787e259490b86537
diff_path: inputs/fix.diff
diff_fingerprint: sha256:6911ce52d4f19fb307f3bbadd89ed6093083547533725f18399fcf94c4837ec9
config_path: package.json
config_fingerprint: sha256:31db0624d4ac006c5ea80512d76cf583d683075aa3d040a1ac60b88163e11cf2
proof_command: node --test test/category.test.mjs
proof_cwd: repository root
proof_runtime: Node v24.22.1
proof_verified_at: 2026-11-14T09:13:20.392056+00:00
proof_exit_code: 0
proof_result: 3 passed; 0 failed; 0 skipped
proof_output_fingerprint: sha256:9959cba1e459d1f9ab6c549e7e8d6b6e39b95e3c2069514b93e55042c0ab9f7f
redaction_applied: true
---

# Category normalization: guard nullish input before string methods

The historical implementation shown in `inputs/fix.diff` called
`value.trim().toLowerCase()` unconditionally. Inspection identifies the failure
mechanism: nullish values cannot receive the `trim()` call. The existing fix in
`src/category.mjs:1` returns an empty string for `value == null`, which covers
both `null` and `undefined`, before trimming and lowercasing non-nullish input.

The reusable lesson is to establish a normalizer's missing-value contract and
handle missing input before invoking type-specific methods. For this particular
function, the existing contract maps nullish input to `''`; this observation
does not establish that contract for every normalizer.

## Verified evidence

The existing tests in `test/category.test.mjs:2` assert:

- `normalizeCategory(null)` returns `''` (`null is empty`).
- `normalizeCategory(undefined)` returns `''` (`undefined is empty`).
- `normalizeCategory('  Tools  ')` returns `'tools'` (`trim and lowercase`).

The command in frontmatter ran successfully against the recorded source and test
fingerprints. The output digest identifies that historical run, including its
timing values; future output need not have the same digest. No pre-fix failing
run was performed. The old behavior is established by the supplied diff and
source inspection, not by a claimed RED execution.

`package.json` defines `npm test` as `node --test test/unit.test.mjs`, so that
script alone does not execute this category regression file. Use the recorded
direct command when checking this behavior; changing application or test
configuration was outside this capture's scope.

## Explore selection and freshness

For a future task such as “extend category normalization while preserving null
handling,” first use Explore's `memories-read` metadata selection with request
scope `normalizeCategory category normalization`, or exact
`change_ref: normalize-category-null-input`. The artifact ID and filename
support scope selection. An empty scope must not load all memories.

After a scope match, compare the four recorded file SHA-256 hashes with the
current source, regression tests, supplied diff, and command configuration.
A missing file, unreadable hash, or mismatch means stale or unknown evidence:
exclude this lesson from current verified guidance until current files and tests
have been re-inspected and the regression command rerun. A matching HEAD alone
does not establish freshness, and a changed HEAD alone does not invalidate
unchanged relevant files. Current source, tests, and explicit user instructions
take precedence over this memory.

The supplied Explore helper retrieves advisory candidates; it does not enforce
these content fingerprints. Apply the fingerprint check after retrieval, and
rerun the command for a future claim that the behavior currently passes.

For a payment, invoice, or other unrelated task, do not select this lesson merely
because it is recent. The existing `workflow/old-payment-advice.md` is outside
this lesson's normalization scope, has no frontmatter relationship proof, and
was neither adopted nor rewritten.

## Limits and authority

This is an evidence-backed recollection with scoped capture authorization.
It is not an approved team convention, an accepted design decision, a standing
write permission, or an instruction to revise application code. No convention
policy or team-wide rule was approved or created.

The tests establish the three cases above. They do not establish arbitrary
non-string input handling, Unicode normalization, API integration behavior, or
all application behavior. Reuse elsewhere requires that normalizer's own
contract and evidence; do not broaden this lesson into coercion of all inputs.

