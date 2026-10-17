import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Generated plugin/ and .claude/ skill mirrors must resolve every `_refs/` path
// from the SKILL.md directory, and the session-start bootstrap must carry
// absolute reference paths, because the injected text has no base directory.
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const CLAUDE_LAYOUTS = ['plugin/skills', '.claude/skills'];
const PATH_LINE = '**Path resolution:** Resolve `../../_refs/...` relative to this `SKILL.md`. Resolve another SDCoreJS skill by opening the sibling folder `../<skill-name>/SKILL.md`.';
const REF_PATH = /_refs\/([A-Za-z0-9_./<>{}*-]*)/gu;
const TEMPLATED = /[<>{}*]/u;

const read = (file) => readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n?/gu, '\n');
const skillNames = () => readdirSync(path.join(ROOT, 'plugin/skills')).filter((name) => name.startsWith('sdcorejs-')).sort();
const mirrorFiles = () => CLAUDE_LAYOUTS.flatMap((layout) => skillNames().map((name) => `${layout}/${name}/SKILL.md`));

/** Every problem with `_refs/` paths in one generated Claude-layout mirror. */
function mirrorRefProblems(text, skillDir) {
  const problems = [];
  const lines = text.split('\n').filter((line) => line === PATH_LINE);
  if (lines.length !== 1) problems.push(`expected exactly one path-resolution line, found ${lines.length}`);
  for (const match of text.matchAll(REF_PATH)) {
    const ref = match[1].replace(/[.:,;]+$/u, '');
    if (!/^[A-Za-z0-9<{*]/u.test(match[1])) continue; // a mention such as "contains `_refs/`" is not a path
    const prefix = text.slice(Math.max(0, match.index - 9), match.index);
    if (prefix.endsWith('>/')) continue; // anchored by an explicit placeholder root such as <skill-pack-root>/_refs/
    if (!prefix.endsWith('../../') || prefix.endsWith('../../../')) {
      problems.push(`\`_refs/${ref}\` is not written as ../../_refs/ (found "${prefix.slice(-6)}")`);
      continue;
    }
    if (ref === '' || TEMPLATED.test(ref)) continue;
    if (!existsSync(path.resolve(skillDir, '../../_refs', ref))) problems.push(`../../_refs/${ref} does not resolve`);
  }
  return problems;
}

test('case-mirror-refs-rewritten: plugin and .claude mirrors write every _refs path as ../../_refs/ with one path-resolution line', () => {
  const files = mirrorFiles();
  assert.equal(files.length, 46);
  for (const file of files) {
    const problems = mirrorRefProblems(read(file), path.join(ROOT, path.dirname(file)));
    assert.deepEqual(problems, [], file);
  }
});

test('case-mirror-refs-resolve: concrete references resolve from the SKILL.md directory and templated ones keep the prefix', () => {
  let concrete = 0; let templated = 0;
  for (const file of mirrorFiles()) {
    for (const match of read(file).matchAll(/\.\.\/\.\.\/_refs\/([A-Za-z0-9_./<>{}*-]+)/gu)) {
      const ref = match[1].replace(/[.:,;]+$/u, '');
      if (ref === '') continue;
      if (TEMPLATED.test(ref)) { templated += 1; continue; }
      concrete += 1;
      assert.ok(existsSync(path.resolve(ROOT, path.dirname(file), '../../_refs', ref)), `${file}: ../../_refs/${ref}`);
    }
  }
  assert.ok(concrete > 400, `concrete references checked: ${concrete}`);
  assert.ok(templated > 0, `templated references kept: ${templated}`);
});

test('case-mirror-refs-header: a bare mention of the _refs directory keeps its meaning', () => {
  for (const layout of CLAUDE_LAYOUTS) {
    const text = read(`${layout}/sdcorejs-product/SKILL.md`);
    assert.ok(text.includes('nearest ancestor directory of the skill file that contains `_refs/`'), layout);
  }
});

function bootstrapContext(env) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'plugin/hooks/session-start.mjs')], { cwd: ROOT, env, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  return output.additional_context ?? output.hookSpecificOutput?.additionalContext ?? output.additionalContext;
}

