---
artifact_id: draft-architecture-audit-findings-repair-20260928-r1
artifact_kind: execution-doc
change_ref: audit-findings-repair-20260928
source_spec: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-architecture
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 70c933c3fc59a98b92c03004de902bc96250fba6
status: draft
revision: 4
---

# Architecture — Repair các finding của audit bước 6 — r1

## Parent và authority
Approved spec: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
Approval hash: sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892
User duyệt spec bằng reply 1, đúng draft fingerprint sha256:5501afd5be6f009cef255c16a9fd6e33ace0da55caaa32c399d0fb4306d2d0b0; lần duyệt này chốt cả D-007 và D-008. Architecture này là draft: không duyệt plan, không cấp quyền sửa implementation. Repo standalone. Resolver ownership dùng nhánh integration-owner với topology một repo; đó chỉ là adapter API, không khai cross-repository change. Bản nháp 4 sửa theo ba lượt review read-only riêng (xem mục cuối). Frontmatter `revision` đếm lần sửa nháp; "r1" trong tiêu đề và `change_control.revision: 1` là revision approved đầu tiên của artifact.

## Quyết định kiến trúc
Chỉ ghi các quyết định mà các unit độc lập có thể hiểu khác nhau. Thứ tự file và task thuộc plan.

### A1. Observer hai lớp: nội dung và metadata
- **Lớp nội dung:** file tracked (theo index) và untracked chưa ignore. Host đọc bytes và hash sha256. Cap 128 MiB và 100 000 entry chỉ áp dụng lớp này.
- **Lớp metadata:** mọi entry khác dưới root, trừ `.git` gốc:
  - file/thư mục bị ignore;
  - symlink/junction ở bất kỳ đâu, kể cả file tracked kiểu symlink;
  - worktree của nested repository: host vẫn đi vào worktree này nhưng chỉ `lstat`; thư mục `.git` lồng bên trong là một entry `nested-repository` và không được descend.
  Mỗi entry chỉ ghi `lstat`: kind, mode, size, mtime; symlink thêm đích `readlink`. Không đọc nội dung, không đi theo link. Cap riêng là 1 000 000 entry; vượt cap là observation incomplete và chặn.
- Snapshot giữ đủ map của cả hai lớp. Mọi thay đổi metadata là write: xuất hiện, biến mất, size, mtime, mode, kind, đích link. Ignored output và nested worktree vẫn được phát hiện.
- **Kiểm tra symlink tường minh:** kiểm ở mọi lần capture. Các path sau, cùng mọi thư mục cha trong root, phải không phải symlink và realpath phải nằm trong root; nếu không thì chặn (AC-003):
  - finish scope;
  - hook paths và hook inputs;
  - simplify scope;
  - scope đầu vào của command;
  - path đầu vào/đầu ra của UI.
  Symlink ngoài các path này chỉ là entry metadata.
- Mọi caller (finish runtime, simplify session, host runner, UI runtime) dùng chung `captureRepository`. Không caller nào tự walk filesystem.

### A2. Volatile path và stable fingerprint
- **Nguồn (một danh sách duy nhất cho mỗi change):** `volatile_paths` chỉ đến từ fence `finish-policy` của approved plan, hoặc từ `policy` của direct fix (hash của policy nằm trong decision `finish:policy`, nên prompt policy phải hiện `volatile_paths`). Payload runtime không tự thêm được.
  - Host runner và UI runtime dùng đúng danh sách đó từ cùng plan đã verify; `simplify-host-policy` không khai danh sách riêng.
  - Review UI trực tiếp không có plan thì không có volatile path; output check giữ mức chặt hiện tại.
- **Ledger volatile cấp host:** mỗi `(root, change)` có một ledger trong process host, nằm trong `repository-observation.mjs`.
  - Ledger giữ danh sách đã khai và trạng thái volatile đã ghi.
  - Mọi cửa sổ lệnh đều đăng ký bắt đầu/kết thúc với ledger: finish `run`, simplify `runVerification` (kể cả session bên trong runner, trong process của runner), UI `run_command`, và cửa sổ dispatch runner của finish.
  - Kiểm drift luôn so với ledger, không so với trạng thái riêng của từng runtime.
  - Hai runtime khai danh sách khác nhau cho cùng `(root, change)` thì chặn.
  - Lệnh chạy ở process khác mà không đăng ký (ngoài dispatch runner đã đăng ký) sẽ gây drift và bị chặn. Điều này được tài liệu hóa.
- **Grammar:** exact path hoặc `dir/**`. Grammar được kiểm lại ở mọi lần capture. Pattern chỉ được khớp entry lớp metadata (bị ignore); khớp file tracked hoặc untracked chưa ignore thì policy invalid. Volatile path không được giao với finish scope, hook paths/inputs, simplify scope, edit set hay command scope.
- **Stable fingerprint:** `stable_fingerprint` là fingerprint loại entry volatile. Mọi kiểm tra bằng/currency đều dùng nó: `content_stable`, currency của verify/branch-ready, `verifyCommands` của simplify, kiểm tra write của UI.
- **Cửa sổ được đổi volatile:**
  - cửa sổ lệnh kiểm chứng: `runtime.run(phase)` của finish, verification command của simplify session, `run_command` của UI;
  - cửa sổ dispatch runner (`beginSimplify` tới `recordSimplify`, xem A7) cũng được tính như cửa sổ lệnh đối với entry volatile. Trong process của mình, runner vẫn cấm đổi volatile trong `applyEdits` và rollback.
- **Cửa sổ cấm đổi volatile:** hook, `applyEdits`, rollback. Có thay đổi volatile trong các cửa sổ này thì chặn. Kiểm chứng cần chạy trong lúc làm hook (ví dụ test của TDD) phải đi qua một cửa sổ lệnh của host, không chạy trực tiếp trong cửa sổ hook.
- **Ngoài mọi cửa sổ (theo spec: volatile chỉ được miễn cho độ ổn định của lệnh):** ledger ghi trạng thái volatile sau mỗi cửa sổ đã đăng ký. Ở đầu cửa sổ kế tiếp và ở mỗi lần observe của bất kỳ runtime nào, trạng thái volatile phải bằng trạng thái đã ghi (hoặc snapshot đầu, nếu chưa có cửa sổ nào). Lệch thì chặn với lỗi "volatile path changed outside a host command window". Mọi path ngoài danh sách volatile vẫn được phát hiện đầy đủ như A1.

