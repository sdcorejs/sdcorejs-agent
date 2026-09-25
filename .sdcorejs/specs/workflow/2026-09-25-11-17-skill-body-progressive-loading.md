---
acceptance_criteria_count: 13
approval_gate: sdcorejs-spec:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-09-25T04:36:15.438Z
approved_by: user
approved_draft_fingerprint: sha256:d21b0ccfc5e1bb77e635b7ca0274c7bf16872b52bcdbff2d73e32970739557ef
artifact_id: spec-skill-body-progressive-loading-20260925-r1
artifact_kind: spec
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: skill-body-progressive-loading-20260925
commit_policy: with-change
contract_id: skill-body-progressive-loading-20260925
description: Behavior-preserving skill-body slimming through private references
  loaded per action.
manual_criteria_count: 0
name: skill-body-progressive-loading
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
profile_confidence: high
redaction_applied: false
repository_relative_path: .sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
requirement_id: skill-body-progressive-loading-20260925
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-09-25-11-17-skill-body-progressive-loading-spec.md
source_plan: none
source_revision: b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:a2b22b1e5638704f749b9e8f0ed7987b6bb818eea9c2e4303847d3474ac4ca14
---
# Skill body progressive loading — Approved Spec

> Immutable snapshot of the draft approved by the user. The embedded draft approval fields describe its pre-approval state; this artifact metadata and verified hash govern approval.

## Approved contract

# Spec — Skill body progressive loading — 2026-09-25 11:17

## Problem & Goals
Bốn skill body lớn nhất trộn điều phối với chi tiết thực thi: agent phải đọc toàn bộ checklist, schema, template và matrix dù action hiện tại chỉ cần một phần. Mục tiêu: body ngắn hơn nhưng vẫn đủ chọn action và điều phối đúng; mỗi quy tắc chi tiết có một canonical owner; reference chỉ load khi action/scope cần; safety gates, routing và public inventory giữ nguyên. Đây là refactor cấu trúc skill-authoring trên HEAD b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87, sau bước 1–4 (simplify, Design handoff, Design/UI review, interaction/finish).

## Prerequisite verification
Xác minh từ source, commit và approved artifacts, không dựa vào summary:

| Bước | Commit | Approved spec / plan | Delivery |
|---|---|---|---|
| 1 simplify contract | 1054c81 | .sdcorejs/specs/workflow/2026-09-22-12-43-simplify-contract-hardening.md / plans/…-r2 | 2026-09-22-13-00-…-delivery.md |
| 2 Design handoff | 1054c81 | .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md / plans/…-r2 | 2026-09-23-10-45-…-delivery.md |
| 3 Design/UI review | 7e7f428 | .sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md | 2026-09-23-17-41-…-delivery.md |
| 4 interaction/finish | b6e6c0c | .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md / plans/…-r2 | 2026-09-24-11-35-…-delivery.md |

Branch codex/simplify-design-handoff, working tree sạch lúc bắt đầu. Skill bodies hiện tại chứa kết quả bước 1–4 (resolveFinish/completeAngularExecution, ui_review purpose, design-verification, simplify v2 consumer). Không thiếu prerequisite.

## Requirements
- R-001 — Rút gọn body của sdcorejs-angular, sdcorejs-review, sdcorejs-design, sdcorejs-explore; body chỉ giữ trigger, ownership/read-write boundary, preconditions/blocking gates, action selection, thứ tự điều phối, điều kiện load reference, handoff contract cần thiết và stop conditions.
- R-002 — Mỗi quy tắc chuyển đi có đúng một canonical owner (ưu tiên reference đã có); không mất điều kiện, ngoại lệ, MUST/MUST NOT, enum hay field name.
- R-003 — Progressive loading: mỗi private reference có điều kiện load theo action/scope; không index bắt đọc toàn bộ; không vòng tham chiếu; tối đa một lớp indirection từ body.
- R-004 — Safety-critical precondition nằm trong body, trước hành động nó kiểm soát.
- R-005 — Giữ 23 public skills, name, description, required-actions, aliases, routing và write authority.
- R-006 — Không xóa/nới safety assertion; nội dung chuyển đi chỉ retarget assertion sang owner với cùng literal/regex; thêm structural checks.
- R-007 — Chỉ sửa canonical source; mirrors sinh bằng script và đạt các check.
- R-008 — Evidence trung thực: lịch sử bước 4 immutable; continuation mới cho nội dung hiện tại; số đo communication-economy và VALIDATION.md thật; không claim token.

