import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { runCliPrompt } from './cli-adapters.mjs';

const EXPECTATIONS = new Set(['offer', 'preview', 'no-offer', 'clarify', 'no-repeat', 'fallback', 'no-approval']);
const METRICS = ['correct_offer', 'missed_offer', 'false_offer', 'duplicate_offer', 'redundant_preview_question', 'preview_missing', 'fallback_failure', 'approval_violation'];
function relevantMetrics(expected) {
  return expected === 'offer' ? ['correct_offer', 'missed_offer']
    : expected === 'no-repeat' ? ['duplicate_offer']
      : expected === 'preview' ? ['redundant_preview_question', 'preview_missing']
        : expected === 'fallback' ? ['fallback_failure']
          : expected === 'no-approval' ? ['approval_violation'] : ['false_offer'];
}
const ENTRIES = {
  brainstorming: 'skills/shared/sdlc/01-brainstorming.md',
  design: 'skills/tracks/design/sdcorejs-design.md',
  executor: 'skills/tracks/angular/sdcorejs-angular.md',
};
export const digest = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

export function validateScenarios(fixture) {
  const errors = [], ids = new Set();
  if (fixture?.schema_version !== 1 || !Array.isArray(fixture.scenarios) || !fixture.scenarios.length) return ['invalid scenario fixture'];
  for (const scenario of fixture.scenarios) {
    if (!/^[a-z][a-z0-9-]+$/.test(scenario.id) || ids.has(scenario.id)) errors.push('invalid or duplicate scenario id');
    ids.add(scenario.id);
    if (!ENTRIES[scenario.entry]) errors.push(`${scenario.id}: invalid entry`);
    if (!Array.isArray(scenario.turns) || !scenario.turns.length) errors.push(`${scenario.id}: turns required`);
    for (const turn of scenario.turns ?? []) {
      if (typeof turn.user !== 'string' || !turn.user.trim() || !EXPECTATIONS.has(turn.expected) || !['response', 'offer'].includes(turn.requires)) errors.push(`${scenario.id}: invalid turn`);
      if (Object.keys(turn).some(key => !['user', 'expected', 'requires'].includes(key))) errors.push(`${scenario.id}: unexpected authored assistant/turn field`);
    }
  }
  return errors;
}

