function createPhaseCPStateController({getState}){
 function ensurePhaseCPState(){
  const state=getState();
  if(!state.phaseCP||typeof state.phaseCP!=='object')state.phaseCP={};
 }
 function phaseCPKey(round,turn,phase){
  return String(Math.max(1,Number(round)||1))+'|'+(turn==='opp'?'opp':'my')+'|'+String(phase||'Command');
 }
 function rememberPhaseCP(){
  const state=getState();
  ensurePhaseCPState();
  const key=phaseCPKey(state.round,state.currentTurn,state.phase);
  state.phaseCP[key]={my:Math.max(0,Number(state.myCP)||0),opp:Math.max(0,Number(state.oppCP)||0)};
 }
 function restorePhaseCP(round,turn,phase){
  const state=getState();
  ensurePhaseCPState();
  const key=phaseCPKey(round,turn,phase);
  const saved=state.phaseCP[key];
  if(saved&&typeof saved==='object'){
   state.myCP=Math.max(0,Number(saved.my)||0);
   state.oppCP=Math.max(0,Number(saved.opp)||0);
  }else{
   state.phaseCP[key]={my:Math.max(0,Number(state.myCP)||0),opp:Math.max(0,Number(state.oppCP)||0)};
  }
 }
 return Object.freeze({ensurePhaseCPState,phaseCPKey,rememberPhaseCP,restorePhaseCP});
}
window.OnoForgePhaseCPState=Object.freeze({createPhaseCPStateController});
