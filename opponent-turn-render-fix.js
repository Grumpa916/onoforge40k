/* OnoForge 40K — opponent-turn resolver render bridge
 *
 * The shared physical-dice resolver is already authoritative and integrated
 * in index.html. During opponent turns, the Battle renderer intentionally
 * swaps the normal Tactical Advisor surface for opponentTurnTrackingHtml().
 * That branch omitted the existing shared resolver modal, so an active
 * opponent resolver session could be created without a visible modal.
 *
 * This bridge does not create a second resolver or history store. It only
 * mounts the existing tacticalPreRollResolutionModal() after the normal
 * Battle render when an observed opponent resolver session is active.
 *
 * Note: application state is a top-level lexical binding in index.html, not
 * necessarily a window property. The bridge therefore asks the existing
 * resolver modal function for its current HTML instead of reading window.state.
 */
(function(global){
  'use strict';

  const VERSION=2;
  const INSTALL_FLAG='__ONOFORGE_OPPONENT_RESOLVER_RENDER_BRIDGE__';

  function install(){
    if(global[INSTALL_FLAG])return true;
    if(typeof global.render!=='function')return false;

    const originalRender=global.render;
    global.render=function(){
      const result=originalRender.apply(this,arguments);
      try{
        if(typeof global.tacticalPreRollResolutionModal!=='function')return result;
        const root=global.document&&global.document.getElementById('battle-view');
        if(!root)return result;
        if(root.querySelector('.pr-dice-modal'))return result;
        const html=global.tacticalPreRollResolutionModal();
        if(html)root.insertAdjacentHTML('beforeend',html);
      }catch(_e){
        // Rendering must never break the underlying battle UI.
      }
      return result;
    };

    global[INSTALL_FLAG]=true;
    return true;
  }

  install();
  global.ONOFORGE_OPPONENT_RESOLVER_RENDER_BRIDGE=Object.freeze({VERSION,install});
})(window);