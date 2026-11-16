Initialized the [Order Desk engineering blueprint](../target/.sdcorejs/blueprints/order-desk.json) and linked it from [AGENTS.md](../target/AGENTS.md). The manual policy is preserved byte-for-byte; application code, tests and dependencies are unchanged.

The blueprint covers all 14 engineering areas with source hashes, observed conventions, testing policy and justified exceptions. Tenant authorization remains explicitly unresolved. It also records that the current integration suite tests pure predicates and the API does not persist orders.

Verification passed: 2 unit tests, 2 integration-script tests, 1 real HTTP E2E test, blueprint schema and 40 evidence references, manual-policy preservation, and diff checks. The blueprint is structurally valid but reports incomplete decisions rather than inventing approval. Actual outputs and exact commands are in this capture directory and [trace.json](trace.json).

