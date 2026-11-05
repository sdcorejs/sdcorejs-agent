B can proceed within the authorized plan scope: the helper returns `dirty-disjoint` with `write_authorized: true`; leave `notes.md` untouched and unstaged.

A needs a decision before writes: the helper returns `decision-required` with `write_authorized: false` and overlap `src/**`. Its output scope overlaps the unrelated dirty `src` path. Narrow the scope to avoid that overlap or obtain explicit authorization for selected overlapping edits; the existing authorization does not permit overwriting unrelated work.

No discrepancy was observed between the helper and prose policy for these inputs. Exact results are in `helper-results.json`. I ran the supplied helper; no target files were edited.
