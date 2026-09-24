---
acceptance_criteria_count: 18
approval_gate: sdcorejs-architecture:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-09-24T04:17:08.782Z
approved_by: user
approved_draft_fingerprint: sha256:f5206b62bf0c29e4fc1ab3118d92b5b34368ed750c049626849823cc37de5a19
artifact_id: architecture-interaction-finish-contract-20260924-r1
artifact_kind: architecture
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: interaction-finish-contract-20260924
commit_policy: with-change
contract_id: interaction-finish-contract-20260924
description: Native runtime choices and scope-bound decisions with one
  authority-preserving finish tail.
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
manual_criteria_count: 0
name: interaction-finish-contract
owner: sdcorejs-architecture
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
    artifact_id: spec-interaction-finish-contract-20260924-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/architecture/workflow/2026-09-24-11-16-interaction-finish-contract.md
requirement_id: R-001
schema_version: 1
sourceDraftPath: .sdcorejs/docs/architecture/2026-09-24-10-17-interaction-finish-contract-architecture.md
source_plan: none
source_revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
source_spec: .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:b9c84f6402fe49cec4fd8175b65fb305bf05d68d118494c30c1fab5b785efa39
---
# Interaction and finish-tail contract — Approved Architecture

> Immutable snapshot approved by explicit reply `1` to the sole pending architecture r1 gate. Embedded draft fields preserve the reviewed pre-approval state; verified artifact metadata governs approval. This approval authorizes planning, not implementation or Git operations.


# Architecture — Interaction và finish-tail contract — r1

## Parent và authority
Approved spec: .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md
Approval hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
Spec đã được user duyệt bằng reply 1 đúng draft fingerprint. Architecture này còn là draft; không tự approve plan hoặc cấp quyền sửa implementation. Registry role vẫn standalone. Resolver ownership hiện có dùng nhánh integration-owner với topology một repo; đó chỉ là adapter API, không khai có cross-repository change. Không sửa resolver trong bước này.

## Quyết định kiến trúc

### 1. Runtime quyết định surface, không quyết định authority
Mở rộng runtime-policy/runtime-attestation hiện có; giữ tri-state và adapter mappings. Observation cần tool exposure, action user.choose/user.approve, runtime/mode hiện tại và restrictions của tool. Static supported, tên Codex hoặc copied attestation không đủ. Runtime chọn tool thực sự exposed và permitted cho action đang gọi; không đổi mode, flag hay cài công cụ. Nếu thiếu evidence thì unknown và fallback.

Native lỗi ghi failed surface cho đúng decision trong context hiện có, chuyển numbered Markdown một lần; giữ decision ID, revision và semantic option mapping. Không retry picker lỗi hoặc tạo gate mới vì lỗi presentation. Approval fallback luôn đủ 1 Approve / 2 Change / 3 Cancel và labels được localize; native preselection chưa submit không có hiệu lực.

### 2. Scoped decision resolution trong context/handoff hiện có
Một decision dùng tuple: gate/purpose, change, semantic owner, artifact identity khi có, artifact revision hoặc authorization-scope fingerprint, và semantic option mapping. Mỗi option giữ ID ổn định, selector và localized labels/aliases đã trình bày. Ngôn ngữ label không làm option ID thay nghĩa; đổi mapping/semantics phải tạo revision mới.

Reply được gắn bằng host question identity hoặc bằng đúng một pending gate rõ ràng. Số đơn/exact label/alias rõ nghĩa hợp lệ; không dùng regex nhặt bất kỳ số nào trong câu. Negation, câu hỏi, nhiều candidate gate, silence, thanks hoặc visual feedback giữ unresolved. Quy tắc single-option và delegated recommendation chỉ dùng cho choice không phải approval, không cấp Apply/write authority.

Reuse chỉ explicit user resolution hoặc policy lấy từ approved plan thực tế qua loader/verifier hiện có, đúng owner/change/scope/mapping; provenance chỉ nói user-approved không đủ. Spec và plan có gate và artifact identity riêng. Legacy không có identity là unverified hint, không được tự normalize thành approved. Một reply đã resolve được consume idempotently, không tạo thêm snapshot cùng gate.

Dùng conditional fields interaction_context/finish_context trong existing producer context và portable state_delta, schema version rõ; không database, singleton store, journal mới hoặc .sdcorejs current-session. Handoff giữ identity/provenance nhưng recipient phải kiểm lại authority/current scope và runtime exposure.

Tách authorization fingerprint khỏi evidence fingerprint: write bên trong phạm vi đã cho phép không ép hỏi lại cùng policy, nhưng làm stale proof của nội dung bị ảnh hưởng. Scope/revision/mapping đổi cần decision delta; content đổi cần re-verification. Apply vẫn là opt-in cho invocation hữu hạn, giữ simplify ledger/cap và không dùng lại để tự chạy sau repair.