test('case-mirror-refs-bootstrap-absolute: every hook branch injects absolute _refs paths that exist', () => {
  const base = Object.fromEntries(Object.entries(process.env).filter(([key]) => !['CURSOR_PLUGIN_ROOT', 'CLAUDE_PLUGIN_ROOT', 'COPILOT_CLI'].includes(key)));
  const pluginRefs = `${realpathSync(path.join(ROOT, 'plugin')).replaceAll('\\', '/')}/_refs/`;
  for (const env of [{}, { CURSOR_PLUGIN_ROOT: 'x' }, { CLAUDE_PLUGIN_ROOT: 'x' }, { CLAUDE_PLUGIN_ROOT: 'x', COPILOT_CLI: '1' }]) {
    const context = bootstrapContext({ ...base, ...env });
    assert.match(context, /sdcorejs-using-skills/u);
    assert.ok(!context.includes('../../_refs/'), `${JSON.stringify(env)} still has relative refs`);
    assert.ok(context.includes(pluginRefs), `${JSON.stringify(env)} lacks ${pluginRefs}`);
    for (const match of context.matchAll(/(?:^|[\s`(])([A-Za-z]:\/[^\s`)]*?\/_refs\/[A-Za-z0-9_./-]+|\/[^\s`)]*?\/_refs\/[A-Za-z0-9_./-]+)/gu)) {
      const ref = match[1].replace(/[.:,;]+$/u, '');
      assert.ok(existsSync(ref), `${JSON.stringify(env)}: ${ref}`);
    }
  }
});

// A property check rather than a byte comparison with one base revision, so later
// changes to sources or refs keep it valid; the byte-identical proof of the mirror
// change itself stays in its evidence record.
function pathStyleProblems(files) {
  const problems = [];
  for (const [file, text] of files) {
    if (text.includes(PATH_LINE)) problems.push(`${file} carries the Claude-layout path-resolution line`);
    if (/^codex\/skills\/sdcorejs-[^/]+\/SKILL\.md$/u.test(file)) {
      if (text.includes('../../_refs/')) problems.push(`${file} uses the Claude-layout ../../_refs/ prefix`);
      if (!text.includes('../_refs/')) problems.push(`${file} lost the codex ../_refs/ prefix`);
    }
  }
  return problems;
}

test('case-mirror-refs-unchanged: sources, codex mirrors and AGENTS.md outputs keep their own path style', () => {
  const tracked = execFileSync('git', ['ls-files', '--', 'skills', 'codex/skills'], { cwd: ROOT, encoding: 'utf8', windowsHide: true })
    .split(/\r?\n/u).filter((file) => file.endsWith('.md'));
  assert.ok(tracked.length > 40);
  const files = new Map([...tracked, 'AGENTS.md', '.cursor/rules/sdcorejs-agent.mdc', '.github/copilot-instructions.md'].map((file) => [file, read(file)]));
  const codexSkills = [...files.keys()].filter((file) => /^codex\/skills\/sdcorejs-[^/]+\/SKILL\.md$/u.test(file));
  assert.equal(codexSkills.length, skillNames().length);
  assert.deepEqual(pathStyleProblems(files), []);
  const codexFile = 'codex/skills/sdcorejs-product/SKILL.md';
  const leaked = new Map(files).set(codexFile, `${files.get(codexFile)}\n${PATH_LINE}\n`);
  assert.ok(pathStyleProblems(leaked).some((problem) => problem.includes('path-resolution line')), 'a leaked Claude header is detected');
  const deepened = new Map(files).set(codexFile, files.get(codexFile).replaceAll('../_refs/', '../../_refs/'));
  assert.ok(pathStyleProblems(deepened).some((problem) => problem.includes('../../_refs/')), 'a Claude-layout prefix in codex is detected');
  const source = 'skills/tracks/product/sdcorejs-product.md';
  assert.ok(pathStyleProblems(new Map(files).set(source, `${files.get(source)}\n${PATH_LINE}\n`)).length > 0, 'a header in a source skill is detected');
});

test('case-mirror-refs-mutation: the checker rejects bare, wrong-depth and header-less mirrors', () => {
  const file = 'plugin/skills/sdcorejs-product/SKILL.md';
  const original = read(file);
  const dir = path.join(ROOT, path.dirname(file));
  assert.deepEqual(mirrorRefProblems(original, dir), []);
  const first = original.indexOf('../../_refs/product/');
  assert.ok(first > 0);
  const bare = `${original.slice(0, first)}${original.slice(first + 6)}`;
  assert.ok(mirrorRefProblems(bare, dir).some((problem) => problem.includes('is not written as ../../_refs/')));
  const shallow = `${original.slice(0, first)}${original.slice(first + 3)}`;
  assert.ok(mirrorRefProblems(shallow, dir).some((problem) => problem.includes('is not written as ../../_refs/')));
  const headerless = original.replace(`${PATH_LINE}\n`, '');
  assert.ok(mirrorRefProblems(headerless, dir).some((problem) => problem.includes('path-resolution line')));
  const broken = original.replace('../../_refs/product/task-breakdown.md', '../../_refs/product/missing-ref.md');
  assert.ok(mirrorRefProblems(broken, dir).some((problem) => problem.includes('does not resolve')));
});
