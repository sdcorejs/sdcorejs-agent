import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const AI_ROOT = join(ROOT, '_refs', 'ai-agent');
const SKILL_PATH = join(ROOT, 'skills', 'tracks', 'ai-agent', 'sdcorejs-ai-agent.md');
const VALIDATOR_PATH = join(AI_ROOT, 'validate-agent-contract.mjs');

const ENGINE_IDS = [
  'openai-responses',
  'openai-agents-sdk',
];

const CAPABILITY_IDS = [
  'reporting-assistant',
  'analytics-assistant',
  'knowledge-assistant',
  'audit-assistant',
  'crm-assistant',
  'workflow-assistant',
  'support-assistant',
  'document-assistant',
  'data-provisioning-assistant',
  'tenant-operations-assistant',
  'approval-coordinator',
  'multi-agent-supervisor',
];

const PROFILE_FIELDS = [
  'profile_id',
  'profile_version',
  'objective',
  'supported_intents',
  'non_goals',
  'posture',
  'allowed_tool_categories',
  'forbidden_tools',
  'required_permissions',
  'evidence',
  'guardrail_delta',
  'approval_delta',
  'session_delta',
  'tracing_audit_delta',
  'token_budget_delta',
  'positive_scenarios',
  'negative_scenarios',
  'adversarial_scenarios',
  'boundary_scenarios',
  'clarification_requirements',
  'deterministic_invariants',
  'quality_thresholds',
];

const GOLDEN_FIXTURES = [
  'fixtures/golden/openai-responses-reporting-assistant.json',
  'fixtures/golden/openai-agents-sdk-reporting-assistant.json',
  'fixtures/golden/openai-agents-sdk-data-provisioning-assistant.json',
  'fixtures/golden/openai-agents-sdk-multi-agent-supervisor.json',
];

