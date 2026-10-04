/* OnoForge 40K — pure dice-value parsing utility.
 *
 * Extracted from index.html without changing the existing browser-global
 * parseNum name used by the math engine.
 */
(function(global){
  'use strict';

  function parseNum(v){
    const s=String(v).trim().toUpperCase();
    if(/^D6$/.test(s))return 3.5;
    let m=s.match(/^(\d*)D6(?:\+(\d+))?$/);
    if(m)return (+(m[1]||1))*3.5+(+(m[2]||0));
    return Number(s)||1;
  }

  global.parseNum=parseNum;
  global.OnoForgeDiceUtils=Object.freeze({parseNum});
})(typeof window!=='undefined'?window:globalThis);
