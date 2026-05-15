# Core Version (Single Source of Truth)

Use this file as the only place to update `@sd-angular/core` version for angular-portal skills.

- package: `@sd-angular/core`
- currentVersion: `19.0.0-beta.73`
- policy: npm registry version only (do not use local tgz `file:sd-angular-core-*.tgz`)

## Upgrade Procedure

1. Update `currentVersion` in this file.
2. Ensure baseline template package metadata aligns with this version.
3. Update any version examples that intentionally show a concrete value.
4. Run starter verification: `npm install`, `npm run build-dev`, `npm start`, `npm run test -- --watch=false`.
