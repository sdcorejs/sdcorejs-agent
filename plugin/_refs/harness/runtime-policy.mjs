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
  'subagents',
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

export function selectExecutionMode({ units = [], feasible = false, capabilities = {} } = {}) {
  if (units.length <= 1) {
    return {
      mode: 'sequential',
      prompt_required: false,
      reason: units.length === 0 ? 'no executable unit' : 'single executable unit',
    };
  }

  const ownershipErrors = validateDisjointOwnership(units);
  const subagents = normalizeCapabilityStatus(capabilities.subagents ?? 'unknown');
  if (!feasible || ownershipErrors.length > 0 || subagents !== 'supported') {
    return {
      mode: 'sequential',
      prompt_required: false,
      reason: !feasible
        ? 'parallel execution is not feasible'
        : ownershipErrors.length > 0
          ? ownershipErrors.join('; ')
          : `subagent capability is ${subagents}`,
    };
  }

  return {
    mode: 'choice',
    prompt_required: true,
    reason: 'multiple independent units have disjoint path and resource ownership',
    options: ['sequential', 'parallel'],
  };
}

export function selectInteraction({
  capabilities = {},
  options = [],
  visual_spatial = false,
} = {}) {
  const labels = options.map((item) => String(item));
  const markdown = numberedMarkdown(labels);

  if (labels.length === 0) {
    return {
      kind: 'no-valid-option',
      reason: 'no valid option is available',
      markdown: '',
      fallback_markdown: '',
    };
  }
  if (labels.length === 1) {
    return {
      kind: 'auto-select',
      selected: labels[0],
      reason: 'only one valid option',
      markdown,
      fallback_markdown: markdown,
    };
  }

  if (normalizeCapabilityStatus(capabilities.native_structured_choice) === 'supported') {
    return {
      kind: 'native-structured-choice',
      options: labels,
      markdown,
      fallback_markdown: markdown,
    };
  }
  if (visual_spatial && normalizeCapabilityStatus(capabilities.visual_surface) === 'supported') {
    return {
      kind: 'typed-visual-screen',
      options: labels,
      markdown,
      fallback_markdown: markdown,
    };
  }
  if (visual_spatial && normalizeCapabilityStatus(capabilities.static_html_artifact) === 'supported') {
    return {
      kind: 'static-visual-composer',
      options: labels,
      markdown,
      fallback_markdown: markdown,
    };
  }
  return {
    kind: 'markdown-numbered-choice',
    options: labels,
    markdown,
    fallback_markdown: markdown,
  };
}

export function normalizeChoiceResponse(response, options = [], { recommended } = {}) {
  const raw = String(response ?? '').trim();
  const normalized = raw.toLowerCase();
  const labels = options.map((item) => String(item));
  const delegated = /^(?:you decide|decide for me|use (?:the )?recommend(?:ed|ation)|choose (?:the )?default)$/i.test(raw);

  if (delegated && labels.includes(recommended)) {
    return { status: 'selected', selected: recommended, source: 'recommended' };
  }

  const selectors = [...normalized.matchAll(/\b(\d+)\b/g)]
    .map((match) => Number(match[1]))
    .filter((value) => value >= 1 && value <= labels.length);
  if (new Set(selectors).size === 1) {
    return { status: 'selected', selected: labels[selectors[0] - 1], source: 'numeric' };
  }
  if (new Set(selectors).size > 1) {
    return { status: 'ambiguous', selected: null, source: 'multiple-selectors' };
  }

  const exact = labels.filter((label) => label.toLowerCase() === normalized);
  if (exact.length === 1) {
    return { status: 'selected', selected: exact[0], source: 'label' };
  }
  return { status: 'ambiguous', selected: null, source: 'unrecognized' };
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

export function shouldOfferVisual({
  visual_spatial = false,
  previous_response = null,
  new_visual_decision = false,
} = {}) {
  if (!visual_spatial) return false;
  if (previous_response === 'declined' && !new_visual_decision) return false;
  return true;
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
