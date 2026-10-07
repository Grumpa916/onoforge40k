function createBattlefieldGeometryStateController({battlefieldUnitPosition,objectiveStateRecord,battlefieldDistanceBetween,objectiveBattlefieldGeometry}){
  function objectiveDistanceFromUnit(side,uid,objectiveName){
    const unit=battlefieldUnitPosition(side,uid);
    const objective=objectiveStateRecord(objectiveName);
    return unit&&objective.battlefieldPosition?battlefieldDistanceBetween(unit,objective.battlefieldPosition):null;
  }
  function battlefieldTerrainGeometry(){
    const geometry=objectiveBattlefieldGeometry();
    if(!geometry.verified)return {verified:false,terrain:{}};
    const raw=geometry.source.geometryEntry?.terrainGeometry;
    return {verified:true,terrain:raw&&typeof raw==='object'?raw:{}};
  }
  function battlefieldTerrainAtPoint(x,y){
    const geo=battlefieldTerrainGeometry();
    if(!geo.verified)return [];
    const p={x:Number(x),y:Number(y)};
    if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return [];
    const pointInRegion=(r)=>{
      if(!r||typeof r!=='object')return false;
      if([r.x,r.y,r.width,r.height].every(v=>Number.isFinite(Number(v))))
        return p.x>=Number(r.x)&&p.x<=Number(r.x)+Number(r.width)&&p.y>=Number(r.y)&&p.y<=Number(r.y)+Number(r.height);
      if(Array.isArray(r.points)&&r.points.length>=3){
        let inside=false;
        for(let i=0,j=r.points.length-1;i<r.points.length;j=i++){
          const a=r.points[i],b=r.points[j],hit=((Number(a.y)>p.y)!==(Number(b.y)>p.y))&&(p.x<(Number(b.x)-Number(a.x))*(p.y-Number(a.y))/(Number(b.y)-Number(a.y))+Number(a.x));
          if(hit)inside=!inside;
        }
        return inside;
      }
      return false;
    };
    return Object.entries(geo.terrain).filter(([,r])=>pointInRegion(r)).map(([name])=>name);
  }
  function battlefieldTerrainPathIntersections(a,b){
    const geo=battlefieldTerrainGeometry();
    if(!geo.verified||!a||!b)return [];
    const steps=Math.max(2,Math.ceil(battlefieldDistanceBetween(a,b)));
    const hits=new Set();
    for(let i=0;i<=steps;i++){
      const t=i/steps;
      battlefieldTerrainAtPoint(Number(a.x)+(Number(b.x)-Number(a.x))*t,Number(a.y)+(Number(b.y)-Number(a.y))*t).forEach(x=>hits.add(x));
    }
    return Array.from(hits);
  }
  return Object.freeze({objectiveDistanceFromUnit,battlefieldTerrainGeometry,battlefieldTerrainAtPoint,battlefieldTerrainPathIntersections});
}
window.OnoForgeBattlefieldGeometryState=Object.freeze({createBattlefieldGeometryStateController});
