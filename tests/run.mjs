import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {startServer,root} from '../tools/server.mjs';
const out=path.join(root,'tests/results');await fs.mkdir(out,{recursive:true});
const localTemporary=path.join(root,'.cache/tmp');await fs.mkdir(localTemporary,{recursive:true});process.env.TEMP=localTemporary;process.env.TMP=localTemporary;
const report={startedAt:new Date().toISOString(),checks:[],failures:[],limitations:[]};
async function check(name,fn){try{const detail=await fn();report.checks.push({name,status:'pass',detail});}catch(e){const failure={name,status:'fail',error:String(e),stack:e.stack};report.checks.push(failure);report.failures.push(failure);console.error(name+': '+String(e));}}
const reference=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/drafted-box-reference.json'),'utf8'));
const server=await startServer();let browser,page,saved;
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];
 page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(server.url+'?dev=1');await page.waitForFunction(()=>typeof serializeNativeProject==='function');
 await check('2d-startup-does-not-initialize-kernel',async()=>{
   const r=await page.evaluate(()=>{addPoint(1,2);return PrometheusModeling.diagnostics();});assert.equal(r.status,'idle');return r;
 });
 for(const c of reference.cases.filter(c=>c.category==='normal')){
   await check('application-box-'+c.id,async()=>{
     const r=await page.evaluate(async inputs=>{
       if(!is3dWorkspace())enterIsometricView();activateBox();
       for(const [key,id]of Object.entries({x:'boxX',y:'boxY',z:'boxZ',length:'boxLength',width:'boxWidth',height:'boxHeight',draftAngleDegrees:'boxDraftAngle'}))
         document.getElementById(id).value=String(inputs[key]);
       const before=documentModel.model3d.solids.length;await createBoxFromInputs();
       const solid=documentModel.model3d.solids.at(-1),display=PrometheusModeling.getDisplay(solid);
       return {before,count:documentModel.model3d.solids.length,solid,validation:display?.validation,faces:display?.faces,edges:display?.edges.map(e=>e.id),message:boxToolMessage.textContent};
     },c.inputs);
     assert.equal(r.count,r.before+1,r.message);assert.equal(r.solid.geometry.type,'opencascade-brep');assert(!r.solid.topology);
     assert(r.validation.valid);assert(Math.abs(r.validation.volume-c.reference.record.topology.signedVolume)<1e-8);
     assert.deepEqual(r.faces.map(f=>f.id).sort(),['back','bottom','front','left','right','top']);
     assert.equal(new Set(r.edges).size,12);
     assert.deepEqual(r.solid.definition.position,c.reference.record.definition.position);
     return {id:r.solid.id,volume:r.validation.volume};
   });
 }

 await check('metric-box-inputs-preserve-canonical-inches',async()=>{
   const r=await page.evaluate(async()=>{
     setDocumentUnits('metric');activateBox();
     for(const [id,value]of Object.entries({boxX:82.55,boxY:-63.5,boxZ:-38.1,boxLength:50.8,boxWidth:25.4,boxHeight:25.4,boxDraftAngle:-5}))document.getElementById(id).value=String(value);
     await createBoxFromInputs();const solid=documentModel.model3d.solids.at(-1);setDocumentUnits('inch');return solid.definition;
   });assert(Math.abs(r.position.x-3.25)<1e-12);assert.equal(r.dimensions.length,2);assert.equal(r.draftAngleDegrees,-5);return r;
 });
 await check('application-degenerate-and-tiny-feature-rejection-is-atomic',async()=>{
   const r=await page.evaluate(async angle=>{
     const before=JSON.stringify(captureDocumentSnapshot()),history=historyState.undoStack.length;
     activateBox();boxDraftAngleInput.value='45';await createBoxFromInputs();const collapse=boxToolMessage.textContent;
     boxDraftAngleInput.value=String(angle);await createBoxFromInputs();const tiny=boxToolMessage.textContent;closeBoxWindow();
     return {collapse,tiny,same:before===JSON.stringify(captureDocumentSnapshot()),historySame:history===historyState.undoStack.length};
   },reference.cases.find(c=>c.id==='rect-top-2e-9').inputs.draftAngleDegrees);
   assert(r.same&&r.historySame);assert.match(r.collapse,/collapses|inverts/);assert.match(r.tiny,/e5.*Requested dimensions were not changed/);return r;
 });

 await check('svg-face-ownership-selection-and-geometric-edges',async()=>{
   const r=await page.evaluate(()=>{
     const solid=documentModel.model3d.solids[0];selectIsometricTarget({solidId:solid.id,faceId:'top',faceIndex:1});renderEntities();
     const faces=[...modelLayer.querySelectorAll('path[data-solid-id="1"]')],edges=modelLayer.querySelectorAll('.solid-edge[data-solid-id="1"]');
     return {faces:faces.map(e=>({id:e.dataset.faceId,triangles:+e.dataset.triangleCount,stroke:getComputedStyle(e).stroke})),edges:edges.length,selected:modelSelectionState.selectedFace};
   });
   assert(r.faces.length>=3);assert(r.faces.every(f=>f.triangles>=2&&f.stroke==='none'));assert.equal(r.edges,12);assert.equal(r.selected.faceId,'top');return r;
 });
 await check('actual-svg-pointer-picks-whole-face',async()=>{
   await page.evaluate(()=>{documentModel.model3d.solids=documentModel.model3d.solids.slice(0,1);renderEntities();});
   const top=page.locator('#modelLayer path[data-face-id="top"]').first();await top.click({force:true});
   const selection=await page.evaluate(()=>modelSelectionState.selectedFace);assert.equal(selection?.faceId,'top');return selection;
 });
 await check('transform-commands-apply-once-and-undo-redo',async()=>{
   const r=await page.evaluate(()=>{
     const solid=documentModel.model3d.solids[0],ref=solid.geometry.assetId,before=getSolidWorldVertices(solid).map(v=>({...v}));
     selectIsometricTarget({solidId:solid.id,faceId:'top',faceIndex:1});
     activateTranslate();translateXInput.value='3';translateYInput.value='-2';translateZInput.value='.5';translateCopyInput.checked=false;translateSelectedEntities();
     activateRotate();rotateAngleInput.value='90';rotateAxisZInput.checked=true;rotateSelectedEntity();
     mirrorCopyInput.checked=false;mirrorSelectedEntities('x');
     const matrix=[...solid.transform.matrix],world=getSolidWorldVertices(solid),expected=before.map(v=>transformPointByMatrix4(matrix,v));
     const error=Math.max(...world.flatMap((v,i)=>['x','y','z'].map(k=>Math.abs(v[k]-expected[i][k]))));
     undoDocumentChange();redoDocumentChange();
     return {error,assetUnchanged:documentModel.model3d.solids[0].geometry.assetId===ref,matrixPreserved:JSON.stringify(documentModel.model3d.solids[0].transform.matrix)===JSON.stringify(matrix),det:getMatrix3Determinant(matrix),historyHasBrep:JSON.stringify(historyState).includes('"brep"')};
   });
   assert.equal(r.error,0);assert(r.assetUnchanged&&r.matrixPreserved);assert(r.det<0);assert.equal(r.historyHasBrep,false);return r;
 });
 await check('clipboard-and-history-share-immutable-exact-assets',async()=>{
   const r=await page.evaluate(()=>{
     const solid=documentModel.model3d.solids[0];modelSelectionState.selectedSolidIds=new Set([solid.id]);copySelectedEntities();pasteCopiedEntities();
     const copy=documentModel.model3d.solids.at(-1);
     for(let i=0;i<110;i++){recordDocumentChange('History stress '+i);prependSolidTransform(copy,getTranslationMatrix4(.01,0,0));}
     renderEntities();const project=serializeNativeProject();
     return {same:solid.geometry.assetId===copy.geometry.assetId,assets:Object.keys(project.geometryAssets).length,solids:project.document.model3d.solids.length,history:historyState.undoStack.length,historyHasBrep:JSON.stringify(historyState).includes('"brep"'),clipboardHasBrep:JSON.stringify(clipboardState).includes('"brep"'),stats:PrometheusModeling.diagnostics()};
   });
   assert(r.same);assert.equal(r.assets,1);assert.equal(r.solids,2);assert.equal(r.history,100);assert(!r.historyHasBrep&&!r.clipboardHasBrep);return r;
 });
 await check('project-download-contains-brep-and-no-display-cache',async()=>{
   const [file]=await Promise.all([page.waitForEvent('download'),page.evaluate(()=>saveNativeProject())]);
   await file.saveAs(path.join(out,'roundtrip.pcad'));saved=JSON.parse(await fs.readFile(path.join(out,'roundtrip.pcad'),'utf8'));
   assert.equal(saved.format,'PrometheusCAD');assert.equal(Object.keys(saved.geometryAssets).length,1);assert(!JSON.stringify(saved).includes('"triangles"'));return {bytes:(await fs.stat(path.join(out,'roundtrip.pcad'))).size};
 });
 await check('closed-page-fresh-worker-project-reopen-and-subsequent-edit',async()=>{
   await page.close();page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(server.url+'?dev=1');await page.waitForFunction(()=>typeof openNativeProject==='function');
   const r=await page.evaluate(async project=>{
     const loaded=await openNativeProject(project);enterIsometricView();
     const solid=documentModel.model3d.solids[0],display=PrometheusModeling.getDisplay(solid);
     selectIsometricTarget({solidId:solid.id,faceId:'top',faceIndex:1});activateTranslate();
     translateXInput.value='1';translateYInput.value='0';translateZInput.value='0';translateSelectedEntities();undoDocumentChange();redoDocumentChange();
     return {loaded,valid:display.validation.valid,faces:display.faces.map(f=>f.id),entities:documentModel.entities.length,history:historyState.undoStack.length,plain:serializeNativeProject()};
   },saved);
   assert(r.valid);assert.equal(r.loaded.solids,2);assert.equal(r.entities,1);assert.equal(r.faces.length,6);assert.equal(r.history,1);return {loaded:r.loaded,history:r.history};
 });

 await check('curved-brep-face-rendering-hole-and-picking',async()=>{
   const fixture=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/bore-project.json'),'utf8'));
   const asset={schemaVersion:1,backend:'opencascade.js',kernelVersion:fixture.kernel,canonicalUnits:'inch',brep:fixture.solid.brep,naming:fixture.solid.naming};
   const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
   const {createHash}=await import('node:crypto');const id='sha256:'+createHash('sha256').update(canonical(asset)).digest('hex');
   const project={format:'PrometheusCAD',schemaVersion:1,canonicalUnits:'inch',displayUnits:'inch',document:{entities:[],nextEntityId:1,model3d:{solids:[{id:1,type:'solid',kind:'Bore fixture',layerId:0,definition:fixture.solid.definition,transform:fixture.solid.transform,geometry:{type:'opencascade-brep',assetId:id}}],nextSolidId:2},layers:[{id:0,name:'Layer 0',locked:false,masked:false}],currentLayerId:0,nextLayerId:1},geometryAssets:{[id]:asset}};
   const r=await page.evaluate(async project=>{
     await openNativeProject(project);if(!is3dWorkspace())enterIsometricView();
     isometricViewState.yaw=0;isometricViewState.pitch=Math.PI/2;refreshIsometricView({refit:true});
     const top=modelLayer.querySelector('path[data-face-id="top"]');
     const solid=documentModel.model3d.solids[0],holePoint=projectWorldPointToIsometric(transformSolidVertex(solid,{x:0,y:0,z:1})),bodyPoint=projectWorldPointToIsometric(transformSolidVertex(solid,{x:.75,y:0,z:1}));
     const data={topPaths:modelLayer.querySelectorAll('path[data-face-id="top"]').length,triangles:+top.dataset.triangleCount,hole:top.isPointInFill(new DOMPoint(holePoint.x,holePoint.y)),body:top.isPointInFill(new DOMPoint(bodyPoint.x,bodyPoint.y)),strokes:[...modelLayer.querySelectorAll('path')].map(p=>getComputedStyle(p).stroke),edges:modelLayer.querySelectorAll('.solid-edge').length};
     selectIsometricTarget({solidId:1,faceId:'bore-wall',faceIndex:2});data.selected=modelSelectionState.selectedFace.faceId;const point=new DOMPoint(bodyPoint.x,bodyPoint.y).matrixTransform(modelLayer.querySelector('path[data-face-id="top"]').getScreenCTM());data.screenPoint={x:point.x,y:point.y};return data;
   },project);
   assert.equal(r.topPaths,1);assert(r.triangles>20);assert(!r.hole&&r.body);assert(r.strokes.every(s=>s==='none'));assert.equal(r.edges,15);assert.equal(r.selected,'bore-wall');
   await page.mouse.click(r.screenPoint.x,r.screenPoint.y);
   assert.equal(await page.evaluate(()=>modelSelectionState.selectedFace?.faceId),'top');
   await page.screenshot({path:path.join(out,'curved.png'),fullPage:true});return r;
 });
 await check('native-project-file-input',async()=>{
   await page.locator('#projectFileInput').setInputFiles(path.join(out,'roundtrip.pcad'));
   const r=await page.evaluate(async()=>{await lastProjectOperation;return {solids:documentModel.model3d.solids.length,status:commandStatus.textContent};});
   assert.equal(r.solids,2);assert.equal(r.status,'Project opened.');return r;
 });

 await check('invalid-open-preserves-document-history-and-assets',async()=>{
   const r=await page.evaluate(async()=>{
     const before=JSON.stringify(serializeNativeProject()),history=JSON.stringify(historyState),stats=PrometheusModeling.diagnostics();
     const bad=serializeNativeProject();Object.values(bad.geometryAssets)[0].brep='corrupt';
     let error;try{await openNativeProject(bad);}catch(e){error=e.message;}
     return {error,unchanged:before===JSON.stringify(serializeNativeProject()),historySame:history===JSON.stringify(historyState),assetsSame:stats.assets===PrometheusModeling.diagnostics().assets};
   });assert.match(r.error,/checksum/);assert(r.unchanged&&r.historySame&&r.assetsSame);return r;
 });
 await check('legacy-snapshot-load-without-automatic-conversion',async()=>{
   const record=reference.cases[0].reference.record;
   const r=await page.evaluate(async solid=>{
     const legacy={entities:[{id:1,type:'point',layerId:0,x:2,y:3}],nextEntityId:2,model3d:{solids:[solid],nextSolidId:42}};
     await openNativeProject(legacy);renderEntities();
     return {hasTopology:!!documentModel.model3d.solids[0].topology,kernel:!!documentModel.model3d.solids[0].geometry,polygons:modelLayer.querySelectorAll('polygon.solid-face').length};
   },record);assert(r.hasTopology&&!r.kernel);assert.equal(r.polygons,6);return r;
 });
 await check('invalid-and-tiny-box-are-atomic',async()=>{
   const r=await page.evaluate(async angle=>{
     const before=JSON.stringify(captureDocumentSnapshot()),history=historyState.undoStack.length;activateBox();boxDraftAngleInput.value=String(angle);await createBoxFromInputs();
     const tinyError=boxToolMessage.textContent,first=before===JSON.stringify(captureDocumentSnapshot());activateBox();boxLengthInput.value='0';await createBoxFromInputs();
     return {tinyError,first,second:before===JSON.stringify(captureDocumentSnapshot()),historySame:history===historyState.undoStack.length};
   },reference.cases.find(c=>c.id==='rect-top-2e-9').inputs.draftAngleDegrees);
   assert.match(r.tinyError,/e5/);assert(r.first&&r.second&&r.historySame);return r;
 });
 await check('pending-box-cancel-and-document-change-do-not-commit',async()=>{
   const r=await page.evaluate(async()=>{
     activateBox();const count=documentModel.model3d.solids.length,op=createBoxFromInputs();closeBoxWindow();await op;
     activateBox();const second=createBoxFromInputs();recordDocumentChange('Concurrent edit');await second;
     return {unchanged:count===documentModel.model3d.solids.length,disabled:boxCreateButton.disabled};
   });assert(r.unchanged);assert.equal(r.disabled,false);return r;
 });
 await check('kernel-initialization-failure-keeps-2d-and-document-working',async()=>{
   const failurePage=await context.newPage();await failurePage.route('**/*.wasm',route=>route.abort());
   await failurePage.goto(server.url+'?dev=1');await failurePage.waitForFunction(()=>typeof createBoxFromInputs==='function');
   const r=await failurePage.evaluate(async()=>{
     enterIsometricView();activateBox();await createBoxFromInputs();const message=boxToolMessage.textContent;
     exitIsometricView();addPoint(4,5);addCoordinateCircle({x:0,y:0},1);undoDocumentChange();redoDocumentChange();
     const project=serializeNativeProject();await openNativeProject(project);
     return {message,solids:documentModel.model3d.solids.length,entities:documentModel.entities.length,types:documentModel.entities.map(e=>e.type),status:PrometheusModeling.diagnostics().status};
   });await failurePage.close();assert.equal(r.solids,0);assert(r.types.includes('point')&&r.types.includes('circle'));assert.equal(r.status,'failed');assert.match(r.message,/fetch|WASM|kernel/i);return r;
 });
 await check('display-cache-regeneration-preserves-exact-project',async()=>{
   const r=await page.evaluate(async project=>{
     await openNativeProject(project);
     closeBoxWindow();const before=JSON.stringify(serializeNativeProject());PrometheusModeling.invalidate();renderEntities();
     await Promise.all(documentModel.model3d.solids.map(s=>PrometheusModeling.ensure(s)));
     return {same:before===JSON.stringify(serializeNativeProject()),kernels:documentModel.model3d.solids.filter(s=>PrometheusModeling.geometryId(s)).length,valid:documentModel.model3d.solids.every(s=>!PrometheusModeling.geometryId(s)||PrometheusModeling.getDisplay(s).validation.valid)};
   },saved);assert(r.same&&r.valid);assert.equal(r.kernels,2);return r;
 });
 await check('browser-runtime-errors',()=>{assert.deepEqual(errors,[]);return errors;});
 await page.screenshot({path:path.join(out,'application.png'),fullPage:true});
}finally{
 await browser?.close();await server.close();report.finishedAt=new Date().toISOString();
 await fs.writeFile(path.join(out,'application.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks.length,failures:report.failures},null,2));if(report.failures.length)process.exitCode=1;
}
