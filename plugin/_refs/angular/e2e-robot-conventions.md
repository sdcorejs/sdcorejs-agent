# E2E — Robot Framework conventions (NSP automation baseline)

Reference for generating Angular-portal E2E tests in **Robot Framework**, the stack the QC/Automation team uses (`nsp-automation-test`). Loaded on demand by `sdcorejs-test` when the target project is a Robot Framework suite. For Cypress/Playwright, the skill body covers it directly.

This pairs with the `sd-autoid-inspector` export: the inspector emits `[data-autoid="…"]` selectors that map 1:1 to the locators below — so an exported JSON/POM is the selector source of truth for the generated keywords.

## Stack

- **Robot Framework** + **Browser library** (Playwright engine — `Browser.New Browser/Context/Page`, `Browser.Fill Text`, `Browser.Click`, `Browser.Wait For Elements State`, `networkidle`).
- Python helpers under `Libs/*.py` (DB, Kafka, Keycloak, Excel fix, reports/qmetry). `ExcellentLibrary` for Excel data.
- Parallel run via **pabot**; CI via `.gitlab-ci.yml`; reporting to **Qmetry**.
- Detect: `*.robot` / `*.resource` files, `requirements.txt` with `robotframework`, `KeywordLibraries/` + `Projects/` + `Variables/` layout.

## Repo layout

```
KeywordLibraries/
  CommonKeyword/            # cross-project: BrowserCore, WebCore, ApiCore, Utils, WebBrowserLibraries
  <Project>/                # e.g. RealEstateOps
    HighLevelKeywords/      # HighLevelKeywords_<Page>.resource — compose flows
    LowLevelKeywords/       # UI_<Page>.resource — one keyword per element action
    VerificationKeywords/   # VerificationKeywords_<Page>.resource — assertions
    <Project>General.resource   # aggregator: Resource-imports all High + Verification
Projects/<Project>/Tests/   # <JIRA-KEY> [Role] <Title>.robot test suites
Variables/                  # ENV_<env>.yaml (DEV/QC/UAT/PRD), CONFIG_*.yaml
DataTest/Excel/             # data-driven .xlsx
Libs/                       # Python extension libraries
```

## Three-layer keyword architecture (mandatory)

Generated code MUST follow this separation — never put raw `Browser.*` calls in a test suite.

| Layer | File | Responsibility | Naming |
| --- | --- | --- | --- |
| **Low (UI)** | `LowLevelKeywords/UI_<Page>.resource` | ONE atomic action per element. Raw `Browser.Fill Text` / `Browser.Click` against a `[data-autoid]` locator. No business logic, no waits beyond the action. | `Enter <Field> on <Page> Page`, `Click <Field> on <Page> Page`, `Click Button <Name> on <Page> Page` |
| **High** | `HighLevelKeywords/HighLevelKeywords_<Page>.resource` | Compose Low keywords into a business flow (e.g. `Select Du An` = Click dropdown + Enter text + pick option). Loops over multi-select. | `<Verb> <Object> on <Page> Page` |
| **Verification** | `VerificationKeywords/VerificationKeywords_<Page>.resource` | Assertions only — `Browser.Wait For Elements State ... state=visible/hidden`, table/text checks. | `Verify <expectation> on <Page> Page` |
| **Common** | `CommonKeyword/*.resource` | Reused, not regenerated — `OPEN BROWSER AND DELETE COOKIES`, `Wait for networkidle on NSP Page`, login, menu nav. | as-is |

Aggregator `<Project>General.resource` imports every High + Verification resource; a suite imports only the aggregator.

## Locator strategy (priority order)

1. **`[data-autoid="<autoid>"]`** — primary, from `sd-autoid-inspector`. e.g. `[data-autoid="forms-input-table-sales_platform_unit-inline-unitCode"]`. Use for every `sd-input/-number/-textarea/-select/-autocomplete/-checkbox/-radio/-switch/-date/-datetime/-date-range/-button`.
2. `role=option[name="<value>"]` — dropdown/autocomplete option items (rendered in CDK overlay, no autoid).
3. `css=...` semantic class — only when no autoid (e.g. `input.c-search-input`).
4. `//td[contains(text(),'<value>')]` xpath — table cell verification.
5. `strong.sd-toast__title:has-text("<msg>")` — toast assertions (wait visible then hidden).

