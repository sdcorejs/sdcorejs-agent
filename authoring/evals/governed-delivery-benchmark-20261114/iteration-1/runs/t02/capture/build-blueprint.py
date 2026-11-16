from pathlib import Path
import json, hashlib

ROOT = Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t02/target')
CAPTURE = ROOT.parent / 'capture'
BLUEPRINT = '.sdcorejs/blueprints/order-desk.json'
original_agents = (CAPTURE / 'agents-before.md').read_bytes()
assert (ROOT / 'AGENTS.md').read_bytes() == original_agents
agents = original_agents + b'\n## Engineering blueprint\n\nRead the [Order Desk engineering blueprint](.sdcorejs/blueprints/order-desk.json) before changing behavior or engineering policy. It distinguishes confirmed configuration, observed conventions, justified exceptions, and unresolved decisions. Tenant authorization remains unresolved; this baseline does not authorize an implementation or migration.\n'
(CAPTURE / 'agents-candidate.md').write_bytes(agents)

def evidence(path, kind='existing-code-observation'):
    content = agents if path == 'AGENTS.md' else (ROOT / path).read_bytes()
    return {'kind': kind, 'path': path, 'sha256': hashlib.sha256(content).hexdigest()}

def observed(decision, paths, next_action, **extra):
    return dict(status='observed', decision=decision, evidence=[evidence(p) for p in paths],
                next_action=next_action, **extra)

areas = {}
areas['scope'] = observed(
    'Order Desk currently exposes order quantity intake over POST /orders. A valid request returns the validated quantity; the implementation does not create a durable order. The pure canCancel predicate expresses operator/draft eligibility but has no HTTP cancellation route or authenticated actor. This standalone repository owns its HTTP adapter, domain functions and tests.',
    ['README.md', 'src/server.mjs', 'src/order.mjs'],
    'Before expanding journeys, the product/requirements owner must confirm actors, real order creation and cancellation outcomes, persistence, and public compatibility expectations; this baseline is not an approved feature specification.',
    authorized_initialization_scope='Engineering guidance and its AGENTS.md link only. Application source, tests and dependencies remain unchanged. No deployment, package installation, external service or network integration is authorized.',
    existing_exclusions=['No browser UI', 'No CLI or job entrypoint', 'No persistence, order identifier, read/list API or cancellation endpoint', 'No deployment configuration'])
areas['stack'] = dict(
    status='confirmed',
    decision='package.json declares private Node.js ESM with node >=24, .mjs sources, and no dependencies or devDependencies. README documents Node 24 and npm commands. This is the node track with node-general profile; no framework profile is justified. Use the declared scripts from repository root.',
    evidence=[evidence('package.json', 'authoritative-repository-config'), evidence('README.md')],
    package_manager='npm is documented; no packageManager pin, lockfile or workspace configuration exists. npm 11.9.0 was available during initialization; that observation is not a new version pin.',
    runtime_observed='Node v24.22.1',
    absent_commands=['No start/dev script', 'No build, lint, formatter, typecheck or coverage script'],
    dependency_policy='Do not add a framework, dependency, lockfile or tool merely to initialize the blueprint. A future addition requires its own scoped engineering decision.')
areas['architecture'] = observed(
    'src/server.mjs exports makeServer(), which returns an unbound node:http Server. The caller owns listen address, port and shutdown. The adapter selects the route, collects request bytes, parses JSON, calls quantity(), and maps the result or exception to HTTP. src/order.mjs owns synchronous, side-effect-free quantity and cancellation predicates and imports no transport or storage code. Dependency direction is HTTP adapter -> domain; tests import the public factories/functions.',
    ['src/server.mjs', 'src/order.mjs', 'test/e2e.test.mjs'],
    'Retain these boundaries for scoped maintenance. Before introducing persistence, tenant state, additional modules or external contracts, the architecture owner must decide state ownership and integration boundaries with an approved behavior contract.',
    data_ownership='Only the per-request body buffer and response exist. There is no database, repository, transaction, event bus, shared in-memory order store or cross-repository contract.',
    concurrency='HTTP data/end events collect each request; the E2E test waits for listening and closes the server through test teardown. Keep request state local and await resource lifecycle; do not introduce sleeps or shared test ports.',
    startup_limit='Executing src/server.mjs alone does not listen; it only defines and exports the factory. There is no production executable entrypoint.')
