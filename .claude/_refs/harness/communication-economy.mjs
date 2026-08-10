import { isDeepStrictEqual } from 'node:util';
import {
  validateDispatchContext,
  validateResultIdentity,
} from '../orchestration/parallel-protocol.mjs';

const PROFILES = new Set(['compact', 'standard', 'detailed']);
const CAPABILITY_STATUSES = new Set(['supported', 'unsupported', 'unknown']);

const CONTEXT_INPUT_ALIASES = deepFreeze({
  requirement_context: {
    out_of_scope: 'non_goals',
  },
});

const DETAILED_MESSAGE_KINDS = new Set([
  'spec-approval',
  'plan-approval',
  'security-warning',
  'security-policy-decision',
  'destructive-action',
  'irreversible-action',
  'ambiguous-high-impact-decision',
  'order-sensitive-instruction',
  'migration-decision',
  'public-contract-decision',
  'verification-failure',
  'conflicting-evidence',
  'unresolved-blocker',
]);

const STANDARD_MESSAGE_KINDS = new Set([
  'technical-design',
  'technical-explanation',
  'review-findings',
  'verification-skipped',
  'trade-off',
  'requested-explanation',
]);

const VISIBLE_PROGRESS_EVENTS = new Set([
  'work-started',
  'meaningful-outcome',
  'scope-changed',
  'blocker',
  'verification-completed',
  'verification-failed',
  'decision-required',
  'status-requested',
]);

const NON_PROGRESS_EVENTS = new Set([
  'file-read',
  'ordinary-tool-call',
  'command-transition',
  'pre-final-summary',
]);

const ARTIFACT_BODY_FIELDS = new Set([
  'artifact_body',
  'full_artifact',
  'full_spec',
  'spec_body',
  'full_plan',
  'plan_body',
  'full_diff',
  'diff_body',
  'full_log',
  'log_body',
  'raw_log',
  'full_context',
  'repository_context',
  'full_repository_context',
]);

