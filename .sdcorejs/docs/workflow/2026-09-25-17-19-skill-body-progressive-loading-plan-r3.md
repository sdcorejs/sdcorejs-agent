---
artifact_id: draft-plan-skill-body-progressive-loading-20260925-r3
artifact_kind: execution-doc
change_ref: skill-body-progressive-loading-20260925
source_spec: .sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
source_architecture: none
source_plan: .sdcorejs/plans/workflow/2026-09-25-15-40-skill-body-progressive-loading-r2.md
commit_policy: with-change
owner: sdcorejs-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87
status: draft
revision: 3
supersedes: .sdcorejs/plans/workflow/2026-09-25-15-40-skill-body-progressive-loading-r2.md
---
# Skill body progressive loading — plan r3

# Governance alignment for delivery convergence

Revision r3 supersedes r2 (`.sdcorejs/plans/workflow/2026-09-25-15-40-skill-body-progressive-loading-r2.md`, sha256:v1:b24f9a5e9b28759b3d3deb9ad25322641e137e82ca434a8f926cf1dcf95033bb) and keeps the approved spec
(`.sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md`, sha256:v1:a2b22b1e5638704f749b9e8f0ed7987b6bb818eea9c2e4303847d3474ac4ca14) as the only parent. It changes planning projections, adds two real
verification cases and authorizes one evidence regeneration; it does not change spec content, r1/r2 snapshots or any skill,
reference, mirror, metric or fixture content.

User authority: reply `1` to "Plan r3 governance-only" and reply `1` to "add two tests" (both on 2026-09-25).

## Why

`evaluateConvergence` (`_refs/shared/convergence-contract.mjs`) compares approved intent with the delivery. Against r1 it
blocks on: planned paths that were candidates but were not needed (39 paths); validation rows and tasks without
an invariant; acceptance criteria whose second requirement (AC-005/R-005, AC-007/R-007) has no row; risk labels that are not
`RISK-###`. Case ids are globally unique, so the two missing rows need their own real cases.

## Changes in this revision

1. Planned paths equal delivered paths. Dropped candidates (unchanged, verified not needed):
   - TASK-002: _refs/angular/write-code/po-ba-prototype.md
   - TASK-002: _refs/angular/write-code/generation-rules.md
   - TASK-002: _refs/angular/write-code/screen-detail.md
   - TASK-002: _refs/angular/write-code/init-entity.md
   - TASK-002: _refs/angular/write-code/input-analysis.md
   - TASK-002: _refs/angular/write-code/reuse-existing-entities.md
   - TASK-002: _refs/angular/write-code/mock-api-input.md
   - TASK-002: _refs/angular/styling.md
   - TASK-002: _refs/shared/sdcorejs-utils.md
   - TASK-004: _refs/design/mobile-design.md
   - TASK-004: _refs/design/frontend-design.md
   - TASK-004: _refs/shared/design-handoff.md
   - TASK-005: _refs/shared/explore-context.md
   - TASK-006: test/e2e/ai-agent-track-contract.test.mjs
   - TASK-006: test/e2e/angular-production-contract.test.mjs
   - TASK-006: test/e2e/artifact-path-convention.test.mjs
   - TASK-006: test/e2e/convention-artifact-lifecycle.test.mjs
   - TASK-006: test/e2e/convention-contract.test.mjs
   - TASK-006: test/e2e/convention-review.test.mjs
   - TASK-006: test/e2e/decision-coverage-contract.test.mjs
   - TASK-006: test/e2e/design-handoff-contract.test.mjs
   - TASK-006: test/e2e/documentation-layout-contract.test.mjs
   - TASK-006: test/e2e/harness-behavioral-sentinel.test.mjs
   - TASK-006: test/e2e/project-context-artifact-lifecycle.test.mjs
   - TASK-006: test/e2e/review-contract.test.mjs
   - TASK-006: test/e2e/simplify-protected-contract.test.mjs
   - TASK-006: test/e2e/test-track-contract.test.mjs
   - TASK-006: test/e2e/uiux-knowledge.test.mjs
   - TASK-006: test/e2e/uiux-review-regression.test.mjs
   - TASK-006: test/e2e/visual-offer-policy.test.mjs
   - TASK-006: test/e2e/support/skill-pack-runner.mjs
   - TASK-006: test/e2e/support/visual-offer-eval-runner.mjs
   - TASK-006: test/e2e/support/ui-review-fixture.mjs
   - TASK-007: .cursor/rules/sdcorejs-agent.mdc
   - TASK-007: .claude/sdcorejs-harness.json
   - TASK-007: plugin/sdcorejs-harness.json
   - TASK-007: codex/sdcorejs-harness.json
   - TASK-007: .cursor/sdcorejs-harness.json
   - TASK-007: .github/sdcorejs-harness.json
   TASK-007 now lists the 39 generated mirror files that `npm run sync:skills` actually wrote.
2. Decision coverage revision 2 adds INV-004 (delivery traceability) protecting every requirement and acceptance
   criterion; INV-001..003 keep their statements and protected records.
3. Validation map: one row per (acceptance criterion, requirement), 15 rows, risk `RISK-001` = semantic loss during the
   skill-structure refactor. New cases, authored in TASK-001's existing path `test/e2e/production-readiness-contract.test.mjs`:
   - `case-progressive-load-explore-inventory` (AC-005/R-005): same 23 public names as the baseline, no memory/persona/
     conventions public skill, explore private references are not skills, mirrors expose exactly the public inventory.
   - `case-progressive-load-distribution-resolution` (AC-007/R-007): every mirrored skill body names each private reference
     in its distribution's path form and the reference resolves to the source bytes.
4. Every row is proved by EVIDENCE-010, owned by TASK-010: the final `npm run test:e2e:repository` run on the final delivery
   content with Node v22.22.3 (engines-compatible). Per-task EVIDENCE-001..009 remain historical progress checks.
