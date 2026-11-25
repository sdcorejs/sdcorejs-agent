import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, realpathSync, watch } from 'node:fs';
import { copyFile, cp, lstat, mkdir, readdir, readFile, readlink, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const suiteRoot = fileURLToPath(new URL('.', import.meta.url));
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function isTestFile(file) {
  if (!/\.[cm]?[jt]sx?$/.test(file)) return false;
  const name = path.basename(file, path.extname(file));
  return /(?:^|\/)(?:test|tests)\//.test(file) || /^(?:test|test-.+)$|[._-](?:test|spec)$/.test(name);
}
export async function fileHash(file) {
  const hash = createHash('sha256');
  for await (const part of createReadStream(file)) hash.update(part);
  return hash.digest('hex');
}

export async function inventory(root, prefix = '') {
  const entries = Object.create(null);
  for (const item of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    if (!prefix && (item.name === '.git' || item.name === '.agents')) {
      if (!item.isDirectory()) entries[item.name] = 'non-regular:protected root';
      continue;
    }
    const rel = path.join(prefix, item.name);
    const filename = path.join(root, rel);
    const mode = ((await lstat(filename)).mode & 0o777).toString(8);
    if (item.isDirectory()) {
      entries[rel] = 'directory:' + mode;
      Object.assign(entries, await inventory(root, rel));
    } else if (item.isFile()) entries[rel] = 'file:' + mode + ':' + await fileHash(filename);
    else entries[rel] = 'non-regular:' + (item.isSymbolicLink() ? await readlink(filename) : mode);
  }
  return entries;
}

// Inspect the stopped guest's tree without following candidate links. Both pinned
// repositories and the synthetic fixtures start with regular files and directories.
export function unsafeEntries(entries) {
  return Object.keys(entries).filter(name => entries[name].startsWith('non-regular:')).sort();
}

export const automaticRule = 'Before editing production code, trace callers and tests';

export function catalogDescription(skill) {
  const frontmatter = skill.split(/^---\s*$/m)[1];
  const description = frontmatter?.match(/^description: (.+)$/m)?.[1].trim();
  if (!description || !/^name: sdcorejs-simplify$/m.test(frontmatter)) throw Error('Missing installed Simplify catalog entry');
  return description;
}

export async function isolateInstalledSkill(agents, target) {
  for (const name of ['sdcorejs-simplify', '_refs']) {
    await cp(path.join(agents, 'skills', name), path.join(target, 'skills', name), { recursive:true });
  }
  const bundled = path.join(target, 'skills/sdcorejs-simplify');
  const refs = path.join(target, 'skills/_refs');
  const skill = await readFile(path.join(bundled, 'SKILL.md'), 'utf8');
  for (const [,link] of skill.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    const resource = path.resolve(bundled, link);
    if (![bundled, refs].some(root => resource.startsWith(root + path.sep))) throw Error('Out-of-pack resource: ' + link);
    await readFile(resource);
  }
  return { description:catalogDescription(skill), bundled, refs };
}

export async function installComparisonSkill(cli, root, target) {
  const help = execFileSync(process.execPath, [cli,'--help'], {encoding:'utf8'});
  const native = /\bopencode\b/.test(help);
  const agent = native ? 'opencode' : 'codex';
  const hostDirectory = native ? '.opencode' : '.agents';
  execFileSync(process.execPath,[cli,'install','--agent',agent,'--scope','project'],{cwd:root});
  const host = path.join(root,hostDirectory);
  const entry = await isolateInstalledSkill(host,target);
  const config = native && ['opencode.json','opencode.jsonc'].find(file => existsSync(path.join(host,file)));
  if (native && !config) throw Error('Native OpenCode installation omitted its configuration');
  if (config) await copyFile(path.join(host,config),path.join(target,config));
  const beforeCode = await readFile(path.join(entry.refs,'simplify/before-writing-code.md'),'utf8').catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  return {...entry, root:target, hostDirectory, config, beforeCode, mode:native ? 'opencode-project' : 'codex-project-compatibility'};
}

async function projectSkillMount(project, temp, install, hostDependencies) {
  // Existing callers can still supply an installed .agents directory.
  const {root,hostDirectory,config} = typeof install === 'string' ? {root:install,hostDirectory:'.agents'} : install;
  const original = path.join(project,hostDirectory);
  const previous = await lstat(original).catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (previous && (!previous.isDirectory() || unsafeEntries(await inventory(original)).length)) {
    throw Error('Unsafe project host configuration: '+hostDirectory);
  }
  const created = !previous;
  await mkdir(original,{recursive:true});
  const merged = path.join(temp,'project-host');
  await cp(original,merged,{recursive:true});
  const sources = await readdir(path.join(root,'skills'));
  for (const name of sources) {
    const destination = path.join(merged,'skills',name);
    if (existsSync(destination)) throw Error('Project already owns installed skill path: '+name);
    await cp(path.join(root,'skills',name),destination,{recursive:true});
  }
  const guest = '/work/'+hostDirectory;
  const mountpoint = created ? hostDirectory : null;
  if (!config) return {mounts:[[merged,guest]],mountpoint};
  const protectedNames = new Set([...await readdir(original),'skills']);
  const configName = [config,...['opencode.json','opencode.jsonc'].filter(n => n !== config)].find(n => !existsSync(path.join(merged,n)));
  if (!configName) throw Error('The project owns both OpenCode configuration files');
  await copyFile(path.join(root,config),path.join(merged,configName));
  protectedNames.add(configName);
  // OpenCode provisions its own .gitignore and package metadata. Give it
  // private writable space and remount the actual project inputs read-only.
  const mounts = [...protectedNames].map(name => [path.join(merged,name),guest+'/'+name]);
  if (hostDependencies && !protectedNames.has('node_modules')) mounts.push([path.join(hostDependencies,'node_modules'),guest+'/node_modules']);
  return {overlay:[merged,guest],mounts,mountpoint};
}

export function deliverySignals(system, description, catalogs = [], beforeCode) {
  const named = system.includes('sdcorejs-simplify');
  const catalog = Boolean(named && description && system.includes(description));
  const listed = catalog || /<name>sdcorejs-simplify<\/name>/.test(system)
    || (named && catalogs.some(entry => system.includes(entry)));
  return { catalog, listed, simplify:system.includes(automaticRule),
    beforeCodeBody:Boolean(beforeCode?.trim() && system.includes(JSON.stringify(beforeCode.trim()).slice(1,-1))),
    ponytail:/PONYTAIL MODE ACTIVE/i.test(system) };
}

export function validArmDelivery(arm, request, fullRuleConfigured = false) {
  if (!request) return false;
  if (arm === 'simplify') return request.catalog && !request.ponytail && (!fullRuleConfigured || request.beforeCodeBody);
  return !request.listed && !request.simplify && !request.beforeCodeBody && request.ponytail === (arm === 'ponytail');
}

export function git(cwd, ...args) {
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', '-C', cwd, ...args], {
    encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' },
  }).trimEnd();
}

