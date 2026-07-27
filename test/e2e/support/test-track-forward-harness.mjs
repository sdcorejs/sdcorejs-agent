import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function exists(root, relativePath) {
  return access(join(root, relativePath)).then(() => true, () => false);
}

async function readJson(root, relativePath) {
  return JSON.parse(await readFile(join(root, relativePath), 'utf8'));
}

async function findPackage(root) {
  if (await exists(root, 'package.json')) return readJson(root, 'package.json');
  if (await exists(root, 'frontend/package.json')) return readJson(root, 'frontend/package.json');
  if (await exists(root, 'backend/package.json')) return readJson(root, 'backend/package.json');
  return {};
}

function dependencies(pkg) {
  return { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
}

async function discoverPackageManager(root) {
  const markers = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
    ['package-lock.json', 'npm'],
    ['npm-shrinkwrap.json', 'npm'],
  ];
  for (const [marker, manager] of markers) {
    if (await exists(root, marker)) return manager;
  }

  const nestedManagers = new Set();
  for (const directory of ['frontend', 'backend']) {
    for (const [marker, manager] of markers) {
      if (await exists(root, `${directory}/${marker}`)) nestedManagers.add(manager);
    }
  }
  if (nestedManagers.size === 1) return [...nestedManagers][0];
  return nestedManagers.size > 1 ? 'ambiguous' : 'unknown';
}

function commandForScript(packageManager, scriptName) {
  if (!scriptName || ['unknown', 'ambiguous'].includes(packageManager)) return null;
  if (packageManager === 'npm' && scriptName === 'test') return 'npm test';
  if (packageManager === 'npm') return `npm run ${scriptName}`;
  return `${packageManager} run ${scriptName}`;
}

async function classifyRepository(root, pkg) {
  if (
    await exists(root, 'frontend/package.json') &&
    await exists(root, 'backend/package.json') &&
    await exists(root, 'test/e2e/checkout.spec.ts')
  ) return 'multi-project';
  if (pkg.workspaces) return 'monorepo';
  return 'single-app';
}

async function classifyStack(root, deps) {
  if (deps['@angular/core']) {
    if (deps['@sdcorejs/angular']) return 'core-ui-angular';
    if (deps['@sd-angular/core']) return 'legacy-core-ui-angular';
    return 'plain-angular';
  }
  if (deps['@nestjs/core']) {
    const hasSdcorejs = Object.keys(deps).some((name) => name.startsWith('@sdcorejs/'));
    return hasSdcorejs ? 'sdcorejs-nestjs' : 'plain-nestjs';
  }
  if (deps.next) return 'plain-nextjs';
  if (deps.react && deps.vite) return 'react-vite';
  if (deps.react && deps['react-scripts']) return 'react-cra';
  return 'general';
}

async function discoverRunner(root, pkg, deps, packageManager) {
  if (
    await exists(root, 'requirements.txt') &&
    await exists(root, 'Projects/Portal/Tests/login.robot')
  ) {
    return { runnerName: 'robotframework', command: null };
  }
  if (await exists(root, 'go.mod')) {
    return {
      runnerName: 'go',
      command: await exists(root, 'Makefile') ? 'make test' : 'go test ./...',
    };
  }

  const scripts = pkg.scripts ?? {};
  const playwrightScript = Object.entries(scripts)
    .find(([, body]) => /playwright/i.test(body))?.[0] ?? null;
  if (playwrightScript || deps['@playwright/test']) {
    return {
      runnerName: 'playwright',
      command: commandForScript(packageManager, playwrightScript),
      commandSource: playwrightScript ? `package.json#scripts.${playwrightScript}` : null,
    };
  }
  const scriptName = scripts.test ? 'test' : scripts['test:e2e'] ? 'test:e2e' : null;
  const script = scriptName ? scripts[scriptName] : '';
  if (/vitest/i.test(script)) {
    return {
      runnerName: 'vitest',
      command: commandForScript(packageManager, scriptName),
      commandSource: `package.json#scripts.${scriptName}`,
    };
  }
  if (/jest/i.test(script)) {
    return {
      runnerName: 'jest',
      command: commandForScript(packageManager, scriptName),
      commandSource: `package.json#scripts.${scriptName}`,
    };
  }
  if (/\bng\s+test\b/i.test(script)) {
    return {
      runnerName: 'angular',
      command: commandForScript(packageManager, scriptName),
      commandSource: `package.json#scripts.${scriptName}`,
    };
  }
  if (/node\s+--test/i.test(script)) {
    return {
      runnerName: 'node-test',
      command: commandForScript(packageManager, scriptName),
      commandSource: `package.json#scripts.${scriptName}`,
    };
  }
  return { runnerName: 'unknown', command: null, commandSource: null };
}

