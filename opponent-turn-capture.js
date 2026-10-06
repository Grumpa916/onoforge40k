/* OnoForge 40K — legacy opponent-turn capture shim
 *
 * The production opponent-turn capture UI is integrated in index.html.
 * This file intentionally exports metadata only so older preview tooling
 * cannot create a second capture surface.
 */
(function(global){
  'use strict';
  global.ONOFORGE_OPPONENT_CAPTURE_UI=Object.freeze({
    version:2,
    integratedInIndex:true,
    note:'Production opponent-turn capture UI lives in index.html'
  });
})(window);
