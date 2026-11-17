import {spawnSync} from 'node:child_process';
for(const file of ['tests/unchanged.mjs','tests/characterization.mjs','tests/kernel.mjs','tests/run.mjs','tests/portability.mjs']){
  const result=spawnSync(process.execPath,[file],{stdio:'inherit',cwd:new URL('..',import.meta.url)});
  if(result.status!==0)process.exit(result.status??1);
}
