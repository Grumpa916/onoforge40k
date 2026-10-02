// One-time CI integrator for the deployment interaction seam.
// It edits the checked-out full index.html in GitHub Actions so the >1 MB monolith
// never has to pass through the chat file-transfer path.
const fs=require('fs');
const path='index.html';
let html=fs.readFileSync(path,'utf8');

function removeExactly(source, regex, label){
  const matches=source.match(regex);
  if(!matches || matches.length!==1) throw new Error(`${label}: expected exactly 1 match, found ${matches?matches.length:0}`);
  return source.replace(regex,'');
}

// Remove only the deployment/map interaction listeners now owned by deployment-interaction.js.
html=removeExactly(html,/document\.addEventListener\('toggle',function\(ev\)\{const panel=ev\.target\.closest\?\.\('\[data-live-deployment-panel\]'\);if\(panel\)\{state\.liveDeploymentPanelOpen=!!panel\.open;save\(\);\}\}\);\n?/,'live deployment toggle listener');
html=removeExactly(html,/document\.addEventListener\('change',function\(ev\)\{const transport=ev\.target\.closest\('\[data-transport-toggle\]'\);if\(transport\)\{setTransportEmbarkation\(transport\.dataset\.transportToggle,transport\.dataset\.transportUid,transport\.dataset\.passengerUid,transport\.checked\);return;\}const reserve=ev\.target\.closest\('\[data-reserve-toggle\]'\);if\(reserve\)\{setReserveDeclaration\(reserve\.dataset\.reserveToggle,reserve\.dataset\.reserveUid,reserve\.checked\);return;\}const sideSel=ev\.target\.closest\('\[data-deployment-side\]'\);if\(sideSel\)\{state\.deploymentTrackingSide=sideSel\.value==='opp'\?'opp':'my';delete state\.battlefieldMapPlacement;render\(\);return;\}const sel=ev\.target\.closest\('\.objective-map-unit-select'\);if\(!sel\)return;const mode=sel\.dataset\.mapMode==='setup'\?'setup':sel\.dataset\.mapMode==='deployment'\?'deployment':'battle',value=String\(sel\.value\|\|' '\);if\(mode==='setup'\)\{if\(!value\)\{delete state\.deploymentMapPlacement;render\(\);return;\}state\.deploymentMapPlacement=\{uid:value\};render\(\);return;\}if\(!value\)\{delete state\.battlefieldMapPlacement;render\(\);return;\}const \[side,uid\]=value\.split\('\|'\);if\(side&&uid\)state\.battlefieldMapPlacement=\{side,uid\};render\(\);\}\);\n?/,'deployment change listener');

// The live source has a stable deployment interaction block between objectiveMapDrag and the stratagem listener.
const interactionStart=html.indexOf('let objectiveMapDrag=null;');
const interactionEnd=html.indexOf("document.addEventListener('click',function(ev){\n  const sb=ev.target.closest('[data-stratagem-use]');",interactionStart);
if(interactionStart<0||interactionEnd<0||interactionEnd<=interactionStart) throw new Error('deployment pointer/click interaction block boundaries not found');
html=html.slice(0,interactionStart)+html.slice(interactionEnd);

const bridgeTag='<script src="./deployment-bridge.js"></script>';
if((html.match(new RegExp(bridgeTag.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length!==1) throw new Error('expected exactly one deployment bridge script tag');
html=html.replace(bridgeTag,bridgeTag+'\n<script src="./deployment-interaction.js"></script>');

const install=`\nwindow.OnoForgeDeploymentInteraction.install({\n  setLiveDeploymentPanelOpen:(open)=>{state.liveDeploymentPanelOpen=!!open;save();},\n  setDeploymentTrackingSide:(side)=>{state.deploymentTrackingSide=side==='opp'?'opp':'my';},\n  clearBattlefieldMapPlacement:()=>{delete state.battlefieldMapPlacement;},\n  setBattlefieldMapPlacement:(value)=>{state.battlefieldMapPlacement=value||undefined;},\n  getBattlefieldMapPlacement:()=>state.battlefieldMapPlacement,\n  setDeploymentMapPlacement:(value)=>{state.deploymentMapPlacement=value||undefined;},\n  getDeploymentMapPlacement:()=>state.deploymentMapPlacement,\n  clearDeploymentMapPlacement:()=>{delete state.deploymentMapPlacement;},\n  render,\n  deployReserveByMap,\n  isUnitReserved,\n  setDeploymentPlanPosition,\n  setBattlefieldUnitPosition,\n  clearBattlefieldUnitPosition,\n  clearDeploymentPlanPosition,\n  saveDeploymentPlan,\n  loadDeploymentPlan,\n  clearDeploymentPlanForCurrentMap,\n  setReserveDeclaration,\n  setTransportEmbarkation\n});\n`;
const close='</script>';
const idx=html.lastIndexOf(close);
if(idx<0)throw new Error('inline script close tag not found');
html=html.slice(0,idx)+install+html.slice(idx);

fs.writeFileSync(path,html);
console.log('Deployment interaction integration complete.');
console.log(`index.html bytes: ${Buffer.byteLength(html,'utf8')}`);
