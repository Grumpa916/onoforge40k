(function(global){
  'use strict';
  if(!global.document)return;

  function removeStagingHost(){
    const host=global.document.getElementById('onoforge-advisor-render');
    if(!host)return false;
    const panel=Array.from(global.document.querySelectorAll('.tactical-advisor-card'))
      .find(card=>card!==host&&!card.contains(host));
    const mount=panel?.querySelector('[data-onoforge-tactical-impact-mount]');
    if(!mount)return false;
    host.remove();
    return true;
  }

  function start(){
    removeStagingHost();
    const observer=new global.MutationObserver(function(){removeStagingHost();});
    observer.observe(global.document.body,{childList:true,subtree:true});
    global.setInterval(removeStagingHost,500);
  }

  if(global.document.readyState==='loading')global.document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})(window);
