#!/usr/bin/env node
'use strict';

const fs=require('fs');

const html=fs.readFileSync('index.html','utf8');
const manifest=JSON.parse(fs.readFileSync('data/40kapp-source.json','utf8'));

function extractJsonArray(source,startMarker,endMarker){
  const start=source.indexOf(startMarker);
  if(start<0)throw new Error('Missing '+startMarker);
  const bodyStart=start+startMarker.length;
  const end=source.indexOf(endMarker,bodyStart);
  if(end<0)throw new Error('Missing '+endMarker);
  const text=source.slice(bodyStart,end).trim().replace(/;\s*$/,'');
  return JSON.parse(text);
}

const bootstrap=extractJsonArray(html,'const EXPANDED_CATALOGUE=','\n// Keep legacy DEMO IDs stable');
const legacy=extractJsonArray(html,'const DEMO=','\n// Expanded community catalogue');

const failures=[];
const warnings=[];
const report={};

const key=u=>String(u?.faction||'')+'|'+String(u?.name||'');
const ranged=w=>{
  const raw=String(w?.rng??w?.range??'').trim().toUpperCase();
  if(raw&&raw!=='MELEE'&&raw!=='-'&&raw!=='—')return true;
  return w?.BS!=null;
};

// 1. Unit identity.
const unitKeys=new Map(),unitIds=new Map();
for(const u of bootstrap){
  const k=key(u),id=String(u?.id||'');
  if(!u?.name)failures.push({code:'UNIT_MISSING_NAME',unit:k});
  if(unitKeys.has(k))failures.push({code:'DUPLICATE_UNIT_KEY',unit:k,ids:[unitKeys.get(k).id,id]});
  else unitKeys.set(k,u);
  if(id&&unitIds.has(id))failures.push({code:'DUPLICATE_UNIT_ID',id,units:[unitIds.get(id).name,u.name]});
  else if(id)unitIds.set(id,u);
}
report.identity={units:bootstrap.length,uniqueKeys:unitKeys.size,uniqueIds:unitIds.size};

// 2. Weapon completeness.
let rangedProfiles=0,missingDirectRange=0,coreStatErrors=0;
for(const u of bootstrap){
  const weapons=Array.isArray(u?.weapons)?u.weapons:[];
  if(!weapons.length){failures.push({code:'NO_WEAPONS',unit:key(u)});continue;}
  const names=weapons.map(w=>String(w?.name||'').trim()).filter(Boolean);
  const dup=[...new Set(names.filter((n,i)=>names.indexOf(n)!==i))];
  if(dup.length)failures.push({code:'DUPLICATE_WEAPON_NAME',unit:key(u),weapons:dup});
  for(const w of weapons){
    const name=String(w?.name||'').trim();
    if(!name){failures.push({code:'WEAPON_MISSING_NAME',unit:key(u)});continue;}
    const missing=['A','S','AP','D'].filter(k=>w?.[k]==null||String(w[k]).trim()==='');
    if(missing.length){
      coreStatErrors++;
      failures.push({code:'WEAPON_CORE_STAT_MISSING',unit:key(u),weapon:name,missing});
    }
    if(ranged(w)){
      rangedProfiles++;
      const direct=String(w?.rng??w?.range??'').trim();
      if(!direct){
        missingDirectRange++;
        warnings.push({code:'RANGED_RANGE_NOT_EMBEDDED',unit:key(u),weapon:name});
      }
    }
  }
}
report.weapons={rangedProfiles,missingDirectRange,coreStatErrors};

// 3. Duplicate-definition reconciliation between legacy and bootstrap layers.
const legacyByKey=new Map(legacy.map(u=>[key(u),u]));
let legacyConflicts=0,legacyMissingFieldWarnings=0;
for(const u of bootstrap){
  const old=legacyByKey.get(key(u));
  if(!old)continue;
  const oldBy=new Map((old.weapons||[]).map(w=>[String(w?.name||''),w]));
  for(const w of (u.weapons||[])){
    const o=oldBy.get(String(w?.name||''));
    if(!o)continue;
    const fields=['rng','range','BS','WS','A','S','AP','D'];
    const conflicts=fields.filter(f=>o?.[f]!=null&&w?.[f]!=null&&String(o[f])!==String(w[f]));
    if(conflicts.length){
      legacyConflicts++;
      warnings.push({code:'LEGACY_BOOTSTRAP_FIELD_CONFLICT',unit:key(u),weapon:w.name,fields:conflicts});
    }
    const missing=fields.filter(f=>o?.[f]!=null&&w?.[f]==null);
    if(missing.length)legacyMissingFieldWarnings+=missing.length;
  }
}
report.reconciliation={legacyUnits:legacy.length,matchingUnits:[...legacyByKey.keys()].filter(k=>unitKeys.has(k)).length,fieldConflicts:legacyConflicts,legacyFieldsDropped:legacyMissingFieldWarnings};

// 4. Tactical Advisor compatibility.
const requiredFunctions=[
  'tacticalWeaponRange','tacticalWeaponIsRanged','tacticalAdvisorWeaponGroups',
  'tacticalAdvisorV1','tacticalTargetLegality','getTacticalAdvisorResult',
  'getTacticalTargetLegalityCached','getTacticalRenderBundle'
];
const missingFunctions=requiredFunctions.filter(n=>!new RegExp('function\\s+'+n+'\\s*\\(').test(html));
if(missingFunctions.length)failures.push({code:'TACTICAL_FUNCTION_MISSING',functions:missingFunctions});
report.tactical={requiredFunctions,missingFunctions};

// 5. Deployment/source gate.
const policyOk=html.includes('name:\'40k.app\'')&&html.includes('role:\'authoritative\'')&&html.includes('role:\'supplemental\'')&&html.includes('role:\'fallback-only\'');
if(!policyOk)failures.push({code:'SOURCE_POLICY_MISSING'});
if(!manifest?.source?.name||manifest.source.name!=='40k.app')failures.push({code:'CANONICAL_MANIFEST_INVALID'});
if(manifest?.source?.revision==null)failures.push({code:'CANONICAL_REVISION_MISSING'});
report.source={canonical:manifest?.source?.name||null,revision:manifest?.source?.revision??null,policyOk};

const blocking=failures.length>0;
const result={status:blocking?'FAIL':'PASS',blockingErrors:failures.length,warnings:warnings.length,report,failures,warnings};
console.log(JSON.stringify(result,null,2));

if(blocking)process.exit(1);
