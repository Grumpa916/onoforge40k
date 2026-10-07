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
const transport=fs.readFileSync(path.join(root,'js/state/transport-state.js'),'utf8');
const stratagem=fs.readFileSync(path.join(root,'js/state/stratagem-state.js'),'utf8');
const gameTimer=fs.readFileSync(path.join(root,'js/state/game-timer-state.js'),'utf8');
const phaseCP=fs.readFileSync(path.join(root,'js/state/phase-cp-state.js'),'utf8');
const objectiveControlHistory=fs.readFileSync(path.join(root,'js/state/objective-control-history-state.js'),'utf8');
const objectiveControlSources=fs.readFileSync(path.join(root,'js/state/objective-control-sources-state.js'),'utf8');
const secondaryRoundLedger=fs.readFileSync(path.join(root,'js/state/secondary-round-ledger-state.js'),'utf8');
const scoreLedger=fs.readFileSync(path.join(root,'js/state/score-ledger-state.js'),'utf8');
const secondaryScore=fs.readFileSync(path.join(root,'js/state/secondary-score-state.js'),'utf8');
const scoreCalculation=fs.readFileSync(path.join(root,'js/state/score-calculation-state.js'),'utf8');
const primaryRoundScore=fs.readFileSync(path.join(root,'js/state/primary-round-score-state.js'),'utf8');
const primaryRoundScoreCap=fs.readFileSync(path.join(root,'js/state/primary-round-score-cap-state.js'),'utf8');
const primaryScoringVP=fs.readFileSync(path.join(root,'js/state/primary-scoring-vp-state.js'),'utf8');
const primaryScoringIsPer=fs.readFileSync(path.join(root,'js/state/primary-scoring-is-per-state.js'),'utf8');
const primaryScoringMax=fs.readFileSync(path.join(root,'js/state/primary-scoring-max-state.js'),'utf8');
const primaryObjectiveConditionText=fs.readFileSync(path.join(root,'js/state/primary-objective-condition-text-state.js'),'utf8');
const primaryObjectiveQualifyingList=fs.readFileSync(path.join(root,'js/state/primary-objective-qualifying-list-state.js'),'utf8');
const primaryObjectiveConditionStatus=fs.readFileSync(path.join(root,'js/state/primary-objective-condition-status-state.js'),'utf8');

const primaryScoringObjectiveCount=fs.readFileSync(path.join(root,'js/state/primary-scoring-objective-count-state.js'),'utf8');
const primaryScoringObjectiveAmount=fs.readFileSync(path.join(root,'js/state/primary-scoring-objective-amount-state.js'),'utf8');
const primaryScoringEffectiveMax=fs.readFileSync(path.join(root,'js/state/primary-scoring-effective-max-state.js'),'utf8');
const primaryScoringExclusiveGroup=fs.readFileSync(path.join(root,'js/state/primary-scoring-exclusive-group-state.js'),'utf8');
const primaryScoringOriginalIndex=fs.readFileSync(path.join(root,'js/state/primary-scoring-original-index-state.js'),'utf8');
const primaryObjectiveConditionShortLabel=fs.readFileSync(path.join(root,'js/state/primary-objective-condition-short-label-state.js'),'utf8');
const utils=fs.readFileSync(path.join(root,'js/utils/pure-utils.js'),'utf8');