test('ai-agent: canonical skill exists exactly once and source count is 24', async () => {
  const skillFiles = await listFiles(join(ROOT, 'skills'), file => file.endsWith('.md'));
  const namedSkills = await Promise.all(skillFiles.map(async file => ({
    file,
    name: (await readFile(file, 'utf8')).match(/^name:\s*(\S+)\s*$/m)?.[1],
  })));
  const aiSkills = namedSkills.filter(item => item.name === 'sdcorejs-ai-agent');

  assert.equal(namedSkills.length, 24);
  assert.equal(aiSkills.length, 1);
  assert.equal(aiSkills[0].file, SKILL_PATH);

  const skill = await readFile(SKILL_PATH, 'utf8');
  assert.match(skill, /^name:\s*sdcorejs-ai-agent$/m);
  assert.match(skill, /^description:\s*(?:"[^"\n]+"|'[^'\n]+'|>-)/m);
  assert.ok(skill.split(/\r?\n/).length <= 350, 'executor stays concise');
  assertExecutorContract(skill);
});

test('ai-agent: manifest exposes exactly two engines and twelve independent capabilities', async () => {
  const manifest = await readJson(join(AI_ROOT, 'manifest.json'));
  const engineIds = manifest.engines.map(item => item.id);
  const capabilityIds = manifest.capability_profiles.map(item => item.id);

  assert.equal(manifest.schema_version, 1);
  assert.deepEqual(engineIds, ENGINE_IDS);
  assert.deepEqual(capabilityIds, CAPABILITY_IDS);
  assert.equal(new Set(engineIds).size, ENGINE_IDS.length);
  assert.equal(new Set(capabilityIds).size, CAPABILITY_IDS.length);
  assert.equal(manifest.profile_axes.engine_profile, 'engines');
  assert.equal(manifest.profile_axes.capability_profile, 'capability_profiles');
  assert.notEqual(manifest.profile_axes.engine_profile, manifest.profile_axes.capability_profile);

  for (const entry of [
    ...manifest.engines,
    ...manifest.capability_profiles,
    ...Object.values(manifest.contracts),
    manifest.common_profile,
    manifest.profile_contract,
    manifest.validator,
  ]) {
    const path = typeof entry === 'string' ? entry : entry.path;
    assert.ok(path, `manifest entry has a path: ${JSON.stringify(entry)}`);
    await readFile(join(ROOT, path), 'utf8');
  }

  const responses = await readFile(join(AI_ROOT, 'engines', 'openai-responses.md'), 'utf8');
  assert.match(responses, /application owns/i);
  assert.match(responses, /streamed or non-streamed/i);
  assert.match(responses, /continuation strategy/i);
  assert.match(responses, /tool choice/i);
  assert.match(responses, /structured-output schema/i);
  assert.match(responses, /approval resume/i);

  const sdk = await readFile(join(AI_ROOT, 'engines', 'openai-agents-sdk.md'), 'utf8');
  for (const marker of ['Agent', 'runner', 'tools', 'session', 'resumable run state', 'approval interruption/resume', 'handoff', 'agent-as-tool', 'Tracing', 'limits']) {
    assert.match(sdk, new RegExp(marker, 'i'), `SDK engine includes ${marker}`);
  }
});

test('ai-agent: profile contract is complete and profile files contain meaningful deltas', async () => {
  const contract = await readJson(join(AI_ROOT, 'profile-contract.json'));
  assert.equal(contract.schema_version, 1);
  assert.deepEqual(contract.required_profile_fields, PROFILE_FIELDS);
  assert.match(contract.security_floor_ref, /profiles\/common\.md$/);
  assert.equal(contract.profile_may_weaken_security_floor, false);

  const texts = [];
  for (const id of CAPABILITY_IDS) {
    const text = await readFile(join(AI_ROOT, 'profiles', `${id}.md`), 'utf8');
    texts.push(text);
    for (const field of PROFILE_FIELDS) {
      assert.match(text, new RegExp(`^${field}:`, 'm'), `${id} defines ${field}`);
    }
    assert.ok(text.length >= 700, `${id} contains meaningful policy deltas`);
    assert.doesNotMatch(text, /runSql|httpRequest|updateRecord|executeCode.*allowed/i);
  }

  assert.equal(new Set(texts).size, CAPABILITY_IDS.length, 'profiles are not copied duplicates');
  assert.match(texts[0], /golden baseline/i);
  assert.match(texts[0], /data_as_of/);
  assert.match(texts[8], /preview[\s\S]*exact-input approval[\s\S]*idempotent apply/i);
  assert.match(texts[11], /permission intersection|intersection of/i);
});

test('ai-agent: shared contracts preserve the security, state, evidence, and governance floor', async () => {
  const files = [
    'agent-contract.md',
    'tool-contract.md',
    'guardrails-and-approvals.md',
    'sessions-and-state.md',
    'evidence-and-reporting.md',
    'tracing-audit-finops.md',
    'evals.md',
    'testing.md',
    'profiles/common.md',
  ];
  const texts = new Map(await Promise.all(files.map(async file => [
    file,
    await readFile(join(AI_ROOT, file), 'utf8'),
  ])));

  assertAgentContractReference(texts.get('agent-contract.md'));
  assertToolContract(texts.get('tool-contract.md'));
  assertApprovalContract(texts.get('guardrails-and-approvals.md'));
  assertStateContract(texts.get('sessions-and-state.md'));
  assertEvidenceContract(texts.get('evidence-and-reporting.md'));
  assertObservabilityContract(texts.get('tracing-audit-finops.md'));
  assertEvalContract(texts.get('evals.md'));
  assertPolicyFloor(texts.get('profiles/common.md'));

  for (const [file, text] of texts) {
    if (text.split(/\r?\n/).length > 100) {
      assert.match(text.slice(0, 2500), /^## Contents$/m, `${file} exposes progressive contents`);
    }
  }
});

test('ai-agent: validator is offline, standard-library-only, structured, and deterministic', async () => {
  const source = await readFile(VALIDATOR_PATH, 'utf8');
  const imports = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(match => match[1]);

  assert.ok(imports.length > 0, 'validator uses explicit standard-library imports');
  assert.ok(imports.every(specifier => specifier.startsWith('node:')), imports.join(', '));
  assert.doesNotMatch(source, /openai|api[_-]?key|process\.env|fetch\s*\(/i);
  assert.match(source, /export function validateAgentContract/);
  assert.match(source, /valid:\s*errors\.length\s*===\s*0/);

  const validator = await import(`${pathToFileURL(VALIDATOR_PATH).href}?contract-test=1`);
  for (const fixture of GOLDEN_FIXTURES) {
    const contract = await readJson(join(AI_ROOT, fixture));
    const result = validator.validateAgentContract(contract);
    assert.deepEqual(result, { valid: true, errors: [] }, fixture);
  }

  const invalidCatalog = await readJson(join(AI_ROOT, 'fixtures', 'invalid', 'agent-contract-invalid-cases.json'));
  assert.ok(invalidCatalog.cases.length >= 27);
  for (const invalidCase of invalidCatalog.cases) {
    const contract = structuredClone(invalidCatalog.base_contract);
    for (const [path, value] of Object.entries(invalidCase.overrides ?? {})) {
      setByPath(contract, path, value);
    }
    const result = validator.validateAgentContract(contract);
    assert.equal(result.valid, false, invalidCase.id);
    assert.ok(result.errors.length > 0, `${invalidCase.id} returns errors`);
    for (const code of invalidCase.expected_codes) {
      assert.ok(result.errors.some(error => error.code === code), `${invalidCase.id} includes ${code}`);
    }
  }
});

function setByPath(target, path, value) {
  const segments = path.split('.');
  const leaf = segments.pop();
  let cursor = target;
  for (const segment of segments) {
    cursor = cursor[segment];
  }
  cursor[leaf] = value;
}

test('ai-agent: workflow and downstream skills consume immutable AI-agent context', async () => {
  const files = new Map(await Promise.all([
    ['brainstorming', 'skills/shared/sdlc/01-brainstorming.md'],
    ['spec', 'skills/shared/sdlc/02-spec.md'],
    ['plan', 'skills/shared/sdlc/03-plan.md'],
    ['execute', 'skills/shared/sdlc/04-execute-plan.md'],
    ['solution', 'skills/orchestration/solution-builder.md'],
    ['test', 'skills/tracks/test/sdcorejs-test.md'],
    ['review', 'skills/shared/workflow/review.md'],
    ['repair', 'skills/orchestration/repair-loop.md'],
    ['debug', 'skills/shared/workflow/debug.md'],
    ['ship', 'skills/shared/workflow/ship.md'],
    ['git', 'skills/shared/workflow/git.md'],
  ].map(async ([id, file]) => [id, await readFile(join(ROOT, file), 'utf8')])));

  assert.match(files.get('brainstorming'), /ai-agent/);
  assert.match(files.get('spec'), /_refs\/sdlc\/ai-agent\.md/);
  assert.match(files.get('plan'), /agent_architecture:/);
  assert.match(files.get('execute'), /track:\s*ai-agent|`ai-agent`/);
  assert.match(files.get('execute'), /sdcorejs-ai-agent/);
  assert.match(files.get('solution'), /AI-agent role|AI agent role/i);

  for (const id of ['test', 'review', 'repair', 'debug', 'ship', 'git']) {
    assert.match(files.get(id), /ai_agent_context/, `${id} consumes AI context`);
  }
  assert.match(files.get('repair'), /sdcorejs-(?:spec|plan)/);
  assert.match(files.get('git'), /raw traces|serialized run state/i);

  const mutatedExecute = files.get('execute').replace(/sdcorejs-ai-agent/g, 'removed-ai-executor');
  assert.throws(() => assertExecutePlanDispatch(mutatedExecute), /AI-agent dispatch/);
  assertExecutePlanDispatch(files.get('execute'));
});

test('ai-agent: mutation guards fail when security and execution invariants are removed', async () => {
  const skill = await readFile(SKILL_PATH, 'utf8');
  const common = await readFile(join(AI_ROOT, 'profiles', 'common.md'), 'utf8');
  const approvals = await readFile(join(AI_ROOT, 'guardrails-and-approvals.md'), 'utf8');
  const state = await readFile(join(AI_ROOT, 'sessions-and-state.md'), 'utf8');
  const evals = await readFile(join(AI_ROOT, 'evals.md'), 'utf8');
  const tracing = await readFile(join(AI_ROOT, 'tracing-audit-finops.md'), 'utf8');

  assertMutationFails(skill, /tenantId/, assertExecutorContract, /trusted tenant context/);
  assertMutationFails(skill, /ai_agent_context/, assertExecutorContract, /AI runtime evidence/);
  assertMutationFails(common, /generic raw tools are forbidden/i, assertPolicyFloor, /generic raw tools/);
  assertMutationFails(common, /max_turns/, assertPolicyFloor, /bounded turns/);
  assertMutationFails(approvals, /exact_input_binding/, assertApprovalContract, /exact input approval/);
  assertMutationFails(state, /store_provider_state:\s*false/, assertStateContract, /provider storage default/);
  assertMutationFails(state, /cross-tenant session reuse is forbidden/i, assertStateContract, /cross-tenant session/);
  assertMutationFails(evals, /deterministic_gate_required/, assertEvalContract, /deterministic eval gate/);
  assertMutationFails(tracing, /raw_prompt_logging:\s*false/, assertObservabilityContract, /raw prompt logging/);
});

test('ai-agent: package boundary remains dependency-free and repository suite includes the contract test', async () => {
  const pkg = await readJson(join(ROOT, 'package.json'));
  assert.equal(pkg.version, '0.5.1');
  assert.equal(pkg.packageManager, 'npm@10.9.2');
  assert.match(pkg.scripts['test:e2e:repository'], /test\/e2e\/ai-agent-track-contract\.test\.mjs/);
  assert.equal(pkg.dependencies?.openai, undefined);
  assert.equal(pkg.devDependencies?.openai, undefined);
  assert.equal(pkg.dependencies?.['@openai/agents'], undefined);
  assert.equal(pkg.devDependencies?.['@openai/agents'], undefined);
});

function assertExecutorContract(source) {
  assert.match(source, /approved plan/i, 'executor requires an approved plan');
  assert.match(source, /approved_spec_hash/, 'executor verifies the spec hash');
  assert.match(source, /approved_plan_hash/, 'executor verifies the plan hash');
  assert.match(source, /resolve.*engine_profile.*capability_profile.*exactly once/is, 'profiles resolve exactly once');
  assert.match(source, /tenantId/, 'executor requires trusted tenant context');
  assert.match(source, /ai_agent_context/, 'executor emits AI runtime evidence');
  for (const field of [
    'runtime_owner',
    'authorization_and_tenant_policy',
    'approval_bindings',
    'session_controls',
    'evidence_policy',
    'observability_and_audit_policy',
    'usage_and_finops_policy',
    'limits',
  ]) {
    assert.match(source, new RegExp(field), `executor evidence includes ${field}`);
  }
  assert.match(source, /never invoke Git|must not invoke Git/i, 'executor does not invoke Git');
}

function assertAgentContractReference(source) {
  for (const field of [
    'schema_version',
    'contract_id',
    'contract_version',
    'status',
    'input',
    'output',
    'model_policy',
    'trusted_context',
    'store_provider_state',
    'provider_conversation_enabled',
    'guardrails',
    'approvals',
    'session',
    'evidence',
    'observability',
    'governance',
    'limits',
    'reliability',
    'evals',
    'change_control',
  ]) {
    assert.match(source, new RegExp(field), `agent contract includes ${field}`);
  }
}

function assertToolContract(source) {
  for (const field of [
    'side_effect',
    'risk',
    'purpose',
    'input_schema',
    'output_schema',
    'required_permissions',
    'tenant_scope_binding',
    'server_authorization',
    'approval',
    'preview',
    'idempotency',
    'resource_version',
    'audit_category',
    'redaction',
    'deterministic_error',
    'evidence',
    'timeout_ms',
    'retry',
    'fixture_ids',
  ]) {
    assert.match(source, new RegExp(field), `tool contract includes ${field}`);
  }
  assert.match(source, /runSql/);
  assert.match(source, /httpRequest/);
  assert.match(source, /updateRecord/);
  assert.match(source, /executeCode/);
}

function assertApprovalContract(source) {
  assert.match(source, /exact_input_binding/, 'exact input approval uses exact input binding');
  assert.match(source, /preview_hash/);
  assert.match(source, /resource_version/);
  assert.match(source, /approval_expiry/);
  assert.match(source, /self_approval_allowed:\s*false/);
  assert.match(source, /server-side authorization/i);
}

function assertStateContract(source) {
  assert.match(source, /store_provider_state:\s*false/, 'provider storage default is false');
  assert.match(source, /provider_conversation_enabled:\s*false/);
  assert.match(source, /application session/i);
  assert.match(source, /conversation history/i);
  assert.match(source, /resumable run state/i);
  assert.match(source, /approval checkpoint/i);
  assert.match(source, /cross-tenant session reuse is forbidden/i, 'cross-tenant session reuse is forbidden');
  assert.match(source, /optimistic concurrency/i);
}

function assertEvidenceContract(source) {
  assert.match(source, /data_as_of/);
  assert.match(source, /metric-definition version/i);
  assert.match(source, /partial-data/i);
  assert.match(source, /stale-data/i);
  assert.match(source, /invented evidence is forbidden/i);
  assert.match(source, /semantic layer/i);
}

function assertObservabilityContract(source) {
  assert.match(source, /Tracing/);
  assert.match(source, /Audit/);
  assert.match(source, /Usage and FinOps/);
  assert.match(source, /metadata_only_logging:\s*true/);
  assert.match(source, /raw_prompt_logging:\s*false/, 'raw prompt logging remains disabled');
  assert.match(source, /chain_of_thought_logging:\s*false/);
  assert.match(source, /versioned external pricing policy/i);
}

function assertEvalContract(source) {
  assert.match(source, /deterministic_gate_required/, 'deterministic eval gate exists');
  assert.match(source, /zero unauthorized actions/i);
  assert.match(source, /zero cross-tenant disclosures/i);
  assert.match(source, /zero unapproved side effects/i);
  assert.match(source, /zero secret leakage/i);
  assert.match(source, /offline/i);
  assert.match(source, /API key/i);
}

function assertPolicyFloor(source) {
  assert.match(source, /generic raw tools are forbidden/i, 'generic raw tools stay forbidden');
  assert.match(source, /model.*(?:must not|cannot).*tenantId/is);
  assert.match(source, /store_provider_state:\s*false/);
  assert.match(source, /metadata_only_logging:\s*true/);
  assert.match(source, /max_turns/, 'bounded turns remain required');
  assert.match(source, /max_tool_calls/);
  assert.match(source, /max_handoff_depth/);
  assert.match(source, /self_approval_allowed:\s*false/);
}

function assertExecutePlanDispatch(source) {
  assert.match(source, /sdcorejs-ai-agent/, 'execute-plan preserves AI-agent dispatch');
  assert.match(source, /agent_architecture/, 'execute-plan requires the architecture block');
}

function assertMutationFails(source, pattern, assertion, expectedError) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const mutated = source.replace(new RegExp(pattern.source, flags), 'removed_invariant');
  assert.notEqual(mutated, source, `mutation applies: ${pattern}`);
  assert.throws(() => assertion(mutated), expectedError);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function listFiles(root, predicate) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return listFiles(path, predicate);
    return entry.isFile() && predicate(path) ? [path] : [];
  }));
  return nested.flat().sort((a, b) => relative(ROOT, a).localeCompare(relative(ROOT, b)));
}
