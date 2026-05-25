# Utilities — Extensions

**Import path**: `@sd-angular/core/utilities/extensions`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

Pure-function utility namespaces. None of them mutate global prototypes (the `declare global { Array.prototype.* }` blocks in source are commented out — earlier monkey-patching has been deprecated in favour of explicit namespaced calls). Import the named export and call its members.

Each file exports a single object (e.g. `ArrayUtilities`, `StringUtilities`, ...) whose members are the functions documented below — except `color.extension.ts` (named `function` exports) and `detect-incognito.ts` (single `detectIncognito` export).

---

## `array.extension.ts` — `ArrayUtilities`

Generic helpers for filtering and shaping arrays of records, with diacritic-insensitive search.

| Name | Signature | Purpose |
| --- | --- | --- |
| `search` | `<T>(items: T[], searchText, fields?, children?) => T[]` | Filter items whose given field(s) include the search text using `StringUtilities.aliasIncludes` (Vietnamese-diacritic-insensitive). Recurses into `children` field if provided. |
| `union` | `<T>(key: string, ...args: T[][]) => T[]` | Merge multiple arrays and de-duplicate by `item[key]` (first occurrence wins). |
| `toObject` | `<T>(key: string, items: T[]) => Record<string, T>` | Convert array of records into a dictionary keyed by `item[key].toString()`. |
| `distinct` | `<T>(items: T[]) => T[]` | Return unique values via `new Set(...)`. Works on primitives. |
| `paging` | `<T>(items: T[], pageSize: number, page = 0) => T[]` | Slice page `page` of size `pageSize` (zero-indexed). |

```ts
ArrayUtilities.search(users, 'Đỗ', ['fullName', 'email']); // matches "Do" too
```

---

## `color.extension.ts` — named function exports

Color conversion helpers (no namespace object).

| Name | Signature | Purpose |
| --- | --- | --- |
| `hslToHex` | `(h: number, s: number, l: number) => string` | Convert HSL (`0–360, 0–100, 0–100`) to `#rrggbb` hex. |
| `rgbToHex` | `(r: number, g: number, b: number) => string` | Convert RGB (`0–255` each, clamped) to `#rrggbb` hex. |

---

## `date.extension.ts` — `DateUtilities`

Date arithmetic and formatting; tolerant of `string | Date | any`. All functions return `null` (not throw) on invalid input.

| Name | Signature | Purpose |
| --- | --- | --- |
| `isDate` | `(value: any) => boolean` | Validate a value as a real date (incl. common `MM/dd/yyyy`, `yyyy-MM-dd` string variants). |
| `toFormat` | `(value: any, format: string) => string` | Format a date using tokens `yyyy MM dd HH mm ss` (uses `Intl.DateTimeFormat` for locale-correct parts). |
| `parseFrom` | `(value: any, format: string) => Date \| null` | Inverse of `toFormat` — parse a string given a format pattern. |
| `equal` | `(d1, d2) => boolean` | Strict-equal by `.getTime()`; both invalid → `true`, mixed → `false`. |
| `dayDiff` / `monthDiff` / `yearDiff` | `(d1, d2) => number \| null` | Difference in days / calendar months / calendar years (signed; `d2 - d1`). |
| `age` | `(d1, d2) => number \| null` | Year-fractional age (months/12) rounded via `NumberUtilities.round`. |
| `addMiliseconds` / `addHours` / `addDays` / `addMonths` | `(value, n) => Date \| null` | Return a new `Date` shifted by `n` units. |
| `begin` | `(value) => Date \| null` | Start-of-day (`00:00:00.000`). |
| `end` | `(value) => Date \| null` | End-of-day (`23:59:59.999`) — implemented as `begin(value+1day) - 1ms`. |
| `timeDifference` | `(previous, current = new Date()) => string` | Human-friendly relative phrase — `"5 minutes ago"`, `"2 days ago"`, `"3 years ago"`. English output. |

---

## `detect-incognito.ts` — `detectIncognito`

Single-export browser private-mode detector adapted from `detectIncognito v1.3.0` (Joe Rutkowski).

| Name | Signature | Purpose |
| --- | --- | --- |
| `detectIncognito` | `() => Promise<{ isPrivate: boolean; browserName: string }>` | Run browser-specific probes (Safari indexedDB blob, Chrome storage quota, Firefox `serviceWorker`, IE `indexedDB`) and resolve with detected browser name + private-mode flag. Rejects if the browser cannot be classified. |

`browserName` ∈ `{ 'Safari', 'Chrome', 'Brave', 'Edge', 'Opera', 'Chromium', 'Firefox', 'Internet Explorer', 'Unknown' }`.

---

## `number.extension.ts` — `NumberUtilities`

Number formatting and validation. Inputs are tolerant (`any`); strip commas before parsing.

