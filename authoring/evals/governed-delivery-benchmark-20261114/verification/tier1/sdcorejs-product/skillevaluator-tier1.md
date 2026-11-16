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
| Total Issues | 28 unique findings (9 medium) / 28 occurrences / 28 raw records; 2 warnings without a finding |
| Duplicate Occurrences Reconciled | 0 |

## Finding Reconciliation

| Finding ID | Severity | Finding | Occurrences | Validators |
|------------|----------|---------|-------------|------------|
| `SEF-01a064412744ade41964` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'version' | 1 | QUALITY |
| `SEF-28414463d8d7c6b8288f` | MEDIUM | codex: Codex reads .agents/skills and .codex/skills (project and user). | 1 | Harness Compatibility |
| `SEF-2ab016a817c566724ba9` | MEDIUM | Missing recommended section: '&#35;&#35; Instructions' | 1 | Schema &amp; Repository Governance |
| `SEF-50a6ef93167f5463b35d` | MEDIUM | hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted. | 1 | Harness Compatibility |
| `SEF-9b49753d3655dfef452b` | MEDIUM | Large skill (~5486 estimated tokens at 4 characters per token, recommended max &lt;5000; a real tokenizer may count more). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy | 1 | QUALITY |
| `SEF-bf2d85d8c9d7a282e7ad` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'metadata.author' | 1 | QUALITY |
| `SEF-dd828fd8f6476dc5f3c7` | MEDIUM | SKILL&#95;SPEC recommended field missing: 'metadata.tags' | 1 | QUALITY |
| `SEF-e3f5c930756d6b8f695b` | MEDIUM | Missing recommended section: '&#35;&#35; Examples' | 1 | Schema &amp; Repository Governance |
| `SEF-f0a6d5746f0611a645c7` | MEDIUM | openclaw: OpenClaw reads skills/, .agents/skills, ~/.agents/skills and ~/.openclaw/skills. | 1 | Harness Compatibility |
| `SEF-1017300978cb9cb0eae9` | LOW | Broad description without negative triggers may cause over-triggering | 1 | QUALITY |
| ... | | *18 more unique findings* | | |

## Quality Score

| Skill | Score | Grade | Type | Correctness | Discoverability | Reliability | Efficiency |
|-------|-------|-------|------|-------------|-----------------|-------------|------------|
| sdcorejs-product | 86.2 | B | guide-only | 85.0 | 90.0 | 85.0 | 85.0 |

## Results

### ✅ Schema & Repository Governance
*Validate SKILL.md frontmatter and repository structure*

- [OK] **manifest_exists**: Found skill manifest: SKILL.md
- [OK] **frontmatter_valid**: Valid frontmatter for skill 'sdcorejs-product'
- [OK] **folder_hierarchy**: Valid general skill structure: skills/sdcorejs-product/
- [OK] **naming_convention**: Folder name 'sdcorejs-product' follows kebab-case convention
- [OK] **line_count**: SKILL.md within line limit (494/500)
- [OK] **body_heading**: Body contains a top-level heading
- [OK] **optional_files**: Skill directory contains only expected files
- [OK] **name_consistency**: Directory name matches frontmatter: 'sdcorejs-product'

**Non-blocking findings: 4**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | Missing recommended section: '## Instructions' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [MED] MEDIUM | Missing recommended section: '## Examples' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [LOW] LOW | Author not specified in metadata | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [LOW] LOW | Description has no 'Use when ...' trigger; some harnesses show only the first ~60 characters in their skill list | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. Missing recommended section: '## Instructions'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `body_recommended_section`
- Finding ID: `SEF-2ab016a817c566724ba9`
- Occurrence ID: `SEO-b9e46e1869c85dbc8d6c`
- Fix: Consider adding a '## Instructions' or '## Usage' section. Per agentskills.io the body format is unrestricted, so this is a convention nudge — it also gives the quality scorer a stable anchor for instruction-quality heuristics.

**2. Missing recommended section: '## Examples'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `body_recommended_section`
- Finding ID: `SEF-e3f5c930756d6b8f695b`
- Occurrence ID: `SEO-f2452eb7b0c7e47ba68e`
- Fix: Consider adding a '## Examples' section. If examples are already inline under instructions, this can be skipped.

**3. Author not specified in metadata**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `author_missing`
- Finding ID: `SEF-7d8d9f72f99ec61dbf58`
- Occurrence ID: `SEO-56dc91f63287df85d3f4`
- Fix: Add 'metadata.author' with a person, team, or organization name, or 'Name <email@example.com>' to include a contact address

