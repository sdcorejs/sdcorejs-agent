---
artifact_id: draft-plan-mirror-refs-path-resolution-v1-r1
artifact_kind: execution-doc
change_ref: mirror-refs-path-resolution-v1
source_spec: .sdcorejs/specs/workflow/2026-10-15-22-24-mirror-refs-path-resolution.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 940fc0c3cf6b096cbd289771d92bc2a1556b8303
status: draft
revision: 1
---

# Plan — Tìm `_refs/` đúng trong mirror plugin và .claude — 2026-10-16 10:35

## Scope
Theo approved spec (`sha256:v1:09775bec…`):
- mirror `plugin/` và `.claude/` viết lại `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` và có thêm một dòng path-resolution ở header;
- hook `session-start` chèn bootstrap với đường dẫn tuyệt đối;
- có test xác định;
- chạy thật lại mode task-breakdown.

Architecture gate: not-applicable (`bounded-bug-fix`). Graph là approved spec → approved plan.

## Execution context
- Track: `workflow`. Target root kind: `sdcorejs-agent-authoring-repo`. Stack profile: `markdown-skill-pack`.
- Coverage approach: TDD.
- Parallel candidates: không. Mirror phụ thuộc script sinh, evidence phụ thuộc mọi file nguồn.
- Nhánh: `fix/mirror-refs-path-resolution` từ `940fc0c`. Không push.
- Decision coverage revision 2 thêm:
  - INV-001..005: mirror resolve được; bootstrap dùng đường dẫn tuyệt đối; các bề mặt không được đổi; kết quả chạy thật ghi đúng như transcript; evidence gắn với nội dung hiện tại;
  - D-007: validation boundary kind `none`.

## Tasks

### Phase 1 — RED
1. **TASK-001 CREATE** `test/e2e/mirror-refs-resolution.test.mjs`. RED cho các điểm sau:
   - AC-001: không còn `_refs/` trần trước đường dẫn trong 46 mirror;
   - AC-002: tham chiếu cụ thể resolve được;
   - AC-003: đúng một dòng path-resolution ở header; câu "contains `_refs/`" giữ nguyên;
   - AC-004: chạy hook với từng nhánh biến môi trường (Cursor, Claude, Copilot, mặc định), kiểm đường dẫn tuyệt đối có thật và không còn `../../_refs/`;
   - AC-005: skill nguồn, mirror codex và file sinh từ `AGENTS.md` giống `940fc0c` (`git show`);
   - AC-006: mutation lên bộ kiểm.
2. **TASK-002 EDIT** `test/e2e/production-readiness-contract.test.mjs`. Case `distribution-resolution` đổi kỳ vọng của `.claude`/plugin: tên tham chiếu là `../../<ref>`, resolve từ thư mục của skill. RED cho tới khi script sinh được sửa.

### Phase 2 — Sửa script và hook
3. **TASK-003 EDIT** `scripts/sync-skills.mjs`:
   - `toClaudeSkill()` viết lại `_refs/` đi trước ký tự đường dẫn (chữ, số, `<`, `{`, `*`) thành `../../_refs/`; tiền tố `../` sẵn có được chuẩn hoá;
   - thêm dòng "Path resolution: resolve `../../_refs/...` relative to this `SKILL.md`" sau comment adapter;
   - codex giữ nguyên.
4. **TASK-004 EDIT** `plugin/hooks/session-start.mjs`. Thay `../../_refs/` trong bootstrap bằng `<pluginRoot>/_refs/` (dấu `/`) trước khi chèn, áp dụng cho cả bốn nhánh output.
5. **TASK-005 GENERATE** 46 mirror `plugin/skills/*/SKILL.md` và `.claude/skills/*/SKILL.md` bằng `npm run sync:skills`, rồi chạy `npm run check:skills`.

### Phase 3 — Artifact quản trị
6. **TASK-006 EDIT** `package.json`: chỉ sửa scripts, thêm test mới vào `test:e2e:repository`.
7. **TASK-007 EDIT** `CHANGELOG.md`: thêm entry Unreleased.
8. **TASK-008 EDIT** `.sdcorejs/summary.md`: kiểm `assembleProjectContext`; chỉ tính lại fingerprint khi bị stale.
9. **TASK-009 EDIT** `authoring/evals/uiux/evidence.test.mjs`:
   - validator `product-task-breakdown-mode.json` chuyển sang history, đọc tại `940fc0c` qua `atRevision`;
   - thêm validator cho `authoring/evals/mirror-refs-path-resolution.json`: plan mới và hash của nó, continuation trước là record task-breakdown tại `940fc0c`, lệnh tập trung có các case `case-mirror-refs-*`.

   RED: record mới chưa có.
10. **TASK-010 EDIT** `VALIDATION.md`: thêm mục mới, gồm bảng RED → GREEN, ghi chú history, số đo economy (bootstrap không đổi).
11. **TASK-011 CREATE** `authoring/evals/mirror-refs-path-resolution.json`: ghi từ lần chạy thật của lệnh tập trung, **sau** TASK-010.
12. **TASK-012 CREATE** `.sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-delivery.md`: chạy lại `check:skills`, hygiene, executable-references, evidence test và `test:e2e:repository`, rồi ghi kết quả thật.

