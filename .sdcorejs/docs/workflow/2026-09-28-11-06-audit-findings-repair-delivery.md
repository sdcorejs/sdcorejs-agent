---
schema_version: 1
artifact_id: execution-doc-audit-findings-repair-20260928-delivery
artifact_kind: execution-doc
change_ref: audit-findings-repair-20260928
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
source_spec: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
source_plan: .sdcorejs/plans/workflow/2026-09-28-11-06-audit-findings-repair.md
source_revision: 70c933c3fc59a98b92c03004de902bc96250fba6
commit_policy: with-change
status: delivered-pending-final-gate
---

# Audit findings repair — delivery

Change này sửa 26 finding đã xác nhận của audit bước 6 theo chuỗi spec → architecture → plan đã
duyệt. Sau đó bốn lượt review read-only kiểm tra chính phần sửa; user chọn `1` (repair trong scope
và path của plan), nên các lỗi tìm thấy được sửa qua ba vòng repair (giới hạn của repair loop), cộng
các chỗ sửa lại lỗi mà vòng 3 gây ra. Sau đó user chọn `1` lần nữa cho một vòng bổ sung vượt giới
hạn, chỉ gồm ba finding của review vòng 4 trên code cũ. Public inventory giữ 23 skill. Không thêm dependency, không sửa
`package.json`/lockfile, không sửa approved snapshot. Chưa commit, chưa push, chưa mở PR.

## Chuỗi approval

| Artifact | Hash |
| --- | --- |
| spec | `sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892` |
| architecture | `sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb` |
| plan (23 task, 5 phase) | `sha256:v1:e731b03d8f72e530d4f71d665838fc3e51e1f226e6ce07a3f3fbe54e7774a480` |

Finish policy của plan: simplify `skip`, review `review-only`; phase bắt buộc baseline, review,
verify, branch-ready. Các vòng repair sau review chạy theo lựa chọn explicit `1` của user, không mở
rộng path.

## Thay đổi theo kiến trúc

| Quyết định | Nội dung đã giao | File chính |
| --- | --- | --- |
| A1 | Observer hai lớp: lớp nội dung cho file tracked và untracked không bị ignore; lớp metadata `lstat` (kind, mode, size, mtime) cho file bị ignore, symlink/junction và nested repository. Fingerprint gồm cả hai lớp. | `_refs/shared/repository-observation.mjs` |
| A2 | `volatile_paths` trong finish policy và ledger theo root/change; chỉ host window (`command`, `dispatch`, `hook`, `apply`, `rollback`) được đổi path volatile. | `repository-observation.mjs`, `repository-evidence.mjs`, `ui-review-contract.mjs` |
| A3 | Next action của finish mang `phase`, `intent` (`produce`/`refresh`) và `owner`; host ghi receipt tại `phase_receipts[phase]`. | `_refs/shared/finish-gate.mjs`, `finish-gate.md` |
| A4 | Trạng thái simplify lấy từ host (session registry và bản ghi dispatch), không từ payload. | `finish-gate.mjs`, `simplify-contract.mjs` |
| A5 | Lựa chọn cấp authority cần decision đúng gate/scope/revision; câu trả lời mơ hồ không được tái dùng. | `_refs/harness/runtime-policy.mjs`, `user-choice-prompt.md` |
| A6 | Analyze không chép claim của caller; `git diff --check` chỉ xét path của pass; rollback theo phạm vi pass. | `_refs/simplify/repository-evidence.mjs` |
| A7 | Host runner canonical một process; consumer tự tính lại từ Git và nội dung hiện tại; `beginSimplify`/`recordSimplify`; anchor lấy trước dispatch đầu tiên; cap 2 pass/8 file/20 hunk tính cho cả chain; `createFinishSimplifyVerifier`. | `_refs/simplify/host-runner.mjs`, `repository-observation.mjs` |
| B1–B5 | UI applicability (review context thường là NOT APPLICABLE), receipt FAIL cho lần chạy hoàn tất nhưng fail, luật claim đóng (D-009), gate canonical, Design không baseline cho greenfield. | `ui-review-contract.mjs`, `ui-review.md`, `test-ui-evidence.md`, `design-handoff.mjs`, `design-verification.mjs` |
| C1–C2 | Pointer load của skill (Angular styling, explore scan, review reference) và loader artifact canonical `parseApprovedArtifactText`. | `skills/**`, `_refs/shared/approved-artifact.mjs` |

