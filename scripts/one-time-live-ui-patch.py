from pathlib import Path
import re

p = Path("index.html")
s = p.read_text(encoding="utf-8")
original_len = len(s)

# 1) Deployment: replace the pale staging grid with draggable side rails in No Man's Land.
old = "const ghostNodes=mode==='setup'?objectiveMapPlanGhostNodesHtml(model,pct):mode==='deployment'?(objectiveMapPlanGhostNodesHtml(model,pct)+deploymentStagingNodesHtml(model,pct,state.deploymentTrackingSide==='opp'?'opp':'my')):''"
new = "const ghostNodes=mode==='setup'?objectiveMapPlanGhostNodesHtml(model,pct):mode==='deployment'?armyNoMansLandTagsHtml(model,pct):''"
if old not in s:
    raise SystemExit("deployment ghost-node expression not found")
s = s.replace(old, new, 1)

# 2) Add the No Man's Land unit rails immediately before the terrain renderer.
anchor = "function terrainReferenceImageHtml(model){"
helper = r'''
function armyNoMansLandTagsHtml(model,pct){
  if(!model.verified)return '';
  const rail=(side)=>{
    const entries=(Array.isArray(state?.[side])?state[side]:[]).filter(e=>e&&!e.attachedTo&&!isUnitReserved(side,e.uid));
    if(!entries.length)return '';
    const skipped=state.deploymentSkippedUnits&&typeof state.deploymentSkippedUnits==='object'?state.deploymentSkippedUnits:{};
    const title=side==='my'?(state.myName||'My Army'):(state.oppName||'Opponent Army');
    const tags=entries.map(entry=>{
      const key=side+'|'+entry.uid, isSkipped=!!skipped[key], live=!!battlefieldUnitPosition(side,entry.uid,'deployment');
      if(live)return '';
      const name=unitDisplayName(side,entry)||get(entry.unitId)?.name||entry.name||entry.unitId||'Unit';
      const attrs=isSkipped?' class="objective-map-army-tag skipped" title="Skipped — not deployed"':' class="objective-map-army-tag" data-map-unit="'+esc(side+'|'+entry.uid)+'" data-map-side="'+esc(side)+'" data-map-uid="'+esc(entry.uid)+'" title="Not yet deployed • drag to actual tabletop position"';
      return '<div'+attrs+'>'+esc(name)+'</div>';
    }).join('');
    if(!tags)return '';
    return '<div class="objective-map-army-rail '+side+'" aria-label="'+esc(title)+' unplaced units"><div class="objective-map-army-rail-title">'+esc(title)+'</div>'+tags+'</div>';
  };
  return rail('my')+rail('opp');
}

'''
if anchor not in s:
    raise SystemExit("terrain renderer anchor not found")
s = s.replace(anchor, helper + anchor, 1)

# 3) Styling: side rails are deliberately placed left/right inside No Man's Land.
style_anchor = "</style>"
css = r'''
.objective-map-army-rail{position:absolute;z-index:6;top:34%;width:18%;max-height:32%;overflow:auto;display:flex;flex-direction:column;gap:3px;padding:4px;border:1px solid rgba(90,120,150,.55);border-radius:7px;background:rgba(8,15,24,.72);backdrop-filter:blur(2px)}
.objective-map-army-rail.my{left:17%}.objective-map-army-rail.opp{right:17%}
.objective-map-army-rail-title{font-size:8px;font-weight:800;letter-spacing:.04em;color:#dbeafe;padding:2px 3px;border-bottom:1px solid rgba(100,130,160,.35);margin-bottom:1px}
.objective-map-army-tag{display:block;padding:2px 4px;border:1px solid #3f6685;border-radius:4px;background:#102033;color:#f2f7fb;font-size:8px;font-weight:800;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:grab;user-select:none}
.objective-map-army-tag.skipped{opacity:.72;color:#aebdcc;border-style:dashed;cursor:default}
.objective-map-army-tag:active{cursor:grabbing}
.objective-map-plan-ghost.staging{opacity:1;color:#f2f7fb;background:#102033;border-color:#3f6685}
'''
if css.strip() not in s:
    s = s.replace(style_anchor, css + style_anchor, 1)