const ARTIFACT_BODY_CONTENT_PATTERNS = [
  {
    kind: 'durable artifact body',
    pattern: /(?:^|\r?\n)---\s*\r?\n[\s\S]*?(?:^|\r?\n)(?:artifact_kind|contract_id|change_ref|approved_spec_path|approved_plan_path|approval):[^\r\n]*\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/m,
  },
  {
    kind: 'diff body',
    pattern: /(?:^|\r?\n)diff --git\s+a\/[^\r\n]+\s+b\/[^\r\n]+(?:\r?\n|$)/m,
  },
  {
    kind: 'specification body',
    pattern: /(?:^|\r?\n)#\s+.*\bSpecification\b.*(?:\r?\n|$)/im,
  },
  {
    kind: 'implementation plan body',
    pattern: /(?:^|\r?\n)#\s+.*\bImplementation Plan\b.*(?:\r?\n|$)/im,
  },
  {
    kind: 'typed context body',
    pattern: /(?:^|\r?\n)(?:requirement_context|spec_context|plan_context|execution_context|test_context|review_context|debug_context|simplify_context|ship_context|artifact_context|ui_capture_context|explore_context|ai_agent_context|parallel_context):\s*(?:\r?\n|$)/m,
  },
  {
    kind: 'log body',
    pattern: /(?:^|\r?\n)(?:(?:BEGIN|START)\s+(?:RAW\s+)?LOG|#{1,6}\s+(?:Raw|Command|Verification|Build|Test) Log)\s*(?:\r?\n|$)/im,
  },
  {
    kind: 'structured log body',
    pattern: /(?:^|\r?\n)(?:\[[^\]\r\n]+\]|\d{4}-\d{2}-\d{2}[T ][^\s\r\n]+)\s+(?:TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\b[^\r\n]*(?:\r?\n)+(?:\[[^\]\r\n]+\]|\d{4}-\d{2}-\d{2}[T ][^\s\r\n]+)\s+(?:TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\b/im,
  },
  {
    kind: 'repository context body',
    pattern: /(?:^|\r?\n)#\s+(?:Repository Context|Project Summary)\b.*(?:\r?\n|$)/im,
  },
];

const TEST_STATUS_FIELDS = [
  'planning',
  'authoring',
  'executability',
  'execution',
  'result',
  'evidence',
  'documentation',
  'blockers',
];

const TEST_STATUS_EXECUTION_FIELDS = [
  'executability',
  'execution',
  'result',
  'evidence',
  'blockers',
];

const TEST_STATUS_DOCUMENTATION_FIELDS = [
  'execution',
  'result',
  'evidence',
  'documentation',
  'blockers',
];

const TEST_EVIDENCE_FIELDS = [
  'schema_version',
  'source',
  'change_ref',
  'associated_HEAD_or_diff',
  'status.planning',
  'status.authoring',
  'status.executability',
  'status.execution',
  'status.result',
  'status.evidence',
  'status.documentation',
  'runs',
  'cases',
  'acknowledgements',
  'convergence_evidence_refs',
  'data_lifecycle',
  'captures',
  'commands_skipped',
  'blockers',
  'residual_risks',
  'redactions_applied',
];

const TEST_EVIDENCE_EXECUTION_FIELDS = [
  'schema_version',
  'source',
  'change_ref',
  'associated_HEAD_or_diff',
  'status.executability',
  'status.execution',
  'status.result',
  'status.evidence',
  'runs',
  'cases',
  'acknowledgements',
  'convergence_evidence_refs',
  'commands_skipped',
  'blockers',
  'residual_risks',
  'redactions_applied',
];

const TEST_EVIDENCE_DOCUMENTATION_FIELDS = [
  'schema_version',
  'source',
  'change_ref',
  'associated_HEAD_or_diff',
  'status.execution',
  'status.result',
  'status.evidence',
  'status.documentation',
  'runs',
  'cases',
  'acknowledgements',
  'convergence_evidence_refs',
  'captures',
  'commands_skipped',
  'blockers',
  'residual_risks',
  'redactions_applied',
];

const PARALLEL_CONTEXT_FIELDS = [
  'schema_version',
  'source',
  'contract',
  'target',
  'working_tree',
  'runtime_capabilities',
  'topology',
  'integration',
  'units',
  'failure_policy',
  'redaction',
  'global_verification',
  'final_tail',
];

const APPROVED_ARTIFACT_IDENTITY_FIELDS = new Set([
  'approved_spec_path',
  'approved_spec_hash',
  'approved_plan_path',
  'approved_plan_hash',
]);

const TEST_STATUS_ENUMS = {
  planning: new Set(['missing', 'planned', 'approved', 'not-applicable']),
  authoring: new Set(['not-requested', 'not-written', 'written', 'updated', 'existing']),
  executability: new Set(['ready', 'blocked', 'unknown', 'not-applicable']),
  execution: new Set(['not-run', 'executed', 'partial', 'interrupted']),
  result: new Set(['pass', 'fail', 'blocked', 'unknown', 'not-applicable']),
  evidence: new Set(['absent', 'current', 'stale', 'partial']),
  documentation: new Set(['not-requested', 'pending', 'generated', 'verified', 'blocked']),
};

export const CONSUMER_REQUIRED_FIELD_KINDS = deepFreeze({
  requirement_context: {
    decision_coverage: 'object',
    goal_backward_review: 'object',
    profile_evidence: 'array',
    in_scope: 'array',
    non_goals: 'array',
    decisions_confirmed: 'array',
    assumptions: 'array',
    'blockers.resolved': 'array',
    'blockers.unresolved': 'array',
    redaction_applied: 'boolean',
  },
  spec_context: {
    decision_coverage: 'object',
    goal_backward_review: 'object',
    architecture_gate: 'object',
    source_requirement_context: 'reference-or-object',
    acceptance_criteria_count: 'number',
    manual_criteria_count: 'number',
    non_goals: 'array',
    risks: 'array',
    assumptions: 'array',
    redaction_applied: 'boolean',
    approval: 'object',
    change_control: 'object',
  },
  plan_context: {
    schema_version: 'number',
    decision_coverage: 'object',
    goal_backward_review: 'object',
    architecture_gate: 'object',
    architecture_context: 'nullable-object',
    validation_map: 'array',
    allowed_paths: 'array',
    prohibited_paths: 'array',
    generated_artifacts: 'array',
    docs_artifacts: 'array',
    dependency_changes: 'object',
    env_changes: 'object',
    migration_changes: 'object',
    frontend_architecture: 'object',
    agent_architecture: 'object',
    verification_strategy: 'object',
    parallel_candidates: 'object',
    finish_tail: 'object',
    approval: 'object',
    change_control: 'object',
  },
  execution_context: {
    decision_coverage: 'object',
    goal_backward_review: 'object',
    architecture_gate: 'object',
    architecture_context: 'nullable-object',
    validation_map: 'array',
    convergence_trace: 'array',
    files_changed: 'array',
    artifact_context: 'object',
    commands_run: 'array',
    commands_skipped: 'array',
    tasks_remaining: 'array',
    redaction_applied: 'boolean',
    frontend_architecture: 'object',
    ship_handoff: 'object',
  },
  test_context: {
    schema_version: 'number',
    decision_coverage: 'object',
    goal_backward_review: 'object',
    architecture_gate: 'object',
    architecture_context: 'nullable-object',
    validation_map: 'array',
    change: 'object',
    classification: 'object',
    scope: 'object',
    runner: 'object',
    environment: 'object',
    auth: 'object',
    data: 'object',
    execution: 'object',
    coverage_matrix: 'array',
    redaction_applied: 'boolean',
  },
  test_status: {
    blockers: 'array',
  },
  test_evidence: {
    schema_version: 'number',
    runs: 'array',
    cases: 'array',
    acknowledgements: 'array',
    convergence_evidence_refs: 'array',
    data_lifecycle: 'object',
    captures: 'array',
    commands_skipped: 'array',
    blockers: 'array',
    residual_risks: 'array',
    redactions_applied: 'boolean',
  },
  parallel_context: {
    schema_version: 'number',
    contract: 'object',
    target: 'object',
    working_tree: 'object',
    runtime_capabilities: 'object',
    topology: 'object',
    integration: 'object',
    units: 'array',
    failure_policy: 'object',
    redaction: 'object',
    global_verification: 'object',
    final_tail: 'object',
  },
  review_context: {
    decision_coverage: 'object',
    goal_backward_review: 'object',
    architecture_gate: 'object',
    architecture_context: 'nullable-object',
    validation_map: 'array',
    convergence_findings: 'object',
    dimensions: 'array',
    approved_frontend_architecture: 'object',
    file_scope: 'array',
    refs_loaded: 'array',
    refs_skipped: 'array',
    probes_run: 'array',
    probes_skipped: 'array',
    test_evidence_summary: 'object',
    finding_ids: 'array',
    findings: 'array',
    repair_gate_mapping: 'object',
  },
  debug_context: {
    files_touched: 'array',
    diagnostic_instrumentation: 'object',
    regression_tests: 'object',
    commands_run: 'array',
    commands_skipped: 'array',
    secret_redaction: 'object',
    verification: 'object',
    ship_handoff: 'object',
  },
  simplify_context: {
    schema_version: 'number',
    'baseline.commands': 'array',
    scope: 'object',
    preserved_surfaces: 'object',
    passes: 'array',
    result: 'object',
    verification: 'object',
    artifact_context: 'object',
    'result.files_changed': 'array',
  },
  ship_context: {
    decision_coverage: 'object',
    goal_backward_review: 'object',
    architecture_gate: 'object',
    architecture_context: 'nullable-object',
    validation_map: 'array',
    convergence_result: 'object',
    convergence_receipt: 'object',
    acceptance_scope: 'object',
    verification: 'object',
    artifact_context: 'object',
    writes_before_branch_ready: 'array',
    writes_after_branch_ready: 'array',
    branch_ready_evidence: 'object',
    manual_deferrals: 'array',
    git_handoff_allowed: 'boolean',
  },
  artifact_context: {
    schema_version: 'number',
    required_with_change: 'array',
    shared_owned: 'array',
    conditional: 'array',
    local_only: 'array',
    unrelated_observed: 'array',
  },
  ui_capture_context: {
    schema_version: 'number',
    environment: 'object',
    persona: 'object',
    target: 'object',
    assertions: 'object',
    image: 'object',
    redactions_applied: 'boolean',
    blocker: 'nullable-scalar',
  },
  explore_context: {
    tracks: 'array',
    stack_profiles: 'array',
    profile_evidence: 'array',
    source_roots: 'array',
    freshness: 'object',
    redaction: 'object',
    next_skill_hint: 'object',
  },
  ai_agent_context: {
    schema_version: 'number',
    approved_spec: 'object',
    approved_plan: 'object',
    target_paths: 'array',
    trusted_context_sources: 'array',
    tool_contract_paths: 'array',
    deterministic_eval_commands: 'array',
    focused_test_commands: 'array',
    offline_verification: 'object',
    live_provider_verification: 'object',
    findings: 'array',
  },
});

const NON_EMPTY_REQUIRED_ARRAYS = new Set([
  'requirement_context.in_scope',
  'plan_context.allowed_paths',
  'parallel_context.units',
  'review_context.dimensions',
  'review_context.file_scope',
  'ai_agent_context.target_paths',
]);

const COMMON_PROJECTION_FIELDS = [
  'outcome',
  'status',
  'blockers',
  'changed_paths',
  'verification',
  'findings',
  'evidence',
  'risks',
  'skipped_checks',
  'next_action',
  'next_decision',
];

const STANDARD_PROJECTION_FIELDS = ['details'];

const DETAILED_PROJECTION_FIELDS = [
  'rationale',
  'consequences',
  'recovery',
  'approval_scope',
  'acceptance_criteria',
  'non_goals',
  'options',
];

const PROJECTION_SECTION_HEADINGS = {
  blockers: 'Blockers',
  changed_paths: 'Changed',
  verification: 'Verified',
  findings: 'Findings',
  evidence: 'Evidence',
  risks: 'Risks',
  skipped_checks: 'Skipped checks',
  details: 'Details',
  rationale: 'Rationale',
  consequences: 'Consequences',
  recovery: 'Recovery',
  approval_scope: 'Approval scope',
  acceptance_criteria: 'Acceptance criteria',
  non_goals: 'Non-goals',
  options: 'Options',
};

export const CONSUMER_REQUIRED_FIELDS = deepFreeze({
  requirement_context: {
    'sdcorejs-spec': [
      'source',
      'decision_coverage',
      'goal_backward_review',
      'requirement_id',
      'contract_id',
      'target_root',
      'target_root_kind',
      'track',
      'stack_profile',
      'profile_confidence',
      'profile_evidence',
      'user_goal',
      'problem_statement',
      'success_outcome',
      'in_scope',
      'non_goals',
      'decisions_confirmed',
      'assumptions',
      'blockers.resolved',
      'blockers.unresolved',
      'coverage_approach',
      'redaction_applied',
      'next_skill',
    ],
  },
  spec_context: {
    'sdcorejs-plan': [
      'source',
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'contract_id',
      'requirement_id',
      'approved_spec_path',
      'approved_spec_hash',
      'target_root',
      'target_root_kind',
      'track',
      'stack_profile',
      'profile_confidence',
      'source_requirement_context',
      'acceptance_criteria_count',
      'manual_criteria_count',
      'non_goals',
      'risks',
      'assumptions',
      'redaction_applied',
      'approval',
      'change_control',
    ],
  },
  plan_context: {
    'sdcorejs-execute-plan': [
      'schema_version',
      'source',
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'validation_map',
      'contract_id',
      'requirement_id',
      'approved_spec_path',
      'approved_spec_hash',
      'approved_plan_path',
      'approved_plan_hash',
      'target_root',
      'target_root_kind',
      'track',
      'stack_profile',
      'allowed_paths',
      'prohibited_paths',
      'generated_artifacts',
      'docs_artifacts',
      'dependency_changes',
      'env_changes',
      'migration_changes',
      'frontend_architecture',
      'agent_architecture',
      'verification_strategy',
      'parallel_candidates',
      'finish_tail',
      'approval',
      'change_control',
    ],
  },
  execution_context: {
    'sdcorejs-test': [
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'validation_map',
      'convergence_trace',
      'contract_id',
      'approved_spec_path',
      'approved_spec_hash',
      'approved_plan_path',
      'approved_plan_hash',
      'execution_mode',
      'target_root',
      'target_root_kind',
      'track',
      'stack_profile',
      'working_tree_preflight.current_HEAD',
      'files_changed',
      'artifact_context',
      'commands_run',
      'commands_skipped',
      'tasks_remaining',
      'redaction_applied',
    ],
    'sdcorejs-review': [
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'validation_map',
      'convergence_trace',
      'contract_id',
      'approved_spec_path',
      'approved_spec_hash',
      'approved_plan_path',
      'approved_plan_hash',
      'execution_mode',
      'target_root',
      'track',
      'stack_profile',
      'frontend_architecture',
      'working_tree_preflight.current_HEAD',
      'files_changed',
      'artifact_context',
      'commands_run',
      'commands_skipped',
      'tasks_remaining',
    ],
    'sdcorejs-ship': [
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'validation_map',
      'convergence_trace',
      'contract_id',
      'approved_spec_path',
      'approved_spec_hash',
      'approved_plan_path',
      'approved_plan_hash',
      'working_tree_preflight.current_HEAD',
      'files_changed',
      'artifact_context',
      'commands_run',
      'commands_skipped',
      'tasks_remaining',
      'ship_handoff',
    ],
    'sdcorejs-simplify': [
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'validation_map',
      'contract_id',
      'working_tree_preflight.current_HEAD',
      'files_changed',
      'commands_run',
      'commands_skipped',
      'artifact_context',
    ],
  },
  test_context: {
    'sdcorejs-review': [
      'schema_version',
      'source',
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'change',
      'classification',
      'scope',
      'runner',
      'environment',
      'auth',
      'data',
      'execution',
      'validation_map',
      'coverage_matrix',
      'redaction_applied',
    ],
    'sdcorejs-ship': [
      'schema_version',
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'change.associated_HEAD_or_diff',
      'classification',
      'scope',
      'runner',
      'environment',
      'auth',
      'data',
      'execution',
      'validation_map',
      'coverage_matrix',
      'redaction_applied',
    ],
    'sdcorejs-documentation': [
      'schema_version',
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'change',
      'classification',
      'scope',
      'runner',
      'environment',
      'auth',
      'execution',
      'validation_map',
      'redaction_applied',
    ],
  },
  test_status: {
    'sdcorejs-debug': TEST_STATUS_EXECUTION_FIELDS,
    'sdcorejs-review': TEST_STATUS_FIELDS,
    'sdcorejs-simplify': TEST_STATUS_EXECUTION_FIELDS,
    'sdcorejs-ship': TEST_STATUS_FIELDS,
    'sdcorejs-documentation': TEST_STATUS_DOCUMENTATION_FIELDS,
    'sdcorejs-repair-loop': TEST_STATUS_FIELDS,
    'sdcorejs-git': TEST_STATUS_DOCUMENTATION_FIELDS,
  },
  test_evidence: {
    'sdcorejs-debug': TEST_EVIDENCE_EXECUTION_FIELDS,
    'sdcorejs-review': TEST_EVIDENCE_FIELDS,
    'sdcorejs-simplify': TEST_EVIDENCE_EXECUTION_FIELDS,
    'sdcorejs-ship': TEST_EVIDENCE_FIELDS,
    'sdcorejs-documentation': TEST_EVIDENCE_DOCUMENTATION_FIELDS,
    'sdcorejs-repair-loop': TEST_EVIDENCE_FIELDS,
    'sdcorejs-git': TEST_EVIDENCE_DOCUMENTATION_FIELDS,
  },
  parallel_context: {
    'sdcorejs-execute-plan': PARALLEL_CONTEXT_FIELDS,
    'sdcorejs-ship': PARALLEL_CONTEXT_FIELDS,
  },
  review_context: {
    'sdcorejs-repair-loop': [
      'source',
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'validation_map',
      'convergence_findings',
      'track',
      'track_profile',
      'dimensions',
      'review_mode',
      'approved_frontend_architecture',
      'file_scope',
      'refs_loaded',
      'refs_skipped',
      'package_manager',
      'probes_run',
      'probes_skipped',
      'test_evidence_summary',
      'finding_ids',
      'findings',
      'repair_gate_mapping',
    ],
    'sdcorejs-ship': [
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'validation_map',
      'convergence_findings',
      'track',
      'track_profile',
      'dimensions',
      'review_mode',
      'file_scope',
      'probes_run',
      'probes_skipped',
      'test_evidence_summary',
      'finding_ids',
      'findings',
      'repair_gate_mapping',
    ],
  },
  debug_context: {
    'sdcorejs-ship': [
      'source',
      'debug_mode',
      'bug_class',
      'stack_profile',
      'repro_status',
      'observed',
      'expected',
      'root_cause',
      'root_hypothesis_id',
      'confidence',
      'files_touched',
      'diagnostic_instrumentation',
      'regression_tests',
      'commands_run',
      'commands_skipped',
      'package_manager',
      'environment',
      'secret_redaction',
      'verification',
      'ship_handoff',
    ],
    'sdcorejs-review': [
      'debug_mode',
      'bug_class',
      'stack_profile',
      'repro_status',
      'root_cause',
      'confidence',
      'files_touched',
      'verification',
      'ship_handoff',
    ],
  },
  simplify_context: {
    'sdcorejs-test': [
      'schema_version',
      'action',
      'target_root',
      'target_root_kind',
      'baseline.HEAD',
      'baseline.diff_scope_hash',
      'baseline.commands',
      'scope',
      'preserved_surfaces',
      'passes',
      'result',
      'verification',
      'artifact_context',
    ],
    'sdcorejs-review': [
      'schema_version',
      'action',
      'baseline.HEAD',
      'baseline.diff_scope_hash',
      'scope',
      'preserved_surfaces',
      'passes',
      'result',
      'verification',
      'artifact_context',
    ],
    'sdcorejs-ship': [
      'schema_version',
      'action',
      'baseline.HEAD',
      'baseline.diff_scope_hash',
      'scope',
      'preserved_surfaces',
      'passes',
      'result',
      'verification',
      'artifact_context',
    ],
    'sdcorejs-git': [
      'schema_version',
      'action',
      'baseline.HEAD',
      'baseline.diff_scope_hash',
      'result.files_changed',
      'verification',
      'artifact_context',
    ],
  },
  ship_context: {
    'sdcorejs-git': [
      'source',
      'decision_coverage',
      'goal_backward_review',
      'architecture_gate',
      'architecture_context',
      'validation_map',
      'convergence_result',
      'convergence_receipt',
      'mode',
      'verification_mode',
      'delivery_type',
      'target_root',
      'current_HEAD',
      'associated_HEAD_or_diff',
      'acceptance_scope',
      'verification',
      'artifact_context',
      'writes_before_branch_ready',
      'writes_after_branch_ready',
      'branch_ready_evidence',
      'manual_deferrals',
      'final_verdict',
      'git_handoff_allowed',
      'git_handoff_reason',
    ],
  },
  artifact_context: {
    'sdcorejs-ship': [
      'schema_version',
      'change_ref',
      'source_spec',
      'source_plan',
      'required_with_change',
      'shared_owned',
      'conditional',
      'local_only',
      'unrelated_observed',
    ],
    'sdcorejs-git': [
      'schema_version',
      'change_ref',
      'source_spec',
      'source_plan',
      'required_with_change',
      'shared_owned',
      'conditional',
      'local_only',
      'unrelated_observed',
    ],
  },
  ui_capture_context: {
    'sdcorejs-documentation': [
      'schema_version',
      'capture_id',
      'change_ref',
      'guide_path',
      'module_or_feature',
      'scenario_id',
      'source_test_ref',
      'associated_HEAD_or_diff',
      'environment',
      'persona',
      'runner',
      'target',
      'assertions',
      'image',
      'redactions_applied',
      'classification',
      'result',
      'blocker',
    ],
    'sdcorejs-ship': [
      'schema_version',
      'capture_id',
      'change_ref',
      'guide_path',
      'associated_HEAD_or_diff',
      'environment',
      'persona',
      'runner',
      'target',
      'assertions',
      'image',
      'redactions_applied',
      'classification',
      'result',
      'blocker',
    ],
  },
  explore_context: {
    'sdcorejs-brainstorming': [
      'source',
      'action',
      'target_root',
      'target_root_kind',
      'tracks',
      'stack_profiles',
      'profile_confidence',
      'profile_evidence',
      'source_roots',
      'freshness',
      'redaction',
      'next_skill_hint',
    ],
    'sdcorejs-ship': [
      'source',
      'action',
      'target_root',
      'target_root_kind',
      'tracks',
      'stack_profiles',
      'profile_confidence',
      'profile_evidence',
      'freshness',
      'redaction',
    ],
  },
  ai_agent_context: {
    'sdcorejs-test': [
      'schema_version',
      'approved_spec',
      'approved_plan',
      'engine_profile',
      'engine_profile_path',
      'capability_profile',
      'capability_profile_path',
      'runtime_owner',
      'target_paths',
      'trusted_context_sources',
      'authorization_and_tenant_policy',
      'tool_contract_paths',
      'approval_bindings',
      'session_controls',
      'evidence_policy',
      'limits',
      'provider_storage_policy',
      'deterministic_eval_commands',
      'focused_test_commands',
      'offline_verification',
      'live_provider_verification',
      'findings',
    ],
    'sdcorejs-review': [
      'schema_version',
      'approved_spec',
      'approved_plan',
      'engine_profile',
      'capability_profile',
      'target_paths',
      'trusted_context_sources',
      'authorization_and_tenant_policy',
      'tool_contract_paths',
      'approval_bindings',
      'session_controls',
      'evidence_policy',
      'observability_and_audit_policy',
      'usage_and_finops_policy',
      'limits',
      'provider_storage_policy',
      'offline_verification',
      'live_provider_verification',
      'findings',
    ],
    'sdcorejs-debug': [
      'schema_version',
      'approved_spec',
      'approved_plan',
      'engine_profile',
      'capability_profile',
      'target_paths',
      'tool_contract_paths',
      'approval_bindings',
      'session_controls',
      'evidence_policy',
      'limits',
      'provider_storage_policy',
      'offline_verification',
      'live_provider_verification',
    ],
    'sdcorejs-ship': [
      'schema_version',
      'approved_spec',
      'approved_plan',
      'engine_profile',
      'capability_profile',
      'target_paths',
      'trusted_context_sources',
      'authorization_and_tenant_policy',
      'tool_contract_paths',
      'approval_bindings',
      'session_controls',
      'evidence_policy',
      'observability_and_audit_policy',
      'usage_and_finops_policy',
      'limits',
      'provider_storage_policy',
      'deterministic_eval_commands',
      'focused_test_commands',
      'offline_verification',
      'live_provider_verification',
      'findings',
    ],
    'sdcorejs-git': [
      'schema_version',
      'approved_spec',
      'approved_plan',
      'engine_profile',
      'capability_profile',
      'target_paths',
      'offline_verification',
      'live_provider_verification',
      'findings',
    ],
  },
});

export function resolveCommunicationProfile({
  explicit_profile,
  message_kind,
  workflow_profile,
  durable_artifact = false,
} = {}) {
  const requested = normalizeRequestedProfile(explicit_profile);
  const fullContext = explicit_profile === 'full-context';

  if (DETAILED_MESSAGE_KINDS.has(message_kind)) {
    return {
      profile: 'detailed',
      full_context: fullContext,
      artifact_boundary: durable_artifact,
      reason: 'safety, approval, failure, or decision clarity requires detailed communication',
    };
  }

  if (requested) {
    return {
      profile: requested,
      full_context: fullContext,
      artifact_boundary: durable_artifact,
      reason: 'explicit user request',
    };
  }

  if (PROFILES.has(workflow_profile)) {
    return {
      profile: workflow_profile,
      full_context: false,
      artifact_boundary: durable_artifact,
      reason: 'workflow or artifact contract',
    };
  }

  if (STANDARD_MESSAGE_KINDS.has(message_kind)) {
    return {
      profile: 'standard',
      full_context: false,
      artifact_boundary: durable_artifact,
      reason: 'message kind needs normal explanation',
    };
  }

  return {
    profile: 'compact',
    full_context: false,
    artifact_boundary: durable_artifact,
    reason: 'default compact profile',
  };
}

export function shouldEmitProgress({
  event,
  state_changed = false,
  final_response_imminent = false,
  host_heartbeat_required = false,
  long_running = false,
} = {}) {
  if (event === 'heartbeat') {
    const emit = host_heartbeat_required && long_running;
    return {
      emit,
      user_visible: emit,
      profile: 'compact',
      reason: emit ? 'host-required long-task heartbeat' : 'heartbeat is not required',
    };
  }

  if (event === 'tracker-close') {
    return {
      emit: state_changed,
      user_visible: state_changed && !final_response_imminent,
      profile: 'compact',
      reason: state_changed
        ? 'close changed native tracker state without duplicating the final projection'
        : 'tracker state did not change',
    };
  }

  if (NON_PROGRESS_EVENTS.has(event)) {
    return {
      emit: false,
      user_visible: false,
      profile: 'compact',
      reason: 'the event does not change a meaningful outcome',
    };
  }

  const emit = VISIBLE_PROGRESS_EVENTS.has(event) && (
    state_changed ||
    ['work-started', 'blocker', 'decision-required', 'status-requested'].includes(event)
  );
  return {
    emit,
    user_visible: emit && !final_response_imminent,
    profile: event === 'verification-failed' || event === 'blocker' || event === 'decision-required'
      ? 'detailed'
      : 'compact',
    reason: emit ? 'meaningful runtime event' : 'no meaningful state change',
  };
}

export function validateRequiredHandoffFields({ contextType, consumer, context } = {}) {
  const fields = CONSUMER_REQUIRED_FIELDS[contextType]?.[consumer];
  if (!fields) return [`no consumer field contract for ${contextType ?? '<unknown>'} -> ${consumer ?? '<unknown>'}`];
  if (!isPlainObject(context)) return [`${contextType} must be an object`];

  const compatibility = normalizeCompatibilityInput(contextType, context);
  const normalizedContext = compatibility.context;
  const errors = [...compatibility.errors];
  for (const field of fields) {
    if (!pathExists(normalizedContext, field)) {
      errors.push(`${contextType} missing required field for ${consumer}: ${field}`);
      continue;
    }
    const valueError = validateRequiredFieldValue(
      contextType,
      field,
      getPath(normalizedContext, field),
    );
    if (valueError) {
      errors.push(`${contextType} invalid required field for ${consumer}: ${field} ${valueError}`);
    }
  }
  errors.push(...validateContextSemantics(contextType, consumer, normalizedContext));
  return errors;
}

export function buildPortableHandoff({
  contextType,
  context,
  consumer,
  nextAction,
  currentHeadOrDiff = null,
  artifactRefs = [],
  evidenceRefs = [],
  stateDelta = {},
  redactionApplied,
} = {}) {
  const errors = validateRequiredHandoffFields({ contextType, consumer, context });
  if (errors.length > 0) {
    const error = new Error(`portable handoff blocked: ${errors.join('; ')}`);
    error.code = 'ERR_INCOMPLETE_PORTABLE_HANDOFF';
    throw error;
  }

  const normalizedContext = normalizeCompatibilityInput(contextType, context).context;

  const resolvedNextAction = nextAction ?? consumer;
  const resolvedFreshness = currentHeadOrDiff ?? inferFreshness(normalizedContext);
  const resolvedRedaction = redactionApplied ?? inferRedactionStatus(normalizedContext);
  const envelopeErrors = [];
  if (!Array.isArray(artifactRefs)) envelopeErrors.push('artifact_refs must be an array');
  else if (artifactRefs.some((reference) => !isNonEmptyString(reference))) {
    envelopeErrors.push('artifact_refs entries must be non-empty string references');
  }
  if (!Array.isArray(evidenceRefs)) envelopeErrors.push('evidence_refs must be an array');
  else if (evidenceRefs.some((reference) => !isNonEmptyString(reference))) {
    envelopeErrors.push('evidence_refs entries must be non-empty string references');
  }
  if (!isPlainObject(stateDelta)) envelopeErrors.push('state_delta must be an object');
  if (!isNonEmptyString(resolvedNextAction)) {
    envelopeErrors.push('next_action must be a non-empty string');
  }
  if (!(resolvedFreshness === null || isNonEmptyString(resolvedFreshness))) {
    envelopeErrors.push('current_HEAD_or_diff must be null or a non-empty string fingerprint');
  }
  if (!(typeof resolvedRedaction === 'boolean' || resolvedRedaction === 'unknown')) {
    envelopeErrors.push('redaction_applied must be a boolean or unknown');
  }
  if (
    redactionApplied !== undefined &&
    !(typeof redactionApplied === 'boolean' || redactionApplied === 'unknown')
  ) {
    envelopeErrors.push('explicit redaction_applied must be a boolean or unknown');
  }
  if (envelopeErrors.length > 0) {
    const error = new Error(`portable handoff blocked: ${envelopeErrors.join('; ')}`);
    error.code = 'ERR_INVALID_PORTABLE_HANDOFF_ENVELOPE';
    throw error;
  }

  for (const [field, value] of [
    ['artifact_refs', artifactRefs],
    ['evidence_refs', evidenceRefs],
    ['state_delta', stateDelta],
    ['next_action', resolvedNextAction],
    ['current_HEAD_or_diff', resolvedFreshness],
  ]) {
    const embeddedPath = findForbiddenEmbeddedArtifact(value);
    if (embeddedPath) {
      const error = new Error(
        `portable handoff blocked: ${field} contains embedded artifact body at ${embeddedPath}`
      );
      error.code = 'ERR_EMBEDDED_ARTIFACT_BODY';
      throw error;
    }
  }

  const referenceShapeErrors = [];
  if (artifactRefs.some(hasLineBreak)) {
    referenceShapeErrors.push('artifact_refs entries must be one-line references');
  }
  if (evidenceRefs.some(hasLineBreak)) {
    referenceShapeErrors.push('evidence_refs entries must be one-line references');
  }
  if (hasLineBreak(resolvedNextAction)) {
    referenceShapeErrors.push('next_action must be a one-line consumer action');
  }
  if (resolvedFreshness !== null && hasLineBreak(resolvedFreshness)) {
    referenceShapeErrors.push('current_HEAD_or_diff must be a one-line fingerprint');
  }
  if (referenceShapeErrors.length > 0) {
    const error = new Error(`portable handoff blocked: ${referenceShapeErrors.join('; ')}`);
    error.code = 'ERR_INVALID_PORTABLE_HANDOFF_ENVELOPE';
    throw error;
  }

  const requiredFields = CONSUMER_REQUIRED_FIELDS[contextType][consumer];
  const authoritative = pickPaths(normalizedContext, requiredFields);
  const embeddedAuthoritativePath = findForbiddenEmbeddedArtifact(authoritative);
  if (embeddedAuthoritativePath) {
    const error = new Error(
      `portable handoff blocked: authoritative contains embedded artifact body at ${embeddedAuthoritativePath}`
    );
    error.code = 'ERR_EMBEDDED_ARTIFACT_BODY';
    throw error;
  }
  return {
    schema_version: 1,
    kind: 'portable-handoff',
    context_type: contextType,
    next_consumer: consumer,
    next_action: resolvedNextAction,
    current_HEAD_or_diff: resolvedFreshness,
    authoritative,
    artifact_refs: cloneArray(artifactRefs),
    evidence_refs: cloneArray(evidenceRefs),
    state_delta: cloneValue(stateDelta),
    redaction_applied: resolvedRedaction,
  };
}

export function projectRuntimeContext({
  contextType,
  context,
  consumer,
  capabilityStatus = 'unknown',
  projection = {},
  profile,
  fullContextRequested = false,
  nextAction,
  currentHeadOrDiff,
  artifactRefs,
  evidenceRefs,
  stateDelta,
  redactionApplied,
} = {}) {
  const errors = validateRequiredHandoffFields({ contextType, consumer, context });
  if (errors.length > 0) {
    const error = new Error(`runtime context projection blocked: ${errors.join('; ')}`);
    error.code = 'ERR_INCOMPLETE_RUNTIME_CONTEXT';
    throw error;
  }

  const normalizedContext = normalizeCompatibilityInput(contextType, context).context;

  const resolvedStatus = CAPABILITY_STATUSES.has(capabilityStatus) ? capabilityStatus : 'unknown';
  assertNoEmbeddedArtifactBody(projection, 'user projection');
  const userProjection = elideEmptySections(cloneValue(projection));
  const portableHandoff = resolvedStatus === 'supported'
    ? null
    : buildPortableHandoff({
        contextType,
        context: normalizedContext,
        consumer,
        nextAction,
        currentHeadOrDiff,
        artifactRefs,
        evidenceRefs,
        stateDelta,
        redactionApplied,
      });

  return {
    handoff_mode: resolvedStatus === 'supported'
      ? 'runtime-context-channel'
      : 'portable-handoff',
    profile: fullContextRequested
      ? 'detailed'
      : (PROFILES.has(profile) ? profile : 'compact'),
    authoritative_context: cloneValue(normalizedContext),
    user_projection: userProjection,
    portable_handoff: portableHandoff,
    full_context: fullContextRequested ? cloneValue(normalizedContext) : null,
  };
}

export function selectRelatedArtifacts({
  artifacts = [],
  query = {},
  purpose = 'dependency',
} = {}) {
  const candidates = artifacts
    .map((artifact) => {
      const relation = artifactRelation(artifact, query);
      return relation ? { artifact, ...relation } : null;
    })
    .filter(Boolean)
    .sort((left, right) => (
      left.priority - right.priority ||
      compareApprovedAt(right.artifact, left.artifact) ||
      String(left.artifact.path).localeCompare(String(right.artifact.path))
    ));

  if (candidates.length > 0) {
    const selected = candidates[0];
    return [{
      ...cloneValue(selected.artifact),
      relation: selected.relation,
      load: purpose === 'style' ? 'frontmatter-and-headings' : 'body',
    }];
  }

  const template = artifacts
    .filter((artifact) => artifact.artifact_kind === 'canonical-template')
    .sort((left, right) => String(left.path).localeCompare(String(right.path)))[0];
  return template
    ? [{ ...cloneValue(template), relation: 'canonical-template', load: 'canonical-template' }]
    : [];
}

export function renderUserProjection(projection = {}, {
  profile = 'compact',
  fullContext = null,
} = {}) {
  const normalizedProfile = PROFILES.has(profile) ? profile : 'compact';
  assertNoEmbeddedArtifactBody(projection, 'user projection');
  const value = elideEmptySections(cloneValue(projection));
  const lines = [];

  if (value.outcome !== undefined) lines.push(String(value.outcome));
  if (value.status !== undefined) lines.push(`Status: ${formatScalar(value.status)}`);

  appendSection(lines, 'Blockers', value.blockers);
  appendSection(lines, 'Changed', value.changed_paths);
  appendSection(lines, 'Verified', value.verification);
  appendSection(lines, 'Findings', value.findings);
  appendSection(lines, 'Evidence', value.evidence);
  appendSection(lines, 'Risks', value.risks);
  appendSection(lines, 'Skipped checks', value.skipped_checks);

  if (normalizedProfile !== 'compact') {
    appendSection(lines, 'Details', value.details);
  }
  if (normalizedProfile === 'detailed') {
    appendSection(lines, 'Rationale', value.rationale);
    appendSection(lines, 'Consequences', value.consequences);
    appendSection(lines, 'Recovery', value.recovery);
    appendSection(lines, 'Approval scope', value.approval_scope);
    appendSection(lines, 'Acceptance criteria', value.acceptance_criteria);
    appendSection(lines, 'Non-goals', value.non_goals);
    appendNumberedSection(lines, 'Options', value.options);
  }

  if (value.next_action !== undefined) lines.push(`Next action: ${formatScalar(value.next_action)}`);
  if (value.next_decision !== undefined) lines.push(`Required decision: ${formatScalar(value.next_decision)}`);

  if (fullContext !== null && fullContext !== undefined) {
    lines.push('Full context', '```json', JSON.stringify(fullContext, null, 2), '```');
  }
  return lines.join('\n\n').trim();
}

export function auditRenderedProjection({
  projection = {},
  rendered = '',
  profile = 'compact',
  commonOnly = false,
} = {}) {
  const normalizedProfile = PROFILES.has(profile) ? profile : 'compact';
  const value = elideEmptySections(cloneValue(projection));
  const fields = [...COMMON_PROJECTION_FIELDS];
  if (!commonOnly && normalizedProfile !== 'compact') fields.push(...STANDARD_PROJECTION_FIELDS);
  if (!commonOnly && normalizedProfile === 'detailed') fields.push(...DETAILED_PROJECTION_FIELDS);

  const missing = [];
  let required = 0;
  let preserved = 0;
  for (const field of fields) {
    if (isEmpty(value[field])) continue;
    const segment = renderedProjectionSegment(rendered, field);
    const expectations = projectionLeafExpectations(value[field], field);
    required += expectations.length;
    if (segment === null) {
      missing.push(`${field}: missing rendered field`);
      continue;
    }
    for (const expectation of expectations) {
      if (segment.includes(expectation.value)) preserved += 1;
      else missing.push(`${expectation.path}: missing exact rendered value ${expectation.value}`);
    }
  }

  return {
    required,
    preserved,
    missing,
    parity: missing.length === 0 && preserved === required,
  };
}

export function measureText(text) {
  const input = String(text ?? '');
  const semantic = input.replace(/\s+/g, ' ').trim();
  return {
    utf8_bytes: Buffer.byteLength(input, 'utf8'),
    semantic_bytes: Buffer.byteLength(semantic, 'utf8'),
    lines: input.length === 0 ? 0 : input.split(/\r?\n/).length,
    words: input.match(/\S+/g)?.length ?? 0,
  };
}

export function measureRepeatedBlockBytes(messages = []) {
  const counts = new Map();
  for (const message of messages) {
    const blocks = new Set(
      String(message ?? '')
        .split(/\r?\n\s*\r?\n/)
        .map((block) => block.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
    );
    for (const block of blocks) counts.set(block, (counts.get(block) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .reduce(
      (total, [block, count]) => total + (Buffer.byteLength(block, 'utf8') * (count - 1)),
      0
    );
}

function normalizeRequestedProfile(value) {
  if (value === 'full-context') return 'detailed';
  return PROFILES.has(value) ? value : null;
}

function artifactRelation(artifact, query) {
  if (sameDefinedValue(artifact.contract_id, query.contract_id)) {
    return { priority: 0, relation: 'same-contract-id' };
  }
  if (sameDefinedValue(artifact.change_ref, query.change_ref)) {
    return { priority: 1, relation: 'same-change-ref' };
  }
  const supersedes = [
    ...(Array.isArray(query.supersedes) ? query.supersedes : [query.supersedes]),
    query.path,
  ].filter(Boolean);
  if (
    supersedes.includes(artifact.path) ||
    (artifact.supersedes && [query.path, ...supersedes].includes(artifact.supersedes))
  ) {
    return { priority: 2, relation: 'supersedes' };
  }
  if (sameDefinedValue(artifact.requirement_id, query.requirement_id)) {
    return { priority: 3, relation: 'same-requirement' };
  }
  if (sameDefinedValue(artifact.module, query.module)) {
    return { priority: 4, relation: 'same-module' };
  }
  if ((query.user_selected_paths ?? []).includes(artifact.path) || artifact.user_selected === true) {
    return { priority: 5, relation: 'user-selected' };
  }
  return null;
}

function compareApprovedAt(left, right) {
  return String(left.approved_at ?? '').localeCompare(String(right.approved_at ?? ''));
}

function sameDefinedValue(left, right) {
  return left !== undefined && left !== null && left !== '' &&
    right !== undefined && right !== null && right !== '' &&
    left === right;
}

function appendSection(lines, heading, value) {
  if (isEmpty(value)) return;
  lines.push(heading);
  if (Array.isArray(value)) {
    for (const item of value) lines.push(`- ${formatEntry(item)}`);
    return;
  }
  lines.push(formatEntry(value));
}

function appendNumberedSection(lines, heading, value) {
  if (isEmpty(value)) return;
  lines.push(heading);
  const options = Array.isArray(value) ? value : [value];
  options.forEach((option, index) => lines.push(`${index + 1}. ${formatEntry(option)}`));
}

function renderedProjectionSegment(rendered, field) {
  const text = String(rendered ?? '');
  const blocks = text.split(/\r?\n\s*\r?\n/).map((block) => block.trim()).filter(Boolean);
  if (field === 'outcome') return blocks[0] ?? null;
  if (field === 'status') return blocks.find((block) => block.startsWith('Status: ')) ?? null;
  if (field === 'next_action') {
    return blocks.find((block) => block.startsWith('Next action: ')) ?? null;
  }
  if (field === 'next_decision') {
    return blocks.find((block) => block.startsWith('Required decision: ')) ?? null;
  }

  const heading = PROJECTION_SECTION_HEADINGS[field];
  const start = blocks.indexOf(heading);
  if (start < 0) return null;
  const headings = new Set(Object.values(PROJECTION_SECTION_HEADINGS));
  let end = blocks.length;
  for (let index = start + 1; index < blocks.length; index += 1) {
    if (
      headings.has(blocks[index]) ||
      blocks[index].startsWith('Status: ') ||
      blocks[index].startsWith('Next action: ') ||
      blocks[index].startsWith('Required decision: ') ||
      blocks[index] === 'Full context'
    ) {
      end = index;
      break;
    }
  }
  return blocks.slice(start + 1, end).join('\n\n');
}

function projectionLeafExpectations(value, path) {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => projectionLeafExpectations(item, `${path}[${index}]`));
  }
  if (isPlainObject(value)) {
    return Object.entries(value)
      .flatMap(([key, item]) => projectionLeafExpectations(item, `${path}.${key}`));
  }
  return [{ path, value: formatScalar(value) }];
}

function formatEntry(value) {
  if (!isPlainObject(value)) return formatScalar(value);
  return Object.entries(value)
    .map(([key, item]) => `${key}: ${formatScalar(item)}`)
    .join('; ');
}

function formatScalar(value) {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (Array.isArray(value) || isPlainObject(value)) return JSON.stringify(value);
  return String(value);
}

function elideEmptySections(value) {
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => !isEmpty(item))
      .map(([key, item]) => [key, item])
  );
}

function isEmpty(value) {
  return value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (isPlainObject(value) && Object.keys(value).length === 0);
}

function hasPath(object, dottedPath) {
  let cursor = object;
  for (const part of dottedPath.split('.')) {
    if (!isPlainObject(cursor) || !Object.hasOwn(cursor, part)) return false;
    cursor = cursor[part];
  }
  return cursor !== undefined && cursor !== null;
}

function normalizeCompatibilityInput(contextType, context) {
  if (!isPlainObject(context)) return { context, errors: [] };
  const normalized = cloneValue(context);
  const errors = [];
  for (const [legacyField, canonicalField] of Object.entries(
    CONTEXT_INPUT_ALIASES[contextType] ?? {},
  )) {
    if (!Object.hasOwn(normalized, legacyField)) continue;
    if (
      Object.hasOwn(normalized, canonicalField) &&
      !isDeepStrictEqual(normalized[canonicalField], normalized[legacyField])
    ) {
      errors.push(
        `${contextType} conflicting legacy alias ${legacyField} and canonical field ${canonicalField}`,
      );
      continue;
    }
    normalized[canonicalField] ??= normalized[legacyField];
    delete normalized[legacyField];
  }
  return { context: normalized, errors };
}

function validateRequiredFieldValue(contextType, field, value) {
  const kind = CONSUMER_REQUIRED_FIELD_KINDS[contextType]?.[field] ?? 'scalar';
  const kindError = validateFieldKind(kind, value);
  if (kindError) return kindError;

  const fieldName = field.split('.').at(-1);
  if (APPROVED_ARTIFACT_IDENTITY_FIELDS.has(fieldName) && typeof value !== 'string') {
    return 'must be a non-empty string';
  }
  if (
    kind === 'array' &&
    NON_EMPTY_REQUIRED_ARRAYS.has(`${contextType}.${field}`) &&
    value.length === 0
  ) {
    return 'must not be an empty array';
  }
  if (field === 'schema_version' && (!Number.isInteger(value) || value < 1)) {
    return 'must be a positive integer';
  }

  if ((contextType === 'spec_context' || contextType === 'plan_context') && field === 'approval') {
    if (!isPlainObject(value)) return 'must be an approval object';
    if (value.approved !== true) return 'must record approved: true';
    if (typeof value.approved_at !== 'string' || value.approved_at.trim() === '') {
      return 'must record a non-empty approved_at value';
    }
  }

  if (contextType === 'test_status') {
    if (field === 'blockers') return null;
    if (!TEST_STATUS_ENUMS[field]?.has(value)) return 'contains an unknown lifecycle status';
  }

  if (contextType === 'test_evidence') {
    if (field.startsWith('status.')) {
      const statusField = field.split('.').at(-1);
      if (!TEST_STATUS_ENUMS[statusField]?.has(value)) {
        return 'contains an unknown lifecycle status';
      }
    }
    if (field === 'redactions_applied' && value !== true) return 'must record true';
  }

  if (contextType === 'parallel_context') {
    if (field === 'schema_version' || field === 'source') return null;
  }

  return null;
}

function validateFieldKind(kind, value) {
  if (kind === 'nullable-scalar' && value === null) return null;
  if (kind === 'nullable-object') {
    if (value === null) return null;
    if (!isPlainObject(value)) return 'must be null or an object';
    return Object.keys(value).length > 0 ? null : 'must not be an empty object';
  }
  if (kind === 'array') return Array.isArray(value) ? null : 'must be an array';
  if (kind === 'object') {
    if (!isPlainObject(value)) return 'must be an object';
    return Object.keys(value).length > 0 ? null : 'must not be an empty object';
  }
  if (kind === 'number') {
    return typeof value === 'number' && Number.isFinite(value) ? null : 'must be a finite number';
  }
  if (kind === 'boolean') return typeof value === 'boolean' ? null : 'must be a boolean';
  if (kind === 'reference-or-object') {
    if (isPlainObject(value)) {
      return Object.keys(value).length > 0 ? null : 'must not be an empty object';
    }
    return typeof value === 'string' && value.trim() !== ''
      ? null
      : 'must be a non-empty reference or object';
  }
  return ['string', 'number', 'boolean'].includes(typeof value) &&
    !(typeof value === 'string' && value.trim() === '')
    ? null
    : 'must be a non-empty scalar';
}

function validateContextSemantics(contextType, consumer, context) {
  const errors = [];
  if (contextType === 'test_context' && context.redaction_applied !== true) {
    errors.push(`${contextType} invalid required field for ${consumer}: redaction_applied must record true`);
  }
  if (contextType === 'test_status' && context.result === 'pass') {
    if (context.execution !== 'executed') {
      errors.push(`${contextType} pass requires execution: executed for ${consumer}`);
    }
    if (context.evidence !== 'current') {
      errors.push(`${contextType} pass requires evidence: current for ${consumer}`);
    }
    if (Array.isArray(context.blockers) && context.blockers.length > 0) {
      errors.push(`${contextType} pass cannot retain blockers for ${consumer}`);
    }
  }
  if (contextType === 'test_evidence') {
    errors.push(...validateTestEvidenceSemantics(consumer, context));
  }
  if (contextType === 'parallel_context') {
    errors.push(...validateParallelContextSemantics(consumer, context));
  }
  return errors;
}

function validateTestEvidenceSemantics(consumer, context) {
  const errors = [];
  const pass = context.status?.result === 'pass';

  if (pass && context.schema_version !== 2) {
    errors.push(contextSemanticError(
      'test_evidence',
      consumer,
      'schema_version',
      'must be 2 for a current pass claim'
    ));
  }
  if (pass && (context.status.execution !== 'executed' || context.status.evidence !== 'current')) {
    errors.push(`test_evidence pass requires executed current evidence for ${consumer}`);
  }

  if (Array.isArray(context.runs)) {
    if (pass && context.runs.length === 0) {
      errors.push(`test_evidence pass requires at least one run for ${consumer}`);
    }
    context.runs.forEach((run, index) => {
      const prefix = `runs[${index}]`;
      if (!isPlainObject(run)) {
        errors.push(contextSemanticError('test_evidence', consumer, prefix, 'must be an object'));
        return;
      }
      for (const field of ['run_id', 'command', 'cwd', 'output_digest']) {
        if (!isNonEmptyString(run[field])) {
          errors.push(contextSemanticError(
            'test_evidence',
            consumer,
            `${prefix}.${field}`,
            'must be a non-empty string'
          ));
        }
      }
      if (!Number.isInteger(run.exit_code)) {
        errors.push(contextSemanticError(
          'test_evidence',
          consumer,
          `${prefix}.exit_code`,
          'must be an integer'
        ));
      }
      if (run.redactions_applied !== true) {
        errors.push(contextSemanticError(
          'test_evidence',
          consumer,
          `${prefix}.redactions_applied`,
          'must record true'
        ));
      }
      if (typeof run.stale !== 'boolean') {
        errors.push(contextSemanticError(
          'test_evidence',
          consumer,
          `${prefix}.stale`,
          'must be a boolean freshness verdict'
        ));
      }
      if (typeof run.interrupted !== 'boolean') {
        errors.push(contextSemanticError(
          'test_evidence',
          consumer,
          `${prefix}.interrupted`,
          'must be a boolean'
        ));
      }
      if (pass && run.exit_code !== 0) {
        errors.push(contextSemanticError(
          'test_evidence',
          consumer,
          `${prefix}.exit_code`,
          'must be 0 for a pass claim'
        ));
      }
      if (pass && run.stale !== false) {
        errors.push(contextSemanticError(
          'test_evidence',
          consumer,
          `${prefix}.stale`,
          'must be false for current pass evidence'
        ));
      }
      if (pass && run.interrupted !== false) {
        errors.push(contextSemanticError(
          'test_evidence',
          consumer,
          `${prefix}.interrupted`,
          'must be false for a pass claim'
        ));
      }
    });
  }

  if (Object.hasOwn(context, 'data_lifecycle') && isPlainObject(context.data_lifecycle)) {
    for (const field of ['setup_status', 'cleanup_status', 'residual_data_risk']) {
      if (!isNonEmptyString(context.data_lifecycle[field])) {
        errors.push(contextSemanticError(
          'test_evidence',
          consumer,
          `data_lifecycle.${field}`,
          'must be a non-empty string'
        ));
      }
    }
    if (
      pass &&
      ['failed', 'blocked', 'pending', 'unknown'].includes(
        String(context.data_lifecycle.cleanup_status ?? '').toLowerCase()
      )
    ) {
      errors.push(contextSemanticError(
        'test_evidence',
        consumer,
        'data_lifecycle.cleanup_status',
        'cannot retain incomplete or failed cleanup for a pass claim'
      ));
    }
  }

  if (pass && Array.isArray(context.commands_skipped) && context.commands_skipped.length > 0) {
    errors.push(`test_evidence pass cannot retain skipped commands for ${consumer}`);
  }
  if (pass && Array.isArray(context.blockers) && context.blockers.length > 0) {
    errors.push(`test_evidence pass cannot retain blockers for ${consumer}`);
  }
  return errors;
}

function validateParallelContextSemantics(consumer, context) {
  const errors = [];
  if (context.schema_version !== 2) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      'schema_version',
      'must be 2'
    ));
  }
  if (context.source !== 'sdcorejs-parallel-dispatch') {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      'source',
      'must be sdcorejs-parallel-dispatch'
    ));
  }

  try {
    for (const error of validateDispatchContext(context)) {
      errors.push(contextSemanticError('parallel_context', consumer, 'contract', error));
    }
  }
  catch {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      'contract',
      'contains malformed dispatch state'
    ));
  }

  validateObjectStrings(
    errors,
    'parallel_context',
    consumer,
    'target',
    context.target,
    ['repo_root', 'target_root', 'target_root_kind', 'track', 'stack_profile']
  );
  validateObjectStrings(
    errors,
    'parallel_context',
    consumer,
    'working_tree',
    context.working_tree,
    ['repo_root', 'current_branch', 'current_head', 'status_snapshot_hash', 'dirty_diff_hash']
  );
  validateObjectArrays(
    errors,
    'parallel_context',
    consumer,
    'working_tree',
    context.working_tree,
    [
      'staged_paths',
      'unstaged_paths',
      'untracked_paths',
      'unrelated_dirty_paths',
      'intended_output_paths',
    ]
  );

  validateObjectStrings(
    errors,
    'parallel_context',
    consumer,
    'runtime_capabilities',
    context.runtime_capabilities,
    ['runtime']
  );
  validateObjectBooleans(
    errors,
    'parallel_context',
    consumer,
    'runtime_capabilities',
    context.runtime_capabilities,
    [
      'supports_subagents',
      'supports_parallel_dispatch',
      'supports_agent_cwd',
      'supports_native_worktree',
      'supports_result_ref',
      'supports_timeout',
      'supports_cancellation',
    ]
  );
  if (!Number.isInteger(context.runtime_capabilities?.effective_max_concurrency) ||
      context.runtime_capabilities.effective_max_concurrency < 1) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      'runtime_capabilities.effective_max_concurrency',
      'must be a positive integer'
    ));
  }

  if (!['READ_ONLY_FANOUT', 'INDEPENDENT_WRITE_UNITS', 'CONTRACT_BOUND_ROLES', 'SEQUENTIAL_DAG']
    .includes(context.topology?.kind)) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      'topology.kind',
      'contains an unknown topology'
    ));
  }
  if (!['SEQUENTIAL', 'PARALLEL-CANDIDATE', 'ROLE-SPLIT'].includes(context.topology?.verdict)) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      'topology.verdict',
      'contains an unknown verdict'
    ));
  }

  validateObjectStrings(
    errors,
    'parallel_context',
    consumer,
    'integration',
    context.integration,
    ['workspace_path', 'branch', 'base_head', 'merge_strategy', 'atomicity']
  );
  validateObjectArrays(
    errors,
    'parallel_context',
    consumer,
    'integration',
    context.integration,
    ['merge_order']
  );

  if (Array.isArray(context.units)) {
    context.units.forEach((unit, index) => {
      validateParallelUnit(errors, consumer, context, unit, index);
    });
  }

  if (!['fail-fast', 'best-effort'].includes(context.failure_policy?.mode)) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      'failure_policy.mode',
      'must be fail-fast or best-effort'
    ));
  }
  for (const field of ['max_attempts', 'timeout_seconds']) {
    if (!Number.isInteger(context.failure_policy?.[field]) || context.failure_policy[field] < 1) {
      errors.push(contextSemanticError(
        'parallel_context',
        consumer,
        `failure_policy.${field}`,
        'must be a positive integer'
      ));
    }
  }
  validateObjectBooleans(
    errors,
    'parallel_context',
    consumer,
    'failure_policy',
    context.failure_policy,
    [
      'cancel_pending_on_blocker',
      'merge_successful_units_on_partial_failure',
      'retry_transient_failures',
      'rollback_on_global_failure',
    ]
  );

  validateObjectArrays(
    errors,
    'parallel_context',
    consumer,
    'redaction',
    context.redaction,
    ['excluded_paths', 'excluded_patterns']
  );
  validateObjectBooleans(
    errors,
    'parallel_context',
    consumer,
    'redaction',
    context.redaction,
    ['secret_scan', 'pii_redacted', 'logs_sanitized']
  );

  validateObjectArrays(
    errors,
    'parallel_context',
    consumer,
    'global_verification',
    context.global_verification,
    ['commands_planned', 'commands_skipped']
  );
  const globalStateFields = ['associated_head_or_diff', 'output_digest'];
  if (consumer === 'sdcorejs-ship') {
    validateObjectStrings(
      errors,
      'parallel_context',
      consumer,
      'global_verification',
      context.global_verification,
      globalStateFields
    );
  }
  else if (isPlainObject(context.global_verification)) {
    for (const field of globalStateFields) {
      if (
        !Object.hasOwn(context.global_verification, field) ||
        !(
          context.global_verification[field] === null ||
          isNonEmptyString(context.global_verification[field])
        )
      ) {
        errors.push(contextSemanticError(
          'parallel_context',
          consumer,
          `global_verification.${field}`,
          'must be null or a non-empty string'
        ));
      }
    }
  }

  for (const field of [
    'verify_before_done',
    'branch_ready_final_gate',
    'no_writes_after_branch_ready',
  ]) {
    if (context.final_tail?.[field] !== true) {
      errors.push(contextSemanticError(
        'parallel_context',
        consumer,
        `final_tail.${field}`,
        'must record true'
      ));
    }
  }
  return errors;
}

