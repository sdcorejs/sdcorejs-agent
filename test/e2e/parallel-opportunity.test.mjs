import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import * as protocol from '../../_refs/orchestration/parallel-protocol.mjs';
import { dispatchPrompt, loadSkillPack, runParallelOpportunityEval } from './support/skill-pack-runner.mjs';
import { loadEntrypointProfiles, runEntrypointPromptSmoke } from './support/entrypoint-smoke.mjs';

const root = new URL('../..', import.meta.url);
const cases = JSON.parse(await readFile(new URL('./fixtures/parallel-opportunity-scenarios.json', import.meta.url), 'utf8'));

function context(overrides = {}) {
  return {
    owner_skill: 'sdcorejs-debug',
    task_mode: 'read-only',
    delegation_allowed: true,
    worker_context: false,
    execution_policy: 'auto',
    independence: { status: 'confirmed', evidence: ['src/auth/index.ts', 'src/billing/index.ts'] },
    units: ['auth', 'billing'].map(id => ({
      id, objective: `Investigate ${id}`, readable_paths: [`src/${id}/**`],
      substantial: true, depends_on: [],
      ownership: { allowed_paths: [], exclusive_resources: [], shared_readonly_resources: ['source-checkout'] },
    })),
    ...overrides,
  };
}

test('opportunity scenarios retain the existing semantic owners', async () => {
  const pack = await loadSkillPack(root);
  for (const scenario of cases) {
    assert.equal(dispatchPrompt(pack, scenario.prompt)?.name, scenario.expectedSkill, scenario.id);
  }
  const profiles = await loadEntrypointProfiles(root);
  for (const result of runEntrypointPromptSmoke(pack, profiles, cases)) {
    assert.equal(result.pass, true, `${result.profile}:${result.id} -> ${result.actualSkill}`);
  }
});

test('read-only opportunity assessment is implemented in the existing scheduler', () => {
  assert.equal(typeof protocol.assessReadOnlyOpportunity, 'function');
});

test('positive, negative, ambiguous and pressure scenarios evaluate the secondary route', async () => {
  const pack = await loadSkillPack(root);
  for (const scenario of cases) {
    const input = context(scenario.input);
    if (scenario.unit_count !== undefined) input.units.length = scenario.unit_count;
    const [{ opportunity: actual }] = runParallelOpportunityEval(pack, [{ ...scenario, opportunity_input: input }]);
    assert.equal(actual.decision, scenario.expectedDecision, scenario.id);
    if (actual.decision === 'evaluate-scheduler') {
      assert.equal(actual.write_policy, 'deny');
      assert.equal(actual.contract_source, 'read-only-request');
      assert.equal(actual.dispatch_authorized, false, 'an opportunity never authorizes dispatch');
    }
  }
});

test('opportunity requires observed independence, substantial bounded units and permission', () => {
  const assess = protocol.assessReadOnlyOpportunity;
  assert.equal(typeof assess, 'function');
  assert.equal(assess(context()).decision, 'evaluate-scheduler');
  const mutations = [
    c => { delete c.independence; },
    c => { c.independence.evidence = []; },
    c => { c.independence.status = 'coupled'; },
    c => { c.independence.status = 'unknown'; },
    c => { c.delegation_allowed = undefined; },
    c => { c.delegation_allowed = 'true'; },
    c => { c.worker_context = true; },
    c => { c.execution_policy = 'sequential'; },
    c => { c.execution_policy = 'invalid'; },
    c => { c.task_mode = 'read-write'; },
    c => { c.owner_skill = 'sdcorejs-plan'; },
    c => { c.units[0].substantial = false; },
    c => { delete c.units[0].substantial; },
    c => { c.units[0].readable_paths = []; },
    c => { c.units[0].objective = ''; },
    c => { c.units[0].id = c.units[1].id; },
    c => { c.units[0].depends_on = ['billing']; },
    c => { c.units[0].ownership.allowed_paths = ['src/auth/**']; },
    c => { for (const u of c.units) u.ownership.exclusive_resources = ['test-database']; },
    c => { c.units[0].ownership.exclusive_resources = ['source-checkout']; },
  ];
  for (const mutate of mutations) {
    const input = context();
    mutate(input);
    const before = structuredClone(input);
    const result = assess(input);
    assert.equal(result.decision, 'continue-in-owner', mutate.toString());
    assert.equal(result.dispatch_authorized, false);
    assert.deepEqual(input, before, 'classification is side-effect free');
  }
  assert.equal(assess().decision, 'continue-in-owner');
});