Prefer autoid always; fall back down the list only when the element has none (flag those back to the dev as "add autoid" — see the review skill's autoId section).

## What the inspector export gives you (and what it doesn't)

Per-element fields (`SdAutoidElement`): `stt, name, autoid, tag, text, xpath, duplicate, tableScope, state{ disabled, loading, empty, invalid, opened, count, dataValue, required, minlength, maxlength, pattern, errorMessage }`.

- **JSON export (`copyJson`) = the elements array ONLY** — no page URL / title / timestamp. The **MD-POM** and **md-table** exports DO include `meta.pageUrl`, `pageTitle`, `timestamp`. → Prefer the **MD-POM export** as input (it carries the URL + a class name), or get the route/URL from the user.
- **Exploit `state` for cases:** `required` / `minlength` / `maxlength` / `pattern` → auto-generate **negative / validation** cases; `errorMessage` → the expected message to assert; `disabled` / `empty` / `invalid` / `opened` / `count` → state assertions.
- **`tableScope`** → elements sharing a `tableScope` are inside that `<sd-table>` (filter row / inline cells); group them separately from top-level form fields.
- **NOT captured (must come from the clarify gate, never invented):** the test FLOW + step order, expected RESULTS/assertions, valid/invalid test DATA, auth/env, navigation path to the page, and **overlay elements** — dropdown `role=option` items, toasts, dialogs render on-demand in the CDK overlay and are absent from a static scan. Add those keywords manually (locators in §"Locator strategy").

## autoid-inspector export → keyword mapping

Generate one Low keyword per element, grouped into the `UI_<Page>.resource` for the page (use `tableScope` to split table-filter vs form sections):

| Inspector `tag` / component | Low keyword template | Browser action |
| --- | --- | --- |
| `sd-input`, `sd-input-number`, `sd-textarea` | `Enter <Field> on <Page> Page` `[Arguments] ${value}` | `Browser.Fill Text [data-autoid="<autoid>"] ${value}` |
| `sd-select`, `sd-autocomplete` | `Click <Field> on <Page> Page` + High `Select <Field> …` | `Browser.Click [data-autoid="<autoid>"]` then `Browser.Click role=option[name="${value}"]` |
| `sd-checkbox`, `sd-switch` | `Toggle <Field> on <Page> Page` | `Browser.Check` / `Browser.Click [data-autoid=...]` |
| `sd-radio` | `Select <Field> on <Page> Page` | `Browser.Click [data-autoid=...]` per option |
| `sd-date`, `sd-datetime`, `sd-date-range` | `Pick <Field> on <Page> Page` | `Browser.Click [data-autoid=...]` + calendar pick |
| `sd-button` | `Click Button <Name> on <Page> Page` | `Browser.Click [data-autoid="<autoid>"]` |
| table row action (edit/view) | High `Select … Row` + Verification | xpath row + `[data-autoid]` action cell |

`<Field>`/`<Name>` comes from the inspector `name` column (humanize); `<Page>` from the feature/route under test. Multi-value selects loop with `Split String` + `FOR`.

## Suite template

```robotframework
*** Settings ***
Documentation     Mô tả: <feature> — <scope>
...               Trang: <url>
...               Author: <name / AI Assistant>
...               <Qmetry / JIRA link>
Resource          ../../../KeywordLibraries/<Project>/<Project>General.resource

*** Variables ***
${username}    <user>
${password}    <pwd>

*** Test Cases ***
<JIRA-TC-ID> [Positive] - <title>
    [Tags]    <feature-tag>
    OPEN BROWSER AND DELETE COOKIES    url=${URL_<APP>}
    Login with username and password on Login <App> Page    ${username}    ${password}
    Verify Login success on Login <App> Page
    Click Menu name on menu <App>    menu_name=<Menu>
    <High-level flow keywords>
    Wait for networkidle on NSP Page
    <Verification keywords>
```

Cover **Positive / Negative / Navigation** cases (the QC suites tag each), not just happy path. Reuse `OPEN BROWSER AND DELETE COOKIES`, login, menu, and `Wait for networkidle` from Common/HighLevel — do not reinvent them.

## Environment + data

- URLs + creds from `Variables/ENV_<env>.yaml` (`${URL_<APP>}`), selected at run via `--variablefile`. Never hardcode environment URLs in a suite.
- Data-driven inputs from `DataTest/Excel/*.xlsx` via `ExcellentLibrary` when the case needs bulk/import rows; otherwise inline `*** Variables ***`.

## Run + verify

```bash
robot --variablefile Variables/ENV_QC.yaml --outputdir results "Projects/<Project>/Tests/<suite>.robot"
# parallel:
pabot --variablefile Variables/ENV_QC.yaml --outputdir results "Projects/<Project>/Tests/"
```

Report pass/fail per test case + first failing keyword. A real product bug → route to debugging / fix feature, never tag the case to skip.

## Reuse rules (do NOT regenerate)

- If a `UI_<Page>` / `HighLevelKeywords_<Page>` / `VerificationKeywords_<Page>` already exists for the page, EXTEND it — add only missing keywords; match the existing naming.
- Always reuse `CommonKeyword` (browser open, networkidle, login, menu). Generating a second "open browser" keyword is a bug.
- Match the existing project's language for `[Documentation]` (Vietnamese in `nsp-automation-test`) and keyword phrasing.
