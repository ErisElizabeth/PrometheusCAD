// Only packaged static assets are cached. Updates wait for existing document tabs to close.
const prefix='prometheuscad-assets-'+encodeURIComponent(self.registration.scope)+'-';
const version=new URL(self.location.href).searchParams.get('v'),cacheName=prefix+version;
let manifest;
async function settings(){
  if(manifest)return manifest;
  const key=new URL('assets-manifest.json',self.registration.scope),cache=await caches.open(cacheName);
  const cached=await cache.match(key);
  const response=cached||await fetch(new Request(key,{cache:'no-store'}));
  if(!response.ok)throw Error('Missing static asset manifest');
  const candidate=await response.json();if(candidate.version!==version)throw Error('Static asset version changed during installation');
  return manifest=candidate;
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const manifest=await settings(),cache=await caches.open(cacheName);
  await cache.addAll(manifest.files.map(file=>new URL(file,self.registration.scope).href));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await settings();
  for(const name of await caches.keys())if(name.startsWith(prefix)&&name!==cacheName)await caches.delete(name);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);if(!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const client=event.clientId?await self.clients.get(event.clientId):null;
    if(event.request.cache==='no-store'||url.searchParams.has('dev')||(client&&new URL(client.url).searchParams.has('dev')))return fetch(event.request);
    const manifest=await settings(),base=new URL(self.registration.scope);
    const relative=url.pathname.slice(base.pathname.length)||'index.html';
    if(!manifest.files.includes(relative))return fetch(event.request);
    return await (await caches.open(cacheName)).match(new URL(relative,self.registration.scope))||fetch(event.request);
  })());
});
