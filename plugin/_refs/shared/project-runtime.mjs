/** Pure host-observation decision helper. It runs no commands and is not an
 * authority verifier: the host supplies actual session authority, inspected
 * commands and fresh probes, never booleans copied from repository content.
 */
export function decideProjectRuntime({
  action,
  local_target: localTarget = false,
  authority = {},
  command_verified: commandVerified = false,
  prerequisites = 'unknown',
  startup_timeout_ms: startupTimeoutMs,
  observation = {},
} = {}) {
  const result = (status, nextAction, reason) => ({ status, next_action: nextAction, reason, notify_user: true, durable_writes_allowed: false });
  if (!['runtime-check-readonly', 'runtime-start-authorized'].includes(action)) return result('not-required', 'none', 'caller-did-not-request-runtime-work');
  if (localTarget !== true) return result('blocked', 'report', 'local-target-unverified');
  if (observation.fresh !== true) return result('unknown', 'inspect', 'current-runtime-evidence-required');
  if (observation.state === 'running') {
    if (observation.identity === 'mismatch') return result('blocked', 'report', 'listener-belongs-to-another-application');
    if (observation.identity !== 'match') return result('unknown', 'inspect', 'application-identity-unverified');
    if (observation.readiness === 'passed') return result('ready', 'reuse', 'application-identity-and-readiness-verified');
    if (observation.readiness === 'failed') return result('unhealthy', 'diagnose', 'readiness-failed-do-not-restart-unowned-process');
    return result('unknown', 'inspect', 'readiness-unverified');
  }
  if (observation.state === 'failed') return result('failed', 'diagnose', 'startup-failed');
  if (observation.state !== 'not-running') return result('unknown', 'inspect', 'runtime-state-unverified');
  if (observation.coverage !== 'complete') return result('unknown', 'inspect', 'runtime-absence-probe-incomplete');
  if (action === 'runtime-check-readonly') return result('not-running', 'report', 'read-only-request');
  if (authority.local_process !== true || authority.scope_matches !== true || typeof authority.source !== 'string' || !authority.source.trim()) return result('not-running', 'request-authority', 'scoped-session-authority-missing');
  if (commandVerified !== true) return result('blocked', 'inspect', 'startup-command-unverified');
  if (prerequisites !== 'ready') return result('blocked', 'report', 'startup-prerequisites-unresolved');
  if (!Number.isSafeInteger(startupTimeoutMs) || startupTimeoutMs <= 0) return result('blocked', 'inspect', 'whole-startup-deadline-unconfigured');
  return { ...result('not-running', 'start', 'authorized-local-start-required'), startup_timeout_ms: startupTimeoutMs };
}
