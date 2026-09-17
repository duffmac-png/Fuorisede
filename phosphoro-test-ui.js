// UI refinements isolated to the Phosphoro/PH4YOU pilot.
(function(){
  function sourceUrl(x){
    if(typeof trackedSourceUrl==='function') return trackedSourceUrl(x,'availability');
    return x&&x.publication&&x.publication.sourceUrl||'';
  }

  function refineDetail(html,x){
    const hasCampusMetric=Number.isFinite(x?.campusReference?.minutesBike)||Number.isFinite(x?.campusReference?.distanceKm);
    if(!hasCampusMetric){
      html=html.replace(/<div><small>DAL POLO<\/small>[\s\S]*?<\/div>(?=<div><small>DISPONIBILE<\/small>)/,'');
      html=html.replace('class="ddessentials"','class="ddessentials ddessentials-two"');
    }

    // In the pilot the availability belongs in the dedicated costs section, not in the action sidebar.
    html=html.replace(/<div class="ddavailable">[\s\S]*?<\/div>/,'');
    html=html.replace(/<div class="ddinterest">La richiesta sarà inviata a FUORISEDE e riferita a questa scheda\.<\/div>/,'');

    // The source arrow belongs only to the "Costi e disponibilità" row,
    // immediately after the availability value.
    const official=sourceUrl(x);
    if(official){
      const value=availabilityText(x);
      const icon=` <a class="cost-availability-source" href="${official}" target="_blank" rel="noopener noreferrer" aria-label="Apri l’annuncio Phosphoro" title="Apri l’annuncio Phosphoro"><span aria-hidden="true">↗</span></a>`;
      const row=`<div><span>Disponibilità</span><b>${value}</b></div>`;
      html=html.replace(row,`<div><span>Disponibilità</span><b class="cost-availability-value">${value}${icon}</b></div>`);
    }
    return html;
  }

  function install(){
    if(typeof detailView!=='function'||typeof render!=='function')return false;
    const base=detailView;
    detailView=function(x){return refineDetail(base(x),x)};
    document.head.insertAdjacentHTML('beforeend',`<style>
      .cost-availability-value{display:flex;justify-content:flex-end;align-items:center;gap:6px}
      .cost-availability-source{display:inline-grid!important;flex:0 0 18px;place-items:center;width:18px;height:18px;border:1px solid #171715;border-radius:4px;color:#171715!important;text-decoration:none!important;font-size:12px;font-weight:800;line-height:1}
      .cost-availability-source:visited,.cost-availability-source:hover{color:#171715!important;border-color:#171715!important}
      .ddessentials.ddessentials-two{grid-template-columns:repeat(2,1fr)}
      .ddessentials.ddessentials-two>div:nth-child(2){border-left:1px solid var(--design-line);padding-left:18px}
      @media(max-width:760px){.ddessentials.ddessentials-two{grid-template-columns:1fr 1fr}.ddessentials.ddessentials-two>div:nth-child(2){border-top:0}}
    </style>`);
    render();
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){if(install()||++tries>80)clearInterval(timer)},50);
  }
})();
