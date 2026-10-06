const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');

const root=process.cwd();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const parser=fs.readFileSync(path.join(root,'js/data/bsdata-parser.js'),'utf8');
const reserve=fs.readFileSync(path.join(root,'js/state/reserve-state.js'),'utf8');
const deploymentPlan=fs.readFileSync(path.join(root,'js/state/deployment-plan-state.js'),'utf8');
const objectiveMap=fs.readFileSync(path.join(root,'js/state/objective-map-state.js'),'utf8');
const objectiveMetadata=fs.readFileSync(path.join(root,'js/state/objective-metadata-state.js'),'utf8');
const utils=fs.readFileSync(path.join(root,'js/utils/pure-utils.js'),'utf8');

const required=[
  '<script src="js/utils/pure-utils.js"></script>',
  '<script src="js/data/bsdata-parser.js"></script>',
  '<script src="js/state/reserve-state.js"></script>',
  '<script src="js/state/deployment-plan-state.js"></script>',
  '<script src="js/state/objective-map-state.js"></script>',
  '<script src="js/state/objective-metadata-state.js"></script>',
  'const {battlefieldDistanceBetween,formatSavedListDate,unitListCategory,unitListCategoryName,sortUnitList,wargearCostLabel,secondaryRowInputId,secondaryRowNeedsAmount}=window.OnoForgePureUtils;',
  'const {collectBSDataObjects,bsUnitFromEntry}=window.OnoForgeBSDataParser;',
  'const {createReserveStateController}=window.OnoForgeReserveState;',
  'const {createDeploymentPlanStateController}=window.OnoForgeDeploymentPlanState;'
];
for(const marker of required){
  if(!html.includes(marker))throw new Error('Missing refactor marker: '+marker);
}

for(const name of [
  'collectBSDataObjects','bsProfile','bsCharacteristics','bsAbilities',
  'normalize11eWeaponAbilities','bsWeapons','bsWargearOptions','bsUnitFromEntry',
  'battlefieldDistanceBetween','formatSavedListDate','unitListCategory','unitListCategoryName','sortUnitList','wargearCostLabel','secondaryRowInputId','secondaryRowNeedsAmount',
  'ensureReserveState','isUnitReserved','reserveUnitsForSide','clearReserveDeclarationsForSide','setReserveDeclaration',
  'ensureDeploymentPlans','deploymentPlanForCurrentMap','deploymentPlanPosition','setDeploymentPlanPosition','clearDeploymentPlanPosition','clearDeploymentPlanForCurrentMap','saveDeploymentPlan','loadDeploymentPlan',
  'objectiveMissionKey','objectiveLayoutInfo','ensureObjectiveLayoutForMission','setObjectiveMapLayout','objectiveLayoutPage',
  'ensureObjectiveMeta','objectiveRole','objectiveType','objectiveHomeSide','objectiveMetadataTerritory','objectiveMetadataDeploymentZone'
]){
  const count=(html.match(new RegExp('function\\s+'+name+'\\s*\\(','g'))||[]).length;
  if(count!==0)throw new Error('Extracted function still inline: '+name);
}

const inlineBlocks=[];
const openTag='<script>';
const closeTag='</script>';
let scan=0;
while((scan=html.indexOf(openTag,scan))!==-1){
  const end=html.indexOf(closeTag,scan+openTag.length);
  if(end===-1)break;
  inlineBlocks.push(html.slice(scan+openTag.length,end));
  scan=end+closeTag.length;
}
if(!inlineBlocks.length)throw new Error('No inline script blocks found');
inlineBlocks.forEach((src,i)=>{
  const file=path.join('/tmp','onoforge-refactor-inline-'+i+'.js');
  fs.writeFileSync(file,src);
  cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
});
for(const [name,src] of [['bsdata-parser.js',parser],['pure-utils.js',utils],['reserve-state.js',reserve],['deployment-plan-state.js',deploymentPlan],['objective-map-state.js',objectiveMap]]){
  const file=path.join('/tmp','onoforge-refactor-'+name);
  fs.writeFileSync(file,src);
  cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
}