### A3. next_action của finish: `phase` là khóa receipt
- `next_actions[i].phase` là khóa receipt duy nhất. Host ghi đúng một receipt vào `phase_receipts[phase]`:
  - phase command: dùng `runtime.run(phase)`;
  - hook: dùng `runtime.recordHook(phase, before)`;
  - simplify, đường runner: dùng `runtime.recordSimplify` (A7);
  - simplify, đường session: giữ `runtime.run('simplify')` như hiện nay.
  Bỏ `evidence_phase`.
- **Owner:** một bảng tĩnh cho các phase canonical (thêm `unit-review-a` và `unit-review-b` cho `sdcorejs-review`). Hook dùng owner khai trong policy. Phase không có owner thì chặn; bỏ default `sdcorejs-documentation`.
- **`intent: produce | refresh`:**
  - refresh phase command: chỉ chạy lại kiểm chứng, không ghi source;
  - refresh hook: owner chạy lại hook, chỉ ghi trong `hook.paths`;
  - refresh `repair`: chỉ chạy lại lệnh kiểm chứng repair, không sửa code lần nữa.
- Receipt invalid hoặc stale trả blocker có tên phase cần chạy lại.
- Các entrypoint đổi cùng change: `completeExecution`, `completeAngularExecution`, `completeNextjsExecution`, `completeDelegatedUnit` (đường worker stage A/B) và `finish-gate.md`. `next_actions` chỉ tồn tại ở runtime nên không cần migration.

### A4. Trạng thái simplify lấy từ host, không từ payload
- **Nguồn sự thật:** lựa chọn scoped đã resolve, cộng trạng thái simplify do host nắm:
  - session trong process, được tra theo `(root, change)` qua truy vấn chỉ đọc của registry trong `repository-evidence.mjs`;
  - bản ghi dispatch và receipt chain mà host finish tự giữ khi chạy runner (A7).
  Bỏ `simplify_context` hoặc runtime khỏi payload không che được pass đang pending.
- Pass đã dispatch hoặc đã có grant mà chưa `passed` và chưa reverted (pending, failed, not-run, hoặc runner crash không có receipt) thì blocked, kể cả khi net diff rỗng.
- Mặc định `skip` vì không eligible chỉ áp dụng khi chưa có lựa chọn nào được resolve và host không có session hay dispatch nào cho change này.
- **Currency tách hai loại:**
  - `analysis_current`: Analyze read-only đã hoàn tất trên nội dung hiện tại;
  - `verification_current`: Apply đã verify trên nội dung hiện tại.
  Finish nhận `analysis_current` cho lựa chọn `analyze` và `verification_current` cho `apply`.
- `tail-complete` báo:
  - `simplify`: giá trị đã ghi;
  - `simplify_source`: `explicit | verified-plan | not-eligible`;
  - `simplify_outcome`: kết quả thực của ledger, `simplified | unchanged | reverted | analyzed | skipped`.

### A5. Lựa chọn cấp authority không bao giờ tự resolve
- `selectInteraction` và `normalizeChoiceResponse` đọc gate từ decision object; tham số `gate` là tùy chọn.
- Lựa chọn cấp authority gồm:
  - approval;
  - option có value `apply` hoặc `apply-current-diff`;
  - option có value dạng policy hash `sha256:<64 hex>`, tức binding của `finish:policy`; value này nhận ra được kể cả khi caller không truyền gate;
  - gate trong danh sách canonical (khởi đầu là `finish:policy`).
  Với các lựa chọn này: không auto-select khi chỉ có một option, không nhận "you decide" hay recommended. Choice thường giữ hành vi cũ, ví dụ auto-select `sequential` khi chỉ có một option.
- `resolveAction` cho `user.choose` và `user.approve` nhận `failed_surfaces`. Native surface đã lỗi cho decision này thì trả fallback Markdown, không trả lại native.

### A6. Evidence simplify trung thực và write boundary an toàn
- **Analyze:** host thay mọi status do caller khai bằng giá trị chưa chạy của schema: `git_diff_check: not-run`, preserved surfaces `pending`, behavior `not-verified`. Evidence ref phải resolve được trong session. Kết quả chỉ mang `analysis_current` (A4).
- **Path của pass:** hợp của eligible files của pass và các path trong edit set.
- **Diff check:** chỉ xét các dòng pass thêm vào path của pass, so với bytes checkpoint, theo quy tắc whitespace/eol của repo (`core.whitespace`, `.gitattributes`). Phải phân biệt exit status "có khác biệt" với "có lỗi whitespace". File CRLF không bị báo nhầm và có regression riêng. Whitespace có sẵn ngoài path của pass không ảnh hưởng.
- **Rollback theo scope (D-005):** hợp lệ khi mọi path của pass trở về đúng bytes checkpoint. Sau đó host chạy lại verification và postflight để ghi pass là reverted.
  - Thay đổi đồng thời ngoài path của pass: liệt kê trong `concurrent_changes`, giữ nguyên, bắt baseline mới cho pass sau.
  - Thay đổi đồng thời chạm path của pass, protected path, input của verification command (scope khai trong `simplify-host-policy` hoặc trong command spec của session), hoặc import closure của oracle: chặn.
  - Postflight thường (không rollback) giữ nguyên mức chặt hiện tại.
- **Write target:** link count phải bằng 1, kiểm ngay trước mỗi write của host (`applyEdits`, rollback). Đường đọc không đổi.

### A7. Simplify host runner canonical, consumer tự tính lại
- **Vị trí:** `_refs/simplify/host-runner.mjs`, CLI chỉ dùng Node built-in, được mirror cùng `_refs`. Một lần gọi chạy trọn một pass trong một process:
  1. tạo session;
  2. bắt baseline;
  3. chạy verification before;
  4. preflight;
  5. `applyEdits` (chỉ với apply);
  6. chạy verification after;
  7. postflight;
  8. nếu fail thì rollback theo scope, chạy lại verification và postflight.
  Runner dùng lại session hiện có, không tái hiện logic kiểm tra.
