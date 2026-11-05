---
artifact_id: review-behavior-consistency-spec-draft-r1
artifact_kind: execution-doc
document_type: spec-draft
change_ref: review-behavior-consistency-20261104
contract_id: review-behavior-consistency-20261104
requirement_id: R-001
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
stack_profile: markdown-skill-pack
source_revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
status: draft
approval: { approved: false, approved_at: null }
acceptance_criteria_count: 26
manual_criteria_count: 1
redaction_applied: true
change_control: { revision: 1, supersedes: null, change_reason: initial-user-requested-draft }
---

# Đặc tả cải thiện review, convention và kiểm tra thay đổi nhỏ

Ngày soạn: 04/11/2026, múi giờ Asia/Bangkok. Đây là bản nháp theo yêu cầu viết đặc tả và kế hoạch; chưa có phê duyệt triển khai hoặc snapshot được duyệt.

## 1. Vấn đề và kết quả mong muốn

Trong dự án thực tế, review còn bỏ sót naming/route không nhất quán, khác biệt về protection và màn hình cùng loại, cũng như giả định hardcode gây sai dữ liệu. Ví dụ một API phân trang được gọi với `pageSize: 1000`, nhưng consumer coi kết quả là toàn bộ dữ liệu. Khi có 1.001 bản ghi, luồng có thể báo thành công dù kết quả bị thiếu.

Mục tiêu là nâng chất lượng phát hiện, bằng chứng và khả năng áp dụng của các skill hiện hữu. Review phải giải thích được vị trí, điều kiện kích hoạt, đường truyền dữ liệu/quyền, tác động và khoảng trống test; đồng thời phải phân biệt một lỗi xác thực được với một đề xuất convention.

Người sử dụng: developer và reviewer dùng bộ skill cho dự án mới hoặc đang tồn tại. Angular, NestJS, Next.js, React và Node được áp dụng theo stack thực tế; các track phi code chỉ chịu kiểm tra có liên quan đến artifact của chúng.

## 2. Hiện trạng đã đối chiếu

| Bằng chứng | Điều đã có | Khoảng trống cần giải quyết |
|---|---|---|
| `_refs/shared/review-consistency.md` | Naming theo ngữ nghĩa, route, thời gian, permission, khác biệt giữa boundary | Chuyển checklist thành các bước thu thập bằng chứng, so sánh mẫu và báo coverage có thể kiểm tra |
| `_refs/shared/convention-context.md` | Accepted/observed/conflicted/stale, ownership và after-review sync | Nối quy tắc với bootstrap của dự án, đặc biệt khi sửa nhanh hoặc phiên mới |
| `_refs/shared/review-code.md` | Edge cases và pagination ở mức tổng quát | Chưa đủ hướng dẫn chuyên biệt cho giả định lấy toàn bộ, server cap và thành công một phần |
| `_refs/shared/review-contract.mjs` | Kiểm tra các finding được truyền vào | Kết quả hợp lệ về schema chưa chứng minh reviewer đã tìm được lỗi từ source |
| `test/e2e/convention-*.test.mjs` | 38/38 test pass trong lượt khảo sát trước tại revision nêu trên | Kết quả này chứng minh contract/lifecycle; không thay thế đánh giá reviewer đọc fixture code |
| `skills/orchestration/using-skills.md` | Fast-fix có targeted context, focused verification và concise review | Cần hợp đồng kiểm tra tối thiểu và bằng chứng trigger cho prompt không nhắc tên skill |

Ba reference `review-consistency.md`, `convention-context.md`, `review-code.md` trong bản cài local đã khớp hash với repo khi khảo sát. Chưa kết luận nguyên nhân của mọi lần bỏ sót ở các dự án khác là lỗi phân phối hoặc lỗi prompt.

## 3. Yêu cầu chức năng

