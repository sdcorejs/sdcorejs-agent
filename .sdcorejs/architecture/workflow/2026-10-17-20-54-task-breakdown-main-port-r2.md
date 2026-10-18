---
acceptance_criteria_count: 6
approval_gate: sdcorejs-architecture:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-10-17T14:18:40.718Z
approved_by: user
approved_draft_fingerprint: sha256:aec9077453c37c6f4628ea9ef9f03d258e3f2940c251b92ce06b8217c4698d3c
artifact_id: architecture-task-breakdown-main-port-v1-r2
artifact_kind: architecture
change_control:
  change_reason: Spec r2 sửa tập file thành 40 file nguồn và số public skill thành 24; architecture r2 đổi parent và sửa đúng các con số đó.
  revision: 2
  supersedes: architecture-task-breakdown-main-port-v1-r1
change_ref: task-breakdown-main-port-v1
commit_policy: with-change
contract_id: task-breakdown-main-port-v1
description: Restate the approved task-breakdown architecture on the main base, with mirror _refs resolution, source guidance and a minimal base dependency.
execution_host_repository_id: portal-sales-platform
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
manual_criteria_count: 0
name: task-breakdown-main-port
owner: sdcorejs-architecture
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:c5a2aed0d3a57eab66b9cf24334a13919925a0e739e3769bf6ff2c895a72a8f1
    artifact_id: spec-task-breakdown-main-port-v1-r2
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: fb64f8c2905cd79c6027e02ea847560cc09c8b42
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/architecture/workflow/2026-10-17-20-54-task-breakdown-main-port-r2.md
requirement_id: R-001
schema_version: 1
sourceDraftPath: .sdcorejs/docs/architecture/2026-10-17-20-54-task-breakdown-main-port-r2-architecture.md
source_plan: none
source_revision: fb64f8c2905cd79c6027e02ea847560cc09c8b42
source_spec: .sdcorejs/specs/workflow/2026-10-17-20-09-task-breakdown-main-port-r2.md
stack_profile: markdown-skill-pack
supersedes: architecture-task-breakdown-main-port-v1-r1
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:d8269c1a33ee3b21e1311857759bef681fd73dee3d2c77f8dee94e093199bf74
---
# Port mode task-breakdown, sửa mirror _refs và hướng dẫn nguồn lên main — Approved Architecture r2

> Immutable snapshot approved by explicit reply `1` to the architecture r2 gate (draft revision 2). It supersedes architecture r1. Embedded draft fields preserve the reviewed pre-approval state; verified artifact metadata governs approval. This approval authorizes planning, not implementation or Git operations.

## Approved contract

# Architecture r2 — Port mode task-breakdown, sửa mirror _refs và hướng dẫn nguồn lên main

## Change control
- Thay architecture r1 (`.sdcorejs/architecture/workflow/2026-10-17-17-40-task-breakdown-main-port.md`, `sha256:v1:d0d46493…`).
- Lý do: spec r2 sửa tập file thành 40 file nguồn và số public skill thành 24. Architecture r2 dùng spec r2 làm parent và sửa đúng các con số đó trong INV-007, INV-012 và VAL-007. Mọi quyết định, invariant và proof khác giữ nguyên.

