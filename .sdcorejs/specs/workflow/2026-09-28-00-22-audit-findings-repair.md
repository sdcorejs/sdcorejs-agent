---
acceptance_criteria_count: 22
approval_decision_fingerprint: sha256:1b951df5f5bbe5c74f9f4a4df71fc29a5782f2124838d9a090895178a6025cd2
approval_gate: sdcorejs-spec:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-09-27T18:13:16.977Z
approved_by: user
approved_draft_fingerprint: sha256:5501afd5be6f009cef255c16a9fd6e33ace0da55caaa32c399d0fb4306d2d0b0
artifact_id: spec-audit-findings-repair-20260928-r1
artifact_kind: spec
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: audit-findings-repair-20260928
commit_policy: with-change
contract_id: audit-findings-repair-20260928
description: Repair every confirmed step-6 audit finding with regression-first
  evidence and no contract loosening.
manual_criteria_count: 0
name: audit-findings-repair
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
profile_confidence: high
redaction_applied: false
repository_relative_path: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
requirement_id: audit-findings-repair-20260928
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-09-28-00-22-audit-findings-repair-spec.md
source_plan: none
source_revision: 70c933c3fc59a98b92c03004de902bc96250fba6
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892
---
# Repair các finding của audit bước 6 — Approved Spec

> Immutable snapshot of the draft approved by the user. The embedded draft approval fields describe its pre-approval state; this artifact metadata and verified hash govern approval.

## Approved contract

# Spec — Repair các finding của audit bước 6 — 2026-09-28 00:22

## Problem & Goals
Audit độc lập bước 6 trên HEAD 70c933c3fc59a98b92c03004de902bc96250fba6 (tree sạch; `test:e2e:repository` 803/803 PASS) tái hiện được 26 finding mà suite hiện tại không phủ. Trong đó có 2 finding High chung một nguyên nhân gốc: finish-tail và simplify Apply không chạy được trên repository kích thước thật. Mục tiêu: sửa toàn bộ finding đã confirmed, mỗi finding có regression RED trước và PASS sau; giữ fail-closed ở các đường chặn, đồng thời làm cho luồng hợp lệ chạy được; không nới contract để test xanh.

## Baseline evidence (audit bước 6, chỉ đọc)
| Finding | Mức | Tái hiện |
| --- | --- | --- |
| IF-1 / S-1 | High | `createRepositoryObservationRuntime` trên repo này báo "repository byte limit exceeded" (229 MB do `site/`, `node_modules/` bị ignore); junction trong ignored output throw; cache bị ignore tự ghi lại làm receipt fail |
| UR-1 | Medium | review_context thường → ship/repair/Angular UI consumer BLOCKED với 8 blocker UI; bỏ context → NOT APPLICABLE |
| IF-2 | Medium | next_action dùng `evidence_phase` không có trong tài liệu; host ghi receipt theo `phase` lặp mãi |
| S-4 / IF-5 | Medium / Low | pass simplify pending ghi lại đúng byte HEAD → finish `tail-complete`, `simplify: skip`, ledger `not-run` |
| S-2 | Medium | Analyze giữ status verified do caller khai và vẫn cấp receipt |
| S-3 | Medium | `git diff --check` toàn tree: whitespace/CRLF có sẵn chặn pass hợp lệ và rollback |
| UR-2 | Medium | lần chạy interaction fail bị từ chối ("not executed"), lỗi thật chỉ thành gap |
| DH-1 | Medium | `design_system_reuse.evidence_refs` bắt buộc không rỗng, greenfield không verify được |
| ST-1 | Medium | body/ref Angular không còn trỏ `styling.md`; actions/admin/init-module/init-portal mất rule styling |
| S-7 | Medium | ngoài test không có caller nào tạo simplify session; session chỉ sống trong một process |
| ST-5, ST-2, ST-3, ST-4 | Low | conventions-read thiếu scanning discipline; test chỉ kiểm tồn tại không kiểm nơi load; AC-013 bước 5 báo quá mức; 2 con trỏ lệch |
| S-5, S-6 | Low | rollback đòi xóa edit đồng thời của user; ghi xuyên root qua hard link |
| IF-3, IF-4 | Low | finish:policy một option bị auto-select; resolveAction bỏ qua native surface đã lỗi |
| UR-3, UR-4, UR-5 | Low | guard source-only chỉ bắt chữ "PASS"; gate phân biệt hoa/thường; 3 test pass vì payload sai cấu trúc |
| DH-2, DH-3 | Low | tài liệu nói Figma/FigJam hợp lệ; tài liệu mô tả sai giá trị trả về của resolver |
| G-1 | Low | snapshot bước 1 có dòng trống phân cách; không có loader canonical |

Probe tái hiện nằm trong scratchpad của phiên audit (local-only, không commit): `audit/{simplify,finish,ui-review,design-handoff,structure}/`, `audit/coord-*.mjs`, `audit/graph-*.mjs`.

## Requirements
- R-001 — Observer dùng được trên repository thật (IF-1, S-1).
- R-002 — Finish-tail hội tụ và không claim done sai (IF-2, S-4, IF-5, IF-3, IF-4).
- R-003 — Evidence simplify trung thực và giữ thay đổi của user (S-2, S-3, S-5, S-6).
- R-004 — Simplify có trusted host thực tế (S-7).
- R-005 — UI review phân biệt đúng các trạng thái (UR-1..UR-5).
- R-006 — Design handoff hỗ trợ greenfield và tài liệu khớp schema (DH-1..DH-3).
- R-007 — Cấu trúc skill không mất đường load (ST-1..ST-5).
- R-008 — Loader approved artifact canonical (G-1).
- R-009 — Governance: RED trước/PASS sau, không nới test, 23 skill, mirror bằng script, không dependency, evidence tách tầng, không commit/push khi chưa được yêu cầu.

