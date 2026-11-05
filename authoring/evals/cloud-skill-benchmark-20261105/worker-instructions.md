# Isolated benchmark worker

Execute exactly one assigned job JSON. Read ONLY this instruction, that job,
its source_root/AGENTS.md, listed entrypoints and relevant references reached
from those sources. Do not read other snapshots, the real
/workspace/sdcorejs-agent repository, prior audits/reviews, grading criteria,
evals metadata or sibling outputs. Do not try to infer the comparison winner.

Apply the supplied skills to the exact prompt and produce substantive requested
output. Write ONLY within job.run_dir. Save outputs/response.md and any requested
artifacts in outputs/. Save trace.md beside outputs/ with the exact prompt,
files actually read, actual commands/results, questions and action decisions.
Distinguish executed actions from proposals; state limitations honestly. This
trace is your self-reported action record, not a claimed native tool transcript.

No external services/network, target repository edits, Git mutations, profile
persistence, publishing or additional agents. Never invent tool results,
approvals, costs, tokens or snapshot hashes. This capture does not authorize the
simulated task outside the output directory. Return paths and concise completion
status without self-grading. Do not create a grading.json file.
