import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHARED_REF = '_refs/shared/static-analysis-compatibility.md';
const LIFECYCLE_HOOKS =
  'OnInit|OnChanges|DoCheck|AfterContentInit|AfterContentChecked|AfterViewInit|AfterViewChecked|OnDestroy';

async function read(relativePath) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

async function listFiles(relativeDir, extensions) {
  const result = [];
  async function walk(current) {
    for (const entry of await readdir(path.join(repoRoot, current), { withFileTypes: true })) {
      const child = `${current}/${entry.name}`;
      if (entry.isDirectory()) await walk(child);
      else if (extensions.some((extension) => entry.name.endsWith(extension))) result.push(child);
    }
  }
  await walk(relativeDir);
  return result.sort();
}

async function angularGuidanceFiles() {
  return [
    ...(await listFiles('_refs/angular', ['.md', '.mjs'])),
    ...(await listFiles('skills', ['.md'])),
  ];
}

async function findMatches(files, pattern, { lineFilter = () => true } = {}) {
  const matches = [];
  for (const file of files) {
    const lines = (await read(file)).split(/\r?\n/u);
    lines.forEach((line, index) => {
      if (pattern.test(line) && lineFilter(line)) matches.push(`${file}:${index + 1}: ${line.trim()}`);
    });
  }
  return matches;
}

function headings(text) {
  return text.split(/\r?\n/u).filter((line) => line.startsWith('## ')).map((line) => line.trim());
}

test('case-sac-no-async-lifecycle-hook: Angular guidance never teaches async lifecycle hooks', async () => {
  const files = await angularGuidanceFiles();
  const asyncHook = new RegExp(`\\basync\\s+ng(?:${LIFECYCLE_HOOKS})\\s*\\(`, 'u');
  const promiseHook = new RegExp(`\\bng(?:${LIFECYCLE_HOOKS})\\s*\\([^)]*\\)\\s*:\\s*Promise<`, 'u');
  assert.deepEqual(await findMatches(files, asyncHook), []);
  assert.deepEqual(await findMatches(files, promiseHook), []);
});

test('case-sac-inject-fields-readonly: every injected class field in Angular guidance is readonly', async () => {
  const files = await angularGuidanceFiles();
  const injectedField = /^\s*(?:(?:private|protected|public)\s+)?(?:readonly\s+)?#?[A-Za-z_$][\w$]*\s*(?::[^=]+)?=\s*inject\s*[<(]/u;
  const offenders = await findMatches(files, injectedField, {
    lineFilter: (line) => !/\breadonly\b/u.test(line) && !/^\s*(?:const|let|var|return)\b/u.test(line),
  });
  assert.deepEqual(offenders, []);
});

