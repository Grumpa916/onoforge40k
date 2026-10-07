function createPrimaryScoringMaxStateController(){
  function primaryScoringMax(row){
    const text=String(row?.[2]||'')+' '+String(row?.[3]||'');
    const m=text.match(/(?:up to|maximum|max(?:imum)?(?: of)?)[^0-9]{0,12}(\d+)/i);
    return m?Math.max(1,Number(m[1])||1):null;
  }
  return Object.freeze({primaryScoringMax});
}
window.OnoForgePrimaryScoringMaxState=Object.freeze({createPrimaryScoringMaxStateController});
