---
schema_version: 1
artifact_id: simplify-ponytail-e2e-plan-20261124
artifact_kind: handoff
change_ref: simplify-before-code-followup
source_revision: 0c91a5b1c26540230754ef10386ead4e46479ef3
candidate_diff_sha256: 316fe47b45bf4c68043bb49c101fcbb31866c537d0a46d8f18a555d5ec8375b9
source_spec: none
source_plan: none
owner: sdcorejs-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
commit_policy: with-change
status: approved
---

# Kế hoạch triển khai và so sánh Simplify với Ponytail

**Mục tiêu** là để người dùng giao một việc viết code bình thường và agent tự áp dụng Simplify trước lần sửa đầu tiên. Nghiệm thu bằng một lần chạy E2E đối đầu trên bản phân phối cuối, có agent thật sửa project, có đối chứng và có test kiểm kết quả.

## 1. Điểm xuất phát

Nhánh `feat/simplify-before-code` đã có quy tắc ngắn trong mô tả skill, hướng dẫn cho project dùng `AGENTS.md` và hook Claude đã sửa lỗi CRLF. Trên diff ghi ở đầu tài liệu, Codex và OpenCode đã nhận quy tắc trong request gửi model. Trong ca CSV, agent có Simplify và agent đối chứng cùng chọn `OrderCode.parse` và cùng đạt các test. Benchmark NVIDIA trước đó chạy trên bản cũ hơn, đủ điểm 12/14 lượt và chỉ có hai nhánh. **Chưa có kết quả chạy Ponytail trên cùng fixture.** [Bộ ca hiện có](../../../authoring/evals/simplify/README.md)

