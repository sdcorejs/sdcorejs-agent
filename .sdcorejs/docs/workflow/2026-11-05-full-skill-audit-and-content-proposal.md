---
artifact_id: full-skill-audit-content-proposal-20261105
artifact_kind: execution-doc
change_ref: skill-audit-content-handoff-20261105
source_spec: none
source_plan: none
source_revision: 83837d8181f1b587327d8680736a4789626b9255
commit_policy: with-change
owner: sdcorejs-documentation
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
status: audit-complete-proposals-not-implemented
redaction_applied: true
---

# Review toàn bộ skill và đề xuất Content - 2026-11-05

Báo cáo lưu đầy đủ kết luận review đã trao đổi với người dùng, để triển khai tiếp trên Codex Cloud. Đây là kết quả audit và đề xuất cải thiện, không phải approved spec/plan, không phải bằng chứng các finding đã được sửa.

Tài liệu tiếp tục công việc: [Codex Cloud handoff](../../handoffs/workflow/2026-11-05-skill-audit-content-handoff.md).

## Mục lục

- [Yêu cầu và lựa chọn của người dùng](#yêu-cầu-và-lựa-chọn-của-người-dùng)
- [Phạm vi, phương pháp và giới hạn](#phạm-vi-phương-pháp-và-giới-hạn)
- [Finding cần xử lý trước](#finding-cần-xử-lý-trước)
- [Đối chiếu upstream](#đối-chiếu-upstream)
- [Đánh giá từng skill](#đánh-giá-từng-skill)
- [Thiết kế đề xuất cho sdcorejs-content](#thiết-kế-đề-xuất-cho-sdcorejs-content)
- [Lộ trình triển khai đề xuất](#lộ-trình-triển-khai-đề-xuất)
- [Bằng chứng kiểm chứng](#bằng-chứng-kiểm-chứng)

## Yêu cầu và lựa chọn của người dùng

Người dùng yêu cầu dùng `skill-creator` để review thật chi tiết từng skill của `sdcorejs-agent`, tham khảo các repo lớn như Superpowers và UI UX Pro Max, rồi xem xét các cải thiện. Người dùng đồng thời muốn nghiên cứu một skill xây dựng content cho social.

Hai lựa chọn đã được xác nhận trong hội thoại:

1. Content phục vụ **cả thương hiệu cá nhân và marketing sản phẩm**.
2. Phạm vi nên rộng cho **Facebook, TikTok và các mạng xã hội**, với nhiều reference phù hợp từng lĩnh vực, ví dụ **tech, marketing và du lịch**. Không giới hạn skill vào developer/tech lead hoặc một kênh duy nhất.

Yêu cầu tiếp theo là lưu, commit và push toàn bộ thông tin lên một branch để người dùng giao triển khai ở Codex Cloud. Yêu cầu này cho phép lưu tài liệu và bàn giao; chưa đồng nghĩa mọi đề xuất trong báo cáo đã trở thành approved implementation scope.

Các mong muốn review từ công việc trước vẫn là bối cảnh quan trọng: phát hiện route/variable naming không nhất quán, guard protection và list/detail khác nhau không có lý do, hardcode làm mất tính đầy đủ dữ liệu như `pageSize: 1000`, assertion không chứng minh được rủi ro, và sửa nhỏ bỏ sót review. Baseline hiện tại đã có nhiều năng lực tương ứng; không đề xuất thêm lại dưới tên mới.

## Phạm vi, phương pháp và giới hạn

- Repository: `github.com/sdcorejs/sdcorejs-agent`.
- Baseline được review: `83837d8181f1b587327d8680736a4789626b9255`.
- Ngày review: 2026-11-05, múi giờ Asia/Bangkok.
- Đã đọc 24 canonical public skill và skill nội bộ `sdcorejs-skill-authoring`, cùng các reference/helper/test liên quan.
- Ba reviewer độc lập, context mới, mỗi reviewer đọc tám public skill. Parent đối chiếu lại các finding quan trọng với source và chạy probe helper trong bộ nhớ.
- Các reviewer chỉ đọc source; mười tình huống họ phân tích là source-only decision traces. Đây không phải mười lần thực thi tác vụ hoàn chỉnh, không phải benchmark mù có điểm accuracy.
- Đã chạy 14 test hiện có liên quan debug/parallel: đều pass. Probe bổ sung vẫn tái hiện được các mâu thuẫn contract bên dưới.
- Không chạy toàn bộ CI, không thực thi cả 24 skill trên dự án người dùng, không kiểm chứng live provider hoặc mọi nền tảng hệ điều hành.
- Không sửa source skill/helper/test trong đợt audit. Việc lưu báo cáo sau đó là thay đổi docs-only riêng.
- Không lưu raw agent transcript, thông tin máy cá nhân, credential, temp clone hoặc runtime dispatch manifest vào repo. Các kết quả được giữ dưới dạng tổng hợp có nguồn và giới hạn.

Phân biệt các loại bằng chứng:

| Loại | Ý nghĩa |
|---|---|
| `helper-reproduced` | Parent đã gọi helper với input có kiểm soát và quan sát kết quả; không tự suy ra đã chạy toàn workflow |
| `source-contract-mismatch` | Hướng dẫn, template hoặc schema hiện tại mâu thuẫn trực tiếp; chưa khẳng định mọi agent sẽ đi vào nhánh sai |
| `source-risk` | Có đường suy luận rủi ro từ source, cần scenario thực tế để kết luận mức ảnh hưởng |
| `improvement-opportunity` | Cải thiện chất lượng, chi phí hoặc tính rõ ràng; không phải lỗi runtime đã chứng minh |

### Nhận định chung

Ưu tiên lớn nhất là làm các skill vận hành nhất quán với nhau: quyền đã được duyệt, đường đi cho sửa nhỏ, template, validator và bằng chứng kiểm thử. Một số mâu thuẫn hiện có có thể khiến agent dừng không cần thiết hoặc không thực hiện đúng hướng dẫn.

24 entrypoint có tổng 436,321 byte UTF-8. Các entrypoint lớn nhất: Angular 47,926 byte; Review 28,244; Execute-plan 25,822; Plan 24,375; Explore 24,338. Đây là kích thước source, **không phải lượng context luôn được nạp cùng lúc**, không phải số token đo từ provider. Mục tiêu tối ưu phải là lượng context thực sự nạp cho tác vụ và chất lượng quyết định, không chỉ ép số dòng xuống một ngưỡng.

## Finding cần xử lý trước

Các mã F-* là danh tính finding của báo cáo này, không phải acceptance criterion đã được duyệt. Dòng nguồn bên dưới gắn với baseline; khi source đổi cần tìm lại symbol và điều kiện tương ứng.

| ID | Loại | Vấn đề, nguồn và ảnh hưởng | Hướng sửa đề xuất |
|---|---|---|---|
| F-001 | helper-reproduced | Template spec yêu cầu `approved_spec_hash` bằng `approval_hash` tại `skills/shared/sdlc/02-spec.md:345-346`; template plan có cùng yêu cầu tại `_refs/sdlc/plan-approval-artifact.md:119-120`. `_refs/shared/approved-artifact.mjs:218` chỉ loại `approval_hash`, nên alias bị đưa vào protected payload. Artifact hợp lệ sau khi thêm alias theo mẫu bị verify từ chối. | Để self-hash alias ở handoff, hoặc định nghĩa canonicalization có version cho alias hợp lệ. Không loại nhầm hash của parent khỏi bảo vệ. |
| F-002 | helper-reproduced | `skills/orchestration/parallel-dispatch.md:60-63` cho read-only request, nhưng dòng 89 bắt gọi `compileParallelContext`. `_refs/orchestration/parallel-protocol.mjs:533-599` chỉ nhận plan, hardcode approved-plan và coi allowlist rỗng là ownerless. Read-only contract/context hợp lệ không đi qua được bước bắt buộc. | Branch compiler theo discriminated contract; read-only không được giả approved plan hoặc thêm quyền ghi. |
| F-003 | helper-reproduced | `skills/shared/workflow/debug.md:41-45` đòi validate trước write handoff. `_refs/shared/debug-contract.mjs:132-157` bắt mọi fix có plan, và flaky fix phải có ba post-fix passes trước khi `write_authorized` thành true. | Tách quyền thử sửa và bằng chứng xác nhận đã sửa. Thêm variant cho bounded direct-user fix với owner/path/freshness rõ ràng. |
| F-004 | helper-reproduced | `_refs/shared/explore-contract.mjs:96-120` dùng chung `explicit_authority OR approved_initialization OR integration_owner_assigned` cho mọi write action. Integration owner có thể được helper cho phép ghi env/persona/memory dù mode yêu cầu quyền riêng. Không có ghi thật trong probe. | Ma trận quyền theo action; vai trò owner không tự cấp mọi quyền. Giữ convention capture policy đúng phạm vi. |
| F-005 | source-contract-mismatch | Root và using-skills cho bounded fast-fix, nhưng `skills/tracks/angular/sdcorejs-angular.md:11-14` bắt spec/plan/frontend architecture trước cả classification. `_refs/shared/finish-gate.md:23-35,213-215` vẫn yêu cầu lựa chọn/quick confirm, trong khi ngoại lệ cuối file chủ yếu nói về current plan. | Một policy chung kế thừa quyền trong session, nhánh bounded fix rõ ràng, chỉ hỏi quyết định thực sự chưa có. |
| F-006 | source-contract-mismatch | `_refs/nextjs/build-website/write-code/init-site.md:66-74` chỉ cài next-intl khi chọn i18n, nhưng config mẫu dòng 184-202 luôn import/wrap plugin. Golden test dùng generator riêng, có basic config đúng, nên không chứng minh recipe đúng. | Config theo approved feature, dùng chung template hoặc test trực tiếp đường prose. |
| F-007 | source-contract-mismatch | `skills/shared/sdlc/04-execute-plan.md:351` đọc `plan_context.commands_planned`; schema `03-plan.md:290-295` đặt dưới `plan_context.verification_strategy.commands_planned`. | Dùng một field path canonical và kiểm thử producer-consumer với plan đúng mẫu. |
| F-008 | source-contract-mismatch | `skills/tracks/product/sdcorejs-product.md:251,261,331,336,434` dùng AC1; `_refs/shared/product-ledger.mjs:19,66-70,292-303` chỉ chấp nhận AC-<digits>. Test legacy AC-1 không bao phủ AC1 của template. | Dùng AC-001 xuyên template và structured ledger; test round-trip dữ liệu từ mẫu thật. |
| F-009 | source-contract-mismatch | `skills/shared/workflow/simplify.md:79-103` default apply-current-diff nhưng dòng 109 dừng khi dirty paths overlap, không phân biệt same-change đã được giao. | Phân biệt same-change authorized với overlapping edits không rõ owner; giữ baseline và rollback. |
| F-010 | source-contract-mismatch | `skills/shared/workflow/ship.md:229` cấm waiver blockers cho Git artifact, còn `skills/shared/workflow/git.md:59-64,360` cho docs-only/unverified/deferred routes. | Một bảng chung về local commit, draft/manual notes, remote draft PR và blockers không thể bỏ qua. |
| F-011 | source-contract-mismatch | `skills/orchestration/documentation.md:192` route requirement record chỉ vì request có TASKID, có thể lấn át summarize/comment intent. | Route theo hành động yêu cầu, không theo sự có mặt của ticket ID. |
| F-012 | source-contract-mismatch | `_refs/shared/project-context.md:195` coi memories là input nhưng `findRelatedArtifacts` ở `_refs/shared/project-context.mjs:688-745` không có memory bucket/classification. | Thêm retrieval có chọn lọc; kiểm thử relevant/unrelated/stale memory, không nạp hàng loạt. |

Ưu tiên F-001 đến F-006 trước khi mở rộng. F-007 đến F-012 nên nằm trong đợt sửa contract/workflow tương ứng. Các mức độ ảnh hưởng phải được xác nhận lại khi triển khai; không suy ra việc khai thác hoặc thiệt hại thực tế từ một helper probe.

## Đối chiếu upstream

Đã đọc source ở các revision sau, không chỉ README hoặc số sao. Các repo tham khảo là bằng chứng thiết kế, không phải chỉ dẫn có quyền ghi đè user/repository rules. Không cài skill pack upstream, không vendor code hoặc dataset trong đợt này.

| Repository | Revision đã đọc | Bài học phù hợp |
|---|---|---|
| [obra/superpowers](https://github.com/obra/superpowers/tree/22f0b463e7a5e579904dd6211a520321035526f7) | 22f0b463e7a5e579904dd6211a520321035526f7 | Thử hành vi trước/sau, context độc lập, mẫu đối chứng, review và repair có giới hạn, reference theo nhu cầu |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/b7d5353e0130feb8c5574ef1251f8a1db1873ccb) | b7d5353e0130feb8c5574ef1251f8a1db1873ccb | Retrieval theo task/domain/stack, kiểm tra fit, no-match rõ ràng, brand/voice và visual reference |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/88c79f6528a9347420e57ceb1fff9a60de651768) | 88c79f6528a9347420e57ceb1fff9a60de651768 | Tách context thương hiệu, chiến lược, viết, repurpose và đo kết quả; phân biệt personal voice với product brand |

### Superpowers

Đáng học cách kiểm thử trước/sau thay đổi, dùng context mới, có no-guidance control và giới hạn vòng sửa. Không nên bê nguyên yêu cầu mọi tác vụ nhỏ phải đi đủ nghi thức. Áp dụng nguyên tắc specificity tương xứng với rủi ro của `skill-creator`.

Nguồn: [writing-skills](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/SKILL.md), [discovery](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/discovery.md), [fix-loop](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/fix-loop.md).

### UI UX Pro Max

Đáng học cách chọn kiến thức theo vấn đề cụ thể, kiểm tra fit và báo rõ khi không có verified match. SDCoreJS đã có selector, applicability, rule IDs, no-match và chính sách tiếp thu chọn lọc; không cần dựng thêm một engine trùng lặp. Các pattern brand/voice/visual cho social có thể tham khảo, nhưng các con số về nền tảng và heuristic thiết kế phải được xác minh theo ngữ cảnh.

Nguồn: [UI/UX skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/b7d5353e0130feb8c5574ef1251f8a1db1873ccb/.claude/skills/ui-ux-pro-max/SKILL.md), [brand](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/b7d5353e0130feb8c5574ef1251f8a1db1873ccb/.claude/skills/brand/SKILL.md), [phần đã có trong SDCoreJS](../../../_refs/design/uiux/sources.md).

### Marketing Skills

Phù hợp cho content: context thương hiệu được dùng lại, chiến lược khác viết từng bài, repurpose khác copy/cắt ngắn, và phản hồi bằng dữ liệu thật. Voice nên rút từ bài và chỉnh sửa thật của tác giả. Không tiếp thu nguyên trạng tần suất đăng, độ dài tối ưu hoặc claim về thuật toán như chân lý cố định.

Nguồn: [social](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/social/SKILL.md), [content-strategy](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/content-strategy/SKILL.md), [brand-voice](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/product-marketing/references/brand-voice.md).

## Đánh giá từng skill

### 1. sdcorejs-using-skills

Nguồn: [using-skills.md](../../../skills/orchestration/using-skills.md), đặc biệt dòng 35-56, 98-109, 149.

- **Giữ:** routing ưu tiên, Q&A trực tiếp, fast-fix có giới hạn, ownership không suy ra từ cwd.
- **Vấn đề:** chọn đúng ở bootstrap chưa bảo đảm các executor và finish gate giữ nguyên đường đó; F-005.
- **Cải thiện:** thống nhất kế thừa quyền trong session và bounded-fix policy ở một nguồn canonical. Không hỏi lại chỉ vì đổi skill.
- **Kiểm chứng:** yêu cầu sửa null guard một dòng đã đủ behavior/scope, có test hiện hữu và quyền verification; kiểm tra hoàn tất mà không sinh spec/plan hoặc câu hỏi thừa.

### 2. sdcorejs-brainstorming

Nguồn: [01-brainstorming.md](../../../skills/shared/sdlc/01-brainstorming.md), dòng 3, 50, 77-168, 249-267, 288-361.

- **Giữ:** dùng lại câu trả lời, targeted context, dialogue-only boundary, không áp Core UI/TypeORM/public-site assumption vào project thường.
- **Cải thiện:** description nên tập trung vào thiếu quyết định quan trọng, thay vì liệt kê gần mọi loại task. Chuyển framework evidence và handoff schema lớn sang reference có điều kiện.
- **Tính tương xứng:** tách quyết định sản phẩm cần user với lựa chọn kỹ thuật thông thường có thể tự giải quyết. Không bắt xác nhận từng default vô hại.
- **Kiểm chứng:** cặp yêu cầu đủ/thiếu thông tin ở plain Angular, generic Node và product; đo câu hỏi thừa và reference không liên quan, không chấm theo wording.

### 3. sdcorejs-spec

Nguồn: [02-spec.md](../../../skills/shared/sdlc/02-spec.md), dòng 37, 79-92, 234-250, 345-346.

- **Giữ:** equivalent complete input, snapshot bất biến, owner semantic, stable AC và conditional architecture.
- **Sửa:** F-001 self-hash alias. Chỉ đổi cách biểu diễn alias; không làm yếu bảo vệ metadata/body/parent reference.
- **Cải thiện:** required substantive fields thay cho điền boilerplate mọi section; heuristic số trang không nên ép tách spec giả tạo.
- **Kiểm chứng:** exact-template create/serialize/parse/verify, line endings và tampering; fixture metadata tối giản không chứng minh template công bố đúng.

### 4. sdcorejs-architecture

Nguồn: [architecture.md](../../../skills/shared/sdlc/architecture.md), dòng 26, 71-73, 168-176.

- **Giữ:** boundary khá rõ giữa mapping, audit, design discovery và plan; chỉ yêu cầu quyết định mà nhiều unit cần chia sẻ; không portal fallback.
- **Kết quả:** chưa xác nhận lỗi chức năng cụ thể trong phần đã kiểm tra.
- **Cải thiện:** gom schema/lifecycle về một nguồn. Thay ví dụ literal four-field drawer bằng điều kiện giữ nguyên boundary/invariant, để ví dụ làm fixture.
- **Kiểm chứng:** diff UI nhỏ nhưng đổi trust/public-data contract vẫn cần gate; UI lớn giữ nguyên architecture có thể không cần. Không quyết định bằng số field hoặc số file.

### 5. sdcorejs-plan

Nguồn: [03-plan.md](../../../skills/shared/sdlc/03-plan.md), dòng 89, 143-185, 290-320, 352-354; [approval template](../../../_refs/sdlc/plan-approval-artifact.md), dòng 119-120.

- **Giữ:** requirement-task-evidence mapping, command/path có nguồn, exact owner, DAG và kiểm tra coverage hữu ích.
- **Sửa:** F-001 cho plan; làm thứ tự test task phù hợp lựa chọn TDD/post-hoc, không luôn RED-first khi đã chọn post-hoc.
- **Cải thiện:** dirty-disjoint không mặc định hỏi lại; cap critique nên chặn lặp vô ích, không cấm một lượt kiểm tra hợp lệ sau input thực sự được sửa.
- **Kiểm chứng:** exact-template round-trip, cả TDD/post-hoc, dirty nhưng không overlap và critique có input mới.

### 6. sdcorejs-execute-plan

Nguồn: [04-execute-plan.md](../../../skills/shared/sdlc/04-execute-plan.md), dòng 54, 291-292, 337-360.

- **Giữ:** verify artifact graph, không downgrade schema lỗi, write scope theo path, profile isolation, skipped-check trung thực.
- **Sửa:** F-007 đường dẫn `commands_planned` sai.
- **Cải thiện:** khi check thất bại ngoài file list, tiếp tục điều tra read-only và chuẩn bị revision nhỏ nhất; chỉ phần ghi ngoài quyền mới cần mở rộng scope. Không dừng mọi việc chỉ để hỏi một quyết định chưa được làm cụ thể.
- **Kiểm chứng:** tiêu thụ plan đúng mẫu; chạy đúng nested commands; phân biệt path đã nằm trong allowlist/discovery rule với path thực sự ngoài phạm vi.

### 7. sdcorejs-subagent-driven-development

Nguồn: [subagent-driven-development.md](../../../skills/orchestration/subagent-driven-development.md), dòng 30-37, 65, 97-108.

- **Giữ:** context worker độc lập, separate reviewer identity, owner-scoped repair, delegation khác concurrency, sequential fresh-worker fallback.
- **Cải thiện:** hai reviewer riêng cho mọi unit nhỏ có thể quá tốn; phân biệt user yêu cầu delegation với tự chọn delegation vì có lợi. Chỉ nạp concurrency/fan-in detail khi cần.
- **Kiểm chứng:** unit nhỏ, hai unit độc lập lớn, task theo dependency; quan sát boundary thật, reviewer independence, kết quả và overhead. Không coi việc tạo child agent là bằng chứng chất lượng.

### 8. sdcorejs-parallel-dispatch

Nguồn: [parallel-dispatch.md](../../../skills/orchestration/parallel-dispatch.md), dòng 55-89; [parallel-protocol.mjs](../../../_refs/orchestration/parallel-protocol.mjs), dòng 533-599.

- **Giữ:** discriminated read/write contract, overlap theo repo, immutable result identity, deterministic integration và constrained repair owner.
- **Sửa:** F-002. Qualify approved artifact, plan derivation và write-tail theo nhánh phù hợp.
- **Kiểm chứng:** public read-only precheck tới fan-in với request/scope hash, zero writable paths, shared-readonly và report output. Test envelope và compiler riêng lẻ hiện bỏ sót sự không tương thích khi ghép.

### 9. sdcorejs-angular

Nguồn: [sdcorejs-angular.md](../../../skills/tracks/angular/sdcorejs-angular.md), dòng 11-14, 324-336 và các checklist phía cuối.

- **Giữ:** Core UI/legacy/plain distinction, đúng package alias/version, reuse, explicit prototype scope và state/service boundary.
- **Sửa:** F-005. Gate đầu vào phải cho phép xác định bounded change trước khi đòi toàn bộ approved artifact.
- **Cải thiện:** tránh mục tiêu spec cạnh mọi production file testable, kể cả type contract, khi chỉ tạo test hình thức. Dùng assertion chứng minh rủi ro. Rút gọn entrypoint 47,926 byte, gom quy tắc lặp giữa workflow/MUST/checklist.
- **Kiểm chứng:** thêm field theo neighbor và field thay đổi permission phải đi hai đường phù hợp; kiểm tra actual changed paths, behavior, assertions và exact-version docs.

### 10. sdcorejs-nestjs

Nguồn: [sdcorejs-nestjs.md](../../../skills/tracks/nestjs/sdcorejs-nestjs.md), dòng 21-34; [profile contract](../../../_refs/nestjs/profile-contract.json), dòng 18-30; [core catalog](../../../_refs/nestjs/core-catalog.md), dòng 69-73.

- **Giữ:** entrypoint ngắn, manifest pack, profile resolve một lần, explicit routes, auth/permission/tenant/validation boundaries và golden runtime checks.
- **Rủi ro cần thử:** khi không có plan/summary profile, default simple có thể không phù hợp backend đang có tenant scope. Chưa chứng minh code mất bảo vệ đã được sinh ra.
- **Cải thiện:** lấy profile từ current source có căn cứ hoặc báo thiếu bằng chứng; không downgrade âm thầm. Version mismatch nên có đường bounded adaptation từ installed declarations, không mặc định buộc sửa skill pack của repo khác.
- **Kiểm chứng:** tenant-aware fixture không summary, thêm một endpoint; giữ enterprise contract hoặc blocker chính xác. Kiểm tra package declaration khác nhưng tương thích.

### 11. sdcorejs-nextjs

Nguồn: [sdcorejs-nextjs.md](../../../skills/tracks/nextjs/sdcorejs-nextjs.md), dòng 65-70, 111-115; [init-site](../../../_refs/nextjs/build-website/write-code/init-site.md), dòng 18, 42, 66-74, 184-202, 335.

- **Giữ:** basic không tự có contact/i18n/analytics/CMS, server/client boundary, owner và approved feature scope.
- **Sửa:** F-006. Golden project hiện dùng generator khác với prose path; pass của generator không chứng nhận mẫu config.
- **Cải thiện:** bootstrap phải nhất quán giữa knowledge phiên bản cố định và lệnh @latest. Đây là rủi ro reproducibility; audit không kết luận một API framework cụ thể đang không tương thích nếu chưa có docs/runtime proof.
- **Kiểm chứng:** basic từ template thật không có i18n import/file/dependency và build được; i18n profile kiểm tra riêng. Giảm hai implementation template độc lập.

### 12. sdcorejs-ai-agent

Nguồn: [sdcorejs-ai-agent.md](../../../skills/tracks/ai-agent/sdcorejs-ai-agent.md), dòng 22-88, 115-187; [testing](../../../_refs/ai-agent/testing.md); [evals](../../../_refs/ai-agent/evals.md).

- **Giữ:** engine/capability tách biệt, trusted identity, approval theo exact input, idempotency, session isolation và offline/live evidence độc lập.
- **Kết quả:** chưa thấy defect tương tự các contract ở trên trong body đã kiểm tra.
- **Cải thiện:** kiểm thử enforcement ở adapter fixture thật; test xóa từ khóa/schema không chứng minh runtime từ chối hành vi sai. Chuyển context schema lớn sang JIT reference.
- **Kiểm chứng:** changed approval input, stale resource version, cross-tenant resume, repeated idempotency key, malformed output; mutation bỏ enforcement phải làm behavioral assertion fail. Offline không được đổi thành live compatibility claim.

### 13. sdcorejs-product

Nguồn: [sdcorejs-product.md](../../../skills/tracks/product/sdcorejs-product.md), dòng 43, 105-119, 193, 251, 261, 331, 336, 399-434.

- **Giữ:** ownership riêng, traceability, gap rõ khi thiếu source/test, immutable cross-repo reference và stale evidence handling.
- **Sửa:** F-008 AC1/AC-001.
- **Cải thiện:** chuyển năm template tài liệu và ledger template sang mode refs; yêu cầu một document không mặc định sinh cả bundle. Hoàn tất phần có bằng chứng, giữ claim thiếu evidence ở trạng thái chưa kiểm chứng.
- **Kiểm chứng:** dữ liệu thực từ template đi qua ledger validator và cross-repo aggregation; partial-evidence request không tạo bằng chứng hoặc trạng thái verified giả.

### 14. sdcorejs-design

Nguồn: [sdcorejs-design.md](../../../skills/tracks/design/sdcorejs-design.md), dòng 72-79, 170-201, 445-449; [mobile-design](../../../_refs/design/mobile-design.md), dòng 33-37.

- **Giữ:** reuse token/component hiện có, editable HTML/SVG, candidate khác confirmed boundary, mockup khác real screenshot và tôn trọng preview consent.
- **Cải thiện:** nhánh bounded polish đã có nhưng MUST durable plan phía sau quá rộng. Tách critique/polish ngắn khỏi durable handoff. Đây là ambiguity, không phải bằng chứng skill đã tự chạy server trái phép.
- **Kiểm chứng:** small mobile polish với no local preview server không mở server/hỏi lại/sinh cả design system. Request durable handoff riêng cần source chỉnh sửa được, states, provenance và closure.

### 15. sdcorejs-test

Nguồn: [sdcorejs-test.md](../../../skills/tracks/test/sdcorejs-test.md), dòng 84-96; [test-track forward harness](../../../test/e2e/support/test-track-forward-harness.mjs), dòng 66-79.

- **Giữ:** author/run/result tách biệt, runner/workspace hiện có, requirement-driven assertion và auth tại server boundary thật.
- **Cải thiện:** chín unconditional refs gồm auth/data/convergence cho cả unit test nhỏ. Tại audit chúng có tổng 2,724 dòng, gồm convergence implementation 1,862 dòng; không cần đọc full implementation chỉ để dùng API. Tách minimal contract và conditional refs.
- **Giới hạn test:** forward fixture hiện có deterministic stack projection không chứng minh agent hiểu natural-language ambiguity.
- **Kiểm chứng:** single unit run, authenticated E2E và read-only coverage audit; quan sát command, side effect, owner và honest result. Giữ helper tests nhưng gọi đúng lớp bằng chứng.

### 16. sdcorejs-documentation

Nguồn: [documentation.md](../../../skills/orchestration/documentation.md), dòng 106, 186-196.

- **Giữ:** source evidence, exact identifiers, executable behavior, phân biệt guide/technical/comment, real UI capture không thay bằng mockup.
- **Sửa:** F-011 TASKID routing.
- **Cải thiện:** reference code-documentation dài bao phủ nhiều ngôn ngữ nên đọc common rules và section đúng ngôn ngữ, không luôn cả file.
- **Kiểm chứng:** cùng ticket ID trong summarize/comment-only/requirement/multi-output request phải tạo đúng output và destination. Comment-only dùng AST hoặc meaningful behavior check khi phù hợp, không chỉ wording snapshot.

### 17. sdcorejs-explore

Nguồn: [explore.md](../../../skills/shared/workflow/explore.md), dòng 65-74, 345-381, 412-419; [explore-contract](../../../_refs/shared/explore-contract.mjs), dòng 96-120.

- **Giữ:** default read-only, missing summary không cấp quyền ghi, profile evidence, semantic owner, redaction và accepted/observed convention distinction.
- **Sửa:** F-004 và F-012.
- **Cải thiện:** recovery giữ yêu cầu continue task X đã rõ thay vì luôn hỏi menu; thêm stale/conflicting/superseded memory protocol. Chuyển persona/env/recovery template sang mode refs.
- **Kiểm chứng:** ma trận authority theo action và role, relevant/unrelated/stale memory, explicit resume không hỏi lại quyết định đã có.

### 18. sdcorejs-review

Nguồn: [review.md](../../../skills/shared/workflow/review.md), dòng 28, 51-72; [review consistency](../../../_refs/shared/review-consistency.md); [behavior eval protocol](../../../authoring/evals/review-behavior/README.md).

- **Giữ:** read-only, semantic naming, effective protection, data completeness, N+1, risk-to-assertion, accepted rule khác observed pattern và compatibility alias.
- **Kết quả:** không xác nhận false-positive defect trong các scenario đã phân tích. pageSize 1000/load-all phải trace caller/server/consumer và N+1; convention hỗn hợp không tự thành blocker. Date/instant/duration và list/map/entity phải phân loại trước khi so tên.
- **Cải thiện:** hiệu chỉnh trên repo thực tế, đo miss/false positive với denominator và evidence rõ. Đừng thêm lại capability đã có. Gate plan/coverage/convergence refs theo applicability; chỉ nạp taxonomy liên quan.
- **Kiểm chứng:** mixed conventions, thiếu server contract, inherited/global guard, public exemption, plain non-SDCoreJS project, small diff và multi-turn authorization. Giữ 18 historical source-only review cases đúng giới hạn; chúng không chứng minh production/model-wide accuracy.

### 19. sdcorejs-debug

Nguồn: [debug.md](../../../skills/shared/workflow/debug.md), dòng 41-45, 101; [debug-contract](../../../_refs/shared/debug-contract.mjs), dòng 132-157.

- **Giữ:** reproduction, falsifiable hypothesis, minimal fix, instrumentation cleanup, environment classification và honest evidence-confirmed limitation.
- **Sửa:** F-003. Có thể dùng hai trạng thái `can_attempt_fix` và `fix_verified`, tên cuối cùng cần phù hợp schema được duyệt.
- **Cải thiện:** unrelated dirty files không overlap nên được giữ nguyên và ghi nhận, thay vì luôn hỏi lại. Gom quy tắc redaction/command/hypothesis bị lặp.
- **Kiểm chứng:** lifecycle từ failing reproduction tới authorized edit rồi post-fix verification; first flaky attempt được phép, một retry pass không đủ claim fixed. Không đưa sẵn kết quả tương lai vào prewrite fixture.

### 20. sdcorejs-simplify

Nguồn: [simplify.md](../../../skills/shared/workflow/simplify.md), dòng 79-109; [scope and invariants](../../../_refs/simplify/scope-and-invariants.md), dòng 67.

- **Giữ:** behavior-preserving, narrow hunks, protected boundaries, green baseline, exact rollback và bounded passes.
- **Sửa:** F-009 dirty same-change conflict.
- **Cải thiện:** số file/hunk là conservative default, không thay cho risk assessment; approved exact scope có thể cần budget riêng. Giữ exclusion security/evidence rõ ràng, không lén mở rộng thành bug fix hoặc public-contract change.
- **Kiểm chứng:** actual transformation/rollback, same-change proceed và unknown overlap stop. Phrase-mutation test không chứng minh behavior preservation.

### 21. sdcorejs-repair-loop

Nguồn: [repair-loop.md](../../../skills/orchestration/repair-loop.md), dòng 43; [tail repair-loop](../../../_refs/orchestration/tail/repair-loop.md), dòng 50, 217, 504-515.

- **Giữ:** đánh giá feedback trước khi ghi, stale/incorrect/conflicting findings riêng, owner scope, attempts cap, không làm yếu test và không tự promote convention/public rename.
- **Khoảng trống cần kiểm chứng:** trong source đã tìm thấy validator/requirements nhưng chưa tìm thấy producer/host-adapter rõ cho mọi trusted assessment/approval/receipt. Không kết luận mọi consuming host đều thiếu adapter.
- **Cải thiện:** document producer/trust boundary và conversation-to-approval conversion. Thiếu suggested fix không mặc định là product decision. Không hỏi menu tiếp tục nếu commit/PR continuation đã được giao.
- **Kiểm chứng:** một repair thông thường end-to-end từ external finding tới evidence và re-review, kể cả feedback sai và thiếu host capability.

### 22. sdcorejs-ship

Nguồn: [ship.md](../../../skills/shared/workflow/ship.md), dòng 215-231; [branch-ready](../../../_refs/orchestration/tail/branch-ready.md), dòng 42.

- **Giữ:** evidence theo HEAD/diff, docs/cleanup write làm stale readiness, phân biệt local ready/commit/push/PR/tag/publication.
- **Sửa:** F-010 cùng Git, phân biệt acceptance deferral với hygiene blockers không thể bỏ qua.
- **Cải thiện:** chuyển dependency/release detail sang mode refs; tái dùng verification còn đúng identity thay vì chạy lại cùng command khi không có thay đổi liên quan.
- **Kiểm chứng:** docs-only local commit, remote draft PR, blocked secret/conflict, current/stale evidence và write-after-ready đều theo cùng decision table.

### 23. sdcorejs-git

Nguồn: [git.md](../../../skills/shared/workflow/git.md), dòng 50-80, 204, 272, 360, 380, 445.

- **Giữ:** explicit staging, artifact closure, secret handling, body file, explicit PR base và không force push.
- **Sửa:** F-010.
- **Cải thiện:** explicit update existing PR/create changelog đã là quyền tương ứng; không luôn hỏi update/create/stop. Tách common closure khỏi commit/PR/changelog procedures lớn.
- **Kiểm chứng:** một yêu cầu fix, commit, update PR liên tục, giữ unrelated files và quyền xuyên skill; không tạo Git artifact thay cho verification cần thiết.

### 24. sdcorejs-cleanup

Nguồn: [cleanup.md](../../../skills/shared/workflow/cleanup.md), dòng 4, 175; [cleanup portability record](../../../authoring/evals/records/cleanup-portability.json).

- **Giữ:** analysis khác mutation, exact duplicate không tự cấp disposal authority, quarantine khác reclaimed bytes, revalidation, recovery receipts và dirty/unique-content protection.
- **Kết quả:** chưa xác nhận mutation defect trong audit này.
- **Cải thiện:** trigger rộng cache/node_modules/Docker/WSL nhưng một số thao tác, gồm worktree deletion, nằm ngoài executor; nói sớm capability/handoff boundary. Không suy ra native portability từ shared tests.
- **Kiểm chứng:** native Linux ext4/macOS APFS và interrupted recovery vẫn cần bằng chứng thật; historical NOT RUN phải được giữ. Dirty worktree có unique changes phải được giữ, không tự stash/restore/delete.

### Skill nội bộ: sdcorejs-skill-authoring

Nguồn: [internal SKILL.md](../../../authoring/skills/sdcorejs-skill-authoring/SKILL.md).

- **Giữ:** chỉ dùng trong authoring repo, không phân phối ra target, canonical-first, behavioral evidence, negative routing và phân biệt deterministic/full-E2E/live.
- **Cải thiện:** ceiling 24 và exact ten-scenario set nên là baseline có version cùng quy trình thay đổi rõ ràng. Không biến inventory hiện tại thành giới hạn kiến trúc bất biến.
- **Với Content:** cần quyết định scope, inventory, trigger, lifecycle và eval có chủ đích trước khi thêm public surface; không né ceiling bằng cách chép nội dung vào nơi khác hoặc nới validator âm thầm.
- **Kiểm chứng:** thay đổi inventory đúng quyền/scope; internal skill vẫn không lọt vào mirror/site/install; historical records không bị sửa để giả fresh evidence.

## Thiết kế đề xuất cho sdcorejs-content

Đề xuất một public entrypoint `sdcorejs-content`, dùng chung nhưng nạp reference theo nhu cầu. Đây là lựa chọn thiết kế được khuyến nghị; chưa tạo skill và chưa chốt cách đóng gói tích hợp hay pack tùy chọn. Khi triển khai phải xử lý rõ scope/inventory của bộ hiện đang thiên về engineering.

### Các chiều lựa chọn độc lập

| Chiều | Vai trò | Ví dụ |
|---|---|---|
| Danh tính tác giả/thương hiệu | Giọng viết, quan điểm, thông tin được phép dùng | Cá nhân, SDCoreJS, một sản phẩm |
| Mục tiêu | Bài cần đạt điều gì | Chia sẻ kiến thức, uy tín, cộng đồng, giới thiệu sản phẩm, chuyển đổi |
| Kênh | Trình bày và giới hạn nền tảng đã kiểm chứng | Facebook, TikTok, Instagram, LinkedIn, YouTube và kênh khác |
| Định dạng | Cấu trúc deliverable | Text post, carousel, video ngắn, bài dài, series |
| Lĩnh vực | Tiêu chí chính xác và ví dụ chuyên ngành | Tech, marketing/business, travel/lifestyle |

Ví dụ TikTok du lịch cho thương hiệu cá nhân chỉ cần profile cá nhân, TikTok, short-video và travel refs. Không nạp cả kho marketing sản phẩm hoặc tech. Không tạo một file cho mọi tổ hợp kênh x format x lĩnh vực.

### Năng lực

| Năng lực | Output cần có |
|---|---|
| Brief | Audience, mục tiêu, thông điệp, nguồn và điều còn thiếu; chỉ hỏi thứ ảnh hưởng đáng kể |
| Strategy/series | Chủ đề, góc tiếp cận, lịch nội dung phù hợp nguồn lực và mục tiêu |
| Research/claim checking | Phân biệt fact, ý kiến, trải nghiệm, giả thuyết; nguồn và ngày kiểm chứng khi cần |
| Draft/edit | Bản dùng được theo voice/format; không mặc định sinh nhiều biến thể không được yêu cầu |
| Repurpose | Chuyển nội dung theo cách kể và tiêu thụ của từng kênh, không chỉ cắt ngắn |
| Editorial review | Độ rõ, hữu ích, logic, accuracy, voice, CTA, phần thiếu bằng chứng |
| Learn from feedback | Dùng chỉnh sửa thật và metrics thật; phân biệt quan sát với quy tắc được chấp nhận |

Caption đơn lẻ đi từ brief đủ thông tin tới draft. Campaign lớn mới cần chiến lược/lịch chi tiết. Không áp cả engineering spec/architecture/plan workflow lên một bài ngắn. User yêu cầu review-only thì giữ read-only; yêu cầu edit cho phép sửa draft đúng phạm vi.

### Reference theo lĩnh vực

- **Tech:** phiên bản, code/example kiểm chứng được, nguồn benchmark, điều kiện so sánh, giới hạn áp dụng. Không biến một trải nghiệm project thành kết luận phổ quát.
- **Marketing/business:** audience, positioning, benefit, proof point, offer và CTA. Organic khác paid ad; không bịa testimonial, customer logo hoặc kết quả kinh doanh.
- **Travel/lifestyle:** địa điểm, thời điểm, kiểu chuyến đi, chi phí có ngày tham chiếu, trải nghiệm thực tế khác research. Không viết đã đến/đã thử bằng ngôi thứ nhất nếu tác giả chưa cung cấp trải nghiệm.

### Cấu trúc reference đề xuất

Cây này là thiết kế dự kiến, không phải đường dẫn đã tồn tại hoặc danh sách file đã được duyệt:

```text
sdcorejs-content/
  SKILL.md
  references/
    core/
      brief.md
      voice.md
      research-and-claims.md
      editorial-review.md
      learning-from-results.md
    channels/
      facebook.md
      tiktok.md
      ...
    formats/
      text-post.md
      carousel.md
      short-video.md
      long-form.md
    domains/
      tech.md
      marketing-business.md
      travel-lifestyle.md
    workflows/
      strategy-and-calendar.md
      repurpose.md
```

Không tạo reference rỗng chỉ để đủ catalog. Mỗi ref cần nêu applicability, exclusions, nguồn, ngày kiểm chứng và điều kiện cập nhật. Với repo hiện tại, authoring phải dùng canonical `skills/**` và `_refs/**`, rồi generate mirrors; không chép nguyên cây minh họa này vào distribution.

Tách bốn loại tri thức: quy tắc chất lượng ổn định; hard limits của nền tảng; heuristic mang tính gợi ý; quan sát từ tài khoản cụ thể. Không đưa tần suất đăng/giờ đăng/hashtag/algorithm claim thành universal constant. Khi không có verified match, nói rõ giới hạn và dùng hướng dẫn chung phù hợp, không bịa nguồn.

### Voice, brand context và học từ dữ liệu

Personal voice và product brand profile phải riêng. Dựa trên bài tác giả đã viết và chỉnh sửa draft: cách mở/kết bài, mức kỹ thuật, storytelling, từ thường dùng, điều không muốn nói và ví dụ. Một danh sách tính từ thân thiện/chuyên nghiệp/sáng tạo không đủ.

Profile content khác persona giao tiếp tech/non-tech của agent hiện tại. Giữ facts của sản phẩm nhất quán nhưng cho phép giọng cá nhân và thương hiệu khác nhau. Campaign facts, accepted voice và observed performance không được trộn thành một loại authority. Không tự cập nhật AGENTS hoặc brand profile từ một post viral hay một lần review; dùng owner/persistence policy rõ ràng và quyền đã có khi phù hợp.

Analytics phải ghi kỳ đo, mẫu, denominator và bối cảnh organic/paid khi có. Một post nhiều view không chứng minh nguyên nhân; không tạo performance guarantee hoặc suy ra causality từ quan sát đơn lẻ. Claim ledger/source notes có thể là phần giao biên tập riêng để không làm rối bản copy công khai.

### Tool và action boundary

Viết draft, tạo media, lên lịch và đăng bài là hành động riêng. Quyền viết không tự cấp quyền publish, schedule, gửi DM hoặc tương tác với người khác. Tích hợp image/video/design theo capability thực tế và yêu cầu user; không claim đã render media khi chỉ có script/storyboard. Không cài service/runtime hoặc thay công cụ của user chỉ vì upstream sử dụng nó.

### Behavioral eval đề xuất

| Tình huống | Điều cần kiểm chứng |
|---|---|
| Tech claim nhanh hơn 10 lần, không có dữ liệu | Không tự hợp thức hóa số; sửa claim hoặc chỉ ra bằng chứng cần có |
| Travel chưa có trải nghiệm của tác giả | Không bịa ngôi thứ nhất; vẫn tạo bản hữu ích từ nguồn được cung cấp |
| Một sản phẩm, hai danh tính đăng | Facts nhất quán, personal voice và brand voice phân biệt |
| Blog sang Facebook và TikTok | Thay góc kể, lời thoại, hình ảnh và nhịp; không chỉ cắt ngắn |
| Caption ngắn | Không kéo vào full SDLC hoặc campaign bundle |
| Reference nền tảng cũ/no-match | Không bịa thuật toán; kiểm chứng khi thông tin ảnh hưởng quyết định |
| Một post có view cao | Không biến correlation thành cause/quy tắc chung |
| Chỉ yêu cầu draft | Không publish/schedule/DM/tự sửa brand profile |
| Marketing claim có/không có proof point | Giữ claim có bằng chứng và xử lý claim thiếu bằng chứng khác nhau |
| Nhiều domain/kênh trong request | Chọn đúng ref và ghi rõ giả định còn thiếu, không nạp cả catalog |

Đánh giá usefulness, factual support, fidelity to voice và platform adaptation bằng outcome/editorial review. Script có thể kiểm tra giới hạn cơ học đã được xác minh; không dùng một điểm AI tổng hợp thay phán đoán biên tập hoặc sự chấp nhận của tác giả.

## Lộ trình triển khai đề xuất

Đây là roadmap để author spec/plan tiếp theo, chưa phải approved plan. Không gọi mọi đề xuất là blocker của release hiện tại, và không sửa toàn bộ một lần thiếu regression isolation.

| Đợt | Phạm vi | Điều kiện hoàn tất đề xuất |
|---|---|---|
| 1. Contract correctness | F-001/002/003/004/006/007/008, routing/memory mismatch liên quan | Published templates và producer-consumer path hoạt động; negative/tamper/owner controls vẫn chặn đúng |
| 2. Proportional workflow | F-005/009/010/011, authorization xuyên session, same-change dirty, recovery/repair continuation | Task nhỏ đã rõ chạy liên tục; scope/risk tăng được nhận diện; không cấp quyền ngoài yêu cầu |
| 3. Progressive disclosure | Angular, Review, Plan, Explore, Test trước; schema/mode template vào JIT refs | Đo context thực nạp, câu hỏi thừa và outcome trước/sau; giữ đủ invariants |
| 4. Behavioral evaluation | Cross-skill transitions, template thật, independent probes, representative repos | Báo riêng schema/helper/runtime/agent evidence; denominator, false positive, missed defect và NOT RUN rõ |
| 5. Content | Một entrypoint, Facebook/TikTok trước, ba domain trên, format refs và đường mở rộng kênh | Routing đúng, output dùng được, voice phân biệt, claim có căn cứ, không side effect ngoài phạm vi |

Đợt 4 hỗ trợ liên tục các đợt trước; không trì hoãn regression đến cuối. Phân kỳ có thể điều chỉnh sau khi xác nhận dependency và scope thực tế. Chỉ cập nhật inventory ceiling sau quyết định mở rộng được duyệt; không thêm production-SDLC/CI/CD/SRE surface ngoài phạm vi đã chọn.

## Bằng chứng kiểm chứng

### Các test đã chạy trong audit

Runtime dùng để chạy: Node 24.19.0. Dưới đây là command portable; không phụ thuộc đường dẫn Windows của máy thực hiện audit.

```sh
node --test test/e2e/debug-contract.test.mjs
node --test --test-name-pattern='compile|read-only|protocol v2' test/e2e/parallel-dispatch-protocol.test.mjs
node --test --test-name-pattern='compact plan compilation' test/e2e/parallel-dispatch-protocol.test.mjs
```

| Selection | Quan sát |
|---|---|
| Debug contract | PASS 8/8 |
| Read-only/protocol selection | PASS 5/5 |
| Compact plan compilation | PASS 1/1 |

Tổng 14 test hiện có pass không có nghĩa các finding mới đã được sửa. Chúng bao phủ từng helper/path hiện có; lỗi ghép hướng dẫn/template/helper là phần cần thêm regression.

### Probe helper của parent

| Probe | Quan sát thực tế |
|---|---|
| Hash alias | Spec/plan tạo bằng helper verify true; thêm approved_<kind>_hash bằng approval_hash làm verify báo approval hash mismatch |
| Read-only compiler | validateContract và validateDispatchContext trả không lỗi; classifyTopology cho READ_ONLY_FANOUT/PARALLEL-CANDIDATE; compile từ read-only context báo thiếu plan_context.parallel_candidates.units |
| Compiler adaptation | Bọc cùng read-only units vào compact plan khiến source thành approved-plan, empty allowlist bị coi ownerless; đây không phải workaround hợp lệ |
| Explore authority | env-setup-write-approved, persona-write-approved, memories-write-approved đều trả write_allowed true với explicit_authority false và integration_owner_assigned true |
| Debug lifecycle | Valid baseline ready; bỏ plan step bị blocked; flaky trước sửa với zero post-fix passes bị blocked |

Probe dùng synthetic input trong bộ nhớ, không thay đổi artifact/source thật, không ghi env/persona/memory, không tạo approved snapshot giả. Có thể chạy lại các helper trên current source để biến finding thành regression thích hợp khi được giao triển khai.

### Source-only scenario decisions

- One-line authorized fix: fast-fix theo root policy; targeted reads, minimal edit, focused verification, concise review. Các gate mâu thuẫn hiện tại cần giải quyết; không claim scenario đã sửa code thành công.
- Read-only split review: dùng request/scope identity, report-only output và zero writable paths; không tạo fake plan để lách compiler.
- Related failing check ngoài file list: tiếp tục diagnosis; chỉ mở rộng quyền ghi khi path thực sự ngoài allowed scope; finding không tự cấp quyền.
- Angular field giống neighbor: root bounded route và literal executor gate đang mâu thuẫn; permission-changing field phải được phân loại theo risk.
- Product claim thiếu evidence: hoàn tất phần có căn cứ, giữ claim unverified; mức blocking phụ thuộc acceptance criterion liên quan.
- Mobile polish/no local server: giữ lựa chọn user, dùng bounded design và công cụ hiện có phù hợp; không ép durable bundle hoặc tự chạy server.
- pageSize 1000/load all: trace server clamp/continuation/consumer; assert N+1 IDs/outcome, không chỉ tăng cap. Thiếu server evidence phải nêu uncertainty.
- Mixed date/plural naming: phân loại date/instant/duration và collection roles; mixed neighbors không tự thành defect; giữ compatibility alias.
- Commit/PR đã được giao sau fixes: giữ quyền sửa/delivery, hoàn tất checks/closure và tạo Git artifact đúng target, không hỏi tiếp tục chỉ vì đổi skill.
- Dirty worktree có unique changes: chỉ phân tích, giữ nguyên dữ liệu; không tự stash/restore/delete/quarantine.

### Giới hạn evidence và bảo toàn lịch sử

`authoring/evals/live-agent-matrix.json` vẫn có các mục NOT RUN; deterministic behavioral sentinel gọi policy functions, không quan sát model làm theo Markdown. Bộ 18 review-behavior captures trước đó có giá trị source-only tại input/revision của nó, không phải baseline A/B mới của audit này. Không sửa transcript, hash hoặc historical result để làm chúng trông như đã chạy lại.

Full CI, full target-project execution, native OS acceptance và live provider compatibility cần được chạy ở giai đoạn triển khai nếu scope yêu cầu, hoặc ghi rõ NOT RUN. Không gom các lớp bằng chứng khác nhau thành một claim toàn bộ skills đã pass.
