---
updated_at: 2026-06-22T23:13:04+07:00
status: in_progress
track: git
active_skill: sdcorejs-git, verification-before-completion
branch: chore/frontend-skill-review-rules
---

# Current Session Checkpoint

## User Request
Tạo branch, commit, push các thay đổi skill/review rule đã verify, rồi tạo PR hoặc báo blocker xác thực nếu không thể tạo PR.

## Tasks
- [x] Kiểm tra worktree, remote và GitHub CLI
- [x] Tạo branch mới từ `main`
- [ ] Stage/commit các thay đổi đã verify
- [ ] Push branch lên `origin`
- [ ] Tạo PR hoặc báo blocker xác thực rõ ràng

## Current State
- Last completed: Created branch `chore/frontend-skill-review-rules`.
- In progress: Staging explicit changed paths and committing.
- Blocked/skipped: `gh auth status` reports GitHub CLI is not logged in; PR creation may require user auth.

## Artifacts Touched
- EDIT .sdcorejs/tasks/current-session.md - checkpoint for this request
- EDIT skills/tracks/angular/sdcorejs-angular.md - Service contract/API/ViewModel rules for Angular generation
- EDIT _refs/angular/write-code/init-entity.md - field ownership and mapper rules for entity generation
- EDIT _refs/angular/templates/entity-skeleton.md - model/service template boundary guidance
- EDIT _refs/angular/templates/orchestrator-step-examples.md - scaffold DTO wording corrected
- EDIT _refs/angular/templates/example-product.md - example DTO/service boundary guidance
- EDIT _refs/angular/write-code/admin-screens.md - UI-only admin tree/matrix fields stay in ViewModels
- EDIT _refs/angular/review-code.md - review checklist/severity/positive rows for Service contract boundary
- EDIT skills/tracks/nextjs/sdcorejs-nextjs.md - Next.js data contract/ViewModel rules
- EDIT _refs/nextjs/build-website/review-code.md - review checklist for route/action/fetcher contracts
- EDIT _refs/nextjs/build-website/write-code/contact-form.md - payload/response/provider/UI-state contract split
- EDIT _refs/nextjs/build-website/write-code/pages-and-blocks.md - content loader to section prop boundary
- EDIT .claude/*, codex/skills/*, plugin/* - synced mirrors from source refs/skills
- GIT branch chore/frontend-skill-review-rules - branch created for commit/PR

## Verification
- PASS npm run sync:skills
- PASS npm run check:skills
- PASS npm run test (12/12 node --test e2e)
- PASS git diff --check (only LF/CRLF warning for `.cursor/rules/sdcorejs-agent.mdc`)
- PASS targeted presence probe for Service/API/ViewModel boundary wording across source and mirrors
- PASS forbidden wording probe: no raw-API equality wording found
- PENDING post-branch verification before push/PR

## Resume From Here
Stage explicit paths, commit, run fresh verification, push branch, then create PR or provide compare URL if `gh` auth blocks PR creation.
