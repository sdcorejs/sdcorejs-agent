import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const [base, preOptimization, tokenizerPrefix] = process.argv.slice(2);
assert.match(base ?? '', /^[a-f0-9]{40}$/u, 'Provide a baseline Git revision');
assert.ok(preOptimization && tokenizerPrefix, 'Provide the preserved snapshot and isolated js-tiktoken install');
const requireTokenizer = createRequire(join(resolve(tokenizerPrefix), 'package.json'));
const { getEncoding } = requireTokenizer('js-tiktoken');
const version = JSON.parse(readFileSync(join(tokenizerPrefix, 'node_modules/js-tiktoken/package.json'))).version;
const encoder = getEncoding('o200k_base');

const bootstrap = ['AGENTS.md', 'skills/orchestration/using-skills.md', '_refs/shared/runtime-protocols.md'];
const fullDesign = '_refs/shared/design-handoff.md';
const fidelity = '_refs/shared/ui-handoff-fidelity.md';
const map = '_refs/shared/validation-map.md';
const skill = name => `codex/skills/sdcorejs-${name}/SKILL.md`;
const scenarios = [
  ['bootstrap', bootstrap, bootstrap, bootstrap],
  ['angular-handoff', [skill('angular'), '_refs/angular/write-code/input-analysis.md'],
    [skill('angular'), '_refs/angular/write-code/input-analysis.md', fullDesign],
    [skill('angular'), '_refs/angular/write-code/input-analysis.md', fidelity]],
  ['test-handoff', [skill('test'), map], [skill('test'), map, fullDesign], [skill('test'), map, fidelity]],
  ['ship-handoff', [skill('ship'), '_refs/orchestration/tail/verify-before-done.md', map],
    [skill('ship'), '_refs/orchestration/tail/verify-before-done.md', map, fullDesign],
    [skill('ship'), '_refs/orchestration/tail/verify-before-done.md', map, fidelity]],
  ['design-authorship', [skill('design'), fullDesign], [skill('design'), fullDesign], [skill('design'), fullDesign, fidelity]],
];
const readers = [
  file => execFileSync('git', ['show', `${base}:${file}`]),
  file => readFileSync(join(preOptimization, file)),
  file => readFileSync(file),
];
function measure(files, read) {
  const inputs = files.map(path => {
    const bytes = read(path);
    return { path, sha256: createHash('sha256').update(bytes).digest('hex'), tokens: encoder.encode(bytes.toString('utf8'), [], []).length };
  });
  return { tokens: inputs.reduce((total, file) => total + file.tokens, 0), inputs };
}
const results = scenarios.map(([scenario, ...inputs]) => {
  const [baseline, before, after] = inputs.map((paths, index) => measure(paths, readers[index]));
  return { scenario, baseline, before, after, saved_vs_unsplit: before.tokens - after.tokens };
});
console.log(JSON.stringify({
  scope: 'sum of exact o200k_base source tokens across modeled Codex loads; no message, tool, project, model-output or billing tokens',
  tokenizer: { package: 'js-tiktoken', version, encoding: 'o200k_base' }, base, results,
}, null, 2));
