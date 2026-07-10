import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPromptEval } from './skill-pack-runner.mjs';

const PROFILE_FILES = {
  codex: ['AGENTS.md'],
  cursor: ['AGENTS.md', '.cursor/rules/sdcorejs-agent.mdc'],
  'claude-code': ['CLAUDE.md'],
  copilot: ['.github/copilot-instructions.md', '.github/chatmodes/sdcorejs.chatmode.md']
};

export async function loadEntrypointProfiles(rootUrlOrPath) {
  const root = toPath(rootUrlOrPath);
  const profiles = {};

  for (const [name, files] of Object.entries(PROFILE_FILES)) {
    const texts = await Promise.all(files.map((file) => readFile(path.join(root, file), 'utf8')));
    profiles[name] = {
      name,
      entrypoints: files,
      text: texts.join('\n\n')
    };
  }

  return profiles;
}

export function runEntrypointPromptSmoke(pack, profiles, cases) {
  return Object.entries(profiles).flatMap(([profileName, profile]) => {
    const routingContext = deriveEntrypointRoutingContext(profile);
    return runPromptEval(pack, cases).map((result) => {
      const actualSkill = applyEntrypointPolicy(result.actualSkill, result.prompt, routingContext);
      return {
        profile: profileName,
        ...result,
        actualSkill,
        pass: actualSkill === result.expectedSkill,
        routingContext
      };
    });
  });
}

export function deriveEntrypointRoutingContext(profile) {
  const text = profile.text.toLowerCase();
  const directParallelDispatch = /direct (?:splitting of an |approved-plan )?approved plan|direct approved-plan splitting|split this approved plan/.test(text) && /sdcorejs-parallel-dispatch/.test(text);
  const directParallelDenied = /(?:always use|must use) sdcorejs-execute-plan[^.\n]*approved plan|approved plan[^.\n]*(?:always use|must use) sdcorejs-execute-plan|(?:do not|never) use sdcorejs-parallel-dispatch[^.\n]*direct/.test(text);
  const contradictions = [];
  if (/unapproved write requests? may bypass planning|bypass planning.*parallel/.test(text)) contradictions.push('parallel-write-planning');
  if (directParallelDispatch && directParallelDenied) contradictions.push('parallel-dispatch-disabled');
  return {
    advertisedSkills: [...new Set(text.match(/sdcorejs-[a-z0-9-]+/g) ?? [])].sort(),
    approvedPlanExecution: /sdcorejs-execute-plan/.test(text) && /approved plan|plan approval|approved-plan/.test(text),
    directParallelDispatch,
    requiresApprovedPlanForWrites: /before (the )?plan approval|before (an )?approved plan|starting code before.*plan approval|approved plans? (go|execute|run)|approval gate/.test(text),
    readOnlyParallel: /read-only parallel|parallel read-only|read-only fan-out/.test(text),
    contradictions
  };
}

function applyEntrypointPolicy(actualSkill, prompt, context) {
  const normalized = prompt.toLowerCase();
  const directSplit = /\b(split|dispatch)\b.*\bparallel\b|\bparallel agents?\b/.test(normalized) && /\bapproved plan\b/.test(normalized);
  const approvedExecution = /\b(execute|run|continue|implement)\b.*\bapproved plan\b/.test(normalized);
  const readOnly = /\b(read-only|review|audit)\b/.test(normalized) && /\bparallel\b/.test(normalized);
  const unapprovedWrite = /\b(implement|build|create|write|edit)\b/.test(normalized) && /\bparallel\b/.test(normalized) && !/\bapproved plan\b/.test(normalized) && !/\b(worktree|git)\b/.test(normalized);
  if (context.contradictions.includes('parallel-dispatch-disabled') && (directSplit || readOnly)) return null;
  if (context.contradictions.includes('parallel-write-planning') && unapprovedWrite) return null;
  if (directSplit) return context.directParallelDispatch ? 'sdcorejs-parallel-dispatch' : null;
  if (approvedExecution) return context.approvedPlanExecution ? 'sdcorejs-execute-plan' : null;
  if (readOnly) return context.readOnlyParallel ? 'sdcorejs-parallel-dispatch' : null;
  if (unapprovedWrite) return context.requiresApprovedPlanForWrites ? 'sdcorejs-brainstorming' : null;
  return actualSkill;
}

function toPath(rootUrlOrPath) {
  if (rootUrlOrPath instanceof URL) return fileURLToPath(rootUrlOrPath);
  return path.resolve(String(rootUrlOrPath));
}
