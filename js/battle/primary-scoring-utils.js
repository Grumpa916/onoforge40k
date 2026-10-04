/* OnoForge 40K — Primary scoring pure utilities.
 *
 * First scoring extraction boundary: parsing/classification helpers only.
 * Existing browser-global names are preserved so current index.html callers
 * remain unchanged while the monolith is reduced incrementally.
 */
(function(global){
  'use strict';

  function primaryScoringRoundRange(timing){
    const text=String(timing||'').toUpperCase();
    const m=text.match(/R(\d+)\s*[–—-]\s*(\d+)/);
    if(m)return {min:Number(m[1]),max:Number(m[2])};
    const plus=text.match(/R(\d+)\s*\+/);
    if(plus)return {min:Number(plus[1]),max:5};
    const single=text.match(/R(\d+)\b/);
    if(single)return {min:Number(single[1]),max:Number(single[1])};
    return {min:1,max:5};
  }

  function primaryScoringVP(value){
    const m=String(value||'').match(/\d+/);
    return m?Math.max(0,Number(m[0])||0):0;
  }

  function primaryScoringIsPer(row){
    const text=String(row?.[2]||'').toLowerCase();
    return /\bper\b|\bfor each\b/.test(text);
  }

  global.primaryScoringRoundRange=primaryScoringRoundRange;
  global.primaryScoringVP=primaryScoringVP;
  global.primaryScoringIsPer=primaryScoringIsPer;
  global.OnoForgePrimaryScoringUtils=Object.freeze({
    primaryScoringRoundRange,
    primaryScoringVP,
    primaryScoringIsPer
  });
})(typeof window!=='undefined'?window:globalThis);
