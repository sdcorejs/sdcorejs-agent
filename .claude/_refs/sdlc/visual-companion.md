# Visual Companion

The visual companion helps the user see design choices before implementation.
Use it only when visual representation improves understanding or decision
quality.

It is an optional aid for brainstorming and design validation. It is not a
default mode, not a replacement for the main conversation, and not permission to
implement before the design is approved.

## Core Principle

Decide per question, not per session.

Before using the browser, ask:

> Would the user understand or decide this better by seeing it than by reading
> it?

If yes, use the visual companion. If no, stay in the main conversation.

## Use Visual Companion For

Use browser visuals for:

- UI wireframes
- Screen layouts
- Component composition
- Navigation structures
- Multi-step user flows
- Dashboard or admin panel layouts
- Side-by-side design comparisons
- Visual hierarchy and spacing
- Architecture diagrams
- Data-flow diagrams
- State machines
- Entity relationship diagrams
- Before/after UX comparisons
- Spatial relationships
- Visual polish comparisons

## Do Not Use Visual Companion For

Keep these in text:

- Requirements and scope questions
- Business rules
- Acceptance criteria
- API design
- Data modeling
- TDD/test strategy
- Pros/cons tables that are clear in text
- Purely conceptual choices
- Naming decisions
- Error-handling policy
- Implementation sequencing
- Code generation
- Production implementation

## Offer Timing

Do not offer the visual companion at the start of every brainstorming session.

First understand the user's request, context, constraints, and the current
design question.

Offer it just-in-time, only when the next question would be clearer visually.

The offer must be one standalone message. Do not include a clarifying question,
implementation plan, or design summary in the same message.

The offer must use two numbered choices. Runtime-localize the prose while
preserving the two-choice shape:

```text
The next decision may be easier to understand if shown visually as a mockup,
diagram, or browser comparison. Which direction do you want?

1. Use visual companion to preview visual options before approving the design
2. Do not use visual companion; continue brainstorming in text + TDD

Reply with `1` or `2`.
```

## Accepted Flow

When the user chooses option 1:

1. Locate this reference and any related templates using the current
   skill/project convention.
2. Confirm whether a visual companion runtime exists.
3. If a runtime exists, start or open it using the project's configured command.
4. If no runtime exists, create static HTML or Markdown visual artifacts
   according to the current convention.
5. Render one decision per screen.
6. Prefer 2-3 options, not many options.
7. Give each option a clear number, label, purpose, best-when, trade-off, and
   optional recommendation.
8. Ask the user to respond in the main conversation.
9. Merge written feedback with any visual selections.
10. Update the design spec or brainstorming summary.
11. Continue text-only when the next question is not visual.

## Declined Flow

When the user chooses option 2:

- Continue with text-only brainstorming.
- Do not mention the visual companion again unless the user asks for it or a
  later decision becomes genuinely hard to explain without a visual.

## Per-Question Decision Rule

Use the browser for visual or spatial decisions.

Use the main conversation for requirements, scope, business rules, API design,
data modeling, TDD strategy, acceptance criteria, trade-offs, and implementation
sequencing.

A UI-related topic is not automatically a visual topic.

Examples:

- "What should this dashboard do?" is a text question.
- "Which dashboard layout feels clearer?" is a visual question.
- "Should we use REST or GraphQL?" is a text question.
- "Which architecture boundary is easier to maintain?" may be visual if a
  diagram helps.
- "What tests should we write?" is a text question.

## Screen Design Rules

Each visual screen should answer exactly one design question.

Good screen questions:

- "Which dashboard layout should we use?"
- "Which onboarding flow feels simplest?"
- "Which sidebar/navigation structure matches the product?"
- "Which architecture boundary is easier to maintain?"
- "Which empty-state pattern is more useful?"
- "Which before/after UX direction is clearer?"

Bad screen questions:

- "What should we build?"
- "What features are in scope?"
- "Should we use REST or GraphQL?"
- "What tests should we write?"
- "What is the data model?"
- "Can we start implementing?"

## Visual Screen Content

Each visual screen should include:

- Title: the decision being made.
- Subtitle: the evaluation criteria.
- 2-3 numbered visual options.
- Short explanation per option.
- Best-when guidance per option.
- Trade-off per option.
- Optional recommendation.
- Prompt asking the user to select or comment in the main conversation.

Use option numbers 1, 2, and optionally 3. Do not use A/B/C unless the existing
project convention requires it.

## Interaction Contract

The main conversation remains the source of truth.

Browser selections are helpful structured feedback, but the user's written
response has priority when there is conflict.

Do not proceed to implementation because a mockup was selected.

After a visual direction is selected, summarize the chosen direction in the main
conversation and get explicit design approval before moving forward.

## TDD Boundary

The visual companion is for brainstorming and design validation only.

After visual approval:

- Convert the chosen design into acceptance criteria.
- Identify testable behavior.
- Define edge cases.
- Identify test layers or test types.
- Then transition to the implementation/TDD skill or implementation plan.

Never generate production code directly from a mockup before the design is
approved.

## Templates

Use `visual-offer.md` for the standalone two-choice offer.

Use `visual-screen-options.fragment.html` when presenting 2-3 options without a
rich mockup comparison.

Use `visual-screen-comparison.fragment.html` when comparing two visual
directions side by side.

Use `visual-waiting.fragment.html` when returning to the main conversation so a
browser surface does not keep an old decision screen open.
