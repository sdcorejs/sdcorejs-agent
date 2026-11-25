---
schema_version: 1
artifact_id: simplify-before-code-final-review-20261124
artifact_kind: handoff
change_ref: simplify-before-code-followup
source_spec: none
source_plan: none
source_revision: 79d962acab035cd90879748e4685d1d5a4cc7550
commit_policy: with-change
owner: sdcorejs-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
status: proposed
---

# Simplify trước khi viết code — review, kế hoạch triển khai và nghiệm thu

Mục tiêu là để một agent đang làm việc trên dự án đọc đúng code trước lần sửa đầu tiên, dùng lại hành vi phù hợp và đặt logic mới đúng chỗ. Consumer chỉ cần giao việc viết code. Quyền sửa vẫn thuộc tác vụ đang làm. Refactor sau khi có baseline xanh là một thao tác riêng.

**Điểm xuất phát** là commit `79d962a` trên nhánh `feat/simplify-before-code`, cha là `9dda8fa`. Bootstrap, quy tắc trước khi viết, tham chiếu từ các executor, bản phân phối và phần kiểm tra bằng chứng đã có. Bản kế hoạch này dùng để chốt phần tiếp theo. Spec và plan tháng 7 mô tả chế độ refactor ban đầu. [Skill hiện tại](../../../skills/shared/workflow/simplify.md) · [Quy tắc trước khi viết](../../../_refs/simplify/before-writing-code.md) · [Spec ban đầu](../../specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md)

## 1. Kết quả review để quyết định ưu tiên

| Ưu tiên | Quan sát trên commit đang review | Hệ quả và tiêu chí đóng |
|---|---|---|
| Cao | Evaluator đối chiếu revision của lần chạy sau. Khi receipt trước khai báo revision B nhưng `baseline.HEAD` là A, nó vẫn trả `verified`. | Có thể dùng kết quả cũ làm baseline. Receipt trước phải khớp ảnh chụp trước, receipt sau phải khớp ảnh chụp sau. Hai lần có thể thuộc hai revision khác nhau. |
| Cao | Mặc dù có trần hai pass, một pass khai báo 6 file riêng, hoặc hai pass khai báo 5 + 4 file riêng mà chưa có quyết định phạm vi mới, đều trả `verified`. Tài liệu quy định 5 file/pass và 8 file tổng khi chưa xác nhận lại. | Tách pass quá lớn, tính hợp các đường dẫn chuẩn hóa, trả `blocked` khi phạm vi đã chứng minh vượt giới hạn. Khi không sửa gì, vẫn cho kết quả `unchanged` và không cấp quyền sửa. |
| Bằng chứng còn thiếu | Test bootstrap hiện tại tìm tham chiếu trong các bản mirror và kiểm tra dispatch một approved plan. Trial CSV trước đã thành công với project được hướng tới bootstrap Codex qua AGENTS.md. | Cài được gói và tìm được link chỉ chứng minh phần phân phối. Cần thử riêng cách host thực sự khởi tạo phiên, ghi nhận rule trước lần sửa đầu tiên và so với phiên chỉ hỏi đáp. |

