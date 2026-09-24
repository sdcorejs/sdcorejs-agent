import { createHash } from 'node:crypto';
import { verifyApprovedArtifactGraph } from '../shared/approved-artifact.mjs';
import { observeChoiceTools } from './runtime-attestation.mjs';

const ACTIONS = [
  'progress.create',
  'progress.update',
  'context.pass',
  'user.choose',
  'user.approve',
  'agent.dispatch',
  'agent.resume',
  'agent.interrupt',
  'visual.present',
  'visual.session.start',
  'visual.session.publish',
  'visual.session.read',
  'visual.session.stop',
  'workspace.isolate',
  'web.fetch',
  'artifact.read',
  'artifact.write',
  'verification.run',
];

const CAPABILITIES = [
  'runtime_context_channel',
  'native_structured_choice',
  'visual_surface',
  'static_html_artifact',
  'live_visual_companion',
  'visual_event_bridge',
  'persistent_local_process',
  'browser_auto_open',
  'subagents',
  'concurrent_dispatch',
  'agent_cwd_binding',
  'native_worktree',
  'manual_git_worktree',
  'cancellation',
  'result_ref',
  'per_agent_model_override',
  'agent_resume_steer',
  'workspace_isolation',
  'browser',
  'web_fetch',
  'artifact_write',
  'permission_approval',
];

const STATUSES = new Set(['supported', 'unsupported', 'unknown']);
const ADAPTERS = new Set(['codex', 'claude-code', 'cursor', 'copilot']);
const MODEL_TIERS = new Set(['fast', 'balanced', 'deep']);
const TASK_BRIEF_FIELDS = [
  'task_id',
  'objective',
  'plan_step',
  'dependencies',
  'owned_paths',
  'readable_paths',
  'do_not_touch',
  'context_refs',
  'acceptance_criteria',
  'verification_commands',
  'expected_output',
  'model_tier',
  'escalation_conditions',
];
const REVIEW_PACKAGE_FIELDS = [
  'task_id',
  'changed_paths',
  'diff_reference',
  'verification',
  'evidence',
  'risks',
  'unresolved',
];
const EMBEDDED_ARTIFACT_KEYS = new Map([
  ['full_spec', 'full spec'],
  ['spec_body', 'full spec'],
  ['full_plan', 'full plan'],
  ['plan_body', 'full plan'],
  ['repository_context', 'repository context'],
  ['full_repository_context', 'repository context'],
]);

export const CANONICAL_BEHAVIOR_ENTRYPOINTS = Object.freeze([
  '.clinerules',
  '.github/chatmodes/sdcorejs.chatmode.md',
  '.github/copilot-instructions.md',
  'AGENTS.md',
  'CLAUDE.md',
]);

const PROVIDER_TOOL_PATTERNS = [
  /\bTodoWrite\b/,
  /\bAskUserQuestion\b/,
  /\bWebFetch\b/,
  /\brequest_user_input\b/,
  /\bspawn_agent\b/,
  /\bfollowup_task\b/,
  /\binterrupt_agent\b/,
  /\bupdate_plan\b/,
  /`(?:Glob|Grep)(?:`|\s)/,
  /^(?:Glob|Grep):/m,
  /\b(?:use|using|invoke|via)\s+(?:the\s+)?Agent(?:\s+tool)?\b/,
  /\b(?:via|using|invoke|run|use|uses|no)\s+(?:the\s+)?(?:Write|Edit|Bash)\b/,
];

export function validateProviderNeutralText(text, source = '<text>') {
  const input = String(text ?? '');
  const errors = [];
  for (const pattern of PROVIDER_TOOL_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      errors.push(
        `${source}: provider-specific tool name '${match[0].trim()}' is only allowed in adapter mappings or compatibility documentation`
      );
    }
  }
  return errors;
}

export function validateCapabilityContract(contract) {
  const errors = [];
  if (!isPlainObject(contract)) return ['capability contract must be an object'];

  const allowedTopLevel = new Set([
    'schema_version',
    'statuses',
    'required_actions',
    'required_capabilities',
    'adapters',
  ]);
  for (const key of Object.keys(contract)) {
    if (!allowedTopLevel.has(key)) errors.push(`unsupported capability contract field: ${key}`);
  }

  if (contract.schema_version !== 1) errors.push('schema_version must be 1');
  compareExactSet(contract.statuses, [...STATUSES], 'statuses', errors);
  compareExactSet(contract.required_actions, ACTIONS, 'required_actions', errors);
  compareExactSet(contract.required_capabilities, CAPABILITIES, 'required_capabilities', errors);

  if (!isPlainObject(contract.adapters)) {
    errors.push('adapters must be an object');
    return errors;
  }
  compareExactSet(Object.keys(contract.adapters), [...ADAPTERS], 'adapters', errors);

  for (const adapterName of ADAPTERS) {
    const adapter = contract.adapters[adapterName];
    if (!isPlainObject(adapter)) {
      errors.push(`adapter ${adapterName} must be an object`);
      continue;
    }
    for (const key of Object.keys(adapter)) {
      if (!['actions', 'capabilities'].includes(key)) {
        errors.push(`adapter ${adapterName} has unsupported field: ${key}`);
      }
    }
    if (!isPlainObject(adapter.capabilities)) {
      errors.push(`adapter ${adapterName} capabilities must be an object`);
    } else {
      compareExactSet(
        Object.keys(adapter.capabilities),
        CAPABILITIES,
        `adapter ${adapterName} capabilities`,
        errors
      );
      for (const [capability, status] of Object.entries(adapter.capabilities)) {
        if (!STATUSES.has(status)) {
          errors.push(`adapter ${adapterName} capability ${capability} has invalid status`);
        }
      }
    }

    if (!isPlainObject(adapter.actions)) {
      errors.push(`adapter ${adapterName} actions must be an object`);
      continue;
    }
    compareExactSet(
      Object.keys(adapter.actions),
      ACTIONS,
      `adapter ${adapterName} actions`,
      errors
    );
    for (const action of ACTIONS) {
      const mapping = adapter.actions[action];
      if (!isPlainObject(mapping)) {
        errors.push(`adapter ${adapterName} action ${action} must be an object`);
        continue;
      }
      const mappingKeys = new Set(['status', 'native', 'capability', 'fallback']);
      for (const key of Object.keys(mapping)) {
        if (!mappingKeys.has(key)) {
          errors.push(`adapter ${adapterName} action ${action} has unsupported field: ${key}`);
        }
      }
      if (!STATUSES.has(mapping.status)) {
        errors.push(`adapter ${adapterName} action ${action} has invalid status`);
      }
      if (!Array.isArray(mapping.native) || mapping.native.some((item) => !isNonEmptyString(item))) {
        errors.push(`adapter ${adapterName} action ${action} native must be a string array`);
      }
      if (mapping.capability !== null && !CAPABILITIES.includes(mapping.capability)) {
        errors.push(`adapter ${adapterName} action ${action} references an unknown capability`);
      }
      if (!isNonEmptyString(mapping.fallback)) {
        errors.push(`adapter ${adapterName} action ${action} requires a portable fallback`);
      }
    }
  }

  return errors;
}

