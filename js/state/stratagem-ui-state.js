(function(global){
  function createStratagemUIStateController(deps={}){
    const {getState,ensureStratagemState,armyStratagemDetachment,stratagemUsedThisPhase,stratagemCP,esc,uid}=deps;
    const STRATAGEM_PHASE_ORDER_11E=['Command','Movement','Shooting','Charge','Fight','Any Phase'];
    function stratagemPhaseRank(phase){
     const p=String(phase||'Any Phase').trim();
     const i=STRATAGEM_PHASE_ORDER_11E.indexOf(p);
     return i<0?STRATAGEM_PHASE_ORDER_11E.length:i;
    }
    function stratagemPhaseGroups(arr,side){
     const state=getState();
     const current=String(state.phase||'Command').trim();
     const isAvailable=s=>{
      const phase=String(s?.phase||'Any Phase').trim();
      return (phase===current||phase==='Any Phase')&&!stratagemUsedThisPhase(side,s?.name);
     };
     const availabilityRank=s=>{
      if(isAvailable(s))return 0;
      if(String(s?.phase||'Any Phase').trim()===current||String(s?.phase||'Any Phase').trim()==='Any Phase')return 1;
      return 2;
     };
     const sorted=(Array.isArray(arr)?arr:[]).map((s,i)=>({s,i}))
       .sort((a,b)=>
         availabilityRank(a.s)-availabilityRank(b.s)||
         stratagemPhaseRank(a.s.phase)-stratagemPhaseRank(b.s.phase)||
         String(a.s.name||'').localeCompare(String(b.s.name||''))
       );
     const groups=[];
     sorted.forEach(item=>{
      const phase=String(item.s.phase||'Any Phase');
      let group=groups.find(g=>g.phase===phase);
      if(!group){group={phase,items:[]};groups.push(group)}
      group.items.push(item);
     });
     return groups;
    }
    function stratagemsUI(){
     ensureStratagemState();
     const state=getState();
     ensureStratagemState();
     const CORE=[
      {name:'Command Re-roll',cp:1,phase:'Any Phase',summary:'Re-roll one eligible roll.'},
      {name:'Epic Challenge',cp:1,phase:'Fight',summary:'A CHARACTER gains Precision for the phase.'},
      {name:'Insane Bravery',cp:1,phase:'Command',summary:'Automatically pass a Battle-shock test. Once per battle.'},
      {name:'Explosives',cp:1,phase:'Shooting',summary:'An eligible unit can use explosives against a nearby enemy.'},
      {name:'Crushing Impact',cp:1,phase:'Charge',summary:'A MONSTER/VEHICLE can inflict mortal wounds after charging.'},
      {name:'Rapid Ingress',cp:1,phase:'Movement',summary:'Bring a Strategic Reserves unit onto the battlefield at the end of the opponent’s Movement phase.'},
      {name:'Fire Overwatch',cp:1,phase:'Movement',summary:'An eligible unit can shoot using Snap Shooting.'},
      {name:'Smokescreen',cp:1,phase:'Shooting',summary:'A SMOKE unit gains Benefit of Cover for the phase.'},
      {name:'Heroic Intervention',cp:1,phase:'Charge',summary:'An eligible nearby unit can resolve a charge.'},
      {name:'Counteroffensive',cp:2,phase:'Fight',summary:'An eligible friendly unit fights next after an enemy unit fights.'}
     ];
     const INVASION=[
      {name:'Predatory Imperative',cp:1,phase:'Any Phase',summary:'Use an Invasion Fleet adaptive rule.'},
      {name:'Endless Swarm',cp:1,phase:'Any Phase',summary:'Return models to an eligible Tyranids unit.'},
      {name:'Adrenal Surge',cp:2,phase:'Fight',summary:'Improve the combat output of an eligible Tyranids unit.'},
      {name:'Rapid Regeneration',cp:1,phase:'Any Phase',summary:'Restore wounds to an eligible Tyranids unit.'},
      {name:'Death Frenzy',cp:1,phase:'Fight',summary:'Allow a destroyed Tyranids unit to fight back.'},
      {name:'Overrun',cp:1,phase:'Fight',summary:'Allow an eligible Tyranids unit to make a post-fight move.'}
     ];
     const catalogFor=(side)=>{
      const det=armyStratagemDetachment(side);
      const army=(side==='my' && det==='Tyranids — Invasion Fleet')?INVASION:[];
      return {
       det,
       army:army.map(s=>({...s,source:'Detachment',detachment:det})),
       core:CORE.map(s=>({...s,source:'Core'}))
      };
     };
     const army=(side,title)=>{
      const key=side==='my'?'stratagemsMy':'stratagemsOpp';
      const cat=catalogFor(side);
      const all=[...cat.army,...cat.core].map((s,i)=>({
       ...s,
       id:state[key]?.[i]?.id||uid(),
       used:!!state[key]?.[i]?.used
      }));
      state[key]=all;
      const renderType=(items,label,kind)=>{
       const groups=stratagemPhaseGroups(items,side);
       if(!items.length) return '<div class="stratagem-type-section"><div class="stratagem-type-heading '+kind+'">'+esc(label)+'</div><div class="muted small" style="padding:8px">No army-specific stratagems loaded for this detachment.</div></div>';
       return '<div class="stratagem-type-section"><div style="margin-top:5px">'+groups.map(g=>'<div class="stratagem-phase-group"><div class="stratagem-phase-heading">'+esc(g.phase==='Any Phase'?'Any Phase':g.phase+' Phase')+'</div>'+g.items.map(({s,i})=>'<details class="card stratagem-item" style="padding:0;margin-top:2px"><summary style="list-style:none;cursor:pointer;padding:3px 8px;user-select:none;margin:0"><div class="row" style="justify-content:space-between;align-items:center"><b>'+esc(s.name)+'</b><button class="pill stratagem-cp-btn '+(stratagemUsedThisPhase(side,s.name)?'stratagem-cp-used':'')+'" type="button" aria-pressed="'+(stratagemUsedThisPhase(side,s.name)?'true':'false')+'" data-stratagem-use="1" data-stratagem-side="'+side+'" data-stratagem-name="'+esc(s.name)+'" title="'+(stratagemUsedThisPhase(side,s.name)?'Stratagem already used this phase':'Use stratagem — '+stratagemCP(s)+' CP')+'">'+(stratagemUsedThisPhase(side,s.name)?'✓ ':'')+stratagemCP(s)+' CP</button></div></summary><div style="padding:0 8px 8px"><div class="muted small">'+esc(s.source)+(s.detachment?' · '+esc(s.detachment):'')+' · '+esc(s.phase)+'</div><div class="small" style="margin-top:4px">'+esc(s.summary||'')+'</div></div></details>').join('')+'</div>').join('')+'</div></div>';
      };
      return '<div class="card" style="padding:12px"><div class="muted small">'+esc(title)+'</div><div style="margin-top:4px"><b>Detachment: '+esc(cat.det||'None selected')+'</b></div>'+renderType(cat.army,'Army Stratagems','army')+renderType(cat.core,'Core Stratagems','core')+'</div>';
     };
     return '<details class="card" '+(state.stratagemsOpen===true?'open':'')+' ontoggle="state.stratagemsOpen=this.open;save()"><summary class="sectionTitle">Stratagems <span class="pill">11th Edition</span></summary><div class="muted small" style="margin-top:8px">Army and Core stratagems, grouped by phase.</div><div class="grid two" style="margin-top:10px">'+army('my','My Army')+army('opp','Opponent Army')+'</div></details>';
    }
    
    return Object.freeze({stratagemPhaseRank,stratagemPhaseGroups,stratagemsUI});
  }
  global.OnoForgeStratagemUIState=Object.freeze({createStratagemUIStateController});
})(window);
