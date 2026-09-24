---
acceptance_criteria_count: 18
approval_gate: sdcorejs-spec:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-09-24T03:15:27.473Z
approved_by: user
approved_draft_fingerprint: sha256:51974b40eea8e41a0e641db2e051cb6d5e0a860f6eb5148fb81ba2a41add8205
artifact_id: spec-interaction-finish-contract-20260924-r1
artifact_kind: spec
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: interaction-finish-contract-20260924
commit_policy: with-change
contract_id: interaction-finish-contract-20260924
description: Native runtime choices and scope-bound decisions with one
  authority-preserving finish tail.
manual_criteria_count: 0
name: interaction-finish-contract
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md
requirement_id: interaction-finish-contract-20260924
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-09-24-09-50-interaction-finish-contract-spec.md
source_plan: none
source_revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
---
# Interaction and finish-tail contract — Approved Spec

> Immutable snapshot of the draft approved by the user. The embedded draft approval fields describe its pre-approval state; this artifact metadata and verified hash govern approval.

## Approved contract

# Spec — Interaction và finish-tail contract — 2026-09-24 09:50

## Problem & Goals
Giảm thao tác thủ công và câu hỏi lặp lại bằng scoped decision resolution cùng một finish-tail canonical; giữ nguyên approval, owner, scope và evidence gates. Đây là thay đổi contract của skill pack trên HEAD 7e7f4288717a983a5f51ab43af24af4ce423a1d4, sau simplify, Design handoff và UI review improvements.

## Requirements
- R-001 — Native-first dựa trên tool exposure, runtime/mode constraints và evidence hiện tại; fallback giữ nguyên identity/options.
- R-002 — Giải quyết reply rõ nghĩa và reuse explicit decision đúng gate, artifact/change, revision/scope và option mapping; chỉ hỏi delta.
- R-003 — Một finish-tail canonical dùng thực sự ở mọi caller; parent/integration owner hoàn tất một lần cho change.
- R-004 — Skip, Analyze và Apply simplify giữ nguyên opt-in, eligibility, preflight, protected boundaries và pass cap.
- R-005 — Review-only, review-and-repair, defer và skip review không mở rộng authority hoặc bỏ required verification.
- R-006 — Test strategy được chốt trước implementation; RED-first đúng thứ tự; mọi write làm stale evidence liên quan.
- R-007 — Docs/test policy đã authorize được reuse đúng scope; preference không cấp quyền tạo docs mới.
- R-008 — Compatibility, public skills, approved snapshots và safety assertions được giữ; chỉ canonical sources, mirrors bằng script.

## Decisions
- D-001 — Dùng surface nào? Observed native-first, stable numbered fallback
- D-002 — Reuse quyết định ở đâu? Extend existing context/handoff; exact scoped authority, no new state store
- D-003 — Ai điều phối finish-tail? One canonical owner contract, parent/integration final tail, stack hooks only
- D-004 — Lựa chọn có mở rộng quyền không? Keep simplify/repair/docs authority and required verification; no automatic Git
- D-005 — Giới hạn compatibility và delivery? Keep 23 public skills, no dependencies, no historical approval migration, no commit/push
Các quyết định trên lấy trực tiếp từ request; spec vẫn chưa được duyệt. Đề xuất cho lần implement này: regression/TDD trước phần production tương ứng; lựa chọn này được chốt khi user duyệt spec, không yêu cầu một lượt hỏi coverage riêng.

## Assumptions
Không có blocking assumption chưa giải quyết. Tool exposure là evidence runtime từng lần, không phải permission lâu dài hay thuộc tính cố định của Codex.

## Architecture gate classification
Required: security-trust-boundary, state-data-ownership, integration-owner-dependency-direction. Classifier hiện tại trả valid/required; approval spec dẫn tới architecture riêng, rồi plan riêng.

## Non-goals
- Không tạo public skill, framework/state store mới hoặc thay toàn bộ workflow.
- Không commit/push, install dependency/browser, chạy live/paid services hoặc sửa repo sản phẩm.
- Không migrate immutable approved artifacts hoặc sửa evidence lịch sử để làm xanh.
- Không nới simplify protected surfaces, repair tiers, required tests/AC, docs new-file authority hoặc Git gates.

