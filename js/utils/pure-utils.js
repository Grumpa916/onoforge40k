/* OnoForge 40K — pure utility functions extracted from index.html. */

function battlefieldDistanceBetween(a,b){
  if(!a||!b)return null;
  const ax=Number(a.x),ay=Number(a.y),bx=Number(b.x),by=Number(b.y);
  if(![ax,ay,bx,by].every(Number.isFinite))return null;
  return Math.hypot(ax-bx,ay-by);
}

function formatSavedListDate(value){
  if(!value)return 'Date not recorded';
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return String(value);
  return d.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}

function unitListCategory(u){const k=(Array.isArray(u.keywords)?u.keywords:[]).map(x=>String(x).toUpperCase());if(k.includes('CHARACTER'))return 0;if(k.includes('MONSTER')||k.includes('VEHICLE')||k.includes('AIRCRAFT')||k.includes('TITANIC')||k.includes('TRANSPORT'))return 2;if(k.includes('INFANTRY'))return 1;return 3}
function unitListCategoryName(u){const c=unitListCategory(u);return c===0?'Characters':c===1?'Infantry':c===2?'Monsters / Vehicles':'Other'}
function sortUnitList(arr){return arr.slice().sort((a,b)=>unitListCategory(a)-unitListCategory(b)||a.name.localeCompare(b.name));}
function wargearCostLabel(points){return Number(points)||0?'+'+(Number(points)||0)+' pts':'Free'}
function secondaryRowInputId(side,name,index){
 return 'score-row-'+side+'-'+String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+index;
}
function secondaryRowNeedsAmount(row){ const vpText=String(row?.[0]||''),condition=String(row?.[1]||''); return /for each/i.test(condition)||/max\s*\d+/i.test(vpText); }

window.OnoForgePureUtils=Object.freeze({
 battlefieldDistanceBetween,formatSavedListDate,
 unitListCategory,unitListCategoryName,sortUnitList,wargearCostLabel,
 secondaryRowInputId,secondaryRowNeedsAmount
});
