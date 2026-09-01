/* Hydrate campus landing pages without redirecting away from their canonical URL. */
(async function hydrateCampusLanding(){
  try{
    const response=await fetch('/index.html',{cache:'no-store'});
    if(!response.ok)throw new Error(`index ${response.status}`);
    const html=await response.text();
    const parsed=new DOMParser().parseFromString(html,'text/html');
    parsed.querySelectorAll('style').forEach(style=>document.head.appendChild(style.cloneNode(true)));

    const load=src=>new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=src;
      script.onload=resolve;
      script.onerror=reject;
      document.body.appendChild(script);
    });

    await load('/data/listings-fallback.js?v=20260901-1');
    const nativeFetch=window.fetch&&window.fetch.bind(window);
    const fallback=window.FUORISEDE_FALLBACK_LISTINGS;
    if(nativeFetch&&Array.isArray(fallback)&&fallback.length){
      window.fetch=function(input,init){
        const url=typeof input==='string'?input:(input&&input.url)||'';
        if(url.includes('/data/listings-operativa-v3.json')){
          return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(fallback.slice())});
        }
        return nativeFetch(input,init);
      };
    }

    await load('/app.js?v=seo-20260901-1');
    await load('/mobile-map-hotfix.js?v=seo-20260901-1');
    await load('/mobile-popup-fix.js?v=seo-20260901-1');
    await load('/mobile-map-structural.js?v=seo-20260901-1');
  }catch(error){
    const status=document.querySelector('[data-campus-status]');
    if(status)status.textContent='Apri la ricerca FUORISEDE dal collegamento qui sotto.';
  }
})();
