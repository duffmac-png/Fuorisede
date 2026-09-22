/* FUORISEDE test loader: 5 schede esistenti + 30 Phosphoro Ferrara. Carica i dati prima che app.js installi il fallback fetch. */
window.FUORISEDE_FALLBACK_LISTINGS=null;
(async function(){
  try{
    const paths=['/data/listings-operativa-v3.json','/data/phosphoro-1.json','/data/phosphoro-2.json','/data/phosphoro-3.json','/data/phosphoro-4.json','/data/phosphoro-5.json','/data/phosphoro-6.json'];
    const parts=await Promise.all(paths.map(async p=>{const r=await fetch(p,{cache:'no-store'});if(!r.ok)throw new Error(p+' '+r.status);return r.json()}));
    const all=parts.flat();
    const seen=new Set();
    window.FUORISEDE_FALLBACK_LISTINGS=all.filter(x=>{const k=String(x.id);if(seen.has(k))return false;seen.add(k);return x.city==='Ferrara'});
    console.info('[FUORISEDE] dataset Ferrara pronto:',window.FUORISEDE_FALLBACK_LISTINGS.length);
  }catch(err){
    console.error('[FUORISEDE] errore caricamento dataset test',err);
    try{const r=await fetch('/data/listings-operativa-v3.json',{cache:'no-store'});window.FUORISEDE_FALLBACK_LISTINGS=await r.json()}catch(_){window.FUORISEDE_FALLBACK_LISTINGS=[]}
  }
})();