| Name | Signature | Purpose |
| --- | --- | --- |
| `toVNCurrency` | `(value: any) => string \| null` | Format with `vi-VN` locale (`1.234.567,89`). Same as `toVN` — kept as alias. |
| `toVN` | `(value: any) => string \| null` | Vietnamese locale number format. |
| `toISO` | `(value: any) => string \| null` | `en-US` locale format (`1,234,567.89`). |
| `isNumber` | `(value: any) => boolean` | Coercible to a finite number, not empty. |
| `isPositiveInteger` | `(value: any) => boolean` | Matches `^[0-9]*$` AND `> 0`. |
| `isPositiveNumber` | `(value: any) => boolean` | Matches `^[0-9]+(\.[0-9]+)?$` AND `> 0`. |
| `round` | `(value: any, digits = 2) => number \| null` | Round to `digits` decimals via `Math.round`. |

---

## `string.extension.ts` — `StringUtilities`

Vietnamese-aware string helpers, validation regexes, and lightweight templating.

Exposed regex constants: `REGEX_EMAIL`, `REGEX_PHONE`, `REGEX_PHONE_VN`, `REGEX_IDVN_OR_PASSPORT`, `REGEX_TIME` (also surfaced via `SdPatternCommons`).

| Name | Signature | Purpose |
| --- | --- | --- |
| `isValidEmail` / `isValidPhone` / `isValidCode` | `(value: any) => boolean` | Regex validators. `isValidCode` enforces 2–20 alphanumeric / `@_-`. |
| `isNullOrEmpty` | `(value: any) => boolean` | `undefined`, `null`, or `''`. |
| `isNullOrWhiteSpace` | `(value: any) => boolean` | Above OR string of only spaces. |
| `changeAliasLowerCase` | `(alias: any) => string` | Strip Vietnamese diacritics and special chars; lowercase, trim. |
| `aliasIncludes` | `(alias: any, searchText: any) => boolean` | `changeAliasLowerCase(alias).includes(changeAliasLowerCase(searchText))`. Used by `ArrayUtilities.search`. |
| `format` | `(template: string, ...args: any[]) => string` | C#-style `{0} {1}` placeholder replacement. |
| `templateToDisplay` | `(template: string, entity: object) => string` | Replace `${path.to.field}` placeholders by reading nested values from `entity`. |
| `parseExpression` | `(template: string, entity: object) => unknown` | Like `templateToDisplay` but if the entire template is one `${path}` returns the raw value (preserves type); supports literals `true`/`false`/`null`/`undefined`/numbers. Safe — does NOT `eval`. |
| `encrypt` / `decrypt` | `(obj: any) => string` / `(s: string) => any` | Reversible obfuscation (URL-encoded JSON with `{`↔`}` swap and a fixed SALT). NOT cryptographically secure — for opaque URL params only. |
| `convertToSnakeCaseCode` | `(name: string) => string` | `"Đội Kỹ Thuật"` → `"doi_ky_thuat"`. Throws if `name` not a string. |
| `generateUniqueCode` | `(name: string, existingCodes: string[]) => string` | `convertToSnakeCaseCode` + suffix `_1`, `_2`, ... until unique. |
| `sha256` | `(input: string) => Promise<string>` | URL-safe base64 SHA-256 via `crypto.subtle`. |

---

## `utility.extension.ts` — `SdUtilities`

Browser/file/object odds-and-ends.

| Name | Signature | Purpose |
| --- | --- | --- |
| `upload` | `(option?: { extensions?, maxSizeInMb?, validator?, multiple? }) => Promise<File \| File[] \| null>` | Programmatic file picker — injects a hidden `<input type=file>`, validates extension/size/custom rule, resolves with selected file(s). |
| `download` | `(fileOrPath: File \| string, fileName?) => void` | Trigger browser download of a `File` (via blob URL) or a string path/URL. External `http*` URLs open in new tab instead. |
| `downloadBlob` | `(blob: Blob, fileName?) => void` | Trigger download of an arbitrary `Blob`. |
| `changeAliasLowerCase` | `(alias: string) => string` | Same algo as `StringUtilities.changeAliasLowerCase` (duplicated here for utility callers). |
| `copyToClipboard` | `(text: string) => void` | `navigator.clipboard.writeText`. |
| `allWithPaging` | `<T>(func: (pageSize, pageNumber) => Promise<{items, total}>, defaultPageSize?) => Promise<T[]>` | Drain a paginated API into a single array (default page size `1000`). |
| `isIncognito` | `() => Promise<boolean>` | Lightweight private-mode detection (storage quota + localStorage probe) — simpler/less reliable than `detectIncognito`. |
| `isMobile` | `() => boolean` | UA sniff for `Mobi` or `Android`. |
| `randomId` | `(prefix?: string) => string` | Base-36 timestamp ID, optionally prefixed. |
| `hash` | `(obj: any) => string` | Stable 32-bit non-crypto hash of any object — `h` + abs(int). Uses `stableStringify` (sorted keys, special-cases `File`). |
| `parseQueryParams` | `(queryString?: string) => Record<string, string>` | Wrap `URLSearchParams` into a plain object. |
| `getClientPublicIp` | `() => Promise<string \| null>` | Calls `https://api.ipify.org?format=json`. Returns `null` on failure. |
| `generateUuid` | `() => string` | `crypto.randomUUID()` with timestamp+random fallback for legacy browsers. |
| `getNestedValue` | `(obj: any, path: string) => any` | Read nested value by dotted path; safe against `undefined` segments. |
