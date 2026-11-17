// Classic-script facade: loading this file never starts WASM or blocks 2D.
(() => {
  const base=new URL('.',document.currentScript.src);
  const assets=new Map(),displays=new Map(),loading=new Map(),errors=new Map(),pending=new Map();
  let worker,ready,sequence=0,status='idle',lastError='',onDisplay=()=>{};
  const clone=value=>JSON.parse(JSON.stringify(value));
  function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
  function canonical(value){
    if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
    if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
    return JSON.stringify(value);
  }
  async function assetId(asset){
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(asset)));
    return 'sha256:'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  }
  function stop(error){
    worker?.terminate();worker=null;ready=null;status='failed';lastError=String(error);
    for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error(lastError));}pending.clear();
  }
  function request(command,payload){
    return new Promise((resolve,reject)=>{
      const id=++sequence;
      const timer=setTimeout(()=>stop(new Error('Geometry worker timed out; the document has not been changed.')),60000);
      pending.set(id,{resolve,reject,timer});
      try{worker.postMessage({id,command,payload});}catch(e){stop(e);}
    });
  }
  function initialize(){
    if(ready)return ready;
    status='initializing';
    try{worker=new Worker(new URL('worker.mjs',base),{type:'module'});}catch(e){stop(e);return Promise.reject(e);}
    worker.onmessage=({data:m})=>{
      const p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);
      if(m.ok)p.resolve(m.result);else p.reject(new Error(m.error));
    };
    worker.onerror=e=>{e.preventDefault();stop(new Error('Geometry kernel could not initialize: '+e.message));};
    ready=request('init').then(metrics=>{status='ready';lastError='';return metrics;}).catch(e=>{stop(e);throw e;});
    return ready;
  }
  async function rpc(command,payload){await initialize();return request(command,payload);}
  function geometryId(solid){return solid.geometry?.type==='opencascade-brep'?solid.geometry.assetId:null;}
  function displayData(result){
    const mesh=result.mesh;
    return freeze({...mesh,vertices:mesh.positions.map((p,i)=>({id:'mesh-'+i,x:p[0],y:p[1],z:p[2]})),faces:result.names.faces.map((f,i)=>({id:f.id,name:f.id,faceIndex:i})),validation:result.validation});
  }
  async function buildBox(legacy){
    const result=await rpc('box',legacy),asset=freeze(result.asset),id=await assetId(asset);
    assets.set(id,asset);displays.set(id,displayData(result));errors.delete(id);
    const {topology,geometry,...metadata}=legacy;
    return {...metadata,geometry:{type:'opencascade-brep',assetId:id}};
  }
  async function ensure(solid){
    const id=geometryId(solid);if(!id)return null;
    if(displays.has(id))return displays.get(id);
    if(loading.has(id))return loading.get(id);
    const asset=assets.get(id);if(!asset)throw Error('Missing B-rep asset '+id);
    const promise=rpc('load',asset).then(result=>{
      // A document may have been closed while this request was running.
      if(!assets.has(id))return null;
      const display=displayData(result);displays.set(id,display);errors.delete(id);onDisplay();return display;
    }).catch(e=>{errors.set(id,String(e));throw e;}).finally(()=>loading.delete(id));
    loading.set(id,promise);return promise;
  }
  function getDisplay(solid){
    const id=geometryId(solid);if(!id)return null;
    if(!displays.has(id)&&!errors.has(id))ensure(solid).catch(()=>onDisplay());
    return displays.get(id)??null;
  }
  function exportAssets(solids){
    const result={};for(const solid of solids){const id=geometryId(solid);if(!id)continue;const asset=assets.get(id);if(!asset)throw Error('Missing B-rep asset '+id);result[id]=clone(asset);}return result;
  }
  // Validate an entire candidate in isolation. Failed opens cannot mutate the registry/document.
  async function stage(input,solids){
    const staged=new Map();
    for(const solid of solids){
      const id=geometryId(solid);if(!id)continue;
      const asset=input?.[id];if(!asset)throw Error('Project is missing B-rep asset '+id);
      if(await assetId(asset)!==id)throw Error('B-rep asset checksum mismatch');
      if(asset.definition&&canonical(asset.definition)!==canonical(solid.definition))throw Error('Box definition differs from its exact geometry asset');
      if(staged.has(id))continue;
      const result=await rpc('load',asset);
      staged.set(id,{asset:freeze(clone(asset)),display:displayData(result)});
    }
    return staged;
  }
  function commitStage(staged){for(const [id,item]of staged){assets.set(id,item.asset);displays.set(id,item.display);errors.delete(id);}}
  function retain(solids,current=solids){
    const used=new Set(solids.map(geometryId).filter(Boolean));
    const visible=new Set(current.map(geometryId).filter(Boolean));
    for(const id of displays.keys())if(!visible.has(id))displays.delete(id);
    for(const map of [assets,errors])for(const id of map.keys())if(!used.has(id))map.delete(id);
  }
  window.PrometheusModeling=Object.freeze({
    buildBox,ensure,getDisplay,exportAssets,stage,commitStage,retain,geometryId,initialize,
    getError:solid=>errors.get(geometryId(solid)),
    setDisplayListener:fn=>{onDisplay=fn;},
    diagnostics:()=>({status,lastError,assets:assets.size,displayCaches:displays.size,pending:pending.size,assetBytes:[...assets.values()].reduce((n,a)=>n+a.brep.length,0)}),
    // Cache invalidation never changes exact geometry. Used on remesh and worker recovery.
    invalidate:()=>{displays.clear();errors.clear();},
  });
})();
