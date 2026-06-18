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
  const evalResults = runPromptEval(pack, cases);
  return Object.keys(profiles).flatMap((profile) =>
    evalResults.map((result) => ({
      profile,
      ...result
    }))
  );
}

function toPath(rootUrlOrPath) {
  if (rootUrlOrPath instanceof URL) return fileURLToPath(rootUrlOrPath);
  return path.resolve(String(rootUrlOrPath));
}