# 4) Objective Control: show the exact map O# label beside the tracked objective.
obj_helper_anchor = "function objectiveControlHtml("
obj_helper = r'''
function objectiveMapLabelForTrackedName(name){
  try{
    const model=objectiveMapModel('battle');
    const target=objectivePositionFor(name);
    const tx=Number(target?.x),ty=Number(target?.y);
    let idx=-1;
    if(Number.isFinite(tx)&&Number.isFinite(ty)){
      idx=model.objectives.findIndex(o=>{
        const x=Number(o?.position?.x),y=Number(o?.position?.y);
        return Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-tx)<0.05&&Math.abs(y-ty)<0.05;
      });
    }
    if(idx<0)idx=model.objectives.findIndex(o=>String(o?.name||'')===String(name||''));
    if(idx<0)return String(name||'');
    const mapObj=model.objectives[idx];
    return 'O'+(idx+1)+' • '+objectiveRoleLabel(objectiveRole(mapObj.name),mapObj.name);
  }catch(e){return String(name||'');}
}

'''
if obj_helper_anchor not in s:
    raise SystemExit("objective control function anchor not found")
if "function objectiveMapLabelForTrackedName" not in s:
    s = s.replace(obj_helper_anchor, obj_helper + obj_helper_anchor, 1)

old_label = '<div class="objective-control-row"><div class="objective-control-name"><b>'+esc(name)+'</b><span class="tiny">Start: '
new_label = '<div class="objective-control-row"><div class="objective-control-name"><b>'+esc(objectiveMapLabelForTrackedName(name))+'</b><span class="tiny">Tracked: '+esc(name)+' • Start: '
if old_label not in s:
    raise SystemExit("objective control name template not found")
s = s.replace(old_label, new_label, 1)

# 5) Deployment status: distinguish not-recorded from explicitly skipped units.
status_anchor = "function deploymentStatusHtml("
status_idx = s.find(status_anchor)
if status_idx < 0:
    raise SystemExit("deploymentStatusHtml not found")
brace = s.find("{", status_idx)
depth = 0
end = None
for i in range(brace, len(s)):
    if s[i] == "{":
        depth += 1
    elif s[i] == "}":
        depth -= 1
        if depth == 0:
            end = i + 1
            break
if end is None:
    raise SystemExit("could not parse deploymentStatusHtml")
status_fn = r'''
function deploymentStatusHtml(model){
  const side=state.deploymentTrackingSide==='opp'?'opp':'my';
  const entries=(Array.isArray(state?.[side])?state[side]:[]).filter(e=>e&&!e.attachedTo&&!isUnitReserved(side,e.uid));
  const skipped=state.deploymentSkippedUnits&&typeof state.deploymentSkippedUnits==='object'?state.deploymentSkippedUnits:{};
  const recorded=entries.filter(e=>!!battlefieldUnitPosition(side,e.uid,'deployment')).length;
  const skippedEntries=entries.filter(e=>!!skipped[side+'|'+e.uid]&&!battlefieldUnitPosition(side,e.uid,'deployment'));
  const missing=entries.filter(e=>!battlefieldUnitPosition(side,e.uid,'deployment')&&!skipped[side+'|'+e.uid]);
  const complete=missing.length===0;
  const missingText=missing.map(e=>{
    const name=unitDisplayName(side,e)||get(e.unitId)?.name||e.name||e.unitId||'Unit';
    return '<span>'+esc(name)+' — position not recorded</span><button type="button" class="btn" data-deployment-skip="1" data-deployment-skip-side="'+side+'" data-deployment-skip-uid="'+esc(e.uid)+'">Skip</button>';
  }).join('');
  const skippedText=skippedEntries.map(e=>{
    const name=unitDisplayName(side,e)||get(e.unitId)?.name||e.name||e.unitId||'Unit';
    return '<span>'+esc(name)+' — skipped / not deployed</span><button type="button" class="btn" data-deployment-unskip="1" data-deployment-skip-side="'+side+'" data-deployment-skip-uid="'+esc(e.uid)+'">Undo Skip</button>';
  }).join('');
  return '<div class="card deployment-status-card"><div class="split"><div><h3 style="margin:0">Deployment Status</h3><div class="tiny">Track actual placement for '+esc(side==='my'?(state.myName||'My Army'):(state.oppName||'Opponent Army'))+'. Reserved and embarked units are excluded.</div></div><span class="pill '+(complete?'ok':'warn')+'">'+(complete?'Deployment complete':'Deployment incomplete')+'</span></div><div class="tiny" style="margin-top:7px">Recorded '+recorded+' / '+entries.length+' • Skipped '+skippedEntries.length+(missing.length?' • Still to place '+missing.length:'')+'</div>'+(missingText?'<div class="deployment-missing-list" style="margin-top:7px">'+missingText+'</div>':'')+(skippedText?'<div class="deployment-skipped-list" style="margin-top:7px">'+skippedText+'</div>':'')+(complete&&!skippedEntries.length?'<div class="ok" style="margin-top:7px">All eligible units are recorded on the deployment map.</div>':'')+'</div>';
}
'''
s = s[:status_idx] + status_fn + s[end:]

