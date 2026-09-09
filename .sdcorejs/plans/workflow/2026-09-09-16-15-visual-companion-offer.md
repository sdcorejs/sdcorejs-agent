---
allowed_paths:
  - test/e2e/visual-offer-policy.test.mjs
  - test/e2e/visual-offer-behavior.test.mjs
  - test/e2e/fixtures/visual-offer-scenarios.json
  - test/e2e/support/visual-offer-eval-runner.mjs
  - scripts/eval-visual-offer.mjs
  - authoring/evals/visual-offer/README.md
  - test/e2e/harness-behavioral-sentinel.test.mjs
  - test/e2e/support/harness-behavior-runner.mjs
  - test/e2e/support/cli-adapters.mjs
  - _refs/sdlc/visual-offer-policy.md
  - _refs/harness/runtime-policy.mjs
  - _refs/harness/runtime-attestation.mjs
  - _refs/harness/runtime-attestation.md
  - _refs/harness/capability-contract.json
  - skills/orchestration/using-skills.md
  - skills/shared/sdlc/01-brainstorming.md
  - skills/tracks/design/sdcorejs-design.md
  - skills/tracks/angular/sdcorejs-angular.md
  - skills/tracks/nextjs/sdcorejs-nextjs.md
  - skills/shared/sdlc/04-execute-plan.md
  - skills/shared/sdlc/02-spec.md
  - skills/shared/sdlc/03-plan.md
  - _refs/shared/runtime-protocols.md
  - _refs/shared/user-choice-prompt.md
  - _refs/sdlc/visual-companion.md
  - _refs/shared/project-context.md
  - AGENTS.md
  - CLAUDE.md
  - .github/copilot-instructions.md
  - README.md
  - authoring/README.md
  - package.json
  - authoring/evals/visual-offer/baseline.json
  - authoring/evals/visual-offer/candidate.json
  - authoring/evals/visual-offer/records.json
  - .sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-delivery.md
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
approval_evidence: User replied "Duyệt" to the pending implementation plan approval gate.
approval_source: explicit-user-choice
approved_architecture_hash: null
approved_architecture_reference: null
approved_at: 2026-09-09T09:52:41.714Z
approved_by: user
approved_spec_hash: sha256:v1:dda50970e9452383cb14f812f387063eec12ca2389154f17d81b5dfdcdc1c8e2
approved_spec_reference:
  approval_hash: sha256:v1:dda50970e9452383cb14f812f387063eec12ca2389154f17d81b5dfdcdc1c8e2
  artifact_id: spec-visual-companion-offer-r1
  repository_id: github.com/sdcorejs/sdcorejs-agent
  repository_relative_path: .sdcorejs/specs/workflow/2026-09-09-16-06-visual-companion-offer.md
  revision: 1e74140592794bc64bd6d955d89dd4a83e390bcb
artifact_id: plan-visual-companion-offer-r1
artifact_kind: plan
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: visual-companion-offer
commit_policy: with-change
contract_id: visual-companion-offer
dependency_changes:
  approval_required: false
  packages: []
  required: false
dependency_order:
  - TASK-001
  - TASK-002
  - TASK-003
  - TASK-004
  - TASK-005
  - TASK-006
  - TASK-007
description: Sequential implementation of proactive visual offers and scoped
  state, routing, natural-language evals and mirrors.
env_changes:
  approval_required: false
  files: []
  required: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
gitlink_updates_in_scope: false
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
migration_changes:
  approval_required: false
  description: null
  required: false
name: visual-companion-offer
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:dda50970e9452383cb14f812f387063eec12ca2389154f17d81b5dfdcdc1c8e2
    artifact_id: spec-visual-companion-offer-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 1e74140592794bc64bd6d955d89dd4a83e390bcb