## Parent và authority
- Approved spec r2: `.sdcorejs/specs/workflow/2026-10-17-20-09-task-breakdown-main-port-r2.md` (`sha256:v1:c5a2aed0…`, base `fb64f8c`).
- Gate: bắt buộc, với 4 signal `persisted-data-model-contract`, `public-api-contract`, `security-trust-boundary`, `state-data-ownership`, kế thừa từ change product.
- Nguồn nội dung:
  - architecture r2 đã duyệt của `product-task-breakdown-mode-v1` (PR #78, `sha256:v1:8de13e08…`);
  - spec đã duyệt của `mirror-refs-path-resolution-v1` (PR #79) và `task-breakdown-source-guidance-v1` (PR #80).

  Các artifact này gắn với revision nằm ngoài lịch sử của `main`, nên architecture này nhắc lại nội dung của chúng trên base `main` thay vì tham chiếu tới chúng.
- Owner: `github.com/sdcorejs/sdcorejs-agent` (standalone), cũng là integration owner. Execution host: `portal-sales-platform`.

## Quyết định kiến trúc
- **D-008. Giữ nguyên kiến trúc của mode task-breakdown.** Mọi quyết định của architecture r2 được giữ nguyên:
  - action trung lập `source.read`/`tracker.write`, chỉ lấy từ connector mà host quan sát được trong session;
  - root `project_workspaces` cùng 2 artifact kind `project-config` và `task-breakdown`;
  - format task 12 mục;
  - gate ghi tracker bằng write plan được duyệt riêng, kèm merge theo marker;
  - helper thuần và CLI kiểm tra chỉ đọc;
  - đọc song song ở chế độ chỉ đọc;
  - chuỗi cổng G0..G8.

  Boundary, hướng phụ thuộc, owner dữ liệu, public contract PC-001..006 và security boundary SEC-001..004 được chép nguyên văn. Các ID trong câu chữ gốc (R-009, AC-011, A-004) được ghi rõ là "của change product"; "23 public skill" trong INV-007 được ghi lại thành "24 public skill của main".
- **D-009. Đường dẫn `_refs` trong mirror Claude.** Mirror plugin và `.claude` viết `../../_refs/` kèm một dòng path-resolution. Hook session-start chèn đường dẫn tuyệt đối dưới plugin root. Mirror codex và các file sinh từ `AGENTS.md` giữ cách viết riêng. Thêm một hướng phụ thuộc: `scripts/sync-skills.mjs` → mirror sinh ra.
- **D-010. Hướng dẫn nguồn và help của CLI.** Lệnh chỉ đọc `check sources -` dùng danh sách kind id cố định do model chọn; G1 và G8 in nguyên văn `result.table`; `--help`, `-h` và `help` trả cùng một verdict JSON. Đây là public contract mới PC-007.
- **D-011. Phụ thuộc tối thiểu vào nhánh nền.** Chỉ chép `parseApprovedFrontmatter` từ `4703643` vào `_refs/shared/approved-artifact.mjs` và giữ nguyên từng byte. Phần nhánh nền đã thêm vào `runtime-attestation.mjs`, `runtime-policy.mjs` và `harness-behavioral-sentinel.test.mjs` không có mặt; chỉ phần của change được thêm vào bản của `main`.

## Invariant và proof obligations
- **INV-001..009:** chép nguyên văn từ architecture r2 (gate ghi tracker, dữ liệu không tin cậy và secret, trung lập provider, project workspace, format task, merge theo marker, hành vi hiện có, chuỗi cổng, CLI chỉ đọc). Tham chiếu sang R-001 của spec port, và R-003 với INV-008 và INV-009. Proof giữ VAL-001..006; riêng VAL-004 (lần chạy thật) dựa trên D-003 của spec port: kết quả lần chạy thứ ba và thứ tư áp dụng vì nội dung giống từng byte.
- **INV-010 (mới):** mirror plugin và `.claude` của mọi skill resolve được `_refs/` từ thư mục `SKILL.md`; bootstrap chỉ dùng đường dẫn tuyệt đối có thật; mirror codex, skill nguồn và file sinh từ `AGENTS.md` không mang dòng path-resolution của layout Claude. Proof: VAL-008.
- **INV-011 (mới):** lệnh `sources` và help chỉ đọc, in đúng một verdict JSON; kind id và danh sách lệnh khớp giữa CLI và ref; bảng không chứa giá trị dạng secret. Proof: VAL-006.
- **INV-012 (mới):** nhánh port chỉ chứa nội dung của 3 change cộng `parseApprovedFrontmatter`; 40 file nguồn giống từng byte với `f19c72c`, trừ danh sách điều chỉnh của plan; không có symbol, test hay record nào của nhánh nền. Proof: VAL-007.
- **VAL-009:** check, full suite và evidence test xanh; continuation mới nối vào chuỗi của `main`; PR mergeable; diff không chứa thông tin nội bộ.

## Review và validation status
- `validateDecisionCoverage` (revision 2, gồm record của spec, D-008..011 và INV-001..012): 0 lỗi, 0 blocker. Còn 37 future gap về task và evidence, sẽ lấp ở plan.
- `validateArchitectureContext`: chỉ còn 2 blocker dự kiến trước khi duyệt, là `approved_architecture_path` và `approved_architecture_hash`; hai trường này được điền khi snapshot.
- `validateArchitectureWriteScope` cho đường dẫn draft và snapshot: hợp lệ.
- Graph: approved spec → approved architecture → approved plan.

## Typed draft context

```yaml
architecture_context:
  schema_version: 1
  source: sdcorejs-architecture
  contract_id: task-breakdown-main-port-v1
  requirement_id: R-001
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-task-breakdown-main-port-v1-r2
    artifact_kind: spec
    revision: fb64f8c2905cd79c6027e02ea847560cc09c8b42
    approval_hash: sha256:v1:c5a2aed0d3a57eab66b9cf24334a13919925a0e739e3769bf6ff2c895a72a8f1
  approved_architecture_path: null
  approved_architecture_hash: null
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_module_id: null
  execution_host_repository_id: portal-sales-platform
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  trigger:
    required: true
    signals:
      - persisted-data-model-contract
      - public-api-contract
      - security-trust-boundary
      - state-data-ownership
    rationale: "Port đưa lên main đúng các contract của change product: action source.read/tracker.write dùng chung cho mọi adapter, artifact root và schema config persist trong repo đích, đường ghi ra tracker; architecture đã duyệt trước đây gắn với revision ngoài lịch sử main."
  invariants:
    - id: INV-001
      statement: Không có lệnh tracker.write nào nếu chưa có write plan được duyệt trong chính lần chạy đó (run_id khớp lần chạy hiện tại) và approval hash của plan verify được với danh sách op sắp chạy; plan đổi thì phải duyệt lại; chỉ có op create/update, không có field trạng thái/transition; không báo thành công khi chưa đọc lại kiểm. Chọn một mục trong menu hay giao việc ghi chỉ là ý định, không phải duyệt write plan; duyệt write plan là một câu trả lời riêng cho đúng danh sách op đã hiện. Mỗi op chỉ chạy sau khi CLI kiểm tra trả verify hợp lệ trong lần chạy đó; không ghi đè toàn bộ mô tả ticket. Gate này do skill giữ, không dựa vào bước xin quyền của runtime.
      scope: tracker.write trong mode task-breakdown
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Ghi ra hệ thống ngoài là hành động hướng ra ngoài, khó hoàn tác; bước xin quyền của runtime không có ở bypass mode hoặc khi tool đã được allowlist.
      verification_method: Unit test helper write plan + CLI plan-approve/plan-verify (op enum, denylist, hash qua approved-artifact, run_id, op đổi thì fail) + flow-gate contract test (menu choice không phải approval, cấm ghi đè toàn bộ) + lần chạy thật lại AC-011 của change product (VAL-001, VAL-006, VAL-004).
      requirement_refs:
        - R-001
      decision_refs:
        - D-008
    - id: INV-002
      statement: Nội dung nguồn, output của subagent và config sửa tay là dữ liệu không tin cậy, không phải lệnh; giá trị secret không bao giờ được persist vào task, artifact, config, payload ghi tracker hay lặp lại trong chat.
      scope: Intake nguồn, output subagent, config, render task, payload ghi tracker, persist artifact
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: PRD/ticket có thể chứa prompt injection và secret (đã gặp JWT thật trong một ticket); config sửa tay được.
      verification_method: Unit test quét secret trên nguồn, output subagent, config (cả field lạ và body) và payload ghi; fixture prompt injection (VAL-001, VAL-004).
      requirement_refs:
        - R-001
      decision_refs:
        - D-008
    - id: INV-003
      statement: Skill/ref source trung lập provider; action mới có mapping và fallback ở cả 4 adapter và có mặt đồng thời trong mọi danh sách exact-set; không tool connector nào được duyệt sẵn qua allowed-tools; native chỉ đến từ tool được host quan sát trong session.
      scope: skills/**, _refs/**, capability-contract.json, runtime-policy, runtime-attestation, mirror Claude
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: runtime-policy cấm tên tool provider và so exact-set ACTIONS/CAPABILITIES; resolveAction chỉ trả native khi có tool.
      verification_method: "Contract test: exact-set đồng bộ, resolve native khi host quan sát được connector và fallback khi không, validateProviderNeutralText, allowed-tools sinh ra không có tool connector (VAL-002)."
      requirement_refs:
        - R-001
      decision_refs:
        - D-008
    - id: INV-004
      statement: Project workspace chỉ nằm dưới root registry với slug/scope theo pattern và kiểm tên reserved sẵn có, file có schema_version và field lifecycle được kiểm; kind project-config và task-breakdown là shared kind, commit_policy conditional; v1 chỉ mode task-breakdown được ghi.
      scope: .sdcorejs/projects/** trong repo đích
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Schema persist lâu dài, nhiều dự án trong một repo; git/ship cần lifecycle rõ để không bị ambiguous.
      verification_method: Unit test resolve path/slug/reserved name, validator schema_version và field lifecycle, phân loại kind theo path (VAL-001).
      requirement_refs:
        - R-001
      decision_refs:
        - D-008
    - id: INV-005
      statement: Mỗi task có đủ 12 mục theo key và thứ tự cố định, confidence, size kèm breakdown, task_id ổn định không tái sử dụng số; ma trận phủ PRD không có yêu cầu bị bỏ sót.
      scope: Task do mode sinh ra, kể cả task từ subagent
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Assignee đọc mọi ticket theo cùng một khung; chạy lại không được tạo trùng.
      verification_method: Unit test validator format/confidence/rubric/phủ PRD và cấp số NN; CLI tasks kiểm block dữ liệu và heading đã render của tasks/<scope>.md (VAL-001).
      requirement_refs:
        - R-001
      decision_refs:
        - D-008
    - id: INV-006
      statement: Cập nhật ticket chỉ thay vùng giữa marker của skill khi fingerprint vùng còn khớp, hoặc chèn section mới; đọc lại ngay trước khi ghi và huỷ nếu ticket đổi so với lúc duyệt; fingerprint phần ngoài vùng giữ nguyên sau khi ghi; không xoá ticket, không chuyển trạng thái.
      scope: Cập nhật ticket có sẵn trên tracker
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Ticket có nội dung/ảnh của PO; markdown rewrite từng làm mất media; PO có thể sửa ticket giữa lúc duyệt và lúc ghi.
      verification_method: Unit test marker parse/merge, fingerprint vùng và phần ngoài vùng, phát hiện thay đổi trước khi ghi + lần chạy thật cập nhật ticket có ảnh (VAL-001, VAL-004).
      requirement_refs:
        - R-001
      decision_refs:
        - D-008
    - id: INV-007
      statement: "Hành vi hiện có giữ nguyên: 24 public skill của main, mode Seed/Update/Audit của product không đổi, định tuyến TASKID record vẫn vào documentation."
      scope: Toàn bộ skill pack
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Thay đổi phải additive.
      verification_method: test:e2e:repository, prompt-evals, check:skills (VAL-003, VAL-005).
      requirement_refs:
        - R-001
      decision_refs:
        - D-008
    - id: INV-008
      statement: "Các cổng G0..G8 của flow đi đúng thứ tự và không gộp: chưa resolve hoặc tạo xong project (wizard có bản xem trước được duyệt) thì không inventory story và không tách task; inventory story, ticket con có sẵn và vai trò trước khi tách task; có từ 2 story và runtime hỗ trợ subagent thì fan-out read-only; hỏi mức sẵn sàng trước khi gợi ý assignee; bảng đề xuất được duyệt trước khi lưu tasks/<scope>.md; nội dung được kiểm bằng CLI trên đúng bytes trước khi ghi và kiểm lại file sau khi ghi; mỗi cổng dẫn bằng chứng đã định cho cổng đó, NOT RUN chỉ hợp lệ khi kèm lệnh đã thử và lỗi hoặc lời từ chối quyền."
      scope: Flow mode task-breakdown trong skill và _refs/product/task-breakdown.md
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Lần chạy thật cho thấy model đi tắt qua wizard, câu hỏi capacity, bảng đề xuất và fan-out khi các bước chỉ là danh sách; cổng có điểm dừng và bằng chứng phải dẫn làm việc đi tắt lộ ra.
      verification_method: Flow-gate contract test trên skill và ref (thứ tự cổng, điểm dừng, câu hỏi tách riêng, dẫn output CLI hoặc NOT RUN) có mutation guard; lần chạy thật lại (VAL-006, VAL-004).
      requirement_refs:
        - R-001
        - R-003
      decision_refs:
        - D-008
        - D-010
    - id: INV-009
      statement: "CLI kiểm tra chỉ đọc: --root là bắt buộc, được realpath và in lại trong kết luận; chỉ đọc file nằm dưới <root>/.sdcorejs/projects/<slug>/ (kiểm từng đoạn bằng lstat, từ chối symlink ra ngoài và traversal) hoặc stdin; không ghi file, không gọi mạng, tracker hay tiến trình con; slug sai hay path ngoài workspace thì exit 2; in đúng một kết luận JSON và exit code 0 hợp lệ, 1 không hợp lệ, 2 lỗi dùng hoặc I/O; không bao giờ sửa nội dung ngoài vùng của skill, kể cả để che secret."
      scope: _refs/product/task-breakdown/check.mjs
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: CLI chạy trong repo đích với nội dung không tin cậy; phải là adapter đọc hẹp quanh helper thuần, không thành kênh ghi hay đọc rộng.
      verification_method: "Contract test CLI: path ngoài workspace, traversal, symlink ra ngoài, slug sai bị từ chối exit 2; chạy trong thư mục tạm không đổi file nào; module không import fs ghi, child_process hay net; output là một JSON (VAL-006)."
      requirement_refs:
        - R-001
        - R-003
      decision_refs:
        - D-008
        - D-010
    - id: INV-010
      statement: Mirror plugin và .claude của mọi skill viết mỗi tham chiếu _refs/ đi trước một đoạn đường dẫn thành ../../_refs/ và có đúng một dòng path-resolution; bootstrap do hook chèn chỉ dùng đường dẫn _refs tuyệt đối có thật; mirror codex, skill nguồn và file sinh từ AGENTS.md không mang dòng path-resolution của layout Claude.
      scope: mirror sinh ra và hook session-start
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Model chỉ resolve được đường dẫn cụ thể tính từ thư mục của SKILL.md.
      verification_method: test mirror-refs-resolution (rewritten, resolve, header, bootstrap-absolute, unchanged, mutation) và check:skills (VAL-008).
      requirement_refs:
        - R-002
      decision_refs:
        - D-009
    - id: INV-011
      statement: Lệnh sources và help của check CLI chỉ đọc, in đúng một verdict JSON; kind id và danh sách lệnh khớp giữa CLI và ref của mode; giá trị dạng secret không xuất hiện trong bảng hướng dẫn.
      scope: check CLI của mode task-breakdown
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Bảng hướng dẫn phải xác định được để G1 và G8 in nguyên văn.
      verification_method: CLI test cli-sources-*, cli-help, cli-read-only và flow-contract flow-source-guidance (VAL-006).
      requirement_refs:
        - R-003
      decision_refs:
        - D-010
    - id: INV-012
      statement: "Nhánh port chỉ chứa nội dung của 3 change cộng parseApprovedFrontmatter: 40 file nguồn của 3 change giống từng byte với f19c72c trừ danh sách điều chỉnh của plan; observeChoiceTools, nhánh user.choose của resolveAction, test case-repair-policy-ask-native và record của nhánh nền không có mặt."
      scope: nhánh feat/task-breakdown-mode-main
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Port không được đổi hành vi đã duyệt, cũng không được kéo theo phần chưa review của nhánh nền.
      verification_method: Lệnh kiểm parity và git grep một lần, ghi vào delivery doc (VAL-007).
      requirement_refs:
        - R-004
        - R-005
      decision_refs:
        - D-011
  boundaries:
    - id: BND-001
      statement: "Mode task-breakdown thuộc sdcorejs-product. Ghi chép TASKID một ticket vẫn thuộc sdcorejs-documentation. Phân xử: tạo/tách task hoặc ticket từ PRD/US/sprint/board -> product; ghi requirement record cho một TASKID có sẵn -> documentation. Mô tả product và dòng trigger ticket id của documentation được sửa cho khớp phân xử này; mô tả các mode cũ giữ nguyên."
      invariant_refs:
        - INV-007
    - id: BND-002
      statement: "Parent điều phối mọi side effect (artifact.write, tracker.write, câu hỏi người dùng) và tự đọc tracker (metadata, ticket con). Subagent chạy parallel-dispatch read-only-request, brief chỉ cho phép source.read trên PRD/API spec/code được giao, cấm tracker.write, artifact.write và hỏi người dùng; chỉ trả task draft theo format. Parent validate và quét secret lại output trước khi dùng. Rủi ro còn lại: read-only-request chỉ kiểm path trong repo, không phát hiện subagent gọi tool ghi tracker. Có từ 2 story và capability subagents supported thì fan-out là bắt buộc; chỉ đọc tuần tự khi không có subagent hoặc parallel-dispatch trả SEQUENTIAL, và báo cáo ghi chế độ đọc cùng lý do."
      invariant_refs:
        - INV-001
        - INV-002
        - INV-005
        - INV-008
    - id: BND-003
      statement: "Helper trong _refs/product/task-breakdown/*.mjs (trừ check.mjs) là hàm thuần, xác định được, không I/O tới repo đích, mạng hay tracker (chỉ import module trong skill pack); thêm helper thuần renderTask (render một task từ block dữ liệu ra markdown theo nhãn của dự án) và merge/fingerprint cho rich-json. check.mjs là adapter CLI duy nhất có I/O: chỉ đọc file dưới <root>/.sdcorejs/projects/<slug>/ của repo đích (--root bắt buộc) hoặc stdin, gọi helper thuần và in kết luận; không ghi gì. Mọi ghi file và ghi tracker vẫn do skill thực hiện qua action của capability contract. Skill tìm check.mjs từ gốc skill pack: thư mục tổ tiên gần nhất của SKILL.md có chứa _refs/; không tìm thấy thì dừng và báo lỗi của skill pack, không được ghi NOT RUN."
      invariant_refs:
        - INV-004
        - INV-005
        - INV-009
    - id: BND-004
      statement: "Flow là chuỗi cổng G0..G8, mỗi cổng có điểm dừng và bằng chứng riêng; không cổng nào được gộp với cổng sau trong cùng một câu hỏi. G0 project: resolve, hoặc wizard (bản điền sẵn, hỏi bằng user.choose, bản xem trước, CLI project - trên đúng bytes, user.approve riêng, ghi, CLI project trên file); tạo run_id của lần chạy. G1 intake: đọc nguồn theo chuỗi fallback, CLI scan. G2 inventory: story, trạng thái, ticket con có sẵn và marker, hỏi vai trò cần tách. G3 chế độ đọc: dẫn verdict của parallel-dispatch hoặc trạng thái capability subagents. G4 draft: CLI tasks - (format, confidence, phủ PRD, điểm tính lại từ breakdown). G5 capacity: hỏi mức sẵn sàng của từng người; roster rỗng thì đề nghị bổ sung roster qua bản xem trước hoặc để trống assignee; CLI balance -. G6 đề xuất: bảng theo cột chuẩn kèm bảng cân tải, user.approve riêng, CLI tasks - trên đúng bytes, ghi tasks/<scope>.md, CLI tasks trên file. G7 tracker (chỉ khi người dùng yêu cầu ghi): write plan hiện đủ op, user.approve riêng, CLI plan-approve, rồi cho từng op: đọc lại ticket, CLI drift, CLI plan-verify, CLI merge, ghi, đọc lại; op create lưu key vào block tickets ngay sau khi tạo. G8 báo cáo: in nguyên văn result.table của CLI report. Thứ tự capacity trước bảng đề xuất là cách đọc R-009 của change product: bảng đề xuất được duyệt sau khi có capacity và cân tải."
      invariant_refs:
        - INV-001
        - INV-008
  dependency_directions:
    - from: skills/tracks/product/sdcorejs-product.md (mode task-breakdown)
      to: _refs/product/*.md và _refs/product/task-breakdown/*.mjs
      rationale: Chi tiết nạp theo action (private refs); skill không nhân bản logic.
      invariant_refs:
        - INV-005
    - from: _refs/product/task-breakdown/*.mjs
      to: _refs/shared/system-registry.json, artifact-paths.mjs, artifact-lifecycle.mjs, approved-artifact.mjs, repository-contract.mjs
      rationale: Path, kind, lifecycle, hash approval và owner lấy từ helper dùng chung; không hard-code, không viết thuật toán hash approval thứ hai.
      invariant_refs:
        - INV-004
        - INV-001
    - from: mode task-breakdown
      to: sdcorejs-parallel-dispatch (read-only-request)
      rationale: Tái dùng fan-out có sẵn; không tạo cơ chế dispatch thứ hai.
      invariant_refs:
        - INV-002
    - from: resolveAction trong runtime-policy.mjs
      to: observeConnectorTools trong runtime-attestation.mjs
      rationale: Native của source.read/tracker.write chỉ đến từ tool host quan sát trong session, cùng cơ chế observeChoiceTools; adapter mapping tĩnh giữ native rỗng; tool chỉ được xếp vào source.read khi host khai rõ read-only, không rõ thì xếp vào tracker.write và đi qua gate.
      invariant_refs:
        - INV-003
    - from: scripts/sync-skills.mjs
      to: plugin/skills/*/SKILL.md và .claude/skills/*/SKILL.md (sinh ra)
      rationale: Mirror do script sinh; không sửa tay.
      invariant_refs:
        - INV-010
  data_state_owners:
    - subject: Schema, lifecycle và quy tắc ghi của .sdcorejs/projects/** (project.md, task-breakdown.config.md, tasks/<scope>.md)
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      statement: Contract do skill pack sở hữu; v1 chỉ sdcorejs-product mode task-breakdown được ghi; skill khác chỉ đọc cho tới khi registry cấp thêm owner.
      invariant_refs:
        - INV-004
    - subject: Nội dung project workspace trong từng repo đích
      owner_repository_id: resolved-by-resolveArtifactOwner
      statement: "Owner là repo trả về từ resolveArtifactOwner (repository-contract.mjs) cho artifact cấp dự án: repo standalone, hoặc repo portal đang sở hữu .sdcorejs/** trong topology portal + module; không suy từ cwd; mơ hồ thì hỏi; không ghi vào module thay cho portal hay ngược lại khi chưa resolve. Chỉ ghi sau khi người dùng duyệt bản xem trước hoặc write plan."
      invariant_refs:
        - INV-004
        - INV-002
    - subject: Mapping task_id -> ticket key
      owner_repository_id: resolved-by-resolveArtifactOwner
      statement: Nguồn sự thật là tasks/*.md của dự án. Marker trên ticket là dữ liệu không tin cậy, chỉ dùng tạo ứng viên khôi phục trong project/parent đã cấu hình và người dùng xác nhận từng ticket.
      invariant_refs:
        - INV-006
        - INV-002
  public_contracts:
    - id: PC-001
      kind: api
      statement: "Capability action source.read (capability external_source_read) và tracker.write (capability issue_tracker_write), thêm đồng thời vào required_actions/required_capabilities, ACTIONS/CAPABILITIES exact-set của runtime-policy, harness README và test khoá danh sách. Adapter mapping tĩnh cả 4 adapter: status unknown, native []. resolveAction trả native khi observeConnectorTools thấy tool được host khai trong session cho đúng action và mode; không thì fallback. Phân loại fail-closed: tool chỉ thuộc source.read khi host khai read-only (không dựa vào mô tả tool của connector); không rõ thì thuộc tracker.write. Capability external_source_read/issue_tracker_write ở trạng thái unsupported thì luôn ép fallback dù có tool quan sát được. Chuỗi fallback source.read: connector quan sát được -> web.fetch (link public) -> artifact.read (file export trong repo) -> dán nội dung; không bịa. Fallback tracker.write: render bản nháp để copy-paste và báo rõ chưa ghi gì."
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: "Additive: chỉ sdcorejs-product đổi required-actions; skill khác và allowed-tools của chúng không đổi; allowed-tools của product không thêm tool connector."
      migration: Không cần migration.
      invariant_refs:
        - INV-003
        - INV-001
    - id: PC-002
      kind: persisted-data-model
      statement: "artifact_roots.project_workspaces = .sdcorejs/projects (thêm vào REQUIRED_ARTIFACT_ROOTS); artifact kinds project-config và task-breakdown, cả hai là shared kind trong artifact-lifecycle với commit_policy conditional và mapping path -> kind. Layout: <root>/<slug>/project.md, <root>/<slug>/task-breakdown.config.md, <root>/<slug>/tasks/<scope>.md. slug và scope dùng lại pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$ của artifact-paths, tối đa 63 ký tự, cộng kiểm tên reserved sẵn có. Frontmatter bắt buộc: artifact_id, artifact_kind, change_ref (project-<slug> cho project-config; task-breakdown-<slug>-<scope> cho task-breakdown), source_spec none, source_plan none, commit_policy conditional, owner sdcorejs-product, schema_version 1, updated_at, redaction_applied. Field lạ được giữ nguyên khi ghi lại; schema_version không hỗ trợ thì từ chối."
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Root và kind mới, additive; test khoá danh sách root/kind được cập nhật cùng thay đổi.
      migration: Không có ở v1; version sau migrate bằng lệnh tường minh có xem trước.
      invariant_refs:
        - INV-004
        - INV-002
    - id: PC-003
      kind: persisted-data-model
      statement: "Task identity: task_id = <project-slug>/<source-key>/<role>/<NN>; source-key chuẩn hoá thành chữ in hoa, số và dấu gạch; role theo pattern slug; NN hai chữ số, cấp số kế tiếp theo mapping trong mọi tasks/*.md của dự án; task bị bỏ giữ tombstone, không dùng lại số; khi chạy lại, ghép draft mới với task_id cũ được hiện trong bảng đề xuất để người dùng xác nhận. Marker begin/end mang task_id bao vùng của skill, render theo quy tắc tracker trong config; ticket có sẵn được chèn section mới có marker sau nội dung cũ."
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Mới; không đụng TASK-### của plan hay TASKID của documentation.
      migration: Không cần migration.
      invariant_refs:
        - INV-005
        - INV-006
    - id: PC-004
      kind: persisted-data-model
      statement: "Format task 12 mục theo key cố định: tldr, context, scope, work_items, rules_data, done_criteria, dependencies, confirmations, risks, estimate, sources, traceability; header meta task_id, role, source_refs, size_points, confidence, suggested_assignee. Nhãn hiển thị dịch theo ngôn ngữ dự án; validator kiểm theo key. tasks/<scope>.md chứa một block dữ liệu `json sdcorejs-task-breakdown` (schema_version, project_slug, scope, tasks với meta, sections theo key và breakdown rubric, coverage, tombstones, tickets: map task_id -> key ticket và kết quả đọc lại) là nguồn để kiểm. Phần task đã render (từ heading task đầu tiên tới hết task cuối, không gồm các block dữ liệu và write plan) phải bằng đúng renderTask(block, {format: text}) theo nhãn của dự án; CLI tasks so từng byte phần đó sau khi chuẩn hoá dòng, nên cập nhật block tickets hay thêm block write plan không làm file mất hợp lệ. renderTask(block, {format: rich-json}) render cùng nội dung ra tập node tối thiểu (paragraph, heading, bullet list, table, code) cho tracker rich-json, không thêm dependency. CLI tính lại điểm từ breakdown và đọc các tasks/*.md khác cùng slug để kiểm không dùng lại số NN; với stdin thì --slug và --scope là bắt buộc."
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Mới.
      migration: Không cần migration.
      invariant_refs:
        - INV-005
    - id: PC-005
      kind: persisted-data-model
      statement: "Write plan: danh sách op {create, update} với ticket đích hoặc parent, tiêu đề, assignee, field; không có op xoá và không có field trạng thái/transition/resolution. Approval identity của write plan tạo và verify bằng createApprovedArtifact/verifyApprovedArtifact. Body được hash là JSON ổn định (key sắp xếp) của danh sách op, lưu trong block write plan riêng của tasks/<scope>.md, tách khỏi các section cập nhật sau (key ticket, kết quả đọc lại). Metadata cố định: artifact_kind task-breakdown, artifact_id write-plan-<slug>-<scope>-<run_id>, contract_id task-breakdown:<slug>:<scope>, requirement_id <scope>, change_ref task-breakdown-<slug>-<scope>, track product, stack_profile product, owner_repository_id theo resolveArtifactOwner, source_revision là HEAD 40 hex của repo đích lúc duyệt, repository_relative_path là path của tasks/<scope>.md, parent_references [], run_id của lần chạy. Verify phải khớp run_id hiện tại; plan của lần chạy trước phải duyệt lại. Repo đích không có Git revision thì không tạo được approval: tracker.write rơi về fallback copy-paste. Mỗi ticket update lưu fingerprint sha256 của vùng skill và của phần ngoài vùng tại thời điểm duyệt. Tên block duy nhất là `json sdcorejs-write-plan`; mỗi run_id một block, hai block cùng run_id là không hợp lệ. Mỗi op update mang luôn format của ticket (text hoặc rich-json) và fingerprint của vùng skill cùng phần ngoài vùng lấy tại lúc duyệt, nên fingerprint nằm trong body được hash. CLI plan-approve nhận nội dung hiện tại của các ticket cần update trên stdin, tính fingerprint, và tạo approval với --run-id, --source-revision (skill lấy bằng git rev-parse HEAD chỉ đọc trong repo owner), --owner-repository-id, --owner-repository-role, --owner-module-id, --approved-by, --approved-at (ISO UTC); repository_relative_path suy từ path file so với --root. run_id do skill tạo ở G0; rủi ro còn lại: run_id do model cung cấp ở cả hai đầu."
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Mới.
      migration: Không cần migration.
      invariant_refs:
        - INV-001
        - INV-006
    - id: PC-006
      kind: api
      statement: "CLI kiểm tra: node <pack-root>/_refs/product/task-breakdown/check.mjs <command> --root <target-root> [args]; <pack-root> là thư mục tổ tiên gần nhất của SKILL.md có chứa _refs/. Command: project <file|->; tasks <file> | tasks - --slug <slug> --scope <scope>; scan - (nội dung nguồn); balance - (roster, mức sẵn sàng, task và điểm); plan-approve <tasks-file> --run-id ... (ticket hiện tại trên stdin); plan-verify <tasks-file> --run-id <id> (op sắp chạy trên stdin); drift <tasks-file> --run-id <id> --task-id <id> (ticket hiện tại trên stdin); merge <tasks-file> --run-id <id> --task-id <id> --format text|rich-json (ticket hiện tại trên stdin; nội dung vùng lấy từ renderTask của block, không lấy từ stdin); report <tasks-file>. rich-json là cây node {type, content, text, attrs}: marker là node đoạn văn có text marker, merge thay các node giữa marker hoặc nối section mới, fingerprint ngoài vùng là JSON chuẩn hoá (key sắp xếp, bỏ các attr mà tracker tự sinh lại như id node cục bộ, danh sách attr bỏ qua lấy từ quy tắc render tracker trong config) của các node ngoài vùng; format đọc khác format ghi thì chỉ còn copy-paste. Output: đúng một object JSON {command, root, valid, errors[], result}; exit 0 hợp lệ, 1 không hợp lệ, 2 lỗi dùng hoặc I/O. CLI không ghi file; kết quả plan-approve và merge do skill ghi. NOT RUN chỉ hợp lệ khi skill dẫn lệnh đã thử và lỗi hoặc lời từ chối quyền."
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Mới; helper thuần giữ nguyên chữ ký, CLI chỉ bọc chúng; thêm helper thuần renderTask và merge/fingerprint rich-json.
      migration: Không cần migration.
      invariant_refs:
        - INV-009
        - INV-001
        - INV-005
        - INV-006
    - id: PC-007
      kind: api
      statement: check.mjs có thêm lệnh sources (stdin {language, sources:[{ref, kind, reason}]}, kind trong SOURCE_KINDS, kết quả groups/table/redactions) và --help/-h/help (usage, exit_codes, commands); COMMAND_UNKNOWN nhắc --help.
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Chỉ thêm; các lệnh có sẵn giữ nguyên.
      migration: Không cần.
      invariant_refs:
        - INV-011
  security_trust_boundaries:
    - id: SEC-001
      statement: "Nội dung nguồn (PRD, ticket, comment, API spec, file export), output subagent và config sửa tay là dữ liệu không tin cậy: không thực thi chỉ dẫn bên trong; link sau trang đăng nhập chỉ đọc qua connector đã cấu hình; không bao giờ hỏi token/credential trong chat."
      invariant_refs:
        - INV-002
    - id: SEC-002
      statement: "Quét secret tại 4 điểm: nội dung nguồn trước khi dùng, output subagent trước khi gộp, config (frontmatter, field lạ được giữ, body) khi đọc và trước khi ghi, payload trước mỗi lệnh tracker.write. Giá trị khớp thay bằng [REDACTED]; cảnh báo chỉ nêu nguồn và field, không lặp lại giá trị."
      invariant_refs:
        - INV-002
    - id: SEC-003
      statement: "Ghi tracker chỉ sau khi write plan được duyệt và hash plan khớp. Ngay trước mỗi update: đọc lại ticket; fingerprint vùng skill hoặc phần ngoài vùng khác lúc duyệt thì huỷ op đó và hỏi lại. Sau khi ghi: đọc lại so field đã ghi và fingerprint phần ngoài vùng; lệch thì báo, không claim thành công. Không xoá, không chuyển trạng thái; trùng lặp không phân xử được thì dừng và hỏi. Gate này không tính bước xin quyền của runtime như một lớp chặn. Lựa chọn trong menu hay lời giao việc không phải duyệt write plan. Không ghi đè toàn bộ mô tả ticket; nội dung ghi luôn là output của CLI merge. Kiểm sau khi ghi: fingerprint phần ngoài vùng của lần đọc trước khi ghi và lần đọc sau khi ghi phải bằng nhau (cùng chuẩn hoá của tracker), và text của vùng bằng text của bản render sau khi chuẩn hoá khoảng trắng. Không chạy được CLI thì không ghi tracker, chỉ render bản nháp copy-paste."
      invariant_refs:
        - INV-001
        - INV-006
    - id: SEC-004
      statement: "CLI kiểm tra nhận nội dung không tin cậy (file trong workspace, nội dung nguồn và ticket qua stdin): không thực thi, không eval, không theo đường dẫn ghi trong nội dung; chỉ đọc file dưới workspace đã resolve, từ chối traversal và symlink ra ngoài. Secret trong vùng của skill thì thay bằng [REDACTED] trước khi merge; secret ngoài vùng thì báo theo vị trí và exit 1, không bao giờ sửa nội dung đó, và op đó chuyển sang bản nháp copy-paste kèm cảnh báo cho người dùng."
      invariant_refs:
        - INV-009
        - INV-002
        - INV-006
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
    - D-009
    - D-010
    - D-011
  deferred_decision_refs: []
  assumption_refs:
    - A-001
    - A-002
    - A-003
  validation_obligations:
    - id: VAL-001
      expected_proof: "Unit test RED trước/PASS sau cho helper: resolve path/slug/reserved name; phân loại kind và field lifecycle; validator config (secret ở frontmatter, field lạ và body; field thiếu; roster sai dạng; quy tắc lần chạy không persist); format 12 mục; confidence; rubric và ngưỡng Fibonacci; cân tải có và không có velocity, mức sẵn sàng 0, tổng point 0; phủ PRD; task_id, cấp NN, tombstone; marker parse/merge và fingerprint vùng/ngoài vùng; write plan (op enum, denylist, approval qua approved-artifact với body là JSON ổn định của op, metadata cố định, từ chối run_id khác, đổi op thì verify fail, repo không có Git revision thì fallback); quét secret trên nguồn, output subagent, config và payload; fixture prompt injection; render báo cáo. Thêm: renderTask cho text và rich-json (tập node tối thiểu); merge và fingerprint rich-json (giữ node media ngoài vùng, nối section khi chưa có marker, bỏ attr tracker tự sinh); file task vẫn hợp lệ sau khi cập nhật block tickets và thêm block write plan; tasks - thiếu --slug/--scope bị từ chối; CLI project/tasks/scan/balance/plan-approve/plan-verify/drift/merge/report trả kết luận đúng cho file hợp lệ, file thiếu field (như project.md của lần chạy thật), markdown lệch renderTask(block), điểm lệch breakdown, NN dùng lại ở file khác cùng slug, hai block write plan cùng run_id, fingerprint trong op đã hash, op đổi sau duyệt, run_id khác, secret ngoài vùng."
      owner: executor
      invariant_refs:
        - INV-001
        - INV-002
        - INV-004
        - INV-005
        - INV-006
      acceptance_criterion_refs:
        - AC-003
    - id: VAL-002
      expected_proof: "Contract test: source.read/tracker.write và external_source_read/issue_tracker_write có mặt đồng thời trong capability-contract, ACTIONS/CAPABILITIES của runtime-policy, harness README và test khoá danh sách; 4 adapter có status/native/fallback/capability; resolveAction trả native khi host quan sát được connector cho đúng action/mode và trả fallback khi không; tool không khai read-only không được dùng cho source.read; capability unsupported luôn ép fallback; validateProviderNeutralText sạch trên skill/ref mới; allowed-tools sinh ra của sdcorejs-product không chứa tool connector."
      owner: executor
      invariant_refs:
        - INV-003
      acceptance_criterion_refs:
        - AC-003
    - id: VAL-003
      expected_proof: Prompt eval mới cho task-breakdown vào product, prompt TASKID cũ vẫn vào documentation; toàn bộ prompt-evals pass.
      owner: executor
      invariant_refs:
        - INV-007
      acceptance_criterion_refs:
        - AC-003
    - id: VAL-004
      expected_proof: "Kết quả lần chạy thật thứ ba và thứ tư (PR #79, #80) áp dụng cho nhánh port vì file skill, ref và CLI của mode giống từng byte với f19c72c (D-003 của spec port); nếu một điều chỉnh chạm vào các file đó thì phải chạy thật lại."
      owner: user + executor
      invariant_refs:
        - INV-001
        - INV-002
        - INV-006
        - INV-008
      acceptance_criterion_refs:
        - AC-003
    - id: VAL-005
      expected_proof: npm run check:skills và npm run test:e2e:repository xanh trên Node 22.22.3; số public skill = 23; CHANGELOG Unreleased.
      owner: executor
      invariant_refs:
        - INV-007
      acceptance_criterion_refs:
        - AC-003
    - id: VAL-006
      expected_proof: "Contract test RED trước/PASS sau: (1) flow-gate trên skill và _refs/product/task-breakdown.md: có G0..G8 theo thứ tự, mỗi cổng có điểm dừng và bằng chứng đã định, câu duyệt write plan tách khỏi lựa chọn menu, cấm ghi đè toàn bộ, NOT RUN phải kèm lệnh đã thử và lỗi, fan-out bắt buộc khi đủ điều kiện, quy tắc tìm gốc skill pack; mutation guard xoá từng câu thì test fail. Test text chỉ chứng minh hướng dẫn có mặt; hành vi được chứng minh ở VAL-004. (2) CLI: --root bắt buộc, giới hạn workspace, từ chối traversal/symlink/slug sai với exit 2; import trực tiếp của check.mjs không có API ghi file, tiến trình con hay mạng; chạy mọi command trong thư mục tạm rồi so snapshot file trước và sau là bằng nhau; output một JSON."
      owner: executor
      invariant_refs:
        - INV-001
        - INV-008
        - INV-009
      acceptance_criterion_refs:
        - AC-003
    - id: VAL-007
      expected_proof: "Lệnh kiểm parity: 40 file nguồn của 3 change giống từng byte với f19c72c, chỉ trừ danh sách điều chỉnh của plan; git grep không thấy observeChoiceTools, nhánh user.choose của resolveAction, case-repair-policy-ask-native hay record của nhánh nền; parseApprovedFrontmatter giống bản ở 4703643."
      owner: executor
      invariant_refs:
        - INV-012
      acceptance_criterion_refs:
        - AC-001
        - AC-002
    - id: VAL-008
      expected_proof: npm run sync:skills rồi check:skills in sync; test mirror-refs-resolution pass trên mọi skill của main.
      owner: executor
      invariant_refs:
        - INV-010
      acceptance_criterion_refs:
        - AC-004
    - id: VAL-009
      expected_proof: check:skills, check:text-hygiene, check:executable-references, test:e2e:repository và evidence test xanh trên Node 22.22.3; continuation mới nối vào chuỗi của main; PR mergeable; quét diff không có thông tin nội bộ.
      owner: executor
      invariant_refs:
        - INV-007
        - INV-012
      acceptance_criterion_refs:
        - AC-005
        - AC-006
  profile_sections:
    frontend_architecture_ref: null
    agent_architecture_ref: null
  change_control:
    revision: 2
    supersedes: architecture-task-breakdown-main-port-v1-r1
decision_coverage:
  schema_version: 1
  revision: 2
  records:
    - id: R-001
      type: requirement
      statement: Port hành vi đã duyệt của product-task-breakdown-mode-v1 (cổng G0..G8, check CLI chỉ đọc, helper _refs/product/task-breakdown/, action source.read/tracker.write, root project_workspaces, artifact kind project-config và task-breakdown, route và lifecycle), không thêm hay bớt hành vi.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-002
      type: requirement
      statement: "Port mirror-refs-path-resolution-v1: script sinh mirror viết ../../_refs/ và dòng path-resolution cho plugin và .claude, hook session-start chèn đường dẫn tuyệt đối, test đi kèm, áp dụng cho mọi skill hiện có trên main."
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-003
      type: requirement
      statement: "Port task-breakdown-source-guidance-v1: check sources -, help của CLI, câu chữ G1/G8 và bảng loại nguồn, case-mirror-refs-unchanged dạng kiểm thuộc tính."
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-004
      type: requirement
      statement: Từ nhánh nền chỉ mang sang parseApprovedFrontmatter; không mang observeChoiceTools, nhánh user.choose/user.approve của resolveAction, test case-repair-policy-ask-native, hay record, spec, contract, skill nào khác của nhánh nền.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-005
      type: requirement
      statement: Mỗi file nguồn thuộc 3 change (40 file từ git diff 4703643 f19c72c, không tính mirror và harness json sinh ra, .sdcorejs/** và 3 record evidence cũ; có plugin/hooks/session-start.mjs) giống từng byte với f19c72c, trừ danh sách điều chỉnh plan khai báo kèm lý do; có lệnh kiểm tự động và kết quả ghi vào delivery doc.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-006
      type: requirement
      statement: "Governance trên main: evidence continuation mới nối vào chuỗi của main, mục VALIDATION.md, refresh summary nếu stale, 3 entry CHANGELOG Unreleased, giữ nguyên 24 public skill của main, không dependency, không bump version; không mang artifact .sdcorejs cũ và 3 record evidence cũ của 3 change."
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-007
      type: requirement
      statement: "Giao hàng: một nhánh mới từ main, một PR vào main không xung đột; quét diff không còn tên người, key ticket hay domain nội bộ."
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: AC-001
      type: acceptance-criterion
      statement: Chạy lệnh kiểm parity so 40 file nguồn của 3 change với f19c72c -> Mọi file giống từng byte, trừ đúng danh sách điều chỉnh của plan, mỗi điều chỉnh có lý do
      behavior: Chạy lệnh kiểm parity so 40 file nguồn của 3 change với f19c72c
      expected_result: Mọi file giống từng byte, trừ đúng danh sách điều chỉnh của plan, mỗi điều chỉnh có lý do
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-001
        - R-002
        - R-003
        - R-005
      task_refs: []
    - id: AC-002
      type: acceptance-criterion
      statement: git grep trên nhánh port các symbol, test và record của nhánh nền; so parseApprovedFrontmatter với 4703643 -> Không có observeChoiceTools, nhánh user.choose của resolveAction, case-repair-policy-ask-native hay record của nhánh nền; parseApprovedFrontmatter có mặt và giống bản ở 4703643
      behavior: git grep trên nhánh port các symbol, test và record của nhánh nền; so parseApprovedFrontmatter với 4703643
      expected_result: Không có observeChoiceTools, nhánh user.choose của resolveAction, case-repair-policy-ask-native hay record của nhánh nền; parseApprovedFrontmatter có mặt và giống bản ở 4703643
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-004
      task_refs: []
    - id: AC-003
      type: acceptance-criterion
      statement: Chạy các suite của 3 change trên base mới -> 3 suite task-breakdown, mirror-refs-resolution, harness-behavioral-sentinel, artifact-path-convention, skill-pack-runner, production-readiness-contract đều pass
      behavior: Chạy các suite của 3 change trên base mới
      expected_result: 3 suite task-breakdown, mirror-refs-resolution, harness-behavioral-sentinel, artifact-path-convention, skill-pack-runner, production-readiness-contract đều pass
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-001
        - R-002
        - R-003
      task_refs: []
    - id: AC-004
      type: acceptance-criterion
      statement: Đọc mirror plugin và .claude của mọi skill trên main sau npm run sync:skills -> Mọi tham chiếu _refs/ có dạng ../../_refs/ và có dòng path-resolution; check:skills in sync
      behavior: Đọc mirror plugin và .claude của mọi skill trên main sau npm run sync:skills
      expected_result: Mọi tham chiếu _refs/ có dạng ../../_refs/ và có dòng path-resolution; check:skills in sync
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-002
      task_refs: []
    - id: AC-005
      type: acceptance-criterion
      statement: Chạy check:skills, check:text-hygiene, check:executable-references, test:e2e:repository và evidence test trên Node 22.22.3 -> Tất cả xanh; continuation mới hợp lệ; record của main verify không đổi; 24 public skill của main; CHANGELOG có 3 entry
      behavior: Chạy check:skills, check:text-hygiene, check:executable-references, test:e2e:repository và evidence test trên Node 22.22.3
      expected_result: Tất cả xanh; continuation mới hợp lệ; record của main verify không đổi; 24 public skill của main; CHANGELOG có 3 entry
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-006
      task_refs: []
    - id: AC-006
      type: acceptance-criterion
      statement: Tạo PR vào main và quét diff của nhánh port -> PR mergeable; quét diff không còn tên người, key ticket hay domain nội bộ
      behavior: Tạo PR vào main và quét diff của nhánh port
      expected_result: PR mergeable; quét diff không còn tên người, key ticket hay domain nội bộ
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-007
      task_refs: []
    - id: A-001
      type: assumption
      statement: Mode chạy đúng trên main vì mọi khái niệm skill và ref dùng tới đều đã có trên main (user.choose/user.approve, read-only-request, write_policy, resolveArtifactOwner, parallel-dispatch).
      source: inferred
      confidence: high
      status: proposed
      blocking: false
      evidence_refs:
        - port-trial-2026-10-17-cherry-pick-and-git-grep
      consequence_if_wrong: Test của change fail trên base mới.
      validation_method: AC-003 và AC-005.
      owner: executor
      rationale: Lần thử cherry-pick chỉ ra một phụ thuộc là parseApprovedFrontmatter; git grep thấy các khái niệm còn lại trên main.
      impacted_refs:
        - R-001
        - R-003
    - id: A-002
      type: assumption
      statement: Test do main thêm sau base cũ có thể kiểm thêm điều kiện lên file mới.
      source: inferred
      confidence: medium
      status: proposed
      blocking: false
      evidence_refs:
        - main-20-commits-since-ac820d7
      consequence_if_wrong: Không cần điều chỉnh thêm.
      validation_method: Full suite.
      owner: executor
      rationale: main đã có cleanup workflow và gộp hướng dẫn agent kèm test mới.
      impacted_refs:
        - R-005
        - R-006
    - id: A-003
      type: assumption
      statement: Mặc định governance như R-006.
      source: defaulted
      confidence: high
      status: proposed
      blocking: false
      evidence_refs:
        - repository-governance-precedent
      consequence_if_wrong: Plan phải thêm hoặc bỏ task quản trị.
      validation_method: Người dùng xác nhận khi duyệt spec.
      owner: spec approver
      rationale: test:e2e:repository khoá các artifact này cho mỗi thay đổi.
      impacted_refs:
        - R-006
    - id: D-001
      type: decision
      statement: "Hướng xử lý: Tách 3 change khỏi nhánh codex/simplify-design-handoff và port lên main"
      question: Hướng xử lý
      selected_value: Tách 3 change khỏi nhánh codex/simplify-design-handoff và port lên main
      source: explicit-user
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Nhánh nền từ tháng 9 chưa từng có PR; người dùng chọn tách.
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-001
        - R-002
        - R-003
        - R-004
      task_refs: []
    - id: D-002
      type: decision
      statement: "Nhánh và commit: Nhánh feat/task-breakdown-mode-main từ origin/main (fb64f8c), một commit feat(product)"
      question: Nhánh và commit
      selected_value: Nhánh feat/task-breakdown-mode-main từ origin/main (fb64f8c), một commit feat(product)
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Một đơn vị review và một evidence continuation gắn với đúng nội dung được merge.
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-007
        - AC-006
      task_refs: []
    - id: D-003
      type: decision
      statement: "Chạy thật: Không chạy lại khi file skill, ref và CLI giống từng byte với f19c72c"
      question: Chạy thật
      selected_value: Không chạy lại khi file skill, ref và CLI giống từng byte với f19c72c
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Kết quả lần chạy thứ ba và thứ tư vẫn áp dụng cho nội dung giống hệt.
      supersedes: null
      revisit_condition: Một điều chỉnh chạm vào file skill, ref hoặc CLI của mode.
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-005
        - AC-001
      task_refs: []
    - id: D-004
      type: decision
      statement: "Artifact cũ: Không mang .sdcorejs/** của 3 change; nguồn gốc ghi bằng PR #78, #79, #80 và commit f19c72c"
      question: Artifact cũ
      selected_value: "Không mang .sdcorejs/** của 3 change; nguồn gốc ghi bằng PR #78, #79, #80 và commit f19c72c"
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Các artifact đó gắn với revision không có trong lịch sử main.
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-006
      task_refs: []
    - id: D-005
      type: decision
      statement: "Architecture: Gate bắt buộc, kế thừa 4 signal; architecture của port nhắc lại quyết định và invariant đã duyệt trên base main và thêm invariant về phụ thuộc tối thiểu"
      question: Architecture
      selected_value: Gate bắt buộc, kế thừa 4 signal; architecture của port nhắc lại quyết định và invariant đã duyệt trên base main và thêm invariant về phụ thuộc tối thiểu
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Port đưa lên main đúng các contract dùng chung đã cần architecture.
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-001
        - R-004
      task_refs: []
    - id: D-006
      type: decision
      statement: "PR cũ: Chỉ đóng #78, #79, #80 sau khi PR mới tạo và người dùng xác nhận riêng; comment dẫn sang PR mới; giữ các nhánh trên remote"
      question: PR cũ
      selected_value: "Chỉ đóng #78, #79, #80 sau khi PR mới tạo và người dùng xác nhận riêng; comment dẫn sang PR mới; giữ các nhánh trên remote"
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Đóng PR là thao tác ra ngoài, cần xác nhận riêng.
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-007
      task_refs: []
    - id: D-007
      type: decision
      statement: "Cách kiểm: Dùng lại test của 3 change; parity và không mang thừa là lệnh kiểm một lần ghi vào delivery doc, không thêm vào suite"
      question: Cách kiểm
      selected_value: Dùng lại test của 3 change; parity và không mang thừa là lệnh kiểm một lần ghi vào delivery doc, không thêm vào suite
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Không tạo lại test so với base cố định.
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-004
        - R-005
        - AC-001
        - AC-002
      task_refs: []
    - id: D-008
      type: decision
      statement: "Kiến trúc của mode task-breakdown: Giữ nguyên các quyết định của architecture r2 đã duyệt cho product-task-breakdown-mode-v1 (PR #78): action trung lập source.read/tracker.write lấy từ connector host quan sát được, root project_workspaces và hai artifact kind, format 12 mục, gate ghi tracker có write plan và merge theo marker, helper thuần cùng CLI kiểm tra chỉ đọc, đọc song song chỉ đọc, chuỗi cổng G0..G8"
      question: Kiến trúc của mode task-breakdown
      selected_value: "Giữ nguyên các quyết định của architecture r2 đã duyệt cho product-task-breakdown-mode-v1 (PR #78): action trung lập source.read/tracker.write lấy từ connector host quan sát được, root project_workspaces và hai artifact kind, format 12 mục, gate ghi tracker có write plan và merge theo marker, helper thuần cùng CLI kiểm tra chỉ đọc, đọc song song chỉ đọc, chuỗi cổng G0..G8"
      source: approved-spec
      status: approved
      blocking: true
      scope: public-contract
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Port không đổi hành vi; mọi quyết định đã qua review và duyệt ở architecture r2.
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-001
        - AC-001
        - AC-003
      task_refs: []
    - id: D-009
      type: decision
      statement: "Đường dẫn _refs trong mirror Claude: Mirror plugin và .claude viết ../../_refs/ cùng một dòng path-resolution; hook session-start chèn đường dẫn tuyệt đối dưới plugin root; mirror codex và file sinh từ AGENTS.md giữ cách viết riêng"
      question: Đường dẫn _refs trong mirror Claude
      selected_value: Mirror plugin và .claude viết ../../_refs/ cùng một dòng path-resolution; hook session-start chèn đường dẫn tuyệt đối dưới plugin root; mirror codex và file sinh từ AGENTS.md giữ cách viết riêng
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: "Theo spec đã duyệt của mirror-refs-path-resolution-v1 (PR #79)."
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-002
        - AC-004
      task_refs: []
    - id: D-010
      type: decision
      statement: "Hướng dẫn nguồn và help của CLI: Lệnh chỉ đọc check sources - với danh sách kind id cố định do model chọn; G1 và G8 in nguyên văn result.table; --help, -h, help trả cùng một verdict JSON"
      question: Hướng dẫn nguồn và help của CLI
      selected_value: Lệnh chỉ đọc check sources - với danh sách kind id cố định do model chọn; G1 và G8 in nguyên văn result.table; --help, -h, help trả cùng một verdict JSON
      source: approved-spec
      status: approved
      blocking: true
      scope: public-contract
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: "Theo spec đã duyệt của task-breakdown-source-guidance-v1 (PR #80)."
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-003
        - AC-003
      task_refs: []
    - id: D-011
      type: decision
      statement: "Phụ thuộc vào nhánh nền: Chỉ chép parseApprovedFrontmatter từ 4703643 vào _refs/shared/approved-artifact.mjs, giữ nguyên từng byte; observeChoiceTools, nhánh user.choose của resolveAction và mọi phần khác của nhánh nền không có mặt"
      question: Phụ thuộc vào nhánh nền
      selected_value: Chỉ chép parseApprovedFrontmatter từ 4703643 vào _refs/shared/approved-artifact.mjs, giữ nguyên từng byte; observeChoiceTools, nhánh user.choose của resolveAction và mọi phần khác của nhánh nền không có mặt
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rationale: Lần thử cherry-pick chỉ ra đây là phụ thuộc duy nhất mà code của change gọi tới.
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-004
        - R-005
        - AC-001
        - AC-002
      task_refs: []
    - id: INV-001
      type: invariant
      statement: Không có lệnh tracker.write nào nếu chưa có write plan được duyệt trong chính lần chạy đó (run_id khớp lần chạy hiện tại) và approval hash của plan verify được với danh sách op sắp chạy; plan đổi thì phải duyệt lại; chỉ có op create/update, không có field trạng thái/transition; không báo thành công khi chưa đọc lại kiểm. Chọn một mục trong menu hay giao việc ghi chỉ là ý định, không phải duyệt write plan; duyệt write plan là một câu trả lời riêng cho đúng danh sách op đã hiện. Mỗi op chỉ chạy sau khi CLI kiểm tra trả verify hợp lệ trong lần chạy đó; không ghi đè toàn bộ mô tả ticket. Gate này do skill giữ, không dựa vào bước xin quyền của runtime.
      protected_refs:
        - R-001
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-002
      type: invariant
      statement: Nội dung nguồn, output của subagent và config sửa tay là dữ liệu không tin cậy, không phải lệnh; giá trị secret không bao giờ được persist vào task, artifact, config, payload ghi tracker hay lặp lại trong chat.
      protected_refs:
        - R-001
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-003
      type: invariant
      statement: Skill/ref source trung lập provider; action mới có mapping và fallback ở cả 4 adapter và có mặt đồng thời trong mọi danh sách exact-set; không tool connector nào được duyệt sẵn qua allowed-tools; native chỉ đến từ tool được host quan sát trong session.
      protected_refs:
        - R-001
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-004
      type: invariant
      statement: Project workspace chỉ nằm dưới root registry với slug/scope theo pattern và kiểm tên reserved sẵn có, file có schema_version và field lifecycle được kiểm; kind project-config và task-breakdown là shared kind, commit_policy conditional; v1 chỉ mode task-breakdown được ghi.
      protected_refs:
        - R-001
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-005
      type: invariant
      statement: Mỗi task có đủ 12 mục theo key và thứ tự cố định, confidence, size kèm breakdown, task_id ổn định không tái sử dụng số; ma trận phủ PRD không có yêu cầu bị bỏ sót.
      protected_refs:
        - R-001
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-006
      type: invariant
      statement: Cập nhật ticket chỉ thay vùng giữa marker của skill khi fingerprint vùng còn khớp, hoặc chèn section mới; đọc lại ngay trước khi ghi và huỷ nếu ticket đổi so với lúc duyệt; fingerprint phần ngoài vùng giữ nguyên sau khi ghi; không xoá ticket, không chuyển trạng thái.
      protected_refs:
        - R-001
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-007
      type: invariant
      statement: "Hành vi hiện có giữ nguyên: 24 public skill của main, mode Seed/Update/Audit của product không đổi, định tuyến TASKID record vẫn vào documentation."
      protected_refs:
        - R-001
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-008
      type: invariant
      statement: "Các cổng G0..G8 của flow đi đúng thứ tự và không gộp: chưa resolve hoặc tạo xong project (wizard có bản xem trước được duyệt) thì không inventory story và không tách task; inventory story, ticket con có sẵn và vai trò trước khi tách task; có từ 2 story và runtime hỗ trợ subagent thì fan-out read-only; hỏi mức sẵn sàng trước khi gợi ý assignee; bảng đề xuất được duyệt trước khi lưu tasks/<scope>.md; nội dung được kiểm bằng CLI trên đúng bytes trước khi ghi và kiểm lại file sau khi ghi; mỗi cổng dẫn bằng chứng đã định cho cổng đó, NOT RUN chỉ hợp lệ khi kèm lệnh đã thử và lỗi hoặc lời từ chối quyền."
      protected_refs:
        - R-001
        - R-003
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-009
      type: invariant
      statement: "CLI kiểm tra chỉ đọc: --root là bắt buộc, được realpath và in lại trong kết luận; chỉ đọc file nằm dưới <root>/.sdcorejs/projects/<slug>/ (kiểm từng đoạn bằng lstat, từ chối symlink ra ngoài và traversal) hoặc stdin; không ghi file, không gọi mạng, tracker hay tiến trình con; slug sai hay path ngoài workspace thì exit 2; in đúng một kết luận JSON và exit code 0 hợp lệ, 1 không hợp lệ, 2 lỗi dùng hoặc I/O; không bao giờ sửa nội dung ngoài vùng của skill, kể cả để che secret."
      protected_refs:
        - R-001
        - R-003
        - AC-001
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-010
      type: invariant
      statement: Mirror plugin và .claude của mọi skill viết mỗi tham chiếu _refs/ đi trước một đoạn đường dẫn thành ../../_refs/ và có đúng một dòng path-resolution; bootstrap do hook chèn chỉ dùng đường dẫn _refs tuyệt đối có thật; mirror codex, skill nguồn và file sinh từ AGENTS.md không mang dòng path-resolution của layout Claude.
      protected_refs:
        - R-002
        - AC-004
      task_refs: []
      evidence_refs: []
    - id: INV-011
      type: invariant
      statement: Lệnh sources và help của check CLI chỉ đọc, in đúng một verdict JSON; kind id và danh sách lệnh khớp giữa CLI và ref của mode; giá trị dạng secret không xuất hiện trong bảng hướng dẫn.
      protected_refs:
        - R-003
        - AC-003
      task_refs: []
      evidence_refs: []
    - id: INV-012
      type: invariant
      statement: "Nhánh port chỉ chứa nội dung của 3 change cộng parseApprovedFrontmatter: 40 file nguồn của 3 change giống từng byte với f19c72c trừ danh sách điều chỉnh của plan; observeChoiceTools, nhánh user.choose của resolveAction, test case-repair-policy-ask-native và record của nhánh nền không có mặt."
      protected_refs:
        - R-004
        - R-005
        - AC-001
        - AC-002
      task_refs: []
      evidence_refs: []
  history:
    - revision: 1
      active:
        - id: R-001
          type: requirement
        - id: R-002
          type: requirement
        - id: R-003
          type: requirement
        - id: R-004
          type: requirement
        - id: R-005
          type: requirement
        - id: R-006
          type: requirement
        - id: R-007
          type: requirement
        - id: AC-001
          type: acceptance-criterion
        - id: AC-002
          type: acceptance-criterion
        - id: AC-003
          type: acceptance-criterion
        - id: AC-004
          type: acceptance-criterion
        - id: AC-005
          type: acceptance-criterion
        - id: AC-006
          type: acceptance-criterion
        - id: A-001
          type: assumption
        - id: A-002
          type: assumption
        - id: A-003
          type: assumption
        - id: D-001
          type: decision
        - id: D-002
          type: decision
        - id: D-003
          type: decision
        - id: D-004
          type: decision
        - id: D-005
          type: decision
        - id: D-006
          type: decision
        - id: D-007
          type: decision
      tombstones: []
    - revision: 2
      active:
        - id: R-001
          type: requirement
        - id: R-002
          type: requirement
        - id: R-003
          type: requirement
        - id: R-004
          type: requirement
        - id: R-005
          type: requirement
        - id: R-006
          type: requirement
        - id: R-007
          type: requirement
        - id: AC-001
          type: acceptance-criterion
        - id: AC-002
          type: acceptance-criterion
        - id: AC-003
          type: acceptance-criterion
        - id: AC-004
          type: acceptance-criterion
        - id: AC-005
          type: acceptance-criterion
        - id: AC-006
          type: acceptance-criterion
        - id: A-001
          type: assumption
        - id: A-002
          type: assumption
        - id: A-003
          type: assumption
        - id: D-001
          type: decision
        - id: D-002
          type: decision
        - id: D-003
          type: decision
        - id: D-004
          type: decision
        - id: D-005
          type: decision
        - id: D-006
          type: decision
        - id: D-007
          type: decision
        - id: D-008
          type: decision
        - id: D-009
          type: decision
        - id: D-010
          type: decision
        - id: D-011
          type: decision
        - id: INV-001
          type: invariant
        - id: INV-002
          type: invariant
        - id: INV-003
          type: invariant
        - id: INV-004
          type: invariant
        - id: INV-005
          type: invariant
        - id: INV-006
          type: invariant
        - id: INV-007
          type: invariant
        - id: INV-008
          type: invariant
        - id: INV-009
          type: invariant
        - id: INV-010
          type: invariant
        - id: INV-011
          type: invariant
        - id: INV-012
          type: invariant
      tombstones: []
```

## Decisions captured during review
- (approved as drafted) Người dùng trả lời `1` tại gate duyệt architecture r2 ngày 2026-10-17.
- Revision 2 chỉ đổi parent sang spec r2 và sửa tập file (40) cùng số public skill (24) trong INV-007, INV-012 và VAL-007.
- Nội dung kế thừa architecture r2 đã duyệt của product-task-breakdown-mode-v1 (PR #78); không có lượt review read-only riêng cho bản port.

## Skill provenance
sdcorejs-architecture (approved on attempt 2 / 3)
