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

    const official=sourceUrl(x);
    if(official){
      const icon=` <a class="availability-source-link" href="${official}" target="_blank" rel="noopener noreferrer" aria-label="Apri la fonte della disponibilità" title="Apri la fonte">↗</a>`;
      html=html.replace(`<div class="ddavailable">${availabilityText(x)}</div>`,`<div class="ddavailable">${availabilityText(x)}${icon}</div>`);
    }

    html=html.replace(/>Richiedi integrazione<\/button>/g,'>Chiedi informazioni</button>');
    html=html.replace(/onclick="requestIntegration\((\d+)\)"/g,'onclick="pilotInfoRequest($1)"');

    // The pilot must not pretend to collect a lead before the handoff with the partner is defined.
    html=html.replace(/<div class="ddinterest">[\s\S]*?<\/div><button class="ddoriginal" onclick="quickApply\((\d+)\)"[^>]*>[\s\S]*?<\/button>/,
      '<button class="ddoriginal" onclick="pilotInterest()">Mi interessa</button>');

    // Keep the update alert visible as a planned feature, but do not fake activation before an automatic feed exists.
    html=html.replace(/<button class="ddsecondary ddalert[\s\S]*?<\/button><p class="ddalerthelp">[\s\S]*?<\/p>/,
      '<button class="ddsecondary ddalert" onclick="pilotUpdateAlert()">Avvisami sugli aggiornamenti</button><p class="ddalerthelp">Sarà attivo con l’aggiornamento automatico del feed.</p>');
    return html;
  }

  function install(){
    if(typeof detailView!=='function'||typeof render!=='function')return false;
    const base=detailView;
    detailView=function(x){return refineDetail(base(x),x)};
    document.head.insertAdjacentHTML('beforeend',`<style>
      .availability-source-link{display:inline-block;margin-left:5px;color:#171715!important;text-decoration:none;font-size:12px;font-weight:800;line-height:1;vertical-align:baseline}
      .availability-source-link:visited,.availability-source-link:hover{color:#171715!important}
      .ddessentials.ddessentials-two{grid-template-columns:repeat(2,1fr)}
      .ddessentials.ddessentials-two>div:nth-child(2){border-left:1px solid var(--design-line);padding-left:18px}
      @media(max-width:760px){.ddessentials.ddessentials-two{grid-template-columns:1fr 1fr}.ddessentials.ddessentials-two>div:nth-child(2){border-top:0}}
    </style>`);
    render();
    return true;
  }

  window.pilotInterest=function(){alert('La raccolta dell’interesse sarà attivata dopo aver definito con Phosphoro come trasmettere il lead. Nessun dato è stato inviato.')};
  window.pilotInfoRequest=function(){alert('La richiesta di informazioni sarà attivata nel pilot. Nessun dato è stato inviato.')};
  window.pilotUpdateAlert=function(){alert('Gli avvisi saranno attivati quando il feed Phosphoro sarà aggiornato automaticamente e FUORISEDE potrà rilevare le variazioni per ID.')};

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){if(install()||++tries>80)clearInterval(timer)},50);
  }
})();
