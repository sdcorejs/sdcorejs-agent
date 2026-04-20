# SDCoreJS Agent Release Checklist

## 1. Scope Lock

- [ ] Confirm this release scope is Angular Portal skills only.
- [ ] Confirm no out-of-scope framework changes are included.
- [ ] Confirm target release version and tag name are decided.

## 2. Skills Consistency

- [ ] Review [skills/angular-portal/README.md](skills/angular-portal/README.md) for latest pipeline and guardrails.
- [ ] Review [skills/angular-portal/INDEX.md](skills/angular-portal/INDEX.md) to ensure summary matches detailed skills.
- [ ] Confirm request-intake rules in [skills/angular-portal/angular-request-intake-skill.md](skills/angular-portal/angular-request-intake-skill.md).
- [ ] Confirm CRUD rules in [skills/angular-portal/angular-entity-crud-skill.md](skills/angular-portal/angular-entity-crud-skill.md), including mock-first and layout variants.
- [ ] Confirm portal-init rules in [skills/angular-portal/angular-portal-project-init-skill.md](skills/angular-portal/angular-portal-project-init-skill.md), including tsconfig baseUrl hygiene.

## 3. Prompt and Model Compatibility

- [ ] Validate cross-model starter prompt in [.github/prompts/sdcorejs-angular-portal.prompt.md](.github/prompts/sdcorejs-angular-portal.prompt.md).
- [ ] Validate Claude GitHub-link prompt in [.github/prompts/sdcorejs-angular-portal-claude-github.prompt.md](.github/prompts/sdcorejs-angular-portal-claude-github.prompt.md).
- [ ] Confirm onboarding docs include the Claude prompt in [agents/sdcorejs/README.md](agents/sdcorejs/README.md).
- [ ] Confirm top-level onboarding references prompts in [README.md](README.md).

## 4. Smoke Tests

- [ ] Run EN smoke prompt pack: [.github/prompts/sdcorejs-angular-portal-smoke-tests.prompt.md](.github/prompts/sdcorejs-angular-portal-smoke-tests.prompt.md).
- [ ] Run VI smoke prompt pack: [.github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md](.github/prompts/sdcorejs-angular-portal-smoke-tests.vi.prompt.md).
- [ ] Evaluate EN results with [agents/sdcorejs/SMOKE-TEST.md](agents/sdcorejs/SMOKE-TEST.md).
- [ ] Evaluate VI results with [agents/sdcorejs/SMOKE-TEST.vi.md](agents/sdcorejs/SMOKE-TEST.vi.md).
- [ ] Confirm TC06 pass: portal-init output does not keep unnecessary compilerOptions.baseUrl.

## 5. Release Artifacts

- [ ] Finalize handoff notes in [agents/sdcorejs/HANDOFF-2026-04-20.md](agents/sdcorejs/HANDOFF-2026-04-20.md).
- [ ] Update changelog or release note summary from this checklist result.
- [ ] Review git diff and confirm no accidental workspace-specific content is included.
- [ ] Create release commit and tag.
- [ ] Publish release note with links to prompts, smoke tests, and handoff.

## 6. Quick Commands

- [ ] Run: git status --short
- [ ] Run: git diff --stat
- [ ] Run: rg "baseUrl|Cross-Model|localStorage mock CRUD" skills .github agents README.md
