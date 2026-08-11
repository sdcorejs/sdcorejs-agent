import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parse } from 'yaml';

const EXPECTED_ROOT_NODE_RANGE = '^22.22.3 || ^24.15.0 || >=26.0.0';
const VISUAL_COMPANION_COMMAND = 'node --test test/e2e/visual-companion-runtime.test.mjs test/e2e/static-visual-composer.test.mjs';
const DIRECT_DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
];

const rootUrl = new URL('../../', import.meta.url);

function parseVersion(value) {
  const match = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(value);
  assert.ok(match, `Unsupported Node engine version: ${value}`);
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}

function upperCaret(version) {
  if (version[0] > 0) return [version[0] + 1, 0, 0];
  if (version[1] > 0) return [0, version[1] + 1, 0];
  return [0, 0, version[2] + 1];
}

function intersectIntervals(left, right) {
  const lowerComparison = compareVersions(left.lower, right.lower);
  const upperCandidates = [left.upper, right.upper].filter(Boolean);
  const upper = upperCandidates.length === 0
    ? null
    : upperCandidates.reduce((minimum, candidate) => (
      compareVersions(candidate, minimum) < 0 ? candidate : minimum
    ));
  const lower = lowerComparison >= 0 ? left.lower : right.lower;
  const lowerInclusive = lowerComparison > 0
    ? left.lowerInclusive
    : lowerComparison < 0
      ? right.lowerInclusive
      : left.lowerInclusive && right.lowerInclusive;
  const upperInclusive = upper === null
    ? false
    : [left, right]
      .filter((interval) => interval.upper && compareVersions(interval.upper, upper) === 0)
      .every((interval) => interval.upperInclusive);

  if (upper) {
    const comparison = compareVersions(lower, upper);
    assert.ok(
      comparison < 0 || (comparison === 0 && lowerInclusive && upperInclusive),
      'Node engine comparator set has no matching versions',
    );
  }

  return { lower, lowerInclusive, upper, upperInclusive };
}

function comparatorInterval(token) {
  const match = /^(\^|>=|>|<=|<|=)?(\d+(?:\.\d+){0,2})$/.exec(token);
  assert.ok(match, `Unsupported Node engine comparator: ${token}`);
  const operator = match[1] ?? '=';
  const version = parseVersion(match[2]);

  switch (operator) {
    case '^':
      return {
        lower: version,
        lowerInclusive: true,
        upper: upperCaret(version),
        upperInclusive: false,
      };
    case '>=':
      return { lower: version, lowerInclusive: true, upper: null, upperInclusive: false };
    case '>':
      return { lower: version, lowerInclusive: false, upper: null, upperInclusive: false };
    case '<=':
      return { lower: [0, 0, 0], lowerInclusive: true, upper: version, upperInclusive: true };
    case '<':
      return { lower: [0, 0, 0], lowerInclusive: true, upper: version, upperInclusive: false };
    default:
      return { lower: version, lowerInclusive: true, upper: version, upperInclusive: true };
  }
}

function parseRange(range) {
  return range.split('||').map((branch) => {
    const tokens = branch
      .trim()
      .replace(/(\^|>=|>|<=|<|=)\s+/gu, '$1')
      .split(/\s+/u)
      .filter(Boolean);
    assert.ok(tokens.length > 0, `Empty Node engine branch in: ${range}`);
    return tokens
      .map(comparatorInterval)
      .reduce(intersectIntervals);
  });
}

function startsBeforeOrAt(interval, version, inclusive) {
  const comparison = compareVersions(interval.lower, version);
  return comparison < 0 || (
    comparison === 0
    && (interval.lowerInclusive || !inclusive)
  );
}

function endsAfterOrAt(interval, version, inclusive) {
  if (interval.upper === null) return true;
  const comparison = compareVersions(interval.upper, version);
  return comparison > 0 || (
    comparison === 0
    && (interval.upperInclusive || !inclusive)
  );
}

function rangeIsSubset(candidateRange, allowedRange) {
  const allowed = parseRange(allowedRange);
  return parseRange(candidateRange).every((candidate) => allowed.some((interval) => (
    startsBeforeOrAt(interval, candidate.lower, candidate.lowerInclusive)
      && (
        candidate.upper === null
          ? interval.upper === null
          : endsAfterOrAt(interval, candidate.upper, candidate.upperInclusive)
      )
  )));
}

