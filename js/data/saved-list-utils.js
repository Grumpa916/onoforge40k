/* OnoForge 40K — Saved-list pure utilities.
 *
 * First saved-list extraction boundary: policy and date-format helpers only.
 * Existing browser-global names are preserved so current index.html callers
 * remain unchanged while the monolith is reduced incrementally.
 */
(function(global){
  'use strict';

  function isPermanentSampleArmy(id){
    return String(id||'').startsWith('sample-');
  }

  function formatSavedListDate(value){
    if(!value)return 'Date not recorded';
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return String(value);
    return d.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  }

  function rosterCreatedLabel(value){
    if(!value)return '';
    const d=new Date(value);
    if(Number.isNaN(d.getTime()))return '';
    return d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  }

  function savedRosterDisplayName(x){
    const stamp=rosterCreatedLabel(x?.created);
    return (x?.name||'Unnamed Roster')+(stamp?' • '+stamp:'');
  }

  global.isPermanentSampleArmy=isPermanentSampleArmy;
  global.formatSavedListDate=formatSavedListDate;
  global.rosterCreatedLabel=rosterCreatedLabel;
  global.savedRosterDisplayName=savedRosterDisplayName;
  global.OnoForgeSavedListUtils=Object.freeze({
    isPermanentSampleArmy,
    formatSavedListDate,
    rosterCreatedLabel,
    savedRosterDisplayName
  });
})(typeof window!=='undefined'?window:globalThis);
