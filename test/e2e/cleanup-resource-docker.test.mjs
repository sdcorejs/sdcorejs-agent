import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { auditResources } from '../../_refs/cleanup/resource-audit.mjs';

const context = process.env.SDCOREJS_CLEANUP_DOCKER_CONTEXT;
test('real Docker audit observes only labelled repository resources and preserves active/data resources', {
  skip: !context && 'Select an existing SDCOREJS_CLEANUP_DOCKER_CONTEXT; no daemon is started.', timeout: 120000,
}, async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-resource-docker-'));
  const repository = `cleanup-e2e-${randomUUID()}`, containers = []; let image, volume;
  const docker = (...args) => execFileSync('docker', ['--context', context, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }).trim();
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const label = ['--label', `io.sdcorejs.repository-id=${repository}`, '--label', `io.sdcorejs.task-id=${repository}`];
  try {
    git('init', '-b', 'main'); git('config', 'user.email', 'fixture@example.invalid'); git('config', 'user.name', 'Fixture');
    await writeFile(path.join(root, 'README'), 'fixture'); git('add', 'README'); git('commit', '-m', 'fixture');
    // Shared base is intentionally retained; native fixture teardown owns only
    // exact resources created below. Tests never call global prune.
    docker('image', 'inspect', '--format', '{{.Id}}', 'busybox:1.37.0');
    const stopped = docker('container', 'create', ...label, '--env', 'SYNTHETIC_SECRET=do-not-report-this-value', 'busybox:1.37.0', 'true'); containers.push(stopped);
    const active = docker('container', 'run', '--detach', ...label, 'busybox:1.37.0', 'sleep', '300'); containers.push(active);
    const unrelated = docker('container', 'create', 'busybox:1.37.0', 'true'); containers.push(unrelated);
    image = docker('container', 'commit', '--change', `LABEL io.sdcorejs.repository-id=${repository}`, stopped);
    const imageConsumer = docker('container', 'create', ...label, image, 'true'); containers.push(imageConsumer);
    volume = docker('volume', 'create', ...label, `${repository}-data`);
    const report = await auditResources({ root, target_ref: 'refs/heads/main', docker_context: context, repository_id: repository, max_seconds: 60 });
    assert.equal(report.docker.status, 'observed');
    assert.equal(report.coverage, 'complete');
    assert.equal(report.mutation_authorized, false);
    assert.equal(report.findings.find(f => f.identity === stopped).status, 'review');
    assert.equal(report.findings.find(f => f.identity === active).status, 'held');
    assert.equal(report.findings.find(f => f.identity === image)?.status, 'held', JSON.stringify({ image, report }));
    assert.equal(report.findings.find(f => f.identity === volume).status, 'held');
    assert.ok(!report.findings.some(f => f.identity === unrelated));
    assert.ok(!JSON.stringify(report).includes('do-not-report-this-value'));
    for (const id of containers) assert.equal(docker('container', 'inspect', '--format', '{{.Id}}', id), id);
    assert.equal(docker('container', 'inspect', '--format', '{{.State.Running}}', active), 'true');
    assert.equal(docker('volume', 'inspect', '--format', '{{.Name}}', volume), volume);
    assert.ok(report.findings.filter(f => f.kind.startsWith('docker-')).every(f => f.ownership === 'unknown'));
  } finally {
    for (const id of containers.reverse()) docker('container', 'rm', '--force', id);
    if (image) docker('image', 'rm', image);
    if (volume) docker('volume', 'rm', volume);
    await rm(root, { recursive: true, force: true });
  }
});
