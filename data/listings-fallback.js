/* FUORISEDE · caricamento annunci (identico in produzione e test-interno; la differenza la fa versione.js)
 *   data/listings-operativa-v3.json → schede FUORISEDE: ACER e privati raccolti a mano
 *   data/phosphoro-ferrara.json     → annunci Phosphoro, riscritto ogni notte da GitHub Actions (scripts/sync-phosphoro.mjs)
 *   /api/immobiliare?city=Milano    → solo in test-interno: annunci Sandbox Immobiliare.it
 * Intercetta subito il fetch dati e attende il dataset completo, evitando la race con app.js. */
window.FUORISEDE_FALLBACK_LISTINGS=null;
(function(){
  const TEST_INTERNO=window.FUORISEDE_VERSIONE==='test-interno';
  const nativeFetch=window.fetch.bind(window);
  async function load(p,required){try{const r=await nativeFetch(p,{cache:'no-store'});if(!r.ok)throw new Error(p+' '+r.status);return await r.json()}catch(e){if(required)throw e;console.warn('[FUORISEDE] fonte non caricata:',p,e);return []}}
  async function milano(){
    if(!TEST_INTERNO)return [];
    const data=await load('/api/immobiliare?city=Milano',false);
    let next=1000000;return (Array.isArray(data)?data:data.items||[]).map(x=>({...x,externalId:x.id,id:next++}));
  }
  const datasetPromise=Promise.all([load('/data/listings-operativa-v3.json',true),load('/data/phosphoro-ferrara.json',false),milano()]).then(parts=>{
    const seen=new Set();
    const all=parts.flat().filter(x=>{if(!TEST_INTERNO&&x.city!=='Ferrara')return false;const k=String(x.id);if(seen.has(k))return false;seen.add(k);return true});
    window.FUORISEDE_FALLBACK_LISTINGS=all;
    console.info('[FUORISEDE] versione '+(window.FUORISEDE_VERSIONE||'?')+' · annunci:',all.length);
    return all;
  });
  window.fetch=function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.indexOf('/data/listings-operativa-v3.json')!==-1){
      return datasetPromise.then(all=>({ok:true,status:200,json:()=>Promise.resolve(all.slice())}));
    }
    return nativeFetch(input,init);
  };
  if(TEST_INTERNO){
    document.addEventListener('DOMContentLoaded',()=>{const b=document.createElement('div');b.textContent='TEST INTERNO · non pubblicare · include Milano (Sandbox Immobiliare.it)';b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#b91c1c;color:#fff;font:600 12px/1.8 system-ui;text-align:center;pointer-events:none';document.body.appendChild(b)});
    return;
  }
  /* Produzione: Ferrara è l'unica città selezionabile. */
  function publicFerraraOnly(){
    document.querySelectorAll('select').forEach(sel=>{
      [...sel.options].filter(o=>o.value==='Milano').forEach(o=>o.remove());
      if(sel.value==='Milano'){sel.value='Ferrara';sel.dispatchEvent(new Event('change',{bubbles:true}))}
    });
  }
  new MutationObserver(publicFerraraOnly).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',publicFerraraOnly);
})();
