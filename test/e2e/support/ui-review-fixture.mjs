import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { designFixture } from './design-handoff-fixture.mjs';
import { createDesignVerificationRuntime } from '../../../_refs/shared/design-verification.mjs';
import { createUiReviewRuntime, beginUiReviewObservation, recordUiEvidence } from '../../../_refs/shared/ui-review-contract.mjs';

export function uiReviewFixture(t, { scenario = 'action-popover', purpose = 'implemented-ui-conformance', required = ['source'], independent = false, baseline = false, authority = {}, reviewer = {} } = {}) {
  const f = designFixture(t);
  const doc = readFileSync(new URL('../../../_refs/shared/ui-review.md', import.meta.url), 'utf8');
  const sample = doc.match(/<!-- ui-review-v1-example -->\s*~~~json\n([\s\S]*?)\n~~~/u);
  if (!sample) throw Error('documented UI payload missing');
  const context = JSON.parse(sample[1]);
  Object.assign(context, { owner_repository_id: f.repo, execution_host_repository_id: f.repo, change_ref: f.handoff.metadata.change_ref, purpose });
  const target = context.ui_review.targets[0];
  Object.assign(target, { id: scenario, screen: scenario, state: scenario === 'action-popover' ? 'open' : scenario === 'mobile-table-selection' ? 'row-selected' : 'loaded' });
  context.ui_review.assessment_id = scenario + '-review';
  const screens = {
    'action-popover': '<main><button aria-expanded="true" aria-controls="actions">Actions</button><div id="actions" role="menu"><button role="menuitem">Edit</button></div></main>',
    'mobile-table-selection': '<main><table><tr aria-selected="true"><td><input type="checkbox" checked aria-label="Select row"></td><td>Order</td></tr></table></main>',
    'standalone-responsive-page': '<main><header><h1>Welcome</h1></header><section class="responsive-grid"><article>Feature</article></section></main>',
  };
  f.put('src/page.html', screens[scenario]);
  f.put('src/page.css', 'main{max-width:100%;}button:focus-visible{outline:2px solid;}');
  if (purpose === 'design-artifact') {
    target.source_paths = [f.handoff.metadata.repository_relative_path];
    context.file_scope = [...target.source_paths];
  }
  const policy = { targets: [target], obligations: [{ schema_version: 1, purpose, target_id: target.id, evidence_kinds: required, independent_review_required: independent, baseline_required: baseline }] };
  const visual = { owner_repository_id: f.repo, change_ref: context.change_ref, target_ids: [target.id] };
  const parentBody = { design_requirements: f.requirements, ui_review_requirements: policy, visual_contract: visual };
  const spec = f.approve('spec', '.sdcorejs/specs/design/orders.md', parentBody);
  const plan = f.approve('plan', '.sdcorejs/plans/design/orders.md', parentBody, [spec], { allowed_paths: ['src/**'], prohibited_paths: [] });
  f.handoff.metadata.parent_references = [spec, plan];
  const design = f.approve('design-handoff', f.handoff.metadata.repository_relative_path, f.handoff, [spec, plan]);
  if (baseline) context.ui_review.baseline = { kind: 'visual-contract', artifact_ref: spec, reason: null };
  const designRuntime = createDesignVerificationRuntime({ ...f.options(), expected: { ...f.options().expected, spec, plan, design }, artifact_references: [spec, plan, design] });
  const host = {
    root: f.root, owner: f.repo, source_runtime: designRuntime, design_runtime: designRuntime,
    authority: { owner_repository_id: f.repo, review_authorized: true, test_authorized: true,
      purposes: [purpose], dimensions: [...context.dimensions], file_scope: [...context.file_scope],
      targets: [target], commands: ['fixture-ui-capture'], output_paths: ['capture.png', 'interaction.json'], ...authority },
    reviewer_context: { kind: 'independent', author_context: 'design-author', reviewer_context: 'independent-reviewer',
      separate_context: true, separate_context_supported: true, ...reviewer },
    run_command: ({ command, cwd, target: observedTarget, kind }) => {
      // Actual local command, synthetic output. This models a trusted runner
      // boundary; it does not claim browser/product execution.
      const artifactPath = kind === 'rendered' ? 'capture.png' : 'interaction.json';
      const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
      const output = kind === 'rendered' ? Buffer.from(png, 'base64') : Buffer.from('{"keyboard":"executed-fixture"}');
      execFileSync(process.execPath, ['-e', 'require("node:fs").writeFileSync(process.argv[1],Buffer.from(process.argv[2],"base64"))', artifactPath, output.toString('base64')], { cwd, windowsHide: true });
      return { command, cwd: '.', exit_code: 0, target: observedTarget, kind, artifact_path: artifactPath,
        provenance: 'real-product', build_id: 'synthetic-fixture-build', image_width: 1, image_height: 1,
        assertions: [{ id: 'fixture-keyboard', result: 'PASS' }] };
    },
  };
  let runtime = createUiReviewRuntime(host);
  const capture = (kind, overrides = {}) => {
    const ref = recordUiEvidence(runtime, { kind, target_id: target.id, command: 'fixture-ui-capture', requirement_refs: [], ...overrides });
    context.ui_review.evidence_refs.push(ref); return ref;
  };
  const start = () => beginUiReviewObservation(runtime);
  const reset = (overrides = {}) => { runtime = createUiReviewRuntime({ ...host, ...overrides }); return runtime; };
  return { ...f, context, target, policy, host, designRuntime, capture, start, reset,
    get uiRuntime() { return runtime; }, specRef: spec, planRef: plan, designRef: design };
}
