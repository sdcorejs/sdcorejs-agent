# SDCoreJS Angular Portal Starter Prompt

Use SDCoreJS architecture and skills under skills/angular-portal.

Follow this sequence:
1. Resolve missing module/entity context.
2. If module is missing, ask me which module to use.
3. If module does not exist, create module first.
4. Generate entity CRUD.
5. Refine form behavior.
6. Add workflow actions if requested.

Rules:
- Prefer side-drawer when the form is around 5-6 common fields.
- Use full page for complex workflows (approval, multi-sections, child tables, heavy attachments).
- Keep actions state-based and permission-based.
- Keep save and submit actions sharing one validation gate.
- Keep approve and reject independent from field validation when operating on existing records.

Now process this request:
{{input}}