Hai nhóm finding đầu đã có test đỏ chạy độc lập. Suite có thêm hai ca test-first cho dữ liệu cũ và thay đổi cùng HEAD. Giới hạn 20 hunk hiện cần executor kiểm diff. Nếu muốn evaluator xác minh giới hạn này, phải đưa số hunk của **diff thực tế** vào hợp đồng. Danh sách file đơn thuần không đủ dữ liệu. [Evaluator](../../../_refs/simplify/simplify-contract.mjs) · [Giới hạn hiện hành](../../../_refs/simplify/scope-and-invariants.md#execution-limits) · [Test bootstrap](../../../test/e2e/simplify-skill-contract.test.mjs)

## 2. Thứ tự thực hiện

| Bước | Người thực hiện và phạm vi | Công việc | Điều kiện hoàn tất |
|---|---|---|---|
| 1. Chốt baseline | Test, dùng hai suite Simplify và `authoring/evals/simplify/` | Chạy các lệnh ở mục 4. Lưu commit, kết quả từng ca và hình thức khởi tạo phiên. Bắt đầu từ bản sao sạch của fixture cho từng trial. | 23 test đang có xanh. Suite nghiệm thu contract hiện có 3 xanh và 5 đỏ, gồm 3 ca tái hiện ban đầu và 2 ca bổ sung về định danh snapshot. |
| 2. Sửa độ mới bằng chứng | Chủ sở hữu Simplify, `_refs/simplify/simplify-contract.mjs`, `verification.md` và `test/e2e/simplify-protected-contract.test.mjs` | Ghép từng receipt với baseline hoặc trạng thái cuối tương ứng. Phát hiện cả receipt có revision mâu thuẫn và receipt cũ có cùng HEAD nhưng file đã sửa tiếp. Tận dụng `baseline.diff_scope_hash` và danh sách file/hunk đã chọn. Bộ test đề xuất ba trường `baseline.diff_scope_hash`, `final_diff_scope_hash` và `behavior_evidence.{before,after}.diff_scope_hash`. Executor tạo digest trên danh sách path đã chuẩn hóa, sắp xếp và nội dung của các file trong scope tại mỗi lần chạy, kể cả file mới/xóa. Cập nhật fixture xanh cũ trong suite chuẩn với cặp định danh hợp lệ và giữ một ca receipt cũ thiếu digest phải báo `blocked` và chỉ dẫn chạy lại. Mỗi ca đỏ phải trả đúng lý do của nó. | Ca revision mâu thuẫn đỏ chuyển xanh, ca chuyển revision hợp lệ vẫn đạt. Bổ sung cặp test cùng HEAD nhưng khác diff và cùng HEAD cùng diff. Kiểm soát cũ về lint, rollback và Analyze vẫn đạt. |
| 3. Sửa giới hạn thao tác | Chủ sở hữu Simplify và Test, cùng các file ở bước 2 và `scope-and-invariants.md` | Dùng một quy ước chuẩn hóa đường dẫn cho scope, pass và coverage. Đếm file riêng cho từng pass và cho toàn bộ lượt. Đối chiếu hunk với diff trong scope và ghi rõ thành phần nào kiểm khi input cũ chỉ có danh sách file. Khi cần phạm vi lớn hơn, dùng luồng chọn lại scope đã có. | Các ca 5/6 file, 8/9 file, lặp lại cùng file qua hai pass và 20/21 hunk có kết quả đúng. Kiểm cả thay đổi khác hunk nhưng cùng file. Chỉ ghi mức xác minh mà input và diff thực tế chứng minh được. |
| 4. Kiểm năng lực chọn thiết kế | Test chạy ma trận ở mục 3, Review đọc diff và test của consumer | Chấm implementation, phân tầng và khả năng bắt sai lệch. Khi một ca thất bại, sửa quy tắc chung ở `_refs/simplify/before-writing-code.md` và dẫn chiếu từ executor. | Mỗi quyết định có caller/implementation/test làm căn cứ. Ca không cần sửa và ca phải đề xuất đổi phạm vi được chấm là kết quả hợp lệ. |
| 5. Kiểm đường kích hoạt | Test và Review, `scripts/release.mjs`, `scripts/install-skills.mjs`, plugin session-start và template bootstrap hiện hành | Dùng gói preview tạo từ chính revision ứng viên. Thử Codex project install trong repo trống chỉ dẫn, Codex với managed AGENTS.md, Claude plugin SessionStart và đường delegated/generic khi có host tương ứng. Với câu hỏi thuần, docs/test-only và yêu cầu chưa được duyệt, quan sát owner và số lần ghi source. | Với mỗi đường vào, ghi kết quả cài đặt, nạp policy và hành vi quan sát được. Ở phiên viết code đủ quyền, test có bằng chứng nạp trước lần sửa đầu tiên. Nếu host không tự nạp ở cấu hình cài đơn thuần, chỉ ra bước onboarding được hỗ trợ hoặc sửa đúng điểm vào. Việc cài đặt phải tôn trọng chỉ dẫn có sẵn của dự án. |
| 6. Tích hợp | Tác giả đồng bộ, reviewer độc lập xác minh đúng diff | Sau khi các test đỏ đạt, đưa regression contract vào suite chuẩn, dùng chung fixture để không duy trì hai bản sao. Chạy sync, suite liên quan, E2E và cài thử gói. Đối chiếu ngân sách nạp bootstrap bằng công cụ hiện có. | Các test và kiểm tra mirror phải đạt trên đúng hash dùng cho kết luận. Ghi rõ host đã thử, host chưa thử và sai khác còn lại trước PR. |

Bước 2 và 3 dùng chung evaluator nên triển khai tuần tự. Trial consumer có thể chuẩn bị độc lập. Chỉ mở rộng sang adapter có bằng chứng hỏng. Hành vi trước khi viết tận dụng owner hiện có, không cần thêm public skill hoặc dependency.

## 3. Sáu tình huống chấm theo tinh thần Ponytail

Ponytail ưu tiên đọc luồng liên quan và chọn thay đổi nhỏ nhất giải quyết toàn bộ tác vụ. Ponytail Review kiểm cả caller ngoài diff và đòi ví dụ cụ thể cho mỗi finding. Các tiêu chí bên dưới áp dụng vào code của chính consumer. [Ponytail](https://github.com/DietrichGebert/ponytail/blob/ebd8654c/skills/ponytail/SKILL.md) · [Ponytail Review](https://github.com/DietrichGebert/ponytail/blob/ebd8654c/skills/ponytail-review/SKILL.md)

| Ca | Đề giao agent (không gọi tên skill) | Bằng chứng nghiệm thu |
|---|---|---|
| A. Tìm lại hành vi ngoài diff | Bổ sung mã đơn hàng tùy chọn vào dòng nhập CSV. Khi có mã, áp dụng cùng quy tắc với billing. | Agent lần từ billing tới `OrderCode.parse` hoặc API sở hữu cùng rule. Nhãn `helper/common/utils` không xuất hiện trong tên symbol. Khi thiếu field, output cũ giữ nguyên. Case khoảng trắng, chữ thường, rỗng và sai định dạng bắt sai lệch qua importer. |
| B. Hai implementation gần giống nhưng khác hợp đồng | Rà hai phép làm tròn ở hiển thị giá và ở hạch toán, với dữ liệu mẫu cho kết quả khác nhau ở mốc nửa đơn vị. | Agent mở cả hai caller và test, giữ riêng hai quy tắc hoặc chứng minh một API có sẵn đáp ứng từng hợp đồng. Oracle riêng cho từng kết quả biên. |
| C. Logic thuộc một feature | Thêm chuẩn hóa bộ lọc chỉ áp dụng cho màn hình đối soát. Cấu trúc repo có cả feature và shared. | Logic ở owner hẹp phù hợp. Màn hình khác giữ output cũ, không có import ngược từ shared vào feature. |
| D. Có cơ sở cho dùng lại base | Thêm adapter thứ ba, dự án đã có base sở hữu vòng đời mở/đóng, cả hai adapter hiện có dùng nó. | Đọc base và consumer, dùng lại vòng đời khi tương thích. Test qua adapter mới xác minh đóng tài nguyên đúng một lần cả khi thao tác lỗi. |
| E. Base đầu cơ | Rà hai handler bề ngoài giống nhau nhưng một handler có transaction, handler kia là tác vụ đọc. Chỉ duyệt phạm vi feature hiện tại. | Agent giữ ranh giới hoặc đề xuất thay đổi kèm lý do. Không xuất hiện base chung hoặc chỉnh sửa ngoài scope chỉ để gom code. |
| F. Bảo vệ hành vi trước refactor | Đơn giản hóa hàm tính hoàn tiền hiện chỉ có test happy path. | Owner Test viết ca đặc trưng được phép trong scope test và chạy trên code cũ cho trường hợp biên. Sau đó Simplify chỉ sửa source đã duyệt. Khi cố ý làm sai quy tắc trên bản sao, test phải đỏ. Sau refactor chạy lại cùng ca. Production code có thể giữ nguyên nếu không có cải thiện rõ ràng. |

Ca A đã có fixture và bộ chấm chạy được trong bàn giao này. B–F là đặc tả test để viết tiếp. Dùng cùng revision fixture, prompt, model/cấu hình và scope để đối chiếu hai bản nếu chạy so sánh. Với mỗi ca ghi owner, symbol/path đã đọc, thứ tự đọc/ghi nếu có trace, diff, kết quả oracle và lý do chọn thiết kế. Nếu host chỉ trả lời tự thuật về việc đọc file, ghi rõ giới hạn đó. Số dòng và token là số liệu tham khảo.

## 4. Chạy lại từ repo root

```sh
node --test --test-isolation=none test/e2e/simplify-skill-contract.test.mjs test/e2e/simplify-protected-contract.test.mjs
node --test --test-isolation=none authoring/evals/simplify/contract-acceptance.mjs
node --test --test-isolation=none authoring/evals/simplify/consumer/test/invoice.test.mjs
node authoring/evals/simplify/consumer-acceptance.mjs
```

Trên `79d962a` kèm bộ test này, bốn lệnh lần lượt cho **23/23**, **3/8**, **2/2** và **1/3**. Hai lệnh có ca đỏ trả exit 1. Năm ca đỏ contract là mục tiêu sửa. Ba ca xanh có cả receipt trước và sau hợp lệ trong schema đề xuất. Digest trong fixture là giá trị mô phỏng cho hai lần chạy. Executor phải tính từ snapshot đã quan sát. Hai ca đỏ CSV mô tả tính năng mà agent sẽ thêm vào project mẫu. Hai suite nghiệm thu này chạy riêng trong giai đoạn test-first.

Ví dụ dưới đây chạy từ repo root bằng Bash. Nó tạo một thư mục tạm mới, cài **chính tarball preview** vào project mẫu ở project scope và giữ bộ chấm bên ngoài. `--tag` cung cấp phiên bản cho preview cục bộ. Thư mục `$trial_root/preview/claude` chứa bản plugin để kiểm tra đường SessionStart.

```sh
trial_root=$(mktemp -d)
node scripts/release.mjs build --tag 1.0.0 --preview --out "$trial_root/preview" > "$trial_root/build.json"
mkdir "$trial_root/package-input"
tar -xzf "$trial_root"/preview/*.tgz -C "$trial_root/package-input"
cp -R authoring/evals/simplify/consumer "$trial_root/project"
(cd "$trial_root/project" && node "$trial_root/package-input/package/bin/skills.mjs" install --agent codex --scope project)
```

Ở lượt review này, 15/15 test release đã đạt. Bản cài thử có rule ở `.agents/skills/_refs/simplify/before-writing-code.md` và project mới vẫn chưa có `AGENTS.md`. Chạy entrypoint SessionStart của plugin Claude cho payload có đường dẫn rule. Việc một host cụ thể có nạp và làm theo payload trong phiên mới cần trial riêng.

Mở phiên từ bản sao đã cài, chụp trạng thái ban đầu. Dùng nguyên văn yêu cầu sau trong phiên mới.

> Add optional order codes to the invoice CSV row importer. A present field follows the existing billing behavior, including invalid values. Preserve the old result when the field is absent. You may edit the importer and its tests. Use the current test runner.

Chạy `node --test` trong bản sao của consumer, rồi từ repo skill chạy `node authoring/evals/simplify/consumer-acceptance.mjs <consumer-directory>`. Bộ chấm CSV phải đạt 3/3. Kiểm diff để biết có thực sự dùng lại rule hay chỉ viết một bản sao cũng qua được test. Để đo test **do agent viết cho importer**, tạo hai bản sao độc lập của lời giải. Ở importer của bản thứ nhất, vẫn gọi parser nhưng trả lại chuỗi thô. Ở importer của bản thứ hai, nuốt lỗi parser khi mã sai. Với từng bản, test billing sẵn có và ca invoice thiếu field phải xanh, còn ít nhất một test mới qua importer phải đỏ. Giữ nguyên domain parser. Khi chạy thử trên hai bản sao của lời giải CSV trước, mỗi biến thể làm đỏ đúng một test mới qua importer và cả hai test cũ vẫn xanh. Fixture đầu vào trong repo được giữ nguyên để lần sau chạy lại từ đầu.

**Khi tích hợp** chạy `npm run sync:skills`, `npm run check:skills`, `npm run check:text-hygiene`, `npm run test:e2e`, `npm run test:e2e:release` và `node scripts/measure-communication-economy.mjs`. Quy trình tạo gói preview có trong `.github/workflows/ci.yml`. Đặt kết quả quét, log thô và workspace trial bên ngoài sản phẩm phân phối. Trong lần review này, phần chính của suite repository đạt 923/923 trên commit triển khai kèm bộ test bàn giao. Việc đóng finding cần bằng chứng mới sau khi sửa.
