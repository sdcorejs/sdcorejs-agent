// Only the verifier receives the pristine snapshot, test identities and held-out files.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isTestFile, sandbox, unsafeEntries } from '../comparison-runtime.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const succeeded = result => result?.code === 0 && !result.timedOut;

function assertionId(file, ancestors, title) {
  // The pinned it.each includes new Date() as a non-string value. Only its
  // printed timestamp varies between collections. Keep every other title exact.
  if (file === 'src/fns/date.time-zone.spec.ts' && ancestors.length === 1 && ancestors[0] === 'DateUtilities.isValidTimeZone'
      && /^rejects the non-string "\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z"$/.test(title)) {
    title = 'rejects the non-string <Date at collection>';
  }
  return JSON.stringify([file, ...ancestors, title]);
}

export function assertionInventory(result) {
  const empty = { ok:false, passed:[], failed:[], collected:[] };
  if (!result || result.timedOut || ![0,1].includes(result.code)) return empty;
  const inventory = { ok:false, passed:[], failed:[], collected:[] };
  try {
    const report = JSON.parse(result.stdout);
    if (report.success !== (result.code === 0)) return empty;
    for (const suite of report.testResults) {
      const file = path.posix.relative('/work', suite.name);
      if (!suite.name.startsWith('/work/') || path.posix.resolve('/work', file) !== suite.name) return empty;
      for (const {ancestorTitles, title, status} of suite.assertionResults) {
        if (!Array.isArray(ancestorTitles) || !ancestorTitles.every(n => typeof n === 'string') || typeof title !== 'string') return empty;
        const id = assertionId(file, ancestorTitles, title);
        inventory.collected.push(id);
        if (status === 'passed') inventory.passed.push(id);
        if (status === 'failed' && result.code === 1) inventory.failed.push(id);
      }
    }
    if (report.numTotalTests !== inventory.collected.length || !inventory.collected.length) return empty;
    inventory.ok = succeeded(result);
    for (const list of [inventory.collected, inventory.passed, inventory.failed]) list.sort();
  } catch { return empty; }
  return inventory;
}

function containsAll(actual, expected) {
  const counts = new Map();
  for (const id of actual) counts.set(id, (counts.get(id) || 0) + 1);
  for (const id of expected) {
    if (!counts.get(id)) return false;
    counts.set(id, counts.get(id) - 1);
  }
  return true;
}

function addedPassingTests(baseline, candidate, changed) {
  const original = new Set(baseline.collected);
  const edited = new Set(changed.filter(isTestFile));
  return candidate.passed.filter(id => !original.has(id) && edited.has(JSON.parse(id)[0]));
}

export function assessProjectTests(baseline, candidate, control, changed) {
  const red = new Set(control?.failed);
  return {
    preserved:baseline.ok && candidate.ok && containsAll(candidate.passed, baseline.passed),
    requested:candidate.ok && addedPassingTests(baseline, candidate, changed).some(id => red.has(id)),
  };
}

export function heldOutPassed(inventory, file, titles) {
  const expected = titles.map(parts => JSON.stringify([file,...parts]));
  return inventory.ok && expected.length > 0 && inventory.collected.length === expected.length && containsAll(inventory.passed, expected);
}

async function check(project, resources, command, mounts = []) {
  return sandbox(project, { ...resources, disposable:true, mounts:[...resources.mounts, ...mounts], command, timeout:100 });
}

async function vitest(project, snapshot, resources, files = [], mounts = []) {
  return check(project, resources, ['/tools/node','/work/node_modules/vitest/vitest.mjs','run',
    '--maxWorkers=1','--config=/work/vitest.config.ts','--reporter=json','--silent=true', ...files],
    [[path.join(snapshot,'vitest.config.ts'),'/work/vitest.config.ts'], ...mounts]);
}

export async function baselineTests(snapshot, resources, log) {
  const result = await vitest(snapshot, snapshot, resources);
  await log('baseline', result);
  const baseline = assertionInventory(result);
  if (!baseline.ok || baseline.passed.length !== baseline.collected.length) throw Error('Pinned repository suite did not pass in full');
  return baseline;
}

