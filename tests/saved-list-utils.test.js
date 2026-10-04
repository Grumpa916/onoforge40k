const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/data/saved-list-utils.js','utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context);

assert.strictEqual(context.isPermanentSampleArmy('sample-123'),true);
assert.strictEqual(context.isPermanentSampleArmy('sample-'),true);
assert.strictEqual(context.isPermanentSampleArmy('army-123'),false);
assert.strictEqual(context.isPermanentSampleArmy(''),false);
assert.strictEqual(context.isPermanentSampleArmy(null),false);

assert.strictEqual(context.formatSavedListDate(''), 'Date not recorded');
assert.strictEqual(context.formatSavedListDate(null), 'Date not recorded');
assert.strictEqual(context.formatSavedListDate('not-a-date'), 'not-a-date');
const formatted=context.formatSavedListDate('2026-01-02T15:04:00Z');
assert.ok(/2026/.test(formatted));
assert.ok(/Jan/.test(formatted));
assert.ok(/2/.test(formatted));

console.log('saved-list-utils.test.js: PASS');
