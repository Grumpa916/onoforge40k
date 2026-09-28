(function(global){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function appState(){return global.ONOFORGE_APP_STATE||global.state||{};}
function entries(side){return Array.isArray(appState()[side])?appState()[side].filter(Boolean):[];}
function snapshot(){return typeof global.snapshotForUndo==='function'?global.snapshotForUndo():null;}
function persist(){if(typeof global.save==='function')global.save();if(typeof global.render==='function')global.render();}
function emit(kind,payload,before){if(typeof global.event==='function')global.event(kind,payload,before);}
function selectHtml(id,items,placeholder){return '<select id="'+id+'"><option value="">'+esc(placeholder)+'</option>'+items.map(e=>'<option value="'+esc(e.uid)+'">'+esc(e.name||e.uid)+'</option>').join('')+'</select>';}
function panel(){
  const s=appState();
  if(String(s.currentTurn||'').toLowerCase()!=='opp')return '';
  const phase=String(s.phase||'');
  if(!['Shooting','Charge','Fight'].includes(phase))return '';
  const my=entries('my'),opp=entries('opp');
  let body='';
  if(phase==='Shooting'){
    body='<div class="grid2">'+
      '<div class="field"><label>Enemy shooter</label>'+selectHtml('of-opp-attacker',opp,'Select enemy unit')+'</div>'+
      '<div class="field"><label>My targeted unit</label>'+selectHtml('of-my-target',my,'Select my unit')+'</div>'+ 
      '</div><div class="grid3" style="margin-top:8px">'+
      '<div class="field"><label>Damage actually applied</label><input id="of-damage" type="number" min="0" step="0.1" placeholder="Unknown allowed"></div>'+ 
      '<div class="field"><label>Wounds actually lost</label><input id="of-wounds" type="number" min="0" step="1" placeholder="Unknown allowed"></div>'+ 
      '<div class="field"><label>Models actually lost</label><input id="of-casualties" type="number" min="0" step="1" placeholder="Unknown allowed"></div>'+ 
      '</div><div class="field" style="margin-top:8px"><label>Affected model IDs (optional, comma-separated)</label><input id="of-models" type="text" placeholder="Only enter models you can identify"></div>'+ 
      '<button class="btn primary" style="margin-top:8px" onclick="window.captureOpponentTurnEvent(\'shooting\');return false">Record opponent Shooting result</button>';
  }else if(phase==='Charge'){
    body='<div class="grid2">'+
      '<div class="field"><label>Enemy charging unit</label>'+selectHtml('of-opp-attacker',opp,'Select enemy unit')+'</div>'+
      '<div class="field"><label>My charged unit</label>'+selectHtml('of-my-target',my,'Select my unit')+'</div>'+ 
      '</div><div class="grid3" style="margin-top:8px">'+
      '<div class="field"><label>Charge result</label><select id="of-result"><option value="Successful">Successful</option><option value="Failed">Failed</option></select></div>'+ 
      '<div class="field"><label>Measured charge distance (optional)</label><input id="of-distance" type="number" min="0" step="0.1" placeholder="Leave blank if unknown"></div>'+ 
      '<div class="field"><label>Engagement state</label><select id="of-engagement"><option value="unknown">Unknown</option><option value="engaged">Engaged</option><option value="notEngaged">Not engaged</option></select></div>'+ 
      '</div><button class="btn primary" style="margin-top:8px" onclick="window.captureOpponentTurnEvent(\'charge\');return false">Record opponent Charge</button>';
  }else{
    body='<div class="grid2">'+
      '<div class="field"><label>Enemy fighting unit</label>'+selectHtml('of-opp-attacker',opp,'Select enemy unit')+'</div>'+
      '<div class="field"><label>My unit fought</label>'+selectHtml('of-my-target',my,'Select my unit')+'</div>'+ 
      '</div><div class="grid3" style="margin-top:8px">'+
      '<div class="field"><label>Damage actually applied</label><input id="of-damage" type="number" min="0" step="0.1" placeholder="Unknown allowed"></div>'+ 
      '<div class="field"><label>Wounds actually lost</label><input id="of-wounds" type="number" min="0" step="1" placeholder="Unknown allowed"></div>'+ 
      '<div class="field"><label>Models actually lost</label><input id="of-casualties" type="number" min="0" step="1" placeholder="Unknown allowed"></div>'+ 
      '</div><div class="field" style="margin-top:8px"><label>Affected model IDs (optional, comma-separated)</label><input id="of-models" type="text" placeholder="Only enter models you can identify"></div>'+ 
      '<div class="grid2" style="margin-top:8px"><div class="field"><label>Pile-in</label><select id="of-pile"><option value="unknown">Unknown</option><option value="completed">Completed</option><option value="notCompleted">Not completed</option></select></div><div class="field"><label>Consolidation</label><select id="of-consolidation"><option value="unknown">Unknown</option><option value="completed">Completed</option><option value="notCompleted">Not completed</option></select></div></div>'+ 
      '<button class="btn primary" style="margin-top:8px" onclick="window.captureOpponentTurnEvent(\'fight\');return false">Record opponent Fight result</button>';
  }
  return '<div id="onoforge-opponent-turn-capture" class="card" style="border-color:#6b4c54"><div class="split"><div><h3 style="margin:0">Opponent '+esc(phase)+' Capture</h3><div class="muted">Record only facts actually established during the opponent turn.</div></div><span class="pill">Authoritative event capture</span></div>'+body+'<div class="tiny" style="margin-top:8px">Unknown values remain unknown. This panel does not resolve combat or infer movement.</div></div>';
}
function renderPanel(){
  const existing=document.getElementById('onoforge-opponent-turn-capture');if(existing)existing.remove();
  if(typeof global.state==='undefined'&&typeof global.ONOFORGE_APP_STATE==='undefined')return;
  const html=panel();if(!html)return;
  const host=document.querySelector('.battle-layout')||document.querySelector('.wrap');if(!host)return;
  const node=document.createElement('div');node.innerHTML=html;host.insertBefore(node.firstElementChild,host.firstChild);
}
function num(id){const v=document.getElementById(id)?.value;return v===''||v==null?null:Number(v);}
function ids(id){const v=document.getElementById(id)?.value||'';return v.split(',').map(x=>x.trim()).filter(Boolean);}
function capture(kind){
  const s=appState();if(String(s.currentTurn||'').toLowerCase()!=='opp')return;
  const attackerUid=document.getElementById('of-opp-attacker')?.value||'',targetUid=document.getElementById('of-my-target')?.value||'';
  if(!attackerUid||!targetUid){if(global.alert)global.alert('Select both enemy and friendly units before recording the event.');return;}
  const before=snapshot();
  if(kind==='charge'){
    emit('OPPONENT_CHARGE_CAPTURE',{attackerSide:'opp',targetSide:'my',attackerUid,targetUid,result:document.getElementById('of-result')?.value,measuredDistance:num('of-distance'),engagementState:document.getElementById('of-engagement')?.value||'unknown',phase:'Charge',round:s.round},before);
  }else{
    const payload={attackerSide:'opp',targetSide:'my',attackerUid,targetUid,phase:kind==='shooting'?'Shooting':'Fight',damage:num('of-damage'),wounds:num('of-wounds'),casualties:num('of-casualties'),modelIds:ids('of-models'),source:'manual-opponent-turn-capture'};
    if(kind==='fight')Object.assign(payload,{pileIn:document.getElementById('of-pile')?.value||'unknown',consolidation:document.getElementById('of-consolidation')?.value||'unknown'});
    emit(kind==='shooting'?'OPPONENT_SHOOTING_CAPTURE':'OPPONENT_FIGHT_CAPTURE',payload,before);
  }
  persist();
}
function install(){
  if(global.__ONOFORGE_OPPONENT_CAPTURE_UI_INSTALLED)return;
  global.__ONOFORGE_OPPONENT_CAPTURE_UI_INSTALLED=true;global.captureOpponentTurnEvent=capture;
  const wait=()=>{if(typeof global.render==='function'){const original=global.render;if(!original.__onoforgeOpponentCapture){const wrapped=function(){const result=original.apply(this,arguments);setTimeout(renderPanel,0);return result;};wrapped.__onoforgeOpponentCapture=true;global.render=wrapped;}setTimeout(renderPanel,0);return;}global.setTimeout(wait,50);};
  wait();
}
global.ONOFORGE_OPPONENT_CAPTURE_UI=Object.freeze({panel,renderPanel,capture});install();
})(window);
