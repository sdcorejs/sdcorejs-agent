import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { detectCliAdapter } from '../test/e2e/support/cli-adapters.mjs';
import { digest, sourceManifest, validateScenarios, runScenario, validateRecord, summarizeRecord } from '../test/e2e/support/visual-offer-eval-runner.mjs';

const { values } = parseArgs({ options: {
  help: { type: 'boolean' }, live: { type: 'boolean' },
  'source-root': { type: 'string', default: '.' }, 'source-revision': { type: 'string' },
  scenarios: { type: 'string', default: 'test/e2e/fixtures/visual-offer-scenarios.json' },
  output: { type: 'string' }, review: { type: 'string' }, compare: { type: 'string' },
  executable: { type: 'string', default: 'codex' }, 'timeout-ms': { type: 'string', default: '120000' },
} });
if (values.help) {
  console.log('Offline: node scripts/eval-visual-offer.mjs [--scenarios file]\nLive: add --live --source-root path --source-revision commit --output file [--executable codex.exe]\nReview: --review record.json [--compare other-record.json]\nLive retains actual responses for semantic review. It never auto-grades from keywords.');
} else {
  const fixture = JSON.parse(await readFile(values.scenarios, 'utf8'));
  const errors = validateScenarios(fixture); if (errors.length) throw new Error(errors.join('; '));
  if (values.review) {
    const record = JSON.parse(await readFile(values.review, 'utf8'));
    const report = summarizeRecord(record, fixture);
    if (values.compare) {
      const other = JSON.parse(await readFile(values.compare, 'utf8'));
      if (record.fixture_hash !== other.fixture_hash || JSON.stringify(record.runtime) !== JSON.stringify(other.runtime)) throw new Error('A/B conditions differ; compare only equivalent fixture/runtime settings');
      report.comparison = summarizeRecord(other, fixture);
    }
    console.log(JSON.stringify(report, null, 2));
  } else if (!values.live) {
    console.log(JSON.stringify({ mode: 'offline-scenario-validation', scenarios: fixture.scenarios.length, turns: fixture.scenarios.reduce((n, s) => n + s.turns.length, 0), fixture_hash: digest(fixture), provider_calls: 0, live_behavior: 'NOT RUN' }, null, 2));
  } else {
    if (!values.output || !/^[a-f0-9]{40}$/.test(values['source-revision'] ?? '')) throw new Error('Live requires --output and exact --source-revision');
    const timeoutMs = Number(values['timeout-ms']);
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 600000) throw new Error('timeout must be between 1000 and 600000 ms');
    const sourceRoot = path.resolve(values['source-root']);
    const manifest = await sourceManifest(sourceRoot);
    const detected = await detectCliAdapter(values.executable);
    const record = { schema_version: 1, evidence_kind: 'actual-cli-dialogue', created_at: new Date().toISOString(), source_revision: values['source-revision'], source_manifest: manifest,
      fixture_hash: digest(fixture), runtime: { cli: 'codex', version: detected.versionOutput, model: 'inherited-default-not-reported', effort: 'inherited-default-not-reported', capture: 'ephemeral-read-only-full-actual-history', capabilities: 'simulated-fixture', timeout_ms: timeoutMs }, scenarios: [] };
    let unavailable = detected.available ? null : 'CLI version probe failed; live invocation unavailable.';
    for (const scenario of fixture.scenarios) {
      const result = unavailable ? { scenario_id: scenario.id, status: 'NOT RUN', reason: unavailable, turns: [] }
        : await runScenario({ sourceRoot, fixture, scenario, executable: values.executable, timeoutMs });
      record.scenarios.push(result);
      console.log(`${scenario.id}: ${result.status}`);
      if (result.status === 'NOT RUN') unavailable = result.reason;
    }
    const after = await sourceManifest(sourceRoot);
    if (after.sha256 !== manifest.sha256) throw new Error('Source changed during live capture; evidence cannot be compared');
    const issues = validateRecord(record, fixture); if (issues.length) throw new Error(issues.join('; '));
    // Runtime/authenticated URLs and credential-looking values never enter durable evidence.
    const serialized = JSON.stringify(record, null, 2)
      .replace(/https?:\/\/[^\s"\\]*(?:token|key|auth)=[^\s"\\]*/gi, '[REDACTED_URL]')
      .replace(/\b(?:sk-[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9._-]{16,})/g, '[REDACTED]');
    await mkdir(path.dirname(path.resolve(values.output)), { recursive: true });
    await writeFile(values.output, serialized + '\n', { encoding: 'utf8', flag: 'wx' });
    console.log(JSON.stringify({ output: values.output, summary: summarizeRecord(JSON.parse(serialized), fixture) }));
  }
}