### 3. Một canonical finish resolver, caller thật dùng kết quả
_refs/shared/finish-gate.md là tài liệu duy nhất về thứ tự/semantics; private executable companion giải quyết applicability, unresolved decisions và next authorized actions. Đây là pure orchestration contract, không runner mới và không sở hữu source write. Nó gọi lại validators/evidence consumers hiện có để xác định blockers/freshness; không nhận caller boolean PASS làm proof.

Output phân biệt pending-choice, blocked, deferred, unit-complete và tail-complete. Next actions dùng semantic owner đã có, không provider tool name. Phase completion gắn owner/change/scope và content/evidence refs; cùng valid context không mở lại ceremony, trạng thái serialize không được tự làm hoàn tất gate. Khi proof bị stale thì mở lại phần affected verification, giữ choices còn đúng authorization scope.

Caller completion entrypoints và documented orchestration phải thực sự tiêu thụ resolver output; không chỉ import helper hoặc test một helper riêng. Existing preflight entrypoints không đòi future postflight evidence. Plan sẽ chỉ rõ các completion handoff ở contract/executor hiện có và integration test kiểm chứng dispatch order/counts từ đường caller đó.

| Caller | Boundary phải giữ |
|---|---|
| Spec/architecture/plan | Cùng decision protocol; gate và artifact approvals độc lập. |
| Angular/NestJS/Next.js/AI-agent | Handoff completion cho canonical finish; giữ stack verification/security/UI hooks và required tests. |
| Generic execute-plan | Dùng approved test/docs policy, owner và allowed paths; cùng completion semantics. |
| Delegated execution | Worker unit verification + Stage A/B theo contract hiện có; parent/integration điều phối final tail sau fan-in. |
| Review | Trả assessment/findings read-only; không mở repair hay shared tail ngoài lựa chọn đã authorize. |
| Repair-loop | Giữ validity/tier/scope/owner/cap, trả affected stale evidence về caller; không khởi động simplify/finish ceremony mới. |
| Documentation | Dùng authorized create/update scope hiện có, không hỏi lại policy hợp lệ; new-file authority tách preference. |
| Ship | Chặn required gaps/stale proof/defer; verify và branch-ready cuối, không tự Git/deploy. |

### 4. Lựa chọn không vượt owner gates
- Simplify skip không dispatch. Không eligible/no-op được xác định từ scope/diff thực thì ghi lý do, không hỏi. Analyze không source write. Apply cần explicit opt-in, eligible intersection và hardened simplify preflight; thiếu oracle mặc định Analyze-only, không sinh evidence để vượt preflight.
- Review-only chỉ Review và required verification sau đó, không repair/UI fix. Review-and-repair chỉ mở route tới repair gate; finding/tier/scope authority vẫn phải đủ.
- Skip review mang nhãn Skip review and continue verification; không xóa required review/evidence/AC hoặc cấp Git/deploy. Required review bị skip vẫn là blocker.
- Defer dừng nhánh tail còn lại, không chạy writes/verify/branch-ready phía sau hoặc claim done. Đã có evidence trước defer giữ nguyên lịch sử; resume chỉ khi explicit request/authority và current scope hợp lệ.
- Docs/test policy từ plan hoặc explicit request không hỏi lại. Preference chỉ hỗ trợ update theo contract hiện có, không tạo missing docs; skip optional docs không xóa required delivery artifacts.

### 5. Evidence ordering và invalidation
Test strategy được giải quyết trong planning/implementation; TDD RED của production unit phải có trước write tương ứng. Finish không đổi post-hoc thành RED-first và không xóa required test cases.

Canonical order: baseline/test → optional simplify → affected re-verification → selected review/repair → authorized write-producing tail hooks → revalidate affected evidence → final verify → branch-ready.

Code documentation, guide/technical docs, product/required execution records, authorized backlog/memory/convention sync và mirror generation nếu áp dụng đều nằm trước final verify/branch-ready. Hooks thiếu authority trả blocker/decision delta đúng owner; không tự tạo artifact cho đủ danh sách. Worker không chạy shared tail; worker-owned record chỉ khi được giao rõ, không mở finish ceremony.

Mỗi write qua host snapshot/diff/command-receipt infrastructure đánh dấu affected test/review/UI/ship evidence stale; same HEAD không đủ. Preservation/required checks do owners xác nhận. Branch-ready là gate read-only cuối: write sau đó invalidates handoff và bắt chạy lại affected verification + branch-ready. Serialized tail-complete không cấp Git authority. Không auto commit/push.

### 6. Compatibility và giới hạn
Giữ 23 public skills, dimensions, simplify/Design/UI review contracts. Optional versioned context fields đi qua typed runtime và portable handoff; unknown/malformed authority payload fail closed. Legacy choice string chỉ là hint khi thiếu exact identity/provenance. Không bulk-migrate approved history, không giả runtime receipts.

