---
slug: troubleshooting
title: Xử lý vướng mắc
description: Nhận diện lỗi cài đặt, thiếu context, approval và verification; sửa nguyên nhân thay vì bỏ qua gate.
kicker: Troubleshooting
---

## Skill không xuất hiện hoặc không dispatch

Kiểm tra đúng install path và entrypoint mà host đọc. Với Codex native, giữ `codex/skills/_refs` bên cạnh các skill folders và bắt đầu phiên mới sau cập nhật. Clone repo chưa tự chứng minh đã attach instructions vào target project.

Dùng [smoke prompt read-only](/docs/quickstart/) và ghi tool version, nguồn skill/revision và behavior quan sát được. Không suy ra support của phiên hiện tại từ tên sản phẩm trong compatibility table.

## Thiếu references hoặc mirror drift

Triệu chứng: skill không resolve `../_refs/...`, hoặc `npm run check:skills` fail.

- Native install: copy toàn bộ `codex/skills`, gồm `_refs`; đừng chép từng folder skill riêng lẻ.
- Maintainer sửa source: sửa canonical `skills/`, `_refs/` hoặc entrypoints; chạy `npm run sync:skills`, rồi `npm run check:skills`.
- Không sửa generated mirror bằng tay để che drift. Nếu install đang chứa custom files, xem diff trước khi thay thế.

## Agent đòi spec hoặc plan

Kiểm tra yêu cầu có thực sự là fast-fix không: hành vi/AC rõ, scope nhỏ, ownership/risk giới hạn và focused verification có sẵn. Non-trivial implementation cần approved artifacts; câu “implement” không thỏa approval gate.

Nếu approved spec/plan đã tồn tại, cung cấp đúng owner, đường dẫn và identity/revision. Artifact stale/hash-invalid hoặc scope khác cần owning gate xử lý; không tự ghi approval vào metadata.

## Summary chưa có hoặc đã cũ

Đây không phải blocker chung. Project context fallback sang targeted reads hoặc scoped code map. Chỉ persist summary khi đã có authority cho action đó; đọc context không tự cho phép refresh file.

## Core UI docs không đúng version

Giữ `@sdcorejs/angular` hoặc `@sd-angular/core` theo app thực tế. Kiểm tra installed metadata/lockfile và relevant exports. Exact docs thiếu thì dùng local API evidence đã xác minh hoặc báo unverified API. Không nâng version hay chọn docs gần nhất rồi gọi là compatible.

Angular thuần không được tự import Core UI. Xem [Angular guide](/angular/).

## Delegation hoặc visual preview không dùng được

Capability `unknown` giữ fallback: Markdown cho lựa chọn, static visual nếu phù hợp, sequential parent khi delegation/isolation chưa được xác minh. Không đổi metadata thành supported chỉ dựa vào tài liệu host.

Live Visual Companion cần scoped consent và capability cho local runtime. Browser auto-open có consent riêng. Nếu không dùng live surface, giữ original decision/options trong fallback. Visual feedback không là workflow approval.

## Tests không chạy được hoặc bị fail

Phân biệt command không có, environment thiếu, dependency/container unavailable và assertion fail. Ghi exact command, exit/result và failure mode đã quan sát; redact secrets trước chia sẻ log.

Root pack checks khác tests của target app. Full E2E của pack cần prepared environment. Live-agent/provider checks cần điều kiện và evidence riêng. Báo NOT RUN khi thiếu environment; không đổi test để giả thành công.

Để maintainer kiểm tra pack: [TESTING.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/TESTING.md) và [VALIDATION.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/VALIDATION.md).

## Nội dung tiếng Việt bị lỗi

Giữ UTF-8 và locale marks trong docs/user-facing strings. Dùng `npm run check:text-hygiene` trong skill pack và kiểm tra text thực tế trên trình duyệt. Terminal rendering sai cần kiểm tra bytes/encoding trước khi kết luận source hỏng.

## Brief để nhờ xử lý

```text
Host và version:
Skill pack revision / cách cài:
Target repo và scope được phép:
Prompt và behavior quan sát:
Expected / actual:
Command, exit/result và log đã redact:
Artifact/reference bị thiếu:
```

Nguồn chẩn đoán: [Troubleshooting của repo](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/TROUBLESHOOTING.md). Không đưa credentials, session data hay private URLs vào report công khai.