test('case-sac-no-alert-todo-placeholder: custom UI placeholders do not generate alert TODO calls', async () => {
  const files = await angularGuidanceFiles();
  assert.deepEqual(await findMatches(files, /alert\(\s*['"`]TODO/u), []);
  const principles = await read('_refs/angular/architecture-principles.md');
  assert.match(principles, /CUSTOM_UI/u, 'custom UI marker guidance must remain');
  assert.match(principles, /disabled/u, 'placeholder action must be rendered disabled');
  assert.match(principles, /generation summary/u, 'placeholder must be surfaced in the generation summary');
});

test('case-sac-golden-spec-specific-size-matcher: generated golden spec asserts size with toHaveSize', async () => {
  const { generateAngularGoldenProject } = await import(
    pathToFileURL(path.join(repoRoot, '_refs/angular/generator/generate-golden-project.mjs')).href
  );
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-sac-golden-'));
  try {
    const output = path.join(outputRoot, 'app');
    const result = await generateAngularGoldenProject({ output, outputRoot });
    assert.ok(result.files.includes('src/app/app.spec.ts'));
    const spec = await readFile(path.join(output, 'src/app/app.spec.ts'), 'utf8');
    assert.match(spec, /querySelectorAll\('input'\)\)\.toHaveSize\(2\)/u);
    assert.doesNotMatch(spec, /\.length\)\.toBe\(/u);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test('case-sac-shared-ref-sections-and-links: shared reference exists and Angular executor/review link to it', async () => {
  const ref = await read(SHARED_REF);
  for (const heading of [
    '## Purpose and principles',
    '## Evidence detection',
    '## Pattern families',
    '## Custom element click hosts',
    '## Proposal format',
    '## Non-goals',
    '## Angular examples',
  ]) {
    assert.ok(headings(ref).includes(heading), `missing heading ${heading}`);
  }
  assert.match(ref, /^\| Family \| Why analyzers report it \| Neutral remediation \| Example analyzer keys \|$/mu);
  for (const consumer of [
    '_refs/angular/orchestrator-generation.md',
    '_refs/angular/review-code.md',
    '_refs/angular/review-accessibility.md',
    '_refs/angular/review-security.md',
  ]) {
    assert.match(await read(consumer), /shared\/static-analysis-compatibility\.md/u, `${consumer} must link the shared reference`);
  }
});

test('case-sac-shared-ref-neutrality: shared reference is English, project-neutral and keeps analyzer keys as examples', async () => {
  const ref = await read(SHARED_REF);
  assert.doesNotMatch(ref, /[^\t\n\r\x20-\x7E]/u, 'reference must be plain English ASCII text');
  assert.doesNotMatch(ref, /https?:\/\//u, 'reference must not point to a specific host');
  assert.doesNotMatch(ref, /\b[a-z0-9-]+\.(?:com|dev|io|net|org|vn|vin|app|cloud)\b/iu, 'reference must not name a domain');
  const scopedPackages = [...ref.matchAll(/@([a-z0-9-]+)\//gu)].map((match) => match[1]);
  for (const scope of scopedPackages) {
    assert.ok(['sdcorejs', 'sd-angular', 'angular', 'angular-eslint', 'typescript-eslint'].includes(scope), `unexpected package scope @${scope}`);
  }

  const analyzerKey = /\b(?:typescript|javascript|css|Web):[A-Za-z0-9]+\b|\bsonarjs\/[a-z-]+|@angular-eslint\/template\/[a-z-]+|@typescript-eslint\/[a-z-]+/u;
  const lines = ref.split(/\r?\n/u);
  let inPatternTable = false;
  let inFence = false;
  let fenceIsExample = false;
  let previousText = '';
  const outside = [];
  const tableKeys = [];
  for (const [index, line] of lines.entries()) {
    if (line.startsWith('```')) {
      fenceIsExample = !inFence && /example/iu.test(previousText);
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      if (line.startsWith('| Family | Why analyzers report it |')) inPatternTable = true;
      else if (!line.startsWith('|')) inPatternTable = false;
    }
    if (analyzerKey.test(line)) {
      if (inFence ? !fenceIsExample : !inPatternTable) outside.push(`${index + 1}: ${line.trim()}`);
      else if (!inFence) tableKeys.push(line);
    }
    if (!inFence && line.trim() !== '') previousText = line;
  }
  assert.deepEqual(outside, [], 'analyzer keys must stay in the example column or labelled example blocks');
  assert.ok(tableKeys.some((line) => /\b(?:typescript|javascript|css|Web):/u.test(line)), 'examples must include a SonarQube-style key');
  assert.ok(tableKeys.some((line) => /sonarjs\/|@angular-eslint\/|@typescript-eslint\//u.test(line)), 'examples must include an ESLint rule');
});

test('case-sac-advisory-evidence-gated: guidance is advisory, evidence-gated and non-mutating', async () => {
  const ref = await read(SHARED_REF);
  assert.match(ref, /advisory/iu);
  assert.match(ref, /`Low`/u);
  assert.match(ref, /`RECOMMENDED`/u);
  assert.match(ref, /Never block/u);
  assert.match(ref, /explicit user approval/u);
  assert.match(ref, /analyzer project configuration/u);
  assert.match(ref, /lint configuration/u);
  assert.match(ref, /CI/u);
  assert.match(ref, /stronger severity/u, 'existing stronger rules must keep their severity');
  for (const consumer of ['_refs/angular/orchestrator-generation.md', '_refs/angular/review-code.md']) {
    assert.match(await read(consumer), /advisory/iu, `${consumer} must describe advisory handling`);
  }
  const security = await read('_refs/angular/review-security.md');
  assert.match(security, /^## AG-3: `bypassSecurityTrust\*` is justified$/mu, 'AG-3 must keep its rule and severity');

  const registry = JSON.parse(await read('_refs/shared/system-registry.json'));
  assert.deepEqual(
    registry.review_dimensions.map(({ id }) => id),
    ['code', 'architecture', 'consistency', 'security', 'performance', 'accessibility', 'site-audit', 'ALL'],
    'INV-001: no review dimension is added',
  );
  const manifest = JSON.parse(await read('package.json'));
  assert.equal(manifest.dependencies, undefined, 'INV-001: no runtime dependency is added');
  assert.deepEqual(Object.keys(manifest.devDependencies).sort(), ['@angular/compiler', 'lefthook', 'typescript', 'yaml']);
});

test('case-sac-click-host-guidance: Core UI button host bindings stay unchanged and guidance blocks double-fire fixes', async () => {
  const baseline = {
    '_refs/angular/templates/entity-skeleton.md': 11,
    '_refs/angular/templates/example-product.md': 4,
    '_refs/angular/templates/reactive-form-templates.md': 9,
    '_refs/angular/templates/screen-detail-component.md': 9,
    '_refs/angular/templates/screen-list-component.md': 1,
    '_refs/angular/write-code/actions.md': 6,
  };
  const observed = {};
  for (const file of await listFiles('_refs/angular', ['.md'])) {
    const elements = (await read(file)).match(/<sd-button\b[\s\S]*?<\/sd-button>/gu) ?? [];
    const count = elements.filter((element) => /\(click\)=/u.test(element)).length;
    if (count > 0) observed[file] = count;
  }
  assert.deepEqual(observed, baseline, 'INV-002: Core UI button host click bindings must not change');

  const ref = await read(SHARED_REF);
  assert.match(ref, /keydown\.enter/u);
  assert.match(ref, /fire twice/u);
  assert.match(ref, /native/u);
  assert.match(ref, /role="button"/u);
  assert.match(ref, /tabindex="0"/u);
  const accessibility = await read('_refs/angular/review-accessibility.md');
  assert.match(accessibility, /keydown\.enter/u, 'accessibility review must warn against host keyboard handlers');
});