5. Task to acceptance-criterion map (implements or verifies):
   - TASK-001 Structural regression cases: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-013
   - TASK-002 Angular body and private references: AC-001, AC-002, AC-006, AC-007
   - TASK-003 Review body and private references: AC-001, AC-003, AC-006, AC-007, AC-013
   - TASK-004 Design body and private references: AC-001, AC-004, AC-006, AC-007, AC-013
   - TASK-005 Explore body and private references: AC-001, AC-005, AC-006, AC-007, AC-013
   - TASK-006 Retarget body-text assertions: AC-008, AC-009, AC-012
   - TASK-007 Generated mirrors: AC-007, AC-010
   - TASK-008 Honest measurement: AC-001, AC-012
   - TASK-009 Evidence continuation: AC-009, AC-011
   - TASK-010 Delivery and final verification: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-010, AC-011, AC-012, AC-013
6. TASK-009 regenerates `authoring/evals/skill-body-progressive-loading.json` after the test change; the record keeps r1 as
   its manifest authority. The convergence receipt stays runtime evidence (`release-evidence` is not a lifecycle-classified
   `.sdcorejs` kind) and its hashes are reported in the commit and handoff.
7. After branch-ready accepts current convergence: commit and push `codex/simplify-design-handoff`; no force push, no PR.

## Finish policy

```finish-policy
{"schema_version":1,"scope_fingerprint":"sha256:12a41dc5f41512b69b45d059c4d9f2db689c060db704a8e8de14bec4be1e73f2","test_strategy":"tdd","required_phases":["baseline","verify","review","branch-ready"],"decisions":{"simplify":"skip","review":"review-only"},"hooks":[]}
```

## Self-review

Plan-stage decision coverage, goal-backward round 1, repository plan and architecture draft-plan handoff: PASS.
Validation map: structurally complete; approval sealing happens with the approved snapshot.

