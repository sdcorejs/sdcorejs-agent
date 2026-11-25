#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import {
  chmodSync, copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync,
  readdirSync, realpathSync, renameSync, rmSync, rmdirSync, writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const source = path.join(packageRoot, 'skills');
const ownership = '.sdcorejs-agent.json';
const usage = `Usage: sdcorejs-agent list
       sdcorejs-agent install|uninstall --agent codex|claude-code|opencode --scope project|user [--dry-run]`;

function stat(file) {
  return lstatSync(file, { throwIfNoEntry: false });
}

function checkedDirectory(directory, create = false) {
  const parent = path.dirname(directory);
  if (parent !== directory) checkedDirectory(parent, create);
  const entry = stat(directory);
  if (!entry && create) mkdirSync(directory);
  if (entry && !entry.isDirectory()) throw new Error(`Expected a real directory: ${directory}`);
}

function inventory(directory, prefix = '') {
  const files = [];
  for (const name of readdirSync(directory).sort()) {
    const relative = prefix ? `${prefix}/${name}` : name;
    const file = path.join(directory, name);
    const entry = lstatSync(file);
    if (entry.isDirectory()) {
      files.push([relative, 'directory'], ...inventory(file, relative));
    } else if (entry.isFile()) {
      files.push([relative, createHash('sha256').update(readFileSync(file)).digest('hex')]);
    } else {
      throw new Error(`Unsupported file type: ${file}`);
    }
  }
  return files;
}

function copyPayload(destination, names, inventories) {
  for (const name of names) {
    mkdirSync(path.join(destination, name));
    for (const [relative, kind] of inventories[name]) {
      const input = path.join(source, name, relative);
      const output = path.join(destination, name, relative);
      if (kind === 'directory') {
        mkdirSync(output);
      } else {
        copyFileSync(input, output, constants.COPYFILE_EXCL);
        chmodSync(output, lstatSync(input).mode & 0o777);
      }
    }
  }
}

