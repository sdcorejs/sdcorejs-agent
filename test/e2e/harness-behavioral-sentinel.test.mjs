import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import {
  CANONICAL_BEHAVIOR_ENTRYPOINTS,
  VISUAL_INTERACTION_KINDS,
  classifyTask,
  normalizeChoiceResponse,
  resolveAction,
  resolveModelPolicy,
  resolveVisualCompanionPlan,
  selectExecutionMode,
  selectInteraction,
  selectWorkerPolicy,
  shouldOfferVisual,
  validateCapabilityContract,
  validateDisjointOwnership,
  validateProviderNeutralText,
  validateReviewPackage,
  validateTaskBrief,
} from '../../_refs/harness/runtime-policy.mjs';
import {
  assertNoEmbeddedArtifactFields,
  runScenario,
} from './support/harness-behavior-runner.mjs';

const fixtureUrl = new URL('./fixtures/harness-behavior-scenarios.json', import.meta.url);
const capabilityUrl = new URL('../../_refs/harness/capability-contract.json', import.meta.url);
const delegationUrl = new URL('../../_refs/harness/delegation-policy.json', import.meta.url);

async function json(url) { return JSON.parse(await readFile(url, 'utf8')); }

test('capability contract is structurally valid and drives native-or-Markdown interaction', async () => {
  const [contract, delegation, scenarios] = await Promise.all([json(capabilityUrl), json(delegationUrl), json(fixtureUrl)]);
  assert.deepEqual(validateCapabilityContract(contract), []);
  assert.deepEqual(contract.required_actions.sort(), [
    'agent.dispatch', 'agent.interrupt', 'agent.resume', 'artifact.read',
    'artifact.write', 'context.pass', 'progress.create', 'progress.update', 'user.approve',
    'user.choose', 'verification.run', 'visual.present', 'visual.session.publish',
    'visual.session.read', 'visual.session.start', 'visual.session.stop', 'web.fetch',
    'workspace.isolate',
  ]);
  assert.deepEqual(contract.required_capabilities.sort(), [
    'agent_resume_steer', 'artifact_write', 'browser', 'browser_auto_open',
    'live_visual_companion', 'native_structured_choice',
    'per_agent_model_override', 'permission_approval', 'persistent_local_process',
    'runtime_context_channel', 'static_html_artifact', 'subagents', 'visual_event_bridge',
    'visual_surface', 'web_fetch', 'workspace_isolation',
  ]);
  assert.deepEqual(Object.keys(contract.adapters).sort(), ['claude-code', 'codex', 'copilot', 'cursor']);
  for (const adapter of Object.values(contract.adapters)) {
    assert.deepEqual(Object.keys(adapter.actions).sort(), [...contract.required_actions].sort());
    assert.deepEqual(Object.keys(adapter.capabilities).sort(), [...contract.required_capabilities].sort());
  }
  assert.equal(resolveAction({
    contract,
    adapter: 'codex',
    action: 'user.choose',
    runtimeCapabilities: { native_structured_choice: 'supported' },
  }).mode, 'native');
  assert.equal(resolveAction({
    contract,
    adapter: 'codex',
    action: 'user.choose',
    runtimeCapabilities: { native_structured_choice: 'unknown' },
  }).mode, 'fallback');
  const missingMapping = structuredClone(contract);
  delete missingMapping.adapters.codex.actions['user.choose'];
  assert.match(validateCapabilityContract(missingMapping).join('\n'), /user\.choose/);
  const driftedCapability = structuredClone(contract);
  driftedCapability.adapters.cursor.capabilities.browser = 'sometimes';
  assert.match(validateCapabilityContract(driftedCapability).join('\n'), /invalid status/);
  assert.deepEqual(Object.keys(delegation.roles).sort(), [
    'docs_writer', 'explorer', 'implementation_worker', 'reviewer', 'test_writer',
  ]);
  for (const role of Object.values(delegation.roles)) {
    for (const key of [
      'purpose', 'allowed_task_shape', 'prohibited_task_shape',
      'preferred_model_tier', 'reasoning_tier', 'read_write_boundary',
      'expected_evidence', 'escalation_conditions',
    ]) assert.ok(Object.hasOwn(role, key), `delegation role defines ${key}`);
  }
  assert.equal(delegation.fallback.model_override_unsupported, 'inherit-parent');
  assert.equal(delegation.fallback.recursive_delegation, 'forbidden');
  assert.equal(delegation.repair_policy.preferred_owner, 'original-implementer');
  assert.equal(delegation.repair_policy.max_scoped_rounds, 3);
  assert.equal(delegation.fan_in_policy.completion_order_authoritative, false);
  assert.equal(delegation.fan_in_policy.ownership_conflict, 'block');
  assert.equal(delegation.fan_in_policy.parent_rereads_diff_and_evidence, true);
  assert.ok(validateCapabilityContract({ ...contract, provider_tool: 'vendor-only-choice-api' }).length > 0, 'canonical contracts reject provider-tool leakage');
  assert.equal(selectInteraction({ capabilities: scenarios.capabilities.structured, options: ['sequential', 'parallel'] }).kind, 'native-structured-choice');
  // A visual decision runs its own ladder. Native structured choice no longer
  // shadows a visual surface, which is why a spatial question used to arrive as
  // a picker on every runtime that could also draw it.
  assert.equal(selectInteraction({
    capabilities: {
      ...scenarios.capabilities.typed_visual,
      native_structured_choice: 'supported',
    },
    options: ['left', 'right'],
    visual_spatial: true,
  }).kind, 'typed-visual-screen');
  assert.equal(selectInteraction({
    capabilities: scenarios.capabilities.live_visual,
    options: ['left', 'right'],
    visual_spatial: true,
  }).kind, 'live-visual-companion');
  assert.equal(selectInteraction({
    capabilities: scenarios.capabilities.live_visual,
    options: ['left', 'right'],
  }).kind, 'native-structured-choice', 'a non-spatial decision never starts a companion');
  assert.equal(selectInteraction({ capabilities: scenarios.capabilities.typed_visual, options: ['left', 'right'], visual_spatial: true }).kind, 'typed-visual-screen');
  assert.equal(selectInteraction({ capabilities: scenarios.capabilities.static_visual, options: ['left', 'right'], visual_spatial: true }).kind, 'static-visual-composer');
  assert.equal(selectInteraction({
    capabilities: scenarios.capabilities.live_visual,
    options: ['left', 'right'],
    visual_spatial: true,
  }).event_channel, 'live');
  assert.equal(selectInteraction({
    capabilities: scenarios.capabilities.live_visual_no_bridge,
    options: ['left', 'right'],
    visual_spatial: true,
  }).event_channel, 'conversation', 'without an event bridge the reply comes back through the conversation');
  for (const kind of VISUAL_INTERACTION_KINDS) {
    const capabilities = {
      'live-visual-companion': scenarios.capabilities.live_visual,
      'typed-visual-screen': scenarios.capabilities.typed_visual,
      'static-visual-composer': scenarios.capabilities.static_visual,
    }[kind];
    const interaction = selectInteraction({ capabilities, options: ['left', 'right'], visual_spatial: true });
    assert.equal(interaction.kind, kind);
    assert.equal(interaction.supporting_feedback_only, true, `${kind} is supporting feedback only`);
    assert.match(interaction.fallback_markdown, /^1\. .*\n2\. /m);
  }
  // An approval is never routed to a surface whose only output is a click.
  const approval = selectInteraction({
    capabilities: scenarios.capabilities.live_visual,
    options: ['approve', 'change'],
    visual_spatial: true,
    approval: true,
  });
  assert.equal(approval.kind, 'native-structured-choice');
  assert.notEqual(approval.supporting_feedback_only, true);
  assert.equal(selectInteraction({
    capabilities: { ...scenarios.capabilities.live_visual, native_structured_choice: 'unsupported' },
    options: ['approve', 'change'],
    visual_spatial: true,
    approval: true,
  }).kind, 'markdown-numbered-choice');
  for (const capabilities of [scenarios.capabilities.fallback, scenarios.capabilities.unknown]) {
    const interaction = selectInteraction({ capabilities, options: ['sequential', 'parallel'] });
    assert.equal(interaction.kind, 'markdown-numbered-choice');
    assert.match(interaction.markdown, /^1\. .*\n2\. /m);
  }
  const only = selectInteraction({ capabilities: scenarios.capabilities.structured, options: ['sequential'] });
  assert.equal(only.kind, 'auto-select');
  assert.equal(only.selected, 'sequential');
  assert.equal(selectInteraction({
    capabilities: scenarios.capabilities.structured,
    options: [],
  }).kind, 'no-valid-option');
});

