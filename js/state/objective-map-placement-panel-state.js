function createObjectiveMapPlacementPanelStateController({getState,unitDisplayName,get,esc}){
  function objectiveMapPlacementPanelHtml(model){
    const state=getState();
    const units=[...(Array.isArray(state.my)?state.my:[]).filter(e=>e&&!e.attachedTo).map(e=>({side:'my',entry:e})),...(Array.isArray(state.opp)?state.opp:[]).filter(e=>e&&!e.attachedTo).map(e=>({side:'opp',entry:e}))];
    if(!model.verified||!units.length)return '';
    const selected=state.battlefieldMapPlacement||{};
    const options=units.map(({side,entry})=>{
      const name=unitDisplayName(side,entry)||get(entry.unitId)?.name||entry.name||entry.unitId||'Unit';
      const selectedNow=selected.side===side&&String(selected.uid)===String(entry.uid);
      return '<option value="'+esc(side+'|'+entry.uid)+'" '+(selectedNow?'selected':'')+'>'+esc((side==='my'?'My: ':'Opponent: ')+name)+'</option>';
    }).join('');
    const selectedEntry=selected.uid?units.find(x=>x.side===selected.side&&String(x.entry.uid)===String(selected.uid))?.entry:null;
    const selectedName=selectedEntry?unitDisplayName(selected.side,selectedEntry):'selected unit';
    return '<div class="objective-map-controls"><div class="split"><div><strong>Map Placement</strong><div class="tiny">Select a unit, then tap/click its new tabletop position on the map.</div></div><span class="pill">0.1″ coordinates</span></div><div class="objective-map-placement-row"><select class="objective-map-unit-select" aria-label="Unit to place on battlefield map"><option value="">Select unit…</option>'+options+'</select><button type="button" class="btn primary" data-map-placement-cancel '+(selected.uid?'':'disabled')+'>Cancel</button></div><div class="tiny objective-map-placement-status">'+(selected.uid?'Placement active — tap the map to set '+esc(selectedName)+' position.':'Placement inactive — no unit is selected.')+'</div></div>';
  }
  return Object.freeze({objectiveMapPlacementPanelHtml});
}
window.OnoForgeObjectiveMapPlacementPanelState=Object.freeze({createObjectiveMapPlacementPanelStateController});
