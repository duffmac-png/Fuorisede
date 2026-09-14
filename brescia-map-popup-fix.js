// Isolated map-only fix for the approved CONFRONTO_BRESCIA_1 build.
(function(){
 function install(){
  if(typeof selectMapListing!=='function'||typeof activeMapMarkers==='undefined'||typeof markerAppearance!=='function'||typeof L==='undefined')return false;
  selectMapListing=function(mapId,id){
   if(typeof state!=='undefined')state.mapActiveListingId=Number(id);
   highlightMapMini(id);
   var context=activeMapMarkers.get(mapId),entry=context&&context.markers.get(Number(id));
   if(!entry)return;
   context.markers.forEach(function(item){item.marker.setStyle(markerAppearance(item.x,false));});
   entry.marker.setStyle(markerAppearance(entry.x,true));
   entry.marker.bringToFront();
   var popup=entry.marker.getPopup&&entry.marker.getPopup();
   if(popup){popup.options.autoPan=true;popup.options.keepInView=true;popup.options.autoPanPaddingTopLeft=L.point(24,100);popup.options.autoPanPaddingBottomRight=L.point(24,90);}
   entry.marker.openPopup();
   requestAnimationFrame(function(){var p=entry.marker.getPopup&&entry.marker.getPopup();if(p){p.update();if(typeof p._adjustPan==='function')p._adjustPan();}});
  };
  return true;
 }
 if(!install()){var n=0,t=setInterval(function(){if(install()||++n>80)clearInterval(t);},50);}
})();