Existing Visual Companion context và capability group giữ backward compatibility; native-choice observation thêm action/mode constraints mà không tự bật surface. Không hardcode một adapter luôn supported/unsupported. Tests đổi assertion của prose bốn-step cũ sau policy approval, giữ hoặc tăng safety assertions tương ứng. Không dựa vào source-prose matching đơn thuần để chứng minh caller integration.

## Invariant và proof obligations
- INV-001 — Approval luôn explicit và riêng theo gate/revision; capability không phải authority. Proof: Native capability/mode/failure, localization, ambiguous/stale decision and separate approval regression/mutation cases.
- INV-002 — Write giữ owner/scope/protected boundaries, review-only không sửa và defer không done. Proof: Observed dispatch/owner tests for worker, skip/analyze/apply, review-only, scoped repair, defer and new-document authority.
- INV-003 — Required verification và stale evidence không bị preference hoặc finish choice xóa. Proof: Required tests/AC, RED-before-production, same-HEAD stale proof, affected revalidation and post-branch-ready write mutations.
- INV-004 — Không public skill mới, dependency mới, commit/push hoặc sửa immutable approved history. Proof: Portable round trips, immutable-hash checks, public inventory and generated mirror/hygiene checks; no Git/dependency actions.
18 AC được giữ nguyên từ approved spec, gom thành 4 validation obligations ở typed context. Không đổi scope hoặc thêm implementation order tại architecture.

## Review và validation status
Parent hash/graph và owner/write-scope đã kiểm tra bằng helper hiện có. Typed draft được validate với approved path/hash để null: chỉ hai lỗi pending approval dự kiến (ARCHITECTURE_PATH_INVALID, ARCHITECTURE_HASH_INVALID); chưa claim approved context PASS. Không dùng placeholder hash để làm xanh.

Separate read-only architecture review đã hoàn tất trong reviewer context riêng: không phát hiện blocker ở runtime authority, decision reuse/ambiguity, caller/owner integration, choice semantics, evidence ordering hoặc compatibility. Reviewer đối chiếu approved spec, các contracts và completion callers hiện tại; 18 AC được map đầy đủ qua VAL-001..004. Review không cấp approval hoặc quyền implementation. Dispatch order/counts, schema round-trip và native runtime behavior chưa được kiểm chứng bằng implementation tests (NOT RUN); thuộc plan và execution tiếp theo. Parent đã verify approved-spec graph, fingerprint của spec draft, decision coverage và write scope; text-hygiene và git diff --check đều PASS.

