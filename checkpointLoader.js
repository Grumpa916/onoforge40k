// ==========================================
// OnoForge Checkpoint Loader Test Harness v1
// Verifies checkpoint modules are available
// ==========================================

window.OnoForgeDebug = window.OnoForgeDebug || {};

window.OnoForgeDebug.checkCheckpointSystem = function(){
    return {
        snapshot:
            typeof createBattleCheckpointSnapshot === "function",

        adapter:
            typeof collectBattleCheckpointState === "function",

        inspector:
            typeof window.OnoForgeDebug.inspectBattleCheckpointState === "function"
    };
};
