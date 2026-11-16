# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Publication status:** ⚠️ INCOMPLETE
**Profile:** default
**Policy digest:** `sha256:64a069b8853f7123049a675d6853ef8d8b424792bb9a2a5157a73ec312f38ed4`
**Quality config:** packaged, `sha256:298ff2bf62132c8154217b7aa59fc1fd04f28cf75372f55620a2cbcd951d6549`, min score 70
**Generated:** November 14, 2026 at 09:00 AM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 13 |
| Validators Run | 13 |
| ✅ Passed | 13 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 30 unique findings (12 medium) / 30 occurrences / 30 raw records; 3 warnings without a finding |
| Duplicate Occurrences Reconciled | 0 |

## Finding Reconciliation

| Finding ID | Severity | Finding | Occurrences | Validators |
|------------|----------|---------|-------------|------------|
| `SEF-01a064412744ade41964` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'version' | 1 | QUALITY |
| `SEF-28414463d8d7c6b8288f` | MEDIUM | codex: Codex reads .agents/skills and .codex/skills (project and user). | 1 | Harness Compatibility |
| `SEF-2ab016a817c566724ba9` | MEDIUM | Missing recommended section: '&#35;&#35; Instructions' | 1 | Schema &amp; Repository Governance |
| `SEF-50a6ef93167f5463b35d` | MEDIUM | hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted. | 1 | Harness Compatibility |
| `SEF-55bbc1f1b2ab31ddd68e` | MEDIUM | Excessive Agency: without approval | 1 | Security Scan |
| `SEF-bf2d85d8c9d7a282e7ad` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'metadata.author' | 1 | QUALITY |
| `SEF-d60c42babf9ced0148cc` | MEDIUM | Large skill (~6726 estimated tokens at 4 characters per token, recommended max &lt;5000; a real tokenizer may count more). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy | 1 | QUALITY |
| `SEF-dd828fd8f6476dc5f3c7` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'metadata.tags' | 1 | QUALITY |
| `SEF-e3f5c930756d6b8f695b` | MEDIUM | Missing recommended section: '&#35;&#35; Examples' | 1 | Schema &amp; Repository Governance |
| `SEF-e6bee2b3f281ff07e52f` | MEDIUM | Description contains vague words | 1 | QUALITY |
| ... | | *20 more unique findings* | | |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| sdcorejs-execute-plan | 83.8 | B | guide-only | 85.0 | 80.0 | 85.0 | 85.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'sdcorejs-execute-plan'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/sdcorejs-execute-plan/
- [OK] **naming_convention**: Folder name 'sdcorejs-execute-plan' follows kebab-case convention
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **optional_files**: Skill directory contains only expected files
- [OK] **name_consistency**: Directory name matches frontmatter: 'sdcorejs-execute-plan'

**Non-blocking findings: 5**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL.md has 504 lines (limit: 500) | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [MED] MEDIUM | Missing recommended section: '## Instructions' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [MED] MEDIUM | Missing recommended section: '## Examples' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [LOW] LOW | Author not specified in metadata | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [LOW] LOW | Description has its trigger at characters 71-81; some harnesses show only the first ~60 characters in their skill list | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL.md has 504 lines (limit: 500)**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `line_count`
- Finding ID: `SEF-ed40e9401f765db42c1b`
- Occurrence ID: `SEO-bf7bb555dea714f0c67f`
- Fix: Consider moving content to reference files in references/ directory

**2. Missing recommended section: '## Instructions'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `body_recommended_section`
- Finding ID: `SEF-2ab016a817c566724ba9`
- Occurrence ID: `SEO-19d8de272040c9a8d005`
- Fix: Consider adding a '## Instructions' or '## Usage' section. Per agentskills.io the body format is unrestricted, so this is a convention nudge — it also gives the quality scorer a stable anchor for instruction-quality heuristics.

**3. Missing recommended section: '## Examples'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `body_recommended_section`
- Finding ID: `SEF-e3f5c930756d6b8f695b`
- Occurrence ID: `SEO-9c7ba13c0cf9faf9c103`
- Fix: Consider adding a '## Examples' section. If examples are already inline under instructions, this can be skipped.

**4. Author not specified in metadata**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `author_missing`
- Finding ID: `SEF-7d8d9f72f99ec61dbf58`
- Occurrence ID: `SEO-419b97bfe3d9940fb1f0`
- Fix: Add 'metadata.author' with a person, team, or organization name, or 'Name <email@example.com>' to include a contact address

**5. Description has its trigger at characters 71-81; some harnesses show only the first ~60 characters in their skill list**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `description_trigger`
- Finding ID: `SEF-94d86e57a91ca55488b7`
- Occurrence ID: `SEO-5109b99d0017e6328dbe`
- Fix: State when to use the skill within the first 60 characters

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_optional**: No semantic version label present; resource will use commit-hash history

### ✅ Security Scan
*Detect security vulnerabilities and PII/secrets*

- [OK] **skillspector**: Security scan completed - 1 advisory finding(s) (no critical/high issues)

**Non-blocking findings: 1**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | Excessive Agency: without approval | <code>SKILL.md:469</code> |

