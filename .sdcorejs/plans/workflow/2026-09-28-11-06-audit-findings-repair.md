---
allowed_paths:
  - .claude/_refs/**
  - .claude/sdcorejs-harness.json
  - .claude/skills/**
  - .cursor/rules/sdcorejs-agent.mdc
  - .cursor/sdcorejs-harness.json
  - .github/sdcorejs-harness.json
  - .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-delivery.md
  - .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-plan.md
  - .sdcorejs/plans/workflow/2026-09-28-11-06-audit-findings-repair.md
  - VALIDATION.md
  - _refs/angular/execution-contract.mjs
  - _refs/angular/write-code/actions.md
  - _refs/design/handoff-authoring.md
  - _refs/harness/communication-economy.mjs
  - _refs/harness/runtime-policy.mjs
  - _refs/nextjs/execution-contract.mjs
  - _refs/orchestration/execution-contract.mjs
  - _refs/orchestration/parallel-protocol.mjs
  - _refs/orchestration/repair-contract.mjs
  - _refs/review/output-contract.md
  - _refs/shared/approved-artifact.mjs
  - _refs/shared/design-handoff.md
  - _refs/shared/design-handoff.mjs
  - _refs/shared/design-verification.mjs
  - _refs/shared/finish-gate.md
  - _refs/shared/finish-gate.mjs
  - _refs/shared/repository-observation.mjs
  - _refs/shared/review-contract.mjs
  - _refs/shared/ship-readiness-contract.mjs
  - _refs/shared/test-ui-evidence.md
  - _refs/shared/ui-review-contract.mjs
  - _refs/shared/ui-review.md
  - _refs/shared/user-choice-prompt.md
  - _refs/simplify/host-runner.mjs
  - _refs/simplify/repository-evidence.mjs
  - _refs/simplify/scope-and-invariants.md
  - _refs/simplify/simplify-contract.mjs
  - _refs/simplify/verification.md
  - authoring/evals/audit-findings-repair.json
  - authoring/evals/uiux/evidence.test.mjs
  - codex/sdcorejs-harness.json
  - codex/skills/**
  - plugin/_refs/**
  - plugin/sdcorejs-harness.json
  - plugin/skills/**
  - skills/shared/workflow/explore.md
  - skills/shared/workflow/review.md
  - skills/shared/workflow/simplify.md
  - skills/tracks/angular/sdcorejs-angular.md
  - skills/tracks/design/sdcorejs-design.md
  - test/e2e/angular-production-contract.test.mjs
  - test/e2e/communication-economy.test.mjs
  - test/e2e/design-handoff-contract.test.mjs
  - test/e2e/explore-topology.test.mjs
  - test/e2e/harness-behavioral-sentinel.test.mjs
  - test/e2e/nextjs-production-contract.test.mjs
  - test/e2e/npm-publication-contract.test.mjs
  - test/e2e/production-readiness-contract.test.mjs
  - test/e2e/repair-contract.test.mjs
  - test/e2e/review-contract.test.mjs
  - test/e2e/ship-readiness-contract.test.mjs
  - test/e2e/simplify-protected-contract.test.mjs
  - test/e2e/simplify-skill-contract.test.mjs
  - test/e2e/support/interaction-finish-fixture.mjs
  - test/e2e/support/simplify-contract-fixture.mjs
  - test/e2e/support/ui-review-fixture.mjs
  - test/e2e/uiux-knowledge.test.mjs
  - test/e2e/uiux-review-regression.test.mjs
  - test/e2e/validation-map-contract.test.mjs
approval_decision_fingerprint: sha256:247492fc7d64321f7b609636b94dbc3c1322a02b54a470aa2a7faaec76f7897b
approval_gate: sdcorejs-plan:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_architecture_hash: sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb
approved_architecture_reference:
  approval_hash: sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb
  artifact_id: architecture-audit-findings-repair-20260928-r1
  repository_id: github.com/sdcorejs/sdcorejs-agent
  repository_relative_path: .sdcorejs/architecture/workflow/2026-09-28-09-24-audit-findings-repair.md
  revision: 70c933c3fc59a98b92c03004de902bc96250fba6
approved_at: 2026-09-28T04:20:59.248Z
approved_by: user
approved_draft_fingerprint: sha256:a57233ce566a5f15940c21d48caef37dd98315e664bdd53ee9a26c97aaed666d
approved_spec_hash: sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892
approved_spec_reference:
  approval_hash: sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892
  artifact_id: spec-audit-findings-repair-20260928-r1
  repository_id: github.com/sdcorejs/sdcorejs-agent
  repository_relative_path: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
  revision: 70c933c3fc59a98b92c03004de902bc96250fba6
artifact_id: plan-audit-findings-repair-20260928-r1
artifact_kind: plan
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: audit-findings-repair-20260928
commit_policy: with-change
contract_id: audit-findings-repair-20260928
dependency_changes:
  approval_required: false
  required: false
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
  - TASK-011
  - TASK-012
  - TASK-013
  - TASK-014
  - TASK-015
  - TASK-016
  - TASK-017
  - TASK-018
  - TASK-019
  - TASK-020
  - TASK-021
  - TASK-022
  - TASK-023
description: Sequential 23-task regression-first plan repairing every confirmed
  step-6 audit finding across observer/simplify/finish, UI review/Design and
  skill structure.
env_changes:
  approval_required: false
  required: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
gitlink_updates_in_scope: false
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
migration_changes:
  approval_required: false
  required: false
name: audit-findings-repair
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb
    artifact_id: architecture-audit-findings-repair-20260928-r1
    artifact_kind: architecture
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 70c933c3fc59a98b92c03004de902bc96250fba6
parent_repository_id: null
phase_count: 5
profile_confidence: high
prohibited_paths:
  - package.json
  - package-lock.json
  - node_modules/**
  - site/**
  - .git/**
  - .env
  - .env.*
  - AGENTS.md
  - CLAUDE.md
  - _refs/shared/system-registry.json
  - .sdcorejs/specs/**
  - .sdcorejs/architecture/**
  - .sdcorejs/conventions/**
  - .sdcorejs/memories/**
  - authoring/evals/interaction-finish-contract.json
  - authoring/evals/skill-body-progressive-loading.json
  - authoring/evals/uiux/*.json
  - authoring/evals/records/**
  - test/e2e/fixtures/communication-economy-baseline.json
  - skills/tracks/ai-agent/**
  - skills/tracks/nestjs/**
  - skills/tracks/nextjs/**
  - skills/tracks/product/**
  - skills/tracks/test/**
  - skills/shared/sdlc/**
  - skills/orchestration/**
  - skills/shared/workflow/debug.md
  - skills/shared/workflow/git.md
  - skills/shared/workflow/ship.md
repository_relative_path: .sdcorejs/plans/workflow/2026-09-28-11-06-audit-findings-repair.md
requirement_id: audit-findings-repair-20260928
schema_version: 1
sourceSpecPath: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
source_architecture: .sdcorejs/architecture/workflow/2026-09-28-09-24-audit-findings-repair.md
source_plan: none
source_revision: 70c933c3fc59a98b92c03004de902bc96250fba6
source_spec: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
task_count: 23
track: workflow
verification_strategy:
  commands_planned:
    - node --test --test-concurrency=1
      test/e2e/production-readiness-contract.test.mjs
      test/e2e/harness-behavioral-sentinel.test.mjs
      test/e2e/simplify-protected-contract.test.mjs
    - node --test --test-concurrency=1 test/e2e/review-contract.test.mjs
      test/e2e/ship-readiness-contract.test.mjs
      test/e2e/repair-contract.test.mjs
      test/e2e/validation-map-contract.test.mjs
      test/e2e/angular-production-contract.test.mjs
      test/e2e/nextjs-production-contract.test.mjs
      test/e2e/design-handoff-contract.test.mjs
      test/e2e/uiux-review-regression.test.mjs test/e2e/uiux-knowledge.test.mjs
    - node --test --test-concurrency=1
      test/e2e/production-readiness-contract.test.mjs
      test/e2e/explore-topology.test.mjs
      test/e2e/simplify-skill-contract.test.mjs
      test/e2e/communication-economy.test.mjs
    - node --test --test-concurrency=1 authoring/evals/uiux/evidence.test.mjs
    - node --test --test-concurrency=1 test/e2e/npm-publication-contract.test.mjs
    - node authoring/evals/run-deterministic.mjs
    - npm run test:e2e:skill-authoring
    - npm run sync:skills
    - npm run check:skills
    - npm run check:text-hygiene
    - npm run check:executable-references
    - npm run test:e2e:repository
    - git diff --check
  package_manager: npm
approval_hash: sha256:v1:e731b03d8f72e530d4f71d665838fc3e51e1f226e6ce07a3f3fbe54e7774a480
---
# Repair các finding của audit bước 6 — Approved Plan

> Snapshot of what the user approved at the `sdcorejs-plan` gate. Do not edit by hand; re-author through `sdcorejs-plan` if the contract changes.

## Approved contract

# Plan — Repair các finding của audit bước 6 — r1

## Scope và authority
- Approved spec: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md (sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892).
- Approved architecture: .sdcorejs/architecture/workflow/2026-09-28-09-24-audit-findings-repair.md (sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb).
- Architecture gate `required`; parent duy nhất của plan là approved architecture.
- Scope: sửa toàn bộ 26 finding đã confirmed của audit bước 6 theo A1–A7, B1–B5 và C1–C2 của architecture. Không nới contract; mục NEEDS-VERIFICATION nằm ngoài scope.
- Plan chưa được duyệt, nên chưa sửa source hay test.

## Quyết định mới ghi trong decision coverage (revision 2)
- **D-007:** chuyển sang `approved` (đã chốt khi duyệt spec).
- **D-008:** chuyển sang `superseded`.
- **D-009** (`explicit-user`): diễn giải AC-014 theo lựa chọn 1: bảo đảm cấu trúc cộng rule đóng theo lexicon; câu né lexicon không bao giờ được tính là evidence.
- **D-010** (`approved-architecture`, supersede D-008):
  - Một contract, thứ tự A → B → C; loader là unit đầu của A.
  - TDD regression-first.
  - Mang validation boundary `none` cho validation map.
- Approved spec và architecture không bị sửa.

## Phương án triển khai
- **Ownership:** checker goal-backward yêu cầu mỗi path chỉ có một task owner, nên task chia theo file.
  - Phase 1 viết toàn bộ regression RED trong các file test hiện có (`case-repair-*`; không sửa package.json).
  - Implementation đi theo A → B → C, mỗi workstream kết thúc bằng một checkpoint focused.
- **TDD regression-first:** chạy và lưu RED của mọi finding trên HEAD 70c933c trước khi sửa source. PASS được chứng minh trên nội dung cuối. Mỗi finding có một negative control hoặc mutation chứng minh test fail khi gỡ fix.
- **VERIFY-THEN-EDIT:** chỉ sửa khi kiểm chứng thấy cần. Ví dụ: consumer lọc mất runtime mới; entrypoint còn đọc shape cũ; assertion đọc prose đã đổi. Literal/regex giữ nguyên, không xóa, skip hay nới assertion.
- **Evidence:**
  - Record bước 5 được giữ nguyên byte và chuyển sang kiểm lịch sử tại 70c933c.
  - Record mới `authoring/evals/audit-findings-repair.json` ràng nội dung hiện tại và lệnh chạy thật.
  - VALIDATION.md chỉ thêm section mới, trong đó có hiệu chỉnh AC-013 của bước 5.
- **Phần A2 phía UI** (UI run_command đăng ký ledger) nằm trong file `ui-review-contract.mjs`, nên được làm ở TASK-015 của workstream B. Test của nó ở TASK-004.

## Execution policy và finish choices
- 23 task tuần tự trong một Git root. Parent là writer và integration owner; không delegated hay parallel write.
- Simplify: Skip, vì mọi path đổi nằm trong `_refs`, `skills` hoặc test — protected path của simplify.
- Review: read-only trên diff đã duyệt; không auto-repair.
- Không user/technical guide, memory hay preference mới.
- Không commit, push hay PR.

## Preflight và path boundaries
- **Trước edit:** chạy `git status --short`, `git diff --stat`, `git diff --cached --stat`, `git ls-files --others --exclude-standard`, `git branch --show-current`, `git rev-parse HEAD`.
- Verify graph spec → architecture → plan, authoring-root guard, allowed/prohibited paths.
- Dirty file hợp lệ lúc này chỉ gồm spec, architecture và plan artifacts của change này. Không reset, restore hay stash.
- Path phát sinh ngoài danh sách cần delta authority trước khi ghi.
- **Không sửa:** package.json/lockfile, system-registry, AGENTS.md/CLAUDE.md, skill ngoài scope, approved snapshot và evidence record cũ.

## Tasks (23; 62 path + mirror sinh bằng script)

### Phase 1 — RED regression (TASK-001..006)

#### 1. TASK-001 — RED: finish, observer, loader và cấu trúc
Thêm case-repair-* vào suite hiện có (không đổi package.json): observer trên repo này và fixture ignored/symlink/junction/nested; volatile/ledger; symlink trong scope; finish hội tụ theo phase (kể cả worker stage A/B và cache volatile); pending simplify và payload bỏ context; đường runner qua beginSimplify/recordSimplify; loader trên mọi snapshot bước 1–5 và negative bytes; đồ thị load Angular/explore/review; parity review_context. Chạy và lưu RED trên HEAD 70c933c trước mọi sửa source.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: none; evidence: EVIDENCE-001 (AC-001, AC-002, AC-003, AC-004, AC-005, AC-011, AC-017, AC-018, AC-019, AC-020, AC-021, INV-001, INV-002, INV-003, INV-004).
- EDIT test/e2e/production-readiness-contract.test.mjs
- EDIT test/e2e/support/interaction-finish-fixture.mjs

#### 2. TASK-002 — RED: lựa chọn cấp authority
Case: finish:policy một option (qua decision object và qua value policy hash) không auto-select, không delegated; resolveAction không trả lại native surface đã lỗi; auto-select sequential cũ giữ nguyên. Lưu RED.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-001; evidence: EVIDENCE-002 (AC-006, INV-001).
- EDIT test/e2e/harness-behavioral-sentinel.test.mjs

#### 3. TASK-003 — RED: simplify evidence và host runner
Case: session trên repo có output ignored/junction; Analyze không mang verified; diff check theo pass kể cả CRLF; rollback theo scope với concurrent change; hard link bị từ chối; host runner chạy trọn pass trên repo tạm thật; consumer khác process tự tính lại; request mang authority, plan do request chọn, chain reset/thiếu receipt, receipt sửa/giả đều bị từ chối. Lưu RED.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-002; evidence: EVIDENCE-003 (AC-001, AC-002, AC-003, AC-007, AC-008, AC-009, AC-010, AC-011, INV-001, INV-003).
- EDIT test/e2e/simplify-protected-contract.test.mjs
- EDIT test/e2e/support/simplify-contract-fixture.mjs

#### 4. TASK-004 — RED: UI review
Case: review thường NOT APPLICABLE; receipt FAIL từ lần chạy hoàn tất, output cũ và crash là gap; rule đóng claim source-only (phản ví dụ đã biết bị từ chối, source fact có locator hợp lệ); gate ngoài allowlist; sửa ba test UR-5 dùng payload đúng cấu trúc và có mutation gỡ guard; UI run_command đăng ký ledger volatile. Lưu RED.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-003; evidence: EVIDENCE-004 (AC-002, AC-012, AC-013, AC-014, INV-002, INV-003).
- EDIT test/e2e/review-contract.test.mjs
- EDIT test/e2e/support/ui-review-fixture.mjs

#### 5. TASK-005 — RED: năm UI consumer
Case qua caller thật: review_context thường cho NOT APPLICABLE ở ship, validation-map, repair, Angular, Next.js; payload UI hợp lệ giữ hành vi; ship chặn coverage FAIL như defect; repair nhận FAIL làm input. Lưu RED.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-004; evidence: EVIDENCE-005 (AC-012, AC-013, INV-002, INV-003).
- EDIT test/e2e/ship-readiness-contract.test.mjs
- EDIT test/e2e/repair-contract.test.mjs
- EDIT test/e2e/validation-map-contract.test.mjs
- EDIT test/e2e/angular-production-contract.test.mjs
- EDIT test/e2e/nextjs-production-contract.test.mjs

#### 6. TASK-006 — RED: Design handoff
Case: no-baseline hợp lệ khi requirements khai none, approval_ref khớp spec, mapping không confirmed; thiếu một điều kiện thì chặn; dự án không khai none vẫn phải trích source; tài liệu html/svg và giá trị trả về của resolver khớp helper. Lưu RED.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-005; evidence: EVIDENCE-006 (AC-015, AC-016, INV-001, INV-002).
- EDIT test/e2e/design-handoff-contract.test.mjs

### Phase 2 — Workstream A: loader, observer, simplify, finish, interaction (TASK-007..014)

#### 7. TASK-007 — A: loader approved artifact (unit đầu, D-010)
readApprovedArtifactFile/parseApprovedArtifactText chỉ Node built-in: parser frontmatter hạn chế fail-closed, không bỏ BOM, một dòng trống phân cách chỉ cho approved_at trước 2026-09-27T00:00:00Z, báo biến thể khớp, ràng repository_relative_path.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006; evidence: EVIDENCE-007 (AC-021, INV-004).
- EDIT _refs/shared/approved-artifact.mjs

#### 8. TASK-008 — A: observer hai lớp và host windows
Hai lớp nội dung/metadata, nested worktree metadata, cap metadata 1 000 000; kiểm symlink tường minh; stable_fingerprint; ledger volatile theo (root, change) và API đăng ký cửa sổ; helper write-target link count; beginSimplify/recordSimplify(token, receipt|null) với simplify_verifier tiêm; readRepositorySimplify.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-007; evidence: EVIDENCE-008 (AC-001, AC-002, AC-003, AC-011, INV-001, INV-002).
- EDIT _refs/shared/repository-observation.mjs

#### 9. TASK-009 — A: simplify evidence
Session dùng stable_fingerprint và ledger; truy vấn registry chỉ đọc theo (root, change); Analyze thay status chưa chạy; diff check theo dòng pass thêm với quy tắc whitespace/eol của repo; rollback theo scope và concurrent_changes; từ chối link count > 1; revalidateSimplifyHostReceipt (anchor head/host-snapshot, chain, cap composite).
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-008; evidence: EVIDENCE-009 (AC-002, AC-005, AC-007, AC-008, AC-009, AC-010, AC-011, INV-001, INV-003).
- EDIT _refs/simplify/repository-evidence.mjs

#### 10. TASK-010 — A: simplify host runner
CLI Node built-in: --authority (host cấp) tách --request; plan qua loader với hash host cấp; simplify-host-policy; oracle closure tracked cho phép node:; anchor và chain; tám bước trong một process; receipt simplify-host-receipt:v1 ra stdout, không ghi Git object; direct fix chỉ Analyze.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-009; evidence: EVIDENCE-010 (AC-011, INV-001, INV-003).
- CREATE _refs/simplify/host-runner.mjs

#### 11. TASK-011 — A: simplify contract và consumer
simplify_context host_kind session|runner (anchor, host_receipt_digest); evaluateSimplifyConsumer nhận { observation, proof } hoặc { host_receipt, expected_plan }; analysis_current tách verification_current; cập nhật danh sách field handoff. Ba consumer chỉ sửa nếu chúng lọc mất runtime mới.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-010; evidence: EVIDENCE-011 (AC-007, AC-011, INV-001, INV-003).
- EDIT _refs/simplify/simplify-contract.mjs
- EDIT _refs/harness/communication-economy.mjs
- VERIFY-THEN-EDIT _refs/shared/review-contract.mjs
- VERIFY-THEN-EDIT _refs/shared/ship-readiness-contract.mjs
- VERIFY-THEN-EDIT _refs/orchestration/repair-contract.mjs

#### 12. TASK-012 — A: finish resolver
phase là khóa receipt, bỏ evidence_phase; bảng owner tĩnh cộng owner hook, phase không owner thì chặn; intent produce|refresh; trạng thái simplify từ host (registry, dispatch record), simplify_source/simplify_outcome; completeExecution trả runner: host-runner khi không có session. Entry point khác chỉ sửa nếu đọc shape cũ.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-011; evidence: EVIDENCE-012 (AC-004, AC-005, AC-011, INV-002, INV-003).
- EDIT _refs/shared/finish-gate.mjs
- EDIT _refs/orchestration/execution-contract.mjs
- VERIFY-THEN-EDIT _refs/orchestration/parallel-protocol.mjs
- VERIFY-THEN-EDIT _refs/angular/execution-contract.mjs
- VERIFY-THEN-EDIT _refs/nextjs/execution-contract.mjs

#### 13. TASK-013 — A: lựa chọn cấp authority
selectInteraction/normalizeChoiceResponse đọc gate từ decision; value policy hash sha256 và gate finish:policy là cấp authority; resolveAction nhận failed_surfaces.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-012; evidence: EVIDENCE-013 (AC-006, INV-001).
- EDIT _refs/harness/runtime-policy.mjs

#### 14. TASK-014 — A: tài liệu và checkpoint A
Tài liệu hóa phase/intent/owner, volatile_paths và ledger, runner/beginSimplify/recordSimplify, authority gates. Checkpoint A: chạy focused suite của TASK-001..003 cho case-repair-* workstream A và suite hiện có của các file đã sửa.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-013; evidence: EVIDENCE-014 (AC-004, AC-006, AC-011, INV-002).
- EDIT _refs/shared/finish-gate.md
- EDIT _refs/simplify/verification.md
- EDIT skills/shared/workflow/simplify.md
- EDIT _refs/shared/user-choice-prompt.md
- VERIFY-THEN-EDIT _refs/simplify/scope-and-invariants.md

### Phase 3 — Workstream B: UI review và Design (TASK-015..017)

#### 15. TASK-015 — B: UI review contract
Applicability theo obligation hoặc UI context; receipt PASS/FAIL cho lần chạy hoàn tất (interrupted/timed_out, output mới theo metadata); coverage FAIL và failures; bảng chấp nhận theo phase; rule đóng B3 theo D-009; hằng gate canonical; UI run_command đăng ký ledger và dùng volatile của plan.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-014; evidence: EVIDENCE-015 (AC-002, AC-012, AC-013, AC-014, INV-002, INV-003).
- EDIT _refs/shared/ui-review-contract.mjs

#### 16. TASK-016 — B: tài liệu UI
Tài liệu hóa applicability, receipt FAIL, bảng chấp nhận, rule đóng claim và diễn giải AC-014 (D-009), gate canonical, schema kết quả run_command.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-015; evidence: EVIDENCE-016 (AC-013, AC-014).
- EDIT _refs/shared/ui-review.md
- EDIT _refs/shared/test-ui-evidence.md
- VERIFY-THEN-EDIT _refs/review/output-contract.md

#### 17. TASK-017 — B: Design no-baseline và checkpoint B
design_requirements.design_baseline và design_system_reuse.no_baseline; verifier theo ba điều kiện; tài liệu html/svg và resolver trả path ledger. Checkpoint B: focused suite của TASK-004..006.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-016; evidence: EVIDENCE-017 (AC-015, AC-016, INV-001, INV-002).
- EDIT _refs/shared/design-verification.mjs
- EDIT _refs/shared/design-handoff.mjs
- EDIT _refs/shared/design-handoff.md
- EDIT _refs/design/handoff-authoring.md
- VERIFY-THEN-EDIT skills/tracks/design/sdcorejs-design.md

### Phase 4 — Workstream C: cấu trúc skill và retarget (TASK-018..020)

#### 18. TASK-018 — C: Angular styling
Body nạp styling.md cho mọi action sinh mã; ví dụ actions.md dùng utility class theo styling.md thay inline style.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-017; evidence: EVIDENCE-018 (AC-017, INV-002).
- EDIT skills/tracks/angular/sdcorejs-angular.md
- EDIT _refs/angular/write-code/actions.md

#### 19. TASK-019 — C: explore và review
conventions-read và summary-refresh nạp scanning/command discipline; review.md nêu tên ref thay vì below/above.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-018; evidence: EVIDENCE-019 (AC-018).
- EDIT skills/shared/workflow/explore.md
- EDIT skills/shared/workflow/review.md

#### 20. TASK-020 — C: retarget và checkpoint C
Chỉ với assertion đọc prose đã đổi: đổi nguồn đọc sang owner mới, literal giữ nguyên; không xóa, skip, only hay matcher yếu hơn. Checkpoint C: focused suite TASK-001 phần cấu trúc và các file retarget.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-019; evidence: EVIDENCE-020 (AC-019, AC-022, INV-003).
- VERIFY-THEN-EDIT test/e2e/simplify-skill-contract.test.mjs
- VERIFY-THEN-EDIT test/e2e/explore-topology.test.mjs
- VERIFY-THEN-EDIT test/e2e/communication-economy.test.mjs
- VERIFY-THEN-EDIT test/e2e/uiux-review-regression.test.mjs
- VERIFY-THEN-EDIT test/e2e/uiux-knowledge.test.mjs

### Phase 5 — Mirror, evidence continuation, validation và delivery (TASK-021..023)

#### 21. TASK-021 — Mirror
npm run sync:skills rồi check:skills, check:text-hygiene, check:executable-references. Target generated chỉ sinh bằng script.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-020; evidence: EVIDENCE-021 (AC-022).
- EDIT .cursor/rules/sdcorejs-agent.mdc
- EDIT .claude/sdcorejs-harness.json
- EDIT plugin/sdcorejs-harness.json
- EDIT codex/sdcorejs-harness.json
- EDIT .cursor/sdcorejs-harness.json
- EDIT .github/sdcorejs-harness.json
- RUN npm run sync:skills (generated: .claude/skills/**, .claude/_refs/**, plugin/skills/**, plugin/_refs/**, codex/skills/**)

#### 22. TASK-022 — Evidence continuation
Record bước 5 chuyển sang kiểm lịch sử tại 70c933c (không sửa file record); dùng loader canonical thay readApproved; record mới ràng source manifest hiện tại, lệnh focused/UI chạy thật và transcript; mutation omitted/stale/mutated/fabricated; thêm record vào allowlist evaluation evidence.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-021; evidence: EVIDENCE-022 (AC-021, AC-022, INV-003, INV-004).
- CREATE authoring/evals/audit-findings-repair.json
- EDIT authoring/evals/uiux/evidence.test.mjs
- EDIT test/e2e/npm-publication-contract.test.mjs

#### 23. TASK-023 — Validation, delivery và gate cuối
Section VALIDATION mới (RED/PASS từng finding, số assertion, lệnh và kết quả, hiệu chỉnh AC-013 bước 5); delivery doc. Chạy lại kiểm tra bị ảnh hưởng, verify-before-done và branch-ready read-only. Không Git write.
Owner: github.com/sdcorejs/sdcorejs-agent; depends: TASK-022; evidence: EVIDENCE-023 (AC-020, AC-022, INV-001, INV-002, INV-003, INV-004).
- CREATE .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-delivery.md
- EDIT VALIDATION.md

## Acceptance mapping
- AC-001 -> TASK-001, TASK-003, TASK-008 (case-repair-observer-real-repo)
- AC-002 -> TASK-001, TASK-003, TASK-004, TASK-008, TASK-009, TASK-015 (case-repair-volatile-paths)
- AC-003 -> TASK-001, TASK-003, TASK-008 (case-repair-symlink-scope)
- AC-004 -> TASK-001, TASK-012, TASK-014 (case-repair-finish-convergence)
- AC-005 -> TASK-001, TASK-009, TASK-012 (case-repair-simplify-pending)
- AC-006 -> TASK-002, TASK-013, TASK-014 (case-repair-policy-ask-native)
- AC-007 -> TASK-003, TASK-009, TASK-011 (case-repair-analyze-honest)
- AC-008 -> TASK-003, TASK-009 (case-repair-diff-check-scope)
- AC-009 -> TASK-003, TASK-009 (case-repair-scoped-rollback)
- AC-010 -> TASK-003, TASK-009 (case-repair-hardlink-target)
- AC-011 -> TASK-001, TASK-003, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-014 (case-repair-host-runner)
- AC-012 -> TASK-004, TASK-005, TASK-015 (case-repair-ordinary-review)
- AC-013 -> TASK-004, TASK-005, TASK-015, TASK-016 (case-repair-failing-receipt)
- AC-014 -> TASK-004, TASK-015, TASK-016 (case-repair-ui-claims-gates-tests)
- AC-015 -> TASK-006, TASK-017 (case-repair-greenfield-design)
- AC-016 -> TASK-006, TASK-017 (case-repair-design-docs)
- AC-017 -> TASK-001, TASK-018 (case-repair-styling-reachable)
- AC-018 -> TASK-001, TASK-019 (case-repair-explore-scan-pointers)
- AC-019 -> TASK-001, TASK-020 (case-repair-placement-tests)
- AC-020 -> TASK-001, TASK-023 (case-repair-schema-parity)
- AC-021 -> TASK-001, TASK-007, TASK-022 (case-repair-artifact-loader)
- AC-022 -> TASK-020, TASK-021, TASK-022, TASK-023 (case-repair-evidence-continuation)

## Verification
- node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs test/e2e/harness-behavioral-sentinel.test.mjs test/e2e/simplify-protected-contract.test.mjs
- node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/design-handoff-contract.test.mjs test/e2e/uiux-review-regression.test.mjs test/e2e/uiux-knowledge.test.mjs
- node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs test/e2e/explore-topology.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/communication-economy.test.mjs
- node --test --test-concurrency=1 authoring/evals/uiux/evidence.test.mjs
- node --test --test-concurrency=1 test/e2e/npm-publication-contract.test.mjs
- node authoring/evals/run-deterministic.mjs
- npm run test:e2e:skill-authoring
- npm run sync:skills
- npm run check:skills
- npm run check:text-hygiene
- npm run check:executable-references
- npm run test:e2e:repository
- git diff --check

- NOT RUN theo scope: golden project Angular/NestJS/Next.js và container; live agent/browser/provider.
- Mọi lệnh chạy bằng Node v22.22.3 (fnm), vì Node hệ thống v22.14.0 thấp hơn engines.
- Focused sau mỗi workstream; broad suite, hygiene, mirror và evidence trên nội dung cuối.
- Lỗi git ETIMEDOUT do máy quá tải phải chạy lại riêng và báo nguyên văn.
- PASS chỉ nghĩa là lệnh đã chạy trên trạng thái cuối, không chứng minh tương đương ngữ nghĩa.

## Finish policy
```finish-policy
{"schema_version":1,"scope_fingerprint":"sha256:8c05e5d336038c9c49bb3f1ce8a584dabad688de38fdeedb45e19a9251bf3e39","test_strategy":"regression-first","required_phases":["baseline","review","verify","branch-ready"],"decisions":{"simplify":"skip","review":"review-only"},"hooks":[]}
```

## UI review requirements
Không áp dụng: change sửa contract, test và tài liệu của skill pack, không sửa UI của sản phẩm. Không có `ui-review-requirements` hay `design_requirements`.

## Self-review trước approval
- `validateArchitectureDraftPlanHandoff` (required, graph spec → architecture): PASS.
- Decision coverage, strict ở stage plan (revision 2): PASS.
- Goal-backward vòng 1 (`sdcorejs-plan:goal-backward:v1`): PASS, 0 blocker.
- Repository plan (một owner, một Git root cho mỗi step mutable): PASS.
- Validation map: kiểm cấu trúc PASS. Blocker duy nhất còn lại là `DECISION_COVERAGE_APPROVAL_INVALID`, vì decision coverage chưa được user duyệt. Sau approval sẽ seal bằng `approveDecisionCoverage` rồi chạy lại `validateValidationMap` trước execute-plan.
- CREATE path chưa tồn tại, EDIT path đã tồn tại (generator kiểm tra).
- Không claim kết quả implementation nào ở bước plan.

## Typed plan context
```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: audit-findings-repair-20260928
  requirement_id: audit-findings-repair-20260928
  approved_spec_path: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
  approved_spec_hash: sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-audit-findings-repair-20260928-r1
    artifact_kind: spec
    revision: 70c933c3fc59a98b92c03004de902bc96250fba6
    approval_hash: sha256:v1:800dec9e8d8e4e987c629356d0361764230e4a36ee6c0ac7a693bedc2b915892
    repository_relative_path: .sdcorejs/specs/workflow/2026-09-28-00-22-audit-findings-repair.md
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
    approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-28-09-24-audit-findings-repair.md
    approved_architecture_hash: sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb
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
        no-baseline của Design handoff, trust boundary của observer/simplify host và quyền sở hữu evidence
        giữa producer và consumer."
    invariants:
      - id: INV-001
        statement: "Authority vẫn fail-closed: không có quyền ghi khi thiếu approved scope; mọi negative path đã có từ
          bước 1–4 vẫn bị chặn."
        scope: observer, finish choice/policy, simplify write boundary và host runner
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: "Sửa finding mà không nới contract: fail-closed, positive path và evidence phải cùng đúng."
        verification_method: Negative regression cho volatile write trong cửa sổ hook/apply, symlink trong scope kể cả
          thư mục cha, auto-select/delegated finish:policy, native surface đã lỗi, rollback chạm path của
          pass, hard link, request mang field authority, plan do request chọn, chain bị reset hoặc thiếu
          receipt, receipt sửa/giả, payload bỏ simplify context; suite negative hiện có giữ nguyên.
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
          Analyze tách Apply; receipt FAIL; rule đóng claim source-only; đếm assertion không giảm; parity
          test.
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
          cho mỗi change (finish-policy hoặc direct policy); ledger volatile cấp host theo (root, change) mà
          mọi cửa sổ lệnh đăng ký; kiểm symlink tường minh cho scope/hook/command/UI paths; drift volatile
          ngoài cửa sổ lệnh bị chặn; runtime.beginSimplify (token dispatch) và recordSimplify(token,
          receipt|null) với option simplify_verifier, receipt phase kind simplify; readRepositorySimplify cho
          consumer cùng flow.
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
          simplify-host-receipt:v1; revalidateSimplifyHostReceipt; runtime { host_receipt, expected_plan }
          hoặc { observation, proof } cho evaluateSimplifyConsumer; simplify_context host_kind session|runner
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
          chỉ metadata, không đi theo link; scope/hook paths và thư mục cha không được là symlink; volatile
          chỉ đổi được trong cửa sổ lệnh đã đăng ký với ledger cấp host và không bao giờ là write target;
          drift ngoài cửa sổ bị chặn."
        invariant_refs:
          - INV-001
          - INV-002
      - id: STB-002
        statement: "Host runner: authority do host điều phối cấp, tách khỏi request nhưng không được xác thực, nên
          chấp nhận chỉ dựa trên consumer tự tính lại; plan hash phải bằng hash host cấp; oracle closure
          tracked không đổi (cho phép node:); before-state chỉ từ snapshot của host hoặc HEAD, không từ
          receipt; chain liên tục từ anchor; recordSimplify lấy step/scope/ownership từ nguồn của runtime;
          receipt không phải authority."
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
          trong scope, policy auto-select/delegated, surface đã lỗi, rollback chạm pass path, hard link,
          request mang authority, plan do request chọn, chain reset/thiếu receipt, receipt sửa/giả."
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
  approved_architecture_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: architecture-audit-findings-repair-20260928-r1
    artifact_kind: architecture
    revision: 70c933c3fc59a98b92c03004de902bc96250fba6
    approval_hash: sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb
    repository_relative_path: .sdcorejs/architecture/workflow/2026-09-28-09-24-audit-findings-repair.md
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-28-09-24-audit-findings-repair.md
  approved_architecture_hash: sha256:v1:ad6cc597574ba9d60736ea9c954cfd980290805f0b69bdc4d405cde498a4e3eb
  approved_plan_path: null
  approved_plan_hash: null
  supersedes: null
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
    - TASK-011
    - TASK-012
    - TASK-013
    - TASK-014
    - TASK-015
    - TASK-016
    - TASK-017
    - TASK-018
    - TASK-019
    - TASK-020
    - TASK-021
    - TASK-022
    - TASK-023
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 23
  phase_count: 5
  coverage_approach: TDD (regression-first)
  decision_coverage: &a1
    schema_version: 1
    revision: 2
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
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
          - TASK-015
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
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-009
          - TASK-012
          - TASK-013
          - TASK-014
      - id: R-003
        type: requirement
        statement: "Evidence simplify trung thực và giữ thay đổi của user (S-2, S-3, S-5, S-6): Analyze không cấp
          status verified cho check chưa chạy; diff check chỉ xét path của pass so với trạng thái lúc
          preflight; rollback theo scope và báo edit đồng thời; từ chối write target có nhiều hard link."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-003
          - TASK-009
          - TASK-011
      - id: R-004
        type: requirement
        statement: "Simplify có trusted host thực tế (S-7): script host canonical chạy trọn một pass trong một
          process; consumer ở process khác tự tính lại diff/scope/protected từ Git và nội dung hiện tại cùng
          verification mới; receipt chỉ là chỉ mục, receipt giả không qua được."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
          - TASK-014
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
        task_refs:
          - TASK-004
          - TASK-005
          - TASK-015
          - TASK-016
      - id: R-006
        type: requirement
        statement: "Design handoff hỗ trợ greenfield và tài liệu khớp schema (DH-1..DH-3): bản ghi no-baseline gắn
          approval cho phép evidence_refs rỗng khi mọi mapping không confirmed; tài liệu nêu đúng định dạng
          editable của schema 2 và giá trị trả về của resolver."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-006
          - TASK-017
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
        task_refs:
          - TASK-001
          - TASK-018
          - TASK-019
          - TASK-020
          - TASK-023
      - id: R-008
        type: requirement
        statement: "Loader approved artifact canonical (G-1): một hàm đọc file snapshot chuẩn dùng chung, verify được
          mọi snapshot bước 1–5 kể cả dòng trống phân cách của bước 1, không sửa snapshot; bytes bị sửa vẫn
          fail."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-007
          - TASK-022
      - id: R-009
        type: requirement
        statement: "Governance: mỗi finding có regression RED trước và PASS sau; không assertion nào bị xóa hoặc nới;
          23 public skill; mirror sinh bằng script; không dependency mới; evidence tách tầng
          deterministic/integration/live; không commit/push khi chưa được yêu cầu."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-020
          - TASK-021
          - TASK-022
          - TASK-023
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
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-008
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
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-008
          - TASK-009
          - TASK-015
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-008
          - EVIDENCE-009
          - EVIDENCE-015
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
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-008
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
        task_refs:
          - TASK-001
          - TASK-012
          - TASK-014
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-012
          - EVIDENCE-014
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
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-012
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-009
          - EVIDENCE-012
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
        task_refs:
          - TASK-002
          - TASK-013
          - TASK-014
        evidence_refs:
          - EVIDENCE-002
          - EVIDENCE-013
          - EVIDENCE-014
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
        task_refs:
          - TASK-003
          - TASK-009
          - TASK-011
        evidence_refs:
          - EVIDENCE-003
          - EVIDENCE-009
          - EVIDENCE-011
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
        task_refs:
          - TASK-003
          - TASK-009
        evidence_refs:
          - EVIDENCE-003
          - EVIDENCE-009
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
        task_refs:
          - TASK-003
          - TASK-009
        evidence_refs:
          - EVIDENCE-003
          - EVIDENCE-009
      - id: AC-010
        type: acceptance-criterion
        statement: Write target có link count lớn hơn 1 bị từ chối trước khi ghi.
        behavior: hardlink-target
        expected_result: Write target có link count lớn hơn 1 bị từ chối trước khi ghi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-003
          - TASK-009
        evidence_refs:
          - EVIDENCE-003
          - EVIDENCE-009
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
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
          - TASK-014
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-008
          - EVIDENCE-009
          - EVIDENCE-010
          - EVIDENCE-011
          - EVIDENCE-012
          - EVIDENCE-014
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
        task_refs:
          - TASK-004
          - TASK-005
          - TASK-015
        evidence_refs:
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-015
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
        task_refs:
          - TASK-004
          - TASK-005
          - TASK-015
          - TASK-016
        evidence_refs:
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-015
          - EVIDENCE-016
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
        task_refs:
          - TASK-004
          - TASK-015
          - TASK-016
        evidence_refs:
          - EVIDENCE-004
          - EVIDENCE-015
          - EVIDENCE-016
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
        task_refs:
          - TASK-006
          - TASK-017
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-017
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
        task_refs:
          - TASK-006
          - TASK-017
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-017
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
        task_refs:
          - TASK-001
          - TASK-018
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-018
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
        task_refs:
          - TASK-001
          - TASK-019
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-019
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
        task_refs:
          - TASK-001
          - TASK-020
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-020
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
        task_refs:
          - TASK-001
          - TASK-023
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-023
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
        task_refs:
          - TASK-001
          - TASK-007
          - TASK-022
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-007
          - EVIDENCE-022
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
        task_refs:
          - TASK-020
          - TASK-021
          - TASK-022
          - TASK-023
        evidence_refs:
          - EVIDENCE-020
          - EVIDENCE-021
          - EVIDENCE-022
          - EVIDENCE-023
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
        task_refs:
          - TASK-008
          - TASK-009
          - TASK-015
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
        task_refs:
          - TASK-015
          - TASK-016
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
        task_refs:
          - TASK-017
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
        task_refs:
          - TASK-009
          - TASK-010
          - TASK-011
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
        task_refs:
          - TASK-009
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
        task_refs: &a2
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
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
        status: approved
        blocking: true
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
        task_refs:
          - TASK-001
          - TASK-007
          - TASK-012
          - TASK-013
          - TASK-015
          - TASK-017
      - id: D-008
        type: decision
        statement: "Một contract, ba workstream tuần tự: A observer/simplify/finish, B UI review và Design, C
          structure/test/loader; TDD regression-first"
        question: Cách giao?
        selected_value: "Một contract, ba workstream tuần tự: A observer/simplify/finish, B UI review và Design, C
          structure/test/loader; TDD regression-first"
        source: approved-spec
        status: superseded
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
        task_refs:
          - TASK-007
      - id: D-009
        type: decision
        statement: Bảo đảm cấu trúc (prose không bao giờ là evidence; trạng thái runtime chỉ từ receipt) cộng rule
          đóng theo cấu trúc câu và lexicon canonical là lớp chặn bắt buộc; câu né toàn bộ lexicon không bị
          rule bắt nhưng không bao giờ được tính là evidence; không sửa approved spec.
        question: Diễn giải AC-014 (claim runtime trong finding source-only)?
        selected_value: Bảo đảm cấu trúc + rule đóng theo lexicon; ghi thành decision trong plan
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: User chọn phương án 1 cho BLOCKER 4 của review architecture ngày 2026-09-28.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-014
        task_refs:
          - TASK-004
          - TASK-015
          - TASK-016
      - id: D-010
        type: decision
        statement: Một contract, ba workstream tuần tự A → B → C; loader (G-1) là unit đầu của workstream A vì host
          runner phụ thuộc; TDD regression-first; scope và coverage không đổi.
        question: Cách giao sau refinement của architecture?
        selected_value: Một contract, A (loader trước) → B → C, TDD regression-first
        source: approved-architecture
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Refinement của D-008 được nêu rõ tại approval gate architecture và user duyệt bằng reply 1.
        supersedes: D-008
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-008
          - R-009
          - AC-021
          - AC-022
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
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - AC-018
          - AC-019
          - AC-020
          - INV-001
          - INV-002
          - INV-003
          - INV-004
        task_refs:
          - TASK-007
          - TASK-021
          - TASK-022
          - TASK-023
        validation_boundary:
          kind: none
          source_refs: &a3
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
            - R-007
            - R-008
            - R-009
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
            - AC-014
            - AC-015
            - AC-016
            - AC-017
            - AC-018
            - AC-019
            - AC-020
            - AC-021
            - AC-022
            - INV-001
            - INV-002
            - INV-003
            - INV-004
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
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-006
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-013
          - TASK-017
          - TASK-023
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-006
          - EVIDENCE-008
          - EVIDENCE-009
          - EVIDENCE-010
          - EVIDENCE-011
          - EVIDENCE-013
          - EVIDENCE-017
          - EVIDENCE-023
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
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-008
          - TASK-012
          - TASK-014
          - TASK-015
          - TASK-017
          - TASK-018
          - TASK-023
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-008
          - EVIDENCE-012
          - EVIDENCE-014
          - EVIDENCE-015
          - EVIDENCE-017
          - EVIDENCE-018
          - EVIDENCE-023
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
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
          - TASK-015
          - TASK-020
          - TASK-022
          - TASK-023
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-009
          - EVIDENCE-010
          - EVIDENCE-011
          - EVIDENCE-012
          - EVIDENCE-015
          - EVIDENCE-020
          - EVIDENCE-022
          - EVIDENCE-023
      - id: INV-004
        type: invariant
        statement: "Lịch sử bất biến: approved snapshot và evidence record cũ không bị sửa."
        protected_refs:
          - R-008
          - R-009
          - AC-021
        task_refs:
          - TASK-001
          - TASK-007
          - TASK-022
          - TASK-023
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-007
          - EVIDENCE-022
          - EVIDENCE-023
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
          - id: D-009
            type: decision
          - id: D-010
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
        statement: "Workstream A: observer, finish và simplify chạy được trên repo thật, fail-closed và trung thực;
          loader canonical đứng đầu."
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
          - TASK-013
          - TASK-014
      - id: G-002
        statement: "Workstream B: UI review phân biệt đúng các trạng thái; Design hỗ trợ greenfield có approval."
        task_refs:
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-015
          - TASK-016
          - TASK-017
      - id: G-003
        statement: "Workstream C: cấu trúc skill không mất đường load; test kiểm vị trí owner."
        task_refs:
          - TASK-001
          - TASK-018
          - TASK-019
          - TASK-020
      - id: G-004
        statement: "Governance: mirror, evidence continuation, validation và delivery trung thực."
        task_refs:
          - TASK-021
          - TASK-022
          - TASK-023
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/production-readiness-contract.test.mjs
          - test/e2e/support/interaction-finish-fixture.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-011
              - AC-017
              - AC-018
              - AC-019
              - AC-020
              - AC-021
              - INV-001
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-004
          - R-007
          - R-008
          - R-009
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - test/e2e/harness-behavioral-sentinel.test.mjs
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - AC-006
              - INV-001
        justification_refs:
          - R-002
        enforces_invariant_refs:
          - INV-001
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - test/e2e/simplify-protected-contract.test.mjs
          - test/e2e/support/simplify-contract-fixture.mjs
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - AC-001
              - AC-002
              - AC-003
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - INV-001
              - INV-003
        justification_refs:
          - R-001
          - R-003
          - R-004
        enforces_invariant_refs:
          - INV-001
          - INV-003
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - test/e2e/review-contract.test.mjs
          - test/e2e/support/ui-review-fixture.mjs
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - AC-002
              - AC-012
              - AC-013
              - AC-014
              - INV-002
              - INV-003
        justification_refs:
          - R-005
        enforces_invariant_refs:
          - INV-002
          - INV-003
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-004
        planned_paths:
          - test/e2e/ship-readiness-contract.test.mjs
          - test/e2e/repair-contract.test.mjs
          - test/e2e/validation-map-contract.test.mjs
          - test/e2e/angular-production-contract.test.mjs
          - test/e2e/nextjs-production-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - AC-012
              - AC-013
              - INV-002
              - INV-003
        justification_refs:
          - R-005
        enforces_invariant_refs:
          - INV-002
          - INV-003
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
        planned_paths:
          - test/e2e/design-handoff-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - AC-015
              - AC-016
              - INV-001
              - INV-002
        justification_refs:
          - R-006
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: *a2
        planned_paths:
          - _refs/shared/approved-artifact.mjs
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - AC-021
              - INV-004
        justification_refs:
          - R-008
        enforces_invariant_refs:
          - INV-004
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-007
        planned_paths:
          - _refs/shared/repository-observation.mjs
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - AC-001
              - AC-002
              - AC-003
              - AC-011
              - INV-001
              - INV-002
        justification_refs:
          - R-001
          - R-004
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-009
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-008
        planned_paths:
          - _refs/simplify/repository-evidence.mjs
        planned_evidence:
          - id: EVIDENCE-009
            record_refs:
              - AC-002
              - AC-005
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - INV-001
              - INV-003
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
        enforces_invariant_refs:
          - INV-001
          - INV-003
      - id: TASK-010
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-009
        planned_paths:
          - _refs/simplify/host-runner.mjs
        planned_evidence:
          - id: EVIDENCE-010
            record_refs:
              - AC-011
              - INV-001
              - INV-003
        justification_refs:
          - R-004
        enforces_invariant_refs:
          - INV-001
          - INV-003
      - id: TASK-011
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-010
        planned_paths:
          - _refs/simplify/simplify-contract.mjs
          - _refs/harness/communication-economy.mjs
          - _refs/shared/review-contract.mjs
          - _refs/shared/ship-readiness-contract.mjs
          - _refs/orchestration/repair-contract.mjs
        planned_evidence:
          - id: EVIDENCE-011
            record_refs:
              - AC-007
              - AC-011
              - INV-001
              - INV-003
        justification_refs:
          - R-003
          - R-004
        enforces_invariant_refs:
          - INV-001
          - INV-003
      - id: TASK-012
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-011
        planned_paths:
          - _refs/shared/finish-gate.mjs
          - _refs/orchestration/execution-contract.mjs
          - _refs/orchestration/parallel-protocol.mjs
          - _refs/angular/execution-contract.mjs
          - _refs/nextjs/execution-contract.mjs
        planned_evidence:
          - id: EVIDENCE-012
            record_refs:
              - AC-004
              - AC-005
              - AC-011
              - INV-002
              - INV-003
        justification_refs:
          - R-002
          - R-004
        enforces_invariant_refs:
          - INV-002
          - INV-003
      - id: TASK-013
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-012
        planned_paths:
          - _refs/harness/runtime-policy.mjs
        planned_evidence:
          - id: EVIDENCE-013
            record_refs:
              - AC-006
              - INV-001
        justification_refs:
          - R-002
        enforces_invariant_refs:
          - INV-001
      - id: TASK-014
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-013
        planned_paths:
          - _refs/shared/finish-gate.md
          - _refs/simplify/verification.md
          - skills/shared/workflow/simplify.md
          - _refs/shared/user-choice-prompt.md
          - _refs/simplify/scope-and-invariants.md
        planned_evidence:
          - id: EVIDENCE-014
            record_refs:
              - AC-004
              - AC-006
              - AC-011
              - INV-002
        justification_refs:
          - R-002
          - R-004
        enforces_invariant_refs:
          - INV-002
      - id: TASK-015
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-014
        planned_paths:
          - _refs/shared/ui-review-contract.mjs
        planned_evidence:
          - id: EVIDENCE-015
            record_refs:
              - AC-002
              - AC-012
              - AC-013
              - AC-014
              - INV-002
              - INV-003
        justification_refs:
          - R-001
          - R-005
        enforces_invariant_refs:
          - INV-002
          - INV-003
      - id: TASK-016
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-015
        planned_paths:
          - _refs/shared/ui-review.md
          - _refs/shared/test-ui-evidence.md
          - _refs/review/output-contract.md
        planned_evidence:
          - id: EVIDENCE-016
            record_refs:
              - AC-013
              - AC-014
        justification_refs:
          - R-005
        enforces_invariant_refs: []
      - id: TASK-017
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-016
        planned_paths:
          - _refs/shared/design-verification.mjs
          - _refs/shared/design-handoff.mjs
          - _refs/shared/design-handoff.md
          - _refs/design/handoff-authoring.md
          - skills/tracks/design/sdcorejs-design.md
        planned_evidence:
          - id: EVIDENCE-017
            record_refs:
              - AC-015
              - AC-016
              - INV-001
              - INV-002
        justification_refs:
          - R-006
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-018
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-017
        planned_paths:
          - skills/tracks/angular/sdcorejs-angular.md
          - _refs/angular/write-code/actions.md
        planned_evidence:
          - id: EVIDENCE-018
            record_refs:
              - AC-017
              - INV-002
        justification_refs:
          - R-007
        enforces_invariant_refs:
          - INV-002
      - id: TASK-019
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-018
        planned_paths:
          - skills/shared/workflow/explore.md
          - skills/shared/workflow/review.md
        planned_evidence:
          - id: EVIDENCE-019
            record_refs:
              - AC-018
        justification_refs:
          - R-007
        enforces_invariant_refs: []
      - id: TASK-020
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-019
        planned_paths:
          - test/e2e/simplify-skill-contract.test.mjs
          - test/e2e/explore-topology.test.mjs
          - test/e2e/communication-economy.test.mjs
          - test/e2e/uiux-review-regression.test.mjs
          - test/e2e/uiux-knowledge.test.mjs
        planned_evidence:
          - id: EVIDENCE-020
            record_refs:
              - AC-019
              - AC-022
              - INV-003
        justification_refs:
          - R-007
          - R-009
        enforces_invariant_refs:
          - INV-003
      - id: TASK-021
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-020
        planned_paths:
          - .cursor/rules/sdcorejs-agent.mdc
          - .claude/sdcorejs-harness.json
          - plugin/sdcorejs-harness.json
          - codex/sdcorejs-harness.json
          - .cursor/sdcorejs-harness.json
          - .github/sdcorejs-harness.json
        planned_evidence:
          - id: EVIDENCE-021
            record_refs:
              - AC-022
        justification_refs:
          - R-009
        enforces_invariant_refs: []
      - id: TASK-022
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-021
        planned_paths:
          - authoring/evals/uiux/evidence.test.mjs
          - test/e2e/npm-publication-contract.test.mjs
          - authoring/evals/audit-findings-repair.json
        planned_evidence:
          - id: EVIDENCE-022
            record_refs:
              - AC-021
              - AC-022
              - INV-003
              - INV-004
        justification_refs:
          - R-008
          - R-009
        enforces_invariant_refs:
          - INV-003
          - INV-004
      - id: TASK-023
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-022
        planned_paths:
          - VALIDATION.md
          - .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-delivery.md
        planned_evidence:
          - id: EVIDENCE-023
            record_refs:
              - AC-020
              - AC-022
              - INV-001
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-007
          - R-009
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - test/e2e/production-readiness-contract.test.mjs
            - test/e2e/support/interaction-finish-fixture.mjs
            - test/e2e/harness-behavioral-sentinel.test.mjs
            - test/e2e/simplify-protected-contract.test.mjs
            - test/e2e/support/simplify-contract-fixture.mjs
            - test/e2e/review-contract.test.mjs
            - test/e2e/support/ui-review-fixture.mjs
            - test/e2e/ship-readiness-contract.test.mjs
            - test/e2e/repair-contract.test.mjs
            - test/e2e/validation-map-contract.test.mjs
            - test/e2e/angular-production-contract.test.mjs
            - test/e2e/nextjs-production-contract.test.mjs
            - test/e2e/design-handoff-contract.test.mjs
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/repository-observation.mjs
            - _refs/simplify/repository-evidence.mjs
            - _refs/simplify/simplify-contract.mjs
            - _refs/harness/communication-economy.mjs
            - _refs/shared/review-contract.mjs
            - _refs/shared/ship-readiness-contract.mjs
            - _refs/orchestration/repair-contract.mjs
            - _refs/shared/finish-gate.mjs
            - _refs/orchestration/execution-contract.mjs
            - _refs/orchestration/parallel-protocol.mjs
            - _refs/angular/execution-contract.mjs
            - _refs/nextjs/execution-contract.mjs
            - _refs/harness/runtime-policy.mjs
            - _refs/shared/finish-gate.md
            - _refs/simplify/verification.md
            - skills/shared/workflow/simplify.md
            - _refs/shared/user-choice-prompt.md
            - _refs/simplify/scope-and-invariants.md
            - _refs/shared/ui-review-contract.mjs
            - _refs/shared/ui-review.md
            - _refs/shared/test-ui-evidence.md
            - _refs/review/output-contract.md
            - _refs/shared/design-verification.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/design-handoff.md
            - _refs/design/handoff-authoring.md
            - skills/tracks/design/sdcorejs-design.md
            - skills/tracks/angular/sdcorejs-angular.md
            - _refs/angular/write-code/actions.md
            - skills/shared/workflow/explore.md
            - skills/shared/workflow/review.md
            - test/e2e/simplify-skill-contract.test.mjs
            - test/e2e/explore-topology.test.mjs
            - test/e2e/communication-economy.test.mjs
            - test/e2e/uiux-review-regression.test.mjs
            - test/e2e/uiux-knowledge.test.mjs
            - .cursor/rules/sdcorejs-agent.mdc
            - .claude/sdcorejs-harness.json
            - plugin/sdcorejs-harness.json
            - codex/sdcorejs-harness.json
            - .cursor/sdcorejs-harness.json
            - .github/sdcorejs-harness.json
            - authoring/evals/uiux/evidence.test.mjs
            - test/e2e/npm-publication-contract.test.mjs
            - VALIDATION.md
          intended_new_paths:
            - path: _refs/simplify/host-runner.mjs
              owner_task_id: TASK-010
            - path: authoring/evals/audit-findings-repair.json
              owner_task_id: TASK-022
            - path: .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-delivery.md
              owner_task_id: TASK-023
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
        - INV-001
        - INV-002
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-observer-real-repo
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
        test/e2e/simplify-protected-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Finish runtime và simplify session khởi tạo được trên repository này (hơn 128 MiB output bị
        ignore) và trên fixture có node_modules bị ignore kèm symlink/junction; thay đổi metadata của file bị
        ignore vẫn bị phát hiện là write.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-001
        - INV-002
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-volatile-paths
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
        test/e2e/simplify-protected-contract.test.mjs test/e2e/review-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Cache khai volatile bị test ghi lại trong lúc chạy lệnh verification không làm fail receipt;
        mọi write của simplify/hook vào volatile path bị chặn; write vào path bị ignore nhưng không khai
        volatile vẫn bị phát hiện.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-001
        - INV-002
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-symlink-scope
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
        test/e2e/simplify-protected-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Symlink ngoài write scope được quan sát theo metadata đích và không làm throw; symlink trong
        write scope vẫn bị chặn.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-001
        - INV-002
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-finish-convergence
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mọi next_action có phase là khóa receipt; một host làm đúng tài liệu hội tụ tới tail-complete
        sau write, repair, simplify Apply và stage A/B của worker (test drive-to-completion); receipt fail nêu
        rõ phase cần chạy lại.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-001
        - INV-002
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-simplify-pending
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Pass simplify đã cấp quyền còn pending/unverified chặn tail-complete kể cả khi diff rỗng;
        tail-complete báo đúng lựa chọn đã ghi (apply/analyze/skip).
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-001
        - INV-002
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-policy-ask-native
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Decision finish:policy không bao giờ bị auto-select kể cả khi chỉ có một option; resolveAction
        không trả lại native surface đã lỗi.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-001
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-analyze-honest
      planned_command: node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Output Analyze không mang status verified, git_diff_check passed hay preserved_surfaces
        verified cho check chưa chạy; tham chiếu evidence được resolve theo session; consumer không coi
        Analyze là verification hiện tại.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-001
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-diff-check-scope
      planned_command: node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Whitespace hoặc CRLF có sẵn ngoài path của pass không chặn pass hợp lệ hay rollback;
        whitespace do chính pass tạo ra vẫn chặn.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-scoped-rollback
      planned_command: node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Rollback được chấp nhận khi path/hunk của pass được khôi phục đúng byte checkpoint; edit đồng
        thời bên ngoài được liệt kê, giữ nguyên và bắt lấy baseline mới; edit đồng thời chạm path của pass thì
        chặn.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-001
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-hardlink-target
      planned_command: node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Write target có link count lớn hơn 1 bị từ chối trước khi ghi.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-011
      invariant_refs:
        - INV-001
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-host-runner
      planned_command: node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs
        test/e2e/production-readiness-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Script host canonical chạy trọn một pass trên repo tạm thật; consumer ở process khác tự tính
        lại diff, scope, protected path và chạy verification mới rồi mới chấp nhận; receipt bị sửa hoặc làm
        giả bị từ chối.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-017
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-002
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-ordinary-review
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/validation-map-contract.test.mjs test/e2e/angular-production-contract.test.mjs
        test/e2e/nextjs-production-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: review_context không có purpose/ui_review cho kết quả NOT APPLICABLE ở UI consumer của ship,
        validation-map, repair, Angular và Next.js; payload UI giữ nguyên hành vi hiện tại.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-013
      invariant_refs:
        - INV-002
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-failing-receipt
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/repair-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Lần chạy interaction/rendered hoàn tất nhưng fail được ghi với exit và kết quả assertion thật;
        coverage thành FAIL; finding lỗi gắn receipt FAIL còn current được chấp nhận và ship chặn như một lỗi;
        crash/timeout/không output vẫn là gap.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-014
      invariant_refs:
        - INV-002
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-ui-claims-gates-tests
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs
        test/e2e/uiux-review-regression.test.mjs test/e2e/uiux-knowledge.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Claim rendered/interaction/keyboard/focus trong finding source-only bị từ chối bất kể cách
        diễn đạt; gate ngoài BLOCKER/REQUIRED/ADVISORY/N/A bị từ chối; các test dựng lại thất bại khi gỡ guard
        tương ứng.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-015
      invariant_refs:
        - INV-002
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-greenfield-design
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Handoff có bản ghi no-baseline kèm lý do và tham chiếu approval verify được khi mọi mapping là
        candidate/unknown/new; thiếu approval hoặc có mapping confirmed thì chặn; dự án đã có UI vẫn phải
        trích source thật.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-012
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-016
      invariant_refs:
        - INV-002
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-design-docs
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Tài liệu Design nêu html/svg là định dạng editable của schema 2 và resolver trả về path
        ledger; test đối chiếu tài liệu với helper.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-008
        - EVIDENCE-012
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-017
      invariant_refs:
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-styling-reachable
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mọi đường sinh Angular (actions, admin-screens, init-module, init-portal, init-entity,
        screen-list, screen-detail) tới được styling.md qua điều kiện load trong body hoặc ref được load; test
        reachability.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-015
        - EVIDENCE-018
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-018
      invariant_refs:
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-explore-scan-pointers
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: conventions-read và summary-refresh load scanning/command discipline; review.md không còn con
        trỏ below/above tới nội dung đã chuyển.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-015
        - EVIDENCE-019
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-019
      invariant_refs:
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-placement-tests
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Assertion theo từng file owner; mutation chuyển một rule sang ref có điều kiện load khác bị
        test phát hiện.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-015
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-020
      invariant_refs:
        - INV-003
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-schema-parity
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Test parity giữa ví dụ review_context và field consumer bắt buộc tồn tại; hiệu chỉnh bằng
        chứng AC-013 của bước 5 được ghi trong delivery và VALIDATION.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-015
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-021
      invariant_refs:
        - INV-004
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-artifact-loader
      planned_command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
        authoring/evals/uiux/evidence.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Loader canonical verify được mọi approved snapshot bước 1–5 mà không sửa file; bytes bị sửa
        vẫn fail; consumer và test dùng loader này.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-007
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-009
      acceptance_criterion_id: AC-022
      invariant_refs:
        - INV-003
        - INV-004
      risk: audit-finding-regression-without-contract-loosening
      boundary:
        kind: none
        approval_ref: D-010
        source_refs: *a3
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-repair-evidence-continuation
      planned_command: npm run test:e2e:repository
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mỗi finding có RED trước và PASS sau; số assertion không giảm và không thêm skip; 23 public
        skill; check:skills, text hygiene, executable references và test:e2e:repository PASS trên nội dung
        cuối với Node thỏa engines; không dependency mới.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-015
        - EVIDENCE-020
        - EVIDENCE-021
        - EVIDENCE-022
        - EVIDENCE-023
      rationale: Planned local Node contract/integration check; RED is recorded on HEAD 70c933c before the owning
        source write and PASS on final content. Not executed evidence until the run is recorded.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  allowed_paths:
    - .claude/_refs/**
    - .claude/sdcorejs-harness.json
    - .claude/sdcorejs-harness.json
    - .claude/skills/**
    - .cursor/rules/sdcorejs-agent.mdc
    - .cursor/rules/sdcorejs-agent.mdc
    - .cursor/sdcorejs-harness.json
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
    - .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-delivery.md
    - .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-plan.md
    - .sdcorejs/plans/workflow/2026-09-28-11-06-audit-findings-repair.md
    - VALIDATION.md
    - _refs/angular/execution-contract.mjs
    - _refs/angular/write-code/actions.md
    - _refs/design/handoff-authoring.md
    - _refs/harness/communication-economy.mjs
    - _refs/harness/runtime-policy.mjs
    - _refs/nextjs/execution-contract.mjs
    - _refs/orchestration/execution-contract.mjs
    - _refs/orchestration/parallel-protocol.mjs
    - _refs/orchestration/repair-contract.mjs
    - _refs/review/output-contract.md
    - _refs/shared/approved-artifact.mjs
    - _refs/shared/design-handoff.md
    - _refs/shared/design-handoff.mjs
    - _refs/shared/design-verification.mjs
    - _refs/shared/finish-gate.md
    - _refs/shared/finish-gate.mjs
    - _refs/shared/repository-observation.mjs
    - _refs/shared/review-contract.mjs
    - _refs/shared/ship-readiness-contract.mjs
    - _refs/shared/test-ui-evidence.md
    - _refs/shared/ui-review-contract.mjs
    - _refs/shared/ui-review.md
    - _refs/shared/user-choice-prompt.md
    - _refs/simplify/host-runner.mjs
    - _refs/simplify/repository-evidence.mjs
    - _refs/simplify/scope-and-invariants.md
    - _refs/simplify/simplify-contract.mjs
    - _refs/simplify/verification.md
    - authoring/evals/audit-findings-repair.json
    - authoring/evals/uiux/evidence.test.mjs
    - codex/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
    - codex/skills/**
    - plugin/_refs/**
    - plugin/sdcorejs-harness.json
    - plugin/sdcorejs-harness.json
    - plugin/skills/**
    - skills/shared/workflow/explore.md
    - skills/shared/workflow/review.md
    - skills/shared/workflow/simplify.md
    - skills/tracks/angular/sdcorejs-angular.md
    - skills/tracks/design/sdcorejs-design.md
    - test/e2e/angular-production-contract.test.mjs
    - test/e2e/communication-economy.test.mjs
    - test/e2e/design-handoff-contract.test.mjs
    - test/e2e/explore-topology.test.mjs
    - test/e2e/harness-behavioral-sentinel.test.mjs
    - test/e2e/nextjs-production-contract.test.mjs
    - test/e2e/npm-publication-contract.test.mjs
    - test/e2e/production-readiness-contract.test.mjs
    - test/e2e/repair-contract.test.mjs
    - test/e2e/review-contract.test.mjs
    - test/e2e/ship-readiness-contract.test.mjs
    - test/e2e/simplify-protected-contract.test.mjs
    - test/e2e/simplify-skill-contract.test.mjs
    - test/e2e/support/interaction-finish-fixture.mjs
    - test/e2e/support/simplify-contract-fixture.mjs
    - test/e2e/support/ui-review-fixture.mjs
    - test/e2e/uiux-knowledge.test.mjs
    - test/e2e/uiux-review-regression.test.mjs
    - test/e2e/validation-map-contract.test.mjs
  prohibited_paths: &a5
    - package.json
    - package-lock.json
    - node_modules/**
    - site/**
    - .git/**
    - .env
    - .env.*
    - AGENTS.md
    - CLAUDE.md
    - _refs/shared/system-registry.json
    - .sdcorejs/specs/**
    - .sdcorejs/architecture/**
    - .sdcorejs/conventions/**
    - .sdcorejs/memories/**
    - authoring/evals/interaction-finish-contract.json
    - authoring/evals/skill-body-progressive-loading.json
    - authoring/evals/uiux/*.json
    - authoring/evals/records/**
    - test/e2e/fixtures/communication-economy-baseline.json
    - skills/tracks/ai-agent/**
    - skills/tracks/nestjs/**
    - skills/tracks/nextjs/**
    - skills/tracks/product/**
    - skills/tracks/test/**
    - skills/shared/sdlc/**
    - skills/orchestration/**
    - skills/shared/workflow/debug.md
    - skills/shared/workflow/git.md
    - skills/shared/workflow/ship.md
  generated_artifacts:
    - .claude/skills/**
    - .claude/_refs/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - .cursor/rules/sdcorejs-agent.mdc
    - .claude/sdcorejs-harness.json
    - plugin/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-delivery.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-plan.md
    - .sdcorejs/plans/workflow/2026-09-28-11-06-audit-findings-repair.md
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
    not_applicable_reason: Skill-pack contracts, tests và Markdown; không có frontend product.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Không có engine/capability của agent application.
  verification_strategy:
    package_manager: npm
    package_manager_evidence: package.json packageManager npm@10.9.2; package-lock.json có mặt. Node hệ thống
      v22.14.0 thấp hơn engines; mọi lệnh chạy bằng Node v22.22.3 (fnm) và ghi rõ.
    commands_planned:
      - command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
          test/e2e/harness-behavioral-sentinel.test.mjs test/e2e/simplify-protected-contract.test.mjs
        reason: RED rồi PASS cho workstream A (checkpoint A)
      - command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs
          test/e2e/ship-readiness-contract.test.mjs test/e2e/repair-contract.test.mjs
          test/e2e/validation-map-contract.test.mjs test/e2e/angular-production-contract.test.mjs
          test/e2e/nextjs-production-contract.test.mjs test/e2e/design-handoff-contract.test.mjs
          test/e2e/uiux-review-regression.test.mjs test/e2e/uiux-knowledge.test.mjs
        reason: RED rồi PASS cho workstream B (checkpoint B)
      - command: node --test --test-concurrency=1 test/e2e/production-readiness-contract.test.mjs
          test/e2e/explore-topology.test.mjs test/e2e/simplify-skill-contract.test.mjs
          test/e2e/communication-economy.test.mjs
        reason: RED rồi PASS cho workstream C và retarget (checkpoint C)
      - command: node --test --test-concurrency=1 authoring/evals/uiux/evidence.test.mjs
        reason: Evidence continuation và loader trong eval
      - command: node --test --test-concurrency=1 test/e2e/npm-publication-contract.test.mjs
        reason: Allowlist record evaluation evidence
      - command: node authoring/evals/run-deterministic.mjs
        reason: Routing matrix authoring
      - command: npm run test:e2e:skill-authoring
        reason: Inventory 23 skill và authoring contract
      - command: npm run sync:skills
        reason: Sinh lại mirror
      - command: npm run check:skills
        reason: Mirror drift
      - command: npm run check:text-hygiene
        reason: English-only/mojibake
      - command: npm run check:executable-references
        reason: Tham chiếu và cú pháp
      - command: npm run test:e2e:repository
        reason: Broad regression trên nội dung cuối
      - command: git diff --check
        reason: Whitespace
    commands_skipped:
      - command: npm run test:e2e:angular:golden / nestjs / nextjs golden / containers
        reason: Không đổi generator hay template; golden project không đọc các contract này. NOT RUN.
      - command: live agent / browser / provider
        reason: Không được authorize; NOT RUN.
    checks: RED trên HEAD 70c933c cho mọi case-repair-* trước khi sửa source; checkpoint focused sau mỗi
      workstream; broad suite, hygiene, mirror và evidence trên nội dung cuối. Lỗi git timeout do máy quá tải
      được chạy lại riêng và báo đúng, không tính là PASS.
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: test/e2e/production-readiness-contract.test.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Một writer; test dùng chung fixture và mirror.
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
      - TASK-011
      - TASK-012
      - TASK-013
      - TASK-014
      - TASK-015
      - TASK-016
      - TASK-017
      - TASK-018
      - TASK-019
      - TASK-020
      - TASK-021
      - TASK-022
      - TASK-023
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
        - TASK-011
        - TASK-012
        - TASK-013
        - TASK-014
        - TASK-015
        - TASK-016
        - TASK-017
        - TASK-018
        - TASK-019
        - TASK-020
        - TASK-021
        - TASK-022
        - TASK-023
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
          paths: &a4
            - test/e2e/production-readiness-contract.test.mjs
            - test/e2e/support/interaction-finish-fixture.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a4
          prohibited_paths: *a5
          depends_on: []
        - id: TASK-002-EDIT
          action: EDIT
          paths: &a6
            - test/e2e/harness-behavioral-sentinel.test.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a6
          prohibited_paths: *a5
          depends_on:
            - TASK-001-EDIT
        - id: TASK-003-EDIT
          action: EDIT
          paths: &a7
            - test/e2e/simplify-protected-contract.test.mjs
            - test/e2e/support/simplify-contract-fixture.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a7
          prohibited_paths: *a5
          depends_on:
            - TASK-002-EDIT
        - id: TASK-004-EDIT
          action: EDIT
          paths: &a8
            - test/e2e/review-contract.test.mjs
            - test/e2e/support/ui-review-fixture.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a8
          prohibited_paths: *a5
          depends_on:
            - TASK-003-EDIT
        - id: TASK-005-EDIT
          action: EDIT
          paths: &a9
            - test/e2e/ship-readiness-contract.test.mjs
            - test/e2e/repair-contract.test.mjs
            - test/e2e/validation-map-contract.test.mjs
            - test/e2e/angular-production-contract.test.mjs
            - test/e2e/nextjs-production-contract.test.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a9
          prohibited_paths: *a5
          depends_on:
            - TASK-004-EDIT
        - id: TASK-006-EDIT
          action: EDIT
          paths: &a10
            - test/e2e/design-handoff-contract.test.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a10
          prohibited_paths: *a5
          depends_on:
            - TASK-005-EDIT
        - id: TASK-007-EDIT
          action: EDIT
          paths: &a11
            - _refs/shared/approved-artifact.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a11
          prohibited_paths: *a5
          depends_on:
            - TASK-001-EDIT
            - TASK-002-EDIT
            - TASK-003-EDIT
            - TASK-004-EDIT
            - TASK-005-EDIT
            - TASK-006-EDIT
        - id: TASK-008-EDIT
          action: EDIT
          paths: &a12
            - _refs/shared/repository-observation.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a12
          prohibited_paths: *a5
          depends_on:
            - TASK-007-EDIT
        - id: TASK-009-EDIT
          action: EDIT
          paths: &a13
            - _refs/simplify/repository-evidence.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a13
          prohibited_paths: *a5
          depends_on:
            - TASK-008-EDIT
        - id: TASK-010-CREATE
          action: CREATE
          paths: &a14
            - _refs/simplify/host-runner.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a14
          prohibited_paths: *a5
          depends_on:
            - TASK-009-EDIT
        - id: TASK-011-EDIT
          action: EDIT
          paths: &a15
            - _refs/simplify/simplify-contract.mjs
            - _refs/harness/communication-economy.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a15
          prohibited_paths: *a5
          depends_on:
            - TASK-010-CREATE
        - id: TASK-011-VERIFY
          action: VERIFY-THEN-EDIT
          paths: &a16
            - _refs/shared/review-contract.mjs
            - _refs/shared/ship-readiness-contract.mjs
            - _refs/orchestration/repair-contract.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a16
          prohibited_paths: *a5
          depends_on:
            - TASK-011-EDIT
        - id: TASK-012-EDIT
          action: EDIT
          paths: &a17
            - _refs/shared/finish-gate.mjs
            - _refs/orchestration/execution-contract.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a17
          prohibited_paths: *a5
          depends_on:
            - TASK-011-VERIFY
        - id: TASK-012-VERIFY
          action: VERIFY-THEN-EDIT
          paths: &a18
            - _refs/orchestration/parallel-protocol.mjs
            - _refs/angular/execution-contract.mjs
            - _refs/nextjs/execution-contract.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a18
          prohibited_paths: *a5
          depends_on:
            - TASK-012-EDIT
        - id: TASK-013-EDIT
          action: EDIT
          paths: &a19
            - _refs/harness/runtime-policy.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a19
          prohibited_paths: *a5
          depends_on:
            - TASK-012-VERIFY
        - id: TASK-014-EDIT
          action: EDIT
          paths: &a20
            - _refs/shared/finish-gate.md
            - _refs/simplify/verification.md
            - skills/shared/workflow/simplify.md
            - _refs/shared/user-choice-prompt.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a20
          prohibited_paths: *a5
          depends_on:
            - TASK-013-EDIT
        - id: TASK-014-VERIFY
          action: VERIFY-THEN-EDIT
          paths: &a21
            - _refs/simplify/scope-and-invariants.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a21
          prohibited_paths: *a5
          depends_on:
            - TASK-014-EDIT
        - id: TASK-015-EDIT
          action: EDIT
          paths: &a22
            - _refs/shared/ui-review-contract.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a22
          prohibited_paths: *a5
          depends_on:
            - TASK-014-VERIFY
        - id: TASK-016-EDIT
          action: EDIT
          paths: &a23
            - _refs/shared/ui-review.md
            - _refs/shared/test-ui-evidence.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a23
          prohibited_paths: *a5
          depends_on:
            - TASK-015-EDIT
        - id: TASK-016-VERIFY
          action: VERIFY-THEN-EDIT
          paths: &a24
            - _refs/review/output-contract.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a24
          prohibited_paths: *a5
          depends_on:
            - TASK-016-EDIT
        - id: TASK-017-EDIT
          action: EDIT
          paths: &a25
            - _refs/shared/design-verification.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/design-handoff.md
            - _refs/design/handoff-authoring.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a25
          prohibited_paths: *a5
          depends_on:
            - TASK-016-VERIFY
        - id: TASK-017-VERIFY
          action: VERIFY-THEN-EDIT
          paths: &a26
            - skills/tracks/design/sdcorejs-design.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a26
          prohibited_paths: *a5
          depends_on:
            - TASK-017-EDIT
        - id: TASK-018-EDIT
          action: EDIT
          paths: &a27
            - skills/tracks/angular/sdcorejs-angular.md
            - _refs/angular/write-code/actions.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a27
          prohibited_paths: *a5
          depends_on:
            - TASK-017-VERIFY
        - id: TASK-019-EDIT
          action: EDIT
          paths: &a28
            - skills/shared/workflow/explore.md
            - skills/shared/workflow/review.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a28
          prohibited_paths: *a5
          depends_on:
            - TASK-018-EDIT
        - id: TASK-020-VERIFY
          action: VERIFY-THEN-EDIT
          paths: &a29
            - test/e2e/simplify-skill-contract.test.mjs
            - test/e2e/explore-topology.test.mjs
            - test/e2e/communication-economy.test.mjs
            - test/e2e/uiux-review-regression.test.mjs
            - test/e2e/uiux-knowledge.test.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a29
          prohibited_paths: *a5
          depends_on:
            - TASK-019-EDIT
        - id: TASK-021-EDIT
          action: EDIT
          paths: &a30
            - .cursor/rules/sdcorejs-agent.mdc
            - .claude/sdcorejs-harness.json
            - plugin/sdcorejs-harness.json
            - codex/sdcorejs-harness.json
            - .cursor/sdcorejs-harness.json
            - .github/sdcorejs-harness.json
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a30
          prohibited_paths: *a5
          depends_on:
            - TASK-020-VERIFY
        - id: TASK-022-CREATE
          action: CREATE
          paths: &a31
            - authoring/evals/audit-findings-repair.json
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a31
          prohibited_paths: *a5
          depends_on:
            - TASK-021-EDIT
        - id: TASK-022-EDIT
          action: EDIT
          paths: &a32
            - authoring/evals/uiux/evidence.test.mjs
            - test/e2e/npm-publication-contract.test.mjs
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a32
          prohibited_paths: *a5
          depends_on:
            - TASK-022-CREATE
        - id: TASK-023-CREATE
          action: CREATE
          paths: &a33
            - .sdcorejs/docs/workflow/2026-09-28-11-06-audit-findings-repair-delivery.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a33
          prohibited_paths: *a5
          depends_on:
            - TASK-022-EDIT
        - id: TASK-023-EDIT
          action: EDIT
          paths: &a34
            - VALIDATION.md
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          allowed_paths: *a34
          prohibited_paths: *a5
          depends_on:
            - TASK-023-CREATE
  finish_tail:
    contract:
      docs_before_final_branch_ready: true
      verify_before_done: true
      branch_ready_final_gate: true
      no_writes_after_branch_ready: true
    proposed_policy:
      test_strategy: "regression-first: RED của mọi finding trước khi sửa source; required AC không được skip."
      documentation: Chỉ tài liệu trong scope, section VALIDATION, record evidence và delivery doc. Không user
        guide, technical guide, memory hay preference.
      simplify: "skip: nội dung đổi nằm trong _refs/skills/test, là protected path của simplify."
      review: review read-only trên diff đã duyệt; không tự repair.
      repair: Không có authority chung; finding cần đổi scope quay lại plan gate.
      git: Không commit, push, PR, publish hay cài dependency.
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```

## Explicit approval

The user replied `1` to the sole pending plan gate. This authorizes the exact 23 sequential tasks, allowed/prohibited paths, generated mirrors through the sync script, decision coverage revision 2 (D-007 approved, D-008 superseded by D-010, D-009 recorded), the D-010 validation boundary projection and the finish policy above. No dependency, package manifest, public-skill, Git or product-repository writes.

## Approved coverage envelope

```json
{
 "metadata": {
  "allowed_paths": [
   "**"
  ],
  "approval_source": "user-approved-decision-coverage",
  "approved_at": "2026-08-09T00:00:00.000Z",
  "approved_by": "user",
  "artifact_id": "decision-coverage-r2",
  "artifact_kind": "plan",
  "change_ref": "audit-findings-repair-20260928",
  "contract_id": "decision-coverage:v1",
  "owner_module_id": null,
  "owner_repository_id": "github.com/sdcorejs/sdcorejs-agent",
  "owner_repository_role": "standalone",
  "parent_references": [],
  "parent_repository_id": null,
  "prohibited_paths": [],
  "repository_relative_path": ".sdcorejs/plans/workflow/2026-09-28-11-06-audit-findings-repair.md",
  "requirement_id": "decision-coverage",
  "schema_version": 1,
  "source_revision": "70c933c3fc59a98b92c03004de902bc96250fba6",
  "stack_profile": "markdown-skill-pack",
  "supersedes": null,
  "track": "workflow",
  "approval_hash": "sha256:v1:1f79a65a06e1d9063517bf5e1c2f51e584bb7b22d29e53791725e5b95679daf3"
 },
 "body": "{\"history\":[{\"active\":[{\"id\":\"R-001\",\"type\":\"requirement\"},{\"id\":\"R-002\",\"type\":\"requirement\"},{\"id\":\"R-003\",\"type\":\"requirement\"},{\"id\":\"R-004\",\"type\":\"requirement\"},{\"id\":\"R-005\",\"type\":\"requirement\"},{\"id\":\"R-006\",\"type\":\"requirement\"},{\"id\":\"R-007\",\"type\":\"requirement\"},{\"id\":\"R-008\",\"type\":\"requirement\"},{\"id\":\"R-009\",\"type\":\"requirement\"},{\"id\":\"AC-001\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-002\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-003\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-004\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-005\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-006\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-007\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-008\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-009\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-010\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-011\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-012\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-013\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-014\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-015\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-016\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-017\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-018\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-019\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-020\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-021\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-022\",\"type\":\"acceptance-criterion\"},{\"id\":\"D-001\",\"type\":\"decision\"},{\"id\":\"D-002\",\"type\":\"decision\"},{\"id\":\"D-003\",\"type\":\"decision\"},{\"id\":\"D-004\",\"type\":\"decision\"},{\"id\":\"D-005\",\"type\":\"decision\"},{\"id\":\"D-006\",\"type\":\"decision\"},{\"id\":\"D-007\",\"type\":\"decision\"},{\"id\":\"D-008\",\"type\":\"decision\"},{\"id\":\"INV-001\",\"type\":\"invariant\"},{\"id\":\"INV-002\",\"type\":\"invariant\"},{\"id\":\"INV-003\",\"type\":\"invariant\"},{\"id\":\"INV-004\",\"type\":\"invariant\"}],\"revision\":1,\"tombstones\":[]},{\"active\":[{\"id\":\"R-001\",\"type\":\"requirement\"},{\"id\":\"R-002\",\"type\":\"requirement\"},{\"id\":\"R-003\",\"type\":\"requirement\"},{\"id\":\"R-004\",\"type\":\"requirement\"},{\"id\":\"R-005\",\"type\":\"requirement\"},{\"id\":\"R-006\",\"type\":\"requirement\"},{\"id\":\"R-007\",\"type\":\"requirement\"},{\"id\":\"R-008\",\"type\":\"requirement\"},{\"id\":\"R-009\",\"type\":\"requirement\"},{\"id\":\"AC-001\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-002\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-003\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-004\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-005\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-006\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-007\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-008\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-009\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-010\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-011\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-012\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-013\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-014\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-015\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-016\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-017\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-018\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-019\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-020\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-021\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-022\",\"type\":\"acceptance-criterion\"},{\"id\":\"D-001\",\"type\":\"decision\"},{\"id\":\"D-002\",\"type\":\"decision\"},{\"id\":\"D-003\",\"type\":\"decision\"},{\"id\":\"D-004\",\"type\":\"decision\"},{\"id\":\"D-005\",\"type\":\"decision\"},{\"id\":\"D-006\",\"type\":\"decision\"},{\"id\":\"D-007\",\"type\":\"decision\"},{\"id\":\"D-008\",\"type\":\"decision\"},{\"id\":\"D-009\",\"type\":\"decision\"},{\"id\":\"D-010\",\"type\":\"decision\"},{\"id\":\"INV-001\",\"type\":\"invariant\"},{\"id\":\"INV-002\",\"type\":\"invariant\"},{\"id\":\"INV-003\",\"type\":\"invariant\"},{\"id\":\"INV-004\",\"type\":\"invariant\"}],\"revision\":2,\"tombstones\":[]}],\"records\":[{\"id\":\"R-001\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Observer dùng được trên repository kích thước thật (IF-1, S-1): nội dung tracked và untracked chưa ignore vẫn hash theo nội dung với cap; file bị ignore và symlink ghi theo metadata; volatile path khai trong approved plan/policy không làm fail receipt nhưng không bao giờ được simplify/hook ghi; symlink trong write scope vẫn bị chặn.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-008\",\"TASK-009\",\"TASK-015\"],\"type\":\"requirement\"},{\"id\":\"R-002\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Finish-tail hội tụ và không claim done sai (IF-2, S-4, IF-5, IF-3, IF-4): khóa receipt của mọi next action trùng field phase đã tài liệu hóa; không tail-complete khi pass simplify đã cấp quyền còn pending/unverified; báo đúng lựa chọn đã ghi; finish:policy luôn được hỏi; resolveAction tôn trọng native surface đã lỗi.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-009\",\"TASK-012\",\"TASK-013\",\"TASK-014\"],\"type\":\"requirement\"},{\"id\":\"R-003\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Evidence simplify trung thực và giữ thay đổi của user (S-2, S-3, S-5, S-6): Analyze không cấp status verified cho check chưa chạy; diff check chỉ xét path của pass so với trạng thái lúc preflight; rollback theo scope và báo edit đồng thời; từ chối write target có nhiều hard link.\",\"status\":\"active\",\"task_refs\":[\"TASK-003\",\"TASK-009\",\"TASK-011\"],\"type\":\"requirement\"},{\"id\":\"R-004\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Simplify có trusted host thực tế (S-7): script host canonical chạy trọn một pass trong một process; consumer ở process khác tự tính lại diff/scope/protected từ Git và nội dung hiện tại cùng verification mới; receipt chỉ là chỉ mục, receipt giả không qua được.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-008\",\"TASK-009\",\"TASK-010\",\"TASK-011\",\"TASK-012\",\"TASK-014\"],\"type\":\"requirement\"},{\"id\":\"R-005\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"UI review phân biệt đúng các trạng thái (UR-1..UR-5): review_context thường không bị UI consumer chặn; lần chạy fail được ghi thành receipt với coverage FAIL và finding lỗi gắn receipt; claim runtime không receipt bị từ chối theo rule cấu trúc; gate chỉ nhận giá trị canonical; test phân biệt được hành vi.\",\"status\":\"active\",\"task_refs\":[\"TASK-004\",\"TASK-005\",\"TASK-015\",\"TASK-016\"],\"type\":\"requirement\"},{\"id\":\"R-006\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Design handoff hỗ trợ greenfield và tài liệu khớp schema (DH-1..DH-3): bản ghi no-baseline gắn approval cho phép evidence_refs rỗng khi mọi mapping không confirmed; tài liệu nêu đúng định dạng editable của schema 2 và giá trị trả về của resolver.\",\"status\":\"active\",\"task_refs\":[\"TASK-006\",\"TASK-017\"],\"type\":\"requirement\"},{\"id\":\"R-007\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Cấu trúc skill không mất đường load (ST-1..ST-5): mọi đường sinh Angular tới được styling.md; mọi action explore có scan/chạy lệnh load scanning/command discipline; con trỏ trong review.md nêu đúng ref; test kiểm vị trí owner và khả năng load; bằng chứng AC-013 bước 5 được sửa lại trung thực kèm test parity.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-018\",\"TASK-019\",\"TASK-020\",\"TASK-023\"],\"type\":\"requirement\"},{\"id\":\"R-008\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Loader approved artifact canonical (G-1): một hàm đọc file snapshot chuẩn dùng chung, verify được mọi snapshot bước 1–5 kể cả dòng trống phân cách của bước 1, không sửa snapshot; bytes bị sửa vẫn fail.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-007\",\"TASK-022\"],\"type\":\"requirement\"},{\"id\":\"R-009\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Governance: mỗi finding có regression RED trước và PASS sau; không assertion nào bị xóa hoặc nới; 23 public skill; mirror sinh bằng script; không dependency mới; evidence tách tầng deterministic/integration/live; không commit/push khi chưa được yêu cầu.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-020\",\"TASK-021\",\"TASK-022\",\"TASK-023\"],\"type\":\"requirement\"},{\"behavior\":\"observer-real-repo\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-008\"],\"expected_result\":\"Finish runtime và simplify session khởi tạo được trên repository này (hơn 128 MiB output bị ignore) và trên fixture có node_modules bị ignore kèm symlink/junction; thay đổi metadata của file bị ignore vẫn bị phát hiện là write.\",\"id\":\"AC-001\",\"requirement_refs\":[\"R-001\"],\"statement\":\"Finish runtime và simplify session khởi tạo được trên repository này (hơn 128 MiB output bị ignore) và trên fixture có node_modules bị ignore kèm symlink/junction; thay đổi metadata của file bị ignore vẫn bị phát hiện là write.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-008\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"volatile-paths\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-008\",\"EVIDENCE-009\",\"EVIDENCE-015\"],\"expected_result\":\"Cache khai volatile bị test ghi lại trong lúc chạy lệnh verification không làm fail receipt; mọi write của simplify/hook vào volatile path bị chặn; write vào path bị ignore nhưng không khai volatile vẫn bị phát hiện.\",\"id\":\"AC-002\",\"requirement_refs\":[\"R-001\"],\"statement\":\"Cache khai volatile bị test ghi lại trong lúc chạy lệnh verification không làm fail receipt; mọi write của simplify/hook vào volatile path bị chặn; write vào path bị ignore nhưng không khai volatile vẫn bị phát hiện.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-008\",\"TASK-009\",\"TASK-015\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"symlink-scope\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-008\"],\"expected_result\":\"Symlink ngoài write scope được quan sát theo metadata đích và không làm throw; symlink trong write scope vẫn bị chặn.\",\"id\":\"AC-003\",\"requirement_refs\":[\"R-001\"],\"statement\":\"Symlink ngoài write scope được quan sát theo metadata đích và không làm throw; symlink trong write scope vẫn bị chặn.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-008\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"finish-convergence\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-012\",\"EVIDENCE-014\"],\"expected_result\":\"Mọi next_action có phase là khóa receipt; một host làm đúng tài liệu hội tụ tới tail-complete sau write, repair, simplify Apply và stage A/B của worker (test drive-to-completion); receipt fail nêu rõ phase cần chạy lại.\",\"id\":\"AC-004\",\"requirement_refs\":[\"R-002\"],\"statement\":\"Mọi next_action có phase là khóa receipt; một host làm đúng tài liệu hội tụ tới tail-complete sau write, repair, simplify Apply và stage A/B của worker (test drive-to-completion); receipt fail nêu rõ phase cần chạy lại.\",\"task_refs\":[\"TASK-001\",\"TASK-012\",\"TASK-014\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"simplify-pending\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-009\",\"EVIDENCE-012\"],\"expected_result\":\"Pass simplify đã cấp quyền còn pending/unverified chặn tail-complete kể cả khi diff rỗng; tail-complete báo đúng lựa chọn đã ghi (apply/analyze/skip).\",\"id\":\"AC-005\",\"requirement_refs\":[\"R-002\"],\"statement\":\"Pass simplify đã cấp quyền còn pending/unverified chặn tail-complete kể cả khi diff rỗng; tail-complete báo đúng lựa chọn đã ghi (apply/analyze/skip).\",\"task_refs\":[\"TASK-001\",\"TASK-009\",\"TASK-012\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"policy-ask-native\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-002\",\"EVIDENCE-013\",\"EVIDENCE-014\"],\"expected_result\":\"Decision finish:policy không bao giờ bị auto-select kể cả khi chỉ có một option; resolveAction không trả lại native surface đã lỗi.\",\"id\":\"AC-006\",\"requirement_refs\":[\"R-002\"],\"statement\":\"Decision finish:policy không bao giờ bị auto-select kể cả khi chỉ có một option; resolveAction không trả lại native surface đã lỗi.\",\"task_refs\":[\"TASK-002\",\"TASK-013\",\"TASK-014\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"analyze-honest\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-003\",\"EVIDENCE-009\",\"EVIDENCE-011\"],\"expected_result\":\"Output Analyze không mang status verified, git_diff_check passed hay preserved_surfaces verified cho check chưa chạy; tham chiếu evidence được resolve theo session; consumer không coi Analyze là verification hiện tại.\",\"id\":\"AC-007\",\"requirement_refs\":[\"R-003\"],\"statement\":\"Output Analyze không mang status verified, git_diff_check passed hay preserved_surfaces verified cho check chưa chạy; tham chiếu evidence được resolve theo session; consumer không coi Analyze là verification hiện tại.\",\"task_refs\":[\"TASK-003\",\"TASK-009\",\"TASK-011\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"diff-check-scope\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-003\",\"EVIDENCE-009\"],\"expected_result\":\"Whitespace hoặc CRLF có sẵn ngoài path của pass không chặn pass hợp lệ hay rollback; whitespace do chính pass tạo ra vẫn chặn.\",\"id\":\"AC-008\",\"requirement_refs\":[\"R-003\"],\"statement\":\"Whitespace hoặc CRLF có sẵn ngoài path của pass không chặn pass hợp lệ hay rollback; whitespace do chính pass tạo ra vẫn chặn.\",\"task_refs\":[\"TASK-003\",\"TASK-009\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"scoped-rollback\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-003\",\"EVIDENCE-009\"],\"expected_result\":\"Rollback được chấp nhận khi path/hunk của pass được khôi phục đúng byte checkpoint; edit đồng thời bên ngoài được liệt kê, giữ nguyên và bắt lấy baseline mới; edit đồng thời chạm path của pass thì chặn.\",\"id\":\"AC-009\",\"requirement_refs\":[\"R-003\"],\"statement\":\"Rollback được chấp nhận khi path/hunk của pass được khôi phục đúng byte checkpoint; edit đồng thời bên ngoài được liệt kê, giữ nguyên và bắt lấy baseline mới; edit đồng thời chạm path của pass thì chặn.\",\"task_refs\":[\"TASK-003\",\"TASK-009\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"hardlink-target\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-003\",\"EVIDENCE-009\"],\"expected_result\":\"Write target có link count lớn hơn 1 bị từ chối trước khi ghi.\",\"id\":\"AC-010\",\"requirement_refs\":[\"R-003\"],\"statement\":\"Write target có link count lớn hơn 1 bị từ chối trước khi ghi.\",\"task_refs\":[\"TASK-003\",\"TASK-009\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"host-runner\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-008\",\"EVIDENCE-009\",\"EVIDENCE-010\",\"EVIDENCE-011\",\"EVIDENCE-012\",\"EVIDENCE-014\"],\"expected_result\":\"Script host canonical chạy trọn một pass trên repo tạm thật; consumer ở process khác tự tính lại diff, scope, protected path và chạy verification mới rồi mới chấp nhận; receipt bị sửa hoặc làm giả bị từ chối.\",\"id\":\"AC-011\",\"requirement_refs\":[\"R-004\"],\"statement\":\"Script host canonical chạy trọn một pass trên repo tạm thật; consumer ở process khác tự tính lại diff, scope, protected path và chạy verification mới rồi mới chấp nhận; receipt bị sửa hoặc làm giả bị từ chối.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-008\",\"TASK-009\",\"TASK-010\",\"TASK-011\",\"TASK-012\",\"TASK-014\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"ordinary-review\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-015\"],\"expected_result\":\"review_context không có purpose/ui_review cho kết quả NOT APPLICABLE ở UI consumer của ship, validation-map, repair, Angular và Next.js; payload UI giữ nguyên hành vi hiện tại.\",\"id\":\"AC-012\",\"requirement_refs\":[\"R-005\"],\"statement\":\"review_context không có purpose/ui_review cho kết quả NOT APPLICABLE ở UI consumer của ship, validation-map, repair, Angular và Next.js; payload UI giữ nguyên hành vi hiện tại.\",\"task_refs\":[\"TASK-004\",\"TASK-005\",\"TASK-015\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"failing-receipt\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-015\",\"EVIDENCE-016\"],\"expected_result\":\"Lần chạy interaction/rendered hoàn tất nhưng fail được ghi với exit và kết quả assertion thật; coverage thành FAIL; finding lỗi gắn receipt FAIL còn current được chấp nhận và ship chặn như một lỗi; crash/timeout/không output vẫn là gap.\",\"id\":\"AC-013\",\"requirement_refs\":[\"R-005\"],\"statement\":\"Lần chạy interaction/rendered hoàn tất nhưng fail được ghi với exit và kết quả assertion thật; coverage thành FAIL; finding lỗi gắn receipt FAIL còn current được chấp nhận và ship chặn như một lỗi; crash/timeout/không output vẫn là gap.\",\"task_refs\":[\"TASK-004\",\"TASK-005\",\"TASK-015\",\"TASK-016\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"ui-claims-gates-tests\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-004\",\"EVIDENCE-015\",\"EVIDENCE-016\"],\"expected_result\":\"Claim rendered/interaction/keyboard/focus trong finding source-only bị từ chối bất kể cách diễn đạt; gate ngoài BLOCKER/REQUIRED/ADVISORY/N/A bị từ chối; các test dựng lại thất bại khi gỡ guard tương ứng.\",\"id\":\"AC-014\",\"requirement_refs\":[\"R-005\"],\"statement\":\"Claim rendered/interaction/keyboard/focus trong finding source-only bị từ chối bất kể cách diễn đạt; gate ngoài BLOCKER/REQUIRED/ADVISORY/N/A bị từ chối; các test dựng lại thất bại khi gỡ guard tương ứng.\",\"task_refs\":[\"TASK-004\",\"TASK-015\",\"TASK-016\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"greenfield-design\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-006\",\"EVIDENCE-017\"],\"expected_result\":\"Handoff có bản ghi no-baseline kèm lý do và tham chiếu approval verify được khi mọi mapping là candidate/unknown/new; thiếu approval hoặc có mapping confirmed thì chặn; dự án đã có UI vẫn phải trích source thật.\",\"id\":\"AC-015\",\"requirement_refs\":[\"R-006\"],\"statement\":\"Handoff có bản ghi no-baseline kèm lý do và tham chiếu approval verify được khi mọi mapping là candidate/unknown/new; thiếu approval hoặc có mapping confirmed thì chặn; dự án đã có UI vẫn phải trích source thật.\",\"task_refs\":[\"TASK-006\",\"TASK-017\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"design-docs\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-006\",\"EVIDENCE-017\"],\"expected_result\":\"Tài liệu Design nêu html/svg là định dạng editable của schema 2 và resolver trả về path ledger; test đối chiếu tài liệu với helper.\",\"id\":\"AC-016\",\"requirement_refs\":[\"R-006\"],\"statement\":\"Tài liệu Design nêu html/svg là định dạng editable của schema 2 và resolver trả về path ledger; test đối chiếu tài liệu với helper.\",\"task_refs\":[\"TASK-006\",\"TASK-017\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"styling-reachable\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-018\"],\"expected_result\":\"Mọi đường sinh Angular (actions, admin-screens, init-module, init-portal, init-entity, screen-list, screen-detail) tới được styling.md qua điều kiện load trong body hoặc ref được load; test reachability.\",\"id\":\"AC-017\",\"requirement_refs\":[\"R-007\"],\"statement\":\"Mọi đường sinh Angular (actions, admin-screens, init-module, init-portal, init-entity, screen-list, screen-detail) tới được styling.md qua điều kiện load trong body hoặc ref được load; test reachability.\",\"task_refs\":[\"TASK-001\",\"TASK-018\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"explore-scan-pointers\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-019\"],\"expected_result\":\"conventions-read và summary-refresh load scanning/command discipline; review.md không còn con trỏ below/above tới nội dung đã chuyển.\",\"id\":\"AC-018\",\"requirement_refs\":[\"R-007\"],\"statement\":\"conventions-read và summary-refresh load scanning/command discipline; review.md không còn con trỏ below/above tới nội dung đã chuyển.\",\"task_refs\":[\"TASK-001\",\"TASK-019\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"placement-tests\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-020\"],\"expected_result\":\"Assertion theo từng file owner; mutation chuyển một rule sang ref có điều kiện load khác bị test phát hiện.\",\"id\":\"AC-019\",\"requirement_refs\":[\"R-007\"],\"statement\":\"Assertion theo từng file owner; mutation chuyển một rule sang ref có điều kiện load khác bị test phát hiện.\",\"task_refs\":[\"TASK-001\",\"TASK-020\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"schema-parity\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-023\"],\"expected_result\":\"Test parity giữa ví dụ review_context và field consumer bắt buộc tồn tại; hiệu chỉnh bằng chứng AC-013 của bước 5 được ghi trong delivery và VALIDATION.\",\"id\":\"AC-020\",\"requirement_refs\":[\"R-007\"],\"statement\":\"Test parity giữa ví dụ review_context và field consumer bắt buộc tồn tại; hiệu chỉnh bằng chứng AC-013 của bước 5 được ghi trong delivery và VALIDATION.\",\"task_refs\":[\"TASK-001\",\"TASK-023\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"artifact-loader\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-007\",\"EVIDENCE-022\"],\"expected_result\":\"Loader canonical verify được mọi approved snapshot bước 1–5 mà không sửa file; bytes bị sửa vẫn fail; consumer và test dùng loader này.\",\"id\":\"AC-021\",\"requirement_refs\":[\"R-008\"],\"statement\":\"Loader canonical verify được mọi approved snapshot bước 1–5 mà không sửa file; bytes bị sửa vẫn fail; consumer và test dùng loader này.\",\"task_refs\":[\"TASK-001\",\"TASK-007\",\"TASK-022\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"governance\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-020\",\"EVIDENCE-021\",\"EVIDENCE-022\",\"EVIDENCE-023\"],\"expected_result\":\"Mỗi finding có RED trước và PASS sau; số assertion không giảm và không thêm skip; 23 public skill; check:skills, text hygiene, executable references và test:e2e:repository PASS trên nội dung cuối với Node thỏa engines; không dependency mới.\",\"id\":\"AC-022\",\"requirement_refs\":[\"R-009\"],\"statement\":\"Mỗi finding có RED trước và PASS sau; số assertion không giảm và không thêm skip; 23 public skill; check:skills, text hygiene, executable references và test:e2e:repository PASS trên nội dung cuối với Node thỏa engines; không dependency mới.\",\"task_refs\":[\"TASK-020\",\"TASK-021\",\"TASK-022\",\"TASK-023\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-001\",\"AC-001\",\"AC-002\",\"AC-003\"],\"id\":\"D-001\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Observer trên repo thật xử lý thế nào?\",\"rationale\":\"User chọn phương án 1 ở quyết định 1/5.\",\"scope\":\"repository\",\"selected_value\":\"Metadata cho file bị ignore và symlink, cap chỉ cho nội dung tracked/untracked chưa ignore, volatile path khai trong approved plan/policy và không bao giờ được ghi\",\"source\":\"explicit-user\",\"statement\":\"Metadata cho file bị ignore và symlink, cap chỉ cho nội dung tracked/untracked chưa ignore, volatile path khai trong approved plan/policy và không bao giờ được ghi\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-008\",\"TASK-009\",\"TASK-015\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-005\",\"AC-013\"],\"id\":\"D-002\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Lần chạy UI bị fail ghi thế nào?\",\"rationale\":\"User chọn phương án 1 ở quyết định 2/5.\",\"scope\":\"repository\",\"selected_value\":\"Ghi receipt cho mọi lần chạy hoàn tất với exit và assertion thật; coverage có FAIL; finding lỗi gắn receipt FAIL\",\"source\":\"explicit-user\",\"statement\":\"Ghi receipt cho mọi lần chạy hoàn tất với exit và assertion thật; coverage có FAIL; finding lỗi gắn receipt FAIL\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-015\",\"TASK-016\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-006\",\"AC-015\"],\"id\":\"D-003\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Design greenfield verify thế nào?\",\"rationale\":\"User chọn phương án 1 ở quyết định 3/5.\",\"scope\":\"repository\",\"selected_value\":\"Bản ghi no-baseline kèm lý do và tham chiếu approval; mọi mapping không confirmed\",\"source\":\"explicit-user\",\"statement\":\"Bản ghi no-baseline kèm lý do và tham chiếu approval; mọi mapping không confirmed\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-017\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-004\",\"AC-011\"],\"id\":\"D-004\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Trusted host cho simplify là gì?\",\"rationale\":\"User chọn phương án 1 ở quyết định 4/5.\",\"scope\":\"repository\",\"selected_value\":\"Script host canonical chạy trọn pass trong một process; consumer tự tính lại từ Git và nội dung hiện tại; receipt chỉ là chỉ mục\",\"source\":\"explicit-user\",\"statement\":\"Script host canonical chạy trọn pass trong một process; consumer tự tính lại từ Git và nội dung hiện tại; receipt chỉ là chỉ mục\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-009\",\"TASK-010\",\"TASK-011\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-003\",\"AC-009\"],\"id\":\"D-005\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Rollback khi có edit đồng thời?\",\"rationale\":\"User chọn phương án 1 ở quyết định 5/5.\",\"scope\":\"repository\",\"selected_value\":\"Rollback theo scope, liệt kê và giữ edit đồng thời, bắt baseline mới; chạm path của pass thì chặn\",\"source\":\"explicit-user\",\"statement\":\"Rollback theo scope, liệt kê và giữ edit đồng thời, bắt baseline mới; chạm path của pass thì chặn\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-009\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-001\",\"R-002\",\"R-003\",\"R-004\",\"R-005\",\"R-006\",\"R-007\",\"R-008\"],\"id\":\"D-006\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Scope repair?\",\"rationale\":\"User chọn phương án 4.\",\"scope\":\"repository\",\"selected_value\":\"Toàn bộ finding đã confirmed của audit bước 6; mục NV nằm ngoài scope\",\"source\":\"explicit-user\",\"statement\":\"Toàn bộ finding đã confirmed của audit bước 6; mục NV nằm ngoài scope\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-006\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-002\",\"R-005\",\"R-006\",\"R-007\",\"R-008\",\"AC-004\",\"AC-006\",\"AC-014\",\"AC-016\",\"AC-020\",\"AC-021\"],\"id\":\"D-007\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Mặc định cho các finding có hướng sửa rõ?\",\"rationale\":\"Đề xuất trong spec; chốt khi user duyệt spec.\",\"scope\":\"repository\",\"selected_value\":\"IF-2: phase là khóa receipt; IF-3: luôn hỏi finish:policy; IF-4: resolveAction nhận failed_surfaces; UR-4: allowlist gate canonical; DH-2: thu hẹp tài liệu về html/svg; G-1: loader chịu đúng một dòng trống phân cách; ST-3: thêm test parity và ghi hiệu chỉnh, không đổi schema\",\"source\":\"approved-spec\",\"statement\":\"IF-2: phase là khóa receipt; IF-3: luôn hỏi finish:policy; IF-4: resolveAction nhận failed_surfaces; UR-4: allowlist gate canonical; DH-2: thu hẹp tài liệu về html/svg; G-1: loader chịu đúng một dòng trống phân cách; ST-3: thêm test parity và ghi hiệu chỉnh, không đổi schema\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-001\",\"TASK-007\",\"TASK-012\",\"TASK-013\",\"TASK-015\",\"TASK-017\"],\"type\":\"decision\"},{\"blocking\":false,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-009\",\"AC-022\"],\"id\":\"D-008\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Cách giao?\",\"rationale\":\"Đề xuất trong spec; chốt khi user duyệt spec.\",\"scope\":\"repository\",\"selected_value\":\"Một contract, ba workstream tuần tự: A observer/simplify/finish, B UI review và Design, C structure/test/loader; TDD regression-first\",\"source\":\"approved-spec\",\"statement\":\"Một contract, ba workstream tuần tự: A observer/simplify/finish, B UI review và Design, C structure/test/loader; TDD regression-first\",\"status\":\"superseded\",\"supersedes\":null,\"task_refs\":[\"TASK-007\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-005\",\"AC-014\"],\"id\":\"D-009\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Diễn giải AC-014 (claim runtime trong finding source-only)?\",\"rationale\":\"User chọn phương án 1 cho BLOCKER 4 của review architecture ngày 2026-09-28.\",\"scope\":\"repository\",\"selected_value\":\"Bảo đảm cấu trúc + rule đóng theo lexicon; ghi thành decision trong plan\",\"source\":\"explicit-user\",\"statement\":\"Bảo đảm cấu trúc (prose không bao giờ là evidence; trạng thái runtime chỉ từ receipt) cộng rule đóng theo cấu trúc câu và lexicon canonical là lớp chặn bắt buộc; câu né toàn bộ lexicon không bị rule bắt nhưng không bao giờ được tính là evidence; không sửa approved spec.\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-004\",\"TASK-015\",\"TASK-016\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-008\",\"R-009\",\"AC-021\",\"AC-022\",\"R-001\",\"R-002\",\"R-003\",\"R-004\",\"R-005\",\"R-006\",\"R-007\",\"AC-001\",\"AC-002\",\"AC-003\",\"AC-004\",\"AC-005\",\"AC-006\",\"AC-007\",\"AC-008\",\"AC-009\",\"AC-010\",\"AC-011\",\"AC-012\",\"AC-013\",\"AC-014\",\"AC-015\",\"AC-016\",\"AC-017\",\"AC-018\",\"AC-019\",\"AC-020\",\"INV-001\",\"INV-002\",\"INV-003\",\"INV-004\"],\"id\":\"D-010\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Cách giao sau refinement của architecture?\",\"rationale\":\"Refinement của D-008 được nêu rõ tại approval gate architecture và user duyệt bằng reply 1.\",\"scope\":\"repository\",\"selected_value\":\"Một contract, A (loader trước) → B → C, TDD regression-first\",\"source\":\"approved-architecture\",\"statement\":\"Một contract, ba workstream tuần tự A → B → C; loader (G-1) là unit đầu của workstream A vì host runner phụ thuộc; TDD regression-first; scope và coverage không đổi.\",\"status\":\"approved\",\"supersedes\":\"D-008\",\"task_refs\":[\"TASK-007\",\"TASK-021\",\"TASK-022\",\"TASK-023\"],\"type\":\"decision\",\"validation_boundary\":{\"kind\":\"none\",\"source_refs\":[\"R-001\",\"R-002\",\"R-003\",\"R-004\",\"R-005\",\"R-006\",\"R-007\",\"R-008\",\"R-009\",\"AC-001\",\"AC-002\",\"AC-003\",\"AC-004\",\"AC-005\",\"AC-006\",\"AC-007\",\"AC-008\",\"AC-009\",\"AC-010\",\"AC-011\",\"AC-012\",\"AC-013\",\"AC-014\",\"AC-015\",\"AC-016\",\"AC-017\",\"AC-018\",\"AC-019\",\"AC-020\",\"AC-021\",\"AC-022\",\"INV-001\",\"INV-002\",\"INV-003\",\"INV-004\"]}},{\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-003\",\"EVIDENCE-006\",\"EVIDENCE-008\",\"EVIDENCE-009\",\"EVIDENCE-010\",\"EVIDENCE-011\",\"EVIDENCE-013\",\"EVIDENCE-017\",\"EVIDENCE-023\"],\"id\":\"INV-001\",\"protected_refs\":[\"R-001\",\"R-002\",\"R-003\",\"R-004\",\"AC-002\",\"AC-003\",\"AC-010\",\"AC-011\"],\"statement\":\"Authority vẫn fail-closed: không có quyền ghi khi thiếu approved scope; mọi negative path đã có từ bước 1–4 vẫn bị chặn.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-003\",\"TASK-006\",\"TASK-008\",\"TASK-009\",\"TASK-010\",\"TASK-011\",\"TASK-013\",\"TASK-017\",\"TASK-023\"],\"type\":\"invariant\"},{\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-006\",\"EVIDENCE-008\",\"EVIDENCE-012\",\"EVIDENCE-014\",\"EVIDENCE-015\",\"EVIDENCE-017\",\"EVIDENCE-018\",\"EVIDENCE-023\"],\"id\":\"INV-002\",\"protected_refs\":[\"R-001\",\"R-002\",\"R-005\",\"R-006\",\"AC-001\",\"AC-004\",\"AC-012\",\"AC-015\"],\"statement\":\"Positive path tới được: input hợp lệ trên repository kích thước thật hội tụ tới kết quả đúng.\",\"task_refs\":[\"TASK-001\",\"TASK-004\",\"TASK-005\",\"TASK-006\",\"TASK-008\",\"TASK-012\",\"TASK-014\",\"TASK-015\",\"TASK-017\",\"TASK-018\",\"TASK-023\"],\"type\":\"invariant\"},{\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-009\",\"EVIDENCE-010\",\"EVIDENCE-011\",\"EVIDENCE-012\",\"EVIDENCE-015\",\"EVIDENCE-020\",\"EVIDENCE-022\",\"EVIDENCE-023\"],\"id\":\"INV-003\",\"protected_refs\":[\"R-003\",\"R-005\",\"R-007\",\"R-009\",\"AC-005\",\"AC-007\",\"AC-013\",\"AC-019\",\"AC-022\"],\"statement\":\"Evidence trung thực: thiếu khác fail khác pass; không check chưa chạy nào được báo verified; test không bị nới.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-009\",\"TASK-010\",\"TASK-011\",\"TASK-012\",\"TASK-015\",\"TASK-020\",\"TASK-022\",\"TASK-023\"],\"type\":\"invariant\"},{\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-007\",\"EVIDENCE-022\",\"EVIDENCE-023\"],\"id\":\"INV-004\",\"protected_refs\":[\"R-008\",\"R-009\",\"AC-021\"],\"statement\":\"Lịch sử bất biến: approved snapshot và evidence record cũ không bị sửa.\",\"task_refs\":[\"TASK-001\",\"TASK-007\",\"TASK-022\",\"TASK-023\"],\"type\":\"invariant\"}],\"revision\":2,\"schema_version\":1}\n"
}
```

## Decisions captured during review
- (approved as drafted)
- `approved_plan_hash` is the runtime compatibility projection of `approval_hash`; it is not stored in frontmatter because the helper excludes only the self-referential `approval_hash`.

## Skill provenance
sdcorejs-plan (approved on attempt 1 / 3)
