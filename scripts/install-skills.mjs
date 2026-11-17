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
       sdcorejs-agent install|uninstall --agent codex|claude-code --scope project|user [--dry-run]`;

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
  if (!['install', 'uninstall'].includes(command) || !['codex', 'claude-code'].includes(agent)
    || !['project', 'user'].includes(scope)) throw new Error(usage);

  const base = realpathSync(scope === 'user' ? homedir() : process.cwd());
  const destination = path.join(base,
    agent === 'codex' ? '.agents' : '.claude', 'skills');
  const sections = [...names, '_refs'];
  const inventories = Object.fromEntries(sections.map(name => [name, inventory(path.join(source, name))]));
  const { version } = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const receipt = `${JSON.stringify({ version, inventories })}\n`;
  const marker = path.join(destination, ownership);

  function plan() {
    const markerEntry = stat(marker);
    if (!markerEntry) {
      if (command === 'uninstall') throw new Error(`No managed installation at ${destination}.`);
      const collisions = sections.filter(name => stat(path.join(destination, name)));
      if (collisions.length) throw new Error(`Existing paths at ${destination}: ${collisions.join(', ')}. Back them up and move them before installing.`);
      return 'install';
    }
    if (!markerEntry.isFile() || readFileSync(marker, 'utf8') !== receipt) {
      throw new Error(`Installation receipt differs at ${marker}. Use the original package version or recover the files manually.`);
    }
    for (const name of sections) {
      const section = path.join(destination, name);
      if (!stat(section)?.isDirectory() || JSON.stringify(inventory(section)) !== JSON.stringify(inventories[name])) {
        throw new Error(`Installed files differ at ${section}. Back up your changes before making any manual edits.`);
      }
    }
    return command === 'install' ? 'already installed' : 'uninstall';
  }

  checkedDirectory(destination);
  const action = plan();
  console.log(`${dryRun ? 'Dry run: ' : ''}${action} ${version} at ${destination}`);
  if (action === 'already installed') return;
  for (const name of [...sections, ownership]) console.log(`  ${name}`);
  if (dryRun) return;

  checkedDirectory(destination, true);
  const lock = path.join(destination, '.sdcorejs-agent.lock');
  mkdirSync(lock);
  try {
    if (plan() !== action) throw new Error('Destination changed. Retry the command.');
    // Keep rollback data on the same filesystem and outside skill discovery.
    const staging = mkdtempSync(path.join(path.dirname(destination), '.sdcorejs-agent-'));
    const moved = [];
    try {
      if (action === 'install') {
        copyPayload(staging, sections, inventories);
        writeFileSync(path.join(staging, ownership), receipt, { flag: 'wx' });
      }
      const from = action === 'install' ? staging : destination;
      const to = action === 'install' ? destination : staging;
      for (const name of [...sections, ownership]) {
        if (stat(path.join(to, name))) throw new Error(`Path appeared: ${path.join(to, name)}`);
        renameSync(path.join(from, name), path.join(to, name));
        moved.push(name);
      }
    } catch (error) {
      try {
        for (const name of moved.reverse()) {
          const from = action === 'install' ? destination : staging;
          const to = action === 'install' ? staging : destination;
          if (stat(path.join(to, name))) throw new Error(`Path appeared: ${path.join(to, name)}`);
          renameSync(path.join(from, name), path.join(to, name));
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
