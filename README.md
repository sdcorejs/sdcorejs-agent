
Start building Angular portal modules with @sd-angular/core.

**Key resources:**
- [Angular Portal Skills](skills/angular-portal/) - Entity CRUD, Module Configuration, Forms
- [Angular Portal README](skills/angular-portal/README.md) - Architecture overview and examples
- [Copilot Instructions](.github/copilot-instructions.md) - Agent guidelines and patterns
- [Agents](agents/README.md) - Module orchestrators (to be implemented)

## CLI Quick Commands

This repository now exposes a CLI command alias: `sd-agent`.

- Local run from this repo:
	- `npx --yes --package file:. sd-agent skills list`
	- `npx --yes --package file:. sd-agent skills path`
- Build package preview:
	- `npm run build`
- Publish to npm (public):
	- `npm run publish:npm`

After publishing `@sdcorejs/agent`, users can run:
- `npx @sdcorejs/agent skills list`
- `npx @sdcorejs/agent skills path`

## Teammate Chat Onboarding (Quick)
## Onboarding Đồng Nghiệp (Nhanh)

After cloning this repository, teammates can use VS Code Chat immediately with fallback prompts:
Sau khi clone repository này, đồng nghiệp có thể dùng VS Code Chat ngay với fallback prompts.

Meaning of fallback prompts / Nghĩa của fallback prompts:
- EN: Prepared prompt files used when SDCoreJS chat mode is not visible.
- VI: Các file prompt chuẩn bị sẵn, dùng khi không thấy SDCoreJS chat mode.

1. Use prompt files:
- .github/prompts/sdcorejs-angular-portal.prompt.md
- .github/prompts/sdcorejs-angular-portal-claude-github.prompt.md
- .github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md

1. Dùng các file prompt:
- .github/prompts/sdcorejs-angular-portal.prompt.md
- .github/prompts/sdcorejs-angular-portal-claude-github.prompt.md
- .github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md

2. Add these scope constraints in every prompt:
- Only read rules from: sdcorejs-agent/skills/angular-portal
- For portal init, use starter baseline only from: sdcorejs-agent/core/templates/angular-portal-starter
- Only create or edit files in their portal repository

2. Thêm ràng buộc phạm vi trong mọi prompt:
- Chỉ đọc rules từ: sdcorejs-agent/skills/angular-portal
- Khi khởi tạo portal, chỉ dùng baseline từ: sdcorejs-agent/core/templates/angular-portal-starter
- Chỉ tạo hoặc sửa file trong repo portal của họ

Reference guide:
- agents/sdcorejs/README.md

## Repository Maintenance Rule

Any task that edits files inside `sdcorejs-agent` must also write or update the current-day handoff in `agents/sdcorejs/HANDOFF-YYYY-MM-DD.md` before the task is considered complete.

Minimum handoff content:
- session focus
- changed files or affected areas
- verification status or remaining blockers

## Quick Start: CLI + Chat Integration

After `npm i @sdcorejs/agent -g`, use these commands to integrate with VS Code Chat:

### 1. Portal Initialization
```bash
sd-agent chat portal
```
→ Prints prompt. Copy into Chat and replace `{{input}}`:
```
Khởi tạo portal-myapp với dev, qc, uat, prod
```

### 2. Module Creation
```bash
sd-agent chat module
```
→ Prints prompt. Copy into Chat and replace `{{input}}`:
```
Tạo module sales cho portal
```

### 3. Entity CRUD Generation
```bash
sd-agent chat entity
```
→ Prints prompt. Copy into Chat and replace `{{input}}`:
```
Thêm entity product vào module catalog, các field: code, name, price, category, stock, status
```

### Full Workflow Example

```bash
# 1. Initialize portal
sd-agent chat portal
# → Copy prompt → Chat → "Khởi tạo portal-shop với dev, qc, uat, prod"

# 2. Create module
sd-agent chat module
# → Copy prompt → Chat → "Tạo module catalog cho portal"

# 3. Add entity
sd-agent chat entity
# → Copy prompt → Chat → "Thêm entity product vào module catalog"

# 4. Continue refining in Chat
# ...user feedback on UI, validation, workflow...
```

### Useful CLI Commands
```bash
sd-agent skills list       # List all skill groups
sd-agent skills path       # Print path to skills folder
sd-agent help             # Show all commands
```

## Using VS Code Chat Mode

If your VS Code supports custom chat modes:
1. Open Chat
2. Select **SDCoreJS** mode (should auto-load from `.github/chatmodes/sdcorejs.chatmode.md`)
3. Start with:
   - "Khởi tạo portal-myapp"
   - "Thêm entity khách hàng"
   - "Tạo workflow approval"

---
sdcorejs-agent/
├── .github/
│   └── copilot-instructions.md     # Agent configuration and guidelines
├── skills/                          # Modular code generation skills
│   ├── angular-portal/              # Angular portal skills (@sd-angular/core → @sdcorejs/angular)
│   │   ├── angular-entity-crud-skill.md
│   │   ├── angular-module-configuration-skill.md
│   │   ├── angular-reactive-form-skill.md
│   │   ├── INDEX.md
│   │   └── README.md
│   ├── nestjs/                      # NestJS backend skills (to be added)
│   ├── shared/                      # Shared utilities & validators (to be added)
│   └── README.md
├── agents/                          # High-level orchestrators
│   ├── angular-portal-agent/        # Angular portal module generation
│   ├── nestjs-agent/                # NestJS module generation
│   └── full-stack-agent/            # Complete full-stack generation
├── core/                            # Shared utilities & interfaces
│   ├── utilities/
│   ├── interfaces/
│   ├── validators/
│   └── templates/
└── README.md                        # This file
```
sdcorejs-agent is an AI-powered coding agent designed to generate backend and frontend code following a strict, opinionated architecture.

It transforms natural language requirements into structured, production-ready modules by combining:
- Architecture-aware planning
- Modular skill system
- Code generation with templates
- Tool-based execution (file system, validation, etc.)

The agent is optimized for:
- NestJS backend (controller → service → repository)
- Angular frontend with sdcorejs UI system
- Scalable, maintainable enterprise architecture

Example:
"Build product module with name, price and validation"

→ Automatically generates:
- Entity
- SaveReq/DTOs (create/update with validation)
- Repository
- Service
- Controller