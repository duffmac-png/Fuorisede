// FUORISEDE Android popup layout fix
(function(){
  document.head.insertAdjacentHTML('beforeend',`<style>
  @media (max-width:700px), (pointer:coarse){
    .leaflet-popup{min-width:190px!important;max-width:calc(100vw - 56px)!important}
    .leaflet-popup-content-wrapper{min-width:190px!important;max-width:calc(100vw - 56px)!important;width:max-content!important}
    .leaflet-popup-content{min-width:166px!important;max-width:240px!important;width:auto!important;white-space:normal!important;overflow-wrap:normal!important;word-break:normal!important}
    .leaflet-popup-content .pinactions{display:flex!important;flex-direction:column!important;width:100%!important;min-width:166px!important}
    .leaflet-popup-content .pinactions button,
    .leaflet-popup-content .pinopen,
    .leaflet-popup-content .pincompare{display:block!important;width:100%!important;min-width:150px!important;white-space:nowrap!important;word-break:keep-all!important;overflow-wrap:normal!important}
  }
  </style>`);
})();
