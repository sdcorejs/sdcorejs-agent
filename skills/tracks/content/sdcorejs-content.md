---
name: sdcorejs-content
description: Create, edit, research, repurpose or editorially review social content for personal brands and product marketing. Use for captions, posts, short-video scripts, carousels, content strategy and learning from actual feedback on Facebook, TikTok or other channels. Not technical documentation, PRDs, code implementation or Git delivery. Drafting does not authorize posting, scheduling or messaging. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, web.fetch, user.choose
---

# Content

Create useful copy for the requested audience and identity. Match the user's
language. A short caption goes directly from sufficient brief to draft; never
force it through engineering spec/architecture/plan, tests or Ship. For campaigns,
confirm material goals, deliverables, evidence and resources, then plan the
editorial work proportionately. Reuse session answers and authority.

Read `_refs/shared/runtime-protocols.md` only at its declared triggers (for
example real decisions, persistent artifacts or non-trivial progress).

## Scope and boundaries

- Own brief, strategy/series, research and claims, draft/edit, repurpose,
  editorial review and learning from real feedback.
- Personal voice and product brand voice are separate profiles. They are not
  the agent's technical/nontechnical persona; never overwrite one with another.
- Technical manuals/comments belong to Documentation, requirements/UAT to
  Product, UI artifacts to Design, software implementation to its engineering
  owner. A social announcement about those artifacts belongs here.
- Editorial review-only remains read-only. A draft/edit request permits the
  requested copy, not publishing, scheduling, sending messages, creating media
  or persisting a voice profile. Each effect needs matching authority; use
  existing exact authority without asking again. No automatic tool installation.

## Resolve only what matters

Use supplied writing samples, product facts, source material and corrections
first. Capture identity (personal/product), audience, objective, message,
channel, format, domain, evidence and constraints. Load
`_refs/content/core/brief.md` for ambiguous briefs or larger work. A missing
nonessential field is a labeled assumption, not a blocker. Ask only when a
missing fact changes accuracy, voice, audience or the deliverable materially.
If first-person experience is absent, use research-grounded language and keep
writing; do not invent an anecdote or make the entire caption wait for one.

## Load references on demand

Read `_refs/content/core/voice.md` when using/learning a voice, and
`_refs/content/core/research-and-claims.md` for factual, comparative, personal
experience, customer or platform claims. Never fabricate experiences, metrics,
testimonials, sources or algorithm rules. Unknown claims stay out of publishable
copy; separate questions/source notes from the usable draft.

Select independent dimensions using `_refs/content/catalog.json` and, when
useful, `selectContentReferences` in `_refs/content/content-contract.mjs`:

- Channel: Facebook or TikTok first; other networks use `channels/general.md`
  and verified current evidence if a platform constraint matters.
- Format: text-post, carousel, short-video or long-form.
- Domain: tech, marketing-business or travel-lifestyle; unknown domains use
  conservative general editorial guidance, never a guessed specialist rule.
- Action: strategy uses `workflows/strategy-and-calendar.md`; repurpose uses
  `workflows/repurpose.md`; feedback uses `core/learning-from-results.md`.

Load only matching references, not the catalog of bodies. Each reference states
applicability, exclusions, provenance, review date and refresh conditions.
Editorial suggestions are not hard platform limits. Current platform limits
need dated authoritative evidence; account observations are not universal rules.

## Produce and review

Draft the requested number of outputs (one by default). Keep facts consistent
across personal and product variants while adapting the narrator, vocabulary,
proof and CTA to each identity. Repurposing changes the storytelling/sequence
for the destination channel, not just length. A video script/storyboard is not
rendered media; report only actual tool outputs when media creation is authorized.

Before returning, apply `_refs/content/core/editorial-review.md`: clarity,
usefulness, factual support, voice, structure, format fit and proportional CTA.
Retain supported claims, rewrite/remove unsupported claims and surface only
material unresolved questions. `assessContentClaim` helps classify supplied
claim records; it does not independently verify a URL or judge prose quality.

Return usable copy first, then concise source/assumption notes if needed. For
strategy return themes, cadence as a resource-based proposal, and a review point.
For feedback separate actual observation, hypothesis and accepted voice rule;
one successful post never proves causality or a performance guarantee.

## Persistence and handoff

Default to the conversation for a small draft. Save only when requested, to a
known target owner/path. Reuse the user's content workspace; do not create a
new mandatory artifact bundle. Before any `.sdcorejs/**` write apply
`_refs/shared/artifact-lifecycle.md`; content execution notes may use owned
`.sdcorejs/docs/content/**` metadata, while voice/profile persistence needs
explicit owner/path authority. Raw private samples and analytics stay out of
shared artifacts unless scoped and approved. Do not update AGENTS/persona from
content feedback. Hand off publication separately with exact copy, destination,
identity and authorized action; no publication is performed by this skill.
