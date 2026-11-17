import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,runtimeFiles} from './server.mjs';
export async function buildAssets(){
  const files=(await runtimeFiles()).filter(f=>f!=='assets-manifest.json').sort();
  const hashes={};
  for(const file of files)hashes[file]=crypto.createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
  const version=crypto.createHash('sha256').update(JSON.stringify(hashes)).digest('hex').slice(0,20);
  const manifest={version,files:[...files,'assets-manifest.json'],sha256:hashes};
  await fs.writeFile(path.join(root,'assets-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.join(root,'tools/build-assets.mjs'))console.log(JSON.stringify({version:(await buildAssets()).version}));