areas['coding'] = observed(
    'The existing source uses named ESM exports, explicit .mjs relative imports, node: imports for built-ins, camelCase functions such as canCancel and makeServer, const for stable bindings and let for the accumulating request body. Strings use single quotes and statements use semicolons; compact one-line formatting is an observation, not an accepted formatter policy.',
    ['AGENTS.md', 'src/order.mjs', 'src/server.mjs', 'package.json'],
    'Preserve established public names and the manual vocabulary during maintenance. If formatting or static analysis becomes necessary, agree its tooling and scope before changing it; do not reformat existing source from this inventory.',
    authoritative_manual_policy={'path': 'AGENTS.md', 'text': 'Manual policy: preserve operator terminology and never log customer secrets.'},
    error_handling='quantity throws RangeError for invalid values; the HTTP adapter currently converts every caught parsing/domain error to an empty 400. Preserve observed compatibility unless an accepted change distinguishes error categories. Do not log raw request bodies, credentials or customer secrets to diagnose failures.',
    convention_status='There is no accepted convention registry or lint/typecheck configuration. Local style remains advisory. This blueprint does not silently promote observations into accepted rules.')
areas['api-data'] = observed(
    'The only accepted-by-current-code route is an exact method POST with req.url equal to /orders. JSON must supply quantity as an integer from 1 through 100 inclusive. Numeric strings, fractions, missing values and out-of-range values fail validation. Success is 201 with content-type application/json and body {"quantity": value}; invalid JSON or validation exceptions produce an empty 400. Every other method or raw URL produces an empty 404, including a query string appended to /orders. Extra fields are currently ignored.',
    ['src/server.mjs', 'src/order.mjs', 'test/e2e.test.mjs'],
    'Treat these as observed compatibility facts, not a published schema. Before changing route matching, coercion, payload/error shape or status codes, agree the contract and add public-boundary regression cases. Decide durable order identifiers, persistence and transaction/duplicate-submission behavior before implementing them.',
    limitations=['201 does not prove persistence; the quantity is only echoed.', 'The adapter does not check the request Content-Type.', 'Request-body size and timeout policy are not defined by this repository.', 'Malformed JSON and unexpected caught exceptions currently share 400.'],
    mapping='quantity is the same domain and wire field; there is no mapper, external schema or identifier translation.')
areas['permissions'] = dict(
    status='gap',
    reason='The API will eventually require tenant authorization, but the user has not selected a tenant model. The current HTTP route has no authentication or authorization check. canCancel(role, state) returns true only for operator and draft, but it is a disconnected pure predicate; it does not authenticate a caller, establish tenant membership or enforce request access.',
    next_action='Before authorization implementation, the product/spec and architecture owners must obtain the tenant model and accepted actor/permission matrix: tenant identity and trusted resolution, membership/ownership relationships, roles or permissions per operation, cross-tenant isolation, denial behavior, and enforcement boundaries. Then record the accepted decision and add real API denial/isolation tests. Continue independent documentation and existing behavior verification meanwhile.',
    evidence=[evidence('src/server.mjs'), evidence('src/order.mjs'), evidence('test/integration.test.mjs')],
    unresolved=['Tenant model and tenant identifier source', 'Authentication provider and trusted request actor', 'Membership/ownership and actor-to-permission mapping', 'Operation permission identifiers and server enforcement location', 'Unauthenticated, unauthorized and cross-tenant response semantics', 'Guarded test personas and isolated tenant fixtures'],
    authority='No tenant design, approval, provider, permission string or denial status is inferred by this blueprint.')
for key, reason in [
    ('ui', 'The repository is headless: the sole exposed boundary is HTTP, with no browser route, component, template or static UI asset. Browser navigation and loading/empty/success/error screen policies do not apply to the current scope.'),
    ('accessibility', 'No user interface is present, so keyboard, focus, labels, semantics and assistive-technology checks have no current rendered boundary. No accessibility compliance target or tooling is declared. Reassess with any approved UI journey.')]:
    areas[key] = dict(status='not-applicable', reason=reason, evidence=[evidence('README.md'), evidence('src/server.mjs'), evidence('package.json')])
