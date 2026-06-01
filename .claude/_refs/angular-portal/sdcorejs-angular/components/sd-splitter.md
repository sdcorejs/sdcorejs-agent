# `<sd-splitter>`

**Type**: Component (container) + child panel component
**Selectors**: `sd-splitter`, `sd-splitter-panel`
**Import path**: `@sd-angular/core/components/splitter` (or barrel: `@sd-angular/core/components`)
**Classes**: `SdSplitterComponent`, `SdSplitterPanelComponent`
**Standalone**: yes
**Change detection**: signals-first (effects), no OnPush decorator needed — state lives in `SplitterStateService` signals
**Library version**: `@sd-angular/core@19.0.0-beta.105`

## One-line purpose
Resizable split layout — chia vùng ngang (`horizontal`) hoặc dọc (`vertical`) thành nhiều panel kéo được, hỗ trợ panel cố định (`px`) lẫn co giãn (`flex`), collapse/expand, snap-to-collapse và lưu layout vào storage.

## When to use
- Master–detail, list + preview, editor + sidebar — bất kỳ layout 2+ vùng người dùng cần tự chỉnh tỉ lệ
- Cần nhớ tỉ lệ panel giữa các session (`storageKey`)
- Cần panel thu gọn được (sidebar collapse) với double-click / phím / snap khi kéo sát mép
- Nested splitter (ngang lồng dọc) — mỗi `sd-splitter` quản handle riêng

## When NOT to use
- Chỉ cần 1 sidebar đóng/mở cố định, không kéo tỉ lệ → dùng `<sd-side-drawer>`
- Layout tĩnh không cho resize → CSS grid/flex thường

## Architecture (sub-component map)
| Piece | Vai trò | Export? |
| --- | --- | --- |
| `SdSplitterComponent` (`sd-splitter`) | Orchestrator: đọc `contentChildren` panel → build meta → reconcile state, tạo handle động, apply flex style, commit + storage + emit | ✅ |
| `SdSplitterPanelComponent` (`sd-splitter-panel`) | Khai báo 1 panel (size/unit/min/max/collapsible/resizable). Presentational — chỉ giữ input | ✅ |
| `SdSplitterHandleComponent` (`sd-splitter-handle`) | Thanh kéo giữa 2 panel. **Internal** — tạo qua `createComponent` + `appendChild`, KHÔNG export, KHÔNG đặt trong template | ❌ |
| `SplitterStateService` | Toàn bộ logic kích thước: `applyDelta`, clamp min/max, snap collapse, expand, reconcile, commit. Provided per `sd-splitter` instance | ❌ |

> Handle được sinh động (`panelCount - 1` cái), wire `dragStart/dragMove/dragEnd/toggleRequest`, rồi DOM được sắp lại: `panel0, handle0, panel1, handle1, …`.

## `<sd-splitter>` Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `orientation` | `SplitterOrientation` (`'horizontal' \| 'vertical'`) | `'horizontal'` | `horizontal` = panel xếp ngang, kéo theo trục X. `vertical` = xếp dọc, kéo theo Y. |
| `disabled` | `boolean` | `false` | `transform: booleanAttribute`. Khoá toàn bộ handle (drag + keyboard + dblclick). |
| `storageKey` | `string \| undefined` | `undefined` | Khi có → autosave layout vào `SdStorageService` mỗi lần commit, và restore khi khởi tạo (qua `reconcile`). |
| `snapThreshold` | `number` | `0.5` | `transform: numberAttribute`. Panel `collapsible` kéo dưới `minSize × snapThreshold` (px) → snap collapse. |
| `keyboardStep` | `number` | `10` | `transform: numberAttribute`. Số px mỗi lần nhấn phím mũi tên trên handle. |

## `<sd-splitter>` Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `resizeEnd` | `output<SplitterLayoutState>` | Emit khi kết thúc 1 thao tác drag (pointerup / keyboard commit). Mang layout đã commit. |
| `collapsedChange` | `output<{ panelId: string \| number; collapsed: boolean }>` | Emit khi trạng thái collapsed của 1 panel đổi (diff với map trước). 1 event / panel đổi. |
| `layoutChange` | `output<SplitterLayoutState>` | Emit mỗi khi `committedLayout` đổi (commit, không phải live drag). |

> Live drag **không** emit — chỉ mutate `liveSizes`. Một `commit()` (cuối drag / toggle / API) mới snapshot + emit + lưu storage.

## `<sd-splitter>` Imperative API
Lấy ref qua `viewChild`/`@ViewChild`.
| Method | Signature | Notes |
| --- | --- | --- |
| `getLayout()` | `(): SplitterLayoutState` | Snapshot hiện tại (live sizes + collapsed). |
| `setLayout(state)` | `(state: SplitterLayoutState): void` | Áp layout; chỉ nhận panel khớp `id` **và** `unit`. Commit sau khi áp. |
| `resetLayout()` | `(): void` | Về `declaredSize` + bỏ collapse mọi panel. |
| `collapse(target)` | `(target: number \| string): void` | `target` = panelId (string) hoặc index (number). |
| `expand(target)` | `(target: number \| string): void` | Restore `lastSize → minSize → declaredSize`. |
| `toggle(target)` | `(target: number \| string): void` | Lật collapse. |
| `resizePanel(target, size)` | `(target, size: number): void` | Set size 1 panel, clamp `[minSize, maxSize]`. |

