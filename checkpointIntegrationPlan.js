// ==========================================
// OnoForge Checkpoint Integration Plan
// ==========================================
// Integration order:
// 1. battleCheckpoint.js
// 2. battleCheckpointAdapter.js
// 3. battleStateInspector.js
// 4. checkpointLoader.js
//
// This file is documentation/test scaffolding only.
// It does not modify gameplay state.

window.OnoForgeDebug = window.OnoForgeDebug || {};

window.OnoForgeDebug.checkpointIntegrationPlan = {
    modules: [
        "battleCheckpoint.js",
        "battleCheckpointAdapter.js",
        "battleStateInspector.js",
        "checkpointLoader.js"
    ],
    nextStep: "map live OnoForge state into adapter"
};
