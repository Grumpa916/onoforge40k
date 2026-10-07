function createPrimaryScoringHtmlStateController({getState,getPrimaryScoringRows,primaryScoringRowAvailable,esc}){
  function primaryScoringHtml(mission){
    const state=getState();
    const rows=getPrimaryScoringRows(mission);
    if(!rows)return '<div class="muted">Scoring details not loaded for this mission.</div>';
    const round=Math.max(1,Number(state.round)||1);
    const visible=rows.filter(r=>primaryScoringRowAvailable(r?.[0],round));
    if(!visible.length)return '<div class="muted">No scoring available this round.</div>';
    return `<div class="primary-scoring"><div class="muted primary-scoring-title">Scoring — Round ${round}</div>${visible.map(r=>`<div class="primary-score-row"><span class="tiny">${esc(r[0])}</span><strong>${esc(r[1])}</strong><span>${esc(r[2])}</span></div>`).join('')}</div>`;
  }
  return Object.freeze({primaryScoringHtml});
}
window.OnoForgePrimaryScoringHtmlState=Object.freeze({createPrimaryScoringHtmlStateController});
