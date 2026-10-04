const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/core/geometry.js','utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context);

const f=context.battlefieldDistanceBetween;
assert.strictEqual(typeof f,'function');
assert.strictEqual(f({x:0,y:0},{x:3,y:4}),5);
assert.strictEqual(f({x:1.5,y:2.5},{x:1.5,y:2.5}),0);
assert.strictEqual(f({x:0.5,y:0.5},{x:3.5,y:4.5}),5);
assert.strictEqual(f(null,{x:1,y:1}),null);
assert.strictEqual(f({x:1,y:1},null),null);
assert.strictEqual(f({x:'bad',y:1},{x:1,y:1}),null);
assert.strictEqual(f({x:Infinity,y:1},{x:1,y:1}),null);

console.log('geometry.test.js: PASS');