## Decisions
- D-001 — Private reference đặt ở đâu? Tái dùng `_refs/angular/write-code`, `_refs/design`, `_refs/shared` trước; chỉ thêm thư mục skill-private `_refs/review/` và `_refs/explore/` theo tiền lệ `_refs/simplify/`.
- D-002 — Test đang khóa text body? Nội dung còn trong body giữ nguyên assertion; nội dung chuyển đi retarget cùng literal sang canonical owner; thêm structural test.
- D-003 — Evidence bước 4 stale khi skill đổi? Theo tiền lệ bước 3/4: record cũ immutable, xác minh tại revision lịch sử; tạo continuation record mới cho bước 5.
- D-004 — Báo hiệu quả? Bytes/lines và load scope; fixture JIT path trung thực; không claim token/cost.
- D-005 — Delivery? Không public skill mới, không dependency, không commit/push/PR, không sửa repo sản phẩm, không bước 6.

D-001…D-005 lấy từ ràng buộc trong request; spec chưa được duyệt. Đề xuất coverage `tdd`: structural/retarget tests viết trước (RED vì reference mới chưa tồn tại), rồi mới chuyển prose; chốt khi user duyệt spec, không cần lượt hỏi coverage riêng.

## Assumptions
Không có blocking assumption. Ghi chú: phát hiện ở baseline — `authoring/evals/uiux/evidence.test.mjs` pin hash của mọi `skills/**/*.md` và nhiều test file trong continuation bước 4, nên bất kỳ sửa skill nào cũng làm test "current continuation" fail theo thiết kế. Đây không phải defect; D-003 xử lý theo tiền lệ.

## Architecture gate classification
- Status: not-applicable
- Signals: none
- Bypass: `docs-only` — chỉ tái cấu trúc prose Markdown của skill/reference và retarget test tới canonical owner; không đổi runtime helper, public contract, routing, ownership, data model hay dependency. Classifier `classifyArchitectureGate` trả valid/not-applicable. Sau approval spec sẽ đi thẳng tới `sdcorejs-plan`.

## Non-goals
- Không thay đổi approval, routing, write authority, evidence current/stale semantics, schema field/enum, artifact lifecycle.
- Không thêm/đổi tên public skill; không tách list/create/update/detail; không `sdcorejs-uiux`, `sdcorejs-design-review`; không tách dependency-update.
- Không framework, registry hay state store mới chỉ để refactor Markdown; không sửa repo sản phẩm.
- Không dùng `sdcorejs-simplify` cho Markdown/prompt; không rút gọn bằng cách làm yếu MUST/MUST NOT hay bỏ ngoại lệ.
- Không commit, push, PR, publish, cài dependency hay sang bước 6.

## Architecture
Body = router điều phối. Mỗi skill có danh sách reference với điều kiện load cụ thể (action, profile, dimension, context present). Safety gate nằm trong body ở section đầu hoặc ngay trước bước nó kiểm soát; reference chỉ chứa chi tiết thực thi đọc sau khi gate đã đạt. Reference private không trỏ vòng lại body hay lẫn nhau theo vòng; reference chỉ link tới template/code đã có. Khi dedupe, mỗi clause của body được đối chiếu với owner hiện có; clause không có ở owner thì chuyển nguyên văn vào owner, không paraphrase làm yếu.

