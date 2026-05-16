# Agents

High-level agents that orchestrate multiple skills to generate complete code structures.

## Available Agents

### angular-module-agent
Generates complete Angular feature modules with:
- Components (pages, side-drawers, etc.)
- Services
- Models/Interfaces
- Routing configuration
- Module definition

### nestjs-module-agent
Generates complete NestJS modules with:
- Controllers
- Services
- Entities
- DTOs
- Repository pattern

### full-stack-agent
Generates both backend (NestJS) and frontend (Angular) modules simultaneously, ensuring API contract alignment.

## Agent Activation

Agents are activated through Copilot instructions or direct agent invocation.

## Adding New Agents

1. Create a folder with agent name
2. Define agent structure and responsibilities
3. Map to required skills
4. Document input/output contracts
