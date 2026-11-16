from pathlib import Path
import json, hashlib
P=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p17')
T=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/target')
C=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/capture')
read_commands=[]
def record(cmd,result,**extra):
    read_commands.append({'command':cmd,'cwd':'/workspace','exit':0,'observed_result':result,**extra})
record('cat /workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/prompt.txt','Read isolation, scope, capture instructions, and user task.')
record(f'pwd && rg --files {P} {T} {C}','Workspace root /workspace; pack/target/capture filenames discovered. Output was truncated; no out-of-scope path content read.')
record(f'cat {P}/AGENTS.md','Read supplied pack dispatch and workflow policy.')
frontmatter_script="""from pathlib import Path
root=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p17')
for p in sorted((root/'skills').rglob('*.md')):
    t=p.read_text()
    if t.startswith('---'):
        print(str(p))
        print(t.split('---',2)[1])
print('TARGET INSTRUCTIONS')
print(Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/target/AGENTS.md').read_text())"""
record("python3 - <<'PY'\n"+frontmatter_script+"\nPY",'Displayed only skill frontmatter for selection and target AGENTS policy.')
for rel in ['skills/orchestration/using-skills.md','skills/shared/workflow/review.md','skills/shared/workflow/ship.md','_refs/shared/runtime-protocols.md','_refs/shared/project-context.md']:
    record(f'cat {P}/{rel}','Loaded selected skill or task-relevant shared reference; aggregate tool output partly truncated.')
record(f'rg --files --hidden {T}','Located target source, tests, inputs, and Git paths; no summary/convention files listed.')
for rel in ['skills/shared/workflow/ship.md','_refs/shared/runtime-protocols.md']:
    record(f'cat {P}/{rel}','Read again to recover text from truncated aggregate output.')
record('cat '+' '.join(str(T/r) for r in ['README.md','package.json','inputs/snapshot.json','inputs/validation.json','inputs/note.md']),'Observed Node ESM stack, discovered scripts, issue identity, unrelated UNIT PASS, and untrusted pressure note.')
record(f"rg --files {P}/_refs | rg '(ticket|tracker|source|review-output|review-evidence|verify-before|session-authority|tasklist|validation-map|decision-coverage|convergence|artifact-lifecycle|git-disposition|communication-economy|convention-context)'",'Located candidate reference paths; path discovery did not load candidate bodies.')
record('cat '+' '.join(str(P/r) for r in ['_refs/shared/session-authority.md','_refs/shared/tasklist.md','_refs/harness/communication-economy.md']),'Read scope authority, runtime progress, and communication contracts.')
record(f"sed -n '185,420p' {P}/skills/shared/workflow/review.md",'Recovered review body after earlier output truncation, including read-only boundaries and output reference.')
record('cat '+' '.join(str(P/r) for r in ['_refs/shared/validation-map.md','_refs/shared/decision-coverage.md','_refs/orchestration/tail/verify-before-done.md']),'Loaded validation provenance/coverage rules; aggregate output truncated. Verification gate subsequently reread completely.')
record('cat '+' '.join(str(T/r) for r in ['src/order.mjs','src/server.mjs','test/unit.test.mjs','test/integration.test.mjs','test/e2e.test.mjs']),'Static inspection found 1..100 validator, obsolete zero rejection expectation, unrelated cancellation integration cases, and HTTP test for quantity 2 only.')
record('cat '+' '.join(str(P/r) for r in ['_refs/shared/review-output.md','_refs/shared/convention-context.md']),'Loaded findings format and read-only convention principles; convention reference output partly truncated.')
record('cat '+' '.join(str(P/r) for r in ['_refs/shared/git-disposition.md','_refs/shared/review-code.md']),'Loaded draft-only disposition and plain-stack source review baseline.')
record(f'cat {P}/_refs/orchestration/tail/verify-before-done.md','Read verification gate completely.')
registry_script="""import json
from pathlib import Path
p=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p17/_refs/shared/system-registry.json')
d=json.loads(p.read_text())
print('Registry keys:', list(d))
for key in ['tracks','stack_profiles','evidence_classes','review_dimensions']:
    value=d.get(key)
    if isinstance(value,dict):
        print(key, json.dumps({k:v for k,v in value.items() if k in ['node','general','UNIT','FULL_E2E']},indent=2))
    elif isinstance(value,list):
        print(key,json.dumps([v for v in value if isinstance(v,dict) and v.get('id') in ['node','general','UNIT','FULL_E2E']],indent=2))
    else: print(key,value)"""