**4. Description has no 'Use when ...' trigger; some harnesses show only the first ~60 characters in their skill list**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `description_trigger`
- Finding ID: `SEF-29923f4d680e578e37e3`
- Occurrence ID: `SEO-2e4a11e1ff00c6192228`
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

**Overall: 86.2/100 (Grade: B)** | Skill Type: guide-only

| Dimension | Score | Weight |
|-----------|-------|--------|
| Correctness | 85.0 | 35% |
| Discoverability | 90.0 | 25% |
| Reliability | 85.0 | 25% |
| Efficiency | 85.0 | 15% |

- [OK] **quality_score**: Score: 86.2/100 (Grade: B)

**Non-blocking findings: 9**

| Severity | Issue | Location |
|----------|-------|----------|
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'version' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.author' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [MED] MEDIUM | SKILL_SPEC recommended field missing: 'metadata.tags' | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [LOW] LOW | Description very long (398 chars, recommend 50-150) | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [LOW] LOW | Broad description without negative triggers may cause over-triggering | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [LOW] LOW | No prerequisites/requirements documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [LOW] LOW | No limitations documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [LOW] LOW | No troubleshooting section documented | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [MED] MEDIUM | Large skill (~5486 estimated tokens at 4 characters per token, recommended max &lt;5000; a real tokenizer may count more). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |

<details>
<summary>View Details</summary>

**1. SKILL_SPEC recommended field missing: 'version'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-01a064412744ade41964`
- Occurrence ID: `SEO-128903ba65cd0a8b11e6`
- Fix: Add 'version' to frontmatter — Semantic version (e.g., "1.0.0")

**2. SKILL_SPEC recommended field missing: 'metadata.author'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-bf2d85d8c9d7a282e7ad`
- Occurrence ID: `SEO-c4edf1917cd87860f051`
- Fix: Add 'author' under metadata: — Author name or team (under metadata:)

**3. SKILL_SPEC recommended field missing: 'metadata.tags'**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_correctness`
- Finding ID: `SEF-dd828fd8f6476dc5f3c7`
- Occurrence ID: `SEO-7eb3b645d2685e575270`
- Fix: Add 'tags' under metadata: — Categorization tags (under metadata:, list of 1-5 items)

**4. Description very long (398 chars, recommend 50-150)**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_discoverability`
- Finding ID: `SEF-364ad0293fe4c19378cc`
- Occurrence ID: `SEO-a4f5f614ca0fc0c77f65`
- Fix: Keep descriptions concise for progressive disclosure

**5. Broad description without negative triggers may cause over-triggering**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_discoverability`
- Finding ID: `SEF-1017300978cb9cb0eae9`
- Occurrence ID: `SEO-8f75abd951e353c3c8ab`
- Fix: Add boundary phrases like 'Do NOT use for...'

**6. No prerequisites/requirements documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-4a6560f4aec006f302f9`
- Occurrence ID: `SEO-8b027cf39808fdbe5079`
- Fix: Document dependencies, API keys, or setup needed

**7. No limitations documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-fc6fe3747c071963a76e`
- Occurrence ID: `SEO-b8865d92e26bb06471af`
- Fix: Add '## Limitations' section with known issues/constraints

**8. No troubleshooting section documented**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_reliability`
- Finding ID: `SEF-378f24adfec67572e606`
- Occurrence ID: `SEO-bee200959de6b59126a4`
- Fix: Add '## Troubleshooting' with Error/Cause/Solution patterns

**9. Large skill (~5486 estimated tokens at 4 characters per token, recommended max <5000; a real tokenizer may count more). Per agentskills.io, SKILL.md should be concise (~500 lines) — large skill bodies increase token cost after invocation; long or unfocused top-level descriptions can degrade agent routing accuracy**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `quality_efficiency`
- Finding ID: `SEF-9b49753d3655dfef452b`
- Occurrence ID: `SEO-b286574688a01bb32c77`
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
| [LOW] LOW | claude-code: The 25 skills in this folder have 10,320 description chars; Claude Code's skill list fits 8,000 (1% of the context window at 4 chars per token; 8,000 if the window is unknown), so descriptions get shortened. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [INFO] INFO | claude-code: allowed-tools only pre-approves tools, never restricts, and applies only when the skill is invoked through the Skill tool (e.g. /name), not when the model reads the file. With --headless, see CC-ALLOWED-TOOLS-HEADLESS. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [MED] MEDIUM | codex: Codex reads .agents/skills and .codex/skills (project and user). | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [LOW] LOW | codex: The 25 skills in this folder have 10,320 description chars; Codex's skill list fits about 8,000 (2% of the context window at 4 bytes per token; 8,000 chars if unknown), so descriptions get shortened, then removed, then skills left out. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [INFO] INFO | codex: allowed-tools is ignored by Codex. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [INFO] INFO | copilot-cli: New skills appear only after &#96;/skills reload&#96; or a restart; edits to existing skills apply at once. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [INFO] INFO | copilot-cli: allowed-tools is ignored in -p (headless) mode; interactive behaviour unverified. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [MED] MEDIUM | hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [INFO] INFO | hermes: The skill list shows only the first ~60 chars of the description (57 + '...' in 0.16, a word boundary near 59 on main), and the trigger isn't in them. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| [INFO] INFO | hermes: allowed-tools is ignored by Hermes. | <code>/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md</code> |
| ... | *5 more issues* | |