function directDependencies(manifest, lockfile) {
  const rootLock = lockfile.packages?.[''];
  assert.ok(rootLock, 'package-lock.json must contain packages[""]');

  const names = new Set();
  for (const field of DIRECT_DEPENDENCY_FIELDS) {
    const manifestEntries = manifest[field] ?? {};
    const lockEntries = rootLock[field] ?? {};
    assert.deepEqual(
      lockEntries,
      manifestEntries,
      `package-lock.json packages[""].${field} must match package.json`,
    );
    Object.keys(manifestEntries).forEach((name) => names.add(name));
  }

  return [...names].sort().map((name) => {
    const locked = lockfile.packages[`node_modules/${name}`];
    assert.ok(locked, `Direct dependency ${name} must have a lockfile package entry`);
    return { name, nodeRange: locked.engines?.node ?? null };
  });
}

function assertToolchainCompatibility(manifest, lockfile) {
  const manifestRange = manifest.engines?.node;
  const lockRange = lockfile.packages?.['']?.engines?.node;
  assert.equal(manifestRange, lockRange, 'root Node engines must match in manifest and lockfile');

  for (const dependency of directDependencies(manifest, lockfile)) {
    if (dependency.nodeRange === null) continue;
    assert.ok(
      rangeIsSubset(manifestRange, dependency.nodeRange),
      `Root Node range ${manifestRange} is not a subset of ${dependency.name} ${dependency.nodeRange}`,
    );
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, rootUrl), 'utf8'));
}

async function readText(path) {
  return readFile(new URL(path, rootUrl), 'utf8');
}