export function classifyTask(task = {}) {
  const request = String(task.request ?? task.objective ?? '').trim();
  const normalized = request.toLowerCase();
  const ownedPaths = Array.isArray(task.owned_paths) ? task.owned_paths : [];
  const explicitWriteIntent = /\b(fix|change|edit|write|add|create|implement|remove|rename|update)\b/.test(normalized);
  const questionIntent =
    task.kind === 'question' ||
    (!explicitWriteIntent && /^(?:what|why|how|when|where|which|who|explain|describe|summarize)\b/.test(normalized));

  if (questionIntent && ownedPaths.length === 0 && task.writes !== true) {
    return {
      kind: 'pure-q-and-a',
      action: 'direct-answer',
      entry_gate: 'none',
      reason: 'request asks for an answer and does not authorize a write',
    };
  }

  const category = inferTaskCategory(task);
  const highRisk =
    task.high_risk === true ||
    ['security', 'architecture', 'public-contract', 'concurrency'].includes(category);
  const fullWorkflow =
    task.ambiguous === true ||
    task.architectural === true ||
    task.cross_cutting === true ||
    highRisk ||
    (!task.behavior_confirmed && ownedPaths.length === 0);

  if (!fullWorkflow && isFastFixEligible(task, category)) {
    return {
      kind: 'small-explicit-low-risk-fix',
      action: 'fast-fix',
      entry_gate: 'targeted-context',
      reason: 'scope, behavior, acceptance, ownership, and verification layer are bounded',
    };
  }

  return {
    kind: 'governed-change',
    action: 'full-workflow',
    entry_gate: 'brainstorm-first',
    reason: highRisk
      ? 'security, architecture, concurrency, or public-contract work needs the full workflow'
      : 'scope or behavior is not bounded enough for fast-fix',
  };
}

export function resolveAction({
  task,
  classification,
  contract,
  adapter,
  action,
  runtimeCapabilities = {},
  runtimeActions = {},
  runtime,
} = {}) {
  if (classification || task) {
    const resolvedClassification = classification ?? classifyTask(task);
    return {
      action: resolvedClassification.action,
      entry_gate: resolvedClassification.entry_gate,
      reason: resolvedClassification.reason,
    };
  }

  const validation = validateCapabilityContract(contract);
  if (validation.length > 0) {
    return { mode: 'blocked', action, reason: validation.join('; ') };
  }
  const mapping = contract.adapters?.[adapter]?.actions?.[action];
  if (!mapping) return { mode: 'blocked', action, reason: 'adapter action mapping is missing' };

  if (action === 'user.choose' || action === 'user.approve') {
    const observed = observeChoiceTools(runtime, action);
    return observed.status === 'supported'
      ? { mode: 'native', action, native: observed.tools, fallback: mapping.fallback }
      : { mode: 'fallback', action, native: [], fallback: mapping.fallback, reason: observed.reason };
  }

  const runtimeCapabilityDeclared =
    mapping.capability && Object.hasOwn(runtimeCapabilities, mapping.capability);
  const capabilityStatus = mapping.capability
    ? normalizeCapabilityStatus(runtimeCapabilities[mapping.capability] ?? contract.adapters[adapter].capabilities[mapping.capability])
    : null;
  const actionStatus = normalizeCapabilityStatus(runtimeActions[action] ?? mapping.status);
  const nativeSupported =
    actionStatus !== 'unsupported' &&
    (!mapping.capability || capabilityStatus === 'supported') &&
    (actionStatus === 'supported' || runtimeCapabilityDeclared) &&
    mapping.native.length > 0;

  return nativeSupported
    ? { mode: 'native', action, native: [...mapping.native], fallback: mapping.fallback }
    : {
        mode: 'fallback',
        action,
        native: [],
        fallback: mapping.fallback,
        reason: actionStatus === 'unsupported' || capabilityStatus === 'unsupported'
          ? 'capability unsupported'
          : 'capability unknown',
      };
}

