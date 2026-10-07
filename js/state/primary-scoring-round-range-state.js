function createPrimaryScoringRoundRangeStateController(){
  function primaryScoringRoundRange(timing){
  const text=String(timing||'').toUpperCase();
    const m=text.match(/R(\\d+)\\s*[–—-]\\s*(\\d+)/);
    if(m)return {min:Number(m[1]),max:Number(m[2])};
    const plus=text.match(/R(\\d+)\\s*\\+/);
    if(plus)return {min:Number(plus[1]),max:5};
    const single=text.match(/R(\\d+)\\b/);
    if(single)return {min:Number(single[1]),max:Number(single[1])};
    return {min:1,max:5};
  }
  return Object.freeze({primaryScoringRoundRange});
}
window.OnoForgePrimaryScoringRoundRangeState=Object.freeze({createPrimaryScoringRoundRangeStateController});