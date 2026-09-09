# Data and Action States

Source/status: SDCoreJS-authored behavior heuristics, grounded in approved state
and API contracts. These are alternative states, not mandatory new capabilities.

### UX-STATE-DATA - Distinguish absence, waiting and incomplete data

- Applies: lists, detail regions, dashboards and asynchronous content.
- Excludes: static content with no corresponding data lifecycle.
- Do: distinguish initial loading, background refresh, empty dataset, filtered
  no-results, partial data and usable stale data. Keep the user's context during
  refresh where truthful. State what a count represents when only part loaded.
  Offer the approved next action for an empty dataset and filter adjustment for
  no results. Show missing values as unknown/unavailable, not zero.
- Avoid: endless skeletons, empty-state flashes before loading completes,
  claiming completeness from partial data, or invented create/import actions.
- Verify: controlled empty/filtered/loading/partial/stale fixtures; confirm each
  state communicates the right scope and preserves filters/selection as specified.

### UX-STATE-RECOVERY - Explain failure and the next valid action

- Applies: network/service failures, forbidden views and partial operation errors.
- Excludes: inaccessible information the current role must not see.
- Do: explain what failed at a useful level, preserve safe user input, and show
  retry only when appropriate to the operation. Keep forbidden distinct from
  empty/no-results; offer supported access/request or navigation paths. For bulk
  failure report succeeded/failed items and retry scope without repeating success.
- Avoid: raw sensitive server errors, retry loops on forbidden requests, resetting
  successful work, or suggesting permissions/API changes as an automatic UI fix.
- Verify: offline/timeout/server/forbidden/partial-failure cases and recovery;
  check duplicate submission risk and the actual scope sent on retry.

### UX-STATE-FEEDBACK - Make action status perceivable

- Applies: disabled, pending, success and failure feedback on existing actions.
- Excludes: invented optimistic behavior unsupported by rollback semantics.
- Do: preserve a control's identity while pending; explain unavailable actions
  where useful and safe. Announce meaningful status changes using the platform's
  accessibility mechanism, without stealing focus for every update. Keep success
  truthful, sufficiently persistent for the task, and linked to the affected item.
- Avoid: color-only state, a transient toast as the only durable error, excessive
  live-region chatter, or claiming save success when the request is still pending.
- Verify: pointer/keyboard/assistive output, focus stability, rapid repeats,
  slow/failing requests and success-to-next-action behavior.
