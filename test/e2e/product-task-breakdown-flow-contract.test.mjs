import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Text contract for the task-breakdown flow gates. It proves the instructions are
// present and cannot be deleted silently; behavior is proven by the live run.
const FILES = Object.freeze({
  ref: '_refs/product/task-breakdown.md',
  skill: 'skills/tracks/product/sdcorejs-product.md',
  workspace: '_refs/product/project-workspace.md',
  sizing: '_refs/product/sizing-rubric.md',
  format: '_refs/product/task-format.md',
  connectors: '_refs/product/source-connectors.md',
});

const GATES = Object.freeze(['Project', 'Intake', 'Inventory', 'Reading mode', 'Draft', 'Capacity', 'Proposal', 'Tracker write', 'Report']);

const REQUIRED = Object.freeze({
  ref: [
    'The first reply in this mode covers G0 only and then stops for the user.',
    'Gates run in order and are never merged into one question.',
    'Do not inventory stories or draft tasks before the project is resolved or created.',
    'With two or more stories and `subagents` supported, read-only fan-out is mandatory.',
    'Do not suggest assignees before every roster member has an availability answer.',
    'Do not write `tasks/<scope>.md` before the proposal is approved.',
    'A menu choice or an instruction to write is intent, not approval of a write plan.',
    'Never overwrite a whole ticket description.',
    'For each operation: re-read the ticket, `check drift`, `check plan-verify`, `check merge`, write exactly the merge output, then read the ticket back.',
    'Run the check on the exact bytes before writing, then check the written file.',
    '`NOT RUN` is valid only with the attempted command and its error or permission denial.',
    'A missing `check.mjs` is a skill-pack defect: stop and report it, never record it as `NOT RUN`.',
    'Without the check CLI, tracker writes fall back to copy-paste drafts.',
    'The skill-pack root is the nearest ancestor directory of the skill file that contains `_refs/`.',
    'Print `result.table` from `check report` verbatim.',
  ],
  skill: [
    'The first reply in this mode covers G0 only and then stops for the user.',
    'G0..G8',
    'nearest ancestor directory of the skill file that contains `_refs/`',
    'Never treat a menu choice as write-plan approval',
    'Never overwrite a whole ticket description',
    '_refs/product/task-breakdown/check.mjs',
  ],
  workspace: ['`check project -`', 'on the exact bytes before writing'],
  sizing: ['`check balance -`'],
  format: ['`json sdcorejs-task-breakdown`', '`json sdcorejs-write-plan`', '`renderTask`'],
  connectors: ['Show connector, export or paste guidance for every source that could not be read.'],
});

function gateProblems(text) {
  const problems = [];
  const headings = [...text.matchAll(/^### G(\d) · (.+)$/gmu)].map((match) => ({ index: match.index, number: Number(match[1]), name: match[2].trim() }));
  const numbers = headings.map(({ number }) => number);
  if (numbers.join(',') !== GATES.map((_, index) => index).join(',')) problems.push(`gates must be G0..G8 in order, found ${numbers.join(',') || 'none'}`);
  headings.forEach((heading, position) => {
    if (GATES[heading.number] !== heading.name) problems.push(`G${heading.number} must be named ${GATES[heading.number]}`);
    const body = text.slice(heading.index, headings[position + 1]?.index ?? text.length);
    for (const label of ['**Stop:**', '**Evidence:**']) if (!body.includes(label)) problems.push(`G${heading.number} is missing ${label}`);
  });
  return problems;
}

function flowProblems(texts) {
  const problems = gateProblems(texts.ref ?? '');
  for (const [key, phrases] of Object.entries(REQUIRED)) {
    for (const phrase of phrases) if (!(texts[key] ?? '').includes(phrase)) problems.push(`${FILES[key]} is missing: ${phrase}`);
  }
  return problems;
}

async function readAll() {
  const entries = await Promise.all(Object.entries(FILES).map(async ([key, file]) =>
    [key, (await readFile(new URL(`../../${file}`, import.meta.url), 'utf8')).replace(/\r\n?/gu, '\n')]));
  return Object.fromEntries(entries);
}

test('case-task-breakdown-flow-gates: refs and skill state the mandatory gates G0..G8 and their rules', async () => {
  const texts = await readAll();
  assert.deepEqual(flowProblems(texts), []);
});

test('case-task-breakdown-flow-gates: removing any required rule or gate is detected', async () => {
  const texts = await readAll();
  for (const [key, phrases] of Object.entries(REQUIRED)) {
    for (const phrase of phrases) {
      const mutated = { ...texts, [key]: texts[key].replaceAll(phrase, '') };
      assert.ok(flowProblems(mutated).some((problem) => problem.includes(phrase)), `removal not detected: ${phrase}`);
    }
  }
  for (const [index, name] of GATES.entries()) {
    const mutated = { ...texts, ref: texts.ref.replace(`### G${index} · ${name}`, `### Step · ${name}`) };
    assert.ok(flowProblems(mutated).length > 0, `missing G${index} not detected`);
  }
  const swapped = texts.ref.replace('### G4 · Draft', '### G9 · Draft');
  assert.ok(flowProblems({ ...texts, ref: swapped }).length > 0, 'gate order change not detected');
  const noStop = texts.ref.replace(/(### G5 · Capacity[\s\S]*?)\*\*Stop:\*\*/u, '$1Stop:');
  assert.ok(flowProblems({ ...texts, ref: noStop }).some((problem) => problem.includes('G5 is missing **Stop:**')));
});