## Typed plan context

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: skill-body-progressive-loading-20260925
  requirement_id: skill-body-progressive-loading-20260925
  approved_spec_path: .sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
  approved_spec_hash: sha256:v1:a2b22b1e5638704f749b9e8f0ed7987b6bb818eea9c2e4303847d3474ac4ca14
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-skill-body-progressive-loading-20260925-r1
    artifact_kind: spec
    revision: b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87
    approval_hash: sha256:v1:a2b22b1e5638704f749b9e8f0ed7987b6bb818eea9c2e4303847d3474ac4ca14
    repository_relative_path: .sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: docs-only
      rationale: Chỉ tái cấu trúc prose Markdown của skill/reference và retarget test tới canonical owner; không đổi
        runtime helper, public contract, routing, ownership, data model hay dependency.
    rationale: Chỉ tái cấu trúc prose Markdown của skill/reference và retarget test tới canonical owner; không đổi
      runtime helper, public contract, routing, ownership, data model hay dependency.
    blockers: []
    blocker_messages: []
  architecture_context: null
  approved_architecture_reference: null
  approved_architecture_path: null
  approved_architecture_hash: null
  approved_plan_path: null
  approved_plan_hash: null
  supersedes: .sdcorejs/plans/workflow/2026-09-25-15-40-skill-body-progressive-loading-r2.md
  target_root: C:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  dependency_order:
    - TASK-001
    - TASK-002
    - TASK-003
    - TASK-004
    - TASK-005
    - TASK-006
    - TASK-007
    - TASK-008
    - TASK-009
    - TASK-010
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 10
  phase_count: 4
  coverage_approach: TDD
  decision_coverage: &a1
    schema_version: 1
    revision: 2
    records:
      - id: R-001
        type: requirement
        statement: Rút gọn body của sdcorejs-angular, sdcorejs-review, sdcorejs-design và sdcorejs-explore; body chỉ
          giữ trigger, ownership/read-write boundary, preconditions/blocking gates, action selection, thứ tự
          điều phối, điều kiện load reference, handoff contract cần thiết và stop conditions.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-008
          - TASK-010
      - id: R-002
        type: requirement
        statement: Mỗi quy tắc chi tiết được chuyển có đúng một canonical owner (ưu tiên reference đã có); không mất
          điều kiện, ngoại lệ, MUST/MUST NOT hay enum/field name.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-010
      - id: R-003
        type: requirement
        statement: "Progressive loading: mỗi private reference có điều kiện load gắn với action/scope; không index bắt
          đọc toàn bộ khi vào skill; không vòng tham chiếu; tối đa một lớp indirection từ body."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
          - TASK-010
      - id: R-004
        type: requirement
        statement: "Safety-critical precondition nằm trong body và được load trước hành động nó kiểm soát: Angular
          approval/eligibility/architecture/Design input; Review read-only/no auto-repair; Design
          existing-design-first/draft-approved/ownership/verification; Explore read/write boundary,
          authoring-repo guard, redaction."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-010
      - id: R-005
        type: requirement
        statement: Giữ nguyên public inventory 23 skill, name, description, required-actions, aliases, routing
          semantics và write authority; không thêm public skill.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-006
          - TASK-010
      - id: R-006
        type: requirement
        statement: Không xóa hoặc nới safety assertion; assertion của nội dung được chuyển chỉ retarget sang canonical
          owner với literal/regex giữ nguyên; thêm structural checks cho reference resolution, load condition
          và gate-before-action.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-006
          - TASK-009
          - TASK-010
      - id: R-007
        type: requirement
        statement: Chỉ sửa canonical source; mirrors/distributions sinh bằng npm run sync:skills và đạt check:skills,
          text hygiene, executable references.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
          - TASK-010
      - id: R-008
        type: requirement
        statement: "Evidence trung thực: record step 4 giữ immutable và được xác minh như lịch sử; record continuation
          mới bind content hiện tại; communication-economy report và VALIDATION.md phản ánh số đo thật; chỉ
          báo bytes/lines/load scope, không tuyên bố token saving."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-006
          - TASK-008
          - TASK-009
          - TASK-010
      - id: AC-001
        type: acceptance-criterion
        statement: Bốn canonical body đều nhỏ hơn baseline (angular 45,361 B/498 L; review 29,321 B/457 L; design
          25,595 B/484 L; explore 24,062 B/500 L); báo cáo before/after bytes/lines đo bằng lệnh thật.
        behavior: body-size
        expected_result: Bốn canonical body đều nhỏ hơn baseline (angular 45,361 B/498 L; review 29,321 B/457 L;
          design 25,595 B/484 L; explore 24,062 B/500 L); báo cáo before/after bytes/lines đo bằng lệnh thật.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-008
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-002
        type: acceptance-criterion
        statement: Approval preflight vẫn là section đầu tiên của sdcorejs-angular và đứng trước mọi load reference;
          eligibility, technical-prototype opt-in, frontend architecture preflight, Design input rule, TDD
          mandatory và finish entrypoint vẫn nằm trong body.
        behavior: angular-gates
        expected_result: Approval preflight vẫn là section đầu tiên của sdcorejs-angular và đứng trước mọi load
          reference; eligibility, technical-prototype opt-in, frontend architecture preflight, Design input
          rule, TDD mandatory và finish entrypoint vẫn nằm trong body.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-003
        type: acceptance-criterion
        statement: sdcorejs-review body giữ direct review read-only, không silent .sdcorejs write, không auto-run
          repair-loop, option persist chỉ khi user chọn, dimension ids/purpose selection và Design/UI evidence
          semantics của bước 3.
        behavior: review-boundary
        expected_result: sdcorejs-review body giữ direct review read-only, không silent .sdcorejs write, không
          auto-run repair-loop, option persist chỉ khi user chọn, dimension ids/purpose selection và Design/UI
          evidence semantics của bước 3.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-004
        type: acceptance-criterion
        statement: sdcorejs-design body giữ existing-design-first, draft không là implementation contract,
          approval/material change về owner, semantic owner/no portal fallback, resolver path và tách
          structural/verified handoff ngay nơi cần.
        behavior: design-boundary
        expected_result: sdcorejs-design body giữ existing-design-first, draft không là implementation contract,
          approval/material change về owner, semantic owner/no portal fallback, resolver path và tách
          structural/verified handoff ngay nơi cần.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-005
        type: acceptance-criterion
        statement: sdcorejs-explore body giữ action table với side-effect boundary, authoring-repo guard và global
          redaction; reference persistence chỉ load cho action write-approved/summary-refresh sau khi gate
          đạt; reference read-only không cấp quyền write; không thêm public memory/persona/conventions skill.
        behavior: explore-boundary
        expected_result: sdcorejs-explore body giữ action table với side-effect boundary, authoring-repo guard và
          global redaction; reference persistence chỉ load cho action write-approved/summary-refresh sau khi
          gate đạt; reference read-only không cấp quyền write; không thêm public memory/persona/conventions
          skill.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
          - R-005
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-006
        type: acceptance-criterion
        statement: Mỗi mục chuyển đi có clause map old section -> owner; nội dung không còn bản sao độc lập giữa body
          và owner; check tự động xác nhận key literal có ở owner.
        behavior: canonical-owner
        expected_result: Mỗi mục chuyển đi có clause map old section -> owner; nội dung không còn bản sao độc lập giữa
          body và owner; check tự động xác nhận key literal có ở owner.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-007
        type: acceptance-criterion
        statement: Mọi private reference mới được body nêu kèm điều kiện load theo action/scope, resolve từ source và
          mọi distribution, không tạo vòng và không bị load vô điều kiện khi vào skill.
        behavior: progressive-load
        expected_result: Mọi private reference mới được body nêu kèm điều kiện load theo action/scope, resolve từ
          source và mọi distribution, không tạo vòng và không bị load vô điều kiện khi vào skill.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
          - R-007
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-008
        type: acceptance-criterion
        statement: Public inventory vẫn 23; name/description/required-actions của bốn skill byte-identical với
          baseline; routing positive/negative suites hiện có đạt.
        behavior: inventory-routing
        expected_result: Public inventory vẫn 23; name/description/required-actions của bốn skill byte-identical với
          baseline; routing positive/negative suites hiện có đạt.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-006
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-009
        type: acceptance-criterion
        statement: Diff test không xóa hoặc làm yếu assertion; mọi assertion retarget giữ literal/regex và chỉ đổi
          file nguồn sang canonical owner.
        behavior: test-integrity
        expected_result: Diff test không xóa hoặc làm yếu assertion; mọi assertion retarget giữ literal/regex và chỉ
          đổi file nguồn sang canonical owner.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-006
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-010
        type: acceptance-criterion
        statement: npm run sync:skills rồi check:skills, check:text-hygiene, check:executable-references đều exit 0
          trên trạng thái cuối.
        behavior: distribution
        expected_result: npm run sync:skills rồi check:skills, check:text-hygiene, check:executable-references đều
          exit 0 trên trạng thái cuối.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-001
          - TASK-007
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-011
        type: acceptance-criterion
        statement: Record interaction-finish step 4 không đổi byte và được xác minh ở revision lịch sử; record
          continuation mới bind source hiện tại, command thật và từ chối omitted/stale/mutated/fabricated
          evidence.
        behavior: evidence-continuation
        expected_result: Record interaction-finish step 4 không đổi byte và được xác minh ở revision lịch sử; record
          continuation mới bind source hiện tại, command thật và từ chối omitted/stale/mutated/fabricated
          evidence.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-012
        type: acceptance-criterion
        statement: npm run report:communication-economy được chạy lại; fixture JIT path liệt kê đúng private reference
          mà scenario review phải load; VALIDATION.md cập nhật đúng số report; 361 consumer-required fields
          giữ nguyên; không có claim token/cost.
        behavior: metrics
        expected_result: npm run report:communication-economy được chạy lại; fixture JIT path liệt kê đúng private
          reference mà scenario review phải load; VALIDATION.md cập nhật đúng số report; 361 consumer-required
          fields giữ nguyên; không có claim token/cost.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-006
          - TASK-008
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: AC-013
        type: acceptance-criterion
        statement: Schema/template được chuyển (review_context, design spec, persona/memory frontmatter) chỉ tồn tại
          một bản; review_context example vẫn khớp field của _refs/shared/review-contract.mjs qua test.
        behavior: single-schema
        expected_result: Schema/template được chuyển (review_context, design spec, persona/memory frontmatter) chỉ tồn
          tại một bản; review_context example vẫn khớp field của _refs/shared/review-contract.mjs qua test.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: D-001
        type: decision
        statement: Tái dùng _refs/angular/write-code, _refs/design, _refs/shared trước; chỉ thêm thư mục skill-private
          _refs/review và _refs/explore theo tiền lệ _refs/simplify
        question: Private reference đặt ở đâu?
        selected_value: Tái dùng _refs/angular/write-code, _refs/design, _refs/shared trước; chỉ thêm thư mục
          skill-private _refs/review và _refs/explore theo tiền lệ _refs/simplify
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User yêu cầu ưu tiên reference đã có và private reference; không framework/registry mới.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - R-003
          - AC-006
          - AC-007
        task_refs:
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
      - id: D-002
        type: decision
        statement: Giữ nguyên assertion cho nội dung còn trong body; nội dung chuyển đi thì retarget cùng literal sang
          canonical owner; thêm structural test
        question: Test đang khóa text của body xử lý thế nào?
        selected_value: Giữ nguyên assertion cho nội dung còn trong body; nội dung chuyển đi thì retarget cùng literal
          sang canonical owner; thêm structural test
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User cấm xóa/nới safety assertion; retarget sang owner giữ nguyên độ mạnh.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-006
          - AC-009
        task_refs:
          - TASK-001
          - TASK-006
      - id: D-003
        type: decision
        statement: "Theo tiền lệ bước 3/4: record cũ immutable, xác minh ở revision lịch sử; record continuation mới
          cho bước 5"
        question: Evidence step 4 bị stale khi skill đổi xử lý thế nào?
        selected_value: "Theo tiền lệ bước 3/4: record cũ immutable, xác minh ở revision lịch sử; record continuation
          mới cho bước 5"
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User yêu cầu không sửa lịch sử để làm xanh và báo PASS chỉ khi command chạy trên trạng thái tương
          ứng.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-008
          - AC-011
        task_refs:
          - TASK-009
      - id: D-004
        type: decision
        statement: Báo bytes/lines và load scope; cập nhật fixture JIT path trung thực; không claim token/cost
        question: Đo và báo hiệu quả ra sao?
        selected_value: Báo bytes/lines và load scope; cập nhật fixture JIT path trung thực; không claim token/cost
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User cấm suy token saving từ số dòng.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-008
          - AC-001
          - AC-012
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-013
          - INV-001
          - INV-002
          - INV-003
          - INV-004
        task_refs:
          - TASK-008
          - TASK-010
        validation_boundary:
          kind: none
          source_refs: &a2
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
            - R-007
            - R-008
            - AC-001
            - AC-002
            - AC-003
            - AC-004
            - AC-005
            - AC-006
            - AC-007
            - AC-008
            - AC-009
            - AC-010
            - AC-011
            - AC-012
            - AC-013
            - INV-001
            - INV-002
            - INV-003
            - INV-004
      - id: D-005
        type: decision
        statement: Không public skill mới, không dependency, không commit/push/PR, không sửa repo sản phẩm, không bước 6
        question: Giới hạn delivery?
        selected_value: Không public skill mới, không dependency, không commit/push/PR, không sửa repo sản phẩm, không bước 6
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Non-goals nêu rõ trong request bước 5.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-008
        task_refs:
          - TASK-007
          - TASK-010
      - id: INV-001
        type: invariant
        statement: Approval, eligibility và write-boundary gate luôn đọc được trong body trước hành động chúng kiểm
          soát.
        protected_refs:
          - R-004
          - AC-002
          - AC-003
          - AC-004
          - AC-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: INV-002
        type: invariant
        statement: "Không semantic change: approval, routing, write authority, evidence current/stale, schema
          field/enum và artifact lifecycle giữ nguyên."
        protected_refs:
          - R-002
          - R-005
          - AC-006
          - AC-013
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: INV-003
        type: invariant
        statement: Safety assertion và lịch sử evidence không bị xóa, nới hay viết lại để refactor pass.
        protected_refs:
          - R-006
          - R-008
          - AC-009
          - AC-011
        task_refs:
          - TASK-001
          - TASK-006
          - TASK-008
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: INV-004
        type: invariant
        statement: Mọi path giao, mirror sinh ra, số đo và evidence record truy vết được tới task đã thực thi và tới
          lần verification đạt trên đúng nội dung giao cuối cùng.
        protected_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
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
    decision_coverage: *a1
    goals:
      - id: G-001
        statement: Shorter orchestration bodies with per-action private references and unchanged gates, inventory,
          routing, authority and evidence.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths: &a4
          - test/e2e/production-readiness-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-013
              - INV-001
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths: &a6
          - skills/tracks/angular/sdcorejs-angular.md
          - _refs/angular/write-code/generation-process.md
          - _refs/angular/write-code/finishing.md
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-007
              - AC-001
              - AC-002
              - AC-006
              - AC-007
              - INV-001
              - INV-002
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-007
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-004
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths: &a7
          - skills/shared/workflow/review.md
          - _refs/review/profiles-and-refs.md
          - _refs/review/probes.md
          - _refs/review/output-contract.md
          - _refs/review/context-extensions.md
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-007
              - AC-001
              - AC-003
              - AC-006
              - AC-007
              - AC-013
              - INV-001
              - INV-002
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-007
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-004
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths: &a8
          - skills/tracks/design/sdcorejs-design.md
          - _refs/design/handoff-authoring.md
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-007
              - AC-001
              - AC-004
              - AC-006
              - AC-007
              - AC-013
              - INV-001
              - INV-002
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-007
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-004
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-004
        planned_paths: &a9
          - skills/shared/workflow/explore.md
          - _refs/explore/read-actions.md
          - _refs/explore/authorized-persistence.md
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-007
              - AC-001
              - AC-005
              - AC-006
              - AC-007
              - AC-013
              - INV-001
              - INV-002
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-007
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-004
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
        planned_paths: &a10
          - test/e2e/architecture-contract.test.mjs
          - test/e2e/communication-economy.test.mjs
          - test/e2e/convergence-contract.test.mjs
          - test/e2e/explore-topology.test.mjs
          - test/e2e/simplify-skill-contract.test.mjs
          - test/e2e/skill-pack-runner.test.mjs
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-005
              - R-006
              - R-008
              - AC-008
              - AC-009
              - AC-012
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-005
          - R-006
          - R-008
        enforces_invariant_refs:
          - INV-002
          - INV-003
          - INV-004
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-006
        planned_paths: &a3
          - .claude/_refs/angular/write-code/finishing.md
          - .claude/_refs/angular/write-code/generation-process.md
          - .claude/_refs/design/handoff-authoring.md
          - .claude/_refs/explore/authorized-persistence.md
          - .claude/_refs/explore/read-actions.md
          - .claude/_refs/review/context-extensions.md
          - .claude/_refs/review/output-contract.md
          - .claude/_refs/review/probes.md
          - .claude/_refs/review/profiles-and-refs.md
          - .claude/skills/sdcorejs-angular/SKILL.md
          - .claude/skills/sdcorejs-design/SKILL.md
          - .claude/skills/sdcorejs-explore/SKILL.md
          - .claude/skills/sdcorejs-review/SKILL.md
          - codex/skills/_refs/angular/write-code/finishing.md
          - codex/skills/_refs/angular/write-code/generation-process.md
          - codex/skills/_refs/design/handoff-authoring.md
          - codex/skills/_refs/explore/authorized-persistence.md
          - codex/skills/_refs/explore/read-actions.md
          - codex/skills/_refs/review/context-extensions.md
          - codex/skills/_refs/review/output-contract.md
          - codex/skills/_refs/review/probes.md
          - codex/skills/_refs/review/profiles-and-refs.md
          - codex/skills/sdcorejs-angular/SKILL.md
          - codex/skills/sdcorejs-design/SKILL.md
          - codex/skills/sdcorejs-explore/SKILL.md
          - codex/skills/sdcorejs-review/SKILL.md
          - plugin/_refs/angular/write-code/finishing.md
          - plugin/_refs/angular/write-code/generation-process.md
          - plugin/_refs/design/handoff-authoring.md
          - plugin/_refs/explore/authorized-persistence.md
          - plugin/_refs/explore/read-actions.md
          - plugin/_refs/review/context-extensions.md
          - plugin/_refs/review/output-contract.md
          - plugin/_refs/review/probes.md
          - plugin/_refs/review/profiles-and-refs.md
          - plugin/skills/sdcorejs-angular/SKILL.md
          - plugin/skills/sdcorejs-design/SKILL.md
          - plugin/skills/sdcorejs-explore/SKILL.md
          - plugin/skills/sdcorejs-review/SKILL.md
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-003
              - R-007
              - AC-007
              - AC-010
              - INV-004
        justification_refs:
          - R-003
          - R-007
        enforces_invariant_refs:
          - INV-004
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-007
        planned_paths: &a11
          - test/e2e/fixtures/communication-economy-scenarios.json
          - VALIDATION.md
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-001
              - R-008
              - AC-001
              - AC-012
              - INV-003
              - INV-004
        justification_refs:
          - R-001
          - R-008
        enforces_invariant_refs:
          - INV-003
          - INV-004
      - id: TASK-009
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-008
        planned_paths: &a12
          - authoring/evals/uiux/evidence.test.mjs
          - authoring/evals/skill-body-progressive-loading.json
          - test/e2e/npm-publication-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-009
            record_refs:
              - R-006
              - R-008
              - AC-009
              - AC-011
              - INV-003
              - INV-004
        justification_refs:
          - R-006
          - R-008
        enforces_invariant_refs:
          - INV-003
          - INV-004
      - id: TASK-010
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-009
        planned_paths: &a13
          - .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-delivery.md
        planned_evidence:
          - id: EVIDENCE-010
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - R-008
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - AC-012
              - AC-013
              - INV-001
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - .claude/_refs/angular/write-code/finishing.md
            - .claude/_refs/angular/write-code/generation-process.md
            - .claude/_refs/design/handoff-authoring.md
            - .claude/_refs/explore/authorized-persistence.md
            - .claude/_refs/explore/read-actions.md
            - .claude/_refs/review/context-extensions.md
            - .claude/_refs/review/output-contract.md
            - .claude/_refs/review/probes.md
            - .claude/_refs/review/profiles-and-refs.md
            - .claude/skills/sdcorejs-angular/SKILL.md
            - .claude/skills/sdcorejs-design/SKILL.md
            - .claude/skills/sdcorejs-explore/SKILL.md
            - .claude/skills/sdcorejs-review/SKILL.md
            - .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-delivery.md
            - VALIDATION.md
            - _refs/angular/write-code/finishing.md
            - _refs/angular/write-code/generation-process.md
            - _refs/design/handoff-authoring.md
            - _refs/explore/authorized-persistence.md
            - _refs/explore/read-actions.md
            - _refs/review/context-extensions.md
            - _refs/review/output-contract.md
            - _refs/review/probes.md
            - _refs/review/profiles-and-refs.md
            - authoring/evals/skill-body-progressive-loading.json
            - authoring/evals/uiux/evidence.test.mjs
            - codex/skills/_refs/angular/write-code/finishing.md
            - codex/skills/_refs/angular/write-code/generation-process.md
            - codex/skills/_refs/design/handoff-authoring.md
            - codex/skills/_refs/explore/authorized-persistence.md
            - codex/skills/_refs/explore/read-actions.md
            - codex/skills/_refs/review/context-extensions.md
            - codex/skills/_refs/review/output-contract.md
            - codex/skills/_refs/review/probes.md
            - codex/skills/_refs/review/profiles-and-refs.md
            - codex/skills/sdcorejs-angular/SKILL.md
            - codex/skills/sdcorejs-design/SKILL.md
            - codex/skills/sdcorejs-explore/SKILL.md
            - codex/skills/sdcorejs-review/SKILL.md
            - plugin/_refs/angular/write-code/finishing.md
            - plugin/_refs/angular/write-code/generation-process.md
            - plugin/_refs/design/handoff-authoring.md
            - plugin/_refs/explore/authorized-persistence.md
            - plugin/_refs/explore/read-actions.md
            - plugin/_refs/review/context-extensions.md
            - plugin/_refs/review/output-contract.md
            - plugin/_refs/review/probes.md
            - plugin/_refs/review/profiles-and-refs.md
            - plugin/skills/sdcorejs-angular/SKILL.md
            - plugin/skills/sdcorejs-design/SKILL.md
            - plugin/skills/sdcorejs-explore/SKILL.md
            - plugin/skills/sdcorejs-review/SKILL.md
            - skills/shared/workflow/explore.md
            - skills/shared/workflow/review.md
            - skills/tracks/angular/sdcorejs-angular.md
            - skills/tracks/design/sdcorejs-design.md
            - test/e2e/architecture-contract.test.mjs
            - test/e2e/communication-economy.test.mjs
            - test/e2e/convergence-contract.test.mjs
            - test/e2e/explore-topology.test.mjs
            - test/e2e/fixtures/communication-economy-scenarios.json
            - test/e2e/npm-publication-contract.test.mjs
            - test/e2e/production-readiness-contract.test.mjs
            - test/e2e/simplify-skill-contract.test.mjs
            - test/e2e/skill-pack-runner.test.mjs
          intended_new_paths: []
    critique_history:
      - round: 1
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers: []
        resolved_blockers: []
        unresolved_blockers: []
  validation_map:
    - requirement_id: R-001
      acceptance_criterion_id: AC-001
      invariant_refs:
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-body-size
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Bốn canonical body đều nhỏ hơn baseline (angular 45,361 B/498 L; review 29,321 B/457 L; design
        25,595 B/484 L; explore 24,062 B/500 L); báo cáo before/after bytes/lines đo bằng lệnh thật.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-001
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-angular-gates
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Approval preflight vẫn là section đầu tiên của sdcorejs-angular và đứng trước mọi load
        reference; eligibility, technical-prototype opt-in, frontend architecture preflight, Design input
        rule, TDD mandatory và finish entrypoint vẫn nằm trong body.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-001
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-review-boundary
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: sdcorejs-review body giữ direct review read-only, không silent .sdcorejs write, không auto-run
        repair-loop, option persist chỉ khi user chọn, dimension ids/purpose selection và Design/UI evidence
        semantics của bước 3.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-001
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-design-boundary
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: sdcorejs-design body giữ existing-design-first, draft không là implementation contract,
        approval/material change về owner, semantic owner/no portal fallback, resolver path và tách
        structural/verified handoff ngay nơi cần.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-001
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-explore-boundary
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: sdcorejs-explore body giữ action table với side-effect boundary, authoring-repo guard và
        global redaction; reference persistence chỉ load cho action write-approved/summary-refresh sau khi
        gate đạt; reference read-only không cấp quyền write; không thêm public memory/persona/conventions
        skill.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-001
        - INV-002
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-explore-inventory
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: sdcorejs-explore body giữ action table với side-effect boundary, authoring-repo guard và
        global redaction; reference persistence chỉ load cho action write-approved/summary-refresh sau khi
        gate đạt; reference read-only không cấp quyền write; không thêm public memory/persona/conventions
        skill.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-002
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-canonical-owner
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mỗi mục chuyển đi có clause map old section -> owner; nội dung không còn bản sao độc lập giữa
        body và owner; check tự động xác nhận key literal có ở owner.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-reference-loading
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mọi private reference mới được body nêu kèm điều kiện load theo action/scope, resolve từ
        source và mọi distribution, không tạo vòng và không bị load vô điều kiện khi vào skill.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-distribution-resolution
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mọi private reference mới được body nêu kèm điều kiện load theo action/scope, resolve từ
        source và mọi distribution, không tạo vòng và không bị load vô điều kiện khi vào skill.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-002
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-inventory-routing
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Public inventory vẫn 23; name/description/required-actions của bốn skill byte-identical với
        baseline; routing positive/negative suites hiện có đạt.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-003
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-test-integrity
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Diff test không xóa hoặc làm yếu assertion; mọi assertion retarget giữ literal/regex và chỉ
        đổi file nguồn sang canonical owner.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-distribution
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: npm run sync:skills rồi check:skills, check:text-hygiene, check:executable-references đều exit
        0 trên trạng thái cuối.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-011
      invariant_refs:
        - INV-003
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-evidence-continuation
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Record interaction-finish step 4 không đổi byte và được xác minh ở revision lịch sử; record
        continuation mới bind source hiện tại, command thật và từ chối omitted/stale/mutated/fabricated
        evidence.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-003
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-metrics
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: npm run report:communication-economy được chạy lại; fixture JIT path liệt kê đúng private
        reference mà scenario review phải load; VALIDATION.md cập nhật đúng số report; 361 consumer-required
        fields giữ nguyên; không có claim token/cost.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-013
      invariant_refs:
        - INV-002
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a2
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-progressive-load-single-schema
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Schema/template được chuyển (review_context, design spec, persona/memory frontmatter) chỉ tồn
        tại một bản; review_context example vẫn khớp field của _refs/shared/review-contract.mjs qua test.
      status: covered
      evidence_refs:
        - EVIDENCE-010
      rationale: Final repository suite on the final delivery content with an engines-compatible Node runtime; not
        executed evidence until recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  allowed_paths:
    - .claude/_refs/angular/write-code/finishing.md
    - .claude/_refs/angular/write-code/generation-process.md
    - .claude/_refs/design/handoff-authoring.md
    - .claude/_refs/explore/authorized-persistence.md
    - .claude/_refs/explore/read-actions.md
    - .claude/_refs/review/context-extensions.md
    - .claude/_refs/review/output-contract.md
    - .claude/_refs/review/probes.md
    - .claude/_refs/review/profiles-and-refs.md
    - .claude/skills/sdcorejs-angular/SKILL.md
    - .claude/skills/sdcorejs-design/SKILL.md
    - .claude/skills/sdcorejs-explore/SKILL.md
    - .claude/skills/sdcorejs-review/SKILL.md
    - .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-delivery.md
    - .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-plan.md
    - .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-spec.md
    - .sdcorejs/docs/workflow/2026-09-25-15-40-skill-body-progressive-loading-plan-r2.md
    - .sdcorejs/docs/workflow/2026-09-25-17-19-skill-body-progressive-loading-plan-r3.md
    - .sdcorejs/plans/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
    - .sdcorejs/plans/workflow/2026-09-25-15-40-skill-body-progressive-loading-r2.md
    - .sdcorejs/plans/workflow/2026-09-25-17-19-skill-body-progressive-loading-r3.md
    - .sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
    - VALIDATION.md
    - _refs/angular/write-code/finishing.md
    - _refs/angular/write-code/generation-process.md
    - _refs/design/handoff-authoring.md
    - _refs/explore/authorized-persistence.md
    - _refs/explore/read-actions.md
    - _refs/review/context-extensions.md
    - _refs/review/output-contract.md
    - _refs/review/probes.md
    - _refs/review/profiles-and-refs.md
    - authoring/evals/skill-body-progressive-loading.json
    - authoring/evals/uiux/evidence.test.mjs
    - codex/skills/_refs/angular/write-code/finishing.md
    - codex/skills/_refs/angular/write-code/generation-process.md
    - codex/skills/_refs/design/handoff-authoring.md
    - codex/skills/_refs/explore/authorized-persistence.md
    - codex/skills/_refs/explore/read-actions.md
    - codex/skills/_refs/review/context-extensions.md
    - codex/skills/_refs/review/output-contract.md
    - codex/skills/_refs/review/probes.md
    - codex/skills/_refs/review/profiles-and-refs.md
    - codex/skills/sdcorejs-angular/SKILL.md
    - codex/skills/sdcorejs-design/SKILL.md
    - codex/skills/sdcorejs-explore/SKILL.md
    - codex/skills/sdcorejs-review/SKILL.md
    - plugin/_refs/angular/write-code/finishing.md
    - plugin/_refs/angular/write-code/generation-process.md
    - plugin/_refs/design/handoff-authoring.md
    - plugin/_refs/explore/authorized-persistence.md
    - plugin/_refs/explore/read-actions.md
    - plugin/_refs/review/context-extensions.md
    - plugin/_refs/review/output-contract.md
    - plugin/_refs/review/probes.md
    - plugin/_refs/review/profiles-and-refs.md
    - plugin/skills/sdcorejs-angular/SKILL.md
    - plugin/skills/sdcorejs-design/SKILL.md
    - plugin/skills/sdcorejs-explore/SKILL.md
    - plugin/skills/sdcorejs-review/SKILL.md
    - skills/shared/workflow/explore.md
    - skills/shared/workflow/review.md
    - skills/tracks/angular/sdcorejs-angular.md
    - skills/tracks/design/sdcorejs-design.md
    - test/e2e/architecture-contract.test.mjs
    - test/e2e/communication-economy.test.mjs
    - test/e2e/convergence-contract.test.mjs
    - test/e2e/explore-topology.test.mjs
    - test/e2e/fixtures/communication-economy-scenarios.json
    - test/e2e/npm-publication-contract.test.mjs
    - test/e2e/production-readiness-contract.test.mjs
    - test/e2e/simplify-skill-contract.test.mjs
    - test/e2e/skill-pack-runner.test.mjs
  prohibited_paths: &a5
    - package.json
    - package-lock.json
    - node_modules/**
    - site/**
    - .git/**
    - .env
    - .env.*
    - _refs/shared/system-registry.json
    - _refs/shared/*.mjs
    - _refs/harness/**
    - _refs/orchestration/**
    - _refs/simplify/**
    - skills/orchestration/**
    - skills/shared/sdlc/**
    - skills/tracks/ai-agent/**
    - skills/tracks/nestjs/**
    - skills/tracks/nextjs/**
    - skills/tracks/product/**
    - skills/tracks/test/**
    - skills/shared/workflow/debug.md
    - skills/shared/workflow/git.md
    - skills/shared/workflow/ship.md
    - skills/shared/workflow/simplify.md
    - AGENTS.md
    - CLAUDE.md
    - .sdcorejs/specs/**
    - .sdcorejs/architecture/**
    - .sdcorejs/conventions/**
    - .sdcorejs/memories/**
    - authoring/evals/interaction-finish-contract.json
    - authoring/evals/uiux/*.json
    - authoring/evals/uiux/*.txt
    - authoring/evals/records/**
    - authoring/evals/visual-offer/**
    - test/e2e/fixtures/communication-economy-baseline.json
  generated_artifacts: *a3
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-delivery.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-spec.md
    - .sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
    - .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-plan.md
    - .sdcorejs/plans/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
    - .sdcorejs/docs/workflow/2026-09-25-15-40-skill-body-progressive-loading-plan-r2.md
    - .sdcorejs/plans/workflow/2026-09-25-15-40-skill-body-progressive-loading-r2.md
    - .sdcorejs/docs/workflow/2026-09-25-17-19-skill-body-progressive-loading-plan-r3.md
    - .sdcorejs/plans/workflow/2026-09-25-17-19-skill-body-progressive-loading-r3.md
  dependency_changes:
    required: false
    packages: []
    approval_required: false
  env_changes:
    required: false
    files: []
    approval_required: false
  migration_changes:
    required: false
    description: null
    approval_required: false
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Skill-pack Markdown structure only; no frontend product implementation.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: No agent application engine/capability implementation.
  verification_strategy:
    package_manager: npm
    package_manager_evidence: package.json packageManager npm@10.9.2; package-lock.json present.
    runtime: Node v22.22.3 from
      C:/Users/nghiatt15_onemount/AppData/Roaming/fnm/node-versions/v22.22.3/installation satisfies engines
      ^22.22.3; earlier runs in this change used v22.14.0 (below engines) and are historical only.
    commands_planned:
      - command: node --test test/e2e/production-readiness-contract.test.mjs
        reason: New explore-inventory and distribution-resolution cases plus existing structural cases
      - command: node record-gen (focused 24 suites + UI 4 suites) ->
          authoring/evals/skill-body-progressive-loading.json
        reason: Regenerate the content-bound evidence record after the test change
      - command: npm run check:skills
        reason: Mirror drift
      - command: npm run check:text-hygiene
        reason: Text hygiene
      - command: npm run check:executable-references
        reason: Reference/syntax validity
      - command: node authoring/evals/run-deterministic.mjs
        reason: Authoring routing matrix
      - command: npm run test:e2e:skill-authoring
        reason: Inventory and authoring contract
      - command: npm run test:e2e:repository
        reason: "EVIDENCE-010: final repository suite on the final delivery fingerprint (all 15 cases)"
      - command: git diff --check
        reason: Whitespace
    commands_skipped:
      - command: npm run test:e2e:angular:golden / nestjs / nextjs golden / containers
        reason: No generator or template code changes; golden projects do not read the four skill bodies. NOT RUN.
      - command: npm run check:skills:ps
        reason: PowerShell mirror path duplicates check:skills; run only if time allows, otherwise NOT RUN.
      - command: live agent / browser / provider matrix
        reason: Not authorized; NOT RUN.
    checks: Final commands run after every delivery write with an unchanged delivery fingerprint before and after.
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: test/e2e/production-readiness-contract.test.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; tasks depend on shared test and mirror state.
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - TASK-001
      - TASK-002
      - TASK-003
      - TASK-004
      - TASK-005
      - TASK-006
      - TASK-007
      - TASK-008
      - TASK-009
      - TASK-010
    contract:
      schema_version: 1
      integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      dependency_order:
        - TASK-001
        - TASK-002
        - TASK-003
        - TASK-004
        - TASK-005
        - TASK-006
        - TASK-007
        - TASK-008
        - TASK-009
        - TASK-010
      gitlink_updates_in_scope: false
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          role: standalone
          module_id: null
          root: C:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
          available: true
          writable: true
      steps:
        - id: TASK-001-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a4
          allowed_paths: *a4
          prohibited_paths: *a5
          depends_on: []
        - id: TASK-002-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a6
          allowed_paths: *a6
          prohibited_paths: *a5
          depends_on:
            - TASK-001-EDIT
        - id: TASK-003-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a7
          allowed_paths: *a7
          prohibited_paths: *a5
          depends_on:
            - TASK-002-EDIT
        - id: TASK-004-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a8
          allowed_paths: *a8
          prohibited_paths: *a5
          depends_on:
            - TASK-003-EDIT
        - id: TASK-005-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a9
          allowed_paths: *a9
          prohibited_paths: *a5
          depends_on:
            - TASK-004-EDIT
        - id: TASK-006-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a10
          allowed_paths: *a10
          prohibited_paths: *a5
          depends_on:
            - TASK-005-EDIT
        - id: TASK-007-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a3
          allowed_paths: *a3
          prohibited_paths: *a5
          depends_on:
            - TASK-006-EDIT
        - id: TASK-008-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a11
          allowed_paths: *a11
          prohibited_paths: *a5
          depends_on:
            - TASK-007-EDIT
        - id: TASK-009-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a12
          allowed_paths: *a12
          prohibited_paths: *a5
          depends_on:
            - TASK-008-EDIT
        - id: TASK-010-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths: *a13
          allowed_paths: *a13
          prohibited_paths: *a5
          depends_on:
            - TASK-009-EDIT
  finish_tail:
    contract:
      docs_before_final_branch_ready: true
      verify_before_done: true
      branch_ready_final_gate: true
      no_writes_after_branch_ready: true
    proposed_policy:
      test_strategy: "TDD: structural RED before skill edits; required AC checks cannot be skipped."
      documentation: Only the new private references, VALIDATION.md step-5 section, evidence record and delivery
        doc. No user guide, technical guide, memory or preference writes.
      simplify: "skip: changed content is protected skill/reference/test/governance Markdown; sdcorejs-simplify does
        not own prose."
      review: read-only review of this approved diff for lost conditions and weakened assertions; no automatic
        repair.
      repair: No blanket authority; findings needing scope return to the plan gate.
      git: No commit, push, PR, publish or dependency installation.
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 3
    supersedes: .sdcorejs/plans/workflow/2026-09-25-15-40-skill-body-progressive-loading-r2.md
    change_reason: User-approved governance alignment for delivery convergence plus two real verification cases.
```
