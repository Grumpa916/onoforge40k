const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/core/dice-utils.js','utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context);

const {parseNum}=context;
assert.strictEqual(typeof parseNum,'function');
assert.strictEqual(parseNum('D6'),3.5);
assert.strictEqual(parseNum('d6'),3.5);
assert.strictEqual(parseNum(' D6 '),3.5);
assert.strictEqual(parseNum('2D6'),7);
assert.strictEqual(parseNum('D6+2'),5.5);
assert.strictEqual(parseNum('2D6+1'),8);
assert.strictEqual(parseNum(' 3d6+4 '),14.5);
assert.strictEqual(parseNum('6'),6);
assert.strictEqual(parseNum(4.5),4.5);
assert.strictEqual(parseNum('0'),1);
assert.strictEqual(parseNum(''),1);
assert.strictEqual(parseNum('invalid'),1);
assert.strictEqual(parseNum(undefined),1);

assert.strictEqual(context.OnoForgeDiceUtils.parseNum,parseNum);

console.log('dice-utils.test.js: PASS');