<details>
<summary>View Details</summary>

**1. claude-code: The 25 skills in this folder have 10,320 description chars; Claude Code's skill list fits 8,000 (1% of the context window at 4 chars per token; 8,000 if the window is unknown), so descriptions get shortened.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `CC-LIST-BUDGET`
- Finding ID: `SEF-8eb89c9cd7cab031496e`
- Occurrence ID: `SEO-ac43a7a62fc01bd9dc2d`
- Fix: Shorten descriptions (trigger first) or install fewer skills here.

**2. claude-code: allowed-tools only pre-approves tools, never restricts, and applies only when the skill is invoked through the Skill tool (e.g. /name), not when the model reads the file. With --headless, see CC-ALLOWED-TOOLS-HEADLESS.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `CC-ALLOWED-TOOLS`
- Finding ID: `SEF-a491fddbd29ee4b6bdf1`
- Occurrence ID: `SEO-95b146f70a71ebe20999`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**3. codex: Codex reads .agents/skills and .codex/skills (project and user).**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `CX-ROOT`
- Finding ID: `SEF-28414463d8d7c6b8288f`
- Occurrence ID: `SEO-92d7300b82799323a675`
- Fix: Install it under .agents/skills or .codex/skills.

**4. codex: The 25 skills in this folder have 10,320 description chars; Codex's skill list fits about 8,000 (2% of the context window at 4 bytes per token; 8,000 chars if unknown), so descriptions get shortened, then removed, then skills left out.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `CX-LIST-BUDGET`
- Finding ID: `SEF-92dc2f30484b6c339ad8`
- Occurrence ID: `SEO-a80605b8e1c0677db14e`
- Fix: Shorten descriptions (trigger first) or install fewer skills here.

**5. codex: allowed-tools is ignored by Codex.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `CX-ALLOWED-TOOLS`
- Finding ID: `SEF-0498456e344a658ba70e`
- Occurrence ID: `SEO-af634d0f5215527d8a3e`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**6. copilot-cli: New skills appear only after `/skills reload` or a restart; edits to existing skills apply at once.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `CP-RELOAD`
- Finding ID: `SEF-3661379ea9e5c1072875`
- Occurrence ID: `SEO-30508ee476005dee505d`

**7. copilot-cli: allowed-tools is ignored in -p (headless) mode; interactive behaviour unverified.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `CP-ALLOWED-TOOLS`
- Finding ID: `SEF-8384ed85e117759caec1`
- Occurrence ID: `SEO-976ded2c1c3c757fa06e`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

**8. hermes: Hermes reads ~/.hermes/skills, and project .hermes/skills or .agents/skills only when trusted.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `HM-ROOT`
- Finding ID: `SEF-50a6ef93167f5463b35d`
- Occurrence ID: `SEO-4f00cc9c9938410d26ce`
- Fix: Install it under ~/.hermes/skills, or .hermes/skills or .agents/skills in a trusted repo.

**9. hermes: The skill list shows only the first ~60 chars of the description (57 + '...' in 0.16, a word boundary near 59 on main), and the trigger isn't in them.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `HM-DESC-60`
- Finding ID: `SEF-e0623bdfb91d6bbb829f`
- Occurrence ID: `SEO-37f867daa3b5a2c40ca6`
- Fix: Put the trigger ("Use when …") in the first 57 characters.

**10. hermes: allowed-tools is ignored by Hermes.**
- File: `/workspace/sdcorejs-agent/.claude/skills/sdcorejs-product/SKILL.md`
- Check: `HM-ALLOWED-TOOLS`
- Finding ID: `SEF-5e6a43e243ce82a1f952`
- Occurrence ID: `SEO-fcfea11af2e6a4e3b391`
- Fix: Don't rely on allowed-tools to restrict tools; use the harness's permission settings.

*... and 5 more issues*

</details>


---
*Generated by SkillEvaluator*