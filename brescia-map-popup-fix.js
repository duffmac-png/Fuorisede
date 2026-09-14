// Isolated map-only fix for the approved CONFRONTO_BRESCIA_1 build.
(function(){
 function install(){
  if(typeof selectMapListing!=='function'||typeof activeMapMarkers==='undefined'||typeof markerAppearance!=='function'||typeof L==='undefined')return false;
  selectMapListing=function(mapId,id){
   var key=Number(id);
   if(typeof state!=='undefined')state.mapActiveListingId=key;
   var context=activeMapMarkers.get(mapId),entry=context&&context.markers.get(key);
   if(!entry)return;

   // Reset every map marker, then make the tapped one unmistakable.
   context.markers.forEach(function(item){item.marker.setStyle(markerAppearance(item.x,false));});
   entry.marker.setStyle(markerAppearance(entry.x,true));
   entry.marker.bringToFront();

   // Highlight the real listing card above the home map.
   if(mapId==='home-map'){
    document.querySelectorAll('.card.map-highlight').forEach(function(el){el.classList.remove('map-highlight');});
    var card=document.getElementById('listing-card-'+key);
    if(card){
     card.classList.add('map-highlight');
     card.scrollIntoView({behavior:'smooth',block:'center'});
     setTimeout(function(){card.classList.remove('map-highlight');},6000);
    }
   } else {
    // In the dedicated map view there are only mini-cards.
    highlightMapMini(key);
    var mini=document.getElementById('map-mini-'+key);
    if(mini){mini.style.outline='4px solid #d89b00';mini.style.outlineOffset='-4px';mini.style.boxShadow='0 0 0 3px rgba(216,155,0,.28)';}
   }

   // Keep the popup visibly above the tapped marker instead of low/partly hidden.
   var popup=entry.marker.getPopup&&entry.marker.getPopup();
   if(popup){
    popup.options.autoPan=true;
    popup.options.keepInView=true;
    popup.options.offset=L.point(0,-22);
    popup.options.autoPanPaddingTopLeft=L.point(24,150);
    popup.options.autoPanPaddingBottomRight=L.point(24,130);
   }
   entry.marker.openPopup();
   requestAnimationFrame(function(){
    var p=entry.marker.getPopup&&entry.marker.getPopup();
    if(p){p.update();if(typeof p._adjustPan==='function')p._adjustPan();}
   });
   setTimeout(function(){entry.marker.setStyle(markerAppearance(entry.x,true));entry.marker.bringToFront();},35);
  };

  // Replace only pin click behavior: pin -> matching card + popup.
  function bindMarkers(){
   activeMapMarkers.forEach(function(context,mapId){
    if(!context||!context.markers)return;
    context.markers.forEach(function(entry,key){
     var marker=entry.marker;
     marker.off('click');
     marker.on('click',function(){selectMapListing(mapId,key);});
    });
   });
  }
  bindMarkers();
  // Maps are created after render, so bind once more after their markers exist.
  setTimeout(bindMarkers,100);
  setTimeout(bindMarkers,350);
  return true;
 }
 if(!install()){var n=0,t=setInterval(function(){if(install()||++n>80)clearInterval(t);},50);}
})();
