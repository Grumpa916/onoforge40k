#!/usr/bin/env node
/** Verify the seven BSData fixtures against the extracted parser module. */
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const modulePath=path.join(root,'js','data','bsdata-parser.js');
const fixtureDir=path.join(root,'tests','fixtures','bsdata-baseline');
const source=fs.readFileSync(modulePath,'utf8');
const context={window:{},console};
vm.createContext(context);
new vm.Script(source,{filename:modulePath}).runInContext(context);
const parser=context.window.OnoForgeBSDataParser;
if(!parser||typeof parser.collectBSDataObjects!=='function'||typeof parser.bsUnitFromEntry!=='function')throw new Error('Extracted BSData parser boundary not available');

const prof=(typeName,chars,name='')=>({typeName,name,characteristics:Object.entries(chars).map(([name,$text])=>({name,$text}))});
const weapon=(typeName,name,chars)=>prof(typeName,chars,name);
const unit=(name,profiles,extra={})=>({id:`u-${name.toLowerCase().replace(/\s+/g,'-')}`,type:'unit',name,profiles,costs:[{name:'pts',value:100}],categoryLinks:[{name:'INFANTRY'}],...extra});

const cases={
  normal_unit:unit('Baseline Squad',[prof('Unit',{M:'6"',T:4,Sv:'3+',W:'2',OC:'1',LD:'7'})]),
  multiple_profiles:unit('Multi Profile',[prof('Unit',{M:'6"',T:4,Sv:'3+',W:'2',OC:'1'}),prof('Abilities',{Description:'Should not be treated as unit stats'},'Test Ability'),prof('Other',{X:'Y'},'Secondary')]),
  multiple_weapons:unit('Weapons Unit',[prof('Unit',{M:'6"',T:4,Sv:'3+',W:'2',OC:'1'}),weapon('Ranged Weapons','Rifle',{A:'2',S:4,AP:'0',D:'1',Keywords:'ASSAULT'}),weapon('Melee Weapons','Sword',{A:'4',S:5,AP:'-1',D:'1',Keywords:'TWIN LINKED'})]),
  weapon_abilities:unit('Ability Weapons',[prof('Unit',{M:'6"',T:4,Sv:'3+',W:'2',OC:'1'}),weapon('Ranged Weapons','Pistol',{A:'1',S:5,AP:'-1',D:'1',Keywords:'PISTOL'}),weapon('Ranged Weapons','Heavy Gun',{A:'2',S:8,AP:'-2',D:'2',Keywords:'HEAVY'})]),
  missing_optional_characteristics:unit('Sparse Unit',[prof('Unit',{T:4,W:'2'})]),
  wargear_options:unit('Wargear Unit',[prof('Unit',{M:'6"',T:4,Sv:'3+',W:'2',OC:'1'})],{selectionEntries:[{type:'upgrade',name:'Power Fist'},{type:'upgrade',name:'Plasma Gun'},{type:'upgrade',name:'Power Fist'}]}),
  edge_case_linked_ability:unit('Linked Unit',[prof('Unit',{M:'6"',T:4,Sv:'3+',W:'2',OC:'1',LD:'7'})],{entryLinks:[{id:'ability-1'}],selectionEntries:[{id:'ability-1',profiles:[prof('Abilities',{Description:'Linked ability text'},'Linked Ability')]}]})
};

let failures=0;
for(const [name,entry] of Object.entries(cases)){
  const expected=JSON.parse(fs.readFileSync(path.join(fixtureDir,`${name}.json`),'utf8'));
  const objectMap=parser.collectBSDataObjects(entry);
  const actual=parser.bsUnitFromEntry(entry,'Test Faction',{objectMap});
  if(JSON.stringify(actual)!==JSON.stringify(expected)){
    failures++;
    console.error(`FAIL ${name}`);
    console.error('Expected:',JSON.stringify(expected));
    console.error('Actual:  ',JSON.stringify(actual));
  }else console.log(`PASS ${name}`);
}
if(failures)process.exit(1);
console.log(`BSData extracted-module baseline: ${Object.keys(cases).length}/${Object.keys(cases).length} cases pass.`);