# 6) Normalize unit names such as "Termagants α" / "Norn Emissary β" against the supplemental data.
ref_anchor = "function gameUnitReferenceData("
ref_idx = s.find(ref_anchor)
if ref_idx < 0:
    raise SystemExit("gameUnitReferenceData not found")
brace = s.find("{", ref_idx)
depth = 0
ref_end = None
for i in range(brace, len(s)):
    if s[i] == "{":
        depth += 1
    elif s[i] == "}":
        depth -= 1
        if depth == 0:
            ref_end = i + 1
            break
if ref_end is None:
    raise SystemExit("could not parse gameUnitReferenceData")
ref_wrap = r'''
const __onoforgeGameUnitReferenceDataOriginal=gameUnitReferenceData;
function gameUnitReferenceData(u){
  const base=__onoforgeGameUnitReferenceDataOriginal(u)||{};
  const rawNames=[
    u?.name,
    u?.displayName,
    u?.unitName,
    (typeof unitDisplayName==='function'?unitDisplayName('my',u):''),
    (typeof get==='function'?get(u?.unitId)?.name:'')
  ].filter(Boolean).map(String);
  const normalized=[];
  rawNames.forEach(n=>{
    normalized.push(n);
    normalized.push(n.replace(/\s+(?:[A-Z]|[α-ωΑ-Ω])$/u,'').trim());
    normalized.push(n.replace(/\s+(?:[A-Z]|[α-ωΑ-Ω])$/u,'').trim());
  });
  let supplemental=null;
  for(const n of normalized){
    if(ONOFORGE_40K_APP_CROSSCHECK[n]){supplemental=ONOFORGE_40K_APP_CROSSCHECK[n];break;}
  }
  if(!supplemental)return base;
  const profile={...(supplemental.profile||{}),...(base.profile||{})};
  const abilities=[...(base.abilities||[])];
  for(const a of (supplemental.abilities||[])){
    if(!abilities.some(x=>String(x?.name||'').toLowerCase()===String(a?.name||'').toLowerCase()))abilities.push(a);
  }
  const missingWarning=Object.values({M:profile.M,T:profile.T,Sv:profile.Sv,W:profile.W,Ld:profile.Ld,OC:profile.OC}).some(v=>v===undefined||v===null||v===''||v==='—');
  return {...base,profile,abilities,warning:missingWarning?'Some star characteristics are not present in the available reference sources.':base.warning};
}
'''
s = s[:ref_idx] + ref_wrap + s[ref_end:]

# 7) Secondary scoring: fixed yes/no conditions get a single Record button, not a numeric input.
sec_anchor = "function secondaryDetailHtml("
sec_idx = s.find(sec_anchor)
if sec_idx < 0:
    raise SystemExit("secondaryDetailHtml not found")
brace = s.find("{", sec_idx)
depth = 0
sec_end = None
for i in range(brace, len(s)):
    if s[i] == "{":
        depth += 1
    elif s[i] == "}":
        depth -= 1
        if depth == 0:
            sec_end = i + 1
            break
