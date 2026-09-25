const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
function check(name,ok){if(!ok){console.error('FAIL:',name);process.exitCode=1;}else console.log('PASS:',name);}
check('Setup map uses Deployment Plan mode',/objectiveMapRendererHtml\('setup'\)/.test(html));
check('Battle map is rendered in Battle Mode',/objectiveMapRendererHtml\("battle"\)/.test(html));
check('Deployment plan has independent storage',/state\.deploymentPlans/.test(html)&&/deploymentPlanForCurrentMap/.test(html));
check('Setup placement is restricted to my army',/mode==='setup'\?all\.filter\(x=>x\.side==='my'\)/.test(html)&&/Only your army can be placed here/.test(html));
check('Live map includes both armies',/const all=\[\.\.\.\(Array\.isArray\(state\.my\)/.test(html)&&/const units=mode==='setup'\?all\.filter/.test(html));
check('Deployment plans are keyed by mission and layout',/return mission\+'\|'\+layout/.test(html));
check('Deployment plan coordinates are normalized to 0.1 inch',/setDeploymentPlanPosition\(uid,x,y\).*Math\.round\(Number\(x\)\*10\)\/10/.test(html));
check('Live battlefield coordinates are normalized to 0.1 inch',/function setBattlefieldUnitPosition[\s\S]*?Math\.round\(Number\(x\)\*10\)\/10/.test(html));
check('Army list save persists deployment plans',/deploymentPlans:JSON\.parse\(JSON\.stringify\(ensureDeploymentPlans\(\)\)\)/.test(html));
check('Saved army loading restores deployment plans',/state\.deploymentPlans=JSON\.parse\(JSON\.stringify\(list\.deploymentPlans\|\|\{\}\)\)/.test(html));
check('Battle start copies deployment plan into live positions',/const startingPlan=deploymentPlanForCurrentMap\(\)/.test(html)&&/source:'deployment-plan'/.test(html));
check('Live battle positions remain separate from deployment plans',/state\.battlefieldUnitPositions=\{\}/.test(html)&&/mode==='setup'\?deploymentPlanForCurrentMap\(\):ensureBattlefieldUnitPositions/.test(html));
check('Setup plan changes do not emit battle map events',!/setDeploymentPlanPosition[\s\S]*event\('UNIT_BATTLEFIELD_POSITION_CHANGED'/.test(html));
if(process.exitCode)process.exit(1);
console.log('Deployment planning / live battlefield map integrity audit passed 14/14');
