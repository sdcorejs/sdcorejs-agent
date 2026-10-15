---
artifact_id: delivery-product-task-breakdown-mode-v1-r2
artifact_kind: execution-doc
change_ref: product-task-breakdown-mode-v1
source_spec: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
source_plan: .sdcorejs/plans/workflow/2026-10-14-14-40-product-task-breakdown-mode-r2.md
supersedes: .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-delivery.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
status: in-progress
---

# Delivery r2 — Mode task-breakdown của sdcorejs-product

## Trạng thái
- Nhánh `feat/product-task-breakdown-mode`, tạo từ `codex/simplify-design-handoff@4703643` (D-015). Chưa commit.
- Plan r2 (`sha256:v1:7ed54d2042a42e280f2fc1cb6ea5a650344e25b1fce84847499f94ac4313d069`) thay plan r1. TASK-001..020 giữ kết quả của delivery r1. TASK-022..026 đã làm.
- TASK-021 (lần chạy thật trên Claude Code, VAL-004: AC-002, AC-004, AC-011, AC-016, A-004) chưa chạy: cần người dùng.

## Artifact quản trị (TASK-022..025)
| Task | File | Kết quả |
|---|---|---|
| TASK-022 | `.sdcorejs/summary.md` | Thêm lệnh `npm run test:e2e:task-breakdown` và quy ước project workspace; tính lại fingerprint. `assembleProjectContext` trả `fresh`, kiểm lại sau khi tạo record mới vẫn `fresh`. |
| TASK-023 | `authoring/evals/uiux/evidence.test.mjs` | Record `audit-findings-repair.json` chuyển sang history đọc tại `4703643` (assert bất biến, mutation đọc qua `auditRead`). Thêm `validateTaskBreakdownContinuation` và 2 test `case-task-breakdown-evidence-continuation`. |
| TASK-024 | `authoring/evals/product-task-breakdown-mode.json` | Ghi từ lần chạy thật của lệnh tập trung: 93/93 pass, exit 0, manifest 256 file, `content_stable: true`. `live_agent` và `visual` là `NOT RUN`, `tokens: null`, `provider_calls: 0`. |
| TASK-025 | `VALIDATION.md` | Thêm mục "Product task-breakdown mode — current change (2026-10-14)": base HEAD, hash plan r2, ghi chú history, bảng RED -> GREEN, bảng economy 10 dòng và giải thích phần tăng JIT. |

## Evidence RED -> GREEN (Node 22.22.3)
| Task | Lệnh | RED | GREEN |
|---|---|---|---|
| TASK-023 | `node --test authoring/evals/uiux/evidence.test.mjs` | 8/10 pass; #9, #10 lỗi `ENOENT` (record chưa có) | 10/10 pass |
| TASK-024 | `node --test --test-concurrency=1 --test-reporter=tap` trên `product-task-breakdown-contract`, `harness-behavioral-sentinel`, `artifact-path-convention`, `skill-pack-runner` | không áp dụng (lệnh ghi evidence) | 93/93 pass, có đủ 14 case `case-task-breakdown-*` |

Lỗi trung gian: lần ghi record đầu chạy trước TASK-025. Manifest kế thừa `VALIDATION.md` từ manifest của record audit, nên khi TASK-025 sửa `VALIDATION.md` thì record bị stale (`current continuation is stale: VALIDATION.md`). Đã ghi lại record sau TASK-025, rồi chạy lại evidence test: 10/10 pass.

## Kiểm tra rộng (chạy lại sau TASK-025)
- `npm run check:skills`: in sync (mọi mirror và 5 harness manifest).
- `npm run check:text-hygiene`: passed (1466 file).
- `npm run check:executable-references`: valid (10 file).
- `node --test authoring/evals/uiux/evidence.test.mjs`: 10/10 pass.
- `npm run test:e2e:repository`: 903/903 pass, exit 0 (2026-10-14T08:26:33Z -> 09:08:21Z). Bốn lỗi quản trị ở delivery r1 (#103, #450, #7, #8) đã hết. #383 (flaky ở r1) pass ở lần này.

## Communication economy
- Bootstrap luôn nạp không đổi: 19,850 byte, 2,319 từ.
- JIT tổng tăng từ 689,344 lên 695,618 byte (+6,274): `_refs/shared/artifact-lifecycle.md` +588 byte trong 5 kịch bản, `_refs/harness/capability-contract.json` +3,183 byte trong kịch bản no-runtime-context, `skills/orchestration/documentation.md` +151 byte trong kịch bản delegated-test-docs.

## Lệch so với plan r2
- Thứ tự TASK-024 và TASK-025: record ghi lại sau `VALIDATION.md` (lý do ở trên). Nội dung hai task không đổi.
- Các lệch của r1 vẫn giữ: không sửa `skills/orchestration/using-skills.md` (ngân sách byte bootstrap); `sdcorejs-product` thêm `web.fetch` vào required-actions; description 512 ký tự, skill 499 dòng.

## Việc còn lại
- TASK-021: lần chạy thật cùng người dùng trên Claude Code. Ghi kết quả vào `.sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-live-run.md`.
- Finish gate: `sdcorejs-ship` (verify-before-done, branch-ready). Không commit khi chưa có yêu cầu.
