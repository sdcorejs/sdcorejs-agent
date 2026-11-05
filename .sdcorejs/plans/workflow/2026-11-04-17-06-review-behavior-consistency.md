---
allowed_paths:
  - test/e2e/fixtures/review-behavior/manifest.json
  - test/e2e/fixtures/review-behavior/paging.mjs
  - test/e2e/fixtures/review-behavior/protection-server.mjs
  - test/e2e/fixtures/review-behavior/naming-routing.ts
  - test/e2e/fixtures/review-behavior/screens.ts
  - test/e2e/review-behavior-fixtures.test.mjs
  - _refs/shared/review-risk-contract.mjs
  - test/e2e/review-risk-contract.test.mjs
  - _refs/shared/review-contract.mjs
  - test/e2e/review-contract.test.mjs
  - test/e2e/convention-review.test.mjs
  - _refs/shared/review-data-completeness.md
  - skills/shared/workflow/review.md
  - _refs/shared/review-consistency.md
  - _refs/shared/review-code.md
  - _refs/shared/review-screen-patterns.md
  - _refs/shared/review-security.md
  - _refs/angular/review-security.md
  - _refs/angular/review-code.md
  - _refs/nestjs/review-security.md
  - _refs/nestjs/review-code.md
  - _refs/nextjs/build-website/review-security.md
  - _refs/nextjs/build-website/review-code.md
  - _refs/shared/project-bootstrap.md
  - _refs/shared/project-bootstrap-template.md
  - _refs/shared/project-bootstrap.mjs
  - test/e2e/project-bootstrap-contract.test.mjs
  - test/e2e/project-bootstrap-filesystem.test.mjs
  - skills/shared/workflow/explore.md
  - _refs/shared/convention-context.md
  - _refs/shared/convention-contract.mjs
  - _refs/shared/project-context.md
  - _refs/shared/project-context.mjs
  - test/e2e/convention-contract.test.mjs
  - test/e2e/project-context-artifact-lifecycle.test.mjs
  - skills/orchestration/using-skills.md
  - _refs/harness/runtime-policy.mjs
  - _refs/shared/finish-gate.md
  - skills/shared/sdlc/04-execute-plan.md
  - _refs/orchestration/tail/branch-ready.md
  - test/e2e/harness-behavioral-sentinel.test.mjs
  - test/e2e/support/harness-behavior-runner.mjs
  - test/e2e/fixtures/harness-behavior-scenarios.json
  - test/e2e/review-test-adequacy.test.mjs
  - skills/tracks/test/sdcorejs-test.md
  - _refs/shared/test-scope-and-coverage.md
  - _refs/shared/test-context.md
  - test/e2e/test-track-contract.test.mjs
  - authoring/evals/review-behavior/README.md
  - authoring/evals/review-behavior/scenarios.json
  - authoring/evals/review-behavior/run-offline.mjs
  - authoring/evals/review-behavior/evidence-contract.mjs
  - authoring/evals/review-behavior/fresh-run-template.json
  - test/e2e/review-agent-evaluation.test.mjs
  - test/e2e/support/skill-pack-runner.mjs
  - AGENTS.md
  - AGENTS.reference.md
  - CLAUDE.md
  - .github/copilot-instructions.md
  - README.md
  - package.json
  - plugin/hooks/session-start.mjs
  - test/e2e/entrypoint-smoke.test.mjs
  - test/e2e/mirror-refs-resolution.test.mjs
  - scripts/sync-skills.mjs
  - .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md
approval_source: explicit-user-choice
approved_at: 2026-11-04T10:06:15.070Z
approved_by: user
artifact_id: plan-review-behavior-consistency-20261104-r1
artifact_kind: plan
change_ref: review-behavior-consistency-20261104
commit_policy: with-change
contract_id: review-behavior-consistency-20261104
dependency_changes:
  packages: []
  required: false
env_changes:
  files: []
  required: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
