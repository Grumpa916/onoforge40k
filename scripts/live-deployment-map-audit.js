const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
function check(name,ok){if(!ok){console.error('FAIL:',name);process.exitCode=1;}else console.log('PASS:',name);}
check('Deployment Tracking map mode exists',/objectiveMapRendererHtml\('deployment'\)/.test(html));
check('Deployment Tracking renders both armies',/mode==='setup'\?all\.filter\(x=>x\.side==='my'\):all/.test(html));
check('Deployment side selector exists',/data-deployment-side/.test(html));
check('Deployment unit selector exists',/data-map-mode="deployment"/.test(html));
check('Unit icons expose side and uid for direct dragging',/data-map-side=.*data-map-uid/.test(html));
check('Pointer drag lifecycle exists',/pointerdown.*objectiveMapDrag.*pointermove.*objectiveMapDrag.*pointerup/s.test(html));
check('Tablet touch dragging is enabled on unit icons',/\.objective-map-unit\{cursor:grab;touch-action:none\}/.test(html));
check('Deployment placement uses authoritative setter',/setBattlefieldUnitPosition\(placement\.side,placement\.uid,x,y,mode==='deployment'\?'deployment':'manual'\)/.test(html));
check('Movement drag uses authoritative setter',/setBattlefieldUnitPosition\(d\.side,d\.uid,x,y,'movement'\)/.test(html));
check('Authoritative positions remain snapped to 0.1 inch',/Math\.round\(Number\(x\)\*10\)\/10/.test(html)&&/Math\.round\(Number\(y\)\*10\)\/10/.test(html));
check('Position changes remain undoable',/setBattlefieldUnitPosition[\s\S]*?snapshotForUndo\(\)/.test(html));
check('Deployment and movement are separately logged',/UNIT_DEPLOYED/.test(html)&&/UNIT_BATTLEFIELD_POSITION_CHANGED/.test(html));
check('Deployment strategy is reference-only ghost layer',/objectiveMapPlanGhostNodesHtml/.test(html)&&/Planned deployment only/.test(html));
check('Start Battle preserves recorded deployment positions',/ensureBattlefieldUnitPositions\(\);Object\.values\(ensureBattlefieldUnitPositions\(\)\)/.test(html)&&!/const startingPlan=deploymentPlanForCurrentMap\(\);state\.battlefieldUnitPositions=\{\}/.test(html));
if(process.exitCode)process.exit(1);
console.log('Live deployment tracking / drag-map integrity audit passed 15/15');