## Architecture
Dùng runtime policy/attestation hiện có cho surface selection và scoped decision normalization. Mang decision identity/option mapping, nguồn explicit authority và trạng thái tail qua context/handoff hiện có; legacy thiếu identity không tự thành approval. Một private finish contract là nguồn thứ tự/điều kiện dùng bởi các entrypoint thật. Stack hooks không nhân bản tail hoặc mở thêm ceremony. Parent/integration là final owner; workers trả unit verification/review. Không thay Visual Companion feedback thành approval.

## Stack profile and technology assumptions
Workflow / markdown-skill-pack / standalone, dựa trên registry, package.json và Git remote. Dùng Node/npm đã có, pure helpers và fixture repositories; không thêm dependency. Reusable sources giữ English, artifact review này dùng tiếng Việt.

## File structure
Phạm vi candidate, chưa phải quyền implementation hay file-level plan:
- Shared: _refs/shared/user-choice-prompt.md, finish-gate.md và private executable counterpart nếu cần; validation/ship consumers dùng chung.
- Runtime: _refs/harness/runtime-policy.mjs, runtime-attestation.*, capability-contract.json, communication-economy.mjs cùng adapter mappings liên quan.
- Callers: spec/architecture/plan presentation; Angular, NestJS, Next.js, AI-agent, generic execute-plan; delegated execution; Review, repair-loop, documentation và Ship.
- Tests: existing harness/skill-pack runner, portable handoff, caller contracts và scoped finish-tail fixtures; current evidence mới khi cần, giữ nguyên lịch sử.
- Governance wording/entrypoint projections chỉ sửa nơi thật sự trùng hoặc lệch canonical semantics; mirrors sinh bằng sync:skills.
Số file chính xác và write paths sẽ được xác nhận ở approved plan; không bulk-refactor các skill ngoài quan hệ caller.

## Acceptance criteria
- AC-001 (native-runtime) — Native exposed và permitted trong current mode dùng structured choice; missing/unknown/forbidden dùng numbered fallback. Static adapter supported không đủ; không đổi mode/flag để lấy tool.
- AC-002 (native-failure) — Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã lỗi.
- AC-003 (reply-normalization) — Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản chứa số ngoài lựa chọn không thành approval.
- AC-004 (ambiguous-gates) — Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ tự hoặc gate gần nhất.
- AC-005 (reuse-choice) — Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được reuse qua context/handoff mà không hỏi lại.
- AC-006 (stale-choice) — Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice cũ không áp dụng; chỉ unresolved delta được hỏi.
- AC-007 (separate-approval) — Spec approval không approve plan; single option, default, silence, thanks, delegated preference hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu chỉnh sửa / 3 Hủy.
- AC-008 (canonical-callers) — Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship sử dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.
- AC-009 (integration-owner) — Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs tail. Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.
- AC-010 (resolved-small-fix) — Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại; missing-doc creation vẫn cần authority cho đúng file/scope.
- AC-011 (simplify-semantics) — Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không source write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định Analyze-only.
- AC-012 (review-only) — Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.
- AC-013 (bounded-repair) — Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize mọi finding, không tự simplify sau repair.
- AC-014 (defer) — Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.
- AC-015 (skip-review) — Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng, không hàm ý Git/deploy. Required review/evidence không bị skip tùy ý.
- AC-016 (tdd-order) — TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được gọi RED-first; finish choice không xóa required tests/AC.
- AC-017 (evidence-order) — Baseline/test → optional simplify → affected re-verification → selected review/repair → authorized writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc chạy lại gate trước handoff.
- AC-018 (compatibility) — Documented payload → helper → real caller regression và mutation cases giữ safety assertions; schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable history không migrate, mirrors và hygiene checks đạt.

## Baseline evidence
Read-only deterministic probe trên clean checkout, command: node <TEMP>/interaction-finish-baseline.mjs. Kết quả 5 PASS / 5 FAIL. Harness exit 0 là chạy probe thành công, không phải contract PASS.