Đối thủ được cố định là `DietrichGebert/ponytail`, phiên bản 5.3.3, commit `ebd8654c2c627f721eb8f9c0d1bd4090a29f9e10`. Chọn OpenCode 1.19.5 làm host so sánh chính vì cả hai bộ đều có đường cài đã xác định. [Hướng dẫn cài tại commit này](https://github.com/DietrichGebert/ponytail/blob/ebd8654c2c627f721eb8f9c0d1bd4090a29f9e10/INSTALL.md)

## 2. Các bước triển khai

| Bước | Công việc và phạm vi | Bằng chứng để chuyển bước |
|---|---|---|
| 1. Khóa đầu vào | Ghi commit và hash diff thực sự được đóng gói, SHA-256 của gói preview và revision Ponytail. Cố định model, runtime, chế độ mặc định, giới hạn context/token, timeout, công cụ và cấu hình máy. Dùng project mẫu và model cục bộ làm mặc định. | Một manifest tái lập được. Từ gói đã cài, xác nhận native entrypoint và hook trỏ tới nội dung mong đợi. |
| 2. Hoàn thiện Simplify | Rà `skills/shared/workflow/simplify.md`, `_refs/simplify/before-writing-code.md` và cơ chế sinh mirror trong `scripts/sync-skills.mjs`. Chạy lại lỗi với bản cài độc lập, sửa đường dẫn cần cho thao tác viết thông thường nếu còn hỏng. Bổ sung metadata tác giả từ manifest của pack tại nguồn, kiểm tra bản sinh ra. Giữ quyền sửa ở executor hiện tại và giữ refactor sau test là lựa chọn riêng. | Test đỏ chứng minh từng lỗi trước khi sửa. Gói native và hook marketplace phải giao được quy tắc cho yêu cầu không nêu tên skill. Chạy từ project mới và kiểm tra resume cùng đường dẫn có dấu cách. |
| 3. Làm bộ chạy đối đầu | Trong `authoring/evals/simplify/`, tái sử dụng `consumer/`, `decisions/` và hai bộ kiểm hiện có. Bổ sung manifest 10 ca ở `comparison-cases.json`, runner `compare-agents.mjs` và các fixture mới G, H, I trong cùng thư mục. Runner tạo project trắng từ cùng snapshot, thu trace thao tác, sau đó chạy bộ kiểm độc lập từ bên ngoài project. | Chạy thử ca A trên cả ba cấu hình. Thử cố tình làm sai parser, bỏ đóng resource hoặc sửa file ở ca chỉ đọc để xác nhận bộ kiểm phát hiện được. Loại lượt chạy thử khỏi kết quả chính. |
| 4. Chốt bản ứng viên | Sửa finding về tự nạp, quyết định dùng lại hoặc đặt logic nếu bước chạy thử phát hiện. Đổi quy tắc ở nguồn chính, đồng bộ mirror, tạo lại gói preview và đóng băng phiên bản trước khi chấm. | Review độc lập diff, cài gói mới vào project sạch, chạy regression của repo. Lưu hash gói cuối ngay trong mỗi lượt E2E. |
| 5. Chạy E2E sau khi triển khai | Chạy toàn bộ ma trận ở mục 3 trên bản ứng viên đã chốt. Mỗi lượt đi từ prompt thường đến thao tác của agent, diff cuối, test của project và bộ kiểm bên ngoài. Người chấm quyết định thiết kế xem diff và trace đã ẩn tên nhánh. | Có kết quả từng lượt cho cả ba cấu hình, kể cả lỗi hoặc timeout. Nếu sửa skill sau khi chấm, chạy lại trên hash mới và giữ riêng kết quả bản cũ. |
| 6. Đối soát và bàn giao | Chạy lại NVIDIA SkillEvaluator 0.9.0 đủ Tier 1, 2 và 3 cho Simplify trên cùng ứng viên. Dùng báo cáo NVIDIA để kiểm chất lượng và chẩn đoán riêng. Đối chiếu kết quả với E2E ba nhánh, ghi cả trường hợp hòa, thua và thiếu dữ liệu. | Bàn giao Markdown tổng hợp, CSV từng lượt, manifest đầu vào, lệnh tái lập và liên kết tới trace/diff đã lọc. Xác nhận tiêu chí ở mục 4 trước khi đề nghị merge. |

## 3. Thiết kế E2E

**Ba cấu hình.** Baseline dùng host nguyên bản. Simplify dùng bản preview cài ở project scope theo đường native mặc định. Ponytail dùng plugin upstream ở chế độ mặc định của checkout đã ghim. Trên OpenCode 1.x, cấu hình qua khóa `plugin` trỏ đến file `.opencode/plugins/ponytail.mjs` trong checkout. Dùng thư mục cấu hình, cache và phiên riêng cho mỗi nhánh. Cả ba có cùng chỉ dẫn nghiệp vụ của project. Không thêm chỉ dẫn thủ công về reuse vào prompt hoặc baseline. Nếu cần thử Simplify với `instructions` hay managed `AGENTS.md`, ghi thành phép thử bổ sung. Kết quả chính mô tả hành vi của từng **cách cài mặc định**.

**Khối lượng đề xuất.** 10 ca × 3 cấu hình × 3 lần lặp độc lập = **90 lượt agent thật**, ngoài pilot và lượt của NVIDIA. Mỗi bộ ba dùng cùng prompt, dữ liệu, model và seed khi host hỗ trợ. Xoay thứ tự chạy giữa các lần lặp. Mỗi lượt bắt đầu từ project mới, không dùng lại hội thoại, mode hay sản phẩm của lượt trước. Nếu cần hiệu chỉnh RAM hoặc timeout, hiệu chỉnh trong pilot rồi cố định cho toàn bộ ma trận.

| Ca | Yêu cầu tự nhiên | Kiểm tra độc lập |
|---|---|---|
| A | Thêm mã đơn hàng tùy chọn vào CSV | Kiểm bỏ trống field, chuẩn hóa và lỗi. Đọc diff để xác nhận dùng parser billing sẵn có. |
| B | Review hai hàm làm tròn | Tìm input nửa cent cho hai kết quả khác nhau, giải thích lý do giữ riêng, kiểm project không bị sửa. |
| C | Cho bộ lọc reconciliation nhận chữ hoa/thường và khoảng trắng | Thay đổi nằm ở feature. Caller khác của matcher công khai giữ nguyên hành vi. |
| D | Thêm JSON reader | Kiểm API, số lần đóng resource khi thành công và khi parse lỗi, cùng việc dùng lifecycle đang có. |
| E | Review hai handler có vẻ giống nhau | Phân biệt đường chỉ đọc và đường cần transaction, nêu caller quan trọng, kiểm project không bị sửa. |
| F | Đánh giá và làm rõ hàm hoàn tiền | Quan sát test biên chạy trên code gốc. Giữ nguyên source là kết quả hợp lệ khi đã rõ. |
| G | Bổ sung một cách nhập dữ liệu mà project đã hỗ trợ qua cấu hình | Chạy từ entrypoint công khai, kiểm đầu ra và diff. Chấp nhận thay đổi cấu hình nhỏ hoặc xác nhận hành vi đã có bằng test. |
| H | Chỉnh tài liệu ví dụ của một hàm | Đối chiếu ví dụ với đầu ra thực tế, kiểm diff chỉ chạm tài liệu được yêu cầu. |
| I | Thêm bộ chọn ngày vào form có sẵn | Chạy giao diện trong trình duyệt với đầu vào hợp lệ và bỏ trống. Kiểm lưu và hiển thị lại ngày. Xem component hiện có và dependency diff để đánh giá lựa chọn. |
| Q | Giải thích giá trị trả về của một phép hoàn tiền | Đối chiếu với kết quả chạy thực tế, xác nhận không có file nào bị sửa. |

B và E là hai prompt riêng. Mỗi ca chỉ chạy các assertion áp dụng cho fixture của nó. Chạy test ẩn ngoài quyền ghi của agent. Với ca thay đổi nguồn, lưu thời điểm đọc caller, implementation và test so với lần sửa sản phẩm đầu tiên. Khi host đã đưa chỉ dẫn vào context, một lượt có thể thể hiện đúng hành vi dù không gọi tool mở skill. Đánh dấu phần trace không quan sát được.

## 4. Tiêu chí nghiệm thu và xử lý lỗi

1. **Tự nạp.** Với ca viết code, xác nhận quy tắc có mặt trong request của coding agent hoặc được đọc trước lần sửa production đầu tiên. Một lần thử dùng recorder chỉ xác nhận bước giao chỉ dẫn. Cần phiên model thật và diff để chấm quyết định.
2. **Đúng hành vi.** Chấm từng ca bằng bộ kiểm ngoài, vị trí thay đổi, API và phạm vi ghi được phép. B, E, Q phải giữ nguyên cây project. H chỉ sửa tài liệu. Với parser, phép tính và lifecycle, ghi rõ test nào bắt được lỗi cố ý. Số dòng ngắn hơn tự nó không chứng minh code tốt hơn.
3. **So sánh công bằng.** Với từng ca, công bố tỷ lệ đạt trên tổng lượt đã thử, thắng/hòa/thua của Simplify so với từng đối thủ trên các lượt ghép đủ dữ liệu, cùng số lượt thiếu. Báo token đầu vào/đầu ra và cached token đúng cách tính của provider, thời gian trung vị và số file sửa. Các ca cùng chọn đúng parser phải ghi hòa. Mười ca hỗ trợ kết luận cho bộ đề này.
4. **Lỗi và chạy lại.** Một câu trả lời sai, vi phạm chỉ đọc hoặc test đỏ là kết quả fail. Timeout và sự cố host có trạng thái riêng, giữ log và tính vào mẫu đã khởi chạy. Nếu sự cố hạ tầng làm một bộ ba không so sánh được, sửa nguyên nhân rồi chạy lại nguyên bộ ba trong cùng điều kiện, lưu cả hai lần. Thay model, tiêu chí chấm hay quy tắc sau khi xem điểm cần ma trận mới có định danh riêng.
5. **Điểm dừng.** Chỉ báo hoàn tất phép so sánh khi đã thực thi ma trận trên bản cuối, có số liệu cho cả Ponytail và có báo cáo truy ngược được xuống từng ca. Vi phạm phạm vi ghi hoặc sai hành vi bắt buộc của Simplify cần sửa trước khi đề nghị merge. Nếu dữ liệu còn thiếu, bàn giao phần đã đo, nguyên nhân và số lượt còn thiếu. Kết quả hòa hoặc kém Ponytail vẫn phải được công bố.

**Các lệnh đã có trong repo** gồm `npm run sync:skills`, `npm run check:skills`, `npm run check:text-hygiene`, `npm run check:executable-references`, `npm run test:e2e:release` và `npm run test:e2e`. Chạy suite Cleanup trên fixture ext4/APFS được hỗ trợ. Bước 3 sẽ cung cấp lệnh sau để người khác tái lập phép so sánh từ gốc repo. Chỉ khai báo đạt sau khi lệnh thực thi với model thật, sinh đủ receipt và báo cáo. Thư mục output phải mới cho mỗi lần chạy.

```sh
node authoring/evals/simplify/compare-agents.mjs \
  --manifest authoring/evals/simplify/comparison-cases.json \
  --arms baseline,simplify,ponytail --repetitions 3 --output "$RUN_DIR"
```

Manifest sẽ ghi các gói đã đóng băng cùng cấu hình model và host ở bước 1. Báo cáo kết quả ghi nguyên lệnh thực tế, hash của manifest và của hai gói.
