/* OnoForge 40K — Pure battlefield geometry utilities.
 *
 * First extraction boundary: coordinate distance only.
 * Existing browser-global compatibility is intentional so current index.html
 * callers can remain unchanged while the monolith is reduced incrementally.
 */
(function(global){
  'use strict';

  function battlefieldDistanceBetween(a,b){
    if(!a||!b)return null;
    const ax=Number(a.x),ay=Number(a.y),bx=Number(b.x),by=Number(b.y);
    if(![ax,ay,bx,by].every(Number.isFinite))return null;
    return Math.hypot(ax-bx,ay-by);
  }

  global.battlefieldDistanceBetween=battlefieldDistanceBetween;
  global.OnoForgeGeometry=Object.freeze({battlefieldDistanceBetween});
})(typeof window!=='undefined'?window:globalThis);
