// Global map popup behavior validated on the Brescia mobile comparison.
// Keep popup fully visible when it opens, then leave the map free to pan.
(function(){
  function install(){
    if(typeof selectMapListing!=='function'||typeof activeMapMarkers==='undefined'||typeof markerAppearance!=='function'||!window.L)return false;
    if(window.__fuorisedeMapPopupFixInstalled)return true;
    const baseSelectMapListing=selectMapListing;
    selectMapListing=function(mapId,id,pan=true){
      highlightMapMini(id);
      const context=activeMapMarkers.get(mapId),entry=context?.markers.get(Number(id));
      if(!entry)return;
      context.markers.forEach(({marker,x})=>marker.setStyle(markerAppearance(x,false)));
      entry.marker.setStyle(markerAppearance(entry.x,true));
      entry.marker.bringToFront();
      const popup=entry.marker.getPopup?.();
      if(popup){
        popup.options.autoPan=true;
        popup.options.keepInView=false;
        popup.options.autoPanPaddingTopLeft=L.point(24,56);
        popup.options.autoPanPaddingBottomRight=L.point(24,24);
      }
      entry.marker.openPopup();
    };
    window.__fuorisedeMapPopupFixInstalled=true;
    return true;
  }
  if(!install()){
    let n=0;
    const t=setInterval(()=>{if(install()||++n>60)clearInterval(t)},50);
  }
})();