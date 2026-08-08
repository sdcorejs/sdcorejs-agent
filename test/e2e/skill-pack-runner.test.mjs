import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { dispatchPrompt, loadSkillPack, runPromptEval } from './support/skill-pack-runner.mjs';

async function listMarkdownLikeFiles(rootUrl, relativeDir) {
  const dirUrl = new URL(`${relativeDir}/`, rootUrl);
  const entries = await readdir(dirUrl, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = `${relativeDir}/${entry.name}`;
      if (entry.isDirectory()) return listMarkdownLikeFiles(rootUrl, entryPath);
      return entry.isFile() && /\.(md|mdc)$/.test(entry.name) ? [entryPath] : [];
    })
  );
  return nested.flat().sort();
}

function findUnclosedMarkdownFence(text) {
  let open = null;
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(/^([`~]{3,})([^`~]*)$/);
    if (!match) continue;

    const fence = match[1];
    const marker = fence[0];
    const length = fence.length;
    if (!open) {
      open = { marker, length, line: index + 1, text: lines[index] };
    } else if (marker === open.marker && length >= open.length) {
      open = null;
    }
  }
  return open;
}

function execFileResult(file, args, options = {}) {
  return new Promise((resolve) => {
    execFile(file, args, { encoding: 'utf8', ...options }, (error, stdout, stderr) => {
      resolve({
        code: error?.code ?? 0,
        stdout,
        stderr,
      });
    });
  });
}

function blockCommentFirstMatch(source, pattern, description) {
  const mutated = source.replace(pattern, match => `/*\n${match}\n*/`);
  assert.notEqual(mutated, source, `${description} mutation must be applied`);
  return mutated;
}

function htmlCommentFirstMatch(source, pattern, description) {
  const mutated = source.replace(pattern, match => `<!--\n${match}\n-->`);
  assert.notEqual(mutated, source, `${description} mutation must be applied`);
  return mutated;
}

function executableSource(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/[^\r\n]*(?:\r?\n|$)/gm, '');
}

