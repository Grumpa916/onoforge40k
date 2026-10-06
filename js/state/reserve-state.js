function createReserveStateController({getState,snapshotForUndo,event,save,render}){
  function ensureReserveState(){
    const state=getState();
    if(!state.reserveDeclarations||typeof state.reserveDeclarations!=='object'||Array.isArray(state.reserveDeclarations))state.reserveDeclarations={my:{},opp:{}};
    if(!state.reserveDeclarations.my||typeof state.reserveDeclarations.my!=='object')state.reserveDeclarations.my={};
    if(!state.reserveDeclarations.opp||typeof state.reserveDeclarations.opp!=='object')state.reserveDeclarations.opp={};
    return state.reserveDeclarations;
  }
  function isUnitReserved(side,uid){return ensureReserveState()[side==='opp'?'opp':'my'][String(uid)]===true;}
  function reserveUnitsForSide(side){
    const state=getState(),list=side==='opp'?state.opp:state.my;
    return (Array.isArray(list)?list:[]).filter(e=>e&&!e.attachedTo&&isUnitReserved(side,e.uid));
  }
  function clearReserveDeclarationsForSide(side){
    const state=getState(),s=side==='opp'?'opp':'my';
    ensureReserveState()[s]={};
    const list=s==='opp'?state.opp:state.my;
    const live=state.battlefieldUnitPositions||{};
    (Array.isArray(list)?list:[]).forEach(e=>{if(e&&!e.attachedTo)delete live[String(e.uid)]});
  }
  function setReserveDeclaration(side,uid,declared){
    const state=getState(),s=side==='opp'?'opp':'my',id=String(uid||'');
    if(!id||state.page==='battle')return false;
    const list=s==='opp'?state.opp:state.my;
    const entry=(Array.isArray(list)?list:[]).find(e=>String(e?.uid)===id);
    if(!entry||entry.attachedTo)return false;
    const before=snapshotForUndo();
    if(declared)ensureReserveState()[s][id]=true;else delete ensureReserveState()[s][id];
    if(declared&&state.battlefieldUnitPositions)delete state.battlefieldUnitPositions[id];
    event(declared?'RESERVE_DECLARED':'RESERVE_DECLARATION_REMOVED',{unit:id,side:s,action:declared?'Unit declared for reserves':'Unit removed from declared reserves',round:Math.max(1,Number(state.round)||1),phase:String(state.phase||'Command')},before);
    save();render();return true;
  }
  return Object.freeze({ensureReserveState,isUnitReserved,reserveUnitsForSide,clearReserveDeclarationsForSide,setReserveDeclaration});
}
window.OnoForgeReserveState=Object.freeze({createReserveStateController});
