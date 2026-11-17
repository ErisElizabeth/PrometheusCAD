import {chromium,_electron} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,startServer,runtimeFiles} from '../tools/server.mjs';
import {packagePortable} from '../tools/package-portable.mjs';
const output=path.join(root,'tests/results');await fs.mkdir(output,{recursive:true});
const temporary=path.join(root,'.cache/tmp');await fs.mkdir(temporary,{recursive:true});process.env.TEMP=temporary;process.env.TMP=temporary;
const reference=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/drafted-box-reference.json'),'utf8'));
const report={startedAt:new Date().toISOString(),checks:[],failures:[]};
async function check(name,fn){try{const detail=await fn();report.checks.push({name,status:'pass',detail});}catch(e){const item={name,status:'fail',error:String(e),stack:e.stack};report.checks.push(item);report.failures.push(item);console.error(name+': '+String(e));}}
async function create(page,inputs){return page.evaluate(async inputs=>{
 if(!is3dWorkspace())enterIsometricView();activateBox();
 for(const [key,id]of Object.entries({x:'boxX',y:'boxY',z:'boxZ',length:'boxLength',width:'boxWidth',height:'boxHeight',draftAngleDegrees:'boxDraftAngle'}))document.getElementById(id).value=String(inputs[key]);
 const before=documentModel.model3d.solids.length;await createBoxFromInputs();const solid=documentModel.model3d.solids.at(-1);
 return {created:documentModel.model3d.solids.length===before+1,message:boxToolMessage.textContent,validation:solid&&PrometheusModeling.getDisplay(solid)?.validation};
},inputs);}
const packaged=await packagePortable();let server,browser,desktop;
try{
 server=await startServer();
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({serviceWorkers:'allow',viewport:{width:1440,height:1000}}),page=await context.newPage();
 await page.goto(server.url);await page.waitForFunction(()=>window.PrometheusOfflineReady);
 await check('static-assets-cached-without-kernel-initialization',async()=>{
   assert(await page.evaluate(()=>window.PrometheusOfflineReady));const diagnostics=await page.evaluate(()=>PrometheusModeling.diagnostics());assert.equal(diagnostics.status,'idle');return diagnostics;
 });
 const url=server.url;await server.close();server=null;await context.setOffline(true);
 await check('browser-server-stopped-offline-reload-and-signed-boxes',async()=>{
   await page.reload();await page.waitForFunction(()=>typeof createBoxFromInputs==='function');
   const results=[];for(const c of reference.cases.filter(c=>['default-origin-0','default-origin-5','default-origin--5'].includes(c.id))){const r=await create(page,c.inputs);assert(r.created,r.message);assert(r.validation.valid);results.push({id:c.id,volume:r.validation.volume});}return results;
 });
 await check('real-camera-orbit-pan-zoom-preserves-document',async()=>{
   const before=await page.evaluate(()=>({document:JSON.stringify(serializeNativeProject()),yaw:isometricViewState.yaw,pitch:isometricViewState.pitch,center:{x:viewState.centerX,y:viewState.centerY},zoom:isometricViewState.displayView.zoom}));
   const box=await page.locator('#cadCanvas').boundingBox(),x=box.x+box.width*.4,y=box.y+box.height*.4;
   await page.mouse.move(x,y);await page.mouse.down({button:'right'});await page.mouse.move(x+70,y+35,{steps:6});await page.mouse.up({button:'right'});
   const orbit=await page.evaluate(()=>({yaw:isometricViewState.yaw,pitch:isometricViewState.pitch}));
   assert.notEqual(orbit.yaw,before.yaw);assert.notEqual(orbit.pitch,before.pitch);
   await page.mouse.move(x,y);await page.mouse.down({button:'middle'});await page.mouse.move(x+40,y+20,{steps:4});await page.mouse.up({button:'middle'});
   const pan=await page.evaluate(()=>({...isometricViewState.displayView}));
   await page.mouse.wheel(0,-100);
   const after=await page.evaluate(()=>({document:JSON.stringify(serializeNativeProject()),view:{...isometricViewState.displayView}}));
   assert.equal(after.document,before.document);assert.notEqual(after.view.zoom,before.zoom);return {orbit,pan,zoom:after.view.zoom};
 });
 let offlineProject;
 await check('offline-file-codec-fresh-page-fresh-worker',async()=>{
   offlineProject=await page.evaluate(()=>{addPoint(4,5);return serializeNativeProject();});
   const fresh=await context.newPage();await fresh.goto(url);await fresh.waitForFunction(()=>typeof openNativeProject==='function');
   const r=await fresh.evaluate(async project=>{await openNativeProject(project);enterIsometricView();return {solids:documentModel.model3d.solids.length,entities:documentModel.entities.length,valid:documentModel.model3d.solids.every(s=>PrometheusModeling.getDisplay(s).validation.valid)};},offlineProject);
   await fresh.screenshot({path:path.join(output,'offline.png'),fullPage:true});await fresh.close();assert.equal(r.solids,3);assert.equal(r.entities,1);assert(r.valid);return r;
 });
 // Keep the cached offline browser alive for desktop-to-browser project exchange.
 const fileContext=await browser.newContext(),filePage=await fileContext.newPage();
 await check('file-url-retains-2d-without-kernel',async()=>{
   await filePage.goto(new URL('../index.html',import.meta.url).href);await filePage.waitForFunction(()=>typeof addPoint==='function');
   const result=await filePage.evaluate(()=>{addPoint(1,2);return {entities:documentModel.entities.length,kernel:PrometheusModeling.diagnostics().status};});assert.equal(result.entities,1);assert.equal(result.kernel,'idle');return result;
 });await fileContext.close();
 await check('strict-csp-failure-isolated-from-2d',async()=>{
   const strictServer=await startServer({strict:true}),strictPage=await browser.newPage();
   try{
     await strictPage.goto(strictServer.url+'?dev=1');await strictPage.waitForFunction(()=>typeof createBoxFromInputs==='function');
     const r=await create(strictPage,reference.cases[0].inputs);
     assert(!r.created);assert.match(r.message,/unsafe-eval/);
     const points=await strictPage.evaluate(()=>{exitIsometricView();addPoint(2,3);return documentModel.entities.length;});
     assert.equal(points,1);return {created:false,points,message:r.message};
   }finally{await strictPage.close();await strictServer.close();}
 });
 const nativePath=path.join(output,'native-electron.pcad');
 const env={...process.env,PROMETHEUS_TEST:'1',PROMETHEUS_PROFILE:path.join(root,'.profiles/electron'),PROMETHEUS_TEST_FILE:nativePath};delete env.ELECTRON_RUN_AS_NODE;
 desktop=await _electron.launch({executablePath:packaged.executable,env,timeout:60000});let desktopPage=await desktop.firstWindow();await desktopPage.waitForFunction(()=>typeof createBoxFromInputs==='function');
 await check('portable-electron-isolation-local-assets-and-no-eager-kernel',async()=>{
   const info=await desktop.evaluate(()=>globalThis.integrationInfo());report.electron=info;
   assert(info.isPackaged);assert(info.preferences.sandbox&&info.preferences.contextIsolation&&!info.preferences.nodeIntegration);
   assert.equal(await desktopPage.evaluate(()=>typeof require),'undefined');assert.equal(await desktopPage.evaluate(()=>PrometheusModeling.diagnostics().status),'idle');return {isPackaged:info.isPackaged,versions:info.versions};
 });
 for(const c of reference.cases.filter(c=>c.category==='normal')){
   await check('electron-box-'+c.id,async()=>{const r=await create(desktopPage,c.inputs);assert(r.created,r.message);assert(r.validation.valid);assert(Math.abs(r.validation.volume-c.reference.record.topology.signedVolume)<1e-8);return {volume:r.validation.volume};});
 }
 await check('native-file-save-and-browser-codec-exchange',async()=>{
   await desktopPage.evaluate(()=>saveNativeProject());
   const project=JSON.parse(await fs.readFile(nativePath,'utf8'));assert.equal(project.document.model3d.solids.length,20);
   const fromDesktop=await page.evaluate(async project=>{
     await openNativeProject(project);
     return {solids:documentModel.model3d.solids.length,valid:documentModel.model3d.solids.every(s=>PrometheusModeling.getDisplay(s).validation.valid)};
   },project);
   assert.equal(fromDesktop.solids,20);assert(fromDesktop.valid);
   // Browser->Electron exchange validates a project produced while its server was stopped.
   const r=await desktopPage.evaluate(async project=>{await openNativeProject(project);return {solids:documentModel.model3d.solids.length,valid:documentModel.model3d.solids.every(s=>PrometheusModeling.getDisplay(s).validation.valid)};},offlineProject);
   assert.equal(r.solids,3);assert(r.valid);
   // Restore the desktop document and persist it through the native bridge.
   await desktopPage.evaluate(async project=>{await openNativeProject(project);await saveNativeProject();},project);
   return {bytes:(await fs.stat(nativePath)).size,solids:project.document.model3d.solids.length};
 });
 await desktop.close();desktop=null;
 desktop=await _electron.launch({executablePath:packaged.executable,env,timeout:60000});desktopPage=await desktop.firstWindow();await desktopPage.waitForFunction(()=>typeof chooseNativeProject==='function');
 await check('native-file-close-relaunch-open-and-subsequent-edit',async()=>{
   const r=await desktopPage.evaluate(async()=>{
     await chooseNativeProject();enterIsometricView();const solid=documentModel.model3d.solids[0];
     selectIsometricTarget({solidId:solid.id,faceId:'top',faceIndex:1});activateRotate();rotateAngleInput.value='90';rotateAxisZInput.checked=true;rotateSelectedEntity();undoDocumentChange();redoDocumentChange();await saveNativeProject();
     return {solids:documentModel.model3d.solids.length,faces:PrometheusModeling.getDisplay(solid).faces.map(f=>f.id),history:historyState.undoStack.length};
   });assert.equal(r.solids,20);assert.equal(r.faces.length,6);assert.equal(r.history,1);return r;
 });
 await check('native-failed-open-does-not-replace-current-document',async()=>{
   const original=await fs.readFile(nativePath,'utf8');await fs.writeFile(nativePath,'{"format":"wrong"}');
   const r=await desktopPage.evaluate(async()=>{
     const before=JSON.stringify(serializeNativeProject());let rejected=false;try{await chooseNativeProject();}catch{rejected=true;}
     return {rejected,unchanged:before===JSON.stringify(serializeNativeProject())};
   });await fs.writeFile(nativePath,original);assert(r.rejected&&r.unchanged);return r;
 });
 await check('portable-native-capture',async()=>{
   const capture=await desktop.evaluate(async({BrowserWindow})=>{const image=await BrowserWindow.getAllWindows()[0].webContents.capturePage(undefined,{stayHidden:true,stayAwake:true});return image.toPNG().toString('base64');});
   await fs.writeFile(path.join(output,'electron.png'),Buffer.from(capture,'base64'));assert(capture.length>1000);return {bytes:Buffer.from(capture,'base64').length};
 });
 await check('packaged-runtime-identical-to-tested-source',async()=>{
   const app=path.join(packaged.destination,'resources/app'),differences=[];
   for(const file of [...await runtimeFiles(),'tools/server.mjs','electron/main.cjs','electron/preload.cjs']){
     const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
     if(hash(await fs.readFile(path.join(root,file)))!==hash(await fs.readFile(path.join(app,file))))differences.push(file);
   }assert.deepEqual(differences,[]);return {files:(await runtimeFiles()).length};
 });
 await check('protected-original-and-prototype-unchanged',async()=>{
   const manifest=JSON.parse(await fs.readFile(path.join(root,'tests/fixtures/protected-manifest.json'),'utf8')),counts={};
   for(const [label,source]of Object.entries(manifest)){
     const changed=[];for(const [file,sha]of Object.entries(source.files)){const actual=crypto.createHash('sha256').update(await fs.readFile(path.join(source.root,file))).digest('hex');if(actual!==sha)changed.push(file);}
     assert.deepEqual(changed,[],label);
     if(label==='original'){
       async function list(dir){const result=[];for(const item of await fs.readdir(dir,{withFileTypes:true})){if(['.git','node_modules','.cache','.profiles','portable','baseline'].includes(item.name))continue;const full=path.join(dir,item.name);if(item.isDirectory())result.push(...await list(full));else result.push(path.relative(source.root,full));}return result;}
       assert.deepEqual((await list(source.root)).sort(),Object.keys(source.files).sort(),'original additions/removals');
     }
     counts[label]=Object.keys(source.files).length;
   }return counts;
 });
}finally{
 await desktop?.close().catch(()=>{});await browser?.close().catch(()=>{});await server?.close().catch(()=>{});
 report.finishedAt=new Date().toISOString();await fs.writeFile(path.join(output,'portability.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({checks:report.checks.length,failures:report.failures},null,2));if(report.failures.length)process.exitCode=1;
}
