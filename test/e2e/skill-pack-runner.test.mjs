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

test('phase 1: deterministic runner loads source skills, mirrors, and refs without LLM/tool calls', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));

  assert.equal(pack.sourceSkills.length, 23);
  assert.equal(pack.claudeMirrorSkills.length, 23);
  assert.equal(pack.pluginMirrorSkills.length, 23);
  assert.equal(pack.codexMirrorSkills.length, 23);
  // Core UI per-component docs are fetched on-demand (not committed), so this count
  // dropped from ~150 to ~69. Floor still catches accidental mass-deletion of refs.
  assert.ok(pack.referenceDocs.length >= 60, `referenceDocs=${pack.referenceDocs.length}`);
  assert.equal(pack.codexReferenceDocs.length, pack.referenceDocs.length);
  assert.equal(pack.diagnostics.length, 0);
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

test('phase 1: mandatory workflow invariants are encoded in source skills and refs', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));

  for (const name of ['sdcorejs-angular', 'sdcorejs-nestjs', 'sdcorejs-nextjs']) {
    const text = sourceByName.get(name);
    assert.ok(text, `${name} exists`);
    assert.match(text, /_refs\/shared\/finish-gate\.md/, `${name} presents the finish gate`);
    assert.match(text, /_refs\/documentation\/gate\.md/, `${name} runs documentation gate`);
    assert.match(text, /\.sdcorejs\/documentation\/preferences\.md/, `${name} supports saved documentation preferences`);
    assert.match(text, /finishing steps \(tests, review, code-documentation, technical-doc, user-guide\)/, `${name} progress checklist includes technical-doc`);
    assert.match(text, /sdcorejs-ship \(verify-before-done mode\)/, `${name} runs acceptance verification`);
    assert.match(text, /sdcorejs-ship \(branch-ready mode\)/, `${name} runs branch-ready`);
    assert.match(text, /_refs\/orchestration\/tail\/auto-docs\.md/, `${name} writes auto-docs`);
    assert.match(text, /_refs\/orchestration\/tail\/auto-task-tracker\.md/, `${name} updates task tracker`);
    assert.match(text, /memories mode/, `${name} hands off durable memories when needed`);
  }

  const angularSkill = sourceByName.get('sdcorejs-angular');
  assert.match(angularSkill, /_refs\/angular\/write-code\/input-analysis\.md/);
  assert.match(angularSkill, /SDCoreJS Core reuse analysis/);
  assert.match(angularSkill, /mandatory UI check/);
  assert.match(angularSkill, /Core reuse summary/);

  const angularInputAnalysis = await readFile(new URL('../../_refs/angular/write-code/input-analysis.md', import.meta.url), 'utf8');
  assert.match(angularInputAnalysis, /versions\.json/);
  assert.match(angularInputAnalysis, /UI decomposition/);
  assert.match(angularInputAnalysis, /Requirement mapping/);
  assert.match(angularInputAnalysis, /Image \+ PRD mapping/);
  assert.match(angularInputAnalysis, /Post-Implementation UI Check/);
  assert.match(angularInputAnalysis, /Do not claim visual\/browser verification unless it actually happened/);

  const coreDocsFetch = await readFile(new URL('../../_refs/angular/core-docs-fetch.mjs', import.meta.url), 'utf8');
  assert.match(coreDocsFetch, /package-lock\.json/);
  assert.match(coreDocsFetch, /pnpm-lock\.yaml/);
  assert.match(coreDocsFetch, /yarn\.lock/);

  const testSkill = sourceByName.get('sdcorejs-test');
  assert.match(testSkill, /## Direct invocation tail/);
  assert.match(testSkill, /_refs\/documentation\/gate\.md/);
  assert.match(testSkill, /\.sdcorejs\/documentation\/preferences\.md/);
  assert.match(testSkill, /There is no separate `qa_guide` output/);
  assert.doesNotMatch(testSkill, /QA-guide/);
  assert.match(testSkill, /TRACK=test/);
  assert.match(testSkill, /_refs\/orchestration\/tail\/auto-docs\.md/);
  assert.match(testSkill, /_refs\/orchestration\/tail\/auto-task-tracker\.md/);

  const reviewSkill = sourceByName.get('sdcorejs-review');
  assert.match(reviewSkill, /## Post-review tail/);
  assert.match(reviewSkill, /status `reviewed`/);
  assert.match(reviewSkill, /_refs\/orchestration\/tail\/auto-docs\.md/);
  assert.match(reviewSkill, /_refs\/orchestration\/tail\/auto-task-tracker\.md/);

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
    assert.match(text, /project-context\.md/, `${name} loads project-context before execution`);
    assert.match(text, /sdcorejs-explore\s+\(summary\s+mode\)/, `${name} runs summary-mode context preflight`);
  }

  const coreVersion = await readFile(new URL('../../_refs/angular/core-version.md', import.meta.url), 'utf8');
  assert.doesNotMatch(coreVersion, /10-init-portal/);
  assert.match(coreVersion, /_refs\/angular\/write-code\/init-portal\.md/);

  const dockerize = await readFile(new URL('../../skills/infra/dockerize.md', import.meta.url), 'utf8');
  assert.match(dockerize, /frontend\/[^\n]*\r?\n\s+frontend-nginx\.conf/);
  assert.doesNotMatch(dockerize, /test\/\?[^\n]*\r?\n\s+frontend-nginx\.conf/);

  const gitSkill = sourceByName.get('sdcorejs-git');
  assert.match(gitSkill, /\.sdcorejs\/documentation\/\*\*/);

  const choicePrompt = await readFile(new URL('../../_refs/shared/user-choice-prompt.md', import.meta.url), 'utf8');
  assert.match(choicePrompt, /Never rely on clickable UI options/);
  assert.match(choicePrompt, /Reply with `1`, `2`, or `3`/);

  for (const skill of pack.sourceSkills) {
    assert.match(skill.text, /user-choice-prompt\.md/, `${skill.name} applies typed choice prompts`);
  }

  const finishGate = await readFile(new URL('../../_refs/shared/finish-gate.md', import.meta.url), 'utf8');
  assert.match(finishGate, /Finish step 1\/3: tests/);
  assert.match(finishGate, /Documentation approval gate/);
  assert.match(finishGate, /single combined gate/);
  assert.match(finishGate, /Skip new user\/technical docs/);
  assert.match(finishGate, /user_guide: skip[\s\S]*technical_doc: skip[\s\S]*requirement_record: skip/);
  assert.match(finishGate, /`sdcorejs-documentation \(code-documentation mode\)` - automatic/);
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
  assert.match(documentationSkill, /Playwright screenshot capture script for user guides/);

  const userGuide = await readFile(new URL('../../_refs/documentation/write-user-guide.md', import.meta.url), 'utf8');
  assert.match(userGuide, /capture-screenshots\.playwright\.mjs/);
  assert.match(userGuide, /SDCOREJS_DOCS_BASE_URL/);
  assert.match(userGuide, /Never emit markdown image links for missing files/);
  assert.match(userGuide, /Do not emit a markdown image link for an image file that does not exist yet/);

  const userGuideTemplate = await readFile(new URL('../../_refs/shared/user-guide-template.md', import.meta.url), 'utf8');
  assert.match(userGuideTemplate, /capture-screenshots\.playwright\.mjs/);
  assert.match(userGuideTemplate, /Do not include missing image links/);
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

  const solutionBuilder = await readFile(new URL('../../skills/orchestration/solution-builder.md', import.meta.url), 'utf8');
  assert.match(solutionBuilder, /## Production SDLC boundary/);
  assert.match(solutionBuilder, /does \*\*not\*\* create production-SDLC surfaces/);
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

  const visualCompanion = await readFile(new URL('../../_refs/sdlc/visual-companion.md', import.meta.url), 'utf8');
  assert.match(visualCompanion, /Decide per question, not per session/);
  assert.match(visualCompanion, /Do not offer the visual companion at the start/);
  assert.match(visualCompanion, /The offer must use two numbered choices/);
  assert.match(visualCompanion, /Do not proceed to implementation because a mockup was selected/);
  assert.match(visualCompanion, /Never generate production code directly from a mockup/);
  assert.doesNotMatch(visualCompanion, /_refs\/sdlc\/templates/);

  const visualOffer = await readFile(new URL('../../_refs/sdlc/templates/visual-offer.md', import.meta.url), 'utf8');
  assert.match(visualOffer, /^1\. Use visual companion/m);
  assert.match(visualOffer, /^2\. Do not use visual companion/m);
  assert.match(visualOffer, /Reply with `1` or `2`/);

  const optionsTemplate = await readFile(new URL('../../_refs/sdlc/templates/visual-screen-options.fragment.html', import.meta.url), 'utf8');
  assert.match(optionsTemplate, /data-choice="1"/);
  assert.match(optionsTemplate, /data-choice="2"/);
  assert.match(optionsTemplate, /data-choice="3"/);
  assert.match(optionsTemplate, /Best when:/);
  assert.match(optionsTemplate, /Trade-off:/);
  assert.match(optionsTemplate, /Recommendation:/);

  const comparisonTemplate = await readFile(new URL('../../_refs/sdlc/templates/visual-screen-comparison.fragment.html', import.meta.url), 'utf8');
  assert.match(comparisonTemplate, /<h3>1\. {{option_1_title}}<\/h3>/);
  assert.match(comparisonTemplate, /<h3>2\. {{option_2_title}}<\/h3>/);
  assert.doesNotMatch(comparisonTemplate, /<h3>[AB]\./);

  const waitingTemplate = await readFile(new URL('../../_refs/sdlc/templates/visual-waiting.fragment.html', import.meta.url), 'utf8');
  assert.match(waitingTemplate, /Continuing in the main conversation/);

  const vietnameseTextPattern = /[\u0102\u0103\u00c2\u00e2\u0110\u0111\u00ca\u00ea\u00d4\u00f4\u01a0\u01a1\u01af\u01b0\u00c0\u00c1\u00c3\u00c8\u00c9\u00cc\u00cd\u00d2\u00d3\u00d5\u00d9\u00da\u00dd\u00e0\u00e1\u00e3\u00e8\u00e9\u00ec\u00ed\u00f2\u00f3\u00f5\u00f9\u00fa\u00fd\u1ea0-\u1ef9]/u;
  for (const text of [visualCompanion, visualOffer, optionsTemplate, comparisonTemplate, waitingTemplate]) {
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

test('phase 1: angular PO/BA prototype mode is encoded in skill, refs, and examples', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));
  const angularSkill = sourceByName.get('sdcorejs-angular');

  assert.match(angularSkill, /PO\/BA Prototype Portal Mode/);
  assert.match(angularSkill, /_refs\/angular\/write-code\/po-ba-prototype\.md/);
  assert.match(angularSkill, /template-first/i);
  assert.match(angularSkill, /Core UI starter template/i);
  assert.match(angularSkill, /parallel custom portal shell/i);
  assert.match(
    angularSkill,
    /input-analysis -> po-ba-prototype -> init-portal if needed -> admin-screens -> init-module -> init-entity -> screen-list\/screen-detail\/actions -> finish gate/
  );

  for (const existingRef of [
    'input-analysis.md',
    'mock-api-input.md',
    'reuse-existing-entities.md',
    'finish-gate.md'
  ]) {
    assert.match(angularSkill, new RegExp(existingRef.replace('.', '\\.')), `${existingRef} remains referenced`);
  }

  const prototypeRef = await readFile(new URL('../../_refs/angular/write-code/po-ba-prototype.md', import.meta.url), 'utf8');
  assert.match(prototypeRef, /# PO\/BA Prototype Portal Mode/);
  assert.match(prototypeRef, /Template-first invariant/);
  assert.match(prototypeRef, /run `init-portal\.md` first/);
  assert.match(prototypeRef, /existing Core UI portal shell/);
  assert.match(prototypeRef, /Do not design a custom portal shell/);
  assert.match(prototypeRef, /Prototype assumptions/);
  assert.match(prototypeRef, /PO\/BA Prototype Plan:/);
  assert.match(prototypeRef, /PermissionConfiguration\.disabled = true/);
  assert.match(prototypeRef, /mock-first/);
  assert.match(prototypeRef, /localStorage/);
  assert.match(prototypeRef, /MockCrudStore/);
  assert.match(prototypeRef, /default 25/);
  assert.match(prototypeRef, /20-30/);
  assert.match(prototypeRef, /services\/<entity>\.mock-data\.ts/);
  assert.match(prototypeRef, /DTO[\s\S]*ListRes[\s\S]*DetailRes[\s\S]*CreateReq[\s\S]*UpdateReq[\s\S]*SaveReq[\s\S]*ViewModel/);
  assert.match(prototypeRef, /permission bypass status/);
  assert.match(prototypeRef, /route\/menu/);
  assert.match(prototypeRef, /mock rows per listing/);

  const relatedRefs = [
    ['init-portal.md', [/PO\/BA prototype/, /PermissionConfiguration\.disabled = true/, /no backend auth\/API/, /Template-first portal baseline/, /custom portal shell/]],
    ['init-module.md', [/PO\/BA prototype/, /route/, /menu/]],
    ['init-entity.md', [/PRD-only/, /default 25/, /20-30/]],
    ['screen-list.md', [/search\/filter\/sort\/paging/, /visible seed data/]],
    ['screen-detail.md', [/validator inference/, /mock save\/update/]],
    ['actions.md', [/mock-first action/, /mock store/]]
  ];

  for (const [file, patterns] of relatedRefs) {
    const text = await readFile(new URL(`../../_refs/angular/write-code/${file}`, import.meta.url), 'utf8');
    for (const pattern of patterns) {
      assert.match(text, pattern, `${file} includes ${pattern}`);
    }
  }

  const examples = await readFile(new URL('../../docs/po-ba-prototype-examples.md', import.meta.url), 'utf8');
  assert.match(examples, /insurance claims portal demo/i);
  assert.match(examples, /contract-management/i);
  assert.match(examples, /no API\/backend/i);
  assert.match(examples, /Core UI starter template/i);
  assert.match(examples, /25 realistic rows/i);
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
      ['solution-builder-classroom-localized', 'sdcorejs-solution-builder', true],
      ['design-from-user-stories-localized', 'sdcorejs-design', true]
    ]
  );
});

test('phase 1: documentation trigger does not steal user-management implementation prompts', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));

  assert.equal(dispatchPrompt(pack, 'Implement user management list and detail screens')?.name, 'sdcorejs-angular');
  assert.equal(dispatchPrompt(pack, 'Add user guide for the order module')?.name, 'sdcorejs-documentation');
});

async function loadPromptEvals() {
  const file = new URL('./fixtures/prompt-evals.json', import.meta.url);
  return JSON.parse(await readFile(file, 'utf8'));
}