| ID | Năng lực và hành vi bắt buộc |
|---|---|
| R-001 | Khôi phục convention phù hợp với repo/module/boundary; đọc nguồn chính thức, evidence hiện tại và ngoại lệ; phân biệt accepted, observed, conflicted, stale. Thiếu registry không làm review bỏ qua code và không cho phép tự tạo policy. |
| R-002 | Đánh giá tên variable/property/parameter/function và route theo kiểu, cardinality, vai trò, đơn vị và cách sử dụng; đối chiếu các lớp có liên hệ và giữ compatibility của hợp đồng công khai. |
| R-003 | Kiểm tra protection có hiệu lực, permission mapping, thứ tự auth/policy, ownership và tenant theo kiến trúc thực tế; bao phủ các action có trong phạm vi thay đổi. |
| R-004 | So sánh list/detail/form với mẫu tương đương và quy tắc được chấp nhận trong dự án; đánh giá loading, empty, error, paging/filter/sort, mutation refresh, validation và navigation. |
| R-005 | Phát hiện hardcode và giả định giới hạn dữ liệu theo hậu quả; truy vết luồng phân trang được sử dụng như toàn bộ; phân biệt giá trị hợp lệ, giả định chưa chứng minh và lỗi có bằng chứng. |
| R-006 | Đánh giá test theo rủi ro, hành vi và điều kiện biên; yêu cầu assertion quan sát được và mutation có ý nghĩa; phân biệt planned/authored/executed/passed/current. |
| R-007 | Áp dụng kiểm tra tối thiểu trước/sau mọi sửa code thuộc phạm vi skill, kể cả fast-fix; kích hoạt theo ý định và file/boundary bị chạm, không chỉ theo keyword tên skill. |
| R-008 | Bổ sung cho Explore cơ chế thiết lập/đồng bộ bootstrap AGENTS được quản lý theo policy; tái sử dụng convention registry làm nguồn chính; giữ nội dung người dùng và ownership. |
| R-009 | Báo cáo coverage, finding và khoảng trống bằng chứng nhất quán; không coi thiếu finding là đã kiểm tra đủ; giữ dimension, severity và read-only contract hiện có. |
| R-010 | Có regression, behavioral fixture và đánh giá reviewer từ source thực; giữ phân biệt deterministic và live/fresh-context evidence, đồng thời đồng bộ các adapter/mirror. |

Nguồn của R-001–R-010: yêu cầu của người dùng và danh sách năng lực được người dùng yêu cầu cụ thể hóa. Chủ sở hữu chung: `github.com/sdcorejs/sdcorejs-agent`, không có module con.

## 4. Quy tắc đánh giá chi tiết

### 4.1. Convention và naming

So sánh sau khi xác định concept, semantic role, layer, boundary, temporal meaning, ownership và compatibility. Ưu tiên nguồn theo contract convention hiện có; không lấy số đông làm quyền phê duyệt.

- Collection có thể dùng `customers` hoặc `customerList` theo quy tắc đã chọn. `customer` giữ nhiều phần tử phải được xem xét theo kiểu/cách dùng; Map/Set/tuple, tên bất quy tắc như `people`, biến vòng lặp và collection wrapper không bị đổi máy móc.
- Phân biệt ngày lịch (`birthDate`), thời điểm (`createdAt`), thời lượng (`timeoutMs`) và biểu diễn/timezone. Không yêu cầu tất cả giá trị `Date` đều kết thúc bằng `Date`.
- Một API public dùng `/customers` và frontend module dùng `/customer` có thể hợp lệ. Drift cần chứng cứ trong cùng role/boundary hoặc chứng cứ mapping thiếu/sai.
- Không đề xuất đổi trực tiếp public route, persisted field, permission code hoặc external payload nếu cần migration/alias/deprecation. Finding nêu điều kiện tương thích cần giữ.
- Khi thiếu quy tắc, báo candidate/ambiguity cùng ví dụ so sánh. Lỗi hành vi như sai quyền hoặc thiếu dữ liệu vẫn được báo dựa trên code, không phụ thuộc tồn tại naming policy.

### 4.2. Protection và màn hình

Tạo ma trận gọn theo operation trong phạm vi: route/endpoint, permission, vị trí enforcement, auth order, owner/tenant scope, UI gating và test denial tương ứng. Chỉ mở rộng sang semantic neighbors cần để chứng minh luồng.

Guard có thể đặt ở global/controller/parent route hoặc ở policy/service boundary hợp lệ. Thiếu decorator/canActivate cục bộ không tự chứng minh thiếu protection. Ngược lại, có decorator nhưng không có guard thực thi cũng không chứng minh đã được bảo vệ. UI ẩn nút không chứng minh backend từ chối truy cập.

So sánh list/detail/form theo cùng archetype, profile và business role. Chọn mẫu được chấp nhận hoặc nhiều bằng chứng độc lập; không chọn ngẫu nhiên một màn cũ làm chuẩn. Không kết luận hành vi render hoặc tương tác đã đúng chỉ từ source; các mục đó phải ghi evidence limitation nếu chưa chạy UI.

