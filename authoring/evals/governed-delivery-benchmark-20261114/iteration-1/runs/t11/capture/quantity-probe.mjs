import { quantity } from './src/order.mjs';
let failures = 0;
for (const value of [0, 1, 2, 100, 101, 200]) {
  try { console.log(JSON.stringify({value, expected:'accept per snapshot rev-2', actual:'accepted', result:quantity(value)})); }
  catch (error) { failures++; console.log(JSON.stringify({value, expected:'accept per snapshot rev-2', actual:'rejected', error:error.message})); }
}
console.log(JSON.stringify({comparison:'snapshot description, not approved AC', rejected_expected_valid_values:failures, evidence_class:'UNIT', api_execution:false}));
process.exitCode = failures ? 1 : 0;
