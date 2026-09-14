// CONFRONTO_BRESCIA_1: isolated map interaction fix.
// Keeps the approved page/layout untouched and only refines map selection.
(function installBresciaMapPopupFix(){
  function install(){
    if(typeof window.selectMapListing!=='function'||typeof window.highlightMapMini!=='function'||typeof window.activeMapMarkers==='undefined') return false;
    window.selectMapListing=function(mapId,id){
      highlightMapMini(id);
      var context=activeMapMarkers.get(mapId),entry=context&&context.markers.get(Number(id));
      if(!entry)return;
      context.markers.forEach(function(item){item.marker.setStyle(markerAppearance(item.x,false));});
      entry.marker.setStyle(markerAppearance(entry.x,true));
      entry.marker.bringToFront();
      var popup=entry.marker.getPopup&&entry.marker.getPopup();
      if(popup){
        popup.options.autoPan=true;
        popup.options.keepInView=true;
        popup.options.autoPanPaddingTopLeft=L.point(24,110);
        popup.options.autoPanPaddingBottomRight=L.point(24,90);
      }
      entry.marker.openPopup();
      requestAnimationFrame(function(){
        var p=entry.marker.getPopup&&entry.marker.getPopup();
        if(p){p.update();if(typeof p._adjustPan==='function')p._adjustPan();}
      });
      setTimeout(function(){
        var p=entry.marker.getPopup&&entry.marker.getPopup();
        if(p&&typeof p._adjustPan==='function')p._adjustPan();
      },80);
    };
    return true;
  }
  if(!install()){
    var tries=0,t=setInterval(function(){if(install()||++tries>80)clearInterval(t);},50);
  }
})();
