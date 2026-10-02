// OnoForge 40K — deployment interaction seam
// Owns deployment/map-specific DOM event delegation. Application state remains owned by index.html.
(function(){
  function install(api){
    if(!api || api.__installed)return;
    api.__installed=true;
    let objectiveMapDrag=null;

    document.addEventListener('toggle',function(ev){
      const panel=ev.target.closest?.('[data-live-deployment-panel]');
      if(panel)api.setLiveDeploymentPanelOpen(!!panel.open);
    });

    document.addEventListener('change',function(ev){
      const sideSel=ev.target.closest('[data-deployment-side]');
      if(sideSel){
        ev.preventDefault();
        api.setDeploymentTrackingSide(sideSel.value==='opp'?'opp':'my');
        api.clearBattlefieldMapPlacement();
        api.render();
        return;
      }
      const sel=ev.target.closest('.objective-map-unit-select');
      if(!sel)return;
      const mode=sel.dataset.mapMode==='setup'?'setup':sel.dataset.mapMode==='deployment'?'deployment':'battle';
      const value=String(sel.value||'');
      if(mode==='setup'){
        api.setDeploymentMapPlacement(value?{uid:value}:null);
        api.render();
        return;
      }
      if(!value){api.clearBattlefieldMapPlacement();api.render();return;}
      const [side,uid]=value.split('|');
      if(side&&uid)api.setBattlefieldMapPlacement({side,uid});
      api.render();
    });

    document.addEventListener('pointerdown',function(ev){
      const reserve=ev.target.closest('[data-reserve-unit]');
      if(reserve&&!ev.target.closest('[data-reserve-select]')){
        ev.preventDefault();ev.stopPropagation();
        objectiveMapDrag={node:reserve,canvas:null,mode:'reserve',side:reserve.dataset.reserveSide,uid:reserve.dataset.reserveUid,pointerId:ev.pointerId};
        reserve.classList.add('dragging');reserve.setPointerCapture?.(ev.pointerId);return;
      }
      const node=ev.target.closest('[data-map-unit],[data-map-plan-unit]');
      if(!node)return;
      const canvas=node.closest('[data-objective-map-canvas]');if(!canvas)return;
      ev.preventDefault();ev.stopPropagation();
      const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
      const mapMode=canvas.dataset.objectiveMapMode==='setup'?'setup':canvas.dataset.objectiveMapMode==='deployment'?'deployment':'battle';
      objectiveMapDrag={node,canvas,mode:node.hasAttribute('data-map-plan-unit')?'setup':mapMode,side:node.dataset.mapSide,uid:node.dataset.mapUid,pointerId:ev.pointerId};
      node.classList.add('dragging');node.setPointerCapture?.(ev.pointerId);
    });

    document.addEventListener('pointermove',function(ev){
      const d=objectiveMapDrag;if(!d||d.pointerId!==ev.pointerId)return;ev.preventDefault();
      if(d.mode==='reserve')return;
      const rect=d.canvas?.getBoundingClientRect();if(!rect)return;
      const x=Math.max(0,Math.min(60,((ev.clientX-rect.left)/rect.width)*60));
      const y=Math.max(0,Math.min(44,(1-(ev.clientY-rect.top)/rect.height)*44));
      d.node.style.left=(x/60*100)+'%';d.node.style.top=((44-y)/44*100)+'%';
    });

    document.addEventListener('pointerup',function(ev){
      const d=objectiveMapDrag;if(!d||d.pointerId!==ev.pointerId)return;
      if(d.mode==='reserve'){
        const target=document.elementFromPoint(ev.clientX,ev.clientY)?.closest?.('[data-objective-map-canvas]');
        d.node.classList.remove('dragging');objectiveMapDrag=null;
        if(target){const rect=target.getBoundingClientRect();const x=Math.max(0,Math.min(60,((ev.clientX-rect.left)/rect.width)*60));const y=Math.max(0,Math.min(44,(1-(ev.clientY-rect.top)/rect.height)*44));api.deployReserveByMap(d.side,d.uid,x,y);}return;
      }
      const rect=d.canvas.getBoundingClientRect();
      const x=Math.max(0,Math.min(60,((ev.clientX-rect.left)/rect.width)*60));
      const y=Math.max(0,Math.min(44,(1-(ev.clientY-rect.top)/rect.height)*44));
      d.node.classList.remove('dragging');objectiveMapDrag=null;
      if(d.mode==='setup')api.setDeploymentPlanPosition(d.uid,x,y);
      else if(d.mode==='deployment')api.setBattlefieldUnitPosition(d.side,d.uid,x,y,'deployment');
      else api.setBattlefieldUnitPosition(d.side,d.uid,x,y,'movement');
    });

    document.addEventListener('pointercancel',function(ev){
      if(objectiveMapDrag?.pointerId===ev.pointerId){objectiveMapDrag.node.classList.remove('dragging');objectiveMapDrag=null;}
    });

    document.addEventListener('click',function(ev){
      const b=ev.target.closest('[data-reserve-select]');
      if(b){ev.preventDefault();ev.stopPropagation();const parts=String(b.dataset.reserveSelect||'').split('|');if(parts.length===2&&api.isUnitReserved(parts[0],parts[1])){api.setBattlefieldMapPlacement({side:parts[0],uid:parts[1]});api.render();}return;}
      const cancel=ev.target.closest('[data-map-placement-cancel]');
      if(cancel){ev.preventDefault();api.clearBattlefieldMapPlacement();api.render();return;}
      const dc=ev.target.closest('[data-deployment-placement-cancel]');
      if(dc){ev.preventDefault();api.clearDeploymentMapPlacement();api.render();return;}
      const canvas=ev.target.closest('[data-objective-map-canvas]');
      if(!canvas||ev.target.closest('[data-map-unit],[data-map-plan-unit],[data-map-objective]'))return;
      const mode=canvas.dataset.objectiveMapMode==='setup'?'setup':canvas.dataset.objectiveMapMode==='deployment'?'deployment':'battle';
      const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
      const x=Math.max(0,Math.min(60,((ev.clientX-rect.left)/rect.width)*60));
      const y=Math.max(0,Math.min(44,(1-(ev.clientY-rect.top)/rect.height)*44));
      if(mode==='setup'){
        const uid=api.getDeploymentMapPlacement()?.uid;if(uid&&api.setDeploymentPlanPosition(uid,x,y)){api.clearDeploymentMapPlacement();api.render();}return;
      }
      const placement=api.getBattlefieldMapPlacement();
      if(placement?.side&&placement?.uid){
        if(api.isUnitReserved(placement.side,placement.uid)){if(api.deployReserveByMap(placement.side,placement.uid,x,y))return;}
        else if(api.setBattlefieldUnitPosition(placement.side,placement.uid,x,y,mode==='deployment'?'deployment':'manual')){api.clearBattlefieldMapPlacement();api.render();}
      }
    });

    document.addEventListener('click',function(ev){
      const bc=ev.target.closest('[data-battlefield-clear]');
      if(bc){ev.preventDefault();ev.stopPropagation();api.clearBattlefieldUnitPosition(bc.dataset.battlefieldClear);return;}
      const bp=ev.target.closest('[data-battlefield-save]');
      if(bp){ev.preventDefault();ev.stopPropagation();const side=bp.dataset.battlefieldSave,uid=bp.dataset.battlefieldUid,x=document.querySelector('[data-battlefield-x="'+side+'"][data-battlefield-uid="'+uid+'"]')?.value,y=document.querySelector('[data-battlefield-y="'+side+'"][data-battlefield-uid="'+uid+'"]')?.value;api.setBattlefieldUnitPosition(side,uid,x,y);return;}
      const dp=ev.target.closest('[data-deployment-save]');
      if(dp){ev.preventDefault();ev.stopPropagation();const uid=dp.dataset.deploymentSave,x=document.querySelector('[data-deployment-x="'+uid+'"]')?.value,y=document.querySelector('[data-deployment-y="'+uid+'"]')?.value;api.setDeploymentPlanPosition(uid,x,y);return;}
      const dclear=ev.target.closest('[data-deployment-clear]');
      if(dclear){ev.preventDefault();ev.stopPropagation();api.clearDeploymentPlanPosition(dclear.dataset.deploymentClear);return;}
      if(ev.target.closest('[data-deployment-save-plan]')){ev.preventDefault();api.saveDeploymentPlan();return;}
      if(ev.target.closest('[data-deployment-load-plan]')){ev.preventDefault();api.loadDeploymentPlan();return;}
      if(ev.target.closest('[data-deployment-clear-plan]')){ev.preventDefault();api.clearDeploymentPlanForCurrentMap();return;}
    });
  }

  window.OnoForgeDeploymentInteraction={install};
})();