Sau các lượt review read-only, phần sửa được bổ sung (chi tiết từng finding và case trong
`VALIDATION.md`):

- Vòng 1 (13 finding): verifier finish canonical tự dẫn xuất step/scope/ownership; ownership cho
  file chưa có trong HEAD; cap và anchor theo cả chain; runner rollback khi fail sau Apply; so sánh
  với blob HEAD đã qua filter; consumer xử lý đúng evidence stale/null-context/fingerprint; lexicon
  "no failures observed" là claim; kiểm import oracle chặt hơn; direct-fix Analyze qua runner;
  rollback kiểm oracle closure và chạy trong volatile window; repair chỉ nhận FAIL của finding
  đang sửa; `simplify_outcome` từ host; metadata size/mtime cho nested `.git` và link.
- Vòng 2 (8 finding): rollback của runner chỉ khôi phục byte do chính pass ghi, gặp thay đổi đồng
  thời thì chặn và không ghi; receipt `reverted` phải có before = after, outcome theo composite
  diff; pass session đã hoàn tất là host state, `skip` không che được pass đã verify, có session
  thì không route sang runner; disclaimer chỉ cho phép trợ động từ giữa phủ định và động từ hoàn
  tất, thêm none/nothing/zero/never; window luôn đóng khi capture lỗi; allowlist built-in thuần
  cho oracle; citation FAIL lấy từ finding đã quan sát; owner simplify lấy từ host evidence.
