# SDCoreJS Agent Profile / Hồ sơ Agent SDCoreJS

This folder describes the SDCoreJS agent profile for VS Code Chat.
Thư mục này mô tả profile agent SDCoreJS dùng cho VS Code Chat.

## Files / Tệp
- .github/chatmodes/sdcorejs.chatmode.md
- .github/prompts/sdcorejs-angular-portal.prompt.md
- .github/prompts/sdcorejs-angular-portal-claude-github.prompt.md
- .github/prompts/sdcorejs-angular-portal-smoke-tests.prompt.md
- .github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md
- agents/sdcorejs/SMOKE-TEST.md
- agents/sdcorejs/SMOKE-TEST.vi.md
- agents/sdcorejs/HANDOFF-YYYY-MM-DD.md

## Daily Handoff Rule

- Always create a new handoff file by date (`HANDOFF-YYYY-MM-DD.md`).
- Do not append new day updates into previous handoff files.

## Usage in VS Code Chat / Cách dùng trong VS Code Chat
1. Open Chat. / Mở Chat.
2. Select chat mode named SDCoreJS if your VS Code supports custom chat modes.
   Chọn chat mode SDCoreJS nếu VS Code của bạn hỗ trợ custom chat modes.
3. Start with a request such as: / Bắt đầu với yêu cầu ví dụ:
   - Create CRUD screens for product with code, name, price.
4. The agent should ask module name if missing.
   Agent phải hỏi tên module nếu bạn chưa cung cấp.
5. If module does not exist, it should create module first.
   Nếu module chưa tồn tại, agent phải tạo module trước.

## Fallback if chat mode is not shown / Dự phòng khi không thấy chat mode
Meaning of "fallback prompts":
- EN: Predefined prompt files you can paste into Chat when SDCoreJS mode is not available.
- VI: Các file prompt soạn sẵn để dán vào Chat khi không thấy mode SDCoreJS.

Use prompt files manually / Dùng prompt thủ công:
- Open .github/prompts/sdcorejs-angular-portal.prompt.md
- Or open .github/prompts/sdcorejs-angular-portal-claude-github.prompt.md (for Claude Code + GitHub links)
- Replace {{input}} with your request / Thay {{input}} bằng yêu cầu của bạn
- Send to Chat / Gửi vào Chat

## Cross-Model Setup (Claude Code / Gemini / Codex)
## Thiết lập đa mô hình (Claude Code / Gemini / Codex)

Use one shared prompt contract to reduce behavior drift between models.
Dùng một prompt contract thống nhất để giảm lệch hành vi giữa các mô hình.

Required contract / Contract bắt buộc:
- Same pipeline: request intake -> module resolve -> module init -> CRUD -> refine
- Same blocking clarification: missing module must be asked first
- Same defaults: vague fields -> minimal CRUD; no API contract -> localStorage mock CRUD
- Same guardrails: do not touch global CSS/SCSS; prefer Core UI first
- Same source-of-truth: use internal starter baseline in `core/templates/angular-portal-starter` (no sibling workspace template reads)

### Claude Code with direct GitHub link
### Claude Code với link GitHub trực tiếp

You can paste repository links directly in Claude Code prompt so it can follow the same skills.
Bạn có thể dán link repository trực tiếp vào prompt Claude Code để bám cùng bộ skills.

Recommended links / Link khuyến nghị:
- Skills root: https://github.com/sdcorejs/sdcorejs-agent/tree/main/skills/angular-portal
- Main guide: https://github.com/sdcorejs/sdcorejs-agent/blob/main/skills/angular-portal/README.md
- Intake skill: https://github.com/sdcorejs/sdcorejs-agent/blob/main/skills/angular-portal/angular-request-intake-skill.md

Paste this in Claude Code / Dán khối này vào Claude Code:

```text
Use SDCoreJS Angular Portal rules from:
1) https://github.com/sdcorejs/sdcorejs-agent/tree/main/skills/angular-portal
2) https://github.com/sdcorejs/sdcorejs-agent/blob/main/skills/angular-portal/README.md

Mandatory behavior:
- Ask module first if missing
- If module not exists: create module first
- If fields are vague: create minimal CRUD skeleton first
- No API contract: use localStorage mock CRUD first
- For portal init: use internal baseline templates at core/templates/angular-portal-starter
- Ensure src/libs/sample scaffold exists with seeded employee and product entities
- Keep @sd-angular/core as npm version string from internal baseline (never file:*.tgz)
- Do not generate app/features placeholder pages (home/about) in starter mode
- Do not modify global CSS/SCSS
- Prefer Core UI first, warn when custom UI is used

Output format:
1) Resolved Context
2) Planned Skill Chain
3) Files To Create/Update
4) Post-Gen Double Check

My request:
{{input}}
```

