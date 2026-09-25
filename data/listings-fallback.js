/* FUORISEDE PUBLIC FERRARA loader: schede FUORISEDE + annunci Phosphoro (aggiornati ogni notte). Intercetta subito il fetch dati e attende il dataset completo, evitando la race con app.js. */
window.FUORISEDE_FALLBACK_LISTINGS=null;
(function(){
  const nativeFetch=window.fetch.bind(window);
  const paths=['/data/listings-operativa-v3.json','/data/phosphoro-ferrara.json']; /* phosphoro-ferrara.json aggiornato ogni notte da GitHub Actions */
  const datasetPromise=Promise.all(paths.map(async(p,i)=>{try{const r=await nativeFetch(p,{cache:'no-store'});if(!r.ok)throw new Error(p+' '+r.status);return await r.json()}catch(e){if(i===0)throw e;console.warn('[FUORISEDE] annunci Phosphoro non caricati',e);return []}})).then(parts=>{
    const seen=new Set();
    const all=parts.flat().filter(x=>{if(x.city!=='Ferrara')return false;const k=String(x.id);if(seen.has(k))return false;seen.add(k);return true});
    window.FUORISEDE_FALLBACK_LISTINGS=all;
    console.info('[FUORISEDE] dataset pubblico Ferrara pronto:',all.length);
    return all;
  });
  window.fetch=function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.indexOf('/data/listings-operativa-v3.json')!==-1){
      return datasetPromise.then(all=>({ok:true,status:200,json:()=>Promise.resolve(all.slice())}));
    }
    return nativeFetch(input,init);
  };
  /* Nella versione pubblica Ferrara è l'unica città selezionabile. Milano resta nel branch interno. */
  function publicFerraraOnly(){
    document.querySelectorAll('select').forEach(sel=>{
      [...sel.options].filter(o=>o.value==='Milano').forEach(o=>o.remove());
      if(sel.value==='Milano'){sel.value='Ferrara';sel.dispatchEvent(new Event('change',{bubbles:true}))}
    });
  }
  new MutationObserver(publicFerraraOnly).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',publicFerraraOnly);
})();
