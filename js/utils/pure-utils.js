/* OnoForge 40K — pure utility functions extracted from index.html. */

function battlefieldDistanceBetween(a,b){
  if(!a||!b)return null;
  const ax=Number(a.x),ay=Number(a.y),bx=Number(b.x),by=Number(b.y);
  if(![ax,ay,bx,by].every(Number.isFinite))return null;
  return Math.hypot(ax-bx,ay-by);
}

function formatSavedListDate(value){
  if(!value)return 'Date not recorded';
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return String(value);
  return d.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}

window.OnoForgePureUtils=Object.freeze({battlefieldDistanceBetween,formatSavedListDate});