| Probe | Result | Observation |
|---|---|---|
| approval-single-option | FAIL | Approval một lựa chọn trả auto-select. |
| native-picker-failed | FAIL | failed_surfaces không loại native picker đã lỗi. |
| adapter-default-not-runtime-proof | FAIL | Static supported cho phép native mà không có current-session observation. |
| localized-short-equivalent | FAIL | duyệt không khớp label Duyệt spec. |
| negative-containing-number | FAIL | không chọn 1 lại chọn Approve. |
| numeric / ambiguous-numbers / silence / thanks / native-unavailable | PASS | Năm safe controls hiện hoạt động. |
Prose inspection còn thấy: shared finish yêu cầu bốn prompt kể cả policy đã có; post-code test ghi RED-first; Angular/Next repair điều kiện Review not skipped; AI-agent chain và repair tail có thứ tự riêng; tests hiện khóa các chuỗi step 1/4. Đây là evidence inspection, chưa giả thành executed end-to-end proof. Probe source hashes/transcript giữ local-only trong runtime cho kế hoạch regression.

## Test and verification expectations
Documented payload → current helper → real consumer, cả positive/negative/mutation cases. Kế hoạch phải giữ test safety assertions và chỉ thay assertions đang khóa prose/policy cũ sau khi policy này được duyệt. Focused harness/runner/portable/caller suites; preservation simplify, Design/UI review; authoring deterministic và skill-authoring checks; npm run sync:skills, check:skills, check:text-hygiene, check:executable-references. Required tests/AC không thể bị finish choice xóa. Full/live/browser/provider layers không chạy trong phạm vi; ghi NOT RUN, không tạo receipt giả. Các command cụ thể sẽ được chốt trong plan theo package.json.

## Risks & mitigations
- Reuse nhầm gate/revision: bind exact identity, scope và mapping; ambiguous/stale giữ unresolved.
- Mất required verification khi skip/defer: executable ordering và mutation cases qua caller thật.
- Duplicate finish khi delegation hoặc repair: parent/integration ownership, phase completion chỉ reuse khi current; write invalidates affected proof.
- New-doc scope bị preference mở rộng: reuse authorization riêng với preference, canonical documentation ownership/containment giữ nguyên.
- Evidence cũ stale khi sửa shared runtime: tạo record mới có manifest và command thật; không sửa immutable records để chạy xanh.

## Out of scope (deferred)
Live native UI/provider A/B và real-product browser verification chỉ khi có yêu cầu riêng; không là required acceptance của contract fixture change này.

## Review decisions
Self-review: 18 AC phủ toàn bộ request; không unresolved blocking requirement; architecture required. No implementation or plan approval is implied. Exact task/path/evidence bindings là future planning gaps hợp lệ ở spec stage, không phải execution-ready.