function markdownSection(source, heading) {
  const marker = `## ${heading}`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${marker} section must exist`);
  const bodyStart = source.indexOf('\n', start) + 1;
  const nextSection = source.indexOf('\n## ', bodyStart);
  return source.slice(bodyStart, nextSection === -1 ? source.length : nextSection);
}

test('phase 1: deterministic runner loads source skills, mirrors, and refs without LLM/tool calls', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));

  assert.equal(pack.sourceSkills.length, 21);
  assert.equal(pack.claudeMirrorSkills.length, 21);
  assert.equal(pack.pluginMirrorSkills.length, 21);
  assert.equal(pack.codexMirrorSkills.length, 21);
  // Core UI per-component docs are fetched on-demand (not committed), so this count
  // dropped from ~150 to ~69. Floor still catches accidental mass-deletion of refs.
  assert.ok(pack.referenceDocs.length >= 60, `referenceDocs=${pack.referenceDocs.length}`);
  assert.equal(pack.codexReferenceDocs.length, pack.referenceDocs.length);
  assert.equal(pack.diagnostics.length, 0);
});

test('phase 1: retired standalone skills and exclusive refs stay absent from active surfaces', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const retiredSkillNames = [
    'sdcorejs-auth',
    'sdcorejs-dockerize',
    'sdcorejs-run-guide',
    'sdcorejs-solution-builder',
  ];
  const activeSkillNames = [
    ...pack.sourceSkills,
    ...pack.claudeMirrorSkills,
    ...pack.pluginMirrorSkills,
    ...pack.codexMirrorSkills,
  ].map((skill) => skill.name);

  for (const retiredName of retiredSkillNames) {
    assert.ok(!activeSkillNames.includes(retiredName), `${retiredName} stays retired`);
  }

  const activeSurfacePaths = [
    'AGENTS.md',
    'CLAUDE.md',
    'README.md',
    'SECURITY.md',
    'VALIDATION.md',
    '.github/copilot-instructions.md',
    '.github/chatmodes/sdcorejs.chatmode.md',
    '.cursor/rules/sdcorejs-agent.mdc',
    'site/src/components/SkillCatalog.astro',
  ];
  for (const path of activeSurfacePaths) {
    const text = await readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
    for (const retiredName of retiredSkillNames) {
      assert.doesNotMatch(text, new RegExp(retiredName), `${path} does not expose ${retiredName}`);
    }
    assert.doesNotMatch(text, /\bsolution-root\b/, `${path} uses the multi-project contract`);
  }

  const agents = await readFile(new URL('../../AGENTS.md', import.meta.url), 'utf8');
  assert.doesNotMatch(agents, /\binfra\//, 'AGENTS.md does not inventory deleted infra refs');

  const exclusiveInfra = await readdir(new URL('../../_refs/infra/', import.meta.url)).catch((error) => {
    if (error?.code === 'ENOENT') return null;
    throw error;
  });
  assert.equal(exclusiveInfra, null, '_refs/infra stays removed');
});

test('phase 1: markdown fences stay balanced across skills, refs, and mirrors', async () => {
  const rootUrl = new URL('../../', import.meta.url);
  const roots = ['skills', '_refs', '.claude', 'plugin', 'codex', '.cursor'];
  const files = (await Promise.all(roots.map((root) => listMarkdownLikeFiles(rootUrl, root)))).flat();

  assert.ok(files.length > 400, `markdown-like files scanned=${files.length}`);
  for (const file of files) {
    const text = await readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
    const open = findUnclosedMarkdownFence(text);
    assert.equal(open, null, `${file}:${open?.line} has an unclosed Markdown fence: ${open?.text}`);
  }
});

test('phase 1: skills preserve progressive disclosure and validator-safe descriptions', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));

  for (const skill of pack.sourceSkills) {
    const lineCount = skill.text.split(/\r?\n/).length;
    assert.ok(lineCount <= 500, `${skill.name} has ${lineCount} lines; move details to a direct ref`);
    assert.doesNotMatch(skill.description, /[<>]/, `${skill.name} description must be validator-safe`);
  }

  const directRefs = [
    ['sdcorejs-explore', '_refs/shared/explore-context.md'],
    ['sdcorejs-angular', '_refs/angular/write-code/generation-rules.md'],
    ['sdcorejs-git', '_refs/shared/git-commit-scope.md'],
    ['sdcorejs-ship', '_refs/orchestration/tail/ship-context.md'],
    ['sdcorejs-plan', '_refs/sdlc/plan-approval-artifact.md'],
  ];
  for (const [skillName, referencePath] of directRefs) {
    assert.match(sourceByName.get(skillName), new RegExp(referencePath.replaceAll('/', '\\/')));
    const reference = await readFile(new URL(`../../${referencePath}`, import.meta.url), 'utf8');
    assert.match(reference, /^## Contents$/m, `${referencePath} must expose top-level navigation`);
  }
});

test('phase 1: mandatory workflow invariants are encoded in source skills and refs', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));

  for (const name of ['sdcorejs-angular', 'sdcorejs-nestjs', 'sdcorejs-nextjs']) {
    const text = sourceByName.get(name);
    assert.ok(text, `${name} exists`);
    assert.match(text, /_refs\/shared\/finish-gate\.md/, `${name} presents the finish gate`);
    assert.match(text, /_refs\/documentation\/gate\.md/, `${name} runs documentation gate`);
    assert.match(text, /\.sdcorejs\/documentation\/preferences\.md/, `${name} supports saved documentation preferences`);
    assert.match(text, /finishing steps \(tests,\s+optional behavior-preserving simplification, review, code-documentation, technical-doc, user-guide\)/, `${name} progress checklist includes simplify and technical-doc`);
    assert.match(text, /sdcorejs-ship \(verify-before-done mode\)/, `${name} runs acceptance verification`);
    assert.match(text, /sdcorejs-ship \(branch-ready mode\)/, `${name} runs branch-ready`);
    assert.match(text, /_refs\/orchestration\/tail\/auto-docs\.md/, `${name} writes auto-docs`);
    assert.match(text, /_refs\/orchestration\/tail\/auto-task-tracker\.md/, `${name} updates task tracker`);
    assert.match(text, /memories mode/, `${name} hands off durable memories when needed`);
  }

  const angularSkill = sourceByName.get('sdcorejs-angular');
  assert.match(angularSkill, /Eligibility preflight/);
  assert.match(angularSkill, /plain-angular/);
  assert.match(angularSkill, /--require-installed/);
  assert.match(angularSkill, /generic harness/);
  assert.match(angularSkill, /Do not fetch Core UI docs/);
  assert.match(angularSkill, /_refs\/angular\/write-code\/input-analysis\.md/);
  assert.match(angularSkill, /SDCoreJS Core reuse analysis/);
  assert.match(angularSkill, /mandatory UI check/);
  assert.match(angularSkill, /Core reuse summary/);

  const angularInputAnalysis = await readFile(new URL('../../_refs/angular/write-code/input-analysis.md', import.meta.url), 'utf8');
  assert.match(angularInputAnalysis, /versions\.json/);
  assert.match(angularInputAnalysis, /--require-installed/);
  assert.match(angularInputAnalysis, /plain-angular/);
  assert.match(angularInputAnalysis, /Angular\/local UI reuse analysis/);
  assert.match(angularInputAnalysis, /UI decomposition/);
  assert.match(angularInputAnalysis, /Requirement mapping/);
  assert.match(angularInputAnalysis, /Image \+ PRD mapping/);
  assert.match(angularInputAnalysis, /Post-Implementation UI Check/);
  assert.match(angularInputAnalysis, /Do not claim visual\/browser verification unless it actually happened/);

  const coreDocsFetch = await readFile(new URL('../../_refs/angular/core-docs-fetch.mjs', import.meta.url), 'utf8');
  assert.match(coreDocsFetch, /--require-installed/);
  assert.match(coreDocsFetch, /detectInstalledPackage/);
  assert.match(coreDocsFetch, /package-lock\.json/);
  assert.match(coreDocsFetch, /pnpm-lock\.yaml/);
  assert.match(coreDocsFetch, /yarn\.lock/);

  const executePlan = sourceByName.get('sdcorejs-execute-plan');
  assert.match(executePlan, /Angular project classification preflight/);
  assert.match(executePlan, /core-ui-angular/);
  assert.match(executePlan, /legacy-core-ui-angular/);
  assert.match(executePlan, /plain-angular/);
  assert.match(executePlan, /migration-request/);
  assert.match(executePlan, /generic harness fallback/);

  const reviewSkill = sourceByName.get('sdcorejs-review');
  assert.match(reviewSkill, /track_profile/);
  assert.match(reviewSkill, /review_context/);
  assert.match(reviewSkill, /core-ui-angular/);
  assert.match(reviewSkill, /legacy-core-ui-angular/);
  assert.match(reviewSkill, /plain-angular/);
  assert.match(reviewSkill, /plain-nestjs/);
  assert.match(reviewSkill, /plain-nextjs/);
  assert.match(reviewSkill, /_refs\/shared\/review-code\.md/);
  assert.match(reviewSkill, /strict read-only/i);
  assert.match(reviewSkill, /Do not write `.sdcorejs` docs/);
  assert.match(reviewSkill, /Do not auto-run `sdcorejs-repair-loop`/);
  assert.match(reviewSkill, /REDACTED|redact/i);
  assert.match(reviewSkill, /npx --yes[\s\S]*explicit approval/);
  assert.doesNotMatch(reviewSkill, /npm run lint && tsc --noEmit/);

  const repairSkill = sourceByName.get('sdcorejs-repair-loop');
  assert.match(repairSkill, /sdcorejs-ship \(verify-before-done mode\)/);
  assert.match(repairSkill, /Repair ledger/);
  assert.match(repairSkill, /Silence is not approval/);
  assert.match(repairSkill, /Do not edit tests merely to make production code pass/);
  assert.match(repairSkill, /review_context/);
  assert.match(repairSkill, /track_profile/);
  assert.match(repairSkill, /debug_context/);
  assert.doesNotMatch(repairSkill, /until the final verification pass is green/);

  const debugSkill = sourceByName.get('sdcorejs-debug');
  assert.match(debugSkill, /debug_mode/);
  assert.match(debugSkill, /bug_class/);
  assert.match(debugSkill, /stack_profile/);
  assert.match(debugSkill, /repro_status/);
  assert.match(debugSkill, /local-confirmed/);
  assert.match(debugSkill, /evidence-confirmed/);
  assert.match(debugSkill, /flaky-confirmed/);
  assert.match(debugSkill, /blocked/);
  assert.match(debugSkill, /debug_context/);
  assert.match(debugSkill, /_refs\/shared\/debug-context\.md/);
  assert.doesNotMatch(debugSkill, /debug_context:\s*\r?\n\s+source:/);
  assert.match(debugSkill, /Hypothesis Ledger/);
  assert.match(debugSkill, /Diagnostic Instrumentation Ledger/);
  assert.match(debugSkill, /git status --short/);
  assert.match(debugSkill, /package manager|lockfile|package\.json scripts/i);
  assert.match(debugSkill, /environment:\s*\r?\n|local \| dev \| staging \| prod \| unknown \| mock/);
  assert.match(debugSkill, /REDACTED|redact|PII/i);
  assert.match(debugSkill, /sdcorejs-ship \(verify-before-done mode\)/);
  assert.match(debugSkill, /sdcorejs-ship \(branch-ready mode\)/);
  assert.match(debugSkill, /required-actions: .*artifact\.write/);
  assert.match(debugSkill, /Do not assume TypeORM, PostgreSQL, Zod/);
  assert.match(debugSkill, /performance-anomaly/);
  assert.match(debugSkill, /broad performance\s+tuning without a concrete anomaly/);
  assert.match(debugSkill, /optional chaining[\s\S]*confirmed root-cause contract/);
  assert.doesNotMatch(debugSkill, /handoff.*sdcorejs-git \(commit mode\)/i);
  assert.doesNotMatch(debugSkill, /Once.*verified.*sdcorejs-git/i);

  const debugDiscipline = await readFile(new URL('../../_refs/shared/debugging-discipline.md', import.meta.url), 'utf8');
  assert.match(debugDiscipline, /Hypothesis Ledger/);
  assert.match(debugDiscipline, /shotgun debugging/);
  assert.match(debugDiscipline, /optional chaining/);

  const debugCommandDiscovery = await readFile(new URL('../../_refs/shared/debug-command-discovery.md', import.meta.url), 'utf8');
  assert.match(debugCommandDiscovery, /packageManager/);
  assert.match(debugCommandDiscovery, /lockfiles/);
  assert.match(debugCommandDiscovery, /Do not invent missing scripts/);
  assert.match(debugCommandDiscovery, /npx --yes/);

  const debugEnvironmentGuard = await readFile(new URL('../../_refs/shared/debug-environment-guard.md', import.meta.url), 'utf8');
  assert.match(debugEnvironmentGuard, /local/);
  assert.match(debugEnvironmentGuard, /staging/);
  assert.match(debugEnvironmentGuard, /prod/);
  assert.match(debugEnvironmentGuard, /TOKEN=\[REDACTED\]/);

  const debugContextRef = await readFile(new URL('../../_refs/shared/debug-context.md', import.meta.url), 'utf8');
  assert.match(debugContextRef, /debug_context/);
  assert.match(debugContextRef, /debug_context:\s*\r?\n\s+source:/);
  assert.match(debugContextRef, /debug_mode/);
  assert.match(debugContextRef, /commands_run/);
  assert.match(debugContextRef, /commands_skipped/);

  const repairRef = await readFile(new URL('../../_refs/orchestration/tail/repair-loop.md', import.meta.url), 'utf8');
  assert.doesNotMatch(repairRef, /haven/);
  assert.doesNotMatch(repairRef, /Once converged, hand off to `sdcorejs-git \(commit mode\)`/);
  assert.doesNotMatch(repairRef, /Done\. Hand off to sdcorejs-git \(commit mode\)/);
  assert.doesNotMatch(repairRef, /npm run lint && tsc --noEmit/);
  assert.match(repairRef, /Repair ledger/);
  assert.match(repairRef, /repair_source/);
  assert.match(repairRef, /track_profile/);
  assert.match(repairRef, /review_context/);
  assert.match(repairRef, /Working-tree Preflight/);
  assert.match(repairRef, /package manager|lockfile|`package\.json` scripts/i);
  assert.match(repairRef, /Silence is not approval/);
  assert.match(repairRef, /Do not edit tests merely to make production code pass/);
  assert.match(repairRef, /return to the caller's tail chain/);
  assert.match(repairRef, /sdcorejs-ship \(verify-before-done mode\)/);
  assert.match(repairRef, /debug_context/);

  const codexRepairSkill = pack.codexMirrorSkills.find((skill) => skill.name === 'sdcorejs-repair-loop')?.text;
  assert.match(codexRepairSkill, /Repair ledger/);
  assert.match(codexRepairSkill, /Silence is not approval/);

  const codexRepairRef = await readFile(new URL('../../codex/skills/_refs/orchestration/tail/repair-loop.md', import.meta.url), 'utf8');
  assert.match(codexRepairRef, /repair_source/);
  assert.match(codexRepairRef, /track_profile/);
  assert.match(codexRepairRef, /review_context/);
  assert.match(codexRepairRef, /Repair ledger/);
  assert.doesNotMatch(codexRepairRef, /haven/);
  assert.doesNotMatch(codexRepairRef, /npm run lint && tsc --noEmit/);

  const codexDebugSkill = pack.codexMirrorSkills.find((skill) => skill.name === 'sdcorejs-debug')?.text;
  assert.match(codexDebugSkill, /debug_mode/);
  assert.match(codexDebugSkill, /Hypothesis Ledger/);
  assert.match(codexDebugSkill, /Diagnostic Instrumentation Ledger/);
  assert.doesNotMatch(codexDebugSkill, /\.\.\/\/SKILL\.md/);

  const codexDebugContextRef = await readFile(new URL('../../codex/skills/_refs/shared/debug-context.md', import.meta.url), 'utf8');
  assert.match(codexDebugContextRef, /debug_context/);
  assert.match(codexDebugContextRef, /ship_handoff/);

  const sharedReviewCode = await readFile(new URL('../../_refs/shared/review-code.md', import.meta.url), 'utf8');
  assert.match(sharedReviewCode, /Stack-neutral fallback/);
  assert.match(sharedReviewCode, /Do not enforce SDCoreJS Angular\/Core UI\/NestJS\/build-website conventions/);
  assert.match(sharedReviewCode, /Do not invent[\s\S]*package manager/);
  assert.match(sharedReviewCode, /probe tools without explicit approval/);

  const codexReviewSkill = pack.codexMirrorSkills.find((skill) => skill.name === 'sdcorejs-review')?.text;
  assert.match(codexReviewSkill, /track_profile/);
  assert.match(codexReviewSkill, /review_context/);
  assert.match(codexReviewSkill, /strict read-only/i);

  const codexSharedReviewCode = await readFile(new URL('../../codex/skills/_refs/shared/review-code.md', import.meta.url), 'utf8');
  assert.match(codexSharedReviewCode, /Stack-neutral fallback/);
  assert.match(codexSharedReviewCode, /Do not enforce SDCoreJS Angular\/Core UI\/NestJS\/build-website conventions/);

  const angularReviewCode = await readFile(new URL('../../_refs/angular/review-code.md', import.meta.url), 'utf8');
  assert.match(angularReviewCode, /## Profile applicability/);
  assert.match(angularReviewCode, /core-ui-angular/);
  assert.match(angularReviewCode, /legacy-core-ui-angular/);
  assert.match(angularReviewCode, /## Scope gate/);
  assert.match(angularReviewCode, /plain-angular/);
  assert.match(angularReviewCode, /_refs\/shared\/review-code\.md/);
  assert.match(angularReviewCode, /Do not run `core-docs-fetch\.mjs` for `plain-angular`/);

  const nestjsReviewCode = await readFile(new URL('../../_refs/nestjs/review-code.md', import.meta.url), 'utf8');
  assert.match(nestjsReviewCode, /sdcorejs-nestjs/);
  assert.match(nestjsReviewCode, /plain-nestjs/);
  assert.match(nestjsReviewCode, /_refs\/shared\/review-code\.md/);

  const nextjsReviewCode = await readFile(new URL('../../_refs/nextjs/build-website/review-code.md', import.meta.url), 'utf8');
  assert.match(nextjsReviewCode, /nextjs-build-website/);
  assert.match(nextjsReviewCode, /plain-nextjs/);
  assert.match(nextjsReviewCode, /_refs\/shared\/review-code\.md/);

  const sharedReviewSecurity = await readFile(new URL('../../_refs/shared/review-security.md', import.meta.url), 'utf8');
  assert.match(sharedReviewSecurity, /Probe and redaction discipline/);
  assert.match(sharedReviewSecurity, /API_KEY=\[REDACTED\]/);
  assert.match(sharedReviewSecurity, /Use the detected package manager/);

  const sharedReviewPerformance = await readFile(new URL('../../_refs/shared/review-performance.md', import.meta.url), 'utf8');
  assert.match(sharedReviewPerformance, /## Probe discipline/);
  assert.match(sharedReviewPerformance, /without explicit user approval/);

  const sharedReviewAccessibility = await readFile(new URL('../../_refs/shared/review-accessibility.md', import.meta.url), 'utf8');
  assert.match(sharedReviewAccessibility, /backend-only scopes, mark accessibility N\/A/);

  const sharedReviewArchitecture = await readFile(new URL('../../_refs/shared/review-architecture.md', import.meta.url), 'utf8');
  assert.match(sharedReviewArchitecture, /Most frontend and backend stacks benefit from layered architecture/);

  const testSkill = sourceByName.get('sdcorejs-test');
  assert.match(testSkill, /## Purpose and ownership/);
  assert.match(testSkill, /## Direct invocation tail/);
  assert.match(testSkill, /test_action/);
  assert.match(testSkill, /stack_profile/);
  assert.match(testSkill, /run-only/);
  assert.match(testSkill, /write-tests/);
  assert.match(testSkill, /write-and-run/);
  assert.match(testSkill, /test-plan-readonly/);
  assert.match(testSkill, /coverage-audit/);
  assert.match(testSkill, /uat-cases/);
  assert.match(testSkill, /tdd-red/);
  assert.match(testSkill, /tdd-cycle/);
  assert.match(testSkill, /failing-output-triage/);
  assert.match(testSkill, /debug-handoff/);
  assert.match(testSkill, /core-ui-angular/);
  assert.match(testSkill, /legacy-core-ui-angular/);
  assert.match(testSkill, /plain-angular/);
  assert.match(testSkill, /plain-nestjs/);
  assert.match(testSkill, /plain-nextjs/);
  assert.match(testSkill, /_refs\/shared\/test-command-discovery\.md/);
  assert.match(testSkill, /_refs\/shared\/test-environment-guard\.md/);
  assert.match(testSkill, /_refs\/shared\/test-context\.md/);
  assert.match(testSkill, /_refs\/shared\/test-generic\.md/);
  assert.match(testSkill, /_refs\/shared\/test-auth-personas\.md/);
  assert.match(testSkill, /_refs\/shared\/test-data-lifecycle\.md/);
  assert.match(testSkill, /_refs\/shared\/test-ui-evidence\.md/);
  assert.match(testSkill, /test_context/);
  assert.match(testSkill, /test_status/);
  assert.match(testSkill, /test_evidence/);
  assert.match(testSkill, /## TDD ledger/);
  assert.match(testSkill, /narrowest relevant command/);
  assert.match(testSkill, /Never invent a command/);
  assert.match(testSkill, /must\s+not invoke Git/i);
  assert.match(testSkill, /sdcorejs-debug/);
  assert.match(testSkill, /sdcorejs-documentation/);
  assert.match(testSkill, /ui-evidence-capture/);
  assert.doesNotMatch(testSkill, /current-session\.md/);

  const testCommandDiscovery = await readFile(new URL('../../_refs/shared/test-command-discovery.md', import.meta.url), 'utf8');
  assert.match(testCommandDiscovery, /lockfiles and workspace files/);
  assert.match(testCommandDiscovery, /Do not run dependency-changing or browser-installing commands/);
  assert.match(testCommandDiscovery, /`npx --yes`/);

  const testEnvironmentGuard = await readFile(new URL('../../_refs/shared/test-environment-guard.md', import.meta.url), 'utf8');
  assert.match(testEnvironmentGuard, /Environment Classes/);
  assert.match(testEnvironmentGuard, /Block destructive tests/);
  assert.match(testEnvironmentGuard, /Redact before reporting/);

  const testContextRef = await readFile(new URL('../../_refs/shared/test-context.md', import.meta.url), 'utf8');
  assert.match(testContextRef, /test_context/);
  assert.match(testContextRef, /test_status/);
  assert.match(testContextRef, /test_evidence/);
  assert.match(testContextRef, /schema_version: 2/);
  assert.match(testContextRef, /associated_HEAD_or_diff/);

  const testGenericRef = await readFile(new URL('../../_refs/shared/test-generic.md', import.meta.url), 'utf8');
  assert.match(testGenericRef, /Stack-neutral fallback/);
  assert.match(testGenericRef, /Do not enforce/);
  assert.match(testGenericRef, /Core UI components/);

  const angularTestUnit = await readFile(new URL('../../_refs/angular/test-unit.md', import.meta.url), 'utf8');
  const angularTestIntegration = await readFile(new URL('../../_refs/angular/test-integration.md', import.meta.url), 'utf8');
  const angularTestE2e = await readFile(new URL('../../_refs/angular/test-e2e.md', import.meta.url), 'utf8');
  for (const text of [angularTestUnit, angularTestIntegration, angularTestE2e]) {
    assert.match(text, /plain-angular/);
    assert.match(text, /_refs\/shared\/test-generic\.md/);
    assert.doesNotMatch(text, /npm run test --/);
  }
  assert.match(angularTestE2e, /test-environment-guard/);
  assert.doesNotMatch(angularTestE2e, /npx cypress|npx playwright/);
  assert.doesNotMatch(angularTestE2e, /systematic-debugging/);

  const nestTestUnit = await readFile(new URL('../../_refs/nestjs/test-unit.md', import.meta.url), 'utf8');
  const nestTestIntegration = await readFile(new URL('../../_refs/nestjs/test-integration.md', import.meta.url), 'utf8');
  const nestTestE2e = await readFile(new URL('../../_refs/nestjs/test-e2e.md', import.meta.url), 'utf8');
  for (const text of [nestTestUnit, nestTestIntegration, nestTestE2e]) {
    assert.match(text, /plain-nestjs/);
    assert.match(text, /_refs\/shared\/test-generic\.md/);
    assert.doesNotMatch(text, /npm install -D/);
    assert.doesNotMatch(text, /npm run test/);
  }
  assert.match(nestTestE2e, /test-environment-guard/);

  const nextTestE2e = await readFile(new URL('../../_refs/nextjs/build-website/test-e2e.md', import.meta.url), 'utf8');
  assert.match(nextTestE2e, /plain-nextjs/);
  assert.match(nextTestE2e, /_refs\/shared\/test-generic\.md/);
  assert.match(nextTestE2e, /test-environment-guard/);
  assert.match(nextTestE2e, /locale === 'vi' \? '<localized text>' : 'Trusted partner'/);
  assert.match(nextTestE2e, /locale === 'vi' \? 'en' : 'vi'/);
  assert.doesNotMatch(nextTestE2e, /locale === 'vi'<localized text>/);
  assert.doesNotMatch(nextTestE2e, /npx playwright|npm install -D|npm run build && npm run start/);

  assert.match(reviewSkill, /## Post-review Behavior/);
  assert.match(reviewSkill, /Persist this review summary as a \.sdcorejs artifact/);
  assert.doesNotMatch(reviewSkill, /status `reviewed`/);

  for (const name of [
    'sdcorejs-execute-plan',
    'sdcorejs-angular',
    'sdcorejs-nestjs',
    'sdcorejs-nextjs',
    'sdcorejs-product',
    'sdcorejs-design',
    'sdcorejs-test',
    'sdcorejs-review',
    'sdcorejs-parallel-dispatch'
  ]) {
    const text = sourceByName.get(name);
    assert.ok(text, `${name} exists`);
    assert.match(
      text,
      /project-context\.md|runtime-protocols\.md/,
      `${name} loads project-context directly or through the shared router`,
    );
    assert.match(
      text,
      /targeted reads|targeted source|targeted project reads|scoped code map/i,
      `${name} can continue without a summary gate`
    );
    assert.match(
      text,
      /missing|legacy|stale|unknown/i,
      `${name} defines degraded-summary behavior`
    );
  }

  const coreVersion = await readFile(new URL('../../_refs/angular/core-version.md', import.meta.url), 'utf8');
  assert.doesNotMatch(coreVersion, /10-init-portal/);
  assert.match(coreVersion, /_refs\/angular\/write-code\/init-portal\.md/);
  assert.match(coreVersion, /No Core UI package installed/);
  assert.doesNotMatch(coreVersion, /generic Angular Material \+ `alert/);

  const gitSkill = sourceByName.get('sdcorejs-git');
  assert.match(gitSkill, /\.sdcorejs\/documentation\/\*\*/);
  assert.match(gitSkill, /Mode Precedence Guard/);
  assert.match(gitSkill, /sdcorejs-ship/);
  assert.match(gitSkill, /current `HEAD` or diff/);
  assert.match(gitSkill, /Never commit directly from main, master, trunk, production, stable, or[\s\S]*release\/\*/);
  assert.match(gitSkill, /Never create a PR directly/);
  assert.match(gitSkill, /There is no continue on protected branch option/);
  assert.match(gitSkill, /Commit Scope Ledger/);
  assert.match(gitSkill, /test_context/);
  assert.match(gitSkill, /test_evidence/);
  assert.match(gitSkill, /debug_context/);
  assert.match(gitSkill, /staged_paths:[\s\S]*unstaged_paths:[\s\S]*untracked_paths:[\s\S]*included_paths:[\s\S]*excluded_dirty_paths:/);
  assert.match(gitSkill, /Use explicit path staging/);
  assert.match(gitSkill, /Never use dot-all staging or all-index staging flags/);
  assert.doesNotMatch(gitSkill, /git add \./);
  assert.doesNotMatch(gitSkill, /git add -A/);
  assert.match(gitSkill, /command -v gh/);
  assert.match(gitSkill, /gh auth status/);
  assert.match(gitSkill, /gh repo view --json defaultBranchRef/);
  assert.match(gitSkill, /gh pr create/);
  assert.match(gitSkill, /origin\/\$BASE\.\.HEAD/);
  assert.match(gitSkill, /origin\/\$BASE\.\.\.HEAD/);
  assert.doesNotMatch(gitSkill, /git log <base>\.\.HEAD/);
  assert.doesNotMatch(gitSkill, /git diff <base>\.\.\.HEAD/);
  assert.match(gitSkill, /existing PR/i);
  assert.match(gitSkill, /require a clean tree/);
  assert.match(gitSkill, /REDACTED|redact/i);
  assert.match(gitSkill, /Verification: deferred by user/);
  assert.match(gitSkill, /Verification: not applicable, docs-only change/);
  assert.match(gitSkill, /Mode-Specific Write Boundaries/);
  assert.match(gitSkill, /Never force push/);
  assert.match(gitSkill, /Do not tag, push tags, bump versions, create GitHub releases/);

  const shipSkill = sourceByName.get('sdcorejs-ship');
  assert.match(shipSkill, /sdcorejs-ship` decides readiness/);
  assert.match(shipSkill, /sdcorejs-git` creates Git artifacts/);
  assert.match(shipSkill, /verification_mode/);
  assert.match(shipSkill, /feature-acceptance[\s\S]*bugfix-verification[\s\S]*specless-verification[\s\S]*dependency-regression[\s\S]*docs-only-hygiene[\s\S]*release-readiness[\s\S]*branch-ready-only/);
  assert.match(shipSkill, /ship_context:/);
  assert.match(shipSkill, /writes_after_branch_ready/);
  assert.match(shipSkill, /git_handoff_allowed/);
  assert.match(shipSkill, /branch-ready.*final read-only gate|final read-only gate.*branch-ready/i);
  assert.match(shipSkill, /No writes after branch-ready/i);
  assert.match(shipSkill, /There is no continue-on-protected-branch option|There is no continue on protected branch option/i);
  assert.match(shipSkill, /Create a feature branch and continue[\s\S]*Create an isolated worktree[\s\S]*Stop/);
  assert.match(shipSkill, /package-manager-specific command matrix/i);
  assert.match(shipSkill, /npm[\s\S]*pnpm[\s\S]*yarn[\s\S]*bun/);
  assert.match(shipSkill, /release-ready|release-readiness/i);
  assert.match(shipSkill, /Do not create tags by default[\s\S]*Do not push tags by default[\s\S]*Do not bump versions by default[\s\S]*Do not publish packages by default/);
  assert.match(shipSkill, /Mode-Specific Write Boundaries/);
  assert.match(shipSkill, /REDACTED|redact|PII/i);

  const codexShipSkill = pack.codexMirrorSkills.find((skill) => skill.name === 'sdcorejs-ship')?.text;
  assert.match(codexShipSkill, /ship_context:/);
  assert.match(codexShipSkill, /verification_mode/);
  assert.match(codexShipSkill, /No writes after branch-ready/i);

  const verifyBeforeDone = await readFile(new URL('../../_refs/orchestration/tail/verify-before-done.md', import.meta.url), 'utf8');
  assert.match(verifyBeforeDone, /verification_mode/);
  assert.match(verifyBeforeDone, /feature-acceptance[\s\S]*bugfix-verification[\s\S]*specless-verification[\s\S]*dependency-regression[\s\S]*docs-only-hygiene[\s\S]*release-readiness[\s\S]*branch-ready-only/);
  assert.match(verifyBeforeDone, /acceptance_scope/);
  assert.match(verifyBeforeDone, /Do not blindly pick the newest spec/);
  assert.match(verifyBeforeDone, /package manager|lockfiles|package\.json scripts/i);
  assert.match(verifyBeforeDone, /Do not hardcode npm\/npx/i);
  assert.match(verifyBeforeDone, /Do not invent missing scripts/);
  assert.match(verifyBeforeDone, /commands_run/);
  assert.match(verifyBeforeDone, /commands_skipped/);
  assert.match(verifyBeforeDone, /bugfix-verification/);
  assert.match(verifyBeforeDone, /nextjs-build-website/);
  assert.match(verifyBeforeDone, /plain-nextjs/);
  assert.doesNotMatch(verifyBeforeDone, /npm run build\s*$/m);
  assert.doesNotMatch(verifyBeforeDone, /npm run lint\s*$/m);
  assert.doesNotMatch(verifyBeforeDone, /npm run test\s*$/m);
  assert.doesNotMatch(verifyBeforeDone, /npm run e2e\s*$/m);
  assert.doesNotMatch(verifyBeforeDone, /npx --yes/);
  assert.doesNotMatch(verifyBeforeDone, /npx (lighthouse|pa11y)/);

  const workspaceIsolation = await readFile(new URL('../../_refs/orchestration/workspace-isolation.md', import.meta.url), 'utf8');
  assert.match(workspaceIsolation, /package manager|lockfile|package\.json scripts/i);
  assert.match(workspaceIsolation, /commands skipped|reason for each skip|skipped: no lint script found in package\.json/i);
  assert.doesNotMatch(workspaceIsolation, /npm run build-dev/);
  assert.doesNotMatch(workspaceIsolation, /npm run build/);

  const branchReady = await readFile(new URL('../../_refs/orchestration/tail/branch-ready.md', import.meta.url), 'utf8');
  assert.match(branchReady, /package manager|lockfiles|package\.json scripts/i);
  assert.match(branchReady, /commands_skipped/);
  assert.match(branchReady, /reason_for_each_skip/);
  assert.match(branchReady, /associated_HEAD_or_diff/);
  assert.match(branchReady, /blockers.*not waivable|Branch-ready blockers are not waivable/i);
  assert.match(branchReady, /API_KEY=\[REDACTED\]/);
  assert.match(branchReady, /debug_context/);
  assert.doesNotMatch(branchReady, /skip silently/i);
  assert.doesNotMatch(branchReady, /npm run lint/);
  assert.doesNotMatch(branchReady, /npm run build/);
  assert.doesNotMatch(branchReady, /npm run test/);

  const changelog = await readFile(new URL('../../_refs/orchestration/release-changelog.md', import.meta.url), 'utf8');
  assert.match(changelog, /git status --short/);
  assert.match(changelog, /Do not mix changelog edits with unrelated dirty source changes/);
  assert.match(changelog, /Do not tag, push tags, bump versions, create releases, or publish by default/);
  assert.match(changelog, /TOKEN=\[REDACTED\]/);

  const codexGitSkill = pack.codexMirrorSkills.find((skill) => skill.name === 'sdcorejs-git')?.text;
  assert.match(codexGitSkill, /Commit Scope Ledger/);
  assert.match(codexGitSkill, /There is no continue on protected branch option/);
  assert.match(codexGitSkill, /origin\/\$BASE\.\.HEAD/);
  assert.match(codexGitSkill, /origin\/\$BASE\.\.\.HEAD/);
  assert.match(codexGitSkill, /REDACTED|redact/i);

  const choicePrompt = await readFile(new URL('../../_refs/shared/user-choice-prompt.md', import.meta.url), 'utf8');
  assert.match(choicePrompt, /Native structured choice when the runtime actually exposes it/);
  assert.match(choicePrompt, /Stable numbered Markdown in every environment/);
  assert.match(choicePrompt, /Reply with `1`, `2`, or `3`/);

  for (const skill of pack.sourceSkills) {
    assert.match(
      skill.text,
      /runtime-protocols\.md|user-choice-prompt\.md/,
      `${skill.name} routes shared protocols without duplicating them`,
    );
  }

  const finishGate = await readFile(new URL('../../_refs/shared/finish-gate.md', import.meta.url), 'utf8');
  assert.match(finishGate, /Finish step 1\/4: tests/);
  assert.match(finishGate, /Finish step 3\/4: behavior-preserving code simplification/);
  assert.match(finishGate, /Finish step 4\/4: review/);
  assert.match(finishGate, /Documentation approval gate/);
  assert.match(finishGate, /single combined gate/);
  assert.match(finishGate, /Skip new user\/technical docs/);
  assert.match(finishGate, /user_guide: skip[\s\S]*technical_doc: skip[\s\S]*requirement_record: skip/);
  assert.match(finishGate, /`sdcorejs-documentation \(code-documentation mode\)` - automatic/);
  assert.match(finishGate, /Run review only - read-only review/);
  assert.match(finishGate, /Run review and repair loop/);
  assert.match(finishGate, /repair-loop receives the original `review_context`/);
  assert.match(finishGate, /`sdcorejs-review` only; it must[\s\S]*include `review_context`/);
  assert.match(finishGate, /write-producing[\s\S]*before final branch-ready/i);
  assert.match(finishGate, /No writes after branch-ready unless branch-ready is run again/i);
  assert.match(finishGate, /branch-ready.*final read-only gate|final read-only gate.*branch-ready/i);
  assert.doesNotMatch(finishGate, /sdcorejs-ship \(branch-ready mode\)` \(unless deferred\)\.[\s\S]*auto-docs tail ref/);
  assert.doesNotMatch(finishGate, /code_documentation: skip/);
  assert.doesNotMatch(finishGate, /Codes:/);
  const documentationGate = await readFile(new URL('../../_refs/documentation/gate.md', import.meta.url), 'utf8');
  assert.match(documentationGate, /User\/Technical Documentation Approval Gate/);
  assert.match(documentationGate, /This gate does \*\*not\*\* control `code-documentation`/);
  assert.match(documentationGate, /user_guide: create \| update \| skip/);
  assert.match(documentationGate, /technical_doc: create \| update \| skip/);
  assert.doesNotMatch(documentationGate, /create_or_update/);
  assert.doesNotMatch(documentationGate, /code_documentation: skip/);
  assert.doesNotMatch(documentationGate, /Codes:/);

  const documentationSkill = sourceByName.get('sdcorejs-documentation');
  assert.match(documentationSkill, /verified real-UI screenshots/);
  assert.match(documentationSkill, /sdcorejs-test \(ui-evidence-capture\)/);

  const userGuide = await readFile(new URL('../../_refs/documentation/write-user-guide.md', import.meta.url), 'utf8');
  assert.match(userGuide, /sdcorejs-test \(ui-evidence-capture\)/);
  assert.match(userGuide, /existing runner/);
  assert.match(userGuide, /ui_capture_context/);
  assert.doesNotMatch(userGuide, /localhost:4200/);

  const userGuideTemplate = await readFile(new URL('../../_refs/shared/user-guide-template.md', import.meta.url), 'utf8');
  assert.match(userGuideTemplate, /ui-evidence-capture/);
  assert.match(userGuideTemplate, /Do not include missing or unverified image links/);
});

test('phase 1: frontend architecture preflight covers decomposition and anti-over-splitting regressions', async () => {
  const [
    frontendArchitecture,
    planSkill,
    executePlanSkill,
    angularSdlc,
    angularSkill,
    angularInputAnalysis,
    angularInitEntity,
    angularScreenList,
    angularScreenDetail,
    angularInitModule,
    angularInitPortal,
    angularEntitySkeleton,
    angularBoundaryTemplates,
    angularReview,
    nextjsSdlc,
    nextjsSkill,
    nextjsPages,
    nextjsReview,
    designSkill,
    designReference,
    reviewSkill,
  ] = await Promise.all([
    readFile(new URL('../../_refs/shared/frontend-architecture.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/sdlc/03-plan.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/sdlc/04-execute-plan.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/sdlc/angular.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/tracks/angular/sdcorejs-angular.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/input-analysis.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/init-entity.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/screen-list.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/screen-detail.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/init-module.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/init-portal.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/templates/entity-skeleton.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/templates/feature-component-boundaries.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/review-code.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/sdlc/nextjs.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/tracks/nextjs/sdcorejs-nextjs.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/nextjs/build-website/write-code/pages-and-blocks.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/nextjs/build-website/review-code.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/tracks/design/sdcorejs-design.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/design/frontend-design.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/workflow/review.md', import.meta.url), 'utf8'),
  ]);

  assert.match(frontendArchitecture, /A non-trivial frontend task must not proceed to code generation/);
  assert.match(frontendArchitecture, /reuse[\s\S]*extend[\s\S]*wrap[\s\S]*create_feature_local[\s\S]*create_shared[\s\S]*keep_inline/);
  assert.match(planSkill, /frontend_architecture:/);
  assert.match(planSkill, /component_tree:[\s\S]*reuse_decisions:[\s\S]*file_decisions:[\s\S]*state_owners:[\s\S]*service_boundaries:[\s\S]*data_flow:[\s\S]*declarations_and_registration:[\s\S]*public_exports:/);
  assert.match(executePlanSkill, /Shared frontend architecture gate/);
  assert.match(executePlanSkill, /plain\s+Angular,\s+plain\s+Next\.js,\s+React,\s+Vue,\s+Svelte/);

  const angularPurpose = markdownSection(angularSkill, 'Purpose');
  const angularDispatch = markdownSection(angularSkill, 'Dispatch table');
  const activeAngularOrchestratorContract = `${angularPurpose}\n${angularDispatch}`;
  const forbiddenFixedComponentAnchors = [
    {
      label: 'fixed Components (List, Detail) output',
      pattern: /Components\s*\(\s*List\s*,\s*Detail\s*\)/i,
      sample: '- Components (List, Detail)',
    },
    {
      label: 'fixed full CRUD model/service/routes/list/detail output',
      pattern: /full CRUD\s*\(\s*model\s*\+\s*service\s*\+\s*routes\s*\+\s*list\s*\+\s*detail\s*\)/i,
      sample: '| New entity with full CRUD (model + service + routes + list + detail) | init-entity |',
    },
    {
      label: 'worded two-component mandate',
      pattern: /must use a two-component structure/i,
      sample: 'Entity pages must use a two-component structure.',
    },
    {
      label: 'numeric two-component mandate',
      pattern: /must use a 2-component structure/i,
      sample: 'Entity pages must use a 2-component structure.',
    },
  ];
  const assertNoFixedComponentAnchoring = source => {
    const activeSource = executableSource(source);
    for (const forbidden of forbiddenFixedComponentAnchors) {
      assert.doesNotMatch(
        activeSource,
        forbidden.pattern,
        `active Angular orchestrator contract must not contain ${forbidden.label}`,
      );
    }
  };

  assertNoFixedComponentAnchoring(activeAngularOrchestratorContract);

  const commentedHistoricalExamples = forbiddenFixedComponentAnchors
    .map(forbidden => `<!-- historical migration example: ${forbidden.sample} -->`)
    .join('\n');
  assertNoFixedComponentAnchoring(`${activeAngularOrchestratorContract}\n${commentedHistoricalExamples}`);

  for (const forbidden of forbiddenFixedComponentAnchors) {
    const mutatedContract = `${activeAngularOrchestratorContract}\n${forbidden.sample}`;
    assert.notEqual(mutatedContract, activeAngularOrchestratorContract, `${forbidden.label} mutation must be applied`);
    assert.throws(
      () => assertNoFixedComponentAnchoring(mutatedContract),
      { name: 'AssertionError' },
      `${forbidden.label} mutation must fail the active-instruction regression`,
    );
  }

  assert.match(
    angularPurpose,
    /Domain and transport contracts[\s\S]*Data-access services and justified feature collaborators[\s\S]*Lazy route\/page containers[\s\S]*Feature-local components derived from cohesive responsibilities[\s\S]*Reused shared\/Core UI components where justified/,
  );
  assert.match(
    angularDispatch,
    /New entity with full CRUD \(domain\/data contracts \+ data-access services and justified collaborators \+ routes\/page containers \+ architecture-derived feature components\)/,
  );
  assert.match(angularPurpose, /minimum screen boundaries, not a maximum component count/i);
  assert.match(angularPurpose, /simple cohesive screen may remain one page component/i);
  assert.match(angularPurpose, /Feature-local extraction does not require multiple consumers/i);
  assert.match(angularPurpose, /shared or public promotion requires stronger ownership and consumer\s+evidence/i);
  assert.match(
    frontendArchitecture,
    /Promote a component to a shared\/design-system boundary only when it is[\s\S]*multiple stable consumers[\s\S]*explicitly owned by the\s+project's shared UI layer/i,
  );

  // Scenario 1: a complex Angular list gets meaningful route/page child boundaries.
  assert.match(angularScreenList, /summary[\s\S]*filters[\s\S]*result table[\s\S]*bulk-action toolbar/i);
  assert.match(angularBoundaryTemplates, /\[Entity\]Summary[\s\S]*\[Entity\]Filters[\s\S]*\[Entity\]Table[\s\S]*\[Entity\]BulkActions/);
  assert.match(angularBoundaryTemplates, /Route\/page orchestration shell[\s\S]*Feature-local filter contract[\s\S]*Feature-local table contract/);

  // Scenario 2: a simple drawer/form is not split and receives no default facade/store.
  assert.match(frontendArchitecture, /small cohesive drawer[\s\S]*may remain one\s+component/i);
  assert.match(angularScreenDetail, /four-field drawer[\s\S]*cohesive/i);
  assert.match(angularInitEntity, /simple drawer[\s\S]*may remain one cohesive component with no facade\/store/i);
  assert.doesNotMatch(angularInitEntity, /Entity pages must use 2-component structure/);
  assert.match(
    angularInitEntity,
    /Worked Product entity[\s\S]*routed page containers[\s\S]*approved architecture-derived feature components/i,
  );

  // Scenario 3: existing reusable components/services win with exact evidence.
  assert.match(angularInputAnalysis, /existing reusable components[\s\S]*API\/data-access\s+abstractions/i);
  assert.match(frontendArchitecture, /exact symbol and path[\s\S]*compatibility/i);
  assert.match(angularInitPortal, /Order reuses an existing\/Core UI customer selector[\s\S]*feature-local domain selector[\s\S]*keeps the selection UI inline/i);
  assert.match(angularInitPortal, /omit when no approved shared selector exists/i);
  assert.match(angularInitPortal, /Render every unconditional file plus only the conditional selector\s+files approved by the frontend architecture plan/i);
  assert.doesNotMatch(angularInitPortal, /Order's create\/update form uses `<customer-select>`/);

  // Scenario 4: a one-off Next.js interactive block is feature-local, not forced inline/shared.
  assert.match(nextjsPages, /one-off pricing estimator[\s\S]*feature-local component/i);
  assert.match(nextjsPages, /Server Component\/composition boundary[\s\S]*feature-local\s+Client\s+Component/i);
  assert.doesNotMatch(nextjsPages, /if it's used once, it's not a section/);
  assert.match(nextjsSdlc, /single use does not force it\s+inline/);
  assert.match(nextjsSkill, /single use neither forces inline markup nor\s+promotes/);

  // Scenario 5: mutable facade state has an explicit narrow provider lifecycle.
  assert.match(frontendArchitecture, /Feature facade\/store with mutable feature state[\s\S]*route, feature, or page/);
  assert.match(angularEntitySkeleton, /Mutable[\s\S]*facades\/stores must not use the root variant by default/);
  assert.match(
    angularBoundaryTemplates,
    /provider lifecycle[\s\S]*isolated facade and service instances for separate feature injectors/i,
  );

  // Scenario 6: route pages and feature-local children stay out of public barrels.
  assert.match(frontendArchitecture, /Feature-private route pages and child components stay private/);
  assert.match(angularEntitySkeleton, /Do not export ListComponent, DetailComponent, or feature-local children/);
  assert.doesNotMatch(angularEntitySkeleton, /export \{ ListComponent \} from '.\/pages\/list\/list\.component';/);

  // Scenario 7: existing project structure overrides fallback folders.
  assert.match(frontendArchitecture, /Fallback structures are allowed only for greenfield work/);
  assert.match(angularSdlc, /greenfield Core\s+UI fallback only[\s\S]*must not override an established project convention/);
  assert.match(nextjsSdlc, /greenfield pack[\s\S]*not a\s+structure to impose on an established site/);
  assert.match(angularInitPortal, /preserve its coherent feature root and naming \(`modules\/`, `features\/`[\s\S]*approved migration plan/i);
  assert.doesNotMatch(angularInitPortal, /still generate new code under `features\/`/);

  // Scenario 8: complex forms extract meaningful sections without duplicating state.
  assert.match(angularScreenDetail, /form section[\s\S]*line-item editor[\s\S]*async-validation region[\s\S]*permission-dependent block/i);
  assert.match(angularScreenDetail, /typed parent subgroup[\s\S]*must not create a duplicate form\/entity model/i);
  assert.match(angularBoundaryTemplates, /Typed form-section child[\s\S]*single source of truth/i);

  assert.match(angularSkill, /_refs\/shared\/frontend-architecture\.md/);
  assert.match(angularInitModule, /base-select[\s\S]*Conditional/);
  assert.doesNotMatch(angularInitModule, /base-select[^\n]*✅ Always/);
  assert.match(angularReview, /Approved frontend architecture conformance/);
  assert.match(nextjsReview, /Approved frontend architecture conformance/);
  assert.match(reviewSkill, /approved_frontend_architecture:/);
  assert.match(designSkill, /Implementation Component Map[\s\S]*Data and Interaction Map/);
  assert.match(designReference, /confirmed \/ candidate \/ unknown \/ new/);
});

test('phase 1: frontend architecture workflow preserves approval and review-dimension gates', async () => {
  const [usingSkills, angularSkill, nextjsSkill, planSkill, reviewSkill] = await Promise.all([
    readFile(new URL('../../skills/orchestration/using-skills.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/tracks/angular/sdcorejs-angular.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/tracks/nextjs/sdcorejs-nextjs.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/sdlc/03-plan.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/workflow/review.md', import.meta.url), 'utf8'),
  ]);

  assert.match(
    usingSkills,
    /imperative verbs such as `implement`, `build`, or `create` express write intent\s+only[\s\S]*not spec approval or plan approval/i,
  );
  assert.match(
    usingSkills,
    /fixture, lab, benchmark, or disposable repository[\s\S]*does not\s+waive[\s\S]*approval gate/i,
  );
  assert.match(
    usingSkills,
    /non-trivial implementation request without[\s\S]*approved plan[\s\S]*route to `sdcorejs-brainstorming`[\s\S]*not confirmed implementation/i,
  );
  assert.doesNotMatch(angularSkill, /\bdirect request\b/i);
  assert.doesNotMatch(nextjsSkill, /\bdirect request\b|approved\/direct/i);
  assert.match(angularSkill, /approved plan dispatched\s+by `sdcorejs-execute-plan`/i);
  assert.match(nextjsSkill, /approved plan dispatched\s+by `sdcorejs-execute-plan`/i);
  assert.match(angularSkill, /must not create\s+or self-approve a\s+missing contract/i);
  assert.match(nextjsSkill, /must not create\s+or self-approve a\s+missing contract/i);
  assert.match(
    angularSkill,
    /`implement`, `build`, or `create`[\s\S]*write intent\s+only[\s\S]*not spec approval or plan approval/i,
  );
  assert.match(
    angularSkill,
    /summary[\s\S]*filters[\s\S]*result table[\s\S]*bulk actions[\s\S]*workflow[\s\S]*stop before writing code/i,
  );
  assert.match(
    angularSkill,
    /must never treat the current prompt as the\s+controlling approved scope/i,
  );
  assert.match(
    angularSkill,
    /approved artifacts are absent[\s\S]*remain read-only[\s\S]*must not modify source or test files/i,
  );
  assert.match(
    angularSkill,
    /read `_refs\/shared\/frontend-architecture\.md` before formulating[\s\S]*architecture decision/i,
  );
  assert.match(
    angularSkill,
    /route must not own all[\s\S]*summary[\s\S]*filters[\s\S]*result table[\s\S]*selection[\s\S]*bulk actions[\s\S]*workflow/i,
  );
  assert.match(
    angularSkill,
    /approval preflight[\s\S]*first action[\s\S]*fail closed/i,
  );
  assert.match(
    angularSkill,
    /before project classification[\s\S]*TDD[\s\S]*frontend architecture[\s\S]*implementation reference/i,
  );
  assert.match(
    angularSkill,
    /stop this skill immediately[\s\S]*no project classification[\s\S]*TDD[\s\S]*architecture planning[\s\S]*implementation-reference reads/i,
  );
  assert.match(
    angularSkill,
    /eligibility may route only after[\s\S]*approval gate[\s\S]*passed/i,
  );

  assert.match(
    planSkill,
    /project_conventions:\s*\n\s+component_style:[\s\S]*folder_convention:[\s\S]*state_convention:[\s\S]*service_data_access_convention:[\s\S]*registration_provider_convention:[\s\S]*public_api_barrel_convention:[\s\S]*test_convention:[\s\S]*evidence_inspected:/,
  );
  assert.match(planSkill, /scope: app \| module \| route \| feature \| page \| component \| pure_function/);

  assert.match(
    reviewSkill,
    /Frontend architecture comparison is active only when[\s\S]*selected dimensions include `code`, `architecture`, or `ALL`/,
  );
  assert.match(
    reviewSkill,
    /security-, performance-, or accessibility-only frontend\s+review[\s\S]*status: not-applicable/i,
  );
  assert.doesNotMatch(reviewSkill, /^For frontend scope, locate the selected approved plan/m);
  assert.doesNotMatch(reviewSkill, /^For any .*frontend scope, also load/m);

  const planDescription = planSkill.match(/^description:\s*(.+)$/m)?.[1] ?? '';
  assert.ok(planDescription.length > 0, 'sdcorejs-plan must have a frontmatter description');
  assert.doesNotMatch(planDescription, /[<>]/);
});

test('phase 1: Angular architecture templates keep selectors, providers, routes, and paths coherent', async () => {
  const [
    angularSkill,
    initPortal,
    entitySkeleton,
    orchestratorExamples,
    boundaryTemplates,
    initModule,
    initModuleTemplates,
    initEntity,
    screenList,
    screenDetail,
  ] = await Promise.all([
    readFile(new URL('../../skills/tracks/angular/sdcorejs-angular.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/init-portal.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/templates/entity-skeleton.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/templates/orchestrator-step-examples.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/templates/feature-component-boundaries.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/init-module.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/templates/init-module-templates.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/init-entity.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/screen-list.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/write-code/screen-detail.md', import.meta.url), 'utf8'),
  ]);

  assert.match(initPortal, /Render every unconditional file plus only the conditional selector\s+files approved by the frontend architecture plan/i);
  assert.doesNotMatch(initPortal, /render(?:ing)? every file|every listed section rendered/i);
  assert.match(orchestratorExamples, /Routed pages and approved feature components/);
  assert.match(
    orchestratorExamples,
    /simple worked request[\s\S]*two cohesive routed\s+page containers are intentional[\s\S]*not a maximum\s+component count/i,
  );
  assert.doesNotMatch(orchestratorExamples, /List \+ Detail components/);

  assert.doesNotMatch(angularSkill, /<entity>\.routes\.ts[^\n]*no providers/i);
  const featureProviderPair = entitySkeleton.match(
    /#### Feature-route-scoped pair \(default\)([\s\S]*?)#### Root-scoped stateless pair \(alternative\)/i,
  )?.[1] ?? '';
  const rootProviderPair = entitySkeleton.match(
    /#### Root-scoped stateless pair \(alternative\)([\s\S]*?)#### Active feature-route-scoped service template/i,
  )?.[1] ?? '';
  const assertAtomicProviderPairs = (rawFeaturePair, rawRootPair) => {
    assert.ok(rawFeaturePair, 'feature-route-scoped provider pair must be a named atomic section');
    assert.ok(rawRootPair, 'root-scoped provider pair must be a named atomic section');
    const featurePair = executableSource(rawFeaturePair);
    const rootPair = executableSource(rawRootPair);
    assert.match(
      featurePair,
      /^[ \t]*@Injectable\(\)[ \t]*$/m,
      'feature pair must contain an active feature-scoped decorator',
    );
    assert.doesNotMatch(
      featurePair,
      /^[ \t]*@Injectable\(\{[ \t]*providedIn:[ \t]*['"]root['"][ \t]*\}\)[ \t]*$/m,
      'feature pair must not use the root-scoped decorator',
    );
    assert.match(
      featurePair,
      /^[ \t]*import[ \t]+\{[ \t]*\[Entity\]Service[ \t]*\}[ \t]+from[ \t]+['"][^'"]+['"];?[ \t]*$/m,
    );
    assert.match(
      featurePair,
      /^[ \t]*providers:[ \t]*\[\[Entity\]Service\],[ \t]*$/m,
      'feature pair must contain an active route provider',
    );
    assert.match(
      rootPair,
      /^[ \t]*@Injectable\(\{[ \t]*providedIn:[ \t]*'root'[ \t]*\}\)[ \t]*$/m,
      'root pair must contain an active root-scoped decorator',
    );
    assert.doesNotMatch(
      rootPair,
      /^[ \t]*@Injectable\(\)[ \t]*$/m,
      'root pair must not use the feature-scoped decorator',
    );
    assert.match(rootPair, /neither a service import nor a route-level\s+service registration/i);
    assert.doesNotMatch(
      rootPair,
      /^[ \t]*import[ \t]+\{[ \t]*\[Entity\]Service[ \t]*\}[ \t]+from[ \t]+['"][^'"]+['"];?[ \t]*$/m,
    );
    assert.doesNotMatch(
      rootPair,
      /^[ \t]*providers[ \t]*:[^\r\n]*\[Entity\]Service[^\r\n]*$/m,
      'root pair must not contain an entity service route provider',
    );
  };
  assertAtomicProviderPairs(featureProviderPair, rootProviderPair);
  assert.throws(
    () => assertAtomicProviderPairs(
      `${featureProviderPair}\n@Injectable({ providedIn: 'root' })`,
      rootProviderPair,
    ),
    /feature pair must not use the root-scoped decorator/,
  );
  assert.throws(
    () => assertAtomicProviderPairs(
      `${featureProviderPair}\n@Injectable({ providedIn: "root" })`,
      rootProviderPair,
    ),
    /feature pair must not use the root-scoped decorator/,
  );
  assert.throws(
    () => assertAtomicProviderPairs(
      featureProviderPair,
      `${rootProviderPair}\n@Injectable()`,
    ),
    /root pair must not use the feature-scoped decorator/,
  );
  assert.throws(
    () => assertAtomicProviderPairs(
      featureProviderPair,
      `${rootProviderPair}\nproviders: [ [Entity]Service ],`,
    ),
    /root pair must not contain an entity service route provider/,
  );

  const commentedFeatureDecoratorPair = featureProviderPair.replace(
    /^([ \t]*)(@Injectable\(\))/m,
    '$1// $2',
  );
  assert.notEqual(
    commentedFeatureDecoratorPair,
    featureProviderPair,
    'feature decorator comment mutation must be applied',
  );
  assert.throws(
    () => assertAtomicProviderPairs(commentedFeatureDecoratorPair, rootProviderPair),
    /feature pair must contain an active feature-scoped decorator/,
  );

  const commentedFeatureProviderPair = featureProviderPair.replace(
    /^([ \t]*)(providers:[ \t]*\[\[Entity\]Service\],?)/m,
    '$1// $2',
  );
  assert.notEqual(
    commentedFeatureProviderPair,
    featureProviderPair,
    'feature provider comment mutation must be applied',
  );
  assert.throws(
    () => assertAtomicProviderPairs(commentedFeatureProviderPair, rootProviderPair),
    /feature pair must contain an active route provider/,
  );

  const blockCommentedFeatureDecoratorPair = blockCommentFirstMatch(
    featureProviderPair,
    /^[ \t]*@Injectable\(\)[ \t]*$/m,
    'block-commented feature decorator',
  );
  assert.throws(
    () => assertAtomicProviderPairs(blockCommentedFeatureDecoratorPair, rootProviderPair),
    /feature pair must contain an active feature-scoped decorator/,
  );

  const blockCommentedFeatureProviderPair = blockCommentFirstMatch(
    featureProviderPair,
    /^[ \t]*providers:[ \t]*\[\[Entity\]Service\],[ \t]*$/m,
    'block-commented feature provider',
  );
  assert.throws(
    () => assertAtomicProviderPairs(blockCommentedFeatureProviderPair, rootProviderPair),
    /feature pair must contain an active route provider/,
  );

  const blockCommentedRootDecoratorPair = blockCommentFirstMatch(
    rootProviderPair,
    /^[ \t]*@Injectable\(\{[ \t]*providedIn:[ \t]*'root'[ \t]*\}\)[ \t]*$/m,
    'block-commented root decorator',
  );
  assert.throws(
    () => assertAtomicProviderPairs(featureProviderPair, blockCommentedRootDecoratorPair),
    /root pair must contain an active root-scoped decorator/,
  );

  const htmlCommentedFeatureProviderPair = htmlCommentFirstMatch(
    featureProviderPair,
    /^[ \t]*providers:[ \t]*\[\[Entity\]Service\],[ \t]*$/m,
    'HTML-commented feature provider',
  );
  assert.throws(
    () => assertAtomicProviderPairs(htmlCommentedFeatureProviderPair, rootProviderPair),
    /feature pair must contain an active route provider/,
  );
  assert.match(orchestratorExamples, /@Injectable\(\)[\s\S]*providers: \[ProductService\]/);

  assert.match(boundaryTemplates, /import \{ ActivatedRoute, Router \} from '@angular\/router';/);
  assert.match(boundaryTemplates, /navigate\(\[action\.kind, action\.id\], \{ relativeTo: this\.#route \}\)/);
  assert.match(entitySkeleton, /navigate\(\['create'\], \{ relativeTo: this\.#activatedRoute \}\)/);
  assert.match(entitySkeleton, /navigate\(\['detail', id\], \{ relativeTo: this\.#activatedRoute \}\)/);
  assert.doesNotMatch(entitySkeleton, /navigate\(\[(?:'create'|'detail', id)\]\);/);
  assert.match(boundaryTemplates, /readonly rows = signal<readonly \[Entity\]DTO\[\]>/);
  assert.match(boundaryTemplates, /export interface \[Entity\]RowVM/);

  assert.match(initModule, /detect(?:ed)? the feature root and entity-route naming convention/i);
  assert.match(initModuleTemplates, /import\('\.\/\[featureRoot\]\/\[entity-a\]'\)/);
  assert.match(initModuleTemplates, /import\('\.\/\[featureRoot\]\/\[entity-b\]'\)/);
  assert.match(initModuleTemplates, /import\('\.\/\[featureRoot\]\/\[entity\]'\)/);
  assert.doesNotMatch(initModuleTemplates, /import\('\.\/features\//);
  assert.match(initEntity, /include=src\/libs\/\[module\]\/\[featureRoot\]\/\[entity\]\/\*\*\/\*\.spec\.ts/);

  assert.match(screenList, /feature-component-boundaries\.md#list-routepage-and-child-contracts/);
  assert.match(screenDetail, /feature-component-boundaries\.md#detail-routepage-and-form-section-contracts/);
});

test('phase 1: frontend architecture references remain progressive and assertion-backed', async () => {
  const [frontendArchitecture, boundaryTemplates, angularSkill, nextjsInitSite] = await Promise.all([
    readFile(new URL('../../_refs/shared/frontend-architecture.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/angular/templates/feature-component-boundaries.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/tracks/angular/sdcorejs-angular.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/nextjs/build-website/write-code/init-site.md', import.meta.url), 'utf8'),
  ]);

  assert.match(frontendArchitecture, /## Contents[\s\S]*Discover Project Conventions[\s\S]*Mandatory Output Contract[\s\S]*Plan and Review Enforcement/);
  assert.match(nextjsInitSite, /feature-local blocks[\s\S]*stable shared consumers/i);
  assert.doesNotMatch(nextjsInitSite, /sections must live in `src\/components\/sections\/`/i);

  assert.match(boundaryTemplates, /toHaveBeenCalledOnceWith/);
  assert.match(boundaryTemplates, /toEqual/);
  assert.match(boundaryTemplates, /\.not\.toBe\(/);
  assert.match(boundaryTemplates, /Tests must contain executable assertions and fail\s+RED before implementation/i);

  const contractTestSection = boundaryTemplates.split('## Architecture Contract Tests')[1] ?? '';
  const contractCases = [...contractTestSection.matchAll(/^  it\([\s\S]*?^  \}\);/gm)].map(match => match[0]);
  assert.equal(contractCases.length, 5, 'every documented architecture contract case must be present');
  for (const contractCase of contractCases) {
    assert.match(
      executableSource(contractCase),
      /^[ \t]*expect\(/m,
      'each architecture contract case must execute an active assertion',
    );
  }

  const providerLifecycleCase = contractCases.find(contractCase =>
    /creates isolated facade and service instances for separate feature injectors/i.test(contractCase),
  );
  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expectsDifferentInstances = ([, first], [, second]) => new RegExp(
    `^[\\t ]*expect\\([\\t ]*${escapeRegex(first)}[\\t ]*\\)` +
      `[\\t ]*\\.not\\.toBe\\([\\t ]*${escapeRegex(second)}[\\t ]*\\);?[\\t ]*$`,
    'm',
  );
  const assertIsolatedProviderLifecycle = rawContractCase => {
    assert.ok(rawContractCase, 'provider lifecycle contract case must prove facade and service isolation');
    const contractCase = executableSource(rawContractCase);
    assert.match(
      contractCase,
      /^[ \t]*const createService = \(\) =>[ \t]*(?:\r?\n[ \t]*)?jasmine\.createSpyObj<\[Entity\]Service>\([ \t]*'\[Entity\]Service'[ \t]*,[ \t]*\[[ \t]*'search'[ \t]*\][ \t]*\);[ \t]*$/m,
      'provider lifecycle factory must return a fresh service spy directly',
    );
    const providersBlock = contractCase.match(
      /^[ \t]*const featureProviders = \[([\s\S]*?)^[ \t]*\];[ \t]*$/m,
    )?.[1] ?? '';
    assert.ok(providersBlock, 'provider lifecycle must define a featureProviders block');
    assert.match(
      providersBlock,
      /^[ \t]*\[Entity\]Facade,[ \t]*$/m,
      'feature provider block must actively register the facade',
    );
    assert.match(
      providersBlock,
      /^[ \t]*\{[ \t]*provide:[ \t]*\[Entity\]Service,[ \t]*useFactory:[ \t]*createService[ \t]*\},?[ \t]*$/m,
      'provider lifecycle must actively register the service factory',
    );
    assert.doesNotMatch(
      providersBlock,
      /^[ \t]*\{[ \t]*provide:[ \t]*\[Entity\]Service,[ \t]*useValue:/m,
    );
    const providerLines = providersBlock
      .split(/\r?\n/)
      .map(line => line.trim().replace(/[ \t]+/g, ' '))
      .filter(Boolean);
    assert.deepEqual(
      providerLines,
      [
        '[Entity]Facade,',
        '{ provide: [Entity]Service, useFactory: createService },',
      ],
      'featureProviders must contain exactly one facade and one service factory provider',
    );

    const serviceBindings = [...contractCase.matchAll(
      /^[ \t]*const[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*([A-Za-z_$][\w$]*)\.get\(\[Entity\]Service\);?[ \t]*$/gm,
    )];
    const facadeBindings = [...contractCase.matchAll(
      /^[ \t]*const[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*([A-Za-z_$][\w$]*)\.get\(\[Entity\]Facade\);?[ \t]*$/gm,
    )];
    const injectorCreations = [...contractCase.matchAll(
      /^[ \t]*const[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*createEnvironmentInjector\([ \t]*\r?\n[ \t]*featureProviders,[ \t]*\r?\n[ \t]*parent,[ \t]*\r?\n[ \t]*\);[ \t]*$/gm,
    )].map(match => match[1]);
    assert.equal(
      injectorCreations.length,
      2,
      'provider lifecycle must create two independent environment injectors',
    );
    assert.equal(
      new Set(injectorCreations).size,
      2,
      'provider lifecycle must create two independent environment injectors',
    );
    assert.equal(serviceBindings.length, 2, 'both feature injectors must resolve their service instance');
    assert.equal(facadeBindings.length, 2, 'both feature injectors must resolve their facade instance');
    const createdInjectors = new Set(injectorCreations);
    for (const [, , injector] of [...serviceBindings, ...facadeBindings]) {
      assert.ok(createdInjectors.has(injector), `${injector} must be created with createEnvironmentInjector`);
    }
    assert.notEqual(serviceBindings[0][2], serviceBindings[1][2], 'service instances must come from different injectors');
    assert.notEqual(facadeBindings[0][2], facadeBindings[1][2], 'facade instances must come from different injectors');
    assert.match(
      contractCase,
      expectsDifferentInstances(serviceBindings[0], serviceBindings[1]),
      'provider lifecycle must assert service instance isolation',
    );
    assert.match(
      contractCase,
      expectsDifferentInstances(facadeBindings[0], facadeBindings[1]),
      'provider lifecycle must assert facade instance isolation',
    );
  };
  assertIsolatedProviderLifecycle(providerLifecycleCase);

  const aliasedInjectorCase = providerLifecycleCase.replace(
    /const secondInjector = createEnvironmentInjector\([\s\S]*?\n    \);/,
    'const secondInjector = firstInjector;',
  );
  assert.notEqual(aliasedInjectorCase, providerLifecycleCase, 'injector alias mutation must be applied');
  assert.throws(
    () => assertIsolatedProviderLifecycle(aliasedInjectorCase),
    /provider lifecycle must create two independent environment injectors/,
  );

  const commentedFactoryProviderCase = providerLifecycleCase.replace(
    /^([ \t]*)(\{[ \t]*provide:[ \t]*\[Entity\]Service,[ \t]*useFactory:[ \t]*createService[ \t]*\},?)/m,
    '$1// $2',
  );
  assert.notEqual(
    commentedFactoryProviderCase,
    providerLifecycleCase,
    'service factory provider comment mutation must be applied',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(commentedFactoryProviderCase),
    /provider lifecycle must actively register the service factory/,
  );

  const commentedFacadeProviderCase = providerLifecycleCase.replace(
    /^([ \t]*)(\[Entity\]Facade,)/m,
    '$1// $2',
  );
  assert.notEqual(
    commentedFacadeProviderCase,
    providerLifecycleCase,
    'facade provider comment mutation must be applied',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(commentedFacadeProviderCase),
    /feature provider block must actively register the facade/,
  );

  const relocatedFactoryProviderCase = providerLifecycleCase
    .replace(
      /^([ \t]*)(\{[ \t]*provide:[ \t]*\[Entity\]Service,[ \t]*useFactory:[ \t]*createService[ \t]*\},?)/m,
      '$1// $2',
    )
    .replace(
      /^([ \t]*const firstInjector)/m,
      '    { provide: [Entity]Service, useFactory: createService },\n$1',
    );
  assert.notEqual(
    relocatedFactoryProviderCase,
    providerLifecycleCase,
    'relocated factory provider mutation must be applied',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(relocatedFactoryProviderCase),
    /provider lifecycle must actively register the service factory/,
  );

  const duplicateServiceOverrideCase = providerLifecycleCase.replace(
    /^([ \t]*\];[ \t]*)$/m,
    '      { provide: [Entity]Service, useFactory: getSharedService },\n$1',
  );
  assert.notEqual(
    duplicateServiceOverrideCase,
    providerLifecycleCase,
    'duplicate service override mutation must be applied',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(duplicateServiceOverrideCase),
    /featureProviders must contain exactly one facade and one service factory provider/,
  );

  const duplicateFacadeOverrideCase = providerLifecycleCase.replace(
    /^([ \t]*\];[ \t]*)$/m,
    '      { provide: [Entity]Facade, useValue: sharedFacade },\n$1',
  );
  assert.notEqual(
    duplicateFacadeOverrideCase,
    providerLifecycleCase,
    'duplicate facade override mutation must be applied',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(duplicateFacadeOverrideCase),
    /featureProviders must contain exactly one facade and one service factory provider/,
  );

  const commentedServiceExpectationCase = providerLifecycleCase.replace(
    /^([ \t]*)(expect\(firstService\)\.not\.toBe\(secondService\);)/m,
    '$1// $2',
  );
  assert.notEqual(
    commentedServiceExpectationCase,
    providerLifecycleCase,
    'service expectation comment mutation must be applied',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(commentedServiceExpectationCase),
    /provider lifecycle must assert service instance isolation/,
  );

  const commentedFacadeExpectationCase = providerLifecycleCase.replace(
    /^([ \t]*)(expect\(firstFacade\)\.not\.toBe\(secondFacade\);)/m,
    '$1// $2',
  );
  assert.notEqual(
    commentedFacadeExpectationCase,
    providerLifecycleCase,
    'facade expectation comment mutation must be applied',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(commentedFacadeExpectationCase),
    /provider lifecycle must assert facade instance isolation/,
  );

  const blockCommentedFactoryDeclarationCase = blockCommentFirstMatch(
    providerLifecycleCase,
    /^[ \t]*const createService = \(\) =>[ \t]*\r?\n[ \t]*jasmine\.createSpyObj<\[Entity\]Service>\([^;\r\n]+\);[ \t]*$/m,
    'block-commented service factory declaration',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(blockCommentedFactoryDeclarationCase),
    /provider lifecycle factory must return a fresh service spy directly/,
  );

  const blockCommentedFactoryProviderCase = blockCommentFirstMatch(
    providerLifecycleCase,
    /^[ \t]*\{[ \t]*provide:[ \t]*\[Entity\]Service,[ \t]*useFactory:[ \t]*createService[ \t]*\},?[ \t]*$/m,
    'block-commented service factory provider',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(blockCommentedFactoryProviderCase),
    /provider lifecycle must actively register the service factory/,
  );

  const htmlCommentedFactoryProviderCase = htmlCommentFirstMatch(
    providerLifecycleCase,
    /^[ \t]*\{[ \t]*provide:[ \t]*\[Entity\]Service,[ \t]*useFactory:[ \t]*createService[ \t]*\},?[ \t]*$/m,
    'HTML-commented service factory provider',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(htmlCommentedFactoryProviderCase),
    /provider lifecycle must actively register the service factory/,
  );

  const wrongSecondInjectorProvidersCase = providerLifecycleCase.replace(
    /(const secondInjector = createEnvironmentInjector\([ \t]*\r?\n)([ \t]*)featureProviders,/,
    '$1$2[],',
  );
  assert.notEqual(
    wrongSecondInjectorProvidersCase,
    providerLifecycleCase,
    'wrong second-injector providers mutation must be applied',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(wrongSecondInjectorProvidersCase),
    /provider lifecycle must create two independent environment injectors/,
  );

  const blockCommentedServiceBindingCase = blockCommentFirstMatch(
    providerLifecycleCase,
    /^[ \t]*const firstService = firstInjector\.get\(\[Entity\]Service\);[ \t]*$/m,
    'block-commented service binding',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(blockCommentedServiceBindingCase),
    /both feature injectors must resolve their service instance/,
  );

  const blockCommentedFacadeBindingCase = blockCommentFirstMatch(
    providerLifecycleCase,
    /^[ \t]*const firstFacade = firstInjector\.get\(\[Entity\]Facade\);[ \t]*$/m,
    'block-commented facade binding',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(blockCommentedFacadeBindingCase),
    /both feature injectors must resolve their facade instance/,
  );

  const blockCommentedServiceExpectationCase = blockCommentFirstMatch(
    providerLifecycleCase,
    /^[ \t]*expect\(firstService\)\.not\.toBe\(secondService\);[ \t]*$/m,
    'block-commented service isolation expectation',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(blockCommentedServiceExpectationCase),
    /provider lifecycle must assert service instance isolation/,
  );

  const blockCommentedFacadeExpectationCase = blockCommentFirstMatch(
    providerLifecycleCase,
    /^[ \t]*expect\(firstFacade\)\.not\.toBe\(secondFacade\);[ \t]*$/m,
    'block-commented facade isolation expectation',
  );
  assert.throws(
    () => assertIsolatedProviderLifecycle(blockCommentedFacadeExpectationCase),
    /provider lifecycle must assert facade instance isolation/,
  );

  const sharedFactoryCase = providerLifecycleCase.replace(
    "jasmine.createSpyObj<[Entity]Service>('[Entity]Service', ['search']);",
    "jasmine.createSpyObj<[Entity]Service>('[Entity]Service', ['search']) && getSharedService();",
  );
  assert.notEqual(sharedFactoryCase, providerLifecycleCase, 'shared factory mutation must be applied');
  assert.throws(
    () => assertIsolatedProviderLifecycle(sharedFactoryCase),
    /provider lifecycle factory must return a fresh service spy directly/,
  );

  const architectureRefMentions = angularSkill.match(/_refs\/shared\/frontend-architecture\.md/g) ?? [];
  assert.ok(architectureRefMentions.length <= 3, 'Angular orchestrator should delegate architecture detail to the shared reference');
  assert.doesNotMatch(angularSkill, /^### Frontend architecture gate/m);
});

test('phase 1: Core docs fetcher prefers installed lockfile version over package range', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sdcorejs-core-docs-'));
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ dependencies: { '@sdcorejs/angular': '^20' } }),
    'utf8'
  );
  await writeFile(
    join(root, 'package-lock.json'),
    JSON.stringify({
      packages: {
        'node_modules/@sdcorejs/angular': {
          version: '20.0.7'
        }
      }
    }),
    'utf8'
  );

  const { detectInstalledVersion } = await import('../../_refs/angular/core-docs-fetch.mjs');

  assert.equal(detectInstalledVersion(root), '20.0.7');
});

test('phase 1: Core docs fetcher requires an installed Core UI package when requested', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sdcorejs-plain-angular-'));
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ dependencies: { '@angular/core': '^20.0.0', '@angular/material': '^20.0.0' } }),
    'utf8'
  );

  const script = fileURLToPath(new URL('../../_refs/angular/core-docs-fetch.mjs', import.meta.url));
  const result = await execFileResult(process.execPath, [script, '--cwd', root, '--require-installed', '--list']);

  assert.equal(result.code, 1);
  assert.match(result.stderr, /Core UI package not installed/);
  assert.match(result.stderr, /plain-angular/);
  assert.doesNotMatch(result.stderr, /HTTP \d+/);
});

test('phase 1: Core docs fetcher detects the legacy Core UI package name', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sdcorejs-legacy-core-docs-'));
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ dependencies: { '@sd-angular/core': '^19' } }),
    'utf8'
  );

  const { detectInstalledPackage, detectInstalledVersion } = await import('../../_refs/angular/core-docs-fetch.mjs');

  assert.deepEqual(detectInstalledPackage(root), { name: '@sd-angular/core', version: '19.0.0' });
  assert.equal(detectInstalledVersion(root), '19.0.0');
});

test('phase 1: long references expose a top-of-file contents map', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));

  for (const file of pack.referenceDocs) {
    const text = await readFile(file, 'utf8');
    const lineCount = text.split(/\r?\n/).length;
    if (lineCount < 500) continue;

    assert.match(
      text.slice(0, 2000),
      /contents|table of contents/i,
      `${file} has ${lineCount} lines and needs a top-of-file contents map`
    );
  }
});

test('phase 1: skill metadata stays concise and production scope stays explicit', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const maxDescriptionChars = 520;

  for (const skill of pack.sourceSkills) {
    assert.ok(
      skill.description.length <= maxDescriptionChars,
      `${skill.name} description has ${skill.description.length} chars`
    );
  }

  const agents = await readFile(new URL('../../AGENTS.md', import.meta.url), 'utf8');
  assert.match(agents, /## Production SDLC Scope Decision/);
  assert.match(agents, /Do \*\*not\*\* add new production-SDLC skills or refs/);

  assert.match(agents, /developers and technical teams/i);
});

test('phase 1: explore encodes read-only-safe context production invariants', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));
  const explore = sourceByName.get('sdcorejs-explore');
  const codexExplore = pack.codexMirrorSkills.find((skill) => skill.name === 'sdcorejs-explore')?.text;
  const projectContext = await readFile(new URL('../../_refs/shared/project-context.md', import.meta.url), 'utf8');
  const runtimeProtocols = await readFile(new URL('../../_refs/shared/runtime-protocols.md', import.meta.url), 'utf8');

  assert.ok(explore, 'sdcorejs-explore exists');
  assert.ok(codexExplore, 'sdcorejs-explore Codex mirror exists');
  assert.match(explore, /^description:\s*(?:"[^"\n]+?"|'[^'\n]+?'|>-)$/m, 'explore description is quoted or folded for strict YAML');

  for (const text of [explore, codexExplore]) {
    assert.match(text, /explore_action/);
    assert.match(text, /summary-read/);
    assert.match(text, /summary-refresh/);
    assert.match(text, /code-map-readonly/);
    assert.match(text, /trace-flow-readonly/);
    assert.match(text, /env-setup-readonly/);
    assert.match(text, /env-setup-write-approved/);
    assert.match(text, /recovery-readonly/);
    assert.match(text, /persona-read/);
    assert.match(text, /persona-write-approved/);
    assert.match(text, /memories-read/);
    assert.match(text, /memories-write-approved/);
    assert.match(text, /documentation-harvest-readonly/);
    assert.match(text, /read-only explore actions must not write/i);
    assert.match(text, /Missing or stale summary is not .*permission to write|not itself permission to write/i);
    assert.match(text, /target_root_kind/);
    assert.match(text, /sdcorejs-agent-authoring-repo/);
    assert.match(text, /skill-pack-authoring-repo/);
    assert.match(text, /explore_context/);
    assert.match(text, /stack_profiles/);
    assert.match(text, /profile_evidence/);
    assert.match(text, /core-ui-angular/);
    assert.match(text, /legacy-core-ui-angular/);
    assert.match(text, /plain-angular/);
    assert.match(text, /sdcorejs-nestjs/);
    assert.match(text, /plain-nestjs/);
    assert.match(text, /nextjs-build-website/);
    assert.match(text, /plain-nextjs/);
    assert.match(text, /react-vite/);
    assert.match(text, /react-cra/);
    assert.match(text, /react-next-generic/);
    assert.match(text, /node-general/);
    assert.match(text, /profile_confidence/);
    assert.match(text, /project_context/);
    assert.match(text, /workspace_structure/);
    assert.match(text, /dependency_manifests/);
    assert.match(text, /source_roots/);
    assert.match(text, /git ls-files/);
    assert.match(text, /node_modules/);
    assert.match(text, /generated\/vendor\/build|vendor\/generated\/build|vendor.*generated.*build/i);
    assert.match(text, /codex\/skills/);
    assert.match(text, /\.env files? for values|Do not scan `.env` files for values/i);
    assert.match(text, /never overwrite existing env files/i);
    assert.match(text, /explicit approval/i);
    assert.match(text, /REDACTED|redact|PII/i);
    assert.match(text, /Recovery is read-only|recovery mode is read-only/i);
    assert.match(text, /1\. Continue the previous task/);
    assert.match(text, /<YYYY-MM-DD>|use current date/i);
    assert.doesNotMatch(text, /2026-06-18/);
    assert.match(text, /source_skill:\s*sdcorejs-explore/);
    assert.match(text, /general, angular, nestjs, nextjs, react, product, design, test, documentation, workflow/);
    assert.match(text, /Do not default every memory to angular/i);
    assert.match(text, /Documentation harvest must first detect the actual stack_profile/i);
    assert.match(text, /Do not assume SDCoreJS\/Core UI\/TypeORM\/build-website conventions/i);
  }
  assert.match(runtimeProtocols, /Current user instructions, files, diffs/);

  assert.match(projectContext, /context_mode|caller_context/);
  assert.match(projectContext, /summary-read/);
  assert.match(projectContext, /summary-refresh/);
  assert.match(projectContext, /must never recursively invoke sdcorejs-explore|never recursively invoke/i);
  assert.match(projectContext, /read-(?:only|oriented)[\s\S]{0,30}context|context itself is always read-only/i);
  assert.match(
    projectContext,
    /missing or stale summary is (?:not .*permission to write|a context signal, never write permission)|not itself permission to write/i
  );
});

test('phase 1: SDLC harness encodes contract-driven profile-aware execution invariants', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceSkillByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill]));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));
  const brainstorming = sourceByName.get('sdcorejs-brainstorming');
  const brainstormingMeta = sourceSkillByName.get('sdcorejs-brainstorming');
  const spec = sourceByName.get('sdcorejs-spec');
  const plan = sourceByName.get('sdcorejs-plan');
  const executePlan = sourceByName.get('sdcorejs-execute-plan');
  const executePlanMeta = sourceSkillByName.get('sdcorejs-execute-plan');
  const parallel = sourceByName.get('sdcorejs-parallel-dispatch');
  const agents = await readFile(new URL('../../AGENTS.md', import.meta.url), 'utf8');
  const finishGate = await readFile(new URL('../../_refs/shared/finish-gate.md', import.meta.url), 'utf8');

  assert.match(brainstormingMeta.description, /React/);
  assert.match(brainstormingMeta.description, /Node/);
  assert.match(brainstormingMeta.description, /fullstack/);
  assert.match(brainstormingMeta.description, /documentation/);
  assert.match(brainstormingMeta.description, /workflow/);
  assert.match(executePlanMeta.description, /React/);
  assert.match(executePlanMeta.description, /Node/);
  assert.match(executePlanMeta.description, /fullstack/);
  assert.match(executePlanMeta.description, /documentation/);
  assert.match(executePlanMeta.description, /workflow/);

  assert.match(brainstorming, /requirement_context:/);
  assert.match(brainstorming, /contract_id/);
  assert.match(brainstorming, /target_root_kind/);
  assert.match(brainstorming, /stack_profile/);
  assert.match(brainstorming, /profile_confidence/);
  assert.match(brainstorming, /profile_evidence/);
  assert.match(brainstorming, /source:\s*explicit\s*\|\s*inferred\s*\|\s*defaulted/);
  assert.match(brainstorming, /visual_companion:[\s\S]*artifact_write_approved/);
  assert.match(brainstorming, /next_skill:\s*sdcorejs-spec/);
  assert.match(brainstorming, /core-ui-angular/);
  assert.match(brainstorming, /legacy-core-ui-angular/);
  assert.match(brainstorming, /plain-angular/);
  assert.match(brainstorming, /sdcorejs-nestjs/);
  assert.match(brainstorming, /plain-nestjs/);
  assert.match(brainstorming, /nextjs-build-website/);
  assert.match(brainstorming, /plain-nextjs/);
  assert.match(brainstorming, /react-vite/);
  assert.match(brainstorming, /react-cra/);
  assert.match(brainstorming, /react-next-generic/);
  assert.match(brainstorming, /node-general/);
  assert.match(brainstorming, /migration-request/);
  assert.match(brainstorming, /Do not classify .*Core UI.*angular\.json|Do not classify .*Core UI.*@angular\/core/i);
  assert.match(brainstorming, /Do not assume TypeORM, PostgreSQL, Zod/i);
  assert.match(brainstorming, /Do not assume \[locale\]|Do not assume build-website/i);
  assert.match(brainstorming, /profile-aware blockers|Blockers must be profile-aware/i);
  assert.match(brainstorming, /summary-read/);
  assert.match(brainstorming, /code-map-readonly/);
  assert.match(brainstorming, /Do not write specs?, plans?, or code/i);
  assert.match(brainstorming, /REDACTED|redact|PII/i);
  assert.doesNotMatch(brainstorming, /summary-refresh.*by default/i);

  assert.match(spec, /spec_context:/);
  assert.match(spec, /source_requirement_context/);
  assert.match(spec, /approved_spec_hash/);
  assert.match(spec, /target_root_kind/);
  assert.match(spec, /stack_profile/);
  assert.match(spec, /acceptance_criteria_count/);
  assert.match(spec, /manual_criteria_count/);
  assert.match(spec, /approval_source:\s*explicit-user-choice\s*\|\s*imported-approved-spec\s*\|\s*equivalent-complete-input/);
  assert.match(spec, /change_control:[\s\S]*supersedes[\s\S]*change_reason/);
  assert.match(spec, /immutable/i);
  assert.match(spec, /approved contract body excluding frontmatter and (?:the |this )?hash field/i);
  assert.doesNotMatch(spec, /approved_spec_hash: <sha256 of approved snapshot body>/);
  assert.match(spec, /AC-[0-9]+|stable IDs/i);
  assert.match(spec, /REDACTED|redact|PII/i);

  assert.match(plan, /plan_context:/);
  assert.match(plan, /approved_spec_hash/);
  assert.match(plan, /approved_plan_hash/);
  assert.match(plan, /allowed_paths/);
  assert.match(plan, /prohibited_paths/);
  assert.match(plan, /dependency_changes/);
  assert.match(plan, /env_changes/);
  assert.match(plan, /migration_changes/);
  assert.match(plan, /verification_strategy/);
  assert.match(plan, /packageManager|lockfiles|package\.json scripts/i);
  assert.match(plan, /commands_planned/);
  assert.match(plan, /commands_skipped/);
  assert.match(plan, /parallel_candidates/);
  assert.match(plan, /shared_files/);
  assert.match(plan, /must not copy the full spec body/i);
  assert.match(plan, /branch_ready_final_gate/);
  assert.match(plan, /approved plan body excluding frontmatter and (?:the |this )?hash field/i);
  assert.doesNotMatch(plan, /approved_plan_hash: <sha256 of approved plan snapshot body>/);
  assert.match(plan, /git status --short/);
  assert.match(plan, /Do not hardcode npm\/npx|Do not hardcode npm|Do not present npm\/npx/i);
  assert.doesNotMatch(plan, /npm run test\s*$/m);

  assert.match(executePlan, /required-actions: .*artifact\.write/);
  assert.match(executePlan, /execution_context:/);
  assert.match(executePlan, /plan_context/);
  assert.match(executePlan, /working_tree_preflight/);
  assert.match(executePlan, /git status --short/);
  assert.match(executePlan, /staged diffstat/);
  assert.match(executePlan, /unstaged diffstat/);
  assert.match(executePlan, /untracked files/);
  assert.match(executePlan, /allowed_paths/);
  assert.match(executePlan, /prohibited_paths/);
  assert.match(executePlan, /current_HEAD/);
  assert.match(executePlan, /target_root_kind/);
  assert.match(executePlan, /sdcorejs-agent-authoring-repo/);
  assert.match(executePlan, /plain-nestjs/);
  assert.match(executePlan, /plain-nextjs/);
  assert.match(executePlan, /react-vite/);
  assert.match(executePlan, /react-cra/);
  assert.match(executePlan, /node-general/);
  assert.match(executePlan, /generic harness fallback/);
  assert.match(executePlan, /runtime-protocols\.md/);
  assert.match(executePlan, /targeted[\s\S]{0,80}reads/);
  assert.match(executePlan, /scoped code map/);
  assert.match(executePlan, /Do not route plain Angular|plain-angular.*generic harness/i);
  assert.match(executePlan, /Do not route plain NestJS|plain-nestjs.*generic harness/i);
  assert.match(executePlan, /Do not route plain Next\.js|plain-nextjs.*generic harness/i);
  assert.match(executePlan, /commands_run/);
  assert.match(executePlan, /commands_skipped/);

  const runtimeProtocols = await readFile(new URL('../../_refs/shared/runtime-protocols.md', import.meta.url), 'utf8');
  assert.match(runtimeProtocols, /project-context\.md/);

  assert.match(parallel, /required-actions: .*artifact\.write/);
  assert.match(parallel, /parallel_context:/);
  assert.match(parallel, /allowed_paths_by_unit/);
  assert.match(parallel, /prohibited_paths/);
  assert.match(parallel, /shared_files/);
  assert.match(parallel, /stack_profile/);
  assert.match(parallel, /global_verification/);
  assert.match(parallel, /final branch-ready|branch-ready.*final/i);
  assert.match(parallel, /No writes after branch-ready/i);
  assert.match(parallel, /do\s+not refresh the summary merely because execution is\s+write-approved/i);
  assert.doesNotMatch(parallel, /write-approved execution context,\s*use `summary-refresh`/i);

  assert.match(agents + finishGate, /branch-ready.*final read-only gate|final read-only gate.*branch-ready/i);
  assert.match(agents + finishGate, /No writes after branch-ready|writes after branch-ready.*re-run/i);
});

test('phase 1: reusable skill source stays English-only while runtime output is localized', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const vietnameseTextPattern = /[\u0102\u0103\u00c2\u00e2\u0110\u0111\u00ca\u00ea\u00d4\u00f4\u01a0\u01a1\u01af\u01b0\u00c0\u00c1\u00c3\u00c8\u00c9\u00cc\u00cd\u00d2\u00d3\u00d5\u00d9\u00da\u00dd\u00e0\u00e1\u00e3\u00e8\u00e9\u00ec\u00ed\u00f2\u00f3\u00f5\u00f9\u00fa\u00fd\u1ea0-\u1ef9]/u;

  for (const skill of pack.sourceSkills) {
    assert.doesNotMatch(skill.text, vietnameseTextPattern, `${skill.name} source should not hardcode Vietnamese prose`);
  }

  for (const file of pack.referenceDocs) {
    const text = await readFile(file, 'utf8');
    assert.doesNotMatch(text, vietnameseTextPattern, `${file} should stay English-only`);
  }

  const extraEnglishOnlyFiles = [
    '../../_refs/angular/core-docs-fetch.mjs',
    '../../AGENTS.md',
    '../../CLAUDE.md',
    '../../docs/po-ba-prototype-examples.md'
  ];

  for (const file of extraEnglishOnlyFiles) {
    const text = await readFile(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(text, vietnameseTextPattern, `${file} should stay English-only`);
  }

  const agents = await readFile(new URL('../../AGENTS.md', import.meta.url), 'utf8');
  const claude = await readFile(new URL('../../CLAUDE.md', import.meta.url), 'utf8');
  assert.match(agents, /Skill Source Language/);
  assert.match(claude, /Skill Source Language/);
  assert.match(agents, /Localization test prompts may use non-English input/);
  assert.match(claude, /Localization test prompts may use non-English input/);
});

test('phase 1: localization fixtures may contain non-English intent prompts', async () => {
  const promptEvals = await loadPromptEvals();
  const localizedCases = promptEvals.filter((item) => item.id.endsWith('-localized'));

  assert.ok(localizedCases.length >= 4, `localizedCases=${localizedCases.length}`);
  assert.ok(
    localizedCases.some((item) => /\btoi\b|\bthem\b|\bxay\b|\bthiet\b|\bviet\b/.test(item.prompt)),
    'localized prompt fixtures exercise non-English intent input'
  );
});

test('phase 1: generated mirrors do not inject global response-style modifiers', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const bannedPatterns = [/response-style/, /terse mode/i, new RegExp(`cave${'man'}`, 'i')];

  for (const skill of [...pack.claudeMirrorSkills, ...pack.pluginMirrorSkills, ...pack.codexMirrorSkills]) {
    for (const pattern of bannedPatterns) {
      assert.doesNotMatch(skill.text, pattern, `${skill.path} should not contain ${pattern}`);
    }
  }

  for (const skill of pack.codexMirrorSkills) {
    assert.match(skill.text, /\.\.\/<skill-name>\/SKILL\.md/, `${skill.path} documents sibling skill resolution`);
    assert.doesNotMatch(skill.text, /\.\.\/\/SKILL\.md/, `${skill.path} should not contain malformed sibling skill path`);
  }
});

test('phase 1: text hygiene scanner rejects hidden control and bidi characters', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sdcorejs-text-hygiene-'));
  const script = fileURLToPath(new URL('../../scripts/check-text-hygiene.mjs', import.meta.url));
  const badFile = join(root, 'bad.md');

  await writeFile(join(root, 'clean.md'), 'safe markdown\n', 'utf8');
  await writeFile(badFile, `bad\u202etext\n`, 'utf8');

  const failed = await execFileResult(process.execPath, [script, root]);
  assert.notEqual(failed.code, 0);
  assert.match(failed.stderr, /bad\.md:1:4 U\+202E/);
  assert.match(failed.stderr, /bidirectional/);

  await writeFile(badFile, 'clean text\n', 'utf8');
  const passed = await execFileResult(process.execPath, [script, root]);
  assert.equal(passed.code, 0, passed.stderr);
  assert.match(passed.stdout, /Text hygiene check passed/);

  const gitRoot = await mkdtemp(join(tmpdir(), 'sdcorejs-text-hygiene-git-'));
  await execFileResult('git', ['init'], { cwd: gitRoot });
  await writeFile(join(gitRoot, 'untracked.md'), `bad\u202etext\n`, 'utf8');
  const untrackedFailed = await execFileResult(process.execPath, [script, gitRoot]);
  assert.notEqual(untrackedFailed.code, 0);
  assert.match(untrackedFailed.stderr, /untracked\.md:1:4 U\+202E/);
});

test('phase 1: public validation docs separate validation tiers and evidence limits', async () => {
  const validation = await readFile(new URL('../../VALIDATION.md', import.meta.url), 'utf8');

  for (const tier of [
    'Static validation',
    'Deterministic prompt-routing validation',
    'CLI smoke validation',
    'Full target-app validation',
    'Real-agent transcript validation',
  ]) {
    assert.match(validation, new RegExp(tier.replaceAll('-', '[- ]')), `VALIDATION.md documents ${tier}`);
  }

  assert.match(validation, /Current evidence/);
  assert.match(validation, /External evidence still required/);
});

test('phase 1: brainstorming visual companion stays optional and gated', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));
  const brainstorming = sourceByName.get('sdcorejs-brainstorming');

  assert.match(brainstorming, /## Optional Visual Companion/);
  assert.match(brainstorming, /Do not offer the visual companion upfront/);
  assert.match(brainstorming, /visual-companion\.md/);
  assert.match(brainstorming, /Reply with `1` or `2`/);
  assert.match(brainstorming, /main conversation remains the source of truth/i);
  assert.match(brainstorming, /acceptance criteria and testable\s+behavior/);
  assert.doesNotMatch(brainstorming, /_refs\/sdlc\/visual-companion\.md/);

  // The live runtime exists, so the skill must drive it rather than forbid it.
  assert.doesNotMatch(brainstorming, /Do not start or invent a local server\/event bridge/);
  assert.match(brainstorming, /live_visual_companion/);
  assert.match(brainstorming, /Confirm that separately before starting/);
  assert.match(brainstorming, /Auto-opening a browser is a second, separate consent/);
  assert.match(brainstorming, /supporting feedback, not approval/);

  const visualCompanion = await readFile(new URL('../../_refs/sdlc/visual-companion.md', import.meta.url), 'utf8');
  assert.match(visualCompanion, /optional decision aid for spatial or visual choices/);
  assert.match(visualCompanion, /Do not repeat an offer after the user declines/);
  assert.match(visualCompanion, /native structured choice/);
  assert.match(visualCompanion, /typed native visual surface/);
  assert.match(visualCompanion, /static-visual-composer\.mjs/);
  assert.match(visualCompanion, /numbered Markdown fallback/);
  assert.match(visualCompanion, /not implementation approval/);
  assert.doesNotMatch(visualCompanion, /_refs\/sdlc\/templates/);

  // The contract is executable: it names the entry point, the lifecycle, the
  // two consent gates, and the codes a caller branches on.
  assert.doesNotMatch(visualCompanion, /local server or event bridge is intentionally out of scope/);
  assert.match(visualCompanion, /_refs\/sdlc\/visual-companion\/cli\.mjs/);
  assert.match(visualCompanion, /## Consent Boundary/);
  assert.match(visualCompanion, /## Session Lifecycle/);
  assert.match(visualCompanion, /An approval never reaches a visual surface/);
  for (const command of ['start', 'status', 'publish', 'events', 'waiting', 'stop', 'cleanup']) {
    assert.match(visualCompanion, new RegExp(`cli\\.mjs ${command}\\b`), `contract documents ${command}`);
  }
  for (const code of ['SESSION_STARTED', 'SCREEN_PUBLISHED', 'EVENTS_READ', 'OWNERSHIP_UNPROVEN', 'STALE_SCREEN']) {
    assert.match(visualCompanion, new RegExp(`\\b${code}\\b`), `contract documents ${code}`);
  }
  assert.match(visualCompanion, /Two to four options/);
  assert.match(visualCompanion, /local_only/);

  for (const legacyPath of [
    'visual-offer.md',
    'visual-screen-options.fragment.html',
    'visual-screen-comparison.fragment.html',
    'visual-waiting.fragment.html',
  ]) {
    await assert.rejects(
      readFile(new URL(`../../_refs/sdlc/templates/${legacyPath}`, import.meta.url), 'utf8'),
      { code: 'ENOENT' },
      `${legacyPath} must stay retired in favor of the typed escaping renderer`,
    );
  }

  const composerDoc = await readFile(new URL('../../_refs/sdlc/static-visual-composer.md', import.meta.url), 'utf8');
  const composerSource = await readFile(new URL('../../_refs/sdlc/static-visual-composer.mjs', import.meta.url), 'utf8');
  const screenSchema = await readFile(new URL('../../_refs/sdlc/visual-screen.schema.json', import.meta.url), 'utf8');

  const vietnameseTextPattern = /[\u0102\u0103\u00c2\u00e2\u0110\u0111\u00ca\u00ea\u00d4\u00f4\u01a0\u01a1\u01af\u01b0\u00c0\u00c1\u00c3\u00c8\u00c9\u00cc\u00cd\u00d2\u00d3\u00d5\u00d9\u00da\u00dd\u00e0\u00e1\u00e3\u00e8\u00e9\u00ec\u00ed\u00f2\u00f3\u00f5\u00f9\u00fa\u00fd\u1ea0-\u1ef9]/u;
  for (const text of [visualCompanion, composerDoc, composerSource, screenSchema]) {
    assert.doesNotMatch(text, vietnameseTextPattern, 'visual companion source/templates stay English-only');
  }
});

test('phase 1: angular side-drawer detail rules prefer read-only facts and immutable identifiers', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));
  const angularSkill = sourceByName.get('sdcorejs-angular');

  assert.match(angularSkill, /business identifiers are create-only\/edit-locked by default/i);
  assert.match(angularSkill, /compact read-only facts over a disabled edit form/i);

  const initEntity = await readFile(new URL('../../_refs/angular/write-code/init-entity.md', import.meta.url), 'utf8');
  assert.match(initEntity, /Business identifier \/ business key/);
  assert.match(initEntity, /employeeCode/);
  assert.match(initEntity, /After any whole-form `enable\(\)` in UPDATE/);
  assert.match(initEntity, /Build CREATE\/UPDATE payloads from an explicit mapper/);

  const screenDetail = await readFile(new URL('../../_refs/angular/write-code/screen-detail.md', import.meta.url), 'utf8');
  assert.match(screenDetail, /## Read-only detail\/view rendering gate/);
  assert.match(screenDetail, /description-list\/detail-list\/property-list\/read-only-field/);
  assert.match(screenDetail, /Do not duplicate promoted code\/status/);
  assert.match(screenDetail, /label-left\/value-right/);
  assert.match(screenDetail, /locked again after UPDATE `form\.enable\(\)`/);
  assert.match(screenDetail, /one control per CREATE\/UPDATE request\/editable field/);

  const screenTemplate = await readFile(new URL('../../_refs/angular/templates/screen-detail-component.md', import.meta.url), 'utf8');
  assert.match(screenTemplate, /private readonly immutableUpdateFields/);
  assert.match(screenTemplate, /this\.applyUpdateLocks\(\);/);
  assert.match(screenTemplate, /Define `toUpdatePayload\(\.\.\.\)` from the API contract/);
  assert.match(screenTemplate, /Facts list excludes any promoted code\/status fields/);
  assert.match(screenTemplate, /CREATE\/UPDATE, add one control per request\/editable field/);

  const sdlcAngular = await readFile(new URL('../../_refs/sdlc/angular.md', import.meta.url), 'utf8');
  assert.match(sdlcAngular, /Quick create\/update drawer plus compact read-only detail facts/);
  assert.match(sdlcAngular, /Do not duplicate header-promoted code\/status/);
});

test('phase 1: Angular technical prototype is explicit, role-neutral, and feature-gated', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));
  const angularSkill = sourceByName.get('sdcorejs-angular');

  assert.match(angularSkill, /_refs\/angular\/write-code\/po-ba-prototype\.md/);
  assert.match(angularSkill, /explicitly approved registry `technical-prototype`/i);
  assert.match(angularSkill, /not production/i);
  assert.match(angularSkill, /Never infer.*PO\/BA role|Infer `technical-prototype` from a PO\/BA/i);
  assert.match(angularSkill, /admin-screens.*approved/i);
  assert.match(angularSkill, /seed-data.*approved/i);
  assert.doesNotMatch(angularSkill, /PO\/BA Prototype Portal Mode/);

  for (const existingRef of [
    'input-analysis.md',
    'mock-api-input.md',
    'reuse-existing-entities.md',
    'finish-gate.md'
  ]) {
    assert.match(angularSkill, new RegExp(existingRef.replace('.', '\\.')), `${existingRef} remains referenced`);
  }

  const prototypeRef = await readFile(new URL('../../_refs/angular/write-code/po-ba-prototype.md', import.meta.url), 'utf8');
  assert.match(prototypeRef, /# Technical Prototype Mode/);
  assert.match(prototypeRef, /explicit opt-in/i);
  assert.match(prototypeRef, /Never infer it from a user's role/i);
  assert.match(prototypeRef, /Template-first invariant/i);
  assert.match(prototypeRef, /run `init-portal\.md` first/);
  assert.match(prototypeRef, /existing Core UI portal shell/);
  assert.match(prototypeRef, /Do not design a custom portal shell/);
  assert.match(prototypeRef, /Prototype assumptions/);
  assert.match(prototypeRef, /Technical Prototype Plan:/);
  assert.match(prototypeRef, /permission bypass requires explicit approval/i);
  assert.match(prototypeRef, /mock-first.*approved assumptions/is);
  assert.match(prototypeRef, /localStorage/);
  assert.match(prototypeRef, /MockCrudStore/);
  assert.match(prototypeRef, /seed data only when `seed-data` is an approved optional feature/i);
  assert.match(prototypeRef, /if absent, stop.*approval/is);
  assert.match(prototypeRef, /services\/<entity>\.mock-data\.ts/);
  assert.doesNotMatch(prototypeRef, /default 25|20-30 rows/i);

  const initPortal = await readFile(new URL('../../_refs/angular/write-code/init-portal.md', import.meta.url), 'utf8');
  const initEntity = await readFile(new URL('../../_refs/angular/write-code/init-entity.md', import.meta.url), 'utf8');
  const screenList = await readFile(new URL('../../_refs/angular/write-code/screen-list.md', import.meta.url), 'utf8');
  const actions = await readFile(new URL('../../_refs/angular/write-code/actions.md', import.meta.url), 'utf8');
  assert.match(initPortal, /admin screens only when `admin-screens` is an approved/i);
  assert.match(initPortal, /permission bypass is.*explicit/is);
  assert.match(initEntity, /mock CRUD only for an explicitly approved/i);
  assert.match(initEntity, /row count is absent, block for approval/i);
  assert.match(screenList, /both `mock-service` and `seed-data` are approved/i);
  assert.match(actions, /Never infer extra actions from prototype mode/i);

  const examples = await readFile(new URL('../../docs/po-ba-prototype-examples.md', import.meta.url), 'utf8');
  assert.match(examples, /Explicit Technical Prototype Prompt Examples/i);
  assert.match(examples, /role of the requester never selects this profile/i);
  assert.match(examples, /contract-management/i);
  assert.match(examples, /Explicitly approve `technical-prototype`/i);
});

test('phase 1: deterministic prompt eval dispatches expected skills', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const results = runPromptEval(pack, promptEvals.filter((item) => item.phase === 1));

  assert.deepEqual(
    results.map((result) => [result.id, result.actualSkill, result.pass]),
    [
      ['nestjs-init', 'sdcorejs-nestjs', true],
      ['angular-action-localized', 'sdcorejs-angular', true],
      ['angular-prd-mock-api-prototype', 'sdcorejs-angular', true],
      ['angular-po-ba-prototype-no-api', 'sdcorejs-angular', true],
      ['open-ended-localized', 'sdcorejs-brainstorming', true],
      ['product-traceability-localized', 'sdcorejs-product', true],
      ['broad-app-classroom-localized', 'sdcorejs-brainstorming', true],
      ['design-from-user-stories-localized', 'sdcorejs-design', true]
    ]
  );
});

test('phase 3: direct review prompts dispatch to sdcorejs-review', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const reviewCases = promptEvals.filter((item) => item.id.startsWith('review-'));
  const results = runPromptEval(pack, reviewCases);

  assert.deepEqual(
    results.map((result) => [result.id, result.actualSkill, result.pass]),
    [
      ['review-code-direct', 'sdcorejs-review', true],
      ['review-security-direct', 'sdcorejs-review', true],
      ['review-accessibility-direct', 'sdcorejs-review', true],
      ['review-performance-direct', 'sdcorejs-review', true],
      ['review-scored-direct', 'sdcorejs-review', true],
      ['review-full-direct', 'sdcorejs-review', true],
      ['review-security-localized-vi', 'sdcorejs-review', true],
      ['review-code-localized-vi', 'sdcorejs-review', true]
    ]
  );

  assert.equal(dispatchPrompt(pack, 'fix review issues')?.name, 'sdcorejs-repair-loop');
  assert.equal(dispatchPrompt(pack, 'viet product doc va kiem tra requirement implement test co day du khong')?.name, 'sdcorejs-product');
  assert.equal(dispatchPrompt(pack, 'check requirement coverage gaps for acceptance criteria')?.name, 'sdcorejs-product');
  assert.equal(dispatchPrompt(pack, 'review product coverage against requirements')?.name, 'sdcorejs-product');
});

test('phase 3: direct test prompts dispatch to sdcorejs-test or debug handoff', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const testCases = promptEvals.filter((item) => item.id.startsWith('test-') || item.id === 'login-tests');
  const results = runPromptEval(pack, testCases);

  assert.deepEqual(
    results.map((result) => [result.id, result.actualSkill, result.pass]),
    [
      ['login-tests', 'sdcorejs-test', true],
      ['test-run-only', 'sdcorejs-test', true],
      ['test-write-and-run', 'sdcorejs-test', true],
      ['test-plan-readonly', 'sdcorejs-test', true],
      ['test-coverage-audit', 'sdcorejs-test', true],
      ['test-tdd-cycle', 'sdcorejs-test', true],
      ['test-uat-cases', 'sdcorejs-test', true],
      ['test-failing-output-triage', 'sdcorejs-test', true],
      ['test-debug-handoff', 'sdcorejs-debug', true],
      ['test-write-not-debug', 'sdcorejs-test', true],
      ['test-run-not-debug', 'sdcorejs-test', true],
      ['test-localized-vi-run', 'sdcorejs-test', true],
      ['test-localized-vi-write', 'sdcorejs-test', true],
      ['test-authenticated-personas', 'sdcorejs-test', true],
      ['test-tenant-isolation-api', 'sdcorejs-test', true],
      ['test-run-checkout', 'sdcorejs-test', true],
      ['test-failing-output-explain', 'sdcorejs-test', true],
      ['test-authenticated-personas-vi', 'sdcorejs-test', true]
    ]
  );

  assert.equal(dispatchPrompt(pack, 'debug failing login test')?.name, 'sdcorejs-debug');
  assert.equal(dispatchPrompt(pack, 'explain failing login test output without changing files')?.name, 'sdcorejs-test');
});

test('phase 3: direct debug prompts dispatch to sdcorejs-debug', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const debugCases = promptEvals.filter((item) => item.id.startsWith('debug-') || item.id === 'failing-login-test-debug');
  const results = runPromptEval(pack, debugCases);

  assert.deepEqual(
    results.map((result) => [result.id, result.actualSkill, result.pass]),
    [
      ['failing-login-test-debug', 'sdcorejs-debug', true],
      ['debug-runtime-error', 'sdcorejs-debug', true],
      ['debug-stack-trace', 'sdcorejs-debug', true],
      ['debug-fix-bug', 'sdcorejs-debug', true],
      ['debug-flaky-test', 'sdcorejs-debug', true],
      ['debug-wrong-behavior', 'sdcorejs-debug', true],
      ['debug-ci-only', 'sdcorejs-debug', true],
      ['debug-prod-only', 'sdcorejs-debug', true],
      ['debug-performance-anomaly', 'sdcorejs-debug', true],
      ['debug-localized-vi', 'sdcorejs-debug', true],
      ['debug-localized-vi-root-cause', 'sdcorejs-debug', true],
      ['debug-localized-vi-flaky', 'sdcorejs-debug', true],
      ['debug-failing-login-fix', 'sdcorejs-debug', true]
    ]
  );
});

test('phase 3: direct explore prompts dispatch to sdcorejs-explore', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const exploreCases = promptEvals.filter((item) => item.id.startsWith('explore-'));
  const results = runPromptEval(pack, exploreCases);

  assert.deepEqual(
    results.map((result) => [result.id, result.actualSkill, result.pass]),
    [
      ['explore-summary-read', 'sdcorejs-explore', true],
      ['explore-summary-refresh', 'sdcorejs-explore', true],
      ['explore-code-map', 'sdcorejs-explore', true],
      ['explore-trace-flow', 'sdcorejs-explore', true],
      ['explore-env-setup', 'sdcorejs-explore', true],
      ['explore-recovery', 'sdcorejs-explore', true],
      ['explore-persona', 'sdcorejs-explore', true],
      ['explore-memories', 'sdcorejs-explore', true],
      ['explore-documentation-harvest', 'sdcorejs-explore', true],
      ['explore-localized-vi-code-map', 'sdcorejs-explore', true],
      ['explore-localized-vi-recovery', 'sdcorejs-explore', true],
      ['explore-localized-vi-env', 'sdcorejs-explore', true]
    ]
  );
});

test('phase 3: SDLC harness prompts dispatch to the owning workflow skills', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const ids = [
    'brainstorming-open-feature',
    'brainstorming-plain-angular',
    'brainstorming-next-dashboard',
    'brainstorming-migration-request',
    'spec-from-confirmed-requirements',
    'spec-revision',
    'plan-from-approved-spec',
    'plan-revision',
    'execute-approved-plan',
    'execute-approved-plan-parallel',
    'parallel-dispatch-direct',
    'broad-fullstack-requirements',
    'localized-vi-brainstorm',
    'localized-vi-spec',
    'localized-vi-plan',
    'localized-vi-execute',
    'localized-vi-parallel'
  ];
  const cases = promptEvals.filter((item) => ids.includes(item.id));
  const results = runPromptEval(pack, cases);

  assert.deepEqual(
    results.map((result) => [result.id, result.actualSkill, result.pass]),
    [
      ['brainstorming-open-feature', 'sdcorejs-brainstorming', true],
      ['brainstorming-plain-angular', 'sdcorejs-brainstorming', true],
      ['brainstorming-next-dashboard', 'sdcorejs-brainstorming', true],
      ['brainstorming-migration-request', 'sdcorejs-brainstorming', true],
      ['spec-from-confirmed-requirements', 'sdcorejs-spec', true],
      ['spec-revision', 'sdcorejs-spec', true],
      ['plan-from-approved-spec', 'sdcorejs-plan', true],
      ['plan-revision', 'sdcorejs-plan', true],
      ['execute-approved-plan', 'sdcorejs-execute-plan', true],
      ['execute-approved-plan-parallel', 'sdcorejs-execute-plan', true],
      ['parallel-dispatch-direct', 'sdcorejs-parallel-dispatch', true],
      ['broad-fullstack-requirements', 'sdcorejs-brainstorming', true],
      ['localized-vi-brainstorm', 'sdcorejs-brainstorming', true],
      ['localized-vi-spec', 'sdcorejs-spec', true],
      ['localized-vi-plan', 'sdcorejs-plan', true],
      ['localized-vi-execute', 'sdcorejs-execute-plan', true],
      ['localized-vi-parallel', 'sdcorejs-parallel-dispatch', true]
    ]
  );
});

test('phase 1: documentation trigger does not steal user-management implementation prompts', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));

  assert.equal(dispatchPrompt(pack, 'Implement user management list and detail screens')?.name, 'sdcorejs-angular');
  assert.equal(dispatchPrompt(pack, 'Add user guide for the order module')?.name, 'sdcorejs-documentation');
});

test('phase 3: AI-agent routing stays narrow and preserves dedicated intent owners', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const cases = promptEvals.filter((item) => item.id.startsWith('ai-agent-'));
  const results = runPromptEval(pack, cases);

  for (const result of results) {
    assert.equal(result.pass, true, `${result.id} -> ${result.actualSkill}`);
  }

  for (const prompt of [
    'agent',
    'create a recurring daily automation',
    'configure a GitHub Actions runner agent',
    'inspect the browser user agent',
    'add a new skill to sdcorejs-agent',
    'show me the monthly revenue report',
  ]) {
    assert.notEqual(dispatchPrompt(pack, prompt)?.name, 'sdcorejs-ai-agent', prompt);
  }
});

async function loadPromptEvals() {
  const file = new URL('./fixtures/prompt-evals.json', import.meta.url);
  return JSON.parse(await readFile(file, 'utf8'));
}
