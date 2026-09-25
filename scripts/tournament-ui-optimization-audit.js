const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data','warhammer-event-companion-v1.2.json'),'utf8'));
const checks=[];
const check=(name,condition,detail='')=>checks.push({name,pass:!!condition,detail});
const has=re=>re.test(html);

check('Task 26 tablet UI layer exists',has(/id="onoforge-task26-tournament-ui"/),'Tournament UI changes must remain isolated in the named Task 26 style layer.');
check('Tablet battle surface preserves two-column state',has(/#battle-view \.battle-layout\{grid-template-columns:minmax\(0,1fr\) minmax\(320px,380px\)/),'Tablet layouts must retain the main battle state plus tactical/support column.');
check('Tournament command controls are touch-safe',
  has(/#battle-view \.battle-inline-controls \.btn,/) && has(/#battle-view \.battle-control-row \.btn,/) && has(/#battle-view \.bottom-action-buttons \.btn\{min-height:44px/),
  'Primary tournament command controls must have at least a 44px touch target on tablet.');
check('Tournament phase control is context-aware',
  has(/id="next-phase-btn"[^>]*>\$\{state\.phase==='Fight' \?/) &&
  has(/End Turn → Opponent/) && has(/End Turn → Next Round/) && has(/Finish Battle/),
  'The primary phase control must explicitly communicate when it ends the active player turn or battle.');
check('Turn controls are touch-safe',has(/#battle-view \.current-turn-btn\{min-height:40px/),'Turn switching controls must remain usable on a tablet.');
check('Battle command rail remains available',has(/#battle-view \.battle-bottom-actions\{[^}]*position:sticky/),'High-frequency battle commands must remain accessible without scrolling back through the page.');
check('Responsive tablet breakpoint is explicit',has(/@media \(min-width:701px\) and \(max-width:1100px\)/),'Intermediate tablet widths must receive an explicit layout profile.');
check('Tablet preserves compact data density',has(/#battle-view \.score-card\{padding:8px\}/) && has(/#battle-view \.vp-number\{font-size:36px\}/),'Score information must remain dense enough for tournament use at intermediate tablet widths.');
check('Advisor remains integrated',has(/#battle-view #onoforge-advisor-render/) && has(/\.ta-grid\{grid-template-columns:repeat\(8,minmax\(0,1fr\)/),'Task 26 must not remove the Task 25 Tactical Advisor surface.');
check('11th-edition guard remains',!(/Big Guns Never Tire/i.test(html)),'Legacy 10th-edition rule text must remain absent.');
check('Verified Event Companion geometry remains intact',Array.isArray(data.layoutGeometry?.layouts)&&data.layoutGeometry.layouts.length===45&&data.layoutGeometry.layouts.every(x=>x?.verified===true),'UI work must not weaken the verified 45-layout source.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Task 26 tournament UI optimization audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
