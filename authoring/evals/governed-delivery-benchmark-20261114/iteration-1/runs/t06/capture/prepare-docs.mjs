import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { selectDocumentationProfile, selectDocumentationCoverage, planDocumentationUpdate, hashDocumentationContent } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/documentation/documentation-profile.mjs';
import { buildCanonicalEntryPath, classifyDocumentationPath, validateDocumentKey } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/shared/documentation-layout.mjs';
import { stableRepositoryId } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/shared/repository-contract.mjs';
import { resolveDocumentationAction } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/documentation/intent.mjs';

const root = '/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t06/target';
const capture = '/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t06/capture';
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const head = execFileSync('git', ['rev-parse', 'HEAD'], {cwd:root, encoding:'utf8'}).trim();
const repositoryId = stableRepositoryId({remote_url:execFileSync('git', ['config','--get','remote.origin.url'], {cwd:root, encoding:'utf8'}).trim()});
const generatedAt = new Date().toISOString();
const original = read('docs/operator-guide.md');
fs.writeFileSync(path.join(capture,'operator-guide.before.md'), original, {flag:'wx'});
const evidence = {
  tasks:[{id:'assess-cancellation-eligibility',source_refs:['docs/operator-guide.md','src/order.mjs:2','test/integration.test.mjs:2']}],
  roles:[{id:'operator',source_refs:['src/order.mjs:2']}],
  features:[{id:'cancellation-eligibility',source_refs:['src/order.mjs:2','src/server.mjs:3']}]
};
const guideProfile = selectDocumentationProfile({audience:'operator',requested_scope:'task',evidence});
const technicalProfile = selectDocumentationProfile({audience:'maintainer',requested_scope:'feature',evidence});
assert.equal(guideProfile.status,'selected');
assert.equal(technicalProfile.status,'selected');
const action = resolveDocumentationAction({requested_action:'technical-doc'});
const technicalPath = buildCanonicalEntryPath('technical-docs','order-cancellation');
assert.equal(validateDocumentKey('technical-docs','order-cancellation').ok,true);
assert.equal(classifyDocumentationPath(technicalPath).kind,'canonical-entry');
assert.equal(fs.existsSync(path.join(root,technicalPath)),false);
assert.equal(fs.existsSync(path.join(root,'.sdcorejs/documentation/technical-docs/order-cancellation.md')),false);

const criteria = [
  {id:'AC-CANCEL-1',text:'operators can cancel draft orders; submitted orders are locked.',status:'accepted',lifecycle:'active'},
  {id:'AC-NOTIFY-2',text:'notify the customer when cancelled. No notification code exists.',status:'proposed',lifecycle:'active'},
  {id:'AC-OLD-3',text:'administrators may cancel submitted orders.',status:'accepted',lifecycle:'superseded'}
];
let coverageCompatibility;
try {
  selectDocumentationCoverage({sources:[{source_id:'product-draft',kind:'prd',repository_id:repositoryId,contract_id:'order-cancellation',source_ref:'inputs/product-draft.md',lifecycle:'active',content:read('inputs/product-draft.md'),criteria}],verified_current_specs:[]});
  coverageCompatibility = {status:'supported'};
} catch(error) {
  coverageCompatibility = {status:'unsupported-criterion-identifiers',message:error.message,identifiers_preserved:criteria.map(c=>c.id)};
}
const coverage = selectDocumentationCoverage({sources:[],verified_current_specs:[]});
assert.equal(coverage.status,'gap');
assert.equal(coverage.coverage_total,null);