test('source hook removal is observable without pretending lexical tests are live execution', async () => {
  const pack = await loadSkillPack(root);
  for (const name of ['sdcorejs-debug', 'sdcorejs-review', 'sdcorejs-explore']) {
    const skill = pack.sourceSkills.find(s => s.name === name);
    const scenario = cases.find(c => c.expectedSkill === name && c.kind === 'positive');
    const input = [{ ...scenario, opportunity_input: context() }];
    assert.equal(runParallelOpportunityEval(pack, input)[0].opportunity.decision, 'evaluate-scheduler');
    const mutated = structuredClone(pack);
    mutated.sourceSkills.find(s => s.name === name).text = skill.text.replaceAll('assessReadOnlyOpportunity', 'removedOpportunityHook');
    assert.equal(runParallelOpportunityEval(mutated, input)[0].opportunity.decision, 'continue-in-owner');
  }
});

function readOnlyDispatch(units) {
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  return {
    schema_version: 2, contract,
    units: units.map(unit => ({
      ...unit,
      workspace: { strategy: 'shared-readonly', path: '/workspace/fixture' },
      result: { type: 'report' },
      dispatch_envelope: {
        schema_version: 1, source: contract.source, request_hash: contract.request_hash, scope_hash: contract.scope_hash,
        repository_id: 'github.com/example/app', repository_role: 'standalone', module_id: null,
        git_root: '/workspace/fixture', source_revision: 'a'.repeat(40),
        allowed_paths: [], prohibited_paths: [], authority: 'read-only',
        git_mutations: 'deny', approved_artifact_mutation: 'deny',
        required_validations: ['read-only-boundary'],
        output_evidence_contract: { result_type: 'report', required_fields: ['output_digest'] },
      },
      ownership: { ...unit.ownership, prohibited_paths: [] },
    })),
  };
}

const capabilities = { supports_subagents: true, supports_parallel_dispatch: true, supports_agent_cwd: true, effective_max_concurrency: 2 };

test('read-only compiler enforces resource collisions even without the discovery hook', () => {
  const pairs = [
    [{ exclusive_resources: ['db:shared'] }, { exclusive_resources: ['db:shared'] }],
    [{ exclusive_resources: ['db:shared'] }, { shared_readonly_resources: ['db:shared'] }],
    [{ exclusive_resources: ['cache:tmp/shared'] }, { exclusive_resources: ['cache:tmp/shared/child'] }],
    [{ exclusive_resources: ['port:3000'] }, { allocated_ports: [3000] }],
    [{ cache_root: 'tmp/../shared' }, { shared_readonly_resources: ['cache:shared/child'] }],
    [{ temp_root: 'shared' }, { cache_root: 'shared/child' }],
    [{ exclusive_resources: ['port:03000'] }, { allocated_ports: [3000] }],
    [{ temp_root: '.' }, { coverage_root: 'coverage/run' }],
    [{ database_namespace: { unexpected: true } }, {}],
    [{ allocated_ports: [{ toString: '3000' }] }, {}],
    [{ cache_root: ['tmp/cache'] }, {}],
  ];
  for (const pair of pairs) {
    const input = context();
    pair.forEach((ownership, i) => Object.assign(input.units[i].ownership, ownership));
    const compiled = protocol.compileParallelContext({ read_only_context: readOnlyDispatch(input.units), runtime_capabilities: capabilities });
    assert.equal(compiled.opportunity_report.selected_mode, 'delegated-sequential', JSON.stringify(pair));
    assert.ok(compiled.opportunity_report.blockers.some(reason => /resource/.test(reason)));
    assert.equal(protocol.assessReadOnlyOpportunity(input).decision, 'continue-in-owner');
  }
});

test('read-only compilation preserves shared reads, runtime fallback, policy and no-write branch', () => {
  const dispatch = readOnlyDispatch(context().units);
  const compile = (runtime = capabilities, input = dispatch) => protocol.compileParallelContext({ read_only_context: input, runtime_capabilities: runtime });
  assert.equal(compile().opportunity_report.selected_mode, 'parallel');
  assert.equal(compile({}).opportunity_report.selected_mode, 'parent-sequential');
  assert.equal(compile({ ...capabilities, supports_parallel_dispatch: false }).opportunity_report.selected_mode, 'delegated-sequential');
  assert.equal(compile(capabilities, { ...dispatch, execution_policy: 'sequential' }).opportunity_report.selected_mode, 'delegated-sequential');
  const writes = structuredClone(dispatch);
  writes.units[0].ownership.allowed_paths = ['src/**'];
  assert.throws(() => compile(capabilities, writes), /read-only allowed_paths must be empty/);
});
