import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmod, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inventory, isTestFile, suiteRoot } from './comparison-runtime.mjs';
import { reportComparison, scopeAllowed } from './comparison-report.mjs';

async function temp(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'comparison-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

function checkOracle(project, script, id) {
  const args = id ? ['--test-name-pattern', '^' + id + ':'] : [];
  const env = {...process.env};
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--test-reporter=tap', ...args, path.join(suiteRoot, script), project], { encoding: 'utf8', env });
  if (result.error) throw result.error;
  return result;
}

test('external CSV assertions reject a parser that bypasses the billing contract', async t => {
  const dir = await temp(t);
  await cp(path.join(suiteRoot, 'consumer'), dir, { recursive: true });
  const file = path.join(dir, 'src/imports/invoice.mjs');
  const good = "import { billOrder } from '../billing/entry.mjs';\nexport const readInvoice = row => ({ invoice: row.invoice, ...('orderCode' in row ? billOrder(row.orderCode) : {}) });";
  await writeFile(file, good);
  assert.equal(checkOracle(dir, 'consumer-acceptance.mjs').status, 0);
  await writeFile(file, good.replace('billOrder(row.orderCode)', '{orderCode: row.orderCode}'));
  assert.equal(checkOracle(dir, 'consumer-acceptance.mjs').status, 1);
});

test('the JSON oracle runs one case and catches a missed close on error', async t => {
  const dir = await temp(t);
  await cp(path.join(suiteRoot, 'decisions'), dir, { recursive: true });
  const adapter = path.join(dir, 'adapters/json.mjs');
  const good = "import { Reader } from './reader.mjs';\nexport class JsonReader extends Reader { async decode(c) { return JSON.parse(await c.text()); } }";
  await writeFile(adapter, good.replace('await c.text()', 'c.text()'));
  assert.equal(checkOracle(dir, 'decision-acceptance.mjs', 'D').status, 1);
  await writeFile(adapter, good);
  const pass = checkOracle(dir, 'decision-acceptance.mjs', 'D');
  assert.equal(pass.status, 0, pass.stdout + pass.stderr);
  assert.match(pass.stdout, /(?:#|ℹ) tests 1\b/);
  const reader = path.join(dir, 'adapters/reader.mjs');
  await writeFile(reader, (await readFile(reader, 'utf8')).replace('await connection.close();', 'void connection;'));
  assert.equal(checkOracle(dir, 'decision-acceptance.mjs', 'D').status, 1);
});

test('read-only and documentation scopes detect reverted or extra writes', () => {
  for (const id of ['B','E','Q']) {
    assert.equal(scopeAllowed({ case:id, changed:[], writes:[{file:'temp'}] }), false);
    assert.equal(scopeAllowed({ case:id, changed:[], writes:[] }), true);
  }
  const docs = {case:'H', changed:['README.md'], originalPaths:['README.md','src.mjs']};
  assert.equal(scopeAllowed({...docs, writes:[{file:'src.mjs'}]}), false);
  assert.equal(scopeAllowed({...docs, writes:[{file:'README.md.tmp'},{file:'README.md'}]}), true);
});

test('recognizes root-level tests discovered by the native Node test runner', async t => {
  const dir = await temp(t);
  const name = 'test-refund.mjs';
  await writeFile(path.join(dir, name), "import test from 'node:test'; test('refund boundaries', () => {});");
  const env = {...process.env};
  delete env.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--test','--test-reporter=tap'], {cwd:dir, env, encoding:'utf8'});
  assert.equal(result.status, 0);
  assert.match(result.stdout, /# tests 1/);
  for (const name of ['test-refund.mjs','refund_test.js','refund-test.cjs','test/api.ts','refund.test.mjs']) assert.ok(isTestFile(name), name);
  assert.equal(isTestFile('src/contest.mjs'), false);
});

test('the inventory sees mode-only and directory-only changes', { skip:process.platform === 'win32' }, async t => {
  const dir = await temp(t);
  const file = path.join(dir, 'cmd.mjs');
  await writeFile(file, 'console.log(42);', { mode:0o600 });
  const before = await inventory(dir);
  await chmod(file, 0o700);
  await mkdir(path.join(dir, 'empty'));
  const after = await inventory(dir);
  assert.notEqual(before['cmd.mjs'], after['cmd.mjs']);
  assert.match(after.empty, /^directory:/);
});

test('identical decisions tie even when skill delivery is unobserved and a timeout stays unpaired', async t => {
  const dir = await temp(t);
  const arms = ['baseline','simplify','ponytail'];
  const binding = { packageSha256:'a', ponytailRevision:'b', manifestSha256:'c' };
  const run = { ...binding, arms, cases:['A'], repetitions:2, expected:6 };
  await writeFile(path.join(dir, 'run.json'), JSON.stringify(run));
  const reviews = [];
  for (const arm of arms) for (const repetition of [1,2]) {
    const blindId = arm + repetition;
    const folder = path.join(dir, blindId);
    await mkdir(folder);
    const status = arm==='ponytail' && repetition===2 ? 'timeout' : 'completed';
    const receipt = { ...binding, blindId, arm, repetition, status, case:'A', changed:[], writes:[],
      expectedSkill:true, guidance:arm==='simplify' ? 'unobserved' : null, checks:{'requested-tests':true,'project-tests':true,hidden:true} };
    await writeFile(path.join(folder, 'receipt.json'), JSON.stringify(receipt));
    if (status==='completed') reviews.push({blindId, pass:true, reason:'Uses the existing parser.'});
  }
  const reviewFile = path.join(dir, 'reviews.json');
  await writeFile(reviewFile, JSON.stringify(reviews));
  const { pairs, summaries } = await reportComparison(dir, reviewFile);
  assert.deepEqual(pairs.map(({win,tie,loss,missing})=>[win,tie,loss,missing]), [[0,2,0,0],[0,1,0,1]]);
  assert.equal(summaries.find(s=>s.arm==='simplify').observedDelivery, 0);
  const file = path.join(dir,'simplify1','receipt.json');
  const incomplete = JSON.parse(await readFile(file));
  delete incomplete.checks.hidden;
  await writeFile(file, JSON.stringify(incomplete));
  const rerun = await reportComparison(dir, reviewFile);
  assert.equal(rerun.summaries.find(s=>s.arm==='simplify').incompleteChecks, 1);
  assert.equal(rerun.pairs[1].missing, 2);
});

test('GitHub scoring preserves each original nested identity and counts only a newly passing red/green assertion', async () => {
  const { assertionInventory, assessProjectTests, heldOutPassed } = await import('./github/verification.mjs');
  const file = 'src/fns/number.fns.spec.ts';
  const result = (rows, { code = 0, name = file } = {}) => {
    const assertions = rows.map(([suite, title, status = 'passed']) => ({
      ancestorTitles: [suite], title, fullName: suite + ' ' + title, status,
    }));
    return { code, timedOut:false, stdout: JSON.stringify({
      success: code === 0, numTotalTests: assertions.length,
      testResults:[{name:'/work/' + name, assertionResults:assertions}],
    }) };
  };
  const old = Array.from({length:64}, (_, i) => ['legacy', 'example ' + i]);
  const fresh = ['finite numbers', 'rejects overflow'];
  const base = assertionInventory(result(old));
  const assess = (candidate, control = result([[...fresh,'failed']], {code:1})) =>
    assessProjectTests(base, assertionInventory(candidate), assertionInventory(control), [file]);
  assert.deepEqual(assess(result([...old, fresh])), {preserved:true, requested:true});
  assert.equal(assess(result([...old, fresh]), result([fresh])).requested, false);
  assert.equal(assess(result([...old,[...fresh,'pending']])).requested, false);
  assert.equal(assess(result(old)).requested, false);
  assert.equal(assess(result([...old.slice(0,5),fresh])).preserved, false);
  assert.equal(assess(result([])).preserved, false);
  assert.equal(assess(result(old.map(([,title])=>['other', title]))).preserved, false);
  assert.equal(assess(result(old, {name:'src/elsewhere.spec.ts'})).preserved, false);
  assert.equal(assess(result([...old.slice(0,-1),[...old.at(-1),'pending']])).preserved, false);
  assert.equal(assess(result([...old, fresh]), result([], {code:1})).requested, false);
  assert.equal(heldOutPassed(assertionInventory(result([fresh])), file, [fresh]), true);
  assert.equal(heldOutPassed(assertionInventory(result([])), file, [fresh]), false);
  assert.equal(heldOutPassed(assertionInventory(result([[...fresh,'pending']])), file, [fresh]), false);
  assert.equal(heldOutPassed(assertionInventory(result([fresh], {name:'unrelated.test.ts'})), file, [fresh]), false);
});

test('each installed catalog is matched independently of automatic before-code delivery', async () => {
  const { catalogDescription, deliverySignals, validArmDelivery } = await import('./comparison-runtime.mjs');
  const legacy = 'Use for scoped, tested refactors.';
  const current = 'Before editing production code, trace callers and tests, then choose the narrowest owner.';
  assert.equal(catalogDescription('---\nname: sdcorejs-simplify\ndescription: ' + legacy + '\n---\nbody'), legacy);
  for (const description of [legacy, current]) {
    const record = deliverySignals('<name>sdcorejs-simplify</name> <description>'+description+'</description>', description);
    assert.equal(validArmDelivery('simplify', record), true);
    assert.equal(record.simplify, description === current);
  }
  const guidance = '# Before writing code\n\nCheck the caller.\nKeep the documented contract.';
  const catalog = 'sdcorejs-simplify ' + current;
  assert.equal(validArmDelivery('simplify', deliverySignals(catalog,current,[],guidance),true), false);
  const partial = JSON.stringify([catalog, '# Before writing code\n\nCheck the caller.']);
  assert.equal(validArmDelivery('simplify', deliverySignals(partial,current,[],guidance),true), false);
  const full = JSON.stringify([catalog,guidance]);
  assert.equal(validArmDelivery('simplify', deliverySignals(full,current,[],guidance),true), true);
  assert.equal(validArmDelivery('simplify', deliverySignals('sdcorejs-simplify '+legacy, current)), false);
  assert.equal(validArmDelivery('baseline', deliverySignals('<name>sdcorejs-simplify</name> '+legacy)), false);
  assert.equal(validArmDelivery('baseline', deliverySignals('ordinary project')), true);
  assert.equal(validArmDelivery('ponytail', deliverySignals('PONYTAIL MODE ACTIVE')), true);
});

test('candidate links and special files never reach verifier overlays', async t => {
  const { symlink } = await import('node:fs/promises');
  const { unsafeEntries } = await import('./comparison-runtime.mjs');
  const project = await temp(t);
  await mkdir(path.join(project,'src'));
  await writeFile(path.join(project,'src','real.ts'),'export {};');
  assert.deepEqual(unsafeEntries(await inventory(project)), []);
  await symlink('src',path.join(project,'alias'));
  await symlink('real.ts',path.join(project,'src','alias.ts'));
  const files = await inventory(project);
  assert.deepEqual(unsafeEntries(files), ['alias','src/alias.ts']);
  const {verifyGithubProject} = await import('./github/verification.mjs');
  assert.deepEqual(await verifyGithubProject({files}, () => assert.fail('A verifier ran')), {integrity:false});
});

test('public API documentation has to change with the new export', async () => {
  const {finiteDocumentation} = await import('./github/verification.mjs');
  const old = '/** Utilities for numeric values. */\nexport const NumberUtilities = {};';
  const added = 'export const isFiniteNumericString = value => false;\n';
  assert.equal(finiteDocumentation('src/number.ts',old.replace('export const',added+'export const'),old),false);
  assert.equal(finiteDocumentation('src/number.ts','/** Accepts finite numeric strings. */\n'+added+old,old),true);
  assert.equal(finiteDocumentation('README.md','Call isFiniteNumericString for finite strings.',''),true);
  assert.equal(finiteDocumentation('README.md','Old isFiniteNumericString line.\nUnrelated change','Old isFiniteNumericString line.'),false);
});

test('the isolated installed skill resolves standalone guidance and the full packaged contract', async t => {
  const {isolateInstalledSkill} = await import('./comparison-runtime.mjs');
  const {readdir} = await import('node:fs/promises');
  const {pathToFileURL} = await import('node:url');
  const dir = await temp(t);
  const skills = path.join(dir,'package','skills');
  const name = 'sdcorejs-simplify';
  await mkdir(path.join(skills,name,'references/simplify'),{recursive:true});
  await mkdir(path.join(skills,'_refs/simplify'),{recursive:true});
  await mkdir(path.join(skills,'sdcorejs-other'));
  const standalone = 'references/simplify/before-writing-code.md';
  const contract = '../_refs/simplify/simplify-contract.mjs';
  const entry = '---\nname: sdcorejs-simplify\ndescription: Compare.\n---\n[guide]('+standalone+') [contract]('+contract+')';
  await writeFile(path.join(skills,name,'SKILL.md'),entry);
  await writeFile(path.join(skills,name,standalone),'Compare callers.');
  await writeFile(path.join(skills,name,contract),'export const full = true;');
  const target = path.join(dir,'selected');
  const selected = await isolateInstalledSkill(path.join(dir,'package'),target);
  assert.deepEqual((await readdir(path.join(target,'skills'))).sort(),['_refs',name]);
  assert.equal(await readFile(path.join(selected.bundled,standalone),'utf8'),'Compare callers.');
  assert.equal((await import(pathToFileURL(path.join(selected.refs,'simplify/simplify-contract.mjs')))).full,true);
});
