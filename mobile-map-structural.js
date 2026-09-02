// FUORISEDE mobile map structural fix 20260902 v2
(function(){
  const mobile=()=>matchMedia('(max-width:700px),(pointer:coarse)').matches;
  if(!mobile())return;

  document.head.insertAdjacentHTML('beforeend',`<style>
    @media(max-width:700px),(pointer:coarse){
      .leaflet-popup{width:230px!important;max-width:calc(100% - 48px)!important}
      .leaflet-popup-content-wrapper{width:230px!important;max-width:calc(100vw - 58px)!important;border-radius:14px!important}
      .leaflet-popup-content{width:auto!important;max-width:none!important;margin:10px 12px!important;word-break:normal!important;overflow-wrap:normal!important}
      .leaflet-popup-content .pinactions{display:flex!important;flex-direction:column!important;gap:7px!important}
      .leaflet-popup-content button{width:100%!important;min-width:0!important;white-space:nowrap!important}
      .listing-price-tooltip{pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;user-select:none!important}
      .listing-price-tooltip.is-selected{background:#171717!important;color:#fff!important;border:2px solid #fff!important;box-shadow:0 0 0 2px #171717,0 4px 14px #0004!important}
      #v3-root.fuorisede-map-visible .comparedock.designdock{
        position:relative!important;left:auto!important;bottom:auto!important;transform:none!important;
        margin:12px auto 4px!important;z-index:3!important;
      }
    }
  </style>`);

  function maps(){
    try{return typeof activeMapMarkers!=='undefined'?activeMapMarkers:null}catch{return null}
  }

  function selectedAppearance(x){
    const key=Number(x.id),selected=state.selected.has(key),favorite=state.favs.has(key);
    if(selected)return{radius:16,weight:5,color:'#171717',fillColor:'#fff',fillOpacity:1};
    if(favorite)return{radius:12,weight:4,color:'#c43f65',fillColor:'#f6bfd0',fillOpacity:1};
    return{radius:10,weight:3,color:'#fff',fillColor:'#a84d3f',fillOpacity:1};
  }

  // A single comparison rule for cards, pins and price pills. Existing selections are never
  // cleared merely because the user starts selecting from the map.
  mapCompareAction=function(id){
    const key=Number(id),candidate=state.items.find(x=>Number(x.id)===key);
    if(!candidate)return;
    const removing=state.selected.has(key);
    if(removing){
      state.selected.delete(key);
    }else{
      if(state.selected.size){
        const first=state.items.find(x=>state.selected.has(Number(x.id))),required=accommodationType(first);
        if(!required||accommodationType(candidate)!==required){
          alert(`Puoi confrontare solo ${accommodationLabel(required)} con ${accommodationLabel(required)}.`);
          return;
        }
      }
      if(state.selected.size>=3){alert('Puoi confrontare fino a 3 alloggi.');return}
      state.selected.add(key);
    }
    if(state.selected.size<2)state.compareOpen=false;
    state.mapActiveListingId=key;
    try{mapComparisonSessionStarted=true}catch{}
    refreshMapComparison(key);
    syncAllMaps();
  };

  function syncMarker(entry){
    const {marker,x}=entry,key=Number(x.id),selected=state.selected.has(key),favorite=state.favs.has(key);
    marker.setStyle(selectedAppearance(x));
    marker.setTooltipContent(`${favorite?'♥ ':''}${selected?'✓ ':''}${euro(x.price)}`);
    const tip=marker.getTooltip?.()?.getElement?.();
    if(tip){
      tip.dataset.listingId=String(key);
      tip.classList.toggle('is-selected',selected);
      tip.setAttribute('role','button');
      tip.setAttribute('aria-label',`${selected?'Togli':'Aggiungi'} ${x.title} dal confronto`);
    }
    marker.getPopup?.()?.setContent(mapPopupContent(x));
    if(selected)marker.bringToFront();
  }

  function syncAllMaps(){
    const all=maps();if(!all)return;
    all.forEach(c=>c?.markers?.forEach(syncMarker));
    syncDockPosition();
  }

  function spread(id){
    const c=maps()?.get?.(id);if(!c?.map||!c?.markers)return;
    const map=c.map, entries=[...c.markers.values()];
    entries.forEach(entry=>{
      if(!entry.__structuralOriginalLatLng)entry.__structuralOriginalLatLng=L.latLng(entry.marker.getLatLng());
      entry.marker.setLatLng(entry.__structuralOriginalLatLng);
    });
    const groups=[];
    entries.forEach(entry=>{
      const p=map.latLngToContainerPoint(entry.__structuralOriginalLatLng);
      let g=groups.find(group=>group.points.some(q=>p.distanceTo(q)<38));
      if(!g){g={entries:[],points:[]};groups.push(g)}
      g.entries.push(entry);g.points.push(p);
    });
    groups.filter(g=>g.entries.length>1).forEach(g=>{
      const cx=g.points.reduce((s,p)=>s+p.x,0)/g.points.length;
      const cy=g.points.reduce((s,p)=>s+p.y,0)/g.points.length;
      const n=g.entries.length,r=n===2?30:34;
      g.entries.forEach((entry,i)=>{
        const a=-Math.PI/2+2*Math.PI*i/n;
        const np=L.point(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
        entry.marker.setLatLng(map.containerPointToLatLng(np));
      });
    });
    syncAllMaps();
  }

  function keepPopupInside(id){
    const c=maps()?.get?.(id),map=c?.map;if(!map)return;
    const popup=map.getPopup?.();if(!popup)return;
    const run=()=>{
      const box=map.getContainer().getBoundingClientRect(),el=popup.getElement?.();if(!el)return;
      const r=el.getBoundingClientRect(),pad=18;let dx=0,dy=0;
      if(r.right>box.right-pad)dx=r.right-(box.right-pad);
      else if(r.left<box.left+pad)dx=r.left-(box.left+pad);
      if(r.top<box.top+pad)dy=r.top-(box.top+pad);
      else if(r.bottom>box.bottom-pad)dy=r.bottom-(box.bottom-pad);
      if(dx||dy)map.panBy([dx,dy],{animate:false});
    };
    setTimeout(run,20);setTimeout(run,120);
  }

  function wire(id){
    const c=maps()?.get?.(id);if(!c?.map||!c?.markers||c.__structuralV2)return false;
    c.__structuralV2=true;
    c.markers.forEach(entry=>{
      const key=Number(entry.x.id),marker=entry.marker;
      marker.off('click');
      marker.on('click',ev=>{
        ev?.originalEvent?.preventDefault?.();ev?.originalEvent?.stopPropagation?.();
        highlightMapMini?.(key);
        mapCompareAction(key);
        keepPopupInside(id);
      });
      const popup=marker.getPopup?.();
      if(popup){
        popup.options.autoPan=true;popup.options.keepInView=true;popup.options.maxWidth=230;popup.options.minWidth=200;
        popup.options.autoPanPaddingTopLeft=L.point(24,24);popup.options.autoPanPaddingBottomRight=L.point(24,24);
      }
      syncMarker(entry);
    });
    c.map.on('zoomend',()=>{spread(id);keepPopupInside(id)});
    c.map.on('moveend',()=>syncAllMaps());
    c.map.on('popupopen',()=>{syncDockPosition();keepPopupInside(id)});
    c.map.on('popupclose',syncDockPosition);
    spread(id);
    return true;
  }

  // Price pills are true selection controls, not a second interaction model.
  document.addEventListener('click',event=>{
    const tip=event.target.closest?.('.listing-price-tooltip');if(!tip)return;
    const id=Number(tip.dataset.listingId);if(!Number.isFinite(id))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    mapCompareAction(id);
  },true);

  document.addEventListener('pointerdown',event=>{
    if(event.target.closest?.('.listing-price-tooltip'))event.stopPropagation();
  },true);

  function syncDockPosition(){
    const root=document.getElementById('v3-root');if(!root)return;
    root.classList.toggle('fuorisede-map-visible',!!root.querySelector('#demo-map,#home-map'));
  }

  const observer=new MutationObserver(()=>{
    syncDockPosition();
    wire('demo-map');wire('home-map');
    syncAllMaps();
  });
  observer.observe(document.getElementById('v3-root')||document.body,{childList:true,subtree:true});

  let tries=0,t=setInterval(()=>{
    tries++;syncDockPosition();
    const a=wire('demo-map'),b=wire('home-map');
    syncAllMaps();
    if((a||b)||tries>100)clearInterval(t);
  },100);
})();
