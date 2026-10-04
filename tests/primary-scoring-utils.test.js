const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/battle/primary-scoring-utils.js','utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context);

const {primaryScoringRoundRange,primaryScoringVP,primaryScoringIsPer}=context;
assert.strictEqual(typeof primaryScoringRoundRange,'function');
assert.deepStrictEqual({...primaryScoringRoundRange('R1–2')},{min:1,max:2});
assert.deepStrictEqual({...primaryScoringRoundRange('R3-5')},{min:3,max:5});
assert.deepStrictEqual({...primaryScoringRoundRange('R4+')},{min:4,max:5});
assert.deepStrictEqual({...primaryScoringRoundRange('R2')},{min:2,max:2});
assert.deepStrictEqual({...primaryScoringRoundRange('')},{min:1,max:5});

assert.strictEqual(primaryScoringVP('5 VP'),5);
assert.strictEqual(primaryScoringVP('Score 12 points'),12);
assert.strictEqual(primaryScoringVP('0 VP'),0);
assert.strictEqual(primaryScoringVP(''),0);
assert.strictEqual(primaryScoringVP(null),0);

assert.strictEqual(primaryScoringIsPer(['R1','5 VP','Per objective']),true);
assert.strictEqual(primaryScoringIsPer(['R1','5 VP','For each objective']),true);
assert.strictEqual(primaryScoringIsPer(['R1','5 VP','Control objective']),false);
assert.strictEqual(primaryScoringIsPer(null),false);

console.log('primary-scoring-utils.test.js: PASS');