- **Hai input tách biệt.**
  - `--authority` do host điều phối cấp (integration owner hoặc finish host), gồm:
    - identity của approved plan: path và `approval_hash`, lấy từ approved plan handoff hoặc `load_plan` đã verify;
    - path và hash của parents;
    - `step_id`;
    - scope simplify đã resolve;
    - ownership của hunk (xem mục "Ownership của hunk" bên dưới);
    - anchor;
    - receipt chain trước đó;
    - cờ `repaired`.
  - `--request` chỉ chứa action, edit set `[{path, content}]` và scope thu hẹp (phải nằm trong scope đã resolve). Request chứa field authority thì bị từ chối.
- **Authority từ đĩa:** runner đọc plan và parents qua loader C2. Hash phải bằng `approval_hash` do host cấp, rồi graph được verify.
  - Fence `simplify-host-policy` trong plan chứa step (allowed/prohibited nằm trong metadata của plan), verification commands và oracle modules.
  - Volatile path lấy từ fence `finish-policy` của cùng plan (A2).
  - Chế độ direct fix không có `load_plan`, nên không có nguồn step: đường runner chỉ chạy Analyze.
- **Oracle:** module oracle và closure import tĩnh tương đối của nó phải tracked, không đổi so với HEAD và nằm trong root. Built-in `node:` được phép. Import package/bare khác hoặc dynamic import thì oracle bị coi là không có, và runner chỉ chạy Analyze.
- **Ownership của hunk**, dùng chung cho runner và consumer finish:
  - `workflow_hunks`: tính từ bytes before/after của các cửa sổ hook `implementation` do host quan sát, với mọi test strategy (không chỉ TDD). Muốn Apply trên mã vừa sinh thì observation runtime phải bắt đầu trước lần ghi đầu tiên, và implementation phải được ghi bằng `recordHook('implementation', before)`.
  - `user_owned_hunks`: phần đã dirty so với HEAD trong snapshot đầu của runtime.
  - Không có cửa sổ implementation được quan sát thì ownership của file dirty chưa được chứng minh, và Apply bị từ chối như hiện nay (fail-closed).
- **Anchor của before-state**, do host chọn:
  - `head`: mọi path của pass trùng HEAD khi chain bắt đầu;
  - `host-snapshot`: fingerprint và hash theo path lấy từ snapshot của host, chụp trước dispatch đầu tiên.
  Runner chặn khi nội dung hiện tại của path trong scope không khớp anchor, hoặc không khớp `after` của receipt cuối trong chain.
- **Receipt chain:** runner kiểm continuity (before của pass N+1 bằng after của pass N; pass đầu bằng anchor). Cap 2 pass / 8 file / 20 hunk tính trên cả chain cộng pass mới. `repaired` đóng chain.
- **Receipt:** runner in `simplify-host-receipt:v1` ra stdout, gồm identity, plan ref, anchor, base revision, status, pass paths, before/after sha256, commands với exit code và output digest, và blockers. Receipt chỉ là chỉ mục: không phải approved artifact, không lưu trong repo, không trường nào cấp authority. Runner không ghi Git object.
- **Consumer finish (host-snapshot):**
  1. Host gọi `runtime.beginSimplify()`. Lệnh này ghi bản ghi dispatch, chụp snapshot anchor và trả một token dùng một lần.
  2. Host spawn runner.
  3. Host gọi `runtime.recordSimplify(token, receipt | null)` để tiêu token.
  - Token chưa được tiêu, receipt `null` hoặc invalid, hay thay đổi không được receipt giải thích (kể cả khi runner crash) thì finish blocked.
  - Luật volatile cho cửa sổ này ở A2.
  - `recordSimplify` lấy step, scope và ownership của hunk từ nguồn của chính runtime: `load_plan` đã verify, decision `finish:simplify` đã resolve, và cửa sổ implementation đã quan sát. Nó không bao giờ lấy các giá trị này từ receipt hay từ `--authority`.
  - Verifier do host tiêm (option `simplify_verifier`, trỏ tới `revalidateSimplifyHostReceipt`). Runtime tự tính composite diff từ bytes snapshot của chính nó tới nội dung hiện tại. Sau đó runtime kiểm scope, protected, eligibility theo oracle, preservation, continuity của chain và cap trên diff composite, rồi ghi receipt phase kind `simplify`.
  - Kiểm chứng mới đến từ phase `reverify`, như luật hiện có.
- **Consumer trong cùng flow** (finish, review, ship, repair): trên đường runner, `evaluateSimplifyConsumer` nhận `{ observation, proof }` và đọc receipt phase `simplify` đã được host verify qua observation runtime (`readRepositorySimplify`, tương tự `readRepositoryReview`). Kết quả chỉ current khi receipt valid và scoped fingerprint còn khớp. Cách này tránh `revalidation-required` hay deadlock cho chain `host-snapshot`.
- **Consumer khác process (head):** `evaluateSimplifyConsumer` với runtime `{ host_receipt, expected_plan }`. `expected_plan` lấy từ handoff tin cậy của consumer, không từ receipt. Consumer:
  1. lấy before từ blob HEAD và after từ file hiện tại;
  2. tính lại diff composite, cap file/hunk trên diff composite, scope, protected, eligibility và preservation;
  3. chạy lại verification commands.
  Chain anchor `host-snapshot` không kiểm được ở process khác, nên kết quả là `revalidation-required`.
- **`simplify_context` theo loại host:** thêm field `host_kind: session | runner`.
  - `session` giữ nguyên schema hiện tại.
  - `runner` có ref session là `null`, và bắt buộc có `anchor` cùng `host_receipt_digest` (sha256 của receipt).
  - `validateSimplifyContext` kiểm theo từng loại.
