#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { constants as fsConstants } from 'node:fs';
import { access, cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_BEHAVIOR_ENTRYPOINTS,
  validateCapabilityContract,
  validateProviderNeutralText,
} from '../_refs/harness/runtime-policy.mjs';

const mode = parseMode(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsRoot = path.join(repoRoot, 'skills');
const refsRoot = path.join(repoRoot, '_refs');
const capabilityContractFile = path.join(refsRoot, 'harness', 'capability-contract.json');
const systemRegistryFile = path.join(refsRoot, 'shared', 'system-registry.json');
const canonicalBehaviorEntrypointFiles = CANONICAL_BEHAVIOR_ENTRYPOINTS.map(
  (relativePath) => path.join(repoRoot, ...relativePath.split('/'))
);

const claudeSkillRoots = [
  path.join(repoRoot, '.claude', 'skills'),
  path.join(repoRoot, 'plugin', 'skills'),
];
const claudeRefRoots = [
  path.join(repoRoot, '.claude', '_refs'),
  path.join(repoRoot, 'plugin', '_refs'),
];
const codexSkillsRoot = path.join(repoRoot, 'codex', 'skills');
const codexRefsRoot = path.join(codexSkillsRoot, '_refs');
const cursorRuleFile = path.join(repoRoot, '.cursor', 'rules', 'sdcorejs-agent.mdc');
const manifestSpecs = [
  { adapter: 'claude-code', relativePath: '.claude/sdcorejs-harness.json' },
  { adapter: 'claude-code', relativePath: 'plugin/sdcorejs-harness.json' },
  { adapter: 'codex', relativePath: 'codex/sdcorejs-harness.json' },
  { adapter: 'cursor', relativePath: '.cursor/sdcorejs-harness.json' },
  { adapter: 'copilot', relativePath: '.github/sdcorejs-harness.json' },
];

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});

async function main() {
  const workBase = mode === 'check' ? await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-sync-')) : null;
  try {
    const targets = await prepareTargets(workBase);
    const kept = new Set();
    let count = 0;

    const capabilitySource = await readFile(capabilityContractFile, 'utf8');
    const capabilityContract = JSON.parse(capabilitySource);
    const systemRegistrySource = await readFile(systemRegistryFile, 'utf8');
    const systemRegistry = JSON.parse(systemRegistrySource);
    const contractErrors = validateCapabilityContract(capabilityContract);
    if (contractErrors.length > 0) {
      throw new Error(
        `Harness capability contract is invalid:\n${contractErrors.map((item) => `  - ${item}`).join('\n')}`
      );
    }

    const sourceFiles = await listSourceSkillFiles(skillsRoot);
    const sourceSkills = await loadSourceSkills(sourceFiles);
    await validateSourcePack(sourceSkills, capabilityContract);

    await mirrorRefs(targets);

    for (const skill of sourceSkills) {
      await mirrorClaudeSkill(
        skill,
        targets.claudeSkillRoots,
        capabilityContract.adapters['claude-code']
      );
      await mirrorCodexSkill(skill.text, skill.name, targets.codexSkillsRoot);

      kept.add(skill.name);
      count += 1;
      if (mode === 'sync') {
        console.log(`  ${relative(skill.path)} -> {.claude,plugin,codex}/skills/${skill.name}/SKILL.md`);
      }
    }

    await writeCursorRule(targets.cursorRuleFile);
    await writeHarnessManifests(
      targets.manifestFiles,
      sourceSkills,
      capabilityContract,
      capabilitySource,
      systemRegistry,
      systemRegistrySource
    );

    if (mode === 'check') {
      const drift = await checkMirrors(targets, count);
      if (drift) {
        console.error('\n  Run: npm run sync:skills');
        process.exit(1);
      }
      return;
    }

    if (mode === 'clean') {
      const removed = await cleanStaleSkills([...claudeSkillRoots, codexSkillsRoot], kept);
      console.log(`Cleaned ${removed} stale entry(ies). Each mirror has ${count} active skill(s).`);
      return;
    }

    printSummary(count);
  } finally {
    if (workBase) await rm(workBase, { recursive: true, force: true });
  }
}

function parseMode(args) {
  if (args.length > 1) throw new Error(`Unknown arguments: ${args.join(' ')}`);
  const arg = args[0] ?? '';
  if (arg === '') return 'sync';
  if (arg === '--check') return 'check';
  if (arg === '--clean') return 'clean';
  throw new Error(`Unknown flag: ${arg} (use --check, --clean, or no flag)`);
}

