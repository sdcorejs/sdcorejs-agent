# Adapter Compatibility

This file documents provider-specific mappings. Canonical workflow prose uses
semantic actions and tiers instead.

| Harness | Runtime context | Structured choice | Static HTML | Subagents | Model override | Resume/steer | Isolation | Browser/web | Artifact write | Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| Codex | Unknown; portable handoff | Detect at runtime | Supported | Detect at runtime | Detect at runtime | Detect at runtime | Detect at runtime | Detect at runtime | Supported | Supported |
| Claude Code | Unknown; portable handoff | Supported | Supported | Supported | Supported | Unknown; use parent fallback | Unknown; use validated Git fallback | Web fetch supported; browser unknown | Supported | Supported |
| Cursor | Unknown; portable handoff | Unknown; use Markdown | Unknown; use Markdown | Unknown | Unknown; inherit | Unknown | Unknown | Unknown | Unknown | Unknown |
| GitHub Copilot | Unknown; portable handoff | Unknown; use Markdown | Unknown; use Markdown | Unknown | Unknown; inherit | Unknown | Unknown | Unknown | Unknown | Unknown |

The generated `sdcorejs-harness.json` beside each adapter entrypoint contains
the exact capability/action mapping and a hash of
`_refs/harness/capability-contract.json`.

`runtime_context_channel` is never inferred from conversational memory. Until a
host provides evidence for structured producer-to-consumer transfer,
`context.pass` uses the validated portable handoff with required fields,
freshness, artifact closure, evidence references, and the exact next consumer.

## Codex Model Guidance

- `fast`: prefer `gpt-5.6-terra` at low or medium reasoning for bounded scan,
  documentation synchronization, or confirmed test scaffolding.
- A Spark model may be used only when the client/account actually exposes it
  and the user opts in. It is never required.
- `balanced`: inherit an appropriate parent-selected configuration unless a
  supported runtime override is useful.
- `deep`: use the parent-selected GPT-5.6 configuration for architecture,
  security, flaky/root-cause, public-contract, or final acceptance work.

If per-agent override is unsupported or unknown, inherit the parent model and
record that limitation. Never block delegation solely because an override is
unavailable.

## Claude Code and Other Adapters

Claude Code mirrors derive their provider tool allowlist from each canonical
skill's `required-actions`. Cursor and Copilot remain fully operable through the
portable Markdown and sequential parent fallbacks when native capabilities
cannot be proven.
