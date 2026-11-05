**B can proceed** within the approved scope, leaving `notes.md` untouched. **A needs a decision before writes**: `src/**` overlaps the unrelated dirty scope `src`; narrow A to demonstrably disjoint outputs or obtain explicit authorization for selected overlapping changes. The current authorization does not permit overwriting unrelated work.

The actual helper returns `status: "dirty-disjoint"`, `intended_dirty_overlaps: []`, and `write_authorized: true` for **both** inputs. The exact returns are saved in [helper-results.json](helper-results.json).

This exposes an A false negative in `_refs/orchestration/execution-contract.mjs:306`: both scope roots are `src`, but the comparison omits equal-root matching, and `src/**` does not regex-match the bare `src`. The result conflicts with `_refs/shared/session-authority.md:49`, which blocks overlapping unrelated writes. Also, execute-plan Step 0.5 asks for a decision whenever unrelated dirt exists, whereas session-authority explicitly allows disjoint work without new consent; your scoped authorization already covers B.

No target files were edited. This evaluates the supplied paths only; it does not verify an actual repository baseline or authorize full plan execution.
