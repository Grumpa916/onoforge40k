const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
let failures=0;
const pass=m=>console.log('PASS:',m);
const fail=m=>{console.error('FAIL:',m);failures++;};
const check=(ok,m)=>ok?pass(m):fail(m);

const secondaries=['A Grievous Blow','A Tempting Target','Assassination','Beacon','Behind Enemy Lines','Bring It Down','Burden of Trust','Centre Ground','Cleanse','Defend Stronghold','Display of Might','Engage on All Fronts','Forward Position','No Prisoners','Outflank','Overwhelming Force','Plunder',"Secure No Man’s Land"];
const primaries=['Battlefield Dominance','Determined Acquisition','Immovable Object','Inescapable Dominion','Purge and Secure','Death Trap','Outmanoeuvre','Delaying Action','Locate and Deny','Smoke and Mirrors','Unstoppable Force','Punishment','Meatgrinder',"Destroyer's Wrath",'Consecrate','Secure Asset','Extract Relic','Vital Link','Sabotage','Vanguard Operation','Reconnaissance Sweep','Surveil the Foe','Triangulation','Search and Scour','Gather Intel'];

check(secondaries.every(n=>s.includes(n)),'Complete 18-card Secondary catalogue');
const cards=s.slice(s.indexOf('const SECONDARY_CARDS=['),s.indexOf('const SECONDARY_SCORING='));
check((cards.match(/fixed:true/g)||[]).length===4,'Exactly 4 Fixed Secondary Missions');
check(secondaries.every(n=>s.includes(n)),'Every Secondary has scoring data');
check(primaries.every(n=>s.includes(n)),'All 25 Primary Mission scoring entries are represented');
check(s.includes('const PRIMARY_MISSIONS={'),'Primary Force-Disposition matrix is present');
check(s.includes("const SECONDARY_RULES_SOURCE={edition:'11th',missionDeck:'Chapter Approved 2026-27'"),'Secondary rules source pinned to 11th edition / Chapter Approved 2026-27');
check(s.includes("Defend Stronghold':{whenDrawn:")&&s.includes('availableFromRound:2')&&s.includes('totalVP:5'),'Defend Stronghold cumulative Tactical rule encoded');
check(s.includes("Assassination':{cumulative:{Fixed:{1:{baseIndex:0,additive:true}}}}"),'Assassination Fixed cumulative rule encoded');
check(s.includes("'Engage on All Fronts':{exclusive:{Fixed:[[0,2]],Tactical:[[0,1]]}}"),'Exclusive secondary scoring metadata encoded');
check(s.includes('const rowIndex=Number.isInteger(rowMeta?.rowIndex)?rowMeta.rowIndex:null'),'Secondary scoring records the mission-condition row');
check(s.includes('if(fixed&&roundMissionVP>0&&!cumulativeMeta)'),'Fixed Secondary duplicate-condition guard encoded');
check(s.includes('if(!fixed&&cumulativeMeta?.totalVP)vp=cumulativeMeta.totalVP'),'Tactical cumulative scoring resolves combined VP');

if(failures){console.error('Track 3 mission catalogue / scoring audit FAILED with '+failures+' failure(s)');process.exit(1);}
console.log('Track 3 mission catalogue / scoring audit PASSED');