- Vòng 3 (7 finding LOW, lần repair cuối của loop): specifier import của oracle không được chứa
  `%`, `?`, `#`, `\` và file Node resolve phải trùng file đã kiểm; repair chỉ dùng assessment mà
  review trước đó đã ghi nhận trong cùng host runtime; receipt repair không che được pass simplify
  đã verify mà thiếu proof; disclaimer cho phép manner adverb trong danh sách đóng
  `UI_DISCLAIMER_ADVERBS`; oracle có escape `\u`/`\x` là untrusted; receipt của rollback bị từ chối
  giữ `pass_paths` và hash, nêu mọi path xung đột; outcome của session theo composite diff.
- Review vòng 4 tìm ra lỗi trong chính thay đổi vòng 3, đã sửa kèm regression chạy RED trước: kiểm
  tra assessment đã ghi nhận làm fail một test repair cũ chưa retarget và bị lách khi gọi lại lần hai
  (nay kiểm trước khi evaluate, repair không bao giờ ghi assessment); quy tắc inline code che outcome
  word, nối được disclaimer giả và chặn `` `NOT RUN` `` (nay inline code chỉ bị bỏ qua cho mẫu
  negated finding).
- Vòng bổ sung (user duyệt, vượt giới hạn loop) cho ba finding vòng 4 trên code cũ: closure của
  oracle chỉ nhận file ES module `.mjs` và kiểm tracking/HEAD bằng literal Git pathspec, nên tên có
  ngoặc vuông không còn là glob và helper CommonJS không vào được closure; token `setEngine` bị chặn;
  receipt của rollback bị từ chối giữ cả lý do fail postflight đã kích hoạt rollback.

## Công bố

1. Sửa setup test, ý định test giữ nguyên:
   - test ship mới đọc blocker tại `result.stages.ready_to_ship.blockers`;
   - test UI claims dùng `assessment_id` mới cho mỗi verdict để không bị guard stale-assessment che;
   - test drift sửa nội dung trước `start()` để không bị guard read-only che (mutation phát hiện);
   - fixture oracle-imports cài một package untracked trong `node_modules` và thêm control, vì lần
     RED đầu pass chỉ do package không resolve được;
   - fixture consumer-window tạo sẵn `build/.keep`;
   - `repairRunRunner` nâng timeout spawn từ 120 s lên 600 s và ném `result.error`, vì lần RED đầu
     của `case-repair-rollback-conflict` bị timeout trên máy chậm;
   - `case-repair-session-outcome-composite` đặt hunk của pass 2 theo tọa độ file hiện tại (3 dòng),
     vì lần RED đầu bị chặn ở preflight với `outside user hunk scope`.

   Lỗi của chính tôi được suite phát hiện: câu mới trong `skills/shared/workflow/review.md` từng chèn
   giữa một đoạn baseline, làm fail `case-progressive-load-canonical-owner` ở lần chạy record đầu;
   nay câu đó là đoạn riêng và đoạn baseline giữ nguyên văn.
2. Assertion cũ được retarget theo contract mới, không nới: next action sau khi ghi là `baseline`
   với `intent: refresh` (thay cho `reverify`); case link không quan sát được nay giấu thư mục `.git`
   (link đã là metadata quan sát được); ba test UI dựng lại assert đúng guard; input của verifier là
   `anchor`; repair truyền finding đang sửa; bốn test repair UI (`case-repair-failing-receipt`,
   `case-repair-repair-fail-scope`, `case-repair-repair-finding-binding` và test cũ `current
   conformance failure remains repairable only through existing owner authority`) nay chạy review
   ghi nhận assessment trước khi repair dùng nó. Fixture finish/UI/runner thêm tùy chọn `setup`,
   `planBody`, `runtime`, `planExtras`, `extraFiles`; runner giả báo cờ `interrupted`/`timed_out`.
3. Path: mọi file đổi nằm trong `allowed_paths`. Hai doc ngoài `allowed_paths`
   (`_refs/review/context-extensions.md`, `_refs/orchestration/tail/repair-loop.md`) đã lỡ sửa ở vòng 2
   rồi hoàn tác ngay; `git diff` của hai file rỗng. Một số file được sửa ngoài task owner ban đầu
   nhưng vẫn trong `allowed_paths` (các file của vòng repair). Path trong plan không cần sửa:
   `_refs/orchestration/execution-contract.mjs`, `_refs/orchestration/parallel-protocol.mjs`,
   `_refs/angular/execution-contract.mjs`, `_refs/nextjs/execution-contract.mjs`,
   `test/e2e/support/simplify-contract-fixture.mjs`, `test/e2e/communication-economy.test.mjs`,
   `test/e2e/explore-topology.test.mjs`, `test/e2e/simplify-skill-contract.test.mjs`,
   `test/e2e/uiux-knowledge.test.mjs`, `test/e2e/uiux-review-regression.test.mjs`, các file
   `sdcorejs-harness.json` và `.cursor/rules/sdcorejs-agent.mdc` (sync không đổi nội dung).
4. Lựa chọn cài đặt: outcome của chain khi không có diff là `reverted` nếu pass cuối bị revert, ngược
   lại `unchanged` (reviewer vòng 3 xác nhận chọn pass cuối là hợp lý). `restore` vẫn được arm trước
   `applyEdits`, vì so byte trước khi ghi làm cho ghi dở hoặc bị từ chối đều an toàn. Manner adverb
   là danh sách đóng (không mở cho mọi từ `-ly`, để "not correctly rendered" vẫn là claim). Specifier
   oracle được kiểm hai lớp (ký tự cấm và so path Node resolve). Ở vòng bổ sung, closure oracle chỉ
   nhận `.mjs` (oracle `.js`/`.cjs` giờ chỉ được Analyze) và chặn token `setEngine` thay vì bỏ
   `node:crypto` khỏi allowlist, để oracle vẫn băm được nội dung. Outcome session chỉ nâng lên
   `simplified` khi còn diff; doc ghi đúng như vậy. Doc của quy tắc owner simplify chỉ thêm vào
   `skills/shared/workflow/review.md`; phía repair chỉ có comment trong code vì doc repair nằm ngoài
   `allowed_paths`.
5. Giới hạn và finding còn mở (đã ghi trong `VALIDATION.md`), cần user quyết nếu muốn đóng tiếp:
   - quét nguồn oracle là heuristic, không phải sandbox; truy cập tính toán (ví dụ ghép tên property)
     vẫn tới được Function constructor; đóng hẳn cần chạy oracle trong process riêng;
   - lexicon claim là lint: còn nhận một số câu phủ định kết quả ("Keyboard traps were never
     observed", "Found no keyboard traps") và còn chặn một số câu nguồn hợp lệ ("no `:focus-visible`
     rule found", "confirm no focus trap is detected"); đổi cân bằng này là quyết định policy;
   - rollback so byte trước khi ghi và không khóa file;
   - doc repair-loop (ngoài `allowed_paths`) vẫn chỉ mô tả session path;
   - chưa kiểm chứng: reviewer vòng 4 nghi current-diff boundary trong
     `_refs/simplify/repository-evidence.mjs` cũng đọc path có ngoặc vuông (ví dụ `app/[slug]/page.tsx`)
     như Git glob; phần này có từ trước change, chưa probe và không sửa.

   Chỉ window của UI có regression riêng; window rollback và consumer dùng cùng pattern.

## Verification

Runtime: Node v22.22.3 (fnm), thỏa `engines`. Mọi negative control chạy trong bản sao sandbox ngoài
repo; repo không bị ghi trong lúc đó.

| Lệnh / kiểm tra | Kết quả |
| --- | --- |
| RED các regression gốc trên 70c933c | như `VALIDATION.md` (mọi case gốc fail trước khi sửa, trừ ST-3 là control schema) |
| RED các vòng review | vòng 1: 17 case fail; vòng 2: 9 case fail (hai case chạy lại RED trong sandbox); vòng 3: 7 case fail; vòng 4: 2 case fail và test cũ chưa retarget fail; vòng bổ sung: 3 case fail |
| GREEN theo vòng | vòng 2: 16/16; vòng 3: 20/20; vòng 4: 9/9; vòng bổ sung: 14/14 |
| Negative control (gỡ từng guard) | vòng 1: 4/4 và UR-5 3/3; vòng 2: 5/5; vòng bổ sung: guard `setEngine` 1/1 làm regression fail |
| Lexicon qua `validateUiReviewFinding` | 34/34 ca đúng kỳ vọng sau sửa; các ca mới fail trên source chưa sửa |
| Record builder trên nội dung cuối (`authoring/evals/audit-findings-repair.json`) | focused 240/240, UI 177/177, `content_stable`, fingerprint khớp; record được ghi |
| `npm run test:e2e:repository` trên nội dung trước vòng bổ sung | 879/879 (lịch sử; lần chạy cuối nằm trong báo cáo bàn giao) |
| `sync:skills`, `check:skills`, `check:text-hygiene`, `check:executable-references`, `git diff --check` | PASS |

Lần chạy record thứ 4 pass (238/238, 177/177) và ghi record cho nội dung trước vòng bổ sung; record đó
được thay bằng lần chạy cuối ở trên. Ba lần chạy đầu không ghi record:
- lần 1: `case-progressive-load-canonical-owner` fail vì lỗi review.md ở trên (đã sửa), và
  `case-repair-claim-lexicon-negations` fail sau 1,227 s khi máy tải nặng; bản sao chẩn đoán chạy
  riêng cho cả 6 limitation `reviewed`, không blocker;
- lần 2: `case-simplify-hardening-ac-010` fail với `repository observation failed: git rev-parse`
  sau 1,520 s; chạy riêng pass trong 27 s;
- lần 3: 9 test simplify-protected fail cùng lỗi `repository observation failed: git …` (mỗi test
  chạy 6–80 phút).

Timeout 30 s của lệnh git trong observer có từ HEAD và không đổi. Trong các lần đó máy có lúc chạy
build/test Angular của project khác, và `TGitCache` (TortoiseGit) liên tục dùng CPU (đo được 118
CPU-giây trong 10 phút). Log các lần đầu nằm trong scratch (`record-run-*.attempt*.txt`).

`node authoring/evals/run-deterministic.mjs` và `npm run test:e2e:repository` chạy sau khi ghi tài
liệu này, trên nội dung giao cuối; kết quả, verify-before-done và branch-ready nằm trong báo cáo bàn
giao.

## NOT RUN

- Live agent, model/provider, browser thật, repo sản phẩm thật.
- Golden/container suites, `check:skills:ps`.
- Symlink POSIX (Windows chỉ kiểm junction và hard link).
- Review độc lập cho các chỗ sửa sau review vòng 4 và cho vòng bổ sung.

## Bàn giao

Branch `codex/simplify-design-handoff`, base HEAD `70c933c3fc59a98b92c03004de902bc96250fba6`.
Evidence: `authoring/evals/audit-findings-repair.json`, section "Audit findings repair — current
change (2026-09-28)" trong `VALIDATION.md`, plan đã duyệt và tài liệu này. Commit/push chỉ chạy khi
user yêu cầu explicit.
