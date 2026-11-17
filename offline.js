(() => {
  const state=document.body.dataset;
  if(location.protocol==='app:'){state.offline='bundled';return;}
  if(!['http:','https:'].includes(location.protocol)||new URL(location.href).searchParams.has('dev')||!('serviceWorker'in navigator)){
    state.offline='disabled';window.PrometheusOfflineReady=Promise.resolve(false);return;
  }
  state.offline='caching';
  window.PrometheusOfflineReady=(async()=>{
    // New manifests bypass an older worker's static cache. Offline restarts use the active worker.
    let manifest;
    try{const response=await fetch('./assets-manifest.json',{cache:'no-store'});if(response.ok)manifest=await response.json();}catch{}
    if(manifest)await navigator.serviceWorker.register('./sw.js?v='+manifest.version);
    else if(!await navigator.serviceWorker.getRegistration())throw Error('Offline assets have not been cached');
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
    state.offline='ready';return true;
  })().catch(error=>{state.offline='unavailable';console.warn('Offline asset cache unavailable:',error);return false;});
})();