<details>
<summary>View Details</summary>

**1. Excessive Agency: without approval**
- File: `SKILL.md:469`
- Check: `Autonomous Decision Making (EA2)`
- Finding ID: `SEF-55bbc1f1b2ab31ddd68e`
- Occurrence ID: `SEO-525023c51875623e97fb`
- Content: `- Obey `allowed_paths` and `prohibited_paths`.
- Use pack...`
- Fix: Skill enables autonomous high-impact decisions without human-in-the-loop verification. Critical operations (destructive commands, financial transactions, data deletion) should require explicit user confirmation. Add human-in-the-loop confirmation for destructive, irreversible, or high-impact operations. Never auto-execute commands that modify files, send data, or alter system state.

</details>


### ✅ PII Scan
*Detect PII and local identifiers*

- [OK] **pii_scan_start**: Scanning 1 files for PII
- [OK] **pii_detection**: No PII detected in 1 files (emails, SSNs, phone numbers, paths)

### ✅ License Compliance
*Validate license compliance for Skills, Rules, and Workflows*

- [OK] **license_compliance**: License compliance scan completed (not detected)

### ✅ Code Risk Analysis
*Static code analysis using Bandit and packaged Semgrep rules*

- [OK] **code_file_discovery**: No code files found - code risk analysis is not applicable

### ✅ Secrets Detection
*Detect hardcoded secrets, API keys, and credentials using Gitleaks*

- [OK] **gitleaks**: No secrets detected by Gitleaks

### ✅ Code Integrity & Hygiene
*Validate dead links, dependencies, and static Python test-file discovery*

- [OK] **dead_links_scan**: Checking 1 markdown files for dead links
- [OK] **dead_links**: All relative links valid in 1 markdown file(s)
- [OK] **dependencies**: No dependency files found (requirements.txt, pyproject.toml)
- [OK] **test_discovery**: No standard Python test-file candidates found; target tests were not executed and coverage was not measured. Consider adding tests.

### ✅ Dependency Vulnerability Audit
*Scan dependencies for CVE vulnerabilities using pip-audit and Safety*

- [OK] **dependency_file_discovery**: No dependency files found - vulnerability audit is not applicable

### ✅ Unicode Smuggling Detection
*Detect invisible Unicode characters and ASCII smuggling*

- [OK] **unicode_scan**: No invisible Unicode characters detected in 1 file(s)

### ✅ B QUALITY
*Skill quality scoring across Correctness (35%), Discoverability (25%), Reliability (25%), and Efficiency (15%)*

**Overall: 83.8/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 85.0 | 35% |
| Discoverability | 80.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 85.0 | 15% |

- [OK] **quality_score**: Score: 83.8/100 (Grade: B)

**Non-blocking findings: 9**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.author' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [LOW] LOW | Description very long (434 chars, recommend 50-150) | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [MED] MEDIUM | Description contains vague words | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [MED] MEDIUM | Large skill (~6726 estimated tokens at 4 characters per token, recommended max &lt;5000; a real tokenizer may count more). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-01a064412744ade41964`
- Occurrence ID: `SEO-a13727836d41fdfaa763`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. SKILL_SPEC recommended field missing: 'metadata.author'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-bf2d85d8c9d7a282e7ad`
- Occurrence ID: `SEO-ac22104d0a7ad392548d`
- Fix: Add 'author' under metadata: — Author name or team (under metadata:)

**3. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-dd828fd8f6476dc5f3c7`
- Occurrence ID: `SEO-5a9cb2bb29c0dc6076ee`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**4. Description very long (434 chars, recommend 50-150)**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_discoverability`
- Finding ID: `SEF-286f67a439d66cc95df4`
- Occurrence ID: `SEO-a771748afb5ae0190c97`
- Fix: Keep descriptions concise for progressive disclosure

**5. Description contains vague words**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_discoverability`
- Finding ID: `SEF-e6bee2b3f281ff07e52f`
- Occurrence ID: `SEO-e3c9268581b9be884a6f`
- Fix: Be specific about what this skill does

**6. No prerequisites/requirements documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-4a6560f4aec006f302f9`
- Occurrence ID: `SEO-2382e552f2cebf364796`
- Fix: Document dependencies, API keys, or setup needed

**7. No limitations documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-fc6fe3747c071963a76e`
- Occurrence ID: `SEO-c935dff27913c5f836cb`
- Fix: Add '## Limitations' section with known issues/constraints

