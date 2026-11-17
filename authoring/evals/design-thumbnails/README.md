# Design thumbnail verification - 2026-11-16

This change adds 42 actual browser-captured PNGs, a searchable offline gallery,
compact comparison cards with separate full-preview disclosures, and verified
PNG paths for native chat delivery. The layouts are illustrative references,
not approved final product designs. The inherited design expansion remains
22 families, 42 variants, six themes and 12 paired examples.

## Consumer behavior

See the [thumbnail workflow](../../../_refs/design/visual-library/thumbnails.md)
for gallery, comparison, chat-asset and optional custom-capture commands. The
shipped images require no consumer browser installation. Custom capture uses
an existing trusted Playwright/Chromium capability and a new local output
directory. Hosts without native image rendering receive an explicit HTML/text
fallback. Two verified PNGs were displayed in the author's current conversation;
cross-host attachment behavior was not certified.

Images bind the exact generated HTML and current library revision. The resolver
also checks PNG bytes, supported format, checksums, bounded decompression,
dimensions, pattern/variant and capture metadata. Missing or invalid images
degrade the entire comparison to full HTML. A manifest is an integrity binding,
not an attestation that an untrusted producer captured the claimed pixels.

The actual live server retains full previews by default. Thumbnail opt-in is
available through the static CLI and shared live-document rendering API; this
change does not claim a new live-server configuration option. Preview opening,
selection and copied feedback do not grant implementation approval.

## Verification and repairs

Current affected checks: 30 design-library tests, 24 Visual Companion tests,
23 browser assertions including successful decoding of all 42 images, and
generated mirror verification. Chromium was 155.0.8059.79 on Node 24.22.1.
The browser observed no external HTTP requests or page-script errors.

Earlier in this change, the unchanged full-preview behavior passed 1,001 browser
assertions and authoring/UIUX/visual-offer/reference suites passed. Those runs
remain dated evidence; the final affected checks and independent repair probes
bind the final source manifest. Red regression runs and the corrected preflight
command failure are retained rather than relabeled as successful verification.

A fresh independent read-only auditor reviewed three source-bound candidates.
The final review verified all four corrections and found no remaining
implementation findings in this scope:

| Finding | Severity | Correction |
| --- | --- | --- |
| R1: chat asset lookup accepted invalid screen identities | Medium | Shared screen validation before either output mode; malformed CLI regressions |
| R2: self-consistently hashed malformed PNGs could appear available | Medium | Supported PNG header/chunk profile, CRC, bounded pixel decompression and scanline validation |
| R3: capture metadata was descriptive only | Low | Required fixed viewport, scale, region and browser metadata |
| R4: newer zlib CRC API broke the standalone Node 18 import contract | High | Dependency-free CRC implementation, independent native-oracle comparison and export-subset regression |

The final auditor reran 121 independent assertions, 23 malformed PNG cases,
eight malformed CLI cases and all 42 image decodes. An additional checksum
probe compared 64 valid PNGs and 64 invalid checksums against the native oracle.
Exact commands, exits, source hashes and report hashes are in `receipt.json`
and `source-manifest.json`. Raw logs, screenshots and independent reports remain
under `/workspace/work/design-thumbnails-20261116/`.

## Limits

- Native Node 18.20.8 execution was NOT RUN because only Node 24 was installed.
  The export-subset test is limited compatibility evidence, not an actual
  Node 18 run. The existing Node 18 CI contract remains unchanged.
- NVIDIA SkillEvaluator 0.9.0 quality-check scored 87.5/B, exit 0. Bounded
  no-LLM Tier 1 exited 1 for the inherited missing `metadata.author`; full
  Tier 1 is INCOMPLETE, including a failed SkillSpector readiness probe.
- The NVIDIA target was the exact generated Design skill text. It did not
  certify the sibling JavaScript renderer. LLM rubric, Tier 2/3 and new live
  baseline/with-skill experiments were NOT RUN for this change.
- No full repository/framework suite, native-host matrix, assistive-technology
  certification, hosted CI, publication or merge readiness is claimed.
- Historical reports and the initial 126 dirty files were preserved. The new
  code remains local on `codex/design-library-expansion`; this change creates
  no commit, push, merge, tag, npm publication or ChatGPT plugin submission.