function run(args) {
  if (!args.length || args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log(usage);
    return;
  }
  const [command, ...flags] = args;
  const names = readdirSync(source).filter(name => /^sdcorejs-[a-z0-9-]+$/.test(name)).sort();
  if (names.length !== 25 || !names.every(name => stat(path.join(source, name, 'SKILL.md'))?.isFile())) {
    throw new Error('The package must contain all 25 public skills.');
  }
  if (command === 'list' && !flags.length) {
    console.log(names.join('\n'));
    return;
  }

  const { values } = parseArgs({ args: flags, options: {
    agent: { type: 'string' }, scope: { type: 'string' }, 'dry-run': { type: 'boolean' },
  } });
  const { agent, scope, 'dry-run': dryRun } = values;
  if (!['install', 'uninstall'].includes(command) || !['codex', 'claude-code', 'opencode'].includes(agent)
    || !['project', 'user'].includes(scope)) throw new Error(usage);

  const base = realpathSync(scope === 'user' ? homedir() : process.cwd());
  const hostDirectory = { codex: '.agents', 'claude-code': '.claude', opencode: '.opencode' }[agent];
  const hostRoot = path.join(base, hostDirectory);
  const destination = path.join(hostRoot, 'skills');
  const sections = [...names, '_refs'];
  const inventories = Object.fromEntries(sections.map(name => [name, inventory(path.join(source, name))]));
  const { version } = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const marker = path.join(destination, ownership);
  const configNames = ['opencode.json', 'opencode.jsonc'];
  const rule = '.opencode/skills/_refs/simplify/before-writing-code.md';
  const configText = JSON.stringify({
    $schema: 'https://opencode.ai/config.json',
    instructions: [scope === 'user' ? `~/${rule}` : rule],
  }, null, 2) + '\n';

  function receipt(configName) {
    return JSON.stringify(configName ? { version, inventories, configName } : { version, inventories }) + '\n';
  }

  function verifyFiles(directory, config) {
    if (config && (!stat(config)?.isFile() || readFileSync(config, 'utf8') !== configText)) {
      throw new Error(`Managed OpenCode instructions differ at ${config}. Preserve your edits before retrying.`);
    }
    for (const name of sections) {
      const section = path.join(directory, name);
      if (!stat(section)?.isDirectory() || JSON.stringify(inventory(section)) !== JSON.stringify(inventories[name])) {
        throw new Error(`Installed files differ at ${section}. Back up your changes before making any manual edits.`);
      }
    }
  }

  function plan() {
    const markerEntry = stat(marker);
    if (!markerEntry) {
      if (command === 'uninstall') throw new Error(`No managed installation at ${destination}.`);
      const collisions = sections.filter(name => stat(path.join(destination, name)));
      if (collisions.length) throw new Error(`Existing paths at ${destination}: ${collisions.join(', ')}. Back them up and move them before installing.`);
      let configName;
      if (agent === 'opencode') {
        // OpenCode merges both native configuration files with project rules.
        // Claim one unused filename without rewriting consumer-owned JSONC.
        configName = configNames.find(name => !stat(path.join(hostRoot, name)));
        if (!configName) throw new Error(`Both OpenCode configuration files are in use at ${hostRoot}. See the existing-config install option in docs/INSTALLATION.md.`);
      }
      return { action: 'install', configName };
    }
    if (!markerEntry.isFile()) throw new Error(`Expected a regular installation receipt at ${marker}.`);
    const savedReceipt = readFileSync(marker, 'utf8');
    const configName = agent === 'opencode' ? JSON.parse(savedReceipt).configName : undefined;
    if ((agent === 'opencode' && !configNames.includes(configName)) || savedReceipt !== receipt(configName)) {
      throw new Error(`Installation receipt differs at ${marker}. Use the original package version or recover the files manually.`);
    }
    verifyFiles(destination, configName && path.join(hostRoot, configName));
    return { action: command === 'install' ? 'already installed' : 'uninstall', configName };
  }

  checkedDirectory(destination);
  const { action, configName } = plan();
  console.log(`${dryRun ? 'Dry run: ' : ''}${action} ${version} at ${destination}`);
  if (action === 'already installed') return;
  for (const name of [...sections, ownership]) console.log(`  ${name}`);
  if (configName) console.log(`  ${path.join(hostRoot, configName)}`);
  if (dryRun) return;

  checkedDirectory(destination, true);
  const lock = path.join(destination, '.sdcorejs-agent.lock');
  mkdirSync(lock);
  try {
    const current = plan();
    if (current.action !== action || current.configName !== configName) throw new Error('Destination changed. Retry the command.');
    // Keep rollback data on the same filesystem and outside skill discovery.
    const staging = mkdtempSync(path.join(path.dirname(destination), '.sdcorejs-agent-'));
    const moved = [];
    try {
      if (action === 'install') {
        copyPayload(staging, sections, inventories);
        writeFileSync(path.join(staging, ownership), receipt(configName), { flag: 'wx' });
        if (configName) writeFileSync(path.join(staging, configName), configText, { flag: 'wx' });
      }
      const entries = sections.map(name => [path.join(staging, name), path.join(destination, name)]);
      if (configName) entries.push([path.join(staging, configName), path.join(hostRoot, configName)]);
      entries.push([path.join(staging, ownership), marker]);
      for (const [staged, installed] of entries) {
        const [from, to] = action === 'install' ? [staged, installed] : [installed, staged];
        if (stat(to)) throw new Error(`Path appeared: ${to}`);
        if (action === 'install' && configName && installed === path.join(hostRoot, configName)) {
          // Keep project settings created by another editor after plan().
          copyFileSync(from, to, constants.COPYFILE_EXCL);
          moved.push({ from, to, copied: true });
        } else {
          renameSync(from, to);
          moved.push({ from, to });
        }
      }
      if (action === 'uninstall') {
        // An editor may save between the first inventory and the move. Check the
        // actual files in staging while the entire uninstall is still reversible.
        verifyFiles(staging, configName && path.join(staging, configName));
        const stagedMarker = path.join(staging, ownership);
        if (!stat(stagedMarker)?.isFile() || readFileSync(stagedMarker, 'utf8') !== receipt(configName)) {
          throw new Error('Installation receipt changed during uninstall.');
        }
      }
    } catch (error) {
      try {
        for (const { from, to, copied } of moved.reverse()) {
          if (copied) {
            if (!stat(to)?.isFile() || readFileSync(to, 'utf8') !== configText) throw new Error(`Configuration changed: ${to}`);
            rmSync(to);
          } else {
            if (stat(from)) throw new Error(`Path appeared: ${from}`);
            renameSync(to, from);
          }
        }
      } catch {
        throw new Error(`Operation interrupted. Recovery files remain at ${staging}. ${error.message}`);
      }
      rmSync(staging, { recursive: true });
      throw error;
    }
    rmSync(staging, { recursive: true });
  } finally {
    rmdirSync(lock);
  }
}

try {
  run(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