export function selectExecutionMode({
  units = [],
  feasible = false,
  capabilities = {},
  execution_policy: executionPolicy,
} = {}) {
  if (
    executionPolicy !== undefined &&
    !['auto', 'sequential', 'parallel-preferred'].includes(executionPolicy)
  ) throw new TypeError('execution_policy must be auto, sequential, or parallel-preferred');
  const subagents = normalizeCapabilityStatus(capabilities.subagents ?? 'unknown');
  if (units.length <= 1) {
    return {
      mode: 'sequential',
      executor: subagents === 'supported' ? 'fresh-workers' : 'parent',
      prompt_required: false,
      reason: units.length === 0 ? 'no executable unit' : 'single executable unit',
    };
  }

  const ownershipErrors = validateDisjointOwnership(units);
  if (subagents !== 'supported') {
    return {
      mode: 'sequential',
      executor: 'parent',
      prompt_required: false,
      reason: `subagent capability is ${subagents}`,
    };
  }
  const concurrentDispatch = normalizeCapabilityStatus(
    capabilities.concurrent_dispatch ?? 'unknown',
  );
  if (!feasible || ownershipErrors.length > 0 || concurrentDispatch !== 'supported') {
    return {
      mode: 'sequential',
      executor: 'fresh-workers',
      prompt_required: false,
      reason: !feasible
        ? 'parallel execution is not feasible'
        : ownershipErrors.length > 0
          ? ownershipErrors.join('; ')
          : `concurrent dispatch capability is ${concurrentDispatch}`,
    };
  }
  if (executionPolicy === 'sequential') {
    return {
      mode: 'sequential',
      executor: 'fresh-workers',
      prompt_required: false,
      reason: 'approved execution policy requires sequential fresh workers',
    };
  }
  if (executionPolicy === 'parallel-preferred' || executionPolicy === 'auto') {
    return {
      mode: 'parallel',
      executor: 'fresh-workers',
      prompt_required: false,
      reason: `approved execution policy ${executionPolicy} selected safe parallel execution`,
    };
  }

  return {
    mode: 'choice',
    executor: 'fresh-workers',
    prompt_required: true,
    reason: 'multiple independent units have disjoint path and resource ownership',
    options: ['sequential', 'parallel'],
  };
}

/** Visual surface kinds, best first. Every one of them is supporting feedback. */
export const VISUAL_INTERACTION_KINDS = Object.freeze([
  'live-visual-companion',
  'typed-visual-screen',
  'static-visual-composer',
]);

/**
 * Select the surface for one decision.
 *
 * Actual exposed choice tools own decisions. Visuals can still provide
 * supporting spatial feedback, but static capability metadata cannot select
 * a native decision tool or substitute for explicit written approval.
 *
 * An approval never reaches a visual surface. A browser click is design
 * feedback; routing an approval through it would let a click stand in for a
 * spec, plan, dependency, permission, or destructive-action gate.
 */
export function selectInteraction({
  capabilities = {},
  options = [],
  visual_spatial = false,
  approval = false,
  consent = {},
  failed_surfaces = [],
  runtime,
  decision_id = null,
} = {}) {
  const labels = options.map((item) => typeof item === 'string' ? item : item.label);
  const markdown = numberedMarkdown(labels);
  const base = { options: labels, markdown, fallback_markdown: markdown, decision_id };
  if (approval && labels.length !== 3) return { ...base, kind: 'invalid-approval-options', reason: 'approval requires all three Approve/Request changes/Cancel options' };

  if (labels.length === 0) {
    return {
      kind: 'no-valid-option',
      reason: 'no valid option is available',
      markdown: '',
      fallback_markdown: '',
    };
  }
  const explicitWrite = options.some(option => ['apply', 'apply-current-diff'].includes(typeof option === 'string' ? option.toLowerCase() : option?.value));
  if (labels.length === 1 && !approval && !explicitWrite) {
    return {
      kind: 'auto-select',
      selected: labels[0],
      reason: 'only one valid option',
      markdown,
      fallback_markdown: markdown,
    };
  }

  const observed = observeChoiceTools(runtime, approval ? 'user.approve' : 'user.choose');
  if (observed.status === 'supported' && !failed_surfaces.includes('native-structured-choice')) {
    return {
      ...base,
      kind: 'native-structured-choice',
      tools: observed.tools,
      reason: approval && visual_spatial
        ? 'an approval stays on a non-visual surface'
        : 'native structured choice is available',
    };
  }
  if (visual_spatial && !approval && !failed_surfaces.includes('native-structured-choice')) {
    const surface = resolveVisualCompanionPlan({ capabilities, consent, failed_surfaces });
    return { ...base, ...surface, kind: VISUAL_MODE_KINDS[surface.mode] };
  }
  return {
    ...base,
    kind: 'markdown-numbered-choice',
    reason: 'no richer supported surface is available',
  };
}

/**
 * Resolve how a Visual Companion session may run.
 *
 * A live session writes local runtime state and can launch a browser on the
 * user's machine. Neither is implied by "the user wants a visual decision", so
 * both are gated on an explicit consent flag as well as the capability.
 */