const guideMetadata = `---\ndocumentation_profile_version: 1\ndocumentation_scope: task\ndocumentation_audience: operator\nsource_revision: ${head}\ngenerated_at: ${generatedAt}\ncoverage: { status: gap, total: null, met: null, partial: null, missing: null }\n---\n\n`;
const addition = `
### Check whether cancellation is allowed

Only an operator may cancel an order, and only while it is a draft.

1. Confirm the order reference with the caller before acting.
2. Check your role and the order's current state against the table below. If either is unknown, do not assume cancellation is allowed.
3. Use the result to explain whether the request is eligible. This version has no way to complete a cancellation, even for an eligible draft. Do not tell the caller that the order has been cancelled.

| Your role and the order's state | What to do |
|---|---|
| Operator; draft | The request is eligible under the cancellation rule, but cancellation cannot be completed in this version. |
| Operator; submitted | Stop: submitted orders cannot be cancelled. |
| Any role other than operator, including administrator | You cannot cancel the order, even if it is a draft. Refer the request to an operator; the order must still be a draft. |
| Operator; any state other than draft | Cancellation is blocked. |

### When the request cannot proceed

For urgent exceptions, contact the duty operator as noted above. This escalation does not grant permission to cancel a submitted order or override the draft-only rule.

There is no cancellation screen or action in this version, so no button sequence or success confirmation can be provided. An eligibility check does not change the order. Automatic customer notifications are not available; do not promise that a cancellation notification will be sent.

### Scope of this guidance

This guide applies the user-approved AC-CANCEL-1 rule. The rule is present, but a complete cancellation workflow is not implemented or verified. Existing notes above are preserved verbatim.

The notification proposal AC-NOTIFY-2 is not approved or implemented. The superseded AC-OLD-3 statement does not permit administrators to cancel submitted orders.

Formal requirement coverage totals are not assessed because no verified current specification is available. See the [technical companion](../.sdcorejs/documentation/technical-docs/order-cancellation/order-cancellation.md) for the source evidence and verification limits.
`;
const guide = guideMetadata + original + addition;
const guidePlan = planDocumentationUpdate({existing:original,generated:guide,expected_content_hash:hashDocumentationContent(original)});
assert.equal(guidePlan.status,'proposal');
assert.equal(guidePlan.content,original);