areas['unit-testing'] = observed(
    'Use Node built-in node:test and node:assert/strict. npm test runs node --test test/unit.test.mjs from repository root. Its two current assertions accept quantity(2) and reject quantity(0); no external fixtures, network or database are involved.',
    ['package.json', 'test/unit.test.mjs', 'src/order.mjs'],
    'When quantity behavior changes, add meaningful cases for both valid endpoints 1/100, out-of-range values, non-integers and missing/non-number inputs as relevant. Test canCancel truth-table branches as domain logic. Keep real validators and predicates; do not mock the function being tested.',
    gaps=['Current quantity suite does not cover all boundaries or input types.', 'Current cancellation tests do not cover an incorrect role or all state/role combinations.'],
    policy='Assert externally meaningful inputs/outputs/errors with behavior-based names. Do not require arbitrary test counts or coverage percentages; none is configured. Add regression cases with behavior changes, not mirror tests for this guidance-only edit.')
areas['integration-testing'] = observed(
    'npm run test:integration runs node --test test/integration.test.mjs from repository root. Both current tests directly call canCancel: operator/draft is true and operator/submitted is false. Despite the script and README service-test label, this proves pure predicate behavior, not service wiring, HTTP routing, persistence or authorization integration.',
    ['package.json', 'test/integration.test.mjs', 'src/order.mjs'],
    'When owned component, storage or service boundaries are introduced, add tests using their actual collaborators and a guarded local test environment. Retain accurate evidence labels; do not count the existing predicate suite as proof of tenant authorization or persistence.',
    current_boundary_evidence='The existing E2E suite exercises real makeServer -> quantity wiring over loopback HTTP. There is no DI container, database or third-party service to integrate today.',
    mock_policy='Keep the owned contract and its collaborators real. Substitute only external services when the future approved test strategy needs it; do not use mocked owned routing or storage to claim a full flow.')
areas['e2e-testing'] = observed(
    'Select E2E by observable behavior. POST /orders is a public API boundary and requires API E2E. npm run test:e2e runs node --test test/e2e.test.mjs from repository root. The test starts the real makeServer on 127.0.0.1 with an OS-assigned port, waits for listening, sends actual fetch HTTP with {"quantity":2}, and asserts 201 plus response JSON. Teardown closes the server. It uses no mocks of owned boundaries.',
    ['package.json', 'test/e2e.test.mjs', 'src/server.mjs', 'README.md'],
    'For a future API behavior change, cover the relevant public success, invalid-input and route/error outcomes through actual requests. Once tenant semantics are selected, cover permitted, denied and cross-tenant cases with guarded synthetic data. The current single success case is not complete API coverage.',
    selection_policy=[
        'Current public API behavior: real request/response API E2E; no browser requirement because no UI exists.',
        'Future UI journey: browser E2E through the actual user-facing entrypoint.',
        'Future CLI flow: invoke the real process and verify exit/output/owned effects; classify at integration with FULL_E2E evidence.',
        'Future job flow: invoke the actual job trigger/runner and verify owned effects; classify at integration with FULL_E2E evidence.',
        'Pure logic: explain why no UI/API/CLI/job boundary changes and use focused domain tests.',
        'Documentation-only: explain that behavior and executable entrypoints are unchanged, then verify evidence hashes, links, schema and preservation of manual instructions.',
        'Unavailable required environments mean NOT RUN, with the reason. They do not create an E2E exemption.'
    ],
    gaps=['Only happy-path HTTP status and JSON body are asserted.', 'No HTTP assertions currently cover 400, 404, range boundaries, Content-Type or absence of persistence.'],
    evidence_policy='Record exact command, repository-relative cwd, result, current source revision and changed-source fingerprint, and a hash of captured output. Green labels without real current output are not evidence. Environment failures, stale proofs and unrun checks must remain explicit.',
    current_change_exception='This initialization changes guidance and its link only. It changes no UI, public API, CLI or job behavior, so schema/evidence/link/manual-policy checks are its direct validation. Existing API E2E was nevertheless run to ground the baseline.')
areas['documentation'] = observed(
    'AGENTS.md contains the authoritative manual policy and now links this single blueprint inventory. README.md is the existing contributor entrypoint and lists runtime/test commands plus the absence of a UI and deployment. The blueprint serves engineers and future agents; source and tests substantiate behavior. There are no approved requirements, API schema, user guide or architecture snapshots in the repository.',
    ['AGENTS.md', 'README.md', 'package.json'],
    'Keep README command examples aligned when scripts or runtime change. Update the affected blueprint area and source hashes when a decision, contract or boundary changes. Add feature/API documentation alongside an approved behavior expansion; distinguish intended outcomes from observed implementation.',
    ownership='The repository engineering owner maintains guidance; product/spec owns requirements, architecture owns approved boundaries, and test ownership supplies execution evidence. Initialization creates none of those approvals.',
    editing_policy='Preserve manual AGENTS text byte-for-byte when linking guidance. Keep identifiers and operator vocabulary stable. Do not include raw secrets, customer data, host credentials or machine-specific paths in durable guidance.')
