// Native format codec; snapshots contain asset references, never B-rep payloads.
(() => {
  const clone=value=>JSON.parse(JSON.stringify(value));
  function assert(value,message){if(!value)throw Error('Project: '+message);}
  function finiteTree(value){if(typeof value==='number')assert(Number.isFinite(value),'nonfinite number');else if(value&&typeof value==='object')Object.values(value).forEach(finiteTree);}
  function normalize(input){
    const native=input?.format==='PrometheusCAD';
    if(input?.format&&!native)throw Error('Project: unsupported format');
    if(native)assert(input.schemaVersion===1&&input.canonicalUnits==='inch','unsupported version or canonical units');
    const source=native?input.document:input;
    assert(source&&Array.isArray(source.entities),'missing document entities');
    finiteTree(source);const document=clone(source);
    document.layers??=[{id:0,name:'Layer 0',locked:false,masked:false}];
    assert(Array.isArray(document.layers)&&document.layers.length>0&&document.layers.length<=10,'invalid layers');
    const layerIds=new Set();
    for(const layer of document.layers){assert(Number.isInteger(layer.id)&&layer.id>=0&&!layerIds.has(layer.id)&&typeof layer.name==='string','invalid/duplicate layer');layerIds.add(layer.id);}
    const validateIds=list=>{const ids=new Set();for(const item of list){assert(Number.isInteger(item.id)&&item.id>0&&!ids.has(item.id),'invalid/duplicate identifier');ids.add(item.id);item.layerId??=0;assert(layerIds.has(item.layerId),'unknown layer');}return ids;};
    const ids=validateIds(document.entities),points=new Set(document.entities.filter(e=>e.type==='point').map(e=>e.id));
    for(const e of document.entities){
      assert(['point','line','circle','arc','text','dimension'].includes(e.type),'unsupported entity '+e.type);
      if(e.type==='point'||e.type==='text')assert(Number.isFinite(e.x)&&Number.isFinite(e.y),'invalid position');
      if(e.type==='text')assert(typeof e.content==='string'&&Number.isFinite(e.height)&&e.height>0,'invalid text');
      for(const key of ['startPointId','endPointId','centerPointId'])if(e[key]!==undefined)assert(points.has(e[key]),'broken point reference');
      if(e.type==='line')assert(points.has(e.startPointId)&&points.has(e.endPointId),'incomplete line');
      if(e.type==='circle'||e.type==='arc')assert(points.has(e.centerPointId)&&Number.isFinite(e.radius)&&e.radius>0,'invalid circle/arc');
      if(e.type==='arc')assert(points.has(e.startPointId)&&points.has(e.endPointId),'incomplete arc');
      if(e.type==='dimension'){
        const fields={
          linear:['startX','startY','endX','endY','dimensionStartX','dimensionStartY','dimensionEndX','dimensionEndY','value'],
          radius:['centerX','centerY','radius','angle'],diameter:['centerX','centerY','radius','angle'],
          angle:['centerX','centerY','radius','startAngle','endAngle','valueDegrees'],
        }[e.dimensionType];
        assert(fields&&fields.every(key=>Number.isFinite(e[key])),'invalid dimension');
      }
    }
    document.model3d??={solids:[],nextSolidId:1};assert(Array.isArray(document.model3d.solids),'invalid solids');
    const solidIds=validateIds(document.model3d.solids);
    for(const solid of document.model3d.solids){
      assert(solid.type==='solid','invalid solid type');
      if(solid.transform?.matrix)assert(Array.isArray(solid.transform.matrix)&&solid.transform.matrix.length===16&&solid.transform.matrix.every(Number.isFinite),'invalid transform');
      if(solid.geometry?.type==='opencascade-brep')assert(typeof solid.geometry.assetId==='string','invalid geometry reference');
      else {
        const vertices=solid.topology?.vertices??solid.geometry?.vertices,faces=solid.topology?.faces??solid.geometry?.faces;
        assert(Array.isArray(vertices)&&vertices.every(v=>[v.x,v.y,v.z].every(Number.isFinite))&&Array.isArray(faces),'invalid legacy solid');
        const vertexIds=new Set(vertices.map((v,i)=>v.id??i));
        assert(faces.every(f=>Array.isArray(f.vertexIds??f)&&(f.vertexIds??f).length>=3&&(f.vertexIds??f).every(id=>vertexIds.has(id))),'broken legacy face');
      }
    }
    document.nextEntityId??=Math.max(0,...ids)+1;document.model3d.nextSolidId??=Math.max(0,...solidIds)+1;
    assert(Number.isInteger(document.nextEntityId)&&document.nextEntityId>Math.max(0,...ids)&&Number.isInteger(document.model3d.nextSolidId)&&document.model3d.nextSolidId>Math.max(0,...solidIds),'invalid next identifier');
    document.currentLayerId??=document.layers[0].id;assert(layerIds.has(document.currentLayerId),'invalid current layer');
    document.nextLayerId??=Math.max(...layerIds)+1;assert(Number.isInteger(document.nextLayerId)&&document.nextLayerId>Math.max(...layerIds),'invalid next layer');
    const units=native?input.displayUnits:(source.units??'inch');assert(['inch','metric'].includes(units),'invalid display units');
    return {document,units,geometryAssets:native?input.geometryAssets??{}:{},legacy:!native};
  }
  function encode(document,units,geometryAssets){const project={format:'PrometheusCAD',schemaVersion:1,canonicalUnits:'inch',displayUnits:units,document:clone(document),geometryAssets};normalize(project);return project;}
  window.PrometheusProject=Object.freeze({normalize,encode});
})();