const technical = `---
artifact_id: technical-order-cancellation
artifact_kind: documentation-asset
change_ref: operator-cancellation-guide
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-documentation
repository_id: ${repositoryId}
repository_role: standalone
repository_relative_path: ${technicalPath}
source_revision: ${head}
app_revision: ${head}
git_head: ${head}
generated_at: ${generatedAt}
documentation_profile_version: 1
documentation_scope: feature
documentation_audience: maintainer
tracks: [documentation, node]
guide_path: docs/operator-guide.md
source_refs: [src/order.mjs, src/server.mjs, test/integration.test.mjs, test/unit.test.mjs, test/e2e.test.mjs, package.json, README.md, inputs/product-draft.md]
coverage: { status: gap, total: null, met: null, partial: null, missing: null }
---

# Order cancellation: implementation and evidence

The operator guide documents eligibility and the current inability to complete cancellation. The approved documentation behavior comes from the user's task: AC-CANCEL-1 permits only an operator to cancel a draft and blocks submitted orders. External draft labels do not grant approval.

## Implemented contract

In \`src/order.mjs:2\`, \`canCancel(role, state)\` returns \`role === 'operator' && state === 'draft'\`. This exact, case-sensitive comparison returns a boolean. It does not authenticate the caller, look up an order, change state, persist a cancellation, or send a notification. Other role or state values return false, including administrator/draft and operator/submitted.

In \`src/server.mjs\`, \`makeServer()\` exposes only \`POST /orders\`, validates \`quantity\`, and returns that quantity with HTTP 201 (or HTTP 400 for invalid input). Other methods or URLs return HTTP 404. It imports \`quantity\`, not \`canCancel\`. There is no cancellation endpoint, order lookup, authenticated operator workflow, or cancellation state transition. Do not document an invented cancellation URL or an API authorization guarantee.

The README confirms there is no browser UI. Screenshots, button labels, and a browser cancellation sequence therefore do not apply. No dependency or application-code changes are part of this documentation update.

## Permissions and blocked states

| Supplied role | Supplied state | Eligibility result |
|---|---|---|
| operator | draft | true |
| operator | submitted | false |
| administrator | draft or submitted | false |
| any value other than operator | any state | false |
| operator | any value other than draft | false |

These are predicate results, not proof of a protected cancellation API. The guide tells operators to confirm the reference, check eligibility, stop for blocked states, and avoid claiming a completed cancellation. The duty-operator escalation is retained from the original human note and provides no override.

## Requirement provenance and coverage limits

| Identifier | Authority or source | Documented result |
|---|---|---|
| AC-CANCEL-1 | Explicitly approved in the current user task; also mentioned in \`inputs/product-draft.md\` | Permissions and blocked states are documented. Implementation is partial: the predicate exists, but no complete cancellation workflow exists. |
| AC-NOTIFY-2 | External product draft; explicitly unapproved in the user task | Proposed and unimplemented. Excluded from approved scope and any completion count. |
| AC-OLD-3 | External product draft marks it superseded; it conflicts with the current approved task | Excluded. No administrator or submitted-order exception is documented. |

There is no verified current approved spec snapshot or decision-history identity in this repository. Formal pack coverage remains \`gap\`, with null totals; no acceptance-completion percentage is claimed. The pack's coverage selector also accepts only numeric IDs matching \`AC-000\`, so these supplied identifiers cannot be passed through it. They remain unchanged in the documentation; they are not renumbered or promoted into fabricated spec receipts. Direct user approval remains authoritative for this scoped guide update.

## Verification and gaps

Run the repository's existing local service checks with \`npm run test:integration\`. Despite the script name, its two assertions directly call the predicate: operator/draft is true and operator/submitted is false. It does not test role authentication, persistence, notifications, or a cancellation endpoint. The existing test file has no non-operator denial assertion; a one-off in-process role/state matrix was used for this documentation check without changing tests.

\`npm test\` checks quantity handling, not cancellation. The existing \`npm run test:e2e\` test uses actual loopback HTTP and verifies only \`POST /orders\`. It was not run for this offline task because network use is prohibited; it would not prove cancellation even if it passed. No end-to-end cancellation success is claimed.

Current verification results and exact outputs are recorded in the requested capture directory, outside the repository. Markdown checks cover preservation of all original guide text, local-link targets, UTF-8 hygiene, scoped metadata, and unchanged source/tests/dependencies. A usable cancellation action and its end-to-end verification remain absent and outside this documentation task.
`;
const technicalPlan = planDocumentationUpdate({existing:null,generated:technical});
assert.equal(technicalPlan.status,'created');
fs.writeFileSync(path.join(capture,'operator-guide.proposed.md'),guide,{flag:'wx'});
fs.writeFileSync(path.join(capture,'order-cancellation.proposed.md'),technical,{flag:'wx'});
const sourcePaths=['AGENTS.md','README.md','package.json','src/order.mjs','src/server.mjs','test/unit.test.mjs','test/integration.test.mjs','test/e2e.test.mjs','inputs/product-draft.md'];
const sourceHashes=Object.fromEntries(sourcePaths.map(p=>[p,hashDocumentationContent(read(p))]));
const result={head,repositoryId,repository_role:'standalone',generatedAt,guideProfile,technicalProfile,action,technicalPath,sourceHashes,coverage,coverageCompatibility,guidePlan:{status:guidePlan.status,previous_content_hash:guidePlan.previous_content_hash,proposed_hash:hashDocumentationContent(guide),preserve_original_as_contiguous_bytes:true},technicalPlan:{status:technicalPlan.status,content_hash:technicalPlan.content_hash},write_authority:'Current user explicitly authorizes this guide update, appropriate technical companion and scoped metadata. Apply only additive precise edits preserving every original byte; no whole-document ownership claimed for the guide.'};
fs.writeFileSync(path.join(capture,'documentation-plan.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result,null,2));
