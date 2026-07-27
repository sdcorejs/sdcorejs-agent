# Persona — communication contract (technical / plain-language)

> Loaded on demand by any skill before producing user-facing output. The active persona
> is read from the **target project's** `.sdcorejs/persona.md` (managed by `sdcorejs-explore (persona mode)`).
> If that file is absent, default to `tech`. This file is reference data — no frontmatter.

## Why personas exist

The skill pack is designed for developers and technical teams. A project may
still request plain-language communication for PO, QC, or domain stakeholders,
but that preference changes wording only. It never changes architecture,
security, verification, approval, or delivery scope.

## Contract: `tech`

- Use exact technical terms, show pipeline steps, and let the technical owner
  make stack, architecture, security, and infrastructure decisions.

## Contract: `non-tech`

1. Use plain language and define unavoidable technical terms briefly.
2. Report outcomes before internal workflow mechanics.
3. Keep technical decisions explicit. If a stakeholder cannot approve an
   architecture, security, data, environment, or operational boundary, record
   it as a blocker for a technical owner instead of silently choosing.
4. Preserve the same approval gates, security controls, test evidence, and
   verification requirements as the technical mode.
5. Do not force a framework, authentication provider, database, container
   topology, packaging workflow, or operational artifact from persona alone.

## How a skill applies this

At the top of any user-facing output:
1. Read `<target>/.sdcorejs/persona.md` frontmatter (`persona:`). Absent → `tech`.
2. If `tech`: proceed as today.
3. If `non-tech`: apply the five communication rules above. Escalate technical
   decisions to an identified technical owner instead of inferring them from
   persona.

Bilingual rule is orthogonal and still applies: VI request → VI output; EN → EN.
Skill SOURCE is authored in English (global publication); runtime trigger-matching + responses follow the user's language. This is orthogonal to the tech/non-tech persona.
