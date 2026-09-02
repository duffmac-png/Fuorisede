/* ANDROID DIRECT PRICE PILL FIX 20260901D */
(function(){
  const mobile=()=>window.matchMedia('(max-width:700px),(pointer:coarse)').matches;
  function install(mapId='demo-map',tries=0){
    if(!mobile())return;
    const context=window.activeMapMarkers?.get?.(mapId);
    const canvas=document.getElementById(mapId);
    if((!context||!canvas)&&tries<40){setTimeout(()=>install(mapId,tries+1),100);return}
    if(!context||!canvas)return;
    canvas.style.position='relative';
    let card=canvas.querySelector('.fs-mobile-map-card');
    if(!card){
      card=document.createElement('div');card.className='fs-mobile-map-card';card.hidden=true;canvas.appendChild(card);
    }
    const show=(entry)=>{
      if(!entry)return;
      const {marker,x}=entry;
      const popup=marker.getPopup?.();
      const html=popup?.getContent?.()||`<b>${x.title||'Alloggio'}</b><br>${window.euro?euro(x.price):x.price||''}`;
      context.map.closePopup();
      card.innerHTML=`<button class="fs-mobile-map-card-close" type="button" aria-label="Chiudi">×</button><div class="fs-mobile-map-card-body">${html}</div>`;
      card.hidden=false;
      card.querySelector('.fs-mobile-map-card-close').onclick=(e)=>{e.stopPropagation();card.hidden=true};
    };
    // Leaflet ricrea il nodo DOM del tooltip quando cambia direzione o viene
    // riaperto. Un listener collegato direttamente alla pillola va quindi
    // perso dopo zoom/pan. La delega sul contenitore della mappa sopravvive a
    // ogni ridisegno e risolve il tap Android anche sulle pillole ricreate.
    if(!canvas.__fsPillDelegation){
      canvas.__fsPillDelegation=true;
      let lastPillActivation=0;
      const activatePill=(ev)=>{
        const pill=ev.target?.closest?.('.listing-price-tooltip');
        if(!pill||!canvas.contains(pill))return;
        const entry=[...context.markers.values()].find(({marker})=>marker.getTooltip?.()?.getElement?.()===pill);
        if(!entry)return;
        ev.preventDefault();
        ev.stopPropagation();
        const now=Date.now();
        if(now-lastPillActivation<350)return;
        lastPillActivation=now;
        show(entry);
      };
      canvas.addEventListener('pointerup',activatePill,{capture:true,passive:false});
      canvas.addEventListener('click',activatePill,{capture:true,passive:false});
    }
    context.markers.forEach((entry)=>{
      const {marker}=entry;
      if(marker.__fsPillDirect)return;marker.__fsPillDirect=true;
      marker.on('click',()=>show(entry));
      const bindPill=()=>{
        const tip=marker.getTooltip?.();
        const el=tip?.getElement?.();
        if(!el)return false;
        el.style.pointerEvents='auto';el.style.cursor='pointer';el.style.touchAction='manipulation';
        // Conserviamo anche il binding diretto come fallback per WebView meno
        // recenti; il binding delegato sopra resta la fonte principale.
        const activate=(ev)=>{ev.preventDefault();ev.stopPropagation();show(entry)};
        el.addEventListener('click',activate,{passive:false});
        return true;
      };
      if(!bindPill()){let n=0,t=setInterval(()=>{if(bindPill()||++n>20)clearInterval(t)},100)}
    });
  }
  const css=document.createElement('style');css.textContent=`
  @media(max-width:700px),(pointer:coarse){
    .listing-price-tooltip{pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;z-index:900!important}
    .leaflet-popup{display:none!important}
    .fs-mobile-map-card{position:absolute;z-index:1200;left:10px;right:10px;bottom:12px;max-height:46%;overflow:auto;background:#fff;border:1px solid #e5ddd2;border-radius:16px;padding:14px 40px 14px 14px;box-shadow:0 8px 28px #0004;color:#222}
    .fs-mobile-map-card[hidden]{display:none!important}.fs-mobile-map-card-close{position:absolute;right:8px;top:7px;width:30px;height:30px;border:0;border-radius:50%;background:#f2eee9;font-size:22px;line-height:1;cursor:pointer}
    .fs-mobile-map-card-body{font-size:13px;line-height:1.4;overflow-wrap:anywhere}.fs-mobile-map-card-body button,.fs-mobile-map-card-body a{max-width:100%;white-space:normal}
  }`;document.head.appendChild(css);
  function boot(){install('demo-map');setTimeout(()=>install('demo-map'),600);setTimeout(()=>install('demo-map'),1600)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(boot,180);return r};
})();