/** Hash canonical skills and JIT references. Root entrypoint provenance is recorded separately. */
export async function sourceManifest(sourceRoot) {
  const entries = [];
  async function visit(relative) {
    for (const entry of (await readdir(path.join(sourceRoot, relative), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const name = `${relative}/${entry.name}`;
      if (entry.isSymbolicLink()) throw new Error(`source snapshot contains symlink: ${name}`);
      if (entry.isDirectory()) await visit(name);
      else if (entry.isFile()) entries.push({ path: name, sha256: digest(await readFile(path.join(sourceRoot, name), 'utf8')) });
    }
  }
  await visit('skills'); await visit('_refs');
  return { entries, sha256: digest(entries) };
}

export async function buildPrompt({ sourceRoot, fixture, scenario, history, user }) {
  const bootstrap = await readFile(path.join(sourceRoot, 'skills/orchestration/using-skills.md'), 'utf8');
  const entry = await readFile(path.join(sourceRoot, ENTRIES[scenario.entry]), 'utf8');
  // Deliberate allowlist: expected labels, scoring and semantic flags never reach the agent.
  return [
    'Continue a conversation in a synthetic application fixture using the supplied SDCoreJS instructions. Respond naturally in the user language.',
    'Complete exactly one assistant turn and exit, including when asking a question. Express any simulated interaction in the final response; do not wait for user input or invoke a real interaction tool. The driver supplies the next actual user turn. Do not research external sources for this controlled fixture.',
    'The fixture is an existing Angular portal using sd-table; this is a dialogue evaluation, not permission to change a real application. No source implementation or browser/process launch is allowed in this capture. Preview artifacts may be emitted as HTML/SVG content for inspection. Surface capabilities below are simulated, not actual runtime attestation.',
    `Canonical skill reference root: ${sourceRoot}. Read referenced files only when the supplied workflow requires them. The supplied source version is authoritative for this evaluation.`,
    `Simulated surface inventory: ${JSON.stringify(scenario.capabilities ?? fixture.capabilities)}`,
    scenario.runtime_event ? `Runtime observation: ${JSON.stringify(scenario.runtime_event)}` : '',
    `<bootstrap>\n${bootstrap}\n</bootstrap>`, `<entry>\n${entry}\n</entry>`,
    `Actual conversation so far:\n${JSON.stringify(history)}`,
    `User message:\n${user}`,
  ].filter(Boolean).join('\n\n');
}

/** Suggestions for review only. They never become a live pass without adjudication. */
export function observeText(text) {
  const visual = /mockup|preview|trực quan|sơ đồ|wireframe|visual|diagram/i.test(text);
  const question = /\?|bạn muốn|would you like|want (?:me|to)|muốn xem/i.test(text);
  const preview = /<svg\b|<!doctype html|<html\b|```(?:html|svg|mermaid)\b|!\[[^\]]*\]\(/i.test(text);
  return { possible_offer: visual && question && !preview, preview_content: preview };
}

export function parseCliTurn(run) {
  const events = [];
  for (const line of run.stdout.split(/\r?\n/).filter(Boolean)) {
    try { events.push(JSON.parse(line)); } catch { /* diagnostics are not transcript events */ }
  }
  const messages = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message').map(e => e.item.text);
  const completed = events.findLast(e => e.type === 'turn.completed');
  const failed = events.find(e => e.type === 'turn.failed' || e.type === 'error');
  return {
    completed: run.exit_code === 0 && !run.interrupted && !failed && !!completed && messages.length > 0,
    assistant: messages.join('\n\n'),
    usage: completed?.usage ?? null,
    session_id: events.find(e => e.type === 'thread.started')?.thread_id ?? null,
    tool_events: events.filter(e => e.type === 'item.completed' && e.item?.type !== 'agent_message').map(e => ({ type: e.item.type, status: e.item.status ?? null, command: e.item.command ?? null })),
    failure: run.error ?? (failed ? JSON.stringify(failed) : run.interrupted),
  };
}

export async function runScenario({ sourceRoot, fixture, scenario, invoke = runCliPrompt, executable, timeoutMs, prior_turns = [] }) {
  // Continue only a completed captured prefix; never invent a preceding offer.
  if (!Array.isArray(prior_turns) || prior_turns.length > scenario.turns.length || prior_turns.some((turn, index) =>
    !turn.completed || !turn.assistant || turn.turn_index !== index || turn.user !== scenario.turns[index].user || turn.exit_code !== 0 || turn.interrupted)) {
    throw new TypeError('prior_turns must be a completed actual scenario prefix');
  }
  const turns = structuredClone(prior_turns);
  const history = turns.flatMap(turn => [{ role: 'user', content: turn.user }, { role: 'assistant', content: turn.assistant }]);
  for (const [index, turn] of scenario.turns.entries()) {
    if (index < prior_turns.length) continue;
    // The decline is a valid new user preference even without a preceding offer.
    // A semantic reviewer, never a keyword heuristic, checks no-repeat evidence.
    const prompt = await buildPrompt({ sourceRoot, fixture, scenario, history, user: turn.user });
    const run = await invoke({ executable, cwd: sourceRoot, prompt, timeoutMs });
    const parsed = parseCliTurn(run);
    const receipt = { turn_index: index, user: turn.user, prompt_hash: digest(prompt), exit_code: run.exit_code, interrupted: run.interrupted,
      duration_ms: run.duration_ms, assistant: parsed.assistant || null, usage: parsed.usage,
      session_id: parsed.session_id, tool_events: parsed.tool_events, observed: observeText(parsed.assistant),
      requires_prior_offer: index > 0 && turn.requires === 'offer',
      completed: parsed.completed, failure: parsed.failure, adjudication: null };
    turns.push(receipt);
    if (!parsed.completed) return { scenario_id: scenario.id, status: 'NOT RUN', reason: parsed.failure ?? 'CLI did not provide a completed turn and assistant message.', turns };
    history.push({ role: 'user', content: turn.user }, { role: 'assistant', content: parsed.assistant });
  }
  return { scenario_id: scenario.id, status: 'REVIEW REQUIRED', reason: 'Actual captured turns require semantic review; heuristic observations are not a verdict.', turns };
}

export function validateRecord(record, fixture) {
  const errors = [];
  if (record.schema_version !== 1 || record.fixture_hash !== digest(fixture)) errors.push('fixture identity mismatch');
  if (record.source_manifest?.sha256 !== digest(record.source_manifest?.entries)) errors.push('source manifest identity mismatch');
  if (!Array.isArray(record.scenarios)) return [...errors, 'scenario runs required'];
  const expected = new Map(fixture.scenarios.map(s => [s.id, s]));
  const seen = new Set();
  for (const run of record.scenarios) {
    const scenario = expected.get(run.scenario_id);
    if (!scenario || seen.has(run.scenario_id)) { errors.push('unknown or duplicate scenario receipt'); continue; }
    seen.add(run.scenario_id);
    if (!['NOT RUN', 'INCONCLUSIVE', 'REVIEW REQUIRED'].includes(run.status)) errors.push('unsupported run status; review lives in adjudications');
    if (!run.reason || !Array.isArray(run.turns)) errors.push('run reason/turns required');
    for (const [index, turn] of (run.turns ?? []).entries()) {
      if (turn.user !== scenario.turns[index]?.user || turn.turn_index !== index) errors.push('turn does not match scenario');
      if (turn.completed && (!turn.assistant || turn.exit_code !== 0 || turn.interrupted || !turn.session_id
        || !Number.isFinite(turn.duration_ms) || turn.duration_ms < 0 || !/^[a-f0-9]{64}$/.test(turn.prompt_hash))) errors.push('invalid completed turn receipt');
      if (!turn.completed && turn.adjudication) errors.push('incomplete turn cannot be adjudicated as behavior');
      if (turn.adjudication) {
        const review = turn.adjudication, relevant = relevantMetrics(scenario.turns[index]?.expected);
        if (typeof review.reviewer !== 'string' || !review.reviewer.trim() || typeof review.rationale !== 'string' || !review.rationale.trim()
          || relevant.some(key => typeof review[key] !== 'boolean')
          || Object.keys(review).some(key => !['reviewer', 'rationale', ...relevant].includes(key))) errors.push('invalid or incomplete semantic adjudication');
        if (relevant.includes('correct_offer') && review.correct_offer === review.missed_offer) errors.push('correct and missed offer must be complementary');
        if (scenario.turns[index]?.requires === 'offer' && run.turns[index - 1]?.adjudication?.correct_offer !== true) errors.push('no-repeat adjudication requires a semantically confirmed prior offer');
      }
    }
    if (run.status === 'REVIEW REQUIRED' && (run.turns.length !== scenario.turns.length || run.turns.some(t => !t.completed))) errors.push('completed conversation is incomplete');
  }
  if (seen.size !== expected.size) errors.push('scenario coverage incomplete');
  return errors;
}

/** Denominators include unrun and unreviewed opportunities; null is never a pass. */
export function summarizeRecord(record, fixture) {
  const errors = validateRecord(record, fixture); if (errors.length) throw new Error(errors.join('; '));
  const metrics = Object.fromEntries(METRICS.map(key => [key, { count: 0, denominator: 0, reviewed: 0, rate: null }]));
  for (const scenario of fixture.scenarios) for (const [index, turn] of scenario.turns.entries()) {
    const actual = record.scenarios.find(r => r.scenario_id === scenario.id)?.turns[index];
    const relevant = relevantMetrics(turn.expected);
    for (const key of relevant) {
      const metric = metrics[key]; metric.denominator++;
      const review = actual?.adjudication;
      if (actual?.completed && review?.reviewer && review?.rationale && typeof review[key] === 'boolean') { metric.reviewed++; if (review[key]) metric.count++; }
    }
  }
  for (const metric of Object.values(metrics)) metric.rate = metric.reviewed ? metric.count / metric.reviewed : null;
  return { metrics, complete_live_coverage: record.scenarios.every(r => r.status === 'REVIEW REQUIRED') && Object.values(metrics).every(m => m.reviewed === m.denominator), limitation: 'Controlled dialogue with simulated capabilities; not real visual-surface or target-project execution.' };
}