function validateParallelUnit(errors, consumer, context, unit, index) {
  const prefix = `units[${index}]`;
  if (!isPlainObject(unit)) {
    errors.push(contextSemanticError('parallel_context', consumer, prefix, 'must be an object'));
    return;
  }
  for (const field of ['id', 'role', 'contract_hash']) {
    if (!isNonEmptyString(unit[field])) {
      errors.push(contextSemanticError(
        'parallel_context',
        consumer,
        `${prefix}.${field}`,
        'must be a non-empty string'
      ));
    }
  }
  if (!Number.isInteger(unit.wave) || unit.wave < 0) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      `${prefix}.wave`,
      'must be a non-negative integer'
    ));
  }
  for (const field of ['depends_on', 'produces', 'consumes']) {
    if (!Array.isArray(unit[field])) {
      errors.push(contextSemanticError(
        'parallel_context',
        consumer,
        `${prefix}.${field}`,
        'must be an array'
      ));
    }
  }
  if (!['PENDING', 'RUNNING', 'PASSED', 'FAILED', 'BLOCKED', 'CANCELLED', 'STALE']
    .includes(unit.status)) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      `${prefix}.status`,
      'contains an unknown unit status'
    ));
  }
  if (!Number.isInteger(unit.attempts) || unit.attempts < 0) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      `${prefix}.attempts`,
      'must be a non-negative integer'
    ));
  }
  if (!isPlainObject(unit.ownership)) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      `${prefix}.ownership`,
      'must be an object'
    ));
  }
  else {
    for (const field of ['allowed_paths', 'prohibited_paths']) {
      if (!Array.isArray(unit.ownership[field])) {
        errors.push(contextSemanticError(
          'parallel_context',
          consumer,
          `${prefix}.ownership.${field}`,
          'must be an array'
        ));
      }
    }
  }
  if (!isPlainObject(unit.result)) {
    errors.push(contextSemanticError(
      'parallel_context',
      consumer,
      `${prefix}.result`,
      'must be an object'
    ));
  }
  else if (unit.status === 'PASSED') {
    for (const error of validateResultIdentity(unit, {
      baseHead: context.integration?.base_head,
      readOnly: context.contract?.source === 'read-only-request',
    })) {
      errors.push(contextSemanticError('parallel_context', consumer, `${prefix}.result`, error));
    }
    if (!Array.isArray(unit.result.changed_paths)) {
      errors.push(contextSemanticError(
        'parallel_context',
        consumer,
        `${prefix}.result.changed_paths`,
        'must be an array'
      ));
    }
    if (!Array.isArray(unit.result.blockers)) {
      errors.push(contextSemanticError(
        'parallel_context',
        consumer,
        `${prefix}.result.blockers`,
        'must be an array'
      ));
    }
  }
}

