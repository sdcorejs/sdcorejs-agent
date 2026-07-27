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
  ['tao', ['create']],
  ['chay', ['run']],
  ['nop', ['submit']],
  ['sua', ['fix', 'repair', 'resolve']],
  ['loi', ['issue', 'issues', 'finding', 'findings', 'error']],
  ['xay', ['build', 'create']],
  ['dung', ['build', 'create']],
  ['thiet', ['design', 'wireframe', 'mockup']],
  ['ke', ['design', 'wireframe', 'mockup']],
  ['man', ['screen', 'ui']],
  ['hinh', ['screen', 'ui']],
  ['giao', ['ui', 'interface']],
  ['dien', ['ui', 'interface']],
  ['nut', ['button', 'action']],
  ['don', ['order']],
  ['hang', ['order']],
  ['giua', ['between', 'compare']],
  ['drawer', ['drawer', 'side-drawer']],
  ['full', ['full', 'page']],
  ['page', ['page']],
  ['detail', ['detail']],
  ['approve', ['approve', 'approval', 'workflow']],
  ['scaffold', ['scaffold', 'bootstrap', 'init']],
  ['backend', ['backend', 'nestjs']],
  ['viet', ['write']],
  ['ghi', ['write']],
  ['thay', ['changes']],
  ['doi', ['changes']],
  ['mem', ['software', 'app', 'system']],
  ['quan', ['manage', 'management']],
  ['ly', ['manage', 'management']],
  ['lop', ['class', 'classroom']],
  ['hoc', ['school', 'classroom']],
  ['png', ['png', 'preview', 'mockup']],
  ['wireframe', ['wireframe', 'design']],
  ['mockup', ['mockup', 'design']],
  ['kiem', ['check', 'review']],
  ['tra', ['check', 'review']],
  ['dieu', ['investigate']],
  ['tim', ['find', 'root-cause']],
  ['nguyen', ['cause', 'root-cause']],
  ['nhan', ['cause', 'root-cause']],
  ['goc', ['root-cause']],
  ['bao', ['security']],
  ['mat', ['security']],
  ['yeu', ['requirement']],
  ['cau', ['requirement']],
  ['day', ['complete']],
  ['du', ['complete']],
  ['sap', ['upcoming', 'next']],
  ['toi', ['upcoming', 'next']],
  ['vua', ['previous']],
  ['roi', ['previous']],
  ['kien', ['architecture']],
  ['truc', ['architecture']],
  ['huong', ['guide', 'setup']],
  ['dan', ['guide', 'setup']],
  ['lan', ['previous']],
  ['truoc', ['previous', 'resume', 'recover']],
  ['context', ['context', 'resume', 'recover']],
  ['setup', ['setup', 'env', 'environment']],
  ['local', ['local', 'setup', 'env']],
  ['lap', ['plan']],
  ['trien', ['implement']],
  ['khai', ['implement']],
  ['thuc', ['execute', 'run']],
  ['thi', ['execute', 'run']],
  ['hoach', ['plan']],
  ['chia', ['split']],
  ['nhieu', ['multiple']],
  ['song', ['parallel']],
  ['chot', ['confirmed']],
  ['duyet', ['approved']]
]);

const SKILL_HINTS = [
  { skill: 'sdcorejs-brainstorming', words: ['brainstorm', 'brainstorming', 'requirements', 'clarify', 'unsure', 'deciding', 'between', 'compare', 'should'] },
  { skill: 'sdcorejs-ai-agent', words: ['ai-agent', 'agentic', 'responses', 'assistant', 'capability-profile', 'engine-profile'] },
  { skill: 'sdcorejs-angular', words: ['angular', 'portal', 'screen', 'screens', 'list', 'detail', 'form', 'approve', 'approval', 'bulk', 'export', 'action', 'drawer'] },
  { skill: 'sdcorejs-nestjs', words: ['nestjs', 'backend', 'module', 'entity', 'crud', 'endpoint', 'scaffold'] },
  { skill: 'sdcorejs-nextjs', words: ['nextjs', 'website', 'landing', 'seo', 'sitemap', 'og', 'contact'] },
  { skill: 'sdcorejs-solution-builder', words: ['build', 'create', 'software', 'app', 'system', 'manage', 'management', 'whole', 'classroom', 'school'] },
  { skill: 'sdcorejs-product', words: ['product', 'po', 'story', 'stories', 'acceptance', 'criteria', 'requirement', 'requirements', 'traceability', 'uat', 'ledger', 'gap', 'implementation', 'implement', 'complete'] },
  { skill: 'sdcorejs-design', words: ['design', 'ui', 'ux', 'screen', 'wireframe', 'mockup', 'png', 'preview', 'handoff', 'flow', 'flows', 'story', 'stories'] },
  { skill: 'sdcorejs-documentation', words: ['documentation', 'docs', 'doc', 'document', 'code-documentation', 'docstring', 'doc-comment', 'comment', 'comments', 'jsdoc', 'tsdoc', 'api', 'function', 'functions', 'class', 'classes', 'guide', 'user-guide', 'end-user', 'manual', 'technical', 'taskid', 'ticket', 'issue', 'record', 'save', 'convert', 'standardize', 'rewrite', 'improve', 'structure'] },
  { skill: 'sdcorejs-simplify', words: ['simplify', 'simplification', 'refine', 'refinement', 'clean-up', 'cleanup', 'clarity', 'maintainability', 'current-diff', 'behavior-preserving'] },
  { skill: 'sdcorejs-explore', words: ['explore', 'summary', 'overview', 'project', 'codebase', 'repo', 'system', 'map', 'architecture', 'trace', 'flow', 'setup', 'env', 'environment', 'resume', 'recover', 'context', 'persona', 'memory', 'memories', 'remember', 'harvest'] },
  { skill: 'sdcorejs-review', words: ['review', 'audit', 'security', 'performance', 'accessibility', 'a11y', 'architecture', 'scored', 'full', 'comprehensive'] },
  { skill: 'sdcorejs-ship', words: ['verify', 'acceptance', 'criteria', 'final', 'gate', 'branch', 'ready', 'ship', 'push', 'release', 'tag', 'merge', 'dependency', 'dependencies', 'package', 'outdated', 'audit', 'bump'] },
  { skill: 'sdcorejs-git', words: ['commit', 'changes', 'save', 'worktree', 'pr', 'pull', 'request', 'changelog', 'notes'] },
  { skill: 'sdcorejs-repair-loop', words: ['fix', 'apply', 'repair', 'resolve', 'finding', 'findings', 'review', 'issues', 'issue', 'critical', 'failed', 'failures', 'verify-before-done'] },
  { skill: 'sdcorejs-debug', words: ['debug', 'root-cause', 'bug', 'repro', 'failing', 'failure', 'failed', 'fail', 'error', 'wrong', 'flaky', 'ci-only', 'prod-only', 'runtime', 'stack', 'trace', 'investigate', 'resolve', 'slow', 'broken', 'throws'] }
];

