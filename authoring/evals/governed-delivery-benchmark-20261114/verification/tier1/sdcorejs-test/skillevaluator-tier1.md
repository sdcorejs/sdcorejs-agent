# SkillEvaluator Validation Report

**Status:** ✅ PASSED
**Publication status:** ⚠️ INCOMPLETE
**Profile:** default
**Policy digest:** `sha256:64a069b8853f7123049a675d6853ef8d8b424792bb9a2a5157a73ec312f38ed4`
**Quality config:** packaged, `sha256:298ff2bf62132c8154217b7aa59fc1fd04f28cf75372f55620a2cbcd951d6549`, min score 70
**Generated:** November 14, 2026 at 09:01 AM UTC

## Summary

| Metric | Value |
|--------|-------|
| Validator Results | 13 |
| Validators Run | 13 |
| ✅ Passed | 13 |
| ❌ Failed | 0 |
| ⚠️ Incomplete | 0 |
| Total Issues | 27 unique findings (8 medium) / 27 occurrences / 27 raw records; 3 warnings without a finding |
| Duplicate Occurrences Reconciled | 0 |

## Finding Reconciliation

| Finding ID | Severity | Finding | Occurrences | Validators |
|------------|----------|---------|-------------|------------|
| `SEF-01a064412744ade41964` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'version' | 1 | QUALITY |
| `SEF-28414463d8d7c6b8288f` | MEDIUM | codex: Codex reads .agents/skills and .codex/skills (project and user). | 1 | Harness Compatibility |
| `SEF-2ab016a817c566724ba9` | MEDIUM | Missing recommended section: '&#35;&#35; Instructions' | 1 | Schema &amp; Repository Governance |
| `SEF-50a6ef93167f5463b35d` | MEDIUM | hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted. | 1 | Harness Compatibility |
| `SEF-bf2d85d8c9d7a282e7ad` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'metadata.author' | 1 | QUALITY |
| `SEF-dd828fd8f6476dc5f3c7` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'metadata.tags' | 1 | QUALITY |
| `SEF-e3f5c930756d6b8f695b` | MEDIUM | Missing recommended section: '&#35;&#35; Examples' | 1 | Schema &amp; Repository Governance |
| `SEF-f0a6d5746f0611a645c7` | MEDIUM | openclaw: OpenClaw reads skills/, .agents/skills, ~/.agents/skills and ~/.openclaw/skills. | 1 | Harness Compatibility |
| `SEF-0d2215183b14101ae2c2` | LOW | No examples provided | 1 | QUALITY |
| `SEF-1017300978cb9cb0eae9` | LOW | Broad description without negative triggers may cause over-triggering | 1 | QUALITY |
| ... | | *17 more unique findings* | | |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| sdcorejs-test | 86.8 | B | guide-only | 80.0 | 90.0 | 85.0 | 100.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'sdcorejs-test'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/sdcorejs-test/
- [OK] **naming_convention**: Folder name 'sdcorejs-test' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (239/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **optional_files**: Skill directory contains only expected files
- [OK] **name_consistency**: Directory name matches frontmatter: 'sdcorejs-test'

**Non-blocking findings: 4**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | Missing recommended section: '## Instructions' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [MED] MEDIUM | Missing recommended section: '## Examples' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [LOW] LOW | Author not specified in metadata | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [LOW] LOW | Description has its trigger at characters 189-196; some harnesses show only the first ~60 characters in their skill list | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. Missing recommended section: '## Instructions'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `body_recommended_section`
- Finding ID: `SEF-2ab016a817c566724ba9`
- Occurrence ID: `SEO-d57356c0bee7f5d2aae8`
- Fix: Consider adding a '## Instructions' or '## Usage' section. Per agentskills.io the body format is unrestricted, so this is a convention nudge — it also gives the quality scorer a stable anchor for instruction-quality heuristics.

**2. Missing recommended section: '## Examples'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `body_recommended_section`
- Finding ID: `SEF-e3f5c930756d6b8f695b`
- Occurrence ID: `SEO-0590ed707f6015c66164`
- Fix: Consider adding a '## Examples' section. If examples are already inline under instructions, this can be skipped.

**3. Author not specified in metadata**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `author_missing`
- Finding ID: `SEF-7d8d9f72f99ec61dbf58`
- Occurrence ID: `SEO-a7f5ba791acbe23f06a0`
- Fix: Add 'metadata.author' with a person, team, or organization name, or 'Name <email@example.com>' to include a contact address

**4. Description has its trigger at characters 189-196; some harnesses show only the first ~60 characters in their skill list**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `description_trigger`
- Finding ID: `SEF-1bd2ad09a5956df78989`
- Occurrence ID: `SEO-cf0489cb00b438e2514a`
- Fix: State when to use the skill within the first 60 characters

</details>


### ✅ Semantic Version Validation
*Validate optional metadata.version labels and require strict bumps*

- [OK] **version_optional**: No semantic version label present; resource will use commit-hash history

### ✅ Security Scan
*Detect security vulnerabilities and PII/secrets*

- [OK] **skillspector**: No security vulnerabilities detected (secrets, API keys, credentials)

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

**Overall: 86.8/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 80.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 100.0 | 15% |

- [OK] **quality_score**: Score: 86.8/100 (Grade: B)

**Non-blocking findings: 9**

| Severity | Issue | Location |
|----------|-------|----------|
| [LOW] LOW | No examples provided | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.author' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [LOW] LOW | Description very long (420 chars, recommend 50-150) | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [LOW] LOW | Broad description without negative triggers may cause over-triggering | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. No examples provided**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-0d2215183b14101ae2c2`
- Occurrence ID: `SEO-d11fb4a133f690deeead`
- Fix: Add example usage with code blocks

**2. SKILL_SPEC recommended field missing: 'version'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-01a064412744ade41964`
- Occurrence ID: `SEO-a3dcfe7a1a53bf06cb90`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**3. SKILL_SPEC recommended field missing: 'metadata.author'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-bf2d85d8c9d7a282e7ad`
- Occurrence ID: `SEO-e99b2d62161641e85dd8`
- Fix: Add 'author' under metadata: — Author name or team (under metadata:)

**4. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-dd828fd8f6476dc5f3c7`
- Occurrence ID: `SEO-bd820ed75c4c21195ef4`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**5. Description very long (420 chars, recommend 50-150)**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_discoverability`
- Finding ID: `SEF-69578ea0671ee92a43f4`
- Occurrence ID: `SEO-70c0baab590976a5b262`
- Fix: Keep descriptions concise for progressive disclosure

**6. Broad description without negative triggers may cause over-triggering**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_discoverability`
- Finding ID: `SEF-1017300978cb9cb0eae9`
- Occurrence ID: `SEO-7a5c9b0611f87f2b0c5f`
- Fix: Add boundary phrases like 'Do NOT use for...'

**7. No prerequisites/requirements documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-4a6560f4aec006f302f9`
- Occurrence ID: `SEO-4a951c309c66d6c9de96`
- Fix: Document dependencies, API keys, or setup needed

**8. No limitations documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-fc6fe3747c071963a76e`
- Occurrence ID: `SEO-f07905689c8bf5416cb7`
- Fix: Add '## Limitations' section with known issues/constraints

**9. No troubleshooting section documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-378f24adfec67572e606`
- Occurrence ID: `SEO-4bbbe13b07d85b09e97c`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

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
| [LOW] LOW | claude-code: The 25 skills in this folder have 10,320 description chars; Claude Code's skill list fits 8,000 (1% of the context window at 4 chars per token; 8,000 if the window is unknown), so descriptions get shortened. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [INFO] INFO | claude-code: allowed-tools only pre-approves tools, never restricts, and applies only when the skill is invoked through the Skill tool (e.g. /name), not when the model reads the file. With --headless, see CC-ALLOWED-TOOLS-HEADLESS. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [MED] MEDIUM | codex: Codex reads .agents/skills and .codex/skills (project and user). | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [LOW] LOW | codex: The 25 skills in this folder have 10,320 description chars; Codex's skill list fits about 8,000 (2% of the context window at 4 bytes per token; 8,000 chars if unknown), so descriptions get shortened, then removed, then skills left out. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [INFO] INFO | codex: allowed-tools is ignored by Codex. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [INFO] INFO | copilot-cli: New skills appear only after &#96;/skills reload&#96; or a restart; edits to existing skills apply at once. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [INFO] INFO | copilot-cli: allowed-tools is ignored in -p (headless) mode; interactive behaviour unverified. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [MED] MEDIUM | hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [INFO] INFO | hermes: The skill list shows only the first ~60 chars of the description (57 + '...' in 0.16, a word boundary near 59 on main), and the trigger isn't in them. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| [INFO] INFO | hermes: allowed-tools is ignored by Hermes. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md</code> |
| ... | *4 more issues* | |

<details>
<summary>View Details</summary>

**1. claude-code: The 25 skills in this folder have 10,320 description chars; Claude Code's skill list fits 8,000 (1% of the context window at 4 chars per token; 8,000 if the window is unknown), so descriptions get shortened.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `CC-LIST-BUDGET`
- Finding ID: `SEF-8eb89c9cd7cab031496e`
- Occurrence ID: `SEO-e465afb47dba7fda5ce9`
- Fix: Shorten descriptions (trigger first) or install fewer skills here.

**2. claude-code: allowed-tools only pre-approves tools, never restricts, and applies only when the skill is invoked through the Skill tool (e.g. /name), not when the model reads the file. With --headless, see CC-ALLOWED-TOOLS-HEADLESS.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `CC-ALLOWED-TOOLS`
- Finding ID: `SEF-a491fddbd29ee4b6bdf1`
- Occurrence ID: `SEO-d97643e73f07a78e89ae`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**3. codex: Codex reads .agents/skills and .codex/skills (project and user).**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `CX-ROOT`
- Finding ID: `SEF-28414463d8d7c6b8288f`
- Occurrence ID: `SEO-5fd4ded386c8b1aab332`
- Fix: Install it under .agents/skills or .codex/skills.

**4. codex: The 25 skills in this folder have 10,320 description chars; Codex's skill list fits about 8,000 (2% of the context window at 4 bytes per token; 8,000 chars if unknown), so descriptions get shortened, then removed, then skills left out.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `CX-LIST-BUDGET`
- Finding ID: `SEF-92dc2f30484b6c339ad8`
- Occurrence ID: `SEO-7b452c405a0739cff244`
- Fix: Shorten descriptions (trigger first) or install fewer skills here.

**5. codex: allowed-tools is ignored by Codex.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `CX-ALLOWED-TOOLS`
- Finding ID: `SEF-0498456e344a658ba70e`
- Occurrence ID: `SEO-bd5183356cc69328fdc3`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**6. copilot-cli: New skills appear only after `/skills reload` or a restart; edits to existing skills apply at once.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `CP-RELOAD`
- Finding ID: `SEF-3661379ea9e5c1072875`
- Occurrence ID: `SEO-39a1f64926c638b614ba`

**7. copilot-cli: allowed-tools is ignored in -p (headless) mode; interactive behaviour unverified.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `CP-ALLOWED-TOOLS`
- Finding ID: `SEF-8384ed85e117759caec1`
- Occurrence ID: `SEO-4a0dec2842da2ac32e82`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**8. hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `HM-ROOT`
- Finding ID: `SEF-50a6ef93167f5463b35d`
- Occurrence ID: `SEO-9bd31e5dda61cfefdb43`
- Fix: Install it under ~/.hermes/skills, or .hermes/skills or .agents/skills in a trusted repo.

**9. hermes: The skill list shows only the first ~60 chars of the description (57 + '...' in 0.16, a word boundary near 59 on main), and the trigger isn't in them.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `HM-DESC-60`
- Finding ID: `SEF-e0623bdfb91d6bbb829f`
- Occurrence ID: `SEO-d0b3fe3ad371c11d0358`
- Fix: Put the trigger ("Use when …") in the first 57 characters.

**10. hermes: allowed-tools is ignored by Hermes.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-test/SKILL.md`
- Check: `HM-ALLOWED-TOOLS`
- Finding ID: `SEF-5e6a43e243ce82a1f952`
- Occurrence ID: `SEO-e385ecd33f8eb7586663`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

*... and 4 more issues*

</details>


---
*Generated by SkillEvaluator*