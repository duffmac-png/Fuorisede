// FUORISEDE Android/mobile map hotfix
(function(){
  const isMobileMap=()=>window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  document.head.insertAdjacentHTML('beforeend',`<style>@media (max-width:700px),(pointer:coarse){.mapzoomhint{display:none!important}.leaflet-popup{max-width:calc(100% - 28px)!important}.leaflet-popup-content-wrapper{max-width:calc(100vw - 54px)!important}.leaflet-popup-tip-container{width:26px!important;height:14px!important}.listing-price-tooltip{font-size:10px!important;padding:4px 7px!important}.listing-price-tooltip.mobile-price-hidden{opacity:0!important;visibility:hidden!important;pointer-events:none!important}.mapcanvas{overflow:hidden!important}.mapminilist{max-width:100%!important}.mapmini{min-width:0!important;max-width:86vw!important}.leaflet-control-attribution{max-width:72vw!important;font-size:7px!important}.v3nav{position:relative!important;top:auto!important;display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;margin:0 0 18px!important}.detail,.dddetail,.detaildesign,.design-detail{width:100%!important;max-width:100%!important;overflow-x:hidden!important}.detailphoto,.ddphoto,.ddhero,.designhero{width:calc(100% - 26px)!important;max-width:calc(100% - 26px)!important;margin-left:13px!important;margin-right:13px!important}}</style>`);

  function separateMarkers(mapId){
    if(!isMobileMap())return;const c=window.activeMapMarkers?.get?.(mapId);if(!c?.map||!c.markers?.length)return;
    const groups=[];
    c.markers.forEach(entry=>{const ll=entry.marker.getLatLng();let g=groups.find(q=>c.map.distance(q.base,ll)<18);if(!g){g={base:ll,items:[]};groups.push(g)}g.items.push(entry)});
    groups.forEach(g=>{
      if(g.items.length<2)return;
      const center=c.map.latLngToLayerPoint(g.base),n=g.items.length,r=18;
      g.items.forEach((entry,i)=>{if(!entry.__mobileOriginalLatLng)entry.__mobileOriginalLatLng=entry.marker.getLatLng();const angle=(Math.PI*2*i/n)-Math.PI/2;const pt=window.L.point(center.x+Math.cos(angle)*r,center.y+Math.sin(angle)*r);entry.marker.setLatLng(c.map.layerPointToLatLng(pt))});
    });
  }
  function declutter(mapId){
    if(!isMobileMap())return;const c=window.activeMapMarkers?.get?.(mapId);if(!c)return;const used=[];
    c.markers.forEach(({marker})=>{const el=marker.getTooltip?.()?.getElement?.();if(!el)return;el.classList.remove('mobile-price-hidden');const r=el.getBoundingClientRect();if(used.some(a=>!(r.right+12<=a.left||a.right+12<=r.left||r.bottom+12<=a.top||a.bottom+12<=r.top)))el.classList.add('mobile-price-hidden');else used.push(r)});
  }
  function centerPopup(mapId){
    if(!isMobileMap())return;const c=window.activeMapMarkers?.get?.(mapId),map=c?.map,popup=map?.getPopup?.();if(!map||!popup)return;
    popup.options.autoPan=false;popup.options.keepInView=false;
    const run=()=>{const el=popup.getElement?.();if(!el)return;const size=map.getSize(),anchor=map.latLngToContainerPoint(popup.getLatLng()),rect=el.getBoundingClientRect(),targetX=size.x/2,targetY=Math.max(rect.height/2+18,Math.min(size.y-40,size.y*.55));map.panBy([anchor.x-targetX,anchor.y-targetY],{animate:true,duration:.18})};
    setTimeout(run,0);setTimeout(run,100);
  }
  function refresh(id){separateMarkers(id);requestAnimationFrame(()=>declutter(id));setTimeout(()=>declutter(id),140)}
  const timer=setInterval(()=>{if(!window.activeMapMarkers||!window.L)return;clearInterval(timer);['demo-map','home-map'].forEach(id=>{let tries=0;const wait=setInterval(()=>{tries++;const c=window.activeMapMarkers?.get?.(id);if(!c){if(tries>40)clearInterval(wait);return}if(c.__mobileStructuralFix){clearInterval(wait);return}c.__mobileStructuralFix=true;['zoomend','moveend'].forEach(e=>c.map.on(e,()=>refresh(id)));c.map.on('popupopen',()=>{refresh(id);centerPopup(id)});c.map.on('popupclose',()=>refresh(id));c.markers.forEach(({marker})=>marker.on('click',()=>setTimeout(()=>centerPopup(id),20)));refresh(id);clearInterval(wait)},120)})},120);
  window.addEventListener('resize',()=>{if(isMobileMap())['demo-map','home-map'].forEach(refresh)});
})();
