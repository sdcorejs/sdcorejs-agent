---
acceptance_criteria_count: 16
approval_evidence: User replied "Duyệt" to the pending spec approval gate in the current thread.
approval_source: explicit-user-choice
approved_at: 2026-09-09T09:15:33.846Z
approved_by: user
artifact_id: spec-visual-companion-offer-r1
artifact_kind: spec
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: visual-companion-offer
commit_policy: with-change
contract_id: visual-companion-offer
description: Proactive visual offers, scoped state/consent, consistent routing
  and behavioral evidence.
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
manual_criteria_count: 2
name: visual-companion-offer
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/specs/workflow/2026-09-09-16-06-visual-companion-offer.md
requirement_id: visual-companion-offer-user-request
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-09-09-16-06-visual-companion-offer-spec.md
source_plan: none
source_revision: 1e74140592794bc64bd6d955d89dd4a83e390bcb
source_spec: none
stack_profile: node-esm
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:dda50970e9452383cb14f812f387063eec12ca2389154f17d81b5dfdcdc1c8e2
---
# Chủ động mời Visual Companion - Approved Spec

> Snapshot b?t bi?n c?a spec ng??i d?ng ?? duy?t. C?c tr?ng th?i draft trong ph?n tr?ch b?n d??i l? l?ch s? b?n ?? duy?t; metadata approved ? ??u file l? ngu?n approval. Target root ???c bi?u di?n b?ng `.` ?? snapshot kh?ng ph? thu?c ???ng d?n checkout.

## Approved contract

# Spec - Chủ động mời Visual Companion - 2026-09-09 16:06

## Problem & Goals

Agent cần mời xem trực quan ở quyết định còn mở đầu tiên mà việc nhìn các
phương án giúp người dùng lựa chọn. Cơ chế phải nhất quán khi vào trực tiếp
Design hoặc chuyển skill, giữ task đơn giản gọn và không hỏi lại nhu cầu hay
quyền đã được cấp. Người dùng không cần biết tên Visual Companion.

Yêu cầu trong tệp đính kèm xác định repo authoring này là đích sửa, bao gồm
source, runtime policy, references, mirrors, documentation và regression/eval.
Spec này ghi lại phạm vi đó để duyệt; chưa phải approved snapshot hoặc bằng
chứng implementation. Không có approved spec/plan hiện hành cho thay đổi này.

## Hiện trạng đã xác minh

Baseline là `1e74140592794bc64bd6d955d89dd4a83e390bcb`, package `0.8.0`;
working tree sạch trước khảo sát. Canonical sources là `skills/**`, `_refs/**`
và các entrypoint theo `MIRROR_POLICY.md`. `npm run sync:skills` sinh mirrors;
`npm run check:skills` kiểm tra drift. Không sửa global installed skills.

| Bằng chứng | Khoảng trống |
|---|---|
| `skills/shared/sdlc/01-brainstorming.md`, mục Visual Companion | Có lời mời chủ động nhưng sao chép nhiều runtime guidance; text-only còn gắn với TDD; cho phép mời lại khi có quyết định mới. |
| `skills/tracks/design/sdcorejs-design.md:87` | Chỉ nhắc dùng khi hữu ích, khả dụng và đã consent; thiếu điểm kiểm tra để phát sinh lời mời. |
| `_refs/shared/runtime-protocols.md` | Chỉ route tới companion sau khi người dùng chấp nhận. |
| `_refs/shared/user-choice-prompt.md` | Một thang ưu tiên đặt native structured choice trước visual, trái với runtime đã tách hai thang. |
| `_refs/harness/runtime-policy.mjs` | `shouldOfferVisual()` bỏ qua `decision`, chỉ kiểm tra cờ visual và decline/new decision; accepted vẫn trả true. |
| `selectInteraction()` và `resolveVisualCompanionPlan()` | Hàm đầu chọn live theo capability; hàm sau chặn live theo consent nhưng fallback bỏ qua native visual. |
| `test/e2e/harness-behavioral-sentinel.test.mjs` | Test offer truyền sẵn `visual_spatial`; không chứng minh nhận diện tự nhiên. |
| `test/e2e/support/cli-adapters.mjs` | Adapter hiện chỉ có version smoke và prompt contract cần review; chưa có runner hội thoại A/B hoàn chỉnh. |
| `_refs/harness/runtime-attestation.mjs` | Danh sách observable capabilities hiện chỉ gồm orchestration/worktree; không nhận observation visual. Phải xác định đường evidence cho visual khi tích hợp, không xem adapter defaults là bằng chứng capability trong phiên. |

