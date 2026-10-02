// One-time CI integrator for the deployment interaction seam.
const fs=require('fs');
const path='index.html';
let html=fs.readFileSync(path,'utf8');

function removeExactly(source, regex, label){
  const matches=source.match(regex);
  if(!matches || matches.length!==1) throw new Error(`${label}: expected exactly 1 match, found ${matches?matches.length:0}`);
  return source.replace(regex,'');
}

// Remove the existing live-panel toggle listener.
html=removeExactly(html,/document\.addEventListener\('toggle',function\(ev\)\{const panel=ev\.target\.closest\?\.\('\[data-live-deployment-panel\]'\);if\(panel\)\{state\.liveDeploymentPanelOpen=!!panel\.open;save\(\);\}\}\);\n?/,'live deployment toggle listener');

// Remove the complete deployment-specific change listener by stable boundaries.
const changeStart=html.indexOf("document.addEventListener('change',function(ev){");
const dragMarker=html.indexOf('let objectiveMapDrag=null;',changeStart);
if(changeStart<0||dragMarker<0||dragMarker<=changeStart)throw new Error('deployment change listener boundaries not found');
const changeBlock=html.slice(changeStart,dragMarker);
if(!changeBlock.includes("[data-deployment-side]")||!changeBlock.includes('.objective-map-unit-select'))throw new Error('deployment change listener contents not recognized');
html=html.slice(0,changeStart)+html.slice(dragMarker);

// Remove the pointer/map click listeners between objectiveMapDrag and the stratagem listener.
const interactionStart=html.indexOf('let objectiveMapDrag=null;');
const interactionEnd=html.indexOf("document.addEventListener('click',function(ev){\n  const sb=ev.target.closest('[data-stratagem-use]');",interactionStart);
if(interactionStart<0||interactionEnd<0||interactionEnd<=interactionStart)throw new Error('deployment pointer/click interaction block boundaries not found');
html=html.slice(0,interactionStart)+html.slice(interactionEnd);

const bridgeTag='<script src="./deployment-bridge.js"></script>';
if((html.match(/<script src="\.\/deployment-bridge\.js"><\/script>/g)||[]).length!==1)throw new Error('expected exactly one deployment bridge script tag');
if(html.includes('<script src="./deployment-interaction.js"></script>'))throw new Error('deployment interaction script already present');
html=html.replace(bridgeTag,bridgeTag+'\n<script src="./deployment-interaction.js"></script>');

const install=`\nwindow.OnoForgeDeploymentInteraction.install({\n  setLiveDeploymentPanelOpen:(open)=>{state.liveDeploymentPanelOpen=!!open;save();},\n  setDeploymentTrackingSide:(side)=>{state.deploymentTrackingSide=side==='opp'?'opp':'my';},\n  clearBattlefieldMapPlacement:()=>{delete state.battlefieldMapPlacement;},\n  setBattlefieldMapPlacement:(value)=>{state.battlefieldMapPlacement=value||undefined;},\n  getBattlefieldMapPlacement:()=>state.battlefieldMapPlacement,\n  setDeploymentMapPlacement:(value)=>{state.deploymentMapPlacement=value||undefined;},\n  getDeploymentMapPlacement:()=>state.deploymentMapPlacement,\n  clearDeploymentMapPlacement:()=>{delete state.deploymentMapPlacement;},\n  render,\n  deployReserveByMap,\n  isUnitReserved,\n  setDeploymentPlanPosition,\n  setBattlefieldUnitPosition,\n  clearBattlefieldUnitPosition,\n  clearDeploymentPlanPosition,\n  saveDeploymentPlan,\n  loadDeploymentPlan,\n  clearDeploymentPlanForCurrentMap,\n  setReserveDeclaration,\n  setTransportEmbarkation\n});\n`;
const idx=html.lastIndexOf('</script>');
if(idx<0)throw new Error('inline script close tag not found');
html=html.slice(0,idx)+install+html.slice(idx);
fs.writeFileSync(path,html);
console.log('Deployment interaction integration complete.');
console.log(`index.html bytes: ${Buffer.byteLength(html,'utf8')}`);
