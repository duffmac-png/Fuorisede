/* FUORISEDE mobile map controller 20260903A */
(function(){
  const MAP_ID='demo-map', mobile=()=>matchMedia('(max-width:700px),(pointer:coarse)').matches;
  let installedContext=null,activeId=null;
  const css=document.createElement('style');
  css.textContent=`
  @media(max-width:700px),(pointer:coarse){
    .v3nav{position:relative!important;top:auto!important;display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;margin:0 0 18px!important}
    .mapzoomhint,.leaflet-popup{display:none!important}.mapcanvas{position:relative!important;overflow:hidden!important}
    .listing-price-tooltip{pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;z-index:900!important;font-size:10px!important;padding:4px 7px!important}
    .listing-price-tooltip.mobile-price-hidden{opacity:1!important;visibility:visible!important;pointer-events:auto!important}
    .leaflet-control-attribution{max-width:72vw!important;font-size:7px!important}
    .fs-mobile-map-card{position:fixed;z-index:1200;left:10px;right:10px;bottom:72px;max-height:40vh;overflow:auto;background:#fff;border:1px solid #e5ddd2;border-radius:16px;padding:14px 40px 14px 14px;box-shadow:0 8px 28px #0004;color:#222}
    .fs-mobile-map-card[hidden]{display:none!important}.fs-mobile-map-card-close{position:absolute;right:8px;top:7px;width:30px;height:30px;border:0;border-radius:50%;background:#f2eee9;font-size:22px;line-height:1;cursor:pointer}
    .fs-mobile-map-card-body{font-size:13px;line-height:1.4;overflow-wrap:anywhere}.fs-mobile-map-card-body .pinactions{display:flex!important;gap:7px!important;margin-top:10px!important}
    .fs-mobile-map-card-body .pinactions button{display:block!important;flex:1!important;width:auto!important;min-width:0!important;white-space:normal!important}.comparedock{z-index:1300!important}
  }`;document.head.appendChild(css);
  const num=id=>Number(id), base=entry=>markerAppearance(entry.x,false);
  function active(entry){return {...base(entry),radius:18,weight:6,color:'#171715',fillColor:'#fff',fillOpacity:1}}
  function paint(context){
    context.markers.forEach((entry,id)=>{
      entry.marker.setStyle(num(id)===activeId?active(entry):base(entry));
      if(num(id)===activeId)entry.marker.bringToFront();else if(state.selected.has(num(id)))entry.marker.bringToBack();
    });
  }
  function clearMini(){document.querySelectorAll('.mapmini.active').forEach(el=>el.classList.remove('active'))}
  function syncOffset(card){
    const dock=document.querySelector('.comparedock');
    card.style.bottom=dock&&!card.hidden?`${Math.ceil(dock.getBoundingClientRect().height)+51}px`:'';
    card.style.maxHeight=dock&&!card.hidden?'32vh':'';
  }
  function popupHtml(entry){return entry.marker.getPopup?.()?.getContent?.()||`<b>${entry.x.title||'Alloggio'}</b>`}
  function show(context,card,entry){
    if(!entry)return;activeId=num(entry.x.id);state.mapActiveListingId=activeId;context.map.closePopup();clearMini();
    document.getElementById(`map-mini-${activeId}`)?.classList.add('active');paint(context);
    card.innerHTML=`<button class="fs-mobile-map-card-close" type="button" aria-label="Chiudi">×</button><div class="fs-mobile-map-card-body">${popupHtml(entry)}</div>`;
    card.dataset.listingId=String(activeId);card.hidden=false;syncOffset(card);
    card.querySelector('.fs-mobile-map-card-close').onclick=ev=>{ev.preventDefault();ev.stopPropagation();card.hidden=true;activeId=null;state.mapActiveListingId=null;clearMini();paint(context);syncOffset(card)};
    card.querySelector('.pincompare')?.addEventListener('click',()=>{const key=num(card.dataset.listingId);setTimeout(()=>{const current=context.markers.get(key);if(current)show(context,card,current)},40)});
  }
  function separate(context){
    const {map,markers}=context;
    markers.forEach(entry=>{if(!entry.__fsOriginalLatLng)entry.__fsOriginalLatLng=entry.marker.getLatLng();else entry.marker.setLatLng(entry.__fsOriginalLatLng)});
    const groups=[];
    markers.forEach(entry=>{const point=map.latLngToContainerPoint(entry.__fsOriginalLatLng);let group=groups.find(g=>g.items.some(i=>point.distanceTo(i.point)<34));if(!group){group={items:[]};groups.push(group)}group.items.push({entry,point})});
    groups.filter(g=>g.items.length>1).forEach(group=>{const cx=group.items.reduce((s,i)=>s+i.point.x,0)/group.items.length,cy=group.items.reduce((s,i)=>s+i.point.y,0)/group.items.length,r=group.items.length===2?28:32;group.items.forEach((item,index)=>{const angle=-Math.PI/2+2*Math.PI*index/group.items.length,point=L.point(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r);item.entry.marker.setLatLng(map.containerPointToLatLng(point))})});
    paint(context);
  }
  function entryForPill(context,pill){for(const entry of context.markers.values())if(entry.marker.getTooltip?.()?.getElement?.()===pill)return entry}
  function install(tries=0){
    if(!mobile())return;const context=activeMapMarkers?.get?.(MAP_ID),canvas=document.getElementById(MAP_ID);
    if((!context||!canvas)&&tries<50){setTimeout(()=>install(tries+1),100);return}if(!context||!canvas||context===installedContext)return;
    installedContext=context;activeId=null;state.mapActiveListingId=null;clearMini();context.map.closePopup();canvas.style.position='relative';
    let card=canvas.querySelector('.fs-mobile-map-card');if(!card){card=document.createElement('div');card.className='fs-mobile-map-card';card.hidden=true;canvas.appendChild(card)}
    let last=0;const activate=ev=>{const pill=ev.target?.closest?.('.listing-price-tooltip');if(!pill||!canvas.contains(pill))return;const entry=entryForPill(context,pill);if(!entry)return;ev.preventDefault();ev.stopPropagation();const now=Date.now();if(now-last<320)return;last=now;show(context,card,entry)};
    canvas.addEventListener('pointerup',activate,{capture:true,passive:false});canvas.addEventListener('click',activate,{capture:true,passive:false});
    context.markers.forEach(entry=>{entry.marker.off('click');entry.marker.on('click',()=>show(context,card,entry))});
    ['zoomend','moveend'].forEach(name=>context.map.on(name,()=>separate(context)));
    new MutationObserver(()=>syncOffset(card)).observe(document.getElementById('v3-root')||document.body,{childList:true,subtree:true});
    separate(context);paint(context);card.hidden=true;
  }
  function boot(){install();setTimeout(()=>install(),500);setTimeout(()=>install(),1400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){installedContext=null;const result=oldRender.apply(this,arguments);setTimeout(boot,160);return result};
})();
  