## Teammate Quick Start (Share GitHub Link Only)
## Khởi động nhanh cho đồng nghiệp (chỉ cần gửi link GitHub)

After cloning this repo and opening VS Code Chat, teammates should do exactly these steps.
Sau khi clone repo và mở VS Code Chat, đồng nghiệp làm đúng 2 bước sau:

1. Use fallback prompts from / Dùng prompt dự phòng từ:
   - .github/prompts/sdcorejs-angular-portal.prompt.md
   - .github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md
2. Add scope constraints in every prompt / Thêm ràng buộc phạm vi trong mọi prompt:
   - Only read rules from: sdcorejs-agent/skills/angular-portal
   - Only create or edit files in their portal repository
   - Chỉ đọc rule từ: sdcorejs-agent/skills/angular-portal
   - Chỉ tạo hoặc sửa file trong repo portal của họ

## Quick Copy Prompt / Prompt Copy Nhanh

Copy the block below and paste into VS Code Chat.
Sao chép toàn bộ khối dưới đây và dán vào VS Code Chat.

```text
You are SDCoreJS agent for Angular Portal.
Bạn là SDCoreJS agent cho Angular Portal.

Use fallback prompts and rules from this repository.
Dùng fallback prompts và rules từ repository này.

Scope constraints (required):
1) Only read rules from: sdcorejs-agent/skills/angular-portal
2) Only create or edit files in my portal repository

Ràng buộc phạm vi (bắt buộc):
1) Chỉ đọc rules từ: sdcorejs-agent/skills/angular-portal
2) Chỉ tạo hoặc sửa file trong repo portal của tôi

Process rules:
- If module is missing, ask me first.
- If module does not exist, create module first, then generate entity CRUD.
- If fields are vague, generate minimal CRUD skeleton first, then refine.

Quy tắc xử lý:
- Nếu thiếu module thì hỏi lại trước.
- Nếu module chưa tồn tại thì tạo module trước, sau đó mới sinh CRUD entity.
- Nếu field còn mơ hồ thì tạo skeleton CRUD tối thiểu trước, rồi refine sau.

My request / Yêu cầu của tôi:
{{input}}
```

## Quick Copy Prompt (Smoke Test) / Prompt Copy Nhanh (Smoke Test)

Copy one block below into VS Code Chat, then replace only {{input}}.
Sao chép một block dưới đây vào VS Code Chat, sau đó chỉ thay {{input}}.

```text
You are SDCoreJS agent for Angular Portal smoke testing.
Bạn là SDCoreJS agent cho kiểm thử nhanh Angular Portal.

Scope constraints (required):
1) Only read rules from: sdcorejs-agent/skills/angular-portal
2) Only create or edit files in my portal repository

Ràng buộc phạm vi (bắt buộc):
1) Chỉ đọc rules từ: sdcorejs-agent/skills/angular-portal
2) Chỉ tạo hoặc sửa file trong repo portal của tôi

Expected behavior checks:
- Ask module first when module is missing
- If module does not exist, create module first
- Keep minimal CRUD skeleton when fields are vague
- Prefer side-drawer for common 5-6 fields
- Prefer full-page for complex workflow + include detail/list actions

Tiêu chí hành vi cần kiểm tra:
- Thiếu module thì phải hỏi lại trước
- Module chưa tồn tại thì phải tạo module trước
- Field mơ hồ thì sinh skeleton CRUD tối thiểu
- Form thường 5-6 field thì ưu tiên side-drawer
- Workflow phức tạp thì ưu tiên full-page + đủ action detail/list

Test case prompt / Prompt test:
{{input}}
```

Recommended inputs / Gợi ý input:
1) Tạo CRUD product với các field code, name, price.
2) Tạo màn hình customer. Hiện chưa có module phù hợp, hãy tạo mới giúp mình.
3) Tạo CRUD order trong module sales. Field để mình bổ sung sau.
4) Tạo màn hình detail supplier với 6 field: code, name, phone, email, status, note.
5) Tạo màn hình purchase request trong module procurement; cần submit/approve/reject và bulk actions.

## Smoke test / Kiểm thử nhanh
- Run prompt pack: .github/prompts/sdcorejs-angular-portal-smoke-tests.prompt.md
- Evaluate results with checklist: agents/sdcorejs/SMOKE-TEST.md
- Chạy bộ prompt: .github/prompts/sdcorejs-angular-portal-smoke-tests.prompt.md
- Đối chiếu kết quả với checklist: agents/sdcorejs/SMOKE-TEST.md

## Smoke test (Vietnamese) / Smoke test (Tiếng Việt)
- Run prompt pack: .github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md
- Evaluate results with checklist: agents/sdcorejs/SMOKE-TEST.vi.md
