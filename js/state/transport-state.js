function createTransportStateController({getState,entry,get,snapshotForUndo,event,save,render,unitDisplayName}){
  function ensureTransportEmbarkations(){
    const state=getState();
    if(!state.transportEmbarkations||typeof state.transportEmbarkations!=='object'||Array.isArray(state.transportEmbarkations))state.transportEmbarkations={my:{},opp:{}};
    if(!state.transportEmbarkations.my||typeof state.transportEmbarkations.my!=='object')state.transportEmbarkations.my={};
    if(!state.transportEmbarkations.opp||typeof state.transportEmbarkations.opp!=='object')state.transportEmbarkations.opp={};
    return state.transportEmbarkations;
  }
  function transportEntry(side,uid){
    const e=entry(side,uid),u=e?get(e.unitId):null;
    const keys=(u?.keywords||[]).map(k=>String(k||'').toUpperCase().trim());
    return e&&keys.includes('TRANSPORT')?e:null;
  }
  function isUnitEmbarked(side,uid){
    const s=side==='opp'?'opp':'my',id=String(uid||'');
    const map=ensureTransportEmbarkations()[s]||{};
    return Object.values(map).some(passengers=>Array.isArray(passengers)&&passengers.map(String).includes(id));
  }
  function transportPassengers(side,transportUid){
    const s=side==='opp'?'opp':'my',id=String(transportUid||'');
    const raw=ensureTransportEmbarkations()[s]?.[id];
    return Array.isArray(raw)?raw.slice():[];
  }
  function clearTransportEmbarkation(side,passengerUid){
    const s=side==='opp'?'opp':'my',id=String(passengerUid||''),maps=ensureTransportEmbarkations()[s]||{};
    Object.keys(maps).forEach(tid=>{
      maps[tid]=(Array.isArray(maps[tid])?maps[tid]:[]).filter(x=>String(x)!==id);
      if(!maps[tid].length)delete maps[tid];
    });
  }
  function setTransportEmbarkation(side,transportUid,passengerUid,embarked){
    const state=getState(),s=side==='opp'?'opp':'my',tid=String(transportUid||''),pid=String(passengerUid||'');
    if(!tid||!pid||state.page==='battle'||tid===pid)return false;
    const transport=transportEntry(s,tid),passenger=entry(s,pid);
    if(!transport||!passenger||passenger.attachedTo)return false;
    const passengerUnit=get(passenger.unitId),passengerKeywords=(passengerUnit?.keywords||[]).map(k=>String(k||'').toUpperCase().trim());
    if(passengerKeywords.includes('TRANSPORT'))return false;
    const before=snapshotForUndo(),maps=ensureTransportEmbarkations()[s];
    if(embarked){
      clearTransportEmbarkation(s,pid);
      maps[tid]=Array.isArray(maps[tid])?maps[tid]:[];
      if(!maps[tid].map(String).includes(pid))maps[tid].push(pid);
      if(state.battlefieldUnitPositions)delete state.battlefieldUnitPositions[pid];
      event('TRANSPORT_EMBARKED',{side:s,transportUid:tid,passengerUid:pid,transport:unitDisplayName(s,transport)||get(transport.unitId)?.name||'Transport',passenger:unitDisplayName(s,passenger)||get(passenger.unitId)?.name||'Unit',action:'Unit declared embarked in transport'},before);
    }else{
      maps[tid]=(Array.isArray(maps[tid])?maps[tid]:[]).filter(x=>String(x)!==pid);
      if(!maps[tid].length)delete maps[tid];
      event('TRANSPORT_DISEMBARKED',{side:s,transportUid:tid,passengerUid:pid,action:'Unit removed from transport declaration'},before);
    }
    save();render();return true;
  }
  return Object.freeze({ensureTransportEmbarkations,transportEntry,isUnitEmbarked,transportPassengers,clearTransportEmbarkation,setTransportEmbarkation});
}
window.OnoForgeTransportState=Object.freeze({createTransportStateController});