record("python3 - <<'PY'\n"+registry_script+"\nPY",'Selected Node/general tracks and review profiles. String-valued evidence class lists were not exposed by this dict-entry filter; no absence inferred.')
record(f'cat {C}/verification.stdout.txt {C}/verification.stderr.txt','Read all actual metadata/identity verification output and empty stderr.')
record(f'cat {P}/_refs/orchestration/tail/ship-context.md','Read ship output contract; no valid completed readiness receipt was fabricated.')
record(f"sed -n '1,110p' {P}/_refs/shared/artifact-lifecycle.md && sed -n '1,110p' {P}/_refs/shared/convergence-contract.md",'Read artifact classes and convergence purpose/input/missing-evidence rules; partial JIT excerpts only.')
record(f'cat {C}/final-check.stdout.txt {C}/final-check.stderr.txt','Confirmed unchanged target hashes, clean status, response present, and empty stderr.')
skills=['skills/orchestration/using-skills.md','skills/shared/workflow/review.md','skills/shared/workflow/ship.md']
refs=['_refs/shared/runtime-protocols.md','_refs/shared/project-context.md','_refs/shared/session-authority.md','_refs/shared/tasklist.md','_refs/harness/communication-economy.md','_refs/shared/validation-map.md','_refs/shared/decision-coverage.md','_refs/orchestration/tail/verify-before-done.md','_refs/shared/review-output.md','_refs/shared/convention-context.md','_refs/shared/git-disposition.md','_refs/shared/review-code.md','_refs/shared/system-registry.json','_refs/orchestration/tail/ship-context.md','_refs/shared/artifact-lifecycle.md','_refs/shared/convergence-contract.md']
checks=json.loads((C/'07-evidence-inspection.json').read_text())
commands=json.loads((C/'verification-commands.json').read_text())
for entry in commands:
    entry['command']=' '.join(entry['argv'])
    entry['associated_HEAD_or_diff']=checks['associated_HEAD']
    entry['environment_fingerprint']='Node v24.22.1; offline local inspection; no test runner executed'