Lệnh baseline `node --test test/e2e/harness-behavioral-sentinel.test.mjs
test/e2e/static-visual-composer.test.mjs test/e2e/visual-companion-runtime.test.mjs`
đã chạy: 36 pass, 0 fail, 0 skip. Node hiện tại `v22.14.0` nằm ngoài engine
khai báo `^22.22.3 || ^24.15.0 || >=26.0.0`; đây là baseline chẩn đoán,
chưa phải xác minh trên toolchain được hỗ trợ. Chưa chạy live behavioral eval.
Version smoke qua adapter hiện có đã xác nhận `codex-cli 0.153.4` và
`Claude Code 2.1.224` thực thi được, exit code 0. Version smoke không gọi LLM,
không kiểm tra credential values và không chứng minh agent invocation hoặc
visual presentation thực tế khả dụng.

Đã tham khảo [Superpowers brainstorming](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md)
ngày 2026-09-09: áp dụng ý tưởng mời đúng lúc, đánh giá từng câu hỏi và không
mời lại sau từ chối nếu người dùng chưa chủ động nêu lại. Giữ consent mở
browser riêng của sdcorejs; không sao chép workflow hoặc auto-open của upstream.

## Requirements

- R-001 - Đánh giá ý nghĩa của quyết định trước khi đưa phương án hoặc tự chốt: quyết định còn mở cần user chọn, ít nhất hai phương án hợp lệ có khác biệt đáng kể, visual giúp hiểu lựa chọn, sở thích/consent hiện có và khả năng trình bày thực tế.
- R-002 - Load policy ngắn dùng chung đúng lúc ở Brainstorming, Design direct entry và chủ sở hữu quyết định phù hợp. Executor trả quyết định chưa rõ về đúng workflow; không mở lại thiết kế đã duyệt.
- R-003 - Giữ decision identity, visual-thread identity, evaluation/offer/response state và phạm vi consent/decline qua handoff trong context hiện có. Không tạo checkpoint.
- R-004 - Thống nhất thang surface, reuse consent đúng phạm vi, fallback trung thực và quyền quyết định bằng hội thoại.
- R-005 - Có regression cho policy, routing, trạng thái, consent và fallback; có scenarios/runner nhiều lượt từ prompt tự nhiên để đánh giá agent thật tách biệt deterministic tests.
- R-006 - Cập nhật canonical sources, documentation, mirrors và validation; giữ 23 public skills, source dùng lại bằng tiếng Anh, runtime theo ngôn ngữ user.

Nguồn tất cả R-* là yêu cầu trực tiếp của user, trạng thái active; semantic
owner là `github.com/sdcorejs/sdcorejs-agent`, không có module owner riêng.

## Decisions

- D-001 - Dùng một shared reference ngắn cho nhận diện/offer và executable policy hiện có cho trạng thái/routing. Đây là hướng user đã chỉ định; tránh nhân bản và không xây keyword classifier.
- D-002 - Giữ thứ tự visual: live đủ capability và consent → native visual → static HTML → numbered Markdown. Text/approval: native structured choice → numbered Markdown. User đã xác định hai thang này.
- D-003 - Decline theo visual thread hoặc toàn session vẫn hiệu lực khi đổi skill/phase/wording; chỉ user chủ động bật lại được thay đổi. Accepted/pending không tạo lời mời nhu cầu lần hai. User đã xác định quy tắc này.
- D-004 - Giữ runtime, event authority, lifecycle, artifact owner và approval gates hiện có. Live eval chỉ được báo theo dữ liệu thực; thiếu khả năng chạy thì hoàn thiện runner/scenarios và báo NOT RUN. User đã chỉ định phạm vi này.

Các D-* xác nhận lựa chọn có sẵn trong yêu cầu user, không thể hiện user đã
duyệt bản spec này. Không có quyết định sản phẩm cần thêm câu hỏi discovery.

## Assumptions

- A-001 - Khả năng chạy live A/B trong môi trường này chưa xác minh. CLI được tìm thấy nhưng chưa kiểm tra một lượt agent thực. Đây là giả định không chặn implementation vì user cho phép bàn giao runner và báo phần chưa chạy; phải kiểm tra lại khi đến live evaluation. Không đọc credential values hoặc bịa transcript.

## Architecture gate classification

Phân loại dự kiến `not-applicable`, bypass `bounded-bug-fix`: sửa sự không
nhất quán của policy/routing hiện có và thêm trạng thái trong context hiện có;
không thay transport, event contract, public CLI, durable data model, state
owner, trust boundary hay dependency direction. Không thêm dependency hoặc
dịch vụ phân loại. Đây vẫn là implementation nhiều bước cần spec/plan.
Nếu implementation đòi thay các ranh giới này, phải phân loại lại trước plan.

## Non-goals

- Không tạo skill mới, hook luôn chạy, classifier phức tạp, visual runtime mới hoặc production SDLC coverage.
- Không đổi click thành approval, bỏ spec/plan gates, tự cấp quyền runtime/browser hoặc tự mở browser để minh họa task này.
- Không ép user chọn khi họ đã giao agent tự quyết; không tạo phương án giả hoặc mở lại layout đã được duyệt.
- Không commit, push, publish, bump version hoặc cài đè bộ skills toàn cục trong phạm vi hiện tại.

