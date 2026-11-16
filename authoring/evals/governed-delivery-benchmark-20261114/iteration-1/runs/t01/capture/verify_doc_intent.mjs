import { resolveDocumentationAction } from '../../../packs/p17/_refs/documentation/intent.mjs';
import assert from 'node:assert/strict';
const result = resolveDocumentationAction({ requested_action: 'technical-doc' });
assert.equal(result.mode, 'write-technical-doc');
assert.equal(result.writes, true);
console.log(JSON.stringify(result));