## Machine-readable contract
```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: interaction-finish-contract-20260924
  requirement_id: interaction-finish-contract-20260924
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
  source_requirement_context: explicit-user-interaction-finish-request-20260924
  acceptance_criteria_count: 18
  manual_criteria_count: 0
  non_goals:
    - Không tạo public skill, framework/state store mới hoặc thay toàn bộ workflow.
    - Không commit/push, install dependency/browser, chạy live/paid services hoặc sửa repo sản phẩm.
    - Không migrate immutable approved artifacts hoặc sửa evidence lịch sử để làm xanh.
    - Không nới simplify protected surfaces, repair tiers, required tests/AC, docs new-file authority hoặc Git
      gates.
  coverage_approach: tdd
  coverage_approach_status: proposed-for-this-spec-approval
  risks:
    - Reuse nhầm approval hoặc broaden write scope
    - Caller giữ tail cũ dù có helper mới
    - Giả current evidence từ HEAD hoặc completion flag
  assumptions: []
  redaction_applied: true
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
      - integration-owner-dependency-direction
      - security-trust-boundary
      - state-data-ownership
    bypass: null
    rationale: Thay đổi ranh giới approval/capability, identity reuse và quyền parent/worker điều phối tail dùng
      chung giữa các executor.
    blockers: []
    blocker_messages: []
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: Native-first dựa trên tool exposure, runtime/mode constraints và evidence hiện tại; fallback giữ
          nguyên identity/options.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-002
        type: requirement
        statement: Giải quyết reply rõ nghĩa và reuse explicit decision đúng gate, artifact/change, revision/scope và
          option mapping; chỉ hỏi delta.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: Một finish-tail canonical dùng thực sự ở mọi caller; parent/integration owner hoàn tất một lần cho
          change.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-004
        type: requirement
        statement: Skip, Analyze và Apply simplify giữ nguyên opt-in, eligibility, preflight, protected boundaries và
          pass cap.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-005
        type: requirement
        statement: Review-only, review-and-repair, defer và skip review không mở rộng authority hoặc bỏ required
          verification.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: Test strategy được chốt trước implementation; RED-first đúng thứ tự; mọi write làm stale evidence
          liên quan.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-007
        type: requirement
        statement: Docs/test policy đã authorize được reuse đúng scope; preference không cấp quyền tạo docs mới.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-008
        type: requirement
        statement: Compatibility, public skills, approved snapshots và safety assertions được giữ; chỉ canonical
          sources, mirrors bằng script.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: AC-001
        type: acceptance-criterion
        statement: Native exposed và permitted trong current mode dùng structured choice; missing/unknown/forbidden
          dùng numbered fallback. Static adapter supported không đủ; không đổi mode/flag để lấy tool.
        behavior: native-runtime
        expected_result: Native exposed và permitted trong current mode dùng structured choice;
          missing/unknown/forbidden dùng numbered fallback. Static adapter supported không đủ; không đổi
          mode/flag để lấy tool.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-002
        type: acceptance-criterion
        statement: Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã lỗi.
        behavior: native-failure
        expected_result: Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã lỗi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-003
        type: acceptance-criterion
        statement: Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản chứa
          số ngoài lựa chọn không thành approval.
        behavior: reply-normalization
        expected_result: Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản
          chứa số ngoài lựa chọn không thành approval.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-004
        type: acceptance-criterion
        statement: Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ tự
          hoặc gate gần nhất.
        behavior: ambiguous-gates
        expected_result: Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ
          tự hoặc gate gần nhất.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-005
        type: acceptance-criterion
        statement: Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được reuse qua
          context/handoff mà không hỏi lại.
        behavior: reuse-choice
        expected_result: Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được
          reuse qua context/handoff mà không hỏi lại.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-006
        type: acceptance-criterion
        statement: Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice cũ
          không áp dụng; chỉ unresolved delta được hỏi.
        behavior: stale-choice
        expected_result: Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice
          cũ không áp dụng; chỉ unresolved delta được hỏi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-007
        type: acceptance-criterion
        statement: Spec approval không approve plan; single option, default, silence, thanks, delegated preference
          hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu chỉnh sửa / 3
          Hủy.
        behavior: separate-approval
        expected_result: Spec approval không approve plan; single option, default, silence, thanks, delegated
          preference hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu
          chỉnh sửa / 3 Hủy.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-008
        type: acceptance-criterion
        statement: Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship sử
          dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.
        behavior: canonical-callers
        expected_result: Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship
          sử dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-009
        type: acceptance-criterion
        statement: Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs tail.
          Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.
        behavior: integration-owner
        expected_result: Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs
          tail. Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-010
        type: acceptance-criterion
        statement: Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại;
          missing-doc creation vẫn cần authority cho đúng file/scope.
        behavior: resolved-small-fix
        expected_result: Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại;
          missing-doc creation vẫn cần authority cho đúng file/scope.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: AC-011
        type: acceptance-criterion
        statement: Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không source
          write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định Analyze-only.
        behavior: simplify-semantics
        expected_result: Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không
          source write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định
          Analyze-only.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs: []
      - id: AC-012
        type: acceptance-criterion
        statement: Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.
        behavior: review-only
        expected_result: Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-013
        type: acceptance-criterion
        statement: Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize mọi
          finding, không tự simplify sau repair.
        behavior: bounded-repair
        expected_result: Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize
          mọi finding, không tự simplify sau repair.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-014
        type: acceptance-criterion
        statement: Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.
        behavior: defer
        expected_result: Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-015
        type: acceptance-criterion
        statement: Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng, không hàm
          ý Git/deploy. Required review/evidence không bị skip tùy ý.
        behavior: skip-review
        expected_result: Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng,
          không hàm ý Git/deploy. Required review/evidence không bị skip tùy ý.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-016
        type: acceptance-criterion
        statement: TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được gọi
          RED-first; finish choice không xóa required tests/AC.
        behavior: tdd-order
        expected_result: TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được
          gọi RED-first; finish choice không xóa required tests/AC.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-017
        type: acceptance-criterion
        statement: Baseline/test → optional simplify → affected re-verification → selected review/repair → authorized
          writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc chạy lại
          gate trước handoff.
        behavior: evidence-order
        expected_result: Baseline/test → optional simplify → affected re-verification → selected review/repair →
          authorized writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc
          chạy lại gate trước handoff.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-018
        type: acceptance-criterion
        statement: Documented payload → helper → real caller regression và mutation cases giữ safety assertions;
          schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable
          history không migrate, mirrors và hygiene checks đạt.
        behavior: compatibility
        expected_result: Documented payload → helper → real caller regression và mutation cases giữ safety assertions;
          schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable
          history không migrate, mirrors và hygiene checks đạt.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs: []
      - id: D-001
        type: decision
        statement: Observed native-first, stable numbered fallback
        question: Dùng surface nào?
        selected_value: Observed native-first, stable numbered fallback
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - AC-001
          - AC-002
        task_refs: []
      - id: D-002
        type: decision
        statement: Extend existing context/handoff; exact scoped authority, no new state store
        question: Reuse quyết định ở đâu?
        selected_value: Extend existing context/handoff; exact scoped authority, no new state store
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - AC-005
          - AC-006
          - AC-007
        task_refs: []
      - id: D-003
        type: decision
        statement: One canonical owner contract, parent/integration final tail, stack hooks only
        question: Ai điều phối finish-tail?
        selected_value: One canonical owner contract, parent/integration final tail, stack hooks only
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - AC-008
          - AC-009
        task_refs: []
      - id: D-004
        type: decision
        statement: Keep simplify/repair/docs authority and required verification; no automatic Git
        question: Lựa chọn có mở rộng quyền không?
        selected_value: Keep simplify/repair/docs authority and required verification; no automatic Git
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - R-005
          - R-006
          - R-007
        task_refs: []
      - id: D-005
        type: decision
        statement: Keep 23 public skills, no dependencies, no historical approval migration, no commit/push
        question: Giới hạn compatibility và delivery?
        selected_value: Keep 23 public skills, no dependencies, no historical approval migration, no commit/push
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-008
          - AC-018
        task_refs: []
      - id: INV-001
        type: invariant
        statement: Approval luôn explicit và riêng theo gate/revision; capability không phải authority.
        protected_refs:
          - R-001
          - R-002
          - AC-007
        task_refs: []
        evidence_refs: []
      - id: INV-002
        type: invariant
        statement: Write giữ owner/scope/protected boundaries, review-only không sửa và defer không done.
        protected_refs:
          - R-004
          - R-005
          - R-007
        task_refs: []
        evidence_refs: []
      - id: INV-003
        type: invariant
        statement: Required verification và stale evidence không bị preference hoặc finish choice xóa.
        protected_refs:
          - R-006
          - AC-015
          - AC-016
          - AC-017
        task_refs: []
        evidence_refs: []
      - id: INV-004
        type: invariant
        statement: Không public skill mới, dependency mới, commit/push hoặc sửa immutable approved history.
        protected_refs:
          - R-008
          - AC-018
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
```


## Decisions captured during review

- Approved as drafted by explicit reply `1` to the sole pending spec r1 gate. The proposed TDD/regression-first policy is accepted for this implementation.
- This approval does not approve architecture, plan, implementation, commit or push.

## Skill provenance

sdcorejs-spec (approved on attempt 1 / 3).
