const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('PrometheusFiles',Object.freeze({
  open:()=>ipcRenderer.invoke('project:open'),
  acceptOpen:token=>ipcRenderer.invoke('project:accept-open',token),
  save:options=>ipcRenderer.invoke('project:save',options),
}));
