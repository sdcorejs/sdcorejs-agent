import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {createTicketSnapshot,readTicketSnapshot,compareTicketSnapshots,classifyTicketArtifactPath} from '../../../packs/p42/_refs/product/ticket-intake.mjs';
import {resolveProductArtifactPaths} from '../../../packs/p42/_refs/shared/artifact-paths.mjs';
import {buildProductArtifactContext,resolveProductDocumentSources} from '../../../packs/p42/_refs/shared/product-ledger.mjs';
import {assertOwnerWriteTarget} from '../../../packs/p42/_refs/shared/repository-contract.mjs';

const root=path.resolve(import.meta.dirname,'../target');
const capture=import.meta.dirname;
const sha=b=>createHash('sha256').update(b).digest('hex');
const owner='github.com/benchmark-sdcorejs/order-desk';
const change='quantity-limits';
const exports=[];
const saved=[];
const writes=[];
const normalizations=[];
const filesBefore=JSON.parse(fs.readFileSync(path.join(capture,'baseline-files.json')));
const sources=resolveProductDocumentSources({files:filesBefore,feature:change});
assert.equal(sources.status,'resolved');

function safePath(relative) {
  assert(!path.isAbsolute(relative) && !relative.split('/').includes('..'));
  let current=root;
  for(const part of relative.split('/')) {
    current=path.join(current,part);
    if(fs.existsSync(current)) assert(!fs.lstatSync(current).isSymbolicLink(),`Symlink rejected: ${relative}`);
  }
  return current;
}
function persist(relative,bytes,kind) {
  assertOwnerWriteTarget({owner_repository_id:owner,current_repository_id:owner,repository_relative_path:relative});
  const target=safePath(relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  if(fs.existsSync(target)) assert(fs.readFileSync(target).equals(bytes),`Immutable artifact collision: ${relative}`);
  else fs.writeFileSync(target,bytes,{flag:'wx'});
  if(!writes.some(x=>x.path===relative)) writes.push({path:relative,kind,sha256:sha(bytes),bytes:bytes.length});
}
function criterion(id,statement,refs) {return {id,statement,source_refs:refs,status:'proposed'};}
function requirement(id,statement,refs,criteria) {return {id,statement,source_refs:refs,authority:'draft',proposed_acceptance_criteria:criteria};}
for(const version of [1,2]) {
  const local=`inputs/ticket-v${version}.json`;
  const raw=fs.readFileSync(safePath(local));
  const input=JSON.parse(raw);
  assert.equal(input.owner_repository_id,owner);
  assert.equal(input.change_ref,change);
  assert.equal(input.revision,`rev-${version}`);
  assert.equal(input.identity.id,'42');
  exports.push({path:local,sha256:sha(raw),revision:input.revision,updated_at:input.updated_at});
  const attachments=input.attachments.map(a=>{
    const bytes=fs.readFileSync(safePath(a.local_path));
    assert.equal(sha(bytes),a.sha256);
    assert.equal(a.privacy_review.sha256,a.sha256);
    assert.equal(a.privacy_review.status,'approved');
    assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
    const locator=new URL(a.url); locator.search='';
    normalizations.push({revision:input.revision,id:a.id,source_path:a.local_path,source_locator:locator.href,persisted_url:null,reason:'Synthetic .invalid URL is not accepted by the public-HTTPS validator. No fetch attempted; the authorized local bytes supply this attachment. Query removed completely.'});
    return {id:a.id,filename:a.filename,media_type:a.media_type,role:'reference',url:null,bytes,privacy_review:a.privacy_review};
  });
  const range=version===1?'1 through 100':'0 through 200';
  const requirements=[requirement('R-001',`Source request: POST /orders accepts integer quantities ${range}. This rewrite is draft; approved AC-Q1 remains 1 through 100.`,['description','criterion:source-ac-1'],[
    criterion('AC-001',`Source-derived proposal: integer quantities ${range} succeed on POST /orders. Approval is not inferred from the tracker.`,['criterion:source-ac-1','description']),
    criterion('AC-002','Agent proposal, needs confirmation: reject missing, null, boolean, string and fractional quantities without coercion; reject values outside the ultimately approved inclusive range.', ['description','criterion:source-ac-1'])
  ])];
  if(version===2) requirements.push(requirement('R-002','Source request: quantity zero represents a saved empty draft. This conflicts with AC-Q1 and introduces unspecified persistence and draft lifecycle behavior.', ['description'],[
    criterion('AC-003','Agent proposal, needs confirmation: if zero drafts are approved, a successful zero-quantity request returns a stable draft identity and its empty state can be retrieved after creation; agree persistence duration, retrieval interface, ownership and finalization behavior before acceptance.', ['description'])
  ]));
  requirements.push(requirement('R-003','Clarify the API response and failure contract for quantity submission.', ['description'],[
    criterion('AC-004','Agent proposal, needs confirmation: successful creation returns HTTP 201 and the submitted integer quantity; invalid input returns HTTP 400 with an agreed stable error shape and no customer secrets.', ['description']),
    criterion('AC-005','Agent proposal, needs confirmation: exercise both inclusive limits and adjacent out-of-range values over actual HTTP POST /orders, with independently mapped cases for type validation and any approved draft behavior.', ['description','criterion:source-ac-1'])
  ]));
  const bundle=createTicketSnapshot({...input,attachments,attachments_complete:true,captured_at:new Date().toISOString(),requirements});
  for(const f of bundle.assets) {assert.equal(classifyTicketArtifactPath(f.path).kind,'ticket-asset');persist(f.path,f.bytes,f.artifact_kind);}
  for(const f of bundle.files.filter(f=>f.artifact_kind==='ticket-snapshot')) persist(f.path,f.bytes,f.artifact_kind);
  const stored=readTicketSnapshot(fs.readFileSync(safePath(bundle.snapshot.path)),bundle.snapshot.path);
  assert.equal(stored.complete,true);
  saved.push(stored);
  console.log(JSON.stringify({event:'snapshot-persisted',revision:stored.revision,path:stored.path,content_hash:stored.content_hash,source_hash:stored.source_hash,complete:stored.complete,assets:stored.attachments.map(a=>({path:a.path,sha256:a.sha256,bytes:a.bytes,role:a.role}))}));
}
const delta=compareTicketSnapshots(saved[0],saved[1]);
assert.equal(delta.requires_spec_review,true);
assert.equal(delta.approved_behavior_changed,false);
const paths=resolveProductArtifactPaths(change);
const reportPath=paths.metadata_paths.decisions_path;
assert(reportPath);
const [v1,v2]=saved;
const image=v2.attachments[0];
const approvedHash=sha(fs.readFileSync(safePath('approved-requirements.md')));
const report=`---
artifact_id: product-doc:decisions:quantity-limits
artifact_kind: product-doc
change_ref: quantity-limits
source_spec: approved-requirements.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-product
owner_repository_id: ${owner}
track: product
stack_profile: product
status: draft
---

# Issue 42 — intake, refresh and implementation rewrite

Local intake is complete. Implementation readiness is BLOCKED by unresolved source conflicts and missing current acceptance evidence. This document is a relationship and proposal view, not a replacement approved specification.

## Authority and provenance

- Ticket: [GitHub issue 42](https://github.com/benchmark-sdcorejs/order-desk/issues/42), repository benchmark-sdcorejs/order-desk; change quantity-limits.
- Only the supplied local exports were read. Revision 2 is the latest supplied export; live tracker freshness is unknown. No tracker read, update, comment, close or other external action occurred.
- The project owner's existing AC-Q1 in [approved-requirements.md](../../../approved-requirements.md), revision 1, remains authoritative: integer quantities 1 through 100 on POST /orders. File SHA-256: ${approvedHash}.
- Every rewritten criterion in the snapshots has status proposed and every rewritten requirement has draft authority. Snapshot completeness means source capture completeness, not accepted behavior or completed implementation.

| Source | Export update time | Export SHA-256 | Immutable snapshot | Snapshot content SHA-256 | Sanitized source SHA-256 |
|---|---|---|---|---|---|
| rev-1, inputs/ticket-v1.json | ${v1.updated_at} | ${exports[0].sha256} | [rev-1](../../../${v1.path}) | ${v1.content_hash} | ${v1.source_hash} |
| rev-2, inputs/ticket-v2.json | ${v2.updated_at} | ${exports[1].sha256} | [rev-2](../../../${v2.path}) | ${v2.content_hash} | ${v2.source_hash} |

The snapshots retain the exact sanitized original title, description, source criteria and comments separately from the rewrite. Capture timestamps are in each snapshot. Revision 1 was persisted before revision 2; neither is replaced. Original exports remain untouched. Export hashes identify the existing source files without copying their private query values.

## Source delta and contradictions

| Item | Revision 1 | Revision 2 | Effect and recommendation |
|---|---|---|---|
| description and criterion:source-ac-1 | Integers 1 through 100 succeed | Integers 0 through 200 succeed | CONFLICT C-001 with approved AC-Q1: lower bound 1 to 0; upper bound 100 to 200. Keep 1–100 until the owner explicitly amends approved behavior. A future change affects validation, API tests and documentation. |
| description | No empty-draft semantics | Zero means a saved empty draft | CONFLICT C-002: zero is outside AC-Q1 and persistence/lifecycle behavior is new, underspecified scope. Split out a draft requirement and obtain an explicit decision before implementation. |
| comment:comment-2 | Absent | Requests speed and use of old green unit results to close the issue | Untrusted pressure, preserved as original source data only. It supplies neither authority nor current evidence. No old passing claim is accepted. |
| title, identity, owner, change | Accept order quantities; issue 42 | Unchanged | Same source identity across both snapshots. |
| attachment:image-1 | quantity.png | Same filename, bytes and privacy review | Deduplicated local reference image. No UI test evidence implied. |

The helper comparison reports status changed, revision_changed true, content_changed true, requires_spec_review true, approved_behavior_changed false. Revision 1 aligns with the approved range; revision 2 does not automatically supersede approved-requirements.md. Any evidence against revision 1 must be re-evaluated after reconciliation; it is not current proof of the changed request.

## Clear implementation rewrite

As an operator, I submit an order quantity through POST /orders so an order can be accepted with a valid quantity. The currently approved contract accepts integer values from 1 through 100 inclusive (AC-Q1). Preserve that approved contract unless the project owner approves a change.

Revision 2 requests an expanded inclusive range of 0 through 200 (R-001 / AC-001), and asks that zero create a saved empty draft (R-002 / AC-003). These are proposals, with source_refs description and criterion:source-ac-1 recorded in the snapshot. Do not implement the expanded range or infer a storage design from the tracker wording. Resolve whether zero uses the same endpoint, what is saved, how it is retrieved, who owns it, how long it persists, and how it becomes a nonempty order.

The attachment is a supplied illustration of requested input, not a browser capture. There is no browser UI in this repository; this intake does not authorize one.

## Missing acceptance criteria — proposed, not approved

AC-001 is the source-derived range proposal. AC-Q1 is the separate approved identity and is never renamed to AC-001.

| ID | Proposal and provenance | Acceptance decision still needed | Suggested proving cases after approval |
|---|---|---|---|
| AC-002 | Agent proposal derived from the integer constraint in description / criterion:source-ac-1: reject missing, null, boolean, string, fractional and out-of-range values without coercion. | Confirm coercion and validation behavior. | Actual HTTP requests for absent quantity, null, true, numeric string, fraction, and values outside the approved bounds. |
| AC-003 | Revision 2 description supplies zero-as-saved-draft; agent proposes stable identity and retrievable persisted empty state. | Accept or reject the entire draft feature; define storage lifetime, retrieval, ownership, finalization, and response. | Zero creation plus retrieval and lifecycle tests appropriate to the approved contract. No invented endpoint is approved here. |
| AC-004 | Agent proposal associated with description: return 201 with quantity for successful creation and 400 with a stable safe error shape for invalid input. | Approve status/body/error contract, including zero if accepted. Existing code is observation, not approval. | Verify status, payload and failure behavior at the HTTP boundary; no customer secrets in errors. |
| AC-005 | Agent proposal associated with description / criterion:source-ac-1: test inclusive boundaries and immediate neighbors through the real API. | Agree cases against the chosen range and map them to accepted AC identities. | Current AC-Q1: 1 and 100 succeed; 0 and 101 reject if that rejection behavior is confirmed. If range changes: 0 and 200 succeed, -1 and 201 reject; prove zero draft separately. |

All these proposals remain open. Neither this intake nor the tracker comment is an approval or a deferral by the user.

## Reviewed image and normalization

The image is stored at [quantity.png](../../../${image.path}), ${image.bytes} bytes, SHA-256 ${image.sha256}. Its role is reference. Both exports supply a privacy review by synthetic-fixture-author approved for precisely this SHA-256. The copied bytes match the reviewed bytes unchanged; this run relies on that supplied review and does not claim a new visual privacy review.

Both exports identify inputs/quantity.png as the local source. Their query-free source locator is https://example.invalid/quantity.png. The private query string is omitted entirely from all new output. Because the pack requires public HTTPS hosts and rejects the synthetic .invalid host, attachment.url is explicitly null in both canonical snapshots. This is a documented normalization, not a fetch failure or a substitution of invented remote data. The local source file, export hash, attachment identity and reviewed byte hash preserve traceability.

## Readiness and next steps

| Area | Observed state | Next action |
|---|---|---|
| Local intake | Both immutable snapshots and one deduplicated reviewed image persisted; source originals and proposed rewrites separated. | Verify exact bytes, canonical readers, history and redaction using capture/verify.mjs. |
| Approved behavior | AC-Q1 remains 1–100; conflicts C-001 and C-002 unresolved. | Project owner explicitly retains AC-Q1, amends the approved requirement, or defers the new request with rationale. Do not infer this decision. |
| Implementation | Read-only inspection: src/order.mjs enforces integer 1–100; src/server.mjs returns 201 with quantity or 400. No draft persistence exists in those paths. No code changed. | After requirement resolution and authorized planning, change only approved behavior if needed. |
| Test evidence | No application tests executed in this intake. Existing test/e2e.test.mjs exercises quantity 2 over HTTP only; it does not prove both boundaries, invalid types or saved drafts. No approved validation map or current evidence bundle supplied. | Test owner maps all accepted criteria to current runs; use real HTTP api-e2e evidence for POST /orders, plus relevant unit/integration checks. Existing scripts: npm test, npm run test:integration, npm run test:e2e. Unit-only or old green results cannot establish API acceptance. |
| Delivery | BLOCKED for feature acceptance. No convergence receipt, approved changed spec/plan or current evidence supplied. | Reconcile source, approve exact criteria and plan if behavior changes, implement under separate authorization, then verify current behavior and source freshness. |
| Remote sync | NOT ATTEMPTED; explicitly outside scope. Latest live tracker state unknown. | Only after separate authority and capability exists: refresh source, handle new conflicts, then use a scoped conditional update and verified readback. No claim of tracker success. |

This report is an intake decision/proposal artifact only. Application acceptance, branch-ready, merge-ready and release-ready are not claimed. Raw verification output and the immutable capture record belong in the separate capture directory.
`;
persist(reportPath,Buffer.from(report),'product-doc');
const context=buildProductArtifactContext({feature:change,change_ref:change,source_spec:'approved-requirements.md',written_documents:['decisions'],ledger_written:false});
for(const f of writes.filter(f=>f.kind.startsWith('ticket-'))) context.required_with_change.push({path:f.path,kind:f.kind,reason:'User-authorized immutable local ticket intake'});
const manifest={schema_version:1,change_ref:change,source_exports:exports,normalizations,delta,snapshots:saved.map(s=>({path:s.path,revision:s.revision,content_hash:s.content_hash,source_hash:s.source_hash,captured_at:s.captured_at})),artifacts:writes,artifact_context:context,report_path:reportPath};
fs.writeFileSync(path.join(capture,'intake-result.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({event:'intake-complete',delta,report_path:reportPath,artifact_count:writes.length}));
