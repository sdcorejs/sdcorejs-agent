# Visual Hierarchy

Source/status: SDCoreJS-authored aesthetic/task heuristics informed by upstream's
topic organization. Every aesthetic choice is conditional on existing design,
approved scope and the task. Standards checks live in the shared accessibility
reference; a preferred font, radius, density or animation is not a WCAG rule.

### UX-VISUAL-HIERARCHY - Make priority and grouping visible

- Applies: screen layout, typography, spacing and alignment refinements.
- Excludes: rebranding or information-architecture changes outside scope.
- Do: identify the primary task, heading, action, work area and supporting
  information. Reuse the type/spacing scale; group related controls by proximity
  and labels. Align comparable values and repeated actions. Choose readable
  density for the task and viewport; allow longer translations and user text
  scaling. Use surface/border separation only where it clarifies grouping.
- Avoid: arbitrary pixel rules, nested cards for every region, low-contrast
  metadata, truncating required information without access to the full value,
  or oversized marketing headings in a repeated data-entry workflow.
- Verify: scan the primary job with realistic short/long content, compare
  repeated rows/sections, test zoom/reflow, and inspect consistency with neighbors.

### UX-VISUAL-TOKENS - Reference the existing visual source

- Applies: color, icon, type, surface, border, radius and shadow decisions.
- Excludes: creating a parallel value catalog when source tokens already exist.
- Do: reference actual variables/components/style paths and revisions. Reuse
  semantic roles for action, text, warning, error, success and focus. Keep the
  installed icon family (including Material Outline when present), optical
  weight, alignment and naming conventions. Name icon-only controls separately
  from decorative icons. Propose a new token only for an evidenced missing role.
- Avoid: copying upstream palettes/font pairs, raw duplicate token values,
  mixing icon packs, or mandating a fresh palette/signature detail per feature.
- Verify: compare source token usage across affected components and states;
  measure relevant contrast pairs and inspect accessible names. Record conflicts
  between code, design and accepted decisions rather than silently choosing.

### UX-VISUAL-MOTION - Use motion to explain an actual change

- Applies: transitions, progress, disclosure and feedback already in scope.
- Excludes: motion as a default requirement or adding an animation dependency.
- Do: reuse current timings/easing and communicate the same outcome with reduced
  motion. Prefer immediate feedback when animation would slow repeated work.
  Specify interrupted/reversed transitions and retain meaningful content/focus.
- Avoid: universal durations, animation on every element, motion as the only
  indicator, forcing smooth scrolling, or globally zeroing animations that drive
  essential state/completion behavior.
- Verify: reduced-motion settings, repeated/reversed actions, focus stability,
  content visibility and completion with animation disabled or interrupted.
