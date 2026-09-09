---
artifact_id: delivery-visual-companion-offer-r1
artifact_kind: execution-doc
change_ref: visual-companion-offer
source_spec: .sdcorejs/specs/workflow/2026-09-09-16-06-visual-companion-offer.md
source_plan: .sdcorejs/plans/workflow/2026-09-09-16-15-visual-companion-offer.md
commit_policy: with-change
owner: integration-owner
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
track: workflow
stack_profile: node-esm
---

# Visual Companion: lời mời đúng lúc và giữ lựa chọn giữa các skill

Đã triển khai policy chung tại `_refs/sdlc/visual-offer-policy.md` và tích hợp
vào Brainstorming, Design trực tiếp, Angular, Next.js, spec, plan, execute-plan
và bootstrap. Repo vẫn có 23 public skill, phiên bản 0.8.0.

## Nguyên nhân và thay đổi

Trước đây, hướng dẫn mời nằm chủ yếu trong Brainstorming, lựa chọn visual gắn
với picker văn bản và trạng thái offered/selected không đủ phân biệt phạm vi.
Policy mới yêu cầu xác định quyết định còn mở, ít nhất hai phương án khác nhau
có ý nghĩa và lợi ích của việc nhìn thấy chúng trước khi mời. Từ khóa UI/design
không tự kích hoạt. Đổi tên, typo, spacing đã chốt, layout đã duyệt hoặc lựa chọn
đã giao agent tự quyết không cần lời mời.

Pending, accepted và declined được giữ theo session/thread/decision qua
`context.pass`, kể cả portable `state_delta.visual_companion`. Đổi skill hoặc
phase không đặt lại lựa chọn. Bật lại một quyết định không xóa từ chối ở phạm vi
rộng hơn. Yêu cầu xem mockup trực tiếp đi đến preview; yêu cầu “so sánh phương
án” thông thường chưa phải đồng ý xem.

Visual dùng cùng thứ tự: live có consent runtime, native visual, static HTML,
Markdown. Text và approval dùng native picker rồi Markdown. Lỗi surface không
làm mất phương án hay sinh lời mời lại. Chỉ có live khả dụng và đã đồng ý xem
thì helper trả `request-consent` cho đúng quyền còn thiếu. Consent mở browser
tách riêng; browser selection vẫn chỉ là supporting feedback.

Ví dụ lời mời: “Hai cách đặt checkbox và nút mở chi tiết có khác biệt về vùng
chạm và diện tích nội dung. Bạn muốn xem chúng cạnh nhau trước khi chọn không?”
Nếu người dùng đã nói “Cho xem hai mockup”, agent chuẩn bị preview ngay trên
surface khả dụng và chỉ hỏi quyền runtime còn thiếu nếu thực sự cần.

## Bằng chứng

Nguồn có thể kiểm tra: `authoring/evals/visual-offer/records.json`, `baseline.json`
và `candidate.json`; chạy lại bằng các lệnh trong README cùng thư mục.

- Policy và runner: 24/24 ca đạt trên Node v22.22.3, gồm regression RED thực
  cho consent còn thiếu, GREEN và REFACTOR giữ cùng behavior contract.
- UI/UX liên quan: 25/25 ca đạt. Authoring: 6/6 ca đạt với điều chỉnh URL
  trong riêng tiến trình kiểm tra được ghi bên dưới.
- Harness đạt 107/107 ca. Mirrors của 23 skill đã đồng bộ. Receipt cho phase 1, text hygiene,
  executable references và các kiểm tra bổ sung nằm trong records.
- Phase 1 đạt 32/32; runtime/composer hiện có đạt 24/24. Sáu command trong
  validation map đều chạy đúng command đã duyệt và thành công. Hai dòng review
  có xác nhận của integration owner; validator trả `MANUAL`, không có blocker.
  Đây không phải kết quả tự động chứng minh toàn bộ hành vi ngôn ngữ tự nhiên.
- A/B chính: mỗi bên 16 tình huống, 21 lượt thực từ Codex CLI 0.153.4.
  Baseline mời đúng 6/6 cơ hội, mời sai 1/7; candidate đầu mời đúng 5/6,
  bỏ sót 1/6 và mời sai 1/7. Cả hai không mời lặp ở 3/3 lượt kiểm tra.
  Không dùng số liệu này để tuyên bố cải thiện tổng thể.