export async function sandbox(project, { writable = false, disposable = false, overlay, mounts = [], scratchDirs = [], env = {}, command, timeout, onLine }) {
  const args = ['--unshare-all', '--new-session', '--die-with-parent', '--clearenv', '--ro-bind', '/usr', '/usr'];
  for (const name of ['/bin', '/lib', '/lib64', '/etc/ld.so.cache', '/etc/alternatives', '/etc/fonts', '/etc/ssl/certs']) {
    if (existsSync(name)) args.push('--ro-bind', name, name);
  }
  args.push('--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp', '--dir', '/home/runner', '--dir', '/tools', '--dir', '/runner',
    '--ro-bind', process.execPath, '/tools/node');
  const rg = process.env.SIMPLIFY_RG || '/usr/local/bin/rg';
  if (existsSync(rg)) args.push('--ro-bind', realpathSync(rg), '/tools/rg');
  if (disposable) args.push('--overlay-src', project, '--tmp-overlay', '/work');
  else args.push(writable ? '--bind' : '--ro-bind', project, '/work');
  if (writable) args.push('--ro-bind', path.join(project, '.git'), '/work/.git');
  if (overlay) args.push('--overlay-src', overlay[0], '--tmp-overlay', overlay[1]);
  for (const [from, to] of mounts) args.push('--ro-bind', from, to);
  for (const dir of scratchDirs) args.push('--tmpfs', dir);
  for (const [key, value] of Object.entries({ HOME: '/home/runner', PATH: '/tools:/usr/bin:/bin', PWD: '/work', LANG: 'C.UTF-8', TZ: 'UTC', ...env })) args.push('--setenv', key, value);
  args.push('--chdir', '/work', '--', ...command);
  return new Promise((resolve, reject) => {
    const child = spawn('bwrap', args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', pending = '', timedOut = false;
    let kill;
    function stop() {
      timedOut = true;
      try { process.kill(-child.pid, 'SIGTERM'); } catch {}
      kill = setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }, 3000);
    }
    const timer = setTimeout(stop, timeout * 1000);
    child.stdout.setEncoding('utf8').on('data', data => {
      stdout = (stdout + data).slice(-8 * 1024 * 1024);
      if (!onLine) return;
      pending += data;
      const lines = pending.split('\n');
      pending = lines.pop();
      for (const line of lines) onLine(line);
    });
    child.stderr.setEncoding('utf8').on('data', data => { stderr = (stderr + data).slice(-65536); });
    child.on('error', e => { clearTimeout(timer); reject(e); });
    child.on('close', (code, signal) => {
      clearTimeout(timer); clearTimeout(kill);
      if (onLine && pending) onLine(pending);
      resolve({ code, signal, timedOut, stdout, stderr });
    });
  });
}