const sandbox={window:{},console};
vm.runInNewContext(parser,sandbox,{filename:'js/data/bsdata-parser.js'});
vm.runInNewContext(utils,sandbox,{filename:'js/utils/pure-utils.js'});
vm.runInNewContext(reserve,sandbox,{filename:'js/state/reserve-state.js'});
vm.runInNewContext(deploymentPlan,sandbox,{filename:'js/state/deployment-plan-state.js'});
vm.runInNewContext(objectiveMap,sandbox,{filename:'js/state/objective-map-state.js'});
vm.runInNewContext(objectiveMetadata,sandbox,{filename:'js/state/objective-metadata-state.js'});
if(typeof sandbox.window.OnoForgeBSDataParser?.collectBSDataObjects!=='function')throw new Error('Parser module did not expose collectBSDataObjects');
if(typeof sandbox.window.OnoForgeBSDataParser?.bsUnitFromEntry!=='function')throw new Error('Parser module did not expose bsUnitFromEntry');
if(typeof sandbox.window.OnoForgePureUtils?.battlefieldDistanceBetween!=='function')throw new Error('Utility module did not expose battlefieldDistanceBetween');
if(typeof sandbox.window.OnoForgePureUtils?.formatSavedListDate!=='function')throw new Error('Utility module did not expose formatSavedListDate');
if(typeof sandbox.window.OnoForgeReserveState?.createReserveStateController!=='function')throw new Error('Reserve module did not expose createReserveStateController');
if(typeof sandbox.window.OnoForgeDeploymentPlanState?.createDeploymentPlanStateController!=='function')throw new Error('Deployment plan module did not expose createDeploymentPlanStateController');
if(typeof sandbox.window.OnoForgeDeploymentPlanState?.createDeploymentPlanStateController({getState:()=>({}),save:()=>{},render:()=>{},cloudUpsertArmyList:()=>Promise.resolve(),notify:()=>{},objectiveMissionKey:()=>''}).deploymentPlanKey!=='function')throw new Error('Deployment plan module did not expose deploymentPlanKey');
if(typeof sandbox.window.OnoForgeObjectiveMapState?.createObjectiveMapStateController!=='function')throw new Error('Objective map module did not expose createObjectiveMapStateController');
if(typeof sandbox.window.OnoForgeObjectiveMetadataState?.createObjectiveMetadataStateController!=='function')throw new Error('Objective metadata module did not expose createObjectiveMetadataStateController');

const reserveState={page:'setup',my:[{uid:'u1',name:'Unit One'}],opp:[{uid:'u2',name:'Unit Two'}],reserveDeclarations:{my:{},opp:{}},battlefieldUnitPositions:{}};
const reserveController=sandbox.window.OnoForgeReserveState.createReserveStateController({getState:()=>reserveState,snapshotForUndo:()=>({}),event:()=>{},save:()=>{},render:()=>{}});
if(!reserveController.setReserveDeclaration('my','u1',true))throw new Error('Reserve declaration failed');
if(!reserveController.isUnitReserved('my','u1'))throw new Error('Reserve declaration was not retained');
if(reserveController.reserveUnitsForSide('my').length!==1)throw new Error('Reserve unit filtering regression');
reserveController.clearReserveDeclarationsForSide('my');
if(reserveController.isUnitReserved('my','u1'))throw new Error('Reserve clear regression');

const deploymentState={
  objectiveMapMissionKey:'test-mission',
  objectiveMapLayout:'B',
  deploymentPlans:{},
  activeRosterId:'r1',
  savedArmyLists:[{id:'r1'}],
  lists:[{id:'r1'}]
};
let deploymentSaves=0, deploymentRenders=0, notifications=[];
const deploymentController=sandbox.window.OnoForgeDeploymentPlanState.createDeploymentPlanStateController({
  getState:()=>deploymentState,
  save:()=>{deploymentSaves++},
  render:()=>{deploymentRenders++},
  cloudUpsertArmyList:()=>Promise.resolve(),
  notify:(message)=>notifications.push(message),
  objectiveMissionKey:()=> 'fallback-mission'
});
if(deploymentController.deploymentPlanKey()!=='test-mission|B')throw new Error('Deployment plan key regression');
if(!deploymentController.setDeploymentPlanPosition('u1',12.3,7.8))throw new Error('Deployment plan position set failed');
const savedPosition=deploymentController.deploymentPlanPosition('u1');
if(savedPosition?.x!==12.3||savedPosition?.y!==7.8||savedPosition?.side!=='my')throw new Error('Deployment plan position regression');
if(deploymentController.deploymentPlanForCurrentMap().u1?.source!=='deployment-plan')throw new Error('Deployment plan map lookup regression');
deploymentController.clearDeploymentPlanPosition('u1');
if(deploymentController.deploymentPlanPosition('u1')!==null)throw new Error('Deployment plan position clear regression');
deploymentController.setDeploymentPlanPosition('u2',10,10);
deploymentController.saveDeploymentPlan();
if(!deploymentState.savedArmyLists[0].deploymentPlans)throw new Error('Deployment plan save regression');
deploymentState.deploymentPlans={};
deploymentController.loadDeploymentPlan();
if(!deploymentController.deploymentPlanPosition('u2'))throw new Error('Deployment plan load regression');
deploymentController.clearDeploymentPlanForCurrentMap();
if(deploymentController.deploymentPlanForCurrentMap().u2)throw new Error('Deployment plan map clear regression');
if(deploymentSaves<4||deploymentRenders<3||notifications.length!==0)throw new Error('Deployment plan controller lifecycle regression');

