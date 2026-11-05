B can proceed within the approved scope, leaving `notes.md` untouched and unstaged. A needs a decision resolving the overlap before writing; the current authorization excludes touching unrelated edits in `src`. Narrowing A to demonstrably disjoint outputs is one possible resolution.

The actual helper returns `status: "dirty-disjoint"`, `intended_dirty_overlaps: []`, and `write_authorized: true` for **both** units. The exact returned objects are in `helper-results.json`.

For A, this is a false negative: `src/**` and dirty `src` share the scope root `src`, but the helper omits equality between normalized scope roots. Its reported authorization therefore conflicts with the overlap protection in `_refs/shared/session-authority.md`. Also, execute-plan Step 0.5 asks for a decision whenever unrelated dirty files exist, whereas session-authority explicitly permits disjoint unrelated edits without new consent; B already has sufficient scoped authorization.

Only the helper evaluation was executed. No target files were edited, and no work unit was executed.