### Baseline (đo trên HEAD b6e6c0c)

| Skill body | Bytes | Lines | Refs load khi vào skill hiện nay |
|---|---:|---:|---|
| skills/tracks/angular/sdcorejs-angular.md | 45,361 | 498 | runtime-protocols, artifact-lifecycle; design-handoff khi có Design input; rồi dispatch theo scope |
| skills/shared/workflow/review.md | 29,321 | 457 | runtime-protocols, decision-coverage, validation-map, project-context, convention-context, convergence-contract; rồi matrix theo profile/dimension |
| skills/tracks/design/sdcorejs-design.md | 25,595 | 484 | runtime-protocols, artifact-lifecycle, design-handoff, frontend-design, frontend-architecture; mobile-design khi mobile |
| skills/shared/workflow/explore.md | 24,062 | 500 | runtime-protocols, project-context; explore-context trước output; convention-context cho conventions |

Checks bảo vệ hiện có (baseline chạy trên HEAD sạch): `check:skills` exit 0, `check:text-hygiene` exit 0 (1356 files), `check:executable-references` exit 0. Kết quả đầy đủ `test:e2e:repository` baseline được ghi vào plan (đang/đã chạy trên HEAD sạch; failure có sẵn sẽ tách riêng là pre-existing).

### Mapping đề xuất (old section → canonical owner → điều kiện load)

sdcorejs-angular
| Giữ trong body | Chuyển đi | Canonical owner | Load khi |
|---|---|---|---|
| Approval preflight (nguyên văn, section đầu) | — | body | luôn, trước mọi việc |
| Eligibility table, plain-angular stop, developer profile, Design-first routing | — | body | luôn |
| Technical-prototype opt-in/never-infer | Template-first chi tiết, input resolution prototype | `_refs/angular/write-code/po-ba-prototype.md` (đã có) | profile technical-prototype đã approved |
| Dispatch table, execution order, load triggers Step 0 (rút gọn) | Mô tả dài của từng preflight | input-analysis.md, mock-api-input.md, reuse-existing-entities.md, sdcorejs-utils.md (đã có) | theo trigger input tương ứng |
| TDD mandatory, RED-first, standard, không hỏi coverage (1 đoạn) | Chi tiết TDD gate, entity input resolution, semantic schema refinement, EntitySchema Step 1/2, Core UI docs discovery commands | mới `_refs/angular/write-code/generation-process.md` | trước bước sinh code đầu tiên |
| Finish entrypoint `completeAngularExecution`, Core UI summary bắt buộc (1 dòng) | Template Core UI usage summary, Validation Checklist, Core reuse summary/UI check final sections, finish hooks detail | mới `_refs/angular/write-code/finishing.md` | sau khi code viết xong, trước finish gate |
| MUST/MUST NOT điều phối và eligibility | MUST/MUST NOT trùng generation-rules (OnPush, template binding, Service/ViewModel), styling.md (utility-first), screen-detail (selection gate, child CRUD), init-entity (field roles), sdcorejs-utils | các ref đó (clause thiếu được chuyển nguyên văn vào) | cùng điều kiện load hiện có của ref |
| Design and UI review integration (1 đoạn) | — | body | khi Design/UI review áp dụng |

sdcorejs-review
| Giữ trong body | Chuyển đi | Canonical owner | Load khi |
|---|---|---|---|
| Purpose, read-only, no auto-repair, shared protocols, when to use, Step 0 context + scope order, dimension ids table, Post-review behavior, direct-review options, user-projection rule | — | body | luôn |
| Rule: classify profile trước khi load ref | Profile evidence table, không-coi-X-là-Y rules, reference matrix, consistency/frontend-architecture load rules, plain-profile guardrails, scored-mode support | mới `_refs/review/profiles-and-refs.md` | review executable code, trước khi load track ref |
| Redaction bắt buộc (tóm tắt MUST) | Probe discipline chi tiết, redaction reporting format | mới `_refs/review/probes.md` | trước khi chạy probe hoặc báo finding secret |
| Build review_context, projection | review_context schema, findings table, findings rules, persisted report fields | mới `_refs/review/output-contract.md` | trước khi dựng review_context/report |
| Trigger khi `ai_agent_context`/`simplify_context` có mặt | Checklist AI-agent review, simplification review | mới `_refs/review/context-extensions.md` | chỉ khi context tương ứng có mặt |
| Design/UI purpose selection, ui-review.md load | — | body + `_refs/shared/ui-review.md` (đã có) | Design/UI scope |

