// ==========================================
// OnoForge Battle Checkpoint System v1
// Audit Only
// ==========================================

window.OnoForgeDebug = window.OnoForgeDebug || {};

function createBattleCheckpointSnapshot(source = {}) {
    return {
        version: 1,
        timestamp: Date.now(),

        setup: source.setup || {},
        battlefield: source.battlefield || {},
        units: source.units || {},
        game: source.game || {},
        history: source.history || {}
    };
}

function validateBattleCheckpoint(snapshot) {
    const required = [
        "setup",
        "battlefield",
        "units",
        "game"
    ];

    const missing = required.filter(
        key => !snapshot || !snapshot[key]
    );

    return {
        valid: missing.length === 0,
        missing
    };
}

function getBattleCheckpointStats(snapshot) {
    const json = JSON.stringify(snapshot || {});

    return {
        bytes: json.length,
        kb: Math.round(json.length / 1024)
    };
}

window.OnoForgeDebug.createBattleCheckpoint = createBattleCheckpointSnapshot;
window.OnoForgeDebug.validateBattleCheckpoint = validateBattleCheckpoint;
window.OnoForgeDebug.getBattleCheckpointStats = getBattleCheckpointStats;
