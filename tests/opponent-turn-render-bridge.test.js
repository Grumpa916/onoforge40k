const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const source=fs.readFileSync('opponent-turn-render-fix.js','utf8');
let renderCalls=0;
let inserted=[];
const root={
  querySelector:()=>null,
  insertAdjacentHTML:(position,html)=>inserted.push({position,html})
};
const context={
  state:{page:'battle',currentTurn:'opp'},
  document:{getElementById:id=>id==='battle-view'?root:null},
  render:()=>{renderCalls++;},
  tacticalPreRollResolutionModal:()=>'<div class="modal pr-dice-modal">resolver</div>'
};
context.window=context;
vm.runInNewContext(source,context,{filename:'opponent-turn-render-fix.js'});

assert.ok(context.ONOFORGE_OPPONENT_RESOLVER_RENDER_BRIDGE);
assert.strictEqual(renderCalls,0);
context.render();
assert.strictEqual(renderCalls,1,'Underlying render must still run');
assert.strictEqual(inserted.length,1,'Opponent resolver modal must be mounted after battle render');
assert.strictEqual(inserted[0].position,'beforeend');
assert.ok(inserted[0].html.includes('pr-dice-modal'));

inserted=[];
context.state.currentTurn='my';
context.render();
assert.strictEqual(renderCalls,2);
assert.strictEqual(inserted.length,0,'Bridge must not add opponent resolver UI during my turn');

console.log('Opponent-turn resolver render bridge tests passed');