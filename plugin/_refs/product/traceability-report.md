# Product Traceability Report

When auditing, report briefly:

```markdown
Product traceability - <feature>

| AC | Requirement | Implementation | Test | Status |
|---|---|---|---|---|
| AC-001 | agreed | done | done | done |
| AC-002 | agreed | partial | missing | blocker |

Verdict: done | partial | blocked
Ledger: `.sdcorejs/docs/product/<file>.md`
Product docs: `.sdcorejs/product/prds/<file>.md`, `.sdcorejs/product/user-stories/<file>.md`, `.sdcorejs/product/acceptance-criteria/<file>.md`
Legacy compatibility reads: `<legacy path | none>`

Next actions:
- <only real gaps>
```

Every generated report and final response displays canonical paths.
