const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
let failures=0;
const pass=m=>console.log('PASS:',m);
const fail=m=>{console.error('FAIL:',m);failures++;};

function extractConst(name){
  const marker='const '+name+'=';
  const start=s.indexOf(marker);
  if(start<0) throw new Error(name+' not found');
  const open=s.indexOf('{',start);
  if(open<0) throw new Error(name+' object start not found');
  let depth=0,quote=null,esc=false;
  for(let i=open;i<s.length;i++){
    const c=s[i];
    if(quote){
      if(esc){esc=false;continue;}
      if(c==='\\'){esc=true;continue;}
      if(c===quote)quote=null;
      continue;
    }
    if(c==="'"||c==='"'||c==='\`'){quote=c;continue;}
    if(c==='{')depth++;
    else if(c==='}'&&--depth===0){
      const body=s.slice(open,i+1);
      return Function('return ('+body+')')();
    }
  }
  throw new Error(name+' object end not found');
}

let cards,scoring,primary,missions,meta,source;
try{
  cards=extractConst('SECONDARY_CARDS');
  scoring=extractConst('SECONDARY_SCORING');
  primary=extractConst('PRIMARY_SCORING');
  missions=extractConst('PRIMARY_MISSIONS');
  meta=extractConst('SECONDARY_RULE_META');
  source=extractConst('SECONDARY_RULES_SOURCE');
}catch(e){fail(e.message);process.exit(1);}

const expectedSecondaries=['A Grievous Blow','A Tempting Target','Assassination','Beacon','Behind Enemy Lines','Bring It Down','Burden of Trust','Centre Ground','Cleanse','Defend Stronghold','Display of Might','Engage on All Fronts','Forward Position','No Prisoners','Outflank','Overwhelming Force','Plunder',"Secure No Man’s Land"];
const expectedFixed=['A Grievous Blow','Assassination','Bring It Down','Engage on All Fronts'];

failures?null:pass('Mission data objects parse successfully');
const names=cards.map(x=>x.name);
if(names.length===18&&new Set(names).size===18&&expectedSecondaries.every(n=>names.includes(n)))pass('Complete 18-card Secondary catalogue');else fail('Secondary catalogue is not the expected 18-card set');
if(expectedFixed.every(n=>cards.find(x=>x.name===n)?.fixed) && cards.filter(x=>x.fixed).length===4)pass('Exactly 4 Fixed Secondary Missions match the current deck');else fail('Fixed Secondary catalogue mismatch');
const orphan=Object.keys(scoring).filter(n=>!names.includes(n));
const missing=names.filter(n=>!scoring[n]);
if(!orphan.length&& !missing.length)pass('Every Secondary card has scoring data and no orphan scoring entries');else{if(missing.length)fail('Secondary cards missing scoring data: '+missing.join(', '));if(orphan.length)fail('Orphan Secondary scoring entries: '+orphan.join(', '));}
for(const n of names){
  const c=scoring[n];
  const mode=c?Object.keys(c).filter(k=>k==='Fixed'||k==='Tactical'):[];
  if(!mode.length)fail(n+' has no Fixed/Tactical scoring mode');
  if(cards.find(x=>x.name===n)?.fixed&&!c.Fixed)fail(n+' is marked Fixed but has no Fixed scoring data');
  if(!cards.find(x=>x.name===n)?.fixed&&c.Fixed)fail(n+' incorrectly exposes Fixed scoring data');
}
pass('Secondary scoring mode integrity checked');
const requiredVPRows={
 'A Grievous Blow':{Fixed:1,Tactical:1},'A Tempting Target':{Tactical:1},'Assassination':{Fixed:2,Tactical:1},
 'Beacon':{Tactical:2},'Behind Enemy Lines':{Tactical:1},'Bring It Down':{Fixed:1,Tactical:1},
 'Burden of Trust':{Tactical:1},'Centre Ground':{Tactical:2},'Cleanse':{Tactical:2},
 'Defend Stronghold':{Tactical:2},'Display of Might':{Tactical:2},'Engage on All Fronts':{Fixed:2,Tactical:2},
 'Forward Position':{Tactical:1},'No Prisoners':{Tactical:1},'Outflank':{Tactical:2},
 'Overwhelming Force':{Tactical:1},'Plunder':{Tactical:1},"Secure No Man’s Land":{Tactical:1}
};
for(const n of expectedSecondaries){
 for(const mode of Object.keys(requiredVPRows[n])){
  const count=(scoring[n]?.[mode]||[]).length;
  if(count===requiredVPRows[n][mode])pass(n+' '+mode+' scoring-condition count matches catalogue');
  else fail(n+' '+mode+' scoring-condition count mismatch: '+count);
 }
}
if(meta['Defend Stronghold']?.cumulative?.Tactical?.[1]?.totalVP===5)pass('Defend Stronghold Tactical cumulative 5 VP rule encoded');else fail('Defend Stronghold cumulative rule missing');
if(meta.Assassination?.cumulative?.Fixed?.[1]?.baseIndex===0)pass('Assassination Fixed cumulative rule encoded');else fail('Assassination cumulative rule missing');
if(meta['Engage on All Fronts']?.exclusive?.Fixed?.length&&meta['Engage on All Fronts']?.exclusive?.Tactical?.length)pass('Exclusive secondary scoring structures encoded');else fail('Exclusive secondary scoring metadata missing');
const primaryNames=new Set(Object.values(missions).flatMap(x=>Object.values(x)));
const primaryMissing=[...primaryNames].filter(n=>!primary[n]);
const primaryOrphans=Object.keys(primary).filter(n=>!primaryNames.has(n));
if(primaryNames.size===25&&!primaryMissing.length&&!primaryOrphans.length)pass('All 25 Force-Disposition Primary Mission combinations have scoring data');else{if(primaryNames.size!==25)fail('Primary mission matrix does not resolve to 25 combinations');if(primaryMissing.length)fail('Primary scoring missing: '+primaryMissing.join(', '));if(primaryOrphans.length)fail('Primary scoring orphan entries: '+primaryOrphans.join(', '));}
if(/11th/.test(String(source?.edition||'')))pass('Secondary rules source is pinned to 11th edition');else fail('Secondary rules source pin missing');
if(/Chapter Approved 2026-27/.test(String(source?.missionDeck||'')))pass('Secondary mission data is pinned to Chapter Approved 2026-27');else fail('Mission deck source pin missing');
if(failures){console.error('Track 3 catalogue audit FAILED with '+failures+' failure(s)');process.exit(1);}
console.log('Track 3 mission catalogue / scoring audit PASSED');