const required=[
  '<script src="js/utils/pure-utils.js"></script>',
  '<script src="js/data/bsdata-parser.js"></script>',
  '<script src="js/state/reserve-state.js"></script>',
  '<script src="js/state/deployment-plan-state.js"></script>',
  '<script src="js/state/objective-map-state.js"></script>',
  '<script src="js/state/objective-metadata-state.js"></script>',
  '<script src="js/state/transport-state.js"></script>',
  '<script src="js/state/stratagem-state.js"></script>',
  '<script src="js/state/game-timer-state.js"></script>',
  '<script src="js/state/phase-cp-state.js"></script>',
  '<script src="js/state/objective-control-history-state.js"></script>',
  '<script src="js/state/objective-control-sources-state.js"></script>',
  '<script src="js/state/secondary-round-ledger-state.js"></script>',
  '<script src="js/state/score-ledger-state.js"></script>',
  '<script src="js/state/secondary-score-state.js"></script>',
  '<script src="js/state/score-calculation-state.js"></script>',
  '<script src="js/state/primary-round-score-state.js"></script>',
  '<script src="js/state/primary-round-score-cap-state.js"></script>',
  '<script src="js/state/primary-scoring-vp-state.js"></script>',
  '<script src="js/state/primary-scoring-is-per-state.js"></script>',
  '<script src="js/state/primary-scoring-max-state.js"></script>',
  '<script src="js/state/primary-objective-condition-text-state.js"></script>',
  '<script src="js/state/primary-objective-qualifying-list-state.js"></script>',
  '<script src="js/state/primary-objective-condition-status-state.js"></script>',
  '<script src="js/state/primary-scoring-objective-count-state.js"></script>',
  '<script src="js/state/primary-scoring-objective-amount-state.js"></script>',
  '<script src="js/state/primary-scoring-effective-max-state.js"></script>',
  '<script src="js/state/primary-scoring-exclusive-group-state.js"></script>',
  '<script src="js/state/primary-scoring-original-index-state.js"></script>',
  '<script src="js/state/primary-objective-condition-short-label-state.js"></script>',
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
  'ensureObjectiveMeta','objectiveRole','objectiveType','objectiveHomeSide','objectiveMetadataTerritory','objectiveMetadataDeploymentZone',
  'ensureTransportEmbarkations','transportEntry','isUnitEmbarked','transportPassengers','clearTransportEmbarkation','setTransportEmbarkation',
  'ensureStratagemState','stratagemUseHistory','stratagemUsedThisPhase','resetStratagemPhaseUses','stratagemUsedThisBattle','armyStratagemDetachment',
  'ensureGameTimer','gameTimerElapsed','turnElapsedMs','finalizeCurrentTurnTime','switchTurnClock',
  'ensurePhaseCPState','phaseCPKey','rememberPhaseCP','restorePhaseCP',
  'ensureObjectiveControlHistory','objectivePreviousTurnKey','objectivePreviousTurnOwner',
  'ensureObjectiveControlSources','objectiveControlSourceIds','ensureSecondaryRoundLedger','ensureScoreLedger','secondaryTotalScoredVP','scoreTotalForSide'
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
for(const [name,src] of [['bsdata-parser.js',parser],['pure-utils.js',utils],['reserve-state.js',reserve],['deployment-plan-state.js',deploymentPlan],['objective-map-state.js',objectiveMap],['objective-metadata-state.js',objectiveMetadata],['transport-state.js',transport],['stratagem-state.js',stratagem],['game-timer-state.js',gameTimer],['phase-cp-state.js',phaseCP],['objective-control-history-state.js',objectiveControlHistory],['objective-control-sources-state.js',objectiveControlSources],['secondary-round-ledger-state.js',secondaryRoundLedger],['score-ledger-state.js',scoreLedger],['secondary-score-state.js',secondaryScore],['score-calculation-state.js',scoreCalculation],['primary-round-score-state.js',primaryRoundScore],['primary-round-score-cap-state.js',primaryRoundScoreCap],['primary-scoring-vp-state.js',primaryScoringVP],['primary-scoring-is-per-state.js',primaryScoringIsPer],['primary-scoring-max-state.js',primaryScoringMax],['primary-objective-condition-text-state.js',primaryObjectiveConditionText],['primary-objective-qualifying-list-state.js',primaryObjectiveQualifyingList],['primary-objective-condition-status-state.js',primaryObjectiveConditionStatus],['primary-scoring-objective-count-state.js',primaryScoringObjectiveCount],['primary-scoring-objective-amount-state.js',primaryScoringObjectiveAmount],['primary-scoring-effective-max-state.js',primaryScoringEffectiveMax],['primary-scoring-exclusive-group-state.js',primaryScoringExclusiveGroup],['primary-scoring-original-index-state.js',primaryScoringOriginalIndex],['primary-objective-condition-short-label-state.js',primaryObjectiveConditionShortLabel]]){
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
vm.runInNewContext(transport,sandbox,{filename:'js/state/transport-state.js'});
vm.runInNewContext(stratagem,sandbox,{filename:'js/state/stratagem-state.js'});
vm.runInNewContext(gameTimer,sandbox,{filename:'js/state/game-timer-state.js'});
vm.runInNewContext(phaseCP,sandbox,{filename:'js/state/phase-cp-state.js'});
vm.runInNewContext(objectiveControlHistory,sandbox,{filename:'js/state/objective-control-history-state.js'});
vm.runInNewContext(objectiveControlSources,sandbox,{filename:'js/state/objective-control-sources-state.js'});
vm.runInNewContext(secondaryRoundLedger,sandbox,{filename:'js/state/secondary-round-ledger-state.js'});
vm.runInNewContext(scoreLedger,sandbox,{filename:'js/state/score-ledger-state.js'});
vm.runInNewContext(secondaryScore,sandbox,{filename:'js/state/secondary-score-state.js'});
vm.runInNewContext(scoreCalculation,sandbox,{filename:'js/state/score-calculation-state.js'});
vm.runInNewContext(primaryRoundScore,sandbox,{filename:'js/state/primary-round-score-state.js'});
vm.runInNewContext(primaryRoundScoreCap,sandbox,{filename:'js/state/primary-round-score-cap-state.js'});
vm.runInNewContext(primaryScoringVP,sandbox,{filename:'js/state/primary-scoring-vp-state.js'});
vm.runInNewContext(primaryScoringIsPer,sandbox,{filename:'js/state/primary-scoring-is-per-state.js'});
vm.runInNewContext(primaryScoringMax,sandbox,{filename:'js/state/primary-scoring-max-state.js'});
vm.runInNewContext(primaryObjectiveConditionText,sandbox,{filename:'js/state/primary-objective-condition-text-state.js'});
vm.runInNewContext(primaryObjectiveQualifyingList,sandbox,{filename:'js/state/primary-objective-qualifying-list-state.js'});
vm.runInNewContext(primaryObjectiveConditionStatus,sandbox,{filename:'js/state/primary-objective-condition-status-state.js'});
vm.runInNewContext(primaryObjectiveConditionStatus,sandbox,{filename:'js/state/primary-objective-condition-status-state.js'});
vm.runInNewContext(primaryScoringObjectiveCount,sandbox,{filename:'js/state/primary-scoring-objective-count-state.js'});
vm.runInNewContext(primaryScoringObjectiveAmount,sandbox,{filename:'js/state/primary-scoring-objective-amount-state.js'});
vm.runInNewContext(primaryScoringEffectiveMax,sandbox,{filename:'js/state/primary-scoring-effective-max-state.js'});
vm.runInNewContext(primaryScoringExclusiveGroup,sandbox,{filename:'js/state/primary-scoring-exclusive-group-state.js'});
vm.runInNewContext(primaryScoringOriginalIndex,sandbox,{filename:'js/state/primary-scoring-original-index-state.js'});
vm.runInNewContext(primaryObjectiveConditionShortLabel,sandbox,{filename:'js/state/primary-objective-condition-short-label-state.js'});
if(typeof sandbox.window.OnoForgePrimaryScoringExclusiveGroupState?.createPrimaryScoringExclusiveGroupStateController!=='function')throw new Error('Primary scoring exclusive group module did not expose createPrimaryScoringExclusiveGroupStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringOriginalIndexState?.createPrimaryScoringOriginalIndexStateController!=='function')throw new Error('Primary scoring original index module did not expose createPrimaryScoringOriginalIndexStateController');
if(typeof sandbox.window.OnoForgePrimaryObjectiveConditionShortLabelState?.createPrimaryObjectiveConditionShortLabelStateController!=='function')throw new Error('Primary objective condition short label module did not expose createPrimaryObjectiveConditionShortLabelStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringEffectiveMaxState?.createPrimaryScoringEffectiveMaxStateController!=='function')throw new Error('Primary scoring effective max module did not expose createPrimaryScoringEffectiveMaxStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringMaxState?.createPrimaryScoringMaxStateController!=='function')throw new Error('Primary scoring max module did not expose createPrimaryScoringMaxStateController');
if(typeof sandbox.window.OnoForgePrimaryObjectiveConditionTextState?.createPrimaryObjectiveConditionTextStateController!=='function')throw new Error('Primary objective condition text module did not expose createPrimaryObjectiveConditionTextStateController');
if(typeof sandbox.window.OnoForgePrimaryObjectiveQualifyingListState?.createPrimaryObjectiveQualifyingListStateController!=='function')throw new Error('Primary objective qualifying list module did not expose createPrimaryObjectiveQualifyingListStateController');
if(typeof sandbox.window.OnoForgePrimaryObjectiveConditionStatusState?.createPrimaryObjectiveConditionStatusStateController!=='function')throw new Error('Primary objective condition status module did not expose createPrimaryObjectiveConditionStatusStateController');
if(typeof sandbox.window.OnoForgePrimaryObjectiveConditionStatusState?.createPrimaryObjectiveConditionStatusStateController!=='function')throw new Error('Primary objective condition status module did not expose createPrimaryObjectiveConditionStatusStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringObjectiveCountState?.createPrimaryScoringObjectiveCountStateController!=='function')throw new Error('Primary scoring objective count module did not expose createPrimaryScoringObjectiveCountStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringObjectiveAmountState?.createPrimaryScoringObjectiveAmountStateController!=='function')throw new Error('Primary scoring objective amount module did not expose createPrimaryScoringObjectiveAmountStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringIsPerState?.createPrimaryScoringIsPerStateController!=='function')throw new Error('Primary scoring per module did not expose createPrimaryScoringIsPerStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringVPState?.createPrimaryScoringVPStateController!=='function')throw new Error('Primary scoring VP module did not expose createPrimaryScoringVPStateController');
if(typeof sandbox.window.OnoForgePrimaryRoundScoreCapState?.createPrimaryRoundScoreCapStateController!=='function')throw new Error('Primary round score cap module did not expose createPrimaryRoundScoreCapStateController');
if(typeof sandbox.window.OnoForgePrimaryRoundScoreState?.createPrimaryRoundScoreStateController!=='function')throw new Error('Primary round score module did not expose createPrimaryRoundScoreStateController');
if(typeof sandbox.window.OnoForgeBSDataParser?.collectBSDataObjects!=='function')throw new Error('Parser module did not expose collectBSDataObjects');
if(typeof sandbox.window.OnoForgeBSDataParser?.bsUnitFromEntry!=='function')throw new Error('Parser module did not expose bsUnitFromEntry');
if(typeof sandbox.window.OnoForgePureUtils?.battlefieldDistanceBetween!=='function')throw new Error('Utility module did not expose battlefieldDistanceBetween');
if(typeof sandbox.window.OnoForgePureUtils?.formatSavedListDate!=='function')throw new Error('Utility module did not expose formatSavedListDate');
if(typeof sandbox.window.OnoForgeReserveState?.createReserveStateController!=='function')throw new Error('Reserve module did not expose createReserveStateController');
if(typeof sandbox.window.OnoForgeDeploymentPlanState?.createDeploymentPlanStateController!=='function')throw new Error('Deployment plan module did not expose createDeploymentPlanStateController');
if(typeof sandbox.window.OnoForgeDeploymentPlanState?.createDeploymentPlanStateController({getState:()=>({}),save:()=>{},render:()=>{},cloudUpsertArmyList:()=>Promise.resolve(),notify:()=>{},objectiveMissionKey:()=>''}).deploymentPlanKey!=='function')throw new Error('Deployment plan module did not expose deploymentPlanKey');
if(typeof sandbox.window.OnoForgeObjectiveMapState?.createObjectiveMapStateController!=='function')throw new Error('Objective map module did not expose createObjectiveMapStateController');
if(typeof sandbox.window.OnoForgeObjectiveMetadataState?.createObjectiveMetadataStateController!=='function')throw new Error('Objective metadata module did not expose createObjectiveMetadataStateController');
if(typeof sandbox.window.OnoForgeTransportState?.createTransportStateController!=='function')throw new Error('Transport module did not expose createTransportStateController');
if(typeof sandbox.window.OnoForgeStratagemState?.createStratagemStateController!=='function')throw new Error('Stratagem module did not expose createStratagemStateController');
if(typeof sandbox.window.OnoForgeGameTimerState?.createGameTimerStateController!=='function')throw new Error('Game timer module did not expose createGameTimerStateController');
if(typeof sandbox.window.OnoForgePhaseCPState?.createPhaseCPStateController!=='function')throw new Error('Phase CP module did not expose createPhaseCPStateController');
if(typeof sandbox.window.OnoForgeObjectiveControlHistoryState?.createObjectiveControlHistoryStateController!=='function')throw new Error('Objective control history module did not expose createObjectiveControlHistoryStateController');
if(typeof sandbox.window.OnoForgeObjectiveControlSourcesState?.createObjectiveControlSourcesStateController!=='function')throw new Error('Objective control sources module did not expose createObjectiveControlSourcesStateController');
if(typeof sandbox.window.OnoForgeSecondaryRoundLedgerState?.createSecondaryRoundLedgerStateController!=='function')throw new Error('Secondary round ledger module did not expose createSecondaryRoundLedgerStateController');
if(typeof sandbox.window.OnoForgeScoreLedgerState?.createScoreLedgerStateController!=='function')throw new Error('Score ledger module did not expose createScoreLedgerStateController');
if(typeof sandbox.window.OnoForgeSecondaryScoreState?.createSecondaryScoreStateController!=='function')throw new Error('Secondary score module did not expose createSecondaryScoreStateController');
if(typeof sandbox.window.OnoForgeScoreCalculationState?.createScoreCalculationStateController!=='function')throw new Error('Score calculation module did not expose createScoreCalculationStateController');

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

const transportState={page:'setup',my:[
  {uid:'tr1',unitId:'transport-1',name:'Razorback'},
  {uid:'p1',unitId:'passenger-1',name:'Intercessors'},
  {uid:'p2',unitId:'passenger-2',name:'Tactical Squad'},
  {uid:'tr2',unitId:'transport-2',name:'Rhino'}
],opp:[],transportEmbarkations:{my:{},opp:{}},battlefieldUnitPositions:{p1:{x:10,y:10}}};
const transportUnits={
  'transport-1':{keywords:[' transport '],name:'Razorback'},
  'transport-2':{keywords:['TRANSPORT'],name:'Rhino'},
  'passenger-1':{keywords:['INFANTRY'],name:'Intercessors'},
  'passenger-2':{keywords:['INFANTRY'],name:'Tactical Squad'}
};
let transportSaves=0,transportRenders=0,transportEvents=[];
const transportEntryLookup=(side,uid)=>transportState[side].find(e=>String(e.uid)===String(uid))||null;
const transportGet=(unitId)=>transportUnits[unitId]||null;
const transportController=sandbox.window.OnoForgeTransportState.createTransportStateController({
  getState:()=>transportState,
  entry:transportEntryLookup,
  get:transportGet,
  snapshotForUndo:()=>({}),
  event:(...args)=>transportEvents.push(args),
  save:()=>{transportSaves++},
  render:()=>{transportRenders++},
  unitDisplayName:(side,e)=>e?.name||'Unit'
});
if(transportController.transportEntry('my','tr1')?.uid!=='tr1')throw new Error('Transport entry detection regression');
if(transportController.transportEntry('my','p1')!==null)throw new Error('Non-transport entry detection regression');
if(transportController.ensureTransportEmbarkations().my===undefined||transportController.ensureTransportEmbarkations().opp===undefined)throw new Error('Transport state initialization regression');
if(!transportController.setTransportEmbarkation('my','tr1','p1',true))throw new Error('Transport embarkation failed');
if(transportController.transportPassengers('my','tr1')[0]!=='p1')throw new Error('Transport passenger retention regression');
if(!transportController.isUnitEmbarked('my','p1'))throw new Error('Transport embarked-state lookup regression');
if(transportState.battlefieldUnitPositions.p1!==undefined)throw new Error('Embarking did not clear battlefield position');
if(transportEvents[0]?.[0]!=='TRANSPORT_EMBARKED')throw new Error('Transport embark event regression');
if(!transportController.setTransportEmbarkation('my','tr2','p1',true))throw new Error('Transport reassignment failed');
if(transportController.transportPassengers('my','tr1').length!==0||transportController.transportPassengers('my','tr2')[0]!=='p1')throw new Error('Transport reassignment clearing regression');
transportController.clearTransportEmbarkation('my','p1');
if(transportController.isUnitEmbarked('my','p1'))throw new Error('Transport clear regression');
if(!transportController.setTransportEmbarkation('my','tr1','p2',true))throw new Error('Second passenger embarkation failed');
if(transportController.setTransportEmbarkation('my','tr1','tr2',true))throw new Error('Transport-as-passenger validation regression');
if(!transportController.setTransportEmbarkation('my','tr1','p2',false))throw new Error('Transport disembarkation failed');
if(transportController.transportPassengers('my','tr1').length!==0)throw new Error('Transport disembarkation state regression');
if(transportSaves<3||transportRenders<3)throw new Error('Transport controller lifecycle regression');

const stratagemState={round:2,phase:'Shooting',faction:'Space Marines',oppFaction:'Tyranids',detachmentSelections:["Gladius Task Force"],oppDetachmentSelections:[],detachment:'Fallback',oppDetachment:'Opponent Fallback',stratagemUsesMy:[{name:'Fire Overwatch',round:2,phase:'Shooting',playerTurn:'my'}],stratagemUsesOpp:[],stratagemPhaseUsesMy:['legacy'],stratagemPhaseUsesOpp:['legacy'],stratagemsMy:[],stratagemsOpp:[]};
const stratagemController=sandbox.window.OnoForgeStratagemState.createStratagemStateController({getState:()=>stratagemState});
stratagemController.ensureStratagemState();
if(!Array.isArray(stratagemState.stratagemsMy)||!Array.isArray(stratagemState.stratagemUsesOpp))throw new Error('Stratagem state initialization regression');
if(stratagemController.stratagemUseHistory('my')[0]?.name!=='Fire Overwatch')throw new Error('Stratagem history regression');
if(!stratagemController.stratagemUsedThisPhase('my','Fire Overwatch'))throw new Error('Stratagem phase lookup regression');
if(stratagemController.stratagemUsedThisPhase('my','Fire Overwatch')!==true)throw new Error('Stratagem phase persistence regression');
if(!stratagemController.stratagemUsedThisBattle('my','Fire Overwatch'))throw new Error('Stratagem battle lookup regression');
if(stratagemController.stratagemUsedThisBattle('my','Unknown'))throw new Error('Stratagem unknown lookup regression');
if(stratagemController.armyStratagemDetachment('my')!=='Space Marines — Gladius Task Force')throw new Error('Stratagem detachment lookup regression');
if(stratagemController.armyStratagemDetachment('opp')!=='Tyranids — Opponent Fallback')throw new Error('Opponent stratagem detachment fallback regression');
stratagemController.resetStratagemPhaseUses();
if(stratagemState.stratagemPhaseUsesMy.length!==0||stratagemState.stratagemPhaseUsesOpp.length!==0)throw new Error('Stratagem phase reset regression');

const gameTimerState={currentTurn:'my',gameTimer:{elapsedMs:12000,running:false,paused:false,startedAt:0,pausedAt:0,finishedAt:0,turnMyMs:3000,turnOppMs:5000,turnStartedGameMs:9000,turnPaused:false}};
const gameTimerController=sandbox.window.OnoForgeGameTimerState.createGameTimerStateController({getState:()=>gameTimerState});
if(gameTimerController.gameTimerElapsed()!==12000)throw new Error('Game timer elapsed regression');
if(gameTimerController.turnElapsedMs('opp')!==5000)throw new Error('Inactive turn timer regression');
if(gameTimerController.turnElapsedMs('my')!==6000)throw new Error('Saved active turn timer regression');
gameTimerController.finalizeCurrentTurnTime();
if(gameTimerState.gameTimer.turnMyMs!==6000||gameTimerState.gameTimer.turnStartedGameMs!==12000)throw new Error('Turn timer finalization regression');
gameTimerController.switchTurnClock('opp');
if(gameTimerState.currentTurn!=='opp'||gameTimerState.gameTimer.turnStartedGameMs!==12000)throw new Error('Turn clock switch regression');
const initializedTimer={};
const initializedTimerController=sandbox.window.OnoForgeGameTimerState.createGameTimerStateController({getState:()=>initializedTimer});
if(initializedTimerController.ensureGameTimer().turnMyMs!==0||initializedTimerController.ensureGameTimer().turnOppMs!==0)throw new Error('Game timer initialization regression');

const phaseCPState={round:2,currentTurn:'my',phase:'Shooting',myCP:5,oppCP:3};
const phaseCPController=sandbox.window.OnoForgePhaseCPState.createPhaseCPStateController({getState:()=>phaseCPState});
phaseCPController.ensurePhaseCPState();
if(phaseCPController.phaseCPKey(2,'my','Shooting')!=='2|my|Shooting')throw new Error('Phase CP key regression');
phaseCPController.rememberPhaseCP();
if(phaseCPState.phaseCP['2|my|Shooting']?.my!==5||phaseCPState.phaseCP['2|my|Shooting']?.opp!==3)throw new Error('Phase CP remember regression');
phaseCPState.myCP=0;phaseCPState.oppCP=0;
phaseCPController.restorePhaseCP(2,'my','Shooting');
if(phaseCPState.myCP!==5||phaseCPState.oppCP!==3)throw new Error('Phase CP restore regression');
phaseCPState.myCP=7;phaseCPState.oppCP=4;
phaseCPController.restorePhaseCP(3,'opp','Command');
if(phaseCPState.myCP!==7||phaseCPState.oppCP!==4||!phaseCPState.phaseCP['3|opp|Command'])throw new Error('Phase CP missing-key initialization regression');

const objectiveControlHistoryState={round:2,currentTurn:'my',battleFirstTurn:'my',objectiveControlHistory:{'1|opp':{objectives:{A:{owner:'opp'},B:{owner:'contested'}}}}};
const objectiveControlHistoryController=sandbox.window.OnoForgeObjectiveControlHistoryState.createObjectiveControlHistoryStateController({getState:()=>objectiveControlHistoryState});
if(objectiveControlHistoryController.objectivePreviousTurnKey()!=='1|opp')throw new Error('Objective previous turn key regression');
if(objectiveControlHistoryController.objectivePreviousTurnOwner('A')!=='opp')throw new Error('Objective previous turn owner regression');
if(objectiveControlHistoryController.objectivePreviousTurnOwner('B')!=='contested')throw new Error('Objective contested owner regression');
if(objectiveControlHistoryController.objectivePreviousTurnOwner('Unknown')!==null)throw new Error('Objective unknown previous owner regression');
objectiveControlHistoryState.objectiveControlHistory=null;
if(Object.keys(objectiveControlHistoryController.ensureObjectiveControlHistory()).length!==0)throw new Error('Objective control history initialization regression');
objectiveControlHistoryState.round=1;objectiveControlHistoryState.currentTurn='my';
if(objectiveControlHistoryController.objectivePreviousTurnKey()!=='')throw new Error('Objective first-turn previous key regression');
objectiveControlHistoryState.round=3;objectiveControlHistoryState.currentTurn='opp';
if(objectiveControlHistoryController.objectivePreviousTurnKey()!=='3|my')throw new Error('Objective non-first-turn previous key regression');

const objectiveControlSourcesState={objectiveControlSources:{A:['u1',2],B:'invalid',C:null}};
const objectiveControlSourcesController=sandbox.window.OnoForgeObjectiveControlSourcesState.createObjectiveControlSourcesStateController({getState:()=>objectiveControlSourcesState});
if(objectiveControlSourcesController.objectiveControlSourceIds('A').join(',')!=='u1,2')throw new Error('Objective control source id normalization regression');
if(objectiveControlSourcesController.objectiveControlSourceIds('B').length!==0)throw new Error('Objective control source invalid-entry regression');
objectiveControlSourcesState.objectiveControlSources=null;
if(Object.keys(objectiveControlSourcesController.ensureObjectiveControlSources()).length!==0)throw new Error('Objective control source initialization regression');

const secondaryRoundLedgerState={secondaryMyScoredVPByRound:{'1':{A:5,B:'bad'},'2':null},secondaryMyScoredRound:null,secondaryOppScoredVPByRound:null,secondaryOppScoredRound:null};
const secondaryRoundLedgerController=sandbox.window.OnoForgeSecondaryRoundLedgerState.createSecondaryRoundLedgerStateController({getState:()=>secondaryRoundLedgerState});
secondaryRoundLedgerController.ensureSecondaryRoundLedger();
if(secondaryRoundLedgerState.secondaryMyScoredVPByRound['1'].A!==5||secondaryRoundLedgerState.secondaryMyScoredVPByRound['1'].B!==0)throw new Error('Secondary round ledger normalization regression');
if(typeof secondaryRoundLedgerState.secondaryMyScoredVPByRound['2']!=='object'||Array.isArray(secondaryRoundLedgerState.secondaryMyScoredVPByRound['2']))throw new Error('Secondary round ledger nested initialization regression');
if(!secondaryRoundLedgerState.secondaryMyScoredRound||typeof secondaryRoundLedgerState.secondaryMyScoredRound!=='object')throw new Error('Secondary round ledger round map initialization regression');
if(!secondaryRoundLedgerState.secondaryOppScoredVPByRound||typeof secondaryRoundLedgerState.secondaryOppScoredVPByRound!=='object')throw new Error('Opponent secondary round ledger initialization regression');
if(!secondaryRoundLedgerState.secondaryOppScoredRound||typeof secondaryRoundLedgerState.secondaryOppScoredRound!=='object'||Array.isArray(secondaryRoundLedgerState.secondaryOppScoredRound))throw new Error('Opponent secondary round ledger shape regression');

const secondaryScoreState={secondaryMyScoredVP:{A:20,B:'bad',C:40},secondaryOppScoredVP:null};
const secondaryScoreController=sandbox.window.OnoForgeSecondaryScoreState.createSecondaryScoreStateController({getState:()=>secondaryScoreState});
if(secondaryScoreController.secondaryTotalScoredVP('my')!==45||secondaryScoreController.secondaryTotalScoredVP('opp')!==0)throw new Error('Secondary score total normalization regression');

const scoreLedgerState={battleReadyMy:true,battleReadyOpp:false,primaryMyScoredVP:50,primaryOppScoredVP:'bad',secondaryMyScoredVP:{A:10,B:'bad'},secondaryOppScoredVP:null,myVP:99,oppVP:7};
const scoreLedgerController=sandbox.window.OnoForgeScoreLedgerState.createScoreLedgerStateController({getState:()=>scoreLedgerState});
scoreLedgerController.ensureScoreLedger();
if(scoreLedgerState.primaryMyScoredVP!==45||scoreLedgerState.primaryOppScoredVP!==0)throw new Error('Score ledger primary normalization regression');
if(scoreLedgerState.secondaryMyScoredVP.A!==10||scoreLedgerState.secondaryMyScoredVP.B!=='bad')throw new Error('Score ledger secondary preservation regression');
if(!scoreLedgerState.secondaryOppScoredVP||typeof scoreLedgerState.secondaryOppScoredVP!=='object'||Array.isArray(scoreLedgerState.secondaryOppScoredVP))throw new Error('Score ledger secondary initialization regression');
if(scoreLedgerState.manualVPMy!==34||scoreLedgerState.manualVPOpp!==7)throw new Error('Score ledger manual VP derivation regression');
if(scoreLedgerState.myVP!==99||scoreLedgerState.oppVP!==7)throw new Error('Score ledger total normalization regression');

const scoreCalculationState={battleReadyMy:true,battleReadyOpp:false,primaryMyScoredVP:45,primaryOppScoredVP:10,secondaryMyScoredVP:{A:40},secondaryOppScoredVP:{A:5},manualVPMy:20,manualVPOpp:2};
const scoreCalculationController=sandbox.window.OnoForgeScoreCalculationState.createScoreCalculationStateController({getState:()=>scoreCalculationState,ensureScoreLedger:()=>{},secondaryTotalScoredVP:(side)=>side==='my'?45:5});
if(scoreCalculationController.scoreTotalForSide('my')!==100||scoreCalculationController.scoreTotalForSide('opp')!==17)throw new Error('Score total calculation regression');
const primaryRoundScoreState={round:2,primaryScoringValuesByRoundMy:{'1':{A:5},'2':{A:10,B:'bad',C:-3}},primaryScoringValuesByRoundOpp:{'2':{A:7,B:4}}};
const primaryRoundScoreController=sandbox.window.OnoForgePrimaryRoundScoreState.createPrimaryRoundScoreStateController({getState:()=>primaryRoundScoreState});
if(primaryRoundScoreController.primaryRoundScoredVP('my')!==10||primaryRoundScoreController.primaryRoundScoredVP('opp')!==11)throw new Error('Primary round score calculation regression');
const primaryRoundScoreCapController=sandbox.window.OnoForgePrimaryRoundScoreCapState.createPrimaryRoundScoreCapStateController({primaryRoundScoredVP:(side)=>side==='my'?10:16});
if(primaryRoundScoreCapController.primaryRoundCapRemaining('my')!==5||primaryRoundScoreCapController.primaryRoundCapRemaining('opp')!==0)throw new Error('Primary round score cap regression');
const primaryScoringVPController=sandbox.window.OnoForgePrimaryScoringVPState.createPrimaryScoringVPStateController();
if(primaryScoringVPController.primaryScoringVP('Score up to 15 VP')!==15||primaryScoringVPController.primaryScoringVP('for each objective, 2 points')!==2||primaryScoringVPController.primaryScoringVP('No scoring')!==0)throw new Error('Primary scoring VP parsing regression');
const primaryScoringIsPerController=sandbox.window.OnoForgePrimaryScoringIsPerState.createPrimaryScoringIsPerStateController();
if(!primaryScoringIsPerController.primaryScoringIsPer([null,null,'Score 2 VP for each objective'])||!primaryScoringIsPerController.primaryScoringIsPer([null,null,'Score 2 VP per objective'])||primaryScoringIsPerController.primaryScoringIsPer([null,null,'Score 5 VP']))throw new Error('Primary scoring per detection regression');
const primaryScoringMaxController=sandbox.window.OnoForgePrimaryScoringMaxState.createPrimaryScoringMaxStateController();
if(primaryScoringMaxController.primaryScoringMax([null,null,'Score up to 15 VP'])!==15||primaryScoringMaxController.primaryScoringMax([null,null,'Maximum of 10 VP'])!==10||primaryScoringMaxController.primaryScoringMax([null,null,'Score 5 VP'])!==null)throw new Error('Primary scoring max parsing regression');
const primaryScoringEffectiveMaxController=sandbox.window.OnoForgePrimaryScoringEffectiveMaxState.createPrimaryScoringEffectiveMaxStateController({primaryScoringMax:(row)=>row[0],primaryScoringObjectiveCount:(side,row)=>row[1]});
if(primaryScoringEffectiveMaxController.primaryScoringEffectiveMax('my',[15,3])!==3||primaryScoringEffectiveMaxController.primaryScoringEffectiveMax('my',[null,4])!==4||primaryScoringEffectiveMaxController.primaryScoringEffectiveMax('my',[10,null])!==10)throw new Error('Primary scoring effective max regression');
const primaryScoringExclusiveGroupController=sandbox.window.OnoForgePrimaryScoringExclusiveGroupState.createPrimaryScoringExclusiveGroupStateController();
if(primaryScoringExclusiveGroupController.primaryScoringExclusiveGroup('Purge and Secure',0)!=='purge-secure-kill'||primaryScoringExclusiveGroupController.primaryScoringExclusiveGroup('Purge and Secure',2)!=='')throw new Error('Primary scoring exclusive group purge regression');
if(primaryScoringExclusiveGroupController.primaryScoringExclusiveGroup('Consecrate',1)!=='consecrate-tier'||primaryScoringExclusiveGroupController.primaryScoringExclusiveGroup('Reconnaissance Sweep',1)!=='recon-sweep-tier')throw new Error('Primary scoring exclusive group mission regression');
if(primaryScoringExclusiveGroupController.primaryScoringExclusiveGroup('Triangulation',1)!=='triangulation-tier'||primaryScoringExclusiveGroupController.primaryScoringExclusiveGroup('Triangulation',3)!=='triangulation-tier'||primaryScoringExclusiveGroupController.primaryScoringExclusiveGroup('Triangulation',4)!=='')throw new Error('Primary scoring exclusive group triangulation regression');
const primaryScoringObjectiveCountController=sandbox.window.OnoForgePrimaryScoringObjectiveCountState.createPrimaryScoringObjectiveCountStateController({
  getPrimaryObjectiveConditionText:(row)=>row[0],
  getPrimaryObjectiveQualifyingList:(side,row)=>row[1]
});
if(primaryScoringObjectiveCountController.primaryScoringObjectiveCount('my',['Score 2 VP',[1,2]])!==null)throw new Error('Primary scoring objective count non-objective regression');
if(primaryScoringObjectiveCountController.primaryScoringObjectiveCount('my',['Score 2 VP per objective',[1,2,3]])!==3)throw new Error('Primary scoring objective count per regression');
if(primaryScoringObjectiveCountController.primaryScoringObjectiveCount('my',['Score 2 VP for each objective',[1]])!==1)throw new Error('Primary scoring objective count each regression');
const primaryScoringObjectiveAmountController=sandbox.window.OnoForgePrimaryScoringObjectiveAmountState.createPrimaryScoringObjectiveAmountStateController({
  primaryScoringObjectiveCount:(side,row)=>row[0]
});
if(primaryScoringObjectiveAmountController.primaryScoringObjectiveAmount('my',[3])!==3||primaryScoringObjectiveAmountController.primaryScoringObjectiveAmount('my',[null])!==1)throw new Error('Primary scoring objective amount regression');
const primaryObjectiveConditionTextController=sandbox.window.OnoForgePrimaryObjectiveConditionTextState.createPrimaryObjectiveConditionTextStateController();
if(primaryObjectiveConditionTextController.primaryObjectiveConditionText([null,null,'  Score 2 VP Per Objective  '])!=='score 2 vp per objective')throw new Error('Primary objective condition text normalization regression');
if(primaryObjectiveConditionTextController.primaryObjectiveConditionText([null,null,null])!=='')throw new Error('Primary objective condition text empty regression');
const qualifyingObjectives=[
  {name:'home',type:'home'},
  {name:'central',type:'central'},
  {name:'expansion',type:'expansion'},
  {name:'other',type:'other'}
];
const primaryObjectiveQualifyingListController=sandbox.window.OnoForgePrimaryObjectiveQualifyingListState.createPrimaryObjectiveQualifyingListStateController({
  getPrimaryObjectiveConditionText:(row)=>row[0],
  objectiveCountsForSide:()=>qualifyingObjectives,
  objectiveIsInTerritory:(name)=>name==='expansion',
  objectiveDeploymentZone:(name)=>name==='central'?'my':'opp',
  objectiveTurnStartOwner:(name)=>name==='central'?'opp':'my'
});
if(primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',[''])[0].name!=='home'||primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['']).length!==4)throw new Error('Primary objective qualifying list base regression');
if(primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['excluding home central objectives']).length!==1||primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['excluding home central objectives'])[0].name!=='central')throw new Error('Primary objective qualifying list type regression');
if(primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['enemy territory']).length!==1||primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['enemy territory'])[0].name!=='expansion')throw new Error('Primary objective qualifying list territory regression');
if(primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['deployment zone']).length!==1||primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['deployment zone'])[0].name!=='central')throw new Error('Primary objective qualifying list deployment regression');
if(primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['did not control at the start of the turn']).length!==1||primaryObjectiveQualifyingListController.primaryObjectiveQualifyingList('my',['did not control at the start of the turn'])[0].name!=='central')throw new Error('Primary objective qualifying list transition regression');
const conditionState={
  objectives:{home:'my','opp-home':'opp',central:'my',expansion:'my'}
};
const primaryObjectiveConditionStatusController=sandbox.window.OnoForgePrimaryObjectiveConditionStatusState.createPrimaryObjectiveConditionStatusStateController({
  getState:()=>conditionState,
  objectiveCountsForSide:(side)=>side==='my'?[{name:'central',type:'central'},{name:'expansion',type:'expansion'}]:[{name:'opp-home',type:'home'}],
  primaryObjectiveQualifyingList:(side,row)=>side==='my'?[{name:'central',type:'central'},{name:'expansion',type:'expansion'}]:[],
  objectiveHomeSide:(name)=>name==='opp-home'?'opp':'my',
  objectiveStateRecord:(name)=>({name,type:name==='opp-home'?'home':'central'}),
  objectiveTurnStartOwner:(name)=>name==='central'?'opp':'my',
  primaryObjectiveConditionText:(row)=>row[0]
});
const centralExpansion=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',['Control central and expansion objectives']);
if(centralExpansion?.type!=='central-and-expansion'||centralExpansion.count!==2||!centralExpansion.met)throw new Error('Primary objective condition status central-expansion regression');
const moreThanOpponent=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',['Control more objectives than your opponent']);
if(moreThanOpponent?.type!=='more-than-opponent'||moreThanOpponent.opponentCount!==1||!moreThanOpponent.met)throw new Error('Primary objective condition status opponent-count regression');
const opponentHome=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',["Control your opponent's home objective"]);
if(opponentHome?.type!=='opponent-home'||opponentHome.count!==0||opponentHome.met)throw new Error('Primary objective condition status home regression');
const statusObjectives={homeOpp:'my',homeMine:'my'};
const primaryObjectiveConditionStatusController=sandbox.window.OnoForgePrimaryObjectiveConditionStatusState.createPrimaryObjectiveConditionStatusStateController({
  getState:()=>({objectives:statusObjectives}),
  primaryObjectiveConditionText:(row)=>String(row?.[0]||'').toLowerCase(),
  objectiveCountsForSide:(side)=>side==='my'
    ? [{name:'central',type:'central'},{name:'expansion',type:'expansion'}]
    : [{name:'oppObj',type:'other'}],
  primaryObjectiveQualifyingList:()=>[{name:'q1',type:'other'},{name:'q2',type:'other'}],
  objectiveHomeSide:(name)=>name==='homeOpp'?'opp':'my',
  objectiveStateRecord:(name)=>({name,type:'home'}),
  objectiveTurnStartOwner:(name)=>name==='q1'?'opp':'my'
});
if(primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',[null])!==null)throw new Error('Primary objective condition status empty regression');
const centralStatus=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',['Control central and expansion objectives']);
if(centralStatus?.type!=='central-and-expansion'||centralStatus.centralCount!==1||centralStatus.expansionCount!==1||!centralStatus.met)throw new Error('Primary objective condition status central regression');
const moreStatus=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',['Control more objectives than your opponent']);
if(moreStatus?.type!=='more-than-opponent'||moreStatus.count!==2||moreStatus.opponentCount!==1||!moreStatus.met)throw new Error('Primary objective condition status comparison regression');
const homeStatus=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',["Control your opponent's home objective"]);
if(homeStatus?.type!=='opponent-home'||homeStatus.count!==1||homeStatus.objective!=='homeOpp'||!homeStatus.met)throw new Error('Primary objective condition status home regression');
const thresholdStatus=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',['Control 2 objectives']);
if(thresholdStatus?.type!=='threshold'||thresholdStatus.count!==2||thresholdStatus.required!==2||!thresholdStatus.met)throw new Error('Primary objective condition status threshold regression');
const transitionStatus=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',['Control one or more objectives not controlled at the start of the turn']);
if(transitionStatus?.type!=='one-or-more'||transitionStatus.transitionCount!==1||transitionStatus.transitionType!=='newly-controlled-this-turn'||!transitionStatus.requiresTurnChange)throw new Error('Primary objective condition status transition regression');
const originalRows=[['first'],['second'],['third']];
const visibleRows=[originalRows[1],originalRows[2]];
const primaryScoringOriginalIndexController=sandbox.window.OnoForgePrimaryScoringOriginalIndexState.createPrimaryScoringOriginalIndexStateController({getPrimaryScoringRows:()=>originalRows,getVisiblePrimaryScoringRows:()=>visibleRows});
if(primaryScoringOriginalIndexController.primaryScoringOriginalIndex('Any Mission',0)!==1||primaryScoringOriginalIndexController.primaryScoringOriginalIndex('Any Mission',1)!==2||primaryScoringOriginalIndexController.primaryScoringOriginalIndex('Any Mission',2)!==-1)throw new Error('Primary scoring original index regression');
const primaryObjectiveConditionShortLabelController=sandbox.window.OnoForgePrimaryObjectiveConditionShortLabelState.createPrimaryObjectiveConditionShortLabelStateController();
if(primaryObjectiveConditionShortLabelController.primaryObjectiveConditionShortLabel(null)!=='')throw new Error('Primary objective condition short label empty regression');
if(primaryObjectiveConditionShortLabelController.primaryObjectiveConditionShortLabel({type:'more-than-opponent',met:false,required:3,opponentCount:2})!=='Need 3 objectives; opponent controls 2')throw new Error('Primary objective condition short label opponent regression');
if(primaryObjectiveConditionShortLabelController.primaryObjectiveConditionShortLabel({type:'opponent-home',met:true})!=='Opponent home objective controlled')throw new Error('Primary objective condition short label home regression');
if(primaryObjectiveConditionShortLabelController.primaryObjectiveConditionShortLabel({type:'threshold',met:true,count:2,required:3})!=='✓ 2 / 3 objectives controlled')throw new Error('Primary objective condition short label threshold regression');
if(primaryObjectiveConditionShortLabelController.primaryObjectiveConditionShortLabel({type:'one-or-more',requiresTurnChange:true,met:true,transitionCount:2})!=='✓ 2 objectives newly controlled this turn')throw new Error('Primary objective condition short label transition regression');
if(primaryObjectiveConditionShortLabelController.primaryObjectiveConditionShortLabel({type:'one-or-more',requiresTurnChange:false,met:false})!=='No qualifying objective currently controlled')throw new Error('Primary objective condition short label one-or-more regression');
if(primaryObjectiveConditionShortLabelController.primaryObjectiveConditionShortLabel({type:'central-and-expansion',met:false})!=='Need at least 1 central and 1 expansion objective')throw new Error('Primary objective condition short label geometry regression');

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