const objectiveMetadataState={objectiveMeta:{home:{type:'home',homeSide:'my'},central:{type:'central',territory:'nml'},expansion:{role:'expansion'}}};
const objectiveMetadataController=sandbox.window.OnoForgeObjectiveMetadataState.createObjectiveMetadataStateController({getState:()=>objectiveMetadataState});
if(objectiveMetadataController.objectiveRole('home')!=='home')throw new Error('Objective role regression');
if(objectiveMetadataController.objectiveType('central')!=='central')throw new Error('Objective type regression');
if(objectiveMetadataController.objectiveHomeSide('home')!=='my')throw new Error('Objective home side regression');
if(objectiveMetadataController.objectiveMetadataTerritory('home')!=='my')throw new Error('Objective territory fallback regression');
if(objectiveMetadataController.objectiveMetadataDeploymentZone('home')!=='my')throw new Error('Objective deployment fallback regression');
if(objectiveMetadataController.objectiveMetadataTerritory('central')!=='nml')throw new Error('Objective explicit territory regression');
if(objectiveMetadataController.objectiveMetadataDeploymentZone('unknown')!=='none')throw new Error('Objective deployment default regression');
const objectiveMapState={objectiveMapMissionKey:'',objectiveMapLayout:'A',terrainSetupComplete:true,objectives:{}};
let objectiveSaves=0,objectiveRenders=0,objectiveEvents=[];
const objectiveLayoutIndex=[{missions:['Alpha Mission','Beta Mission'],pages:[101,102,103]}];
const objectiveMapController=sandbox.window.OnoForgeObjectiveMapState.createObjectiveMapStateController({
  getState:()=>objectiveMapState,
  primaryMission:(side)=>side==='my'?'Alpha Mission':'Beta Mission',
  layoutIndex:objectiveLayoutIndex,
  snapshotForUndo:()=>({}),
  autoSeedObjectiveStructure:()=>{},
  event:(...args)=>objectiveEvents.push(args),
  save:()=>{objectiveSaves++},
  render:()=>{objectiveRenders++}
});
if(objectiveMapController.objectiveMissionKey()!=='Alpha Mission ↔ Beta Mission')throw new Error('Objective mission key regression');
if(objectiveMapController.objectiveLayoutInfo()?.pages?.[0]!==101)throw new Error('Objective layout lookup regression');
if(objectiveMapController.ensureObjectiveLayoutForMission()?.pages?.[0]!==101||objectiveMapState.objectiveMapLayout!=='A')throw new Error('Objective layout ensure regression');
objectiveMapController.setObjectiveMapLayout('C');
if(objectiveMapState.objectiveMapLayout!=='C'||objectiveMapController.objectiveLayoutPage()!==103)throw new Error('Objective layout selection regression');
if(objectiveMapState.terrainSetupComplete!==false||objectiveSaves!==1||objectiveRenders!==1||objectiveEvents.length!==1)throw new Error('Objective layout lifecycle regression');

for(const name of ['unitListCategory','unitListCategoryName','sortUnitList','wargearCostLabel','secondaryRowInputId','secondaryRowNeedsAmount']){
  if(typeof sandbox.window.OnoForgePureUtils?.[name]!=='function')throw new Error('Utility module did not expose '+name);
}
const categories=[
 {name:'Captain',keywords:['CHARACTER']},
 {name:'Intercessors',keywords:['INFANTRY']},
 {name:'Tyrannofex',keywords:['MONSTER']},
 {name:'Servo Skulls',keywords:[]}
];
if(sandbox.window.OnoForgePureUtils.unitListCategory(categories[0])!==0)throw new Error('Unit category regression');
if(sandbox.window.OnoForgePureUtils.unitListCategory(categories[1])!==1)throw new Error('Unit category regression');
if(sandbox.window.OnoForgePureUtils.unitListCategory(categories[2])!==2)throw new Error('Unit category regression');
if(sandbox.window.OnoForgePureUtils.unitListCategoryName(categories[3])!=='Other')throw new Error('Unit category label regression');
if(sandbox.window.OnoForgePureUtils.sortUnitList([{name:'Zed',keywords:['INFANTRY']},{name:'Alpha',keywords:['CHARACTER']}])[0].name!=='Alpha')throw new Error('Unit sorting regression');
if(sandbox.window.OnoForgePureUtils.wargearCostLabel(0)!=='Free'||sandbox.window.OnoForgePureUtils.wargearCostLabel(10)!=='+10 pts')throw new Error('Wargear cost label regression');

const d=sandbox.window.OnoForgePureUtils.battlefieldDistanceBetween({x:0,y:0},{x:3,y:4});
if(d!==5)throw new Error('Distance helper regression: expected 5, got '+d);

const collected=sandbox.window.OnoForgeBSDataParser.collectBSDataObjects({id:'root',child:{id:'a'}});
if(typeof collected?.get!=='function'||collected.get('a')?.id!=='a')throw new Error('Parser object collection regression');

console.log('OnoForge monolith refactor checks passed.');
