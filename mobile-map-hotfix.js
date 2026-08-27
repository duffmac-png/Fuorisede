// FUORISEDE Android/mobile map hotfix
// Keeps desktop behavior unchanged while decluttering price labels and popups on narrow touch screens.
(function(){
  const isMobileMap=()=>window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;

  document.head.insertAdjacentHTML('beforeend',`<style>
    @media (max-width:700px), (pointer:coarse){
      .mapzoomhint{display:none!important}
      .leaflet-popup-content-wrapper{max-width:min(280px,calc(100vw - 56px))!important;width:auto!important;border-radius:14px!important}
      .leaflet-popup-content{width:auto!important;max-width:min(248px,calc(100vw - 84px))!important;margin:10px 12px!important;font-size:11px!important;line-height:1.35!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
      .leaflet-popup-content b{display:block;white-space:normal!important;overflow-wrap:anywhere!important}
      .leaflet-popup-tip-container{width:26px!important;height:14px!important}
      .pinactions{display:grid!important;grid-template-columns:1fr!important;gap:6px!important;margin-top:8px!important}
      .pinactions button,.leaflet-popup-content .pinopen,.leaflet-popup-content .pincompare{display:block!important;width:100%!important;min-width:0!important;max-width:100%!important;margin:0!important;padding:8px 9px!important;white-space:normal!important;text-align:center!important}
      .leaflet-control-attribution{max-width:72vw!important;font-size:7px!important;line-height:1.1!important;white-space:normal!important}
      .listing-price-tooltip{font-size:10px!important;padding:4px 7px!important;box-shadow:0 2px 8px #0002!important}
      .listing-price-tooltip.mobile-price-hidden{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
      .mapminilist{max-width:100%!important;overscroll-behavior-x:contain!important}
      .mapmini{min-width:0!important;max-width:86vw!important}
      .mapcanvas{overflow:hidden!important}
    }
  </style>`);

  function rectsOverlap(a,b,pad=6){
    return !(a.right+pad<=b.left || b.right+pad<=a.left || a.bottom+pad<=b.top || b.bottom+pad<=a.top);
  }

  function declutterMapLabels(mapId='demo-map'){
    if(!isMobileMap())return;
    const context=window.activeMapMarkers?.get?.(mapId);
    if(!context)return;
    const activeId=Number(window.state?.mapActiveListingId);
    const entries=[];
    context.markers.forEach(({marker,x})=>{
      const tooltip=marker.getTooltip?.();
      const el=tooltip?.getElement?.();
      if(!el)return;
      el.classList.remove('mobile-price-hidden');
      const key=Number(x.id);
      entries.push({key,marker,el,priority:key===activeId?0:(window.state?.selected?.has?.(key)?1:2)});
    });
    entries.sort((a,b)=>a.priority-b.priority);
    const accepted=[];
    entries.forEach(entry=>{
      const rect=entry.el.getBoundingClientRect();
      const collision=accepted.some(other=>rectsOverlap(rect,other,7));
      if(collision && entry.priority>0)entry.el.classList.add('mobile-price-hidden');
      else accepted.push(rect);
    });
  }

  function scheduleDeclutter(mapId='demo-map'){
    requestAnimationFrame(()=>requestAnimationFrame(()=>declutterMapLabels(mapId)));
    setTimeout(()=>declutterMapLabels(mapId),120);
    setTimeout(()=>declutterMapLabels(mapId),320);
  }

  const timer=setInterval(()=>{
    if(!window.activeMapMarkers || !window.L)return;
    clearInterval(timer);
    ['demo-map','home-map'].forEach(mapId=>{
      const attach=()=>{
        const context=window.activeMapMarkers?.get?.(mapId);
        if(!context)return false;
        if(context.__mobileDeclutterReady)return true;
        context.__mobileDeclutterReady=true;
        ['zoomend','moveend','popupopen','popupclose'].forEach(evt=>context.map.on(evt,()=>scheduleDeclutter(mapId)));
        context.markers.forEach(({marker})=>marker.on('click',()=>scheduleDeclutter(mapId)));
        scheduleDeclutter(mapId);
        return true;
      };
      let tries=0;
      const wait=setInterval(()=>{tries++;if(attach()||tries>30)clearInterval(wait)},120);
    });
  },120);

  window.addEventListener('resize',()=>{
    if(isMobileMap())['demo-map','home-map'].forEach(scheduleDeclutter);
  });

  // Re-run after DOM renders and comparison changes.
  const root=document.getElementById('v3-root');
  if(root)new MutationObserver(()=>{
    if(isMobileMap())setTimeout(()=>['demo-map','home-map'].forEach(scheduleDeclutter),80);
  }).observe(root,{childList:true,subtree:true});
})();