- **Tính chất bảo mật (AC-011):**
  - Before-state luôn đến từ snapshot của host hoặc từ HEAD, không bao giờ từ receipt.
  - `--authority` không được xác thực: cùng một caller có thể truyền cả hai input. Vì vậy mọi quyết định chấp nhận dựa trên việc consumer tự tính lại. Preflight của runner chỉ bảo vệ worktree trước write sai.
  - Mọi trường của receipt chỉ để tra cứu và phải khớp kết quả consumer tự tính. Receipt bị sửa hoặc giả vì thế không có đường vượt kiểm tra.
- **Giới hạn:** pass trên file đã dirty chỉ được host đã chụp anchor chấp nhận. Consumer khác process chỉ chấp nhận chain anchor `head`.
- **completeExecution:** khi runtime không có session trong process, action Apply trả `runner: host-runner`, `source_write_allowed: false`, cùng dữ liệu authority. Runner tự preflight trong authority của plan. Đường session trong process giữ nguyên.
- **Hướng phụ thuộc:** `repository-observation.mjs` không import `_refs/simplify/**`; verifier được host tiêm. `revalidateSimplifyHostReceipt` nằm trong `repository-evidence.mjs`, được host runner và `simplify-contract.mjs` dùng; không tạo vòng import.

### B1. UI consumer chỉ áp dụng khi có obligation hoặc UI context
- `evaluateUiReviewConsumer` đánh giá khi có obligation từ bất kỳ nguồn nào (`validation_map`, approved artifacts, `source_runtime`, UI runtime), hoặc khi context là UI review (`purpose` thuộc hai purpose, hoặc có `ui_review`).
- Context review thường không bao giờ che obligation của nguồn nào. NOT APPLICABLE chỉ khi mọi nguồn đã tham chiếu đều không có obligation. Có obligation mà context là review thường thì BLOCKED, như khi thiếu payload.
- Caller giữ nguyên nguồn đang truyền. Việc chọn nguồn vẫn thuộc caller; ví dụ ship lấy `approved_artifacts` từ payload. Điều này chấp nhận được theo AC-012 và được ghi rõ. Repair một finding không phải UI, khi không có UI runtime/context, cho NOT APPLICABLE; hiện nay trường hợp này bị chặn nhầm (UR-1).

### B2. Receipt UI cho lần chạy fail đã hoàn tất
- **Kết quả runner:** `run_command` bắt buộc trả `interrupted` và `timed_out` dạng boolean; thiếu thì coi là chưa hoàn tất.
- **Hoàn tất** khi đủ bốn điều kiện:
  - exit code là số nguyên;
  - `interrupted` và `timed_out` đều false;
  - output mới: metadata của file output (mtime, inode hoặc size) hoặc nội dung đổi trong cửa sổ lệnh; một lần render lại ra đúng bytes cũ vẫn được coi là mới nhờ mtime;
  - output hợp lệ theo kind: ảnh decode được cho rendered; interaction có ít nhất một assertion, mỗi assertion có id và result PASS hoặc FAIL.
- `outcome` là PASS khi exit 0 và mọi assertion PASS; ngược lại FAIL. Crash, timeout hoặc output cũ thì không có receipt và vẫn là gap.
- Coverage thêm giá trị `FAIL`, tách khỏi gaps thành `failures`. Finding runtime gắn receipt current (PASS hoặc FAIL) của đúng target/kind.
- **Bảng chấp nhận theo phase:**
  - preflight, postflight, ship, validation-map: yêu cầu PASS; FAIL chặn với thông điệp defect;
  - repair: chấp nhận coverage FAIL làm input cho finding đang sửa, vẫn cần authority của finding, owner và scope.

### B3. Claim runtime: rule đóng cho finding source-only
- **Ràng buộc cấu trúc:** finding `evidence_kind: source` không có `evidence_ref` và không có field kết quả runtime. Trạng thái runtime chỉ đến từ coverage dựng từ receipt.
- **Rule đóng cho câu văn:** có ba danh sách canonical export một nơi, được test với nhiều dạng câu (khẳng định, quá khứ, phủ định, từ đồng nghĩa):
  - lexicon chủ đề runtime: render, interaction, keyboard, focus, tab order, hover, click, contrast, clipping, viewport, responsive, screen reader…;
  - danh sách động từ mệnh lệnh.
  - lexicon từ kết quả runtime: works, working, passes, passed, correct, correctly, fine, OK, verified, confirmed, behaves, succeeds, successful, as expected… Không gồm động từ nối như is/are, để không chặn sự kiện của source.
  Rule:
  - `uiux.verification`: mọi câu nhắc chủ đề runtime phải bắt đầu bằng một động từ mệnh lệnh của danh sách và không chứa từ kết quả runtime. "Inspect: rendered output is correct" bị từ chối.
  - `evidence`: mọi câu nhắc chủ đề runtime phải có source locator (path hoặc path:line) và không chứa từ kết quả runtime. Sự kiện của source được phép, ví dụ "src/dialog.html:12: the close control is a `<div>` with no keydown handler".
  - `limitation`: câu nhắc chủ đề runtime phải dùng marker canonical "not run"/"not verified".
  - `impact` và `required_fix`: lint cùng lexicon từ kết quả trên các câu nhắc chủ đề runtime.
  "Keyboard focus moves correctly", "Verified focus order", "Rendered fine" và "Inspect: rendered output is correct" đều bị từ chối. "Render and inspect the accessible name" hợp lệ.
  - Positive regression: finding source-only hợp lệ về accessibility và mọi fixture UI hợp lệ hiện có vẫn qua, giữ AC-012 "payload UI giữ nguyên hành vi".
- **Diễn giải AC-014, user chốt bằng reply `1` ngày 2026-09-28:**
  - Bảo đảm "bất kể cách diễn đạt" đến từ ràng buộc cấu trúc: prose không bao giờ là evidence; trạng thái runtime chỉ đến từ receipt.
  - Rule đóng theo cấu trúc câu và lexicon canonical ở trên là lớp chặn bắt buộc. Nó có test cho mọi phản ví dụ đã biết và nhiều dạng câu.
  - Câu tự do né toàn bộ lexicon không bị rule bắt, nhưng vẫn không bao giờ được tính là evidence.
  - Plan ghi diễn giải này thành decision D-009 (`explicit-user`) trong decision coverage. Không sửa approved spec.