## Decisions
- D-001 — Observer: metadata cho file bị ignore và symlink; cap chỉ cho nội dung tracked/untracked chưa ignore; volatile path khai trong approved plan/policy, không bao giờ được simplify/hook ghi; symlink trong write scope vẫn bị chặn. (user, quyết định 1/5)
- D-002 — Lần chạy UI fail: receipt cho mọi lần chạy hoàn tất với exit/assertion thật; coverage có `FAIL`; finding lỗi gắn receipt FAIL. (user, 2/5)
- D-003 — Greenfield: bản ghi no-baseline kèm lý do và tham chiếu approval; mọi mapping không `confirmed`. (user, 3/5)
- D-004 — Trusted host: script host canonical chạy trọn pass trong một process; consumer tự tính lại từ Git và nội dung hiện tại; receipt chỉ là chỉ mục. (user, 4/5)
- D-005 — Rollback theo scope; edit đồng thời được liệt kê, giữ nguyên, bắt baseline mới; chạm path của pass thì chặn. (user, 5/5)
- D-006 — Scope: toàn bộ finding đã confirmed; mục NEEDS-VERIFICATION ngoài scope. (user)
- D-007 — Đề xuất mặc định, chốt khi duyệt spec: IF-2 dùng `phase` làm khóa receipt; IF-3 luôn hỏi finish:policy; IF-4 resolveAction nhận `failed_surfaces`; UR-4 allowlist gate canonical; DH-2 thu hẹp tài liệu về html/svg; G-1 loader chịu đúng một dòng trống phân cách; ST-3 thêm test parity và ghi hiệu chỉnh, không đổi schema.
- D-008 — Đề xuất mặc định, chốt khi duyệt spec: một contract, ba workstream tuần tự (A observer/simplify/finish; B UI review và Design; C structure/test/loader); coverage TDD regression-first.

## Assumptions
Không có blocking assumption. Ghi chú: Node hệ thống v22.14.0 thấp hơn `engines`; verification dùng Node v22.22.3 (fnm).

## Architecture gate classification
- Status: required
- Signals: public-api-contract, security-trust-boundary, state-data-ownership
- Rationale: đổi hợp đồng dùng chung (hình dạng next_action của finish, enum coverage UI, field no-baseline của Design handoff), trust boundary của observer và simplify host, và quyền sở hữu evidence giữa producer và consumer. Sau khi spec được duyệt sẽ qua `sdcorejs-architecture` trước khi lập plan.

## Non-goals
- Không sửa các mục NEEDS-VERIFICATION của audit.
- Không thêm public skill, không đổi tên skill, không đổi approval/routing semantics ngoài các finding.
- Không sửa approved snapshot hay evidence record cũ; không migrate lịch sử.
- Không cài dependency/browser/probe tool; không chạy live/paid service; không commit/push khi chưa được yêu cầu.

## Architecture
Ba workstream dùng chung nguyên tắc: validator giữ fail-closed cho mọi đường chặn đã có, và bổ sung positive path được chứng minh bằng test.

- **A — observer/simplify/finish.** Observer tách hai lớp: nội dung (tracked và untracked chưa ignore; hash, có cap) và metadata (ignored và symlink; lstat, đích link). Volatile path là một danh sách khai trong approved plan/finish policy/simplify host policy; chỉ miễn cho độ ổn định của lệnh, không bao giờ là write target. Finish trả next_action có `phase` là khóa receipt; trạng thái simplify lấy từ ledger/lựa chọn đã ghi thay vì eligibility sau khi ghi. Simplify host là một entrypoint chạy trọn pass trong một process; consumer tái lập kết luận từ Git và nội dung hiện tại. Analyze không cấp verified; diff check và rollback theo path của pass; hard link bị từ chối.
- **B — UI review và Design.** UI consumer chỉ đánh giá khi context có purpose/ui_review hoặc có obligation; coverage thêm `FAIL` gắn receipt của lần chạy hoàn tất; rule claim runtime theo cấu trúc; gate canonical. Design handoff thêm bản ghi no-baseline gắn approval; tài liệu khớp schema 2.
- **C — structure, test, loader.** Body Angular và Explore khôi phục điều kiện load (styling; scanning/command discipline); review.md nêu đúng ref; test kiểm vị trí owner và khả năng load; test parity review_context; loader approved artifact canonical trong `approved-artifact.mjs`.

