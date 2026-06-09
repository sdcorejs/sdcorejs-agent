# User-Guide Templates (for `sdcorejs-write-user-guide`)

Templates the `sdcorejs-write-user-guide` skill renders. Per-module guides live at
`<target>/.sdcorejs/user-guide/<module>.md`; the aggregate at `<target>/sdcorejs-user-guide.md`.
Markdown is canonical; DOCX/PDF is produced by the pandoc command at the bottom. Images are
placeholders the target project fills (the agent does NOT run the app / capture screenshots).

## Per-module template (.sdcorejs/user-guide/<module>.md)

```markdown
---
module: <module>
title: <Tên tính năng>
tracks: [angular, nestjs]
generated_at: <ISO8601>
git_head: <sha>
routes:
  - { path: /<module>/<entity>, screen: list, permission: <module>_<entity>:view }
permissions: [<module>_<entity>:view, <module>_<entity>:create]
entities:
  - { name: <Entity>, fields: [code, name] }
screens: [list, detail, create, update]
spec_refs: [.sdcorejs/docs/<track>/<ts>-<topic>-spec.md]
prd_refs: []
coverage: { total: 0, met: 0, partial: 0, missing: 0 }
---

# <Tên tính năng> — Hướng dẫn người dùng

## Tổng quan
<Mô tả module làm gì cho người dùng, ngôn ngữ phổ thông.>

## Màn hình & tác vụ
### <Tên màn> — `/<module>/<entity>`
- **Người dùng làm gì:** <mô tả tác vụ>
- **Ai dùng được:** quyền `<module>_<entity>:<action>`
- **Trường/nút chính:** <liệt kê>
![<Tên màn>](images/<module>-<screen>.png)

## Bảng quyền
| Mã quyền | Tác vụ | Ai/Vai trò |
|---|---|---|
| `<module>_<entity>:view` | Xem danh sách/chi tiết | <role> |
| `<module>_<entity>:create` | Tạo mới | <role> |

## Tham chiếu dữ liệu
| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| code | string | có | duy nhất |
| name | string | có | <=255 |

## Hành động đặc biệt
<workflow / chuyển trạng thái / bulk / xuất Excel — nếu có; bỏ mục này nếu không.>

## Coverage vs yêu cầu
| # | Yêu cầu (spec/PRD) | Trạng thái | Tài liệu ở mục |
|---|---|---|---|
| 1 | <acceptance criterion> | ✅ đủ | Màn hình & tác vụ |
| 2 | <criterion> | ⚠️ một phần | <gap> |
| 3 | <criterion> | ❌ thiếu | — |

## Ảnh minh hoạ — checklist chụp
- [ ] `images/<module>-list.png` — màn danh sách
- [ ] `images/<module>-detail.png` — màn chi tiết
```

## Aggregate template (<root>/sdcorejs-user-guide.md)

```markdown
---
title: <Tên dự án> — Hướng dẫn sử dụng
generated_at: <ISO8601>
git_head: <sha>
modules: [<module1>, <module2>]
coverage: { total: 0, met: 0, partial: 0, missing: 0 }
---

# <Tên dự án> — Hướng dẫn sử dụng

## Mục lục
1. [<Module 1>](#module-1)

## Tổng quan hệ thống
<1-2 đoạn: hệ thống làm gì, dành cho ai.>

## <Module 1>
<chèn nội dung .sdcorejs/user-guide/<module1>.md, bỏ phần frontmatter>

## Tổng hợp Coverage vs yêu cầu
| Module | Đủ ✅ | Một phần ⚠️ | Thiếu ❌ |
|---|---|---|---|
| <module1> | 5 | 1 | 0 |
```

## Xuất DOCX/PDF (pandoc)

DOCX (ưu tiên — chèn được ảnh scaffold):
  pandoc <target>/sdcorejs-user-guide.md -o <target>/sdcorejs-user-guide.docx --resource-path=<target>/.sdcorejs/user-guide
PDF:
  pandoc <target>/sdcorejs-user-guide.md -o <target>/sdcorejs-user-guide.pdf --resource-path=<target>/.sdcorejs/user-guide

- Ảnh là placeholder `images/<module>-<screen>.png`; đặt ảnh vào `<target>/.sdcorejs/user-guide/images/` rồi chạy pandoc.
- Agent KHÔNG chạy app/chụp ảnh — checklist chụp ở mỗi guide nói rõ cần chụp màn nào.
