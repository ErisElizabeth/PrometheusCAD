import factory from '../vendor/opencascade/dist/opencascade.full.js';
import {createKernel,KERNEL_VERSION} from './kernel.mjs';
let ready;
async function initialize(){
  return ready??=(async()=>{
    const start=performance.now(),url=new URL('../vendor/opencascade/dist/opencascade.full.wasm',import.meta.url);
    const response=await fetch(url);if(!response.ok)throw Error('Local geometry WASM unavailable ('+response.status+'). 2D remains available.');
    const binary=await response.arrayBuffer(),warnings=[];
    const oc=await factory({wasmBinary:binary,locateFile:p=>p.endsWith('.wasm')?url.href:p,printErr:m=>warnings.push(String(m))});
    return {kernel:createKernel(oc),metrics:{version:KERNEL_VERSION,initializationMs:performance.now()-start,wasmBytes:binary.byteLength,heapBytes:oc.HEAP8.buffer.byteLength,warnings}};
  })();
}
self.onmessage=async({data:{id,command,payload}})=>{
  try{
    const {kernel,metrics}=await initialize();
    const result=command==='init'?metrics:command==='box'?kernel.createBox(payload):command==='load'?kernel.loadAsset(payload):(()=>{throw Error('Unknown modeling command');})();
    self.postMessage({id,ok:true,result});
  }catch(e){self.postMessage({id,ok:false,error:String(e)});}
};