## Architecture

Policy nhận diện/offer có một canonical owner mới ở
`_refs/sdlc/visual-offer-policy.md`, ngắn và load trước khi trình bày quyết
định còn mở. Skill/router dẫn tới policy này; chỉ khi chuẩn bị surface/consent
runtime mới load `_refs/sdlc/visual-companion.md`. Không load toàn runtime vào
task sửa typo, rename, spacing xác định hoặc layout đã duyệt.

Agent đánh giá ngữ nghĩa bằng context và phương án thực, ghi một lý do ngắn;
deterministic helper nhận đánh giá có cấu trúc để áp policy. Helper không tự
xưng là natural-language classifier. Không xem một fixture gán sẵn cờ visual
là bằng chứng agent tự nhận diện.

Mở rộng tối thiểu `visual_companion` trong context hiện có: identity của
decision và visual thread; trạng thái `not-evaluated`, `not-applicable`,
`pending`, `accepted`, `declined`; lý do đánh giá; phạm vi phản hồi; surface
được chọn/fallback và lý do; consent runtime/browser có scope. Trạng thái
accepted cho biết nhu cầu visual, không tự cấp consent runtime hay browser.
Các consumer bảo toàn fields khi handoff; helper giữ tương thích các entrypoint
hiện có khi có thể, xử lý dữ liệu cũ/thiếu một cách thận trọng và không suy
diễn quyền đã cấp. Không lưu global mutable state hoặc authenticated URL.

Direct request xem mockup đi thẳng tới surface khả dụng, không hỏi nhu cầu
lần nữa. Nếu chọn live thì chỉ hỏi quyền side effect còn thiếu. Capability
`browser_auto_open: unknown` không làm mất native/static visual hoặc link
live mở thủ công. Chưa có surface thật thì tiếp tục bằng text, không mời
một tính năng không thể cung cấp. Lỗi live loại riêng surface lỗi khỏi lần
resolve tiếp theo; giữ nguyên decision/options và consent scope.

Lời mời độc lập với approval triển khai, ngắn, theo ngôn ngữ user và chỉ rõ
mockup/flow sẽ so sánh. Native structured choice có thể chở lời mời, nhưng
không thay preview khi user đã chọn xem. Written reply là nguồn quyết định
chính; mọi click vẫn là supporting feedback.

Ví dụ hành vi mong muốn, không phải transcript eval: khi đã xác định hai
phương án selection trên mobile, agent nói: “Có hai cách đặt selection và
action trên card với ưu/nhược điểm khác nhau. Bạn muốn xem hai mockup đặt cạnh
nhau để chọn không?” Nếu user đã yêu cầu so sánh mockup, agent tạo preview
trên surface khả dụng thay vì lặp câu hỏi đó. Nếu user từ chối, agent giữ
trạng thái qua handoff sang Design và tiếp tục bằng chữ.

## Stack profile and technology assumptions

- Track `workflow`, stack profile `node-esm`, confidence high: package có `type: module`; runtime helpers và test dùng Node ESM.
- Target/semantic owner là repo authoring được user nêu rõ; execution host cùng repository identity.
- Reuse Node built-ins, screen model, CLI, static composer, runtime attestation, capability contract và harness eval hiện có.
- Các trường context chính xác và compatibility mapping thuộc implementation plan; không thay public transport/schema của screen.

## File structure

| Source/bề mặt | Phạm vi |
|---|---|
| `_refs/sdlc/visual-offer-policy.md` | Tạo policy nhận diện/offer dùng chung. |
| `skills/orchestration/using-skills.md`, `skills/shared/sdlc/01-brainstorming.md`, `skills/tracks/design/sdcorejs-design.md` | Tích hợp đúng lúc, bỏ quy tắc lặp/trái nhau và truyền context. |
| `skills/shared/sdlc/04-execute-plan.md`, Angular/Next.js và các workflow thực sự chạm quyết định visual | Handoff về owner, bảo toàn state; chỉ sửa consumer cần thiết. |
| `_refs/shared/runtime-protocols.md`, `_refs/shared/user-choice-prompt.md`, `_refs/sdlc/visual-companion.md`, `_refs/shared/project-context.md`, entrypoint nguồn có chỉ dẫn load companion | Thống nhất JIT loading, consent scope, decline và surface. |
| `_refs/harness/runtime-policy.mjs`, capability/attestation contracts và consumer liên quan | Sửa offer/state/surface; giữ tri-state capability và bằng chứng runtime. |
| `test/e2e/harness-behavioral-sentinel.test.mjs`, visual suites, fixtures/support; `authoring/evals/` và runner/documentation liên quan | Regression có ý nghĩa và behavioral scenarios/runner A/B mở rộng harness hiện có. |
| `README.md`, docs companion, `package.json` nếu cần script chạy eval | Ví dụ sử dụng và hướng dẫn chạy/review bằng chứng. |
| Các mirrors do `scripts/sync-skills.mjs` sinh theo `MIRROR_POLICY.md` | Generate sau khi canonical ổn định, kiểm tra drift. |

