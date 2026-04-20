# Skills

Modular skill system for code generation. Each skill is responsible for generating specific code patterns following sdcorejs architecture.

## 🎯 Skill Categories

### Angular Portal (`@sd-angular/core` → future: `@sdcorejs/angular`)
**Location:** [angular-portal/](angular-portal/)

Skills for building enterprise Angular applications with SDCore components.

**Available Skills:**
1. [Request Intake and Module Resolution](angular-portal/angular-request-intake-skill.md) - Resolve missing module and generation order
1. [Entity CRUD Module](angular-portal/angular-entity-crud-skill.md) - Generate CRUD modules
2. [Feature Module Configuration](angular-portal/angular-module-configuration-skill.md) - Set up module infrastructure
3. [Reactive Forms](angular-portal/angular-reactive-form-skill.md) - Build validated forms

**Quick Links:**
- [Angular Portal README](angular-portal/README.md) - Overview and integration guide
- [Angular Portal INDEX](angular-portal/INDEX.md) - Detailed skill reference

---

### NestJS Backend

*(To be implemented)*

- `nestjs-controller-skill/` - Generate NestJS controllers
- `nestjs-service-skill/` - Generate NestJS services
- `nestjs-entity-skill/` - Generate database entities
- `nestjs-dto-skill/` - Generate DTOs with validation

---

### Shared Utilities

*(To be implemented)*

- `validation-rules/` - Common validation patterns
- `naming-conventions/` - Project naming standards

---

## 📝 Adding New Skills

### Process

1. **Create skill file** with naming pattern: `[framework]-[feature]-skill.md`
2. **Follow strict format:**
  - Skill Name
  - Description
  - Rules (MUST DO ✅ / MUST NOT ❌)
  - Template
  - Example Input
  - Example Output
  - Implementation Checklist

3. **Base on existing code** - Extract patterns from real implementations
4. **Test thoroughly** - Ensure all examples work
5. **Document in category README** - Add reference to category index

### Skill File Template

```markdown
# [Framework] Skill: [Skill Name]

## 1. Skill Name
**[Clear Name]**

## 2. Description
What this skill does

## 3. Rules
- MUST DO ✅
- MUST NOT ❌

## 4. Template
Provide code template

## 5. Example Input
Natural language instruction

## 6. Example Output
Complete code generated

## Implementation Checklist
[ ] Verification items
```

---

## 🔗 Integration with Agents

Skills are orchestrated by agents in the `../agents/` folder.

**Example:** `angular-portal-agent` combines:
1. Feature Module Configuration Skill
2. Entity CRUD Module Skill (multiple times)
3. Reactive Form Skill (customizations)

---

## ✅ Quality Standards

✅ Type-safe TypeScript code  
✅ Follows project conventions  
✅ Includes error handling  
✅ Proper dependency injection  
✅ Clear separation of concerns  
✅ RESTful API design (backend)  
✅ Reactive patterns (Angular)  
✅ Comprehensive examples  
✅ Implementation checklist  
✅ Based on existing code patterns  

---

## 📖 References

- [Main README](../README.md) - Project overview
- [Copilot Instructions](../.github/copilot-instructions.md) - Agent guidelines
- [Core Utilities](../core/README.md) - Shared helpers
- [Agents](../agents/README.md) - Agent orchestrators

