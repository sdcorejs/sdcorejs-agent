- Portal starter extracted from portal-template should remove all src/libs feature routes and tsconfig paths.
- Keep @sd-angular/core integration via main.ts providers and MainComponent using SdLayoutComponent.
- For starter example routes, prefer plain Angular standalone pages with RouterLink instead of extra core UI components; this avoided compile issues with beta.71 starter verification.
- Verified starter package version: @sd-angular/core 19.0.0-beta.73 (npm registry).
- Verified flow: npm install, npm run build-dev, npm start, /home and /about both render.

- tsconfig hygiene: omit compilerOptions.baseUrl by default in starter repos unless local absolute imports require it (e.g., src/... or app/... resolution).

## CLI Integration Status (2026-04-22)

✅ CLI fully operational with Chat integration:
- Commands: chat portal|module|entity, portal|module|entity init [name]
- Workflow: sd-agent chat portal -> copy -> paste in Chat -> replace {{input}}
- Verified: All 6 commands tested locally, prompt loading works
- Commit: 14d4d3f with full integration
- Next: User creates @sdcorejs org on npmjs.com, then `npm publish`
