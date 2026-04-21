# Angular Portal Starter Baseline (Internal)

This baseline is the single source of truth for initializing a new portal repo.

## Independence Rule
- Do not read or depend on sibling workspace folders.
- Do not infer starter versions from external projects.
- Use only files in this template folder for starter defaults.

## Required Starter Artifacts
1. package template: package.template.json
2. tsconfig template: tsconfig.template.json
3. structure baseline: structure.txt
4. sample scaffold under src/libs/sample
5. seeded sample entities: employee + product

## Generation Contract
- Keep folder organization compatible with module/entity generation under src/libs.
- Keep package versions aligned with this baseline unless developer explicitly requests a different version.
- Resolve `@sd-angular/core` version from npm package versions and store as normal semver string (not local `file:*.tgz`).
- Keep compilerOptions.baseUrl omitted by default. Only add it if absolute local imports require it.
- Exclude AI/tooling-local folders from rendered starter output: `.claude`, `.github`, `.git`, `.vscode-test`.
- Exclude placeholder files from rendered starter output: `.gitkeep` under `src/libs/**`.
