// Global mobile navigation layout validated on the Brescia comparison.
// Keep the navigation in normal document flow on phones/tablets so it cannot overlap page content.
(function(){
  if(document.getElementById('fuorisede-mobile-nav-fix'))return;
  const style=document.createElement('style');
  style.id='fuorisede-mobile-nav-fix';
  style.textContent='@media(max-width:900px){#v3-root{display:flex!important;flex-direction:column!important;gap:0!important}.v3nav.designnav{order:-20!important;position:relative!important;top:auto!important;margin:0 0 14px!important;justify-content:flex-start!important;overflow-x:auto!important;overflow-y:hidden!important;z-index:6!important}.v3nav.designnav button{flex:0 0 auto!important;white-space:nowrap!important}.designhero{order:-10!important;display:block!important;padding:18px 0 20px!important;margin:0!important;max-width:100%!important}.designhero .kicker{display:block!important;margin:0 0 10px!important}.designhero h1{display:block!important;margin:0 0 15px!important}.filterpanel{order:0!important}}';
  document.head.appendChild(style);
})();