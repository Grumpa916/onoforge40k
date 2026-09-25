#!/usr/bin/env node
'use strict';

/*
  ONOForge 40K batch preflight
  Run from the repository root before pushing a feature batch:
    node scripts/preflight-batch.js
  Optional focused run:
    node scripts/preflight-batch.js --tracks 4,5
  This is a development preflight, not a replacement for GitHub Actions.
*/

const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');
const os=require('os');

const ROOT=path.join(__dirname,'..');
const args=process.argv.slice(2);
const trackArg=args.indexOf('--tracks');
const requestedTracks=trackArg>=0?String(args[trackArg+1]||'').split(',').map(x=>x.trim()).filter(Boolean):null;

const auditFiles=fs.readdirSync(path.join(ROOT,'scripts'))
  .filter(name=>/audit\.js$/i.test(name))
  .sort();

const trackPatterns={
  '1':/^track1-|^objective-|^.*objective.*audit/i,
  '2':/^track2-|^model-level-damage|^fnp-resolution|^dice-entry/i,
  '3':/^track3-/i,
  '4':/^track4-|^tactical-advisor/i,
  '5':/^track5-|^tournament-/i,
  '6':/^track6-|^catalogue-/i,
  '7':/^track7-|^.*map.*audit|^reserve-map/i
};

function selected(name){
  if(!requestedTracks)return true;
  return requestedTracks.some(t=>{
    const re=trackPatterns[t];
    return re?re.test(name):false;
  });
}

const audits=auditFiles.filter(selected);
const results=[];

function run(label,command,args){
  const r=spawnSync(command,args,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']});
  const output=((r.stdout||'')+'\n'+(r.stderr||'')).trim();
  results.push({label,pass:r.status===0,exitCode:r.status,output});
  return r.status===0;
}

console.log('ONOForge 40K batch preflight');
console.log('Scope: '+(requestedTracks?requestedTracks.join(', '):'all audit tracks'));
console.log('Audits: '+audits.length);

let failed=false;

// Browser JavaScript syntax: extract script blocks exactly as deployment validation does.
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>(.*?)<\/script>/gis)].map(m=>m[1]);
if(!scripts.length){
  results.push({label:'JavaScript script-block extraction',pass:false,exitCode:1,output:'No script blocks found'});
  failed=true;
}else{
  const tmp=path.join(os.tmpdir(),'onoforge-preflight-'+process.pid+'.js');
  fs.writeFileSync(tmp,scripts.join('\n\n'),'utf8');
  failed=!run('JavaScript syntax',process.execPath,['--check',tmp]);
  try{fs.unlinkSync(tmp)}catch{}
}

// Shared runtime-symbol protection is always included, even in focused batches.
const symbolAudit=path.join(ROOT,'scripts','runtime-internal-symbol-audit.js');
if(fs.existsSync(symbolAudit))failed=!run('Runtime internal symbols',process.execPath,[symbolAudit])||failed;

// Execute the selected repository audits independently so one failure does not hide later failures.
for(const file of audits){
  if(file==='runtime-internal-symbol-audit.js')continue;
  const ok=run(file,process.execPath,[path.join(ROOT,'scripts',file)]);
  if(!ok)failed=true;
}

const passed=results.filter(x=>x.pass).length;
const failures=results.filter(x=>!x.pass);
console.log('\nPreflight summary: '+passed+'/'+results.length+' checks passed');
if(failures.length){
  console.error('\nFAILED CHECKS');
  for(const f of failures){
    console.error('\n### '+f.label+' (exit '+f.exitCode+')\n'+f.output.slice(-5000));
  }
  process.exit(1);
}
console.log('PRELIGHT GREEN — safe to package this batch for GitHub verification.');
