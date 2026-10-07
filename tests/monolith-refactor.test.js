const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');

const root=process.cwd();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!html.includes('js/state/action-log-filters-state.js'))throw new Error('Action log filters script marker missing');
if(!html.includes('js/state/battle-notes-state.js'))throw new Error('Battle notes script marker missing');
if(!html.includes('js/state/data-sync-status-state.js'))throw new Error('Data sync status script marker missing');
const parser=fs.readFileSync(path.join(root,'js/data/bsdata-parser.js'),'utf8');
const actionLogFilters=fs.readFileSync(path.join(root,'js/state/action-log-filters-state.js'),'utf8');
const battleNotes=fs.readFileSync(path.join(root,'js/state/battle-notes-state.js'),'utf8');
const dataSyncStatus=fs.readFileSync(path.join(root,'js/state/data-sync-status-state.js'),'utf8');
const reserve=fs.readFileSync(path.join(root,'js/state/reserve-state.js'),'utf8');
const reserveDeclarationSection=fs.readFileSync(path.join(root,'js/state/reserve-declaration-section-state.js'),'utf8');
const reserveTray=fs.readFileSync(path.join(root,'js/state/reserve-tray-state.js'),'utf8');
const deploymentPlan=fs.readFileSync(path.join(root,'js/state/deployment-plan-state.js'),'utf8');
const deploymentPlanMapControls=fs.readFileSync(path.join(root,'js/state/deployment-plan-map-controls-state.js'),'utf8');
const deploymentPlanPositionEditor=fs.readFileSync(path.join(root,'js/state/deployment-plan-position-editor-state.js'),'utf8');
const deploymentTrackingEditor=fs.readFileSync(path.join(root,'js/state/deployment-tracking-editor-state.js'),'utf8');
const deploymentStatus=fs.readFileSync(path.join(root,'js/state/deployment-status-state.js'),'utf8');
const tournamentDeploymentValidation=fs.readFileSync(path.join(root,'js/state/tournament-deployment-validation-state.js'),'utf8');
const deploymentTrackingControls=fs.readFileSync(path.join(root,'js/state/deployment-tracking-controls-state.js'),'utf8');
const tournamentSetupChecklist=fs.readFileSync(path.join(root,'js/state/tournament-setup-checklist-state.js'),'utf8');
const battleEndSummary=fs.readFileSync(path.join(root,'js/state/battle-end-summary-state.js'),'utf8');
const primaryMissionRules=fs.readFileSync(path.join(root,'js/state/primary-mission-rules-state.js'),'utf8');
const gameReferenceEditor=fs.readFileSync(path.join(root,'js/state/game-reference-editor-state.js'),'utf8');
const gameAssistant=fs.readFileSync(path.join(root,'js/state/game-assistant-state.js'),'utf8');
const tacticalPreRoll=fs.readFileSync(path.join(root,'js/state/tactical-pre-roll-state.js'),'utf8');
const tacticalAdvisor=fs.readFileSync(path.join(root,'js/state/tactical-advisor-state.js'),'utf8');
const objectiveMap=fs.readFileSync(path.join(root,'js/state/objective-map-state.js'),'utf8');
const objectiveLayout=fs.readFileSync(path.join(root,'js/state/objective-layout-state.js'),'utf8');
const objectiveMetadata=fs.readFileSync(path.join(root,'js/state/objective-metadata-state.js'),'utf8');
const objectiveCanonicalLabel=fs.readFileSync(path.join(root,'js/state/objective-canonical-label-state.js'),'utf8');
const objectiveMapEntries=fs.readFileSync(path.join(root,'js/state/objective-map-entries-state.js'),'utf8');
const armyNoMansLandTags=fs.readFileSync(path.join(root,'js/state/army-no-mans-land-tags-state.js'),'utf8');
const objectiveMapPlacementPanel=fs.readFileSync(path.join(root,'js/state/objective-map-placement-panel-state.js'),'utf8');
const objectiveMapRenderer=fs.readFileSync(path.join(root,'js/state/objective-map-renderer-state.js'),'utf8');
const completeTerrainSetup=fs.readFileSync(path.join(root,'js/state/complete-terrain-setup-state.js'),'utf8');
const unitDatabase=fs.readFileSync(path.join(root,'js/state/unit-database-state.js'),'utf8');
const savedArmyList=fs.readFileSync(path.join(root,'js/state/saved-army-list-state.js'),'utf8');
const savedArmyListDeletion=fs.readFileSync(path.join(root,'js/state/saved-army-list-deletion-state.js'),'utf8');
const currentMyListSnapshot=fs.readFileSync(path.join(root,'js/state/current-my-list-snapshot-state.js'),'utf8');
const transport=fs.readFileSync(path.join(root,'js/state/transport-state.js'),'utf8');
const transportDeclarationSection=fs.readFileSync(path.join(root,'js/state/transport-declaration-section-state.js'),'utf8');
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
const objectiveCounts=fs.readFileSync(path.join(root,'js/state/objective-counts-state.js'),'utf8');
const primaryObjectiveQualifyingList=fs.readFileSync(path.join(root,'js/state/primary-objective-qualifying-list-state.js'),'utf8');
const primaryObjectiveConditionStatus=fs.readFileSync(path.join(root,'js/state/primary-objective-condition-status-state.js'),'utf8');

const primaryScoringObjectiveCount=fs.readFileSync(path.join(root,'js/state/primary-scoring-objective-count-state.js'),'utf8');
const primaryScoringObjectiveAmount=fs.readFileSync(path.join(root,'js/state/primary-scoring-objective-amount-state.js'),'utf8');
const primaryScoringEffectiveMax=fs.readFileSync(path.join(root,'js/state/primary-scoring-effective-max-state.js'),'utf8');
const primaryScoringExclusiveGroup=fs.readFileSync(path.join(root,'js/state/primary-scoring-exclusive-group-state.js'),'utf8');
const primaryScoringOriginalIndex=fs.readFileSync(path.join(root,'js/state/primary-scoring-original-index-state.js'),'utf8');
const primaryObjectiveConditionShortLabel=fs.readFileSync(path.join(root,'js/state/primary-objective-condition-short-label-state.js'),'utf8');
const primaryScoringRoundRange=fs.readFileSync(path.join(root,'js/state/primary-scoring-round-range-state.js'),'utf8');
const utils=fs.readFileSync(path.join(root,'js/utils/pure-utils.js'),'utf8');