function validateObjectStrings(errors, contextType, consumer, prefix, object, fields) {
  for (const field of fields) {
    if (!isNonEmptyString(object?.[field])) {
      errors.push(contextSemanticError(
        contextType,
        consumer,
        `${prefix}.${field}`,
        'must be a non-empty string'
      ));
    }
  }
}

function validateObjectArrays(errors, contextType, consumer, prefix, object, fields) {
  for (const field of fields) {
    if (!Array.isArray(object?.[field])) {
      errors.push(contextSemanticError(
        contextType,
        consumer,
        `${prefix}.${field}`,
        'must be an array'
      ));
    }
  }
}

function validateObjectBooleans(errors, contextType, consumer, prefix, object, fields) {
  for (const field of fields) {
    if (typeof object?.[field] !== 'boolean') {
      errors.push(contextSemanticError(
        contextType,
        consumer,
        `${prefix}.${field}`,
        'must be a boolean'
      ));
    }
  }
}

function contextSemanticError(contextType, consumer, field, message) {
  return `${contextType} invalid required field for ${consumer}: ${field} ${message}`;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function pathExists(object, dottedPath) {
  let cursor = object;
  for (const part of dottedPath.split('.')) {
    if (!isPlainObject(cursor) || !Object.hasOwn(cursor, part)) return false;
    cursor = cursor[part];
  }
  return true;
}

function pickPaths(source, paths) {
  const result = {};
  for (const dottedPath of paths) {
    setPath(result, dottedPath, cloneValue(getPath(source, dottedPath)));
  }
  return result;
}

function getPath(source, dottedPath) {
  let cursor = source;
  for (const part of dottedPath.split('.')) cursor = cursor[part];
  return cursor;
}

function setPath(target, dottedPath, value) {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    cursor[part] ??= {};
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = value;
}

function cloneArray(value) {
  return Array.isArray(value) ? value.map(cloneValue) : [];
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  return structuredClone(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function containsForbiddenEmbeddedArtifactFields(value) {
  return findForbiddenEmbeddedArtifact(value) !== null;
}

function findForbiddenEmbeddedArtifact(value, prefix = '') {
  if (typeof value === 'string') {
    const matchedPattern = ARTIFACT_BODY_CONTENT_PATTERNS.find(({ pattern }) => pattern.test(value));
    return matchedPattern
      ? `${prefix || '<root>'} (${matchedPattern.kind})`
      : null;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenEmbeddedArtifact(value[index], `${prefix}[${index}]`);
      if (found) return found;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;
  for (const [key, nested] of Object.entries(value)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (ARTIFACT_BODY_FIELDS.has(key)) return `${currentPath} (body field)`;
    const found = findForbiddenEmbeddedArtifact(nested, currentPath);
    if (found) return found;
  }
  return null;
}

function assertNoEmbeddedArtifactBody(value, label) {
  const embeddedPath = findForbiddenEmbeddedArtifact(value);
  if (!embeddedPath) return;
  const error = new Error(`${label} blocked: embedded artifact body at ${embeddedPath}`);
  error.code = 'ERR_EMBEDDED_ARTIFACT_BODY';
  throw error;
}

function hasLineBreak(value) {
  return typeof value === 'string' && /[\r\n]/.test(value);
}

function inferFreshness(context) {
  for (const path of [
    'current_HEAD_or_diff',
    'associated_HEAD_or_diff',
    'change.associated_HEAD_or_diff',
    'working_tree_preflight.current_HEAD',
    'baseline.diff_scope_hash',
    'baseline.HEAD',
    'current_HEAD',
    'test_evidence_summary.associated_HEAD_or_diff',
    'global_verification.associated_head_or_diff',
    'working_tree.current_head',
  ]) {
    if (hasPath(context, path)) return cloneValue(getPath(context, path));
  }
  return null;
}

function inferRedactionStatus(context) {
  for (const path of [
    'redaction_applied',
    'redactions_applied',
    'secret_redaction.applied',
    'redaction.applied',
  ]) {
    if (hasPath(context, path)) {
      const value = getPath(context, path);
      return typeof value === 'boolean' ? value : 'unknown';
    }
  }
  return 'unknown';
}