## Stack profile and technology assumptions
Workflow / markdown-skill-pack / standalone (AGENTS.md, package.json, skills/**, system-registry). Node test runner hiện có, npm@10.9.2; không dependency mới. Artifact viết tiếng Việt; reusable source giữ English.

## File structure
Candidate scope; plan sẽ chốt write paths chính xác:
- A: `_refs/shared/repository-observation.mjs`, `_refs/simplify/{repository-evidence.mjs,simplify-contract.mjs,verification.md,scope-and-invariants.md}`, một entrypoint host mới dưới `_refs/simplify/` hoặc `scripts/`, `_refs/shared/{finish-gate.mjs,finish-gate.md}`, `_refs/harness/runtime-policy.mjs`, `skills/shared/workflow/simplify.md`, các caller liên quan trong `_refs/orchestration/execution-contract.mjs`.
- B: `_refs/shared/{ui-review-contract.mjs,ui-review.md,test-ui-evidence.md,design-verification.mjs,design-handoff.mjs,design-handoff.md}`, `skills/tracks/design/sdcorejs-design.md`, `_refs/design/handoff-authoring.md`.
- C: `skills/tracks/angular/sdcorejs-angular.md`, `_refs/angular/styling.md`, `skills/shared/workflow/{explore.md,review.md}`, `_refs/shared/approved-artifact.mjs`.
- Test: suite hiện có của từng vùng (simplify-protected, harness-behavioral-sentinel, production-readiness, review-contract, design-handoff-contract, communication-economy, evidence) và regression mới cho từng finding.
- Evidence/metrics: record content-bound mới cho change này, section mới trong `VALIDATION.md`, delivery doc. Mirror qua `npm run sync:skills`.

## Acceptance criteria
- AC-001 (observer-real-repo) — Finish runtime và simplify session khởi tạo được trên repo này và trên fixture có node_modules bị ignore kèm symlink/junction; thay đổi metadata file bị ignore vẫn bị phát hiện.
- AC-002 (volatile-paths) — Cache volatile bị test ghi lại không làm fail receipt; simplify/hook ghi vào volatile path bị chặn; write vào path ignored không khai volatile vẫn bị phát hiện.
- AC-003 (symlink-scope) — Symlink ngoài write scope được quan sát theo metadata; symlink trong write scope vẫn bị chặn.
- AC-004 (finish-convergence) — `phase` của mọi next_action là khóa receipt; host làm đúng tài liệu hội tụ sau write, repair, Apply và stage A/B của worker; receipt fail nêu rõ phase cần chạy lại.
- AC-005 (simplify-pending) — Pass đã cấp quyền còn pending/unverified chặn tail-complete kể cả khi diff rỗng; tail-complete báo đúng lựa chọn đã ghi.
- AC-006 (policy-ask-native) — finish:policy không bị auto-select; resolveAction không trả lại native surface đã lỗi.
- AC-007 (analyze-honest) — Analyze không mang status verified cho check chưa chạy; tham chiếu evidence resolve theo session; consumer không coi Analyze là verification hiện tại.
- AC-008 (diff-check-scope) — Whitespace/CRLF có sẵn ngoài path của pass không chặn pass hay rollback; whitespace do pass tạo ra vẫn chặn.
- AC-009 (scoped-rollback) — Rollback theo path/hunk của pass; edit đồng thời được liệt kê, giữ nguyên, bắt baseline mới; chạm path của pass thì chặn.
- AC-010 (hardlink-target) — Write target có link count > 1 bị từ chối trước khi ghi.
- AC-011 (host-runner) — Host canonical chạy trọn pass trên repo tạm thật; consumer ở process khác tự tính lại và chạy verification mới; receipt bị sửa hoặc giả bị từ chối.
- AC-012 (ordinary-review) — review_context không có purpose/ui_review → NOT APPLICABLE ở UI consumer của ship, validation-map, repair, Angular, Next.js; payload UI giữ nguyên hành vi.
- AC-013 (failing-receipt) — Lần chạy fail hoàn tất được ghi với exit/assertion thật; coverage FAIL; finding lỗi gắn receipt FAIL được chấp nhận và ship chặn như lỗi; crash/timeout vẫn là gap.
- AC-014 (ui-claims-gates-tests) — Claim runtime trong finding source-only bị từ chối bất kể diễn đạt; gate ngoài allowlist bị từ chối; test dựng lại fail khi gỡ guard.
- AC-015 (greenfield-design) — Bản ghi no-baseline kèm approval verify được khi mọi mapping không confirmed; thiếu approval hoặc có confirmed thì chặn; dự án có UI vẫn phải trích source.
- AC-016 (design-docs) — Tài liệu nêu html/svg cho schema 2 và resolver trả path ledger; test đối chiếu tài liệu với helper.
- AC-017 (styling-reachable) — Mọi đường sinh Angular tới được `styling.md`; test reachability.
- AC-018 (explore-scan-pointers) — conventions-read và summary-refresh load scanning/command discipline; review.md hết con trỏ lệch.
- AC-019 (placement-tests) — Assertion theo file owner; mutation chuyển rule sang ref có điều kiện load khác bị phát hiện.
- AC-020 (schema-parity) — Có test parity review_context với field consumer bắt buộc; hiệu chỉnh AC-013 bước 5 ghi trong delivery và VALIDATION.
- AC-021 (artifact-loader) — Loader canonical verify mọi snapshot bước 1–5 không sửa file; bytes bị sửa vẫn fail; consumer/test dùng loader này.
- AC-022 (governance) — RED trước/PASS sau cho mỗi finding; assertion không giảm, không thêm skip; 23 skill; check:skills, hygiene, executable references và test:e2e:repository PASS trên nội dung cuối với Node thỏa engines; không dependency mới.

## Test and verification expectations
Mỗi finding: test regression viết trước, chạy RED trên HEAD hiện tại, rồi PASS sau khi sửa; kèm negative control giữ nguyên độ chặt. Focused suite theo vùng sau mỗi workstream; cuối cùng `npm run test:e2e:repository`, `npm run sync:skills`, `check:skills`, `check:text-hygiene`, `check:executable-references`, `node authoring/evals/run-deterministic.mjs`, `npm run test:e2e:skill-authoring` với Node v22.22.3. Live agent/browser/provider: NOT RUN, kèm kịch bản smoke. Lỗi git timeout do máy quá tải được chạy lại riêng và báo đúng, không tính là PASS.

## Risks & mitigations
- **Risk:** nới fail-closed khi sửa observer → **Mitigation:** giữ toàn bộ negative test cũ, thêm negative cho volatile path và symlink trong scope.
- **Risk:** đổi hình dạng next_action làm vỡ caller → **Mitigation:** cập nhật mọi caller và tài liệu cùng lúc; test drive-to-completion qua caller thật.
- **Risk:** test mới không phân biệt được hành vi → **Mitigation:** mỗi test có mutation/negative control chứng minh fail khi gỡ fix.
- **Risk:** scope lớn → **Mitigation:** ba workstream tuần tự, mỗi workstream có checkpoint verification riêng.

## Out of scope (deferred)
- Các mục NEEDS-VERIFICATION của audit — defer tới khi có quyết định riêng.
- Live-agent smoke — defer tới khi được authorize.

## Review decisions
Self-review: 22 AC phủ R-001..R-009; không placeholder; không blocking assumption; decision coverage hợp lệ ở stage spec; classifier trả required với ba signal. D-007/D-008 là đề xuất, chốt cùng lúc duyệt spec. Spec không cấp quyền architecture, plan hay implementation.

## Machine-readable contract
```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: audit-findings-repair-20260928
  requirement_id: audit-findings-repair-20260928
  approved_spec_path: null
  approved_spec_hash: null
  supersedes: null
  target_root: .
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  track: workflow
  stack_profile: markdown-skill-pack
  profile_confidence: high
  profile_evidence:
    - AGENTS.md
    - package.json
    - skills/**
    - _refs/shared/system-registry.json
  source_requirement_context: step6-audit-repair-brainstorming-20260928
  acceptance_criteria_count: 22
  manual_criteria_count: 0
  non_goals:
    - Không sửa các mục NEEDS-VERIFICATION của audit (IF NV-1..4, UR NV-1..6, DH-4..7, ST NV-1).
    - Không thêm public skill, không đổi tên skill, không đổi approval/routing semantics ngoài các finding.
    - Không sửa approved snapshot hay evidence record cũ; không migrate lịch sử.
    - Không cài dependency, browser hay probe tool; không chạy live/paid service; không commit/push khi chưa
      được yêu cầu.
  coverage_approach: tdd
  coverage_approach_status: proposed-for-this-spec-approval
  risks:
    - Nới fail-closed khi sửa observer
    - Đổi hình dạng next_action làm vỡ caller
    - Test mới không phân biệt được hành vi
    - Scope lớn kéo dài phiên
  assumptions: []
  redaction_applied: false
  approval:
    approved: false
    approved_at: null
    approval_source: explicit-user-choice
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
  architecture_gate:
    valid: true
    required: true
    status: required
    signals:
      - public-api-contract
      - security-trust-boundary
      - state-data-ownership
    bypass: null
    rationale: "Đổi hợp đồng dùng chung: hình dạng next_action của finish, enum coverage UI (FAIL), field
      no-baseline của Design handoff, trust boundary của observer/simplify host và quyền sở hữu evidence giữa
      producer và consumer."
    blockers: []
    blocker_messages: []
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: "Observer dùng được trên repository kích thước thật (IF-1, S-1): nội dung tracked và untracked chưa
          ignore vẫn hash theo nội dung với cap; file bị ignore và symlink ghi theo metadata; volatile path
          khai trong approved plan/policy không làm fail receipt nhưng không bao giờ được simplify/hook ghi;
          symlink trong write scope vẫn bị chặn."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-002
        type: requirement
        statement: "Finish-tail hội tụ và không claim done sai (IF-2, S-4, IF-5, IF-3, IF-4): khóa receipt của mọi
          next action trùng field phase đã tài liệu hóa; không tail-complete khi pass simplify đã cấp quyền
          còn pending/unverified; báo đúng lựa chọn đã ghi; finish:policy luôn được hỏi; resolveAction tôn
          trọng native surface đã lỗi."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: "Evidence simplify trung thực và giữ thay đổi của user (S-2, S-3, S-5, S-6): Analyze không cấp
          status verified cho check chưa chạy; diff check chỉ xét path của pass so với trạng thái lúc
          preflight; rollback theo scope và báo edit đồng thời; từ chối write target có nhiều hard link."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-004
        type: requirement
        statement: "Simplify có trusted host thực tế (S-7): script host canonical chạy trọn một pass trong một
          process; consumer ở process khác tự tính lại diff/scope/protected từ Git và nội dung hiện tại cùng
          verification mới; receipt chỉ là chỉ mục, receipt giả không qua được."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-005
        type: requirement
        statement: "UI review phân biệt đúng các trạng thái (UR-1..UR-5): review_context thường không bị UI consumer
          chặn; lần chạy fail được ghi thành receipt với coverage FAIL và finding lỗi gắn receipt; claim
          runtime không receipt bị từ chối theo rule cấu trúc; gate chỉ nhận giá trị canonical; test phân biệt
          được hành vi."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: "Design handoff hỗ trợ greenfield và tài liệu khớp schema (DH-1..DH-3): bản ghi no-baseline gắn
          approval cho phép evidence_refs rỗng khi mọi mapping không confirmed; tài liệu nêu đúng định dạng
          editable của schema 2 và giá trị trả về của resolver."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-007
        type: requirement
        statement: "Cấu trúc skill không mất đường load (ST-1..ST-5): mọi đường sinh Angular tới được styling.md; mọi
          action explore có scan/chạy lệnh load scanning/command discipline; con trỏ trong review.md nêu đúng
          ref; test kiểm vị trí owner và khả năng load; bằng chứng AC-013 bước 5 được sửa lại trung thực kèm
          test parity."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-008
        type: requirement
        statement: "Loader approved artifact canonical (G-1): một hàm đọc file snapshot chuẩn dùng chung, verify được
          mọi snapshot bước 1–5 kể cả dòng trống phân cách của bước 1, không sửa snapshot; bytes bị sửa vẫn
          fail."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-009
        type: requirement
        statement: "Governance: mỗi finding có regression RED trước và PASS sau; không assertion nào bị xóa hoặc nới;
          23 public skill; mirror sinh bằng script; không dependency mới; evidence tách tầng
          deterministic/integration/live; không commit/push khi chưa được yêu cầu."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: AC-001
        type: acceptance-criterion
        statement: Finish runtime và simplify session khởi tạo được trên repository này (hơn 128 MiB output bị ignore)
          và trên fixture có node_modules bị ignore kèm symlink/junction; thay đổi metadata của file bị ignore
          vẫn bị phát hiện là write.
        behavior: observer-real-repo
        expected_result: Finish runtime và simplify session khởi tạo được trên repository này (hơn 128 MiB output bị
          ignore) và trên fixture có node_modules bị ignore kèm symlink/junction; thay đổi metadata của file
          bị ignore vẫn bị phát hiện là write.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-002
        type: acceptance-criterion
        statement: Cache khai volatile bị test ghi lại trong lúc chạy lệnh verification không làm fail receipt; mọi
          write của simplify/hook vào volatile path bị chặn; write vào path bị ignore nhưng không khai
          volatile vẫn bị phát hiện.
        behavior: volatile-paths
        expected_result: Cache khai volatile bị test ghi lại trong lúc chạy lệnh verification không làm fail receipt;
          mọi write của simplify/hook vào volatile path bị chặn; write vào path bị ignore nhưng không khai
          volatile vẫn bị phát hiện.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-003
        type: acceptance-criterion
        statement: Symlink ngoài write scope được quan sát theo metadata đích và không làm throw; symlink trong write
          scope vẫn bị chặn.
        behavior: symlink-scope
        expected_result: Symlink ngoài write scope được quan sát theo metadata đích và không làm throw; symlink trong
          write scope vẫn bị chặn.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-004
        type: acceptance-criterion
        statement: Mọi next_action có phase là khóa receipt; một host làm đúng tài liệu hội tụ tới tail-complete sau
          write, repair, simplify Apply và stage A/B của worker (test drive-to-completion); receipt fail nêu
          rõ phase cần chạy lại.
        behavior: finish-convergence
        expected_result: Mọi next_action có phase là khóa receipt; một host làm đúng tài liệu hội tụ tới tail-complete
          sau write, repair, simplify Apply và stage A/B của worker (test drive-to-completion); receipt fail
          nêu rõ phase cần chạy lại.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-005
        type: acceptance-criterion
        statement: Pass simplify đã cấp quyền còn pending/unverified chặn tail-complete kể cả khi diff rỗng;
          tail-complete báo đúng lựa chọn đã ghi (apply/analyze/skip).
        behavior: simplify-pending
        expected_result: Pass simplify đã cấp quyền còn pending/unverified chặn tail-complete kể cả khi diff rỗng;
          tail-complete báo đúng lựa chọn đã ghi (apply/analyze/skip).
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-006
        type: acceptance-criterion
        statement: Decision finish:policy không bao giờ bị auto-select kể cả khi chỉ có một option; resolveAction
          không trả lại native surface đã lỗi.
        behavior: policy-ask-native
        expected_result: Decision finish:policy không bao giờ bị auto-select kể cả khi chỉ có một option;
          resolveAction không trả lại native surface đã lỗi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-007
        type: acceptance-criterion
        statement: Output Analyze không mang status verified, git_diff_check passed hay preserved_surfaces verified
          cho check chưa chạy; tham chiếu evidence được resolve theo session; consumer không coi Analyze là
          verification hiện tại.
        behavior: analyze-honest
        expected_result: Output Analyze không mang status verified, git_diff_check passed hay preserved_surfaces
          verified cho check chưa chạy; tham chiếu evidence được resolve theo session; consumer không coi
          Analyze là verification hiện tại.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-008
        type: acceptance-criterion
        statement: Whitespace hoặc CRLF có sẵn ngoài path của pass không chặn pass hợp lệ hay rollback; whitespace do
          chính pass tạo ra vẫn chặn.
        behavior: diff-check-scope
        expected_result: Whitespace hoặc CRLF có sẵn ngoài path của pass không chặn pass hợp lệ hay rollback;
          whitespace do chính pass tạo ra vẫn chặn.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-009
        type: acceptance-criterion
        statement: Rollback được chấp nhận khi path/hunk của pass được khôi phục đúng byte checkpoint; edit đồng thời
          bên ngoài được liệt kê, giữ nguyên và bắt lấy baseline mới; edit đồng thời chạm path của pass thì
          chặn.
        behavior: scoped-rollback
        expected_result: Rollback được chấp nhận khi path/hunk của pass được khôi phục đúng byte checkpoint; edit đồng
          thời bên ngoài được liệt kê, giữ nguyên và bắt lấy baseline mới; edit đồng thời chạm path của pass
          thì chặn.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-010
        type: acceptance-criterion
        statement: Write target có link count lớn hơn 1 bị từ chối trước khi ghi.
        behavior: hardlink-target
        expected_result: Write target có link count lớn hơn 1 bị từ chối trước khi ghi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-011
        type: acceptance-criterion
        statement: Script host canonical chạy trọn một pass trên repo tạm thật; consumer ở process khác tự tính lại
          diff, scope, protected path và chạy verification mới rồi mới chấp nhận; receipt bị sửa hoặc làm giả
          bị từ chối.
        behavior: host-runner
        expected_result: Script host canonical chạy trọn một pass trên repo tạm thật; consumer ở process khác tự tính
          lại diff, scope, protected path và chạy verification mới rồi mới chấp nhận; receipt bị sửa hoặc làm
          giả bị từ chối.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs: []
      - id: AC-012
        type: acceptance-criterion
        statement: review_context không có purpose/ui_review cho kết quả NOT APPLICABLE ở UI consumer của ship,
          validation-map, repair, Angular và Next.js; payload UI giữ nguyên hành vi hiện tại.
        behavior: ordinary-review
        expected_result: review_context không có purpose/ui_review cho kết quả NOT APPLICABLE ở UI consumer của ship,
          validation-map, repair, Angular và Next.js; payload UI giữ nguyên hành vi hiện tại.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-013
        type: acceptance-criterion
        statement: Lần chạy interaction/rendered hoàn tất nhưng fail được ghi với exit và kết quả assertion thật;
          coverage thành FAIL; finding lỗi gắn receipt FAIL còn current được chấp nhận và ship chặn như một
          lỗi; crash/timeout/không output vẫn là gap.
        behavior: failing-receipt
        expected_result: Lần chạy interaction/rendered hoàn tất nhưng fail được ghi với exit và kết quả assertion
          thật; coverage thành FAIL; finding lỗi gắn receipt FAIL còn current được chấp nhận và ship chặn như
          một lỗi; crash/timeout/không output vẫn là gap.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-014
        type: acceptance-criterion
        statement: Claim rendered/interaction/keyboard/focus trong finding source-only bị từ chối bất kể cách diễn
          đạt; gate ngoài BLOCKER/REQUIRED/ADVISORY/N/A bị từ chối; các test dựng lại thất bại khi gỡ guard
          tương ứng.
        behavior: ui-claims-gates-tests
        expected_result: Claim rendered/interaction/keyboard/focus trong finding source-only bị từ chối bất kể cách
          diễn đạt; gate ngoài BLOCKER/REQUIRED/ADVISORY/N/A bị từ chối; các test dựng lại thất bại khi gỡ
          guard tương ứng.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-015
        type: acceptance-criterion
        statement: Handoff có bản ghi no-baseline kèm lý do và tham chiếu approval verify được khi mọi mapping là
          candidate/unknown/new; thiếu approval hoặc có mapping confirmed thì chặn; dự án đã có UI vẫn phải
          trích source thật.
        behavior: greenfield-design
        expected_result: Handoff có bản ghi no-baseline kèm lý do và tham chiếu approval verify được khi mọi mapping
          là candidate/unknown/new; thiếu approval hoặc có mapping confirmed thì chặn; dự án đã có UI vẫn phải
          trích source thật.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-016
        type: acceptance-criterion
        statement: Tài liệu Design nêu html/svg là định dạng editable của schema 2 và resolver trả về path ledger;
          test đối chiếu tài liệu với helper.
        behavior: design-docs
        expected_result: Tài liệu Design nêu html/svg là định dạng editable của schema 2 và resolver trả về path
          ledger; test đối chiếu tài liệu với helper.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-017
        type: acceptance-criterion
        statement: Mọi đường sinh Angular (actions, admin-screens, init-module, init-portal, init-entity, screen-list,
          screen-detail) tới được styling.md qua điều kiện load trong body hoặc ref được load; test
          reachability.
        behavior: styling-reachable
        expected_result: Mọi đường sinh Angular (actions, admin-screens, init-module, init-portal, init-entity,
          screen-list, screen-detail) tới được styling.md qua điều kiện load trong body hoặc ref được load;
          test reachability.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: AC-018
        type: acceptance-criterion
        statement: conventions-read và summary-refresh load scanning/command discipline; review.md không còn con trỏ
          below/above tới nội dung đã chuyển.
        behavior: explore-scan-pointers
        expected_result: conventions-read và summary-refresh load scanning/command discipline; review.md không còn con
          trỏ below/above tới nội dung đã chuyển.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: AC-019
        type: acceptance-criterion
        statement: Assertion theo từng file owner; mutation chuyển một rule sang ref có điều kiện load khác bị test
          phát hiện.
        behavior: placement-tests
        expected_result: Assertion theo từng file owner; mutation chuyển một rule sang ref có điều kiện load khác bị
          test phát hiện.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: AC-020
        type: acceptance-criterion
        statement: Test parity giữa ví dụ review_context và field consumer bắt buộc tồn tại; hiệu chỉnh bằng chứng
          AC-013 của bước 5 được ghi trong delivery và VALIDATION.
        behavior: schema-parity
        expected_result: Test parity giữa ví dụ review_context và field consumer bắt buộc tồn tại; hiệu chỉnh bằng
          chứng AC-013 của bước 5 được ghi trong delivery và VALIDATION.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: AC-021
        type: acceptance-criterion
        statement: Loader canonical verify được mọi approved snapshot bước 1–5 mà không sửa file; bytes bị sửa vẫn
          fail; consumer và test dùng loader này.
        behavior: artifact-loader
        expected_result: Loader canonical verify được mọi approved snapshot bước 1–5 mà không sửa file; bytes bị sửa
          vẫn fail; consumer và test dùng loader này.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs: []
      - id: AC-022
        type: acceptance-criterion
        statement: Mỗi finding có RED trước và PASS sau; số assertion không giảm và không thêm skip; 23 public skill;
          check:skills, text hygiene, executable references và test:e2e:repository PASS trên nội dung cuối với
          Node thỏa engines; không dependency mới.
        behavior: governance
        expected_result: Mỗi finding có RED trước và PASS sau; số assertion không giảm và không thêm skip; 23 public
          skill; check:skills, text hygiene, executable references và test:e2e:repository PASS trên nội dung
          cuối với Node thỏa engines; không dependency mới.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-009
        task_refs: []
      - id: D-001
        type: decision
        statement: Metadata cho file bị ignore và symlink, cap chỉ cho nội dung tracked/untracked chưa ignore,
          volatile path khai trong approved plan/policy và không bao giờ được ghi
        question: Observer trên repo thật xử lý thế nào?
        selected_value: Metadata cho file bị ignore và symlink, cap chỉ cho nội dung tracked/untracked chưa ignore,
          volatile path khai trong approved plan/policy và không bao giờ được ghi
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User chọn phương án 1 ở quyết định 1/5.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - AC-001
          - AC-002
          - AC-003
        task_refs: []
      - id: D-002
        type: decision
        statement: Ghi receipt cho mọi lần chạy hoàn tất với exit và assertion thật; coverage có FAIL; finding lỗi gắn
          receipt FAIL
        question: Lần chạy UI bị fail ghi thế nào?
        selected_value: Ghi receipt cho mọi lần chạy hoàn tất với exit và assertion thật; coverage có FAIL; finding
          lỗi gắn receipt FAIL
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User chọn phương án 1 ở quyết định 2/5.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-013
        task_refs: []
      - id: D-003
        type: decision
        statement: Bản ghi no-baseline kèm lý do và tham chiếu approval; mọi mapping không confirmed
        question: Design greenfield verify thế nào?
        selected_value: Bản ghi no-baseline kèm lý do và tham chiếu approval; mọi mapping không confirmed
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User chọn phương án 1 ở quyết định 3/5.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-006
          - AC-015
        task_refs: []
      - id: D-004
        type: decision
        statement: Script host canonical chạy trọn pass trong một process; consumer tự tính lại từ Git và nội dung
          hiện tại; receipt chỉ là chỉ mục
        question: Trusted host cho simplify là gì?
        selected_value: Script host canonical chạy trọn pass trong một process; consumer tự tính lại từ Git và nội
          dung hiện tại; receipt chỉ là chỉ mục
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User chọn phương án 1 ở quyết định 4/5.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - AC-011
        task_refs: []
      - id: D-005
        type: decision
        statement: Rollback theo scope, liệt kê và giữ edit đồng thời, bắt baseline mới; chạm path của pass thì chặn
        question: Rollback khi có edit đồng thời?
        selected_value: Rollback theo scope, liệt kê và giữ edit đồng thời, bắt baseline mới; chạm path của pass thì chặn
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User chọn phương án 1 ở quyết định 5/5.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - AC-009
        task_refs: []
      - id: D-006
        type: decision
        statement: Toàn bộ finding đã confirmed của audit bước 6; mục NV nằm ngoài scope
        question: Scope repair?
        selected_value: Toàn bộ finding đã confirmed của audit bước 6; mục NV nằm ngoài scope
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User chọn phương án 4.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
        task_refs: []
      - id: D-007
        type: decision
        statement: "IF-2: phase là khóa receipt; IF-3: luôn hỏi finish:policy; IF-4: resolveAction nhận
          failed_surfaces; UR-4: allowlist gate canonical; DH-2: thu hẹp tài liệu về html/svg; G-1: loader
          chịu đúng một dòng trống phân cách; ST-3: thêm test parity và ghi hiệu chỉnh, không đổi schema"
        question: Mặc định cho các finding có hướng sửa rõ?
        selected_value: "IF-2: phase là khóa receipt; IF-3: luôn hỏi finish:policy; IF-4: resolveAction nhận
          failed_surfaces; UR-4: allowlist gate canonical; DH-2: thu hẹp tài liệu về html/svg; G-1: loader
          chịu đúng một dòng trống phân cách; ST-3: thêm test parity và ghi hiệu chỉnh, không đổi schema"
        source: approved-spec
        status: proposed
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Đề xuất trong spec; chốt khi user duyệt spec.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-004
          - AC-006
          - AC-014
          - AC-016
          - AC-020
          - AC-021
        task_refs: []
      - id: D-008
        type: decision
        statement: "Một contract, ba workstream tuần tự: A observer/simplify/finish, B UI review và Design, C
          structure/test/loader; TDD regression-first"
        question: Cách giao?
        selected_value: "Một contract, ba workstream tuần tự: A observer/simplify/finish, B UI review và Design, C
          structure/test/loader; TDD regression-first"
        source: approved-spec
        status: proposed
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Đề xuất trong spec; chốt khi user duyệt spec.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-009
          - AC-022
        task_refs: []
      - id: INV-001
        type: invariant
        statement: "Authority vẫn fail-closed: không có quyền ghi khi thiếu approved scope; mọi negative path đã có từ
          bước 1–4 vẫn bị chặn."
        protected_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - AC-002
          - AC-003
          - AC-010
          - AC-011
        task_refs: []
        evidence_refs: []
      - id: INV-002
        type: invariant
        statement: "Positive path tới được: input hợp lệ trên repository kích thước thật hội tụ tới kết quả đúng."
        protected_refs:
          - R-001
          - R-002
          - R-005
          - R-006
          - AC-001
          - AC-004
          - AC-012
          - AC-015
        task_refs: []
        evidence_refs: []
      - id: INV-003
        type: invariant
        statement: "Evidence trung thực: thiếu khác fail khác pass; không check chưa chạy nào được báo verified; test
          không bị nới."
        protected_refs:
          - R-003
          - R-005
          - R-007
          - R-009
          - AC-005
          - AC-007
          - AC-013
          - AC-019
          - AC-022
        task_refs: []
        evidence_refs: []
      - id: INV-004
        type: invariant
        statement: "Lịch sử bất biến: approved snapshot và evidence record cũ không bị sửa."
        protected_refs:
          - R-008
          - R-009
          - AC-021
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
          - id: R-008
            type: requirement
          - id: R-009
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
          - id: AC-007
            type: acceptance-criterion
          - id: AC-008
            type: acceptance-criterion
          - id: AC-009
            type: acceptance-criterion
          - id: AC-010
            type: acceptance-criterion
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: AC-019
            type: acceptance-criterion
          - id: AC-020
            type: acceptance-criterion
          - id: AC-021
            type: acceptance-criterion
          - id: AC-022
            type: acceptance-criterion
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
          - id: INV-001
            type: invariant
          - id: INV-002
            type: invariant
          - id: INV-003
            type: invariant
          - id: INV-004
            type: invariant
        tombstones: []
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    stage: spec
    future_gaps:
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-001.task_refs
        record_id: AC-001
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-002.task_refs
        record_id: AC-002
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-003.task_refs
        record_id: AC-003
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-004.task_refs
        record_id: AC-004
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-005.task_refs
        record_id: AC-005
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-006.task_refs
        record_id: AC-006
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-007.task_refs
        record_id: AC-007
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-008.task_refs
        record_id: AC-008
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-009.task_refs
        record_id: AC-009
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-010.task_refs
        record_id: AC-010
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-011.task_refs
        record_id: AC-011
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-012.task_refs
        record_id: AC-012
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-013.task_refs
        record_id: AC-013
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-014.task_refs
        record_id: AC-014
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-015.task_refs
        record_id: AC-015
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-016.task_refs
        record_id: AC-016
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-017.task_refs
        record_id: AC-017
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-018.task_refs
        record_id: AC-018
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-019.task_refs
        record_id: AC-019
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-020.task_refs
        record_id: AC-020
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-021.task_refs
        record_id: AC-021
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-022.task_refs
        record_id: AC-022
        message: an acceptance criterion must map to at least one planned task
      - code: INVARIANT_EVIDENCE_TRACE_MISSING
        path: records.INV-001.evidence_refs
        record_id: INV-001
        message: an invariant must trace to at least one evidence reference
      - code: INVARIANT_EVIDENCE_TRACE_MISSING
        path: records.INV-002.evidence_refs
        record_id: INV-002
        message: an invariant must trace to at least one evidence reference
      - code: INVARIANT_EVIDENCE_TRACE_MISSING
        path: records.INV-003.evidence_refs
        record_id: INV-003
        message: an invariant must trace to at least one evidence reference
      - code: INVARIANT_EVIDENCE_TRACE_MISSING
        path: records.INV-004.evidence_refs
        record_id: INV-004
        message: an invariant must trace to at least one evidence reference
      - code: INVARIANT_TASK_TRACE_MISSING
        path: records.INV-001.task_refs
        record_id: INV-001
        message: an invariant must trace to at least one enforcing task
      - code: INVARIANT_TASK_TRACE_MISSING
        path: records.INV-002.task_refs
        record_id: INV-002
        message: an invariant must trace to at least one enforcing task
      - code: INVARIANT_TASK_TRACE_MISSING
        path: records.INV-003.task_refs
        record_id: INV-003
        message: an invariant must trace to at least one enforcing task
      - code: INVARIANT_TASK_TRACE_MISSING
        path: records.INV-004.task_refs
        record_id: INV-004
        message: an invariant must trace to at least one enforcing task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-001.task_refs
        record_id: R-001
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-002.task_refs
        record_id: R-002
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-003.task_refs
        record_id: R-003
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-004.task_refs
        record_id: R-004
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-005.task_refs
        record_id: R-005
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-006.task_refs
        record_id: R-006
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-007.task_refs
        record_id: R-007
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-008.task_refs
        record_id: R-008
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-009.task_refs
        record_id: R-009
        message: a requirement must map to at least one planned task
```

## Decisions captured during review
- Duyệt như bản nháp (reply `1`), không chỉnh nội dung.
- Đề xuất D-007 (các default IF-2, IF-3, IF-4, UR-4, DH-2, G-1, ST-3) và D-008 (một contract, ba workstream tuần tự, TDD regression-first) được chốt bằng lần duyệt này. Record trong contract giữ trạng thái lúc nháp; plan ghi chuyển trạng thái ở revision mới của decision coverage.

## Skill provenance
sdcorejs-spec (approved on attempt 1 / 3)
