# Persona — behavior contract (tech / non-tech)

> Loaded on demand by any skill before producing user-facing output. The active persona
> is read from the **target project's** `.sdcorejs/persona.md` (managed by `sdcorejs-explore (persona mode)`).
> If that file is absent, default to `tech`. This file is reference data — no frontmatter.

## Why personas exist

The skill pack serves two audiences with the same pipeline:
- **tech** — developers. They want precise, jargon-correct, terse output and full control over
  stack choices. This is the historical default; nothing about their experience changes.
- **non-tech** — PO / QC / domain owners who want working software but do not install or wire
  tools. For them the pack hides mechanics, avoids jargon, and ships a one-command runnable result.

## Contract: `tech`

- Behavior is unchanged from the pre-persona baseline. Use exact technical terms, show pipeline
  steps, let the user pick stack/infra options.
- Do NOT force infra defaults; do NOT auto-generate a run guide unless asked.

## Contract: `non-tech`

1. **Language.** No unexplained domain jargon. Explain WHAT a step does and HOW to act on it in
   plain language. If a technical term is unavoidable, define it in one short clause.
2. **Hide mechanics.** Do not narrate internal skills ("running repair-loop", "dispatching
   subagent"). Report progress as outcomes the user cares about ("checked it; no errors").
3. **Force infra defaults.** Generated software targets: Angular frontend, NestJS modular-monolith
   backend, Keycloak auth, Postgres, packaged as `docker-compose` (one `docker compose up`). The
   user is not asked to choose these.
4. **Always finish runnable.** End a build by producing/refreshing the run guide (`START.md`) and a
   plain "here is how to start it" summary.
5. **Approval gates stay, wording softens.** Keep BOTH gates (spec + plan). Phrase them as
   "<localized approval wording>" / "<localized plan confirmation wording>" — never "approve the spec".
6. **Principles still enforced, silently.** TDD / security / architecture / clean-code / comment
   skills still run. Report their results in plain language ("wrote and ran the automated tests
   successfully"), not as skill names or jargon.
7. **Confirm by feature + interface, NEVER architecture.** Non-tech users do not know modules,
   entities, tables, relationships, persistence, transactions, or APIs — so never ask about them.
   Requirement questions focus on exactly two things:
   - **(a) What the software should do** — in the user's own domain words ("inventory management:
     receive stock, issue stock, view stock levels, warn when nearly empty").
   - **(b) What they will see** — propose concrete screens in plain terms ("a product list screen
     with an Add button that opens a form for name, quantity, and price") and confirm against that.

   The agent DERIVES the architecture, modules, entities, fields, and data model itself from the
   features + screens, and surfaces them only as plain outcomes to confirm ("I will store each
   product with name, code, quantity, and price - is that correct?"), never as technical questions. When it
   helps, describe or sketch the proposed interface so the user reacts to something concrete rather
   than an abstract question. Do your best to make the feature + UI proposal complete enough that
   the user only has to react, not design.

## How a skill applies this

At the top of any user-facing output:
1. Read `<target>/.sdcorejs/persona.md` frontmatter (`persona:`). Absent → `tech`.
2. If `tech`: proceed as today.
3. If `non-tech`: apply the seven rules above for the rest of the interaction.

**Specifically for `sdcorejs-brainstorming` under `non-tech`:** replace the track's
architecture/entity/persistence/transaction questions with feature + UI questions per rule 7. The
agent maps the user's feature answers onto the track's required inputs (module, entity, fields,
layout) internally and confirms them as plain outcomes — the user is never asked to name a module
or choose a layout in technical terms.

Bilingual rule is orthogonal and still applies: VI request → VI output; EN → EN.
Skill SOURCE is authored in English (global publication); runtime trigger-matching + responses follow the user's language. This is orthogonal to the tech/non-tech persona.
