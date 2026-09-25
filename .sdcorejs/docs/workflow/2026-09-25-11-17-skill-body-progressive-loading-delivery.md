---
schema_version: 1
artifact_kind: execution-doc
change_ref: skill-body-progressive-loading-20260925
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
source_spec: .sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
source_plan: .sdcorejs/plans/workflow/2026-09-25-17-19-skill-body-progressive-loading-r3.md
source_revision: b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87
commit_policy: with-change
status: delivered-pending-final-gate
---

# Skill body progressive loading — delivery

Bốn skill body đã được tái cấu trúc sang private references theo spec đã duyệt
(`sha256:v1:a2b22b1e5638704f749b9e8f0ed7987b6bb818eea9c2e4303847d3474ac4ca14`) và chuỗi plan
r1 → r2 → r3. Public inventory (23), name, description và `required-actions` giữ nguyên byte.
Không cài dependency, không sửa repo sản phẩm. Commit và push chỉ chạy theo yêu cầu explicit
của user, sau khi branch-ready chấp nhận convergence hiện tại; không force push, không tạo PR.

## Chuỗi approval

| Artifact | Hash | Nội dung |
| --- | --- | --- |
| spec | `sha256:v1:a2b22b1e…` | yêu cầu, AC, non-goals, bypass kiến trúc `docs-only` |
| plan r1 | `sha256:v1:5e1637d40af0a2c9eb2a607ed826981e0e630d14a82fbc55cd3155c8bba13646` | 10 task tuần tự |
| plan r2 | `sha256:v1:b24f9a5e9b28759b3d3deb9ad25322641e137e82ca434a8f926cf1dcf95033bb` | thêm `test/e2e/npm-publication-contract.test.mjs` (miễn quét cho evidence record, tiền lệ bước 4) |
| plan r3 | `sha256:v1:5cd67c353470b547916eac8190bf43111dc0cc020d3a4714ba6e0702fa699a67` | căn chỉnh governance cho convergence và hai case kiểm chứng mới |

Plan r3 (user trả lời `1` cho r3 governance và `1` cho việc thêm hai test):

- Planned paths bằng đúng các path đã giao; 39 path ứng viên không cần sửa bị bỏ khỏi planned
  paths (owner dedupe không cần đổi, test không cần retarget, manifest harness không đổi).
  TASK-007 liệt kê 39 file mirror thực sự do `npm run sync:skills` sinh.
- Decision coverage revision 2 thêm INV-004 (truy vết giao hàng); INV-001..003 giữ nguyên.
- Validation map 15 row, mỗi cặp (AC, requirement) một case duy nhất. Hai case mới trong
  `test/e2e/production-readiness-contract.test.mjs`:
  `case-progressive-load-explore-inventory` (AC-005/R-005) và
  `case-progressive-load-distribution-resolution` (AC-007/R-007).
- EVIDENCE-010 là lần chạy `npm run test:e2e:repository` cuối trên đúng nội dung giao cuối.
- Convergence receipt là runtime evidence (không lưu trong `.sdcorejs`, vì `release-evidence`
  không phải kind được artifact lifecycle phân loại); hash được ghi trong commit và bàn giao.

## Mapping old section → canonical owner

| Skill | Section cũ | Owner hiện tại | Điều kiện load |
| --- | --- | --- | --- |
| angular | Input Resolution, Semantic schema refinement, Step 1/2 EntitySchema, Core UI detection/docs discovery, MUST/MUST NOT chi tiết | `_refs/angular/write-code/generation-process.md` | trước khi dựng `EntitySchema` hoặc viết file sinh |
| angular | Core UI usage summary template, Validation Checklist | `_refs/angular/write-code/finishing.md` | sau khi viết code, trước finish gate |
| angular | Template-first bullets; OnPush/template binding/Service DTO/child CRUD/styling bullets | owner sẵn có (`po-ba-prototype.md`, `generation-rules.md`, `styling.md`), có literal chứng minh trong test | theo điều kiện load sẵn có |
| review | Profile evidence table, rules, reference matrix, plain-profile guardrails | `_refs/review/profiles-and-refs.md` | review executable code, trước khi phân loại `track_profile` |
| review | Probe discovery rules | `_refs/review/probes.md` | trước khi chạy probe |
| review | `review_context` schema, findings table/rules | `_refs/review/output-contract.md` (canonical producer schema) | trước khi dựng `review_context`/report |
| review | AI-agent review, simplification checklist | `_refs/review/context-extensions.md` | chỉ khi context tương ứng có mặt |
| design | Design plan, screen map, spec template, wireframes, PNG/provenance, editable-source rules | `_refs/design/handoff-authoring.md` | khi tạo/cập nhật durable handoff |
| explore | Stack profile rules, scanning/command discipline, code-map, doc-harvest, trace-flow, env-readonly, recovery, persona/memory read | `_refs/explore/read-actions.md` | action read-only; scanning trước write-approved |
| explore | code-map write, env write, persona/memory write + templates, summary refresh pointer | `_refs/explore/authorized-persistence.md` | chỉ `summary-refresh`/`*-write-approved` sau gate |