const PRIORITY_RULES = [
  {
    skill: null,
    when: ({ prompt, tokens }) =>
      /\b(fix|correct)\b/.test(prompt) &&
      /\b(typo|spelling)\b/.test(prompt) &&
      !hasAny(tokens, ['debug', 'test', 'tests', 'failing', 'failure'])
  },
  {
    skill: 'sdcorejs-brainstorming',
    when: ({ prompt, tokens }) =>
      /\bphan\s+van\b/.test(prompt) ||
      /\bnot\s+sure\b/.test(prompt) ||
      /\bchua\s+ro\b/.test(prompt) ||
      /\bplan(n?ing)?\b.*\b(migrat(e|ing|ion)|adopt(ing)?|install)\b/.test(prompt) ||
      (
        hasAny(tokens, ['brainstorm', 'unsure', 'deciding', 'between', 'compare', 'should', 'clarify']) &&
        !hasDirectTestWorkIntent(prompt, tokens)
      )
  },
  {
    skill: 'sdcorejs-repair-loop',
    when: ({ prompt, tokens }) => hasRepairLoopIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-parallel-dispatch',
    when: ({ prompt, tokens }) =>
      hasAny(tokens, ['parallel']) &&
      hasAny(tokens, ['review', 'audit']) &&
      (/\bread[- ]only\b/.test(prompt) || !hasAny(tokens, ['fix', 'repair', 'implement', 'write', 'edit']))
  },
  {
    skill: 'sdcorejs-review',
    when: ({ prompt, tokens }) => hasReviewIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-spec',
    when: ({ prompt, tokens }) =>
      tokens.has('spec') &&
      (
        hasAny(tokens, ['confirmed', 'approved', 'requirements', 'requirement', 'revise', 'revision', 'changed', 'change', 'write', 'create']) ||
        /\b(chot|approve|approved)\b/.test(prompt)
      ) &&
      !hasAny(tokens, ['plan', 'execute', 'run', 'parallel', 'split'])
  },
  {
    skill: 'sdcorejs-plan',
    when: ({ prompt, tokens }) =>
      tokens.has('plan') &&
      hasAny(tokens, ['spec', 'approved', 'approve', 'revision', 'implementation', 'implement', 'update']) &&
      (
        !hasAny(tokens, ['execute', 'run', 'continue', 'resume', 'implement', 'generate', 'parallel', 'split', 'agent', 'agents']) ||
        /\blap\s+(?:ke\s+hoach|plan)\b/.test(prompt)
      )
  },
  {
    skill: 'sdcorejs-brainstorming',
    when: ({ tokens }) =>
      tokens.has('parallel') &&
      hasAny(tokens, ['implement', 'build', 'create', 'write', 'edit']) &&
      !hasAny(tokens, ['approved', 'approve', 'plan', 'snapshot', 'worktree', 'git'])
  },
  {
    skill: 'sdcorejs-parallel-dispatch',
    when: ({ prompt, tokens }) =>
      (
        tokens.has('split') ||
        (tokens.has('parallel') && hasAny(tokens, ['agent', 'agents', 'multiple']) && !hasAny(tokens, ['execute', 'run'])) ||
        (/\bsong\s+song\b/.test(prompt) && hasAny(tokens, ['split', 'agent', 'agents', 'multiple']))
      ) &&
      hasAny(tokens, ['plan', 'approved', 'approve', 'agent', 'agents', 'multiple'])
  },
  {
    skill: 'sdcorejs-brainstorming',
    when: ({ prompt, tokens }) => hasUnderSpecifiedAiAgentIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-ai-agent',
    when: ({ prompt, tokens }) => hasConfirmedAiAgentImplementationIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-execute-plan',
    when: ({ prompt, tokens }) =>
      hasAny(tokens, ['approved', 'approve', 'plan', 'snapshot']) &&
      hasAny(tokens, ['execute', 'run', 'continue', 'resume', 'implement', 'generate']) &&
      !hasAny(tokens, ['test', 'tests', 'review'])
  },
  {
    skill: 'sdcorejs-brainstorming',
    when: ({ prompt, tokens }) => hasBroadSimplifyPlanningIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-simplify',
    when: ({ prompt, tokens }) => hasDirectSimplifyIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-brainstorming',
    when: ({ prompt, tokens }) =>
      hasSimplifyIntent(prompt, tokens) &&
      !hasCompetingSimplifyOwnerIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-test',
    when: ({ prompt, tokens }) =>
      hasFailingOutputTriageIntent(prompt, tokens) ||
      (
        hasDirectTestWorkIntent(prompt, tokens) &&
        !hasProductCoverageIntent(prompt, tokens) &&
        !hasAny(tokens, ['debug', 'root-cause', 'fix', 'repair', 'resolve']) &&
        !hasDocumentationIntent(prompt, tokens)
      )
  },
  {
    skill: 'sdcorejs-product',
    when: ({ prompt, tokens }) =>
      hasProductIntent(prompt, tokens) &&
      (!hasDirectTestWorkIntent(prompt, tokens) || hasProductCoverageIntent(prompt, tokens)) &&
      !hasAny(tokens, ['angular', 'portal', 'screen', 'screens', 'ui', 'wireframe', 'mockup', 'design'])
  },
  {
    skill: 'sdcorejs-debug',
    when: ({ prompt, tokens }) =>
      (
        hasAny(tokens, ['debug', 'root-cause', 'repro', 'failing', 'failure', 'failed', 'fail', 'error', 'wrong', 'bug', 'flaky', 'investigate', 'resolve', 'broken', 'throws']) ||
        /\bfix\b.*\bbug\b/.test(prompt) ||
        /\bstack\b.*\btrace\b/.test(prompt) ||
        /\bci-only\b|\bprod-only\b/.test(prompt) ||
        /\bruntime\b.*\berror\b/.test(prompt) ||
        (tokens.has('slow') && hasAny(tokens, ['debug', 'why', 'investigate', 'regression']))
      ) &&
      !hasFailingOutputTriageIntent(prompt, tokens) &&
      !hasShipVerificationIntent(prompt, tokens) &&
      !hasReviewIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-design',
    when: ({ prompt, tokens }) =>
      (hasAny(tokens, ['design', 'ui', 'ux', 'wireframe', 'mockup', 'png', 'preview', 'handoff']) ||
        (hasAny(tokens, ['flow', 'flows']) && hasAny(tokens, ['screen', 'screens', 'user', 'journey']))) &&
      !hasDocumentationIntent(prompt, tokens) &&
      !hasAny(tokens, ['angular', 'portal', 'implement', 'code', 'architecture', 'codebase', 'repo', 'map', 'trace'])
  },
  {
    skill: 'sdcorejs-test',
    when: ({ prompt, tokens }) =>
      hasTestIntent(tokens) &&
      (!hasProductIntent(prompt, tokens) || (hasDirectTestWorkIntent(prompt, tokens) && !hasProductCoverageIntent(prompt, tokens))) &&
      !hasAny(tokens, ['debug', 'root-cause', 'failing', 'failure']) &&
      !hasAny(tokens, ['docs', 'doc', 'documentation', 'guide', 'user-guide', 'manual', 'screenshot'])
  },
  {
    skill: 'sdcorejs-auth',
    when: ({ tokens }) =>
      hasAny(tokens, ['auth', 'authentication', 'authorization', 'keycloak', 'login']) &&
      !hasAny(tokens, ['test', 'tests', 'debug', 'failing', 'failure', 'docs', 'documentation', 'guide'])
  },
  {
    skill: 'sdcorejs-explore',
    when: ({ prompt, tokens }) =>
      (
        hasAny(tokens, ['summary', 'overview', 'explore', 'codebase', 'repo', 'architecture', 'env', 'environment', 'resume', 'recover', 'context', 'persona', 'memory', 'memories', 'remember']) ||
        /\b(set\s+up|setup)\b.*\b(project|repo|codebase|local|locally|environment|env)\b/.test(prompt) ||
        /\b(project|repo|codebase|local|locally|environment|env)\b.*\b(set\s+up|setup)\b/.test(prompt) ||
        /\bharvest\b.*\b(guide|documentation|docs|doc|gap|gaps|module)\b/.test(prompt) ||
        /\b(read|refresh|update)\b.*\b(project|repo|codebase)?\s*summary\b/.test(prompt) ||
        /\b(map|trace)\b.*\b(architecture|flow|codebase|repo|project)\b/.test(prompt) ||
        /\b(plain|technical)\b.*\b(explanation|persona|mode)\b/.test(prompt)
      ) &&
      !hasGitArtifactIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-documentation',
    when: ({ prompt, tokens }) =>
      hasDocumentationIntent(prompt, tokens) &&
      !hasGitArtifactIntent(prompt, tokens) &&
      !hasAny(tokens, ['prd', 'story', 'stories', 'acceptance', 'criteria', 'uat', 'traceability']) &&
      !hasAny(tokens, ['execute', 'approved'])
  },
  {
    skill: 'sdcorejs-explore',
    when: ({ prompt, tokens }) =>
      (hasAny(tokens, ['explore', 'overview', 'codebase', 'repo', 'architecture', 'env', 'environment', 'resume', 'recover']) ||
        /\bsummarize\b.*\b(project|repo|codebase)\b/.test(prompt) ||
        /\bmap\b.*\b(architecture|flow|codebase)\b/.test(prompt)) &&
      !hasAny(tokens, ['docs', 'doc', 'documentation'])
  },
  {
    skill: 'sdcorejs-ship',
    when: ({ prompt, tokens }) =>
      hasDependencyDeliveryIntent(prompt, tokens) ||
      hasShipVerificationIntent(prompt, tokens) ||
      (
        !hasGitArtifactIntent(prompt, tokens) &&
        hasAny(tokens, ['ship', 'push', 'merge', 'release', 'tag'])
      ) ||
      /\bready\b.*\b(branch|merge|ship)\b/.test(prompt) ||
      /\bupdate\b.*\b(dependencies|packages)\b/.test(prompt)
  },
  {
    skill: 'sdcorejs-git',
    when: ({ prompt, tokens }) => hasGitArtifactIntent(prompt, tokens)
  },
  {
    skill: 'sdcorejs-brainstorming',
    when: ({ prompt, tokens }) =>
      /\b(build|create|make)\b.*\b(component)\b/.test(prompt) &&
      !hasAny(tokens, ['angular', 'portal', 'screen', 'screens', 'page'])
  },
  {
    skill: 'sdcorejs-solution-builder',
    when: ({ prompt, tokens }) =>
      (hasAny(tokens, ['build', 'create', 'want', 'need']) && hasAny(tokens, ['software', 'app', 'system', 'solution'])) ||
      (hasAny(tokens, ['manage', 'management']) && hasAny(tokens, ['software', 'app', 'system', 'classroom', 'school']))
  },
  {
    skill: 'sdcorejs-angular',
    when: ({ tokens }) =>
      hasAny(tokens, ['angular', 'portal', 'screen', 'screens', 'list', 'detail', 'form', 'approval', 'bulk', 'export', 'drawer']) ||
      (hasAny(tokens, ['approve', 'approval', 'action', 'button']) && hasAny(tokens, ['order', 'purchase', 'submit', 'reject', 'bulk']))
  },
  {
    skill: 'sdcorejs-nestjs',
    when: ({ tokens }) =>
      hasAny(tokens, ['nestjs', 'backend', 'endpoint']) ||
      (hasAny(tokens, ['module', 'entity', 'crud', 'scaffold']) && !hasAny(tokens, ['screen', 'screens', 'portal', 'angular']))
  },
  {
    skill: 'sdcorejs-nextjs',
    when: ({ tokens }) => hasAny(tokens, ['nextjs', 'website', 'landing', 'seo', 'sitemap', 'og'])
  }
];