async function discoverPersonaCatalog(root) {
  if (!await exists(root, 'e2e/config/personas.json')) return null;
  return readJson(root, 'e2e/config/personas.json');
}

function selectedPersonaState(catalog, request, environmentId) {
  const personaIds = request.personas ?? [];
  const envKeys = new Set(request.envKeys ?? []);
  const blockers = [];
  const storageStates = [];
  const credentialSources = [];
  const environment = catalog?.environments?.[environmentId];

  if (environment?.baseUrlEnv && !envKeys.has(environment.baseUrlEnv)) {
    blockers.push(`missing:${environment.baseUrlEnv}`);
  }

  for (const personaId of personaIds) {
    const persona = catalog?.personas?.[personaId];
    if (!persona) {
      blockers.push(`missing-persona:${personaId}`);
      continue;
    }
    const source = persona.credentialSource;
    credentialSources.push({
      persona_id: personaId,
      type: source?.type ?? 'unknown',
      usernameRef: source?.usernameRef ?? null,
      passwordRef: source?.passwordRef ?? null,
    });
    for (const ref of [source?.usernameRef, source?.passwordRef].filter(Boolean)) {
      if (!envKeys.has(ref)) blockers.push(`missing:${ref}`);
    }
    storageStates.push({
      persona_id: personaId,
      path: `test-results/auth/${environmentId}/${persona.storageStateId ?? personaId}.json`,
      classification: 'local_only',
    });
  }
  return { personaIds, credentialSources, storageStates, blockers, environment };
}

function loadedRefs(stackProfile, runnerName, action) {
  const refs = [
    '_refs/shared/testing-philosophy.md',
    '_refs/shared/test-command-discovery.md',
    '_refs/shared/test-environment-guard.md',
    '_refs/shared/test-context.md',
    '_refs/shared/test-scope-and-coverage.md',
    '_refs/shared/test-auth-personas.md',
    '_refs/shared/test-data-lifecycle.md',
  ];
  if (['core-ui-angular', 'legacy-core-ui-angular'].includes(stackProfile)) {
    refs.push('_refs/angular/test-e2e.md');
  } else {
    refs.push('_refs/shared/test-generic.md');
  }
  if (runnerName === 'robotframework') refs.push('_refs/angular/e2e-robot-conventions.md');
  if (runnerName === 'playwright') refs.push('_refs/shared/test-playwright.md');
  if (action === 'ui-evidence-capture') refs.push('_refs/shared/test-ui-evidence.md');
  return refs;
}

function captureArtifacts(request, head, runnerName, command) {
  const requiredWithChange = [];
  const localOnly = [];
  const capture = request.capture;
  if (!capture) {
    return {
      requiredWithChange,
      localOnly,
      blockers: [],
      uiCaptureContext: null,
    };
  }

  const authRequired = request.authRequired ?? (request.personas?.length > 0);
  const authProvenance = request.authProvenance ?? (authRequired ? 'unknown' : 'not-applicable');
  const personaId = request.personas?.[0] ?? null;
  const image = capture.image ?? {};
  const invalidPageReasons = new Set([
    'login-redirect',
    'access-denied',
    'blank-page',
    'mockup',
    'placeholder',
  ]);
  const blockers = [];
  if (capture.result !== 'verified') blockers.push(capture.reason ?? 'capture-not-verified');
  if (authRequired && !['real-ui', 'manual-real-ui'].includes(authProvenance)) {
    blockers.push('capture-auth-provenance-unverified');
  }
  if (authRequired && !personaId) blockers.push('capture-persona-unresolved');
  if (invalidPageReasons.has(capture.reason)) blockers.push(`capture-${capture.reason}`);
  if (capture.targetStateAsserted !== true) blockers.push('capture-target-state-unverified');
  if (capture.loadingComplete !== true) blockers.push('capture-loading-incomplete');
  if (capture.pii !== false) blockers.push('capture-pii-screening-unverified');
  if (capture.redactionsApplied !== true) blockers.push('capture-redaction-unverified');
  if (!capture.guidePath || capture.referencedByChangedGuide !== true) {
    blockers.push('capture-guide-relationship-unverified');
  }
  if (
    image.exists !== true ||
    image.nonEmpty !== true ||
    image.decodable !== true ||
    !/^[a-f0-9]{64}$/i.test(image.sha256 ?? '') ||
    !Number.isInteger(image.width) ||
    image.width <= 0 ||
    !Number.isInteger(image.height) ||
    image.height <= 0
  ) {
    blockers.push('capture-image-invalid');
  }
  if (!runnerName || runnerName === 'unknown') blockers.push('capture-runner-unresolved');
  if (!command) blockers.push('capture-command-unresolved');

  const safe = blockers.length === 0;
  const item = {
    artifact_id: `capture:${capture.path}`,
    kind: safe ? 'documentation-asset' : 'diagnostic',
    path: capture.path,
    reason: safe
      ? 'verified current capture referenced by the changed guide'
      : blockers[0],
  };
  if (safe) requiredWithChange.push(item);
  else localOnly.push(item);
  return {
    requiredWithChange,
    localOnly,
    blockers,
    uiCaptureContext: {
      schema_version: 1,
      capture_id: `capture:${capture.path}`,
      change_ref: 'fixture-change',
      guide_path: capture.guidePath ?? null,
      scenario_id: capture.scenarioId ?? null,
      source_test_ref: capture.sourceTestRef ?? null,
      associated_HEAD_or_diff: head,
      environment: {
        environment_id: request.environment ?? 'local',
        class: request.environment ?? 'local',
        base_url_source: 'E2E_BASE_URL',
      },
      persona: {
        persona_id: personaId,
        auth_provenance: authProvenance,
        storage_state_id: personaId,
      },
      runner: runnerName,
      target: {
        route_or_state: capture.routeOrState ?? 'fixture-target-state',
        viewport: { width: image.width ?? null, height: image.height ?? null },
        locale: null,
        theme: null,
        selector_or_region: 'main',
      },
      assertions: {
        login_redirect_absent: capture.reason !== 'login-redirect',
        access_denied_absent: capture.reason !== 'access-denied',
        target_state_visible: capture.targetStateAsserted === true,
        loading_complete: capture.loadingComplete === true,
        pii_screening: capture.pii === false ? 'pass' : 'fail',
      },
      image: {
        file: capture.path,
        sha256: image.sha256 ?? null,
        width: image.width ?? null,
        height: image.height ?? null,
        kind: safe ? 'documentation' : 'diagnostic',
      },
      redactions_applied: capture.redactionsApplied === true,
      classification: safe ? 'documentation' : 'diagnostic',
      result: safe ? 'verified' : 'blocked',
      blocker: safe ? null : blockers[0],
    },
  };
}

