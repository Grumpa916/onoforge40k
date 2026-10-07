(function(global){
  function createMathCombatExecutionStateController(deps={}){
    const {engineTargetForAttack,engineContext,engineHalfRangeActive,engineRoll,engineSustained,engineAllocationOrder,enginePrecisionGroupIndex,engineAdvanceAllocationCursor,engineSelectModelInGroup,engineSaveDistribution,engineApplyFnp,engineApplyDamageToWoundsState,engineGroupLiveIndices,engineMortalWoundIndex}=deps;
    function engineOneAttack(a,w,t,m,modelsRemaining,woundsState,attackingModels=1){
      const baseTarget=engineTargetForAttack(t,m,woundsState);
      const baseC=engineContext(a,w,baseTarget,{...m,halfRange:engineHalfRangeActive(w,m)});
      let attacks=0;
      const attackWeapons=[];
      const variants=Array.isArray(m?.attackWeaponVariants)&&m.attackWeaponVariants.length?m.attackWeaponVariants:[{weapon:w,count:Math.max(1,Math.floor(Number(attackingModels)||1))}];
      for(const variant of variants){
        const vw=variant.weapon||w,variantHalfRange=engineHalfRangeActive(vw,m),vc=engineContext(a,vw,baseTarget,{...m,halfRange:variantHalfRange}),count=Math.max(1,Math.floor(Number(variant.count)||1));
        for(let model=0;model<count;model++){
          const modelAttacks=Math.max(0,Math.round(engineRoll(vw.A)+(vc.rapidFire&&engineHalfRangeActive(vw,m)?vc.rapidFire:0)+(vc.blast?vc.blast*Math.floor(modelsRemaining/5):0)+(vc.cleave?vc.cleave*Math.floor(modelsRemaining/5):0)));
          attacks+=modelAttacks;
          for(let ai=0;ai<modelAttacks;ai++)attackWeapons.push(vw);
        }
      }
      let hits=0,wounds=0,saved=0,critHits=0,critWounds=0,rollLog=[];
      const woundEvents=[];
      for(let ai=0;ai<attacks;ai++){
        const attackTarget=engineTargetForAttack(t,m,woundsState);
        const attackWeapon=attackWeapons[ai]||w;
        const attackHalfRange=engineHalfRangeActive(attackWeapon,m);
        const c=engineContext(a,attackWeapon,attackTarget,{...m,halfRange:attackHalfRange});
        let h=1+Math.floor(Math.random()*6);
        if(c.hitReroll==='all'||(c.hitReroll==='ones'&&h===1))h=1+Math.floor(Math.random()*6);
        const crit=h>=c.critHitThreshold,hit=h>=c.hitNeed||crit;
        if(!hit)continue;
        if(crit)critHits++;
        if(crit&&c.lethal){
          wounds++;
          woundEvents.push({hit:h,wound:'AUTO',criticalWound:false,devastating:false,precision:c.precision,context:c,damage:()=>engineRoll(attackWeapon.D)+(c.melta&&attackHalfRange?c.melta:0)});
          continue;
        }
        hits++;
        const extra=crit?engineSustained(c,m):0;
        for(let x=0;x<1+extra;x++){
          let wr=1+Math.floor(Math.random()*6);
          if(c.woundReroll==='all'||(c.woundReroll==='ones'&&wr===1))wr=1+Math.floor(Math.random()*6);
          const critW=wr>=c.critWoundThreshold,wound=wr>=c.woundNeed||critW;
          if(!wound)continue;
          wounds++;if(critW)critWounds++;
          woundEvents.push({hit:h,wound:wr,criticalWound:critW,devastating:!!(critW&&c.devastating),precision:c.precision,context:c,damage:()=>engineRoll(w.D)+(c.melta&&attackHalfRange?c.melta:0)});
        }
      }
    
      const s=m?.attachedTargetState||null;
      const allocationGroups=s?engineAllocationOrder(s,woundsState):[];
      const precisionGroupIndex=s&&woundEvents.some(e=>e.precision)
        ?enginePrecisionGroupIndex(w,t,m,s,woundsState,allocationGroups):-1;
      const saveEvents=woundEvents.filter(e=>!e.devastating).map(e=>{
        let sr=1+Math.floor(Math.random()*6);
        if(m.rerollSave1&&sr===1)sr=1+Math.floor(Math.random()*6);
        return {...e,saveRoll:sr};
      });
    
      let totalDamage=0;
      let normalCursor=0;
      let precisionCursor=precisionGroupIndex>=0?precisionGroupIndex:null;
      const resolveNormal=(e)=>{
        normalCursor=engineAdvanceAllocationCursor(s,woundsState,allocationGroups,normalCursor);
        if(!s)return {index:woundsState.findIndex(x=>Number(x)>0),groupIndex:null,unit:t};
        if(normalCursor>=allocationGroups.length)return {index:-1,groupIndex:normalCursor,unit:t};
        const idx=engineSelectModelInGroup(s,woundsState,allocationGroups[normalCursor]);
        const slot=idx<s.bodyguardCount?s.bodyguardSlots[idx]:s.characterSlots[idx-s.bodyguardCount];
        return {index:idx,groupIndex:normalCursor,unit:{...t,profile:{...(slot.profile||t.profile)},wounds:slot.maxWounds||t.wounds,models:1,__allocationState:s}};
      };
      const resolvePrecision=(e)=>{
        if(precisionCursor===null||!s)return resolveNormal(e);
        precisionCursor=engineAdvanceAllocationCursor(s,woundsState,allocationGroups,precisionCursor);
        if(precisionCursor>=allocationGroups.length)return {index:-1,groupIndex:precisionCursor,unit:t};
        const idx=engineSelectModelInGroup(s,woundsState,allocationGroups[precisionCursor]);
        const slot=idx<s.bodyguardCount?s.bodyguardSlots[idx]:s.characterSlots[idx-s.bodyguardCount];
        return {index:idx,groupIndex:precisionCursor,unit:{...t,profile:{...(slot.profile||t.profile)},wounds:slot.maxWounds||t.wounds,models:1,__allocationState:s}};
      };
    
      // All normal save rolls are resolved from lowest result to highest result.
      // Allocation groups are fixed before the rolls; only destruction advances the
      // current group. Precision temporarily makes its selected Character group the
      // current group for Precision attacks until that group is destroyed.
      saveEvents.sort((x,y)=>Number(x.saveRoll)-Number(y.saveRoll));
      for(const e of saveEvents){
        const alloc=e.precision?resolvePrecision(e):resolveNormal(e);
        if(alloc.index<0)break;
        const save=engineSaveDistribution(alloc.unit,w,e.context,m);
        const savedThis=e.saveRoll!==1&&e.saveRoll>=save.need;
        if(savedThis){saved++;continue}
        let d=e.damage();
        if(m.minusDamage1)d=Math.max(0,d-1);
        d=engineApplyFnp(d,m);
        if(d>0)totalDamage+=engineApplyDamageToWoundsState(d,woundsState,alloc.unit,alloc.index);
        const cursor=alloc.groupIndex;
        if(s&&cursor!==null&&cursor>=0&&cursor<allocationGroups.length&&!engineGroupLiveIndices(s,woundsState,allocationGroups[cursor]).length){
          if(e.precision)precisionCursor=cursor+1;else normalCursor=cursor+1;
        }
      }
    
      // 11th edition Devastating Wounds are mortal wounds applied after normal
      // damage. A Precision Devastating Wound first uses the selected Character
      // group if that group still exists; otherwise use the normal mortal-wound
      // allocation rules. Each critical wound can damage at most one model.
      const devEvents=woundEvents.filter(e=>e.devastating);
      for(const e of devEvents){
        const preferred=(e.precision&&precisionGroupIndex>=0&&s&&engineGroupLiveIndices(s,woundsState,allocationGroups[precisionGroupIndex]).length)
          ?precisionGroupIndex:null;
        const idx=s?engineMortalWoundIndex(s,woundsState,preferred):woundsState.findIndex(x=>Number(x)>0);
        if(idx<0)break;
        let d=Math.max(0,Math.floor(e.damage()));
        if(m.minusDamage1)d=Math.max(0,d-1);
        // Devastating Wounds may damage at most one model for each critical wound.
        d=engineApplyFnp(d,m);
        if(d>0)totalDamage+=engineApplyDamageToWoundsState(d,woundsState,{...t,__allocationState:s},idx);
      }
      return {damage:totalDamage,hits,wounds,saved,critHits,critWounds,rollLog,remaining:woundsState};
    }
    function engineMonteCarlo(a,w,t,m,samples){
      samples=Math.max(100,Math.min(20000,Number(samples)||2000));
      const defModels=Math.max(1,Number(m.defenderModels)||t.models||1),hp=Math.max(1,Number(t.profile.W)||1);
      const attackerModels=Math.max(1,Number(m.attackerModels)||a.models||1);
      let totalDamage=0,totalKilled=0,wipes=0,damageM2=0,killedM2=0;
      for(let s=0;s<samples;s++){
        const woundsState=Array.from({length:defModels},()=>hp);
        const r=engineOneAttack(a,w,t,m,defModels,woundsState,attackerModels);
        const dmg=r.damage,killed=woundsState.filter(x=>x<=0).length;
        totalDamage+=dmg;totalKilled+=killed;damageM2+=dmg*dmg;killedM2+=killed*killed;
        if(killed>=defModels)wipes++;
      }
      const avgDamage=totalDamage/samples,avgKilled=totalKilled/samples,wipeChance=wipes/samples;
      const damageVariance=samples>1?Math.max(0,(damageM2-totalDamage*totalDamage/samples)/(samples-1)):0;
      const killedVariance=samples>1?Math.max(0,(killedM2-totalKilled*totalKilled/samples)/(samples-1)):0;
      const damageStdDev=Math.sqrt(damageVariance),killedStdDev=Math.sqrt(killedVariance);
      return {samples,avgDamage,avgKilled,wipeChance,damageStdDev,killedStdDev,
        damageStdError:damageStdDev/Math.sqrt(samples),killedStdError:killedStdDev/Math.sqrt(samples),
        wipeStdError:Math.sqrt(Math.max(0,wipeChance*(1-wipeChance)/samples))};
    }
    
    function simulateOne(a,w,t,m){const r=engineMonteCarlo(a,w,t,m,1);return {damage:r.avgDamage,killed:r.avgKilled,dead:r.wipeChance>=1}}
    
    return Object.freeze({engineOneAttack,engineMonteCarlo,simulateOne});
  }
  global.OnoForgeMathCombatExecutionState=Object.freeze({createMathCombatExecutionStateController});
})(window);
