/* OnoForge 40K — unit-list pure utilities.
 *
 * Categorization and sorting helpers for the army/unit selection UI.
 * Existing browser-global names are preserved so current index.html callers
 * remain unchanged while the monolith is reduced incrementally.
 */
(function(global){
  'use strict';

  function unitListCategory(u){
    const k=(Array.isArray(u.keywords)?u.keywords:[]).map(x=>String(x).toUpperCase());
    if(k.includes('CHARACTER'))return 0;
    if(k.includes('MONSTER')||k.includes('VEHICLE')||k.includes('AIRCRAFT')||k.includes('TITANIC')||k.includes('TRANSPORT'))return 2;
    if(k.includes('INFANTRY'))return 1;
    return 3;
  }

  function sortUnitList(arr){
    return arr.slice().sort((a,b)=>unitListCategory(a)-unitListCategory(b)||a.name.localeCompare(b.name));
  }

  function unitListCategoryName(u){
    const c=unitListCategory(u);
    return c===0?'Characters':c===1?'Infantry':c===2?'Monsters / Vehicles':'Other';
  }

  global.unitListCategory=unitListCategory;
  global.sortUnitList=sortUnitList;
  global.unitListCategoryName=unitListCategoryName;
  global.OnoForgeUnitListUtils=Object.freeze({unitListCategory,sortUnitList,unitListCategoryName});
})(typeof window!=='undefined'?window:globalThis);
