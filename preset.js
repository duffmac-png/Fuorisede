/* FUORISEDE deep-link presets. Example: ?campus=mammut */
(function(){
  const p=new URLSearchParams(location.search);
  const raw=(p.get('campus')||p.get('polo')||p.get('sede')||'').trim().toLowerCase();
  if(raw){
    document.addEventListener('DOMContentLoaded',()=>{
      const campus=document.getElementById('campus');
      if(!campus)return;
      let value='';
      if(raw.includes('mammut')||raw.includes('mammuth')||raw.includes('farmac')||raw.includes('biomed')) value='Mammut · Polo sanitario';
      else if(raw.includes('savonarola')||raw.includes('centro')) value='Centro · Via Savonarola';
      if(!value)return;
      campus.value=value;
      const u=new URL(location.href);u.searchParams.set('campus',value.startsWith('Mammut')?'mammut':'centro');['polo','sede'].forEach(k=>u.searchParams.delete(k));history.replaceState({},'',u);
    },{once:true});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const style=document.createElement('style');
    style.textContent='header{min-height:74px}.brand{position:absolute;left:50%;transform:translateX(-50%)}nav{margin-left:auto}.listing-price-tooltip{white-space:nowrap!important;font-weight:800!important}@media(max-width:600px){header{min-height:66px}.approved-logo{width:min(205px,52vw)}}';
    document.head.appendChild(style);
    const s=document.createElement('script');s.src='demo-tweaks.js?v=2';
    s.onload=()=>{if(typeof currentResults==='function'&&typeof render==='function')render(currentResults())};
    document.body.appendChild(s);
  });
})();