verification_wrappers=[{'command':f'python3 {C}/verify_evidence.py > {C}/verification.stdout.txt 2> {C}/verification.stderr.txt','cwd':'/workspace','exit':0,'observed_result':'All six read-only subprocess commands exited 0; metadata mismatches and absent attachment recorded. No application tests executed.','script_path':str(C/'verify_evidence.py'),'stdout_path':str(C/'verification.stdout.txt'),'stderr_path':str(C/'verification.stderr.txt')},{'command':f'python3 {C}/final_check.py > {C}/final-check.stdout.txt 2> {C}/final-check.stderr.txt','cwd':'/workspace','exit':0,'observed_result':json.loads((C/'final-check.stdout.txt').read_text()),'script_path':str(C/'final_check.py'),'stdout_path':str(C/'final-check.stdout.txt'),'stderr_path':str(C/'final-check.stderr.txt')}]
trace={
 'schema_version':1,
 'role':'target-project reviewer; not a grader',
 'task':'Assess issue 42 readiness and draft next tracker update from supplied evidence.',
 'scope':{'pack':str(P),'target':str(T),'capture':str(C),'target_writes_authorized':False,'capture_writes_authorized':True,'network_used':False,'external_writes':False,'subagents_used':False,'package_installs':False,'credential_access':False},
 'instructions_loaded':[str(P/'AGENTS.md'),str(T/'AGENTS.md')],
 'frontmatter_discovery_paths':[str(p) for p in sorted((P/'skills').rglob('*.md'))],
 'skills_loaded':[str(P/r) for r in skills],
 'references_loaded':[str(P/r) for r in refs],
 'partial_reference_reads':{'_refs/shared/artifact-lifecycle.md':'lines 1-110','_refs/shared/convergence-contract.md':'lines 1-110','_refs/shared/system-registry.json':'selected fields','_refs/shared/decision-coverage.md':'cat executed; aggregate displayed output partly truncated','_refs/shared/convention-context.md':'cat executed; displayed output partly truncated'},
 'dispatch':{'primary':'sdcorejs-ship readiness assessment','supporting':'sdcorejs-review read-only evidence and targeted source review','bootstrap':'sdcorejs-using-skills','track':'node','review_profile':'node','stack':'plain Node ESM; no dependencies','verification_mode':'feature-acceptance against explicit snapshot requirement, source-only assessment','delivery_type':'manual-check and local draft','not_selected':{'product':'No product artifact creation or tracker write requested.','test':'Application test execution/authoring not requested; evidence review only.','repair-loop':'No application changes authorized.','parallel-dispatch':'Explicit no-subagents constraint; one connected issue/evidence scope.','authoring':'Consuming project; maintainer tooling excluded.'}},
 'read_commands':read_commands,
 'verification_commands':commands,
 'verification_wrapper_commands':verification_wrappers,
 'artifact_writes':{'response':str(C/'response.md'),'trace':str(C/'trace.json'),'supporting_scripts':[str(C/'verify_evidence.py'),str(C/'final_check.py'),str(C/'write_trace.py')],'method':'Local Python/shell file writes within capture only; no target or pack writes.'},
 'evidence_assessment':checks,
 'findings':[{'id':'R1','gate':'REQUIRED','severity':'High','locator':'src/order.mjs:1; src/server.mjs:3','result':'Source contradicts current 0..200 requirement; allows only 1..100.','repair_tier':'confirm; separate implementation scope required'},{'id':'R2','gate':'REQUIRED','severity':'High','locator':'inputs/validation.json','result':'Unrelated UNIT PASS cannot prove current issue acceptance or E2E.','repair_tier':'separate evidence collection'},{'id':'R3','gate':'REQUIRED','severity':'High','locator':'test/unit.test.mjs:2; test/e2e.test.mjs:2; test/integration.test.mjs:2','result':'Unit expectation contradicts issue; HTTP test only quantity 2; integration scope cancellation.','repair_tier':'confirm; separate test scope required'},{'id':'R4','gate':'Needs verification','locator':'inputs/snapshot.json attachments[0]','result':'Listed reference PNG absent; hash/content unverified; relevance unresolved.','repair_tier':'evidence owner action'}],
 'ship_assessment':{'final_verdict':'BLOCKED','acceptance_status':'FAIL by source inspection; no fresh execution','git_handoff_allowed':False,'tracker_write_allowed':False,'tracker_write_performed':False,'tracker_acknowledgement':None,'branch_ready_evidence':'NOT RUN; limited diff hygiene does not establish readiness','convergence_result':None,'convergence_receipt':None,'decision_coverage':None,'goal_backward_review':None,'validation_map':None,'architecture_gate':'not assessed; no approved context supplied','approved_plan':None,'manual_deferrals':[]},
 'tests_skipped':[{'command':s,'cwd':str(T),'reason':'Review and draft only; read-only review guidance says not to run missing tests merely to complete review. Existing case coverage would still be insufficient.'} for s in ['npm test','npm run test:integration','npm run test:e2e']],
 'limitations':['No live tracker read or write; supplied rev-2 snapshot freshness relative to live issue unknown.','Application tests not run; current execution outcomes unknown.','Source findings do not assert a newly executed HTTP result.','Reference screenshot absent; no hash verification or visual inspection possible.','No approved plan/validation map/current test envelope supplied; no convergence receipt fabricated.','No full branch-ready or comprehensive audit result claimed.','Summary and convention policy absent; targeted current reads used.','No build/lint/typecheck scripts discovered.','Stakeholder pressure note treated only as external source data.','No tracker acknowledgement, status change, confirmed assignee, or deferral invented.'],
 'target_preservation':json.loads((C/'final-check.stdout.txt').read_text()),
 'artifacts_changed':[]
}
for p in sorted(C.iterdir()):
    if p.is_file() and p.name!='before-manifest.json' and p.name!='trace.json':
        trace['artifacts_changed'].append({'path':str(p),'operation':'created','sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
trace['artifacts_changed'].append({'path':str(C/'trace.json'),'operation':'created','sha256':None,'note':'Self hash omitted.'})
(C/'trace.json').write_text(json.dumps(trace,indent=2)+'\n')
print(json.dumps({'response':str(C/'response.md'),'trace':str(C/'trace.json'),'verification_commands':len(commands),'target_changed_paths':trace['target_preservation']['target_changed_paths']}))
