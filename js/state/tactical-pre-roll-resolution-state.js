function createTacticalPreRollResolutionStateController({getState,entry,tacticalPreRollWeaponState,tacticalPreRollPoolManifest,tacticalCombatPairState,tacticalTargetLegality,combatTargetUnit,get,tacticalAdvisorActionState,combatRootEntry,tacticalHalfRangeState,tacticalRapidFireValue,tacticalMeltaValue,engineContext,tacticalUnitIsEngagedAny,tacticalUnitIsMonsterVehicle,combatSnapshot,engineSaveDistribution,tacticalWeaponUseState,attachedCombatWeaponGroups,engineFnp,ensureTacticalState,tacticalPreRollPoolIdentity,tacticalWeaponModelAvailable,tacticalWeaponModelModeConflict,engineExpectedDice,engineSustained,tacticalPairKey,save,render,tacticalAdvisorAttackerEntry,alert,tacticalPreRollFnp,pickModel,applyNormalDamage,pickInGroup,pickGroupModel}){
  const state=getState();
function tacticalPreRollCheck(attackerUid,targetUid,weaponName,attackerSide='my',targetSide='opp'){
  const ae=entry(attackerSide,attackerUid),te=entry(targetSide,targetUid),name=String(weaponName||''),empty={status:'check-required',weapon:name,warnings:[],steps:[],hitBase:null,hitFinal:null,woundFinal:null,save:null,modifiers:[]};
  if(!ae||!te||!name)return empty;
  const poolState=tacticalPreRollWeaponState(ae.uid,te.uid,attackerSide,targetSide),manifest=tacticalPreRollPoolManifest(ae,attackerSide);
  let pool=manifest.find(p=>p.key===String(poolState.poolId)&&String(p.weapon?.name||'')===name);
  if(!pool)pool=manifest.find(p=>String(p.weapon?.name||'')===name&&p.allocations.some(x=>String(x.targetUid)===String(te.uid)&&x.modelIds.length));
  if(!pool)pool=manifest.find(p=>String(p.weapon?.name||'')===name);
  if(!pool)return {...empty,warnings:['No eligible models remain for this weapon pool.']};
  const targetAlloc=pool.allocations.filter(x=>String(x.targetUid)===String(te.uid));
  const unassigned=pool.allocations.filter(x=>!x.targetUid).reduce((n,x)=>n+x.modelIds.length,0);
  const assignedCount=targetAlloc.reduce((n,x)=>n+x.modelIds.length,0);
  const allAssigned=pool.allocations.reduce((n,x)=>n+x.modelIds.length,0)===pool.modelIds.length&&unassigned===0;
  const ctx=tacticalCombatPairState(attackerSide,targetSide,ae.uid,te.uid),leg=tacticalTargetLegality(ae,te,state.phase,attackerSide,targetSide),warnings=[];
  const w=pool.weapon,targetUnit=combatTargetUnit(targetSide,te)||get(te.unitId),movement=tacticalAdvisorActionState(combatRootEntry(attackerSide,ae)?.uid||ae.uid);
  const halfRangeState=tacticalHalfRangeState(w,ctx.distanceInches);
  const breakpointWeapon=tacticalRapidFireValue(w)>0||tacticalMeltaValue(w)>0;
  if(breakpointWeapon&&halfRangeState.active===null)warnings.push('Measure the distance to the target before rolling: Rapid Fire/Melta depends on half range.');
  if(!allAssigned)warnings.push('Assign every available model in this weapon pool to exactly one target before rolling.');
  if(assignedCount<=0)warnings.push('This weapon pool has no models assigned to the selected target.');
  if(leg.canTarget===false||leg.canTarget===null)warnings.push(...(leg.reasons||[]));
  const c=engineContext(get(ae.unitId),w,targetUnit,{...(state.mathRules||{}),halfRange:halfRangeState.active===true,chargeMade:!!movement?.chargeMade,attackerEngagedWithTarget:ctx.engagement==='engaged',attackerEngagedAny:tacticalUnitIsEngagedAny(ae.uid),attackerMonsterVehicle:tacticalUnitIsMonsterVehicle(ae),engagedTargetMonsterVehicle:ctx.engagement==='engaged'&&tacticalUnitIsMonsterVehicle(te),movementDistanceInches:movement?.movementDistanceInches,heavyEligible:movement?.movement==='remained'&&movement?.setUpThisTurn!==true&&Number(movement?.movementDistanceInches||0)<=3});
  const precisionWeapon=(w.abilities||[]).some(a=>String(a||'').toUpperCase().includes('PRECISION'));
  const precisionSnap=combatSnapshot(targetSide,te),precisionCharacters=(precisionSnap?.characterModels||[]).filter(m=>m.alive!==false),precisionTargetId=String((state.mathRules||{}).precisionTargetModelId||''),precisionTarget=precisionCharacters.find(m=>String(m.id)===precisionTargetId),precisionVisible=(state.mathRules||{}).precisionTargetVisible===true;
  if(precisionWeapon&&(!precisionTarget||!precisionVisible))warnings.push('Precision requires a selected visible CHARACTER allocation group before rolling.');
  const save=engineSaveDistribution(targetUnit,w,c,{...(state.mathRules||{})}),modifiers=[];
  if(c.closeQuartersHitPenalty)modifiers.push('-1 to Hit: close-quarters shooting condition');
  if(c.cover)modifiers.push('+1 to Hit needed: Cover / Indirect Fire');
  if(c.heavy)modifiers.push('Heavy: +1 to Hit when eligible');
  if(c.anti)modifiers.push('Anti-X: improved wound threshold applies');
  if(c.lethal)modifiers.push('Lethal Hits');
  if(c.sustained)modifiers.push('Sustained Hits '+c.sustained);
  if(c.devastating)modifiers.push('Devastating Wounds');
  if(c.torrent)modifiers.push('Torrent: auto-hit');
  const hitBase=String(w.BS||w.WS||'4+'),hitFinal=c.torrent?'Auto':c.hitNeed+'+',woundFinal=c.woundNeed+'+';
  const steps=[{label:'Hit',value:hitFinal,detail:c.torrent?'Auto-hit':('Base '+hitBase+(c.hitNeed!==Number(String(hitBase).replace('+',''))?' • modifiers applied':''))},{label:'Wound',value:woundFinal,detail:'Strength '+String(w.S??'?')+' vs Toughness '+String(targetUnit?.profile?.T??'?')},{label:'Save',value:save.need>6?'No save':save.need+'+',detail:save.inv?'Invulnerable '+save.inv+'+ available':'Armour save'}];
  const precisionReady=!precisionWeapon||(!!precisionTarget&&precisionVisible); const status=leg.canTarget===false?'blocked':(!allAssigned||assignedCount<=0||leg.canTarget===null||(breakpointWeapon&&halfRangeState.active===null)||!precisionReady?'check-required':'ready');
  return {status,weapon:name,poolId:pool.key,poolModelIds:pool.modelIds,targetModelIds:targetAlloc.flatMap(x=>x.modelIds),attackerModelIds:targetAlloc.flatMap(x=>x.modelIds),modelCount:assignedCount,hitBase,hitFinal,woundFinal,save,modifiers,warnings,steps,context:ctx,torrent:!!c.torrent,lethal:!!c.lethal,sustained:Number(c.sustained)||0,devastating:!!c.devastating,precision:precisionWeapon,precisionTargetModelId:precisionTarget?.id||null,precisionTargetVisible:precisionVisible&&!!precisionTarget,hitCritThreshold:c.critHitThreshold||6,woundCritThreshold:c.critWoundThreshold||6};
}
function tacticalPreRollSessionKey(attackerEntryUid,targetEntryUid,weaponName,poolId=null,attackerSide='my',targetSide='opp'){
  const as=attackerSide==='opp'?'opp':'my',ts=targetSide==='my'?'my':'opp';
  return as+':'+String(attackerEntryUid||'')+'>'+ts+':'+String(targetEntryUid||'')+'|'+String(weaponName||'')+'|'+String(poolId||'');
}
function tacticalPreRollContextSignature(attackerEntryUid,targetEntryUid,weaponName,result,attackerSide='my',targetSide='opp'){
  const ae=entry(attackerSide,attackerEntryUid),te=entry(targetSide,targetEntryUid);
  const phase=String(state.phase||'Command'),round=Math.max(1,Number(state.round)||1),turn=state.currentTurn==='opp'?'opp':'my';
  const pair=ae&&te?tacticalCombatPairState(attackerSide,targetSide,ae.uid,te.uid):null;
  const action=ae?tacticalAdvisorActionState(combatRootEntry(attackerSide,ae)?.uid||ae.uid):null;
  const weaponUse=ae&&weaponName?tacticalWeaponUseState(ae.uid,weaponName,attackerSide):null;
  const atkSnap=ae?combatSnapshot(attackerSide,ae):null,defSnap=te?combatSnapshot(targetSide,te):null;
  return JSON.stringify({
    phase,round,turn,attackerEntryUid,targetEntryUid,weaponName,
    pair,action,weaponUse,
    weaponProfile:(ae&&te?attachedCombatWeaponGroups(attackerSide,ae,te).map(g=>g.weapon).find(x=>String(x.name)===String(weaponName)):null)?(()=>{const p=attachedCombatWeaponGroups('my',ae,te).map(g=>g.weapon).find(x=>String(x.name)===String(weaponName))||{};return {name:String(p.name||''),A:String(p.A??''),BS:String(p.BS??''),WS:String(p.WS??''),S:String(p.S??''),AP:String(p.AP??''),D:String(p.D??''),rng:String(p.rng??p.range??''),abilities:Array.isArray(p.abilities)?p.abilities.map(String).sort():[]};})():null,
    hitBase:result?.hitBase,hitFinal:result?.hitFinal,woundFinal:result?.woundFinal,
    save:result?.save||null,modifiers:result?.modifiers||[],
    attackCount:result?.modelCount||0,hitCritThreshold:result?.hitCritThreshold||6,woundCritThreshold:result?.woundCritThreshold||6,
    attackerModels:atkSnap?.survivingModels,targetModels:defSnap?.survivingModels,
    targetWounds:defSnap?.targetWoundsState||[],
    targetProfiles:(defSnap?.models||[]).filter(m=>m.alive!==false).map(m=>({id:m.id,T:m.profile?.T,Sv:m.profile?.Sv,InSv:m.profile?.InSv,W:m.profile?.W,character:!!m.character})),
    targetResolutionRules:(defSnap?.models||[]).filter(m=>m.alive!==false).map(m=>({id:m.id,rerollSave1:!!m.rerollSave1,fnp:engineFnp(m)||null,invuln:m.invuln4?4:m.invuln5?5:m.invuln6?6:(m.profile?.InSv??m.profile?.Invuln??m.profile?.invuln??null),saveModifier:Number(m.minusSave||0),character:!!m.character})),
    targetExact:defSnap?.exactModelIdentity,targetAttached:defSnap?.components?.length>1,
    mathRules:state.mathRules||{},
    poolId:result?.poolId||null,targetModelIds:result?.targetModelIds||[],
    precisionTargetModelId:result?.precisionTargetModelId||null,precisionTargetVisible:result?.precisionTargetVisible===true,
    attackerModelIds:result?.attackerModelIds||result?.poolModelIds||[]
  });
}
function tacticalPreRollResolutionState(){
  const t=ensureTacticalState();
  if(!t.preRollResolution||typeof t.preRollResolution!=='object')t.preRollResolution={};
  return t.preRollResolution;
}
function tacticalPreRollResolutionCurrent(){
  const t=ensureTacticalState(),map=tacticalPreRollResolutionState(),key=String(t.preRollResolutionOpen||''),raw=key?map[key]:null;
  if(!raw)return null;
  const attackerSide=raw.attackerSide==='opp'?'opp':'my',targetSide=raw.targetSide==='my'?'my':'opp',ae=entry(attackerSide,raw.attackerEntryUid),te=entry(targetSide,raw.targetEntryUid);
  if(!ae||!te)return null;
  const stored=String(raw.weaponName||'');if(!stored)return null;
  const r=tacticalPreRollCheck(ae.uid,te.uid,stored,attackerSide,targetSide);
  if(!r||!['ready','ready-with-warnings'].includes(r.status))return null;
  const poolId=String(r.poolId||raw.poolId||''),signature=tacticalPreRollContextSignature(ae.uid,te.uid,stored,r,attackerSide,targetSide);
  if(raw.signature!==signature)return null;
  return {...raw,key,signature,poolId:raw.poolId||poolId||null,result:r,attackerEntryUid:ae.uid,targetEntryUid:te.uid,weaponName:stored,attackerSide,targetSide};
}
function tacticalPreRollSaveGroups(te,provisionalStates=null,targetSide='opp'){
  const snap=combatSnapshot(targetSide,te);
  const rawModels=(snap?.models||[]).map(m=>({...m}));
  const overrides=new Map();
  if(provisionalStates instanceof Map){
    provisionalStates.forEach((v,k)=>overrides.set(String(k),v));
  }else if(Array.isArray(provisionalStates)){
    provisionalStates.forEach(v=>{if(v&&v.id!=null)overrides.set(String(v.id),v);});
  }else if(provisionalStates&&typeof provisionalStates==='object'){
    Object.entries(provisionalStates).forEach(([k,v])=>overrides.set(String(k),v));
  }
  const models=rawModels.map(m=>{
    const o=overrides.get(String(m.id));
    return o?{...m,...o,id:m.id}:m;
  }).filter(m=>m.alive!==false);
  const bodyguardPresent=(snap?.components||[]).some(c=>c.role==='bodyguard'&&c.models?.some(m=>{
    const o=overrides.get(String(m.id)); return o?o.alive!==false:m.alive!==false;
  }));
  const explicitPrecisionId=(Array.isArray(provisionalStates)&&provisionalStates.length===1&&provisionalStates[0]?.character)
    ?String(provisionalStates[0].id):null;
  const allocatable=models.filter(m=>!m.character||!bodyguardPresent||String(m.id)===explicitPrecisionId);
  const groups=[];
  const map=new Map();
  allocatable.forEach(m=>{
    const p=m.profile||{}, character=!!m.character;
    const saveResolutionKey=JSON.stringify({W:p.W??'',Sv:p.Sv??'',InSv:p.InSv??'',inv4:!!m.invuln4,inv5:!!m.invuln5,inv6:!!m.invuln6,minusSave:Number(m.minusSave||0),rerollSave1:!!m.rerollSave1,fnp:engineFnp(m)||null});
    const key=character?'CHAR:'+m.id:'MODEL:'+saveResolutionKey;
    if(character){
      groups.push({
        id:key,label:m.unitName||m.role||'Character',character:true,
        wounded:Number(m.woundsRemaining||0)<Number(m.maxWounds||p.W||1),
        modelIds:[m.id],models:[m]
      });
    }else{
      let g=map.get(key);
      if(!g){
        g={id:key,label:(m.role||m.unitName||'Models')+' • W'+String(p.W??'?')+' / Sv '+String(p.Sv??'?')+(p.InSv?(' / Inv '+p.InSv):''),character:false,wounded:false,modelIds:[],models:[]};
        map.set(key,g);groups.push(g);
      }
      g.modelIds.push(m.id);g.models.push(m);
      if(Number(m.woundsRemaining||0)<Number(m.maxWounds||p.W||1))g.wounded=true;
    }
  });
  return groups;
}
function tacticalPreRollLegalSaveOrder(groups,orderIds){
  const rank=g=>g.character?(g.wounded?2:3):(g.wounded?0:1);
  const ordered=(orderIds||[]).map(id=>groups.find(g=>g.id===id)).filter(Boolean);
  if(ordered.length!==groups.length||new Set(ordered.map(g=>g.id)).size!==groups.length)return false;
  for(let i=1;i<ordered.length;i++)if(rank(ordered[i])<rank(ordered[i-1]))return false;
  return true;
}
function tacticalPreRollApplyMixedSaveRolls(current,rolls){
  const s=current.state||current.session,plan=current.plan||s.plan;
  const targetSide=current.targetSide==='my'?'my':'opp',targetEntry=entry(targetSide,current.targetEntryUid),targetUnit=combatTargetUnit(targetSide,targetEntry)||get(targetEntry?.unitId);
  if(!targetEntry||!targetUnit)throw new Error('Target state is no longer available.');
  const provisional=s.mixedResolution?.modelStates||((s.precisionTargetState)?[s.precisionTargetState]:null);
  const groups=tacticalPreRollSaveGroups(targetEntry,provisional,targetSide),orderIds=s.saveOrder||groups.map(g=>g.id);
  if(!tacticalPreRollLegalSaveOrder(groups,orderIds))throw new Error('The allocation order is not legal under the 11th Edition save-roll rules.');
  const sorted=rolls.slice().map(Number).filter(Number.isFinite).map(v=>Math.floor(v)),saveable=Math.max(0,Number(current.saveable)||0);
  if(sorted.length!==saveable)throw new Error('Enter exactly '+saveable+' save results.');
  if(sorted.some(v=>v<1||v>6))throw new Error('Save results must be D6 values from 1 to 6.');
  const snap=combatSnapshot(targetSide,targetEntry);
  const states=new Map((snap?.models||[]).filter(m=>m.alive!==false).map(m=>[String(m.id),{id:m.id,sourceEntryUid:m.sourceEntryUid,sourceUnitId:m.sourceUnitId,character:!!m.character,profile:m.profile||{},maxWounds:Number(m.maxWounds||m.profile?.W||1)||1,alive:m.alive!==false,woundsRemaining:Math.max(0,Number(m.woundsRemaining)||0)}]));
  if(s.precisionTargetState){const ps=s.precisionTargetState,pm=states.get(String(ps.modelId));if(pm){pm.alive=ps.alive!==false;pm.woundsRemaining=Math.max(0,Number(ps.woundsRemaining)||0);}}
  const liveByGroup=new Map(groups.map(g=>[g.id,g.models.filter(m=>m.alive!==false).map(m=>states.get(String(m.id))).filter(Boolean)]));
  let currentGroupIndex=0,damage=0,failed=0;const resolution=[];
  const pickModel=g=>{const arr=liveByGroup.get(g?.id)||[];return arr.find(m=>m.alive!==false&&Number(m.woundsRemaining||0)<Number(m.maxWounds||m.profile?.W||1))||arr.find(m=>m.alive!==false)||null;};
  const weapon=current.weapon||{AP:0,D:1},normalDamage=Math.max(0,Number(plan.damageValue)||1),variableDamage=!!plan.variableDamage;
  const criticalWounds=Math.min(Number(s.specials?.criticalWounds)||0,Number(s.counts?.wounds)||0);
  const applyNormalDamage=(m,amount)=>{const before=Math.max(0,Number(m?.woundsRemaining)||0),applied=Math.min(before,Math.max(0,amount));m.woundsRemaining=Math.max(0,before-applied);m.alive=m.woundsRemaining>0;damage+=applied;return applied;};
  for(const roll of sorted){
    let g=null,m=null;
    while(currentGroupIndex<orderIds.length){g=groups.find(x=>x.id===orderIds[currentGroupIndex]);m=pickModel(g);if(m)break;currentGroupIndex++;}
    if(currentGroupIndex>=orderIds.length)break;
    const p=m.profile||{},sv=Math.max(2,Math.min(7,Number(p.Sv)||7)),inv=Number(p.InSv)||99,saveModifier=Number(m.minusSave||0),armourNeed=Math.max(2,Math.min(7,sv-Number(weapon.AP)+saveModifier)),saveNeed=Math.min(armourNeed,inv),saveSucceeds=roll!==1&&roll>=saveNeed;
    let applied=0;
    if(!saveSucceeds){failed++;if(!variableDamage)applied=applyNormalDamage(m,normalDamage);}
    resolution.push({roll,groupId:g.id,groupLabel:g.label,modelId:m.id,saveSucceeds,damage:applied,saveNeed,precision:false});
    if(!m.alive)while(currentGroupIndex<orderIds.length){const gg=groups.find(x=>x.id===orderIds[currentGroupIndex]);if(gg&&pickModel(gg))break;currentGroupIndex++;}
  }
  const devastatingInstances=[];
  if(plan.devastating&&criticalWounds>0){
    for(let cw=0;cw<criticalWounds;cw++){
      let m=null,g=null;
      while(currentGroupIndex<orderIds.length){g=groups.find(x=>x.id===orderIds[currentGroupIndex]);m=pickModel(g);if(m)break;currentGroupIndex++;}
      if(!m)break;
      if(variableDamage)devastatingInstances.push({kind:'devastating',modelId:m.id,groupId:g.id,precision:false});
      else{
        // Each Devastating Wounds result is applied to one legal normal-allocation target.
        applyNormalDamage(m,normalDamage);
        if(!m.alive)while(currentGroupIndex<orderIds.length){const gg=groups.find(x=>x.id===orderIds[currentGroupIndex]);if(gg&&pickModel(gg))break;currentGroupIndex++;}
      }
    }
  }
  const modelStates=Array.from(states.values());
  return {failedSaves:failed,damage,normalDamage:Math.max(0,damage-(plan.devastating?Math.min(criticalWounds*normalDamage,damage):0)),mortalDamage:plan.devastating?Math.min(criticalWounds*normalDamage,damage):0,resolution,modelStates,variableDamage,damageInstances:variableDamage?resolution.filter(x=>!x.saveSucceeds).map(x=>({kind:'failedSave',modelId:x.modelId,groupId:x.groupId})):[],devastatingInstances:variableDamage&&plan.devastating?devastatingInstances:[]};
}
function tacticalPreRollResolutionPlan(ae,te,w,r,poolId=null,attackerSide='my',targetSide='opp'){
  const ctx=r?.context||{};
  const groups=attachedCombatWeaponGroups(attackerSide,ae,te).filter(g=>{if(String(g.weapon?.name||'')!==String(w.name))return false;return !poolId||tacticalPreRollPoolIdentity(g)===String(poolId);});
  const selectedPool=poolId?tacticalPreRollPoolManifest(ae,attackerSide).find(p=>p.key===String(poolId)):null;
  const targetModelIds=new Set((selectedPool?.allocations||[]).filter(a=>String(a.targetUid)===String(te.uid)).flatMap(a=>a.modelIds||[]).map(String));
  const eligibleGroups=groups.map(g=>selectedPool?{...g,modelIds:(g.modelIds||[]).map(String).filter(id=>targetModelIds.has(String(id))),count:(g.modelIds||[]).filter(id=>targetModelIds.has(String(id))).length}:g).filter(g=>{
    const ids=Array.isArray(g.modelIds)?g.modelIds:[];
    if(!ids.length)return true;
    return ids.some(id=>tacticalWeaponModelAvailable(g.entry?.uid,id,w,state.round,state.phase,attackerSide)&&!tacticalWeaponModelModeConflict(g.entry?.uid,id,w,g.entry,state.round,state.phase,attackerSide));
  });
  const modelIds=Array.from(new Set(eligibleGroups.flatMap(g=>Array.isArray(g.modelIds)?g.modelIds.map(String):[])));
  const models=modelIds.length;
  const targetSnap=combatSnapshot(targetSide,te);
  const targetModels=Math.max(1,Number(targetSnap?.targetModels)||Number(targetSnap?.survivingModels)||Number(combatTargetUnit(targetSide,te)?.models)||1);
  const c=engineContext(combatTargetUnit(attackerSide,ae)||get(ae.unitId),w,combatTargetUnit(targetSide,te)||get(te.unitId),{
    ...(state.mathRules||{}),
    halfRange:tacticalHalfRangeState(w,ctx.distanceInches).active===true,
    chargeMade:!!tacticalAdvisorActionState(combatRootEntry(attackerSide,ae)?.uid||ae.uid)?.chargeMade
  });
  const half=tacticalHalfRangeState(w,ctx.distanceInches);
  const basePer=engineExpectedDice(w.A);
  const rapid=(c.rapidFire&&half.active===true)?c.rapidFire:0;
  const blast=c.blast?c.blast*Math.floor(targetModels/5):0;
  const cleave=c.cleave?c.cleave*Math.floor(targetModels/5):0;
  const attacks=Math.max(0,models*(basePer+rapid)+blast+cleave);
  const attached=!!(targetSnap&&targetSnap.components?.length>1&&targetSnap.components.some(x=>x.role==='bodyguard')&&targetSnap.components.some(x=>x.role==='leader'||x.role==='support'));
  const targetSaveGroups=tacticalPreRollSaveGroups(te,null,targetSide);
  const profiles=new Set((targetSnap?.models||[]).filter(m=>m.alive!==false).map(m=>JSON.stringify({T:m.profile?.T,Sv:m.profile?.Sv,InSv:m.profile?.InSv,W:m.profile?.W,character:!!m.character})));
  const precisionTargetModelId=r?.precisionTargetModelId||null,precision=!!r?.precision,precisionTargetVisible=r?.precisionTargetVisible===true;
  const mixedSaveGroups=targetSaveGroups.length>1||precision||!!engineFnp(c)||!!c.devastating||(targetSnap?.models||[]).some(m=>engineFnp(m));
  return {
    modelIds,models,attacks:modelIds.length*(basePer+rapid)+blast+cleave,hitNeed:c.torrent?'Auto':c.hitNeed,
    hitCritThreshold:c.critHitThreshold,woundCritThreshold:c.critWoundThreshold||6,
    woundNeed:Math.min(6,Math.max(2,Number(c.woundNeed)||2)),
    saveNeed:r.save?.need>6?null:r.save?.need||null,
    saveInfo:r.save||null,
    torrent:!!c.torrent,lethal:!!c.lethal,sustained:engineSustained(c,{}),
    devastating:!!c.devastating,attached,
    homogeneousTarget:!mixedSaveGroups&&profiles.size<=1,
    mixedSaveGroups,targetSaveGroups,
    targetModels,
    variableDamage:/D[36]/i.test(String(w.D||''))||String(w.D||'').includes('+'),
    damageValue:engineExpectedDice(w.D)+(c.melta&&half.active===true?c.melta:0),
    meltaActive:c.melta&&half.active===true?c.melta:0,
    precision:!!c.precision,precisionTargetModelId,precisionTargetVisible,fnpNeed:engineFnp(c)||null
  };
}
function tacticalPreRollOpenResolutionForSides(attackerSide,targetSide,attackerUid,targetUid,weaponName,poolId=null){
  const as=attackerSide==='opp'?'opp':'my',ts=targetSide==='my'?'my':'opp',ae=entry(as,attackerUid),te=entry(ts,targetUid),stored=String(weaponName||'');
  if(!ae||!te||!stored)return false;
  const manifest=tacticalPreRollPoolManifest(ae,as);
  const selectedPool=(poolId?manifest.find(p=>p.key===String(poolId)):null)||manifest.find(p=>String(p.weapon?.name||'')===stored&&p.modelIds?.length);
  if(!selectedPool)return false;
  const chosenPoolId=String(selectedPool.key),t=ensureTacticalState();t.preRollPools=t.preRollPools||{};
  const existing=t.preRollPools[chosenPoolId]?.allocations,hasTarget=Array.isArray(existing)&&existing.some(x=>String(x.targetUid||'')===String(te.uid)&&Array.isArray(x.modelIds)&&x.modelIds.length);
  if(!hasTarget)t.preRollPools[chosenPoolId]={allocations:[{targetUid:String(te.uid),count:selectedPool.modelIds.length,modelIds:[...selectedPool.modelIds]}]};
  t.preRoll=t.preRoll||{};t.preRoll[tacticalPairKey(ae.uid,te.uid)]={weaponName:stored,poolId:chosenPoolId};
  const r=tacticalPreRollCheck(ae.uid,te.uid,stored,as,ts);if(!['ready','ready-with-warnings'].includes(r.status))return false;
  const w=attachedCombatWeaponGroups(as,ae,te).map(g=>g.weapon).find(x=>String(x.name)===stored);if(!w)return false;
  const signature=tacticalPreRollContextSignature(ae.uid,te.uid,stored,r,as,ts),key=tacticalPreRollSessionKey(ae.uid,te.uid,stored,chosenPoolId,as,ts);
  const plan=tacticalPreRollResolutionPlan(ae,te,w,r,chosenPoolId,as,ts),map=tacticalPreRollResolutionState(),old=map[key];
  const session=(old&&old.signature===signature)?old:{key,signature,poolId:chosenPoolId,stage:plan.torrent?'wounds':'hits',counts:{},specials:{},plan,startedAt:new Date().toISOString()};
  session.key=key;session.attackerEntryUid=ae.uid;session.targetEntryUid=te.uid;session.weaponName=stored;session.attackerSide=as;session.targetSide=ts;session.poolId=chosenPoolId;session.plan=plan;session.signature=signature;
  if(plan.torrent&&session.counts.hits==null)session.counts.hits=plan.attacks;
  map[key]=session;t.preRollResolutionOpen=key;save();render();return true;
}
function tacticalPreRollOpenResolution(){
  const ae=tacticalAdvisorAttackerEntry(),teUid=state.tactical?.selectedTargetUid,te=teUid?entry('opp',teUid):null;
  if(!ae||!te)return;
  const stored=tacticalPreRollWeaponState(ae.uid,te.uid).weaponName;if(!stored)return;
  if(!tacticalPreRollOpenResolutionForSides('my','opp',ae.uid,te.uid,stored))alert('Pre-Roll Check must be valid before entering dice results.');
}
function tacticalPreRollCloseResolution(){
  const t=ensureTacticalState();
  t.preRollResolutionOpen='';
  save();render();
}
/*
 * PHYSICAL DICE AUTHORITY INVARIANT
 * The engine never generates, predicts, or assumes a physical dice result.
 * Each resolution step requests the minimum information required by the rules:
 *   count -> subclassify -> individual result -> damage result when allocation depends on it.
 * Count-only steps must not require individual dice. Exact-result steps must not infer
 * critical/unmodified/individual outcomes from a count alone. Physical dice remain authoritative.
 */
function tacticalPreRollDiceAuthority(mode, value, max, label, min=1){
  const n=Math.floor(Number(value));
  if(mode==='count'||mode==='subclassify'){
    if(!Number.isInteger(n)||n<0||n>Number(max||0))throw new Error((label||'Dice count')+' must be between 0 and '+Number(max||0)+'.');
    return n;
  }
  if(mode==='individual'||mode==='damage'){
    if(!Number.isInteger(n)||n<Math.max(1,Number(min)||1)||n>Number(max||6))throw new Error((label||'Physical dice result')+' must be an actual result within the current range ('+Math.max(1,Number(min)||1)+'-'+Number(max||6)+').');
    return n;
  }
  throw new Error('Unknown physical-dice input mode.');
}
function tacticalPreRollSaveableWounds(s,includePrecisionResolved=true){
  const plan=s?.plan||{},hits=Math.max(0,Number(s?.counts?.hits)||0),wounds=Math.max(0,Number(s?.counts?.wounds)||0),critHits=Math.max(0,Number(s?.specials?.criticalHits)||0);
  const lethal=plan.lethal?Math.min(Math.max(0,Number(s?.specials?.lethalHits)||0),critHits):0;
  const critDev=plan.devastating?Math.min(Math.max(0,Number(s?.specials?.criticalWounds)||0),wounds):0;
  const resolved=includePrecisionResolved?Math.max(0,Number(s?.counts?.precisionResolved)||0):0;
  return Math.max(0,wounds+lethal-critDev-resolved);
}
function tacticalPreRollDiceRequirement(field,s){
  const p=s?.plan||{};
  if(field==='hits')return {mode:'count',max:p.attacks,reason:'Only the number of successful hits is needed.'};
  if(field==='lethalHits')return {mode:'subclassify',max:Number(s.specials?.criticalHits)||0,reason:'Choose which Critical Hits use Lethal Hits instead of making a Wound roll.'};
  if(field==='criticalHits')return {mode:'subclassify',max:Number(s.counts?.hits)||0,reason:'Critical-hit classification is required.'};
  if(field==='wounds')return {mode:'count',max:Math.max(0,(Number(s.counts?.hits)||0)-(p.lethal?Math.min(Number(s.specials?.criticalHits)||0,Number(s.counts?.hits)||0):0)+(p.sustained*(Number(s.specials?.criticalHits)||0))),reason:'Only successful wound count is needed.'};
  if(field==='criticalWounds')return {mode:'subclassify',max:Number(s.counts?.wounds)||0,reason:'Critical-wound classification is required.'};
  if(field==='precisionSave'||field==='precisionSaveReroll'||field==='precisionDamage'||field==='precisionDevastating'||field==='mixedVariableSave'||field==='mixedSaveReroll'||field==='mixedDamage')return {mode:(field==='mixedVariableSave'||field==='mixedSaveReroll'||field==='precisionSave'||field==='precisionSaveReroll')?'individual':'damage',max:6,reason:'The individual physical result changes the next allocation/resolution state.'};
  if(field==='mixedFnp')return {mode:'count',max:Math.max(0,Number(s.mixedVariableState?.pendingDamage)||0),reason:'Feel No Pain applies to each wound that would be lost; only the number ignored is needed.'};
  return null;
}
function tacticalPreRollDamageRange(v){const raw=String(v??'1').trim().toUpperCase().replace(/\s+/g,'');let min=0,max=0,found=false,m;const re=/([+-]?)(\d*)D([36])/g;while((m=re.exec(raw))){found=true;const n=Number(m[2]||1),faces=Number(m[3]),sign=m[1]==='-'?-1:1;if(sign>0){min+=n;max+=n*faces;}else{min-=n*faces;max-=n;}}const rest=raw.replace(/([+-]?(?:\d*)D[36])/g,'');if(rest&&/^[-+]?\d+$/.test(rest)){const c=Number(rest);min+=c;max+=c;}if(!found){const n=Number(raw);return {min:Number.isFinite(n)?n:n||1,max:Number.isFinite(n)?n:n||1};}return {min:Math.max(1,min),max:Math.max(1,max)};}
function tacticalPreRollDamageMax(v){return tacticalPreRollDamageRange(v).max;}
function tacticalPreRollPrecisionPushHistory(s){
  s.precisionHistory=Array.isArray(s.precisionHistory)?s.precisionHistory:[];
  s.precisionHistory.push({
    stage:s.stage,
    counts:{...s.counts},
    precisionTargetState:s.precisionTargetState?{...s.precisionTargetState}:null,
    precisionCurrent:s.precisionCurrent?{...s.precisionCurrent}:null,
    precisionWeapon:s.precisionWeapon?{...s.precisionWeapon}:null,
    precisionPendingDamage:s.precisionPendingDamage??null,
    precisionPendingFnp:s.precisionPendingFnp??null,
    precisionPendingKind:s.precisionPendingKind??null,
    precisionPendingCriticalIndex:s.precisionPendingCriticalIndex??null,
    precisionPendingTargetModelId:s.precisionPendingTargetModelId??null,
    saveOrder:Array.isArray(s.saveOrder)?s.saveOrder.slice():null,
    mixedResolution:s.mixedResolution?{...s.mixedResolution,
      modelStates:(s.mixedResolution.modelStates||[]).map(m=>({...m})),
      resolution:(s.mixedResolution.resolution||[]).map(r=>({...r})),
      damageRolls:[...(s.mixedResolution.damageRolls||[])],
      damageInstances:[...(s.mixedResolution.damageInstances||[])],
      devastatingInstances:[...(s.mixedResolution.devastatingInstances||[])]
    }:null
  });
}
function tacticalPreRollPrecisionBack(s){
  const h=s.precisionHistory;
  if(!Array.isArray(h)||!h.length)return false;
  const snap=h.pop();
  s.stage=snap.stage;s.counts={...snap.counts};
  if(snap.precisionTargetState)s.precisionTargetState={...snap.precisionTargetState};else delete s.precisionTargetState;
  if(snap.precisionCurrent)s.precisionCurrent={...snap.precisionCurrent};else delete s.precisionCurrent;
  if(snap.precisionWeapon)s.precisionWeapon={...snap.precisionWeapon};else delete s.precisionWeapon;
  if(snap.precisionPendingDamage!=null)s.precisionPendingDamage=snap.precisionPendingDamage;else delete s.precisionPendingDamage;
  if(snap.precisionPendingFnp!=null)s.precisionPendingFnp=snap.precisionPendingFnp;else delete s.precisionPendingFnp;
  if(snap.precisionPendingKind!=null)s.precisionPendingKind=snap.precisionPendingKind;else delete s.precisionPendingKind;
  if(snap.precisionPendingCriticalIndex!=null)s.precisionPendingCriticalIndex=snap.precisionPendingCriticalIndex;else delete s.precisionPendingCriticalIndex;
  if(snap.precisionPendingTargetModelId!=null)s.precisionPendingTargetModelId=snap.precisionPendingTargetModelId;else delete s.precisionPendingTargetModelId;
  if(Array.isArray(snap.saveOrder))s.saveOrder=snap.saveOrder.slice();else delete s.saveOrder;
  if(snap.mixedResolution){
    s.mixedResolution={...snap.mixedResolution,
      modelStates:(snap.mixedResolution.modelStates||[]).map(m=>({...m})),
      resolution:(snap.mixedResolution.resolution||[]).map(r=>({...r})),
      damageRolls:[...(snap.mixedResolution.damageRolls||[])],
      damageInstances:[...(snap.mixedResolution.damageInstances||[])],
      devastatingInstances:[...(snap.mixedResolution.devastatingInstances||[])]
    };
  }else delete s.mixedResolution;
  return true;
}
function tacticalPreRollPrecisionTarget(s){const te=entry(s.targetSide==='my'?'my':'opp',s.targetEntryUid),snap=combatSnapshot(s.targetSide==='my'?'my':'opp',te),id=String(s.plan?.precisionTargetModelId||'');const model=(snap?.models||[]).find(m=>String(m.id)===id);if(!model||model.alive===false)return null;const groups=tacticalPreRollSaveGroups(te,null,s.targetSide==='my'?'my':'opp'),group=groups.find(g=>(g.modelIds||[]).some(x=>String(x)===id));return {model,group};}
function tacticalPreRollPrecisionSequential(current){const s=current.state||current.session,plan=s.plan;if(!plan.precision||!plan.variableDamage)return false;const target=tacticalPreRollPrecisionTarget(s);if(!target){s.precisionAllocationReleased=true;return false;}return true}
function tacticalPreRollPrecisionStep(s,saveRoll){const plan=s.plan||{},target=tacticalPreRollPrecisionTarget(s),prior=s.precisionTargetState;if(!target&&!prior)throw new Error('Precision target model is no longer available.');if(prior&&!prior.alive)return false;const m=target?.model||prior,g=target?.group||null,w=s.precisionWeapon||{AP:0,D:'1'},p=m.profile||{},saveModifier=Number(m.minusSave||0),sv=Math.max(2,Math.min(7,Number(p.Sv)||7)),armourNeed=Math.max(2,Math.min(7,sv-(Number(w.AP)||0)+saveModifier)),need=Math.min(armourNeed,Number(p.InSv)||99);if(saveRoll===1&&m.rerollSave1){s.precisionTargetState={modelId:String(m.id),groupId:g?.id||prior?.groupId||null,woundsRemaining:Math.max(0,Number(prior?.woundsRemaining??m.woundsRemaining)||0),alive:prior?prior.alive!==false:m.alive!==false,sourceEntryUid:m.sourceEntryUid||prior?.sourceEntryUid,sourceUnitId:m.sourceUnitId||prior?.sourceUnitId,maxWounds:Number(prior?.maxWounds??m.maxWounds??p.W??1)||1,character:!!(m.character??prior?.character)};s.precisionCurrent={modelId:String(m.id),groupId:g?.id||prior?.groupId||null,saveNeed:need,saveSucceeds:false,character:!!(m.character??prior?.character),rerollPending:true};s.precisionWeapon=w;s.stage='precisionSaveReroll';return true;}const ok=saveRoll!==1&&saveRoll>=need;s.precisionTargetState={modelId:String(m.id),groupId:g?.id||prior?.groupId||null,woundsRemaining:Math.max(0,Number(prior?.woundsRemaining??m.woundsRemaining)||0),alive:prior?prior.alive!==false:m.alive!==false,sourceEntryUid:m.sourceEntryUid||prior?.sourceEntryUid,sourceUnitId:m.sourceUnitId||prior?.sourceUnitId,maxWounds:Number(prior?.maxWounds??m.maxWounds??p.W??1)||1,character:!!(m.character??prior?.character)};s.precisionCurrent={modelId:String(m.id),groupId:g?.id||prior?.groupId||null,saveNeed:need,saveSucceeds:ok,character:!!(m.character??prior?.character)};s.precisionWeapon=w;s.stage=ok?'precisionSave':(plan.variableDamage?'precisionDamage':'precisionApplyFixed');return true}
// Legacy bulk variable-Damage application path intentionally removed. Variable Damage is resolved inline, one failed save at a time, so no deferred bulk application can double-resolve damage.
function tacticalPreRollInitMixedVariable(s,rolls){
  const te=entry(s.targetSide==='my'?'my':'opp',s.targetEntryUid),groups=tacticalPreRollSaveGroups(te,s.precisionTargetState?[s.precisionTargetState]:null,s.targetSide==='my'?'my':'opp');
  const orderIds=(s.saveOrder||groups.map(g=>g.id)).slice();
  if(!tacticalPreRollLegalSaveOrder(groups,orderIds))throw new Error('The allocation order is not legal under the 11th Edition save-roll rules.');
  const sorted=rolls.slice().map(Number).filter(Number.isFinite).map(v=>Math.floor(v));
  if(sorted.some(v=>v<1||v>6))throw new Error('Save results must be D6 values from 1 to 6.');
  const expected=tacticalPreRollSaveableWounds(s);
  if(sorted.length!==expected)throw new Error('Enter exactly '+expected+' save results.');
  const snap=combatSnapshot(s.targetSide==='my'?'my':'opp',te);
  const states=(snap?.models||[]).filter(m=>m.alive!==false).map(m=>({
    id:m.id,sourceEntryUid:m.sourceEntryUid,sourceUnitId:m.sourceUnitId,
    groupId:(groups.find(g=>(g.modelIds||[]).some(id=>String(id)===String(m.id)))||{}).id||null,
    groupCharacter:!!m.character,character:!!m.character,
    profile:m.profile||{},maxWounds:Number(m.maxWounds||m.profile?.W||1)||1,
    alive:m.alive!==false,woundsRemaining:Math.max(0,Number(m.woundsRemaining)||0)
  }));

  if(s.precisionTargetState){
    const ps=s.precisionTargetState,pm=states.find(x=>String(x.id)===String(ps.modelId));
    if(pm){pm.alive=ps.alive!==false;pm.woundsRemaining=Math.max(0,Number(ps.woundsRemaining)||0);}
  }
  s.mixedResolution={
    failedSaves:Number(s.counts.failedSaves)||0,
    damage:Number(s.counts.damage)||0,
    normalDamage:Number(s.counts.damage)||0,
    mortalDamage:0,resolution:[],modelStates:states,
    variableDamage:!!s.plan.variableDamage,damageInstances:[],devastatingInstances:[],damageRolls:[],fnpResults:[]
  };
  s.mixedVariableState={rolls:sorted,index:0,groupIndex:0,phase:'save',devastatingIndex:0,fixedDamage:!s.plan.variableDamage};
  s.counts.damageResolved=0;
  s.stage='mixedVariableSave';
}
function tacticalPreRollMixedVariablePushHistory(s){
  const vs=s.mixedVariableState,mr=s.mixedResolution;
  if(!vs||!mr)return;
  vs.history=Array.isArray(vs.history)?vs.history:[];
  const snapshot={stage:s.stage,counts:{...s.counts},mixedVariableState:{...vs,history:undefined},mixedResolution:{...mr,modelStates:(mr.modelStates||[]).map(m=>({...m})),resolution:(mr.resolution||[]).map(r=>({...r})),damageRolls:[...(mr.damageRolls||[])],fnpResults:(mr.fnpResults||[]).map(x=>({...x})),damageInstances:[...(mr.damageInstances||[])],devastatingInstances:[...(mr.devastatingInstances||[])]}};
  delete snapshot.mixedVariableState.history;
  vs.history.push(snapshot);
}
function tacticalPreRollMixedVariableBack(s){
  const vs=s.mixedVariableState;
  if(!vs||!Array.isArray(vs.history)||!vs.history.length)return false;
  const snap=vs.history.pop();
  s.stage=snap.stage;s.counts={...snap.counts};s.mixedVariableState={...snap.mixedVariableState,history:vs.history};
  s.mixedResolution={...snap.mixedResolution,modelStates:(snap.mixedResolution.modelStates||[]).map(m=>({...m})),resolution:(snap.mixedResolution.resolution||[]).map(r=>({...r})),damageRolls:[...(snap.mixedResolution.damageRolls||[])],fnpResults:(snap.mixedResolution.fnpResults||[]).map(x=>({...x})),damageInstances:[...(snap.mixedResolution.damageInstances||[])],devastatingInstances:[...(snap.mixedResolution.devastatingInstances||[])]};
  return true;
}
function tacticalPreRollPickMixedVariableTarget(s){
  const mr=s.mixedResolution,vs=s.mixedVariableState;
  if(!mr||!vs)throw new Error('Mixed variable resolution state is missing.');
  const states=new Map((mr.modelStates||[]).map(m=>[String(m.id),m]));
  const groups=tacticalPreRollSaveGroups(entry(s.targetSide==='my'?'my':'opp',s.targetEntryUid),states,s.targetSide==='my'?'my':'opp');
  const pickInGroup=g=>{
    const models=(g.modelIds||[]).map(id=>states.get(String(id))).filter(Boolean).filter(m=>m.alive!==false);
    return models.find(m=>Number(m.woundsRemaining||0)<Number(m.maxWounds||m.profile?.W||1))||models[0]||null;
  };
  while(vs.groupIndex<(s.saveOrder||groups.map(g=>g.id)).length){
    const gid=(s.saveOrder||groups.map(g=>g.id))[vs.groupIndex],g=groups.find(x=>x.id===gid);
    if(g&&pickInGroup(g))return {g,m:pickInGroup(g),states,groups};
    vs.groupIndex++;
  }
  return null;
}
function tacticalPreRollAdvanceMixedVariableSave(s,roll){
  const damageRange=tacticalPreRollDamageRange(s.plan.weaponDamage||'1'),maxDamage=damageRange.max,vs=s.mixedVariableState,mr=s.mixedResolution;
  tacticalPreRollMixedVariablePushHistory(s);
  if(!vs||vs.phase!=='save')throw new Error('No variable-Damage save is awaiting resolution.');
  const picked=tacticalPreRollPickMixedVariableTarget(s);
  if(!picked)throw new Error('No legal target remains for the next saving throw.');
  const {g,m}=picked,p=m.profile||{},weapon=s.mixedVariableWeapon||{AP:0,D:'1'},ap=Number(weapon.AP)||0;
  const sv=Math.max(2,Math.min(7,Number(p.Sv)||7)),saveModifier=Number(m.minusSave||0),inv=(m.invuln4?4:m.invuln5?5:m.invuln6?6:(Number(p.InSv)||99)),armourNeed=Math.max(2,Math.min(7,sv-ap+saveModifier)),saveNeed=Math.min(armourNeed,inv);
  const n=Math.floor(Number(roll));
  if(!Number.isInteger(n)||n<1||n>6)throw new Error('Enter one D6 save result.');
  if(n===1&&m.rerollSave1){
    mr.resolution.push({roll:1,groupId:g.id,groupLabel:g.label,modelId:m.id,saveSucceeds:false,damage:0,saveNeed,precision:false,rerollPending:true});
    vs.currentModelId=String(m.id);vs.currentGroupId=g.id;vs.currentSaveNeed=saveNeed;vs.currentSaveSucceeds=false;vs.phase='saveReroll';s.stage='mixedSaveReroll';return;
  }
  const saveSucceeds=n!==1&&n>=saveNeed;
  mr.resolution.push({roll:n,groupId:g.id,groupLabel:g.label,modelId:m.id,saveSucceeds,damage:0,saveNeed,precision:false});
  vs.currentModelId=String(m.id);vs.currentGroupId=g.id;vs.currentSaveNeed=saveNeed;vs.currentSaveSucceeds=saveSucceeds;
  if(saveSucceeds){
    vs.currentModelId=null;vs.currentGroupId=null;vs.currentSaveNeed=null;vs.currentSaveSucceeds=null;
    vs.index++;
    if(vs.index>=vs.rolls.length){
      if(s.plan.devastating&&Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0)>0){
        vs.phase='devastating';vs.devastatingIndex=0;s.stage='mixedDamage';
      }else s.stage='review';
    }else s.stage='mixedVariableSave';
  }else{
    s.counts.failedSaves=(Number(s.counts.failedSaves)||0)+1;
    s.counts.damage=Number(s.counts.damage)||0;
    const fixedDamage=Math.max(0,Number(s.plan.damageValue)||1);
    if(vs.fixedDamage||!s.plan.variableDamage){
      const pending=Math.min(Math.max(0,Number(m.woundsRemaining)||0),fixedDamage);
      if(engineFnp(m)){vs.phase='fnp';vs.pendingDamage=pending;vs.pendingFnp=engineFnp(m);vs.kind='normal';s.stage='mixedFnp';}
      else{
        const before=Math.max(0,Number(m.woundsRemaining)||0),applied=Math.min(before,fixedDamage);m.woundsRemaining=Math.max(0,before-applied);m.alive=m.woundsRemaining>0;
        mr.damage=(Number(mr.damage)||0)+applied;mr.normalDamage=(Number(mr.normalDamage)||0)+applied;mr.damageRolls.push(fixedDamage);
        vs.currentModelId=null;vs.currentGroupId=null;vs.currentSaveNeed=null;vs.currentSaveSucceeds=null;vs.index++;
        if(vs.index<vs.rolls.length){vs.phase='save';s.stage='mixedVariableSave';}
        else if(s.plan.devastating&&Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0)>0){vs.phase='devastating';vs.devastatingIndex=0;s.stage='mixedDamage';}
        else s.stage='review';
      }
    }else{s.stage='mixedDamage';vs.phase='damage';vs.damageMax=maxDamage;}
  }
}
function tacticalPreRollResolveMixedSaveReroll(s,roll){
  const vs=s.mixedVariableState,mr=s.mixedResolution;tacticalPreRollMixedVariablePushHistory(s);
  if(!vs||vs.phase!=='saveReroll')throw new Error('No save re-roll is awaiting resolution.');
  const m=(mr.modelStates||[]).find(x=>String(x.id)===String(vs.currentModelId)),n=Math.floor(Number(roll));
  if(!m||!Number.isInteger(n)||n<1||n>6)throw new Error('Enter the actual physical D6 re-roll result.');
  const groups=tacticalPreRollSaveGroups(entry(s.targetSide==='my'?'my':'opp',s.targetEntryUid),mr.modelStates,s.targetSide==='my'?'my':'opp'),g=groups.find(x=>x.id===vs.currentGroupId),p=m.profile||{},weapon=s.mixedVariableWeapon||{AP:0,D:'1'},ap=Number(weapon.AP)||0;
  const sv=Math.max(2,Math.min(7,Number(p.Sv)||7)),saveModifier=Number(m.minusSave||0),inv=(m.invuln4?4:m.invuln5?5:m.invuln6?6:(Number(p.InSv)||99)),saveNeed=Math.min(Math.max(2,Math.min(7,sv-ap+saveModifier)),inv),ok=n!==1&&n>=saveNeed,last=mr.resolution[mr.resolution.length-1];
  if(!g)throw new Error('The save allocation group is no longer available.');
  if(last){last.rerolled=true;last.reroll=n;last.roll=n;last.saveSucceeds=ok;last.rerollPending=false;}
  vs.currentSaveSucceeds=ok;vs.phase='save';
  if(ok){vs.currentModelId=null;vs.currentGroupId=null;vs.currentSaveNeed=null;vs.currentSaveSucceeds=null;vs.index++;if(vs.index<vs.rolls.length)s.stage='mixedVariableSave';else if(s.plan.devastating&&Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0)>0){vs.phase='devastating';vs.devastatingIndex=0;s.stage='mixedDamage';}else s.stage='review';}
  else{
    s.counts.failedSaves=(Number(s.counts.failedSaves)||0)+1;const fixedDamage=Math.max(0,Number(s.plan.damageValue)||1);
    if(vs.fixedDamage||!s.plan.variableDamage){const pending=Math.min(Math.max(0,Number(m.woundsRemaining)||0),fixedDamage);if(engineFnp(m)){vs.phase='fnp';vs.pendingDamage=pending;vs.pendingFnp=engineFnp(m);vs.kind='normal';s.stage='mixedFnp';}else{const before=Math.max(0,Number(m.woundsRemaining)||0),applied=Math.min(before,fixedDamage);m.woundsRemaining=Math.max(0,before-applied);m.alive=m.woundsRemaining>0;mr.damage=(Number(mr.damage)||0)+applied;mr.normalDamage=(Number(mr.normalDamage)||0)+applied;mr.damageRolls.push(fixedDamage);vs.currentModelId=null;vs.currentGroupId=null;vs.currentSaveNeed=null;vs.currentSaveSucceeds=null;vs.index++;if(vs.index<vs.rolls.length){vs.phase='save';s.stage='mixedVariableSave';}else if(s.plan.devastating&&Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0)>0){vs.phase='devastating';vs.devastatingIndex=0;s.stage='mixedDamage';}else s.stage='review';}}else{s.stage='mixedDamage';vs.phase='damage';vs.damageMax=tacticalPreRollDamageMax(s.plan.weaponDamage||'1');}
  }
}
function tacticalPreRollResolveMixedFnp(s,ignored){
  const vs=s.mixedVariableState,mr=s.mixedResolution;
  tacticalPreRollMixedVariablePushHistory(s);
  if(!vs||vs.phase!=='fnp')throw new Error('No Feel No Pain result is awaiting resolution.');
  const m=(mr.modelStates||[]).find(x=>String(x.id)===String(vs.currentModelId));
  const pending=Math.max(0,Number(vs.pendingDamage)||0),n=Math.floor(Number(ignored));
  if(!m||m.alive===false)throw new Error('The Feel No Pain target is no longer alive.');
  if(!Number.isInteger(n)||n<0||n>pending)throw new Error('Enter the actual number of wounds ignored by Feel No Pain.');
  const before=Math.max(0,Number(m.woundsRemaining)||0),applied=Math.min(before,Math.max(0,pending-n));
  m.woundsRemaining=Math.max(0,before-applied);m.alive=m.woundsRemaining>0;
  mr.damage=(Number(mr.damage)||0)+applied;
  if(vs.kind==='devastating')mr.mortalDamage=(Number(mr.mortalDamage)||0)+applied;else mr.normalDamage=(Number(mr.normalDamage)||0)+applied;
  mr.damageRolls.push(pending);mr.fnpResults=Array.isArray(mr.fnpResults)?mr.fnpResults:[];mr.fnpResults.push({damage:pending,ignored:n,applied});
  s.counts.damage=mr.damage;s.counts.damageResolved=(Number(s.counts.damageResolved)||0)+1;
  vs.pendingDamage=0;vs.pendingFnp=null;vs.currentModelId=null;vs.currentGroupId=null;vs.currentSaveNeed=null;vs.currentSaveSucceeds=null;
  if(vs.kind==='devastating'){vs.devastatingIndex++;s.stage=vs.devastatingIndex<Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0)?'mixedDamage':'review';vs.phase=vs.devastatingIndex<Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0)?'devastating':'done';}
  else {vs.index++;vs.phase=vs.index<vs.rolls.length?'save':'done';s.stage=vs.index<vs.rolls.length?'mixedVariableSave':(s.plan.devastating&&Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0)>0?'mixedDamage':'review');if(vs.phase==='done'&&s.stage==='mixedDamage'){vs.phase='devastating';vs.devastatingIndex=0;}}
}
function tacticalPreRollResolveMixedVariableDamage(s,roll){
  const vs=s.mixedVariableState,mr=s.mixedResolution;
  tacticalPreRollMixedVariablePushHistory(s);
  if(!vs||vs.phase!=='damage')throw new Error('No failed save is awaiting Damage resolution.');
  const m=(mr.modelStates||[]).find(x=>String(x.id)===String(vs.currentModelId));
  if(!m||m.alive===false)throw new Error('The current allocation target is no longer alive.');
  const damageRange=tacticalPreRollDamageRange(s.plan.weaponDamage||'1'),n=Math.floor(Number(roll)),max=damageRange.max;
  if(!Number.isInteger(n)||n<damageRange.min||n>max)throw new Error('Enter the actual physical Damage result between '+damageRange.min+' and '+max+'.');
  const before=Math.max(0,Number(m.woundsRemaining)||0),applied=Math.min(before,n);
  if(tacticalPreRollFnp(m,s)){vs.phase='fnp';vs.pendingDamage=applied;vs.pendingFnp=tacticalPreRollFnp(m,s);vs.kind='normal';s.stage='mixedFnp';return;}
m.woundsRemaining=Math.max(0,before-n);m.alive=m.woundsRemaining>0;
  mr.damage=(Number(mr.damage)||0)+applied;mr.normalDamage=(Number(mr.normalDamage)||0)+applied;
  mr.damageRolls.push(n);s.counts.damage=mr.damage;s.counts.damageResolved=(Number(s.counts.damageResolved)||0)+1;
  vs.currentModelId=null;vs.currentGroupId=null;vs.currentSaveNeed=null;vs.currentSaveSucceeds=null;
  vs.index++;
  if(vs.index<vs.rolls.length){
    vs.phase='save';s.stage='mixedVariableSave';
  }else if(s.plan.devastating&&Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0)>0){
    vs.phase='devastating';vs.devastatingIndex=0;s.stage='mixedDamage';
  }else s.stage='review';
}
function tacticalPreRollResolveMixedVariableDevastating(s,roll){
  const vs=s.mixedVariableState,mr=s.mixedResolution;
  tacticalPreRollMixedVariablePushHistory(s);
  if(!vs||vs.phase!=='devastating')throw new Error('No Devastating Wounds result is awaiting resolution.');
  const total=Math.min(Number(s.specials.criticalWounds)||0,Number(s.counts.wounds)||0);
  if(vs.devastatingIndex>=total){s.stage='review';return;}
  const states=new Map((mr.modelStates||[]).map(m=>[String(m.id),m]));
  const groups=tacticalPreRollSaveGroups(entry(s.targetSide==='my'?'my':'opp',s.targetEntryUid),states,s.targetSide==='my'?'my':'opp');
  const orderIds=s.saveOrder||groups.map(g=>g.id);
  const pickInGroup=g=>{
    const models=(g?.modelIds||[]).map(id=>states.get(String(id))).filter(Boolean).filter(m=>m.alive!==false);
    return models.find(m=>Number(m.woundsRemaining||0)<Number(m.maxWounds||m.profile?.W||1))||models[0]||null;
  };
  let g=null,m=null;
  const precisionId=String(s.precisionTargetState?.modelId||'');
  const precisionGroup=groups.find(x=>(x.modelIds||[]).some(id=>String(id)===precisionId));
  if(precisionGroup){
    m=pickInGroup(precisionGroup);
    if(m)g=precisionGroup;
  }
  if(!m){
    while(vs.groupIndex<orderIds.length){
      g=groups.find(x=>x.id===orderIds[vs.groupIndex]);
      m=pickInGroup(g);
      if(m)break;
      vs.groupIndex++;
    }
  }
  if(!m)throw new Error('No legal target remains for Devastating Wounds.');
  const damageRange=tacticalPreRollDamageRange(s.plan.weaponDamage||'1'),n=Math.floor(Number(roll)),max=damageRange.max;
  if(!Number.isInteger(n)||n<damageRange.min||n>max)throw new Error('Enter the actual physical Damage result between '+damageRange.min+' and '+max+'.');
  const before=Math.max(0,Number(m.woundsRemaining)||0),applied=Math.min(before,n);
  if(tacticalPreRollFnp(m,s)){vs.phase='fnp';vs.pendingDamage=applied;vs.pendingFnp=tacticalPreRollFnp(m,s);vs.kind='devastating';s.stage='mixedFnp';return;}
m.woundsRemaining=Math.max(0,before-n);m.alive=m.woundsRemaining>0;
  mr.damage=(Number(mr.damage)||0)+applied;mr.mortalDamage=(Number(mr.mortalDamage)||0)+applied;mr.damageRolls.push(n);
  vs.currentModelId=null;vs.currentGroupId=null;vs.currentSaveNeed=null;vs.currentSaveSucceeds=null;
  vs.devastatingIndex++;
  s.counts.damage=mr.damage;s.counts.damageResolved=(Number(s.counts.damageResolved)||0)+1;
  s.stage=vs.devastatingIndex<total?'mixedDamage':'review';
}
function tacticalPreRollResolutionSet(field,value){
  const current=tacticalPreRollResolutionCurrent();
  if(!current)return;
  const t=ensureTacticalState(),map=tacticalPreRollResolutionState(),s=map[current.key];
  if(!s||s.signature!==current.signature){t.preRollResolutionOpen='';save();render();return;}
  const rawNumber=Number(value);
  const n=Number.isFinite(rawNumber)?Math.floor(rawNumber):NaN;
  const plan=s.plan;
  const diceReq=tacticalPreRollDiceRequirement(field,s);
  if(field==='hits'){
    if(diceReq?.mode==='count')tacticalPreRollDiceAuthority('count',n,diceReq.max,'Successful hit count');
    if(n>plan.attacks){alert('Successful hit count cannot exceed the number of attacks.');return;}
    s.counts.hits=n;
    if(plan.hitCritThreshold!=null&&(!plan.torrent)){s.stage=plan.lethal||plan.sustained?'hitSpecial':'wounds';}
    else s.stage='wounds';
  }else if(field==='criticalHits'){
    const max=Number(s.counts.hits)||0;
    if(diceReq?.mode==='subclassify')tacticalPreRollDiceAuthority('subclassify',n,diceReq.max,'Critical-hit count');
    if(n>max){alert('Critical hits cannot exceed total successful hits.');return;}
    s.specials.criticalHits=n;if(plan.lethal&&plan.devastating){s.stage='lethalChoice';}else{s.specials.lethalHits=n;s.stage='wounds';}
  }else if(field==='lethalHits'){
    const max=Number(s.specials.criticalHits)||0;
    if(diceReq?.mode==='subclassify')tacticalPreRollDiceAuthority('subclassify',n,diceReq.max,'Lethal Hits selection');
    if(n>max){alert('Lethal Hits selections cannot exceed Critical Hits.');return;}
    s.specials.lethalHits=n;s.stage='wounds';
  }else if(field==='wounds'){
    const critHits=Number(s.specials.criticalHits)||0,hits=Number(s.counts.hits)||0;
    const lethalAuto=plan.lethal?Math.min(Number(s.specials.lethalHits)||0,critHits):0;
    const woundDice=Math.max(0,(hits-lethalAuto)+(plan.sustained*critHits));
    if(n>woundDice){alert('Successful wound count cannot exceed the wound rolls required by the preceding result.');return;}
    s.counts.wounds=n;
    if(plan.devastating)s.stage='woundSpecial';
    else if(plan.mixedSaveGroups)s.stage='saveOrder';
    else s.stage='saves';
  }else if(field==='criticalWounds'){
    const max=Number(s.counts.wounds)||0;
    if(diceReq?.mode==='subclassify')tacticalPreRollDiceAuthority('subclassify',n,diceReq.max,'Critical-wound count');
    if(n>max){alert('Critical wounds cannot exceed total successful wounds.');return;}
    s.specials.criticalWounds=n;
    const saveableAfterCritical=Math.max(0,tacticalPreRollSaveableWounds(s,false));
    if(plan.mixedSaveGroups){
      if(plan.precision)s.stage='precisionSave';
      else if(saveableAfterCritical>0)s.stage='saveOrder';
      else if(plan.devastating&&Number(s.specials.criticalWounds||0)>0){tacticalPreRollInitMixedVariable(s,[]);s.mixedVariableState.phase='devastating';s.stage='mixedDamage';}
      else s.stage='review';
    }else s.stage=saveableAfterCritical>0?'saves':'review';
  }else if(field==='precisionSave'){
    tacticalPreRollPrecisionPushHistory(s);
    const total=tacticalPreRollSaveableWounds(s,false);
    if((Number(s.counts.precisionResolved)||0)>=total){s.stage=plan.devastating&&Number(s.specials.criticalWounds||0)>0?'precisionDevastating':'review';return;}
    const roll=tacticalPreRollDiceAuthority('individual',value,6,'Save result');
    try{const weapon=attachedCombatWeaponGroups(current.attackerSide,entry(current.attackerSide,current.attackerEntryUid),entry(current.targetSide,current.targetEntryUid)).map(g=>g.weapon).find(x=>String(x.name)===String(current.weaponName));s.precisionWeapon=weapon||{AP:0,D:'1'};if(!tacticalPreRollPrecisionStep(s,roll))s.stage='saveOrder';else if(s.precisionCurrent.saveSucceeds){const total=tacticalPreRollSaveableWounds(s,false);s.counts.precisionResolved=(Number(s.counts.precisionResolved)||0)+1;s.stage=(Number(s.counts.precisionResolved)||0)<total?'precisionSave':(plan.devastating&&Number(s.specials.criticalWounds||0)>0?'precisionDevastating':'review');}else if(s.stage==='precisionApplyFixed'){const st=s.precisionTargetState,before=Math.max(0,Number(st.woundsRemaining)||0),pending=Math.min(before,Math.max(0,Number(plan.damageValue)||0));if(tacticalPreRollFnp(st,s)){s.precisionPendingDamage=pending;s.precisionPendingFnp=tacticalPreRollFnp(st,s);s.stage='precisionFnp';return;}const applied=pending;st.woundsRemaining=Math.max(0,before-applied);st.alive=st.woundsRemaining>0;s.counts.failedSaves=(Number(s.counts.failedSaves)||0)+1;s.counts.damage=(Number(s.counts.damage)||0)+applied;s.counts.precisionResolved=(Number(s.counts.precisionResolved)||0)+1;const total=tacticalPreRollSaveableWounds(s,false);s.stage=(Number(s.counts.precisionResolved)||0)<total?(st.alive?'precisionSave':'saveOrder'):(plan.devastating&&Number(s.specials.criticalWounds||0)>0?'precisionDevastating':'review');}}catch(e){alert(e.message||String(e));return;}
  }else if(field==='precisionSaveReroll'){
    tacticalPreRollPrecisionPushHistory(s);
    const roll=tacticalPreRollDiceAuthority('individual',value,6,'Save re-roll result');
    const weapon=s.precisionWeapon||{AP:0,D:'1'},st=s.precisionTargetState,p=st?.profile||tacticalPreRollPrecisionTarget(s)?.model?.profile||{},sv=Math.max(2,Math.min(7,Number(p.Sv)||7)),armourNeed=Math.max(2,Math.min(7,sv-(Number(weapon.AP)||0)+Number(st?.minusSave||0))),need=Number(s.precisionCurrent?.saveNeed)||Math.min(armourNeed,Number(p.InSv)||99),ok=roll!==1&&roll>=need;
    s.precisionCurrent={...(s.precisionCurrent||{}),saveSucceeds:ok,rerollPending:false,rerolled:true,reroll:roll};
    if(ok){const total=tacticalPreRollSaveableWounds(s,false);s.counts.precisionResolved=(Number(s.counts.precisionResolved)||0)+1;s.stage=(Number(s.counts.precisionResolved)||0)<total?'precisionSave':(plan.devastating&&Number(s.specials.criticalWounds||0)>0?'precisionDevastating':'review');}
    else if(plan.variableDamage)s.stage='precisionDamage';
    else {const st2=s.precisionTargetState,before=Math.max(0,Number(st2?.woundsRemaining)||0),pending=Math.min(before,Math.max(0,Number(plan.damageValue)||0));if(tacticalPreRollFnp(st2,s)){s.precisionPendingDamage=pending;s.precisionPendingFnp=tacticalPreRollFnp(st2,s);s.stage='precisionFnp';}else{st2.woundsRemaining=Math.max(0,before-pending);st2.alive=st2.woundsRemaining>0;s.counts.failedSaves=(Number(s.counts.failedSaves)||0)+1;s.counts.damage=(Number(s.counts.damage)||0)+pending;s.counts.precisionResolved=(Number(s.counts.precisionResolved)||0)+1;const total=tacticalPreRollSaveableWounds(s,false);s.stage=(Number(s.counts.precisionResolved)||0)<total?(st2.alive?'precisionSave':'saveOrder'):(plan.devastating&&Number(s.specials.criticalWounds||0)>0?'precisionDevastating':'review');}}
  }else if(field==='precisionDamage'){
    tacticalPreRollPrecisionPushHistory(s);
    const damageRange=tacticalPreRollDamageRange(s.precisionWeapon?.D||'1');const max=damageRange.max;const roll=tacticalPreRollDiceAuthority('damage',value,max,'Damage result',damageRange.min);
    const st=s.precisionTargetState;if(!st||!st.alive){s.stage='saveOrder';return;}const before=Math.max(0,Number(st.woundsRemaining)||0),pending=Math.min(before,roll);
    if(tacticalPreRollFnp(st,s)){s.precisionPendingDamage=pending;s.precisionPendingFnp=tacticalPreRollFnp(st,s);s.stage='precisionFnp';return;}
    st.woundsRemaining=Math.max(0,before-pending);st.alive=st.woundsRemaining>0;s.counts.failedSaves=(Number(s.counts.failedSaves)||0)+1;s.counts.damage=(Number(s.counts.damage)||0)+pending;s.counts.precisionResolved=(Number(s.counts.precisionResolved)||0)+1;const total=tacticalPreRollSaveableWounds(s,false);s.stage=(Number(s.counts.precisionResolved)||0)<total?'precisionSave':(plan.devastating&&Number(s.specials.criticalWounds||0)>0?'precisionDevastating':'review');
  }else if(field==='precisionFnp'){
    tacticalPreRollPrecisionPushHistory(s);
    const pending=Math.max(0,Number(s.precisionPendingDamage)||0),n=tacticalPreRollDiceAuthority('count',value,pending,'Feel No Pain ignored wounds'),isDevastating=s.precisionPendingKind==='devastating';
    const st=isDevastating?(s.mixedResolution?.modelStates||[]).find(m=>String(m.id)===String(s.precisionPendingModelId)):s.precisionTargetState;
    if(!st||!st.alive)throw new Error('The Precision target is no longer alive.');
    const before=Math.max(0,Number(st.woundsRemaining)||0),applied=Math.min(before,Math.max(0,pending-n));st.woundsRemaining=Math.max(0,before-applied);st.alive=st.woundsRemaining>0;
    s.counts.failedSaves=(Number(s.counts.failedSaves)||0)+1;s.counts.damage=(Number(s.counts.damage)||0)+applied;
    if(isDevastating)s.counts.precisionDevastating=(Number(s.counts.precisionDevastating)||0)+1;
    else s.counts.precisionResolved=(Number(s.counts.precisionResolved)||0)+1;
    delete s.precisionPendingDamage;delete s.precisionPendingFnp;delete s.precisionPendingKind;delete s.precisionPendingModelId;delete s.precisionPendingDevastatingIndex;
    const total=tacticalPreRollSaveableWounds(s,false);s.stage=isDevastating?(s.counts.precisionDevastating<Math.max(0,Number(s.specials.criticalWounds)||0)?'precisionDevastating':'review'):(Number(s.counts.precisionResolved)||0)<total?'precisionSave':(plan.devastating&&Number(s.specials.criticalWounds||0)>0?'precisionDevastating':'review');
  }else if(field==='precisionDevastating'){
    tacticalPreRollPrecisionPushHistory(s);
    const done=Number(s.counts.precisionDevastating||0),total=Math.max(0,Number(s.specials.criticalWounds)||0);if(done>=total){s.stage='review';return;}
    let roll;if(plan.variableDamage){const damageRange=tacticalPreRollDamageRange(s.precisionWeapon?.D||'1');const max=damageRange.max;roll=tacticalPreRollDiceAuthority('damage',value,max,'Damage result',damageRange.min);}else roll=Math.max(0,Number(plan.damageValue)||0);
    const te=entry(current.targetSide,current.targetEntryUid),groups=tacticalPreRollSaveGroups(te,s.precisionTargetState?[s.precisionTargetState]:null),orderIds=s.saveOrder||groups.map(g=>g.id);
    if(!s.mixedResolution)tacticalPreRollBuildPrecisionMixedResolution(s);
    const states=new Map((s.mixedResolution?.modelStates||[]).map(m=>[String(m.id),{...m,woundsRemaining:Math.max(0,Number(m.woundsRemaining)||0),alive:m.alive!==false}]));
    if(s.precisionTargetState){const ps=s.precisionTargetState,pm=states.get(String(ps.modelId));if(pm){pm.woundsRemaining=Math.max(0,Number(ps.woundsRemaining)||0);pm.alive=ps.alive!==false;}}
    const pickGroupModel=g=>{const models=(g?.modelIds||[]).map(id=>states.get(String(id))).filter(Boolean).filter(m=>m.alive!==false);return models.find(m=>Number(m.woundsRemaining||0)<Number(m.maxWounds||m.profile?.W||1))||models[0]||null;};
    let target=null;
    const precisionId=String(s.precisionTargetState?.modelId||'');
    const precisionGroup=groups.find(g=>(g.modelIds||[]).some(id=>String(id)===precisionId));
    if(precisionGroup)target=pickGroupModel(precisionGroup);
    if(!target){
      for(const gid of orderIds){const g=groups.find(x=>x.id===gid);if(!g)continue;target=pickGroupModel(g);if(target)break;}
    }
    if(!target){s.counts.precisionDevastating=done+1;s.stage=s.counts.precisionDevastating<total?'precisionDevastating':'review';return;}
    const before=Math.max(0,Number(target.woundsRemaining)||0),applied=Math.min(before,roll);if(tacticalPreRollFnp(target,s)){s.precisionPendingDamage=applied;s.precisionPendingFnp=tacticalPreRollFnp(target,s);s.precisionPendingKind='devastating';s.precisionPendingModelId=String(target.id);s.precisionPendingDevastatingIndex=done;s.mixedResolution.modelStates=Array.from(states.values());s.stage='precisionFnp';return;}target.woundsRemaining=Math.max(0,before-roll);target.alive=target.woundsRemaining>0;
    if(String(target.id)===precisionId&&s.precisionTargetState){s.precisionTargetState.woundsRemaining=target.woundsRemaining;s.precisionTargetState.alive=target.alive;}
    s.mixedResolution.modelStates=Array.from(states.values());
    s.counts.damage=(Number(s.counts.damage)||0)+applied;s.counts.precisionDevastating=done+1;s.stage=s.counts.precisionDevastating<total?'precisionDevastating':'review';
  }else if(field==='saveOrder'){
    const groups=tacticalPreRollSaveGroups(entry(current.targetSide,current.targetEntryUid),s.precisionTargetState?[s.precisionTargetState]:null,current.targetSide);
    const ids=groups.map(g=>g.id);
    const orders={};
    groups.forEach(g=>{orders[g.id]=Math.max(1,Math.floor(Number(document.querySelector('[data-save-order="'+CSS.escape(g.id)+'"]')?.value)||0));});
    const vals=Object.values(orders);
    if(vals.length!==new Set(vals).size||vals.some(v=>v<1||v>groups.length)){alert('Allocation order must use each position exactly once.');return;}
    const ordered=groups.slice().sort((a,b)=>orders[a.id]-orders[b.id]).map(g=>g.id);
    if(!tacticalPreRollLegalSaveOrder(groups,ordered)){alert('That allocation order is not legal. Wounded non-CHARACTER groups must precede other non-CHARACTER groups, and CHARACTER groups follow non-CHARACTER groups.');return;}
    s.saveOrder=ordered;s.stage='saveRolls';
  }else if(field==='saveRolls'){
    let rolls=[];
    try{rolls=JSON.parse('['+String(value||'').split(',').map(x=>x.trim()).filter(Boolean).join(',')+']');}catch(e){alert('Enter save results as comma-separated D6 values, for example: 1,2,3,5,6');return;}
    const saveable=tacticalPreRollSaveableWounds(s);
    try{
      const saveWeapon=attachedCombatWeaponGroups(current.attackerSide,entry(current.attackerSide,current.attackerEntryUid),entry(current.targetSide,current.targetEntryUid)).map(g=>g.weapon).find(x=>String(x.name)===String(current.weaponName));
      if(!saveWeapon)throw new Error('Weapon profile is no longer available.');
      s.mixedVariableWeapon=saveWeapon;
      if(plan.variableDamage||rolls.some(v=>Number(v)===1&&((combatSnapshot(current.targetSide,entry(current.targetSide,current.targetEntryUid))?.models||[]).some(m=>m.rerollSave1)))||((combatSnapshot(current.targetSide,entry(current.targetSide,current.targetEntryUid))?.models||[]).some(m=>engineFnp(m)))){if(rolls.length!==saveable)throw new Error('Enter exactly '+saveable+' save results.');tacticalPreRollInitMixedVariable(s,rolls);}
      else{
        const resolved=tacticalPreRollApplyMixedSaveRolls({state:s,session:s,plan,saveable,targetEntryUid:current.targetEntryUid,weapon:saveWeapon},rolls);
        s.counts.failedSaves=resolved.failedSaves;s.counts.damage=resolved.damage;s.mixedResolution=resolved;s.stage='review';
      }
    }catch(e){alert(e.message||String(e));return;}
  }else if(field==='mixedVariableSave'){
    try{tacticalPreRollDiceAuthority('individual',value,6,'Save result');tacticalPreRollAdvanceMixedVariableSave(s,Math.floor(Number(value)));}catch(e){alert(e.message||String(e));return;}
  }else if(field==='mixedSaveReroll'){
    try{tacticalPreRollDiceAuthority('individual',value,6,'Save re-roll result');tacticalPreRollResolveMixedSaveReroll(s,Math.floor(Number(value)));}catch(e){alert(e.message||String(e));return;}
  }else if(field==='mixedFnp'){try{tacticalPreRollDiceAuthority('count',n,diceReq?.max||0,'Feel No Pain ignored wounds');if(n>(diceReq?.max||0))throw new Error('Ignored wounds cannot exceed pending damage.');tacticalPreRollResolveMixedFnp(s,n);}catch(e){alert(e.message||String(e));return;}}else if(field==='mixedDamage'){
    try{
      if(s.mixedVariableState?.phase==='damage'){{const dr=tacticalPreRollDamageRange(s.plan.weaponDamage||'1');tacticalPreRollDiceAuthority('damage',value,dr.max,'Damage result',dr.min);}tacticalPreRollResolveMixedVariableDamage(s,Math.floor(Number(value)));}
      else if(s.mixedVariableState?.phase==='devastating'){let devastatingRoll;if(s.plan.variableDamage){{const dr=tacticalPreRollDamageRange(s.plan.weaponDamage||'1');devastatingRoll=tacticalPreRollDiceAuthority('damage',value,dr.max,'Devastating Wounds damage result',dr.min);}}else devastatingRoll=Math.max(0,Number(s.plan.damageValue)||0);tacticalPreRollResolveMixedVariableDevastating(s,devastatingRoll);}
      else throw new Error('No unresolved Damage result remains.');
    }catch(e){alert(e.message||String(e));return;}
  }else if(field==='failedSaves'){
    const critW=Number(s.specials.criticalWounds)||0,wounds=Number(s.counts.wounds)||0,critDev=plan.devastating?Math.min(critW,wounds):0;
    const totalWounds=wounds+(plan.lethal?Math.min(Number(s.specials.criticalHits)||0,Number(s.counts.hits)||0):0);
    const saveable=Math.max(0,totalWounds-critDev);
    if(n>saveable){alert('Failed saves cannot exceed the number of wounds that require saving throws.');return;}
    s.counts.failedSaves=n;
    if(plan.variableDamage||plan.damageValue!==Math.floor(plan.damageValue))s.stage='damage';
    else{s.counts.damage=n*Math.max(0,Number(plan.damageValue)||0)+critDev*Math.max(0,Number(plan.damageValue)||0);s.stage='review';}
  }else if(field==='damage'){
    const failed=Number(s.counts.failedSaves)||0;
    const min=0,max=Math.max(0,failed*Math.max(1,Number(plan.damageValue)||1)*6);
    if(n>max){alert('Damage entered is outside the current weapon range.');return;}
    s.counts.damage=n;s.stage='review';
  }
  save();render();
}
function tacticalPreRollResolutionBack(){
  const current=tacticalPreRollResolutionCurrent();if(!current)return;
  const t=ensureTacticalState(),map=tacticalPreRollResolutionState(),s=map[current.key];
  if(!s)return;
  const order=current.plan?.mixedSaveGroups?['hits','hitSpecial','lethalChoice','wounds','woundSpecial','precisionSave','precisionSaveReroll','precisionDamage','precisionApplyFixed','precisionFnp','precisionDevastating','saveOrder','saveRolls','mixedVariableSave','mixedSaveReroll','mixedDamage','mixedFnp','review']:['hits','hitSpecial','wounds','woundSpecial','saves','damage','review'];
  if(s.plan?.mixedSaveGroups&&['mixedVariableSave','mixedSaveReroll','mixedDamage','mixedFnp','review'].includes(s.stage)&&tacticalPreRollMixedVariableBack(s)){save();render();return;}
  if(s.plan?.precision&&(['precisionSave','precisionSaveReroll','precisionDamage','precisionFnp','precisionDevastating','saveOrder','review'].includes(s.stage))&&tacticalPreRollPrecisionBack(s)){save();render();return;}
  const i=order.indexOf(s.stage);
  if(i<=0){s.stage=s.plan.torrent?'wounds':'hits';delete s.counts.hits;delete s.specials.criticalHits;delete s.specials.lethalHits;save();render();return;}
  s.stage=order[i-1];save();render();
}
function tacticalPreRollBuildPrecisionMixedResolution(s){
  const targetSide=s.targetSide==='my'?'my':'opp',te=entry(targetSide,s.targetEntryUid),groups=tacticalPreRollSaveGroups(te,s.precisionTargetState?[s.precisionTargetState]:null,targetSide),snap=combatSnapshot(targetSide,te);
  const states=(snap?.models||[]).filter(m=>m.alive!==false).map(m=>({id:m.id,sourceEntryUid:m.sourceEntryUid,sourceUnitId:m.sourceUnitId,groupId:(groups.find(g=>(g.modelIds||[]).some(id=>String(id)===String(m.id)))||{}).id||null,groupCharacter:!!m.character,character:!!m.character,profile:m.profile||{},maxWounds:Number(m.maxWounds||m.profile?.W||1)||1,alive:m.alive!==false,woundsRemaining:Math.max(0,Number(m.woundsRemaining)||0)}));
  if(s.precisionTargetState){const ps=s.precisionTargetState,pm=states.find(x=>String(x.id)===String(ps.modelId));if(pm){pm.alive=ps.alive!==false;pm.woundsRemaining=Math.max(0,Number(ps.woundsRemaining)||0);}}
  s.mixedResolution={failedSaves:Number(s.counts.failedSaves)||0,damage:Number(s.counts.damage)||0,normalDamage:Number(s.counts.damage)||0,mortalDamage:0,resolution:s.precisionResolution||[],modelStates:states,variableDamage:false,damageInstances:[],devastatingInstances:[]};
  return s.mixedResolution;
}
function tacticalPreRollApplyResolution(){
  return Object.freeze({tacticalPreRollCheck,tacticalPreRollSessionKey,tacticalPreRollContextSignature,tacticalPreRollResolutionState,tacticalPreRollResolutionCurrent,tacticalPreRollSaveGroups,tacticalPreRollLegalSaveOrder,tacticalPreRollApplyMixedSaveRolls,tacticalPreRollResolutionPlan,tacticalPreRollOpenResolutionForSides,tacticalPreRollOpenResolution,tacticalPreRollCloseResolution,tacticalPreRollDiceAuthority,tacticalPreRollSaveableWounds,tacticalPreRollDiceRequirement,tacticalPreRollDamageRange,tacticalPreRollDamageMax,tacticalPreRollPrecisionPushHistory,tacticalPreRollPrecisionBack,tacticalPreRollPrecisionTarget,tacticalPreRollPrecisionSequential,tacticalPreRollPrecisionStep,tacticalPreRollInitMixedVariable,tacticalPreRollMixedVariablePushHistory,tacticalPreRollMixedVariableBack,tacticalPreRollPickMixedVariableTarget,tacticalPreRollAdvanceMixedVariableSave,tacticalPreRollResolveMixedSaveReroll,tacticalPreRollResolveMixedFnp,tacticalPreRollResolveMixedVariableDamage,tacticalPreRollResolveMixedVariableDevastating,tacticalPreRollResolutionSet,tacticalPreRollResolutionBack,tacticalPreRollBuildPrecisionMixedResolution,tacticalPreRollApplyResolution});
}
window.OnoForgeTacticalPreRollResolutionState=Object.freeze({createTacticalPreRollResolutionStateController});