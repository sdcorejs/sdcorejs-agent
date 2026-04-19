
Start building Angular portal modules with @sd-angular/core.

**Key resources:**
- [Angular Portal Skills](skills/angular-portal/) - Entity CRUD, Module Configuration, Forms
- [Angular Portal README](skills/angular-portal/README.md) - Architecture overview and examples
- [Copilot Instructions](.github/copilot-instructions.md) - Agent guidelines and patterns
- [Agents](agents/README.md) - Module orchestrators (to be implemented)

## Teammate Chat Onboarding (Quick)
## Onboarding Đồng Nghiệp (Nhanh)

After cloning this repository, teammates can use VS Code Chat immediately with fallback prompts:
Sau khi clone repository này, đồng nghiệp có thể dùng VS Code Chat ngay với fallback prompts.

Meaning of fallback prompts / Nghĩa của fallback prompts:
- EN: Prepared prompt files used when SDCoreJS chat mode is not visible.
- VI: Các file prompt chuẩn bị sẵn, dùng khi không thấy SDCoreJS chat mode.

1. Use prompt files:
- .github/prompts/sdcorejs-angular-portal.prompt.md
- .github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md

1. Dùng các file prompt:
- .github/prompts/sdcorejs-angular-portal.prompt.md
- .github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md

2. Add these scope constraints in every prompt:
- Only read rules from: sdcorejs-agent/skills/angular-portal
- Only create or edit files in their portal repository

2. Thêm ràng buộc phạm vi trong mọi prompt:
- Chỉ đọc rules từ: sdcorejs-agent/skills/angular-portal
- Chỉ tạo hoặc sửa file trong repo portal của họ

Reference guide:
- agents/sdcorejs/README.md
```
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