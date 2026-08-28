// FUORISEDE Android popup layout fix
(function(){
  document.head.insertAdjacentHTML('beforeend',`<style>
  @media (max-width:700px), (pointer:coarse){
    .leaflet-popup{width:272px!important;min-width:0!important;max-width:calc(100vw - 44px)!important}
    .leaflet-popup-content-wrapper{width:272px!important;min-width:0!important;max-width:calc(100vw - 44px)!important;border-radius:14px!important}
    .leaflet-popup-content{width:auto!important;min-width:0!important;max-width:none!important;margin:11px 13px!important;white-space:normal!important;overflow-wrap:normal!important;word-break:normal!important}
    .leaflet-popup-content .pinactions{display:flex!important;flex-direction:column!important;width:100%!important;min-width:0!important;gap:7px!important}
    .leaflet-popup-content .pinactions button,
    .leaflet-popup-content .pinopen,
    .leaflet-popup-content .pincompare{display:block!important;width:100%!important;min-width:0!important;max-width:100%!important;white-space:nowrap!important;word-break:keep-all!important;overflow-wrap:normal!important;padding:9px 10px!important}
  }
  </style>`);
})();