Giữ trong body (gate/ranh giới): Angular approval preflight (section đầu, byte-identical), eligibility, technical-prototype opt-in, frontend-architecture/Design gate, TDD, finish entrypoint; Review read-only/no-repair/persist-choice, scope order, dimension table, review mode, redaction, post-review; Design existing-design-first, ownership, path tree + path-role table, draft/approval/evidence/closure, legacy compatibility; Explore action table, authoring-repo guard, topology/ownership discovery, redaction, output invariants.

## Before/after

| Skill body | Baseline B / L | Hiện tại B / L |
| --- | ---: | ---: |
| angular | 45,361 / 498 | 23,004 / 298 |
| review | 29,321 / 457 | 19,335 / 318 |
| design | 25,595 / 484 | 18,793 / 323 |
| explore | 24,062 / 500 | 14,812 / 278 |

Đây là bytes/lines, không phải token. Communication-economy JIT aggregate 677,988 → 679,422 B:
hai scenario review nay đếm cả ba reference review bắt buộc.

## Verification

Runtime hiện tại: Node v22.22.3 (fnm), thỏa `engines` `^22.22.3 || ^24.15.0 || >=26.0.0`.
Các lần chạy trước đó trong change này dùng Node v22.14.0 của hệ thống (thấp hơn `engines`);
chúng chỉ là lịch sử và không được dùng làm evidence hiện tại.

| Command | Runtime | Kết quả |
| --- | --- | --- |
| RED `case-progressive-load` (trước khi sửa skill) | v22.14.0 | 5 PASS / 6 FAIL như dự kiến |
| `node --test test/e2e/production-readiness-contract.test.mjs` (case-progressive-load, sau hai case mới) | v22.22.3 | 13/13 PASS |
| Focused 24 suites (lệnh trong `authoring/evals/skill-body-progressive-loading.json`) | v22.22.3 | 584/584 PASS, content_stable |
| UI 4 suites `--test-reporter=tap` | v22.22.3 | 72/72 PASS |
| `node --test --test-concurrency=1 authoring/evals/uiux/evidence.test.mjs` | v22.22.3 | 6/6 PASS |
| `npm run test:e2e:repository` (trước r2, trước r3) | v22.14.0 | 800/801 rồi 801/801; lịch sử |
| Baseline `test:e2e:repository` trên HEAD sạch | v22.14.0 | 786/787; FAIL `case-design-owner-matrix` (`spawnSync git ETIMEDOUT`), rerun riêng PASS |

Verification cuối (check scripts, authoring, `test:e2e:repository` = EVIDENCE-010), convergence
và branch-ready chạy sau khi ghi tài liệu này, trên delivery fingerprint không đổi; kết quả được
ghi trong commit message và báo cáo bàn giao. NOT RUN: golden/container suites,
`check:skills:ps`, live agent/browser/provider.

## Findings không tự sửa

1. Evidence record mới bị npm-publication scan bắt nhầm (phát sinh từ refactor, cùng cơ chế bước 4); đã xử lý qua plan r2 được duyệt.
2. `communication-economy.test.mjs` dùng `BASELINE_CONTEXT_SCHEMA_PATHS` cho cả parity hiện tại lẫn baseline lịch sử; đã tách `CURRENT_CONTEXT_SCHEMA_PATHS`, baseline giữ nguyên.
3. Câu "The stack-specific table below" trong review body giữ nguyên văn (unit check) dù bảng giờ ở `profiles-and-refs.md`; câu kế tiếp trỏ đúng file.
4. Explore assertions trong `skill-pack-runner` nay tìm trên body + hai private reference của explore (literal giữ nguyên, phạm vi tìm mở rộng trong load set của skill).
5. Frontmatter plan snapshot r1 ban đầu có dòng thừa `approved_plan_hash`; đã bỏ trước handoff, hash không đổi và graph verify PASS.
6. Plan r1 liệt kê path ứng viên và thiếu invariant/row cho convergence; đã căn chỉnh bằng plan r3 được duyệt, không đổi nội dung đã giao.
7. Node hệ thống v22.14.0 không thỏa `engines`; verification hiện tại chạy bằng Node v22.22.3. Bước 4 cũng đã commit mà không có convergence receipt formal.
8. Pre-existing: git spawn timeout dưới tải trong suite dài.

## Bàn giao bước 6

Branch `codex/simplify-design-handoff`, base HEAD `b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87`.
Evidence: `authoring/evals/skill-body-progressive-loading.json` (bind r1 manifest), section bước 5
trong `VALIDATION.md`, plan r3 và tài liệu này. Commit/push theo yêu cầu user; commit hash, kết quả
verification cuối và convergence receipt nằm trong commit message và báo cáo bàn giao.