## `<sd-splitter-panel>` Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `panelId` | `string \| undefined` | `undefined` | Định danh ổn định để match storage / API. Không có → fallback dùng index (kém ổn định khi thêm/bớt panel). |
| `size` | `number` | `1` | `transform: numberAttribute`. `px` → số pixel; `flex` → weight. |
| `unit` | `SplitterPanelUnit` (`'px' \| 'flex'`) | `'flex'` | `px` = bề rộng/cao cố định; `flex` = chia phần còn lại theo weight (grow normalize sum = 1). |
| `minSize` | `number` | `0` | `transform: numberAttribute`. Cùng đơn vị với `unit`. Dùng cho clamp + ngưỡng snap. |
| `maxSize` | `number \| undefined` | `undefined` | Empty/null → không giới hạn. |
| `collapsible` | `boolean` | `false` | `transform: booleanAttribute`. Cho phép snap-to-collapse + dblclick/keyboard toggle. |
| `collapsed` | `model<boolean>` | `false` | Two-way. Đồng bộ với state collapse. |
| `resizable` | `boolean` | `true` | `transform: booleanAttribute`. `false` → handle kề panel này bị disable. |

## Interactions
- **Drag** handle: kéo bằng pointer (chuột trái / touch / pen). Batch qua `requestAnimationFrame`.
- **Double-click** handle: toggle panel `collapsible` (ưu tiên panel phía trước, fallback phía sau).
- **Keyboard** (handle focus): `←/→` (horizontal) hoặc `↑/↓` (vertical) dịch `keyboardStep` px; `Enter`/`Space` toggle.
- **Snap-to-collapse**: panel `collapsible` kéo dưới `minSize × snapThreshold` → tự collapse (lưu `lastSize` để expand lại).

## Types (exported)
```ts
type SplitterOrientation = 'horizontal' | 'vertical';
type SplitterPanelUnit = 'px' | 'flex';

interface SplitterPanelState { id: string | number; size: number; unit: SplitterPanelUnit; collapsed: boolean; }
interface SplitterLayoutState { v: 1; panels: SplitterPanelState[]; }
```
> `ResolvedPanelMeta` là internal — không export.

## Example
```html
<sd-splitter orientation="horizontal" storageKey="master-detail" (resizeEnd)="onResize($event)">
  <sd-splitter-panel panelId="list" size="320" unit="px" minSize="200" collapsible>
    <app-list />
  </sd-splitter-panel>
  <sd-splitter-panel panelId="detail" size="1" minSize="0.3">
    <app-detail />
  </sd-splitter-panel>
</sd-splitter>
```

## Notes / gotchas
- **Drag delta tracking dùng delta THỰC ÁP**, không phải dịch chuyển con trỏ thô. `#onDragMove` cộng dồn giá trị `applyDelta()` trả về (`#dragLastDelta += applied`). Nếu cộng raw pointer delta, phần overshoot (kéo quá mép / quá min / qua collapse) sẽ tích lũy thành **dead-zone**: phải kéo ngược đúng bằng overshoot mới thấy handle nhúc nhích → triệu chứng "kéo tới cuối không kéo về được". Việc trả `0` từ nhánh collapsed cũng nhờ cơ chế này mà cho phép kéo chậm tích lũy đủ `minSize` để expand.
- `flex` panel: grow được normalize `weight / totalWeight` để sum = 1 (tránh flexbox để trống rìa).
- `px` panel collapsed → `flex: 0 0 0`. Khi tất cả flex panel collapsed, `totalFlexWeight = 0` được bảo vệ bằng `NEAR_ZERO` (tránh chia 0).
- Storage chỉ restore khi `unit` khớp — đổi `unit` của panel trong template = bỏ qua giá trị lưu, về `declaredSize`.
- Handle nằm ngoài Angular debug tree (tạo qua `createComponent`) → trong test query bằng native DOM (`querySelector('sd-splitter-handle')`).

## Tests
- `splitter-state.service.spec.ts` — unit: applyDelta (flex/px/mix), clamp min/max, snap, collapse/expand, reconcile.
- `splitter.component.spec.ts` — component wiring.
- `splitter-handle.component.spec.ts`, `splitter-panel.component.spec.ts` — child units.
- `splitter.integration.spec.ts` — drag, snap, storage roundtrip, nested, **overshoot dead-zone (ngang + dọc)**, **snap rồi kéo ngược chậm → expand**.
- Chạy: `npx ng test sd-angular --watch=false --browsers=ChromeHeadless --include='projects/sd-angular/components/splitter/src/splitter.integration.spec.ts'`