### Phase 4 — Chạy thật
13. **TASK-013 CREATE** `.sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-live-run.md`. Người dùng chạy session tương tác (plugin local, `--permission-mode manual`, cùng prompt). Mình đọc transcript và ghi:
    - ref có được đọc ngay lần đầu không (AC-007);
    - kết quả AC-002, AC-004, AC-011, AC-016 của `product-task-breakdown-mode-v1`.

## Acceptance mapping
- AC-001, AC-003, AC-006 → TASK-001, TASK-003, TASK-005.
- AC-002 → TASK-001, TASK-002, TASK-005.
- AC-004 → TASK-001, TASK-004.
- AC-005 → TASK-001, TASK-003, TASK-010.
- AC-007 (manual) → TASK-013.
- AC-008 → TASK-006..012.

## Verification
- `node --test test/e2e/mirror-refs-resolution.test.mjs test/e2e/production-readiness-contract.test.mjs`: RED rồi GREEN.
- `npm run sync:skills`, `npm run check:skills`, `npm run check:text-hygiene`, `npm run check:executable-references`.
- `node scripts/measure-communication-economy.mjs`: bootstrap phải không đổi.
- `node --test authoring/evals/uiux/evidence.test.mjs`: RED rồi GREEN.
- `npm run test:e2e:repository`: chạy nền.
- Manual: TASK-013.

## Self-review trước approval
- `validateDecisionCoverage` ở stage plan: 0 lỗi, 0 blocker, 0 future gap.
- `validateGoalBackwardPlan`: approval-ready. Có 13 task và 3 goal; 4 path mới đều đã khai.
- `validateValidationMap`: PASS, 9 dòng (một dòng cho mỗi cặp R×AC; case id không trùng).
- `validateArchitecturePrePlanHandoff` và `validateArchitectureDraftPlanHandoff`: PASS với bypass `bounded-bug-fix`.
- Prohibited paths: `skills/**`, `codex/**`, `AGENTS.md`, `.cursor/rules/**`, `.github/copilot-instructions.md`, các record continuation cũ.
- Không thêm dependency, không sửa lockfile. `package.json` chỉ sửa scripts.
- Rủi ro: nếu full suite lộ thêm test nào so chuỗi `_refs/` trần (A-003), mình sẽ dừng và lập plan revision, không sửa ngoài phạm vi.