export function resolveVisualCompanionPlan({
  capabilities = {},
  consent = {},
  failed_surfaces = [],
} = {}) {
  const status = (name) => normalizeCapabilityStatus(capabilities[name]);
  const available = (mode) => !failed_surfaces.includes(VISUAL_MODE_KINDS[mode]);
  const liveCapable =
    status('live_visual_companion') === 'supported' &&
    status('persistent_local_process') === 'supported' && available('live');
  const mode = liveCapable && consent.local_runtime_writes === true ? 'live'
    : status('visual_surface') === 'supported' && available('native') ? 'native'
      : status('static_html_artifact') === 'supported' && available('static') ? 'static' : 'markdown';
  return {
    mode,
    event_channel: mode === 'live' && status('visual_event_bridge') === 'supported' ? 'live' : 'conversation',
    auto_open: mode === 'live' && status('browser_auto_open') === 'supported' && consent.browser_open === true,
    local_runtime_writes: mode === 'live',
    supporting_feedback_only: true,
    consent_required: mode === 'markdown' && liveCapable && consent.local_runtime_writes === undefined
      ? ['local_runtime_writes'] : [],
    reason: mode === 'live' ? 'supported live runtime with explicit scoped consent'
      : mode === 'markdown' ? 'no currently usable visual surface; continue in conversation'
        : `supported ${mode} visual surface without a local runtime session`,
  };
}

const VISUAL_MODE_KINDS = Object.freeze({ live: 'live-visual-companion', native: 'typed-visual-screen',
  static: 'static-visual-composer', markdown: 'markdown-numbered-choice' });

export function normalizeChoiceResponse(response, options = [], { recommended, approval = false } = {}) {
  const raw = String(response ?? '').trim();
  const normalized = raw.normalize('NFC').toLowerCase();
  const labels = options.map((item) => typeof item === 'string' ? item : item?.label);
  const delegated = /^(?:you decide|decide for me|use (?:the )?recommend(?:ed|ation)|choose (?:the )?default)$/i.test(raw);

  const recommendedOption = options[labels.indexOf(recommended)];
  const recommendedValue = typeof recommendedOption === 'string' ? recommendedOption.toLowerCase() : recommendedOption?.value;
  if (delegated && !approval && labels.includes(recommended) && !['apply','apply-current-diff'].includes(recommendedValue)) {
    return { status: 'selected', selected: recommended, source: 'recommended' };
  }

  const selectors = [...normalized.matchAll(/\b(\d+)\b/g)]
    .map((match) => Number(match[1]))
    .filter((value) => value >= 1 && value <= labels.length);
  if (/^\d+[.)]?$/u.test(normalized) && new Set(selectors).size === 1) {
    return { status: 'selected', selected: labels[selectors[0] - 1], source: 'numeric' };
  }
  if (new Set(selectors).size > 1) {
    return { status: 'ambiguous', selected: null, source: 'multiple-selectors' };
  }

  const exact = labels.filter((label, index) => typeof label === 'string' &&
    [label, ...(typeof options[index] === 'object' && Array.isArray(options[index]?.aliases) ? options[index].aliases : [])]
      .some(value => typeof value === 'string' && value.trim().normalize('NFC').toLowerCase() === normalized));
  if (exact.length === 1) {
    return { status: 'selected', selected: exact[0], source: 'label' };
  }
  return { status: 'ambiguous', selected: null, source: 'unrecognized' };
}

function stableDecisionValue(value) {
  if (Array.isArray(value)) return value.map(stableDecisionValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableDecisionValue(value[key])]));
  return value;
}

/** Bind the presented localized labels/aliases as well as semantic option values. */
export function decisionFingerprint(decision) {
  const nonempty = value => typeof value === 'string' && value.trim() !== '';
  if (decision?.schema_version !== 1 || !['id', 'gate', 'purpose', 'change_ref', 'owner_repository_id', 'scope_fingerprint'].every(key => nonempty(decision[key])) ||
      !/^sha256:[a-f0-9]{64}$/u.test(decision.scope_fingerprint) ||
      !(decision.artifact_id === null || nonempty(decision.artifact_id)) || !(decision.revision === null || nonempty(decision.revision)) ||
      (decision.artifact_id !== null && !nonempty(decision.revision)) || typeof decision.approval !== 'boolean' ||
      !Array.isArray(decision.options) || !decision.options.length ||
      decision.options.some((option, index) => !nonempty(option.id) || !nonempty(option.value) || !nonempty(option.label) || option.selector !== index + 1 || !Array.isArray(option.aliases) || option.aliases.some(alias => !nonempty(alias))) ||
      new Set(decision.options.map(option => option.id)).size !== decision.options.length) throw new TypeError('invalid scoped decision identity/options');
  if (decision.approval && (decision.options.some(option => option.id !== option.value) || JSON.stringify(decision.options.map(option => option.id)) !== JSON.stringify(['approve', 'change', 'cancel']))) throw new TypeError('approval requires Approve/Change/Cancel options');
  const identity = Object.fromEntries(['schema_version','id','gate','purpose','change_ref','owner_repository_id','artifact_id','revision','scope_fingerprint','approval'].map(key => [key, decision[key]]));
  identity.options = decision.options.map(({ id, selector, value, label, aliases }) => ({ id, selector, value, label, aliases }));
  return 'sha256:' + createHash('sha256').update(JSON.stringify(stableDecisionValue(identity))).digest('hex');
}

