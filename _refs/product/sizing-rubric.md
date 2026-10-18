# Sizing rubric, capacity, and assignment

Size is a Fibonacci story point (1, 2, 3, 5, 8, 13) computed from a fixed
rubric by `scoreTask` in `_refs/product/task-breakdown/sizing.mjs`. Load is
balanced by total points against availability, never by the number of tasks:
one task can outweigh two others.

## Rubric factors

Score each factor from 0 to 3 and keep the breakdown in the task's `estimate`
section.

| Factor | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| `ui_surface` | none | small change to one existing screen or component | new section or several existing screens | new screen, module, or complex interaction |
| `logic_complexity` | none | simple mapping or display rule | validation, state transitions, or calculations | multi-step workflow or many interacting rules |
| `integration` | none | one existing API | several APIs or one API still waiting on the backend | new contracts across services or external systems |
| `unknowns` | fully specified | one open question | several open questions | missing PRD section or contradictory sources |
| `test_effort` | none | a few unit cases | unit plus integration or several branches | broad regression or manual end-to-end evidence |
| `regression_risk` | isolated | touches a shared helper | touches a shared component used by many screens | changes a shared contract or cross-cutting behavior |

The raw sum maps to points: 0-1 is 1, 2-3 is 2, 4-5 is 3, 6-8 is 5, 9-11 is 8,
and 12 or more is 13. A task of 13 points is flagged for splitting before it is
proposed. Project weights in `rubric_overrides.weights` multiply individual
factors; they never change the thresholds.

Days are shown only when `velocity_per_member` (points one person completes in
one sprint at 100 % availability) and `sprint_length_days` are configured:
`days = points x sprint_length_days / velocity_per_member`.

## Availability

Ask each roster member's availability for this run: 0 (away), 25, 50, 75, or
100 %. Use structured choice, at most four members per prompt; the fallback is
numbered Markdown. Availability is a run input and is not stored in the config.

## Load table

`balanceLoad` returns one row per member:

- **Absolute mode** (velocity configured): capacity = velocity_per_member x
  availability; load % = assigned points / capacity x 100.
- **Relative mode** (no velocity): load % = (member points / total points) /
  (member availability / total availability) x 100.
- Over 100 % is an overload warning. A member at 0 % who still receives points
  is always overloaded. With no points assigned every load is 0 %.

Show the mode in the table so readers know whether 100 % means a sprint's
capacity or a fair share.

Run `check balance -` with the roster, the availability answers, the tasks with
their points and the run rules on stdin. It returns the suggestions with their
reasons and the load table; cite it at G5. Points in a draft are checked against
the stored rubric breakdown by `check tasks`, so never edit `size_points` alone.

## Assignee suggestion

`suggestAssignees` picks, per task in descending size:

1. members whose roles include the task role and whose availability is above 0;
2. minus members whose run rule would be broken (for example
   `max_load_percent`);
3. the preferred assignee when code ownership evidence names one and the task
   still fits;
4. otherwise the member with the lowest projected load.

When nobody fits, the lowest projected load is chosen and flagged. Every
suggestion carries a reason. Run rules are read, never written back to the
config unless the user said "always".
