/* OnoForge 40K — unit display label utility.
 *
 * Pure Greek-letter suffix formatting used when multiple copies of a unit
 * share the same datasheet name. Existing browser-global name is preserved.
 */
(function(global){
  'use strict';
  function alphaLabel(n){
    const greek=['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω'];
    n=Math.max(1,Math.floor(Number(n)||1));
    let s='';
    while(n>0){n--;s=greek[n%greek.length]+s;n=Math.floor(n/greek.length)}
    return s;
  }
  global.alphaLabel=alphaLabel;
  global.OnoForgeUnitDisplayUtils=Object.freeze({alphaLabel});
})(typeof window!=='undefined'?window:globalThis);
