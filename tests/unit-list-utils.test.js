const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/data/unit-list-utils.js','utf8');
const context={};
vm.createContext(context);
vm.runInContext(source,context);

const {unitListCategory,sortUnitList,unitListCategoryName}=context;
const character={name:'Captain',keywords:['CHARACTER','INFANTRY']};
const infantry={name:'Intercessors',keywords:['INFANTRY']};
const vehicle={name:'Dreadnought',keywords:['VEHICLE']};
const aircraft={name:'Stormhawk',keywords:['AIRCRAFT']};
const transport={name:'Rhino',keywords:['TRANSPORT']};
const other={name:'Terminator',keywords:['TERMINATOR']};

assert.strictEqual(unitListCategory(character),0);
assert.strictEqual(unitListCategory(infantry),1);
assert.strictEqual(unitListCategory(vehicle),2);
assert.strictEqual(unitListCategory(aircraft),2);
assert.strictEqual(unitListCategory(transport),2);
assert.strictEqual(unitListCategory(other),3);
assert.strictEqual(unitListCategoryName(character),'Characters');
assert.strictEqual(unitListCategoryName(infantry),'Infantry');
assert.strictEqual(unitListCategoryName(vehicle),'Monsters / Vehicles');
assert.strictEqual(unitListCategoryName(other),'Other');

const input=[other,vehicle,infantry,character,{name:'Apothecary',keywords:['CHARACTER']}];
const sorted=sortUnitList(input);
assert.deepStrictEqual(sorted.map(u=>u.name),['Apothecary','Captain','Intercessors','Dreadnought','Terminator']);
assert.deepStrictEqual(input.map(u=>u.name),['Terminator','Dreadnought','Intercessors','Captain','Apothecary']);

console.log('unit-list-utils.test.js: PASS');
