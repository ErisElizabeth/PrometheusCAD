// Adapted from the pinned isolated feasibility prototype; no document/DOM imports.
export const KERNEL_VERSION='2.0.0-beta.b5ff984';
const rounded=n=>Math.abs(n)<1e-8?0:Number(n.toFixed(8));
const enumValue=e=>e?.value??e;
const xyz=p=>[p.X(),p.Y(),p.Z()];
function assert(value,message){if(!value)throw Error(message);}
export function createKernel(oc){
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
  function validate(shape,own) {
    const checker=own(new oc.BRepCheck_Analyzer(shape,true,false));
    const counts=Object.fromEntries(['FACE','EDGE','VERTEX','SOLID'].map(k=>[k.toLowerCase(),shapes(shape,k,own).length]));
    return {valid:checker.IsValid_2(),counts,volume:properties(shape,'SOLID',own).measure,bounds:bounds(shape,own)};
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
    const p=decodeDraft(inputs),{x,y,z,length:L,width:W,height:H,draftAngleDegrees:angle}=p,eps=1e-9;
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
  function createBox(record){return scope(own=>{
    const d=record?.definition;
    assert(d?.type==='box','Expected a Box definition');
    const g=draftGeometry({id:record.id,layerId:record.layerId,...d.position,...d.dimensions,draftAngleDegrees:d.draftAngleDegrees});
    const progress={phase:'start'};let built;
    try{built=buildDraftedBox(g,own,progress);}catch(e){throw Error('Box geometry unsupported at '+progress.phase+': '+e.message+'. Requested dimensions were not changed.');}
    const names=draftNames(built,g,own),validation=draftMeasurements(built.shape,names,g,own);
    assert(validation.valid&&validation.volume>0,'Kernel rejected Box validity or volume');
    assert(validation.counts.face===6&&validation.counts.edge===12&&validation.counts.vertex===8&&validation.counts.solid===1,'Kernel Box topology differs from the requested solid');
    assert(Math.abs(validation.volume-g.analyticVolume)<=Math.max(1e-12,Math.abs(g.analyticVolume)*1e-9),'Kernel Box volume exceeds comparison tolerance');
    const asset={schemaVersion:1,backend:'opencascade.js',kernelVersion:KERNEL_VERSION,canonicalUnits:'inch',brep:writeBrep(built.shape,own),naming:names};
    return {asset,validation,names,mesh:mesh(built.shape,names,.003,own)};
  });}
  function loadAsset(asset){return scope(own=>{
    assert(asset?.schemaVersion===1&&asset.backend==='opencascade.js'&&asset.kernelVersion===KERNEL_VERSION&&asset.canonicalUnits==='inch','Unsupported geometry asset version, backend, kernel, or units');
    assert(typeof asset.brep==='string'&&asset.brep.length>0&&asset.brep.length<=16*1024*1024,'Invalid B-rep payload size');
    assert(Array.isArray(asset.naming?.faces)&&Array.isArray(asset.naming?.edges),'Missing geometry identities');
    const shape=readBrep(asset.brep,own),validation=validate(shape,own);
    assert(validation.valid&&validation.volume>0&&validation.counts.solid===1,'Loaded B-rep is not one valid positive-volume solid');
    const names=restoreNames(shape,asset.naming,own);
    return {validation,names,mesh:mesh(shape,names,.003,own)};
  });}
  return {createBox,loadAsset,lifetime};
}