export async function loadSkillPack(rootUrlOrPath) {
  const root = toPath(rootUrlOrPath);
  const [sourceSkills, claudeMirrorSkills, pluginMirrorSkills, codexMirrorSkills, referenceDocs, codexReferenceDocs] = await Promise.all([
    readSourceSkills(path.join(root, 'skills')),
    readMirrorSkills(path.join(root, '.claude', 'skills')),
    readMirrorSkills(path.join(root, 'plugin', 'skills')),
    readMirrorSkills(path.join(root, 'codex', 'skills')),
    listMarkdownFiles(path.join(root, '_refs')),
    listMarkdownFiles(path.join(root, 'codex', 'skills', '_refs'))
  ]);

  const diagnostics = [];
  diagnostics.push(...diagnoseSkills(sourceSkills, 'source'));
  diagnostics.push(...diagnoseMirror(sourceSkills, claudeMirrorSkills, '.claude/skills'));
  diagnostics.push(...diagnoseMirror(sourceSkills, pluginMirrorSkills, 'plugin/skills'));
  diagnostics.push(...diagnoseMirror(sourceSkills, codexMirrorSkills, 'codex/skills'));
  diagnostics.push(...diagnoseCodexMirror(codexMirrorSkills));

  return {
    root,
    sourceSkills,
    claudeMirrorSkills,
    pluginMirrorSkills,
    codexMirrorSkills,
    referenceDocs,
    codexReferenceDocs,
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
  const priorityMatch = matchPriorityRule(pack, prompt, promptTokens);
  if (priorityMatch !== undefined) return priorityMatch;

  const scored = pack.sourceSkills
    .map((skill) => ({
      skill,
      score:
        (
          skill.name === 'sdcorejs-ai-agent'
          && !hasConfirmedAiAgentImplementationIntent(prompt.toLowerCase(), promptTokens)
        ) ||
        (
          skill.name === 'sdcorejs-simplify'
          && !hasDirectSimplifyIntent(prompt.toLowerCase(), promptTokens)
        )
          ? 0
          : scoreSkill(skill, promptTokens)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));

  return scored[0]?.skill ?? null;
}

function matchPriorityRule(pack, prompt, tokens) {
  const normalizedPrompt = prompt.toLowerCase();
  const explicitName = normalizedPrompt.match(/\bsdcorejs-[a-z0-9-]+\b/)?.[0];
  if (explicitName) {
    if (explicitName === 'sdcorejs-review' && hasRepairLoopIntent(normalizedPrompt, tokens)) {
      const repairSkill = findSkill(pack, 'sdcorejs-repair-loop');
      if (repairSkill) return repairSkill;
    }

    const explicitSkill = findSkill(pack, explicitName);
    if (explicitSkill) return explicitSkill;
  }

  for (const rule of PRIORITY_RULES) {
    if (!rule.when({ prompt: normalizedPrompt, tokens })) continue;
    if (rule.skill === null) return null;
    const skill = findSkill(pack, rule.skill);
    if (skill) return skill;
  }

  return undefined;
}

async function readSourceSkills(root) {
  const files = (await listMarkdownFiles(root)).filter((file) => !path.basename(file).startsWith('_'));
  const skills = await Promise.all(files.map(readSkillFile));
  return skills;
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
    frontmatterKeys: frontmatter.__keys ?? [],
    frontmatterErrors: frontmatter.__errors ?? [],
    text
  };
}

function parseFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return { __errors: ["missing opening '---' frontmatter delimiter"] };

  const end = normalized.indexOf('\n---', 3);
  if (end === -1) return { __errors: ["missing closing '---' frontmatter delimiter"] };

  const block = normalized.slice(3, end).trim();
  const result = { __keys: [], __errors: [] };
  const lines = block.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (!match) {
      result.__errors.push(`unsupported frontmatter line ${index + 1}: ${line}`);
      continue;
    }

    const key = match[1];
    if (Object.hasOwn(result, key)) {
      result.__errors.push(`duplicate frontmatter key '${key}'`);
      continue;
    }

    const rawValue = match[2].trim();
    if (isBlockScalarMarker(rawValue)) {
      const folded = [];
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) {
        index += 1;
        folded.push(lines[index].trim());
      }
      result[key] = folded.join(rawValue.startsWith('>') ? ' ' : '\n').trim();
      result.__keys.push(key);
      continue;
    }

    if (hasYamlMappingColon(rawValue) && !isQuotedScalar(rawValue)) {
      result.__errors.push(`frontmatter line ${index + 1} contains an unquoted mapping colon: ${line}`);
      continue;
    }

    result[key] = rawValue;
    result.__keys.push(key);
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
  const allowedSourceKeys = new Set(['name', 'description', 'allowed-tools']);
  for (const skill of skills) {
    for (const error of skill.frontmatterErrors) diagnostics.push(`${label}:${skill.path}: ${error}`);
    for (const key of skill.frontmatterKeys) {
      if (!allowedSourceKeys.has(key)) diagnostics.push(`${label}:${skill.path}: unsupported frontmatter key ${key}`);
    }
    if (!skill.name) diagnostics.push(`${label}:${skill.path}: missing name`);
    if (!skill.description) diagnostics.push(`${label}:${skill.path}: missing description`);
    if (skill.name && !/^sdcorejs-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name)) {
      diagnostics.push(`${label}:${skill.path}: non-sdcorejs kebab name ${skill.name}`);
    }
    if (seen.has(skill.name)) diagnostics.push(`${label}:${skill.path}: duplicate name ${skill.name}`);
    if (skill.name) seen.set(skill.name, skill.path);
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