export async function projectTestFixture(root, request) {
  const pkg = await findPackage(root);
  const deps = dependencies(pkg);
  const packageManager = await discoverPackageManager(root);
  const repositoryKind = await classifyRepository(root, pkg);
  const stackProfile = await classifyStack(root, deps);
  const { runnerName, command, commandSource } = await discoverRunner(
    root,
    pkg,
    deps,
    packageManager,
  );
  const environmentId = request.environment ?? 'local';
  const catalog = await discoverPersonaCatalog(root);
  const personaState = selectedPersonaState(catalog, request, environmentId);
  const authControls = new Set((request.authControls ?? []).map((item) => item.toLowerCase()));
  const manualAuth = ['sso', 'mfa', 'captcha', 'vpn'].some((item) => authControls.has(item));
  const authRequired = request.authRequired ?? (request.personas?.length > 0);
  const stateChanging = request.stateChanging === true;
  const production = environmentId === 'prod' || environmentId === 'production';
  const staging = environmentId === 'staging';
  const unknownEnvironment = environmentId === 'unknown';
  const environmentBlockers = [];
  let writePolicy = catalog?.environments?.[environmentId]?.writePolicy ?? 'isolated-only';
  if (production) writePolicy = 'read-only';
  if (staging) writePolicy = 'read-only';
  if (unknownEnvironment) writePolicy = 'blocked';
  if (staging && stateChanging) environmentBlockers.push('staging-write-not-approved');
  if (production && stateChanging) environmentBlockers.push('production-write-forbidden');
  if (production && !request.explicitProductionSmoke) environmentBlockers.push('production-smoke-not-approved');
  if (unknownEnvironment && stateChanging) environmentBlockers.push('unknown-environment-write-forbidden');

  const authBlockers = [...personaState.blockers];
  if (authRequired && personaState.personaIds.length === 0) {
    authBlockers.push('missing-auth-persona');
  }
  if (manualAuth) authBlockers.push('interactive-auth-control');
  const commandRequired = ['run-only', 'write-and-run', 'tdd-red', 'tdd-cycle', 'ui-evidence-capture']
    .includes(request.action);
  const commandBlockers = commandRequired && !command ? ['test-command-unresolved'] : [];
  const capture = captureArtifacts(request, 'fixture-diff', runnerName, command);
  const blockers = [
    ...environmentBlockers,
    ...authBlockers,
    ...commandBlockers,
    ...capture.blockers,
  ];

  let owner = 'project';
  if (repositoryKind === 'multi-project' && request.level === 'browser-e2e') owner = 'shared-test-project';
  else if (repositoryKind === 'monorepo' && request.level === 'browser-e2e') owner = 'portal';
  else if (deps['@nestjs/core']) owner = 'backend-service';

  let dataStrategy = stateChanging ? 'existing-helper' : 'read-only';
  if (await exists(root, 'test/helpers/test-db.ts')) dataStrategy = 'test-database';

  const refsLoaded = loadedRefs(stackProfile, runnerName, request.action);
  const executionCommands = command ? [command] : [];
  const result = blockers.length ? 'blocked' : 'unknown';
  const context = {
    schema_version: 2,
    source: 'sdcorejs-test',
    change: {
      change_ref: 'fixture-change',
      source_spec: null,
      source_plan: null,
      associated_HEAD_or_diff: 'fixture-diff',
    },
    classification: {
      test_action: request.action,
      stack_profile: stackProfile,
      repository_kind: repositoryKind,
    },
    scope: {
      owner,
      target_paths: request.targetModules ?? [],
      test_levels: [request.level],
      requirement_refs: [],
      exclusions: [],
    },
    runner: {
      runner_name: runnerName,
      package_manager: Object.keys(pkg).length ? packageManager : 'not-applicable',
      config_paths: [],
      command_sources: commandSource ? [commandSource] : [],
      refs_loaded: refsLoaded,
      assumptions: [],
    },
    environment: {
      environment_id: environmentId,
      class: environmentId,
      base_url_source: catalog?.environments?.[environmentId]?.baseUrlEnv ?? null,
      write_policy: writePolicy,
      blockers: environmentBlockers,
    },
    auth: {
      required: authRequired,
      discovery_status: !authRequired
        ? 'not-applicable'
        : authBlockers.length ? 'blocked' : 'resolved',
      login_mode: manualAuth ? 'manual-real-ui' : authRequired ? 'real-ui' : 'not-applicable',
      persona_ids: personaState.personaIds,
      credential_sources: personaState.credentialSources,
      storage_states: personaState.storageStates,
      blockers: authBlockers,
    },
    data: {
      strategy: dataStrategy,
      records_owned_by_run: [],
      ownership_filter: stateChanging ? 'fixture-run-id' : null,
      cleanup_required: stateChanging,
    },
    execution: {
      working_directory: root,
      commands_planned: executionCommands,
      commands_run: [],
      commands_skipped: blockers.length ? executionCommands : [],
      write_paths_planned: [],
      local_artifact_paths: [],
    },
    coverage_matrix: [],
    redaction_applied: true,
  };

  return {
    test_context: context,
    test_status: {
      planning: 'planned',
      authoring: ['write-tests', 'write-and-run', 'tdd-red', 'tdd-cycle'].includes(request.action)
        ? 'not-written'
        : 'not-requested',
      executability: blockers.length ? 'blocked' : 'ready',
      execution: 'not-run',
      result,
      evidence: 'absent',
      documentation: request.action === 'ui-evidence-capture'
        ? blockers.length ? 'blocked' : 'verified'
        : 'not-requested',
      blockers,
    },
    test_evidence: {
      schema_version: 2,
      source: 'sdcorejs-test',
      change_ref: 'fixture-change',
      associated_HEAD_or_diff: 'fixture-diff',
      status: {
        planning: 'planned',
        authoring: 'not-requested',
        executability: blockers.length ? 'blocked' : 'ready',
        execution: 'not-run',
        result,
        evidence: 'absent',
        documentation: request.action === 'ui-evidence-capture'
          ? blockers.length ? 'blocked' : 'verified'
          : 'not-requested',
      },
      runs: [],
      cases: [],
      captures: capture.uiCaptureContext ? [capture.uiCaptureContext] : [],
      data_lifecycle: {
        setup_status: 'not-run',
        cleanup_status: 'not-run',
        residual_data_risk: stateChanging ? 'unknown' : 'none',
      },
      commands_skipped: blockers.length ? executionCommands : [],
      blockers,
      residual_risks: [],
      redactions_applied: true,
    },
    artifact_context: {
      schema_version: 1,
      change_ref: 'fixture-change',
      source_spec: null,
      source_plan: null,
      required_with_change: capture.requiredWithChange,
      shared_owned: [],
      conditional: [],
      local_only: capture.localOnly,
      unrelated_observed: [],
    },
    ownership: {
      shared_config_writers: repositoryKind === 'monorepo' ? 1 : 0,
      auth_setup_writers: request.personas?.length ? 1 : 0,
      shared_artifact_writers: request.parallel ? 1 : 0,
      worker_prohibited_paths: request.parallel ? ['playwright.config.ts'] : [],
    },
    ui_capture_context: capture.uiCaptureContext,
    legacy_evidence: request.legacyEvidence
      ? { readable: true, fresh: false, source_schema_version: 1 }
      : null,
  };
}
