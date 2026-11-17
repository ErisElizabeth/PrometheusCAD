import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createKernel,KERNEL_VERSION} from '../modeling/kernel.mjs';
import init from '../vendor/opencascade/dist/node.js';
import {createEngine} from './fixtures/reference-engine.mjs';
const reference=JSON.parse(await fs.readFile(new URL('./fixtures/drafted-box-reference.json',import.meta.url),'utf8'));
const start=performance.now(),oc=await init({module:{wasmBinary:await fs.readFile(new URL('../vendor/opencascade/dist/opencascade.full.wasm',import.meta.url)),printErr:()=>{}}});
const kernel=createKernel(oc),report={initializationMs:performance.now()-start,checks:[],failures:[],deviations:[],unsupported:[]};
function check(name,fn){try{report.checks.push({name,status:'pass',detail:fn()});}catch(e){const item={name,status:'fail',error:String(e),stack:e.stack};report.checks.push(item);report.failures.push(item);}}
const original=await createEngine(oc,{draftReference:reference}).runSuite({cycles:5});
report.referenceSummary={tests:original.tests.map(t=>({name:t.name,status:t.status})),draftedBox:original.draftedBox.summary};
check('all-original-kernel-tests-retained',()=>{assert(!original.tests.some(t=>t.status==='fail'));assert.equal(original.draftedBox.summary.failures,0);assert.equal(original.draftedBox.summary.deviations,1);});
report.unsupported=original.tests.filter(t=>t.status==='unsupported').map(t=>({name:t.name,detail:t.detail}));
for(const c of reference.cases){
  const record=c.reference.record??{id:c.inputs.id,layerId:c.inputs.layerId,definition:{type:'box',position:{x:c.inputs.x,y:c.inputs.y,z:c.inputs.z},dimensions:{length:c.inputs.length,width:c.inputs.width,height:c.inputs.height},draftAngleDegrees:c.inputs.draftAngleDegrees}};
  if(c.id==='rect-top-2e-9'){
    check('known-tiny-edge-rejected-without-clamping',()=>{assert.throws(()=>kernel.createBox(record),/e5.*error 3.*Requested dimensions were not changed/);});
    report.deviations.push({id:c.id,reason:'Legacy accepts; OCCT edge e5 construction rejects. No replacement or dimension changes.'});continue;
  }
  check(c.id,()=>{
    if(!c.reference.accepted){assert.throws(()=>kernel.createBox(record),e=>e.message===c.reference.error);return {rejection:c.reference.error};}
    const before=JSON.stringify(record),result=kernel.createBox(record),v=result.validation,expected=record.topology.signedVolume;
    assert.equal(v.valid,true);assert.deepEqual(v.counts,{face:6,edge:12,vertex:8,solid:1});
    assert(Math.abs(v.volume-expected)<=Math.max(1e-12,Math.abs(expected)*1e-9));
    const restored=kernel.loadAsset(JSON.parse(JSON.stringify(result.asset)));
    assert(restored.validation.valid);
    assert.deepEqual(restored.names.faces.map(f=>f.id).sort(),record.topology.faces.map(f=>f.id).sort());
    assert.deepEqual(restored.names.edges.map(f=>f.id).sort(),record.topology.edges.map(f=>f.id).sort());
    assert.equal(new Set(restored.mesh.triangles.map(t=>t.faceId)).size,6);
    assert(Math.abs(v.volume-restored.validation.volume)<=Math.max(1e-12,Math.abs(expected)*1e-9));
    assert.equal(JSON.stringify(record),before);return {volume:v.volume,counts:v.counts};
  });
}
const bore=JSON.parse(await fs.readFile(new URL('./fixtures/bore-project.json',import.meta.url),'utf8'));
const asset={schemaVersion:1,backend:'opencascade.js',kernelVersion:KERNEL_VERSION,canonicalUnits:'inch',brep:bore.solid.brep,naming:bore.solid.naming};
check('curved-trimmed-bore-load-and-tessellation',()=>{
  const loaded=kernel.loadAsset(asset);assert(loaded.validation.valid);assert.equal(loaded.names.faces.length,7);
  assert(loaded.mesh.triangles.length>100);assert.equal(loaded.mesh.edges.length,15);
  assert(Math.abs(loaded.validation.volume-(2-Math.PI*.25**2))<1e-10);return {triangles:loaded.mesh.triangles.length};
});
check('invalid-and-ambiguous-assets-rejected',()=>{
  assert.throws(()=>kernel.loadAsset({...asset,kernelVersion:'future'}),/Unsupported/);
  assert.throws(()=>kernel.loadAsset({...asset,brep:'corrupt'}),/Invalid B-rep/);
  const naming=structuredClone(asset.naming);naming.faces.push(naming.faces[0]);
  assert.throws(()=>kernel.loadAsset({...asset,naming}),/ambiguous/);
});
check('owned-wrapper-lifetime',()=>{assert.equal(kernel.lifetime.created,kernel.lifetime.deleted);assert.deepEqual(kernel.lifetime.cleanupErrors,[]);return kernel.lifetime;});
await fs.mkdir(new URL('./results/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('./results/kernel.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({checks:report.checks.length,failures:report.failures,deviations:report.deviations,unsupported:report.unsupported.map(t=>t.name),initializationMs:report.initializationMs}));
if(report.failures.length)process.exitCode=1;