if sec_end is None:
    raise SystemExit("could not parse secondaryDetailHtml")
sec_fn = r'''
function secondaryDetailHtml(side){
  const active=secState(side);
  if(!active.length)return '';
  const mode=side==='my'?state.secondaryMy:state.secondaryOpp;
  const modeKey=mode==='fixed'?'Fixed':'Tactical';
  const totalVP=secondaryTotalScoredVP(side),roundVP=secondaryRoundScoredVP(side);
  const rows=active.map(name=>{
    const card=secondaryByName(name);
    const data=SECONDARY_SCORING[name]||SECONDARY_SCORING[card?.name]||null;
    const items=data?.[modeKey]||[];
    const scoredVP=Number((side==='my'?state.secondaryMyScoredVP:state.secondaryOppScoredVP)?.[name])||0;
    const first=items[0];
    const firstVP=Number(String(first?.[0]||'').match(/\d+/)?.[0]||0);
    const firstCondition=String(first?.[1]||'');
    const endOfBattle=/end of battle/i.test(firstCondition);
    const booleanFixed=items.length===1 && Number.isFinite(firstVP) && firstVP>0 && !/\b(?:up to|per|for each|each|every|additional|more than|fewer than|choose|select|depending|based on)\b/i.test(firstCondition);
    const disabled=endOfBattle&&!state.battleEnded?' disabled':'';
    const detailPlan=secondaryPersonalPlanHtml(name);
    const quick=first?(
      booleanFixed
        ? '<div class="secondary-compact-quick"><span class="secondary-vp">'+esc(String(first[0]))+'</span><span class="secondary-quick-condition">'+esc(firstCondition)+(endOfBattle?' <span class="secondary-row-timing">END OF BATTLE</span>':'')+'</span><button type="button" class="btn primary" data-secondary-row-score="1" data-secondary-row-score-side="'+side+'" data-secondary-row-score-name="'+esc(name)+'" data-secondary-row-score-index="0"'+disabled+'>Record '+esc(String(first[0]))+'</button></div>'
        : '<div class="secondary-compact-quick"><span class="secondary-vp">'+esc(String(first[0]))+'</span><span class="secondary-quick-condition">'+esc(firstCondition)+(endOfBattle?' <span class="secondary-row-timing">END OF BATTLE</span>':'')+'</span><input type="number" min="1" max="20" step="1" value="'+firstVP+'" id="'+secondaryRowInputId(side,name,0)+'-quick" aria-label="Quick VP for '+esc(name)+'"><button type="button" class="btn primary" data-secondary-row-score="1" data-secondary-row-score-side="'+side+'" data-secondary-row-score-name="'+esc(name)+'" data-secondary-row-score-index="0"'+disabled+'>Record</button></div>'
    ):'';
    const fullRules=items.map((row,index)=>{
      const vpText=String(row?.[0]||''),condition=String(row?.[1]||''),end=/end of battle/i.test(condition),fallback=Number(vpText.match(/\d+/)?.[0]||0),bool=items.length===1 && booleanFixed;
      const dis=end&&!state.battleEnded?' disabled':'';
      return '<div class="secondary-compact-detail-row"><div><b>'+esc(vpText)+'</b> <span>'+esc(condition)+'</span>'+(end?'<span class="secondary-row-timing">END OF BATTLE</span>':'')+'</div><div class="secondary-row-action">'+(bool?'<button type="button" class="btn primary" data-secondary-row-score="1" data-secondary-row-score-side="'+side+'" data-secondary-row-score-name="'+esc(name)+'" data-secondary-row-score-index="'+index+'"'+dis+'>Record '+esc(vpText)+'</button>':'<input type="number" min="1" max="20" step="1" value="'+fallback+'" id="'+secondaryRowInputId(side,name,index)+'" aria-label="VP to score for '+esc(name)+' condition '+(index+1)+'"><button type="button" class="btn primary" data-secondary-row-score="1" data-secondary-row-score-side="'+side+'" data-secondary-row-score-name="'+esc(name)+'" data-secondary-row-score-index="'+index+'"'+dis+'>Record</button>')+'</div></div>';
    }).join('');
    return '<div class="secondary-compact-selected-row"><div class="secondary-compact-selected-head"><div><span class="secondary-selected-check">✓</span><strong>'+esc(name)+'</strong><span class="muted small"> '+esc(card?.type||'Secondary Mission')+'</span></div><div class="secondary-compact-status">'+(scoredVP?'Scored '+scoredVP+' VP':'0 VP')+'</div></div>'+quick+'<details class="secondary-compact-details"><summary>Details'+(detailPlan?' / Plan':'')+' ▾</summary><div class="secondary-compact-description">'+(items.length?esc(firstCondition):'No scoring details available.')+'</div>'+(fullRules?'<div class="secondary-compact-full-rules">'+fullRules+'</div>':'')+(detailPlan?'<div class="secondary-compact-plan">'+detailPlan+'</div>':'')+'<div class="secondary-compact-limits">Round '+roundVP+' / 15 VP • Battle '+totalVP+' / 45 VP</div></details></div>';
  }).join('');
  return '<div class="secondary-selected-section"><div class="secondary-selected-section-head"><strong>SELECTED MISSIONS</strong><span>'+roundVP+' / 15 this round • '+totalVP+' / 45 total</span></div>'+rows+'<div class="secondary-compact-rule-note">15 VP per battle round • 45 VP total</div></div>';
}
'''
s = s[:sec_idx] + sec_fn + s[sec_end:]

