import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const targetName = args.target ?? 'sdcorejs-golden-app';
const outputRoot = args.root ?? '.tmp';

if (!/^[a-zA-Z0-9_-]+$/.test(targetName)) {
  console.error(`Invalid --target "${targetName}". Use only letters, numbers, dash, and underscore.`);
  process.exit(2);
}

const targetDir = path.join(outputRoot, targetName);

await rm(targetDir, { recursive: true, force: true });
await mkdir(path.join(targetDir, 'e2e'), { recursive: true });

await Promise.all([
  writeFile(path.join(targetDir, 'package.json'), packageJson(targetName)),
  writeFile(path.join(targetDir, 'docker-compose.yml'), dockerCompose()),
  writeFile(path.join(targetDir, 'server.mjs'), server()),
  writeFile(path.join(targetDir, 'playwright.config.mjs'), playwrightConfig()),
  writeFile(path.join(targetDir, 'e2e', 'api.supertest.mjs'), apiSupertest()),
  writeFile(path.join(targetDir, 'e2e', 'ui.playwright.spec.mjs'), uiPlaywright()),
  writeFile(path.join(targetDir, 'README.md'), readme(targetName))
]);

console.log(`Generated golden target app at ${targetDir}`);

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--target') parsed.target = argv[++index];
    else if (arg === '--root') parsed.root = argv[++index];
  }
  return parsed;
}

function packageJson(name) {
  return `${JSON.stringify(
    {
      name,
      private: true,
      type: 'module',
      scripts: {
        'test:api': 'node --test e2e/api.supertest.mjs',
        'test:ui': 'playwright test --config playwright.config.mjs'
      },
      devDependencies: {
        '@playwright/test': '^1.54.0',
        supertest: '^7.1.0'
      }
    },
    null,
    2
  )}\n`;
}

function dockerCompose() {
  return `services:
  app:
    image: node:22-alpine
    working_dir: /app
    command: ["node", "server.mjs"]
    environment:
      PORT: "4310"
    ports:
      - "\${GOLDEN_APP_PORT:-4310}:4310"
    volumes:
      - ./:/app:ro
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:4310/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 5s
      timeout: 3s
      retries: 12
`;
}

function server() {
  return `import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 4310);
const products = [
  { id: 'P-001', name: 'Golden Product', status: 'ACTIVE' },
  { id: 'P-002', name: 'Approval Sample', status: 'PENDING' }
];

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');

  if (url.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok', service: 'sdcorejs-golden-app' });
  }

  if (url.pathname === '/api/products') {
    return sendJson(res, 200, { data: products, total: products.length });
  }

  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(\`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>SDCoreJS Golden App</title>
  </head>
  <body>
    <main data-testid="app-ready">
      <h1>SDCoreJS Golden App</h1>
      <p data-testid="product-count">2 products ready</p>
      <a href="/api/products">Products API</a>
    </main>
  </body>
</html>\`);
    return;
  }

  sendJson(res, 404, { error: 'not_found' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(\`SDCoreJS golden app listening on \${port}\`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}
`;
}

function playwrightConfig() {
  return `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\\.playwright\\.spec\\.mjs/,
  reporter: [['list']],
  use: {
    baseURL: process.env.GOLDEN_APP_URL ?? 'http://127.0.0.1:4310'
  }
});
`;
}

function apiSupertest() {
  return `import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';

const baseURL = process.env.GOLDEN_APP_URL ?? 'http://127.0.0.1:4310';

test('golden API health responds through supertest', async () => {
  const response = await request(baseURL)
    .get('/health')
    .expect(200)
    .expect('Content-Type', /json/);

  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'sdcorejs-golden-app');
});

test('golden API exposes products through supertest', async () => {
  const response = await request(baseURL)
    .get('/api/products')
    .expect(200)
    .expect('Content-Type', /json/);

  assert.equal(response.body.total, 2);
  assert.equal(response.body.data[0].name, 'Golden Product');
});
`;
}

function uiPlaywright() {
  return `import { expect, test } from '@playwright/test';

test('golden UI renders the app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app-ready')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'SDCoreJS Golden App' })).toBeVisible();
  await expect(page.getByTestId('product-count')).toHaveText('2 products ready');
});
`;
}

function readme(name) {
  return `# ${name}

Generated by \`test/e2e/golden/generate-target-app.mjs\`.

This is a tiny golden target-app fixture for the SDCoreJS agent E2E phase 4.
It is intentionally minimal: one Dockerized Node HTTP app, one supertest API smoke,
and one Playwright UI smoke.
`;
}
