// ==========================================
// OnoForge Battle State Inspector v1
// Diagnostic only - no state changes
// ==========================================

window.OnoForgeDebug = window.OnoForgeDebug || {};

function inspectBattleCheckpointState(){
    const results = {};

    Object.keys(window).forEach(key => {
        try {
            const name = key.toLowerCase();

            if (
                name.includes("state") ||
                name.includes("battle") ||
                name.includes("unit") ||
                name.includes("army") ||
                name.includes("deploy") ||
                name.includes("mission") ||
                name.includes("score") ||
                name.includes("turn") ||
                name.includes("phase")
            ) {
                results[key] = {
                    type: typeof window[key],
                    jsonSize: (() => {
                        try {
                            return JSON.stringify(window[key]).length;
                        } catch(e) {
                            return "non-json";
                        }
                    })()
                };
            }
        } catch(e) {}
    });

    console.table(results);
    return results;
}

window.OnoForgeDebug.inspectBattleCheckpointState = inspectBattleCheckpointState;
