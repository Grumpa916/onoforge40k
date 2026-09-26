// ==========================================
// OnoForge Battle Checkpoint Adapter v1
// Connects live app state to checkpoint format
// Audit only - no saving
// ==========================================

window.OnoForgeDebug = window.OnoForgeDebug || {};

function collectCheckpointSetup(){
    return {
        mission: null,
        deployment: null,
        terrain: null,
        objectives: null
    };
}

function collectCheckpointBattlefield(){
    return {
        positions: {},
        reserves: {},
        objectives: {}
    };
}

function collectCheckpointUnits(){
    return {
        units: []
    };
}

function collectCheckpointGame(){
    return {
        round: null,
        phase: null,
        activePlayer: null,
        vp: null,
        cp: null
    };
}

function collectCheckpointHistory(){
    return {
        actionLog: [],
        scoringLog: []
    };
}

function collectBattleCheckpointState(){
    return {
        setup: collectCheckpointSetup(),
        battlefield: collectCheckpointBattlefield(),
        units: collectCheckpointUnits(),
        game: collectCheckpointGame(),
        history: collectCheckpointHistory()
    };
}

window.OnoForgeDebug.collectBattleCheckpointState = collectBattleCheckpointState;
