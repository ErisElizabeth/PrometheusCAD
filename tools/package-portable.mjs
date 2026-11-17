import fs from 'node:fs/promises';
import path from 'node:path';
import {root,runtimeFiles} from './server.mjs';
import {buildAssets} from './build-assets.mjs';
export async function packagePortable(){
  await buildAssets();
  const destination=path.join(root,'build/PrometheusCAD-Portable');
  if(!path.resolve(destination).startsWith(root+path.sep))throw Error('Invalid package destination');
  await fs.mkdir(destination,{recursive:true});
  await fs.cp(path.join(root,'node_modules/electron/dist'),destination,{recursive:true});
  const app=path.join(destination,'resources/app');await fs.mkdir(app,{recursive:true});
  for(const file of [...await runtimeFiles(),'tools/server.mjs','electron/main.cjs','electron/preload.cjs']){
    const target=path.join(app,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(root,file),target);
  }
  await fs.writeFile(path.join(app,'package.json'),JSON.stringify({name:'prometheuscad-integration',version:'0.1.50',main:'electron/main.cjs',type:'module',private:true},null,2));
  const executable=path.join(destination,'PrometheusCAD.exe');
  await fs.copyFile(path.join(destination,'electron.exe'),executable);await fs.unlink(path.join(destination,'electron.exe'));
  await fs.copyFile(path.join(destination,'electron_wer.dll'),path.join(destination,'PrometheusCAD_wer.dll'));await fs.unlink(path.join(destination,'electron_wer.dll'));
  for(const file of ['THIRD_PARTY_NOTICES.md',...await list('third-party'),'vendor/opencascade/LICENSE','vendor/opencascade/package.json','vendor/opencascade/manifest.json','assets/OFL.txt']){
    const target=path.join(destination,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(root,file),target);
  }
  await fs.writeFile(path.join(destination,'PORTABLE_README.txt'),[
    'PrometheusCAD internal OpenCascade integration build','',
    'Run PrometheusCAD.exe. Keep this entire folder together. No installer, Node, or network is required.',
    'Settings and caches are stored beside the executable in prometheuscad-data.',
    'File Open/Save uses native dialogs and the portable .pcad JSON/B-rep format.',
    'This unsigned development build has unresolved CSP, source-distribution and LGPL release requirements.',
    'Read THIRD_PARTY_NOTICES.md before redistribution.','',
  ].join('\r\n'));
  return {destination,executable};
}
async function list(relative){const result=[];for(const entry of await fs.readdir(path.join(root,relative),{withFileTypes:true})){const file=relative+'/'+entry.name;if(entry.isDirectory())result.push(...await list(file));else result.push(file);}return result;}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(root,'tools/package-portable.mjs'))console.log(JSON.stringify(await packagePortable(),null,2));
