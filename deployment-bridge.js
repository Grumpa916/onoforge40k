// OnoForge 40K — deployment compatibility bridge
// Compatibility-only seam: delegates to OnoForgeDeploymentState and owns no second state store.
(function(root){
  'use strict';

  const source = root.OnoForgeDeploymentState;
  if(!source){
    throw new Error('OnoForgeDeploymentState is required before deployment-bridge.js');
  }

  function api(){
    return {
      deploymentPlanKey: source.deploymentPlanKey,
      ensureDeploymentPlans: source.ensureDeploymentPlans,
      deploymentPlanForCurrentMap: source.deploymentPlanForCurrentMap,
      deploymentPlanPosition: source.deploymentPlanPosition,
      setDeploymentPlanPosition: source.setDeploymentPlanPosition,
      clearDeploymentPlanPosition: source.clearDeploymentPlanPosition,
      clearDeploymentPlanForCurrentMap: source.clearDeploymentPlanForCurrentMap,
      normalizePosition: source.normalizePosition,
      ensureBattlefieldUnitPositions: source.ensureBattlefieldUnitPositions,
      battlefieldUnitPosition: source.battlefieldUnitPosition,
      setBattlefieldUnitPosition: source.setBattlefieldUnitPosition,
      clearBattlefieldUnitPosition: source.clearBattlefieldUnitPosition
    };
  }

  // Stable compatibility surface for the existing monolith.
  // The bridge deliberately delegates every operation to the extracted state seam.
  root.OnoForgeDeploymentBridge = api();
})(window);
