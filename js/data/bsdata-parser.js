/* OnoForge 40K — BSData parser extracted from index.html.
 *
 * First extraction boundary: parser only.
 * Browser-global compatibility is intentional for this first incremental step;
 * the application bootstrap remains inline in index.html.
 */

function collectBSDataObjects(root){
  const map=new Map(), seen=new Set();
  function walk(x){
    if(!x||typeof x!=='object'||seen.has(x))return;
    seen.add(x);
    if(typeof x.id==='string')map.set(x.id,x);
    Object.keys(x).forEach(k=>walk(x[k]));
  }
  walk(root);
  return map;
}

function bsProfile(entry,typeName){
  return (entry?.profiles||[]).find(p=>p.typeName===typeName) || null;
}

function bsCharacteristics(profile){
  const out={};
  (profile?.characteristics||[]).forEach(c=>{
    const rawName=String(c?.name||'').trim();
    if(!rawName)return;
    const key=rawName==='LD'?'Ld':rawName==='Range'?'rng':rawName;
    out[key]=c.$text??'';
  });
  return out;
}

function normalize11eWeaponAbilities(raw){
  const src=Array.isArray(raw)?raw:[];
  const out=[];
  src.forEach(value=>{
    const text=String(value??'').trim();
    if(!text)return;
    const normalized=text.toUpperCase().replace(/-/g,' ').replace(/_/g,' ').replace(/\s+/g,' ').trim();
    if(normalized==='PISTOL') out.push('CLOSE QUARTERS');
    else out.push(text);
  });
  return [...new Set(out)];
}

function bsAbilities(entry, context = {}){
  const out=[],seen=new Set();
  function walk(x){
    if(!x||typeof x!=='object')return;
    if(Array.isArray(x.profiles)){
      x.profiles.forEach(p=>{
        if(String(p.typeName||'').toLowerCase()!=='abilities')return;
        const description=(p.characteristics||[]).find(c=>c.name==='Description')?.$text||'';
        if(!p.name||!description||seen.has(p.name))return;
        seen.add(p.name);
        out.push({name:p.name,description});
      });
    }
    if(Array.isArray(x.selectionEntries))x.selectionEntries.forEach(walk);
    if(Array.isArray(x.selectionEntryGroups))x.selectionEntryGroups.forEach(walk);
    if(Array.isArray(x.entryLinks)){
      x.entryLinks.forEach(link=>{
        const targetId=link.targetId||link.id;
        if(context.objectMap&&targetId){
          const target=context.objectMap.get(targetId);
          if(target)walk(target);
        }
      });
    }
  }
  walk(entry);
  return out;
}

function bsWeapons(entry, context = {}){
  const out=[], seen=new Set(), visited=new Set();
  const objectMap=context.objectMap && typeof context.objectMap.get==='function' ? context.objectMap : null;
  function walk(x){
    if(!x||typeof x!=='object')return;
    const objectId=x.id||x.targetId;
    if(objectId){
      if(visited.has(objectId))return;
      visited.add(objectId);
    }
    if(Array.isArray(x.profiles)){
      x.profiles.forEach(p=>{
        const type=String(p.typeName||'').toLowerCase();
        if(type!=='ranged weapons' && type!=='melee weapons' && !type.includes('ranged weapon') && !type.includes('melee weapon'))return;
        const chars=bsCharacteristics(p);
        const w={name:p.name,...chars,abilities:normalize11eWeaponAbilities(chars.Keywords?[chars.Keywords]:[])};
        delete w.Keywords;
        const key=JSON.stringify(w);
        if(!seen.has(key)){seen.add(key);out.push(w);}
      });
    }
    if(Array.isArray(x.selectionEntries))x.selectionEntries.forEach(walk);
    if(Array.isArray(x.selectionEntryGroups))x.selectionEntryGroups.forEach(walk);
    if(Array.isArray(x.entryLinks)){
      x.entryLinks.forEach(link=>{
        const targetId=link.targetId||link.id;
        if(objectMap && targetId){
          const target=objectMap.get(targetId);
          if(target)walk(target);
        }
      });
    }
  }
  walk(entry);
  return out;
}

function bsWargearOptions(entry){
  const out=[],seen=new Set();
  function walk(x){
    if(!x||typeof x!=='object')return;
    if(Array.isArray(x.selectionEntries))x.selectionEntries.forEach(s=>{
      if(s.type==='upgrade' && s.name && !seen.has(s.name)){
        seen.add(s.name);out.push(s.name);
      }
      walk(s);
    });
    if(Array.isArray(x.selectionEntryGroups))x.selectionEntryGroups.forEach(walk);
  }
  walk(entry);
  return out;
}

function bsUnitFromEntry(entry,faction,context = {}){
  if(!entry||entry.type!=='unit')return null;
  const p=bsProfile(entry,'Unit');
  if(!p)return null;
  const stats=bsCharacteristics(p);
  const pts=(entry.costs||[]).find(c=>c.name==='pts');
  const categories=(entry.categoryLinks||[]).map(c=>c.name).filter(Boolean);
  const weapons=bsWeapons(entry, context);
  return {
    id:`${faction}_${String(entry.name).toLowerCase().replace(/[^a-z0-9]+/g,'_')}`,
    name:entry.name,
    faction,
    points:pts?Number(pts.value):0,
    models:1,
    wounds:Number(stats.W)||1,
    profile:stats,
    keywords:categories,
    abilities:bsAbilities(entry, context),
    weapons,
    weaponOptions:bsWargearOptions(entry),
    dataSource:'BSData 11e',
    dataVersion:'current',
    sourceRole:'supplemental'
  };
}

window.OnoForgeBSDataParser = Object.freeze({
  collectBSDataObjects,
  bsUnitFromEntry
});