/** Resolve against host-read user events or a loaded, verified plan, never provenance labels. */
export function resolveDecision(context, runtime = {}) {
  if (context?.schema_version !== 1) return { status: 'blocked', reason: 'unsupported interaction_context schema' };
  const decision = context?.decision;
  let fingerprint;
  try { fingerprint = decisionFingerprint(decision); } catch (error) { return { status: 'blocked', reason: error.message }; }
  const pending = context.pending_decisions ?? [decision];
  const candidates = [...(context.resolutions ?? [])].filter(record => record.decision_fingerprint === fingerprint);
  if (context.reply_ref) candidates.unshift({ response_ref: context.reply_ref, decision_fingerprint: fingerprint });
  for (const candidate of candidates) {
    if (!candidate.response_ref || typeof runtime.read_response !== 'function') continue;
    const event = runtime.read_response(candidate.response_ref);
    if (!event || event.id !== candidate.response_ref || event.decision_fingerprint !== fingerprint) continue;
    if (event.question_id ? event.question_id !== decision.id : pending.length !== 1 || pending[0].id !== decision.id) {
      return { status: 'ambiguous', reason: 'reply is not bound to exactly one pending gate' };
    }
    const parsed = normalizeChoiceResponse(event.text, decision.options, { approval: decision.approval });
    if (parsed.status !== 'selected') return { status: 'ambiguous', reason: parsed.source };
    const selected = decision.options.find(option => option.label === parsed.selected);
    if (!selected) return { status: 'blocked', reason: 'option mapping changed' };
    return { status: 'resolved', value: selected.value, option_id: selected.id, resolution: { schema_version: 1, decision_fingerprint: fingerprint, response_ref: event.id, option_id: selected.id, value: selected.value, source: 'explicit-user' } };
  }
  if (!decision.approval && typeof runtime.load_plan === 'function') {
    try {
      const loaded = runtime.load_plan();
      verifyApprovedArtifactGraph(loaded.artifact, loaded.parents);
      const metadata = loaded.artifact.metadata;
      if (metadata.artifact_kind !== 'plan' || metadata.owner_repository_id !== decision.owner_repository_id || metadata.change_ref !== decision.change_ref || metadata.source_revision !== runtime.current_revision) throw new Error('approved policy owner/change/revision mismatch');
      const block = loaded.artifact.body.match(/```interaction-policy\r?\n([\s\S]*?)\r?\n```/u);
      const policies = block ? JSON.parse(block[1]) : [];
      const matches = policies.filter(policy => policy.decision_fingerprint === fingerprint);
      const selected = decision.options.find(option => option.id === matches[0]?.option_id);
      if (matches.length === 1 && selected && !['apply', 'apply-current-diff'].includes(selected.value)) return { status: 'resolved', value: selected.value, option_id: selected.id, resolution: { schema_version: 1, decision_fingerprint: fingerprint, plan_ref: metadata.repository_relative_path, approval_hash: metadata.approval_hash, option_id: selected.id, value: selected.value, source: 'verified-plan' } };
    } catch (error) { return { status: 'blocked', reason: error.message }; }
  }
  return { status: 'pending', reason: 'no current explicit decision authority', decision_fingerprint: fingerprint };
}

export function selectWorkerPolicy(task = {}) {
  const category = inferTaskCategory(task);
  if (['security', 'architecture'].includes(category)) {
    return {
      worker: 'deep',
      model_tier: 'deep',
      role: category === 'architecture' ? 'reviewer' : 'reviewer',
      reason: `${category} work is reserved for deep review or the parent`,
    };
  }
  if (['concurrency', 'flaky-test', 'integration-root-cause', 'public-contract'].includes(category)) {
    return {
      worker: 'balanced',
      model_tier: 'balanced',
      role: category.includes('test') ? 'test_writer' : 'implementation_worker',
      reason: `${category} work must not use the fast tier`,
    };
  }
  if (isFastWorkerEligible(task, category)) {
    return {
      worker: 'fast',
      model_tier: 'fast',
      role: category === 'test' ? 'test_writer' : 'docs_writer',
      reason: 'behavior, acceptance criteria, test layer, and owned paths are confirmed',
    };
  }
  return {
    worker: 'balanced',
    model_tier: 'balanced',
    role: category === 'test' ? 'test_writer' : 'implementation_worker',
    reason: 'the fast-worker gate is incomplete or the task needs implementation judgment',
  };
}

export function resolveModelPolicy({ model_tier = 'balanced', capabilities = {} } = {}) {
  if (!MODEL_TIERS.has(model_tier)) {
    return {
      mode: 'blocked',
      model_tier,
      inherit_parent: true,
      reason: 'model tier must be fast, balanced, or deep',
    };
  }
  const overrideStatus = normalizeCapabilityStatus(capabilities.per_agent_model_override);
  if (overrideStatus !== 'supported') {
    return {
      mode: 'inherit-parent',
      model_tier,
      inherit_parent: true,
      reason: `per-agent model override is ${overrideStatus}`,
    };
  }
  return {
    mode: 'adapter-override-eligible',
    model_tier,
    inherit_parent: false,
    reason: 'adapter may resolve the semantic tier to an available provider configuration',
  };
}

export function validateTaskBrief(brief) {
  const errors = [];
  if (!isPlainObject(brief)) return ['task brief must be an object'];
  const allowedFields = new Set(TASK_BRIEF_FIELDS);
  for (const [key, label] of EMBEDDED_ARTIFACT_KEYS) {
    if (Object.hasOwn(brief, key)) errors.push(`task brief must not embed the ${label}`);
  }
  for (const key of Object.keys(brief)) {
    if (!allowedFields.has(key) && !EMBEDDED_ARTIFACT_KEYS.has(key)) {
      errors.push(`task brief has unsupported field: ${key}`);
    }
  }
  for (const field of TASK_BRIEF_FIELDS) {
    if (!Object.hasOwn(brief, field)) errors.push(`task brief requires ${field}`);
  }
  for (const field of ['task_id', 'objective', 'plan_step', 'expected_output']) {
    if (Object.hasOwn(brief, field) && !isNonEmptyString(brief[field])) {
      errors.push(`task brief ${field} must be a non-empty string`);
    }
  }
  for (const field of [
    'dependencies',
    'owned_paths',
    'readable_paths',
    'do_not_touch',
    'context_refs',
    'acceptance_criteria',
    'verification_commands',
    'escalation_conditions',
  ]) {
    if (Object.hasOwn(brief, field) && !isStringArray(brief[field])) {
      errors.push(`task brief ${field} must be a string array`);
    }
  }
  if (Object.hasOwn(brief, 'model_tier') && !MODEL_TIERS.has(brief.model_tier)) {
    errors.push('task brief model_tier must be fast, balanced, or deep');
  }
  if (containsEmbeddedArtifactBody(Object.values(brief))) {
    errors.push('task brief must reference spec/plan artifacts instead of embedding their bodies');
  }
  return errors;
}

