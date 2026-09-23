import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, cpSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';
import * as contract from '../../../_refs/simplify/simplify-contract.mjs';

export const owner = 'github.com/example/simplify-fixture';
export const sourcePath = 'src/value.mjs';
export const originalSource = 'export function value(input) {\n  const result = input + 1;\n  return result;\n}\n';
export const simplifiedSource = 'export function value(input) {\n  return input + 1;\n}\n';

function removeFixture(root) {
  assert.equal(realpathSync.native(path.dirname(root)), realpathSync.native(tmpdir()));
  assert.match(path.basename(root), /^simplify-(?:contract|seed)-/u);
  rmSync(root, { recursive: true, force: true });
}

let seed;
function seedRepository() {
  if (seed) return seed;
  seed = mkdtempSync(path.join(tmpdir(), 'simplify-seed-'));
  mkdirSync(path.join(seed, 'src'));
  writeFileSync(path.join(seed, sourcePath), originalSource);
  writeFileSync(path.join(seed, 'oracle.mjs'), "import assert from 'node:assert/strict';\nimport {value} from './src/value.mjs';\nfor (const x of [-1,0,1,8]) assert.equal(value(x), x + 1);\n");
  writeFileSync(path.join(seed, 'package.json'), '{"type":"module"}\n');
  writeFileSync(path.join(seed, '.gitignore'), 'build/\n');
  const git = (...args) => execFileSync('git', args, { cwd: seed, encoding: 'utf8', windowsHide: true });
  git('init', '--quiet'); git('config', 'core.autocrlf', 'false'); git('add', '.');
  git('-c', 'user.name=Contract fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture');
  process.once('exit', () => removeFixture(seed));
  return seed;
}

// Parse the actual published payload; bind placeholders, never a second schema.
export function documentedSimplifyContext() {
  const doc = readFileSync(new URL('../../../_refs/simplify/verification.md', import.meta.url), 'utf8');
  const block = [...doc.matchAll(/```yaml\r?\n([\s\S]*?)```/gu)]
    .map(match => parse(match[1])).find(value => value?.simplify_context);
  assert.ok(block, 'canonical simplify_context example exists');
  assert.equal(block.simplify_context.schema_version, 2, 'documented executable schema');
  return structuredClone(block.simplify_context);
}

export async function simplifyFixture(t, options = {}) {
  const { createSimplifyEvidenceSession } = await import('../../../_refs/simplify/repository-evidence.mjs');
  const root = mkdtempSync(path.join(tmpdir(), 'simplify-contract-'));
  t.after(() => removeFixture(root));
  // Copy an immutable local seed; each test still has an independent real Git root.
  cpSync(seedRepository(), root, { recursive: true });
  const write = (file, bytes) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), bytes);
  };
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
  if (options.initial) {
    options.initial({ root, write, git });
    git('add', '.');
    // Synthetic history is confined to this temporary fixture repository.
    git('-c', 'user.name=Contract fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture variant');
  }
  const revision = git('rev-parse', 'HEAD').trim();
  options.setup?.({ root, write, git });
  const hunks = [{ path: sourcePath, start_line: 1, end_line: 4 }];
  let command = { command: [process.execPath, 'oracle.mjs'], cwd: '.', scope: hunks };
  const template = documentedSimplifyContext();
  const hostOptions = typeof options.session === 'function' ? options.session({ root, revision, command, hunks }) : options.session;
  if (hostOptions?.verification_commands?.length === 1) command = hostOptions.verification_commands[0];
  const session = createSimplifyEvidenceSession({
    root, repository_id: owner, change_ref: path.basename(root),
    user_scope: hunks,
    verification_commands: [command],
    classify_source: ({ path: file }) => ({
      kind: file.startsWith('src/') ? 'executable' : 'protected',
      hunks, protected_surfaces: [],
    }),
    // A deliberately narrow, actual oracle for this tiny fixture. Production
    // hosts must supply their own content-bound applicability/preservation check.
    verify_preservation: ({ before, after }) => {
      const a = before[sourcePath].toString(), b = after[sourcePath].toString();
      const signature = text => text.match(/export function value\(input\)/u)?.[0];
      const literals = text => text.match(/(['"`])(?:\\.|(?!\1).)*?\1/gu) ?? [];
      const okay = signature(a) === signature(b) && JSON.stringify(literals(a)) === JSON.stringify(literals(b));
      return Object.fromEntries(Object.keys(template.preserved_surfaces).map(key => [key, {
        status: okay ? 'verified' : 'blocked', reason: 'Fixture signature/literal guard plus executed numeric oracle.',
      }]));
    },
    ...hostOptions,
  });
  const context = template;
  context.session_id = session.id;
  context.artifact_identity.owner_module_id = hostOptions?.owner_module_id ?? null;
  context.artifact_identity.owner_repository_id = hostOptions?.repository_id ?? owner;
  context.artifact_identity.execution_host_repository_id = hostOptions?.execution_host_repository_id ?? hostOptions?.repository_id ?? owner;
  if (hostOptions?.approved_plan) {
    context.invocation = 'approved-plan';
    context.approved_plan_step = { artifact_ref: hostOptions.approved_plan.artifact.metadata.repository_relative_path, approval_hash: hostOptions.approved_plan.approval_hash, step_id: hostOptions.approved_plan.step_id };
    context.artifact_context.source_plan = context.approved_plan_step.artifact_ref;
  }
  context.target_root = root;
  context.source_revision = revision;
  context.artifact_context.change_ref = path.basename(root);
  context.scope.requested = [sourcePath];
  context.scope.eligible_files = [sourcePath];
  context.scope.eligible_hunks = hunks;
  context.baseline.snapshot = session.captureSnapshot();
  context.verification.before = options.noBaseline ? [] : [session.runVerification(command)];
  const runtime = { session };
  const preflight = () => contract.evaluateSimplifyPreflight(context, runtime);
  const finish = (authorization, edits = [{ path: sourcePath, content: simplifiedSource }]) => {
    assert.equal(authorization.write_authorized, true, JSON.stringify(authorization));
    session.applyEdits(authorization.preflight_ref, edits);
    const post = structuredClone(context);
    post.phase = 'postflight';
    post.preflight_ref = authorization.preflight_ref;
    post.passes = session.ledger();
    post.verification.after = [session.runVerification(command)];
    return contract.evaluateSimplifyPostflight(post, runtime);
  };
  return { root, write, git, session, context, command, runtime, preflight, finish };
}