// Git consumes candidate filenames and attributes only inside an ephemeral
// namespace. Its temporary index and any mount placeholders stay off the host.
export async function candidateChanges(project) {
  const script = `
    import { git } from '/runner/runtime.mjs';
    git('/work','add','-N','--','.');
    const changed = git('/work','diff','--no-renames','--name-only','-z','HEAD').split('\\0').filter(Boolean);
    const diff = git('/work','diff','--no-ext-diff','--no-textconv','HEAD','--','.');
    console.log(JSON.stringify({changed,diff}));
  `;
  const result = await sandbox(project, { disposable:true, timeout:45,
    mounts:[[path.join(suiteRoot,'comparison-runtime.mjs'),'/runner/runtime.mjs']],
    command:['/tools/node','--input-type=module','--eval',script] });
  if (result.code !== 0 || result.timedOut) throw Error('Candidate diff failed: ' + result.stderr);
  return JSON.parse(result.stdout);
}

// All members of a case/repetition receive the same inference seed.
export async function modelSocket(socketPath, endpoint, prompt, seed, description, catalogs, beforeCode) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (req.method !== 'POST' || !['/v1/chat/completions', '/v1/responses'].includes(req.url)) {
        res.writeHead(404).end(); return;
      }
      const body = JSON.parse(Buffer.concat(chunks));
      body.seed = seed;
      const bytes = Buffer.from(JSON.stringify(body));
      const messages = body.messages || body.input || [];
      const system = JSON.stringify([body.instructions, ...messages.filter(m => ['developer','system'].includes(m.role)), body.tools]);
      const names = (body.tools || []).map(tool => tool.function?.name || tool.name || '');
      const coding = names.some(n => /^(?:functions[._])?(?:bash|read|edit|write|apply_patch)$/.test(n));
      const record = { at: Date.now(), coding, userTask: JSON.stringify(messages).includes(prompt), model: body.model, seed,
        ...deliverySignals(system, description, catalogs, beforeCode), httpStatus: null, completed: false };
      requests.push(record);
      const upstream = http.request(new URL(req.url, endpoint), { method: 'POST', headers: {
        'content-type': 'application/json', 'content-length': bytes.length,
      } }, response => {
        record.httpStatus = response.statusCode;
        response.once('end', () => { record.completed = response.complete; });
        response.on('error', () => res.destroy());
        res.writeHead(response.statusCode, { 'content-type': response.headers['content-type'] || 'application/json' });
        response.pipe(res);
      });
      upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
      res.on('close', () => upstream.destroy());
      upstream.end(bytes);
    } catch { if (!res.headersSent) res.writeHead(400); res.end(); }
  });
  await new Promise((resolve, reject) => server.once('error', reject).listen(socketPath, resolve));
  return { requests, close() { server.closeAllConnections(); server.close(); } };
}