function parseWorkflow(source, label) {
  const workflow = parse(source);
  assert.ok(workflow && typeof workflow === 'object', `${label} must contain a workflow object`);
  assert.ok(
    workflow.jobs && typeof workflow.jobs === 'object',
    `${label} must contain a jobs mapping`,
  );
  return workflow;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function setupNodeVersions(workflow) {
  return Object.values(workflow.jobs).flatMap((job) => (
    (job.steps ?? [])
      .filter((step) => step.uses === 'actions/setup-node@v7')
      .map((step) => step.with?.['node-version'])
  ));
}

function assertCiToolchains(ci, fullE2e, deploySite) {
  const ciWorkflow = parseWorkflow(ci, 'ci.yml');
  const fullE2eWorkflow = parseWorkflow(fullE2e, 'full-e2e.yml');
  const deploySiteWorkflow = parseWorkflow(deploySite, 'deploy-site.yml');

  assert.deepEqual(setupNodeVersions(ciWorkflow), [
    '22.22.3',
    '22.22.3',
    '22.22.3',
    '18.20.8',
  ]);
  assert.deepEqual(setupNodeVersions(fullE2eWorkflow), ['22.22.3']);
  assert.deepEqual(setupNodeVersions(deploySiteWorkflow), ['22.22.3']);

  const visualCompanionJob = ciWorkflow.jobs['visual-companion-node18'];
  assert.ok(visualCompanionJob, 'Workflow job visual-companion-node18 must exist');
  assert.ok(
    Array.isArray(visualCompanionJob.steps),
    'Workflow job visual-companion-node18 must contain steps',
  );

  const setupSteps = visualCompanionJob.steps.filter(
    (step) => step.uses === 'actions/setup-node@v7',
  );
  assert.equal(setupSteps.length, 1, 'Visual Companion must have one setup-node step');
  assert.equal(setupSteps[0].with?.['node-version'], '18.20.8');
  assert.equal(
    hasOwn(setupSteps[0].with ?? {}, 'cache'),
    false,
    'Visual Companion setup-node step must not configure a package cache',
  );

  const runSteps = visualCompanionJob.steps.filter((step) => hasOwn(step, 'run'));
  assert.equal(runSteps.length, 1, 'Visual Companion must have one direct run step');
  const testStep = runSteps[0];

  assert.equal(testStep.run, VISUAL_COMPANION_COMMAND);
  assert.equal(
    hasOwn(testStep, 'if'),
    false,
    'Visual Companion test step must be unconditional',
  );
  assert.ok(
    !hasOwn(testStep, 'continue-on-error') || testStep['continue-on-error'] === false,
    'Visual Companion test step continue-on-error must be absent or boolean false',
  );
  assert.doesNotMatch(testStep.run, /\bnpm\s+(?:ci|install|i|add)\b/u);
}

test('root tooling matches the direct Angular compiler Node contract', async () => {
  const manifest = await readJson('package.json');
  const lockfile = await readJson('package-lock.json');
  const compilerRange = lockfile.packages['node_modules/@angular/compiler'].engines.node;

  assert.equal(compilerRange, EXPECTED_ROOT_NODE_RANGE);
  assert.equal(manifest.engines.node, compilerRange);
  assert.equal(lockfile.packages[''].engines.node, compilerRange);
  assertToolchainCompatibility(manifest, lockfile);
});

test('direct dependency engine checks reject a stricter dependency mutation', async () => {
  const manifest = await readJson('package.json');
  const lockfile = await readJson('package-lock.json');
  manifest.engines.node = EXPECTED_ROOT_NODE_RANGE;
  lockfile.packages[''].engines.node = EXPECTED_ROOT_NODE_RANGE;
  lockfile.packages['node_modules/typescript'].engines.node = '>=24.15.1';

  assert.throws(
    () => assertToolchainCompatibility(manifest, lockfile),
    /not a subset of typescript >=24\.15\.1/u,
  );
});

test('direct dependency engine checks reject a broadened root mutation', async () => {
  const manifest = await readJson('package.json');
  const lockfile = await readJson('package-lock.json');
  manifest.engines.node = '>=18';
  lockfile.packages[''].engines.node = '>=18';

  assert.throws(
    () => assertToolchainCompatibility(manifest, lockfile),
    /not a subset of @angular\/compiler/u,
  );
});

test('root scripts expose the focused toolchain contract in repository E2E', async () => {
  const manifest = await readJson('package.json');
  const command = 'node --test test/e2e/toolchain-compatibility.test.mjs';

  assert.equal(manifest.scripts['test:e2e:toolchain'], command);
  assert.match(
    manifest.scripts['test:e2e:repository'],
    /test\/e2e\/toolchain-compatibility\.test\.mjs/u,
  );
});

test('CI pins supported toolchains and isolates the Node 18 Visual Companion lane', async () => {
  const [ci, fullE2e, deploySite] = await Promise.all([
    readText('.github/workflows/ci.yml'),
    readText('.github/workflows/full-e2e.yml'),
    readText('.github/workflows/deploy-site.yml'),
  ]);

  assertCiToolchains(ci, fullE2e, deploySite);
});

test('Skills and E2E fetches full history for revision-bound authoring evidence', async () => {
  const ci = parseWorkflow(await readText('.github/workflows/ci.yml'), 'ci.yml');
  const skillsJob = ci.jobs.skills;
  assert.ok(skillsJob, 'Workflow job skills must exist');

  const checkoutSteps = (skillsJob.steps ?? []).filter(
    (step) => step.uses === 'actions/checkout@v7',
  );
  assert.equal(checkoutSteps.length, 1, 'Skills and E2E must have one checkout step');
  assert.equal(
    checkoutSteps[0].with?.['fetch-depth'],
    0,
    'Skills and E2E must fetch full history for revision-bound evidence',
  );
});

test('CI rejects weakened Visual Companion execution-policy mutations', async () => {
  const [ci, fullE2e, deploySite] = await Promise.all([
    readText('.github/workflows/ci.yml'),
    readText('.github/workflows/full-e2e.yml'),
    readText('.github/workflows/deploy-site.yml'),
  ]);
  const mutateTestStep = (setting) => ci.replace(
    `      - run: ${VISUAL_COMPANION_COMMAND}`,
    `      - run: ${VISUAL_COMPANION_COMMAND}\n        ${setting}`,
  );

  for (const value of ['true', '"true"', '"false"', '1', 'null', '${{ true }}']) {
    const mutatedCi = mutateTestStep(`continue-on-error: ${value}`);
    assert.notEqual(mutatedCi, ci, 'mutation must alter the Visual Companion test step');
    assert.throws(
      () => assertCiToolchains(mutatedCi, fullE2e, deploySite),
      /continue-on-error must be absent or boolean false/u,
      `continue-on-error: ${value} must be rejected`,
    );
  }

  assert.doesNotThrow(
    () => assertCiToolchains(
      mutateTestStep('continue-on-error: false'),
      fullE2e,
      deploySite,
    ),
  );
  assert.throws(
    () => assertCiToolchains(mutateTestStep('if: always()'), fullE2e, deploySite),
    /test step must be unconditional/u,
  );
});