test('canonical skills declare semantic actions while adapter manifests own provider mappings', async () => {
  const contract = await json(capabilityUrl);
  const actionSet = new Set(contract.required_actions);
  const skillFiles = await listFiles(new URL('../../skills/', import.meta.url), '.md');
  const refFiles = (
    await Promise.all(
      ['.md', '.mjs', '.js'].map((extension) =>
        listFiles(new URL('../../_refs/', import.meta.url), extension)
      )
    )
  ).flat();
  const providerLeakage = [
    /\b(?:TodoWrite|WebFetch|AskUserQuestion|request_user_input|spawn_agent|followup_task|interrupt_agent|update_plan)\b/,
    /`(?:Glob|Grep)(?:`|\s)/,
    /^(?:Glob|Grep):/m,
    /\b(?:use|using|invoke|via)\s+(?:the\s+)?Agent(?:\s+tool)?\b/,
    /\b(?:via|using|invoke|run|use|uses|no)\s+(?:the\s+)?(?:Write|Edit|Bash)\b/,
  ];

  assert.equal(skillFiles.length, 21);
  for (const file of skillFiles) {
    const text = await readFile(file, 'utf8');
    assert.doesNotMatch(text, /^allowed-tools:/m, `${file} keeps provider tools out of canonical frontmatter`);
    assert.doesNotMatch(text, /\b(?:TodoWrite|WebFetch|AskUserQuestion)\b/, `${file} contains no provider tool name`);
    const declared = text.match(/^required-actions:\s*(.+)$/m)?.[1]
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    assert.ok(declared?.length, `${file} declares required-actions`);
    for (const action of declared) assert.ok(actionSet.has(action), `${file} uses known action ${action}`);
  }
  for (const file of refFiles) {
    const relative = file.pathname.replaceAll('\\', '/');
    if (
      relative.endsWith('/_refs/harness/capability-contract.json') ||
      relative.endsWith('/_refs/harness/adapter-compatibility.md')
    ) continue;
    const text = await readFile(file, 'utf8');
    for (const pattern of providerLeakage) {
      assert.doesNotMatch(text, pattern, `${file} keeps provider tool names out of canonical prose`);
    }
  }

  assert.deepEqual([...CANONICAL_BEHAVIOR_ENTRYPOINTS], [
    '.clinerules',
    '.github/chatmodes/sdcorejs.chatmode.md',
    '.github/copilot-instructions.md',
    'AGENTS.md',
    'CLAUDE.md',
  ]);
  for (const relativePath of CANONICAL_BEHAVIOR_ENTRYPOINTS) {
    const text = await readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
    assert.deepEqual(
      validateProviderNeutralText(text, relativePath),
      [],
      `${relativePath} keeps provider-specific tool names out of canonical entrypoint behavior`
    );
  }
  assert.match(
    validateProviderNeutralText('Use AskUserQuestion to continue.', 'AGENTS.md').join('\n'),
    /AGENTS\.md.*AskUserQuestion/
  );

  const callerActionRequirements = {
    'skills/orchestration/using-skills.md': ['artifact.write', 'context.pass', 'verification.run', 'user.choose'],
    'skills/orchestration/repair-loop.md': ['context.pass', 'user.choose'],
    'skills/shared/workflow/debug.md': ['context.pass', 'user.choose'],
    'skills/shared/workflow/explore.md': ['context.pass', 'user.choose'],
    'skills/shared/workflow/git.md': ['context.pass', 'user.choose'],
    'skills/shared/workflow/review.md': ['artifact.write', 'context.pass', 'user.choose'],
    'skills/shared/workflow/ship.md': ['context.pass', 'user.choose'],
    'skills/shared/workflow/simplify.md': ['context.pass', 'user.choose'],
  };
  for (const [relativePath, requiredActions] of Object.entries(callerActionRequirements)) {
    const text = await readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
    const declared = new Set(
      text.match(/^required-actions:\s*(.+)$/m)?.[1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    );
    for (const action of requiredActions) {
      assert.ok(declared.has(action), `${relativePath} declares ${action} for its operational behavior`);
    }
  }

  const claudeUsingSkills = await readFile(
    new URL('../../.claude/skills/sdcorejs-using-skills/SKILL.md', import.meta.url),
    'utf8'
  );
  const claudeTools = new Set(
    claudeUsingSkills.match(/^allowed-tools:\s*(.+)$/m)?.[1]
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  );
  for (const tool of ['AskUserQuestion', 'Bash', 'Edit', 'Glob', 'Grep', 'Read', 'Write']) {
    assert.ok(claudeTools.has(tool), `Claude using-skills adapter exposes ${tool}`);
  }

  const contractText = await readFile(capabilityUrl, 'utf8');
  const expectedHash = `sha256:${createHash('sha256').update(contractText).digest('hex')}`;
  const manifests = [
    ['claude-code', '.claude/sdcorejs-harness.json'],
    ['claude-code', 'plugin/sdcorejs-harness.json'],
    ['codex', 'codex/sdcorejs-harness.json'],
    ['cursor', '.cursor/sdcorejs-harness.json'],
    ['copilot', '.github/sdcorejs-harness.json'],
  ];
  for (const [adapter, relativePath] of manifests) {
    const manifest = JSON.parse(await readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8'));
    assert.equal(manifest.adapter, adapter);
    assert.equal(manifest.source_path, '_refs/harness/capability-contract.json');
    assert.equal(manifest.source_hash, expectedHash);
    const adapterPayload = {
      schema_version: manifest.schema_version,
      adapter: manifest.adapter,
      capabilities: manifest.capabilities,
      actions: manifest.actions,
      system_registry: manifest.system_registry,
      skills: manifest.skills,
    };
    const expectedContentHash = `sha256:${createHash('sha256')
      .update(JSON.stringify(adapterPayload))
      .digest('hex')}`;
    assert.equal(manifest.content_hash, expectedContentHash);
    assert.notEqual(manifest.content_hash, manifest.source_hash);
    assert.equal(manifest.generated_path, relativePath);
    assert.equal(Object.keys(manifest.skills).length, 21);
  }
});

test('action and workflow classification are deterministic for answer, low-risk fix, and ambiguity', async () => {
  const scenarios = await json(fixtureUrl);
  const policy = { classifyTask, resolveAction, selectInteraction };
  assert.equal(scenarios.sentinel_outcomes.length, 24);
  for (const actionScenario of scenarios.actions) {
    const classification = classifyTask(scenarios.tasks[actionScenario.id]);
    const resolved = resolveAction({ task: scenarios.tasks[actionScenario.id], classification });
    assert.equal(resolved.action, actionScenario.expected);
    const simulated = runScenario(
      policy,
      scenarios.tasks[actionScenario.id],
      scenarios.capabilities.fallback
    );
    assert.equal(simulated.action.action, actionScenario.expected);
    assert.equal(simulated.interaction.kind, 'no-valid-option');
  }
  assert.equal(classifyTask(scenarios.tasks.feature).entry_gate, 'brainstorm-first');
});

test('execution selection only offers parallel choice for multiple feasible independent units', async () => {
  const scenarios = await json(fixtureUrl);
  assert.equal(selectExecutionMode({ units: scenarios.units.one, feasible: true, capabilities: { subagents: 'supported' } }).mode, 'sequential');
  assert.equal(selectExecutionMode({ units: scenarios.units.one, feasible: true, capabilities: { subagents: 'supported' } }).prompt_required, false);
  const parallel = selectExecutionMode({ units: scenarios.units.two, feasible: true, capabilities: { subagents: 'supported' } });
  assert.equal(parallel.mode, 'choice');
  assert.equal(parallel.prompt_required, true);
  assert.equal(selectExecutionMode({ units: scenarios.units.two, feasible: true, capabilities: { subagents: 'unknown' } }).mode, 'sequential');
  assert.equal(selectExecutionMode({ units: scenarios.units.two, feasible: true, capabilities: { subagents: 'unsupported' } }).prompt_required, false);
  assert.deepEqual(validateDisjointOwnership(scenarios.units.two), []);
  assert.ok(validateDisjointOwnership([{ id: 'a', owned_paths: ['src/**'], resources: ['port:3000'] }, { id: 'b', owned_paths: ['src/api/**'], resources: ['port:3000'] }]).length > 0);
});

test('choice normalization rejects ambiguity without selecting an option', () => {
  const ambiguous = normalizeChoiceResponse('1 or 2', ['sequential', 'parallel']);
  assert.equal(ambiguous.status, 'ambiguous');
  assert.equal(ambiguous.selected, null);
  assert.equal(normalizeChoiceResponse('2', ['sequential', 'parallel']).selected, 'parallel');
  assert.equal(normalizeChoiceResponse('you decide', ['sequential', 'parallel'], { recommended: 'sequential' }).selected, 'sequential');
});

test('worker policy reserves fast workers for bounded confirmed docs or tests', async () => {
  const scenarios = await json(fixtureUrl);
  assert.equal(selectWorkerPolicy(scenarios.tasks['docs-fix']).worker, 'fast');
  for (const task of [
    { ...scenarios.tasks['docs-fix'], behavior_confirmed: false },
    { ...scenarios.tasks['docs-fix'], acceptance_criteria_confirmed: false },
    { ...scenarios.tasks['docs-fix'], test_layer_confirmed: false },
    { ...scenarios.tasks['docs-fix'], owned_paths: [] },
    { request: 'Perform security review', category: 'security' },
    { request: 'Design system architecture', category: 'architecture' },
  ]) assert.notEqual(selectWorkerPolicy(task).worker, 'fast');

  assert.equal(resolveModelPolicy({
    model_tier: 'fast',
    capabilities: { per_agent_model_override: 'supported' },
  }).mode, 'adapter-override-eligible');
  for (const status of ['unsupported', 'unknown']) {
    const fallback = resolveModelPolicy({
      model_tier: 'deep',
      capabilities: { per_agent_model_override: status },
    });
    assert.equal(fallback.mode, 'inherit-parent');
    assert.equal(fallback.inherit_parent, true);
  }
});

test('task briefs and review packages reject embedded delivery artifacts and invalid shape', () => {
  const brief = {
    task_id: 'harness-tests-02', objective: 'Fix docs typo', plan_step: 'Phase 1', dependencies: [],
    owned_paths: ['docs/guide.md'], readable_paths: ['docs/**'], do_not_touch: ['package.json'],
    context_refs: ['plan:communication-economy#sha256:plan'],
    acceptance_criteria: ['typo corrected'], verification_commands: ['node --test test/e2e/docs.test.mjs'],
    expected_output: 'review package', model_tier: 'fast', escalation_conditions: ['ambiguous ownership'],
  };
  assert.deepEqual(validateTaskBrief(brief), []);
  assert.match(validateTaskBrief({ ...brief, worker_notes: 'unbounded' }).join('\n'), /unsupported field/);
  const briefErrors = validateTaskBrief({ ...brief, full_spec: {}, full_plan: {}, repository_context: {} });
  assert.equal(assertNoEmbeddedArtifactFields(briefErrors), true);
  assert.match(validateTaskBrief({
    ...brief,
    objective: '# Checkout Specification\n\nspec_context:\n  source: pasted',
  }).join('\n'), /instead of embedding their bodies/);
  const review = { task_id: 'harness-tests-02', changed_paths: ['docs/guide.md'], diff_reference: 'working-tree', verification: [{ command: 'node --test', exit_code: 0 }], evidence: ['targeted test output'], risks: [], unresolved: [] };
  assert.deepEqual(validateReviewPackage(review), []);
  assert.match(validateReviewPackage({ ...review, implementation: {} }).join('\n'), /unsupported field/);
  assert.ok(validateReviewPackage({ ...review, changed_paths: 'docs/guide.md', evidence: {} }).length > 0);
  assert.match(validateReviewPackage({
    ...review,
    evidence: ['diff --git a/docs/guide.md b/docs/guide.md\n@@ -1 +1 @@'],
  }).join('\n'), /instead of embedding it/);
});

test('visual offer is limited to a new visual or spatial decision and is not repeated after decline', () => {
  assert.equal(shouldOfferVisual({ decision: 'Choose a screen layout', visual_spatial: true, previous_response: null }), true);
  assert.equal(shouldOfferVisual({ decision: 'Choose a worker', visual_spatial: false, previous_response: null }), false);
  assert.equal(shouldOfferVisual({ decision: 'Choose a screen layout', visual_spatial: true, previous_response: 'declined' }), false);
  assert.equal(shouldOfferVisual({ decision: 'Choose a different navigation map', visual_spatial: true, previous_response: 'declined', new_visual_decision: true }), true);
});

test('a live companion session requires both capability and explicit local-runtime consent', async () => {
  const scenarios = await json(fixtureUrl);
  const consented = resolveVisualCompanionPlan({
    capabilities: scenarios.capabilities.live_visual,
    consent: { local_runtime_writes: true, browser_open: true },
  });
  assert.equal(consented.mode, 'live');
  assert.equal(consented.event_channel, 'live');
  assert.equal(consented.local_runtime_writes, true);
  assert.equal(consented.auto_open, true);
  assert.equal(consented.supporting_feedback_only, true);

  // Capability alone never authorizes writing local runtime state or opening a
  // browser window on the user's machine.
  const withoutConsent = resolveVisualCompanionPlan({
    capabilities: scenarios.capabilities.live_visual,
    consent: {},
  });
  assert.equal(withoutConsent.mode, 'static');
  assert.equal(withoutConsent.local_runtime_writes, false);
  assert.equal(withoutConsent.auto_open, false);
  assert.match(withoutConsent.reason, /consent/);

  const withoutBrowserConsent = resolveVisualCompanionPlan({
    capabilities: scenarios.capabilities.live_visual,
    consent: { local_runtime_writes: true },
  });
  assert.equal(withoutBrowserConsent.mode, 'live');
  assert.equal(withoutBrowserConsent.auto_open, false);

  const degraded = resolveVisualCompanionPlan({
    capabilities: scenarios.capabilities.live_visual_no_bridge,
    consent: { local_runtime_writes: true, browser_open: true },
  });
  assert.equal(degraded.mode, 'live');
  assert.equal(degraded.event_channel, 'conversation');
  assert.equal(degraded.auto_open, false, 'an unknown auto-open capability never launches a browser');

  const incapable = resolveVisualCompanionPlan({
    capabilities: scenarios.capabilities.static_visual,
    consent: { local_runtime_writes: true, browser_open: true },
  });
  assert.equal(incapable.mode, 'static');
  assert.equal(incapable.local_runtime_writes, false);

  assert.equal(
    resolveVisualCompanionPlan({ capabilities: scenarios.capabilities.fallback, consent: { local_runtime_writes: true } }).mode,
    'markdown'
  );
});

test('every adapter maps the live companion lifecycle to a capability and a portable fallback', async () => {
  const contract = await json(capabilityUrl);
  const lifecycle = {
    'visual.session.start': 'persistent_local_process',
    'visual.session.publish': 'live_visual_companion',
    'visual.session.read': 'visual_event_bridge',
    'visual.session.stop': 'persistent_local_process',
  };
  for (const [adapterName, adapter] of Object.entries(contract.adapters)) {
    for (const [action, capability] of Object.entries(lifecycle)) {
      const mapping = adapter.actions[action];
      assert.ok(mapping, `${adapterName} maps ${action}`);
      assert.equal(mapping.capability, capability, `${adapterName} ${action} gates on ${capability}`);
      assert.ok(mapping.fallback.length > 0, `${adapterName} ${action} keeps a portable fallback`);
      assert.ok(['supported', 'unsupported', 'unknown'].includes(mapping.status));
    }
    // Auto-open stays unknown everywhere: no adapter can prove a browser exists
    // on the host, and guessing would open windows the user never asked for.
    assert.equal(adapter.capabilities.browser_auto_open, 'unknown');
  }
  assert.equal(
    resolveAction({
      contract,
      adapter: 'cursor',
      action: 'visual.session.publish',
      runtimeCapabilities: { live_visual_companion: 'unknown' },
    }).mode,
    'fallback'
  );
  assert.equal(
    resolveAction({
      contract,
      adapter: 'claude-code',
      action: 'visual.session.publish',
      runtimeCapabilities: { live_visual_companion: 'supported' },
    }).mode,
    'native'
  );
});

async function listFiles(directoryUrl, extension) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryUrl = new URL(entry.isDirectory() ? `${entry.name}/` : entry.name, directoryUrl);
    if (entry.isDirectory()) return listFiles(entryUrl, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [entryUrl] : [];
  }));
  return nested.flat();
}
