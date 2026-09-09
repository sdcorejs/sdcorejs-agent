import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'));

/**
 * Select a bounded set of references from an already classified UI task.
 * This is exact topic lookup, not natural-language dispatch or API discovery.
 * Only catalog metadata is read; the caller reads selected Markdown on demand.
 */
export function selectUiuxReferences(input) {
  const invalid = (message) => { throw new Error(`UI/UX selection: ${message}`); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('expected an object');
  if (!catalog.tasks.includes(input.task)) invalid('unknown task');
  if (['qa', 'non-ui'].includes(input.task)) {
    return { status: 'not-applicable', references: [], unmatched_topics: [], reason: 'No UI workflow is required.' };
  }
  if (typeof input.surface !== 'string' || !input.surface.trim()) invalid('surface is required');
  if (input.topics !== undefined && (!Array.isArray(input.topics) || input.topics.some((topic) => typeof topic !== 'string' || !topic.trim()))) {
    invalid('topics must be nonempty strings in an array');
  }
  const knownSurface = Object.hasOwn(catalog.surfaces, input.surface);
  const topics = [...new Set(input.topics?.length ? input.topics :
    input.task === 'design-new' && knownSurface ? catalog.surfaces[input.surface] : [])];
  const references = knownSurface ? catalog.references.filter((entry) =>
    (entry.surfaces.includes('*') || entry.surfaces.includes(input.surface)) &&
    entry.topics.some((topic) => topics.includes(topic))) : [];
  const unmatched = topics.filter((topic) => !references.some((entry) => entry.topics.includes(topic)));
  return {
    status: !references.length ? 'no-match' : unmatched.length ? 'partial-match' : 'matched',
    references: references.map(({ id, path, rule_ids }) => ({ id, path, rule_ids: [...rule_ids] })),
    unmatched_topics: unmatched,
    reason: !references.length || unmatched.length
      ? 'No verified match for the unresolved scope; use explicitly labeled general guidance from index.md and current UI evidence.'
      : 'Read only these references; applicability and verification remain the caller responsibility.',
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [surface, task, ...topics] = process.argv.slice(2);
    process.stdout.write(`${JSON.stringify(selectUiuxReferences({ surface, task, topics }), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\nUsage: node select-references.mjs <surface> <task> [topic ...]\n`);
    process.exitCode = 1;
  }
}
