#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, '..');
const bootstrapPath = path.join(pluginRoot, 'skills', 'sdcorejs-using-skills', 'SKILL.md');
const bootstrapContent = await readFile(bootstrapPath, 'utf8').catch(
  () => 'Error reading sdcorejs-using-skills skill'
);

const additionalContext = [
  '<EXTREMELY_IMPORTANT>',
  'You have the sdcorejs SDLC skill pack.',
  '',
  "**Below is the full content of your 'sdcorejs-using-skills' bootstrap - how to find and dispatch sdcorejs skills. For all other skills, use the 'Skill' tool:**",
  '',
  bootstrapContent,
  '</EXTREMELY_IMPORTANT>',
].join('\n');

let output;
if (process.env.CURSOR_PLUGIN_ROOT) {
  output = { additional_context: additionalContext };
} else if (process.env.CLAUDE_PLUGIN_ROOT && !process.env.COPILOT_CLI) {
  output = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext,
    },
  };
} else {
  output = { additionalContext };
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
