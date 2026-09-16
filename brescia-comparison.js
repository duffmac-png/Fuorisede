// Brescia comparison pilot for a real user request. Data sourced from the two CercoAlloggio links supplied by the user.
(function(){
const bresciaCampus={id:'brescia-unibs-ing-info',name:'UNIBS · Ingegneria Informatica / Via Branze',lat:45.5651,lng:10.2317};
const bresciaListings=[
{id:401,title:'Stanza singola · Europa',city:'Brescia',address:'Zona Europa, Brescia',lat:45.56278,lng:10.23472,locationStatus:'approximate_area',price:350,expenses:null,realMonthlyCost:350,realMonthlyCostStatus:'minimum_known',photos:['https://cercoalloggio-reas.s3-eu-west-1.amazonaws.com/c7ba8180-36bf-4685-b5f1-10fcf0cf5975.jpg'],accommodationType:'room',features:['Stanza singola','Balcone ad uso esclusivo','Condominio incluso','Solo donne','2° piano','Senza ascensore'],details:{utilities:'Spese escluse; condominio incluso',contract:'Da verificare nell’annuncio originale',deposit:'2 mensilità',bathroom:'Non privato',floor:'2° piano · ascensore assente',description:'Camera singola per studentessa in zona Europa, con balcone ad uso esclusivo. Letto, armadio a muro, scrivania, cassettiera e comodino.'},availability:{availableFrom:null,availableLabel:'Da verificare',status:'to_reconfirm',confirmedAt:'2026-09-13'},publication:{status:'sandbox',authorized:false,source:'CercoAlloggio · confronto richiesto dall’utente',sourceType:'portal',sourceUrl:'https://cercoalloggio.com/it/property/appartamento-brescia-europa-13783-ampie-camere-singole-vicino-a-fermata-metro-europa/1-G704'},validation:{contactProvided:false,priceDeclared:true,expensesDeclared:true,contractDeclared:false,depositDeclared:true,utilitiesDeclared:true,listingConfirmedAt:'2026-09-13'},campusReference:{campusId:bresciaCampus.id,campusName:bresciaCampus.name,distanceKm:0.4,minutesBike:2,travelEstimate:false},candidates:0},
{id:402,title:'Stanza singola · Casazza',city:'Brescia',address:'Zona Casazza, Brescia',lat:45.57566,lng:10.23049,locationStatus:'approximate_area',price:420,expenses:null,realMonthlyCost:420,realMonthlyCostStatus:'minimum_known',photos:['https://img-cercoalloggio.s3.eu-south-1.amazonaws.com/img-25d07479-db78-4a8e-ac4e-d29b65349c69.jpeg'],accommodationType:'room',features:['Stanza singola','4 camere singole','2 bagni','Terrazzo','Cucina abitabile','Riscaldamento centralizzato','Solo donne','2° piano','Senza ascensore'],details:{utilities:'Da verificare nell’annuncio originale',contract:'Da 6 mesi a più di un anno · canone libero',deposit:'Da verificare',bathroom:'2 bagni nell’appartamento',floor:'2° piano · ascensore assente',description:'Ampio appartamento in zona Casazza con soggiorno e accesso al terrazzo, cucina abitabile attrezzata con retrocucina, quattro camere singole e due bagni.'},availability:{availableFrom:null,availableLabel:'Da verificare',status:'to_reconfirm',confirmedAt:'2026-09-13'},publication:{status:'sandbox',authorized:false,source:'CercoAlloggio · confronto richiesto dall’utente',sourceType:'portal',sourceUrl:'https://cercoalloggio.com/it/property/appartamento-brescia-casazza-29039-disponibili-stanze-singole-per-studentesse-e-lavoratrici-in-zona-casazza'},validation:{contactProvided:false,priceDeclared:true,expensesDeclared:false,contractDeclared:true,depositDeclared:false,utilitiesDeclared:false,listingConfirmedAt:'2026-09-13'},campusReference:{campusId:bresciaCampus.id,campusName:bresciaCampus.name,distanceKm:1.34,minutesBike:6,travelEstimate:false},candidates:0}
];
function install(){
 if(typeof state==='undefined'||typeof render!=='function'||typeof filters!=='function')return false;
 if(!document.getElementById('brescia-mobile-nav-fix')){
   const style=document.createElement('style');
   style.id='brescia-mobile-nav-fix';
   style.textContent='@media(max-width:900px){#v3-root{display:flex!important;flex-direction:column!important;gap:0!important}.v3nav.designnav{order:-20!important;position:relative!important;top:auto!important;margin:0 0 14px!important;justify-content:flex-start!important;overflow-x:auto!important;overflow-y:hidden!important;z-index:6!important}.v3nav.designnav button{flex:0 0 auto!important;white-space:nowrap!important}.designhero{order:-10!important;display:block!important;padding:18px 0 20px!important;margin:0!important;max-width:100%!important}.designhero .kicker{display:block!important;margin:0 0 10px!important}.designhero h1{display:block!important;margin:0 0 15px!important}.filterpanel{order:0!important}}';
   document.head.appendChild(style);
 }
 // Brescia: auto-pan only when the popup opens. Do not keep it locked in view afterwards,
 // so the user can immediately drag the map freely while the popup remains attached to its pin.
 const baseSelectMapListing=selectMapListing;
 selectMapListing=function(mapId,id,pan=true){
   if(state.city!=='Brescia')return baseSelectMapListing(mapId,id,pan);
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
 if(!state.items.some(x=>x.city==='Brescia')) state.items.push(...bresciaListings);
 if(typeof campusCoordinates!=='undefined')campusCoordinates[bresciaCampus.id]=[bresciaCampus.lat,bresciaCampus.lng];
 const oldFilters=filters;
 filters=function(){
   let html=oldFilters();
   if(!html.includes('value="Brescia"')) html=html.replace('<option value="Milano"','<option value="Brescia" '+(state.city==='Brescia'?'selected':'')+'>Brescia</option><option value="Milano"');
   if(state.city==='Brescia'){
     html=html.replace(/<label class="note">Zona \/ polo<select[\s\S]*?<\/select><\/label>/, '<label class="note">Sede di studio<select disabled><option>UNIBS · Ingegneria Informatica / Via Branze</option></select></label>');
     html=html.replace(/<section class="designhero">[\s\S]*?<\/section>/, '<section class="designhero"><div class="kicker">BRESCIA · UNIBS · VIA BRANZE</div><h1>Due stanze.<br>Una scelta.</h1><p>Confronta canone, spese, caratteristiche e distanza dalla sede di Ingegneria Informatica.</p></section>');
   }
   return html;
 };
 const oldSelectedStudySite=typeof selectedStudySite==='function'?selectedStudySite:null;
 if(oldSelectedStudySite)selectedStudySite=function(){return state.city==='Brescia'?{name:bresciaCampus.name,lat:bresciaCampus.lat,lng:bresciaCampus.lng}:oldSelectedStudySite()};
 const oldSetCity=typeof setCity==='function'?setCity:null;
 if(oldSetCity)setCity=function(v){oldSetCity(v);if(v==='Brescia'){state.city='Brescia';render()}};
 const params=new URLSearchParams(location.search);
 if(params.get('city')==='Brescia'){
   state.city='Brescia';
   document.title='Confronto alloggi studenti Brescia · UNIBS | FUORISEDE';
 }
 render(); return true;
}
if(!install()){let n=0,t=setInterval(()=>{if(install()||++n>60)clearInterval(t)},50)}
})();