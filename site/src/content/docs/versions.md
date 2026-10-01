---
slug: versions
title: Phiên bản & bằng chứng
description: Đọc năng lực theo source revision; tách main, candidate và validation thực tế của runtime bạn đang dùng.
kicker: Nguồn & trạng thái
---

## Snapshot mà tài liệu đang mô tả

Nội dung mặc định bám `main` tại commit **`ac820d70bd247a04f977aab9bbb864f6a054acb7`**, xác minh từ remote ngày 01/10/2026. Đây là snapshot của main, không phải tuyên bố về một GitHub Release/tag đã được phát hành. Metadata repo/plugin là `0.8.0`; root workspace private, validation-only, không có đường cài npm root package.

Canonical inventory tại snapshot này có 23 public skills. Internal authoring skills không được tính như public capabilities. Khi build site, inventory được đọc từ `skills/` và đối chiếu với editorial reference; thiếu/thừa reference làm build fail.

## Main và candidate khác nhau thế nào?

| Nguồn | Trạng thái trong docs | Cách sử dụng |
| --- | --- | --- |
| Main `ac820d7` | Nền của các hướng dẫn mặc định | Readiness thực tế vẫn cần check trong target session |
| `codex/simplify-design-handoff`, `4703643432f7eda43a1c9ccb19db6669e56575f3` | Candidate riêng, chưa đưa vào claim mặc định | Xem diff/source và evidence của candidate trước adoption |

Candidate có thay đổi ở simplify verification, design handoff/verification, UI review/interaction finish contracts, progressive skill/reference loading và repair/readiness contracts. Việc một file/contract tồn tại trên branch không chứng minh implementation đã pass mọi check hoặc đã release.

Docs rewrite này không nhập candidate, không sửa runtime skills, và không nhập patch sửa findings riêng. Các trang reference dẫn source của main; khi đọc candidate, giữ revision và report tương ứng riêng.

[Xem diff main snapshot → candidate](https://github.com/sdcorejs/sdcorejs-agent/compare/ac820d70bd247a04f977aab9bbb864f6a054acb7...4703643432f7eda43a1c9ccb19db6669e56575f3).

## Lớp bằng chứng nào đã có?

Repo có deterministic contract tests, Full E2E cho prepared environment và format ghi live-agent evidence. Đây là các khả năng kiểm chứng; trang docs không tuyên bố mọi layer đều đã chạy ở máy hoặc host của bạn.

- Một validator/offline fixture pass chứng minh case được chạy, không chứng minh provider/model hiện tại tương thích.
- Một screenshot chứng minh capture tại thời điểm đó, không chứng minh keyboard hoặc screen reader behavior.
- Agent host support cần transcript/tool versions và attestation của session hiện tại.
- Model identifiers, pricing và provider API behavior cần kiểm chứng hiện hành nếu scope sử dụng chúng.

Không có claim định lượng về token/cost savings, tốc độ hay success rate trên site. Recipes là ví dụ minh họa; không được trình bày như demo thực thi đã kiểm chứng.

## Nguồn chính

- [README & installation](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/README.md)
- [AGENTS.md & routing/scope](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/AGENTS.md)
- [System registry & artifact roots](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/system-registry.json)
- [AI-agent engines/capability manifest](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/ai-agent/manifest.json)
- [Validation posture](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/VALIDATION.md)
- [Real-agent evidence format](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/REAL_AGENT_VALIDATION.md)

## Khi cập nhật docs

Chọn revision rõ ràng, đọc canonical source và kiểm tra commands/paths trước sửa prose. Cập nhật inventory/reference cùng nhau, chạy build và link checks, rồi kiểm tra responsive/keyboard. Không thay revision trong source links nếu chưa rà nội dung theo bản mới.
