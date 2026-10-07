(function(global){
  function createTacticalCoreStateController(deps={}){
    const {
      state,entry,get,esc,event,save,render,snapshotForUndo,
      TACTICAL_RENDER_CACHE,ONOFORGE_SOURCE_POLICY_11E,
      activeWeaponNames,
      bodyguardLeaders,bodyguardSupports,buildModelRoster,
      calculateMath,
      ensureObjectiveLayoutForMission,isLeaderUnit,isSupportUnit,
      modelRosterRule,modelRosterWeaponCounts,objectiveBattlefieldGeometry,objectiveControlSourceIds,
      objectiveHomeSide,objectiveLayoutPage,objectiveMapModel,objectiveMissionKey,
      objectivePrimaryScoringImpact,objectiveStateRecord,objectiveTacticalSummary,
      objectiveTurnStartOwner,primaryMission,primaryScoringRowsForRound,
      reserveUnitsForSide,survivingModelRoster,survivingModels,
      tacticalContextHtmlBody,
      tacticalPairKey,tacticalPairState,tacticalPreRollOpenResolutionForSides,
      tacticalTargetLegality,
      tacticalWeaponModelAvailable,tacticalWeaponModelModeConflict,tacticalWeaponPhaseEligible,
      tacticalWeaponRange,unitDatabase,unitDisplayName
    }=deps;
    const alert=typeof global.alert==='function'?global.alert.bind(global):()=>{};
    const TACTICAL_STATE_VERSION='1.4';
function ensureTacticalState(){
  if(!state.tactical||typeof state.tactical!=='object')state.tactical={version:TACTICAL_STATE_VERSION,pairs:{},unitUse:{},unitMovement:{},unitActions:{},fightPhase:{}};
  if(!state.tactical.pairs||typeof state.tactical.pairs!=='object')state.tactical.pairs={};
  if(!state.tactical.unitUse||typeof state.tactical.unitUse!=='object')state.tactical.unitUse={};
  if(!state.tactical.unitMovement||typeof state.tactical.unitMovement!=='object')state.tactical.unitMovement={};
  if(!state.tactical.unitActions||typeof state.tactical.unitActions!=='object')state.tactical.unitActions={};
  if(!state.tactical.fightPhase||typeof state.tactical.fightPhase!=='object')state.tactical.fightPhase={};
  if(!state.tactical.preRoll||typeof state.tactical.preRoll!=='object')state.tactical.preRoll={};
  state.tactical.version=TACTICAL_STATE_VERSION;
  return state.tactical;
}
function tacticalDistanceLabel(ctx){
  return ctx.distanceInches===null?'Unknown':ctx.distanceInches+'"';
}
function tacticalContextHtml(){
  const currentPhase=String(state.phase||'Command');
  // Movement has its own unit-by-unit tracker. Tactical Context is intentionally
  // hidden here so the live-game workflow stays focused on recording movement.
  if(currentPhase==='Command'||currentPhase==='Movement') return '';
  const advisorEntry=tacticalAdvisorAttackerEntry();
  if(currentPhase==='Shooting'&&advisorEntry&&!tacticalAdvisorAttackerHasRangedWeapons(advisorEntry)) return '';
  const open=state.tacticalContextOpen===true;
  return '<details class="card tactical-context-card" '+(open?'open':'')+' ontoggle="state.tacticalContextOpen=this.open;save()">'+
    '<summary style="list-style:none;cursor:pointer;user-select:none;padding:2px 0">'+
      '<div class="split"><div><h3 style="margin:0">Tactical Context</h3><div class="muted">Optional battlefield input for the Tactical Advisor • Unknown values are never guessed.</div></div>'+
      '<span class="pill">'+esc(state.phase||'Command')+'</span></div>'+
    '</summary>'+
    '<div style="margin-top:10px">'+tacticalContextHtmlBody()+'</div>'+
  '</details>';
}

function tacticalCombatFightWeapons(attackerSide,targetSide,attackerEntry,targetEntry){
  if(!attackerEntry||!targetEntry)return [];
  const groups=attachedCombatWeaponGroups(attackerSide,attackerEntry,targetEntry).filter(g=>tacticalWeaponPhaseEligible(g.weapon,'Fight',attackerEntry,targetEntry,attackerSide,targetSide));
  const out=[],seen=new Set();
  groups.forEach(g=>{
    const w=g.weapon;if(!w||!w.name)return;
    const key=String(w.name)+'|'+String(w.WS??w.BS??'')+'|'+String(w.A??'')+'|'+String(w.D??'');
    if(seen.has(key))return;
    seen.add(key);out.push({group:g,weapon:w});
  });
  return out;
}
function tacticalOpenFightResolution(attackerSide,targetSide,attackerUid,targetUid,weaponName){
  if(!attackerUid||!targetUid||!weaponName)return;
  if(state.phase!=='Fight'){alert('Fight Execution is only available during the Fight phase.');return;}
  if(!tacticalPreRollOpenResolutionForSides(attackerSide,targetSide,attackerUid,targetUid,weaponName)){
    alert('This melee resolution is not ready. Confirm the units are still engaged and the Fight state is known.');
  }
}


function tacticalAdvisorAttackerEntry(){
  const candidates=(state.my||[]).filter(e=>!e.attachedTo&&!tacticalUnitState('my',e)?.destroyed);
  const selected=state.tactical?.selectedAttackerUid;
  return candidates.find(e=>e.uid===selected)||mathRosterEntry('my')||candidates[0]||null;
}
function tacticalWeaponIsRanged(w){
  if(!w)return false;
  const raw=String(w.rng??w.range??'').trim().toUpperCase();
  if(raw==='MELEE')return false;
  if(raw)return true;
  // Normalized catalogue entries distinguish melee and ranged weapons by
  // WS vs BS when a range value is absent.
  if(w.WS!=null&&w.BS==null)return false;
  if(w.BS!=null)return true;
  const abilities=Array.isArray(w.abilities)?w.abilities.map(x=>String(x).toUpperCase()):[];
  if(abilities.includes('CLOSE QUARTERS')&&w.WS!=null&&w.BS==null)return false;
  return false;
}
function tacticalAdvisorWeaponGroups(side,e,target=null){
  const cache=TACTICAL_RENDER_CACHE.signature?TACTICAL_RENDER_CACHE:null;
  const cacheKey=String(side||'')+'|'+String(e?.uid||'')+'|'+String(target?.uid||'');
  if(cache&&cache.weaponGroups.has(cacheKey))return cache.weaponGroups.get(cacheKey);
  const baseRaw=attachedCombatWeaponGroups(side,e,target);
  const root=combatRootEntry(side,e)||e;
  const snap=combatSnapshot(side,root);
  const models=Math.max(1,Number(snap?.survivingModels)||Number(root?.models)||Number(get(root?.unitId)?.models)||1);
  // Repair incomplete legacy combat weapon profiles from the authoritative catalogue.
  // The combat snapshot may omit range/BS/other fields; Tactical Advisor must not
  // preserve those omissions simply because a weapon name already exists.
  const authorityEntries=[root,...attachedCombatEntries(side,root)].filter(Boolean);
  const authorityByName=new Map();
  authorityEntries.forEach(ce=>{
    const u=get(ce.unitId);
    (u?.weapons||[]).forEach(w=>{
      const name=String(w?.name||'');
      if(name&&!authorityByName.has(name))authorityByName.set(name,w);
    });
  });
  const normalizeWeapon=(w)=>{
    const name=String(w?.name||'');
    const canonical=authorityByName.get(name);
    if(!canonical)return w;
    const merged={...canonical,...w};
    if((w?.rng==null||String(w.rng).trim()==='')&&(w?.range==null||String(w.range).trim()==='')){
      if(canonical?.rng!=null)merged.rng=canonical.rng;
      else if(canonical?.range!=null)merged.range=canonical.range;
    }
    if(merged.BS==null&&canonical?.BS!=null)merged.BS=canonical.BS;
    if(merged.WS==null&&canonical?.WS!=null)merged.WS=canonical.WS;
    if(merged.A==null&&canonical?.A!=null)merged.A=canonical.A;
    if(merged.S==null&&canonical?.S!=null)merged.S=canonical.S;
    if(merged.AP==null&&canonical?.AP!=null)merged.AP=canonical.AP;
    if(merged.D==null&&canonical?.D!=null)merged.D=canonical.D;
    if(!Array.isArray(merged.abilities)&&Array.isArray(canonical?.abilities))merged.abilities=[...canonical.abilities];
    return merged;
  };
  const base=baseRaw.map(g=>({...g,weapon:normalizeWeapon(g?.weapon||{})}));
  const covered=new Set(base.map(g=>String(g?.weapon?.name||'')));
  const groups=[...base];
  attachedCombatEntries(side,root).forEach(ce=>{
    const u=get(ce.unitId);if(!u)return;
    activeWeaponNames(ce,u).forEach(name=>{
      if(covered.has(String(name)))return;
      const weapon=(u.weapons||[]).find(w=>String(w?.name||'')===String(name));
      if(!weapon)return;
      // Some fixed-weapon monsters can legally use several weapon profiles,
      // but the legacy combat snapshot allocates only one profile per model.
      // Supply missing catalogue weapons to Tactical Advisor without changing
      // the underlying Mathhammer allocation UI.
      groups.push({
        key:String(ce.uid)+'|tactical|' + String(name),
        poolKey:String(ce.uid)+'|tactical|' + String(name),
        entry:ce,
        attacker:u,
        weapon:{...weapon},
        count:models,
        modelIds:[],
        role:combatComponentRole(side,root,ce,u),
        identityExact:false,
        weaponVariants:[{weapon:{...weapon},count:models}]
      });
      covered.add(String(name));
    });
  });
  if(cache)cache.weaponGroups.set(cacheKey,groups);
  return groups;
}
function weaponDataIntegrityScan(){
  const units=Array.isArray(unitDatabase())?unitDatabase():[];
  const sourceRole=Array.isArray(window.CURRENT_UNIT_DATABASE)?'canonical':'bootstrap';
  const errors=[],warnings=[],unitRows=[];
  const push=(bucket,code,u,detail)=>bucket.push({
    code,unitId:String(u?.id||''),unit:String(u?.name||u?.id||'Unknown unit'),
    faction:String(u?.faction||''),detail,sourceRole:String(u?.sourceRole||sourceRole)
  });
  const unitKeys=new Map(),unitIds=new Map();

  units.forEach(u=>{
    const label=String(u?.name||u?.id||'Unknown unit'),key=String(u?.faction||'')+'|'+label,id=String(u?.id||'');
    if(!u?.name)push(errors,'UNIT_MISSING_NAME',u,'Unit is missing a name.');
    if(unitKeys.has(key))push(errors,'DUPLICATE_UNIT_KEY',u,'Duplicate faction/name with '+String(unitKeys.get(key)?.id||'unknown')+'.');
    else unitKeys.set(key,u);
    if(id&&unitIds.has(id))push(errors,'DUPLICATE_UNIT_ID',u,'Duplicate unit id with '+String(unitIds.get(id)?.name||'unknown')+'.');
    else if(id)unitIds.set(id,u);

    const weapons=Array.isArray(u?.weapons)?u.weapons:[];
    if(!weapons.length){
      push(errors,'NO_WEAPONS',u,'Unit has no weapon profiles.');
      unitRows.push({unit:label,faction:String(u?.faction||''),status:'error',ranged:0,melee:0,active:0,snapshot:0,tactical:0});
      return;
    }
    const names=weapons.map(w=>String(w?.name||'').trim()).filter(Boolean);
    const duplicates=[...new Set(names.filter((n,i)=>names.indexOf(n)!==i))];
    if(duplicates.length)push(errors,'DUPLICATE_WEAPON_NAME',u,'Duplicate profile name: '+duplicates.join(', '));

    let ranged=0,melee=0,ambiguous=0;
    for(const w of weapons){
      const name=String(w?.name||'').trim();
      if(!name){push(errors,'WEAPON_MISSING_NAME',u,'A weapon profile is missing its name.');continue;}
      const rawRange=String(w?.rng??w?.range??'').trim();
      const isRanged=tacticalWeaponIsRanged(w);
      const resolvedRange=tacticalWeaponRange(w);
      if(isRanged)ranged++;else melee++;
      const hasBS=w?.BS!=null,hasWS=w?.WS!=null;
      if(hasBS&&hasWS){ambiguous++;push(warnings,'WEAPON_BOTH_BS_WS',u,name+' has both BS and WS.');}
      else if(!hasBS&&!hasWS&&!rawRange){ambiguous++;push(warnings,'WEAPON_CLASSIFICATION_AMBIGUOUS',u,name+' has no range, BS or WS marker.');}
      const missingCore=['A','S','AP','D'].filter(k=>w?.[k]==null||String(w[k]).trim()==='');
      if(missingCore.length)push(errors,'WEAPON_CORE_STAT_MISSING',u,name+' missing '+missingCore.join(', ')+'.');
      if(isRanged&&resolvedRange===null){
        if(sourceRole==='canonical')push(errors,'RANGED_RANGE_UNRESOLVED',u,name+' is ranged but the verified runtime source does not resolve a numeric range.');
        else push(warnings,'BOOTSTRAP_RANGED_RANGE_MISSING',u,name+' lacks a direct range in the embedded bootstrap catalogue; resolve it from the current structured BSData 11e source before promotion.');
      }
    }

    const auditEntry={
      uid:'__weapon-audit__'+String(u?.id||label).replace(/[^A-Za-z0-9_-]/g,'_'),
      unitId:u.id,qty:1,models:Math.max(1,Number(u?.models)||1),wargear:[],wargearSelections:{},
      weapons:weapons.map(w=>w?.name).filter(Boolean),enhancement:'',notes:'',attachedTo:null,leaderUid:null
    };
    const activeNames=Array.from(new Set(activeWeaponNames(auditEntry,u).map(String)));
    const snapshot=combatSnapshot('my',auditEntry);
    const snapshotNames=Array.from(new Set((snapshot?.weapons||[]).map(x=>String(x?.weapon?.name||'')).filter(Boolean)));
    const tacticalGroups=tacticalAdvisorWeaponGroups('my',auditEntry);
    const tacticalNames=Array.from(new Set(tacticalGroups.map(g=>String(g?.weapon?.name||'')).filter(Boolean)));
    const missingFromSnapshot=activeNames.filter(n=>!snapshotNames.includes(n));
    const missingFromTactical=activeNames.filter(n=>!tacticalNames.includes(n));
    if(missingFromSnapshot.length)push(warnings,'COMBAT_SNAPSHOT_WEAPON_GAP',u,'Active catalogue profiles omitted by combat snapshot: '+missingFromSnapshot.join(', '));
    if(missingFromTactical.length)push(errors,'TACTICAL_WEAPON_GAP',u,'Active catalogue profiles missing from Tactical Advisor: '+missingFromTactical.join(', '));
    const rowStatus=missingFromTactical.length?'error':(missingFromSnapshot.length||ambiguous?'warning':'ok');
    unitRows.push({unit:label,faction:String(u?.faction||''),status:rowStatus,ranged,melee,active:activeNames.length,snapshot:snapshotNames.length,tactical:tacticalNames.length});
  });

  const currentArmy={my:[],opp:[]};
  ['my','opp'].forEach(side=>{
    const entries=(state?.[side]||[]).filter(e=>!e?.attachedTo);
    entries.forEach(e=>{
      const u=get(e?.unitId);if(!u)return;
      const groups=tacticalAdvisorWeaponGroups(side,e);
      const ranged=groups.filter(g=>tacticalWeaponIsRanged(g?.weapon));
      const active=Array.from(new Set(activeWeaponNames(e,u).map(String)));
      const visible=Array.from(new Set(groups.map(g=>String(g?.weapon?.name||'')).filter(Boolean)));
      const missing=active.filter(n=>!visible.includes(n));
      if(missing.length)currentArmy[side].push({unit:unitDisplayName(side,e),unitId:u.id,detail:'Tactical Advisor is missing active profiles: '+missing.join(', ')});
      if(side==='my'&&active.some(n=>tacticalWeaponIsRanged((u.weapons||[]).find(w=>w.name===n)))&&!ranged.length){
        currentArmy[side].push({unit:unitDisplayName(side,e),unitId:u.id,detail:'Unit has active ranged profiles but Tactical Advisor exposes none.'});
      }
    });
  });

  return {
    generatedAt:new Date().toISOString(),
    sourcePolicy:ONOFORGE_SOURCE_POLICY_11E,
    activeSource:sourceRole==='canonical'?'OnoForge verified runtime snapshot':'Embedded bootstrap catalogue',
    totalUnits:units.length,
    errorCount:errors.length,
    warningCount:warnings.length,
    passCount:unitRows.filter(x=>x.status==='ok').length,
    errors,warnings,unitRows,currentArmy
  };
}
function weaponDataIntegrityAuditHtml(){
  const a=weaponDataIntegrityScan();
  const badge=a.errorCount?'<span class="pill danger">Needs attention</span>':a.warningCount?'<span class="pill">Review warnings</span>':'<span class="pill ok">All checks passed</span>';
  const issueRows=[...a.errors.map(x=>({...x,severity:'ERROR'})),...a.warnings.map(x=>({...x,severity:'WARNING'}))];
  const armyIssues=[...a.currentArmy.my.map(x=>({...x,side:'My Army'})),...a.currentArmy.opp.map(x=>({...x,side:'Opponent'}))];
  const issueHtml=issueRows.length?'<div style="margin-top:10px">'+issueRows.slice(0,40).map(x=>'<div class="status" style="margin-top:5px"><b>'+esc(x.severity)+' • '+esc(x.unit)+'</b><div class="tiny">'+esc(x.code)+' — '+esc(x.detail)+'</div></div>').join('')+(issueRows.length>40?'<div class="tiny" style="margin-top:6px">Showing first 40 issues.</div>':'')+'</div>':'<div class="ok" style="margin-top:10px">No catalogue or Tactical Advisor weapon gaps detected.</div>';
  const armyHtml=armyIssues.length?'<div style="margin-top:10px">'+armyIssues.map(x=>'<div class="status" style="margin-top:5px"><b>'+esc(x.side)+' • '+esc(x.unit)+'</b><div class="tiny">'+esc(x.detail)+'</div></div>').join('')+'</div>':'<div class="tiny" style="margin-top:8px">No weapon visibility problems detected in the currently loaded armies.</div>';
  const rows=a.unitRows.map(x=>'<tr><td>'+esc(x.unit)+'</td><td>'+esc(x.faction)+'</td><td>'+esc(x.status)+'</td><td>'+x.ranged+'</td><td>'+x.melee+'</td><td>'+x.active+'</td><td>'+x.snapshot+'</td><td>'+x.tactical+'</td></tr>').join('');
  return '<details class="card" style="margin-top:12px" open><summary style="cursor:pointer"><div class="split"><div><h3 style="margin:0">Weapon &amp; Data Integrity Audit</h3><div class="muted" style="margin-top:4px">Automatic catalogue-wide check of weapon classification, ranges, combat-snapshot coverage, and Tactical Advisor visibility.</div></div>'+badge+'</div></summary>'+
    '<div class="grid3" style="margin-top:10px"><div class="status"><div class="muted small">Units scanned</div><b>'+a.totalUnits+'</b></div><div class="status"><div class="muted small">Errors</div><b>'+a.errorCount+'</b></div><div class="status"><div class="muted small">Warnings</div><b>'+a.warningCount+'</b></div></div>'+
    '<div style="margin-top:10px"><b>Current armies</b>'+armyHtml+'</div>'+
    '<div style="margin-top:12px"><b>Issues</b>'+issueHtml+'</div>'+
    '<details style="margin-top:12px"><summary><b>Unit scan details</b></summary><div style="overflow:auto;margin-top:8px"><table style="width:100%;font-size:11px"><thead><tr><th>Unit</th><th>Faction</th><th>Status</th><th>Ranged</th><th>Melee</th><th>Active</th><th>Snapshot</th><th>Tactical</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>'+
    '<div class="tiny" style="margin-top:8px">A snapshot gap is a warning when the catalogue is correct and Tactical Advisor can recover the profile. This identifies legacy combat-layer omissions without treating them as missing rules data.</div>'+
  '</details>';
}

function tacticalAdvisorAttackerHasRangedWeapons(entry){
  if(!entry)return false;
  // Weapon ownership comes from the authoritative catalogue-aware Tactical Advisor,
  // not only the legacy combat snapshot.
  return tacticalAdvisorWeaponGroups('my',entry).some(g=>tacticalWeaponIsRanged(g?.weapon));
}
function setTacticalAdvisorAttacker(uid){
  const e=entry('my',uid);
  if(!e)return;
  ensureTacticalState().selectedAttackerUid=e.uid;
  ensureTacticalState().selectedTargetUid=null;
  save();render();
}
function tacticalAdvisorConfidenceLabel(value){
  const v=Math.max(0,Math.min(1,Number(value)||0));
  return v>=0.80?'High':v>=0.55?'Medium':'Limited';
}
function tacticalPreRollPoolIdentity(g){
  const w=g?.weapon||{},abilities=Array.isArray(w.abilities)?w.abilities.map(x=>String(x).trim()).filter(Boolean).sort():[];
  return JSON.stringify({entryUid:String(g?.entry?.uid||''),name:String(w.name||''),BS:String(w.BS??''),WS:String(w.WS??''),S:String(w.S??''),AP:String(w.AP??''),D:String(w.D??''),A:String(w.A??''),abilities});
}
function tacticalPreRollNormalizePoolAllocations(pool,raw){
  const ids=Array.isArray(pool?.modelIds)?pool.modelIds.map(String):[];
  const valid=new Set((state.opp||[]).filter(e=>!e.attachedTo&&!tacticalUnitState('opp',e)?.destroyed).map(e=>String(e.uid)));
  let rows=Array.isArray(raw?.allocations)?raw.allocations.map(x=>({targetUid:String(x?.targetUid||''),count:Math.max(0,Math.floor(Number(x?.count)||0)),modelIds:Array.isArray(x?.modelIds)?x.modelIds.map(String):[]})):[]; 
  if(!rows.length&&raw?.targetUid)rows=[{targetUid:String(raw.targetUid),count:ids.length,modelIds:[]}];
  const remaining=new Set(ids),out=[];
  rows.forEach(row=>{
    if(!valid.has(row.targetUid)||row.count<=0)return;
    const assigned=[];
    for(const id of row.modelIds){if(assigned.length>=row.count)break;if(remaining.has(id)){assigned.push(id);remaining.delete(id);}}
    for(const id of ids){if(assigned.length>=row.count)break;if(remaining.has(id)){assigned.push(id);remaining.delete(id);}}
    if(assigned.length)out.push({targetUid:row.targetUid,count:assigned.length,modelIds:assigned});
  });
  if(!out.length&&ids.length)out.push({targetUid:'',count:ids.length,modelIds:ids.slice()});
  const assignedIds=new Set(out.flatMap(x=>x.modelIds)),unassigned=ids.filter(id=>!assignedIds.has(id));
  if(unassigned.length)out.push({targetUid:'',count:unassigned.length,modelIds:unassigned});
  return out;
}
function tacticalPreRollPoolAvailableModelIds(g,side='my'){
  const ids=Array.isArray(g?.modelIds)?g.modelIds.map(String):[],uid=g?.entry?.uid;
  return ids.filter(id=>uid&&tacticalWeaponModelAvailable(uid,id,g.weapon,state.round,state.phase,side)&&!tacticalWeaponModelModeConflict(uid,id,g.weapon,g.entry,state.round,state.phase,side));
}
function tacticalPreRollPoolManifest(ae,attackerSide='my'){
  const phase=String(state.phase||'Shooting');
  // Use the Tactical Advisor weapon groups here rather than the legacy combat
  // snapshot alone. Fixed-weapon monsters can legally use several profiles,
  // while the older snapshot records only one selected profile per model.
  const groups=tacticalAdvisorWeaponGroups(attackerSide,ae,null).filter(g=>tacticalWeaponPhaseEligible(g.weapon,phase,g.entry,null,attackerSide,'opp'));
  const t=ensureTacticalState(),saved=t.preRollPools&&typeof t.preRollPools==='object'?t.preRollPools:{};
  return groups.filter(g=>g.weapon?.name).map(g=>{
    let modelIds=Array.isArray(g.modelIds)?g.modelIds.map(String):[];
    if(!modelIds.length&&g.entry){
      const u=get(g.entry.unitId),roster=survivingModelRoster(g.entry,u),snap=combatSnapshot(attackerSide,g.entry);
      const wanted=String(g.weapon.name);
      const rosterMatches=roster.filter(m=>(m.weapons||[]).some(w=>String(w)===wanted));
      const snapModels=(snap?.models||[]).filter(m=>String(m.sourceEntryUid||'')===String(g.entry.uid));
      const indexByRosterId=new Map(roster.map((m,i)=>[String(m.id),i]));
      modelIds=rosterMatches.map(m=>{
        const i=indexByRosterId.get(String(m.id));
        return i!=null&&snapModels[i]?String(snapModels[i].id):String(m.id);
      }).filter(Boolean);
    }
    const poolBase={...g,modelIds,count:modelIds.length};
    const modelPool={...poolBase};
    const available=tacticalPreRollPoolAvailableModelIds(modelPool,attackerSide);
    const pool={...poolBase,modelIds:available,count:available.length};
    const key=tacticalPreRollPoolIdentity(pool),raw=saved[key]||{},allocations=tacticalPreRollNormalizePoolAllocations(pool,raw);
    return {...pool,key,allocations,targetUid:allocations.find(x=>x.targetUid)?.targetUid||null};
  }).filter(p=>p.modelIds.length);
}
function setTacticalPreRollPoolTarget(poolId,targetUid){
  const ae=tacticalAdvisorAttackerEntry();if(!ae||!poolId)return;
  const before=snapshotForUndo(),t=ensureTacticalState(),key=String(poolId),manifest=tacticalPreRollPoolManifest(ae),pool=manifest.find(p=>p.key===key);
  if(!pool)return;
  const uid=String(targetUid||'');
  const valid=uid&&entry('opp',uid)&&pool.modelIds.length;
  const allocations=valid?[{targetUid:uid,count:pool.modelIds.length,modelIds:[...pool.modelIds]}]:[{targetUid:'',count:pool.modelIds.length,modelIds:[...pool.modelIds]}];
  t.preRollPools=t.preRollPools||{};t.preRollPools[key]={allocations};
  if(valid){
    t.preRoll=t.preRoll||{};
    t.preRoll[tacticalPairKey(ae.uid,uid)]={weaponName:String(pool.weapon?.name||''),poolId:key};
  }
  event('TACTICAL_PREROLL_POOL_CHANGED',{poolId:key,field:'targetUid',targetUid:uid,action:'Pre-roll pool target changed',before:null,after:allocations},before);
  save();render();
}
function setTacticalPreRollPoolAllocation(poolId,index,field,value){
  const ae=tacticalAdvisorAttackerEntry();if(!ae||!poolId)return;
  const before=snapshotForUndo(),t=ensureTacticalState(),key=String(poolId),manifest=tacticalPreRollPoolManifest(ae),pool=manifest.find(p=>p.key===key);
  if(!pool)return;
  const allocations=tacticalPreRollNormalizePoolAllocations(pool,t.preRollPools?.[key]||{});
  const i=Math.max(0,Math.floor(Number(index)||0));
  if(i>=allocations.length)return;
  const row={...allocations[i]};
  if(field==='targetUid'){
    const uid=String(value||'');
    if(uid&&!entry('opp',uid))return;
    row.targetUid=uid;
  }else if(field==='count'){
    const n=Math.max(0,Math.min(pool.modelIds.length,Math.floor(Number(value)||0)));
    row.count=n;
  }else return;
  const next=allocations.map((x,j)=>j===i?row:x).filter(x=>x.count>0||x.targetUid);
  const normalized=tacticalPreRollNormalizePoolAllocations(pool,{allocations:next});
  t.preRollPools=t.preRollPools||{};t.preRollPools[key]={allocations:normalized};
  event('TACTICAL_PREROLL_POOL_CHANGED',{poolId:key,index:i,field,value:row[field],action:'Pre-roll pool allocation changed',before:allocations,after:normalized},before);
  save();render();
}
function tacticalPreRollWeaponState(attackerUid,targetUid,attackerSide='my',targetSide='opp'){
  const t=ensureTacticalState(),raw=t.preRoll?.[tacticalPairKey(attackerUid,targetUid)];
  if(!raw||typeof raw!=='object')return {weaponName:'',poolId:''};
  const weaponName=String(raw.weaponName||''),poolId=String(raw.poolId||'');
  if(!weaponName)return {weaponName:'',poolId:''};
  // Pre-roll weapon selection is phase-scoped. A weapon selected in Fight
  // (for example Powerful limbs) must not survive into Shooting and leave the
  // Shooting selector showing only its placeholder while the check still uses
  // the stale melee weapon.
  const ae=entry(attackerSide,attackerUid),te=entry(targetSide,targetUid);
  if(ae){
    const phase=String(state.phase||'Command');
    // Use the same authoritative catalogue-aware pool manifest as the
    // Pre-Roll selector. The legacy combat snapshot can omit valid fixed
    // weapon profiles (notably monster weapon pools), which previously caused
    // a just-selected weapon to be discarded on the next render.
    const manifest=tacticalPreRollPoolManifest(ae,attackerSide);
    const match=manifest.find(p=>String(p?.weapon?.name||'')===weaponName);
    if((phase==='Shooting'||phase==='Fight')&&!match){
      return {weaponName:'',poolId:''};
    }
  }
  return {weaponName,poolId};
}
function setTacticalPreRollWeapon(weaponName){
  const ae=tacticalAdvisorAttackerEntry(),teUid=state.tactical?.selectedTargetUid;
  if(!ae||!teUid)return;
  const name=String(weaponName||''),manifest=tacticalPreRollPoolManifest(ae);
  const pool=manifest.find(p=>String(p.weapon?.name||'')===name&&p.allocations.some(x=>String(x.targetUid)===String(teUid)&&x.modelIds.length));
  const fallback=manifest.find(p=>String(p.weapon?.name||'')===name);
  if(!name||!pool&&!fallback)return;
  const selected=pool||fallback,t=ensureTacticalState();
  t.preRoll=t.preRoll||{};t.preRoll[tacticalPairKey(ae.uid,teUid)]={weaponName:name,poolId:selected.key};
  if(!pool&&fallback&&manifest.length===1){
    t.preRollPools=t.preRollPools||{};
    t.preRollPools[selected.key]={allocations:[{targetUid:String(teUid),count:selected.modelIds.length,modelIds:[...selected.modelIds]}]};
  }
  const singleTargetAutoAssignHotfix=true;
  if(singleTargetAutoAssignHotfix&&selected&&teUid&&manifest.length===1){
    t.preRollPools=t.preRollPools||{};
    const current=t.preRollPools[selected.key]?.allocations;
    const allocations=Array.isArray(current)?current:[];
    const hasAssignedTarget=allocations.some(x=>String(x.targetUid||'')===String(teUid)&&Array.isArray(x.modelIds)&&x.modelIds.length);
    if(!hasAssignedTarget&&selected.modelIds.length){
      t.preRollPools[selected.key]={allocations:[{targetUid:String(teUid),count:selected.modelIds.length,modelIds:[...selected.modelIds]}]};
    }
  }

  save();render();
}












const {createMathCombatEngineStateController}=window.OnoForgeMathCombatEngineState;
const mathCombatEngineStateController=createMathCombatEngineStateController({
  state,entry,get,modelRosterRule,buildModelRoster,bodyguardLeaders,bodyguardSupports,
  isSupportUnit,isLeaderUnit,activeWeaponNames,modelRosterWeaponCounts,DEMO,
  engineHalfRangeActive,calculateMath,engineSaveDistribution,engineContext,engineOneAttack,
  save,render
});
const {parseNum,roll,targetNeed,ruleContext,expected,mathRosterEntry,combatRootEntry,attachedCombatEntries,combatComponentRole,combatModelSnapshot,combatSnapshot,combatTargetUnit,combatTargetEntry,combatUnit,engineApplicableWeaponAbilities,engineWeaponPoolKey,engineWeaponVariantKey,attachedCombatWeaponGroups,mathUnit,mathWeaponAlloc,normalizeMathWeaponForUnit,setMathRoster,setMathWeaponCount,calculateMathMixed,engineMonteCarloMixed}=mathCombatEngineStateController;
const {createTacticalAdvisorContextStateController}=window.OnoForgeTacticalAdvisorContextState;
const tacticalAdvisorContextStateController=createTacticalAdvisorContextStateController({
  state,get,modelRosterRule,survivingModelRoster,ensureTacticalState,objectiveStateRecord,
  ensureObjectiveLayoutForMission,objectiveMissionKey,objectiveLayoutPage,objectiveBattlefieldGeometry,
  objectiveMapModel,primaryMission,primaryScoringRowsForRound,objectiveTacticalSummary,objectiveHomeSide,
  objectivePrimaryScoringImpact,esc,objectiveTurnStartOwner,objectiveControlSourceIds,entry,mathRosterEntry,
  tacticalPairState,TACTICAL_STATE_VERSION
});
const {tacticalUnitState,tacticalBattleState,tacticalUnitActionState,tacticalLegalityForUnit,tacticalObjectiveAdvisor,tacticalObjectiveAdvisorHtml,tacticalObjectiveValueForTarget,tacticalPrimaryTargetImpact,tacticalAdvisorStateSnapshot,tacticalAdvisorStateSignature}=tacticalAdvisorContextStateController;
const {createTacticalAdvisorRenderStateController}=window.OnoForgeTacticalAdvisorRenderState;
const tacticalAdvisorRenderStateController=createTacticalAdvisorRenderStateController({state,tacticalAdvisorStateSignature,TACTICAL_RENDER_CACHE,tacticalTargetLegality,tacticalAdvisorWeaponGroups,tacticalPairState,missionDecisionContext,reserveUnitsForSide,get,advisorStratagemPressure});
const {prepareTacticalRenderCache,getTacticalAdvisorResult,getTacticalAdvisorV2Result,getTacticalTargetLegalityCached,getTacticalRenderBundle,tacticalAdvisorBattleStateContext,tacticalAdvisorStratagemPressure,tacticalAdvisorV2,tacticalAdvisorV1}=tacticalAdvisorRenderStateController;




    return Object.freeze({ensureTacticalState,tacticalDistanceLabel,tacticalContextHtml,tacticalCombatFightWeapons,tacticalOpenFightResolution,tacticalAdvisorAttackerEntry,tacticalWeaponIsRanged,tacticalAdvisorWeaponGroups,weaponDataIntegrityScan,weaponDataIntegrityAuditHtml,tacticalAdvisorAttackerHasRangedWeapons,setTacticalAdvisorAttacker,tacticalAdvisorConfidenceLabel,tacticalPreRollPoolIdentity,tacticalPreRollNormalizePoolAllocations,tacticalPreRollPoolAvailableModelIds,tacticalPreRollPoolManifest,setTacticalPreRollPoolTarget,setTacticalPreRollPoolAllocation,tacticalPreRollWeaponState,setTacticalPreRollWeapon});
  }
  global.OnoForgeTacticalCoreState=Object.freeze({createTacticalCoreStateController});
})(window);