### B4. Gate canonical
- Một hằng export duy nhất `BLOCKER | REQUIRED | ADVISORY | N/A`, phân biệt hoa/thường. Gate vẫn tùy chọn; khi có mặt mà nằm ngoài danh sách thì finding UI bị từ chối.

### B5. Design no-baseline gắn requirements đã duyệt
- Approved spec khai `design_requirements.design_baseline: { kind: none, reason }`. Plan phải khai giống hệt, theo luật hiện có.
- Handoff schema 2 thêm field tùy chọn `design_system_reuse.no_baseline: { reason, approval_ref }`. `approval_ref` là object reference chính xác `{repository_id, artifact_id, artifact_kind: spec, revision, approval_hash}` của spec đã verify. `inspected: true` nghĩa là đã khảo sát và không có baseline.
- `evidence_refs` rỗng khi và chỉ khi có `no_baseline`. `no_baseline` hợp lệ khi đủ ba điều kiện: requirements khai `none`, `approval_ref` khớp spec, không mapping nào `confirmed`. Thiếu một điều kiện thì chặn. Dự án không khai `none` vẫn phải trích source thật.
- Tài liệu: editable schema 2 chỉ html/svg; resolver trả path ledger. Test đối chiếu tài liệu với helper.

### C1. Body skill là owner của điều kiện load
- Body Angular nạp `styling.md` cho mọi action sinh mã.
- Body explore nạp scanning/command discipline cho `conventions-read` và `summary-refresh`.
- `review.md` nêu tên ref thay vì vị trí.
- Test dựng đồ thị load (body tới ref theo action) từ nguồn, kiểm mỗi rule tới được từ mọi action cần nó, và kiểm parity giữa `review_context` với field bắt buộc của consumer.

### C2. Loader approved artifact canonical, không dependency
- Export mới `readApprovedArtifactFile` và `parseApprovedArtifactText` trong `_refs/shared/approved-artifact.mjs`, chỉ dùng Node built-in. Loader:
  - đọc file trong root, không qua symlink;
  - chuẩn hóa xuống dòng; không bỏ BOM;
  - tách frontmatter;
  - parse bằng parser YAML hạn chế, chỉ đúng tập writer sinh ra: mapping, sequence, plain scalar nhiều dòng, double-quoted, null/bool/int, `[]` và `{}`;
  - fail closed với cú pháp khác.
- **Một dòng trống phân cách (D-007):** thử body nguyên văn trước. Nếu hash không khớp, body bắt đầu bằng đúng một dòng trống, và `approved_at` trước `2026-09-27T00:00:00Z`, thì thử bỏ dòng đó.
  - Mốc này bao phủ mọi snapshot bước 1–5. Snapshot mới phải khớp nguyên văn.
  - Lịch sử có cả hai quy ước, đã được probe và reviewer xác nhận: bước 1 loại dòng trống khỏi hash; ba snapshot bước 2–3 tính dòng trống vào hash.
  - `approved_at` nằm trong hash nên không đổi được.
  - Kết quả báo biến thể đã khớp. Ngoài đúng một dòng trống này không có tolerance nào khác.
  - Test giả mạo không dùng phép chèn một dòng trống vào snapshot cũ, vì phép đó vẫn verify.
- `repository_relative_path` trong metadata phải bằng path của file.
- Test so kết quả parser với devDependency `yaml` trên mọi snapshot.

### Thứ tự workstream (refinement của D-008)
A7 phụ thuộc C2, nên loader C2 là unit đầu tiên của workstream A. Thứ tự A → B → C, scope và coverage không đổi; phần còn lại của C (C1 cùng test cấu trúc) vẫn ở workstream C. Thay đổi này sửa cách chia workstream mà user đã duyệt trong D-008, nên nó được nêu rõ tại approval gate. Nếu được duyệt, plan ghi nó thành một decision record mới supersede D-008 trong decision coverage.

### Compatibility và giới hạn
- Giữ 23 public skill. Không dependency mới. Không sửa snapshot hay record cũ.
- Field mới đều tùy chọn hoặc chỉ tồn tại ở runtime. Payload thiếu field mới giữ hành vi fail-closed cũ.
- Snapshot trước bước 1 (không có hash, hoặc dùng quy ước khác như hai snapshot ngày 09-04) nằm ngoài AC-021; loader báo không verify được.
- Mục NEEDS-VERIFICATION ngoài scope. Live browser/provider: NOT RUN.

## Invariant và proof obligations
- **INV-001 — Authority fail-closed.** Proof: negative regression cho:
  - volatile write trong cửa sổ hook/apply;
  - symlink trong scope, kể cả qua thư mục cha;
  - auto-select hoặc delegated trên `finish:policy`;
  - surface native đã lỗi;
  - rollback chạm path của pass;
  - hard link;
  - request mang field authority;
  - plan do request chọn;
  - chain bị reset hoặc thiếu receipt;
  - receipt sửa/giả;
  - payload bỏ simplify context.
  Suite negative hiện có giữ nguyên.
- **INV-002 — Positive path tới được.** Proof:
  - integration trên repo này và fixture ignored/symlink/junction/nested repo;
  - host làm đúng tài liệu hội tụ tới tail-complete, kể cả khi lệnh ghi cache volatile;
  - Apply trên mã vừa sinh với cửa sổ implementation được quan sát, cho cả TDD lẫn post-hoc;
  - review/ship/repair đọc receipt `simplify` qua observation runtime;
  - review thường NOT APPLICABLE;
  - greenfield verify;
  - reachability styling.
- **INV-003 — Evidence trung thực.** Proof: regression RED trước/PASS sau cho từng finding, kèm mutation hoặc negative control; phân biệt Analyze với Apply; receipt FAIL; rule đóng B3; số assertion không giảm; parity test.
- **INV-004 — Lịch sử bất biến.** Proof: loader verify mọi snapshot bước 1–5 mà không sửa file; bytes sửa vẫn fail; snapshot mới phải khớp nguyên văn.

