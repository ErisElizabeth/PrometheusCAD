const {app,BrowserWindow,protocol,session,ipcMain,dialog}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const profile=process.env.PROMETHEUS_PROFILE||path.join(path.dirname(app.getPath('exe')),'prometheuscad-data');
for(const dir of [profile,path.join(profile,'session'),path.join(profile,'crashes')])require('node:fs').mkdirSync(dir,{recursive:true});
app.setPath('userData',profile);app.setPath('sessionData',path.join(profile,'session'));app.setPath('crashDumps',path.join(profile,'crashes'));
app.commandLine.appendSwitch('disable-background-networking');app.commandLine.appendSwitch('disable-component-update');
protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
let window,currentFile,candidate;
function sender(event){if(event.sender!==window.webContents||(new URL(event.senderFrame.url).protocol!=='app:'||new URL(event.senderFrame.url).host!=='prometheuscad'))throw Error('Invalid project IPC sender');}
async function atomicWrite(file,contents){
  const temporary=file+'.'+crypto.randomUUID()+'.tmp';let handle;
  try{
    handle=await fs.open(temporary,'wx');await handle.writeFile(contents,'utf8');await handle.sync();await handle.close();handle=null;
    await fs.rename(temporary,file);
  }catch(error){
    await handle?.close().catch(()=>{});
    await fs.unlink(temporary).catch(()=>{});
    throw error;
  }
}
app.whenReady().then(async()=>{
  for(const dir of [profile,path.join(profile,'session'),path.join(profile,'crashes')])await fs.mkdir(dir,{recursive:true});
  app.setAppLogsPath(path.join(profile,'logs'));
  const {root,runtimeFiles,mime,csp}=await import(pathToFileURL(path.join(__dirname,'../tools/server.mjs')).href);
  const allowed=new Set(await runtimeFiles()),blocked=[];
  session.defaultSession.webRequest.onBeforeRequest((details,callback)=>{const cancel=/^https?:/i.test(details.url);if(cancel)blocked.push(details.url);callback({cancel});});
  protocol.handle('app',async request=>{
    const url=new URL(request.url),file=decodeURIComponent(url.pathname).replace(/^\/+/,'')||'index.html';
    if(url.host!=='prometheuscad'||!allowed.has(file))return new Response('Not found',{status:404});
    try{return new Response(await fs.readFile(path.join(root,file)),{headers:{'Content-Type':mime(file),'Content-Security-Policy':csp}});}catch{return new Response('Asset unavailable',{status:500});}
  });
  ipcMain.handle('project:open',async event=>{
    sender(event);
    const result=process.env.PROMETHEUS_TEST_FILE?{canceled:false,filePaths:[process.env.PROMETHEUS_TEST_FILE]}:await dialog.showOpenDialog(window,{filters:[{name:'PrometheusCAD project',extensions:['pcad','json']}],properties:['openFile']});
    if(result.canceled)return {canceled:true};
    const file=result.filePaths[0],contents=await fs.readFile(file,'utf8');
    candidate={token:crypto.randomUUID(),file};
    return {canceled:false,contents,name:path.basename(file),token:candidate.token};
  });
  ipcMain.handle('project:accept-open',(event,token)=>{
    sender(event);if(!candidate||token!==candidate.token)throw Error('Expired project open');
    currentFile=candidate.file;candidate=null;return true;
  });
  ipcMain.handle('project:save',async(event,options)=>{
    sender(event);if(typeof options?.contents!=='string'||options.contents.length>64*1024*1024)throw Error('Invalid project contents');
    let file=currentFile;
    if(!file||options.saveAs){
      const result=process.env.PROMETHEUS_TEST_FILE?{canceled:false,filePath:process.env.PROMETHEUS_TEST_FILE}:await dialog.showSaveDialog(window,{defaultPath:path.basename(options.suggestedName||'PrometheusCAD.pcad'),filters:[{name:'PrometheusCAD project',extensions:['pcad']}]});
      if(result.canceled)return {canceled:true};file=result.filePath;
    }
    await atomicWrite(file,options.contents);currentFile=file;return {canceled:false,name:path.basename(file)};
  });
  window=new BrowserWindow({width:1440,height:1000,show:process.env.PROMETHEUS_TEST!=='1',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,backgroundThrottling:false,offscreen:process.env.PROMETHEUS_TEST==='1'}});
  window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith('app://prometheuscad/'))event.preventDefault();});
  globalThis.integrationInfo=()=>({versions:process.versions,isPackaged:app.isPackaged,appPath:app.getAppPath(),profile,blocked,preferences:window.webContents.getLastWebPreferences()});
  await window.loadURL('app://prometheuscad/');
});
app.on('window-all-closed',()=>app.quit());