# 8) Runtime skip tracking + clear a skip if the unit is subsequently placed.
runtime_anchor = "</body>"
runtime = r'''
<script>
(function(){
  state.deploymentSkippedUnits=state.deploymentSkippedUnits&&typeof state.deploymentSkippedUnits==='object'?state.deploymentSkippedUnits:{};
  const originalSet=window.setBattlefieldUnitPosition;
  if(typeof originalSet==='function' && !window.__onoforgeWrappedDeploymentPosition){
    window.__onoforgeWrappedDeploymentPosition=function(){
      const side=arguments[0],uid=arguments[1];
      const result=originalSet.apply(this,arguments);
      if(state.deploymentSkippedUnits)delete state.deploymentSkippedUnits[String(side)+'|'+String(uid)];
      return result;
    };
    window.setBattlefieldUnitPosition=window.__onoforgeWrappedDeploymentPosition;
  }
  if(!window.__onoforgeDeploymentSkipHandlers){
    window.__onoforgeDeploymentSkipHandlers=true;
    document.addEventListener('click',function(ev){
      const skip=ev.target.closest('[data-deployment-skip]');
      const undo=ev.target.closest('[data-deployment-unskip]');
      if(!skip&&!undo)return;
      const el=skip||undo,side=el.getAttribute('data-deployment-skip-side'),uid=el.getAttribute('data-deployment-skip-uid');
      if(!side||!uid)return;
      state.deploymentSkippedUnits=state.deploymentSkippedUnits&&typeof state.deploymentSkippedUnits==='object'?state.deploymentSkippedUnits:{};
      const key=String(side)+'|'+String(uid);
      if(skip)state.deploymentSkippedUnits[key]=true;else delete state.deploymentSkippedUnits[key];
      save();render();
    });
  }
})();
</script>
'''
s = s.replace(runtime_anchor, runtime + runtime_anchor, 1)

# 9) Seed the new state field on the existing state object.
if "deploymentSkippedUnits" not in s[s.find("let state="):s.find("let state=")+5000]:
    s = s.replace("battlefieldUnitPositions:{", "deploymentSkippedUnits:{},battlefieldUnitPositions:{", 1) if "battlefieldUnitPositions:{" in s else s
# If the state shape is initialized elsewhere, runtime initialization above still handles old saves.

# 10) Remove the one-time helper files after this patch has been applied.
Path(".github/workflows/one-time-live-ui-followup-patch.yml").unlink(missing_ok=True)
p.unlink()

if len(s)==original_len:
    raise SystemExit("patch made no changes")
p.write_text(s, encoding="utf-8")
print("patched index.html", original_len, "->", len(s))