async function prepareTargets(workBase) {
  if (workBase) {
    const targets = {
      claudeSkillRoots: claudeSkillRoots.map((_, index) => path.join(workBase, `claude-skills-${index}`)),
      claudeRefRoots: claudeRefRoots.map((_, index) => path.join(workBase, `claude-refs-${index}`)),
      codexSkillsRoot: path.join(workBase, 'codex-skills'),
      codexRefsRoot: path.join(workBase, 'codex-skills', '_refs'),
      cursorRuleFile: path.join(workBase, 'cursor', 'sdcorejs-agent.mdc'),
      manifestFiles: manifestSpecs.map((spec) => ({
        ...spec,
        expected: path.join(workBase, 'manifests', ...spec.relativePath.split('/')),
        actual: path.join(repoRoot, ...spec.relativePath.split('/')),
      })),
    };
    await Promise.all([
      ...targets.claudeSkillRoots.map(ensureDir),
      ...targets.claudeRefRoots.map(ensureDir),
      ensureDir(targets.codexSkillsRoot),
      ensureDir(path.dirname(targets.cursorRuleFile)),
      ...targets.manifestFiles.map((item) => ensureDir(path.dirname(item.expected))),
    ]);
    return targets;
  }

  await Promise.all([
    ...claudeSkillRoots.map(ensureDir),
    ...claudeRefRoots.map(ensureDir),
    ensureDir(codexSkillsRoot),
    ensureDir(path.dirname(cursorRuleFile)),
  ]);

  return {
    claudeSkillRoots,
    claudeRefRoots,
    codexSkillsRoot,
    codexRefsRoot,
    cursorRuleFile,
    manifestFiles: manifestSpecs.map((spec) => {
      const target = path.join(repoRoot, ...spec.relativePath.split('/'));
      return { ...spec, expected: target, actual: target };
    }),
  };
}

async function mirrorRefs(targets) {
  if (!(await exists(refsRoot))) return;
  for (const refRoot of [...targets.claudeRefRoots, targets.codexRefsRoot]) {
    await rm(refRoot, { recursive: true, force: true });
    await ensureDir(refRoot);
    await cp(refsRoot, refRoot, { recursive: true, force: true });
  }
}

async function mirrorClaudeSkill(skill, roots, adapter) {
  const generated = toClaudeSkill(skill, adapter);
  for (const root of roots) {
    const destDir = path.join(root, skill.name);
    await ensureDir(destDir);
    await writeFile(path.join(destDir, 'SKILL.md'), generated, 'utf8');
  }
}

function toClaudeSkill(skill, adapter) {
  const normalized = skill.text.replace(/^\uFEFF/, '');
  const frontmatterEnd = normalized.indexOf('\n---', 3);
  if (!normalized.startsWith('---') || frontmatterEnd === -1) return withTrailingNewline(normalized);
  const body = normalized.slice(frontmatterEnd + '\n---'.length).replace(/^\r?\n/, '');
  const allowedTools = [...new Set(
    skill.requiredActions.flatMap((action) => adapter.actions[action]?.native ?? [])
  )].sort();
  const toolLine = allowedTools.length > 0 ? `\nallowed-tools: ${allowedTools.join(', ')}` : '';
  return withTrailingNewline(
    `---\nname: ${skill.name}\ndescription: ${skill.description}${toolLine}\n---\n\n` +
    '<!-- claude-adapter: generated from required-actions; do not edit mirror by hand -->\n\n' +
    body
  );
}

async function mirrorCodexSkill(sourceText, name, root) {
  const destDir = path.join(root, name);
  await ensureDir(destDir);
  await writeFile(path.join(destDir, 'SKILL.md'), toCodexSkill(sourceText), 'utf8');
}

function toCodexSkill(sourceText) {
  const normalized = sourceText.replace(/^\uFEFF/, '');
  const frontmatterEnd = normalized.indexOf('\n---', 3);
  if (!normalized.startsWith('---') || frontmatterEnd === -1) return rewriteRefs(normalized);

  const frontmatter = normalized.slice(3, frontmatterEnd).trim();
  const body = normalized.slice(frontmatterEnd + '\n---'.length).replace(/^\r?\n/, '');
  const { name, description } = parseFrontmatterBlock(frontmatter);

  return rewriteRefs(`---\nname: ${name}\ndescription: ${description}\n---\n\n<!-- codex-distribution: generated by sync-skills; do not edit mirror by hand -->\n\n**Codex path resolution:** Resolve \`../_refs/...\` relative to this \`SKILL.md\`. Resolve another SDCoreJS skill by opening the sibling folder \`../<skill-name>/SKILL.md\`.\n\n${body}`);
}