areas['delivery'] = observed(
    'Current project verification consists of the three declared test scripts; no CI, deployment, build, lint, formatter or typecheck command is configured. For future scoped engineering changes, inspect current instructions and evidence, confirm material behavior/architecture decisions, implement within authority, run affected checks, review the final diff, resolve in-scope defects, and update relevant documentation and requirement-to-test references.',
    ['README.md', 'package.json', 'AGENTS.md'],
    'Apply the existing SDCoreJS finish, testing, review/repair and canonical validation-map workflow when delivery claims require it; bind evidence to actual accepted requirements and source bytes. No requirements or validation-map delivery record is fabricated for this baseline.',
    evidence_destinations='Raw verification logs remain local diagnostic captures; durable records should contain sanitized command/result/revision/proof references. Current initialization evidence is supplied with the task capture, not committed as production state.',
    closure='Blueprint is shared durable guidance owned by sdcorejs-explore, conditional on authorized inclusion. AGENTS.md link is explicitly authorized. No staging, commit, PR, deployment or external publication was requested; this inventory makes no ship-readiness claim.',
    not_configured='No deployment or production release governance is introduced.')
areas['learning'] = dict(
    status='gap',
    reason='No existing durable memory or verified incident/fix record is present. Initialization observations are not verified root-cause lessons.',
    next_action='After a verified reusable fix, the owning workflow may propose a redacted lesson with source/proof fingerprints, applicability scope and a regression check. Persist only under appropriate scoped authority; retrieve relevant lessons and recheck freshness. Route convention promotion separately and do not turn stale memories into accepted engineering rules.',
    candidates_for_future_review=['Preserve the distinction between a pure predicate test and a real integration boundary.', 'Do not mistake a 201 quantity echo for durable order creation or tenant authorization.'])

doc = {
    'schema_version': 1, 'artifact_id': 'blueprint-order-desk',
    'artifact_kind': 'project-blueprint', 'owner': 'sdcorejs-explore',
    'owner_repository_id': 'github.com/benchmark-sdcorejs/order-desk',
    'owner_repository_role': 'standalone',
    'source_revision': (CAPTURE/'git-head.log').read_text().strip(),
    'project_state': 'existing', 'migration_policy': 'no-automatic-migration',
    'redaction_applied': True, 'change_ref': 'order-desk-engineering-blueprint-initialization',
    'source_spec': 'none', 'source_plan': 'none', 'commit_policy': 'conditional',
    'title': 'Order Desk engineering blueprint',
    'authority': {
        'source': 'Current user task',
        'authorized_action': 'Initialize durable project guidance/blueprint and link it from AGENTS.md while preserving manual policy.',
        'excluded': ['Application code changes', 'Dependency changes', 'Tenant-model selection or authorization implementation'],
        'document_review_performed': False,
        'meaning': 'User authorized creation, not review/approval of every inferred rule. Confirmed means supported by the referenced authority. Observed areas stay advisory and gaps stay unresolved.'
    },
    'inventory_status': 'incomplete',
    'status_reason': 'All required areas are recorded; permissions and learning remain explicit gaps and existing patterns remain observations. Structural validity is not implementation authorization or delivery readiness.',
    'areas': areas,
    'verified_commands': [
        {'command':'node --version','cwd':'.','exit_code':0,'observed':'v24.22.1'},
        {'command':'npm --version','cwd':'.','exit_code':0,'observed':'11.9.0'},
        {'command':'npm test','cwd':'.','exit_code':0,'observed':'2 tests passed; quantity success and zero rejection'},
        {'command':'npm run test:integration','cwd':'.','exit_code':0,'observed':'2 tests passed; direct canCancel predicates only'},
        {'command':'npm run test:e2e','cwd':'.','exit_code':0,'observed':'1 test passed; actual loopback POST /orders, 201 and JSON body'}
    ],
    'refresh_policy': 'Read current source, instructions and accepted decisions first. Compare each cited SHA-256 to current bytes. Refresh only affected areas under the owning scoped authority, preserve unresolved choices, and re-run relevant evidence after source/environment changes.'
}
(CAPTURE / 'blueprint-candidate.json').write_text(json.dumps(doc, indent=2) + '\n')
print('Created candidate blueprint and AGENTS link in capture; target is not yet changed.')

