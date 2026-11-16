# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Publication status:** ⚠️ INCOMPLETE
**Profile:** default
**Policy digest:** `sha256:64a069b8853f7123049a675d6853ef8d8b424792bb9a2a5157a73ec312f38ed4`
**Quality config:** packaged, `sha256:298ff2bf62132c8154217b7aa59fc1fd04f28cf75372f55620a2cbcd951d6549`, min score 70
**Generated:** November 14, 2026 at 08:59 AM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 13 |
| Validators Run | 13 |
| ✅ Passed | 13 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 28 unique findings (9 medium) / 28 occurrences / 28 raw records; 3 warnings without a finding |
| Duplicate Occurrences Reconciled | 0 |

## Finding Reconciliation

| Finding ID | Severity | Finding | Occurrences | Validators |
|------------|----------|---------|-------------|------------|
| `SEF-01a064412744ade41964` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'version' | 1 | QUALITY |
| `SEF-28414463d8d7c6b8288f` | MEDIUM | codex: Codex reads .agents/skills and .codex/skills (project and user). | 1 | Harness Compatibility |
| `SEF-2ab016a817c566724ba9` | MEDIUM | Missing recommended section: '&#35;&#35; Instructions' | 1 | Schema &amp; Repository Governance |
| `SEF-4fa9ee24f23af2cf405b` | MEDIUM | Excessive Agency: auto-approve | 1 | Security Scan |
| `SEF-50a6ef93167f5463b35d` | MEDIUM | hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted. | 1 | Harness Compatibility |
| `SEF-bf2d85d8c9d7a282e7ad` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'metadata.author' | 1 | QUALITY |
| `SEF-dd828fd8f6476dc5f3c7` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'metadata.tags' | 1 | QUALITY |
| `SEF-e3f5c930756d6b8f695b` | MEDIUM | Missing recommended section: '&#35;&#35; Examples' | 1 | Schema &amp; Repository Governance |
| `SEF-f0a6d5746f0611a645c7` | MEDIUM | openclaw: OpenClaw reads skills/, .agents/skills, ~/.agents/skills and ~/.openclaw/skills. | 1 | Harness Compatibility |
| `SEF-1017300978cb9cb0eae9` | LOW | Broad description without negative triggers may cause over-triggering | 1 | QUALITY |
| ... | | *18 more unique findings* | | |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| sdcorejs-architecture | 87.8 | B | guide-only | 85.0 | 90.0 | 85.0 | 95.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'sdcorejs-architecture'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/sdcorejs-architecture/
- [OK] **naming_convention**: Folder name 'sdcorejs-architecture' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (221/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **optional_files**: Skill directory contains only expected files
- [OK] **name_consistency**: Directory name matches frontmatter: 'sdcorejs-architecture'

**Non-blocking findings: 4**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | Missing recommended section: '## Instructions' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [MED] MEDIUM | Missing recommended section: '## Examples' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | Author not specified in metadata | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | Description has its trigger at characters 62-69; some harnesses show only the first ~60 characters in their skill list | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. Missing recommended section: '## Instructions'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `body_recommended_section`
- Finding ID: `SEF-2ab016a817c566724ba9`
- Occurrence ID: `SEO-50913bbb26a8c888539e`
- Fix: Consider adding a '## Instructions' or '## Usage' section. Per agentskills.io the body format is unrestricted, so this is a convention nudge — it also gives the quality scorer a stable anchor for instruction-quality heuristics.

**2. Missing recommended section: '## Examples'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `body_recommended_section`
- Finding ID: `SEF-e3f5c930756d6b8f695b`
- Occurrence ID: `SEO-3c3f4785ed3a7bb49604`
- Fix: Consider adding a '## Examples' section. If examples are already inline under instructions, this can be skipped.

**3. Author not specified in metadata**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `author_missing`
- Finding ID: `SEF-7d8d9f72f99ec61dbf58`
- Occurrence ID: `SEO-8ea263406118d311f73d`
- Fix: Add 'metadata.author' with a person, team, or organization name, or 'Name <email@example.com>' to include a contact address

**4. Description has its trigger at characters 62-69; some harnesses show only the first ~60 characters in their skill list**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `description_trigger`
- Finding ID: `SEF-af6798d6d2f3199cf3b0`
- Occurrence ID: `SEO-ee5e76a44b28d2782522`
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
| [MED] MEDIUM | Excessive Agency: auto-approve | <code>SKILL.md:170</code> |

<details>
<summary>View Details</summary>

**1. Excessive Agency: auto-approve**
- File: `SKILL.md:170`
- Check: `Autonomous Decision Making (EA2)`
- Finding ID: `SEF-4fa9ee24f23af2cf405b`
- Occurrence ID: `SEO-b2894203d722011ed5b9`
- Content: `Run a separated read-only architecture review. Resolve de...`
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

**Overall: 87.8/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 85.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 95.0 | 15% |

- [OK] **quality_score**: Score: 87.8/100 (Grade: B)

**Non-blocking findings: 9**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.author' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | Description very long (490 chars, recommend 50-150) | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | Broad description without negative triggers may cause over-triggering | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | Uses complex/corporate language | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-01a064412744ade41964`
- Occurrence ID: `SEO-6ac1b63c51610bef9165`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. SKILL_SPEC recommended field missing: 'metadata.author'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-bf2d85d8c9d7a282e7ad`
- Occurrence ID: `SEO-c0a3b18303351bf47f59`
- Fix: Add 'author' under metadata: — Author name or team (under metadata:)

**3. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-dd828fd8f6476dc5f3c7`
- Occurrence ID: `SEO-4b4eb2327aa1fe5a8a00`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**4. Description very long (490 chars, recommend 50-150)**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_discoverability`
- Finding ID: `SEF-69001a654690f5c3e7b0`
- Occurrence ID: `SEO-1b76a27817d54869702c`
- Fix: Keep descriptions concise for progressive disclosure

**5. Broad description without negative triggers may cause over-triggering**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_discoverability`
- Finding ID: `SEF-1017300978cb9cb0eae9`
- Occurrence ID: `SEO-cbe906b8938c9b7dd22f`
- Fix: Add boundary phrases like 'Do NOT use for...'

**6. No prerequisites/requirements documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-4a6560f4aec006f302f9`
- Occurrence ID: `SEO-7ca4d7f2972035377a9a`
- Fix: Document dependencies, API keys, or setup needed

**7. No limitations documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-fc6fe3747c071963a76e`
- Occurrence ID: `SEO-a76996eddfe42b4a5d98`
- Fix: Add '## Limitations' section with known issues/constraints

**8. No troubleshooting section documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-378f24adfec67572e606`
- Occurrence ID: `SEO-6827f9b5880d21544c15`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**9. Uses complex/corporate language**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `quality_efficiency`
- Finding ID: `SEF-43624d132b0a323d2ae7`
- Occurrence ID: `SEO-b75e7ed8e5e271ce545c`
- Fix: Use simple, direct language: 'use' not 'utilize'

</details>


### ✅ SCRIPT_LINT
*AST-based code quality checks for skill scripts*

- [OK] **lint**: No scripts/ or tools/ directory found

### ✅ Harness Compatibility
*Advisory: whether each agent harness loads, degrades or drops the skill*

- All checks passed

**Non-blocking findings: 14**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | claude-code: The 25 skills in this folder have 10,320 description chars; Claude Code's skill list fits 8,000 (1% of the context window at 4 chars per token; 8,000 if the window is unknown), so descriptions get shortened. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [INFO] INFO | claude-code: allowed-tools only pre-approves tools, never restricts, and applies only when the skill is invoked through the Skill tool (e.g. /name), not when the model reads the file. With --headless, see CC-ALLOWED-TOOLS-HEADLESS. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [MED] MEDIUM | codex: Codex reads .agents/skills and .codex/skills (project and user). | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [LOW] LOW | codex: The 25 skills in this folder have 10,320 description chars; Codex's skill list fits about 8,000 (2% of the context window at 4 bytes per token; 8,000 chars if unknown), so descriptions get shortened, then removed, then skills left out. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [INFO] INFO | codex: allowed-tools is ignored by Codex. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [INFO] INFO | copilot-cli: New skills appear only after &#96;/skills reload&#96; or a restart; edits to existing skills apply at once. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [INFO] INFO | copilot-cli: allowed-tools is ignored in -p (headless) mode; interactive behaviour unverified. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [MED] MEDIUM | hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [INFO] INFO | hermes: The skill list shows only the first ~60 chars of the description (57 + '...' in 0.16, a word boundary near 59 on main), and the trigger isn't in them. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| [INFO] INFO | hermes: allowed-tools is ignored by Hermes. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md</code> |
| ... | *4 more issues* | |

<details>
<summary>View Details</summary>

**1. claude-code: The 25 skills in this folder have 10,320 description chars; Claude Code's skill list fits 8,000 (1% of the context window at 4 chars per token; 8,000 if the window is unknown), so descriptions get shortened.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `CC-LIST-BUDGET`
- Finding ID: `SEF-8eb89c9cd7cab031496e`
- Occurrence ID: `SEO-0d84d9aded7ff8feeb6f`
- Fix: Shorten descriptions (trigger first) or install fewer skills here.

**2. claude-code: allowed-tools only pre-approves tools, never restricts, and applies only when the skill is invoked through the Skill tool (e.g. /name), not when the model reads the file. With --headless, see CC-ALLOWED-TOOLS-HEADLESS.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `CC-ALLOWED-TOOLS`
- Finding ID: `SEF-a491fddbd29ee4b6bdf1`
- Occurrence ID: `SEO-4ad477199f4efaba2c5a`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**3. codex: Codex reads .agents/skills and .codex/skills (project and user).**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `CX-ROOT`
- Finding ID: `SEF-28414463d8d7c6b8288f`
- Occurrence ID: `SEO-6351918010d6efff2095`
- Fix: Install it under .agents/skills or .codex/skills.

**4. codex: The 25 skills in this folder have 10,320 description chars; Codex's skill list fits about 8,000 (2% of the context window at 4 bytes per token; 8,000 chars if unknown), so descriptions get shortened, then removed, then skills left out.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `CX-LIST-BUDGET`
- Finding ID: `SEF-92dc2f30484b6c339ad8`
- Occurrence ID: `SEO-80d2cc5501b4b49d6964`
- Fix: Shorten descriptions (trigger first) or install fewer skills here.

**5. codex: allowed-tools is ignored by Codex.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `CX-ALLOWED-TOOLS`
- Finding ID: `SEF-0498456e344a658ba70e`
- Occurrence ID: `SEO-bfb1d1632d8479c32d7a`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**6. copilot-cli: New skills appear only after `/skills reload` or a restart; edits to existing skills apply at once.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `CP-RELOAD`
- Finding ID: `SEF-3661379ea9e5c1072875`
- Occurrence ID: `SEO-a1ad2d4e0c71418594d6`

**7. copilot-cli: allowed-tools is ignored in -p (headless) mode; interactive behaviour unverified.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `CP-ALLOWED-TOOLS`
- Finding ID: `SEF-8384ed85e117759caec1`
- Occurrence ID: `SEO-eacf726524997a055742`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**8. hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `HM-ROOT`
- Finding ID: `SEF-50a6ef93167f5463b35d`
- Occurrence ID: `SEO-b3d945d740ffee10e8e8`
- Fix: Install it under ~/.hermes/skills, or .hermes/skills or .agents/skills in a trusted repo.

**9. hermes: The skill list shows only the first ~60 chars of the description (57 + '...' in 0.16, a word boundary near 59 on main), and the trigger isn't in them.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `HM-DESC-60`
- Finding ID: `SEF-e0623bdfb91d6bbb829f`
- Occurrence ID: `SEO-170f9e1b634f7affecec`
- Fix: Put the trigger ("Use when …") in the first 57 characters.

**10. hermes: allowed-tools is ignored by Hermes.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture/SKILL.md`
- Check: `HM-ALLOWED-TOOLS`
- Finding ID: `SEF-5e6a43e243ce82a1f952`
- Occurrence ID: `SEO-1897a1f0d3d8d5717e80`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

*... and 4 more issues*

</details>


---
*Generated by SkillEvaluator*