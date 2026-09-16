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
      context.markers.forEach(({marker,x})=>{
        if(marker.__fsBaseRadius==null&&typeof marker.getRadius==='function')marker.__fsBaseRadius=marker.getRadius();
        marker.setStyle(markerAppearance(x,false));
        if(marker.__fsBaseRadius!=null&&typeof marker.setRadius==='function')marker.setRadius(marker.__fsBaseRadius);
        const tooltip=marker.getTooltip?.();
        const tooltipEl=tooltip?.getElement?.();
        if(tooltipEl)tooltipEl.classList.remove('fs-active-price');
      });
      entry.marker.setStyle(markerAppearance(entry.x,true));
      if(entry.marker.__fsBaseRadius!=null&&typeof entry.marker.setRadius==='function')entry.marker.setRadius(entry.marker.__fsBaseRadius+7);
      entry.marker.setStyle({color:'#171715',weight:6,fillColor:'#171715',fillOpacity:1});
      const activeTooltip=entry.marker.getTooltip?.();
      const activeTooltipEl=activeTooltip?.getElement?.();
      if(activeTooltipEl)activeTooltipEl.classList.add('fs-active-price');
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