function diagnoseCodexMirror(skills) {
  const diagnostics = [];
  for (const skill of skills) {
    for (const error of skill.frontmatterErrors) diagnostics.push(`codex/skills:${skill.path}: ${error}`);
    const extraKeys = skill.frontmatterKeys.filter((key) => !['name', 'description'].includes(key));
    if (extraKeys.length > 0) diagnostics.push(`codex/skills:${skill.path}: unsupported frontmatter keys ${extraKeys.join(',')}`);
    if (/(^|[^./])_refs\//.test(skill.text)) diagnostics.push(`codex/skills:${skill.path}: unresolved repo-root _refs path`);
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

function findSkill(pack, name) {
  return pack.sourceSkills.find((skill) => skill.name === name);
}

function hasAny(tokens, words) {
  return words.some((word) => tokens.has(word));
}

function hasTestIntent(tokens) {
  return hasAny(tokens, [
    'test',
    'tests',
    'tested',
    'testing',
    'unit',
    'integration',
    'e2e',
    'playwright',
    'cypress',
    'uat',
    'tdd',
    'coverage'
  ]);
}

function hasDirectTestWorkIntent(prompt, tokens) {
  if (hasTestWorkExclusion(prompt)) return false;
  return (
    hasAny(tokens, ['tests', 'unit', 'integration', 'e2e', 'playwright', 'cypress', 'tdd']) ||
    (hasAny(tokens, ['run', 'execute']) && hasAny(tokens, ['test', 'tests'])) ||
    /\b(write|add|create)\b.*\btests?\b/.test(prompt) ||
    /\bviet\s+tests?\b/.test(prompt) ||
    /\b(test|testing)\s+(plan|case|cases|coverage)\b/.test(prompt) ||
    /\bcoverage\b.*\b(test|tests|gap|gaps)\b/.test(prompt) ||
    (tokens.has('coverage') && hasAny(tokens, ['audit', 'review', 'gap', 'gaps']) && !hasProductCoverageIntent(prompt, tokens)) ||
    /\bwhat\b.*\bshould\b.*\b(be\s+)?tested\b/.test(prompt) ||
    /\buat\b.*\b(test|case|cases|checklist|scenario|scenarios)\b/.test(prompt)
  );
}

function hasProductCoverageIntent(prompt, tokens) {
  return (
    tokens.has('coverage') &&
    hasProductIntent(prompt, tokens) &&
    (
      hasAny(tokens, ['product', 'po', 'prd', 'requirement', 'requirements', 'acceptance', 'criteria', 'traceability', 'ledger']) ||
      /\b(requirements?|acceptance|criteria|traceability|product)\b.*\bcoverage\b/.test(prompt) ||
      /\bcoverage\b.*\b(requirements?|acceptance|criteria|traceability|product)\b/.test(prompt)
    ) &&
    (
      !hasAny(tokens, ['tests', 'unit', 'integration', 'e2e', 'playwright', 'cypress', 'tdd']) ||
      hasTestWorkExclusion(prompt)
    )
  );
}

function hasTestWorkExclusion(prompt) {
  return /\bwithout\s+(writing|adding|creating|running|changing)\s+tests?\b/.test(prompt);
}

function hasFailingOutputTriageIntent(prompt, tokens) {
  return (
    hasAny(tokens, ['failing', 'failure', 'error']) &&
    hasAny(tokens, ['test', 'tests']) &&
    (
      hasAny(tokens, ['explain', 'triage', 'classify', 'summarize']) ||
      /\bwithout\s+changing\s+files\b/.test(prompt) ||
      /\bread[- ]?only\b/.test(prompt)
    )
  );
}

function hasRepairLoopIntent(prompt, tokens) {
  return (
    (
      hasAny(tokens, ['fix', 'apply', 'repair', 'resolve']) &&
      hasAny(tokens, ['finding', 'findings', 'review', 'issues', 'issue', 'critical', 'failed', 'failures', 'verify-before-done'])
    ) ||
    /\bapply\b.*\breview findings\b/.test(prompt) ||
    /\brepair\b.*\bverify-before-done\b/.test(prompt)
  );
}

function hasDirectSimplifyIntent(prompt, tokens) {
  if (!hasSimplifyIntent(prompt, tokens)) return false;
  if (hasCompetingSimplifyOwnerIntent(prompt, tokens)) return false;
  if (!hasBoundedSimplifyScope(prompt, tokens)) return false;
  return hasBehaviorPreservationIntent(prompt, tokens) || hasAnalyzeSimplifyIntent(prompt, tokens);
}

function hasSimplifyIntent(prompt, tokens) {
  return (
    hasAny(tokens, [
      'simplify',
      'simplification',
      'simpler',
      'refine',
      'refinement',
      'cleanup',
      'clean-up',
    ]) ||
    /\bclean\s+up\b/.test(prompt) ||
    hasLocalizedSimplifyIntent(prompt)
  );
}

function hasLocalizedSimplifyIntent(prompt) {
  return /\bdon\s+gian\s+hoa\b/.test(normalizePromptText(prompt));
}

function hasLocalizedBehaviorPreservationIntent(prompt) {
  return /\bgiu\s+nguyen\s+hanh\s+vi\b/.test(normalizePromptText(prompt));
}

function hasLocalizedAnalyzeSimplifyIntent(prompt) {
  const normalized = normalizePromptText(prompt);
  return /\bphan\s+tich\b/.test(normalized) || /\bco\s+hoi\b/.test(normalized);
}

function hasLocalizedCompetingSimplifyIntent(prompt) {
  const normalized = normalizePromptText(prompt);
  return (
    /\btoi\s+uu(?:\s+hoa)?\b/.test(normalized) ||
    hasLocalizedModernizationIntent(prompt)
  );
}

function hasLocalizedModernizationIntent(prompt) {
  return /\bhien\s+dai\s+hoa\b/.test(normalizePromptText(prompt));
}

function hasBoundedSimplifyScope(prompt, tokens) {
  return (
    hasAny(tokens, [
      'current-diff',
      'diff',
      'hunk',
      'hunks',
      'recently',
      'modified',
      'changed',
      'function',
      'method',
      'file',
      'files',
      'path',
      'source',
      'typescript',
      'javascript',
    ]) ||
    /\bcurrent\s+(?:changed\s+)?(?:diff|source|code)\b/.test(prompt) ||
    /\brecently\s+(?:changed|modified)\b/.test(prompt) ||
    /\bthis\s+(?:modified|changed)\s+(?:function|method|file|code)\b/.test(prompt) ||
    /\bcode\s+vua\s+sua\b/.test(prompt) ||
    (
      tokens.has('code') &&
      tokens.has('previous') &&
      hasAny(tokens, ['fix', 'repair'])
    )
  );
}

function hasBehaviorPreservationIntent(prompt, tokens) {
  return (
    (hasAny(tokens, ['preserve', 'preserving', 'unchanged']) && hasAny(tokens, ['behavior', 'output', 'semantics'])) ||
    /\bwithout\s+chang(?:e|ing)\s+(?:observable\s+)?behaviou?r\b/.test(prompt) ||
    /\bno\s+(?:functional|behavioral)\s+change\b/.test(prompt) ||
    /\bpreserv(?:e|ing)\s+(?:its\s+)?(?:exact\s+)?(?:behavior|output|semantics)\b/.test(prompt) ||
    hasLocalizedBehaviorPreservationIntent(prompt)
  );
}

function hasAnalyzeSimplifyIntent(prompt, tokens) {
  return (
    hasAny(tokens, ['analyze', 'analyse', 'opportunities']) ||
    /\breport\s+(?:simplification|refinement)\s+opportunities\b/.test(prompt) ||
    /\bread[- ]only\b/.test(prompt) ||
    hasLocalizedAnalyzeSimplifyIntent(prompt)
  );
}

function hasBroadSimplifyPlanningIntent(prompt, tokens) {
  if (hasLocalizedModernizationIntent(prompt)) return true;
  if (!hasSimplifyIntent(prompt, tokens) && !tokens.has('refactor')) return false;
  if (
    hasAny(tokens, ['approved', 'snapshot']) &&
    hasAny(tokens, ['execute', 'run', 'continue', 'implement'])
  ) {
    return false;
  }

  return (
    /\b(?:whole|entire|all)\s+(?:the\s+)?(?:repository|repo|codebase|system)\b/.test(prompt) ||
    hasAny(tokens, ['architecture', 'schema', 'migration']) ||
    /\bpublic\s+(?:api|contract|type)\b/.test(prompt) ||
    /\b(module|framework)\s+boundar(?:y|ies)\b/.test(prompt)
  );
}

function hasCompetingSimplifyOwnerIntent(prompt, tokens) {
  return (
    hasDirectTestWorkIntent(prompt, tokens) ||
    hasDocumentationIntent(prompt, tokens) ||
    hasRepairLoopIntent(prompt, tokens) ||
    hasReviewIntent(prompt, tokens) ||
    hasDependencyDeliveryIntent(prompt, tokens) ||
    hasGitArtifactIntent(prompt, tokens) ||
    hasShipVerificationIntent(prompt, tokens) ||
    hasLocalizedCompetingSimplifyIntent(prompt) ||
    hasAny(tokens, [
      'bug',
      'debug',
      'failing',
      'failure',
      'error',
      'wrong',
      'flaky',
      'performance',
      'optimize',
      'optimization',
      'dependency',
      'dependencies',
      'package',
      'architecture',
      'schema',
      'migration',
    ]) ||
    (
      tokens.has('root-cause') &&
      !hasBehaviorPreservationIntent(prompt, tokens)
    ) ||
    /\bpublic\s+(?:api|contract|type)\b/.test(prompt) ||
    /\b(?:ai[- ]agent|llm)\b.*\b(?:prompt|instruction|tool schema|schema)\b/.test(prompt) ||
    /\b(?:prompt|instruction|tool schema)\b.*\b(?:ai[- ]agent|llm)\b/.test(prompt)
  );
}

function hasUnderSpecifiedAiAgentIntent(prompt, tokens) {
  if (!hasAiAgentSubject(prompt, tokens)) return false;
  if (hasDedicatedAiOwnerIntent(prompt, tokens)) return false;
  if (hasAny(tokens, ['approved', 'contract', 'snapshot'])) return false;

  return (
    hasAny(tokens, ['build', 'create', 'make', 'want', 'need', 'design']) ||
    /\bhelp\s+me\b/.test(prompt)
  );
}

function hasConfirmedAiAgentImplementationIntent(prompt, tokens) {
  if (!hasAiAgentSubject(prompt, tokens)) return false;
  if (hasDedicatedAiOwnerIntent(prompt, tokens)) return false;
  if (
    hasAny(tokens, ['plan', 'snapshot'])
    && hasAny(tokens, ['execute', 'run', 'continue', 'resume', 'implement', 'generate'])
  ) {
    return false;
  }

  const hasEngine = /\b(responses api|agents sdk)\b/.test(prompt)
    || (tokens.has('responses') && tokens.has('api'))
    || (tokens.has('agents') && tokens.has('sdk'));
  const hasCapability = hasAny(tokens, [
    'reporting',
    'analytics',
    'knowledge',
    'audit',
    'crm',
    'workflow',
    'support',
    'document',
    'provisioning',
    'tenant',
    'approval',
    'supervisor',
    'assistant'
  ]);
  const hasImplementation = hasAny(tokens, [
    'approved',
    'contract',
    'continue',
    'implement',
    'implementation'
  ]);

  return hasEngine && hasCapability && hasImplementation;
}

function hasAiAgentSubject(prompt, tokens) {
  return (
    /\bai[- ]agent\b|\bai assistant\b|\bagentic\b/.test(prompt) ||
    (tokens.has('ai') && hasAny(tokens, ['agent', 'agents', 'assistant'])) ||
    /\b(responses api|agents sdk)\b/.test(prompt)
  );
}

function hasDedicatedAiOwnerIntent(prompt, tokens) {
  return (
    hasDirectTestWorkIntent(prompt, tokens) ||
    hasReviewIntent(prompt, tokens) ||
    hasAny(tokens, ['debug', 'root-cause', 'failing', 'failure', 'failed', 'error', 'wrong', 'bug', 'repair']) ||
    (
      hasDocumentationIntent(prompt, tokens) &&
      hasAny(tokens, ['documentation', 'docs', 'doc', 'guide', 'manual', 'user-guide', 'screenshot'])
    ) ||
    hasGitArtifactIntent(prompt, tokens) ||
    hasShipVerificationIntent(prompt, tokens) ||
    /\bchatgpt app\b|\bmcp widget\b/.test(prompt)
  );
}

function hasReviewIntent(prompt, tokens) {
  if (hasProductIntent(prompt, tokens) || hasRepairLoopIntent(prompt, tokens)) return false;
  if (hasDependencyDeliveryIntent(prompt, tokens)) return false;
  if (hasAny(tokens, ['update', 'bump', 'dependency', 'dependencies', 'package', 'outdated'])) return false;
  if (hasDirectTestWorkIntent(prompt, tokens)) return false;

  const explicitReviewWord = /\b(review|audit)\b/.test(prompt);
  const reviewDimension = hasAny(tokens, ['security', 'performance', 'accessibility', 'a11y', 'architecture']);

  return (
    (explicitReviewWord && (hasAny(tokens, ['review', 'audit', 'code', 'module', 'screen', 'page']) || reviewDimension)) ||
    (
      reviewDimension &&
      hasAny(tokens, ['check', 'review', 'audit', 'module', 'screen', 'page', 'code'])
    ) ||
    /\b(full|comprehensive|scored)\b.*\b(review|audit)\b/.test(prompt) ||
    /\b(review|audit)\b.*\b(code|security|performance|accessibility|a11y|architecture)\b/.test(prompt)
  );
}

function hasDependencyDeliveryIntent(prompt, tokens) {
  return (
    hasAny(tokens, ['dependency', 'dependencies', 'outdated', 'bump']) ||
    /\bupdate\b.*\b(dependencies|packages)\b/.test(prompt) ||
    /\baudit\s+fix\b/.test(prompt)
  );
}

function hasShipVerificationIntent(prompt, tokens) {
  return (
    hasAny(tokens, ['verify', 'verification']) &&
    (
      hasAny(tokens, ['acceptance', 'criteria', 'done', 'ship', 'branch', 'ready', 'merge', 'release', 'commit', 'pr', 'docs', 'doc', 'documentation']) ||
      /\bverify\b.*\b(acceptance|criteria|done|branch|ready|merge|release|commit|pr|docs?|documentation)\b/.test(prompt)
    )
  );
}

function hasGitArtifactIntent(prompt, tokens) {
  return (
    hasAny(tokens, ['commit', 'worktree', 'changelog']) ||
    (hasAny(tokens, ['create', 'prepare', 'open', 'write', 'submit']) && (tokens.has('pr') || (tokens.has('pull') && tokens.has('request')))) ||
    /\b(create|prepare|open|write|submit)\b.*\b(pr|pull request)\b/.test(prompt) ||
    /\brelease notes\b/.test(prompt)
  );
}

function hasProductIntent(prompt, tokens) {
  if (hasAny(tokens, ['taskid', 'record', 'ticket', 'issue'])) return false;
  if (hasAny(tokens, ['ship', 'branch', 'merge', 'release', 'tag', 'ready', 'final', 'gate'])) return false;
  if (hasShipVerificationIntent(prompt, tokens)) return false;

  return (
    hasAny(tokens, ['po', 'prd', 'story', 'stories', 'acceptance', 'criteria', 'uat', 'traceability', 'requirement', 'requirements', 'ledger']) ||
    (tokens.has('product') &&
      hasAny(tokens, ['doc', 'docs', 'requirement', 'requirements', 'story', 'stories', 'acceptance', 'criteria', 'uat', 'traceability', 'ledger', 'gap', 'implementation', 'implement', 'coverage']) &&
      !hasAny(tokens, ['guide', 'manual', 'user-guide'])) ||
    /\b(requirements?|acceptance|uat)\b.*\b(implementation|implement|test|coverage|complete|gap)\b/.test(prompt) ||
    /\b(implementation|implement|test|coverage|complete|gap)\b.*\b(requirements?|acceptance|uat)\b/.test(prompt)
  );
}

function hasDocumentationIntent(prompt, tokens) {
  return (
    hasAny(tokens, [
      'documentation',
      'docs',
      'doc',
      'document',
      'readme',
      'prompt',
      'prompts',
      'prose',
      'instructions',
      'code-documentation',
      'docstring',
      'doc-comment',
      'comment',
      'comments',
      'jsdoc',
      'tsdoc',
      'api',
      'guide',
      'user-guide',
      'manual',
      'screenshot',
      'script',
      'technical',
      'taskid',
      'record',
      'rewrite',
      'improve',
      'structure',
      'convert',
      'standardize'
    ]) ||
    /\bsummarize\b.*\b(doc|docs|documentation|manual|guide)\b/.test(prompt) ||
    /\b(api|technical)\b.*\b(doc|docs|documentation)\b/.test(prompt)
  );
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
  const normalized = normalizePromptText(text);
  for (const token of normalized.match(/[a-z0-9-]+/g) ?? []) {
    if (!STOP_WORDS.has(token)) tokens.add(token);
  }
  return tokens;
}

function normalizePromptText(text) {
  return text
    .toLowerCase()
    .replaceAll('đ', 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toPath(rootUrlOrPath) {
  if (rootUrlOrPath instanceof URL) return fileURLToPath(rootUrlOrPath);
  return path.resolve(String(rootUrlOrPath));
}