export function validateReviewPackage(reviewPackage) {
  const errors = [];
  if (!isPlainObject(reviewPackage)) return ['review package must be an object'];
  const allowedFields = new Set(REVIEW_PACKAGE_FIELDS);
  for (const key of Object.keys(reviewPackage)) {
    if (!allowedFields.has(key)) errors.push(`review package has unsupported field: ${key}`);
  }
  for (const field of REVIEW_PACKAGE_FIELDS) {
    if (!Object.hasOwn(reviewPackage, field)) errors.push(`review package requires ${field}`);
  }
  for (const field of ['task_id', 'diff_reference']) {
    if (Object.hasOwn(reviewPackage, field) && !isNonEmptyString(reviewPackage[field])) {
      errors.push(`review package ${field} must be a non-empty string`);
    }
  }
  for (const field of ['changed_paths', 'evidence', 'risks', 'unresolved']) {
    if (Object.hasOwn(reviewPackage, field) && !isStringArray(reviewPackage[field])) {
      errors.push(`review package ${field} must be a string array`);
    }
  }
  if (
    Object.hasOwn(reviewPackage, 'verification') &&
    !Array.isArray(reviewPackage.verification) &&
    !isPlainObject(reviewPackage.verification)
  ) {
    errors.push('review package verification must be an array or object');
  }
  if (containsEmbeddedDiff(Object.values(reviewPackage))) {
    errors.push('review package must reference the current diff instead of embedding it');
  }
  return errors;
}

export function validateDisjointOwnership(units = []) {
  const errors = [];
  const normalized = units.map((unit) => ({
    id: String(unit.id ?? '<unknown>'),
    paths: (unit.owned_paths ?? unit.ownership?.allowed_paths ?? []).map(patternRoot),
    resources: (unit.resources ?? unit.ownership?.exclusive_resources ?? []).map(normalizeResource),
  }));

  for (let leftIndex = 0; leftIndex < normalized.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < normalized.length; rightIndex += 1) {
      const left = normalized[leftIndex];
      const right = normalized[rightIndex];
      for (const leftPath of left.paths) {
        for (const rightPath of right.paths) {
          if (pathsOverlap(leftPath, rightPath)) {
            errors.push(`path ownership overlaps: ${left.id} and ${right.id}`);
          }
        }
      }
      for (const leftResource of left.resources) {
        for (const rightResource of right.resources) {
          if (resourcesOverlap(leftResource, rightResource)) {
            errors.push(`resource ownership overlaps: ${left.id} and ${right.id}`);
          }
        }
      }
    }
  }
  return [...new Set(errors)];
}

// These helpers enforce a semantic assessment made by the decision owner. They
// do not classify natural language or count as evidence that an agent recognized it.
export function shouldOfferVisual(input = {}) {
  return evaluateVisualOffer(input).action === 'offer';
}

const VISUAL_SCOPES = new Set(['decision', 'visual-thread', 'session']);
const VISUAL_ID_FIELDS = ['session_id', 'visual_thread_id', 'decision_id'];
const VISUAL_STATES = new Set(['not-evaluated', 'not-applicable', 'pending', 'accepted', 'declined']);

function visualIdentity(decision) {
  if (!isPlainObject(decision) || VISUAL_ID_FIELDS.some((key) => !isNonEmptyString(decision[key]))) return null;
  return Object.fromEntries(VISUAL_ID_FIELDS.map((key) => [key, decision[key]]));
}

function visualContext(context = {}) {
  if (!isPlainObject(context)) throw new TypeError('visual_companion context must be an object');
  const state = { schema_version: 1, decisions: [], responses: [], consents: [] };
  if (typeof context.artifact_write_approved === 'boolean') state.artifact_write_approved = context.artifact_write_approved;
  if (context.schema_version !== undefined && context.schema_version !== 1) throw new TypeError('unsupported visual context version');
  // Old booleans do not establish identity or consent. Preserve their no-repeat signal.
  if (context.offered === true || context.selected === true || context.legacy_offered === true) state.legacy_offered = true;
  for (const field of ['decisions', 'responses', 'consents']) {
    if (context[field] === undefined) continue;
    if (!Array.isArray(context[field])) throw new TypeError(`${field} must be an array`);
    state[field] = context[field].map((record) => {
      const identity = visualIdentity(record);
      if (!identity) throw new TypeError(`${field} requires decision identity`);
      if (field === 'decisions') {
        if (!VISUAL_STATES.has(record.status) || !isNonEmptyString(record.reason)) throw new TypeError('invalid decision status or reason');
        if (record.surface !== null && !Object.hasOwn(VISUAL_MODE_KINDS, record.surface)) throw new TypeError('invalid visual surface');
        const failed = record.failed_surfaces ?? [];
        if (!Array.isArray(failed) || failed.some((kind) => !VISUAL_INTERACTION_KINDS.includes(kind))) throw new TypeError('invalid failed visual surface');
        return { ...identity, status: record.status, reason: record.reason, surface: record.surface, failed_surfaces: [...new Set(failed)] };
      }
      if (!VISUAL_SCOPES.has(record.scope)) throw new TypeError('invalid visual scope');
      const scoped = { ...identity, scope: record.scope };
      if (field === 'responses') {
        if (!['pending', 'accepted', 'declined'].includes(record.status)) throw new TypeError('invalid visual response');
        return { ...scoped, status: record.status };
      }
      if (!['local_runtime_writes', 'browser_open'].includes(record.kind) || typeof record.granted !== 'boolean' || !isNonEmptyString(record.purpose_id)) {
        throw new TypeError('invalid visual consent kind, grant or purpose');
      }
      return { ...scoped, kind: record.kind, granted: record.granted, purpose_id: record.purpose_id };
    });
  }
  return state;
}