### 4.3. Hardcode và tính đầy đủ của paging

Mỗi candidate xác định: giá trị/nguồn cấu hình; giả định nghiệp vụ; operation sử dụng; hợp đồng server; điều kiện vượt giới hạn; tác động; cách chứng minh và phương án khắc phục phù hợp.

Phạm vi gồm literal và giá trị đi qua constant/config/wrapper: giới hạn số lượng, timeout/retry, domain ID/status/role, endpoint môi trường, ngày và đơn vị. Tên constant không tự làm giả định an toàn. Giới hạn server thực sự được enforce, giá trị giao thức bất biến và giới hạn UI có điều hướng là control hợp lệ.

Với luồng tuyên bố lấy toàn bộ, reviewer phải truy vết request → pagination metadata → vòng lặp/điều kiện dừng → consumer → tín hiệu hoàn tất. Đánh giá ít nhất:

- dữ liệu nhiều hơn cap, server clamp thấp hơn yêu cầu, tổng thay đổi hoặc không có `total`;
- `nextCursor`/`hasNext`, page index base, trang rỗng/trang cuối đúng bằng limit;
- lỗi trang sau, cancellation, duplicate/cursor không tiến, guard tránh lặp vô hạn;
- ordering/snapshot semantics khi dữ liệu đổi giữa các trang;
- export/tổng hợp/bulk/validation phải phân biệt hoàn tất và partial theo hợp đồng.

Không mặc định sửa bằng cách tăng pageSize hoặc tải toàn bộ vô hạn. Lựa chọn theo use case: UI paging/search, server aggregation/export hoặc traversal có giới hạn và báo partial rõ ràng. Không gọi API thật hoặc dùng production data chỉ để review.

### 4.4. Fast-fix và phạm vi review

Baseline trước sửa: xác định instruction áp dụng, convention liên quan, diff/owner và các risk surface bị chạm. Sau sửa: kiểm tra naming/contract liên quan, protection nếu bị tác động, hardcoded bound/paging nếu có, regression hiện có và các mục chưa kiểm tra được.

Fast-fix được bỏ quy trình spec/plan khi đủ điều kiện hiện tại; không được bỏ baseline. Một dòng thay đổi quyền, tenant filter, public route hoặc tính đầy đủ của dữ liệu không được coi low-risk chỉ vì diff nhỏ. Giữ routing riêng cho debug/root-cause và dedicated test.

Q&A, dịch văn bản và review read-only không được kích hoạt ghi source/AGENTS hoặc full workflow. Security-only review vẫn giữ dimension đó; chỉ đưa consistency vào khi ảnh hưởng kết luận security. Checklist xuất ra phải gọn, chỉ gồm findings, bằng chứng và skipped checks có ý nghĩa.

### 4.5. Bootstrap AGENTS và học convention

Explore sở hữu hành động `project-bootstrap-read` và `project-bootstrap-sync-write-approved` trong skill hiện hữu. Review chỉ trả candidate/context. Policy bootstrap là phần mở rộng tùy chọn của convention policy; policy cũ không có trường này mặc định không ghi AGENTS.

Managed block chứa phiên bản schema/template, chỉ dẫn nạp convention, baseline cho sửa code, thứ tự ownership và đường dẫn tham chiếu. Không chép toàn bộ rule body hoặc global state vào AGENTS. Dự án vẫn dùng `.sdcorejs/conventions/**` làm nguồn chi tiết.

Thiết lập yêu cầu authority từ yêu cầu hiện tại, setup được duyệt hoặc project policy đã được chấp nhận. Khi đã có standing policy, không hỏi lại từng lần sync. Không coi lần gọi skill đầu tiên, sự thiếu file hoặc source comment là quyền ghi. Discovery/candidate capture không tự nâng observed thành accepted.

Sync dùng marker duy nhất, re-read/check hash trước ghi, giữ byte ngoài vùng quản lý, bảo toàn encoding/BOM/newline, thực hiện write atomically ở cùng thư mục và kiểm tra hậu ghi. Không force sửa marker bị hỏng, version mới hơn không hiểu được, xung đột nội dung, concurrent edit, symlink/reparse point không xác minh được hoặc owner khác. Dừng riêng thao tác sync và báo lý do; tiếp tục phần read-only độc lập.

