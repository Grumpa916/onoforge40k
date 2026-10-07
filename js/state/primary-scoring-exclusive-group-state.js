function createPrimaryScoringExclusiveGroupStateController(){
  function primaryScoringExclusiveGroup(mission,index){
    if(mission==='Purge and Secure' && index<=1)return 'purge-secure-kill';
    if(mission==='Consecrate' && index<=1)return 'consecrate-tier';
    if(mission==='Reconnaissance Sweep' && index<=1)return 'recon-sweep-tier';
    if(mission==='Triangulation' && index>=1 && index<=3)return 'triangulation-tier';
    return '';
  }
  return Object.freeze({primaryScoringExclusiveGroup});
}
window.OnoForgePrimaryScoringExclusiveGroupState=Object.freeze({createPrimaryScoringExclusiveGroupStateController});