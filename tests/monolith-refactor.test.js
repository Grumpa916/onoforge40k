const fs=require('fs');
const path=require('path');
const vm=require('vm');
const cp=require('child_process');

const root=process.cwd();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const parser=fs.readFileSync(path.join(root,'js/data/bsdata-parser.js'),'utf8');
const utils=fs.readFileSync(path.join(root,'js/utils/pure-utils.js'),'utf8');

const required=[
  '<script src="js/utils/pure-utils.js"></script>',
  '<script src="js/data/bsdata-parser.js"></script>',
  'const {battlefieldDistanceBetween,formatSavedListDate,unitListCategory,unitListCategoryName,sortUnitList,wargearCostLabel,secondaryRowInputId,secondaryRowNeedsAmount}=window.OnoForgePureUtils;',
  'const {collectBSDataObjects,bsUnitFromEntry}=window.OnoForgeBSDataParser;'
];
for(const marker of required){
  if(!html.includes(marker))throw new Error('Missing refactor marker: '+marker);
}

for(const name of [
  'collectBSDataObjects','bsProfile','bsCharacteristics','bsAbilities',
  'normalize11eWeaponAbilities','bsWeapons','bsWargearOptions','bsUnitFromEntry',
  'battlefieldDistanceBetween','formatSavedListDate','unitListCategory','unitListCategoryName','sortUnitList','wargearCostLabel','secondaryRowInputId','secondaryRowNeedsAmount'
]){
  const count=(html.match(new RegExp('function\\s+'+name+'\\s*\\(','g'))||[]).length;
  if(count!==0)throw new Error('Extracted function still inline: '+name);
}

const inlineBlocks=[];
const openTag='<script>';
const closeTag='</script>';
let scan=0;
while((scan=html.indexOf(openTag,scan))!==-1){
  const end=html.indexOf(closeTag,scan+openTag.length);
  if(end===-1)break;
  inlineBlocks.push(html.slice(scan+openTag.length,end));
  scan=end+closeTag.length;
}
if(!inlineBlocks.length)throw new Error('No inline script blocks found');
inlineBlocks.forEach((src,i)=>{
  const file=path.join('/tmp','onoforge-refactor-inline-'+i+'.js');
  fs.writeFileSync(file,src);
  cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
});
for(const [name,src] of [['bsdata-parser.js',parser],['pure-utils.js',utils]]){
  const file=path.join('/tmp','onoforge-refactor-'+name);
  fs.writeFileSync(file,src);
  cp.execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
}

const sandbox={window:{},console};
vm.runInNewContext(parser,sandbox,{filename:'js/data/bsdata-parser.js'});
vm.runInNewContext(utils,sandbox,{filename:'js/utils/pure-utils.js'});
if(typeof sandbox.window.OnoForgeBSDataParser?.collectBSDataObjects!=='function')throw new Error('Parser module did not expose collectBSDataObjects');
if(typeof sandbox.window.OnoForgeBSDataParser?.bsUnitFromEntry!=='function')throw new Error('Parser module did not expose bsUnitFromEntry');
if(typeof sandbox.window.OnoForgePureUtils?.battlefieldDistanceBetween!=='function')throw new Error('Utility module did not expose battlefieldDistanceBetween');
if(typeof sandbox.window.OnoForgePureUtils?.formatSavedListDate!=='function')throw new Error('Utility module did not expose formatSavedListDate');
for(const name of ['unitListCategory','unitListCategoryName','sortUnitList','wargearCostLabel','secondaryRowInputId','secondaryRowNeedsAmount']){
  if(typeof sandbox.window.OnoForgePureUtils?.[name]!=='function')throw new Error('Utility module did not expose '+name);
}
const categories=[
 {name:'Captain',keywords:['CHARACTER']},
 {name:'Intercessors',keywords:['INFANTRY']},
 {name:'Tyrannofex',keywords:['MONSTER']},
 {name:'Servo Skulls',keywords:[]}
];
if(sandbox.window.OnoForgePureUtils.unitListCategory(categories[0])!==0)throw new Error('Unit category regression');
if(sandbox.window.OnoForgePureUtils.unitListCategory(categories[1])!==1)throw new Error('Unit category regression');
if(sandbox.window.OnoForgePureUtils.unitListCategory(categories[2])!==2)throw new Error('Unit category regression');
if(sandbox.window.OnoForgePureUtils.unitListCategoryName(categories[3])!=='Other')throw new Error('Unit category label regression');
if(sandbox.window.OnoForgePureUtils.sortUnitList([{name:'Zed',keywords:['INFANTRY']},{name:'Alpha',keywords:['CHARACTER']}])[0].name!=='Alpha')throw new Error('Unit sorting regression');
if(sandbox.window.OnoForgePureUtils.wargearCostLabel(0)!=='Free'||sandbox.window.OnoForgePureUtils.wargearCostLabel(10)!=='+10 pts')throw new Error('Wargear cost label regression');


const d=sandbox.window.OnoForgePureUtils.battlefieldDistanceBetween({x:0,y:0},{x:3,y:4});
if(d!==5)throw new Error('Distance helper regression: expected 5, got '+d);

const m=new Map([['a',{id:'a',type:'unit',profiles:[]}]]); 
const collected=sandbox.window.OnoForgeBSDataParser.collectBSDataObjects({id:'root',child:{id:'a'}});
if(typeof collected?.get!=='function'||collected.get('a')?.id!=='a')throw new Error('Parser object collection regression');

console.log('OnoForge monolith refactor checks passed.');