generated_artifacts:
  - .claude/skills/**
  - plugin/skills/**
  - plugin/_refs/**
  - codex/skills/**
  - .cursor/rules/sdcorejs-agent.mdc
  - .claude/sdcorejs-harness.json
  - plugin/sdcorejs-harness.json
  - codex/sdcorejs-harness.json
  - .cursor/sdcorejs-harness.json
  - .github/sdcorejs-harness.json
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
migration_changes:
  description: Optional bootstrap policy extension; no automatic consumer migration.
  required: false
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:297cdfdf30c497bc616243acface33d030fa5ede20dfb98f00451d81ead7d455
    artifact_id: architecture-review-behavior-consistency-20261104-r1
    artifact_kind: architecture
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
parent_repository_id: null
phase_count: 5
prohibited_paths:
  - node_modules/**
  - package-lock.json
  - .env*
  - external-consumer-repositories
  - user-home-instructions
  - installed-home-skills
  - unrelated-durable-artifacts
repository_relative_path: .sdcorejs/plans/workflow/2026-11-04-17-06-review-behavior-consistency.md
requirement_id: R-001
schema_version: 1
source_architecture: .sdcorejs/architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md
source_plan: none
source_revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
source_spec: .sdcorejs/specs/workflow/2026-11-04-16-36-review-behavior-consistency.md
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
task_count: 10
track: workflow
approval_hash: sha256:v1:678033ca29f9243b7c6445dd4673b0682e47187afbb6a438dd258fd0932290bb
---
> Approved plan snapshot. Draft lifecycle notes below describe the review history; this frontmatter and the structured contract record the explicit approval. Own plan identity is derived from verified frontmatter.


# Kế hoạch triển khai review, convention và kiểm tra thay đổi nhỏ

## 1. Phạm vi đã duyệt

Thực hiện R-001–R-010 và AC-001–AC-026 trong [đặc tả đã duyệt](../../specs/workflow/2026-11-04-16-36-review-behavior-consistency.md). Giữ các invariants của [kiến trúc đã duyệt](../../architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md). [Coverage companion](../../docs/workflow/2026-11-04-13-56-review-behavior-consistency-coverage.md) là dữ liệu có cấu trúc cho requirements, decisions, tasks, file ownership và bằng chứng dự kiến; không phải trạng thái tiến độ phiên làm việc.

Đặc tả và kiến trúc đã được duyệt, lưu snapshot và verify bằng helper canonical. Kế hoạch này đã hoàn thiện để duyệt; chưa có approved plan hoặc quyền bắt đầu implementation. Khi người dùng duyệt kế hoạch và yêu cầu triển khai, chốt decision coverage và snapshot plan, verify chuỗi spec → architecture → plan, rồi handoff sang `sdcorejs-execute-plan`.

## 2. Execution context

- Target: repo `sdcorejs-agent`, ID `github.com/sdcorejs/sdcorejs-agent`; Git root đã xác minh `C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent`.
- Track `workflow`, profile `markdown-skill-pack`; helper/test dùng Node ESM (`node-esm`).
- Coverage: TDD cho helper/writer; executable fixture + paired controls + mutation; fresh-context semantic review là lớp riêng.
- Execution policy: `sequential`. Không fan-out/subagent implementation trong plan này vì review/Explore/dispatch chia sẻ contract. Fresh reviewer evaluation là test isolation có scope riêng, chỉ chạy khi được cho phép và có runtime hỗ trợ.
- Package manager: `npm@10.9.2` từ package.json. Dùng dependency hiện có; không install hoặc sửa lockfile.
- Architecture gate required với bốn signals trong spec. Frontend architecture/application-agent architecture: not-applicable vì không xây ứng dụng.
- `approved_spec_path/hash/reference` và `approved_architecture_path/hash/reference` đã gắn exact snapshots trong coverage companion; cả pre-plan và draft-plan handoff hợp lệ. `approved_plan_path/hash` còn `null` đến khi người dùng duyệt.

## 3. Preflight trước implementation

1. Verify approved artifacts, source revision, decision coverage, validation map và owner. Nếu draft hoặc snapshot lệch thì sửa kế hoạch/phê duyệt trước khi làm.
2. Kiểm tra branch, HEAD, staged/unstaged diffstat, untracked files, repo root, allowed/prohibited paths. Giữ nguyên dirty files không thuộc plan; chỉ hỏi khi có xung đột ghi thực tế.
3. Thực hiện trên feature branch theo chính sách Git. Không tự tạo worktree, commit hoặc push nếu chưa được yêu cầu.
4. Đối chiếu CREATE/EDIT với filesystem hiện tại; không overwrite CREATE đã tồn tại. Liệt kê lại package scripts và toolchain; không giả định baseline khảo sát còn mới sau khi HEAD thay đổi.
5. Chạy baseline `npm run test:e2e:conventions` và các suite hiện hữu bị ảnh hưởng trước khi sửa contract. Lưu evidence revision/diff; failure có sẵn phải được phân biệt.
6. Với judgment-heavy scenario, chuẩn bị fixture/oracle trước và thu RED trên revision chưa sửa nếu fresh reviewer được cho phép. Nếu chưa thể chạy, ghi `NOT RUN`; không lấy module-not-found hoặc transcript tự viết làm RED.

## 4. Các phase và task

Mọi CREATE/EDIT dưới đây thuộc duy nhất owner repo nêu ở mục 2. Paths đều relative với Git root đó. Mỗi path canonical có một task chịu trách nhiệm ghi; task sau chỉ đọc hoặc yêu cầu task owner sửa lại. Khi có sửa lại, chạy affected checks trước khi đi tiếp.

### Phase 1 — Bộ tình huống và hợp đồng evidence

**1. TASK-001 — Dựng fixture lỗi thật và control hợp lệ.** Dependencies: không có.

- CREATE `test/e2e/fixtures/review-behavior/manifest.json`.
- CREATE `test/e2e/fixtures/review-behavior/paging.mjs`, `protection-server.mjs`, `naming-routing.ts`, `screens.ts`.
- CREATE `test/e2e/review-behavior-fixtures.test.mjs`.
- Fixtures dùng dữ liệu tổng hợp và loopback HTTP server; không dùng DB/credential/network ngoài sandbox. Tách source, prompt và oracle; reviewer không nhận nhãn unsafe/safe hoặc expected findings.
- Bao phủ 0/1/999/1000/1001, server clamp, missing/incorrect total, cursor, lỗi trang sau, cancellation, ordering; permission/owner/tenant denial; semantic naming/routes/screens và paired controls.
- Dùng module thực thi được để chứng minh record cuối bị thiếu và request trái quyền bị từ chối/chấp nhận theo variant. Biến thể bug phục vụ regression, không sửa ứng dụng ngoài repo.
- Done: fixture tests chứng minh đúng hành vi unsafe/safe, không mock function dưới test; dữ liệu và nội dung user-facing không chứa PII/secret.

**2. TASK-002 — Thêm assessment và kiểm tra coverage/provenance.** Dependencies: TASK-001.

- CREATE `_refs/shared/review-risk-contract.mjs`, `test/e2e/review-risk-contract.test.mjs`.
- EDIT `_refs/shared/review-contract.mjs`, `test/e2e/review-contract.test.mjs`, `test/e2e/convention-review.test.mjs`.
- Viết RED qua public contract hiện có: thiếu evidence nhưng claim checked, thiếu category bắt buộc, stale scope, finding thiếu path/trigger/test gap, duplicate primary finding và context cũ.
- Helper mới pure, versioned và không scan/cài tool/gọi network. Không tự suy ra source defect từ một finding object. Reuse severity/dimension và convention validators hiện có.
- Legacy context parse được với coverage `unknown`; producer mới không được tuyên bố hoàn thành nếu mandatory assessment chưa có bằng chứng.
- Done: positive/negative/mutation contract cases pass; context cũ và narrow dimension được bảo toàn. Missing module/import không được coi là RED chứng minh hành vi.

### Phase 2 — Hành vi review theo source và risk

**3. TASK-003 — Nâng semantic naming, route và hardcoded/paging review.** Dependencies: TASK-002.

- EDIT `skills/shared/workflow/review.md`, `_refs/shared/review-consistency.md`, `_refs/shared/review-code.md`.
- CREATE `_refs/shared/review-data-completeness.md`.
- Quy định bước chọn evidence, typed/semantic classification, đọc semantic neighbors, phân loại authority/confidence, evidence limitation và assessment output.
- Bao phủ literal/constant/config, producer→consumer, completion metadata và hậu quả; hướng fix tùy use case. Giữ trường hợp intentionally paged/true domain cap hợp lệ.
- Naming có date/instant/duration, collection/map/irregular plural; route so sánh trong boundary và ghi compatibility khi đề xuất đổi.
- Done: toàn bộ nhóm R-001/R-002/R-005 có checklist thao tác và fixture mapping cụ thể; không chỉ thêm keyword vào description; review vẫn read-only.

**4. TASK-004 — Chuẩn hóa protection và screen archetype review.** Dependencies: TASK-003.

- EDIT `_refs/shared/review-security.md`, `_refs/angular/review-security.md`, `_refs/angular/review-code.md`.
- EDIT `_refs/nestjs/review-security.md`, `_refs/nestjs/review-code.md`.
- EDIT `_refs/nextjs/build-website/review-security.md`, `_refs/nextjs/build-website/review-code.md`.
- CREATE `_refs/shared/review-screen-patterns.md`.
- Thay quy tắc hiện diện decorator/guard cục bộ bằng tracing hiệu lực phù hợp profile. Không bắt plain NestJS dùng `@HasPermission`, không bỏ global/inherited guard, không dùng UI làm bằng chứng backend authorization.
- Ma trận action/permission/owner/tenant/test; so sánh list/detail/form với exemplar có nguồn. Không kết luận rendered UI từ source-only evidence.
- Done: security controls và valid inheritance được xử lý nhất quán; scope guards giữa Core UI/plain profiles giữ nguyên; không mở rộng sang vận hành production.

### Phase 3 — Explore, AGENTS và fast-fix

**5. TASK-005 — Bootstrap có authority và đồng bộ an toàn.** Dependencies: TASK-004.

- EDIT `skills/shared/workflow/explore.md`, `_refs/shared/convention-context.md`, `_refs/shared/convention-contract.mjs`.
- EDIT `_refs/shared/project-context.md`, `_refs/shared/project-context.mjs`, `test/e2e/convention-contract.test.mjs`, `test/e2e/project-context-artifact-lifecycle.test.mjs`.
- CREATE `_refs/shared/project-bootstrap.md`, `_refs/shared/project-bootstrap-template.md`, `_refs/shared/project-bootstrap.mjs`.
- CREATE `test/e2e/project-bootstrap-contract.test.mjs`, `test/e2e/project-bootstrap-filesystem.test.mjs`.
- Viết RED trước: absent/disabled/manual policy, authorized after-sync, readonly review, source injection, malformed marker, unsupported version, nested owner, symlink/reparse/path escape, concurrent edit, idempotency và byte preservation.
- Tách planning/validation khỏi apply; explicit target và expected content hash; atomic replace + postcheck; lỗi không làm mất nội dung ngoài block. Existing policy giữ tương thích qua optional extension.
- Phân biệt atomic replace với atomic version check. Nếu host không có primitive phù hợp hoặc không xác lập cooperative exclusive writer lease, helper chỉ trả proposal; thêm test từ chối apply trong điều kiện đó. Không dùng lock file đơn thuần để tuyên bố bảo vệ trước mọi editor.
- Ghi provenance của managed block và authority vừa đủ; không tạo session ledger hoặc duplicate convention catalog. Sync sau final code, không ghi từ reviewer hay worker.
- Done: các test filesystem chạy trong temp sandbox, giữ nguyên target ngoài scope, lần sync thứ hai không diff; thiếu authority chỉ trả proposal/reason.

**6. TASK-006 — Baseline bắt buộc trong dispatch và fast-fix.** Dependencies: TASK-005.

- EDIT `skills/orchestration/using-skills.md`, `_refs/harness/runtime-policy.mjs`, `_refs/shared/finish-gate.md`.
- EDIT `skills/shared/sdlc/04-execute-plan.md`, `_refs/orchestration/tail/branch-ready.md`.
- EDIT `test/e2e/harness-behavioral-sentinel.test.mjs`, `test/e2e/support/harness-behavior-runner.mjs`, `test/e2e/fixtures/harness-behavior-scenarios.json`.
- Baseline theo intent + changed surfaces; gọn cho low-risk fix; explicit risk escalation cho auth/tenant/public contract/completeness. Không dùng diff-size làm risk classifier duy nhất.
- Prompt Việt/Anh: sửa nhanh, đổi biến, thêm dropdown, đổi pageSize, chỉnh guard, pressure bỏ review; paired Q&A/typo/read-only controls.
- Hook là bootstrap hỗ trợ, không phải cam kết universal interception. Runtime không hỗ trợ nêu limitation và dùng portable preflight.
- Done: routing hiện có không bị chiếm bởi trigger rộng; fast-fix baseline có evidence/gaps, final branch-ready không bị writes sau gate.

### Phase 4 — Chất lượng test và bằng chứng reviewer

**7. TASK-007 — Risk-to-test mapping và mutation thực sự.** Dependencies: TASK-006.

- EDIT `skills/tracks/test/sdcorejs-test.md`, `_refs/shared/test-scope-and-coverage.md`, `_refs/shared/test-context.md`, `test/e2e/test-track-contract.test.mjs`.
- CREATE `test/e2e/review-test-adequacy.test.mjs`.
- Reuse validation-map authority, không tạo enum coverage hoặc decision approval mới. Nêu smallest proving layer, current case/command/revision và assertion bắt lỗi.
- Mutation paging bỏ continuation và protection bỏ enforcement phải làm test fail vì sai behavior; unrelated green, request-shape-only assertion, fixture transcript hoặc stale run không chứng minh AC.
- Done: reviewer thấy rõ test gap cho 1.001 records và server denial; không đòi test mới cho mọi thay đổi format/typo.

**8. TASK-008 — Đánh giá source-to-finding và tính toàn vẹn evidence.** Dependencies: TASK-007.

- CREATE `authoring/evals/review-behavior/README.md`, `scenarios.json`, `run-offline.mjs`, `evidence-contract.mjs`, `fresh-run-template.json`.
- CREATE `test/e2e/review-agent-evaluation.test.mjs`.
- EDIT `test/e2e/support/skill-pack-runner.mjs` để mở rộng harness hiện có; không thay runner hoặc dùng expected finding làm observed result.
- Offline runner kiểm tra dataset, routing/contract và executable fixture; ghi chính xác đây không phải LLM semantic detection.
- Fresh-context protocol giữ oracle ngoài prompt/source input; transcript/model/runtime/revision provenance; adjudication thủ công theo expected/observed và paired controls. Case pressure không được biến review thành write hoặc observed thành required.
- Fresh-run template dùng `NOT RUN`, metadata chưa có là null. Actual records chỉ được tạo từ run thật, có authorization, sanitized và được bind source manifests; output mới là evidence-owned path, không bịa kết quả.
- Chạy cùng case trước/sau để có RED/GREEN nếu môi trường được phép. Các case detection trọng yếu phải tìm đúng lỗi/locator; negative controls không có blocker giả; ambiguous cases thể hiện uncertainty. Báo từng case và denominator, không tự đặt phần trăm chất lượng toàn cục.
- Done offline: dataset/evidence integrity tests pass. Done capability: AC-025 có transcript fresh và được đánh giá; nếu chưa có thì giữ NOT RUN, không tuyên bố toàn bộ năng lực đã nghiệm thu.

### Phase 5 — Phân phối, tài liệu và nghiệm thu

**9. TASK-009 — Đồng bộ entrypoint, scripts, docs và mirrors.** Dependencies: TASK-008.

- EDIT `AGENTS.md`, `AGENTS.reference.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `README.md`, `package.json`.
- EDIT `plugin/hooks/session-start.mjs`, `test/e2e/entrypoint-smoke.test.mjs`, `test/e2e/mirror-refs-resolution.test.mjs`.
- VERIFY THEN EDIT `scripts/sync-skills.mjs` chỉ nếu discovery/mapping hiện tại không sinh được reference/action mới; không sửa generator nếu sync có sẵn đã đáp ứng.
- Thêm đúng ba scripts dự kiến ở mục 6; không đổi dependencies, engines hoặc lockfile.
- Giữ canonical prose/template tiếng Anh; user runtime localization; hướng dẫn setup/disable/repair managed block, legacy coverage và limitations.
- GENERATE qua `npm run sync:skills`: `.claude/skills/**`, `plugin/skills/**`, `plugin/_refs/**`, `codex/skills/**`, `.cursor/rules/sdcorejs-agent.mdc` và các harness manifests được generator sở hữu. Không hand-edit; chỉ chấp nhận diff phát sinh từ source đã duyệt.
- Done: 24 public skills, no internal-authoring leak, entrypoint/mirror/reference checks pass; không thay global/home installation.

**10. TASK-010 — Review cuối, lưu bằng chứng và handoff.** Dependencies: TASK-009.

- CREATE `.sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md` khi implementation thực sự chạy; đây là change-scoped evidence record, không phải mutable progress log.
- Đối chiếu AC/task/case/exact command/current diff; ghi actual passes, failures, skipped/live NOT RUN, repair và compatibility caveats. Không copy toàn bộ transcript hoặc thông tin nhạy cảm.
- Chạy focused checks, broad repository checks và mirror checks sau source cuối. Review evidence, repair trong owner scope nếu được cho phép, rerun affected checks; hoàn tất docs/convention sync trước branch-ready.
- Final read-only branch-ready sau mọi writes. Nếu phải sửa sau đó, invalidate và chạy lại gate; không commit/push tự động.
- Done: không còn lỗi blocker trong scope đã chứng minh; mọi NOT RUN/deferred được nêu rõ. AC-025 chưa chứng minh thì handoff là implementation/offline validation có giới hạn, không phải full capability acceptance.

## 5. Write boundaries và rollback

Allowed canonical paths là exact `planned_paths` trong coverage companion; mỗi CREATE đã được kiểm tra absent khi soạn, mỗi EDIT hiện có đã được kiểm tra exists. Generated paths chỉ qua generator và chỉ do source trong plan gây ra. Execution doc của TASK-010 chỉ tạo khi có kết quả thực.

Prohibited: repo tiêu thụ thật, global/home AGENTS, bản cài skill ở home, `.env*` có giá trị thật, credentials, production data, `node_modules/**`, lockfile, package dependencies/engines, arbitrary generated files, unrelated `.sdcorejs` history, Git remote mutations. Không thêm public skill, provider client hoặc deployment integration.

Shared-file coordination: TASK-002 sở hữu review contract; TASK-005 convention/project context; TASK-006 runtime/finish contracts; TASK-008 authoring harness; TASK-009 package/entrypoints/generator/mirrors. Không sửa chéo owner trong một wave. Sequencing bắt buộc cho mutation; command đọc độc lập có thể batch.

Rollback: revert exact task-owned changes trong branch sau khi xác nhận user edits; không reset/clean toàn repo. Managed bootstrap có disable policy và bounded remove có authorization; tuyệt đối không restore toàn AGENTS đè lên người dùng. Không tự rollback public route/data vì các thay đổi đó không nằm trong scope.

## 6. Verification commands

Tất cả commands chạy tại Git root, dùng npm đã phát hiện. Không có `npx --yes`, install hoặc tool provisioning. Các script `planned-new` chỉ chạy sau khi TASK-009 tạo; trước đó dùng `node --test <exact-file>` sau khi test file đã được viết.

| Command | Nguồn | Chứng minh |
|---|---|---|
| `npm run test:e2e:conventions` | package.json hiện có | Convention schema/ownership/read-only/compatibility |
| `node --test test/e2e/review-contract.test.mjs` | Node test runner và file hiện có | Review contract regressions |
| `npm run test:e2e:harness` | package.json hiện có | Dispatch/runtime/portable baseline |
| `node --test test/e2e/test-track-contract.test.mjs` | Node test runner và file hiện có | Test evidence lifecycle |
| `npm run test:e2e:review-behavior` | planned-new, TASK-009 | Fixture, risk contract, adequacy và evaluation-integrity tests |
| `npm run test:e2e:project-bootstrap` | planned-new, TASK-009 | Policy và filesystem managed-write tests |
| `npm run eval:review:offline` | planned-new, TASK-009 | Offline dataset/routing/fixture evidence, không gọi provider |
| `node authoring/evals/run-deterministic.mjs` | authoring/README.md hiện có | Existing authoring cases vẫn đúng |
| `npm run test:e2e:skill-authoring` | package.json hiện có | Inventory/internal-boundary regression |
| `npm run test:e2e:repository` | package.json hiện có, cập nhật include suites mới | Broad workflow contract compatibility |
| `npm run check:text-hygiene` | package.json hiện có | Encoding/mojibake/text checks |
| `npm run check:executable-references` | package.json hiện có | Reference integrity |
| `npm run sync:skills` rồi `npm run check:skills` | package.json hiện có | Generated mirrors hợp lệ |
| `npm run check:skills:ps` | package.json hiện có | Windows sync path; bắt buộc nếu sửa generator |
| `npm run test:e2e:phase3` | package.json hiện có | Entrypoint smoke |

Script mới dự kiến:

```json
{
  "test:e2e:review-behavior": "node --test test/e2e/review-behavior-fixtures.test.mjs test/e2e/review-risk-contract.test.mjs test/e2e/review-test-adequacy.test.mjs test/e2e/review-agent-evaluation.test.mjs",
  "test:e2e:project-bootstrap": "node --test test/e2e/project-bootstrap-contract.test.mjs test/e2e/project-bootstrap-filesystem.test.mjs",
  "eval:review:offline": "node authoring/evals/review-behavior/run-offline.mjs"
}
```

`test:e2e:repository` phải bao gồm các test mới đúng một lần, theo cơ chế liệt kê hiện tại. Nếu package script thay đổi cần kiểm tra manifest/lockfile invariants hiện hữu; không cập nhật dependency lock chỉ vì thêm script.

Không chạy site build/browser của sản phẩm ngoài scope, dependency audit mạng, live provider hoặc cài công cụ trong bước viết tài liệu. Trong implementation, script không chạy được phải ghi chính xác prerequisite/failure; không biến skipped thành pass hoặc tự thêm quyền.

## 7. Acceptance mapping và evidence boundaries

| AC | Task chịu trách nhiệm | Evidence dự kiến |
|---|---|---|
| AC-001–AC-003 | TASK-003, TASK-005, TASK-008 | Semantic fixture/precedence controls + fresh reviewer adjudication |
| AC-004–AC-006 | TASK-001, TASK-004, TASK-008 | Loopback HTTP, inherited guard controls, screen fixture và source-to-finding |
| AC-007–AC-011 | TASK-001, TASK-003, TASK-008 | Paging executable data + defect/control source review |
| AC-012–AC-013 | TASK-007 | Adequacy contract và behavioral mutations |
| AC-014–AC-016 | TASK-006, TASK-008 | Routing/baseline cases và fresh prompt behavior |
| AC-017–AC-020 | TASK-005 | Policy + filesystem integration, concurrent/negative cases |
| AC-021–AC-023 | TASK-002 | Assessment/compatibility contract; ngữ nghĩa cần AC-025 |
| AC-024–AC-025 | TASK-008, TASK-010 | Offline/live separation và fresh transcript; NOT RUN nếu chưa có |
| AC-026 | TASK-009, TASK-010 | Source/mirror/inventory/entrypoint checks |

Coverage companion có mapping riêng từng AC với case ID, level, command, task/evidence owner, status của kế hoạch và structured boundary. `status: covered` trong validation map chỉ có nghĩa đã có kế hoạch kiểm chứng, không có nghĩa test đã viết/chạy/pass. Không sử dụng planned evidence ID như run receipt.

AC-005 là authorization boundary của fixture server, có API E2E denial; AC-017–AC-020 là boundary quyền ghi instruction trong filesystem, có integration tests và được giữ nguyên invariant ownership. Không giả claim HTTP test chứng minh filesystem authority. Mọi plan boundary cần được bind decision approval chính thức khi snapshot.

## 8. Self-review và approval gate

Kiểm tra trước khi trình: paths create/edit, requirement→AC→task→evidence, task dependency graph, invariant enforcement, command provenance, read-only/ownership và no-writes-after-final-gate. Dữ liệu structured nằm trong coverage companion. Spec và architecture identities, pre-plan/draft-plan handoff, decision coverage cấu trúc, goal-backward graph và repository ownership đều hợp lệ; 66 CREATE/EDIT paths không xung đột. Validation-map chỉ còn thiếu chữ ký approval cho task/evidence mapping của plan; không dùng spec approval thay cho plan approval.

Việc duyệt plan chốt scope/task/package script writes. Nó không tự cấp quyền chạy provider trả phí, sửa dự án tiêu thụ, commit/push/release hoặc deploy. Snapshot spec và kiến trúc đã có. Bước tiếp theo là người dùng duyệt plan → chốt decision coverage/plan snapshots → verify toàn chuỗi và validation map → execute-plan khi được yêu cầu triển khai.


## Approved execution contract

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: review-behavior-consistency-20261104
  requirement_id: R-001
  track: workflow
  stack_profile: markdown-skill-pack
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  source_revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
  spec_draft_path: .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-spec.md
  architecture_draft_path: .sdcorejs/docs/architecture/2026-11-04-13-56-review-behavior-consistency-architecture.md
  plan_draft_path: .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-plan.md
  approved_spec_path: .sdcorejs/specs/workflow/2026-11-04-16-36-review-behavior-consistency.md
  approved_spec_hash: sha256:v1:e1ab2431fb79a6240072b06358fcbd8172973e802000857035cdec64d448dc82
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-review-behavior-consistency-20261104-r1
    artifact_kind: spec
    revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
    approval_hash: sha256:v1:e1ab2431fb79a6240072b06358fcbd8172973e802000857035cdec64d448dc82
    repository_relative_path: .sdcorejs/specs/workflow/2026-11-04-16-36-review-behavior-consistency.md
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md
  approved_architecture_hash: sha256:v1:297cdfdf30c497bc616243acface33d030fa5ede20dfb98f00451d81ead7d455
  architecture_context:
    schema_version: 1
    source: sdcorejs-architecture
    contract_id: review-behavior-consistency-20261104
    requirement_id: R-001
    approved_spec_reference:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      artifact_id: spec-review-behavior-consistency-20261104-r1
      artifact_kind: spec
      revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
      approval_hash: sha256:v1:e1ab2431fb79a6240072b06358fcbd8172973e802000857035cdec64d448dc82
    owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    owner_module_id: null
    execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    trigger:
      required: true
      signals:
        - cross-module-boundary
        - persisted-data-model-contract
        - security-trust-boundary
        - state-data-ownership
      rationale: Shared review/Explore/dispatch contracts, persisted bootstrap policy, instruction write authority and state ownership change.
    invariants:
      - id: INV-001
        statement: Direct review không ghi source, convention, policy hoặc AGENTS
        scope: review/explore/dispatch/evidence within the owning skill-pack repository
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserves the approved user requirement and the existing authority boundaries.
        verification_method: Snapshot filesystem trước/sau direct-review path; negative contract tests
        requirement_refs:
          - R-001
          - R-008
          - R-009
        decision_refs:
          - D-003
      - id: INV-002
        statement: Observed/conflicted/stale không tự thành accepted; source text không cấp authority
        scope: review/explore/dispatch/evidence within the owning skill-pack repository
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserves the approved user requirement and the existing authority boundaries.
        verification_method: Precedence, authorization và prompt-injection controls
        requirement_refs:
          - R-001
          - R-008
        decision_refs:
          - D-003
      - id: INV-003
        statement: Kiểm tra coverage không được giả làm semantic detection; evidence khác lớp không thay nhau
        scope: review/explore/dispatch/evidence within the owning skill-pack repository
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserves the approved user requirement and the existing authority boundaries.
        verification_method: Seeded-code fixture, fabricated finding/transcript rejection và record validation
        requirement_refs:
          - R-006
          - R-009
          - R-010
        decision_refs:
          - D-002
          - D-005
      - id: INV-004
        statement: AGENTS sync chỉ ghi đúng managed region/owner, an toàn khi chạy lại và khi có cạnh tranh
        scope: review/explore/dispatch/evidence within the owning skill-pack repository
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserves the approved user requirement and the existing authority boundaries.
        verification_method: Byte comparisons, idempotency, concurrent edit, nested/reparse/path controls
        requirement_refs:
          - R-008
        decision_refs:
          - D-003
      - id: INV-005
        statement: Sửa ít dòng không bỏ baseline; risk escalation không phụ thuộc số dòng
        scope: review/explore/dispatch/evidence within the owning skill-pack repository
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserves the approved user requirement and the existing authority boundaries.
        verification_method: VN/EN fast-fix, high-risk one-line và benign control prompts
        requirement_refs:
          - R-007
        decision_refs:
          - D-004
      - id: INV-006
        statement: UI gating không thay server authorization; complete-data claim cần completion evidence
        scope: review/explore/dispatch/evidence within the owning skill-pack repository
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserves the approved user requirement and the existing authority boundaries.
        verification_method: Real loopback HTTP denial và pagination completeness/error cases
        requirement_refs:
          - R-003
          - R-005
        decision_refs:
          - D-002
          - D-005
      - id: INV-007
        statement: Compatibility, accepted exceptions và review dimension được bảo toàn
        scope: review/explore/dispatch/evidence within the owning skill-pack repository
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserves the approved user requirement and the existing authority boundaries.
        verification_method: Legacy context, public aliases, mapping và narrow-review controls
        requirement_refs:
          - R-001
          - R-002
          - R-009
        decision_refs:
          - D-002
      - id: INV-008
        statement: Canonical source duy nhất; mirror sinh bằng tool; không thêm public skill hay dependency
        scope: review/explore/dispatch/evidence within the owning skill-pack repository
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserves the approved user requirement and the existing authority boundaries.
        verification_method: Inventory/manifest/mirror checks, lockfile diff và internal non-distribution tests
        requirement_refs:
          - R-010
        decision_refs:
          - D-001
          - D-006
    boundaries:
      - id: BND-001
        statement: Explore reads conventions; review produces source-backed findings and never mutates instructions or code.
        invariant_refs:
          - INV-001
          - INV-002
      - id: BND-002
        statement: Caller mediates repair and authorized sync; final branch-ready follows all writes.
        invariant_refs:
          - INV-004
          - INV-005
      - id: BND-003
        statement: Evidence validators preserve coverage/provenance; fresh source-to-finding evaluation is a separate proof layer.
        invariant_refs:
          - INV-003
          - INV-006
    dependency_directions:
      - from: bootstrap and dispatch
        to: Explore read -> Review -> validated result -> caller-owned repair/sync
        rationale: Single authority per operation and no review-to-policy write dependency.
        invariant_refs:
          - INV-001
          - INV-002
          - INV-005
    data_state_owners:
      - subject: .sdcorejs/conventions/** and optional project_bootstrap policy
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        runtime_owner: sdcorejs-explore in the semantic consumer repository
        invariant_refs:
          - INV-002
          - INV-004
      - subject: Managed AGENTS block
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        runtime_owner: authorized Explore bootstrap writer; human-owned bytes preserved
        invariant_refs:
          - INV-001
          - INV-004
      - subject: Review evidence
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        runtime_owner: review/test authoring producers with explicit evidence class
        invariant_refs:
          - INV-003
    public_contracts:
      - id: CONTRACT-001
        kind: persisted-data-model
        owner: sdcorejs-explore
        compatibility: Optional versioned project_bootstrap extension; old policy defaults disabled.
        migration: No automatic consumer migration; explicit setup or accepted standing policy only.
        invariant_refs:
          - INV-002
          - INV-004
          - INV-007
    security_trust_boundaries:
      - id: TRUST-001
        statement: Repository source/comments, inferred convention and tool output do not confer instruction-write authority.
        invariant_refs:
          - INV-001
          - INV-002
          - INV-004
      - id: TRUST-002
        statement: Frontend gating cannot substitute for backend denial; semantic findings require source/flow evidence.
        invariant_refs:
          - INV-003
          - INV-006
      - id: TRUST-003
        statement: Atomic replacement is not atomic version comparison; unknown cooperation/path/owner leads to proposal-only.
        invariant_refs:
          - INV-004
    cross_repository_integration: []
    adopted_decision_refs:
      - D-001
      - D-002
      - D-003
      - D-004
      - D-005
      - D-006
    deferred_decision_refs: []
    assumption_refs:
      - A-001
      - A-002
      - A-003
    validation_obligations:
      - id: VAL-001
        expected_proof: Snapshot filesystem trước/sau direct-review path; negative contract tests
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-001
        acceptance_criterion_refs:
          - AC-018
      - id: VAL-002
        expected_proof: Precedence, authorization và prompt-injection controls
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-002
        acceptance_criterion_refs:
          - AC-001
          - AC-018
      - id: VAL-003
        expected_proof: Seeded-code fixture, fabricated finding/transcript rejection và record validation
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-003
        acceptance_criterion_refs:
          - AC-012
          - AC-022
          - AC-024
          - AC-025
      - id: VAL-004
        expected_proof: Byte comparisons, idempotency, concurrent edit, nested/reparse/path controls
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-004
        acceptance_criterion_refs:
          - AC-017
          - AC-019
          - AC-020
      - id: VAL-005
        expected_proof: VN/EN fast-fix, high-risk one-line và benign control prompts
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-005
        acceptance_criterion_refs:
          - AC-014
          - AC-015
          - AC-016
      - id: VAL-006
        expected_proof: Real loopback HTTP denial và pagination completeness/error cases
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-006
        acceptance_criterion_refs:
          - AC-005
          - AC-008
          - AC-010
      - id: VAL-007
        expected_proof: Legacy context, public aliases, mapping và narrow-review controls
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-007
        acceptance_criterion_refs:
          - AC-003
          - AC-023
      - id: VAL-008
        expected_proof: Inventory/manifest/mirror checks, lockfile diff và internal non-distribution tests
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-008
        acceptance_criterion_refs:
          - AC-026
    profile_sections:
      frontend_architecture_ref: null
      agent_architecture_ref: null
    change_control:
      revision: 1
      supersedes: null
    approved_architecture_path: .sdcorejs/architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md
    approved_architecture_hash: sha256:v1:297cdfdf30c497bc616243acface33d030fa5ede20dfb98f00451d81ead7d455
  approved_plan_path: null
  approved_plan_hash: null
  architecture_gate:
    valid: true
    required: true
    status: required
    signals:
      - cross-module-boundary
      - persisted-data-model-contract
      - security-trust-boundary
      - state-data-ownership
    bypass: null
    rationale: Shared review/Explore/dispatch contracts, persisted bootstrap policy, instruction write authority and state ownership change.
  decision_coverage: &a1
    schema_version: 1
    revision: 2
    records:
      - id: R-001
        type: requirement
        statement: Khôi phục convention phù hợp với repo/module/boundary; đọc nguồn chính thức, evidence hiện tại và ngoại lệ; phân biệt accepted, observed, conflicted, stale. Thiếu registry không làm review bỏ qua code và không cho phép tự tạo policy.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-003
          - TASK-005
          - TASK-008
      - id: R-002
        type: requirement
        statement: Đánh giá tên variable/property/parameter/function và route theo kiểu, cardinality, vai trò, đơn vị và cách sử dụng; đối chiếu các lớp có liên hệ và giữ compatibility của hợp đồng công khai.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-003
          - TASK-008
      - id: R-003
        type: requirement
        statement: Kiểm tra protection có hiệu lực, permission mapping, thứ tự auth/policy, ownership và tenant theo kiến trúc thực tế; bao phủ các action có trong phạm vi thay đổi.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-008
      - id: R-004
        type: requirement
        statement: So sánh list/detail/form với mẫu tương đương và quy tắc được chấp nhận trong dự án; đánh giá loading, empty, error, paging/filter/sort, mutation refresh, validation và navigation.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-004
          - TASK-008
      - id: R-005
        type: requirement
        statement: Phát hiện hardcode và giả định giới hạn dữ liệu theo hậu quả; truy vết luồng phân trang được sử dụng như toàn bộ; phân biệt giá trị hợp lệ, giả định chưa chứng minh và lỗi có bằng chứng.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
      - id: R-006
        type: requirement
        statement: Đánh giá test theo rủi ro, hành vi và điều kiện biên; yêu cầu assertion quan sát được và mutation có ý nghĩa; phân biệt planned/authored/executed/passed/current.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-007
      - id: R-007
        type: requirement
        statement: Áp dụng kiểm tra tối thiểu trước/sau mọi sửa code thuộc phạm vi skill, kể cả fast-fix; kích hoạt theo ý định và file/boundary bị chạm, không chỉ theo keyword tên skill.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-006
          - TASK-008
      - id: R-008
        type: requirement
        statement: Bổ sung cho Explore cơ chế thiết lập/đồng bộ bootstrap AGENTS được quản lý theo policy; tái sử dụng convention registry làm nguồn chính; giữ nội dung người dùng và ownership.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-005
      - id: R-009
        type: requirement
        statement: Báo cáo coverage, finding và khoảng trống bằng chứng nhất quán; không coi thiếu finding là đã kiểm tra đủ; giữ dimension, severity và read-only contract hiện có.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-002
      - id: R-010
        type: requirement
        statement: Có regression, behavioral fixture và đánh giá reviewer từ source thực; giữ phân biệt deterministic và live/fresh-context evidence, đồng thời đồng bộ các adapter/mirror.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-008
          - TASK-009
          - TASK-010
      - id: AC-001
        type: acceptance-criterion
        statement: Nạp đúng convention theo owner/scope/precedence; observed, stale/conflicted và missing registry không bị nâng thành mandatory hoặc quyền ghi.
        behavior: Nạp đúng convention theo owner/scope/precedence; observed, stale/conflicted và missing registry không bị nâng thành mandatory hoặc quyền ghi.
        expected_result: Nạp đúng convention theo owner/scope/precedence; observed, stale/conflicted và missing registry không bị nâng thành mandatory hoặc quyền ghi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-003
          - TASK-005
          - TASK-008
      - id: AC-002
        type: acceptance-criterion
        statement: Phân biệt collection/single/map và calendar-date/instant/duration; bắt tên gây hiểu sai hoặc vi phạm accepted rule, giữ các paired control hợp lệ.
        behavior: Phân biệt collection/single/map và calendar-date/instant/duration; bắt tên gây hiểu sai hoặc vi phạm accepted rule, giữ các paired control hợp lệ.
        expected_result: Phân biệt collection/single/map và calendar-date/instant/duration; bắt tên gây hiểu sai hoặc vi phạm accepted rule, giữ các paired control hợp lệ.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-003
          - TASK-008
      - id: AC-003
        type: acceptance-criterion
        statement: Bắt route/parameter/mapping drift qua lớp; public/legacy alias có compatibility được giữ; không áp cùng cardinality cho mọi boundary.
        behavior: Bắt route/parameter/mapping drift qua lớp; public/legacy alias có compatibility được giữ; không áp cùng cardinality cho mọi boundary.
        expected_result: Bắt route/parameter/mapping drift qua lớp; public/legacy alias có compatibility được giữ; không áp cùng cardinality cho mọi boundary.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-003
          - TASK-008
      - id: AC-004
        type: acceptance-criterion
        statement: Ma trận protection xác định global/inherited enforcement; bắt missing/ineffective metadata và permission mismatch; không coi mọi route thiếu guard cục bộ là lỗi.
        behavior: Ma trận protection xác định global/inherited enforcement; bắt missing/ineffective metadata và permission mismatch; không coi mọi route thiếu guard cục bộ là lỗi.
        expected_result: Ma trận protection xác định global/inherited enforcement; bắt missing/ineffective metadata và permission mismatch; không coi mọi route thiếu guard cục bộ là lỗi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-008
      - id: AC-005
        type: acceptance-criterion
        statement: Fixture HTTP chứng minh protected action bị từ chối với thiếu quyền/sai owner/tenant; UI-only gating không được nhận là server denial.
        behavior: Fixture HTTP chứng minh protected action bị từ chối với thiếu quyền/sai owner/tenant; UI-only gating không được nhận là server denial.
        expected_result: Fixture HTTP chứng minh protected action bị từ chối với thiếu quyền/sai owner/tenant; UI-only gating không được nhận là server denial.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-004
      - id: AC-006
        type: acceptance-criterion
        statement: List/detail/form được so sánh theo archetype; missing error/empty/refresh/permission behavior có bằng chứng; khác biệt hợp lệ không bị báo sai.
        behavior: List/detail/form được so sánh theo archetype; missing error/empty/refresh/permission behavior có bằng chứng; khác biệt hợp lệ không bị báo sai.
        expected_result: List/detail/form được so sánh theo archetype; missing error/empty/refresh/permission behavior có bằng chứng; khác biệt hợp lệ không bị báo sai.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-004
          - TASK-008
      - id: AC-007
        type: acceptance-criterion
        statement: Hardcode literal, constant và config đều được đánh giá theo giả định; chuyển `1000` vào constant không xóa finding khi luồng vẫn thiếu dữ liệu.
        behavior: Hardcode literal, constant và config đều được đánh giá theo giả định; chuyển `1000` vào constant không xóa finding khi luồng vẫn thiếu dữ liệu.
        expected_result: Hardcode literal, constant và config đều được đánh giá theo giả định; chuyển `1000` vào constant không xóa finding khi luồng vẫn thiếu dữ liệu.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
      - id: AC-008
        type: acceptance-criterion
        statement: Case export/all-data có 1.001 bản ghi phát hiện cap 1.000 và chứng minh record cuối bị bỏ; implementation đúng trả đủ dữ liệu hoặc báo partial theo hợp đồng.
        behavior: Case export/all-data có 1.001 bản ghi phát hiện cap 1.000 và chứng minh record cuối bị bỏ; implementation đúng trả đủ dữ liệu hoặc báo partial theo hợp đồng.
        expected_result: Case export/all-data có 1.001 bản ghi phát hiện cap 1.000 và chứng minh record cuối bị bỏ; implementation đúng trả đủ dữ liệu hoặc báo partial theo hợp đồng.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
      - id: AC-009
        type: acceptance-criterion
        statement: Các case 0/1/999/1000/1001, server clamp, trang rỗng, total thiếu/sai, cursor và page-index được đối chiếu với termination contract.
        behavior: Các case 0/1/999/1000/1001, server clamp, trang rỗng, total thiếu/sai, cursor và page-index được đối chiếu với termination contract.
        expected_result: Các case 0/1/999/1000/1001, server clamp, trang rỗng, total thiếu/sai, cursor và page-index được đối chiếu với termination contract.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
      - id: AC-010
        type: acceptance-criterion
        statement: Lỗi trang sau, cancellation, repeated cursor và unstable ordering không được báo như kết quả đầy đủ; vòng lặp có điều kiện dừng an toàn.
        behavior: Lỗi trang sau, cancellation, repeated cursor và unstable ordering không được báo như kết quả đầy đủ; vòng lặp có điều kiện dừng an toàn.
        expected_result: Lỗi trang sau, cancellation, repeated cursor và unstable ordering không được báo như kết quả đầy đủ; vòng lặp có điều kiện dừng an toàn.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
      - id: AC-011
        type: acceptance-criterion
        statement: UI paging có nút tiếp, server-enforced domain cap và server aggregation hợp lệ không bị báo là truncation chỉ vì chứa limit.
        behavior: UI paging có nút tiếp, server-enforced domain cap và server aggregation hợp lệ không bị báo là truncation chỉ vì chứa limit.
        expected_result: UI paging có nút tiếp, server-enforced domain cap và server aggregation hợp lệ không bị báo là truncation chỉ vì chứa limit.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
      - id: AC-012
        type: acceptance-criterion
        statement: Risk-to-test matrix chỉ ra assertion bắt lỗi, trạng thái chạy và freshness; test chỉ kiểm tra request pageSize không chứng minh completeness.
        behavior: Risk-to-test matrix chỉ ra assertion bắt lỗi, trạng thái chạy và freshness; test chỉ kiểm tra request pageSize không chứng minh completeness.
        expected_result: Risk-to-test matrix chỉ ra assertion bắt lỗi, trạng thái chạy và freshness; test chỉ kiểm tra request pageSize không chứng minh completeness.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-007
      - id: AC-013
        type: acceptance-criterion
        statement: Mutation bỏ paging continuation hoặc guard làm test tương ứng fail vì sai hành vi; control không đổi hành vi vẫn pass; lỗi import/setup không được tính là RED hợp lệ.
        behavior: Mutation bỏ paging continuation hoặc guard làm test tương ứng fail vì sai hành vi; control không đổi hành vi vẫn pass; lỗi import/setup không được tính là RED hợp lệ.
        expected_result: Mutation bỏ paging continuation hoặc guard làm test tương ứng fail vì sai hành vi; control không đổi hành vi vẫn pass; lỗi import/setup không được tính là RED hợp lệ.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-007
      - id: AC-014
        type: acceptance-criterion
        statement: Prompt sửa code nhỏ không nhắc skill vẫn có pre/post baseline phù hợp scope, convention đã nạp và ghi rõ checks chưa chạy.
        behavior: Prompt sửa code nhỏ không nhắc skill vẫn có pre/post baseline phù hợp scope, convention đã nạp và ghi rõ checks chưa chạy.
        expected_result: Prompt sửa code nhỏ không nhắc skill vẫn có pre/post baseline phù hợp scope, convention đã nạp và ghi rõ checks chưa chạy.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-006
          - TASK-008
      - id: AC-015
        type: acceptance-criterion
        statement: Thay đổi một dòng chạm authorization/tenant/public contract/data completeness được nâng mức theo rủi ro; typo đơn giản không bị ép thành full workflow.
        behavior: Thay đổi một dòng chạm authorization/tenant/public contract/data completeness được nâng mức theo rủi ro; typo đơn giản không bị ép thành full workflow.
        expected_result: Thay đổi một dòng chạm authorization/tenant/public contract/data completeness được nâng mức theo rủi ro; typo đơn giản không bị ép thành full workflow.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-006
          - TASK-008
      - id: AC-016
        type: acceptance-criterion
        statement: Prompt Việt/Anh, explicit skill và prompt áp lực được route đúng; Q&A/read-only không gây writes; không mở rộng review hẹp thành full audit.
        behavior: Prompt Việt/Anh, explicit skill và prompt áp lực được route đúng; Q&A/read-only không gây writes; không mở rộng review hẹp thành full audit.
        expected_result: Prompt Việt/Anh, explicit skill và prompt áp lực được route đúng; Q&A/read-only không gây writes; không mở rộng review hẹp thành full audit.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-006
          - TASK-008
      - id: AC-017
        type: acceptance-criterion
        statement: Setup/sync có authority tạo/cập nhật đúng một managed block và policy; standing policy cho phép lần sau sync không hỏi lại từng rule.
        behavior: Setup/sync có authority tạo/cập nhật đúng một managed block và policy; standing policy cho phép lần sau sync không hỏi lại từng rule.
        expected_result: Setup/sync có authority tạo/cập nhật đúng một managed block và policy; standing policy cho phép lần sau sync không hỏi lại từng rule.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-005
      - id: AC-018
        type: acceptance-criterion
        statement: Policy cũ/missing/disabled/manual hoặc review read-only không tự ghi AGENTS; candidate từ source/comment không tự cấp quyền hoặc thành accepted.
        behavior: Policy cũ/missing/disabled/manual hoặc review read-only không tự ghi AGENTS; candidate từ source/comment không tự cấp quyền hoặc thành accepted.
        expected_result: Policy cũ/missing/disabled/manual hoặc review read-only không tự ghi AGENTS; candidate từ source/comment không tự cấp quyền hoặc thành accepted.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-005
      - id: AC-019
        type: acceptance-criterion
        statement: Sync lặp lại không tạo diff; giữ nguyên byte ngoài block, BOM/newline và nội dung người dùng; concurrent edit/marker hỏng làm thao tác fail closed.
        behavior: Sync lặp lại không tạo diff; giữ nguyên byte ngoài block, BOM/newline và nội dung người dùng; concurrent edit/marker hỏng làm thao tác fail closed.
        expected_result: Sync lặp lại không tạo diff; giữ nguyên byte ngoài block, BOM/newline và nội dung người dùng; concurrent edit/marker hỏng làm thao tác fail closed.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-005
      - id: AC-020
        type: acceptance-criterion
        statement: Nested instruction, owner repo khác, path escape/reparse target và unsupported version được xử lý rõ; không ghi nhầm repo/parent.
        behavior: Nested instruction, owner repo khác, path escape/reparse target và unsupported version được xử lý rõ; không ghi nhầm repo/parent.
        expected_result: Nested instruction, owner repo khác, path escape/reparse target và unsupported version được xử lý rõ; không ghi nhầm repo/parent.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-005
      - id: AC-021
        type: acceptance-criterion
        statement: Finding có evidence locator, semantic role, trigger/impact/fix và test gap cần thiết; các dimension cùng vấn đề không tạo bản sao finding.
        behavior: Finding có evidence locator, semantic role, trigger/impact/fix và test gap cần thiết; các dimension cùng vấn đề không tạo bản sao finding.
        expected_result: Finding có evidence locator, semantic role, trigger/impact/fix và test gap cần thiết; các dimension cùng vấn đề không tạo bản sao finding.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-009
        task_refs:
          - TASK-002
      - id: AC-022
        type: acceptance-criterion
        statement: Missing/stale evidence hoặc bỏ assessment bắt buộc ngăn kết luận đã review đủ; helper không biến object hợp lệ thành bằng chứng detection.
        behavior: Missing/stale evidence hoặc bỏ assessment bắt buộc ngăn kết luận đã review đủ; helper không biến object hợp lệ thành bằng chứng detection.
        expected_result: Missing/stale evidence hoặc bỏ assessment bắt buộc ngăn kết luận đã review đủ; helper không biến object hợp lệ thành bằng chứng detection.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-009
        task_refs:
          - TASK-002
      - id: AC-023
        type: acceptance-criterion
        statement: Context/policy cũ vẫn đọc được với giới hạn coverage rõ; scope/enum/ownership/read-only hiện hành không bị phá; ngoại lệ accepted được bảo toàn.
        behavior: Context/policy cũ vẫn đọc được với giới hạn coverage rõ; scope/enum/ownership/read-only hiện hành không bị phá; ngoại lệ accepted được bảo toàn.
        expected_result: Context/policy cũ vẫn đọc được với giới hạn coverage rõ; scope/enum/ownership/read-only hiện hành không bị phá; ngoại lệ accepted được bảo toàn.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-009
        task_refs:
          - TASK-002
          - TASK-005
      - id: AC-024
        type: acceptance-criterion
        statement: Offline fixture/helper result, executable HTTP/data behavior và fresh reviewer result được ghi riêng; injected finding hoặc fixture transcript không được tính live detection.
        behavior: Offline fixture/helper result, executable HTTP/data behavior và fresh reviewer result được ghi riêng; injected finding hoặc fixture transcript không được tính live detection.
        expected_result: Offline fixture/helper result, executable HTTP/data behavior và fresh reviewer result được ghi riêng; injected finding hoặc fixture transcript không được tính live detection.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-010
        task_refs:
          - TASK-008
          - TASK-010
      - id: AC-025
        type: acceptance-criterion
        statement: Phiên reviewer mới đọc source, không nhận expected findings, được đánh giá trên positives/controls/ambiguous/pressure prompts; báo expected/observed, missed/false findings và evidence locator theo từng case. Không có quyền/chạy thật thì trạng thái NOT RUN và năng lực này chưa nghiệm thu.
        behavior: Phiên reviewer mới đọc source, không nhận expected findings, được đánh giá trên positives/controls/ambiguous/pressure prompts; báo expected/observed, missed/false findings và evidence locator theo từng case. Không có quyền/chạy thật thì trạng thái NOT RUN và năng lực này chưa nghiệm thu.
        expected_result: Phiên reviewer mới đọc source, không nhận expected findings, được đánh giá trên positives/controls/ambiguous/pressure prompts; báo expected/observed, missed/false findings và evidence locator theo từng case. Không có quyền/chạy thật thì trạng thái NOT RUN và năng lực này chưa nghiệm thu.
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-010
        task_refs:
          - TASK-008
          - TASK-010
      - id: AC-026
        type: acceptance-criterion
        statement: Public skill count giữ 24; source/reference/template tiếng Anh; response theo ngôn ngữ user; mirror/entrypoint đồng nhất và không phân phối internal authoring surface.
        behavior: Public skill count giữ 24; source/reference/template tiếng Anh; response theo ngôn ngữ user; mirror/entrypoint đồng nhất và không phân phối internal authoring surface.
        expected_result: Public skill count giữ 24; source/reference/template tiếng Anh; response theo ngôn ngữ user; mirror/entrypoint đồng nhất và không phân phối internal authoring surface.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-010
        task_refs:
          - TASK-009
          - TASK-010
      - id: A-001
        type: assumption
        statement: Consumer may lack conventions or tooling.
        source: defaulted
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs: []
        consequence_if_wrong: Use existing source evidence and no automatic installation.
        validation_method: Missing-policy/tooling fixtures.
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: The draft preserves a safe fallback without assuming runtime capabilities.
        impacted_refs:
          - R-001
          - R-007
      - id: A-002
        type: assumption
        statement: A host may not load AGENTS or expose session hooks.
        source: defaulted
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs: []
        consequence_if_wrong: Report unsupported interception and use portable preflight.
        validation_method: Adapter capability matrix and fresh-host observation.
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: The draft preserves a safe fallback without assuming runtime capabilities.
        impacted_refs:
          - R-007
          - R-008
      - id: A-003
        type: assumption
        statement: Fresh reviewer evaluation may not yet be authorized or available.
        source: defaulted
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs: []
        consequence_if_wrong: AC-025 remains unaccepted; no inferred PASS.
        validation_method: Explicit authorization and actual sanitized run receipts.
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: The draft preserves a safe fallback without assuming runtime capabilities.
        impacted_refs:
          - R-010
          - AC-025
      - id: D-001
        type: decision
        statement: Mở rộng skill/reference/helper hiện có; không tạo skill public mới
        question: Which design governs D-001?
        selected_value: Mở rộng skill/reference/helper hiện có; không tạo skill public mới
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Trùng lifecycle/ownership hiện tại; chỉ xem lại khi có ý định độc lập ngoài scope này.
        supersedes: null
        revisit_condition: Material scope, ownership or evidence requirements change.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-008
          - R-010
          - INV-008
        task_refs:
          - TASK-003
          - TASK-005
          - TASK-009
      - id: D-002
        type: decision
        statement: Semantic review do agent thực hiện; helper xác thực coverage/provenance, fixture chạy hành vi thật
        question: Which design governs D-002?
        selected_value: Semantic review do agent thực hiện; helper xác thực coverage/provenance, fixture chạy hành vi thật
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tránh quảng bá validator schema thành bộ phát hiện mọi lỗi; không thêm universal AST engine trong scope đầu.
        supersedes: null
        revisit_condition: Material scope, ownership or evidence requirements change.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - R-003
          - R-004
          - R-005
          - R-009
          - AC-021
          - AC-022
          - INV-003
          - R-001
          - R-006
          - R-007
          - R-008
          - R-010
          - AC-001
          - AC-002
          - AC-003
          - AC-004
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
          - AC-023
          - AC-024
          - AC-025
          - AC-026
          - INV-001
          - INV-002
          - INV-004
          - INV-005
          - INV-006
          - INV-007
          - INV-008
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-008
        validation_boundary:
          kind: none
          source_refs:
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
            - R-007
            - R-008
            - R-009
            - R-010
            - AC-001
            - AC-002
            - AC-003
            - AC-004
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
            - AC-023
            - AC-024
            - AC-025
            - AC-026
            - INV-001
            - INV-002
            - INV-003
            - INV-004
            - INV-005
            - INV-006
            - INV-007
            - INV-008
      - id: D-003
        type: decision
        statement: Convention chi tiết ở registry; AGENTS là bootstrap/projection tối thiểu do Explore ghi
        question: Which design governs D-003?
        selected_value: Convention chi tiết ở registry; AGENTS là bootstrap/projection tối thiểu do Explore ghi
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tránh hai nguồn quy tắc và tự sửa policy để hợp thức hóa code.
        supersedes: null
        revisit_condition: Material scope, ownership or evidence requirements change.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-008
          - AC-017
          - AC-018
          - AC-019
          - AC-020
          - INV-001
          - INV-002
          - INV-004
        task_refs:
          - TASK-005
      - id: D-004
        type: decision
        statement: Fast-fix giữ luồng gọn nhưng không bỏ baseline theo rủi ro
        question: Which design governs D-004?
        selected_value: Fast-fix giữ luồng gọn nhưng không bỏ baseline theo rủi ro
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Số dòng không đại diện cho mức độ tác động.
        supersedes: null
        revisit_condition: Material scope, ownership or evidence requirements change.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-007
          - AC-014
          - AC-015
          - AC-016
          - INV-005
        task_refs:
          - TASK-006
      - id: D-005
        type: decision
        statement: TDD cho helper/writer và fixture; đánh giá source-to-finding ở lớp fresh-context riêng
        question: Which design governs D-005?
        selected_value: TDD cho helper/writer và fixture; đánh giá source-to-finding ở lớp fresh-context riêng
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tách tính đúng của contract khỏi năng lực reviewer; live chưa chạy không được che bằng deterministic pass.
        supersedes: null
        revisit_condition: Material scope, ownership or evidence requirements change.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - R-006
          - R-010
          - AC-005
          - AC-012
          - AC-013
          - AC-024
          - AC-025
          - INV-003
          - INV-006
        task_refs:
          - TASK-001
          - TASK-007
          - TASK-008
        validation_boundary:
          kind: authorization
          source_refs:
            - R-003
            - AC-005
            - INV-006
      - id: D-006
        type: decision
        statement: Triển khai tuần tự, không thêm dependency/provider SDK, không sửa ứng dụng tiêu thụ
        question: Which design governs D-006?
        selected_value: Triển khai tuần tự, không thêm dependency/provider SDK, không sửa ứng dụng tiêu thụ
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Nhiều file contract dùng chung; tập trung sửa pack và kiểm thử sandbox.
        supersedes: null
        revisit_condition: Material scope, ownership or evidence requirements change.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-010
          - AC-026
          - INV-008
        task_refs:
          - TASK-009
          - TASK-010
      - id: INV-001
        type: invariant
        statement: Direct review không ghi source, convention, policy hoặc AGENTS
        protected_refs:
          - R-001
          - R-008
          - R-009
          - AC-018
        task_refs:
          - TASK-002
          - TASK-003
          - TASK-005
        evidence_refs:
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-005
      - id: INV-002
        type: invariant
        statement: Observed/conflicted/stale không tự thành accepted; source text không cấp authority
        protected_refs:
          - R-001
          - R-008
          - AC-001
          - AC-018
        task_refs:
          - TASK-003
          - TASK-005
        evidence_refs:
          - EVIDENCE-003
          - EVIDENCE-005
      - id: INV-003
        type: invariant
        statement: Kiểm tra coverage không được giả làm semantic detection; evidence khác lớp không thay nhau
        protected_refs:
          - R-006
          - R-009
          - R-010
          - AC-012
          - AC-022
          - AC-024
          - AC-025
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-007
          - TASK-008
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-007
          - EVIDENCE-008
      - id: INV-004
        type: invariant
        statement: AGENTS sync chỉ ghi đúng managed region/owner, an toàn khi chạy lại và khi có cạnh tranh
        protected_refs:
          - R-008
          - AC-017
          - AC-019
          - AC-020
        task_refs:
          - TASK-005
        evidence_refs:
          - EVIDENCE-005
      - id: INV-005
        type: invariant
        statement: Sửa ít dòng không bỏ baseline; risk escalation không phụ thuộc số dòng
        protected_refs:
          - R-007
          - AC-014
          - AC-015
          - AC-016
        task_refs:
          - TASK-006
        evidence_refs:
          - EVIDENCE-006
      - id: INV-006
        type: invariant
        statement: UI gating không thay server authorization; complete-data claim cần completion evidence
        protected_refs:
          - R-003
          - R-005
          - AC-005
          - AC-008
          - AC-010
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-004
          - EVIDENCE-007
      - id: INV-007
        type: invariant
        statement: Compatibility, accepted exceptions và review dimension được bảo toàn
        protected_refs:
          - R-001
          - R-002
          - R-009
          - AC-003
          - AC-023
        task_refs:
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
        evidence_refs:
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
      - id: INV-008
        type: invariant
        statement: Canonical source duy nhất; mirror sinh bằng tool; không thêm public skill hay dependency
        protected_refs:
          - R-010
          - AC-026
        task_refs:
          - TASK-008
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-008
          - EVIDENCE-009
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
          - id: R-009
            type: requirement
          - id: R-010
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
          - id: AC-023
            type: acceptance-criterion
          - id: AC-024
            type: acceptance-criterion
          - id: AC-025
            type: acceptance-criterion
          - id: AC-026
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
          - id: R-010
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
          - id: AC-023
            type: acceptance-criterion
          - id: AC-024
            type: acceptance-criterion
          - id: AC-025
            type: acceptance-criterion
          - id: AC-026
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
        tombstones: []
    approved_artifact:
      metadata:
        allowed_paths:
          - test/e2e/fixtures/review-behavior/manifest.json
          - test/e2e/fixtures/review-behavior/paging.mjs
          - test/e2e/fixtures/review-behavior/protection-server.mjs
          - test/e2e/fixtures/review-behavior/naming-routing.ts
          - test/e2e/fixtures/review-behavior/screens.ts
          - test/e2e/review-behavior-fixtures.test.mjs
          - _refs/shared/review-risk-contract.mjs
          - test/e2e/review-risk-contract.test.mjs
          - _refs/shared/review-contract.mjs
          - test/e2e/review-contract.test.mjs
          - test/e2e/convention-review.test.mjs
          - _refs/shared/review-data-completeness.md
          - skills/shared/workflow/review.md
          - _refs/shared/review-consistency.md
          - _refs/shared/review-code.md
          - _refs/shared/review-screen-patterns.md
          - _refs/shared/review-security.md
          - _refs/angular/review-security.md
          - _refs/angular/review-code.md
          - _refs/nestjs/review-security.md
          - _refs/nestjs/review-code.md
          - _refs/nextjs/build-website/review-security.md
          - _refs/nextjs/build-website/review-code.md
          - _refs/shared/project-bootstrap.md
          - _refs/shared/project-bootstrap-template.md
          - _refs/shared/project-bootstrap.mjs
          - test/e2e/project-bootstrap-contract.test.mjs
          - test/e2e/project-bootstrap-filesystem.test.mjs
          - skills/shared/workflow/explore.md
          - _refs/shared/convention-context.md
          - _refs/shared/convention-contract.mjs
          - _refs/shared/project-context.md
          - _refs/shared/project-context.mjs
          - test/e2e/convention-contract.test.mjs
          - test/e2e/project-context-artifact-lifecycle.test.mjs
          - skills/orchestration/using-skills.md
          - _refs/harness/runtime-policy.mjs
          - _refs/shared/finish-gate.md
          - skills/shared/sdlc/04-execute-plan.md
          - _refs/orchestration/tail/branch-ready.md
          - test/e2e/harness-behavioral-sentinel.test.mjs
          - test/e2e/support/harness-behavior-runner.mjs
          - test/e2e/fixtures/harness-behavior-scenarios.json
          - test/e2e/review-test-adequacy.test.mjs
          - skills/tracks/test/sdcorejs-test.md
          - _refs/shared/test-scope-and-coverage.md
          - _refs/shared/test-context.md
          - test/e2e/test-track-contract.test.mjs
          - authoring/evals/review-behavior/README.md
          - authoring/evals/review-behavior/scenarios.json
          - authoring/evals/review-behavior/run-offline.mjs
          - authoring/evals/review-behavior/evidence-contract.mjs
          - authoring/evals/review-behavior/fresh-run-template.json
          - test/e2e/review-agent-evaluation.test.mjs
          - test/e2e/support/skill-pack-runner.mjs
          - AGENTS.md
          - AGENTS.reference.md
          - CLAUDE.md
          - .github/copilot-instructions.md
          - README.md
          - package.json
          - plugin/hooks/session-start.mjs
          - test/e2e/entrypoint-smoke.test.mjs
          - test/e2e/mirror-refs-resolution.test.mjs
          - scripts/sync-skills.mjs
          - .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md
        approval_source: user-approved-decision-coverage
        approved_at: 2026-11-04T10:06:15.070Z
        approved_by: user
        artifact_id: decision-coverage-r2
        artifact_kind: plan
        change_ref: review-behavior-consistency-20261104
        contract_id: decision-coverage:v1
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_repository_role: standalone
        parent_references: []
        parent_repository_id: null
        prohibited_paths:
          - node_modules/**
          - package-lock.json
          - .env*
          - external-consumer-repositories
          - user-home-instructions
          - installed-home-skills
          - unrelated-durable-artifacts
        repository_relative_path: .sdcorejs/plans/workflow/2026-11-04-17-06-review-behavior-consistency.md
        requirement_id: decision-coverage
        schema_version: 1
        source_revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
        stack_profile: markdown-skill-pack
        supersedes: null
        track: workflow
        approval_hash: sha256:v1:8cfbcdaf3db90681a6c52181ea32ee345ab15c89cd458faaa68a71f40f5c853a
      body: |
        {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"R-007","type":"requirement"},{"id":"R-008","type":"requirement"},{"id":"R-009","type":"requirement"},{"id":"R-010","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"AC-011","type":"acceptance-criterion"},{"id":"AC-012","type":"acceptance-criterion"},{"id":"AC-013","type":"acceptance-criterion"},{"id":"AC-014","type":"acceptance-criterion"},{"id":"AC-015","type":"acceptance-criterion"},{"id":"AC-016","type":"acceptance-criterion"},{"id":"AC-017","type":"acceptance-criterion"},{"id":"AC-018","type":"acceptance-criterion"},{"id":"AC-019","type":"acceptance-criterion"},{"id":"AC-020","type":"acceptance-criterion"},{"id":"AC-021","type":"acceptance-criterion"},{"id":"AC-022","type":"acceptance-criterion"},{"id":"AC-023","type":"acceptance-criterion"},{"id":"AC-024","type":"acceptance-criterion"},{"id":"AC-025","type":"acceptance-criterion"},{"id":"AC-026","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"D-005","type":"decision"},{"id":"D-006","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"},{"id":"INV-005","type":"invariant"},{"id":"INV-006","type":"invariant"},{"id":"INV-007","type":"invariant"},{"id":"INV-008","type":"invariant"}],"revision":1,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"R-007","type":"requirement"},{"id":"R-008","type":"requirement"},{"id":"R-009","type":"requirement"},{"id":"R-010","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"AC-011","type":"acceptance-criterion"},{"id":"AC-012","type":"acceptance-criterion"},{"id":"AC-013","type":"acceptance-criterion"},{"id":"AC-014","type":"acceptance-criterion"},{"id":"AC-015","type":"acceptance-criterion"},{"id":"AC-016","type":"acceptance-criterion"},{"id":"AC-017","type":"acceptance-criterion"},{"id":"AC-018","type":"acceptance-criterion"},{"id":"AC-019","type":"acceptance-criterion"},{"id":"AC-020","type":"acceptance-criterion"},{"id":"AC-021","type":"acceptance-criterion"},{"id":"AC-022","type":"acceptance-criterion"},{"id":"AC-023","type":"acceptance-criterion"},{"id":"AC-024","type":"acceptance-criterion"},{"id":"AC-025","type":"acceptance-criterion"},{"id":"AC-026","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"D-005","type":"decision"},{"id":"D-006","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"},{"id":"INV-005","type":"invariant"},{"id":"INV-006","type":"invariant"},{"id":"INV-007","type":"invariant"},{"id":"INV-008","type":"invariant"}],"revision":2,"tombstones":[]}],"records":[{"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Khôi phục convention phù hợp với repo/module/boundary; đọc nguồn chính thức, evidence hiện tại và ngoại lệ; phân biệt accepted, observed, conflicted, stale. Thiếu registry không làm review bỏ qua code và không cho phép tự tạo policy.","status":"active","task_refs":["TASK-003","TASK-005","TASK-008"],"type":"requirement"},{"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Đánh giá tên variable/property/parameter/function và route theo kiểu, cardinality, vai trò, đơn vị và cách sử dụng; đối chiếu các lớp có liên hệ và giữ compatibility của hợp đồng công khai.","status":"active","task_refs":["TASK-003","TASK-008"],"type":"requirement"},{"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Kiểm tra protection có hiệu lực, permission mapping, thứ tự auth/policy, ownership và tenant theo kiến trúc thực tế; bao phủ các action có trong phạm vi thay đổi.","status":"active","task_refs":["TASK-001","TASK-004","TASK-008"],"type":"requirement"},{"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"So sánh list/detail/form với mẫu tương đương và quy tắc được chấp nhận trong dự án; đánh giá loading, empty, error, paging/filter/sort, mutation refresh, validation và navigation.","status":"active","task_refs":["TASK-004","TASK-008"],"type":"requirement"},{"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Phát hiện hardcode và giả định giới hạn dữ liệu theo hậu quả; truy vết luồng phân trang được sử dụng như toàn bộ; phân biệt giá trị hợp lệ, giả định chưa chứng minh và lỗi có bằng chứng.","status":"active","task_refs":["TASK-001","TASK-003","TASK-008"],"type":"requirement"},{"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Đánh giá test theo rủi ro, hành vi và điều kiện biên; yêu cầu assertion quan sát được và mutation có ý nghĩa; phân biệt planned/authored/executed/passed/current.","status":"active","task_refs":["TASK-007"],"type":"requirement"},{"id":"R-007","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Áp dụng kiểm tra tối thiểu trước/sau mọi sửa code thuộc phạm vi skill, kể cả fast-fix; kích hoạt theo ý định và file/boundary bị chạm, không chỉ theo keyword tên skill.","status":"active","task_refs":["TASK-006","TASK-008"],"type":"requirement"},{"id":"R-008","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Bổ sung cho Explore cơ chế thiết lập/đồng bộ bootstrap AGENTS được quản lý theo policy; tái sử dụng convention registry làm nguồn chính; giữ nội dung người dùng và ownership.","status":"active","task_refs":["TASK-005"],"type":"requirement"},{"id":"R-009","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Báo cáo coverage, finding và khoảng trống bằng chứng nhất quán; không coi thiếu finding là đã kiểm tra đủ; giữ dimension, severity và read-only contract hiện có.","status":"active","task_refs":["TASK-002"],"type":"requirement"},{"id":"R-010","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Có regression, behavioral fixture và đánh giá reviewer từ source thực; giữ phân biệt deterministic và live/fresh-context evidence, đồng thời đồng bộ các adapter/mirror.","status":"active","task_refs":["TASK-001","TASK-008","TASK-009","TASK-010"],"type":"requirement"},{"behavior":"Nạp đúng convention theo owner/scope/precedence; observed, stale/conflicted và missing registry không bị nâng thành mandatory hoặc quyền ghi.","blocking":true,"expected_result":"Nạp đúng convention theo owner/scope/precedence; observed, stale/conflicted và missing registry không bị nâng thành mandatory hoặc quyền ghi.","id":"AC-001","requirement_refs":["R-001"],"statement":"Nạp đúng convention theo owner/scope/precedence; observed, stale/conflicted và missing registry không bị nâng thành mandatory hoặc quyền ghi.","task_refs":["TASK-003","TASK-005","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Phân biệt collection/single/map và calendar-date/instant/duration; bắt tên gây hiểu sai hoặc vi phạm accepted rule, giữ các paired control hợp lệ.","blocking":true,"expected_result":"Phân biệt collection/single/map và calendar-date/instant/duration; bắt tên gây hiểu sai hoặc vi phạm accepted rule, giữ các paired control hợp lệ.","id":"AC-002","requirement_refs":["R-002"],"statement":"Phân biệt collection/single/map và calendar-date/instant/duration; bắt tên gây hiểu sai hoặc vi phạm accepted rule, giữ các paired control hợp lệ.","task_refs":["TASK-003","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Bắt route/parameter/mapping drift qua lớp; public/legacy alias có compatibility được giữ; không áp cùng cardinality cho mọi boundary.","blocking":true,"expected_result":"Bắt route/parameter/mapping drift qua lớp; public/legacy alias có compatibility được giữ; không áp cùng cardinality cho mọi boundary.","id":"AC-003","requirement_refs":["R-002"],"statement":"Bắt route/parameter/mapping drift qua lớp; public/legacy alias có compatibility được giữ; không áp cùng cardinality cho mọi boundary.","task_refs":["TASK-003","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Ma trận protection xác định global/inherited enforcement; bắt missing/ineffective metadata và permission mismatch; không coi mọi route thiếu guard cục bộ là lỗi.","blocking":true,"expected_result":"Ma trận protection xác định global/inherited enforcement; bắt missing/ineffective metadata và permission mismatch; không coi mọi route thiếu guard cục bộ là lỗi.","id":"AC-004","requirement_refs":["R-003"],"statement":"Ma trận protection xác định global/inherited enforcement; bắt missing/ineffective metadata và permission mismatch; không coi mọi route thiếu guard cục bộ là lỗi.","task_refs":["TASK-001","TASK-004","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Fixture HTTP chứng minh protected action bị từ chối với thiếu quyền/sai owner/tenant; UI-only gating không được nhận là server denial.","blocking":true,"expected_result":"Fixture HTTP chứng minh protected action bị từ chối với thiếu quyền/sai owner/tenant; UI-only gating không được nhận là server denial.","id":"AC-005","requirement_refs":["R-003"],"statement":"Fixture HTTP chứng minh protected action bị từ chối với thiếu quyền/sai owner/tenant; UI-only gating không được nhận là server denial.","task_refs":["TASK-001","TASK-004"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"List/detail/form được so sánh theo archetype; missing error/empty/refresh/permission behavior có bằng chứng; khác biệt hợp lệ không bị báo sai.","blocking":true,"expected_result":"List/detail/form được so sánh theo archetype; missing error/empty/refresh/permission behavior có bằng chứng; khác biệt hợp lệ không bị báo sai.","id":"AC-006","requirement_refs":["R-004"],"statement":"List/detail/form được so sánh theo archetype; missing error/empty/refresh/permission behavior có bằng chứng; khác biệt hợp lệ không bị báo sai.","task_refs":["TASK-004","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Hardcode literal, constant và config đều được đánh giá theo giả định; chuyển `1000` vào constant không xóa finding khi luồng vẫn thiếu dữ liệu.","blocking":true,"expected_result":"Hardcode literal, constant và config đều được đánh giá theo giả định; chuyển `1000` vào constant không xóa finding khi luồng vẫn thiếu dữ liệu.","id":"AC-007","requirement_refs":["R-005"],"statement":"Hardcode literal, constant và config đều được đánh giá theo giả định; chuyển `1000` vào constant không xóa finding khi luồng vẫn thiếu dữ liệu.","task_refs":["TASK-001","TASK-003","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Case export/all-data có 1.001 bản ghi phát hiện cap 1.000 và chứng minh record cuối bị bỏ; implementation đúng trả đủ dữ liệu hoặc báo partial theo hợp đồng.","blocking":true,"expected_result":"Case export/all-data có 1.001 bản ghi phát hiện cap 1.000 và chứng minh record cuối bị bỏ; implementation đúng trả đủ dữ liệu hoặc báo partial theo hợp đồng.","id":"AC-008","requirement_refs":["R-005"],"statement":"Case export/all-data có 1.001 bản ghi phát hiện cap 1.000 và chứng minh record cuối bị bỏ; implementation đúng trả đủ dữ liệu hoặc báo partial theo hợp đồng.","task_refs":["TASK-001","TASK-003","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Các case 0/1/999/1000/1001, server clamp, trang rỗng, total thiếu/sai, cursor và page-index được đối chiếu với termination contract.","blocking":true,"expected_result":"Các case 0/1/999/1000/1001, server clamp, trang rỗng, total thiếu/sai, cursor và page-index được đối chiếu với termination contract.","id":"AC-009","requirement_refs":["R-005"],"statement":"Các case 0/1/999/1000/1001, server clamp, trang rỗng, total thiếu/sai, cursor và page-index được đối chiếu với termination contract.","task_refs":["TASK-001","TASK-003"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Lỗi trang sau, cancellation, repeated cursor và unstable ordering không được báo như kết quả đầy đủ; vòng lặp có điều kiện dừng an toàn.","blocking":true,"expected_result":"Lỗi trang sau, cancellation, repeated cursor và unstable ordering không được báo như kết quả đầy đủ; vòng lặp có điều kiện dừng an toàn.","id":"AC-010","requirement_refs":["R-005"],"statement":"Lỗi trang sau, cancellation, repeated cursor và unstable ordering không được báo như kết quả đầy đủ; vòng lặp có điều kiện dừng an toàn.","task_refs":["TASK-001","TASK-003"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"UI paging có nút tiếp, server-enforced domain cap và server aggregation hợp lệ không bị báo là truncation chỉ vì chứa limit.","blocking":true,"expected_result":"UI paging có nút tiếp, server-enforced domain cap và server aggregation hợp lệ không bị báo là truncation chỉ vì chứa limit.","id":"AC-011","requirement_refs":["R-005"],"statement":"UI paging có nút tiếp, server-enforced domain cap và server aggregation hợp lệ không bị báo là truncation chỉ vì chứa limit.","task_refs":["TASK-001","TASK-003","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Risk-to-test matrix chỉ ra assertion bắt lỗi, trạng thái chạy và freshness; test chỉ kiểm tra request pageSize không chứng minh completeness.","blocking":true,"expected_result":"Risk-to-test matrix chỉ ra assertion bắt lỗi, trạng thái chạy và freshness; test chỉ kiểm tra request pageSize không chứng minh completeness.","id":"AC-012","requirement_refs":["R-006"],"statement":"Risk-to-test matrix chỉ ra assertion bắt lỗi, trạng thái chạy và freshness; test chỉ kiểm tra request pageSize không chứng minh completeness.","task_refs":["TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Mutation bỏ paging continuation hoặc guard làm test tương ứng fail vì sai hành vi; control không đổi hành vi vẫn pass; lỗi import/setup không được tính là RED hợp lệ.","blocking":true,"expected_result":"Mutation bỏ paging continuation hoặc guard làm test tương ứng fail vì sai hành vi; control không đổi hành vi vẫn pass; lỗi import/setup không được tính là RED hợp lệ.","id":"AC-013","requirement_refs":["R-006"],"statement":"Mutation bỏ paging continuation hoặc guard làm test tương ứng fail vì sai hành vi; control không đổi hành vi vẫn pass; lỗi import/setup không được tính là RED hợp lệ.","task_refs":["TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Prompt sửa code nhỏ không nhắc skill vẫn có pre/post baseline phù hợp scope, convention đã nạp và ghi rõ checks chưa chạy.","blocking":true,"expected_result":"Prompt sửa code nhỏ không nhắc skill vẫn có pre/post baseline phù hợp scope, convention đã nạp và ghi rõ checks chưa chạy.","id":"AC-014","requirement_refs":["R-007"],"statement":"Prompt sửa code nhỏ không nhắc skill vẫn có pre/post baseline phù hợp scope, convention đã nạp và ghi rõ checks chưa chạy.","task_refs":["TASK-006","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Thay đổi một dòng chạm authorization/tenant/public contract/data completeness được nâng mức theo rủi ro; typo đơn giản không bị ép thành full workflow.","blocking":true,"expected_result":"Thay đổi một dòng chạm authorization/tenant/public contract/data completeness được nâng mức theo rủi ro; typo đơn giản không bị ép thành full workflow.","id":"AC-015","requirement_refs":["R-007"],"statement":"Thay đổi một dòng chạm authorization/tenant/public contract/data completeness được nâng mức theo rủi ro; typo đơn giản không bị ép thành full workflow.","task_refs":["TASK-006","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Prompt Việt/Anh, explicit skill và prompt áp lực được route đúng; Q&A/read-only không gây writes; không mở rộng review hẹp thành full audit.","blocking":true,"expected_result":"Prompt Việt/Anh, explicit skill và prompt áp lực được route đúng; Q&A/read-only không gây writes; không mở rộng review hẹp thành full audit.","id":"AC-016","requirement_refs":["R-007"],"statement":"Prompt Việt/Anh, explicit skill và prompt áp lực được route đúng; Q&A/read-only không gây writes; không mở rộng review hẹp thành full audit.","task_refs":["TASK-006","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Setup/sync có authority tạo/cập nhật đúng một managed block và policy; standing policy cho phép lần sau sync không hỏi lại từng rule.","blocking":true,"expected_result":"Setup/sync có authority tạo/cập nhật đúng một managed block và policy; standing policy cho phép lần sau sync không hỏi lại từng rule.","id":"AC-017","requirement_refs":["R-008"],"statement":"Setup/sync có authority tạo/cập nhật đúng một managed block và policy; standing policy cho phép lần sau sync không hỏi lại từng rule.","task_refs":["TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Policy cũ/missing/disabled/manual hoặc review read-only không tự ghi AGENTS; candidate từ source/comment không tự cấp quyền hoặc thành accepted.","blocking":true,"expected_result":"Policy cũ/missing/disabled/manual hoặc review read-only không tự ghi AGENTS; candidate từ source/comment không tự cấp quyền hoặc thành accepted.","id":"AC-018","requirement_refs":["R-008"],"statement":"Policy cũ/missing/disabled/manual hoặc review read-only không tự ghi AGENTS; candidate từ source/comment không tự cấp quyền hoặc thành accepted.","task_refs":["TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Sync lặp lại không tạo diff; giữ nguyên byte ngoài block, BOM/newline và nội dung người dùng; concurrent edit/marker hỏng làm thao tác fail closed.","blocking":true,"expected_result":"Sync lặp lại không tạo diff; giữ nguyên byte ngoài block, BOM/newline và nội dung người dùng; concurrent edit/marker hỏng làm thao tác fail closed.","id":"AC-019","requirement_refs":["R-008"],"statement":"Sync lặp lại không tạo diff; giữ nguyên byte ngoài block, BOM/newline và nội dung người dùng; concurrent edit/marker hỏng làm thao tác fail closed.","task_refs":["TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Nested instruction, owner repo khác, path escape/reparse target và unsupported version được xử lý rõ; không ghi nhầm repo/parent.","blocking":true,"expected_result":"Nested instruction, owner repo khác, path escape/reparse target và unsupported version được xử lý rõ; không ghi nhầm repo/parent.","id":"AC-020","requirement_refs":["R-008"],"statement":"Nested instruction, owner repo khác, path escape/reparse target và unsupported version được xử lý rõ; không ghi nhầm repo/parent.","task_refs":["TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Finding có evidence locator, semantic role, trigger/impact/fix và test gap cần thiết; các dimension cùng vấn đề không tạo bản sao finding.","blocking":true,"expected_result":"Finding có evidence locator, semantic role, trigger/impact/fix và test gap cần thiết; các dimension cùng vấn đề không tạo bản sao finding.","id":"AC-021","requirement_refs":["R-009"],"statement":"Finding có evidence locator, semantic role, trigger/impact/fix và test gap cần thiết; các dimension cùng vấn đề không tạo bản sao finding.","task_refs":["TASK-002"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Missing/stale evidence hoặc bỏ assessment bắt buộc ngăn kết luận đã review đủ; helper không biến object hợp lệ thành bằng chứng detection.","blocking":true,"expected_result":"Missing/stale evidence hoặc bỏ assessment bắt buộc ngăn kết luận đã review đủ; helper không biến object hợp lệ thành bằng chứng detection.","id":"AC-022","requirement_refs":["R-009"],"statement":"Missing/stale evidence hoặc bỏ assessment bắt buộc ngăn kết luận đã review đủ; helper không biến object hợp lệ thành bằng chứng detection.","task_refs":["TASK-002"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Context/policy cũ vẫn đọc được với giới hạn coverage rõ; scope/enum/ownership/read-only hiện hành không bị phá; ngoại lệ accepted được bảo toàn.","blocking":true,"expected_result":"Context/policy cũ vẫn đọc được với giới hạn coverage rõ; scope/enum/ownership/read-only hiện hành không bị phá; ngoại lệ accepted được bảo toàn.","id":"AC-023","requirement_refs":["R-009"],"statement":"Context/policy cũ vẫn đọc được với giới hạn coverage rõ; scope/enum/ownership/read-only hiện hành không bị phá; ngoại lệ accepted được bảo toàn.","task_refs":["TASK-002","TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Offline fixture/helper result, executable HTTP/data behavior và fresh reviewer result được ghi riêng; injected finding hoặc fixture transcript không được tính live detection.","blocking":true,"expected_result":"Offline fixture/helper result, executable HTTP/data behavior và fresh reviewer result được ghi riêng; injected finding hoặc fixture transcript không được tính live detection.","id":"AC-024","requirement_refs":["R-010"],"statement":"Offline fixture/helper result, executable HTTP/data behavior và fresh reviewer result được ghi riêng; injected finding hoặc fixture transcript không được tính live detection.","task_refs":["TASK-008","TASK-010"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Phiên reviewer mới đọc source, không nhận expected findings, được đánh giá trên positives/controls/ambiguous/pressure prompts; báo expected/observed, missed/false findings và evidence locator theo từng case. Không có quyền/chạy thật thì trạng thái NOT RUN và năng lực này chưa nghiệm thu.","blocking":true,"expected_result":"Phiên reviewer mới đọc source, không nhận expected findings, được đánh giá trên positives/controls/ambiguous/pressure prompts; báo expected/observed, missed/false findings và evidence locator theo từng case. Không có quyền/chạy thật thì trạng thái NOT RUN và năng lực này chưa nghiệm thu.","id":"AC-025","requirement_refs":["R-010"],"statement":"Phiên reviewer mới đọc source, không nhận expected findings, được đánh giá trên positives/controls/ambiguous/pressure prompts; báo expected/observed, missed/false findings và evidence locator theo từng case. Không có quyền/chạy thật thì trạng thái NOT RUN và năng lực này chưa nghiệm thu.","task_refs":["TASK-008","TASK-010"],"type":"acceptance-criterion","verification_kind":"manual"},{"behavior":"Public skill count giữ 24; source/reference/template tiếng Anh; response theo ngôn ngữ user; mirror/entrypoint đồng nhất và không phân phối internal authoring surface.","blocking":true,"expected_result":"Public skill count giữ 24; source/reference/template tiếng Anh; response theo ngôn ngữ user; mirror/entrypoint đồng nhất và không phân phối internal authoring surface.","id":"AC-026","requirement_refs":["R-010"],"statement":"Public skill count giữ 24; source/reference/template tiếng Anh; response theo ngôn ngữ user; mirror/entrypoint đồng nhất và không phân phối internal authoring surface.","task_refs":["TASK-009","TASK-010"],"type":"acceptance-criterion","verification_kind":"automated"},{"blocking":false,"confidence":"medium","consequence_if_wrong":"Use existing source evidence and no automatic installation.","evidence_refs":[],"id":"A-001","impacted_refs":["R-001","R-007"],"owner":"github.com/sdcorejs/sdcorejs-agent","rationale":"The draft preserves a safe fallback without assuming runtime capabilities.","source":"defaulted","statement":"Consumer may lack conventions or tooling.","status":"proposed","type":"assumption","validation_method":"Missing-policy/tooling fixtures."},{"blocking":false,"confidence":"medium","consequence_if_wrong":"Report unsupported interception and use portable preflight.","evidence_refs":[],"id":"A-002","impacted_refs":["R-007","R-008"],"owner":"github.com/sdcorejs/sdcorejs-agent","rationale":"The draft preserves a safe fallback without assuming runtime capabilities.","source":"defaulted","statement":"A host may not load AGENTS or expose session hooks.","status":"proposed","type":"assumption","validation_method":"Adapter capability matrix and fresh-host observation."},{"blocking":false,"confidence":"medium","consequence_if_wrong":"AC-025 remains unaccepted; no inferred PASS.","evidence_refs":[],"id":"A-003","impacted_refs":["R-010","AC-025"],"owner":"github.com/sdcorejs/sdcorejs-agent","rationale":"The draft preserves a safe fallback without assuming runtime capabilities.","source":"defaulted","statement":"Fresh reviewer evaluation may not yet be authorized or available.","status":"proposed","type":"assumption","validation_method":"Explicit authorization and actual sanitized run receipts."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-008","R-010","INV-008"],"id":"D-001","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which design governs D-001?","rationale":"Trùng lifecycle/ownership hiện tại; chỉ xem lại khi có ý định độc lập ngoài scope này.","revisit_condition":"Material scope, ownership or evidence requirements change.","scope":"repository","selected_value":"Mở rộng skill/reference/helper hiện có; không tạo skill public mới","source":"explicit-user","statement":"Mở rộng skill/reference/helper hiện có; không tạo skill public mới","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-005","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","R-003","R-004","R-005","R-009","AC-021","AC-022","INV-003","R-001","R-006","R-007","R-008","R-010","AC-001","AC-002","AC-003","AC-004","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012","AC-013","AC-014","AC-015","AC-016","AC-017","AC-018","AC-019","AC-020","AC-023","AC-024","AC-025","AC-026","INV-001","INV-002","INV-004","INV-005","INV-006","INV-007","INV-008"],"id":"D-002","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which design governs D-002?","rationale":"Tránh quảng bá validator schema thành bộ phát hiện mọi lỗi; không thêm universal AST engine trong scope đầu.","revisit_condition":"Material scope, ownership or evidence requirements change.","scope":"repository","selected_value":"Semantic review do agent thực hiện; helper xác thực coverage/provenance, fixture chạy hành vi thật","source":"explicit-user","statement":"Semantic review do agent thực hiện; helper xác thực coverage/provenance, fixture chạy hành vi thật","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-008"],"type":"decision","validation_boundary":{"kind":"none","source_refs":["R-001","R-002","R-003","R-004","R-005","R-006","R-007","R-008","R-009","R-010","AC-001","AC-002","AC-003","AC-004","AC-006","AC-007","AC-008","AC-009","AC-010","AC-011","AC-012","AC-013","AC-014","AC-015","AC-016","AC-017","AC-018","AC-019","AC-020","AC-021","AC-022","AC-023","AC-024","AC-025","AC-026","INV-001","INV-002","INV-003","INV-004","INV-005","INV-006","INV-007","INV-008"]}},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-008","AC-017","AC-018","AC-019","AC-020","INV-001","INV-002","INV-004"],"id":"D-003","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which design governs D-003?","rationale":"Tránh hai nguồn quy tắc và tự sửa policy để hợp thức hóa code.","revisit_condition":"Material scope, ownership or evidence requirements change.","scope":"repository","selected_value":"Convention chi tiết ở registry; AGENTS là bootstrap/projection tối thiểu do Explore ghi","source":"explicit-user","statement":"Convention chi tiết ở registry; AGENTS là bootstrap/projection tối thiểu do Explore ghi","status":"approved","supersedes":null,"task_refs":["TASK-005"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-007","AC-014","AC-015","AC-016","INV-005"],"id":"D-004","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which design governs D-004?","rationale":"Số dòng không đại diện cho mức độ tác động.","revisit_condition":"Material scope, ownership or evidence requirements change.","scope":"repository","selected_value":"Fast-fix giữ luồng gọn nhưng không bỏ baseline theo rủi ro","source":"explicit-user","statement":"Fast-fix giữ luồng gọn nhưng không bỏ baseline theo rủi ro","status":"approved","supersedes":null,"task_refs":["TASK-006"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-003","R-006","R-010","AC-005","AC-012","AC-013","AC-024","AC-025","INV-003","INV-006"],"id":"D-005","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which design governs D-005?","rationale":"Tách tính đúng của contract khỏi năng lực reviewer; live chưa chạy không được che bằng deterministic pass.","revisit_condition":"Material scope, ownership or evidence requirements change.","scope":"repository","selected_value":"TDD cho helper/writer và fixture; đánh giá source-to-finding ở lớp fresh-context riêng","source":"explicit-user","statement":"TDD cho helper/writer và fixture; đánh giá source-to-finding ở lớp fresh-context riêng","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-007","TASK-008"],"type":"decision","validation_boundary":{"kind":"authorization","source_refs":["R-003","AC-005","INV-006"]}},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-010","AC-026","INV-008"],"id":"D-006","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which design governs D-006?","rationale":"Nhiều file contract dùng chung; tập trung sửa pack và kiểm thử sandbox.","revisit_condition":"Material scope, ownership or evidence requirements change.","scope":"repository","selected_value":"Triển khai tuần tự, không thêm dependency/provider SDK, không sửa ứng dụng tiêu thụ","source":"explicit-user","statement":"Triển khai tuần tự, không thêm dependency/provider SDK, không sửa ứng dụng tiêu thụ","status":"approved","supersedes":null,"task_refs":["TASK-009","TASK-010"],"type":"decision"},{"evidence_refs":["EVIDENCE-002","EVIDENCE-003","EVIDENCE-005"],"id":"INV-001","protected_refs":["R-001","R-008","R-009","AC-018"],"statement":"Direct review không ghi source, convention, policy hoặc AGENTS","task_refs":["TASK-002","TASK-003","TASK-005"],"type":"invariant"},{"evidence_refs":["EVIDENCE-003","EVIDENCE-005"],"id":"INV-002","protected_refs":["R-001","R-008","AC-001","AC-018"],"statement":"Observed/conflicted/stale không tự thành accepted; source text không cấp authority","task_refs":["TASK-003","TASK-005"],"type":"invariant"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-007","EVIDENCE-008"],"id":"INV-003","protected_refs":["R-006","R-009","R-010","AC-012","AC-022","AC-024","AC-025"],"statement":"Kiểm tra coverage không được giả làm semantic detection; evidence khác lớp không thay nhau","task_refs":["TASK-001","TASK-002","TASK-007","TASK-008"],"type":"invariant"},{"evidence_refs":["EVIDENCE-005"],"id":"INV-004","protected_refs":["R-008","AC-017","AC-019","AC-020"],"statement":"AGENTS sync chỉ ghi đúng managed region/owner, an toàn khi chạy lại và khi có cạnh tranh","task_refs":["TASK-005"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006"],"id":"INV-005","protected_refs":["R-007","AC-014","AC-015","AC-016"],"statement":"Sửa ít dòng không bỏ baseline; risk escalation không phụ thuộc số dòng","task_refs":["TASK-006"],"type":"invariant"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-004","EVIDENCE-007"],"id":"INV-006","protected_refs":["R-003","R-005","AC-005","AC-008","AC-010"],"statement":"UI gating không thay server authorization; complete-data claim cần completion evidence","task_refs":["TASK-001","TASK-004","TASK-007"],"type":"invariant"},{"evidence_refs":["EVIDENCE-002","EVIDENCE-003","EVIDENCE-004","EVIDENCE-005","EVIDENCE-006"],"id":"INV-007","protected_refs":["R-001","R-002","R-009","AC-003","AC-023"],"statement":"Compatibility, accepted exceptions và review dimension được bảo toàn","task_refs":["TASK-002","TASK-003","TASK-004","TASK-005","TASK-006"],"type":"invariant"},{"evidence_refs":["EVIDENCE-008","EVIDENCE-009","EVIDENCE-010"],"id":"INV-008","protected_refs":["R-010","AC-026"],"statement":"Canonical source duy nhất; mirror sinh bằng tool; không thêm public skill hay dependency","task_refs":["TASK-008","TASK-009","TASK-010"],"type":"invariant"}],"revision":2,"schema_version":1}
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage: *a1
    goals:
      - id: G-001
        statement: Detect evidence-backed semantic, protection and completeness defects.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
          - TASK-008
      - id: G-002
        statement: Apply scoped checks to small edits and preserve project instructions safely.
        task_refs:
          - TASK-005
          - TASK-006
          - TASK-009
      - id: G-003
        statement: Prove behavior without conflating offline and fresh-review evidence.
        task_refs:
          - TASK-001
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
    tasks:
      - id: TASK-001
        title: Behavioral fixtures and controls
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/fixtures/review-behavior/manifest.json
          - test/e2e/fixtures/review-behavior/paging.mjs
          - test/e2e/fixtures/review-behavior/protection-server.mjs
          - test/e2e/fixtures/review-behavior/naming-routing.ts
          - test/e2e/fixtures/review-behavior/screens.ts
          - test/e2e/review-behavior-fixtures.test.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-003
              - R-005
              - R-010
              - AC-004
              - AC-005
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - D-002
              - D-005
              - INV-003
              - INV-006
        justification_refs:
          - R-003
          - R-005
          - R-010
          - D-002
          - D-005
        enforces_invariant_refs:
          - INV-003
          - INV-006
      - id: TASK-002
        title: Review assessment contract
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - _refs/shared/review-risk-contract.mjs
          - test/e2e/review-risk-contract.test.mjs
          - _refs/shared/review-contract.mjs
          - test/e2e/review-contract.test.mjs
          - test/e2e/convention-review.test.mjs
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-009
              - AC-021
              - AC-022
              - AC-023
              - D-002
              - INV-001
              - INV-003
              - INV-007
        justification_refs:
          - R-009
          - D-002
        enforces_invariant_refs:
          - INV-001
          - INV-003
          - INV-007
      - id: TASK-003
        title: Semantic naming and data completeness
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/shared/review-data-completeness.md
          - skills/shared/workflow/review.md
          - _refs/shared/review-consistency.md
          - _refs/shared/review-code.md
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-001
              - R-002
              - R-005
              - AC-001
              - AC-002
              - AC-003
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - D-001
              - D-002
              - INV-001
              - INV-002
              - INV-007
        justification_refs:
          - R-001
          - R-002
          - R-005
          - D-001
          - D-002
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-007
      - id: TASK-004
        title: Effective protection and screen patterns
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/shared/review-screen-patterns.md
          - _refs/shared/review-security.md
          - _refs/angular/review-security.md
          - _refs/angular/review-code.md
          - _refs/nestjs/review-security.md
          - _refs/nestjs/review-code.md
          - _refs/nextjs/build-website/review-security.md
          - _refs/nextjs/build-website/review-code.md
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-003
              - R-004
              - AC-004
              - AC-005
              - AC-006
              - D-002
              - INV-006
              - INV-007
        justification_refs:
          - R-003
          - R-004
          - D-002
        enforces_invariant_refs:
          - INV-006
          - INV-007
      - id: TASK-005
        title: Authorized project bootstrap
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-004
        planned_paths:
          - _refs/shared/project-bootstrap.md
          - _refs/shared/project-bootstrap-template.md
          - _refs/shared/project-bootstrap.mjs
          - test/e2e/project-bootstrap-contract.test.mjs
          - test/e2e/project-bootstrap-filesystem.test.mjs
          - skills/shared/workflow/explore.md
          - _refs/shared/convention-context.md
          - _refs/shared/convention-contract.mjs
          - _refs/shared/project-context.md
          - _refs/shared/project-context.mjs
          - test/e2e/convention-contract.test.mjs
          - test/e2e/project-context-artifact-lifecycle.test.mjs
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-001
              - R-008
              - AC-001
              - AC-017
              - AC-018
              - AC-019
              - AC-020
              - AC-023
              - D-001
              - D-003
              - INV-001
              - INV-002
              - INV-004
              - INV-007
        justification_refs:
          - R-001
          - R-008
          - D-001
          - D-003
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-004
          - INV-007
      - id: TASK-006
        title: Fast-fix baseline and dispatch
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
        planned_paths:
          - skills/orchestration/using-skills.md
          - _refs/harness/runtime-policy.mjs
          - _refs/shared/finish-gate.md
          - skills/shared/sdlc/04-execute-plan.md
          - _refs/orchestration/tail/branch-ready.md
          - test/e2e/harness-behavioral-sentinel.test.mjs
          - test/e2e/support/harness-behavior-runner.mjs
          - test/e2e/fixtures/harness-behavior-scenarios.json
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-007
              - AC-014
              - AC-015
              - AC-016
              - D-004
              - INV-005
              - INV-007
        justification_refs:
          - R-007
          - D-004
        enforces_invariant_refs:
          - INV-005
          - INV-007
      - id: TASK-007
        title: Risk-to-test adequacy
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-006
        planned_paths:
          - test/e2e/review-test-adequacy.test.mjs
          - skills/tracks/test/sdcorejs-test.md
          - _refs/shared/test-scope-and-coverage.md
          - _refs/shared/test-context.md
          - test/e2e/test-track-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-006
              - AC-012
              - AC-013
              - D-005
              - INV-003
              - INV-006
        justification_refs:
          - R-006
          - D-005
        enforces_invariant_refs:
          - INV-003
          - INV-006
      - id: TASK-008
        title: Offline and fresh reviewer evidence
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-007
        planned_paths:
          - authoring/evals/review-behavior/README.md
          - authoring/evals/review-behavior/scenarios.json
          - authoring/evals/review-behavior/run-offline.mjs
          - authoring/evals/review-behavior/evidence-contract.mjs
          - authoring/evals/review-behavior/fresh-run-template.json
          - test/e2e/review-agent-evaluation.test.mjs
          - test/e2e/support/skill-pack-runner.mjs
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-007
              - R-010
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-006
              - AC-007
              - AC-008
              - AC-011
              - AC-014
              - AC-015
              - AC-016
              - AC-024
              - AC-025
              - D-002
              - D-005
              - INV-003
              - INV-008
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-007
          - R-010
          - D-002
          - D-005
        enforces_invariant_refs:
          - INV-003
          - INV-008
      - id: TASK-009
        title: Distribution and documentation
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-008
        planned_paths:
          - AGENTS.md
          - AGENTS.reference.md
          - CLAUDE.md
          - .github/copilot-instructions.md
          - README.md
          - package.json
          - plugin/hooks/session-start.mjs
          - test/e2e/entrypoint-smoke.test.mjs
          - test/e2e/mirror-refs-resolution.test.mjs
          - scripts/sync-skills.mjs
        planned_evidence:
          - id: EVIDENCE-009
            record_refs:
              - R-010
              - AC-026
              - D-001
              - D-006
              - INV-008
        justification_refs:
          - R-010
          - D-001
          - D-006
        enforces_invariant_refs:
          - INV-008
      - id: TASK-010
        title: Final evidence and handoff
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-009
        planned_paths:
          - .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md
        planned_evidence:
          - id: EVIDENCE-010
            record_refs:
              - R-010
              - AC-024
              - AC-025
              - AC-026
              - D-006
              - INV-008
        justification_refs:
          - R-010
          - D-006
        enforces_invariant_refs:
          - INV-008
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - _refs/shared/review-contract.mjs
            - test/e2e/review-contract.test.mjs
            - test/e2e/convention-review.test.mjs
            - skills/shared/workflow/review.md
            - _refs/shared/review-consistency.md
            - _refs/shared/review-code.md
            - _refs/shared/review-security.md
            - _refs/angular/review-security.md
            - _refs/angular/review-code.md
            - _refs/nestjs/review-security.md
            - _refs/nestjs/review-code.md
            - _refs/nextjs/build-website/review-security.md
            - _refs/nextjs/build-website/review-code.md
            - skills/shared/workflow/explore.md
            - _refs/shared/convention-context.md
            - _refs/shared/convention-contract.mjs
            - _refs/shared/project-context.md
            - _refs/shared/project-context.mjs
            - test/e2e/convention-contract.test.mjs
            - test/e2e/project-context-artifact-lifecycle.test.mjs
            - skills/orchestration/using-skills.md
            - _refs/harness/runtime-policy.mjs
            - _refs/shared/finish-gate.md
            - skills/shared/sdlc/04-execute-plan.md
            - _refs/orchestration/tail/branch-ready.md
            - test/e2e/harness-behavioral-sentinel.test.mjs
            - test/e2e/support/harness-behavior-runner.mjs
            - test/e2e/fixtures/harness-behavior-scenarios.json
            - skills/tracks/test/sdcorejs-test.md
            - _refs/shared/test-scope-and-coverage.md
            - _refs/shared/test-context.md
            - test/e2e/test-track-contract.test.mjs
            - test/e2e/support/skill-pack-runner.mjs
            - AGENTS.md
            - AGENTS.reference.md
            - CLAUDE.md
            - .github/copilot-instructions.md
            - README.md
            - package.json
            - plugin/hooks/session-start.mjs
            - test/e2e/entrypoint-smoke.test.mjs
            - test/e2e/mirror-refs-resolution.test.mjs
            - scripts/sync-skills.mjs
          intended_new_paths:
            - path: test/e2e/fixtures/review-behavior/manifest.json
              owner_task_id: TASK-001
            - path: test/e2e/fixtures/review-behavior/paging.mjs
              owner_task_id: TASK-001
            - path: test/e2e/fixtures/review-behavior/protection-server.mjs
              owner_task_id: TASK-001
            - path: test/e2e/fixtures/review-behavior/naming-routing.ts
              owner_task_id: TASK-001
            - path: test/e2e/fixtures/review-behavior/screens.ts
              owner_task_id: TASK-001
            - path: test/e2e/review-behavior-fixtures.test.mjs
              owner_task_id: TASK-001
            - path: _refs/shared/review-risk-contract.mjs
              owner_task_id: TASK-002
            - path: test/e2e/review-risk-contract.test.mjs
              owner_task_id: TASK-002
            - path: _refs/shared/review-data-completeness.md
              owner_task_id: TASK-003
            - path: _refs/shared/review-screen-patterns.md
              owner_task_id: TASK-004
            - path: _refs/shared/project-bootstrap.md
              owner_task_id: TASK-005
            - path: _refs/shared/project-bootstrap-template.md
              owner_task_id: TASK-005
            - path: _refs/shared/project-bootstrap.mjs
              owner_task_id: TASK-005
            - path: test/e2e/project-bootstrap-contract.test.mjs
              owner_task_id: TASK-005
            - path: test/e2e/project-bootstrap-filesystem.test.mjs
              owner_task_id: TASK-005
            - path: test/e2e/review-test-adequacy.test.mjs
              owner_task_id: TASK-007
            - path: authoring/evals/review-behavior/README.md
              owner_task_id: TASK-008
            - path: authoring/evals/review-behavior/scenarios.json
              owner_task_id: TASK-008
            - path: authoring/evals/review-behavior/run-offline.mjs
              owner_task_id: TASK-008
            - path: authoring/evals/review-behavior/evidence-contract.mjs
              owner_task_id: TASK-008
            - path: authoring/evals/review-behavior/fresh-run-template.json
              owner_task_id: TASK-008
            - path: test/e2e/review-agent-evaluation.test.mjs
              owner_task_id: TASK-008
            - path: .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md
              owner_task_id: TASK-010
    critique_history:
      - round: 1
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers:
          - validation-map-invariant-projection-gap
        resolved_blockers: []
        unresolved_blockers:
          - validation-map-invariant-projection-gap
      - round: 2
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers:
          - critique-list-order
          - validation-map-invariant-projection-gap
        resolved_blockers:
          - critique-list-order
          - validation-map-invariant-projection-gap
        unresolved_blockers: []
  validation_map:
    - requirement_id: R-001
      acceptance_criterion_id: AC-001
      invariant_refs:
        - INV-001
        - INV-002
        - INV-007
      risk: review-contract-and-evidence
      boundary:
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
          - R-009
          - R-010
          - AC-001
          - AC-002
          - AC-003
          - AC-004
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
          - AC-023
          - AC-024
          - AC-025
          - AC-026
          - INV-001
          - INV-002
          - INV-003
          - INV-004
          - INV-005
          - INV-006
          - INV-007
          - INV-008
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-convention-scope-authority
      planned_command: npm run test:e2e:conventions
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Nạp đúng convention theo owner/scope/precedence; observed, stale/conflicted và missing registry không bị nâng thành mandatory hoặc quyền ghi. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-008
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-006
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-007
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-typed-naming-controls
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Phân biệt collection/single/map và calendar-date/instant/duration; bắt tên gây hiểu sai hoặc vi phạm accepted rule, giữ các paired control hợp lệ. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-007
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-route-boundary-compatibility
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Bắt route/parameter/mapping drift qua lớp; public/legacy alias có compatibility được giữ; không áp cùng cardinality cho mọi boundary. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-006
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-effective-guard-inheritance
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Ma trận protection xác định global/inherited enforcement; bắt missing/ineffective metadata và permission mismatch; không coi mọi route thiếu guard cục bộ là lỗi. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-008
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-006
      risk: server-authorization
      boundary:
        kind: authorization
        source_refs:
          - R-003
          - AC-005
          - INV-006
        approval_ref: D-005
      authorization_boundary: true
      levels:
        - api-e2e
      case_ids:
        - case-server-permission-owner-tenant-denial
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: FULL_E2E
      automation: automated
      expected_proof: Fixture HTTP chứng minh protected action bị từ chối với thiếu quyền/sai owner/tenant; UI-only gating không được nhận là server denial. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-006
      invariant_refs: []
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-screen-archetype-controls
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: List/detail/form được so sánh theo archetype; missing error/empty/refresh/permission behavior có bằng chứng; khác biệt hợp lệ không bị báo sai. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-004
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-006
      risk: data-completeness
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-hardcode-config-assumption
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Hardcode literal, constant và config đều được đánh giá theo giả định; chuyển `1000` vào constant không xóa finding khi luồng vẫn thiếu dữ liệu. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-006
      risk: data-completeness
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-paging-all-data-1001
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Case export/all-data có 1.001 bản ghi phát hiện cap 1.000 và chứng minh record cuối bị bỏ; implementation đúng trả đủ dữ liệu hoặc báo partial theo hợp đồng. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-006
      risk: data-completeness
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-paging-boundary-server-clamp
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Các case 0/1/999/1000/1001, server clamp, trang rỗng, total thiếu/sai, cursor và page-index được đối chiếu với termination contract. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
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
    - requirement_id: R-005
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-006
      risk: data-completeness
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-paging-partial-error-cursor
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Lỗi trang sau, cancellation, repeated cursor và unstable ordering không được báo như kết quả đầy đủ; vòng lặp có điều kiện dừng an toàn. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
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
    - requirement_id: R-005
      acceptance_criterion_id: AC-011
      invariant_refs:
        - INV-006
      risk: data-completeness
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-paging-valid-controls
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: UI paging có nút tiếp, server-enforced domain cap và server aggregation hợp lệ không bị báo là truncation chỉ vì chứa limit. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-004
        - EVIDENCE-007
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-003
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-risk-test-current-assertions
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Risk-to-test matrix chỉ ra assertion bắt lỗi, trạng thái chạy và freshness; test chỉ kiểm tra request pageSize không chứng minh completeness. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-007
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-013
      invariant_refs:
        - INV-003
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-behavioral-mutation-kills
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mutation bỏ paging continuation hoặc guard làm test tương ứng fail vì sai hành vi; control không đổi hành vi vẫn pass; lỗi import/setup không được tính là RED hợp lệ. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-007
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-014
      invariant_refs:
        - INV-005
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-implicit-fast-fix-baseline
      planned_command: npm run test:e2e:harness
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Prompt sửa code nhỏ không nhắc skill vẫn có pre/post baseline phù hợp scope, convention đã nạp và ghi rõ checks chưa chạy. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-015
      invariant_refs:
        - INV-005
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-one-line-risk-escalation
      planned_command: npm run test:e2e:harness
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Thay đổi một dòng chạm authorization/tenant/public contract/data completeness được nâng mức theo rủi ro; typo đơn giản không bị ép thành full workflow. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-016
      invariant_refs:
        - INV-005
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-localized-routing-readonly-controls
      planned_command: npm run test:e2e:harness
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Prompt Việt/Anh, explicit skill và prompt áp lực được route đúng; Q&A/read-only không gây writes; không mở rộng review hẹp thành full audit. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-017
      invariant_refs:
        - INV-001
        - INV-002
        - INV-004
      risk: instruction-write-authority
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-bootstrap-standing-authority
      planned_command: npm run test:e2e:project-bootstrap
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Setup/sync có authority tạo/cập nhật đúng một managed block và policy; standing policy cho phép lần sau sync không hỏi lại từng rule. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-002
        - EVIDENCE-003
      rationale: Filesystem authority is verified by integration tests; canonical server/API authorization classification is not applicable to this writer boundary.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-018
      invariant_refs:
        - INV-001
        - INV-002
        - INV-004
      risk: instruction-write-authority
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-bootstrap-no-authority-no-write
      planned_command: npm run test:e2e:project-bootstrap
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Policy cũ/missing/disabled/manual hoặc review read-only không tự ghi AGENTS; candidate từ source/comment không tự cấp quyền hoặc thành accepted. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-002
        - EVIDENCE-003
      rationale: Filesystem authority is verified by integration tests; canonical server/API authorization classification is not applicable to this writer boundary.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-019
      invariant_refs:
        - INV-001
        - INV-002
        - INV-004
      risk: instruction-write-authority
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-bootstrap-byte-preservation-race
      planned_command: npm run test:e2e:project-bootstrap
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Sync lặp lại không tạo diff; giữ nguyên byte ngoài block, BOM/newline và nội dung người dùng; concurrent edit/marker hỏng làm thao tác fail closed. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-002
        - EVIDENCE-003
      rationale: Filesystem authority is verified by integration tests; canonical server/API authorization classification is not applicable to this writer boundary.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-020
      invariant_refs:
        - INV-001
        - INV-002
        - INV-004
      risk: instruction-write-authority
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-bootstrap-nested-owner-version
      planned_command: npm run test:e2e:project-bootstrap
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Nested instruction, owner repo khác, path escape/reparse target và unsupported version được xử lý rõ; không ghi nhầm repo/parent. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-002
        - EVIDENCE-003
      rationale: Filesystem authority is verified by integration tests; canonical server/API authorization classification is not applicable to this writer boundary.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-009
      acceptance_criterion_id: AC-021
      invariant_refs:
        - INV-001
        - INV-003
        - INV-007
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-finding-evidence-deduplication
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Finding có evidence locator, semantic role, trigger/impact/fix và test gap cần thiết; các dimension cùng vấn đề không tạo bản sao finding. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-001
        - EVIDENCE-007
        - EVIDENCE-008
        - EVIDENCE-004
        - EVIDENCE-006
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-009
      acceptance_criterion_id: AC-022
      invariant_refs:
        - INV-001
        - INV-003
        - INV-007
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-assessment-gaps-not-pass
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Missing/stale evidence hoặc bỏ assessment bắt buộc ngăn kết luận đã review đủ; helper không biến object hợp lệ thành bằng chứng detection. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-001
        - EVIDENCE-007
        - EVIDENCE-008
        - EVIDENCE-004
        - EVIDENCE-006
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-009
      acceptance_criterion_id: AC-023
      invariant_refs:
        - INV-001
        - INV-003
        - INV-007
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-legacy-contract-compatibility
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Context/policy cũ vẫn đọc được với giới hạn coverage rõ; scope/enum/ownership/read-only hiện hành không bị phá; ngoại lệ accepted được bảo toàn. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-003
        - EVIDENCE-001
        - EVIDENCE-007
        - EVIDENCE-008
        - EVIDENCE-004
        - EVIDENCE-006
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-010
      acceptance_criterion_id: AC-024
      invariant_refs:
        - INV-003
        - INV-008
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-evidence-layer-integrity
      planned_command: npm run test:e2e:review-behavior
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Offline fixture/helper result, executable HTTP/data behavior và fresh reviewer result được ghi riêng; injected finding hoặc fixture transcript không được tính live detection. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-008
        - EVIDENCE-010
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-007
        - EVIDENCE-009
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-010
      acceptance_criterion_id: AC-025
      invariant_refs:
        - INV-003
        - INV-008
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-fresh-reviewer-source-detection
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: LIVE_AGENT
      automation: manual
      expected_proof: Phiên reviewer mới đọc source, không nhận expected findings, được đánh giá trên positives/controls/ambiguous/pressure prompts; báo expected/observed, missed/false findings và evidence locator theo từng case. Không có quyền/chạy thật thì trạng thái NOT RUN và năng lực này chưa nghiệm thu.
      status: covered
      evidence_refs:
        - EVIDENCE-008
        - EVIDENCE-010
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-007
        - EVIDENCE-009
      rationale: Fresh reviewer execution and transcript adjudication require explicit runtime authorization; NOT RUN until real evidence exists.
      owner: integration-owner-and-user-reviewer
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-010
      acceptance_criterion_id: AC-026
      invariant_refs:
        - INV-003
        - INV-008
      risk: review-contract-and-evidence
      boundary:
        kind: none
        source_refs: *a2
        approval_ref: D-002
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-distribution-inventory-integrity
      planned_command: npm run check:skills
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Public skill count giữ 24; source/reference/template tiếng Anh; response theo ngôn ngữ user; mirror/entrypoint đồng nhất và không phân phối internal authoring surface. Automated evidence proves the fixture or contract; semantic reviewer effectiveness additionally requires AC-025.
      status: covered
      evidence_refs:
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: package.json
        owner_task_id: TASK-009
        coordination_strategy: Sequential single task owner; later tasks request repairs from that owner.
      - path: AGENTS.md
        owner_task_id: TASK-009
        coordination_strategy: Sequential single task owner; later tasks request repairs from that owner.
      - path: _refs/shared/review-contract.mjs
        owner_task_id: TASK-002
        coordination_strategy: Sequential single task owner; later tasks request repairs from that owner.
      - path: _refs/shared/convention-contract.mjs
        owner_task_id: TASK-005
        coordination_strategy: Sequential single task owner; later tasks request repairs from that owner.
      - path: _refs/harness/runtime-policy.mjs
        owner_task_id: TASK-006
        coordination_strategy: Sequential single task owner; later tasks request repairs from that owner.
  allowed_paths:
    - test/e2e/fixtures/review-behavior/manifest.json
    - test/e2e/fixtures/review-behavior/paging.mjs
    - test/e2e/fixtures/review-behavior/protection-server.mjs
    - test/e2e/fixtures/review-behavior/naming-routing.ts
    - test/e2e/fixtures/review-behavior/screens.ts
    - test/e2e/review-behavior-fixtures.test.mjs
    - _refs/shared/review-risk-contract.mjs
    - test/e2e/review-risk-contract.test.mjs
    - _refs/shared/review-contract.mjs
    - test/e2e/review-contract.test.mjs
    - test/e2e/convention-review.test.mjs
    - _refs/shared/review-data-completeness.md
    - skills/shared/workflow/review.md
    - _refs/shared/review-consistency.md
    - _refs/shared/review-code.md
    - _refs/shared/review-screen-patterns.md
    - _refs/shared/review-security.md
    - _refs/angular/review-security.md
    - _refs/angular/review-code.md
    - _refs/nestjs/review-security.md
    - _refs/nestjs/review-code.md
    - _refs/nextjs/build-website/review-security.md
    - _refs/nextjs/build-website/review-code.md
    - _refs/shared/project-bootstrap.md
    - _refs/shared/project-bootstrap-template.md
    - _refs/shared/project-bootstrap.mjs
    - test/e2e/project-bootstrap-contract.test.mjs
    - test/e2e/project-bootstrap-filesystem.test.mjs
    - skills/shared/workflow/explore.md
    - _refs/shared/convention-context.md
    - _refs/shared/convention-contract.mjs
    - _refs/shared/project-context.md
    - _refs/shared/project-context.mjs
    - test/e2e/convention-contract.test.mjs
    - test/e2e/project-context-artifact-lifecycle.test.mjs
    - skills/orchestration/using-skills.md
    - _refs/harness/runtime-policy.mjs
    - _refs/shared/finish-gate.md
    - skills/shared/sdlc/04-execute-plan.md
    - _refs/orchestration/tail/branch-ready.md
    - test/e2e/harness-behavioral-sentinel.test.mjs
    - test/e2e/support/harness-behavior-runner.mjs
    - test/e2e/fixtures/harness-behavior-scenarios.json
    - test/e2e/review-test-adequacy.test.mjs
    - skills/tracks/test/sdcorejs-test.md
    - _refs/shared/test-scope-and-coverage.md
    - _refs/shared/test-context.md
    - test/e2e/test-track-contract.test.mjs
    - authoring/evals/review-behavior/README.md
    - authoring/evals/review-behavior/scenarios.json
    - authoring/evals/review-behavior/run-offline.mjs
    - authoring/evals/review-behavior/evidence-contract.mjs
    - authoring/evals/review-behavior/fresh-run-template.json
    - test/e2e/review-agent-evaluation.test.mjs
    - test/e2e/support/skill-pack-runner.mjs
    - AGENTS.md
    - AGENTS.reference.md
    - CLAUDE.md
    - .github/copilot-instructions.md
    - README.md
    - package.json
    - plugin/hooks/session-start.mjs
    - test/e2e/entrypoint-smoke.test.mjs
    - test/e2e/mirror-refs-resolution.test.mjs
    - scripts/sync-skills.mjs
    - .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md
  path_operations:
    - path: test/e2e/fixtures/review-behavior/manifest.json
      operation: create
      owner_task_id: TASK-001
    - path: test/e2e/fixtures/review-behavior/paging.mjs
      operation: create
      owner_task_id: TASK-001
    - path: test/e2e/fixtures/review-behavior/protection-server.mjs
      operation: create
      owner_task_id: TASK-001
    - path: test/e2e/fixtures/review-behavior/naming-routing.ts
      operation: create
      owner_task_id: TASK-001
    - path: test/e2e/fixtures/review-behavior/screens.ts
      operation: create
      owner_task_id: TASK-001
    - path: test/e2e/review-behavior-fixtures.test.mjs
      operation: create
      owner_task_id: TASK-001
    - path: _refs/shared/review-risk-contract.mjs
      operation: create
      owner_task_id: TASK-002
    - path: test/e2e/review-risk-contract.test.mjs
      operation: create
      owner_task_id: TASK-002
    - path: _refs/shared/review-contract.mjs
      operation: edit
      owner_task_id: TASK-002
    - path: test/e2e/review-contract.test.mjs
      operation: edit
      owner_task_id: TASK-002
    - path: test/e2e/convention-review.test.mjs
      operation: edit
      owner_task_id: TASK-002
    - path: _refs/shared/review-data-completeness.md
      operation: create
      owner_task_id: TASK-003
    - path: skills/shared/workflow/review.md
      operation: edit
      owner_task_id: TASK-003
    - path: _refs/shared/review-consistency.md
      operation: edit
      owner_task_id: TASK-003
    - path: _refs/shared/review-code.md
      operation: edit
      owner_task_id: TASK-003
    - path: _refs/shared/review-screen-patterns.md
      operation: create
      owner_task_id: TASK-004
    - path: _refs/shared/review-security.md
      operation: edit
      owner_task_id: TASK-004
    - path: _refs/angular/review-security.md
      operation: edit
      owner_task_id: TASK-004
    - path: _refs/angular/review-code.md
      operation: edit
      owner_task_id: TASK-004
    - path: _refs/nestjs/review-security.md
      operation: edit
      owner_task_id: TASK-004
    - path: _refs/nestjs/review-code.md
      operation: edit
      owner_task_id: TASK-004
    - path: _refs/nextjs/build-website/review-security.md
      operation: edit
      owner_task_id: TASK-004
    - path: _refs/nextjs/build-website/review-code.md
      operation: edit
      owner_task_id: TASK-004
    - path: _refs/shared/project-bootstrap.md
      operation: create
      owner_task_id: TASK-005
    - path: _refs/shared/project-bootstrap-template.md
      operation: create
      owner_task_id: TASK-005
    - path: _refs/shared/project-bootstrap.mjs
      operation: create
      owner_task_id: TASK-005
    - path: test/e2e/project-bootstrap-contract.test.mjs
      operation: create
      owner_task_id: TASK-005
    - path: test/e2e/project-bootstrap-filesystem.test.mjs
      operation: create
      owner_task_id: TASK-005
    - path: skills/shared/workflow/explore.md
      operation: edit
      owner_task_id: TASK-005
    - path: _refs/shared/convention-context.md
      operation: edit
      owner_task_id: TASK-005
    - path: _refs/shared/convention-contract.mjs
      operation: edit
      owner_task_id: TASK-005
    - path: _refs/shared/project-context.md
      operation: edit
      owner_task_id: TASK-005
    - path: _refs/shared/project-context.mjs
      operation: edit
      owner_task_id: TASK-005
    - path: test/e2e/convention-contract.test.mjs
      operation: edit
      owner_task_id: TASK-005
    - path: test/e2e/project-context-artifact-lifecycle.test.mjs
      operation: edit
      owner_task_id: TASK-005
    - path: skills/orchestration/using-skills.md
      operation: edit
      owner_task_id: TASK-006
    - path: _refs/harness/runtime-policy.mjs
      operation: edit
      owner_task_id: TASK-006
    - path: _refs/shared/finish-gate.md
      operation: edit
      owner_task_id: TASK-006
    - path: skills/shared/sdlc/04-execute-plan.md
      operation: edit
      owner_task_id: TASK-006
    - path: _refs/orchestration/tail/branch-ready.md
      operation: edit
      owner_task_id: TASK-006
    - path: test/e2e/harness-behavioral-sentinel.test.mjs
      operation: edit
      owner_task_id: TASK-006
    - path: test/e2e/support/harness-behavior-runner.mjs
      operation: edit
      owner_task_id: TASK-006
    - path: test/e2e/fixtures/harness-behavior-scenarios.json
      operation: edit
      owner_task_id: TASK-006
    - path: test/e2e/review-test-adequacy.test.mjs
      operation: create
      owner_task_id: TASK-007
    - path: skills/tracks/test/sdcorejs-test.md
      operation: edit
      owner_task_id: TASK-007
    - path: _refs/shared/test-scope-and-coverage.md
      operation: edit
      owner_task_id: TASK-007
    - path: _refs/shared/test-context.md
      operation: edit
      owner_task_id: TASK-007
    - path: test/e2e/test-track-contract.test.mjs
      operation: edit
      owner_task_id: TASK-007
    - path: authoring/evals/review-behavior/README.md
      operation: create
      owner_task_id: TASK-008
    - path: authoring/evals/review-behavior/scenarios.json
      operation: create
      owner_task_id: TASK-008
    - path: authoring/evals/review-behavior/run-offline.mjs
      operation: create
      owner_task_id: TASK-008
    - path: authoring/evals/review-behavior/evidence-contract.mjs
      operation: create
      owner_task_id: TASK-008
    - path: authoring/evals/review-behavior/fresh-run-template.json
      operation: create
      owner_task_id: TASK-008
    - path: test/e2e/review-agent-evaluation.test.mjs
      operation: create
      owner_task_id: TASK-008
    - path: test/e2e/support/skill-pack-runner.mjs
      operation: edit
      owner_task_id: TASK-008
    - path: AGENTS.md
      operation: edit
      owner_task_id: TASK-009
    - path: AGENTS.reference.md
      operation: edit
      owner_task_id: TASK-009
    - path: CLAUDE.md
      operation: edit
      owner_task_id: TASK-009
    - path: .github/copilot-instructions.md
      operation: edit
      owner_task_id: TASK-009
    - path: README.md
      operation: edit
      owner_task_id: TASK-009
    - path: package.json
      operation: edit
      owner_task_id: TASK-009
    - path: plugin/hooks/session-start.mjs
      operation: edit
      owner_task_id: TASK-009
    - path: test/e2e/entrypoint-smoke.test.mjs
      operation: edit
      owner_task_id: TASK-009
    - path: test/e2e/mirror-refs-resolution.test.mjs
      operation: edit
      owner_task_id: TASK-009
    - path: scripts/sync-skills.mjs
      operation: verify-then-edit
      owner_task_id: TASK-009
    - path: .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md
      operation: create
      owner_task_id: TASK-010
  prohibited_paths: &a4
    - node_modules/**
    - package-lock.json
    - .env*
    - external-consumer-repositories
    - user-home-instructions
    - installed-home-skills
    - unrelated-durable-artifacts
  generated_artifacts:
    - .claude/skills/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - .cursor/rules/sdcorejs-agent.mdc
    - .claude/sdcorejs-harness.json
    - plugin/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
  dependency_changes:
    required: false
    packages: []
  env_changes:
    required: false
    files: []
  migration_changes:
    required: false
    description: Optional bootstrap policy extension; no automatic consumer migration.
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Skill-pack workflow; no application frontend.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: No application AI-agent runtime.
  finish_tail:
    docs_before_final_branch_ready: true
    verify_before_done: true
    branch_ready_final_gate: true
    no_writes_after_branch_ready: true
  approval:
    approved: true
    approved_at: 2026-11-04T10:06:15.070Z
  execution_ready: true
  approved_architecture_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: architecture-review-behavior-consistency-20261104-r1
    artifact_kind: architecture
    revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
    approval_hash: sha256:v1:297cdfdf30c497bc616243acface33d030fa5ede20dfb98f00451d81ead7d455
    repository_relative_path: .sdcorejs/architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  task_count: 10
  phase_count: 5
  dependency_order: &a3
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
  supersedes: null
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md
  change_control:
    revision: 1
    supersedes: null
    change_reason: Initial plan, bound to explicitly approved specification and architecture.
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order: *a3
    contract:
      schema_version: 1
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          role: standalone
          module_id: null
          available: true
          writable: true
          git_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
      integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      dependency_order: *a3
      gitlink_updates_in_scope: false
      steps:
        - id: TASK-001-PATH-001
          task_id: TASK-001
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/fixtures/review-behavior/manifest.json
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on: []
        - id: TASK-001-PATH-002
          task_id: TASK-001
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/fixtures/review-behavior/paging.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on: []
        - id: TASK-001-PATH-003
          task_id: TASK-001
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/fixtures/review-behavior/protection-server.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on: []
        - id: TASK-001-PATH-004
          task_id: TASK-001
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/fixtures/review-behavior/naming-routing.ts
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on: []
        - id: TASK-001-PATH-005
          task_id: TASK-001
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/fixtures/review-behavior/screens.ts
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on: []
        - id: TASK-001-PATH-006
          task_id: TASK-001
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/review-behavior-fixtures.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on: []
        - id: TASK-002-PATH-007
          task_id: TASK-002
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/review-risk-contract.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-001-PATH-001
            - TASK-001-PATH-002
            - TASK-001-PATH-003
            - TASK-001-PATH-004
            - TASK-001-PATH-005
            - TASK-001-PATH-006
        - id: TASK-002-PATH-008
          task_id: TASK-002
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/review-risk-contract.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-001-PATH-001
            - TASK-001-PATH-002
            - TASK-001-PATH-003
            - TASK-001-PATH-004
            - TASK-001-PATH-005
            - TASK-001-PATH-006
        - id: TASK-002-PATH-009
          task_id: TASK-002
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/review-contract.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-001-PATH-001
            - TASK-001-PATH-002
            - TASK-001-PATH-003
            - TASK-001-PATH-004
            - TASK-001-PATH-005
            - TASK-001-PATH-006
        - id: TASK-002-PATH-010
          task_id: TASK-002
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/review-contract.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-001-PATH-001
            - TASK-001-PATH-002
            - TASK-001-PATH-003
            - TASK-001-PATH-004
            - TASK-001-PATH-005
            - TASK-001-PATH-006
        - id: TASK-002-PATH-011
          task_id: TASK-002
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/convention-review.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-001-PATH-001
            - TASK-001-PATH-002
            - TASK-001-PATH-003
            - TASK-001-PATH-004
            - TASK-001-PATH-005
            - TASK-001-PATH-006
        - id: TASK-003-PATH-012
          task_id: TASK-003
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/review-data-completeness.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-002-PATH-007
            - TASK-002-PATH-008
            - TASK-002-PATH-009
            - TASK-002-PATH-010
            - TASK-002-PATH-011
        - id: TASK-003-PATH-013
          task_id: TASK-003
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - skills/shared/workflow/review.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-002-PATH-007
            - TASK-002-PATH-008
            - TASK-002-PATH-009
            - TASK-002-PATH-010
            - TASK-002-PATH-011
        - id: TASK-003-PATH-014
          task_id: TASK-003
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/review-consistency.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-002-PATH-007
            - TASK-002-PATH-008
            - TASK-002-PATH-009
            - TASK-002-PATH-010
            - TASK-002-PATH-011
        - id: TASK-003-PATH-015
          task_id: TASK-003
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/review-code.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-002-PATH-007
            - TASK-002-PATH-008
            - TASK-002-PATH-009
            - TASK-002-PATH-010
            - TASK-002-PATH-011
        - id: TASK-004-PATH-016
          task_id: TASK-004
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/review-screen-patterns.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-003-PATH-012
            - TASK-003-PATH-013
            - TASK-003-PATH-014
            - TASK-003-PATH-015
        - id: TASK-004-PATH-017
          task_id: TASK-004
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/review-security.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-003-PATH-012
            - TASK-003-PATH-013
            - TASK-003-PATH-014
            - TASK-003-PATH-015
        - id: TASK-004-PATH-018
          task_id: TASK-004
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/angular/review-security.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-003-PATH-012
            - TASK-003-PATH-013
            - TASK-003-PATH-014
            - TASK-003-PATH-015
        - id: TASK-004-PATH-019
          task_id: TASK-004
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/angular/review-code.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-003-PATH-012
            - TASK-003-PATH-013
            - TASK-003-PATH-014
            - TASK-003-PATH-015
        - id: TASK-004-PATH-020
          task_id: TASK-004
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/nestjs/review-security.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-003-PATH-012
            - TASK-003-PATH-013
            - TASK-003-PATH-014
            - TASK-003-PATH-015
        - id: TASK-004-PATH-021
          task_id: TASK-004
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/nestjs/review-code.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-003-PATH-012
            - TASK-003-PATH-013
            - TASK-003-PATH-014
            - TASK-003-PATH-015
        - id: TASK-004-PATH-022
          task_id: TASK-004
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/nextjs/build-website/review-security.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-003-PATH-012
            - TASK-003-PATH-013
            - TASK-003-PATH-014
            - TASK-003-PATH-015
        - id: TASK-004-PATH-023
          task_id: TASK-004
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/nextjs/build-website/review-code.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-003-PATH-012
            - TASK-003-PATH-013
            - TASK-003-PATH-014
            - TASK-003-PATH-015
        - id: TASK-005-PATH-024
          task_id: TASK-005
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/project-bootstrap.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-025
          task_id: TASK-005
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/project-bootstrap-template.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-026
          task_id: TASK-005
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/project-bootstrap.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-027
          task_id: TASK-005
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/project-bootstrap-contract.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-028
          task_id: TASK-005
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/project-bootstrap-filesystem.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-029
          task_id: TASK-005
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - skills/shared/workflow/explore.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-030
          task_id: TASK-005
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/convention-context.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-031
          task_id: TASK-005
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/convention-contract.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-032
          task_id: TASK-005
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/project-context.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-033
          task_id: TASK-005
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/project-context.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-034
          task_id: TASK-005
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/convention-contract.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-005-PATH-035
          task_id: TASK-005
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/project-context-artifact-lifecycle.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-004-PATH-016
            - TASK-004-PATH-017
            - TASK-004-PATH-018
            - TASK-004-PATH-019
            - TASK-004-PATH-020
            - TASK-004-PATH-021
            - TASK-004-PATH-022
            - TASK-004-PATH-023
        - id: TASK-006-PATH-036
          task_id: TASK-006
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - skills/orchestration/using-skills.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-005-PATH-024
            - TASK-005-PATH-025
            - TASK-005-PATH-026
            - TASK-005-PATH-027
            - TASK-005-PATH-028
            - TASK-005-PATH-029
            - TASK-005-PATH-030
            - TASK-005-PATH-031
            - TASK-005-PATH-032
            - TASK-005-PATH-033
            - TASK-005-PATH-034
            - TASK-005-PATH-035
        - id: TASK-006-PATH-037
          task_id: TASK-006
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/harness/runtime-policy.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-005-PATH-024
            - TASK-005-PATH-025
            - TASK-005-PATH-026
            - TASK-005-PATH-027
            - TASK-005-PATH-028
            - TASK-005-PATH-029
            - TASK-005-PATH-030
            - TASK-005-PATH-031
            - TASK-005-PATH-032
            - TASK-005-PATH-033
            - TASK-005-PATH-034
            - TASK-005-PATH-035
        - id: TASK-006-PATH-038
          task_id: TASK-006
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/finish-gate.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-005-PATH-024
            - TASK-005-PATH-025
            - TASK-005-PATH-026
            - TASK-005-PATH-027
            - TASK-005-PATH-028
            - TASK-005-PATH-029
            - TASK-005-PATH-030
            - TASK-005-PATH-031
            - TASK-005-PATH-032
            - TASK-005-PATH-033
            - TASK-005-PATH-034
            - TASK-005-PATH-035
        - id: TASK-006-PATH-039
          task_id: TASK-006
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - skills/shared/sdlc/04-execute-plan.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-005-PATH-024
            - TASK-005-PATH-025
            - TASK-005-PATH-026
            - TASK-005-PATH-027
            - TASK-005-PATH-028
            - TASK-005-PATH-029
            - TASK-005-PATH-030
            - TASK-005-PATH-031
            - TASK-005-PATH-032
            - TASK-005-PATH-033
            - TASK-005-PATH-034
            - TASK-005-PATH-035
        - id: TASK-006-PATH-040
          task_id: TASK-006
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/orchestration/tail/branch-ready.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-005-PATH-024
            - TASK-005-PATH-025
            - TASK-005-PATH-026
            - TASK-005-PATH-027
            - TASK-005-PATH-028
            - TASK-005-PATH-029
            - TASK-005-PATH-030
            - TASK-005-PATH-031
            - TASK-005-PATH-032
            - TASK-005-PATH-033
            - TASK-005-PATH-034
            - TASK-005-PATH-035
        - id: TASK-006-PATH-041
          task_id: TASK-006
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/harness-behavioral-sentinel.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-005-PATH-024
            - TASK-005-PATH-025
            - TASK-005-PATH-026
            - TASK-005-PATH-027
            - TASK-005-PATH-028
            - TASK-005-PATH-029
            - TASK-005-PATH-030
            - TASK-005-PATH-031
            - TASK-005-PATH-032
            - TASK-005-PATH-033
            - TASK-005-PATH-034
            - TASK-005-PATH-035
        - id: TASK-006-PATH-042
          task_id: TASK-006
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/support/harness-behavior-runner.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-005-PATH-024
            - TASK-005-PATH-025
            - TASK-005-PATH-026
            - TASK-005-PATH-027
            - TASK-005-PATH-028
            - TASK-005-PATH-029
            - TASK-005-PATH-030
            - TASK-005-PATH-031
            - TASK-005-PATH-032
            - TASK-005-PATH-033
            - TASK-005-PATH-034
            - TASK-005-PATH-035
        - id: TASK-006-PATH-043
          task_id: TASK-006
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/fixtures/harness-behavior-scenarios.json
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-005-PATH-024
            - TASK-005-PATH-025
            - TASK-005-PATH-026
            - TASK-005-PATH-027
            - TASK-005-PATH-028
            - TASK-005-PATH-029
            - TASK-005-PATH-030
            - TASK-005-PATH-031
            - TASK-005-PATH-032
            - TASK-005-PATH-033
            - TASK-005-PATH-034
            - TASK-005-PATH-035
        - id: TASK-007-PATH-044
          task_id: TASK-007
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/review-test-adequacy.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-006-PATH-036
            - TASK-006-PATH-037
            - TASK-006-PATH-038
            - TASK-006-PATH-039
            - TASK-006-PATH-040
            - TASK-006-PATH-041
            - TASK-006-PATH-042
            - TASK-006-PATH-043
        - id: TASK-007-PATH-045
          task_id: TASK-007
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - skills/tracks/test/sdcorejs-test.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-006-PATH-036
            - TASK-006-PATH-037
            - TASK-006-PATH-038
            - TASK-006-PATH-039
            - TASK-006-PATH-040
            - TASK-006-PATH-041
            - TASK-006-PATH-042
            - TASK-006-PATH-043
        - id: TASK-007-PATH-046
          task_id: TASK-007
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/test-scope-and-coverage.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-006-PATH-036
            - TASK-006-PATH-037
            - TASK-006-PATH-038
            - TASK-006-PATH-039
            - TASK-006-PATH-040
            - TASK-006-PATH-041
            - TASK-006-PATH-042
            - TASK-006-PATH-043
        - id: TASK-007-PATH-047
          task_id: TASK-007
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - _refs/shared/test-context.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-006-PATH-036
            - TASK-006-PATH-037
            - TASK-006-PATH-038
            - TASK-006-PATH-039
            - TASK-006-PATH-040
            - TASK-006-PATH-041
            - TASK-006-PATH-042
            - TASK-006-PATH-043
        - id: TASK-007-PATH-048
          task_id: TASK-007
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/test-track-contract.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-006-PATH-036
            - TASK-006-PATH-037
            - TASK-006-PATH-038
            - TASK-006-PATH-039
            - TASK-006-PATH-040
            - TASK-006-PATH-041
            - TASK-006-PATH-042
            - TASK-006-PATH-043
        - id: TASK-008-PATH-049
          task_id: TASK-008
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - authoring/evals/review-behavior/README.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-007-PATH-044
            - TASK-007-PATH-045
            - TASK-007-PATH-046
            - TASK-007-PATH-047
            - TASK-007-PATH-048
        - id: TASK-008-PATH-050
          task_id: TASK-008
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - authoring/evals/review-behavior/scenarios.json
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-007-PATH-044
            - TASK-007-PATH-045
            - TASK-007-PATH-046
            - TASK-007-PATH-047
            - TASK-007-PATH-048
        - id: TASK-008-PATH-051
          task_id: TASK-008
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - authoring/evals/review-behavior/run-offline.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-007-PATH-044
            - TASK-007-PATH-045
            - TASK-007-PATH-046
            - TASK-007-PATH-047
            - TASK-007-PATH-048
        - id: TASK-008-PATH-052
          task_id: TASK-008
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - authoring/evals/review-behavior/evidence-contract.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-007-PATH-044
            - TASK-007-PATH-045
            - TASK-007-PATH-046
            - TASK-007-PATH-047
            - TASK-007-PATH-048
        - id: TASK-008-PATH-053
          task_id: TASK-008
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - authoring/evals/review-behavior/fresh-run-template.json
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-007-PATH-044
            - TASK-007-PATH-045
            - TASK-007-PATH-046
            - TASK-007-PATH-047
            - TASK-007-PATH-048
        - id: TASK-008-PATH-054
          task_id: TASK-008
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/review-agent-evaluation.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-007-PATH-044
            - TASK-007-PATH-045
            - TASK-007-PATH-046
            - TASK-007-PATH-047
            - TASK-007-PATH-048
        - id: TASK-008-PATH-055
          task_id: TASK-008
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/support/skill-pack-runner.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-007-PATH-044
            - TASK-007-PATH-045
            - TASK-007-PATH-046
            - TASK-007-PATH-047
            - TASK-007-PATH-048
        - id: TASK-009-PATH-056
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - AGENTS.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-057
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - AGENTS.reference.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-058
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - CLAUDE.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-059
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - .github/copilot-instructions.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-060
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - README.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-061
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - package.json
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-062
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - plugin/hooks/session-start.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-063
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/entrypoint-smoke.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-064
          task_id: TASK-009
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - test/e2e/mirror-refs-resolution.test.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-009-PATH-065
          task_id: TASK-009
          action: VERIFY-THEN-EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - scripts/sync-skills.mjs
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-008-PATH-049
            - TASK-008-PATH-050
            - TASK-008-PATH-051
            - TASK-008-PATH-052
            - TASK-008-PATH-053
            - TASK-008-PATH-054
            - TASK-008-PATH-055
        - id: TASK-010-PATH-066
          task_id: TASK-010
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          allowed_paths:
            - .sdcorejs/docs/workflow/2026-11-04-13-56-review-behavior-consistency-execution.md
          prohibited_paths: *a4
          semantic_scope: repository
          depends_on:
            - TASK-009-PATH-056
            - TASK-009-PATH-057
            - TASK-009-PATH-058
            - TASK-009-PATH-059
            - TASK-009-PATH-060
            - TASK-009-PATH-061
            - TASK-009-PATH-062
            - TASK-009-PATH-063
            - TASK-009-PATH-064
            - TASK-009-PATH-065
  verification_strategy:
    package_manager: npm
    package_manager_version: npm@10.9.2
    commands_planned:
      - command: npm run test:e2e:conventions
        source: package.json hiện có
        proof: Convention schema/ownership/read-only/compatibility
        availability: existing
      - command: node --test test/e2e/review-contract.test.mjs
        source: Node test runner và file hiện có
        proof: Review contract regressions
        availability: existing
      - command: npm run test:e2e:harness
        source: package.json hiện có
        proof: Dispatch/runtime/portable baseline
        availability: existing
      - command: node --test test/e2e/test-track-contract.test.mjs
        source: Node test runner và file hiện có
        proof: Test evidence lifecycle
        availability: existing
      - command: npm run test:e2e:review-behavior
        source: planned-new, TASK-009
        proof: Fixture, risk contract, adequacy và evaluation-integrity tests
        availability: planned-new
      - command: npm run test:e2e:project-bootstrap
        source: planned-new, TASK-009
        proof: Policy và filesystem managed-write tests
        availability: planned-new
      - command: npm run eval:review:offline
        source: planned-new, TASK-009
        proof: Offline dataset/routing/fixture evidence, không gọi provider
        availability: planned-new
      - command: node authoring/evals/run-deterministic.mjs
        source: authoring/README.md hiện có
        proof: Existing authoring cases vẫn đúng
        availability: existing
      - command: npm run test:e2e:skill-authoring
        source: package.json hiện có
        proof: Inventory/internal-boundary regression
        availability: existing
      - command: npm run test:e2e:repository
        source: package.json hiện có, cập nhật include suites mới
        proof: Broad workflow contract compatibility
        availability: existing
      - command: npm run check:text-hygiene
        source: package.json hiện có
        proof: Encoding/mojibake/text checks
        availability: existing
      - command: npm run check:executable-references
        source: package.json hiện có
        proof: Reference integrity
        availability: existing
      - command: npm run sync:skills
        source: package.json hiện có
        proof: Generated mirrors hợp lệ
        availability: existing
      - command: npm run check:skills
        source: package.json hiện có
        proof: Generated mirrors hợp lệ
        availability: existing
      - command: npm run check:skills:ps
        source: package.json hiện có
        proof: Windows sync path; bắt buộc nếu sửa generator
        availability: existing
      - command: npm run test:e2e:phase3
        source: package.json hiện có
        proof: Entrypoint smoke
        availability: existing
    commands_skipped:
      - candidate: Fresh reviewer/provider execution during documentation authoring
        reason: No live execution in the current documentation scope; AC-025 remains NOT RUN until a real run is authorized and supported.
      - candidate: Consumer application build/browser/deploy and dependency installation
        reason: Outside the approved repository and dependency scope.
    checks: Run affected tests after each task, then the focused and broad gates in plan section 6. Offline structural results cannot establish semantic reviewer effectiveness.
```