22 AC của approved spec được gom thành VAL-001..VAL-004 trong typed context. Architecture không đổi scope và không thêm thứ tự implementation, ngoài refinement thứ tự workstream đã nêu.

## Review và validation status
- **Parent:** graph của approved spec verify PASS. Owner và write scope kiểm bằng helper: `resolveArchitectureOwner` (nhánh integration-owner, một repo) và `validateArchitectureWriteScope` cho path draft và path approved dự kiến.
- **Typed context:** `validateArchitectureContext` chỉ còn hai blocker chờ approval là `ARCHITECTURE_PATH_INVALID` và `ARCHITECTURE_HASH_INVALID`. Không dùng placeholder hash để làm xanh.
- **Review read-only riêng**, cùng một reviewer context, chỉ đọc file:
  - Lượt 1 (draft 1): chưa sẵn sàng. Có 4 BLOCKER:
    - A7 chấp nhận receipt giả khớp mọi kiểm tra;
    - request tự chọn file authority;
    - ledger reset ở mỗi lần gọi runner;
    - B3 thu hẹp AC-014.
    Kèm 11 CONCERN và 5 NOTE. Reviewer tự chạy probe loader bằng `yaml`, xác nhận lịch sử có hai quy ước dòng trống.
  - Lượt 2 (draft 2): BLOCKER 1–3 giải quyết về thực chất; BLOCKER 4 chưa. Có 3 concern mới: drift volatile giữa các cửa sổ; consumer cùng flow với chain `host-snapshot`; hunk ownership chỉ có ở TDD. Còn residual của BLOCKER 3: token dispatch.
  - User chốt diễn giải AC-014 bằng reply `1`: bảo đảm cấu trúc cộng rule đóng theo lexicon; ghi D-009 trong plan; không sửa spec.
  - Lượt 3 (draft 3): mọi mục của lượt 2 đã giải quyết. Có 1 BLOCKER mới (cửa sổ volatile giữa nhiều runtime) và 1 CONCERN (B3 chặn nhầm sự kiện của source).
  - Lượt xác nhận (draft 4): cả hai mục và các note đã giải quyết, không có blocker mới; verdict "sẵn sàng trình duyệt". Note không chặn: lệnh UI/test chạy ở process riêng sẽ bị chặn theo thiết kế, nên host test phải chạy lệnh UI evidence trong process của finish host.
- Review không cấp approval hay quyền implementation. Dispatch order, schema round-trip và hành vi runtime thật chưa được kiểm chứng bằng implementation test (NOT RUN); các phần này thuộc plan và execution.