function rewriteRefs(text) {
  return text
    .replace(/(?:\.\.\/)+_refs\//g, '../_refs/')
    .replace(/(^|[^./])_refs\//g, '$1../_refs/');
}

async function writeCursorRule(destFile) {
  const agentsText = await readFile(path.join(repoRoot, 'AGENTS.md'), 'utf8');
  const text = `---\ndescription: SDCoreJS SDLC Agent - Angular, NestJS, and Next.js skill dispatch rules\nalwaysApply: true\n---\n\n<!-- generated by sync-skills from AGENTS.md; do not edit mirror by hand -->\n\n${agentsText}`;
  await ensureDir(path.dirname(destFile));
  await writeFile(destFile, text, 'utf8');
}

async function writeHarnessManifests(
  files,
  sourceSkills,
  contract,
  contractSource,
  systemRegistry,
  systemRegistrySource
) {
  const sourceHash = `sha256:${createHash('sha256').update(contractSource).digest('hex')}`;
  const systemRegistryHash = `sha256:${createHash('sha256')
    .update(systemRegistrySource)
    .digest('hex')}`;
  for (const file of files) {
    const skills = Object.fromEntries(sourceSkills.map((skill) => [
      skill.name,
      {
        source_path: relative(skill.path),
        required_actions: skill.requiredActions,
      },
    ]));
    const adapterPayload = {
      schema_version: 1,
      adapter: file.adapter,
      capabilities: contract.adapters[file.adapter].capabilities,
      actions: contract.adapters[file.adapter].actions,
      system_registry: {
        source_path: '_refs/shared/system-registry.json',
        source_hash: systemRegistryHash,
        tracks: systemRegistry.tracks.map(({ id }) => id),
        aliases: systemRegistry.aliases,
      },
      skills,
    };
    const contentHash = `sha256:${createHash('sha256')
      .update(JSON.stringify(adapterPayload))
      .digest('hex')}`;
    const manifest = {
      schema_version: adapterPayload.schema_version,
      adapter: adapterPayload.adapter,
      source_path: '_refs/harness/capability-contract.json',
      source_hash: sourceHash,
      content_hash: contentHash,
      generated_path: file.relativePath,
      capabilities: adapterPayload.capabilities,
      actions: adapterPayload.actions,
      system_registry: adapterPayload.system_registry,
      skills: adapterPayload.skills,
    };
    await ensureDir(path.dirname(file.expected));
    await writeFile(file.expected, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }
}

async function checkMirrors(targets, count) {
  let drift = false;
  for (let i = 0; i < claudeSkillRoots.length; i += 1) {
    drift = (await checkTree(targets.claudeSkillRoots[i], claudeSkillRoots[i], `${relative(claudeSkillRoots[i])}/`, `${count} source files`)) || drift;
  }
  for (let i = 0; i < claudeRefRoots.length; i += 1) {
    drift = (await checkTree(targets.claudeRefRoots[i], claudeRefRoots[i], `${relative(claudeRefRoots[i])}/`, 'refs')) || drift;
  }
  drift = (await checkTree(targets.codexSkillsRoot, codexSkillsRoot, `${relative(codexSkillsRoot)}/`, `${count} source files + shared _refs`)) || drift;
  drift = (await checkFile(targets.cursorRuleFile, cursorRuleFile, relative(cursorRuleFile))) || drift;
  for (const manifest of targets.manifestFiles) {
    drift = (await checkFile(manifest.expected, manifest.actual, manifest.relativePath)) || drift;
  }
  return drift;
}

async function checkTree(expected, actual, label, detail) {
  const diffs = await diffTrees(expected, actual);
  if (diffs.length === 0) {
    console.log(`OK ${label} is in sync (${detail})`);
    return false;
  }
  console.error(`FAIL ${label} is OUT OF SYNC`);
  for (const diff of diffs.slice(0, 50)) console.error(`  ${diff}`);
  if (diffs.length > 50) console.error(`  ... ${diffs.length - 50} more`);
  return true;
}

async function checkFile(expected, actual, label) {
  const same = await sameFile(expected, actual);
  if (same) {
    console.log(`OK ${label} is in sync`);
    return false;
  }
  console.error(`FAIL ${label} is OUT OF SYNC`);
  return true;
}

async function cleanStaleSkills(roots, kept) {
  let removed = 0;
  for (const root of roots) {
    for (const entry of await readdir(root, { withFileTypes: true }).catch(() => [])) {
      if (!entry.isDirectory()) continue;
      if (entry.name === '_refs') continue;
      if (kept.has(entry.name)) continue;
      await rm(path.join(root, entry.name), { recursive: true, force: true });
      console.log(`  removed stale: ${relative(path.join(root, entry.name))}`);
      removed += 1;
    }
  }
  return removed;
}

async function listSourceSkillFiles(root) {
  const files = await listFiles(root);
  return files
    .filter((file) => file.endsWith('.md'))
    .filter((file) => !path.basename(file).startsWith('_'))
    .filter((file) => !file.includes(`${path.sep}shared${path.sep}templates${path.sep}`))
    .filter((file) => !file.includes(`${path.sep}shared${path.sep}specs${path.sep}`))
    .sort();
}

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath);
    return entry.isFile() ? [entryPath] : [];
  }));
  return nested.flat();
}

