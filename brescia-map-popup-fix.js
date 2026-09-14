// Isolated map-only fix for the approved CONFRONTO_BRESCIA_1 build.
(function(){
 function install(){
  if(typeof selectMapListing!=='function'||typeof activeMapMarkers==='undefined'||typeof markerAppearance!=='function'||typeof L==='undefined')return false;
  selectMapListing=function(mapId,id){
   var key=Number(id);
   if(typeof state!=='undefined')state.mapActiveListingId=key;
   highlightMapMini(key);
   var context=activeMapMarkers.get(mapId),entry=context&&context.markers.get(key);
   if(!entry)return;
   context.markers.forEach(function(item){item.marker.setStyle(markerAppearance(item.x,false));});
   entry.marker.setStyle(markerAppearance(entry.x,true));
   entry.marker.bringToFront();
   // Make the matching mini-card unmistakable and bring it into view.
   var mini=document.getElementById('map-mini-'+key);
   var list=mini&&mini.closest('.mapminilist');
   if(list){list.querySelectorAll('.mapmini').forEach(function(el){el.classList.remove('mapmini-active');el.style.outline='';el.style.boxShadow='';el.style.transform='';});}
   if(mini){mini.classList.add('mapmini-active');mini.style.outline='4px solid #d89b00';mini.style.outlineOffset='-4px';mini.style.boxShadow='0 0 0 3px rgba(216,155,0,.28)';mini.style.transform='scale(1.02)';mini.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});}
   var popup=entry.marker.getPopup&&entry.marker.getPopup();
   if(popup){popup.options.autoPan=true;popup.options.keepInView=true;popup.options.autoPanPaddingTopLeft=L.point(24,100);popup.options.autoPanPaddingBottomRight=L.point(24,90);}
   entry.marker.openPopup();
   requestAnimationFrame(function(){var p=entry.marker.getPopup&&entry.marker.getPopup();if(p){p.update();if(typeof p._adjustPan==='function')p._adjustPan();}});
   setTimeout(function(){entry.marker.bringToFront();},35);
  };
  return true;
 }
 if(!install()){var n=0,t=setInterval(function(){if(install()||++n>80)clearInterval(t);},50);}
})();