## Typed draft context
```yaml
architecture_context:
  schema_version: 1
  source: sdcorejs-architecture
  contract_id: interaction-finish-contract-20260924
  requirement_id: R-001
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-interaction-finish-contract-20260924-r1
    artifact_kind: spec
    revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
    approval_hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
    repository_relative_path: .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md
  approved_architecture_path: null
  approved_architecture_hash: null
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  trigger:
    required: true
    signals:
      - integration-owner-dependency-direction
      - security-trust-boundary
      - state-data-ownership
    rationale: Thay đổi ranh giới approval/capability, identity reuse và quyền parent/worker điều phối tail dùng chung
      giữa các executor.
  invariants:
    - id: INV-001
      statement: Approval luôn explicit và riêng theo gate/revision; capability không phải authority.
      scope: runtime observation and scoped choice authority
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve the approved user constraint while reducing repeated interaction.
      verification_method: Native capability/mode/failure, localization, ambiguous/stale decision and separate approval
        regression/mutation cases.
      requirement_refs:
        - R-001
        - R-002
      decision_refs:
        - D-001
        - D-002
    - id: INV-002
      statement: Write giữ owner/scope/protected boundaries, review-only không sửa và defer không done.
      scope: finish owner and write-producing dispatch
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve the approved user constraint while reducing repeated interaction.
      verification_method: Observed dispatch/owner tests for worker, skip/analyze/apply, review-only, scoped repair,
        defer and new-document authority.
      requirement_refs:
        - R-003
        - R-004
        - R-005
        - R-007
      decision_refs:
        - D-003
        - D-004
    - id: INV-003
      statement: Required verification và stale evidence không bị preference hoặc finish choice xóa.
      scope: test/evidence ordering and final handoff
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve the approved user constraint while reducing repeated interaction.
      verification_method: Required tests/AC, RED-before-production, same-HEAD stale proof, affected revalidation and
        post-branch-ready write mutations.
      requirement_refs:
        - R-005
        - R-006
      decision_refs:
        - D-003
        - D-004
    - id: INV-004
      statement: Không public skill mới, dependency mới, commit/push hoặc sửa immutable approved history.
      scope: public compatibility and artifact lifecycle
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve the approved user constraint while reducing repeated interaction.
      verification_method: Portable round trips, immutable-hash checks, public inventory and generated mirror/hygiene
        checks; no Git/dependency actions.
      requirement_refs:
        - R-008
      decision_refs:
        - D-005
  boundaries:
    - id: ChoiceSurface
      statement: Runtime tool exposure and per-action/mode restrictions choose native or stable numbered fallback.
      invariant_refs:
        - INV-001
    - id: DecisionAuthority
      statement: Explicit scoped replies or verified plan policy resolve choices; context values alone never grant
        approval/write authority.
      invariant_refs:
        - INV-001
        - INV-002
    - id: FinishOwner
      statement: One parent/integration caller owns final finish; workers remain unit-only.
      invariant_refs:
        - INV-002
        - INV-003
    - id: EvidenceGate
      statement: Command/snapshot validators prove phase freshness; planner intent or completion flags do not.
      invariant_refs:
        - INV-003
  dependency_directions:
    - from: current runtime exposure and constraints
      to: interaction policy and surface dispatch
      rationale: Provider mappings are candidates; current host evidence and action restrictions govern actual use.
      invariant_refs:
        - INV-001
    - from: explicit user decision or verified approved plan policy
      to: scoped decision resolution
      rationale: Scope-specific authority is consumed, not synthesized from recommendation or previous unrelated replies.
      invariant_refs:
        - INV-001
        - INV-002
    - from: executor/worker output and verified owner identity
      to: parent/integration canonical finish resolver
      rationale: Workers return evidence; one final owner resolves and runs only authorized next steps.
      invariant_refs:
        - INV-002
        - INV-003
    - from: canonical finish resolver
      to: existing Test/Simplify/Review/Repair/Documentation/Ship owners
      rationale: The tail orders requests; each existing owner retains its preflight, limits and verification authority.
      invariant_refs:
        - INV-002
        - INV-003
  data_state_owners:
    - subject: Scoped decisions and phase progress inside existing producer contexts / portable state_delta
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      invariant_refs:
        - INV-001
        - INV-002
    - subject: Observed source snapshots, command receipts and content-bound verification references
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      invariant_refs:
        - INV-003
    - subject: Immutable approved spec/architecture/plan artifacts; reusable canonical sources and generated mirrors
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      invariant_refs:
        - INV-004
  public_contracts: []
  security_trust_boundaries:
    - id: CurrentRuntimeBoundary
      statement: Only current host observations of exposed tools, allowed actions and runtime/mode restrictions may
        enable native use; serialized capability claims are hints.
      invariant_refs:
        - INV-001
    - id: ScopedAuthorizationBoundary
      statement: Gate/artifact/revision-or-authorization-scope/options identity is required for reuse; raw 1 with
        multiple candidate gates, stale records and visual/default feedback do not approve.
      invariant_refs:
        - INV-001
        - INV-002
    - id: WriteAndEvidenceBoundary
      statement: Tail choice is not an authority escalation. Existing scope/protected/repair/docs gates remain
        authoritative; any affected write invalidates proof.
      invariant_refs:
        - INV-002
        - INV-003
  cross_repository_integration: []
  adopted_decision_refs:
    - D-001
    - D-002
    - D-003
    - D-004
    - D-005
  deferred_decision_refs: []
  assumption_refs: []
  validation_obligations:
    - id: VAL-001
      expected_proof: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007 must be proved by documented payload through
        existing helpers and real completion consumers, including paired negative mutations.
      owner: sdcorejs-test
      invariant_refs:
        - INV-001
      acceptance_criterion_refs:
        - AC-001
        - AC-002
        - AC-003
        - AC-004
        - AC-005
        - AC-006
        - AC-007
    - id: VAL-002
      expected_proof: AC-008, AC-009, AC-010, AC-011, AC-012, AC-013, AC-014, AC-015 must be proved by documented payload
        through existing helpers and real completion consumers, including paired negative mutations.
      owner: sdcorejs-test
      invariant_refs:
        - INV-002
      acceptance_criterion_refs:
        - AC-008
        - AC-009
        - AC-010
        - AC-011
        - AC-012
        - AC-013
        - AC-014
        - AC-015
    - id: VAL-003
      expected_proof: AC-016, AC-017 must be proved by documented payload through existing helpers and real completion
        consumers, including paired negative mutations.
      owner: sdcorejs-test
      invariant_refs:
        - INV-003
      acceptance_criterion_refs:
        - AC-016
        - AC-017
    - id: VAL-004
      expected_proof: AC-018 must be proved by documented payload through existing helpers and real completion consumers,
        including paired negative mutations.
      owner: sdcorejs-test
      invariant_refs:
        - INV-004
      acceptance_criterion_refs:
        - AC-018
  profile_sections:
    frontend_architecture_ref: null
    agent_architecture_ref: null
  change_control:
    revision: 1
    supersedes: null
```