Atomic replace chỉ bảo vệ khỏi file ghi dở, không tự ngăn một editor khác ghi xen vào. Apply cần cơ chế cập nhật có kiểm tra phiên bản nguyên tử của host, hoặc quyền ghi độc quyền trong phạm vi các writer hợp tác đã xác nhận. Khi không chứng minh được điều kiện này, chỉ sinh đề xuất patch; không tuyên bố chống được mọi concurrent writer.

Root bootstrap áp dụng scope kế thừa; nested AGENTS được giữ và phải được đọc khi xác định scope. Chỉ cập nhật target được policy cho phép, không tự tạo lại block ở mọi thư mục hoặc repo lân cận. Disable policy chặn ghi tiếp theo; việc gỡ block là thao tác riêng được cho phép, chỉ gỡ vùng quản lý.

## 5. Reporting và hợp đồng bằng chứng

Giữ `review_context` và finding shape hiện có. Thêm assessment tùy chọn có schema version cho các nhóm `conventions`, `naming`, `routes`, `protection`, `screen-patterns`, `hardcoded-assumptions`, `pagination-completeness`, `test-adequacy`, `fast-fix-baseline`.

Mỗi mục có applicability, scope, evidence locators, rule/source authority, result `checked | finding | needs-verification | not-applicable`, lý do và test gap. `checked` cần evidence; `not-applicable` cần lý do; thiếu mục bắt buộc không được suy ra pass. Nội dung cũ vẫn đọc được nhưng coverage mới là `unknown`, không tự tạo finding giả hoặc phán quyết green.

Finding correctness/security có đường dẫn producer-consumer/enforcement, điều kiện gây lỗi, tác động và expected assertion. Tái sử dụng severity hiện hành theo tác động thực tế, không tạo enum cạnh tranh; một vấn đề có một finding chính, tham chiếu các dimension liên quan. Xác thực schema là kiểm tra cấu trúc, không phải chứng minh kết luận ngữ nghĩa đúng.

## 6. Tiêu chí nghiệm thu

Tất cả tiêu chí dưới đây phải có mapping task/case/evidence trong kế hoạch. `AC-025` dùng đánh giá thủ công trên transcript phiên mới; các tiêu chí còn lại có kiểm tra tự động hoặc fixture executable. Chưa tiêu chí triển khai nào được tuyên bố pass trong bản nháp này.