## Typed plan context

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: mirror-refs-path-resolution-v1
  requirement_id: mirror-refs-path-resolution
  approved_spec_path: .sdcorejs/specs/workflow/2026-10-15-22-24-mirror-refs-path-resolution.md
  approved_spec_hash: sha256:v1:09775becf439220719f7bb8ddbe4dd2111dfe0865269e68a4fcfa9412f2aebfc
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-mirror-refs-path-resolution-v1-r1
    artifact_kind: spec
    revision: 940fc0c3cf6b096cbd289771d92bc2a1556b8303
    approval_hash: sha256:v1:09775becf439220719f7bb8ddbe4dd2111dfe0865269e68a4fcfa9412f2aebfc
    repository_relative_path: .sdcorejs/specs/workflow/2026-10-15-22-24-mirror-refs-path-resolution.md
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: bounded-bug-fix
      rationale: Script sinh mirror và hook session-start tạo đường dẫn `_refs/` không resolve được trong layout plugin; sửa trong hai điểm đó, không thêm hay đổi contract, owner, boundary hay dependency nào.
    rationale: Script sinh mirror và hook session-start tạo đường dẫn `_refs/` không resolve được trong layout plugin; sửa trong hai điểm đó, không thêm hay đổi contract, owner, boundary hay dependency nào.
  architecture_context: null
  approved_plan_path: null
  approved_plan_hash: null
  supersedes: null
  target_root: C:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: portal-sales-platform
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  dependency_order:
    - github.com/sdcorejs/sdcorejs-agent
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 13
  phase_count: 4
  coverage_approach: TDD (RED trước cho phần viết lại đường dẫn và hook)
  decision_coverage: &a2
    schema_version: 1
    revision: 2
    records:
      - id: R-001
        type: requirement
        statement: Mirror plugin/ và .claude/ của mọi skill viết mỗi tham chiếu `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` tính từ SKILL.md và có một dòng path-resolution ở header; chỉ viết lại khi `_refs/` đi ngay trước một đoạn đường dẫn.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-005
          - TASK-012
      - id: R-002
        type: requirement
        statement: Hook session-start chèn bootstrap với đường dẫn tuyệt đối `<pluginRoot>/_refs/...` ở mọi nhánh adapter, vì nội dung chèn vào không kèm thư mục gốc.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-012
      - id: R-003
        type: requirement
        statement: "Không đổi: skill nguồn trong skills/** và cách viết `_refs/` của chúng, mirror codex, AGENTS.md và các file sinh từ nó, ngân sách byte của bootstrap."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-010
          - TASK-012
      - id: R-004
        type: requirement
        statement: "Có test xác định: mọi tham chiếu cụ thể trong mirror plugin/.claude trỏ tới file có thật; tham chiếu dạng mẫu giữ đúng tiền tố; check:skills phát hiện mirror lệch."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
          - TASK-012
      - id: R-005
        type: requirement
        statement: "Chạy thật trong session tương tác của Claude Code với plugin local: ref của mode task-breakdown nạp được ngay lần đầu, và kiểm lại AC-002, AC-004, AC-011, AC-016 của product-task-breakdown-mode-v1; ghi kết quả thật."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-013
      - id: R-006
        type: requirement
        statement: "Governance: record evidence continuation riêng (record task-breakdown thành history tại 940fc0c), mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, 23 public skill, không thêm dependency, không bump version, không push."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
      - id: AC-001
        type: acceptance-criterion
        statement: Chạy npm run sync:skills rồi đọc plugin/skills/*/SKILL.md và .claude/skills/*/SKILL.md -> Mọi `_refs/` đi trước một đoạn đường dẫn đều có dạng `../../_refs/`; không còn `_refs/` trần đi trước đường dẫn
        behavior: Chạy npm run sync:skills rồi đọc plugin/skills/*/SKILL.md và .claude/skills/*/SKILL.md
        expected_result: Mọi `_refs/` đi trước một đoạn đường dẫn đều có dạng `../../_refs/`; không còn `_refs/` trần đi trước đường dẫn
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-005
          - TASK-012
      - id: AC-002
        type: acceptance-criterion
        statement: Resolve từng tham chiếu cụ thể (không chứa `<`, `*`, `{`) trong mirror plugin/.claude từ thư mục của SKILL.md đó -> Mọi tham chiếu trỏ tới file có thật
        behavior: Resolve từng tham chiếu cụ thể (không chứa `<`, `*`, `{`) trong mirror plugin/.claude từ thư mục của SKILL.md đó
        expected_result: Mọi tham chiếu trỏ tới file có thật
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-004
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-005
          - TASK-012
      - id: AC-003
        type: acceptance-criterion
        statement: Đọc header và các câu nhắc `_refs/` không kèm đường dẫn trong mirror plugin/.claude -> Mỗi mirror có đúng một dòng path-resolution; câu như "chứa `_refs/`" giữ nguyên nghĩa
        behavior: Đọc header và các câu nhắc `_refs/` không kèm đường dẫn trong mirror plugin/.claude
        expected_result: Mỗi mirror có đúng một dòng path-resolution; câu như "chứa `_refs/`" giữ nguyên nghĩa
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-005
          - TASK-012
      - id: AC-004
        type: acceptance-criterion
        statement: Chạy hook session-start với từng nhánh biến môi trường adapter -> Nội dung chèn vào chứa `<pluginRoot>/_refs/...` tuyệt đối và tồn tại; không còn `../../_refs/`
        behavior: Chạy hook session-start với từng nhánh biến môi trường adapter
        expected_result: Nội dung chèn vào chứa `<pluginRoot>/_refs/...` tuyệt đối và tồn tại; không còn `../../_refs/`
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-012
      - id: AC-005
        type: acceptance-criterion
        statement: So mirror codex, file sinh từ AGENTS.md và skill nguồn với 940fc0c; đo communication economy -> Không đổi byte nào; số đo bootstrap không đổi
        behavior: So mirror codex, file sinh từ AGENTS.md và skill nguồn với 940fc0c; đo communication economy
        expected_result: Không đổi byte nào; số đo bootstrap không đổi
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-010
          - TASK-012
      - id: AC-006
        type: acceptance-criterion
        statement: "Mutation: mirror còn `_refs/` trần trước đường dẫn hoặc thiếu dòng header -> check:skills hoặc test báo lệch và fail"
        behavior: "Mutation: mirror còn `_refs/` trần trước đường dẫn hoặc thiếu dòng header"
        expected_result: check:skills hoặc test báo lệch và fail
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-012
      - id: AC-007
        type: acceptance-criterion
        statement: Chạy session tương tác (plugin local, --permission-mode manual) với prompt của lần chạy trước -> Transcript cho thấy `../../_refs/product/task-breakdown.md` được đọc ở lần đầu; kết quả AC-002/004/011/016 của product-task-breakdown-mode-v1 được ghi vào live-run-r3
        behavior: Chạy session tương tác (plugin local, --permission-mode manual) với prompt của lần chạy trước
        expected_result: Transcript cho thấy `../../_refs/product/task-breakdown.md` được đọc ở lần đầu; kết quả AC-002/004/011/016 của product-task-breakdown-mode-v1 được ghi vào live-run-r3
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-013
      - id: AC-008
        type: acceptance-criterion
        statement: Chạy npm run check:skills, npm run test:e2e:repository và evidence test trên Node 22.22.3 -> Tất cả xanh; continuation mới hợp lệ; record task-breakdown verify như history tại 940fc0c; 23 public skill; CHANGELOG có entry Unreleased
        behavior: Chạy npm run check:skills, npm run test:e2e:repository và evidence test trên Node 22.22.3
        expected_result: Tất cả xanh; continuation mới hợp lệ; record task-breakdown verify như history tại 940fc0c; 23 public skill; CHANGELOG có entry Unreleased
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
      - id: A-001
        type: assumption
        statement: Claude Code cho model thấy thư mục base của skill, và model resolve `../../_refs/...` từ thư mục đó.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs:
          - live-run-r2-2026-10-15-base-directory-line
        consequence_if_wrong: Mirror vẫn không nạp được ref; cần dòng path-resolution chỉ rõ hơn hoặc cách khác ở change sau.
        validation_method: Lần chạy thật AC-007.
        owner: adapter maintainer
        rationale: Transcript lần chạy trước có dòng "Base directory for this skill" và model đã thử đường dẫn tương đối từ đó.
        impacted_refs:
          - R-001
          - R-005
      - id: A-002
        type: assumption
        statement: "Mặc định governance: continuation riêng, mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, không bump version, không push."
        source: defaulted
        confidence: high
        status: proposed
        blocking: false
        evidence_refs:
          - brainstorming-2026-10-15-defaults
        consequence_if_wrong: Plan phải thêm hoặc bỏ task quản trị.
        validation_method: Người dùng xác nhận khi duyệt spec.
        owner: spec approver
        rationale: test:e2e:repository khoá các artifact này cho mỗi thay đổi.
        impacted_refs:
          - R-006
      - id: A-003
        type: assumption
        statement: Một số test đọc mirror plugin có thể đang so chuỗi `_refs/` trần và cần sửa theo.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs:
          - repo-test-layout
        consequence_if_wrong: Không cần sửa test nào ngoài test mới.
        validation_method: Chạy test:e2e:repository sau khi đổi mirror.
        owner: executor
        rationale: Nhiều contract test đọc nội dung mirror.
        impacted_refs:
          - R-004
          - R-006
      - id: D-001
        type: decision
        statement: "Cách sửa: Viết lại `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` trong mirror plugin/.claude kèm một dòng path-resolution ở header; hook session-start thay bằng đường dẫn tuyệt đối từ plugin root"
        question: Cách sửa
        selected_value: Viết lại `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` trong mirror plugin/.claude kèm một dòng path-resolution ở header; hook session-start thay bằng đường dẫn tuyệt đối từ plugin root
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Model bỏ qua quy tắc trừu tượng; codex đã chạy được với đường dẫn cụ thể.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - AC-001
          - AC-004
        task_refs:
          - TASK-003
          - TASK-004
          - TASK-005
      - id: D-002
        type: decision
        statement: "Nhánh: Nhánh mới fix/mirror-refs-path-resolution từ 940fc0c"
        question: Nhánh
        selected_value: Nhánh mới fix/mirror-refs-path-resolution từ 940fc0c
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tách change; record task-breakdown thành history tại commit.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-006
          - AC-008
        task_refs:
          - TASK-009
          - TASK-011
      - id: D-003
        type: decision
        statement: "Phạm vi: Mirror plugin/ và .claude/ cùng hook session-start; mirror codex và file sinh từ AGENTS.md giữ nguyên"
        question: Phạm vi
        selected_value: Mirror plugin/ và .claude/ cùng hook session-start; mirror codex và file sinh từ AGENTS.md giữ nguyên
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Cursor và Copilot CLI cũng nạp từ plugin/.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - R-003
          - AC-005
        task_refs:
          - TASK-003
          - TASK-004
      - id: D-004
        type: decision
        statement: "Chạy thật: Task cuối của change này, session tương tác do người dùng chạy ở chế độ manual"
        question: Chạy thật
        selected_value: Task cuối của change này, session tương tác do người dùng chạy ở chế độ manual
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Headless làm méo cổng nhiều lượt.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-007
        task_refs:
          - TASK-013
      - id: D-005
        type: decision
        statement: "Cách viết test: TDD: test RED trước cho phần viết lại đường dẫn và phần thay đường dẫn của hook"
        question: Cách viết test
        selected_value: "TDD: test RED trước cho phần viết lại đường dẫn và phần thay đường dẫn của hook"
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Logic xác định được.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - AC-002
          - AC-006
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
      - id: D-006
        type: decision
        statement: "Quy tắc viết lại: Chỉ viết lại `_refs/` khi theo sau là ký tự đường dẫn (chữ, số, `<`, `{`, `*`); dạng mẫu giữ tiền tố và không bắt buộc resolve"
        question: Quy tắc viết lại
        selected_value: Chỉ viết lại `_refs/` khi theo sau là ký tự đường dẫn (chữ, số, `<`, `{`, `*`); dạng mẫu giữ tiền tố và không bắt buộc resolve
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tránh đổi nghĩa câu như "chứa `_refs/`" trong skill product.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-004
          - AC-003
        task_refs:
          - TASK-001
          - TASK-003
      - id: D-007
        type: decision
        statement: "Ranh giới validation của thay đổi: không có authorization boundary; mọi dòng validation_map dùng boundary kind none."
        question: Validation boundary của validation_map
        selected_value: kind none cho mọi dòng; approval_ref D-007
        source: approved-plan
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Thay đổi chỉ ở script sinh mirror, hook và test; không có boundary phân quyền.
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
          - INV-001
          - INV-002
          - INV-003
          - INV-004
          - INV-005
        task_refs:
          - TASK-012
        validation_boundary:
          kind: none
          source_refs: *a1
      - id: INV-001
        type: invariant
        statement: Mirror plugin/ và .claude/ không còn `_refs/` trần đi trước một đoạn đường dẫn; mọi tham chiếu cụ thể resolve được từ thư mục của SKILL.md.
        protected_refs:
          - R-001
          - R-004
          - AC-001
          - AC-002
          - AC-003
          - AC-006
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-005
          - TASK-006
          - TASK-012
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-012
      - id: INV-002
        type: invariant
        statement: Bootstrap do hook session-start chèn vào chỉ dùng đường dẫn _refs tuyệt đối có thật.
        protected_refs:
          - R-002
          - AC-004
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-012
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-004
          - EVIDENCE-012
      - id: INV-003
        type: invariant
        statement: Skill nguồn, mirror codex và các file sinh từ AGENTS.md giữ nguyên byte; số đo bootstrap không đổi.
        protected_refs:
          - R-003
          - AC-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-010
          - TASK-012
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-010
          - EVIDENCE-012
      - id: INV-004
        type: invariant
        statement: Kết quả lần chạy thật được ghi đúng như transcript, kể cả khi fail; không chạy thay người dùng.
        protected_refs:
          - R-005
          - AC-007
        task_refs:
          - TASK-013
        evidence_refs:
          - EVIDENCE-013
      - id: INV-005
        type: invariant
        statement: Evidence continuation gắn với nội dung hiện tại và một lần chạy thật; record của thay đổi trước chỉ được kiểm như history.
        protected_refs:
          - R-006
          - AC-008
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-008
          - EVIDENCE-009
          - EVIDENCE-010
          - EVIDENCE-011
          - EVIDENCE-012
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
        tombstones: []
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage: *a2
    goals:
      - id: G-001
        statement: Mirror plugin và .claude resolve được mọi tham chiếu _refs/; bootstrap chèn đường dẫn tuyệt đối; test RED -> GREEN.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
      - id: G-002
        statement: Artifact quản trị và evidence continuation cập nhật; suite xanh.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
      - id: G-003
        statement: Lần chạy thật tương tác nạp được ref và kiểm lại 4 AC kiểm tay của task-breakdown.
        task_refs:
          - TASK-013
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/mirror-refs-resolution.test.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - INV-001
              - INV-002
              - INV-003
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - D-005
          - D-006
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/production-readiness-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-001
              - R-004
              - AC-002
              - INV-001
        justification_refs:
          - R-001
          - R-004
          - D-005
        enforces_invariant_refs:
          - INV-001
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
          - TASK-002
        planned_paths:
          - scripts/sync-skills.mjs
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-001
              - R-003
              - AC-001
              - AC-003
              - AC-005
              - AC-006
              - INV-001
              - INV-003
        justification_refs:
          - R-001
          - R-003
          - D-001
          - D-003
          - D-006
        enforces_invariant_refs:
          - INV-001
          - INV-003
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - plugin/hooks/session-start.mjs
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-002
              - AC-004
              - INV-002
        justification_refs:
          - R-002
          - D-001
          - D-003
        enforces_invariant_refs:
          - INV-002
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
          - TASK-004
        planned_paths:
          - plugin/skills/sdcorejs-ai-agent/SKILL.md
          - .claude/skills/sdcorejs-ai-agent/SKILL.md
          - plugin/skills/sdcorejs-angular/SKILL.md
          - .claude/skills/sdcorejs-angular/SKILL.md
          - plugin/skills/sdcorejs-architecture/SKILL.md
          - .claude/skills/sdcorejs-architecture/SKILL.md
          - plugin/skills/sdcorejs-brainstorming/SKILL.md
          - .claude/skills/sdcorejs-brainstorming/SKILL.md
          - plugin/skills/sdcorejs-debug/SKILL.md
          - .claude/skills/sdcorejs-debug/SKILL.md
          - plugin/skills/sdcorejs-design/SKILL.md
          - .claude/skills/sdcorejs-design/SKILL.md
          - plugin/skills/sdcorejs-documentation/SKILL.md
          - .claude/skills/sdcorejs-documentation/SKILL.md
          - plugin/skills/sdcorejs-execute-plan/SKILL.md
          - .claude/skills/sdcorejs-execute-plan/SKILL.md
          - plugin/skills/sdcorejs-explore/SKILL.md
          - .claude/skills/sdcorejs-explore/SKILL.md
          - plugin/skills/sdcorejs-git/SKILL.md
          - .claude/skills/sdcorejs-git/SKILL.md
          - plugin/skills/sdcorejs-nestjs/SKILL.md
          - .claude/skills/sdcorejs-nestjs/SKILL.md
          - plugin/skills/sdcorejs-nextjs/SKILL.md
          - .claude/skills/sdcorejs-nextjs/SKILL.md
          - plugin/skills/sdcorejs-parallel-dispatch/SKILL.md
          - .claude/skills/sdcorejs-parallel-dispatch/SKILL.md
          - plugin/skills/sdcorejs-plan/SKILL.md
          - .claude/skills/sdcorejs-plan/SKILL.md
          - plugin/skills/sdcorejs-product/SKILL.md
          - .claude/skills/sdcorejs-product/SKILL.md
          - plugin/skills/sdcorejs-repair-loop/SKILL.md
          - .claude/skills/sdcorejs-repair-loop/SKILL.md
          - plugin/skills/sdcorejs-review/SKILL.md
          - .claude/skills/sdcorejs-review/SKILL.md
          - plugin/skills/sdcorejs-ship/SKILL.md
          - .claude/skills/sdcorejs-ship/SKILL.md
          - plugin/skills/sdcorejs-simplify/SKILL.md
          - .claude/skills/sdcorejs-simplify/SKILL.md
          - plugin/skills/sdcorejs-spec/SKILL.md
          - .claude/skills/sdcorejs-spec/SKILL.md
          - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
          - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
          - plugin/skills/sdcorejs-test/SKILL.md
          - .claude/skills/sdcorejs-test/SKILL.md
          - plugin/skills/sdcorejs-using-skills/SKILL.md
          - .claude/skills/sdcorejs-using-skills/SKILL.md
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-001
              - AC-001
              - AC-002
              - AC-003
              - INV-001
        justification_refs:
          - R-001
          - D-001
        enforces_invariant_refs:
          - INV-001
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - package.json
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-004
              - R-006
              - AC-008
              - INV-001
              - INV-005
        justification_refs:
          - R-004
          - R-006
          - D-005
        enforces_invariant_refs:
          - INV-001
          - INV-005
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
        planned_paths:
          - CHANGELOG.md
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-006
              - AC-008
              - INV-005
        justification_refs:
          - R-006
        enforces_invariant_refs:
          - INV-005
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
          - TASK-006
        planned_paths:
          - .sdcorejs/summary.md
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-006
              - AC-008
              - INV-005
        justification_refs:
          - R-006
        enforces_invariant_refs:
          - INV-005
      - id: TASK-009
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
        planned_paths:
          - authoring/evals/uiux/evidence.test.mjs
        planned_evidence:
          - id: EVIDENCE-009
            record_refs:
              - R-006
              - AC-008
              - INV-005
        justification_refs:
          - R-006
          - D-002
        enforces_invariant_refs:
          - INV-005
      - id: TASK-010
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-008
          - TASK-009
        planned_paths:
          - VALIDATION.md
        planned_evidence:
          - id: EVIDENCE-010
            record_refs:
              - R-003
              - R-006
              - AC-005
              - AC-008
              - INV-003
              - INV-005
        justification_refs:
          - R-003
          - R-006
        enforces_invariant_refs:
          - INV-003
          - INV-005
      - id: TASK-011
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-010
        planned_paths:
          - authoring/evals/mirror-refs-path-resolution.json
        planned_evidence:
          - id: EVIDENCE-011
            record_refs:
              - R-006
              - AC-008
              - INV-005
        justification_refs:
          - R-006
          - D-002
        enforces_invariant_refs:
          - INV-005
      - id: TASK-012
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-007
          - TASK-011
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-delivery.md
        planned_evidence:
          - id: EVIDENCE-012
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-006
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-008
              - INV-001
              - INV-002
              - INV-003
              - INV-005
        justification_refs:
          - R-006
          - D-007
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-005
      - id: TASK-013
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-012
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-live-run.md
        planned_evidence:
          - id: EVIDENCE-013
            record_refs:
              - R-005
              - AC-007
              - INV-004
        justification_refs:
          - R-005
          - D-004
        enforces_invariant_refs:
          - INV-004
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - .claude/skills/sdcorejs-ai-agent/SKILL.md
            - .claude/skills/sdcorejs-angular/SKILL.md
            - .claude/skills/sdcorejs-architecture/SKILL.md
            - .claude/skills/sdcorejs-brainstorming/SKILL.md
            - .claude/skills/sdcorejs-debug/SKILL.md
            - .claude/skills/sdcorejs-design/SKILL.md
            - .claude/skills/sdcorejs-documentation/SKILL.md
            - .claude/skills/sdcorejs-execute-plan/SKILL.md
            - .claude/skills/sdcorejs-explore/SKILL.md
            - .claude/skills/sdcorejs-git/SKILL.md
            - .claude/skills/sdcorejs-nestjs/SKILL.md
            - .claude/skills/sdcorejs-nextjs/SKILL.md
            - .claude/skills/sdcorejs-parallel-dispatch/SKILL.md
            - .claude/skills/sdcorejs-plan/SKILL.md
            - .claude/skills/sdcorejs-product/SKILL.md
            - .claude/skills/sdcorejs-repair-loop/SKILL.md
            - .claude/skills/sdcorejs-review/SKILL.md
            - .claude/skills/sdcorejs-ship/SKILL.md
            - .claude/skills/sdcorejs-simplify/SKILL.md
            - .claude/skills/sdcorejs-spec/SKILL.md
            - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
            - .claude/skills/sdcorejs-test/SKILL.md
            - .claude/skills/sdcorejs-using-skills/SKILL.md
            - .sdcorejs/summary.md
            - CHANGELOG.md
            - VALIDATION.md
            - authoring/evals/uiux/evidence.test.mjs
            - package.json
            - plugin/hooks/session-start.mjs
            - plugin/skills/sdcorejs-ai-agent/SKILL.md
            - plugin/skills/sdcorejs-angular/SKILL.md
            - plugin/skills/sdcorejs-architecture/SKILL.md
            - plugin/skills/sdcorejs-brainstorming/SKILL.md
            - plugin/skills/sdcorejs-debug/SKILL.md
            - plugin/skills/sdcorejs-design/SKILL.md
            - plugin/skills/sdcorejs-documentation/SKILL.md
            - plugin/skills/sdcorejs-execute-plan/SKILL.md
            - plugin/skills/sdcorejs-explore/SKILL.md
            - plugin/skills/sdcorejs-git/SKILL.md
            - plugin/skills/sdcorejs-nestjs/SKILL.md
            - plugin/skills/sdcorejs-nextjs/SKILL.md
            - plugin/skills/sdcorejs-parallel-dispatch/SKILL.md
            - plugin/skills/sdcorejs-plan/SKILL.md
            - plugin/skills/sdcorejs-product/SKILL.md
            - plugin/skills/sdcorejs-repair-loop/SKILL.md
            - plugin/skills/sdcorejs-review/SKILL.md
            - plugin/skills/sdcorejs-ship/SKILL.md
            - plugin/skills/sdcorejs-simplify/SKILL.md
            - plugin/skills/sdcorejs-spec/SKILL.md
            - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
            - plugin/skills/sdcorejs-test/SKILL.md
            - plugin/skills/sdcorejs-using-skills/SKILL.md
            - scripts/sync-skills.mjs
            - test/e2e/production-readiness-contract.test.mjs
          intended_new_paths:
            - path: test/e2e/mirror-refs-resolution.test.mjs
              owner_task_id: TASK-001
            - path: authoring/evals/mirror-refs-path-resolution.json
              owner_task_id: TASK-011
            - path: .sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-delivery.md
              owner_task_id: TASK-012
            - path: .sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-live-run.md
              owner_task_id: TASK-013
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
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-mirror-refs-rewritten
      planned_command: node --test test/e2e/mirror-refs-resolution.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mọi `_refs/` đi trước một đoạn đường dẫn đều có dạng `../../_refs/`; không còn `_refs/` trần đi trước đường dẫn
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-001
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-mirror-refs-resolve-r-001
      planned_command: node --test test/e2e/mirror-refs-resolution.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mọi tham chiếu trỏ tới file có thật
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-001
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-mirror-refs-resolve-r-004
      planned_command: node --test test/e2e/mirror-refs-resolution.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mọi tham chiếu trỏ tới file có thật
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-001
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-mirror-refs-header
      planned_command: node --test test/e2e/mirror-refs-resolution.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mỗi mirror có đúng một dòng path-resolution; câu như "chứa `_refs/`" giữ nguyên nghĩa
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-002
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-mirror-refs-bootstrap-absolute
      planned_command: node --test test/e2e/mirror-refs-resolution.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Nội dung chèn vào chứa `<pluginRoot>/_refs/...` tuyệt đối và tồn tại; không còn `../../_refs/`
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-003
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-mirror-refs-unchanged
      planned_command: node --test test/e2e/mirror-refs-resolution.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Không đổi byte nào; số đo bootstrap không đổi
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-010
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-001
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-mirror-refs-mutation
      planned_command: node --test test/e2e/mirror-refs-resolution.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: check:skills hoặc test báo lệch và fail
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-004
      risk: live-runtime-behavior-not-covered-by-unit-tests
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-mirror-refs-live-run
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: LIVE_AGENT
      automation: manual
      expected_proof: Transcript cho thấy `../../_refs/product/task-breakdown.md` được đọc ở lần đầu; kết quả AC-002/004/011/016 của product-task-breakdown-mode-v1 được ghi vào live-run-r3
      status: covered
      evidence_refs:
        - EVIDENCE-013
      rationale: Chỉ session tương tác thật chứng minh được model nạp ref và theo cổng.
      owner: user + executor
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-005
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-mirror-refs-delivery-hygiene
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Tất cả xanh; continuation mới hợp lệ; record task-breakdown verify như history tại 940fc0c; 23 public skill; CHANGELOG có entry Unreleased
      status: covered
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
  allowed_paths:
    - test/e2e/mirror-refs-resolution.test.mjs
    - test/e2e/production-readiness-contract.test.mjs
    - scripts/sync-skills.mjs
    - plugin/hooks/session-start.mjs
    - plugin/skills/sdcorejs-ai-agent/SKILL.md
    - .claude/skills/sdcorejs-ai-agent/SKILL.md
    - plugin/skills/sdcorejs-angular/SKILL.md
    - .claude/skills/sdcorejs-angular/SKILL.md
    - plugin/skills/sdcorejs-architecture/SKILL.md
    - .claude/skills/sdcorejs-architecture/SKILL.md
    - plugin/skills/sdcorejs-brainstorming/SKILL.md
    - .claude/skills/sdcorejs-brainstorming/SKILL.md
    - plugin/skills/sdcorejs-debug/SKILL.md
    - .claude/skills/sdcorejs-debug/SKILL.md
    - plugin/skills/sdcorejs-design/SKILL.md
    - .claude/skills/sdcorejs-design/SKILL.md
    - plugin/skills/sdcorejs-documentation/SKILL.md
    - .claude/skills/sdcorejs-documentation/SKILL.md
    - plugin/skills/sdcorejs-execute-plan/SKILL.md
    - .claude/skills/sdcorejs-execute-plan/SKILL.md
    - plugin/skills/sdcorejs-explore/SKILL.md
    - .claude/skills/sdcorejs-explore/SKILL.md
    - plugin/skills/sdcorejs-git/SKILL.md
    - .claude/skills/sdcorejs-git/SKILL.md
    - plugin/skills/sdcorejs-nestjs/SKILL.md
    - .claude/skills/sdcorejs-nestjs/SKILL.md
    - plugin/skills/sdcorejs-nextjs/SKILL.md
    - .claude/skills/sdcorejs-nextjs/SKILL.md
    - plugin/skills/sdcorejs-parallel-dispatch/SKILL.md
    - .claude/skills/sdcorejs-parallel-dispatch/SKILL.md
    - plugin/skills/sdcorejs-plan/SKILL.md
    - .claude/skills/sdcorejs-plan/SKILL.md
    - plugin/skills/sdcorejs-product/SKILL.md
    - .claude/skills/sdcorejs-product/SKILL.md
    - plugin/skills/sdcorejs-repair-loop/SKILL.md
    - .claude/skills/sdcorejs-repair-loop/SKILL.md
    - plugin/skills/sdcorejs-review/SKILL.md
    - .claude/skills/sdcorejs-review/SKILL.md
    - plugin/skills/sdcorejs-ship/SKILL.md
    - .claude/skills/sdcorejs-ship/SKILL.md
    - plugin/skills/sdcorejs-simplify/SKILL.md
    - .claude/skills/sdcorejs-simplify/SKILL.md
    - plugin/skills/sdcorejs-spec/SKILL.md
    - .claude/skills/sdcorejs-spec/SKILL.md
    - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
    - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
    - plugin/skills/sdcorejs-test/SKILL.md
    - .claude/skills/sdcorejs-test/SKILL.md
    - plugin/skills/sdcorejs-using-skills/SKILL.md
    - .claude/skills/sdcorejs-using-skills/SKILL.md
    - package.json
    - CHANGELOG.md
    - .sdcorejs/summary.md
    - authoring/evals/uiux/evidence.test.mjs
    - VALIDATION.md
    - authoring/evals/mirror-refs-path-resolution.json
    - .sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-delivery.md
    - .sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-live-run.md
  prohibited_paths:
    - skills/**
    - codex/**
    - AGENTS.md
    - .cursor/rules/**
    - .github/copilot-instructions.md
    - .sdcorejs/specs/**
    - .sdcorejs/architecture/**
    - node_modules/**
    - package-lock.json
    - site/**
    - .env*
    - authoring/skills/**
    - authoring/README.md
    - authoring/evals/product-task-breakdown-mode.json
    - authoring/evals/audit-findings-repair.json
    - authoring/evals/interaction-finish-contract.json
    - authoring/evals/skill-body-progressive-loading.json
    - authoring/evals/scenarios.json
    - authoring/evals/run-deterministic.mjs
    - authoring/evals/skill-authoring-contract.mjs
    - authoring/evals/uiux/*.json
  generated_artifacts:
    - plugin/skills/**
    - .claude/skills/**
    - plugin/_refs/**
    - .claude/_refs/**
    - plugin/sdcorejs-harness.json
    - .claude/sdcorejs-harness.json
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-delivery.md
    - .sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-live-run.md
    - CHANGELOG.md
    - VALIDATION.md
    - .sdcorejs/summary.md
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
    required: true
    files:
      - package.json
    scope: scripts only
    approval_required: true
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Script sinh mirror, hook và test; không có frontend.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Không có agent application.
  verification_strategy:
    package_manager: npm
    package_manager_evidence:
      - package.json packageManager npm@10.9.2
      - package-lock.json
    node_runtime: 22.22.3 qua fnm (engines ^22.22.3)
    commands_planned:
      - node --test test/e2e/mirror-refs-resolution.test.mjs test/e2e/production-readiness-contract.test.mjs (RED rồi GREEN)
      - npm run sync:skills
      - npm run check:skills
      - npm run check:text-hygiene
      - npm run check:executable-references
      - node scripts/measure-communication-economy.mjs (bootstrap không đổi)
      - node --test authoring/evals/uiux/evidence.test.mjs (RED rồi GREEN)
      - node --test --test-concurrency=1 --test-reporter=tap test/e2e/mirror-refs-resolution.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs (lần chạy ghi vào continuation, sau VALIDATION.md)
      - npm run test:e2e:repository
    commands_skipped:
      - npm run test:e2e (golden projects không bị chạm)
      - npm install / npm audit (không đổi dependency)
    checks: "Focused: test mới, case distribution-resolution, test hook session-start. Broad: test:e2e:repository, check:skills, hygiene."
  parallel_candidates:
    allowed: false
    contract: "Tuần tự: mirror phụ thuộc script sinh; evidence phụ thuộc mọi file nguồn."
    shared_files:
      - path: package.json
        owner: TASK-006
        strategy: chỉ sửa scripts
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - github.com/sdcorejs/sdcorejs-agent
    contract: Một repo standalone; mọi step dùng Git root sdcorejs-agent.
  branch_policy: "D-002: nhánh fix/mirror-refs-path-resolution từ 940fc0c; không push khi chưa được yêu cầu."
  finish_tail:
    contract: docs_before_final_branch_ready -> verify_before_done -> branch_ready_final_gate -> no_writes_after_branch_ready
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```
