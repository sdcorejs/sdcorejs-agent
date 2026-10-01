---
slug: recipes/ui
title: Cải thiện UI hiện có
description: Bắt đầu từ user task và interface thực tế; giữ behavior, tokens và components trong khi làm rõ layout và interaction.
section: Recipes / UI
kicker: Recipe · UI/UX
---

## Tình huống và inputs

Sidebar ba cấp khó đọc active state, hoặc một bảng desktop cần dễ dùng trên mobile. Chuẩn bị source/route, screenshot nếu có, user task, permissions, tokens và components đang dùng. Đây là ví dụ cách áp dụng, chưa phải transcript đã thực thi.

## 1. Chọn design hay review

Muốn đề xuất hoặc thiết kế cải thiện: dùng Design. Muốn findings độc lập: dùng Review read-only. Self-critique của người thiết kế hỗ trợ chất lượng nhưng không được gọi là independent review.

```text
Dùng sdcorejs-review audit sidebar hiện tại ở chế độ read-only.
Tập trung navigation, active/expanded state và keyboard.
Phân biệt lỗi functional/accessibility với preference thẩm mỹ.
Ghi rõ phần chỉ đọc source và phần đã kiểm tra rendered UI.
```

## 2. Thiết kế thay đổi có phạm vi

```text
Dùng sdcorejs-design cải thiện sidebar ba cấp.
Giữ routes, permissions, token roles và icon family hiện có.
Cho component/data map, expanded/active behavior,
keyboard flow và responsive rules. Không viết production code.
```

Design chọn references UI/UX liên quan (navigation, hierarchy, accessibility; mobile khi áp dụng). Existing UI là điểm xuất phát. Ghi candidate khi chưa có evidence về exact component API.

Nếu có lựa chọn layout thực sự chưa chốt, có thể so sánh visual alternatives. Live Visual Companion cần capability và scoped consent. Browser auto-open là consent riêng. Static HTML hoặc Markdown là fallback; lựa chọn mockup không phải spec/plan approval.

## 3. Implementation theo handoff

Một thay đổi UI đáng kể vẫn cần spec/plan phù hợp. Executor dùng handoff và installed source. Với Core UI, kiểm tra đúng package alias và exact version; thiếu docs/source khớp version phải báo unverified API.

Không chuyển toàn bộ bảng sang cards mà mất selection scope, row actions hay mở detail. Không đổi routes/permissions chỉ để bố cục trông đơn giản hơn.

## 4. Kiểm chứng trên UI thật

- Keyboard: Tab, activation, expand/collapse, focus và vị trí focus sau đóng overlay.
- Mobile: small/large phone widths, long labels, safe areas nếu có fixed controls.
- Reflow: viewport 320 CSS px và text resize/spacing; tránh che content bằng sticky UI.
- Contrast: đo computed foreground/background cho text và states theo visual role.
- Behavior: current route, back/deep link, permission và action vẫn đúng.

Screenshot hỗ trợ xem layout; nó không chứng minh keyboard hay screen-reader behavior. Nếu chỉ có source, các checks rendered chưa chạy phải ghi NOT RUN. Không gọi một focused audit là WCAG conformance đầy đủ.

## Đầu ra để bàn giao

Handoff editable, quyết định/token/component map, changed paths, focused tests, rendered/interaction evidence và findings còn lại. Xem [artifacts](/docs/artifacts/) để phân biệt mockup và real UI capture.

Nguồn: [UI/UX index](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/design/uiux/index.md), [Accessibility baseline](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/review-accessibility.md).
