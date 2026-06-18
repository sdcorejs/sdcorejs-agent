#!/usr/bin/env node
import { constants as fsConstants } from 'node:fs';
import { access, cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mode = parseMode(process.argv.slice(2));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsRoot = path.join(repoRoot, 'skills');
const refsRoot = path.join(repoRoot, '_refs');

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

const responseStyleBlock = `
<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: \`[thing] [action] [reason]. [next step].\`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
`;

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

    await mirrorRefs(targets);

    const sourceFiles = await listSourceSkillFiles(skillsRoot);
    for (const sourceFile of sourceFiles) {
      const sourceText = await readFile(sourceFile, 'utf8');
      const { name } = parseFrontmatter(sourceText);
      if (!name) {
        console.error(`WARN: no 'name:' frontmatter in ${sourceFile} - skipping`);
        continue;
      }
      if (/^<.*>$/.test(name)) {
        if (mode === 'sync') console.log(`  skip template: ${relative(sourceFile)} (name=${name})`);
        continue;
      }

      await mirrorClaudeSkill(sourceFile, sourceText, name, targets.claudeSkillRoots);
      await mirrorCodexSkill(sourceText, name, targets.codexSkillsRoot);

      kept.add(name);
      count += 1;
      if (mode === 'sync') {
        console.log(`  ${relative(sourceFile)} -> {.claude,plugin,codex}/skills/${name}/SKILL.md`);
      }
    }

    await writeCursorRule(targets.cursorRuleFile);

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
    };
    await Promise.all([
      ...targets.claudeSkillRoots.map(ensureDir),
      ...targets.claudeRefRoots.map(ensureDir),
      ensureDir(targets.codexSkillsRoot),
      ensureDir(path.dirname(targets.cursorRuleFile)),
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

async function mirrorClaudeSkill(sourceFile, sourceText, name, roots) {
  for (const root of roots) {
    const destDir = path.join(root, name);
    await ensureDir(destDir);
    await writeFile(path.join(destDir, 'SKILL.md'), `${withTrailingNewline(sourceText)}\n${responseStyleBlock.trim()}\n`, 'utf8');
  }
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

function parseFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return {};
  const end = normalized.indexOf('\n---', 3);
  if (end === -1) return {};
  return parseFrontmatterBlock(normalized.slice(3, end).trim());
}

function parseFrontmatterBlock(block) {
  const result = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) result[match[1]] = match[2].trim();
  }
  return result;
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
