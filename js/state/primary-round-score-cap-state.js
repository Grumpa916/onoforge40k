function createPrimaryRoundScoreCapStateController({primaryRoundScoredVP}){
  function primaryRoundCapRemaining(side){return Math.max(0,15-primaryRoundScoredVP(side));}
  return Object.freeze({primaryRoundCapRemaining});
}
window.OnoForgePrimaryRoundScoreCapState=Object.freeze({createPrimaryRoundScoreCapStateController});