parent_repository_id: github.com/sdcorejs/sdcorejs-agent
phase_count: 4
prohibited_paths:
  - "**/.env"
  - "**/.env.*"
  - "**/node_modules/**"
  - package-lock.json
  - site/**
  - authoring/skills/**
  - authoring/evals/live-agent-matrix.json
  - .sdcorejs/conventions/**
  - .sdcorejs/summary.md
  - .sdcorejs/specs/**
  - .sdcorejs/plans/**
  - .sdcorejs/tasks/current-session.md
  - .sdcorejs/tasks/sessions/**
repository_relative_path: .sdcorejs/plans/workflow/2026-09-09-16-15-visual-companion-offer.md
requirement_id: visual-companion-offer-user-request
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-plan.md
sourceSpecPath: .sdcorejs/specs/workflow/2026-09-09-16-06-visual-companion-offer.md
source_architecture: none
source_plan: none
source_revision: 1e74140592794bc64bd6d955d89dd4a83e390bcb
source_spec: .sdcorejs/specs/workflow/2026-09-09-16-06-visual-companion-offer.md
stack_profile: node-esm
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
task_count: 7
track: workflow
verification_strategy:
  commands_planned:
    - npm run test:e2e:harness
    - npm run test:e2e:skill-authoring
    - node authoring/evals/run-deterministic.mjs
    - npm run test:e2e:repository
    - npm run check:text-hygiene
    - npm run check:executable-references
    - npm run sync:skills
    - npm run check:skills
    - node --test test/e2e/visual-offer-policy.test.mjs
      test/e2e/visual-offer-behavior.test.mjs
  commands_skipped:
    - command: golden/container app suites
      reason: No application templates, dependency, transport or database changes
        planned; expand only if actual diff requires.
    - command: site build/publish
      reason: No site source changes or publishing scope.
  evidence: packageManager npm@10.9.2 and package-lock.json; inspected
    package.json scripts.
  live_evaluation:
    missing_runtime_policy: Complete runner/scenarios and record exact NOT RUN
      reason; never claim live reliability.
    model_effort_policy: Preserve the same available session defaults for baseline
      and candidate; do not select an alternate model or effort without existing
      authorization.
    scope: Available existing CLI; isolated scenario inputs and actual transcript
      receipts; baseline/candidate comparable.
    source_revision: 1e74140592794bc64bd6d955d89dd4a83e390bcb
  new_scripts_owned_by: TASK-005
  package_manager: npm
approval_hash: sha256:v1:dc56279dee592f15061a437e00bc4120b0ec7e87b53ca0807ccc065cd553a719
---
# Chủ động mời Visual Companion - Approved Plan

> Snapshot của plan đã được user duyệt. Prose mô tả draft được giữ như lịch sử; approved metadata và context dưới đây là nguồn authority.

## Approved contract

# Plan - Chủ động mời Visual Companion - 2026-09-09 16:15

## Scope

Triển khai spec đã duyệt tại
`.sdcorejs/specs/workflow/2026-09-09-16-06-visual-companion-offer.md`, hash
`sha256:v1:dda50970e9452383cb14f812f387063eec12ca2389154f17d81b5dfdcdc1c8e2`.
Plan này chỉ xác định cách làm, file, thứ tự và bằng chứng; R-001..R-006 và
AC-001..AC-016 trong approved spec giữ nguyên.

## Execution context

- Track `workflow`, profile `node-esm`; target và semantic owner là `github.com/sdcorejs/sdcorejs-agent`.
- Thực thi tuần tự trong checkout hiện tại bằng `sdcorejs-execute-plan` và generic harness. Không cần subagent hoặc worktree để triển khai các file chia sẻ chặt chẽ này.
- TDD cho policy/regression; baseline behavioral trước khi sửa canonical source, candidate behavioral sau khi tích hợp. Không gọi một test gán sẵn visual flags là behavioral evidence.
- Architecture `not-applicable` giữ nguyên classifier result của spec; public CLI/transport/screen contract, state owner, trust boundary và dependency direction không thay đổi.
- Không đổi dependency, lockfile, env hoặc migration. `package.json` chỉ được sửa scripts của test/eval, giữ version và dependency fields.
- Live A/B dùng CLI sẵn có theo yêu cầu user; các lượt đánh giá là hội thoại thử nghiệm cô lập, không phải delegated implementation. Không cài provider SDK hoặc đọc credential values.

## Preflight

Trước source edits, đọc `git status --short`, staged/unstaged diffstat,
untracked files, current branch và HEAD. So scope với `allowed_paths` và
`prohibited_paths`; bảo toàn thay đổi ngoài task. Các draft/approved artifacts
cùng `change_ref` là thay đổi đã biết. Nếu có xung đột ngoài scope thì dừng
đúng thao tác phụ thuộc; tiếp tục phần độc lập khi có thể.

Baseline source revision là `1e74140592794bc64bd6d955d89dd4a83e390bcb`.
Node hiện tại `v22.14.0` không thỏa engine repo. Tìm runtime hỗ trợ đã có;
nếu cần, có thể tải bản Node 22 chính thức đáp ứng engine vào thư mục tạm
riêng phục vụ kiểm thử, kiểm tra checksum, không cài toàn cục hoặc sửa PATH
hệ thống. Ghi chính xác runtime dùng cho từng lượt. Standalone companion có
ngoại lệ compatibility riêng trong README; không áp ngoại lệ đó cho toàn repo.

## Thiết kế triển khai

Giữ `shouldOfferVisual`, `selectInteraction`, `resolveVisualCompanionPlan`
là các entrypoint hiện có. Bổ sung helper thuần trong `runtime-policy.mjs`
để đánh giá structured decision và cập nhật context theo phản hồi rõ ràng.
`shouldOfferVisual` trở thành projection boolean từ kết quả đánh giá; chỉ có
`visual_spatial=true` không đủ để chủ động mời. Không triển khai keyword
classifier. Các caller hiện có được cập nhật và kiểm thử cùng thay đổi.

Structured decision phải có identity, visual-thread identity, tình trạng
đã chốt/còn mở, việc user có cần chọn, các phương án hợp lệ và lý do visual
hữu ích. Kết quả phân biệt `offer`, `present`, `wait`, `continue-text`, đồng
thời giữ lý do và trạng thái tương ứng trong `visual_companion`.

Mở rộng context hiện có bằng các nhóm nhỏ: assessment của decision hiện tại;
response records theo scope `decision`, `visual-thread`, `session`; consent
runtime/browser theo purpose/scope; selected surface và fallback reason.
Response record cùng scope được cập nhật, không tích lũy event log. Identity
không phụ thuộc tên skill, phase hoặc wording. Quyết định chưa đánh giá khác
với đã đánh giá không phù hợp; pending/accepted/declined khác nhau rõ ràng.

Decline rộng vẫn hiệu lực khi chuyển skill. Yêu cầu chủ động bật lại ở scope
hẹp chỉ cho phép scope đó, không xóa decline session cho các thread khác.
Không có scope/evidence đủ rõ thì không suy diễn consent. Direct mockup
request bỏ qua lời mời nhu cầu, nhưng không tự cấp runtime/browser side effects.

Một resolver chung chọn surface và xử lý `failed_surfaces`, được các
entrypoint hiện có dùng lại. Live chỉ khả dụng khi capability và consent
runtime đều đủ; browser consent chỉ chi phối auto-open. Fallback lần lượt
native visual, static HTML, numbered Markdown. Nếu visual không khả dụng,
native text picker không được mô tả như visual preview. Text/approval đi
theo native structured choice rồi Markdown.

Attestation visual mở rộng helper hiện có bằng optional observation group,
giữ projection orchestration tương thích. Khi group không có evidence,
visual capability vẫn `unknown`; khi có thì validate status/source/detail.
Không nâng adapter default thành capability đã quan sát. Các test hiện có
cho delegation/worktree phải tiếp tục pass.

## Tasks

### Phase 1 - Regression và baseline

1. **TASK-001 — CREATE/EDIT test và eval harness.**
   Tạo `test/e2e/visual-offer-policy.test.mjs`,
   `test/e2e/visual-offer-behavior.test.mjs`,
   `test/e2e/fixtures/visual-offer-scenarios.json`,
   `test/e2e/support/visual-offer-eval-runner.mjs`,
   `scripts/eval-visual-offer.mjs`,
   `authoring/evals/visual-offer/README.md`.
   Sửa `test/e2e/harness-behavioral-sentinel.test.mjs`,
   `test/e2e/support/harness-behavior-runner.mjs` và CLI adapter khi cần để
   reuse harness. Tái hiện accepted/pending/decline lặp, direct request,
   negative controls, consent reuse, fallback và attestation trước policy edits.
   Eval runner có dry-run/offline validation, explicit live invocation,
   baseline/candidate source roots, multi-turn driver, timeout và output limits.
   Khởi chạy baseline với canonical sources tại revision đã nêu trước TASK-002;
   giữ baseline chạy thật hoặc NOT RUN đúng lý do cho TASK-007.

### Phase 2 - Policy và tích hợp

2. **TASK-002 — CREATE shared policy, EDIT runtime.**
   Tạo `_refs/sdlc/visual-offer-policy.md`; sửa
   `_refs/harness/runtime-policy.mjs`,
   `_refs/harness/runtime-attestation.mjs`,
   `_refs/harness/runtime-attestation.md` và
   `_refs/harness/capability-contract.json`.
   Shared ref là canonical owner của nhận diện/offer; helper là implementation
   của state/routing. Thực hiện thiết kế nêu trên, giữ permission boundaries
   và fail closed với dữ liệu thiếu hoặc sai. Chạy lại regression TASK-001.

3. **TASK-003 — EDIT skill consumers.**
   Sửa `skills/orchestration/using-skills.md`,
   `skills/shared/sdlc/01-brainstorming.md`,
   `skills/tracks/design/sdcorejs-design.md`,
   `skills/tracks/angular/sdcorejs-angular.md`,
   `skills/tracks/nextjs/sdcorejs-nextjs.md`,
   `skills/shared/sdlc/04-execute-plan.md`,
   `skills/shared/sdlc/02-spec.md`,
   `skills/shared/sdlc/03-plan.md`.
   Thêm checkpoint ngắn trước open decision, dùng shared policy và giữ context
   qua handoff. Spec/plan chỉ bảo toàn state; không mở lại quyết định đã duyệt.
   Xóa phần guidance lặp của Brainstorming và wording text-only gắn với TDD.
   Executor trả unresolved decision về owner phù hợp, không bypass gates.

4. **TASK-004 — EDIT shared protocols và entrypoints.**
   Sửa `_refs/shared/runtime-protocols.md`,
   `_refs/shared/user-choice-prompt.md`,
   `_refs/sdlc/visual-companion.md`,
   `_refs/shared/project-context.md`, `AGENTS.md`, `CLAUDE.md` và
   `.github/copilot-instructions.md`.
   Tách policy nhận diện khỏi runtime guide; thống nhất consent reuse, scoped
   decline, surface ladder, unknown fallback và written-reply authority.
   Shared choice protocol bảo đảm workflow khác có quyết định flow/diagram
   cũng đến đúng policy mà không cần nhồi guide vào mỗi skill.

5. **TASK-005 — EDIT documentation và test scripts.**
   Sửa `README.md`, `authoring/README.md`, `package.json`.
   Docs có ví dụ thực tế và cách user yêu cầu so sánh mockup/bật lại companion;
   source reusable dùng English, localization fixtures có thể dùng tiếng Việt.
   Thêm script `test:e2e:visual-offer` cho hai test mới và tích hợp chúng vào
   repository suite; thêm `eval:visual-offer` trỏ runner TASK-001.
   Không sửa dependency fields/version, không thay live matrix cũ không cùng scope.

### Phase 3 - Distribution

6. **TASK-006 — GENERATE mirrors bằng sync hiện có.**
   Chạy `npm run sync:skills`, sau đó `npm run check:skills`.
   Chỉ sinh các mirrors quy định trong `MIRROR_POLICY.md`; không sửa tay.
   Kiểm tra 23 public skills, internal authoring không lọt vào distribution.
   Review source và generated diffs cùng nhau. Nếu sửa canonical sau đó,
   chạy lại task này trước validation cuối.

### Phase 4 - Bằng chứng và bàn giao

7. **TASK-007 — RUN evaluation/verification, CREATE evidence và delivery doc.**
   Chạy candidate cùng baseline với model/effort/runtime, scenarios, capability
   fixtures và cách load skill tương đương. Giữ source/contract hashes,
   receipts và transcript đã lọc thông tin nhạy cảm tại
   `authoring/evals/visual-offer/baseline.json`,
   `authoring/evals/visual-offer/candidate.json`,
   `authoring/evals/visual-offer/records.json`.
   Khi không chạy được, record có `NOT RUN`, lý do, transcript/token null;
   không tạo transcript rỗng hoặc giả như đã chạy. Raw logs và temporary
   checkout/runtime state chỉ ở thư mục tạm, không đưa vào durable artifacts.
   Tạo `.sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-delivery.md`
   với nguyên nhân, thay đổi, evidence từng AC, ví dụ minh họa được gắn nhãn,
   commands và mọi giới hạn còn lại. Review, sửa finding có bằng chứng trong
   scope task sở hữu file, rerun test bị ảnh hưởng, rồi hoàn tất docs/mirrors.
   Cuối cùng chạy verify-before-done, convergence và read-only branch-ready;
   không có write sau branch-ready. Không tạo Git artifact.

Mọi mutable task thuộc một owner `github.com/sdcorejs/sdcorejs-agent`, Git
root là checkout được resolve từ identity này. Mỗi file có một task owner;
review repair quay về task owner đó, không tạo quyền ghi ngoài plan.

## Behavioral evidence contract

Scenarios tối thiểu gồm đủ 12 case trong spec, thêm keyword-only, user-delegated,
one-option, pending-offer, session-decline và scoped-reenable controls.
Prompt natural-language và lượt user là input; expected behavior và semantic
flags chỉ dành cho evaluator, tuyệt đối không được chèn vào prompt của agent.
Capability fixtures mô tả surface/runtime thực tế hoặc tình huống mô phỏng,
không nói agent phải offer. Kết quả mô phỏng được phân biệt với surface thật.

Runner tiếp tục cuộc hội thoại thật qua session/resume hoặc đầy đủ lịch sử
thực có provenance; không ghép assistant reply viết sẵn. Follow-up chỉ gửi
khi precondition của scenario xuất hiện; lệch nhánh được ghi failure hoặc
inconclusive, không sửa transcript để khớp. Browser click fixture chỉ kiểm
supporting-feedback boundary, không giả định browser thật đã được mở.

Report có số mẫu và mẫu số riêng cho correct offer, missed offer, false offer,
duplicate offer, preview-request redundant question, fallback và approval
boundary. Xuất số đếm cùng tỷ lệ; unmatched/incomplete turns không bị loại
khỏi report một cách im lặng. Rule-based scoring chỉ là hỗ trợ tìm đoạn cần
review; người review xem nội dung và tool events thực. Token chỉ ghi khi
provider cung cấp. Không tuyên bố độ tin cậy rộng từ một lần chạy mẫu nhỏ.

## Verification

Commands có sẵn được xác minh từ `package.json`:

- `npm run test:e2e:harness`
- `npm run test:e2e:skill-authoring`
- `node authoring/evals/run-deterministic.mjs`
- `npm run test:e2e:repository`
- `npm run check:text-hygiene`
- `npm run check:executable-references`
- `npm run sync:skills`
- `npm run check:skills`

Commands mới được khai báo rõ trong TASK-005, chỉ chạy sau khi được tạo:

- `npm run test:e2e:visual-offer`
- `npm run eval:visual-offer -- --help` và dry-run theo runner được document.
- Live A/B dùng argument arrays với baseline/candidate roots và output paths
  được validate; ghi lệnh thực, không nội suy shell từ nội dung scenario.

Không chạy container/golden app suites chỉ vì tồn tại: scope không đổi app
templates, transport hoặc dependency. Mở rộng kiểm thử nếu có thay đổi hoặc
finding cụ thể chạm các bề mặt đó. Không build/publish site vì không sửa site.

## Approval và self-review

Plan còn chờ user duyệt. Approval spec không phải approval các task/mapping
của plan. `decision_coverage` giữ lịch sử spec và thêm task/evidence mappings
ở revision kế tiếp; validation boundary nêu rõ không thay server/API
authorization. Consent/gate discipline vẫn được test ở policy và agent layer,
authentication/event authority hiện có vẫn nằm trong companion runtime suite.

Chạy decision coverage, goal-backward, repository ownership/path và draft
architecture validators trước khi trình plan. Validation-map kiểm tra đầy đủ
rows ngay ở draft; phần cryptographic approval binding của mappings mới chỉ
được tạo sau phản hồi duyệt plan thực tế. Không tạo `user-approved` receipt
giả để cho validator xanh trước approval. Sau approval, tạo/verify binding,
assert toàn bộ validation map, rồi mới tạo approved-plan snapshot và handoff
cho execute-plan. Không có thay đổi implementation trước gate này.

## Acceptance mapping

- AC-001 → TASK-001, TASK-003, TASK-007; EVIDENCE-001, EVIDENCE-003, EVIDENCE-007
- AC-002 → TASK-001, TASK-003, TASK-007; EVIDENCE-001, EVIDENCE-003, EVIDENCE-007
- AC-003 → TASK-001, TASK-003, TASK-007; EVIDENCE-001, EVIDENCE-003, EVIDENCE-007
- AC-004 → TASK-001, TASK-002, TASK-003, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-002, EVIDENCE-003, EVIDENCE-004, EVIDENCE-007
- AC-005 → TASK-001, TASK-002, TASK-003, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-002, EVIDENCE-003, EVIDENCE-004, EVIDENCE-007
- AC-006 → TASK-001, TASK-003, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-003, EVIDENCE-004, EVIDENCE-007
- AC-007 → TASK-001, TASK-003, TASK-007; EVIDENCE-001, EVIDENCE-003, EVIDENCE-007
- AC-008 → TASK-001, TASK-002, TASK-003, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-002, EVIDENCE-003, EVIDENCE-004, EVIDENCE-007
- AC-009 → TASK-001, TASK-002, TASK-003, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-002, EVIDENCE-003, EVIDENCE-004, EVIDENCE-007
- AC-010 → TASK-001, TASK-002, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-002, EVIDENCE-004, EVIDENCE-007
- AC-011 → TASK-001, TASK-002, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-002, EVIDENCE-004, EVIDENCE-007
- AC-012 → TASK-001, TASK-002, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-002, EVIDENCE-004, EVIDENCE-007
- AC-013 → TASK-001, TASK-002, TASK-003, TASK-004, TASK-007; EVIDENCE-001, EVIDENCE-002, EVIDENCE-003, EVIDENCE-004, EVIDENCE-007
- AC-014 → TASK-001, TASK-005, TASK-007; EVIDENCE-001, EVIDENCE-005, EVIDENCE-007
- AC-015 → TASK-005, TASK-006, TASK-007; EVIDENCE-005, EVIDENCE-006, EVIDENCE-007
- AC-016 → TASK-007; EVIDENCE-007

## Typed plan context

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: bounded-bug-fix
      rationale: Repair existing offer and surface policy inconsistencies using the same runtime, context owner, CLI and event
        contracts; add no service, persisted model, dependency direction or trust boundary.
    rationale: Repair existing offer and surface policy inconsistencies using the same runtime, context owner, CLI and event
      contracts; add no service, persisted model, dependency direction or trust boundary.
  architecture_context: null
  decision_coverage: &a2
    schema_version: 1
    revision: 2
    records:
      - id: R-001
        type: requirement
        statement: "Đánh giá ý nghĩa của quyết định trước khi đưa phương án hoặc tự chốt: quyết định còn mở cần user chọn, ít
          nhất hai phương án hợp lệ có khác biệt đáng kể, visual giúp hiểu lựa chọn, sở thích/consent hiện có và khả
          năng trình bày thực tế."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: R-002
        type: requirement
        statement: Load policy ngắn dùng chung đúng lúc ở Brainstorming, Design direct entry và chủ sở hữu quyết định phù hợp.
          Executor trả quyết định chưa rõ về đúng workflow; không mở lại thiết kế đã duyệt.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-006
          - EVIDENCE-007
      - id: R-003
        type: requirement
        statement: Giữ decision identity, visual-thread identity, evaluation/offer/response state và phạm vi consent/decline qua
          handoff trong context hiện có. Không tạo checkpoint.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: R-004
        type: requirement
        statement: Thống nhất thang surface, reuse consent đúng phạm vi, fallback trung thực và quyền quyết định bằng hội thoại.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: R-005
        type: requirement
        statement: Có regression cho policy, routing, trạng thái, consent và fallback; có scenarios/runner nhiều lượt từ prompt
          tự nhiên để đánh giá agent thật tách biệt deterministic tests.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-005
          - EVIDENCE-007
      - id: R-006
        type: requirement
        statement: Cập nhật canonical sources, documentation, mirrors và validation; giữ 23 public skills, source dùng lại bằng
          tiếng Anh, runtime theo ngôn ngữ user.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
      - id: AC-001
        type: acceptance-criterion
        statement: Sidebar ba cấp, chưa rõ navigation
        behavior: Sidebar ba cấp, chưa rõ navigation
        expected_result: Xác định phương án đáng so sánh rồi offer trước khi tự chốt; prompt không cần tên companion.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-007
      - id: AC-002
        type: acceptance-criterion
        statement: sd-table mobile thành card, chưa rõ selection/action
        behavior: sd-table mobile thành card, chưa rõ selection/action
        expected_result: Offer mockup so sánh trước quyết định bố trí.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-007
      - id: AC-003
        type: acceptance-criterion
        statement: Direct entry Design, layout chưa rõ
        behavior: Direct entry Design, layout chưa rõ
        expected_result: Cùng policy và timing như Brainstorming.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-007
      - id: AC-004
        type: acceptance-criterion
        statement: User đã yêu cầu hai mockup hoặc đã accepted/pending
        behavior: User đã yêu cầu hai mockup hoặc đã accepted/pending
        expected_result: Không hỏi lại nhu cầu; reuse consent đúng scope, chỉ hỏi side effect thực sự chưa được cấp khi cần.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
          - R-004
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-005
        type: acceptance-criterion
        statement: Rename input, spacing có giá trị, typo, keyword-only UI/design/Angular/diagram, một phương án hợp lệ, hoặc
          agent được giao tự quyết
        behavior: Rename input, spacing có giá trị, typo, keyword-only UI/design/Angular/diagram, một phương án hợp lệ, hoặc
          agent được giao tự quyết
        expected_result: Không offer và không bịa lựa chọn.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-006
        type: acceptance-criterion
        statement: Triển khai layout đã approved; hoặc executor phát hiện quyết định còn mở
        behavior: Triển khai layout đã approved; hoặc executor phát hiện quyết định còn mở
        expected_result: Không mở lại approved choice; unresolved choice trở về đúng workflow owner với state giữ nguyên.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
          - R-003
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-007
        type: acceptance-criterion
        statement: Yêu cầu lẫn nghiệp vụ và UI
        behavior: Yêu cầu lẫn nghiệp vụ và UI
        expected_result: Làm rõ blocker ảnh hưởng option set trước, offer đúng quyết định visual về sau; không offer chỉ từ UI keyword.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-007
      - id: AC-008
        type: acceptance-criterion
        statement: Decline rồi đổi skill/phase/wording hoặc decision trong cùng visual thread; decline toàn session
        behavior: Decline rồi đổi skill/phase/wording hoặc decision trong cùng visual thread; decline toàn session
        expected_result: Không lặp offer trong scope bị từ chối.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-009
        type: acceptance-criterion
        statement: User chủ động bật visual lại
        behavior: User chủ động bật visual lại
        expected_result: Tiếp tục trong scope yêu cầu mới, bảo toàn decline rộng hơn còn hiệu lực và không tự cấp
          runtime/browser consent.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
          - R-004
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-010
        type: acceptance-criterion
        statement: Native structured choice và visual cùng supported
        behavior: Native structured choice và visual cùng supported
        expected_result: Preview theo visual ladder; text/approval theo text ladder; consent thiếu không chọn live như đã được phép.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-011
        type: acceptance-criterion
        statement: Live lỗi, thiếu capability, browser auto-open unknown, hoặc không có visual surface
        behavior: Live lỗi, thiếu capability, browser auto-open unknown, hoặc không có visual surface
        expected_result: Native visual → static → numbered Markdown theo khả năng; giữ decision/options; không offer chức năng
          bất khả dụng hoặc mất visual chỉ do auto-open unknown.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-012
        type: acceptance-criterion
        statement: Click chọn visual
        behavior: Click chọn visual
        expected_result: Không approve spec/plan/implementation; written reply vẫn authoritative; runtime cleanup và local-only
          boundary được giữ.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-013
        type: acceptance-criterion
        statement: Handoff và consent scope
        behavior: Handoff và consent scope
        expected_result: Phân biệt đủ not-evaluated/not-applicable + reason/pending/accepted/declined/surface/fallback; không
          checkpoint, token hoặc authenticated URL trong durable artifacts.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
          - R-004
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: AC-014
        type: acceptance-criterion
        statement: Behavioral evaluation từ prompt tự nhiên, nhiều lượt
        behavior: Behavioral evaluation từ prompt tự nhiên, nhiều lượt
        expected_result: Hoàn thiện ít nhất 12 scenario trên và negative/pressure controls; runner không nạp expected visual
          flags vào agent; giữ transcript/receipt thực và source/runtime/model metadata; báo tỷ lệ đúng, bỏ sót, offer
          sai, lặp với mẫu số. Nếu chưa chạy được, ghi NOT RUN và lý do, không tạo transcript giả.
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-005
          - EVIDENCE-007
      - id: AC-015
        type: acceptance-criterion
        statement: Canonical/mirror/docs
        behavior: Canonical/mirror/docs
        expected_result: 23 public skills không đổi; sources English-only trừ localization fixtures; runtime output bản địa hóa;
          docs có ví dụ và cách user chủ động yêu cầu; mirror/hygiene/executable-reference checks pass.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
      - id: AC-016
        type: acceptance-criterion
        statement: Review và validation cuối
        behavior: Review và validation cuối
        expected_result: Không còn chỉ dẫn mâu thuẫn giữa policy, choice, companion và helper; affected regressions và
          repository checks pass trên Node hỗ trợ hoặc giới hạn môi trường được báo rõ; live evidence tách khỏi
          deterministic.
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-005
          - R-006
        task_refs:
          - TASK-007
        evidence_refs:
          - EVIDENCE-007
      - id: A-001
        type: assumption
        statement: Live A/B runtime availability remains unverified.
        source: inferred
        confidence: unknown
        status: deferred
        blocking: false
        evidence_refs:
          - BASELINE-CLI-DISCOVERY
        consequence_if_wrong: Deliver the complete runner/scenarios with NOT RUN; do not claim live reliability.
        validation_method: Probe the available CLI and run actual baseline/candidate conversations under equivalent conditions
          during execution.
        owner: integration-owner
        rationale: The user explicitly allows truthful NOT RUN when live execution is unavailable.
        revisit_condition: Before live behavioral evaluation after implementation scope approval.
        impacted_refs:
          - R-005
          - AC-014
      - id: D-001
        type: decision
        statement: Dùng một shared reference ngắn cho nhận diện/offer và executable policy hiện có cho trạng thái/routing. Đây
          là hướng user đã chỉ định; tránh nhân bản và không xây keyword classifier.
        question: Where should offer policy live?
        selected_value: Dùng một shared reference ngắn cho nhận diện/offer và executable policy hiện có cho trạng thái/routing.
          Đây là hướng user đã chỉ định; tránh nhân bản và không xây keyword classifier.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Explicitly specified in the current user attachment; this does not approve the draft spec.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
      - id: D-002
        type: decision
        statement: "Giữ thứ tự visual: live đủ capability và consent → native visual → static HTML → numbered Markdown.
          Text/approval: native structured choice → numbered Markdown. User đã xác định hai thang này."
        question: How should interaction surfaces be selected?
        selected_value: "Giữ thứ tự visual: live đủ capability và consent → native visual → static HTML → numbered Markdown.
          Text/approval: native structured choice → numbered Markdown. User đã xác định hai thang này."
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Explicitly specified in the current user attachment; this does not approve the draft spec.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - AC-010
          - AC-011
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-004
          - EVIDENCE-007
      - id: D-003
        type: decision
        statement: Decline theo visual thread hoặc toàn session vẫn hiệu lực khi đổi skill/phase/wording; chỉ user chủ động bật
          lại được thay đổi. Accepted/pending không tạo lời mời nhu cầu lần hai. User đã xác định quy tắc này.
        question: How should prior user responses survive handoff?
        selected_value: Decline theo visual thread hoặc toàn session vẫn hiệu lực khi đổi skill/phase/wording; chỉ user chủ động
          bật lại được thay đổi. Accepted/pending không tạo lời mời nhu cầu lần hai. User đã xác định quy tắc này.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Explicitly specified in the current user attachment; this does not approve the draft spec.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - AC-004
          - AC-008
          - AC-009
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-007
      - id: D-004
        type: decision
        statement: Giữ runtime, event authority, lifecycle, artifact owner và approval gates hiện có. Live eval chỉ được báo
          theo dữ liệu thực; thiếu khả năng chạy thì hoàn thiện runner/scenarios và báo NOT RUN. User đã chỉ định phạm
          vi này.
        question: Which execution and evidence boundaries must remain?
        selected_value: Giữ runtime, event authority, lifecycle, artifact owner và approval gates hiện có. Live eval chỉ được
          báo theo dữ liệu thực; thiếu khả năng chạy thì hoàn thiện runner/scenarios và báo NOT RUN. User đã chỉ định
          phạm vi này.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Explicitly specified in the current user attachment; this does not approve the draft spec.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a1
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
          - INV-001
          - INV-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
        validation_boundary:
          kind: none
          source_refs: *a1
      - id: INV-001
        type: invariant
        statement: Visual feedback never authorizes implementation or runtime/browser side effects; durable artifacts exclude
          runtime secrets.
        protected_refs:
          - R-004
          - AC-012
          - AC-013
        task_refs:
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-007
      - id: INV-002
        type: invariant
        statement: Keep 23 public skills and the existing runtime/ownership boundaries; load the full runtime only when needed.
        protected_refs:
          - R-002
          - R-006
          - AC-005
          - AC-015
        task_refs:
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-007
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
          - id: A-001
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
            type: decision
          - id: INV-001
            type: invariant
          - id: INV-002
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
          - id: A-001
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
            type: decision
          - id: INV-001
            type: invariant
          - id: INV-002
            type: invariant
        tombstones: []
    approved_artifact:
      metadata:
        allowed_paths:
          - test/e2e/visual-offer-policy.test.mjs
          - test/e2e/visual-offer-behavior.test.mjs
          - test/e2e/fixtures/visual-offer-scenarios.json
          - test/e2e/support/visual-offer-eval-runner.mjs
          - scripts/eval-visual-offer.mjs
          - authoring/evals/visual-offer/README.md
          - test/e2e/harness-behavioral-sentinel.test.mjs
          - test/e2e/support/harness-behavior-runner.mjs
          - test/e2e/support/cli-adapters.mjs
          - _refs/sdlc/visual-offer-policy.md
          - _refs/harness/runtime-policy.mjs
          - _refs/harness/runtime-attestation.mjs
          - _refs/harness/runtime-attestation.md
          - _refs/harness/capability-contract.json
          - skills/orchestration/using-skills.md
          - skills/shared/sdlc/01-brainstorming.md
          - skills/tracks/design/sdcorejs-design.md
          - skills/tracks/angular/sdcorejs-angular.md
          - skills/tracks/nextjs/sdcorejs-nextjs.md
          - skills/shared/sdlc/04-execute-plan.md
          - skills/shared/sdlc/02-spec.md
          - skills/shared/sdlc/03-plan.md
          - _refs/shared/runtime-protocols.md
          - _refs/shared/user-choice-prompt.md
          - _refs/sdlc/visual-companion.md
          - _refs/shared/project-context.md
          - AGENTS.md
          - CLAUDE.md
          - .github/copilot-instructions.md
          - README.md
          - authoring/README.md
          - package.json
          - authoring/evals/visual-offer/baseline.json
          - authoring/evals/visual-offer/candidate.json
          - authoring/evals/visual-offer/records.json
          - .sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-delivery.md
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
        approval_source: user-approved-decision-coverage
        approved_at: 2026-09-09T09:52:41.714Z
        approved_by: user
        artifact_id: decision-coverage-r2
        artifact_kind: plan
        change_ref: visual-companion-offer
        contract_id: decision-coverage:v1
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_repository_role: standalone
        parent_references: []
        parent_repository_id: null
        prohibited_paths:
          - "**/.env"
          - "**/.env.*"
          - "**/node_modules/**"
          - package-lock.json
          - site/**
          - authoring/skills/**
          - authoring/evals/live-agent-matrix.json
          - .sdcorejs/conventions/**
          - .sdcorejs/summary.md
          - .sdcorejs/specs/**
          - .sdcorejs/plans/**
          - .sdcorejs/tasks/current-session.md
          - .sdcorejs/tasks/sessions/**
        repository_relative_path: .sdcorejs/plans/workflow/2026-09-09-16-15-visual-companion-offer.md
        requirement_id: decision-coverage
        schema_version: 1
        source_revision: 1e74140592794bc64bd6d955d89dd4a83e390bcb
        stack_profile: markdown-skill-pack
        supersedes: null
        track: workflow
        approval_hash: sha256:v1:2b689801cc27aaeea6fff35df7061e4c0f80d6603549d607955007471500b25b
      body: |
        {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"AC-011","type":"acceptance-criterion"},{"id":"AC-012","type":"acceptance-criterion"},{"id":"AC-013","type":"acceptance-criterion"},{"id":"AC-014","type":"acceptance-criterion"},{"id":"AC-015","type":"acceptance-criterion"},{"id":"AC-016","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":1,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"AC-011","type":"acceptance-criterion"},{"id":"AC-012","type":"acceptance-criterion"},{"id":"AC-013","type":"acceptance-criterion"},{"id":"AC-014","type":"acceptance-criterion"},{"id":"AC-015","type":"acceptance-criterion"},{"id":"AC-016","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":2,"tombstones":[]}],"records":[{"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Đánh giá ý nghĩa của quyết định trước khi đưa phương án hoặc tự chốt: quyết định còn mở cần user chọn, ít nhất hai phương án hợp lệ có khác biệt đáng kể, visual giúp hiểu lựa chọn, sở thích/consent hiện có và khả năng trình bày thực tế.","status":"active","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"requirement"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-003","EVIDENCE-004","EVIDENCE-006","EVIDENCE-007"],"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Load policy ngắn dùng chung đúng lúc ở Brainstorming, Design direct entry và chủ sở hữu quyết định phù hợp. Executor trả quyết định chưa rõ về đúng workflow; không mở lại thiết kế đã duyệt.","status":"active","task_refs":["TASK-001","TASK-003","TASK-004","TASK-006","TASK-007"],"type":"requirement"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Giữ decision identity, visual-thread identity, evaluation/offer/response state và phạm vi consent/decline qua handoff trong context hiện có. Không tạo checkpoint.","status":"active","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"requirement"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Thống nhất thang surface, reuse consent đúng phạm vi, fallback trung thực và quyền quyết định bằng hội thoại.","status":"active","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"requirement"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-005","EVIDENCE-007"],"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Có regression cho policy, routing, trạng thái, consent và fallback; có scenarios/runner nhiều lượt từ prompt tự nhiên để đánh giá agent thật tách biệt deterministic tests.","status":"active","task_refs":["TASK-001","TASK-005","TASK-007"],"type":"requirement"},{"evidence_refs":["EVIDENCE-004","EVIDENCE-005","EVIDENCE-006","EVIDENCE-007"],"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Cập nhật canonical sources, documentation, mirrors và validation; giữ 23 public skills, source dùng lại bằng tiếng Anh, runtime theo ngôn ngữ user.","status":"active","task_refs":["TASK-004","TASK-005","TASK-006","TASK-007"],"type":"requirement"},{"behavior":"Sidebar ba cấp, chưa rõ navigation","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-003","EVIDENCE-007"],"expected_result":"Xác định phương án đáng so sánh rồi offer trước khi tự chốt; prompt không cần tên companion.","id":"AC-001","requirement_refs":["R-001","R-005"],"statement":"Sidebar ba cấp, chưa rõ navigation","task_refs":["TASK-001","TASK-003","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"sd-table mobile thành card, chưa rõ selection/action","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-003","EVIDENCE-007"],"expected_result":"Offer mockup so sánh trước quyết định bố trí.","id":"AC-002","requirement_refs":["R-001","R-005"],"statement":"sd-table mobile thành card, chưa rõ selection/action","task_refs":["TASK-001","TASK-003","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Direct entry Design, layout chưa rõ","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-003","EVIDENCE-007"],"expected_result":"Cùng policy và timing như Brainstorming.","id":"AC-003","requirement_refs":["R-002","R-005"],"statement":"Direct entry Design, layout chưa rõ","task_refs":["TASK-001","TASK-003","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"User đã yêu cầu hai mockup hoặc đã accepted/pending","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Không hỏi lại nhu cầu; reuse consent đúng scope, chỉ hỏi side effect thực sự chưa được cấp khi cần.","id":"AC-004","requirement_refs":["R-003","R-004","R-005"],"statement":"User đã yêu cầu hai mockup hoặc đã accepted/pending","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Rename input, spacing có giá trị, typo, keyword-only UI/design/Angular/diagram, một phương án hợp lệ, hoặc agent được giao tự quyết","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Không offer và không bịa lựa chọn.","id":"AC-005","requirement_refs":["R-001","R-005"],"statement":"Rename input, spacing có giá trị, typo, keyword-only UI/design/Angular/diagram, một phương án hợp lệ, hoặc agent được giao tự quyết","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Triển khai layout đã approved; hoặc executor phát hiện quyết định còn mở","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Không mở lại approved choice; unresolved choice trở về đúng workflow owner với state giữ nguyên.","id":"AC-006","requirement_refs":["R-002","R-003","R-005"],"statement":"Triển khai layout đã approved; hoặc executor phát hiện quyết định còn mở","task_refs":["TASK-001","TASK-003","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Yêu cầu lẫn nghiệp vụ và UI","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-003","EVIDENCE-007"],"expected_result":"Làm rõ blocker ảnh hưởng option set trước, offer đúng quyết định visual về sau; không offer chỉ từ UI keyword.","id":"AC-007","requirement_refs":["R-001","R-005"],"statement":"Yêu cầu lẫn nghiệp vụ và UI","task_refs":["TASK-001","TASK-003","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Decline rồi đổi skill/phase/wording hoặc decision trong cùng visual thread; decline toàn session","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Không lặp offer trong scope bị từ chối.","id":"AC-008","requirement_refs":["R-003","R-005"],"statement":"Decline rồi đổi skill/phase/wording hoặc decision trong cùng visual thread; decline toàn session","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"User chủ động bật visual lại","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Tiếp tục trong scope yêu cầu mới, bảo toàn decline rộng hơn còn hiệu lực và không tự cấp runtime/browser consent.","id":"AC-009","requirement_refs":["R-003","R-004","R-005"],"statement":"User chủ động bật visual lại","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Native structured choice và visual cùng supported","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Preview theo visual ladder; text/approval theo text ladder; consent thiếu không chọn live như đã được phép.","id":"AC-010","requirement_refs":["R-004","R-005"],"statement":"Native structured choice và visual cùng supported","task_refs":["TASK-001","TASK-002","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Live lỗi, thiếu capability, browser auto-open unknown, hoặc không có visual surface","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Native visual → static → numbered Markdown theo khả năng; giữ decision/options; không offer chức năng bất khả dụng hoặc mất visual chỉ do auto-open unknown.","id":"AC-011","requirement_refs":["R-004","R-005"],"statement":"Live lỗi, thiếu capability, browser auto-open unknown, hoặc không có visual surface","task_refs":["TASK-001","TASK-002","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Click chọn visual","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Không approve spec/plan/implementation; written reply vẫn authoritative; runtime cleanup và local-only boundary được giữ.","id":"AC-012","requirement_refs":["R-004","R-005"],"statement":"Click chọn visual","task_refs":["TASK-001","TASK-002","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Handoff và consent scope","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"expected_result":"Phân biệt đủ not-evaluated/not-applicable + reason/pending/accepted/declined/surface/fallback; không checkpoint, token hoặc authenticated URL trong durable artifacts.","id":"AC-013","requirement_refs":["R-003","R-004","R-005"],"statement":"Handoff và consent scope","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Behavioral evaluation từ prompt tự nhiên, nhiều lượt","blocking":true,"evidence_refs":["EVIDENCE-001","EVIDENCE-005","EVIDENCE-007"],"expected_result":"Hoàn thiện ít nhất 12 scenario trên và negative/pressure controls; runner không nạp expected visual flags vào agent; giữ transcript/receipt thực và source/runtime/model metadata; báo tỷ lệ đúng, bỏ sót, offer sai, lặp với mẫu số. Nếu chưa chạy được, ghi NOT RUN và lý do, không tạo transcript giả.","id":"AC-014","requirement_refs":["R-005"],"statement":"Behavioral evaluation từ prompt tự nhiên, nhiều lượt","task_refs":["TASK-001","TASK-005","TASK-007"],"type":"acceptance-criterion","verification_kind":"manual"},{"behavior":"Canonical/mirror/docs","blocking":true,"evidence_refs":["EVIDENCE-005","EVIDENCE-006","EVIDENCE-007"],"expected_result":"23 public skills không đổi; sources English-only trừ localization fixtures; runtime output bản địa hóa; docs có ví dụ và cách user chủ động yêu cầu; mirror/hygiene/executable-reference checks pass.","id":"AC-015","requirement_refs":["R-006"],"statement":"Canonical/mirror/docs","task_refs":["TASK-005","TASK-006","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Review và validation cuối","blocking":true,"evidence_refs":["EVIDENCE-007"],"expected_result":"Không còn chỉ dẫn mâu thuẫn giữa policy, choice, companion và helper; affected regressions và repository checks pass trên Node hỗ trợ hoặc giới hạn môi trường được báo rõ; live evidence tách khỏi deterministic.","id":"AC-016","requirement_refs":["R-005","R-006"],"statement":"Review và validation cuối","task_refs":["TASK-007"],"type":"acceptance-criterion","verification_kind":"manual"},{"blocking":false,"confidence":"unknown","consequence_if_wrong":"Deliver the complete runner/scenarios with NOT RUN; do not claim live reliability.","evidence_refs":["BASELINE-CLI-DISCOVERY"],"id":"A-001","impacted_refs":["R-005","AC-014"],"owner":"integration-owner","rationale":"The user explicitly allows truthful NOT RUN when live execution is unavailable.","revisit_condition":"Before live behavioral evaluation after implementation scope approval.","source":"inferred","statement":"Live A/B runtime availability remains unverified.","status":"deferred","type":"assumption","validation_method":"Probe the available CLI and run actual baseline/candidate conversations under equivalent conditions during execution."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-002"],"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-005","EVIDENCE-006","EVIDENCE-007"],"id":"D-001","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Where should offer policy live?","rationale":"Explicitly specified in the current user attachment; this does not approve the draft spec.","revisit_condition":null,"scope":"repository","selected_value":"Dùng một shared reference ngắn cho nhận diện/offer và executable policy hiện có cho trạng thái/routing. Đây là hướng user đã chỉ định; tránh nhân bản và không xây keyword classifier.","source":"explicit-user","statement":"Dùng một shared reference ngắn cho nhận diện/offer và executable policy hiện có cho trạng thái/routing. Đây là hướng user đã chỉ định; tránh nhân bản và không xây keyword classifier.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006","TASK-007"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-004","AC-010","AC-011"],"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-004","EVIDENCE-007"],"id":"D-002","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"How should interaction surfaces be selected?","rationale":"Explicitly specified in the current user attachment; this does not approve the draft spec.","revisit_condition":null,"scope":"repository","selected_value":"Giữ thứ tự visual: live đủ capability và consent → native visual → static HTML → numbered Markdown. Text/approval: native structured choice → numbered Markdown. User đã xác định hai thang này.","source":"explicit-user","statement":"Giữ thứ tự visual: live đủ capability và consent → native visual → static HTML → numbered Markdown. Text/approval: native structured choice → numbered Markdown. User đã xác định hai thang này.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-004","TASK-007"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-003","AC-004","AC-008","AC-009"],"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-007"],"id":"D-003","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"How should prior user responses survive handoff?","rationale":"Explicitly specified in the current user attachment; this does not approve the draft spec.","revisit_condition":null,"scope":"repository","selected_value":"Decline theo visual thread hoặc toàn session vẫn hiệu lực khi đổi skill/phase/wording; chỉ user chủ động bật lại được thay đổi. Accepted/pending không tạo lời mời nhu cầu lần hai. User đã xác định quy tắc này.","source":"explicit-user","statement":"Decline theo visual thread hoặc toàn session vẫn hiệu lực khi đổi skill/phase/wording; chỉ user chủ động bật lại được thay đổi. Accepted/pending không tạo lời mời nhu cầu lần hai. User đã xác định quy tắc này.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-007"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012","AC-013","AC-014","AC-015","AC-016","INV-001","INV-002"],"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-005","EVIDENCE-006","EVIDENCE-007"],"id":"D-004","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which execution and evidence boundaries must remain?","rationale":"Explicitly specified in the current user attachment; this does not approve the draft spec.","revisit_condition":null,"scope":"repository","selected_value":"Giữ runtime, event authority, lifecycle, artifact owner và approval gates hiện có. Live eval chỉ được báo theo dữ liệu thực; thiếu khả năng chạy thì hoàn thiện runner/scenarios và báo NOT RUN. User đã chỉ định phạm vi này.","source":"explicit-user","statement":"Giữ runtime, event authority, lifecycle, artifact owner và approval gates hiện có. Live eval chỉ được báo theo dữ liệu thực; thiếu khả năng chạy thì hoàn thiện runner/scenarios và báo NOT RUN. User đã chỉ định phạm vi này.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006","TASK-007"],"type":"decision","validation_boundary":{"kind":"none","source_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012","AC-013","AC-014","AC-015","AC-016","INV-001","INV-002"]}},{"evidence_refs":["EVIDENCE-007"],"id":"INV-001","protected_refs":["R-004","AC-012","AC-013"],"statement":"Visual feedback never authorizes implementation or runtime/browser side effects; durable artifacts exclude runtime secrets.","task_refs":["TASK-002","TASK-003","TASK-004","TASK-006","TASK-007"],"type":"invariant"},{"evidence_refs":["EVIDENCE-007"],"id":"INV-002","protected_refs":["R-002","R-006","AC-005","AC-015"],"statement":"Keep 23 public skills and the existing runtime/ownership boundaries; load the full runtime only when needed.","task_refs":["TASK-002","TASK-003","TASK-004","TASK-006","TASK-007"],"type":"invariant"}],"revision":2,"schema_version":1}
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage: *a2
    goals:
      - id: G-001
        statement: Offer visual comparisons at meaningful open decisions, consistently and without repeated questions or
          simple-task overhead.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/visual-offer-policy.test.mjs
          - test/e2e/visual-offer-behavior.test.mjs
          - test/e2e/fixtures/visual-offer-scenarios.json
          - test/e2e/support/visual-offer-eval-runner.mjs
          - scripts/eval-visual-offer.mjs
          - authoring/evals/visual-offer/README.md
          - test/e2e/harness-behavioral-sentinel.test.mjs
          - test/e2e/support/harness-behavior-runner.mjs
          - test/e2e/support/cli-adapters.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - D-001
              - D-002
              - D-003
              - D-004
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
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - D-001
          - D-002
          - D-003
          - D-004
        enforces_invariant_refs: []
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - _refs/sdlc/visual-offer-policy.md
          - _refs/harness/runtime-policy.mjs
          - _refs/harness/runtime-attestation.mjs
          - _refs/harness/runtime-attestation.md
          - _refs/harness/capability-contract.json
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-001
              - R-003
              - R-004
              - D-001
              - D-002
              - D-003
              - D-004
              - AC-004
              - AC-005
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - AC-012
              - AC-013
              - INV-001
              - INV-002
        justification_refs:
          - R-001
          - R-003
          - R-004
          - D-001
          - D-002
          - D-003
          - D-004
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - skills/orchestration/using-skills.md
          - skills/shared/sdlc/01-brainstorming.md
          - skills/tracks/design/sdcorejs-design.md
          - skills/tracks/angular/sdcorejs-angular.md
          - skills/tracks/nextjs/sdcorejs-nextjs.md
          - skills/shared/sdlc/04-execute-plan.md
          - skills/shared/sdlc/02-spec.md
          - skills/shared/sdlc/03-plan.md
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - D-001
              - D-003
              - D-004
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-013
              - INV-001
              - INV-002
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - D-001
          - D-003
          - D-004
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/shared/runtime-protocols.md
          - _refs/shared/user-choice-prompt.md
          - _refs/sdlc/visual-companion.md
          - _refs/shared/project-context.md
          - AGENTS.md
          - CLAUDE.md
          - .github/copilot-instructions.md
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-006
              - D-001
              - D-002
              - D-003
              - D-004
              - AC-004
              - AC-005
              - AC-006
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - AC-012
              - AC-013
              - INV-001
              - INV-002
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-006
          - D-001
          - D-002
          - D-003
          - D-004
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-004
        planned_paths:
          - README.md
          - authoring/README.md
          - package.json
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-005
              - R-006
              - D-001
              - D-004
              - AC-014
              - AC-015
        justification_refs:
          - R-005
          - R-006
          - D-001
          - D-004
        enforces_invariant_refs: []
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
        planned_paths:
          - .claude/skills
          - .claude/_refs
          - plugin/skills
          - plugin/_refs
          - codex/skills
          - .cursor/rules/sdcorejs-agent.mdc
          - .claude/sdcorejs-harness.json
          - plugin/sdcorejs-harness.json
          - codex/sdcorejs-harness.json
          - .cursor/sdcorejs-harness.json
          - .github/sdcorejs-harness.json
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-002
              - R-006
              - D-001
              - D-004
              - AC-015
              - INV-001
              - INV-002
        justification_refs:
          - R-002
          - R-006
          - D-001
          - D-004
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-006
        planned_paths:
          - authoring/evals/visual-offer/baseline.json
          - authoring/evals/visual-offer/candidate.json
          - authoring/evals/visual-offer/records.json
          - .sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-delivery.md
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
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
              - D-001
              - D-002
              - D-003
              - D-004
              - INV-001
              - INV-002
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - D-001
          - D-002
          - D-003
          - D-004
        enforces_invariant_refs:
          - INV-001
          - INV-002
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - test/e2e/harness-behavioral-sentinel.test.mjs
            - test/e2e/support/harness-behavior-runner.mjs
            - test/e2e/support/cli-adapters.mjs
            - _refs/harness/runtime-policy.mjs
            - _refs/harness/runtime-attestation.mjs
            - _refs/harness/runtime-attestation.md
            - _refs/harness/capability-contract.json
            - skills/orchestration/using-skills.md
            - skills/shared/sdlc/01-brainstorming.md
            - skills/tracks/design/sdcorejs-design.md
            - skills/tracks/angular/sdcorejs-angular.md
            - skills/tracks/nextjs/sdcorejs-nextjs.md
            - skills/shared/sdlc/04-execute-plan.md
            - skills/shared/sdlc/02-spec.md
            - skills/shared/sdlc/03-plan.md
            - _refs/shared/runtime-protocols.md
            - _refs/shared/user-choice-prompt.md
            - _refs/sdlc/visual-companion.md
            - _refs/shared/project-context.md
            - AGENTS.md
            - CLAUDE.md
            - .github/copilot-instructions.md
            - README.md
            - authoring/README.md
            - package.json
            - .claude/skills
            - .claude/_refs
            - plugin/skills
            - plugin/_refs
            - codex/skills
            - .cursor/rules/sdcorejs-agent.mdc
            - .claude/sdcorejs-harness.json
            - plugin/sdcorejs-harness.json
            - codex/sdcorejs-harness.json
            - .cursor/sdcorejs-harness.json
            - .github/sdcorejs-harness.json
          intended_new_paths:
            - path: test/e2e/visual-offer-policy.test.mjs
              owner_task_id: TASK-001
            - path: test/e2e/visual-offer-behavior.test.mjs
              owner_task_id: TASK-001
            - path: test/e2e/fixtures/visual-offer-scenarios.json
              owner_task_id: TASK-001
            - path: test/e2e/support/visual-offer-eval-runner.mjs
              owner_task_id: TASK-001
            - path: scripts/eval-visual-offer.mjs
              owner_task_id: TASK-001
            - path: authoring/evals/visual-offer/README.md
              owner_task_id: TASK-001
            - path: _refs/sdlc/visual-offer-policy.md
              owner_task_id: TASK-002
            - path: authoring/evals/visual-offer/baseline.json
              owner_task_id: TASK-007
            - path: authoring/evals/visual-offer/candidate.json
              owner_task_id: TASK-007
            - path: authoring/evals/visual-offer/records.json
              owner_task_id: TASK-007
            - path: .sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-delivery.md
              owner_task_id: TASK-007
    critique_history:
      - round: 1
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers: []
        resolved_blockers: []
        unresolved_blockers: []
  validation_map:
    - requirement_id: R-001
      acceptance_criterion_id: AC-001
      invariant_refs: []
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: &a3
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
          - INV-001
          - INV-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-001-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Xác định phương án đáng so sánh rồi offer trước khi tự chốt; prompt không cần tên companion.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-002
      invariant_refs: []
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-002-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Offer mockup so sánh trước quyết định bố trí.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-002
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-003-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Cùng policy và timing như Brainstorming.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-004
      invariant_refs: []
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-004-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Không hỏi lại nhu cầu; reuse consent đúng scope, chỉ hỏi side effect thực sự chưa được cấp khi cần.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-002
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-005-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Không offer và không bịa lựa chọn.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-002
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-006-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Không mở lại approved choice; unresolved choice trở về đúng workflow owner với state giữ nguyên.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-007
      invariant_refs: []
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-007-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Làm rõ blocker ảnh hưởng option set trước, offer đúng quyết định visual về sau; không offer chỉ từ UI
        keyword.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-008
      invariant_refs: []
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-008-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Không lặp offer trong scope bị từ chối.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-009
      invariant_refs: []
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-009-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Tiếp tục trong scope yêu cầu mới, bảo toàn decline rộng hơn còn hiệu lực và không tự cấp
        runtime/browser consent.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-001
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-010-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Preview theo visual ladder; text/approval theo text ladder; consent thiếu không chọn live như đã được
        phép.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-011
      invariant_refs:
        - INV-001
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-011-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Native visual → static → numbered Markdown theo khả năng; giữ decision/options; không offer chức năng
        bất khả dụng hoặc mất visual chỉ do auto-open unknown.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-001
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-012-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Không approve spec/plan/implementation; written reply vẫn authoritative; runtime cleanup và local-only
        boundary được giữ.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-013
      invariant_refs:
        - INV-001
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-013-policy
      planned_command: node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. Phân biệt đủ not-evaluated/not-applicable + reason/pending/accepted/declined/surface/fallback; không
        checkpoint, token hoặc authenticated URL trong durable artifacts.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-014
      invariant_refs: []
      risk: behavioral-evidence-and-review
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-visual-offer-ac-014-review
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: SUPPLEMENTAL_SMOKE
      automation: manual
      expected_proof: Hoàn thiện ít nhất 12 scenario trên và negative/pressure controls; runner không nạp expected visual
        flags vào agent; giữ transcript/receipt thực và source/runtime/model metadata; báo tỷ lệ đúng, bỏ sót, offer
        sai, lặp với mẫu số. Nếu chưa chạy được, ghi NOT RUN và lý do, không tạo transcript giả.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Integration owner reviews actual transcripts/receipts and source/test evidence. A permitted NOT RUN remains
        disclosed and never proves live reliability.
      owner: integration-owner
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-015
      invariant_refs:
        - INV-002
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-visual-offer-ac-015-policy
      planned_command: npm run check:skills
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Structured-policy and integration proof only; natural-language recognition requires separate actual live
        evidence. 23 public skills không đổi; sources English-only trừ localization fixtures; runtime output bản địa
        hóa; docs có ví dụ và cách user chủ động yêu cầu; mirror/hygiene/executable-reference checks pass.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-016
      invariant_refs: []
      risk: behavioral-evidence-and-review
      boundary:
        kind: none
        approval_ref: D-004
        source_refs: *a3
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-visual-offer-ac-016-review
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: SUPPLEMENTAL_SMOKE
      automation: manual
      expected_proof: Không còn chỉ dẫn mâu thuẫn giữa policy, choice, companion và helper; affected regressions và repository
        checks pass trên Node hỗ trợ hoặc giới hạn môi trường được báo rõ; live evidence tách khỏi deterministic.
      status: covered
      evidence_refs:
        - EVIDENCE-007
      rationale: Integration owner reviews actual transcripts/receipts and source/test evidence. A permitted NOT RUN remains
        disclosed and never proves live reliability.
      owner: integration-owner
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-014
      invariant_refs: []
      risk: behavioral-evidence-and-review
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
          - INV-001
          - INV-002
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-visual-offer-eval-runner-integrity
      planned_command: node --test test/e2e/visual-offer-behavior.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Natural-language scenario coverage, no answer leakage, genuine multi-turn runner, complete denominators,
        actual receipts or truthful NOT RUN.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-015
      invariant_refs:
        - INV-002
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
          - INV-001
          - INV-002
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-visual-offer-text-hygiene
      planned_command: npm run check:text-hygiene
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Canonical and generated source text passes repository hygiene.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-015
      invariant_refs:
        - INV-002
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
          - INV-001
          - INV-002
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-visual-offer-executable-references
      planned_command: npm run check:executable-references
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Affected executable references remain valid.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-001
      risk: offer-state-routing-regression
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
          - INV-001
          - INV-002
      authorization_boundary: false
      levels:
        - api-e2e
      case_ids:
        - case-visual-offer-existing-runtime-boundaries
      planned_command: node --test test/e2e/visual-companion-runtime.test.mjs test/e2e/static-visual-composer.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: FULL_E2E
      automation: automated
      expected_proof: Existing authentication, supporting-feedback event authority, cleanup and local state isolation remain verified.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  contract_id: visual-companion-offer
  requirement_id: visual-companion-offer-user-request
  approved_spec_path: .sdcorejs/specs/workflow/2026-09-09-16-06-visual-companion-offer.md
  approved_spec_hash: sha256:v1:dda50970e9452383cb14f812f387063eec12ca2389154f17d81b5dfdcdc1c8e2
  approved_spec_reference:
    immutable_identity:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      repository_relative_path: .sdcorejs/specs/workflow/2026-09-09-16-06-visual-companion-offer.md
      artifact_id: spec-visual-companion-offer-r1
      revision: 1e74140592794bc64bd6d955d89dd4a83e390bcb
      approval_hash: sha256:v1:dda50970e9452383cb14f812f387063eec12ca2389154f17d81b5dfdcdc1c8e2
  approved_plan_path: .sdcorejs/plans/workflow/2026-09-09-16-15-visual-companion-offer.md
  approved_plan_hash: null
  supersedes: null
  target_root: .
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
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: node-esm
  task_count: 7
  phase_count: 4
  coverage_approach: TDD
  allowed_paths:
    - test/e2e/visual-offer-policy.test.mjs
    - test/e2e/visual-offer-behavior.test.mjs
    - test/e2e/fixtures/visual-offer-scenarios.json
    - test/e2e/support/visual-offer-eval-runner.mjs
    - scripts/eval-visual-offer.mjs
    - authoring/evals/visual-offer/README.md
    - test/e2e/harness-behavioral-sentinel.test.mjs
    - test/e2e/support/harness-behavior-runner.mjs
    - test/e2e/support/cli-adapters.mjs
    - _refs/sdlc/visual-offer-policy.md
    - _refs/harness/runtime-policy.mjs
    - _refs/harness/runtime-attestation.mjs
    - _refs/harness/runtime-attestation.md
    - _refs/harness/capability-contract.json
    - skills/orchestration/using-skills.md
    - skills/shared/sdlc/01-brainstorming.md
    - skills/tracks/design/sdcorejs-design.md
    - skills/tracks/angular/sdcorejs-angular.md
    - skills/tracks/nextjs/sdcorejs-nextjs.md
    - skills/shared/sdlc/04-execute-plan.md
    - skills/shared/sdlc/02-spec.md
    - skills/shared/sdlc/03-plan.md
    - _refs/shared/runtime-protocols.md
    - _refs/shared/user-choice-prompt.md
    - _refs/sdlc/visual-companion.md
    - _refs/shared/project-context.md
    - AGENTS.md
    - CLAUDE.md
    - .github/copilot-instructions.md
    - README.md
    - authoring/README.md
    - package.json
    - authoring/evals/visual-offer/baseline.json
    - authoring/evals/visual-offer/candidate.json
    - authoring/evals/visual-offer/records.json
    - .sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-delivery.md
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
  prohibited_paths: &a4
    - "**/.env"
    - "**/.env.*"
    - "**/node_modules/**"
    - package-lock.json
    - site/**
    - authoring/skills/**
    - authoring/evals/live-agent-matrix.json
    - .sdcorejs/conventions/**
    - .sdcorejs/summary.md
    - .sdcorejs/specs/**
    - .sdcorejs/plans/**
    - .sdcorejs/tasks/current-session.md
    - .sdcorejs/tasks/sessions/**
  generated_artifacts: &a5
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
    - README.md
    - authoring/README.md
    - authoring/evals/visual-offer/README.md
    - .sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-delivery.md
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
  package_manifest_changes:
    paths:
      - package.json
    scope: Add test/eval scripts only; preserve engines, version and dependency fields.
    approval_required: true
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Skill-pack runtime policy and Markdown authoring; no application frontend implementation.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Reuse existing skill harness and CLI for evaluation; no application agent architecture.
  verification_strategy:
    package_manager: npm
    evidence: packageManager npm@10.9.2 and package-lock.json; inspected package.json scripts.
    commands_planned:
      - npm run test:e2e:harness
      - npm run test:e2e:skill-authoring
      - node authoring/evals/run-deterministic.mjs
      - npm run test:e2e:repository
      - npm run check:text-hygiene
      - npm run check:executable-references
      - npm run sync:skills
      - npm run check:skills
      - node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
    new_scripts_owned_by: TASK-005
    commands_skipped:
      - command: golden/container app suites
        reason: No application templates, dependency, transport or database changes planned; expand only if actual diff
          requires.
      - command: site build/publish
        reason: No site source changes or publishing scope.
    live_evaluation:
      scope: Available existing CLI; isolated scenario inputs and actual transcript receipts; baseline/candidate comparable.
      source_revision: 1e74140592794bc64bd6d955d89dd4a83e390bcb
      model_effort_policy: Preserve the same available session defaults for baseline and candidate; do not select an alternate
        model or effort without existing authorization.
      missing_runtime_policy: Complete runner/scenarios and record exact NOT RUN reason; never claim live reliability.
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: _refs/harness/runtime-policy.mjs
        owner: TASK-002
        coordination: Sequential integration
      - path: package.json
        owner: TASK-005
        coordination: Scripts only after harness paths exist
      - path: generated mirrors
        owner: TASK-006
        coordination: Generator only after canonical stabilization
  repository_plan:
    schema_version: 1
    repositories:
      - repository_id: github.com/sdcorejs/sdcorejs-agent
        role: standalone
        module_id: null
        root: .
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - TASK-001
      - TASK-002
      - TASK-003
      - TASK-004
      - TASK-005
      - TASK-006
      - TASK-007
    gitlink_updates_in_scope: false
    steps:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        action: VERIFY-THEN-EDIT
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths:
          - test/e2e/visual-offer-policy.test.mjs
          - test/e2e/visual-offer-behavior.test.mjs
          - test/e2e/fixtures/visual-offer-scenarios.json
          - test/e2e/support/visual-offer-eval-runner.mjs
          - scripts/eval-visual-offer.mjs
          - authoring/evals/visual-offer/README.md
          - test/e2e/harness-behavioral-sentinel.test.mjs
          - test/e2e/support/harness-behavior-runner.mjs
          - test/e2e/support/cli-adapters.mjs
        prohibited_paths: *a4
        depends_on: []
        semantic_scope: repository
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        action: VERIFY-THEN-EDIT
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths:
          - _refs/sdlc/visual-offer-policy.md
          - _refs/harness/runtime-policy.mjs
          - _refs/harness/runtime-attestation.mjs
          - _refs/harness/runtime-attestation.md
          - _refs/harness/capability-contract.json
        prohibited_paths: *a4
        depends_on:
          - TASK-001
        semantic_scope: repository
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        action: VERIFY-THEN-EDIT
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths:
          - skills/orchestration/using-skills.md
          - skills/shared/sdlc/01-brainstorming.md
          - skills/tracks/design/sdcorejs-design.md
          - skills/tracks/angular/sdcorejs-angular.md
          - skills/tracks/nextjs/sdcorejs-nextjs.md
          - skills/shared/sdlc/04-execute-plan.md
          - skills/shared/sdlc/02-spec.md
          - skills/shared/sdlc/03-plan.md
        prohibited_paths: *a4
        depends_on:
          - TASK-002
        semantic_scope: repository
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        action: VERIFY-THEN-EDIT
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths:
          - _refs/shared/runtime-protocols.md
          - _refs/shared/user-choice-prompt.md
          - _refs/sdlc/visual-companion.md
          - _refs/shared/project-context.md
          - AGENTS.md
          - CLAUDE.md
          - .github/copilot-instructions.md
        prohibited_paths: *a4
        depends_on:
          - TASK-003
        semantic_scope: repository
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        action: VERIFY-THEN-EDIT
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths:
          - README.md
          - authoring/README.md
          - package.json
        prohibited_paths: *a4
        depends_on:
          - TASK-004
        semantic_scope: repository
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        action: VERIFY-THEN-EDIT
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths: *a5
        prohibited_paths: *a4
        depends_on:
          - TASK-005
        semantic_scope: repository
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        action: VERIFY-THEN-EDIT
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths:
          - authoring/evals/visual-offer/baseline.json
          - authoring/evals/visual-offer/candidate.json
          - authoring/evals/visual-offer/records.json
          - .sdcorejs/docs/workflow/2026-09-09-16-15-visual-companion-offer-delivery.md
        prohibited_paths: *a4
        depends_on:
          - TASK-006
        semantic_scope: repository
  finish_tail:
    contract:
      docs_before_final_branch_ready: true
      verify_before_done: true
      branch_ready_final_gate: true
      no_writes_after_branch_ready: true
    no_git_artifact_requested: true
  approval:
    approved: true
    approved_at: 2026-09-09T09:52:41.714Z
    approval_source: explicit-user-choice
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
  self_review:
    decision_coverage_valid: true
    goal_backward_approval_ready: true
    repository_plan_valid: true
    validation_map_row_errors: []
    validation_map_authority: Verified user-approved mapping
    validation_map_pending_code: null
    architecture_draft_handoff_valid: true
```

## Decisions captured during review

- User duyệt nguyên plan bằng phản hồi “Duyệt”; tạo approval binding của mapping sau phản hồi thực.

## Skill provenance

sdcorejs-plan, approved on attempt 1 / 3.
