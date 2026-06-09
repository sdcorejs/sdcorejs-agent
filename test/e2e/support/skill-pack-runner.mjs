import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'any',
  'as',
  'at',
  'for',
  'from',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'this',
  'to',
  'with'
]);

const LOCALIZED_ALIASES = new Map([
  ['them', ['add', 'create']],
  ['nut', ['button', 'action']],
  ['don', ['order']],
  ['hang', ['order']],
  ['phan', ['deciding', 'unsure', 'brainstorm']],
  ['van', ['deciding', 'unsure', 'brainstorm']],
  ['giua', ['between', 'compare']],
  ['drawer', ['drawer', 'side-drawer']],
  ['full', ['full', 'page']],
  ['page', ['page']],
  ['detail', ['detail']],
  ['approve', ['approve', 'approval', 'workflow']],
  ['scaffold', ['scaffold', 'bootstrap', 'init']],
  ['backend', ['backend', 'nestjs']]
]);

const SKILL_HINTS = [
  { skill: 'sdcorejs-brainstorm', words: ['brainstorm', 'unsure', 'deciding', 'between', 'compare', 'should'] },
  { skill: 'angular-write-code', words: ['angular', 'portal', 'screen', 'button', 'approve', 'approval', 'bulk', 'export', 'action', 'drawer'] },
  { skill: 'nestjs-write-code', words: ['nestjs', 'backend', 'module', 'entity', 'crud', 'endpoint', 'scaffold'] },
  { skill: 'nextjs-write-code', words: ['nextjs', 'website', 'landing', 'seo', 'sitemap', 'og', 'contact'] },
  { skill: 'sdcorejs-write-user-guide', words: ['user', 'guide', 'documentation', 'manual'] },
  { skill: 'sdcorejs-commit', words: ['commit', 'changes', 'save'] }
];

export async function loadSkillPack(rootUrlOrPath) {
  const root = toPath(rootUrlOrPath);
  const [sourceSkills, claudeMirrorSkills, pluginMirrorSkills, referenceDocs] = await Promise.all([
    readSourceSkills(path.join(root, 'skills')),
    readMirrorSkills(path.join(root, '.claude', 'skills')),
    readMirrorSkills(path.join(root, 'plugin', 'skills')),
    listMarkdownFiles(path.join(root, '_refs'))
  ]);

  const diagnostics = [];
  diagnostics.push(...diagnoseSkills(sourceSkills, 'source'));
  diagnostics.push(...diagnoseMirror(sourceSkills, claudeMirrorSkills, '.claude/skills'));
  diagnostics.push(...diagnoseMirror(sourceSkills, pluginMirrorSkills, 'plugin/skills'));

  return {
    root,
    sourceSkills,
    claudeMirrorSkills,
    pluginMirrorSkills,
    referenceDocs,
    diagnostics
  };
}

export function runPromptEval(pack, cases) {
  return cases.map((item) => {
    const actualSkill = dispatchPrompt(pack, item.prompt)?.name ?? null;
    return {
      id: item.id,
      prompt: item.prompt,
      expectedSkill: item.expectedSkill,
      actualSkill,
      pass: actualSkill === item.expectedSkill
    };
  });
}

export function dispatchPrompt(pack, prompt) {
  const promptTokens = tokenizeWithAliases(prompt);
  const scored = pack.sourceSkills
    .map((skill) => ({
      skill,
      score: scoreSkill(skill, promptTokens)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));

  return scored[0]?.skill ?? null;
}

async function readSourceSkills(root) {
  const files = (await listMarkdownFiles(root)).filter((file) => path.basename(file) !== '_README.md');
  const skills = await Promise.all(files.map(readSkillFile));
  return skills.filter((skill) => skill.name);
}

async function readMirrorSkills(root) {
  const files = await listMarkdownFiles(root);
  const skillFiles = files.filter((file) => path.basename(file) === 'SKILL.md');
  const skills = await Promise.all(skillFiles.map(readSkillFile));
  return skills.filter((skill) => skill.name);
}

async function readSkillFile(file) {
  const text = await readFile(file, 'utf8');
  const frontmatter = parseFrontmatter(text);
  return {
    path: file,
    name: frontmatter.name ?? '',
    description: frontmatter.description ?? '',
    text
  };
}

function parseFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return {};

  const end = normalized.indexOf('\n---', 3);
  if (end === -1) return {};

  const block = normalized.slice(3, end).trim();
  const result = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) result[match[1]] = match[2].trim();
  }
  return result;
}

async function listMarkdownFiles(root) {
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(root, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(entryPath);
      return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
    })
  );
  return nested.flat().sort();
}

function diagnoseSkills(skills, label) {
  const diagnostics = [];
  const seen = new Map();
  for (const skill of skills) {
    if (!skill.description) diagnostics.push(`${label}:${skill.path}: missing description`);
    if (!/^[a-z0-9-]+$/.test(skill.name)) diagnostics.push(`${label}:${skill.path}: non-kebab name ${skill.name}`);
    if (seen.has(skill.name)) diagnostics.push(`${label}:${skill.path}: duplicate name ${skill.name}`);
    seen.set(skill.name, skill.path);
  }
  return diagnostics;
}

function diagnoseMirror(sourceSkills, mirrorSkills, label) {
  const sourceNames = new Set(sourceSkills.map((skill) => skill.name));
  const mirrorNames = new Set(mirrorSkills.map((skill) => skill.name));
  const diagnostics = [];

  for (const name of sourceNames) {
    if (!mirrorNames.has(name)) diagnostics.push(`${label}: missing ${name}`);
  }
  for (const name of mirrorNames) {
    if (!sourceNames.has(name)) diagnostics.push(`${label}: extra ${name}`);
  }
  return diagnostics;
}

function scoreSkill(skill, promptTokens) {
  const searchable = tokenize(`${skill.name} ${skill.description}`);
  let score = 0;
  for (const token of promptTokens) {
    if (searchable.has(token)) score += 1;
  }

  for (const hint of SKILL_HINTS) {
    if (hint.skill !== skill.name) continue;
    for (const word of hint.words) {
      if (promptTokens.has(word)) score += 3;
    }
  }

  return score;
}

function tokenizeWithAliases(text) {
  const tokens = tokenize(text);
  for (const token of [...tokens]) {
    const aliases = LOCALIZED_ALIASES.get(token);
    if (!aliases) continue;
    for (const alias of aliases) tokens.add(alias);
  }
  return tokens;
}

function tokenize(text) {
  const tokens = new Set();
  for (const token of text.toLowerCase().match(/[a-z0-9-]+/g) ?? []) {
    if (!STOP_WORDS.has(token)) tokens.add(token);
  }
  return tokens;
}

function toPath(rootUrlOrPath) {
  if (rootUrlOrPath instanceof URL) return fileURLToPath(rootUrlOrPath);
  return path.resolve(String(rootUrlOrPath));
}
