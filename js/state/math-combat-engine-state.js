// OnoForge math/combat calculation engine extraction.
function createMathCombatEngineStateController(deps={}){
  const {
    state,entry,get,modelRosterRule,buildModelRoster,bodyguardLeaders,bodyguardSupports,
    isSupportUnit,isLeaderUnit,activeWeaponNames,modelRosterWeaponCounts,DEMO,
    engineHalfRangeActive,calculateMath,engineSaveDistribution,engineContext,engineOneAttack,
    save,render
  }=deps;

function parseNum(v){const s=String(v).trim().toUpperCase();if(/^D6$/.test(s))return 3.5;let m=s.match(/^(\d*)D6(?:\+(\d+))?$/);if(m)return (+(m[1]||1))*3.5+(+(m[2]||0));return Number(s)||1}
function roll(v){const s=String(v).trim().toUpperCase();let m=s.match(/^(\d*)D6(?:\+(\d+))?$/);if(!m)return Number(s)||1;let r=+(m[2]||0);for(let i=0;i<+(m[1]||1);i++)r+=1+Math.floor(Math.random()*6);return r}
function targetNeed(S,T){S=+S;T=+T;if(S>=T*2)return 2;if(S>T)return 3;if(S===T)return 4;if(S*2<=T)return 6;return 5}
function ruleContext(a,w,t){const wa=(w.abilities||[]).map(x=>String(x).toUpperCase());const ctx={lethal:wa.some(x=>x.includes('LETHAL HITS')),sustained:(wa.find(x=>x.includes('SUSTAINED HITS'))||'').match(/SUSTAINED HITS\s*(\d+)/)?.[1]*1||0,devastating:wa.some(x=>x.includes('DEVASTATING WOUNDS')),torrent:wa.some(x=>x.includes('TORRENT')),blast:(wa.find(x=>x.includes('BLAST'))||'').match(/BLAST\s*(\d+)/)?.[1]*1||0,rapid:(wa.find(x=>x.includes('RAPID FIRE'))||'').match(/RAPID FIRE\s*(\d+)/)?.[1]*1||0,anti:(wa.find(x=>x.includes('ANTI-'))||''),heavy:wa.some(x=>x==='HEAVY'),twin:wa.some(x=>x.includes('TWIN-LINKED')),melta:(wa.find(x=>x.includes('MELTA'))||'').match(/MELTA\s*(\d+)/)?.[1]*1||0,ignoreCover:wa.some(x=>x.includes('IGNORES COVER')),precision:wa.some(x=>x.includes('PRECISION'))};return ctx}
function expected(a,w,t){const c=ruleContext(a,w,t);const attacks=parseNum(w.A)+(c.rapid*0)+(c.blast*Math.floor((t.models||1)/5));let hit=1-(+(String(w.BS||w.WS||'4+').replace('+',''))-1)/6;let crit=1/6;if(c.torrent)hit=1;let woundNeed=targetNeed(w.S,t.profile.T),wp=(7-woundNeed)/6;let lethalExtra=c.lethal?crit:0;let normalW=wp*(1-crit);let saveNeed=Math.max(2,Math.min(7,(parseInt(t.profile.Sv)+Math.abs(w.AP||0))));let failed=1-(7-saveNeed)/6;let regularDamage=attacks*(hit*normalW+lethalExtra)*failed*parseNum(w.D);let devDamage=c.devastating?attacks*hit*crit*parseNum(w.D):0;return {attacks,hit,woundNeed,wp,saveNeed,failed,expectedDamage:regularDamage+devDamage,lethalExtra,devDamage,context:c}}
function mathRosterEntry(side){
  const arr=state[side]||[];
  const uid=side==='my'?(state.mathRules||{}).attackerEntry:(state.mathRules||{}).defenderEntry;
  let e=uid?arr.find(x=>x.uid===uid):null;
  if(!e&&arr.length)e=arr[0];
  return e||null;
}
function combatRootEntry(side,e){
  if(!e)return null;
  let cur=e,seen=new Set();
  while(cur&&cur.attachedTo&&!seen.has(cur.uid)){
    seen.add(cur.uid);
    const parent=entry(side,cur.attachedTo);
    if(!parent)break;
    cur=parent;
  }
  return cur||e;
}
function attachedCombatEntries(side,e){
  const root=combatRootEntry(side,e);
  if(!root)return [];
  const out=[root];
  const add=x=>{if(x&&!out.some(y=>y.uid===x.uid))out.push(x)};
  bodyguardLeaders(side,root.uid).forEach(add);
  bodyguardSupports(side,root.uid).forEach(add);
  return out;
}
function combatComponentRole(side,root,ce,u){
  if(!ce||!u)return 'model';
  if(ce.uid===root.uid){
    if(ce.attachedRole==='support'||isSupportUnit(u))return 'support';
    if(isLeaderUnit(u))return 'leader';
    return 'bodyguard';
  }
  if(ce.attachedRole==='support'||isSupportUnit(u))return 'support';
  return 'leader';
}
function combatModelSnapshot(side,ce,u){
  const rosterRule=modelRosterRule(u);
  const desired=buildModelRoster(ce,u);
  const prior=Array.isArray(ce.game?.modelRoster)?ce.game.modelRoster:(Array.isArray(ce.modelRoster)?ce.modelRoster:[]);
  const priorById=new Map(prior.map(m=>[m.id,m]));
  const roster=desired.map(m=>{
    const old=priorById.get(m.id);
    return old?{...m,alive:old.alive!==false,woundsRemaining:old.woundsRemaining==null?m.woundsRemaining:Math.max(0,Number(old.woundsRemaining)||0)}:m;
  });
  if(rosterRule){
    return roster.map((m,i)=>({
      id:m.id||('model-'+i),sourceEntryUid:ce.uid,sourceUnitId:u.id,
      role:m.role||('Model '+(i+1)),alive:m.alive!==false,
      woundsRemaining:Math.max(0,Number(m.woundsRemaining)||0),
      maxWounds:Math.max(1,Number(u.wounds)||1),
      weapons:Array.isArray(m.weapons)?m.weapons.filter(Boolean).slice():[],
      character:(u.keywords||[]).some(k=>String(k||'').toUpperCase().trim()==='CHARACTER'),
      profile:{...(u.profile||{})},unitName:u.name,weaponIdentityExact:true,modelIdentityExact:true
    }));
  }
  const maxWounds=Math.max(1,Number(u.wounds)||1);
  const fallback=activeWeaponNames(ce,u)[0]||u.weapons?.[0]?.name||'';
  const game=ce.game&&typeof ce.game==='object'?ce.game:null;
  const configuredModels=Math.max(0,Math.floor(Number(ce.models)||Number(u.models)||0));
  const rawModels=game&&Number.isFinite(Number(game.models))?Number(game.models):configuredModels;
  const aliveModels=Math.max(0,Math.min(configuredModels,Math.floor(rawModels)));
  const rawWounds=game&&Number.isFinite(Number(game.wounds))?Number(game.wounds):aliveModels*maxWounds;
  const totalWounds=Math.max(0,Math.min(aliveModels*maxWounds,rawWounds));
  const alloc=mathWeaponAlloc(ce,u),weaponPool=[];
  Object.entries(alloc).forEach(([name,n])=>{for(let i=0;i<Math.max(0,Math.floor(Number(n)||0));i++)weaponPool.push(name)});
  while(weaponPool.length<aliveModels)weaponPool.push(fallback);
  const selectedWeapons=weaponPool.slice(0,aliveModels);
  return Array.from({length:aliveModels},(_,i)=>{
    const remaining=Math.max(0,Math.min(maxWounds,totalWounds-i*maxWounds));
    return {
      id:ce.uid+'-model-'+(i+1),sourceEntryUid:ce.uid,sourceUnitId:u.id,
      role:(isLeaderUnit(u)&&i===0)?'Leader':'Model '+(i+1),alive:remaining>0,
      woundsRemaining:remaining,maxWounds,
      weapons:selectedWeapons[i]?[selectedWeapons[i]]:[],
      character:(u.keywords||[]).some(k=>String(k||'').toUpperCase().trim()==='CHARACTER'),
      profile:{...(u.profile||{})},unitName:u.name,
      weaponIdentityExact:false,modelIdentityExact:false
    };
  });
}
function combatSnapshot(side,entryUidOrEntry){
  const selected=typeof entryUidOrEntry==='string'?entry(side,entryUidOrEntry):entryUidOrEntry;
  const root=combatRootEntry(side,selected);if(!root)return null;
  const components=attachedCombatEntries(side,root).map(ce=>{
    const u=get(ce.unitId);if(!u)return null;
    const role=combatComponentRole(side,root,ce,u);
    return {entryUid:ce.uid,unitId:u.id,unitName:u.name,faction:u.faction||'',role,models:combatModelSnapshot(side,ce,u)};
  }).filter(Boolean);
  const models=components.flatMap(c=>c.models.map(m=>({...m,componentRole:c.role})));
  const weapons=[];
  models.filter(m=>m.alive!==false).forEach(m=>(m.weapons||[]).forEach(name=>{
    const unit=DEMO.find(u=>u.id===m.sourceUnitId);
    const weapon=(unit?.weapons||[]).find(w=>w.name===name);
    if(weapon)weapons.push({
      sourceEntryUid:m.sourceEntryUid,sourceModelId:m.id,modelRole:m.role,
      componentRole:m.componentRole,unitId:m.sourceUnitId,unitName:m.unitName,
      identityExact:!!m.weaponIdentityExact,weapon:{...weapon}
    });
  }));
  const alive=models.filter(m=>m.alive!==false);
  const bodyguardModels=components.filter(c=>c.role==='bodyguard').flatMap(c=>c.models.filter(m=>m.alive!==false));
  const characterModels=alive.filter(m=>m.character===true);
  const targetModels=bodyguardModels.length?bodyguardModels:alive;
  const attachedKeywords=[...new Set(components.filter(c=>c.models.some(m=>m.alive!==false)).flatMap(c=>get(c.unitId)?.keywords||[]))];
  const toughnessPool=targetModels.map(m=>Number(m.profile?.T)).filter(Number.isFinite);
  const uniqueToughness=Array.from(new Set(toughnessPool));
  const componentStates={};
  components.forEach(c=>{
    const ce=entry(side,c.entryUid);
    componentStates[c.entryUid]={
      status:ce?.game?.status||'Alive',battleshocked:!!ce?.game?.battleshocked,
      models:Number(ce?.game?.models),wounds:Number(ce?.game?.wounds)
    };
  });
  return {
    version:2,side,rootUid:root.uid,rootUnitId:get(root.unitId)?.id||root.unitId,
    rootUnitName:get(root.unitId)?.name||'',faction:get(root.unitId)?.faction||'',
    components,models,weapons,survivingModels:alive.length,
    characterModels,characterModelsCount:characterModels.length,
    totalWounds:alive.reduce((n,m)=>n+Math.max(0,Number(m.woundsRemaining)||0),0),
    maxWounds:models.reduce((n,m)=>n+Math.max(0,Number(m.maxWounds)||0),0),
    targetToughness:uniqueToughness.length===1?uniqueToughness[0]:null,
    targetToughnessByModel:targetModels.map(m=>({modelId:m.id,sourceEntryUid:m.sourceEntryUid,T:Number(m.profile?.T)||0})),
    attachedKeywords,
    targetModels:targetModels.length,
    targetWoundsState:targetModels.map(m=>Math.max(0,Number(m.woundsRemaining)||0)),
    targetWoundsRemaining:targetModels.reduce((n,m)=>n+Math.max(0,Number(m.woundsRemaining)||0),0),
    exactModelIdentity:components.every(c=>c.models.every(m=>m.modelIdentityExact!==false)),
    exactWeaponIdentity:components.every(c=>c.models.every(m=>m.weaponIdentityExact!==false)),
    battleState:{round:Math.max(1,Number(state.round)||1),phase:state.phase||'Command',currentTurn:state.currentTurn||state.turn||'my',componentStates}
  };
}
function combatTargetUnit(side,entryUidOrEntry){
  const selected=typeof entryUidOrEntry==='string'?entry(side,entryUidOrEntry):entryUidOrEntry;
  const root=combatRootEntry(side,selected);if(!root)return null;
  const snap=combatSnapshot(side,root);if(!snap)return get(root.unitId)||null;
  const body= snap.components.find(c=>c.role==='bodyguard'&&c.models.some(m=>m.alive!==false));
  if(body){
    const u=get(body.unitId);
    if(u){
      const alive=body.models.filter(m=>m.alive!==false);
      const highestT=Math.max(...alive.map(m=>Number(m.profile?.T)||Number(u.profile?.T)||0));
      const profile={...(u.profile||{})};
      if(highestT)profile.T=highestT;
      return {...u,profile,keywords:snap.attachedKeywords||u.keywords||[],models:alive.length,__combatTarget:true,__attachedRootUid:root.uid,__bodyguardEntryUid:body.entryUid};
    }
  }
  const liveLeader=snap.components.find(c=>(c.role==='leader'||c.role==='support')&&c.models.some(m=>m.alive!==false));
  if(liveLeader){
    const u=get(liveLeader.unitId);if(u){
      const alive=liveLeader.models.filter(m=>m.alive!==false);
      return {...u,keywords:snap.attachedKeywords||u.keywords||[],models:alive.length,__combatTarget:true,__attachedRootUid:root.uid,__leaderEntryUid:liveLeader.entryUid};
    }
  }
  return get(root.unitId)||null;
}
function combatTargetEntry(side,entryUidOrEntry){
  const selected=typeof entryUidOrEntry==='string'?entry(side,entryUidOrEntry):entryUidOrEntry;
  const root=combatRootEntry(side,selected);
  return root||selected||null;
}
function combatUnit(side,entryUidOrEntry){return combatSnapshot(side,entryUidOrEntry)}
function engineApplicableWeaponAbilities(w,target){
  const raw=Array.isArray(w?.abilities)?w.abilities.map(x=>String(x).trim()).filter(Boolean):[];
  if(!target)return raw.sort();
  const kws=new Set((target.keywords||[]).map(k=>String(k||'').toUpperCase().trim()));
  return raw.filter(ab=>{
    const parts=ab.split(':');
    if(parts.length<2)return true;
    const qualifiers=parts.slice(1).join(':').split(/[\\/,&+]/).map(x=>x.replace(/[-]?\d+\+?/g,'').trim().toUpperCase()).filter(Boolean);
    return !qualifiers.length||qualifiers.some(q=>kws.has(q));
  }).sort();
}
function engineWeaponPoolKey(w,target,attackerUnit=null){
  const p=w?.weapon||w||{};
  const abilities=engineApplicableWeaponAbilities(p,target);
  const attackerAbilities=Array.isArray(attackerUnit?.abilities)
    ?attackerUnit.abilities.map(x=>String(x).trim()).filter(Boolean).sort():[];
  return JSON.stringify({
    BS:String(p.BS??''),WS:String(p.WS??''),
    S:String(p.S??''),AP:String(p.AP??''),D:String(p.D??''),
    abilities,attackerAbilities
  });
}
function engineWeaponVariantKey(w){const p=w?.weapon||w||{};return JSON.stringify({A:String(p.A??'')});}
function attachedCombatWeaponGroups(side,e,target=null){
  const snap=combatSnapshot(side,e);if(!snap)return [];
  return snap.weapons.reduce((groups,w)=>{
    const attackerUnit=get(w.unitId);
    const key=w.sourceEntryUid+'|'+String(w.sourceModelId||'')+'|'+engineWeaponPoolKey(w.weapon,target,attackerUnit);
    const poolKey=engineWeaponPoolKey(w.weapon,target,attackerUnit),existing=groups.find(g=>g.poolKey===poolKey);
    if(existing){
      existing.count++;existing.modelIds.push(w.sourceModelId);
      const v=existing.weaponVariants.find(x=>engineWeaponVariantKey(x.weapon)===engineWeaponVariantKey(w.weapon));
      if(v)v.count++;else existing.weaponVariants.push({weapon:w.weapon,count:1});
    }else{
      const ce=entry(side,w.sourceEntryUid),u=attackerUnit;
      groups.push({key,poolKey,entry:ce,attacker:u,weapon:w.weapon,count:1,modelIds:[w.sourceModelId],role:w.componentRole,identityExact:!!w.identityExact,weaponVariants:[{weapon:w.weapon,count:1}]});
    }
    return groups;
  },[]);
}
function mathUnit(side){
  const e=mathRosterEntry(side);
  return e?get(attachedCombatEntries(side,e)[0]?.unitId||e.unitId):get(side==='my'?state.attacker:state.target);
}
function mathWeaponAlloc(e,u){
  if(modelRosterRule(u)){
    const exact=modelRosterWeaponCounts(e,u);
    if(Object.keys(exact).length)return exact;
  }
  const rules=state.mathRules||{}; const key=e?.uid||u?.id||'catalogue'; const saved=(rules.weaponAlloc&&rules.weaponAlloc[key])||{};
  const names=activeWeaponNames(e,u);
  let alloc={}; let remaining=Math.max(0,Number(e?.models)||Number(u?.models)||1);
  names.forEach((n,i)=>{let v=Number(saved[n]); if(!Number.isFinite(v)||v<0)v= i===0?remaining:0; v=Math.min(remaining,Math.floor(v)); alloc[n]=v; remaining-=v;});
  if(remaining>0&&names.length)alloc[names[0]]=(alloc[names[0]]||0)+remaining;
  return alloc;
}
function normalizeMathWeaponForUnit(u){
  if(!u)return;
  const names=activeWeaponNames(null,u);
  if(!names.includes(state.weapon))state.weapon=names[0]||'';
}
function setMathRoster(side,uid){
  state.mathRules=state.mathRules||{};
  if(side==='my')state.mathRules.attackerEntry=uid; else state.mathRules.defenderEntry=uid;
  const e=state[side].find(x=>x.uid===uid),u=e?get(e.unitId):null;
  if(side==='my'&&u){state.attacker=u.id;state.weapon=(activeWeaponNames(e,u)[0]||u.weapons?.[0]?.name||'');normalizeMathWeaponForUnit(u);}
  if(side==='opp'&&u)state.target=u.id;
  save();render();
}
function setMathWeaponCount(uid,name,val){
  state.mathRules=state.mathRules||{}; state.mathRules.weaponAlloc=state.mathRules.weaponAlloc||{};
  state.mathRules.weaponAlloc[uid]=state.mathRules.weaponAlloc[uid]||{};
  const e=state.my.find(x=>x.uid===uid); const max=Math.max(1,Number(e?.models)||1);
  state.mathRules.weaponAlloc[uid][name]=Math.max(0,Math.min(max,Math.floor(Number(val)||0)));
  save();render();
}
function calculateMathMixed(a,t,groups,m){
  const safe={...(m||{})};
  delete safe.attackerModels;
  delete safe.defenderModels;
  safe.defenderModels=Math.max(1,Number(m?.defenderModels)||t.models||1);
  if(Array.isArray(m?.defenderWoundsState)){
    const state=m.defenderWoundsState.slice(0,safe.defenderModels).map(v=>Math.max(0,Number(v)||0));
    while(state.length<safe.defenderModels)state.push(Math.max(1,Number(t.profile?.W)||1));
    safe.defenderWoundsState=state;
  }else delete safe.defenderWoundsState;
  const skipSim=m?._skipSim===true;
  safe._skipSim=true;
  let totals={attacks:0,hits:0,wounds:0,failedSaves:0,damage:0,critHits:0,critWounds:0};
  const details=[];
  for(const g of groups){
    if(g.count<=0)continue;
    const variants=Array.isArray(g.weaponVariants)&&g.weaponVariants.length?g.weaponVariants:[{weapon:g.weapon,count:g.count}];
    for(const v of variants){
      if(v.count<=0)continue;
      const rr=calculateMath(g.attacker||a,v.weapon,t,{...safe,attackerModels:v.count,halfRange:engineHalfRangeActive(v.weapon,safe)});
      ['attacks','hits','wounds','failedSaves','damage','critHits','critWounds'].forEach(k=>totals[k]+=Number(rr[k])||0);
      details.push({weapon:v.weapon.name,count:v.count,result:rr});
    }
  }
  const sim=skipSim
    ? {samples:0,avgDamage:totals.damage,avgKilled:0,wipeChance:0,damageStdDev:0,killedStdDev:0,damageStdError:0,killedStdError:0,wipeStdError:0}
    : engineMonteCarloMixed(a,t,groups,safe,Math.min(20000,Math.max(1000,Number(m?.quickSamples)||5000)));
  const leadGroup=groups[0];
  const leadAttacker=leadGroup?.attacker||a;
  const save=leadGroup?.weapon?engineSaveDistribution(t,leadGroup.weapon,engineContext(leadAttacker,leadGroup.weapon,t,safe),safe):{need:7,inv:null};
  const c=leadGroup?.weapon?engineContext(leadAttacker,leadGroup.weapon,t,safe):{woundNeed:7,hitNeed:7};
  const saveText=save.need>6?'No save':save.need+'+';
  const hitText=c.torrent?'Auto-hit':c.hitNeed+'+';
  const targetWounds=Array.isArray(safe.defenderWoundsState)
    ?safe.defenderWoundsState.reduce((sum,v)=>sum+Math.max(0,Number(v)||0),0)
    :safe.defenderModels*(Number(t.profile.W)||1);
  // Mixed-loadout damage must come from the shared-state simulation: separate
  // analytical weapon calculations cannot reproduce 11th-edition allocation
  // ordering when saves, wounds, Characters, or Precision differ.
  const allocationAwareDamage=Number.isFinite(sim.avgDamage)?sim.avgDamage:totals.damage;
  const damageRelSe=Number.isFinite(sim.damageStdError)?sim.damageStdError/Math.max(1,Math.abs(allocationAwareDamage)):1;
  const wipeRelSe=Number.isFinite(sim.wipeStdError)?sim.wipeStdError:1;
  const simulationConfidence=Math.max(0,Math.min(1,0.60*Math.max(0,1-2*damageRelSe)+0.40*Math.max(0,1-2*wipeRelSe)));
  return {...totals,damage:allocationAwareDamage,profileDamage:totals.damage,killChance:sim.wipeChance,modelsKilled:sim.avgKilled,targetWounds,saveText,woundNeed:c.woundNeed,hitText,sim,simulationConfidence,details,
    summary:`${a.name} mixed loadout into ${t.name}: ${totals.hits.toFixed(2)} hits, ${totals.wounds.toFixed(2)} wounds, ${allocationAwareDamage.toFixed(2)} allocation-aware expected damage across ${groups.filter(g=>g.count>0).length} weapon profile${groups.filter(g=>g.count>0).length===1?'':'s'}. Full-unit wipe chance is ${(sim.wipeChance*100).toFixed(1)}% based on ${sim.samples.toLocaleString()} simulated sequences.`};
}
function engineMonteCarloMixed(a,t,groups,m,samples){
  samples=Math.max(100,Math.min(20000,Number(samples)||2000));
  const attachedState=m?.attachedTargetState||null;
  const attachedWounds=attachedState
    ?[...(attachedState.bodyguardSlots||[]),...(attachedState.characterSlots||[])].map(slot=>Math.max(0,Number(slot.model?.woundsRemaining)||Number(slot.maxWounds)||Number(slot.profile?.W)||1))
    :null;
  const defModels=attachedWounds?.length
    ?attachedWounds.length
    :Math.max(1,Number(m.defenderModels)||t.models||1),hp=Math.max(1,Number(t.profile.W)||1);
  const baseWounds=attachedWounds?.length
    ?attachedWounds
    :Array.isArray(m?.defenderWoundsState)
      ?m.defenderWoundsState.slice(0,defModels).map(v=>Math.max(0,Number(v)||0))
      :Array.from({length:defModels},()=>hp);
  while(baseWounds.length<defModels)baseWounds.push(hp);
  let totalDamage=0,totalKilled=0,wipes=0,damageM2=0,killedM2=0;
  for(let s=0;s<samples;s++){
    const woundsState=baseWounds.slice(); let dmg=0;
    for(const g of groups){
      if(g.count<=0)continue;
      const r=engineOneAttack(g.attacker||a,g.weapon,t,{...m,attackWeaponVariants:g.weaponVariants||[{weapon:g.weapon,count:g.count}]},defModels,woundsState,g.count);
      dmg+=r.damage;
      if(woundsState.every(x=>x<=0))break;
    }
    const killed=woundsState.filter(x=>x<=0).length;
    totalDamage+=dmg; totalKilled+=killed;
    // Accumulate raw second moments; convert to unbiased sample variance below.
    // This avoids the previous zero-variance bug while remaining numerically simple
    // for the bounded damage values used by the simulator.
    damageM2+=dmg*dmg;
    killedM2+=killed*killed;
    if(killed>=defModels)wipes++;
  }
  const avgDamage=totalDamage/samples,avgKilled=totalKilled/samples;
  const damageVariance=samples>1?Math.max(0,(damageM2-(totalDamage*totalDamage/samples))/(samples-1)):0;
  const killedVariance=samples>1?Math.max(0,(killedM2-(totalKilled*totalKilled/samples))/(samples-1)):0;
  const damageStdDev=Math.sqrt(damageVariance),killedStdDev=Math.sqrt(killedVariance),wipeChance=wipes/samples;
  return {samples,avgDamage,avgKilled,wipeChance,damageStdDev,killedStdDev,
    damageStdError:damageStdDev/Math.sqrt(samples),killedStdError:killedStdDev/Math.sqrt(samples),
    wipeStdError:Math.sqrt(Math.max(0,wipeChance*(1-wipeChance)/samples))};
}


  return Object.freeze({parseNum,roll,targetNeed,ruleContext,expected,mathRosterEntry,combatRootEntry,attachedCombatEntries,combatComponentRole,combatModelSnapshot,combatSnapshot,combatTargetUnit,combatTargetEntry,combatUnit,engineApplicableWeaponAbilities,engineWeaponPoolKey,engineWeaponVariantKey,attachedCombatWeaponGroups,mathUnit,mathWeaponAlloc,normalizeMathWeaponForUnit,setMathRoster,setMathWeaponCount,calculateMathMixed,engineMonteCarloMixed});
}
window.OnoForgeMathCombatEngineState=Object.freeze({createMathCombatEngineStateController});
