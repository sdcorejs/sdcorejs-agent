# UI Handoff Fidelity

## Implementation fidelity

Resolve the role of the supplied material before editing.

- **Reference.** When the user says to take inspiration or use an example as
  reference, adapt its layout to the project's goals and explain consequential
  choices.
- **Agreed handoff.** An accepted design or a supplied handoff with a request to
  implement according to it binds the visible structure and demonstrated
  behavior. The user can establish this without saying “pixel-perfect”.

Read the related README, PROMPT, editable HTML/Figma and screenshots that are
available. Include explicitly supplied bundles outside the canonical Design
directories. Resolve conflicts using the user's direct instructions within
their authorized scope. Identify the conflicting sources and the visible or
behavioral consequence. Ask only when a material conflict remains unresolved.
Record unavailable sources and avoid inferring unseen behavior.

Before editing, record the smallest set of observable constraints that could
change the result. Include affected screens, routes, agreed devices, states and
usable content widths. Check consequential details such as column count, content
width, default panel visibility, action placement and row structure. Include
demonstrated interactive states such as hover, selected and expanded. An agreed
desktop priority puts desktop verification first. Test the agreed device scope.
For governed work, carry the checks on the corresponding approved validation
rows through [the validation map](validation-map.md#agreed-ui-handoff).

### Running UI comparison

Open the actual route on the current target app with representative data and
the agreed interaction state. Match the reference's usable content width after
accounting for space taken by a sidebar or panel. Observe each recorded
checkpoint. Use an existing runner or a direct browser check with the same
comparison conditions. Capture or link the smallest evidence that proves the
change, such as a paired screenshot or a rendered DOM measurement with an exact
locator and state. Scale proof to the affected change.

For a test case list, compare the expand icon relative to the content row and
observe the expanded row. For a chat session list, observe the shape and extent
of the row background in hover and selected states. A passing click verifies
the click behavior. The layout checkpoint has its own result.

Record matched, mismatched and unverified checks with evidence and remaining
differences. Missing reference material or an unavailable app leaves the
affected visual checks unverified. A code review can document an interim
finding. Ship must hold visual acceptance and any completion claim that
depends on it until every required comparison is current and matched.
An accepted deviation must be recorded in the agreed scope and rechecked.

### Ticket evidence

When a ticket owns the work and existing authority covers the update, have
Product put the evidence or its link, the checked screen and state, the test
result, and remaining differences in the ticket. Keep source reference assets
distinct from running-app evidence and redact sensitive content. Confirm the
evidence update before an independently authorized completion transition.
Report unresolved mismatches or verification limits as progress. Keep the
ticket open when required visual acceptance is blocked. Use the scoped update
and read-back procedure in [ticket intake](../product/ticket-intake.md).
