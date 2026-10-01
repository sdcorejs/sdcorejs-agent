---
slug: quickstart
title: Bắt đầu sử dụng
description: Chọn một đường cài đặt, giữ references cùng skills và kiểm tra dispatch trong một phiên agent mới.
kicker: Quickstart
---

## Trước khi cài

Bạn cần AI coding agent host tương ứng và một target project được phép đọc. Bộ skill không cung cấp agent runtime/server. Tài liệu này theo snapshot `main` tại `ac820d7`; `0.8.0` là metadata repo/plugin, không phải package npm để cài.

Khi áp dụng cho team, pin một revision đã đánh giá hoặc tag/release đã xác minh. Nếu giữ floating `main`, ghi lại commit đang dùng. Đọc instructions của target project trước khi thêm entrypoint.

## Claude Code plugin

Các lệnh dưới đây lấy từ README của repo:

```text
/plugin marketplace add sdcorejs/sdcorejs-agent
/plugin install sdcorejs-agent@sdcorejs
```

Mở target project và bắt đầu phiên Claude Code mới. Kiểm tra read-only bằng prompt ở cuối trang. Việc kiểm chứng cài đặt thực tế phụ thuộc phiên bản và quyền của host; trang này không khẳng định live compatibility đã pass.

## Codex native skills

Clone nguồn vào thư mục riêng, rồi chọn revision. Ví dụ này pin snapshot mà docs đang mô tả:

```powershell
git clone https://github.com/sdcorejs/sdcorejs-agent.git
cd sdcorejs-agent
git checkout ac820d70bd247a04f977aab9bbb864f6a054acb7
```

Repo đã chứa generated mirror ở `codex/skills/`. Giữ toàn bộ cây này, gồm `_refs`, khi cài vào thư mục skills của Codex. Đọc các file trùng tên trước khi cập nhật một bộ skill đã cài; lệnh `Copy-Item -Force` thay nội dung trùng.

```powershell
$dest = if ($env:CODEX_HOME) {
  Join-Path $env:CODEX_HOME "skills"
} else {
  Join-Path $HOME ".codex\skills"
}
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item .\codex\skills\* $dest -Recurse -Force
```

Khởi động lại Codex, mở **target project** và chạy smoke prompt. Khi tự sửa canonical skills/refs trong nguồn, README yêu cầu regenerate bằng `npm run sync:skills`, rồi `npm run check:skills`; cài mirror có sẵn không cần sửa source.

## Attached repo, Cursor và Copilot

| Cách dùng | Nguồn cần giữ | Lưu ý |
| --- | --- | --- |
| Codex attached repo | `AGENTS.md`, `skills/`, `_refs/` | Clone trong workspace chưa đảm bảo host đã đọc instructions; cần entrypoint/attachment thực tế |
| Cursor | `AGENTS.md`, `.cursor/rules/sdcorejs-agent.mdc` và refs | Hợp nhất theo conventions target project; không ghi đè instructions đang có |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md` và refs | Chọn mode/entrypoint mà client hiện tại hỗ trợ; verify trong phiên thật |

Repo có [ví dụ submodule và symlink](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/README.md#attached-repo--submodule). Các symlink đó là lệnh shell Unix; Windows cần cơ chế tương ứng. Tránh chép riêng entrypoint mà bỏ references phía sau.

## Kiểm tra lần đầu

Trong phiên mới, dùng prompt này trước khi giao việc viết code:

```text
Dùng sdcorejs-explore ở chế độ summary-read để hiểu repo này.
Không ghi file. Nêu stack, instructions liên quan, các lệnh verification
đang có và những phần chưa kiểm chứng.
```

Quan sát: agent chọn Explore read-only, dẫn nguồn repo và phân biệt command có sẵn với command đã chạy. Missing/stale summary cần targeted reads; không phải lý do tự tạo file summary.

Sau đó thử yêu cầu lập scope:

```text
Tôi muốn thêm bộ lọc status cho danh sách Product.
Dùng SDCoreJS flow để làm rõ phạm vi và đề xuất spec.
Giữ API và component hiện có; chưa viết code trước khi tôi duyệt.
```

Quan sát: agent kiểm tra bối cảnh, chỉ hỏi blockers thực sự, đưa scope/spec để duyệt. Một lệnh “implement” không tự thay thế approval của spec và plan.

## Kiểm tra source pack khi cần

Các lệnh dưới chạy ở **repo skill pack**, không phải target application:

```bash
npm ci
npm run check:skills
npm run check:text-hygiene
npm run test:e2e:repository
```

Root tooling yêu cầu Node `^22.22.3 || ^24.15.0 || >=26.0.0`. Site riêng yêu cầu Node `>=22.12.0`. Full E2E cần môi trường đã chuẩn bị; đọc TESTING trước khi suy ra một bộ check phải chạy ở mọi project.

## Tiếp theo

Chọn [workflow theo tình huống](/docs/workflows/), rồi dùng [recipe feature](/docs/recipes/feature/) để đi qua một thay đổi hoàn chỉnh. Nếu skill không load hoặc thiếu `_refs`, xem [troubleshooting](/docs/troubleshooting/).

Nguồn cài đặt và yêu cầu tooling: [README](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/README.md), [package.json](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/package.json), [TESTING.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/TESTING.md).
