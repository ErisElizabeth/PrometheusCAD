// Shared browser/Electron kernel code. No DOM, Node filesystem, or application imports.
export const KERNEL_VERSION = '2.0.0-beta.b5ff984';
export const identity = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
export function multiply(a,b) {
  return Array.from({length:16},(_,i)=>Array.from({length:4},(_,k)=>a[Math.floor(i/4)*4+k]*b[k*4+i%4]).reduce((s,v)=>s+v,0));
}
export function transform(m,p) {
  return [m[0]*p[0]+m[1]*p[1]+m[2]*p[2]+m[3],m[4]*p[0]+m[5]*p[1]+m[6]*p[2]+m[7],m[8]*p[0]+m[9]*p[1]+m[10]*p[2]+m[11]];
}
export function project(p,yaw=45*Math.PI/180,pitch=35.264*Math.PI/180) {
  const [x,y,z]=p, depth=x*Math.sin(yaw)+y*Math.cos(yaw);
  return {x:x*Math.cos(yaw)-y*Math.sin(yaw),y:z*Math.cos(pitch)+depth*Math.sin(pitch),depth:-depth*Math.cos(pitch)+z*Math.sin(pitch)};
}
const rounded=n=>Math.abs(n)<1e-8?0:Number(n.toFixed(8));
const enumValue=e=>e?.value ?? e;
const xyz=p=>[p.X(),p.Y(),p.Z()];
const near=(a,b,t=1e-8)=>Math.abs(a-b)<=t;
function assert(value,message) {if(!value)throw new Error(message);}
export function createEngine(oc,{draftReference=null}={}) {
  const lifetime={created:0,deleted:0,cleanupErrors:[]};
  function scope(fn) {
    const objects=[];
    const own=o=>{objects.push(o);lifetime.created++;return o;};
    try{return fn(own);}finally{
      for(const o of objects.reverse())try{o.delete();lifetime.deleted++;}catch(e){lifetime.cleanupErrors.push(String(e));}
    }
  }
  function shapes(shape,kind,own) {
    const map=own(new oc.TopTools_IndexedMapOfShape_1());
    oc.TopExp.MapShapes_1(shape,oc.TopAbs_ShapeEnum['TopAbs_'+kind],map);
    return Array.from({length:map.Extent()},(_,i)=>{
      const raw=own(map.FindKey(i+1));
      return kind==='FACE'?own(oc.TopoDS.Face_1(raw)):kind==='EDGE'?own(oc.TopoDS.Edge_1(raw)):raw;
    });
  }
  function bounds(shape,own) {
    const b=own(new oc.Bnd_Box_1());
    oc.BRepBndLib.AddOptimal(shape,b,false,false);
    return {min:xyz(own(b.CornerMin())),max:xyz(own(b.CornerMax()))};
  }
  function properties(shape,kind,own) {
    const p=own(new oc.GProp_GProps_1());
    if(kind==='FACE')oc.BRepGProp.SurfaceProperties_1(shape,p,false,false);
    else if(kind==='EDGE')oc.BRepGProp.LinearProperties(shape,p,false,false);
    else oc.BRepGProp.VolumeProperties_1(shape,p,true,false,false);
    return {measure:p.Mass(),center:xyz(own(p.CentreOfMass()))};
  }
  function describe(shape,kind,own) {
    const props=properties(shape,kind,own), box=bounds(shape,own);
    const adaptor=kind==='FACE'?own(new oc.BRepAdaptor_Surface_2(shape,true)):own(new oc.BRepAdaptor_Curve_2(shape));
    const type=enumValue(adaptor.GetType());
    // Fixture-scoped geometric identity. Ambiguous matches are rejected, never guessed.
    const signature=JSON.stringify([type,rounded(props.measure),props.center.map(rounded),box.min.map(rounded),box.max.map(rounded)]);
    return {type,...props,bounds:box,signature};
  }
  function faceRole(desc) {
    const c=desc.center;
    if(near(c[2],0))return 'bottom'; if(near(c[2],1))return 'top';
    if(near(c[1],-.5))return 'front'; if(near(c[0],1))return 'right';
    if(near(c[1],.5))return 'back'; if(near(c[0],-1))return 'left';
    return 'bore-wall';
  }
  const originalEdgeCenters=[[0,-.5,0],[1,0,0],[0,.5,0],[-1,0,0],[0,-.5,1],[1,0,1],[0,.5,1],[-1,0,1],[-1,-.5,.5],[1,-.5,.5],[1,.5,.5],[-1,.5,.5]];
  function naming(shape,own) {
    const faces=shapes(shape,'FACE',own).map(face=>{const d=describe(face,'FACE',own);return {id:faceRole(d),...d};});
    const edges=shapes(shape,'EDGE',own).map(edge=>describe(edge,'EDGE',own)).sort((a,b)=>a.signature.localeCompare(b.signature));
    let newEdge=0;
    const namedEdges=edges.map(d=>{
      const old=originalEdgeCenters.findIndex(c=>c.every((v,i)=>near(v,d.center[i])));
      return {id:old>=0?`e${old}`:`bore-edge-${++newEdge}`,...d};
    });
    for(const [label,list]of [['faces',faces],['edges',namedEdges]]) {
      assert(new Set(list.map(d=>d.signature)).size===list.length,`Ambiguous ${label} signatures`);
      assert(new Set(list.map(d=>d.id)).size===list.length,`Ambiguous ${label} roles`);
    }
    return {method:'fixture-signatures-v1',faces,edges:namedEdges};
  }
  function validate(shape,own) {
    const checker=own(new oc.BRepCheck_Analyzer(shape,true,false));
    const counts=Object.fromEntries(['FACE','EDGE','VERTEX','SOLID'].map(k=>[k.toLowerCase(),shapes(shape,k,own).length]));
    return {valid:checker.IsValid_2(),counts,volume:properties(shape,'SOLID',own).measure,bounds:bounds(shape,own)};
  }
  function fixture(own) {
    const corner=own(new oc.gp_Pnt_3(-1,-.5,0));
    const boxMaker=own(new oc.BRepPrimAPI_MakeBox_3(corner,2,1,1));
    const box=own(boxMaker.Shape());
    const origin=own(new oc.gp_Pnt_3(0,0,-.25)), direction=own(new oc.gp_Dir_4(0,0,1));
    const axes=own(new oc.gp_Ax2_3(origin,direction));
    const cylinderMaker=own(new oc.BRepPrimAPI_MakeCylinder_3(axes,.25,1.5));
    const cylinder=own(cylinderMaker.Shape()), progress=own(new oc.Message_ProgressRange_1());
    const t=performance.now();
    const cutMaker=own(new oc.BRepAlgoAPI_Cut_3(box,cylinder,progress));
    assert(cutMaker.IsDone(),'Boolean cut did not complete');
    const cut=own(cutMaker.Shape());
    return {boxMaker,box,cylinder,cutMaker,cut,cutMs:performance.now()-t};
  }
  function mesh(shape,names,deflection,own) {
    const start=performance.now();
    // Clean prior tessellation so coarse/fine measurements are independent.
    oc.BRepTools.Clean(shape,false);
    const mesher=own(new oc.BRepMesh_IncrementalMesh_2(shape,deflection,false,.2,false));
    assert(mesher.IsDone(),'Meshing failed');
    const positions=[],triangles=[],edges=[];
    for(const face of shapes(shape,'FACE',own)) {
      const desc=describe(face,'FACE',own), matches=names.faces.filter(n=>n.signature===desc.signature);
      assert(matches.length===1,'Face identity unresolved or ambiguous');
      const faceId=matches[0].id;
      const loc=own(new oc.TopLoc_Location_1());
      const handle=own(oc.BRep_Tool.Triangulation(face,loc,0));
      assert(!handle.IsNull(),`Missing triangulation on ${faceId}`);
      // handle.get() is borrowed; retain and dispose the handle, not the pointee.
      const tri=handle.get(), local=own(loc.Transformation()), offset=positions.length;
      for(let i=1;i<=tri.NbNodes();i++) {
        const point=own(tri.Node(i));point.Transform(local);positions.push(xyz(point));
      }
      const reversed=enumValue(face.Orientation_1())===enumValue(oc.TopAbs_Orientation.TopAbs_REVERSED);
      for(let i=1;i<=tri.NbTriangles();i++) {
        const t=own(tri.Triangle(i)), indices=[t.Value(1)-1+offset,t.Value(2)-1+offset,t.Value(3)-1+offset];
        if(reversed)[indices[1],indices[2]]=[indices[2],indices[1]];
        triangles.push({faceId,indices});
      }
    }
    for(const edge of shapes(shape,'EDGE',own)) {
      const desc=describe(edge,'EDGE',own), matches=names.edges.filter(n=>n.signature===desc.signature);
      assert(matches.length===1,'Edge identity unresolved or ambiguous');
      const curve=own(new oc.BRepAdaptor_Curve_2(edge));
      const sample=own(new oc.GCPnts_QuasiUniformDeflection_2(curve,deflection,oc.GeomAbs_Shape.GeomAbs_C0));
      assert(sample.IsDone(),'Edge sampling failed');
      const points=Array.from({length:sample.NbPoints()},(_,i)=>xyz(own(sample.Value(i+1))));
      edges.push({id:matches[0].id,points});
    }
    return {positions,triangles,edges,deflection,meshMs:performance.now()-start};
  }
  function writeBrep(shape,own) {
    const progress=own(new oc.Message_ProgressRange_1()),path='/tmp/prototype.brep';
    const result=oc.BRepTools.Write_4(shape,path,false,false,oc.TopTools_FormatVersion.TopTools_FormatVersion_CURRENT,progress);
    assert(result,'BRepTools.Write_4 returned false');
    try{return oc.FS.readFile(path,{encoding:'utf8'});}finally{oc.FS.unlink(path);}
  }
  function readBrep(text,own) {
    const path='/tmp/prototype-read.brep';oc.FS.writeFile(path,text);
    const shape=own(new oc.TopoDS_Shape()),builder=own(new oc.BRep_Builder()),progress=own(new oc.Message_ProgressRange_1());
    try{assert(oc.BRepTools.Read_2(shape,path,builder,progress)&&!shape.IsNull(),'Invalid B-rep payload');return shape;}
    finally{oc.FS.unlink(path);}
  }
  function restoreNames(shape,saved,own) {
    const next={...saved,faces:[],edges:[]};
    for(const [kind,key]of [['FACE','faces'],['EDGE','edges']])for(const sub of shapes(shape,kind,own)) {
      const d=describe(sub,kind,own),matches=saved[key].filter(n=>n.signature===d.signature);
      assert(matches.length===1,`Unresolved/ambiguous persisted ${kind} identity`);
      next[key].push({...matches[0],...d});
    }
    assert(next.faces.length===saved.faces.length&&next.edges.length===saved.edges.length,'Incomplete persisted topology');
    for(const key of ['faces','edges'])assert(new Set(next[key].map(n=>n.id)).size===next[key].length,'Duplicate persisted identities');
    return next;
  }
  function transformKernel(shape,matrix,own) {
    const trsf=own(new oc.gp_Trsf_1());trsf.SetValues(...matrix.slice(0,12));
    const builder=own(new oc.BRepBuilderAPI_Transform_2(shape,trsf,true));
    return own(builder.Shape());
  }
  // Drafted-Box path: independent of the original, deliberately fixed bore fixture.
  const draftFaces=[
    {id:'bottom',vertexIds:['v0','v3','v2','v1'],edgeIds:['e3','e2','e1','e0']},
    {id:'top',vertexIds:['v4','v5','v6','v7'],edgeIds:['e4','e5','e6','e7']},
    {id:'front',vertexIds:['v0','v1','v5','v4'],edgeIds:['e0','e9','e4','e8']},
    {id:'right',vertexIds:['v1','v2','v6','v5'],edgeIds:['e1','e10','e5','e9']},
    {id:'back',vertexIds:['v2','v3','v7','v6'],edgeIds:['e2','e11','e6','e10']},
    {id:'left',vertexIds:['v3','v0','v4','v7'],edgeIds:['e3','e8','e7','e11']},
  ];
  const draftEdges=[['v0','v1'],['v1','v2'],['v2','v3'],['v3','v0'],['v4','v5'],['v5','v6'],['v6','v7'],['v7','v4'],['v0','v4'],['v1','v5'],['v2','v6'],['v3','v7']];
  const subtract=(a,b)=>a.map((v,i)=>v-b[i]);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const decodeDraft=p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v?.$nonFinite==='NaN'?NaN:v?.$nonFinite==='Infinity'?Infinity:v?.$nonFinite==='-Infinity'?-Infinity:v]));
  function draftGeometry(inputs){
    const p=decodeDraft(inputs),{x,y,z,length:L,width:W,height:H,draftAngleDegrees:angle}=p,eps=draftReference?.epsilon??1e-9;
    assert([x,y,z,L,W,H,angle].every(Number.isFinite),'Box values must all be finite numbers.');
    for(const [key,v]of [['length',L],['width',W],['height',H]])assert(v>eps,`Box ${key} must be greater than zero.`);
    assert(Math.abs(angle)<90,'Draft angle must be greater than -90° and less than 90°.');
    const k=Math.tan(angle*Math.PI/180),topL=L-2*H*k,topW=W-2*H*k;
    assert(Number.isFinite(topL)&&Number.isFinite(topW),'Draft angle produces non-finite top dimensions.');
    assert(topL>eps&&topW>eps,'Draft angle collapses or inverts the top face; reduce the positive draft angle.');
    const points=[[-L/2,-W/2,0],[L/2,-W/2,0],[L/2,W/2,0],[-L/2,W/2,0],[-topL/2,-topW/2,H],[topL/2,-topW/2,H],[topL/2,topW/2,H],[-topL/2,topW/2,H]].map(v=>[x+v[0],y+v[1],z+v[2]]);
    const vertices=Object.fromEntries(points.map((v,i)=>[`v${i}`,v]));
    const faces=draftFaces.map(f=>{
      const [a,b,c]=f.vertexIds.map(id=>vertices[id]),n=cross(subtract(b,a),subtract(c,a)),len=Math.hypot(...n);
      assert(Number.isFinite(len)&&len>eps,`Box ${f.id} face is degenerate.`);
      return {...f,normal:n.map(v=>v/len)};
    });
    // Match the production rejection guard, including its absolute-coordinate sum.
    // An independent integrated volume is retained to expose cancellation errors.
    let six=0;for(const f of faces){const polygon=f.vertexIds.map(id=>vertices[id]);for(let i=1;i<polygon.length-1;i++)six+=dot(polygon[0],cross(polygon[i],polygon[i+1]));}
    const legacyVolume=six/6;
    assert(Number.isFinite(legacyVolume)&&legacyVolume>eps,'Box topology has zero or inverted volume.');
    const analyticVolume=H*L*W-H*H*k*(L+W)+(4/3)*H**3*k*k;
    return {params:p,vertices,faces,legacyVolume,analyticVolume,topDimensions:{length:topL,width:topW},definition:{type:'box',position:{x,y,z},dimensions:{length:L,width:W,height:H},draftAngleDegrees:angle,topDimensions:{length:topL,width:topW}}};
  }
  function buildDraftedBox(g,own,record){
    const vertices=new Map(),edges=new Map(),faces=new Map();
    for(const [id,p]of Object.entries(g.vertices)){
      record.phase=`vertex:${id}`;const maker=own(new oc.BRepBuilderAPI_MakeVertex(own(new oc.gp_Pnt_3(...p))));vertices.set(id,own(maker.Vertex()));
    }
    for(let i=0;i<draftEdges.length;i++){
      const [a,b]=draftEdges[i],id=`e${i}`;record.phase=`edge:${id}`;
      const maker=own(new oc.BRepBuilderAPI_MakeEdge_2(vertices.get(a),vertices.get(b)));
      const error=maker.Error(),errorName=Object.getOwnPropertyNames(oc.BRepBuilderAPI_EdgeError).filter(k=>k.startsWith('BRepBuilderAPI_')).find(k=>enumValue(oc.BRepBuilderAPI_EdgeError[k])===enumValue(error));
      assert(maker.IsDone(),`MakeEdge ${id} failed (error ${enumValue(error)} ${errorName??'unknown'})`);edges.set(id,own(maker.Edge()));
    }
    const builder=own(new oc.BRep_Builder()),shell=own(new oc.TopoDS_Shell());builder.MakeShell(shell);
    for(const f of g.faces){
      record.phase=`face:${f.id}`;const wireMaker=own(new oc.BRepBuilderAPI_MakeWire_1());
      for(let i=0;i<f.vertexIds.length;i++){
        const a=f.vertexIds[i],b=f.vertexIds[(i+1)%f.vertexIds.length],edgeIndex=draftEdges.findIndex(pair=>pair.includes(a)&&pair.includes(b));
        const edge=edges.get(`e${edgeIndex}`);
        const oriented=draftEdges[edgeIndex][0]===a?edge:own(oc.TopoDS.Edge_1(own(edge.Reversed())));
        wireMaker.Add_1(oriented);
      }
      assert(wireMaker.IsDone(),`MakeWire ${f.id} failed (error ${enumValue(wireMaker.Error())})`);
      const plane=own(new oc.gp_Pln_3(own(new oc.gp_Pnt_3(...g.vertices[f.vertexIds[0]])),own(new oc.gp_Dir_4(...f.normal))));
      const faceMaker=own(new oc.BRepBuilderAPI_MakeFace_16(plane,own(wireMaker.Wire()),true));
      assert(faceMaker.IsDone(),`MakeFace ${f.id} failed (error ${enumValue(faceMaker.Error())})`);
      const face=own(faceMaker.Face());faces.set(f.id,face);builder.Add(shell,face);
    }
    // The shared-edge construction uses every edge twice with opposite winding.
    // No sewing, shape healing, or tolerance inflation is performed.
    shell.Closed_2(true);record.phase='make-solid';
    const maker=own(new oc.BRepBuilderAPI_MakeSolid_3(shell));assert(maker.IsDone(),'MakeSolid failed');
    return {shape:own(maker.Solid()),vertices,edges,faces};
  }
  function draftNames(built,g,own){
    const faces=shapes(built.shape,'FACE',own).map(face=>{
      const match=[...built.faces].filter(([,s])=>s.IsSame(face));assert(match.length===1,'Unresolved constructed face identity');
      const f=g.faces.find(f=>f.id===match[0][0]);return {id:f.id,...describe(face,'FACE',own),vertexIds:f.vertexIds,edgeIds:f.edgeIds};
    });
    const edges=shapes(built.shape,'EDGE',own).map(edge=>{
      const match=[...built.edges].filter(([,s])=>s.IsSame(edge));assert(match.length===1,'Unresolved constructed edge identity');
      const id=match[0][0];return {id,...describe(edge,'EDGE',own),vertexIds:draftEdges[Number(id.slice(1))],faceIds:g.faces.filter(f=>f.edgeIds.includes(id)).map(f=>f.id)};
    });
    for(const list of [faces,edges])assert(new Set(list.map(n=>n.signature)).size===list.length,'Ambiguous draft signature at persistence precision');
    return {method:'drafted-box-construction-v1',faces,edges,vertices:Object.entries(g.vertices).map(([id,point])=>({id,point}))};
  }
  function draftMeasurements(shape,names,g,own){
    const pointById=new Map();let maximumVertexError=0;
    for(const vertex of shapes(shape,'VERTEX',own)){
      const p=xyz(own(oc.BRep_Tool.Pnt(own(oc.TopoDS.Vertex_1(vertex)))));
      const matches=Object.entries(g.vertices).map(([id,expected])=>({id,distance:Math.hypot(...subtract(p,expected))})).filter(v=>v.distance<=1e-8);
      assert(matches.length===1,'Kernel vertex does not uniquely match a semantic vertex');
      maximumVertexError=Math.max(maximumVertexError,matches[0].distance);pointById.set(matches[0].id,{shape:vertex,point:p});
    }
    const edgeItems=shapes(shape,'EDGE',own).map(edge=>{
      const matches=names.edges.filter(n=>n.signature===describe(edge,'EDGE',own).signature);assert(matches.length===1,'Kernel edge identity unresolved');return {shape:edge,id:matches[0].id};
    });
    const faceItems=shapes(shape,'FACE',own).map(face=>{
      const matches=names.faces.filter(n=>n.signature===describe(face,'FACE',own).signature);assert(matches.length===1,'Kernel face identity unresolved');
      const id=matches[0].id,adaptor=own(new oc.BRepAdaptor_Surface_2(face,true));
      assert(enumValue(adaptor.GetType())===enumValue(oc.GeomAbs_SurfaceType.GeomAbs_Plane),'Draft face is not planar');
      const plane=own(adaptor.Plane()),axis=own(plane.Axis()),direction=own(axis.Direction()),sign=enumValue(face.Orientation_1())===enumValue(oc.TopAbs_Orientation.TopAbs_REVERSED)?-1:1;
      const normal=xyz(direction).map(v=>v*sign),expected=g.faces.find(f=>f.id===id),normalError=Math.hypot(...subtract(normal,expected.normal));
      const actualEdges=shapes(face,'EDGE',own).map(edge=>edgeItems.find(e=>e.shape.IsSame(edge))?.id).sort();
      assert(JSON.stringify(actualEdges)===JSON.stringify([...expected.edgeIds].sort()),`Face-edge connectivity changed: ${id}`);
      assert(normalError<=1e-8,`Outward normal mismatch: ${id}`);
      return {id,normal,normalError,edgeIds:actualEdges};
    });
    for(const edge of edgeItems){
      const expected=draftEdges[Number(edge.id.slice(1))];
      const ids=shapes(edge.shape,'VERTEX',own).map(vertex=>[...pointById].find(([,p])=>p.shape.IsSame(vertex))?.[0]).sort();
      assert(JSON.stringify(ids)===JSON.stringify([...expected].sort()),`Edge endpoints changed: ${edge.id}`);
    }
    const v=validate(shape,own);
    return {...v,maximumVertexError,vertices:Object.fromEntries([...pointById].map(([id,p])=>[id,p.point])),faces:faceItems,edgeIds:edgeItems.map(e=>e.id)};
  }
  function runDraftedBoxes(){
    if(!draftReference)return null;
    const cases=[],scenes=[];
    for(const c of draftReference.cases){
      const record={id:c.id,category:c.category,inputs:c.inputs,referenceAccepted:c.reference.accepted,referenceError:c.reference.error,independentAnalytic:c.analytic,phase:'semantic-validation',kernelAccepted:false,status:'pass'};
      const started=performance.now();
      try{scope(own=>{
        const g=draftGeometry(c.inputs);record.semanticAccepted=true;record.analyticVolume=g.analyticVolume;record.legacyGuardVolume=g.legacyVolume;record.topDimensions=g.topDimensions;
        const built=buildDraftedBox(g,own,record);record.phase='kernel-validity';
        const v=validate(built.shape,own);record.kernelAccepted=v.valid;record.validation=v;assert(v.valid,'Kernel solid failed BRepCheck_Analyzer');
        record.phase='identity-and-topology';const names=draftNames(built,g,own),measure=draftMeasurements(built.shape,names,g,own);record.measurements=measure;
        assert(measure.counts.face===6&&measure.counts.edge===12&&measure.counts.vertex===8&&measure.counts.solid===1,'Expected 6 faces / 12 edges / 8 vertices / 1 solid');
        assert(c.reference.accepted,'Kernel accepted a production-rejected Box');record.phase='numerical-comparison';
        const reference=c.reference.record,volumeTolerance=Math.max(1e-12,Math.abs(reference.topology.signedVolume)*1e-9);
        record.referenceVolume=reference.topology.signedVolume;record.volumeTolerance=volumeTolerance;record.volumeError=Math.abs(measure.volume-record.referenceVolume);record.analyticError=Math.abs(measure.volume-g.analyticVolume);
        record.productionVertexError=Math.max(...reference.topology.vertices.map(v=>Math.hypot(...subtract(measure.vertices[v.id],[v.x,v.y,v.z]))));
        record.productionNormalError=Math.max(...reference.topology.faces.map(f=>Math.hypot(...subtract(measure.faces.find(actual=>actual.id===f.id).normal,[f.normal.x,f.normal.y,f.normal.z]))));
        assert(record.productionVertexError<=1e-8&&record.productionNormalError<=1e-8,'Semantic vertices or outward normals differ from production');
        for(const f of reference.topology.faces)assert(JSON.stringify(measure.faces.find(actual=>actual.id===f.id).edgeIds)===JSON.stringify([...f.edgeIds].sort()),`Production face-edge roles differ: ${f.id}`);
        const expectedPoints=reference.topology.vertices.map(v=>[v.x,v.y,v.z]),expectedBounds={min:[0,1,2].map(i=>Math.min(...expectedPoints.map(v=>v[i]))),max:[0,1,2].map(i=>Math.max(...expectedPoints.map(v=>v[i])))};
        record.boundsError=Math.max(...['min','max'].flatMap(key=>measure.bounds[key].map((v,i)=>Math.abs(v-expectedBounds[key][i]))));
        assert(record.boundsError<=1e-8,'Bounds exceed 1e-8 inch comparison tolerance');
        assert(record.volumeError<=volumeTolerance,'Kernel volume differs from production beyond comparison tolerance');
        assert(record.analyticError<=Math.max(1e-12,Math.abs(g.analyticVolume)*1e-9),'Kernel volume differs from independent analytic volume');
        record.phase='save-reload';
        const matrix=[0,-1,0,3,1,0,0,-2,0,0,1,.5,0,0,0,1];
        const project=serialize(built.shape,names,matrix,own,{id:g.params.id,kind:'Box',layerId:g.params.layerId,definition:g.definition,fixtureCase:c.id});
        const persistedProject=JSON.parse(JSON.stringify(project));
        const restored=deserialize(persistedProject,own),after=draftMeasurements(restored.shape,restored.names,g,own);
        assert(after.valid&&Math.abs(after.volume-measure.volume)<=volumeTolerance,'Reload changed drafted volume or validity');
        assert(JSON.stringify(restored.names.faces.map(n=>n.id).sort())===JSON.stringify(names.faces.map(n=>n.id).sort()),'Reload changed face IDs');
        assert(JSON.stringify(restored.names.edges.map(n=>n.id).sort())===JSON.stringify(names.edges.map(n=>n.id).sort()),'Reload changed edge IDs');
        assert(JSON.stringify(restored.matrix)===JSON.stringify(matrix),'Reload changed affine matrix');
        // Input values and stored metadata must survive JSON exactly. Derived
        // Math.tan results can differ by a few ULPs between JavaScript runtimes.
        const {topDimensions:sourceTop,...sourceInputs}=reference.definition;
        const {topDimensions:runtimeTop,...runtimeInputs}=g.definition;
        record.definitionComparison={inputsMatchSource:JSON.stringify(runtimeInputs)===JSON.stringify(sourceInputs),topDimensionError:Math.max(...['length','width'].map(key=>Math.abs(runtimeTop[key]-sourceTop[key])))};
        record.reload={valid:after.valid,volumeError:Math.abs(after.volume-measure.volume),faceIds:restored.names.faces.map(n=>n.id),edgeIds:restored.names.edges.map(n=>n.id),matrixPreserved:true,definitionPreserved:JSON.stringify(persistedProject.solid.definition)===JSON.stringify(g.definition)};
        assert(record.reload.definitionPreserved,'JSON reload changed the saved draft definition');
        assert(record.definitionComparison.inputsMatchSource&&record.definitionComparison.topDimensionError<=1e-8,'Draft definition differs from production beyond tolerance');
        record.phase='display-and-transform';const display=mesh(restored.shape,restored.names,.003,own);assert(new Set(display.triangles.map(t=>t.faceId)).size===6,'Display lost a drafted face');
        const world=transformKernel(restored.shape,matrix,own),worldValidation=validate(world,own),worldPoints=Object.values(g.vertices).map(p=>transform(matrix,p));
        const worldBounds={min:[0,1,2].map(i=>Math.min(...worldPoints.map(p=>p[i]))),max:[0,1,2].map(i=>Math.max(...worldPoints.map(p=>p[i])))};
        record.worldBoundsError=Math.max(...['min','max'].flatMap(key=>worldValidation.bounds[key].map((v,i)=>Math.abs(v-worldBounds[key][i]))));
        assert(worldValidation.valid&&record.worldBoundsError<=1e-8,'Draft transform/placement mismatch');
        record.display={triangles:display.triangles.length,edges:display.edges.length};record.phase='complete';
        if(c.category==='normal')scenes.push({id:c.id,label:`${g.params.draftAngleDegrees}° · ${g.params.length} × ${g.params.width} × ${g.params.height} · X${g.params.x} Y${g.params.y} Z${g.params.z}`,mesh:display,project,volume:measure.volume,topDimensions:g.topDimensions});
      });}catch(error){
        record.error=String(error);record.rejectedAt=record.phase;
        if(!c.reference.accepted&&record.phase==='semantic-validation'){record.outcome='rejected';record.rejectionMatches=record.error.endsWith(c.reference.error);if(!record.rejectionMatches)record.status='fail';}
        else record.status=c.category==='diagnostic'?'deviation':'fail';
      }
      record.ms=performance.now()-started;cases.push(record);
    }
    // Draft alone must never move or resize the bottom rectangle.
    const fixedBottom=[];
    for(const prefix of ['default-origin','default-offset','asymmetric-origin','asymmetric-offset']){
      const group=cases.filter(c=>c.id.startsWith(prefix)&&c.measurements),zero=group.find(c=>c.inputs.draftAngleDegrees===0);
      const pass=group.length===5&&group.every(c=>['v0','v1','v2','v3'].every(id=>JSON.stringify(c.measurements.vertices[id])===JSON.stringify(zero.measurements.vertices[id])));
      fixedBottom.push({group:prefix,cases:group.length,pass});
    }
    return {source:{file:draftReference.productionFile,sha256:draftReference.productionSha256,version:draftReference.appVersion,epsilon:draftReference.epsilon},kernelPrecision:{confusion:oc.Precision.Confusion(),angular:oc.Precision.Angular()},comparisonTolerances:{coordinateInches:1e-8,volumeAbsoluteCubicInches:1e-12,volumeRelative:1e-9,normalVectorError:1e-8},cases,scenes,fixedBottom,summary:{total:cases.length,normal:cases.filter(c=>c.category==='normal').length,passed:cases.filter(c=>c.status==='pass').length,failures:cases.filter(c=>c.status==='fail').length,deviations:cases.filter(c=>c.status==='deviation').length,rejections:cases.filter(c=>c.outcome==='rejected').length}};
  }
  const serialize=(shape,names,matrix,own,metadata={})=>({format:'PrometheusCAD-kernel-feasibility',schemaVersion:1,kernel:KERNEL_VERSION,canonicalUnits:'inch',displayUnits:'metric',solid:{id:1,type:'solid',kind:'Box with bore',layerId:0,definition:{type:'fixture-box-cut',box:{x:0,y:0,z:0,length:2,width:1,height:1},bore:{radius:.25,z:-.25,height:1.5}},...metadata,transform:{matrix},brep:writeBrep(shape,own),naming:names}});
  function deserialize(project,own) {
    assert(project.format==='PrometheusCAD-kernel-feasibility'&&project.schemaVersion===1,'Unsupported project format/version');
    assert(project.canonicalUnits==='inch','Unsupported canonical units');
    assert(project.solid.transform.matrix.length===16&&project.solid.transform.matrix.every(Number.isFinite),'Invalid transform');
    const shape=readBrep(project.solid.brep,own);
    assert(validate(shape,own).valid,'Loaded B-rep failed validity check');
    return {shape,names:restoreNames(shape,project.solid.naming,own),matrix:project.solid.transform.matrix};
  }
  async function runSuite({cycles=20}={}) {
    const tests=[],diagnostics=[],outputs={};
    function test(name,fn) {
      const start=performance.now();
      try{const detail=scope(fn);tests.push({name,status:detail?.status==='unsupported-as-output-parameters'?'unsupported':detail?.status==='deviation'?'deviation':'pass',ms:performance.now()-start,detail});return detail;}
      catch(e){tests.push({name,status:'fail',ms:performance.now()-start,error:String(e),stack:e?.stack?.split('\n').slice(0,5).join('\n')});return null;}
    }
    const required=['BRepPrimAPI_MakeBox_3','BRepPrimAPI_MakeCylinder_3','BRepAlgoAPI_Cut_3','BRepCheck_Analyzer','BRepGProp','BRepMesh_IncrementalMesh_2','BRep_Tool','BRepTools','BRepBuilderAPI_Transform_2','BRepBndLib','GCPnts_QuasiUniformDeflection_2','TNaming_Selector'];
    test('required-bindings',()=>{const missing=required.filter(k=>!oc[k]);assert(!missing.length,`Missing: ${missing}`);return {present:required,optionalOCAF:'Export presence only; persistence/naming workflow not validated',versionFunction:typeof oc.Standard_Version};});
    test('box-validity-volume-bounds-and-identities',own=>{
      const f=fixture(own),v=validate(f.box,own),names=naming(f.box,own);
      assert(v.valid&&v.counts.face===6&&v.counts.edge===12&&v.counts.vertex===8&&v.counts.solid===1,'Unexpected box topology');
      assert(near(v.volume,2),'Incorrect box volume');
      assert(JSON.stringify(v.bounds.min.map(rounded))===JSON.stringify([-1,-.5,0])&&JSON.stringify(v.bounds.max.map(rounded))===JSON.stringify([1,.5,1]),'Incorrect bottom-center placement');
      const front=own(f.boxMaker.FrontFace()),actual=properties(front,'FACE',own).center;
      assert(near(actual[0],1),'Unexpected OCCT FrontFace behavior');
      assert(names.faces.find(n=>n.id==='front').center[1]===-.5,'Prometheus front role lost');
      return {...v,faceIds:names.faces.map(n=>n.id),edgeIds:names.edges.map(n=>n.id),occtFrontCenter:actual};
    });
    test('boolean-through-hole-and-history',own=>{
      const f=fixture(own),v=validate(f.cut,own),expected=2-Math.PI*.25**2;
      assert(v.valid&&v.counts.solid===1&&near(v.volume,expected),'Incorrect cut result');
      const resultFaces=shapes(f.cut,'FACE',own),history=[];
      for(const face of shapes(f.box,'FACE',own)) {
        const role=faceRole(describe(face,'FACE',own)), modified=own(f.cutMaker.Modified(face)),generated=own(f.cutMaker.Generated(face));
        const unchanged=resultFaces.some(r=>r.IsSame(face));
        let mapsToRole=false;
        if(modified.Size()===1){const sub=own(modified.First_1()),cast=own(oc.TopoDS.Face_1(sub));mapsToRole=faceRole(describe(cast,'FACE',own))===role;}
        assert(unchanged||mapsToRole,`Cannot map original ${role} through cut history`);
        history.push({id:role,unchanged,modified:modified.Size(),generated:generated.Size(),deleted:f.cutMaker.IsDeleted(face)});
      }
      outputs.names=naming(f.cut,own);outputs.cut=mesh(f.cut,outputs.names,.003,own);outputs.box=mesh(f.box,naming(f.box,own),.003,own);
      return {...v,expected,error:Math.abs(v.volume-expected),history,cutMs:f.cutMs};
    });
    test('coarse-fine-mesh-and-face-ownership',own=>{
      const f=fixture(own),names=naming(f.cut,own),coarse=mesh(f.cut,names,.02,own),fine=mesh(f.cut,names,.00005,own);
      assert(fine.triangles.length>coarse.triangles.length,'Finer tolerance did not increase mesh resolution');
      assert(new Set(fine.triangles.map(t=>t.faceId)).size===names.faces.length,'Face missing from tessellation');
      assert(coarse.triangles.every(t=>names.faces.some(n=>n.id===t.faceId)),'Mesh contains unknown face');
      return {coarseTriangles:coarse.triangles.length,fineTriangles:fine.triangles.length,coarseMs:coarse.meshMs,fineMs:fine.meshMs,faceIds:names.faces.map(n=>n.id),edges:coarse.edges.length};
    });
    test('display-mesh-open-bore-and-outward-winding',()=>{
      assert(outputs.cut,'Mesh prerequisite unavailable');
      let volume=0,topArea=0,covered=0;
      const cross2=(a,b)=>a[0]*b[1]-a[1]*b[0];
      for(const t of outputs.cut.triangles){
        const [a,b,c]=t.indices.map(i=>outputs.cut.positions[i]);
        volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
        if(t.faceId==='top')topArea+=Math.abs(cross2(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i])))/2;
        if(t.faceId==='top'||t.faceId==='bottom'){
          const signs=[[a,b],[b,c],[c,a]].map(([p,q])=>cross2(q.map((v,i)=>v-p[i]),p.map(v=>-v)));
          if(signs.every(s=>s>=-1e-12)||signs.every(s=>s<=1e-12))covered++;
        }
      }
      const expectedVolume=2-Math.PI*.25**2,expectedTopArea=2-Math.PI*.25**2;
      assert(covered===0,'Display triangles cover the through-hole center');
      assert(Math.abs(volume-expectedVolume)<.005,'Triangle winding/volume disagrees with B-rep');
      assert(Math.abs(topArea-expectedTopArea)<.005,'Top face trimming area disagrees with analytic area');
      return {coveredCenterTriangles:covered,meshSignedVolume:volume,exactVolume:expectedVolume,topTriangleArea:topArea,expectedTopArea};
    });
    const translation=[1,0,0,3,0,1,0,-2,0,0,1,.5,0,0,0,1],rotation=[0,-1,0,0,1,0,0,0,0,0,1,0,0,0,0,1],reflection=[-1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
    outputs.matrix=multiply(translation,multiply(rotation,reflection));
    for(const [label,m]of [['translation',translation],['rotation',rotation],['reflection',reflection],['composition',outputs.matrix]])test(`transform-${label}-kernel-versus-display`,own=>{
      const f=fixture(own),kernel=transformKernel(f.cut,m,own),v=validate(kernel,own),base=validate(f.cut,own);
      assert(v.valid&&near(v.volume,base.volume),'Transform damaged solid orientation/volume');
      const expected=Array.from({length:8},(_,i)=>transform(m,[i&1?1:-1,i&2?.5:-.5,i&4?1:0]));
      const min=[0,1,2].map(i=>Math.min(...expected.map(p=>p[i]))),max=[0,1,2].map(i=>Math.max(...expected.map(p=>p[i])));
      assert(min.every((n,i)=>near(n,v.bounds.min[i]))&&max.every((n,i)=>near(n,v.bounds.max[i])),'Kernel/display bounds mismatch');
      const baseMesh=mesh(f.cut,naming(f.cut,own),.003,own),kernelMesh=mesh(kernel,namingByTransformedSignatures(kernel,own),.003,own);
      const displayPoints=baseMesh.positions.map(p=>transform(m,p));
      const keyed=new Set(displayPoints.map(p=>p.map(rounded).join(',')));
      const matches=kernelMesh.positions.filter(p=>keyed.has(p.map(rounded).join(','))).length;
      assert(matches===kernelMesh.positions.length,'Fixture kernel/display transformed vertex sets differ');
      return {...v,expectedBounds:{min,max},matrix:m,displayVertices:displayPoints.length,kernelVertices:kernelMesh.positions.length,exactVertexMatches:matches};
    });
    test('brep-json-roundtrip-no-mesh-or-live-handles',own=>{
      const f=fixture(own),names=naming(f.cut,own),project=serialize(f.cut,names,outputs.matrix,own),text=JSON.stringify(project),restored=deserialize(JSON.parse(text),own);
      const v=validate(restored.shape,own);assert(near(v.volume,2-Math.PI*.25**2),'Roundtrip changed volume');
      assert(JSON.stringify(restored.names.faces.map(n=>n.id).sort())===JSON.stringify(names.faces.map(n=>n.id).sort()),'Face IDs lost');
      assert(JSON.stringify(restored.names.edges.map(n=>n.id).sort())===JSON.stringify(names.edges.map(n=>n.id).sort()),'Edge IDs lost');
      assert(JSON.stringify(restored.matrix)===JSON.stringify(outputs.matrix),'Matrix lost');
      const display=mesh(restored.shape,restored.names,.003,own);assert(display.triangles.length>0,'Could not regenerate mesh');
      outputs.project=project;outputs.restored=display;
      return {brepBytes:new TextEncoder().encode(project.solid.brep).length,jsonBytes:new TextEncoder().encode(text).length,displayUnits:project.displayUnits,...v};
    });
    test('invalid-project-and-ambiguous-identities-rejected',own=>{
      assert(outputs.project,'Roundtrip prerequisite unavailable');
      const badVersion=structuredClone(outputs.project);badVersion.schemaVersion=999;
      const badBrep=structuredClone(outputs.project);badBrep.solid.brep='not a B-rep';
      const ambiguous=structuredClone(outputs.project);ambiguous.solid.naming.faces.push(ambiguous.solid.naming.faces[0]);
      const failures=[];
      for(const [name,p]of [['version',badVersion],['payload',badBrep],['identity',ambiguous]]){let rejected=false;try{deserialize(p,own);}catch(e){rejected=true;failures.push({name,error:String(e)});}assert(rejected,`Accepted invalid ${name}`);}
      return failures;
    });
    test('primitive-reference-output-binding-limit',own=>{
      const box=own(new oc.Bnd_Box_1()),a=0,b=0,c=0,d=0,e=0,f=0;box.Update_1(-1,-.5,0,1,.5,1);
      box.Get(a,b,c,d,e,f);
      const unsupported=[a,b,c,d,e,f].every(v=>v===0);
      assert(unsupported,'Primitive-reference probe behavior changed; review adapter');
      return {status:'unsupported-as-output-parameters',binding:'Bnd_Box.Get(double&,...)',observed:[a,b,c,d,e,f],workaround:'CornerMin()/CornerMax() return usable gp_Pnt objects'};
    });
    test('owned-object-cleanup-and-repeatability',()=>{
      const samples=[];const start=performance.now();
      for(let i=0;i<cycles;i++)scope(own=>{
        const f=fixture(own),names=naming(f.cut,own),m=mesh(f.cut,names,.003,own);
        assert(m.triangles.length>0&&near(validate(f.cut,own).volume,2-Math.PI*.25**2),'Repeated operation failed');
        const bytes=writeBrep(f.cut,own);assert(bytes.length>0,'Repeated serialization failed');
      });
      samples.push({cycles,wasmHeapBytes:oc.HEAP8.buffer.byteLength});
      assert(!lifetime.cleanupErrors.length,'Owned object cleanup errors');
      return {cycles,totalMs:performance.now()-start,samples,note:'Heap capacity is not live allocation size; stable capacity alone is not proof of no leaks.'};
    });
    diagnostics.push({name:'persistent-topological-naming',status:'limited',detail:'Semantic roles and collision-checked signatures verified only for this fixture and same build. General parametric naming, splits/merges, OCAF save/load, and cross-version migration are not established.'});
    const draftedBox=runDraftedBoxes();
    if(draftedBox){
      test('drafted-box-normal-and-rejection-compatibility',()=>{assert(draftedBox.summary.failures===0,`${draftedBox.summary.failures} required drafted-Box cases failed`);return draftedBox.summary;});
      test('drafted-box-bottom-fixed-under-signed-draft',()=>{assert(draftedBox.fixedBottom.every(g=>g.pass),'Bottom placement changed under draft');return draftedBox.fixedBottom;});
      test('drafted-box-diagnostic-boundaries',()=>({status:draftedBox.summary.deviations?'deviation':'pass',cases:draftedBox.cases.filter(c=>c.status==='deviation').map(c=>({id:c.id,phase:c.phase,error:c.error}))}));
    }
    diagnostics.push({name:'signed-draft',status:draftedBox?'evaluated-with-reported-limits':'not-tested',detail:draftedBox?.summary??'No drafted-Box reference was supplied.'});
    diagnostics.push({name:'standard-version-binding',status:oc.Standard_Version?'present':'unavailable',detail:'No Standard_Version export in the selected artifact; package build is pinned by version/integrity.'});
    return {kernel:KERNEL_VERSION,tests,diagnostics,outputs,draftedBox,lifetime:{...lifetime,balanced:lifetime.created===lifetime.deleted},wasmHeapBytes:oc.HEAP8.buffer.byteLength};
  }
  function namingByTransformedSignatures(shape,own){
    const faces=shapes(shape,'FACE',own).map((s,i)=>({id:`transformed-face-${i}`,...describe(s,'FACE',own)}));
    const edges=shapes(shape,'EDGE',own).map((s,i)=>({id:`transformed-edge-${i}`,...describe(s,'EDGE',own)}));
    return {faces,edges};
  }
  function reloadProject(project) {return scope(own=>{const r=deserialize(project,own);return {validation:validate(r.shape,own),names:r.names,mesh:mesh(r.shape,r.names,.003,own),matrix:r.matrix};});}
  return {runSuite,reloadProject,lifetime};
}
