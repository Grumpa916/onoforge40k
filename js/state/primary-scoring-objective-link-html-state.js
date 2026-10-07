function createPrimaryScoringObjectiveLinkHtmlStateController({primaryScoringObjectiveCount,primaryObjectiveConditionStatus,primaryObjectiveScoreSnapshot,primaryScoringMax,primaryScoringEffectiveMax,esc,primaryObjectiveConditionShortLabel}){
  function primaryScoringObjectiveLinkHtml(side,row,done,actual,index){
    const liveCount=primaryScoringObjectiveCount(side,row);
    const condition=primaryObjectiveConditionStatus(side,row);
    if(liveCount===null&&condition===null)return '';
    const snap=done?primaryObjectiveScoreSnapshot(side,index):null;
    const count=snap?Number(snap.qualifyingCount)||0:(liveCount!==null?liveCount:Math.max(0,Number(condition?.count)||0));
    const cap=liveCount!==null?(snap?Math.min(primaryScoringMax(row)||count,count):primaryScoringEffectiveMax(side,row)):null;
    if(done)return '<span class="tiny">Objective snapshot: '+count+' qualifying at scoring'+(snap?.conditionMet===false?' • condition not met at snapshot':'')+(snap?' • '+esc(snap.capturedAtPhase):'')+'</span>';
    if(condition&&!condition.met)return '<span class="tiny" style="color:#d99a9a">'+esc(primaryObjectiveConditionShortLabel(condition))+'</span>';
    if(liveCount!==null&&count===0)return '<span class="tiny" style="color:#d99a9a">No qualifying objectives currently controlled</span>';
    if(condition&&condition.requiresTurnChange&&condition.met)return '<span class="tiny" style="color:#aee2bf">'+esc(primaryObjectiveConditionShortLabel(condition))+'</span>';
    if(condition)return '<span class="tiny" style="color:#aee2bf">'+esc(primaryObjectiveConditionShortLabel(condition))+'</span>';
    return '<span class="tiny" style="color:#aee2bf">'+count+' qualifying objective'+(count===1?'':'s')+' • up to '+cap+' scoring</span>';
  }
  return Object.freeze({primaryScoringObjectiveLinkHtml});
}
window.OnoForgePrimaryScoringObjectiveLinkHtmlState=Object.freeze({createPrimaryScoringObjectiveLinkHtmlStateController});
