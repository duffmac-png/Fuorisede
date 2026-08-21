/* FUORISEDE deep-link presets. Example: ?campus=mammut */
(function(){
  const p=new URLSearchParams(location.search);
  const raw=(p.get('campus')||p.get('polo')||p.get('sede')||'').trim().toLowerCase();
  if(!raw)return;
  document.addEventListener('DOMContentLoaded',()=>{
    const campus=document.getElementById('campus');
    if(!campus)return;
    let value='';
    if(raw.includes('mammut')||raw.includes('mammuth')||raw.includes('farmac')||raw.includes('biomed')) value='Mammut · Polo sanitario';
    else if(raw.includes('savonarola')||raw.includes('centro')) value='Centro · Via Savonarola';
    if(!value)return;
    campus.value=value;
    // Keep the URL canonical and let app.js render the filtered results immediately.
    const u=new URL(location.href);u.searchParams.set('campus',value.startsWith('Mammut')?'mammut':'centro');['polo','sede'].forEach(k=>u.searchParams.delete(k));history.replaceState({},'',u);
  },{once:true});
})();
