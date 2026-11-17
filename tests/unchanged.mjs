import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {root} from '../tools/server.mjs';
const before=await fs.readFile(path.join(root,'tests/fixtures/legacy-main.js'),'utf8'),after=await fs.readFile(path.join(root,'main.js'),'utf8');
const allowed=new Set(['getSolidLocalVertices','getSolidFaceRecords','activateBox','closeBoxWindow','createBoxFromInputs','renderModelSolids','renderEntities','recordDocumentChange','restoreDocumentSnapshot']);
function functions(source){
 const result=new Map();
 for(const match of source.matchAll(/^(?:async )?function (\w+)\(/gm)){
   const end=source.indexOf('\n}',match.index);
   assert(end>=0,match[1]);result.set(match[1],source.slice(match.index,end+2));
 }
 return result;
}
const original=functions(before.replaceAll("\r\n","\n")),current=functions(after.replaceAll("\r\n","\n")),changed=[],missing=[];
for(const [name,source]of original){
 if(!current.has(name))missing.push(name);
 else if(current.get(name)!==source)changed.push(name);
}
assert.deepEqual(missing,[]);
assert.deepEqual(changed.filter(name=>!allowed.has(name)),[]);
const report={checks:[{name:'legacy-functions-preserved-outside-explicit-integration-points',status:'pass',detail:{unchanged:original.size-changed.length,changed,missing}}],failures:[]};
await fs.mkdir(path.join(root,'tests/results'),{recursive:true});await fs.writeFile(path.join(root,'tests/results/unchanged.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
