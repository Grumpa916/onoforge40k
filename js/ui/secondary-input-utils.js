/* OnoForge 40K — secondary score input ID utility.
 *
 * Pure DOM-id formatting for secondary-score controls. No battle state,
 * scoring mutation, DOM access, persistence, or network dependency.
 */
(function(global){
  'use strict';
  function secondaryInputId(side,name){
    return 'score-'+side+'-'+String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }
  global.secondaryInputId=secondaryInputId;
  global.OnoForgeSecondaryInputUtils=Object.freeze({secondaryInputId});
})(typeof window!=='undefined'?window:globalThis);
