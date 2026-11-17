import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {chromium} from 'playwright-core';
import {startServer,root} from '../tools/server.mjs';
import path from 'node:path';
const output=path.join(root,'tests/results');await fs.mkdir(output,{recursive:true});
const localTemporary=path.join(root,'.cache/tmp');await fs.mkdir(localTemporary,{recursive:true});process.env.TEMP=localTemporary;process.env.TMP=localTemporary;
const report={checks:[],failures:[]};
async function check(name,fn){try{const detail=await fn();report.checks.push({name,status:'pass',detail});}catch(e){const failure={name,status:'fail',error:String(e),stack:e.stack};report.checks.push(failure);report.failures.push(failure);}}
const server=await startServer();
let browser;
try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(server.url+'?dev=1');await page.waitForFunction(()=>typeof buildBoxSolid==='function');
  await check('2d-drawing-dimensions-text-dxf',async()=>{
    const r=await page.evaluate(()=>{
      addPoint(1,2);addCoordinateLine({x:0,y:0},{x:3,y:4});addCoordinateCircle({x:-1,y:-2},.5);addTextEntity({x:2,y:1},.15,'Inspection');
      addLinearDimension({x:0,y:0},{x:3,y:4});
      return {types:documentModel.entities.map(e=>e.type),dxf:createDxfDocument().content,point:documentModel.entities.find(e=>e.type==='point'),dimension:documentModel.entities.find(e=>e.type==='dimension'),svg:entityLayer.children.length};
    });
    for(const type of ['point','line','circle','text','dimension'])assert(r.types.includes(type),type);
    assert.equal(r.point.x,1);assert.equal(r.point.y,2);assert.equal(r.dimension.value,5);
    assert(r.dxf.includes('LINE')&&r.dxf.includes('CIRCLE')&&r.dxf.includes('POINT'));assert(r.svg>0);
    return {types:r.types,svg:r.svg};
  });
  await check('document-units-do-not-scale-geometry',async()=>{
    const r=await page.evaluate(()=>{const before=JSON.stringify(documentModel.entities);setDocumentUnits('metric');const value=convertDisplayLengthToInternal(25.4);const unchanged=before===JSON.stringify(documentModel.entities);setDocumentUnits('inch');return {value,unchanged};});
    assert.equal(r.value,1);assert(r.unchanged);return r;
  });
  await check('2d-history-copy-paste-delete',async()=>{
    const r=await page.evaluate(()=>{
      const n=documentModel.entities.length;addPoint(8,9);undoDocumentChange();const undone=documentModel.entities.length===n;redoDocumentChange();
      selectionState.selectedEntityIds=new Set([documentModel.entities.at(-1).id]);copySelectedEntities();pasteCopiedEntities();
      const pasted=documentModel.entities.length===n+2;deleteSelectedEntity();undoDocumentChange();
      return {undone,pasted,count:documentModel.entities.length,expected:n+2};
    });assert(r.undone&&r.pasted);assert.equal(r.count,r.expected);return r;
  });
  await check('layers-themes-and-shop-math',async()=>{
    const r=await page.evaluate(()=>{createNewLayer();applyTheme('dark');const value=evaluateArithmeticExpression('2+3*4');return {layers:documentModel.layers.length,theme:document.body.dataset.theme,value};});
    assert.equal(r.layers,2);assert.equal(r.theme,'dark');assert.equal(r.value,14);return r;
  });
  const source=await fs.readFile(path.join(root,'tests/fixtures/legacy-main.js'),'utf8');
  const extract=name=>{const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);return source.slice(start,end);};
  const ctx=vm.createContext({Math,Number,isometricViewState:{yaw:.7,pitch:.4}});
  vm.runInContext(['getIsometricProjectionComponents','projectWorldPointToIsometric','multiplyMatrix4','transformPointByMatrix4'].map(extract).join('\n'),ctx);
  await check('camera-and-affine-conventions',async()=>{
    const actual=await page.evaluate(()=>{isometricViewState.yaw=.7;isometricViewState.pitch=.4;return projectWorldPointToIsometric({x:1,y:2,z:3});});
    const expected=vm.runInContext('projectWorldPointToIsometric({x:1,y:2,z:3})',ctx);
    for(const k of ['x','y','depth'])assert(Math.abs(actual[k]-expected[k])<1e-12);
    return actual;
  });
  await check('legacy-box-placement-draft-transform-and-history',async()=>{
    const r=await page.evaluate(()=>{
      const solids=[0,5,-5].map((draftAngleDegrees,i)=>buildBoxSolid({id:i+1,layerId:0,x:3.25,y:-2.5,z:-1.5,length:2,width:1,height:1,draftAngleDegrees}));
      documentModel.model3d.solids=solids;documentModel.model3d.nextSolidId=4;
      enterIsometricView();renderEntities();recordDocumentChange('Transform Box');
      prependSolidTransform(solids[0],getTranslationMatrix4(1,2,3));renderEntities();
      const vertex=getSolidWorldVertices(solids[0])[0];undoDocumentChange();redoDocumentChange();
      return {bottom:solids.map(s=>s.topology.vertices[0]),volumes:solids.map(s=>s.topology.signedVolume),vertex,paths:modelLayer.querySelectorAll('.solid-face').length};
    });
    assert(r.volumes[1]<2&&r.volumes[2]>2);assert.deepEqual(r.bottom[0],r.bottom[1]);assert.deepEqual(r.bottom[0],r.bottom[2]);assert.equal(r.paths,18);assert.equal(r.vertex.x,3.25);return r;
  });
  await check('runtime-errors',()=>{assert.deepEqual(errors,[]);return errors;});
}finally{
  await browser?.close();await server.close();await fs.writeFile(path.join(output,'characterization.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
}
