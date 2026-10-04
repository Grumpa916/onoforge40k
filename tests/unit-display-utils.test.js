const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/ui/unit-display-utils.js','utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context);

const {alphaLabel}=context;
assert.strictEqual(alphaLabel(1),'α');
assert.strictEqual(alphaLabel(2),'β');
assert.strictEqual(alphaLabel(24),'ω');
assert.strictEqual(alphaLabel(25),'αα');
assert.strictEqual(alphaLabel(26),'αβ');
assert.strictEqual(alphaLabel(0),'α');
assert.strictEqual(alphaLabel(-5),'α');
assert.strictEqual(alphaLabel('3'),'γ');
assert.strictEqual(alphaLabel(undefined),'α');
assert.strictEqual(alphaLabel(3.9),'γ');

console.log('unit-display-utils.test.js: PASS');
