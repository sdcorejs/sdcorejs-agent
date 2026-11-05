B can proceed under the existing plan-scoped authorization: the helper returns `dirty-disjoint`, no overlaps, and `write_authorized: true`. Leave `notes.md` untouched and unstaged.

A needs a decision before affected writes: the helper returns `decision-required`, overlap `["src/**"]`, and `write_authorized: false`. Narrow the output scope to verified disjoint paths or obtain explicit permission for the selected overlapping changes; the current authorization does not allow overwriting unrelated work.

There is no helper/prose discrepancy for these inputs. The helper recognizes the `src` / `src/**` overlap. Exact results from the supplied helper are saved in `helper-results.json`. Only this evaluation was performed; no target files were edited.
