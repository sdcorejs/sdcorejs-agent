# Dashboard and Chart Decisions

Source/status: SDCoreJS-authored task/data heuristics informed by upstream's
question-to-chart taxonomy. No library recommendation or chart-count threshold
is adopted. Confirm accessibility with the actual renderer and data alternative.

### UX-CHART-QUESTION - Choose by the question being answered

- Applies: dashboards and data visualizations with an approved business question.
- Excludes: decorative charts or new metrics unsupported by the data contract.
- Do: identify whether users compare categories, inspect a time trend, understand
  distribution, find relationships or need exact values. Consider bars for
  comparisons, lines for ordered time, histograms for distributions and scatter
  plots for relationships; a table or single metric may answer better. Keep
  meaningful domain order; do not always sort descending. Use part-to-whole
  encodings only when the denominator and comparison remain clear.
- Avoid: assuming every dashboard needs a pie chart, using a line for unordered
  categories, defaulting to a new chart dependency, or deriving new business KPIs.
- Verify: state the question and have the chosen encoding answer it using actual
  ranges, outliers, zeros, negatives, few/many groups and long category labels.

### UX-CHART-INTEGRITY - Make meaning and freshness readable

- Applies: axes, legends, tooltips, missing data and update states.
- Excludes: inventing timestamps, zero-filling missing values or unauthorized export.
- Do: show units, time range/timezone, aggregation and denominator as relevant.
  Distinguish no data, zero, partial data and stale data; show last update only
  from actual evidence. Avoid misleading scales (bars generally need a zero
  baseline; disclose justified exceptions). Use labels/patterns as well as color.
  Provide an accessible summary/data alternative and keyboard/touch access to
  relevant values if the chart is interactive.
- Avoid: hover-only essential information, a screenshot as the only data access,
  hidden filtering, unexplained rescaling, or claiming a chart type is accessible
  before inspecting the renderer and interaction.
- Verify: axis/units against source data, refresh/error/partial states, tooltip
  keyboard/touch behavior, non-color identification, zoom and the text/table
  alternative. Separate visual inspection from source-only review.
