---
schema_version: 1
artifact_id: handoff:audit-findings-repair-20260928
artifact_kind: handoff
change_ref: audit-findings-repair-20260928
source_spec: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
source_plan: .sdcorejs/plans/workflow/2026-09-28-11-06-audit-findings-repair.md
commit_policy: with-change
owner: sdcorejs-execute-plan
status: open
---

# Handoff - Audit findings repair (bước 6)

Note chuyển giao để tiếp tục trên máy khác, trong context window mới. Đọc note này trước; chi
tiết đầy đủ nằm trong delivery doc và `VALIDATION.md`.

## Trạng thái

- Branch `codex/simplify-design-handoff`, base `70c933c3fc59a98b92c03004de902bc96250fba6`. Commit
  chứa note này là commit mới nhất của change (`git log -1`) và đã được push lên `origin`.
- Chuỗi approval: spec `sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892`
  → architecture `sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb`
  → plan `sha256:v1:e731b03d8f72e530d4f71d665838fc3e51e1f226e6ce07a3f3fbe54e7774a480`.
- Plan 23 task đã thực hiện xong. Sau bốn lượt review read-only có năm nhóm sửa: R1–R3 trong
  repair loop (user chọn `1`), R4 sửa lỗi do R3 gây ra, R5 là vòng bổ sung user duyệt vượt giới
  hạn loop.
- Không có việc đang dở, không có approval đang chờ, chưa có PR.

## Evidence trên nội dung đã commit

- `npm run test:e2e:repository`: 881/881 ở lần chạy lại; lần chạy đầu fail 2 test vì git timeout
  khi máy tải nặng, hai test đó chạy riêng đều pass.
- Record `authoring/evals/audit-findings-repair.json`: focused 240/240, UI 177/177, nội dung ổn
  định trong lúc chạy.
- `node authoring/evals/run-deterministic.mjs`: PASS. `check:skills`, text hygiene, executable
  references, `git diff --check`: PASS. Ba approved snapshot vẫn verify.
- Live agent, model/provider, browser thật, repo sản phẩm thật: NOT RUN.
- Log chẩn đoán, probe của reviewer và bản sao sandbox nằm trong scratch của máy cũ, không được
  commit.

## Đọc gì trước

1. `.sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-delivery.md`: thay đổi theo kiến
   trúc, công bố (test setup, retarget, path, lựa chọn cài đặt), verification.
2. `VALIDATION.md`, section "Audit findings repair — current change (2026-09-28)": bảng finding →
   regression case và "Residual limits".
3. Plan snapshot `.sdcorejs/plans/workflow/2026-09-28-11-06-audit-findings-repair.md` khi cần path
   hoặc task.

## Việc còn mở

Chưa có authority cho các mục dưới đây; mỗi mục cần user chọn và một spec/plan (hoặc repair
authority) mới trước khi sửa:

- Độ chặt của lexicon claim trong `_refs/shared/ui-review-contract.mjs`: còn câu phủ định kết quả lọt
  qua và câu nguồn hợp lệ bị chặn nhầm; đổi cân bằng là quyết định policy.
- Chạy oracle trong process riêng (`_refs/simplify/host-runner.mjs`): bước quét source hiện chỉ là
  heuristic, truy cập tính toán vẫn tới được Function constructor.
- Chưa kiểm chứng: current-diff boundary trong `_refs/simplify/repository-evidence.mjs` có thể đọc
  path có ngoặc vuông (ví dụ `app/[slug]/page.tsx`) như Git glob.
- Doc repair-loop (`skills/orchestration/repair-loop.md`, `_refs/orchestration/tail/repair-loop.md`)
  nằm ngoài allowed paths của plan này và vẫn chỉ mô tả session path.
- Rollback của runner so byte trước khi ghi nhưng không khóa file.
- Các chỗ sửa sau review vòng 4, gồm vòng bổ sung, chưa được review độc lập.

## Lưu ý cho change tiếp theo

- `case-repair-evidence-continuation` kiểm hash nội dung hiện tại của mọi path trong manifest của
  record. Change tiếp theo sửa bất kỳ path nào trong manifest sẽ làm test này fail. Khi đó chuyển
  record này sang kiểm theo lịch sử tại commit của change này (như bước 6 đã làm cho record bước 5)
  và tạo record mới cho change đó.
- Dùng Node thỏa `engines` (`^22.22.3 || ^24.15.0 || >=26.0.0`). Máy cũ có Node hệ thống thấp hơn nên
  phải dùng Node v22.22.3 qua fnm.
- Suite dài trên Windows có thể fail với `repository observation failed: git …` hoặc
  `spawnSync git ETIMEDOUT` khi máy tải nặng (timeout git 30 s trong observer; TortoiseGit và build
  của project khác làm chậm). Chạy riêng test đó để phân loại, giữ log, rồi chạy lại cả lệnh khi máy
  rảnh; không nới timeout và không sửa test để che.

## Tiếp tục trên máy khác

```bash
git fetch origin
git switch codex/simplify-design-handoff
git pull --ff-only
npm ci
npm run check:skills
node --test --test-concurrency=1 authoring/evals/uiux/evidence.test.mjs
```

`npm ci` chỉ cần khi máy chưa có `node_modules`; nó cài đúng theo lockfile, không thêm dependency.
Bước tiếp theo: chọn một mục trong "Việc còn mở" để mở brainstorming/spec, hoặc tạo PR bằng
`sdcorejs-git` (mode `pr`) khi muốn merge.