export function finiteDocumentation(file, source, original) {
  if (/^(?:README(?:\.[^/]+)?$|(?:docs|examples|site\/src)\/)/i.test(file)) {
    const oldLines = new Set(original.split(/\r?\n/).map(line => line.trim()));
    return source.split(/\r?\n/).some(line => /\bisFiniteNumericString\b/.test(line) && !oldLines.has(line.trim()));
  }
  if (!/\.[cm]?[jt]sx?$/.test(file) || isTestFile(file)) return false;
  const comments = /\/\*\*([\s\S]*?)\*\//g;
  const commentText = text => text.replace(/^\s*\* ?/gm,'').replace(/\s+/g,' ').trim();
  const oldComments = new Set([...original.matchAll(comments)].map(match => commentText(match[1])));
  return [...source.matchAll(comments)].some(match => {
    if (oldComments.has(commentText(match[1]))) return false;
    const next = source.slice(match.index + match[0].length);
    return /\bisFiniteNumericString\b/.test(match[1]) || /[a-z]{3}/i.test(match[1])
      && /^\s*(?:export\s+)?(?:const\s+|function\s+)?isFiniteNumericString\b/.test(next);
  });
}

export async function verifyGithubProject({project, snapshot, baseline, resources, scenario, changed, files}, log) {
  const checks = {integrity:unsafeEntries(files).length === 0};
  if (!checks.integrity) return checks;
  const record = async (label, result) => { await log(label, result); return result; };
  const native = await record('project-tests', await check(project, resources, ['/tools/npm','test','--','--maxWorkers=1']));
  const suite = assertionInventory(await record('project-assertions', await vitest(project,snapshot,resources)));
  const originalFiles = [...new Set(baseline.passed.map(id => JSON.parse(id)[0]))];
  let original = suite;
  if (originalFiles.some(file => changed.includes(file))) {
    const mounts = originalFiles.map(file => [path.join(snapshot,file),'/work/'+file]);
    original = assertionInventory(await record('original-assertions', await vitest(project,snapshot,resources,originalFiles,mounts)));
  }
  const additions = addedPassingTests(baseline, suite, changed);
  let control;
  if (!scenario.readOnly && additions.length) {
    const testFiles = [...new Set(additions.map(id => JSON.parse(id)[0]))];
    // These are regular files in the stopped, checked candidate tree. The guest
    // receives only its tests over pristine code, on a fresh ephemeral overlay.
    const mounts = testFiles.map(file => [path.join(project,file),'/work/'+file]);
    control = assertionInventory(await record('original-code-control', await vitest(snapshot,snapshot,resources,testFiles,mounts)));
  }
  const grade = assessProjectTests(baseline, suite, control, changed);
  checks['project-tests'] = succeeded(native) && grade.preserved && original.ok && containsAll(original.passed, baseline.passed);
  const hiddenMounts = scenario.readOnly ? [] : [[path.join(here,scenario.oracle),'/work/'+scenario.oraclePath]];
  if (!scenario.readOnly) {
    checks['requested-tests'] = grade.requested;
    const hidden = await vitest(project, snapshot, resources, [scenario.oraclePath], hiddenMounts);
    checks.hidden = heldOutPassed(assertionInventory(await record('hidden',hidden)), scenario.oraclePath, scenario.oracleTests);
  } else {
    const verify = "import assert from 'node:assert/strict'; import {NumberUtilities as n} from '@sdcorejs/utils'; assert.equal(n.toVN,n.toVNCurrency); assert.notEqual(n.toVN,n.toISO); assert.deepEqual([n.toVN('1,234.5'),n.toISO('1,234.5'),n.toVN(null),n.toISO(null)],['1.234,5','1,234.5',null,null]);";
    checks.hidden = succeeded(await record('hidden',await check(project, resources,['/tools/node','--input-type=module','--eval',verify])));
  }
  const projectTypes = await record('typecheck',await check(project,resources,['/tools/npm','run','typecheck']));
  const trustedTypes = await record('held-out-typecheck',await check(project,resources,
    ['/tools/node','/work/node_modules/typescript/bin/tsc','--noEmit','--project','/work/tsconfig.json'],
    [[path.join(snapshot,'tsconfig.json'),'/work/tsconfig.json'],...hiddenMounts]));
  checks.typecheck = succeeded(projectTypes) && succeeded(trustedTypes);
  if (scenario.id === 'finite') {
    checks['public-package'] = succeeded(await record('public-package',await check(project,resources,
      ['/tools/node','/runner/finite-package.mjs'],[[path.join(here,'finite-package.mjs'),'/runner/finite-package.mjs']])));
    checks.documentation = false;
    for (const file of changed) {
      if (files[file]?.startsWith('file:') && /\.(?:mdx?|[cm]?[jt]sx?)$/i.test(file)) {
        const read = await check(project,resources,['/bin/cat','--','/work/'+file]);
        // The snapshot is trusted and read-only. A newly inserted export can
        // otherwise inherit the old namespace's unchanged JSDoc by accident.
        const original = await readFile(path.join(snapshot,file),'utf8').catch(error => {
          if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return '';
          throw error;
        });
        if (succeeded(read) && finiteDocumentation(file,read.stdout,original)) { checks.documentation = true; break; }
      }
    }
  }
  return checks;
}