| ID | Hành vi và kết quả phải chứng minh |
|---|---|
| AC-001 | Nạp đúng convention theo owner/scope/precedence; observed, stale/conflicted và missing registry không bị nâng thành mandatory hoặc quyền ghi. |
| AC-002 | Phân biệt collection/single/map và calendar-date/instant/duration; bắt tên gây hiểu sai hoặc vi phạm accepted rule, giữ các paired control hợp lệ. |
| AC-003 | Bắt route/parameter/mapping drift qua lớp; public/legacy alias có compatibility được giữ; không áp cùng cardinality cho mọi boundary. |
| AC-004 | Ma trận protection xác định global/inherited enforcement; bắt missing/ineffective metadata và permission mismatch; không coi mọi route thiếu guard cục bộ là lỗi. |
| AC-005 | Fixture HTTP chứng minh protected action bị từ chối với thiếu quyền/sai owner/tenant; UI-only gating không được nhận là server denial. |
| AC-006 | List/detail/form được so sánh theo archetype; missing error/empty/refresh/permission behavior có bằng chứng; khác biệt hợp lệ không bị báo sai. |
| AC-007 | Hardcode literal, constant và config đều được đánh giá theo giả định; chuyển `1000` vào constant không xóa finding khi luồng vẫn thiếu dữ liệu. |
| AC-008 | Case export/all-data có 1.001 bản ghi phát hiện cap 1.000 và chứng minh record cuối bị bỏ; implementation đúng trả đủ dữ liệu hoặc báo partial theo hợp đồng. |
| AC-009 | Các case 0/1/999/1000/1001, server clamp, trang rỗng, total thiếu/sai, cursor và page-index được đối chiếu với termination contract. |
| AC-010 | Lỗi trang sau, cancellation, repeated cursor và unstable ordering không được báo như kết quả đầy đủ; vòng lặp có điều kiện dừng an toàn. |
| AC-011 | UI paging có nút tiếp, server-enforced domain cap và server aggregation hợp lệ không bị báo là truncation chỉ vì chứa limit. |
| AC-012 | Risk-to-test matrix chỉ ra assertion bắt lỗi, trạng thái chạy và freshness; test chỉ kiểm tra request pageSize không chứng minh completeness. |
| AC-013 | Mutation bỏ paging continuation hoặc guard làm test tương ứng fail vì sai hành vi; control không đổi hành vi vẫn pass; lỗi import/setup không được tính là RED hợp lệ. |
| AC-014 | Prompt sửa code nhỏ không nhắc skill vẫn có pre/post baseline phù hợp scope, convention đã nạp và ghi rõ checks chưa chạy. |
| AC-015 | Thay đổi một dòng chạm authorization/tenant/public contract/data completeness được nâng mức theo rủi ro; typo đơn giản không bị ép thành full workflow. |
| AC-016 | Prompt Việt/Anh, explicit skill và prompt áp lực được route đúng; Q&A/read-only không gây writes; không mở rộng review hẹp thành full audit. |
| AC-017 | Setup/sync có authority tạo/cập nhật đúng một managed block và policy; standing policy cho phép lần sau sync không hỏi lại từng rule. |
| AC-018 | Policy cũ/missing/disabled/manual hoặc review read-only không tự ghi AGENTS; candidate từ source/comment không tự cấp quyền hoặc thành accepted. |
| AC-019 | Sync lặp lại không tạo diff; giữ nguyên byte ngoài block, BOM/newline và nội dung người dùng; concurrent edit/marker hỏng làm thao tác fail closed. |
| AC-020 | Nested instruction, owner repo khác, path escape/reparse target và unsupported version được xử lý rõ; không ghi nhầm repo/parent. |
| AC-021 | Finding có evidence locator, semantic role, trigger/impact/fix và test gap cần thiết; các dimension cùng vấn đề không tạo bản sao finding. |
| AC-022 | Missing/stale evidence hoặc bỏ assessment bắt buộc ngăn kết luận đã review đủ; helper không biến object hợp lệ thành bằng chứng detection. |
| AC-023 | Context/policy cũ vẫn đọc được với giới hạn coverage rõ; scope/enum/ownership/read-only hiện hành không bị phá; ngoại lệ accepted được bảo toàn. |
| AC-024 | Offline fixture/helper result, executable HTTP/data behavior và fresh reviewer result được ghi riêng; injected finding hoặc fixture transcript không được tính live detection. |
| AC-025 | Phiên reviewer mới đọc source, không nhận expected findings, được đánh giá trên positives/controls/ambiguous/pressure prompts; báo expected/observed, missed/false findings và evidence locator theo từng case. Không có quyền/chạy thật thì trạng thái NOT RUN và năng lực này chưa nghiệm thu. |
| AC-026 | Public skill count giữ 24; source/reference/template tiếng Anh; response theo ngôn ngữ user; mirror/entrypoint đồng nhất và không phân phối internal authoring surface. |

## 7. Quyết định thiết kế đề xuất

| ID | Lựa chọn | Lý do và điều kiện xem lại |
|---|---|---|
| D-001 | Mở rộng skill/reference/helper hiện có; không tạo skill public mới | Trùng lifecycle/ownership hiện tại; chỉ xem lại khi có ý định độc lập ngoài scope này. |
| D-002 | Semantic review do agent thực hiện; helper xác thực coverage/provenance, fixture chạy hành vi thật | Tránh quảng bá validator schema thành bộ phát hiện mọi lỗi; không thêm universal AST engine trong scope đầu. |
| D-003 | Convention chi tiết ở registry; AGENTS là bootstrap/projection tối thiểu do Explore ghi | Tránh hai nguồn quy tắc và tự sửa policy để hợp thức hóa code. |
| D-004 | Fast-fix giữ luồng gọn nhưng không bỏ baseline theo rủi ro | Số dòng không đại diện cho mức độ tác động. |
| D-005 | TDD cho helper/writer và fixture; đánh giá source-to-finding ở lớp fresh-context riêng | Tách tính đúng của contract khỏi năng lực reviewer; live chưa chạy không được che bằng deterministic pass. |
| D-006 | Triển khai tuần tự, không thêm dependency/provider SDK, không sửa ứng dụng tiêu thụ | Nhiều file contract dùng chung; tập trung sửa pack và kiểm thử sandbox. |