sdcorejs-design
| Giữ trong body | Chuyển đi | Canonical owner | Load khi |
|---|---|---|---|
| Shared protocols, verify vs validate separation, purpose/boundary, context preflight, Existing Design First (nguyên văn), UI/UX selection, visual offer, input order (rút gọn), experience_kind ownership, resolver bắt buộc, draft/approved/material-change boundary, artifact_context closure rule | — | body | luôn |
| Tên bước workflow + điều kiện | Nội dung design plan, screen map, spec template, wireframe rules, PNG pipeline + provenance, ledger detail, path roles table | mới `_refs/design/handoff-authoring.md` | khi tạo/cập nhật durable handoff |
| Mobile trigger | Danh sách mobile plan/state chi tiết | `_refs/design/mobile-design.md` (đã có; bổ sung clause thiếu) | mobile surface |
| Legacy read-only rule (1 đoạn) | Ma trận legacy compatibility | `_refs/shared/design-handoff.md` (đã có "full matrix") | khi gặp root-level design/** |

sdcorejs-explore
| Giữ trong body | Chuyển đi | Canonical owner | Load khi |
|---|---|---|---|
| Purpose, routing-away, shared protocols, action table + side-effect boundary, read-only/write-approved invariants, authoring-repo guard, global redaction, output invariants, downstream interaction | — | body | luôn |
| — | Stack profile rules, topology discovery, scanning discipline, command discipline, code-map, documentation-harvest, trace-flow, env-setup-readonly, recovery (kèm choice prompt) | mới `_refs/explore/read-actions.md` | action read-only tương ứng |
| Gate: approval + guard trước write | summary-refresh/code-map-write/env-write chi tiết, persona template, memory template | mới `_refs/explore/authorized-persistence.md` | chỉ action write-approved/summary-refresh sau khi gate đạt |
| Convention invariants | — | `_refs/shared/convention-context.md` (đã có) | conventions actions |

## Stack profile and technology assumptions
- Track: workflow; stack profile: markdown-skill-pack; confidence high.
- Evidence: AGENTS.md, package.json (npm@10.9.2, node test runner), skills/**, _refs/shared/system-registry.json.
- Không dependency mới. Artifact review viết tiếng Việt; reusable source giữ English.

## File structure
Candidate scope (plan sẽ chốt write paths chính xác):
- Edit: 4 canonical bodies trong bảng baseline.
- Create: `_refs/angular/write-code/generation-process.md`, `_refs/angular/write-code/finishing.md`, `_refs/review/profiles-and-refs.md`, `_refs/review/probes.md`, `_refs/review/output-contract.md`, `_refs/review/context-extensions.md`, `_refs/design/handoff-authoring.md`, `_refs/explore/read-actions.md`, `_refs/explore/authorized-persistence.md`.
- Edit (nhận clause dedupe khi thiếu): `_refs/angular/write-code/{po-ba-prototype,generation-rules,screen-detail,init-entity,input-analysis}.md`, `_refs/angular/styling.md`, `_refs/shared/sdcorejs-utils.md`, `_refs/design/mobile-design.md`, `_refs/shared/design-handoff.md`.
- Tests: các suite đang đọc text của bốn body (angular-production, skill-pack-runner, communication-economy, architecture, convergence, design-handoff, artifact-path, explore-topology, production-readiness, visual-offer-policy, uiux-knowledge, review/test-track/ai-agent/simplify/decision-coverage/documentation-layout …); structural test mới; `authoring/evals/uiux/evidence.test.mjs` + record continuation mới.
- Metrics: `test/e2e/fixtures/communication-economy-scenarios.json` (JIT path), `VALIDATION.md` current cells.
- Mirrors: `.claude/`, `plugin/`, `codex/`, `.cursor/` qua `npm run sync:skills`.

## Acceptance criteria
- AC-001 (body-size) — Bốn body nhỏ hơn baseline; bảng before/after đo bằng lệnh thật.
- AC-002 (angular-gates) — Approval preflight vẫn là section đầu và trước mọi load reference; eligibility, technical-prototype opt-in, frontend architecture preflight, Design input rule, TDD mandatory và finish entrypoint vẫn trong body.
- AC-003 (review-boundary) — Review body giữ read-only, không silent write, không auto-repair, persist chỉ khi user chọn, dimension/purpose selection và Design/UI evidence semantics.
- AC-004 (design-boundary) — Design body giữ existing-design-first, draft ≠ implementation contract, material change về owner, no portal fallback, resolver path, structural vs verified.
- AC-005 (explore-boundary) — Explore body giữ action table/side-effect boundary, authoring guard, redaction; persistence ref chỉ load cho write-approved sau gate; read-only ref không cấp quyền write; không public skill mới.
- AC-006 (canonical-owner) — Clause map old → owner; không còn bản sao độc lập body/owner; check tự động key literal ở owner.
- AC-007 (progressive-load) — Mọi private ref mới có điều kiện load trong body, resolve ở source và mọi distribution, không vòng, không load vô điều kiện.
- AC-008 (inventory-routing) — 23 public skills; name/description/required-actions của bốn skill byte-identical; routing suites đạt.
- AC-009 (test-integrity) — Không assertion nào bị xóa/làm yếu; retarget giữ literal/regex.
- AC-010 (distribution) — sync:skills rồi check:skills, check:text-hygiene, check:executable-references exit 0.
- AC-011 (evidence-continuation) — Record bước 4 không đổi byte, xác minh tại revision lịch sử; continuation mới bind source hiện tại, command thật, từ chối omitted/stale/mutated/fabricated.
- AC-012 (metrics) — report:communication-economy chạy lại; JIT path đúng ref bắt buộc; VALIDATION.md đúng số; 361 fields giữ; không claim token/cost.
- AC-013 (single-schema) — Schema/template chuyển đi chỉ một bản; review_context example khớp review-contract.mjs qua test.

## Test and verification expectations
Focused trước: structural test mới, suites đọc bốn body, evidence continuation; sau đó `npm run test:e2e:repository`, authoring deterministic + `test:e2e:skill-authoring`, `sync:skills`, `check:skills`, `check:text-hygiene`, `check:executable-references`, `report:communication-economy`. Golden/containers/live/browser/provider layers: NOT RUN trừ khi plan chứng minh bị chạm. Failure baseline có sẵn ghi riêng là pre-existing; không báo PASS nếu command không chạy trên trạng thái cuối.

## Risks & mitigations
- **Risk:** mất điều kiện/ngoại lệ khi dedupe -> **Mitigation:** clause map per section, chuyển nguyên văn clause thiếu, test key literal ở owner.
- **Risk:** gate bị đẩy xuống ref đọc sau hành động -> **Mitigation:** gate ở body, ordering test.
- **Risk:** test bị nới -> **Mitigation:** chỉ retarget file nguồn, review diff test riêng.
- **Risk:** evidence bước 4 bị viết lại -> **Mitigation:** byte-identical check, continuation mới.
- **Risk:** metric giảm giả -> **Mitigation:** fixture JIT gồm ref bắt buộc, chỉ báo bytes/lines/load scope.

## Out of scope (deferred)
- Các skill body lớn khác (execute-plan, plan, ship, debug, git, product, spec, brainstorming) — defer tới khi có yêu cầu bước riêng.
- Live-agent A/B đo token/latency — defer tới khi có authorization provider.

## Review decisions
Self-review: 13 AC phủ R-001…R-008; không placeholder; không unresolved blocking assumption; classifier trả not-applicable với bypass docs-only. Spec không cấp quyền plan hay implementation. Task/path/evidence mapping là future planning gaps hợp lệ ở spec stage.

## Machine-readable contract
```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: skill-body-progressive-loading-20260925
  requirement_id: skill-body-progressive-loading-20260925
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
  source_requirement_context: explicit-user-step5-progressive-loading-request-20260925
  acceptance_criteria_count: 13
  manual_criteria_count: 0
  non_goals:
    - Không thay đổi approval, routing, write authority, evidence semantics hay schema field/enum.
    - Không thêm/đổi tên public skill; không tách list/create/update/detail, sdcorejs-uiux,
      sdcorejs-design-review hay dependency-update.
    - Không framework, registry hay state store mới; không sửa domain code repo sản phẩm; không dùng
      sdcorejs-simplify cho Markdown.
    - Không commit, push, PR, publish, cài dependency hay chuyển sang bước 6.
  coverage_approach: tdd
  coverage_approach_status: proposed-for-this-spec-approval
  risks:
    - Mất điều kiện/ngoại lệ khi dedupe body vào reference
    - Gate bị đẩy xuống reference đọc sau hành động
    - Test bị nới khi retarget
    - Evidence step 4 stale hoặc bị viết lại
    - Metric giảm giả do fixture không tính reference bắt buộc
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
  decision_coverage:
    schema_version: 1
    revision: 1
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
        task_refs: []
      - id: R-002
        type: requirement
        statement: Mỗi quy tắc chi tiết được chuyển có đúng một canonical owner (ưu tiên reference đã có); không mất
          điều kiện, ngoại lệ, MUST/MUST NOT hay enum/field name.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: "Progressive loading: mỗi private reference có điều kiện load gắn với action/scope; không index bắt
          đọc toàn bộ khi vào skill; không vòng tham chiếu; tối đa một lớp indirection từ body."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
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
        task_refs: []
      - id: R-005
        type: requirement
        statement: Giữ nguyên public inventory 23 skill, name, description, required-actions, aliases, routing
          semantics và write authority; không thêm public skill.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: Không xóa hoặc nới safety assertion; assertion của nội dung được chuyển chỉ retarget sang canonical
          owner với literal/regex giữ nguyên; thêm structural checks cho reference resolution, load condition
          và gate-before-action.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-007
        type: requirement
        statement: Chỉ sửa canonical source; mirrors/distributions sinh bằng npm run sync:skills và đạt check:skills,
          text hygiene, executable references.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-008
        type: requirement
        statement: "Evidence trung thực: record step 4 giữ immutable và được xác minh như lịch sử; record continuation
          mới bind content hiện tại; communication-economy report và VALIDATION.md phản ánh số đo thật; chỉ
          báo bytes/lines/load scope, không tuyên bố token saving."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
        evidence_refs: []
      - id: INV-002
        type: invariant
        statement: "Không semantic change: approval, routing, write authority, evidence current/stale, schema
          field/enum và artifact lifecycle giữ nguyên."
        protected_refs:
          - R-002
          - R-005
          - AC-006
          - AC-013
        task_refs: []
        evidence_refs: []
      - id: INV-003
        type: invariant
        statement: Safety assertion và lịch sử evidence không bị xóa, nới hay viết lại để refactor pass.
        protected_refs:
          - R-006
          - R-008
          - AC-009
          - AC-011
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
- (approved as drafted)

## Skill provenance
sdcorejs-spec (approved on attempt 1 / 3)