Đây là phạm vi source, không phải thứ tự task thực thi. Không sửa các file
không liên quan chỉ vì trùng từ khóa visual.

## Acceptance criteria

| ID | Hành vi/input | Kết quả phải kiểm chứng | R |
|---|---|---|---|
| AC-001 | Sidebar ba cấp, chưa rõ navigation | Xác định phương án đáng so sánh rồi offer trước khi tự chốt; prompt không cần tên companion. | R-001,R-005 |
| AC-002 | sd-table mobile thành card, chưa rõ selection/action | Offer mockup so sánh trước quyết định bố trí. | R-001,R-005 |
| AC-003 | Direct entry Design, layout chưa rõ | Cùng policy và timing như Brainstorming. | R-002,R-005 |
| AC-004 | User đã yêu cầu hai mockup hoặc đã accepted/pending | Không hỏi lại nhu cầu; reuse consent đúng scope, chỉ hỏi side effect thực sự chưa được cấp khi cần. | R-003,R-004,R-005 |
| AC-005 | Rename input, spacing có giá trị, typo, keyword-only UI/design/Angular/diagram, một phương án hợp lệ, hoặc agent được giao tự quyết | Không offer và không bịa lựa chọn. | R-001,R-005 |
| AC-006 | Triển khai layout đã approved; hoặc executor phát hiện quyết định còn mở | Không mở lại approved choice; unresolved choice trở về đúng workflow owner với state giữ nguyên. | R-002,R-003,R-005 |
| AC-007 | Yêu cầu lẫn nghiệp vụ và UI | Làm rõ blocker ảnh hưởng option set trước, offer đúng quyết định visual về sau; không offer chỉ từ UI keyword. | R-001,R-005 |
| AC-008 | Decline rồi đổi skill/phase/wording hoặc decision trong cùng visual thread; decline toàn session | Không lặp offer trong scope bị từ chối. | R-003,R-005 |
| AC-009 | User chủ động bật visual lại | Tiếp tục trong scope yêu cầu mới, bảo toàn decline rộng hơn còn hiệu lực và không tự cấp runtime/browser consent. | R-003,R-004,R-005 |
| AC-010 | Native structured choice và visual cùng supported | Preview theo visual ladder; text/approval theo text ladder; consent thiếu không chọn live như đã được phép. | R-004,R-005 |
| AC-011 | Live lỗi, thiếu capability, browser auto-open unknown, hoặc không có visual surface | Native visual → static → numbered Markdown theo khả năng; giữ decision/options; không offer chức năng bất khả dụng hoặc mất visual chỉ do auto-open unknown. | R-004,R-005 |
| AC-012 | Click chọn visual | Không approve spec/plan/implementation; written reply vẫn authoritative; runtime cleanup và local-only boundary được giữ. | R-004,R-005 |
| AC-013 | Handoff và consent scope | Phân biệt đủ not-evaluated/not-applicable + reason/pending/accepted/declined/surface/fallback; không checkpoint, token hoặc authenticated URL trong durable artifacts. | R-003,R-004,R-005 |
| AC-014 | Behavioral evaluation từ prompt tự nhiên, nhiều lượt | Hoàn thiện ít nhất 12 scenario trên và negative/pressure controls; runner không nạp expected visual flags vào agent; giữ transcript/receipt thực và source/runtime/model metadata; báo tỷ lệ đúng, bỏ sót, offer sai, lặp với mẫu số. Nếu chưa chạy được, ghi NOT RUN và lý do, không tạo transcript giả. | R-005 |
| AC-015 | Canonical/mirror/docs | 23 public skills không đổi; sources English-only trừ localization fixtures; runtime output bản địa hóa; docs có ví dụ và cách user chủ động yêu cầu; mirror/hygiene/executable-reference checks pass. | R-006 |
| AC-016 | Review và validation cuối | Không còn chỉ dẫn mâu thuẫn giữa policy, choice, companion và helper; affected regressions và repository checks pass trên Node hỗ trợ hoặc giới hạn môi trường được báo rõ; live evidence tách khỏi deterministic. | R-005,R-006 |

AC-001..AC-013 có regression deterministic và behavioral scenario tương ứng;
điểm đạt về hành vi agent chỉ được kết luận từ live evidence thực. AC-014
chấp nhận runner/scenarios đầy đủ kèm NOT RUN đúng lý do khi môi trường chưa
chạy được, theo yêu cầu user. AC-015..AC-016 có automated checks và review.

## Risks & mitigations