## Typed draft context
```yaml
architecture_context:
  schema_version: 1
  source: sdcorejs-architecture
  contract_id: audit-findings-repair-20260928
  requirement_id: R-001
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-audit-findings-repair-20260928-r1
    artifact_kind: spec
    revision: 70c933c3fc59a98b92c03004de902bc96250fba6
    approval_hash: sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892
  approved_architecture_path: null
  approved_architecture_hash: null
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  trigger:
    required: true
    signals:
      - public-api-contract
      - security-trust-boundary
      - state-data-ownership
    rationale: "Đổi hợp đồng dùng chung: hình dạng next_action của finish, enum coverage UI (FAIL), field
      no-baseline của Design handoff, trust boundary của observer/simplify host và quyền sở hữu evidence giữa
      producer và consumer."
  invariants:
    - id: INV-001
      statement: "Authority vẫn fail-closed: không có quyền ghi khi thiếu approved scope; mọi negative path đã có từ
        bước 1–4 vẫn bị chặn."
      scope: observer, finish choice/policy, simplify write boundary và host runner
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: "Sửa finding mà không nới contract: fail-closed, positive path và evidence phải cùng đúng."
      verification_method: Negative regression cho volatile write trong cửa sổ hook/apply, symlink trong scope kể cả
        thư mục cha, auto-select/delegated finish:policy, native surface đã lỗi, rollback chạm path của pass,
        hard link, request mang field authority, plan do request chọn, chain bị reset hoặc thiếu receipt,
        receipt sửa/giả, payload bỏ simplify context; suite negative hiện có giữ nguyên.
      requirement_refs:
        - R-001
        - R-002
        - R-003
        - R-004
      decision_refs:
        - D-001
        - D-004
        - D-005
        - D-007
    - id: INV-002
      statement: "Positive path tới được: input hợp lệ trên repository kích thước thật hội tụ tới kết quả đúng."
      scope: observer trên repo thật, finish drive-to-completion, UI consumer, Design greenfield, đường load skill
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: "Sửa finding mà không nới contract: fail-closed, positive path và evidence phải cùng đúng."
      verification_method: Integration test trên repo này và fixture ignored/symlink/junction/nested repository;
        host làm đúng tài liệu hội tụ tới tail-complete kể cả khi lệnh ghi cache volatile; review thường NOT
        APPLICABLE; greenfield verify; reachability styling.
      requirement_refs:
        - R-001
        - R-002
        - R-005
        - R-006
        - R-007
      decision_refs:
        - D-001
        - D-003
        - D-007
    - id: INV-003
      statement: "Evidence trung thực: thiếu khác fail khác pass; không check chưa chạy nào được báo verified; test
        không bị nới."
      scope: simplify evidence, finish report, UI coverage/claims/gates, test placement và governance
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: "Sửa finding mà không nới contract: fail-closed, positive path và evidence phải cùng đúng."
      verification_method: Regression RED trước/PASS sau cho từng finding kèm mutation hoặc negative control;
        Analyze tách Apply; receipt FAIL; rule đóng claim source-only; đếm assertion không giảm; parity test.
      requirement_refs:
        - R-003
        - R-005
        - R-007
        - R-009
      decision_refs:
        - D-002
        - D-007
        - D-008
    - id: INV-004
      statement: "Lịch sử bất biến: approved snapshot và evidence record cũ không bị sửa."
      scope: approved artifact loader và historical records
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: "Sửa finding mà không nới contract: fail-closed, positive path và evidence phải cùng đúng."
      verification_method: Loader verify mọi snapshot bước 1–5 không sửa file; byte bị sửa vẫn fail; snapshot mới
        phải khớp nguyên văn; git diff không chạm snapshot/record cũ.
      requirement_refs:
        - R-008
        - R-009
      decision_refs:
        - D-007
        - D-008
  boundaries: []
  dependency_directions:
    - from: _refs/simplify/host-runner.mjs
      to: _refs/simplify/repository-evidence.mjs
      rationale: Runner là host của session hiện có; không tái hiện logic kiểm tra.
      invariant_refs:
        - INV-001
    - from: _refs/simplify/repository-evidence.mjs
      to: _refs/shared/repository-observation.mjs
      rationale: Mọi snapshot đi qua observer hai lớp duy nhất.
      invariant_refs:
        - INV-001
        - INV-002
    - from: _refs/simplify/host-runner.mjs
      to: _refs/shared/approved-artifact.mjs
      rationale: Authority đọc từ đĩa qua loader canonical, không parser riêng.
      invariant_refs:
        - INV-001
        - INV-004
    - from: finish host (caller)
      to: _refs/simplify/repository-evidence.mjs#revalidateSimplifyHostReceipt
      rationale: Host tiêm verifier vào observation runtime qua option simplify_verifier; repository-observation.mjs
        không import _refs/simplify/**, tránh vòng import.
      invariant_refs:
        - INV-001
        - INV-003
  data_state_owners:
    - subject: Finish phase receipts
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_role: host observation runtime (in-memory)
      statement: Resolver chỉ đọc; khóa là next_action.phase.
      invariant_refs:
        - INV-002
        - INV-003
    - subject: Simplify pass ledger và receipt chain
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_role: session trong process (registry theo root/change) hoặc receipt chain do host điều phối giữ
      statement: Runner và consumer kiểm continuity từ anchor; cap tính trên cả chain; finish không suy từ diff hay
        payload.
      invariant_refs:
        - INV-001
        - INV-003
    - subject: Simplify dispatch record và anchor
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_role: finish host observation runtime (in-memory, token beginSimplify)
      statement: Snapshot lúc beginSimplify là before-state tin cậy; token chưa tiêu hoặc receipt null/invalid thì
        chặn; step/scope/hunk ownership lấy từ nguồn của runtime.
      invariant_refs:
        - INV-001
        - INV-003
    - subject: Hunk ownership
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_role: finish host observation runtime
      statement: workflow_hunks từ cửa sổ hook implementation được quan sát (mọi test strategy); user_owned_hunks từ
        snapshot đầu; thiếu thì file dirty bị từ chối.
      invariant_refs:
        - INV-001
        - INV-002
    - subject: Simplify host receipt
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_role: host runner (stdout, runtime-only)
      statement: Chỉ là chỉ mục; consumer tự tính lại.
      invariant_refs:
        - INV-001
        - INV-003
    - subject: UI command receipts và coverage
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_role: UI runtime (Test producer)
      statement: Review chỉ đọc; FAIL chỉ từ lần chạy hoàn tất.
      invariant_refs:
        - INV-003
    - subject: Design no-baseline authority
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_role: approved spec design_requirements
      statement: Handoff chỉ tham chiếu; không tự khai.
      invariant_refs:
        - INV-001
        - INV-002
    - subject: Approved snapshots
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_role: sdcorejs-spec/architecture/plan (immutable)
      statement: Loader chỉ đọc; không migrate.
      invariant_refs:
        - INV-004
  public_contracts:
    - id: PC-001
      kind: api
      owner: _refs/shared/finish-gate.mjs
      statement: "resolveFinish next_actions: phase là khóa receipt, owner từ bảng tĩnh cộng owner hook của policy,
        intent produce|refresh; bỏ evidence_phase; tail-complete có simplify_source và simplify_outcome."
      compatibility: Mọi caller trong repo và finish-gate.md đổi cùng change; next_actions chỉ tồn tại runtime.
      migration: Không cần; không artifact nào lưu next_actions.
      invariant_refs:
        - INV-002
        - INV-003
    - id: PC-002
      kind: api
      owner: _refs/shared/repository-observation.mjs
      statement: Snapshot hai lớp nội dung/metadata; stable_fingerprint loại volatile; một danh sách volatile_paths
        cho mỗi change (finish-policy hoặc direct policy); ledger volatile cấp host theo (root, change) mà mọi
        cửa sổ lệnh đăng ký; kiểm symlink tường minh cho scope/hook/command/UI paths; drift volatile ngoài cửa
        sổ lệnh bị chặn; runtime.beginSimplify (token dispatch) và recordSimplify(token, receipt|null) với
        option simplify_verifier, receipt phase kind simplify; readRepositorySimplify cho consumer cùng flow.
      compatibility: Field tùy chọn; thiếu thì không có volatile path; fingerprint đổi dạng nhưng chỉ dùng runtime.
      migration: Không; plan cũ không bị viết lại.
      invariant_refs:
        - INV-001
        - INV-002
    - id: PC-003
      kind: api
      owner: _refs/simplify/host-runner.mjs
      statement: "CLI host runner với --authority (host cấp: plan identity/hash, parents, step, scope đã resolve,
        hunk ownership, anchor, chain, repaired) và --request (action, edit set, scope thu hẹp); receipt
        simplify-host-receipt:v1; revalidateSimplifyHostReceipt; runtime { host_receipt, expected_plan } hoặc
        { observation, proof } cho evaluateSimplifyConsumer; simplify_context host_kind session|runner
        (runner: anchor + host_receipt_digest); direct fix không có load_plan thì đường runner chỉ Analyze;
        completeExecution trả runner: host-runner khi không có session."
      compatibility: Mới; đường session trong process giữ nguyên.
      migration: Không.
      invariant_refs:
        - INV-001
        - INV-003
    - id: PC-004
      kind: data-model
      owner: _refs/simplify/host-runner.mjs
      statement: "Fence simplify-host-policy trong approved plan: step, verification commands, oracle modules
        (closure tracked, không đổi); volatile_paths lấy từ finish-policy của cùng plan."
      compatibility: Tùy chọn; thiếu thì runner chỉ Analyze.
      migration: Không.
      invariant_refs:
        - INV-001
    - id: PC-005
      kind: data-model
      owner: _refs/shared/ui-review-contract.mjs
      statement: Receipt UI có outcome PASS|FAIL; run_command trả interrupted/timed_out; output phải mới trong cửa
        sổ lệnh; coverage thêm FAIL; result có failures; bảng chấp nhận theo phase; gate canonical
        BLOCKER|REQUIRED|ADVISORY|N/A.
      compatibility: Receipt chỉ trong bộ nhớ host; payload UI hợp lệ hiện tại giữ hành vi.
      migration: Không.
      invariant_refs:
        - INV-003
    - id: PC-006
      kind: data-model
      owner: _refs/shared/design-handoff.mjs
      statement: "design_requirements.design_baseline và design_system_reuse.no_baseline { reason, approval_ref:
        reference chính xác của spec } tùy chọn trong schema 2."
      compatibility: Tùy chọn; thiếu thì luật cũ (phải trích source).
      migration: Không.
      invariant_refs:
        - INV-001
        - INV-002
    - id: PC-007
      kind: api
      owner: _refs/shared/approved-artifact.mjs
      statement: "readApprovedArtifactFile và parseApprovedArtifactText: parser frontmatter hạn chế, không bỏ BOM,
        một dòng trống phân cách chỉ cho approved_at trước 2026-09-27T00:00:00Z, báo biến thể khớp, ràng
        path."
      compatibility: Export mới; writer và hash giữ nguyên.
      migration: Không; snapshot cũ không sửa.
      invariant_refs:
        - INV-004
    - id: PC-008
      kind: api
      owner: _refs/harness/runtime-policy.mjs
      statement: selectInteraction/normalizeChoiceResponse đọc gate từ decision (tham số gate tùy chọn) và coi value
        policy hash sha256 là cấp authority; resolveAction nhận failed_surfaces.
      compatibility: Tham số tùy chọn; hành vi cũ giữ nguyên ngoài gate cấp authority và surface đã lỗi.
      migration: Không.
      invariant_refs:
        - INV-001
  security_trust_boundaries:
    - id: STB-001
      statement: "Observer: nội dung chỉ từ file tracked/untracked chưa ignore; ignored, symlink và nested worktree
        chỉ metadata, không đi theo link; scope/hook paths và thư mục cha không được là symlink; volatile chỉ
        đổi được trong cửa sổ lệnh đã đăng ký với ledger cấp host và không bao giờ là write target; drift
        ngoài cửa sổ bị chặn."
      invariant_refs:
        - INV-001
        - INV-002
    - id: STB-002
      statement: "Host runner: authority do host điều phối cấp, tách khỏi request nhưng không được xác thực, nên
        chấp nhận chỉ dựa trên consumer tự tính lại; plan hash phải bằng hash host cấp; oracle closure tracked
        không đổi (cho phép node:); before-state chỉ từ snapshot của host hoặc HEAD, không từ receipt; chain
        liên tục từ anchor; recordSimplify lấy step/scope/ownership từ nguồn của runtime; receipt không phải
        authority."
      invariant_refs:
        - INV-001
        - INV-003
    - id: STB-003
      statement: Lựa chọn cấp authority (approval, apply, finish:policy) không auto-select hay delegated; surface
        native đã lỗi không được trả lại.
      invariant_refs:
        - INV-001
    - id: STB-004
      statement: "Evidence UI/Design: prose không bao giờ là evidence; FAIL chỉ từ lần chạy hoàn tất; no-baseline
        cần requirements đã duyệt và reference spec chính xác."
      invariant_refs:
        - INV-001
        - INV-003
  cross_repository_integration: []
  adopted_decision_refs:
    - D-001
    - D-002
    - D-003
    - D-004
    - D-005
    - D-006
    - D-007
    - D-008
  deferred_decision_refs: []
  assumption_refs: []
  validation_obligations:
    - id: VAL-001
      expected_proof: "Negative regressions fail closed trước và sau sửa: volatile write trong hook/apply, symlink
        trong scope, policy auto-select/delegated, surface đã lỗi, rollback chạm pass path, hard link, request
        mang authority, plan do request chọn, chain reset/thiếu receipt, receipt sửa/giả."
      owner: github.com/sdcorejs/sdcorejs-agent
      invariant_refs:
        - INV-001
      acceptance_criterion_refs:
        - AC-002
        - AC-003
        - AC-006
        - AC-009
        - AC-010
        - AC-011
    - id: VAL-002
      expected_proof: "Positive integration: observer trên repo này, finish drive-to-completion (kể cả cache
        volatile và worker stage A/B), review thường NOT APPLICABLE, greenfield Design, parity tài liệu
        Design, reachability styling."
      owner: github.com/sdcorejs/sdcorejs-agent
      invariant_refs:
        - INV-002
      acceptance_criterion_refs:
        - AC-001
        - AC-004
        - AC-012
        - AC-015
        - AC-016
        - AC-017
    - id: VAL-003
      expected_proof: "Evidence honesty: pending simplify chặn (kể cả khi payload bỏ context), Analyze chỉ
        analysis_current, diff check theo pass (CRLF), receipt FAIL, rule đóng claim/gate, con trỏ
        explore/review, placement, parity, RED/PASS governance."
      owner: github.com/sdcorejs/sdcorejs-agent
      invariant_refs:
        - INV-003
      acceptance_criterion_refs:
        - AC-005
        - AC-007
        - AC-008
        - AC-013
        - AC-014
        - AC-018
        - AC-019
        - AC-020
        - AC-022
    - id: VAL-004
      expected_proof: Loader verify mọi snapshot bước 1–5 không sửa file; bytes sửa vẫn fail; snapshot mới khớp
        nguyên văn; không commit nào chạm snapshot/record cũ.
      owner: github.com/sdcorejs/sdcorejs-agent
      invariant_refs:
        - INV-004
      acceptance_criterion_refs:
        - AC-021
        - AC-022
  profile_sections:
    frontend_architecture_ref: null
    agent_architecture_ref: null
  change_control:
    revision: 1
    supersedes: null
```
