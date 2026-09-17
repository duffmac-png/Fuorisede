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
    html=html.replace(/<div class="ddavailable">[\s\S]*?<\/div>/,'');
    html=html.replace(/<div class="ddinterest">La richiesta sarà inviata a FUORISEDE e riferita a questa scheda\.<\/div>/,'');
    const official=sourceUrl(x);
    if(official){
      const value=availabilityText(x);
      const icon=` <a class="cost-availability-source" href="${official}" target="_blank" rel="noopener noreferrer" aria-label="Apri l’annuncio Phosphoro" title="Apri l’annuncio Phosphoro"><span aria-hidden="true">↗</span></a>`;
      const row=`<div><span>Disponibilità</span><b>${value}</b></div>`;
      html=html.replace(row,`<div><span>Disponibilità</span><b class="cost-availability-value">${value}${icon}</b></div>`);
    }
    return html;
  }

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function listingById(id){return (typeof state!=='undefined'&&state.items||[]).find(function(x){return String(x.id)===String(id)||String(x.externalId)===String(id)})}

  window.requestDirectInterest=function(id){
    const x=listingById(id)||(typeof state!=='undefined'?state.detail:null);
    if(!x)return;
    document.getElementById('ph-interest-modal')?.remove();
    const ref=x.externalId||x.id;
    const modal=document.createElement('div');
    modal.id='ph-interest-modal';
    modal.className='ph-interest-overlay';
    modal.innerHTML=`<div class="ph-interest-card" role="dialog" aria-modal="true" aria-labelledby="ph-interest-title">
      <button class="ph-interest-close" type="button" aria-label="Chiudi">×</button>
      <div class="eyebrow">FUORISEDE · RICHIESTA DI CONTATTO</div>
      <h2 id="ph-interest-title">Mi interessa questo alloggio</h2>
      <p class="ph-interest-listing">${esc(x.title||'Alloggio')}<br><small>Riferimento ${esc(ref)}</small></p>
      <form id="ph-interest-form">
        <label>Nome e cognome<input name="name" autocomplete="name" required></label>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Telefono <small>(facoltativo)</small><input name="phone" type="tel" autocomplete="tel"></label>
        <label>Nota <small>(facoltativa)</small><textarea name="note" rows="3" placeholder="Ad esempio: periodo di interesse o una domanda"></textarea></label>
        <p class="ph-interest-privacy">La richiesta resta a FUORISEDE e viene associata a questa scheda. Non viene inoltrata automaticamente a Phosphoro. <a href="/privacy.html" target="_blank" rel="noopener">Privacy</a>.</p>
        <button class="ph-interest-submit" type="submit">Invia a FUORISEDE</button>
      </form>
    </div>`;
    document.body.appendChild(modal);
    const close=function(){modal.remove()};
    modal.querySelector('.ph-interest-close').onclick=close;
    modal.addEventListener('click',function(e){if(e.target===modal)close()});
    modal.querySelector('input').focus();
    modal.querySelector('form').addEventListener('submit',function(e){
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const subject=`FUORISEDE · Interesse alloggio ${ref}`;
      const body=[`Alloggio: ${x.title||''}`,`Riferimento: ${ref}`,`Città: ${x.city||''}`,`Nome: ${fd.get('name')||''}`,`Email: ${fd.get('email')||''}`,`Telefono: ${fd.get('phone')||''}`,`Nota: ${fd.get('note')||''}`,'','Richiesta raccolta tramite FUORISEDE. Non inoltrata automaticamente al partner.'].join('\n');
      location.href=`mailto:info@fuori-sede.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      modal.querySelector('.ph-interest-card').innerHTML='<div class="ph-interest-success"><b>Richiesta preparata ✓</b><p>Si apre il tuo programma di posta con il messaggio già compilato per FUORISEDE.</p><button type="button" onclick="document.getElementById(\'ph-interest-modal\').remove()">Chiudi</button></div>';
    });
  };

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
      .ddside .primaryaction,.ddside a.primaryaction,.ddside button.primaryaction{background:#fff!important;color:#171715!important;border:1px solid var(--line)!important;box-shadow:none!important}
      .ddside .primaryaction:hover,.ddside a.primaryaction:hover,.ddside button.primaryaction:hover,.ddside .primaryaction:focus-visible,.ddside a.primaryaction:focus-visible,.ddside button.primaryaction:focus-visible{background:#171715!important;color:#fff!important;border-color:#171715!important}
      .ph-interest-overlay{position:fixed;inset:0;z-index:10000;background:#17171599;display:grid;place-items:center;padding:18px}
      .ph-interest-card{position:relative;width:min(520px,100%);max-height:calc(100vh - 36px);overflow:auto;background:#fff;border-radius:22px;padding:25px;box-shadow:0 22px 70px #0005}
      .ph-interest-card h2{margin:6px 34px 8px 0;font-size:25px}.ph-interest-close{position:absolute;right:14px;top:12px;border:0;background:transparent;font-size:30px;cursor:pointer}.ph-interest-listing{background:#faf5f1;border-radius:13px;padding:11px 13px}.ph-interest-card label{display:block;margin:12px 0;font-size:12px;font-weight:850}.ph-interest-card input,.ph-interest-card textarea{display:block;width:100%;margin-top:5px;padding:11px 12px;border:1px solid var(--line);border-radius:11px;background:#fff;font:inherit}.ph-interest-privacy{font-size:11px;line-height:1.45;color:var(--muted)}.ph-interest-submit,.ph-interest-success button{width:100%;border:0;border-radius:999px;padding:12px 16px;background:var(--brick);color:#fff;font-weight:900;cursor:pointer}.ph-interest-success{text-align:center;padding:18px 4px}.ph-interest-success b{font-size:21px}.ph-interest-success p{line-height:1.5;color:var(--muted)}
      @media(max-width:760px){.ddessentials.ddessentials-two{grid-template-columns:1fr 1fr}.ddessentials.ddessentials-two>div:nth-child(2){border-top:0}.ph-interest-card{padding:21px 17px}}
    </style>`);
    render();
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(function(){if(install()||++tries>80)clearInterval(timer)},50);
  }
})();
