// FUORISEDE mobile map structural fix 20260828 v1
(function(){
  const mobile=()=>matchMedia('(max-width:700px),(pointer:coarse)').matches;
  if(!mobile())return;
  document.head.insertAdjacentHTML('beforeend',`<style>
    @media(max-width:700px),(pointer:coarse){
      .leaflet-popup{width:230px!important;max-width:calc(100% - 48px)!important}
      .leaflet-popup-content-wrapper{width:230px!important;max-width:calc(100vw - 58px)!important}
      .leaflet-popup-content{width:auto!important;max-width:none!important;margin:10px 12px!important;word-break:normal!important;overflow-wrap:normal!important}
      .leaflet-popup-content .pinactions{display:flex!important;flex-direction:column!important;gap:7px!important}
      .leaflet-popup-content button{width:100%!important;min-width:0!important;white-space:nowrap!important}
    }
  </style>`);
  function install(id){
    const c=window.activeMapMarkers?.get?.(id); if(!c||c.__structuralV1)return false;
    c.__structuralV1=true; const map=c.map; const entries=c.markers||[]; const groups=[];
    entries.forEach(e=>{const p=map.latLngToContainerPoint(e.marker.getLatLng());let g=groups.find(g=>g.items.some(q=>p.distanceTo(q.p)<34));if(!g){g={items:[]};groups.push(g)}g.items.push({e,p})});
    groups.filter(g=>g.items.length>1).forEach(g=>{const cx=g.items.reduce((s,q)=>s+q.p.x,0)/g.items.length,cy=g.items.reduce((s,q)=>s+q.p.y,0)/g.items.length,n=g.items.length,radius=n===2?28:32;g.items.forEach((q,i)=>{const a=-Math.PI/2+2*Math.PI*i/n,np=L.point(cx+Math.cos(a)*radius,cy+Math.sin(a)*radius);q.e.marker.setLatLng(map.containerPointToLatLng(np));q.e.marker.bringToFront()})});
    entries.forEach(({marker})=>{const p=marker.getPopup?.();if(p){p.options.autoPan=true;p.options.keepInView=true;p.options.maxWidth=230;p.options.minWidth=200;p.options.autoPanPaddingTopLeft=L.point(30,30);p.options.autoPanPaddingBottomRight=L.point(30,30)}});
    map.on('popupopen',ev=>{const pop=ev.popup;setTimeout(()=>{const m=map.getContainer().getBoundingClientRect(),el=pop.getElement?.();if(!el)return;const r=el.getBoundingClientRect(),pad=20;let dx=0,dy=0;if(r.right>m.right-pad)dx=r.right-(m.right-pad);else if(r.left<m.left+pad)dx=r.left-(m.left+pad);if(r.top<m.top+pad)dy=r.top-(m.top+pad);else if(r.bottom>m.bottom-pad)dy=r.bottom-(m.bottom-pad);if(dx||dy)map.panBy([dx,dy],{animate:false})},40)});
    return true;
  }
  let tries=0,t=setInterval(()=>{tries++;const a=install('demo-map'),b=install('home-map');if((a||b)||tries>80)clearInterval(t)},100);
})();
