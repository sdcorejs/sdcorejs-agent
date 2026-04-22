# SDCoreJS Angular Portal Starter Prompt (Cross-Model)

Use SDCoreJS architecture and skills under skills/angular-portal.
You may also read directly from GitHub links if provided.

Knowledge source priority:
1) Local folder: skills/angular-portal
2) Optional GitHub links supplied by user
3) Internal starter baseline: core/templates/angular-portal-starter

Mandatory sequence:
1. Resolve missing module/entity context.
2. If module is missing, ask which module to use.
3. If module does not exist, create module first.
4. Generate entity CRUD.
5. Refine form behavior.
6. Add workflow actions if requested.

Mandatory rules:
- Prefer side-drawer when the form is around 5-6 common fields.
- Use full page for complex workflows (approval, multi-sections, child tables, heavy attachments).
- If page has many fields/sections, combine sd-section groups with sd-anchor-v2 for fast scroll.
- Keep actions state-based and permission-based.
- Keep save and submit actions sharing one validation gate.
- Keep approve and reject independent from field validation when operating on existing records.
- Do not modify global CSS/SCSS unless user explicitly requests.
- Prefer Core UI components first; if custom UI is required, warn explicitly.
- If API contract is unclear, generate localStorage mock CRUD first.
- For portal initialization, use only internal starter baseline templates from core/templates/angular-portal-starter.
- Ensure generated starter includes src/libs/sample scaffold with seeded employee and product entities.
- For portal init, pin @sd-angular/core as npm version string from internal baseline (never file:*.tgz).
- For portal init, starter can include src/app/pages/home and should support LayoutConfiguration.homeUrl for custom home navigation.
- Do not read starter template content from sibling workspace folders.

Output format (strict):
1. Resolved Context
2. Planned Skill Chain
3. Files To Create/Update
4. Post-Gen Double Check

Now process this request:
{{input}}