function matchesVisualScope(record, decision) {
  return record.session_id === decision.session_id && (record.scope === 'session'
    || record.visual_thread_id === decision.visual_thread_id && (record.scope === 'visual-thread'
      || record.decision_id === decision.decision_id));
}

function sameVisualScope(left, right) {
  return left.scope === right.scope && matchesVisualScope(left, right);
}

function putVisualRecord(state, field, record) {
  state[field] = state[field].filter((old) => !(sameVisualScope(old, record)
    && (field !== 'consents' || old.kind === record.kind && old.purpose_id === record.purpose_id)));
  state[field].push(record); // Last applicable conversation response wins, including a narrow re-enable.
  return state;
}

function scopedVisualInput(decision, scope, source) {
  const identity = visualIdentity(decision);
  if (!identity) throw new TypeError('visual decision identity is required');
  if (!VISUAL_SCOPES.has(scope)) throw new TypeError('invalid visual scope');
  if (source !== 'conversation') throw new TypeError('only an explicit conversation response can record preference or consent');
  return { ...identity, scope };
}

export function recordVisualResponse({ context, decision, response, scope = 'visual-thread', source = 'conversation' } = {}) {
  if (!['accepted', 'declined'].includes(response)) throw new TypeError('response must be accepted or declined');
  return putVisualRecord(visualContext(context), 'responses', {
    ...scopedVisualInput(decision, scope, source), status: response,
  });
}

export function recordVisualConsent({ context, decision, kind, granted, scope = 'visual-thread', source = 'conversation' } = {}) {
  const scoped = scopedVisualInput(decision, scope, source);
  if (!isNonEmptyString(decision.purpose_id)) throw new TypeError('consent requires a purpose_id');
  if (!['local_runtime_writes', 'browser_open'].includes(kind) || typeof granted !== 'boolean') throw new TypeError('invalid consent kind or grant');
  return putVisualRecord(visualContext(context), 'consents', { ...scoped, kind, granted, purpose_id: decision.purpose_id });
}

export function evaluateVisualOffer({ decision, context, capabilities = {}, failed_surfaces = [] } = {}) {
  let state = visualContext(context);
  const identity = visualIdentity(decision);
  if (!identity) return { action: 'continue-text', status: 'not-evaluated', reason: 'no grounded decision identity', context: state };
  if (!Array.isArray(failed_surfaces) || failed_surfaces.some((kind) => !VISUAL_INTERACTION_KINDS.includes(kind))) throw new TypeError('invalid failed visual surface');
  const prior = state.decisions.find((old) => VISUAL_ID_FIELDS.every((key) => old[key] === identity[key]));
  const failed = [...new Set([...(prior?.failed_surfaces ?? []), ...failed_surfaces])];
  const finish = (action, status, reason, surface = null) => {
    state.decisions = state.decisions.filter((old) => !VISUAL_ID_FIELDS.every((key) => old[key] === identity[key]));
    state.decisions.push({ ...identity, status, reason, surface: surface?.mode ?? null, failed_surfaces: failed });
    return { action, status, reason, surface, context: state };
  };
  // Seed a direct request once. Replaying its assessment is not a new user
  // response; later requests use recordVisualResponse before evaluation.
  if (decision.explicit_visual_request === true && !prior) {
    state = recordVisualResponse({ context: state, decision, response: 'accepted', scope: 'decision' });
  }
  const response = state.responses.findLast((record) => matchesVisualScope(record, decision));
  if (response?.status === 'declined') return finish('continue-text', 'declined', 'conversation decline applies to this visual scope');
  // A requested preview may illustrate an approved decision; it never reopens that decision.
  if (decision.explicit_visual_request !== true && (decision.open !== true || decision.approved === true
    || decision.delegated === true || decision.requires_user_choice !== true
    || !Array.isArray(decision.options) || decision.options.some((option) => !isNonEmptyString(option))
    || new Set(decision.options.map((option) => option.trim().toLowerCase())).size < 2
    || decision.material_tradeoff !== true || decision.visual_benefit !== true || !isNonEmptyString(decision.reason))) {
    return finish('continue-text', 'not-applicable', 'no open user choice with grounded alternatives and a material visual benefit');
  }
  const consent = {};
  for (const grant of state.consents) {
    if (matchesVisualScope(grant, decision) && grant.purpose_id === decision.purpose_id) consent[grant.kind] = grant.granted;
  }
  const surface = resolveVisualCompanionPlan({ capabilities, consent, failed_surfaces: failed });
  if (response?.status === 'accepted') {
    const action = surface.consent_required.length ? 'request-consent'
      : surface.mode === 'markdown' ? 'continue-text' : 'present';
    return finish(action, 'accepted', surface.reason, surface);
  }
  if (response?.status === 'pending' || state.legacy_offered) return finish('wait', 'pending', 'an invitation already awaits a scoped conversation response', surface);
  if (surface.mode === 'markdown' && surface.consent_required.length === 0) return finish('continue-text', 'not-applicable', surface.reason, surface);
  putVisualRecord(state, 'responses', { ...identity, scope: 'visual-thread', status: 'pending' });
  return finish('offer', 'pending', decision.reason, surface);
}