Các quyết định kỹ thuật này ở trạng thái đề xuất để duyệt cùng bộ tài liệu, không phải approved snapshot.

## 8. Giả định và giới hạn

- A-001: Dự án tiêu thụ có thể thiếu convention hoặc thiếu toolchain. Source evidence và đọc thủ công vẫn phải hoạt động; helper không được ngầm cài dependencies. Kiểm chứng bằng fixture thiếu policy/tooling.
- A-002: Runtime có thể không nạp AGENTS hoặc không có session hook. Pack cung cấp bootstrap/adapter guidance và báo limitation; không cam kết chặn mọi thao tác ngoài môi trường hỗ trợ. Kiểm chứng adapter matrix.
- A-003: Live/fresh-context evaluation có thể chưa được phép hoặc chưa khả dụng. Không tự dùng credentials/provider; ghi NOT RUN và giữ AC-025 chưa hoàn tất cho đến khi có bằng chứng thật.

Giả định đều không chặn việc soạn draft; tác động triển khai và phương án xác minh được ghi trong coverage companion.

## 9. Architecture gate và cấu trúc dự kiến

Architecture **required** cho thay đổi dự kiến: `cross-module-boundary`, `persisted-data-model-contract`, `security-trust-boundary`, `state-data-ownership`. Evidence lần lượt là contract review/Explore/dispatch, policy bootstrap được lưu, quyền sửa instruction và owner của AGENTS/convention.

Xem [bản kiến trúc](../architecture/2026-11-04-13-56-review-behavior-consistency-architecture.md). Luồng dự kiến: đọc scope/context → baseline → review và risk assessment → repair khi có quyền → Explore sync khi có authority → affected verification → final read-only branch-ready.

Thay đổi nằm trong canonical `skills/**`, `_refs/**`, adapter entrypoints, tests và internal authoring evals của repo này. Các file và thứ tự cụ thể ở [kế hoạch](2026-11-04-13-56-review-behavior-consistency-plan.md); dữ liệu truy vết ở [coverage](2026-11-04-13-56-review-behavior-consistency-coverage.md).

## 10. Non-goals và phạm vi hoãn

- Không sửa/rename hàng loạt code của ứng dụng tiêu thụ, public API, database hoặc permission hiện có.
- Không tạo universal linter/static analyzer, không cài compiler ở dự án tiêu thụ, không thêm provider SDK.
- Không xây CI/CD, deployment, observability hoặc production governance mới.
- Không tự commit/push/release; không cài lại skill local hay sửa global AGENTS của máy.
- Không tự chạy credentialed live eval, không báo fresh-agent coverage từ session tác giả hoặc transcript fixture.
- Lint rules đặc thù cho từng framework có thể bổ sung sau khi có convention được chấp nhận và use case chứng minh; hiện tại ưu tiên reuse tooling đã có.

## 11. Rủi ro và giảm thiểu

| Rủi ro | Biện pháp |
|---|---|
| Naming tạo nhiều false positives | Semantic classification, authoritative rule, boundary/role và paired negative controls |
| Checklist dài làm review bỏ bước | Assessment theo applicability, diff và semantic neighbors; output chỉ nêu findings/gaps liên quan |
| AGENTS ghi đè hướng dẫn hoặc học nhầm quy tắc | Managed block, standing authority có scope, byte preservation, optimistic concurrency, observed không tự accepted |
| Bỏ sót lỗi paging/guard dù test schema pass | Executable fixture, mutation và fresh-context evaluation tách biệt |
| Contract mới phá context cũ | Optional/versioned extension, legacy coverage unknown, migration rõ và tests tương thích |
| Bản cài lệch canonical | Generator-only mirrors, manifest/version/hash evidence và adapter smoke checks |

## 12. Trạng thái kiểm chứng và phê duyệt

Lượt này chỉ soạn tài liệu và kiểm tra cấu trúc, mapping, đường dẫn. Kết quả 38 test là baseline khảo sát, không phải xác minh feature mới. Các approval hash/path đều chưa tồn tại.

Sau khi duyệt, tạo và kiểm chứng snapshot theo thứ tự spec → architecture → plan bằng helper chính thức, gắn đúng parent identity. Bản kế hoạch được soạn trước để người dùng xem đầy đủ theo yêu cầu; nó không phải handoff hợp lệ cho execute-plan khi thiếu chuỗi snapshot này.
