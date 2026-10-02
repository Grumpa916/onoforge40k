// OnoForge 40K — bounded deployment state contract
// State-only seam: no rendering, persistence, rules, reserves, or geometry.
(function(root){
  'use strict';
  function ensureObject(container,key,fallback){
    if(!container[key] || typeof container[key] !== 'object' || Array.isArray(container[key])) container[key]=fallback();
    return container[key];
  }
  function deploymentPlanKey(state,missionFallback){
    const mission=String(state.objectiveMapMissionKey || missionFallback || 'unselected');
    const layout=['A','B','C'].includes(state.objectiveMapLayout) ? state.objectiveMapLayout : 'A';
    return mission+'|'+layout;
  }
  function ensureDeploymentPlans(state){return ensureObject(state,'deploymentPlans',function(){return {};});}
  function deploymentPlanForCurrentMap(state,missionFallback){
    const raw=ensureDeploymentPlans(state)[deploymentPlanKey(state,missionFallback)];
    return raw && raw.positions && typeof raw.positions==='object' ? raw.positions : {};
  }
  function normalizePosition(x,y){
    const nx=Math.round(Number(x)*10)/10,ny=Math.round(Number(y)*10)/10;
    if(!Number.isFinite(nx)||!Number.isFinite(ny)||nx<0||nx>60||ny<0||ny>44)return null;
    return {x:nx,y:ny};
  }
  function deploymentPlanPosition(state,uid,missionFallback){
    const raw=deploymentPlanForCurrentMap(state,missionFallback)[String(uid)];
    if(!raw)return null;
    const p=normalizePosition(raw.x,raw.y);
    return p ? {x:p.x,y:p.y,side:'my',source:'deployment-plan'} : null;
  }
  function setDeploymentPlanPosition(state,uid,x,y,missionFallback){
    const id=String(uid||''),p=normalizePosition(x,y);
    if(!id||!p)return false;
    const key=deploymentPlanKey(state,missionFallback),plans=ensureDeploymentPlans(state);
    if(!plans[key]||typeof plans[key]!=='object') plans[key]={positions:{},missionKey:String(state.objectiveMapMissionKey||missionFallback||''),layout:state.objectiveMapLayout||'A'};
    if(!plans[key].positions||typeof plans[key].positions!=='object')plans[key].positions={};
    plans[key].positions[id]={x:p.x,y:p.y,side:'my',source:'deployment-plan'};
    return true;
  }
  function clearDeploymentPlanPosition(state,uid,missionFallback){
    const id=String(uid||''),plan=ensureDeploymentPlans(state)[deploymentPlanKey(state,missionFallback)];
    if(!id||!plan||!plan.positions||!Object.prototype.hasOwnProperty.call(plan.positions,id))return false;
    delete plan.positions[id]; return true;
  }
  function clearDeploymentPlanForCurrentMap(state,missionFallback){
    const key=deploymentPlanKey(state,missionFallback),plans=ensureDeploymentPlans(state);
    if(!Object.prototype.hasOwnProperty.call(plans,key))return false;
    delete plans[key]; return true;
  }
  function ensureBattlefieldUnitPositions(state){return ensureObject(state,'battlefieldUnitPositions',function(){return {};});}
  function battlefieldUnitPosition(state,side,uid){
    const raw=ensureBattlefieldUnitPositions(state)[String(uid)];
    if(!raw||raw.side!==(side==='opp'?'opp':'my'))return null;
    const p=normalizePosition(raw.x,raw.y);
    return p ? {x:p.x,y:p.y,side:raw.side,source:raw.source||'manual'} : null;
  }
  function setBattlefieldUnitPosition(state,side,uid,x,y,source,round){
    const id=String(uid||''),p=normalizePosition(x,y);
    if(!id||!p)return false;
    const record={x:p.x,y:p.y,side:side==='opp'?'opp':'my',source:source||'manual'};
    if(round!==undefined)record.round=round;
    ensureBattlefieldUnitPositions(state)[id]=record;
    return true;
  }
  function clearBattlefieldUnitPosition(state,uid){
    const id=String(uid||''),positions=ensureBattlefieldUnitPositions(state);
    if(!id||!Object.prototype.hasOwnProperty.call(positions,id))return false;
    delete positions[id]; return true;
  }
  root.OnoForgeDeploymentState={deploymentPlanKey,ensureDeploymentPlans,deploymentPlanForCurrentMap,deploymentPlanPosition,setDeploymentPlanPosition,clearDeploymentPlanPosition,clearDeploymentPlanForCurrentMap,normalizePosition,ensureBattlefieldUnitPositions,battlefieldUnitPosition,setBattlefieldUnitPosition,clearBattlefieldUnitPosition};
})(window);
