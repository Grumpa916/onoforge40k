const fs=require('fs');

const layer=fs.readFileSync('opponent-turn-event-layer.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,condition,detail='')=>checks.push({name,pass:!!condition,detail});

check('Read-only history adapter exists',layer.includes('ONOFORGE_OPPONENT_EVENT_CAPTURE')&&layer.includes('function historyFromState()'));
check('Authoritative history source is state.events',layer.includes('global.state?.events')&&!layer.includes('s.combatHistory=')&&!layer.includes('s.events.push('));
check('Attack identities remain explicit',layer.includes('p.attackerEntryUid||p.attackerUid||p.sourceUid')&&layer.includes('p.targetEntryUid||p.targetUid||p.defenderUid'));
check('Attack side is explicit',layer.includes('attackerSide=sideOf(p.attackerSide||p.sourceSide||p.side||e?.playerTurn)'));
check('Both attack directions can be represented',layer.includes("targetSide=sideOf(p.targetSide||p.defenderSide)||(attackerSide==='opp'?'my':attackerSide==='my'?'opp':null)"));
check('Charge outcome is explicit',layer.includes("result!=='Successful'&&result!=='Failed'"));
check('Charge does not infer movement distance',layer.includes('measuredDistance:finite(p.measuredDistance)')&&!layer.includes('2d6'));
check('Unknown identities are rejected',layer.includes('entryExists(attackerUid,attackerSide)')&&layer.includes('entryExists(targetUid,targetSide)'));
check('Adapter does not install a competing event logger',!layer.includes('global.event=function')&&!layer.includes('original.apply(this,arguments)'));
check('Production resolver supports arbitrary sides',index.includes('function tacticalPreRollOpenResolutionForSides(attackerSide,targetSide'));
check('Physical sessions retain both sides',index.includes('session.attackerSide=as;session.targetSide=ts;'));
check('Authoritative attack events retain attacker side',index.includes("event('ATTACK_RESOLUTION',{resolutionId,")&&index.includes('side:attackerSide'));
check('Fight resolution uses the shared resolver',index.includes('function tacticalOpenFightResolution(')&&index.includes('tacticalOpenOpponentCombatResolution('));
check('Fight completion is event-driven',index.includes('function tacticalFightResolvedForSide(')&&index.includes("e?.kind==='ATTACK_RESOLUTION'"));
check('Opponent Charge is factual only',index.includes('chargeMoveInferred:false')&&index.includes('movementObserved'));
check('No legacy Fight marker buttons remain',!index.includes('Mark Friendly Fight Resolved')&&!index.includes('Record Enemy Fight Back'));
check('Combat History is derived, not duplicated',index.includes('function combatHistoryEvents()')&&index.includes('combatHistoryHtml()')&&!index.includes('state.combatHistory'));

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'OnoForge bidirectional combat architecture',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);