---
artifact_id: review-behavior-consistency-plan-draft-r1
artifact_kind: execution-doc
document_type: plan-draft
change_ref: review-behavior-consistency-20261104
contract_id: review-behavior-consistency-20261104
requirement_id: R-001
source_spec: .sdcorejs/specs/workflow/2026-11-04-16-36-review-behavior-consistency.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
stack_profile: markdown-skill-pack
source_revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
status: awaiting-plan-approval
approval:
  approved: false
  approved_at: null
execution_ready: false
task_count: 10
phase_count: 5
redaction_applied: true
change_control:
  revision: 1
  supersedes: null
source_architecture: .sdcorejs/architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md
---

# Kế hoạch triển khai review, convention và kiểm tra thay đổi nhỏ

## 1. Phạm vi và trạng thái

Thực hiện R-001–R-010 và AC-001–AC-026 trong [đặc tả đã duyệt](../../specs/workflow/2026-11-04-16-36-review-behavior-consistency.md). Giữ các invariants của [kiến trúc đã duyệt](../../architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md). [Coverage companion](2026-11-04-13-56-review-behavior-consistency-coverage.md) là dữ liệu có cấu trúc cho requirements, decisions, tasks, file ownership và bằng chứng dự kiến; không phải trạng thái tiến độ phiên làm việc.

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
