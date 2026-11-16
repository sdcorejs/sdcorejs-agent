---
artifact_id: verification-normalize-category-null-input-2026-11-14
artifact_kind: execution-doc
change_ref: normalize-category-null-input
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-explore
owner_repository_id: github.com/benchmark-sdcorejs/order-desk
owner_role: sequential-owner
---

# Category normalization regression evidence

Command: `node --test test/category.test.mjs`; repository-relative cwd: `.`.
Result: PASSED, exit 0; 3 tests passed, 0 failed, 0 skipped.
Cases: `null is empty`, `undefined is empty`, `trim and lowercase`.
Source revision: `11b80db173ba3a0bfd063f5318f24a7ac73ad97a`; Node: `v24.22.1`.
Observed at: 2026-11-14T09:12:27.134974+00:00.
SHA-256 of screened command output: `222ef4dcc805efa3b1e43fc4307b8b007d3ef663de50878e015445bda6019ccc`.

The supplied diff removes unconditional trim and introduces a nullish guard. Current source matches its fixed line. The two nullish cases return an empty string; the string case preserves trimming and lowercasing. This is focused pure-function regression evidence, not full application, API or browser evidence.

| File | SHA-256 at execution |
|---|---|
| `src/category.mjs` | `4e41ec60fed4a96c10258f43697ab3c42fc32615fc2da4abc07f8f05dc4fdfc5` |
| `test/category.test.mjs` | `40b9abba12eb6f8f0768ff1f5cb6f488aab5c44e7c7456e9787e259490b86537` |
| `package.json` | `31db0624d4ac006c5ea80512d76cf583d683075aa3d040a1ac60b88163e11cf2` |
| `inputs/fix.diff` | `6911ce52d4f19fb307f3bbadd89ed6093083547533725f18399fcf94c4837ec9` |

The default package test script runs only test/unit.test.mjs, so the category regression must be selected explicitly with the command above. No source, tests or package scripts were changed. The original output contains only synthetic test names and Node runner statistics; no secrets or personal data were found. Raw output remains outside the repository in the authorized capture folder. This document is the durable, sanitized proof summary.