async function loadSourceSkills(files) {
  return Promise.all(files.map(async (file) => {
    const text = await readFile(file, 'utf8');
    const frontmatter = parseFrontmatter(text);
    return {
      path: file,
      text,
      name: frontmatter.name ?? '',
      description: frontmatter.description ?? '',
      requiredActions: splitCsv(frontmatter['required-actions']),
      frontmatter,
    };
  }));
}

async function validateSourcePack(skills, capabilityContract) {
  const diagnostics = [];
  const seenNames = new Map();
  const requiredActions = new Set(capabilityContract.required_actions);

  for (const skill of skills) {
    diagnostics.push(...validateSourceSkill(skill, seenNames, requiredActions));
  }

  diagnostics.push(...await validateReferencedRefs(skills));
  diagnostics.push(...await validateProviderToolLeakage(skills));

  if (diagnostics.length > 0) {
    throw new Error(`Skill pack validation failed:\n${diagnostics.map((item) => `  - ${item}`).join('\n')}`);
  }
}

function validateSourceSkill(skill, seenNames, requiredActions) {
  const diagnostics = [];
  const allowedSourceKeys = new Set(['name', 'description', 'required-actions']);
  const label = relative(skill.path);

  diagnostics.push(...skill.frontmatter.__errors.map((error) => `${label}: ${error}`));

  for (const key of skill.frontmatter.__keys) {
    if (!allowedSourceKeys.has(key)) diagnostics.push(`${label}: unsupported frontmatter key '${key}'`);
  }

  if (!skill.name) {
    diagnostics.push(`${label}: missing required 'name' frontmatter`);
  } else if (!/^sdcorejs-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name)) {
    diagnostics.push(`${label}: invalid skill name '${skill.name}' (expected sdcorejs-kebab-case)`);
  } else if (seenNames.has(skill.name)) {
    diagnostics.push(`${label}: duplicate skill name '${skill.name}' also used by ${relative(seenNames.get(skill.name))}`);
  } else {
    seenNames.set(skill.name, skill.path);
  }

  if (!skill.description) {
    diagnostics.push(`${label}: missing required 'description' frontmatter`);
  }
  if (skill.requiredActions.length === 0) {
    diagnostics.push(`${label}: missing required 'required-actions' frontmatter`);
  }
  for (const action of skill.requiredActions) {
    if (!requiredActions.has(action)) {
      diagnostics.push(`${label}: unknown required action '${action}'`);
    }
  }

  return diagnostics;
}

async function validateProviderToolLeakage(skills) {
  const diagnostics = [];
  const files = [
    ...skills.map((skill) => skill.path),
    ...await listRefValidationFiles(),
    ...canonicalBehaviorEntrypointFiles,
  ].filter((file) => {
    const rel = relative(file);
    return (
      rel !== '_refs/harness/capability-contract.json' &&
      rel !== '_refs/harness/adapter-compatibility.md'
    );
  });
  await Promise.all(files.map(async (file) => {
    const text = await readFile(file, 'utf8');
    diagnostics.push(...validateProviderNeutralText(text, relative(file)));
  }));
  return diagnostics.sort();
}

async function validateReferencedRefs(skills) {
  const files = [
    ...skills.map((skill) => skill.path),
    ...await listRefValidationFiles(),
  ];
  const diagnostics = [];

  await Promise.all(files.map(async (file) => {
    const text = await readFile(file, 'utf8');
    for (const ref of findExactRefPaths(text)) {
      const resolved = path.join(repoRoot, ref);
      if (!(await exists(resolved))) {
        diagnostics.push(`${relative(file)}: unresolved reference '${ref}'`);
      }
    }
  }));

  return diagnostics.sort();
}

async function listRefValidationFiles() {
  if (!(await exists(refsRoot))) return [];
  const files = await listFiles(refsRoot);
  return files.filter((file) => {
    if (file.endsWith('.md') || file.endsWith('.mjs') || file.endsWith('.js')) return true;
    if (file.endsWith('.json') || file.endsWith('.yml') || file.endsWith('.yaml')) return true;
    if (file.endsWith('.sh') || file.endsWith('.ps1')) return true;
    return path.basename(file).includes('Dockerfile');
  });
}

