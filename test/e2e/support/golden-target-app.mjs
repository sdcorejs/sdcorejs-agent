import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export function buildGoldenTargetAppPlan(options = {}) {
  const targetName = options.targetName ?? 'sdcorejs-golden-app';
  return {
    targetName,
    steps: [
      {
        id: 'generate-target-app',
        command: `node test/e2e/golden/generate-target-app.mjs --target ${targetName}`,
        verifies: 'skill pack can generate the golden Angular + NestJS target app'
      },
      {
        id: 'install-target-deps',
        command: `cd .tmp/${targetName} && npm install`,
        verifies: 'supertest and Playwright dependencies are available for the generated fixture'
      },
      {
        id: 'install-playwright-browser',
        command: `cd .tmp/${targetName} && npx playwright install chromium`,
        verifies: 'Playwright has a browser available for UI smoke tests'
      },
      {
        id: 'docker-compose-up',
        command: `cd .tmp/${targetName} && docker compose up --build -d`,
        verifies: 'generated app boots with Docker'
      },
      {
        id: 'api-supertest',
        command: `cd .tmp/${targetName} && node --test e2e/api.supertest.mjs`,
        verifies: 'generated NestJS API responds through supertest'
      },
      {
        id: 'ui-playwright',
        command: `cd .tmp/${targetName} && npx playwright test --config playwright.config.mjs`,
        verifies: 'generated Angular portal passes browser smoke'
      },
      {
        id: 'docker-compose-down',
        command: `cd .tmp/${targetName} && docker compose down -v`,
        verifies: 'golden stack is cleaned up'
      }
    ]
  };
}

export async function runGoldenTargetAppE2E(options = {}) {
  const enabled = options.enabled ?? process.env.SDCOREJS_E2E_FULL === '1';
  const requiredTools = ['docker', 'playwright', 'supertest'];

  if (!enabled) {
    return {
      status: 'skipped',
      requiredTools,
      reason: 'Set SDCOREJS_E2E_FULL=1 to run Docker/Playwright/supertest golden target-app validation.'
    };
  }

  const plan = buildGoldenTargetAppPlan(options);
  const executor = options.executor ?? defaultExecutor;
  const results = [];

  try {
    for (const step of plan.steps) {
      results.push(await executor(step));
    }
    return { status: 'passed', requiredTools, plan, results };
  } catch (error) {
    return { status: 'failed', requiredTools, plan, results, error };
  }
}

async function defaultExecutor(step) {
  const startedAt = Date.now();
  const { stdout, stderr } = await execAsync(step.command, {
    windowsHide: true,
    timeout: Number(process.env.SDCOREJS_E2E_FULL_TIMEOUT_MS ?? 600000)
  });

  return {
    id: step.id,
    command: step.command,
    durationMs: Date.now() - startedAt,
    stdout,
    stderr
  };
}
