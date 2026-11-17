(() => {
  // Pure display conversion; the established camera and transform are supplied by main.js.
  function projectMesh(solid,display,{transform,project,reverse,viewDirection}){
    const world=display.vertices.map(v=>transform(solid,v)),projected=world.map(project),groups=new Map();
    for(const tri of display.triangles){
      const indices=reverse?[...tri.indices].reverse():tri.indices;
      const [a,b,c]=indices.map(i=>world[i]),u=[b.x-a.x,b.y-a.y,b.z-a.z],v=[c.x-a.x,c.y-a.y,c.z-a.z];
      const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      if(n.reduce((sum,value,i)=>sum+value*viewDirection[i],0)<=0)continue;
      const points=indices.map(i=>projected[i]),face=display.faces.find(f=>f.id===tri.faceId);
      if(!face)throw Error('Mesh triangle has no source face');
      const group=groups.get(face.id)??{solid,faceId:face.id,faceName:face.name,faceIndex:face.faceIndex,paths:[],depth:0};
      group.paths.push(points);group.depth+=points.reduce((sum,p)=>sum+p.depth,0)/3;groups.set(face.id,group);
    }
    const faces=[...groups.values()].map(g=>({...g,depth:g.depth/g.paths.length}));
    const edges=display.edges.map(edge=>({solid,id:edge.id,points:edge.points.map(p=>project(transform(solid,{x:p[0],y:p[1],z:p[2]})))}));
    return {faces,edges};
  }
  window.PrometheusSolidSvg=Object.freeze({projectMesh});
})();
