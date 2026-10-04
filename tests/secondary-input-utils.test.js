const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/ui/secondary-input-utils.js','utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context);

const {secondaryInputId}=context;
assert.strictEqual(secondaryInputId('my','Behind Enemy Lines'),'score-my-behind-enemy-lines');
assert.strictEqual(secondaryInputId('opp','Cleanse the Foe!'),'score-opp-cleanse-the-foe');
assert.strictEqual(secondaryInputId('my','  Secure  the  Center  '),'score-my-secure-the-center');
assert.strictEqual(secondaryInputId('my','A/B + C'),'score-my-a-b-c');
assert.strictEqual(secondaryInputId('opp','Alpha_Unit'),'score-opp-alpha-unit');
assert.strictEqual(secondaryInputId('my',''),'score-my-');

console.log('secondary-input-utils.test.js: PASS');