- Nhận diện semantic vẫn phụ thuộc model/context: chạy baseline và candidate trong điều kiện tương đương, không suy rộng từ unit tests; ghi model/effort/version và giới hạn mẫu.
- Mở rộng context có thể làm mất state ở consumer cũ: test handoff nhiều lượt, missing/legacy fields và scoped decline/consent; không dùng skill/phase làm khóa identity.
- Sửa fallback có thể vô tình đổi consent/approval: test từng tổ hợp supported/unsupported/unknown và assertion click không vượt gate.
- Luồng nhiều skill dễ nặng context: policy ngắn, runtime guide JIT; negative eval phải chứng minh task đơn giản không thêm ceremony.
- Node hiện tại ngoài engine: dùng phiên bản hỗ trợ có sẵn hoặc runtime riêng phục vụ kiểm thử trong phạm vi thực thi; không sửa engine để làm test xanh.

## Out of scope (deferred)

Không có feature bổ sung hoãn lại. Live A/B và việc khẳng định độ tin cậy
chỉ hoàn thành khi có execution thực; nếu bị giới hạn, phải bàn giao cách chạy
và bằng chứng NOT RUN rõ ràng. Chưa có số liệu offer rate ở thời điểm draft.

## Typed spec context

```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: visual-companion-offer
  requirement_id: visual-companion-offer-user-request
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
  stack_profile: node-esm
  profile_confidence: high
  source_requirement_context: "Current explicit user attachment: sections 1-5;
    target authoring repository and all behavioral constraints confirmed."
  acceptance_criteria_count: 16
  manual_criteria_count: 2
  non_goals:
    - No new skill, always-on hook, classifier service, dependency or production
      SDLC expansion.
    - No implementation approval inferred from visual feedback.
    - No commit, push, release, global skill installation or version bump.
  risks:
    - Semantic recognition requires real behavioral evidence.
    - Runtime Node version is outside the declared engine range.
  assumptions:
    - A-001
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
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: bounded-bug-fix
      rationale: Repair existing offer and surface policy inconsistencies using the
        same runtime, context owner, CLI and event contracts; add no service,
        persisted model, dependency direction or trust boundary.
    rationale: Repair existing offer and surface policy inconsistencies using the
      same runtime, context owner, CLI and event contracts; add no service,
      persisted model, dependency direction or trust boundary.
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - {"id":"R-001","type":"requirement","statement":"Đánh giá ý nghĩa của quyết định trước khi đưa phương án hoặc tự chốt: quyết định còn mở cần user chọn, ít nhất hai phương án hợp lệ có khác biệt đáng kể, visual giúp hiểu lựa chọn, sở thích/consent hiện có và khả năng trình bày thực tế.","source":"explicit-user","status":"active","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_module_id":null,"task_refs":[]}
      - {"id":"R-002","type":"requirement","statement":"Load policy ngắn dùng chung đúng lúc ở Brainstorming, Design direct entry và chủ sở hữu quyết định phù hợp. Executor trả quyết định chưa rõ về đúng workflow; không mở lại thiết kế đã duyệt.","source":"explicit-user","status":"active","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_module_id":null,"task_refs":[]}
      - {"id":"R-003","type":"requirement","statement":"Giữ decision identity, visual-thread identity, evaluation/offer/response state và phạm vi consent/decline qua handoff trong context hiện có. Không tạo checkpoint.","source":"explicit-user","status":"active","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_module_id":null,"task_refs":[]}
      - {"id":"R-004","type":"requirement","statement":"Thống nhất thang surface, reuse consent đúng phạm vi, fallback trung thực và quyền quyết định bằng hội thoại.","source":"explicit-user","status":"active","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_module_id":null,"task_refs":[]}
      - {"id":"R-005","type":"requirement","statement":"Có regression cho policy, routing, trạng thái, consent và fallback; có scenarios/runner nhiều lượt từ prompt tự nhiên để đánh giá agent thật tách biệt deterministic tests.","source":"explicit-user","status":"active","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_module_id":null,"task_refs":[]}
      - {"id":"R-006","type":"requirement","statement":"Cập nhật canonical sources, documentation, mirrors và validation; giữ 23 public skills, source dùng lại bằng tiếng Anh, runtime theo ngôn ngữ user.","source":"explicit-user","status":"active","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","owner_module_id":null,"task_refs":[]}
      - {"id":"AC-001","type":"acceptance-criterion","statement":"Sidebar ba cấp, chưa rõ navigation","behavior":"Sidebar ba cấp, chưa rõ navigation","expected_result":"Xác định phương án đáng so sánh rồi offer trước khi tự chốt; prompt không cần tên companion.","verification_kind":"automated","blocking":true,"requirement_refs":["R-001","R-005"],"task_refs":[]}
      - {"id":"AC-002","type":"acceptance-criterion","statement":"sd-table mobile thành card, chưa rõ selection/action","behavior":"sd-table mobile thành card, chưa rõ selection/action","expected_result":"Offer mockup so sánh trước quyết định bố trí.","verification_kind":"automated","blocking":true,"requirement_refs":["R-001","R-005"],"task_refs":[]}
      - {"id":"AC-003","type":"acceptance-criterion","statement":"Direct entry Design, layout chưa rõ","behavior":"Direct entry Design, layout chưa rõ","expected_result":"Cùng policy và timing như Brainstorming.","verification_kind":"automated","blocking":true,"requirement_refs":["R-002","R-005"],"task_refs":[]}
      - {"id":"AC-004","type":"acceptance-criterion","statement":"User đã yêu cầu hai mockup hoặc đã accepted/pending","behavior":"User đã yêu cầu hai mockup hoặc đã accepted/pending","expected_result":"Không hỏi lại nhu cầu; reuse consent đúng scope, chỉ hỏi side effect thực sự chưa được cấp khi cần.","verification_kind":"automated","blocking":true,"requirement_refs":["R-003","R-004","R-005"],"task_refs":[]}
      - {"id":"AC-005","type":"acceptance-criterion","statement":"Rename input, spacing có giá trị, typo, keyword-only UI/design/Angular/diagram, một phương án hợp lệ, hoặc agent được giao tự quyết","behavior":"Rename input, spacing có giá trị, typo, keyword-only UI/design/Angular/diagram, một phương án hợp lệ, hoặc agent được giao tự quyết","expected_result":"Không offer và không bịa lựa chọn.","verification_kind":"automated","blocking":true,"requirement_refs":["R-001","R-005"],"task_refs":[]}
      - {"id":"AC-006","type":"acceptance-criterion","statement":"Triển khai layout đã approved; hoặc executor phát hiện quyết định còn mở","behavior":"Triển khai layout đã approved; hoặc executor phát hiện quyết định còn mở","expected_result":"Không mở lại approved choice; unresolved choice trở về đúng workflow owner với state giữ nguyên.","verification_kind":"automated","blocking":true,"requirement_refs":["R-002","R-003","R-005"],"task_refs":[]}
      - {"id":"AC-007","type":"acceptance-criterion","statement":"Yêu cầu lẫn nghiệp vụ và UI","behavior":"Yêu cầu lẫn nghiệp vụ và UI","expected_result":"Làm rõ blocker ảnh hưởng option set trước, offer đúng quyết định visual về sau; không offer chỉ từ UI keyword.","verification_kind":"automated","blocking":true,"requirement_refs":["R-001","R-005"],"task_refs":[]}
      - {"id":"AC-008","type":"acceptance-criterion","statement":"Decline rồi đổi skill/phase/wording hoặc decision trong cùng visual thread; decline toàn session","behavior":"Decline rồi đổi skill/phase/wording hoặc decision trong cùng visual thread; decline toàn session","expected_result":"Không lặp offer trong scope bị từ chối.","verification_kind":"automated","blocking":true,"requirement_refs":["R-003","R-005"],"task_refs":[]}
      - {"id":"AC-009","type":"acceptance-criterion","statement":"User chủ động bật visual lại","behavior":"User chủ động bật visual lại","expected_result":"Tiếp tục trong scope yêu cầu mới, bảo toàn decline rộng hơn còn hiệu lực và không tự cấp runtime/browser consent.","verification_kind":"automated","blocking":true,"requirement_refs":["R-003","R-004","R-005"],"task_refs":[]}
      - {"id":"AC-010","type":"acceptance-criterion","statement":"Native structured choice và visual cùng supported","behavior":"Native structured choice và visual cùng supported","expected_result":"Preview theo visual ladder; text/approval theo text ladder; consent thiếu không chọn live như đã được phép.","verification_kind":"automated","blocking":true,"requirement_refs":["R-004","R-005"],"task_refs":[]}
      - {"id":"AC-011","type":"acceptance-criterion","statement":"Live lỗi, thiếu capability, browser auto-open unknown, hoặc không có visual surface","behavior":"Live lỗi, thiếu capability, browser auto-open unknown, hoặc không có visual surface","expected_result":"Native visual → static → numbered Markdown theo khả năng; giữ decision/options; không offer chức năng bất khả dụng hoặc mất visual chỉ do auto-open unknown.","verification_kind":"automated","blocking":true,"requirement_refs":["R-004","R-005"],"task_refs":[]}
      - {"id":"AC-012","type":"acceptance-criterion","statement":"Click chọn visual","behavior":"Click chọn visual","expected_result":"Không approve spec/plan/implementation; written reply vẫn authoritative; runtime cleanup và local-only boundary được giữ.","verification_kind":"automated","blocking":true,"requirement_refs":["R-004","R-005"],"task_refs":[]}
      - {"id":"AC-013","type":"acceptance-criterion","statement":"Handoff và consent scope","behavior":"Handoff và consent scope","expected_result":"Phân biệt đủ not-evaluated/not-applicable + reason/pending/accepted/declined/surface/fallback; không checkpoint, token hoặc authenticated URL trong durable artifacts.","verification_kind":"automated","blocking":true,"requirement_refs":["R-003","R-004","R-005"],"task_refs":[]}
      - {"id":"AC-014","type":"acceptance-criterion","statement":"Behavioral evaluation từ prompt tự nhiên, nhiều lượt","behavior":"Behavioral evaluation từ prompt tự nhiên, nhiều lượt","expected_result":"Hoàn thiện ít nhất 12 scenario trên và negative/pressure controls; runner không nạp expected visual flags vào agent; giữ transcript/receipt thực và source/runtime/model metadata; báo tỷ lệ đúng, bỏ sót, offer sai, lặp với mẫu số. Nếu chưa chạy được, ghi NOT RUN và lý do, không tạo transcript giả.","verification_kind":"manual","blocking":true,"requirement_refs":["R-005"],"task_refs":[]}
      - {"id":"AC-015","type":"acceptance-criterion","statement":"Canonical/mirror/docs","behavior":"Canonical/mirror/docs","expected_result":"23 public skills không đổi; sources English-only trừ localization fixtures; runtime output bản địa hóa; docs có ví dụ và cách user chủ động yêu cầu; mirror/hygiene/executable-reference checks pass.","verification_kind":"automated","blocking":true,"requirement_refs":["R-006"],"task_refs":[]}
      - {"id":"AC-016","type":"acceptance-criterion","statement":"Review và validation cuối","behavior":"Review và validation cuối","expected_result":"Không còn chỉ dẫn mâu thuẫn giữa policy, choice, companion và helper; affected regressions và repository checks pass trên Node hỗ trợ hoặc giới hạn môi trường được báo rõ; live evidence tách khỏi deterministic.","verification_kind":"manual","blocking":true,"requirement_refs":["R-005","R-006"],"task_refs":[]}
      - {"id":"A-001","type":"assumption","statement":"Live A/B runtime availability remains unverified.","source":"inferred","confidence":"unknown","status":"deferred","blocking":false,"evidence_refs":["BASELINE-CLI-DISCOVERY"],"consequence_if_wrong":"Deliver the complete runner/scenarios with NOT RUN; do not claim live reliability.","validation_method":"Probe the available CLI and run actual baseline/candidate conversations under equivalent conditions during execution.","owner":"integration-owner","rationale":"The user explicitly allows truthful NOT RUN when live execution is unavailable.","revisit_condition":"Before live behavioral evaluation after implementation scope approval.","impacted_refs":["R-005","AC-014"]}
      - {"id":"D-001","type":"decision","statement":"Dùng một shared reference ngắn cho nhận diện/offer và executable policy hiện có cho trạng thái/routing. Đây là hướng user đã chỉ định; tránh nhân bản và không xây keyword classifier.","question":"Where should offer policy live?","selected_value":"Dùng một shared reference ngắn cho nhận diện/offer và executable policy hiện có cho trạng thái/routing. Đây là hướng user đã chỉ định; tránh nhân bản và không xây keyword classifier.","source":"explicit-user","status":"approved","blocking":true,"scope":"repository","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","rationale":"Explicitly specified in the current user attachment; this does not approve the draft spec.","supersedes":null,"revisit_condition":null,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-002"],"task_refs":[]}
      - {"id":"D-002","type":"decision","statement":"Giữ thứ tự visual: live đủ capability và consent → native visual → static HTML → numbered Markdown. Text/approval: native structured choice → numbered Markdown. User đã xác định hai thang này.","question":"How should interaction surfaces be selected?","selected_value":"Giữ thứ tự visual: live đủ capability và consent → native visual → static HTML → numbered Markdown. Text/approval: native structured choice → numbered Markdown. User đã xác định hai thang này.","source":"explicit-user","status":"approved","blocking":true,"scope":"repository","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","rationale":"Explicitly specified in the current user attachment; this does not approve the draft spec.","supersedes":null,"revisit_condition":null,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-004","AC-010","AC-011"],"task_refs":[]}
      - {"id":"D-003","type":"decision","statement":"Decline theo visual thread hoặc toàn session vẫn hiệu lực khi đổi skill/phase/wording; chỉ user chủ động bật lại được thay đổi. Accepted/pending không tạo lời mời nhu cầu lần hai. User đã xác định quy tắc này.","question":"How should prior user responses survive handoff?","selected_value":"Decline theo visual thread hoặc toàn session vẫn hiệu lực khi đổi skill/phase/wording; chỉ user chủ động bật lại được thay đổi. Accepted/pending không tạo lời mời nhu cầu lần hai. User đã xác định quy tắc này.","source":"explicit-user","status":"approved","blocking":true,"scope":"repository","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","rationale":"Explicitly specified in the current user attachment; this does not approve the draft spec.","supersedes":null,"revisit_condition":null,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-003","AC-004","AC-008","AC-009"],"task_refs":[]}
      - {"id":"D-004","type":"decision","statement":"Giữ runtime, event authority, lifecycle, artifact owner và approval gates hiện có. Live eval chỉ được báo theo dữ liệu thực; thiếu khả năng chạy thì hoàn thiện runner/scenarios và báo NOT RUN. User đã chỉ định phạm vi này.","question":"Which execution and evidence boundaries must remain?","selected_value":"Giữ runtime, event authority, lifecycle, artifact owner và approval gates hiện có. Live eval chỉ được báo theo dữ liệu thực; thiếu khả năng chạy thì hoàn thiện runner/scenarios và báo NOT RUN. User đã chỉ định phạm vi này.","source":"explicit-user","status":"approved","blocking":true,"scope":"repository","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","rationale":"Explicitly specified in the current user attachment; this does not approve the draft spec.","supersedes":null,"revisit_condition":null,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-004","R-005","AC-012","AC-014"],"task_refs":[]}
      - {"id":"INV-001","type":"invariant","statement":"Visual feedback never authorizes implementation or runtime/browser side effects; durable artifacts exclude runtime secrets.","protected_refs":["R-004","AC-012","AC-013"],"task_refs":[],"evidence_refs":[]}
      - {"id":"INV-002","type":"invariant","statement":"Keep 23 public skills and the existing runtime/ownership boundaries; load the full runtime only when needed.","protected_refs":["R-002","R-006","AC-005","AC-015"],"task_refs":[],"evidence_refs":[]}
    history:
      - {"revision":1,"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"AC-011","type":"acceptance-criterion"},{"id":"AC-012","type":"acceptance-criterion"},{"id":"AC-013","type":"acceptance-criterion"},{"id":"AC-014","type":"acceptance-criterion"},{"id":"AC-015","type":"acceptance-criterion"},{"id":"AC-016","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"tombstones":[]}
  goal_backward_review:
    schema_version: 1
    mode: "sdcorejs-plan:goal-backward"
    stage: spec
    future_gaps: [{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-001.task_refs","record_id":"AC-001","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-002.task_refs","record_id":"AC-002","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-003.task_refs","record_id":"AC-003","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-004.task_refs","record_id":"AC-004","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-005.task_refs","record_id":"AC-005","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-006.task_refs","record_id":"AC-006","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-007.task_refs","record_id":"AC-007","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-008.task_refs","record_id":"AC-008","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-009.task_refs","record_id":"AC-009","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-010.task_refs","record_id":"AC-010","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-011.task_refs","record_id":"AC-011","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-012.task_refs","record_id":"AC-012","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-013.task_refs","record_id":"AC-013","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-014.task_refs","record_id":"AC-014","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-015.task_refs","record_id":"AC-015","message":"an acceptance criterion must map to at least one planned task"},{"code":"AC_PLAN_COVERAGE_MISSING","path":"records.AC-016.task_refs","record_id":"AC-016","message":"an acceptance criterion must map to at least one planned task"},{"code":"INVARIANT_EVIDENCE_TRACE_MISSING","path":"records.INV-001.evidence_refs","record_id":"INV-001","message":"an invariant must trace to at least one evidence reference"},{"code":"INVARIANT_EVIDENCE_TRACE_MISSING","path":"records.INV-002.evidence_refs","record_id":"INV-002","message":"an invariant must trace to at least one evidence reference"},{"code":"INVARIANT_TASK_TRACE_MISSING","path":"records.INV-001.task_refs","record_id":"INV-001","message":"an invariant must trace to at least one enforcing task"},{"code":"INVARIANT_TASK_TRACE_MISSING","path":"records.INV-002.task_refs","record_id":"INV-002","message":"an invariant must trace to at least one enforcing task"},{"code":"REQUIREMENT_PLAN_COVERAGE_MISSING","path":"records.R-001.task_refs","record_id":"R-001","message":"a requirement must map to at least one planned task"},{"code":"REQUIREMENT_PLAN_COVERAGE_MISSING","path":"records.R-002.task_refs","record_id":"R-002","message":"a requirement must map to at least one planned task"},{"code":"REQUIREMENT_PLAN_COVERAGE_MISSING","path":"records.R-003.task_refs","record_id":"R-003","message":"a requirement must map to at least one planned task"},{"code":"REQUIREMENT_PLAN_COVERAGE_MISSING","path":"records.R-004.task_refs","record_id":"R-004","message":"a requirement must map to at least one planned task"},{"code":"REQUIREMENT_PLAN_COVERAGE_MISSING","path":"records.R-005.task_refs","record_id":"R-005","message":"a requirement must map to at least one planned task"},{"code":"REQUIREMENT_PLAN_COVERAGE_MISSING","path":"records.R-006.task_refs","record_id":"R-006","message":"a requirement must map to at least one planned task"}]
```

## Decisions captured during review

- User duyệt nguyên phạm vi bằng phản hồi “Duyệt”. Không thay yêu cầu hoặc tiêu chí nghiệm thu.

## Skill provenance

sdcorejs-spec, approved on attempt 1 / 3.