export async function runAgent(project, temp, arm, scenario, settings, installedSkills, output, resources = {}) {
  const configPath = path.join(temp, 'opencode.json');
  const config = {
    enabled_providers: ['localmatrix'], model: 'localmatrix/' + settings.model, small_model: 'localmatrix/' + settings.model,
    share: 'disabled', autoupdate: false, agent: { build: { steps: settings.maxSteps } },
    provider: { localmatrix: { npm: '@ai-sdk/openai-compatible', name: 'Local comparison',
      options: { baseURL: 'http://127.0.0.1:18080/v1', apiKey: 'loopback-only' },
      models: { [settings.model]: { name: settings.model, limit: { context: 32768, output: 4096 } } },
    } },
  };
  const mounts = [[settings.opencode, '/runner/opencode'], [path.join(suiteRoot, 'comparison-guest.mjs'), '/runner/guest.mjs']];
  const hostDependencies = resources.mounts?.find(([,to]) => to === '/home/runner/.config/opencode')?.[0];
  const installation = arm === 'simplify' ? await projectSkillMount(project,temp,installedSkills,hostDependencies) : null;
  if (installation) mounts.push(...installation.mounts);
  if (arm === 'ponytail') {
    mounts.push([settings.ponytail, '/vendor/ponytail']);
    config.plugin = ['file:///vendor/ponytail/.opencode/plugins/ponytail.mjs'];
  }
  await writeFile(configPath, JSON.stringify(config));
  const socketPath = path.join(temp, 'model.sock');
  const proxy = await modelSocket(socketPath, settings.endpoint, scenario.prompt, settings.seed, settings.description, settings.catalogs, settings.beforeCode);
  const events = [];
  const started = Date.now();
  const writes = [];
  let watcher;
  let result;
  try {
    watcher = watch(project, { recursive: true }, (event, file) => {
      if (file && !/^\.git(?:\/|$)/.test(file)) writes.push({ at: Date.now(), event, file });
    });
    result = await sandbox(project, { writable: true, overlay:installation?.overlay, timeout: settings.timeoutSeconds,
      mounts: [...mounts, ...(resources.mounts || []), [configPath, '/runner/opencode.json'], [socketPath, '/runner/model.sock']],
      scratchDirs: resources.scratchDirs,
      env: { OPENCODE_CONFIG: '/runner/opencode.json', OPENCODE_DISABLE_MODELS_FETCH: 'true', OPENCODE_DISABLE_AUTOUPDATE: 'true' },
      command: ['/tools/node', '/runner/guest.mjs', config.model, scenario.prompt],
      onLine(line) { try { events.push(JSON.parse(line)); } catch {} },
    });
  } finally { watcher?.close(); proxy.close(); }
  const elapsedMs = Date.now() - started;
  await writeFile(path.join(output, 'events.jsonl'), events.map(event => JSON.stringify(event)).join('\n')+'\n');
  await writeFile(path.join(output, 'agent.stderr'), result.stderr);
  await writeFile(path.join(output, 'delivery.json'), JSON.stringify(proxy.requests, null, 2));
  return { events, writes, mountpoint:installation?.mountpoint, requests: proxy.requests, started, elapsedMs, exitCode: result.code, timedOut: result.timedOut };
}
