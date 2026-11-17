import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
export const csp="default-src 'self'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; worker-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'";
export const mime=file=>({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf'}[path.extname(file)]??'application/octet-stream');
export async function runtimeFiles(){
  const files=['index.html','main.js','style.css','project.js'];
  for(const name of ['Calculator','assets','modeling','vendor/opencascade/dist']){
    async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())await walk(full);else if(!full.endsWith('.d.ts'))files.push(path.relative(root,full).replaceAll('\\','/'));}}
    try{await walk(path.join(root,name));}catch(e){if(e.code!=='ENOENT')throw e;}
  }
  for(const file of ['offline.js','sw.js','assets-manifest.json'])try{await fs.access(path.join(root,file));files.push(file);}catch{}
  return files;
}
export async function startServer({port=0,strict=false}={}){
  const allowed=new Set(await runtimeFiles());
  const server=http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://localhost'),file=decodeURIComponent(url.pathname).replace(/^\/+/,'')||'index.html';
      if(!allowed.has(file)){res.writeHead(404);res.end('Not found');return;}
      const body=await fs.readFile(path.join(root,file));
      res.writeHead(200,{'Content-Type':mime(file),'Cache-Control':'no-store','Content-Security-Policy':strict?csp.replace(" 'unsafe-eval'",''):csp});res.end(body);
    }catch{res.writeHead(500);res.end('Asset unavailable');}
  });
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
  return {url:'http://127.0.0.1:'+server.address().port+'/',close:()=>new Promise(resolve=>server.close(resolve))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const server=await startServer({port:Number(process.env.PORT||8765)});console.log('PrometheusCAD: '+server.url+'?dev=1');
}