- Candidate đầu sửa được lời mời khi không có surface, nhưng có regression
  ở ca nghiệp vụ chưa rõ: mời quá sớm và coi so sánh là đồng ý xem. Policy đã
  sửa; CLI chạy lại hai lượt trên source cuối xác nhận hỏi nghiệp vụ trước,
  rồi mới mời xem layout. Kết quả này tách riêng, không thay số liệu A/B đầu.
- Hai lượt tiếp theo bị runner cũ bỏ qua do không nhận ra cách nói “bản phác”
  đã được chạy tiếp từ nguyên văn assistant response thực. Không lấy mẫu lại
  lượt đầu. Nhận diện từ khóa chỉ còn là gợi ý cho người chấm.

## Giới hạn và phạm vi kiểm tra

Capabilities trong CLI là giả lập có chủ đích. SVG/text wireframe chứng minh
nội dung hội thoại, chưa chứng minh renderer/browser/ứng dụng đích. Model và
effort dùng cấu hình CLI hiện có, không được runtime báo rõ. Đây là mẫu nhỏ,
không phải chứng nhận độ tin cậy thống kê.

Fixture fallback chính thiếu mô tả hai phương án cũ nên cơ hội đó không được
chấm pass. Phép thử bổ sung cung cấp đầy đủ phương án được ghi riêng trong
records: baseline và candidate đều tạo SVG giữ nguyên A/B sau lỗi live, không
mời lại. Không sửa lịch sử fixture hoặc transcript A/B.

Sau capture CLI, bốn skill được rút gọn câu và dẫn về policy chung để đáp ứng
giới hạn 500 dòng. Policy, helper và fixture không đổi; source hash trước/sau
được giữ riêng. Kết quả CLI không được gắn lại sang một source hash khác.
Wall time của harness có gián đoạn dài ở môi trường chạy, không dùng làm số đo
hiệu năng.

Lần chạy toàn repo trước sửa đạt 609/621 ca. Các lỗi do thay đổi này được
kiểm tra lại theo nhóm; không đổi nhãn lần chạy cũ thành PASS. Hai giới hạn nền:

1. Validator authoring xử lý URL HTTPS có hậu tố `.git` khác định danh trong
   fixture. Kiểm tra lại dùng `GIT_CONFIG_COUNT` để chuẩn hóa cùng URL trong
   riêng tiến trình, đạt 6/6; không đổi Git config hoặc sửa validator ngoài scope.
2. `.sdcorejs/summary.md` trở thành `partially-stale` sau thay đổi canonical.
   Kế hoạch đã duyệt liệt kê file này trong `prohibited_paths`, nên không ghi
   đè. Không tuyên bố toàn repo xanh hoặc branch-ready.

Node v22.22.3 portable được xác minh checksum từ nguồn chính thức và chỉ thêm
vào PATH của tiến trình. Executable-reference check dùng Git Bash đã cài qua
`SDCOREJS_BASH`. Không đổi dependency, lockfile, version hay cấu hình máy.
Không chạy golden/container/site suites vì các generator tương ứng và site
không thay đổi. Không có script lint/typecheck riêng ở root.

Các cập nhật phụ thuộc để giữ validation đúng với nguồn hiện tại gồm
`VALIDATION.md`, ba file evidence/README/records của UI/UX và các assertion
trong `test/e2e/skill-pack-runner.test.mjs`. Chúng chỉ cập nhật số đo, binding
nguồn và nơi sở hữu policy; giữ bằng chứng lịch sử và các gate consent/approval.
Đây là điều chỉnh inventory xác minh so với danh sách file trong plan, không
phải thêm behavior hoặc mở rộng SDLC. Snapshot approval có sửa cơ học lỗi mã
hóa tiêu đề/ghi nhận “Duyệt”/mũi tên; graph đã xác minh lại, quyết định và phạm
vi được duyệt giữ nguyên.

Không tạo commit, push hoặc PR. Trạng thái validation/convergence cuối và
những điều kiện chưa đủ cho Git handoff được ghi trong records và báo trong
thread sau lần kiểm tra read-only cuối.

Convergence vẫn `BLOCKED`: summary chưa fresh, hai dòng review là manual,
inventory kiểm tra phụ thuộc có điều chỉnh và phép chiếu trace/evidence chưa
đủ để tạo receipt Git handoff. Không chuyển các giới hạn này thành PASS.
