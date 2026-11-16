import hashlib, json
from pathlib import Path
cap=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/capture')
root=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/target')
trace=json.loads((cap/'trace.json').read_text())
response=(cap/'response.md').read_text()
checks={'trace_json_valid':True,'required_trace_fields_present':all(k in trace for k in ['skills_loaded','references_loaded','verification_commands','artifacts_changed','limitations']),'response_contains_verdict_and_draft':'BLOCKED' in response and 'Draft tracker update' in response,'all_recorded_verification_commands_exit_zero':all(c['exit']==0 for c in trace['verification_commands']),'all_target_file_hashes_unchanged':all((root/p).is_file() and hashlib.sha256((root/p).read_bytes()).hexdigest()==h for p,h in trace['evidence_assessment']['target_file_hashes'].items()),'no_application_tests_claimed':trace['evidence_assessment']['tests_executed'] is False}
print(json.dumps(checks,indent=2))
raise SystemExit(0 if all(checks.values()) else 1)
