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
      const icon=` <a class="availability-source-link" href="${official}" target="_blank" rel="noopener noreferrer" aria-label="Apri l’annuncio Phosphoro" title="Apri l’annuncio Phosphoro"><span aria-hidden="true">↗</span></a>`;
      html=html.replace(`<div class="ddavailable">${availabilityText(x)}</div>`,`<div class="ddavailable">${availabilityText(x)}${icon}</div>`);
    }

    html=html.replace(/>Richiedi integrazione<\/button>/g,'>Chiedi informazioni</button>');
    html=html.replace(/onclick="requestIntegration\((\d+)\)"/g,'onclick="pilotInfoRequest($1)"');

    html=html.replace(/<div class="ddinterest">[\s\S]*?<\/div><button class="ddoriginal" onclick="quickApply\((\d+)\)"[^>]*>[\s\S]*?<\/button>/,
      '<button type="button" class="ddoriginal pilot-interest" onclick="pilotInterest()">Mi interessa</button>');

    html=html.replace(/<button class="ddsecondary ddalert[\s\S]*?<\/button><p class="ddalerthelp">[\s\S]*?<\/p>/,
      '<button type="button" class="ddsecondary ddalert" onclick="pilotUpdateAlert()">Avvisami sugli aggiornamenti</button><p class="ddalerthelp">Sarà attivo con l’aggiornamento automatico del feed.</p>');
    return html;
  }

  function install(){
    if(typeof detailView!=='function'||typeof render!=='function')return false;
    const base=detailView;
    detailView=function(x){return refineDetail(base(x),x)};
    document.head.insertAdjacentHTML('beforeend',`<style>
      .availability-source-link{display:inline-grid!important;place-items:center;width:18px;height:18px;margin-left:5px;border:1px solid #171715;border-radius:4px;color:#171715!important;text-decoration:none!important;font-size:12px;font-weight:800;line-height:1;vertical-align:middle}
      .availability-source-link:visited,.availability-source-link:hover{color:#171715!important;border-color:#171715!important}
      .pilot-interest{cursor:pointer!important;opacity:1!important;pointer-events:auto!important}
      .ddessentials.ddessentials-two{grid-template-columns:repeat(2,1fr)}
      .ddessentials.ddessentials-two>div:nth-child(2){border-left:1px solid var(--design-line);padding-left:18px}
      @media(max-width:760px){.ddessentials.ddessentials-two{grid-template-columns:1fr 1fr}.ddessentials.ddessentials-two>div:nth-child(2){border-top:0}}
    </style>`);
    render();
    return true;
  }

  window.pilotInterest=function(){
    const message='Funzione pronta per il pilot. Quando definiamo con Phosphoro il canale di trasmissione, qui raccoglieremo il contatto dello studente e lo assoceremo a questo alloggio.';
    alert(message);
  };
  window.pilotInfoRequest=function(){alert('La richiesta di informazioni sarà attivata nel pilot. Nessun dato è stato inviato.')};
  window.pilotUpdateAlert=function(){alert('Gli avvisi saranno attivati quando il feed Phosphoro sarà aggiornato automaticamente e FUORISEDE potrà rilevare le variazioni per ID.')};

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){if(install()||++tries>80)clearInterval(timer)},50);
  }
})();
