const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
let failures=0;
const pass=m=>console.log('PASS:',m);
const fail=m=>{console.error('FAIL:',m);failures++;};
const section=(start,end)=>{const a=s.indexOf(start),b=s.indexOf(end,a+start.length);return a>=0&&b>=0?s.slice(a,b):'';};

const cards=section('const SECONDARY_CARDS=[','\n\nconst SECONDARY_RULE_META=');
const scoring=section('const SECONDARY_SCORING={','\n\nfunction gameAssistantHtml');
const primary=section('const PRIMARY_SCORING={','function primaryMission(side)');
const matrix=section('const PRIMARY_MISSIONS={','const OBJECTIVE_LAYOUT_INDEX=');
if(cards)pass('Secondary catalogue source block present');else fail('Secondary catalogue source block missing');
if(scoring)pass('Secondary scoring source block present');else fail('Secondary scoring source block missing');
if(primary)pass('Primary scoring source block present');else fail('Primary scoring source block missing');

const secondary=[
'A Grievous Blow','A Tempting Target','Assassination','Beacon','Behind Enemy Lines','Bring It Down',
'Burden of Trust','Centre Ground','Cleanse','Defend Stronghold','Display of Might','Engage on All Fronts',
'Forward Position','No Prisoners','Outflank','Overwhelming Force','Plunder',"Secure No Man’s Land"
];
if(secondary.every(n=>cards.includes("name:'"+n+"'")))pass('Complete 18-card Secondary catalogue');else fail('Secondary catalogue missing one or more expected cards');
const fixedCount=(cards.match(/fixed:true/g)||[]).length;
if(fixedCount===4)pass('Exactly 4 Fixed Secondary Missions');else fail('Expected 4 Fixed Secondaries; found '+fixedCount);
if(secondary.every(n=>scoring.includes("'"+n+"':")))pass('Every Secondary has scoring data');else fail('One or more Secondary cards lack scoring data');

const requiredRows={
'A Grievous Blow':['Fixed:[','Tactical:['],'A Tempting Target':['Tactical:['],
'Assassination':['Fixed:[','Tactical:['],'Beacon':['Tactical:['],'Behind Enemy Lines':['Tactical:['],
'Bring It Down':['Fixed:[','Tactical:['],'Burden of Trust':['Tactical:['],'Centre Ground':['Tactical:['],
'Cleanse':['Tactical:['],'Defend Stronghold':['Tactical:['],'Display of Might':['Tactical:['],
'Engage on All Fronts':['Fixed:[','Tactical:['],'Forward Position':['Tactical:['],'No Prisoners':['Tactical:['],
'Outflank':['Tactical:['],'Overwhelming Force':['Tactical:['],'Plunder':['Tactical:['],"Secure No Man’s Land":['Tactical:[']
};
for(const [name,modes] of Object.entries(requiredRows)){
 const start=scoring.indexOf("'"+name+"':");
 const block=start>=0?scoring.slice(start,start+2500):'';
 for(const mode of modes) if(block.includes(mode))pass(name+' '+mode.replace(':[','')+' scoring mode present');else fail(name+' '+mode.replace(':[','')+' scoring mode missing');
}

const primaryNames=[
'Battlefield Dominance','Determined Acquisition','Immovable Object','Inescapable Dominion','Purge and Secure',
'Death Trap','Outmanoeuvre','Delaying Action','Locate and Deny','Smoke and Mirrors','Unstoppable Force',
'Punishment','Meatgrinder',"Destroyer's Wrath",'Consecrate','Secure Asset','Extract Relic','Vital Link','Sabotage',
'Vanguard Operation','Reconnaissance Sweep','Surveil the Foe','Triangulation','Search and Scour','Gather Intel'
];
if(primaryNames.every(n=>primary.includes(n)))pass('All 25 Primary Mission scoring entries present');else fail('Primary scoring catalogue is incomplete');
if((matrix.match(/'[A-Za-z][^']*':\{/g)||[]).length>=5)pass('Primary Force-Disposition matrix present');else fail('Primary Force-Disposition matrix missing');

if(s.includes("const SECONDARY_RULES_SOURCE={edition:'11th',missionDeck:'Chapter Approved 2026-27'"))pass('Secondary rules source pinned to 11th edition / Chapter Approved 2026-27');else fail('Secondary rules source pin missing');
if(s.includes("Defend Stronghold':{whenDrawn:")&&s.includes("availableFromRound:2")&&s.includes("totalVP:5"))pass('Defend Stronghold cumulative Tactical rule encoded');else fail('Defend Stronghold cumulative rule missing');
if(s.includes("Assassination':{cumulative:{Fixed:{1:{baseIndex:0,additive:true}}}}"))pass('Assassination Fixed cumulative rule encoded');else fail('Assassination cumulative rule missing');
if(s.includes("'Engage on All Fronts':{exclusive:{Fixed:[[0,2]],Tactical:[[0,1]]}}"))pass('Exclusive secondary scoring metadata encoded');else fail('Exclusive scoring metadata missing');
if(s.includes("const rowIndex=Number.isInteger(rowMeta?.rowIndex)?rowMeta.rowIndex:null"))pass('Secondary scoring records the mission-condition row');else fail('Secondary condition row tracking missing');
if(s.includes("if(fixed&&roundMissionVP>0&&!cumulativeMeta)"))pass('Fixed Secondary duplicate-condition guard encoded');else fail('Fixed Secondary duplicate-condition guard missing');
if(s.includes("if(!fixed&&cumulativeMeta?.totalVP)vp=cumulativeMeta.totalVP"))pass('Tactical cumulative scoring resolves combined VP');else fail('Tactical cumulative scoring resolution missing');

if(failures){console.error('Track 3 mission catalogue / scoring audit FAILED with '+failures+' failure(s)');process.exit(1);}
console.log('Track 3 mission catalogue / scoring audit PASSED');