const required=[
  '<script src="js/utils/pure-utils.js"></script>',
  '<script src="js/data/bsdata-parser.js"></script>',
  '<script src="js/state/reserve-state.js"></script>',
  '<script src="js/state/reserve-declaration-section-state.js"></script>',
  '<script src="js/state/reserve-tray-state.js"></script>',
  '<script src="js/state/deployment-plan-state.js"></script>',
  '<script src="js/state/deployment-plan-map-controls-state.js"></script>',
  '<script src="js/state/deployment-plan-position-editor-state.js"></script>',
  '<script src="js/state/deployment-tracking-editor-state.js"></script>',
  '<script src="js/state/deployment-tracking-controls-state.js"></script>',
  '<script src="js/state/tournament-setup-checklist-state.js"></script>',
  '<script src="js/state/battle-end-summary-state.js"></script>',
  '<script src="js/state/primary-mission-rules-state.js"></script>',
  '<script src="js/state/game-reference-editor-state.js"></script>',
  '<script src="js/state/game-assistant-state.js"></script>',
  '<script src="js/state/tactical-pre-roll-state.js"></script>',
  '<script src="js/state/tactical-advisor-state.js"></script>',
  '<script src="js/state/objective-map-state.js"></script>',
  '<script src="js/state/objective-layout-state.js"></script>',
  '<script src="js/state/army-no-mans-land-tags-state.js"></script>',
  '<script src="js/state/objective-map-placement-panel-state.js"></script>',
  '<script src="js/state/objective-map-renderer-state.js"></script>',
  '<script src="js/state/complete-terrain-setup-state.js"></script>',
  '<script src="js/state/unit-database-state.js"></script>',
  '<script src="js/state/saved-army-list-state.js"></script>',
  '<script src="js/state/saved-army-list-deletion-state.js"></script>',
  '<script src="js/state/current-my-list-snapshot-state.js"></script>',
  '<script src="js/state/objective-metadata-state.js"></script>',
  '<script src="js/state/transport-state.js"></script>',
  '<script src="js/state/transport-declaration-section-state.js"></script>',
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
  '<script src="js/state/objective-counts-state.js"></script>',
  '<script src="js/state/primary-objective-qualifying-list-state.js"></script>',
  '<script src="js/state/primary-objective-condition-status-state.js"></script>',
  '<script src="js/state/primary-scoring-objective-count-state.js"></script>',
  '<script src="js/state/primary-scoring-objective-amount-state.js"></script>',
  '<script src="js/state/primary-scoring-effective-max-state.js"></script>',
  '<script src="js/state/primary-scoring-exclusive-group-state.js"></script>',
  '<script src="js/state/primary-scoring-original-index-state.js"></script>',
  '<script src="js/state/primary-objective-condition-short-label-state.js"></script>',
  '<script src="js/state/primary-scoring-round-range-state.js"></script>',
  'const {battlefieldDistanceBetween,formatSavedListDate,unitListCategory,unitListCategoryName,sortUnitList,wargearCostLabel,secondaryRowInputId,secondaryRowNeedsAmount}=window.OnoForgePureUtils;',
  'const {collectBSDataObjects,bsUnitFromEntry}=window.OnoForgeBSDataParser;',
  'const {createReserveStateController}=window.OnoForgeReserveState;',
  'const {createReserveDeclarationSectionStateController}=window.OnoForgeReserveDeclarationSectionState',
  'const {createReserveTrayStateController}=window.OnoForgeReserveTrayState',
  'const {createDeploymentPlanStateController}=window.OnoForgeDeploymentPlanState;',
  'const {createObjectiveLayoutStateController}=window.OnoForgeObjectiveLayoutState',
  'const {createTransportDeclarationSectionStateController}=window.OnoForgeTransportDeclarationSectionState'
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
  'ensureObjectiveControlSources','objectiveControlSourceIds','ensureSecondaryRoundLedger','ensureScoreLedger','secondaryTotalScoredVP','scoreTotalForSide','armyNoMansLandTagsHtml','objectiveMapPlacementPanelHtml','objectiveMapRendererHtml','completeTerrainSetup','unitDatabase','canonicalUnitDatabase','bootstrapUnitDatabase','mergeSupplementalUnits','saveCurrentArmyList','loadSavedArmyList','deleteSavedArmyList','undoDeletedSavedArmyList','currentMyListSnapshot','reserveTrayHtml','deploymentPlanMapControlsHtml','transportDeclarationSectionHtml','objectiveLayoutHtml','reserveDeclarationSectionHtml','deploymentPlanPositionEditorHtml','deploymentTrackingEditorHtml','deploymentTrackingControlsHtml','deploymentStatusHtml','tournamentDeploymentValidation','tournamentSetupChecklistHtml','battleEndSummaryHtml','primaryMissionRulesHtml','gameReferenceEditorHtml','gameAssistantHtml','tacticalPreRollHtml','tacticalAdvisorHtml','actionLogFiltersHtml','battleNotesHtml','dataSyncStatusHtml'
]){
  const count=(html.match(new RegExp('function\s+'+name+'\s*\\(','g'))||[]).length;
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
for(const [name,src] of [['bsdata-parser.js',parser],['action-log-filters-state.js',actionLogFilters],['battle-notes-state.js',battleNotes],['data-sync-status-state.js',dataSyncStatus],['pure-utils.js',utils],['reserve-state.js',reserve],['deployment-plan-state.js',deploymentPlan],['objective-map-state.js',objectiveMap],['objective-metadata-state.js',objectiveMetadata],['transport-state.js',transport],['stratagem-state.js',stratagem],['game-timer-state.js',gameTimer],['phase-cp-state.js',phaseCP],['objective-control-history-state.js',objectiveControlHistory],['objective-control-sources-state.js',objectiveControlSources],['secondary-round-ledger-state.js',secondaryRoundLedger],['score-ledger-state.js',scoreLedger],['secondary-score-state.js',secondaryScore],['score-calculation-state.js',scoreCalculation],['primary-round-score-state.js',primaryRoundScore],['primary-round-score-cap-state.js',primaryRoundScoreCap],['primary-scoring-vp-state.js',primaryScoringVP],['primary-scoring-is-per-state.js',primaryScoringIsPer],['primary-scoring-max-state.js',primaryScoringMax],['primary-objective-condition-text-state.js',primaryObjectiveConditionText],['objective-counts-state.js',objectiveCounts],['primary-objective-qualifying-list-state.js',primaryObjectiveQualifyingList],['primary-objective-condition-status-state.js',primaryObjectiveConditionStatus],['primary-scoring-objective-count-state.js',primaryScoringObjectiveCount],['primary-scoring-objective-amount-state.js',primaryScoringObjectiveAmount],['primary-scoring-effective-max-state.js',primaryScoringEffectiveMax],['primary-scoring-exclusive-group-state.js',primaryScoringExclusiveGroup],['primary-scoring-original-index-state.js',primaryScoringOriginalIndex],['primary-objective-condition-short-label-state.js',primaryObjectiveConditionShortLabel],['primary-scoring-round-range-state.js',primaryScoringRoundRange]]){
  const file=path.join('/tmp','onoforge-refactor-'+name);
  fs.writeFileSync(file,src);
  cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
}

const sandbox={window:{},console};
vm.runInNewContext(parser,sandbox,{filename:'js/data/bsdata-parser.js'});
vm.runInNewContext(actionLogFilters,sandbox,{filename:'js/state/action-log-filters-state.js'});
vm.runInNewContext(battleNotes,sandbox,{filename:'js/state/battle-notes-state.js'});
vm.runInNewContext(dataSyncStatus,sandbox,{filename:'js/state/data-sync-status-state.js'});
vm.runInNewContext(utils,sandbox,{filename:'js/utils/pure-utils.js'});
vm.runInNewContext(reserve,sandbox,{filename:'js/state/reserve-state.js'});
vm.runInNewContext(reserveDeclarationSection,sandbox,{filename:'js/state/reserve-declaration-section-state.js'});
vm.runInNewContext(reserveTray,sandbox,{filename:'js/state/reserve-tray-state.js'});
vm.runInNewContext(deploymentPlan,sandbox,{filename:'js/state/deployment-plan-state.js'});
vm.runInNewContext(deploymentPlanMapControls,sandbox,{filename:'js/state/deployment-plan-map-controls-state.js'});
vm.runInNewContext(deploymentPlanPositionEditor,sandbox,{filename:'js/state/deployment-plan-position-editor-state.js'});
vm.runInNewContext(deploymentTrackingEditor,sandbox,{filename:'js/state/deployment-tracking-editor-state.js'});
vm.runInNewContext(deploymentStatus,sandbox,{filename:'js/state/deployment-status-state.js'});
vm.runInNewContext(tournamentDeploymentValidation,sandbox,{filename:'js/state/tournament-deployment-validation-state.js'});
vm.runInNewContext(deploymentTrackingControls,sandbox,{filename:'js/state/deployment-tracking-controls-state.js'});
vm.runInNewContext(tournamentSetupChecklist,sandbox,{filename:'js/state/tournament-setup-checklist-state.js'});
vm.runInNewContext(battleEndSummary,sandbox,{filename:'js/state/battle-end-summary-state.js'});
vm.runInNewContext(primaryMissionRules,sandbox,{filename:'js/state/primary-mission-rules-state.js'});
vm.runInNewContext(gameReferenceEditor,sandbox,{filename:'js/state/game-reference-editor-state.js'});
vm.runInNewContext(gameAssistant,sandbox,{filename:'js/state/game-assistant-state.js'});
vm.runInNewContext(tacticalPreRoll,sandbox,{filename:'js/state/tactical-pre-roll-state.js'});
vm.runInNewContext(tacticalAdvisor,sandbox,{filename:'js/state/tactical-advisor-state.js'});
vm.runInNewContext(objectiveMap,sandbox,{filename:'js/state/objective-map-state.js'});
vm.runInNewContext(objectiveLayout,sandbox,{filename:'js/state/objective-layout-state.js'});
vm.runInNewContext(objectiveMetadata,sandbox,{filename:'js/state/objective-metadata-state.js'});
vm.runInNewContext(objectiveCanonicalLabel,sandbox,{filename:'js/state/objective-canonical-label-state.js'});
vm.runInNewContext(objectiveMapEntries,sandbox,{filename:'js/state/objective-map-entries-state.js'});
vm.runInNewContext(armyNoMansLandTags,sandbox,{filename:'js/state/army-no-mans-land-tags-state.js'});
vm.runInNewContext(objectiveMapPlacementPanel,sandbox,{filename:'js/state/objective-map-placement-panel-state.js'});
vm.runInNewContext(objectiveMapRenderer,sandbox,{filename:'js/state/objective-map-renderer-state.js'});
vm.runInNewContext(completeTerrainSetup,sandbox,{filename:'js/state/complete-terrain-setup-state.js'});
vm.runInNewContext(unitDatabase,sandbox,{filename:'js/state/unit-database-state.js'});
vm.runInNewContext(savedArmyList,sandbox,{filename:'js/state/saved-army-list-state.js'});
vm.runInNewContext(savedArmyListDeletion,sandbox,{filename:'js/state/saved-army-list-deletion-state.js'});
vm.runInNewContext(currentMyListSnapshot,sandbox,{filename:'js/state/current-my-list-snapshot-state.js'});
vm.runInNewContext(transport,sandbox,{filename:'js/state/transport-state.js'});
vm.runInNewContext(transportDeclarationSection,sandbox,{filename:'js/state/transport-declaration-section-state.js'});
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
vm.runInNewContext(objectiveCounts,sandbox,{filename:'js/state/objective-counts-state.js'});
vm.runInNewContext(primaryObjectiveQualifyingList,sandbox,{filename:'js/state/primary-objective-qualifying-list-state.js'});
vm.runInNewContext(primaryObjectiveConditionStatus,sandbox,{filename:'js/state/primary-objective-condition-status-state.js'});
vm.runInNewContext(primaryObjectiveConditionStatus,sandbox,{filename:'js/state/primary-objective-condition-status-state.js'});
vm.runInNewContext(primaryScoringObjectiveCount,sandbox,{filename:'js/state/primary-scoring-objective-count-state.js'});
vm.runInNewContext(primaryScoringObjectiveAmount,sandbox,{filename:'js/state/primary-scoring-objective-amount-state.js'});
vm.runInNewContext(primaryScoringEffectiveMax,sandbox,{filename:'js/state/primary-scoring-effective-max-state.js'});
vm.runInNewContext(primaryScoringExclusiveGroup,sandbox,{filename:'js/state/primary-scoring-exclusive-group-state.js'});
vm.runInNewContext(primaryScoringOriginalIndex,sandbox,{filename:'js/state/primary-scoring-original-index-state.js'});
vm.runInNewContext(primaryObjectiveConditionShortLabel,sandbox,{filename:'js/state/primary-objective-condition-short-label-state.js'});
vm.runInNewContext(primaryScoringRoundRange,sandbox,{filename:'js/state/primary-scoring-round-range-state.js'});
if(typeof sandbox.window.OnoForgePrimaryScoringExclusiveGroupState?.createPrimaryScoringExclusiveGroupStateController!=='function')throw new Error('Primary scoring exclusive group module did not expose createPrimaryScoringExclusiveGroupStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringOriginalIndexState?.createPrimaryScoringOriginalIndexStateController!=='function')throw new Error('Primary scoring original index module did not expose createPrimaryScoringOriginalIndexStateController');
if(typeof sandbox.window.OnoForgePrimaryObjectiveConditionShortLabelState?.createPrimaryObjectiveConditionShortLabelStateController!=='function')throw new Error('Primary objective condition short label module did not expose createPrimaryObjectiveConditionShortLabelStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringRoundRangeState?.createPrimaryScoringRoundRangeStateController!=='function')throw new Error('Primary scoring round range module did not expose createPrimaryScoringRoundRangeStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringEffectiveMaxState?.createPrimaryScoringEffectiveMaxStateController!=='function')throw new Error('Primary scoring effective max module did not expose createPrimaryScoringEffectiveMaxStateController');
if(typeof sandbox.window.OnoForgePrimaryScoringMaxState?.createPrimaryScoringMaxStateController!=='function')throw new Error('Primary scoring max module did not expose createPrimaryScoringMaxStateController');
if(typeof sandbox.window.OnoForgePrimaryObjectiveConditionTextState?.createPrimaryObjectiveConditionTextStateController!=='function')throw new Error('Primary objective condition text module did not expose createPrimaryObjectiveConditionTextStateController');
if(typeof sandbox.window.OnoForgeObjectiveCountsState?.createObjectiveCountsStateController!=='function')throw new Error('Objective counts module did not expose createObjectiveCountsStateController');
if(typeof sandbox.window.OnoForgeObjectiveCanonicalLabelState?.createObjectiveCanonicalLabelStateController!=='function')throw new Error('Objective canonical label module did not expose createObjectiveCanonicalLabelStateController');
if(typeof sandbox.window.OnoForgeObjectiveMapEntriesState?.createObjectiveMapEntriesStateController!=='function')throw new Error('Objective map entries module did not expose createObjectiveMapEntriesStateController');
if(typeof sandbox.window.OnoForgeArmyNoMansLandTagsState?.createArmyNoMansLandTagsStateController!=='function')throw new Error('Army no-mans-land tags module did not expose createArmyNoMansLandTagsStateController');
if(typeof sandbox.window.OnoForgeObjectiveMapPlacementPanelState?.createObjectiveMapPlacementPanelStateController!=='function')throw new Error('Objective map placement panel module did not expose createObjectiveMapPlacementPanelStateController');
if(typeof sandbox.window.OnoForgeObjectiveMapRendererState?.createObjectiveMapRendererStateController!=='function')throw new Error('Objective map renderer module did not expose createObjectiveMapRendererStateController');
if(typeof sandbox.window.OnoForgeCompleteTerrainSetupState?.createCompleteTerrainSetupStateController!=='function')throw new Error('Complete terrain setup module did not expose createCompleteTerrainSetupStateController');
if(typeof sandbox.window.OnoForgeUnitDatabaseState?.createUnitDatabaseStateController!=='function')throw new Error('Unit database module did not expose createUnitDatabaseStateController');
if(typeof sandbox.window.OnoForgeSavedArmyListState?.createSavedArmyListStateController!=='function')throw new Error('Saved army list module did not expose createSavedArmyListStateController');
if(typeof sandbox.window.OnoForgeSavedArmyListDeletionState?.createSavedArmyListDeletionStateController!=='function')throw new Error('Saved army list deletion module did not expose createSavedArmyListDeletionStateController');
if(typeof sandbox.window.OnoForgeCurrentMyListSnapshotState?.createCurrentMyListSnapshotStateController!=='function')throw new Error('Current my list snapshot module did not expose createCurrentMyListSnapshotStateController');
if(typeof sandbox.window.OnoForgeObjectiveLayoutState?.createObjectiveLayoutStateController!=='function')throw new Error('Objective layout module did not expose createObjectiveLayoutStateController');
if(typeof sandbox.window.OnoForgeReserveDeclarationSectionState?.createReserveDeclarationSectionStateController!=='function')throw new Error('Reserve declaration section module did not expose createReserveDeclarationSectionStateController');
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
if(typeof sandbox.window.OnoForgeReserveTrayState?.createReserveTrayStateController!=='function')throw new Error('Reserve tray module did not expose createReserveTrayStateController');
if(typeof sandbox.window.OnoForgeActionLogFiltersState?.createActionLogFiltersStateController!=='function')throw new Error('Action log filters module did not expose createActionLogFiltersStateController');
if(typeof sandbox.window.OnoForgeBattleNotesState?.createBattleNotesStateController!=='function')throw new Error('Battle notes module did not expose createBattleNotesStateController');
if(typeof sandbox.window.OnoForgeDataSyncStatusState?.createDataSyncStatusStateController!=='function')throw new Error('Data sync status module did not expose createDataSyncStatusStateController');
if(typeof sandbox.window.OnoForgeDeploymentPlanState?.createDeploymentPlanStateController!=='function')throw new Error('Deployment plan module did not expose createDeploymentPlanStateController');
if(typeof sandbox.window.OnoForgeDeploymentPlanMapControlsState?.createDeploymentPlanMapControlsStateController!=='function')throw new Error('Deployment plan map controls module did not expose createDeploymentPlanMapControlsStateController');
if(typeof sandbox.window.OnoForgeDeploymentPlanPositionEditorState?.createDeploymentPlanPositionEditorStateController!=='function')throw new Error('Deployment plan position editor module did not expose createDeploymentPlanPositionEditorStateController');
if(typeof sandbox.window.OnoForgeDeploymentTrackingEditorState?.createDeploymentTrackingEditorStateController!=='function')throw new Error('Deployment tracking editor module did not expose createDeploymentTrackingEditorStateController');
if(typeof sandbox.window.OnoForgeDeploymentTrackingControlsState?.createDeploymentTrackingControlsStateController!=='function')throw new Error('Deployment tracking controls module did not expose createDeploymentTrackingControlsStateController');
if(typeof sandbox.window.OnoForgeTournamentSetupChecklistState?.createTournamentSetupChecklistStateController!=='function')throw new Error('Tournament setup checklist module did not expose createTournamentSetupChecklistStateController');
if(typeof sandbox.window.OnoForgeBattleEndSummaryState?.createBattleEndSummaryStateController!=='function')throw new Error('Battle end summary module did not expose createBattleEndSummaryStateController');
if(typeof sandbox.window.OnoForgePrimaryMissionRulesState?.createPrimaryMissionRulesStateController!=='function')throw new Error('Primary mission rules module did not expose createPrimaryMissionRulesStateController');
if(typeof sandbox.window.OnoForgeGameReferenceEditorState?.createGameReferenceEditorStateController!=='function')throw new Error('Game reference editor module did not expose createGameReferenceEditorStateController');
if(typeof sandbox.window.OnoForgeGameAssistantState?.createGameAssistantStateController!=='function')throw new Error('Game assistant module did not expose createGameAssistantStateController');
const tacticalPreRollController=sandbox.window.OnoForgeTacticalPreRollState.createTacticalPreRollStateController({getState:()=>({phase:'Command',tactical:{selectedTargetUid:''},opp:[]}),tacticalAdvisorAttackerEntry:()=>null,entry:()=>null,tacticalPreRollPoolManifest:()=>[],tacticalUnitState:()=>null,esc:v=>String(v),unitDisplayName:()=>'',setTacticalPreRollPoolTarget:()=>{},tacticalPreRollWeaponState:()=>({}),setTacticalPreRollWeapon:()=>{},tacticalPreRollCheck:()=>({}),combatSnapshot:()=>null,setTacticalPreRollPoolAllocation:()=>{},recordMyTacticalAttackInteractionFromUi:()=>{},tacticalPreRollOpenResolution:()=>{}});
if(tacticalPreRollController.tacticalPreRollHtml()!=='')throw new Error('Tactical pre-roll empty-state regression');
if(typeof sandbox.window.OnoForgeTacticalPreRollState?.createTacticalPreRollStateController!=='function')throw new Error('Tactical pre-roll module did not expose createTacticalPreRollStateController');
const tacticalAdvisorController=sandbox.window.OnoForgeTacticalAdvisorState.createTacticalAdvisorStateController({getState:()=>({phase:'Command',my:[]}),tacticalAdvisorAttackerEntry:()=>null,tacticalUnitState:()=>null,esc:v=>String(v),unitDisplayName:()=>'',tacticalObjectiveAdvisorHtml:()=>'',objectiveTacticalSummary:()=>'',objectiveBattlefieldGeometry:()=>null,getTacticalAdvisorResult:()=>null,tacticalAdvisorActionState:()=>({}),entry:()=>null,setTacticalAdvisorAttacker:()=>{},enrichAdvisor:x=>x,confidenceClass:()=>'',recordTacticalChargeResult:()=>{},ensureTacticalState:()=>{},save:()=>{},render:()=>{}});
if(tacticalAdvisorController.tacticalAdvisorHtml()!=='')throw new Error('Tactical advisor command-phase regression');
if(typeof sandbox.window.OnoForgeTacticalAdvisorState?.createTacticalAdvisorStateController!=='function')throw new Error('Tactical advisor module did not expose createTacticalAdvisorStateController');
const rendererState={myName:'Me',oppName:'Them',primaryMyScoredVP:10,primaryOppScoredVP:8,round:5,events:[1,2],battleResultVerified:false,battleReadyMy:true,battleReadyOpp:false,objectiveMapMissionKey:'M',objectiveMapLayout:'A'};
const battleEndController=sandbox.window.OnoForgeBattleEndSummaryState.createBattleEndSummaryStateController({scoreTotalForSide:s=>s==='my'?25:18,secondaryTotalScoredVP:s=>s==='my'?5:4,esc:v=>String(v),objectiveMissionKey:()=> 'M',reserveUnitsForSide:()=>[],getState:()=>rendererState});
if(!battleEndController.battleEndSummaryHtml().includes('Battle Report')||!battleEndController.battleEndSummaryHtml().includes('Verify &amp; Lock Result'))throw new Error('Battle end summary renderer regression');
const primaryRulesController=sandbox.window.OnoForgePrimaryMissionRulesState.createPrimaryMissionRulesStateController({getPrimaryScoring:()=>({M:[['R1','Score','5 VP']]}),esc:v=>String(v)});
if(!primaryRulesController.primaryMissionRulesHtml('M','my').includes('Full Mission Rules'))throw new Error('Primary mission rules renderer regression');
const notesController=sandbox.window.OnoForgeGameReferenceEditorState.createGameReferenceEditorStateController({ensurePersonalArmyNotes:()=> 'note',esc:v=>String(v)});
if(!notesController.gameReferenceEditorHtml().includes('Personal Army Notes'))throw new Error('Game reference editor renderer regression');
const assistantController=sandbox.window.OnoForgeGameAssistantState.createGameAssistantStateController({getState:()=>({phase:'Command',currentTurn:'my',myName:'Me',oppName:'Them',round:2}),primaryMission:()=> 'M',esc:v=>String(v)});
if(!assistantController.gameAssistantHtml().includes('Game Assistant'))throw new Error('Game assistant renderer regression');
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
if(typeof sandbox.window.OnoForgeTransportDeclarationSectionState?.createTransportDeclarationSectionStateController!=='function')throw new Error('Transport declaration section module did not expose createTransportDeclarationSectionStateController');

const objectiveLabelState={objectives:{'My Home':'my','Expansion 1':'none','Central 1':'opp','Expansion 2':'none','Opponent Home':'none'}};
const objectiveLabelController=sandbox.window.OnoForgeObjectiveCanonicalLabelState.createObjectiveCanonicalLabelStateController({
  getState:()=>objectiveLabelState,
  objectiveGeometryIdentity:(name)=>{const k=String(name||'');if(/^My Home$/i.test(k))return {type:'home',side:'my',ordinal:1};if(/^Opponent Home$/i.test(k))return {type:'home',side:'opp',ordinal:1};const m=k.match(/^(Central|Expansion)\s+(\d+)$/i);return m?{type:m[1].toLowerCase(),ordinal:Number(m[2])}:null;},
  objectiveTrackedIdentity:(name)=>{const k=String(name||'');if(/^My Home$/i.test(k))return {type:'home',side:'my',ordinal:1};if(/^Opponent Home$/i.test(k))return {type:'home',side:'opp',ordinal:1};const m=k.match(/^(Central|Expansion)\s+(\d+)$/i);return m?{type:m[1].toLowerCase(),ordinal:Number(m[2])}:null;},
  objectiveBattlefieldGeometry:()=>({verified:false,objectives:[]})
});
if(objectiveLabelController.objectiveCanonicalNumber({type:'home',side:'my',ordinal:1})!==1)throw new Error('Objective canonical number regression');
if(objectiveLabelController.objectiveCanonicalNumber({type:'home',side:'opp',ordinal:1})!==5)throw new Error('Objective five-layout home number regression');
if(objectiveLabelController.objectiveCanonicalLabelForGeometryName('Central 1')!=='O3 • Central')throw new Error('Objective canonical label regression');
if(objectiveLabelController.objectiveTrackedNameForGeometryName('Central 1')!=='Central 1')throw new Error('Objective tracked-name regression');
if(objectiveLabelController.objectiveMapLabelForTrackedNameLegacy('Opponent Home')!=='O5 • Opponent Home')throw new Error('Objective legacy label regression');
const sixState={objectives:{'My Home':'my','Expansion 1':'none','Central 1':'none','Central 2':'none','Expansion 2':'none','Opponent Home':'opp'}};
const sixController=sandbox.window.OnoForgeObjectiveCanonicalLabelState.createObjectiveCanonicalLabelStateController({getState:()=>sixState,objectiveGeometryIdentity:objectiveLabelController.objectiveTrackedNameForGeometryName?((name)=>{const k=String(name||'');if(/^My Home$/i.test(k))return {type:'home',side:'my',ordinal:1};if(/^Opponent Home$/i.test(k))return {type:'home',side:'opp',ordinal:1};const m=k.match(/^(Central|Expansion)\s+(\d+)$/i);return m?{type:m[1].toLowerCase(),ordinal:Number(m[2])}:null;}):()=>null,objectiveTrackedIdentity:(name)=>{const k=String(name||'');if(/^My Home$/i.test(k))return {type:'home',side:'my',ordinal:1};if(/^Opponent Home$/i.test(k))return {type:'home',side:'opp',ordinal:1};const m=k.match(/^(Central|Expansion)\s+(\d+)$/i);return m?{type:m[1].toLowerCase(),ordinal:Number(m[2])}:null;},objectiveBattlefieldGeometry:()=>({verified:false,objectives:[]})});
if(sixController.objectiveCanonicalNumber({type:'home',side:'opp',ordinal:1})!==6)throw new Error('Objective six-layout home number regression');
const objectiveMapEntriesController=sandbox.window.OnoForgeObjectiveMapEntriesState.createObjectiveMapEntriesStateController({
  getState:()=>objectiveLabelState,
  objectiveBattlefieldGeometry:()=>({verified:false,objectives:[]}),
  objectiveMapLabelForTrackedNameLegacy:objectiveLabelController.objectiveMapLabelForTrackedNameLegacy,
  objectiveRole:(name)=>String(name).toLowerCase().includes('central')?'central':'home',
  objectiveTerritory:()=> 'nml',
  objectiveDeploymentZone:()=> 'none',
  objectiveTrackedNameForGeometryName:objectiveLabelController.objectiveTrackedNameForGeometryName,
  objectiveCanonicalLabelForGeometryName:objectiveLabelController.objectiveCanonicalLabelForGeometryName
});
const fallbackEntries=objectiveMapEntriesController.objectiveMapEntries();
if(fallbackEntries.length!==5||fallbackEntries[0].stateName!=='My Home'||fallbackEntries[0].owner!=='my')throw new Error('Objective map entries fallback regression');
if(fallbackEntries.some(e=>!e.label||e.position!==null))throw new Error('Objective map entries fallback shape regression');
const armyTagsState={myName:'My Army',oppName:'Opponent Army',my:[
  {uid:'live',name:'Live Unit'},
  {uid:'waiting',name:'Waiting Unit'},
  {uid:'skipped',name:'Skipped Unit',attachedTo:null}
],opp:[{uid:'opp1',name:'Opponent Unit'}],deploymentSkippedUnits:{'my|skipped':true}};
const armyTagsController=sandbox.window.OnoForgeArmyNoMansLandTagsState.createArmyNoMansLandTagsStateController({
  getState:()=>armyTagsState,
  isUnitReserved:()=>false,
  battlefieldUnitPosition:(side,uid)=>side==='my'&&uid==='live'?{x:10,y:10}:null,
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null,
  esc:(value)=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const armyTagsHtml=armyTagsController.armyNoMansLandTagsHtml({verified:true},()=>{});
if(armyTagsHtml.includes('Live Unit'))throw new Error('Army no-mans-land live-unit filtering regression');
if(!armyTagsHtml.includes('Waiting Unit')||!armyTagsHtml.includes('Skipped Unit')||!armyTagsHtml.includes('Opponent Unit'))throw new Error('Army no-mans-land tag rendering regression');
if(!armyTagsHtml.includes('class="objective-map-army-tag skipped"'))throw new Error('Army no-mans-land skipped tag regression');
if(!armyTagsHtml.includes('data-map-unit="my|waiting"'))throw new Error('Army no-mans-land drag metadata regression');
const placementState={my:[{uid:'u1',name:'Captain'}],opp:[{uid:'u2',name:'Warrior'}],battlefieldMapPlacement:{side:'opp',uid:'u2'}};
const placementController=sandbox.window.OnoForgeObjectiveMapPlacementPanelState.createObjectiveMapPlacementPanelStateController({
  getState:()=>placementState,
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null,
  esc:(value)=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const placementHtml=placementController.objectiveMapPlacementPanelHtml({verified:true});
if(!placementHtml.includes('My: Captain')||!placementHtml.includes('Opponent: Warrior'))throw new Error('Objective map placement options regression');
if(!placementHtml.includes('value="opp|u2" selected'))throw new Error('Objective map placement selection regression');
if(!placementHtml.includes('Placement active'))throw new Error('Objective map placement status regression');
if(!placementController.objectiveMapPlacementPanelHtml({verified:false})){}else throw new Error('Objective map placement verification gate regression');

const rendererController=sandbox.window.OnoForgeObjectiveMapRendererState.createObjectiveMapRendererStateController({
  objectiveMapModel:()=>({verified:true,missionKey:'test-mission',layout:'B',page:12,deploymentZones:{my:{x:0,y:0,width:12,height:6}},terrainGeometry:{},}),
  objectiveMapPlanGhostNodesHtml:()=>'<ghosts/>',
  objectiveMapUnitNodesHtml:()=>'<units/>',
  objectiveMapEntries:()=>[],
  objectivePositionFor:()=>null,
  objectiveMapLabelForTrackedName:()=> 'Objective',
  armyNoMansLandTagsHtml:()=>'<army-tags/>',
  deploymentPlanMapControlsHtml:()=>'<plan-controls/>',
  deploymentTrackingControlsHtml:()=>'<tracking-controls/>',
  reserveTrayHtml:()=>'<reserve-tray/>',
  terrainReferenceImageHtml:()=>'<terrain-reference/>',
  getState:()=>({attackerSide:'my',myName:'My Army',oppName:'Opponent'}),
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const rendererHtml=rendererController.objectiveMapRendererHtml('battle');
if(!rendererHtml.includes('Battlefield Map')||!rendererHtml.includes('test-mission')||!rendererHtml.includes('objective-map-canvas'))throw new Error('Objective map renderer shell regression');
if(!rendererHtml.includes('My Deployment Zone')||!rendererHtml.includes('plan-controls')===false){} 
const pendingRenderer=sandbox.window.OnoForgeObjectiveMapRendererState.createObjectiveMapRendererStateController({
  objectiveMapModel:()=>({verified:false,missionKey:'pending',layout:'A',page:1}),
  objectiveMapPlanGhostNodesHtml:()=>'',objectiveMapUnitNodesHtml:()=>'',objectiveMapEntries:()=>[],objectivePositionFor:()=>null,objectiveMapLabelForTrackedName:()=>'',armyNoMansLandTagsHtml:()=>'',deploymentPlanMapControlsHtml:()=>'',deploymentTrackingControlsHtml:()=>'',reserveTrayHtml:()=>'',terrainReferenceImageHtml:()=>'',getState:()=>({attackerSide:'my',myName:'My Army',oppName:'Opponent'}),esc:String
});
if(!pendingRenderer.objectiveMapRendererHtml('battle').includes('Verified Event Companion geometry required'))throw new Error('Objective map renderer pending gate regression');

const canonicalUnits=[{faction:'Tyranids',name:'Gaunt',sourceRole:'bootstrap'},{faction:'Ultramarines',name:'Captain',sourceRole:'bootstrap'}];
const unitDatabaseController=sandbox.window.OnoForgeUnitDatabaseState.createUnitDatabaseStateController({getWindow:()=>({CURRENT_UNIT_DATABASE:canonicalUnits}),getBootstrapCatalogue:()=>[{faction:'Bootstrap',name:'Unit'}],getDemo:()=>[{faction:'Demo',name:'Unit'}]});
if(unitDatabaseController.unitDatabase()!==canonicalUnits||unitDatabaseController.canonicalUnitDatabase()!==canonicalUnits)throw new Error('Unit database canonical selection regression');
const merged=unitDatabaseController.mergeSupplementalUnits(canonicalUnits,[{faction:'Tyranids',name:'Gaunt',sourceRole:'supplemental'},{faction:'Necrons',name:'Warrior'}]);
if(merged.length!==3||merged.find(u=>u.name==='Gaunt')?.sourceRole!=='canonical'||merged.find(u=>u.name==='Warrior')?.sourceRole!=='canonical')throw new Error('Unit database supplemental merge regression');

const armyListState={faction:'Ultramarines',my:[{uid:'u1',name:'Captain'}],savedArmyLists:[],detachment:'Gladius',personalArmyNotes:'note',detachmentSelections:['Gladius']};
let armySaves=0,armyRenders=0,armyCloud=0;
const armyListController=sandbox.window.OnoForgeSavedArmyListState.createSavedArmyListStateController({
  getState:()=>armyListState,uid:()=> 'list1',prompt:()=> 'Tournament List',
  ensureSecondaryPersonalPlans:()=>({}),ensureDeploymentPlans:()=>({mission:{}}),defaultSecondaryPersonalPlans:()=>({}),
  currentMyListSnapshot:()=>({snapshot:true}),save:()=>{armySaves++;},render:()=>{armyRenders++;},
  cloudUpsertArmyList:()=>{armyCloud++;return Promise.resolve();},ensurePermanentSampleArmies:()=>{}
});
armyListController.saveCurrentArmyList();
if(armySaves!==1||armyRenders!==1||armyCloud!==1)throw new Error('Saved army list save regression');
armyListState.my=[];armyListController.loadSavedArmyList('list1');
if(armyListState.my[0]?.uid!=='u1'||armyListState.detachment!=='Gladius'||armyListState.activeRosterId!=='list1'||armyListState.savedMyListSnapshot?.snapshot!==true)throw new Error('Saved army list load regression');

const snapshotState={myName:'  My Army  ',faction:'Ultramarines',detachment:'Gladius',detachmentSelections:['Gladius'],limit:0,my:[{uid:'u1'}]};
const snapshotController=sandbox.window.OnoForgeCurrentMyListSnapshotState.createCurrentMyListSnapshotStateController({getState:()=>snapshotState});
const snapshot=JSON.parse(snapshotController.currentMyListSnapshot());
if(snapshot.name!=='My Army'||snapshot.faction!=='Ultramarines'||snapshot.limit!==2000||snapshot.detachmentSelections[0]!=='Gladius'||snapshot.units[0].uid!=='u1')throw new Error('Current army list snapshot regression');

const deletionState={savedArmyLists:[{id:'list1',name:'List One'}],deletedSavedArmyLists:[]};
let deletionSaves=0,deletionRenders=0,deletionCloudDeletes=0,deletionCloudUpserts=0;
const deletionController=sandbox.window.OnoForgeSavedArmyListDeletionState.createSavedArmyListDeletionStateController({
  getState:()=>deletionState,isPermanentSampleArmy:()=>false,save:()=>{deletionSaves++;},render:()=>{deletionRenders++;},
  cloudDeleteArmyList:()=>{deletionCloudDeletes++;return Promise.resolve();},cloudUpsertArmyList:()=>{deletionCloudUpserts++;return Promise.resolve();}
});
deletionController.deleteSavedArmyList('list1');
if(deletionState.savedArmyLists.length!==0||deletionState.deletedSavedArmyLists.length!==1||deletionCloudDeletes!==1)throw new Error('Saved army list deletion regression');
deletionController.undoDeletedSavedArmyList();
if(deletionState.savedArmyLists.length!==1||deletionState.savedArmyLists[0].id!=='list1'||deletionState.deletedSavedArmyLists.length!==0||deletionCloudUpserts!==1)throw new Error('Saved army list undo regression');

const terrainState={terrainSetupComplete:false,liveDeploymentPanelOpen:true,round:0};
let terrainEvents=0,terrainSaves=0,terrainRenders=0,terrainScrolls=0;
const terrainController=sandbox.window.OnoForgeCompleteTerrainSetupState.createCompleteTerrainSetupStateController({
  getState:()=>terrainState,
  snapshotForUndo:()=>({before:true}),
  event:(type,payload,before)=>{if(type==='TERRAIN_SETUP_COMPLETED'&&payload.action.includes('deployment planning unlocked')&&before?.before)terrainEvents++;},
  save:()=>{terrainSaves++;},
  render:()=>{terrainRenders++;},
  scrollToDeploymentPlanning:()=>{terrainScrolls++;}
});
terrainController.completeTerrainSetup();
if(!terrainState.terrainSetupComplete||terrainState.liveDeploymentPanelOpen||terrainEvents!==1||terrainSaves!==1||terrainRenders!==1||terrainScrolls!==1)throw new Error('Complete terrain setup state transition regression');

const actionLogFiltersController=sandbox.window.OnoForgeActionLogFiltersState.createActionLogFiltersStateController({getState:()=>({events:[{round:2,phase:'Shooting'},{round:1,phase:'Command'},{round:2,phase:'Shooting'}],actionLogRoundFilter:2,actionLogPhaseFilter:'Shooting'})});
const actionLogFiltersHtml=actionLogFiltersController.actionLogFiltersHtml();
if(!actionLogFiltersHtml.includes('Round 1')||!actionLogFiltersHtml.includes('Round 2')||!actionLogFiltersHtml.includes('Shooting'))throw new Error('Action log filters option regression');
if(!actionLogFiltersHtml.includes('value="2" selected')||!actionLogFiltersHtml.includes('value="Shooting" selected'))throw new Error('Action log filters selection regression');

const battleNotesController=sandbox.window.OnoForgeBattleNotesState.createBattleNotesStateController({getState:()=>({gameAssistantNotesOpen:true,gameAssistantNotes:'Hold & check'}),esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')});
const battleNotesHtml=battleNotesController.battleNotesHtml();
if(!battleNotesHtml.includes('<details class="card battle-notes-card" open'))throw new Error('Battle notes open-state regression');
if(!battleNotesHtml.includes('Hold &amp; check'))throw new Error('Battle notes escaping regression');

const dataSyncStatusController=sandbox.window.OnoForgeDataSyncStatusState.createDataSyncStatusStateController({getState:()=>({cloud:{userId:'user-1',lastSync:'2026-10-07T12:00:00Z'},cloudBattleSavedAt:'2026-10-07T12:30:00Z'}),cloudConfigReady:()=>true,localDataSavedLabel:()=> 'Just now',formatSavedListDate:value=>String(value),esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')});
const dataSyncStatusHtml=dataSyncStatusController.dataSyncStatusHtml();
if(!dataSyncStatusHtml.includes('Connected')||!dataSyncStatusHtml.includes('Saved to cloud')||!dataSyncStatusHtml.includes('Just now'))throw new Error('Data sync status rendering regression');

const reserveState={page:'setup',my:[{uid:'u1',name:'Unit One'}],opp:[{uid:'u2',name:'Unit Two'}],reserveDeclarations:{my:{},opp:{}},battlefieldUnitPositions:{}};
const reserveController=sandbox.window.OnoForgeReserveState.createReserveStateController({getState:()=>reserveState,snapshotForUndo:()=>({}),event:()=>{},save:()=>{},render:()=>{}});
if(!reserveController.setReserveDeclaration('my','u1',true))throw new Error('Reserve declaration failed');
if(!reserveController.isUnitReserved('my','u1'))throw new Error('Reserve declaration was not retained');
if(reserveController.reserveUnitsForSide('my').length!==1)throw new Error('Reserve unit filtering regression');
reserveController.clearReserveDeclarationsForSide('my');
if(reserveController.isUnitReserved('my','u1'))throw new Error('Reserve clear regression');
const tournamentDeploymentValidationState={myName:'My Army',oppName:'Opponent Army',my:[{uid:'u1',name:'Captain'},{uid:'u2',name:'Warrior'}],opp:[{uid:'o1',name:'Enemy'}],deploymentSkippedUnits:{'my|u2':true}};
const tournamentDeploymentValidationController=sandbox.window.OnoForgeTournamentDeploymentValidationState.createTournamentDeploymentValidationStateController({
  getState:()=>tournamentDeploymentValidationState,
  ensureBattlefieldUnitPositions:()=>({u1:{side:'my',x:10,y:5},o1:{side:'opp',x:40,y:20}}),
  isUnitReserved:()=>false,
  isUnitEmbarked:(side,uid)=>false,
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null
});
const validationResult=tournamentDeploymentValidationController.tournamentDeploymentValidation();
if(!validationResult.ready||validationResult.missing.length!==0)throw new Error('Tournament deployment validation ready-state regression');
tournamentDeploymentValidationState.deploymentSkippedUnits={};
const validationMissing=tournamentDeploymentValidationController.tournamentDeploymentValidation();
if(validationMissing.ready||validationMissing.missing.length!==1||!validationMissing.missing[0].includes('Warrior'))throw new Error('Tournament deployment validation missing-unit regression');
const deploymentPlanMapControlsController=sandbox.window.OnoForgeDeploymentPlanMapControlsState.createDeploymentPlanMapControlsStateController({
  getState:()=>({my:[{uid:'u1',name:'Captain'},{uid:'u2',name:'Warrior'}],deploymentMapPlacement:{uid:'u1'}}),
  deploymentPlanForCurrentMap:()=>({u2:{x:12,y:8}}),
  deploymentPlanKey:()=> 'mission|B',
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null,
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const deploymentPlanMapControlsHtml=deploymentPlanMapControlsController.deploymentPlanMapControlsHtml({verified:true});
if(!deploymentPlanMapControlsHtml.includes('Captain')||deploymentPlanMapControlsHtml.includes('Warrior'))throw new Error('Deployment plan map controls availability regression');
if(!deploymentPlanMapControlsHtml.includes('value="u1" selected'))throw new Error('Deployment plan map controls selection regression');
if(!deploymentPlanMapControlsHtml.includes('1 planned position'))throw new Error('Deployment plan map controls count regression');
const deploymentPlanPositionEditorController=sandbox.window.OnoForgeDeploymentPlanPositionEditorState.createDeploymentPlanPositionEditorStateController({
  getState:()=>({my:[{uid:'u1',name:'Captain'},{uid:'u2',name:'Warrior'}]}),
  deploymentPlanPosition:uid=>uid==='u1'?{x:12.3,y:7.8}:null,
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null,
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const deploymentPlanPositionEditorHtml=deploymentPlanPositionEditorController.deploymentPlanPositionEditorHtml();
if(!deploymentPlanPositionEditorHtml.includes('Captain')||!deploymentPlanPositionEditorHtml.includes('Warrior'))throw new Error('Deployment plan position editor rows regression');
if(!deploymentPlanPositionEditorHtml.includes('value="12.3"')||!deploymentPlanPositionEditorHtml.includes('value="7.8"'))throw new Error('Deployment plan position editor coordinates regression');
if(!deploymentPlanPositionEditorHtml.includes('data-deployment-clear="u1"'))throw new Error('Deployment plan position editor clear regression');
const deploymentTrackingEditorController=sandbox.window.OnoForgeDeploymentTrackingEditorState.createDeploymentTrackingEditorStateController({
  getState:()=>({my:[{uid:'u1',name:'Captain'}],opp:[{uid:'u2',name:'Warrior'}]}),
  battlefieldUnitPosition:(side,uid)=>side==='opp'&&uid==='u2'?{x:21.4,y:9.2}:null,
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null,
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const deploymentTrackingEditorHtml=deploymentTrackingEditorController.deploymentTrackingEditorHtml();
if(!deploymentTrackingEditorHtml.includes('Captain')||!deploymentTrackingEditorHtml.includes('Warrior'))throw new Error('Deployment tracking editor rows regression');
if(!deploymentTrackingEditorHtml.includes('Actual deployment: 21.4″, 9.2″'))throw new Error('Deployment tracking editor position regression');
if(!deploymentTrackingEditorHtml.includes('data-battlefield-clear="u2"'))throw new Error('Deployment tracking editor clear regression');
const deploymentStatusState={deploymentTrackingSide:'my',my:[{uid:'u1',name:'Captain'},{uid:'u2',name:'Warrior'}],deploymentSkippedUnits:{}};
const deploymentStatusController=sandbox.window.OnoForgeDeploymentStatusState.createDeploymentStatusStateController({
  getState:()=>deploymentStatusState,
  battlefieldUnitPosition:(side,uid)=>side==='my'&&uid==='u1'?{x:10,y:5}:null,
  isUnitReserved:()=>false,
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null,
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const deploymentStatusHtml=deploymentStatusController.deploymentStatusHtml({});
if(!deploymentStatusHtml.includes('Deployment incomplete'))throw new Error('Deployment status incomplete state regression');
if(!deploymentStatusHtml.includes('Recorded 1 / 2'))throw new Error('Deployment status recorded count regression');
if(!deploymentStatusHtml.includes('Warrior — position not recorded'))throw new Error('Deployment status missing-unit regression');
if(!deploymentStatusHtml.includes('data-deployment-skip-uid="u2"'))throw new Error('Deployment status skip metadata regression');
deploymentStatusState.deploymentSkippedUnits['my|u2']=true;
const deploymentStatusSkippedHtml=deploymentStatusController.deploymentStatusHtml({});
if(!deploymentStatusSkippedHtml.includes('Deployment complete')||!deploymentStatusSkippedHtml.includes('Skipped 1'))throw new Error('Deployment status skipped state regression');
const tournamentSetupChecklistController=sandbox.window.OnoForgeTournamentSetupChecklistState.createTournamentSetupChecklistStateController({
  tournamentSetupValidation:()=>({ready:false,missing:['Mission','First turn']}),
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const tournamentSetupChecklistHtml=tournamentSetupChecklistController.tournamentSetupChecklistHtml();
if(!tournamentSetupChecklistHtml.includes('Setup incomplete')||!tournamentSetupChecklistHtml.includes('Mission • First turn'))throw new Error('Tournament setup checklist incomplete-state regression');
const tournamentSetupChecklistReadyController=sandbox.window.OnoForgeTournamentSetupChecklistState.createTournamentSetupChecklistStateController({
  tournamentSetupValidation:()=>({ready:true,missing:[]}),
  esc:value=>String(value)
});
const tournamentSetupChecklistReadyHtml=tournamentSetupChecklistReadyController.tournamentSetupChecklistHtml();
if(!tournamentSetupChecklistReadyHtml.includes('Ready to start the tournament battle'))throw new Error('Tournament setup checklist ready-state regression');
const deploymentTrackingControlsController=sandbox.window.OnoForgeDeploymentTrackingControlsState.createDeploymentTrackingControlsStateController({
  getState:()=>({deploymentTrackingSide:'opp'}),
  ensureBattlefieldUnitPositions:()=>({a:{side:'opp'},b:{side:'opp'},c:{side:'my'}})
});
const deploymentTrackingControlsHtml=deploymentTrackingControlsController.deploymentTrackingControlsHtml({verified:true});
if(!deploymentTrackingControlsHtml.includes('2 opponent units recorded'))throw new Error('Deployment tracking controls count regression');
if(!deploymentTrackingControlsHtml.includes('value="opp" selected'))throw new Error('Deployment tracking controls side regression');
const reserveDeclarationController=sandbox.window.OnoForgeReserveDeclarationSectionState.createReserveDeclarationSectionStateController({
  getState:()=>({myName:'My Army',oppName:'Opponent Army',my:[{uid:'u1',name:'Captain'}],opp:[{uid:'u2',name:'Warrior'}]}),
  reserveUnitsForSide:side=>side==='my'?[{uid:'u1'}]:[],
  isUnitReserved:(side,uid)=>side==='my'&&uid==='u1',
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null,
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const reserveDeclarationHtml=reserveDeclarationController.reserveDeclarationSectionHtml('my');
if(!reserveDeclarationHtml.includes('My Army')||!reserveDeclarationHtml.includes('Captain')||!reserveDeclarationHtml.includes('checked'))throw new Error('Reserve declaration rendering regression');

const reserveTrayController=sandbox.window.OnoForgeReserveTrayState.createReserveTrayStateController({reserveUnitsForSide:side=>side==='my'?[{uid:'u1',name:'Captain'}]:[{uid:'u2',name:'Warrior'}],unitDisplayName:(side,entry)=>entry?.name,get:()=>null,esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')});
const reserveTrayHtml=reserveTrayController.reserveTrayHtml();
if(!reserveTrayHtml.includes('Captain')||!reserveTrayHtml.includes('Warrior'))throw new Error('Reserve tray rendering regression');
if(!reserveTrayHtml.includes('data-reserve-unit="my|u1"'))throw new Error('Reserve tray metadata regression');

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

const objectiveLayoutTestState={objectiveMapLayout:'B',terrainSetupComplete:false};
const objectiveLayoutController=sandbox.window.OnoForgeObjectiveLayoutState.createObjectiveLayoutStateController({
  getState:()=>objectiveLayoutTestState,
  ensureObjectiveLayoutForMission:()=>({missions:['Mission A','Mission B']}),
  objectiveLayoutPage:()=>42,
  setObjectiveMapLayout:()=>true,
  objectiveMapRendererHtml:mode=>'<div data-test-map="'+mode+'"></div>',
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'),
  warhammerEventCompanionPdf:'https://example.test/companion.pdf'
});
const objectiveLayoutRendered=objectiveLayoutController.objectiveLayoutHtml();
if(!objectiveLayoutRendered.includes('Layout B')||!objectiveLayoutRendered.includes('data-test-map="terrain"')||objectiveLayoutRendered.includes('data-test-map="setup"'))throw new Error('Objective layout terrain-state regression');
objectiveLayoutTestState.terrainSetupComplete=true;
const objectiveLayoutDeploymentRendered=objectiveLayoutController.objectiveLayoutHtml();
if(!objectiveLayoutDeploymentRendered.includes('data-test-map="setup"')||!objectiveLayoutDeploymentRendered.includes('data-test-map="deployment"'))throw new Error('Objective layout deployment-state regression');

const transportDeclarationController=sandbox.window.OnoForgeTransportDeclarationSectionState.createTransportDeclarationSectionStateController({
  getState:()=>({myName:'My Army',oppName:'Opponent Army',my:[{uid:'tr1',unitId:'transport-1',name:'Razorback'},{uid:'p1',unitId:'passenger-1',name:'Intercessors'}],opp:[]}),
  transportEntry:(side,uid)=>uid==='tr1'?{uid:'tr1'}:null,
  ensureTransportEmbarkations:()=>({my:{tr1:['p1']},opp:{}}),
  transportPassengers:(side,uid)=>uid==='tr1'?['p1']:[],
  unitDisplayName:(side,entry)=>entry?.name,
  get:()=>null,
  esc:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
});
const transportDeclarationHtml=transportDeclarationController.transportDeclarationSectionHtml('my');
if(!transportDeclarationHtml.includes('Razorback')||!transportDeclarationHtml.includes('Intercessors'))throw new Error('Transport declaration rendering regression');
if(!transportDeclarationHtml.includes('data-transport-uid="tr1"'))throw new Error('Transport declaration metadata regression');

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
const objectiveCountsState={objectives:{A:'my',B:'opp',C:'my'}};
const objectiveCountsController=sandbox.window.OnoForgeObjectiveCountsState.createObjectiveCountsStateController({
  getState:()=>objectiveCountsState,
  objectiveStateRecord:(name)=>({name,owner:objectiveCountsState.objectives[name]})
});
if(objectiveCountsController.objectiveCountsForSide('my').length!==2||objectiveCountsController.objectiveCountsForSide('opp').length!==1)throw new Error('Objective counts state regression');
if(objectiveCountsController.objectiveCountsForSide('other').length!==2)throw new Error('Objective counts side fallback regression');
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
const thresholdStatus=primaryObjectiveConditionStatusController.primaryObjectiveConditionStatus('my',['Control 2+ objectives']);
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
const primaryScoringRoundRangeController=sandbox.window.OnoForgePrimaryScoringRoundRangeState.createPrimaryScoringRoundRangeStateController();
const roundRange=primaryScoringRoundRangeController.primaryScoringRoundRange('R1–3');
if(roundRange.min!==1||roundRange.max!==3)throw new Error('Primary scoring round range range regression');
const dashRange=primaryScoringRoundRangeController.primaryScoringRoundRange('R2-4');
if(dashRange.min!==2||dashRange.max!==4)throw new Error('Primary scoring round range dash regression');
const plusRange=primaryScoringRoundRangeController.primaryScoringRoundRange('R3+');
if(plusRange.min!==3||plusRange.max!==5)throw new Error('Primary scoring round range plus regression');
const singleRange=primaryScoringRoundRangeController.primaryScoringRoundRange('R5');
if(singleRange.min!==5||singleRange.max!==5)throw new Error('Primary scoring round range single regression');
const defaultRange=primaryScoringRoundRangeController.primaryScoringRoundRange('No timing');
if(defaultRange.min!==1||defaultRange.max!==5)throw new Error('Primary scoring round range default regression');

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