function findExactRefPaths(text) {
  const refs = new Set();
  const pattern = /(?:^|[\s([{"'`])((?:\.\.\/)*_refs\/[A-Za-z0-9_./{}<>*?,-]+(?:\.json|\.ya?ml|\.mjs|\.js|\.md|\.sh|\.ps1|Dockerfile))/g;
  for (const match of text.matchAll(pattern)) {
    const ref = match[1].replace(/^(?:\.\.\/)+/, '');
    if (/[{}<>*?]/.test(ref)) continue;
    refs.add(ref);
  }
  return refs;
}

function parseFrontmatter(text) {
  const parsed = readFrontmatter(text);
  return {
    ...parsed.data,
    __keys: parsed.keys,
    __errors: parsed.errors,
  };
}

function parseFrontmatterBlock(block) {
  return readFrontmatter(`---\n${block}\n---\n`).data;
}

function splitCsv(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '');
  const result = {
    data: {},
    keys: [],
    errors: [],
  };

  if (!normalized.startsWith('---\n') && !normalized.startsWith('---\r\n')) {
    result.errors.push("missing opening '---' frontmatter delimiter");
    return result;
  }

  const end = normalized.indexOf('\n---', 3);
  if (end === -1) {
    result.errors.push("missing closing '---' frontmatter delimiter");
    return result;
  }

  const block = normalized.slice(3, end).trim();
  if (!block) {
    result.errors.push('frontmatter block is empty');
    return result;
  }

  const lines = block.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (!match) {
      result.errors.push(`unsupported frontmatter line ${index + 1}: ${line}`);
      continue;
    }

    const [, key, value] = match;
    if (Object.hasOwn(result.data, key)) {
      result.errors.push(`duplicate frontmatter key '${key}'`);
      continue;
    }

    const rawValue = value.trim();
    if (isBlockScalarMarker(rawValue)) {
      const folded = [];
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) {
        index += 1;
        folded.push(lines[index].trim());
      }
      result.data[key] = folded.join(rawValue.startsWith('>') ? ' ' : '\n').trim();
      result.keys.push(key);
      continue;
    }

    if (hasYamlMappingColon(rawValue) && !isQuotedScalar(rawValue)) {
      result.errors.push(`frontmatter line ${index + 1} contains an unquoted mapping colon: ${line}`);
      continue;
    }

    result.data[key] = rawValue;
    result.keys.push(key);
  }

  return result;
}

function isBlockScalarMarker(value) {
  return /^[>|][+-]?$/.test(value);
}

function isQuotedScalar(value) {
  if (value.length < 2) return false;
  const quote = value[0];
  return (quote === '"' || quote === "'") && value.endsWith(quote);
}

function hasYamlMappingColon(value) {
  return /:\s/.test(value);
}

async function diffTrees(expectedRoot, actualRoot) {
  const [expectedFiles, actualFiles] = await Promise.all([
    listFiles(expectedRoot),
    listFiles(actualRoot),
  ]);
  const expectedRel = new Set(expectedFiles.map((file) => path.relative(expectedRoot, file)));
  const actualRel = new Set(actualFiles.map((file) => path.relative(actualRoot, file)));
  const diffs = [];

  for (const rel of [...expectedRel].sort()) {
    if (!actualRel.has(rel)) {
      diffs.push(`missing ${rel}`);
      continue;
    }
    const same = await sameFile(path.join(expectedRoot, rel), path.join(actualRoot, rel));
    if (!same) diffs.push(`changed ${rel}`);
  }
  for (const rel of [...actualRel].sort()) {
    if (!expectedRel.has(rel)) diffs.push(`extra ${rel}`);
  }
  return diffs;
}

async function sameFile(a, b) {
  try {
    const [left, right] = await Promise.all([readFile(a), readFile(b)]);
    return left.equals(right);
  } catch {
    return false;
  }
}

async function exists(file) {
  try {
    await access(file, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

function relative(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, '/');
}

function withTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`;
}

function printSummary(count) {
  console.log(`Mirrored ${count} skill(s) into:`);
  for (const dest of [...claudeSkillRoots, codexSkillsRoot]) console.log(`  - ${relative(dest)}/`);
  console.log('Mirrored _refs/ tree into:');
  for (const dest of [...claudeRefRoots, codexRefsRoot]) console.log(`  - ${relative(dest)}/`);
  console.log('Mirrored Cursor rule into:');
  console.log(`  - ${relative(cursorRuleFile)}`);
}
