const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const source=fs.readFileSync('opponent-turn-render-fix.js','utf8');
let renderCalls=0;
let inserted=[];
let existingModal=false;
const root={
  querySelector:()=>existingModal?{}:null,
  insertAdjacentHTML:(position,html)=>inserted.push({position,html})
};

// index.html uses top-level lexical state; window.state is intentionally
// absent in this harness. The bridge must still render the existing modal.
const context={
  document:{getElementById:id=>id==='battle-view'?root:null},
  render:()=>{renderCalls++;},
  tacticalPreRollResolutionModal:()=>'<div class="modal pr-dice-modal">resolver</div>'
};
context.window=context;
vm.runInNewContext(source,context,{filename:'opponent-turn-render-fix.js'});

assert.ok(context.ONOFORGE_OPPONENT_RESOLVER_RENDER_BRIDGE);
assert.strictEqual(context.ONOFORGE_OPPONENT_RESOLVER_RENDER_BRIDGE.VERSION,2);
assert.strictEqual(renderCalls,0);

context.render();
assert.strictEqual(renderCalls,1,'Underlying render must still run');
assert.strictEqual(inserted.length,1,'Active shared resolver modal must be mounted after battle render');
assert.strictEqual(inserted[0].position,'beforeend');
assert.ok(inserted[0].html.includes('pr-dice-modal'));

inserted=[];
existingModal=true;
context.render();
assert.strictEqual(renderCalls,2);
assert.strictEqual(inserted.length,0,'Bridge must not duplicate an already-mounted resolver modal');

inserted=[];
existingModal=false;
context.render();
assert.strictEqual(renderCalls,3);
assert.strictEqual(inserted.length,1,'Bridge should continue to mount the shared modal when it is absent');

console.log('Opponent-turn resolver render bridge tests passed');