**8. No troubleshooting section documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-378f24adfec67572e606`
- Occurrence ID: `SEO-84dcc73c9311e20995a3`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**9. Large skill (~6726 estimated tokens at 4 characters per token, recommended max <5000; a real tokenizer may count more). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `quality_efficiency`
- Finding ID: `SEF-d60c42babf9ced0148cc`
- Occurrence ID: `SEO-4f1fdbabaa94c3d6fb25`
- Fix: Keep required sections concise; move detailed examples, reference material, and supporting docs to the references/ directory

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

### ✅ Harness Compatibility
*Advisory: whether each agent harness loads, degrades or drops the skill*

- All checks passed

**Non-blocking findings: 15**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | claude-code: The 25 skills in this folder have 10,320 description chars; Claude Code's skill list fits 8,000 (1% of the context window at 4 chars per token; 8,000 if the window is unknown), so descriptions get shortened. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [INFO] INFO | claude-code: allowed-tools only pre-approves tools, never restricts, and applies only when the skill is invoked through the Skill tool (e.g. /name), not when the model reads the file. With --headless, see CC-ALLOWED-TOOLS-HEADLESS. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [MED] MEDIUM | codex: Codex reads .agents/skills and .codex/skills (project and user). | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [LOW] LOW | codex: The 25 skills in this folder have 10,320 description chars; Codex's skill list fits about 8,000 (2% of the context window at 4 bytes per token; 8,000 chars if unknown), so descriptions get shortened, then removed, then skills left out. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [INFO] INFO | codex: allowed-tools is ignored by Codex. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [INFO] INFO | copilot-cli: New skills appear only after &#96;/skills reload&#96; or a restart; edits to existing skills apply at once. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [INFO] INFO | copilot-cli: allowed-tools is ignored in -p (headless) mode; interactive behaviour unverified. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [MED] MEDIUM | hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [INFO] INFO | hermes: The skill list shows only the first ~60 chars of the description (57 + '...' in 0.16, a word boundary near 59 on main), and the trigger isn't in them. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| [INFO] INFO | hermes: allowed-tools is ignored by Hermes. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md</code> |
| ... | *5 more issues* | |

<details>
<summary>View Details</summary>

**1. claude-code: The 25 skills in this folder have 10,320 description chars; Claude Code's skill list fits 8,000 (1% of the context window at 4 chars per token; 8,000 if the window is unknown), so descriptions get shortened.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `CC-LIST-BUDGET`
- Finding ID: `SEF-8eb89c9cd7cab031496e`
- Occurrence ID: `SEO-3b5e8185afacd7be9899`
- Fix: Shorten descriptions (trigger first) or install fewer skills here.

**2. claude-code: allowed-tools only pre-approves tools, never restricts, and applies only when the skill is invoked through the Skill tool (e.g. /name), not when the model reads the file. With --headless, see CC-ALLOWED-TOOLS-HEADLESS.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `CC-ALLOWED-TOOLS`
- Finding ID: `SEF-a491fddbd29ee4b6bdf1`
- Occurrence ID: `SEO-87c17281bc760d034252`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**3. codex: Codex reads .agents/skills and .codex/skills (project and user).**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `CX-ROOT`
- Finding ID: `SEF-28414463d8d7c6b8288f`
- Occurrence ID: `SEO-d75cb3e0e6fba26bc6d2`
- Fix: Install it under .agents/skills or .codex/skills.

**4. codex: The 25 skills in this folder have 10,320 description chars; Codex's skill list fits about 8,000 (2% of the context window at 4 bytes per token; 8,000 chars if unknown), so descriptions get shortened, then removed, then skills left out.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `CX-LIST-BUDGET`
- Finding ID: `SEF-92dc2f30484b6c339ad8`
- Occurrence ID: `SEO-9cfd5aedc9e5a0a5a9f0`
- Fix: Shorten descriptions (trigger first) or install fewer skills here.

**5. codex: allowed-tools is ignored by Codex.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `CX-ALLOWED-TOOLS`
- Finding ID: `SEF-0498456e344a658ba70e`
- Occurrence ID: `SEO-a86b9b49a1982dfea378`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**6. copilot-cli: New skills appear only after `/skills reload` or a restart; edits to existing skills apply at once.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `CP-RELOAD`
- Finding ID: `SEF-3661379ea9e5c1072875`
- Occurrence ID: `SEO-f1272fb4712b5911c183`

**7. copilot-cli: allowed-tools is ignored in -p (headless) mode; interactive behaviour unverified.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `CP-ALLOWED-TOOLS`
- Finding ID: `SEF-8384ed85e117759caec1`
- Occurrence ID: `SEO-0329396cff74ac9fd526`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**8. hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `HM-ROOT`
- Finding ID: `SEF-50a6ef93167f5463b35d`
- Occurrence ID: `SEO-5c3c003774b4cd6cac81`
- Fix: Install it under ~/.hermes/skills, or .hermes/skills or .agents/skills in a trusted repo.

**9. hermes: The skill list shows only the first ~60 chars of the description (57 + '...' in 0.16, a word boundary near 59 on main), and the trigger isn't in them.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `HM-DESC-60`
- Finding ID: `SEF-e0623bdfb91d6bbb829f`
- Occurrence ID: `SEO-fa0c0c42c8afcbe09fc8`
- Fix: Put the trigger ("Use when …") in the first 57 characters.

**10. hermes: allowed-tools is ignored by Hermes.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-execute-plan/SKILL.md`
- Check: `HM-ALLOWED-TOOLS`
- Finding ID: `SEF-5e6a43e243ce82a1f952`
- Occurrence ID: `SEO-c8b23da2e501805bd854`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

*... and 5 more issues*

</details>


---
*Generated by SkillEvaluator*