function isFastWorkerEligible(task, category) {
  const ownedPaths = Array.isArray(task.owned_paths) ? task.owned_paths : [];
  return (
    ['documentation', 'test'].includes(category) &&
    task.behavior_confirmed === true &&
    task.acceptance_criteria_confirmed === true &&
    task.test_layer_confirmed === true &&
    ownedPaths.length > 0 &&
    task.high_risk !== true &&
    task.architectural !== true &&
    task.cross_cutting !== true
  );
}

function isFastFixEligible(task, category) {
  const ownedPaths = Array.isArray(task.owned_paths) ? task.owned_paths : [];
  return (
    ![
      'security',
      'architecture',
      'concurrency',
      'flaky-test',
      'integration-root-cause',
      'public-contract',
    ].includes(category) &&
    task.behavior_confirmed === true &&
    task.acceptance_criteria_confirmed === true &&
    (task.verification_confirmed === true || task.test_layer_confirmed === true) &&
    ownedPaths.length > 0 &&
    task.high_risk !== true &&
    task.architectural !== true &&
    task.cross_cutting !== true &&
    task.ambiguous !== true
  );
}

function inferTaskCategory(task) {
  if (isNonEmptyString(task.category)) return task.category.toLowerCase();
  const paths = Array.isArray(task.owned_paths) ? task.owned_paths : [];
  if (paths.length > 0 && paths.every((item) => /\.(?:md|mdx|txt|adoc)$/i.test(item))) {
    return 'documentation';
  }
  if (
    paths.some((item) => /(?:^|\/)(?:test|tests|__tests__)\//i.test(item)) ||
    /\b(?:test|fixture|spec)\b/i.test(String(task.request ?? ''))
  ) {
    return 'test';
  }
  return 'implementation';
}

function numberedMarkdown(options) {
  return options.map((option, index) => `${index + 1}. ${option}`).join('\n');
}

function normalizeCapabilityStatus(value) {
  return STATUSES.has(value) ? value : 'unknown';
}

function compareExactSet(actual, expected, label, errors) {
  if (!Array.isArray(actual)) {
    errors.push(`${label} must be an array`);
    return;
  }
  if (actual.some((item) => !isNonEmptyString(item))) {
    errors.push(`${label} must contain non-empty strings`);
  }
  const actualValues = [...new Set(actual)].sort();
  const expectedValues = [...new Set(expected)].sort();
  if (JSON.stringify(actualValues) !== JSON.stringify(expectedValues)) {
    errors.push(`${label} must contain exactly: ${expectedValues.join(', ')}`);
  }
  if (actualValues.length !== actual.length) errors.push(`${label} must not contain duplicates`);
}

function patternRoot(value) {
  return String(value ?? '')
    .replaceAll('\\', '/')
    .replace(/^\.\//, '')
    .split(/[!*?+@{([]/, 1)[0]
    .replace(/\/$/, '')
    .toLowerCase();
}

function pathsOverlap(left, right) {
  if (!left || !right) return true;
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function normalizeResource(value) {
  const raw = String(value ?? '').trim().toLowerCase().replaceAll('\\', '/');
  const match = raw.match(/^(temp|cache|coverage):(.*)$/);
  if (!match) return { type: raw.split(':', 1)[0], value: raw, hierarchical: false };
  return {
    type: match[1],
    value: match[2].replace(/^\.\//, '').replace(/\/$/, ''),
    hierarchical: true,
  };
}

function resourcesOverlap(left, right) {
  if (left.type !== right.type) return false;
  if (!left.hierarchical || !right.hierarchical) return left.value === right.value;
  return pathsOverlap(left.value, right.value);
}

function isStringArray(value) {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function containsEmbeddedArtifactBody(values) {
  const text = flattenText(values).join('\n');
  return (
    /(?:^|\n)---\s*\n[\s\S]*?\n---(?:\n|$)/m.test(text) ||
    /(?:^|\n)(?:spec_context|plan_context):\s*(?:\n|$)/m.test(text) ||
    /(?:^|\n)#\s+.*\b(?:Specification|Implementation Plan)\b.*$/m.test(text)
  );
}

function containsEmbeddedDiff(values) {
  const text = flattenText(values).join('\n');
  return /(?:^|\n)diff --git\s+a\/.+\s+b\/.+(?:\n|$)/m.test(text);
}

function flattenText(values) {
  const output = [];
  for (const value of values) {
    if (typeof value === 'string') output.push(value);
    else if (Array.isArray(value)) output.push(...flattenText(value));
    else if (isPlainObject(value)) output.push(...flattenText(Object.values(value)));
  }
  return output;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export {
  CONSUMER_REQUIRED_FIELD_KINDS,
  CONSUMER_REQUIRED_FIELDS,
  auditRenderedProjection,
  buildPortableHandoff,
  containsForbiddenEmbeddedArtifactFields,
  measureRepeatedBlockBytes,
  measureText,
  projectRuntimeContext,
  renderUserProjection,
  resolveCommunicationProfile,
  selectRelatedArtifacts,
  shouldEmitProgress,
  validateRequiredHandoffFields,
} from './communication-economy.mjs';
