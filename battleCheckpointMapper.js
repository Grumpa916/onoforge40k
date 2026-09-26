// ==========================================
// OnoForge Battle Checkpoint Mapper v1
// Maps discovered app state into checkpoint fields
// No gameplay changes
// ==========================================

window.OnoForgeDebug = window.OnoForgeDebug || {};

function mapCheckpointField(name, value){
    return {
        field: name,
        available: value !== undefined && value !== null,
        type: typeof value
    };
}

function inspectCheckpointMappingCandidates(source = window){
    const candidates = {};

    Object.keys(source).forEach(key => {
        const lower = key.toLowerCase();

        if(
            lower.includes('mission') ||
            lower.includes('deploy') ||
            lower.includes('terrain') ||
            lower.includes('unit') ||
            lower.includes('army') ||
            lower.includes('score') ||
            lower.includes('vp') ||
            lower.includes('cp') ||
            lower.includes('round') ||
            lower.includes('phase')
        ){
            candidates[key] = mapCheckpointField(key, source[key]);
        }
    });

    console.table(candidates);
    return candidates;
}

window.OnoForgeDebug.inspectCheckpointMappingCandidates = inspectCheckpointMappingCandidates;
