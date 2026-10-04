/* OnoForge 40K — HTML/text presentation utility.
 *
 * Pure HTML escaping boundary extracted from index.html. The browser-global
 * name is preserved so existing callers remain unchanged.
 */
(function(global){
  'use strict';

  function esc(s){
    return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  global.esc=esc;
  global.OnoForgeHtmlUtils=Object.freeze({esc});
})(typeof window!=='undefined'?window:globalThis);
