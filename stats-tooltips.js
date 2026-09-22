(function(){
  const css=`
  .fs-tip{position:relative;display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;margin-left:4px;padding:0;border:1px solid currentColor;border-radius:50%;background:transparent;color:inherit;font:900 10px/1 system-ui;cursor:pointer;vertical-align:middle}
  .fs-tip::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 9px);transform:translateX(-50%);z-index:5000;width:min(290px,78vw);padding:9px 11px;border-radius:10px;background:#222;color:#fff;font:600 11px/1.35 system-ui;box-shadow:0 6px 22px #0004;white-space:normal;text-align:left;opacity:0;pointer-events:none;transition:.15s}
  .fs-tip::before{content:'';position:absolute;left:50%;bottom:calc(100% + 4px);transform:translateX(-50%);border:5px solid transparent;border-top-color:#222;opacity:0;pointer-events:none;transition:.15s}
  .fs-tip:hover::after,.fs-tip:hover::before,.fs-tip:focus::after,.fs-tip:focus::before,.fs-tip.open::after,.fs-tip.open::before{opacity:1}
  @media(max-width:600px){.fs-tip::after{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);width:calc(100vw - 34px);font-size:12px;padding:12px 14px}.fs-tip::before{display:none}}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  const roundEuro=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Math.round(n));
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const info=txt=>`<button type="button" class="fs-tip" aria-label="Come viene calcolato" data-tip="${esc(txt)}" onclick="event.stopPropagation();this.classList.toggle('open')">i</button>`;

  function comparablePeers(x){
    const type=accommodationType(x);
    const cityPeers=state.items.filter(i=>i.city===x.city && i.availability?.status!=='unavailable');
    if(!type)return cityPeers;
    return cityPeers.filter(i=>accommodationType(i)===type);
  }

  function priceSignal(x){
    if(!Number.isFinite(Number(x.price)))return null;
    const type=accommodationType(x), peers=comparablePeers(x).filter(i=>Number.isFinite(Number(i.price)));
    if(peers.length<2)return null;
    const values=peers.map(i=>Number(i.price));
    const avg=values.reduce((a,b)=>a+b,0)/values.length;
    const delta=Number(x.price)-avg;
    const abs=Math.abs(Math.round(delta));
    const label=Math.abs(delta)<1?'≈ In linea con la media FUORISEDE':delta<0?`📉 ${roundEuro(abs)} sotto la media FUORISEDE`:`📈 ${roundEuro(abs)} sopra la media FUORISEDE`;
    const typeLabel=accommodationLabel(type);
    const tip=`Confronto con ${peers.length} annunci di ${typeLabel} attualmente presenti su FUORISEDE a ${x.city}. Media canone: ${roundEuro(avg)} al mese. Non è una media dell'intero mercato.`;
    return `${label} ${info(tip)}`;
  }

  function costSignal(x){
    if(x.realMonthlyCostStatus!=='complete'||!Number.isFinite(Number(x.realMonthlyCost)))return null;
    const peers=comparablePeers(x).filter(i=>i.realMonthlyCostStatus==='complete'&&Number.isFinite(Number(i.realMonthlyCost)));
    if(peers.length<2)return null;
    const avg=peers.reduce((sum,i)=>sum+Number(i.realMonthlyCost),0)/peers.length;
    const delta=Number(x.realMonthlyCost)-avg, abs=Math.abs(Math.round(delta));
    const label=Math.abs(delta)<1?'🧾 Costo reale in linea con la media':delta<0?`🧾 ${roundEuro(abs)} sotto la media costi reali`:`🧾 ${roundEuro(abs)} sopra la media costi reali`;
    const tip=`Calcolato sui ${peers.length} annunci comparabili di ${accommodationLabel(accommodationType(x))} a ${x.city} per cui FUORISEDE dispone del costo mensile completo. Media: ${roundEuro(avg)} al mese.`;
    return `${label} ${info(tip)}`;
  }

  statisticalSignals=function(x){
    const out=[];
    const price=priceSignal(x); if(price)out.push(price);
    const cost=costSignal(x); if(cost)out.push(cost);
    const peers=comparablePeers(x);
    const distances=peers.map(i=>i.campusReference?.distanceKm).filter(Number.isFinite);
    if(Number.isFinite(x.campusReference?.distanceKm)&&distances.length>=2){
      const avg=distances.reduce((a,b)=>a+b,0)/distances.length;
      const delta=x.campusReference.distanceKm-avg;
      const label=Math.abs(delta)<0.05?'📍 Distanza in linea con la media':delta<0?'📍 Più vicino della media':'📍 Più lontano della media';
      const tip=`Confronto con ${distances.length} annunci comparabili di ${x.city} con distanza disponibile. Media: ${avg.toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1})} km dalla sede di riferimento.`;
      out.push(`${label} ${info(tip)}`);
    }
    if(!out.length){
      const complete=[x.validation?.expensesDeclared,x.validation?.contractDeclared,x.validation?.utilitiesDeclared,Boolean(x.availability?.availableFrom)].filter(Boolean).length;
      out.push(complete===4?'✓ Dati chiave completi':`◔ ${complete}/4 dati chiave completi`);
    }
    return out.slice(0,3);
  };

  signalClass=function(s){return /sopra la media|più lontano|da completare|[0-3]\/4/i.test(String(s).replace(/<[^>]*>/g,''))?' warn':''};

  document.addEventListener('click',e=>{if(!e.target.closest('.fs-tip'))document.querySelectorAll('.fs-tip.open').forEach(el=>el.classList.remove('open'))});
})();
